"""
Autopilot mode - fully automated video production and publishing.
"""

import sys
from pathlib import Path
import time
import schedule
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent))

from modules.topic_generator import topic_generator
from modules.budget_controller import budget
from modules.humanizer import humanizer
from modules.metadata_optimizer import metadata_optimizer
from generate_video import generate_video

try:
    from modules.thumbnail_creator import thumbnail_creator
except:
    thumbnail_creator = None

def create_and_publish_video():
    """Create and potentially publish a video automatically."""
    
    print("\n" + "=" * 60)
    print(f"🤖 AUTOPILOT - {datetime.now().strftime('%H:%M:%S')}")
    print("=" * 60)
    
    # Check budget
    can_proceed, message = budget.can_proceed()
    print(f"\n{message}")
    
    if not can_proceed:
        print("⛔ Budget limit reached. Pausing autopilot.")
        return False
    
    # Check humanization safety
    should_pause, pause_reason = humanizer.should_pause_for_safety()
    if should_pause:
        print(f"\n{pause_reason}")
        print("⏸️  Pulando esta execução.")
        return True
    
    try:
        # Get next topic
        topic_data = topic_generator.get_next_topic()
        topic = topic_data["title"]
        
        print(f"\n🎯 Tópico selecionado: {topic}")
        print(f"   Categoria: {topic_data.get('category', 'N/A')}")
        
        # Generate video
        video_path = generate_video(topic)
        
        if not video_path:
            print("\n⚠️  Vídeo não gerado completamente (falta MoviePy)")
            return True
        
        # Generate metadata
        # Note: We'd need to load the script that was used
        # For now, create basic metadata
        print("\n📝 Gerando metadados...")
        
        # Generate thumbnail
        if thumbnail_creator and video_path:
            thumbnail_path = thumbnail_creator.create_thumbnail(
                video_path,
                topic[:50]
            )
        
        print("\n✅ Vídeo criado com sucesso!")
        print(f"   Arquivo: {video_path}")
        
        # TODO: Upload to platforms (when implemented)
        # upload_manager.upload_to_youtube(video_path, metadata)
        # upload_manager.upload_to_tiktok(video_path, metadata)
        
        print("\n📊 Estatísticas:")
        report = budget.get_report()
        print(f"   Vídeos hoje: {report['videos_generated']}")
        print(f"   Custo por vídeo: ${report['cost_per_video']:.4f}")
        print(f"   Total gasto: ${report['total_cost']:.2f}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Erro na produção automática: {e}")
        import traceback
        traceback.print_exc()
        return True

def run_autopilot(videos_per_day: int = 2, post_times: list = None):
    """
    Run autopilot mode with scheduled video production.
    
    Args:
        videos_per_day: Number of videos to produce per day
        post_times: List of times to post (e.g., ["18:00", "21:00"])
    """
    if not post_times:
        post_times = ["18:00", "21:00"]
    
    print("=" * 60)
    print("🚀 MODO AUTOPILOT ATIVADO")
    print("=" * 60)
    print(f"\n📅 Configuração:")
    print(f"   Vídeos por dia: {videos_per_day}")
    print(f"   Horários: {', '.join(post_times)}")
    print(f"\n⏰ Sistema rodará continuamente...")
    print("   Pressione Ctrl+C para parar\n")
    
    # Schedule video creation
    for post_time in post_times[:videos_per_day]:
        # Apply humanization to post time
        randomized_time = humanizer.get_random_post_time(post_time)
        schedule.every().day.at(randomized_time).do(create_and_publish_video)
        print(f"   ✓ Agendado para {randomized_time}")
    
    # Check topics and generate if needed
    stats = topic_generator.get_topics_count()
    print(f"\n📝 Tópicos disponíveis: {stats['unused']}")
    
    if stats['unused'] < videos_per_day * 3:
        print("   Gerando mais tópicos...")
        topic_generator.generate_topics_with_ai(count=20)
    
    print("\n✅ Autopilot iniciado!\n")
    
    # Run scheduler
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
            
    except KeyboardInterrupt:
        print("\n\n⏹️  Autopilot interrompido pelo usuário")
        print("=" * 60)
        
        # Final report
        report = budget.get_report()
        print(f"\n📊 Relatório Final:")
        print(f"   Vídeos gerados: {report['videos_generated']}")
        print(f"   Custo total: ${report['total_cost']:.2f}")
        print(f"   Custo por vídeo: ${report['cost_per_video']:.4f}")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Autopilot mode')
    parser.add_argument('--videos-per-day', type=int, default=2, help='Videos per day')
    parser.add_argument('--times', nargs='+', default=["18:00", "21:00"], help='Post times')
    parser.add_argument('--run-now', action='store_true', help='Create one video immediately')
    
    args = parser.parse_args()
    
    if args.run_now:
        create_and_publish_video()
    else:
        run_autopilot(args.videos_per_day, args.times)
