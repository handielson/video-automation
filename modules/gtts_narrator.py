"""
gTTS-based voice narrator as fallback for when ElevenLabs/Google Cloud isn't available.
100% free, no API key needed, works offline.
"""

from pathlib import Path
import hashlib
from typing import Dict

try:
    from gtts import gTTS
    GTTS_AVAILABLE = True
except ImportError:
    GTTS_AVAILABLE = False

from config.settings import settings

class GTTSNarrator:
    """Simple TTS using gTTS (Google Text-to-Speech) - no API key needed."""
    
    def __init__(self):
        if not GTTS_AVAILABLE:
            raise ImportError("gTTS não instalado. Execute: pip install gTTS")
        
        self.cache_dir = settings.DATA_DIR / "audio_cache"
        self.cache_dir.mkdir(exist_ok=True)
    
    def generate(self, script: Dict) -> Path:
        """Generate narration using gTTS."""
        full_text = f"{script['hook']} {script['body']} {script['outro']}"
        
        # Check cache
        cache_key = hashlib.md5(full_text.encode()).hexdigest()
        cache_file = self.cache_dir / f"gtts_{cache_key}.mp3"
        
        if cache_file.exists():
            print("📦 Áudio encontrado no cache (gTTS)")
            return cache_file
        
        print("🔊 Gerando narração com gTTS (grátis, sem API key)...")
        
        try:
            # Generate audio
            tts = gTTS(text=full_text, lang='pt', slow=False)
            tts.save(str(cache_file))
            
            print(f"✅ Narração gerada: {cache_file.name}")
            return cache_file
            
        except Exception as e:
            raise Exception(f"Erro ao gerar narração com gTTS: {e}")

# Global instance
gtts_narrator = GTTSNarrator() if GTTS_AVAILABLE else None
