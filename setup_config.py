"""
Script de configuração rápida do arquivo .env
"""

import os
from pathlib import Path

def setup_env():
    """Configure .env file with user's API key."""
    
    env_path = Path(__file__).parent / ".env"
    env_example = Path(__file__).parent / ".env.example"
    
    print("🔧 Configurando arquivo .env...")
    
    # Copy from example if .env doesn't exist
    if not env_path.exists():
        if env_example.exists():
            with open(env_example, 'r', encoding='utf-8') as f:
                content = f.read()
            
            with open(env_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print("✅ Arquivo .env criado a partir do .env.example")
        else:
            print("❌ .env.example não encontrado")
            return False
    
    # Update Gemini API key
    gemini_key = input("\n📝 Cole sua chave da API do Gemini: ").strip()
    
    if not gemini_key:
        print("⚠️ Nenhuma chave fornecida. Usando arquivo existente.")
        return True
    
    # Read current .env
    with open(env_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Update Gemini key
    updated = False
    for i, line in enumerate(lines):
        if line.startswith("GEMINI_API_KEY="):
            lines[i] = f"GEMINI_API_KEY={gemini_key}\n"
            updated = True
            break
    
    # Write back
    with open(env_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    
    if updated:
        print("✅ Chave Gemini configurada com sucesso!")
    else:
        print("⚠️ Linha GEMINI_API_KEY não encontrada no .env")
    
    print(f"\n📁 Arquivo salvo em: {env_path}")
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("🎬 CONFIGURAÇÃO DO SISTEMA DE AUTOMAÇÃO DE VÍDEOS")
    print("=" * 60)
    
    if setup_env():
        print("\n✅ Configuração concluída!")
        print("\n📝 Próximo passo:")
        print("   python main.py --test-mode")
    else:
        print("\n❌ Erro na configuração")
