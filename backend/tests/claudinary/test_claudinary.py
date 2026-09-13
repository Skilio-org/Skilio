from app.claudinary import claudinary_upload_media, claudinary_delete_media
from os import environ
from app.core.config import settings
import cloudinary

def mock_media_store():
   cloudinary.config(
        cloud_name = settings.CLOUDINARY_CLOUD_NAME, 
        api_key    = settings.CLOUDINARY_API_KEY,
        api_secret = settings.CLOUDINARY_API_SECRET,
        secure=True
    )

def test_upload_delete_media():
    mock_media_store()
    imagesrc = "./test_files/z.jpg"
    result = claudinary_upload_media("test-upload-media", imagesrc)
    #
    # assert result is not None
    # assert "url" in result 
    # assert result["url"].startswith("http")
    #
    # result = claudinary_delete_media(result["url"])
    # assert result is not None
    # assert "result" in result and result["result"] == "ok"

test_upload_delete_media()
