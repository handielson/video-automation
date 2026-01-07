"""
Complete video generator - orchestrates all modules to create final video.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from modules.script_generator import script_generator
from modules.voice_narrator import voice_narrator
from modules.asset_manager import asset_manager
from modules.budget_controller import budget
from modules.humanizer import humanizer

try:
    from modules.ffmpeg_video_editor import ffmpeg_video_editor
    video_editor = ffmpeg_video_editor
except:
    video_editor = None

try:
    from modules.video_editor import video_editor as moviepy_editor
except:
    moviepy_editor = None

def generate_video(topic: str, output_filename: str = None) -> Path:
    """
    Generate complete video from topic.
    
    Args:
        topic: Video topic/curiosity
        output_filename: Custom output filename
    
    Returns:
        Path to generated video
    """
    print("=" * 60)
    print("🎬 GERAÇÃO COMPLETA DE VÍDEO")
    print("=" * 60)
    print(f"\n🎯 Tópico: {topic}\n")
    
    # Check budget
    can_proceed, message = budget.can_proceed()
    print(f"{message}\n")
    
    if not can_proceed:
        raise Exception("Budget limit reached")
    
    try:
        # Step 1: Generate script
        print("📝 PASSO 1: Geração de Roteiro")
        print("-" * 60)
        script = script_generator.generate(topic)
        
        print(f"✅ Roteiro gerado:")
        print(f"   Hook: {script['hook'][:50]}...")
        print(f"   Duração: {script.get('duration_estimate', 50)}s\n")
        
        # Step 2: Generate narration
        print("🔊 PASSO 2: Geração de Narração")
        print("-" * 60)
        narration_path = voice_narrator.generate(script)
        
        print(f"✅ Narração gerada: {narration_path.name}\n")
        
        # Step 3: Get background assets
        print("🎥 PASSO 3: Download de Assets")
        print("-" * 60)
        keywords = script.get('visual_keywords', ['curiosidade'])
        background_videos = asset_manager.get_background_videos(keywords, count=3)
        background_music = asset_manager.get_background_music(mood='lofi')
        
        print(f"✅ {len(background_videos)} vídeos de fundo obtidos")
        print(f"✅ Música de fundo: {background_music.name}\n")
        
        # Step 4: Edit video
        if not video_editor:
            print("\n⚠️  FFmpeg não instalado.")
            print("   Baixe em: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.7z")
            print("   Ou use: choco install ffmpeg")
            print("\n✅ Componentes gerados sem montagem final:")
            print(f"   - Roteiro: Pronto")
            print(f"   - Narração: {narration_path}")
            print(f"   - Vídeos: {len(background_videos)} arquivos")
            print(f"   - Música: {background_music}")
            return None
        
        print("🎬 PASSO 4: Edição de Vídeo")
        print("-" * 60)
        video_path = video_editor.create_video(
            script=script,
            narration_audio=narration_path,
            background_videos=background_videos,
            background_music=background_music,
            output_filename=output_filename
        )
        
        # Track video generation
        budget.track_video_generated()
        
        print("\n" + "=" * 60)
        print("✅ VÍDEO GERADO COM SUCESSO!")
        print("=" * 60)
        print(f"\n📁 Arquivo: {video_path}")
        print(f"📊 Custo total: ${budget.get_cost_per_video():.4f}")
        
        return video_path
        
    except Exception as e:
        print(f"\n❌ Erro na geração: {e}")
        import traceback
        traceback.print_exc()
        raise

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate complete video')
    parser.add_argument('--topic', type=str, required=True, help='Video topic')
    parser.add_argument('--output', type=str, help='Output filename')
    
    args = parser.parse_args()
    
    try:
        video_path = generate_video(args.topic, args.output)
        
        if video_path:
            print(f"\n🎉 Vídeo salvo em: {video_path}")
        else:
            print("\n⚠️  Componentes gerados, mas falta MoviePy para vídeo final")
            print("   Execute: pip install moviepy")
        
    except Exception as e:
        print(f"\n❌ Falha: {e}")
        sys.exit(1)
