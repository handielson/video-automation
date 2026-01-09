import { createClient } from 'pexels';

/**
 * Pexels Video Service
 * Searches and downloads stock videos from Pexels
 */

export class PexelsService {
    private client: any;
    private apiKey: string;

    constructor(apiKey?: string) {
        // Get API key from parameter, environment, or localStorage
        this.apiKey = apiKey || process.env.PEXELS_API_KEY || '';

        if (this.apiKey) {
            this.client = createClient(this.apiKey);
        }
    }

    private async getApiKey(): Promise<string> {
        if (this.apiKey) return this.apiKey;

        // Try to get from localStorage (browser only)
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('PEXELS_API_KEY');
            if (stored) {
                this.apiKey = stored;
                this.client = createClient(this.apiKey);
                return stored;
            }
        }

        throw new Error('Pexels API key not configured. Please add it in Settings.');
    }

    /**
     * Search for videos on Pexels
     */
    async searchVideos(
        query: string,
        orientation: 'portrait' | 'landscape' = 'portrait',
        size: 'small' | 'medium' | 'large' = 'medium'
    ): Promise<any> {
        const apiKey = await this.getApiKey();

        if (!this.client) {
            this.client = createClient(apiKey);
        }

        console.log(`🔍 Pexels search: "${query}" (${orientation})`);

        try {
            const response = await this.client.videos.search({
                query,
                orientation,
                size,
                per_page: 10
            });

            console.log(`📊 Pexels results: ${response.videos?.length || 0} videos found`);

            if (response.videos && response.videos.length > 0) {
                console.log(`✅ First video: ${response.videos[0].id}`);
            }

            return response;
        } catch (error: any) {
            console.error('❌ Pexels API error:', error);
            throw new Error(`Pexels API error: ${error.message || 'Unknown error'}`);
        }
    }

    /**
     * Get best video URL for a specific quality
     */
    getBestVideoUrl(video: any, quality: 'hd' | 'sd' = 'hd'): string | null {
        if (!video.video_files || video.video_files.length === 0) {
            return null;
        }

        // Filter by quality
        const qualityFiles = video.video_files.filter((file: any) =>
            quality === 'hd' ? file.quality === 'hd' : file.quality === 'sd'
        );

        // Get portrait (9:16) videos
        const portraitFiles = qualityFiles.filter((file: any) =>
            file.width < file.height
        );

        // Prefer portrait, fallback to any quality file
        const selectedFile = portraitFiles[0] || qualityFiles[0] || video.video_files[0];

        return selectedFile.link;
    }

    /**
     * Simple translation helper for common Portuguese to English keywords
     */
    private translateToEnglish(prompt: string): string {
        // Common Portuguese to English translations for video search
        const translations: Record<string, string> = {
            // Topics
            'espaço': 'space',
            'oceano': 'ocean',
            'mar': 'sea',
            'montanha': 'mountain',
            'floresta': 'forest',
            'cidade': 'city',
            'praia': 'beach',
            'céu': 'sky',
            'natureza': 'nature',
            'animal': 'animal',
            'animais': 'animals',
            'cachorro': 'dog',
            'cachorros': 'dogs',
            'gato': 'cat',
            'gatos': 'cats',
            'pássaro': 'bird',
            'pássaros': 'birds',
            'peixe': 'fish',
            'pessoa': 'person',
            'pessoas': 'people',
            'tecnologia': 'technology',
            'comida': 'food',
            'viagem': 'travel',
            'música': 'music',
            'arte': 'art',
            'esporte': 'sport',
            'carro': 'car',
            'avião': 'airplane',
            'trem': 'train',
            // Descriptors
            'bonito': 'beautiful',
            'incrível': 'amazing',
            'fantástico': 'fantastic',
            'rápido': 'fast',
            'lento': 'slow',
            'grande': 'big',
            'pequeno': 'small',
            'novo': 'new',
            'velho': 'old',
            'moderno': 'modern',
            // Actions
            'correndo': 'running',
            'voando': 'flying',
            'nadando': 'swimming',
            'andando': 'walking',
            'pulando': 'jumping',
            // Common words
            'sobre': 'about',
            'curiosidades': 'curiosity',
            'curiosidade': 'curiosity',
            'fatos': 'facts',
            'fato': 'fact',
            'história': 'history',
            'mistério': 'mystery',
            'segredo': 'secret'
        };

        let translated = prompt.toLowerCase();

        // Replace Portuguese words with English
        for (const [pt, en] of Object.entries(translations)) {
            const regex = new RegExp(`\\b${pt}\\b`, 'gi');
            translated = translated.replace(regex, en);
        }

        // Extract main keywords (remove common filler words)
        const fillerWords = ['o', 'a', 'os', 'as', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas', 'sobre', 'about', 'the', 'of', 'in', 'on', 'curiosity'];
        const words = translated.split(/\s+/).filter(word => !fillerWords.includes(word) && word.length > 2);

        // Take first 2-3 most relevant keywords
        const keywords = words.slice(0, 3).join(' ');

        console.log(`📝 Translated prompt: "${prompt}" → "${keywords}"`);
        return keywords || 'nature';
    }

    /**
     * Generate video URL from prompt
     */
    async generateVideoFromPrompt(
        prompt: string,
        aspectRatio: '9:16' | '16:9' = '9:16'
    ): Promise<string> {
        console.log('🎬 Searching Pexels for:', prompt);

        // Translate and simplify prompt for better search results
        const searchQuery = this.translateToEnglish(prompt);

        // Try portrait first
        const orientation = aspectRatio === '9:16' ? 'portrait' : 'landscape';
        let results = await this.searchVideos(searchQuery, orientation);

        // Fallback: if no portrait videos found, try landscape
        if ((!results.videos || results.videos.length === 0) && orientation === 'portrait') {
            console.log('⚠️ No portrait videos found, trying landscape...');
            results = await this.searchVideos(searchQuery, 'landscape');
        }

        if (!results.videos || results.videos.length === 0) {
            throw new Error(`No videos found for: ${prompt} (searched: ${searchQuery})`);
        }

        // Get first video
        const video = results.videos[0];
        const videoUrl = this.getBestVideoUrl(video, 'hd');

        if (!videoUrl) {
            throw new Error('No suitable video file found');
        }

        console.log('✅ Found Pexels video:', video.id);
        return videoUrl;
    }
}
