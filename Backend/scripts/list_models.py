from dotenv import load_dotenv
import os
from google import genai

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

try:
    client = genai.Client(api_key=api_key)
    print("Available Models:")
    for m in client.models.list():
        # Only print models that usually generate content
        if "generateContent" in getattr(m, "supported_generation_methods", []) or "generateContent" in getattr(m, "supported_actions", []):
             print(f" - {m.name}")
        elif "gemini" in m.name.lower():
             print(f" - {m.name} (gemini family)")
except Exception as e:
    print("Error:", e)
