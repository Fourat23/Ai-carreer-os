// V71 — CP10. Dump compact de l appareil de pratique d une ou plusieurs lecons,
// pour LECTURE. Ne note rien, ne juge rien : il met sous les yeux les consignes et
// les blocs de verification, dans l ordre ou l apprenant les rencontre.
// Usage : node scripts/v71/dump-pratique.mjs slug1 slug2 ...
import { readFileSync } from 'node:fs';

const TITRE_PRATIQUE = /^##\s+.*(pratique|mini-exercice|exercice|a toi de|ta production)/i;
const TITRE_CORRECTION = /^##\s+.*(correction|corrige)/i;
const TITRE_RENVOI = /^##\s+🛠️\s*Pratique\s*$/;

for (const slug of process.argv.slice(2)) {
  const md = readFileSync(`curriculum/lessons/${slug}.md`, 'utf8');
  console.log(`\n${'═'.repeat(70)}\n${slug}`);
  let cour = null;
  for (const l of md.split('\n')) {
    if (/^## /.test(l)) {
      cour = TITRE_PRATIQUE.test(l) && !TITRE_CORRECTION.test(l) && !TITRE_RENVOI.test(l);
      if (cour) console.log(`\n${l}`);
    } else if (cour && l.trim()) console.log(l);
  }
  const v = md.match(/\*\*Vérifie seul[^*]*\*\*\s*:?([\s\S]*?)(?=\n## |\n\*\*[A-ZÉÀ]|$)/);
  console.log(v ? `\n[VÉRIFIE SEUL]${v[1].replace(/\n+/g, '\n').trimEnd()}` : '\n[VÉRIFIE SEUL] — ABSENT');
}
