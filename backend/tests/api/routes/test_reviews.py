import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.core.security import get_password_hash
from app.models import FreelancerProfile, Review, UserRole
from tests.utils.profile import create_random_profile
from tests.utils.review import create_random_review
from tests.utils.user import create_random_user, user_authentication_headers
from tests.utils.utils import random_lower_string


def _make_client_headers(client: TestClient, db: Session) -> tuple[dict[str, str], any]:
    """Create a CLIENT-role user and return (auth_headers, user)."""
    user = create_random_user(db)
    user.role = UserRole.CLIENT
    password = random_lower_string()
    user.hashed_password = get_password_hash(password)
    db.add(user)
    db.commit()
    db.refresh(user)
    headers = user_authentication_headers(client=client, email=user.email, password=password)
    return headers, user


def _make_freelancer_headers(client: TestClient, db: Session) -> tuple[dict[str, str], any]:
    """Create a FREELANCER-role user and return (auth_headers, user)."""
    user = create_random_user(db)
    user.role = UserRole.FREELANCER
    password = random_lower_string()
    user.hashed_password = get_password_hash(password)
    db.add(user)
    db.commit()
    db.refresh(user)
    headers = user_authentication_headers(client=client, email=user.email, password=password)
    return headers, user


# --------------------------------------------------------------------------
# CREATE
# --------------------------------------------------------------------------


