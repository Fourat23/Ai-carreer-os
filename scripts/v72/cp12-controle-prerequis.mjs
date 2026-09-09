// V72 — invariant M5 : une leçon programmée n'exige pas, sans l'annoncer, une notion
// enseignée plus tard. L'anticipation ANNONCÉE est correcte (convention A du contrat) ;
// l'exigence NON signalée est un défaut (convention B).
import { readFileSync, readdirSync, existsSync } from 'node:fs';
const prog = JSON.parse(readFileSync('data/program.json', 'utf8'));
const n3 = (n) => String(n).padStart(3, '0');
const premier = new Map();
for (const d of prog.days) {
  const f = `curriculum/days/day-${n3(d.day)}.md`; if (!existsSync(f)) continue;
  for (const m of readFileSync(f, 'utf8').matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g))
    if (!premier.has(m[1])) premier.set(m[1], d.day);
}
// « annoncé » : la phrase qui cite la leçon dit qu'elle vient plus tard ou qu'elle est sur l'étagère
// Marqueurs de la classe A (anticipation correctement signalée), repris de la convention
// figée par V71 dans docs/v71/PREREQUIS-ORDRE.md : « aide », « éclaire », « viendra plus
// loin », « programmée au mois 5 », « utile mais rappelée ici ». S'y ajoutent les formes
// d'encadré introduites au CP11 de V71.
const ANNONCE = /plus loin|plus tard|programmée|étagère de référence|rien ici ne suppose|n'est programmée par aucune|\baide\b|\baident\b|éclaire|utile\b|idéalement|n'est pas supposé|aucune .* n'est supposée/i;
const defauts = [];
for (const f of readdirSync('curriculum/lessons').filter((x) => x.endsWith('.md'))) {
  const slug = f.slice(0, -3); const jour = premier.get(slug); if (jour === undefined) continue;
  const md = readFileSync(`curriculum/lessons/${f}`, 'utf8');
  const i = md.indexOf('## 🧩 Prérequis'); if (i < 0) continue;
  const j = md.indexOf('\n## ', i + 1);
  const pre = md.slice(i, j < 0 ? md.length : j);
  // Les annonces vivent dans un ENCADRÉ `>` de plusieurs lignes ; découper ligne à ligne
  // séparait la citation de la phrase qui l'annonce. On regroupe donc les lignes `>`
  // consécutives en un seul bloc, et le reste en un autre.
  const blocs = []; let courant = null, dansCitation = false;
  for (const ligne of pre.split('\n')) {
    const q = /^\s*>/.test(ligne);
    if (courant === null || q !== dansCitation) { courant = []; blocs.push(courant); dansCitation = q; }
    courant.push(ligne);
  }
  for (const bloc of blocs.map((b) => b.join('\n'))) {
    for (const m of bloc.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)) {
      const cible = premier.get(m[1]);
      if (cible === undefined || cible <= jour) continue;      // enseignée avant, ou hors parcours
      if (ANNONCE.test(bloc)) continue;                        // anticipation annoncée : correct
      defauts.push(`${slug} (jour ${jour}) exige ${m[1]}, enseignée au jour ${cible} — sans l'annoncer`);
    }
  }
}
console.log(`leçons programmées analysées : ${[...premier.keys()].length}`);
if (defauts.length) { console.log(`\n❌ ${defauts.length} prérequis exigé(s) avant d'être enseigné(s), sans annonce :`); for (const d of defauts) console.log('   - ' + d); process.exit(1); }
console.log('✅ aucun prérequis exigé avant enseignement sans annonce.');
