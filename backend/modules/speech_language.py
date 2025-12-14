"""
Speech and Language Utilities
Handles Text-to-Speech, Speech-to-Text, and Offline Translation.
"""
import pyttsx3
import logging
import json
import os
from typing import Optional, Tuple
import threading
import io
import wave
import edge_tts
import asyncio
import contextlib

# Global locks/instances
_tts_engine = None
_tts_lock = threading.Lock()

# Translation
HAS_OFFLINE_TRANSLATION = False
HAS_ONLINE_TRANSLATION = False
TRANSLATION_ERROR = None

try:
    import argostranslate.package
    import argostranslate.translate
    HAS_OFFLINE_TRANSLATION = True
except ImportError as e:
    TRANSLATION_ERROR = str(e)

try:
    from deep_translator import GoogleTranslator
    HAS_ONLINE_TRANSLATION = True
except ImportError:
    pass

# Speech Recognition
HAS_VOSK = False
try:
    from vosk import Model, KaldiRecognizer, SetLogLevel
    SetLogLevel(-1) # Suppress Vosk logs
    HAS_VOSK = True
except ImportError:
    pass

class LanguageToolkit:
    def __init__(self):
        self.vosk_model = None
        self.vosk_path = "model-small-en"
        
    def preload_models(self):
        """Preload heavy models to avoid runtime delay"""
        logging.info("Preloading Speech & Language models...")
        
        # 1. Load Vosk Model
        if HAS_VOSK:
            if not os.path.exists(self.vosk_path):
                self._download_vosk_model()
            
            if os.path.exists(self.vosk_path):
                try:
                    logging.info(f"Loading Vosk model from {self.vosk_path}...")
                    self.vosk_model = Model(self.vosk_path)
                    logging.info("Vosk model loaded successfully.")
                except Exception as e:
                    logging.error(f"Failed to load Vosk model: {e}")
        
        # 2. Check Translation Models
        if HAS_OFFLINE_TRANSLATION:
            logging.info("Checking Offline Translation models...")
            try:
                # This ensures we have the index to check packages
                argostranslate.package.update_package_index()
                # We can also proceed to install default pairs here if desired
                self.install_translation_packages() 
            except Exception as e:
                logging.warning(f"Offline translation setup warning: {e}")

    def _download_vosk_model(self):
        try:
            import urllib.request
            import zipfile
            
            logging.info("Downloading Vosk model (approx 40MB)...")
            url = "https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip"
            zip_path = "model.zip"
            
            urllib.request.urlretrieve(url, zip_path)
            
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(".")
            
            extracted_name = "vosk-model-small-en-us-0.15"
            if os.path.exists(extracted_name):
                os.rename(extracted_name, self.vosk_path)
            
            if os.path.exists(zip_path):
                os.remove(zip_path)
                
        except Exception as e:
            logging.error(f"Failed to download Vosk model: {e}")

    def get_translation_status(self):
        if HAS_OFFLINE_TRANSLATION:
            return "Offline Mode (ArgosTranslate)"
        elif HAS_ONLINE_TRANSLATION:
            return "Online Mode (Google Translate Fallback)"
        else:
            return "Unavailable"


    async def get_neural_voices(self) -> list:
        """Fetch available neural voices from Edge TTS"""
        try:
            voices = await edge_tts.list_voices()
            # Filter for English, Hindi, Marathi or generally strictly high quality
            # For simplicity, we return all or a curated list.
            # Let's return a mapped list compatible with frontend
            formatted_voices = []
            for v in voices:
                formatted_voices.append({
                    'id': v['ShortName'],
                    'name': f"{v['FriendlyName']} ({v['Gender']})",
                    'lang': v['Locale']
                })
            return formatted_voices
        except Exception as e:
            logging.error(f"Error fetching neural voices: {e}")
            return []

    async def text_to_speech_neural(self, text: str, output_file: str = "output_audio.mp3", voice_id: str = "en-US-ChristopherNeural") -> str:
        """
        Convert text to speech using Edge TTS (Neural).
        """
        try:
            if output_file.endswith(".wav"):
                # Edge TTS outputs mp3 by default mostly, but we can save as mp3
                output_file = output_file.replace(".wav", ".mp3")
            
            communicate = edge_tts.Communicate(text, voice_id)
            await communicate.save(output_file)
            return output_file
        except Exception as e:
            logging.error(f"Neural TTS Error: {e}")
            return ""

    def get_voices(self) -> list:
        """
        DEPRECATED: Returns system voices (pyttsx3).
        Use get_neural_voices for better quality.
        """
        global _tts_engine, _tts_lock
        voices_list = []
        with _tts_lock:
            if _tts_engine is None:
                try:
                    _tts_engine = pyttsx3.init()
                except Exception:
                     pass
            
            if _tts_engine:
                try:
                    voices = _tts_engine.getProperty('voices')
                    for v in voices:
                        voices_list.append({'id': v.id, 'name': v.name})
                except Exception as e:
                    logging.error(f"Error fetching system voices: {e}")
        return voices_list

    def text_to_speech(self, text: str, output_file: str = "output_audio.mp3", voice_id: str = None) -> str:
        """
        Legacy Sync TTS (pyttsx3).
        """
        global _tts_engine, _tts_lock
        with _tts_lock:
            try:
                if _tts_engine is None:
                    _tts_engine = pyttsx3.init()
                
                if voice_id and "Neural" not in voice_id: # Only apply if not a neural ID
                    _tts_engine.setProperty('voice', voice_id)

                if output_file.endswith(".mp3"):
                    output_file = output_file.replace(".mp3", ".wav")
                
                _tts_engine.save_to_file(text, output_file)
                _tts_engine.runAndWait()
                return output_file
            except Exception as e:
                logging.error(f"Legacy TTS Error: {e}")
                return ""

    def install_translation_packages(self):
        """Installs EN-HI and EN-MR packages if missing"""
        if not HAS_OFFLINE_TRANSLATION:
            return "ArgosTranslate library missing. Unable to install offline models."
            
        try:
            available_packages = argostranslate.package.get_available_packages()
            to_install = []
            
            # We want EN->HI, HI->EN, EN->MR, MR->EN
            # Note: For efficient checking, define a set of installed codes
            installed_packages = argostranslate.package.get_installed_packages()
            installed_pairs = set((p.from_code, p.to_code) for p in installed_packages)

            pairs = [('en', 'hi'), ('hi', 'en'), ('en', 'mr'), ('mr', 'en')]
            
            count = 0
            for src, tgt in pairs:
                if (src, tgt) not in installed_pairs:
                    pkg = next(filter(lambda x: x.from_code == src and x.to_code == tgt, available_packages), None)
                    if pkg:
                        logging.info(f"Installing translation model: {src}->{tgt}...")
                        argostranslate.package.install_from_path(pkg.download())
                        count += 1
            
            if count > 0:
                return f"Installed {count} new translation models."
            return "All required translation models are present."
            
        except Exception as e:
            return f"Model install failed: {e}"

    def translate_text(self, text: str, from_code: str = 'en', to_code: str = 'hi') -> str:
        """Translation with Offline priority, Online fallback"""
        # 1. Try Offline
        if HAS_OFFLINE_TRANSLATION:
            try:
                # Check directly installed languages
                installed = argostranslate.package.get_installed_packages()
                has_pair = any(p.from_code == from_code and p.to_code == to_code for p in installed)
                
                if has_pair:
                    return argostranslate.translate.translate(text, from_code, to_code)
                else:
                    logging.info(f"Direct offline model {from_code}->{to_code} not found. Trying online/fallback.")
            except Exception as e:
                logging.warning(f"Offline translation failed: {e}")
        
        # 2. Try Online
        if HAS_ONLINE_TRANSLATION:
            try:
                return GoogleTranslator(source=from_code, target=to_code).translate(text)
            except Exception as e:
                 return f"Online Translation Error: {e}"
                 
        return "Error: No translation modules available. Please check internet or install argostranslate/deep-translator."

    def transcribe_audio(self, audio_bytes: bytes) -> str:
        """Transcribe audio using Vosk (Offline)"""
        if not HAS_VOSK:
            return "Speech recognition module not available."
            
        # Ensure model is ready
        if self.vosk_model is None:
            logging.info("Vosk model not preloaded. Attempting to load now...")
            if not os.path.exists(self.vosk_path):
                self._download_vosk_model()
            
            if os.path.exists(self.vosk_path):
                try:
                    self.vosk_model = Model(self.vosk_path)
                except Exception as e:
                    return f"Failed to load speech model: {e}"
            else:
                return "Speech model missing and download failed."

        if not audio_bytes:
            return "No audio data received."

        try:
             # Direct FFmpeg conversion
            try:
                import subprocess
                import imageio_ffmpeg
                
                ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
                cmd = [
                    ffmpeg_exe, 
                    "-i", "pipe:0", 
                    "-f", "s16le", 
                    "-ac", "1", 
                    "-ar", "16000", 
                    "-v", "quiet",
                    "pipe:1"
                ]
                
                process = subprocess.run(
                    cmd, 
                    input=audio_bytes, 
                    stdout=subprocess.PIPE, 
                    stderr=subprocess.PIPE,
                    check=True
                )
                
                processed_audio_bytes = process.stdout
                
            except Exception as e:
                logging.error(f"Audio processing error: {e}")
                return f"Audio conversion error. Please verify input format."

            # Use cached model
            rec = KaldiRecognizer(self.vosk_model, 16000)
            rec.AcceptWaveform(processed_audio_bytes)
            res = json.loads(rec.FinalResult())
            
            text = res.get('text', '')
            if not text: 
                    return "Transcription complete but no text recognized."
            return text

        except Exception as e:
            logging.error(f"STT Error: {e}")
            return f"Transcription Failed: {e}"
