// Réconciliation & simulation de manifests — PURE, déterministe, sans I/O
// (ADR/TSD-023).
//
// À partir de l'état DÉSIRÉ (les manifests), on calcule un état OBSERVÉ ATTENDU
// (pods d'un workload, endpoints d'un Service) et l'on simule des incidents et des
// rollouts. Aucune exécution réelle, aucun cluster : ce sont des PROPRIÉTÉS
// QUALITATIVES déterministes, pas un scheduler Kubernetes.

import { WORKLOAD_KINDS, serviceEndpoints, podsOf, podTemplateLabels } from './manifest.mjs';

/** Incidents reconnus (liste fermée). */
export const INCIDENTS = [
  'crashloop', 'imagepull', 'pending', 'oomkilled', 'readiness-never',
  'liveness-aggressive', 'bad-selector', 'no-endpoints', 'rollout-stuck',
  'regression', 'rollback-blocked', 'secret-exposed', 'cpu-saturation',
  'mem-saturation', 'dependency-down', 'config-missing',
];

/** État observé attendu à partir de l'état désiré. PUR. */
export function reconcile(set = {}) {
  const resources = Array.isArray(set.resources) ? set.resources : [];
  const pods = [];
  for (const r of resources) {
    if (!WORKLOAD_KINDS.has(r.kind)) continue;
    const n = podsOf(r);
    for (let i = 0; i < n; i++) pods.push({ owner: `${r.kind}/${r.metadata?.name}`, labels: podTemplateLabels(r), phase: 'Running', ready: true });
  }
  const endpoints = {};
  const warnings = [];
  for (const r of resources) {
    if (r.kind !== 'Service') continue;
    const eps = serviceEndpoints(r, resources);
    const count = eps.reduce((a, w) => a + podsOf(w), 0);
    endpoints[`${r.metadata?.namespace ?? 'default'}/${r.metadata?.name}`] = count;
    if (count === 0) warnings.push(`Service ${r.metadata?.name} : aucun endpoint`);
  }
  return { desiredPods: pods.length, pods, endpoints, warnings };
}

const diag = (code, severity, title, recommendation, glossary = []) => ({ code, severity, title, recommendation, glossary });

/**
 * Simule un incident borné sur un ensemble de manifests. PUR, déterministe.
 * @returns {{ ok, error?, incident?, effects?, podStates?, diagnostics? }}
 */
