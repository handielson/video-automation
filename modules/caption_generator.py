"""
TikTok-style caption generator for videos.
Creates animated word-by-word captions with highlighting.
"""

import json
from pathlib import Path
from typing import List, Dict
import re

class CaptionGenerator:
    """Generate TikTok-style captions with word-by-word animation."""
    
    def __init__(self):
        self.font_size = 60
        self.font_color = "white"
        self.highlight_color = "yellow"
        self.box_color = "black@0.6"  # Semi-transparent black
        self.position = "(w-text_w)/2:h*0.75"  # Bottom center
        
    def create_caption_file(self, script: dict, narration_duration: float, output_path: Path) -> Path:
        """
        Create SRT subtitle file from script with timing.
        
        Args:
            script: Script dictionary with segments
            narration_duration: Total duration of narration
            output_path: Path to save .srt file
            
        Returns:
            Path to .srt file
        """
        # Extract all text from script
        text_blocks = []
        
        # Hook
        if script.get('hook'):
            text_blocks.append(script['hook'])
        
        # Segments
        for segment in script.get('segments', []):
            if segment.get('narration'):
                text_blocks.append(segment['narration'])
        
        # Conclusion
        if script.get('conclusion'):
            text_blocks.append(script['conclusion'])
        
        # Join all text
        full_text = " ".join(text_blocks)
        
        # Split into words
        words = full_text.split()
        
        if not words:
            return None
        
        # Calculate timing for each word
        time_per_word = narration_duration / len(words)
        
        # Create SRT format subtitles
        srt_content = []
        current_time = 0
        words_per_caption = 3  # Show 3 words at a time
        
        for i in range(0, len(words), words_per_caption):
            chunk_words = words[i:i + words_per_caption]
            chunk_text = " ".join(chunk_words)
            
            # Calculate start and end times
            start_time = current_time
            end_time = current_time + (len(chunk_words) * time_per_word)
            
            # Format times as SRT (HH:MM:SS,mmm)
            start_srt = self._format_srt_time(start_time)
            end_srt = self._format_srt_time(end_time)
            
            # Add subtitle entry
            subtitle_index = (i // words_per_caption) + 1
            srt_content.append(f"{subtitle_index}")
            srt_content.append(f"{start_srt} --> {end_srt}")
            srt_content.append(chunk_text.upper())  # Uppercase for TikTok style
            srt_content.append("")  # Empty line between entries
            
            current_time = end_time
        
        # Write SRT file
        srt_path = output_path.with_suffix('.srt')
        with open(srt_path, 'w', encoding='utf-8') as f:
            f.write("\n".join(srt_content))
        
        print(f"✓ Legendas criadas: {len(srt_content) // 4} segmentos")
        
        return srt_path
    
    def _format_srt_time(self, seconds: float) -> str:
        """Convert seconds to SRT time format (HH:MM:SS,mmm)."""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds % 1) * 1000)
        
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"
    
    def get_ffmpeg_subtitle_filter(self, srt_path: Path) -> str:
        """
        Get FFmpeg filter for adding TikTok-style subtitles.
        
        Args:
            srt_path: Path to .srt subtitle file
            
        Returns:
            FFmpeg filter string
        """
        # Escape path for FFmpeg (Windows compatibility)
        srt_path_str = str(srt_path).replace('\\', '/').replace(':', r'\\:')
        
        # TikTok-style subtitle filter with:
        # - Large white text with yellow highlight
        # - Semi-transparent black box background
        # - Bold font
        # - Bottom center position
        filter_str = (
            f"subtitles='{srt_path_str}'"
            f":force_style='"
            f"FontName=Arial Black,"
            f"FontSize={self.font_size},"
            f"PrimaryColour=&H00FFFFFF,"  # White
            f"OutlineColour=&H00000000,"  # Black outline
            f"BackColour=&H80000000,"     # Semi-transparent black box
            f"BorderStyle=4,"              # Box background
            f"Outline=2,"                  # Thick outline
            f"Shadow=0,"
            f"MarginV=80,"                 # Bottom margin
            f"Alignment=2,"                # Bottom center
            f"Bold=1"
            f"'"
        )
        
        return filter_str

# Global instance
caption_generator = CaptionGenerator()
