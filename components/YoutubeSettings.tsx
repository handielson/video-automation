
import React, { useState } from 'react';
import { 
  Youtube, 
  CheckCircle2, 
  Clock, 
  Save, 
  ShieldCheck, 
  Zap, 
  Bot,
  ExternalLink,
  ChevronRight,
  MonitorPlay
} from 'lucide-react';

export const YoutubeSettings: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [autoPost, setAutoPost] = useState(false);
  const [scheduleType, setScheduleType] = useState('immediate');

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-red-600/20 to-red-900/10 border border-red-500/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-red-600/20">
            <Youtube size={48} fill="white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">YouTube Shorts Integration</h2>
            <p className="text-zinc-400">Postagem direta e automação para Shorts.</p>
            {isConnected && (
              <div className="mt-2 flex items-center gap-2 text-green-500 text-xs font-bold bg-green-500/10 px-3 py-1 rounded-full w-fit">
                <CheckCircle2 size={12} /> CONECTADO: @SeuCanalDeCortes
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={() => setIsConnected(!isConnected)}
          className={`px-8 py-4 rounded-2xl font-bold transition-all transform active:scale-95 ${isConnected ? 'bg-zinc-800 text-zinc-400 hover:bg-red-600/20 hover:text-red-500' : 'bg-white text-black hover:bg-zinc-200 shadow-lg'}`}
        >
          {isConnected ? 'Desconectar' : 'Conectar Canal'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Automation Config */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Bot className="text-red-500" size={20} />
            <h3 className="font-bold">Configurações de Automação</h3>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm">Postagem Automática</h4>
                <p className="text-zinc-500 text-xs">Publicar Shorts logo após a geração.</p>
              </div>
              <button 
                onClick={() => setAutoPost(!autoPost)}
                className={`w-12 h-6 rounded-full transition-all relative ${autoPost ? 'bg-red-600' : 'bg-zinc-800'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${autoPost ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Frequência de Postagem</h4>
              <select 
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value)}
                className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="immediate">Sempre Imediato</option>
                <option value="once_day">1 vez por dia (12:00)</option>
                <option value="twice_day">2 vezes por dia (12:00 e 18:00)</option>
                <option value="peak">Horários de Pico (IA)</option>
              </select>
            </div>
            
            <div className="pt-4 border-t border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-400 text-xs">
                <ShieldCheck size={14} /> Integração via Google Cloud Platform
              </div>
            </div>
          </div>
        </div>

        {/* Defaults Config */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <MonitorPlay className="text-red-500" size={20} />
            <h3 className="font-bold">Padrões de Postagem</h3>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 font-bold uppercase">Título Padrão</label>
              <input 
                type="text" 
                placeholder="#shorts #viral #curiosidades"
                className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 font-bold uppercase">Descrição Fixa</label>
              <textarea 
                placeholder="Inscreva-se para mais conteúdos diários!"
                className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600 h-24 resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Action */}
      <div className="flex items-center justify-between p-8 bg-zinc-900 border border-zinc-800 rounded-[2rem]">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-600/10 rounded-2xl text-red-500">
            <Zap size={24} />
          </div>
          <div>
            <p className="font-bold">Pronto para viralizar?</p>
            <p className="text-zinc-500 text-sm">Suas configurações serão aplicadas a todos os novos Shorts.</p>
          </div>
        </div>
        <button className="bg-red-600 hover:bg-red-500 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-red-600/20 active:scale-95">
          <Save size={18} /> Salvar Configurações
        </button>
      </div>

      <div className="p-6 border border-dashed border-zinc-800 rounded-3xl flex items-center justify-between text-zinc-500">
        <div className="flex items-center gap-2 text-sm">
          <ExternalLink size={16} /> Tutorial: Como configurar a API do YouTube
        </div>
        <ChevronRight size={16} />
      </div>
    </div>
  );
};
