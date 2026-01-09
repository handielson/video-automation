
/**
 * Subtitle Generation Utility
 * Creates SRT subtitle files from text with word-by-word timing
 */

export interface SubtitleWord {
    word: string;
    startTime: number;
    endTime: number;
}

/**
 * Format time in SRT format (HH:MM:SS,mmm)
 */
function formatSRTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
}

/**
 * Generate SRT subtitle file content from text
 * @param text - Full text to convert to subtitles
 * @param duration - Total duration in seconds
 * @param wordsPerSubtitle - Number of words to show per subtitle (default: 1 for viral effect)
 * @returns SRT formatted string
 */
export function generateSRT(
    text: string,
    duration: number,
    wordsPerSubtitle: number = 1
): string {
    const words = text.split(' ').filter(w => w.trim());
    const wordDuration = duration / words.length;

    let srt = '';
    let subtitleIndex = 1;

    for (let i = 0; i < words.length; i += wordsPerSubtitle) {
        const subtitleWords = words.slice(i, i + wordsPerSubtitle);
        const startTime = i * wordDuration;
        const endTime = Math.min((i + wordsPerSubtitle) * wordDuration, duration);

        srt += `${subtitleIndex}\n`;
        srt += `${formatSRTTime(startTime)} --> ${formatSRTTime(endTime)}\n`;
        srt += `${subtitleWords.join(' ')}\n\n`;

        subtitleIndex++;
    }

    return srt;
}

/**
 * Generate subtitle data for frontend rendering
 */
export function generateSubtitleData(text: string, duration: number): SubtitleWord[] {
    const words = text.split(' ').filter(w => w.trim());
    const wordDuration = duration / words.length;

    return words.map((word, index) => ({
        word,
        startTime: index * wordDuration,
        endTime: (index + 1) * wordDuration
    }));
}

/**
 * Create subtitle style for FFmpeg
 * Returns ASS style string for viral-style subtitles
 */
export function getSubtitleStyle(): string {
    return `[Script Info]
Title: ViralShorts Subtitles
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,48,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,2,2,10,10,80,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;
}
