import { ScriptOutput, VideoTone, VideoDuration } from "../types";

export interface ThumbnailData {
    url: string;
    prompt: string;
    generatedAt: Date;
}

export interface ViralMetadata {
    title: string;
    description: string;
    tags: string[];
    hook: string;
}

export interface TrendingTopic {
    id: string;
    topic: string;
    category: string;
    viralScore: number;
    reasoning: string;
    suggestedTone: string;
    suggestedDuration: number;
    keywords: string[];
    generatedAt: Date;
}

/**
 * AntigravityService - Integrates with Antigravity AI capabilities
 * 
 * This service leverages the paid Antigravity subscription for:
 * - Script generation (unlimited)
 * - Viral metadata generation (unlimited)
 * - Thumbnail generation (unlimited)
 * - Video generation (unlimited - default provider)
 * - Trending topics research via web search
 */
export class AntigravityService {
    private baseUrl: string;

    constructor() {
        // Use Vercel serverless function as proxy to Antigravity
        this.baseUrl = '/api/antigravity-proxy';
    }

    /**
     * Generate a viral video script using Antigravity AI
     */
    async generateScript(
        theme: string,
        tone: VideoTone,
        duration: VideoDuration
    ): Promise<ScriptOutput> {
        console.log('🤖 Generating script with Antigravity AI...');

        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'generate-script',
                payload: { theme, tone, duration }
            })
        });

        if (!response.ok) {
            throw new Error(`Antigravity API error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Script generated successfully with Antigravity');
        return data.script;
    }

    /**
     * Generate viral metadata (title, description, tags) using Antigravity AI
     */
    async generateViralMetadata(
        topic: string,
        tone: VideoTone
    ): Promise<ViralMetadata> {
        console.log('🔥 Generating viral metadata with Antigravity AI...');

        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'generate-metadata',
                payload: { topic, tone }
            })
        });

        if (!response.ok) {
            throw new Error(`Antigravity API error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Viral metadata generated successfully');
        return data.metadata;
    }

    /**
     * Generate a thumbnail image using Antigravity's image generation
     */
    async generateThumbnail(
        topic: string,
        style: string = 'vibrant, eye-catching, YouTube thumbnail style'
    ): Promise<ThumbnailData> {
        console.log('🎨 Generating thumbnail with Antigravity AI...');

        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'generate-thumbnail',
                payload: { topic, style }
            })
        });

        if (!response.ok) {
            throw new Error(`Antigravity API error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Thumbnail generated successfully');

        return {
            url: data.thumbnailUrl,
            prompt: data.prompt,
            generatedAt: new Date()
        };
    }

    /**
     * Generate a video using Antigravity AI (unlimited)
     * This is the default video provider with no quota limits
     * 
     * Note: Currently uses Gemini Veo as fallback until Antigravity video API is fully integrated
     */
    async generateVideo(
        prompt: string,
        aspectRatio: '9:16' | '16:9' = '9:16'
    ): Promise<string> {
        console.log('🎬 Generating video with Pexels (unlimited)...');

        // Get Pexels API key from localStorage
        const pexelsApiKey = localStorage.getItem('PEXELS_API_KEY');

        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'generate-video',
                payload: { prompt, aspectRatio, pexelsApiKey }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Pexels API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success || !data.videoUrl) {
            throw new Error(data.message || 'Failed to generate video with Pexels');
        }

        console.log('✅ Video generated successfully with Pexels!');
        return data.videoUrl;
    }

    /**
     * Research trending topics using Antigravity's web search
     */
    async researchTrendingTopics(
        niche?: string,
        count: number = 5
    ): Promise<TrendingTopic[]> {
        console.log('🔍 Researching trending topics with Antigravity AI...');

        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'research-topics',
                payload: { niche, count }
            })
        });

        if (!response.ok) {
            throw new Error(`Antigravity API error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`✅ Found ${data.topics.length} trending topics`);
        return data.topics;
    }

    /**
     * Get a single trending topic for immediate use
     */
    async getTopicForNow(niche?: string): Promise<TrendingTopic> {
        const topics = await this.researchTrendingTopics(niche, 1);
        return topics[0];
    }
}
