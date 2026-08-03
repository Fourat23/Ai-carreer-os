// Moteur d'analyse de topologie — PUR, déterministe, sans I/O (ADR/TSD-022).
//
// Un registre de RÈGLES pures `(topo) → Diagnostic[]` inspecte une topologie et
// produit des diagnostics stables. Aucune règle n'attribue de « note cloud
// universelle » : la synthèse agrège par sévérité et liste les dimensions
// couvertes, rien de plus. Sortie triée (sévérité puis code) → déterminisme.

import { DEPENDENCY_EDGE_KINDS } from './topology.mjs';

export const SEVERITIES = ['blocking', 'risk', 'warning', 'observation'];
const SEV_RANK = { blocking: 0, risk: 1, warning: 2, observation: 3 };

const DB_KINDS = new Set(['relational-db', 'nosql-db']);
const CRITICAL_KINDS = new Set(['load-balancer', 'api', 'backend', 'relational-db', 'nosql-db', 'gateway']);
const PUBLIC_SOURCE_KINDS = new Set(['client', 'cdn']);

const byId = (nodes) => new Map(nodes.map((n) => [n.id, n]));
const inbound = (edges, id) => edges.filter((e) => e.to === id);
const outbound = (edges, id) => edges.filter((e) => e.from === id);
const truthy = (v) => v === true || v === 'true';

/** Fabrique un diagnostic (ordre de champs stable). */
function D(code, severity, dimension, title, explanation, evidence, impact, recommendation, tradeoff, links = {}) {
  return {
    code, severity, dimension, title, explanation,
    evidence: [...evidence].sort(), impact, recommendation, tradeoff,
    skills: links.skills ?? [], glossary: links.glossary ?? [],
  };
}

