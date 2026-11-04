import hashlib
import logging
from datetime import UTC, datetime, timedelta
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import select

from app import crud
from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.api.utils.oauth import (
    build_access_token_response,
    exchange_code_for_token,
    fetch_userinfo,
    generate_state_and_redirect,
    upsert_oauth_user,
    verify_state,
)
from app.core import security
from app.core.config import settings
from app.core.limiter import limiter
from app.models import (
    Message,
    NewPassword,
    Token,
    UserPublic,
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
    """Redirect to Google OAuth authorization endpoint."""
    return generate_state_and_redirect(
        client_id=settings.GOOGLE_CLIENT_ID,
        redirect_uri=settings.GOOGLE_REDIRECT_URI,
        auth_uri=settings.GOOGLE_AUTH_URI,
    )

@router.get("/login/google/callback")
@limiter.limit('5/minute')
async def google_callback(
    request: Request,
    response: Response,
    code: str,
    session: SessionDep,
    state: str | None = None,
) -> Token:
    """Handle Google OAuth callback, exchange code for tokens, upsert user and return access token."""
    verify_state(request, response)
    token_data = exchange_code_for_token(
        token_uri=settings.GOOGLE_TOKEN_URI,
        code=code,
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        redirect_uri=settings.GOOGLE_REDIRECT_URI,
    )
    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google token response missing access token.",
        )
    refresh_token = token_data.get("refresh_token")
    google_user = fetch_userinfo(settings.GOOGLE_USERINFO_URL, access_token)
    if "email" not in google_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google user profile missing email.",
        )
    user = upsert_oauth_user(
        session=session,
        provider_user=google_user,
        provider="google",
        refresh_token=refresh_token,
    )
    return build_access_token_response(user)

@router.get("/login/linkedin")
def login_linkedin() -> RedirectResponse:
    """Redirect to LinkedIn OAuth authorization endpoint."""
    return generate_state_and_redirect(
        client_id=settings.LINKEDIN_CLIENT_ID,
        redirect_uri=settings.LINKEDIN_REDIRECT_URI,
        auth_uri=settings.LINKEDIN_AUTH_URI,
    )

@router.get("/login/linkedin/callback")
@limiter.limit('5/minute')
async def linkedin_callback(
    request: Request,
    response: Response,
    code: str,
    session: SessionDep,
    state: str | None = None,
) -> Token:
    """Handle LinkedIn OAuth callback, exchange code for tokens, upsert user and return access token."""
    verify_state(request, response)
    token_data = exchange_code_for_token(
        token_uri=settings.LINKEDIN_TOKEN_URI,
        code=code,
        client_id=settings.LINKEDIN_CLIENT_ID,
        client_secret=settings.LINKEDIN_CLIENT_SECRET,
        redirect_uri=settings.LINKEDIN_REDIRECT_URI,
    )
    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="LinkedIn token response missing access token.",
        )
    refresh_token = token_data.get("refresh_token")
    linkedin_user = fetch_userinfo(settings.LINKEDIN_USERINFO_URL, access_token)
    if "email" not in linkedin_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="LinkedIn user profile missing email.",
        )
    user = upsert_oauth_user(
        session=session,
        provider_user=linkedin_user,
        provider="linkedin",
        refresh_token=refresh_token,
    )
    return build_access_token_response(user)

@router.post("/login/access-token")
@limiter.limit('5/minute')
def login_access_token(
    session: SessionDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()], request: Request
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
    """Test access token"""
    return current_user

@router.post("/password-recovery/{email}")
async def recover_password(email: str, session: SessionDep) -> Message:
    """Password Recovery"""
    user = crud.get_user_by_email(session=session, email=email)

    # Always return the same response to prevent email enumeration attacks
    # Only send email if user actually exists
    if user:
        try:
            token = generate_password_reset_token(email=email)
            await send_password_reconvery_email(
                email=email, oauth=False, password_reset_token=token
            )
        except Exception as e:
            logger.error(f"Error sending password recovery email: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Invalid token")
    return Message(
        message="If that email is registered, we sent a password recovery link"
    )

@router.post("/reset-password/")
@limiter.limit('5/minute')
def reset_password(session: SessionDep, body: NewPassword, request: Request) -> Message:
    """Reset password"""
    email = verify_password_reset_token(token=body.token)
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid url, please request a new one.")
    user = crud.get_user_by_email(session=session, email=email)
    if not user:
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
    """HTML Content for Password Recovery"""
    user = crud.get_user_by_email(session=session, email=email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The user with this username does not exist in the system.",
        )
    password_reset_token = generate_password_reset_token(email=email)
    email_data = generate_reset_password_email(
        email_to=user.email, email=email, token=password_reset_token, oauth=False
    )

    return HTMLResponse(
        content=email_data.html_content, headers={"subject:": email_data.subject}
    )
