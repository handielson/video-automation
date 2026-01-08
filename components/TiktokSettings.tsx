
import React, { useState } from 'react';
import { 
  Smartphone, 
  CheckCircle2, 
  Save, 
  ShieldCheck, 
  Zap, 
  Bot,
  Music,
  User,
  Layout
} from 'lucide-react';

export const TiktokSettings: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [draftMode, setDraftMode] = useState(true);

  return (
    <div className="max-w-4xl space-y-8 animate-in slide-in-from-bottom duration-500">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-cyan-600/20 to-black border border-white/10 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center text-white shadow-xl shadow-cyan-500/10 border border-white/20">
            <Smartphone size={48} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">TikTok Automation</h2>
            <p className="text-zinc-400">Publicação direta para o feed ou rascunhos.</p>
            {isConnected && (
              <div className="mt-2 flex items-center gap-2 text-cyan-400 text-xs font-bold bg-cyan-500/10 px-3 py-1 rounded-full w-fit">
                <CheckCircle2 size={12} /> CONECTADO: @viral_tiktok_master
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={() => setIsConnected(!isConnected)}
          className={`px-8 py-4 rounded-2xl font-bold transition-all transform active:scale-95 ${isConnected ? 'bg-zinc-800 text-zinc-400 hover:bg-cyan-600/20 hover:text-cyan-400' : 'bg-white text-black hover:bg-zinc-200 shadow-lg'}`}
        >
          {isConnected ? 'Desconectar' : 'Conectar TikTok'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Layout className="text-cyan-400" size={20} />
            <h3 className="font-bold">Configurações de Fluxo</h3>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm">Modo Rascunho</h4>
                <p className="text-zinc-500 text-xs">Apenas enviar para o app (Mais seguro).</p>
              </div>
              <button 
                onClick={() => setDraftMode(!draftMode)}
                className={`w-12 h-6 rounded-full transition-all relative ${draftMode ? 'bg-cyan-500' : 'bg-zinc-800'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${draftMode ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Privacidade Padrão</h4>
              <select className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500">
                <option>Público</option>
                <option>Apenas Amigos</option>
                <option>Privado</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Music className="text-cyan-400" size={20} />
            <h3 className="font-bold">Ajustes de Áudio</h3>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 font-bold uppercase">Volume da Narração</label>
              <input type="range" className="w-full accent-cyan-500" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 font-bold uppercase">Legendas Automáticas</label>
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <input type="checkbox" defaultChecked className="rounded border-zinc-700 bg-zinc-800" />
                Sincronizar com fala
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-8 bg-zinc-900 border border-zinc-800 rounded-[2rem]">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-600/10 rounded-2xl text-cyan-500">
            <User size={24} />
          </div>
          <div>
            <p className="font-bold">Sincronização de Perfil</p>
            <p className="text-zinc-500 text-sm">Suas estatísticas de retenção serão usadas para otimizar a IA.</p>
          </div>
        </div>
        <button className="bg-white text-black hover:bg-zinc-200 px-10 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl active:scale-95">
          <Save size={18} /> Atualizar Preferências
        </button>
      </div>
    </div>
  );
};
