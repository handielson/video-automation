import { GeminiService } from './geminiService';
import { AntigravityService } from './antigravityService';
import { YouTubeService } from './youtubeService';
import { ViralContentService } from './viralContentService';
import { TrendingTopicsService, TrendingTopic } from './trendingTopicsService';
import { VideoTone, VideoDuration, VideoProvider } from '../types';

export interface AutomationConfig {
    enabled: boolean;
    mode: 'auto' | 'manual' | 'hybrid';
    niche?: string;
    dailyTopicsCount: number;
    autoApprove: boolean;
    videoProvider?: VideoProvider;
}

export interface VideoGenerationJob {
    id: string;
    topic: string;
    tone: VideoTone;
    duration: VideoDuration;
    status: 'pending' | 'generating' | 'ready' | 'uploaded' | 'failed';
    createdAt: Date;
    completedAt?: Date;
    error?: string;
    videoUrl?: string;
    metadata?: any;
}

const STORAGE_KEY = 'viralshorts_automation_config';
const QUEUE_KEY = 'viralshorts_video_queue';

export class AutomationService {
    private geminiService: GeminiService;
    private antigravityService: AntigravityService;
    private youtubeService: YouTubeService;
    private viralService: ViralContentService;
    private trendingService: TrendingTopicsService;
    private config: AutomationConfig;

    constructor() {
        this.geminiService = new GeminiService();
        this.antigravityService = new AntigravityService();
        this.youtubeService = new YouTubeService();
        this.viralService = new ViralContentService();
        this.trendingService = new TrendingTopicsService();
        this.config = this.loadConfig();
    }

    private loadConfig(): AutomationConfig {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse automation config:', e);
            }
        }

        return {
            enabled: false,
            mode: 'auto',
            dailyTopicsCount: 10,
            autoApprove: false,
            videoProvider: 'antigravity'
        };
    }

    saveConfig(config: Partial<AutomationConfig>): void {
        this.config = { ...this.config, ...config };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    }

    getConfig(): AutomationConfig {
        return { ...this.config };
    }

    async generateVideoAutomatically(): Promise<VideoGenerationJob> {
        console.log('🤖 Starting automatic video generation...');

        try {
            // Step 1: Get trending topic using Antigravity web search
            console.log('🔍 Researching trending topics with Antigravity...');
            const topic = await this.antigravityService.getTopicForNow(this.config.niche);
            console.log('📊 Trending topic selected:', topic.topic);

            // Step 2: Create job
            const job: VideoGenerationJob = {
                id: `job-${Date.now()}`,
                topic: topic.topic,
                tone: topic.suggestedTone as VideoTone,
                duration: topic.suggestedDuration as VideoDuration,
                status: 'generating',
                createdAt: new Date()
            };

            this.addToQueue(job);

            // Step 3: Generate script with Antigravity
            console.log('📝 Generating script with Antigravity...');
            const script = await this.antigravityService.generateScript(
                topic.topic,
                job.tone,
                job.duration
            );

            // Step 4: Generate viral metadata with Antigravity
            console.log('🔥 Generating viral metadata with Antigravity...');
            const metadata = await this.antigravityService.generateViralMetadata(
                topic.topic,
                job.tone
            );

            // Step 5: Generate thumbnail with Antigravity
            console.log('🎨 Generating thumbnail with Antigravity...');
            const thumbnailData = await this.antigravityService.generateThumbnail(topic.topic);

            // Step 6: Generate audio with Gemini TTS
            console.log('🎤 Generating audio with Gemini TTS...');
            const fullText = `${script.hook} ${script.body} ${script.cta}`;
            const audioUrl = await this.geminiService.generateAudio(fullText, 'Kore');

            // Step 7: Generate video with selected provider
            const videoProvider = this.config.videoProvider || 'antigravity';
            let videoUrl: string | undefined;
            try {
                if (videoProvider === 'antigravity') {
                    console.log('🎬 Generating video with Antigravity (unlimited)...');
                    videoUrl = await this.antigravityService.generateVideo(script.suggestedVisuals, '9:16');
                } else {
                    console.log('🎬 Generating video with Gemini Veo (premium)...');
                    videoUrl = await this.geminiService.generateVideo(script.suggestedVisuals);
                }
            } catch (error) {
                console.warn('Video generation failed, will use audio only:', error);
            }

            // Step 8: Update job
            job.status = 'ready';
            job.completedAt = new Date();
            job.videoUrl = videoUrl;
            job.metadata = {
                script,
                viralMetadata: metadata,
                thumbnailUrl: thumbnailData.url,
                audioUrl,
                trendingTopic: topic,
                videoProvider
            };

            this.updateJobInQueue(job);

            console.log('✅ Video generated successfully!');
            return job;

        } catch (error: any) {
            console.error('❌ Error generating video:', error);
            throw error;
        }
    }

    async uploadVideoToYouTube(job: VideoGenerationJob): Promise<void> {
        if (job.status !== 'ready' || !job.videoUrl) {
            throw new Error('Video not ready for upload');
        }

        const metadata = job.metadata?.viralMetadata;
        if (!metadata) {
            throw new Error('Viral metadata not found');
        }

        console.log('📤 Uploading to YouTube...');

        // Fetch video blob
        const response = await fetch(job.videoUrl);
        const videoBlob = await response.blob();

        // Upload to YouTube
        await this.youtubeService.uploadVideo(videoBlob, {
            title: metadata.title,
            description: metadata.description,
            tags: metadata.tags,
            categoryId: '22', // People & Blogs
            privacyStatus: 'public',
            madeForKids: false
        });

        job.status = 'uploaded';
        this.updateJobInQueue(job);

        console.log('✅ Video uploaded to YouTube!');
    }

    private addToQueue(job: VideoGenerationJob): void {
        const queue = this.getQueue();
        queue.push(job);
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    }

    private updateJobInQueue(job: VideoGenerationJob): void {
        const queue = this.getQueue();
        const index = queue.findIndex(j => j.id === job.id);
        if (index !== -1) {
            queue[index] = job;
            localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
        }
    }

    getQueue(): VideoGenerationJob[] {
        const stored = localStorage.getItem(QUEUE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                return [];
            }
        }
        return [];
    }

    clearQueue(): void {
        localStorage.setItem(QUEUE_KEY, JSON.stringify([]));
    }

    async processQueue(): Promise<void> {
        const queue = this.getQueue();
        const readyJobs = queue.filter(job => job.status === 'ready');

        console.log(`📋 Processing queue: ${readyJobs.length} videos ready`);

        for (const job of readyJobs) {
            try {
                await this.uploadVideoToYouTube(job);
            } catch (error) {
                console.error(`Failed to upload job ${job.id}:`, error);
                job.status = 'failed';
                job.error = error instanceof Error ? error.message : 'Unknown error';
                this.updateJobInQueue(job);
            }
        }
    }

    async runAutomationCycle(): Promise<void> {
        if (!this.config.enabled) {
            console.log('⏸️ Automation is disabled');
            return;
        }

        console.log('🚀 Running automation cycle...');

        try {
            // Generate video
            const job = await this.generateVideoAutomatically();

            // If auto-approve is enabled, upload immediately
            if (this.config.autoApprove) {
                await this.uploadVideoToYouTube(job);
            } else {
                console.log('⏳ Video ready, waiting for manual approval');
            }

        } catch (error) {
            console.error('Automation cycle failed:', error);
        }
    }
}
