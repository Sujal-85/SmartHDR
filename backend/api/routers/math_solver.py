from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import io
from modules.math_ocr import MathOCRModule

router = APIRouter()
math_module = MathOCRModule()

from modules.gemini_client import GeminiClient
gemini_client = GeminiClient()

@router.post("/solve")
async def solve_math(file: UploadFile = File(...)):
    try:
        content = await file.read()
        image = Image.open(io.BytesIO(content))
        latex_result = math_module.perform_math_ocr(image)
        
        # Get Step-by-Step solution
        solution = gemini_client.solve_math_problem(latex_result)
        
        return {
            "latex": latex_result,
            "solution": solution
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
