import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import col, func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    FreelancerProfile,
    FreelancerProfileCreate,
    FreelancerProfileDetailPublic,
    FreelancerProfilePublic,
    FreelancerProfilesPublic,
    FreelancerProfileUpdate,
    FreelancerSkillLink,
    ITSkill,
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
    skip: int = 0,
    limit: int = 100,
    q: str | None = None,
    skill: list[ITSkill] | None = None,
    min_rate: float | None = None,
    max_rate: float | None = None,
    is_available: bool | None = None,
) -> Any:
    """
    Search and list freelancer profiles. Public endpoint (no auth required).
    Supports filtering by text query, skills, hourly rate range, and availability.
    """
    statement = select(FreelancerProfile).join(
        User, FreelancerProfile.user_id == User.id
    )

    if q:
        statement = statement.where(
            col(FreelancerProfile.title).ilike(f"%{q}%")
            | col(FreelancerProfile.bio).ilike(f"%{q}%")
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
        statement = statement.where(
            col(FreelancerProfile.hourly_rate) >= min_rate
        )

    if max_rate is not None:
        statement = statement.where(
            col(FreelancerProfile.hourly_rate) <= max_rate
        )

    if is_available is not None:
        statement = statement.where(
            FreelancerProfile.is_available == is_available
        )

    count_statement = select(func.count()).select_from(statement.subquery())
    count = session.exec(count_statement).one()

    statement = (
        statement.order_by(col(FreelancerProfile.updated_at).desc())
        .offset(skip)
        .limit(limit)
    )
    profiles = session.exec(statement).all()

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
            },
        )
        profiles_public.append(profile_data)

    return FreelancerProfilesPublic(data=profiles_public, count=count)


@router.get("/{id}", response_model=FreelancerProfileDetailPublic)
def read_profile(session: SessionDep, id: uuid.UUID) -> Any:
    """
    Get a single freelancer profile with full detail (portfolio, reviews, user info).
    Public endpoint (no auth required).
    """
    profile = session.get(FreelancerProfile, id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    avg_rating_stmt = select(func.avg(Review.rating)).where(
        Review.freelancer_id == profile.id
    )
    reviews_count_stmt = select(func.count()).where(
        Review.freelancer_id == profile.id
    )
    avg_rating = session.exec(avg_rating_stmt).one()
    reviews_count = session.exec(reviews_count_stmt).one()

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
        },
    )


@router.post("/", response_model=FreelancerProfilePublic)
def create_profile(
    *, session: SessionDep, current_user: CurrentUser, profile_in: FreelancerProfileCreate
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
        select(FreelancerProfile).where(
            FreelancerProfile.user_id == current_user.id
        )
    ).first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Freelancer profile already exists for this user",
        )

    # Resolve skills
    skill_objects = []
    for skill_name in profile_in.skills:
        skill = session.exec(
            select(Skill).where(Skill.name == skill_name)
        ).first()
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
        link = FreelancerSkillLink(
            freelancer_profile_id=profile.id, skill_id=skill.id
        )
        session.add(link)
    session.commit()
    session.refresh(profile)

    return FreelancerProfilePublic.model_validate(
        profile,
        update={
            "full_name": current_user.full_name,
            "average_rating": None,
            "reviews_count": 0,
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
            skill = session.exec(
                select(Skill).where(Skill.name == skill_name)
            ).first()
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
    reviews_count_stmt = select(func.count()).where(
        Review.freelancer_id == profile.id
    )
    avg_rating = session.exec(avg_rating_stmt).one()
    reviews_count = session.exec(reviews_count_stmt).one()

    return FreelancerProfilePublic.model_validate(
        profile,
        update={
            "full_name": profile.user.full_name if profile.user else None,
            "average_rating": float(avg_rating) if avg_rating else None,
            "reviews_count": reviews_count,
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
