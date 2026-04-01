FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (ffmpeg is needed for audio/video processing, libgl1 for EasyOCR/OpenCV)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    gcc \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create necessary directories
RUN mkdir -p uploads/videos uploads/audio uploads/docs chroma_db

EXPOSE 5000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
