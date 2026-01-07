"""
Sistema de configurações persistentes para o dashboard.
Armazena configurações de nicho, contas de upload, preferências.
"""

import json
from pathlib import Path
from typing import Dict, Any

class ConfigManager:
    """Gerencia configurações do sistema."""
    
    def __init__(self, config_file: Path = None):
        if config_file is None:
            config_file = Path("data/settings.json")
        
        self.config_file = config_file
        self.config_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Load or create config
        self.config = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """Carrega configurações do arquivo."""
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                return self._get_default_config()
        return self._get_default_config()
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Retorna configurações padrão."""
        return {
            "niche": {
                "category": "Curiosidades",
                "topics": [
                    "Ciência",
                    "História",
                    "Espaço",
                    "Natureza",
                    "Tecnologia"
                ],
                "custom_topics": []
            },
            "upload": {
                "youtube": {
                    "enabled": False,
                    "channel_id": "",
                    "client_secrets_path": ""
                },
                "tiktok": {
                    "enabled": False,
                    "username": "",
                    "session_id": ""
                }
            },
            "generation": {
                "videos_per_day": 2,
                "schedule_times": ["18:00", "21:00"],
                "auto_upload": False,
                "language": "pt-BR"
            }
        }
    
    def save_config(self):
        """Salva configurações no arquivo."""
        with open(self.config_file, 'w', encoding='utf-8') as f:
            json.dump(self.config, f, indent=2, ensure_ascii=False)
    
    def get(self, section: str, key: str = None, default=None):
        """Obtém configuração."""
        if key is None:
            return self.config.get(section, default)
        return self.config.get(section, {}).get(key, default)
    
    def set(self, section: str, key: str, value: Any):
        """Define configuração."""
        if section not in self.config:
            self.config[section] = {}
        self.config[section][key] = value
        self.save_config()
    
    def update_section(self, section: str, data: Dict[str, Any]):
        """Atualiza seção completa."""
        if section not in self.config:
            self.config[section] = {}
        self.config[section].update(data)
        self.save_config()

# Global instance
config_manager = ConfigManager()
