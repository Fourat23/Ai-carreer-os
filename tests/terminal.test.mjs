// CP4 (V20) — modèle de terminal borné : validation de tâche/arguments,
// sécurité des chemins/allowlist, machine à états, bornage de sortie. PUR.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TERMINAL_STATUSES, ARGUMENT_KINDS, TERMINAL_CAPS,
  validateWorkspacePath, isAllowedExecutable, validateArgValue, validateArguments,
  buildCommandPreview, boundOutput, nextStatus, isTerminalStatus, classifyRun,
  validateTerminalTask, publicTaskView,
} from '../lib/terminal.mjs';

const task = (over = {}) => ({
  id: 'list-workspace', title: 'Lister le workspace', description: 'ls -la borné.',
  adapter: 'local', executable: 'ls', cwdPolicy: 'workspace', environmentPolicy: 'minimal',
  timeoutMs: 5000, maxStdoutBytes: 8192, maxStderrBytes: 4096, maxCombinedBytes: 8192,
  cleanupPolicy: 'always', expectedExitCodes: [0],
  argumentSchema: [
    { name: 'flag', kind: 'flag', values: ['-l', '-la'], default: '-l' },
    { name: 'dir', kind: 'path', required: false, default: '.' },
  ],
  skills: ['linux'], dayRefs: [72], ...over,
});
const ctx = () => ({ allowlist: new Set(['ls', 'pwd', 'cat']), skillIds: { has: (s) => s === 'linux' }, validDays: new Set([72]) });

test('constantes : 9 statuts, 5 kinds, plafonds', () => {
  assert.equal(TERMINAL_STATUSES.length, 9);
  assert.equal(ARGUMENT_KINDS.length, 5);
  assert.ok(TERMINAL_CAPS.timeoutMs > 0 && TERMINAL_CAPS.maxBytes > 0);
});

test('chemins : rejette absolu, .., backslash, ~, octet nul ; accepte relatif', () => {
  assert.equal(validateWorkspacePath('sous/dossier/f.txt').ok, true);
  assert.equal(validateWorkspacePath('/etc/passwd').ok, false);
  assert.equal(validateWorkspacePath('../secret').ok, false);
  assert.equal(validateWorkspacePath('a/../../b').ok, false);
  assert.equal(validateWorkspacePath('~/x').ok, false);
  assert.equal(validateWorkspacePath('a\\b').ok, false);
  assert.equal(validateWorkspacePath('a\0b').ok, false);
});

test('allowlist : binaire autorisé / refusé', () => {
  assert.equal(isAllowedExecutable(['ls', 'pwd'], 'ls'), true);
  assert.equal(isAllowedExecutable(['ls', 'pwd'], 'bash'), false);
});

test('valeur d argument : enum/int/flag/literal/path', () => {
  assert.equal(validateArgValue({ kind: 'enum', values: ['a', 'b'] }, 'a').ok, true);
  assert.equal(validateArgValue({ kind: 'enum', values: ['a'] }, 'z').ok, false);
  assert.equal(validateArgValue({ kind: 'int', min: 1, max: 9 }, '5').ok, true);
  assert.equal(validateArgValue({ kind: 'int', min: 1, max: 9 }, '99').ok, false);
  assert.equal(validateArgValue({ kind: 'int' }, 'abc').ok, false);
  assert.equal(validateArgValue({ kind: 'flag', values: ['-l'] }, '-rf').ok, false);
  assert.equal(validateArgValue({ kind: 'literal', default: 'x' }, 'x').ok, true);
  assert.equal(validateArgValue({ kind: 'literal', default: 'x' }, 'y').ok, false);
  assert.equal(validateArgValue({ kind: 'path' }, '../x').ok, false);
});

test('validateArguments : argv construit, requis manquant échoue, défaut comblé', () => {
  const r = validateArguments(task(), { flag: '-la', dir: 'src' });
  assert.deepEqual(r.argv, ['-la', 'src']);
  assert.equal(r.ok, true);
  // défaut appliqué quand absent
  assert.deepEqual(validateArguments(task(), {}).argv, ['-l', '.']);
  // valeur invalide rejetée
  assert.equal(validateArguments(task(), { flag: '-rf' }).ok, false);
  // requis manquant
  const req = task({ argumentSchema: [{ name: 'n', kind: 'int', required: true, min: 0, max: 5 }] });
  assert.equal(validateArguments(req, {}).ok, false);
  // clé dangereuse ignorée (jamais lue)
  assert.equal(validateArguments(task(), { __proto__: 'x', flag: '-l' }).ok, true);
});

