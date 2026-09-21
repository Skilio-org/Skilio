import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter
from sqlmodel import Session, col, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Message,
    RecentSearch,
    RecentSearchCreate,
    RecentSearchesPublic,
)

router = APIRouter(prefix="/searches", tags=["searches"])


def record_recent_search(
    session: Session, user_id: uuid.UUID, query: str
) -> None:
    """
    Save or refresh a recent search query for a user, keeping at most 3 distinct items.
    """
    clean_query = query.strip()
    if not clean_query:
        return

    # Delete any existing case-insensitive duplicate for this user
    existing_duplicates = session.exec(
        select(RecentSearch).where(
            RecentSearch.user_id == user_id,
            col(RecentSearch.query).ilike(clean_query),
        )
    ).all()
    for item in existing_duplicates:
        session.delete(item)
    session.commit()

    # Add the fresh search entry
    new_search = RecentSearch(
        user_id=user_id,
        query=clean_query,
        created_at=datetime.now(UTC),
    )
    session.add(new_search)
    session.commit()

    # Keep only the latest 3 searches
    user_searches = session.exec(
        select(RecentSearch)
        .where(RecentSearch.user_id == user_id)
        .order_by(col(RecentSearch.created_at).desc())
    ).all()

    if len(user_searches) > 3:
        for excess in user_searches[3:]:
            session.delete(excess)
        session.commit()


@router.get("/recent", response_model=RecentSearchesPublic)
def read_recent_searches(
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Get the last 3 search queries for the current user.
    """
    searches = session.exec(
        select(RecentSearch)
        .where(RecentSearch.user_id == current_user.id)
        .order_by(col(RecentSearch.created_at).desc())
        .limit(3)
    ).all()

    queries = [s.query for s in searches]
    return RecentSearchesPublic(data=queries, count=len(queries))


@router.post("/recent", response_model=RecentSearchesPublic)
def save_recent_search(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    search_in: RecentSearchCreate,
) -> Any:
    """
    Explicitly save a search query for the current user.
    """
    record_recent_search(session, current_user.id, search_in.query)
    return read_recent_searches(session=session, current_user=current_user)


@router.delete("/recent", response_model=Message)
def clear_recent_searches(
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Clear recent searches for the current user.
    """
    searches = session.exec(
        select(RecentSearch).where(RecentSearch.user_id == current_user.id)
    ).all()
    for s in searches:
        session.delete(s)
    session.commit()

    return Message(message="Recent searches cleared successfully")
