from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.core.security import get_password_hash
from app.models import UserRole
from tests.utils.profile import create_random_profile
from tests.utils.user import create_random_user, user_authentication_headers
from tests.utils.utils import random_lower_string


def _make_client_headers(client: TestClient, db: Session) -> tuple[dict[str, str], any]:
    user = create_random_user(db)
    user.active_role = UserRole.CLIENT
    user.full_name = "Client Tester"
    password = random_lower_string()
    user.hashed_password = get_password_hash(password)
    db.add(user)
    db.commit()
    db.refresh(user)
    headers = user_authentication_headers(client=client, email=user.email, password=password)
    return headers, user


def _make_freelancer_headers(client: TestClient, db: Session) -> tuple[dict[str, str], any]:
    user = create_random_user(db)
    user.active_role = UserRole.FREELANCER
    user.full_name = "Freelancer Tester"
    password = random_lower_string()
    user.hashed_password = get_password_hash(password)
    db.add(user)
    db.commit()
    db.refresh(user)
    headers = user_authentication_headers(client=client, email=user.email, password=password)
    return headers, user


# ==============================================================================
# 1. Profile Freelancer Setup Validations
# ==============================================================================


def test_freelancer_full_name_validation(client: TestClient, db: Session) -> None:
    headers, _ = _make_freelancer_headers(client, db)
    # Exceeds 100 chars
    long_name = "A" * 101
    resp = client.put(
        f"{settings.API_V1_STR}/profiles/me",
        headers=headers,
        json={"full_name": long_name},
    )
    assert resp.status_code == 422


def test_freelancer_title_validation(client: TestClient, db: Session) -> None:
    headers, _ = _make_freelancer_headers(client, db)
    # Exceeds 100 chars
    long_title = "T" * 101
    resp = client.put(
        f"{settings.API_V1_STR}/profiles/me",
        headers=headers,
        json={"title": long_title},
    )
    assert resp.status_code == 422


def test_freelancer_skills_validation(client: TestClient, db: Session) -> None:
    headers, _ = _make_freelancer_headers(client, db)
    # More than 15 skills
    too_many_skills = [f"Skill {i}" for i in range(16)]
    resp = client.put(
        f"{settings.API_V1_STR}/profiles/me",
        headers=headers,
        json={"skills": too_many_skills},
    )
    assert resp.status_code == 422

    # Skill exceeding 40 chars
    long_skill = ["A" * 41]
    resp2 = client.put(
        f"{settings.API_V1_STR}/profiles/me",
        headers=headers,
        json={"skills": long_skill},
    )
    assert resp2.status_code == 422


def test_freelancer_bio_length_validation(client: TestClient, db: Session) -> None:
    headers, _ = _make_freelancer_headers(client, db)
    # Less than 80 chars
    short_bio = "Too short bio"
    resp = client.put(
        f"{settings.API_V1_STR}/profiles/me",
        headers=headers,
        json={"bio": short_bio},
    )
    assert resp.status_code == 422

    # More than 3000 chars
    long_bio = "B" * 3001
    resp2 = client.put(
        f"{settings.API_V1_STR}/profiles/me",
        headers=headers,
        json={"bio": long_bio},
    )
    assert resp2.status_code == 422

    # Valid bio (80-3000)
    valid_bio = "This is a valid freelancer biography that has well over eighty characters in length to test properly."
    resp3 = client.put(
        f"{settings.API_V1_STR}/profiles/me",
        headers=headers,
        json={"bio": valid_bio},
    )
    assert resp3.status_code == 200


def test_freelancer_rates_validation(client: TestClient, db: Session) -> None:
    headers, _ = _make_freelancer_headers(client, db)
    # Rate below 10
    resp_low = client.put(
        f"{settings.API_V1_STR}/profiles/me",
        headers=headers,
        json={"hourly_rate": 5.0},
    )
    assert resp_low.status_code == 422

    # Rate above 5000
    resp_high = client.put(
        f"{settings.API_V1_STR}/profiles/me",
        headers=headers,
        json={"hourly_rate": 5001.0},
    )
    assert resp_high.status_code == 422