// ── Règles (chacune PURE : (topo) → Diagnostic[]) ────────────────────────────
const RULES = [
  // 1. Base de données exposée publiquement.
  function dbPublicExposure(topo) {
    const out = [];
    const nodes = topo.nodes ?? []; const edges = topo.edges ?? [];
    const map = byId(nodes);
    for (const n of nodes) {
      if (!DB_KINDS.has(n.kind)) continue;
      const flaggedPublic = truthy(n.props?.public);
      const publicInbound = inbound(edges, n.id).filter((e) => PUBLIC_SOURCE_KINDS.has(map.get(e.from)?.kind));
      if (flaggedPublic || publicInbound.length) {
        out.push(D('db-public-exposure', 'blocking', 'security',
          'Base de données exposée publiquement',
          'Une base de données est accessible directement depuis une source publique ou marquée « public ». Les données doivent vivre dans un réseau privé, derrière une API.',
          [n.id, ...publicInbound.map((e) => e.id)],
          'Fuite ou compromission directe des données ; surface d\'attaque maximale.',
          'Placer la base dans un subnet privé ; n\'y accéder que via l\'API/backend ; jamais d\'accès public direct.',
          'Un accès direct simplifie le prototypage mais expose les données — jamais acceptable en production.',
          { skills: ['archi'], glossary: ['sec-owasp', 'net-subnet'] }));
      }
    }
    return out;
  },

  // 2. Plusieurs services sans load balancer devant eux.
  function noLoadBalancer(topo) {
    const nodes = topo.nodes ?? [];
    const services = nodes.filter((n) => n.kind === 'api' || n.kind === 'backend');
    const hasLB = nodes.some((n) => n.kind === 'load-balancer' || n.kind === 'reverse-proxy');
    if (services.length >= 2 && !hasLB) {
      return [D('no-load-balancer', 'risk', 'availability',
        'Plusieurs services sans load balancer',
        'Plusieurs instances de service coexistent sans point d\'entrée unique qui répartit le trafic. Sans répartiteur, il n\'y a ni distribution ni bascule.',
        services.map((s) => s.id),
        'Pas de répartition de charge ; pas de retrait propre d\'une instance défaillante.',
        'Ajouter un load balancer (ou reverse proxy) devant les services et y router le trafic.',
        'Un load balancer ajoute un composant à opérer, mais c\'est la base d\'une entrée en haute disponibilité.',
        { skills: ['archi'], glossary: ['net-load-balancer'] })];
    }
    return [];
  },

  // 3. Aucune observabilité.
  function noMonitoring(topo) {
    const nodes = topo.nodes ?? [];
    if (nodes.length >= 3 && !nodes.some((n) => n.kind === 'monitoring')) {
      return [D('no-monitoring', 'warning', 'maintainability',
        'Aucune observabilité déclarée',
        'La topologie ne comporte aucun composant de monitoring. Sans logs/métriques/traces, un incident est invisible jusqu\'à ce qu\'un utilisateur le signale.',
        [],
        'Détection tardive des pannes ; MTTR allongé.',
        'Ajouter un composant de monitoring et y relier les services (health checks, métriques).',
        'L\'observabilité a un coût de mise en place, mais réduit fortement le temps de détection et de résolution.',
        { skills: ['archi'], glossary: ['obs-observability', 'prod-mttr'] })];
    }
    return [];
  },

  // 4. Single point of failure (composant critique unique et dépendu).
  function singlePointOfFailure(topo) {
    const out = [];
    const nodes = topo.nodes ?? []; const edges = topo.edges ?? [];
    const countByKind = new Map();
    for (const n of nodes) countByKind.set(n.kind, (countByKind.get(n.kind) ?? 0) + 1);
    for (const n of nodes) {
      if (!CRITICAL_KINDS.has(n.kind)) continue;
      if ((countByKind.get(n.kind) ?? 0) !== 1) continue; // redondé par un pair
      // Un composant explicitement managé/redondé par le fournisseur (ex. LB ou
      // base managée en HA) n'est pas un SPOF applicatif : on respecte la déclaration.
      if (truthy(n.props?.managed) || truthy(n.props?.redundant)) continue;
      const depended = inbound(edges, n.id).some((e) => DEPENDENCY_EDGE_KINDS.has(e.kind));
      const replicated = outbound(edges, n.id).some((e) => e.kind === 'replicates-to')
        || inbound(edges, n.id).some((e) => e.kind === 'replicates-to');
      if (depended && !replicated) {
        out.push(D('single-point-of-failure', 'risk', 'availability',
          `Point de défaillance unique : ${n.label}`,
          'Un composant critique est unique, sans réplica ni pair, et d\'autres en dépendent. Sa panne rend le service indisponible.',
          [n.id],
          'Panne de ce seul nœud = indisponibilité totale du chemin qui en dépend.',
          'Répliquer le composant (multi-instance / multi-zone) et prévoir une bascule (failover).',
          'La redondance double le coût du composant, mais supprime un risque d\'indisponibilité totale.',
          { skills: ['archi'], glossary: ['ha-spof', 'ha-failover', 'ha-high-availability'] }));
      }
    }
    return out;
  },

  // 5. Service stateful derrière un autoscaling.
  function statefulAutoscaling(topo) {
    const out = [];
    for (const n of topo.nodes ?? []) {
      if (truthy(n.props?.stateful) && truthy(n.props?.autoscaling)) {
        out.push(D('stateful-autoscaling', 'risk', 'maintainability',
          `Service stateful avec autoscaling : ${n.label}`,
          'Un composant qui garde un état local est mis à l\'échelle horizontale automatiquement. Les instances ne partagent pas leur état : sessions perdues, données incohérentes.',
          [n.id],
          'Perte de session, incohérences, comportements non reproductibles à la montée en charge.',
          'Externaliser l\'état (cache/base partagée) pour rendre le service stateless, ou retirer l\'autoscaling.',
          'Rendre un service stateless demande un refactor, mais c\'est le prérequis d\'un scaling horizontal sain.',
          { skills: ['archi'], glossary: ['scale-stateless', 'scale-stateful', 'scale-autoscaling'] }));
      }
    }
    return out;
  },

  // 6. Stockage éphémère pour des données persistantes.
  function ephemeralPersistence(topo) {
    const out = [];
    for (const n of topo.nodes ?? []) {
      const persistent = DB_KINDS.has(n.kind) || truthy(n.props?.persistent);
      if (persistent && (n.props?.storage === 'ephemeral' || truthy(n.props?.ephemeral))) {
        out.push(D('ephemeral-persistence', 'risk', 'availability',
          `Stockage éphémère pour données persistantes : ${n.label}`,
          'Des données qui doivent survivre sont posées sur un stockage éphémère (perdu au redémarrage/remplacement de l\'instance).',
          [n.id],
          'Perte de données au premier remplacement d\'instance.',
          'Utiliser un stockage persistant (bloc/objet managé) et sauvegarder.',
          'Le stockage éphémère est plus rapide et moins cher, mais inadapté aux données durables.',
          { skills: ['archi'], glossary: ['store-block', 'store-object'] }));
      }
    }
    return out;
  },

  // 7. Base de données sans sauvegarde.
  function noBackup(topo) {
    const nodes = topo.nodes ?? [];
    const dbs = nodes.filter((n) => DB_KINDS.has(n.kind));
    const hasBackup = nodes.some((n) => n.kind === 'backup');
    if (dbs.length && !hasBackup) {
      return [D('no-backup', 'risk', 'availability',
        'Base de données sans sauvegarde',
        'Une base de données existe sans aucun composant de sauvegarde. Une corruption ou une suppression est irréversible.',
        dbs.map((d) => d.id),
        'Perte définitive de données en cas de corruption, erreur humaine ou incident.',
        'Ajouter une sauvegarde régulière et définir RPO/RTO ; tester la restauration.',
        'Les sauvegardes ont un coût de stockage, négligeable face au coût d\'une perte de données.',
        { skills: ['archi'], glossary: ['dr-backup', 'dr-rpo', 'dr-rto'] })];
    }
    return [];
  },

  // 8. Sauvegarde sans test de restauration.
  function backupNoRestoreTest(topo) {
    const out = [];
    for (const n of topo.nodes ?? []) {
      if (n.kind === 'backup' && !truthy(n.props?.restoreTested)) {
        out.push(D('backup-no-restore-test', 'warning', 'availability',
          'Sauvegarde jamais testée en restauration',
          'Une sauvegarde existe mais aucune restauration n\'a été testée. Une sauvegarde non restaurable ne vaut rien.',
          [n.id],
          'Fausse sécurité : la sauvegarde peut être inexploitable le jour de l\'incident.',
          'Planifier un test de restauration régulier (marquer restoreTested).',
          'Tester la restauration demande du temps, mais c\'est la seule preuve qu\'une sauvegarde fonctionne.',
          { skills: ['archi'], glossary: ['dr-restore', 'dr-disaster-recovery'] }));
      }
    }
    return out;
  },

  // 9. Subnet « privé » avec accès public direct.
  function privateSubnetPublicAccess(topo) {
    const out = [];
    const nodes = topo.nodes ?? []; const edges = topo.edges ?? [];
    const map = byId(nodes);
    for (const n of nodes) {
      if (n.kind !== 'subnet' || n.props?.visibility !== 'private') continue;
      const publicIn = inbound(edges, n.id).filter((e) => PUBLIC_SOURCE_KINDS.has(map.get(e.from)?.kind));
      if (publicIn.length) {
        out.push(D('private-subnet-public-access', 'risk', 'security',
          `Subnet « privé » avec accès public : ${n.label}`,
          'Un subnet déclaré privé reçoit un flux direct depuis une source publique — la promesse de confinement est fausse.',
          [n.id, ...publicIn.map((e) => e.id)],
          'Exposition de ressources censées être isolées.',
          'Supprimer l\'accès public direct ; passer par un load balancer/NAT et des règles de pare-feu.',
          'Un accès direct facilite le debug, mais contredit l\'isolation réseau.',
          { skills: ['archi'], glossary: ['net-subnet', 'net-security-group'] }));
      }
    }
    return out;
  },

  // 10. Flux public sans TLS.
  function missingTlsPublic(topo) {
    const out = [];
    const nodes = topo.nodes ?? []; const edges = topo.edges ?? [];
    const map = byId(nodes);
    for (const e of edges) {
      if (e.kind !== 'routes-to' && e.kind !== 'resolves') continue;
      const src = map.get(e.from);
      if (!src || !PUBLIC_SOURCE_KINDS.has(src.kind)) continue;
      if (!truthy(e.props?.tls)) {
        out.push(D('missing-tls-public', 'risk', 'security',
          'Flux public sans TLS',
          'Un flux venant d\'une source publique n\'est pas chiffré (TLS absent). Le trafic peut être écouté ou altéré.',
          [e.id],
          'Interception/altération des données en transit.',
          'Terminer TLS à l\'entrée (load balancer/reverse proxy) et marquer le flux tls.',
          'TLS ajoute une gestion de certificats, indispensable pour tout flux public.',
          { skills: ['archi'], glossary: ['net-tls', 'net-certificate'] }));
      }
    }
    return out;
  },

  // 11. Secret hors d'un secret-store.
  function secretOutsideStore(topo) {
    const out = [];
    const nodes = topo.nodes ?? [];
    const hasStore = nodes.some((n) => n.kind === 'secret-store');
    for (const n of nodes) {
      if (n.kind === 'secret-store') continue;
      if (truthy(n.props?.holdsSecrets)) {
        out.push(D('secret-outside-store', 'risk', 'security',
          `Secrets hors coffre : ${n.label}`,
          hasStore
            ? 'Un composant détient des secrets alors qu\'un coffre à secrets existe. Les secrets doivent y être centralisés, pas dispersés dans la configuration.'
            : 'Un composant détient des secrets sans aucun coffre dédié. Les secrets ne doivent pas vivre dans la configuration applicative.',
          [n.id],
          'Fuite de secret via la configuration, les logs ou une sauvegarde.',
          'Déplacer les secrets vers un coffre (secret-store) et les injecter au démarrage.',
          'Un coffre ajoute une dépendance, mais évite la dispersion et la fuite des secrets.',
          { skills: ['archi'], glossary: ['sec-secret', 'sec-secrets-management'] }));
      }
    }
    return out;
  },

  // 12. Environnement staging/dev qui pointe vers la production.
  function stagingPointsToProd(topo) {
    const out = [];
    const nodes = topo.nodes ?? []; const edges = topo.edges ?? [];
    const map = byId(nodes);
    for (const e of edges) {
      const src = map.get(e.from); const dst = map.get(e.to);
      if (!src || !dst) continue;
      const srcNonProd = src.environment === 'staging' || src.environment === 'development' || src.environment === 'testing';
      if (srcNonProd && dst.environment === 'production') {
        out.push(D('staging-points-to-prod', 'blocking', 'security',
          'Environnement hors-prod relié à la production',
          `Un composant en « ${src.environment} » accède à une ressource de production. Les environnements doivent être isolés.`,
          [e.id, src.id, dst.id],
          'Un test peut corrompre ou exposer les données de production.',
          'Séparer strictement les environnements ; donner à staging ses propres ressources.',
          'Partager des ressources réduit les coûts mais casse l\'isolation — inacceptable vers la production.',
          { skills: ['archi'], glossary: ['deploy-staging', 'deploy-environment'] }));
      }
    }
    return out;
  },

  // 13. Stratégie canary sans métrique de validation.
  function canaryNoMetric(topo) {
    const nodes = topo.nodes ?? [];
    const canary = nodes.filter((n) => n.props?.deployStrategy === 'canary');
    const hasMonitoring = nodes.some((n) => n.kind === 'monitoring');
    if (canary.length && !hasMonitoring) {
      return [D('canary-no-metric', 'risk', 'availability',
        'Déploiement canary sans métrique',
        'Une stratégie canary est déclarée sans observabilité. Un canary sans métrique de comparaison ne peut pas décider de promouvoir ou d\'annuler.',
        canary.map((n) => n.id),
        'Le canary ne détecte pas la régression qu\'il est censé attraper.',
        'Ajouter un monitoring et définir la métrique de succès du canary avant promotion.',
        'Le canary ralentit la livraison, mais seulement s\'il est mesuré il réduit le blast radius.',
        { skills: ['archi'], glossary: ['deploy-canary', 'deploy-blast-radius'] })];
    }
    return [];
  },

  // 14. Blue/green sans mécanisme de bascule.
  function blueGreenNoSwitch(topo) {
    const nodes = topo.nodes ?? [];
    const bg = nodes.filter((n) => n.props?.deployStrategy === 'blue-green');
    const hasSwitch = nodes.some((n) => n.kind === 'load-balancer' || n.kind === 'reverse-proxy' || n.kind === 'dns');
    if (bg.length && !hasSwitch) {
      return [D('blue-green-no-switch', 'risk', 'availability',
        'Blue/green sans mécanisme de bascule',
        'Une stratégie blue/green est déclarée sans point de bascule (load balancer, reverse proxy ou DNS) pour basculer le trafic d\'une version à l\'autre.',
        bg.map((n) => n.id),
        'Impossible de basculer proprement — ni de revenir en arrière — sans routeur de trafic.',
        'Ajouter un routeur de trafic (LB/reverse proxy/DNS) qui bascule blue ↔ green.',
        'Blue/green double temporairement les ressources, mais permet un rollback quasi instantané.',
        { skills: ['archi'], glossary: ['deploy-blue-green', 'prod-rollback'] })];
    }
    return [];
  },

  // 15. Sous-dimensionnement d'un service de production.
  function underProvisioned(topo) {
    const out = [];
    for (const n of topo.nodes ?? []) {
      if ((n.kind === 'api' || n.kind === 'backend') && n.environment === 'production') {
        const replicas = Number(n.props?.replicas);
        if (Number.isFinite(replicas) && replicas <= 1) {
          out.push(D('under-provisioned', 'warning', 'availability',
            `Service de production à instance unique : ${n.label}`,
            'Un service de production tourne en une seule instance : aucune tolérance à la panne ni au déploiement sans coupure.',
            [n.id],
            'Toute panne ou tout déploiement provoque une interruption.',
            'Prévoir au moins deux instances réparties sur plusieurs zones.',
            'Plus d\'instances coûtent plus cher, mais c\'est le minimum pour une continuité de service.',
            { skills: ['archi'], glossary: ['scale-horizontal', 'ha-high-availability'] }));
        }
      }
    }
    return out;
  },
];

/**
 * Analyse une topologie et produit des diagnostics + une synthèse. PUR.
 * @param {object} topo
 * @returns {{ diagnostics: object[], summary: { bySeverity: object, dimensions: string[], total: number } }}
 */
export function analyzeTopology(topo = {}) {
  const diagnostics = [];
  for (const rule of RULES) {
    try { diagnostics.push(...(rule(topo) ?? [])); } catch { /* une règle ne doit jamais casser l'analyse */ }
  }
  diagnostics.sort((a, b) => (SEV_RANK[a.severity] - SEV_RANK[b.severity]) || a.code.localeCompare(b.code) || a.evidence.join().localeCompare(b.evidence.join()));
  const bySeverity = { blocking: 0, risk: 0, warning: 0, observation: 0 };
  const dims = new Set();
  for (const d of diagnostics) { bySeverity[d.severity] += 1; dims.add(d.dimension); }
  return { diagnostics, summary: { bySeverity, dimensions: [...dims].sort(), total: diagnostics.length } };
}

/** Liste des codes de règles (pour tests et documentation). */
export function ruleCodes() {
  return RULES.map((r) => r.name);
}
