import json
import uuid

import jwt
from fastapi import (
    WebSocket,
)
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError
from sqlmodel import Session, col, func, select

from app.api.routes.message_mods import mark_all_messages_as_read
from app.api.routes.notifications import (
    mark_all_notifications_as_read,
    mark_notification_as_read,
)
from app.core import security
from app.core.config import settings
from app.core.db import engine
from app.core.redis import publish_to_user
from app.models import (
    ChatMessage,
    ChatMessagePublic,
    Conversation,
    ConversationPublic,
    TokenPayload,
    User,
    UserPublic,
    get_datetime_utc,
)


def _build_conversation_public(
    conversation: Conversation, current_user_id: uuid.UUID, session: Session
) -> ConversationPublic:
    other_id = (
        conversation.freelancer_id
        if current_user_id == conversation.client_id
        else conversation.client_id
    )
    other_user = session.get(User, other_id)
    other_user_public = UserPublic.model_validate(other_user) if other_user else None

    # Get last message
    last_msg_stmt = (
        select(ChatMessage)
        .where(ChatMessage.conversation_id == conversation.id)
        .order_by(ChatMessage.created_at.desc())  # type: ignore
        .limit(1)
    )
    last_msg = session.exec(last_msg_stmt).first()
    last_msg_public = (
        ChatMessagePublic.model_validate(last_msg) if last_msg else None
    )

    # Get unread count for current user
    unread_count_stmt = (
        select(func.count())
        .select_from(ChatMessage)
        .where(
            ChatMessage.conversation_id == conversation.id,
            ChatMessage.sender_id != current_user_id,
            col(ChatMessage.is_read).is_(False),
        )
    )
    unread_count = session.exec(unread_count_stmt).one()

    return ConversationPublic(
        id=conversation.id,
        client_id=conversation.client_id,
        freelancer_id=conversation.freelancer_id,
        creator_id=conversation.creator_id,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        last_message=last_msg_public,
        unread_count=unread_count,
        other_user=other_user_public,
    )

def get_user_id_from_token(token: str) -> uuid.UUID | None:
    """
    Decode the JWT token and extract the user ID (subject).
    Returns None if the token is invalid or expired.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[security.ALGORITHM],
        )
        token_data = TokenPayload(**payload)
        return uuid.UUID(token_data.sub)
    except (InvalidTokenError, ValidationError, ValueError):
        return None

async def chat_send_error_message(websocket: WebSocket, message_id: str, what: str):
    error: dict = {
        "type": "message_ack_failed",
        "data": {
            "error": what,
            "client_message_id": message_id
        }
    }
    await websocket.send_text(
        json.dumps(error)
    )

async def chat_message(data: dict[any, any], websocket: WebSocket, user_id: uuid.UUID) -> None:
    conv_id_raw = data.get("conversation_id")
    content = (data.get("content") or "").strip()
    client_message_id = data.get("client_message_id")
    if not conv_id_raw or not content:
        await chat_send_error_message(
            websocket,
            client_message_id,
            "bad transaction"
        )
        return
    try:
        conv_id = uuid.UUID(str(conv_id_raw))
    except ValueError:
        await chat_send_error_message(
            websocket,
            client_message_id,
            "bad transaction"
        )
        return

    with Session(engine) as session:
        conv = session.get(Conversation, conv_id)
        if not conv or (
            conv.client_id != user_id
            and conv.freelancer_id != user_id
        ):
            await chat_send_error_message(
                websocket,
                client_message_id,
                "unauthorized"
            )
            return
        new_msg = ChatMessage(
            conversation_id=conv_id,
            sender_id=user_id,
            content=content,
            created_at=get_datetime_utc(),
        )
        try:
            msg_dict = ChatMessagePublic.model_validate(
                new_msg
            ).model_dump()
        except Exception:
            await chat_send_error_message(
                websocket,
                client_message_id,
                "bad transaction"
            )
            return
        conv.updated_at = get_datetime_utc()
        conv.unread_count += 1
        session.add(new_msg)
        session.add(conv)
        session.commit()
        session.refresh(new_msg)

        recipient_id = (
            conv.freelancer_id
            if user_id == conv.client_id
            else conv.client_id
        )

    # Send confirmation ack back to sender
    ack_data = {
        **msg_dict,
        "client_message_id": client_message_id,
    }
    await websocket.send_text(
        json.dumps(
            {"type": "message_ack", "data": ack_data}, default=str
        )
    )

    # I am already sending the  msg why
    # send the notification again? I will
    # just send the message to the recipient
    # and let them handle the notification..

    # await push_notification(
    #     user_id=recipient_id,
    #     event=NotificationEvent.MESSAGE_RECEIVED,
    #     title="New Message",
    #     link="",
    #     content="You have a new message",
    #     chat_message_id=new_msg.id,
    # )

    await publish_to_user(
        recipient_id,
        payload={"type": "chat_message", "data": msg_dict},
    )

async def user_typing(data: dict[any, any], websocket: WebSocket, user_id: uuid.UUID):
    conv_id_raw = data.get("conversation_id")
    if not conv_id_raw:
        return
    conv_id = uuid.UUID(str(conv_id_raw))
    with Session(engine) as session:
        conv = session.get(Conversation, conv_id)
        if conv and (
            conv.client_id == user_id
            or conv.freelancer_id == user_id
        ):
            recipient_id = (
                conv.freelancer_id
                if user_id == conv.client_id
                else conv.client_id
            )
            await publish_to_user(
                recipient_id,
                payload={
                    "type": "typing",
                    "data": {
                        "conversation_id": str(conv_id),
                        "user_id": str(user_id),
                        "is_typing": data.get("is_typing", True),
                    },
                },
            )

async def read_receipt(data: dict[any, any], websocket: WebSocket, user_id: uuid.UUID):
    if "notification_id" in data:
        notification_id_raw = data.get("notification_id")
        if notification_id_raw:
            if notification_id_raw == "all_notifications":
                mark_all_notifications_as_read(user_id)
            else:
                mark_notification_as_read(user_id, uuid.UUID(str(notification_id_raw)))
    if "conversation_id" in data:
        conv_id_raw = data.get("conversation_id")
        if conv_id_raw:
            await mark_all_messages_as_read(user_id, uuid.UUID(str(conv_id_raw)))
