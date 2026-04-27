import shutil
import os
import json
import base64
import traceback
from io import BytesIO
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.ext.asyncio import AsyncSession
import whisper
import google.genai as genai
from gtts import gTTS
from pydub import AudioSegment
from dotenv import load_dotenv

# Import database stuff
from app.database import get_db
from app.models import DailyCheckIn

load_dotenv()

# Find FFmpeg executable
def get_ffmpeg_path():
    """Find ffmpeg executable in common locations"""
    import subprocess
    
    # Check common Windows locations first (more reliable)
    common_paths = [
        'D:\\Project\\ffmpeg\\bin\\ffmpeg.exe',
        'D:\\Project\\ffmpeg-bin\\bin\\ffmpeg.exe',
        'C:\\ffmpeg\\bin\\ffmpeg.exe',
        'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
        'C:\\Program Files (x86)\\ffmpeg\\bin\\ffmpeg.exe',
        'ffmpeg',  # If in PATH
    ]
    
    for path in common_paths:
        try:
            # Check if file exists
            if os.path.isfile(path):
                # Try to run it
                result = subprocess.run([path, '-version'], capture_output=True, timeout=5)
                if result.returncode == 0:
                    print(f"✅ Found FFmpeg at: {path}")
                    return path
        except:
            pass
    
    # Try using 'where' command as fallback
    try:
        result = subprocess.run(['where', 'ffmpeg'], capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            found = result.stdout.strip().split('\n')[0]
            print(f"✅ Found FFmpeg at: {found}")
            return found
    except:
        pass
    
    return None

ffmpeg_path = get_ffmpeg_path()
if not ffmpeg_path:
    print("⚠️ FFmpeg not found. Audio conversion will be limited.")
    print("📥 Download from: https://ffmpeg.org/download.html")
else:
    print(f"✅ FFmpeg ready for audio conversion")
    # Set environment variable for pydub - use explicit path
    os.environ['FFMPEG_BINARY'] = ffmpeg_path

# 1. Load Whisper (Hearing)
print("Loading Whisper Model...")
whisper_model = whisper.load_model("base")
print("Whisper Ready.")

# 2. Setup Gemini (Thinking)
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("WARNING: GEMINI_API_KEY is missing in .env")
    client = None
else:
    client = genai.Client(api_key=api_key)

router = APIRouter(prefix="/voicebot", tags=["AI Voicebot"])

def text_to_speech(text: str, language: str = "hi") -> str:
    """
    Convert text to speech using gTTS
    Returns base64 encoded audio
    """
    try:
        tts = gTTS(text=text, lang=language, slow=False)
        audio_buffer = BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)
        audio_base64 = base64.b64encode(audio_buffer.getvalue()).decode('utf-8')
        return audio_base64
    except Exception as e:
        print(f"TTS Error: {e}")
        return None


def convert_audio_to_wav(input_path: str, output_path: str) -> bool:
    """
    Convert any audio format to WAV using pydub
    Supports webm, mp4, wav, etc.
    """
    try:
        print(f"  Loading audio with pydub...")
        
        # Detect format from file extension
        file_ext = os.path.splitext(input_path)[1].lower()
        format_type = file_ext.lstrip('.')
        
        # If already WAV, just copy it
        if format_type == 'wav':
            print(f"  File is already WAV, copying...")
            shutil.copy2(input_path, output_path)
            print(f"  ✅ WAV file ready: {output_path}")
            return True
        
        # For other formats, check if FFmpeg is available
        if not ffmpeg_path:
            print(f"  ⚠️ FFmpeg not found - cannot convert {format_type} format")
            print(f"  📥 Install FFmpeg from: https://ffmpeg.org/download.html")
            print(f"  📝 Extract to C:\\ffmpeg or any location, then add to Windows PATH")
            return False
        
        if format_type in ['webm', 'mp4', 'ogg', 'flac']:
            # These formats need special handling
            print(f"  Format detected: {format_type}")
            audio = AudioSegment.from_file(input_path, format=format_type)
        else:
            # Let pydub auto-detect
            audio = AudioSegment.from_file(input_path)
        
        print(f"  Audio duration: {len(audio)}ms, Channels: {audio.channels}, Sample rate: {audio.frame_rate}Hz")
        
        # Ensure 16kHz mono (Whisper requirement)
        if audio.frame_rate != 16000:
            print(f"  Resampling to 16kHz...")
            audio = audio.set_frame_rate(16000)
        
        if audio.channels != 1:
            print(f"  Converting to mono...")
            audio = audio.set_channels(1)
        
        # Export as WAV
        audio.export(output_path, format="wav")
        print(f"  ✅ Converted to WAV: {output_path}")
        return True
        
    except Exception as e:
        print(f"  ❌ Audio conversion failed: {type(e).__name__}: {e}")
        traceback.print_exc()
        return False

