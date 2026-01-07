"""
Prompt templates for GPT-based script generation.
Optimized for retention and cost efficiency.
"""

SCRIPT_GENERATION_PROMPT = """Você é um roteirista especializado em YouTube Shorts e TikTok viral no nicho de curiosidades obscuras e fatos curiosos.

TAREFA: Crie um roteiro de EXATAMENTE {duration} segundos sobre o seguinte tópico:
"{topic}"

ESTRUTURA OBRIGATÓRIA:

1. HOOK (primeiros 3 segundos - CRUCIAL):
   - Deve ser impactante e gerar curiosidade imediata
   - Use uma das seguintes abordagens:
     * Pergunta intrigante
     * Afirmação chocante
     * Promessa de revelação
   - Exemplos: "Você sabia que...", "Prepare-se para descobrir...", "Isso vai mudar tudo..."

2. CORPO (40-45 segundos):
   - Desenvolva a curiosidade de forma envolvente
   - Use "mini-cliffhangers" a cada 10-15 segundos
   - Mantenha linguagem simples e direta
   - Inclua detalhes específicos (números, datas, nomes)

3. OUTRO (últimos 5 segundos):
   - Conclusão impactante
   - Call-to-action sutil (ex: "E você, conhecia esse fato?")

REGRAS:
- Tom: Conversacional, como se estivesse contando para um amigo
- Linguagem: Português brasileiro coloquial
- Evite clichês ou informações batidas
- NUNCA mencione "curta" ou "inscreva-se" explicitamente

FORMATO DE SAÍDA (JSON):
{{
  "hook": "texto do hook (10-15 palavras)",
  "body": "texto do corpo principal (80-100 palavras)",
  "outro": "conclusão (10-15 palavras)",
  "visual_keywords": ["palavra1", "palavra2", "palavra3"],
  "duration_estimate": {duration}
}}

IMPORTANTE: O roteiro deve ser lido em {duration} segundos em ritmo natural de fala.
"""

TOPIC_GENERATION_PROMPT = """Você é um especialista em conteúdo viral para YouTube Shorts e TikTok no nicho de curiosidades obscuras.

TAREFA: Gere {count} ideias de tópicos ÚNICOS e VIRAIS sobre curiosidades que poucas pessoas conhecem.

CRITÉRIOS:
- Deve ser surpreendente e contra intuitivo
- Baseado em fatos reais verificáveis
- Adequado para vídeo de 50 segundos
- Alto potencial de retenção

CATEGORIAS (varie entre elas):
- Espaço e astronomia
- História obscura
- Ciência bizarra
- Natureza surpreendente
- Tecnologia antiga
- Corpo humano
- Animais raros

FORMATO DE SAÍDA (JSON):
{{
  "topics": [
    {{
      "title": "título curto do tópico",
      "category": "categoria",
      "hook_suggestion": "sugestão de gancho"
    }}
  ]
}}

Gere tópicos que você NUNCA viu em outros canais.
"""

METADATA_OPTIMIZATION_PROMPT = """Você é um especialista em SEO para YouTube Shorts e TikTok.

TAREFA: Crie metadados otimizados para o seguinte vídeo:

ROTEIRO:
{script}

GERE:

1. TÍTULO (45-60 caracteres):
   - Deve conter números ou palavras de impacto
   - Inclua emoji relevante (1-2 no máximo)
   - Use gatilhos emocionais (ex: "incrível", "chocante", "secreto")
   - Exemplo: "🤯 Esse fato sobre o espaço vai te surpreender"

2. DESCRIÇÃO (150-250 caracteres):
   - Resuma a curiosidade
   - Inclua call-to-action sutil
   - Mencione categoria/tema

3. HASHTAGS:
   - 5-8 hashtags
   - Mix: 2-3 populares + 3-5 de nicho
   - Português brasileiro
   - Exemplo: #curiosidades #fatos #voceabia #shorts

4. TAGS:
   - 8-12 tags/keywords
   - Relevantes para busca

FORMATO DE SAÍDA (JSON):
{{
  "title": "título otimizado",
  "description": "descrição otimizada",
  "hashtags": ["#tag1", "#tag2"],
  "tags": ["keyword1", "keyword2"]
}}

IMPORTANTE: Seja criativo e único. Evite títulos genéricos.
"""

# Hook templates para variação
HOOK_TEMPLATES = [
    "Você sabia que {fact}?",
    "Prepare-se para descobrir {fact}",
    "Isso vai mudar tudo que você sabe sobre {topic}",
    "Atenção: {fact}",
    "Algo incrível sobre {topic}",
    "A verdade sobre {topic} que ninguém te contou",
    "Por que {question}? A resposta vai te surpreender",
]
