import os
import httpx
import uuid
import aiofiles

async def ensure_local_file(file_path_or_url: str, temp_dir: str = "uploads/temp") -> str:
    """
    Ensures that a remote URL is downloaded locally to a temporary directory 
    so local file processing scripts can work on it. 
    If it's already a local file path, it returns it directly.
    """
    if not file_path_or_url:
        return ""
        
    if not file_path_or_url.startswith("http"):
        return file_path_or_url
    
    os.makedirs(temp_dir, exist_ok=True)
    # Extract extension or just use a generic name
    filename = os.path.basename(file_path_or_url.split("?")[0])
    if not filename:
        filename = "temp_file"
        
    local_path = os.path.join(temp_dir, f"{str(uuid.uuid4())}_{filename}")
    
    # Download the file
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.get(file_path_or_url)
        response.raise_for_status()
        async with aiofiles.open(local_path, "wb") as f:
            await f.write(response.content)
            
    return local_path

def cleanup_local_file(local_path: str):
    """
    Removes the temporary local file to save storage.
    """
    if local_path and os.path.exists(local_path) and "uploads/temp" in local_path:
        try:
            os.remove(local_path)
        except Exception as e:
            print(f"Failed to cleanup temp file {local_path}: {e}")
