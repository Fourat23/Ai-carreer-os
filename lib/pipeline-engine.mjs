// Orchestrateur de pipeline — PUR et DÉTERMINISTE (ADR/TSD-021).
//
// Résout le trigger, calcule l'ordre topologique du DAG, exécute les jobs via des
// actions internes allowlistées, propage les statuts (success/failed/skipped/
// blocked/cancelled), gère fail-fast et allowFailure, l'approbation simulée, et
// agrège un statut global. Horloge INJECTABLE → durées déterministes. Aucune I/O,
// aucun réseau, aucune commande système. Logs bornés, secrets masqués.

import { topoOrder, findCycle } from './pipeline.mjs';
import { runAction } from './pipeline-actions.mjs';

const DEFAULT_DURATIONS = { lint: 200, test: 800, build: 1500, 'validate-config': 100, 'artifact-check': 100, 'cache-check': 50, 'branch-policy': 50, approval: 0, 'secret-scan': 150, 'status-aggregate': 50 };

/** Le pipeline doit-il se déclencher pour cet événement ? PUR. */
export function resolveTrigger(pipeline, event = {}) {
  if (!pipeline?.trigger?.includes(event.kind)) return false;
  const branchOk = !(pipeline.branchFilters?.length) || (event.branch != null && pipeline.branchFilters.includes(event.branch));
  const tagOk = !(pipeline.tagFilters?.length) || (event.tag != null && pipeline.tagFilters.includes(event.tag));
  // Les filtres de branche ne s'appliquent qu'aux événements de branche ; idem tags.
  if (event.kind === 'tag') return tagOk;
  return branchOk;
}

function conditionHolds(job, event) {
  const c = job.condition;
  if (!c) return true;
  if (c.event && !c.event.includes(event.kind)) return false;
  if (c.branchIn && !(event.branch != null && c.branchIn.includes(event.branch))) return false;
  if (c.tagIn && !(event.tag != null && c.tagIn.includes(event.tag))) return false;
  return true;
}

/**
 * Exécute un pipeline de façon déterministe.
 * @param {object} pipeline
 * @param {object} event { kind, branch?, tag? }
 * @param {object} ctx { branch?, approved?, secrets?, changedFiles?, artifacts? }
 * @param {{ clock?:()=>number, runId?:string, cancelBefore?:string }} opt
 *   clock() → ms de base ; cancelBefore = id du job avant lequel on annule tout.
 * @returns {object} PipelineRun
 */
export function runPipeline(pipeline, event = {}, ctx = {}, opt = {}) {
  const clock = opt.clock ?? (() => 0);
  const t0 = clock();
  const base = {
    id: opt.runId ?? 'run', pipelineId: pipeline?.id ?? null, triggered: false,
    status: 'skipped', startedAt: t0, endedAt: t0, durationMs: 0,
    jobs: {}, logs: [], artifacts: [], diagnostic: undefined,
  };

  // Cycle → échec net, aucune exécution.
  const cyc = findCycle(pipeline?.jobs ?? []);
  if (cyc) return { ...base, status: 'failed', diagnostic: `E_CYCLE : ${cyc.join(' → ')}` };

  // Déclenchement.
  if (!resolveTrigger(pipeline, event)) {
    return { ...base, triggered: false, status: 'skipped', logs: [`pipeline non déclenché pour « ${event.kind} »`] };
  }

  const { order } = topoOrder(pipeline.jobs);
  const byId = new Map(pipeline.jobs.map((j) => [j.id, j]));
  const result = {}; // id -> { status, durationMs, logs, artifacts }
  const producedArtifacts = new Set(ctx.artifacts ?? []);
  const runCtx = { ...ctx, branch: ctx.branch ?? event.branch, artifacts: [...producedArtifacts] };
  let cursor = t0;
  let hardFailed = false;
  let cancelling = false;

  for (const id of order) {
    const job = byId.get(id);
    if (cancelling || (opt.cancelBefore && opt.cancelBefore === id)) {
      cancelling = true;
      result[id] = { status: 'cancelled', durationMs: 0, logs: ['annulé'], artifacts: [] };
      continue;
    }
    // Dépendances D'ABORD : un prérequis échoué (non toléré)/bloqué/annulé → BLOQUÉ
    // (plus précis que « annulé » : la cause est la dépendance, pas le fail-fast).
    const deps = job.needs ?? [];
    const depBlocked = deps.some((d) => {
      const r = result[d];
      if (!r) return false;
      if (r.status === 'blocked' || r.status === 'cancelled') return true;
      if (r.status === 'failed') return !(byId.get(d)?.allowFailure);
      return false;
    });
    if (depBlocked) { result[id] = { status: 'blocked', durationMs: 0, logs: ['bloqué : un prérequis a échoué'], artifacts: [] }; continue; }
    // fail-fast ENSUITE : un job INDÉPENDANT non démarré après un échec dur est annulé.
    if (hardFailed && pipeline.failFast !== false) {
      result[id] = { status: 'cancelled', durationMs: 0, logs: ['annulé (fail-fast)'], artifacts: [] };
      continue;
    }
    // Condition.
    if (!conditionHolds(job, event)) { result[id] = { status: 'skipped', durationMs: 0, logs: ['condition non satisfaite'], artifacts: [] }; continue; }

    // Exécution de l'action (avec artefacts déjà produits).
    runCtx.artifacts = [...producedArtifacts];
    const out = runAction(job, runCtx);
    const dur = Number(job.with?.durationMs ?? DEFAULT_DURATIONS[job.action] ?? 100);
    cursor += dur;
    for (const a of out.artifacts ?? []) producedArtifacts.add(a);
    result[id] = { status: out.status, durationMs: dur, logs: out.logs, artifacts: out.artifacts ?? [] };

    if (out.status === 'failed' && !job.allowFailure) hardFailed = true;
    if (out.status === 'blocked') { /* approbation en attente : bloque la suite dépendante, pas fail-fast */ }
  }

  // Statut global.
  const statuses = Object.values(result).map((r) => r.status);
  const anyHardFail = pipeline.jobs.some((j) => result[j.id]?.status === 'failed' && !j.allowFailure);
  const anyBlocked = statuses.includes('blocked');
  const anyCancelled = statuses.includes('cancelled');
  let global = 'success';
  if (anyHardFail) global = 'failed';
  else if (anyCancelled) global = 'cancelled';
  else if (anyBlocked) global = 'blocked';

  const logs = [];
  for (const j of pipeline.jobs) for (const l of result[j.id]?.logs ?? []) logs.push(`[${j.id}] ${l}`);

  return {
    ...base, triggered: true, status: global,
    startedAt: t0, endedAt: t0 + (cursor - t0), durationMs: cursor - t0,
    jobs: result, logs: logs.slice(0, 200), artifacts: [...producedArtifacts].map((name) => ({ name })),
    diagnostic: global === 'failed' ? 'un ou plusieurs jobs ont échoué' : undefined,
  };
}
