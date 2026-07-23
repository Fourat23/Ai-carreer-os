// Outil d'analyse de similarité pour le déploiement Y2 (non pédagogique, non importé par le générateur).
// Usage : node scripts/data/_reflection_simcheck.mjs <fichier-source-du-batch.mjs>
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd());
const batchFile = process.argv[2];
if (!batchFile) { console.error('usage: node _reflection_simcheck.mjs <batchFile.mjs>'); process.exit(1); }

// sources déjà déployées (pour comparer le batch au reste)
const deployedFiles = [
  'scripts/data/days-enrich-reflection-pilot.mjs',
  'scripts/data/days-enrich-reflection-091-120.mjs',
];

async function loadReflections(rel) {
  const mod = await import(path.join(ROOT, rel));
  const obj = Object.values(mod)[0];
  const out = [];
  for (const [d, v] of Object.entries(obj)) (v.reflection || []).forEach((q, i) => out.push({ day: +d, idx: i + 1, text: q, file: rel }));
  return out;
}

const TECH = /\b(react|vitest|python|sql|3nf|1nf|2nf|tiktoken|bpe|json|chroma|chromadb|mlp|llm|rag|docsense|docqa|bibliapp|churnscope|datapulse|taskflow|livreapi|readme|git|github|linkedin|api|token|tokens|embedding|embeddings|vecteur|vecteurs|chunk|chunks|chunking|golden|prompt|prompts|cv|useeffect|usestate|usememo|usecallback|context|hook|hooks|fetch|crud|adr)\b/g;
const STOP = new Set('le la les un une des de du au aux et ou en dans pour par sur que qui quoi est sont ce cet cette ces tu te ton ta tes il elle on se sa son ses ne pas plus moins avec sans si mais donc car quand comme tout toute tous quel quelle quels vers chez entre a as ai fais fait faire va vais quel quelle plutot puis alors alors ceci cela'.split(/\s+/));
function norm(s){ return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[0-9]+/g,' ').replace(TECH,' ').replace(/[^a-z ]/g,' ').split(/\s+/).filter(w=>w && !STOP.has(w)); }
function ngrams(t,n){ const g=new Set(); for(let i=0;i+n<=t.length;i++) g.add(t.slice(i,i+n).join('_')); return g; }
function jac(a,b){ if(!a.size||!b.size) return 0; let x=0; for(const e of a) if(b.has(e)) x++; return x/(a.size+b.size-x); }
function sim(t1,t2){ return Math.max(jac(ngrams(t1,3),ngrams(t2,3)), jac(ngrams(t1,2),ngrams(t2,2))*0.9); }
function extractSection(md, header){ const parts=md.split(/\n(?=## )/); const m=parts.find(s=>s.startsWith('## ')&&s.includes(header)); return m?m.slice(m.indexOf('\n')+1).trim():''; }
function dayMd(n){ const p=String(n).padStart(3,'0'); return fs.readFileSync(path.join(ROOT,`curriculum/days/day-${p}.md`),'utf8'); }

const batch = await loadReflections(batchFile);
const batchDays = [...new Set(batch.map(q=>q.day))];
batch.forEach(q=>q.tok=norm(q.text));

// autres réflexions déjà déployées (hors ce batch)
let others=[];
for(const f of deployedFiles){ if(path.resolve(ROOT,f)===path.resolve(ROOT,batchFile)) continue; others=others.concat(await loadReflections(f)); }
others.forEach(q=>q.tok=norm(q.text));

// entretiens 313
const interviews=[];
for(let n=1;n<=365;n++){ const p=String(n).padStart(3,'0'); const f=path.join(ROOT,`curriculum/days/day-${p}.md`); if(!fs.existsSync(f)) continue; const iv=extractSection(fs.readFileSync(f,'utf8'),"Question d'entretien"); if(iv) interviews.push({day:n,tok:norm(iv)}); }

// exercices + cas métier des jours du batch
const exos={}, cases={};
for(const d of batchDays){ const md=dayMd(d); exos[d]=norm(extractSection(md,'Exercice principal')||extractSection(md,'Pratique autonome')); cases[d]=norm(extractSection(md,'Cas métier')); }

function topPairs(pairs,k=10){ return pairs.sort((a,b)=>b.sim-a.sim).slice(0,k); }

// 1) entre le batch
let p1=[]; for(let i=0;i<batch.length;i++)for(let j=i+1;j<batch.length;j++) p1.push({a:`${batch[i].day}.${batch[i].idx}`,b:`${batch[j].day}.${batch[j].idx}`,sim:sim(batch[i].tok,batch[j].tok)});
// 2) vs autres déployées
let p2=[]; for(const q of batch)for(const o of others) p2.push({a:`${q.day}.${q.idx}`,b:`refl${o.day}.${o.idx}`,sim:sim(q.tok,o.tok)});
// 3) vs entretiens
let p3=[]; for(const q of batch)for(const iv of interviews) p3.push({a:`${q.day}.${q.idx}`,b:`iv${iv.day}`,sim:sim(q.tok,iv.tok)});
// 4) vs exo même jour
let p4=[]; for(const q of batch) p4.push({a:`${q.day}.${q.idx}`,b:`exo${q.day}`,sim:sim(q.tok,exos[q.day]||[])});
// 5) vs cas métier même jour
let p5=[]; for(const q of batch) p5.push({a:`${q.day}.${q.idx}`,b:`cas${q.day}`,sim:sim(q.tok,cases[q.day]||[])});

const fmt=arr=>topPairs(arr).map(p=>`${p.a}~${p.b}=${p.sim.toFixed(2)}`).join('  ');
const max=arr=>arr.reduce((m,p)=>Math.max(m,p.sim),0).toFixed(3);
console.log(`=== SIMILARITÉ batch ${batchFile.split('/').pop()} (${batch.length} questions, ${batchDays.length} jours) ===`);
console.log('1) entre le batch      max=',max(p1),'\n   top10:',fmt(p1));
console.log('2) vs déjà déployées   max=',max(p2),'\n   top10:',fmt(p2));
console.log('3) vs 313 entretiens   max=',max(p3),'\n   top10:',fmt(p3));
console.log('4) vs exo du jour      max=',max(p4),'\n   top10:',fmt(p4));
console.log('5) vs cas du jour      max=',max(p5),'\n   top10:',fmt(p5));
// intégrité
console.log('=== INTÉGRITÉ ===');
console.log('questions:',batch.length,'| vides:',batch.filter(q=>q.text.trim().length<10).length,'| doublons exacts:',batch.length-new Set(batch.map(q=>q.text.trim())).size);
console.log('jours à 3 questions:',batchDays.filter(d=>batch.filter(q=>q.day===d).length===3).length,'/',batchDays.length);
