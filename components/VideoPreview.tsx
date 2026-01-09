
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, Download, Share2 } from 'lucide-react';

interface VideoPreviewProps {
  videoUrl?: string;
  audioUrl?: string;
  videoPrompt?: string;
  thumbnailUrl?: string;
  text: string;
  script?: {
    title: string;
    hook: string;
    body: string;
    cta: string;
  };
  onReset: () => void;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ videoUrl, audioUrl, videoPrompt, thumbnailUrl, text, script, onReset }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [promptCopied, setPromptCopied] = useState(false);
  const [scriptExpanded, setScriptExpanded] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const copyPrompt = () => {
    if (videoPrompt) {
      navigator.clipboard.writeText(videoPrompt);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    }
  };

  const handleExport = async () => {
    if (!videoUrl || !audioUrl || !text) return;

    setIsExporting(true);
    setExportStatus('Preparando vídeo...');

    try {
      const { VideoProcessingService } = await import('../services/videoProcessingService');
      const videoService = new VideoProcessingService();

      // Calculate duration (estimate based on text length)
      const wordCount = text.split(' ').length;
      const estimatedDuration = wordCount * 0.35; // 0.35s per word

      await videoService.exportVideo(
        videoUrl,
        audioUrl,
        text,
        estimatedDuration,
        (status) => setExportStatus(status)
      );

      setExportStatus('');
      setIsExporting(false);
    } catch (error: any) {
      console.error('Export failed:', error);
      setExportStatus('Erro ao exportar. Tente novamente.');
      setTimeout(() => {
        setExportStatus('');
        setIsExporting(false);
      }, 3000);
    }
  };

  const words = text.split(' ');
  const wordDuration = 0.35; // Rough estimate for rapid viral speech

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => prev + 0.1);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current?.pause();
      audioRef.current?.pause();
    } else {
      // Sync both video and audio
      videoRef.current?.play();
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Sync video and audio on mount
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (video && audio) {
      // Sync audio with video time
      const syncAudio = () => {
        if (Math.abs((video.currentTime || 0) - (audio.currentTime || 0)) > 0.3) {
          audio.currentTime = video.currentTime || 0;
        }
      };

      video.addEventListener('timeupdate', syncAudio);
      video.addEventListener('play', () => audio?.play());
      video.addEventListener('pause', () => audio?.pause());

      return () => {
        video.removeEventListener('timeupdate', syncAudio);
        video.removeEventListener('play', () => audio?.play());
        video.removeEventListener('pause', () => audio?.pause());
      };
    }
  }, [videoUrl, audioUrl]);

  const currentWordIndex = Math.floor(currentTime / wordDuration);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      <div className="relative aspect-[9/16] w-full bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 group">
        {/* Mock/Real Video Background */}
        <video
          ref={videoRef}
          src={videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-abstract-flowing-gold-particles-3453-large.mp4"}
          className="w-full h-full object-cover"
          muted={!audioUrl}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
        />

        {/* Captions Overlay - Positioned at Bottom */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-center pointer-events-none p-8 pb-16">
          <div className="text-center">
            {words.map((word, idx) => (
              <span
                key={idx}
                className={`inline-block text-4xl font-bebas px-1 transition-all duration-150 uppercase
                  ${idx === currentWordIndex
                    ? 'text-yellow-400 scale-125 rotate-2 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]'
                    : idx < currentWordIndex
                      ? 'text-white/40'
                      : 'text-white'}`}
              >
                {word}{' '}
              </span>
            )).slice(Math.max(0, currentWordIndex - 2), currentWordIndex + 3)}
          </div>
        </div>

        {/* Controls Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="p-6 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition-all transform hover:scale-110"
          >
            {isPlaying ? <Pause className="fill-white" /> : <Play className="fill-white" />}
          </button>
        </div>

        {/* Branding */}
        <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold tracking-widest uppercase">
          ViralShorts AI
        </div>
      </div>

      <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />

      <div className="flex gap-4 w-full">
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl transition-colors font-medium"
        >
          <RefreshCw size={18} /> Novo Vídeo
        </button>
        <button
          onClick={handleExport}
          disabled={!videoUrl || isExporting}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <div className="animate-spin">⏳</div>
              {exportStatus || 'Exportando...'}
            </>
          ) : (
            <>
              <Download size={18} /> Exportar
            </>
          )}
        </button>
      </div>

      {script && (
        <div className="w-full space-y-3">
          <button
            onClick={() => setScriptExpanded(!scriptExpanded)}
            className="w-full flex items-center justify-between text-sm font-semibold text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            <span>📝 Roteiro Completo</span>
            <span className="text-xs">{scriptExpanded ? '▼' : '▶'}</span>
          </button>
          {scriptExpanded && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
              <div>
                <p className="text-xs font-bold text-purple-400 mb-1">TÍTULO:</p>
                <p className="text-sm text-zinc-300">{script.title}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-yellow-400 mb-1">GANCHO (Hook):</p>
                <p className="text-sm text-zinc-300">{script.hook}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-blue-400 mb-1">CORPO:</p>
                <p className="text-sm text-zinc-300">{script.body}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-green-400 mb-1">CHAMADA (CTA):</p>
                <p className="text-sm text-zinc-300">{script.cta}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {videoPrompt && (
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-400">🎬 Prompt do Vídeo</span>
            <button
              onClick={copyPrompt}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
            >
              {promptCopied ? (
                <>
                  <span className="text-green-400">✓ Copiado!</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copiar
                </>
              )}
            </button>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-sm text-zinc-300 leading-relaxed">{videoPrompt}</p>
          </div>
        </div>
      )}

      {thumbnailUrl && (
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-400">🎨 Thumbnail Gerada</span>
            <a
              href={thumbnailUrl}
              download="thumbnail.png"
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <Download size={14} /> Baixar
            </a>
          </div>
          <div className="aspect-video w-full bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
            <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 w-full">
        {['TikTok', 'Instagram', 'YouTube'].map(platform => (
          <button key={platform} className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl hover:bg-zinc-800 transition-colors flex flex-col items-center gap-1 text-xs text-zinc-400">
            <Share2 size={16} className="text-zinc-100" />
            {platform}
          </button>
        ))}
      </div>
    </div>
  );
};
