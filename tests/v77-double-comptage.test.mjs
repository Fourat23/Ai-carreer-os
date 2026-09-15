// V77 · CP10 — LE DOUBLE COMPTAGE INTER-SURFACES : LE NOMBRE CANONIQUE.
//
// ── POURQUOI LE « 14 » DU CP0 N'A PAS ÉTÉ RECOPIÉ ──────────────────────
//
// Le brief l'interdit, et il a raison deux fois : ce chiffre datait d'avant les
// CP5 et CP9, qui ont changé ce qu'une preuve de mission VAUT ; et un chiffre
// recopié n'est pas une mesure, c'est une citation.
//
// ── CE QUE LA REMESURE A DONNÉ ─────────────────────────────────────────
//
//   42 paires structurelles (livrable `auto` ↔ exercice)
//   14 paires qui CHEVAUCHENT une compétence canonique
//    0 double comptage EFFECTIF aujourd'hui
//
// Le « 14 » du CP0 se retrouve — et on sait enfin ce qu'il désignait : un
// chevauchement STRUCTUREL, pas un double crédit. Les deux se ressemblaient
// tant qu'une preuve de mission qualifiait.
//
// **Le défaut `D1` est clos par conséquence, pas par une règle dédiée.** Le CP5
// a retiré `passed` des missions, le CP9 a exigé `VALIDATED` pour qualifier ; il
// ne restait rien à dédupliquer. Ajouter une règle de déduplication là où il n'y
// a rien à dédupliquer serait de la doctrine, pas de la précision.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { makeEvidence, isQualifying, normalizeLedger, evidenceKey, appendEvidence } from '../lib/evidence.mjs';
import { startMission, submitDeliverable, recordMissionCompletion } from '../lib/mission-state.mjs';
import { projectCompetency } from '../lib/competency.mjs';
import { programSkills } from '../lib/skill-taxonomy.mjs';

const ROOT = process.cwd();
const NOW = '2026-09-15T12:00:00.000Z';
const base = { startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {}, missions: {} };
const MISSIONS = readdirSync(join(ROOT, 'data', 'missions')).filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(ROOT, 'data', 'missions', f), 'utf8')));

function missionTerminee(m) {
  let f = startMission({ ...base }, m.id);
  for (const d of m.deliverables ?? []) {
    f = submitDeliverable(f, m, d.id, { status: d.validation === 'structural' ? 'structure-valid' : 'validated', content: 'x' }, NOW);
  }
  return recordMissionCompletion(f, m, NOW);
}
const preuveMissionDe = (m) => (missionTerminee(m).evidence ?? []).find((e) => e.sourceType === 'mission') ?? null;

// ── 1 · LE NOMBRE CANONIQUE ────────────────────────────────────────────

test('V77 · CP10 — 42 paires structurelles, et elles sont dans le corpus', () => {
  const paires = MISSIONS.flatMap((m) => (m.deliverables ?? [])
    .filter((d) => d.validation === 'auto' && d.exerciseRef)
    .map((d) => ({ mission: m.id, exercice: d.exerciseRef })));
  assert.equal(paires.length, 42, 'un livrable auto adossé à un exercice, par mission');
});

test('V77 · CP10 — 14 paires chevauchent une compétence canonique', () => {
  // Le « 14 » du CP0 se retrouve — et on sait enfin ce qu'il désignait : un
  // chevauchement STRUCTUREL, pas un double crédit.
  const exercices = new Map(readdirSync(join(ROOT, 'data', 'exercises')).filter((f) => f.endsWith('.json'))
    .map((f) => { const e = JSON.parse(readFileSync(join(ROOT, 'data', 'exercises', f), 'utf8')); return [e.id, e]; }));
  let n = 0;
  for (const m of MISSIONS) {
    for (const d of m.deliverables ?? []) {
      if (d.validation !== 'auto' || !d.exerciseRef) continue;
      const cm = new Set(programSkills(m.skills ?? []));
      const ce = new Set(programSkills(exercices.get(d.exerciseRef)?.skills ?? []));
      if ([...cm].some((c) => ce.has(c))) n += 1;
    }
  }
  assert.equal(n, 14);
});

