import uuid

from sqlmodel import Session, col, select

from app.core.db import engine
from app.core.redis import publish_to_user
from app.models import ChatMessage, Conversation


async def mark_all_messages_as_read(user_id: uuid.UUID, conversation_id: uuid.UUID):
    with Session(engine) as session:
        conv: Conversation | None = session.get(Conversation, conversation_id)
        if conv and (
            conv.client_id == user_id
            or conv.freelancer_id == user_id
        ):
            unreads = session.exec(
                select(ChatMessage).where(
                    ChatMessage.conversation_id == conversation_id,
                    ChatMessage.sender_id != user_id,
                    col(ChatMessage.is_read).is_(False),
                )
            ).all()
            for m in unreads:
                conv.unread_count = max(conv.unread_count - 1, 0)
                m.is_read = True
                session.add(m)
            if unreads:
                session.add(conv)
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
                            "conversation_id": str(conversation_id),
                            "read_by": str(user_id),
                        },
                    },
                )
            else:
                session.commit()
