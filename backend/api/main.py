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

from api.routers import ocr, speech, math_solver, sketch, pdf_tools

app = FastAPI(
    title="IntelliScan API",
    description="Backend API for Smart Handwritten Data Recognition",
    version="1.0.0"
)

# CORS Configuration
origins = [
    "http://localhost:5173",  # Vite default
    "http://localhost:3000",  # React default
    "http://localhost:8080",  # Current Vite port
    "http://127.0.0.1:8080",  # Explicit IP
    "*"                       # Allow all for dev
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
app.include_router(ocr.router, prefix="/api/ocr", tags=["OCR"])
app.include_router(speech.router, prefix="/api/speech", tags=["Speech"])
app.include_router(math_solver.router, prefix="/api/math", tags=["Math"])
app.include_router(sketch.router, prefix="/api/sketch", tags=["Sketch"])
app.include_router(pdf_tools.router, prefix="/api/pdf", tags=["PDF"])

# @app.on_event("startup")
# async def startup_event():
#     print("Starting up... Preloading AI Models (This may take a moment)")
#     
#     # 1. Preload Speech Models
#     try:
#         print("  - Preloading Speech Toolkit...")
#         speech.toolkit.preload_models()
#     except Exception as e:
#         print(f"  ! Error loading Speech models: {e}")
# 
#     # 2. Preload OCR Models
#     try:
#         print("  - Preloading OCR Engine...")
#         from modules.ocr import preload_models as preload_ocr
#         preload_ocr()
#     except Exception as e:
#         print(f"  ! Error loading OCR models: {e}")
# 
#     print("AI Models Ready.")
