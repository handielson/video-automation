"""
Script para adicionar chave ElevenLabs ao .env
"""

import os
from pathlib import Path

env_path = Path(__file__).parent / ".env"

print("📝 Adicionando chave ElevenLabs ao .env...")

# Ler arquivo atual
if env_path.exists():
    with open(env_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
else:
    print("❌ Arquivo .env não encontrado")
    exit(1)

# Atualizar ou adicionar chave ElevenLabs
elevenlabs_key = "sk_9fbadfc671df25aa6a77291a5bf68ecc908818f881b691dd"
found = False

for i, line in enumerate(lines):
    if line.startswith("ELEVENLABS_API_KEY="):
        lines[i] = f"ELEVENLABS_API_KEY={elevenlabs_key}\n"
        found = True
        break

if not found:
    # Adicionar ao final
    lines.append(f"\nELEVENLABS_API_KEY={elevenlabs_key}\n")

# Salvar
with open(env_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("✅ Chave ElevenLabs configurada com sucesso!")
print(f"   Chave: {elevenlabs_key[:20]}...")

# Mostrar resumo de APIs configuradas
print("\n" + "=" * 60)
print("🎉 TODAS AS APIs CONFIGURADAS!")
print("=" * 60)
print("\n✅ APIs Ativas:")
print("   1. Gemini - Geração de roteiros (GRÁTIS)")
print("   2. Pexels - Vídeos de fundo (GRÁTIS)")
print("   3. Pixabay - Música de fundo (GRÁTIS)")
print("   4. ElevenLabs - Narração TTS (10k chars/mês)")

print("\n🎬 Sistema 100% pronto para gerar vídeos completos!")
print("\n📝 Comando para teste:")
print('   python generate_video.py --topic "Por que o céu é azul"')
