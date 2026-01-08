import { GoogleGenAI } from '@google/genai';

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

export class TrendingTopicsService {
    private genai: GoogleGenAI;

    constructor() {
        // @ts-ignore - AI Studio provides the API key
        const apiKey = typeof window !== 'undefined' && window.aistudio?.getSelectedApiKey?.()
            || (typeof process !== 'undefined' && process.env?.API_KEY)
            || 'PLACEHOLDER_API_KEY';
        this.genai = new GoogleGenAI({ apiKey });
    }

    async generateTrendingTopics(count: number = 5, niche?: string): Promise<TrendingTopic[]> {
        const nicheContext = niche ? `no nicho de ${niche}` : 'em geral';

        const prompt = `Você é um especialista em conteúdo viral para YouTube Shorts.

TAREFA: Analise as tendências atuais e sugira ${count} temas EXTREMAMENTE VIRAIS para Shorts ${nicheContext}.

CRITÉRIOS:
1. Temas que estão em alta AGORA (2026)
2. Alto potencial de viralização
3. Curiosidade e impacto emocional
4. Adequados para vídeos de 30-60 segundos
5. Diversos e únicos entre si

Para cada tema, forneça:
- topic: O tema/título do vídeo (seja específico e chamativo)
- category: Categoria (curiosidades, tecnologia, história, ciência, entretenimento, etc)
- viralScore: Pontuação de 1-10 do potencial viral
- reasoning: Por que esse tema é viral agora
- suggestedTone: Tom ideal (impactante, educativo, engraçado, misterioso)
- suggestedDuration: Duração ideal em segundos (30, 45 ou 60)
- keywords: 5-7 palavras-chave relacionadas

Retorne APENAS um JSON válido neste formato:
{
  "topics": [
    {
      "topic": "tema aqui",
      "category": "categoria",
      "viralScore": 9,
      "reasoning": "explicação",
      "suggestedTone": "impactante",
      "suggestedDuration": 45,
      "keywords": ["palavra1", "palavra2"]
    }
  ]
}`;

        try {
            const result = await this.genai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: prompt
            });

            const text = result.text;
            const jsonMatch = text.match(/\{[\s\S]*\}/);

            if (!jsonMatch) {
                throw new Error('Failed to parse AI response');
            }

            const response = JSON.parse(jsonMatch[0]);

            return response.topics.map((topic: any, index: number) => ({
                id: `topic-${Date.now()}-${index}`,
                topic: topic.topic,
                category: topic.category,
                viralScore: topic.viralScore,
                reasoning: topic.reasoning,
                suggestedTone: topic.suggestedTone,
                suggestedDuration: topic.suggestedDuration,
                keywords: topic.keywords,
                generatedAt: new Date()
            }));

        } catch (error) {
            console.error('Error generating trending topics:', error);
            return this.getFallbackTopics(count);
        }
    }

    private getFallbackTopics(count: number): TrendingTopic[] {
        const fallbackTopics = [
            {
                topic: "IA que prevê o futuro - Você não vai acreditar!",
                category: "tecnologia",
                viralScore: 9,
                reasoning: "IA é trending e futuro gera curiosidade",
                suggestedTone: "impactante",
                suggestedDuration: 45,
                keywords: ["ia", "futuro", "tecnologia", "previsão", "viral"]
            },
            {
                topic: "Segredos do Universo que cientistas escondem",
                category: "ciência",
                viralScore: 8,
                reasoning: "Mistério e conspiração geram engajamento",
                suggestedTone: "misterioso",
                suggestedDuration: 60,
                keywords: ["universo", "ciência", "segredos", "espaço", "mistério"]
            },
            {
                topic: "Fato histórico que mudou tudo e ninguém sabe",
                category: "história",
                viralScore: 8,
                reasoning: "História desconhecida gera curiosidade",
                suggestedTone: "educativo",
                suggestedDuration: 45,
                keywords: ["história", "fatos", "curiosidades", "passado", "viral"]
            },
            {
                topic: "Tecnologia do futuro que já existe HOJE",
                category: "tecnologia",
                viralScore: 9,
                reasoning: "Futuro presente gera surpresa",
                suggestedTone: "impactante",
                suggestedDuration: 45,
                keywords: ["tecnologia", "futuro", "inovação", "hoje", "viral"]
            },
            {
                topic: "Curiosidade sobre o cérebro que vai te chocar",
                category: "ciência",
                viralScore: 8,
                reasoning: "Cérebro humano sempre fascina",
                suggestedTone: "educativo",
                suggestedDuration: 30,
                keywords: ["cérebro", "ciência", "curiosidades", "mente", "viral"]
            }
        ];

        return fallbackTopics.slice(0, count).map((topic, index) => ({
            id: `fallback-${Date.now()}-${index}`,
            ...topic,
            generatedAt: new Date()
        }));
    }

    async getTopicForNow(niche?: string): Promise<TrendingTopic> {
        const topics = await this.generateTrendingTopics(1, niche);
        return topics[0];
    }

    async refreshTopicsDaily(niche?: string): Promise<TrendingTopic[]> {
        // Generate fresh topics for the day
        return await this.generateTrendingTopics(10, niche);
    }
}
