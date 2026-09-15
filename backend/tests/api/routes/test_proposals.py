import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.core.security import get_password_hash
from app.models import BudgetType, ProposalStatus, UserRole
from tests.utils.user import create_random_user, user_authentication_headers
from tests.utils.utils import random_lower_string


def _make_client_headers(client: TestClient, db: Session) -> tuple[dict[str, str], any]:
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
    user = create_random_user(db)
    user.role = UserRole.FREELANCER
    password = random_lower_string()
    user.hashed_password = get_password_hash(password)
    db.add(user)
    db.commit()
    db.refresh(user)
    headers = user_authentication_headers(client=client, email=user.email, password=password)
    return headers, user


def _create_open_job(client: TestClient, client_headers: dict[str, str]) -> str:
    response = client.post(
        f"{settings.API_V1_STR}/jobs/",
        headers=client_headers,
        json={
            "title": "Fullstack Web App Development",
            "description": "Looking for a fullstack developer with React and FastAPI.",
            "budget_type": "fixed",
            "budget": 2000.0,
            "skills": ["Python", "FastAPI", "React"],
        },
    )
    assert response.status_code == 200
    return response.json()["id"]


def test_submit_proposal(client: TestClient, db: Session) -> None:
    client_headers, _ = _make_client_headers(client, db)
    freelancer_headers, freelancer = _make_freelancer_headers(client, db)
    job_id = _create_open_job(client, client_headers)

    data = {
        "job_post_id": job_id,
        "cover_letter": "I have extensive experience with FastAPI and React. Ready to start immediately!",
    }
    response = client.post(f"{settings.API_V1_STR}/proposals/", headers=freelancer_headers, json=data)
    assert response.status_code == 200
    content = response.json()
    assert content["job_post_id"] == job_id
    assert content["freelancer_id"] == str(freelancer.id)
    assert content["status"] == "pending"
    assert content["cover_letter"] == data["cover_letter"]
    assert content["freelancer"]["email"] == freelancer.email


def test_duplicate_proposal_conflict(client: TestClient, db: Session) -> None:
    client_headers, _ = _make_client_headers(client, db)
    freelancer_headers, _ = _make_freelancer_headers(client, db)
    job_id = _create_open_job(client, client_headers)

    data = {"job_post_id": job_id, "cover_letter": "First submission"}
    r1 = client.post(f"{settings.API_V1_STR}/proposals/", headers=freelancer_headers, json=data)
    assert r1.status_code == 200

    r2 = client.post(f"{settings.API_V1_STR}/proposals/", headers=freelancer_headers, json=data)
    assert r2.status_code == 409
    assert r2.json()["detail"] == "You have already submitted a proposal for this job"


