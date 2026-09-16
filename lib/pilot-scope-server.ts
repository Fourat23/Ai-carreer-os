// V77.1 · CP3 — Liant applicatif du scope du pilote.
//
// Il lit la fixture gelée et le corpus réel, puis laisse `pilot-scope.mjs`
// décider. Rien n'est décidé ici : la mesure du CP3, le test et — au CP4 — la
// répétition à blanc doivent voir EXACTEMENT le même scope.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getProgram } from './program';
import { getConceptCatalogue } from './retention-server';
import { listExercises } from './exercises-server';
import { listTransferChallenges } from './transfer-challenges-server';
import { incoherencesDuScope } from './pilot-scope';
import type { FixturePilote, CorpusDuScope } from './pilot-scope';

/** Le chemin de la fixture, exporté pour que le test et le produit parlent du même fichier. */
export const CHEMIN_FIXTURE_PILOTE = 'data/pilot/v78-pilot-1.json';

/** La version de protocole gelée au CP1. Recopiée nulle part ailleurs. */
export const PROTOCOL_VERSION = 'V78-PILOT-PROTOCOL-1';

export function lireFixturePilote(): FixturePilote {
  return JSON.parse(readFileSync(join(process.cwd(), CHEMIN_FIXTURE_PILOTE), 'utf8')) as FixturePilote;
}

export function corpusDuScope(): CorpusDuScope {
  const program = getProgram() as { lessons?: { slug: string; practiceRefs?: { kind: string; id: string }[] }[] };
  const lessons = program.lessons ?? [];

  const declarants = new Map<string, string[]>();
  for (const l of lessons) {
    for (const r of l.practiceRefs ?? []) {
      if (r.kind !== 'exercise') continue;
      if (!declarants.has(r.id)) declarants.set(r.id, []);
      declarants.get(r.id)!.push(l.slug);
    }
  }

  const formats = new Map<string, string[]>();
  for (const c of getConceptCatalogue().concepts) formats.set(c.id, c.formats as string[]);

  const transferts = new Set<string>(listTransferChallenges().map((t) => t.id));

  return {
    lecons: new Set(lessons.map((l) => l.slug)),
    exercices: new Set(listExercises().map((e) => e.id)),
    transferts,
    declarantsDe: (id: string) => declarants.get(id) ?? [],
    formatsDe: (slug: string) => formats.get(slug) ?? [],
  };
}

/** Les incohérences du scope gelé face au corpus réel. Vide = il tient. */
export function incoherencesDuScopeGele(): string[] {
  return incoherencesDuScope(lireFixturePilote(), corpusDuScope(), PROTOCOL_VERSION);
}
