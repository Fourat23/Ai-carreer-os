// V77 · CP5 — `MissionSubmission` : SÉPARER TROIS CHOSES QU'UNE MISSION
// CONFONDAIT.
//
// ── CE QUE LE CP0 A MESURÉ ──────────────────────────────────────────────
//
// Deux mesures, pas une intuition :
//
//   · **42 missions sur 42** terminent sur un livrable de revue que
//     l'apprenant valide lui-même, d'un clic (`action: 'validate-review'`) ;
//   · un document décrivant une conception **délibérément mauvaise** obtient
//     `structure ok: true` — la sonde `A9` du CP0 l'a vérifié sur le
//     validateur réel.
//
// Et pourtant le produit écrivait :
//
//     validation: { status: 'passed', kind: 'mission-deliverables' }
//
// c'est-à-dire une preuve QUALIFIANTE, au même rang qu'un exercice dont les
// tests ont réellement tourné en bac à sable.
//
// ── TROIS CHOSES DANS UN SEUL MOT ───────────────────────────────────────
//
// `passed` répondait à trois questions à la fois, et c'est pour cela qu'il
// mentait :
//
//   1. **l'avancement** — les livrables requis sont-ils faits ? (`done`)
//   2. **le niveau de validation** — par quel moyen l'a-t-on constaté ?
//   3. **la preuve** — cela suffit-il à créditer une compétence ?
//
// Les trois sont maintenant distinctes : le statut de mission reste
// `computeMissionStatus` (inchangé), le niveau est calculé ici, et la preuve
// en découle.
//
// ── LA RÈGLE DU MAILLON FAIBLE ──────────────────────────────────────────
//
// Contrat gelé (CP1 §2) : *le niveau d'une preuve composite est celui de sa
// composante la plus FAIBLE.* Une mission agrège un livrable auto-vérifié
// (`OBSERVED`), un document structurellement valide (`OBSERVED`) et une revue
// que l'apprenant signe lui-même (`DECLARED`).
//
//   > `STRUCTURE_VALID + SELF_CONFIRMATION` ne peut pas valoir `VALIDATED`.
//
// C'est la décision la plus lourde de V77, et la seule honnête : une mission
// documente un travail, elle ne le juge pas.
//
// ── CE QUE CE MODULE NE FAIT PAS ────────────────────────────────────────
//
// Il ne dévalue aucun travail. Une mission terminée reste une mission
// terminée — l'avancement est intact, la preuve existe toujours, elle est
// exportable et visible. Ce qui change est ce qu'elle **prétend démontrer**.
import { normalizeEnvelope, dedupSorted } from './event-model.mjs';

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const str = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

/** Les modes de validation d'un livrable, tels qu'ils existent dans les fixtures. */
export const MODES_DE_LIVRABLE = Object.freeze(['auto', 'structural', 'review']);

/**
 * Ce que chaque mode permet d'OBSERVER, au mieux.
 *
 * `auto` — une vérification exécutée par le produit (fichier présent, forme
 *   attendue). Observé, jamais jugé sur le fond.
 * `structural` — la conformité de FORME d'un document. Le CP0 a mesuré qu'un
 *   contenu faux mais bien structuré passe : c'est donc une observation, et en
 *   aucun cas une validation.
 * `review` — l'apprenant déclare que son travail convient. C'est une
 *   DÉCLARATION, et le mot doit rester celui-là.
 */
export const NIVEAU_PAR_MODE = Object.freeze({
  auto: 'OBSERVED',
  structural: 'OBSERVED',
  review: 'DECLARED',
});

const NIVEAUX = Object.freeze(['DECLARED', 'OBSERVED', 'VALIDATED']);
const rang = (n) => NIVEAUX.indexOf(n);

/** Borne dure, alignée sur les autres faits du produit. */
export const MAX_MISSION_SUBMISSIONS = 20_000;

/** Statuts de livrable observables. Vocabulaire FERMÉ, repris de `mission-state`. */
export const STATUTS_DE_LIVRABLE = Object.freeze([
  'submitted', 'structure-valid', 'self-assessed', 'validated', 'rejected',
]);

/**
 * ── LE MAILLON LE PLUS FAIBLE D'UNE MISSION ──────────────────────────────
 *
 * Calculé sur les livrables REQUIS uniquement : un livrable optionnel non rendu
 * ne doit pas abaisser ce qu'on dit du travail rendu.
 *
 * Renvoie `null` pour une mission sans livrable requis — un cas sans maillon
 * n'a pas de maillon faible, et inventer `DECLARED` serait déjà un jugement.
 */
export function maillonFaibleDeLaMission(missionDef) {
  const requis = (missionDef?.deliverables ?? []).filter((d) => d?.required);
  if (requis.length === 0) return null;
  let pire = 'VALIDATED';
  for (const d of requis) {
    const n = NIVEAU_PAR_MODE[d.validation] ?? 'DECLARED';
    if (rang(n) < rang(pire)) pire = n;
  }
  return pire;
}

/**
 * Le niveau qu'une mission peut atteindre, au mieux — **structurellement**.
 *
 * Il ne dépend pas de ce que l'apprenant a fait, mais de ce que la mission
 * permet d'observer. C'est pour cela qu'il se calcule sur la DÉFINITION : le
 * plafond existe avant la première soumission, et aucune performance ne le
 * lève.
 */
export function niveauDeLaMission(missionDef) {
  return maillonFaibleDeLaMission(missionDef) ?? 'OBSERVED';
}

