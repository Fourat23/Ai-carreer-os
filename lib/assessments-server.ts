// Chargement serveur des évaluations diagnostiques (fixtures JSON validées,
// mémoïsées). Les évaluations sont du CONTENU versionné (data/assessments/*.json),
// séparé de la progression personnelle. Chaque fixture est validée au chargement :
// une fixture cassée lève une erreur explicite plutôt que d'échouer plus tard.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateAssessment } from './assessment.mjs';
import type { Assessment } from './assessment';

const DIR = join(process.cwd(), 'data', 'assessments');

let cached: Assessment[] | null = null;

function loadAll(): Assessment[] {
  let files: string[] = [];
  try {
    files = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort();
  } catch {
    return [];
  }
  const out: Assessment[] = [];
  const seen = new Set<string>();
  for (const f of files) {
    const raw = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
    const v = validateAssessment(raw);
    if (!v.ok) throw new Error(`Évaluation invalide (${f}) : ${v.errors.join(' ; ')}`);
    if (seen.has(raw.id)) throw new Error(`Évaluation : id dupliqué « ${raw.id} » (${f}).`);
    seen.add(raw.id);
    out.push(raw as Assessment);
  }
  return out;
}

export function listAssessments(): Assessment[] {
  if (!cached) cached = loadAll();
  return cached;
}

export function getAssessment(id: string): Assessment | null {
  return listAssessments().find((a) => a.id === id) ?? null;
}
