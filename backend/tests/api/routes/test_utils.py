from fastapi.testclient import TestClient

from app.core.config import settings


def test_health_check_shallow(client: TestClient) -> None:
    r = client.get(f"{settings.API_V1_STR}/utils/health-check/")
    assert r.status_code == 200
    assert r.json() is True


def test_health_check_detailed(client: TestClient) -> None:
    r = client.get(f"{settings.API_V1_STR}/utils/health/detailed")
    assert r.status_code in [200, 503]
    data = r.json()
    assert "status" in data
    assert "timestamp" in data
    assert "uptime_seconds" in data
    assert "services" in data
    assert "database" in data["services"]
    assert "disk" in data["services"]
    assert "vault" in data["services"]
    assert "email" in data["services"]
