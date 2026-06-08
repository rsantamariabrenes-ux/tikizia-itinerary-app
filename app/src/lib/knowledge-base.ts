import { readFileSync } from 'fs';
import { join } from 'path';

const KB_DIR = join(process.cwd(), 'knowledge-base');
const PROMPTS_DIR = join(process.cwd(), 'prompts');

const KB_FILES = [
  'providers-by-zone.md',
  'free-activities-by-zone.md',
  'local-restaurants-by-zone.md',
  'tour-catalog-notes.md',
  'la-fortuna.md',
  'manuel-antonio.md',
];

export function loadKnowledgeBase(): string {
  return KB_FILES.map((filename) => {
    try {
      const content = readFileSync(join(KB_DIR, filename), 'utf-8');
      return `### FILE: ${filename}\n\n${content}`;
    } catch {
      return `### FILE: ${filename}\n\n[File not found — skipped]`;
    }
  }).join('\n\n---\n\n');
}

export function loadSystemPrompt(): string {
  return readFileSync(join(PROMPTS_DIR, 'itinerary-generator-ET.md'), 'utf-8');
}
