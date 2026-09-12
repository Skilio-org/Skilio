from pathlib import Path

import sentry_sdk
from fastapi import FastAPI
from fastapi.routing import APIRoute
from starlette.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import httpx
from fastapi import FastAPI
from app.api.main import api_router
import cloudinary
import cloudinary.uploader
from os import environ
from cloudinary.utils import cloudinary_url
from app.core.config import settings

FRONTEND_DIR = Path(__file__).parent / "frontend"


def cloudinary_prepare_media_store():
    cloudinary.config(
        cloud_name = settings.CLOUDINARY_CLOUD_NAME, 
        api_key    = settings.CLOUDINARY_API_KEY,
        api_secret = settings.CLOUDINARY_API_SECRET, # Click 'View API Keys' above to copy your API secret
        secure=True
    )

def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"


if settings.SENTRY_DSN and settings.FASTAPI_ENV != "development":
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN), enable_tracing=True)


CLOUDINARY_LIMITS = httpx.Limits(
    max_connections=1000,
    max_keepalive_connections=200,
    keepalive_expiry=30.0,
)

CLOUDINARY_TIMEOUTS = httpx.Timeout(
    connect=5.0,
    read=60.0,
    write=10.0,
    pool=10.0,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http_client = httpx.AsyncClient(
        limits=CLOUDINARY_LIMITS,
        timeout=CLOUDINARY_TIMEOUTS,
        follow_redirects=True,
        http2=True,
    )
    yield await app.state.http_client.aclose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_HOST,
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)
app.frontend("/", directory=FRONTEND_DIR)
cloudinary_prepare_media_store()