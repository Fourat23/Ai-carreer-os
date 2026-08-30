// V70 CP0 — extracteur forensic du corpus. STRICTEMENT LECTURE SEULE.
// Compte, trouve, compare. N'écrit aucun cours.
import fs from 'node:fs';
import path from 'node:path';

const LDIR = 'curriculum/lessons', DDIR = 'curriculum/days';
export const mots = (s) => (String(s).match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length;

// --- découpage en sections -------------------------------------------------
export function sections(txt) {
  const out = []; let cur = null;
  for (const l of txt.split('\n')) {
    const m = /^##\s+(.*)$/.exec(l);
    if (m) { if (cur) out.push(cur); cur = { titre: m[1].trim(), corps: [] }; }
    else if (cur) cur.corps.push(l);
  }
  if (cur) out.push(cur);
  return out.map((s) => ({ ...s, corps: s.corps.join('\n') }));
}
const norm = (t) => t
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')            // enlève les accents
  .replace(/[^\p{L}\p{N}\s]/gu, ' ')                          // enlève emoji et ponctuation
  .replace(/\s+/g, ' ').trim().toLowerCase();

const TROUVE = (secs, ...res) => secs.find((s) => res.some((re) => re.test(norm(s.titre))));

// --- métadonnées jour ------------------------------------------------------
const jours = fs.readdirSync(DDIR).filter((f) => f.endsWith('.md'));
const parLecon = new Map();
const joursInfo = new Map();
for (const f of jours) {
  const txt = fs.readFileSync(path.join(DDIR, f), 'utf8');
  const id = f.replace(/\.md$/, '');
  const revue = /Revue hebdomadaire|Revue mensuelle/.test(txt);
  const dur = /Durée\s*:\s*([\d.,]+)\s*h/.exec(txt);
  joursInfo.set(id, { mots: mots(txt), revue, dureeH: dur ? parseFloat(dur[1].replace(',', '.')) : null });
  for (const r of new Set([...txt.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))) {
    if (!parLecon.has(r)) parLecon.set(r, []);
    parLecon.get(r).push(id);
  }
}

// --- extraction par leçon --------------------------------------------------
export function analyser(slug) {
  const txt = fs.readFileSync(path.join(LDIR, `${slug}.md`), 'utf8');
  const secs = sections(txt);
  const titre = (/^#\s+(.*)$/m.exec(txt) || [, slug])[1].replace(/^Leçon\s*—\s*/, '').trim();

  const S = {
    probleme:  TROUVE(secs, /probleme d abord/),
    objectif:  TROUVE(secs, /^objectif$/),
    prerequis: TROUVE(secs, /prerequis/),
    mental:    TROUVE(secs, /modele mental/),
    explic:    TROUVE(secs, /explication (complete|progressive)/, /^concepts cles$/),
    simple:    TROUVE(secs, /exemple simple/),
    guide:     TROUVE(secs, /exemple guide/),
    applique:  TROUVE(secs, /exemple applique/),
    erreurs:   TROUVE(secs, /erreurs frequentes/, /anti patterns/),
    // ------------------------------------------------------------------------
    // CORRECTION DE SONDE — V70 CP5, documentée conformément à la règle de
    // non-triche du brief (§6 : « modifier une sonde uniquement parce qu'elle
    // produit une mauvaise note sans démontrer qu'elle est fausse » est
    // interdit ; la démonstration suit).
    //
    // 1. `correction` ne reconnaissait que le titre exact « Correction
    //    attendue ». Une section intitulée « ✅ Correction » — le titre
    //    naturel, et celui du standard gelé V70 — était comptée à zéro mot
    //    alors qu'elle existe et contient le texte.
    //    Impact sur les chiffres du CP0 : NUL. Vérifié sur le corpus figé au
    //    commit d5d2cd9 : 103 leçons portaient « Correction attendue », ZÉRO
    //    portait « Correction » seul. Aucun chiffre du rapport CP0 ne change.
    //
    // 2. `exo` ne reconnaissait pas le titre « Pratique » seul.
    //    Impact sur les chiffres du CP0 : RÉEL et déclaré. Quatre leçons du
    //    corpus figé portaient « 🛠️ Pratique » et étaient comptées comme
    //    dépourvues d'exercice. Le CP0 a donc sous-estimé de 4 le nombre de
    //    leçons pourvues d'une pratique. Ce delta est publié dans le
    //    mini-statut CP5 et repris au CP15 ; les chiffres du rapport CP0
    //    ne sont PAS réécrits.
    //
    // Non ajouté volontairement : « Repères pratiques » (9 occurrences au
    // CP0). Ce n'est pas un exercice — aucun livrable, aucune consigne — et
    // l'inclure gonflerait le taux de couverture de la pratique sans qu'une
    // seule leçon ait gagné un exercice.
    // ------------------------------------------------------------------------
    exo:       TROUVE(secs, /mini exercice/, /mise en pratique/, /pratique associee/, /^pratique$/, /^pratique /),
    exoDur:    TROUVE(secs, /exercice plus difficile/),
    verif:     TROUVE(secs, /verification de comprehension/),
    correction:TROUVE(secs, /correction attendue/, /^correction$/, /^correction /),
    metier:    TROUVE(secs, /cas (metier|professionnel)/),
    entretien: TROUVE(secs, /questions d entretien/),
    transfert: TROUVE(secs, /liens avec le programme/),
    vocab:     TROUVE(secs, /^vocabulaire$/),
    retenir:   TROUVE(secs, /a retenir/),
    checklist: TROUVE(secs, /checklist/),
  };
  const m = (k) => (S[k] ? mots(S[k].corps) : 0);

  const guideTxt = S.guide ? S.guide.corps : '';
  const corrTxt  = S.correction ? S.correction.corps : '';
  const exoTxt   = [S.exo, S.exoDur].filter(Boolean).map((s) => s.corps).join('\n');

  return {
    slug, titre,
    total: mots(txt),
    nSections: secs.length,
    titres: secs.map((s) => norm(s.titre)),
    // longueurs
    lProbleme: m('probleme'), lMental: m('mental'), lExplic: m('explic'),
    lGuide: m('guide'), lExo: mots(exoTxt), lCorr: m('correction'), lMetier: m('metier'),
    // présences
    aMental: !!S.mental, aGuide: !!S.guide, aExo: !!(S.exo || S.exoDur),
    aCorr: !!S.correction, aMetier: !!S.metier, aErreurs: !!S.erreurs,
    aTransfert: !!S.transfert, aVerif: !!S.verif, aEntretien: !!S.entretien,
    aRetenir: !!S.retenir, aVocab: !!S.vocab,
    // parcours
    jours: parLecon.get(slug) || [],
    programmee: (parLecon.get(slug) || []).length > 0,
    // signaux éditoriaux
    gabaritB: /\*\*Énoncé\*\*/.test(guideTxt) && /\*\*Raisonnement\*\*/.test(guideTxt),
    decisionN: (guideTxt.match(/\*\*Décision\s*\d/g) || []).length,
    variante: /Variante qui déplace le problème/.test(guideTxt),
    blocsCode: (txt.match(/```/g) || []).length / 2,
    puces: (txt.match(/^\s*[-*]\s/gm) || []).length,
    // pratique
    exoLivrable: /\b(écris|écrire|implémente|construis|mesure|refactor|dessine|code|ajoute|corrige|répare|compare|teste|conçois|modifie|produis)\b/i.test(exoTxt),
    exoPassif: /^\s*(qu'est-ce que|explique en une phrase|cite|liste|nomme)/i.test(exoTxt.trim()),
    // correction
    corrRaisonne: /(la démarche|l'erreur probable|pourquoi|alternative|défendable|se défend)/i.test(corrTxt),
    corrSeuleReponse: m('correction') > 0 && m('correction') < 60,
    guideTxt, corrTxt, exoTxt, secs: secs.map((s) => s.titre),
  };
}

const slugs = fs.readdirSync(LDIR).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')).sort();
export const CORPUS = slugs.map(analyser);
export { joursInfo, parLecon };

if (process.argv[1] && process.argv[1].endsWith('extract.mjs')) {
  fs.mkdirSync('docs/v70', { recursive: true });
  fs.writeFileSync('docs/v70/corpus.json', JSON.stringify(CORPUS.map(({ guideTxt, corrTxt, exoTxt, ...r }) => r), null, 1));
  console.log(`${CORPUS.length} leçons analysées → docs/v70/corpus.json`);
}
