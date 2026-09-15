// V77 · CP5 — BEFORE / AFTER sur les 42 missions.
//
// Le brief l'exige, et pour une bonne raison : le CP5 change ce qu'une mission
// terminée SIGNIFIE. Affirmer « une mission ne vaut plus VALIDATED » sans
// montrer, mission par mission, ce qui bascule, serait une promesse.
//
// Le script ne simule rien. Il lit les 42 fixtures réelles, construit pour
// chacune l'état « tous les livrables requis faits » — c'est-à-dire le meilleur
// cas possible, celui où le produit avait le plus de raisons de dire `passed` —
// puis appelle le code de production.
//
// Usage :  node scripts/v77/cp5-missions-before-after.mjs [--json]
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { recordMissionCompletion, submitDeliverable, startMission, readMissionState, computeMissionStatus } from '../../lib/mission-state.mjs';
import { isQualifying, niveauDePreuve, makeEvidence } from '../../lib/evidence.mjs';
import { projectCompetency } from '../../lib/competency.mjs';
import { niveauDeLaMission, maillonFaibleDeLaMission } from '../../lib/mission-submission.mjs';

const ROOT = process.cwd();
const DIR = join(ROOT, 'data', 'missions');
const NOW = '2026-09-15T12:00:00.000Z';

const missions = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort()
  .map((f) => JSON.parse(readFileSync(join(DIR, f), 'utf8')));

/** Le MEILLEUR cas : chaque livrable requis porté à son état terminal. */
function etatComplet(mission) {
  let flat = startMission({ startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} }, mission.id);
  for (const d of mission.deliverables ?? []) {
    if (d.validation === 'structural') {
      flat = submitDeliverable(flat, mission, d.id, { status: 'structure-valid', content: 'document conforme' });
    } else if (d.validation === 'review') {
      flat = submitDeliverable(flat, mission, d.id, { status: 'self-assessed', selfAssessment: { ok: true } });
      flat = submitDeliverable(flat, mission, d.id, { status: 'validated' });
    } else {
      // Mode `auto` : c'est `reconcileAutoDeliverables` qui le porte à
      // `validated` dans le produit. On reproduit l'état terminal, pas le
      // chemin, parce que la question porte sur ce que la mission SIGNIFIE une
      // fois finie.
      flat = submitDeliverable(flat, mission, d.id, { status: 'validated' });
    }
  }
  return flat;
}

const lignes = [];
for (const m of missions) {
  const flat = etatComplet(m);
  const etat = readMissionState(flat, m.id);
  const statut = computeMissionStatus(m, etat);
  const apres = recordMissionCompletion(flat, m, NOW);
  const preuve = (apres.evidence ?? []).find((e) => e.sourceType === 'mission' && e.sourceId === m.id) ?? null;

  lignes.push({
    id: m.id,
    statut,
    livrables: (m.deliverables ?? []).map((d) => d.validation),
    // AVANT : la preuve telle que le produit l'écrivait, RECONSTRUITE et
    // repassée dans le même constructeur — pas une affirmation recopiée. Si la
    // règle changeait ailleurs, cette ligne bougerait avec elle.
    avant: (() => {
      const v = makeEvidence({
        sourceType: 'mission', sourceId: m.id, competencyIds: m.skills ?? [],
        validation: { status: 'passed', kind: 'mission-deliverables', checkedAt: NOW, detail: 'Livrables requis complétés.' },
        title: `Mission terminée : ${m.title}`,
        provenance: { producer: 'mission-engine', method: 'mission-deliverables' },
      }, { now: NOW });
      return v.ok
        ? { status: v.evidence.validation?.status ?? null, kind: v.evidence.validation?.kind ?? null, qualifiante: isQualifying(v.evidence), niveau: v.evidence.evidenceLevel }
        : { status: null, kind: null, qualifiante: false, niveau: null, refus: v.code };
    })(),
    apres: preuve
      ? {
        status: preuve.validation?.status ?? null,
        kind: preuve.validation?.kind ?? null,
        qualifiante: isQualifying(preuve),
        niveau: preuve.evidenceLevel ?? niveauDePreuve(preuve.sourceType, preuve.validation),
      }
      : { status: null, kind: null, qualifiante: false, niveau: null },
    maillonFaible: maillonFaibleDeLaMission(m),
    niveauDeLaMission: niveauDeLaMission(m),
  });
}

