
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
            const error = await response.json();
            throw new Error(error.details || 'Failed to merge video');
        }

        return await response.blob();
    }

    /**
     * Download merged video
     */
    downloadVideo(blob: Blob, filename: string = `viralshorts-${Date.now()}.mp4`) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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

            const blob = await this.mergeVideo(videoUrl, audioUrl, text, duration);

            onProgress?.('Baixando vídeo...');

            this.downloadVideo(blob);

            onProgress?.('Concluído!');
        } catch (error: any) {
            console.error('Export error:', error);
            throw new Error(`Falha ao exportar vídeo: ${error.message}`);
        }
    }
}
