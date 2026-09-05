// V71 CP3 — detection des titres de section repetes dans une meme lecon.
//
// Sonde fiable, contrairement a celle des gloses : elle ne peut pas se tromper
// sur ce qu elle DETECTE (deux titres identiques, c est un fait). En revanche
// elle ne dit rien de ce que cela SIGNIFIE, et c est la lecture qui tranche.
//
// RESULTAT AU CP3 : 28 lecons sur 128 portent un titre de section en double.
//
// Verdict de lecture, et il retourne presque tout le chiffre :
//
//   26 lecons : « Correction attendue » x2 — LEGITIME. Ces lecons ont deux
//   exercices (un mini-exercice et une pratique), chacun avec sa correction.
//   C est la forme normale du corpus, pas un defaut.
//
//    2 lecons : « Verification de comprehension » x2 — DEFAUT REEL. Un controle
//   de comprehension est un moment pedagogique unique, pas un par exercice.
//   Dans les deux cas, la premiere occurrence est bien placee (avant la
//   correction, avec la mention « A traiter avant de lire la correction ») et
//   la seconde est un reliquat non corrige, au format d annexe anterieur, dont
//   les questions recouvrent partiellement celles de la premiere :
//
//     async-messaging-queues  99 mots avant la correction · 40 mots en annexe
//     system-design-scaling   73 mots avant la correction · 60 mots en annexe
//
//   Diagnostic : une restructuration a ajoute la section de verification au bon
//   endroit sans retirer l ancienne. Remede : supprimer la seconde, apres avoir
//   verifie que ses questions sont couvertes par la premiere — pour
//   async-messaging-queues elles le sont (idempotence, file de messages morts,
//   ordre), pour system-design-scaling la question sur les SPOF ne l est pas et
//   doit etre reprise dans la premiere.
//
//   node scripts/v71/titres-doubles.mjs

import fs from 'node:fs';
import path from 'node:path';

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-zA-Z ]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

const fichiers = fs.readdirSync('curriculum/lessons').filter((f) => f.endsWith('.md')).sort();
const dupes = [];

for (const f of fichiers) {
  const t = fs.readFileSync(path.join('curriculum/lessons', f), 'utf8').replace(/```[\s\S]*?```/g, '');
  const titres = t.split('\n').filter((l) => l.startsWith('## ')).map((l) => norm(l.slice(3)));
  const compte = new Map();
  for (const x of titres) if (x) compte.set(x, (compte.get(x) || 0) + 1);
  const d = [...compte].filter(([, n]) => n > 1);
  if (d.length) dupes.push({ lecon: f.slice(0, -3), doubles: d });
}

const attendues = dupes.filter((d) => d.doubles.every(([k]) => k === 'correction attendue'));
const suspectes = dupes.filter((d) => d.doubles.some(([k]) => k !== 'correction attendue'));

console.log(`\nLecons avec un titre de section en double : ${dupes.length} / 128\n`);
console.log(`  ${attendues.length} en « Correction attendue » x2 — LEGITIME (deux exercices, deux corrections)`);
console.log(`  ${suspectes.length} autres — a lire\n`);
for (const d of suspectes) {
  console.log(`${d.lecon}`);
  for (const [k, n] of d.doubles) console.log(`  « ${k} » x${n}`);
}
console.log('\nVerdict de lecture au CP3 : 26 legitimes, 2 defauts reels');
console.log('(async-messaging-queues et system-design-scaling — seconde section de');
console.log('verification non corrigee, reliquat d une restructuration).');
console.log('CP9 : les deux defauts sont corriges. La question sur les points de');
console.log('defaillance unique de system-design-scaling a ete REPRISE dans la section');
console.log('principale avant suppression de l annexe — elle n y etait pas couverte.');
