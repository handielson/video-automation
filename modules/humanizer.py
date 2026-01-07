"""
Humanization module for anti-detection and natural behavior simulation.
Prevents platform bans by mimicking human patterns.
"""

import random
import time
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
from fake_useragent import UserAgent

from config.settings import settings

class Humanizer:
    """Simulates human behavior to avoid bot detection."""
    
    def __init__(self):
        self.ua = UserAgent()
        self.upload_history = []
    
    def get_random_post_time(self, base_time: str) -> str:
        """
        Add random variance to posting time.
        
        Args:
            base_time: Time in HH:MM format (e.g., "18:00")
        
        Returns:
            Randomized time string
        """
        if not settings.RANDOMIZE_POST_TIME:
            return base_time
        
        # Parse base time
        hour, minute = map(int, base_time.split(":"))
        base_dt = datetime.now().replace(hour=hour, minute=minute, second=0)
        
        # Add random variance (15-45 minutes)
        variance_minutes = random.randint(15, 45)
        if random.random() > 0.5:
            variance_minutes = -variance_minutes
        
        new_dt = base_dt + timedelta(minutes=variance_minutes)
        return new_dt.strftime("%H:%M")
    
    def get_random_duration(self) -> int:
        """Get randomized video duration."""
        if not settings.RANDOMIZE_VIDEO_DURATION:
            return settings.VIDEO_DURATION
        
        if settings.STEALTH_MODE:
            # More variation in stealth mode
            return random.randint(45, 60)
        else:
            # Normal variance: 48-55s
            return random.randint(48, 55)
    
    def human_delay(self, action: str = "general") -> None:
        """
        Add human-like delay between actions.
        
        Args:
            action: Type of action (typing, clicking, reviewing, uploading)
        """
        delays = {
            "typing": (1, 3),
            "clicking": (0.5, 2),
            "reviewing": (30, 120),
            "uploading": (45, 180),
            "general": (settings.HUMAN_DELAY_MIN, settings.HUMAN_DELAY_MAX)
        }
        
        min_delay, max_delay = delays.get(action, delays["general"])
        
        if settings.STEALTH_MODE:
            # Longer delays in stealth mode
            max_delay = int(max_delay * 1.5)
        
        delay = random.uniform(min_delay, max_delay)
        time.sleep(delay)
    
    def get_random_headers(self) -> Dict[str, str]:
        """Generate randomized HTTP headers."""
        return {
            "User-Agent": self.ua.random,
            "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1"
        }
    
    def can_upload_now(self, platform: str) -> Tuple[bool, str]:
        """
        Check if upload is allowed based on rate limits and humanization rules.
        
        Args:
            platform: 'youtube' or 'tiktok'
        
        Returns:
            (can_upload, reason)
        """
        now = datetime.now()
        today = now.date()
        
        # Check weekly rest day
        if settings.WEEKLY_REST_DAY:
            if now.strftime("%A").lower() == settings.WEEKLY_REST_DAY:
                return False, f"📅 Dia de descanso: {settings.WEEKLY_REST_DAY}"
        
        # Count uploads today
        today_uploads = [u for u in self.upload_history if u["date"].date() == today]
        platform_uploads_today = [u for u in today_uploads if u["platform"] == platform]
        
        # Check daily limits
        if platform == "youtube":
            if len(platform_uploads_today) >= settings.MAX_UPLOADS_PER_DAY_YOUTUBE:
                return False, f"⛔ Limite diário YouTube atingido: {len(platform_uploads_today)}/{settings.MAX_UPLOADS_PER_DAY_YOUTUBE}"
        elif platform == "tiktok":
            if len(platform_uploads_today) >= settings.MAX_UPLOADS_PER_DAY_TIKTOK:
                return False, f"⛔ Limite diário TikTok atingido: {len(platform_uploads_today)}/{settings.MAX_UPLOADS_PER_DAY_TIKTOK}"
        
        # Check minimum interval between uploads
        if self.upload_history:
            last_upload = max(self.upload_history, key=lambda x: x["date"])
            time_since_last = (now - last_upload["date"]).total_seconds() / 60
            
            if time_since_last < settings.MIN_INTERVAL_BETWEEN_UPLOADS:
                remaining = settings.MIN_INTERVAL_BETWEEN_UPLOADS - time_since_last
                return False, f"⏳ Aguarde {remaining:.0f} min antes do próximo upload"
        
        return True, "✅ Upload permitido"
    
    def record_upload(self, platform: str, video_id: str) -> None:
        """Record an upload for rate limiting."""
        self.upload_history.append({
            "platform": platform,
            "video_id": video_id,
            "date": datetime.now()
        })
        
        # Keep only last 30 days
        cutoff = datetime.now() - timedelta(days=30)
        self.upload_history = [u for u in self.upload_history if u["date"] > cutoff]
    
    def randomize_metadata(self, metadata: Dict) -> Dict:
        """Add variation to metadata to avoid patterns."""
        new_metadata = metadata.copy()
        
        # Vary description length slightly
        if "description" in new_metadata:
            desc = new_metadata["description"]
            # Randomly add or remove a sentence
            if random.random() > 0.5 and len(desc) < 280:
                endings = [
                    " O que você achou?",
                    " Comenta aí!",
                    " Deixa tua opinião!",
                    " Interessante, né?",
                    ""
                ]
                new_metadata["description"] += random.choice(endings)
        
        return new_metadata
    
    def get_hook_template(self) -> str:
        """Get a random hook template for variation."""
        templates = [
            "Você sabia que {fact}?",
            "Prepare-se para descobrir {fact}",
            "Isso vai mudar tudo que você sabe sobre {topic}",
            "Atenção: {fact}",
            "Algo incrível sobre {topic}",
            "A verdade sobre {topic} que ninguém te contou",
            "Por que {question}? A resposta vai te surpreender",
            "Descubra {fact}",
            "Nunca imaginei que {fact}",
            "Inacreditável: {fact}"
        ]
        return random.choice(templates)
    
    def check_shadowban_risk(self, recent_views: List[int]) -> Tuple[bool, str]:
        """
        Detect potential shadowban based on view patterns.
        
        Args:
            recent_views: List of view counts from recent videos
        
        Returns:
            (is_shadowbanned, message)
        """
        if len(recent_views) < 3:
            return False, "Dados insuficientes"
        
        avg_views = sum(recent_views[:-1]) / (len(recent_views) - 1)
        latest_views = recent_views[-1]
        
        # If latest video has < 30% of average views, possible shadowban
        if latest_views < (avg_views * 0.3):
            return True, f"⚠️ Possível shadowban! Views médias: {avg_views:.0f}, Último vídeo: {latest_views}"
        
        return False, "✅ Sem sinais de shadowban"
    
    def should_pause_for_safety(self) -> Tuple[bool, str]:
        """Randomly decide to pause for natural variation."""
        if settings.STEALTH_MODE:
            # 20% chance to skip a day in stealth mode
            if random.random() < 0.2:
                return True, "🤫 Pausa aleatória (modo stealth)"
        else:
            # 5% chance to skip in normal mode
            if random.random() < 0.05:
                return True, "🎲 Pausa aleatória (variação natural)"
        
        return False, ""

# Global humanizer instance
humanizer = Humanizer()
