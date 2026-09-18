Here is a complete `chat.py` router file styled to match your project's structure, dependencies, and authentication flow using `SessionDep`, `CurrentUser`, and `SQLModel`.

```python
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.core import security
from app.core.config import settings
from app.models import (
    ChatMessage,
    ChatMessageCreate,
    ChatMessagePublic,
    ChatMessagesPublic,
    Conversation,
    ConversationCreate,
    ConversationPublic,
    ConversationsPublic,
    User,
)

router = APIRouter(prefix="/chat", tags=["chat"])


# ==============================================================================
# Connection Manager
# ==============================================================================

class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: dict[uuid.UUID, list[WebSocket]] = {}

    async def connect(self, conversation_id: uuid.UUID, websocket: WebSocket) -> None:
        await websocket.accept()
        if conversation_id not in self.active_connections:
            self.active_connections[conversation_id] = []
        self.active_connections[conversation_id].append(websocket)

    def disconnect(self, conversation_id: uuid.UUID, websocket: WebSocket) -> None:
        if conversation_id in self.active_connections:
            self.active_connections[conversation_id].remove(websocket)
            if not self.active_connections[conversation_id]:
                del self.active_connections[conversation_id]

    async def broadcast(self, conversation_id: uuid.UUID, message_data: dict[str, Any]) -> None:
        if conversation_id in self.active_connections:
            for connection in self.active_connections[conversation_id]:
                await connection.send_json(message_data)


manager = ConnectionManager()


# ==============================================================================
# Helper Functions
# ==============================================================================

def get_user_from_token(token: str, session: SessionDep) -> User | None:
    """Helper to authenticate user from raw JWT token string (for WebSockets)."""
    try:
        payload = security.jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        user_id = payload.get("sub")
        if not user_id:
            return None
        return session.get(User, uuid.UUID(user_id))
    except Exception:
        return None


# ==============================================================================
# REST Routes
# ==============================================================================

@router.post("/conversations", response_model=ConversationPublic)
def create_or_get_conversation(
    session: SessionDep,
    current_user: CurrentUser,
    body: ConversationCreate,
) -> Any:
    """
    Create a conversation between the current user and a target freelancer/client,
    or retrieve the existing one if it already exists.
    """
    if body.freelancer_id == current_user.id:
        raise HTTPException(
            status_code=400, detail="Cannot start a conversation with yourself"
        )

    # Check for existing conversation
    statement = select(Conversation).where(
        (
            (Conversation.client_id == current_user.id)
            & (Conversation.freelancer_id == body.freelancer_id)
        )
        | (
            (Conversation.client_id == body.freelancer_id)
            & (Conversation.freelancer_id == current_user.id)
        )
    )
    conv = session.exec(statement).first()

    if not conv:
        conv = Conversation(
            client_id=current_user.id, freelancer_id=body.freelancer_id
        )
        session.add(conv)
        session.commit()
        session.refresh(conv)

    return conv


@router.get("/conversations", response_model=ConversationsPublic)
def list_conversations(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    List all active conversations for the authenticated user.
    """
    statement = (
        select(Conversation)
        .where(
            (Conversation.client_id == current_user.id)
            | (Conversation.freelancer_id == current_user.id)
        )
        .offset(skip)
        .limit(limit)
    )
    conversations = session.exec(statement).all()

    results = []
    for conv in conversations:
        # Fetch last message
        last_msg_stmt = (
            select(ChatMessage)
            .where(ChatMessage.conversation_id == conv.id)
            .order_by(ChatMessage.created_at.desc())  # ty:ignore[unresolved-attribute]
        )
        last_msg = session.exec(last_msg_stmt).first()

        # Count unread messages sent by the other party
        unread_stmt = select(ChatMessage).where(
            ChatMessage.conversation_id == conv.id,
            ChatMessage.sender_id != current_user.id,
            ChatMessage.is_read == False,
        )
        unread_count = len(session.exec(unread_stmt).all())

        conv_public = ConversationPublic(
            id=conv.id,
            client_id=conv.client_id,
            freelancer_id=conv.freelancer_id,
            created_at=conv.created_at,
            updated_at=conv.updated_at,
            last_message=ChatMessagePublic.model_validate(last_msg) if last_msg else None,
            unread_count=unread_count,
        )
        results.append(conv_public)

    return ConversationsPublic(data=results, count=len(results))


@router.get("/conversations/{conversation_id}/messages", response_model=ChatMessagesPublic)
def get_conversation_messages(
    conversation_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 50,
) -> Any:
    """
    Retrieve paginated messages for a conversation and mark received messages as read.
    """
    conv = session.get(Conversation, conversation_id)
    if not conv or current_user.id not in (conv.client_id, conv.freelancer_id):
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Mark unread messages sent to current_user as read
    unread_messages = session.exec(
        select(ChatMessage).where(
            ChatMessage.conversation_id == conversation_id,
            ChatMessage.sender_id != current_user.id,
            ChatMessage.is_read == False,
        )
    ).all()

    for msg in unread_messages:
        msg.is_read = True
        session.add(msg)
    session.commit()

    # Get conversation messages ordered by creation time
    messages_stmt = (
        select(ChatMessage)
        .where(ChatMessage.conversation_id == conversation_id)
        .order_by(ChatMessage.created_at.asc())
        .offset(skip)
        .limit(limit)
    )
    messages = session.exec(messages_stmt).all()

    return ChatMessagesPublic(
        data=[ChatMessagePublic.model_validate(m) for m in messages],
        count=len(messages),
    )


# ==============================================================================
# WebSocket Route
# ==============================================================================

@router.websocket("/ws/{conversation_id}")
async def chat_websocket(
    websocket: WebSocket,
    conversation_id: uuid.UUID,
    token: str,
    session: SessionDep,
) -> None:
    """
    WebSocket endpoint for real-time bi-directional messaging.
    Connect via: ws://<host>/api/v1/chat/ws/<conversation_id>?token=<JWT_TOKEN>
    """
    # 1. Authenticate user from JWT token
    user = get_user_from_token(token=token, session=session)
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 2. Authorization check
    conv = session.get(Conversation, conversation_id)
    if not conv or user.id not in (conv.client_id, conv.freelancer_id):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(conversation_id, websocket)

    try:
        while True:
            # Receive incoming JSON payload from WebSocket connection
            data = await websocket.receive_json()

            content = data.get("content")
            attachment_id = data.get("attachment_id")

            if not content:
                continue

            # Persist message to database
            message = ChatMessage(
                conversation_id=conversation_id,
                sender_id=user.id,
                content=content,
                attachment_id=uuid.UUID(attachment_id) if attachment_id else None,
            )
            session.add(message)
            session.commit()
            session.refresh(message)

            # Broadcast serialized message model to all active clients in conversation
            payload = ChatMessagePublic.model_validate(message).model_dump(mode="json")
            await manager.broadcast(conversation_id, payload)

    except WebSocketDisconnect:
        manager.disconnect(conversation_id, websocket)