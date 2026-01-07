"""
Script para adicionar chave Pexels ao .env
"""

import os
from pathlib import Path

env_path = Path(__file__).parent / ".env"

print("📝 Adicionando chave Pexels ao .env...")

# Ler arquivo atual
if env_path.exists():
    with open(env_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
else:
    print("❌ Arquivo .env não encontrado")
    exit(1)

# Atualizar ou adicionar chave Pexels
pexels_key = "FGB3zPXHQIzocS9J8AZ9z3SNxWXzDsZlOyH7SOzjdqJXpARifcT9kPwm"
found = False

for i, line in enumerate(lines):
    if line.startswith("PEXELS_API_KEY="):
        lines[i] = f"PEXELS_API_KEY={pexels_key}\n"
        found = True
        break

if not found:
    # Adicionar ao final
    lines.append(f"\nPEXELS_API_KEY={pexels_key}\n")

# Salvar
with open(env_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("✅ Chave Pexels configurada com sucesso!")
print(f"   Chave: {pexels_key[:20]}...")
