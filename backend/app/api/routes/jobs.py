import uuid
from datetime import UTC, datetime
from typing import Annotated, Any

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy.orm import joinedload, selectinload
from sqlmodel import col, func, select

from app.api.deps import CurrentUser, CurrentUserOptional, SessionDep
from app.models import (
    BudgetType,
    ClientProfilePublic,
    ITSkill,
    JobPost,
    JobPostCreate,
    JobPostDetailPublic,
    JobPostPublic,
    JobPostsPublic,
    JobPostUpdate,
    JobSkillLink,
    JobStatus,
    Message,
    Proposal,
    SavedJob,
    SavedJobPublic,
    SavedJobsPublic,
    Skill,
    SkillPublic,
    User,
    UserPublic,
    UserRole,
)

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/", response_model=JobPostsPublic)
def read_jobs(
    session: SessionDep,
    current_user: CurrentUserOptional = None,
    skip: int = 0,
    limit: int = 100,
    q: str | None = None,
    skill: Annotated[list[ITSkill] | None, Query()] = None,
    budget_type: BudgetType | None = None,
    min_budget: float | None = None,
    max_budget: float | None = None,
    location: str | None = None,
    status: JobStatus | None = JobStatus.OPEN,
    sort_by: str | None = "newest",
) -> Any:
    """
    Search and list jobs (Job Feed). Public endpoint with optional authentication.
    Supports filtering by keyword search, skills, budget type, budget range, location, and status.
    Populates proposals_count, is_saved, and has_applied for authenticated freelancers.
    """
    statement = select(JobPost).join(User, col(JobPost.client_id) == User.id)

    if q:
        statement = statement.where(
            col(JobPost.title).ilike(f"%{q}%")
            | col(JobPost.description).ilike(f"%{q}%")
        )

    if skill:
        for s in skill:
            statement = statement.where(
                JobPost.id.in_(  # type: ignore
                    select(JobSkillLink.job_post_id)
                    .join(Skill, col(JobSkillLink.skill_id) == Skill.id)
                    .where(Skill.name == s)
                )
            )

    if budget_type is not None:
        statement = statement.where(JobPost.budget_type == budget_type)

    if min_budget is not None:
        statement = statement.where(col(JobPost.budget) >= min_budget)

    if max_budget is not None:
        statement = statement.where(col(JobPost.budget) <= max_budget)

    if location:
        statement = statement.where(col(JobPost.location).ilike(f"%{location}%"))

    if status is not None:
        statement = statement.where(JobPost.status == status)

    count_statement = select(func.count()).select_from(statement.subquery())
    count = session.exec(count_statement).one()

    if sort_by == "budget_desc":
        statement = statement.order_by(col(JobPost.budget).desc())
    elif sort_by == "budget_asc":
        statement = statement.order_by(col(JobPost.budget).asc())
    elif sort_by == "oldest":
        statement = statement.order_by(col(JobPost.created_at).asc())
    else:  # "newest" is default
        statement = statement.order_by(col(JobPost.created_at).desc())

    statement = (
        statement.options(
            selectinload(JobPost.required_skills),  # type: ignore[arg-type]
            selectinload(JobPost.client).selectinload(User.client_profile),  # type: ignore[arg-type]
        )
        .offset(skip)
        .limit(limit)
    )
    jobs = session.exec(statement).all()

    # Pre-fetch saved and applied job IDs for current user to avoid N+1 queries
    saved_job_ids: set[uuid.UUID] = set()
    applied_job_ids: set[uuid.UUID] = set()

    if current_user:
        saved_rows = session.exec(
            select(SavedJob.job_post_id).where(
                SavedJob.freelancer_id == current_user.id
            )
        ).all()
        saved_job_ids = set(saved_rows)

        applied_rows = session.exec(
            select(Proposal.job_post_id).where(
                Proposal.freelancer_id == current_user.id
            )
        ).all()
        applied_job_ids = set(applied_rows)

    # Pre-fetch proposal counts for all returned jobs in a single batch query
    job_ids = [job.id for job in jobs]
    proposal_counts: dict[uuid.UUID, int] = {}
    if job_ids:
        prop_stats_stmt = (
            select(Proposal.job_post_id, func.count(col(Proposal.id)))
            .where(col(Proposal.job_post_id).in_(job_ids))
            .group_by(col(Proposal.job_post_id))
        )
        for j_id, p_cnt in session.exec(prop_stats_stmt).all():
            proposal_counts[j_id] = p_cnt

    jobs_public = []
    for job in jobs:
        proposals_count = proposal_counts.get(job.id, 0)
        skills_public = [
            SkillPublic.model_validate(skill) for skill in job.required_skills
        ]

        client_company = (
            job.client.client_profile.company
            if job.client and job.client.client_profile
            else None
        )

        job_data = JobPostPublic.model_validate(
            job,
            update={
                "client_name": job.client.full_name if job.client else None,
                "client_company": client_company,
                "skills": skills_public,
                "proposals_count": proposals_count,
                "is_saved": job.id in saved_job_ids,
                "has_applied": job.id in applied_job_ids,
            },
        )
        jobs_public.append(job_data)

    return JobPostsPublic(data=jobs_public, count=count)


