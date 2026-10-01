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
from pydantic import ValidationError
from requests import session
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
    JobPostPublic,
    Notification,
    NotificationEvent,
    NotificationPublic,
    Proposal,
    TokenPayload,
    User,
    UserPresence,
    UserPublic,
    UserRole,
    get_datetime_utc,
)
from app.services.connection_manager import connection_manager


from sqlalchemy.orm import selectinload

logger = logging.getLogger(__name__)

_TARGET_KEYS = {
    "proposal_id", "connection_id", "review_id", "job_post_id", "chat_message_id",
}

router = APIRouter(prefix="/notifications", tags=["notifications"])

def to_public(n: Notification) -> NotificationPublic:
    job = (
        n.job_post
        or (n.proposal.job_post if n.proposal else None)
        or (n.connection.job_post if n.connection else None)
    )
    out = NotificationPublic.model_validate(n)
    out.job_post = JobPostPublic.model_validate(job) if job else None
    return out

@router.get("/me", response_model=list[NotificationPublic])
def get_my_notifications(
    session: SessionDep, current_user: CurrentUser
) -> list[NotificationPublic]:
    notifications = (
        session.exec(
            select(Notification)
            .where(Notification.user_id == current_user.id)
            .order_by(Notification.created_at.desc())
        )
        .all()
    )
    return [to_public(n) for n in notifications]


async def push_notification(
    # session: AsyncSession,
    user_id: uuid.UUID,
    event: NotificationEvent,
    title: str,
    message: str,
    **target: uuid.UUID,
) -> NotificationPublic:
    """
    Save a notification for a user, then push it live.
    `target` must contain exactly one of: proposal_id, connection_id,
    review_id, job_post_id, chat_message_id.
    """
    if len(target) != 1 or not set(target) <= _TARGET_KEYS:
        raise ValueError(f"Pass exactly one target of {sorted(_TARGET_KEYS)}")

    notification = Notification(
        user_id=user_id, event=event, title=title, message=message, **target
    )
    with Session(engine) as session:
    # 1. Persist
        session.add(notification)
        await session.commit()

    # 2. Reload with the relations NotificationPublic exposes
    #    (needed because commit expires the object and async can't lazy-load)
    stmt = (
        select(Notification)
        .where(Notification.id == notification.id)
        .options(
            selectinload(Notification.proposal).selectinload(Proposal.freelancer),
            selectinload(Notification.proposal).selectinload(Proposal.job_post),
            selectinload(Notification.connection).selectinload(Connection.sender),
            selectinload(Notification.connection).selectinload(Connection.job_post),
            selectinload(Notification.review),
            selectinload(Notification.chat_message),
            selectinload(Notification.job_post),
        )
    )
    loaded = (await session.exec(stmt)).one()
    public = NotificationPublic.model_validate(loaded)
    return public
    # # 3. Push live. A push failure must never undo or break the saved notification.
    # try:
    #     await publish_to_user(
    #         user_id,
    #         public.model_dump(mode="json"),
    #         event_type="notification",
    #     )
    # except Exception:
    #     logger.exception("Live push failed for notification %s", public.id)
    # return public