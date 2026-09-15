// V77 · CP4 — `AssessmentAttempt` : CINQ ÉCHECS NE LAISSAIENT QU'UNE TRACE.
//
// ── CE QUE LE CP4 A MESURÉ, EN HTTP, AVANT D'ÉCRIRE UNE LIGNE ────────────
//
// Sept soumissions humaines sur le même diagnostic, serveur de production,
// progression hors du dépôt :
//
//   0/5 échec  → conservé
//   0/5 échec  → « Ce résultat est déjà enregistré. »
//   0/5 échec  → « Ce résultat est déjà enregistré. »
//   0/5 échec  → « Ce résultat est déjà enregistré. »
//   0/5 échec  → « Ce résultat est déjà enregistré. »
//   5/5 réussi → conservé
//   5/5 reprise→ « Ce résultat est déjà enregistré. »
//
//   état écrit : **2 preuves, 0 tentative.**
//
// Et une seconde mesure, plus gênante encore, sur une progression réelle :
//
//   0/5 → conservé · 1/5 → REFUSÉ comme doublon · 4/5 → conservé
//
// La clé de preuve est `sourceType:sourceId:compétences:qualifiante`. Elle
// **ignore le score**. Deux échecs de scores différents ont donc la même clé :
// c'est le PREMIER qui survit, et toute amélioration sous le seuil est jetée.
// Un apprenant qui passe de 0/5 à 3/5 sans atteindre le seuil laisse une trace
// disant `0/5`. *Le produit gardait la pire tentative et appelait ça un
// historique.*
//
// ── LA MÊME CAUSE QUE V74 · CP2, TROIS SPRINTS PLUS TARD ────────────────
//
// Ce n'est pas un oubli d'écriture, c'est le même choix d'objet qu'en V74 : le
// produit persiste la PROJECTION (la preuve, dédupliquée par nature) et jette
// le FAIT (la soumission, qui ne se déduplique pas). V74 l'a corrigé pour les
// exercices, V75 pour les transferts. Les diagnostics étaient restés.
//
// ── CE QUE CE FAIT N'EST PAS ────────────────────────────────────────────
//
// **Un diagnostic n'est pas une maîtrise.** Le fait porte `passed`, `total` et
// le `seuil` déclaré par la fixture — trois nombres vérifiables — et rien qui
// ressemble à un niveau, un pourcentage de maîtrise ou un rang. Le contrat gelé
// interdit nommément de transformer un assessment en `mastery` ; le moyen le
// plus sûr de ne pas le faire est de ne jamais calculer autre chose que ce que
// le correcteur a compté.
import { normalizeEnvelope, dedupSorted, ATTEMPT_OUTCOMES } from './event-model.mjs';
// `empreinteReponses` vient de V75 · CP10 et n'est pas réécrite ici. Deux
// implémentations d'une même empreinte dériveraient un jour, et deux règles de
// déduplication différentes sur deux surfaces jumelles seraient exactement le
// genre d'incohérence que ce sprint passe son temps à retirer.
import { empreinteReponses, FENETRE_REJEU_MS } from './transfer-attempt.mjs';

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const str = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

/**
 * ── UN SEUL FAIT POUR DEUX SURFACES ─────────────────────────────────────
 *
 * Le CP2 l'a tranché : un capstone est observationnellement un diagnostic —
 * un questionnaire corrigé côté serveur contre un corrigé déclaré. La
 * différence est pédagogique (scénario d'incident en sept phases), pas
 * observationnelle. Elle vit donc dans ce champ, et l'environnement simulé
 * dans `simulation` — **pas dans deux types de faits jumeaux**.
 */
export const GENRES = Object.freeze(['assessment', 'capstone']);
const GENRE_SET = new Set(GENRES);

/** Borne dure, alignée sur les autres faits du produit. */
export const MAX_ASSESSMENT_ATTEMPTS = 20_000;

/** Seuil par défaut, repris de `lib/assessment.mjs`. Aucun seuil n'est inventé ici. */
export const SEUIL_PAR_DEFAUT = 0.7;

const int = (v, min, max) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
};

