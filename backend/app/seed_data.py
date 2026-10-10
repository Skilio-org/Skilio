import argparse
import logging
import random
from collections.abc import Sequence

from sqlmodel import Session, select

from app import crud
from app.core.db import engine
from app.core.config import settings
from app.models import (
    BudgetType,
    ClientProfile,
    Education,
    Experience,
    FreelancerProfile,
    JobPost,
    JobStatus,
    PortfolioItem,
    User,
    UserCreate,
    UserRole,
)

MAX_ACCOUNTS = 500
DEFAULT_PASSWORD = "SeededAccount123!"
AVATAR_URL = settings.DEFAULT_AVATAR_URL

JOB_POST_TEMPLATES = (
    (
        "Build a responsive marketplace dashboard",
        "We need a polished dashboard for managing listings, users, and marketplace activity.",
        4200.0,
        "Web Mobile & Software Dev",
        ["React", "TypeScript", "FastAPI"],
    ),
    (
        "Design a brand identity for a new product",
        "Create a flexible visual identity with a logo, color system, typography, and usage guidance.",
        1800.0,
        "Design & Creative",
        ["Brand Design", "Figma", "Logo Design"],
    ),
    (
        "Set up analytics and reporting automation",
        "Connect our product data sources and build reliable weekly reports for the operations team.",
        2600.0,
        "Data Science & Analytics",
        ["Python", "Data Analysis", "SQL"],
    ),
    (
        "Write website copy for a SaaS launch",
        "Develop clear landing-page copy, feature descriptions, and customer-focused calls to action.",
        1200.0,
        "Writing",
        ["Copywriting", "Content Strategy", "SaaS"],
    ),
    (
        "Improve our customer support workflow",
        "Audit the current support process and recommend practical improvements to response times and quality.",
        1500.0,
        "Customer Service",
        ["Process Design", "Customer Support", "Operations"],
    ),
    (
        "Build an internal scheduling tool",
        "Create a simple scheduling experience with permissions, reminders, and calendar-friendly views.",
        3500.0,
        "Web Mobile & Software Dev",
        ["React", "PostgreSQL", "API Development"],
    ),
    (
        "Create social media campaign assets",
        "Produce a coordinated set of visual assets and short-form content for a product campaign.",
        900.0,
        "Sales & Marketing",
        ["Social Media", "Graphic Design", "Content Creation"],
    ),
    (
        "Review our cloud infrastructure",
        "Evaluate our deployment setup and provide a practical plan for reliability, security, and cost control.",
        2800.0,
        "Engineering & Architecture",
        ["AWS", "Docker", "DevOps"],
    ),
    (
        "Develop a financial planning model",
        "Build an easy-to-maintain financial model with assumptions, forecasts, and scenario comparisons.",
        2200.0,
        "Accounting & Consulting",
        ["Financial Modeling", "Excel", "Forecasting"],
    ),
    (
        "Migrate content to a new CMS",
        "Move our existing content into the new CMS while preserving structure, metadata, and search visibility.",
        1900.0,
        "Web Mobile & Software Dev",
        ["CMS", "Content Migration", "SEO"],
    ),
)

logger = logging.getLogger(__name__)


def _validate_count(value: int) -> int:
    if not 0 <= value <= MAX_ACCOUNTS:
        raise ValueError(f"account count must be between 0 and {MAX_ACCOUNTS}")
    return value


def _create_freelancer(session: Session, index: int) -> bool:
    email = f"seed-freelancer-{index}@example.com"
    user = session.exec(select(User).where(User.email == email)).first()
    if user is None:
        user = crud.create_user(
            session=session,
            user_create=UserCreate(
                email=email,
                password=DEFAULT_PASSWORD,
                full_name=f"Freelancer {index}",
                active_role=UserRole.FREELANCER,
            ),
        )
    else:
        logger.info("Freelancer user already exists: %s", email)
    user.avatar_url = AVATAR_URL

    existing_profile = session.exec(
        select(FreelancerProfile).where(FreelancerProfile.user_id == user.id)
    ).first()
    if existing_profile is not None:
        logger.info("Freelancer profile already exists for: %s", email)
        session.add(user)
        return False

    user.active_role = UserRole.FREELANCER
    session.add(user)
    session.flush()

    profile = FreelancerProfile(
        user_id=user.id,
        title="Full-stack software developer",
        bio=f"Experienced independent developer with a focus on product delivery ({index}).",
        hourly_rate=75.0,
        years_of_experience=5,
        is_available=True,
        availability="Available now",
        hours="30+ hours/week",
        category="Web Mobile & Software Dev",
        finished=True,
        location="Remote",
        timezone="UTC",
        languages="English",
        skills=["Python", "TypeScript", "FastAPI", "React"],
    )
    session.add(profile)
    session.flush()
    session.add(
        Experience(
            freelancer_profile_id=profile.id,
            title="Senior Software Developer",
            organization="Independent Studio",
            detail="Delivered production web applications from discovery through launch.",
        )
    )
    session.add(
        Education(
            freelancer_profile_id=profile.id,
            institution="Open Technology University",
            degree="BSc Computer Science",
            field_of_study="Software Engineering",
            start_date="2015",
            end_date="2019",
            description="Computer science and software engineering fundamentals.",
        )
    )
    session.add(
        PortfolioItem(
            freelancer_profile_id=profile.id,
            title="Operations dashboard",
            description="A responsive dashboard for managing distributed teams.",
            organization="Independent Studio",
            url="https://example.com/portfolio/operations-dashboard",
        )
    )
    return True


