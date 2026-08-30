// V70 — vérification exécutée pour ci-cd-pipeline-anatomy.
// Question : « le pipeline prend trop longtemps, on parallélise. » On mesure
// où va réellement le temps sur une suite de tests réelle — celle de ce dépôt —
// et ce que la parallélisation peut, ou ne peut pas, en retirer.
import { spawnSync } from 'node:child_process';
import { globSync } from 'node:fs';

const fichiers = globSync('tests/**/*.test.mjs').sort();
console.log(`suite mesurée : ${fichiers.length} fichiers de tests de ce dépôt`);

const durees = [];
for (const f of fichiers) {
  const t0 = performance.now();
  const r = spawnSync(process.execPath, ['--test', f], { encoding: 'utf8' });
  const ms = performance.now() - t0;
  durees.push({ f, ms, ok: /^# fail 0$/m.test(r.stdout) });
}
durees.sort((a, b) => b.ms - a.ms);

const total = durees.reduce((s, d) => s + d.ms, 0);
const plusLong = durees[0];
console.log(`\ntemps CPU cumulé (exécution séquentielle) : ${(total / 1000).toFixed(1)} s`);
console.log('les cinq fichiers les plus lents :');
for (const d of durees.slice(0, 5))
  console.log(`  ${(d.ms / 1000).toFixed(2).padStart(6)} s  ${((d.ms / total) * 100).toFixed(1).padStart(5)} %  ${d.f}`);
const cumul5 = durees.slice(0, 5).reduce((s, d) => s + d.ms, 0);
console.log(`  -> ces 5 fichiers sur ${fichiers.length} représentent `
  + `${((cumul5 / total) * 100).toFixed(1)} % du temps total.`);

// Répartition sur N agents : ordonnancement glouton (le plus long d'abord),
// qui est la stratégie usuelle et la meilleure heuristique simple.
function repartir(n) {
  const agents = Array.from({ length: n }, () => 0);
  for (const d of durees) {              // déjà triés du plus long au plus court
    let i = 0;
    for (let k = 1; k < n; k++) if (agents[k] < agents[i]) i = k;
    agents[i] += d.ms;
  }
  return Math.max(...agents);            // le pipeline finit quand le dernier finit
}
console.log('\nrépartition des fichiers sur N agents (glouton, plus long d abord) :');
console.log('  agents | durée du pipeline | accélération | accélération idéale');
for (const n of [1, 2, 4, 8, 16, 32]) {
  const d = repartir(n);
  console.log(`  ${String(n).padStart(6)} | ${(d / 1000).toFixed(1).padStart(14)} s `
    + `| ×${(total / d).toFixed(2).padStart(11)} | ×${n.toFixed(2)}`);
}
console.log(`\n  plancher incompressible : ${(plusLong.ms / 1000).toFixed(2)} s`);
console.log(`  (${plusLong.f} — un fichier ne se coupe pas en deux)`);
console.log(`  -> au delà de ~${Math.ceil(total / plusLong.ms)} agents, ajouter des agents`);
console.log('     ne change plus rien : le pipeline attend le fichier le plus long.');

// Le coût fixe par agent, qui n'apparaît dans aucun calcul d'accélération.
console.log('\ncoût fixe payé PAR AGENT (mesuré sur cette machine) :');
for (const [nom, cmd] of [['démarrage de node   ', [process.execPath, ['-e', '0']]]]) {
  const t0 = performance.now();
  for (let i = 0; i < 20; i++) spawnSync(cmd[0], cmd[1]);
  console.log(`  ${nom} : ${((performance.now() - t0) / 20).toFixed(1)} ms`);
}
console.log('  s y ajoutent, sur un agent de CI réel et non mesurables ici :');
console.log('  provisionnement de la machine, clone du dépôt, restauration du cache,');
console.log('  installation des dépendances. Ordre de grandeur usuel : 30 à 90 s.');
console.log('  Avec 60 s de coût fixe par agent, 8 agents ajoutent 8 minutes de');
console.log('  temps machine facturé pour gagner quelques dizaines de secondes de');
console.log('  temps d attente. L accélération se paie, et pas dans la même monnaie.');
