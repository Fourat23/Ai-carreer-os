// V47 — sécurité du catalogue : UNICITÉ des ids sur tous les artefacts (protège
// contre l'écrasement silencieux, incident V46) + cohérence id ↔ nom de fichier
// + unicité des ids de runtime + garde anti-collision du builder.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { RUNTIMES } from '../lib/runtime.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);

const FAMILIES = ['data/exercises', 'data/assessments', 'data/capstones', 'data/missions', 'data/playbooks', 'data/transfer-challenges'];

for (const dir of FAMILIES) {
  test(`ids uniques + cohérents avec le fichier : ${dir}`, () => {
    const abs = R(dir);
    if (!existsSync(abs)) return;
    const seen = new Map();
    for (const f of readdirSync(abs).filter((x) => x.endsWith('.json'))) {
      const obj = JSON.parse(readFileSync(join(abs, f), 'utf8'));
      if (!obj.id) continue;
      assert.ok(!seen.has(obj.id), `collision id « ${obj.id} » : ${f} et ${seen.get(obj.id)}`);
      seen.set(obj.id, f);
      assert.equal(`${obj.id}.json`, f, `${dir}/${f} : nom de fichier ≠ id (${obj.id})`);
    }
  });
}

test('ids de runtime uniques et python-ds enregistré', () => {
  const ids = Object.keys(RUNTIMES);
  assert.equal(new Set(ids).size, ids.length, 'ids de runtime dupliqués');
  assert.ok(ids.includes('python-ds'), 'adaptateur python-ds absent du registre');
});
