# Guia de Instalação e Primeiros Passos

## 1. Configuração Inicial

### Clonar/Navegar para o Projeto
```bash
cd C:\Users\Nitro\.gemini\antigravity\scratch\video-automation
```

### Criar Ambiente Virtual
```bash
python -m venv venv
venv\Scripts\activate
```

### Instalar Dependências
```bash
pip install -r requirements.txt
```

## 2. Configurar Chaves de API

### Copiar Template
```bash
copy .env.example .env
```

### Editar .env e Adicionar Chaves

**OPÇÃO 1: Modo Completamente Gratuito**
```env
# Google Gemini (GRÁTIS - 1500 requests/dia)
GEMINI_API_KEY=sua_chave_aqui
# Obter em: https://makersuite.google.com/app/apikey

# Google TTS (GRÁTIS - 4M chars/mês)
GOOGLE_TTS_API_KEY=sua_chave_aqui
# Obter em: https://console.cloud.google.com/

# Pexels (GRÁTIS - ilimitado)
PEXELS_API_KEY=sua_chave_aqui
# Obter em: https://www.pexels.com/api/

# Pixabay (GRÁTIS)
PIXABAY_API_KEY=sua_chave_aqui
# Obter em: https://pixabay.com/api/docs/

# Configurações
ECONOMY_MODE=true
CACHE_AGGRESSIVE=true
```

**OPÇÃO 2: Modo Premium (Qualidade Máxima)**
```env
# Adicione também:
OPENAI_API_KEY=sk-...  # GPT-4o para roteiros premium
ELEVENLABS_API_KEY=... # Narração ultra-realista
```

## 3. Instalar FFmpeg

### Windows (via Chocolatey)
```bash
choco install ffmpeg
```

### Ou Download Manual
1. Baixe de: https://ffmpeg.org/download.html
2. Extraia para C:\ffmpeg
3. Adicione C:\ffmpeg\bin ao PATH do Windows

## 4. Testar Sistema

```bash
python main.py --test-mode
```

**Saída Esperada:**
```
🎬 Video Automation System
==================================================

✅ Budget OK

🧪 Modo de teste ativado...
📁 Diretórios: C:\...\output
💰 Modo economia: True
🎯 Nicho padrão: curiosidades_obscuras

📊 Budget Report:
   Total gasto este mês: $0.00
   Vídeos gerados: 0
   Custo por vídeo: $0.00
   Budget restante: $50.00

✅ Sistema configurado corretamente!
```

## 5. Gerar Primeiro Vídeo (Modo Manual)

```bash
python main.py --topic "Fato curioso sobre o espaço"
```

## 6. Próximos Passos

- Configure YouTube/TikTok APIs para upload automático
- Explore o dashboard web: `python dashboard/app.py`
- Rode em modo batch: `python batch_producer.py --count 5`

## Solução de Problemas Comuns

### Erro: "Module not found"
```bash
pip install --upgrade -r requirements.txt
```

### Erro: "FFmpeg not found"
```bash
# Verifique instalação
ffmpeg -version

# Se não funcionar, reinstale
choco install ffmpeg
```

### Erro: "API key not valid"
Verifique:
1. Chave está correta no .env
2. Sem espaços extras
3. API está ativada no console da plataforma

## Estrutura de Comandos

```bash
# Teste básico
python main.py --test-mode

# Gerar 1 vídeo
python main.py --topic "Seu tópico"

# Produção em lote
python batch_producer.py --count 10

# Dashboard web
python dashboard/app.py

# Modo autopilot (24/7)
python autopilot.py --goal maximize_revenue
```
