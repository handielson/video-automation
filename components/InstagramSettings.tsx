
import React, { useState } from 'react';
import { 
  Instagram, 
  CheckCircle2, 
  Save, 
  ShieldCheck, 
  Zap, 
  Bot,
  Hash,
  Share2,
  Camera
} from 'lucide-react';

export const InstagramSettings: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [autoReel, setAutoReel] = useState(false);

  return (
    <div className="max-w-4xl space-y-8 animate-in slide-in-from-right duration-500">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-pink-600/20 to-purple-900/10 border border-pink-500/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-pink-600/20">
            <Instagram size={48} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Instagram Reels Integration</h2>
            <p className="text-zinc-400">Automação oficial via API do Meta.</p>
            {isConnected && (
              <div className="mt-2 flex items-center gap-2 text-pink-500 text-xs font-bold bg-pink-500/10 px-3 py-1 rounded-full w-fit">
                <CheckCircle2 size={12} /> CONECTADO: @viral_lifestyle
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={() => setIsConnected(!isConnected)}
          className={`px-8 py-4 rounded-2xl font-bold transition-all transform active:scale-95 ${isConnected ? 'bg-zinc-800 text-zinc-400 hover:bg-pink-600/20 hover:text-pink-500' : 'bg-white text-black hover:bg-zinc-200 shadow-lg'}`}
        >
          {isConnected ? 'Desconectar' : 'Conectar Instagram'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Bot className="text-pink-500" size={20} />
            <h3 className="font-bold">Fluxo de Publicação</h3>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm">Auto-Reel</h4>
                <p className="text-zinc-500 text-xs">Publicar automaticamente no feed e Reels.</p>
              </div>
              <button 
                onClick={() => setAutoReel(!autoReel)}
                className={`w-12 h-6 rounded-full transition-all relative ${autoReel ? 'bg-pink-600' : 'bg-zinc-800'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${autoReel ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Marcação de Localização</h4>
              <input 
                type="text" 
                placeholder="Ex: São Paulo, Brasil"
                className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pink-600"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Hash className="text-pink-500" size={20} />
            <h3 className="font-bold">Engajamento</h3>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 font-bold uppercase">Hashtags Estratégicas</label>
              <textarea 
                placeholder="#reels #explore #foryou"
                className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pink-600 h-24 resize-none"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <ShieldCheck size={14} /> Requer conta profissional (Business)
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-8 bg-zinc-900 border border-zinc-800 rounded-[2rem]">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-pink-600/10 rounded-2xl text-pink-500">
            <Share2 size={24} />
          </div>
          <div>
            <p className="font-bold">Maximização de Reels</p>
            <p className="text-zinc-500 text-sm">Nossa IA otimiza o horário de postagem para o feed global.</p>
          </div>
        </div>
        <button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-pink-600/20 active:scale-95">
          <Save size={18} /> Salvar Perfil
        </button>
      </div>
    </div>
  );
};
