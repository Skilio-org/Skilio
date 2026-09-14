import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, HTTPException, Query
from sqlmodel import col, func, select

from app.api.deps import CurrentUser, CurrentUserOptional, SessionDep
from app.models import (
    FreelancerProfile,
    FreelancerProfileCreate,
    FreelancerProfileDetailPublic,
    FreelancerProfilePublic,
    FreelancerProfilesPublic,
    FreelancerProfileUpdate,
    FreelancerSkillLink,
    ITSkill,
    LikedFreelancer,
    MediaPublic,
    Message,
    Review,
    ReviewPublic,
    Skill,
    User,
    UserPublic,
    UserRole,
)

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/", response_model=FreelancerProfilesPublic)
def read_profiles(
    session: SessionDep,
    current_user: CurrentUserOptional = None,
    skip: int = 0,
    limit: int = 100,
    q: str | None = None,
    skill: list[ITSkill] | None = Query(default=None),
    min_rate: float | None = None,
    max_rate: float | None = None,
    is_available: bool | None = None,
    sort_by: str | None = None,
) -> Any:
    """
    Search and list freelancer cards. Public endpoint (optional auth).
    Supports filtering by text query (title, bio, location, name), skills, hourly rate range, and availability.
    Populates is_saved if called by an authenticated user.
    """
    statement = select(FreelancerProfile).join(
        User, FreelancerProfile.user_id == User.id
    )

    if q:
        statement = statement.where(
            col(FreelancerProfile.title).ilike(f"%{q}%")
            | col(FreelancerProfile.bio).ilike(f"%{q}%")
            | col(FreelancerProfile.location).ilike(f"%{q}%")
            | col(User.full_name).ilike(f"%{q}%")
        )

    if skill:
        for s in skill:
            statement = statement.where(
                FreelancerProfile.id.in_(  # type: ignore
                    select(FreelancerSkillLink.freelancer_profile_id)
                    .join(Skill, FreelancerSkillLink.skill_id == Skill.id)
                    .where(Skill.name == s)
                )
            )

    if min_rate is not None:
        statement = statement.where(col(FreelancerProfile.hourly_rate) >= min_rate)

    if max_rate is not None:
        statement = statement.where(col(FreelancerProfile.hourly_rate) <= max_rate)

    if is_available is not None:
        statement = statement.where(FreelancerProfile.is_available == is_available)

    count_statement = select(func.count()).select_from(statement.subquery())
    count = session.exec(count_statement).one()

    if sort_by == "rate_asc":
        statement = statement.order_by(
            col(FreelancerProfile.hourly_rate).asc().nulls_last()
        )
    elif sort_by == "rate_desc":
        statement = statement.order_by(
            col(FreelancerProfile.hourly_rate).desc().nulls_last()
        )
    elif sort_by == "newest":
        statement = statement.order_by(col(FreelancerProfile.created_at).desc())
    else:
        statement = statement.order_by(col(FreelancerProfile.updated_at).desc())

    statement = statement.offset(skip).limit(limit)
    profiles = session.exec(statement).all()

    # Pre-fetch saved profile IDs for current user to avoid N+1 queries
    saved_profile_ids: set[uuid.UUID] = set()
    if current_user:
        saved_rows = session.exec(
            select(LikedFreelancer.freelancer_id).where(
                LikedFreelancer.client_id == current_user.id
            )
        ).all()
        saved_profile_ids = set(saved_rows)

    profiles_public = []
    for profile in profiles:
        avg_rating_stmt = select(func.avg(Review.rating)).where(
            Review.freelancer_id == profile.id
        )
        reviews_count_stmt = select(func.count()).where(
            Review.freelancer_id == profile.id
        )
        avg_rating = session.exec(avg_rating_stmt).one()
        reviews_count = session.exec(reviews_count_stmt).one()

        profile_data = FreelancerProfilePublic.model_validate(
            profile,
            update={
                "full_name": profile.user.full_name if profile.user else None,
                "average_rating": float(avg_rating) if avg_rating else None,
                "reviews_count": reviews_count,
                "is_saved": profile.id in saved_profile_ids,
            },
        )
        profiles_public.append(profile_data)

    return FreelancerProfilesPublic(data=profiles_public, count=count)


