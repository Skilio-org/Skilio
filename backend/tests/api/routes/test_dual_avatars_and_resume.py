from unittest.mock import patch
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.core.security import get_password_hash
from app.models import ClientProfile, FreelancerProfile, UserRole
from tests.utils.user import create_random_user, user_authentication_headers
from tests.utils.utils import random_lower_string


def _make_dual_user(client: TestClient, db: Session):
    user = create_random_user(db)
    user.active_role = UserRole.FREELANCER
    user.full_name = "Dual Profile User"
    password = random_lower_string()
    user.hashed_password = get_password_hash(password)
    db.add(user)
    db.commit()
    db.refresh(user)

    f_profile = FreelancerProfile(user_id=user.id, title="Developer")
    c_profile = ClientProfile(user_id=user.id, company="TechCorp", company_role="CTO", location="Remote", company_size="2-10")
    db.add(f_profile)
    db.add(c_profile)
    db.commit()

    headers = user_authentication_headers(client=client, email=user.email, password=password)
    return headers, user


def test_separate_profile_avatars(client: TestClient, db: Session) -> None:
    headers, user = _make_dual_user(client, db)
    small_image = b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"0" * 100

    with patch("app.api.routes.profiles.run_in_threadpool") as mock_f_pool, \
         patch("app.api.routes.client_profiles.run_in_threadpool") as mock_c_pool:
        mock_f_pool.return_value = "https://res.cloudinary.com/demo/image/upload/freelancer_avatar.png"
        mock_c_pool.return_value = "https://res.cloudinary.com/demo/image/upload/client_avatar.png"

        # 1. Upload Freelancer Avatar
        resp_f = client.post(
            f"{settings.API_V1_STR}/profiles/me/avatar",
            headers=headers,
            files={"file": ("freelancer.png", small_image, "image/png")},
        )
        assert resp_f.status_code == 200
        assert resp_f.json()["status"] == "Ok"

        # 2. Upload Client Avatar
        resp_c = client.post(
            f"{settings.API_V1_STR}/client-profiles/me/avatar",
            headers=headers,
            files={"file": ("client.png", small_image, "image/png")},
        )
        assert resp_c.status_code == 200
        assert resp_c.json()["status"] == "Ok"

    # 3. Verify in database and API that each profile has its own separate avatar
    resp_get_f = client.get(f"{settings.API_V1_STR}/profiles/me", headers=headers)
    assert resp_get_f.status_code == 200
    freelancer_avatar = resp_get_f.json()["avatar_url"]

    resp_get_c = client.get(f"{settings.API_V1_STR}/client-profiles/me", headers=headers)
    assert resp_get_c.status_code == 200
    client_avatar = resp_get_c.json()["avatar_url"]

    assert freelancer_avatar == "https://res.cloudinary.com/demo/image/upload/freelancer_avatar.png"
    assert client_avatar == "https://res.cloudinary.com/demo/image/upload/client_avatar.png"
    assert freelancer_avatar != client_avatar


def test_profile_avatar_size_limit(client: TestClient, db: Session) -> None:
    headers, _ = _make_dual_user(client, db)
    too_large = b"0" * (5 * 1024 * 1024 + 1)

    # Freelancer avatar > 5MB
    resp_f = client.post(
        f"{settings.API_V1_STR}/profiles/me/avatar",
        headers=headers,
        files={"file": ("avatar.jpg", too_large, "image/jpeg")},
    )
    assert resp_f.status_code == 413

    # Client avatar > 5MB
    resp_c = client.post(
        f"{settings.API_V1_STR}/client-profiles/me/avatar",
        headers=headers,
        files={"file": ("avatar.jpg", too_large, "image/jpeg")},
    )
    assert resp_c.status_code == 413


def test_profile_avatar_unsupported_format(client: TestClient, db: Session) -> None:
    headers, _ = _make_dual_user(client, db)
    content = b"not an image"

    resp = client.post(
        f"{settings.API_V1_STR}/profiles/me/avatar",
        headers=headers,
        files={"file": ("avatar.pdf", content, "application/pdf")},
    )
    assert resp.status_code == 400


