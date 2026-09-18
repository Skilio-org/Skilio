import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    FreelancerProfile,
    Message,
    Review,
    ReviewCreate,
    ReviewPublic,
    ReviewsPublic,
    ReviewUpdate,
    UserRole,
)

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("/", response_model=ReviewPublic)
def create_review(
    *, session: SessionDep, current_user: CurrentUser, review_in: ReviewCreate
) -> Any:
    """
    Create a review for a freelancer profile.
    Only clients can create reviews. A client cannot review their own profile.
    One review per client-freelancer pair (enforced by DB constraint).
    """
    if current_user.active_role != UserRole.CLIENT and not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Only clients can create reviews",
        )

    profile = session.get(FreelancerProfile, review_in.freelancer_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Freelancer profile not found")

    if profile.user_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot review your own profile",
        )

    review = Review(
        rating=review_in.rating,
        comment=review_in.comment,
        client_id=current_user.id,
        freelancer_id=review_in.freelancer_id,
    )
    session.add(review)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail="You have already reviewed this freelancer",
        )
    session.refresh(review)

    return ReviewPublic.model_validate(
        review,
        update={
            "client_name": current_user.full_name,
        },
    )


@router.get("/freelancer/{freelancer_id}", response_model=ReviewsPublic)
def list_reviews_for_freelancer(
    session: SessionDep,
    freelancer_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    List all reviews for a freelancer profile with pagination.
    Public endpoint — no authentication required.
    """
    profile = session.get(FreelancerProfile, freelancer_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Freelancer profile not found")

    count_statement = select(func.count()).where(Review.freelancer_id == freelancer_id)
    count = session.exec(count_statement).one()

    statement = (
        select(Review)
        .where(Review.freelancer_id == freelancer_id)
        .order_by(Review.created_at.desc())  # type: ignore
        .offset(skip)
        .limit(limit)
    )
    reviews = session.exec(statement).all()

    reviews_public = [
        ReviewPublic.model_validate(
            review,
            update={
                "client_name": review.client.full_name if review.client else None,
            },
        )
        for review in reviews
    ]

    return ReviewsPublic(data=reviews_public, count=count)


@router.get("/{id}", response_model=ReviewPublic)
def read_review(session: SessionDep, id: uuid.UUID) -> Any:
    """
    Get a single review by ID. Public endpoint.
    """
    review = session.get(Review, id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    return ReviewPublic.model_validate(
        review,
        update={
            "client_name": review.client.full_name if review.client else None,
        },
    )


@router.put("/{id}", response_model=ReviewPublic)
def update_review(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    review_in: ReviewUpdate,
) -> Any:
    """
    Update a review. Only the review author can update their own review.
    """
    review = session.get(Review, id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    update_data = review_in.model_dump(exclude_unset=True)
    if update_data:
        update_data["updated_at"] = datetime.now(UTC)
        review.sqlmodel_update(update_data)
        session.add(review)
        session.commit()
        session.refresh(review)

    return ReviewPublic.model_validate(
        review,
        update={
            "client_name": review.client.full_name if review.client else None,
        },
    )


@router.delete("/{id}")
def delete_review(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete a review. Only the review author or a superuser can delete.
    """
    review = session.get(Review, id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if not current_user.is_superuser and review.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    session.delete(review)
    session.commit()
    return Message(message="Review deleted successfully")