export function simulateIncident(set = {}, scenario = {}) {
  const kind = scenario?.kind;
  if (!INCIDENTS.includes(kind)) return { ok: false, error: `incident inconnu « ${kind} »` };
  const base = reconcile(set);
  const target = scenario.target ?? null;

  const CATALOG = {
    crashloop: { phase: 'CrashLoopBackOff', ready: false, d: diag('crashloop', 'blocking', 'Pod en CrashLoopBackOff', 'Vérifier logs, commande/entrypoint, et la liveness probe (trop agressive ?).', ['k8s-crashloopbackoff', 'k8s-liveness-probe']) },
    imagepull: { phase: 'ImagePullBackOff', ready: false, d: diag('imagepull', 'blocking', 'ImagePullBackOff', 'Vérifier le nom/tag d\'image et l\'accès au registre.', ['k8s-imagepullbackoff', 'k8s-pod']) },
    pending: { phase: 'Pending', ready: false, d: diag('pending', 'risk', 'Pod Pending', 'Vérifier requests vs capacité, PVC non lié, taints/tolerations.', ['k8s-pending', 'k8s-requests-limits']) },
    oomkilled: { phase: 'OOMKilled', ready: false, d: diag('oomkilled', 'blocking', 'Conteneur OOMKilled', 'Augmenter limits.memory ou corriger la fuite mémoire ; vérifier requests.', ['k8s-oomkilled', 'k8s-requests-limits']) },
    'readiness-never': { phase: 'Running', ready: false, d: diag('readiness-never', 'risk', 'Readiness jamais verte', 'Corriger le endpoint/port de la readiness probe ; le pod ne reçoit pas de trafic.', ['k8s-readiness-probe']) },
    'liveness-aggressive': { phase: 'CrashLoopBackOff', ready: false, d: diag('liveness-aggressive', 'risk', 'Redémarrages dus à une liveness trop agressive', 'Augmenter initialDelaySeconds ou ajouter une startup probe.', ['k8s-liveness-probe', 'k8s-startup-probe']) },
    'cpu-saturation': { phase: 'Running', ready: true, d: diag('cpu-saturation', 'warning', 'Throttling CPU sous charge', 'Augmenter limits.cpu ou ajouter des replicas/HPA.', ['k8s-requests-limits', 'k8s-hpa']) },
    'mem-saturation': { phase: 'OOMKilled', ready: false, d: diag('mem-saturation', 'blocking', 'Saturation mémoire → OOMKilled', 'Augmenter limits.memory ; profiler la consommation.', ['k8s-oomkilled']) },
    'config-missing': { phase: 'CreateContainerConfigError', ready: false, d: diag('config-missing', 'blocking', 'ConfigMap/Secret référencé absent', 'Créer la ConfigMap/Secret référencée ou corriger le nom.', ['k8s-configmap', 'k8s-secret']) },
  };

  // Incidents structurels (indépendants d'un pod cible).
  if (kind === 'no-endpoints' || kind === 'bad-selector') {
    const svc = (set.resources ?? []).find((r) => r.kind === 'Service' && serviceEndpoints(r, set.resources).length === 0)
      ?? (set.resources ?? []).find((r) => r.kind === 'Service');
    return {
      ok: true, incident: kind, effects: { note: 'Le Service ne route vers aucun pod (selector orphelin).' },
      podStates: base.pods, reachable: false,
      diagnostics: [diag('svc-no-endpoints', 'blocking', 'Service sans endpoints', 'Aligner le selector du Service sur les labels du gabarit de pod.', ['k8s-service', 'k8s-selector'])],
      service: svc ? `${svc.metadata?.name}` : null,
    };
  }
  if (kind === 'rollout-stuck') {
    return {
      ok: true, incident: kind, effects: { note: 'Le rollout est bloqué : les nouveaux pods ne deviennent jamais prêts (readiness/immage).' },
      podStates: base.pods, reachable: base.desiredPods > 0,
      diagnostics: [diag('rollout-stuck', 'risk', 'Rollout bloqué', 'Vérifier readiness/immage des nouveaux pods ; envisager un rollback.', ['k8s-rollout', 'prod-rollback'])],
    };
  }
  if (kind === 'regression') {
    return {
      ok: true, incident: kind, effects: { note: 'La nouvelle image introduit une régression fonctionnelle (les pods sont Running mais le comportement est cassé).' },
      podStates: base.pods.map((p) => ({ ...p, ready: true })), reachable: true,
      diagnostics: [diag('regression', 'risk', 'Régression après nouvelle image', 'Décider rollback (si réversible) ou roll-forward (si migration non rétrocompatible) ; vérifier après correctif.', ['reg-regression', 'prod-rollback', 'reg-roll-forward'])],
    };
  }
  if (kind === 'rollback-blocked') {
    return {
      ok: true, incident: kind, effects: { note: 'Le rollback est empêché par une migration de schéma non rétrocompatible.' },
      podStates: base.pods, reachable: true,
      diagnostics: [diag('rollback-blocked', 'risk', 'Rollback impossible (migration non rétrocompatible)', 'Roll-forward avec un correctif ; à l\'avenir, migrations expand-and-contract.', ['reg-roll-forward', 'migration-expand-contract'])],
    };
  }
  if (kind === 'secret-exposed') {
    return {
      ok: true, incident: kind, effects: { note: 'Un secret est exposé (posé en clair ou dans une ConfigMap).' },
      podStates: base.pods, reachable: true,
      diagnostics: [diag('secret-exposed', 'blocking', 'Secret exposé', 'Déplacer vers un Secret/coffre, faire tourner (rotation) le secret compromis.', ['k8s-secret', 'sec-secrets-management'])],
    };
  }
  if (kind === 'dependency-down') {
    return {
      ok: true, incident: kind, effects: { note: 'Une dépendance externe est indisponible ; les pods échouent leur readiness.' },
      podStates: base.pods.map((p) => ({ ...p, ready: false })), reachable: false,
      diagnostics: [diag('dependency-down', 'risk', 'Dépendance indisponible', 'Ajouter retries/backoff et dégradation gracieuse ; readiness reflète la dépendance.', ['ha-failover'])],
    };
  }

  // Incidents au niveau pod (crashloop, oomkilled, pending, imagepull…).
  const spec = CATALOG[kind];
  if (!spec) return { ok: false, error: `incident non simulé « ${kind} »` };
  const affected = target
    ? base.pods.filter((p) => p.owner.endsWith(`/${target}`))
    : base.pods.slice(0, 1);
  if (target && affected.length === 0) return { ok: false, error: `cible inconnue « ${target} »` };
  const podStates = base.pods.map((p) => (affected.includes(p) ? { ...p, phase: spec.phase, ready: spec.ready } : p));
  const reachable = podStates.some((p) => p.ready);
  return { ok: true, incident: kind, effects: { note: spec.d.title, affected: affected.map((p) => p.owner) }, podStates, reachable, diagnostics: [spec.d] };
}

/**
 * Simule un rollout déterministe (RollingUpdate/Recreate) + rollback. PUR.
 * @param {object} deployment  ressource Deployment
 * @param {{ newImageHealthy?:boolean }} opt
 */
export function simulateRollout(deployment = {}, opt = {}) {
  const replicas = Math.max(0, Number(deployment?.spec?.replicas ?? 1));
  const strategy = deployment?.spec?.strategy?.type ?? 'RollingUpdate';
  const healthy = opt.newImageHealthy !== false;
  const steps = [];
  const maxUnavailable = 1;
  if (strategy === 'Recreate') {
    steps.push({ step: 'terminate-old', available: 0, note: 'Tous les anciens pods sont arrêtés (coupure).' });
    steps.push({ step: 'start-new', available: healthy ? replicas : 0, note: healthy ? 'Nouveaux pods prêts.' : 'Nouveaux pods non prêts (rollout figé).' });
  } else if (healthy) {
    // Remplacement progressif : la disponibilité ne descend jamais sous replicas - maxUnavailable.
    for (let replaced = 1; replaced <= replicas; replaced++) {
      steps.push({ step: `rolling-${replaced}/${replicas}`, available: Math.max(replicas - maxUnavailable, 0), note: `Remplacement du pod ${replaced}/${replicas}.` });
    }
    steps.push({ step: 'done', available: replicas, note: 'Rollout terminé : toutes les instances sont à jour.' });
  } else {
    // Les nouveaux pods ne deviennent jamais prêts : le rollout se fige.
    steps.push({ step: 'rolling-1/' + replicas, available: Math.max(replicas - maxUnavailable, 0), note: 'Nouveaux pods non prêts : rollout bloqué à la première étape.' });
  }
  const succeeded = healthy;
  const rollback = { available: replicas, note: 'Rollback vers la version précédente (pods sains restaurés).' };
  return { strategy, replicas, healthy, succeeded, steps, rollback };
}
