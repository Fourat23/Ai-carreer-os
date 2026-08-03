// Chargement serveur des scénarios de sécurité et playbooks (V24 CP3). Contenu
// versionné (data/security/*.json, data/playbooks/*.json), validé au chargement
// contre les données réelles. Un scénario cassé lève une erreur explicite. Aucune
// exécution ici : l'analyse passe par lib/security-analysis.mjs. Base CVE FACTICE.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { cache } from 'react';
import { validateScenario, publicScenarioView } from './security.mjs';
import type { SecurityScenario } from './security';
import { getProgram } from './program';
import { buildCatalogue } from './catalogue.mjs';
import { isKnownSkill } from './skill-taxonomy.mjs';

const SEC_DIR = join(process.cwd(), 'data', 'security');
const PB_DIR = join(process.cwd(), 'data', 'playbooks');

function loadAll(): SecurityScenario[] {
  let files: string[] = [];
  try { files = readdirSync(SEC_DIR).filter((f) => f.endsWith('.json') && f !== 'cve-db.json').sort(); } catch { return []; }
  const program = getProgram();
  const validDays = new Set<number>((program.days ?? []).map((d: { day: number }) => d.day));
  const trackIds = new Set<string>((buildCatalogue(program).tracks as { id: string }[]).map((t) => t.id));
  const ctx = { skillIds: { has: (s: string) => isKnownSkill(s) }, validDays, trackIds };
  const out: SecurityScenario[] = [];
  const seen = new Set<string>();
  for (const f of files) {
    const raw = JSON.parse(readFileSync(join(SEC_DIR, f), 'utf8')) as SecurityScenario;
    const v = validateScenario(raw, ctx);
    if (!v.ok) throw new Error(`Scénario de sécurité invalide (${f}) : ${v.errors.join(' ; ')}`);
    if (seen.has(raw.id)) throw new Error(`Sécurité : id dupliqué « ${raw.id} » (${f}).`);
    seen.add(raw.id);
    out.push(raw);
  }
  return out;
}

export const listScenarios: () => SecurityScenario[] = cache(() => loadAll());
export function getScenario(id: string): SecurityScenario | null {
  return listScenarios().find((s) => s.id === id) ?? null;
}
export function publicScenario(s: SecurityScenario) {
  return publicScenarioView(s);
}
export const getCveDb: () => object = cache((): object => {
  const p = join(SEC_DIR, 'cve-db.json');
  try { return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : []; } catch { return []; }
});
export const listPlaybooks: () => Record<string, unknown>[] = cache(() => {
  try {
    return readdirSync(PB_DIR).filter((f) => f.endsWith('.json')).sort()
      .map((f) => JSON.parse(readFileSync(join(PB_DIR, f), 'utf8')));
  } catch { return []; }
});
export function getPlaybook(id: string): Record<string, unknown> | null {
  return listPlaybooks().find((p) => p.id === id) ?? null;
}
/** Résumés publics pour le catalogue et la recherche (jamais de champ interne sensible). */
export function publicScenarioSummaries() {
  return listScenarios().map((s) => ({
    id: s.id, title: s.title, description: s.description, domain: s.domain,
    difficulty: s.difficulty ?? null, incident: s.incident ?? null,
    artifactCount: s.artifacts.length,
    skills: s.skills ?? [], dayRefs: s.dayRefs ?? [], trackScope: s.trackScope ?? null,
  }));
}
export function publicPlaybookSummaries() {
  return listPlaybooks().map((p) => ({ id: p.id as string, title: (p.title ?? p.situation) as string, situation: p.situation as string }));
}
