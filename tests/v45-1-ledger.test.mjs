// V45.1 — vérifie que le ledger d'audit couvre EXACTEMENT 128/128 leçons, sans trou ni
// doublon, avec les champs obligatoires et un verdict valide par fiche. Anti-scope-collapse :
// ce test échoue si une seule leçon n'a pas de fiche. Lecture seule.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const LEDGER = new URL('../docs/audits/V45-1-LESSON-LEDGER.json', import.meta.url);
const VERDICTS = new Set(['CERTIFIED', 'USABLE', 'REWORK', 'RESTRUCTURE', 'BLOCKED', 'MISSING']);
const REQUIRED = ['slug', 'title', 'domain', 'level', 'verdict', 'severity', 'recommendedAction', 'justification', 'scores'];

test('V45.1 : le ledger existe et couvre 128/128 leçons réelles', () => {
  assert.ok(existsSync(LEDGER), 'V45-1-LESSON-LEDGER.json doit exister');
  const ledger = JSON.parse(readFileSync(LEDGER, 'utf8'));
  const entries = Array.isArray(ledger) ? ledger : ledger.lessons;
  assert.ok(Array.isArray(entries), 'le ledger doit être un tableau (ou {lessons:[]})');

  const onDisk = new Set(readdirSync(new URL('../curriculum/lessons/', import.meta.url))
    .filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')));
  const inLedger = new Set(entries.map((e) => e.slug));

  assert.equal(inLedger.size, entries.length, 'aucun slug dupliqué dans le ledger');
  assert.equal(entries.length, onDisk.size, `ledger ${entries.length} ≠ ${onDisk.size} leçons sur disque`);
  for (const slug of onDisk) assert.ok(inLedger.has(slug), `leçon non auditée : ${slug}`);
  for (const slug of inLedger) assert.ok(onDisk.has(slug), `fiche fantôme (leçon absente) : ${slug}`);
});

test('V45.1 : chaque fiche a les champs obligatoires + verdict valide + 20 dimensions notées', () => {
  const ledger = JSON.parse(readFileSync(LEDGER, 'utf8'));
  const entries = Array.isArray(ledger) ? ledger : ledger.lessons;
  for (const e of entries) {
    for (const k of REQUIRED) assert.ok(e[k] !== undefined && e[k] !== null && e[k] !== '', `${e.slug} : champ manquant « ${k} »`);
    assert.ok(VERDICTS.has(e.verdict), `${e.slug} : verdict invalide « ${e.verdict} »`);
    assert.ok(typeof e.justification === 'string' && e.justification.length >= 20, `${e.slug} : justification trop courte`);
    // Au moins 20 dimensions notées 0..4.
    const dims = e.scores || {};
    const keys = Object.keys(dims);
    assert.ok(keys.length >= 20, `${e.slug} : ${keys.length} dimensions notées (< 20)`);
    for (const [k, v] of Object.entries(dims)) assert.ok(Number.isInteger(v) && v >= 0 && v <= 4, `${e.slug}.${k} = ${v} hors [0,4]`);
  }
});

test('V45.1 : CERTIFIED respecte le seuil de qualité (definition of certified)', () => {
  const ledger = JSON.parse(readFileSync(LEDGER, 'utf8'));
  const entries = Array.isArray(ledger) ? ledger : ledger.lessons;
  const GATE = ['technicalAccuracy', 'conceptualAccuracy', 'mentalModelQuality', 'beginnerAccessibility', 'progression', 'prerequisites', 'professionalUsefulness'];
  for (const e of entries.filter((x) => x.verdict === 'CERTIFIED')) {
    for (const k of GATE) assert.ok((e.scores[k] ?? 0) >= 3, `${e.slug} CERTIFIED mais ${k}=${e.scores[k]} (<3)`);
  }
});
