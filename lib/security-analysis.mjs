// Analyseur de scénarios de sécurité — PUR, déterministe, sans I/O (ADR/TSD-024).
//
// Un registre de RÈGLES pures inspecte les ARTEFACTS d'un scénario (config, env,
// log, manifeste, RBAC, lockfile, SBOM, en-têtes, pipeline, Dockerfile) et produit
// des diagnostics stables. Chaque diagnostic porte un niveau de confiance et
// distingue analyse RÉELLE de simulation. Aucune note magique. La base CVE est
// FACTICE et locale (jamais de réseau). Sortie triée → déterminisme.

import { detectSecretCandidates } from './security.mjs';

export const SEVERITIES = ['blocking', 'risk', 'warning', 'observation'];
const SEV_RANK = { blocking: 0, risk: 1, warning: 2, observation: 3 };
export const DOMAINS = ['secrets', 'supply-chain', 'rbac', 'kubernetes', 'exposure', 'deployment'];

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const asText = (c) => (typeof c === 'string' ? c : (() => { try { return JSON.stringify(c); } catch { return ''; } })());
const asObj = (c) => (isObj(c) ? c : null);

/** Compare une version simple « x.y.z » à une contrainte « <x.y.z ». Déterministe. */
function versionLt(v, bound) {
  const pa = String(v).replace(/^[^0-9]*/, '').split('.').map((n) => parseInt(n, 10) || 0);
  const pb = String(bound).split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const a = pa[i] ?? 0; const b = pb[i] ?? 0;
    if (a < b) return true; if (a > b) return false;
  }
  return false;
}

// Catalogue LOCAL de paquets « connus » (pour typosquatting/dependency confusion).
const KNOWN_PACKAGES = ['react', 'react-dom', 'next', 'lodash', 'express', 'axios', 'typescript', 'eslint', 'jest', 'chalk', 'commander', 'debug'];
function levenshtein(a, b) {
  const m = a.length; const n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  }
  return dp[m][n];
}

function D(code, severity, domain, resource, path, message, explanation, risk, recommendation, opt = {}) {
  return {
    code, severity, domain, resource, path, message, explanation, risk, recommendation,
    remediationOrder: opt.remediationOrder ?? null, autofixable: !!opt.autofixable,
    confidence: opt.confidence ?? 'high', real: opt.real !== false, simulated: !!opt.simulated,
    cwe: opt.cwe ?? null, glossary: opt.glossary ?? [],
  };
}

const SECRET_CONTEXT_KINDS = new Set(['config', 'env', 'manifest', 'dockerfile', 'pipeline', 'log']);

