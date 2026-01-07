"""
Script para adicionar TTS_PROVIDER ao .env priorizando ElevenLabs
"""

from pathlib import Path

env_path = Path(__file__).parent / ".env"

print("📝 Atualizando TTS_PROVIDER no .env...")

# Ler arquivo
with open(env_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Atualizar ou adicionar TTS_PROVIDER
found = False

for i, line in enumerate(lines):
    if line.startswith("TTS_PROVIDER="):
        lines[i] = "TTS_PROVIDER=elevenlabs_free,google,elevenlabs_paid\n"
        found = True
        print("✅ TTS_PROVIDER atualizado")
        break

if not found:
    # Adicionar
    lines.append("\nTTS_PROVIDER=elevenlabs_free,google,elevenlabs_paid\n")
    print("✅ TTS_PROVIDER adicionado")

# Salvar
with open(env_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("✅ Configuração atualizada. ElevenLabs será tentado primeiro!")
