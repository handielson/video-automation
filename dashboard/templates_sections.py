"""
Dashboard Web - HTML Template com Vídeos Gerados
"""

VIDEOS_SECTION_HTML = """
        <div class="files-section">
            <h2>🎥 Vídeos Gerados ({{ stats.videos }})</h2>
            {% if generated_videos %}
            <div class="files-grid">
                {% for video in generated_videos %}
                <div class="file-item" onclick="window.open('/output/{{ video.name }}')">
                    <div class="file-icon">🎬</div>
                    {% if loop.index == 1 %}
                    <span class="latest-badge">MAIS RECENTE</span>
                    {% endif %}
                    <div class="file-name">{{ video.name[:25] }}...</div>
                    <div class="file-topic">"{{ video.topic }}"</div>
                    <div class="file-size">{{ "%.1f"|format(video.size_mb) }} MB</div>
                </div>
                {% endfor %}
            </div>
            {% else %}
            <div class="empty-state">
                <p>Nenhum vídeo gerado ainda</p>
                <p style="font-size: 0.8em; margin-top: 10px;">Execute: python generate_video.py --topic "Seu tema"</p>
            </div>
            {% endif %}
        </div>
"""
