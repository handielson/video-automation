import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export const OAuthCallback: React.FC = () => {
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [message, setMessage] = useState('Processando autenticação...');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code');
                const error = urlParams.get('error');

                if (error) {
                    setStatus('error');
                    setMessage(`Erro na autenticação: ${error}`);
                    return;
                }

                if (!code) {
                    setStatus('error');
                    setMessage('Código de autorização não encontrado');
                    return;
                }

                // Get credentials from localStorage
                const settingsStr = localStorage.getItem('viralshorts_youtube_settings');
                if (!settingsStr) {
                    setStatus('error');
                    setMessage('Credenciais não encontradas. Configure primeiro.');
                    return;
                }

                const settings = JSON.parse(settingsStr);
                const credentials = settings.credentials;

                if (!credentials?.clientId || !credentials?.clientSecret) {
                    setStatus('error');
                    setMessage('Credenciais incompletas');
                    return;
                }

                // Exchange code for tokens
                const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        code: code,
                        client_id: credentials.clientId,
                        client_secret: credentials.clientSecret,
                        redirect_uri: credentials.redirectUri,
                        grant_type: 'authorization_code',
                    }),
                });

                if (!tokenResponse.ok) {
                    const errorData = await tokenResponse.json();
                    throw new Error(errorData.error_description || 'Falha ao obter tokens');
                }

                const tokens = await tokenResponse.json();

                // Get channel info
                const channelResponse = await fetch(
                    'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
                    {
                        headers: {
                            Authorization: `Bearer ${tokens.access_token}`,
                        },
                    }
                );

                let channelName = '@SeuCanal';
                if (channelResponse.ok) {
                    const channelData = await channelResponse.json();
                    if (channelData.items && channelData.items.length > 0) {
                        channelName = channelData.items[0].snippet.customUrl ||
                            channelData.items[0].snippet.title;
                    }
                }

                // Save tokens and update connection status
                const updatedSettings = {
                    ...settings,
                    isConnected: true,
                    channelName: channelName,
                    tokens: {
                        access_token: tokens.access_token,
                        refresh_token: tokens.refresh_token,
                        expires_at: Date.now() + (tokens.expires_in * 1000),
                        token_type: tokens.token_type,
                    },
                };

                localStorage.setItem('viralshorts_youtube_settings', JSON.stringify(updatedSettings));

                setStatus('success');
                setMessage(`Conectado com sucesso ao canal ${channelName}!`);

                // Redirect back to settings after 2 seconds
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);

            } catch (error: any) {
                console.error('OAuth callback error:', error);
                setStatus('error');
                setMessage(error.message || 'Erro ao processar autenticação');
            }
        };

        handleCallback();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
                {status === 'processing' && (
                    <>
                        <Loader2 className="w-16 h-16 text-red-500 animate-spin mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Conectando ao YouTube</h2>
                        <p className="text-zinc-400">{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-green-500">Sucesso!</h2>
                        <p className="text-zinc-400">{message}</p>
                        <p className="text-zinc-600 text-sm mt-4">Redirecionando...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-red-500">Erro</h2>
                        <p className="text-zinc-400">{message}</p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="mt-6 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-bold transition-all"
                        >
                            Voltar às Configurações
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