def _create_client(session: Session, index: int) -> bool:
    email = f"seed-client-{index}@example.com"
    user = session.exec(select(User).where(User.email == email)).first()
    if user is None:
        user = crud.create_user(
            session=session,
            user_create=UserCreate(
                email=email,
                password=DEFAULT_PASSWORD,
                full_name=f"Client {index}",
                active_role=UserRole.CLIENT,
            ),
        )
    else:
        logger.info("Client user already exists: %s", email)
    user.avatar_url = AVATAR_URL

    existing_profile = session.exec(
        select(ClientProfile).where(ClientProfile.user_id == user.id)
    ).first()
    if existing_profile is not None:
        logger.info("Client profile already exists for: %s", email)
        session.add(user)
        return False

    user.active_role = UserRole.CLIENT
    session.add(user)
    session.flush()
    session.add(
        ClientProfile(
            user_id=user.id,
            company=f"Seed Company {index}",
            company_role="Product Lead",
            company_website=f"https://company-{index}.example.com",
            company_size="11-50",
            location="Remote",
            description="A growing company looking for reliable product partners.",
        )
    )
    return True


def _create_job_posts(session: Session, client_ids: list[object]) -> int:
    if not client_ids:
        return 0

    created = 0
    for index, (title, description, budget, category, skills) in enumerate(
        JOB_POST_TEMPLATES, start=1
    ):
        seed_title = f"Seed Job {index}: {title}"
        existing = session.exec(select(JobPost).where(JobPost.title == seed_title)).first()
        if existing is not None:
            continue

        session.add(
            JobPost(
                title=seed_title,
                description=description,
                budget_type=BudgetType.FIXED,
                budget=budget,
                location="Remote",
                category=category,
                status=JobStatus.OPEN,
                skills=skills,
                client_id=random.choice(client_ids),
            )
        )
        created += 1

    session.flush()
    return created


def seed_accounts(
    session: Session, *, clients: int, freelancers: int
) -> tuple[int, int]:
    clients = _validate_count(clients)
    freelancers = _validate_count(freelancers)

    created_clients = sum(_create_client(session, index) for index in range(1, clients + 1))
    created_freelancers = sum(
        _create_freelancer(session, index) for index in range(1, freelancers + 1)
    )
    client_ids = list(
        session.exec(
            select(User.id).where(User.email.startswith("seed-client-"))
        ).all()
    )
    created_job_posts = _create_job_posts(session, client_ids)
    session.commit()
    logger.info("Created %s seeded job posts", created_job_posts)
    return created_clients, created_freelancers


def _parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create deterministic demo client and freelancer accounts."
    )
    parser.add_argument(
        "count",
        nargs="?",
        type=int,
        default=1,
        help="number of clients and freelancers to create (default: 1, max: 500)",
    )
    parser.add_argument("--clients", type=int, help="override the client count")
    parser.add_argument("--freelancers", type=int, help="override the freelancer count")
    args = parser.parse_args(argv)
    args.clients = args.count if args.clients is None else args.clients
    args.freelancers = args.count if args.freelancers is None else args.freelancers
    _validate_count(args.clients)
    _validate_count(args.freelancers)
    return args


def main(argv: Sequence[str] | None = None) -> None:
    args = _parse_args(argv)
    with Session(engine) as session:
        clients, freelancers = seed_accounts(
            session, clients=args.clients, freelancers=args.freelancers
        )
    logger.info("Created %s clients and %s freelancers", clients, freelancers)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print("def Password:            ", DEFAULT_PASSWORD)
    print("mail format[Client]:     seed-client-n@example.com")
    print("mail format[Freelancer]: seed-freelancer-n@example.com")
    main()