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
    user.active_role = UserRole.CLIENT
    password = random_lower_string()
    user.hashed_password = get_password_hash(password)
    db.add(user)
    db.commit()
    db.refresh(user)
    headers = user_authentication_headers(client=client, email=user.email, password=password)
    return headers, user


def _make_freelancer_headers(client: TestClient, db: Session) -> tuple[dict[str, str], any]:
    user = create_random_user(db)
    user.active_role = UserRole.FREELANCER
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


def test_save_proposal_draft(client: TestClient, db: Session) -> None:
    client_headers, _ = _make_client_headers(client, db)
    freelancer_headers, freelancer = _make_freelancer_headers(client, db)
    job_id = _create_open_job(client, client_headers)

    data = {
        "job_post_id": job_id,
        "cover_letter": "I am working on my application notes...",
        "status": "draft",
    }
    response = client.post(f"{settings.API_V1_STR}/proposals/", headers=freelancer_headers, json=data)
    assert response.status_code == 200
    content = response.json()
    assert content["job_post_id"] == job_id
    assert content["freelancer_id"] == str(freelancer.id)
    assert content["status"] == "draft"
    assert content["cover_letter"] == data["cover_letter"]
    assert content["job_post"] is not None
    assert content["job_post"]["id"] == job_id


def test_client_cannot_see_draft_proposals(client: TestClient, db: Session) -> None:
    client_headers, _ = _make_client_headers(client, db)
    freelancer_headers, _ = _make_freelancer_headers(client, db)
    job_id = _create_open_job(client, client_headers)

    # Freelancer creates draft
    draft_resp = client.post(
        f"{settings.API_V1_STR}/proposals/",
        headers=freelancer_headers,
        json={"job_post_id": job_id, "cover_letter": "Draft text", "status": "draft"},
    )
    assert draft_resp.status_code == 200
    draft_id = draft_resp.json()["id"]

    # Client lists proposals for the job: must be 0
    job_props = client.get(f"{settings.API_V1_STR}/proposals/job/{job_id}", headers=client_headers)
    assert job_props.status_code == 200
    assert job_props.json()["count"] == 0
    assert len(job_props.json()["data"]) == 0

    # Client tries to get the draft directly: must be 404 (private to freelancer)
    direct_resp = client.get(f"{settings.API_V1_STR}/proposals/{draft_id}", headers=client_headers)
    assert direct_resp.status_code == 404

    # Freelancer checks job detail: has_draft=True, has_applied=False, proposals_count=0
    fl_job = client.get(f"{settings.API_V1_STR}/jobs/{job_id}", headers=freelancer_headers)
    assert fl_job.status_code == 200
    assert fl_job.json()["has_draft"] is True
    assert fl_job.json()["has_applied"] is False
    assert fl_job.json()["proposals_count"] == 0


def test_freelancer_read_my_proposals_filter_status(client: TestClient, db: Session) -> None:
    client_headers, _ = _make_client_headers(client, db)
    freelancer_headers, _ = _make_freelancer_headers(client, db)

    job1_id = _create_open_job(client, client_headers)
    job2_id = _create_open_job(client, client_headers)

    # Create 1 draft on job1
    client.post(
        f"{settings.API_V1_STR}/proposals/",
        headers=freelancer_headers,
        json={"job_post_id": job1_id, "cover_letter": "Draft 1", "status": "draft"},
    )
    # Create 1 submitted proposal on job2
    client.post(
        f"{settings.API_V1_STR}/proposals/",
        headers=freelancer_headers,
        json={"job_post_id": job2_id, "cover_letter": "Submitted", "status": "pending"},
    )

    # Filter ?status=draft
    drafts_resp = client.get(f"{settings.API_V1_STR}/proposals/me?status=draft", headers=freelancer_headers)
    assert drafts_resp.status_code == 200
    assert drafts_resp.json()["count"] == 1
    assert drafts_resp.json()["data"][0]["status"] == "draft"
    assert drafts_resp.json()["data"][0]["job_post_id"] == job1_id

    # Filter ?status=pending
    pending_resp = client.get(f"{settings.API_V1_STR}/proposals/me?status=pending", headers=freelancer_headers)
    assert pending_resp.status_code == 200
    assert pending_resp.json()["count"] == 1
    assert pending_resp.json()["data"][0]["status"] == "pending"
    assert pending_resp.json()["data"][0]["job_post_id"] == job2_id

    # No filter: returns both
    all_resp = client.get(f"{settings.API_V1_STR}/proposals/me", headers=freelancer_headers)
    assert all_resp.status_code == 200
    assert all_resp.json()["count"] == 2


