import uuid
from datetime import UTC, datetime
from typing import Any

import httpx
from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    Request,
    UploadFile,
)
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import StreamingResponse
from sqlmodel import col, func, select

from app.api.deps import CurrentUser, CurrentUserOptional, SessionDep
from app.claudinary import claudinary_delete_media, claudinary_upload_media
from app.models import (
    Education,
    EducationCreate,
    EducationPublic,
    EducationUpdate,
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
    PortfolioItem,
    PortfolioItemCreate,
    PortfolioItemPublic,
    PortfolioItemUpdate,
    Review,
    ReviewPublic,
    Skill,
    User,
    UserPublic,
    UserRole,
)

router = APIRouter(prefix="/profiles", tags=["profiles"])


def get_http_client(request: Request) -> httpx.AsyncClient:
    return request.app.state.http_client


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
        User, col(FreelancerProfile.user_id) == User.id
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
                    .join(Skill, col(FreelancerSkillLink.skill_id) == Skill.id)
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
    educations_public = [EducationPublic.model_validate(e) for e in profile.educations]
    portfolio_items_public = [
        PortfolioItemPublic.model_validate(item) for item in profile.portfolio_items
    ]
    user_public = UserPublic.model_validate(profile.user) if profile.user else None

    return FreelancerProfileDetailPublic.model_validate(
        profile,
        update={
            "full_name": current_user.full_name,
            "average_rating": float(avg_rating) if avg_rating else None,
            "reviews_count": reviews_count,
            "portfolio_media": portfolio_public,
            "portfolio": portfolio_items_public,
            "educations": educations_public,
            "reviews": reviews_public,
            "user": user_public,
            "is_saved": False,
        },
    )


# ==============================================================================
# Education Sub-resources
# ==============================================================================


