"""
Main entry point for video automation system.
Creates individual videos or runs in batch mode.
"""

import argparse
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from config.settings import settings
from modules.budget_controller import budget

def main():
    parser = argparse.ArgumentParser(description='Video Automation System')
    parser.add_argument('--test-mode', action='store_true', help='Run in test mode')
    parser.add_argument('--topic', type=str, help='Video topic')
    parser.add_argument('--output', type=str, help='Output video filename')
    
    args = parser.parse_args()
    
    print("🎬 Video Automation System")
    print("=" * 50)
    
    # Validate API keys
    warnings = settings.validate_api_keys()
    if warnings:
        print("\n⚠️  AVISOS DE CONFIGURAÇÃO:")
        for warning in warnings:
            print(warning)
        print()
    
    # Check budget
    can_proceed, message = budget.can_proceed()
    print(f"\n{message}")
    
    if not can_proceed:
        print("\n❌ Sistema pausado devido a limite de budget.")
        return
    
    if args.test_mode:
        print("\n🧪 Modo de teste ativado...")
        print(f"📁 Diretórios: {settings.OUTPUT_DIR}")
        print(f"💰 Modo economia: {settings.ECONOMY_MODE}")
        print(f"🎯 Nicho padrão: {settings.DEFAULT_NICHE}")
        
        # Budget report
        report = budget.get_report()
        print(f"\n📊 Budget Report:")
        print(f"   Total gasto este mês: ${report['total_cost']:.2f}")
        print(f"   Vídeos gerados: {report['videos_generated']}")
        print(f"   Custo por vídeo: ${report['cost_per_video']:.2f}")
        print(f"   Budget restante: ${report['remaining_budget']:.2f}")
        
        print("\n✅ Sistema configurado corretamente!")
        print("\n📝 Próximos passos:")
        print("   1. Configure suas chaves de API no arquivo .env")
        print("   2. Instale FFmpeg: choco install ffmpeg")
        print("   3. Execute: python main.py --topic 'Sua curiosidade aqui'")
        
        return
    
    if args.topic:
        print(f"\n🎯 Gerando vídeo sobre: {args.topic}")
        
        try:
            from generate_video import generate_video
            video_path = generate_video(args.topic, args.output)
            
            if video_path:
                print(f"\n🎉 SUCESSO! Vídeo criado:")
                print(f"   {video_path}")
            else:
                print(f"\n✅ Componentes gerados com sucesso!")
                print(f"   Para gerar o vídeo final, instale: pip install moviepy")
        except Exception as e:
            print(f"\n❌ Erro: {e}")
        
        return
    
    print("\n❌ Use --test-mode para testar o sistema ou --topic para gerar vídeo")
    print("   Exemplo: python main.py --test-mode")
    print("   Exemplo: python main.py --topic 'Fato curioso sobre o espaço'")

if __name__ == "__main__":
    main()
