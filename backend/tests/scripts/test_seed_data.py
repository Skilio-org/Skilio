import pytest
from sqlmodel import Session, select

from app.models import ClientProfile, FreelancerProfile, User
from app.seed_data import _parse_args, seed_accounts


def test_seed_accounts_creates_complete_profiles(db: Session) -> None:
    clients, freelancers = seed_accounts(db, clients=2, freelancers=2)

    assert (clients, freelancers) == (2, 2)
    seeded_clients = db.exec(
        select(ClientProfile)
        .join(User)
        .where(User.email.startswith("seed-client-"))
    ).all()
    assert len(seeded_clients) >= 2
    seeded_freelancers = db.exec(
        select(FreelancerProfile)
        .join(User)
        .where(User.email.startswith("seed-freelancer-"))
    ).all()
    assert len(seeded_freelancers) == 2
    assert all(profile.finished for profile in seeded_freelancers)
    assert all(len(profile.experiences) == 1 for profile in seeded_freelancers)
    assert all(len(profile.educations) == 1 for profile in seeded_freelancers)
    assert all(len(profile.portfolio_items) == 1 for profile in seeded_freelancers)


def test_seed_accounts_is_idempotent(db: Session) -> None:
    seed_accounts(db, clients=3, freelancers=3)
    assert seed_accounts(db, clients=3, freelancers=3) == (0, 0)
    seeded_users = db.exec(
        select(User).where(User.email.in_([
            "seed-client-3@example.com",
            "seed-freelancer-3@example.com",
        ]))
    ).all()
    assert len(seeded_users) == 2


def test_seed_count_is_limited() -> None:
    with pytest.raises(ValueError, match="between 0 and 500"):
        _parse_args(["501"])
