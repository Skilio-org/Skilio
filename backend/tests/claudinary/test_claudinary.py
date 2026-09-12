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
    mock_media_store()
    imagesrc = "./Zeus_Otricoli_Pio-Clementino_Inv257.jpg"
    result = claudinary_upload_media("test-upload-media", imagesrc)

    assert result is not None
    assert "url" in result 
    assert result["url"].startswith("http")

    result = claudinary_delete_media(result["url"])
    assert result is not None
    assert "result" in result and result["result"] == "ok"

test_upload_delete_media()