def test_client_cannot_submit_proposal(client: TestClient, db: Session) -> None:
    c1_headers, _ = _make_client_headers(client, db)
    c2_headers, _ = _make_client_headers(client, db)
    job_id = _create_open_job(client, c1_headers)

    response = client.post(
        f"{settings.API_V1_STR}/proposals/",
        headers=c2_headers,
        json={"job_post_id": job_id},
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "Only freelancers can submit proposals"


def test_proposal_on_closed_job_forbidden(client: TestClient, db: Session) -> None:
    client_headers, _ = _make_client_headers(client, db)
    freelancer_headers, _ = _make_freelancer_headers(client, db)
    job_id = _create_open_job(client, client_headers)

    # Close job
    client.put(f"{settings.API_V1_STR}/jobs/{job_id}", headers=client_headers, json={"status": "closed"})

    # Attempt to propose
    response = client.post(
        f"{settings.API_V1_STR}/proposals/",
        headers=freelancer_headers,
        json={"job_post_id": job_id},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Cannot submit proposal to a closed job"


def test_client_reads_proposals_for_job(client: TestClient, db: Session) -> None:
    client_headers, _ = _make_client_headers(client, db)
    other_client_headers, _ = _make_client_headers(client, db)
    f1_headers, _ = _make_freelancer_headers(client, db)
    f2_headers, _ = _make_freelancer_headers(client, db)

    job_id = _create_open_job(client, client_headers)

    # Both freelancers submit proposals
    client.post(f"{settings.API_V1_STR}/proposals/", headers=f1_headers, json={"job_post_id": job_id})
    client.post(f"{settings.API_V1_STR}/proposals/", headers=f2_headers, json={"job_post_id": job_id})

    # Non-owner client cannot view proposals
    forbidden_resp = client.get(f"{settings.API_V1_STR}/proposals/job/{job_id}", headers=other_client_headers)
    assert forbidden_resp.status_code == 403

    # Job owner client can view all proposals
    owner_resp = client.get(f"{settings.API_V1_STR}/proposals/job/{job_id}", headers=client_headers)
    assert owner_resp.status_code == 200
    content = owner_resp.json()
    assert content["count"] == 2
    assert len(content["data"]) == 2
    for proposal in content["data"]:
        assert proposal["job_post_id"] == job_id
        assert proposal["freelancer"] is not None


def test_freelancer_reads_my_proposals(client: TestClient, db: Session) -> None:
    client_headers, _ = _make_client_headers(client, db)
    freelancer_headers, freelancer = _make_freelancer_headers(client, db)

    job_id1 = _create_open_job(client, client_headers)
    job_id2 = _create_open_job(client, client_headers)

    client.post(f"{settings.API_V1_STR}/proposals/", headers=freelancer_headers, json={"job_post_id": job_id1})
    client.post(f"{settings.API_V1_STR}/proposals/", headers=freelancer_headers, json={"job_post_id": job_id2})

    my_proposals = client.get(f"{settings.API_V1_STR}/proposals/me", headers=freelancer_headers)
    assert my_proposals.status_code == 200
    content = my_proposals.json()
    assert content["count"] >= 2
    job_ids = [p["job_post_id"] for p in content["data"]]
    assert job_id1 in job_ids
    assert job_id2 in job_ids


def test_update_proposal_status_by_owner(client: TestClient, db: Session) -> None:
    client_headers, _ = _make_client_headers(client, db)
    other_client_headers, _ = _make_client_headers(client, db)
    freelancer_headers, _ = _make_freelancer_headers(client, db)

    job_id = _create_open_job(client, client_headers)
    prop_resp = client.post(
        f"{settings.API_V1_STR}/proposals/",
        headers=freelancer_headers,
        json={"job_post_id": job_id},
    )
    proposal_id = prop_resp.json()["id"]

    # Other client cannot update status
    fail_update = client.put(
        f"{settings.API_V1_STR}/proposals/{proposal_id}/status",
        headers=other_client_headers,
        json={"status": "accepted"},
    )
    assert fail_update.status_code == 403

    # Freelancer cannot update status
    fail_freelancer = client.put(
        f"{settings.API_V1_STR}/proposals/{proposal_id}/status",
        headers=freelancer_headers,
        json={"status": "accepted"},
    )
    assert fail_freelancer.status_code == 403

    # Owner client accepts proposal
    accept_resp = client.put(
        f"{settings.API_V1_STR}/proposals/{proposal_id}/status",
        headers=client_headers,
        json={"status": "accepted"},
    )
    assert accept_resp.status_code == 200
    assert accept_resp.json()["status"] == "accepted"


def test_withdraw_proposal(client: TestClient, db: Session) -> None:
    client_headers, _ = _make_client_headers(client, db)
    freelancer_headers, _ = _make_freelancer_headers(client, db)
    other_freelancer_headers, _ = _make_freelancer_headers(client, db)

    job_id = _create_open_job(client, client_headers)
    prop_resp = client.post(
        f"{settings.API_V1_STR}/proposals/",
        headers=freelancer_headers,
        json={"job_post_id": job_id},
    )
    proposal_id = prop_resp.json()["id"]

    # Other freelancer cannot withdraw
    fail_withdraw = client.delete(
        f"{settings.API_V1_STR}/proposals/{proposal_id}",
        headers=other_freelancer_headers,
    )
    assert fail_withdraw.status_code == 403

    # Owner freelancer withdraws
    withdraw_resp = client.delete(
        f"{settings.API_V1_STR}/proposals/{proposal_id}",
        headers=freelancer_headers,
    )
    assert withdraw_resp.status_code == 200
    assert withdraw_resp.json()["message"] == "Proposal withdrawn successfully"

    # Verify 404 after deletion
    get_resp = client.get(f"{settings.API_V1_STR}/proposals/{proposal_id}", headers=freelancer_headers)
    assert get_resp.status_code == 404


def test_proposal_feed_count_and_has_applied(client: TestClient, db: Session) -> None:
    client_headers, _ = _make_client_headers(client, db)
    freelancer_headers, _ = _make_freelancer_headers(client, db)

    job_id = _create_open_job(client, client_headers)

    # Check initially has_applied is False and count is 0
    detail_before = client.get(f"{settings.API_V1_STR}/jobs/{job_id}", headers=freelancer_headers)
    assert detail_before.json()["proposals_count"] == 0
    assert detail_before.json()["has_applied"] is False

    # Submit proposal
    client.post(f"{settings.API_V1_STR}/proposals/", headers=freelancer_headers, json={"job_post_id": job_id})

    # Check after proposal
    detail_after = client.get(f"{settings.API_V1_STR}/jobs/{job_id}", headers=freelancer_headers)
    assert detail_after.json()["proposals_count"] == 1
    assert detail_after.json()["has_applied"] is True
