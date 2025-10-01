from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import requests
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import io, tempfile
from faster_whisper import WhisperModel

app = FastAPI()

# ✅ Enable CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # in prod, set your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ⚠️ Put these in environment variables in production
OPENROUTER_API_KEY = "YOUR API KEY"
ELEVENLABS_API_KEY = "YOUR API KEY"
ELEVENLABS_VOICE_ID = ""  # replace with your ElevenLabs voice ID

class ChatRequest(BaseModel):
    message: str

class TTSRequest(BaseModel):
    text: str


# In-memory storage (per server, resets on restart)
conversation_history = [
    {
        "role": "system",
        "content": (
            "You are Sophia, a friendly young woman. "
            "You always respond like a real human, with natural pauses and casual fillers like 'umm', 'ahh', 'you know'. "
            "Keep your answers warm, conversational, and personal. "
            "Never say you're an AI. "
            "Do not use emojis. "
            "Keep the style conversational as if you're chatting with a friend."
        )
    }
]

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def chat(request: ChatRequest):
    global conversation_history

    # Add user message
    conversation_history.append({"role": "user", "content": request.message})

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Voice Bot",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "x-ai/grok-4-fast:free",
        "messages": conversation_history
    }

    response = requests.post("https://openrouter.ai/api/v1/chat/completions",
                             headers=headers, json=payload)

    data = response.json()

    if "choices" in data and len(data["choices"]) > 0:
        reply = data["choices"][0]["message"]["content"]
        # Save Sophia’s reply in history
        conversation_history.append({"role": "assistant", "content": reply})
    else:
        reply = "Umm, sorry, I didn’t quite catch that."

    return {"reply": reply}


@app.post("/speak")
def speak(req: TTSRequest):
    """Convert Sophia's reply text to speech via ElevenLabs"""
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"

    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY
    }

    payload = {
        "text": req.text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {"stability": 0.6, "similarity_boost": 0.8}
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code != 200:
        return JSONResponse(content={"error": "TTS failed"}, status_code=500)

    audio_bytes = response.content
    return StreamingResponse(io.BytesIO(audio_bytes), media_type="audio/mpeg")
