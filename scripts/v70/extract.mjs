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
// TOUS : même critère que TROUVE mais renvoie TOUTES les sections concordantes.
// Introduit au V70 CP8 pour la sonde `lPratiqueTot` (voir la note de sonde
// plus bas). N'est utilisé par AUCUNE des sondes existantes : les champs
// d'origine gardent exactement leur sémantique et leurs valeurs.
const TOUS = (secs, ...res) => secs.filter((s) => res.some((re) => re.test(norm(s.titre))));

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

  // ------------------------------------------------------------------------
  // SONDE ADDITIONNELLE — V70 CP8, documentée conformément à la règle de
  // non-triche du brief (§6).
  //
  // DÉFAUT DÉMONTRÉ. `TROUVE` s'appuie sur Array.prototype.find : il renvoie
  // la PREMIÈRE section dont le titre concorde, puis s'arrête. Les leçons
  // réécrites depuis le CP5 portent deux sections de pratique distinctes :
  // un « Mini-exercice » court de rappel actif (deux lignes, volontairement),
  // suivi d'une « Pratique » longue avec livrables. Comme « mini exercice »
  // est le premier motif de la liste ET la première section du fichier,
  // `S.exo` ne voit JAMAIS la seconde. Conséquence : `lExo` mesure le rappel
  // actif et jamais la pratique principale, et `exoLivrable` — qui s'applique
  // à `exoTxt` — juge le mauvais texte.
  //
  // POURQUOI LA SONDE D'ORIGINE N'EST PAS MODIFIÉE. La corriger ferait monter
  // mes propres chiffres sur les leçons que je viens d'écrire, et rendrait
  // `lExo` non comparable avec le rapport CP0. Les champs `lExo`, `aExo` et
  // `exoLivrable` sont donc LAISSÉS EXACTEMENT EN L'ÉTAT. Les champs
  // ci-dessous s'ajoutent, sans rien remplacer, et sont publiés séparément.
  //
  // IMPACT MESURÉ sur le corpus figé au commit d5d2cd9 (celui du CP0),
  // recompté fichier par fichier et non supposé :
  //   leçons portant « Mini-exercice »            : 115
  //   leçons portant une section « Pratique »     :  12
  //   leçons portant « Exercice plus difficile »  :  39
  //   leçons portant Mini-exercice ET Pratique    :   0   <- le cas du défaut
  // Aucun chiffre du rapport CP0 ne change donc : au CP0, la première section
  // concordante ÉTAIT la bonne dans les 128 cas. Le défaut n'apparaît que sur
  // les leçons réécrites en V70, qui portent les deux sections.
  //
  // ÉCART CONSTATÉ au CP8 sur le corpus courant, publié tel quel :
  //   exoLivrable      (sonde CP0, inchangée) : 87 / 128
  //   pratiqueLivrable (sonde CP8, ajoutée)   : 93 / 128   -> +6
  // Ces six leçons demandaient déjà une production observable ; la sonde du
  // CP0 lisait le rappel actif à la place et ne pouvait pas la voir. Les deux
  // chiffres sont conservés et rapportés séparément au CP15.
  // ------------------------------------------------------------------------
  const pratSecs = TOUS(secs, /mini exercice/, /mise en pratique/, /pratique associee/,
                              /^pratique$/, /^pratique /, /exercice plus difficile/);
  const pratTxt  = pratSecs.map((s) => s.corps).join('\n');

  return {
    slug, titre,
    total: mots(txt),
    nSections: secs.length,
    titres: secs.map((s) => norm(s.titre)),
    // longueurs
    lProbleme: m('probleme'), lMental: m('mental'), lExplic: m('explic'),
    lGuide: m('guide'), lExo: mots(exoTxt), lCorr: m('correction'), lMetier: m('metier'),
    // sonde additionnelle CP8 : toutes les sections de pratique cumulées
    lPratiqueTot: mots(pratTxt), nPratiqueSecs: pratSecs.length,
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
    // CORRECTION DE SONDE — V70 CP5, documentée (brief §6).
    // La version d'origine utilisait \b, dont la définition est ASCII en
    // JavaScript : aucun verbe à initiale accentuée ne pouvait matcher.
    // « Écris », « écris », « écrire », « implémente » renvoyaient tous false,
    // y compris en milieu de phrase, parce que « é » n'est pas un caractère de
    // mot au sens ASCII et qu'aucune frontière n'est donc détectée avant lui.
    // Vérifié : /\b(écris)\b/i.test('Écris un tableau') === false.
    // Remplacé par une frontière définie sur \p{L} avec le drapeau u.
    // IMPACT MESURÉ sur le corpus figé au commit d5d2cd9 (128 leçons) :
    //   sonde d'origine : 58 leçons  |  sonde corrigée : 70 leçons  |  net +12
    //   +15 gagnées (verbes à initiale accentuée enfin reconnus)
    //    -3 perdues : breaking-changes-compatibility,
    //       database-transactions-concurrency, nextjs-data-production.
    //   Ces trois-là ne matchaient QUE par un faux positif : « Décris »
    //   contient la sous-chaîne « écris », et \b la trouvait parce que la
    //   frontière tombait entre « D » (mot ASCII) et « é » (non-mot ASCII).
    //   La sonde corrigée refuse cette sous-chaîne, ce qui est le bon
    //   comportement.
    // La liste de verbes n'est PAS élargie : ajouter « décris » après avoir
    // constaté qu'il coûte trois leçons serait exactement le déplacement de
    // seuil a posteriori que le brief interdit.
    // Le CP0 avait donc SOUS-ESTIMÉ de 12 le nombre de pratiques à production
    // observable. Chiffre publié au mini-statut CP5 et repris au CP15 ; le
    // rapport CP0 n'est pas réécrit.
    exoLivrable: /(^|[^\p{L}])(écris|écrire|implémente|construis|mesure|refactor|dessine|code|ajoute|corrige|répare|compare|teste|conçois|modifie|produis)([^\p{L}]|$)/iu.test(exoTxt),
    // Même expression, appliquée au texte COMPLET de pratique (sonde CP8).
    // `exoLivrable` ci-dessus est inchangé et reste la mesure comparable au CP0.
    // OBSERVATION V70 CP10, consignée sans modification de sonde (brief §6).
    // Au terme du CP10, UNE SEULE leçon reste à pratiqueLivrable = false :
    // html-semantic-structure. Vérifié par lecture intégrale de sa pratique
    // (528 mots) : elle exige une réécriture complète d'une page, trois sondes
    // exécutées avant et après, un tableau comparatif et un critère de réussite
    // chiffré (« la sonde (c) passe de 0 à au moins 3 »). C'est une production
    // observable, sans ambiguïté possible.
    // La sonde la rate parce que ses verbes — « Réécris », « Rejoue »,
    // « Publie », « Colle » — sont hors de la liste gelée. Noter que
    // « Réécris » ne peut pas concorder avec « écris » : l'expression exige un
    // non-caractère-lettre avant le verbe, et « é » est une lettre. C'est le
    // comportement voulu de l'expression, pas un défaut.
    // LA LISTE DE VERBES N'EST PAS ÉLARGIE. L'élargir maintenant reviendrait à
    // modifier une sonde après avoir vu quelle leçon elle coûte, ce que le
    // brief interdit explicitement. Le chiffre publié au CP15 est donc
    // 127/128, avec ce faux négatif unique déclaré ici et repris au rapport.
    pratiqueLivrable: /(^|[^\p{L}])(écris|écrire|implémente|construis|mesure|refactor|dessine|code|ajoute|corrige|répare|compare|teste|conçois|modifie|produis)([^\p{L}]|$)/iu.test(pratTxt),
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
