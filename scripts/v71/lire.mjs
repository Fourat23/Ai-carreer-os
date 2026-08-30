// V71 CP3 — lecteur de leçons (slugs en arguments). Même règle que lire-lot.mjs.
import fs from 'node:fs';
const APPOINT = /^(📚 )?vocabulaire|checklist|questions d entretien|liens avec le programme|a retenir|concepts cles|pourquoi c est important|securite$|anti patterns$/;
const norm = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim().toLowerCase();
const mots = (t) => (t.match(/[\p{L}\p{N}][\p{L}\p{N}"’-]*/gu) || []).length;
const ordre = JSON.parse(fs.readFileSync('docs/v71/ordre-lecture.json','utf8'));
for (const slug of process.argv.slice(2)) {
  const r = ordre.find((x) => x.slug === slug) || { slug, dom: '?', prog: false };
  const t = fs.readFileSync(`curriculum/lessons/${slug}.md`, 'utf8');
  console.log('\n' + '='.repeat(76));
  console.log(`${slug}  [${r.dom}]  ${r.prog ? `parcours ${r.nJours}j dès ${r.j1}` : 'HORS PARCOURS'}  ${mots(t)} mots`);
  console.log('='.repeat(76));
  const app = [];
  for (const p of t.split(/^## /m).slice(1)) {
    const titre = p.split('\n')[0], corps = p.split('\n').slice(1).join('\n').trim();
    if (APPOINT.test(norm(titre))) { app.push(`${titre} (${mots(corps)}m)`); continue; }
    console.log(`\n## ${titre}   [${mots(corps)} mots]`);
    console.log(corps);
  }
  if (app.length) console.log(`\n-- appoint : ${app.join(' · ')}`);
}
