import logging
import uuid
from typing import Any

import httpx
from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import StreamingResponse
from sqlmodel import col, func, select

from app import crud
from app.api.deps import (
    CurrentUser,
    SessionDep,
    get_current_active_superuser,
)
from app.claudinary import claudinary_upload_media
from app.core.config import settings
from app.core.security import get_password_hash, verify_password
from app.models import (
    AvatarResponse,
    ClientProfile,
    FreelancerProfile,
    Message,
    SwitchRoleRequest,
    UpdatePassword,
    User,
    UserCreate,
    UserPublic,
    UserRegister,
    UserRole,
    UsersPublic,
    UserUpdate,
    UserUpdateMe,
)
from app.utils import (
    generate_new_account_email,
    send_email,
    send_verification_email,
    validate_verify_token,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/users", tags=["users"])


def get_http_client(request: Request) -> httpx.AsyncClient:
    return request.app.state.http_client


@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UsersPublic,
)
def read_users(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Retrieve users.
    """

    count_statement = select(func.count()).select_from(User)
    count = session.exec(count_statement).one()

    statement = (
        select(User).order_by(col(User.created_at).desc()).offset(skip).limit(limit)
    )
    users = session.exec(statement).all()

    users_public = [UserPublic.model_validate(user) for user in users]
    return UsersPublic(data=users_public, count=count)


@router.post(
    "/", dependencies=[Depends(get_current_active_superuser)], response_model=UserPublic
)
async def create_user(*, session: SessionDep, user_in: UserCreate) -> Any:
    """
    Create new user.
    """
    user = crud.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system.",
        )

    user = crud.create_user(session=session, user_create=user_in)
    if settings.emails_enabled and user_in.email:
        email_data = generate_new_account_email(
            email_to=user_in.email, username=user_in.email, password=user_in.password
        )
        await send_email(
            email_to=user_in.email,
            subject=email_data.subject,
            html_content=email_data.html_content,
        )
    return user


@router.post("/me/avatar", response_model=AvatarResponse)
async def upload_avatar(
    *,
    session: SessionDep,
    file: UploadFile = File(...),
    current_user: CurrentUser,
) -> AvatarResponse:
    """Uploads avatar asynchronously without blocking the event loop."""
    contents = await file.read()
    url = await run_in_threadpool(
        claudinary_upload_media, current_user.id, contents, media_type="image"
    )
    if not url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload avatar image"
        )

    current_user.avatar_url = url
    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    return AvatarResponse(status="Ok")


@router.get("/avatar/{uuid}")
async def proxy_media(
    *,
    uuid: uuid.UUID,
    session: SessionDep,
    client: httpx.AsyncClient = Depends(get_http_client),
):
    """Gets the user's avatar using his uuid."""
    user = session.get(User, uuid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    cloudinary_url = user.avatar_url
    if not cloudinary_url:
        raise HTTPException(status_code=404, detail="Avatar not found")
    headers = {}
    try:
        req = client.build_request("GET", cloudinary_url, headers=headers)
        response = await client.send(req, stream=True)
    except httpx.PoolTimeout:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Server capacity reached, retry shortly"
        )
    except httpx.RequestError:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Upstream media fetch failed")

    if response.status_code not in (200, 206):
        await response.aclose()
        raise HTTPException(status_code=response.status_code)

    passthrough_headers = {
        k: v
        for k, v in response.headers.items()
        if k.lower()
        in ["content-type", "content-length", "accept-ranges", "content-range"]
    }

    return StreamingResponse(
        content=response.aiter_bytes(chunk_size=64 * 1024),
        status_code=response.status_code,
        headers=passthrough_headers,
        media_type=response.headers.get("content-type"),
    )


@router.patch("/me/password", response_model=Message)
def update_password_me(
    *, session: SessionDep, body: UpdatePassword, current_user: CurrentUser
) -> Any:
    """
    Update own password.
    """
    if body.current_password == body.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="New password cannot be the same as the current one"
        )
    verified, _ = verify_password(body.current_password, current_user.hashed_password)
    if not verified:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect password")
    hashed_password = get_password_hash(body.new_password)
    current_user.hashed_password = hashed_password
    session.add(current_user)
    session.commit()
    return Message(message="Password updated successfully")


@router.post("/me/switch-role", response_model=UserPublic)
def switch_role(
    *, session: SessionDep, current_user: CurrentUser, body: SwitchRoleRequest
) -> Any:
    """
    Switch the current user's active role between client and freelancer.
    If switching to freelancer, a FreelancerProfile must exist.
    """
    if body.role == current_user.active_role:
        return current_user

    if body.role == UserRole.FREELANCER:
        profile = session.exec(
            select(FreelancerProfile).where(
                FreelancerProfile.user_id == current_user.id
            )
        ).first()
        if not profile:
            profile = FreelancerProfile(user_id=current_user.id)
            session.add(profile)
            session.commit()
    elif body.role == UserRole.CLIENT:
        profile = session.exec(
            select(ClientProfile).where(
                ClientProfile.user_id == current_user.id
            )
        ).first()
        if not profile:
            profile = ClientProfile(user_id=current_user.id)
            session.add(profile)
            session.commit()

    current_user.active_role = body.role
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user


