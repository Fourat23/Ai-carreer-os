// CP2 (V26) — intégrité de la bibliothèque « Leçons de fond » et du plan V26.
// Vérifie la cohérence LESSONS ↔ fichiers .md ↔ program.json, et que chaque leçon
// du périmètre V26 respecte le contrat structurel (sections minimales, liens valides).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { LESSONS } from '../scripts/data/lessons-map.mjs';
import { normalizeText } from '../lib/glossary-core.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const LES = R('curriculum/lessons');
const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const mdFiles = new Set(readdirSync(LES).filter((f) => f.endsWith('.md')));

test('LESSONS ↔ fichiers .md : chaque entrée a son fichier et réciproquement', () => {
  const entryFiles = new Set(LESSONS.map((l) => l.file));
  for (const l of LESSONS) assert.ok(mdFiles.has(l.file), `fichier manquant pour ${l.file}`);
  for (const f of mdFiles) assert.ok(entryFiles.has(f), `entrée LESSONS manquante pour ${f}`);
});

test('LESSONS ↔ program.json : les slugs et métadonnées correspondent', () => {
  const prog = new Map((program.lessons ?? []).map((l) => [l.slug, l]));
  assert.equal(prog.size, LESSONS.length, 'même nombre de leçons');
  for (const l of LESSONS) {
    const slug = l.file.replace(/\.md$/, '');
    const p = prog.get(slug);
    assert.ok(p, `${slug} présent dans program.json`);
    assert.equal(p.title, l.title);
    assert.equal(p.min, l.min);
    assert.equal(p.level, l.level);
  }
});

test('métadonnées valides : title/cat non vides, level 1-3, min>0, skills connus', () => {
  const known = new Set((program.skills ?? []).map((s) => s.id));
  for (const l of LESSONS) {
    assert.ok(l.title && l.title.trim(), `${l.file} : title`);
    assert.ok(l.cat && l.cat.trim(), `${l.file} : cat`);
    assert.ok([1, 2, 3].includes(l.level), `${l.file} : level`);
    assert.ok(Number.isFinite(l.min) && l.min > 0, `${l.file} : min`);
    for (const s of l.skills ?? []) assert.ok(known.has(s), `${l.file} : skill inconnu ${s}`);
  }
});

test('toute leçon a le marqueur keep, un titre « # Leçon » et une section de liens', () => {
  for (const f of mdFiles) {
    const md = readFileSync(join(LES, f), 'utf8');
    assert.match(md, /^<!-- keep -->/, `${f} : marqueur keep`);
    assert.ok(/#\s*Leçon/.test(md), `${f} : titre Leçon`);
    // « lien » (singulier ou pluriel) : le corpus mêle deux gabarits historiques.
    assert.ok(normalizeText(md).includes('lien'), `${f} : section de liens`);
  }
});

test('plan V26 : chaque leçon déclarée existe et respecte les sections minimales', () => {
  const planPath = R('docs/architecture/v26-lessons-plan.json');
  if (!existsSync(planPath)) return; // robuste avant CP3
  const plan = JSON.parse(readFileSync(planPath, 'utf8'));
  const REQUIRED = [['objectif'], ['modèle mental'], ['erreurs', 'pièges', 'anti-pattern'], ['a retenir', 'à retenir', 'synthèse'], ['vocabulaire'], ['liens']];
  for (const entry of plan.newLessons ?? []) {
    const file = join(LES, `${entry.slug}.md`);
    assert.ok(existsSync(file), `plan : ${entry.slug}.md existe`);
    const nmd = normalizeText(readFileSync(file, 'utf8'));
    for (const variants of REQUIRED) {
      assert.ok(variants.some((v) => nmd.includes(normalizeText(v))), `${entry.slug} : section ${variants[0]}`);
    }
    assert.ok(LESSONS.some((l) => l.file === `${entry.slug}.md`), `${entry.slug} : entrée LESSONS`);
  }
});
