import type { VercelRequest, VercelResponse } from '@vercel/node';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { generateSRT } from '../utils/subtitles';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

interface MergeVideoRequest {
    videoUrl: string;
    audioUrl: string;
    text: string;
    duration: number;
}

/**
 * Download file from URL to temporary location
 */
async function downloadFile(url: string, filename: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download: ${url}`);

    const buffer = await response.buffer();
    const tempPath = path.join(os.tmpdir(), filename);
    fs.writeFileSync(tempPath, buffer);

    return tempPath;
}

/**
 * Merge video + audio + subtitles using FFmpeg
 */
async function mergeVideo(
    videoPath: string,
    audioPath: string,
    srtPath: string,
    outputPath: string
): Promise<void> {
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(videoPath)
            .input(audioPath)
            .outputOptions([
                '-c:v libx264',           // Video codec
                '-c:a aac',               // Audio codec
                '-shortest',              // Match shortest input
                '-vf', `subtitles=${srtPath}:force_style='FontName=Arial,FontSize=48,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,BorderStyle=1,Outline=3,Shadow=2,Alignment=2,MarginV=80'`
            ])
            .output(outputPath)
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .run();
    });
}

/**
 * API Handler: Merge video + audio + subtitles
 */
export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { videoUrl, audioUrl, text, duration } = req.body as MergeVideoRequest;

        if (!videoUrl || !audioUrl || !text || !duration) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        console.log('🎬 Starting video merge process...');

        // 1. Download video and audio
        console.log('📥 Downloading video and audio...');
        const videoPath = await downloadFile(videoUrl, 'video.mp4');
        const audioPath = await downloadFile(audioUrl, 'audio.mp3');

        // 2. Generate SRT subtitles
        console.log('📝 Generating subtitles...');
        const srtContent = generateSRT(text, duration, 1); // 1 word per subtitle
        const srtPath = path.join(os.tmpdir(), 'subtitles.srt');
        fs.writeFileSync(srtPath, srtContent);

        // 3. Merge with FFmpeg
        console.log('🔧 Merging video + audio + subtitles...');
        const outputPath = path.join(os.tmpdir(), `output-${Date.now()}.mp4`);
        await mergeVideo(videoPath, audioPath, srtPath, outputPath);

        // 4. Read output file
        console.log('✅ Video merged successfully!');
        const outputBuffer = fs.readFileSync(outputPath);

        // 5. Cleanup temp files
        [videoPath, audioPath, srtPath, outputPath].forEach(file => {
            try {
                fs.unlinkSync(file);
            } catch (e) {
                console.warn(`Failed to delete temp file: ${file}`);
            }
        });

        // 6. Return video as blob
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', 'attachment; filename="viralshorts-merged.mp4"');
        return res.send(outputBuffer);

    } catch (error: any) {
        console.error('❌ Video merge error:', error);
        return res.status(500).json({
            error: 'Failed to merge video',
            details: error.message
        });
    }
}
