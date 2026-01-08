
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, Download, Share2 } from 'lucide-react';

interface VideoPreviewProps {
  videoUrl?: string;
  audioUrl?: string;
  text: string;
  onReset: () => void;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ videoUrl, audioUrl, text, onReset }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

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
      videoRef.current?.play();
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const currentWordIndex = Math.floor(currentTime / wordDuration);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      <div className="relative aspect-[9/16] w-full bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 group">
        {/* Mock/Real Video Background */}
        <video 
          ref={videoRef}
          src={videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-abstract-flowing-gold-particles-3453-large.mp4"} 
          className="w-full h-full object-cover"
          loop
          muted
        />
        
        {/* Captions Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8">
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
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20 font-medium"
        >
          <Download size={18} /> Exportar
        </button>
      </div>
      
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
