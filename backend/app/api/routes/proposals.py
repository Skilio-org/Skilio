import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload
from sqlmodel import col, func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    FreelancerProfile,
    FreelancerProfilePublic,
    JobPost,
    JobPostPublic,
    JobStatus,
    Message,
    Proposal,
    ProposalCreate,
    ProposalPublic,
    ProposalUpdate,
    ProposalsPublic,
    ProposalStatus,
    ProposalStatusUpdate,
    Review,
    User,
    UserPublic,
    UserRole,
)

router = APIRouter(prefix="/proposals", tags=["proposals"])


def _build_job_post_public(job: JobPost | None) -> JobPostPublic | None:
    if not job:
        return None
    client_company = (
        job.client.client_profile.company
        if job.client and job.client.client_profile
        else None
    )
    return JobPostPublic.model_validate(
        job,
        update={
            "client_name": job.client.full_name if job.client else None,
            "client_company": client_company,
            "skills": job.skills or [],
        },
    )


def _build_freelancer_profile_public(
    session: SessionDep,
    profile: FreelancerProfile | None,
    avg_rating: float | None = None,
    reviews_count: int | None = None,
) -> FreelancerProfilePublic | None:
    if not profile:
        return None

    if reviews_count is None:
        avg_rating_stmt = select(func.avg(Review.rating)).where(
            Review.freelancer_id == profile.id
        )
        reviews_count_stmt = select(func.count()).where(Review.freelancer_id == profile.id)
        raw_avg = session.exec(avg_rating_stmt).one()
        reviews_count = session.exec(reviews_count_stmt).one()
        avg_rating = float(raw_avg) if raw_avg is not None else None

    skills = profile.skills or []

    return FreelancerProfilePublic.model_validate(
        profile,
        update={
            "full_name": profile.user.full_name if profile.user else None,
            "average_rating": avg_rating,
            "reviews_count": reviews_count,
            "skills": skills,
            "skill_names": skills,
            "is_saved": False,
        },
    )


@router.post("/", response_model=ProposalPublic)
def submit_proposal(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    proposal_in: ProposalCreate,
) -> Any:
    """
    Submit a proposal for a job post ("Apply" action).
    Only freelancers can submit proposals.
    The job must be OPEN and not owned by the proposing user.
    """
    if current_user.active_role != UserRole.FREELANCER and not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Only freelancers can submit proposals",
        )

    job = session.get(JobPost, proposal_in.job_post_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job post not found")

    if job.status != JobStatus.OPEN:
        raise HTTPException(
            status_code=400,
            detail="Cannot submit proposal to a closed job",
        )

    if job.client_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot submit a proposal to your own job",
        )

    target_status = proposal_in.status or ProposalStatus.PENDING

    existing = session.exec(
        select(Proposal).where(
            Proposal.job_post_id == proposal_in.job_post_id,
            Proposal.freelancer_id == current_user.id,
        )
    ).first()
    if existing:
        if existing.status == ProposalStatus.DRAFT:
            existing.cover_letter = proposal_in.cover_letter
            existing.status = target_status
            existing.updated_at = datetime.now(UTC)
            session.add(existing)
            session.commit()
            session.refresh(existing)
            proposal = existing
        else:
            raise HTTPException(
                status_code=409,
                detail="You have already submitted a proposal for this job",
            )
    else:
        proposal = Proposal(
            job_post_id=proposal_in.job_post_id,
            freelancer_id=current_user.id,
            cover_letter=proposal_in.cover_letter,
            status=target_status,
        )
        session.add(proposal)
        try:
            session.commit()
        except IntegrityError:
            session.rollback()
            raise HTTPException(
                status_code=409,
                detail="You have already submitted a proposal for this job",
            )
        session.refresh(proposal)

    freelancer_public = UserPublic.model_validate(current_user)
    freelancer_profile_public = _build_freelancer_profile_public(
        session, current_user.freelancer_profile
    )
    job_post_public = _build_job_post_public(job)

    return ProposalPublic.model_validate(
        proposal,
        update={
            "freelancer": freelancer_public,
            "freelancer_profile": freelancer_profile_public,
            "job_post": job_post_public,
        },
    )


