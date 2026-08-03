// Analyseur de manifests Kubernetes — PUR, déterministe, sans I/O (ADR/TSD-023).
//
// Un registre de RÈGLES pures `(set) → Diagnostic[]` inspecte un ensemble de
// ressources et produit des diagnostics stables (code/sévérité/preuve/
// recommandation). Aucune règle n'attribue de note magique : la synthèse agrège
// par sévérité et par catégorie. Sortie triée (sévérité puis code) → déterminisme.

import { WORKLOAD_KINDS, serviceEndpoints, containersOf, podTemplateLabels } from './manifest.mjs';

export const SEVERITIES = ['blocking', 'risk', 'warning', 'observation'];
const SEV_RANK = { blocking: 0, risk: 1, warning: 2, observation: 3 };
export const CATEGORIES = ['security', 'availability', 'performance', 'maintenance', 'delivery', 'observability'];

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const rid = (r) => `${r.kind}/${r.metadata?.name ?? '?'}`;
const isProd = (r) => (r.metadata?.namespace ?? '').includes('prod');

/** Quantité CPU → millicores. '100m'→100 ; '1'→1000. */
function cpu(q) { if (q == null) return null; const s = String(q); return s.endsWith('m') ? Number(s.slice(0, -1)) : Number(s) * 1000; }
/** Quantité mémoire → octets (Ki/Mi/Gi/Ti). */
function mem(q) {
  if (q == null) return null; const s = String(q);
  const m = s.match(/^(\d+(?:\.\d+)?)(Ki|Mi|Gi|Ti|K|M|G|T)?$/);
  if (!m) return Number(s) || null;
  const mult = { Ki: 1024, Mi: 1024 ** 2, Gi: 1024 ** 3, Ti: 1024 ** 4, K: 1e3, M: 1e6, G: 1e9, T: 1e12 };
  return Number(m[1]) * (m[2] ? mult[m[2]] : 1);
}

function D(code, severity, category, resource, path, message, explanation, risk, recommendation, autofixable, glossary = []) {
  return { code, severity, category, resource, path, message, explanation, risk, recommendation, autofixable, glossary };
}

const SECRET_KEY = /pass|password|token|secret|apikey|api_key|private/i;

