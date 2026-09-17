import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.models import ClientProfile
from tests.utils.user import create_random_user, user_authentication_headers
from tests.utils.utils import random_lower_string


def test_read_client_profile_me_unauthorized(client: TestClient) -> None:
    response = client.get(f"{settings.API_V1_STR}/client-profiles/me")
    assert response.status_code == 401


def test_read_client_profile_me_auto_creates(client: TestClient, db: Session) -> None:
    password = random_lower_string()
    user = create_random_user(db)
    from app.core.security import get_password_hash

    user.hashed_password = get_password_hash(password)
    user.full_name = "Jane Doe"
    db.add(user)
    db.commit()
    db.refresh(user)

    headers = user_authentication_headers(
        client=client, email=user.email, password=password
    )

    response = client.get(
        f"{settings.API_V1_STR}/client-profiles/me",
        headers=headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["user_id"] == str(user.id)
    assert content["full_name"] == "Jane Doe"
    assert "id" in content


def test_update_client_profile_me(client: TestClient, db: Session) -> None:
    password = random_lower_string()
    user = create_random_user(db)
    from app.core.security import get_password_hash

    user.hashed_password = get_password_hash(password)
    user.full_name = "Initial Name"
    db.add(user)
    db.commit()
    db.refresh(user)

    headers = user_authentication_headers(
        client=client, email=user.email, password=password
    )

    update_payload = {
        "full_name": "Updated Client Name",
        "company": "Acme Studios",
        "company_role": "Product Lead",
        "company_website": "https://acme.studio",
        "company_size": "11-50",
        "location": "San Francisco, US",
        "description": "We build great digital products.",
    }

    response = client.put(
        f"{settings.API_V1_STR}/client-profiles/me",
        headers=headers,
        json=update_payload,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["full_name"] == update_payload["full_name"]
    assert content["company"] == update_payload["company"]
    assert content["company_role"] == update_payload["company_role"]
    assert content["company_website"] == update_payload["company_website"]
    assert content["company_size"] == update_payload["company_size"]
    assert content["location"] == update_payload["location"]
    assert content["description"] == update_payload["description"]

    # Verify user full_name was also updated in DB
    db.refresh(user)
    assert user.full_name == "Updated Client Name"


def test_read_client_profile_by_id(client: TestClient, db: Session) -> None:
    user = create_random_user(db)
    profile = ClientProfile(
        user_id=user.id,
        company="Nordic Design",
        company_role="Design Director",
        location="Stockholm, Sweden",
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    response = client.get(f"{settings.API_V1_STR}/client-profiles/{profile.id}")
    assert response.status_code == 200
    content = response.json()
    assert content["id"] == str(profile.id)
    assert content["company"] == "Nordic Design"
    assert content["company_role"] == "Design Director"
    assert "job_posts_count" in content


def test_read_client_profile_by_user_id(client: TestClient, db: Session) -> None:
    user = create_random_user(db)
    profile = ClientProfile(
        user_id=user.id,
        company="Global Ventures",
        company_role="Founder & CEO",
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    response = client.get(f"{settings.API_V1_STR}/client-profiles/user/{user.id}")
    assert response.status_code == 200
    content = response.json()
    assert content["user_id"] == str(user.id)
    assert content["company"] == "Global Ventures"
    assert content["company_role"] == "Founder & CEO"


def test_read_client_profile_not_found(client: TestClient) -> None:
    response = client.get(f"{settings.API_V1_STR}/client-profiles/{uuid.uuid4()}")
    assert response.status_code == 404


def test_cascade_delete_client_profile(db: Session) -> None:
    user = create_random_user(db)
    profile = ClientProfile(user_id=user.id, company="Test Corp")
    db.add(profile)
    db.commit()
    profile_id = profile.id

    # Deleting user should cascade delete client profile
    db.delete(user)
    db.commit()

    deleted_profile = db.get(ClientProfile, profile_id)
    assert deleted_profile is None
