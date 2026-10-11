import json
import logging
import uuid
from typing import Annotated, Any
from app.api.routes.notifications import mark_all_notifications_as_read, mark_notification_as_read, push_notification
from app.api.routes.message_mods import mark_all_messages_as_read
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
from pydantic import ValidationError
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
    Connection,
    ConnectionStatus,
    Conversation,
    ConversationCreate,
    ConversationDetailPublic,
    ConversationPublic,
    ConversationsPublic,
    InjectPayload,
    Notification,
    NotificationEvent,
    TokenPayload,
    User,
    UserPresence,
    UserPublic,
    UserRole,
    get_datetime_utc,
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

    # Permission check: clients can initiate, or connected users can initiate
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
    """
    WebSocket endpoint for real-time messaging, notifications, and custom event streaming.
    Authentication is performed via the 'token' query parameter.
    """
    await websocket.accept()
    if not token:
        await reject_websocket(websocket)
        return

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[security.ALGORITHM],
        )
        token_data = TokenPayload(**payload)
    except (InvalidTokenError, ValidationError):
        await reject_websocket(websocket)
        return

    with Session(engine) as session:
        user = session.get(User, ident=token_data.sub)
        if not user or not user.is_active:
            await reject_websocket(websocket)
            return
        user_id = user.id

    await connection_manager.connect(user_id, websocket)
    
    try:
        await websocket.send_text(
            json.dumps(
                {
                    "type": "connection_established",
                    "data": {"user_id": str(user_id)},
                }
            )
        )
        print("Connection established for user:", user_id)

        while True:
            text = await websocket.receive_text()
            print("Received message from user:", user_id, ":", text)

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
                print("Received chat_message event:", data)
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
                    try:
                        msg_dict = ChatMessagePublic.model_validate(
                            new_msg
                        ).model_dump()
                    except Exception as e:
                        ack_data = {
                            **msg_dict,
                            "client_message_id": data.get("client_message_id"),
                        }
                        await websocket.send_text(
                            json.dumps(
                                {"type": "message_ack_failed", "data": ack_data}, default=str
                            )
                        )
                        continue
                    conv.updated_at = get_datetime_utc()
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
                    "client_message_id": data.get("client_message_id"),
                }
                await websocket.send_text(
                    json.dumps(
                        {"type": "message_ack", "data": ack_data}, default=str
                    )
                )

                await push_notification(
                    user_id=recipient_id,
                    event=NotificationEvent.MESSAGE_RECEIVED,
                    title="New Message",
                    link="",
                    content="You have a new message",
                    chat_message_id=new_msg.id,
                )
                await publish_to_user(
                    recipient_id,
                    payload={"type": "chat_message", "data": msg_dict},
                )
                continue
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

            # 4. Read receipt frame..
            # well what if i send that some notification was read.
            if event_type == "read_receipt":
                if "notification_id" in data:
                    notification_id_raw = data.get("notification_id")
                    if notification_id_raw:
                        if notification_id_raw == "all_notifications":
                            mark_all_notifications_as_read(user_id)
                        else:
                            try:
                                mark_notification_as_read(user_id, uuid.UUID(str(notification_id_raw)))
                            except ValueError:
                                pass
                if "conversation_id" in data:
                    conv_id_raw = data.get("conversation_id")
                    if conv_id_raw:
                        try:
                            await mark_all_messages_as_read(user_id, uuid.UUID(str(conv_id_raw)))
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

