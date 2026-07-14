// Agrégateur Batch 4A : enrichissement des jours 181-210 (cœur IA).
// Semaines 26-28 (ML final, DL, intuition LLM) + 29-30 (LLM en pratique).

import { ENRICH_W26_28 } from './days-enrich-181-196.mjs';
import { ENRICH_W29_30 } from './days-enrich-197-210.mjs';

export const ENRICH_181_210 = { ...ENRICH_W26_28, ...ENRICH_W29_30 };
