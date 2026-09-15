from fastapi import APIRouter

from app.api.routes import (
    jobs,
    login,
    private,
    profiles,
    proposals,
    reviews,
    skills,
    users,
    utils,
)
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(profiles.router)
api_router.include_router(reviews.router)
api_router.include_router(skills.router)
api_router.include_router(jobs.router)
api_router.include_router(proposals.router)


if settings.FASTAPI_ENV == "development":
    api_router.include_router(private.router)