/**
 * Issue DÉRIVÉE de `passed`, `total` et du seuil DÉCLARÉ PAR LA FIXTURE —
 * jamais fournie par l'appelant. Même règle qu'en V74 · CP2 et V75 · CP10 :
 * *une issue fournie par celui qu'elle juge n'est pas une observation.*
 *
 * Le seuil n'est pas une invention de ce module : c'est `passThreshold`, gelé
 * dans le contenu versionné et déjà en vigueur pour la preuve. On le RECOPIE
 * dans le fait pour qu'un lecteur futur puisse refaire le calcul sans avoir à
 * retrouver la version de la fixture.
 */
export function issueDuDiagnostic(passed, total, seuil = SEUIL_PAR_DEFAUT) {
  if (!Number.isFinite(total) || total <= 0) return 'failure';
  if (passed >= total) return 'success';
  if (passed / total >= seuil) return 'success';
  return passed > 0 ? 'partial' : 'failure';
}

/**
 * ── LE FAIT ──────────────────────────────────────────────────────────────
 *
 * @param raw.assessmentId  le diagnostic ou le capstone soumis
 * @param raw.kind          `assessment` (défaut) ou `capstone`
 * @param raw.passed/total  ce que le correcteur SERVEUR a compté
 * @param raw.seuil         `passThreshold` de la fixture, recopié
 * @param raw.simulation    l'environnement est-il simulé (capstone : oui)
 * @param raw.empreinte     empreinte des réponses réellement soumises
 * @param raw.evidenceId    la preuve produite, si l'apprenant l'a conservée
 */
export function normalizeAssessmentAttempt(raw, { now = null, legacy = false } = {}) {
  const r = isObj(raw) ? raw : {};
  const env = normalizeEnvelope({ ...r, grain: 'assessment' }, { now, legacy });
  if (!env) return null;

  const assessmentId = str(r.assessmentId, 120);
  if (!assessmentId) return null;

  const total = int(r.total, 0, 10_000);
  if (total === null) return null;
  const passed = int(r.passed, 0, total);
  if (passed === null) return null;

  const s = Number(r.seuil);
  const seuil = Number.isFinite(s) && s > 0 && s <= 1 ? s : SEUIL_PAR_DEFAUT;
  const outcome = issueDuDiagnostic(passed, total, seuil);

  const liste = (v, n) => (Array.isArray(v)
    ? [...new Set(v.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim().slice(0, 120)))].slice(0, n)
    : []);

  return {
    ...env,
    grain: 'assessment',
    assessmentId,
    kind: GENRE_SET.has(r.kind) ? r.kind : 'assessment',
    competencyIds: liste(r.competencyIds, 8),
    passed,
    total,
    seuil,
    // Dérivée, jamais reçue.
    outcome,
    /**
     * Le seuil est-il atteint ? C'est exactement `passedOverall` du correcteur,
     * recalculé ici pour que le fait ne dépende pas de la bonne foi de son
     * émetteur. **Ce n'est pas un niveau de maîtrise** : c'est un seuil déclaré
     * d'avance, appliqué à un décompte.
     */
    reussiteGlobale: total > 0 && passed / total >= seuil,
    /**
     * ── `simulation` EST UN CHAMP, PAS UNE PHRASE ──
     * Le CP0 a mesuré que la marque de simulation vivait dans du texte libre
     * (dette `D9`) — c'est-à-dire nulle part, du point de vue d'un lecteur
     * futur. Booléen, il survit à la sérialisation et se teste.
     */
    simulation: r.simulation === true,
    // La forme canonique de la validation, identique à celle des preuves.
    validation: {
      status: total > 0 && passed / total >= seuil ? 'passed' : 'failed',
      kind: 'assessment-grade',
      checkedAt: env.at,
      detail: `${passed}/${total}`,
    },
    evidenceId: str(r.evidenceId, 120) || null,
    sourceRef: str(r.sourceRef, 200) || null,
    empreinte: str(r.empreinte, 500) || '∅',
  };
}

