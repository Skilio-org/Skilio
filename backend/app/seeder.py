"""
Skilio Moroccan Seeder Script
Supports both 'local' and 'prod' environments:
Usage:
    ./seeder local
    ./seeder prod
    uv run python -m app.seeder local
    uv run python -m app.seeder prod [--clean] [--dry-run]
"""

import argparse
import logging
import os
from collections.abc import Sequence

from sqlmodel import Session, delete, select

from app.core.db import engine
from app.core.security import get_password_hash
from app.models import (
    ClientProfile,
    Education,
    Experience,
    FreelancerProfile,
    JobPost,
    JobStatus,
    PortfolioItem,
    Review,
    User,
    UserRole,
)
from app.seed_morocco_data import (
    CLIENTS_DATA,
    FREELANCERS_DATA,
    JOBS_DATA,
    REVIEWS_TEMPLATES,
    detect_gender,
    get_avatar,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("seeder")

DEFAULT_LOCAL_PASSWORD = os.getenv("LOCAL_SEED_PASSWORD", "SkilioLocal123!")
DEFAULT_PROD_PASSWORD = os.getenv("PROD_SEED_PASSWORD", "SkilioProd2026!")


def get_email_domain(mode: str) -> str:
    if mode == "prod":
        return os.getenv("PROD_SEED_DOMAIN", "skilio.ma")
    return os.getenv("LOCAL_SEED_DOMAIN", "dev.skilio.ma")


def clean_seeded_data(session: Session, email_domain: str) -> None:
    """Safely remove previous seeded data matching the domain."""
    logger.info("Cleaning previous seeded data...")
    # Clean both current domain and legacy dev domains
    domains_to_clean = [email_domain, "skilio.local", "dev.skilio.ma", "skilio.ma"]
    for dom in set(domains_to_clean):
        seeded_users = session.exec(
            select(User).where(User.email.endswith(f"@{dom}"))
        ).all()
        user_ids = [u.id for u in seeded_users]
        if user_ids:
            # Cascades will handle client profiles, freelancer profiles, jobs, reviews
            session.exec(delete(User).where(User.id.in_(user_ids)))
            session.commit()
            logger.info("Removed %s previous seeded users for @%s.", len(user_ids), dom)


def seed_database(
    session: Session,
    *,
    mode: str,
    count: int = 50,
    dry_run: bool = False,
    clean: bool = False,
) -> dict[str, int]:
    email_domain = get_email_domain(mode)
    password = DEFAULT_PROD_PASSWORD if mode == "prod" else DEFAULT_LOCAL_PASSWORD

    logger.info("=" * 65)
    logger.info("SKILIO MOROCCAN SEEDER — MODE: %s", mode.upper())
    logger.info("Target: %s Freelancers | %s Clients | %s Jobs", count, count, count)
    logger.info("Email Domain: @%s", email_domain)
    logger.info("Dry Run: %s", dry_run)
    logger.info("=" * 65)

    if clean and not dry_run:
        clean_seeded_data(session, email_domain)

    # 1. Single-pass password hash for performance
    logger.info("Generating password hash (single-pass)...")
    hashed_password = get_password_hash(password)

    stats = {
        "clients_created": 0,
        "clients_existing": 0,
        "freelancers_created": 0,
        "freelancers_existing": 0,
        "jobs_created": 0,
        "jobs_existing": 0,
        "reviews_created": 0,
        "reviews_existing": 0,
    }

    # 2. Seed Clients & Client Profiles
    logger.info("Seeding %s Moroccan Client Companies...", count)
    client_users: list[User] = []

    for i in range(min(count, len(CLIENTS_DATA))):
        c_data = CLIENTS_DATA[i]
        slug = c_data["slug"].replace("-", ".")
        email = f"client.{slug}@{email_domain}"
        gender = c_data.get("gender") or detect_gender(c_data["contact_name"])
        avatar_url = get_avatar(gender=gender, index=i)

        user = session.exec(select(User).where(User.email == email)).first()
        if user is None:
            user = User(
                email=email,
                hashed_password=hashed_password,
                full_name=c_data["contact_name"],
                active_role=UserRole.CLIENT,
                is_email_verified=True,
                is_active=True,
                avatar_url=avatar_url,
            )
            session.add(user)
            session.flush()
            stats["clients_created"] += 1
        else:
            if user.avatar_url != avatar_url:
                user.avatar_url = avatar_url
                session.add(user)
                session.flush()
            stats["clients_existing"] += 1

        client_profile = session.exec(
            select(ClientProfile).where(ClientProfile.user_id == user.id)
        ).first()
        if client_profile is None:
            client_profile = ClientProfile(
                avatar_url=avatar_url,
                user_id=user.id,
                company=c_data["company"],
                company_role=c_data["role"],
                company_size=c_data["size"],
                company_website=c_data["website"],
                location=c_data["location"],
                description=c_data["description"],
            )
            session.add(client_profile)
            session.flush()

        client_users.append(user)

    # 3. Seed Freelancers, Profiles, Experiences, Educations, Portfolios
    logger.info("Seeding %s Moroccan Freelancers & Profiles...", count)
    freelancer_profiles: list[FreelancerProfile] = []

    for i in range(min(count, len(FREELANCERS_DATA))):
        f_data = FREELANCERS_DATA[i]
        slug = f_data["slug"].replace("-", ".")
        email = f"freelancer.{slug}@{email_domain}"
        gender = f_data.get("gender") or detect_gender(f_data["full_name"])
        avatar_url = get_avatar(gender=gender, index=i + 5)

        user = session.exec(select(User).where(User.email == email)).first()
        if user is None:
            user = User(
                email=email,
                hashed_password=hashed_password,
                full_name=f_data["full_name"],
                active_role=UserRole.FREELANCER,
                is_email_verified=True,
                is_active=True,
                avatar_url=avatar_url,
            )
            session.add(user)
            session.flush()
            stats["freelancers_created"] += 1
        else:
            if user.avatar_url != avatar_url:
                user.avatar_url = avatar_url
                session.add(user)
                session.flush()
            stats["freelancers_existing"] += 1

        profile = session.exec(
            select(FreelancerProfile).where(FreelancerProfile.user_id == user.id)
        ).first()
        if profile is None:
            profile = FreelancerProfile(
                avatar_url=avatar_url,
                user_id=user.id,
                title=f_data["title"],
                bio=f_data["bio"],
                hourly_rate=f_data["hourly_rate"],
                years_of_experience=f_data["years_of_experience"],
                is_available=True,
                availability=f_data["availability"],
                hours=f_data["hours"],
                category=f_data["category"],
                finished=True,
                location=f_data["location"],
                timezone=f_data["timezone"],
                languages=f_data["languages"],
                skills=f_data["skills"],
            )
            session.add(profile)
            session.flush()

            # Add Experience
            exp_data = f_data["experience"]
            session.add(
                Experience(
                    freelancer_profile_id=profile.id,
                    title=exp_data["title"],
                    organization=exp_data["organization"],
                    detail=exp_data["detail"],
                )
            )

            # Add Education
            edu_data = f_data["education"]
            session.add(
                Education(
                    freelancer_profile_id=profile.id,
                    institution=edu_data["institution"],
                    degree=edu_data["degree"],
                    field_of_study=edu_data["field_of_study"],
                    start_date=edu_data["start_date"],
                    end_date=edu_data["end_date"],
                    description=edu_data["description"],
                )
            )

            # Add Portfolio
            port_data = f_data["portfolio"]
            session.add(
                PortfolioItem(
                    freelancer_profile_id=profile.id,
                    title=port_data["title"],
                    description=port_data["description"],
                    organization=port_data["organization"],
                    url=port_data["url"],
                )
            )
            session.flush()

        freelancer_profiles.append(profile)

    # 4. Seed 50 Job Postings (1:1 with Clients)
    logger.info("Seeding %s Moroccan Job Posts...", count)
    for i in range(min(count, len(JOBS_DATA))):
        j_data = JOBS_DATA[i]
        client_user = client_users[i % len(client_users)]

        existing_job = session.exec(
            select(JobPost).where(
                JobPost.client_id == client_user.id,
                JobPost.title == j_data["title"],
            )
        ).first()

        if existing_job is None:
            job = JobPost(
                client_id=client_user.id,
                title=j_data["title"],
                description=j_data["description"],
                budget_type=j_data["budget_type"],
                budget=j_data["budget"],
                location=j_data["location"],
                category=j_data["category"],
                status=JobStatus.OPEN if i % 10 != 0 else JobStatus.CLOSED,
                skills=j_data["skills"],
            )
            session.add(job)
            stats["jobs_created"] += 1
        else:
            stats["jobs_existing"] += 1

    session.flush()

    # 5. Seed Client -> Freelancer Reviews
    logger.info("Seeding Inter-Entity Client Reviews...")
    for client_idx, freelancer_idx, rating, comment in REVIEWS_TEMPLATES:
        if len(comment) > 200 or client_idx >= len(client_users) or freelancer_idx >= len(freelancer_profiles):
            continue

        c_user = client_users[client_idx]
        f_prof = freelancer_profiles[freelancer_idx]

        existing_review = session.exec(
            select(Review).where(
                Review.client_id == c_user.id,
                Review.freelancer_id == f_prof.id,
            )
        ).first()

        if existing_review is None:
            review = Review(
                client_id=c_user.id,
                freelancer_id=f_prof.id,
                rating=rating,
                comment=comment,
            )
            session.add(review)
            stats["reviews_created"] += 1
        else:
            stats["reviews_existing"] += 1

    session.flush()

    if dry_run:
        logger.info("DRY RUN: Rolling back transaction without persisting changes.")
        session.rollback()
    else:
        session.commit()
        logger.info("SUCCESS: All changes committed to database!")

    logger.info("=" * 65)
    logger.info("SEEDING SUMMARY:")
    logger.info("  Clients:     %s created, %s existing", stats["clients_created"], stats["clients_existing"])
    logger.info("  Freelancers: %s created, %s existing", stats["freelancers_created"], stats["freelancers_existing"])
    logger.info("  Job Posts:   %s created, %s existing", stats["jobs_created"], stats["jobs_existing"])
    logger.info("  Reviews:     %s created, %s existing", stats["reviews_created"], stats["reviews_existing"])
    logger.info("  Login Password: %s", password)
    logger.info("=" * 65)

    return stats


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Skilio Moroccan Platform Seeder for Local Development & Production."
    )
    parser.add_argument(
        "environment",
        nargs="?",
        default="local",
        choices=["local", "dev", "development", "prod", "production"],
        help="Target environment ('local' or 'prod')",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=50,
        help="Number of records to seed (default: 50, max: 50)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Run without committing changes to database",
    )
    parser.add_argument(
        "--clean",
        action="store_true",
        help="Purge previously seeded accounts for the chosen environment before seeding",
    )
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> None:
    args = parse_args(argv)
    mode = "prod" if args.environment in ("prod", "production") else "local"

    if mode == "prod" and not args.dry_run:
        logger.warning("ATTENTION: You are about to run the seeder against PRODUCTION.")
        logger.warning(
            "Database URL: %s", engine.url.render_as_string(hide_password=True)
        )

    with Session(engine) as session:
        seed_database(
            session,
            mode=mode,
            count=min(args.count, 50),
            dry_run=args.dry_run,
            clean=args.clean,
        )


if __name__ == "__main__":
    main()
