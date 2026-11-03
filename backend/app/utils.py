import logging
import hashlib
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any

import emails
import httpx2
import jwt
from jinja2 import Environment, FileSystemLoader, select_autoescape
from jwt.exceptions import InvalidTokenError
from sqlmodel import Session

from app.core import security
from app.core.config import settings
from app.models import PasswordResetToken

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
    if settings.ENV == "production" and settings.RESEND_API_KEY:
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


def generate_reset_password_email(email_to: str, email: str, token: str, oauth: bool) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Password recovery for user {email}"
    link = f"{settings.HOST}/reset-password?token={token}"
    html_content = render_email_template(
        template_name="reset_password.html" if not oauth else "verify_email_oauth.html",
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


def store_password_reset_token(
    session: Session, email: str, token: str
) -> PasswordResetToken:
    token_record = PasswordResetToken(
        token_hash=hashlib.sha256(token.encode()).hexdigest(),
        email=email,
        expires_at=datetime.now(UTC)
        + timedelta(hours=settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS),
    )
    session.add(token_record)
    session.commit()
    session.refresh(token_record)
    return token_record

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

def _decode_token_subject(token: str) -> str | None:
    try:
        decoded_token = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        subject = decoded_token.get("sub")
        return str(subject) if subject is not None else None
    except InvalidTokenError:
        return None

def verify_password_reset_token(token: str) -> str | None:
    return _decode_token_subject(token)

def validate_verify_token(token: str) -> str | None:
    return _decode_token_subject(token)

async def send_password_reconvery_email(
    email: str, oauth: bool = False, password_reset_token: str | None = None
) -> None:
    if password_reset_token is None:
        raise ValueError("A registered password reset token is required")
    email_data     = generate_reset_password_email(
        email_to=email, email=email, token=password_reset_token, oauth=oauth
    )
    await send_email(
        email_to=email,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )

async def send_verification_email(email: str, username: str) -> None:
    email_validation_token = generate_email_validation_token(email=email)
    email_data = generate_verify_email(
        email_to=email, username=username, email=email, token=email_validation_token
    )
    await send_email(
        email_to=email,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
