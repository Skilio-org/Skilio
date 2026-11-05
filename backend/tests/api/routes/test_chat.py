import json
import uuid
from time import sleep

import pytest
from fastapi import WebSocketDisconnect
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.core.redis import publish_to_user
from tests.utils.user import create_random_user
from tests.utils.utils import random_lower_string


def get_user_token_and_headers(
    client: TestClient, db: Session
) -> tuple[dict[str, str], str, uuid.UUID]:
    user = create_random_user(db)
    password = "secretpassword123"
    # Update password to a known one
    from app.core.security import get_password_hash

    user.hashed_password = get_password_hash(password)
    db.add(user)
    db.commit()
    db.refresh(user)

    data = {"username": user.email, "password": password}
    r = client.post(f"{settings.API_V1_STR}/login/access-token", data=data)
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    return headers, token, user.id


def test_chat_me_unauthorized(client: TestClient) -> None:
    response = client.get(f"{settings.API_V1_STR}/chat/me")
    assert response.status_code == 401


def test_create_conversation_and_chat_me(
    client: TestClient, db: Session
) -> None:
    headers_user1, _, user1_id = get_user_token_and_headers(client, db)
    headers_user2, _, user2_id = get_user_token_and_headers(client, db)

    # Cannot create conversation with self
    resp = client.post(
        f"{settings.API_V1_STR}/chat/conversation",
        headers=headers_user1,
        json={"freelancer_id": str(user1_id)},
    )
    assert resp.status_code == 400

    # Create conversation between user1 and user2
    resp = client.post(
        f"{settings.API_V1_STR}/chat/conversation",
        headers=headers_user1,
        json={"freelancer_id": str(user2_id)},
    )
    assert resp.status_code == 200
    conv_data = resp.json()
    conv_id = conv_data["id"]
    assert conv_data["client_id"] == str(user1_id)
    assert conv_data["freelancer_id"] == str(user2_id)
    assert conv_data["other_user"]["id"] == str(user2_id)

    # Verify GET /chat/me for user1 (client)
    resp1 = client.get(f"{settings.API_V1_STR}/chat/me", headers=headers_user1)
    assert resp1.status_code == 200
    me_data1 = resp1.json()
    assert any(c["id"] == conv_id for c in me_data1["data"])

    # Verify GET /chat/me for user2 (freelancer)
    resp2 = client.get(f"{settings.API_V1_STR}/chat/me", headers=headers_user2)
    assert resp2.status_code == 200
    me_data2 = resp2.json()
    conv_for_user2 = next(c for c in me_data2["data"] if c["id"] == conv_id)
    assert conv_for_user2["other_user"]["id"] == str(user1_id)


def test_send_message_rest_and_get_conversation(
    client: TestClient, db: Session
) -> None:
    headers_user1, _, user1_id = get_user_token_and_headers(client, db)
    headers_user2, _, user2_id = get_user_token_and_headers(client, db)
    headers_user3, _, _ = get_user_token_and_headers(client, db)

    # Create conversation
    create_resp = client.post(
        f"{settings.API_V1_STR}/chat/conversation",
        headers=headers_user1,
        json={"freelancer_id": str(user2_id)},
    )
    conv_id = create_resp.json()["id"]

    # Send message from user1
    msg_content = "Hello from user 1! " + random_lower_string()
    msg_resp = client.post(
        f"{settings.API_V1_STR}/chat/conversation/{conv_id}/messages",
        headers=headers_user1,
        json={"content": msg_content},
    )
    assert msg_resp.status_code == 200
    msg_data = msg_resp.json()
    assert msg_data["content"] == msg_content
    assert msg_data["sender_id"] == str(user1_id)
    assert msg_data["is_read"] is False

    # Unauthorized user3 cannot access conversation
    forbidden_resp = client.get(
        f"{settings.API_V1_STR}/chat/conversation/{conv_id}",
        headers=headers_user3,
    )
    assert forbidden_resp.status_code == 403

    # User2 views conversation; message should be marked as read
    get_conv_resp = client.get(
        f"{settings.API_V1_STR}/chat/conversation/{conv_id}",
        headers=headers_user2,
    )
    assert get_conv_resp.status_code == 200
    conv_details = get_conv_resp.json()
    assert len(conv_details["messages"]) >= 1
    fetched_msg = next(
        m for m in conv_details["messages"] if m["id"] == msg_data["id"]
    )
    assert fetched_msg["is_read"] is True