@router.get("/job/{job_id}", response_model=ProposalsPublic)
def read_proposals_for_job(
    session: SessionDep,
    current_user: CurrentUser,
    job_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    List all proposals submitted for a specific job post.
    Only the job owner (client) or a superuser can access this list.
    """
    job = session.get(JobPost, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job post not found")

    if not current_user.is_superuser and job.client_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions to view proposals for this job",
        )

    count_statement = select(func.count()).where(
        Proposal.job_post_id == job_id,
        Proposal.status != ProposalStatus.DRAFT,
    )
    count = session.exec(count_statement).one()

    statement = (
        select(Proposal)
        .where(
            Proposal.job_post_id == job_id,
            Proposal.status != ProposalStatus.DRAFT,
        )
        .options(
            joinedload(Proposal.freelancer)  # type: ignore[arg-type]
            .joinedload(User.freelancer_profile),  # type: ignore[arg-type]
        )
        .order_by(col(Proposal.created_at).desc())
        .offset(skip)
        .limit(limit)
    )
    proposals = session.exec(statement).all()

    # Pre-fetch review statistics for all candidate profiles in a single batch query
    profile_ids = [
        p.freelancer.freelancer_profile.id
        for p in proposals
        if p.freelancer and p.freelancer.freelancer_profile
    ]
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

    proposals_public = []
    for prop in proposals:
        freelancer_user = prop.freelancer
        freelancer_public = (
            UserPublic.model_validate(freelancer_user) if freelancer_user else None
        )
        profile = (
            freelancer_user.freelancer_profile if freelancer_user else None
        )
        avg_r, r_cnt = stats_map.get(profile.id, (None, 0)) if profile else (None, 0)
        freelancer_profile_public = (
            _build_freelancer_profile_public(
                session,
                profile,
                avg_rating=avg_r,
                reviews_count=r_cnt,
            )
            if profile
            else None
        )

        proposals_public.append(
            ProposalPublic.model_validate(
                prop,
                update={
                    "freelancer": freelancer_public,
                    "freelancer_profile": freelancer_profile_public,
                },
            )
        )

    return ProposalsPublic(data=proposals_public, count=count)


@router.get("/me", response_model=ProposalsPublic)
def read_my_proposals(
    session: SessionDep,
    current_user: CurrentUser,
    status: ProposalStatus | None = None,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    List all proposals submitted by the current authenticated freelancer.
    Supports filtering by status (e.g. ?status=draft or ?status=pending).
    """
    base_filters = [Proposal.freelancer_id == current_user.id]
    if status is not None:
        base_filters.append(Proposal.status == status)

    count_statement = select(func.count()).where(*base_filters)
    count = session.exec(count_statement).one()

    statement = (
        select(Proposal)
        .where(*base_filters)
        .options(
            joinedload(Proposal.job_post).joinedload(JobPost.client).joinedload(User.client_profile)  # type: ignore[arg-type]
        )
        .order_by(col(Proposal.created_at).desc())
        .offset(skip)
        .limit(limit)
    )
    proposals = session.exec(statement).all()

    freelancer_public = UserPublic.model_validate(current_user)
    freelancer_profile_public = _build_freelancer_profile_public(
        session, current_user.freelancer_profile
    )

    proposals_public = [
        ProposalPublic.model_validate(
            prop,
            update={
                "freelancer": freelancer_public,
                "freelancer_profile": freelancer_profile_public,
                "job_post": _build_job_post_public(prop.job_post),
            },
        )
        for prop in proposals
    ]

    return ProposalsPublic(data=proposals_public, count=count)


@router.get("/{id}", response_model=ProposalPublic)
def read_proposal(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
) -> Any:
    """
    Get single proposal details.
    Only the proposing freelancer, the job owner client, or a superuser can access.
    Clients cannot access draft proposals.
    """
    proposal = session.get(Proposal, id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    is_freelancer = proposal.freelancer_id == current_user.id
    is_client_owner = (
        proposal.job_post and proposal.job_post.client_id == current_user.id
    )

    if not (is_freelancer or is_client_owner or current_user.is_superuser):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    if is_client_owner and not is_freelancer and not current_user.is_superuser:
        if proposal.status == ProposalStatus.DRAFT:
            raise HTTPException(status_code=404, detail="Proposal not found")

    freelancer_user = proposal.freelancer
    freelancer_public = (
        UserPublic.model_validate(freelancer_user) if freelancer_user else None
    )
    freelancer_profile_public = (
        _build_freelancer_profile_public(
            session, freelancer_user.freelancer_profile
        )
        if freelancer_user
        else None
    )

    return ProposalPublic.model_validate(
        proposal,
        update={
            "freelancer": freelancer_public,
            "freelancer_profile": freelancer_profile_public,
            "job_post": _build_job_post_public(proposal.job_post),
        },
    )


@router.put("/{id}", response_model=ProposalPublic)
def update_proposal(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    proposal_in: ProposalUpdate,
) -> Any:
    """
    Update a proposal or draft (cover letter and/or status).
    Only the proposing freelancer or a superuser can update it.
    Accepted or rejected proposals cannot be edited.
    """
    proposal = session.get(Proposal, id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    if proposal.freelancer_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Only the proposing freelancer can update this proposal",
        )

    if proposal.status in (ProposalStatus.ACCEPTED, ProposalStatus.REJECTED):
        raise HTTPException(
            status_code=400,
            detail="Cannot update an accepted or rejected proposal",
        )

    if proposal_in.cover_letter is not None:
        proposal.cover_letter = proposal_in.cover_letter
    if proposal_in.status is not None:
        if (
            proposal_in.status in (ProposalStatus.ACCEPTED, ProposalStatus.REJECTED)
            and not current_user.is_superuser
        ):
            raise HTTPException(
                status_code=403,
                detail="Freelancers cannot accept or reject proposals",
            )
        proposal.status = proposal_in.status

    proposal.updated_at = datetime.now(UTC)
    session.add(proposal)
    session.commit()
    session.refresh(proposal)

    freelancer_user = proposal.freelancer
    freelancer_public = (
        UserPublic.model_validate(freelancer_user) if freelancer_user else None
    )
    freelancer_profile_public = (
        _build_freelancer_profile_public(
            session, freelancer_user.freelancer_profile
        )
        if freelancer_user
        else None
    )

    return ProposalPublic.model_validate(
        proposal,
        update={
            "freelancer": freelancer_public,
            "freelancer_profile": freelancer_profile_public,
            "job_post": _build_job_post_public(proposal.job_post),
        },
    )


@router.put("/{id}/status", response_model=ProposalPublic)
def update_proposal_status(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    status_in: ProposalStatusUpdate,
) -> Any:
    """
    Update proposal status (e.g. ACCEPTED or REJECTED).
    Only the job owner (client) or a superuser can update the proposal status.
    """
    proposal = session.get(Proposal, id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    job = proposal.job_post
    if not job or (
        job.client_id != current_user.id and not current_user.is_superuser
    ):
        raise HTTPException(
            status_code=403,
            detail="Only the job owner can update the proposal status",
        )

    proposal.status = status_in.status
    proposal.updated_at = datetime.now(UTC)
    session.add(proposal)
    session.commit()
    session.refresh(proposal)

    freelancer_user = proposal.freelancer
    freelancer_public = (
        UserPublic.model_validate(freelancer_user) if freelancer_user else None
    )
    freelancer_profile_public = (
        _build_freelancer_profile_public(
            session, freelancer_user.freelancer_profile
        )
        if freelancer_user
        else None
    )

    return ProposalPublic.model_validate(
        proposal,
        update={
            "freelancer": freelancer_public,
            "freelancer_profile": freelancer_profile_public,
            "job_post": _build_job_post_public(proposal.job_post),
        },
    )


@router.delete("/{id}")
def withdraw_proposal(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
) -> Message:
    """
    Withdraw / delete a proposal.
    Only the proposing freelancer or a superuser can withdraw the proposal.
    """
    proposal = session.get(Proposal, id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    if (
        proposal.freelancer_id != current_user.id
        and not current_user.is_superuser
    ):
        raise HTTPException(
            status_code=403,
            detail="Only the proposing freelancer can withdraw this proposal",
        )

    session.delete(proposal)
    session.commit()
    return Message(message="Proposal withdrawn successfully")