test('V77 · CP10 — ZÉRO double comptage effectif, sur les 42 paires', () => {
  // La mesure qui compte. On construit les DEUX preuves comme le produit les
  // construit, et on cherche une compétence créditée deux fois.
  const exercices = new Map(readdirSync(join(ROOT, 'data', 'exercises')).filter((f) => f.endsWith('.json'))
    .map((f) => { const e = JSON.parse(readFileSync(join(ROOT, 'data', 'exercises', f), 'utf8')); return [e.id, e]; }));
  const doubles = [];
  for (const m of MISSIONS) {
    const pm = preuveMissionDe(m);
    for (const d of m.deliverables ?? []) {
      if (d.validation !== 'auto' || !d.exerciseRef) continue;
      const ex = exercices.get(d.exerciseRef);
      if (!ex) continue;
      const pe = makeEvidence({
        sourceType: 'exercise', sourceId: ex.id, competencyIds: ex.skills ?? [],
        validation: { status: 'passed', kind: 'exercise-tests', checkedAt: NOW, detail: '5/5', score: { passed: 5, total: 5 } },
        title: ex.id, provenance: { producer: 'lab-runner', method: 'exercise-tests' },
      }, { now: NOW });
      if (!pe.ok || !pm) continue;
      if (!isQualifying(pe.evidence) || !isQualifying(pm)) continue;
      const communes = pe.evidence.competencyIds.filter((c) => pm.competencyIds.includes(c));
      if (communes.length) doubles.push(`${m.id} ↔ ${ex.id} sur ${communes.join(',')}`);
    }
  }
  assert.deepEqual(doubles, [], 'aucune compétence ne doit être créditée deux fois pour une production');
});

test('V77 · CP10 — LE CAS `A13` DU CP0, REJOUÉ : deux preuves, UNE seule qualifiante', () => {
  // La sonde du CP0 mesurait deux preuves qualifiantes sur `jsts` à partir d'une
  // seule production. Elle en mesure toujours DEUX — rien n'a été supprimé —
  // mais une seule démontre.
  const m = MISSIONS.find((x) => x.id === 'frontend-accessible-search');
  assert.ok(m, 'la mission de la sonde A13 doit exister');
  const pm = preuveMissionDe(m);
  const pe = makeEvidence({
    sourceType: 'exercise', sourceId: 'react-search', competencyIds: ['jsts'],
    validation: { status: 'passed', kind: 'exercise-tests', checkedAt: NOW, detail: '5/5', score: { passed: 5, total: 5 } },
    title: 'react-search', provenance: { producer: 'lab-runner', method: 'exercise-tests' },
  }, { now: NOW });

  const liste = [pe.evidence, pm].filter(Boolean);
  assert.equal(liste.length, 2, 'les deux preuves EXISTENT toujours');
  assert.equal(liste.filter(isQualifying).length, 1, 'une seule démontre');
  assert.equal(isQualifying(pe.evidence), true, 'l’exercice : des tests ont tourné');
  assert.equal(isQualifying(pm), false, 'la mission : structure + clic');
  assert.equal(projectCompetency('jsts', liste).state, 'demonstrated');
  assert.equal(projectCompetency('jsts', liste).qualifyingEvidenceCount, 1);
});

// ── 2 · LA FILIATION, ÉCRITE PLUTÔT QUE REDÉCOUVERTE ───────────────────

test('V77 · CP10 — la preuve de mission dit DE QUOI elle dérive', () => {
  const m = MISSIONS.find((x) => x.id === 'cicd-blocked-delivery');
  const pm = preuveMissionDe(m);
  assert.deepEqual(pm.derivedFrom, ['exercise:cicd-env-promotion']);
});

test('V77 · CP10 — les 42 missions portent une filiation, aucune n’est muette', () => {
  for (const m of MISSIONS) {
    const attendu = (m.deliverables ?? []).filter((d) => d.validation === 'auto' && d.exerciseRef)
      .map((d) => `exercise:${d.exerciseRef}`);
    const pm = preuveMissionDe(m);
    assert.ok(pm, `${m.id} : aucune preuve`);
    assert.deepEqual(pm.derivedFrom, attendu, `${m.id} : filiation`);
  }
});

test('V77 · CP10 — `derivedFrom` n’entre PAS dans la clé métier', () => {
  // Une filiation décrit une origine ; elle ne change pas l'identité de la
  // preuve. Si elle entrait dans la clé, modifier un `exerciseRef` créerait une
  // SECONDE preuve pour la même mission — un double comptage fabriqué par la
  // correction du double comptage.
  const commun = {
    sourceType: 'mission', sourceId: 'm', competencyIds: ['algo'],
    validation: { status: 'manual', kind: 'mission-deliverables', checkedAt: NOW, detail: '' },
    title: 'm', provenance: { producer: 'mission-engine', method: 'mission-deliverables' },
  };
  const a = makeEvidence({ ...commun, derivedFrom: ['exercise:x'] }, { now: NOW });
  const b = makeEvidence({ ...commun, derivedFrom: ['exercise:y'] }, { now: NOW });
  assert.equal(evidenceKey(a.evidence), evidenceKey(b.evidence));
  assert.equal(a.evidence.id, b.evidence.id);
});

