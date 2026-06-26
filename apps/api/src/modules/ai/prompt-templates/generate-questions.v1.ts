import type { PromptTemplate } from './prompt.types.js';

export interface QuestionGenerationInput {
  title: string;
  content: string;
  concepts: string[]; // concept names from extraction step
}

export interface GeneratedQuestion {
  text: string;
  expectedAnswer: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  conceptName: string; // maps to one of the extracted concepts
}

export const generateQuestionsV1: PromptTemplate<
  QuestionGenerationInput,
  GeneratedQuestion[]
> = {
  version: 'v1',
  description:
    'Initial question generation - creates spaced repetition questions from article',
  systemPrompt: `You are a spaced repetition question designer for developers.
        Create questions that test genuine understanding, not trivia or memorization.
        Good questions reveal whether someone truly understands a concept, not just recalls a fact.
        Output ONLY valid JSON. No markdown, no explanation.
    `,
  buildUserPrompt: ({ title, content, concepts }) => `
        Create spaced repetition questions for this article.

        Title: ${title}

        Key concepts identified: ${concepts.join(', ')}

        Content:
        ${content.slice(0, 6000)}

        Return a JSON array of questions. Each question must have:
        - text: the question to ask the developer
        - expectedAnswer: a thorough answer (2-4 sectences)
        - difficulty: "EASY", "MEDIUM", or "HARD"
        - conceptName: which concept from the list above this question tests

        Rules:
        - EASY: recall or definition ("what is X?")
        - MEDIUM: application ("When would you use X over Y?")
        - HARD: synthesis or trade-offs ("What are the failure modes of X at scale?")
        - Generate 1-2 questions per concept
        - Prefer MEDIUM and HARD over EASY

        Example format:
        [
            {
                "text": "What problem does the Virtual DOM solve, and what is its main trade-off?",
                "expectedAnswer": "The Virtual DOM minimizes expensive DOM mutations by batching updates in memory first. The trade-of is memory overhead and an initial reconciliation cost - for simple static pages, direct DOM manipulation is actually faster.",
                "difficulty": "MEDIUM",
                "conceptName": "Virtual DOM"
            }
        ]
    `,

  parseResponse: (raw: string): GeneratedQuestion[] => {
    const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned) as GeneratedQuestion[];
  },
};
