#!/bin/bash
# Script de Deploy Automatizado - Video Automation VPS
# Execute: bash deploy.sh

set -e  # Para na primeira erro

echo "========================================="
echo "🚀 Deploy Automático - Video Automation"
echo "========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Atualizar sistema
echo -e "${BLUE}[1/8]${NC} Atualizando sistema..."
apt update && apt upgrade -y

# 2. Instalar dependências
echo -e "${BLUE}[2/8]${NC} Instalando Python, FFmpeg, Git..."
apt install -y python3 python3-pip python3-venv git ffmpeg screen curl

# 3. Clonar projeto
echo -e "${BLUE}[3/8]${NC} Clonando projeto do GitHub..."
cd /root
if [ -d "video-automation" ]; then
    echo "Projeto já existe, atualizando..."
    cd video-automation
    git pull
else
    git clone https://github.com/handielson/video-automation.git
    cd video-automation
fi

# 4. Criar ambiente virtual
echo -e "${BLUE}[4/8]${NC} Criando ambiente virtual Python..."
python3 -m venv venv
source venv/bin/activate

# 5. Instalar pacotes
echo -e "${BLUE}[5/8]${NC} Instalando pacotes Python..."
pip install --upgrade pip
pip install -r requirements.txt

# 6. Configurar .env
echo -e "${BLUE}[6/8]${NC} Configurando variáveis de ambiente..."
if [ ! -f ".env" ]; then
    cat > .env << 'EOL'
# Cole suas API keys aqui
GEMINI_API_KEY=
ELEVENLABS_API_KEY=
PEXELS_API_KEY=
PIXABAY_API_KEY=
EOL
    echo ""
    echo -e "${GREEN}✓${NC} Arquivo .env criado!"
    echo "⚠️  IMPORTANTE: Edite o arquivo .env e adicione suas API keys:"
    echo "   nano /root/video-automation/.env"
else
    echo -e "${GREEN}✓${NC} Arquivo .env já existe"
fi

# 7. Criar systemd services
echo -e "${BLUE}[7/8]${NC} Criando services systemd..."

# Service para Dashboard
cat > /etc/systemd/system/video-dashboard.service << 'EOL'
[Unit]
Description=Video Automation Dashboard
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/video-automation
Environment="PATH=/root/video-automation/venv/bin"
ExecStart=/root/video-automation/venv/bin/python dashboard/app.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOL

# Service para Autopilot
cat > /etc/systemd/system/video-autopilot.service << 'EOL'
[Unit]
Description=Video Automation Autopilot
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/video-automation
Environment="PATH=/root/video-automation/venv/bin"
ExecStart=/root/video-automation/venv/bin/python autopilot.py --videos-per-day 3
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOL

# 8. Configurar firewall
echo -e "${BLUE}[8/8]${NC} Configurando firewall..."
ufw allow 5000/tcp
ufw allow 22/tcp
echo "y" | ufw enable

echo ""
echo "========================================="
echo -e "${GREEN}✅ Deploy Concluído!${NC}"
echo "========================================="
echo ""
echo "📝 Próximos passos:"
echo ""
echo "1. Configure suas API keys:"
echo "   nano /root/video-automation/.env"
echo ""
echo "2. Teste a geração de vídeo:"
echo "   cd /root/video-automation"
echo "   source venv/bin/activate"
echo "   python generate_video.py --topic 'Teste VPS'"
echo ""
echo "3. Iniciar serviços 24/7:"
echo "   systemctl enable video-dashboard"
echo "   systemctl enable video-autopilot"
echo "   systemctl start video-dashboard"
echo "   systemctl start video-autopilot"
echo ""
echo "4. Acessar dashboard:"
echo "   http://161.97.161.15:5000"
echo ""
echo "5. Ver status dos serviços:"
echo "   systemctl status video-dashboard"
echo "   systemctl status video-autopilot"
echo ""
echo "6. Ver logs:"
echo "   journalctl -u video-dashboard -f"
echo "   journalctl -u video-autopilot -f"
echo ""
echo "========================================="
