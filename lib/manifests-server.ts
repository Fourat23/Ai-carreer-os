// Chargement serveur des scénarios de manifests Kubernetes (V23 CP4). Contenu
// versionné (data/manifests/*.json), validé au chargement contre les données
// réelles (jours, parcours, compétences). Un scénario cassé lève une erreur
// explicite. Aucune exécution ici : l'analyse passe par lib/manifest-analysis.mjs.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cache } from 'react';
import { validateManifestSet, publicManifestView } from './manifest.mjs';
import type { ManifestSet } from './manifest';
import { getProgram } from './program';
import { buildCatalogue } from './catalogue.mjs';
import { isKnownSkill } from './skill-taxonomy.mjs';

const DIR = join(process.cwd(), 'data', 'manifests');

function loadAll(): ManifestSet[] {
  let files: string[] = [];
  try { files = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort(); } catch { return []; }
  const program = getProgram();
  const validDays = new Set<number>((program.days ?? []).map((d: { day: number }) => d.day));
  const trackIds = new Set<string>((buildCatalogue(program).tracks as { id: string }[]).map((t) => t.id));
  const ctx = { skillIds: { has: (s: string) => isKnownSkill(s) }, validDays, trackIds };
  const out: ManifestSet[] = [];
  const seen = new Set<string>();
  for (const f of files) {
    const raw = JSON.parse(readFileSync(join(DIR, f), 'utf8')) as ManifestSet;
    const v = validateManifestSet(raw, ctx);
    if (!v.ok) throw new Error(`Scénario de manifest invalide (${f}) : ${v.errors.join(' ; ')}`);
    if (seen.has(raw.id)) throw new Error(`Manifest : id dupliqué « ${raw.id} » (${f}).`);
    seen.add(raw.id);
    out.push(raw);
  }
  return out;
}

export const listManifests: () => ManifestSet[] = cache(() => loadAll());
export function getManifest(id: string): ManifestSet | null {
  return listManifests().find((m) => m.id === id) ?? null;
}
export function publicManifest(m: ManifestSet) {
  return publicManifestView(m);
}
/** Résumés publics pour le catalogue et la recherche (jamais de champ interne sensible). */
export function publicManifestSummaries() {
  return listManifests().map((m) => ({
    id: m.id, title: m.title, description: m.description,
    resourceCount: m.resources.length,
    kinds: [...new Set(m.resources.map((r) => r.kind))],
    skills: m.skills ?? [], dayRefs: m.dayRefs ?? [], trackScope: m.trackScope ?? null,
  }));
}
