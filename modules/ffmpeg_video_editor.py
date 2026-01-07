"""
FFmpeg-based video editor - simpler and more reliable than MoviePy.
Uses subprocess to call FFmpeg directly for video assembly.
"""

import subprocess
from pathlib import Path
from typing import List, Dict, Optional
import json
from datetime import datetime

from config.settings import settings

class FFmpegVideoEditor:
    """Creates final videos using FFmpeg directly (no Python library dependencies)."""
    
    def __init__(self):
        self.output_dir = settings.OUTPUT_DIR
        self.output_dir.mkdir(exist_ok=True)
        
        # Check FFmpeg availability
        try:
            subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
            print("✅ FFmpeg detectado")
        except:
            raise RuntimeError("FFmpeg não encontrado. Instale: choco install ffmpeg")
    
    def create_video(
        self,
        script: Dict,
        narration_audio: Path,
        background_videos: List[Path],
        background_music: Optional[Path] = None,
        output_filename: Optional[str] = None
    ) -> Path:
        """
        Create final video using FFmpeg.
        
        Args:
            script: Script dictionary
            narration_audio: Path to narration MP3
            background_videos: List of background video paths
            background_music: Optional background music
            output_filename: Custom output filename
        
        Returns:
            Path to generated video
        """
        print("🎬 Iniciando edição de vídeo com FFmpeg...")
        
        # Generate output filename
        if not output_filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"video_{timestamp}.mp4"
        
        output_path = self.output_dir / output_filename
        
        # Get narration duration
        duration = self._get_audio_duration(narration_audio)
        print(f"   ⏱️  Duração total: {duration:.1f}s")
        
        # Step 1: Create video from background clips
        temp_video = self.output_dir / "temp_video.mp4"
        self._create_background_video(background_videos, duration, temp_video)
        
        # Step 2: Add narration
        temp_with_narration = self.output_dir / "temp_with_audio.mp4"
        self._add_narration(temp_video, narration_audio, temp_with_narration)
        
        # Step 3: Skip background music temporarily (FFmpeg mixer issue)
        print("   ⏭️  Pulando música de fundo (temporariamente)")
        temp_with_narration.replace(output_path)
        
        # Cleanup temp files
        for temp_file in [temp_video, temp_with_narration]:
            if temp_file.exists():
                temp_file.unlink()
        
        print(f"✅ Vídeo criado: {output_path}")
        
        # Save metadata
        self._save_metadata(output_path, script)
        
        return output_path
    
    def _get_audio_duration(self, audio_path: Path) -> float:
        """Get audio duration using ffprobe."""
        try:
            cmd = [
                'ffprobe', '-v', 'error',
                '-show_entries', 'format=duration',
                '-of', 'default=noprint_wrappers=1:nokey=1',
                str(audio_path)
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return float(result.stdout.strip())
        except:
            # Fallback: estimate 3 chars per second
            return 50.0
    
    def _create_background_video(self, video_paths: List[Path], duration: float, output: Path):
        """Create background video from clips."""
        print("   🎥 Processando vídeos de fundo...")
        
        # Filter valid videos
        valid_videos = [v for v in video_paths if v.exists() and v.stat().st_size > 1000]
        
        if not valid_videos:
            # Create solid color background
            print("   ⚠️  Criando background de cor sólida...")
            cmd = [
                'ffmpeg', '-y',
                '-f', 'lavfi',
                '-i', f'color=c=black:s={settings.VIDEO_WIDTH}x{settings.VIDEO_HEIGHT}:d={duration}',
                '-c:v', 'libx264',
                '-t', str(duration),
                '-pix_fmt', 'yuv420p',
                str(output)
            ]
            subprocess.run(cmd, capture_output=True, check=False)
            return
        
        # Use first video, loop if needed
        video = valid_videos[0]
        
        cmd = [
            'ffmpeg', '-y',
            '-stream_loop', '-1',  # Loop infinitely
            '-i', str(video),
            '-t', str(duration),  # Cut to duration
            '-vf', f'scale={settings.VIDEO_WIDTH}:{settings.VIDEO_HEIGHT}:force_original_aspect_ratio=increase,crop={settings.VIDEO_WIDTH}:{settings.VIDEO_HEIGHT}',
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-crf', '23',
            '-pix_fmt', 'yuv420p',
            '-an',  # Remove audio from background
            str(output)
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"   ❌ Erro FFmpeg: {result.stderr[:500]}")
            raise Exception(f"FFmpeg falhou ao criar background: {result.stderr[:200]}")
        
        if not output.exists() or output.stat().st_size == 0:
            raise Exception(f"Background vídeo não foi criado ou está vazio")
        
        print(f"   ✅ Background criado: {output.stat().st_size / 1024 / 1024:.1f} MB")
    
    def _add_narration(self, video: Path, narration: Path, output: Path):
        """Add narration audio to video."""
        print("   🔊 Adicionando narração...")
        
        cmd = [
            'ffmpeg', '-y',
            '-i', str(video),
            '-i', str(narration),
            '-c:v', 'copy',  # Copy video stream
            '-c:a', 'aac',  # Encode audio to AAC
            '-b:a', '192k',  # Audio bitrate
            '-shortest',  # End when shortest input ends
            str(output)
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"   ❌ Erro ao adicionar narração: {result.stderr[:500]}")
            raise Exception(f"FFmpeg falhou ao adicionar áudio")
        
        if not output.exists() or output.stat().st_size == 0:
            raise Exception(f"Vídeo com narração não foi criado")
        
        print(f"   ✅ Narração adicionada: {output.stat().st_size / 1024 / 1024:.1f} MB")
    
    def _add_background_music(self, video: Path, music: Path, duration: float, output: Path):
        """Mix narration with background music."""
        cmd = [
            'ffmpeg', '-y',
            '-i', str(video),
            '-stream_loop', '-1',  # Loop music
            '-i', str(music),
            '-filter_complex',
            '[1:a]volume=0.1[music];[0:a][music]amix=inputs=2:duration=shortest[aout]',
            '-map', '0:v',
            '-map', '[aout]',
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-t', str(duration),
            str(output)
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"   ❌ Erro ao adicionar música: {result.stderr[:500]}")
            raise Exception(f"FFmpeg falhou ao mixar áudio")
        
        if not output.exists() or output.stat().st_size == 0:
            raise Exception(f"Vídeo final não foi criado")
        
        print(f"   ✅ Música adicionada: {output.stat().st_size / 1024 / 1024:.1f} MB")
    
    def _save_metadata(self, video_path: Path, script: Dict):
        """Save video metadata as JSON."""
        metadata_path = video_path.with_suffix('.json')
        
        metadata = {
            "video_file": video_path.name,
            "script": script,
            "duration": script.get("duration_estimate", 50),
            "resolution": f"{settings.VIDEO_WIDTH}x{settings.VIDEO_HEIGHT}",
            "fps": settings.VIDEO_FPS,
            "editor": "FFmpeg"
        }
        
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)

# Global instance
ffmpeg_video_editor = FFmpegVideoEditor()
