// V60.1 — garde-fou d'isolation du spike.
//
// Écrit après un défaut RÉEL : `app/globals.css` définissait déjà `.day-work`,
// `.day-head`, `.day-title`, `.day-read` et huit autres classes que le spike
// avait choisies. Le prototype héritait donc silencieusement de padding, de
// marges et de bordures de production — mesuré au navigateur, `.day-work`
// recevait `padding: 24px 24px 32px; margin: 40px 0 0` qu'aucune règle du
// spike ne déclarait.
//
// Scoper sous `.cw` ne suffisait PAS : la spécificité l'emporte seulement sur
// les propriétés qu'on redéclare, pas sur celles qu'on ignore. Toutes les
// classes du spike sont donc préfixées `cw-`, et ce gate le vérifie.
import { readFileSync } from 'node:fs';

const spike = readFileSync('app/design-spike/v60-1/cw.css', 'utf8');
const prod = readFileSync('app/globals.css', 'utf8');
const cls = (s) => new Set([...s.matchAll(/\.([a-z][a-z0-9-]+)/g)].map((m) => m[1]));

const mine = [...cls(spike)];
const bad = mine.filter((c) => c !== 'cw' && !c.startsWith('cw-'));
const clash = mine.filter((c) => cls(prod).has(c));

console.log('\n── Isolation du spike V60.1');
console.log(`  · classes du spike : ${mine.length}`);
console.log(`  · non préfixées cw- : ${bad.length}${bad.length ? ' → ' + bad.join(', ') : ''}`);
console.log(`  · en collision avec la production : ${clash.length}${clash.length ? ' → ' + clash.join(', ') : ''}`);

if (bad.length || clash.length) {
  console.error('\n❌ Isolation V60.1 rompue.');
  process.exit(1);
}
console.log('\n✅ Spike V60.1 isolé : toutes les classes sont préfixées, aucune collision avec la production.');