/**
 * ── LE FAIT ──────────────────────────────────────────────────────────────
 *
 * Une soumission de livrable, observée telle quelle. Elle ne dit pas que le
 * travail est bon ; elle dit qu'il a été rendu, par quel mode il a été
 * constaté, et ce que ce mode permet d'affirmer.
 *
 * @param raw.missionId      la mission
 * @param raw.deliverableId  le livrable
 * @param raw.mode           `auto` · `structural` · `review`
 * @param raw.statut         le statut atteint
 * @param raw.structureOk    la validation de FORME a-t-elle abouti (mode `structural`)
 * @param raw.manques        ce que le validateur de structure a signalé
 */
export function normalizeMissionSubmission(raw, { now = null, legacy = false } = {}) {
  const r = isObj(raw) ? raw : {};
  const env = normalizeEnvelope({ ...r, grain: 'project' }, { now, legacy });
  if (!env) return null;

  const missionId = str(r.missionId, 120);
  const deliverableId = str(r.deliverableId, 120);
  if (!missionId || !deliverableId) return null;

  if (!MODES_DE_LIVRABLE.includes(r.mode)) return null;
  if (!STATUTS_DE_LIVRABLE.includes(r.statut)) return null;

  const mode = r.mode;
  return {
    ...env,
    grain: 'project',
    missionId,
    deliverableId,
    mode,
    statut: r.statut,
    /**
     * ── LE NIVEAU EST DÉRIVÉ DU MODE, PAS DU RÉSULTAT ──
     *
     * Une revue signée par l'apprenant reste `DECLARED` même quand il la signe
     * avec conviction. C'est la seule façon de ne pas confondre *« j'ai fini »*
     * et *« c'est juste »*.
     */
    niveau: NIVEAU_PAR_MODE[mode] ?? 'DECLARED',
    /** Conformité de FORME. `null` hors du mode `structural` : on ne l'a pas mesurée. */
    structureOk: mode === 'structural' ? r.structureOk === true : null,
    manques: Array.isArray(r.manques)
      ? r.manques.filter((m) => typeof m === 'string' && m.trim()).map((m) => m.trim().slice(0, 200)).slice(0, 20)
      : [],
    /** Taille du document rendu — une observation, jamais une note. */
    tailleContenu: Number.isInteger(r.tailleContenu) && r.tailleContenu >= 0 ? Math.min(r.tailleContenu, 10_000_000) : 0,
  };
}

/**
 * CLÉ MÉTIER : mission + livrable + statut + seconde serveur. Un double-clic ou
 * un rejeu réseau produisent le même fait ; une reprise du même livrable à un
 * autre moment en produit un neuf, et la précédente n'est jamais écrasée.
 */
export function missionSubmissionKey(s) {
  return `${s.missionId}|${s.deliverableId}|${s.statut}|${String(s.at).slice(0, 19)}`;
}

/** Normalise et déduplique une liste persistée. Triée par date, pas par insertion. */
export function normalizeMissionSubmissions(list) {
  const out = [];
  for (const s of Array.isArray(list) ? list : []) {
    const n = normalizeMissionSubmission(s, { now: null, legacy: true });
    if (n) out.push(n);
  }
  return dedupSorted(out, missionSubmissionKey, { max: MAX_MISSION_SUBMISSIONS });
}

/** L'historique d'une mission, reconstructible. Rien n'est jamais écrasé. */
export function historiqueDeLaMission(subs, missionId) {
  return normalizeMissionSubmissions(subs).filter((s) => s.missionId === missionId);
}

/**
 * ── CE QU'ON A LE DROIT DE DIRE D'UNE MISSION ────────────────────────────
 *
 * Trois choses séparées, nommées séparément — c'est tout l'objet du CP5.
 * Aucune phrase ne dit « réussi » : une mission documente un travail.
 */
export function lectureDeLaMission(subs, missionDef) {
  const h = historiqueDeLaMission(subs, missionDef?.id ?? '');
  const parNiveau = { DECLARED: 0, OBSERVED: 0, VALIDATED: 0 };
  for (const s of h) parNiveau[s.niveau] += 1;
  const plafond = niveauDeLaMission(missionDef);

  // ── DÉFAUT TROUVÉ PAR LA SONDE HTTP DU CP5 ──
  //
  // Une première version comptait les SOUMISSIONS et les appelait des
  // « livrables rendus ». Sur le produit réel, un apprenant qui clique deux fois
  // sur « valider la revue » produit deux faits — c'est correct, ce sont deux
  // actes — et la phrase annonçait alors « 4 livrables rendus » pour une mission
  // qui en a trois. Compter des faits n'est pas compter des livrables.
  const livrables = new Set(h.map((s) => s.deliverableId));
  const declares = new Set(h.filter((s) => s.niveau === 'DECLARED').map((s) => s.deliverableId));
  const n = livrables.size;
  const d = declares.size;
  return {
    missionId: missionDef?.id ?? '',
    /** Livrables DISTINCTS touchés — ce dont parle la phrase. */
    livrables: n,
    /** Faits enregistrés, reprises comprises. Toujours ≥ `livrables`. */
    soumissions: h.length,
    parNiveau,
    /** Ce que la mission PEUT atteindre, indépendamment de la performance. */
    plafond,
    maillonFaible: maillonFaibleDeLaMission(missionDef),
    lecture: h.length === 0
      ? 'Aucun livrable rendu sur cette mission.'
      : `${n} livrable${n > 1 ? 's' : ''} rendu${n > 1 ? 's' : ''}`
        + (h.length > n ? ` en ${h.length} soumissions` : '')
        + (d > 0 ? `, dont ${d} validé${d > 1 ? 's' : ''} par l’apprenant lui-même` : '')
        + ` — travail documenté au niveau ${plafond}, pas évalué.`,
  };
}
