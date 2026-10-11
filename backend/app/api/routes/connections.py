import logging
import uuid
from typing import Any

from fastapi import APIRouter, HTTPException, Query
from fastapi import status as http_status
from sqlalchemy.exc import IntegrityError
from sqlmodel import and_, col, func, or_, select

from app.api.deps import CurrentUser, SessionDep
from app.core.redis import publish_to_user
from app.models import (
    Connection,
    ConnectionCreate,
    ConnectionPublic,
    ConnectionsPublic,
    ConnectionStatus,
    ConnectionStatusPublic,
    JobPost,
    JobPostPublic,
    JobStatus,
    Message,
    User,
    UserPublic,
    UserRole,
    get_datetime_utc,
)
from app.api.routes.notifications import push_notification
from app.models import NotificationEvent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/connections", tags=["connections"])


def _build_job_post_public(job: JobPost | None) -> JobPostPublic | None:
    if not job:
        return None
    client_company = (
        job.client.client_profile.company
        if job.client and job.client.client_profile
        else None
    )
    return JobPostPublic.model_validate(
        job,
        update={
            "client_name": job.client.full_name if job.client else None,
            "client_company": client_company,
            "skills": job.skills or [],
        },
    )


def _build_connection_public(
    connection: Connection, session: SessionDep | None = None
) -> ConnectionPublic:
    sender = connection.sender or (session.get(User, connection.sender_id) if session else None)
    receiver = connection.receiver or (session.get(User, connection.receiver_id) if session else None)
    job = connection.job_post or (session.get(JobPost, connection.job_post_id) if (session and connection.job_post_id) else None)

    sender_public = UserPublic.model_validate(sender) if sender else None
    receiver_public = UserPublic.model_validate(receiver) if receiver else None
    job_public = _build_job_post_public(job) if job else None

    return ConnectionPublic(
        id=connection.id,
        sender_id=connection.sender_id,
        receiver_id=connection.receiver_id,
        job_post_id=connection.job_post_id,
        status=connection.status,
        note=connection.note,
        created_at=connection.created_at,
        updated_at=connection.updated_at,
        responded_at=connection.responded_at,
        sender=sender_public,
        receiver=receiver_public,
        job_post=job_public,
    )


@router.post("/", response_model=ConnectionPublic, status_code=http_status.HTTP_201_CREATED)
async def send_connection_request(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    connection_in: ConnectionCreate,
) -> Any:
    """
    Send a connection request to another user.
    Optionally references a JobPost (e.g. for freelancers connecting via job posts).
    """
    if connection_in.receiver_id == current_user.id:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="Cannot send a connection request to yourself",
        )

    receiver = session.get(User, connection_in.receiver_id)
    if not receiver:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Validate job_post_id if provided
    if connection_in.job_post_id:
        job = session.get(JobPost, connection_in.job_post_id)
        if not job:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail="Job post not found",
            )
        if job.status == JobStatus.DRAFT:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail="Cannot connect referencing a draft job post",
            )
        if (
            current_user.active_role == UserRole.FREELANCER
            and job.client_id != connection_in.receiver_id
        ):
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail="The referenced job does not belong to the recipient",
            )
        if (
            current_user.active_role == UserRole.CLIENT
            and job.client_id != current_user.id
        ):
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail="You can only reference your own job posts",
            )

    # Check existing connection between the pair (in either direction)
    existing_stmt = select(Connection).where(
        or_(
            and_(
                Connection.sender_id == current_user.id,
                Connection.receiver_id == connection_in.receiver_id,
            ),
            and_(
                Connection.sender_id == connection_in.receiver_id,
                Connection.receiver_id == current_user.id,
            ),
        )
    )
    existing = session.exec(existing_stmt).first()

    if existing:
        if existing.status == ConnectionStatus.ACCEPTED:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail="You are already connected with this user",
            )
        if existing.status == ConnectionStatus.PENDING:
            if existing.sender_id == current_user.id:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail="A connection request is already pending",
                )
            else:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail="This user has already sent you a connection request. Please accept it instead.",
                )

        # Re-open declined/withdrawn — set new sender/receiver and reset to pending
        existing.sender_id = current_user.id
        existing.receiver_id = connection_in.receiver_id
        existing.job_post_id = connection_in.job_post_id
        existing.note = connection_in.note
        existing.status = ConnectionStatus.PENDING
        existing.created_at = get_datetime_utc()
        existing.updated_at = get_datetime_utc()
        existing.responded_at = None
        session.add(existing)
        try:
            session.commit()
        except IntegrityError:
            session.rollback()
            raise HTTPException(
                status_code=http_status.HTTP_409_CONFLICT,
                detail="A connection already exists between these users",
            )
        session.refresh(existing)
        conn = existing
    else:
        conn = Connection(
            sender_id=current_user.id,
            receiver_id=connection_in.receiver_id,
            job_post_id=connection_in.job_post_id,
            note=connection_in.note,
            status=ConnectionStatus.PENDING,
            created_at=get_datetime_utc(),
            updated_at=get_datetime_utc(),
        )
        session.add(conn)
        try:
            session.commit()
        except IntegrityError:
            session.rollback()
            raise HTTPException(
                status_code=http_status.HTTP_409_CONFLICT,
                detail="A connection already exists between these users",
            )
        session.refresh(conn)

    # Dispatch realtime notification via Redis / WebSocket
    
    try:
        await push_notification(
            user_id=connection_in.receiver_id,
            event= NotificationEvent.CONNECTION_REQUEST,
            title="New connection",
            link="",
            content="You have a new connection",
            connection_id=str(str(conn.id))
        )
    except Exception as e:
        logger.warning("Failed to publish connection request notification: %s", e)

    return _build_connection_public(conn, session)


