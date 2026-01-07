"""
Script para adicionar chave Pixabay ao .env
"""

import os
from pathlib import Path

env_path = Path(__file__).parent / ".env"

print("📝 Adicionando chave Pixabay ao .env...")

# Ler arquivo atual
if env_path.exists():
    with open(env_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
else:
    print("❌ Arquivo .env não encontrado")
    exit(1)

# Atualizar ou adicionar chave Pixabay
pixabay_key = "54085335-5ae96c260ec78c012cb4300da"
found = False

for i, line in enumerate(lines):
    if line.startswith("PIXABAY_API_KEY="):
        lines[i] = f"PIXABAY_API_KEY={pixabay_key}\n"
        found = True
        break

if not found:
    # Adicionar ao final
    lines.append(f"\nPIXABAY_API_KEY={pixabay_key}\n")

# Salvar
with open(env_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("✅ Chave Pixabay configurada com sucesso!")
print(f"   Chave: {pixabay_key[:20]}...")