@router.post("/me/educations", response_model=EducationPublic)
def create_education(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    education_in: EducationCreate,
) -> Any:
    """
    Add an education entry to current user's freelancer profile.
    """
    profile = session.exec(
        select(FreelancerProfile).where(FreelancerProfile.user_id == current_user.id)
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Freelancer profile not found")

    education = Education.model_validate(
        education_in, update={"freelancer_profile_id": profile.id}
    )
    session.add(education)
    session.commit()
    session.refresh(education)
    return education


@router.put("/me/educations/{education_id}", response_model=EducationPublic)
def update_education(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    education_id: uuid.UUID,
    education_in: EducationUpdate,
) -> Any:
    """
    Update an education entry in current user's freelancer profile.
    """
    profile = session.exec(
        select(FreelancerProfile).where(FreelancerProfile.user_id == current_user.id)
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Freelancer profile not found")

    education = session.get(Education, education_id)
    if not education or education.freelancer_profile_id != profile.id:
        raise HTTPException(status_code=404, detail="Education entry not found")

    update_dict = education_in.model_dump(exclude_unset=True)
    education.sqlmodel_update(update_dict)
    session.add(education)
    session.commit()
    session.refresh(education)
    return education


@router.delete("/me/educations/{education_id}", response_model=Message)
def delete_education(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    education_id: uuid.UUID,
) -> Message:
    """
    Delete an education entry from current user's freelancer profile.
    """
    profile = session.exec(
        select(FreelancerProfile).where(FreelancerProfile.user_id == current_user.id)
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Freelancer profile not found")

    education = session.get(Education, education_id)
    if not education or education.freelancer_profile_id != profile.id:
        raise HTTPException(status_code=404, detail="Education entry not found")

    session.delete(education)
    session.commit()
    return Message(message="Education entry deleted successfully")


# ==============================================================================
# Portfolio Item Sub-resources
# ==============================================================================


@router.post("/me/portfolio", response_model=PortfolioItemPublic)
def create_portfolio_item(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    item_in: PortfolioItemCreate,
) -> Any:
    """
    Create a portfolio item using JSON payload with image_url, title, and description.
    """
    profile = session.exec(
        select(FreelancerProfile).where(FreelancerProfile.user_id == current_user.id)
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Freelancer profile not found")

    item = PortfolioItem.model_validate(
        item_in, update={"freelancer_profile_id": profile.id}
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.post("/me/portfolio/upload", response_model=PortfolioItemPublic)
async def upload_portfolio_item(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    title: str = Form(...),
    description: str = Form(...),
    file: UploadFile = File(...),
) -> Any:
    """
    Upload an image for a new portfolio item and save title and description.
    """
    profile = session.exec(
        select(FreelancerProfile).where(FreelancerProfile.user_id == current_user.id)
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Freelancer profile not found")

    item_id = uuid.uuid4()
    contents = await file.read()
    url = await run_in_threadpool(
        claudinary_upload_media, item_id, contents, media_type="image"
    )
    if not url:
        raise HTTPException(status_code=500, detail="Failed to upload portfolio image")

    item = PortfolioItem(
        id=item_id,
        freelancer_profile_id=profile.id,
        title=title,
        description=description,
        image_url=url,
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.put("/me/portfolio/{item_id}", response_model=PortfolioItemPublic)
def update_portfolio_item(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    item_id: uuid.UUID,
    item_in: PortfolioItemUpdate,
) -> Any:
    """
    Update a portfolio item (title, description, image_url).
    """
    profile = session.exec(
        select(FreelancerProfile).where(FreelancerProfile.user_id == current_user.id)
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Freelancer profile not found")

    item = session.get(PortfolioItem, item_id)
    if not item or item.freelancer_profile_id != profile.id:
        raise HTTPException(status_code=404, detail="Portfolio item not found")

    update_dict = item_in.model_dump(exclude_unset=True)
    if update_dict:
        update_dict["updated_at"] = datetime.now(UTC)
        item.sqlmodel_update(update_dict)
        session.add(item)
        session.commit()
        session.refresh(item)
    return item


@router.delete("/me/portfolio/{item_id}", response_model=Message)
def delete_portfolio_item(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    item_id: uuid.UUID,
) -> Message:
    """
    Delete a portfolio item.
    """
    profile = session.exec(
        select(FreelancerProfile).where(FreelancerProfile.user_id == current_user.id)
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Freelancer profile not found")

    item = session.get(PortfolioItem, item_id)
    if not item or item.freelancer_profile_id != profile.id:
        raise HTTPException(status_code=404, detail="Portfolio item not found")

    if item.image_url:
        try:
            claudinary_delete_media(item.image_url)
        except Exception:
            pass

    session.delete(item)
    session.commit()
    return Message(message="Portfolio item deleted successfully")


@router.get("/portfolio/{uuid}/image")
async def proxy_portfolio_image(
    *,
    uuid: uuid.UUID,
    session: SessionDep,
    client: httpx.AsyncClient = Depends(get_http_client),
):
    """
    Get the portfolio item's image using its uuid, proxying from Cloudinary.
    """
    item = session.get(PortfolioItem, uuid)
    if not item:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    cloudinary_url = item.image_url
    if not cloudinary_url:
        raise HTTPException(status_code=404, detail="Image not found")
    headers = {}
    try:
        req = client.build_request("GET", cloudinary_url, headers=headers)
        response = await client.send(req, stream=True)
    except httpx.PoolTimeout:
        raise HTTPException(
            status_code=503, detail="Server capacity reached, retry shortly"
        )
    except httpx.RequestError:
        raise HTTPException(status_code=502, detail="Upstream media fetch failed")

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
    educations_public = [EducationPublic.model_validate(e) for e in profile.educations]
    portfolio_items_public = [
        PortfolioItemPublic.model_validate(item) for item in profile.portfolio_items
    ]

    user_public = UserPublic.model_validate(profile.user) if profile.user else None

    return FreelancerProfileDetailPublic.model_validate(
        profile,
        update={
            "full_name": profile.user.full_name if profile.user else None,
            "average_rating": float(avg_rating) if avg_rating else None,
            "reviews_count": reviews_count,
            "portfolio_media": portfolio_public,
            "portfolio": portfolio_items_public,
            "educations": educations_public,
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
    Any authenticated user can create a freelancer profile. One profile per user.
    After creation, the user's active role is switched to freelancer.
    """
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

    # Auto-switch user's active role to freelancer
    current_user.active_role = UserRole.FREELANCER
    session.add(current_user)

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
