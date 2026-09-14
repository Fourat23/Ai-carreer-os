// V76 · CP7 — L'AIDE CONSULTÉE EST UN FAIT. Module PUR.
//
// ── CE QUI MANQUAIT, ET POURQUOI ÇA COMPTE ──────────────────────────────
//
// Le CP0 a mesuré que l'échelle d'aide montait sur le NOMBRE d'échecs. Le CP6
// lui a donné le SYMPTÔME. Il reste le trou le plus gênant des trois :
//
//   **rien n'enregistre qu'une aide a été lue.**
//
// Conséquences, toutes visibles dans le produit d'avant :
//
//   · une réussite après trois indices est indiscernable d'une réussite
//     immédiate. Le contrat gelé (§1.12) exige pourtant que « la provenance le
//     montre » ;
//   · l'échelle repropose la même marche à l'identique, puisqu'elle ne sait pas
//     que la précédente a été vue ;
//   · un apprenant qui monte volontairement l'échelle jusqu'à la correction ne
//     laisse aucune trace de ce parcours.
//
// ── CE QUE CE FAIT N'EST PAS ────────────────────────────────────────────
//
// **Ce n'est pas une punition, et ce n'est pas un score.** Le contrat est
// explicite : *« la réussite après une aide lourde reste une réussite ; sa
// provenance doit le montrer »*. On enregistre donc ce qui s'est passé, et rien
// de plus : ni pénalité, ni pourcentage, ni jugement.
//
// C'est aussi pourquoi ce module ne calcule aucune moyenne : compter les aides
// pour en tirer une note serait exactement le « score fabriqué » que V75 avait
// interdit au §3 de son propre contrat.
import { dedupSorted } from './event-model.mjs';

/** Les marches de l'échelle, reprises de V74 · CP7. Vocabulaire FERMÉ. */
export const ACTIONS_AIDE = Object.freeze([
  'SOUS_PROBLEME', 'MODELE_MENTAL', 'INDICE', 'EXEMPLE_ANALOGUE',
  'EXERCICE_PLUS_SIMPLE', 'CORRECTION_COMPLETE', 'TENTATIVE_DIFFEREE',
]);
const ACTION_SET = new Set(ACTIONS_AIDE);

/** Plafond de conservation, aligné sur les autres faits du produit. */
export const MAX_HINT_VIEWS = 20_000;

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const str = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const iso = (v) => (typeof v === 'string' && !Number.isNaN(Date.parse(v)) ? v : null);

/**
 * Un fait « aide consultée ». Même contrat que les sept autres faits du produit
 * (V75 · CP2) : horloge SERVEUR, provenance obligatoire, vocabulaire fermé,
 * version de schéma.
 *
 * @param raw.exerciseId  l'exercice concerné
 * @param raw.action      la marche consultée — l'une des sept
 * @param raw.niveau      l'échelon auquel elle a été servie
 * @param raw.declenchee  `auto` (servie après un échec) ou `demandee` (l'apprenant l'a ouverte)
 */
export function normalizeHintView(raw, { now = null } = {}) {
  const r = isObj(raw) ? raw : {};
  const at = iso(r.at) ?? iso(now);
  if (!at) return null;

  const exerciseId = str(r.exerciseId, 120);
  if (!exerciseId) return null;
  if (!ACTION_SET.has(r.action)) return null;

  const producer = str(r.provenance?.producer, 60);
  if (!producer) return null;

  const n = Number(r.niveau);
  return {
    at,
    exerciseId,
    action: r.action,
    niveau: Number.isFinite(n) && n >= 0 && n <= 9 ? Math.trunc(n) : 0,
    // Le doute joue CONTRE le crédit : une aide dont on ignore l'origine est
    // comptée comme servie, pas comme demandée. Même posture que `correctionSeen`.
    declenchee: r.declenchee === 'demandee' ? 'demandee' : 'auto',
    provenance: { producer, method: str(r.provenance?.method, 80) },
    schemaVersion: 2,
  };
}

/**
 * Clé métier : un même échelon, sur un même exercice, à la même seconde, est le
 * même fait. Deux affichages du même indice ne sont pas deux consultations.
 */
export function hintViewKey(v) {
  return `${v.exerciseId}|${v.action}|${String(v.at).slice(0, 19)}`;
}

/** Normalise et déduplique une liste persistée. Triée par date, pas par insertion. */
export function normalizeHintViews(list) {
  const out = [];
  for (const v of Array.isArray(list) ? list : []) {
    const n = normalizeHintView(v, { now: null });
    if (n) out.push(n);
  }
  return dedupSorted(out, hintViewKey, { max: MAX_HINT_VIEWS });
}

/**
 * ── CE QUE L'APPRENANT A DÉJÀ VU SUR CET EXERCICE ────────────────────────
 *
 * Sert à deux choses, et à rien d'autre :
 *
 *   1. **ne pas reproposer une marche déjà lue** — une échelle qui se répète
 *      n'est pas une échelle ;
 *   2. **porter la provenance d'une réussite** — sans jamais la dévaluer.
 */
export function aidesDe(views, exerciseId) {
  return normalizeHintViews(views).filter((v) => v.exerciseId === exerciseId);
}

/** Les actions déjà consultées sur cet exercice, dans l'ordre. */
export function actionsVues(views, exerciseId) {
  return [...new Set(aidesDe(views, exerciseId).map((v) => v.action))];
}

/**
 * ── LA PROVENANCE D'UNE RÉUSSITE ─────────────────────────────────────────
 *
 * Répond à *« comment cette réussite a-t-elle été obtenue ? »* — une question
 * de description, pas d'évaluation.
 *
 * **`reussite` reste `true` dans tous les cas.** Le champ n'existe que pour
 * qu'une lecture rapide ne confonde pas « résolu seul » et « résolu après avoir
 * lu la correction ». Le contrat l'exige, et il interdit d'en faire une note.
 */
export function provenanceDeLaReussite(views, exerciseId) {
  const aides = aidesDe(views, exerciseId);
  const actions = [...new Set(aides.map((v) => v.action))];
  const correctionVue = actions.includes('CORRECTION_COMPLETE');
  return {
    /** Toujours vrai : on ne retire jamais une réussite. */
    reussite: true,
    aidesConsultees: aides.length,
    actions,
    correctionVue,
    /** Une phrase, en français, qui décrit sans juger. */
    lecture: correctionVue
      ? 'Réussi après avoir consulté la correction complète.'
      : aides.length === 0
        ? 'Réussi sans aide.'
        : `Réussi après ${aides.length} aide${aides.length > 1 ? 's' : ''} consultée${aides.length > 1 ? 's' : ''}.`,
  };
}
