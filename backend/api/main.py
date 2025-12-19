from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()


# Add backend root to sys.path to allow imports from modules
backend_root = Path(__file__).parent.parent
sys.path.append(str(backend_root))

from api.routers import ocr, speech, math_solver, sketch, pdf_tools, auth, history

app = FastAPI(
    title="IntelliScan API",
    description="Backend API for Smart Handwritten Data Recognition",
    version="1.0.0"
)

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to IntelliScan API", "status": "running"}

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(history.router, prefix="/api/history", tags=["History"])
app.include_router(ocr.router, prefix="/api/ocr", tags=["OCR"])
app.include_router(speech.router, prefix="/api/speech", tags=["Speech"])
app.include_router(math_solver.router, prefix="/api/math", tags=["Math"])
app.include_router(sketch.router, prefix="/api/sketch", tags=["Sketch"])
app.include_router(pdf_tools.router, prefix="/api/pdf", tags=["PDF"])

@app.on_event("startup")
async def startup_event():
    print("Starting up... Preloading AI Models (This may take a moment)")
    
    # 1. Preload Speech Models
    try:
        print("  - Preloading Speech Toolkit...")
        from modules import speech_language
        toolkit = speech_language.LanguageToolkit()
        toolkit.preload_models()
    except Exception as e:
        print(f"  ! Error loading Speech models: {e}")

    # 2. Preload OCR Models
    try:
        print("  - Preloading OCR Engine...")
        from modules.ocr import get_ocr_reader
        get_ocr_reader()
    except Exception as e:
        print(f"  ! Error loading OCR models: {e}")

    # 3. Preload Math OCR
    try:
        print("  - Preloading Math Engine...")
        from api.routers.math_solver import math_module
        # The instantiation already happened on import, but this ensures it's referenced
    except Exception as e:
        print(f"  ! Error loading Math models: {e}")

    print("AI Models Ready.")
