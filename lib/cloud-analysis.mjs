// Analyse déterministe d'architecture cloud — PUR, sans I/O, sans réseau
// (ADR/HSD/TSD-025). Compose l'analyse de disponibilité V22 (analyzeTopology sur la
// projection graphe) avec des RÈGLES CLOUD (IAM, réseau, stockage, coût). Chaque
// diagnostic porte confiance + real/simulated + CWE/limites. Aucune exécution,
// aucun appel AWS/Azure : c'est un laboratoire pédagogique, PAS un scanner cloud.
import { analyzeTopology } from './topology-analysis.mjs';
import { toTopology, cidrsOverlap } from './cloud-architecture.mjs';
import { estimateMonthlyCost } from './cloud-cost.mjs';

export const SEVERITIES = ['blocking', 'risk', 'warning', 'observation'];
const SEV_RANK = { blocking: 0, risk: 1, warning: 2, observation: 3 };

const isArr = Array.isArray;
const truthy = (v) => v === true || v === 'true';
const STORAGE_KINDS = new Set(['object-storage', 'file-storage', 'block-storage']);
const DB_KINDS = new Set(['managed-db', 'relational-db', 'nosql-db']);
const COMPUTE_KINDS = new Set(['vm', 'container', 'serverless', 'backend', 'api', 'worker']);

/** Fabrique un diagnostic cloud (ordre de champs stable). PUR. */
function D(id, severity, domain, title, explanation, evidence, remediation, provider, opts = {}) {
  return {
    id, severity, domain, title, explanation,
    evidence: [...evidence].sort(), remediation, provider,
    confidence: opts.confidence ?? 'high',
    real: opts.real !== false, simulated: opts.simulated === true,
    glossary: opts.glossary ?? [],
  };
}