def test_resume_upload_pdf_success(client: TestClient, db: Session) -> None:
    headers, _ = _make_dual_user(client, db)
    pdf_bytes = b"%PDF-1.4 sample pdf content"

    with patch("app.api.routes.profiles.run_in_threadpool") as mock_pool:
        mock_pool.return_value = (
            "https://res.cloudinary.com/demo/raw/upload/resume.pdf",
            "sample_resume_id",
        )

        resp = client.post(
            f"{settings.API_V1_STR}/profiles/resume",
            headers=headers,
            files={"file": ("my_resume.pdf", pdf_bytes, "application/pdf")},
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "Ok"

    resp_me = client.get(f"{settings.API_V1_STR}/profiles/me", headers=headers)
    assert resp_me.status_code == 200
    assert resp_me.json()["resume_url"] == "https://res.cloudinary.com/demo/raw/upload/resume.pdf"


def test_resume_upload_docx_success(client: TestClient, db: Session) -> None:
    headers, _ = _make_dual_user(client, db)
    docx_bytes = b"PK\x03\x04 sample docx content"

    with patch("app.api.routes.profiles.run_in_threadpool") as mock_pool:
        mock_pool.return_value = (
            "https://res.cloudinary.com/demo/raw/upload/resume.docx",
            "sample_docx_id",
        )

        resp = client.post(
            f"{settings.API_V1_STR}/profiles/resume",
            headers=headers,
            files={
                "file": (
                    "my_resume.docx",
                    docx_bytes,
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                )
            },
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "Ok"

    resp_me = client.get(f"{settings.API_V1_STR}/profiles/me", headers=headers)
    assert resp_me.status_code == 200
    assert resp_me.json()["resume_url"] == "https://res.cloudinary.com/demo/raw/upload/resume.docx"


def test_resume_upload_size_limit(client: TestClient, db: Session) -> None:
    headers, _ = _make_dual_user(client, db)
    too_large = b"0" * (5 * 1024 * 1024 + 1)

    resp = client.post(
        f"{settings.API_V1_STR}/profiles/resume",
        headers=headers,
        files={"file": ("resume.pdf", too_large, "application/pdf")},
    )
    assert resp.status_code == 413


def test_resume_upload_invalid_types(client: TestClient, db: Session) -> None:
    headers, _ = _make_dual_user(client, db)

    # txt file
    resp_txt = client.post(
        f"{settings.API_V1_STR}/profiles/resume",
        headers=headers,
        files={"file": ("resume.txt", b"plain text", "text/plain")},
    )
    assert resp_txt.status_code == 400

    # png file
    resp_png = client.post(
        f"{settings.API_V1_STR}/profiles/resume",
        headers=headers,
        files={"file": ("resume.png", b"image bytes", "image/png")},
    )
    assert resp_png.status_code == 400


def test_delete_resume(client: TestClient, db: Session) -> None:
    headers, _ = _make_dual_user(client, db)
    pdf_bytes = b"%PDF-1.4 sample pdf"

    with patch("app.api.routes.profiles.run_in_threadpool") as mock_pool:
        mock_pool.return_value = (
            "https://res.cloudinary.com/demo/raw/upload/resume.pdf",
            "resume_id_to_delete",
        )
        client.post(
            f"{settings.API_V1_STR}/profiles/resume",
            headers=headers,
            files={"file": ("my_resume.pdf", pdf_bytes, "application/pdf")},
        )

    # Delete resume
    with patch("app.api.routes.profiles.run_in_threadpool") as mock_destroy:
        mock_destroy.return_value = {"result": "ok"}
        resp_del = client.delete(f"{settings.API_V1_STR}/profiles/me/resume", headers=headers)
        assert resp_del.status_code == 200

    resp_me = client.get(f"{settings.API_V1_STR}/profiles/me", headers=headers)
    assert resp_me.status_code == 200
    assert resp_me.json()["resume_url"] is None

