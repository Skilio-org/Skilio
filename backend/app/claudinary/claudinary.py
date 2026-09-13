import uuid
import cloudinary
import cloudinary.uploader
from typing import IO, Union

MediaInput = Union[bytes, IO[bytes], str]

RESOURCE_TYPE_MAP = {
    "image": "image",
    "video": "video",
    "audio": "video",   # Cloudinary uses "video" for audio
}

def claudinary_upload_media(
    media_uuid: uuid.UUID,
    media: MediaInput,
    *,
    media_type: str = "image",   # "image" | "video" | "audio"
) -> str:
    resource_type = RESOURCE_TYPE_MAP.get(media_type, "auto")

    upload_fn = (
        cloudinary.uploader.upload_large
        if media_type == "video"
        else cloudinary.uploader.upload
    )

    result = upload_fn(
        media,
        public_id=media_uuid,
        resource_type=resource_type,
        overwrite=True,
        invalidate=True,
        fetch_format="auto",
        quality="auto",
    )
    return result["secure_url"]

def claudinary_delete_media(url: str) -> None:
    public_id = url.split("/")[-1].split(".")[0]
    cloudinary.uploader.destroy(public_id, invalidate=True)