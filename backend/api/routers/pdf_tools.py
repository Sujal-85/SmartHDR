import shutil
import os
import zipfile
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from typing import List
from modules.pdf_tools import PDFTools
from modules.gemini_client import GeminiClient
import tempfile
import json

router = APIRouter()
pdf_tools = PDFTools()
gemini_client = GeminiClient()

def cleanup_file(path: str):
    try:
        if os.path.exists(path):
            os.remove(path)
    except Exception:
        pass

@router.post("/merge")
async def merge_pdfs(background_tasks: BackgroundTasks, files: List[UploadFile] = File(...)):
    temp_dir = tempfile.mkdtemp()
    input_paths = []
    
    try:
        # Save uploaded files
        for file in files:
            path = os.path.join(temp_dir, file.filename)
            with open(path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            input_paths.append(path)
            
        output_path = os.path.join(temp_dir, "merged_output.pdf")
        pdf_tools.merge_pdfs(input_paths, output_path)
        
        return FileResponse(
            output_path, 
            media_type="application/pdf", 
            filename="merged.pdf",
            background=background_tasks.add_task(shutil.rmtree, temp_dir)
        )
    except Exception as e:
        shutil.rmtree(temp_dir)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/compress")
async def compress_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    temp_dir = tempfile.mkdtemp()
    try:
        input_path = os.path.join(temp_dir, file.filename)
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        output_path = os.path.join(temp_dir, "compressed_output.pdf")
        pdf_tools.compress_pdf(input_path, output_path)
        
        return FileResponse(
            output_path, 
            media_type="application/pdf", 
            filename=f"compressed_{file.filename}",
            background=background_tasks.add_task(shutil.rmtree, temp_dir)
        )
    except Exception as e:
        shutil.rmtree(temp_dir)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/image-to-pdf")
async def image_to_pdf(background_tasks: BackgroundTasks, files: List[UploadFile] = File(...)):
    temp_dir = tempfile.mkdtemp()
    input_paths = []
    try:
        for file in files:
            path = os.path.join(temp_dir, file.filename)
            with open(path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            input_paths.append(path)
            
        output_path = os.path.join(temp_dir, "converted_images.pdf")
        pdf_tools.images_to_pdf(input_paths, output_path)
        
        return FileResponse(
            output_path, 
            media_type="application/pdf", 
            filename="images_converted.pdf",
            background=background_tasks.add_task(shutil.rmtree, temp_dir)
        )
    except Exception as e:
        shutil.rmtree(temp_dir)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/split")
async def split_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    temp_dir = tempfile.mkdtemp()
    try:
        input_path = os.path.join(temp_dir, file.filename)
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        split_dir = os.path.join(temp_dir, "split_pages")
        os.makedirs(split_dir)
        
        # Split
        pdf_tools.split_pdf(input_path, split_dir)
        
        # Zip the result
        zip_path = os.path.join(temp_dir, "split_files.zip")
        with zipfile.ZipFile(zip_path, 'w') as zipf:
            for root, dirs, files in os.walk(split_dir):
                for file in files:
                    zipf.write(os.path.join(root, file), file)
        
        return FileResponse(
            zip_path,
            media_type="application/zip",
            filename="split_pages.zip",
            background=background_tasks.add_task(shutil.rmtree, temp_dir)
        )
    except Exception as e:
        shutil.rmtree(temp_dir)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/protect")
async def protect_pdf(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...), 
    password: str = Form(...)
):
    temp_dir = tempfile.mkdtemp()
    try:
        input_path = os.path.join(temp_dir, file.filename)
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        output_path = os.path.join(temp_dir, f"protected_{file.filename}")
        pdf_tools.protect_pdf(input_path, password, output_path)
        
        return FileResponse(
            output_path, 
            media_type="application/pdf", 
            filename=f"protected_{file.filename}",
            background=background_tasks.add_task(shutil.rmtree, temp_dir)
        )
    except Exception as e:
        shutil.rmtree(temp_dir)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/redact")
async def redact_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    temp_dir = tempfile.mkdtemp()
    try:
        input_path = os.path.join(temp_dir, file.filename)
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 1. Extract text
        text_content = pdf_tools.extract_text(input_path)
        
        # 2. Identify sensitive info with Gemini
        # It returns a JSON string like '["John", "email@example.com"]'
        sensitive_json = gemini_client.identify_sensitive_data(text_content)
        
        # Clean up JSON string if it has markdown code blocks
        if "```json" in sensitive_json:
            sensitive_json = sensitive_json.split("```json")[1].split("```")[0].strip()
        elif "```" in sensitive_json:
            sensitive_json = sensitive_json.split("```")[1].split("```")[0].strip()
            
        try:
            redactions = json.loads(sensitive_json)
        except:
            redactions = [] # Fallback
            print(f"Failed to parse redaction JSON: {sensitive_json}")
            
        output_path = os.path.join(temp_dir, f"redacted_{file.filename}")
        
        # 3. Apply redactions
        pdf_tools.redact_text(input_path, redactions, output_path)
        
        # Return file (UI can display success message)
        # We lose the 'counts' metadata here unless we send it as a header or multipart response. 
        # For now, just returning the file is easiest for "download".
        # To show counts, we might need a custom header.
        
        return FileResponse(
            output_path, 
            media_type="application/pdf", 
            filename=f"redacted_{file.filename}",
            headers={"X-Redaction-Count": str(len(redactions))},
            background=background_tasks.add_task(shutil.rmtree, temp_dir)
        )
    except Exception as e:
        shutil.rmtree(temp_dir)
        raise HTTPException(status_code=500, detail=str(e))
