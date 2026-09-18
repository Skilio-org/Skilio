import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import col, func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    FreelancerProfile,
    FreelancerProfilePublic,
    JobPost,
    JobStatus,
    Message,
    Proposal,
    ProposalCreate,
    ProposalPublic,
    ProposalsPublic,
    ProposalStatus,
    ProposalStatusUpdate,
    Review,
    SkillPublic,
    UserPublic,
    UserRole,
)

router = APIRouter(prefix="/proposals", tags=["proposals"])


def _build_freelancer_profile_public(
    session: SessionDep, profile: FreelancerProfile | None
) -> FreelancerProfilePublic | None:
    if not profile:
        return None

    avg_rating_stmt = select(func.avg(Review.rating)).where(
        Review.freelancer_id == profile.id
    )
    reviews_count_stmt = select(func.count()).where(Review.freelancer_id == profile.id)
    avg_rating = session.exec(avg_rating_stmt).one()
    reviews_count = session.exec(reviews_count_stmt).one()

    skills_public = [SkillPublic.model_validate(skill) for skill in profile.skills]

    return FreelancerProfilePublic.model_validate(
        profile,
        update={
            "full_name": profile.user.full_name if profile.user else None,
            "average_rating": float(avg_rating) if avg_rating else None,
            "reviews_count": reviews_count,
            "skills": skills_public,
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
    if (
        current_user.active_role != UserRole.FREELANCER
        and not current_user.is_superuser
    ):
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

    existing = session.exec(
        select(Proposal).where(
            Proposal.job_post_id == proposal_in.job_post_id,
            Proposal.freelancer_id == current_user.id,
        )
    ).first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail="You have already submitted a proposal for this job",
        )

    proposal = Proposal(
        job_post_id=proposal_in.job_post_id,
        freelancer_id=current_user.id,
        cover_letter=proposal_in.cover_letter,
        status=ProposalStatus.PENDING,
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

    return ProposalPublic.model_validate(
        proposal,
        update={
            "freelancer": freelancer_public,
            "freelancer_profile": freelancer_profile_public,
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

    count_statement = select(func.count()).where(Proposal.job_post_id == job_id)
    count = session.exec(count_statement).one()

    statement = (
        select(Proposal)
        .where(Proposal.job_post_id == job_id)
        .order_by(col(Proposal.created_at).desc())
        .offset(skip)
        .limit(limit)
    )
    proposals = session.exec(statement).all()

    proposals_public = []
    for prop in proposals:
        freelancer_user = prop.freelancer
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
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    List all proposals submitted by the current authenticated freelancer.
    """
    count_statement = select(func.count()).where(
        Proposal.freelancer_id == current_user.id
    )
    count = session.exec(count_statement).one()

    statement = (
        select(Proposal)
        .where(Proposal.freelancer_id == current_user.id)
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

    freelancer_user = proposal.freelancer
    freelancer_public = (
        UserPublic.model_validate(freelancer_user) if freelancer_user else None
    )
    freelancer_profile_public = (
        _build_freelancer_profile_public(session, freelancer_user.freelancer_profile)
        if freelancer_user
        else None
    )

    return ProposalPublic.model_validate(
        proposal,
        update={
            "freelancer": freelancer_public,
            "freelancer_profile": freelancer_profile_public,
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
    if not job or (job.client_id != current_user.id and not current_user.is_superuser):
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
        _build_freelancer_profile_public(session, freelancer_user.freelancer_profile)
        if freelancer_user
        else None
    )

    return ProposalPublic.model_validate(
        proposal,
        update={
            "freelancer": freelancer_public,
            "freelancer_profile": freelancer_profile_public,
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

    if proposal.freelancer_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Only the proposing freelancer can withdraw this proposal",
        )

    session.delete(proposal)
    session.commit()
    return Message(message="Proposal withdrawn successfully")
