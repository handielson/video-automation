"""
Script generation module with multi-provider support for cost optimization.
Supports Gemini (free), OpenRouter (cheap), and OpenAI (premium).
"""

import json
import hashlib
import requests
from pathlib import Path
from typing import Dict, Optional

from config.settings import settings
from config.prompts import SCRIPT_GENERATION_PROMPT
from modules.budget_controller import budget
from modules.humanizer import humanizer

class ScriptGenerator:
    """Generates video scripts using AI with cost optimization."""
    
    def __init__(self):
        self.cache_dir = settings.DATA_DIR / "script_cache"
        self.cache_dir.mkdir(exist_ok=True)
    
    def _get_cache_key(self, topic: str, duration: int) -> str:
        """Generate cache key for a topic."""
        content = f"{topic}_{duration}"
        return hashlib.md5(content.encode()).hexdigest()
    
    def _load_from_cache(self, cache_key: str) -> Optional[Dict]:
        """Load script from cache if exists."""
        if not settings.CACHE_AGGRESSIVE:
            return None
        
        cache_file = self.cache_dir / f"{cache_key}.json"
        if cache_file.exists():
            print("📦 Script encontrado no cache")
            with open(cache_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return None
    
    def _save_to_cache(self, cache_key: str, script: Dict):
        """Save script to cache."""
        cache_file = self.cache_dir / f"{cache_key}.json"
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(script, f, indent=2, ensure_ascii=False)
    
    def generate(self, topic: str, duration: Optional[int] = None) -> Dict:
        """
        Generate video script.
        
        Args:
            topic: Video topic/curiosity
            duration: Video duration in seconds (randomized if None)
        
        Returns:
            Dictionary with script components
        """
        # Get randomized duration if not specified
        if duration is None:
            duration = humanizer.get_random_duration()
        
        # Check cache
        cache_key = self._get_cache_key(topic, duration)
        cached = self._load_from_cache(cache_key)
        if cached:
            return cached
        
        # Generate new script using provider priority
        for provider in settings.SCRIPT_PROVIDER:
            try:
                print(f"🔄 Tentando provedor: {provider}")
                if provider == "gemini" and settings.GEMINI_API_KEY:
                    script = self._generate_with_gemini(topic, duration)
                elif provider == "openrouter" and settings.OPENROUTER_API_KEY:
                    script = self._generate_with_openrouter(topic, duration)
                elif provider == "openai" and settings.OPENAI_API_KEY:
                    script = self._generate_with_openai(topic, duration)
                else:
                    print(f"⏭️  {provider} não configurado, pulando...")
                    continue
                
                # Save to cache
                self._save_to_cache(cache_key, script)
                return script
                
            except Exception as e:
                print(f"⚠️ Erro com {provider}: {str(e)}")
                import traceback
                traceback.print_exc()
                continue
        
        raise Exception("❌ Nenhum provedor de API disponível para gerar roteiro")
    
    def _generate_with_gemini(self, topic: str, duration: int) -> Dict:
        """Generate script using Google Gemini (FREE)."""
        print("🤖 Gerando roteiro com Gemini (grátis)...")
        
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            
            # Use gemini-2.5-flash (available model)
            model = genai.GenerativeModel('gemini-2.5-flash')
            
            prompt = SCRIPT_GENERATION_PROMPT.format(
                duration=duration,
                topic=topic
            )
            
            response = model.generate_content(prompt)
            
            # Track usage (free tier)
            budget.track_gemini()
            
            # Parse JSON response
            script = self._parse_response(response.text)
            return script
            
        except ImportError:
            raise Exception("google-generativeai não instalado. Execute: pip install google-generativeai")
    
    def _generate_with_openai(self, topic: str, duration: int) -> Dict:
        """Generate script using OpenAI GPT-4o."""
        print("🤖 Gerando roteiro com GPT-4o...")
        
        from openai import OpenAI
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        
        prompt = SCRIPT_GENERATION_PROMPT.format(
            duration=duration,
            topic=topic
        )
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Cheaper alternative
            messages=[
                {"role": "system", "content": "Você é um roteirista especializado em vídeos virais."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            response_format={"type": "json_object"}
        )
        
        # Track tokens
        tokens_used = response.usage.total_tokens
        budget.track_openai(tokens_used)
        
        script = json.loads(response.choices[0].message.content)
        return script
    
    def _generate_with_openrouter(self, topic: str, duration: int) -> Dict:
        """Generate script using OpenRouter (cheap models)."""
        print("🤖 Gerando roteiro com OpenRouter (econômico)...")
        
        prompt = SCRIPT_GENERATION_PROMPT.format(
            duration=duration,
            topic=topic
        )
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "google/gemini-flash-1.5",  # Cheap model
                "messages": [
                    {"role": "user", "content": prompt}
                ]
            }
        )
        
        if response.status_code != 200:
            raise Exception(f"OpenRouter error: {response.text}")
        
        data = response.json()
        script = self._parse_response(data["choices"][0]["message"]["content"])
        
        return script
    
    def _parse_response(self, response_text: str) -> Dict:
        """Parse AI response into structured script."""
        # Try to extract JSON from response
        try:
            # Remove markdown code blocks if present
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]
            
            script = json.loads(response_text.strip())
            
            # Validate required fields
            required = ["hook", "body", "outro"]
            if not all(field in script for field in required):
                raise ValueError("Script incompleto")
            
            # Add visual keywords if missing
            if "visual_keywords" not in script:
                script["visual_keywords"] = ["curiosidade", "fato", "interessante"]
            
            return script
            
        except Exception as e:
            print(f"⚠️ Erro ao parsear resposta: {e}")
            # Return default structure
            return {
                "hook": "Você sabia disso?",
                "body": "Esta é uma curiosidade incrível que poucas pessoas conhecem.",
                "outro": "E você, conhecia esse fato?",
                "visual_keywords": ["curiosidade"],
                "duration_estimate": 50
            }

# Global instance
script_generator = ScriptGenerator()
