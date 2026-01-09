
/**
 * Video Processing Service
 * Handles video merging and export functionality
 */

export class VideoProcessingService {
    /**
     * Merge video + audio + subtitles on the backend
     */
    async mergeVideo(
        videoUrl: string,
        audioUrl: string,
        text: string,
        duration: number
    ): Promise<Blob> {
        const response = await fetch('/api/merge-video', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                videoUrl,
                audioUrl,
                text,
                duration
            })
        });

        if (!response.ok) {
            // If 404, API route doesn't exist (local development)
            if (response.status === 404) {
                throw new Error('API_NOT_AVAILABLE');
            }

            try {
                const error = await response.json();
                throw new Error(error.details || 'Failed to merge video');
            } catch (e) {
                throw new Error('Failed to merge video');
            }
        }

        return await response.blob();
    }

    /**
     * Download video file
     */
    downloadVideo(url: string, filename: string = `viralshorts-${Date.now()}.mp4`) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Download blob as file
     */
    downloadBlob(blob: Blob, filename: string = `viralshorts-${Date.now()}.mp4`) {
        const url = URL.createObjectURL(blob);
        this.downloadVideo(url, filename);
        URL.revokeObjectURL(url);
    }

    /**
     * Export video with merged audio and subtitles
     */
    async exportVideo(
        videoUrl: string,
        audioUrl: string,
        text: string,
        duration: number,
        onProgress?: (status: string) => void
    ): Promise<void> {
        try {
            onProgress?.('Preparando vídeo...');

            try {
                // Try backend processing first
                const blob = await this.mergeVideo(videoUrl, audioUrl, text, duration);
                onProgress?.('Baixando vídeo...');
                this.downloadBlob(blob);
                onProgress?.('Concluído!');
            } catch (error: any) {
                // Fallback for local development (API not available)
                if (error.message === 'API_NOT_AVAILABLE') {
                    console.warn('⚠️ Backend API not available. Downloading video only (no audio/subtitles merged).');
                    onProgress?.('⚠️ Modo local: baixando vídeo sem áudio...');

                    // Download video only
                    this.downloadVideo(videoUrl);

                    onProgress?.('');
                    throw new Error('BACKEND_NOT_AVAILABLE');
                }
                throw error;
            }
        } catch (error: any) {
            console.error('Export error:', error);

            if (error.message === 'BACKEND_NOT_AVAILABLE') {
                throw new Error('⚠️ Vídeo baixado SEM áudio (modo local). Deploy no Vercel para processamento completo!');
            }

            throw new Error(`Falha ao exportar vídeo: ${error.message}`);
        }
    }
}
