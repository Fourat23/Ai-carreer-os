// V77 · CP10 — LE DOUBLE COMPTAGE INTER-SURFACES : LE NOMBRE CANONIQUE.
//
// ── POURQUOI ON NE RÉUTILISE PAS LE « 14 » DU CP0 ───────────────────────
//
// Le brief l'interdit explicitement, et il a raison deux fois :
//
//   1. le chiffre du CP0 a été obtenu **avant** les CP5 et CP9, qui ont changé
//      ce qu'une preuve de mission vaut. Le recopier mesurerait un produit qui
//      n'existe plus ;
//   2. un chiffre recopié n'est pas une mesure — c'est une citation.
//
// ── CE QU'ON MESURE, EXACTEMENT ─────────────────────────────────────────
//
// Le défaut `D1`, tel que la sonde `A13` du CP0 l'a établi : *un exercice
// résolu valide un livrable de mission, et les DEUX preuves portent la même
// compétence canonique.* Une production, deux crédits.
//
// La structure qui le produit est mesurable dans le corpus : un livrable de
// mission de mode `auto` porte un `exerciseRef`. Résoudre cet exercice
// **valide automatiquement** le livrable (`reconcileAutoDeliverables`), et donc
// contribue à terminer la mission.
//
// On distingue donc trois nombres, et confondre les deux premiers est
// précisément l'erreur que ce checkpoint évite :
//
//   · les PAIRES structurelles     — combien de fois la structure existe ;
//   · les paires QUI SE CHEVAUCHENT sur une compétence canonique ;
//   · les paires qui produisent DEUX CRÉDITS aujourd'hui.
//
// Usage :  node scripts/v77/cp10-double-comptage.mjs [--json]
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { programSkills } from '../../lib/skill-taxonomy.mjs';
import { makeEvidence, isQualifying } from '../../lib/evidence.mjs';
import { recordMissionCompletion, startMission, submitDeliverable } from '../../lib/mission-state.mjs';
import { projectCompetency } from '../../lib/competency.mjs';

const ROOT = process.cwd();
const NOW = '2026-09-15T12:00:00.000Z';
const lireTous = (dir) => readdirSync(join(ROOT, 'data', dir)).filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(ROOT, 'data', dir, f), 'utf8')));

const missions = lireTous('missions');
const exercices = new Map(lireTous('exercises').map((e) => [e.id, e]));

// ── 1 · LES PAIRES STRUCTURELLES ────────────────────────────────────────
const paires = [];
for (const m of missions) {
  for (const d of m.deliverables ?? []) {
    if (d.validation !== 'auto' || !d.exerciseRef) continue;
    const ex = exercices.get(d.exerciseRef);
    const compMission = new Set(programSkills(m.skills ?? []));
    const compExercice = new Set(programSkills(ex?.skills ?? []));
    const commun = [...compMission].filter((c) => compExercice.has(c));
    paires.push({
      missionId: m.id,
      deliverableId: d.id,
      exerciseId: d.exerciseRef,
      exerciceExiste: Boolean(ex),
      competencesMission: [...compMission].sort(),
      competencesExercice: [...compExercice].sort(),
      competencesCommunes: commun.sort(),
      chevauche: commun.length > 0,
    });
  }
}

// ── 2 · COMBIEN PRODUISENT DEUX CRÉDITS **AUJOURD'HUI** ─────────────────
//
// On ne raisonne pas : on construit les deux preuves comme le produit les
// construit, et on compte celles qui QUALIFIENT toutes les deux sur une même
// compétence.
function preuveExercice(ex) {
  return makeEvidence({
    sourceType: 'exercise', sourceId: ex.id, competencyIds: ex.skills ?? [],
    validation: { status: 'passed', kind: 'exercise-tests', checkedAt: NOW, detail: '5/5', score: { passed: 5, total: 5 } },
    title: ex.title ?? ex.id,
    provenance: { producer: 'lab-runner', method: 'exercise-tests' },
  }, { now: NOW });
}

