import uuid
from datetime import UTC, datetime
from typing import Annotated, Any

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
from sqlalchemy.orm import selectinload
from sqlmodel import col, func, select

from app.api.deps import CurrentUser, CurrentUserOptional, SessionDep
from app.claudinary import claudinary_delete_media, claudinary_upload_media
from app.models import (
    AvatarResponse,
    Education,
    EducationCreate,
    EducationPublic,
    EducationUpdate,
    Experience,
    ExperienceCreate,
    ExperiencePublic,
    ExperienceUpdate,
    FreelancerProfile,
    FreelancerProfileCreate,
    FreelancerProfileDetailPublic,
    FreelancerProfilePublic,
    FreelancerProfilesPublic,
    FreelancerProfileUpdate,
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
    SkillPublic,
    User,
    UserPublic,
    UserRole,
)

router = APIRouter(prefix="/profiles", tags=["profiles"])

def get_http_client(request: Request) -> httpx.AsyncClient: return request.app.state.http_client

def get_or_create_skill(session: SessionDep, name: str) -> Skill:
    clean_name = name.strip()
    skill = session.exec(select(Skill).where(col(Skill.name).ilike(clean_name))).first()
    if not skill:
        skill = Skill(name=clean_name)
        session.add(skill)
        session.flush()
    return skill


def _build_profile_detail_public(
    session: SessionDep,
    profile: FreelancerProfile,
    current_user: User | None = None,
    is_saved: bool = False,
) -> FreelancerProfileDetailPublic:
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
    portfolio_media_public = [
        MediaPublic.model_validate(media) for media in profile.portfolio_media
    ]
    educations_public = [EducationPublic.model_validate(e) for e in profile.educations]
    experiences_public = [
        ExperiencePublic.model_validate(exp) for exp in profile.experiences
    ]
    portfolio_items_public = [
        PortfolioItemPublic.model_validate(item) for item in profile.portfolio_items
    ]
    skills_public = [SkillPublic.model_validate(s) for s in profile.skills]
    skill_names = [s.name for s in profile.skills]

    user_obj = profile.user or current_user
    user_public = UserPublic.model_validate(user_obj) if user_obj else None

    return FreelancerProfileDetailPublic.model_validate(
        profile,
        update={
            "full_name": user_obj.full_name if user_obj else None,
            "average_rating": float(avg_rating) if avg_rating else None,
            "reviews_count": reviews_count,
            "skills": skills_public,
            "skill_names": skill_names,
            "portfolio_media": portfolio_media_public,
            "portfolio": portfolio_items_public,
            "educations": educations_public,
            "experiences": experiences_public,
            "reviews": reviews_public,
            "user": user_public,
            "is_saved": is_saved,
        },
    )


def _build_profile_public(
    session: SessionDep,
    profile: FreelancerProfile,
    current_user: User | None = None,
    is_saved: bool = False,
    avg_rating: float | None = None,
    reviews_count: int | None = None,
) -> FreelancerProfilePublic:
    if reviews_count is None:
        avg_rating_stmt = select(func.avg(Review.rating)).where(
            Review.freelancer_id == profile.id
        )
        reviews_count_stmt = select(func.count()).where(Review.freelancer_id == profile.id)
        raw_avg = session.exec(avg_rating_stmt).one()
        reviews_count = session.exec(reviews_count_stmt).one()
        avg_rating = float(raw_avg) if raw_avg is not None else None

    skills_public = [SkillPublic.model_validate(s) for s in profile.skills]
    skill_names = [s.name for s in profile.skills]

    user_obj = profile.user or current_user

    return FreelancerProfilePublic.model_validate(
        profile,
        update={
            "full_name": user_obj.full_name if user_obj else None,
            "average_rating": avg_rating,
            "reviews_count": reviews_count,
            "skills": skills_public,
            "skill_names": skill_names,
            "is_saved": is_saved,
        },
    )


