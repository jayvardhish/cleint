from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks, Form, Response
from typing import List, Optional
import shutil
import os
import uuid
from datetime import datetime
from database import get_database
from routers.auth import get_current_user
from models import UserResponse
from ai_client import client
from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs
from utils.video_utils import extract_audio, download_youtube_audio, get_video_metadata, transcribe_audio_whisper
import langcodes
from bson import ObjectId
import asyncio
import json
import re
from utils.cloudinary_utils import upload_file_to_cloudinary
from utils.file_manager import ensure_local_file, cleanup_local_file

router = APIRouter(prefix="/api/videos", tags=["Videos"])

UPLOAD_DIR = "uploads/videos"
AUDIO_DIR = "uploads/audio"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR, exist_ok=True)

# --- Helper Functions ---

def extract_video_id(url: str) -> Optional[str]:
    query = urlparse(url)
    if query.hostname == 'youtu.be':
        return query.path[1:]
    if query.hostname in ('www.youtube.com', 'youtube.com'):
        if query.path == '/watch':
            p = parse_qs(query.query)
            return p.get('v', [None])[0]
        if query.path[:7] == '/embed/':
            return query.path.split('/')[2]
        if query.path[:3] == '/v/':
            return query.path.split('/')[2]
    return None

async def restore_punctuation(text: str) -> str:
    if not client or not text.strip():
        return text
    try:
        response = client.chat.completions.create(
            # Using current active model (Groq/DeepSeek/OpenAI)
            messages=[
                {"role": "system", "content": "You are a professional editor. Restore punctuation and capitalization to the following transcript. Keep the original words exactly as they are."},
                {"role": "user", "content": text[:4000]}
            ]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Punctuation Error: {e}")
        return text

async def generate_ai_summary(text: str, summary_type: str) -> dict:
    if not client:
        return {"error": "AI client not initialized"}
    
    # If text is too long, use parallel chunked summarization
    if len(text) > 12000: # Threshold for chunking
        return await generate_parallel_summary(text, summary_type)

    system_prompt = """You are an expert content analyst. Your task is to summarize a YouTube video transcript into a clear, structured, and highly useful format.

Instructions:
- Keep the summary concise but informative
- Capture the main ideas, key arguments, and important details
- Remove filler, repetition, and irrelevant content
- Use simple, easy-to-understand language

Output format (Strictly JSON only):
{
  "tldr": "2–3 lines max punchy summary",
  "key_points": ["Main Point 1", "Main Point 2", ...],
  "summary": "Detailed, well-structured comprehensive summary paragraphs",
  "insights": ["Important Insight 1", "Key Takeaway 2", ...],
  "actionable_steps": ["(Optional) Step 1", "(Optional) Step 2", ...]
}"""

    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Summarize this transcript: {text}"}
            ],
            max_tokens=client.default_max_tokens,
            # We don't use response_format if it's OpenRouter or Groq to avoid potential API issues
            # But the SmartAIClient handles model swapping internally
        )
        content = response.choices[0].message.content.strip()
        
        # Robust JSON extraction: look for the first '{' and last '}'
        json_match = re.search(r'(\{.*\})', content, re.DOTALL)
        if json_match:
            content = json_match.group(1)
        
        return json.loads(content)
    except Exception as e:
        print(f"❌ Summary Generation Error: {e}")
        return {
            "tldr": "Error processing summary",
            "summary": str(e),
            "key_points": [],
            "insights": []
        }

