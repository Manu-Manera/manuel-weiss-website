import { AI_COACH_SYSTEM_PROMPT } from '../prompts/aiCoachBase';
import {
  DEMO_WORD_IMPORT_ANALYSIS_PROMPT,
  DEMO_WORD_IMPORT_STRUCTURE_PROMPT,
  DEMO_WORD_IMPORT_REFINE_PROMPT,
} from '../prompts/demoWordImportPrompt';
import { chatJson } from './openaiCoach';
import { buildDemoStateFromStructure, normalizeSlug } from '../utils/demoHtmlBuilder';

function truncateForPrompt(text, max = 90000) {
  if (text.length <= max) return text;
  return text.slice(0, max) + '\n\n[… gekürzt …]';
}

/**
 * Phase A — inhaltliche Analyse
 * @param {string} documentText
 */
export async function analyzeWordDocument(documentText) {
  const user = `DEMO-SKRIPT (aus Word):\n\n${truncateForPrompt(documentText)}`;
  return chatJson({
    system: `${AI_COACH_SYSTEM_PROMPT}\n\n${DEMO_WORD_IMPORT_ANALYSIS_PROMPT}`,
    user,
    maxTokens: 2500,
  });
}

/**
 * Phase B — strukturiertes Demo-Modell
 * @param {string} documentText
 * @param {object|null} analysis
 */
export async function structureWordDocument(documentText, analysis = null) {
  const analysisBlock = analysis
    ? `\n\nVORANALYSE:\n${JSON.stringify(analysis, null, 2)}`
    : '';
  const user = `DEMO-SKRIPT:\n\n${truncateForPrompt(documentText)}${analysisBlock}`;
  const structure = await chatJson({
    system: `${AI_COACH_SYSTEM_PROMPT}\n\n${DEMO_WORD_IMPORT_STRUCTURE_PROMPT}`,
    user,
    maxTokens: 12000,
  });

  if (structure.catalogMeta?.slug) {
    structure.catalogMeta.slug = normalizeSlug(structure.catalogMeta.slug);
  } else if (structure.catalogMeta?.name) {
    structure.catalogMeta.slug = normalizeSlug(structure.catalogMeta.name);
  }

  const demoState = buildDemoStateFromStructure(structure);
  return { structure, demoState };
}

/**
 * @param {object} structure
 * @param {string} instruction
 */
export async function refineDemoStructure(structure, instruction) {
  const user = `AKTUELLER ENTWURF:\n${JSON.stringify(structure, null, 2)}\n\nANWEISUNG:\n${instruction}`;
  const updated = await chatJson({
    system: `${AI_COACH_SYSTEM_PROMPT}\n\n${DEMO_WORD_IMPORT_REFINE_PROMPT}`,
    user,
    maxTokens: 12000,
  });
  if (updated.catalogMeta?.slug) {
    updated.catalogMeta.slug = normalizeSlug(updated.catalogMeta.slug);
  }
  return { structure: updated, demoState: buildDemoStateFromStructure(updated) };
}
