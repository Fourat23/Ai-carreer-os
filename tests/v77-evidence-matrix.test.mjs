// V77 · CP9 — LA MATRICE, ET LA DÉCISION QU'ELLE FORCE.
//
// ── CE QUI ÉTAIT ÉPARPILLÉ ──────────────────────────────────────────────
//
// Le CP5 a posé un plafond par SOURCE, le CP6 un plafond par MOYEN. Chacun
// avec sa justification, aucun endroit où lire la règle complète. C'est la
// situation qui produit les incohérences que V77 retire : deux phrases vraies
// séparément, dont la combinaison n'avait jamais été relue.
//
// ── LA DÉCISION ─────────────────────────────────────────────────────────
//
// Le CP6 avait mesuré une contradiction et l'avait laissée ouverte :
// `isQualifying` ignorait le niveau, si bien qu'une preuve annoncée `self`
// créditait `demonstrated`. Le contrat gelé (CP1 §2) ne laisse pas le choix —
// **seul `VALIDATED` compte** — et le CP9 l'applique.
//
// Conséquence MESURÉE, pas estimée : **18 combinaisons cessent de qualifier**,
// et sur une progression héritée, 4 preuves qualifiantes tombent à 2.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  MOTEURS, matriceDesPreuves, resumeParNiveau, combinaisonsQualifiantes,
  incoherencesDeLaMatrice, qualifiePourLesMoteurs,
} from '../lib/evidence-matrix.mjs';
import {
  isQualifying, niveauDePreuve, normalizeLedger, migrateLegacyEvidence,
  NIVEAU_MAX_PAR_SOURCE, NIVEAU_MAX_PAR_KIND, QUALIFYING_SOURCE_TYPES,
  EVIDENCE_SOURCE_TYPES, VALIDATION_KINDS,
} from '../lib/evidence.mjs';
import { maillonFaibleDeLaMission } from '../lib/mission-submission.mjs';
import { readdirSync } from 'node:fs';

const ROOT = process.cwd();
const NOW = '2026-09-15T12:00:00.000Z';

// ── 1 · LA MATRICE EST COMPLÈTE ET SANS CONTRADICTION ──────────────────

test('V77 · CP9 — toutes les combinaisons sont énumérées, aucune n’est implicite', () => {
  const l = matriceDesPreuves();
  assert.equal(l.length, EVIDENCE_SOURCE_TYPES.length * VALIDATION_KINDS.length * 4);
  // Chaque ligne porte les cinq colonnes que le brief demande.
  for (const x of l.slice(0, 5)) {
    assert.ok(x.sourceType && x.kind && x.status);
    assert.ok(['DECLARED', 'OBSERVED', 'VALIDATED'].includes(x.evidenceLevel));
    assert.deepEqual(Object.keys(x.qualifiesFor).sort(), [...MOTEURS].sort());
  }
});

test('V77 · CP9 — la matrice ne contient AUCUNE incohérence, vérifiée sur la table entière', () => {
  // 192 lignes ne se relisent pas à l'œil. On énonce les propriétés et on les
  // vérifie partout — la différence entre « on a regardé » et « on a vérifié ».
  assert.deepEqual(incoherencesDeLaMatrice(), []);
});

test('V77 · CP9 — LA DÉCISION : rien ne qualifie sans `VALIDATED`', () => {
  for (const l of matriceDesPreuves()) {
    if (l.qualifiesFor.competency) {
      assert.equal(l.evidenceLevel, 'VALIDATED', `${l.sourceType}+${l.kind}+${l.status}`);
      assert.equal(l.status, 'passed');
      assert.equal(QUALIFYING_SOURCE_TYPES.has(l.sourceType), true);
    }
  }
});

test('V77 · CP9 — les combinaisons qualifiantes sont RARES, et énumérables', () => {
  const q = combinaisonsQualifiantes();
  assert.equal(q.length, 12);
  // Aucune mission, aucun `self`, aucun genre hérité.
  for (const c of q) {
    assert.equal(c.startsWith('mission '), false, c);
    assert.equal(c.includes('+ self +'), false, c);
    assert.equal(c.includes('capstone-review'), false, c);
    assert.equal(c.includes('mission-deliverables'), false, c);
  }
});

