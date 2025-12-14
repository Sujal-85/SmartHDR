from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
import io
import shutil
import os

from modules.ocr import OCRModule
# from modules.llm_correction import LLMCorrector # Optional

router = APIRouter()
ocr_module = OCRModule()

from modules.gemini_client import GeminiClient
gemini_client = GeminiClient()

@router.post("/extract")
async def extract_text(
    file: UploadFile = File(...), 
    mode: str = Form("standard"),
    use_ai_correction: bool = Form(True) # Default to true as user requested "modify output"
):
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Use existing singleton
        
        text = ""
        if mode == "high_accuracy":
            text = ocr_module.perform_high_accuracy_ocr(image)
        else:
            text = ocr_module.perform_ocr(image)
            
        if use_ai_correction:
            text = gemini_client.correct_ocr_text(text)
            
        return {"text": text, "mode": mode}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
