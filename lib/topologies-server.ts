// Chargement serveur des topologies pédagogiques (V22 CP4). Contenu versionné
// (data/topologies/*.json), validé au chargement contre les données réelles
// (jours, parcours, compétences). Une topologie cassée lève une erreur explicite.
// Aucune exécution ici : l'analyse passe par lib/topology-analysis.mjs.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cache } from 'react';
import { validateTopology, publicTopologyView } from './topology.mjs';
import type { Topology } from './topology';
import { getProgram } from './program';
import { buildCatalogue } from './catalogue.mjs';
import { isKnownSkill } from './skill-taxonomy.mjs';

const DIR = join(process.cwd(), 'data', 'topologies');

function loadAll(): Topology[] {
  let files: string[] = [];
  try { files = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort(); } catch { return []; }
  const program = getProgram();
  const validDays = new Set<number>((program.days ?? []).map((d: { day: number }) => d.day));
  const trackIds = new Set<string>((buildCatalogue(program).tracks as { id: string }[]).map((t) => t.id));
  const ctx = { skillIds: { has: (s: string) => isKnownSkill(s) }, validDays, trackIds };
  const out: Topology[] = [];
  const seen = new Set<string>();
  for (const f of files) {
    const raw = JSON.parse(readFileSync(join(DIR, f), 'utf8')) as Topology;
    const v = validateTopology(raw, ctx);
    if (!v.ok) throw new Error(`Topologie invalide (${f}) : ${v.errors.join(' ; ')}`);
    if (seen.has(raw.id)) throw new Error(`Topologie : id dupliqué « ${raw.id} » (${f}).`);
    seen.add(raw.id);
    out.push(raw);
  }
  return out;
}

export const listTopologies: () => Topology[] = cache(() => loadAll());
export function getTopology(id: string): Topology | null {
  return listTopologies().find((t) => t.id === id) ?? null;
}
export function publicTopology(t: Topology) {
  return publicTopologyView(t);
}
/** Résumés publics pour le catalogue et la recherche (jamais de champ interne sensible). */
export function publicTopologySummaries() {
  return listTopologies().map((t) => ({
    id: t.id, title: t.title, description: t.description,
    nodeCount: t.nodes.length, edgeCount: t.edges.length,
    environments: t.environments ?? [],
    skills: t.skills ?? [], dayRefs: t.dayRefs ?? [], trackScope: t.trackScope ?? null,
  }));
}
