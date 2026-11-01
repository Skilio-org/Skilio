from contextlib import asynccontextmanager
from pathlib import Path

import cloudinary
import cloudinary.uploader
import httpx
import sentry_sdk
from fastapi import FastAPI
from fastapi.routing import APIRoute
from prometheus_fastapi_instrumentator import Instrumentator
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.middleware.cors import CORSMiddleware

from app.api.main import api_router
from app.core.config import settings
from app.core.limiter import limiter
from app.core.redis import start_redis_listener, stop_redis_listener

FRONTEND_DIR = Path(__file__).parent / "frontend"


def cloudinary_prepare_media_store():
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,  # Click 'View API Keys' above to copy your API secret
        secure=True,
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
    await start_redis_listener()
    async with httpx.AsyncClient(
        limits=CLOUDINARY_LIMITS,
        timeout=CLOUDINARY_TIMEOUTS,
        follow_redirects=True,
        http2=True,
    ) as client:
        app.state.http_client = client
        yield
    await stop_redis_listener()


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
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
Instrumentator().instrument(app).expose(app, include_in_schema=True, tags=["monitoring"])
if FRONTEND_DIR.exists():
    app.frontend("/", directory=FRONTEND_DIR)
cloudinary_prepare_media_store()
