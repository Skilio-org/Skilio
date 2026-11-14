import uuid
from typing import IO

import cloudinary
import cloudinary.uploader

MediaInput = bytes | IO[bytes] | str

RESOURCE_TYPE_MAP = {
    "image": "image",
    "video": "video",
    "audio": "video",  # Cloudinary uses "video" for audio
}


def claudinary_upload_media(
    media_uuid: uuid.UUID,
    media: MediaInput,
    *,
    media_type: str = "image",
) -> str | None:
    resource_type = RESOURCE_TYPE_MAP.get(media_type, "auto")

    upload_fn = (
        cloudinary.uploader.upload_large
        if media_type == "video"
        else cloudinary.uploader.upload
    )

    result = upload_fn(
        media,
        public_id=str(media_uuid),
        resource_type=resource_type,
        overwrite=True,
        invalidate=True,
        fetch_format="auto",
        quality="auto",
    )
    if not result or "secure_url" not in result:
        return None
    return result["secure_url"]


def claudinary_delete_media(url: str) -> dict:
    public_id = url.split("/")[-1].split(".")[0]
    return cloudinary.uploader.destroy(public_id, invalidate=True)


def claudinary_upload_raw(
    media_uuid: uuid.UUID,
    media: MediaInput,
    *,
    extension: str = "",
) -> tuple[str, str] | None:
    """Upload a raw file (PDF, DOCX) to Cloudinary. Returns (secure_url, public_id) or None."""
    public_id = f"{media_uuid}{extension}" if extension else str(media_uuid)
    result = cloudinary.uploader.upload(
        media,
        public_id=public_id,
        resource_type="raw",
        overwrite=True,
        invalidate=True,
    )
    if not result or "secure_url" not in result:
        return None
    return result["secure_url"], result["public_id"]


def claudinary_delete_raw(public_id: str) -> dict:
    return cloudinary.uploader.destroy(public_id, resource_type="raw", invalidate=True)
