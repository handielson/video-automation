
import React, { useState, useEffect } from 'react';
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
  MonitorPlay,
  Settings,
  Calendar,
  Tag,
  Lock,
  Copy,
  ChevronDown,
  ChevronUp,
  Image,
  BarChart3,
  AlertCircle,
  Globe,
  Check
} from 'lucide-react';
import { YouTubeService } from '../services/youtubeService';

interface ScheduleTime {
  hour: number;
  minute: number;
}

const youtubeService = new YouTubeService();

export const YoutubeSettings: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [autoPost, setAutoPost] = useState(false);
  const [scheduleType, setScheduleType] = useState('immediate');
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // API Credentials
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  // Video Metadata Defaults
  const [titleTemplate, setTitleTemplate] = useState('{topic} #shorts');
  const [descriptionTemplate, setDescriptionTemplate] = useState('🔥 Inscreva-se para mais conteúdos diários!\n\n#shorts #viral');
  const [defaultTags, setDefaultTags] = useState('shorts, viral, trending');
  const [category, setCategory] = useState('22'); // People & Blogs
  const [privacy, setPrivacy] = useState('public');
  const [madeForKids, setMadeForKids] = useState(false);

  // Queue Settings
  const [enableQueue, setEnableQueue] = useState(true);
  const [maxQueueSize, setMaxQueueSize] = useState(10);

  // Schedule times for multiple daily posts
  const [scheduleTimes, setScheduleTimes] = useState<ScheduleTime[]>([
    { hour: 12, minute: 0 },
    { hour: 18, minute: 0 }
  ]);

  const redirectUri = `${window.location.origin}/oauth/callback`;

  // Load saved settings on mount
  useEffect(() => {
    const settings = youtubeService.getSettings();
    setIsConnected(settings.isConnected);
    setChannelName(settings.channelName || '');
    setAutoPost(settings.autoPost);
    setEnableQueue(settings.enableQueue);
    setMaxQueueSize(settings.maxQueueSize);
    setScheduleType(settings.scheduleType);
    setScheduleTimes(settings.scheduleTimes);
    setTitleTemplate(settings.titleTemplate);
    setDescriptionTemplate(settings.descriptionTemplate);
    setDefaultTags(settings.defaultTags);
    setCategory(settings.category);
    setPrivacy(settings.privacy);
    setMadeForKids(settings.madeForKids);


    const credentials = youtubeService.getCredentials();
    if (credentials) {
      setClientId(credentials.clientId);
      setClientSecret(credentials.clientSecret);
    }
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  const handleSaveCredentials = async () => {
    if (!clientId || !clientSecret) {
      alert('Por favor, preencha Client ID e Client Secret');
      return;
    }

    youtubeService.saveCredentials({
      clientId,
      clientSecret,
      redirectUri
    });

    // Initiate OAuth flow
    try {
      await youtubeService.initiateOAuth();
    } catch (error) {
      console.error('OAuth error:', error);
      alert('Erro ao iniciar autenticação. Verifique as credenciais.');
    }
  };

  const handleConnect = async () => {
    if (!youtubeService.hasCredentials()) {
      setShowApiSetup(true);
      alert('Por favor, configure as credenciais da API primeiro');
      return;
    }

    if (isConnected) {
      // Disconnect
      youtubeService.disconnect();
      setIsConnected(false);
      setChannelName('');
    } else {
      // Connect
      try {
        await youtubeService.initiateOAuth();
      } catch (error) {
        console.error('Connection error:', error);
        alert('Erro ao conectar. Verifique as credenciais.');
      }
    }
  };

  const handleSaveSettings = () => {
    youtubeService.saveSettings({
      autoPost,
      enableQueue,
      maxQueueSize,
      scheduleType,
      scheduleTimes,
      titleTemplate,
      descriptionTemplate,
      defaultTags,
      category,
      privacy,
      madeForKids
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const youtubeCategories = [
    { id: '1', name: 'Film & Animation' },
    { id: '2', name: 'Autos & Vehicles' },
    { id: '10', name: 'Music' },
    { id: '15', name: 'Pets & Animals' },
    { id: '17', name: 'Sports' },
    { id: '19', name: 'Travel & Events' },
    { id: '20', name: 'Gaming' },
    { id: '22', name: 'People & Blogs' },
    { id: '23', name: 'Comedy' },
    { id: '24', name: 'Entertainment' },
    { id: '25', name: 'News & Politics' },
    { id: '26', name: 'Howto & Style' },
    { id: '27', name: 'Education' },
    { id: '28', name: 'Science & Technology' },
  ];

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
            <p className="text-zinc-400">Postagem direta e automação completa para Shorts.</p>
            {isConnected && (
              <div className="mt-2 flex items-center gap-2 text-green-500 text-xs font-bold bg-green-500/10 px-3 py-1 rounded-full w-fit">
                <CheckCircle2 size={12} /> CONECTADO: @SeuCanalDeCortes
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleConnect}
          className={`px-8 py-4 rounded-2xl font-bold transition-all transform active:scale-95 ${isConnected ? 'bg-zinc-800 text-zinc-400 hover:bg-red-600/20 hover:text-red-500' : 'bg-white text-black hover:bg-zinc-200 shadow-lg'}`}
        >
          {isConnected ? 'Desconectar' : 'Conectar Canal'}
        </button>
      </div>

      {/* API Configuration */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
        <button
          onClick={() => setShowApiSetup(!showApiSetup)}
          className="w-full p-6 flex items-center justify-between hover:bg-zinc-800/50 transition-all"
        >
          <div className="flex items-center gap-3">
            <Lock className="text-red-500" size={20} />
            <div className="text-left">
              <h3 className="font-bold">Credenciais da API do YouTube</h3>
              <p className="text-zinc-500 text-sm">Configure suas credenciais do Google Cloud Platform</p>
            </div>
          </div>
          {showApiSetup ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {showApiSetup && (
          <div className="p-6 pt-0 space-y-6 border-t border-zinc-800">
            {/* Setup Instructions */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm space-y-2">
                  <p className="font-semibold text-blue-400">Como obter suas credenciais:</p>
                  <ol className="list-decimal list-inside space-y-1 text-zinc-400">
                    <li>Acesse o <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google Cloud Console</a></li>
                    <li>Crie um novo projeto ou selecione um existente</li>
                    <li>Ative a YouTube Data API v3</li>
                    <li>Vá em "Credenciais" → "Criar credenciais" → "ID do cliente OAuth 2.0"</li>
                    <li>Adicione o Redirect URI abaixo nas configurações</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Redirect URI */}
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 font-bold uppercase">Redirect URI (Copie para o GCP)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={redirectUri}
                  readOnly
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none"
                />
                <button
                  onClick={() => copyToClipboard(redirectUri)}
                  className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl transition-all"
                  title="Copiar"
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>

            {/* Client ID */}
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 font-bold uppercase">Client ID</label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="123456789-abc123def456.apps.googleusercontent.com"
                className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* Client Secret */}
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 font-bold uppercase">Client Secret</label>
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="GOCSPX-xxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* Save & Authorize Button */}
            <button
              onClick={handleSaveCredentials}
              disabled={!clientId || !clientSecret}
              className="w-full bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              <ShieldCheck size={18} /> Salvar e Autorizar
            </button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Automation Config */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Bot className="text-red-500" size={20} />
            <h3 className="font-bold">Configurações de Automação</h3>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-6">
            {/* Auto Post Toggle */}
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

            {/* Queue System */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm">Sistema de Fila</h4>
                <p className="text-zinc-500 text-xs">Acumular vídeos antes de postar.</p>
              </div>
              <button
                onClick={() => setEnableQueue(!enableQueue)}
                className={`w-12 h-6 rounded-full transition-all relative ${enableQueue ? 'bg-red-600' : 'bg-zinc-800'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${enableQueue ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {/* Max Queue Size */}
            {enableQueue && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Tamanho Máximo da Fila</h4>
                <input
                  type="number"
                  value={maxQueueSize}
                  onChange={(e) => setMaxQueueSize(parseInt(e.target.value) || 10)}
                  min="1"
                  max="50"
                  className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            )}

            {/* Posting Frequency */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Frequência de Postagem</h4>
              <select
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value)}
                className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="immediate">Sempre Imediato</option>
                <option value="once_day">1 vez por dia</option>
                <option value="twice_day">2 vezes por dia</option>
                <option value="custom">Horários Personalizados</option>
                <option value="peak">Horários de Pico (IA)</option>
              </select>
            </div>

            {/* Time Pickers for Multiple Posts */}
            {(scheduleType === 'once_day' || scheduleType === 'twice_day' || scheduleType === 'custom') && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Horários de Postagem</h4>
                {scheduleTimes.map((time, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="time"
                      value={`${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`}
                      onChange={(e) => {
                        const [hour, minute] = e.target.value.split(':');
                        const newTimes = [...scheduleTimes];
                        newTimes[index] = { hour: parseInt(hour), minute: parseInt(minute) };
                        setScheduleTimes(newTimes);
                      }}
                      className="flex-1 bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-400 text-xs">
                <ShieldCheck size={14} /> Integração via Google Cloud Platform
              </div>
            </div>
          </div>
        </div>

        {/* Video Metadata Defaults */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <MonitorPlay className="text-red-500" size={20} />
            <h3 className="font-bold">Padrões de Vídeo</h3>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
            {/* Title Template */}
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 font-bold uppercase">Título Padrão</label>
              <input
                type="text"
                value={titleTemplate}
                onChange={(e) => setTitleTemplate(e.target.value)}
                placeholder="{topic} #shorts"
                className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600"
              />
              <p className="text-xs text-zinc-600">Use {'{topic}'} para inserir o tema do vídeo</p>
            </div>

            {/* Description Template */}
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 font-bold uppercase">Descrição Padrão</label>
              <textarea
                value={descriptionTemplate}
                onChange={(e) => setDescriptionTemplate(e.target.value)}
                placeholder="Inscreva-se para mais conteúdos diários!"
                className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600 h-24 resize-none"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 font-bold uppercase flex items-center gap-2">
                <Tag size={14} /> Tags (separadas por vírgula)
              </label>
              <input
                type="text"
                value={defaultTags}
                onChange={(e) => setDefaultTags(e.target.value)}
                placeholder="shorts, viral, trending"
                className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 font-bold uppercase">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600"
              >
                {youtubeCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Privacy */}
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 font-bold uppercase flex items-center gap-2">
                <Globe size={14} /> Privacidade
              </label>
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value)}
                className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="public">Público</option>
                <option value="unlisted">Não listado</option>
                <option value="private">Privado</option>
              </select>
            </div>

            {/* Made for Kids */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm">Feito para Crianças</h4>
                <p className="text-zinc-500 text-xs">Conteúdo direcionado a crianças</p>
              </div>
              <button
                onClick={() => setMadeForKids(!madeForKids)}
                className={`w-12 h-6 rounded-full transition-all relative ${madeForKids ? 'bg-red-600' : 'bg-zinc-800'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${madeForKids ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full p-6 flex items-center justify-between hover:bg-zinc-800/50 transition-all"
        >
          <div className="flex items-center gap-3">
            <Settings className="text-red-500" size={20} />
            <div className="text-left">
              <h3 className="font-bold">Configurações Avançadas</h3>
              <p className="text-zinc-500 text-sm">Thumbnails, comentários, remixing e mais</p>
            </div>
          </div>
          {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {showAdvanced && (
          <div className="p-6 pt-0 space-y-6 border-t border-zinc-800">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Thumbnail Settings */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Image className="text-red-500" size={16} />
                  <h4 className="font-semibold text-sm">Thumbnail Personalizada</h4>
                </div>
                <div className="bg-zinc-800 border border-dashed border-zinc-700 rounded-2xl p-4 text-center text-zinc-500 text-sm hover:border-red-500/50 transition-all cursor-pointer">
                  Clique para fazer upload de template
                </div>
              </div>

              {/* Auto-generate Thumbnail */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm">Gerar Thumbnail com IA</h4>
                  <p className="text-zinc-500 text-xs">Criar automaticamente</p>
                </div>
                <button className="w-12 h-6 rounded-full transition-all relative bg-zinc-800">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 transition-all left-1" />
                </button>
              </div>

              {/* Comments */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm">Permitir Comentários</h4>
                  <p className="text-zinc-500 text-xs">Habilitar comentários</p>
                </div>
                <button className="w-12 h-6 rounded-full transition-all relative bg-red-600">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 transition-all left-7" />
                </button>
              </div>

              {/* Ratings */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm">Mostrar Avaliações</h4>
                  <p className="text-zinc-500 text-xs">Exibir likes/dislikes</p>
                </div>
                <button className="w-12 h-6 rounded-full transition-all relative bg-red-600">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 transition-all left-7" />
                </button>
              </div>

              {/* Remix */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm">Permitir Remixing</h4>
                  <p className="text-zinc-500 text-xs">Shorts Remix</p>
                </div>
                <button className="w-12 h-6 rounded-full transition-all relative bg-red-600">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 transition-all left-7" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Preview */}
      <div className="bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-[2.5rem] p-8">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="text-purple-500" size={24} />
          <div>
            <h3 className="font-bold">Performance dos Últimos 7 Dias</h3>
            <p className="text-zinc-500 text-sm">Analytics dos vídeos automatizados</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900/50 rounded-2xl p-4">
            <p className="text-zinc-500 text-xs mb-1">Total de Visualizações</p>
            <p className="text-2xl font-bold">12.5K</p>
            <p className="text-green-500 text-xs mt-1">+23% vs semana anterior</p>
          </div>
          <div className="bg-zinc-900/50 rounded-2xl p-4">
            <p className="text-zinc-500 text-xs mb-1">Curtidas</p>
            <p className="text-2xl font-bold">893</p>
            <p className="text-green-500 text-xs mt-1">+15%</p>
          </div>
          <div className="bg-zinc-900/50 rounded-2xl p-4">
            <p className="text-zinc-500 text-xs mb-1">Comentários</p>
            <p className="text-2xl font-bold">127</p>
            <p className="text-green-500 text-xs mt-1">+8%</p>
          </div>
          <div className="bg-zinc-900/50 rounded-2xl p-4">
            <p className="text-zinc-500 text-xs mb-1">Taxa de Engajamento</p>
            <p className="text-2xl font-bold">8.2%</p>
            <p className="text-green-500 text-xs mt-1">+2.1%</p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-zinc-900/50 rounded-2xl">
          <p className="text-xs text-zinc-500 mb-2">Melhor horário para postar</p>
          <p className="font-semibold">18:00 - 20:00 (baseado em análise de IA)</p>
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
        <button
          onClick={handleSaveSettings}
          className="bg-red-600 hover:bg-red-500 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-red-600/20 active:scale-95 relative"
        >
          {saveSuccess ? (
            <>
              <Check size={18} /> Salvo!
            </>
          ) : (
            <>
              <Save size={18} /> Salvar Configurações
            </>
          )}
        </button>
      </div>

      {/* Tutorial Link */}
      <div className="p-6 border border-dashed border-zinc-800 rounded-3xl flex items-center justify-between text-zinc-500 hover:border-red-500/50 hover:text-red-500 transition-all cursor-pointer">
        <div className="flex items-center gap-2 text-sm">
          <ExternalLink size={16} /> Tutorial: Como configurar a API do YouTube
        </div>
        <ChevronRight size={16} />
      </div>
    </div>
  );
};
