import logging
import secrets
from datetime import timedelta
from typing import Any  # Updated to use built‑in generic types
from urllib.parse import urlencode

import requests
from fastapi import HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse

from app import crud
from app.core import security
from app.core.config import settings
from app.core.security import generate_random_password, get_password_hash
from app.models import (
    ClientProfile,
    FreelancerProfile,
    Token,
    User,
    UserRole,
)
from app.utils import (
    generate_password_reset_token,
    send_password_reconvery_email,
)

logger = logging.getLogger(__name__)


def generate_state_and_redirect(
    client_id: str,
    redirect_uri: str,
    auth_uri: str,
    extra_params: dict[str, str] | None = None,
) -> RedirectResponse:
    """Generate a random OAuth ``state`` string, set it as a cookie, and return a
    ``RedirectResponse`` pointing to the provider's authorization URL.

    ``extra_params`` can be used to add provider‑specific query items.
    """
    state = secrets.token_urlsafe(16)
    params: dict[str, str] = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
    }
    if extra_params:
        params.update(extra_params)
    redirect_url = f"{auth_uri}?{urlencode(params)}"
    resp = RedirectResponse(redirect_url)
    resp.set_cookie(
        key="oauth_state",
        value=state,
        httponly=True,
        samesite="lax",
        secure=settings.FASTAPI_ENV != "development",
        max_age=600,
    )
    return resp


def verify_state(
    request: Request, response: Response, cookie_name: str = "oauth_state"
) -> None:
    """Validate the ``state`` cookie against the query parameter.

    The callback handlers already receive ``state`` as a query argument; this
    function checks that it matches the cookie and removes the cookie.
    """
    cookie_state = request.cookies.get(cookie_name)
    if (
        cookie_state
        and request.query_params.get("state")
        and cookie_state != request.query_params.get("state")
    ):
        raise HTTPException(status_code=400, detail="Invalid state parameter")
    response.delete_cookie(key=cookie_name)


def exchange_code_for_token(
    token_uri: str,
    code: str,
    client_id: str,
    client_secret: str,
    redirect_uri: str,
) -> dict[str, Any]:
    """Perform the *authorization_code* exchange and return the JSON payload."""
    token_response = requests.post(
        token_uri,
        data={
            "code": code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    if token_response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to retrieve token from provider.",
        )
    return token_response.json()


def fetch_userinfo(userinfo_url: str, access_token: str) -> dict[str, Any]:
    """Retrieve the user profile from the provider using the access token."""
    userinfo_resp = requests.get(
        userinfo_url,
        headers={"Authorization": f"Bearer {access_token}"},
    )
    if userinfo_resp.status_code != 200:
        raise HTTPException(
            status_code=400,
            detail="Failed to retrieve profile from provider.",
        )
    return userinfo_resp.json()


def upsert_oauth_user(
    session: Any,
    provider_user: dict[str, Any],
    provider: str,
    refresh_token: str | None = None,
) -> User:
    """Create or update a ``User`` based on the provider payload.

    ``provider`` must be either ``"google"`` or ``"linkedin"`` – it determines which
    identifier field to populate (``google_id`` or ``linkedin_id``).
    """
    email = provider_user.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Provider profile missing email.")

    user = crud.get_user_by_email(session=session, email=email)
    if user:
        if provider == "google" and not user.google_id:
            user.google_id = provider_user.get("sub")
        if provider == "linkedin" and not user.linkedin_id:
            user.linkedin_id = provider_user.get("sub")
        # user.full_name = provider_user.get("name") or user.full_name
        # avatar = provider_user.get("picture")
        # user.avatar_url = (
        #     avatar if avatar else (user.avatar_url or settings.DEFAULT_AVATAR_URL)
        # )
        if refresh_token:
            user.refresh_token = refresh_token
        session.add(user)
        session.commit()
    else:
        user_kwargs = {
            "email": email,
            "full_name": provider_user.get("name"),
            "avatar_url": provider_user.get("picture") or settings.DEFAULT_AVATAR_URL,
            "is_email_verified": True,
            "is_active": True,
            "hashed_password": get_password_hash(generate_random_password(16)),
        }
        if provider == "google":
            user_kwargs.update(
                {"google_id": provider_user.get("sub"), "refresh_token": refresh_token}
            )
        else:
            user_kwargs.update({"linkedin_id": provider_user.get("sub")})
        user = User(**user_kwargs)  # type: ignore[arg-type]
        session.add(user)
        session.commit()
        session.refresh(user)
        if user.active_role == UserRole.FREELANCER:
            profile = FreelancerProfile(user_id=user.id)
        else:
            profile = ClientProfile(user_id=user.id)
        session.add(profile)
        session.commit()
        # Send welcome / password‑recovery email
        try:
            # ``oauth`` flag signals that the email is part of an OAuth flow
            # (the original code always passed ``True``).
            import asyncio

            password_reset_token = generate_password_reset_token(user.email)
            asyncio.create_task(
                send_password_reconvery_email(
                    user.email, True, password_reset_token
                )
            )
        except Exception as exc:  # pragma: no cover – logging only
            logger.error(f"Error sending password recovery email: {exc}")
    return user


def build_access_token_response(user: User) -> Token:
    """Create a ``Token`` response for the given user."""
    expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return Token(
        access_token=security.create_access_token(user.id, expires_delta=expires)
    )
