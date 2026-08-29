import { CORPUS, joursInfo } from './extract.mjs';
const C = CORPUS;
const q = (a, p) => { const s = [...a].sort((x, y) => x - y); const i = (s.length - 1) * p;
  const lo = Math.floor(i), hi = Math.ceil(i); return lo === hi ? s[lo] : s[lo] + (s[hi] - s[lo]) * (i - lo); };
const stat = (nom, vals) => console.log(
  `${nom.padEnd(24)} min ${String(Math.min(...vals)).padStart(5)} | P10 ${String(Math.round(q(vals,.1))).padStart(5)} | P25 ${String(Math.round(q(vals,.25))).padStart(5)} | méd ${String(Math.round(q(vals,.5))).padStart(5)} | P75 ${String(Math.round(q(vals,.75))).padStart(5)} | P90 ${String(Math.round(q(vals,.9))).padStart(5)} | max ${String(Math.max(...vals)).padStart(5)}`);

console.log('=== LONGUEURS (mots) ===');
stat('leçon entière', C.map(l=>l.total));
stat('noyau explicatif', C.map(l=>l.lExplic));
stat('exemple guidé', C.map(l=>l.lGuide));
stat('pratique (exos)', C.map(l=>l.lExo));
stat('correction', C.map(l=>l.lCorr));
stat('cas professionnel', C.map(l=>l.lMetier));

console.log('\n=== PRÉSENCE DES FONCTIONS PÉDAGOGIQUES (sur 128) ===');
const pres = [['modèle mental','aMental'],['exemple guidé','aGuide'],['pratique','aExo'],
 ['correction','aCorr'],['cas professionnel','aMetier'],['erreurs fréquentes','aErreurs'],
 ['transfert/liens','aTransfert'],['vérif. compréhension','aVerif'],['questions entretien','aEntretien'],
 ['à retenir','aRetenir'],['vocabulaire','aVocab']];
pres.forEach(([n,k]) => { const v = C.filter(l=>l[k]).length;
  console.log(`   ${n.padEnd(24)} ${String(v).padStart(3)}/128  (${String(128-v).padStart(3)} absentes)`); });

console.log('\n=== PARCOURS ===');
const hors = C.filter(l=>!l.programmee);
console.log(`   programmées : ${128-hors.length}/128 | hors parcours : ${hors.length}`);
hors.forEach(l=>console.log(`      ${l.slug}`));

console.log('\n=== SEUILS DE PAUVRETÉ ===');
const seuil = (n,f) => console.log(`   ${n.padEnd(46)} ${String(C.filter(f).length).padStart(3)}/128`);
seuil('exemple guidé absent', l=>!l.aGuide);
seuil('exemple guidé < 120 mots (pseudo-exemple)', l=>l.aGuide && l.lGuide<120);
seuil('exemple guidé < 250 mots', l=>l.aGuide && l.lGuide<250);
seuil('noyau explicatif < 300 mots', l=>l.lExplic<300);
seuil('pratique absente', l=>!l.aExo);
seuil('pratique < 40 mots', l=>l.aExo && l.lExo<40);
seuil('pratique sans verbe de production', l=>l.aExo && !l.exoLivrable);
seuil('correction absente', l=>!l.aCorr);
seuil('correction < 60 mots (réponse seule)', l=>l.corrSeuleReponse);
seuil('correction sans raisonnement explicite', l=>l.aCorr && !l.corrRaisonne);
seuil('cas professionnel absent', l=>!l.aMetier);
seuil('aucun bloc de code', l=>l.blocsCode===0);

console.log('\n=== ÉDITORIAL / TEMPLATE ===');
const sig = new Map();
C.forEach(l=>{ const k=l.titres.join('|'); sig.set(k,(sig.get(k)||0)+1); });
const clones = [...sig.entries()].filter(([,n])=>n>1).sort((a,b)=>b[1]-a[1]);
console.log(`   séquences de titres distinctes : ${sig.size} pour 128 leçons`);
console.log(`   leçons partageant leur séquence exacte avec au moins une autre : ${clones.reduce((n,[,v])=>n+v,0)}`);
clones.slice(0,5).forEach(([k,n])=>console.log(`      ${n} leçons : ${k.split('|').slice(0,6).join(' / ')}…`));
const nb = new Map(); C.forEach(l=>nb.set(l.nSections,(nb.get(l.nSections)||0)+1));
console.log(`   nombre de sections : ${[...nb.entries()].sort((a,b)=>a[0]-b[0]).map(([k,v])=>`${k}→${v}`).join(' ')}`);
console.log(`   gabarit « Énoncé/Raisonnement »        : ${C.filter(l=>l.gabaritB).length}/128`);
console.log(`   étiquette « Décision N »               : ${C.filter(l=>l.decisionN>0).length}/128`);
console.log(`   titre « Variante qui déplace »         : ${C.filter(l=>l.variante).length}/128`);

console.log('\n=== TEMPS PÉDAGOGIQUE ===');
const MPM=180;
const nonRevue=[...joursInfo.entries()].filter(([,v])=>!v.revue);
const dur=nonRevue.map(([,v])=>v.dureeH).filter(Boolean);
console.log(`   journées non-revue : ${nonRevue.length} | durée annoncée médiane : ${q(dur,.5).toFixed(1)} h`);
