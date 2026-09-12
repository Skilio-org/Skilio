from app.claudinary import claudinary_upload_media, claudinary_delete_media
from os import environ
import cloudinary

def mock_media_store():
    cloudinary.config(
        cloud_name = environ.get("CLOUDINARY_CLOUD_NAME", "default...?"), 
        api_key    = environ.get("CLOUDINARY_API_KEY", "default...?"),
        api_secret = environ.get("CLOUDINARY_API_SECRET", "default...?"),
        secure=True
    )

def test_upload_delete_media():
    imagesrc = "https://cdn2.picryl.com/photo/2017/05/22/two-landscapes-89b232-1024.jpg"
    result = claudinary_upload_media(imagesrc, media_type="image", media_uuid="test-upload-media")

    assert result is not None
    assert "url" in result 
    assert result["url"].startswith("http")
    result = claudinary_delete_media(result["url"])
    assert result is not None
    assert "result" in result and result["result"] == "ok"