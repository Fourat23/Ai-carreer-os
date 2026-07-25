// Enregistrement PUR d'une réussite d'exercice dans la progression V7 (source de
// vérité UNIQUE : réutilise le mécanisme de preuves + la carte de compétences,
// aucune structure parallèle). Idempotent : une même réussite ne crée pas de
// preuve en double (dédoublonnage par URL /lab/<id>).
import { addEvidence } from './learning.mjs';

const PRACTICED = 3; // plancher de compétence attribué par un exercice réussi

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

  const skillsMap = { ...(flat.skills ?? {}) };
  for (const s of (Array.isArray(skills) ? skills : [])) {
    if (typeof s !== 'string' || !s) continue;
    const cur = Number.isFinite(skillsMap[s]) ? skillsMap[s] : 0;
    if (cur < PRACTICED) { skillsMap[s] = PRACTICED; changed = true; }
  }

  return changed ? { ...flat, days, skills: skillsMap } : flat;
}
