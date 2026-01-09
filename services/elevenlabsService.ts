
export class ElevenLabsService {
    private async getApiKey(): Promise<string> {
        // Try localStorage first
        if (typeof window !== 'undefined' && localStorage) {
            const savedKey = localStorage.getItem('ELEVENLABS_API_KEY');
            if (savedKey && savedKey !== 'PLACEHOLDER_API_KEY') {
                console.log('✅ Using ElevenLabs API key from localStorage');
                return savedKey;
            }
        }

        // Try environment variable
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ELEVENLABS_API_KEY) {
            // @ts-ignore
            const key = import.meta.env.VITE_ELEVENLABS_API_KEY;
            if (key && key !== 'PLACEHOLDER_API_KEY') return key;
        }

        throw new Error('❌ ElevenLabs API key not configured!\n\nPlease add your API key in Settings > IAs\n\nGet your API key at: https://elevenlabs.io/app/settings/api-keys');
    }

    async generateAudio(text: string, voiceId: string = 'pNInz6obpgDQGcFmaJgB'): Promise<string> {
        const apiKey = await this.getApiKey();

        // Available ElevenLabs voices
        const availableVoices = [
            'pNInz6obpgDQGcFmaJgB', // Adam
            'EXAVITQu4vr4xnSDxMaL', // Sarah
            'ErXwobaYiN019PkySvjV', // Antoni
            'VR6AewLTigWG4xSOukaG', // Arnold
            'MF3mGyEYCl7XYWbV9V6O', // Elli
            'TxGEqnHWrfWFTfGW9XjX', // Josh
            'D38z5RcWu1voky8WS1ja', // Fin
            'IKne3meq5aSn9XLyUdCD', // Charlie
        ];

        // Handle random voice selection
        let actualVoiceId = voiceId;
        if (voiceId === 'random') {
            actualVoiceId = availableVoices[Math.floor(Math.random() * availableVoices.length)];
            console.log(`🎲 Random voice selected: ${actualVoiceId}`);
        }

        // ElevenLabs API endpoint
        const url = `https://api.elevenlabs.io/v1/text-to-speech/${actualVoiceId}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_turbo_v2_5', // Fast and high quality
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0.5,
                    use_speaker_boost: true
                }
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`ElevenLabs API error: ${error}`);
        }

        const audioBlob = await response.blob();
        return URL.createObjectURL(audioBlob);
    }

    // Get available voices
    async getVoices(): Promise<Array<{ voice_id: string; name: string; preview_url?: string }>> {
        const apiKey = await this.getApiKey();

        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: {
                'xi-api-key': apiKey
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch ElevenLabs voices');
        }

        const data = await response.json();
        return data.voices;
    }
}
