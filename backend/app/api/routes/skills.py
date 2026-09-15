import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlalchemy import String, cast
from sqlmodel import col, func, select

from app.api.deps import SessionDep
from app.models import Skill, SkillPublic, SkillsPublic

router = APIRouter(prefix="/skills", tags=["skills"])


@router.get("/", response_model=SkillsPublic)
def read_skills(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
    q: str | None = None,
) -> Any:
    """
    Retrieve available IT skills. Optionally filter by name substring.
    """
    statement = select(Skill)
    if q:
        statement = statement.where(cast(Skill.name, String).ilike(f"%{q}%"))

    count_statement = select(func.count()).select_from(statement.subquery())
    count = session.exec(count_statement).one()

    statement = statement.order_by(col(Skill.name).asc()).offset(skip).limit(limit)
    skills = session.exec(statement).all()

    return SkillsPublic(
        data=[SkillPublic.model_validate(skill) for skill in skills],
        count=count,
    )


@router.get("/{id}", response_model=SkillPublic)
def read_skill(session: SessionDep, id: uuid.UUID) -> Any:
    """
    Get skill by ID.
    """
    skill = session.get(Skill, id)
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    return skill