@router.get("/", response_model=ConnectionsPublic)
def list_connections(
    session: SessionDep,
    current_user: CurrentUser,
    status: ConnectionStatus | None = Query(default=ConnectionStatus.ACCEPTED),
    type: str = Query(default="all", pattern="^(all|sent|received)$"),
    direction: str | None = Query(default=None, pattern="^(all|sent|received)$"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
) -> Any:
    """
    List connections for the current user.
    - filter by status (default 'accepted', or 'pending', 'declined', 'withdrawn')
    - filter by type/direction: 'all', 'sent', 'received'
    """
    conditions = []
    filter_dir = direction if direction is not None else type

    if filter_dir == "sent":
        conditions.append(Connection.sender_id == current_user.id)
    elif filter_dir == "received":
        conditions.append(Connection.receiver_id == current_user.id)
    else:
        conditions.append(
            or_(
                Connection.sender_id == current_user.id,
                Connection.receiver_id == current_user.id,
            )
        )

    if status:
        conditions.append(Connection.status == status)

    count_stmt = select(func.count()).select_from(Connection).where(and_(*conditions))
    total_count = session.exec(count_stmt).one()

    stmt = (
        select(Connection)
        .where(and_(*conditions))
        .order_by(col(Connection.updated_at).desc())
        .offset(skip)
        .limit(limit)
    )
    connections = session.exec(stmt).all()

    data = [_build_connection_public(c, session) for c in connections]
    return ConnectionsPublic(data=data, count=total_count)


@router.get("/status/{target_user_id}", response_model=ConnectionStatusPublic)
def get_connection_status(
    target_user_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Get the relationship state between the current user and target user.
    Returns: "none", "pending_sent", "pending_received", or "connected".
    """
    if target_user_id == current_user.id:
        return ConnectionStatusPublic(status="none", connection_id=None)

    stmt = select(Connection).where(
        or_(
            and_(
                Connection.sender_id == current_user.id,
                Connection.receiver_id == target_user_id,
            ),
            and_(
                Connection.sender_id == target_user_id,
                Connection.receiver_id == current_user.id,
            ),
        )
    )
    conn = session.exec(stmt).first()

    if not conn:
        return ConnectionStatusPublic(status="none", connection_id=None)

    if conn.status == ConnectionStatus.ACCEPTED:
        return ConnectionStatusPublic(status="connected", connection_id=conn.id)
    elif conn.status == ConnectionStatus.PENDING:
        if conn.sender_id == current_user.id:
            return ConnectionStatusPublic(status="pending_sent", connection_id=conn.id)
        else:
            return ConnectionStatusPublic(status="pending_received", connection_id=conn.id)
    else:
        return ConnectionStatusPublic(status="none", connection_id=None)


@router.post("/{connection_id}/accept", response_model=ConnectionPublic)
async def accept_connection_request(
    connection_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Accept an incoming connection request. Only the recipient can accept.
    """
    conn = session.get(Connection, connection_id)
    if not conn:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Connection request not found",
        )

    if conn.receiver_id != current_user.id:
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Only the recipient can accept this connection request",
        )

    if conn.status != ConnectionStatus.PENDING:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot accept request with status '{conn.status}'",
        )

    conn.status = ConnectionStatus.ACCEPTED
    conn.responded_at = get_datetime_utc()
    conn.updated_at = get_datetime_utc()
    session.add(conn)
    session.commit()
    session.refresh(conn)

    # Dispatch realtime notification to sender
    try:
        await publish_to_user(
            conn.sender_id,
            {
                "type": "notification",
                "data": {
                    "title": "Connection Accepted",
                    "body": f"{current_user.full_name or 'A user'} accepted your connection request.",
                    "connection_id": str(conn.id),
                    "user_id": str(current_user.id),
                    "event": "connection_accepted",
                },
            },
        )
    except Exception as e:
        logger.warning("Failed to publish connection accepted notification: %s", e)

    return _build_connection_public(conn, session)


