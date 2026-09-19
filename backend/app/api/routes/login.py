from datetime import timedelta
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Response, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from app.core.security import get_password_hash

from app import crud
from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.core import security
from app.core.config import settings
from app.models import Message, NewPassword, Token, UserPublic, UserUpdate, User
from app.utils import (
    generate_password_reset_token,
    generate_reset_password_email,
    send_email,
    verify_password_reset_token,
)
import requests
from passlib.context import CryptContext
import secrets
from urllib.parse import urlencode


router = APIRouter(tags=["login"])

@router.get("/login/google")
def login_google(response: Response) -> RedirectResponse:
    """
    Google OAuth2 compatible token login, get an access token for future requests from google.
    """
    state = secrets.token_urlsafe(16)
    response.set_cookie(key="oauth_state", value=state, httponly=True) 
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",  # gets you a refresh token
        "prompt": "consent",
        "state": state,
    }
    authorization_url = f"{settings.GOOGLE_AUTH_URI}?{urlencode(params)}"
    return RedirectResponse(authorization_url)

@router.get("/login/google/callback")
def google_callback(request: Request, code: str, session: SessionDep):
    state = request.cookies.get("oauth_state")
    if state != request.query_params.get("state"):
        raise HTTPException(status_code=400, detail="Invalid state parameter")
    token_response = requests.post(settings.GOOGLE_TOKEN_URI, data={
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    })
    if token_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to retrieve token from Google.")
    token_data    = token_response.json()
    access_token  = token_data["access_token"]
    refresh_token = token_data.get("refresh_token")  # may be None on re-login

    userinfo_response = requests.get(
        settings.GOOGLE_USERINFO_URL,
        headers={"Authorization": f"Bearer {access_token}"}
    )
    google_user = userinfo_response.json() # google_user has: sub, email, name, picture
    user = crud.get_user_by_email(session=session, email=google_user["email"])
    if user:
        if not user.google_id:
            raise HTTPException(
                status_code=400,
                detail="An account with this email already exists. Please log in with your password."
            )
        user.full_name = google_user.get("name")
        user.avatar_url = google_user.get("picture")
        if refresh_token:
            user.refresh_token = refresh_token
        session.add(user)
        session.commit()
    else:
        user = User(
            email=google_user["email"],
            full_name=google_user.get("name"),
            avatar_url=google_user.get("picture"),
            google_id=google_user["sub"],
            refresh_token=refresh_token,
            is_active=True,
            hashed_password=get_password_hash("placeolder")  # Placeholder password for OAuth users
        )
        session.add(user)
        session.commit()
        session.refresh(user)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return Token(
        access_token=security.create_access_token(
            user.id, expires_delta=access_token_expires
        )
    )

@router.get("/login/linkedin")
def login_linkedin(response: Response) -> RedirectResponse:
    """
    LinkedIn OAuth2 OpenID Compatible login redirect.
    """
    state = secrets.token_urlsafe(16)
    response.set_cookie(key="oauth_state", value=state, httponly=True) 
    params = {
        "client_id": settings.LINKEDIN_CLIENT_ID,
        "redirect_uri": settings.LINKEDIN_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state
    }
    auth_url = f"{settings.LINKEDIN_AUTH_URI}?{urlencode(params)}"
    return RedirectResponse(auth_url)

