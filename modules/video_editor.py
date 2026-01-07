"""
Video editor module using MoviePy to create final videos.
Combines background video, narration, captions, and music.
"""

from pathlib import Path
from typing import List, Dict, Optional
import json

try:
    from moviepy.editor import (
        VideoFileClip, AudioFileClip, CompositeVideoClip,
        TextClip, concatenate_videoclips, CompositeAudioClip
    )
    from moviepy.video.fx import resize
    MOVIEPY_AVAILABLE = True
except ImportError:
    MOVIEPY_AVAILABLE = False

from config.settings import settings

class VideoEditor:
    """Creates final videos by combining all assets."""
    
    def __init__(self):
        if not MOVIEPY_AVAILABLE:
            raise ImportError(
                "MoviePy não está instalado. Execute:\n"
                "pip install moviepy"
            )
        
        self.output_dir = settings.OUTPUT_DIR
        self.output_dir.mkdir(exist_ok=True)
    
    def create_video(
        self,
        script: Dict,
        narration_audio: Path,
        background_videos: List[Path],
        background_music: Optional[Path] = None,
        output_filename: Optional[str] = None
    ) -> Path:
        """
        Create final video from all components.
        
        Args:
            script: Script dictionary with text
            narration_audio: Path to narration MP3
            background_videos: List of background video paths
            background_music: Optional background music path
            output_filename: Custom output filename
        
        Returns:
            Path to generated video
        """
        print("🎬 Iniciando edição de vídeo...")
        
        # Load narration to get duration
        narration = AudioFileClip(str(narration_audio))
        video_duration = narration.duration
        
        print(f"   ⏱️  Duração total: {video_duration:.1f}s")
        
        # Create background video
        background_clip = self._create_background(
            background_videos,
            video_duration
        )
        
        # Add captions
        video_with_captions = self._add_captions(
            background_clip,
            script
        )
        
        # Add narration audio
        final_audio = narration
        
        # Add background music if provided
        if background_music and background_music.exists():
            print("   🎵 Adicionando música de fundo...")
            music = AudioFileClip(str(background_music))
            music = music.volumex(0.1)  # -20dB (10% volume)
            music = music.set_duration(video_duration)
            
            final_audio = CompositeAudioClip([narration, music])
        
        # Set audio to video
        final_video = video_with_captions.set_audio(final_audio)
        
        # Generate output filename
        if not output_filename:
            from datetime import datetime
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"video_{timestamp}.mp4"
        
        output_path = self.output_dir / output_filename
        
        # Export video
        print(f"   📤 Exportando vídeo para: {output_path.name}")
        final_video.write_videofile(
            str(output_path),
            fps=settings.VIDEO_FPS,
            codec='libx264',
            audio_codec='aac',
            temp_audiofile='temp-audio.m4a',
            remove_temp=True,
            logger=None,  # Suppress verbose output
            preset='medium',
            threads=4
        )
        
        # Cleanup
        narration.close()
        background_clip.close()
        final_video.close()
        if background_music:
            music.close()
        
        print(f"✅ Vídeo criado: {output_path}")
        
        # Save metadata
        self._save_metadata(output_path, script)
        
        return output_path
    
    def _create_background(
        self,
        video_paths: List[Path],
        target_duration: float
    ) -> VideoFileClip:
        """Create background video from multiple clips."""
        print("   🎥 Processando vídeos de fundo...")
        
        clips = []
        current_duration = 0
        
        for video_path in video_paths:
            if current_duration >= target_duration:
                break
            
            if not video_path.exists() or video_path.stat().st_size == 0:
                # Skip placeholder files
                continue
            
            try:
                clip = VideoFileClip(str(video_path))
                
                # Resize to vertical (9:16)
                clip = clip.resize(
                    height=settings.VIDEO_HEIGHT,
                    width=settings.VIDEO_WIDTH
                )
                
                # Crop if needed
                if clip.w > settings.VIDEO_WIDTH:
                    x_center = clip.w / 2
                    x1 = x_center - (settings.VIDEO_WIDTH / 2)
                    clip = clip.crop(
                        x1=x1,
                        y1=0,
                        x2=x1 + settings.VIDEO_WIDTH,
                        y2=settings.VIDEO_HEIGHT
                    )
                
                # Trim or loop clip
                remaining = target_duration - current_duration
                if clip.duration > remaining:
                    clip = clip.subclip(0, remaining)
                else:
                    # Loop if too short
                    loops_needed = int(remaining / clip.duration) + 1
                    clip = concatenate_videoclips([clip] * loops_needed)
                    clip = clip.subclip(0, remaining)
                
                clips.append(clip)
                current_duration += clip.duration
                
            except Exception as e:
                print(f"   ⚠️  Erro ao processar {video_path.name}: {e}")
                continue
        
        if not clips:
            # Create solid color background if no videos
            print("   ⚠️  Criando background de cor sólida...")
            from moviepy.video.VideoClip import ColorClip
            return ColorClip(
                size=(settings.VIDEO_WIDTH, settings.VIDEO_HEIGHT),
                color=(20, 20, 30),
                duration=target_duration
            )
        
        # Concatenate all clips
        final_clip = concatenate_videoclips(clips, method="compose")
        
        return final_clip
    
    def _add_captions(
        self,
        video: VideoFileClip,
        script: Dict
    ) -> CompositeVideoClip:
        """Add dynamic captions to video."""
        print("   💬 Adicionando legendas...")
        
        # Combine all text
        full_text = f"{script['hook']} {script['body']} {script['outro']}"
        
        # Split into words for dynamic display
        words = full_text.split()
        
        # Calculate timing (simple: evenly distribute)
        duration_per_word = video.duration / len(words)
        
        # Create caption clips (showing 3-4 words at a time)
        caption_clips = []
        words_per_caption = 4
        
        for i in range(0, len(words), words_per_caption):
            chunk = " ".join(words[i:i + words_per_caption])
            start_time = i * duration_per_word
            end_time = start_time + (words_per_caption * duration_per_word)
            
            try:
                txt_clip = TextClip(
                    chunk,
                    fontsize=50,
                    color='white',
                    font='Arial-Bold',
                    stroke_color='black',
                    stroke_width=2,
                    method='caption',
                    size=(settings.VIDEO_WIDTH - 100, None)
                )
                
                txt_clip = txt_clip.set_position(('center', 'center'))
                txt_clip = txt_clip.set_start(start_time)
                txt_clip = txt_clip.set_duration(min(words_per_caption * duration_per_word, video.duration - start_time))
                
                caption_clips.append(txt_clip)
                
            except Exception as e:
                print(f"   ⚠️  Erro ao criar legenda: {e}")
                continue
        
        # Composite video with captions
        if caption_clips:
            return CompositeVideoClip([video] + caption_clips)
        else:
            return video
    
    def _save_metadata(self, video_path: Path, script: Dict):
        """Save video metadata as JSON."""
        metadata_path = video_path.with_suffix('.json')
        
        metadata = {
            "video_file": video_path.name,
            "script": script,
            "duration": script.get("duration_estimate", 50),
            "resolution": f"{settings.VIDEO_WIDTH}x{settings.VIDEO_HEIGHT}",
            "fps": settings.VIDEO_FPS
        }
        
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)

# Global instance
video_editor = VideoEditor() if MOVIEPY_AVAILABLE else None
