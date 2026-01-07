"""
Metadata optimizer for generating SEO-optimized titles, descriptions, and hashtags.
"""

import json
from typing import Dict
from config.settings import settings
from config.prompts import METADATA_OPTIMIZATION_PROMPT

class MetadataOptimizer:
    """Generates optimized metadata for videos."""
    
    def generate_metadata(self, script: Dict) -> Dict:
        """
        Generate optimized metadata from script.
        
        Args:
            script: Script dictionary
        
        Returns:
            Dictionary with title, description, hashtags, tags
        """
        print("📝 Gerando metadados otimizados...")
        
        # Combine script for context
        full_script = f"{script['hook']} {script['body']} {script['outro']}"
        
        try:
            if settings.GEMINI_API_KEY:
                metadata = self._generate_with_gemini(full_script)
            elif settings.OPENAI_API_KEY:
                metadata = self._generate_with_openai(full_script)
            else:
                metadata = self._generate_fallback(script)
            
            print(f"✅ Metadados gerados:")
            print(f"   Título: {metadata['title']}")
            print(f"   Hashtags: {', '.join(metadata['hashtags'][:3])}...")
            
            return metadata
            
        except Exception as e:
            print(f"⚠️  Erro ao gerar metadados: {e}")
            return self._generate_fallback(script)
    
    def _generate_with_gemini(self, script: str) -> Dict:
        """Generate metadata using Gemini."""
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = METADATA_OPTIMIZATION_PROMPT.format(script=script)
        response = model.generate_content(prompt)
        
        # Parse response
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        
        return json.loads(text.strip())
    
    def _generate_with_openai(self, script: str) -> Dict:
        """Generate metadata using OpenAI."""
        from openai import OpenAI
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        
        prompt = METADATA_OPTIMIZATION_PROMPT.format(script=script)
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Você é um especialista em SEO para YouTube e TikTok."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)
    
    def _generate_fallback(self, script: Dict) -> Dict:
        """Generate basic metadata without AI."""
        # Extract first few words for title
        hook = script.get('hook', 'Curiosidade Incrível')
        title_words = hook.split()[:8]
        title = " ".join(title_words)
        
        # Add emoji
        emojis = ["🤯", "😱", "🔥", "✨", "💡", "🎯"]
        import random
        title = f"{random.choice(emojis)} {title}"
        
        # Basic description
        description = f"{hook}\n\n{script.get('outro', 'Incrível, né?')}\n\n#shorts #curiosidades"
        
        # Basic hashtags
        hashtags = [
            "#shorts",
            "#curiosidades",
            "#fatos",
            "#voceabia",
            "#interessante",
            "#ciencia",
            "#conhecimento",
            "#viral"
        ]
        
        # Basic tags
        tags = [
            "curiosidades",
            "fatos",
            "você sabia",
            "shorts",
            "viral"
        ]
        
        return {
            "title": title,
            "description": description,
            "hashtags": hashtags,
            "tags": tags
        }

# Global instance
metadata_optimizer = MetadataOptimizer()
