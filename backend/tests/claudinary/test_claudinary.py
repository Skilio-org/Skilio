import cloudinary

from app.claudinary import claudinary_delete_media, claudinary_upload_media
from app.core.config import settings

IMAGE = "./test_files/z.jpg"


def mock_media_store():
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )


def test_upload_delete_media():
    mock_media_store()
    result = claudinary_upload_media("someimg", IMAGE)  # ty:ignore[invalid-argument-type]

    assert result is not None
    result = claudinary_delete_media(result)
    assert result is not None
    assert "result" in result and result["result"] == "ok"


test_upload_delete_media()
