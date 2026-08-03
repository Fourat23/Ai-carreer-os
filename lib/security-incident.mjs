// Réponse à incident de sécurité — PURE, déterministe, sans I/O (ADR/TSD-024).
//
// Déroule des phases déterministes (détection → qualification → confinement →
// éradication → récupération → post-mortem) et fournit les décisions clés :
// ordre de réponse à une fuite de secret, choix rollback/roll-forward/hotfix/
// mitigation. Aucune exécution, aucune I/O : ce sont des propriétés qualitatives.

export const INCIDENTS = ['secret-leak', 'dependency-compromise', 'access-compromise', 'broken-security-deploy', 'critical-regression', 'image-untrusted'];

/** Ordre CORRECT de réponse à une fuite de secret (révocation AVANT rotation). PUR. */
export function secretResponseOrder() {
  return ['revocation', 'rotation', 'redeploy', 'audit'];
}

/**
 * Décide de la stratégie de reprise. PUR.
 * @param {{ reversible?:boolean, urgent?:boolean, dataMigrationBlocks?:boolean }} ctx
 * @returns {'rollback'|'roll-forward'|'hotfix'|'mitigation'}
 */
export function decideRecovery(ctx = {}) {
  if (ctx.dataMigrationBlocks) return 'roll-forward'; // retour impossible
  if (ctx.reversible) return 'rollback';
  if (ctx.urgent) return 'hotfix';
  return 'mitigation';
}

const PHASES = ['detection', 'qualification', 'containment', 'eradication', 'recovery', 'post-mortem'];

const CATALOG = {
  'secret-leak': {
    severity: 'high',
    detection: 'Un secret factice apparaît dans un artefact/log versionné.',
    qualification: 'Traiter le secret comme COMPROMIS quelle que soit sa portée apparente.',
    containment: 'Révoquer immédiatement le credential (il est inutilisable même s\'il a fuité).',
    eradication: 'Faire tourner (rotation) le secret et purger les traces dans les logs/historique.',
    recovery: 'Redéployer avec le nouveau secret injecté depuis un coffre.',
    postmortem: 'Auditer l\'usage du secret, ajouter détection de secret en CI (prévention).',
    order: ['revocation', 'rotation', 'redeploy', 'audit'],
    glossary: ['sec-credential-leak', 'sec-secret-revocation', 'sec-secret-rotation'],
  },
  'dependency-compromise': {
    severity: 'high',
    detection: 'Une dépendance (ou une transitive) est signalée compromise/vulnérable.',
    qualification: 'Évaluer l\'exposition : où la dépendance est-elle utilisée ? quel blast radius ?',
    containment: 'Geler les déploiements ; épingler/retirer la version compromise.',
    eradication: 'Remplacer par une version saine ou isoler ; reconstruire depuis un lockfile vérifié.',
    recovery: 'Redéployer, surveiller les indicateurs de compromission.',
    postmortem: 'Renforcer le verrouillage, la provenance et la revue des mises à jour.',
    order: ['freeze', 'replace', 'rebuild', 'monitor'],
    glossary: ['sec-supply-chain', 'sec-vulnerable-dependency', 'sec-lockfile'],
  },
  'access-compromise': {
    severity: 'high',
    detection: 'Un accès (ServiceAccount/rôle) semble compromis ou sur-privilégié exploité.',
    qualification: 'Déterminer les droits réels de l\'identité et ce qu\'elle a pu atteindre.',
    containment: 'Révoquer/limiter l\'identité, réduire les permissions (moindre privilège).',
    eradication: 'Corriger le RBAC, retirer les wildcards et bindings trop larges.',
    recovery: 'Recréer une identité dédiée au moindre privilège, redéployer.',
    postmortem: 'Auditer les rôles, activer les audit logs.',
    order: ['revoke', 'restrict', 'fix-rbac', 'audit'],
    glossary: ['sec-rbac', 'sec-privilege-escalation', 'sec-least-privilege'],
  },
  'broken-security-deploy': {
    severity: 'medium',
    detection: 'Un correctif de sécurité casse la production.',
    qualification: 'Mesurer l\'impact et vérifier la réversibilité (migration non rétrocompatible ?).',
    containment: 'Décider rollback (si réversible) ou roll-forward (si retour impossible).',
    eradication: 'Préparer un hotfix qui corrige sans réintroduire la faille.',
    recovery: 'Déployer, vérifier le service ET la propriété de sécurité.',
    postmortem: 'Ajouter un test qui couvre à la fois la régression et la faille.',
    order: ['assess', 'decide-recovery', 'hotfix', 'verify'],
    glossary: ['sec-rollback', 'sec-roll-forward', 'sec-hotfix'],
  },
  'critical-regression': {
    severity: 'high',
    detection: 'Une nouvelle version introduit une régression critique.',
    qualification: 'Confirmer la régression et son périmètre (blast radius).',
    containment: 'Rollback si réversible, sinon feature flag/kill switch.',
    eradication: 'Corriger la cause en amont.',
    recovery: 'Redéployer, valider par tests de non-régression.',
    postmortem: 'Post-mortem sans blâme, action préventive.',
    order: ['confirm', 'contain', 'fix', 'verify'],
    glossary: ['sec-regression', 'sec-rollback', 'sec-kill-switch'],
  },
  'image-untrusted': {
    severity: 'medium',
    detection: 'Une image de conteneur ne peut plus être considérée fiable.',
    qualification: 'Identifier où l\'image tourne et depuis quand.',
    containment: 'Bloquer le déploiement de l\'image ; revenir à un digest de confiance connu.',
    eradication: 'Reconstruire depuis une source vérifiée, épingler le digest, vérifier la provenance.',
    recovery: 'Redéployer l\'image de confiance.',
    postmortem: 'Exiger signature/provenance et image pull policy stricte.',
    order: ['block', 'pin-trusted', 'rebuild', 'verify'],
    glossary: ['sec-image-digest', 'sec-provenance', 'sec-artifact-signing'],
  },
};

/**
 * Simule une réponse à incident. PUR, déterministe.
 * @returns {{ ok, error?, incident?, severity?, phases?, order?, decision?, diagnostics? }}
 */
export function simulateIncident(scn = {}, kind = scn?.incident) {
  if (!INCIDENTS.includes(kind)) return { ok: false, error: `incident inconnu « ${kind} »` };
  const c = CATALOG[kind];
  const phases = PHASES.map((p) => ({ phase: p, action: c[p === 'post-mortem' ? 'postmortem' : p] }));
  const decision = (kind === 'broken-security-deploy' || kind === 'critical-regression')
    ? decideRecovery({ reversible: scn?.reversible !== false, urgent: !!scn?.urgent, dataMigrationBlocks: !!scn?.dataMigrationBlocks })
    : null;
  const diagnostics = [{
    code: `incident-${kind}`, severity: c.severity === 'high' ? 'blocking' : 'risk', domain: 'incident',
    title: kind, recommendation: c.containment, order: c.order, glossary: c.glossary,
  }];
  return { ok: true, incident: kind, severity: c.severity, phases, order: c.order, decision, diagnostics };
}
