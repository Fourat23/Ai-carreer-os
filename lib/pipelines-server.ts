// Chargement serveur des pipelines pédagogiques (V21 CP5). Contenu versionné
// (data/pipelines/*.json), validé au chargement contre les données réelles
// (jours, parcours, compétences). Un pipeline cassé lève une erreur explicite.
// Aucune exécution ici : l'orchestration passe par lib/pipeline-engine.mjs.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cache } from 'react';
import { validatePipeline, publicPipelineView } from './pipeline.mjs';
import type { Pipeline } from './pipeline';
import { getProgram } from './program';
import { buildCatalogue } from './catalogue.mjs';
import { isKnownSkill } from './skill-taxonomy.mjs';

const DIR = join(process.cwd(), 'data', 'pipelines');

function loadAll(): Pipeline[] {
  let files: string[] = [];
  try { files = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort(); } catch { return []; }
  const program = getProgram();
  const validDays = new Set<number>((program.days ?? []).map((d: { day: number }) => d.day));
  const trackIds = new Set<string>((buildCatalogue(program).tracks as { id: string }[]).map((t) => t.id));
  const ctx = { skillIds: { has: (s: string) => isKnownSkill(s) }, validDays, trackIds };
  const out: Pipeline[] = [];
  const seen = new Set<string>();
  for (const f of files) {
    const raw = JSON.parse(readFileSync(join(DIR, f), 'utf8')) as Pipeline;
    const v = validatePipeline(raw, ctx);
    if (!v.ok) throw new Error(`Pipeline invalide (${f}) : ${v.errors.join(' ; ')}`);
    if (seen.has(raw.id)) throw new Error(`Pipeline : id dupliqué « ${raw.id} » (${f}).`);
    seen.add(raw.id);
    out.push(raw);
  }
  return out;
}

export const listPipelines: () => Pipeline[] = cache(() => loadAll());
export function getPipeline(id: string): Pipeline | null {
  return listPipelines().find((p) => p.id === id) ?? null;
}
export function publicPipeline(p: Pipeline) {
  return publicPipelineView(p);
}
/** Résumés publics pour le catalogue et la recherche (jamais de fixture/secret). */
export function publicPipelineSummaries() {
  return listPipelines().map((p) => ({
    id: p.id, title: p.title, description: p.description,
    trigger: p.trigger, jobCount: p.jobs.length, stageCount: p.stages.length,
    skills: p.skills ?? [], dayRefs: p.dayRefs ?? [], trackScope: p.trackScope ?? null,
    requiresApproval: !!p.approval?.required,
  }));
}
