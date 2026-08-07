// Chargement serveur des architectures cloud pédagogiques (V25 CP3). Contenu
// versionné (data/cloud/*.json), validé au chargement contre les données réelles.
// price-book & provider-map sont FACTICES. Aucune exécution, aucun appel AWS/Azure :
// l'analyse passe par lib/cloud-analysis.mjs (déterministe, local).
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { cache } from 'react';
import { validateCloudArchitecture, publicCloudView } from './cloud-architecture.mjs';
import type { CloudArchitecture } from './cloud-architecture';
import { getProgram } from './program';
import { buildCatalogue } from './catalogue.mjs';
import { isKnownSkill } from './skill-taxonomy.mjs';

const DIR = join(process.cwd(), 'data', 'cloud');
const RESERVED = new Set(['price-book.json', 'provider-map.json']);

function loadAll(): CloudArchitecture[] {
  let files: string[] = [];
  try { files = readdirSync(DIR).filter((f) => f.endsWith('.json') && !RESERVED.has(f)).sort(); } catch { return []; }
  const program = getProgram();
  const validDays = new Set<number>((program.days ?? []).map((d: { day: number }) => d.day));
  const trackIds = new Set<string>((buildCatalogue(program).tracks as { id: string }[]).map((t) => t.id));
  const ctx = { skillIds: { has: (s: string) => isKnownSkill(s) }, validDays, trackIds };
  const out: CloudArchitecture[] = [];
  const seen = new Set<string>();
  for (const f of files) {
    const raw = JSON.parse(readFileSync(join(DIR, f), 'utf8')) as CloudArchitecture;
    const v = validateCloudArchitecture(raw, ctx);
    if (!v.ok) throw new Error(`Architecture cloud invalide (${f}) : ${v.errors.join(' ; ')}`);
    if (seen.has(raw.id)) throw new Error(`Cloud : id dupliqué « ${raw.id} » (${f}).`);
    seen.add(raw.id);
    out.push(raw);
  }
  return out;
}

export const listCloudArchitectures: () => CloudArchitecture[] = cache(() => loadAll());
export function getCloudArchitecture(id: string): CloudArchitecture | null {
  return listCloudArchitectures().find((a) => a.id === id) ?? null;
}
export function publicCloudArchitecture(a: CloudArchitecture) {
  return publicCloudView(a);
}
export const getPriceBook: () => object = cache((): object => {
  const p = join(DIR, 'price-book.json');
  try { return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : []; } catch { return []; }
});
export const getProviderMap: () => object = cache((): object => {
  const p = join(DIR, 'provider-map.json');
  try { return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : { mappings: [] }; } catch { return { mappings: [] }; }
});

/** Résumés publics pour le catalogue et la recherche (jamais de champ interne sensible). */
export function publicCloudSummaries() {
  return listCloudArchitectures().map((a) => ({
    id: a.id, title: a.title, description: a.description,
    provider: a.provider, region: a.region,
    resourceCount: (a.resources ?? []).length,
    need: a.need ?? null,
    skills: a.skills ?? [], dayRefs: a.dayRefs ?? [], trackScope: a.trackScope ?? null,
  }));
}
