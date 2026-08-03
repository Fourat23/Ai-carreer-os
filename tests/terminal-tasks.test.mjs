// CP7 (V20) — intégrité des tâches de terminal (data/terminal-tasks/*.json) :
// validité contre les allowlists réelles, journées existantes, compétences
// connues, vue publique sans fuite.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validateTerminalTask, publicTaskView } from '../lib/terminal.mjs';
import { LOCAL_ALLOWLIST } from '../lib/terminal-local.mjs';
import { DOCKER_EXEC_ALLOWLIST } from '../lib/terminal-docker.mjs';
import { isKnownSkill } from '../lib/skill-taxonomy.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const validDays = new Set(program.days.map((d) => d.day));
const skillIds = { has: (s) => isKnownSkill(s) };
const files = readdirSync(R('data/terminal-tasks')).filter((f) => f.endsWith('.json'));

test('au moins 3 tâches de terminal livrées', () => {
  assert.ok(files.length >= 3, `${files.length} tâches`);
});

test('chaque tâche est valide contre l allowlist de son adaptateur, jours et compétences', () => {
  const ids = new Set();
  for (const f of files) {
    const t = JSON.parse(readFileSync(R(`data/terminal-tasks/${f}`), 'utf8'));
    const allowlist = t.adapter === 'docker' ? DOCKER_EXEC_ALLOWLIST : LOCAL_ALLOWLIST;
    const v = validateTerminalTask(t, { allowlist, skillIds, validDays });
    assert.ok(v.ok, `${f} invalide : ${v.errors.join(' ; ')}`);
    assert.equal(ids.has(t.id), false, `id dupliqué ${t.id}`);
    ids.add(t.id);
    for (const d of t.dayRefs) assert.ok(validDays.has(d), `${f} : jour ${d} inexistant`);
  }
});

test('vue publique : aucune fuite de seedFiles, dockerImage ou chemin', () => {
  for (const f of files) {
    const t = JSON.parse(readFileSync(R(`data/terminal-tasks/${f}`), 'utf8'));
    const pub = JSON.stringify(publicTaskView(t));
    assert.ok(!/seedFiles|dockerImage|\/tmp|\/home\//.test(pub), `${f} : fuite dans la vue publique`);
  }
});

test('les tâches locales n exposent que des exécutables allowlistés, jamais un shell', () => {
  for (const f of files) {
    const t = JSON.parse(readFileSync(R(`data/terminal-tasks/${f}`), 'utf8'));
    if (t.adapter !== 'local') continue;
    assert.ok(LOCAL_ALLOWLIST.has(t.executable), `${f} : ${t.executable} hors allowlist`);
    assert.ok(!['bash', 'sh', 'zsh', 'cmd', 'powershell'].includes(t.executable), `${f} : shell interdit`);
  }
});
