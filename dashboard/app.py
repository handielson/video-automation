"""
Dashboard simples para visualizar componentes gerados.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from flask import Flask, render_template_string, send_from_directory, jsonify
    FLASK_AVAILABLE = True
except ImportError:
    FLASK_AVAILABLE = False
    print("❌ Flask não instalado. Execute: pip install flask")
    sys.exit(1)

from modules.budget_controller import budget
from modules.topic_generator import topic_generator
from config.settings import settings

app = Flask(__name__)

DASHBOARD_HTML = """
<!DOCTYPE html>
<html>
<head>
    <title>Video Automation Dashboard</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            padding: 20px;
            min-height: 100vh;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        h1 {
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .card {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }
        .card h2 {
            font-size: 1.2em;
            margin-bottom: 15px;
            opacity: 0.9;
        }
        .card .value {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .card .label {
            opacity: 0.7;
            font-size: 0.9em;
        }
        .files-section {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 30px;
            margin-top: 30px;
        }
        .files-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .file-item {
            background: rgba(255,255,255,0.1);
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
        }
        .file-item:hover {
            background: rgba(255,255,255,0.2);
            transform: translateY(-3px);
        }
        .file-icon {
            font-size: 3em;
            margin-bottom: 10px;
        }
        .file-name {
            font-size: 0.8em;
            word-break: break-all;
            margin-bottom: 5px;
        }
        .file-size {
            font-size: 0.7em;
            opacity: 0.7;
        }
        .file-topic {
            font-size: 0.75em;
            opacity: 0.85;
            margin-top: 5px;
            font-style: italic;
        }
        .status {
            text-align: center;
            padding: 20px;
            font-size: 1.5em;
        }
        button {
            background: rgba(255,255,255,0.2);
            border: 2px solid rgba(255,255,255,0.3);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1em;
            margin: 5px;
            transition: all 0.3s;
        }
        button:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
        }
        .empty-state {
            text-align: center;
            padding: 40px;
            opacity: 0.6;
        }
        .latest-badge {
            background: #4CAF50;
            padding: 3px 8px;
            border-radius: 5px;
            font-size: 0.7em;
            margin-left: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎬 Video Automation Dashboard</h1>
        
        <div class="cards">
            <div class="card">
                <h2>Vídeos Gerados</h2>
                <div class="value" id="videos">{{ stats.videos }}</div>
                <div class="label">Este mês</div>
            </div>
            
            <div class="card">
                <h2>Narrações</h2>
                <div class="value" id="narrations">{{ stats.narrations }}</div>
                <div class="label">Arquivos de áudio</div>
            </div>
            
            <div class="card">
                <h2>Vídeos de Fundo</h2>
                <div class="value" id="backgrounds">{{ stats.backgrounds }}</div>
                <div class="label">Do Pexels</div>
            </div>
            
            <div class="card">
                <h2>Custo Total</h2>
                <div class="value" id="cost">${{ "%.2f"|format(stats.cost) }}</div>
                <div class="label">Este mês</div>
            </div>
            
            <div class="card">
                <h2>Budget Restante</h2>
                <div class="value" id="remaining">${{ "%.2f"|format(stats.remaining) }}</div>
                <div class="label">De $50.00</div>
            </div>
        </div>
        
        <div class="files-section">
            <h2>🔊 Narrações Geradas ({{ stats.narrations }})</h2>
            {% if audio_files %}
            <div class="files-grid">
                {% for file in audio_files %}
                <div class="file-item" onclick="window.open('/audio/{{ file.name }}')">
                    <div class="file-icon">🎤</div>
                    <div class="file-name">{{ file.name[:20] }}...</div>
                    <div class="file-size">{{ "%.1f"|format(file.size_mb) }} MB</div>
                </div>
                {% endfor %}
            </div>
            {% else %}
            <div class="empty-state">Nenhuma narração gerada ainda</div>
            {% endif %}
        </div>
        
        <div class="files-section">
            <h2>🎥 Vídeos de Fundo ({{ stats.backgrounds }})</h2>
            {% if video_files %}
            <div class="files-grid">
                {% for file in video_files %}
                <div class="file-item" onclick="window.open('/video/{{ file.name }}')">
                    <div class="file-icon">🎬</div>
                    <div class="file-name">{{ file.name }}</div>
                    <div class="file-size">{{ "%.1f"|format(file.size_mb) }} MB</div>
                </div>
                {% endfor %}
            </div>
            {% else %}
            <div class="empty-state">Nenhum vídeo baixado ainda</div>
            {% endif %}
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <button onclick="location.reload()">🔄 Atualizar</button>
            <button onclick="window.open('/settings')">⚙️ Configurações</button>
            <button onclick="window.open('/docs')">📚 Documentação</button>
        </div>
    </div>
</body>
</html>
"""

@app.route('/')
def index():
    """Dashboard home page."""
    # Get generated videos (MP4 files in output)
    output_dir = settings.OUTPUT_DIR
    generated_videos = []
    if output_dir.exists():
        for f in sorted(output_dir.glob("*.mp4"), key=lambda x: x.stat().st_mtime, reverse=True):
            if f.stat().st_size > 0:  # Skip empty files
                # Try to load metadata
                metadata_file = f.with_suffix('.json')
                topic = "Sem título"
                if metadata_file.exists():
                    try:
                        import json
                        with open(metadata_file, 'r', encoding='utf-8') as mf:
                            metadata = json.load(mf)
                            topic = metadata.get('script', {}).get('hook', 'Sem título')[:60]
                    except:
                        pass
                
                generated_videos.append({
                    "name": f.name,
                    "topic": topic,
                    "size_mb": f.stat().st_size / 1024 / 1024,
                    "date": f.stat().st_mtime
                })
    
    # Get audio files
    audio_dir = settings.DATA_DIR / "audio_cache"
    audio_files = []
    if audio_dir.exists():
        for f in audio_dir.glob("*.mp3"):
            audio_files.append({
                "name": f.name,
                "size_mb": f.stat().st_size / 1024 / 1024
            })
    
    # Get video files
    video_dir = settings.TEMP_DIR / "videos"
    video_files = []
    if video_dir.exists():
        for f in video_dir.glob("*.mp4"):
            if f.stat().st_size > 1000:  # Skip placeholders
                video_files.append({
                    "name": f.name,
                    "size_mb": f.stat().st_size / 1024 / 1024
                })
    
    # Get stats
    report = budget.get_report()
    
    stats = {
        "videos": len(generated_videos),
        "narrations": len(audio_files),
        "backgrounds": len(video_files),
        "cost": report["total_cost"],
        "remaining": report["remaining_budget"]
    }
    
    return render_template_string(DASHBOARD_HTML, 
                                 stats=stats, 
                                 generated_videos=generated_videos,
                                 audio_files=audio_files, 
                                 video_files=video_files)

@app.route('/audio/<filename>')
def serve_audio(filename):
    """Serve audio files."""
    audio_dir = settings.DATA_DIR / "audio_cache"
    return send_from_directory(audio_dir, filename)

@app.route('/video/<filename>')
def serve_video(filename):
    """Serve video files."""
    video_dir = settings.TEMP_DIR / "videos"
    return send_from_directory(video_dir, filename)

@app.route('/output/<filename>')
def serve_output_video(filename):
    """Serve generated output videos."""
    output_dir = settings.OUTPUT_DIR
    return send_from_directory(output_dir, filename)

@app.route('/docs')
def docs():
    """Documentation page."""
    docs_html = """
<!DOCTYPE html>
<html>
<head>
    <title>Documentação - Video Automation</title>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            padding: 40px 20px;
        }
        .container { max-width: 900px; margin: 0 auto; }
        .card {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 20px;
        }
        h1 { font-size: 2.5em; margin-bottom: 30px; text-align: center; }
        h2 { font-size: 1.8em; margin: 20px 0 15px 0; border-bottom: 2px solid rgba(255,255,255,0.3); padding-bottom: 10px; }
        h3 { font-size: 1.3em; margin: 15px 0 10px 0; }
        code {
            background: rgba(0,0,0,0.3);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Consolas', monospace;
        }
        pre {
            background: rgba(0,0,0,0.3);
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 10px 0;
        }
        ul { margin-left: 20px; line-height: 1.8; }
        a { color: #ffd700; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .back-btn {
            background: rgba(255,255,255,0.2);
            border: 2px solid rgba(255,255,255,0.3);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1em;
            text-decoration: none;
            display: inline-block;
        }
        .back-btn:hover { background: rgba(255,255,255,0.3); }
    </style>
</head>
<body>
    <div class="container">
        <h1>📚 Documentação do Sistema</h1>
        
        <div class="card">
            <h2>🚀 Como Usar</h2>
            <h3>Gerar um vídeo:</h3>
            <pre><code>python generate_video.py --topic "Sua curiosidade incrível"</code></pre>
            
            <h3>Gerar múltiplos vídeos:</h3>
            <pre><code>python batch_producer.py --count 10</code></pre>
            
            <h3>Modo automático 24/7:</h3>
            <pre><code>python autopilot.py --videos-per-day 2</code></pre>
        </div>
        
        <div class="card">
            <h2>📁 Estrutura de Arquivos</h2>
            <ul>
                <li><code>output/</code> - Vídeos MP4 finais gerados</li>
                <li><code>data/audio_cache/</code> - Narrações em MP3</li>
                <li><code>assets/temp/videos/</code> - Vídeos de fundo do Pexels</li>
                <li><code>assets/music/</code> - Músicas de fundo do Pixabay</li>
            </ul>
        </div>
        
        <div class="card">
            <h2>💰 Custos e Limites</h2>
            <ul>
                <li><strong>Gemini API:</strong> GRÁTIS (1500 req/dia = ~1500 vídeos/dia)</li>
                <li><strong>ElevenLabs:</strong> 10k chars/mês grátis = ~20-30 vídeos/mês</li>
                <li><strong>Pexels:</strong> GRÁTIS ilimitado</li>
                <li><strong>Pixabay:</strong> GRÁTIS ilimitado</li>
            </ul>
            <p style="margin-top: 15px;"><strong>Gargalo:</strong> ElevenLabs Free Tier (solução: upgrade $5/mês ou usar gTTS)</p>
        </div>
        
        <div class="card">
            <h2>⚙️ APIs Configuradas</h2>
            <ul>
                <li>✅ Google Gemini - Roteiros com IA</li>
                <li>✅ ElevenLabs - Narração profissional</li>
                <li>✅ Pexels - Vídeos de fundo</li>
                <li>✅ Pixabay - Música de fundo</li>
            </ul>
        </div>
        
        <div class="card">
            <h2>🔧 Arquivos de Configuração</h2>
            <ul>
                <li><code>.env</code> - Configuração de API keys (NÃO compartilhe!)</li>
                <li><code>config/settings.py</code> - Configurações do sistema</li>
                <li><code>config/prompts.py</code> - Templates de prompts de IA</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="/" class="back-btn">⬅️ Voltar ao Dashboard</a>
        </div>
    </div>
</body>
</html>
    """
    return docs_html

@app.route('/settings', methods=['GET', 'POST'])
def settings_page():
    """Settings page."""
    from modules.config_manager import config_manager
    from dashboard.settings_template import SETTINGS_HTML
    from flask import request
    
    if request.method == 'POST':
        # Salvar configurações
        data = request.get_json()
        
        # Atualizar nicho
        config_manager.update_section('niche', {
            'category': data.get('category', 'Curiosidades'),
            'custom_topics': data.get('topics', [])
        })
        
        # Atualizar YouTube
        config_manager.update_section('upload', {
            'youtube': {
                'enabled': data.get('youtube_enabled', False),
                'channel_id': data.get('youtube_channel', ''),
                'client_secrets_path': data.get('youtube_secrets', '')
            },
            'tiktok': {
                'enabled': data.get('tiktok_enabled', False),
                'username': data.get('tiktok_username', ''),
                'session_id': data.get('tiktok_session', '')
            }
        })
        
        # Atualizar preferências de geração
        config_manager.update_section('generation', {
            'videos_per_day': int(data.get('videos_per_day', 2)),
            'schedule_times': data.get('schedule_times', []),
            'auto_upload': data.get('auto_upload', False),
            'language': data.get('language', 'pt-BR')
        })
        
        return {'status': 'success'}
    
    # GET: Mostrar formulário
    config = config_manager.config
    return render_template_string(SETTINGS_HTML, config=config)

if __name__ == "__main__":
    if not FLASK_AVAILABLE:
        print("❌ Flask não instalado")
        sys.exit(1)
    
    print("=" * 60)
    print("🎯 DASHBOARD WEB")
    print("=" * 60)
    print("\n✅ Dashboard iniciado em: http://localhost:5000")
    print("   Pressione Ctrl+C para parar\n")
    
    app.run(host='0.0.0.0', port=5000, debug=False)
