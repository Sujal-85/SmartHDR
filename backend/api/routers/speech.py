from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
import io
import os
from modules.speech_language import LanguageToolkit

router = APIRouter()
toolkit = LanguageToolkit()

from modules.gemini_client import GeminiClient
gemini_client = GeminiClient()

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        content = await file.read()
        text = toolkit.transcribe_audio(content)
        
        # Auto-refine if it's a decent length
        if len(text) > 5:
             text = gemini_client.refine_speech_text(text)
             
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/voices")
async def get_voices():
    # Prioritize Neural Voices
    voices = await toolkit.get_neural_voices()
    if not voices:
       # Fallback to system voices
       voices = toolkit.get_voices()
    return {"voices": voices}

class TTSRequest(BaseModel):
    text: str
    voice_id: str = "en-US-ChristopherNeural" # Default valid neural voice

@router.post("/tts")
async def text_to_speech(request: TTSRequest):
    try:
        # Use Neural TTS
        output_file = await toolkit.text_to_speech_neural(request.text, voice_id=request.voice_id)
        
        if not output_file:
             # Fallback to legacy
             output_file = toolkit.text_to_speech(request.text, voice_id=request.voice_id)

        if output_file and os.path.exists(output_file):
            # Edge TTS is mp3, fallback is wav
            media_type = "audio/mpeg" if output_file.endswith(".mp3") else "audio/wav"
            filename = "speech.mp3" if output_file.endswith(".mp3") else "speech.wav"
            return FileResponse(output_file, media_type=media_type, filename=filename)
            
        return {"error": "TTS failed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class TranslateRequest(BaseModel):
    text: str
    target_lang: str = "hi"

@router.post("/translate")
def translate_text(request: TranslateRequest):
    try:
        # Default source is auto/en
        translated = toolkit.translate_text(request.text, to_code=request.target_lang)
        return {"translated_text": translated}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
