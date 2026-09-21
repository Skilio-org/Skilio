import shutil
import time
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Response, status
from pydantic.networks import EmailStr
from sqlalchemy import text
from sqlmodel import Session

from app.api.deps import get_current_active_superuser
from app.core.config import settings
from app.core.db import engine
from app.models import DeepHealthCheck, Message, ServiceHealth
from app.utils import generate_test_email, send_email

START_TIME = time.time()

router = APIRouter(prefix="/utils", tags=["utils"])


@router.post(
    "/test-email/",
    dependencies=[Depends(get_current_active_superuser)],
    status_code=201,
)
def test_email(email_to: EmailStr) -> Message:
    """
    Test emails.
    """
    email_data = generate_test_email(email_to=email_to)
    send_email(
        email_to=email_to,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
    return Message(message="Test email sent")


@router.get("/health-check/")
async def health_check() -> bool:
    """
    Fast, shallow liveness probe used by Docker and Traefik load balancers.
    """
    return True


@router.get("/health/detailed", response_model=DeepHealthCheck)
async def deep_health_check(response: Response) -> DeepHealthCheck:
    """
    Comprehensive system health check: verifies database connectivity,
    disk storage, environment/vault secrets status, and uptime.
    Used by the status page and external monitoring systems.
    """
    services: dict[str, ServiceHealth] = {}
    is_healthy = True

    # 1. Database Health Check (SELECT 1 + latency)
    db_start = time.perf_counter()
    try:
        with Session(engine) as db_session:
            db_session.exec(text("SELECT 1"))
        db_latency = round((time.perf_counter() - db_start) * 1000, 2)
        services["database"] = ServiceHealth(
            status="healthy",
            latency_ms=db_latency,
            details=f"PostgreSQL connection active ({db_latency}ms)",
        )
    except Exception as exc:
        is_healthy = False
        services["database"] = ServiceHealth(
            status="unhealthy",
            latency_ms=None,
            details=f"PostgreSQL unavailable: {str(exc)[:120]}",
        )

    # 2. Disk Storage Check
    try:
        usage = shutil.disk_usage("/")
        free_gb = round(usage.free / (1024**3), 2)
        total_gb = round(usage.total / (1024**3), 2)
        pct_free = round((usage.free / usage.total) * 100, 1)
        disk_status = "healthy" if pct_free >= 10 else "degraded"
        services["disk"] = ServiceHealth(
            status=disk_status,
            details=f"{free_gb} GB free of {total_gb} GB ({pct_free}% available)",
        )
    except Exception as exc:
        services["disk"] = ServiceHealth(
            status="degraded",
            details=f"Disk check failed: {str(exc)[:100]}",
        )

    # 3. Vault & Environment Secrets Check
    vault_configured = bool(
        settings.SECRET_KEY
        and settings.SECRET_KEY != "changethis"
        and settings.FIRST_SUPERUSER_PASSWORD
    )
    services["vault"] = ServiceHealth(
        status="healthy" if vault_configured else "degraded",
        details="Environment credentials and secrets active"
        if vault_configured
        else "Default or unconfigured secrets detected",
    )

    # 4. Email / Notifications Service
    services["email"] = ServiceHealth(
        status="healthy" if settings.emails_enabled else "disabled",
        details=f"SMTP host: {settings.SMTP_HOST or 'Disabled/Local'}",
    )

    system_status = "healthy" if is_healthy else "unhealthy"
    if not is_healthy:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return DeepHealthCheck(
        status=system_status,
        timestamp=datetime.now(UTC),
        uptime_seconds=round(time.time() - START_TIME, 1),
        environment=settings.FASTAPI_ENV or "production",
        services=services,
    )