@router.get("/", response_model=FreelancerProfilesPublic)
def read_profiles(
    session: SessionDep,
    current_user: CurrentUserOptional = None,
    skip: int = 0,
    limit: int = 100,
    q: str | None = None,
    skill: Annotated[list[str] | None, Query()] = None,
    category: str | None = None,
    min_rate: float | None = None,
    max_rate: float | None = None,
    is_available: bool | None = None,
    availability: str | None = None,
    finished: bool | None = None,
    sort_by: str | None = None,
) -> Any:
    """
    Search and list freelancer cards. Public endpoint (optional auth).
    Supports filtering by text query (title, bio, location, name), skills, hourly rate range, category, and availability.
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

    if category:
        statement = statement.where(col(FreelancerProfile.category).ilike(category))

    if availability:
        statement = statement.where(col(FreelancerProfile.availability).ilike(availability))

    if finished is not None:
        statement = statement.where(FreelancerProfile.finished == finished)
    elif not (current_user and current_user.is_superuser):
        statement = statement.where(FreelancerProfile.finished)

    if skill:
        for s in skill:
            statement = statement.where(
                FreelancerProfile.skills.any(col(Skill.name).ilike(s))
            )

    if min_rate is not None:
        statement = statement.where(FreelancerProfile.hourly_rate >= min_rate)

    if max_rate is not None:
        statement = statement.where(FreelancerProfile.hourly_rate <= max_rate)

    if availability is not None:
        statement = statement.where(
            col(FreelancerProfile.availability).ilike(f"%{availability}%")
        )

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

    statement = (
        statement.options(
            selectinload(FreelancerProfile.skills),  # type: ignore[arg-type]
            selectinload(FreelancerProfile.user),  # type: ignore[arg-type]
        )
        .offset(skip)
        .limit(limit)
    )
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

    # Pre-fetch review statistics (avg rating and count) in one batch query
    profile_ids = [p.id for p in profiles]
    stats_map: dict[uuid.UUID, tuple[float | None, int]] = {}
    if profile_ids:
        review_stats_stmt = (
            select(
                Review.freelancer_id,
                func.avg(Review.rating),
                func.count(col(Review.id)),
            )
            .where(col(Review.freelancer_id).in_(profile_ids))
            .group_by(col(Review.freelancer_id))
        )
        for f_id, raw_avg, r_cnt in session.exec(review_stats_stmt).all():
            stats_map[f_id] = (
                float(raw_avg) if raw_avg is not None else None,
                r_cnt,
            )

    profiles_public = [
        _build_profile_public(
            session,
            profile,
            is_saved=(profile.id in saved_profile_ids),
            avg_rating=stats_map.get(profile.id, (None, 0))[0],
            reviews_count=stats_map.get(profile.id, (None, 0))[1],
        )
        for profile in profiles
    ]

    return FreelancerProfilesPublic(data=profiles_public, count=count)


@router.get("/me", response_model=FreelancerProfileDetailPublic)
def read_profile_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Get current user's freelancer profile with full detail.
    Auto-creates a draft profile if none exists yet.
    """
    profile = session.exec(
        select(FreelancerProfile).where(FreelancerProfile.user_id == current_user.id)
    ).first()
    if not profile:
        profile = FreelancerProfile(
            user_id=current_user.id,
            is_available=True,
            availability="Available now",
            finished=False,
        )
        session.add(profile)
        session.commit()
        session.refresh(profile)

    return _build_profile_detail_public(
        session, profile, current_user=current_user, is_saved=False
    )


@router.put("/me", response_model=FreelancerProfileDetailPublic)
def update_profile_me(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    profile_in: FreelancerProfileUpdate,
) -> Any:
    """
    Update or create (upsert) current user's freelancer profile.
    Supports updating full_name, scalar fields, skills by name,
    and batch syncing experiences, educations, and portfolio.
    """
    profile = session.exec(
        select(FreelancerProfile).where(FreelancerProfile.user_id == current_user.id)
    ).first()

    if not profile:
        profile = FreelancerProfile(
            user_id=current_user.id,
            is_available=True,
            availability="Available now",
            finished=False,
        )
        session.add(profile)
        session.flush()

    if profile_in.full_name is not None and profile_in.full_name != current_user.full_name:
        current_user.full_name = profile_in.full_name
        session.add(current_user)

    if current_user.active_role != UserRole.FREELANCER:
        current_user.active_role = UserRole.FREELANCER
        session.add(current_user)

    update_dict = profile_in.model_dump(
        exclude_unset=True,
        exclude={"skills", "full_name", "experiences", "educations", "portfolio"},
    )
    if "availability" in update_dict and "is_available" not in update_dict:
        update_dict["is_available"] = (
            update_dict["availability"] != "Not currently available"
        )

    if update_dict:
        update_dict["updated_at"] = datetime.now(UTC)
        profile.sqlmodel_update(update_dict)
        session.add(profile)

    if profile_in.skills is not None:
        skill_objs = [
            get_or_create_skill(session, s)
            for s in profile_in.skills
            if s.strip()
        ]
        profile.skills = skill_objs
        session.add(profile)

    if profile_in.experiences is not None:
        for exp in list(profile.experiences):
            session.delete(exp)
        session.flush()
        for exp_in in profile_in.experiences:
            exp_obj = Experience.model_validate(
                exp_in, update={"freelancer_profile_id": profile.id}
            )
            session.add(exp_obj)

    if profile_in.educations is not None:
        for edu in list(profile.educations):
            session.delete(edu)
        session.flush()
        for edu_in in profile_in.educations:
            edu_obj = Education.model_validate(
                edu_in, update={"freelancer_profile_id": profile.id}
            )
            session.add(edu_obj)

    if profile_in.portfolio is not None:
        for item in list(profile.portfolio_items):
            session.delete(item)
        session.flush()
        for item_in in profile_in.portfolio:
            item_obj = PortfolioItem.model_validate(
                item_in, update={"freelancer_profile_id": profile.id}
            )
            session.add(item_obj)

    session.commit()
    session.refresh(profile)
    session.refresh(current_user)

    return _build_profile_detail_public(
        session, profile, current_user=current_user, is_saved=False
    )


