import { createClient } from 'pexels';

/**
 * Pexels Video Service
 * Searches and downloads stock videos from Pexels
 */

export class PexelsService {
    private client: any;
    private apiKey: string;

    constructor() {
        // Get API key from environment or localStorage
        this.apiKey = process.env.PEXELS_API_KEY || '';

        if (this.apiKey) {
            this.client = createClient(this.apiKey);
        }
    }

    /**
     * Get API key from localStorage or environment
     */
    private async getApiKey(): Promise<string> {
        if (this.apiKey) return this.apiKey;

        // Try to get from localStorage (browser only)
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('pexelsApiKey');
            if (stored) {
                this.apiKey = stored;
                this.client = createClient(this.apiKey);
                return stored;
            }
        }

        throw new Error('Pexels API key not configured');
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

        const response = await this.client.videos.search({
            query,
            orientation,
            size,
            per_page: 10
        });

        return response;
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
     * Generate video URL from prompt
     */
    async generateVideoFromPrompt(
        prompt: string,
        aspectRatio: '9:16' | '16:9' = '9:16'
    ): Promise<string> {
        console.log('🎬 Searching Pexels for:', prompt);

        // Search for videos
        const orientation = aspectRatio === '9:16' ? 'portrait' : 'landscape';
        const results = await this.searchVideos(prompt, orientation);

        if (!results.videos || results.videos.length === 0) {
            throw new Error(`No videos found for: ${prompt}`);
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