async def generate_parallel_summary(text: str, summary_type: str) -> dict:
    """Chunks text and summarizes in parallel using the active AI client."""
    from utils.embedding_utils import chunk_text
    chunks = chunk_text(text, max_tokens=3000, overlap=200)
    
    async def summarize_chunk(chunk_data):
        chunk_text = chunk_data['text']
        prompt = f"Summarize this part of a transcript. Focus only on key ideas, remove fluff.\n\nTranscript chunk:\n{chunk_text}"
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, lambda: client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a professional technical summarizer. Focus on key ideas and remove fluff."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=600
            ))
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"[Error: {e}]"

    print(f"DEBUG: Summarizing {len(chunks)} chunks in parallel...")
    chunk_summaries = await asyncio.gather(*(summarize_chunk(chunk) for chunk in chunks))
    combined_summary = "\n\n".join(chunk_summaries)
    
    # Final merge
    system_prompt = "You are given multiple partial summaries of a YouTube video. Combine them into a final, clean, non-repetitive summary. Make it coherent and remove duplication."
    
    user_prompt = f"""Output the final summary in this exact JSON format:
    {{
      "tldr": "2-3 line punchy final TL;DR",
      "key_points": ["Point 1", "Point 2", ...],
      "summary": "Coherent, high-quality final summary",
      "insights": ["Takeaway 1", "Takeaway 2", ...]
    }}

    Partial Summaries:
    {combined_summary}"""
    
    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=client.default_max_tokens
        )
        content = response.choices[0].message.content.strip()

        # Robust JSON extraction
        json_match = re.search(r'(\{.*\})', content, re.DOTALL)
        if json_match:
            content = json_match.group(1)

        return json.loads(content)
    except Exception as e:
        print(f"❌ Final Merge Error: {e}")
        return {
            "tldr": "Partial completion",
            "summary": combined_summary[:2000],
            "key_points": [],
            "insights": []
        }

async def generate_study_notes_ai(text: str, video_title: str = "") -> dict:
    if not client:
        return {"error": "AI client not initialized"}

    system_prompt = """You are an expert educator, professor, and writer.

CRITICAL RULES:
- You will be given a VIDEO TRANSCRIPT and a TITLE.
- Your task is to generate highly extensive study notes BASED ONLY ON THE PROVIDED TRANSCRIPT.
- DO NOT use outside knowledge or general info about the topic that is not mentioned in the video.
- If the transcript is brief, be concise. Do NOT hallucinate details.
- Capture the specific examples, speakers' points, and nuances from this specific video.
- Write large, detailed paragraphs for the sections below.
- Create exactly 10 multiple-choice questions (MCQs) logically progressing from basic to advanced based on video content.

Output format (Strictly JSON only):
{
  "definition": "A deep-dive into the core concepts as explained in this specific video.",
  "key_points": [
    "Specific point 1 from the video with explanation",
    "Specific point 2 from the video with explanation",
    "Specific point 3",
    "Specific point 4",
    "Specific point 5"
  ],
  "simple_explanation": "A simplified version of the video's content using analogies that match the video's context.",
  "real_life_examples": [
    "Example 1 mentioned in the video",
    "Example 2 mentioned in the video",
    "Example 3 from the video"
  ],
  "mcqs": [
    {
      "question": "Question text based on a specific detail in the video?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "explanation": "Detailed explanation using the video's context"
    }
  ]
}"""

    content_text = text[:12000] if len(text) > 12000 else text
    title_ctx = f"Video Title: {video_title}\n\n" if video_title else ""

    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Please generate study notes strictly based on this {title_ctx}VIDEO TRANSCRIPT:\n\n{content_text}"}
            ],
            max_tokens=client.default_max_tokens if hasattr(client, "default_max_tokens") else 4000
        )
        content = response.choices[0].message.content.strip()

        # Strip markdown fences if present
        if content.startswith("```"):
            content = re.sub(r'^```[a-z]*\n?', '', content)
            content = re.sub(r'\n?```$', '', content).strip()

        json_match = re.search(r'(\{.*\})', content, re.DOTALL)
        if json_match:
            content = json_match.group(1)

        return json.loads(content)
    except json.JSONDecodeError as e:
        print(f"❌ JSON parse error in study notes: {e}")
        return {
            "definition": "AI response could not be parsed. Try again.",
            "simple_explanation": "Please re-submit the video.",
            "key_points": [],
            "real_life_examples": []
        }
    except Exception as e:
        print(f"❌ Study Notes Generation Error: {e}")
        return {
            "definition": "AI generation failed",
            "simple_explanation": str(e),
            "key_points": [],
            "real_life_examples": []
        }

