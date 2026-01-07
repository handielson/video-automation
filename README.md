# 🎬 Sistema de Automação de Vídeos Curtos

Sistema Python 100% automático para criar vídeos verticais (9:16) para YouTube Shorts e TikTok no nicho de curiosidades e fatos obscuros.

## 🚀 Início Rápido

### 1. Instalação Local (Windows)

```bash
# 1. Clone/baixe o projeto
cd video-automation

# 2. Crie ambiente virtual
python -m venv venv
venv\Scripts\activate

# 3. Instale dependências
pip install -r requirements.txt

# 4. Configure variáveis de ambiente
copy .env.example .env
# Edite .env com suas chaves de API
```

### 2. Configurar Chaves de API

Edite o arquivo `.env` e adicione suas chaves:

**Mínimo Necessário (Modo Econômico):**
- `GEMINI_API_KEY` - [Google AI Studio](https://makersuite.google.com/app/apikey) (GRÁTIS)
- `GOOGLE_TTS_API_KEY` - [Google Cloud](https://console.cloud.google.com/) (Free tier generoso)
- `PEXELS_API_KEY` - [Pexels](https://www.pexels.com/api/) (GRÁTIS)
- `PIXABAY_API_KEY` - [Pixabay](https://pixabay.com/api/docs/) (GRÁTIS)

**Opcional (Qualidade Premium):**
- `OPENAI_API_KEY` - Para GPT-4o (melhor qualidade de roteiros)
- `ELEVENLABS_API_KEY` - Para narração ultra-realista

### 3. Instalar FFmpeg

FFmpeg é necessário para edição de vídeo com MoviePy.

**Windows:**
```bash
# Opção 1: Via Chocolatey
choco install ffmpeg

# Opção 2: Download manual
# 1. Baixe de https://ffmpeg.org/download.html
# 2. Extraia e adicione ao PATH do sistema
```

### 4. Testar o Sistema

```bash
# Teste básico (cria 1 vídeo)
python main.py --test-mode

# Ver ajuda
python main.py --help
```

## 📊 Modos de Operação

### Modo 1: Vídeo Único
```bash
python main.py --topic "Fato curioso sobre o espaço" --output video1.mp4
```

### Modo 2: Produção em Lote
```bash
# Criar 10 vídeos automaticamente
python batch_producer.py --count 10
```

### Modo 3: Piloto Automático (24/7)
```bash
# Rodar continuamente com otimização automática
python autopilot.py --goal maximize_revenue
```

### Modo 4: Dashboard Web
```bash
# Iniciar dashboard para visualizar métricas
python dashboard/app.py

# Acesse: http://localhost:5000
# Senha padrão: admin123 (configure no .env)
```

## 💰 Custos Estimados

### Cenário Ultra-Econômico (GRÁTIS)
- VPS Oracle Cloud (Always Free)
- Gemini 1.5 Flash (roteiros)
- Google TTS (narração)
- Pexels + Pixabay (vídeos/música)
- **Total: $0/mês** (6-7 vídeos/dia)

### Cenário Híbrido ($2-15/mês)
- Mix de APIs gratuitas + pagas
- Cache agressivo (economiza 40-60%)
- **Ilimitado, alta qualidade**

### Cenário Premium ($32-42/mês)
- GPT-4o + ElevenLabs
- Máxima qualidade
- **Ilimitado**

## 🧑 Humanização & Segurança

O sistema simula comportamento humano para evitar detecção:

✅ Randomização de horários (±15-45 min)
✅ Variação de duração (45-60s)
✅ 5+ estilos de hook rotacionados
✅ Delays naturais entre ações
✅ Limites de segurança (YouTube: 5/dia, TikTok: 3/dia)
✅ Detecção automática de shadowban

## 📁 Estrutura do Projeto

```
video-automation/
├── config/              # Configurações
│   ├── settings.py      # Variáveis de ambiente
│   └── prompts.py       # Templates GPT
├── modules/             # Módulos principais
│   ├── script_generator.py
│   ├── voice_narrator.py
│   ├── video_editor.py
│   ├── humanizer.py
│   └── ...
├── dashboard/           # Interface web
├── data/                # Bancos de dados
├── assets/              # Recursos (música, fontes)
├── output/              # Vídeos gerados
└── logs/                # Logs de execução
```

## 🔧 Comandos Úteis

```bash
# Ver status de budget
python -m modules.budget_controller

# Gerar relatório de custos
python -m modules.analytics_tracker --report

# Limpar cache
python -m modules.cache_manager --clear

# Testar APIs
python -m modules.api_tester
```

## 🐳 Deploy em VPS (Produção 24/7)

### Oracle Cloud (GRÁTIS Permanente)

```bash
# 1. Criar instância Ubuntu 22.04 (Always Free)
# 2. Conectar via SSH
ssh ubuntu@SEU_IP

# 3. Executar script de setup
wget https://raw.githubusercontent.com/YOUR_REPO/setup_vps.sh
chmod +x setup_vps.sh
./setup_vps.sh

# 4. Configurar .env
nano .env
# Cole suas chaves de API

# 5. Iniciar sistema
docker-compose up -d

# 6. Acessar dashboard
http://SEU_IP:5000
```

## ⚙️ Configurações Importantes

### .env - Principais Variáveis

```bash
# Modo Economia (usar apenas APIs gratuitas)
ECONOMY_MODE=true

# Cache agressivo (economiza 40-60% de chamadas)
CACHE_AGGRESSIVE=true

# Limites de gasto
MAX_DAILY_SPEND=5.00
MAX_MONTHLY_SPEND=50.00

# Humanização
STEALTH_MODE=false  # true para contas novas
RANDOMIZE_POST_TIME=true
MAX_UPLOADS_PER_DAY_YOUTUBE=5

# Upload automático (CUIDADO!)
AUTO_UPLOAD=false  # Configurar manu depois de testar
```

## 🆘 Solução de Problemas

### Erro: "FFmpeg not found"
```bash
# Instale FFmpeg e adicione ao PATH
choco install ffmpeg
```

### Erro: "API key not valid"
```bash
# Verifique se as chaves estão corretas no .env
# Teste individualmente cada API
python -m modules.api_tester
```

### Vídeos não aparecem no output/
```bash
# Verifique logs
tail -n 100 logs/latest.log

# Verifique permissões
chmod 777 output/
```

### Shadowban detectado
```bash
# Sistema auto-pausa por 48h
# Verifique dashboard para detalhes
# Considere ativar STEALTH_MODE=true
```

## 📈 Roadmap

- [x] Sistema base de geração de vídeos
- [x] Múltiplos provedores de API (economia)
- [x] Humanização anti-detecção
- [x] Dashboard web
- [ ] Upload automático YouTube/TikTok
- [ ] IA Advisor (sugestões de monetização)
- [ ] A/B Testing automático
- [ ] App mobile para controle remoto

## 📄 Licença e Avisos

⚠️  **IMPORTANTE:**
- Use este sistema de forma responsável
- Respeite os termos de serviço do YouTube e TikTok
- Não publique conteúdo que viole direitos autorais
- Monitore suas contas para evitar banimentos

## 💬 Suporte

Para dúvidas ou problemas:
1. Verifique os logs em `logs/`
2. Consulte a documentação no `implementation_plan.md`
3. Teste com `--test-mode` antes de produção

---

**Status do Projeto:** MVP Funcional ✅  
**Última Atualização:** Janeiro 2026  
**Versão:** 1.0.0
