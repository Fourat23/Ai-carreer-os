// V73 · CP14 — vérificateur de charge, pour la mutation n° 5.
// Rouge si une journée est STRUCTURELLEMENT IMPOSSIBLE au sens du contrat (IMPOSSIBLE sous au
// moins quatre des six hypothèses gelées), c'est-à-dire si le seuil L1 = 0 est franchi.
import { execSync } from 'node:child_process';
const out = execSync('node scripts/v73/cp6-charge.mjs', { encoding: 'utf8' });
const m = /STRUCTURELLEMENT IMPOSSIBLES \(IMPOSSIBLE sous ≥ 4 des 6\) : (\d+)/.exec(out);
const n = m ? +m[1] : -1;
console.log(`L1 — journées structurellement impossibles : ${n}`);
if (n !== 0) { console.log(`❌ violation du seuil L1 (exigé : 0)`); process.exitCode = 1; }
