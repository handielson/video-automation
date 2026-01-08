
import React, { useState } from 'react';
import { 
  Youtube, 
  Instagram, 
  Smartphone, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar,
  Save,
  ExternalLink,
  ShieldCheck,
  Zap,
  Bot,
  // Fix: Added missing Sparkles icon import
  Sparkles
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [isYoutubeConnected, setIsYoutubeConnected] = useState(false);
  const [autoPostEnabled, setAutoPostEnabled] = useState(false);
  const [autoCaptionEnabled, setAutoCaptionEnabled] = useState(true);
  const [postingSchedule, setPostingSchedule] = useState('immediate');

  const handleConnectYoutube = () => {
    // Simulação de fluxo OAuth
    setIsYoutubeConnected(!isYoutubeConnected);
  };

  return (
    <div className="max-w-4xl space-y-12 pb-20">
      {/* Conexões de Rede Social */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="text-purple-500" />
          <h2 className="text-xl font-bold">Conexões Sociais</h2>
        </div>
        
        <div className="grid gap-4">
          {/* YouTube Card */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex items-center justify-between group hover:border-zinc-700 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                <Youtube size={32} />
              </div>
              <div>
                <h3 className="font-bold text-lg">YouTube Shorts</h3>
                <p className="text-zinc-500 text-sm">Postagem automática de Shorts em seu canal.</p>
                {isYoutubeConnected && (
                  <div className="flex items-center gap-2 mt-1 text-green-500 text-xs font-bold uppercase tracking-widest">
                    <CheckCircle2 size={12} /> Conectado: @ViralChannel
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={handleConnectYoutube}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all ${isYoutubeConnected ? 'bg-zinc-800 text-zinc-400 hover:bg-red-500/10 hover:text-red-500' : 'bg-white text-black hover:bg-zinc-200'}`}
            >
              {isYoutubeConnected ? 'Desconectar' : 'Conectar Canal'}
            </button>
          </div>

          {/* Instagram Card (Mock) */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex items-center justify-between opacity-60">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500">
                <Instagram size={32} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Instagram Reels</h3>
                <p className="text-zinc-500 text-sm">Integração oficial via API do Meta Business.</p>
              </div>
            </div>
            <button className="px-6 py-2.5 rounded-xl font-bold bg-zinc-800 text-zinc-500 cursor-not-allowed">
              Em Breve
            </button>
          </div>

          {/* TikTok Card (Mock) */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex items-center justify-between opacity-60">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                <Smartphone size={32} />
              </div>
              <div>
                <h3 className="font-bold text-lg">TikTok</h3>
                <p className="text-zinc-500 text-sm">Publicação direta para rascunhos ou feed.</p>
              </div>
            </div>
            <button className="px-6 py-2.5 rounded-xl font-bold bg-zinc-800 text-zinc-500 cursor-not-allowed">
              Em Breve
            </button>
          </div>
        </div>
      </section>

      {/* Automação e Fluxo */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Bot className="text-purple-500" />
          <h2 className="text-xl font-bold">Configurações de Automação</h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                <Zap size={20} />
              </div>
              <div>
                <h4 className="font-bold">Postagem Instantânea</h4>
                <p className="text-zinc-500 text-sm">Publicar automaticamente logo após a geração do vídeo.</p>
              </div>
            </div>
            <button 
              onClick={() => setAutoPostEnabled(!autoPostEnabled)}
              className={`w-14 h-8 rounded-full transition-all relative ${autoPostEnabled ? 'bg-purple-600' : 'bg-zinc-800'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all ${autoPostEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="font-bold">Agendamento Inteligente</h4>
                <p className="text-zinc-500 text-sm">Escolher os melhores horários baseado na sua audiência.</p>
              </div>
            </div>
            <select 
              value={postingSchedule}
              onChange={(e) => setPostingSchedule(e.target.value)}
              className="bg-zinc-800 border-none rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="immediate">Imediato</option>
              <option value="peak">Horários de Pico</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="font-bold">Legendas Dinâmicas (TikTok Style)</h4>
                <p className="text-zinc-500 text-sm">Aplicar automaticamente o estilo de legendas virais.</p>
              </div>
            </div>
            <button 
              onClick={() => setAutoCaptionEnabled(!autoCaptionEnabled)}
              className={`w-14 h-8 rounded-full transition-all relative ${autoCaptionEnabled ? 'bg-purple-600' : 'bg-zinc-800'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all ${autoCaptionEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer Settings */}
      <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
        <div className="text-zinc-500 text-sm flex items-center gap-2">
          <ShieldCheck size={14} /> Dados criptografados e seguros.
        </div>
        <button className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-600/20 active:scale-95">
          <Save size={18} /> Salvar Alterações
        </button>
      </div>

      {/* Webhook & Advanced */}
      <section className="bg-zinc-950 border border-dashed border-zinc-800 p-8 rounded-[2rem] space-y-4">
        <h3 className="font-bold text-zinc-400 uppercase tracking-widest text-xs">Configurações Avançadas</h3>
        <p className="text-zinc-600 text-sm leading-relaxed">
          Para desenvolvedores: Você pode integrar via Webhooks para receber notificações de vídeos concluídos ou erros de postagem.
        </p>
        <button className="text-purple-400 text-sm font-bold flex items-center gap-1 hover:underline">
          Ver Documentação de API <ExternalLink size={14} />
        </button>
      </section>
    </div>
  );
};
