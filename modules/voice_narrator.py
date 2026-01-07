"""
Voice narration module with multi-provider TTS support.
Supports Google TTS (free), ElevenLabs (free tier + paid).
"""

import hashlib
import requests
from pathlib import Path
from typing import Optional

from config.settings import settings
from modules.budget_controller import budget

class VoiceNarrator:
    """Generates voice narration using TTS providers."""
    
    def __init__(self):
        self.cache_dir = settings.DATA_DIR / "audio_cache"
        self.cache_dir.mkdir(exist_ok=True)
    
    def _get_cache_key(self, text: str) -> str:
        """Generate cache key for text."""
        return hashlib.md5(text.encode()).hexdigest()
    
    def _load_from_cache(self, cache_key: str) -> Optional[Path]:
        """Load audio from cache if exists."""
        if not settings.CACHE_AGGRESSIVE:
            return None
        
        cache_file = self.cache_dir / f"{cache_key}.mp3"
        if cache_file.exists():
            print("📦 Áudio encontrado no cache")
            return cache_file
        return None
    
    def generate(self, script: dict) -> Path:
        """
        Generate narration audio from script.
        
        Args:
            script: Script dictionary with hook, body, outro
        
        Returns:
            Path to generated audio file
        """
        # Combine script parts
        full_text = f"{script['hook']} {script['body']} {script['outro']}"
        
        # Check cache
        cache_key = self._get_cache_key(full_text)
        cached = self._load_from_cache(cache_key)
        if cached:
            return cached
        
        # Generate using provider priority
        print(f"🔍 DEBUG: TTS_PROVIDER list = {settings.TTS_PROVIDER}")
        print(f"🔍 DEBUG: ELEVENLABS_API_KEY = {'SET' if settings.ELEVENLABS_API_KEY else 'NOT SET'}")
        print(f"🔍 DEBUG: GOOGLE_TTS_API_KEY = {'SET' if settings.GOOGLE_TTS_API_KEY else 'NOT SET'}")
        
        for provider in settings.TTS_PROVIDER:
            try:
                print(f"🔄 Tentando provedor: {provider}")
                if provider == "google" and settings.GOOGLE_TTS_API_KEY:
                    audio_path = self._generate_with_google_tts(full_text, cache_key)
                elif provider == "elevenlabs_free" and settings.ELEVENLABS_API_KEY:
                    audio_path = self._generate_with_elevenlabs(full_text, cache_key, free_tier=True)
                elif provider == "elevenlabs_paid" and settings.ELEVENLABS_API_KEY:
                    audio_path = self._generate_with_elevenlabs(full_text, cache_key, free_tier=False)
                else:
                    print(f"⏭️  {provider} não configurado ou não atende aos requisitos, pulando...")
                    continue
                
                return audio_path
                
            except Exception as e:
                print(f"⚠️ Erro com {provider}: {e}")
                import traceback
                traceback.print_exc()
                continue
        
        # Final fallback: try gTTS (no API key needed)
        print("\n⚠️  Nenhum provedor TTS pago disponível")
        print("🔄 Tentando fallback: gTTS (grátis, sem API key)...")
        
        try:
            from modules.gtts_narrator import gtts_narrator
            if gtts_narrator:
                audio_path = self._generate_with_gtts(full_text, cache_key)
                return audio_path
        except Exception as e:
            print(f"⚠️ gTTS também falhou: {e}")
        
        raise Exception("❌ Nenhum provedor TTS disponível (configure ElevenLabs, Google TTS, ou instale gTTS)")
    
    def _generate_with_google_tts(self, text: str, cache_key: str) -> Path:
        """Generate audio using Google Cloud TTS."""
        print("🔊 Gerando narração com Google TTS...")
        
        try:
            from google.cloud import texttospeech
            
            client = texttospeech.TextToSpeechClient()
            
            # Configure voice
            synthesis_input = texttospeech.SynthesisInput(text=text)
            voice = texttospeech.VoiceSelectionParams(
                language_code="pt-BR",
                name="pt-BR-Wavenet-B",  # Male voice
                ssml_gender=texttospeech.SsmlVoiceGender.MALE
            )
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                speaking_rate=1.0,
                pitch=0.0
            )
            
            response = client.synthesize_speech(
                input=synthesis_input,
                voice=voice,
                audio_config=audio_config
            )
            
            # Save audio
            output_path = self.cache_dir / f"{cache_key}.mp3"
            with open(output_path, "wb") as out:
                out.write(response.audio_content)
            
            # Track usage
            budget.track_google_tts(len(text))
            
            return output_path
            
        except ImportError:
            raise Exception("google-cloud-texttospeech não instalado. Execute: pip install google-cloud-texttospeech")
    
    def _generate_with_elevenlabs(self, text: str, cache_key: str, free_tier: bool = True) -> Path:
        """Generate audio using ElevenLabs."""
        print(f"🔊 Gerando narração com ElevenLabs ({'free' if free_tier else 'paid'})...")
        
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{settings.ELEVENLABS_VOICE_ID}"
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": settings.ELEVENLABS_API_KEY
        }
        
        data = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75,
                "style": 0.0,
                "use_speaker_boost": True
            }
        }
        
        response = requests.post(url, json=data, headers=headers)
        
        if response.status_code != 200:
            raise Exception(f"ElevenLabs error: {response.text}")
        
        # Save audio
        output_path = self.cache_dir / f"{cache_key}.mp3"
        with open(output_path, "wb") as f:
            f.write(response.content)
        
        #Track usage
        budget.track_elevenlabs(len(text), is_free_tier=free_tier)
        
        return output_path
    
    def _generate_with_gtts(self, text: str, cache_key: str) -> Path:
        """Generate audio using gTTS (fallback, no API key needed)."""
        print("🔊 Gerando narração com gTTS (grátis, sem API)...")
        
        try:
            from gtts import gTTS
            
            output_path = self.cache_dir / f"gtts_{cache_key}.mp3"
            
            tts = gTTS(text=text, lang='pt', slow=False)
            tts.save(str(output_path))
            
            print(f"✅ Narração gerada com gTTS")
            return output_path
            
        except ImportError:
            raise Exception("gTTS não instalado. Execute: pip install gTTS")

# Global instance
voice_narrator = VoiceNarrator()
