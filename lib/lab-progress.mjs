// Enregistrement PUR d'une réussite d'exercice dans la progression V7 (source de
// vérité UNIQUE : réutilise le mécanisme de preuves + la carte de compétences,
// aucune structure parallèle). Idempotent : une même réussite ne crée pas de
// preuve en double (dédoublonnage par URL /lab/<id>).
import { addEvidence } from './learning.mjs';
import { makeEvidence, appendEvidence } from './evidence.mjs';

export function labEvidenceUrl(exerciseId) {
  return `/lab/${exerciseId}`;
}

/** Vrai si la journée porte déjà la preuve de réussite de cet exercice. */
export function hasLabEvidence(dayProgress, exerciseId) {
  const url = labEvidenceUrl(exerciseId);
  return (dayProgress?.evidence ?? []).some((e) => e && e.url === url);
}

/**
 * Applique une réussite d'exercice (tous les tests passent) à la progression
 * plate : ajoute une preuve de type « exercise » à chaque journée liée (si
 * absente) et relève les compétences associées. Renvoie une NOUVELLE progression.
 * @param {object} flat  progression plate (V6/V7)
 * @param {{exerciseId:string,title:string,skills?:string[],dayRefs?:number[],at?:string|null}} p
 */
export function recordExerciseSuccess(flat, { exerciseId, title, skills = [], dayRefs = [], at = null }) {
  if (!flat || typeof flat !== 'object') return flat;
  if (!exerciseId || !Array.isArray(dayRefs) || dayRefs.length === 0) return flat;
  const now = typeof at === 'string' ? at : new Date().toISOString();
  const url = labEvidenceUrl(exerciseId);

  const days = { ...(flat.days ?? {}) };
  let changed = false;
  for (const d of dayRefs) {
    const key = String(d);
    const dp = days[key] ?? {};
    if (hasLabEvidence(dp, exerciseId)) continue;
    days[key] = addEvidence(dp, {
      id: `lab-${exerciseId}`,
      type: 'exercise',
      title: `Exercice réussi : ${title}`,
      description: 'Tous les tests du laboratoire de code passent.',
      url,
      skills: Array.isArray(skills) ? skills : [],
      createdAt: now,
    });
    changed = true;
  }

  // V65 · PLUS AUCUNE ÉCRITURE DIRECTE D'UN NIVEAU DE COMPÉTENCE.
  // Ce module posait `skills[s] = 3` — une mutation directe de l'état de
  // compétence, interdite par le principe P2. La compétence se PROJETTE
  // désormais depuis les preuves ; c'est la preuve canonique ci-dessous qui la
  // porte, et rien d'autre.
  const ev = makeEvidence({
    sourceType: 'exercise',
    sourceId: exerciseId,
    competencyIds: skills,
    validation: { status: 'passed', kind: 'exercise-tests', checkedAt: now, detail: 'Tous les tests passent.' },
    title: `Exercice réussi : ${title}`,
    provenance: { producer: 'lab-runner', method: 'exercise-tests', note: 'Exécution en bac à sable, tous les tests verts.' },
    dayId: Number.isInteger(dayRefs[0]) ? dayRefs[0] : undefined,
    artifactRef: url,
  }, { now });

  let ledger = flat.evidence ?? [];
  if (ev.ok) {
    const r = appendEvidence(ledger, ev.evidence);
    if (r.added) { ledger = r.evidence; changed = true; }
  }

  return changed ? { ...flat, days, evidence: ledger } : flat;
}