// ── Règles cloud (chacune PURE : (arch) → Diagnostic[]) ──────────────────────
const CLOUD_RULES = [
  // 1. IAM : permission wildcard (viole le moindre privilège).
  function iamWildcard(arch) {
    const out = [];
    for (const idn of arch.identities ?? []) {
      for (const p of idn.policies ?? []) {
        const wildAction = (p.actions ?? []).includes('*');
        const wildRes = (p.resources ?? []).includes('*');
        if ((wildAction || wildRes) && (p.effect ?? 'allow') === 'allow') {
          out.push(D('iam-wildcard', 'risk', 'iam',
            'Permission IAM en wildcard',
            'Une policy accorde « * » sur les actions et/ou les ressources : tout est autorisé, y compris ce qui n\'existe pas encore. Cela viole le moindre privilège et transforme toute compromission en compromission totale.',
            [`identité ${idn.id}`, wildAction ? 'actions: *' : '', wildRes ? 'resources: *' : ''].filter(Boolean),
            'Remplacer « * » par la liste explicite des actions et ressources réellement nécessaires (moindre privilège).',
            arch.provider, { glossary: ['sec-wildcard-permission', 'sec-least-privilege'] }));
        }
      }
    }
    return out;
  },

  // 2. IAM : credentials statiques (clés d'accès à long terme).
  function staticCredentials(arch) {
    const out = [];
    for (const idn of arch.identities ?? []) {
      const hasStatic = truthy(idn.staticKeys) || idn.type === 'user' && truthy(idn.accessKeys);
      if (hasStatic) {
        out.push(D('iam-static-credentials', 'risk', 'iam',
          'Credentials statiques à long terme',
          'Une identité utilise des clés d\'accès statiques plutôt que des credentials temporaires. Les clés longues fuient et se propagent ; elles sont difficiles à révoquer proprement.',
          [`identité ${idn.id}`],
          'Préférer des credentials temporaires (rôle assumé / identité managée) et supprimer les clés statiques.',
          arch.provider, { glossary: ['sec-secret-rotation', 'security-secret'] }));
      }
    }
    return out;
  },

  // 3. Stockage public non justifié.
  function publicStorage(arch) {
    const out = [];
    for (const r of arch.resources ?? []) {
      if (STORAGE_KINDS.has(r.kind) && (r.public === true || truthy(r.props?.public))) {
        out.push(D('storage-public', 'blocking', 'storage',
          'Stockage exposé publiquement',
          'Un stockage (bucket/partage) est accessible publiquement. C\'est une cause classique de fuite de données : tout le monde peut lire (voire écrire) son contenu.',
          [`ressource ${r.id}`],
          'Rendre le stockage privé et n\'exposer que via une identité/endpoint contrôlé ; activer le blocage d\'accès public.',
          arch.provider, { glossary: ['sec-attack-surface', 'deploy-blast-radius'] }));
      }
    }
    return out;
  },

  // 4. Base managée exposée publiquement.
  function dbPublic(arch) {
    const out = [];
    for (const r of arch.resources ?? []) {
      if (DB_KINDS.has(r.kind) && (r.public === true || truthy(r.props?.public))) {
        out.push(D('db-public', 'blocking', 'database',
          'Base de données exposée publiquement',
          'Une base managée est joignable depuis Internet. La surface d\'attaque est maximale et une seule faille d\'authentification expose toutes les données.',
          [`ressource ${r.id}`],
          'Placer la base dans un subnet privé, n\'autoriser que le trafic interne (security group), et utiliser un endpoint privé.',
          arch.provider, { glossary: ['sec-attack-surface', 'k8s-networkpolicy'] }));
      }
    }
    return out;
  },

  // 5. Réseau : subnet public injustifié pour une ressource de données/compute interne.
  function cidrOverlap(arch) {
    const out = [];
    const subnets = arch.network?.subnets ?? [];
    for (let i = 0; i < subnets.length; i++) {
      for (let j = i + 1; j < subnets.length; j++) {
        if (cidrsOverlap(subnets[i].cidr, subnets[j].cidr)) {
          out.push(D('network-cidr-overlap', 'risk', 'network',
            'Chevauchement de plages CIDR',
            'Deux subnets déclarent des plages CIDR qui se recouvrent. Le routage devient ambigu et la segmentation réseau n\'est plus garantie.',
            [`subnet ${subnets[i].id} (${subnets[i].cidr})`, `subnet ${subnets[j].id} (${subnets[j].cidr})`],
            'Attribuer à chaque subnet une plage CIDR disjointe au sein du VPC/VNet.',
            arch.provider, { glossary: ['net-subnet'] }));
        }
      }
    }
    return out;
  },

  // 6. Absence de sauvegarde pour une base de données.
  function noBackup(arch) {
    const out = [];
    for (const r of arch.resources ?? []) {
      if (DB_KINDS.has(r.kind) && !truthy(r.props?.backup)) {
        out.push(D('resilience-no-backup', 'risk', 'resilience',
          'Base de données sans sauvegarde',
          'Une base managée n\'a aucune sauvegarde déclarée. En cas de corruption, suppression ou panne, aucune restauration n\'est possible : RPO indéfini.',
          [`ressource ${r.id}`],
          'Activer des sauvegardes automatiques, définir un RPO/RTO cible et tester la restauration.',
          arch.provider, { glossary: ['dr-backup', 'dr-restore'] }));
      }
    }
    return out;
  },

  // 7. Absence d'observabilité.
  function noObservability(arch) {
    const out = [];
    const obs = arch.observability ?? {};
    const hasMonitoring = (arch.resources ?? []).some((r) => r.kind === 'monitoring');
    if (!obs.logs && !obs.metrics && !hasMonitoring) {
      out.push(D('observability-missing', 'warning', 'observability',
        'Aucune observabilité déclarée',
        'L\'architecture ne déclare ni logs, ni métriques, ni ressource de monitoring. On ne pourra ni détecter, ni diagnostiquer un incident (MTTD élevé).',
        ['architecture'],
        'Ajouter la collecte de logs/métriques et des alertes (CloudWatch côté AWS, Azure Monitor côté Azure).',
        arch.provider, { glossary: ['prod-mttd', 'prod-incident'] }));
    }
    return out;
  },

  // 8. FinOps : ressource manifestement sur-dimensionnée (indice pédagogique déclaratif).
  function oversized(arch) {
    const out = [];
    for (const c of arch.costHints ?? []) {
      if (c.sizing === 'oversized' || truthy(c.oversized)) {
        out.push(D('finops-oversized', 'warning', 'finops',
          'Ressource sur-dimensionnée',
          'Un indice de coût signale une ressource nettement plus grande que nécessaire. C\'est du gaspillage direct : on paie une capacité inutilisée.',
          [`ressource ${c.resourceId ?? '?'}`],
          'Faire du right-sizing (réduire la taille), envisager l\'autoscaling et/ou une capacité réservée si la charge est stable.',
          arch.provider, { glossary: ['finops', 'cloud-autoscaling'] }));
      }
    }
    return out;
  },
];