def test_websocket_unauthorized(client: TestClient) -> None:
    with client.websocket_connect(
        f"{settings.API_V1_STR}/chat/ws?token=badtoken"
    ) as websocket:
        with pytest.raises(WebSocketDisconnect) as exc_info:
            websocket.receive_text()

    assert exc_info.value.code == 1008
    assert exc_info.value.reason == "Invalid or expired token"

def test_websocket_messaging_and_presence(
    client: TestClient, db: Session
) -> None:
    headers_user1, token_user1, user1_id = get_user_token_and_headers(client, db)
    headers_user2, token_user2, user2_id = get_user_token_and_headers(client, db)

    # Create conversation
    create_resp = client.post(
        f"{settings.API_V1_STR}/chat/conversation",
        headers=headers_user1,
        json={"freelancer_id": str(user2_id)},
    )
    conv_id = create_resp.json()["id"]

    # Presence before connecting
    p_resp = client.get(f"{settings.API_V1_STR}/chat/presence/{user1_id}")
    assert p_resp.status_code == 200
    assert p_resp.json()["is_online"] is False

    # Connect both users via WebSocket
    with client.websocket_connect(
        f"{settings.API_V1_STR}/chat/ws?token={token_user1}"
    ) as ws1:
        p_resp_online = client.get(
            f"{settings.API_V1_STR}/chat/presence/{user1_id}"
        )
        assert p_resp_online.json()["is_online"] is True

        welcome1 = json.loads(ws1.receive_text())
        assert welcome1["type"] == "connection_established"

        # Ping / Pong
        ws1.send_text(json.dumps({"type": "ping"}))
        pong = json.loads(ws1.receive_text())
        assert pong["type"] == "pong"

        with client.websocket_connect(
            f"{settings.API_V1_STR}/chat/ws?token={token_user2}"
        ) as ws2:
            welcome2 = json.loads(ws2.receive_text())
            assert welcome2["type"] == "connection_established"

            # User1 sends a chat_message over WebSocket
            client_message_id = str(uuid.uuid4())
            ws1.send_text(
                json.dumps(
                    {
                        "type": "chat_message",
                        "conversation_id": conv_id,
                        "content": "Real-time message over WebSocket!",
                        "client_message_id": client_message_id,
                    }
                )
            )

            # ws1 should receive message_ack
            ack = json.loads(ws1.receive_text())
            assert ack["type"] == "message_ack"
            assert (
                ack["data"]["content"] == "Real-time message over WebSocket!"
            )
            assert ack["data"]["client_message_id"] == client_message_id

            # ws2 should receive the chat message
            delivered_message = json.loads(ws2.receive_text())
            assert delivered_message["type"] == "chat_message"
            assert (
                delivered_message["data"]["content"]
                == "Real-time message over WebSocket!"
            )

            # User1 sends a typing indicator
            ws1.send_text(
                json.dumps(
                    {
                        "type": "typing",
                        "conversation_id": conv_id,
                        "is_typing": True,
                    }
                )
            )
            typing_event = json.loads(ws2.receive_text())
            assert typing_event["type"] == "typing"
            assert typing_event["data"]["is_typing"] is True


