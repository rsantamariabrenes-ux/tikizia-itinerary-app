import Anthropic from '@anthropic-ai/sdk';
import { QuizAnswers } from './types';
import { loadKnowledgeBase, loadSystemPrompt } from './knowledge-base';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const ADVENTURE_LABELS = ['Easy-going', 'Moderate', 'Adventurous', 'Extreme'];
const HIKING_LABELS = ['Not really', 'Casual strolls', 'Long trails', 'I live for it'];

const API_MODE_PREFIX = `API MODE — CRITICAL OPERATING INSTRUCTIONS:
1. You are running via API with no user interaction and no internet access.
2. OUTPUT LANGUAGE: Generate the ENTIRE itinerary in ENGLISH. All section titles, descriptions, tips, restaurant names, activity names, and UI text must be in English.
3. Generate the complete HTML IMMEDIATELY. Do NOT review first, do NOT ask for confirmation, do NOT ask questions.
4. For URLs you cannot verify: use "#" as a placeholder.
5. Your response must begin with <!DOCTYPE html> on the first line.
6. If the full content exceeds the limit, prioritize: info card + index + complete day-by-day itinerary + ET-CTA section.

---

`;

function buildMessages(answers: QuizAnswers, knowledgeBase: string) {
  const travelerForm = `
DESTINATIONS: ${answers.destinations.join(' + ')}
START DATE: ${answers.startDate}
DURATION: ${answers.duration}
TRAVELERS: ${answers.travelers}
TRIP GOAL: ${answers.tripGoal}
ACTIVITIES OF INTEREST: ${answers.activities.join(', ')}
TRAVEL STYLE: ${answers.travelStyle}
ADVENTURE LEVEL: ${ADVENTURE_LABELS[answers.adventureLevel - 1] ?? 'Moderate'}
HIKING INTEREST: ${HIKING_LABELS[answers.hikingInterest - 1] ?? 'Casual strolls'}
TRAVELING WITH KIDS: ${answers.hasKids ? `Yes — ages: ${answers.kidsAges || 'not specified'}` : 'No'}
TRANSPORT: ${answers.transport}
TOTAL BUDGET: ${answers.budget} per person (excluding flights)
ACCOMMODATION ALREADY BOOKED: ${answers.hasAccommodation ? 'Yes' : 'No'}
EXTRA INFO: ${answers.extraContext || 'None'}
`.trim();

  return `## KNOWLEDGE BASE\n\n${knowledgeBase}\n\n---\n\n## TRAVELER FORM\n\n${travelerForm}`;
}

export function streamItinerary(answers: QuizAnswers): ReadableStream<Uint8Array> {
  const systemPrompt = API_MODE_PREFIX + loadSystemPrompt();
  const knowledgeBase = loadKnowledgeBase();
  const userMessage = buildMessages(answers, knowledgeBase);
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const stream = await client.messages.stream({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 8192,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        });

        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}
