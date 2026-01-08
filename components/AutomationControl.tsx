import React, { useState, useEffect } from 'react';
import {
    Bot,
    Play,
    Pause,
    Settings,
    TrendingUp,
    CheckCircle2,
    Clock,
    Zap,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import { AutomationService } from '../services/automationService';
import { TrendingTopicsService } from '../services/trendingTopicsService';

const automationService = new AutomationService();
const trendingService = new TrendingTopicsService();

export const AutomationControl: React.FC = () => {
    const [config, setConfig] = useState(automationService.getConfig());
    const [queue, setQueue] = useState(automationService.getQueue());
    const [isGenerating, setIsGenerating] = useState(false);
    const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

    useEffect(() => {
        // Refresh queue every 10 seconds
        const interval = setInterval(() => {
            setQueue(automationService.getQueue());
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const handleToggleAutomation = () => {
        const newEnabled = !config.enabled;
        automationService.saveConfig({ enabled: newEnabled });
        setConfig({ ...config, enabled: newEnabled });
    };

    const handleToggleAutoApprove = () => {
        const newAutoApprove = !config.autoApprove;
        automationService.saveConfig({ autoApprove: newAutoApprove });
        setConfig({ ...config, autoApprove: newAutoApprove });
    };

    const handleGenerateNow = async () => {
        setIsGenerating(true);
        try {
            await automationService.generateVideoAutomatically();
            setLastGenerated(new Date());
            setQueue(automationService.getQueue());
        } catch (error) {
            console.error('Failed to generate video:', error);
            alert('Erro ao gerar vídeo. Veja o console para detalhes.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleProcessQueue = async () => {
        try {
            await automationService.processQueue();
            setQueue(automationService.getQueue());
        } catch (error) {
            console.error('Failed to process queue:', error);
        }
    };

    const pendingCount = queue.filter(j => j.status === 'pending' || j.status === 'generating').length;
    const readyCount = queue.filter(j => j.status === 'ready').length;
    const uploadedCount = queue.filter(j => j.status === 'uploaded').length;

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/10 border border-purple-500/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-purple-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-purple-600/20">
                        <Bot size={48} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Automação Inteligente</h2>
                        <p className="text-zinc-400">IA gera vídeos virais automaticamente</p>
                        {config.enabled && (
                            <div className="mt-2 flex items-center gap-2 text-green-500 text-xs font-bold bg-green-500/10 px-3 py-1 rounded-full w-fit">
                                <CheckCircle2 size={12} /> ATIVA - Gerando 2x/dia
                            </div>
                        )}
                    </div>
                </div>
                <button
                    onClick={handleToggleAutomation}
                    className={`px-8 py-4 rounded-2xl font-bold transition-all transform active:scale-95 ${config.enabled
                            ? 'bg-zinc-800 text-zinc-400 hover:bg-red-600/20 hover:text-red-500'
                            : 'bg-white text-black hover:bg-zinc-200 shadow-lg'
                        }`}
                >
                    {config.enabled ? (
                        <>
                            <Pause className="inline mr-2" size={18} />
                            Pausar Automação
                        </>
                    ) : (
                        <>
                            <Play className="inline mr-2" size={18} />
                            Ativar Automação
                        </>
                    )}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                    <p className="text-zinc-500 text-xs mb-1">Gerando</p>
                    <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                    <p className="text-zinc-500 text-xs mb-1">Prontos</p>
                    <p className="text-2xl font-bold text-green-500">{readyCount}</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                    <p className="text-zinc-500 text-xs mb-1">Publicados</p>
                    <p className="text-2xl font-bold text-blue-500">{uploadedCount}</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                    <p className="text-zinc-500 text-xs mb-1">Total na Fila</p>
                    <p className="text-2xl font-bold">{queue.length}</p>
                </div>
            </div>

            {/* Settings */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-6 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <Settings className="text-purple-500" size={20} />
                    <h3 className="font-bold">Configurações de Automação</h3>
                </div>

                {/* Auto Approve */}
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-semibold text-sm">Aprovação Automática</h4>
                        <p className="text-zinc-500 text-xs">Postar vídeos automaticamente sem revisão</p>
                    </div>
                    <button
                        onClick={handleToggleAutoApprove}
                        className={`w-12 h-6 rounded-full transition-all relative ${config.autoApprove ? 'bg-purple-600' : 'bg-zinc-800'
                            }`}
                    >
                        <div
                            className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${config.autoApprove ? 'left-7' : 'left-1'
                                }`}
                        />
                    </button>
                </div>

                {/* Niche */}
                <div className="space-y-2">
                    <label className="text-xs text-zinc-500 font-bold uppercase">Nicho (Opcional)</label>
                    <input
                        type="text"
                        value={config.niche || ''}
                        onChange={(e) => {
                            automationService.saveConfig({ niche: e.target.value || undefined });
                            setConfig({ ...config, niche: e.target.value || undefined });
                        }}
                        placeholder="Ex: tecnologia, ciência, curiosidades..."
                        className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-600"
                    />
                    <p className="text-xs text-zinc-600">
                        Deixe vazio para temas gerais ou especifique um nicho
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="grid md:grid-cols-2 gap-4">
                <button
                    onClick={handleGenerateNow}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 py-6 rounded-2xl font-bold text-lg shadow-xl shadow-purple-600/20 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]"
                >
                    {isGenerating ? (
                        <>
                            <RefreshCw className="animate-spin" size={20} />
                            Gerando Vídeo...
                        </>
                    ) : (
                        <>
                            <Zap size={20} />
                            Gerar Vídeo Agora
                        </>
                    )}
                </button>

                <button
                    onClick={handleProcessQueue}
                    disabled={readyCount === 0}
                    className="bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-700 border border-zinc-700 py-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]"
                >
                    <TrendingUp size={20} />
                    Publicar Fila ({readyCount})
                </button>
            </div>

            {/* Schedule Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                    <Clock className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-sm space-y-2">
                        <p className="font-semibold text-blue-400">Horários Automáticos (Vercel Cron)</p>
                        <ul className="list-disc list-inside space-y-1 text-zinc-400">
                            <li>12:00 - Geração e postagem automática</li>
                            <li>18:00 - Geração e postagem automática</li>
                        </ul>
                        <p className="text-zinc-500 text-xs mt-2">
                            {config.autoApprove
                                ? '✅ Vídeos serão postados automaticamente'
                                : '⏳ Vídeos aguardarão aprovação manual'}
                        </p>
                    </div>
                </div>
            </div>

            {lastGenerated && (
                <div className="text-center text-zinc-500 text-sm">
                    Último vídeo gerado: {lastGenerated.toLocaleString('pt-BR')}
                </div>
            )}
        </div>
    );
};
