from fastapi import APIRouter, UploadFile, File, HTTPException
import whisper
import google.genai as genai
from dotenv import load_dotenv
import tempfile
import os

# Load env variables
load_dotenv()

router = APIRouter(
    prefix="/voicebot",
    tags=["voicebot"]
)

# Load Whisper ONCE
whisper_model = whisper.load_model("base")

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    client = genai.Client(api_key=api_key)
else:
    client = None


@router.post("/process-voice")
async def process_voice(file: UploadFile = File(...)):
    """
    1. Accept audio file
    2. Transcribe using Whisper
    3. Analyze mood using Gemini
    """

    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Invalid audio file")

    # Save temp audio file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp:
        temp.write(await file.read())
        temp_path = temp.name

    try:
        # Whisper transcription
        result = whisper_model.transcribe(temp_path)
        text = result.get("text", "")

        if not text:
            raise HTTPException(status_code=500, detail="Transcription failed")

        # Gemini analysis
        if client is None:
            analysis_text = "Gemini API key not configured"
        else:
            response = client.models.generate_content(
                model="gemini-1.5-pro",
                contents=f"Analyze emotional tone and mood from this text:\n{text}"
            )
            analysis_text = getattr(response, "text", "No analysis returned")

        return {
            "status": "success",
            "transcript": text,
            "analysis": analysis_text
        }

    finally:
        os.remove(temp_path)
