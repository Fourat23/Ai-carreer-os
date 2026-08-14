// CP10 (V39) — intégrité du registre d'audit pédagogique V39 : ledger valide contre
// la rubrique partagée, items correspondant à des leçons réelles, dimensions connues.
// V39 n'ajoute AUCUNE leçon (pas de lessons-plan) : le ledger re-audite les 4 leçons
// denses de V38 après reliure aux diagnostics (verdict densité KEEP). PUR, lecture seule.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { LESSONS } from '../scripts/data/lessons-map.mjs';
import { validateAuditLedger, DIMENSION_IDS } from '../lib/pedagogy-audit.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const ledger = JSON.parse(readFileSync(R('docs/architecture/v39-pedagogy-audit.json'), 'utf8'));
const bySlug = new Map(LESSONS.map((l) => [l.file.replace(/\.md$/, ''), l]));

test('ledger V39 : valide contre la rubrique partagée', () => {
  const res = validateAuditLedger(ledger);
  assert.ok(res.ok, `ledger valide : ${(res.errors ?? []).join(' ; ')}`);
});

test('ledger V39 : items = leçons réelles, dimensions connues', () => {
  for (const it of ledger.items) {
    assert.equal(it.kind, 'content', 'kind content pour une leçon');
    assert.ok(bySlug.has(it.id), `item ledger correspond à une leçon : ${it.id}`);
    for (const k of Object.keys(it.scores ?? {})) assert.ok(DIMENSION_IDS.has(k), `dimension connue : ${k}`);
  }
});

test('ledger V39 : honnêteté — autonomous-practice reste ≤ 3 (modèle déterministe, distribué simulé)', () => {
  for (const it of ledger.items) {
    assert.ok((it.scores['autonomous-practice'] ?? 0) <= 3, `${it.id} : autonomous-practice ne doit pas être gonflé`);
  }
});
