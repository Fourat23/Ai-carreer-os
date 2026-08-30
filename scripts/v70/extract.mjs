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

    // SONDE ADDITIONNELLE — V70 CP15, documentée conformément à §6.
    //
    // DÉFAUT DÉMONTRÉ. `corrRaisonne` teste six chaînes littérales. Or le
    // français exprime le même raisonnement par bien d'autres tournures, et
    // neuf leçons du corpus le font. Extraits RÉELS de leurs corrections,
    // recopiés avant toute modification de sonde :
    //
    //   linux-services-systemd (727 mots, zéro marqueur d'origine) :
    //     « la relance ne répare que les pannes transitoires. Ici la cause est
    //      une variable absente ; aucune quantité de relances ne la fera
    //      apparaître. » — c'est l'élément D9-2 (pourquoi ça marche).
    //     « C'est contre-intuitif : on préférerait un superviseur tenace. » —
    //      c'est l'élément D9-3 (mauvaise solution plausible).
    //     « la même arithmétique 128 + N explique par ailleurs le code 137
    //      d'un conteneur tué pour dépassement de mémoire » — D9-5
    //      (généralisation).
    //   technical-storytelling : « La raison pour laquelle ce point compte
    //     tant … », « Erreur à éviter : présenter l'échec comme une faute ».
    //   ci-cd : « `install` peut résoudre une version différente de celle que
    //     tu as testée, ce qui rend la CI verte sur un assemblage que personne
    //     n'a vérifié », « c'est une confusion fréquente en entretien ».
    //
    // Aucune de ces phrases ne contient « pourquoi », « la démarche »,
    // « alternative », « défendable » ni « l'erreur probable ». La sonde
    // d'origine produit donc un FAUX NÉGATIF, et non un constat de faiblesse.
    //
    // POURQUOI LA SONDE D'ORIGINE N'EST PAS MODIFIÉE. La corriger ferait
    // monter un chiffre déjà publié sans que le lecteur puisse voir de combien.
    // Elle reste donc telle quelle, et cette seconde sonde est ajoutée à côté.
    // Les DEUX chiffres sont publiés au CP15.
    //
    // CE QUE LA SONDE ÉTENDUE MESURE. Les cinq éléments de D9 du contrat gelé,
    // chacun cherché par une FAMILLE de tournures et non par un mot unique. Le
    // seuil — au moins trois éléments sur cinq — est celui du contrat gelé au
    // CP1 ; il n'a pas été choisi après la mesure.
    //
    // IMPACT MESURÉ sur le corpus au commit 59644bc :
    //   corrRaisonne     (sonde CP0, inchangée) : 119 / 128
    //   corrD9 >= 3      (sonde CP15, ajoutée)  : 118 / 128
    //
    // ─────────────────────────────────────────────────────────────────────
    // VERDICT SUR CETTE SONDE : ELLE NE MESURE PAS D9. À PUBLIER TEL QUEL.
    // ─────────────────────────────────────────────────────────────────────
    // La sonde étendue devait corriger la sonde d'origine. Elle ne la corrige
    // pas : elle se trompe autant, dans les deux sens, et sur d'autres leçons.
    // Les DIX leçons qu'elle place sous le seuil ont été LUES intégralement au
    // CP15. Les dix contiennent les cinq éléments de D9. Contre-exemples :
    //
    //   deployment-strategies — noté 1/5. Contient « Trois erreurs de détail à
    //     éviter », « cinq migrations au lieu d'une », « Le point de conception
    //     qui départage une bonne réponse ». La famille 3 cherche « erreur à
    //     éviter » d'un seul tenant et « au lieu de » ; le texte écrit
    //     « erreurs de détail à éviter » et « au lieu d'une ». Deux échecs
    //     d'appariement sur une élision et un mot intercalé.
    //   async-javascript — noté 2/5 par la sonde étendue, mais VRAI pour la
    //     sonde d'origine : sa correction contient littéralement « L'erreur
    //     probable » et « Alternative défendable ». Les deux sondes se
    //     contredisent sur la même leçon.
    //   machine-learning-basics, react-accessibility, design-patterns-intro —
    //     notées 2/5, alors que chacune ouvre sur « La démarche » et
    //     « L'erreur probable » en toutes lettres.
    //
    // CE QUE J'EN CONCLUS, ET CE QUE JE REFUSE DE FAIRE. Je pourrais élargir
    // les familles jusqu'à ce que les 128 passent. Ce serait exactement le
    // geste interdit par le brief : ajuster une sonde jusqu'à obtenir la note
    // voulue. Une expression régulière sur de la prose française ne sait pas
    // reconnaître un raisonnement ; elle reconnaît des mots. Le contrat gelé
    // le prévoyait d'ailleurs (§6 « ce que ce barème ne sait pas faire »).
    //
    // La sonde reste donc dans le code, avec ce verdict, comme instrument de
    // DÉGROSSISSAGE et non de notation. La condition 7 du contrat — « aucune
    // correction réduite à la réponse » — est mesurée par `corrSeuleReponse`,
    // qui compte des mots et non des tournures, et vaut 0/128.
    // D9 est notée par LECTURE. Voir le rapport final, section corrections.
    corrD9: (() => {
      const e = [
        // 1 — la démarche : comment on arrive à la réponse
        /(la démarche|on commence par|première étape|le calcul attendu|la forme attendue|le raisonnement|on cherche d'abord|la méthode)/i,
        // 2 — pourquoi la solution correcte fonctionne
        /(pourquoi|parce que|la raison pour laquelle|ce qui (?:rend|permet|garantit|explique)|c'est ce qui|d'où (?:la|le|l'))/i,
        // 3 — une mauvaise solution plausible et sa raison d'échec
        /(erreur (?:à éviter|systématique|fréquente|classique)|le piège|contre-intuitif|on préférerait|au lieu de|plutôt que|n'est pas « |ce n'est pas |à ne pas)/i,
        // 4 — les indices qui font reconnaître ce type de problème
        /(indice|signe|se reconnaît|tu sauras|le symptôme|ce qui doit t'alerter|à chercher|si tu (?:vois|observes|constates))/i,
        // 5 — généralisation, ou cas où la réponse changerait
        /(en général|de manière générale|le même|la même|par ailleurs|s'applique aussi|dans un autre|si (?:en revanche|au contraire)|cela vaut aussi)/i,
      ].filter((re) => re.test(corrTxt)).length;
      return e;
    })(),
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