def test_update_draft_and_promote_to_pending(client: TestClient, db: Session) -> None:
    client_headers, _ = _make_client_headers(client, db)
    freelancer_headers, _ = _make_freelancer_headers(client, db)
    other_fl_headers, _ = _make_freelancer_headers(client, db)
    job_id = _create_open_job(client, client_headers)

    # Create draft
    draft_resp = client.post(
        f"{settings.API_V1_STR}/proposals/",
        headers=freelancer_headers,
        json={"job_post_id": job_id, "cover_letter": "Initial draft", "status": "draft"},
    )
    proposal_id = draft_resp.json()["id"]

    # Other freelancer cannot edit
    forbidden_edit = client.put(
        f"{settings.API_V1_STR}/proposals/{proposal_id}",
        headers=other_fl_headers,
        json={"cover_letter": "Hacked draft"},
    )
    assert forbidden_edit.status_code == 403

    # Update cover letter
    update_letter = client.put(
        f"{settings.API_V1_STR}/proposals/{proposal_id}",
        headers=freelancer_headers,
        json={"cover_letter": "Polished draft notes"},
    )
    assert update_letter.status_code == 200
    assert update_letter.json()["cover_letter"] == "Polished draft notes"
    assert update_letter.json()["status"] == "draft"

    # Promote to pending (submit application)
    submit_resp = client.put(
        f"{settings.API_V1_STR}/proposals/{proposal_id}",
        headers=freelancer_headers,
        json={"status": "pending"},
    )
    assert submit_resp.status_code == 200
    assert submit_resp.json()["status"] == "pending"
    assert submit_resp.json()["cover_letter"] == "Polished draft notes"

    # Client now sees proposal
    client_props = client.get(f"{settings.API_V1_STR}/proposals/job/{job_id}", headers=client_headers)
    assert client_props.status_code == 200
    assert client_props.json()["count"] == 1
    assert client_props.json()["data"][0]["id"] == proposal_id

    # Job detail has_draft is now False, has_applied is True, proposals_count is 1
    fl_job = client.get(f"{settings.API_V1_STR}/jobs/{job_id}", headers=freelancer_headers)
    assert fl_job.json()["has_draft"] is False
    assert fl_job.json()["has_applied"] is True
    assert fl_job.json()["proposals_count"] == 1


def test_apply_upserts_existing_draft(client: TestClient, db: Session) -> None:
    client_headers, _ = _make_client_headers(client, db)
    freelancer_headers, _ = _make_freelancer_headers(client, db)
    job_id = _create_open_job(client, client_headers)

    # Freelancer saves a draft
    r1 = client.post(
        f"{settings.API_V1_STR}/proposals/",
        headers=freelancer_headers,
        json={"job_post_id": job_id, "cover_letter": "First draft", "status": "draft"},
    )
    assert r1.status_code == 200
    proposal_id = r1.json()["id"]

    # Freelancer now submits an application via POST /proposals/ with default status (pending)
    r2 = client.post(
        f"{settings.API_V1_STR}/proposals/",
        headers=freelancer_headers,
        json={"job_post_id": job_id, "cover_letter": "Final submitted letter"},
    )
    assert r2.status_code == 200
    assert r2.json()["id"] == proposal_id
    assert r2.json()["status"] == "pending"
    assert r2.json()["cover_letter"] == "Final submitted letter"

    # Now calling POST again when it's already pending raises 409
    r3 = client.post(
        f"{settings.API_V1_STR}/proposals/",
        headers=freelancer_headers,
        json={"job_post_id": job_id, "cover_letter": "Duplicate"},
    )
    assert r3.status_code == 409


def test_cannot_edit_accepted_or_rejected_proposal(client: TestClient, db: Session) -> None:
    client_headers, _ = _make_client_headers(client, db)
    freelancer_headers, _ = _make_freelancer_headers(client, db)
    job_id = _create_open_job(client, client_headers)

    prop = client.post(
        f"{settings.API_V1_STR}/proposals/",
        headers=freelancer_headers,
        json={"job_post_id": job_id, "cover_letter": "Ready!"},
    )
    proposal_id = prop.json()["id"]

    # Client accepts
    accept = client.put(
        f"{settings.API_V1_STR}/proposals/{proposal_id}/status",
        headers=client_headers,
        json={"status": "accepted"},
    )
    assert accept.status_code == 200

    # Freelancer tries to update accepted proposal
    fail_edit = client.put(
        f"{settings.API_V1_STR}/proposals/{proposal_id}",
        headers=freelancer_headers,
        json={"cover_letter": "New text"},
    )
    assert fail_edit.status_code == 400
    assert fail_edit.json()["detail"] == "Cannot update an accepted or rejected proposal"