@router.get("/login/linkedin/callback")
def linkedin_callback(request: Request, code: str, session: SessionDep):
    state = request.cookies.get("oauth_state")
    if state != request.query_params.get("state"):
        raise HTTPException(status_code=400, detail="Invalid state parameter")
    token_response = requests.post(
        settings.LINKEDIN_TOKEN_URI,
        data={
            "code": code,
            "client_id": settings.LINKEDIN_CLIENT_ID,
            "client_secret": settings.LINKEDIN_CLIENT_SECRET,
            "redirect_uri": settings.LINKEDIN_REDIRECT_URI,
            "grant_type": "authorization_code",
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    
    if token_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to retrieve token from LinkedIn.")

    token_data = token_response.json()
    access_token = token_data["access_token"]
    # refresh_token: Any = token_data["refresh_token"]

    # 2. Fetch user information from LinkedIn OIDC userinfo endpoint
    userinfo_response = requests.get(
        settings.LINKEDIN_USERINFO_URL,
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    if userinfo_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to retrieve profile from LinkedIn.")

    # linkedin_user contains standard OIDC fields: sub, email, name, picture
    linkedin_user = userinfo_response.json() 

    # 3. Apply exact user lookup and creation logic
    user = crud.get_user_by_email(session=session, email=linkedin_user["email"])

    if user:
        if not user.linkedin_id:
            raise HTTPException(
                status_code=400,
                detail="An account with this email already exists. Please log in with your password."
            )
            # If the user registered via password or Google, link the account
            # user.linkedin_id = linkedin_user["sub"]
        
        user.full_name = linkedin_user.get("name")
        user.avatar_url = linkedin_user.get("picture")
        
        session.add(user)
        session.commit()
    else:
        # Create new user record
        user = User(
            email=linkedin_user["email"],
            full_name=linkedin_user.get("name"),
            avatar_url=linkedin_user.get("picture"),
            linkedin_id=linkedin_user["sub"],
            is_active=True,
            hashed_password=get_password_hash("placeolder")
        )
        session.add(user)
        session.commit()
        session.refresh(user)

    # 4. Issue standard JWT token back to the frontend
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return Token(
        access_token=security.create_access_token(
            user.id, expires_delta=access_token_expires
        )
    )

@router.post("/login/access-token")
def login_access_token(
    session: SessionDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> Token:
    """
    OAuth2 compatible token login, get an access token for future requests
    """

    user = crud.authenticate(
        session=session, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return Token(
        access_token=security.create_access_token(
            user.id, expires_delta=access_token_expires
        )
    )

@router.post("/login/test-token", response_model=UserPublic)
def test_token(current_user: CurrentUser) -> Any:
    """
    Test access token
    """
    return current_user


@router.post("/password-recovery/{email}")
def recover_password(email: str, session: SessionDep) -> Message:
    """
    Password Recovery
    """
    user = crud.get_user_by_email(session=session, email=email)

    # Always return the same response to prevent email enumeration attacks
    # Only send email if user actually exists
    if user:
        password_reset_token = generate_password_reset_token(email=email)
        email_data = generate_reset_password_email(
            email_to=user.email, email=email, token=password_reset_token
        )
        send_email(
            email_to=user.email,
            subject=email_data.subject,
            html_content=email_data.html_content,
        )
    return Message(
        message="If that email is registered, we sent a password recovery link"
    )


@router.post("/reset-password/")
def reset_password(session: SessionDep, body: NewPassword) -> Message:
    """
    Reset password
    """
    email = verify_password_reset_token(token=body.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid token")
    user = crud.get_user_by_email(session=session, email=email)
    if not user:
        # Don't reveal that the user doesn't exist - use same error as invalid token
        raise HTTPException(status_code=400, detail="Invalid token")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    user_in_update = UserUpdate(password=body.new_password)
    crud.update_user(
        session=session,
        db_user=user,
        user_in=user_in_update,
    )
    return Message(message="Password updated successfully")


@router.post(
    "/password-recovery-html-content/{email}",
    dependencies=[Depends(get_current_active_superuser)],
    response_class=HTMLResponse,
)
def recover_password_html_content(email: str, session: SessionDep) -> Any:
    """
    HTML Content for Password Recovery
    """
    user = crud.get_user_by_email(session=session, email=email)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this username does not exist in the system.",
        )
    password_reset_token = generate_password_reset_token(email=email)
    email_data = generate_reset_password_email(
        email_to=user.email, email=email, token=password_reset_token
    )

    return HTMLResponse(
        content=email_data.html_content, headers={"subject:": email_data.subject}
    )
