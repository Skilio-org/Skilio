import json
import logging
import uuid
from time import time
from typing import Annotated, Any

from fastapi import (
    APIRouter,
    HTTPException,
    Query,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from sqlmodel import Session, and_, or_, select

from app.api.deps import CurrentUser, SessionDep
from app.api.utils.chat import (
    _build_conversation_public,
    chat_message,
    chat_send_error_message,
    get_user_id_from_token,
    read_receipt,
    user_typing,
)
from app.core.config import settings
from app.core.db import engine
from app.core.redis import broadcast_to_all, publish_to_user
from app.models import (
    ChatMessage,
    ChatMessagePost,
    ChatMessagePublic,
    Connection,
    ConnectionStatus,
    Conversation,
    ConversationCreate,
    ConversationDetailPublic,
    ConversationPublic,
    ConversationsPublic,
    InjectPayload,
    User,
    UserPresence,
    UserRole,
    get_datetime_utc,
)
from app.services.connection_manager import connection_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])


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
async def get_conversation_details(
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
        recipient_id = (
            conversation.freelancer_id
            if current_user.id == conversation.client_id
            else conversation.client_id
        )
        await publish_to_user(
            recipient_id,
            payload={
                "type": "messages_read",
                "data": {
                    "conversation_id": str(conversation_id),
                    "read_by": str(current_user.id),
                },
            },
        )

    conv_summary = _build_conversation_public(conversation, current_user.id, session)
    messages_public = [ChatMessagePublic.model_validate(m) for m in messages]

    return ConversationDetailPublic(
        id=conv_summary.id,
        client_id=conv_summary.client_id,
        freelancer_id=conv_summary.freelancer_id,
        creator_id=conv_summary.creator_id,
        created_at=conv_summary.created_at,
        updated_at=conv_summary.updated_at,
        last_message=conv_summary.last_message,
        unread_count=conv_summary.unread_count,
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

    if current_user.active_role != UserRole.CLIENT and not current_user.is_superuser:
        conn_stmt = select(Connection).where(
            or_(
                and_(
                    Connection.sender_id == current_user.id,
                    Connection.receiver_id == target_id,
                    Connection.status == ConnectionStatus.ACCEPTED,
                ),
                and_(
                    Connection.sender_id == target_id,
                    Connection.receiver_id == current_user.id,
                    Connection.status == ConnectionStatus.ACCEPTED,
                ),
            )
        )
        is_connected = session.exec(conn_stmt).first()
        if not is_connected:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only clients or connected users can initiate a conversation",
            )

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

    if current_user.active_role == UserRole.CLIENT:
        conv_client_id = current_user.id
        conv_freelancer_id = target_id
    elif target_user.active_role == UserRole.CLIENT:
        conv_client_id = target_id
        conv_freelancer_id = current_user.id
    else:
        conv_client_id = current_user.id
        conv_freelancer_id = target_id

    new_conv = Conversation(
        client_id=conv_client_id,
        freelancer_id=conv_freelancer_id,
        creator_id=current_user.id,
        created_at=get_datetime_utc(),
        updated_at=get_datetime_utc(),
    )
    session.add(new_conv)
    session.commit()
    session.refresh(new_conv)

    return _build_conversation_public(new_conv, current_user.id, session)


@router.delete("/conversation/message/{message_id}", response_model=ChatMessagePublic)
async def delete_message(
    message_id: str,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Delete a message from a conversation.
    """
    uuid_message = uuid.UUID(message_id)
    message = session.get(ChatMessage, uuid_message)
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )
    conversation = session.get(Conversation, message.conversation_id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    if message.sender_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this message",
        )

    session.delete(message)
    session.commit()

    await publish_to_user(
        conversation.client_id if conversation.client_id != current_user.id else conversation.freelancer_id,
        payload={
            "type": "message_deleted",
            "data": {
                "id": str(message.id),
                "conversation_id": str(message.conversation_id),
            },
        },
    )

    return ChatMessagePublic.model_validate(message)

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
    conversation.unread_count += 1
    conversation.updated_at = get_datetime_utc()
    session.add(new_msg)
    session.add(conversation)
    session.commit()
    session.refresh(new_msg)

    msg_public = ChatMessagePublic.model_validate(new_msg)

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

async def reject_websocket(websocket: WebSocket, code: int = status.WS_1008_POLICY_VIOLATION, reason: str = "Invalid or expired token") -> None:
    await websocket.close(code=code,reason=reason)

@router.websocket("/ws")
async def websocket_chat_endpoint(
    websocket: WebSocket,
    token: Annotated[str | None, Query()] = None,
) -> None:
    message_timestamps: list[float] = []
    total_frame_timestamps: list[float] = []
    await websocket.accept()
    if not token:
        await reject_websocket(websocket)
        return

    user_id = get_user_id_from_token(token)
    if not user_id:
        await reject_websocket(websocket)
        return

    with Session(engine) as session:
        user = session.get(User, ident=user_id)
        if not user or not user.is_active:
            await reject_websocket(websocket)
            return

    await connection_manager.connect(user_id, websocket)

    try:
        await websocket.send_text(
            json.dumps({"type": "connection_established", "data": {"user_id": str(user_id)}})
        )

        while True:
            text = await websocket.receive_text()
            if len(text) > settings.MAX_FRAME_SIZE:
                await websocket.close(
                    code=status.WS_1009_MESSAGE_TOO_BIG,
                    reason="Frame exceeds maximum allowed size",
                )
                break

            current_time = time()
            total_frame_timestamps = [t for t in total_frame_timestamps if current_time - t < 1.0]
            if len(total_frame_timestamps) >= settings.TOTAL_FRAME_LIMIT:
                await websocket.close(
                    code=status.WS_1008_POLICY_VIOLATION,
                    reason="Exceeded maximum frame rate limit",
                )
                break
            total_frame_timestamps.append(current_time)
            try:
                data = json.loads(text)
            except Exception:
                continue

            event_type = data.get("type", "custom")
            logger.info(f"Event: {event_type} By: {user_id}")
            if event_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
                continue
            if event_type == "chat_message":
                message_timestamps = [
                    t for t in message_timestamps if current_time - t < settings.RATE_LIMIT_WINDOW
                ]
                if len(message_timestamps) >= settings.MAX_MESSAGES_PER_SECOND:
                    await chat_send_error_message(
                        websocket,
                        data.get("client_message_id"),
                        "slow down"
                    )
                    continue
                message_timestamps.append(current_time)
                await chat_message(data, websocket, user_id)
                continue

            if event_type == "typing":
                await user_typing(data, websocket, user_id)
                continue
            if event_type == "read_receipt":
                await read_receipt(data, websocket, user_id)
                continue
            else:
                target_user_raw = data.get("recipient_id") or data.get("user_id")
                if target_user_raw:
                    target_uid = uuid.UUID(str(target_user_raw))
                    await publish_to_user(target_uid, payload=data)

    except (WebSocketDisconnect, Exception) as e:
        logger.info(f"WebSocket closed for user {user_id}: {e}")
    finally:
        connection_manager.disconnect(user_id, websocket)
