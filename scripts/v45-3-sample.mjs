import { readFileSync } from 'node:fs';
const L = JSON.parse(readFileSync('docs/audits/V45-2-LESSON-LEDGER.json','utf8')).lessons;
const orderTxt = readFileSync('/tmp/claude-0/-home-user-Ai-carreer-os/79d55860-21ac-5b1a-91c6-5b6622f4a502/scratchpad/lesson-order.txt','utf8').trim().split('\n');
const domain = {};
for (const line of orderTxt){ const m=line.match(/^\d+\s+(\S+)\s+\|\s+(.+?)\s+\|/); if(m) domain[m[1]]=m[2]; }
const by = Object.fromEntries(L.map(l=>[l.slug,l]));

// deterministic PRNG (mulberry32), seed documented
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const SEED = 45032025;
const rand = mulberry32(SEED);

const pick = new Map(); // slug -> reasons[]
const add=(slug,reason)=>{ if(!by[slug]) throw new Error('unknown '+slug); if(!pick.has(slug)) pick.set(slug,[]); pick.get(slug).push(reason); };

// A. 7 MINOR_FIX
for (const s of ['pandas-data-wrangling','observability-logging','rag-evaluation','prompt-injection-defense','iac-fundamentals','docker-containers','ci-cd']) add(s,'MINOR_FIX V45.2');
// B. central graph nodes
for (const s of ['javascript-basics','http-rest-json','sql-foundations','llm-fundamentals']) add(s,'noeud central du graphe');
// C. first-contact fundamentals
for (const s of ['typescript-basics','git-fundamentals','linux-filesystem-permissions','html-semantic-structure','react-fundamentals','python-foundations']) add(s,'fondamental premier-contact');
// D. advanced domains
for (const s of ['k8s-security','ai-security','machine-learning-basics','neural-networks','retrieval-reranking','agents-fundamentals','system-design-interview']) add(s,'domaine avancé');
// E. length + density + "excellent"
const sorted=[...L].sort((a,b)=>a.wordCount-b.wordCount);
for (const l of sorted.slice(0,3)) add(l.slug,`parmi les 3 plus courtes (${l.wordCount} mots)`);
for (const l of sorted.slice(-3)) add(l.slug,`parmi les 3 plus longues (${l.wordCount} mots)`);
for (const s of ['transformers','database-transactions-concurrency','resilience-patterns']) add(s,'forte densité conceptuelle');
for (const s of ['embeddings','postmortem-rca','metrics-percentiles']) add(s,'supposée particulièrement excellente');
// F. >=4 deterministic random from the remaining pool
const chosen=new Set(pick.keys());
const pool=L.map(l=>l.slug).filter(s=>!chosen.has(s));
for(let i=pool.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
for (const s of pool.slice(0,4)) add(s,`aléatoire déterministe (seed ${SEED})`);

// output table
const rows=[...pick.entries()].map(([slug,reasons])=>({slug,pos:by[slug].curriculumPosition,words:by[slug].wordCount,domain:domain[slug]||'?',reasons}));
rows.sort((a,b)=>a.pos-b.pos);
console.log('TOTAL UNIQUE:', rows.length);
console.log('SEED:', SEED);
// domain coverage
const doms=new Set(rows.map(r=>r.domain)); console.log('DOMAINES:', doms.size);
for(const r of rows) console.log(`${String(r.pos).padStart(3,'0')} | ${r.slug} | ${r.words}w | ${r.domain} | ${r.reasons.join(' ; ')}`);
