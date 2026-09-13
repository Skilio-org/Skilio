from sqlmodel import Session

from app.models import Review, UserRole
from tests.utils.profile import create_random_profile
from tests.utils.user import create_random_user


def create_random_review(db: Session) -> Review:
    """Create a random review with a fresh client user and freelancer profile."""
    client_user = create_random_user(db)
    client_user.role = UserRole.CLIENT
    db.add(client_user)
    db.commit()
    db.refresh(client_user)

    profile = create_random_profile(db)

    review = Review(
        rating=4,
        comment="Great freelancer, would hire again.",
        client_id=client_user.id,
        freelancer_id=profile.id,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review