test('V77 · CP9 — `isQualifying` et la matrice disent la MÊME chose', () => {
  // Une matrice qui décrirait une règle que le produit n'applique pas serait
  // exactement le défaut que V77 retire.
  for (const l of matriceDesPreuves()) {
    const preuve = {
      sourceType: l.sourceType, sourceId: 'x', competencyIds: ['algo'], createdAt: NOW,
      validation: { status: l.status, kind: l.kind, checkedAt: NOW, detail: '', score: null },
      provenance: { producer: 'test', method: '', note: '' },
    };
    assert.equal(isQualifying(preuve), l.qualifiesFor.competency,
      `${l.sourceType}+${l.kind}+${l.status}`);
  }
});

test('V77 · CP9 — les trois moteurs disent la même chose, et c’est écrit', () => {
  // Le contrat les traite ensemble. Inventer trois règles là où il en pose une
  // serait ajouter de la doctrine, pas de la précision. Si un jour ils
  // divergent, ce sera une décision écrite — ce test rougira d'abord.
  for (const l of matriceDesPreuves()) {
    assert.equal(new Set(Object.values(l.qualifiesFor)).size, 1);
  }
});

// ── 2 · LA TENSION DU CP5, TRANCHÉE PAR LA MESURE ──────────────────────

test('V77 · CP9 — un PLAFOND n’est pas une assignation : mission plafonne OBSERVED, vaut DECLARED', () => {
  assert.equal(NIVEAU_MAX_PAR_SOURCE.mission, 'OBSERVED', 'le plafond par source est inchangé');
  assert.equal(NIVEAU_MAX_PAR_KIND['mission-deliverables'], 'DECLARED', 'le moyen est plus sévère');
  assert.equal(niveauDePreuve('mission', { status: 'passed', kind: 'mission-deliverables' }), 'DECLARED');
});

test('V77 · CP9 — LA MESURE qui justifie ce plafond : 42 missions sur 42 portent une revue REQUISE', () => {
  // Le plafond `DECLARED` n'est pas un principe : il vient du corpus. Si une
  // mission sans revue requise apparaissait, le plafond deviendrait trop sévère
  // et il faudrait le rouvrir plutôt que le subir. Ce test rougit ce jour-là.
  const dir = join(ROOT, 'data', 'missions');
  const fichiers = readdirSync(dir).filter((f) => f.endsWith('.json'));
  assert.equal(fichiers.length, 42);
  const sansRevue = [];
  for (const f of fichiers) {
    const m = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    assert.equal(maillonFaibleDeLaMission(m), 'DECLARED', `${m.id} : maillon faible`);
    if (!(m.deliverables ?? []).some((d) => d.required && d.validation === 'review')) sansRevue.push(m.id);
  }
  assert.deepEqual(sansRevue, [], 'une mission sans revue requise invaliderait le plafond DECLARED');
});

// ── 3 · CE QUE LA DÉCISION COÛTE, MESURÉ ───────────────────────────────

test('V77 · CP9 — 18 combinaisons cessent de qualifier, et on les nomme', () => {
  const perdues = [];
  for (const st of EVIDENCE_SOURCE_TYPES) {
    if (!QUALIFYING_SOURCE_TYPES.has(st)) continue;
    for (const k of VALIDATION_KINDS) {
      if (!qualifiePourLesMoteurs(st, { status: 'passed', kind: k })) perdues.push(`${st} + ${k}`);
    }
  }
  assert.equal(perdues.length, 18);
  assert.ok(perdues.includes('capstone + capstone-review'), 'le cas hérité le plus réel');
  assert.ok(perdues.includes('mission + mission-deliverables'), 'le cas hérité le plus fréquent');
});