@router.get("/me", response_model=JobPostsPublic)
def read_my_jobs(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    status: JobStatus | None = None,
) -> Any:
    """
    List jobs created by the current client.
    """
    statement = select(JobPost).where(JobPost.client_id == current_user.id)

    if status is not None:
        statement = statement.where(JobPost.status == status)

    count_statement = select(func.count()).select_from(statement.subquery())
    count = session.exec(count_statement).one()

    statement = (
        statement.options(selectinload(JobPost.required_skills))  # type: ignore[arg-type]
        .order_by(col(JobPost.created_at).desc())
        .offset(skip)
        .limit(limit)
    )
    jobs = session.exec(statement).all()

    # Pre-fetch proposal counts in a single batch query
    job_ids = [job.id for job in jobs]
    proposal_counts: dict[uuid.UUID, int] = {}
    if job_ids:
        prop_stats_stmt = (
            select(Proposal.job_post_id, func.count(col(Proposal.id)))
            .where(col(Proposal.job_post_id).in_(job_ids))
            .group_by(col(Proposal.job_post_id))
        )
        for j_id, p_cnt in session.exec(prop_stats_stmt).all():
            proposal_counts[j_id] = p_cnt

    client_company = (
        current_user.client_profile.company
        if current_user.client_profile
        else None
    )

    jobs_public = []
    for job in jobs:
        proposals_count = proposal_counts.get(job.id, 0)
        skills_public = [
            SkillPublic.model_validate(skill) for skill in job.required_skills
        ]

        job_data = JobPostPublic.model_validate(
            job,
            update={
                "client_name": current_user.full_name,
                "client_company": client_company,
                "skills": skills_public,
                "proposals_count": proposals_count,
                "is_saved": False,
                "has_applied": False,
            },
        )
        jobs_public.append(job_data)

    return JobPostsPublic(data=jobs_public, count=count)


