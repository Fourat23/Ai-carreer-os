// V71 CP3 — lecteur de lot.
//
// Présente, pour chaque leçon d'un lot, les sections que le contrat gelé (§1)
// définit comme constitutives de « lire » : problème d'ouverture, objectif,
// prérequis, modèle mental, noyau explicatif, exemple guidé, pratique(s),
// correction(s), transfert professionnel.
//
// Les sections d'appoint — vocabulaire, checklist, questions d'entretien, liens
// avec le programme, à retenir — sont listées par leur titre et leur longueur,
// mais leur corps n'est pas imprimé : le contrat dit qu'elles n'entrent dans
// aucune note à elles seules.
//
//   node scripts/v71/lire-lot.mjs <numero-de-lot>

import fs from 'node:fs';

const APPOINT = /^(📚 )?vocabulaire|checklist|questions d entretien|liens avec le programme|a retenir|concepts cles|pourquoi c est important|securite$/;

const norm = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
const mots = (t) => (t.match(/[\p{L}\p{N}][\p{L}\p{N}"’-]*/gu) || []).length;

const ordre = JSON.parse(fs.readFileSync('docs/v71/ordre-lecture.json', 'utf8'));
const n = Number(process.argv[2] || 1);
const lot = ordre.slice((n - 1) * 8, n * 8);

for (const r of lot) {
  const t = fs.readFileSync(`curriculum/lessons/${r.slug}.md`, 'utf8');
  const parts = t.split(/^## /m);
  console.log('\n' + '='.repeat(78));
  console.log(`${r.slug}   [${r.dom}]   ${r.prog ? `parcours, ${r.nJours} j, dès ${r.j1}` : 'HORS PARCOURS'}   ${mots(t)} mots`);
  console.log('='.repeat(78));
  const appoint = [];
  for (const p of parts.slice(1)) {
    const titre = p.split('\n')[0];
    const corps = p.split('\n').slice(1).join('\n').trim();
    if (APPOINT.test(norm(titre))) { appoint.push(`${titre} (${mots(corps)}m)`); continue; }
    console.log(`\n## ${titre}   [${mots(corps)} mots]`);
    console.log(corps);
  }
  if (appoint.length) console.log(`\n-- sections d'appoint non imprimées : ${appoint.join(' · ')}`);
}