// ── LA CONSÉQUENCE, ET NON L'INTENTION ──────────────────────────────────
//
// Dire « la preuve n'est plus qualifiante » ne suffit pas : il faut montrer ce
// que cela CHANGE pour l'apprenant. On projette donc la compétence à partir des
// preuves de mission SEULES, avant et après — le cas le plus défavorable, celui
// d'un apprenant dont les missions seraient la seule pratique.
const parCompetence = new Map();
for (const m of missions) {
  for (const c of m.skills ?? []) {
    if (!parCompetence.has(c)) parCompetence.set(c, { avant: [], apres: [] });
  }
}
for (const l of lignes) {
  const m = missions.find((x) => x.id === l.id);
  const flat = etatComplet(m);
  const preuveApres = (recordMissionCompletion(flat, m, NOW).evidence ?? []).find((e) => e.sourceType === 'mission' && e.sourceId === m.id);
  const vAvant = makeEvidence({
    sourceType: 'mission', sourceId: m.id, competencyIds: m.skills ?? [],
    validation: { status: 'passed', kind: 'mission-deliverables', checkedAt: NOW, detail: '' },
    title: m.title, provenance: { producer: 'mission-engine', method: 'mission-deliverables' },
  }, { now: NOW });
  for (const c of m.skills ?? []) {
    if (vAvant.ok) parCompetence.get(c).avant.push(vAvant.evidence);
    if (preuveApres) parCompetence.get(c).apres.push(preuveApres);
  }
}
const etats = { avant: {}, apres: {} };
for (const [c, { avant, apres }] of parCompetence) {
  const a = projectCompetency(c, avant).state;
  const b = projectCompetency(c, apres).state;
  etats.avant[a] = (etats.avant[a] ?? 0) + 1;
  etats.apres[b] = (etats.apres[b] ?? 0) + 1;
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ generatedAt: NOW, competences: etats, missions: lignes }, null, 2));
} else {
  const q = lignes.filter((l) => l.apres.qualifiante).length;
  const qAvant = lignes.filter((l) => l.avant.qualifiante).length;
  const done = lignes.filter((l) => l.statut === 'done').length;
  console.log(`\n── V77 · CP5 — BEFORE / AFTER sur ${lignes.length} missions\n`);
  console.log(`  missions atteignant l'état « done »        : ${done} / ${lignes.length}`);
  console.log(`  AVANT — preuves qualifiantes (status passed) : ${qAvant} / ${lignes.length}`);
  console.log(`  APRÈS — preuves qualifiantes                 : ${q} / ${lignes.length}`);
  console.log(`  APRÈS — niveau de preuve                     : ${[...new Set(lignes.map((l) => l.apres.niveau))].join(', ')}`);
  console.log(`  maillon faible observé                       : ${[...new Set(lignes.map((l) => l.maillonFaible))].join(', ')}`);
  const familles = {};
  for (const l of lignes) {
    const k = [...new Set(l.livrables)].sort().join('+');
    familles[k] = (familles[k] ?? 0) + 1;
  }
  console.log('\n  compétences projetées depuis les MISSIONS SEULES :');
  console.log(`    AVANT : ${Object.entries(etats.avant).map(([k, v]) => `${v} × ${k}`).join(' · ')}`);
  console.log(`    APRÈS : ${Object.entries(etats.apres).map(([k, v]) => `${v} × ${k}`).join(' · ')}`);

  console.log('\n  formes de livrables rencontrées :');
  for (const [k, n] of Object.entries(familles).sort((a, b) => b[1] - a[1])) console.log(`    ${String(n).padStart(3)} × ${k}`);
  console.log('\n  détail (5 premières) :');
  for (const l of lignes.slice(0, 5)) {
    console.log(`    ${l.id.padEnd(34)} ${l.statut.padEnd(6)} avant=passed/qualifiante → après=${l.apres.status}/${l.apres.qualifiante ? 'qualifiante' : 'non qualifiante'} · ${l.apres.niveau}`);
  }
  console.log('');
}
