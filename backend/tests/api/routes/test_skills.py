import uuid

from fastapi.testclient import TestClient

from app.core.config import settings


def test_read_skills(client: TestClient) -> None:
    response = client.get(f"{settings.API_V1_STR}/skills/")
    assert response.status_code == 200
    content = response.json()
    assert "data" in content
    assert "count" in content
    assert content["count"] >= 40
    assert len(content["data"]) == content["count"]


def test_read_skills_with_query(client: TestClient) -> None:
    response = client.get(f"{settings.API_V1_STR}/skills/?q=python")
    assert response.status_code == 200
    content = response.json()
    assert content["count"] >= 1
    skill_names = [s["name"] for s in content["data"]]
    assert any("Python" in name for name in skill_names)


def test_read_skill_by_id(client: TestClient) -> None:
    # Get first skill
    response = client.get(f"{settings.API_V1_STR}/skills/")
    assert response.status_code == 200
    first_skill = response.json()["data"][0]

    # Query by ID
    response_single = client.get(f"{settings.API_V1_STR}/skills/{first_skill['id']}")
    assert response_single.status_code == 200
    content = response_single.json()
    assert content["id"] == first_skill["id"]
    assert content["name"] == first_skill["name"]


def test_read_skill_not_found(client: TestClient) -> None:
    random_id = uuid.uuid4()
    response = client.get(f"{settings.API_V1_STR}/skills/{random_id}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Skill not found"
