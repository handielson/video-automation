"""
Asset manager for downloading and caching background videos and music.
Integrates with Pexels API for videos and Pixabay for music.
"""

import requests
import hashlib
from pathlib import Path
from typing import List, Optional

from config.settings import settings

class AssetManager:
    """Manages visual and audio assets for videos."""
    
    def __init__(self):
        self.video_cache = settings.TEMP_DIR / "videos"
        self.music_cache = settings.MUSIC_DIR
        self.video_cache.mkdir(exist_ok=True)
        self.music_cache.mkdir(exist_ok=True)
    
    def get_background_videos(self, keywords: List[str], count: int = 5) -> List[Path]:
        """
        Download background videos from Pexels.
        
        Args:
            keywords: Search keywords from script
            count: Number of videos to download
        
        Returns:
            List of paths to downloaded videos
        """
        print(f"🎥 Buscando {count} vídeos de fundo...")
        
        if not settings.PEXELS_API_KEY:
            print("⚠️ Pexels API key não configurada. Retornando vídeos placeholder.")
            return self._get_placeholder_videos(count)
        
        # Combine keywords for search
        query = " ".join(keywords[:3])  # Use top 3 keywords
        
        # Search Pexels
        headers = {"Authorization": settings.PEXELS_API_KEY}
        url = "https://api.pexels.com/videos/search"
        
        params = {
            "query": query,
            "orientation": "portrait",  # Vertical videos
            "size": "medium",
            "per_page": count * 2  # Get more than needed
        }
        
        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            
            data = response.json()
            videos = data.get("videos", [])
            
            if not videos:
                print(f"⚠️ Nenhum vídeo encontrado para '{query}'. Usando fallback.")
                return self._search_fallback_videos(count)
            
            # Download videos
            downloaded = []
            for video in videos[:count]:
                try:
                    # Get HD video file
                    video_files = video.get("video_files", [])
                    # Prefer portrait HD videos
                    hd_file = next((v for v in video_files if v.get("quality") == "hd" and v.get("width", 0) < v.get("height", 0)), None)
                    
                    if not hd_file:
                        # Fallback to any HD file
                        hd_file = next((v for v in video_files if v.get("quality") == "hd"), None)
                    
                    if not hd_file:
                        continue
                    
                    video_url = hd_file["link"]
                    video_id = str(video["id"])
                    
                    # Check cache
                    cache_path = self.video_cache / f"{video_id}.mp4"
                    
                    if cache_path.exists():
                        print(f"   📦 Vídeo {video_id} já em cache")
                        downloaded.append(cache_path)
                        continue
                    
                    # Download
                    print(f"   ⬇️ Baixando vídeo {video_id}...")
                    video_response = requests.get(video_url, stream=True)
                    video_response.raise_for_status()
                    
                    with open(cache_path, "wb") as f:
                        for chunk in video_response.iter_content(chunk_size=8192):
                            f.write(chunk)
                    
                    downloaded.append(cache_path)
                    
                except Exception as e:
                    print(f"   ⚠️ Erro ao baixar vídeo: {e}")
                    continue
            
            if len(downloaded) < count:
                print(f"⚠️ Apenas {len(downloaded)}/{count} vídeos baixados.")
                # Fill with placeholders if needed
                downloaded.extend(self._get_placeholder_videos(count - len(downloaded)))
            
            return downloaded[:count]
            
        except Exception as e:
            print(f"❌ Erro ao buscar vídeos: {e}")
            return self._get_placeholder_videos(count)
    
    def _search_fallback_videos(self, count: int) -> List[Path]:
        """Search for generic fallback videos."""
        fallback_queries = ["nature", "abstract", "space", "technology", "ocean"]
        
        for query in fallback_queries:
            try:
                result = self.get_background_videos([query], count)
                if result:
                    return result
            except:
                continue
        
        return self._get_placeholder_videos(count)
    
    def _get_placeholder_videos(self, count: int) -> List[Path]:
        """Generate placeholder video paths."""
        print(f"⚠️ Usando vídeos placeholder (configure PEXELS_API_KEY para vídeos reais)")
        placeholders = []
        
        for i in range(count):
            placeholder = self.video_cache / f"placeholder_{i}.mp4"
            # Create empty placeholder file
            placeholder.touch()
            placeholders.append(placeholder)
        
        return placeholders
    
    def get_background_music(self, mood: str = "lofi") -> Path:
        """
        Get background music file.
        
        Args:
            mood: Music mood (lofi, suspense, energetic)
        
        Returns:
            Path to music file
        """
        print(f"🎵 Procurando música de fundo ({mood})...")
        
        # Check if we already have music in cache
        existing_music = list(self.music_cache.glob("*.mp3"))
        if existing_music:
            print(f"   📦 Usando música do cache: {existing_music[0].name}")
            return existing_music[0]
        
        # Download from Pixabay if API key available
        if settings.PIXABAY_API_KEY:
            return self._download_pixabay_music(mood)
        
        # Create placeholder
        print("⚠️ Configure PIXABAY_API_KEY para música automática")
        placeholder = self.music_cache / "placeholder_music.mp3"
        placeholder.touch()
        return placeholder
    
    def _download_pixabay_music(self, mood: str) -> Path:
        """Download music from Pixabay."""
        try:
            url = "https://pixabay.com/api/"
            params = {
                "key": settings.PIXABAY_API_KEY,
                "q": mood,
                "audio_type": "music"
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data.get("hits"):
                # Get first music file
                music = data["hits"][0]
                music_url = music.get("previewURL")  # Free preview
                
                if music_url:
                    # Download
                    music_file = self.music_cache / f"{mood}_{music['id']}.mp3"
                    
                    if not music_file.exists():
                        print(f"   ⬇️ Baixando música...")
                        music_response = requests.get(music_url)
                        music_response.raise_for_status()
                        
                        with open(music_file, "wb") as f:
                            f.write(music_response.content)
                    
                    return music_file
            
            # Fallback
            placeholder = self.music_cache / "fallback_music.mp3"
            placeholder.touch()
            return placeholder
            
        except Exception as e:
            print(f"⚠️ Erro ao baixar música: {e}")
            placeholder = self.music_cache / "error_music.mp3"
            placeholder.touch()
            return placeholder

# Global instance
asset_manager = AssetManager()
