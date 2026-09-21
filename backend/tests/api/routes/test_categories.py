from fastapi.testclient import TestClient

from app.core.config import settings

EXPECTED_CATEGORIES = [
    "Accounting & Consulting",
    "Customer Service",
    "Data Science & Analytics",
    "Design & Creative",
    "Engineering & Architecture",
    "Sales & Marketing",
    "Web Mobile & Software Dev",
    "Ai & Automations",
    "IT & Networking",
    "Writing",
    "Legal",
]


def test_read_categories(client: TestClient) -> None:
    response = client.get(f"{settings.API_V1_STR}/categories/")
    assert response.status_code == 200
    content = response.json()
    assert content["count"] == 11
    assert content["data"] == EXPECTED_CATEGORIES
