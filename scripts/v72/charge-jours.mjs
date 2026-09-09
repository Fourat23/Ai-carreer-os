// V72 CP0 — CHARGE PLAUSIBLE des 365 journees, en FOURCHETTES.
//
// Principe : ne PAS deduire le temps de pratique d un nombre de mots. La lecture se
// mesure ; la pratique s ESTIME a partir de la consigne (nombre d etapes), du livrable,
// de la difficulte annoncee. On produit un intervalle bas/haut, jamais une minute exacte.
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
// fourchette de pratique : base selon difficulte + increment par etape au-dela de 3
const BASE = { 1: [25, 45], 2: [35, 60], 3: [50, 90], 4: [70, 120] };
const PAR_ETAPE = [8, 15];

const lignes = [];
for (const d of prog.days) {
  const f = `curriculum/days/day-${n3(d.day)}.md`;
  if (!existsSync(f)) continue;
  const md = readFileSync(f, 'utf8');
  const fs2 = `curriculum/solutions/day-${n3(d.day)}-solution.md`;
  const sol = existsSync(fs2) ? readFileSync(fs2, 'utf8') : '';
  const slugs = [...new Set([...md.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))];
  const lec = slugs.map((s) => existsSync(`curriculum/lessons/${s}.md`) ? readFileSync(`curriculum/lessons/${s}.md`, 'utf8') : '');

  const tLect = minutesLecture([md, ...lec, sol].join('\n'));
  const guide = section(md, '## 🧭 Exemple guidé');
  const tGuide = minutesLecture(guide);              // suivre l exemple = le relire en faisant
  const prat = section(md, '## ✍️ Pratique autonome') || section(md, '## 🔁 Revue hebdomadaire');
  const etapes = Math.max((prat.match(/^\s*\d+[.)]\s/gm) ?? []).length,
                          (prat.match(/^\s*\*\*[A-E][.)]/gm) ?? []).length);
  // minutage explicite : s il existe, il fait foi (les revues en portent un)
  const explicites = [...prat.matchAll(/(\d{1,3})\s*min\b/g)].map((m) => Number(m[1]));
  const sommeExpl = explicites.reduce((a, b) => a + b, 0);

  const [b0, b1] = BASE[d.difficulty] ?? BASE[3];
  const sup = Math.max(0, etapes - 3);
  let pBas = b0 + sup * PAR_ETAPE[0], pHaut = b1 + sup * PAR_ETAPE[1];
  if (sommeExpl >= 30) { pBas = Math.max(pBas, sommeExpl); pHaut = Math.max(pHaut, Math.round(sommeExpl * 1.4)); }

  const reflex = /Questions de réflexion/.test(md) ? [10, 20] : [0, 0];
  const bas = Math.round(tLect + tGuide * 0.5 + pBas + reflex[0]);
  const haut = Math.round(tLect + tGuide * 1.5 + pHaut + reflex[1]);
  const budget = Math.round(d.hours * 60);
  const cat = bas > budget ? 'IMPOSSIBLE' : haut > budget ? 'HEAVY' : haut < budget * 0.55 ? 'UNDERLOADED' : 'BALANCED';
  lignes.push({ j: d.day, rev: !!d.isReview, titre: d.title, budget, lect: Math.round(tLect), etapes, bas, haut, cat, nlec: slugs.length, diff: d.difficulty });
}

const cnt = {}; for (const l of lignes) cnt[l.cat] = (cnt[l.cat] ?? 0) + 1;
console.log('CATEGORIES DE CHARGE (fourchette basse > budget = IMPOSSIBLE)');
console.log(JSON.stringify(cnt, null, 1));
const par = (c) => lignes.filter((l) => l.cat === c);
const f = (l) => `  j${String(l.j).padStart(3)} ${l.rev ? 'REV' : '   '} budget ${l.budget}  lecture ${String(l.lect).padStart(3)}  charge ${String(l.bas).padStart(3)}-${String(l.haut).padStart(3)}  ${l.nlec} lec  ${l.titre.slice(0, 44)}`;
for (const c of ['IMPOSSIBLE', 'HEAVY']) {
  console.log(`\n=== ${c} (${par(c).length})`);
  par(c).sort((a, b) => b.bas - a.bas).slice(0, 30).forEach((l) => console.log(f(l)));
}
console.log(`\n=== UNDERLOADED (${par('UNDERLOADED').length}) — 12 premieres`);
par('UNDERLOADED').sort((a, b) => a.haut - b.haut).slice(0, 12).forEach((l) => console.log(f(l)));
console.log(`\nrevues : ${JSON.stringify(lignes.filter((l)=>l.rev).reduce((a,l)=>{a[l.cat]=(a[l.cat]??0)+1;return a;},{}))}`);
console.log(`normales : ${JSON.stringify(lignes.filter((l)=>!l.rev).reduce((a,l)=>{a[l.cat]=(a[l.cat]??0)+1;return a;},{}))}`);
