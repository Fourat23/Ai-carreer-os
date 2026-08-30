// V70 — vérification exécutée pour les leçons ci-cd, ci-cd-pipeline-anatomy
// et ci-cd-quality-gates-artifacts.
// Question : « la CI est rouge une fois sur cinq. Le test est-il faux, ou
// est-ce l'infrastructure ? » On fabrique les deux causes les plus fréquentes
// et on les mesure, au lieu de relancer le pipeline en espérant du vert.
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import fs from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const D = mkdtempSync(join(tmpdir(), 'v70-ci-'));
const run = (f, env = {}) =>
  spawnSync(process.execPath, ['--test', join(D, f)],
            { encoding: 'utf8', env: { ...process.env, ...env } });

// ── CAS 1 : dépendance à l'ordre d'exécution ────────────────────────────
// Deux tests partagent un panier en mémoire. Chacun passe seul.
writeFileSync(join(D, 'ordre.test.mjs'), `
import test from 'node:test';
import assert from 'node:assert';
const panier = { lignes: [] };            // état partagé au niveau du module
test('ajouter une ligne', () => {
  panier.lignes.push({ sku: 'A', qte: 1 });
  assert.equal(panier.lignes.length, 1);
});
test('le panier vide coute 0', () => {
  assert.equal(panier.lignes.reduce((s, l) => s + l.qte, 0), 0);
});
`);
const c1 = run('ordre.test.mjs');
console.log('== CAS 1 · état partagé entre deux tests ==');
console.log('  les deux tests ensemble  :', /^# fail 0$/m.test(c1.stdout) ? 'VERT' : 'ROUGE');
console.log('  ' + (c1.stdout.match(/^# (pass|fail) \d+$/gm) || []).join('   '));
const seul = spawnSync(process.execPath,
  ['--test', '--test-name-pattern', 'le panier vide', join(D, 'ordre.test.mjs')],
  { encoding: 'utf8' });
console.log('  le second test SEUL      :', /^# fail 0$/m.test(seul.stdout) ? 'VERT' : 'ROUGE');
console.log('  -> le test est vert isolé et rouge en suite. Le défaut n est pas');
console.log('     dans la CI : il est dans le partage d état entre les tests.');

// ── CAS 2 : attente d'un délai fixe au lieu de l'événement ──────────────
// Le test attend « assez longtemps » au lieu d'attendre la fin de l'opération.
// On mesure la durée réelle d'une opération d'entrée-sortie, seule puis sous
// charge, et on en déduit ce que devient le test à délai fixe.
console.log('\n== CAS 2 · attente d un délai fixe au lieu de l événement ==');
const F = join(D, 'io.bin');
const charge = Buffer.alloc(64 * 1024, 7);
async function allerRetour() {
  const t0 = performance.now();
  await fs.writeFile(F, charge);
  await fs.readFile(F);
  return performance.now() - t0;
}
async function mesurer(concurrence, N) {
  const d = [];
  for (let i = 0; i < N; i += concurrence)
    d.push(...await Promise.all(Array.from({ length: concurrence }, allerRetour)));
  return d.sort((a, b) => a - b);
}
for (const [nom, conc] of [['machine au repos      ', 1],
                           ['16 travaux en parallèle', 16]]) {
  const d = await mesurer(conc, 320);
  const p = (q) => d[Math.min(d.length - 1, Math.floor(q * d.length))].toFixed(2);
  console.log(`  ${nom} : médiane ${p(0.5)} ms · p95 ${p(0.95)} ms · max ${d.at(-1).toFixed(2)} ms`);
  for (const seuil of [2, 5, 20]) {
    const rouges = d.filter((x) => x > seuil).length;
    console.log(`      un test qui attend ${String(seuil).padStart(2)} ms fixes : `
      + `${d.length - rouges} vertes / ${rouges} rouges sur ${d.length}`);
  }
}
console.log('  -> le même test, sans une ligne modifiée, change de couleur selon');
console.log('     la charge de la machine. Un agent de CI partagé a moins de');
console.log('     marge qu un poste de développement au repos.');
console.log('  -> le correctif n est pas « augmenter le délai » : c est attendre');
console.log('     la fin de l opération (await) plutôt qu une durée.');

// ── CAS 3 : le coût réel du « on relance » ──────────────────────────────
console.log('\n== CAS 3 · arithmétique du « relance et ça passera » ==');
for (const p of [0.02, 0.05, 0.10]) {
  const suite = 300;                       // 300 tests dans le pipeline
  const pipeVert = Math.pow(1 - p, suite);
  console.log(`  ${(p * 100).toFixed(0)} % de tests instables sur ${suite} tests`
    + ` -> pipeline vert du premier coup : ${(pipeVert * 100).toFixed(4)} %`);
}
console.log('  -> avec 2 % de tests instables sur 300 tests, un pipeline vert');
console.log('     du premier coup est déjà une exception. Le taux de tests');
console.log('     instables tolérable n est pas « faible » : il est proche de zéro.');
