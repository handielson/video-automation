import { GoogleGenAI } from '@google/genai';

export interface ViralMetadata {
    title: string;
    description: string;
    tags: string[];
    hook: string;
}

export class ViralContentService {
    private genai: GoogleGenAI;

    constructor() {
        // @ts-ignore - AI Studio provides the API key
        const apiKey = window.aistudio?.getSelectedApiKey?.() || import.meta.env.VITE_GEMINI_API_KEY || 'PLACEHOLDER_API_KEY';
        this.genai = new GoogleGenAI(apiKey);
    }

    async generateViralMetadata(topic: string, tone: string): Promise<ViralMetadata> {
        const prompt = `Você é um especialista em criar conteúdo viral para YouTube Shorts.

TEMA DO VÍDEO: "${topic}"
TOM: ${tone}

Gere metadados EXTREMAMENTE VIRAIS para este Short:

1. TÍTULO (máx 100 caracteres):
   - Use palavras de IMPACTO e curiosidade
   - Inclua emojis relevantes (1-2)
   - Crie urgência ou mistério
   - Evite clickbait enganoso
   - Termine com #shorts

2. DESCRIÇÃO (máx 5000 caracteres):
   - Comece com um HOOK poderoso (1 linha)
   - Resuma o valor do vídeo (2-3 linhas)
   - Call-to-action para inscrever
   - Inclua 5-8 hashtags relevantes e virais
   - Use emojis estrategicamente

3. TAGS (10-15 tags):
   - Palavras-chave de alto volume
   - Mix de genéricas e específicas
   - Relacionadas ao nicho

4. HOOK INICIAL (1 frase curta):
   - Primeira frase que prende atenção
   - Cria curiosidade imediata

Retorne APENAS um JSON válido neste formato:
{
  "title": "título viral aqui",
  "description": "descrição completa aqui",
  "tags": ["tag1", "tag2", "tag3"],
  "hook": "hook inicial aqui"
}`;

        try {
            const result = await this.genai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: prompt
            });

            const text = result.text;

            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Failed to parse AI response');
            }

            const metadata: ViralMetadata = JSON.parse(jsonMatch[0]);

            // Validate and sanitize
            return {
                title: this.sanitizeTitle(metadata.title),
                description: this.sanitizeDescription(metadata.description),
                tags: metadata.tags.slice(0, 15), // Max 15 tags
                hook: metadata.hook
            };
        } catch (error) {
            console.error('Error generating viral metadata:', error);

            // Fallback to template-based generation
            return this.generateFallbackMetadata(topic, tone);
        }
    }

    private sanitizeTitle(title: string): string {
        // Ensure title ends with #shorts
        if (!title.toLowerCase().includes('#shorts')) {
            title = `${title} #shorts`;
        }

        // Limit to 100 characters
        if (title.length > 100) {
            title = title.substring(0, 97) + '...';
        }

        return title;
    }

    private sanitizeDescription(description: string): string {
        // Ensure description has call-to-action
        if (!description.toLowerCase().includes('inscreva')) {
            description = `${description}\n\n🔔 Inscreva-se para mais conteúdos diários!`;
        }

        // Ensure #shorts hashtag
        if (!description.toLowerCase().includes('#shorts')) {
            description = `${description}\n\n#shorts #viral`;
        }

        // Limit to 5000 characters
        if (description.length > 5000) {
            description = description.substring(0, 4997) + '...';
        }

        return description;
    }

    private generateFallbackMetadata(topic: string, tone: string): ViralMetadata {
        const emojis = ['🔥', '⚡', '🚀', '💥', '🎯', '✨', '🌟', '💡'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        return {
            title: `${randomEmoji} ${topic.substring(0, 85)} #shorts`,
            description: `${randomEmoji} ${topic}\n\nVocê não vai acreditar nisso!\n\n🔔 Inscreva-se para mais conteúdos diários!\n\n#shorts #viral #trending #fyp #foryou`,
            tags: ['shorts', 'viral', 'trending', 'fyp', 'foryou', topic.split(' ')[0].toLowerCase()],
            hook: `${randomEmoji} Você precisa ver isso!`
        };
    }

    async optimizeForEngagement(metadata: ViralMetadata): Promise<ViralMetadata> {
        // Add engagement-boosting elements
        const engagementPhrases = [
            '👇 Comenta aí!',
            '💬 O que você acha?',
            '🔥 Marca um amigo!',
            '⚡ Salva esse vídeo!',
            '🎯 Compartilha!',
        ];

        const randomPhrase = engagementPhrases[Math.floor(Math.random() * engagementPhrases.length)];

        return {
            ...metadata,
            description: `${metadata.description}\n\n${randomPhrase}`
        };
    }
}
