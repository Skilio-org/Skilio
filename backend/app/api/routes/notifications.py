# from app.services.connection_manager import connection_manager
import logging
import uuid

from fastapi import (
    APIRouter,
    # HTTPException,
    # Query,
    # WebSocket,
    # WebSocketDisconnect,
    # status,
)
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

# and_, col, func, or_, 
from app.api.deps import CurrentUser, SessionDep
from app.core.db import engine
from app.core.redis import publish_to_user
from app.models import (
    ChatMessagePublic,
    Connection,
    ConnectionPublic,
    JobPost,
    JobPostPublic,
    Notification,
    NotificationEvent,
    NotificationPublic,
    Proposal,
    ProposalPublic,
    Review,
    ReviewPublic,
)

logger = logging.getLogger(__name__)

_TARGET_KEYS = {
    "proposal_id", "connection_id", "review_id", "job_post_id", "chat_message_id",
}

router = APIRouter(prefix="/notifications", tags=["notifications"])

def to_public(n: Notification) -> NotificationPublic:
    job: JobPost|None = (
        n.job_post
        or (n.proposal.job_post if n.proposal else None)
        or (n.connection.job_post if n.connection else None)
    )
    out = NotificationPublic.model_validate(n)

    out.job_post = JobPostPublic.model_validate(job) if job else None
    out.connection = ConnectionPublic.model_validate(n.connection) if n.connection else None
    out.proposal = ProposalPublic.model_validate(n.proposal) if n.proposal else None
    out.review = ReviewPublic.model_validate(n.review) if n.review else None
    out.chat_message = ChatMessagePublic.model_validate(n.chat_message) if n.chat_message else None
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
        user_id=user_id, event=event, title=title, content=content, **target
    )
    with Session(engine) as session:
        session.add(notification)
        session.commit()

        stmt = (
            select(Notification)
            .where(Notification.id == notification.id)
            .options(
                selectinload(Notification.proposal).selectinload(Proposal.freelancer),
                selectinload(Notification.proposal).selectinload(Proposal.job_post),
                selectinload(Notification.connection).selectinload(Connection.sender),
                selectinload(Notification.connection).selectinload(Connection.job_post),
                selectinload(Notification.review).selectinload(Review.client),
                selectinload(Notification.job_post).selectinload(JobPost.client),
                selectinload(Notification.chat_message),
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
                not Notification.is_read,
            )
        ).all()
        for n in notifications:
            n.is_read = True
            session.add(n)
        if notifications:
            session.commit()
