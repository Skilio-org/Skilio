import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.core.security import get_password_hash
from app.models import (
    BudgetType,
    JobPost,
    JobStatus,
    User,
    UserRole,
)
from tests.utils.utils import random_email


def create_user_with_role(
    client: TestClient, db: Session, role: UserRole = UserRole.CLIENT
) -> tuple[dict[str, str], str, User]:
    email = random_email()
    password = "secretpassword123"
    user = User(
        email=email,
        hashed_password=get_password_hash(password),
        full_name=f"Test {role.value.capitalize()}",
        active_role=role,
        # Mark as verified so login isn't blocked by the email verification gate
        is_email_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    data = {"username": email, "password": password}
    r = client.post(f"{settings.API_V1_STR}/login/access-token", data=data)
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    return headers, token, user


def create_job_for_client(
    db: Session, client_user: User, status: JobStatus = JobStatus.OPEN
) -> JobPost:
    job = JobPost(
        title="Full Stack Engineer",
        description="Build awesome full stack application with FastAPI and React",
        budget_type=BudgetType.FIXED,
        budget=5000.0,
        status=status,
        client_id=client_user.id,
        skills=["Python", "FastAPI", "React"],
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def test_connections_unauthorized(client: TestClient) -> None:
    # GET list unauthorized
    resp = client.get(f"{settings.API_V1_STR}/connections/")
    assert resp.status_code == 401

    # POST create unauthorized
    resp = client.post(
        f"{settings.API_V1_STR}/connections/",
        json={"receiver_id": str(uuid.uuid4())},
    )
    assert resp.status_code == 401


def test_client_send_connection_request_to_freelancer(
    client: TestClient, db: Session
) -> None:
    client_headers, _, client_user = create_user_with_role(
        client, db, UserRole.CLIENT
    )
    freelancer_headers, _, freelancer_user = create_user_with_role(
        client, db, UserRole.FREELANCER
    )

    # Client sends request
    resp = client.post(
        f"{settings.API_V1_STR}/connections/",
        headers=client_headers,
        json={
            "receiver_id": str(freelancer_user.id),
            "note": "Hi, I really enjoyed viewing your portfolio!",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["sender_id"] == str(client_user.id)
    assert data["receiver_id"] == str(freelancer_user.id)
    assert data["status"] == "pending"
    assert data["note"] == "Hi, I really enjoyed viewing your portfolio!"
    assert data["sender"]["id"] == str(client_user.id)
    assert data["receiver"]["id"] == str(freelancer_user.id)

    # Check status endpoint from client's perspective
    status_resp_client = client.get(
        f"{settings.API_V1_STR}/connections/status/{freelancer_user.id}",
        headers=client_headers,
    )
    assert status_resp_client.status_code == 200
    assert status_resp_client.json()["status"] == "pending_sent"

    # Check status endpoint from freelancer's perspective
    status_resp_freelancer = client.get(
        f"{settings.API_V1_STR}/connections/status/{client_user.id}",
        headers=freelancer_headers,
    )
    assert status_resp_freelancer.status_code == 200
    assert status_resp_freelancer.json()["status"] == "pending_received"


def test_freelancer_connect_via_job_post(client: TestClient, db: Session) -> None:
    client_headers, _, client_user = create_user_with_role(
        client, db, UserRole.CLIENT
    )
    freelancer_headers, _, freelancer_user = create_user_with_role(
        client, db, UserRole.FREELANCER
    )
    job = create_job_for_client(db, client_user)

    # Freelancer connects to client referencing the job post
    resp = client.post(
        f"{settings.API_V1_STR}/connections/",
        headers=freelancer_headers,
        json={
            "receiver_id": str(client_user.id),
            "job_post_id": str(job.id),
            "note": "Saw your post for Full Stack Engineer, would love to connect!",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["sender_id"] == str(freelancer_user.id)
    assert data["receiver_id"] == str(client_user.id)
    assert data["job_post_id"] == str(job.id)
    assert data["job_post"] is not None
    assert data["job_post"]["id"] == str(job.id)

    # Job owner checks connections referencing this job
    job_conn_resp = client.get(
        f"{settings.API_V1_STR}/connections/job/{job.id}",
        headers=client_headers,
    )
    assert job_conn_resp.status_code == 200
    job_conn_data = job_conn_resp.json()
    assert job_conn_data["count"] == 1
    assert job_conn_data["data"][0]["sender_id"] == str(freelancer_user.id)


def test_connection_validation_errors(client: TestClient, db: Session) -> None:
    client_headers, _, client_user = create_user_with_role(
        client, db, UserRole.CLIENT
    )
    freelancer_headers, _, freelancer_user = create_user_with_role(
        client, db, UserRole.FREELANCER
    )

    # 1. Cannot connect to self
    resp = client.post(
        f"{settings.API_V1_STR}/connections/",
        headers=client_headers,
        json={"receiver_id": str(client_user.id)},
    )
    assert resp.status_code == 400
    assert "yourself" in resp.json()["detail"].lower()

    # 2. Nonexistent user
    resp = client.post(
        f"{settings.API_V1_STR}/connections/",
        headers=client_headers,
        json={"receiver_id": str(uuid.uuid4())},
    )
    assert resp.status_code == 404

    # 3. Nonexistent job post
    resp = client.post(
        f"{settings.API_V1_STR}/connections/",
        headers=freelancer_headers,
        json={
            "receiver_id": str(client_user.id),
            "job_post_id": str(uuid.uuid4()),
        },
    )
    assert resp.status_code == 404

    # 4. Draft job post
    draft_job = create_job_for_client(db, client_user, status=JobStatus.DRAFT)
    resp = client.post(
        f"{settings.API_V1_STR}/connections/",
        headers=freelancer_headers,
        json={
            "receiver_id": str(client_user.id),
            "job_post_id": str(draft_job.id),
        },
    )
    assert resp.status_code == 400
    assert "draft" in resp.json()["detail"].lower()

    # 5. Job post belonging to another client
    _, _, other_client = create_user_with_role(client, db, UserRole.CLIENT)
    other_job = create_job_for_client(db, other_client)
    resp = client.post(
        f"{settings.API_V1_STR}/connections/",
        headers=freelancer_headers,
        json={
            "receiver_id": str(client_user.id),
            "job_post_id": str(other_job.id),
        },
    )
    assert resp.status_code == 400
    assert "does not belong" in resp.json()["detail"].lower()


def test_duplicate_and_mutual_requests(client: TestClient, db: Session) -> None:
    client_headers, _, client_user = create_user_with_role(
        client, db, UserRole.CLIENT
    )
    freelancer_headers, _, freelancer_user = create_user_with_role(
        client, db, UserRole.FREELANCER
    )

    # Client sends request
    resp = client.post(
        f"{settings.API_V1_STR}/connections/",
        headers=client_headers,
        json={"receiver_id": str(freelancer_user.id)},
    )
    assert resp.status_code == 201

    # Client tries to send again while pending
    dup_resp = client.post(
        f"{settings.API_V1_STR}/connections/",
        headers=client_headers,
        json={"receiver_id": str(freelancer_user.id)},
    )
    assert dup_resp.status_code == 400
    assert "already pending" in dup_resp.json()["detail"].lower()

    # Freelancer tries to send while client's request is pending
    mutual_resp = client.post(
        f"{settings.API_V1_STR}/connections/",
        headers=freelancer_headers,
        json={"receiver_id": str(client_user.id)},
    )
    assert mutual_resp.status_code == 400
    assert "already sent you a connection request" in mutual_resp.json()["detail"].lower()


def test_accept_connection_request(client: TestClient, db: Session) -> None:
    client_headers, _, client_user = create_user_with_role(
        client, db, UserRole.CLIENT
    )
    freelancer_headers, _, freelancer_user = create_user_with_role(
        client, db, UserRole.FREELANCER
    )
    other_headers, _, _ = create_user_with_role(client, db, UserRole.FREELANCER)

    # Client sends request
    send_resp = client.post(
        f"{settings.API_V1_STR}/connections/",
        headers=client_headers,
        json={"receiver_id": str(freelancer_user.id)},
    )
    conn_id = send_resp.json()["id"]

    # Third party cannot accept
    bad_resp = client.post(
        f"{settings.API_V1_STR}/connections/{conn_id}/accept",
        headers=other_headers,
    )
    assert bad_resp.status_code == 403

    # Sender cannot accept their own request
    sender_accept = client.post(
        f"{settings.API_V1_STR}/connections/{conn_id}/accept",
        headers=client_headers,
    )
    assert sender_accept.status_code == 403

    # Receiver accepts
    accept_resp = client.post(
        f"{settings.API_V1_STR}/connections/{conn_id}/accept",
        headers=freelancer_headers,
    )
    assert accept_resp.status_code == 200
    assert accept_resp.json()["status"] == "accepted"
    assert accept_resp.json()["responded_at"] is not None

    # Status is now connected
    status_resp = client.get(
        f"{settings.API_V1_STR}/connections/status/{freelancer_user.id}",
        headers=client_headers,
    )
    assert status_resp.json()["status"] == "connected"

    # Cannot re-accept
    re_accept = client.post(
        f"{settings.API_V1_STR}/connections/{conn_id}/accept",
        headers=freelancer_headers,
    )
    assert re_accept.status_code == 400

    # Cannot send connection request when already connected
    re_connect = client.post(
        f"{settings.API_V1_STR}/connections/",
        headers=client_headers,
        json={"receiver_id": str(freelancer_user.id)},
    )
    assert re_connect.status_code == 400
    assert "already connected" in re_connect.json()["detail"].lower()


def test_decline_and_reopen_request(client: TestClient, db: Session) -> None:
    client_headers, _, client_user = create_user_with_role(
        client, db, UserRole.CLIENT
    )
    freelancer_headers, _, freelancer_user = create_user_with_role(
        client, db, UserRole.FREELANCER
    )

    # Client sends request
    send_resp = client.post(
        f"{settings.API_V1_STR}/connections/",
        headers=client_headers,
        json={"receiver_id": str(freelancer_user.id)},
    )
    conn_id = send_resp.json()["id"]

    # Freelancer declines
    decline_resp = client.post(
        f"{settings.API_V1_STR}/connections/{conn_id}/decline",
        headers=freelancer_headers,
    )
    assert decline_resp.status_code == 200
    assert decline_resp.json()["status"] == "declined"

    # Status check returns "none"
    status_resp = client.get(
        f"{settings.API_V1_STR}/connections/status/{freelancer_user.id}",
        headers=client_headers,
    )
    assert status_resp.json()["status"] == "none"

    # Client can re-send request after decline
    resend_resp = client.post(
        f"{settings.API_V1_STR}/connections/",
        headers=client_headers,
        json={
            "receiver_id": str(freelancer_user.id),
            "note": "Reaching out again with more details",
        },
    )
    assert resend_resp.status_code == 201
    assert resend_resp.json()["status"] == "pending"
    assert resend_resp.json()["note"] == "Reaching out again with more details"


def test_withdraw_and_remove_connection(client: TestClient, db: Session) -> None:
    client_headers, _, client_user = create_user_with_role(
        client, db, UserRole.CLIENT
    )
    freelancer_headers, _, freelancer_user = create_user_with_role(
        client, db, UserRole.FREELANCER
    )

    # Client sends request
    send_resp = client.post(
        f"{settings.API_V1_STR}/connections/",
        headers=client_headers,
        json={"receiver_id": str(freelancer_user.id)},
    )
    conn_id = send_resp.json()["id"]

    # Receiver cannot withdraw
    bad_withdraw = client.post(
        f"{settings.API_V1_STR}/connections/{conn_id}/withdraw",
        headers=freelancer_headers,
    )
    assert bad_withdraw.status_code == 403

    # Sender withdraws
    withdraw_resp = client.post(
        f"{settings.API_V1_STR}/connections/{conn_id}/withdraw",
        headers=client_headers,
    )
    assert withdraw_resp.status_code == 200
    assert withdraw_resp.json()["status"] == "withdrawn"

    # Freelancer can now send request to client
    freelancer_send = client.post(
        f"{settings.API_V1_STR}/connections/",
        headers=freelancer_headers,
        json={"receiver_id": str(client_user.id)},
    )
    assert freelancer_send.status_code == 201
    new_conn_id = freelancer_send.json()["id"]

    # Client accepts
    client.post(
        f"{settings.API_V1_STR}/connections/{new_conn_id}/accept",
        headers=client_headers,
    )

    # Either party can disconnect
    del_resp = client.delete(
        f"{settings.API_V1_STR}/connections/{new_conn_id}",
        headers=freelancer_headers,
    )
    assert del_resp.status_code == 200
    assert del_resp.json()["message"] == "Connection removed successfully"

    # Status is now none
    status_resp = client.get(
        f"{settings.API_V1_STR}/connections/status/{freelancer_user.id}",
        headers=client_headers,
    )
    assert status_resp.json()["status"] == "none"


def test_list_connections_and_filters(client: TestClient, db: Session) -> None:
    client_headers, _, client_user = create_user_with_role(
        client, db, UserRole.CLIENT
    )
    _, _, f1 = create_user_with_role(client, db, UserRole.FREELANCER)
    _, _, f2 = create_user_with_role(client, db, UserRole.FREELANCER)

    # Send 2 requests
    client.post(
        f"{settings.API_V1_STR}/connections/",
        headers=client_headers,
        json={"receiver_id": str(f1.id)},
    )

    client.post(
        f"{settings.API_V1_STR}/connections/",
        headers=client_headers,
        json={"receiver_id": str(f2.id)},
    )

    # Query pending sent
    list_resp = client.get(
        f"{settings.API_V1_STR}/connections/?status=pending&type=sent",
        headers=client_headers,
    )
    assert list_resp.status_code == 200
    assert list_resp.json()["count"] == 2

    # Query received (should be 0)
    rec_resp = client.get(
        f"{settings.API_V1_STR}/connections/?status=pending&type=received",
        headers=client_headers,
    )
    assert rec_resp.status_code == 200
    assert rec_resp.json()["count"] == 0


def test_connected_freelancer_can_initiate_chat(client: TestClient, db: Session) -> None:
    client_headers, _, client_user = create_user_with_role(
        client, db, UserRole.CLIENT
    )
    freelancer_headers, _, freelancer_user = create_user_with_role(
        client, db, UserRole.FREELANCER
    )

    # 1. Unconnected freelancer tries to initiate conversation -> 403 Forbidden
    resp = client.post(
        f"{settings.API_V1_STR}/chat/conversation",
        headers=freelancer_headers,
        json={"freelancer_id": str(client_user.id)},
    )
    assert resp.status_code == 403
    assert "only clients or connected users" in resp.json()["detail"].lower()

    # 2. Client sends connection request to freelancer
    send_resp = client.post(
        f"{settings.API_V1_STR}/connections/",
        headers=client_headers,
        json={"receiver_id": str(freelancer_user.id)},
    )
    conn_id = send_resp.json()["id"]

    # 3. Freelancer accepts connection
    client.post(
        f"{settings.API_V1_STR}/connections/{conn_id}/accept",
        headers=freelancer_headers,
    )

    # 4. Connected freelancer can now initiate conversation!
    chat_resp = client.post(
        f"{settings.API_V1_STR}/chat/conversation",
        headers=freelancer_headers,
        json={"freelancer_id": str(client_user.id)},
    )
    assert chat_resp.status_code == 200
    conv_data = chat_resp.json()
    assert conv_data["client_id"] == str(client_user.id)
    assert conv_data["freelancer_id"] == str(freelancer_user.id)


def test_job_connections_unauthorized_for_non_owner(
    client: TestClient, db: Session
) -> None:
    _, _, client_owner = create_user_with_role(client, db, UserRole.CLIENT)
    other_client_headers, _, _ = create_user_with_role(client, db, UserRole.CLIENT)
    job = create_job_for_client(db, client_owner)

    resp = client.get(
        f"{settings.API_V1_STR}/connections/job/{job.id}",
        headers=other_client_headers,
    )
    assert resp.status_code == 403
    assert "not authorized" in resp.json()["detail"].lower()


def test_remove_connection_unauthorized(client: TestClient, db: Session) -> None:
    c1_headers, _, _ = create_user_with_role(client, db, UserRole.CLIENT)
    _, _, f1 = create_user_with_role(client, db, UserRole.FREELANCER)
    other_headers, _, _ = create_user_with_role(client, db, UserRole.FREELANCER)

    # c1 connects to f1
    send_resp = client.post(
        f"{settings.API_V1_STR}/connections/",
        headers=c1_headers,
        json={"receiver_id": str(f1.id)},
    )
    conn_id = send_resp.json()["id"]

    # Unrelated user attempts deletion -> 403
    del_resp = client.delete(
        f"{settings.API_V1_STR}/connections/{conn_id}",
        headers=other_headers,
    )
    assert del_resp.status_code == 403
    assert "not authorized" in del_resp.json()["detail"].lower()


def test_list_connections_pagination_limit(client: TestClient, db: Session) -> None:
    headers, _, _ = create_user_with_role(client, db, UserRole.CLIENT)

    # limit > 100 should fail validation
    resp = client.get(
        f"{settings.API_V1_STR}/connections/?limit=101",
        headers=headers,
    )
    assert resp.status_code == 422


def test_dual_connections_opposite_directions_and_role_filtering(
    client: TestClient, db: Session
) -> None:
    client_a_headers, _, user_a = create_user_with_role(
        client, db, UserRole.CLIENT
    )
    freelancer_b_headers, _, user_b = create_user_with_role(
        client, db, UserRole.FREELANCER
    )

    # 1. User A (Client) sends connection request to User B (Freelancer)
    resp1 = client.post(
        f"{settings.API_V1_STR}/connections/",
        headers=client_a_headers,
        json={"receiver_id": str(user_b.id)},
    )
    assert resp1.status_code == 201
    conn1 = resp1.json()
    conn1_id = conn1["id"]
    assert conn1["client_id"] == str(user_a.id)
    assert conn1["freelancer_id"] == str(user_b.id)
    assert conn1["sender_id"] == str(user_a.id)
    assert conn1["receiver_id"] == str(user_b.id)

    # Privacy verification on sender and receiver UserPublic objects
    assert "active_role" not in conn1["sender"]
    assert "email" not in conn1["sender"]
    assert "is_superuser" not in conn1["sender"]
    assert "active_role" not in conn1["receiver"]
    assert "email" not in conn1["receiver"]
    assert "is_superuser" not in conn1["receiver"]

    # User B accepts conn1
    accept1 = client.post(
        f"{settings.API_V1_STR}/connections/{conn1_id}/accept",
        headers=freelancer_b_headers,
    )
    assert accept1.status_code == 200

    # 2. User B (now acting as Client) sends connection request to User A (acting as Freelancer)
    resp2 = client.post(
        f"{settings.API_V1_STR}/connections/",
        headers=freelancer_b_headers,
        json={"receiver_id": str(user_a.id), "as_role": "client"},
    )
    assert resp2.status_code == 201
    conn2 = resp2.json()
    conn2_id = conn2["id"]
    assert conn2["client_id"] == str(user_b.id)
    assert conn2["freelancer_id"] == str(user_a.id)
    assert conn2["sender_id"] == str(user_b.id)
    assert conn2["receiver_id"] == str(user_a.id)
    # The two connection records must be completely distinct
    assert conn1_id != conn2_id

    # User A accepts conn2
    accept2 = client.post(
        f"{settings.API_V1_STR}/connections/{conn2_id}/accept",
        headers=client_a_headers,
    )
    assert accept2.status_code == 200

    # 3. Role filtering on GET /connections/ for User A
    # As client: User A only sees conn1
    u_a_client_resp = client.get(
        f"{settings.API_V1_STR}/connections/?role=client&status=accepted",
        headers=client_a_headers,
    )
    assert u_a_client_resp.status_code == 200
    u_a_client_ids = [c["id"] for c in u_a_client_resp.json()["data"]]
    assert conn1_id in u_a_client_ids
    assert conn2_id not in u_a_client_ids

    # As freelancer: User A only sees conn2
    u_a_freelancer_resp = client.get(
        f"{settings.API_V1_STR}/connections/?role=freelancer&status=accepted",
        headers=client_a_headers,
    )
    assert u_a_freelancer_resp.status_code == 200
    u_a_freelancer_ids = [c["id"] for c in u_a_freelancer_resp.json()["data"]]
    assert conn2_id in u_a_freelancer_ids
    assert conn1_id not in u_a_freelancer_ids

    # 4. Role filtering on GET /connections/ for User B
    # As client: User B only sees conn2
    u_b_client_resp = client.get(
        f"{settings.API_V1_STR}/connections/?role=client&status=accepted",
        headers=freelancer_b_headers,
    )
    assert u_b_client_resp.status_code == 200
    u_b_client_ids = [c["id"] for c in u_b_client_resp.json()["data"]]
    assert conn2_id in u_b_client_ids
    assert conn1_id not in u_b_client_ids

    # As freelancer: User B only sees conn1
    u_b_freelancer_resp = client.get(
        f"{settings.API_V1_STR}/connections/?role=freelancer&status=accepted",
        headers=freelancer_b_headers,
    )
    assert u_b_freelancer_resp.status_code == 200
    u_b_freelancer_ids = [c["id"] for c in u_b_freelancer_resp.json()["data"]]
    assert conn1_id in u_b_freelancer_ids
    assert conn2_id not in u_b_freelancer_ids

    # 5. Connection status check with role parameter
    # User A checking status towards User B with role=client -> connected (conn1)
    status_a_client = client.get(
        f"{settings.API_V1_STR}/connections/status/{user_b.id}?role=client",
        headers=client_a_headers,
    ).json()
    assert status_a_client["status"] == "connected"
    assert status_a_client["connection_id"] == conn1_id

    # User A checking status towards User B with role=freelancer -> connected (conn2)
    status_a_freelancer = client.get(
        f"{settings.API_V1_STR}/connections/status/{user_b.id}?role=freelancer",
        headers=client_a_headers,
    ).json()
    assert status_a_freelancer["status"] == "connected"
    assert status_a_freelancer["connection_id"] == conn2_id

    # 6. Privacy: User B switches workspace/role, does not leak to User A's connections view
    switch_resp = client.post(
        f"{settings.API_V1_STR}/users/me/switch-role",
        headers=freelancer_b_headers,
        json={"role": "client"},
    )
    assert switch_resp.status_code == 200

    u_a_list = client.get(
        f"{settings.API_V1_STR}/connections/?role=client&status=accepted",
        headers=client_a_headers,
    ).json()
    conn1_view = next(c for c in u_a_list["data"] if c["id"] == conn1_id)
    assert "active_role" not in conn1_view["receiver"]
    assert "email" not in conn1_view["receiver"]
    assert "is_superuser" not in conn1_view["receiver"]

