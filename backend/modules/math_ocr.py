"""
Math OCR Module for Smart Handwritten Data Recognition
Handles recognition of mathematical expressions and conversion to LaTeX
"""
import cv2
import numpy as np
from PIL import Image
import logging
from typing import Union, Optional

# Try to import pix2tex if available
try:
    from pix2tex.cli import LatexOCR
    HAS_PIX2TEX = True
    IMPORT_ERROR = None
except ImportError as e:
    HAS_PIX2TEX = False
    IMPORT_ERROR = str(e)
    logging.warning(f"pix2tex not found: {e}")
except Exception as e:
    HAS_PIX2TEX = False
    IMPORT_ERROR = str(e)
    logging.error(f"pix2tex import failed: {e}")

class MathOCRModule:
    """Handles Math OCR operations"""
    
    def __init__(self):
        self.model = None
        self.init_error = None
        
        if HAS_PIX2TEX:
            try:
                # Suppress arguments to avoid Streamlit conflicts if any
                self.model = LatexOCR()
            except Exception as e:
                logging.error(f"Failed to initialize LatexOCR: {str(e)}")
                self.init_error = str(e)
                self.model = None
    
    def perform_math_ocr(self, image: Union[Image.Image, np.ndarray]) -> str:
        """
        Convert image containing math formula to LaTeX
        
        Args:
            image: PIL Image or numpy array
            
        Returns:
            LaTeX string
        """
        if isinstance(image, np.ndarray):
            image = Image.fromarray(image)
            
        if self.model:
            try:
                return self.model(image)
            except Exception as e:
                logging.error(f"Math OCR failed: {str(e)}")
                return r"\text{Error during recognition}"
        else:
            if IMPORT_ERROR:
                return f"\\text{{Import Error: {IMPORT_ERROR}}}"
            elif self.init_error:
                return f"\\text{{Init Error: {self.init_error}}}"
            else:
                return r"\text{Math OCR model not installed. Run: pip install pix2tex[gui]}"

    def render_latex(self, latex_code: str):
        """
        Helper to render latex in Streamlit
        """
        import streamlit as st
        st.latex(latex_code)