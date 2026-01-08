
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ScriptOutput, VideoTone, VideoDuration } from "../types";

export class GeminiService {
  // Fix: Create fresh AI instance before calls to ensure up-to-date API key per guidelines
  private get ai() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateScript(theme: string, tone: VideoTone, duration: VideoDuration): Promise<ScriptOutput> {
    const prompt = `Gere um roteiro viral para um vídeo curto de ${duration} segundos em português sobre o tema: "${theme}". 
    O tom deve ser ${tone}. 
    Divida em: Título, Gancho (3 primeiros segundos), Corpo e CTA (Call to Action).
    Também sugira uma descrição visual para a IA gerar o vídeo de fundo.`;

    const response = await this.ai.models.generateContent({
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
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Diga de forma empolgada e rápida: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
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
    const ai = this.ai;
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
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
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
}