def test_create_review(client: TestClient, db: Session) -> None:
    """Client can create a review for a freelancer profile."""
    headers, _ = _make_client_headers(client, db)
    profile = create_random_profile(db)

    data = {
        "rating": 5,
        "comment": "Excellent work, highly recommend!",
        "freelancer_id": str(profile.id),
    }
    response = client.post(
        f"{settings.API_V1_STR}/reviews/",
        headers=headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["rating"] == 5
    assert content["comment"] == data["comment"]
    assert content["freelancer_id"] == str(profile.id)
    assert "id" in content
    assert "created_at" in content


def test_create_review_duplicate(client: TestClient, db: Session) -> None:
    """A client cannot review the same freelancer twice."""
    headers, _ = _make_client_headers(client, db)
    profile = create_random_profile(db)

    data = {
        "rating": 4,
        "comment": "Good job.",
        "freelancer_id": str(profile.id),
    }
    response1 = client.post(
        f"{settings.API_V1_STR}/reviews/",
        headers=headers,
        json=data,
    )
    assert response1.status_code == 200

    response2 = client.post(
        f"{settings.API_V1_STR}/reviews/",
        headers=headers,
        json=data,
    )
    assert response2.status_code == 409
    assert response2.json()["detail"] == "You have already reviewed this freelancer"


def test_create_review_own_profile(client: TestClient, db: Session) -> None:
    """A client cannot review a freelancer profile owned by their own user account."""
    user = create_random_user(db)
    user.role = UserRole.CLIENT
    password = random_lower_string()
    user.hashed_password = get_password_hash(password)
    db.add(user)
    db.commit()
    db.refresh(user)
    headers = user_authentication_headers(client=client, email=user.email, password=password)

    # Create a freelancer profile for this same user
    profile = FreelancerProfile(
        user_id=user.id,
        title="My profile",
        bio="Bio",
        hourly_rate=50.0,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    data = {
        "rating": 5,
        "comment": "Reviewing myself.",
        "freelancer_id": str(profile.id),
    }
    response = client.post(
        f"{settings.API_V1_STR}/reviews/",
        headers=headers,
        json=data,
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "You cannot review your own profile"


def test_create_review_not_client_role(client: TestClient, db: Session) -> None:
    """A freelancer-role user cannot create reviews."""
    headers, _ = _make_freelancer_headers(client, db)
    profile = create_random_profile(db)

    data = {
        "rating": 5,
        "comment": "Should not be allowed.",
        "freelancer_id": str(profile.id),
    }
    response = client.post(
        f"{settings.API_V1_STR}/reviews/",
        headers=headers,
        json=data,
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "Only clients can create reviews"


def test_create_review_unauthenticated(client: TestClient, db: Session) -> None:
    """Unauthenticated requests cannot create reviews."""
    profile = create_random_profile(db)
    data = {
        "rating": 5,
        "comment": "No auth.",
        "freelancer_id": str(profile.id),
    }
    response = client.post(f"{settings.API_V1_STR}/reviews/", json=data)
    assert response.status_code == 401


def test_create_review_freelancer_not_found(client: TestClient, db: Session) -> None:
    """Creating a review for a non-existent freelancer returns 404."""
    headers, _ = _make_client_headers(client, db)
    data = {
        "rating": 5,
        "comment": "No such freelancer.",
        "freelancer_id": str(uuid.uuid4()),
    }
    response = client.post(
        f"{settings.API_V1_STR}/reviews/",
        headers=headers,
        json=data,
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Freelancer profile not found"


# --------------------------------------------------------------------------
# READ
# --------------------------------------------------------------------------


def test_list_reviews_for_freelancer(client: TestClient, db: Session) -> None:
    """List reviews for a freelancer, including client_name."""
    review = create_random_review(db)

    response = client.get(
        f"{settings.API_V1_STR}/reviews/freelancer/{review.freelancer_id}"
    )
    assert response.status_code == 200
    content = response.json()
    assert content["count"] >= 1
    assert len(content["data"]) >= 1
    matching = next(r for r in content["data"] if r["id"] == str(review.id))
    assert matching["rating"] == review.rating
    assert matching["comment"] == review.comment
    assert "client_name" in matching


def test_list_reviews_freelancer_not_found(client: TestClient) -> None:
    """Listing reviews for a non-existent freelancer returns 404."""
    response = client.get(
        f"{settings.API_V1_STR}/reviews/freelancer/{uuid.uuid4()}"
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Freelancer profile not found"


def test_read_single_review(client: TestClient, db: Session) -> None:
    """Get a single review by ID."""
    review = create_random_review(db)

    response = client.get(f"{settings.API_V1_STR}/reviews/{review.id}")
    assert response.status_code == 200
    content = response.json()
    assert content["id"] == str(review.id)
    assert content["rating"] == review.rating
    assert content["comment"] == review.comment


def test_read_review_not_found(client: TestClient) -> None:
    """Getting a non-existent review returns 404."""
    response = client.get(f"{settings.API_V1_STR}/reviews/{uuid.uuid4()}")
    assert response.status_code == 404


# --------------------------------------------------------------------------
# UPDATE
# --------------------------------------------------------------------------


def test_update_own_review(client: TestClient, db: Session) -> None:
    """A client can update their own review."""
    headers, user = _make_client_headers(client, db)
    profile = create_random_profile(db)

    # Create a review first
    create_data = {
        "rating": 3,
        "comment": "Average work.",
        "freelancer_id": str(profile.id),
    }
    create_resp = client.post(
        f"{settings.API_V1_STR}/reviews/",
        headers=headers,
        json=create_data,
    )
    assert create_resp.status_code == 200
    review_id = create_resp.json()["id"]

    # Update it
    update_data = {"rating": 5, "comment": "Updated: actually great!"}
    update_resp = client.put(
        f"{settings.API_V1_STR}/reviews/{review_id}",
        headers=headers,
        json=update_data,
    )
    assert update_resp.status_code == 200
    content = update_resp.json()
    assert content["rating"] == 5
    assert content["comment"] == "Updated: actually great!"
    assert content["updated_at"] is not None


def test_update_other_users_review(client: TestClient, db: Session) -> None:
    """A client cannot update someone else's review."""
    review = create_random_review(db)
    headers, _ = _make_client_headers(client, db)

    update_data = {"rating": 1, "comment": "Hijacked!"}
    response = client.put(
        f"{settings.API_V1_STR}/reviews/{review.id}",
        headers=headers,
        json=update_data,
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "Not enough permissions"


# --------------------------------------------------------------------------
# DELETE
# --------------------------------------------------------------------------


def test_delete_own_review(client: TestClient, db: Session) -> None:
    """A client can delete their own review."""
    headers, user = _make_client_headers(client, db)
    profile = create_random_profile(db)

    create_data = {
        "rating": 2,
        "comment": "Will delete this.",
        "freelancer_id": str(profile.id),
    }
    create_resp = client.post(
        f"{settings.API_V1_STR}/reviews/",
        headers=headers,
        json=create_data,
    )
    assert create_resp.status_code == 200
    review_id = create_resp.json()["id"]

    delete_resp = client.delete(
        f"{settings.API_V1_STR}/reviews/{review_id}",
        headers=headers,
    )
    assert delete_resp.status_code == 200
    assert delete_resp.json()["message"] == "Review deleted successfully"

    # Verify it's gone
    get_resp = client.get(f"{settings.API_V1_STR}/reviews/{review_id}")
    assert get_resp.status_code == 404


def test_delete_as_superuser(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    """A superuser can delete any review."""
    review = create_random_review(db)

    response = client.delete(
        f"{settings.API_V1_STR}/reviews/{review.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Review deleted successfully"


def test_delete_other_users_review_forbidden(
    client: TestClient, db: Session
) -> None:
    """A non-superuser cannot delete someone else's review."""
    review = create_random_review(db)
    headers, _ = _make_client_headers(client, db)

    response = client.delete(
        f"{settings.API_V1_STR}/reviews/{review.id}",
        headers=headers,
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "Not enough permissions"
