// V72 CP3 — motifs editoriaux mecaniques a l echelle des 128 lecons.
import { readFileSync, readdirSync } from 'node:fs';
const files = readdirSync('curriculum/lessons').filter((f) => f.endsWith('.md')).sort();
const sect = (md, t) => { const i = md.indexOf(t); if (i < 0) return null;
  const j = md.indexOf('\n## ', i + 1); return md.slice(i, j < 0 ? md.length : j); };
// 1. « Cette lecon t apprend / te donne / te fait » — formule de cloture d ouverture
const CLOTURE = /Cette leçon (t'apprend|te donne|te fait|installe|explique|suit|ouvre|présente|te montre|construit)/g;
// 2. « Objectif » qui reprend le titre
const stats = { cloture: 0, memePhrase: {}, ouvertureIdentique: 0 };
const premieres = new Map(), clotures = new Map();
let sansPourquoi = 0, sansMM = 0;
for (const f of files) {
  const md = readFileSync(`curriculum/lessons/${f}`, 'utf8');
  const slug = f.replace(/\.md$/, '');
  const p = sect(md, "## 🌍 Le problème d'abord");
  const o = sect(md, '## 🎯 Objectif');
  const m = sect(md, '## 🧠 Modèle mental');
  const w = sect(md, "## 💡 Pourquoi c'est important");
  if (!w) sansPourquoi++;
  if (!m) sansMM++;
  if (p) { const c = [...p.matchAll(CLOTURE)]; if (c.length) { stats.cloture++; clotures.set(slug, c[0][0]); } }
  // premiere phrase de l ouverture : motif d accroche
  if (p) {
    const ph = p.split('\n').slice(1).join(' ').trim().split(/(?<=[.!?])\s/)[0] ?? '';
    const motif = ph.replace(/[^A-Za-zÀ-ÿ' ]/g, ' ').trim().split(/\s+/).slice(0, 2).join(' ').toLowerCase();
    premieres.set(motif, (premieres.get(motif) ?? 0) + 1);
  }
  // titre vs objectif
  const titre = (md.match(/^# Leçon — (.+)$/m) ?? [, ''])[1].toLowerCase();
  if (o && titre) {
    const mots = titre.split(/[^a-zà-ÿ]+/).filter((x) => x.length >= 5);
    const dans = mots.filter((x) => o.toLowerCase().includes(x)).length;
    if (mots.length >= 2 && dans === mots.length) stats.memePhrase[slug] = titre;
  }
}
console.log(`sections presentes : Pourquoi c est important absent dans ${sansPourquoi} lecons · Modele mental absent dans ${sansMM}`);
console.log(`\n1. Formule de cloture « Cette leçon … » dans le probleme d abord : ${stats.cloture} / 128`);
const parVerbe = {};
for (const [, v] of clotures) { const k = v.replace(/Cette leçon /, ''); parVerbe[k] = (parVerbe[k] ?? 0) + 1; }
console.log('   ' + Object.entries(parVerbe).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}=${n}`).join(' · '));
console.log(`\n2. Deux premiers mots de l accroche — motifs vus 4 fois ou plus :`);
[...premieres].filter(([, n]) => n >= 4).sort((a, b) => b[1] - a[1]).forEach(([m, n]) => console.log(`   ${String(n).padStart(3)}  « ${m}… »`));
console.log(`\n3. Objectif qui reprend tous les mots porteurs du titre : ${Object.keys(stats.memePhrase).length}`);
Object.entries(stats.memePhrase).slice(0, 10).forEach(([s, t]) => console.log(`   ${s.padEnd(32)} « ${t} »`));
