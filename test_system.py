"""
Teste simplificado do sistema - não requer dependências externas.
Valida a estrutura do projeto e configurações básicas.
"""

import os
import sys
from pathlib import Path

def test_structure():
    """Test project structure."""
    print("🔍 Verificando estrutura do projeto...")
    print("=" * 60)
    
    base_dir = Path(__file__).parent
    
    required_dirs = [
        "config",
        "modules", 
        "dashboard",
        "data",
        "assets",
        "output",
        "logs"
    ]
    
    all_good = True
    for dir_name in required_dirs:
        dir_path = base_dir / dir_name
        exists = dir_path.exists()
        status = "✅" if exists else "❌"
        print(f"{status} {dir_name}/")
        if not exists:
            all_good = False
    
    return all_good

def test_files():
    """Test that key files exist."""
    print("\n🔍 Verificando arquivos principais...")
    print("=" * 60)
    
    base_dir = Path(__file__).parent
    
    required_files = [
        "requirements.txt",
        ".env.example",
        ".gitignore",
        "README.md",
        "main.py",
        "config/settings.py",
        "config/prompts.py",
        "modules/budget_controller.py",
        "modules/humanizer.py",
        "modules/script_generator.py",
        "modules/voice_narrator.py",
        "modules/asset_manager.py"
    ]
    
    all_good = True
    for file_path in required_files:
        full_path = base_dir / file_path
        exists = full_path.exists()
        status = "✅" if exists else "❌"
        print(f"{status} {file_path}")
        if not exists:
            all_good = False
    
    return all_good

def test_settings():
    """Test settings loading."""
    print("\n🔍 Testando carregamento de configurações...")
    print("=" * 60)
    
    try:
        # Add project to path
        sys.path.insert(0, str(Path(__file__).parent))
        
        from config.settings import settings
        
        print(f"✅ Settings carregado com sucesso")
        print(f"   📁 Output Dir: {settings.OUTPUT_DIR}")
        print(f"   💰 Economy Mode: {settings.ECONOMY_MODE}")
        print(f"   🎯 Default Niche: {settings.DEFAULT_NICHE}")
        print(f"   📊 Max Daily Spend: ${settings.MAX_DAILY_SPEND}")
        
        return True
    except Exception as e:
        print(f"❌ Erro ao carregar settings: {e}")
        return False

def main():
    print("\n" + "=" * 60)
    print("🎬 TESTE DO SISTEMA DE AUTOMAÇÃO DE VÍDEOS")
    print("=" * 60 + "\n")
    
    structure_ok = test_structure()
    files_ok = test_files()
    settings_ok = test_settings()
    
    print("\n" + "=" * 60)
    print("📊 RESULTADO DO TESTE")
    print("=" * 60)
    
    if structure_ok and files_ok and settings_ok:
        print("\n✅ SUCESSO! Sistema estruturado corretamente.")
        print("\n📝 Próximos passos:")
        print("   1. Instale Python 3.11+ se ainda não tiver")
        print("   2. Execute: pip install python-dotenv")
        print("   3. Configure as chaves de API no arquivo .env")
        print("   4. Execute: python main.py --test-mode")
        return 0
    else:
        print("\n❌ FALHA! Alguns componentes estão faltando.")
        print("   Revise os itens marcados com ❌ acima.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
