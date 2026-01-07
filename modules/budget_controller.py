"""
Budget controller module for tracking API costs and enforcing spending limits.
Monitors expenses in real-time and prevents overspending.
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List
from config.settings import settings

class BudgetController:
    """Tracks and manages API costs across all services."""
    
    def __init__(self):
        self.budget_file = settings.DATA_DIR / "budget.json"
        self.costs = self._load_costs()
    
    def _load_costs(self) -> Dict:
        """Load existing cost data or create new."""
        if self.budget_file.exists():
            with open(self.budget_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return self._init_costs()
    
    def _init_costs(self) -> Dict:
        """Initialize cost tracking structure."""
        return{
            "current_month": datetime.now().strftime("%Y-%m"),
            "openai": {"tokens": 0, "cost": 0.0},
            "gemini": {"requests": 0, "cost": 0.0},
            "elevenlabs": {"characters": 0, "cost": 0.0},
            "google_tts": {"characters": 0, "cost": 0.0},
            "total_cost": 0.0,
            "videos_generated": 0,
            "daily_costs": {},
            "monthly_limit": settings.MAX_MONTHLY_SPEND,
            "daily_limit": settings.MAX_DAILY_SPEND
        }
    
    def _save_costs(self):
        """Save costs to file."""
        with open(self.budget_file, 'w', encoding='utf-8') as f:
            json.dump(self.costs, f, indent=2, ensure_ascii=False)
    
    def _reset_if_new_month(self):
        """Reset costs if it's a new month."""
        current_month = datetime.now().strftime("%Y-%m")
        if self.costs["current_month"] != current_month:
            print(f"📅 Novo mês detectado. Resetando custos...")
            self.costs = self._init_costs()
            self._save_costs()
    
    def track_openai(self, tokens: int):
        """Track OpenAI API usage."""
        self._reset_if_new_month()
        cost = (tokens / 1_000_000) * 15.0  # $15 per 1M tokens (GPT-4o)
        self.costs["openai"]["tokens"] += tokens
        self.costs["openai"]["cost"] += cost
        self._update_total(cost)
    
    def track_gemini(self):
        """Track Gemini API usage (free tier)."""
        self._reset_if_new_month()
        self.costs["gemini"]["requests"] += 1
        # Free tier, no cost
    
    def track_elevenlabs(self, characters: int, is_free_tier: bool = True):
        """Track ElevenLabs TTS usage."""
        self._reset_if_new_month()
        self.costs["elevenlabs"]["characters"] += characters
        
        if not is_free_tier:
            # Paid tier: $0.30 per 1K characters
            cost = (characters / 1000) * 0.30
            self.costs["elevenlabs"]["cost"] += cost
            self._update_total(cost)
    
    def track_google_tts(self, characters: int):
        """Track Google TTS usage."""
        self._reset_if_new_month()
        self.costs["google_tts"]["characters"] += characters
        
        # Free tier: first 4M characters/month
        if self.costs["google_tts"]["characters"] > 4_000_000:
            excess = characters
            cost = (excess / 1_000_000) * 4.0  # $4 per 1M after free tier
            self.costs["google_tts"]["cost"] += cost
            self._update_total(cost)
    
    def _update_total(self, cost: float):
        """Update total costs."""
        today = datetime.now().strftime("%Y-%m-%d")
        
        self.costs["total_cost"] += cost
        
        if today not in self.costs["daily_costs"]:
            self.costs["daily_costs"][today] = 0.0
        self.costs["daily_costs"][today] += cost
        
        self._save_costs()
    
    def track_video_generated(self):
        """Increment video counter."""
        self.costs["videos_generated"] += 1
        self._save_costs()
    
    def get_cost_per_video(self) -> float:
        """Calculate average cost per video."""
        if self.costs["videos_generated"] == 0:
            return 0.0
        return self.costs["total_cost"] / self.costs["videos_generated"]
    
    def can_proceed(self) -> tuple[bool, str]:
        """Check if we can proceed based on budget limits."""
        today = datetime.now().strftime("%Y-%m-%d")
        daily_cost = self.costs["daily_costs"].get(today, 0.0)
        
        # Check daily limit
        if daily_cost >= settings.MAX_DAILY_SPEND:
            return False, f"⛔ Limite diário atingido: ${daily_cost:.2f} / ${settings.MAX_DAILY_SPEND:.2f}"
        
        # Check monthly limit
        if self.costs["total_cost"] >= settings.MAX_MONTHLY_SPEND:
            return False, f"⛔ Limite mensal atingido: ${self.costs['total_cost']:.2f} / ${settings.MAX_MONTHLY_SPEND:.2f}"
        
        # Warn at threshold
        monthly_percent = (self.costs["total_cost"] / settings.MAX_MONTHLY_SPEND) * 100
        if monthly_percent >= settings.WARN_AT_BUDGET_PERCENT:
            return True, f"⚠️  {monthly_percent:.0f}% do budget mensal usado"
        
        return True, "✅ Budget OK"
    
    def get_report(self) -> Dict:
        """Generate budget report."""
        self._reset_if_new_month()
        
        return {
            "month": self.costs["current_month"],
            "total_cost": self.costs["total_cost"],
            "videos_generated": self.costs["videos_generated"],
            "cost_per_video": self.get_cost_per_video(),
            "remaining_budget": settings.MAX_MONTHLY_SPEND - self.costs["total_cost"],
            "openai_tokens": self.costs["openai"]["tokens"],
            "openai_cost": self.costs["openai"]["cost"],
            "gemini_requests": self.costs["gemini"]["requests"],
            "elevenlabs_chars": self.costs["elevenlabs"]["characters"],
            "google_tts_chars": self.costs["google_tts"]["characters"],
        }
    
    def estimate_video_cost(self, script_tokens: int, narration_chars: int) -> float:
        """Estimate cost for a single video."""
        script_cost = 0.0
        narration_cost = 0.0
        
        # Estimate script cost (using cheapest available)
        if settings.ECONOMY_MODE and settings.GEMINI_API_KEY:
            script_cost = 0.0  # Gemini free
        else:
            script_cost = (script_tokens / 1_000_000) * 15.0  # GPT-4o
        
        # Estimate narration cost
        if settings.ECONOMY_MODE and settings.GOOGLE_TTS_API_KEY:
            if self.costs["google_tts"]["characters"] < 4_000_000:
                narration_cost = 0.0  # Google TTS free tier
            else:
                narration_cost = (narration_chars / 1_000_000) * 4.0
        else:
            narration_cost = (narration_chars / 1000) * 0.30  # ElevenLabs paid
        
        return script_cost + narration_cost

# Global budget instance
budget = BudgetController()
