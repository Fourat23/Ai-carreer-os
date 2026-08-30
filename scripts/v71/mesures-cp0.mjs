// V71 — sondes de mesure du corpus. Lecture seule.
//
// Ces sondes SERVENT À DÉTECTER ET À PRIORISER. Elles ne notent pas.
// Toute note académique D1→D14 provient d'une lecture effective (contrat CP1).
//
// Chaque chiffre publié dans les rapports V71 est produit ici, de sorte qu'il
// soit reproductible : `node scripts/v71/mesures-cp0.mjs`.

import fs from 'node:fs';
import path from 'node:path';

const D = 'curriculum/lessons';

export const norm = (t) => t
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^\p{L}\p{N}\s]/gu, ' ')
  .replace(/\s+/g, ' ').trim().toLowerCase();

export const mots = (t) => (t.match(/[\p{L}\p{N}][\p{L}\p{N}"’-]*/gu) || []).length;

// ---------------------------------------------------------------------------
// SONDE 1 — style du noyau explicatif : catalogue de définitions ou raisonnement ?
//
// « Catalogue » = paragraphes ouvrant sur « **Terme.** » suivi d'une définition.
// Ce n'est PAS un défaut en soi : une définition bien faite explique aussi.
// La sonde compare donc deux densités, et ne conclut jamais seule.
export const styleNoyau = (parts) => {
  const ex = parts.find((p) => /explication (complete|progressive)/.test(norm(p.split('\n')[0])));
  if (!ex) return null;
  const corps = ex.split('\n').slice(1).join('\n');
  const m = mots(corps);
  const defs = (corps.match(/(^|\n\n)\*\*[^*\n]{2,40}[.—:]\*\*/g) || []).length;
  const rais = (corps.match(
    /\bpourquoi\b|\bparce que\b|\bdonc\b|\bsinon\b|\bce qui (?:fait|permet|casse|arrive)\b|\ben revanche\b|\bau lieu de\b|\bplutot que\b|\bcompromis\b|\barbitrage\b/gi) || []).length;
  return { mots: m, defs, rais, densDef: m ? +(1000 * defs / m).toFixed(1) : 0,
           densRais: m ? +(1000 * rais / m).toFixed(1) : 0 };
};

// ---------------------------------------------------------------------------
// SONDE 2 — taxonomie de la pratique : R / E / D / P / T.
//
// CORRECTION DE SONDE — V71 CP0, documentée. Une première version classait la
// section de pratique la PLUS LONGUE et retombait sur « R » quand aucun verbe
// ne correspondait. Trois leçons ressortaient en R/E :
//   etl-pipelines     « Écris un pipeline extract/transform/load … prouve
//                       qu'un second run ne crée PAS de doublons. »
//   express-backend   idem, exercice de construction.
//   react-fundamentals« Construis le compteur avancé … » puis un mini-Kanban.
// Les trois sont des productions. Le défaut était double : un bucket par défaut
// qui absorbait les non-appariements, et une liste de verbes trop courte
// (« simule », « vérifie », « prouve », « rends », « déplace » manquaient).
// Corrigé : plus de bucket par défaut (« ? » est explicite), liste de verbes
// alignée sur ce que le corpus écrit réellement, et classement sur TOUTES les
// sections de pratique réunies plutôt que sur la plus longue.
// Chiffres publiés : sonde d'origine 122 P / 128 ; sonde corrigée 127 P + 1 D.
const VP = /\b(ecris|ecrire|implemente|construis|construire|mesure|mesurer|refactor|code|ajoute|corrige|repare|teste|concois|modifie|produis|livrable|simule|verifie|prouve|rends|deplace|trace|reproduis|fabrique|encode|calcule|lance|execute|instrumente|remplis)\b/;
const VD = /\b(choisis|choisir|decide|arbitre|compare|justifie|priorise|tranche|classe|reclasse|selectionne)\b/;
const VT = /\b(sur ton projet|ton propre|un autre cas|situation differente|applique le a|transpose)\b/;
const VE = /\b(explique|pourquoi|justifie en une phrase|reformule)\b/;
const VR = /\b(qu est ce que|cite|liste|nomme|definis|rappelle)\b/;

export const taxonomie = (parts) => {
  const pr = parts.filter((p) => /mini exercice|exercice plus difficile|^pratique|mise en pratique|pratique associee/.test(norm(p.split('\n')[0])));
  if (!pr.length) return { classe: '?', sections: 0, mots: 0 };
  const c = norm(pr.join('\n'));
  const classe = VP.test(c) ? 'P' : VD.test(c) ? 'D' : VT.test(c) ? 'T'
    : VE.test(c) ? 'E' : VR.test(c) ? 'R' : '?';
  return { classe, sections: pr.length, mots: mots(pr.join('\n')) };
};

// ---------------------------------------------------------------------------
// SONDE 3 — répétition interne : paragraphes identiques dans une même leçon.
//
// NOTE DE MÉTHODE. Une première version comparait des PHRASES obtenues après
// normalisation ; or la normalisation retire la ponctuation, donc le découpage
// en phrases ne se faisait plus et chaque section devenait une phrase unique.
// La sonde renvoyait 0 % de recouvrement partout — un faux négatif complet.
// Corrigé : on découpe en paragraphes sur les lignes vides, on RE-JOINT les
// lignes d'un même paragraphe (le texte est enveloppé à 90 colonnes, donc deux
// copies d'un même paragraphe n'ont pas les mêmes coupures), puis on normalise.
export const repetitions = (t) => {
  const paras = t.split(/\n\s*\n/)
    .map((p) => norm(p.replace(/\n/g, ' ')))
    .filter((p) => p.split(' ').length >= 20);
  const vus = new Map();
  for (const p of paras) vus.set(p, (vus.get(p) || 0) + 1);
  const rep = [...vus.entries()].filter(([, n]) => n > 1);
  return { blocs: rep.length, motsDupliques: rep.reduce((a, [p, n]) => a + p.split(' ').length * (n - 1), 0) };
};

// ---------------------------------------------------------------------------
export const analyser = (slug) => {
  const t = fs.readFileSync(path.join(D, `${slug}.md`), 'utf8');
  const parts = t.split(/^## /m).slice(1);
  const titres = parts.map((p) => norm(p.split('\n')[0]));
  const sec = (re) => parts.filter((p) => re.test(norm(p.split('\n')[0])));
  const w = (ps) => ps.reduce((a, p) => a + mots(p), 0);
  return {
    slug,
    total: mots(t),
    nSections: parts.length,
    titres,
    noyau: styleNoyau(parts),
    guide: w(sec(/exemple guide/)),
    pratique: taxonomie(parts),
    correction: w(sec(/^correction/)),
    nCorrections: sec(/^correction/).length,
    metier: w(sec(/cas (metier|professionnel)|que faire dans ce cas/)),
    verif: sec(/verification de comprehension/).length > 0,
    repetition: repetitions(t),
  };
};

const slugs = fs.readdirSync(D).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')).sort();
export const CORPUS = slugs.map(analyser);

if (process.argv[1] && process.argv[1].endsWith('mesures-cp0.mjs')) {
  fs.mkdirSync('docs/v71', { recursive: true });
  fs.writeFileSync('docs/v71/mesures-cp0.json', JSON.stringify(CORPUS, null, 1));
  const N = CORPUS.length;
  const q = (f) => {
    const v = CORPUS.map(f).filter((x) => x !== null && x !== undefined).sort((a, b) => a - b);
    const P = (p) => v[Math.floor(v.length * p)];
    return `min=${v[0]} p10=${P(.1)} p25=${P(.25)} med=${P(.5)} p75=${P(.75)} p90=${P(.9)} max=${v[v.length - 1]}`;
  };
  console.log(`corpus : ${N} leçons\n`);
  console.log('mots par leçon      :', q((x) => x.total));
  console.log('noyau explicatif    :', q((x) => x.noyau?.mots));
  console.log('exemple guidé       :', q((x) => x.guide));
  console.log('correction          :', q((x) => x.correction));
  console.log('cas professionnel   :', q((x) => x.metier));
  const c = (f) => CORPUS.filter(f).length;
  console.log('\npratique — P:', c((x) => x.pratique.classe === 'P'),
    ' D:', c((x) => x.pratique.classe === 'D'),
    ' T:', c((x) => x.pratique.classe === 'T'),
    ' E:', c((x) => x.pratique.classe === 'E'),
    ' R:', c((x) => x.pratique.classe === 'R'),
    ' ?:', c((x) => x.pratique.classe === '?'));
  console.log('leçons à 2 sections Correction   :', c((x) => x.nCorrections >= 2));
  console.log('leçons sans section cas métier   :', c((x) => x.metier === 0));
  console.log('leçons avec vérification         :', c((x) => x.verif));
  console.log('leçons à paragraphe répété       :', c((x) => x.repetition.blocs > 0),
    '(mots dupliqués :', CORPUS.reduce((a, x) => a + x.repetition.motsDupliques, 0) + ')');
  const noyau = CORPUS.filter((x) => x.noyau).sort((a, b) => b.noyau.densDef - a.noyau.densDef);
  console.log('\nnoyaux les plus « catalogue » (densité de définitions / 1000 mots) :');
  for (const x of noyau.slice(0, 10)) console.log(`  ${x.slug.padEnd(32)} densDef=${x.noyau.densDef} densRais=${x.noyau.densRais}`);
}