/**
 * ── LA CLÉ MÉTIER ────────────────────────────────────────────────────────
 *
 * Diagnostic + seconde SERVEUR + empreinte des réponses. Reprise mot pour mot
 * de V75 · CP10, parce que le problème est le même :
 *
 *   · deux livraisons de la même requête → **une** tentative ;
 *   · l'interface corrige (`submit`) puis conserve (`keep`) les MÊMES réponses
 *     → même empreinte, et donc **une** tentative si les deux appels tombent
 *     dans la même seconde ;
 *   · cinq soumissions humaines identiques à des instants différents → **cinq**
 *     tentatives, parce que ce sont cinq faits.
 *
 * Le score ne fait PAS partie de la clé, à la différence de la clé de preuve.
 * C'est volontaire : la seconde et l'empreinte identifient l'ACTE, et deux
 * actes distincts qui obtiennent le même score restent deux actes.
 */
export function assessmentAttemptKey(a) {
  return `${a.assessmentId}|${String(a.at).slice(0, 19)}|${a.empreinte ?? '∅'}`;
}

/**
 * Vrai si `candidat` est le REJEU de `precedente` : même diagnostic, mêmes
 * réponses, même issue, à moins de dix secondes. C'est le cas de l'interface
 * qui corrige puis conserve — **une seule pensée, deux requêtes.**
 */
export function estUnRejeu(candidat, precedente) {
  if (!candidat || !precedente) return false;
  if (candidat.assessmentId !== precedente.assessmentId) return false;
  if ((candidat.empreinte ?? '∅') !== (precedente.empreinte ?? '∅')) return false;
  if (candidat.outcome !== precedente.outcome) return false;
  const dt = Date.parse(candidat.at) - Date.parse(precedente.at);
  return Number.isFinite(dt) && dt >= 0 && dt < FENETRE_REJEU_MS;
}

/** Normalise et déduplique une liste persistée. Triée par date, pas par insertion. */
export function normalizeAssessmentAttempts(list) {
  const out = [];
  for (const a of Array.isArray(list) ? list : []) {
    const n = normalizeAssessmentAttempt(a, { now: null, legacy: true });
    if (n) out.push(n);
  }
  return dedupSorted(out, assessmentAttemptKey, { max: MAX_ASSESSMENT_ATTEMPTS });
}

/**
 * ── L'HISTORIQUE D'UN DIAGNOSTIC, RECONSTRUCTIBLE ────────────────────────
 *
 * C'est la raison d'être du checkpoint : pouvoir lire
 * `0/5 → 1/5 → 3/5 → 4/5` au lieu d'un unique `0/5`. Une reprise est un fait
 * NEUF ; la précédente n'est jamais écrasée, corrigée ni supprimée.
 */
export function historiqueDuDiagnostic(attempts, assessmentId) {
  return normalizeAssessmentAttempts(attempts).filter((a) => a.assessmentId === assessmentId);
}

/**
 * ── CE QU'UN PILOTE HUMAIN A LE DROIT DE LIRE ────────────────────────────
 *
 * Des NOMBRES et des dates, pas un jugement. Aucun champ ne dit « progresse »,
 * « stagne » ou « maîtrise » : une courbe de scores est une observation, la
 * qualifier serait une conclusion — et le contrat interdit les deux dernières.
 */
export function lectureDuDiagnostic(attempts, assessmentId) {
  const h = historiqueDuDiagnostic(attempts, assessmentId);
  const scores = h.map((a) => `${a.passed}/${a.total}`);
  const reussies = h.filter((a) => a.reussiteGlobale).length;
  return {
    assessmentId,
    tentatives: h.length,
    scores,
    reussies,
    echouees: h.length - reussies,
    premier: h[0]?.at ?? null,
    dernier: h[h.length - 1]?.at ?? null,
    /** Aucune tentative n'est PAS une absence de donnée : c'est une donnée. */
    lecture: h.length === 0
      ? 'Aucune soumission observée sur ce diagnostic.'
      : `${h.length} soumission${h.length > 1 ? 's' : ''} : ${scores.join(' → ')}`
        + ` — seuil atteint ${reussies} fois sur ${h.length}.`,
  };
}

/** Vocabulaire partagé, pour que rien ne le redéclare ailleurs. */
export { ATTEMPT_OUTCOMES };