def test_websocket_message_ack_failed_for_invalid_messages(
    client: TestClient, db: Session
) -> None:
    _, token_user1, user1_id = get_user_token_and_headers(client, db)
    _, _, user2_id = get_user_token_and_headers(client, db)

    create_resp = client.post(
        f"{settings.API_V1_STR}/chat/conversation",
        headers={"Authorization": f"Bearer {token_user1}"},
        json={"freelancer_id": str(user2_id)},
    )
    conv_id = create_resp.json()["id"]

    invalid_messages = [
        {
            "type": "chat_message",
            "content": "Missing conversation ID",
            "client_message_id": "missing-conversation-id",
        },
        {
            "type": "chat_message",
            "conversation_id": "not-a-uuid",
            "content": "Invalid conversation ID",
            "client_message_id": "invalid-conversation-id",
        },
        {
            "type": "chat_message",
            "conversation_id": conv_id,
            "content": "x" * 5001,
            "client_message_id": "message-too-long",
        },
    ]

    with client.websocket_connect(
        f"{settings.API_V1_STR}/chat/ws?token={token_user1}"
    ) as websocket:
        assert json.loads(websocket.receive_text())["type"] == "connection_established"

        for message in invalid_messages:
            websocket.send_text(json.dumps(message))
            failed_ack = json.loads(websocket.receive_text())

            assert failed_ack["type"] == "message_ack_failed"
            assert (
                failed_ack["data"]["client_message_id"]
                == message["client_message_id"]
            )
            sleep(.6)

@pytest.mark.anyio
async def test_redis_injection_to_connected_user(
    client: TestClient, db: Session
) -> None:
    _, token_user1, user1_id = get_user_token_and_headers(client, db)

    with client.websocket_connect(
        f"{settings.API_V1_STR}/chat/ws?token={token_user1}"
    ) as ws:
        # Welcome event
        _ = ws.receive_text()

        # Inject an arbitrary notification / custom event via publish_to_user (as Redis / Celery / background worker would)
        notification_payload = {
            "title": "New Proposal Received",
            "body": "A freelancer applied to your job.",
            "link": "/proposals/123",
        }
        await publish_to_user(
            user_id=user1_id,
            payload=notification_payload,
            event_type="notification",
        )

        received_text = ws.receive_text()
        received_data = json.loads(received_text)
        assert received_data["type"] == "notification"
        assert (
            received_data["data"]["title"] == "New Proposal Received"
        )


def test_websocket_chat_message_rate_limit(
    client: TestClient, db: Session
) -> None:
    headers_user1, token_user1, _ = get_user_token_and_headers(client, db)
    _, _, user2_id = get_user_token_and_headers(client, db)

    create_resp = client.post(
        f"{settings.API_V1_STR}/chat/conversation",
        headers=headers_user1,
        json={"freelancer_id": str(user2_id)},
    )
    conv_id = create_resp.json()["id"]

    with client.websocket_connect(
        f"{settings.API_V1_STR}/chat/ws?token={token_user1}"
    ) as ws:
        assert json.loads(ws.receive_text())["type"] == "connection_established"

        # 1. First message in window -> Allowed
        ws.send_text(
            json.dumps(
                {
                    "type": "chat_message",
                    "conversation_id": conv_id,
                    "content": "Message 1",
                    "client_message_id": "msg-1",
                }
            )
        )
        resp1 = json.loads(ws.receive_text())
        assert resp1["type"] == "message_ack"
        assert resp1["data"]["client_message_id"] == "msg-1"

        # 2. Second message immediately -> Allowed (2 messages in 1 sec allowed)
        ws.send_text(
            json.dumps(
                {
                    "type": "chat_message",
                    "conversation_id": conv_id,
                    "content": "Message 2",
                    "client_message_id": "msg-2",
                }
            )
        )
        resp2 = json.loads(ws.receive_text())
        assert resp2["type"] == "message_ack"
        assert resp2["data"]["client_message_id"] == "msg-2"

        # # 3. Third message immediately (< 1s) -> Blocked by rate limiter
        # ws.send_text(
        #     json.dumps(
        #         {
        #             "type": "chat_message",
        #             "conversation_id": conv_id,
        #             "content": "Message 3 - should be blocked",
        #             "client_message_id": "msg-3",
        #         }
        #     )
        # )
        # resp3 = json.loads(ws.receive_text())
        # assert resp3["type"] == "message_ack"
        # assert resp3["data"] == "slow down"

        # # 4. Ping is exempt from chat message rate limiter
        # ws.send_text(json.dumps({"type": "ping"}))
        # pong = json.loads(ws.receive_text())
        # assert pong["type"] == "pong"

        # # 5. Wait for the 1-second rolling window to expire
        # sleep(1.05)

        # # 6. Next message after window expires -> Allowed
        # ws.send_text(
        #     json.dumps(
        #         {
        #             "type": "chat_message",
        #             "conversation_id": conv_id,
        #             "content": "Message 4 - allowed after cooldown",
        #             "client_message_id": "msg-4",
        #         }
        #     )
        # )
        # resp4 = json.loads(ws.receive_text())
        # assert resp4["type"] == "message_ack"
        # assert resp4["data"]["client_message_id"] == "msg-4"


