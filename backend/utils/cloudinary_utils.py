import os
import uuid
import cloudinary
import cloudinary.uploader
import cloudinary.api
from fastapi import UploadFile, HTTPException

# Automatically picks up CLOUDINARY_URL from the environment variables
# Ensure that CLOUDINARY_URL=cloudinary://<your_api_key>:<your_api_secret>@<your_cloud_name> is set
cloudinary.config(secure=True)

def upload_file_to_cloudinary(file: UploadFile, folder: str = "app_uploads", resource_type: str = "auto") -> str:
    """
    Uploads a FastAPI UploadFile directly to Cloudinary and returns the secure URL.
    
    :param file: The UploadFile object from FastAPI.
    :param folder: The Cloudinary folder string to store the file in.
    :param resource_type: The type of resource ('auto', 'image', 'video', 'raw').
    :return: The secure URL of the uploaded file.
    """
    try:
        # Generate a unique public ID (optional, but good for avoiding overwrites if filenames collide)
        file_id = str(uuid.uuid4())
        
        # Uploading the file
        result = cloudinary.uploader.upload(
            file.file, 
            folder=folder, 
            public_id=file_id, 
            resource_type=resource_type
        )
        
        return result.get("secure_url")
    
    except Exception as e:
        print(f"Cloudinary upload failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload file to Cloudinary")