def test_freelancer_completion_required_fields(client: TestClient, db: Session) -> None:
    headers, _ = _make_freelancer_headers(client, db)
    # Try to mark finished=True without required title / bio / hours / rate
    resp = client.put(
        f"{settings.API_V1_STR}/profiles/me",
        headers=headers,
        json={"finished": True, "title": ""},
    )
    assert resp.status_code == 400


def test_freelancer_work_experience_validation(client: TestClient, db: Session) -> None:
    headers, _ = _make_freelancer_headers(client, db)
    # Title exceeding 100
    resp = client.post(
        f"{settings.API_V1_STR}/profiles/me/experiences",
        headers=headers,
        json={"title": "J" * 101, "organization": "Company", "detail": "Description"},
    )
    assert resp.status_code == 422

    # Organization exceeding 100
    resp2 = client.post(
        f"{settings.API_V1_STR}/profiles/me/experiences",
        headers=headers,
        json={"title": "Developer", "organization": "O" * 101, "detail": "Description"},
    )
    assert resp2.status_code == 422

    # Detail exceeding 1000
    resp3 = client.post(
        f"{settings.API_V1_STR}/profiles/me/experiences",
        headers=headers,
        json={"title": "Developer", "organization": "Company", "detail": "D" * 1001},
    )
    assert resp3.status_code == 422


def test_freelancer_education_validation(client: TestClient, db: Session) -> None:
    headers, _ = _make_freelancer_headers(client, db)
    # Degree exceeding 100
    resp = client.post(
        f"{settings.API_V1_STR}/profiles/me/educations",
        headers=headers,
        json={"degree": "D" * 101, "institution": "School"},
    )
    assert resp.status_code == 422

    # Institution exceeding 100
    resp2 = client.post(
        f"{settings.API_V1_STR}/profiles/me/educations",
        headers=headers,
        json={"degree": "B.Sc", "institution": "S" * 101},
    )
    assert resp2.status_code == 422

    # Description exceeding 1000
    resp3 = client.post(
        f"{settings.API_V1_STR}/profiles/me/educations",
        headers=headers,
        json={"degree": "B.Sc", "institution": "School", "description": "X" * 1001},
    )
    assert resp3.status_code == 422


def test_freelancer_portfolio_validation(client: TestClient, db: Session) -> None:
    headers, _ = _make_freelancer_headers(client, db)
    # Invalid non-https url
    resp = client.post(
        f"{settings.API_V1_STR}/profiles/me/portfolio",
        headers=headers,
        json={"title": "App", "url": "http://insecure.example.com"},
    )
    assert resp.status_code == 422

    # Title exceeding 100
    resp2 = client.post(
        f"{settings.API_V1_STR}/profiles/me/portfolio",
        headers=headers,
        json={"title": "P" * 101},
    )
    assert resp2.status_code == 422

    # Detail exceeding 1000
    resp3 = client.post(
        f"{settings.API_V1_STR}/profiles/me/portfolio",
        headers=headers,
        json={"title": "App", "detail": "P" * 1001},
    )
    assert resp3.status_code == 422


def test_avatar_upload_size_limit(client: TestClient, db: Session) -> None:
    headers, _ = _make_freelancer_headers(client, db)
    # File larger than 5MB (5MB + 1 byte)
    too_large_bytes = b"0" * (5 * 1024 * 1024 + 1)
    resp = client.post(
        f"{settings.API_V1_STR}/users/me/avatar",
        headers=headers,
        files={"file": ("avatar.jpg", too_large_bytes, "image/jpeg")},
    )
    assert resp.status_code == 413


def test_portfolio_upload_size_limit(client: TestClient, db: Session) -> None:
    headers, _ = _make_freelancer_headers(client, db)
    too_large_bytes = b"0" * (5 * 1024 * 1024 + 1)
    resp = client.post(
        f"{settings.API_V1_STR}/profiles/me/portfolio/upload",
        headers=headers,
        data={"title": "My Project", "description": "Project description"},
        files={"file": ("project.jpg", too_large_bytes, "image/jpeg")},
    )
    assert resp.status_code == 413


