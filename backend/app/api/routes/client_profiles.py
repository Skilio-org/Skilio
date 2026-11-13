import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.claudinary import claudinary_upload_media
from app.models import (
    AvatarResponse,
    ClientProfile,
    ClientProfileDetailPublic,
    ClientProfilePublic,
    ClientProfileUpdate,
    JobPost,
    User,
    UserPublic,
)

router = APIRouter(prefix="/client-profiles", tags=["client-profiles"])

ALLOWED_AVATAR_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_AVATAR_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("/me/avatar", response_model=AvatarResponse)
async def upload_client_avatar(
    *,
    session: SessionDep,
    file: UploadFile = File(...),
    current_user: CurrentUser,
) -> AvatarResponse:
    """Upload avatar for the current user's client profile."""
    if file.content_type not in ALLOWED_AVATAR_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image format. Allowed: JPEG, PNG, WebP.",
        )
    if file.size is not None and file.size > MAX_AVATAR_SIZE:
        raise HTTPException(status_code=413, detail="Avatar size cannot exceed 5MB.")

    contents = await file.read()
    if len(contents) > MAX_AVATAR_SIZE:
        raise HTTPException(status_code=413, detail="Avatar size cannot exceed 5MB.")

    profile = session.exec(
        select(ClientProfile).where(ClientProfile.user_id == current_user.id)
    ).first()
    if not profile:
        profile = ClientProfile(user_id=current_user.id)
        session.add(profile)
        session.flush()

    avatar_id = uuid.uuid4()
    url = await run_in_threadpool(
        claudinary_upload_media, avatar_id, contents, media_type="image"
    )
    if not url:
        raise HTTPException(status_code=500, detail="Failed to upload avatar image")

    profile.avatar_url = url
    session.add(profile)
    session.commit()
    return AvatarResponse(status="Ok")


@router.get("/me", response_model=ClientProfilePublic)
def read_client_profile_me(
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Get current user's client profile.
    Automatically creates a draft profile if none exists yet.
    """
    profile = session.exec(
        select(ClientProfile).where(ClientProfile.user_id == current_user.id)
    ).first()

    if not profile:
        profile = ClientProfile(user_id=current_user.id)
        session.add(profile)
        session.commit()
        session.refresh(profile)

    return ClientProfilePublic.model_validate(
        profile,
        update={
            "full_name": current_user.full_name,
            "avatar_url": profile.avatar_url or current_user.avatar_url,
        },
    )


@router.put("/me", response_model=ClientProfilePublic)
def update_client_profile_me(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    profile_in: ClientProfileUpdate,
) -> Any:
    """
    Update or upsert current user's client profile.
    Optionally updates the user's full_name if provided.
    """
    profile = session.exec(
        select(ClientProfile).where(ClientProfile.user_id == current_user.id)
    ).first()

    if not profile:
        profile = ClientProfile(user_id=current_user.id)
        session.add(profile)

    # Validate required fields
    full_name = (
        profile_in.full_name
        if profile_in.full_name is not None
        else current_user.full_name or ""
    ).strip()
    if not full_name:
        raise HTTPException(
            status_code=400,
            detail="Full name is required.",
        )
    if len(full_name) > 100:
        raise HTTPException(
            status_code=400,
            detail="Full name cannot exceed 100 characters.",
        )

    role = (
        profile_in.company_role
        if profile_in.company_role is not None
        else profile.company_role or ""
    ).strip()
    if not role:
        raise HTTPException(
            status_code=400,
            detail="Role is required.",
        )
    if len(role) > 100:
        raise HTTPException(
            status_code=400,
            detail="Role cannot exceed 100 characters.",
        )

    location = (
        profile_in.location
        if profile_in.location is not None
        else profile.location or ""
    ).strip()
    if not location:
        raise HTTPException(
            status_code=400,
            detail="Location is required.",
        )

    size = (
        profile_in.company_size
        if profile_in.company_size is not None
        else profile.company_size or ""
    ).strip()
    if not size:
        raise HTTPException(
            status_code=400,
            detail="Company size is required.",
        )

    if profile_in.company is not None and len(profile_in.company.strip()) > 100:
        raise HTTPException(
            status_code=400,
            detail="Company name cannot exceed 100 characters.",
        )

    # Update full_name on User model if provided
    if profile_in.full_name is not None and profile_in.full_name != current_user.full_name:
        current_user.full_name = profile_in.full_name.strip()
        session.add(current_user)

    update_data = profile_in.model_dump(exclude_unset=True, exclude={"full_name"})
    if update_data:
        update_data["updated_at"] = datetime.now(UTC)
        profile.sqlmodel_update(update_data)
        session.add(profile)

    session.commit()
    session.refresh(profile)
    session.refresh(current_user)

    return ClientProfilePublic.model_validate(
        profile,
        update={
            "full_name": current_user.full_name,
            "avatar_url": profile.avatar_url or current_user.avatar_url,
        },
    )


@router.get("/{id}", response_model=ClientProfileDetailPublic)
def read_client_profile(
    *,
    session: SessionDep,
    id: uuid.UUID,
) -> Any:
    """
    Get client profile by ID. Public endpoint.
    """
    profile = session.get(ClientProfile, id)
    if not profile:
        raise HTTPException(status_code=404, detail="Client profile not found")

    job_posts_count_stmt = select(func.count()).where(
        JobPost.client_id == profile.user_id
    )
    job_posts_count = session.exec(job_posts_count_stmt).one()

    user_public = (
        UserPublic.model_validate(profile.user) if profile.user else None
    )

    return ClientProfileDetailPublic.model_validate(
        profile,
        update={
            "full_name": profile.user.full_name if profile.user else None,
            "avatar_url": profile.avatar_url or (profile.user.avatar_url if profile.user else None),
            "user": user_public,
            "job_posts_count": job_posts_count,
        },
    )


@router.get("/user/{user_id}", response_model=ClientProfileDetailPublic)
def read_client_profile_by_user_id(
    *,
    session: SessionDep,
    user_id: uuid.UUID,
) -> Any:
    """
    Get client profile by user ID. Public endpoint.
    Automatically creates a draft profile if the user exists but has no profile yet.
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Client profile not found")

    profile = session.exec(
        select(ClientProfile).where(ClientProfile.user_id == user_id)
    ).first()
    if not profile:
        profile = ClientProfile(user_id=user.id)
        session.add(profile)
        session.commit()
        session.refresh(profile)

    job_posts_count_stmt = select(func.count()).where(
        JobPost.client_id == profile.user_id
    )
    job_posts_count = session.exec(job_posts_count_stmt).one()

    user_obj = profile.user or user
    user_public = (
        UserPublic.model_validate(user_obj) if user_obj else None
    )

    return ClientProfileDetailPublic.model_validate(
        profile,
        update={
            "full_name": user_obj.full_name if user_obj else None,
            "avatar_url": profile.avatar_url or (user_obj.avatar_url if user_obj else None),
            "user": user_public,
            "job_posts_count": job_posts_count,
        },
    )