test('V77 · CP10 — `derivedFrom` absente vaut liste VIDE, jamais « aucune filiation »', () => {
  const ancienne = {
    id: 'ev-mission-vieille', sourceType: 'mission', sourceId: 'vieille', competencyIds: ['algo'],
    createdAt: '2026-01-01T00:00:00.000Z',
    validation: { status: 'manual', kind: 'mission-deliverables', checkedAt: '2026-01-01T00:00:00.000Z', detail: '', score: null },
    provenance: { producer: 'mission-engine', method: 'mission-deliverables', note: '' },
  };
  const [relue] = normalizeLedger([ancienne]);
  assert.deepEqual(relue.derivedFrom, []);
});

// ── 3 · REJEU ET IDEMPOTENCE ───────────────────────────────────────────

test('V77 · CP10 — terminer DEUX fois une mission ne crée pas deux preuves', () => {
  const m = MISSIONS.find((x) => x.id === 'cicd-blocked-delivery');
  const une = missionTerminee(m);
  const deux = recordMissionCompletion(une, m, '2026-09-15T13:00:00.000Z');
  const preuves = (deux.evidence ?? []).filter((e) => e.sourceType === 'mission' && e.sourceId === m.id);
  assert.equal(preuves.length, 1);
});

test('V77 · CP10 — rejouer la preuve d’exercice ne la duplique pas', () => {
  const faire = () => makeEvidence({
    sourceType: 'exercise', sourceId: 'react-search', competencyIds: ['jsts'],
    validation: { status: 'passed', kind: 'exercise-tests', checkedAt: NOW, detail: '5/5', score: { passed: 5, total: 5 } },
    title: 'x', provenance: { producer: 'lab-runner', method: 'exercise-tests' },
  }, { now: NOW }).evidence;
  let led = [];
  led = appendEvidence(led, faire()).evidence;
  const r2 = appendEvidence(led, faire());
  assert.equal(r2.added, false);
  assert.equal(r2.evidence.length, 1);
});

test('V77 · CP10 — la projection est REJOUABLE : l’ordre n’y change rien', () => {
  const m = MISSIONS.find((x) => x.id === 'frontend-accessible-search');
  const pm = preuveMissionDe(m);
  const pe = makeEvidence({
    sourceType: 'exercise', sourceId: 'react-search', competencyIds: ['jsts'],
    validation: { status: 'passed', kind: 'exercise-tests', checkedAt: NOW, detail: '5/5', score: { passed: 5, total: 5 } },
    title: 'x', provenance: { producer: 'lab-runner', method: 'exercise-tests' },
  }, { now: NOW }).evidence;
  const a = projectCompetency('jsts', [pe, pm]);
  const b = projectCompetency('jsts', [pm, pe]);
  assert.equal(a.state, b.state);
  assert.equal(a.qualifyingEvidenceCount, b.qualifyingEvidenceCount);
});

// ── 4 · LA GARDE QUI COMPTE POUR LA SUITE ──────────────────────────────

test('V77 · CP10 — SI une preuve de mission redevenait qualifiante, 14 doubles comptages reviendraient', () => {
  // Le défaut est clos par CONSÉQUENCE, pas par une règle dédiée. Ce test dit
  // exactement ce qui le rouvrirait, pour que personne ne l'apprenne trop tard.
  const exercices = new Map(readdirSync(join(ROOT, 'data', 'exercises')).filter((f) => f.endsWith('.json'))
    .map((f) => { const e = JSON.parse(readFileSync(join(ROOT, 'data', 'exercises', f), 'utf8')); return [e.id, e]; }));
  let reviendraient = 0;
  for (const m of MISSIONS) {
    for (const d of m.deliverables ?? []) {
      if (d.validation !== 'auto' || !d.exerciseRef) continue;
      const ce = new Set(programSkills(exercices.get(d.exerciseRef)?.skills ?? []));
      if (programSkills(m.skills ?? []).some((c) => ce.has(c))) reviendraient += 1;
    }
  }
  assert.equal(reviendraient, 14);
  // Et la raison pour laquelle ils ne reviennent pas aujourd'hui, en une ligne.
  const pm = preuveMissionDe(MISSIONS[0]);
  assert.equal(isQualifying(pm), false, 'c’est CELA qui tient le défaut fermé');
});
