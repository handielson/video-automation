"""
Lista os modelos Gemini disponíveis para a chave de API.
"""

import requests
import json
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

print("📋 Listando modelos disponíveis do Gemini...")

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

try:
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n✅ Encontrados {len(data.get('models', []))} modelos:\n")
        
        for model in data.get('models', []):
            name = model.get('name', 'N/A')
            methods = model.get('supportedGenerationMethods', [])
            
            if 'generateContent' in methods:
                print(f"   ✓ {name}")
                print(f"      Métodos: {', '.join(methods)}")
        
    else:
        print(f"❌ Erro {response.status_code}: {response.text}")
        
except Exception as e:
    print(f"❌ Erro: {e}")
