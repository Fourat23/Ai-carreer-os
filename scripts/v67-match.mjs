// V67 · P0 — CANDIDATS DE RATTACHEMENT. LECTURE SEULE.
//
// Règle de rattachement, énoncée AVANT de regarder les résultats :
//
//   Une leçon orpheline ne peut être rattachée qu'à une journée dont le COURS
//   enseigne déjà ce sujet. On ne déplace aucune journée, on n'en réécrit
//   aucune pour accueillir une leçon, et on n'invente aucun thème.
//
// Ce script ne rattache rien. Il classe, pour chaque leçon orpheline, les
// journées dont le cours partage le plus de vocabulaire avec elle — puis c'est
// une LECTURE qui tranche. Un score élevé n'est pas une preuve de pertinence :
// `docker-networking-volumes` et `k8s-networking-services` partagent beaucoup
// de mots sans être le même sujet.

import { readFileSync, readdirSync } from 'node:fs';

const P = JSON.parse(readFileSync('data/program.json', 'utf8'));
const prose = (t) => t.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ');

/** Termes distinctifs d'une leçon : son vocabulaire marqué, réduit aux mots. */
function termes(slug) {
  const md = readFileSync(`curriculum/lessons/${slug}.md`, 'utf8');
  const voc = /^##[^\n]*vocabulaire[\s\S]*?(?=^## |$(?![\s\S]))/im.exec(md)?.[0] ?? '';
  const src = voc || md.slice(0, 2000);
  const out = new Set();
  for (const m of src.matchAll(/\*\*([^*\n]{3,40})\*\*|`([^`\n]{3,40})`/g)) {
    for (const w of (m[1] ?? m[2]).toLowerCase().split(/[^a-zàâçéèêëîïôûùüÿñæœ0-9-]+/)) {
      if (w.length >= 4 && !STOP.has(w)) out.add(w);
    }
  }
  return out;
}
const STOP = new Set(['pour', 'dans', 'avec', 'sans', 'plus', 'moins', 'très', 'être', 'sont',
  'cette', 'chaque', 'entre', 'leur', 'quand', 'donc', 'mais', 'tout', 'tous', 'toute',
  'bases', 'base', 'niveau', 'type', 'types', 'code', 'test', 'tests']);

/** Prose du cours d'une journée. */
function coursDe(n) {
  let md = '';
  try { md = readFileSync(`curriculum/days/day-${String(n).padStart(3, '0')}.md`, 'utf8'); } catch { return ''; }
  const h = [...md.matchAll(/^## +(.+)$/gm)];
  const i = h.findIndex((m) => /cours approfondi/i.test(m[1]));
  if (i < 0) return prose(md).toLowerCase();
  return prose(md.slice(h[i].index, i + 1 < h.length ? h[i + 1].index : md.length)).toLowerCase();
}

const COURS = new Map(P.days.filter((d) => !d.isReview).map((d) => [d.day, coursDe(d.day)]));
const TITRE = new Map(P.days.map((d) => [d.day, d.title]));

export function candidats(slug, k = 5) {
  const T = [...termes(slug)];
  if (!T.length) return [];
  const out = [];
  for (const [day, txt] of COURS) {
    const n = T.filter((t) => txt.includes(t)).length;
    if (n) out.push({ day, n, part: n / T.length, titre: TITRE.get(day) });
  }
  return out.sort((a, b) => b.part - a.part || b.n - a.n).slice(0, k);
}

if (process.argv[1]?.endsWith('v67-match.mjs')) {
  const { stock } = await import('./v67-stock.mjs');
  const orph = stock().filter((x) => x.orpheline);
  for (const l of orph) {
    const c = candidats(l.slug, 4);
    console.log(`\n${l.slug}  (${[...termes(l.slug)].length} termes)`);
    for (const x of c) console.log(`   j.${String(x.day).padStart(3)}  ${(x.part * 100).toFixed(0).padStart(3)}%  ${x.n.toString().padStart(2)}  ${x.titre}`);
    if (!c.length) console.log('   — aucune journée ne partage son vocabulaire —');
  }
}
