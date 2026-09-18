import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    ClientProfile,
    ClientProfileDetailPublic,
    ClientProfilePublic,
    ClientProfileUpdate,
    JobPost,
    UserPublic,
)

router = APIRouter(prefix="/client-profiles", tags=["client-profiles"])


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
            "avatar_url": current_user.avatar_url,
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

    # Update full_name on User model if provided
    if (
        profile_in.full_name is not None
        and profile_in.full_name != current_user.full_name
    ):
        current_user.full_name = profile_in.full_name
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
            "avatar_url": current_user.avatar_url,
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

    user_public = UserPublic.model_validate(profile.user) if profile.user else None

    return ClientProfileDetailPublic.model_validate(
        profile,
        update={
            "full_name": profile.user.full_name if profile.user else None,
            "avatar_url": profile.user.avatar_url if profile.user else None,
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
    """
    profile = session.exec(
        select(ClientProfile).where(ClientProfile.user_id == user_id)
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Client profile not found")

    job_posts_count_stmt = select(func.count()).where(
        JobPost.client_id == profile.user_id
    )
    job_posts_count = session.exec(job_posts_count_stmt).one()

    user_public = UserPublic.model_validate(profile.user) if profile.user else None

    return ClientProfileDetailPublic.model_validate(
        profile,
        update={
            "full_name": profile.user.full_name if profile.user else None,
            "avatar_url": profile.user.avatar_url if profile.user else None,
            "user": user_public,
            "job_posts_count": job_posts_count,
        },
    )
