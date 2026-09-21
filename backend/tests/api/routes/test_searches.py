from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from tests.utils.user import create_random_user, user_authentication_headers
from tests.utils.utils import random_lower_string


def _make_auth_headers(client: TestClient, db: Session) -> dict[str, str]:
    user = create_random_user(db)
    password = random_lower_string()
    from app.core.security import get_password_hash

    user.hashed_password = get_password_hash(password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user_authentication_headers(client=client, email=user.email, password=password)


def test_recent_searches_unauthenticated(client: TestClient) -> None:
    response = client.get(f"{settings.API_V1_STR}/searches/recent")
    assert response.status_code == 401


def test_save_and_get_recent_searches_max_3(client: TestClient, db: Session) -> None:
    headers = _make_auth_headers(client, db)

    # Initially empty
    resp = client.get(f"{settings.API_V1_STR}/searches/recent", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["count"] == 0
    assert resp.json()["data"] == []

    # Add 4 queries sequentially
    client.post(f"{settings.API_V1_STR}/searches/recent", headers=headers, json={"query": "React"})
    client.post(f"{settings.API_V1_STR}/searches/recent", headers=headers, json={"query": "FastAPI"})
    client.post(f"{settings.API_V1_STR}/searches/recent", headers=headers, json={"query": "PostgreSQL"})
    resp_after_4 = client.post(f"{settings.API_V1_STR}/searches/recent", headers=headers, json={"query": "Python"})

    assert resp_after_4.status_code == 200
    content = resp_after_4.json()
    assert content["count"] == 3
    # Exactly 3 latest, newest first: Python, PostgreSQL, FastAPI (React dropped)
    assert content["data"] == ["Python", "PostgreSQL", "FastAPI"]


def test_deduplicate_recent_searches(client: TestClient, db: Session) -> None:
    headers = _make_auth_headers(client, db)

    client.post(f"{settings.API_V1_STR}/searches/recent", headers=headers, json={"query": "React"})
    client.post(f"{settings.API_V1_STR}/searches/recent", headers=headers, json={"query": "Python"})
    # Re-adding react in different case
    client.post(f"{settings.API_V1_STR}/searches/recent", headers=headers, json={"query": "react"})

    resp = client.get(f"{settings.API_V1_STR}/searches/recent", headers=headers)
    assert resp.status_code == 200
    content = resp.json()
    assert content["count"] == 2
    assert content["data"] == ["react", "Python"]


def test_clear_recent_searches(client: TestClient, db: Session) -> None:
    headers = _make_auth_headers(client, db)

    client.post(f"{settings.API_V1_STR}/searches/recent", headers=headers, json={"query": "React"})
    client.post(f"{settings.API_V1_STR}/searches/recent", headers=headers, json={"query": "Python"})

    del_resp = client.delete(f"{settings.API_V1_STR}/searches/recent", headers=headers)
    assert del_resp.status_code == 200
    assert del_resp.json()["message"] == "Recent searches cleared successfully"

    get_resp = client.get(f"{settings.API_V1_STR}/searches/recent", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["count"] == 0
    assert get_resp.json()["data"] == []


def test_jobs_search_records_recent_query(client: TestClient, db: Session) -> None:
    headers = _make_auth_headers(client, db)

    # Searching jobs with q records to recent searches
    client.get(f"{settings.API_V1_STR}/jobs/?q=Designer", headers=headers)

    resp = client.get(f"{settings.API_V1_STR}/searches/recent", headers=headers)
    assert resp.status_code == 200
    assert "Designer" in resp.json()["data"]
