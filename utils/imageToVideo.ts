import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

interface ImageToVideoOptions {
    duration: number;
    aspectRatio: '9:16' | '16:9';
    effect?: 'ken-burns' | 'static';
    fps?: number;
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
 * Convert a static image to a video with optional effects
 * @param imageUrl - URL of the image to convert
 * @param options - Video generation options
 * @returns Path to the generated video file
 */
export async function imageToVideo(
    imageUrl: string,
    options: ImageToVideoOptions
): Promise<string> {
    const {
        duration,
        aspectRatio,
        effect = 'ken-burns',
        fps = 30
    } = options;

    // Download image
    const imagePath = await downloadFile(imageUrl, `image-${Date.now()}.jpg`);
    const outputPath = path.join(os.tmpdir(), `video-${Date.now()}.mp4`);

    // Determine resolution based on aspect ratio
    const resolution = aspectRatio === '9:16' ? '720x1280' : '1280x720';

    return new Promise((resolve, reject) => {
        let command = ffmpeg(imagePath)
            .loop(duration)
            .fps(fps);

        // Apply effects based on option
        if (effect === 'ken-burns') {
            // Ken Burns effect: slow zoom in with subtle pan
            command = command.videoFilters([
                `zoompan=z='min(zoom+0.0015,1.5)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${resolution}`,
                'format=yuv420p'
            ]);
        } else {
            // Static: just scale to resolution
            command = command.videoFilters([
                `scale=${resolution}:force_original_aspect_ratio=decrease,pad=${resolution}:(ow-iw)/2:(oh-ih)/2`,
                'format=yuv420p'
            ]);
        }

        command
            .outputOptions([
                '-t', duration.toString(),
                '-pix_fmt', 'yuv420p'
            ])
            .output(outputPath)
            .on('end', () => {
                // Cleanup input image
                try {
                    fs.unlinkSync(imagePath);
                } catch (e) {
                    console.warn(`Failed to delete temp image: ${imagePath}`);
                }
                resolve(outputPath);
            })
            .on('error', (err) => {
                // Cleanup on error
                try {
                    fs.unlinkSync(imagePath);
                } catch (e) {
                    // Ignore cleanup errors
                }
                reject(err);
            })
            .run();
    });
}

/**
 * Create a video from a static image (wrapper for easier use)
 */
export async function createVideoFromImage(
    imageUrl: string,
    durationSeconds: number = 30,
    aspectRatio: '9:16' | '16:9' = '9:16'
): Promise<Buffer> {
    const videoPath = await imageToVideo(imageUrl, {
        duration: durationSeconds,
        aspectRatio,
        effect: 'ken-burns',
        fps: 30
    });

    // Read video file as buffer
    const videoBuffer = fs.readFileSync(videoPath);

    // Cleanup temp video file
    try {
        fs.unlinkSync(videoPath);
    } catch (e) {
        console.warn(`Failed to delete temp video: ${videoPath}`);
    }

    return videoBuffer;
}
