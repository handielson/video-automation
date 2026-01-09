

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Settings as SettingsIcon,
  LayoutDashboard,
  Video as VideoIcon,
  History,
  Sparkles,
  ArrowRight,
  Wand2,
  Mic,
  Clapperboard,
  Loader2,
  AlertCircle,
  Youtube,
  Instagram,
  Smartphone,
  Bot,
  Brain
} from 'lucide-react';
import { VideoProject, VideoTone, VideoDuration, VideoProvider } from './types';
import { TONE_OPTIONS, GEMINI_VOICE_OPTIONS, ELEVENLABS_VOICE_OPTIONS } from './constants';
import { GeminiService } from './services/geminiService';
import { AntigravityService } from './services/antigravityService';
import { ElevenLabsService } from './services/elevenlabsService';
import { VideoPreview } from './components/VideoPreview';
import { YoutubeSettings } from './components/YoutubeSettings';
import { InstagramSettings } from './components/InstagramSettings';
import { TiktokSettings } from './components/TiktokSettings';
import { OAuthCallback } from './components/OAuthCallback';
import { AutomationControl } from './components/AutomationControl';
import { AISettings } from './components/AISettings';

type View = 'dashboard' | 'videos' | 'history' | 'automation' | 'settings_ai' | 'settings_youtube' | 'settings_instagram' | 'settings_tiktok';