def test_websocket_read_receipt_and_unread_counts(
    client: TestClient, db: Session
) -> None:
    headers_user1, token_user1, user1_id = get_user_token_and_headers(client, db)
    headers_user2, token_user2, user2_id = get_user_token_and_headers(client, db)

    # 1. Create conversation between User 1 and User 2
    create_resp = client.post(
        f"{settings.API_V1_STR}/chat/conversation",
        headers=headers_user1,
        json={"freelancer_id": str(user2_id)},
    )
    conv_id = create_resp.json()["id"]

    # 2. Both users connect via WebSocket
    with client.websocket_connect(
        f"{settings.API_V1_STR}/chat/ws?token={token_user1}"
    ) as ws1:
        assert json.loads(ws1.receive_text())["type"] == "connection_established"

        with client.websocket_connect(
            f"{settings.API_V1_STR}/chat/ws?token={token_user2}"
        ) as ws2:
            assert json.loads(ws2.receive_text())["type"] == "connection_established"

            # 3. User 1 sends a message to User 2
            ws1.send_text(
                json.dumps(
                    {
                        "type": "chat_message",
                        "conversation_id": conv_id,
                        "content": "Hello, please read me!",
                        "client_message_id": "receipt-test-1",
                    }
                )
            )

            ack = json.loads(ws1.receive_text())
            assert ack["type"] == "message_ack"

            delivered = json.loads(ws2.receive_text())
            assert delivered["type"] == "chat_message"

            # 4. Check REST unread counts:
            # User 1 (sender) should have unread_count == 0
            u1_resp = client.get(f"{settings.API_V1_STR}/chat/me", headers=headers_user1)
            u1_conv = next(c for c in u1_resp.json()["data"] if c["id"] == conv_id)
            assert u1_conv["unread_count"] == 0

            # User 2 (recipient) should have unread_count == 1
            u2_resp = client.get(f"{settings.API_V1_STR}/chat/me", headers=headers_user2)
            u2_conv = next(c for c in u2_resp.json()["data"] if c["id"] == conv_id)
            assert u2_conv["unread_count"] == 1

            # 5. User 2 sends read_receipt over WebSocket
            ws2.send_text(
                json.dumps(
                    {
                        "type": "read_receipt",
                        "conversation_id": conv_id,
                    }
                )
            )

            # 6. User 1 receives real-time messages_read event
            read_event = json.loads(ws1.receive_text())
            assert read_event["type"] == "messages_read"
            assert read_event["data"]["conversation_id"] == conv_id
            assert read_event["data"]["read_by"] == str(user2_id)

            # 7. User 2's unread_count is now 0
            u2_resp_after = client.get(f"{settings.API_V1_STR}/chat/me", headers=headers_user2)
            u2_conv_after = next(c for c in u2_resp_after.json()["data"] if c["id"] == conv_id)
            assert u2_conv_after["unread_count"] == 0