# --- Endpoints ---

@router.post("/upload")
async def upload_video(
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user)
):
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video")
    
    # Upload to Cloudinary instead of local disk
    try:
        secure_url = upload_file_to_cloudinary(file, folder="videos", resource_type="video")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cloudinary error: {str(e)}")
    
    db = await get_database()
    video_doc = {
        "user_id": current_user.id,
        "title": file.filename,
        "file_path": secure_url, # Stores Cloudinary URL
        "status": "uploaded",
        "created_at": datetime.utcnow()
    }
    
    result = await db.videos.insert_one(video_doc)
    return {
        "id": str(result.inserted_id),
        "filename": file.filename,
        "status": "uploaded",
        "file_url": secure_url
    }

@router.post("/youtube/languages")
async def get_youtube_languages(url: str = Form(...)):
    """Fetches available transcript languages for a YouTube video."""
    video_id = extract_video_id(url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")
    
    try:
        # Fetch the List of Available Transcripts: handle version differences
        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        except (AttributeError, TypeError):
            # Fallback for older versions where list() is an instance method
            transcript_list = YouTubeTranscriptApi().list(video_id)
        
        # Extract and convert language codes to names
        languages = []
        for t in transcript_list:
            try:
                # 't' might be an object or dict depending on version
                l_code = getattr(t, 'language_code', t.get('language_code') if isinstance(t, dict) else str(t))
                is_gen = getattr(t, 'is_generated', t.get('is_generated', False) if isinstance(t, dict) else False)
                
                lang_name = langcodes.Language.get(l_code).display_name()
                languages.append({
                    "name": lang_name,
                    "code": l_code,
                    "generated": is_gen
                })
            except Exception:
                l_code = getattr(t, 'language_code', '??')
                languages.append({
                    "name": f"Unknown ({l_code})",
                    "code": l_code,
                    "generated": False
                })
        
        return {"languages": languages}
    except Exception as e:
        print(f"❌ Language Fetch Error: {e}")
        return {"languages": [], "error": str(e)}

@router.get("/")
async def get_user_videos(current_user: UserResponse = Depends(get_current_user)):
    db = await get_database()
    videos = await db.videos.find({"user_id": current_user.id}).sort("created_at", -1).to_list(100)
    for v in videos:
        v["_id"] = str(v["_id"])
    return videos

@router.post("/youtube")
async def summarize_youtube(
    url: str = Form(...),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Robust YouTube processor: Extracts transcript or uses audio fallback.
    """
    video_id = extract_video_id(url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    # 1. Fetch Metadata (Title, etc.)
    metadata = get_video_metadata(url)
    video_title = metadata.get("title", "YouTube Video")

    # 2. Extract Transcript
    print(f"📡 Processing YouTube Video: {video_title} ({video_id})")
    transcript_text = ""
    try:
        # Try to get transcript from YouTube API
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        transcript_text = " ".join([t['text'] for t in transcript_list])
        print("✅ Transcript extracted via YouTube API")
    except Exception as e:
        print(f"⚠️ YouTube API Transcript failed: {e}. Falling back to audio transcription...")
        # Fallback to audio download and Whisper
        audio_path = os.path.join(AUDIO_DIR, f"yt_{video_id}.mp3")
        try:
            if not os.path.exists(audio_path):
                print(f"📥 Downloading audio for {video_id}...")
                audio_path = await download_youtube_audio(url, audio_path)
            
            print(f"📡 Transcribing audio for {video_id}...")
            transcript_text = transcribe_audio_whisper(audio_path)
            print("✅ Transcript extracted via Whisper fallback")
        except Exception as audio_err:
            print(f"❌ Audio fallback failed: {audio_err}")
            # Final fallback: use metadata if everything fails
            transcript_text = f"Title: {video_title}. Metadata extraction failed."

    # 3. Generate AI study notes
    study_notes = await generate_study_notes_ai(transcript_text, video_title)

    # 4. Store in DB
    db = await get_database()
    video_uid = str(uuid.uuid4())
    video_doc = {
        "_id": video_uid,
        "user_id": current_user.id,
        "title": video_title,
        "url": url,
        "video_id": video_id,
        "type": "youtube",
        "status": "summarized",
        "study_notes": study_notes,
        "tldr": study_notes.get("definition", "")[:150] + "...",
        "summary": study_notes.get("simple_explanation", ""),
        "key_points": study_notes.get("key_points", []),
        "insights": study_notes.get("real_life_examples", []),
        "mcqs": study_notes.get("mcqs", []),
        "created_at": datetime.utcnow()
    }
    
    await db.videos.insert_one(video_doc)
    
    return {**video_doc, "_id": video_doc["_id"]}

@router.post("/{video_id}/summarize")
async def summarize_local_video(
    video_id: str,
    summary_type: str = Form("detailed"),
    current_user: UserResponse = Depends(get_current_user)
):
    db = await get_database()
    
    # Try finding by ObjectId if valid, else by string
    video_filter = {"user_id": current_user.id}
    try:
        video_filter["_id"] = ObjectId(video_id)
    except:
        video_filter["_id"] = video_id
        
    video = await db.videos.find_one(video_filter)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    video_path = video.get("file_path")
    if not video_path:
        raise HTTPException(status_code=400, detail="Video file missing on server")

    # Download from Cloudinary if it's a URL
    local_video_path = await ensure_local_file(video_path)
    if not os.path.exists(local_video_path):
        raise HTTPException(status_code=400, detail="Failed to retrieve video file for processing")

    audio_path = os.path.join(AUDIO_DIR, f"{video_id}.mp3")
    
    try:
        # 2. Transcription Pipeline
        if not os.path.exists(audio_path):
            success = extract_audio(local_video_path, audio_path)
            if not success:
                raise Exception("Failed to extract audio from video")

        print(f"📡 [Transcription] Processing audio for video {video_id}...")
        transcript_text = await asyncio.get_event_loop().run_in_executor(
            None, transcribe_audio_whisper, audio_path
        )
        
        if not transcript_text:
            raise Exception("Transcription failed or returned empty text")

        # 3. Generate AI study notes
        study_notes = await generate_study_notes_ai(transcript_text)

        # 4. Update Database
        await db.videos.update_one(
            video_filter,
            {
                "$set": {
                    "status": "summarized", 
                    "study_notes": study_notes,
                    # Keep placeholders for compatibility
                    "tldr": study_notes.get("definition", "")[:100] + "...",
                    "summary": study_notes.get("simple_explanation", ""),
                    "key_points": study_notes.get("key_points", []),
                    "insights": study_notes.get("real_life_examples", []),
                    "mcqs": study_notes.get("mcqs", []),
                    "summary_type": "study-notes",
                    "last_updated": datetime.utcnow()
                }
            }
        )
        
        return {"id": video_id, "study_notes": study_notes, "status": "summarized"}
        
    except Exception as e:
        print(f"Local Video Summary Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process video: {str(e)}")
    finally:
        cleanup_local_file(local_video_path)

@router.post("/{video_id}/ask")
async def ask_video_question(
    video_id: str,
    question: str = Form(...),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Ask a question about a video's content using RAG retrieval.
    Returns source-grounded answers based on transcript chunks.
    """
    from vector_store import retrieve_relevant_chunks, get_video_chunk_count
    
    db = await get_database()
    
    # Verify video exists and belongs to user
    video_filter = {"user_id": current_user.id}
    try:
        video_filter["_id"] = ObjectId(video_id)
    except:
        video_filter["_id"] = video_id
    
    video = await db.videos.find_one(video_filter)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Check if chunks exist for this video
    chunk_count = get_video_chunk_count(video_id)
    if chunk_count == 0:
        raise HTTPException(
            status_code=400, 
            detail="This video has not been processed with the RAG pipeline. Please re-summarize it first."
        )
    
    # Retrieve relevant chunks (using local embeddings)
    try:
        relevant_chunks = retrieve_relevant_chunks(video_id, question, top_k=5, use_openai_embeddings=False)
    except Exception as e:
        print(f"Retrieval error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve relevant content")
    
    if not relevant_chunks:
        return {
            "answer": "I couldn't find relevant information in the video transcript to answer this question.",
            "sources": []
        }
    
    # Build context from chunks
    context_parts = []
    for i, chunk in enumerate(relevant_chunks):
        context_parts.append(f"[Source {i+1}]\n{chunk['text']}")
    
    context = "\n\n".join(context_parts)
    
    # Source-grounded system prompt
    system_prompt = """You are a source-grounded research assistant analyzing video transcripts.

CRITICAL RULES:
1. Only use information from the provided transcript sources
2. Do NOT add outside knowledge or assumptions
3. If something is not in the sources, say: "Not mentioned in the provided transcript"
4. Reference sources as [Source 1], [Source 2], etc.
5. Be precise and information-dense
6. Remove filler words from quotes

Never hallucinate. Never invent details. Stay grounded in the transcript."""

    user_prompt = f"""Based on the following transcript excerpts, answer this question:

Question: {question}

Transcript Sources:
{context}

Provide a clear, concise answer using only the information above. Reference your sources."""

    # Get answer from DeepSeek
    if not client:
        raise HTTPException(status_code=500, detail="AI service unavailable")
    
    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=client.default_max_tokens
        )
        
        answer = response.choices[0].message.content.strip()
        
        # Format sources for response
        sources = [
            {
                "source_id": i + 1,
                "text": chunk['text'][:200] + "..." if len(chunk['text']) > 200 else chunk['text'],
                "relevance": 1 - chunk.get('distance', 0)  # Convert distance to similarity
            }
            for i, chunk in enumerate(relevant_chunks)
        ]
        
        return {
            "answer": answer,
            "sources": sources,
            "video_id": video_id
        }
        
    except Exception as e:
        print(f"AI Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate answer")

@router.post("/{video_id}/study-notes")
async def generate_video_study_notes(
    video_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Generate structured study notes for a video using DeepSeek AI.
    """
    db = await get_database()
    
    # Find video
    video_filter = {"user_id": current_user.id}
    try:
        video_filter["_id"] = ObjectId(video_id)
    except:
        video_filter["_id"] = video_id
        
    video = await db.videos.find_one(video_filter)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    # If already has study notes, return them
    if "study_notes" in video and video["study_notes"]:
        return video["study_notes"]

    # We need the transcript context. We can try to use the existing summary or retrieve chunks.
    from vector_store import retrieve_relevant_chunks, get_video_chunk_count
    
    chunk_count = get_video_chunk_count(video_id)
    if chunk_count > 0:
        # Retrieve diverse chunks for a complete overview
        relevant_chunks = retrieve_relevant_chunks(video_id, "Give me a comprehensive overview for study notes", top_k=min(12, chunk_count), use_openai_embeddings=False)
        context = "\n\n".join([c['text'] for c in relevant_chunks])
    else:
        # Fallback to summary if chunks missing
        context = f"Title: {video.get('title')}\n\nSummary: {video.get('summary')}\n\nKey Points: {', '.join(video.get('key_points', []))}"

    study_notes = await generate_study_notes_ai(context)
    
    # Save to database
    await db.videos.update_one(
        video_filter,
        {"$set": {"study_notes": study_notes}}
    )
    
    return study_notes

@router.get("/{video_id}/pdf")
async def export_video_pdf(
    video_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Generates a professional, academic PDF summary of the video notes.
    """
    from xhtml2pdf import pisa
    from io import BytesIO
    
    db = await get_database()
    
    # Find video
    video_filter = {"user_id": current_user.id}
    try:
        video_filter["_id"] = ObjectId(video_id)
    except:
        video_filter["_id"] = video_id
        
    video = await db.videos.find_one(video_filter)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    notes = video.get("study_notes", {})
    if not notes:
        # Generate them if missing
        notes = await generate_video_study_notes(video_id, current_user)

    # 1. AI ENHANCEMENT for the PDF (Academic formatting)
    enhancer_prompt = f"""
    You are an academic researcher. Enhance these study notes into a professional, formal academic summary.
    Use high-level academic language, formal structure, and deep explanations.
    Format your response in structured HTML with the following sections (No <html> or <body> tags, just content):
    <h1>TITLE: {video.get('title')}</h1>
    <h2>1. EXECUTIVE OVERVIEW</h2>
    <p>Detailed overview...</p>
    <h2>2. KEY CONCEPTS & DEFINITIONS</h2>
    <ul><li>Concept: Definition...</li></ul>
    <h2>3. DETAILED ANALYSIS</h2>
    <p>In-depth explanation...</p>
    <h2>4. PRACTICAL APPLICATIONS</h2>
    <p>Examples...</p>
    <h2>5. STRATEGIC INSIGHTS</h2>
    <p>Future outlook or deeper connection...</p>

    Input Notes: {json.dumps(notes)}
    """
    
    try:
        print(f"📡 Enhancing notes for PDF export: {video.get('title')}")
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": enhancer_prompt}],
            max_tokens=4000
        )
        enhanced_html = response.choices[0].message.content.strip()
        # Remove any potential markdown 
        if "```html" in enhanced_html:
            enhanced_html = enhanced_html.split("```html")[1].split("```")[0].strip()
    except Exception as e:
        print(f"⚠️ Enhancement Error: {e}")
        # Fallback to basic notes if enhancement fails
        enhanced_html = f"<h1>{video.get('title')}</h1><p>{notes.get('definition')}</p>"

    # 2. PDF GENERATION (LaTeX-like CSS)
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
    <style>
        body {{ font-family: 'Times New Roman', serif; line-height: 1.6; color: #333; }}
        h1 {{ text-align: center; font-size: 24pt; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 30px; }}
        h2 {{ color: #2c3e50; border-left: 5px solid #2c3e50; padding-left: 10px; margin-top: 25px; font-size: 16pt; }}
        p {{ text-align: justify; margin-bottom: 15px; font-size: 11pt; }}
        ul {{ margin-bottom: 15px; }}
        li {{ margin-bottom: 8px; font-size: 11pt; }}
        .header {{ text-align: right; font-size: 9pt; color: #777; border-bottom: 1px solid #ccc; margin-bottom: 20px; }}
        .footer {{ position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 9pt; color: #999; }}
    </style>
    </head>
    <body>
        <div class="header">Smart Learn AI - Academic Digest - {datetime.utcnow().strftime('%Y-%m-%d')}</div>
        {enhanced_html}
        <div class="footer">Generated by Smart Learn Platform Intelligence Core</div>
    </body>
    </html>
    """

    pdf_buffer = BytesIO()
    pisa.CreatePDF(html_content, dest=pdf_buffer)
    pdf_data = pdf_buffer.getvalue()
    pdf_buffer.close()

    return Response(
        content=pdf_data,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=\"{video.get('title', 'video')}_Summary.pdf\""
        }
    )

@router.get("/{video_id}/latex")
async def export_video_latex(
    video_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Generates a raw LaTeX (.tex) version of the study notes.
    """
    db = await get_database()
    video_filter = {"user_id": current_user.id}
    try: video_filter["_id"] = ObjectId(video_id)
    except: video_filter["_id"] = video_id
        
    video = await db.videos.find_one(video_filter)
    if not video: raise HTTPException(status_code=404, detail="Video not found")

    notes = video.get("study_notes", {})
    
    latex_prompt = f"""
    Convert the following study notes into a professional LaTeX document.
    Use academic LaTeX structure: \\\\documentclass{{article}}, \\\\usepackage{{enumerate}}, etc.
    Include deep explanations and formal academic tone.
    Video Title: {video.get('title')}
    Notes Data: {json.dumps(notes)}
    Return ONLY the raw LaTeX code.
    """
    
    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": latex_prompt}],
            max_tokens=4000
        )
        latex_content = response.choices[0].message.content.strip()
        if "```latex" in latex_content:
            latex_content = latex_content.split("```latex")[1].split("```")[0].strip()
        elif "```" in latex_content:
            latex_content = latex_content.split("```")[1].split("```")[0].strip()
    except Exception as e:
        latex_content = f"% Error generating LaTeX: {e}\n\\documentclass{{article}}\n\\begin{{document}}\nBasic Title: {video.get('title')}\n\\end{{document}}"

    return Response(
        content=latex_content,
        media_type="text/plain",
        headers={
            "Content-Disposition": f"attachment; filename=\"{video.get('title', 'video')}.tex\""
        }
    )

@router.delete("/clear")
async def clear_video_history(current_user: UserResponse = Depends(get_current_user)):
    """
    Clears all video history and deletes associated files for the current user.
    """
    db = await get_database()
    
    # Get all videos for the user to delete local files
    try:
        videos = await db.videos.find({"user_id": current_user.id}).to_list(1000)
    except Exception as e:
        print(f"Error fetching videos for clear: {e}")
        return {"error": str(e)}
    
    if not videos:
        return {"message": "No history to clear."}
        
    for video in videos:
        # Delete audio files (local artifacts)
        video_uuid = str(video.get("_id"))
        yid = video.get("video_id")
        
        audio_paths = [
            os.path.join(AUDIO_DIR, f"{video_uuid}.mp3"),
            os.path.join(AUDIO_DIR, f"yt_{video_uuid}.mp3"),
            os.path.join(AUDIO_DIR, f"yt_{yid}.mp3") if yid else None,
            os.path.join(AUDIO_DIR, f"yt_{yid}.m4a") if yid else None
        ]
        
        for path in audio_paths:
            if path and os.path.exists(path):
                try: os.remove(path)
                except: pass
            
        # (Cloudinary handles remote storage; we omit destroy for now to keep it simple unless needed)


    # Delete records from DB
    result = await db.videos.delete_many({"user_id": current_user.id})
    
    # Delete from vector store if vector_store is imported
    try:
        from vector_store import delete_video_vectors
        for video in videos:
            delete_video_vectors(str(video.get("_id")))
    except ImportError: pass
    except Exception as e: print(f"Vector delete error: {e}")

    return {"message": f"Successfully cleared history. {result.deleted_count} records removed."}


@router.delete("/{video_id}")
async def delete_single_video(
    video_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Deletes a single video from the user's history by ID.
    Must be registered AFTER DELETE /clear to avoid route shadowing.
    """
    db = await get_database()
    video_filter = {"user_id": current_user.id}
    try:
        video_filter["_id"] = ObjectId(video_id)
    except Exception:
        video_filter["_id"] = video_id

    video = await db.videos.find_one(video_filter)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    # Delete local files if present
    video_path = video.get("file_path")
    if video_path and os.path.exists(video_path):
        try:
            os.remove(video_path)
        except Exception:
            pass

    # Delete local audio files (artifacts)
    video_uuid = str(video.get("_id"))
    yid = video.get("video_id")
    
    audio_paths = [
        os.path.join(AUDIO_DIR, f"{video_uuid}.mp3"),
        os.path.join(AUDIO_DIR, f"yt_{video_uuid}.mp3"),
        os.path.join(AUDIO_DIR, f"yt_{yid}.mp3") if yid else None,
        os.path.join(AUDIO_DIR, f"yt_{yid}.m4a") if yid else None
    ]
    
    for path in audio_paths:
        if path and os.path.exists(path):
            try: os.remove(path)
            except: pass

    # Delete from vector store
    try:
        from vector_store import delete_video_vectors
        delete_video_vectors(video_id)
    except Exception:
        pass

    await db.videos.delete_one(video_filter)
    return {"message": "Video deleted successfully.", "id": video_id}