@router.post("/{connection_id}/decline", response_model=ConnectionPublic)
def decline_connection_request(
    connection_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Decline an incoming connection request. Only the recipient can decline.
    """
    conn = session.get(Connection, connection_id)
    if not conn:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Connection request not found",
        )

    if conn.receiver_id != current_user.id:
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Only the recipient can decline this connection request",
        )

    if conn.status != ConnectionStatus.PENDING:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot decline request with status '{conn.status}'",
        )

    conn.status = ConnectionStatus.DECLINED
    conn.responded_at = get_datetime_utc()
    conn.updated_at = get_datetime_utc()
    session.add(conn)
    session.commit()
    session.refresh(conn)

    return _build_connection_public(conn, session)


@router.post("/{connection_id}/withdraw", response_model=ConnectionPublic)
def withdraw_connection_request(
    connection_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Withdraw a pending connection request. Only the sender can withdraw.
    """
    conn = session.get(Connection, connection_id)
    if not conn:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Connection request not found",
        )

    if conn.sender_id != current_user.id:
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Only the sender can withdraw this connection request",
        )

    if conn.status != ConnectionStatus.PENDING:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot withdraw request with status '{conn.status}'",
        )

    conn.status = ConnectionStatus.WITHDRAWN
    conn.updated_at = get_datetime_utc()
    session.add(conn)
    session.commit()
    session.refresh(conn)

    return _build_connection_public(conn, session)


@router.delete("/{connection_id}", response_model=Message)
def remove_connection(
    connection_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Remove an existing connection or cancel a request.
    Either party (sender or receiver) can remove the connection.
    """
    conn = session.get(Connection, connection_id)
    if not conn:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Connection not found",
        )

    if (
        conn.sender_id != current_user.id
        and conn.receiver_id != current_user.id
        and not current_user.is_superuser
    ):
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Not authorized to remove this connection",
        )

    session.delete(conn)
    session.commit()

    return Message(message="Connection removed successfully")


@router.get("/job/{job_post_id}", response_model=ConnectionsPublic)
def list_job_connections(
    job_post_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
) -> Any:
    """
    List all connection requests associated with a specific job post.
    Only the job owner or superuser can access.
    """
    job = session.get(JobPost, job_post_id)
    if not job:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Job post not found",
        )

    if job.client_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view connections for this job",
        )

    count_stmt = (
        select(func.count())
        .select_from(Connection)
        .where(Connection.job_post_id == job_post_id)
    )
    total_count = session.exec(count_stmt).one()

    stmt = (
        select(Connection)
        .where(Connection.job_post_id == job_post_id)
        .order_by(col(Connection.created_at).desc())
        .offset(skip)
        .limit(limit)
    )
    connections = session.exec(stmt).all()

    data = [_build_connection_public(c, session) for c in connections]
    return ConnectionsPublic(data=data, count=total_count)
