import logging
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any

import emails
import httpx2
import jwt
from jinja2 import Environment, FileSystemLoader, select_autoescape
from jwt.exceptions import InvalidTokenError

from app.core import security
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class EmailData:
    html_content: str
    subject: str


VERIFICATION_TOKEN_EXPIRE_MINUTES = 30
EMAIL_TEMPLATES_DIR = Path(__file__).parent / "email-templates"

jinja_env = Environment(
    loader=FileSystemLoader(EMAIL_TEMPLATES_DIR),
    autoescape=select_autoescape(["html", "xml"]),
)

def render_email_template(*, template_name: str, context: dict[str, Any]) -> str:
    template = jinja_env.get_template(template_name)
    return template.render(context)

def check_env():
    if not settings.emails_enabled or not settings.EMAILS_FROM_EMAIL:
        raise RuntimeError("Email configuration is not enabled in settings")

async def send_email_via_resend(email: str, sub: str, content: str) -> None:
    if not settings.RESEND_API_KEY:
        raise RuntimeError("Missing RESEND_API_KEY")
    async with httpx2.AsyncClient() as client:
        response = await client.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
            json={
                "from": f"{settings.EMAILS_FROM_EMAIL}",
                "to": email,
                "subject": sub,
                "html": content
            }
        )
        response.raise_for_status()

async def send_email(
    *,
    email_to: str,
    subject: str = "",
    html_content: str = "",
) -> None:
    check_env()
    if settings.ENV == "production" and settings.RESEND_API_KEY and not email_to.startswith("seed"):
        await send_email_via_resend(email_to, subject, html_content)
    else:
        message = emails.message.Message(
            subject=subject,
            html=html_content,
            mail_from=(settings.EMAILS_FROM_NAME, settings.EMAILS_FROM_EMAIL),
        )
        smtp_options = {"host": settings.SMTP_HOST, "port": settings.SMTP_PORT}
        if settings.SMTP_TLS:
            smtp_options["tls"] = True
        elif settings.SMTP_SSL:
            smtp_options["ssl"] = True
        if settings.SMTP_USER:
            smtp_options["user"] = settings.SMTP_USER
        if settings.SMTP_PASSWORD:
            smtp_options["password"] = settings.SMTP_PASSWORD
        response = message.send(to=email_to, smtp=smtp_options)
        logger.info(f"send email result: {response}")
    logger.info(f"email sent: {email_to}, subject: {subject}")


def generate_test_email(email_to: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Test email"
    html_content = render_email_template(
        template_name="test_email.html",
        context={"project_name": settings.PROJECT_NAME, "email": email_to},
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_reset_password_email(email_to: str, email: str, token: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Password recovery for user {email}"
    link = f"{settings.HOST}/reset-password?token={token}"
    html_content = render_email_template(
        template_name="reset_password.html",
        context={
            "project_name": settings.PROJECT_NAME,
            "username": email,
            "email": email_to,
            "valid_hours": settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS,
            "link": link,
        },
    )
    return EmailData(html_content=html_content, subject=subject)

def generate_verify_email(email_to: str, username: str, email: str, token: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - email verification {email}"
    # link = f"{settings.FRONTEND_HOST}/verify?token={token}"
    link = f"{settings.HOST}/api/v1/users/verify?token={token}"
    html_content = render_email_template(
        template_name="verify_email.html",
        context={
            "project_name": settings.PROJECT_NAME,
            "username": username,
            "email": email_to,
            "valid_hours": settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS,
            "link": link,
        },
    )
    return EmailData(html_content=html_content, subject=subject)

def generate_new_account_email(
    email_to: str, username: str, password: str
) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - New account for user {username}"
    html_content = render_email_template(
        template_name="new_account.html",
        context={
            "project_name": settings.PROJECT_NAME,
            "username": username,
            "password": password,
            "email": email_to,
            "link": settings.FRONTEND_HOST,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_password_reset_token(email: str) -> str:
    delta = timedelta(hours=settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS)
    now = datetime.now(UTC)
    expires = now + delta
    exp = expires.timestamp()
    encoded_jwt = jwt.encode(
        {"exp": exp, "nbf": now, "sub": email},
        settings.SECRET_KEY,
        algorithm=security.ALGORITHM,
    )
    return encoded_jwt

def generate_email_validation_token(email: str) -> str:
    delta = timedelta(hours=settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS)
    now = datetime.now(UTC)
    expires = now + delta
    exp = expires.timestamp()
    encoded_jwt = jwt.encode(
        {
            "exp": exp,
            "nbf": now,
             "scope": "email_verification",
            "sub": email
        },
        settings.SECRET_KEY,
        algorithm=security.ALGORITHM,
    )
    return encoded_jwt

def verify_password_reset_token(token: str) -> str | None:
    try:
        decoded_token = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        return str(decoded_token["sub"])
    except InvalidTokenError:
        return None

def validate_verify_token(token: str) -> str | None:
    try:
        decoded_token = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        return str(decoded_token["sub"])
    except InvalidTokenError:
        return None
