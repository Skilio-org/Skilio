import json
import logging
import uuid
from typing import Annotated, Any

import jwt
from fastapi import (
    APIRouter,
    HTTPException,
    Query,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from jwt.exceptions import InvalidTokenError
from pydantic import BaseModel, ValidationError
from sqlmodel import Session, and_, col, func, or_, select

from app.api.deps import CurrentUser, SessionDep
from app.core import security
from app.core.config import settings
from app.core.db import engine
from app.core.redis import broadcast_to_all, publish_to_user
from app.models import (
    ChatMessage,
    ChatMessagePost,
    ChatMessagePublic,
    Conversation,
    ConversationCreate,
    ConversationDetailPublic,
    ConversationPublic,
    ConversationsPublic,
    TokenPayload,
    User,
    UserPublic,
    get_datetime_utc,
    UserPresence,
    InjectPayload
)
from app.services.connection_manager import connection_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])


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
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        last_message=last_msg_public,
        unread_count=unread_count,
        other_user=other_user_public,
    )


@router.get("/me", response_model=ConversationsPublic)
def get_my_conversations(
    session: SessionDep, current_user: CurrentUser
) -> Any:
    """
    Get all conversations for the authenticated user (as client or freelancer).
    """
    statement = (
        select(Conversation)
        .where(
            or_(
                Conversation.client_id == current_user.id,
                Conversation.freelancer_id == current_user.id,
            )
        )
        .order_by(Conversation.updated_at.desc())  # type: ignore
    )
    conversations = session.exec(statement).all()

    data = [
        _build_conversation_public(conv, current_user.id, session)
        for conv in conversations
    ]
    return ConversationsPublic(data=data, count=len(data))


@router.get("/conversation/{conversation_id}", response_model=ConversationDetailPublic)
def get_conversation_details(
    conversation_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Get a specific conversation and all its messages.
    Automatically marks unread incoming messages as read.
    """
    conversation = session.get(Conversation, conversation_id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    if (
        current_user.id != conversation.client_id
        and current_user.id != conversation.freelancer_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this conversation",
        )
    messages_stmt = (
        select(ChatMessage)
        .where(ChatMessage.conversation_id == conversation_id)
        .order_by(ChatMessage.created_at.asc())  # type: ignore
    )
    messages = session.exec(messages_stmt).all()
    unreads_marked = False
    for msg in messages:
        if msg.sender_id != current_user.id and not msg.is_read:
            msg.is_read = True
            session.add(msg)
            unreads_marked = True

    if unreads_marked:
        session.commit()

    conv_summary = _build_conversation_public(conversation, current_user.id, session)
    messages_public = [ChatMessagePublic.model_validate(m) for m in messages]

    return ConversationDetailPublic(
        id=conv_summary.id,
        client_id=conv_summary.client_id,
        freelancer_id=conv_summary.freelancer_id,
        created_at=conv_summary.created_at,
        updated_at=conv_summary.updated_at,
        last_message=conv_summary.last_message,
        unread_count=0,
        other_user=conv_summary.other_user,
        messages=messages_public,
    )


@router.post("/conversation", response_model=ConversationPublic)
def create_or_get_conversation(
    conversation_in: ConversationCreate,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Create a new conversation or retrieve an existing one between current user and target user.
    """
    target_id = conversation_in.freelancer_id
    if target_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot start a conversation with yourself",
        )

    target_user = session.get(User, target_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target user not found",
        )

    # Check if conversation already exists (either client-freelancer or vice-versa)
    existing_stmt = select(Conversation).where(
        or_(
            and_(
                Conversation.client_id == current_user.id,
                Conversation.freelancer_id == target_id,
            ),
            and_(
                Conversation.client_id == target_id,
                Conversation.freelancer_id == current_user.id,
            ),
        )
    )
    existing = session.exec(existing_stmt).first()
    if existing:
        return _build_conversation_public(existing, current_user.id, session)

    new_conv = Conversation(
        client_id=current_user.id,
        freelancer_id=target_id,
        created_at=get_datetime_utc(),
        updated_at=get_datetime_utc(),
    )
    session.add(new_conv)
    session.commit()
    session.refresh(new_conv)

    return _build_conversation_public(new_conv, current_user.id, session)


@router.post(
    "/conversation/{conversation_id}/messages",
    response_model=ChatMessagePublic,
)
async def send_message_rest(
    conversation_id: uuid.UUID,
    message_in: ChatMessagePost,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Send a message in a conversation via REST.
    Persists to DB and dispatches in real time to the recipient via Redis / WebSockets.
    """
    conversation = session.get(Conversation, conversation_id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    if (
        current_user.id != conversation.client_id
        and current_user.id != conversation.freelancer_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to send messages in this conversation",
        )

    new_msg = ChatMessage(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        content=message_in.content,
        attachment_id=message_in.attachment_id,
        created_at=get_datetime_utc(),
    )
    conversation.updated_at = get_datetime_utc()
    session.add(new_msg)
    session.add(conversation)
    session.commit()
    session.refresh(new_msg)

    msg_public = ChatMessagePublic.model_validate(new_msg)

    # Deliver to recipient via Redis Pub/Sub / WebSocket
    recipient_id = (
        conversation.freelancer_id
        if current_user.id == conversation.client_id
        else conversation.client_id
    )
    await publish_to_user(
        recipient_id,
        payload={
            "type": "chat_message",
            "data": msg_public.model_dump(),
        },
    )

    return msg_public


@router.get("/presence/{user_id}", response_model=UserPresence)
def check_user_presence(user_id: uuid.UUID) -> Any:
    """
    Check if a given user currently has active WebSocket connections.
    """
    is_online = connection_manager.is_user_online(user_id)
    return UserPresence(user_id=user_id, is_online=is_online)


@router.post("/inject")
async def inject_event(
    body: InjectPayload,
    current_user: CurrentUser,
) -> Any:
    """
    Inject any notification, message, or custom payload to a specific user or broadcast to all.
    Available to superusers or internal system callers.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superusers can inject arbitrary events",
        )

    if body.user_id:
        await publish_to_user(
            body.user_id, payload=body.payload, event_type=body.event_type
        )
    else:
        await broadcast_to_all(payload=body.payload, event_type=body.event_type)

    return {"status": "ok", "message": "Event injected successfully"}


