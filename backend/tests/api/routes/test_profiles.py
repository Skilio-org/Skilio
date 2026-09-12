import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.models import UserRole
from tests.utils.profile import create_random_profile
from tests.utils.user import create_random_user, user_authentication_headers
from tests.utils.utils import random_lower_string


def test_read_profiles(
    client: TestClient, db: Session
) -> None:
    create_random_profile(db)
    create_random_profile(db)
    response = client.get(f"{settings.API_V1_STR}/profiles/")
    assert response.status_code == 200
    content = response.json()
    assert len(content["data"]) >= 2
    assert "count" in content


def test_read_profiles_no_auth_required(
    client: TestClient, db: Session
) -> None:
    """Profiles list endpoint should be publicly accessible without authentication."""
    create_random_profile(db)
    response = client.get(f"{settings.API_V1_STR}/profiles/")
    assert response.status_code == 200


def test_read_profile_detail(
    client: TestClient, db: Session
) -> None:
    profile = create_random_profile(db)
    response = client.get(f"{settings.API_V1_STR}/profiles/{profile.id}")
    assert response.status_code == 200
    content = response.json()
    assert content["id"] == str(profile.id)
    assert content["user_id"] == str(profile.user_id)
    assert content["title"] == profile.title
    assert content["bio"] == profile.bio
    assert "reviews" in content
    assert "portfolio_media" in content
    assert "user" in content


def test_read_profile_not_found(client: TestClient) -> None:
    response = client.get(f"{settings.API_V1_STR}/profiles/{uuid.uuid4()}")
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Profile not found"


def test_create_profile(
    client: TestClient, db: Session
) -> None:
    user = create_random_user(db)
    user.role = UserRole.FREELANCER
    db.add(user)
    db.commit()
    db.refresh(user)

    password = random_lower_string()
    from app.core.security import get_password_hash

    user.hashed_password = get_password_hash(password)
    db.add(user)
    db.commit()

    headers = user_authentication_headers(
        client=client, email=user.email, password=password
    )

    data = {
        "title": "Senior Python Developer",
        "bio": "Experienced developer",
        "hourly_rate": 75.0,
        "years_of_experience": 5,
        "skills": [],
    }
    response = client.post(
        f"{settings.API_V1_STR}/profiles/",
        headers=headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == data["title"]
    assert content["bio"] == data["bio"]
    assert content["hourly_rate"] == data["hourly_rate"]
    assert content["user_id"] == str(user.id)
    assert "id" in content


def test_create_profile_duplicate(
    client: TestClient, db: Session
) -> None:
    user = create_random_user(db)
    user.role = UserRole.FREELANCER
    db.add(user)
    db.commit()
    db.refresh(user)

    password = random_lower_string()
    from app.core.security import get_password_hash

    user.hashed_password = get_password_hash(password)
    db.add(user)
    db.commit()

    headers = user_authentication_headers(
        client=client, email=user.email, password=password
    )

    data = {
        "title": "Developer",
        "bio": "Bio",
        "hourly_rate": 50.0,
        "skills": [],
    }
    # First creation should succeed
    response = client.post(
        f"{settings.API_V1_STR}/profiles/",
        headers=headers,
        json=data,
    )
    assert response.status_code == 200

    # Second creation should fail with 409
    response = client.post(
        f"{settings.API_V1_STR}/profiles/",
        headers=headers,
        json=data,
    )
    assert response.status_code == 409
    content = response.json()
    assert content["detail"] == "Freelancer profile already exists for this user"


def test_create_profile_not_freelancer(
    client: TestClient, db: Session
) -> None:
    """A client-role user should not be able to create a freelancer profile."""
    user = create_random_user(db)
    user.role = UserRole.CLIENT
    db.add(user)
    db.commit()

    password = random_lower_string()
    from app.core.security import get_password_hash

    user.hashed_password = get_password_hash(password)
    db.add(user)
    db.commit()

    headers = user_authentication_headers(
        client=client, email=user.email, password=password
    )

    data = {
        "title": "Developer",
        "bio": "Bio",
        "hourly_rate": 50.0,
        "skills": [],
    }
    response = client.post(
        f"{settings.API_V1_STR}/profiles/",
        headers=headers,
        json=data,
    )
    assert response.status_code == 403


def test_update_profile(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    profile = create_random_profile(db)
    data = {"title": "Updated title", "bio": "Updated bio"}
    response = client.put(
        f"{settings.API_V1_STR}/profiles/{profile.id}",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == data["title"]
    assert content["bio"] == data["bio"]
    assert content["id"] == str(profile.id)


def test_update_profile_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"title": "Updated title"}
    response = client.put(
        f"{settings.API_V1_STR}/profiles/{uuid.uuid4()}",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Profile not found"


def test_update_profile_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    profile = create_random_profile(db)
    data = {"title": "Updated title"}
    response = client.put(
        f"{settings.API_V1_STR}/profiles/{profile.id}",
        headers=normal_user_token_headers,
        json=data,
    )
    assert response.status_code == 403
    content = response.json()
    assert content["detail"] == "Not enough permissions"


def test_delete_profile(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    profile = create_random_profile(db)
    response = client.delete(
        f"{settings.API_V1_STR}/profiles/{profile.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["message"] == "Profile deleted successfully"


def test_delete_profile_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.delete(
        f"{settings.API_V1_STR}/profiles/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Profile not found"


def test_delete_profile_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    profile = create_random_profile(db)
    response = client.delete(
        f"{settings.API_V1_STR}/profiles/{profile.id}",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 403
    content = response.json()
    assert content["detail"] == "Not enough permissions"
