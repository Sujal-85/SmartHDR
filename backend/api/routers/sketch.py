from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
import uuid
from pathlib import Path
from modules.sketch import SketchModule
from fastapi.responses import FileResponse

router = APIRouter()
sketch_module = SketchModule()

@router.post("/vectorize")
async def vectorize_sketch(file: UploadFile = File(...)):
    temp_input = f"temp_{uuid.uuid4()}.png"
    temp_output = f"vector_{uuid.uuid4()}.svg"
    
    try:
        # Read file to bytes
        content = await file.read()
        
        # Open as PIL Image
        from PIL import Image
        import io
        image = Image.open(io.BytesIO(content))
        
        # Convert to SVG (returns string)
        # Note: image_to_svg in module takes (image, output_path=None)
        svg_content = sketch_module.image_to_svg(image)
        
        # Return direct SVG content
        from fastapi import Response
        return Response(content=svg_content, media_type="image/svg+xml")
            
    except Exception as e:
        print(f"Sketch Error: {e}") # Debug log
        raise HTTPException(status_code=500, detail=f"Vectorization failed: {str(e)}")
