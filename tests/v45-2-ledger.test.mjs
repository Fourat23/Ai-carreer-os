// V45.2 — intégrité de l'audit : 128/128 leçons, 128 fullRead=true, verdicts valides,
// preuves SPÉCIFIQUES non vides et non recyclées (anti-générique). Lecture seule.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const LEDGER = new URL('../docs/audits/V45-2-LESSON-LEDGER.json', import.meta.url);
const ACAD = new Set(['A', 'B', 'C', 'D', 'E']);
const TRANSFER = new Set(['T0', 'T1', 'T2', 'T3', 'T4']);
const ACTIONS = new Set(['KEEP', 'MINOR_FIX', 'REWORK', 'RESTRUCTURE', 'BLOCK']);

test('V45.2 : ledger couvre 128/128 leçons, tous fullRead', () => {
  assert.ok(existsSync(LEDGER), 'V45-2-LESSON-LEDGER.json doit exister');
  const led = JSON.parse(readFileSync(LEDGER, 'utf8'));
  const entries = Array.isArray(led) ? led : led.lessons;
  const onDisk = new Set(readdirSync(new URL('../curriculum/lessons/', import.meta.url)).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')));
  const slugs = new Set(entries.map((e) => e.slug));
  assert.equal(slugs.size, entries.length, 'aucun slug dupliqué');
  assert.equal(entries.length, onDisk.size, `ledger ${entries.length} ≠ ${onDisk.size} leçons`);
  for (const s of onDisk) assert.ok(slugs.has(s), `leçon non auditée : ${s}`);
  assert.equal(entries.filter((e) => e.fullRead === true).length, onDisk.size, 'toutes les leçons doivent avoir fullRead=true');
});

test('V45.2 : verdicts + preuves valides et spécifiques par fiche', () => {
  const led = JSON.parse(readFileSync(LEDGER, 'utf8'));
  const entries = Array.isArray(led) ? led : led.lessons;
  for (const e of entries) {
    assert.ok(ACAD.has(e.academicVerdict), `${e.slug} : academicVerdict invalide (${e.academicVerdict})`);
    assert.ok(TRANSFER.has(e.transferVerdict), `${e.slug} : transferVerdict invalide (${e.transferVerdict})`);
    assert.ok(ACTIONS.has(e.recommendedAction), `${e.slug} : recommendedAction invalide (${e.recommendedAction})`);
    assert.ok(Object.keys(e.scores || {}).length >= 18, `${e.slug} : <18 dimensions notées`);
    for (const [k, v] of Object.entries(e.scores || {})) assert.ok(Number.isInteger(v) && v >= 0 && v <= 4, `${e.slug}.${k}=${v} hors [0,4]`);
    assert.ok(Array.isArray(e.evidence) && e.evidence.length >= 2, `${e.slug} : <2 preuves spécifiques`);
    for (const ev of e.evidence) assert.ok(typeof ev === 'string' && ev.length >= 15, `${e.slug} : preuve trop courte`);
  }
});

test('V45.2 : A (CERTIFIED) exige des preuves de qualité (7 dims clés ≥ 3)', () => {
  const led = JSON.parse(readFileSync(LEDGER, 'utf8'));
  const entries = Array.isArray(led) ? led : led.lessons;
  const GATE = ['technical-accuracy', 'mental-model-quality', 'beginner-accessibility', 'concrete-to-abstract-progression', 'prerequisite-honesty', 'explanation-depth', 'misconception-handling'];
  for (const e of entries.filter((x) => x.academicVerdict === 'A')) {
    for (const k of GATE) assert.ok((e.scores[k] ?? 0) >= 3, `${e.slug} noté A mais ${k}=${e.scores[k]} (<3)`);
  }
});

test('V45.2 : preuves non recyclées en masse (spécificité globale)', () => {
  const led = JSON.parse(readFileSync(LEDGER, 'utf8'));
  const entries = Array.isArray(led) ? led : led.lessons;
  const all = entries.flatMap((e) => e.evidence);
  const uniq = new Set(all.map((s) => s.trim().toLowerCase()));
  // Au moins 90% des preuves doivent être uniques (tolère quelques formulations proches).
  assert.ok(uniq.size >= all.length * 0.9, `preuves trop recyclées : ${uniq.size}/${all.length} uniques`);
});
