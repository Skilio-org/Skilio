from datetime import datetime, timezone
import logging
import shutil
import time

from fastapi import APIRouter, Response, status
from sqlmodel import Session, text

from app.api.deps import SessionDep
from app.core.redis import get_redis_client
from app.models import ComponentHealth, SystemHealth

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/health", tags=["health"])


def probe_database(session: Session) -> ComponentHealth:
    """
    Diagnostic probe measuring PostgreSQL execution latency with a lightweight SELECT 1.
    """
    start_time = time.perf_counter()
    try:
        session.exec(text("SELECT 1"))
        latency = round((time.perf_counter() - start_time) * 1000, 2)
        return ComponentHealth(
            status="healthy",
            latency_ms=latency,
            message="Database operational",
        )
    except Exception as exc:
        logger.warning("Database health probe failed: %s", exc)
        return ComponentHealth(
            status="unhealthy",
            latency_ms=None,
            message="Database service unreachable",
        )


async def probe_redis() -> ComponentHealth:
    """
    Diagnostic probe measuring Redis latency via an asynchronous PING.
    """
    start_time = time.perf_counter()
    try:
        client = get_redis_client()
        pong = await client.ping()
        if not pong:
            return ComponentHealth(
                status="degraded",
                latency_ms=None,
                message="Cache ping did not respond with PONG",
            )
        latency = round((time.perf_counter() - start_time) * 1000, 2)
        return ComponentHealth(
            status="healthy",
            latency_ms=latency,
            message="Cache operational",
        )
    except Exception as exc:
        logger.warning("Redis health probe failed: %s", exc)
        return ComponentHealth(
            status="degraded",
            latency_ms=None,
            message="Cache service unreachable",
        )


def probe_disk() -> ComponentHealth:
    """
    Diagnostic probe measuring root partition disk space availability.
    """
    try:
        usage = shutil.disk_usage("/")
        free_gb = round(usage.free / (1024**3), 2)
        free_pct = round((usage.free / usage.total) * 100, 1)

        if free_pct < 5.0:
            return ComponentHealth(
                status="unhealthy",
                latency_ms=None,
                message=f"Critical disk storage shortage: {free_gb} GB free ({free_pct}%)",
            )
        if free_pct < 15.0:
            return ComponentHealth(
                status="degraded",
                latency_ms=None,
                message=f"Low disk storage warning: {free_gb} GB free ({free_pct}%)",
            )
        return ComponentHealth(
            status="healthy",
            latency_ms=None,
            message=f"Storage operational: {free_gb} GB free ({free_pct}%)",
        )
    except Exception as exc:
        logger.warning("Disk health probe failed: %s", exc)
        return ComponentHealth(
            status="degraded",
            latency_ms=None,
            message="Unable to inspect disk storage",
        )


@router.get("", response_model=SystemHealth)
async def get_system_health(
    session: SessionDep,
    response: Response,
) -> SystemHealth:
    """
    Deep diagnostic health check testing PostgreSQL, Redis, and Host Storage.
    Returns HTTP 200 for healthy or degraded states, and HTTP 503 for critical outages.
    """
    db_health = probe_database(session)
    redis_health = await probe_redis()
    disk_health = probe_disk()

    services = {
        "database": db_health,
        "cache": redis_health,
        "storage": disk_health,
    }

    # Evaluate aggregate system status
    if db_health.status == "unhealthy" or disk_health.status == "unhealthy":
        overall_status = "unhealthy"
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    elif (
        db_health.status == "degraded"
        or redis_health.status == "degraded"
        or disk_health.status == "degraded"
    ):
        overall_status = "degraded"
    else:
        overall_status = "healthy"

    return SystemHealth(
        status=overall_status,
        timestamp=datetime.now(timezone.utc),
        services=services,
    )
