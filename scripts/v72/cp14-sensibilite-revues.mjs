// V72 CP14 — la conclusion « 6 revues sont IMPOSSIBLES » tient-elle à une hypothèse
// de mon propre instrument ?
//
// Le modèle de charge du CP0 compte le texte des leçons liées à 150 mots/minute, comme
// une lecture à froid. Or une revue dit « leçons de fond à RELIRE » : le lecteur a déjà
// lu ces textes dans la semaine. Relire n'est pas lire.
//
// Ce script REJOUE le calcul avec un coefficient de relecture variable et publie la
// sensibilité du résultat, au lieu de choisir un coefficient et de présenter le chiffre
// obtenu comme un fait. Rien n'est corrigé ici : c'est une mesure de robustesse.
import { readFileSync, existsSync } from 'node:fs';
const prog = JSON.parse(readFileSync('data/program.json', 'utf8'));
const n3 = (n) => String(n).padStart(3, '0');

const minutesLecture = (md) => {
  const s = md.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`\n]*`/g, ' ');
  const m = s.split(/\s+/).filter(Boolean).length;
  const c = [...md.matchAll(/```[\s\S]*?```/g)].map((x) => Math.max(0, x[0].split('\n').length - 2)).reduce((a, b) => a + b, 0);
  return m / 150 + c / 20;
};
const section = (md, titre) => {
  const i = md.indexOf(titre); if (i < 0) return '';
  const j = md.indexOf('\n## ', i + 1);
  return md.slice(i, j < 0 ? md.length : j);
};
const BASE = { 1: [25, 45], 2: [35, 60], 3: [50, 90], 4: [70, 120] };
const PAR_ETAPE = [8, 15];

// coefficient appliqué au SEUL texte des leçons liées d'une journée de revue
const COEFS = [1.0, 0.75, 0.5, 0.35, 0.25];
const res = new Map(COEFS.map((c) => [c, { IMPOSSIBLE: 0, HEAVY: 0, BALANCED: 0, UNDERLOADED: 0 }]));
const part = [];

for (const d of prog.days) {
  const f = `curriculum/days/day-${n3(d.day)}.md`; if (!existsSync(f)) continue;
  const md = readFileSync(f, 'utf8');
  const fs2 = `curriculum/solutions/day-${n3(d.day)}-solution.md`;
  const sol = existsSync(fs2) ? readFileSync(fs2, 'utf8') : '';
  const slugs = [...new Set([...md.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))];
  const texteLecons = slugs.map((s) => existsSync(`curriculum/lessons/${s}.md`) ? readFileSync(`curriculum/lessons/${s}.md`, 'utf8') : '').join('\n');

  const tJour = minutesLecture([md, sol].join('\n'));      // le texte propre de la journée
  const tLecons = minutesLecture(texteLecons);             // le texte des leçons liées
  const guide = section(md, '## 🧭 Exemple guidé');
  const tGuide = minutesLecture(guide);
  const prat = section(md, '## ✍️ Pratique autonome') || section(md, '## 🔁 Revue hebdomadaire');
  const etapes = Math.max((prat.match(/^\s*\d+[.)]\s/gm) ?? []).length, (prat.match(/^\s*\*\*[A-E][.)]/gm) ?? []).length);
  const expl = [...prat.matchAll(/(\d{2,3})\s*min/g)].map((m) => +m[1]);
  const sommeExpl = expl.reduce((a, b) => a + b, 0);
  const [b0, b1] = BASE[d.difficulty] ?? BASE[3];
  const sup = Math.max(0, etapes - 3);
  let pBas = b0 + sup * PAR_ETAPE[0], pHaut = b1 + sup * PAR_ETAPE[1];
  if (sommeExpl >= 30) { pBas = Math.max(pBas, sommeExpl); pHaut = Math.max(pHaut, Math.round(sommeExpl * 1.4)); }
  const reflex = /Questions de réflexion/.test(md) ? [10, 20] : [0, 0];
  const budget = Math.round(d.hours * 60);

  for (const coef of COEFS) {
    const k = d.isReview ? coef : 1;                       // le coefficient ne touche QUE les revues
    const tLect = tJour + tLecons * k;
    const bas = Math.round(tLect + tGuide * 0.5 + pBas + reflex[0]);
    const haut = Math.round(tLect + tGuide * 1.5 + pHaut + reflex[1]);
    const cat = bas > budget ? 'IMPOSSIBLE' : haut > budget ? 'HEAVY' : haut < budget * 0.55 ? 'UNDERLOADED' : 'BALANCED';
    res.get(coef)[cat]++;
    if (coef === 1 && d.isReview) part.push({ j: d.day, tJour: Math.round(tJour), tLecons: Math.round(tLecons), n: slugs.length, budget, minute: sommeExpl });
  }
}

console.log('SENSIBILITÉ — le coefficient ne s applique qu au texte des leçons RELUES en revue\n');
console.log('coef relecture | IMPOSSIBLE | HEAVY | BALANCED | UNDERLOADED');
for (const c of COEFS) {
  const r = res.get(c);
  console.log(`${String(c).padEnd(14)} | ${String(r.IMPOSSIBLE).padStart(10)} | ${String(r.HEAVY).padStart(5)} | ${String(r.BALANCED).padStart(8)} | ${String(r.UNDERLOADED).padStart(11)}`);
}

const moyLec = part.reduce((a, p) => a + p.tLecons, 0) / part.length;
const moyJour = part.reduce((a, p) => a + p.tJour, 0) / part.length;
console.log(`\n52 revues : texte propre de la journée ${moyJour.toFixed(0)} min en moyenne · texte des leçons reliées ${moyLec.toFixed(0)} min`);
console.log(`part de la relecture dans la lecture d une revue : ${(100 * moyLec / (moyLec + moyJour)).toFixed(0)} %`);
const minutees = part.filter((p) => p.minute >= 30).length;
console.log(`revues dont la pratique est explicitement minutée : ${minutees} / 52 · somme moyenne annoncée ${Math.round(part.filter((p) => p.minute >= 30).reduce((a, p) => a + p.minute, 0) / Math.max(1, minutees))} min`);
