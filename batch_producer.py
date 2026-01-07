"""
Batch video producer - generates multiple videos automatically.
"""

import sys
from pathlib import Path
import random

sys.path.insert(0, str(Path(__file__).parent))

from generate_video import generate_video
from modules.budget_controller import budget
from modules.humanizer import humanizer
import time

# Topic ideas for curiosidades obscuras
TOPIC_IDEAS = [
    "Por que o céu é azul durante o dia mas vermelho no pôr do sol",
    "A verdade sobre beber 8 copos de água por dia",
    "Como os gatos sempre caem de pé",
    "Por que o sal derrete o gelo",
    "O mistério da zona morta do oceano",
    "Como funcionam os sonhos lúcidos",
    "O que causa a aurora boreal",
    "Por que temos impressões digitais únicas",
    "Como as abelhas fazem mel",
    "O segredo das pirâmides do Egito",
    "Por que ficamos com soluço",
    "Como funciona a memória fotográfica",
    "O mistério do Triângulo das Bermudas",
    "Por que sentimos calafrios ao ouvir música",
    "Como os camaleões mudam de cor",
    "O que acontece quando desmaiamos",
    "Por que o espaço é silencioso",
    "Como as plantas carnívoras capturam presas",
    "O fenômeno da déjà vu",
    "Por que choramos quando cortamos cebola"
]

def batch_produce(count: int, delay_between: bool = True):
    """
    Produce multiple videos in batch.
    
    Args:
        count: Number of videos to generate
        delay_between: Add humanized delays between generations
    """
    print("=" * 60)
    print(f"🎬 PRODUÇÃO EM LOTE: {count} VÍDEOS")
    print("=" * 60)
    
    # Shuffle topics
    topics = random.sample(TOPIC_IDEAS, min(count, len(TOPIC_IDEAS)))
    
    generated = []
    failed = []
    
    for i, topic in enumerate(topics, 1):
        print(f"\n\n{'='*60}")
        print(f"📹 VÍDEO {i}/{count}")
        print(f"{'='*60}\n")
        
        # Check budget before each video
        can_proceed, message = budget.can_proceed()
        print(f"{message}\n")
        
        if not can_proceed:
            print("⛔ Budget limit reached. Stopping production.")
            break
        
        # Check if should pause (humanization)
        should_pause, pause_reason = humanizer.should_pause_for_safety()
        if should_pause:
            print(f"{pause_reason}")
            print("⏸️  Pulando este vídeo.")
            continue
        
        try:
            # Generate video
            video_path = generate_video(topic, output_filename=f"batch_{i:03d}.mp4")
            
            if video_path:
                generated.append(video_path)
                print(f"\n✅ Vídeo {i} concluído!")
            else:
                print(f"\n⚠️  Vídeo {i}: componentes gerados (sem MoviePy)")
                generated.append(topic)
            
        except Exception as e:
            print(f"\n❌ Vídeo {i} falhou: {e}")
            failed.append((i, topic, str(e)))
        
        # Add delay between videos (humanization)
        if delay_between and i < count:
            delay = random.randint(
                humanizer.HUMAN_DELAY_MIN,
                humanizer.HUMAN_DELAY_MAX
            )
            print(f"\n⏳ Aguardando {delay}s antes do próximo vídeo...")
            time.sleep(delay)
    
    # Summary
    print("\n\n" + "=" * 60)
    print("📊 RELATÓRIO FINAL")
    print("=" * 60)
    
    print(f"\n✅ Vídeos gerados: {len(generated)}/{count}")
    print(f"❌ Falhas: {len(failed)}")
    
    if generated:
        print("\n📁 Arquivos gerados:")
        for path in generated[:5]:  # Show first 5
            print(f"   - {path}")
        if len(generated) > 5:
            print(f"   ... e mais {len(generated) - 5}")
    
    if failed:
        print("\n⚠️  Vídeos que falharam:")
        for idx, topic, error in failed:
            print(f"   {idx}. {topic[:40]}...")
            print(f"      Erro: {error[:60]}...")
    
    # Budget report
    report = budget.get_report()
    print(f"\n💰 Budget:")
    print(f"   Total gasto: ${report['total_cost']:.2f}")
    print(f"   Custo por vídeo: ${report['cost_per_video']:.4f}")
    print(f"   Vídeos gerados este mês: {report['videos_generated']}")
    print(f"   Budget restante: ${report['remaining_budget']:.2f}")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Batch video production')
    parser.add_argument('--count', type=int, default=5, help='Number of videos to generate')
    parser.add_argument('--no-delay', action='store_true', help='Disable delays between videos')
    
    args = parser.parse_args()
    
    batch_produce(args.count, delay_between=not args.no_delay)