@router.websocket("/ws")
async def websocket_chat_endpoint(
    websocket: WebSocket,
    token: Annotated[str | None, Query()] = None,
) -> None:
    """
    WebSocket endpoint for real-time messaging, notifications, and custom event streaming.
    Authentication is performed via the 'token' query parameter.
    """
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (InvalidTokenError, ValidationError):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    with Session(engine) as session:
        user = session.get(User, ident=token_data.sub)
        if not user or not user.is_active:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        user_id = user.id

    await connection_manager.connect(user_id, websocket)

    try:
        # Welcome event on connect
        await websocket.send_text(
            json.dumps(
                {
                    "type": "connection_established",
                    "data": {"user_id": str(user_id)},
                }
            )
        )

        while True:
            text = await websocket.receive_text()
            try:
                data = json.loads(text)
            except Exception:
                # Raw text ignored or echoed
                continue

            event_type = data.get("type", "custom")

            # 1. Heartbeat Ping / Pong
            if event_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
                continue

            # 2. Chat Message frame
            if event_type == "chat_message":
                conv_id_raw = data.get("conversation_id")
                content = (data.get("content") or "").strip()
                if not conv_id_raw or not content:
                    continue

                try:
                    conv_id = uuid.UUID(str(conv_id_raw))
                except ValueError:
                    continue

                with Session(engine) as session:
                    conv = session.get(Conversation, conv_id)
                    if not conv or (
                        conv.client_id != user_id
                        and conv.freelancer_id != user_id
                    ):
                        await websocket.send_text(
                            json.dumps(
                                {
                                    "type": "error",
                                    "data": "Unauthorized conversation",
                                }
                            )
                        )
                        continue

                    new_msg = ChatMessage(
                        conversation_id=conv_id,
                        sender_id=user_id,
                        content=content,
                        created_at=get_datetime_utc(),
                    )
                    conv.updated_at = get_datetime_utc()
                    session.add(new_msg)
                    session.add(conv)
                    session.commit()
                    session.refresh(new_msg)

                    msg_dict = ChatMessagePublic.model_validate(
                        new_msg
                    ).model_dump()
                    recipient_id = (
                        conv.freelancer_id
                        if user_id == conv.client_id
                        else conv.client_id
                    )

                # Send confirmation ack back to sender
                await websocket.send_text(
                    json.dumps(
                        {"type": "message_ack", "data": msg_dict}, default=str
                    )
                )

                # Route message to recipient via Redis / WebSocket
                await publish_to_user(
                    recipient_id,
                    payload={"type": "chat_message", "data": msg_dict},
                )
                continue

            # 3. Typing indicator
            if event_type == "typing":
                conv_id_raw = data.get("conversation_id")
                if not conv_id_raw:
                    continue
                try:
                    conv_id = uuid.UUID(str(conv_id_raw))
                except ValueError:
                    continue

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
                continue

            # 4. Read receipt frame
            if event_type == "read_receipt":
                conv_id_raw = data.get("conversation_id")
                if conv_id_raw:
                    try:
                        conv_id = uuid.UUID(str(conv_id_raw))
                        with Session(engine) as session:
                            conv = session.get(Conversation, conv_id)
                            if conv and (
                                conv.client_id == user_id
                                or conv.freelancer_id == user_id
                            ):
                                unreads = session.exec(
                                    select(ChatMessage).where(
                                        ChatMessage.conversation_id == conv_id,
                                        ChatMessage.sender_id != user_id,
                                        col(ChatMessage.is_read).is_(False),
                                    )
                                ).all()
                                for m in unreads:
                                    m.is_read = True
                                    session.add(m)
                                if unreads:
                                    session.commit()
                                recipient_id = (
                                    conv.freelancer_id
                                    if user_id == conv.client_id
                                    else conv.client_id
                                )
                                await publish_to_user(
                                    recipient_id,
                                    payload={
                                        "type": "messages_read",
                                        "data": {
                                            "conversation_id": str(conv_id),
                                            "read_by": str(user_id),
                                        },
                                    },
                                )
                    except ValueError:
                        pass
                continue

            # 5. Generic Event forwarding (if recipient_id is provided)
            target_user_raw = data.get("recipient_id") or data.get("user_id")
            if target_user_raw:
                try:
                    target_uid = uuid.UUID(str(target_user_raw))
                    await publish_to_user(target_uid, payload=data)
                except ValueError:
                    pass

    except WebSocketDisconnect:
        connection_manager.disconnect(user_id, websocket)
    except Exception as e:
        logger.error("WebSocket unexpected error for user %s: %s", user_id, e)
        connection_manager.disconnect(user_id, websocket)
