from unittest.mock import patch

import cloudinary

from app.claudinary import claudinary_delete_media, claudinary_upload_media
from app.core.config import settings

IMAGE = "./test_files/z.jpg"


def test_upload_delete_media() -> None:
    # If dummy or unconfigured credentials, mock the external Cloudinary network calls
    if "example" in settings.CLOUDINARY_CLOUD_NAME or not settings.CLOUDINARY_API_KEY:
        with patch("cloudinary.uploader.upload") as mock_upload, \
             patch("cloudinary.uploader.destroy") as mock_destroy:
            mock_upload.return_value = {
                "secure_url": "https://res.cloudinary.com/demo/image/upload/sample.jpg"
            }
            mock_destroy.return_value = {"result": "ok"}

            result = claudinary_upload_media("someimg", IMAGE)  # type: ignore[arg-type]
            assert result is not None
            delete_res = claudinary_delete_media(result)
            assert delete_res is not None
            assert delete_res.get("result") == "ok"
    else:
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True,
        )
        result = claudinary_upload_media("someimg", IMAGE)  # type: ignore[arg-type]
        assert result is not None
        delete_res = claudinary_delete_media(result)
        assert delete_res is not None
        assert "result" in delete_res and delete_res["result"] == "ok"
