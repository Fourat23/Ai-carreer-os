// V75 · CP10 — `TransferAttempt` : LE SEPTIÈME FAIT, ET LE DERNIER MANQUANT.
//
// ── CE QUE LE CP0 AVAIT MESURÉ ───────────────────────────────────────────
//
// L'inventaire des sept événements persistés se terminait par une ligne sans
// nuance : **`TransferAttempt` — INEXISTANT**. Le CP2 a inscrit le fait dans
// `FAITS` (grain `challenge`, provenance, clé, horodatage, version,
// `conceptId`) *avant* qu'il existe — c'est le contrat qui décide de la forme,
// pas l'implémentation. Ce module l'écrit, exactement comme le contrat l'a
// déclaré.
//
// ── LA DISSYMÉTRIE QUE CE FAIT CORRIGE ──────────────────────────────────
//
// Le CP9 a rendu les 25 défis atteignables, et le produit a commencé à écrire
// une PREUVE quand l'apprenant conserve un résultat. Mais il n'écrit **rien**
// quand le défi échoue, et **rien** quand l'apprenant corrige sans conserver.
//
// C'est mot pour mot le défaut que le CP2 de V74 avait corrigé pour les
// exercices : *« le système persistait la projection et jetait le fait. »* Un
// moteur branché sur des données qui n'enregistrent jamais l'échec ne peut rien
// mesurer — et le transfert est précisément le domaine où l'échec est
// l'information la plus utile, puisque c'est lui qui dit *« la notion tient
// chez elle et cède ailleurs »*.
//
// ── CE QUE CE FAIT NE DIT PAS ───────────────────────────────────────────
//
// `outcome: 'success'` signifie **« ce défi-ci, dans ce contexte-ci, à cet
// instant-ci, a été réussi »**. Rien de plus. Pas une maîtrise, pas une
// probabilité de transfert, pas un score de mémoire — le brief interdit les
// trois, et §10.3 le redit : **`TRANSFER_SUCCESS != MASTERY`**.
//
// ── PUR, COMME TOUS LES FAITS ───────────────────────────────────────────
//
// Aucune I/O, aucune horloge, aucun aléa. Il normalise, déduplique, et refuse.
import { normalizeEnvelope, ATTEMPT_OUTCOMES, dedupSorted } from './event-model.mjs';

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const str = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const iso = (v) => (typeof v === 'string' && !Number.isNaN(Date.parse(v)) ? v : null);

/**
 * Issues d'une tentative de transfert.
 *
 * Trois valeurs, et **pas une de plus** : §10.2 interdit d'inventer une
 * granularité non observable. Le correcteur rend `passed` sur `total` ; on en
 * dérive trois cas et on s'arrête là. « Presque réussi », « en progrès »,
 * « proche du seuil » ne sont pas des faits, ce sont des commentaires.
 */
export const TRANSFER_OUTCOMES = ['success', 'partial', 'failure'];
const OUTCOME_SET = new Set(TRANSFER_OUTCOMES);

/** Borne dure, alignée sur les autres faits du produit. */
export const MAX_TRANSFER_ATTEMPTS = 20000;

/**
 * ── LA FENÊTRE DE REJEU ──────────────────────────────────────────────────
 *
 * §10.5 : *« Même requête réseau rejouée != nouvelle tentative humaine. »*
 *
 * Le problème n'a pas de solution parfaite côté serveur : le client ne fournit
 * pas d'identifiant de tentative, et le contrat de V74 interdit de lui laisser
 * fournir l'horloge. La règle retenue est donc déclarée, et sa limite avec :
 *
 *   > Une soumission **strictement identique** (même défi, mêmes réponses,
 *   > même issue) arrivant **moins de 10 secondes** après la précédente est le
 *   > REJEU de celle-ci, pas une nouvelle tentative.
 *
 * Ce qui rend la règle défendable n'est pas le chiffre, c'est le raisonnement :
 * si les réponses sont identiques **au caractère près** et que rien ne s'est
 * écoulé, il n'y a **aucune information nouvelle** à enregistrer. Compter deux
 * fois n'ajouterait rien et fausserait le nombre de tentatives.
 *
 * Limite déclarée : un apprenant qui resoumettrait volontairement des réponses
 * identiques en moins de dix secondes est compté une fois. C'est le bon
 * résultat — il n'a rien tenté de neuf.
 */
export const FENETRE_REJEU_MS = 10_000;

/**
 * Issue DÉRIVÉE de passed/total — jamais fournie par l'appelant.
 * Même règle que `ExerciseAttempt` (V74 · CP2), et pour la même raison : une
 * issue fournie par celui qu'elle juge n'est pas une observation.
 */
export function outcomeDuTransfert(passed, total) {
  if (total > 0 && passed >= total) return 'success';
  if (passed > 0) return 'partial';
  return 'failure';
}

/**
 * Empreinte STABLE des réponses, pour la clé métier et la détection de rejeu.
 *
 * Déterministe : clés triées, tableaux triés. Deux soumissions identiques
 * rendent la même empreinte quel que soit l'ordre de sérialisation du client —
 * sans quoi un simple changement d'ordre de champs créerait une fausse
 * « nouvelle tentative ».
 */
export function empreinteReponses(responses) {
  if (!isObj(responses)) return '∅';
  const parts = Object.keys(responses).sort().map((k) => {
    const v = responses[k];
    if (Array.isArray(v)) return `${k}=[${[...v].map(String).sort().join(',')}]`;
    return `${k}=${String(v)}`;
  });
  return parts.join('&').slice(0, 500) || '∅';
}

