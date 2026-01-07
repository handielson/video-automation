"""
Topic generator module for automatic topic ideation.
Sources topics from database, GPT, and Reddit.
"""

import json
import sqlite3
from pathlib import Path
from typing import List, Dict
import random

from config.settings import settings
from config.prompts import TOPIC_GENERATION_PROMPT

class TopicGenerator:
    """Generates and manages video topics."""
    
    def __init__(self):
        self.db_path = settings.DATA_DIR / "topics.db"
        self._init_database()
    
    def _init_database(self):
        """Initialize topics database."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS topics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                category TEXT,
                hook_suggestion TEXT,
                used BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                used_at TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def get_next_topic(self) -> Dict:
        """Get next unused topic."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, title, category, hook_suggestion
            FROM topics
            WHERE used = 0
            ORDER BY RANDOM()
            LIMIT 1
        ''')
        
        row = cursor.fetchone()
        
        if row:
            topic_id, title, category, hook = row
            
            # Mark as used
            cursor.execute('''
                UPDATE topics
                SET used = 1, used_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (topic_id,))
            
            conn.commit()
            conn.close()
            
            return {
                "id": topic_id,
                "title": title,
                "category": category,
                "hook_suggestion": hook
            }
        
        conn.close()
        
        # No topics available, generate new ones
        print("📝 Nenhum tópico disponível, gerando novos...")
        self.generate_topics_with_ai(count=10)
        
        return self.get_next_topic()
    
    def generate_topics_with_ai(self, count: int = 10):
        """Generate new topics using AI."""
        print(f"🤖 Gerando {count} novos tópicos com IA...")
        
        try:
            if settings.GEMINI_API_KEY:
                topics = self._generate_with_gemini(count)
            elif settings.OPENAI_API_KEY:
                topics = self._generate_with_openai(count)
            else:
                print("⚠️  Nenhuma API configurada para geração de tópicos")
                topics = self._get_fallback_topics(count)
            
            # Save to database
            self.add_topics(topics)
            
            print(f"✅ {len(topics)} tópicos adicionados ao banco")
            
        except Exception as e:
            print(f"⚠️  Erro ao gerar tópicos: {e}")
            topics = self._get_fallback_topics(count)
            self.add_topics(topics)
    
    def _generate_with_gemini(self, count: int) -> List[Dict]:
        """Generate topics using Gemini."""
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = TOPIC_GENERATION_PROMPT.format(count=count)
        response = model.generate_content(prompt)
        
        # Parse JSON response
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        
        data = json.loads(text.strip())
        return data.get("topics", [])
    
    def _generate_with_openai(self, count: int) -> List[Dict]:
        """Generate topics using OpenAI."""
        from openai import OpenAI
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        
        prompt = TOPIC_GENERATION_PROMPT.format(count=count)
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Você é um especialista em conteúdo viral."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        data = json.loads(response.choices[0].message.content)
        return data.get("topics", [])
    
    def _get_fallback_topics(self, count: int) -> List[Dict]:
        """Get fallback topics when AI is not available."""
        fallback = [
            {"title": "Por que o céu é azul", "category": "Ciência", "hook_suggestion": "Você sabe por que o céu muda de cor?"},
            {"title": "Como os gatos sempre caem de pé", "category": "Natureza", "hook_suggestion": "Esse truque dos gatos vai te surpreender"},
            {"title": "O mistério do Triângulo das Bermudas", "category": "Mistério", "hook_suggestion": "A verdade sobre o Triângulo das Bermudas"},
            {"title": "Por que temos impressões digitais únicas", "category": "Corpo Humano", "hook_suggestion": "Você sabia que suas digitais são únicas?"},
            {"title": "Como funciona a aurora boreal", "category": "Espaço", "hook_suggestion": "O fenômeno mais bonito da natureza"},
            {"title": "A verdade sobre sonhos lúcidos", "category": "Mente", "hook_suggestion": "Controle seus sonhos com esta técnica"},
            {"title": "Por que o sal derrete o gelo", "category": "Química", "hook_suggestion": "A ciência por trás do derretimento"},
            {"title": "Como as plantas carnívoras capturam presas", "category": "Natureza", "hook_suggestion": "Plantas que comem insetos!"},
            {"title": "O fenômeno da déjà vu", "category": "Mente", "hook_suggestion": "Por que sentimos que já vivemos isso?"},
            {"title": "Como os camaleões mudam de cor", "category": "Animais", "hook_suggestion": "O segredo da camuflagem perfeita"}
        ]
        
        return random.sample(fallback, min(count, len(fallback)))
    
    def add_topics(self, topics: List[Dict]):
        """Add topics to database."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for topic in topics:
            cursor.execute('''
                INSERT INTO topics (title, category, hook_suggestion)
                VALUES (?, ?, ?)
            ''', (
                topic.get("title"),
                topic.get("category"),
                topic.get("hook_suggestion", "")
            ))
        
        conn.commit()
        conn.close()
    
    def get_topics_count(self) -> Dict:
        """Get topics statistics."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM topics WHERE used = 0')
        unused = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM topics WHERE used = 1')
        used = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            "unused": unused,
            "used": used,
            "total": unused + used
        }

# Global instance
topic_generator = TopicGenerator()
