// V71 — CP13. Détection du mécanisme de répétition trouvé par l'audit aveugle.
//
// CE QUE L AUDIT AVEUGLE A TROUVE. Sur les 32 lecons de l echantillon gele, 17 ont
// vu leur note D14 baisser de 5 a 4 (une a 3), toujours pour la meme raison : les
// sections d ouverture — « 🌍 Le probleme d abord », « 🎯 Objectif », « 🧠 Modele
// mental », « 💡 Pourquoi c est important » — reenoncent la MEME affirmation, parfois
// mot pour mot. Le CP3 n avait pas penalise ce motif ; l ancre D14 = 4 le decrit
// pourtant : « quelques longueurs ou une formule de remplissage ».
//
// CE QUE FAIT CETTE SONDE. Elle mesure le recouvrement lexical entre ces quatre
// sections, deux a deux, sur les mots PORTEURS (>= 5 lettres, hors mots-outils). Un
// recouvrement eleve signale une paire de sections qui disent la meme chose.
//
// CE QU ELLE NE PROUVE PAS. Deux sections peuvent partager du vocabulaire sans se
// repeter — c est meme normal, elles parlent du meme sujet. Seule la lecture tranche
// si la reformulation APPORTE quelque chose. Cette sonde produit un ordre de lecture.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SECTIONS = ["Le problème d'abord", 'Objectif', 'Modèle mental', "Pourquoi c'est important"];
const OUTILS = new Set(['leçon', 'lecon', 'cette', 'celui', 'celle', 'ceux', 'toutes', 'toute',
  'quand', 'comme', 'plus', 'moins', 'aussi', 'donc', 'mais', 'pour', 'dans', 'avec', 'sans',
  'entre', 'chaque', 'entre', 'entre', 'faire', 'faut', 'peut', 'sait', 'savoir', 'comprendre',
  'apprend', 'apprends', 'apprendre', 'ensuite', 'alors', 'parce', 'quelque', 'quelques']);

const sansAccent = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const mots = (t) => new Set(
  sansAccent(t.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`\n]*`/g, ' '))
    .split(/[^a-z0-9]+/).filter((w) => w.length >= 5 && !OUTILS.has(w)));

const jaccard = (a, b) => {
  const inter = [...a].filter((w) => b.has(w)).length;
  const union = new Set([...a, ...b]).size;
  return union ? inter / union : 0;
};

const lignes = [];
for (const f of readdirSync('curriculum/lessons').filter((x) => x.endsWith('.md')).sort()) {
  const md = readFileSync(join('curriculum/lessons', f), 'utf8');
  const blocs = {};
  let cour = null;
  for (const l of md.split('\n')) {
    if (/^## /.test(l)) {
      cour = SECTIONS.find((s) => l.includes(s)) ?? null;
      if (cour) blocs[cour] = '';
    } else if (cour) blocs[cour] += l + '\n';
  }
  const paires = [];
  const noms = Object.keys(blocs);
  for (let i = 0; i < noms.length; i++) {
    for (let j = i + 1; j < noms.length; j++) {
      const s = jaccard(mots(blocs[noms[i]]), mots(blocs[noms[j]]));
      if (s >= 0.20) paires.push({ a: noms[i], b: noms[j], s });
    }
  }
  if (paires.length) {
    paires.sort((x, y) => y.s - x.s);
    lignes.push({ slug: f.replace(/\.md$/, ''), max: paires[0].s, paires });
  }
}
lignes.sort((a, b) => b.max - a.max);

console.log(`Recouvrement lexical >= 0,20 entre deux sections d ouverture`);
console.log(`Lecons concernees : ${lignes.length} / 128\n`);
for (const l of lignes) {
  const p = l.paires.map((x) => `${x.a} ~ ${x.b} : ${x.s.toFixed(2)}`).join('  |  ');
  console.log(`  ${l.slug.padEnd(34)} ${p}`);
}
console.log('\nORDRE DE LECTURE. Un recouvrement eleve n est PAS un defaut : deux sections');
console.log('qui parlent du meme sujet partagent forcement du vocabulaire. La question que');
console.log('seule la lecture tranche est : la seconde APPORTE-T-ELLE quelque chose ?');