test('V77 · CP9 — SUR UNE PROGRESSION HÉRITÉE : 4 preuves qualifiantes → 2', () => {
  // La fixture d'exemple du dépôt ne porte AUCUNE preuve : on construit donc le
  // cas qui existe vraiment chez un apprenant ancien, via le SEUL producteur
  // encore actif de `mission-deliverables`/`capstone-review` portant `passed`.
  const jours = {
    12: { evidence: [
      { id: 'lab-py-fizzbuzz', type: 'exercise', title: 'x', description: '', url: '/lab/py-fizzbuzz', skills: ['python'], createdAt: '2026-01-12T10:00:00.000Z' },
      { id: 'mission-m', type: 'mission', title: 'x', description: '', url: '/missions/m', skills: ['cloud'], createdAt: '2026-01-12T11:00:00.000Z' },
    ] },
    20: { evidence: [
      { id: 'c1', type: 'capstone', title: 'x', description: '', url: '', skills: ['agents'], createdAt: '2026-01-20T10:00:00.000Z' },
      { id: 'diag-d', type: 'assessment', title: 'x', description: '', url: '', skills: ['jsts'], createdAt: '2026-01-20T11:00:00.000Z' },
    ] },
  };
  const led = normalizeLedger(migrateLegacyEvidence(jours));
  assert.equal(led.length, 4);
  const avant = led.filter((e) => QUALIFYING_SOURCE_TYPES.has(e.sourceType) && e.validation?.status === 'passed');
  const apres = led.filter(isQualifying);
  assert.equal(avant.length, 4, 'les quatre qualifiaient sous l’ancienne règle');
  assert.equal(apres.length, 2, 'seules l’exercice et le diagnostic démontrent encore');
  assert.deepEqual(apres.map((e) => e.sourceType).sort(), ['assessment', 'exercise']);
});

test('V77 · CP9 — AUCUNE preuve n’est réécrite : la règle de LECTURE change, pas le disque', () => {
  const ancienne = {
    id: 'ev-capstone-vieux', sourceType: 'capstone', sourceId: 'vieux', competencyIds: ['algo'],
    createdAt: '2026-01-01T00:00:00.000Z',
    validation: { status: 'passed', kind: 'capstone-review', checkedAt: '2026-01-01T00:00:00.000Z', detail: '', score: null },
    provenance: { producer: 'legacy-migration', method: 'capstone', note: '' },
  };
  const [relue] = normalizeLedger([ancienne]);
  assert.equal(relue.validation.status, 'passed');
  assert.equal(relue.validation.kind, 'capstone-review');
  assert.equal(relue.evidenceLevel, 'OBSERVED');
  assert.equal(isQualifying(relue), false);
});

// ── 4 · LA MESURE EST PUBLIÉE, PAS SEULEMENT RACONTÉE ──────────────────

test('V77 · CP9 — la matrice publiée correspond au code', () => {
  const p = join(ROOT, 'docs', 'v77', 'cp9-evidence-matrix.json');
  assert.ok(existsSync(p), 'la matrice doit être publiée');
  const m = JSON.parse(readFileSync(p, 'utf8'));
  assert.equal(m.matrice.lignes, matriceDesPreuves().length);
  assert.deepEqual(m.matrice.parNiveau, resumeParNiveau());
  assert.deepEqual(m.combinaisonsQualifiantes, combinaisonsQualifiantes());
  assert.deepEqual(m.incoherences, []);
  assert.equal(m.preuvesHeritees.qualifiantesAvant, 4);
  assert.equal(m.preuvesHeritees.qualifiantesApres, 2);
});

test('V77 · CP9 — `simulation` est une COLONNE, pas une dimension : elle ne change rien', () => {
  // `VALIDATED` et `simulation: true` tiennent ensemble — le contrat l'exige.
  // L'énumérer comme dimension doublerait la table pour rien.
  for (const l of matriceDesPreuves().slice(0, 30)) {
    assert.equal(l.simulationChangeLeNiveau, false);
  }
});
