"""
Teste da API Gemini usando REST API direta (mais confiável que a biblioteca).
"""

import requests
import json
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

print("🔍 Testando API do Gemini via REST...")
print(f"📝 API Key: {api_key[:20]}..." if api_key else "❌ Não configurada")

if not api_key:
    print("\n❌ Configure GEMINI_API_KEY no arquivo .env")
    exit(1)

# Teste simples (usar modelo disponível)
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"

payload = {
    "contents": [{
        "parts": [{
            "text": "Diga apenas 'Olá! Estou funcionando!' em português"
        }]
    }]
}

try:
    print("\n🚀 Enviando requisição...")
    response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
    
    print(f"📊 Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        text = data['candidates'][0]['content']['parts'][0]['text']
        print(f"\n✅ SUCESSO! Resposta do Gemini:")
        print(f"   {text}")
        
        print("\n🎉 A API está funcionando perfeitamente!")
        print("\nAgora podemos testar a geração de roteiros...")
        
    else:
        print(f"\n❌ Erro: {response.status_code}")
        print(f"   {response.text}")
        
except Exception as e:
    print(f"\n❌ Erro: {e}")
    import traceback
    traceback.print_exc()
