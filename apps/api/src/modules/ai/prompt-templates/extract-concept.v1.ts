import type { PromptTemplate } from './prompt.types.js';

export interface ConceptExtractionInput {
  title: string;
  content: string;
}

export interface ExtractedConcept {
  name: string;
  description: string;
  confidence: number; // 0.0 - 1.0
}

export const extractConceptsV1: PromptTemplate<
  ConceptExtractionInput,
  ExtractedConcept[]
> = {
  version: 'v1',
  description:
    'Initial concept extraction - identifies key technical concepts from article',
  systemPrompt: `You are a technical knowledge extraction system.
        Your job is to identify the key concepts a developer should retain after  reading a technical article.
        Focus on concepts that are reusable across contexts, not article-specific details.
        Output ONLY valid JSON. No markdown, no explanation.
    `,
  buildUserPrompt: ({ title, content }) => `
        Extract the key technical concepts from this article.

        Title: ${title}

        Content:
        ${content.slice(0, 8000)}

        Return a JSON array of concepts. Each concept must have:
        - name: short concept name (e.g "Event Loop", "Memoization", "CAP Theorem")
        - description: 1-2 sectences explaining what it is and why it matters
        - confidence: 0.0-1.0 how confident you are this is a genuine reusable concept

        Return between 3 and 10 concepts. Prefer fewer, higher-quality concepts over many weak ones.

        Example format:
        [
            {
                "name": "Virtual DOM",
                "description": "An in-memory representation of the UI that React uses to batch and minimize actual DOM mutations. Enables declarative UI updates without manual DOM manipulation.",
                "confidence": 0.95
            }
        ]
    `,

  parseResponse: (raw: string): ExtractedConcept[] => {
    const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned) as ExtractedConcept[];
    return parsed.filter((c) => c.confidence >= 0.6); // discard low-confidence concepts
  },
};