/**
 * ── LE FAIT ──────────────────────────────────────────────────────────────
 *
 * @param raw.challengeId     identifiant du défi
 * @param raw.conceptIds      §10.1 — **cardinalité réelle préservée**
 * @param raw.competencyIds   idem
 * @param raw.passed/total    le verdict du correcteur SERVEUR
 * @param raw.startedAtDeclare horodatage d'ouverture **déclaré par le client**
 * @param raw.evidenceId      preuve produite, si l'apprenant l'a conservée
 * @param raw.retryOf         clé de la tentative précédente, si reprise
 * @param raw.sourceRef       d'où vient la tentative (`/transfer/<id>`)
 */
export function normalizeTransferAttempt(raw, { now = null, legacy = false } = {}) {
  const r = isObj(raw) ? raw : {};
  const env = normalizeEnvelope({ ...r, grain: 'challenge' }, { now, legacy });
  if (!env) return null;

  const challengeId = str(r.challengeId, 120);
  if (!challengeId) return null;

  const total = Number.isInteger(r.total) && r.total >= 0 ? r.total : 0;
  const passed = Number.isInteger(r.passed) && r.passed >= 0 ? Math.min(r.passed, total) : 0;

  // ── §10.1 · LA CARDINALITÉ RÉELLE, PRÉSERVÉE ──
  //
  // *« Un défi peut tester un concept unique, plusieurs concepts, plusieurs
  // compétences. NE PAS le forcer artificiellement à un concept unique. »*
  // C'est la même décision qu'au CP3 pour `evidence.conceptIds` : un champ
  // singulier obligerait à choisir, c'est-à-dire à fabriquer de la donnée.
  const liste = (v, n) => (Array.isArray(v)
    ? [...new Set(v.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim().slice(0, 120)))].slice(0, n)
    : []);

  const declare = iso(r.startedAtDeclare);
  return {
    ...env,
    grain: 'challenge',
    challengeId,
    conceptIds: liste(r.conceptIds, 12),
    competencyIds: liste(r.competencyIds, 8),
    passed,
    total,
    // Dérivée, jamais reçue : `outcomeDuTransfert` est la seule autorité.
    outcome: OUTCOME_SET.has(r.outcome) && r.outcome === outcomeDuTransfert(passed, total)
      ? r.outcome : outcomeDuTransfert(passed, total),
    // ── `startedAtDeclare` : DÉCLARÉ, et nommé comme tel ──
    //
    // Le serveur ne peut pas savoir quand l'apprenant a ouvert le défi. On
    // accepte donc la valeur du client, mais on refuse de la maquiller en
    // mesure — c'est la décision `scoreDeclare` du CP2, appliquée au temps.
    // Rejetée si elle est postérieure à la soumission : une tentative ne
    // commence pas après avoir fini.
    startedAtDeclare: declare && Date.parse(declare) <= Date.parse(env.at) ? declare : null,
    submittedAt: env.at,
    // La forme canonique de la validation, identique à celle des preuves.
    validation: {
      status: outcomeDuTransfert(passed, total) === 'success' ? 'passed' : 'failed',
      kind: 'assessment-grade',
      checkedAt: env.at,
      detail: `${passed}/${total}`,
    },
    evidenceId: str(r.evidenceId, 120) || null,
    retryOf: str(r.retryOf, 200) || null,
    sourceRef: str(r.sourceRef, 200) || null,
    empreinte: str(r.empreinte, 500) || '∅',
  };
}

/**
 * ── LA CLÉ MÉTIER ────────────────────────────────────────────────────────
 *
 * Défi + seconde + empreinte des réponses. La seconde vient de l'horloge
 * SERVEUR, l'empreinte des réponses réellement soumises : deux livraisons de la
 * même requête produisent la même clé, deux tentatives humaines distinctes
 * (réponses différentes, ou plus tard) en produisent deux.
 */
export function transferAttemptKey(a) {
  return `${a.challengeId}|${String(a.at).slice(0, 19)}|${a.empreinte ?? '∅'}`;
}

/**
 * Vrai si `candidat` est le REJEU réseau de `precedente` — §10.5.
 * Même défi, même empreinte, même issue, moins de `FENETRE_REJEU_MS`.
 */
export function estUnRejeu(candidat, precedente) {
  if (!candidat || !precedente) return false;
  if (candidat.challengeId !== precedente.challengeId) return false;
  if ((candidat.empreinte ?? '∅') !== (precedente.empreinte ?? '∅')) return false;
  if (candidat.outcome !== precedente.outcome) return false;
  const dt = Date.parse(candidat.at) - Date.parse(precedente.at);
  return Number.isFinite(dt) && dt >= 0 && dt < FENETRE_REJEU_MS;
}

/** Normalise et déduplique une liste persistée. Trie par date, jamais par insertion. */
export function normalizeTransferAttempts(list) {
  const out = [];
  for (const a of Array.isArray(list) ? list : []) {
    const n = normalizeTransferAttempt(a, { now: null, legacy: true });
    if (n) out.push(n);
  }
  return dedupSorted(out, transferAttemptKey, { max: MAX_TRANSFER_ATTEMPTS });
}

/**
 * ── §10.4 · L'HISTORIQUE D'UN DÉFI, RECONSTRUCTIBLE ──────────────────────
 *
 * *« Pouvoir reconstruire : attempt 1 → failure, attempt 2 → partial,
 * attempt 3 → success. »* Une reprise est un fait NEUF ; la précédente n'est
 * jamais écrasée, jamais corrigée, jamais supprimée.
 */
export function historiqueDuDefi(attempts, challengeId) {
  return normalizeTransferAttempts(attempts).filter((a) => a.challengeId === challengeId);
}

/** Vocabulaire partagé, pour que rien ne le redéclare ailleurs. */
export { ATTEMPT_OUTCOMES };