@router.get("/me", response_model=UserPublic)
def read_user_me(current_user: CurrentUser) -> Any:
    """
    Get current user.
    """
    return current_user


@router.delete("/me", response_model=Message)
def delete_user_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Delete own user.
    """
    if current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Super users are not allowed to delete themselves"
        )
    session.delete(current_user)
    session.commit()
    return Message(message="User deleted successfully")

@router.patch("/me", response_model=UserPublic)
async def update_user_me(
    *, session: SessionDep, user_in: UserUpdateMe, current_user: CurrentUser
) -> Any:
    """
    Update own user.
    """
    if user_in.email and user_in.email != current_user.email:
        existing_user = crud.get_user_by_email(session=session, email=user_in.email)
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists",
            )

    email_changed = user_in.email is not None and user_in.email != current_user.email
    if email_changed:
        if not user_in.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is required to change email",
            )
        verified, _ = verify_password(
            str(user_in.password), current_user.hashed_password
        )
        if not verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect password",
            )

    user_data = user_in.model_dump(exclude_unset=True)
    user_data.pop("password", None)

    current_user.sqlmodel_update(user_data)

    if email_changed:
        current_user.is_email_verified = False
        try:
            await send_verification_email(
                user_in.email, current_user.full_name or ""
            )
        except Exception as e:
            logger.error(
                f"Failed to send verification email to {user_in.email}: {e}"
            )
            session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send verification email. Please try again later.",
            )
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user


@router.post("/signup", response_model=UserPublic)
async def register_user(session: SessionDep, user_in: UserRegister) -> Any:
    """
        Create new user without the need to be logged in.
    """
    user = crud.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system",
        )
    user_create = UserCreate.model_validate(user_in)
    user = crud.create_user(session=session, user_create=user_create)

    # If registering as a freelancer, auto-initialize an empty draft FreelancerProfile
    if user.active_role == UserRole.FREELANCER:
        profile = session.exec(
            select(FreelancerProfile).where(FreelancerProfile.user_id == user.id)
        ).first()
        if not profile:
            profile = FreelancerProfile(user_id=user.id)
            session.add(profile)
    elif user.active_role == UserRole.CLIENT:
        profile = session.exec(
            select(ClientProfile).where(ClientProfile.user_id == user.id)
        ).first()
        if not profile:
            profile = ClientProfile(user_id=user.id)
            session.add(profile)

    user.avatar_url = settings.DEFAULT_AVATAR_URL
    if settings.ENV != "production":
        user.is_email_verified = True
    else:
        user.is_email_verified = False
    try:
        await send_verification_email(user_in.email, user.full_name if user.full_name else "")
        session.commit()
        session.refresh(user)
        return user
    except RuntimeError as e:
        logger.error(f"Failed to send verification email to {user.email}: {e}")
    except HTTPException as e:
        logger.error(f"Unexpected error when sending verification email to {user.email}: {e}")
    except Exception as e:
        logger.error(f"Unexpected error when sending verification email to {user.email}: {e}")
    session.rollback()
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to send verification email. Please try again later.",
    )


@router.get("/verify")
def verify_email(session: SessionDep, token: str) -> Message:
    """
    Verify email.
    """
    email = validate_verify_token(token)
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")
    user = crud.get_user_by_email(session=session, email=email)
    if not user:
        # Don't reveal that the user doesn't exist - use same error as invalid token
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")
    elif not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    # TODO: Update user.is_email_verified.
    user.is_email_verified = True
    session.add(user)
    session.commit()
    session.refresh(user)
    # print(f"User {user.email} has verified their email using token {token}")
    return Message(message="Email was verified!")


@router.get("/{user_id}", response_model=UserPublic)
def read_user_by_id(
    user_id: uuid.UUID, session: SessionDep, current_user: CurrentUser
) -> Any:
    """
    Get a specific user by id.
    """
    user = session.get(User, user_id)
    if user == current_user:
        return user
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.patch(
    "/{user_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UserPublic,
)
def update_user(
    *,
    session: SessionDep,
    user_id: uuid.UUID,
    user_in: UserUpdate,
) -> Any:
    """
    Update a user.
    """

    db_user = session.get(User, user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The user with this id does not exist in the system",
        )
    if user_in.email:
        existing_user = crud.get_user_by_email(session=session, email=user_in.email)
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="User with this email already exists"
            )
    db_user = crud.update_user(session=session, db_user=db_user, user_in=user_in)
    return db_user


@router.delete("/{user_id}", dependencies=[Depends(get_current_active_superuser)])
def delete_user(
    session: SessionDep, current_user: CurrentUser, user_id: uuid.UUID
) -> Message:
    """
    Delete a user.
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user == current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Super users are not allowed to delete themselves"
        )
    session.delete(user)
    session.commit()
    return Message(message="User deleted successfully")
