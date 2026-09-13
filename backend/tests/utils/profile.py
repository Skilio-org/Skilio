from sqlmodel import Session

from app.models import (
    FreelancerProfile,
    UserRole,
)
from tests.utils.user import create_random_user
from tests.utils.utils import random_lower_string


def create_random_profile(db: Session) -> FreelancerProfile:
    user = create_random_user(db)
    user.role = UserRole.FREELANCER
    db.add(user)
    db.commit()
    db.refresh(user)

    profile = FreelancerProfile(
        user_id=user.id,
        title=random_lower_string(),
        bio=random_lower_string(),
        hourly_rate=50.0,
        years_of_experience=3,
        is_available=True,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile
