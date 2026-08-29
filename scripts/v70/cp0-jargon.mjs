// V70 CP0 — jargon, prérequis, temps pédagogique. LECTURE SEULE.
import fs from 'node:fs';
import { CORPUS, joursInfo, parLecon, mots } from './extract.mjs';

// --- 1. ACRONYMES utilisés sans être développés ----------------------------
// Un acronyme est « développé » si sa première occurrence est suivie ou précédée
// d'une parenthèse explicative, ou s'il figure dans le Vocabulaire de la leçon.
const IGNORE = new Set(['AI','OS','JS','TS','UI','UX','ID','OK','KO','NB','PS','TP','QCM','HTML','CSS','JSON','SQL','HTTP','HTTPS','API','URL','CPU','RAM','PDF','CSV','IDE','CLI','GPU','LLM','RAG','ML','IA','DOM','REST','NPM','GIT','TCP','IP','DNS','SSH','TLS','SSL','JWT','CRUD','ORM','ETL','CI','CD','MVP','SLA','SLO','SLI','RGPD','ACID','BDD','TDD','P95','P99',
  // mots-clés SQL / HTTP / shell écrits en capitales par convention du langage
  'SELECT','FROM','WHERE','JOIN','LEFT','INNER','GROUP','ORDER','HAVING','LIMIT','INSERT','INTO',
  'UPDATE','DELETE','CREATE','TABLE','INDEX','UNIQUE','NULL','NOT','AND','OR','SET','VALUES',
  'PRIMARY','FOREIGN','KEY','REFERENCES','CHECK','BEGIN','COMMIT','ROLLBACK','EXISTS','DISTINCT',
  'GET','POST','PUT','PATCH','HEAD','OPTIONS','TRACE','CONNECT','RUN','COPY','FROM','CMD','ENV',
  'ARG','WORKDIR','EXPOSE','ADD','USER','LABEL','ONBUILD','ENTRYPOINT','VOLUME','SHELL']);
