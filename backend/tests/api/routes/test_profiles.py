import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.models import FreelancerProfile, UserRole
from tests.utils.profile import create_random_profile
from tests.utils.user import create_random_user, user_authentication_headers
from tests.utils.utils import random_lower_string


def test_read_profiles(client: TestClient, db: Session) -> None:
    create_random_profile(db)
    create_random_profile(db)
    response = client.get(f"{settings.API_V1_STR}/profiles/")
    assert response.status_code == 200
    content = response.json()
    assert len(content["data"]) >= 2
    assert "count" in content


def test_read_profiles_no_auth_required(client: TestClient, db: Session) -> None:
    """Profiles list endpoint should be publicly accessible without authentication."""
    create_random_profile(db)
    response = client.get(f"{settings.API_V1_STR}/profiles/")
    assert response.status_code == 200


def test_read_profile_detail(client: TestClient, db: Session) -> None:
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


def test_create_profile(client: TestClient, db: Session) -> None:
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


def test_create_profile_duplicate(client: TestClient, db: Session) -> None:
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


def test_create_profile_not_freelancer(client: TestClient, db: Session) -> None:
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


def test_search_profiles_with_location_and_sort(
    client: TestClient, db: Session
) -> None:
    p1 = create_random_profile(db)
    p1.location = "Paris, France"
    p1.hourly_rate = 45.0
    p1.timezone = "CET"
    p1.languages = "French, English"
    db.add(p1)

    p2 = create_random_profile(db)
    p2.location = "Tokyo, Japan"
    p2.hourly_rate = 120.0
    p2.timezone = "JST"
    p2.languages = "Japanese, English"
    db.add(p2)
    db.commit()

    # Search by location query
    response = client.get(f"{settings.API_V1_STR}/profiles/?q=Paris")
    assert response.status_code == 200
    content = response.json()
    assert any(p["id"] == str(p1.id) for p in content["data"])
    matching = next(p for p in content["data"] if p["id"] == str(p1.id))
    assert matching["location"] == "Paris, France"
    assert matching["timezone"] == "CET"
    assert matching["languages"] == "French, English"

    # Test sorting by rate asc
    response_sort = client.get(f"{settings.API_V1_STR}/profiles/?sort_by=rate_asc")
    assert response_sort.status_code == 200
    rates = [
        p["hourly_rate"]
        for p in response_sort.json()["data"]
        if p["hourly_rate"] is not None
    ]
    assert rates == sorted(rates)


def test_read_profile_me(client: TestClient, db: Session) -> None:
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

    profile = FreelancerProfile(
        user_id=user.id,
        title="Full Stack Engineer",
        bio="Building great products",
        hourly_rate=80.0,
        location="Berlin, Germany",
        timezone="CET",
        languages="German, English",
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    response = client.get(f"{settings.API_V1_STR}/profiles/me", headers=headers)
    assert response.status_code == 200
    content = response.json()
    assert content["id"] == str(profile.id)
    assert content["title"] == "Full Stack Engineer"
    assert content["location"] == "Berlin, Germany"
    assert content["timezone"] == "CET"
    assert content["languages"] == "German, English"


def test_save_and_unsave_profile(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    profile = create_random_profile(db)

    # Initially not saved
    resp_init = client.get(
        f"{settings.API_V1_STR}/profiles/{profile.id}",
        headers=normal_user_token_headers,
    )
    assert resp_init.status_code == 200
    assert resp_init.json()["is_saved"] is False

    # Save profile
    resp_save = client.post(
        f"{settings.API_V1_STR}/profiles/{profile.id}/save",
        headers=normal_user_token_headers,
    )
    assert resp_save.status_code == 200
    assert resp_save.json()["message"] == "Profile saved successfully"

    # Now detail should show is_saved == True
    resp_after = client.get(
        f"{settings.API_V1_STR}/profiles/{profile.id}",
        headers=normal_user_token_headers,
    )
    assert resp_after.status_code == 200
    assert resp_after.json()["is_saved"] is True

    # Search list should also reflect is_saved == True
    resp_list = client.get(
        f"{settings.API_V1_STR}/profiles/",
        headers=normal_user_token_headers,
    )
    assert resp_list.status_code == 200
    saved_item = next(p for p in resp_list.json()["data"] if p["id"] == str(profile.id))
    assert saved_item["is_saved"] is True

    # Unsave profile
    resp_unsave = client.delete(
        f"{settings.API_V1_STR}/profiles/{profile.id}/save",
        headers=normal_user_token_headers,
    )
    assert resp_unsave.status_code == 200
    assert resp_unsave.json()["message"] == "Profile removed from saved"

    # After unsave, is_saved should be False again
    resp_final = client.get(
        f"{settings.API_V1_STR}/profiles/{profile.id}",
        headers=normal_user_token_headers,
    )
    assert resp_final.status_code == 200
    assert resp_final.json()["is_saved"] is False