# ==============================================================================
# 2. Client Profile Validations
# ==============================================================================


def test_client_profile_validations(client: TestClient, db: Session) -> None:
    headers, _ = _make_client_headers(client, db)

    # Missing full name
    resp1 = client.put(
        f"{settings.API_V1_STR}/client-profiles/me",
        headers=headers,
        json={
            "full_name": "",
            "company_role": "CEO",
            "location": "Casablanca",
            "company_size": "2-10",
        },
    )
    assert resp1.status_code == 400

    # Missing role
    resp2 = client.put(
        f"{settings.API_V1_STR}/client-profiles/me",
        headers=headers,
        json={
            "full_name": "John Client",
            "company_role": "",
            "location": "Casablanca",
            "company_size": "2-10",
        },
    )
    assert resp2.status_code == 400

    # Missing location
    resp3 = client.put(
        f"{settings.API_V1_STR}/client-profiles/me",
        headers=headers,
        json={
            "full_name": "John Client",
            "company_role": "Manager",
            "location": "",
            "company_size": "2-10",
        },
    )
    assert resp3.status_code == 400

    # Invalid company size
    resp4 = client.put(
        f"{settings.API_V1_STR}/client-profiles/me",
        headers=headers,
        json={
            "full_name": "John Client",
            "company_role": "Manager",
            "location": "Casablanca",
            "company_size": "invalid-size",
        },
    )
    assert resp4.status_code == 422

    # Non-https company website
    resp5 = client.put(
        f"{settings.API_V1_STR}/client-profiles/me",
        headers=headers,
        json={
            "full_name": "John Client",
            "company_role": "Manager",
            "location": "Casablanca",
            "company_size": "2-10",
            "company_website": "http://insecure-site.com",
        },
    )
    assert resp5.status_code == 422


# ==============================================================================
# 3. Job Post Validations
# ==============================================================================


def test_job_post_title_limit(client: TestClient, db: Session) -> None:
    headers, _ = _make_client_headers(client, db)
    # Title > 100 chars
    resp = client.post(
        f"{settings.API_V1_STR}/jobs/",
        headers=headers,
        json={
            "title": "T" * 101,
            "description": "Experience level: Intermediate\n\nValid description with enough characters to pass minimum length verification requirements.",
            "budget_type": "fixed",
            "budget": 500.0,
            "level": "Intermediate",
        },
    )
    assert resp.status_code == 422


def test_job_post_description_limits(client: TestClient, db: Session) -> None:
    headers, _ = _make_client_headers(client, db)
    # Open job with description < 80 chars
    resp_short = client.post(
        f"{settings.API_V1_STR}/jobs/",
        headers=headers,
        json={
            "title": "Valid Job Title",
            "description": "Experience level: Intermediate\n\nToo short",
            "budget_type": "fixed",
            "budget": 500.0,
            "level": "Intermediate",
            "status": "open",
        },
    )
    assert resp_short.status_code == 422

    # Open job with description > 2000 chars
    resp_long = client.post(
        f"{settings.API_V1_STR}/jobs/",
        headers=headers,
        json={
            "title": "Valid Job Title",
            "description": f"Experience level: Intermediate\n\n{'X' * 2001}",
            "budget_type": "fixed",
            "budget": 500.0,
            "level": "Intermediate",
            "status": "open",
        },
    )
    assert resp_long.status_code == 422


def test_job_post_level_required(client: TestClient, db: Session) -> None:
    headers, _ = _make_client_headers(client, db)
    # Open job missing level
    resp = client.post(
        f"{settings.API_V1_STR}/jobs/",
        headers=headers,
        json={
            "title": "Job Without Level",
            "description": "Valid description with enough characters to pass the minimum length requirement easily.",
            "budget_type": "fixed",
            "budget": 500.0,
            "status": "open",
        },
    )
    assert resp.status_code == 422


