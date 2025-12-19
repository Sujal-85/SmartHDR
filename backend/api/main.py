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
# In production, we should set FRONTEND_URL environment variable
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
origins = [
    frontend_url,
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:3000",
]

# Add Render default subdomains if applicable
render_url = os.getenv("RENDER_EXTERNAL_URL")
if render_url:
    origins.append(render_url)


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
    # We disable preloading on startup to save memory on limited environments (like Render Free Tier)
    # Models will be lazily loaded when first requested.
    print("Startup complete. Models will be loaded lazily on first request.")

