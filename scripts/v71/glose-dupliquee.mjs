// V71 CP3 — detection des gloses dupliquees dans une meme phrase.
//
// HISTORIQUE DE CETTE SONDE, parce qu il est le point interessant.
//
// Le defaut a ete trouve par LECTURE, dans database-migrations :
//
//   « ... et etre **idempotentes** — rejouables sans double effet — autant que
//     possible (rejouables sans double effet). »
//
// La meme glose, deux fois, avec deux ponctuations differentes : la signature
// d une edition inachevee (on a insere une glose sans retirer la parenthese
// preexistante).
//
// PREMIERE SONDE, ABANDONNEE. Elle cherchait toute sequence de 4 mots repetee
// dans une fenetre de 40 mots, sur le texte entier. Resultat : 103 lecons sur
// 128. Inspection des resultats : ce sont des fragments de code
// (`docker run -d --network`), des en-tetes de tableau (« Livrable : les deux »),
// des blocs SQL. La sonde ne mesurait pas ce qu on cherchait, et elle n avait
// meme pas trouve le cas de database-migrations. Publiee ici pour memoire :
// 103/128 est un chiffre sans valeur, et c est pour cela qu il ne figure nulle
// part ailleurs.
//
// SONDE RETENUE. Elle retire les blocs de code, le code en ligne, les tableaux,
// les citations et les titres, puis cherche une sequence de 4 mots ou plus
// repetee A L INTERIEUR D UNE MEME PHRASE. Resultat : 20 lecons.
//
// ET LA SONDE NE TRANCHE PAS. Sur ces 20, la lecture des formulations en
// classe 19 comme du PARALLELISME DELIBERE, qui est une qualite :
//
//   « Un test doit echouer pour la bonne raison et passer pour la bonne raison. »
//   « Un dixieme ne s ecrit pas exactement en base deux, comme un tiers ne
//     s ecrit pas exactement en base dix. »
//   « Un paradoxe de Simpson mesure sur un million de cas reste un paradoxe de
//     Simpson. »
//
// C est exactement ce que le CP2 avait anticipe : une signature editoriale
// commune est une qualite, pas un defaut. Un seul cas sur 20 est un vrai
// defaut, et il se reconnait a un signe que la sonde ne voit pas : les deux
// occurrences portent une ponctuation DIFFERENTE.
//
//   node scripts/v71/glose-dupliquee.mjs

import fs from 'node:fs';
import path from 'node:path';

const prose = (t) => {
  const sansBlocs = t.replace(/```[\s\S]*?```/g, '');
  const lignes = sansBlocs.split('\n').filter((l) => !/^\s*[|>#]/.test(l));
  return lignes.join(' ').replace(/`[^`]*`/g, '').replace(/\s+/g, ' ');
};

const fichiers = fs.readdirSync('curriculum/lessons').filter((f) => f.endsWith('.md')).sort();
const trouves = [];

for (const f of fichiers) {
  const p = prose(fs.readFileSync(path.join('curriculum/lessons', f), 'utf8'));
  for (const phrase of p.split(/(?<=[.!?])\s+/)) {
    if (phrase.length > 400) continue;
    const mots = phrase.split(' ').filter(Boolean);
    let hit = null;
    for (let i = 0; i + 4 <= mots.length; i++) {
      const seq = mots.slice(i, i + 4).join(' ');
      if (seq.length < 20) continue;
      if (mots.slice(i + 4).join(' ').toLowerCase().includes(seq.toLowerCase())) { hit = seq; break; }
    }
    if (hit) { trouves.push({ lecon: f.slice(0, -3), sequence: hit, phrase: phrase.trim() }); break; }
  }
}

console.log(`\nGloses de 4+ mots repetees dans une meme phrase, en prose : ${trouves.length} lecons\n`);
console.log('La sonde DETECTE. Elle ne dit pas si c est un defaut : le parallelisme');
console.log('delibere produit la meme signature. Lire chaque phrase.\n');
for (const t of trouves) {
  console.log(`${t.lecon}`);
  console.log(`  « ${t.sequence} »`);
  console.log(`  ${t.phrase.slice(0, 220)}\n`);
}
console.log('Verdict de lecture au CP3 : 19 paralleles deliberes, 1 defaut reel');
console.log('(database-migrations — meme glose, deux ponctuations, edition inachevee).');
