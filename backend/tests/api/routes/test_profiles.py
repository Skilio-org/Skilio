import uuid
from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.core.config import settings
from app.core.security import get_password_hash
from app.models import (
    Education,
    FreelancerProfile,
    PortfolioItem,
    UserRole,
)
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
    assert "portfolio" in content
    assert "educations" in content
    assert "user" in content


def test_read_profile_not_found(client: TestClient) -> None:
    response = client.get(f"{settings.API_V1_STR}/profiles/{uuid.uuid4()}")
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Profile not found"


def test_create_profile(client: TestClient, db: Session) -> None:
    user = create_random_user(db)
    user.active_role = UserRole.FREELANCER
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
    user.active_role = UserRole.FREELANCER
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


def test_create_profile_as_client_auto_switches_role(
    client: TestClient, db: Session
) -> None:
    """Any user can create a freelancer profile. Active role auto-switches to freelancer."""
    user = create_random_user(db)
    user.active_role = UserRole.CLIENT
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
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == data["title"]

    # Verify user's active_role was auto-switched to freelancer
    db.refresh(user)
    assert user.active_role == UserRole.FREELANCER


def test_update_profile(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    profile = create_random_profile(db)
    valid_bio = "Experienced full-stack engineer specializing in robust Python APIs and modern frontend architectures."
    data = {"title": "Updated title", "bio": valid_bio}
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
    user.active_role = UserRole.FREELANCER
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


def create_authenticated_freelancer(client: TestClient, db: Session):
    user = create_random_user(db)
    user.active_role = UserRole.FREELANCER
    db.add(user)
    db.commit()
    db.refresh(user)

    password = random_lower_string()
    from app.core.security import get_password_hash

    user.hashed_password = get_password_hash(password)
    db.add(user)
    db.commit()

    profile = FreelancerProfile(
        user_id=user.id,
        title="Senior Software Engineer",
        bio="Experienced engineer",
        hourly_rate=65.0,
        years_of_experience=5,
        finished=True,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    headers = user_authentication_headers(
        client=client, email=user.email, password=password
    )
    return user, profile, headers


def create_authenticated_client(client: TestClient, db: Session):
    user = create_random_user(db)
    user.active_role = UserRole.CLIENT
    db.add(user)
    db.commit()
    db.refresh(user)

    password = random_lower_string()
    user.hashed_password = get_password_hash(password)
    db.add(user)
    db.commit()

    headers = user_authentication_headers(
        client=client, email=user.email, password=password
    )
    return user, headers


def test_create_education_me(client: TestClient, db: Session) -> None:
    _, profile, headers = create_authenticated_freelancer(client, db)
    edu_data = {
        "institution": "Stanford University",
        "degree": "B.S. Computer Science",
        "field_of_study": "AI & Systems",
        "start_date": "2018",
        "end_date": "2022",
        "description": "Graduated with honors",
    }
    response = client.post(
        f"{settings.API_V1_STR}/profiles/me/educations",
        headers=headers,
        json=edu_data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["institution"] == edu_data["institution"]
    assert content["degree"] == edu_data["degree"]
    assert content["field_of_study"] == edu_data["field_of_study"]
    assert content["start_date"] == edu_data["start_date"]
    assert content["end_date"] == edu_data["end_date"]
    assert content["description"] == edu_data["description"]
    assert content["freelancer_profile_id"] == str(profile.id)
    assert "id" in content

    # Verify present in GET /profiles/me
    me_resp = client.get(f"{settings.API_V1_STR}/profiles/me", headers=headers)
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert len(me_data["educations"]) == 1
    assert me_data["educations"][0]["degree"] == edu_data["degree"]


def test_update_education_me(client: TestClient, db: Session) -> None:
    _, profile, headers = create_authenticated_freelancer(client, db)
    education = Education(
        freelancer_profile_id=profile.id,
        institution="MIT",
        degree="B.S.",
    )
    db.add(education)
    db.commit()
    db.refresh(education)

    update_data = {
        "degree": "M.S. Computer Science",
        "description": "Thesis on Distributed Systems",
    }
    response = client.put(
        f"{settings.API_V1_STR}/profiles/me/educations/{education.id}",
        headers=headers,
        json=update_data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["degree"] == "M.S. Computer Science"
    assert content["description"] == "Thesis on Distributed Systems"
    assert content["institution"] == "MIT"


def test_delete_education_me(client: TestClient, db: Session) -> None:
    _, profile, headers = create_authenticated_freelancer(client, db)
    education = Education(
        freelancer_profile_id=profile.id,
        institution="Harvard",
        degree="B.A.",
    )
    db.add(education)
    db.commit()
    db.refresh(education)

    response = client.delete(
        f"{settings.API_V1_STR}/profiles/me/educations/{education.id}",
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Education entry deleted successfully"

    # Verify not in me
    me_resp = client.get(f"{settings.API_V1_STR}/profiles/me", headers=headers)
    assert len(me_resp.json()["educations"]) == 0


def test_create_portfolio_item_me(client: TestClient, db: Session) -> None:
    _, profile, headers = create_authenticated_freelancer(client, db)
    item_data = {
        "title": "E-Commerce App",
        "description": "Full-stack mobile app built with React Native and FastAPI.",
        "image_url": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    }
    response = client.post(
        f"{settings.API_V1_STR}/profiles/me/portfolio",
        headers=headers,
        json=item_data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == item_data["title"]
    assert content["description"] == item_data["description"]
    assert content["image_url"] == item_data["image_url"]
    assert content["freelancer_profile_id"] == str(profile.id)

    # Verify present in GET /profiles/me
    me_resp = client.get(f"{settings.API_V1_STR}/profiles/me", headers=headers)
    assert me_resp.status_code == 200
    assert len(me_resp.json()["portfolio"]) == 1
    assert me_resp.json()["portfolio"][0]["title"] == item_data["title"]


def test_upload_portfolio_item_me(client: TestClient, db: Session) -> None:
    _, profile, headers = create_authenticated_freelancer(client, db)
    with patch(
        "app.api.routes.profiles.claudinary_upload_media",
        return_value="https://res.cloudinary.com/demo/image/upload/uploaded_item.jpg",
    ):
        response = client.post(
            f"{settings.API_V1_STR}/profiles/me/portfolio/upload",
            headers=headers,
            data={
                "title": "Uploaded Project",
                "description": "Project with uploaded image",
            },
            files={"file": ("test.png", b"fake image bytes", "image/png")},
        )
        assert response.status_code == 200
        content = response.json()
        assert content["title"] == "Uploaded Project"
        assert content["description"] == "Project with uploaded image"
        assert (
            content["image_url"]
            == "https://res.cloudinary.com/demo/image/upload/uploaded_item.jpg"
        )


def test_update_portfolio_item_me(client: TestClient, db: Session) -> None:
    _, profile, headers = create_authenticated_freelancer(client, db)
    item = PortfolioItem(
        freelancer_profile_id=profile.id,
        title="Initial Title",
        description="Initial Description",
        image_url="https://res.cloudinary.com/demo/image/upload/initial.jpg",
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    response = client.put(
        f"{settings.API_V1_STR}/profiles/me/portfolio/{item.id}",
        headers=headers,
        json={"title": "Updated Title", "description": "Updated Description"},
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == "Updated Title"
    assert content["description"] == "Updated Description"
    assert content["image_url"] == item.image_url


def test_delete_portfolio_item_me(client: TestClient, db: Session) -> None:
    _, profile, headers = create_authenticated_freelancer(client, db)
    item = PortfolioItem(
        freelancer_profile_id=profile.id,
        title="To Delete",
        description="To Delete Description",
        image_url="https://res.cloudinary.com/demo/image/upload/to_delete.jpg",
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    with patch("app.api.routes.profiles.claudinary_delete_media") as mock_delete:
        response = client.delete(
            f"{settings.API_V1_STR}/profiles/me/portfolio/{item.id}",
            headers=headers,
        )
        assert response.status_code == 200
        assert response.json()["message"] == "Portfolio item deleted successfully"
        mock_delete.assert_called_once_with(item.image_url)

    # Verify removed
    me_resp = client.get(f"{settings.API_V1_STR}/profiles/me", headers=headers)
    assert len(me_resp.json()["portfolio"]) == 0


def test_education_and_portfolio_forbidden_for_other_user(
    client: TestClient, db: Session
) -> None:
    _, profile_a, _ = create_authenticated_freelancer(client, db)
    _, _, headers_b = create_authenticated_freelancer(client, db)

    edu = Education(
        freelancer_profile_id=profile_a.id,
        institution="School A",
        degree="B.S.",
    )
    item = PortfolioItem(
        freelancer_profile_id=profile_a.id,
        title="Project A",
        description="Desc A",
        image_url="https://example.com/a.jpg",
    )
    db.add(edu)
    db.add(item)
    db.commit()
    db.refresh(edu)
    db.refresh(item)

    # User B tries to update User A's education -> 404
    resp_edu = client.put(
        f"{settings.API_V1_STR}/profiles/me/educations/{edu.id}",
        headers=headers_b,
        json={"degree": "Hacked"},
    )
    assert resp_edu.status_code == 404

    # User B tries to delete User A's portfolio item -> 404
    resp_port = client.delete(
        f"{settings.API_V1_STR}/profiles/me/portfolio/{item.id}",
        headers=headers_b,
    )
    assert resp_port.status_code == 404


def test_cascade_delete_educations_and_portfolio_items(
    client: TestClient, db: Session
) -> None:
    user, profile, headers = create_authenticated_freelancer(client, db)
    edu = Education(
        freelancer_profile_id=profile.id,
        institution="School",
        degree="Degree",
    )
    item = PortfolioItem(
        freelancer_profile_id=profile.id,
        title="Project",
        description="Desc",
        image_url="https://example.com/p.jpg",
    )
    db.add(edu)
    db.add(item)
    db.commit()
    db.refresh(edu)
    db.refresh(item)
    edu_id = edu.id
    item_id = item.id

    # Delete profile
    del_resp = client.delete(
        f"{settings.API_V1_STR}/profiles/{profile.id}",
        headers=headers,
    )
    assert del_resp.status_code == 200

    # Ensure education and portfolio item are deleted via cascade
    db.expire_all()
    assert db.get(Education, edu_id) is None
    assert db.get(PortfolioItem, item_id) is None


def test_read_profile_me_auto_creates_draft(client: TestClient, db: Session) -> None:
    user = create_random_user(db)
    password = random_lower_string()
    from app.core.security import get_password_hash

    user.hashed_password = get_password_hash(password)
    db.add(user)
    db.commit()

    headers = user_authentication_headers(
        client=client, email=user.email, password=password
    )

    resp = client.get(f"{settings.API_V1_STR}/profiles/me", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["finished"] is False
    assert data["user_id"] == str(user.id)
    assert data["full_name"] == user.full_name


def test_update_profile_me_upsert(client: TestClient, db: Session) -> None:
    user = create_random_user(db)
    password = random_lower_string()
    from app.core.security import get_password_hash

    user.hashed_password = get_password_hash(password)
    db.add(user)
    db.commit()

    headers = user_authentication_headers(
        client=client, email=user.email, password=password
    )

    payload = {
        "full_name": "Jane Developer",
        "title": "Full Stack Architect",
        "category": "Development & IT",
        "hourly_rate": 95.0,
        "availability": "Available now",
        "hours": "More than 30 hrs/week",
        "bio": "Experienced full-stack architect building cloud services, distributed systems, and modern apps.",
        "skills": ["FastAPI", "React 19", "TailwindCSS"],
        "finished": True,
        "experiences": [
            {
                "title": "Lead Engineer",
                "organization": "Tech Corp",
                "detail": "Built scalable cloud services",
                "url": "https://example.com/project",
            }
        ],
        "educations": [
            {
                "title": "B.S. Computer Science",
                "organization": "MIT",
                "detail": "Graduated with honors",
            }
        ],
        "portfolio": [
            {
                "title": "E-commerce Platform",
                "organization": "ShopCo",
                "detail": "High-conversion checkout system",
                "url": "https://shop.example.com",
            }
        ],
    }

    resp = client.put(
        f"{settings.API_V1_STR}/profiles/me",
        headers=headers,
        json=payload,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["full_name"] == "Jane Developer"
    assert data["title"] == "Full Stack Architect"
    assert data["category"] == "Development & IT"
    assert data["hourly_rate"] == 95.0
    assert data["is_available"] is True
    assert data["finished"] is True
    assert any(s.lower() == "fastapi" for s in data["skill_names"])
    assert "React 19" in data["skill_names"]
    assert len(data["experiences"]) == 1
    assert data["experiences"][0]["title"] == "Lead Engineer"
    assert len(data["educations"]) == 1
    assert data["educations"][0]["organization"] == "MIT"
    assert len(data["portfolio"]) == 1
    assert data["portfolio"][0]["title"] == "E-commerce Platform"

    db.refresh(user)
    assert user.full_name == "Jane Developer"
    assert user.active_role == UserRole.FREELANCER


def test_experience_crud(client: TestClient, db: Session) -> None:
    user, profile, headers = create_authenticated_freelancer(client, db)

    # 1. Create experience
    create_resp = client.post(
        f"{settings.API_V1_STR}/profiles/me/experiences",
        headers=headers,
        json={
            "title": "Senior Backend Developer",
            "organization": "Acme Inc",
            "detail": "Designed microservices",
            "url": "https://acme.com",
        },
    )
    assert create_resp.status_code == 200
    exp = create_resp.json()
    exp_id = exp["id"]
    assert exp["title"] == "Senior Backend Developer"
    assert exp["organization"] == "Acme Inc"

    # 2. Update experience
    update_resp = client.put(
        f"{settings.API_V1_STR}/profiles/me/experiences/{exp_id}",
        headers=headers,
        json={"title": "Principal Architect"},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["title"] == "Principal Architect"

    # 3. Verify in GET /profiles/me
    me_resp = client.get(f"{settings.API_V1_STR}/profiles/me", headers=headers)
    assert me_resp.status_code == 200
    assert len(me_resp.json()["experiences"]) == 1
    assert me_resp.json()["experiences"][0]["title"] == "Principal Architect"

    # 4. Delete experience
    del_resp = client.delete(
        f"{settings.API_V1_STR}/profiles/me/experiences/{exp_id}",
        headers=headers,
    )
    assert del_resp.status_code == 200
    assert del_resp.json()["message"] == "Experience deleted successfully"

    # 5. Verify deleted
    me_resp_after = client.get(f"{settings.API_V1_STR}/profiles/me", headers=headers)
    assert len(me_resp_after.json()["experiences"]) == 0


def test_talent_search_filters(client: TestClient, db: Session) -> None:
    p1 = create_random_profile(db)
    p1.category = "Design & Creative"
    p1.availability = "Available this week"
    p1.finished = True
    db.add(p1)

    p2 = create_random_profile(db)
    p2.category = "Engineering & Architecture"
    p2.availability = "Not currently available"
    p2.finished = True
    db.add(p2)

    draft = create_random_profile(db)
    draft.category = "Design & Creative"
    draft.finished = False
    db.add(draft)
    db.commit()

    # Filter by category
    resp_cat = client.get(
        f"{settings.API_V1_STR}/profiles/?category=Design%20%26%20Creative"
    )
    assert resp_cat.status_code == 200
    cat_ids = [p["id"] for p in resp_cat.json()["data"]]
    assert str(p1.id) in cat_ids
    assert str(p2.id) not in cat_ids
    assert str(draft.id) not in cat_ids

    # Filter by availability
    resp_avail = client.get(
        f"{settings.API_V1_STR}/profiles/?availability=Available%20this%20week"
    )
    assert resp_avail.status_code == 200
    avail_ids = [p["id"] for p in resp_avail.json()["data"]]
    assert str(p1.id) in avail_ids
    assert str(p2.id) not in avail_ids

    # Search by skill via keyword q
    p1.skills = ["Figma"]
    db.add(p1)
    db.commit()

    resp_skill = client.get(f"{settings.API_V1_STR}/profiles/?q=Figma")
    assert resp_skill.status_code == 200
    skill_ids = [p["id"] for p in resp_skill.json()["data"]]
    assert str(p1.id) in skill_ids


def test_search_skill_and_role_combinations(client: TestClient, db: Session) -> None:
    # 1. Freelancer with React skill and Frontend Developer title
    dev_profile = create_random_profile(db)
    dev_profile.title = "Frontend Developer"
    dev_profile.skills = ["React", "TypeScript"]
    dev_profile.finished = True
    db.add(dev_profile)

    # 2. Freelancer with React skill and Frontend Engineer title
    eng_profile = create_random_profile(db)
    eng_profile.title = "Frontend Engineer"
    eng_profile.skills = ["React", "Tailwind CSS"]
    eng_profile.finished = True
    db.add(eng_profile)

    # 3. Freelancer with Python skill and Backend Engineer title
    py_profile = create_random_profile(db)
    py_profile.title = "Backend Engineer"
    py_profile.skills = ["Python", "FastAPI"]
    py_profile.finished = True
    db.add(py_profile)

    # 4. Negative isolation: Accountant with React in skills
    acc_profile = create_random_profile(db)
    acc_profile.title = "Financial Analyst"
    acc_profile.category = "Accounting & Consulting"
    acc_profile.bio = "Financial modeling and budgeting"
    acc_profile.skills = ["React", "Excel"]
    acc_profile.finished = True
    db.add(acc_profile)
    db.commit()

    # Search for "react" - both dev and eng should be returned
    resp_react = client.get(f"{settings.API_V1_STR}/profiles/?q=react")
    assert resp_react.status_code == 200
    react_ids = [p["id"] for p in resp_react.json()["data"]]
    assert str(dev_profile.id) in react_ids
    assert str(eng_profile.id) in react_ids

    # Search for "react developer" - Frontend Developer AND Frontend Engineer must be returned!
    resp_react_dev = client.get(f"{settings.API_V1_STR}/profiles/?q=react%20developer")
    assert resp_react_dev.status_code == 200
    react_dev_ids = [p["id"] for p in resp_react_dev.json()["data"]]
    assert str(dev_profile.id) in react_dev_ids, "Frontend Developer with React skill should show up for 'react developer'"
    assert str(eng_profile.id) in react_dev_ids, "Frontend Engineer with React skill should show up for 'react developer'"
    assert str(acc_profile.id) not in react_dev_ids, "Financial Analyst should not show up for 'react developer'"

    # Search for "react engineer" - both should show up
    resp_react_eng = client.get(f"{settings.API_V1_STR}/profiles/?q=react%20engineer")
    assert resp_react_eng.status_code == 200
    react_eng_ids = [p["id"] for p in resp_react_eng.json()["data"]]
    assert str(dev_profile.id) in react_eng_ids, "Frontend Developer with React skill should show up for 'react engineer'"
    assert str(eng_profile.id) in react_eng_ids, "Frontend Engineer with React skill should show up for 'react engineer'"

    # Search for "python developer" - Backend Engineer should show up
    resp_py = client.get(f"{settings.API_V1_STR}/profiles/?q=python%20developer")
    assert resp_py.status_code == 200
    py_ids = [p["id"] for p in resp_py.json()["data"]]
    assert str(py_profile.id) in py_ids, "Backend Engineer with Python skill should show up for 'python developer'"

    # 5. Figma skill + Product Designer
    figma_profile = create_random_profile(db)
    figma_profile.title = "Product Designer"
    figma_profile.skills = ["Figma", "UI/UX"]
    figma_profile.category = "Design & Creative"
    figma_profile.finished = True
    db.add(figma_profile)

    # 6. Flutter skill + Mobile Engineer
    flutter_profile = create_random_profile(db)
    flutter_profile.title = "Mobile Engineer"
    flutter_profile.skills = ["Flutter", "Dart"]
    flutter_profile.category = "Web Mobile & Software Dev"
    flutter_profile.finished = True
    db.add(flutter_profile)
    db.commit()

    # Search for "figma designer"
    resp_figma = client.get(f"{settings.API_V1_STR}/profiles/?q=figma%20designer")
    assert resp_figma.status_code == 200
    figma_ids = [p["id"] for p in resp_figma.json()["data"]]
    assert str(figma_profile.id) in figma_ids, "Product Designer with Figma skill should show up for 'figma designer'"

    # Search for "flutter developer"
    resp_flutter = client.get(f"{settings.API_V1_STR}/profiles/?q=flutter%20developer")
    assert resp_flutter.status_code == 200
    flutter_ids = [p["id"] for p in resp_flutter.json()["data"]]
    assert str(flutter_profile.id) in flutter_ids, "Mobile Engineer with Flutter skill should show up for 'flutter developer'"

    # Typo tolerance via pg_trgm: "reakt developer"
    resp_typo = client.get(f"{settings.API_V1_STR}/profiles/?q=reakt%20developer")
    assert resp_typo.status_code == 200
    typo_ids = [p["id"] for p in resp_typo.json()["data"]]
    assert str(dev_profile.id) in typo_ids, "Trigram fuzzy matching should match 'reakt developer' to React developer"




def test_draft_profile_privacy(client: TestClient, db: Session) -> None:
    user_a, profile_a, headers_a = create_authenticated_freelancer(client, db)
    profile_a.finished = False
    db.add(profile_a)
    db.commit()

    _, _, headers_b = create_authenticated_freelancer(client, db)

    # Public unauthenticated cannot view draft
    resp_anon = client.get(f"{settings.API_V1_STR}/profiles/{profile_a.id}")
    assert resp_anon.status_code == 404

    # Other user cannot view draft
    resp_other = client.get(
        f"{settings.API_V1_STR}/profiles/{profile_a.id}", headers=headers_b
    )
    assert resp_other.status_code == 404

    # Owner CAN view draft
    resp_owner = client.get(
        f"{settings.API_V1_STR}/profiles/{profile_a.id}", headers=headers_a
    )
    assert resp_owner.status_code == 200
    assert resp_owner.json()["id"] == str(profile_a.id)


def test_update_availability_me_success(client: TestClient, db: Session) -> None:
    user, profile, headers = create_authenticated_freelancer(client, db)
    assert profile.is_available is True

    # 1. Toggle off
    response = client.patch(
        f"{settings.API_V1_STR}/profiles/me/availability",
        headers=headers,
        json={"is_available": False},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_available"] is False
    assert data["availability"] == "Not currently available"

    db.refresh(profile)
    assert profile.is_available is False
    assert profile.availability == "Not currently available"

    # 2. Toggle on
    response = client.patch(
        f"{settings.API_V1_STR}/profiles/me/availability",
        headers=headers,
        json={"is_available": True},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_available"] is True
    assert data["availability"] == "Available now"

    db.refresh(profile)
    assert profile.is_available is True
    assert profile.availability == "Available now"


def test_update_availability_me_alias(client: TestClient, db: Session) -> None:
    _, profile, headers = create_authenticated_freelancer(client, db)

    # Use "available" key alias instead of "is_available"
    response = client.patch(
        f"{settings.API_V1_STR}/profiles/me/availability",
        headers=headers,
        json={"available": False},
    )
    assert response.status_code == 200
    assert response.json()["is_available"] is False

    db.refresh(profile)
    assert profile.is_available is False


def test_update_availability_me_creates_profile_if_not_exists(
    client: TestClient, db: Session
) -> None:
    user = create_random_user(db)
    user.active_role = UserRole.FREELANCER
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

    response = client.patch(
        f"{settings.API_V1_STR}/profiles/me/availability",
        headers=headers,
        json={"is_available": False},
    )
    assert response.status_code == 200
    assert response.json()["is_available"] is False

    profile = db.exec(
        select(FreelancerProfile).where(FreelancerProfile.user_id == user.id)
    ).first()
    assert profile is not None
    assert profile.is_available is False


def test_update_availability_me_unauthorized(client: TestClient) -> None:
    response = client.patch(
        f"{settings.API_V1_STR}/profiles/me/availability",
        json={"is_available": True},
    )
    assert response.status_code in (401, 403)


def test_read_availability_me(client: TestClient, db: Session) -> None:
    _, profile, headers = create_authenticated_freelancer(client, db)
    profile.is_available = True
    profile.availability = "Available now"
    db.add(profile)
    db.commit()

    response = client.get(
        f"{settings.API_V1_STR}/profiles/me/availability",
        headers=headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_available"] is True
    assert data["availability"] == "Available now"


def test_read_saved_profiles_empty(client: TestClient, db: Session) -> None:
    _, headers = create_authenticated_client(client, db)

    response = client.get(f"{settings.API_V1_STR}/profiles/saved", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 0
    assert data["data"] == []


def test_read_saved_profiles_after_saving(client: TestClient, db: Session) -> None:
    _, headers = create_authenticated_client(client, db)

    profile1 = create_random_profile(db)
    profile2 = create_random_profile(db)

    # Save profile1
    client.post(
        f"{settings.API_V1_STR}/profiles/{profile1.id}/save",
        headers=headers,
    )

    # Call /profiles/saved
    resp = client.get(f"{settings.API_V1_STR}/profiles/saved", headers=headers)
    assert resp.status_code == 200
    content = resp.json()
    assert content["count"] == 1
    assert len(content["data"]) == 1
    assert content["data"][0]["id"] == str(profile1.id)
    assert content["data"][0]["is_saved"] is True

    # Save profile2
    client.post(
        f"{settings.API_V1_STR}/profiles/{profile2.id}/save",
        headers=headers,
    )
    resp2 = client.get(f"{settings.API_V1_STR}/profiles/saved", headers=headers)
    assert resp2.json()["count"] == 2
    saved_ids = [p["id"] for p in resp2.json()["data"]]
    assert str(profile1.id) in saved_ids
    assert str(profile2.id) in saved_ids

    # Unsave profile1
    client.delete(
        f"{settings.API_V1_STR}/profiles/{profile1.id}/save",
        headers=headers,
    )
    resp3 = client.get(f"{settings.API_V1_STR}/profiles/saved", headers=headers)
    assert resp3.json()["count"] == 1
    assert resp3.json()["data"][0]["id"] == str(profile2.id)


def test_read_saved_profiles_filtering(client: TestClient, db: Session) -> None:
    _, headers = create_authenticated_client(client, db)

    profile = create_random_profile(db)
    profile.title = "Unique Rust Architect"
    profile.category = "Engineering & Architecture"
    profile.hourly_rate = 150.0
    db.add(profile)
    db.commit()
    db.refresh(profile)

    # Save profile
    client.post(f"{settings.API_V1_STR}/profiles/{profile.id}/save", headers=headers)

    # Filter with q matching
    resp_match = client.get(
        f"{settings.API_V1_STR}/profiles/saved",
        headers=headers,
        params={"q": "Rust Architect"},
    )
    assert resp_match.status_code == 200
    assert resp_match.json()["count"] == 1

    # Filter with q non-matching
    resp_nomatch = client.get(
        f"{settings.API_V1_STR}/profiles/saved",
        headers=headers,
        params={"q": "NonexistentKeyword123"},
    )
    assert resp_nomatch.status_code == 200
    assert resp_nomatch.json()["count"] == 0

    # Filter with category matching
    resp_cat = client.get(
        f"{settings.API_V1_STR}/profiles/saved",
        headers=headers,
        params={"category": "Engineering & Architecture"},
    )
    assert resp_cat.status_code == 200
    assert resp_cat.json()["count"] == 1
