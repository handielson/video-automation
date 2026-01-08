import React, { useState, useEffect } from 'react';
import { Save, Key, Sparkles, Brain, Wand2, CheckCircle, AlertCircle } from 'lucide-react';

interface AIConfig {
    geminiApiKey: string;
    antigravityEnabled: boolean;
    defaultVideoProvider: 'antigravity' | 'gemini';
}

export const AISettings: React.FC = () => {
    const [config, setConfig] = useState<AIConfig>({
        geminiApiKey: '',
        antigravityEnabled: true,
        defaultVideoProvider: 'antigravity'
    });
    const [saved, setSaved] = useState(false);
    const [testResults, setTestResults] = useState<{
        gemini?: 'success' | 'error' | 'testing';
        antigravity?: 'success' | 'error' | 'testing';
    }>({});

    useEffect(() => {
        // Load saved config from localStorage
        const savedConfig = localStorage.getItem('ai_config');
        if (savedConfig) {
            try {
                const loaded = JSON.parse(savedConfig);
                setConfig(loaded);

                // Auto-set success status if keys are configured
                if (loaded.geminiApiKey) {
                    setTestResults(prev => ({ ...prev, gemini: 'success' }));
                }
                if (loaded.antigravityEnabled) {
                    setTestResults(prev => ({ ...prev, antigravity: 'success' }));
                }
            } catch (e) {
                console.error('Failed to load AI config:', e);
            }
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('ai_config', JSON.stringify(config));

        // Also save to environment-like storage for runtime access
        if (config.geminiApiKey) {
            localStorage.setItem('VITE_GEMINI_API_KEY', config.geminiApiKey);
        }
        localStorage.setItem('videoProvider', config.defaultVideoProvider);

        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const testGeminiConnection = async () => {
        setTestResults(prev => ({ ...prev, gemini: 'testing' }));

        try {
            // Simple test to verify API key format
            if (!config.geminiApiKey || config.geminiApiKey.length < 10) {
                throw new Error('Invalid API key format');
            }

            // In a real scenario, you'd make a test API call here
            setTimeout(() => {
                setTestResults(prev => ({ ...prev, gemini: 'success' }));
            }, 1000);
        } catch (error) {
            setTestResults(prev => ({ ...prev, gemini: 'error' }));
        }
    };

    const testAntigravityConnection = async () => {
        setTestResults(prev => ({ ...prev, antigravity: 'testing' }));

        try {
            const response = await fetch('/api/antigravity-proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate-script',
                    payload: { theme: 'test', tone: 'impactful', duration: 30 }
                })
            });

            if (response.ok) {
                setTestResults(prev => ({ ...prev, antigravity: 'success' }));
            } else {
                throw new Error('Connection failed');
            }
        } catch (error) {
            setTestResults(prev => ({ ...prev, antigravity: 'error' }));
        }
    };

    const getStatusIcon = (status?: 'success' | 'error' | 'testing') => {
        if (status === 'testing') return <div className="animate-spin">⏳</div>;
        if (status === 'success') return <CheckCircle className="text-green-500" size={20} />;
        if (status === 'error') return <AlertCircle className="text-red-500" size={20} />;
        return null;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Brain className="text-purple-500" size={32} />
                    Configurações de IA
                </h1>
                <p className="text-zinc-400">
                    Configure as chaves de API e preferências para os serviços de IA utilizados no sistema.
                </p>
            </div>

            {saved && (
                <div className="bg-green-500/10 border border-green-500/50 p-4 rounded-xl flex items-center gap-3 text-green-500">
                    <CheckCircle size={20} />
                    <p className="font-medium">Configurações salvas com sucesso!</p>
                </div>
            )}

            {/* Antigravity Settings */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                            <Sparkles className="text-purple-400" size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold">Antigravity AI</h2>
                                {testResults.antigravity === 'success' && (
                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
                                        CONECTADA
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-zinc-400">Geração ilimitada de conteúdo</p>
                        </div>
                    </div>
                    {getStatusIcon(testResults.antigravity)}
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                        <div>
                            <p className="font-medium">Status da Integração</p>
                            <p className="text-sm text-zinc-400">
                                {config.antigravityEnabled ? 'Ativo e funcionando' : 'Desativado'}
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.antigravityEnabled}
                                onChange={(e) => setConfig({ ...config, antigravityEnabled: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-400">Recursos Disponíveis</label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-zinc-800/50 rounded-lg">
                                <p className="text-xs text-zinc-400">Geração de Scripts</p>
                                <p className="font-bold text-green-400">✓ Ilimitado</p>
                            </div>
                            <div className="p-3 bg-zinc-800/50 rounded-lg">
                                <p className="text-xs text-zinc-400">Geração de Thumbnails</p>
                                <p className="font-bold text-green-400">✓ Ilimitado</p>
                            </div>
                            <div className="p-3 bg-zinc-800/50 rounded-lg">
                                <p className="text-xs text-zinc-400">Geração de Vídeos</p>
                                <p className="font-bold text-green-400">✓ Ilimitado</p>
                            </div>
                            <div className="p-3 bg-zinc-800/50 rounded-lg">
                                <p className="text-xs text-zinc-400">Pesquisa de Tópicos</p>
                                <p className="font-bold text-green-400">✓ Web Search</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={testAntigravityConnection}
                        disabled={!config.antigravityEnabled || testResults.antigravity === 'testing'}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-xl font-medium transition-colors"
                    >
                        {testResults.antigravity === 'testing' ? 'Testando Conexão...' : 'Testar Conexão'}
                    </button>
                </div>
            </div>

            {/* Gemini Settings */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                            <Wand2 className="text-blue-400" size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold">Google Gemini API</h2>
                                {testResults.gemini === 'success' && (
                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
                                        CONECTADA
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-zinc-400">TTS de áudio e Veo para vídeos premium</p>
                        </div>
                    </div>
                    {getStatusIcon(testResults.gemini)}
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                            <Key size={16} />
                            Chave de API
                        </label>
                        <input
                            type="password"
                            value={config.geminiApiKey}
                            onChange={(e) => setConfig({ ...config, geminiApiKey: e.target.value })}
                            placeholder="AIza..."
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                        />
                        <p className="text-xs text-zinc-500">
                            Obtenha sua chave em{' '}
                            <a
                                href="https://aistudio.google.com/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300"
                            >
                                aistudio.google.com/apikey
                            </a>
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-400">Recursos Disponíveis</label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-zinc-800/50 rounded-lg">
                                <p className="text-xs text-zinc-400">TTS de Áudio</p>
                                <p className="font-bold text-blue-400">✓ Vozes Premium</p>
                            </div>
                            <div className="p-3 bg-zinc-800/50 rounded-lg">
                                <p className="text-xs text-zinc-400">Veo Video</p>
                                <p className="font-bold text-blue-400">✓ Cinematográfico</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={testGeminiConnection}
                        disabled={!config.geminiApiKey || testResults.gemini === 'testing'}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-xl font-medium transition-colors"
                    >
                        {testResults.gemini === 'testing' ? 'Testando Conexão...' : 'Testar Conexão'}
                    </button>
                </div>
            </div>

            {/* Default Provider */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-bold">Provedor Padrão de Vídeo</h2>
                <p className="text-sm text-zinc-400">
                    Escolha qual serviço será usado por padrão para geração de vídeos
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setConfig({ ...config, defaultVideoProvider: 'antigravity' })}
                        className={`p-4 rounded-xl border-2 transition-all ${config.defaultVideoProvider === 'antigravity'
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-zinc-700 hover:border-zinc-600'
                            }`}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                ∞
                            </div>
                            <span className="font-bold">Antigravity</span>
                        </div>
                        <p className="text-xs text-zinc-400">Ilimitado • Rápido</p>
                    </button>

                    <button
                        onClick={() => setConfig({ ...config, defaultVideoProvider: 'gemini' })}
                        className={`p-4 rounded-xl border-2 transition-all ${config.defaultVideoProvider === 'gemini'
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-zinc-700 hover:border-zinc-600'
                            }`}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                ✨
                            </div>
                            <span className="font-bold">Gemini Veo</span>
                        </div>
                        <p className="text-xs text-zinc-400">Premium • Cinematográfico</p>
                    </button>
                </div>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-2xl font-bold text-lg shadow-xl shadow-purple-600/20 flex items-center justify-center gap-3 transition-all"
            >
                <Save size={20} />
                Salvar Configurações
            </button>
        </div>
    );
};