def test_job_post_budget_limits(client: TestClient, db: Session) -> None:
    headers, _ = _make_client_headers(client, db)
    desc = "Experience level: Intermediate\n\nValid description with enough characters to pass minimum length verification requirements."

    # Hourly < 10
    resp1 = client.post(
        f"{settings.API_V1_STR}/jobs/",
        headers=headers,
        json={"title": "Hourly Job", "description": desc, "budget_type": "hourly", "budget": 9.0, "level": "Intermediate"},
    )
    assert resp1.status_code == 422

    # Hourly > 5000
    resp2 = client.post(
        f"{settings.API_V1_STR}/jobs/",
        headers=headers,
        json={"title": "Hourly Job", "description": desc, "budget_type": "hourly", "budget": 5001.0, "level": "Intermediate"},
    )
    assert resp2.status_code == 422

    # Fixed < 100
    resp3 = client.post(
        f"{settings.API_V1_STR}/jobs/",
        headers=headers,
        json={"title": "Fixed Job", "description": desc, "budget_type": "fixed", "budget": 99.0, "level": "Intermediate"},
    )
    assert resp3.status_code == 422

    # Fixed > 500,000
    resp4 = client.post(
        f"{settings.API_V1_STR}/jobs/",
        headers=headers,
        json={"title": "Fixed Job", "description": desc, "budget_type": "fixed", "budget": 500001.0, "level": "Intermediate"},
    )
    assert resp4.status_code == 422


def test_job_post_skills_limit(client: TestClient, db: Session) -> None:
    headers, _ = _make_client_headers(client, db)
    desc = "Experience level: Intermediate\n\nValid description with enough characters to pass minimum length verification requirements."

    # More than 15 skills
    too_many = [f"Skill{i}" for i in range(16)]
    resp1 = client.post(
        f"{settings.API_V1_STR}/jobs/",
        headers=headers,
        json={"title": "Skills Job", "description": desc, "budget_type": "fixed", "budget": 500.0, "level": "Intermediate", "skills": too_many},
    )
    assert resp1.status_code == 422

    # Skill > 40 chars
    long_skill = ["A" * 41]
    resp2 = client.post(
        f"{settings.API_V1_STR}/jobs/",
        headers=headers,
        json={"title": "Skills Job", "description": desc, "budget_type": "fixed", "budget": 500.0, "level": "Intermediate", "skills": long_skill},
    )
    assert resp2.status_code == 422


# ==============================================================================
# 4. Connection Note Validation
# ==============================================================================


def test_connection_note_limit(client: TestClient, db: Session) -> None:
    headers, _ = _make_client_headers(client, db)
    freelancer = create_random_user(db)

    # Note exceeding 300 chars
    long_note = "N" * 301
    resp = client.post(
        f"{settings.API_V1_STR}/connections/",
        headers=headers,
        json={"receiver_id": str(freelancer.id), "note": long_note},
    )
    assert resp.status_code == 422


# ==============================================================================
# 5. Profile Review Validations
# ==============================================================================


def test_review_validation(client: TestClient, db: Session) -> None:
    headers, _ = _make_client_headers(client, db)
    profile = create_random_profile(db)

    # Comment / feedback > 200 chars
    long_comment = "C" * 201
    resp1 = client.post(
        f"{settings.API_V1_STR}/reviews/",
        headers=headers,
        json={"freelancer_id": str(profile.id), "comment": long_comment, "rating": 5},
    )
    assert resp1.status_code == 422

    # Rating < 1
    resp2 = client.post(
        f"{settings.API_V1_STR}/reviews/",
        headers=headers,
        json={"freelancer_id": str(profile.id), "comment": "Great work!", "rating": 0},
    )
    assert resp2.status_code == 422

    # Rating > 5
    resp3 = client.post(
        f"{settings.API_V1_STR}/reviews/",
        headers=headers,
        json={"freelancer_id": str(profile.id), "comment": "Great work!", "rating": 6},
    )
    assert resp3.status_code == 422

    # Support 'feedback' alias
    resp4 = client.post(
        f"{settings.API_V1_STR}/reviews/",
        headers=headers,
        json={"freelancer_id": str(profile.id), "feedback": "Solid performance and on time.", "rating": 5},
    )
    assert resp4.status_code == 200
    assert resp4.json()["comment"] == "Solid performance and on time."