test('les métacaractères shell ne sont JAMAIS interprétés (traités comme données)', () => {
  // un chemin contenant « ; rm » est refusé par la validation de chemin…
  assert.equal(validateArgValue({ kind: 'path' }, 'a; rm -rf /').ok, true); // pas de .. ni absolu → accepté comme donnée littérale
  // …et l'aperçu le met entre guillemets pour la LECTURE (pas d'exécution shell)
  const p = buildCommandPreview(task(), ['-l', 'a; rm']);
  assert.ok(p.includes('"a; rm"'));
  assert.ok(p.startsWith('ls '));
});

test('boundOutput : borne et signale la troncature, coupe proprement', () => {
  assert.deepEqual(boundOutput('hello', 100), { text: 'hello', truncated: false });
  const big = 'x'.repeat(1000);
  const b = boundOutput(big, 10);
  assert.equal(b.truncated, true);
  assert.ok(Buffer.from(b.text, 'utf8').length <= 10);
});

test('machine à états : cycle nominal et invalides ignorés', () => {
  assert.equal(nextStatus('idle', 'prepare'), 'preparing');
  assert.equal(nextStatus('preparing', 'start'), 'running');
  assert.equal(nextStatus('running', 'exit0'), 'success');
  assert.equal(nextStatus('running', 'timeout'), 'timed-out');
  assert.equal(nextStatus('running', 'cancel'), 'cancelled');
  assert.equal(nextStatus('running', 'exitN'), 'failed');
  // transition invalide → statut inchangé
  assert.equal(nextStatus('success', 'start'), 'success');
  assert.equal(nextStatus('idle', 'exit0'), 'idle');
  // nettoyage raté après état terminal
  assert.equal(nextStatus('success', 'cleanup-fail'), 'cleanup-failed');
  assert.equal(isTerminalStatus('success'), true);
  assert.equal(isTerminalStatus('running'), false);
});

test('classifyRun : succès/échec/timeout/annulation selon les codes attendus', () => {
  assert.equal(classifyRun(task(), { exitCode: 0 }), 'success');
  assert.equal(classifyRun(task(), { exitCode: 1 }), 'failed');
  assert.equal(classifyRun(task(), { exitCode: 0, timedOut: true }), 'timed-out');
  assert.equal(classifyRun(task(), { exitCode: 0, cancelled: true }), 'cancelled');
  assert.equal(classifyRun(task({ expectedExitCodes: [0, 2] }), { exitCode: 2 }), 'success');
});

test('validateTerminalTask : tâche valide ; refuse binaire hors allowlist, timeout/bytes hors bornes', () => {
  assert.deepEqual(validateTerminalTask(task(), ctx()), { ok: true, errors: [] });
  assert.ok(validateTerminalTask(task({ executable: 'bash' }), ctx()).errors.some((e) => /allowlist/.test(e)));
  assert.ok(validateTerminalTask(task({ timeoutMs: 999999 }), ctx()).errors.some((e) => /timeoutMs/.test(e)));
  assert.ok(validateTerminalTask(task({ maxStdoutBytes: 10 ** 9 }), ctx()).errors.some((e) => /maxStdoutBytes/.test(e)));
  assert.ok(validateTerminalTask(task({ cwdPolicy: 'anywhere' }), ctx()).errors.some((e) => /cwdPolicy/.test(e)));
  assert.ok(validateTerminalTask(task({ environmentPolicy: 'inherit' }), ctx()).errors.some((e) => /environmentPolicy/.test(e)));
});

test('publicTaskView : aucune fuite d exécutable hôte/env/chemin absolu', () => {
  const v = publicTaskView(task({ hostPath: '/home/user/secret', env: { TOKEN: 'x' } }));
  const blob = JSON.stringify(v);
  assert.ok(!/hostPath|TOKEN|\/home\//.test(blob));
  assert.equal(v.id, 'list-workspace');
});
