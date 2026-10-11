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
    Connection,
    JobPostPublic,
    Notification,
    NotificationEvent,
    NotificationPublic,
    Proposal,
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
    user_id: uuid.UUID,
    event: NotificationEvent,
    title: str,
    link: str,
    content: str,
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
        user_id=user_id, event=event, title=title, link=link, content=content, **target
    )
    with Session(engine) as session:
        # 1. Persist
        session.add(notification)
        session.commit()

        # 2. Reload with the relations NotificationPublic exposes.
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
        loaded = session.exec(stmt).one()
        public = to_public(loaded)
    try:
        await publish_to_user(
            user_id,
            public.model_dump(mode="json"),
            event_type="notification",
        )
    except Exception:
        logger.exception("Live push failed for notification %s", public.id)

    return public

def mark_notification_as_read(user_id: uuid.UUID, notification_id: uuid.UUID):
    with Session(engine) as session:
        notification: Notification | None = session.get(
            Notification, notification_id
        )
        if (
            notification
            and notification.user_id == user_id
            and not notification.is_read
        ):
            notification.is_read = True
            session.add(notification)
            session.commit()

def mark_all_notifications_as_read(user_id: uuid.UUID):
    with Session(engine) as session:
        notifications = session.exec(
            select(Notification)
            .where(
                Notification.user_id == user_id,
                Notification.is_read == False,  # type: ignore
            )
        ).all()
        for n in notifications:
            n.is_read = True
            session.add(n)
        if notifications:
            session.commit()