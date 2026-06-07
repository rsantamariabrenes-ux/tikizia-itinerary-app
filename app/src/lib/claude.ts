import Anthropic from '@anthropic-ai/sdk';
import { QuizAnswers } from './types';
import { loadKnowledgeBase, loadSystemPrompt } from './knowledge-base';
import { fetchBlogPosts } from './blog-fetcher';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const ADVENTURE_LABELS = ['Easy-going', 'Moderate', 'Adventurous', 'Extreme'];
const HIKING_LABELS = ['Not really', 'Casual strolls', 'Long trails', 'I live for it'];

export async function generateItinerary(answers: QuizAnswers): Promise<string> {
  const [systemPrompt, knowledgeBase, blogPosts] = await Promise.all([
    Promise.resolve(loadSystemPrompt()),
    Promise.resolve(loadKnowledgeBase()),
    fetchBlogPosts(),
  ]);

  const travelerForm = `
DESTINOS: ${answers.destinations.join(' + ')}
FECHA DE INICIO: ${answers.startDate}
DURACIÓN: ${answers.duration}
VIAJEROS: ${answers.travelers}
OBJETIVO DEL VIAJE: ${answers.tripGoal}
ACTIVIDADES DE INTERÉS: ${answers.activities.join(', ')}
ESTILO DE VIAJE: ${answers.travelStyle}
NIVEL DE AVENTURA: ${ADVENTURE_LABELS[answers.adventureLevel - 1] ?? 'Moderate'}
INTERÉS EN SENDERISMO: ${HIKING_LABELS[answers.hikingInterest - 1] ?? 'Casual strolls'}
VIAJAN CON NIÑOS: ${answers.hasKids ? `Sí — edades: ${answers.kidsAges || 'no especificadas'}` : 'No'}
TRANSPORTE: ${answers.transport}
PRESUPUESTO TOTAL: ${answers.budget} por persona (excluyendo vuelos)
YA TIENEN ALOJAMIENTO: ${answers.hasAccommodation ? 'Sí' : 'No'}
INFORMACIÓN EXTRA: ${answers.extraContext || 'Ninguna'}
`.trim();

  const userMessage = `## KNOWLEDGE BASE\n\n${knowledgeBase}\n\n---\n\n## RECENT BLOG POSTS FROM EXPLORETIKIZIA.COM\n\n${blogPosts || 'Not available'}\n\n---\n\n## TRAVELER FORM\n\n${travelerForm}`;

  const apiModePrefix = `MODO API — INSTRUCCIONES CRÍTICAS DE OPERACIÓN:
1. Estás ejecutándote vía API sin interacción con el usuario y sin acceso a internet.
2. GENERA el HTML completo INMEDIATAMENTE. NO hagas revisión previa, NO pidas confirmaciones, NO hagas preguntas.
3. Para URLs que no puedas verificar: usa "#" como placeholder.
4. Tu respuesta debe comenzar con <!DOCTYPE html> en la primera línea.
5. Si el contenido completo excede el límite, prioriza: tarjeta info + índice + itinerario día a día completo + sección ET-CTA.

---

`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 8192,
    system: apiModePrefix + systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Claude returned non-text response');
  return content.text;
}