const RULES = [
  // ── SECRETS ──
  function hardcodedSecrets(scn) {
    const out = [];
    for (const a of scn.artifacts ?? []) {
      if (!SECRET_CONTEXT_KINDS.has(a.kind)) continue;
      const text = asText(a.content);
      for (const c of detectSecretCandidates(text)) {
        if (c.confidence === 'low') continue;
        const inLog = a.kind === 'log';
        out.push(D(inLog ? 'secret-in-log' : 'hardcoded-secret',
          c.confidence === 'high' ? 'blocking' : 'risk', 'secrets', a.id, a.path ?? a.kind,
          inLog ? `Secret exposé dans un log (${c.kind})` : `Secret en clair dans ${a.kind} (${c.kind})`,
          inLog ? 'Un secret apparaît dans un log : il fuit vers l\'agrégateur de logs, les sauvegardes et quiconque y accède.'
                : 'Un secret est écrit en clair dans un artefact versionné/déployé au lieu d\'être référencé depuis un coffre.',
          'Compromission du credential ; il doit être considéré comme fuité.',
          inLog ? 'Rédiger/masquer les secrets dans les logs ; révoquer et faire tourner le secret exposé.'
                : 'Déplacer vers un coffre/Secret et référencer ; révoquer et tourner le secret exposé.',
          { confidence: c.confidence, cwe: 'CWE-798', glossary: ['sec-secret', 'sec-secret-rotation', 'sec-credential-leak'] }));
      }
    }
    return out;
  },
  // ── RBAC / moindre privilège ──
  function rbacWildcards(scn) {
    const out = [];
    for (const a of scn.artifacts ?? []) {
      if (a.kind !== 'rbac') continue;
      const o = asObj(a.content); if (!o) continue;
      for (const rule of o.rules ?? []) {
        const verbs = rule.verbs ?? []; const res = rule.resources ?? [];
        if (verbs.includes('*') || res.includes('*')) {
          out.push(D('rbac-wildcard', 'risk', 'rbac', a.id, 'rules',
            'Permission RBAC en wildcard (*)',
            'Un Role/ClusterRole accorde « * » sur des verbes ou des ressources : c\'est l\'inverse du moindre privilège.',
            'Un compte compromis obtient des droits étendus (escalade de privilèges).',
            'Lister explicitement les verbes/ressources strictement nécessaires.',
            { confidence: 'high', cwe: 'CWE-269', glossary: ['sec-rbac', 'sec-least-privilege', 'sec-privilege-escalation'] }));
        }
      }
      if (o.kind === 'ClusterRole' && o.scopeHint === 'namespace') {
        out.push(D('clusterrole-unneeded', 'warning', 'rbac', a.id, 'kind',
          'ClusterRole là où un Role suffirait',
          'Un ClusterRole s\'applique à tout le cluster ; si la ressource est propre à un namespace, un Role est suffisant et plus sûr.',
          'Surface de permissions élargie inutilement.',
          'Remplacer par un Role + RoleBinding dans le namespace concerné.',
          { confidence: 'medium', glossary: ['sec-rbac', 'sec-least-privilege'] }));
      }
    }
    // Binding à un ServiceAccount privilégié.
    for (const a of scn.artifacts ?? []) {
      const o = asObj(a.content); if (!o || o.kind !== 'RoleBinding' && o.kind !== 'ClusterRoleBinding') continue;
      if ((o.subjectServiceAccount ?? '').includes('default') || o.privilegedSubject) {
        out.push(D('binding-privileged-sa', 'risk', 'rbac', a.id, 'subjects',
          'Binding vers un ServiceAccount trop privilégié',
          'Un binding attache des droits au ServiceAccount « default » ou à un compte partagé, au lieu d\'un compte dédié au moindre privilège.',
          'Tous les pods du namespace héritent de droits élargis.',
          'Créer un ServiceAccount dédié et lier les droits minimaux à celui-ci.',
          { confidence: 'medium', glossary: ['sec-serviceaccount', 'sec-rbac'] }));
      }
    }
    return out;
  },
  // ── SUPPLY CHAIN ──
  function supplyChain(scn, cveDb) {
    const out = [];
    const cve = Array.isArray(cveDb) ? cveDb : (cveDb?.entries ?? []);
    for (const a of scn.artifacts ?? []) {
      if (a.kind !== 'lockfile' && a.kind !== 'sbom') continue;
      const o = asObj(a.content); if (!o) continue;
      const deps = o.dependencies ?? o.packages ?? [];
      for (const dep of deps) {
        const name = dep.name ?? dep.package; const version = dep.version ?? '';
        // Non verrouillée (plage ^/~/*).
        if (/^[\^~]|[*x]/.test(String(version))) {
          out.push(D('dependency-unpinned', 'warning', 'supply-chain', a.id, `dependencies.${name}`,
            `Dépendance non verrouillée : ${name} ${version}`,
            'Une plage de versions (^/~/*) laisse installer une version non prévue : builds non reproductibles, surface d\'attaque mouvante.',
            'Installation silencieuse d\'une version compromise (supply chain).',
            'Épingler une version exacte et verrouiller via lockfile.',
            { confidence: 'high', glossary: ['sec-dependency-pinning', 'sec-supply-chain', 'sec-lockfile'] }));
        }
        // Vulnérable (CVE factice).
        for (const c of cve) {
          if (c.package === name && versionLt(String(version).replace(/^[\^~]/, ''), String(c.affectedBelow ?? c.fixed))) {
            out.push(D('dependency-vulnerable', c.severity === 'critical' ? 'blocking' : 'risk', 'supply-chain', a.id, `dependencies.${name}`,
              `Dépendance vulnérable : ${name} ${version} (${c.id})`,
              `Une vulnérabilité connue (${c.id}, base FACTICE locale) affecte ${name} < ${c.fixed}.`,
              'Exploitation de la vulnérabilité connue.',
              `Mettre à jour vers ${name} ≥ ${c.fixed} ; sinon mitiger/isoler.`,
              { confidence: 'high', cwe: c.cwe ?? null, glossary: ['sec-vulnerable-dependency', 'sec-cve', 'sec-cvss'] }));
          }
        }
        // Typosquatting (proche d'un paquet connu).
        if (name && !KNOWN_PACKAGES.includes(name)) {
          const near = KNOWN_PACKAGES.find((k) => k !== name && levenshtein(k, name) === 1);
          if (near) out.push(D('typosquatting', 'risk', 'supply-chain', a.id, `dependencies.${name}`,
            `Paquet au nom suspect : « ${name} » (proche de « ${near} »)`,
            'Un nom très proche d\'un paquet populaire est un signe de typosquatting (paquet malveillant qui usurpe le nom).',
            'Installation d\'un paquet malveillant à la place du légitime.',
            `Vérifier l'orthographe et la source ; utiliser « ${near} » si c'est l'intention.`,
            { confidence: 'medium', glossary: ['sec-typosquatting', 'sec-supply-chain'] }));
        }
        // Dependency confusion (paquet interne résolu en public).
        if (dep.internal && dep.source === 'public') {
          out.push(D('dependency-confusion', 'risk', 'supply-chain', a.id, `dependencies.${name}`,
            `Dependency confusion possible : ${name}`,
            'Un paquet censé être interne est résolu depuis un registre public : un attaquant peut publier un homonyme public.',
            'Substitution du paquet interne par une version publique malveillante.',
            'Réserver le nom sur le registre public et forcer la source interne.',
            { confidence: 'medium', glossary: ['sec-dependency-confusion', 'sec-supply-chain'] }));
        }
      }
    }
    return out;
  },
  // ── KUBERNETES hardening ──
  function k8sHardening(scn) {
    const out = [];
    for (const a of scn.artifacts ?? []) {
      if (a.kind !== 'manifest') continue;
      const o = asObj(a.content); if (!o) continue;
      const spec = o.kind === 'Pod' ? o.spec : o.spec?.template?.spec;
      const containers = spec?.containers ?? [];
      for (const c of containers) {
        const sc = c.securityContext ?? {};
        if (sc.runAsNonRoot !== true) out.push(D('workload-root', 'risk', 'kubernetes', a.id, `containers[${c.name}].securityContext`,
          'Conteneur susceptible de tourner en root',
          'Sans runAsNonRoot: true, le conteneur peut s\'exécuter en root, amplifiant l\'impact d\'une compromission.',
          'Élévation de privilèges au sein du nœud.',
          'Définir runAsNonRoot: true et un runAsUser non nul.',
          { autofixable: true, confidence: 'high', glossary: ['sec-securitycontext', 'sec-runasnonroot'] }));
        if (sc.readOnlyRootFilesystem !== true) out.push(D('writable-rootfs', 'warning', 'kubernetes', a.id, `containers[${c.name}].securityContext`,
          'Filesystem racine inscriptible',
          'Un rootfs inscriptible facilite la persistance d\'un attaquant et l\'exécution de binaires déposés.',
          'Persistance et altération du conteneur.',
          'Définir readOnlyRootFilesystem: true (+ volumes en écriture ciblés).',
          { autofixable: true, confidence: 'medium', glossary: ['sec-readonlyrootfilesystem'] }));
        const caps = sc.capabilities?.add ?? [];
        if (caps.length && !(sc.capabilities?.drop ?? []).includes('ALL')) out.push(D('capabilities-excessive', 'risk', 'kubernetes', a.id, `containers[${c.name}].securityContext.capabilities`,
          `Capabilities Linux non maîtrisées (${caps.join(', ')})`,
          'Des capabilities ajoutées sans « drop: [ALL] » élargissent les droits du conteneur au-delà du nécessaire.',
          'Accès privilégié au noyau depuis le conteneur.',
          'Retirer les capabilities et drop: [ALL], n\'ajouter que le strict nécessaire.',
          { confidence: 'high', glossary: ['sec-linux-capabilities', 'sec-least-privilege'] }));
        if (typeof c.image === 'string' && (c.image.endsWith(':latest') || !c.image.includes(':'))) out.push(D('image-untrusted-tag', 'risk', 'kubernetes', a.id, `containers[${c.name}].image`,
          'Image non épinglée (latest / sans tag)',
          'Une image « latest » ou sans tag n\'est pas reproductible et empêche de garantir la provenance.',
          'Déploiement d\'une image altérée sans détection.',
          'Épingler un digest immuable (sha256) et vérifier la provenance.',
          { confidence: 'high', glossary: ['sec-image-digest', 'sec-immutable-artifact', 'sec-provenance'] }));
      }
    }
    return out;
  },
  // ── EXPOSURE ──
  function exposure(scn) {
    const out = [];
    for (const a of scn.artifacts ?? []) {
      if (a.kind === 'headers') {
        const o = asObj(a.content) ?? {};
        const present = new Set(Object.keys(o).map((k) => k.toLowerCase()));
        const required = ['strict-transport-security', 'content-security-policy', 'x-content-type-options'];
        const missing = required.filter((h) => !present.has(h));
        if (missing.length) out.push(D('missing-security-headers', 'warning', 'exposure', a.id, 'headers',
          `En-têtes de sécurité manquants (${missing.join(', ')})`,
          'Des en-têtes de sécurité HTTP absents laissent l\'application exposée à des classes d\'attaques (downgrade, XSS, sniffing).',
          'Surface d\'attaque accrue côté navigateur.',
          'Ajouter HSTS, CSP et X-Content-Type-Options (au minimum).',
          { autofixable: true, confidence: 'medium', glossary: ['sec-defense-in-depth', 'sec-attack-surface'] }));
      }
      if (a.kind === 'manifest') {
        const o = asObj(a.content); if (!o) continue;
        const spec = o.kind === 'Pod' ? o.spec : o.spec?.template?.spec;
        if (spec?.hostNetwork === true) out.push(D('host-network', 'risk', 'exposure', a.id, 'spec.hostNetwork',
          'hostNetwork activé',
          'Le pod partage la pile réseau du nœud, contournant l\'isolation réseau et exposant des ports du nœud.',
          'Accès élargi au réseau du nœud.',
          'Retirer hostNetwork sauf besoin infrastructurel justifié.',
          { confidence: 'high', glossary: ['sec-attack-surface'] }));
        if (o.kind === 'Deployment' && o.exposeNote === 'no-networkpolicy') out.push(D('no-networkpolicy', 'warning', 'exposure', a.id, 'network',
          'Aucune NetworkPolicy déclarée',
          'Sans NetworkPolicy, tout pod peut communiquer avec tout pod : pas de segmentation réseau (défense en profondeur).',
          'Déplacement latéral facilité en cas de compromission.',
          'Définir des NetworkPolicy « deny par défaut » puis autoriser le nécessaire.',
          { confidence: 'medium', glossary: ['sec-networkpolicy', 'sec-defense-in-depth'] }));
      }
    }
    return out;
  },
  // ── DEPLOYMENT / pipeline ──
  function pipeline(scn) {
    const out = [];
    for (const a of scn.artifacts ?? []) {
      if (a.kind !== 'pipeline') continue;
      const text = asText(a.content);
      // Secret loggé dans le pipeline (echo $SECRET…).
      if (/echo\s+\$?\{?[A-Z_]*(SECRET|TOKEN|PASSWORD|KEY)/i.test(text)) out.push(D('pipeline-logs-secret', 'risk', 'deployment', a.id, a.path ?? 'pipeline',
        'Le pipeline journalise un secret',
        'Une étape affiche une variable sensible dans les logs de CI, où elle devient lisible et archivée.',
        'Fuite du secret via les logs de pipeline.',
        'Ne jamais echo un secret ; utiliser le masquage natif et des secrets injectés.',
        { confidence: 'medium', glossary: ['sec-credential-leak', 'sec-secret'] }));
    }
    return out;
  },
];

/**
 * Analyse un scénario. PUR, déterministe.
 * @param {object} scn { artifacts:[...] }
 * @param {Array|object} cveDb base CVE FACTICE locale (facultative)
 * @returns {{ diagnostics:object[], summary:{ bySeverity, byDomain, dimensions, total, limits } }}
 */
export function analyzeScenario(scn = {}, cveDb = []) {
  const s = { artifacts: Array.isArray(scn.artifacts) ? scn.artifacts : [] };
  const diagnostics = [];
  for (const rule of RULES) { try { diagnostics.push(...(rule(s, cveDb) ?? [])); } catch { /* une règle ne casse jamais l'analyse */ } }
  diagnostics.sort((a, b) => (SEV_RANK[a.severity] - SEV_RANK[b.severity]) || a.domain.localeCompare(b.domain) || a.code.localeCompare(b.code) || a.resource.localeCompare(b.resource));
  const bySeverity = { blocking: 0, risk: 0, warning: 0, observation: 0 };
  const byDomain = Object.fromEntries(DOMAINS.map((d) => [d, 0]));
  const dims = new Set();
  for (const d of diagnostics) { bySeverity[d.severity] += 1; byDomain[d.domain] = (byDomain[d.domain] ?? 0) + 1; dims.add(d.domain); }
  const limits = [
    'Analyse déterministe sur fixtures locales : ne remplace ni un SAST, ni un scanner de dépendances, ni un audit professionnel.',
    'La base CVE est FACTICE et locale ; aucune interrogation d\'une base distante.',
    'La détection de secrets combine motif + contexte ; des faux positifs/négatifs sont possibles (voir confidence).',
  ];
  return { diagnostics, summary: { bySeverity, byDomain, dimensions: [...dims].sort(), total: diagnostics.length, limits } };
}

export function ruleCodes() { return RULES.map((r) => r.name); }
