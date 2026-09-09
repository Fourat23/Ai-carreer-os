// V72 — invariant P1 : la pratique d'une leçon nomme ce qu'il faut produire.
// Un livrable nommé, OU un verbe de production avec son objet, OU un renvoi vers des
// exercices du produit qui existent (vérifié par curriculum:depth-check).
import { readFileSync, readdirSync, existsSync } from 'node:fs';
const PROD = /\b(écris|écrire|rédige|produis|construis|implémente|crée|conçois|code|dessine|mesure|chronomètre|ajoute|complète|refactor|corrige|livre|rends|remplis|classe|trie|documente|prépare|note les|liste|reproduis|sabote|compare|calcule)\b/i;
const LIV = /livrable|tu rends|tu produis|rends un|fichier\s+`/i;
const RENVOI = /`[a-z][a-z0-9]+(?:-[a-z0-9]+){1,4}`/;
const sect = (md, rx) => { let on = false, buf = [];
  for (const l of md.split('\n')) { if (l.startsWith('## ')) on = rx.test(l); else if (on) buf.push(l); } return buf.join('\n'); };
const RX = /pratique|mini-exercice|exercice|à toi de|ta production/i;
const ko = [];
for (const f of readdirSync('curriculum/lessons').filter((x) => x.endsWith('.md')).sort()) {
  const p = sect(readFileSync(`curriculum/lessons/${f}`, 'utf8'), RX);
  if (!LIV.test(p) && !PROD.test(p) && !RENVOI.test(p)) ko.push(f.slice(0, -3));
}
console.log(`leçons : ${readdirSync('curriculum/lessons').filter((x) => x.endsWith('.md')).length}`);
if (ko.length) { console.log(`\n❌ ${ko.length} leçon(s) dont la pratique ne dit pas quoi produire :`); for (const s of ko) console.log('   - ' + s); process.exit(1); }
console.log('✅ chaque pratique nomme un livrable, un geste de production, ou renvoie à un exercice.');