/**
 * Analyse une architecture cloud : diagnostics + synthèse + coût (factice). PUR.
 * Compose analyzeTopology (disponibilité : SPOF, single-AZ, cycles) avec les règles
 * cloud ci-dessus. Le coût est SIMULÉ (étiqueté) et n'est jamais un prix réel.
 * @returns {{ diagnostics, summary: { bySeverity, byDomain, cost, dimensions, total, limits } }}
 */
export function analyzeCloud(arch = {}, priceBook = []) {
  const diagnostics = [];

  // 1. Règles cloud.
  for (const rule of CLOUD_RULES) {
    try { diagnostics.push(...(rule(arch) ?? [])); } catch { /* une règle ne casse jamais l'analyse */ }
  }

  // 2. Disponibilité via le graphe V22 (réutilisation, pas de duplication).
  let availDims = [];
  try {
    const topoRes = analyzeTopology(toTopology(arch));
    availDims = topoRes.summary.dimensions ?? [];
    for (const d of topoRes.diagnostics) {
      diagnostics.push(D(`topo-${d.code}`, d.severity, 'resilience', d.title, d.explanation,
        d.evidence ?? [], d.recommendation ?? '', arch.provider,
        { glossary: d.glossary ?? [], confidence: 'high' }));
    }
  } catch { /* projection impossible : on garde les règles cloud */ }

  diagnostics.sort((a, b) => (SEV_RANK[a.severity] - SEV_RANK[b.severity]) || a.id.localeCompare(b.id) || a.evidence.join().localeCompare(b.evidence.join()));

  const bySeverity = { blocking: 0, risk: 0, warning: 0, observation: 0 };
  const byDomain = {};
  for (const d of diagnostics) {
    bySeverity[d.severity] = (bySeverity[d.severity] ?? 0) + 1;
    byDomain[d.domain] = (byDomain[d.domain] ?? 0) + 1;
  }

  // 3. Coût SIMULÉ (factice, étiqueté).
  let cost = null;
  try { cost = estimateMonthlyCost(arch, priceBook); } catch { cost = null; }

  return {
    diagnostics,
    summary: {
      bySeverity, byDomain, cost,
      dimensions: [...new Set([...Object.keys(byDomain), ...availDims])].sort(),
      total: diagnostics.length,
      limits: [
        'Analyse pédagogique DÉTERMINISTE sur une architecture déclarative locale.',
        'Ce n\'est PAS un scanner cloud, PAS un outil d\'audit, PAS un estimateur de coût officiel.',
        'Aucun appel AWS/Azure : disponibilité réelle, prix réel et incidents fournisseur sont SIMULÉS.',
      ],
    },
  };
}

/** Liste des codes de règles cloud (tests/documentation). PUR. */
export function cloudRuleCodes() { return CLOUD_RULES.map((r) => r.name); }
