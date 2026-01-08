export interface YouTubeCredentials {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
}

export interface YouTubeTokens {
    access_token: string;
    refresh_token?: string;
    expires_at: number;
    token_type: string;
}

export interface YouTubeSettings {
    credentials?: YouTubeCredentials;
    tokens?: YouTubeTokens;
    isConnected: boolean;
    channelName?: string;
    autoPost: boolean;
    enableQueue: boolean;
    maxQueueSize: number;
    scheduleType: string;
    scheduleTimes: Array<{ hour: number; minute: number }>;
    titleTemplate: string;
    descriptionTemplate: string;
    defaultTags: string;
    category: string;
    privacy: string;
    madeForKids: boolean;
}

const STORAGE_KEY = 'viralshorts_youtube_settings';

export class YouTubeService {
    private settings: YouTubeSettings;

    constructor() {
        this.settings = this.loadSettings();
    }

    private loadSettings(): YouTubeSettings {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse stored settings:', e);
            }
        }

        return {
            isConnected: false,
            autoPost: false,
            enableQueue: true,
            maxQueueSize: 10,
            scheduleType: 'immediate',
            scheduleTimes: [
                { hour: 12, minute: 0 },
                { hour: 18, minute: 0 }
            ],
            titleTemplate: '{topic} #shorts',
            descriptionTemplate: '🔥 Inscreva-se para mais conteúdos diários!\n\n#shorts #viral',
            defaultTags: 'shorts, viral, trending',
            category: '22',
            privacy: 'public',
            madeForKids: false
        };
    }

    saveSettings(settings: Partial<YouTubeSettings>): void {
        this.settings = { ...this.settings, ...settings };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    }

    getSettings(): YouTubeSettings {
        return { ...this.settings };
    }

    saveCredentials(credentials: YouTubeCredentials): void {
        this.saveSettings({ credentials });
    }

    getCredentials(): YouTubeCredentials | undefined {
        return this.settings.credentials;
    }

    hasCredentials(): boolean {
        const creds = this.settings.credentials;
        return !!(creds?.clientId && creds?.clientSecret);
    }

    async initiateOAuth(): Promise<void> {
        const credentials = this.getCredentials();
        if (!credentials) {
            throw new Error('Credentials not configured');
        }

        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.set('client_id', credentials.clientId);
        authUrl.searchParams.set('redirect_uri', credentials.redirectUri);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube');
        authUrl.searchParams.set('access_type', 'offline');
        authUrl.searchParams.set('prompt', 'consent');

        // Open OAuth flow in new window
        window.open(authUrl.toString(), '_blank', 'width=600,height=700');
    }

    async handleOAuthCallback(code: string): Promise<void> {
        const credentials = this.getCredentials();
        if (!credentials) {
            throw new Error('Credentials not configured');
        }

        // In a real implementation, this would exchange the code for tokens
        // For now, we'll just mark as connected
        this.saveSettings({
            isConnected: true,
            channelName: '@SeuCanalDeCortes' // This would come from the API
        });
    }

    disconnect(): void {
        this.saveSettings({
            isConnected: false,
            channelName: undefined,
            tokens: undefined
        });
    }

    async getValidAccessToken(): Promise<string> {
        const settings = this.getSettings();

        if (!settings.tokens) {
            throw new Error('Not authenticated. Please connect your YouTube channel first.');
        }

        // Check if token is expired or about to expire (within 5 minutes)
        const now = Date.now();
        const expiresAt = settings.tokens.expires_at || 0;
        const isExpired = expiresAt - now < 5 * 60 * 1000;

        if (isExpired && settings.tokens.refresh_token) {
            // Refresh the token
            return await this.refreshAccessToken(settings.tokens.refresh_token);
        }

        return settings.tokens.access_token;
    }

    private async refreshAccessToken(refreshToken: string): Promise<string> {
        const credentials = this.getCredentials();
        if (!credentials) {
            throw new Error('Credentials not configured');
        }

        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: credentials.clientId,
                client_secret: credentials.clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to refresh token: ${error.error_description || error.error}`);
        }

        const tokens = await response.json();

        // Update stored tokens
        const settings = this.getSettings();
        const updatedTokens = {
            ...settings.tokens,
            access_token: tokens.access_token,
            expires_at: Date.now() + (tokens.expires_in * 1000),
        };

        this.saveSettings({ tokens: updatedTokens });

        return tokens.access_token;
    }

    async uploadVideo(videoBlob: Blob, metadata: {
        title: string;
        description: string;
        tags: string[];
        categoryId: string;
        privacyStatus: string;
        madeForKids: boolean;
    }): Promise<void> {
        if (!this.settings.isConnected) {
            throw new Error('YouTube not connected. Please authenticate first.');
        }

        // This would implement the actual YouTube upload API call
        // For now, it's a placeholder
        console.log('Uploading video with metadata:', metadata);

        // Simulated upload
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Video uploaded successfully!');
                resolve();
            }, 2000);
        });
    }
}