@router.get("/me", response_model=FreelancerProfileDetailPublic)
def read_profile_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Get current user's freelancer profile with full detail.
    """
    profile = session.exec(
        select(FreelancerProfile).where(FreelancerProfile.user_id == current_user.id)
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Freelancer profile not found")

    avg_rating_stmt = select(func.avg(Review.rating)).where(
        Review.freelancer_id == profile.id
    )
    reviews_count_stmt = select(func.count()).where(Review.freelancer_id == profile.id)
    avg_rating = session.exec(avg_rating_stmt).one()
    reviews_count = session.exec(reviews_count_stmt).one()

    reviews_public = [
        ReviewPublic.model_validate(
            review,
            update={
                "client_name": review.client.full_name if review.client else None,
            },
        )
        for review in profile.reviews
    ]
    portfolio_public = [
        MediaPublic.model_validate(media) for media in profile.portfolio_media
    ]
    user_public = UserPublic.model_validate(profile.user) if profile.user else None

    return FreelancerProfileDetailPublic.model_validate(
        profile,
        update={
            "full_name": current_user.full_name,
            "average_rating": float(avg_rating) if avg_rating else None,
            "reviews_count": reviews_count,
            "portfolio_media": portfolio_public,
            "reviews": reviews_public,
            "user": user_public,
            "is_saved": False,
        },
    )


@router.get("/{id}", response_model=FreelancerProfileDetailPublic)
def read_profile(
    session: SessionDep,
    id: uuid.UUID,
    current_user: CurrentUserOptional = None,
) -> Any:
    """
    Get a single freelancer profile with full detail (portfolio, reviews, user info).
    Public endpoint (optional auth for is_saved status).
    """
    profile = session.get(FreelancerProfile, id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    avg_rating_stmt = select(func.avg(Review.rating)).where(
        Review.freelancer_id == profile.id
    )
    reviews_count_stmt = select(func.count()).where(Review.freelancer_id == profile.id)
    avg_rating = session.exec(avg_rating_stmt).one()
    reviews_count = session.exec(reviews_count_stmt).one()

    is_saved = False
    if current_user:
        existing_like = session.exec(
            select(LikedFreelancer).where(
                LikedFreelancer.client_id == current_user.id,
                LikedFreelancer.freelancer_id == profile.id,
            )
        ).first()
        is_saved = existing_like is not None

    reviews_public = []
    for review in profile.reviews:
        review_data = ReviewPublic.model_validate(
            review,
            update={
                "client_name": review.client.full_name if review.client else None,
            },
        )
        reviews_public.append(review_data)

    portfolio_public = [
        MediaPublic.model_validate(media) for media in profile.portfolio_media
    ]

    user_public = UserPublic.model_validate(profile.user) if profile.user else None

    return FreelancerProfileDetailPublic.model_validate(
        profile,
        update={
            "full_name": profile.user.full_name if profile.user else None,
            "average_rating": float(avg_rating) if avg_rating else None,
            "reviews_count": reviews_count,
            "portfolio_media": portfolio_public,
            "reviews": reviews_public,
            "user": user_public,
            "is_saved": is_saved,
        },
    )


@router.post("/{id}/save", response_model=Message)
def save_profile(
    *, session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Bookmark / save a freelancer profile for the current authenticated user.
    """
    profile = session.get(FreelancerProfile, id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    existing = session.exec(
        select(LikedFreelancer).where(
            LikedFreelancer.client_id == current_user.id,
            LikedFreelancer.freelancer_id == profile.id,
        )
    ).first()
    if not existing:
        like = LikedFreelancer(client_id=current_user.id, freelancer_id=profile.id)
        session.add(like)
        session.commit()

    return Message(message="Profile saved successfully")


@router.delete("/{id}/save", response_model=Message)
def unsave_profile(
    *, session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Remove a freelancer profile from bookmarks / saved list.
    """
    profile = session.get(FreelancerProfile, id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    existing = session.exec(
        select(LikedFreelancer).where(
            LikedFreelancer.client_id == current_user.id,
            LikedFreelancer.freelancer_id == profile.id,
        )
    ).first()
    if existing:
        session.delete(existing)
        session.commit()

    return Message(message="Profile removed from saved")


@router.post("/", response_model=FreelancerProfilePublic)
def create_profile(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    profile_in: FreelancerProfileCreate,
) -> Any:
    """
    Create a freelancer profile for the current user.
    Only users with the freelancer role can create a profile. One profile per user.
    """
    if current_user.role != UserRole.FREELANCER and not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Only freelancers can create a profile",
        )

    existing = session.exec(
        select(FreelancerProfile).where(FreelancerProfile.user_id == current_user.id)
    ).first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Freelancer profile already exists for this user",
        )

    # Resolve skills
    skill_objects = []
    for skill_name in profile_in.skills:
        skill = session.exec(select(Skill).where(Skill.name == skill_name)).first()
        if not skill:
            raise HTTPException(
                status_code=404,
                detail=f"Skill '{skill_name}' not found",
            )
        skill_objects.append(skill)

    profile_data = profile_in.model_dump(exclude={"skills"})
    profile = FreelancerProfile(**profile_data, user_id=current_user.id)
    session.add(profile)
    session.commit()
    session.refresh(profile)

    # Link skills
    for skill in skill_objects:
        link = FreelancerSkillLink(freelancer_profile_id=profile.id, skill_id=skill.id)
        session.add(link)
    session.commit()
    session.refresh(profile)

    return FreelancerProfilePublic.model_validate(
        profile,
        update={
            "full_name": current_user.full_name,
            "average_rating": None,
            "reviews_count": 0,
            "is_saved": False,
        },
    )


@router.put("/{id}", response_model=FreelancerProfilePublic)
def update_profile(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    profile_in: FreelancerProfileUpdate,
) -> Any:
    """
    Update a freelancer profile.
    Only the profile owner or a superuser can update.
    """
    profile = session.get(FreelancerProfile, id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    if not current_user.is_superuser and (profile.user_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    update_data = profile_in.model_dump(exclude_unset=True, exclude={"skills"})
    if update_data:
        update_data["updated_at"] = datetime.now(UTC)
        profile.sqlmodel_update(update_data)
        session.add(profile)

    # Update skills if provided
    if profile_in.skills is not None:
        # Clear existing links
        existing_links = session.exec(
            select(FreelancerSkillLink).where(
                FreelancerSkillLink.freelancer_profile_id == profile.id
            )
        ).all()
        for link in existing_links:
            session.delete(link)

        # Add new links
        for skill_name in profile_in.skills:
            skill = session.exec(select(Skill).where(Skill.name == skill_name)).first()
            if not skill:
                raise HTTPException(
                    status_code=404,
                    detail=f"Skill '{skill_name}' not found",
                )
            new_link = FreelancerSkillLink(
                freelancer_profile_id=profile.id, skill_id=skill.id
            )
            session.add(new_link)

    session.commit()
    session.refresh(profile)

    avg_rating_stmt = select(func.avg(Review.rating)).where(
        Review.freelancer_id == profile.id
    )
    reviews_count_stmt = select(func.count()).where(Review.freelancer_id == profile.id)
    avg_rating = session.exec(avg_rating_stmt).one()
    reviews_count = session.exec(reviews_count_stmt).one()

    return FreelancerProfilePublic.model_validate(
        profile,
        update={
            "full_name": profile.user.full_name if profile.user else None,
            "average_rating": float(avg_rating) if avg_rating else None,
            "reviews_count": reviews_count,
            "is_saved": False,
        },
    )


@router.delete("/{id}")
def delete_profile(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete a freelancer profile.
    Only the profile owner or a superuser can delete.
    """
    profile = session.get(FreelancerProfile, id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    if not current_user.is_superuser and (profile.user_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    session.delete(profile)
    session.commit()
    return Message(message="Profile deleted successfully")
