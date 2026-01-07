# HTML template for settings page

SETTINGS_HTML = """
<!DOCTYPE html>
<html>
<head>
    <title>Configurações - Video Automation</title>
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
        .container { max-width: 1000px; margin: 0 auto; }
        h1 {
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .card {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 20px;
        }
        h2 {
            font-size: 1.5em;
            margin-bottom: 20px;
            border-bottom: 2px solid rgba(255,255,255,0.3);
            padding-bottom: 10px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
        }
        input[type="text"],
        input[type="number"],
        input[type="time"],
        select,
        textarea {
            width: 100%;
            padding: 12px;
            border-radius: 8px;
            border: 2px solid rgba(255,255,255,0.2);
            background: rgba(0,0,0,0.2);
            color: #fff;
            font-size: 1em;
            transition: all 0.3s;
        }
        input[type="text"]:focus,
        input[type="number"]:focus,
        input[type="time"]:focus,
        select:focus,
        textarea:focus {
            outline: none;
            border-color: rgba(255,255,255,0.5);
            background: rgba(0,0,0,0.3);
        }
        input::placeholder,
        textarea::placeholder {
            color: rgba(255,255,255,0.5);
        }
        select option {
            background: #667eea;
            color: #fff;
        }
        input[type="checkbox"] {
            width: 20px;
            height: 20px;
            margin-right: 10px;
        }
        textarea {
            min-height: 100px;
            resize: vertical;
        }
        .checkbox-label {
            display: flex;
            align-items: center;
            cursor: pointer;
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
        .save-btn {
            background: #4CAF50;
            border-color: #45a049;
        }
        .save-btn:hover {
            background: #45a049;
        }
        .btn-group {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 30px;
        }
        .success-msg {
            background: #4CAF50;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 20px;
            display: none;
        }
        .info-text {
            font-size: 0.9em;
            opacity: 0.8;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>⚙️ Configurações</h1>
        
        <div class="success-msg" id="successMsg">
            ✅ Configurações salvas com sucesso!
        </div>
        
        <form id="settingsForm">
            <!-- Nicho -->
            <div class="card">
                <h2>🎯 Nicho de Vídeos</h2>
                
                <div class="form-group">
                    <label for="category">Categoria Principal:</label>
                    <select id="category" name="category">
                        <option value="Curiosidades">Curiosidades</option>
                        <option value="Educação">Educação</option>
                        <option value="Entretenimento">Entretenimento</option>
                        <option value="Motivação">Motivação</option>
                        <option value="Tecnologia">Tecnologia</option>
                        <option value="Negócios">Negócios</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="topics">Tópicos Personalizados (um por linha):</label>
                    <textarea id="topics" name="topics" placeholder="Ciência
História  
Espaço
Natureza">{{ config.niche.custom_topics|join('
') }}</textarea>
                    <div class="info-text">Digite tópicos específicos que você quer focar</div>
                </div>
            </div>
            
            <!-- YouTube -->
            <div class="card">
                <h2>📺 YouTube</h2>
                
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="youtube_enabled" name="youtube_enabled" {% if config.upload.youtube.enabled %}checked{% endif %}>
                        Habilitar upload automático
                    </label>
                </div>
                
                <div class="form-group">
                    <label for="youtube_channel">ID do Canal:</label>
                    <input type="text" id="youtube_channel" name="youtube_channel" value="{{ config.upload.youtube.channel_id }}" placeholder="UCxxxxxxxxxxxxxxxxxx">
                </div>
                
                <div class="form-group">
                    <label for="youtube_secrets">Caminho do client_secrets.json:</label>
                    <input type="text" id="youtube_secrets" name="youtube_secrets" value="{{ config.upload.youtube.client_secrets_path }}" placeholder="C:/path/to/client_secrets.json">
                    <div class="info-text">Arquivo de credenciais da API do YouTube</div>
                </div>
            </div>
            
            <!-- TikTok -->
            <div class="card">
                <h2>🎵 TikTok</h2>
                
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="tiktok_enabled" name="tiktok_enabled" {% if config.upload.tiktok.enabled %}checked{% endif %}>
                        Habilitar upload automático
                    </label>
                </div>
                
                <div class="form-group">
                    <label for="tiktok_username">Nome de usuário:</label>
                    <input type="text" id="tiktok_username" name="tiktok_username" value="{{ config.upload.tiktok.username }}" placeholder="@seunome">
                </div>
                
                <div class="form-group">
                    <label for="tiktok_session">Session ID:</label>
                    <input type="text" id="tiktok_session" name="tiktok_session" value="{{ config.upload.tiktok.session_id }}" placeholder="sessionid=...">
                    <div class="info-text">Cookie de autenticação do TikTok</div>
                </div>
            </div>
            
            <!-- Geração -->
            <div class="card">
                <h2>🎬 Preferências de Geração</h2>
                
                <div class="form-group">
                    <label for="videos_per_day">Vídeos por dia:</label>
                    <input type="number" id="videos_per_day" name="videos_per_day" value="{{ config.generation.videos_per_day }}" min="1" max="20">
                </div>
                
                <div class="form-group">
                    <label for="schedule_times">Horários de postagem (um por linha):</label>
                    <textarea id="schedule_times" name="schedule_times">{{ config.generation.schedule_times|join('
') }}</textarea>
                    <div class="info-text">Formato: HH:MM (ex: 18:00, 21:00)</div>
                </div>
                
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="auto_upload" name="auto_upload" {% if config.generation.auto_upload %}checked{% endif %}>
                        Upload automático após gerar
                    </label>
                </div>
                
                <div class="form-group">
                    <label for="language">Idioma:</label>
                    <select id="language" name="language">
                        <option value="pt-BR" {% if config.generation.language == 'pt-BR' %}selected{% endif %}>Português (Brasil)</option>
                        <option value="en-US" {% if config.generation.language == 'en-US' %}selected{% endif %}>English (US)</option>
                        <option value="es-ES" {% if config.generation.language == 'es-ES' %}selected{% endif %}>Español</option>
                    </select>
                </div>
            </div>
            
            <div class="btn-group">
                <button type="button" onclick="window.location.href='/'" class="back-btn">⬅️ Voltar</button>
                <button type="submit" class="save-btn">💾 Salvar Configurações</button>
            </div>
        </form>
    </div>
    
    <script>
        document.getElementById('settingsForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = {};
            
            // Processa campos de texto simples
            for (const [key, value] of formData.entries()) {
                if (!key.includes('_')) {
                    data[key] = value;
                }
            }
            
            // Processa checkboxes
            data.youtube_enabled = document.getElementById('youtube_enabled').checked;
            data.tiktok_enabled = document.getElementById('tiktok_enabled').checked;
            data.auto_upload = document.getElementById('auto_upload').checked;
            
            // Processa arrays
            data.topics = document.getElementById('topics').value.split('\\n').filter(t => t.trim());
            data.schedule_times = document.getElementById('schedule_times').value.split('\\n').filter(t => t.trim());
            
            try {
                const response = await fetch('/settings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    document.getElementById('successMsg').style.display = 'block';
                    setTimeout(() => {
                        document.getElementById('successMsg').style.display = 'none';
                    }, 3000);
                }
            } catch (error) {
                alert('Erro ao salvar configurações: ' + error);
            }
        });
    </script>
</body>
</html>
"""
