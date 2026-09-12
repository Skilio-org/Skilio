from app.claudinary import claudinary_upload_media
from os import environ
import cloudinary

def mock_media_store():
    cloudinary.config(
        cloud_name = environ.get("CLOUDINARY_CLOUD_NAME", "default...?"), 
        api_key    = environ.get("CLOUDINARY_API_KEY", "default...?"),
        api_secret = environ.get("CLOUDINARY_API_SECRET", "default...?"),
        secure=True
    )

def test_upload_media():
    imagesrc = "https://cdn2.picryl.com/photo/2017/05/22/two-landscapes-89b232-1024.jpg"
    result = claudinary_upload_media(imagesrc, folder="test_folder")
    
    assert result is not None
    assert "url" in result 
    assert result["url"].startswith("http")