const App: React.FC = () => {
  // Check if we're on the OAuth callback route
  if (window.location.pathname === '/oauth/callback') {
    return <OAuthCallback />;
  }

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [project, setProject] = useState<VideoProject>({
    id: Math.random().toString(36).substr(2, 9),
    theme: '',
    tone: VideoTone.IMPACTFUL,
    duration: VideoDuration.S30,
    status: 'idle'
  });

  const [selectedVoice, setSelectedVoice] = useState(GEMINI_VOICE_OPTIONS[0].id);
  const [ttsProvider, setTtsProvider] = useState<'gemini' | 'elevenlabs'>(
    (localStorage.getItem('ttsProvider') as 'gemini' | 'elevenlabs') || 'gemini'
  );
  const [videoProvider, setVideoProvider] = useState<VideoProvider>(
    (localStorage.getItem('videoProvider') as VideoProvider) || 'antigravity'
  );
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Get current voice options based on TTS provider
  const currentVoiceOptions = ttsProvider === 'elevenlabs' ? ELEVENLABS_VOICE_OPTIONS : GEMINI_VOICE_OPTIONS;

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      if (window.aistudio?.hasSelectedApiKey) {
        // @ts-ignore
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      } else {
        setHasApiKey(true);
      }
    };
    checkKey();
  }, []);

  const handleGenerate = async () => {
    if (!project.theme) {
      setError("Por favor, insira um tema para o vídeo.");
      return;
    }

    // @ts-ignore
    if (window.aistudio?.hasSelectedApiKey) {
      // @ts-ignore
      const selected = await window.aistudio.hasSelectedApiKey();
      if (!selected) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        setHasApiKey(true);
      }
    }

    setError(null);
    setProject(prev => ({ ...prev, status: 'generating_script', videoProvider }));

    const antigravity = new AntigravityService();
    const gemini = new GeminiService();

    try {
      // Step 1: Generate script with Antigravity
      console.log('🤖 Using Antigravity for script generation');
      const script = await antigravity.generateScript(project.theme, project.tone, project.duration);
      setProject(prev => ({ ...prev, script, status: 'generating_thumbnail' }));

      // Step 2: Generate thumbnail with Antigravity
      console.log('🎨 Generating thumbnail with Antigravity');
      const thumbnailData = await antigravity.generateThumbnail(project.theme);
      setProject(prev => ({ ...prev, thumbnailUrl: thumbnailData.url, status: 'generating_audio' }));

      // Step 3: Generate audio with selected TTS provider
      console.log(`🎤 Generating audio with ${ttsProvider === 'elevenlabs' ? 'ElevenLabs' : 'Gemini TTS'}`);
      const fullText = `${script.hook} ${script.body} ${script.cta}`;
      let audioUrl: string;
      if (ttsProvider === 'elevenlabs') {
        const elevenlabs = new ElevenLabsService();
        audioUrl = await elevenlabs.generateAudio(fullText, selectedVoice);
      } else {
        audioUrl = await gemini.generateAudio(fullText, selectedVoice);
      }
      setProject(prev => ({ ...prev, audioUrl, status: 'generating_video' }));

      // Step 4: Generate video with selected provider
      try {
        let videoUrl: string;
        const videoPrompt = script.suggestedVisuals;
        if (videoProvider === 'antigravity') {
          console.log('🎬 Generating video with Antigravity (unlimited)');
          videoUrl = await antigravity.generateVideo(videoPrompt, '9:16');
        } else {
          console.log('🎬 Generating video with Gemini Veo (premium)');
          videoUrl = await gemini.generateVideo(videoPrompt);
        }
        setProject(prev => ({ ...prev, videoUrl, videoPrompt, status: 'ready' }));
      } catch (videoErr: any) {
        console.error("Video generation failed:", videoErr);

        // Check if it's a quota error
        if (videoErr.message?.includes("quota") || videoErr.message?.includes("429") || videoErr.message?.includes("RESOURCE_EXHAUSTED")) {
          setError("⚠️ Quota de geração de vídeo esgotada. O roteiro e áudio foram gerados com sucesso! Aguarde o reset da quota ou tente novamente mais tarde.");
        } else if (videoErr.message?.includes("Requested entity was not found")) {
          setError("❌ API key não encontrada. Por favor, configure sua API key do Gemini.");
          // @ts-ignore
          if (window.aistudio?.openSelectKey) await window.aistudio.openSelectKey();
        } else {
          setError(`❌ Erro ao gerar vídeo: ${videoErr.message}. O roteiro e áudio foram gerados com sucesso.`);
        }

        // Mark as error, not ready, so user knows something went wrong
        setProject(prev => ({ ...prev, status: 'error' }));
      }

    } catch (err: any) {
      setError(err.message || "Ocorreu um erro na geração.");
      setProject(prev => ({ ...prev, status: 'error' }));
    }
  };

  const resetProject = () => {
    setProject({
      id: Math.random().toString(36).substr(2, 9),
      theme: '',
      tone: VideoTone.IMPACTFUL,
      duration: VideoDuration.S30,
      status: 'idle'
    });
    setError(null);
  };

  const handleOpenKey = async () => {
    // @ts-ignore
    if (window.aistudio?.openSelectKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'settings_ai':
        return <AISettings />;
      case 'settings_youtube':
        return <YoutubeSettings />;
      case 'settings_instagram':
        return <InstagramSettings />;
      case 'settings_tiktok':
        return <TiktokSettings />;
      case 'automation':
        return <AutomationControl />;
      case 'videos':
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-500">
            <VideoIcon size={48} className="mb-4 opacity-20" />
            <p>Você ainda não tem vídeos gerados.</p>
          </div>
        );
      case 'history':
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-500">
            <History size={48} className="mb-4 opacity-20" />
            <p>Seu histórico de atividades aparecerá aqui.</p>
          </div>
        );
      default:
        return (
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <section className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                    <Wand2 size={16} /> 1. SOBRE O QUE É O VÍDEO?
                  </label>
                  <textarea
                    value={project.theme}
                    onChange={(e) => setProject({ ...project, theme: e.target.value })}
                    placeholder="Ex: Curiosidades sobre o espaço que vão explodir sua mente..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 outline-none transition-all h-32 resize-none text-lg"
                    disabled={project.status !== 'idle' && project.status !== 'error'}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-400">2. TOM DO VÍDEO</label>
                    <select
                      value={project.tone}
                      onChange={(e) => setProject({ ...project, tone: e.target.value as VideoTone })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500 transition-all appearance-none"
                      disabled={project.status !== 'idle'}
                    >
                      {TONE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-zinc-400">3. DURAÇÃO</label>
                      <div className="group relative">
                        <div className="text-zinc-500 hover:text-zinc-300 cursor-help text-xs bg-zinc-800 px-2 py-1 rounded-lg">
                          ℹ️
                        </div>
                        <div className="absolute right-0 top-full mt-2 w-80 bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                          <p className="text-xs font-bold text-purple-400 mb-2">📊 Recomendações:</p>
                          <div className="space-y-2 text-xs text-zinc-300">
                            <div className="flex items-start gap-2">
                              <span className="text-green-400 font-bold">30s:</span>
                              <span>Melhor retenção (85-95%). Ideal para humor e fatos rápidos.</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-purple-400 font-bold">45s:</span>
                              <span>⭐ Recomendado! Equilíbrio perfeito. Ótimo para curiosidades.</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-blue-400 font-bold">60s:</span>
                              <span>Storytelling completo. Melhor para conteúdo educativo.</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1">
                      {[30, 45, 60].map(dur => (
                        <button
                          key={dur}
                          onClick={() => setProject({ ...project, duration: dur })}
                          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${project.duration === dur ? 'bg-zinc-800 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-300'}`}
                          disabled={project.status !== 'idle'}
                        >
                          {dur}s
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                    <Mic size={16} /> 4. ESCOLHER VOZ (TTS)
                  </label>

                  {/* TTS Provider Selection */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() => {
                        setTtsProvider('gemini');
                        localStorage.setItem('ttsProvider', 'gemini');
                        setSelectedVoice(GEMINI_VOICE_OPTIONS[0].id);
                      }}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${ttsProvider === 'gemini' ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700'}`}
                      disabled={project.status !== 'idle' && project.status !== 'error'}
                    >
                      <div className="font-bold">Gemini TTS</div>
                      <div className="text-xs text-zinc-400">Gratuito • Rápido</div>
                    </button>
                    <button
                      onClick={() => {
                        setTtsProvider('elevenlabs');
                        localStorage.setItem('ttsProvider', 'elevenlabs');
                        setSelectedVoice(ELEVENLABS_VOICE_OPTIONS[0].id);
                      }}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${ttsProvider === 'elevenlabs' ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700'}`}
                      disabled={project.status !== 'idle' && project.status !== 'error'}
                    >
                      <div className="font-bold">ElevenLabs</div>
                      <div className="text-xs text-zinc-400">Premium • Ultra Realista</div>
                    </button>
                  </div>

                  {/* Voice Selection */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {currentVoiceOptions.map(voice => (
                      <button
                        key={voice.id}
                        onClick={() => setSelectedVoice(voice.id)}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-2 ${selectedVoice === voice.id ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700'}`}
                        disabled={project.status !== 'idle'}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${voice.gender === 'M' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'}`}>
                          {voice.gender}
                        </div>
                        <span className="text-xs text-center leading-tight">{voice.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                    🎬 5. GERADOR DE VÍDEO
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setVideoProvider('antigravity');
                        localStorage.setItem('videoProvider', 'antigravity');
                      }}
                      className={`p-4 rounded-xl border text-sm font-medium transition-all flex flex-col items-start gap-2 ${videoProvider === 'antigravity' ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700'}`}
                      disabled={project.status !== 'idle' && project.status !== 'error'}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                          📹
                        </div>
                        <span className="font-bold">Pexels</span>
                      </div>
                      <span className="text-xs text-zinc-400">Stock • Ilimitado • Grátis</span>
                    </button>
                    <button
                      onClick={() => {
                        setVideoProvider('gemini');
                        localStorage.setItem('videoProvider', 'gemini');
                      }}
                      className={`p-4 rounded-xl border text-sm font-medium transition-all flex flex-col items-start gap-2 ${videoProvider === 'gemini' ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700'}`}
                      disabled={project.status !== 'idle' && project.status !== 'error'}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                          ✨
                        </div>
                        <span className="font-bold">Gemini Veo</span>
                      </div>
                      <span className="text-xs text-zinc-400">IA Generativa • 10/dia</span>
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-2xl flex items-center gap-3 text-red-500">
                  <AlertCircle size={20} />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {project.status === 'idle' || project.status === 'error' ? (
                <button
                  onClick={handleGenerate}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 py-6 rounded-2xl font-bold text-xl shadow-xl shadow-purple-600/20 flex items-center justify-center gap-3 group transition-all transform active:scale-[0.98]"
                >
                  Gerar Vídeo Viral <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <div className="space-y-6">
                  <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center gap-6 text-center">
                    <div className="relative">
                      <Loader2 size={48} className="text-purple-500 animate-spin" />
                      <Sparkles size={20} className="absolute -top-1 -right-1 text-pink-500 animate-pulse" />
                    </div>

                    {/* Progress Steps */}
                    <div className="w-full max-w-md space-y-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">
                          {project.status === 'generating_script' && "Criando Roteiro Viral..."}
                          {project.status === 'generating_thumbnail' && "Gerando Thumbnail..."}
                          {project.status === 'generating_audio' && "Narrando o Texto..."}
                          {project.status === 'generating_video' && `Gerando Vídeo (${project.videoProvider === 'antigravity' ? 'Antigravity' : 'Gemini Veo'})...`}
                        </h3>
                        <p className="text-zinc-500 text-sm">
                          {project.status === 'generating_script' && "Etapa 1 de 4"}
                          {project.status === 'generating_thumbnail' && "Etapa 2 de 4"}
                          {project.status === 'generating_audio' && "Etapa 3 de 4"}
                          {project.status === 'generating_video' && "Etapa 4 de 4"}
                        </p>
                      </div>

                      <div className="w-full">
                        <div className="flex justify-between text-xs text-zinc-400 mb-2">
                          <span>Progresso</span>
                          <span className="font-bold text-purple-400">
                            {project.status === 'generating_script' && "25%"}
                            {project.status === 'generating_thumbnail' && "50%"}
                            {project.status === 'generating_audio' && "75%"}
                            {project.status === 'generating_video' && "99%"}
                          </span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500 ease-out"
                            style={{
                              width: project.status === 'generating_script' ? '25%' :
                                project.status === 'generating_thumbnail' ? '50%' :
                                  project.status === 'generating_audio' ? '75%' : '99%'
                            }}
                          />
                        </div>
                      </div>

                      {/* Step Indicators */}
                      <div className="flex justify-between items-center text-xs">
                        <div className={`flex flex-col items-center gap-1 ${project.status === 'generating_script' ? 'text-purple-400' : 'text-green-500'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${project.status === 'generating_script' ? 'bg-purple-500/20 animate-pulse' : 'bg-green-500/20'}`}>
                            {project.status === 'generating_script' ? '⏳' : '✓'}
                          </div>
                          <span className="font-medium">Roteiro</span>
                        </div>
                        <div className="flex-1 h-px bg-zinc-700 mx-2" />
                        <div className={`flex flex-col items-center gap-1 ${project.status === 'generating_audio' ? 'text-purple-400' : project.status === 'generating_video' || project.status === 'ready' ? 'text-green-500' : 'text-zinc-600'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${project.status === 'generating_audio' ? 'bg-purple-500/20 animate-pulse' : project.status === 'generating_video' || project.status === 'ready' ? 'bg-green-500/20' : 'bg-zinc-800'}`}>
                            {project.status === 'generating_audio' ? '⏳' : project.status === 'generating_video' || project.status === 'ready' ? '✓' : '🎤'}
                          </div>
                          <span className="font-medium">Áudio</span>
                        </div>
                        <div className="flex-1 h-px bg-zinc-700 mx-2" />
                        <div className={`flex flex-col items-center gap-1 ${project.status === 'generating_video' ? 'text-purple-400' : project.status === 'ready' ? 'text-green-500' : 'text-zinc-600'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${project.status === 'generating_video' ? 'bg-purple-500/20 animate-pulse' : project.status === 'ready' ? 'bg-green-500/20' : 'bg-zinc-800'}`}>
                            {project.status === 'generating_video' ? '⏳' : project.status === 'ready' ? '✓' : '🎬'}
                          </div>
                          <span className="font-medium">Vídeo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="bg-zinc-950/50 rounded-[2.5rem] border border-zinc-900 p-8 flex flex-col items-center justify-center min-h-[600px] relative overflow-hidden">
              {project.status === 'ready' && project.script ? (
                <VideoPreview
                  audioUrl={project.audioUrl}
                  videoUrl={project.videoUrl}
                  videoPrompt={project.videoPrompt}
                  thumbnailUrl={project.thumbnailUrl}
                  script={project.script}
                  text={`${project.script.hook} ${project.script.body} ${project.script.cta}`}
                  onReset={resetProject}
                />
              ) : (
                <div className="text-center space-y-6 max-w-xs relative z-10">
                  <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto border border-zinc-800 text-zinc-700">
                    <Clapperboard size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Pré-visualização</h3>
                    <p className="text-zinc-500 text-sm">Configure o vídeo à esquerda e clique em gerar para ver o resultado aqui.</p>
                  </div>
                </div>
              )}
            </section>
          </div >
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 p-6 flex flex-col gap-6 hidden md:flex">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Zap className="text-white fill-white" size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight">ViralShorts</span>
        </div>

        <nav className="flex flex-col gap-1">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-4 mb-2">Principal</p>
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${currentView === 'dashboard' ? 'bg-zinc-900 text-purple-400' : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'}`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button
            onClick={() => setCurrentView('videos')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${currentView === 'videos' ? 'bg-zinc-900 text-purple-400' : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'}`}
          >
            <VideoIcon size={18} /> Meus Vídeos
          </button>
          <button
            onClick={() => setCurrentView('history')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${currentView === 'history' ? 'bg-zinc-900 text-purple-400' : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'}`}
          >
            <History size={18} /> Histórico
          </button>

          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-4 mt-6 mb-2">Automação e Redes</p>
          <button
            onClick={() => setCurrentView('automation')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${currentView === 'automation' ? 'bg-zinc-900 text-purple-400' : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'}`}
          >
            <Bot size={18} /> Automação IA
          </button>

          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-4 mt-6 mb-2">Configurações</p>
          <button
            onClick={() => setCurrentView('settings_ai')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${currentView === 'settings_ai' ? 'bg-zinc-900 text-purple-400' : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'}`}
          >
            <Brain size={18} /> IAs
          </button>
          <button
            onClick={() => setCurrentView('settings_youtube')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${currentView === 'settings_youtube' ? 'bg-zinc-900 text-red-500' : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'}`}
          >
            <Youtube size={18} /> YouTube Shorts
          </button>
          <button
            onClick={() => setCurrentView('settings_instagram')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${currentView === 'settings_instagram' ? 'bg-zinc-900 text-pink-500' : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'}`}
          >
            <Instagram size={18} /> Instagram Reels
          </button>
          <button
            onClick={() => setCurrentView('settings_tiktok')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${currentView === 'settings_tiktok' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'}`}
          >
            <Smartphone size={18} /> TikTok
          </button>
        </nav>

        <div className="mt-auto p-4 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Plano Pro</p>
            <p className="text-sm text-zinc-300 mb-3">Automação total e sem limites.</p>
            <button className="w-full bg-white text-black py-2 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-colors">
              Upgrade
            </button>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {currentView === 'dashboard' && 'Gerador Viral'}
              {currentView === 'automation' && 'Automação Inteligente'}
              {currentView === 'settings_ai' && 'Configurações de IA'}
              {currentView === 'settings_youtube' && 'Automação YouTube'}
              {currentView === 'settings_instagram' && 'Automação Instagram'}
              {currentView === 'settings_tiktok' && 'Automação TikTok'}
              {currentView === 'videos' && 'Galeria de Vídeos'}
              {currentView === 'history' && 'Histórico'}
            </h1>
            <p className="text-zinc-500 text-sm">
              {currentView === 'dashboard' && 'Crie conteúdos que prendem a atenção.'}
              {currentView === 'automation' && 'IA gera vídeos virais automaticamente 24/7.'}
              {currentView === 'settings_ai' && 'Configure as chaves de API e preferências das IAs.'}
              {currentView === 'settings_youtube' && 'Configure seu canal e postagens automáticas.'}
              {currentView === 'settings_instagram' && 'Gerencie seus Reels e integrações.'}
              {currentView === 'settings_tiktok' && 'Domine o algoritmo com postagens cronometradas.'}
            </p>
          </div>
          {!hasApiKey && (
            <button
              onClick={handleOpenKey}
              className="bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-full text-xs font-medium hover:bg-zinc-700 flex items-center gap-2"
            >
              <AlertCircle size={14} className="text-yellow-500" />
              API Key Pendente
            </button>
          )}
        </header>

        {renderContent()}
      </main>
    </div>
  );
};

export default App;