const RULES = [
  // ── Sécurité ──
  function secretInConfigMap(set) {
    const out = [];
    for (const r of set.resources) {
      if (r.kind !== 'ConfigMap' || !isObj(r.spec?.data ?? r.data)) continue;
      const data = r.spec?.data ?? r.data;
      const keys = Object.keys(data).filter((k) => SECRET_KEY.test(k));
      if (keys.length) out.push(D('secret-in-configmap', 'risk', 'security', rid(r), 'data',
        `ConfigMap contenant une donnée sensible (${keys.join(', ')})`,
        'Une ConfigMap n\'est pas chiffrée ni traitée comme un secret. Les données sensibles doivent vivre dans un Secret (ou un coffre externe).',
        'Exposition d\'un secret via une ressource non protégée.',
        'Déplacer ces clés vers un Secret et les référencer via valueFrom.secretKeyRef.', false, ['k8s-secret', 'k8s-configmap']));
    }
    return out;
  },
  function plaintextSecretEnv(set) {
    const out = [];
    for (const r of set.resources) {
      for (const c of containersOf(r)) {
        for (const e of c.env ?? []) {
          if (e.value != null && SECRET_KEY.test(e.name ?? '')) {
            out.push(D('plaintext-secret-env', 'risk', 'security', rid(r), `containers[${c.name}].env.${e.name}`,
              `Variable sensible « ${e.name} » posée en clair`,
              'Une valeur sensible est écrite directement dans le manifest au lieu d\'être référencée depuis un Secret.',
              'Le secret fuit via le manifest, les logs ou une sauvegarde.',
              'Utiliser valueFrom.secretKeyRef au lieu d\'un value inline.', false, ['k8s-secret']));
          }
        }
      }
    }
    return out;
  },
  function privileged(set) {
    const out = [];
    for (const r of set.resources) for (const c of containersOf(r)) {
      if (c.securityContext?.privileged === true) out.push(D('privileged-container', 'blocking', 'security', rid(r), `containers[${c.name}].securityContext.privileged`,
        'Conteneur privilégié',
        'Un conteneur privilégié a un accès quasi total au nœud hôte — c\'est l\'inverse du moindre privilège.',
        'Évasion de conteneur, compromission du nœud.',
        'Retirer privileged: true ; n\'accorder que les capabilities strictement nécessaires.', false, ['k8s-security-context', 'sec-least-privilege']));
    }
    return out;
  },
  function runAsRoot(set) {
    const out = [];
    for (const r of set.resources) {
      if (!WORKLOAD_KINDS.has(r.kind)) continue;
      for (const c of containersOf(r)) {
        const sc = c.securityContext ?? {};
        if (sc.runAsNonRoot !== true || sc.runAsUser === 0) {
          out.push(D('run-as-root', 'warning', 'security', rid(r), `containers[${c.name}].securityContext`,
            'Conteneur susceptible de tourner en root',
            'Sans runAsNonRoot: true, le conteneur peut s\'exécuter en root, augmentant l\'impact d\'une compromission.',
            'Élévation de privilèges en cas de faille applicative.',
            'Définir securityContext.runAsNonRoot: true (et un runAsUser non nul).', true, ['k8s-security-context']));
        }
      }
    }
    return out;
  },
  function hostNamespaces(set) {
    const out = [];
    for (const r of set.resources) {
      const ps = r.kind === 'Pod' ? r.spec : r.spec?.template?.spec;
      if (ps?.hostNetwork === true) out.push(D('host-network', 'risk', 'security', rid(r), 'spec.hostNetwork',
        'hostNetwork activé', 'Le pod partage la pile réseau du nœud, contournant l\'isolation réseau.',
        'Accès élargi au réseau du nœud.', 'Retirer hostNetwork sauf besoin infrastructurel justifié.', false, ['k8s-pod']));
      for (const v of ps?.volumes ?? []) {
        if (v.hostPath) out.push(D('host-path', 'risk', 'security', rid(r), `spec.volumes.${v.name}.hostPath`,
          'Volume hostPath monté', 'Monter un chemin du nœud couple le pod à l\'hôte et ouvre une surface d\'attaque.',
          'Lecture/écriture du système de fichiers du nœud.', 'Préférer un PVC ou un volume éphémère.', false, ['k8s-volume', 'k8s-pvc']));
      }
    }
    return out;
  },
  function defaultServiceAccount(set) {
    const out = [];
    for (const r of set.resources) {
      if (!WORKLOAD_KINDS.has(r.kind)) continue;
      const ps = r.kind === 'Pod' ? r.spec : r.spec?.template?.spec;
      if (!ps?.serviceAccountName) out.push(D('default-service-account', 'observation', 'security', rid(r), 'spec.serviceAccountName',
        'ServiceAccount par défaut',
        'Sans ServiceAccount dédié, le pod utilise celui par défaut, souvent plus permissif que nécessaire.',
        'Permissions API plus larges que le besoin.',
        'Créer un ServiceAccount dédié au moindre privilège (RBAC).', false, ['k8s-serviceaccount', 'k8s-rbac']));
    }
    return out;
  },
  // ── Disponibilité ──
  function deploymentNoReplicas(set) {
    const out = [];
    for (const r of set.resources) {
      if (r.kind === 'Deployment' && r.spec?.replicas == null) out.push(D('deployment-no-replicas', 'warning', 'availability', rid(r), 'spec.replicas',
        'Deployment sans replicas explicites',
        'Sans replicas, la valeur par défaut est 1 : aucune redondance ni déploiement sans coupure.',
        'Indisponibilité au moindre incident ou déploiement.',
        'Déclarer spec.replicas (≥ 2 en production).', true, ['k8s-deployment', 'k8s-replicaset']));
    }
    return out;
  },
  function singleReplicaProd(set) {
    const out = [];
    for (const r of set.resources) {
      if ((r.kind === 'Deployment' || r.kind === 'StatefulSet') && isProd(r) && Number(r.spec?.replicas) === 1) {
        out.push(D('single-replica-prod', 'warning', 'availability', rid(r), 'spec.replicas',
          'Une seule instance en production',
          'Un unique replica en production ne tolère ni panne ni déploiement sans coupure.',
          'Interruption au premier incident.',
          'Passer à au moins 2 replicas répartis.', true, ['k8s-deployment', 'ha-high-availability']));
      }
    }
    return out;
  },
  function noReadinessProbe(set) {
    const out = [];
    for (const r of set.resources) {
      if (!WORKLOAD_KINDS.has(r.kind) || r.kind === 'Job' || r.kind === 'CronJob') continue;
      for (const c of containersOf(r)) {
        if (!c.readinessProbe) out.push(D('no-readiness-probe', 'risk', 'availability', rid(r), `containers[${c.name}].readinessProbe`,
          'readiness probe absente',
          'Sans readiness probe, le Service route du trafic vers un pod qui n\'est peut-être pas prêt (démarrage, cache froid).',
          'Erreurs 5xx pendant le démarrage ou après un déploiement.',
          'Ajouter une readinessProbe (httpGet/tcp) sur le port de service.', true, ['k8s-readiness-probe', 'k8s-service']));
      }
    }
    return out;
  },
  function serviceNoEndpoints(set) {
    const out = [];
    for (const r of set.resources) {
      if (r.kind !== 'Service' || !isObj(r.spec?.selector)) continue;
      if (serviceEndpoints(r, set.resources).length === 0) out.push(D('svc-no-endpoints', 'blocking', 'availability', rid(r), 'spec.selector',
        'Service sans endpoints (selector orphelin)',
        'Le selector du Service ne matche aucun pod : le Service existe mais ne route vers rien.',
        'Service totalement injoignable (aucune cible).',
        'Aligner le selector du Service sur les labels du gabarit de pod ciblé.', false, ['k8s-service', 'k8s-selector']));
    }
    return out;
  },
  function selectorSelfMismatch(set) {
    const out = [];
    for (const r of set.resources) {
      if (!(r.kind === 'Deployment' || r.kind === 'ReplicaSet' || r.kind === 'StatefulSet')) continue;
      const sel = r.spec?.selector?.matchLabels;
      if (!isObj(sel)) continue;
      const labels = podTemplateLabels(r);
      const ok = Object.entries(sel).every(([k, v]) => labels?.[k] === v);
      if (!ok) out.push(D('selector-template-mismatch', 'blocking', 'availability', rid(r), 'spec.selector.matchLabels',
        'Selector incohérent avec les labels du gabarit',
        'Le selector du contrôleur ne correspond pas aux labels de son propre gabarit de pod : le contrôleur ne gère aucun pod.',
        'Aucun pod créé/géré ; workload inopérant.',
        'Faire correspondre spec.selector.matchLabels et spec.template.metadata.labels.', false, ['k8s-selector', 'k8s-deployment']));
    }
    return out;
  },
  function recreateStrategy(set) {
    const out = [];
    for (const r of set.resources) {
      if (r.kind === 'Deployment' && r.spec?.strategy?.type === 'Recreate') out.push(D('recreate-strategy', 'warning', 'availability', rid(r), 'spec.strategy.type',
        'Stratégie Recreate (coupure)',
        'Recreate arrête tous les anciens pods avant de démarrer les nouveaux : il y a une coupure pendant le déploiement.',
        'Interruption de service à chaque déploiement.',
        'Utiliser RollingUpdate sauf incompatibilité de versions justifiée.', false, ['deploy-recreate', 'deploy-rolling']));
    }
    return out;
  },
  function dangerousRollout(set) {
    const out = [];
    for (const r of set.resources) {
      const ru = r.spec?.strategy?.rollingUpdate;
      if (r.kind === 'Deployment' && ru) {
        const mu = String(ru.maxUnavailable ?? '');
        if (mu === '100%' || Number(ru.maxUnavailable) >= Number(r.spec?.replicas ?? 1)) {
          out.push(D('dangerous-rollout', 'warning', 'availability', rid(r), 'spec.strategy.rollingUpdate.maxUnavailable',
            'maxUnavailable dangereux',
            'Un maxUnavailable trop élevé retire trop d\'instances à la fois pendant le rollout : la capacité chute.',
            'Dégradation/coupure pendant le déploiement.',
            'Réduire maxUnavailable (ex. 25%) et régler maxSurge.', true, ['k8s-rollout', 'deploy-rolling']));
        }
      }
    }
    return out;
  },
  function statefulNoPersistence(set) {
    const out = [];
    for (const r of set.resources) {
      if (r.kind === 'StatefulSet' && !(Array.isArray(r.spec?.volumeClaimTemplates) && r.spec.volumeClaimTemplates.length)) {
        out.push(D('statefulset-no-persistence', 'risk', 'availability', rid(r), 'spec.volumeClaimTemplates',
          'StatefulSet sans persistance',
          'Un StatefulSet gère des données à état stable, mais aucun volumeClaimTemplate n\'est déclaré : l\'état est éphémère.',
          'Perte de données au remplacement d\'un pod.',
          'Déclarer un volumeClaimTemplate (PVC) pour chaque instance.', false, ['k8s-statefulset', 'k8s-pvc']));
      }
    }
    return out;
  },
  // ── Performance / maintenance ──
  function resources(set) {
    const out = [];
    for (const r of set.resources) {
      if (!WORKLOAD_KINDS.has(r.kind)) continue;
      for (const c of containersOf(r)) {
        const req = c.resources?.requests; const lim = c.resources?.limits;
        if (!req) out.push(D('no-requests', 'risk', 'performance', rid(r), `containers[${c.name}].resources.requests`,
          'resources.requests absents',
          'Sans requests, l\'ordonnanceur ne peut pas réserver de ressources : placement hasardeux et voisins bruyants.',
          'Éviction, contention, comportement imprévisible sous charge.',
          'Déclarer requests.cpu et requests.memory.', true, ['k8s-requests-limits']));
        if (!lim) out.push(D('no-limits', 'warning', 'performance', rid(r), `containers[${c.name}].resources.limits`,
          'resources.limits absents',
          'Sans limits, un conteneur peut consommer tout le nœud (fuite mémoire, boucle CPU).',
          'OOMKilled du voisinage, saturation du nœud.',
          'Déclarer limits.cpu et limits.memory.', true, ['k8s-requests-limits', 'k8s-oomkilled']));
        if (req && lim) {
          if (mem(lim.memory) != null && mem(req.memory) != null && mem(lim.memory) < mem(req.memory)) {
            out.push(D('mem-limit-below-request', 'risk', 'performance', rid(r), `containers[${c.name}].resources`,
              'Limite mémoire inférieure à la request',
              'Une limite mémoire sous la request est incohérente : le pod ne peut pas être planifié tel quel.',
              'Pod non planifiable / configuration rejetée.',
              'Assurer limits.memory ≥ requests.memory.', true, ['k8s-requests-limits']));
          }
          if (cpu(lim.cpu) != null && cpu(req.cpu) != null && cpu(lim.cpu) < cpu(req.cpu)) {
            out.push(D('cpu-limit-below-request', 'risk', 'performance', rid(r), `containers[${c.name}].resources`,
              'Limite CPU inférieure à la request',
              'Une limite CPU sous la request est incohérente.',
              'Configuration rejetée ou throttling permanent.',
              'Assurer limits.cpu ≥ requests.cpu.', true, ['k8s-requests-limits']));
          }
        }
      }
    }
    return out;
  },
  function imageTag(set) {
    const out = [];
    for (const r of set.resources) for (const c of containersOf(r)) {
      const img = c.image;
      if (typeof img !== 'string') continue;
      const ref = img.split('/').pop() ?? '';
      if (img.endsWith(':latest')) out.push(D('image-latest', 'risk', 'delivery', rid(r), `containers[${c.name}].image`,
        'Image en tag :latest',
        '« latest » n\'est pas reproductible : deux déploiements peuvent tirer des images différentes.',
        'Déploiements non reproductibles, rollback ambigu.',
        'Épingler une version immuable (tag sémantique ou digest).', false, ['k8s-pod', 'devops-artefact']));
      else if (!ref.includes(':')) out.push(D('image-no-tag', 'risk', 'delivery', rid(r), `containers[${c.name}].image`,
        'Image sans tag',
        'Une image sans tag résout implicitement « latest » : même problème de reproductibilité.',
        'Déploiements non reproductibles.',
        'Ajouter un tag de version explicite.', false, ['k8s-pod']));
    }
    return out;
  },
  function livenessAggressive(set) {
    const out = [];
    for (const r of set.resources) for (const c of containersOf(r)) {
      const lp = c.livenessProbe;
      if (lp && Number(lp.initialDelaySeconds ?? 0) < 5 && (lp.httpGet || lp.tcpSocket)) {
        out.push(D('liveness-aggressive', 'warning', 'availability', rid(r), `containers[${c.name}].livenessProbe.initialDelaySeconds`,
          'liveness probe trop agressive',
          'Un initialDelaySeconds trop court peut tuer le conteneur avant qu\'il ait démarré : boucle de redémarrage.',
          'CrashLoopBackOff dû à la probe, pas à l\'application.',
          'Augmenter initialDelaySeconds ou utiliser une startupProbe.', true, ['k8s-liveness-probe', 'k8s-startup-probe', 'k8s-crashloopbackoff']));
      }
    }
    return out;
  },
  function probeBadPort(set) {
    const out = [];
    for (const r of set.resources) for (const c of containersOf(r)) {
      const ports = new Set((c.ports ?? []).map((p) => p.containerPort));
      for (const pk of ['readinessProbe', 'livenessProbe', 'startupProbe']) {
        const port = c[pk]?.httpGet?.port ?? c[pk]?.tcpSocket?.port;
        if (port != null && typeof port === 'number' && ports.size && !ports.has(port)) {
          out.push(D('probe-bad-port', 'risk', 'availability', rid(r), `containers[${c.name}].${pk}.port`,
            `${pk} pointe vers un port non déclaré (${port})`,
            'La probe cible un port que le conteneur n\'expose pas : elle échouera toujours.',
            'Probe systématiquement en échec → pod jamais prêt ou redémarré en boucle.',
            'Faire pointer la probe vers un containerPort déclaré.', true, ['k8s-readiness-probe']));
        }
      }
    }
    return out;
  },
  // ── Livraison / observabilité ──
  function noNamespace(set) {
    const out = [];
    for (const r of set.resources) {
      if (r.kind === 'Namespace') continue;
      if (!r.metadata?.namespace) out.push(D('no-namespace', 'observation', 'maintenance', rid(r), 'metadata.namespace',
        'Ressource sans namespace',
        'Sans namespace explicite, la ressource atterrit dans « default » : cloisonnement et traçabilité faibles.',
        'Collisions et gouvernance difficile.',
        'Déclarer metadata.namespace.', true, ['k8s-namespace']));
    }
    return out;
  },
  function traceabilityLabels(set) {
    const out = [];
    for (const r of set.resources) {
      if (!WORKLOAD_KINDS.has(r.kind)) continue;
      const labels = r.metadata?.labels ?? {};
      if (!labels.app && !labels['app.kubernetes.io/name']) out.push(D('missing-traceability-labels', 'observation', 'observability', rid(r), 'metadata.labels',
        'Labels de traçabilité absents',
        'Sans label « app », il est difficile de sélectionner, tracer et corréler la ressource (logs, métriques).',
        'Observabilité et opérations plus difficiles.',
        'Ajouter des labels standard (app, app.kubernetes.io/name).', true, ['k8s-labels']));
    }
    return out;
  },
  function ingressNoService(set) {
    const out = [];
    const svc = new Set(set.resources.filter((r) => r.kind === 'Service').map((r) => `${r.metadata?.namespace ?? 'default'}/${r.metadata?.name}`));
    for (const r of set.resources) {
      if (r.kind !== 'Ingress') continue;
      const ns = r.metadata?.namespace ?? 'default';
      const backends = [];
      for (const rule of r.spec?.rules ?? []) for (const p of rule.http?.paths ?? []) {
        const name = p.backend?.service?.name ?? p.backend?.serviceName;
        if (name) backends.push(name);
      }
      for (const name of backends) if (!svc.has(`${ns}/${name}`)) out.push(D('ingress-no-service', 'risk', 'availability', rid(r), 'spec.rules[].backend',
        `Ingress référence un Service inexistant « ${name} »`,
        'La règle d\'Ingress pointe vers un Service absent : la route publique ne mène nulle part.',
        'Route publique cassée (404/502).',
        'Créer le Service cible ou corriger le nom.', false, ['k8s-ingress', 'k8s-service']));
    }
    return out;
  },
  function pvcNoStorage(set) {
    const out = [];
    for (const r of set.resources) {
      if (r.kind === 'PersistentVolumeClaim' && !r.spec?.resources?.requests?.storage) {
        out.push(D('pvc-no-storage', 'risk', 'availability', rid(r), 'spec.resources.requests.storage',
          'PVC sans demande de stockage',
          'Un PVC sans requests.storage ne peut pas être satisfait.',
          'Volume non provisionné ; pod bloqué en Pending.',
          'Déclarer spec.resources.requests.storage.', true, ['k8s-pvc', 'k8s-pending']));
      }
    }
    return out;
  },
  function jobLimits(set) {
    const out = [];
    for (const r of set.resources) {
      if (r.kind === 'Job') {
        const hasLimits = containersOf(r).every((c) => c.resources?.limits);
        if (!hasLimits) out.push(D('job-no-limits', 'warning', 'performance', rid(r), 'spec.template.spec.containers[].resources.limits',
          'Job sans limites de ressources',
          'Un Job non borné peut monopoliser le nœud jusqu\'à sa fin.',
          'Saturation du nœud pendant le traitement.',
          'Déclarer des limits sur les conteneurs du Job.', true, ['k8s-job', 'k8s-requests-limits']));
      }
      if (r.kind === 'CronJob' && !r.spec?.concurrencyPolicy) out.push(D('cronjob-concurrency', 'observation', 'maintenance', rid(r), 'spec.concurrencyPolicy',
        'CronJob sans concurrencyPolicy',
        'Sans concurrencyPolicy, des exécutions peuvent se chevaucher si l\'une déborde.',
        'Chevauchement d\'exécutions, double traitement.',
        'Définir concurrencyPolicy (Forbid/Replace) selon le besoin.', true, ['k8s-cronjob']));
    }
    return out;
  },
];

/**
 * Analyse un ensemble de manifests. PUR, déterministe.
 * @param {object} set { resources:[...] }
 * @returns {{ diagnostics:object[], summary:{ bySeverity, byCategory, dimensions, total } }}
 */
export function analyzeManifests(set = {}) {
  const s = { resources: Array.isArray(set.resources) ? set.resources : [] };
  const diagnostics = [];
  for (const rule of RULES) { try { diagnostics.push(...(rule(s) ?? [])); } catch { /* une règle ne casse jamais l'analyse */ } }
  diagnostics.sort((a, b) => (SEV_RANK[a.severity] - SEV_RANK[b.severity]) || a.code.localeCompare(b.code) || a.resource.localeCompare(b.resource));
  const bySeverity = { blocking: 0, risk: 0, warning: 0, observation: 0 };
  const byCategory = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
  const dims = new Set();
  for (const d of diagnostics) { bySeverity[d.severity] += 1; byCategory[d.category] = (byCategory[d.category] ?? 0) + 1; dims.add(d.category); }
  return { diagnostics, summary: { bySeverity, byCategory, dimensions: [...dims].sort(), total: diagnostics.length } };
}

export function ruleCodes() { return RULES.map((r) => r.name); }
