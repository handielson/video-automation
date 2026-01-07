"""
Centralized configuration management for video automation system.
Loads environment variables and provides access to all settings.
"""

import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

class Settings:
    """Configuration settings for the video automation system."""
    
    # Project paths
    BASE_DIR = Path(__file__).parent.parent
    ASSETS_DIR = BASE_DIR / "assets"
    OUTPUT_DIR = BASE_DIR / "output"
    LOGS_DIR = BASE_DIR / "logs"
    DATA_DIR = BASE_DIR / "data"
    TEMP_DIR = ASSETS_DIR / "temp"
    MUSIC_DIR = ASSETS_DIR / "music"
    FONTS_DIR = ASSETS_DIR / "fonts"
    
    # API Keys
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
    ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "ErXwobaYiN019PkySvjV")
    PEXELS_API_KEY = os.getenv("PEXELS_API_KEY", "")
    PIXABAY_API_KEY = os.getenv("PIXABAY_API_KEY", "")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
    GOOGLE_TTS_API_KEY = os.getenv("GOOGLE_TTS_API_KEY", "")
    
    # YouTube
    YOUTUBE_CLIENT_ID = os.getenv("YOUTUBE_CLIENT_ID", "")
    YOUTUBE_CLIENT_SECRET = os.getenv("YOUTUBE_CLIENT_SECRET", "")
    YOUTUBE_CHANNEL_ID = os.getenv("YOUTUBE_CHANNEL_ID", "")
    
    # TikTok
    TIKTOK_ACCESS_TOKEN = os.getenv("TIKTOK_ACCESS_TOKEN", "")
    TIKTOK_CLIENT_KEY = os.getenv("TIKTOK_CLIENT_KEY", "")
    
    # Reddit
    REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID", "")
    REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET", "")
    REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT", "VideoAutomation/1.0")
    
    # Video settings
    VIDEO_DURATION = int(os.getenv("VIDEO_DURATION", "50"))
    VIDEO_WIDTH = int(os.getenv("VIDEO_WIDTH", "1080"))
    VIDEO_HEIGHT = int(os.getenv("VIDEO_HEIGHT", "1920"))
    VIDEO_FPS = int(os.getenv("VIDEO_FPS", "30"))
    
    # Niche
    DEFAULT_NICHE = os.getenv("DEFAULT_NICHE", "curiosidades_obscuras")
    
    # Automation
    AUTO_UPLOAD = os.getenv("AUTO_UPLOAD", "false").lower() == "true"
    AUTO_GENERATE_TOPICS = os.getenv("AUTO_GENERATE_TOPICS", "true").lower() == "true"
    VIDEOS_PER_DAY = int(os.getenv("VIDEOS_PER_DAY", "2"))
    POST_TIMES = os.getenv("POST_TIMES", "18:00,21:00").split(",")
    ENABLE_NOTIFICATIONS = os.getenv("ENABLE_NOTIFICATIONS", "true").lower() == "true"
    NOTIFICATION_EMAIL = os.getenv("NOTIFICATION_EMAIL", "")
    
    # Analytics
    ENABLE_ANALYTICS = os.getenv("ENABLE_ANALYTICS", "true").lower() == "true"
    ANALYTICS_UPDATE_INTERVAL = int(os.getenv("ANALYTICS_UPDATE_INTERVAL", "6"))
    AI_ADVISOR_FREQUENCY = os.getenv("AI_ADVISOR_FREQUENCY", "weekly")
    AUTO_APPROVE_SUGGESTIONS = os.getenv("AUTO_APPROVE_SUGGESTIONS", "false").lower() == "true"
    MONETIZATION_GOAL = os.getenv("MONETIZATION_GOAL", "maximize_revenue")
    TARGET_MONTHLY_REVENUE = float(os.getenv("TARGET_MONTHLY_REVENUE", "1000"))
    ENABLE_AB_TESTING = os.getenv("ENABLE_AB_TESTING", "true").lower() == "true"
    
    # Cost Optimization
    ECONOMY_MODE = os.getenv("ECONOMY_MODE", "true").lower() == "true"
    CACHE_AGGRESSIVE = os.getenv("CACHE_AGGRESSIVE", "true").lower() == "true"
    MAX_DAILY_SPEND = float(os.getenv("MAX_DAILY_SPEND", "5.00"))
    MAX_MONTHLY_SPEND = float(os.getenv("MAX_MONTHLY_SPEND", "50.00"))
    WARN_AT_BUDGET_PERCENT = int(os.getenv("WARN_AT_BUDGET_PERCENT", "70"))
    
    # API Provider Priority
    SCRIPT_PROVIDER = os.getenv("SCRIPT_PROVIDER", "gemini,openrouter,openai").split(",")
    TTS_PROVIDER = os.getenv("TTS_PROVIDER", "google,elevenlabs_free,elevenlabs_paid").split(",")
    
    # Humanization
    STEALTH_MODE = os.getenv("STEALTH_MODE", "false").lower() == "true"
    RANDOMIZE_POST_TIME = os.getenv("RANDOMIZE_POST_TIME", "true").lower() == "true"
    RANDOMIZE_VIDEO_DURATION = os.getenv("RANDOMIZE_VIDEO_DURATION", "true").lower() == "true"
    HUMAN_DELAY_MIN = int(os.getenv("HUMAN_DELAY_MIN", "30"))
    HUMAN_DELAY_MAX = int(os.getenv("HUMAN_DELAY_MAX", "120"))
    MAX_UPLOADS_PER_DAY_YOUTUBE = int(os.getenv("MAX_UPLOADS_PER_DAY_YOUTUBE", "5"))
    MAX_UPLOADS_PER_DAY_TIKTOK = int(os.getenv("MAX_UPLOADS_PER_DAY_TIKTOK", "3"))
    MIN_INTERVAL_BETWEEN_UPLOADS = int(os.getenv("MIN_INTERVAL_BETWEEN_UPLOADS", "45"))
    WEEKLY_REST_DAY = os.getenv("WEEKLY_REST_DAY", "sunday").lower()
    USE_SELENIUM_FALLBACK = os.getenv("USE_SELENIUM_FALLBACK", "true").lower() == "true"
    ENABLE_SHADOWBAN_DETECTION = os.getenv("ENABLE_SHADOWBAN_DETECTION", "true").lower() == "true"
    
    # Dashboard
    DASHBOARD_ENABLED = os.getenv("DASHBOARD_ENABLED", "true").lower() == "true"
    DASHBOARD_PORT = int(os.getenv("DASHBOARD_PORT", "5000"))
    DASHBOARD_PASSWORD = os.getenv("DASHBOARD_PASSWORD", "admin123")
    
    @classmethod
    def ensure_directories(cls):
        """Create all necessary directories if they don't exist."""
        for dir_path in [cls.ASSETS_DIR, cls.OUTPUT_DIR, cls.LOGS_DIR, 
                        cls.DATA_DIR, cls.TEMP_DIR, cls.MUSIC_DIR, cls.FONTS_DIR]:
            dir_path.mkdir(parents=True, exist_ok=True)
    
    @classmethod
    def validate_api_keys(cls):
        """Validate that essential API keys are configured."""
        warnings = []
        
        if not cls.OPENAI_API_KEY and not cls.GEMINI_API_KEY:
            warnings.append("⚠️  Nenhuma chave de API para geração de roteiros configurada (OpenAI ou Gemini)")
        
        if not cls.ELEVENLABS_API_KEY and not cls.GOOGLE_TTS_API_KEY:
            warnings.append("⚠️  Nenhuma chave de API para narração configurada (ElevenLabs ou Google TTS)")
        
        if not cls.PEXELS_API_KEY:
            warnings.append("⚠️  Chave Pexels API não configurada (necessária para vídeos de fundo)")
        
        return warnings

# Initialize settings
settings = Settings()
settings.ensure_directories()
