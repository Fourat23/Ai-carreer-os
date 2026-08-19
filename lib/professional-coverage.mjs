// Professional Coverage — READ-MODEL DÉRIVÉ (V49). PUR : aucune I/O.
// Agrège des sources EXISTANTES (program, exercices, capstones, missions,
// transfer, misconceptions) en une matrice 8-dimensions par compétence de
// programme, puis en dérive un statut. Ne détient AUCUNE vérité propre : c'est
// une PROJECTION recomputable, pas une seconde source. Réutilise projectSkill.
import { projectSkill } from './practice-coverage.mjs';

// Runtimes exécutant du code réel (localement ou via outillage opt-in).
const CODE_RUNTIMES = new Set(['node-js', 'python3', 'python-ds', 'typescript', 'web', 'react-tsx']);

const pj = (arr) => [...new Set((Array.isArray(arr) ? arr : []).map(projectSkill).filter(Boolean))];

/** Une ligne de matrice pour une compétence. PUR. */
export function skillCoverageRow(skillId, sources) {
  const { lessons = [], exercises = [], capstones = [], missions = [], transfer = [], misconceptions = [], externalTasks = [] } = sources;
  const mine = exercises.filter((e) => pj(e.skills).includes(skillId));
  const d = (n) => mine.filter((e) => e.difficulty === n).length;
  const localExec = mine.filter((e) => (CODE_RUNTIMES.has(e.runtime) && !e.practiceMode) || ['LOCAL_EXECUTABLE', 'TOOLING_ENVIRONMENT_REQUIRED'].includes(e.practiceMode)).length;
  const lessonCount = lessons.filter((l) => pj(l.skills).includes(skillId)).length;
  const diag = misconceptions.some((m) => projectSkill(m.skill) === skillId);
  const trCount = transfer.filter((c) => pj(c.skills).includes(skillId)).length;
  const scenCount = capstones.filter((c) => pj(c.skills).includes(skillId)).length;
  const misCount = missions.filter((m) => pj(m.skills).includes(skillId)).length;
  const ext = externalTasks.some((t) => pj(t.skills).includes(skillId));

  const dims = {
    foundation: lessonCount > 0,
    practice: localExec > 0,
    autonomy: (d(3) + d(4) + d(5)) >= 2,
    diagnostic: diag,
    variation: mine.length >= 4 || trCount >= 1,
    transfer: trCount > 0,
    professional: scenCount > 0,
    evidence: scenCount > 0 || misCount > 0 || localExec > 0,
  };
  const runtime = localExec > 0 ? 'REAL' : (ext ? 'EXTERNAL_ENVIRONMENT_REQUIRED' : 'NON_CODE');

  // Statut conservateur.
  let status;
  const allEight = Object.values(dims).every(Boolean);
  if (runtime === 'EXTERNAL_ENVIRONMENT_REQUIRED' && localExec === 0) status = 'EXTERNAL_REQUIRED';
  else if (runtime === 'NON_CODE' && localExec === 0) status = dims.professional || dims.evidence ? 'NON_CODE' : 'BLOCKED';
  else if (allEight) status = 'PROFESSIONAL_READY';
  else if (dims.practice && dims.autonomy && dims.diagnostic && (dims.professional || dims.transfer)) status = 'OPERATIONAL';
  else if (dims.foundation && dims.practice) status = 'FOUNDATIONAL';
  else status = 'BLOCKED';
  const usesTooling = mine.some((e) => e.practiceMode === 'TOOLING_ENVIRONMENT_REQUIRED');
  if (status !== 'EXTERNAL_REQUIRED' && status !== 'NON_CODE' && usesTooling && localExec > 0 && mine.every((e) => e.practiceMode === 'TOOLING_ENVIRONMENT_REQUIRED')) {
    // pratique uniquement via outillage opt-in
    status = status === 'PROFESSIONAL_READY' ? 'PROFESSIONAL_READY' : 'TOOLING_REQUIRED';
  }

  return {
    skill: skillId,
    lessons: lessonCount,
    exercises: mine.length,
    d1: d(1), d2: d(2), d3: d(3), d4: d(4), d5: d(5),
    localExec, transferCount: trCount, scenarioCount: scenCount, missionCount: misCount, externalTask: ext,
    dims, runtime, status,
  };
}

/** Matrice complète pour toutes les compétences de programme. PUR. */
export function computeCoverageMatrix(programSkills, sources) {
  return programSkills.map((s) => skillCoverageRow(typeof s === 'string' ? s : s.id, sources));
}

/** Compte des boucles professionnelles complètes (les 8 dimensions). PUR. */
export function completeLoopCount(matrix) {
  return matrix.filter((r) => Object.values(r.dims).every(Boolean)).length;
}
