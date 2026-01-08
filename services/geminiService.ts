
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ScriptOutput, VideoTone, VideoDuration } from "../types";
import { ViralContentService } from "./viralContentService";

export class GeminiService {
  private viralService: ViralContentService;

  constructor() {
    this.viralService = new ViralContentService();
  }

  // Get API key asynchronously for AI Studio compatibility
  private async getApiKey(): Promise<string> {
    // Try AI Studio first (when running in AI Studio environment)
    // @ts-ignore - AI Studio provides the API key
    if (typeof window !== 'undefined' && window.aistudio?.getSelectedApiKey) {
      // @ts-ignore
      const key = await window.aistudio.getSelectedApiKey();
      if (key) return key;
    }

    // Try localStorage (from AI Settings page)
    if (typeof window !== 'undefined' && localStorage) {
      const savedKey = localStorage.getItem('VITE_GEMINI_API_KEY');
      if (savedKey && savedKey !== 'PLACEHOLDER_API_KEY') {
        console.log('✅ Using Gemini API key from localStorage');
        return savedKey;
      }
    }

    // Try Vite environment variable (local development)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
      // @ts-ignore
      const key = import.meta.env.VITE_GEMINI_API_KEY;
      if (key && key !== 'PLACEHOLDER_API_KEY') return key;
    }

    // Try Node.js environment variable (serverless/production)
    if (typeof process !== 'undefined' && process.env?.API_KEY) {
      return process.env.API_KEY;
    }

    throw new Error('❌ API key not configured!\n\nPlease add your Gemini API key to .env.local:\nVITE_GEMINI_API_KEY=your_api_key_here\n\nGet your API key at: https://aistudio.google.com/apikey');
  }

  async generateScript(theme: string, tone: VideoTone, duration: VideoDuration): Promise<ScriptOutput> {
    const apiKey = await this.getApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Gere um roteiro viral para um vídeo curto de ${duration} segundos em português sobre o tema: "${theme}". 
    O tom deve ser ${tone}. 
    Divida em: Título, Gancho (3 primeiros segundos), Corpo e CTA (Call to Action).
    Também sugira uma descrição visual para a IA gerar o vídeo de fundo.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            hook: { type: Type.STRING },
            body: { type: Type.STRING },
            cta: { type: Type.STRING },
            suggestedVisuals: { type: Type.STRING, description: "Descrição em inglês para gerador de vídeo" }
          },
          required: ["title", "hook", "body", "cta", "suggestedVisuals"]
        }
      }
    });

    return JSON.parse(response.text);
  }

  async generateAudio(text: string, voiceName: string): Promise<string> {
    const apiKey = await this.getApiKey();
    const ai = new GoogleGenAI({ apiKey });

    // Handle random voice selection
    let actualVoiceName = voiceName;
    if (voiceName === 'random') {
      const { getRandomVoice } = await import('../constants');
      actualVoiceName = getRandomVoice();
      console.log(`🎲 Random voice selected: ${actualVoiceName}`);
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Diga de forma empolgada e rápida: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: actualVoiceName }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Falha ao gerar áudio");

    // Note: PCM audio often requires a container (like WAV) for browser <audio> tags.
    // We return the raw PCM base64 here for direct usage.
    return `data:audio/pcm;base64,${base64Audio}`;
  }

  async generateVideo(prompt: string): Promise<string> {
    const apiKey = await this.getApiKey();
    const ai = new GoogleGenAI({ apiKey });

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview', // Using Fast mode explicitly
      prompt: `Cinematic loop, high quality, 4k, no text, ${prompt}`,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16'
      }
    });

    // Fix: Proper polling for video generation operation
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video URI not found in response");

    // Fix: Fetch video from download link by appending the API key as required by guidelines
    const response = await fetch(`${downloadLink}&key=${apiKey}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
}