@router.get("/saved", response_model=SavedJobsPublic)
def read_saved_jobs(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    List jobs saved / bookmarked by the current freelancer.
    """
    if current_user.active_role != UserRole.FREELANCER and not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Only freelancers can view saved jobs",
        )

    count_statement = select(func.count()).where(
        SavedJob.freelancer_id == current_user.id
    )
    count = session.exec(count_statement).one()

    statement = (
        select(SavedJob)
        .where(SavedJob.freelancer_id == current_user.id)
        .options(
            joinedload(SavedJob.job_post).selectinload(JobPost.required_skills),  # type: ignore[arg-type]
            joinedload(SavedJob.job_post).selectinload(JobPost.client),  # type: ignore[arg-type]
        )
        .order_by(col(SavedJob.created_at).desc())
        .offset(skip)
        .limit(limit)
    )
    saved_jobs = session.exec(statement).all()

    # Pre-fetch applied job IDs
    applied_rows = session.exec(
        select(Proposal.job_post_id).where(
            Proposal.freelancer_id == current_user.id
        )
    ).all()
    applied_job_ids = set(applied_rows)

    # Pre-fetch proposal counts in a single batch query
    job_ids = [saved.job_post_id for saved in saved_jobs if saved.job_post]
    proposal_counts: dict[uuid.UUID, int] = {}
    if job_ids:
        prop_stats_stmt = (
            select(Proposal.job_post_id, func.count(col(Proposal.id)))
            .where(col(Proposal.job_post_id).in_(job_ids))
            .group_by(col(Proposal.job_post_id))
        )
        for j_id, p_cnt in session.exec(prop_stats_stmt).all():
            proposal_counts[j_id] = p_cnt

    saved_public = []
    for saved in saved_jobs:
        job = saved.job_post
        job_public = None
        if job:
            proposals_count = proposal_counts.get(job.id, 0)
            skills_public = [
                SkillPublic.model_validate(skill) for skill in job.required_skills
            ]

            job_public = JobPostPublic.model_validate(
                job,
                update={
                    "client_name": job.client.full_name if job.client else None,
                    "skills": skills_public,
                    "proposals_count": proposals_count,
                    "is_saved": True,
                    "has_applied": job.id in applied_job_ids,
                },
            )

        saved_public.append(
            SavedJobPublic(
                id=saved.id,
                job_post_id=saved.job_post_id,
                created_at=saved.created_at,
                job_post=job_public,
            )
        )

    return SavedJobsPublic(data=saved_public, count=count)


@router.post("/", response_model=JobPostPublic)
def create_job(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    job_in: JobPostCreate,
) -> Any:
    """
    Create a new job post.
    Only clients or superusers can create job posts.
    """
    if current_user.active_role != UserRole.CLIENT and not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Only clients can post jobs",
        )

    # Resolve skills
    skill_objects = []
    for skill_name in job_in.skills:
        skill = session.exec(select(Skill).where(Skill.name == skill_name)).first()
        if not skill:
            raise HTTPException(
                status_code=404,
                detail=f"Skill '{skill_name}' not found",
            )
        skill_objects.append(skill)

    job_data = job_in.model_dump(exclude={"skills"})
    job = JobPost(**job_data, client_id=current_user.id)
    session.add(job)
    session.commit()
    session.refresh(job)

    # Link skills
    for skill in skill_objects:
        link = JobSkillLink(job_post_id=job.id, skill_id=skill.id)
        session.add(link)
    session.commit()
    session.refresh(job)

    skills_public = [
        SkillPublic.model_validate(skill) for skill in job.required_skills
    ]

    return JobPostPublic.model_validate(
        job,
        update={
            "client_name": current_user.full_name,
            "skills": skills_public,
            "proposals_count": 0,
            "is_saved": False,
            "has_applied": False,
        },
    )


@router.get("/{id}", response_model=JobPostDetailPublic)
def read_job(
    session: SessionDep,
    id: uuid.UUID,
    current_user: CurrentUserOptional = None,
) -> Any:
    """
    Get detailed information about a single job post.
    """
    job = session.get(JobPost, id)
    if not job:
        raise HTTPException(status_code=404, detail="Job post not found")

    proposals_count_stmt = select(func.count()).where(Proposal.job_post_id == job.id)
    proposals_count = session.exec(proposals_count_stmt).one()

    is_saved = False
    has_applied = False
    if current_user:
        saved_row = session.exec(
            select(SavedJob).where(
                SavedJob.freelancer_id == current_user.id,
                SavedJob.job_post_id == job.id,
            )
        ).first()
        is_saved = saved_row is not None

        applied_row = session.exec(
            select(Proposal).where(
                Proposal.freelancer_id == current_user.id,
                Proposal.job_post_id == job.id,
            )
        ).first()
        has_applied = applied_row is not None

    skills_public = [
        SkillPublic.model_validate(skill) for skill in job.required_skills
    ]
    client_public = UserPublic.model_validate(job.client) if job.client else None
    client_company = (
        job.client.client_profile.company
        if job.client and job.client.client_profile
        else None
    )
    client_profile_public = None
    if job.client and job.client.client_profile:
        client_profile_public = ClientProfilePublic.model_validate(
            job.client.client_profile,
            update={
                "full_name": job.client.full_name,
                "avatar_url": job.client.avatar_url,
            },
        )

    return JobPostDetailPublic.model_validate(
        job,
        update={
            "client_name": job.client.full_name if job.client else None,
            "client_company": client_company,
            "skills": skills_public,
            "proposals_count": proposals_count,
            "is_saved": is_saved,
            "has_applied": has_applied,
            "client": client_public,
            "client_profile": client_profile_public,
        },
    )


@router.put("/{id}", response_model=JobPostPublic)
def update_job(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    job_in: JobPostUpdate,
) -> Any:
    """
    Update a job post. Only the job creator or a superuser can update.
    """
    job = session.get(JobPost, id)
    if not job:
        raise HTTPException(status_code=404, detail="Job post not found")
    if not current_user.is_superuser and (job.client_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    update_data = job_in.model_dump(exclude_unset=True, exclude={"skills"})
    if update_data:
        update_data["updated_at"] = datetime.now(UTC)
        job.sqlmodel_update(update_data)
        session.add(job)

    # Update skills if provided
    if job_in.skills is not None:
        # Clear existing links
        existing_links = session.exec(
            select(JobSkillLink).where(JobSkillLink.job_post_id == job.id)
        ).all()
        for link in existing_links:
            session.delete(link)

        # Add new links
        for skill_name in job_in.skills:
            skill = session.exec(select(Skill).where(Skill.name == skill_name)).first()
            if not skill:
                raise HTTPException(
                    status_code=404,
                    detail=f"Skill '{skill_name}' not found",
                )
            new_link = JobSkillLink(job_post_id=job.id, skill_id=skill.id)
            session.add(new_link)

    session.commit()
    session.refresh(job)

    proposals_count_stmt = select(func.count()).where(Proposal.job_post_id == job.id)
    proposals_count = session.exec(proposals_count_stmt).one()

    skills_public = [
        SkillPublic.model_validate(skill) for skill in job.required_skills
    ]

    return JobPostPublic.model_validate(
        job,
        update={
            "client_name": job.client.full_name if job.client else None,
            "skills": skills_public,
            "proposals_count": proposals_count,
            "is_saved": False,
            "has_applied": False,
        },
    )


@router.delete("/{id}")
def delete_job(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete a job post. Only the job creator or a superuser can delete.
    """
    job = session.get(JobPost, id)
    if not job:
        raise HTTPException(status_code=404, detail="Job post not found")
    if not current_user.is_superuser and (job.client_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    session.delete(job)
    session.commit()
    return Message(message="Job post deleted successfully")


@router.post("/{id}/save", response_model=Message)
def save_job(
    *, session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Bookmark / save a job post for the current authenticated freelancer.
    """
    if current_user.active_role != UserRole.FREELANCER and not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Only freelancers can save jobs",
        )

    job = session.get(JobPost, id)
    if not job:
        raise HTTPException(status_code=404, detail="Job post not found")

    existing = session.exec(
        select(SavedJob).where(
            SavedJob.freelancer_id == current_user.id,
            SavedJob.job_post_id == job.id,
        )
    ).first()

    if not existing:
        saved = SavedJob(freelancer_id=current_user.id, job_post_id=job.id)
        session.add(saved)
        session.commit()

    return Message(message="Job post saved successfully")


@router.delete("/{id}/save", response_model=Message)
def unsave_job(
    *, session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Remove a job post from bookmarks / saved jobs.
    """
    if current_user.active_role != UserRole.FREELANCER and not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Only freelancers can save or unsave jobs",
        )

    job = session.get(JobPost, id)
    if not job:
        raise HTTPException(status_code=404, detail="Job post not found")

    existing = session.exec(
        select(SavedJob).where(
            SavedJob.freelancer_id == current_user.id,
            SavedJob.job_post_id == job.id,
        )
    ).first()

    if existing:
        session.delete(existing)
        session.commit()

    return Message(message="Job post removed from saved")