// SONDE CORRIGÉE. La première version comptait 606 « acronymes » dont AVANT, ET,
// PAS, UNE : le corpus emploie massivement les CAPITALES comme emphase. Un mot en
// capitales qui apparaît AILLEURS en minuscules dans le corpus est de l'emphase,
// pas un sigle. C'est le filtre appliqué ici.
const enMinuscules = new Set();
for (const l of CORPUS) {
  const t = fs.readFileSync(`curriculum/lessons/${l.slug}.md`, 'utf8');
  for (const w of t.match(/\b[a-zà-ÿœ]{2,8}\b/g) || []) enMinuscules.add(w);
}
const acr = new Map();
for (const l of CORPUS) {
  const txt = fs.readFileSync(`curriculum/lessons/${l.slug}.md`, 'utf8');
  const vocab = (/## .*Vocabulaire[\s\S]*?(?=\n## |$)/.exec(txt) || [''])[0];
  for (const a of new Set(txt.match(/\b[A-ZÀ-ÞŒ]{2,8}\b/g) || [])) {
    if (IGNORE.has(a)) continue;
    if (enMinuscules.has(a.toLowerCase())) continue;   // emphase, pas un sigle
    const explique = new RegExp(`${a}\\s*\\(|\\(\\s*${a}\\s*\\)`).test(txt) || vocab.includes(a);
    if (!explique) { if (!acr.has(a)) acr.set(a, []); acr.get(a).push(l.slug); }
  }
}
const acrTop = [...acr.entries()].sort((a,b)=>b[1].length-a[1].length).slice(0,15);
console.log('=== ACRONYMES employés sans développement ni entrée de vocabulaire ===');
console.log(`   ${acr.size} acronymes distincts concernés`);
acrTop.forEach(([a,ls])=>console.log(`   ${a.padEnd(8)} ${String(ls.length).padStart(3)} leçon(s)  ex. ${ls.slice(0,3).join(', ')}`));

// --- 1bis. EMPHASE EN CAPITALES (signal éditorial) ---------------------------
let capsTotal = 0, capsLecons = 0;
for (const l of CORPUS) {
  const t = fs.readFileSync(`curriculum/lessons/${l.slug}.md`, 'utf8');
  const n = (t.match(/\b[A-ZÀ-Þ]{3,}\b/g) || []).filter((w) => enMinuscules.has(w.toLowerCase())).length;
  capsTotal += n; if (n > 0) capsLecons++;
}
console.log(`\n=== EMPHASE EN CAPITALES (mots français écrits en majuscules) ===`);
console.log(`   ${capsLecons}/128 leçons | ${capsTotal} occurrences | moyenne ${(capsTotal/128).toFixed(1)} par leçon`);

// --- 2. TOURNURES qui minimisent la difficulté ----------------------------
const MINI = /\b(évidemment|bien sûr|il suffit de|simplement|tout simplement|trivial|c'est facile|sans difficulté|naturellement)\b/gi;
let nMini=0, detMini=[];
for (const l of CORPUS) {
  const txt = fs.readFileSync(`curriculum/lessons/${l.slug}.md`,'utf8');
  const m = txt.match(MINI) || [];
  if (m.length) { nMini++; detMini.push([l.slug, m.length]); }
}
detMini.sort((a,b)=>b[1]-a[1]);
console.log(`\n=== TOURNURES MINIMISANTES ("il suffit de", "évidemment"…) ===`);
console.log(`   ${nMini}/128 leçons en contiennent | total ${detMini.reduce((n,[,v])=>n+v,0)} occurrences`);
detMini.slice(0,8).forEach(([s,n])=>console.log(`   ${String(n).padStart(3)}  ${s}`));

// --- 3. PRÉREQUIS : concept cité comme prérequis mais leçon jamais programmée
console.log('\n=== PRÉREQUIS ===');
let casses = [];
for (const l of CORPUS) {
  const txt = fs.readFileSync(`curriculum/lessons/${l.slug}.md`,'utf8');
  const pre = (/## .*Prérequis[\s\S]*?(?=\n## |$)/.exec(txt)||[''])[0];
  for (const m of pre.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)) {
    const cible = CORPUS.find(x=>x.slug===m[1]);
    if (!cible) { casses.push([l.slug, m[1], 'leçon inexistante']); continue; }
    if (!cible.programmee) casses.push([l.slug, m[1], 'prérequis HORS PARCOURS']);
  }
}
console.log(`   chaînes de prérequis cassées : ${casses.length}`);
const parCible = new Map();
casses.forEach(([,c])=>parCible.set(c,(parCible.get(c)||0)+1));
[...parCible.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10)
  .forEach(([c,n])=>console.log(`   ${c.padEnd(34)} déclarée prérequis par ${n} leçon(s), jamais programmée`));

// --- 4. TEMPS PÉDAGOGIQUE -------------------------------------------------
const MPM = 180;
console.log('\n=== TEMPS PÉDAGOGIQUE (journées non-revue) ===');
const lignes = [];
for (const [id, info] of joursInfo) {
  if (info.revue) continue;
  const refs = [...parLecon.entries()].filter(([,js])=>js.includes(id)).map(([s])=>s);
  const mLecons = refs.reduce((n,s)=>n+(CORPUS.find(x=>x.slug===s)?.total||0),0);
  const mExo = refs.reduce((n,s)=>n+(CORPUS.find(x=>x.slug===s)?.lExo||0),0);
  lignes.push({ id, dureeH: info.dureeH, lectureMin: Math.round((info.mots+mLecons)/MPM), mExo, nRefs: refs.length });
}
const q=(a,p)=>{const s=[...a].sort((x,y)=>x-y);return s[Math.round((s.length-1)*p)]};
const lec = lignes.map(l=>l.lectureMin);
console.log(`   ${lignes.length} journées | lecture seule : méd ${q(lec,.5)} min | P90 ${q(lec,.9)} | max ${Math.max(...lec)}`);
const annonce = lignes.filter(l=>l.dureeH).map(l=>l.dureeH*60);
console.log(`   durée ANNONCÉE : méd ${q(annonce,.5)} min`);
console.log(`   ratio lecture / annoncé (médiane) : ${(q(lec,.5)/q(annonce,.5)*100).toFixed(0)} %`);
console.log(`   → il reste ${q(annonce,.5)-q(lec,.5)} min à couvrir par la pratique, la correction et le projet.`);
const exoMots = lignes.map(l=>l.mExo);
console.log(`   mots d'exercice par journée : méd ${q(exoMots,.5)} | P90 ${q(exoMots,.9)}`);
console.log(`   journées sans AUCUN mot d'exercice dans leurs leçons : ${lignes.filter(l=>l.mExo===0).length}`);
