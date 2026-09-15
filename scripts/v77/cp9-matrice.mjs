// V77 · CP9 — PUBLIER LA MATRICE, ET MESURER CE QU'ELLE CHANGE.
//
// Une règle qu'on ne peut lire qu'en recoupant trois fichiers n'est pas une
// règle : c'est une coutume. Ce script publie la table entière et, surtout,
// **mesure la conséquence** de la décision du CP9 — `isQualifying` exige
// désormais le niveau `VALIDATED`.
//
// Usage :  node scripts/v77/cp9-matrice.mjs [--json]
import {
  matriceDesPreuves, resumeParNiveau, combinaisonsQualifiantes,
  incoherencesDeLaMatrice, qualifiePourLesMoteurs,
} from '../../lib/evidence-matrix.mjs';
import {
  EVIDENCE_SOURCE_TYPES, VALIDATION_KINDS, QUALIFYING_SOURCE_TYPES,
  normalizeLedger, isQualifying, migrateLegacyEvidence,
} from '../../lib/evidence.mjs';
import { projectCompetency } from '../../lib/competency.mjs';

const lignes = matriceDesPreuves();

// ── CE QUI CESSE DE QUALIFIER ───────────────────────────────────────────
//
// La règle d'AVANT : un type qualifiant + `passed`. Celle d'APRÈS y ajoute le
// niveau. On énumère la différence au lieu de l'estimer.
const perdues = [];
for (const sourceType of EVIDENCE_SOURCE_TYPES) {
  if (!QUALIFYING_SOURCE_TYPES.has(sourceType)) continue;
  for (const kind of VALIDATION_KINDS) {
    const v = { status: 'passed', kind };
    if (!qualifiePourLesMoteurs(sourceType, v)) perdues.push({ sourceType, kind });
  }
}

// ── LA CONSÉQUENCE SUR UNE PROGRESSION RÉELLE ───────────────────────────
//
// La fixture d'exemple du dépôt ne porte AUCUNE preuve (mesuré). On construit
// donc le cas qui existe vraiment chez un apprenant ancien : des preuves
// héritées, reclassées par `migrateLegacyEvidence` — c'est-à-dire le seul
// producteur, encore aujourd'hui, de `mission-deliverables` et
// `capstone-review` portant `passed`.
const joursHerites = {
  12: {
    evidence: [
      { id: 'lab-py-fizzbuzz', type: 'exercise', title: 'Exercice résolu', description: '', url: '/lab/py-fizzbuzz', skills: ['python'], createdAt: '2026-01-12T10:00:00.000Z' },
      { id: 'mission-cicd-blocked-delivery', type: 'mission', title: 'Mission terminée', description: '', url: '/missions/cicd-blocked-delivery', skills: ['cloud'], createdAt: '2026-01-12T11:00:00.000Z' },
    ],
  },
  20: {
    evidence: [
      { id: 'agent-tool-loop-incident', type: 'capstone', title: 'Capstone', description: '', url: '', skills: ['agents'], createdAt: '2026-01-20T10:00:00.000Z' },
      { id: 'diag-js-language-foundations', type: 'assessment', title: 'Diagnostic', description: '', url: '', skills: ['jsts'], createdAt: '2026-01-20T11:00:00.000Z' },
    ],
  },
};
const heritees = normalizeLedger(migrateLegacyEvidence(joursHerites));
const avantRegle = (e) => QUALIFYING_SOURCE_TYPES.has(e.sourceType) && e.validation?.status === 'passed';

const detailHeritees = heritees.map((e) => ({
  id: e.id,
  sourceType: e.sourceType,
  kind: e.validation?.kind ?? null,
  status: e.validation?.status ?? null,
  evidenceLevel: e.evidenceLevel,
  qualifiaitAvant: avantRegle(e),
  qualifieApres: isQualifying(e),
  competence: e.competencyIds[0] ?? null,
  etatAvant: avantRegle(e) ? projectCompetency(e.competencyIds[0], [{ ...e }]).state : null,
}));

const rapport = {
  generatedAt: '2026-09-15T12:00:00.000Z',
  matrice: { lignes: lignes.length, parNiveau: resumeParNiveau(lignes) },
  combinaisonsQualifiantes: combinaisonsQualifiantes(lignes),
  combinaisonsPerdues: perdues.map((p) => `${p.sourceType} + ${p.kind}`),
  incoherences: incoherencesDeLaMatrice(lignes),
  preuvesHeritees: {
    total: heritees.length,
    qualifiantesAvant: detailHeritees.filter((d) => d.qualifiaitAvant).length,
    qualifiantesApres: detailHeritees.filter((d) => d.qualifieApres).length,
    detail: detailHeritees,
  },
  table: lignes,
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(rapport, null, 1));
} else {
  console.log('\n── V77 · CP9 — MATRICE D’UNIFICATION DES PREUVES\n');
  console.log(`  combinaisons énumérées : ${rapport.matrice.lignes}`);
  console.log(`  par niveau             : ${Object.entries(rapport.matrice.parNiveau).map(([k, v]) => `${v} × ${k}`).join(' · ')}`);
  console.log(`  incohérences           : ${rapport.incoherences.length === 0 ? 'aucune' : rapport.incoherences.join(' ; ')}`);
  console.log(`\n  COMBINAISONS QUI QUALIFIENT (${rapport.combinaisonsQualifiantes.length}) :`);
  for (const c of rapport.combinaisonsQualifiantes) console.log(`    ${c}`);
  console.log(`\n  COMBINAISONS QUI CESSENT DE QUALIFIER (${rapport.combinaisonsPerdues.length}) :`);
  for (const c of rapport.combinaisonsPerdues) console.log(`    ${c}`);
  console.log('\n  SUR UNE PROGRESSION HÉRITÉE (le seul cas réel encore producteur) :');
  console.log(`    preuves : ${rapport.preuvesHeritees.total}`);
  console.log(`    qualifiantes AVANT : ${rapport.preuvesHeritees.qualifiantesAvant} · APRÈS : ${rapport.preuvesHeritees.qualifiantesApres}`);
  for (const d of rapport.preuvesHeritees.detail) {
    console.log(`      ${d.sourceType.padEnd(12)} ${String(d.kind).padEnd(20)} ${d.evidenceLevel.padEnd(10)} ${d.qualifiaitAvant ? 'qualifiait' : '—'} → ${d.qualifieApres ? 'qualifie' : 'NE QUALIFIE PLUS'}`);
  }
  console.log('');
}
