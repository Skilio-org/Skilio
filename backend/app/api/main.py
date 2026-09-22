from fastapi import APIRouter

from app.api.routes import (
    categories,
    client_profiles,
    jobs,
    login,
    private,
    profiles,
    proposals,
    reviews,
    searches,
    users,
    utils,
)
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(profiles.router)
api_router.include_router(client_profiles.router)
api_router.include_router(reviews.router)
api_router.include_router(categories.router)
api_router.include_router(searches.router)
api_router.include_router(jobs.router)
api_router.include_router(proposals.router)


if settings.FASTAPI_ENV == "development":
    api_router.include_router(private.router)
