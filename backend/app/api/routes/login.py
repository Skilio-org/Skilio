import logging
import secrets
from datetime import timedelta
from typing import Annotated, Any
from urllib.parse import urlencode

import requests
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm

from app import crud
from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.core import security
from app.core.config import settings
from app.core.security import generate_random_password, get_password_hash
from app.models import (
    ClientProfile,
    FreelancerProfile,
    Message,
    NewPassword,
    Token,
    User,
    UserPublic,
    UserRole,
    UserUpdate,
)
from app.utils import (
    generate_password_reset_token,
    generate_reset_password_email,
    send_password_reconvery_email,
    verify_password_reset_token,
)

logger = logging.getLogger(__name__)
router = APIRouter(tags=["login"])


@router.get("/login/google")
def login_google() -> RedirectResponse:
    """
    Google OAuth2 compatible token login, get an access token for future requests from google.
    """
    state = secrets.token_urlsafe(16)
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
    redirect_resp = RedirectResponse(authorization_url)
    redirect_resp.set_cookie(
        key="oauth_state",
        value=state,
        httponly=True,
        samesite="lax",
        secure=settings.FASTAPI_ENV != "development",
        max_age=600,
    )
    return redirect_resp


@router.get("/login/google/callback")
async def google_callback(
    request: Request,
    response: Response,
    code: str,
    session: SessionDep,
    state: str | None = None,
):
    cookie_state = request.cookies.get("oauth_state")
    if cookie_state and state and cookie_state != state:
        raise HTTPException(status_code=400, detail="Invalid state parameter")
    response.delete_cookie(key="oauth_state")

    token_response = requests.post(
        settings.GOOGLE_TOKEN_URI,
        data={
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        },
    )
    if token_response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to retrieve token from Google."
        )
    token_data = token_response.json()
    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Google token response missing access token."
        )
    refresh_token = token_data.get("refresh_token")  # may be None on re-login

    userinfo_response = requests.get(
        settings.GOOGLE_USERINFO_URL,
        headers={"Authorization": f"Bearer {access_token}"},
    )
    if userinfo_response.status_code != 200:
        raise HTTPException(
            status_code=400, detail="Failed to retrieve profile from Google."
        )
    google_user = userinfo_response.json()  # google_user has: sub, email, name, picture
    if "email" not in google_user:
        raise HTTPException(
            status_code=400, detail="Google user profile missing email."
        )

    user = crud.get_user_by_email(session=session, email=google_user["email"])
    if user:
        if not user.google_id:
            user.google_id = google_user["sub"]
        user.full_name = google_user.get("name") or user.full_name
        avatar = google_user.get("picture")
        user.avatar_url = (
            avatar if avatar else (user.avatar_url or settings.DEFAULT_AVATAR_URL)
        )
        if refresh_token:
            user.refresh_token = refresh_token
        session.add(user)
        session.commit()
    else:
        user = User(
            is_email_verified=False,
            email=google_user["email"],
            full_name=google_user.get("name"),
            avatar_url=google_user.get("picture") or settings.DEFAULT_AVATAR_URL,
            google_id=google_user["sub"],
            refresh_token=refresh_token,
            is_active=True,
            hashed_password=get_password_hash(generate_random_password(16)),
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        if user.active_role == UserRole.FREELANCER:
            profile = FreelancerProfile(user_id=user.id)
            session.add(profile)
        else:
            profile = ClientProfile(user_id=user.id)
            session.add(profile)
        session.commit()
        try:
            await send_password_reconvery_email(user.email, True)
        except Exception as e:
            logger.error(f"Error sending password recovery email: {e}")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return Token(
        access_token=security.create_access_token(
            user.id, expires_delta=access_token_expires
        )
    )


@router.get("/login/linkedin")
def login_linkedin() -> RedirectResponse:
    """
    LinkedIn OAuth2 OpenID Compatible login redirect.
    """
    state = secrets.token_urlsafe(16)
    params = {
        "client_id": settings.LINKEDIN_CLIENT_ID,
        "redirect_uri": settings.LINKEDIN_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
    }
    auth_url = f"{settings.LINKEDIN_AUTH_URI}?{urlencode(params)}"
    redirect_resp = RedirectResponse(auth_url)
    redirect_resp.set_cookie(
        key="oauth_state",
        value=state,
        httponly=True,
        samesite="lax",
        secure=settings.FASTAPI_ENV != "development",
        max_age=600,
    )
    return redirect_resp


@router.get("/login/linkedin/callback")
async def linkedin_callback(
    request: Request,
    response: Response,
    code: str,
    session: SessionDep,
    state: str | None = None,
):
    cookie_state = request.cookies.get("oauth_state")
    if cookie_state and state and cookie_state != state:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid state parameter")
    response.delete_cookie(key="oauth_state")

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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to retrieve token from LinkedIn."
        )

    token_data = token_response.json()
    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="LinkedIn token response missing access token."
        )

    userinfo_response = requests.get(
        settings.LINKEDIN_USERINFO_URL,
        headers={"Authorization": f"Bearer {access_token}"},
    )
    if userinfo_response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to retrieve profile from LinkedIn."
        )

    linkedin_user = userinfo_response.json()
    if "email" not in linkedin_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="LinkedIn user profile missing email."
        )

    user = crud.get_user_by_email(session=session, email=linkedin_user["email"])

    if user:
        if not user.linkedin_id:
            user.linkedin_id = linkedin_user["sub"]
        user.full_name = linkedin_user.get("name") or user.full_name
        avatar = linkedin_user.get("picture")
        user.avatar_url = (
            avatar if avatar else (user.avatar_url or settings.DEFAULT_AVATAR_URL)
        )
        session.add(user)
        session.commit()
    else:
        user = User(
            email=linkedin_user["email"],
            full_name=linkedin_user.get("name"),
            avatar_url=linkedin_user.get("picture") or settings.DEFAULT_AVATAR_URL,
            linkedin_id=linkedin_user["sub"],
            is_email_verified=False,
            is_active=True,
            hashed_password=get_password_hash(generate_random_password(16)),
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        if user.active_role == UserRole.FREELANCER:
            profile = FreelancerProfile(user_id=user.id)
            session.add(profile)
        else:
            profile = ClientProfile(user_id=user.id)
            session.add(profile)
        session.commit()
        try:
            await send_password_reconvery_email(user.email, True)
        except Exception as e:
            logger.error(f"Error sending password recovery email: {e}")
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
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    if not user.is_superuser and not user.is_email_verified and not user.google_id and not user.linkedin_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="please check your email before login for verification link")
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
async def recover_password(email: str, session: SessionDep) -> Message:
    """
    Password Recovery
    """
    user = crud.get_user_by_email(session=session, email=email)

    # Always return the same response to prevent email enumeration attacks
    # Only send email if user actually exists
    if user:
        try:
            await send_password_reconvery_email(email=email, oauth=False)
        except Exception as e:
            logger.error(f"Error sending password recovery email: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Invalid token")
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
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")
    user = crud.get_user_by_email(session=session, email=email)
    if not user:
        # Don't reveal that the user doesn't exist - use same error as invalid token
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")
    elif not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
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
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The user with this username does not exist in the system.",
        )
    password_reset_token = generate_password_reset_token(email=email)
    email_data = generate_reset_password_email(
        email_to=user.email, email=email, token=password_reset_token, oauth=False)

    return HTMLResponse(
        content=email_data.html_content, headers={"subject:": email_data.subject}
    )
