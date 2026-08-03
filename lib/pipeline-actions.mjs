// Actions internes de pipeline — PURES, déterministes, allowlistées (TSD-021).
//
// Chaque action est une fonction (job, ctx) → { status, logs, artifacts? } qui
// opère UNIQUEMENT sur la fixture bornée `job.with` (jamais une commande système,
// jamais de réseau). Les logs sont bornés et les valeurs sensibles masquées.

import { maskSecrets, ACTION_KINDS } from './pipeline.mjs';

const clamp = (arr, n = 40) => (arr.length > n ? [...arr.slice(0, n), `… (${arr.length - n} lignes de plus, tronqué)`] : arr);
const secretValues = (job, ctx) => (job.secrets ?? []).map((name) => (ctx?.secrets ?? {})[name]).filter(Boolean);
const line = (job, ctx, s) => maskSecrets(s, secretValues(job, ctx));

/** validate-config : la config fournie est-elle marquée valide ? */
function validateConfig(job, ctx) {
  const w = job.with ?? {};
  const ok = w.valid !== false;
  return { status: ok ? 'success' : 'failed', logs: [line(job, ctx, ok ? 'config valide' : `config invalide : ${w.reason ?? 'schéma non respecté'}`)] };
}

/** lint : nombre d'erreurs de lint déclaré dans la fixture. */
function lint(job, ctx) {
  const n = Number(job.with?.lintErrors ?? 0);
  return { status: n > 0 ? 'failed' : 'success', logs: [line(job, ctx, n > 0 ? `${n} erreur(s) de lint` : 'lint : 0 erreur')] };
}

/** test : tests échoués / total dans la fixture. */
function test(job, ctx) {
  const failed = Number(job.with?.failed ?? 0);
  const total = Number(job.with?.total ?? 0);
  return { status: failed > 0 ? 'failed' : 'success', logs: [line(job, ctx, `${total - failed}/${total} tests réussis`)] };
}

/** build : la fixture indique-t-elle un build réussi ? produit un artefact. */
function build(job, ctx) {
  const ok = job.with?.buildOk !== false;
  const out = { status: ok ? 'success' : 'failed', logs: [line(job, ctx, ok ? 'build réussi' : `build échoué : ${job.with?.reason ?? 'erreur de compilation'}`)] };
  if (ok && (job.artifactsOut ?? []).length) out.artifacts = job.artifactsOut;
  return out;
}

/** artifact-check : l'artefact requis est-il présent (produit en amont) ? */
function artifactCheck(job, ctx) {
  const want = job.with?.artifact;
  const have = new Set(ctx?.artifacts ?? []);
  const ok = !want || have.has(want);
  return { status: ok ? 'success' : 'failed', logs: [line(job, ctx, ok ? `artefact « ${want ?? '(aucun)'} » présent` : `artefact « ${want} » manquant`)] };
}

/** cache-check : informatif — hit/miss selon les entrées changées. Ne fait pas échouer. */
function cacheCheck(job, ctx) {
  const changed = new Set(ctx?.changedFiles ?? job.with?.changedFiles ?? []);
  const inputs = job.with?.cacheInputs ?? [];
  const hit = inputs.length > 0 && !inputs.some((f) => changed.has(f));
  return { status: 'success', logs: [line(job, ctx, hit ? `cache HIT (clé ${job.cacheKey ?? '?'})` : 'cache MISS : reconstruction')] };
}

/** branch-policy : la branche courante est-elle autorisée ? */
function branchPolicy(job, ctx) {
  const allowed = job.with?.allowedBranches ?? ['main'];
  const branch = ctx?.branch ?? '';
  const ok = allowed.includes(branch);
  return { status: ok ? 'success' : 'failed', logs: [line(job, ctx, ok ? `branche « ${branch} » autorisée` : `branche « ${branch} » non conforme à la politique`)] };
}

/** approval : approbation manuelle simulée (injectée via ctx.approved). */
function approval(job, ctx) {
  const ok = ctx?.approved === true;
  return { status: ok ? 'success' : 'blocked', logs: [line(job, ctx, ok ? 'approbation accordée' : 'en attente d’approbation manuelle')] };
}

/** secret-scan : détecte un secret NON masqué dans un log factice. */
function secretScan(job, ctx) {
  const raw = String(job.with?.log ?? '');
  const masked = line(job, ctx, raw);
  const leaked = masked !== raw && /(sk-|ghp_|AKIA|xox[baprs]-|PRIVATE KEY)/.test(raw); // un secret était présent en clair
  const stillLeaks = /(sk-[A-Za-z0-9]{8,}|ghp_[A-Za-z0-9]{8,}|AKIA[0-9A-Z]{12,})/.test(masked);
  const ok = !stillLeaks;
  return { status: ok ? 'success' : 'failed', logs: [line(job, ctx, ok ? (leaked ? 'secret détecté et masqué dans les logs' : 'aucun secret en clair') : 'FUITE : secret en clair dans les logs')] };
}

/** status-aggregate : informatif (le statut global est calculé par le moteur). */
function statusAggregate(job, ctx) {
  return { status: 'success', logs: [line(job, ctx, 'agrégation du statut')] };
}

export const ACTIONS = {
  'validate-config': validateConfig,
  lint,
  test,
  build,
  'artifact-check': artifactCheck,
  'cache-check': cacheCheck,
  'branch-policy': branchPolicy,
  approval,
  'secret-scan': secretScan,
  'status-aggregate': statusAggregate,
};

/** Exécute une action allowlistée, avec logs bornés. PUR. Action inconnue → failed. */
export function runAction(job, ctx = {}) {
  const fn = ACTIONS[job?.action];
  if (!fn) return { status: 'failed', logs: [`E_UNKNOWN_ACTION : « ${job?.action} »`] };
  const r = fn(job, ctx);
  return { status: r.status, logs: clamp(r.logs ?? []), artifacts: r.artifacts ?? [] };
}

export { ACTION_KINDS };
