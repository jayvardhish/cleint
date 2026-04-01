import os
# Dynamic utility imports are handled inside functions to avoid startup crashes on Windows
from ai_client import client

def get_video_metadata_api(video_id):
    """
    Fetches video metadata (title, snippet) using official YouTube Data API v3.
    """
    try:
        from googleapiclient.discovery import build
        api_key = os.getenv("YOUTUBE_API_KEY")
        if not api_key:
            return None
            
        youtube = build("youtube", "v3", developerKey=api_key)
        request = youtube.videos().list(
            part="snippet,contentDetails",
            id=video_id
        )
        response = request.execute()
        
        if response.get("items"):
            item = response["items"][0]
            snippet = item["snippet"]
            return {
                "title": snippet.get("title"),
                "description": snippet.get("description"),
                "thumbnail": snippet.get("thumbnails", {}).get("high", {}).get("url"),
                "duration": item.get("contentDetails", {}).get("duration")
            }
        return None
    except Exception as e:
        print(f"YouTube API Metadata Error: {e}")
        return None

def get_video_metadata(video_url):
    """
    Fetches video metadata using yt-dlp (Fallback).
    """
    import yt_dlp
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            return ydl.extract_info(video_url, download=False)
    except Exception as e:
        print(f"yt-dlp Metadata Error: {e}")
        return {}

def download_youtube_audio(video_url, output_path_base):
    """
    Downloads raw audio from a YouTube video without requiring FFmpeg.
    Returns the actual path of the downloaded file.
    """
    import yt_dlp
    try:
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': output_path_base + '.%(ext)s',
            'quiet': True,
            'no_warnings': True,
            'referer': 'https://www.youtube.com/',
            'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            # Removed postprocessors as they require FFmpeg
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # We first extract info to get the extension
            info = ydl.extract_info(video_url, download=True)
            ext = info.get('ext', 'm4a')
            actual_path = f"{output_path_base}.{ext}"
            
            # Check if the file exists (yt-dlp might use a different name sometimes)
            if not os.path.exists(actual_path):
                # Fallback: search for any file starting with output_path_base
                dirname = os.path.dirname(output_path_base)
                basename = os.path.basename(output_path_base)
                for f in os.listdir(dirname):
                    if f.startswith(basename):
                        return os.path.join(dirname, f)
            
            return actual_path
    except Exception as e:
        print(f"YouTube Audio Download Error: {e}")
        return None

def transcribe_audio_whisper(audio_path):
    """
    Transcribe audio using Groq's Whisper API (supports m4a, webm, mp4, wav, etc.)
    Falls back to a basic speech_recognition attempt if Groq is unavailable.
    """
    return transcribe_with_groq_whisper(audio_path)

def transcribe_with_groq_whisper(audio_path):
    """
    Uses Groq's Whisper-large-v3-turbo for fast, accurate audio transcription.
    Accepts any format that yt-dlp downloads (m4a, webm, mp4, etc.)
    """
    import os
    from openai import OpenAI

    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    if not groq_key:
        print("⚠️  No GROQ_API_KEY — skipping Whisper transcription.")
        return None

    try:
        print(f"🎙️  [Groq Whisper] Transcribing: {os.path.basename(audio_path)}")
        groq_client = OpenAI(
            api_key=groq_key,
            base_url="https://api.groq.com/openai/v1"
        )
        with open(audio_path, "rb") as audio_file:
            transcription = groq_client.audio.transcriptions.create(
                model="whisper-large-v3-turbo",
                file=audio_file,
                response_format="text"
            )
        text = transcription if isinstance(transcription, str) else transcription.text
        print(f"✅ Groq Whisper transcription complete ({len(text)} chars).")
        return text.strip()
    except Exception as e:
        print(f"❌ Groq Whisper Error: {e}")
        return None

def extract_audio(video_path, output_audio_path):
    """
    Extracts audio from a video file and saves it to output_audio_path.
    """
    from moviepy import VideoFileClip
    try:
        if not os.path.exists(video_path):
            print(f"Video file not found: {video_path}")
            return False
            
        video = VideoFileClip(video_path)
        if video.audio is not None:
            video.audio.write_audiofile(output_audio_path, logger=None)
            video.close()
            return True
        video.close()
        print(f"No audio track found in {video_path}")
        return False
    except Exception as e:
        print(f"Error extracting audio: {e}")
        return False

def extract_frames(video_path, output_folder, interval=10):
    """
    Extracts frames from a video file at a given interval (in seconds).
    Returns a list of paths to the extracted frames.
    """
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    import cv2
    frame_paths = []
    try:
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        if fps <= 0:
            fps = 30 # Fallback
            
        frame_interval = int(fps * interval)
        count = 0
        success, image = cap.read()
        
        while success:
            if count % frame_interval == 0:
                frame_name = f"frame_{count//frame_interval}.jpg"
                frame_path = os.path.join(output_folder, frame_name)
                cv2.imwrite(frame_path, image)
                frame_paths.append(frame_path)
            
            success, image = cap.read()
            count += 1
            
        cap.release()
    except Exception as e:
        print(f"Error extracting frames: {e}")
        
    return frame_paths
