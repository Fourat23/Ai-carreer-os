// V70 CP3 — ledger des 128 leçons + classement P0→PASS.
import fs from 'node:fs';
import { CORPUS } from './extract.mjs';

const DOM = (s) =>
  /^(cloud|iac)/.test(s) ? 'Cloud' :
  /^k8s/.test(s) ? 'Kubernetes' :
  /^(nextjs|css|responsive)/.test(s) ? 'Frontend-hors' :
  /^(react|html|web-|frontend|browser|accessib|typescript-frontend)/.test(s) ? 'Frontend' :
  /^(docker|linux|networking|ci-cd|deployment|release|observability|slo|incident|postmortem|metrics|sre|terminal)/.test(s) ? 'Systèmes' :
  /^(sql|database|data-|etl|pandas|statistics|feature|model-|machine|neural|deep)/.test(s) ? 'Données & ML' :
  /^(llm|prompt|embeddings|rag|transformers|agent|ai-)/.test(s) ? 'IA appliquée' :
  /^(http|api|express|auth|caching|async-mess|breaking|architecture|error-handl|security|owasp|api-prod)/.test(s) ? 'Web & Backend' :
  /^(interview|portfolio|technical-|career|communication|freelance|negoc|cv-)/.test(s) ? 'Carrière' :
  'Fondations';

const pen = (l) => {
  const d = [];
  if (l.lGuide < 120) d.push(['B2 exemple guidé sans décision', 3]);
  else if (l.lGuide < 250) d.push(['exemple guidé court', 1]);
  if (l.gabaritB) d.push(['gabarit Énoncé/Raisonnement', 2]);
  if (!l.aCorr) d.push(['B4 aucune correction', 3]);
  else if (l.corrSeuleReponse) d.push(['B4 correction = réponse seule', 2]);
  else if (!l.corrRaisonne) d.push(['correction sans raisonnement', 2]);
  if (!l.aExo) d.push(['B3 aucune pratique', 3]);
  else if (!l.exoLivrable) d.push(['B3 pratique sans production', 2]);
  else if (l.lExo < 40) d.push(['pratique maigre', 1]);
  if (!l.aMetier) d.push(['aucun cas professionnel', 1]);
  if (l.lExplic < 250) d.push(['noyau explicatif mince', 2]);
  if (l.blocsCode === 0) d.push(['aucun exemple concret', 1]);
  if (!l.programmee) d.push(['hors parcours', 1]);
  return d;
};
const prio = (s) => s >= 9 ? 'P0' : s >= 6 ? 'P1' : s >= 3 ? 'P2' : s >= 1 ? 'P3' : 'PASS';

const L = CORPUS.map((l) => {
  const d = pen(l), s = d.reduce((n, [, p]) => n + p, 0);
  return { ...l, dom: DOM(l.slug), defauts: d, score: s, prio: prio(s),
    bloquants: d.filter(([n]) => /^B\d/.test(n)).map(([n]) => n.slice(0, 2)) };
});

// lots CP4→CP9
const LOT = (l) => ({ 'Cloud': 4, 'Kubernetes': 4, 'Frontend-hors': 5, 'Frontend': 5,
  'Web & Backend': 6, 'Données & ML': 6, 'IA appliquée': 7, 'Systèmes': 8 }[l.dom] ?? 9);
L.forEach((l) => { l.lot = l.prio === 'PASS' ? null : LOT(l); });

fs.writeFileSync('docs/v70/ledger.json', JSON.stringify(L.map(({ secs, titres, ...r }) => r), null, 1));

let md = `# V70 — Ledger du corpus (128 leçons)

Classement établi au CP3, **avant** toute réécriture, à partir de défauts
**observables** (\`scripts/v70/cp3-ledger.mjs\`). Le score classe l'urgence ; il ne
note pas la qualité pédagogique — celle-ci se juge par lecture au moment de la
réécriture, avec le barème gelé (\`docs/V70-ACADEMIC-CONTRACT-FROZEN.md\`).

Pénalités : exemple guidé <120 mots (3) · aucune correction (3) · aucune pratique (3) ·
gabarit Énoncé/Raisonnement (2) · correction = réponse seule (2) · pratique sans
production (2) · noyau explicatif <250 mots (2) · exemple guidé <250 mots (1) ·
pratique <40 mots (1) · aucun cas professionnel (1) · aucun code (1) · hors parcours (1).

Priorités : **P0** ≥9 · **P1** 6-8 · **P2** 3-5 · **P3** 1-2 · **PASS** 0.

| priorité | leçons | lot de traitement |
|---|---:|---|
`;
for (const p of ['P0','P1','P2','P3','PASS']) md += `| ${p} | ${L.filter(l=>l.prio===p).length} | ${p==='PASS'?'—':'CP4→CP9'} |\n`;
md += `\n**${L.filter(l=>l.prio!=='PASS'&&l.prio!=='P3').length} leçons P0+P1+P2 à réécrire** ; ${L.filter(l=>l.prio==='P3').length} P3 à examiner ; ${L.filter(l=>l.prio==='PASS').length} PASS.\n\n`;

md += `## Répartition par lot\n\n| lot | CP | domaines | leçons | dont P0 | dont P1 | dont P2 |\n|---|---|---|---:|---:|---:|---:|\n`;
const noms = {4:'Cloud & Kubernetes',5:'Frontend, Next.js, CSS',6:'Web, backend, données',7:'IA appliquée, LLM, RAG, agents',8:'Systèmes, réseau, observabilité',9:'Fondations, carrière'};
for (const n of [4,5,6,7,8,9]) {
  const g = L.filter(l=>l.lot===n);
  md += `| ${n-3} | CP${n} | ${noms[n]} | ${g.length} | ${g.filter(l=>l.prio==='P0').length} | ${g.filter(l=>l.prio==='P1').length} | ${g.filter(l=>l.prio==='P2').length} |\n`;
}

md += `\n## Ledger détaillé\n\n| leçon | domaine | prio | lot | bloq. | guidé | exo | corr | parcours | défauts |\n|---|---|---|---|---|---:|---:|---:|---|---|\n`;
L.sort((a,b)=>b.score-a.score||a.slug.localeCompare(b.slug)).forEach((l)=>{
  md += `| \`${l.slug}\` | ${l.dom} | **${l.prio}** | ${l.lot?'CP'+l.lot:'—'} | ${l.bloquants.join(' ')||'—'} | ${l.lGuide} | ${l.lExo} | ${l.lCorr} | ${l.programmee?'oui':'**non**'} | ${l.defauts.map(([n])=>n).join(' · ')||'aucun'} |\n`;
});
fs.writeFileSync('docs/V70-CORPUS-LEDGER.md', md);

console.log('=== RÉPARTITION ===');
for (const p of ['P0','P1','P2','P3','PASS']) console.log(`   ${p.padEnd(5)} ${String(L.filter(l=>l.prio===p).length).padStart(3)}`);
console.log('\n=== LOTS ===');
for (const n of [4,5,6,7,8,9]) { const g=L.filter(l=>l.lot===n);
  console.log(`   CP${n} ${noms[n].padEnd(34)} ${String(g.length).padStart(3)} leçons  (P0 ${g.filter(l=>l.prio==='P0').length} · P1 ${g.filter(l=>l.prio==='P1').length} · P2 ${g.filter(l=>l.prio==='P2').length} · P3 ${g.filter(l=>l.prio==='P3').length})`);
}
console.log(`   ${'PASS (non traitées)'.padEnd(38)} ${String(L.filter(l=>!l.lot).length).padStart(3)}`);
console.log(`\n   TOTAL à traiter : ${L.filter(l=>l.lot).length}`);