# ==============================================================================
# Experience Sub-resources
# ==============================================================================


@router.post("/me/experiences", response_model=ExperiencePublic)
def create_experience(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    experience_in: ExperienceCreate,
) -> Any:
    """
    Add an experience entry to current user's freelancer profile.
    Auto-creates draft profile if one doesn't exist yet.
    """
    profile = session.exec(
        select(FreelancerProfile).where(FreelancerProfile.user_id == current_user.id)
    ).first()
    if not profile:
        profile = FreelancerProfile(
            user_id=current_user.id,
            is_available=True,
            availability="Available now",
            finished=False,
        )
        session.add(profile)
        session.flush()

    experience = Experience.model_validate(
        experience_in, update={"freelancer_profile_id": profile.id}
    )
    session.add(experience)
    session.commit()
    session.refresh(experience)
    return experience


@router.put("/me/experiences/{experience_id}", response_model=ExperiencePublic)
def update_experience(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    experience_id: uuid.UUID,
    experience_in: ExperienceUpdate,
) -> Any:
    """
    Update an experience entry in current user's freelancer profile.
    """
    profile = session.exec(
        select(FreelancerProfile).where(FreelancerProfile.user_id == current_user.id)
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Freelancer profile not found")

    experience = session.get(Experience, experience_id)
    if not experience or experience.freelancer_profile_id != profile.id:
        raise HTTPException(status_code=404, detail="Experience entry not found")

    update_dict = experience_in.model_dump(exclude_unset=True)
    if update_dict:
        update_dict["updated_at"] = datetime.now(UTC)
        experience.sqlmodel_update(update_dict)
        session.add(experience)
        session.commit()
        session.refresh(experience)
    return experience


@router.delete("/me/experiences/{experience_id}", response_model=Message)
def delete_experience(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    experience_id: uuid.UUID,
) -> Message:
    """
    Delete an experience entry from current user's freelancer profile.
    """
    profile = session.exec(
        select(FreelancerProfile).where(FreelancerProfile.user_id == current_user.id)
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Freelancer profile not found")

    experience = session.get(Experience, experience_id)
    if not experience or experience.freelancer_profile_id != profile.id:
        raise HTTPException(status_code=404, detail="Experience entry not found")

    session.delete(experience)
    session.commit()
    return Message(message="Experience deleted successfully")


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
        profile = FreelancerProfile(
            user_id=current_user.id,
            is_available=True,
            availability="Available now",
            finished=False,
        )
        session.add(profile)
        session.flush()

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
# Portfolio profile upload and download.
# ==============================================================================

@router.post("/resume", response_model=AvatarResponse)
async def upload_resume(
    *,
    session: SessionDep,
    file: UploadFile = File(...),
    current_user: CurrentUser,
) -> AvatarResponse:
    """Uploads resume asynchronously without blocking the event loop."""
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400, detail="Only PDF files are allowed"
        )
    # if not file.filename.lower().endswith(".pdf"):
    #     raise HTTPException(
    #         status_code=400, detail="File must have a .pdf extension"
    #     )
    contents = await file.read()
    url = await run_in_threadpool(
        claudinary_upload_media, current_user.id, contents, media_type="pdf"
    )
    if not url:
        raise HTTPException(
            status_code=500, detail="Failed to upload avatar image"
        )


    if not current_user.freelancer_profile:
        profile = FreelancerProfile(
            user_id=current_user.id,
            is_available=True,
            availability="Available now",
            finished=False,
        )
        session.add(profile)
        session.flush()
        current_user.freelancer_profile = profile
    current_user.freelancer_profile.resume_url = url

    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    return AvatarResponse(status="Ok")


@router.get("/resume/{uuid}")
async def proxy_resume(
    *,
    uuid: uuid.UUID,
    session: SessionDep,
    client: httpx.AsyncClient = Depends(get_http_client),
):
    """Gets the user's resume using his uuid."""
    user = session.get(User, uuid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    cloudinary_url = user.freelancer_profile.resume_url if user.freelancer_profile else None
    if not cloudinary_url:
        raise HTTPException(status_code=404, detail="resume not found")
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

# @router.get("/resume/me")
# async def proxy_me(
#     *,
#     uuid: uuid.UUID,
#     session: SessionDep,
#     client: httpx.AsyncClient = Depends(get_http_client),
# ):
#     """Gets the user's resume using his uuid."""
#     user = session.get(User, uuid)
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")
#     cloudinary_url = user.freelancer_profile.resume_url if user.freelancer_profile else None
#     if not cloudinary_url:
#         raise HTTPException(status_code=404, detail="resume not found")
#     headers = {}
#     try:
#         req = client.build_request("GET", cloudinary_url, headers=headers)
#         response = await client.send(req, stream=True)
#     except httpx.PoolTimeout:
#         raise HTTPException(
#             status_code=503, detail="Server capacity reached, retry shortly"
#         )
#     except httpx.RequestError:
#         raise HTTPException(status_code=502, detail="Upstream media fetch failed")

#     if response.status_code not in (200, 206):
#         await response.aclose()
#         raise HTTPException(status_code=response.status_code)

#     passthrough_headers = {
#         k: v
#         for k, v in response.headers.items()
#         if k.lower()
#         in ["content-type", "content-length", "accept-ranges", "content-range"]
#     }

#     return StreamingResponse(
#         content=response.aiter_bytes(chunk_size=64 * 1024),
#         status_code=response.status_code,
#         headers=passthrough_headers,
#         media_type=response.headers.get("content-type"),
#     )

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
        profile = FreelancerProfile(
            user_id=current_user.id,
            is_available=True,
            availability="Available now",
            finished=False,
        )
        session.add(profile)
        session.flush()

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
        profile = FreelancerProfile(
            user_id=current_user.id,
            is_available=True,
            availability="Available now",
            finished=False,
        )
        session.add(profile)
        session.flush()

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
    Drafts (finished=False) are only visible to the owner or superusers.
    """
    profile = session.get(FreelancerProfile, id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if not profile.finished:
        if not current_user or (
            current_user.id != profile.user_id and not current_user.is_superuser
        ):
            raise HTTPException(status_code=404, detail="Profile not found")

    is_saved = False
    if current_user:
        existing_like = session.exec(
            select(LikedFreelancer).where(
                LikedFreelancer.client_id == current_user.id,
                LikedFreelancer.freelancer_id == profile.id,
            )
        ).first()
        is_saved = existing_like is not None

    return _build_profile_detail_public(session, profile, is_saved=is_saved)


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
    if existing and existing.title is not None:
        raise HTTPException(
            status_code=409,
            detail="Freelancer profile already exists for this user",
        )

    # Resolve skills
    skill_objects = [
        get_or_create_skill(session, skill_name)
        for skill_name in profile_in.skills
        if skill_name.strip()
    ]

    profile_data = profile_in.model_dump(exclude={"skills"})
    if "availability" in profile_data and "is_available" not in profile_in.model_fields_set:
        profile_data["is_available"] = (
            profile_data["availability"] != "Not currently available"
        )

    if existing:
        existing.sqlmodel_update(profile_data)
        profile = existing
    else:
        profile = FreelancerProfile(**profile_data, user_id=current_user.id)

    profile.skills = skill_objects
    session.add(profile)

    # Auto-switch user's active role to freelancer
    current_user.active_role = UserRole.FREELANCER
    session.add(current_user)

    session.commit()
    session.refresh(profile)

    return _build_profile_public(session, profile, current_user=current_user)


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

    update_data = profile_in.model_dump(
        exclude_unset=True,
        exclude={"skills", "full_name", "experiences", "educations", "portfolio"},
    )
    if "availability" in update_data and "is_available" not in profile_in.model_fields_set:
        update_data["is_available"] = (
            update_data["availability"] != "Not currently available"
        )

    if update_data:
        update_data["updated_at"] = datetime.now(UTC)
        profile.sqlmodel_update(update_data)
        session.add(profile)

    # Update skills if provided
    if profile_in.skills is not None:
        profile.skills = [
            get_or_create_skill(session, s)
            for s in profile_in.skills
            if s.strip()
        ]
        session.add(profile)

    session.commit()
    session.refresh(profile)

    return _build_profile_public(session, profile)


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