@router.post("/process")
async def process_audio(
    elder_id: int = Form(...),
    audio: UploadFile = File(...), 
    db: AsyncSession = Depends(get_db)
):
    temp_filename = f"temp_{audio.filename}"
    wav_filename = None
    
    try:
        # 1. Validate file
        print(f"\n📂 File received: {audio.filename}")
        print(f"📂 Content type: {audio.content_type}")
        
        # Save audio file temporarily
        with open(temp_filename, "wb") as buffer:
            content = await audio.read()
            print(f"📂 File size: {len(content)} bytes")
            buffer.write(content)

        if not os.path.exists(temp_filename):
            raise Exception(f"File not saved: {temp_filename}")

        # 2. Try transcribing directly first (might work for some webm files)
        print("\n🎙️ Attempting direct transcription...")
        try:
            # USE NON-BLOCKING THREADPOOL for Whisper Processing
            result = await run_in_threadpool(whisper_model.transcribe, temp_filename, language="hi")
            user_text = result.get("text", "").strip()
            print(f"✅ Direct transcription successful: '{user_text}'")
        except Exception as direct_error:
            print(f"⚠️ Direct transcription failed: {direct_error}")
            print("\n🎵 Converting audio to WAV format...")
            
            # Convert to WAV
            wav_filename = temp_filename.replace(os.path.splitext(temp_filename)[1], ".wav")
            # NON BLOCKING conversion
            convert_success = await run_in_threadpool(convert_audio_to_wav, temp_filename, wav_filename)
            if not convert_success:
                raise Exception("Failed to convert audio format - ensure pydub and FFmpeg are installed")
            
            # Try transcribing the WAV file in NON-BLOCKING pool
            print("\n🎙️ Transcribing converted WAV...")
            result = await run_in_threadpool(whisper_model.transcribe, wav_filename, language="hi")
            user_text = result.get("text", "").strip()
            print(f"✅ Transcription from WAV successful: '{user_text}'")
        
        if not user_text:
            raise Exception("Whisper returned empty text - audio may be silent or too short")

        # 3. Analyze (Text -> AI Reply)
        print(f"\n🤖 Analyzing text: '{user_text}'")
        prompt = f"""
        You are 'Saathi', a caring Hindi-speaking companion.
        User said: "{user_text}"
        
        Tasks:
        1. Reply in warm Hindi (Devanagari). Short (2 sentences).
        2. Detect mood (Happy/Sad/Neutral/Distressed).
        3. Did they take medicine? (true/false/null).
        
        Return JSON ONLY:
        {{
            "reply": "...",
            "mood": "...",
            "medication_taken": null
        }}
        """
        
        if client is None:
            print("⚠️ Gemini client not available, using default response")
            ai_data = {"reply": "Namaste! Aap kaise hain?", "mood": "Neutral", "medication_taken": None}
        else:
            # We can also wrap Gemini API calls inside run_in_threadpool if it's synchronous
            response = await run_in_threadpool(client.models.generate_content, model="gemini-2.5-flash", contents=prompt)
            print(f"✅ Gemini response: {response.text[:100]}...")
            
            # Parse AI response
            try:
                # Strip potential markdown formatting that Gemini might output
                text = response.text.strip()
                if text.startswith("```json"):
                    text = text[7:]
                if text.endswith("```"):
                    text = text[:-3]
                text = text.strip()
                
                ai_data = json.loads(text)
                print(f"✅ AI response parsed: {ai_data}")
            except (json.JSONDecodeError, AttributeError) as e:
                print(f"⚠️ JSON parse error: {e}, using default")
                ai_data = {"reply": "Namaste! Aap kaise hain?", "mood": "Neutral", "medication_taken": None}

        # 4. Save to Database
        print(f"\n💾 Saving to database...")
        new_checkin = DailyCheckIn(
            elder_id=elder_id,
            transcript_hi=user_text,
            ai_reply=ai_data.get("reply"),
            mood=ai_data.get("mood", "Neutral"),
            medication_taken=ai_data.get("medication_taken"),
        )
        db.add(new_checkin)
        await db.commit()
        print(f"✅ Saved to database")

        # 5. Convert reply to speech using NON-BLOCKING TTs
        print(f"\n🔊 Converting to speech...")
        reply_text = ai_data.get("reply", "Namaste!")
        audio_base64 = await run_in_threadpool(text_to_speech, reply_text, language="hi")
        print(f"✅ Audio generated: {len(audio_base64) if audio_base64 else 0} chars")

        return {
            "reply_text": reply_text,
            "mood": ai_data.get("mood"),
            "audio": audio_base64,  # Base64 encoded MP3 audio
            "transcript": user_text,
            "status": "success"
        }

    except Exception as e:
        print(f"\n❌ ERROR in voicebot processing:")
        print(f"   Type: {type(e).__name__}")
        print(f"   Message: {str(e)}")
        print(f"   Traceback:")
        traceback.print_exc()
        
        # Provide helpful error message
        error_msg = str(e)
        if "pydub" in error_msg.lower() or "ffmpeg" in error_msg.lower():
            error_msg += "\n\n⚠️ Audio conversion failed. To fix:\n1. Install FFmpeg from https://ffmpeg.org/download.html\n2. Add FFmpeg to system PATH\n3. Try again"
        
        return {
            "reply_text": "Maaf kijiye, main sun nahi paya. Dobara koshish kijiye.",
            "mood": "Neutral",
            "status": "error",
            "error": error_msg
        }
        
    finally:
        # Cleanup temp files
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
            print(f"  🗑️ Removed {temp_filename}")
        
        if wav_filename and os.path.exists(wav_filename):
            os.remove(wav_filename)
            print(f"  🗑️ Removed {wav_filename}")