function preuveMission(m) {
  let f = startMission({ startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {}, missions: {} }, m.id);
  for (const d of m.deliverables ?? []) {
    if (d.validation === 'structural') f = submitDeliverable(f, m, d.id, { status: 'structure-valid', content: 'x' }, NOW);
    else f = submitDeliverable(f, m, d.id, { status: 'validated' }, NOW);
  }
  return (recordMissionCompletion(f, m, NOW).evidence ?? []).find((e) => e.sourceType === 'mission') ?? null;
}

const credits = [];
for (const p of paires) {
  const ex = exercices.get(p.exerciseId);
  if (!ex) continue;
  const m = missions.find((x) => x.id === p.missionId);
  const pe = preuveExercice(ex);
  const pm = preuveMission(m);
  const exQualifie = pe.ok && isQualifying(pe.evidence);
  const misQualifie = Boolean(pm) && isQualifying(pm);
  const doubles = p.competencesCommunes.filter((c) => {
    const ok1 = exQualifie && (pe.evidence.competencyIds ?? []).includes(c);
    const ok2 = misQualifie && (pm.competencyIds ?? []).includes(c);
    return ok1 && ok2;
  });
  credits.push({
    ...p,
    preuveExerciceQualifie: exQualifie,
    preuveMissionQualifie: misQualifie,
    competencesDoublementCreditees: doubles,
    doubleComptage: doubles.length > 0,
  });
}

// ── 3 · LE CAS `A13` DU CP0, REJOUÉ TEL QUEL ────────────────────────────
//
// La sonde du CP0 mesurait `exercise:react-search` + `mission:frontend-
// accessible-search`, deux preuves qualifiantes sur `jsts`. On le rejoue.
const a13 = (() => {
  const m = missions.find((x) => x.id === 'frontend-accessible-search');
  const ex = exercices.get('react-search');
  if (!m || !ex) return { rejouable: false };
  const pe = preuveExercice(ex);
  const pm = preuveMission(m);
  const comps = [...new Set([...(pe.ok ? pe.evidence.competencyIds : []), ...(pm?.competencyIds ?? [])])];
  const etats = {};
  for (const c of comps) {
    const liste = [];
    if (pe.ok && pe.evidence.competencyIds.includes(c)) liste.push(pe.evidence);
    if (pm && pm.competencyIds.includes(c)) liste.push(pm);
    etats[c] = { preuves: liste.length, qualifiantes: liste.filter(isQualifying).length, etat: projectCompetency(c, liste).state };
  }
  return {
    rejouable: true,
    preuveExercice: pe.ok ? { id: pe.evidence.id, niveau: pe.evidence.evidenceLevel, qualifie: isQualifying(pe.evidence) } : null,
    preuveMission: pm ? { id: pm.id, niveau: pm.evidenceLevel, qualifie: isQualifying(pm) } : null,
    parCompetence: etats,
  };
})();

const rapport = {
  generatedAt: NOW,
  pairesStructurelles: paires.length,
  pairesQuiChevauchent: paires.filter((p) => p.chevauche).length,
  doubleComptageAujourdhui: credits.filter((c) => c.doubleComptage).length,
  a13,
  detail: credits,
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(rapport, null, 1));
} else {
  console.log('\n── V77 · CP10 — DOUBLE COMPTAGE INTER-SURFACES\n');
  console.log(`  paires structurelles (livrable auto ↔ exercice) : ${rapport.pairesStructurelles}`);
  console.log(`  paires qui CHEVAUCHENT une compétence canonique : ${rapport.pairesQuiChevauchent}`);
  console.log(`  **double comptage EFFECTIF aujourd'hui**         : ${rapport.doubleComptageAujourdhui}`);
  console.log('\n  LE CAS A13 DU CP0, REJOUÉ :');
  if (!a13.rejouable) console.log('    non rejouable (corpus changé)');
  else {
    console.log(`    preuve exercice : ${a13.preuveExercice?.niveau} · qualifie=${a13.preuveExercice?.qualifie}`);
    console.log(`    preuve mission  : ${a13.preuveMission?.niveau} · qualifie=${a13.preuveMission?.qualifie}`);
    for (const [c, v] of Object.entries(a13.parCompetence)) {
      console.log(`    ${c.padEnd(12)} preuves=${v.preuves} qualifiantes=${v.qualifiantes} → ${v.etat}`);
    }
  }
  console.log('');
}
