# Backend - SmartLearn API

FastAPI-based backend for the SmartLearn platform.

## 📁 Structure

```
backend/
├── routers/              # API endpoints
│   ├── auth.py          # User authentication & registration
│   ├── videos.py        # Video summarization
│   ├── quizzes.py       # Quiz generation
│   ├── math.py          # Math problem solving
│   ├── ocr.py           # Handwriting recognition
│   ├── chat.py          # Virtual tutor chatbot
│   └── vdo_ocr.py       # Video OCR processing
│
├── utils/               # Helper functions
│   └── video_utils.py   # Video processing utilities
│
├── main.py              # FastAPI application entry point
├── database.py          # MongoDB connection & queries
├── models.py            # Pydantic data models
├── auth_utils.py        # JWT token handling
├── ai_client.py         # OpenAI/DeepSeek client
├── ocr_utils.py         # OCR initialization
├── vector_store.py      # Vector database for RAG
└── requirements.txt     # Python dependencies
```

## 🔧 Setup

1. **Create virtual environment**:
   ```bash
   python -m venv venv
   venv\\Scripts\\activate  # Windows
   source venv/bin/activate  # Mac/Linux
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment** (create `.env`):
   ```env
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
   SECRET_KEY=your-secret-key-here
   OPENAI_API_KEY=sk-...
   DEEPSEEK_API_KEY=sk-...
   CLIENT_URL=http://localhost:5173
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```

4. **Run server**:
   ```bash
   python main.py
   ```
   Server starts at `http://localhost:5000`

## 🔑 Key Components

### Authentication (`auth.py`)
- JWT-based authentication
- Google OAuth integration
- Password reset functionality

### AI Client (`ai_client.py`)
- Unified interface for OpenAI and DeepSeek
- Automatic fallback between providers
- Token usage tracking

### Video Processing (`videos.py`)
- YouTube video download
- Audio extraction
- Whisper transcription
- AI-powered summarization

### Math Solver (`math.py`)
- OCR for handwritten equations
- Text-based equation input
- Step-by-step LaTeX solutions

### Quiz Generator (`quizzes.py`)
- PDF text extraction
- AI-generated questions
- Multiple choice format

## 📝 API Documentation

Once running, visit:
- Swagger UI: `http://localhost:5000/docs`
- ReDoc: `http://localhost:5000/redoc`

## 🐛 Common Issues

**MongoDB connection fails**:
- Check `MONGODB_URI` format
- Ensure IP is whitelisted in MongoDB Atlas

**AI API errors**:
- Verify API keys are valid
- Check API quota/billing

**Import errors**:
- Reinstall dependencies: `pip install -r requirements.txt --force-reinstall`
