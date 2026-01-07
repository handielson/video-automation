"""
Script de teste para geração de roteiro com Gemini API.
"""

import sys
from pathlib import Path

# Add project to path
sys.path.insert(0, str(Path(__file__).parent))

def test_script_generation():
    """Test script generation with Gemini."""
    
    print("=" * 60)
    print("🤖 TESTE DE GERAÇÃO DE ROTEIRO")
    print("=" * 60)
    
    # Import modules
    try:
        from config.settings import settings
        from modules.script_generator import script_generator
        from modules.budget_controller import budget
    except Exception as e:
        print(f"❌ Erro ao importar módulos: {e}")
        return False
    
    # Check API key
    if not settings.GEMINI_API_KEY:
        print("\n❌ GEMINI_API_KEY não configurada!")
        print("Execute primeiro: python setup_config.py")
        return False
    
    print(f"\n✅ Gemini API Key configurada: {settings.GEMINI_API_KEY[:20]}...")
    
    # Check budget
    can_proceed, message = budget.can_proceed()
    print(f"\n{message}")
    
    if not can_proceed:
        return False
    
    # Generate script
    topic = "Por que o céu é azul durante o dia mas vermelho no pôr do sol"
    
    print(f"\n🎯 Gerando roteiro sobre:")
    print(f"   '{topic}'")
    print("\n⏳ Aguarde...")
    
    try:
        script = script_generator.generate(topic)
        
        print("\n" + "=" * 60)
        print("✅ ROTEIRO GERADO COM SUCESSO!")
        print("=" * 60)
        
        print(f"\n🎬 HOOK ({len(script['hook'])} caracteres):")
        print(f"   {script['hook']}")
        
        print(f"\n📝 CORPO ({len(script['body'])} caracteres):")
        print(f"   {script['body'][:200]}...")
        
        print(f"\n🎤 OUTRO ({len(script['outro'])} caracteres):")
        print(f"   {script['outro']}")
        
        print(f"\n🔍 KEYWORDS:")
        print(f"   {', '.join(script.get('visual_keywords', []))}")
        
        print(f"\n⏱️  Duração estimada: {script.get('duration_estimate', 50)}s")
        
        # Budget update
        report = budget.get_report()
        print(f"\n💰 Custo dessa geração: $0.00 (Gemini Free Tier)")
        print(f"   Total gasto este mês: ${report['total_cost']:.2f}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Erro ao gerar roteiro: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_script_generation()
    
    if success:
        print("\n" + "=" * 60)
        print("✅ TESTE CONCLUÍDO COM SUCESSO!")
        print("=" * 60)
        print("\n📝 Próximos passos:")
        print("   1. Instale google-generativeai: pip install google-generativeai")
        print("   2. Configure mais APIs para gerar vídeos completos")
        print("   3. Execute: python main.py --topic 'Sua curiosidade'")
    else:
        print("\n❌ Teste falhou. Verifique os erros acima.")
