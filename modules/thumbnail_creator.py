"""
Thumbnail creator for generating attractive video thumbnails.
"""

from pathlib import Path
from typing import Optional
import random

try:
    from PIL import Image, ImageDraw, ImageFont
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

from config.settings import settings

class ThumbnailCreator:
    """Creates video thumbnails from frames and text."""
    
    def __init__(self):
        if not PIL_AVAILABLE:
            print("⚠️  Pillow não instalado. Thumbnails não disponíveis.")
        
        self.output_dir = settings.OUTPUT_DIR / "thumbnails"
        self.output_dir.mkdir(exist_ok=True)
    
    def create_thumbnail(
        self,
        video_path: Path,
        title: str,
        output_filename: Optional[str] = None
    ) -> Optional[Path]:
        """
        Create thumbnail from video frame.
        
        Args:
            video_path: Path to video file
            title: Title text to overlay
            output_filename: Custom output filename
        
        Returns:
            Path to generated thumbnail
        """
        if not PIL_AVAILABLE:
            print("⚠️  Pillow necessário para criar thumbnails")
            return None
        
        print("🖼️  Criando thumbnail...")
        
        try:
            # Extract frame from video (middle frame)
            frame = self._extract_frame(video_path)
            
            if not frame:
                # Create from solid color
                frame = self._create_solid_background()
            
            # Add text overlay
            thumbnail = self._add_text_overlay(frame, title)
            
            # Save
            if not output_filename:
                from datetime import datetime
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                output_filename = f"thumb_{timestamp}.jpg"
            
            output_path = self.output_dir / output_filename
            thumbnail.save(output_path, "JPEG", quality=95)
            
            print(f"✅ Thumbnail criada: {output_path.name}")
            
            return output_path
            
        except Exception as e:
            print(f"⚠️  Erro ao criar thumbnail: {e}")
            return None
    
    def _extract_frame(self, video_path: Path) -> Optional[Image.Image]:
        """Extract frame from video."""
        try:
            from moviepy.editor import VideoFileClip
            
            if not video_path.exists():
                return None
            
            clip = VideoFileClip(str(video_path))
            
            # Get middle frame
            middle_time = clip.duration / 2
            frame = clip.get_frame(middle_time)
            
            clip.close()
            
            # Convert to PIL Image
            return Image.fromarray(frame)
            
        except:
            return None
    
    def _create_solid_background(self) -> Image.Image:
        """Create solid color background."""
        colors = [
            (30, 30, 50),    # Dark blue
            (50, 30, 30),    # Dark red
            (30, 50, 30),    # Dark green
            (50, 50, 30),    # Dark yellow
        ]
        
        color = random.choice(colors)
        
        return Image.new('RGB', (1080, 1920), color)
    
    def _add_text_overlay(self, image: Image.Image, title: str) -> Image.Image:
        """Add text overlay to image."""
        # Create a copy
        img = image.copy()
        draw = ImageDraw.Draw(img)
        
        # Try to load a good font
        try:
            font = ImageFont.truetype("arial.ttf", 80)
            font_small = ImageFont.truetype("arial.ttf", 60)
        except:
            # Fallback to default
            font = ImageFont.load_default()
            font_small = font
        
        # Wrap text
        words = title.split()
        lines = []
        current_line = []
        
        for word in words:
            current_line.append(word)
            test_line = " ".join(current_line)
            
            # Simple width check (approximate)
            if len(test_line) > 20:
                if len(current_line) > 1:
                    current_line.pop()
                    lines.append(" ".join(current_line))
                    current_line = [word]
                else:
                    lines.append(test_line)
                    current_line = []
        
        if current_line:
            lines.append(" ".join(current_line))
        
        # Limit to 3 lines
        lines = lines[:3]
        
        # Calculate text position (center)
        y_start = (1920 - len(lines) * 100) // 2
        
        # Draw text with outline
        for i, line in enumerate(lines):
            # Get text bbox
            bbox = draw.textbbox((0, 0), line, font=font)
            text_width = bbox[2] - bbox[0]
            
            x = (1080 - text_width) // 2
            y = y_start + i * 100
            
            # Draw outline (black)
            outline_range = 3
            for adj_x in range(-outline_range, outline_range + 1):
                for adj_y in range(-outline_range, outline_range + 1):
                    draw.text((x + adj_x, y + adj_y), line, font=font, fill=(0, 0, 0))
            
            # Draw main text (white)
            draw.text((x, y), line, font=font, fill=(255, 255, 255))
        
        return img

# Global instance
thumbnail_creator = ThumbnailCreator() if PIL_AVAILABLE else None
