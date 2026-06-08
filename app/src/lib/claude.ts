import Anthropic from '@anthropic-ai/sdk';
import { QuizAnswers } from './types';
import { loadKnowledgeBase, loadSystemPrompt } from './knowledge-base';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const ADVENTURE_LABELS = ['Easy-going', 'Moderate', 'Adventurous', 'Extreme'];
const HIKING_LABELS = ['Not really', 'Casual strolls', 'Long trails', 'I live for it'];

const ADOBECAR_IFRAME = `<iframe src="https://www.adobecar.com/en/iframe/?iframe_layout=1&promo_code=EXPTK" frameborder="0" allowfullscreen style="width:100%;max-width:620px;height:500px;min-height:450px;border:none;border-radius:8px;display:block"></iframe>`;

const CAR_RENTAL_KEYWORDS = ['rent', 'car rental', 'alquiler', 'rented', 'self-drive', 'auto alquilado', 'carro alquilado'];

function isCarRental(transport: string): boolean {
  const t = transport.toLowerCase();
  return CAR_RENTAL_KEYWORDS.some(k => t.includes(k));
}

const API_MODE_PREFIX = `API MODE — CRITICAL OPERATING INSTRUCTIONS:
1. You are running via API with no user interaction and no internet access.
2. OUTPUT LANGUAGE: Generate the ENTIRE itinerary in ENGLISH. All section titles, descriptions, tips, restaurant names, activity names, and UI text must be in English.
3. Generate the complete HTML IMMEDIATELY. Do NOT wrap in markdown code fences. Do NOT write \`\`\`html. Do NOT review first. Do NOT ask questions.
4. Your response must begin with <!DOCTYPE html> — that is the very first character output. Nothing before it.
5. For URLs you cannot verify: use "#" as a placeholder.
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

  let carRentalInstruction = '';
  if (isCarRental(answers.transport)) {
    carRentalInstruction = `

---

## ⚠️ MANDATORY CAR RENTAL INSTRUCTION

The traveler is renting a car. You MUST include the following in the General Orientation section, as a fourth orientation-item card (after the three standard cards), with the exact HTML below — do NOT modify the iframe or omit it:

\`\`\`html
<div class="orientation-item">
  <div class="orientation-header">
    <div class="orientation-icon">🚗</div>
    <h3>Car Rental — Book with Our Trusted Partner</h3>
  </div>
  <p>For the best rates and reliable vehicles in Costa Rica, use the search below to compare options and reserve directly. No extra fees — best price guaranteed.</p>
  <div style="margin-top:12px;display:flex;justify-content:center;width:100%">
    ${ADOBECAR_IFRAME}
  </div>
</div>
\`\`\`

Do NOT recommend any other car rental company (Hertz, Budget, Alamo, Economy, National, etc.). This is the ONLY car rental recommendation allowed.`;
  }

  const kbInstruction = `
---

## ⚠️ MANDATORY: HOW TO USE THE KNOWLEDGE BASE ABOVE

The KNOWLEDGE BASE contains curated, first-hand data from Rod (local expert guide). It takes priority over your general training knowledge. Apply these rules strictly:

1. **RESTAURANTS**: Use ONLY restaurants listed in the KB for the destination. Include Rod's exact tip as an insider quote or note (e.g. "Rod's tip: …").
2. **FREE ACTIVITIES**: Include the free activities from the KB with Rod's best-time and insider tip.
3. **ROD'S BLOG NOTES**: This is the most valuable content. Surface Rod's specific facts in the itinerary:
   - Exact opening hours, closing days, entrance fees → put in the activity card
   - Parking tips and scam warnings → put in an alert-box inside the relevant day
   - Trail recommendations with distances → use as specific activities
   - Guide recommendations (cost, what to ask for) → include in the activity description
   - What to bring, wildlife tips → include in the day highlights or tips section
4. **PROVIDERS**: Use the provider booking links (wa.me/50687979494) for activities that have ✅ next to them.
5. **GENERAL NOTES**: Use the zona general notes (best season, transport tips) in the Orientation section.
6. If the KB has data for the destination → use it. Do NOT substitute with generic internet knowledge when specific KB data exists.`;

  return `## KNOWLEDGE BASE\n\n${knowledgeBase}\n\n${kbInstruction}\n\n---\n\n## TRAVELER FORM\n\n${travelerForm}${carRentalInstruction}`;
}

// Strip opening ```html and closing ``` code fences if the model wraps the output
function stripCodeFence(chunk: string, buffer: { text: string; stripped: boolean }): string {
  if (buffer.stripped) return chunk;

  buffer.text += chunk;

  // Wait until we have enough to detect a code fence
  if (buffer.text.length < 20) return '';

  buffer.stripped = true;
  // Remove leading ```html\n or ```\n if present
  return buffer.text.replace(/^```(?:html)?\n?/, '');
}

export function streamItinerary(answers: QuizAnswers): ReadableStream<Uint8Array> {
  const systemPrompt = API_MODE_PREFIX + loadSystemPrompt();
  const knowledgeBase = loadKnowledgeBase();
  const userMessage = buildMessages(answers, knowledgeBase);
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const fenceBuffer = { text: '', stripped: false };
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
            const cleaned = stripCodeFence(event.delta.text, fenceBuffer);
            if (cleaned) controller.enqueue(encoder.encode(cleaned));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}
