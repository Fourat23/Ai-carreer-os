# V73 — ÉTAT D'AVANCEMENT

> Fichier de reprise. Mis à jour après **chaque CP**. En cas d'interruption : relire ce
> fichier, vérifier Git, reprendre au CP indiqué. **NE PAS refaire un CP terminé.**

## Position

- **dernier CP terminé** : **CP12**
- **CP courant** : —
- **NEXT_CP** : **CP13** — audit à l'aveugle
- **NEXT_ACTION** : **au moins 32 unités** (leçons, journées, revues, semaines, mois),
  **échantillon tiré et publié AVANT de lire le moindre résultat** (graine écrite d'abord,
  comme au CP0 avec 20260910). Lire réellement, pas scanner. Comparer au CP0, qui avait conclu
  sur 24 unités que **« l'hypothèse *les cours sont mauvais* est fausse »** — le CP13 doit
  dire si les corrections des CP3 à CP12 ont dégradé quoi que ce soit. **Inclure
  obligatoirement** : des semaines réécrites au CP10 (s6→s13, s15, s34), des journées dont la
  difficulté a été redérivée au CP9, des journées dont `readingMinutes` a changé au CP12
  (j197→j210), et des leçons non touchées depuis le CP0 comme témoins. **Une anomalie de
  tirage doit être publiée** (le CP0 avait donné 0 leçon « milieu » au premier jet).
  Ressources : `docs/v73/CP0-ECHANTILLON-24.json`, `docs/v73/V73-STATUTS-128.json`.

## Repères Git

| | |
|---|---|
| dépôt | `Fourat23/Ai-carreer-os` (**deux `r`**) |
| branche canonique | `claude/ai-career-os-saas-phfg49` |
| HEAD au début du CP0 | `fe7a10c` |
| HEAD après CP0 | *(voir dernier commit)* |
| local == origin | oui |
| working tree | propre · stash vide · aucun serveur résiduel |

## Invariants (à revérifier à chaque CP)

`128` leçons · `365` journées · `365` corrections · `52` semaines · `12` mois ·
ordre `days[i].day === i+1` · corpus `c1ac869e…` · curriculum entier `04d40526…` ·
**`data/progress.json` n'existe pas dans le dépôt** (gitignoré) — l'invariant est de ne
jamais le créer.

## Décisions gelées

- **CP0** : aucune (lecture seule).
- **CP1** : contrat gelé `docs/v73/V73-CURRICULUM-CONTRACT-FROZEN.md`. Décisions structurantes :
  - **cinq degrés de compétence** avec preuve opérationnelle pour chacun ; **MAÎTRISÉE déclarée
    NON MESURABLE** par V73 (`expectedScores` = intention, jamais constat) ;
  - **cinq statuts de leçon** CORE / ADVANCED / OPTIONAL / REFERENCE / DEPRECATED, avec
    conditions cumulatives ; `DEPRECATED` interdit comme poubelle de commodité ;
  - **dix règles d'intégrité I1→I10** ; **I4 se contrôle sur le CONTENU**, pas sur `day.skill` ;
  - **budget de charge en FOURCHETTE `[240, 300]` min** et non 270 exact — déplacement déclaré
    d'avance, chiffres CP0 conservés tels quels, CP6 publiera les deux lectures ;
  - **quatre zones** IMPOSSIBLE / HEAVY / BALANCED / UNDERLOADED définies sur la fourchette ;
    **UNDERLOADED acceptable** dans trois cas nommés (respiration, bascule, bilan) ;
  - **six hypothèses de sensibilité gelées** ; une journée n'est « structurellement impossible »
    que si elle l'est sous **≥ 4 des 6** ;
  - **seuils de charge L1 = 0 · L2 ≤ 12/52 · L3 ≤ 20/365** — L2 fixé à 12 et **non à 5**, avec
    la raison écrite avant mesure ;
  - **M1→M9** pour toute modification du calendrier ; **rien n'est réservé à l'utilisateur**
    (le brief a tranché : CSS, Next.js, Cloud restent dans la promesse) ;
  - **§7 anti-Goodhart** avec cinq contournements interdits nommés d'avance ;
  - **S1→S8 règles de méthode** issues des cinq anomalies de sonde du CP0 ;
  - **verdict C1→C15** ; **C15 (zéro P0 ouvert) est dans le socle exigé même pour CANDIDATE** ;
  - **douze mutations** de tests négatifs, dont le test 12 redéfini en **non-création** de
    `progress.json` (le fichier n'existe pas).

## Journal des CP

- **CP12** — **les 376 solutions de référence ont été EXÉCUTÉES : 376/376 passent. Et un accent
  grave orphelin faisait perdre 55 minutes de lecture à douze journées.**
  - **SEPT CONTRÔLES MÉCANIQUES, TOUS VERTS** : R1 liens de leçon des 365 journées **0 mort** ·
    R2 liens entre leçons **0** · R3 `practiceRefs` **0** · R4 exercices programmés **0** ·
    R5 **clés dupliquées 0** · R6 `readingMinutes` recompté **0 écart > 3 min** · R7 exercices
    sans solution ou sans test **0**. Le lab `terminal` **n'a pas été « re-corrigé »** : réparé
    au CP2, R3 le confirme vert.
  - **R5 acquitte la dette du CP3.** Les anomalies **n° 10** (sonde, CP2) et **n° 14**
    (PRODUCTION, CP3) sont le même défaut : une clé dupliquée dans un littéral d'objet, écrasée
    par la dernière, sans le moindre avertissement. Le contrôle **a été testé négativement** —
    clé 292 injectée → ❌ 1 détecté → fichier restauré → ✅ 0. Motif d'indentation **élargi de
    2 espaces exacts à 1-8**, sans quoi il aurait été vert *par construction*.
  - **ANOMALIE n° 24, ET ELLE ÉTAIT DANS LE PRODUIT** : `minutesDeLecture` retirait le code en
    ligne avec ``/`[^`]*`/g``, **sans exclure le saut de ligne**, sur la CONCATÉNATION
    journée + leçons + correction. **Un seul document sur 858** porte un nombre impair
    d'accents graves hors blocs : `prompt-engineering.md`, qui montre une clôture ```json
    littérale — **contenu juste**. Son accent orphelin s'appariait avec le suivant, dans le
    document d'après, et avalait des milliers de mots. **j197 annonçait 45 min au lieu de
    100.** **27 journées corrigées**, médiane 77 → **80**, total 31 141 → **32 289 min**.
    Correctif **dans la sonde, pas dans le corpus** — hash inchangé.
  - **LES AFFIRMATIONS EXÉCUTABLES ONT ÉTÉ EXÉCUTÉES** — le contrôle n'existait pas : une porte
    vérifiait qu'une solution de référence EXISTE, jamais qu'elle MARCHE. **376/376 passent
    l'intégralité de leurs propres tests**, dans le vrai exécuteur de l'application
    (`runExercise`), sans aucune réimplémentation. Six runtimes couverts.
  - **UN DÉTAIL D'HONNÊTETÉ** : au premier passage, 18 exercices `python-ds` étaient « non
    exécutables ici » (venv Data/ML absent). Publier **358/376 avec 18 non concernés** aurait
    été vrai et trompeur. Le script de provisionnement du dépôt a été lancé et **les 18 ont été
    réellement exécutés**. *Un environnement absent n'est pas un exercice qui passe.*
  - **CARTE DES LEÇONS, sur une règle déclarée d'avance** (« `week.skills` nomme ce que la
    semaine ENSEIGNE ; si une leçon l'enseigne sans le déclarer → corriger la CARTE ; si aucune
    ne l'enseigne → corriger la SEMAINE ») : **4 ajouts vérifiés en lisant la leçon**
    (`ai-security` +`llm`, `prompt-injection-defense` +`llm`, `rag-fundamentals` +`llm`,
    `agent-workflows-orchestration` +`archi`) et **6 retraits de semaine** (s27 `python`,
    s33/s34/s45 `se`, s35 `sql`, s48 `se`+`evalia`). **22 → 10 → 0 / 52.** Aucune étiquette de
    revue ne bouge. **La porte V49 a rougi** — son ledger est dérivé de la carte : régénéré,
    pas contourné.
  - **P2-CP11-1 REFORMULÉ après mesure complète** : il n'y a **aucun** exercice orphelin —
    **les 376 sont programmés** par au moins une journée, **0 déclaré-jamais-programmé**,
    **0 inatteignable**. L'énoncé exact est : **169 exercices sur 376 (45 %) ne sont
    atteignables que par le calendrier, jamais depuis une page de leçon.** Choix de navigation,
    chiffré, **non corrigé** — rattacher mécaniquement 169 exercices inventerait une intention
    que personne n'a écrite.
  - **Aucune leçon touchée**, corpus `92d5fae6…` inchangé. Seul change le nombre affiché en tête
    de 27 journées, et il devient exact.

- **CP11** — **la page `/projects` affichait « Journées rattachées : 0 » pour cinq projets sur
  sept.**
  - **Le défaut** : `day.project` valait `null` sur **355 journées sur 365** — seuls les projets
    1 et 2, écrits à la main, le portaient. `app/projects/page.tsx` filtre sur ce champ exact et
    écrit en commentaire « aucune heuristique de titre, aucun rattachement deviné ». La règle
    était bonne, la donnée manquait. **10 → 64 journées rattachées** (P3 0→6, P4 0→6, P5 0→6,
    P6 0→6, P7 0→30). `PeriodLoad` classait ces 54 journées en « étude » au lieu de « projet ».
  - **La correction est une DÉCLARATION, pas une heuristique** : les 9 semaines concernées sont
    **intégralement** des semaines de projet (6/6 journées titrées), donc `WEEK_PLANS[w].project`
    suffit — sans lire un seul titre. **Contrôle : les 64 déclarées = les 64 titrées, 0 faux
    positif, 0 oubli.**
  - **RECTIFICATION DU CP0 — ANOMALIE n° 21.** Le CP0 concluait « `rag` a 4 artefacts de
    pratique, `evalia` 4, `ml` 6 : la moitié IA pratique par projet plutôt que par exercice ».
    La colonne comptait les **`practiceRefs` déclarés par les leçons**, pas **les exercices que
    le calendrier programme**. Vrai chiffre vécu : `rag` **35**, `evalia` **43**, `ml` **49**,
    `llm` **46**. Ce qui reste vrai est autre chose : `lessons-map.mjs` **sous-déclare** ses
    `practiceRefs` — même famille que la sous-déclaration de compétences du CP10 → **CP12**.
  - **UNE CORRECTION DE CONTENU, JUSTIFIÉE PAR LA JOURNÉE** : **j292 s'intitule « Design
    patterns dans ton code »**, son cours développe Strategy, Adapter, Factory, Decorator,
    Repository et leurs anti-patterns — **et ne reliait pas `design-patterns-intro`**. Rattachée.
    Justifiée par le titre et le cours ; qu'elle tombe au mois 10 où `expectedScores.patterns = 3`
    en est la **conséquence, pas la raison**. `patterns` : 3 → **4 journées de pratique**,
    réparties j38 → j352 au lieu de s'arrêter à j76.
  - **RÈGLE DE SUFFISANCE gelée avant mesure** (niv 1-2 → exposition · niv 3 → pratique ·
    niv 4-5 → application) : **0 / 20 compétences dont le niveau promis dépasse ce que le
    parcours fait faire.**
  - **LE TROU DE 86 JOURS EST UN TROU DE DÉCLARATION, PAS DE CONSTRUCTION.** Lecture des
    livrables j218→j272 : « rag-from-scratch modulaire », « DocQA v0 sur corpus réel »,
    « Interface DocQA fonctionnelle », « DocQA sur Chroma », « Recherche hybride implémentée »,
    « DocQA sécurisé ». **Le parcours construit sans interruption de j218 à j272** et ne nomme
    « projet » que les six derniers jours. **NON déclaré unilatéralement** (cela ferait un projet
    de 54 journées face à un projet 3 de six) → **P1-CP11-2**.
  - **ANOMALIE n° 23 — `ABSENCE_DE_TRANSFERT` ne peut pas voir une compétence de SUBSTRAT.**
    `algo`, `ds`, `gitlinux`, `patterns` : le `Store` de TaskFlow EST une structure de données,
    chaque journée de projet commite, le projet 6 code une similarité cosinus. Ce qu'aucune
    journée de projet ne fait, c'est **relier une leçon** de ces compétences. **Ajouter ces liens
    pour faire tomber le compteur serait le contournement du §7** — et alourdirait la lecture de
    ces journées sans changer un mot de leur travail. **Publié, non corrigé.**
  - **63 leçons jamais reliées à une journée de projet (58 CORE, 5 OPTIONAL) — aucune violation**
    : le §2 du contrat définit CORE par « un **livrable** la suppose », pas « un projet l'emploie ».
    Les 5 OPTIONAL sont les 4 Next.js + `monitoring-production` du CP4 : **le statut OPTIONAL
    règle déjà la question**, forcer un livrable Next.js reste interdit par le §7.
  - **PROGRESSION DES PROJETS, chiffrée pour la première fois** : 3,67 → 3,43 → **3,17** → 3,33 →
    3,67 puis **5,00** au projet 6. **Aucune montée d'exigence pendant 136 jours**, puis un saut.
    **P1-CP11-1**, non corrigé — le corriger demanderait de réécrire trois énoncés de projet.
  - **ANOMALIE n° 22** : `cp2-graphe.mjs` lisait `d.project?.id` sur un champ **numérique** —
    `projet` valait null sur les 365 journées, masqué par le marqueur de titre `estProduction`.
    **Deux défauts se masquaient l'un l'autre.** Corrigé.
  - **Aucune leçon touchée, aucun texte de journée réécrit, aucune journée déplacée.** Corpus
    `92d5fae6…` inchangé.

- **CP10** — **douze semaines faisaient réviser ce qu'elles n'avaient pas enseigné. Il n'en
  reste aucune.**
  - **Le défaut est bien plus grave que « 13 thèmes décalés » (CP0)** : ce n'est pas
    l'étiquette qui bougeait, c'est **tout l'appareil de révision** — bilan, test pratique, test
    théorique, mini-projet, critères de passage, exercice d'architecture. Cas le plus net :
    **la revue de la semaine 8 évaluait le projet TaskFlow de la semaine 7**, alors que la
    semaine 8 enseigne HTTP, REST, Express et les premiers SELECT.
  - **Pourquoi quatre contrôles verts l'avaient laissé passer** : CP0 (« 52/52 revues ont un
    test pratique ») n'a jamais regardé SUR QUOI ; CP2/I3 (« aucune revue n'introduit une leçon
    inédite ») est vrai parce que les **leçons** d'une revue sont générées depuis ses journées —
    seul le **texte des tests** est écrit à la main ; CP7 a corrigé la FORME de l'étape de
    révision, pas son OBJET ; CP8 mesurait l'espacement sur les leçons liées, qui étaient
    justes. **Treizième occurrence : quatre propriétés vraies ne font pas une revue juste.**
  - **BLOC 2 (s28→s34) — décalage d'exactement une semaine, corrigé par RÉATTACHEMENT, sans
    rien réécrire.** Sept correspondances de contenu indépendantes le prouvent (le mini-projet
    « banc d'essai » = j-6 de s29 ; l'exercice d'archi « dessine le composant appel LLM
    robuste » = titre exact de j4 de s31 ; « calcule n docs × chunks × dimensions » = « Estimation
    de la taille de l'index » de s33). **Les marqueurs de revue mensuelle sont des ancres de
    calendrier et n'ont pas bougé** (mois 7 → s30, mois 8 → s34). **s34 a été écrite** : seule
    semaine du bloc sans narration à recevoir.
  - **BLOC 1 (s6→s13, puis s15) — une COMPRESSION, pas un décalage** : le plan des semaines
    donnait quatre semaines à HTTP/REST/Express/SQL, le plan des journées les a mis dans la
    **seule semaine 8**. Retard de −1 à −3, donc **aucun réattachement possible** → les
    **9 semaines ont été écrites depuis leurs propres journées**. **Rien de bon n'est perdu** :
    les neuf narrations retirées sont réévaluées ailleurs, table de correspondance publiée
    (curl/statuts → s8 temps 1 ; serveur Express → s8 temps 2 ; middleware d'erreurs → s8
    temps 3 ; SELECT/JOIN → s8 + s9 ; Postman → s9 mini-projet…). **s5 complétée** (et non
    réécrite) sur ses journées 5-6, seul ajout du CP10 à une semaine déjà juste.
  - **Mesuré, avant → après** : semaines dont la narration colle mieux à une AUTRE semaine
    **12 → 0** · semaines sans **aucun** mot de contenu commun avec leurs journées **6 → 0**.
    Le recouvrement médian baisse un peu (0,120 → 0,110) et **c'est normal** : une narration qui
    parle de ses six journées partage une plus petite fraction de vocabulaire avec chacune.
  - **Compétences déclarées par semaine : 22 → 10** (hors `autonomy`, exclue avec sa raison :
    **aucune leçon du corpus ne la déclare**, CP2). **4 corrigées** (s2 `algo`, s16 `http`,
    s25 `se`→`python`, s31 `jsts`) — la compétence n'y est pas travaillée du tout. **10 NON
    corrigées, et c'est délibéré** : la compétence EST travaillée mais aucune leçon ne la
    déclare — **s42 déclare `patterns` et sa journée 5 s'intitule « Design patterns dans ton
    code »**, s38 déclare `llm` sur six journées de prompt injection, s27 déclare `python` en
    NumPy/PyTorch. **Retirer ces déclarations rendrait la sonde verte et le produit faux** : le
    défaut est dans `lessons-map.mjs`, **c'est un constat pour le CP12**.
  - **MOIS — `expectedScores` : 0 évaluation sans source**, sous la lecture **cumulative**
    déclarée avant mesure (« à la fin du mois N, tu devrais être à ce niveau »). Sous une
    lecture non cumulative, huit mois seraient en défaut ; **les deux chiffres sont publiés**,
    c'est la cumulative qui est retenue car c'est celle que le contrat du CP1 a gelée.
    **Deux titres de mois réalignés** : le titre du **mois 3 décrivait le contenu du mois 2**.
  - **EFFET DE BORD MESURÉ : 8 journées changent d'étiquette, toutes des revues, toutes des
    corrections** (j42 `ds`→`jsts`, j56 `jsts`→`http`, j63 `http`→`sql`, j84 `sql`→`archi`,
    j91 `http`→`jsts`, j112 `jsts`→`se`, j203 `dl`→`llm`, j224 `llm`→`rag`). **Les 8 parcours
    du catalogue gardent exactement leur longueur** (365·119·54·85·31·15·29·188).
  - **UN TEST GELAIT L'ANCIENNE ÉTIQUETTE FAUSSE** : `v5421-visual-integrity` vérifiait que j57
    précède j84 dans le parcours data-ml ; j84 ayant quitté ce parcours, l'assertion devenait
    `6 < -1`. **Le test n'a pas été supprimé et aucun seuil n'a bougé** : la paire de contrôle
    devient (57, 82), toutes deux dans le parcours, les gardes d'ordre et de longueur intactes.
  - **Aucune journée déplacée, ajoutée ou retirée. Aucune leçon touchée.** Corpus `92d5fae6…`
    inchangé. **52 semaines, 12 mois.**

- **CP9** — **`difficulty` ne décrivait pas la journée, il décrivait sa position dans la
  semaine. 234 journées reçoivent une valeur dérivée du travail demandé.**
  - **Le constat du CP0 était en dessous de la vérité** : ce n'était pas « une longue plage
    constante », c'était une **constante codée en dur** dans le générateur (`difficulty: 3`
    pour toute journée planifiée, `2` pour toute revue). La suite valait `3,3,3,3,3,3,2`
    répétée **40 fois** à partir de j91. Aucune journée 91-365 n'avait jamais eu de difficulté
    décidée.
  - **Sept facteurs déclaratifs, écrits avant mesure**, échelle 0-2 : F1 nouveauté (premier
    contact de travail + ouverture de compétence) · F2 autonomie (**recouvrement Jaccard entre
    l'énoncé du guidé et celui de l'exercice**) · F3 guidance (volume guidé + correction) ·
    F4 complexité (profondeur de prérequis réels, graphe CP2) · F5 intégration (compétences
    distinctes) · F6 ambiguïté (étapes numérotées) · F7 responsabilité du livrable.
    **Exclues d'avance** : toutes les sections présentes sur exactement les 78 journées 1-90
    — elles mesurent la RÉDACTION, pas le travail.
  - **Calibration sur un jugement humain indépendant** : les 78 journées 1-90 portent une
    `difficulty` écrite à la main. **Deux calibrations publiées** : A (minimiser l'erreur)
    donne 48/78 mais est **DÉGÉNÉRÉE** — elle prédit le mode et remet 360 journées à 3 ;
    B (quantiles, **RETENUE**) donne **43/78 = 55 % exact, 90 % à un niveau près, erreur
    absolue 0,55**. **55 % n'est pas un triomphe et n'est pas présenté comme tel** : c'est
    assez pour ordonner 365 journées, pas pour contredire un auteur sur une journée — d'où la
    conservation des 78 témoins.
  - **Résultat** : répartition **1:4 · 2:70 · 3:151 · 4:95 · 5:45** (avant : 4 · 68 · **280** ·
    13 · **0**). Corrélation difficulté × jour = **0,463**. Plages constantes 131 → **198**.
    Courbe à **deux crêtes** (mois 7-9 et 11), creux réel au mois 10 — **pas une rampe**, ce
    que le brief interdisait nommément.
  - **EFFET SUR LA CHARGE, PUBLIÉ SANS ARRANGEMENT** : **L1 = 0 ✅ · L2 = 0/52 ✅ ·
    L3 = 6/365 ✅** — les trois seuils gelés passent, **sans qu'aucune difficulté ait été
    baissée pour cela**. Mais **44 journées de travail dépassent le budget haut** (mois 8 : 18,
    mois 9 : 12, mois 11 : 10 ; toutes de niveau 4 ou 5 ; dépassement médian **+25 min**).
    Le « 0 journée de travail en dépassement » du CP6 **était une conséquence de la
    constante**. Enregistré **P1-CP9-1**.
  - **TROIS ANOMALIES DE SONDE (n° 18, 19, 20)** — aucune n'était détectable tant que
    `difficulty` était figée. **n° 18** : le découpage coupait sur `###`, or tout le contenu de
    « Pratique autonome » vit dans `### Exercice principal` — **F6 valait 2 sur les 365
    journées** (facteur mort, visible dans la matrice de corrélation) et F2 ne lisait que le
    livrable. **n° 19** : le §5.2 du contrat gelé dit que le minutage explicite **REMPLACE** la
    fourchette ; le code faisait `Math.max` — invisible tant que `[50,90]` passait sous
    l'annonce. **n° 20** : les 313 journées ouvrent leur pratique par « Tente seul au moins
    **30 minutes** » — **309 journées « annonçaient 30 min »** par cette seule phrase générique.
    **Une valeur figée ne masque pas seulement son information : elle masque les défauts de
    tout ce qui la consomme.**
  - **Fausse piste publiée** : F2 défini d'abord comme rapport de volumes avait le **signe
    inverse** (un énoncé d'une phrase donnait « peu d'autonomie ») — contradiction lisible dans
    `F2 × F6 = −0,30`. Remplacé par le recouvrement d'énoncés.
  - **Autres constats chiffrés** : **`hours` = 4.5 sur 365/365** face à une charge de 99 à
    341 min (**P1-CP9-2**, décision de promesse produit, non prise unilatéralement) ·
    **290/313** journées énoncent leur exercice en **une phrase** · **98/313** journées ont un
    exemple guidé qui **résout déjà** la tâche demandée · **projets 1 à 5 sans progression**
    (3,67 → 3,17 → 3,67) et **86 jours sans production entre j181 et j267**, sur les deux mois
    les plus exigeants (**P2, pour le CP11**) · découpage horaire toujours sur 26 journées.
  - **Périmètre d'écriture** : jours 1-90 **inchangés** (témoins de calibration), 52 revues
    **inchangées** (extrapolation hors domaine — la valeur dérivée est publiée, pas écrite),
    **234 journées de travail j91-j364** réécrites. **Aucune leçon touchée, aucun texte de
    journée réécrit.** Corpus `92d5fae6…` **inchangé**.

- **CP8** — **données de rétention. Le moteur n'est PAS construit, et c'était la consigne.**
  - Produit le **modèle de CONTACTS** des 20 compétences : `firstExposure`, `guidedPractice`,
    `independentPractice`, `application`, `reviewContacts`, `projectContacts`, `lastContact`,
    `gapSequence`, `maxGap`, `fenetre80pourcent`, `ecartRevueMedian`, `expectedLevel`.
    Artefacts : `scripts/v73/cp8-retention.mjs`, `docs/v73/retention-contacts.json`,
    `docs/v73/V73-RETENTION-READINESS.md`. **Aucune donnée d'apprenant, aucun score de mémoire**
    — le fichier le déclare en tête.
  - **Les cinq définitions d'anomalie sont écrites AVANT la mesure** : `ABANDON_PRÉMATURÉ`
    ≥ 180 j de silence final · `RÉPÉTITION_LOCALE` 80 % des contacts en ≤ 45 j ·
    `SILENCE_EXCESSIF` un intervalle ≥ 120 j · `RAPPEL_TROP_PROCHE` médiane des écarts
    revue ↔ dernier contact ≤ 2 j · `ABSENCE_DE_TRANSFERT` aucune journée de projet.
  - **RÉSULTAT CENTRAL, PUBLIÉ ET DÉLIBÉRÉMENT NON CORRIGÉ** : `RAPPEL_TROP_PROCHE` touche
    **15 compétences sur 20, avec une médiane de 1 jour**. Une revue de fin de semaine rappelle
    ce qui a été vu l'avant-veille. **C'est la raison d'être du Retention Engine** ; le corriger
    à la main dans les 52 revues reviendrait à bricoler ce que le moteur doit décider.
  - **DEUX ANOMALIES STRUCTURELLES CERTAINES CORRIGÉES**, et seulement celles-là. **j351**
    « Révision algo pour entretien » ne reliait que 4 leçons de communication : elle relie
    désormais aussi `algorithmic-thinking`, `data-structures-intro`, `recursion`. **j352**
    « Questions système et IA » relie désormais `architecture-basics`,
    `system-design-scaling`, `design-patterns-intro`. Les deux sont justifiées par **le texte
    de ces journées elles-mêmes**, pas par le besoin de verdir une métrique. Effet :
    `ds` dernier contact **j35 → j351**, `patterns` **j76 → j352**, `ABANDON_PRÉMATURÉ` 6 → 4,
    `ABSENCE_DE_TRANSFERT` 7 → 4. Effet en aval non provoqué : la revue **j357** reprend
    automatiquement ces 6 leçons (4 → 7 leçons revues), et reste **BALANCED** (98–155).
  - **ANOMALIE DE SONDE n° 17 PUBLIÉE** : le marqueur de journée de PRODUCTION était
    `^Projet \d` — il rate les **30 journées « DocSense : … »**, qui sont le projet final et le
    plus gros livrable des 365 jours. `dl`, `llm` et `agents` étaient signalées « aucune
    application » à tort. Corrigé : `ABSENCE_DE_TRANSFERT` **7 → 4** par la seule correction de
    sonde. **Douzième occurrence** du même défaut de fond : *mesurer un marqueur n'est pas
    mesurer la propriété*.
  - **NON corrigées, avec la raison écrite** : `algo`/`ds`/`patterns`/`gitlinux` sans journée de
    projet dédiée (elles sont pratiquées **dans** les projets des autres compétences ; créer un
    « projet algo » déplacerait le produit pour satisfaire un compteur) ; les 9
    `SILENCE_EXCESSIF` (c'est exactement ce que le moteur doit planifier).
  - **Charge revérifiée après modification** : **362 BALANCED · 3 UNDERLOADED · 0 HEAVY ·
    0 IMPOSSIBLE**. j351 = 230–277, j352 = 226–278. **L1 = 0 · L2 = 0/52 · L3 = 0.**
  - **Corpus INCHANGÉ** (`92d5fae6…`) — aucune leçon touchée au CP8.

- **CP7** — **zéro revue en dépassement (9 au CP6), et rien de ce qui fonctionnait n'a été
  retiré.**
  - **Conservé intégralement** : test pratique, test théorique sans notes, grille chiffrée, plan
    de remédiation — **52/52 pour chacun**. Leçons reliées par revue **inchangées** (1/5/7).
    **Aucune leçon retirée d'aucune revue.**
  - **Une seule correction, dans le générateur, pour les 52** : la liste « Leçons de fond à
    relire » devient **« Rappel actif, puis relecture ciblée »** — étape 1 de rappel, leçons
    fermées, budget calculé (3 min/leçon, plafond 20) ; étape 2 de relecture **uniquement** de
    ce qui n'a pas été restitué ; et le coût **écrit noir sur blanc**. **52/52 revues portent un
    rappel actif budgété (AVANT : 0).**
  - **TROIS CONTRIBUTIONS PUBLIÉES SÉPARÉMENT**, pour ne pas s'attribuer un gain de mesure :
    CP6 = 3 IMPOSSIBLE + 6 HEAVY ; texte APRÈS mais **apprenant qui relit tout** = 2 + 4 (gain
    réel mais modeste) ; texte APRÈS **consigne suivie** = **0 + 0**. **Aucun seuil déplacé.**
  - **Déciles des revues** : borne haute médiane **248 → 186**, P90 **314 → 264**, max
    **373 → 291** (sous le budget).
  - **DEUX ANOMALIES DE SONDE (n° 15 et 16)**, trouvées en mesurant la correction. **n° 15** :
    le bloc de rappel contient ses propres minutes, ramassées par le scan de minutage de la
    **pratique** — moyenne des revues 129 → **180 min sans qu'aucun exercice change**, six
    revues devenues HEAVY pour cette seule raison. **n° 16** : la revue **j357** écrit
    « **Chaque jour** : 2 exercices de 25 min … **Fin de semaine** : 60 min » et le modèle
    sommait ces **190 min sur la seule journée**. Règle de **portée hebdomadaire** que le
    contrat V72 portait déjà, restaurée ; **une seule revue sur 52** concernée.
  - **Laissé au CP8, explicitement** : l'**espacement** reste à **1 jour de médiane**. Le
    corriger demande de décider quoi rappeler quand — c'est le modèle de contacts du CP8, pas un
    bricolage dans une revue. Ce que le CP7 lui apporte : la revue demande maintenant une
    **récupération sans support**, seule opération dont un moteur de rétention tire un signal.
  - **Corpus INCHANGÉ** (`92d5fae6…`) — aucune leçon touchée. **L1 = 0 · L2 = 0/52 · L3 = 0.**

- **CP6** — **modèle de charge décomposé. Aucune journée structurellement impossible : le CP6
  n'a rien à corriger, et c'est le résultat correct.**
  - **L1 = 0 ✅ · L2 = 9/52 ≤ 12 ✅ · L3 = 6/365 ≤ 20 ✅** — les trois seuils de charge gelés
    passent.
  - **Décomposition par poste** (moyenne, borne haute) : journée de travail = texte 8 · correction
    3 · **leçons 70** · guidé 3 · **pratique 93** ; revue = texte 7 · correction 3 ·
    **leçons 109** · **pratique 129**. **Deux postes font 95 % de la charge** ; le texte propre
    d'une journée pèse **huit minutes**. Alléger un cours ne changerait pratiquement rien.
  - **Déciles** — travail : bas P50 = 139, haut P50 = **191**, haut max **294** (sous le budget).
    Revues : haut P50 = **248**, P90 = **314**, max **373**. **Tout le dépassement est sur les
    revues.**
  - **Sensibilité** : les 3 IMPOSSIBLE de l'hypothèse de référence (j224, j231, j238, toutes des
    revues) ne le sont que sous **2 hypothèses sur 6** → **aucune journée structurellement
    impossible**.
  - **CP0 → CP6, les deux lectures publiées côte à côte sur le MÊME état** : budget-point 270 →
    6 IMPOSSIBLE / 54 HEAVY / 255 BALANCED / 50 UNDERLOADED ; fourchette [240,300] →
    **3 / 6 / 350 / 6**. **L'écart vient entièrement du seuil, pas du produit.** Chiffres CP0
    non réécrits (S7).
  - **Les 6 UNDERLOADED sont toutes justifiées** par le §5.5 : j36, j40, j82 sont des journées
    de **bascule** (ouverture de compétence) ; j126, j154, j364 des revues de **respiration ou
    de bilan**. **Zéro non justifiée.**
  - **Diagnostic livré au CP7** : les 9 revues en dépassement annoncent **130 à 190 min de
    pratique** et y ajoutent **82 à 171 min de relecture jamais budgétée**. Deux profils —
    **j140** = problème de relecture ; **j217**/**j357** = problèmes de pratique.
  - **Aucun fichier de produit modifié.** Artefacts : `scripts/v73/cp6-charge.mjs`,
    `docs/v73/charge-365.json`.

- **CP5** — **prérequis clos, la convention A/B est supprimée définitivement.**
  Sur **306 citations** en section « Prérequis » : **`VALID_PRIOR_KNOWLEDGE` 214 ·
  `VALID_RECAP` 48 · `EXPLICIT_LOOKAHEAD` 44 · `INVALID_FORWARD_PREREQUISITE` 0 ·
  `AMBIGUOUS` 0.** Résultat **maintenu après** les 16 rattachements du CP3 et les 2 ancres du
  CP4.
  - Les **47 nouvelles relations** créées par le CP3 sont **toutes valides**, et l'ordre a été
    construit pour cela, pas constaté après coup. Deux cas nommés : `cloud-compute-storage →
    docker-containers` est un prérequis **réel** (18 mentions), satisfait uniquement parce que
    le CP3 a introduit Docker au j291 ; `cloud-fundamentals → docker-containers` est devenu un
    `EXPLICIT_LOOKAHEAD` parce que ce prérequis **n'était pas réel** (3 mentions, aucune
    commande).
  - **RAFFINEMENT DE CLASSEMENT DÉCLARÉ** : 3 citations ADVANCED → ADVANCED
    (`k8s-security`/`k8s-troubleshooting` → `k8s-networking-services`,
    `release-incident-recovery` → `deployment-strategies`) étaient d'abord marquées INVALID. Or
    **le parcours ne fait jamais lire la leçon source non plus** : ces citations décrivent
    l'ordre interne de l'étagère, qui est juste. Règle générale posée : *une citation dont la
    leçon source n'est pas programmée ne peut pas être un défaut d'ordre du parcours.*
  - **Limite déclarée** : le registre porte sur les sections « Prérequis ». Une notion supposée
    au détour d'un paragraphe lui échappe — seul le **CP13** peut l'attaquer.
  - **Aucun fichier de produit modifié au CP5.** Corpus inchangé (`92d5fae6…`).

- **CP4** — **statut explicite des 128 leçons, aucune zone grise.**
  **CORE 116 · ADVANCED 7 · OPTIONAL 5 · REFERENCE 0 · DEPRECATED 0 · ZONE GRISE 0.**
  Classement **dérivé de propriétés déclarées** (`scripts/v73/cp4-statuts.mjs`), avec un calcul
  de noyau en **point fixe** — la 3ᵉ condition du contrat est récursive, une passe unique
  donnerait un résultat dépendant de l'ordre de parcours.
  - **Aucune leçon dépréciée** : la mesure ne désigne aucune redondance.
  - **DEUX ANCRES AJOUTÉES** (les seules modifications de contenu du CP4) : `k8s-security` et
    `linux-ssh-remote` n'étaient citées par **aucune** leçon programmée — la zone grise exacte
    que I5 interdit. Pointeurs posés dans `k8s-config-probes` (j321) et
    `linux-processes-signals` (j72), avec la mention qu'elles ne sont programmées par aucune
    journée.
  - **RÉSULTAT INCONFORTABLE, PUBLIÉ ET NON CORRIGÉ** : quatre des cinq OPTIONAL sont les
    **leçons Next.js que le CP3 vient d'insérer**. Elles sont enseignées — le trou P0 est
    fermé — mais **aucun projet des 365 journées ne demande de construire avec Next.js**. La
    cinquième, `monitoring-production`, est enseignée au **j79 et plus jamais reprise** (elle
    n'entre pas dans la revue de sa semaine, plafond de 7 atteint). **Forcer un livrable
    Next.js reviendrait à déplacer le produit pour satisfaire une métrique** (§7 anti-Goodhart)
    — le fait est publié, et se traitera au CP11 (pratique) et au CP8 (espacement) s'il doit
    l'être.
  - Corpus `77feba18…` → **`92d5fae6…`**, 9 gels mis à jour.

- **CP3** — **les trois trous P0 sont fermés.** Les **15 leçons** de CSS, Next.js et cloud sont
  entrées sur **16 journées existantes dont le sujet les porte**, chacune recevant un **vrai
  passage de cours** (3–4 paragraphes écrits pour cette journée). **Hors parcours : 22 → 7.**
  - **CSS** j87 (plateforme web : DOM + balisage sémantique + `css-fundamentals`, sur la
    journée qui OUVRE le front) · j103 (`css-flexbox`, `css-grid` — la disposition EST une
    question d'accessibilité) · j117 (`responsive-design` — l'écran étroit est l'état
    non-heureux le plus oublié).
  - **Next.js** j99 (`nextjs-foundations`, par le routage) · j102 (`nextjs-rendering`, décision
    de performance) · j104 (`nextjs-server-client-components`, frontière d'architecture) ·
    j111 (`nextjs-data-production`, production).
  - **Cloud** j291 (`docker-containers` + `cloud-fundamentals`) · j293 (`cloud-networking`,
    `cloud-compute-storage`) · j303 (`cloud-aws-core`, `cloud-azure-core`) · j325
    (`cloud-finops`) · j326 (`iac-fundamentals`). **Docker cesse d'être enseigné en un seul
    jour** : introduit j291, approfondi j320 (défaut relevé par V72).
  - **RECTIFICATION MESURÉE DU CP0** : la ressource annoncée — « 31 journées UNDERLOADED entre
    j91 et j180 » — **n'existe pas** sous le budget gelé au CP1 (`[240,300]` au lieu de 270) :
    il n'y a que **6 UNDERLOADED sur 365, aucune entre j91 et j180**. Le chiffre du CP0 était
    une conséquence du seuil. Il est **conservé tel quel** (règle S7). La place réelle est la
    **marge** : journée de travail médiane à 192 min, **77 journées à ≥ 90 min de marge** entre
    j91 et j180.
  - **UNE SEULE LEÇON MODIFIÉE** sur 128 : `cloud-fundamentals`, dont le prérequis
    `docker-containers` était **faux et bloquant** — 3 mentions de « conteneur » en 2 896 mots,
    aucune commande, exemple guidé sur une VM. Converti en renvoi **annoncé** avec la notion
    donnée sur place, selon la convention V71. (Contre-épreuve : `cloud-compute-storage`
    mentionne le conteneur **18 fois** — prérequis réel, leçon placée après j291.)
  - **Charge inchangée** : 350 BALANCED · 6 HEAVY · 6 UNDERLOADED · 3 IMPOSSIBLE, **exactement
    les mêmes journées qu'avant** (toutes des revues). **Aucune journée dégradée.**
  - **Effet non anticipé** : les revues des semaines 42, 44 et 47 (j294, j308, j329) ont
    automatiquement repris les leçons cloud — la première révision espacée existe déjà.
  - **ANOMALIE n° 14 publiée** : deux des cinq rattachements cloud n'ont eu **aucun effet**, les
    jours 291 et 326 possédant déjà une clé dans `LESSONS_V67` — **clé dupliquée écrasée par la
    dernière**. Même piège qu'au CP2 (n° 10), cette fois en **production**. Fusionné dans les
    clés existantes ; le CP14 ajoutera un contrôle de clé dupliquée.
  - Corpus `c1ac869e…` → **`77feba18…`**, **9 gels de corpus** mis à jour.

- **CP2** — graphe canonique. **`lib/curriculum-graph.mjs` (V31) RÉUTILISÉ, pas dupliqué** ; le
  CP2 lui ajoute **l'axe temporel** qui lui manquait (365 journées). Sortie :
  `docs/v73/curriculum-graph.json` (202 Kio) + la porte `scripts/v73/v73-graphe-check.mjs`.
  **I2 = 0 · I3 = 0 · I4 = 0 · I8 = 0 · I10 = 0 · C9 = 0 · invariants intacts.**
  **Tests négatifs : 10 / 10**, restauration contrôlée par `git status`.
  **Une seule modification du produit** : la référence morte `{ kind:'lab', id:'terminal' }`
  retirée de `terminal-shell-filesystem` (traitée ici et non au CP12, pour qu'une porte
  durablement rouge ne masque pas les régressions). Corpus **inchangé** (`c1ac869e…`).
  **CORRECTION IMPORTANTE DU CP0 SUR `cloud`** : lu déclarativement (leçons qui portent la
  compétence, pas `day.skill`), `cloud` est **enseignée depuis j68 sur 41 journées** et
  **étiquetée sur 0**. Le trou réel est double : le calendrier ne le dit jamais, et le cloud
  *proprement dit* (AWS, Azure, réseau, IaC, FinOps) est hors parcours.
  **Autres faits nouveaux** : `autonomy` = 12 applications, 1 pratique, **0 leçon déclarante**
  (repli déclaratif sur l'étiquette, nommé dans le code) ; `dl`, `llm`, `agents` = **0
  application** pour 133 journées d'exposition.
  **HUIT ANOMALIES DE SONDE PUBLIÉES (n° 6 à 13)**, dont trois trouvées par les tests négatifs
  eux-mêmes. La plus grave, **n° 12** : le marqueur d'annonce était cherché dans tout le
  paragraphe et « Aucune X n'est supposée » était accepté — or cette phrase parle du sujet
  PROPRE de la leçon. **83 exigences réelles** étaient classées « renvoi annoncé »
  (`css-flexbox → css-fundamentals`…), le graphe REQUIRES perdait **129 arêtes**, et le
  « 0 cycle » du premier passage ne prouvait rien. Portée corrigée : encadré `>` ou phrase.
  **n° 13** : l'emphase Markdown coupe les phrases (`programmées plus loin** dans le parcours`
  ne contient pas « plus loin dans le parcours ») — la normalisation retire désormais `*` et
  les accents graves. Classification finale : **263 REQUIS · 43 LOOKAHEAD**.

- **CP1** — contrat gelé, **aucun fichier de produit modifié**. Le point qui commande la suite :
  le budget passe d'un **point à 270 min** à une **fourchette `[240, 300]`**, conformément à
  l'objectif réel de 4-5 h/jour et à l'interdiction explicite du brief de normaliser les
  365 journées. Le déplacement est **déclaré avant toute correction**, les chiffres CP0 sont
  **conservés tels quels**, et le CP6 publiera les deux lectures côte à côte. Second point :
  **L2 est fixé à 12 revues en dépassement, pas à 5** — le CP0 en mesure 18, et descendre à 5
  obligerait à retirer de la matière à treize revues sans preuve que chacune est en faute. La
  raison est écrite avant la mesure et le seuil ne bougera plus. Troisième point : **rien n'est
  réservé à l'utilisateur** — le brief tranche que CSS, Next.js et Cloud restent dans la
  promesse, donc fermer les trois P0 est une **obligation** de ce sprint et non une option, ce
  que traduit **C15 dans le socle exigé même pour `CANDIDATE`**.

- **CP0** — audit forensique, lecture seule. **Aucun fichier de produit modifié.**
  - **P0-1** `cloud` déclarée et chiffrée au mois 11, **0 journée** ; 39 leçons la déclarent,
    26 sont programmées sous une autre étiquette, 13 hors parcours.
  - **P0-2** CSS enseigné nulle part (4 leçons hors parcours, 16 969 mots).
  - **P0-3** Next.js : 4 leçons hors parcours, aucune séquence.
  - **22** leçons hors parcours (pas 25 — V72 en a raccroché 3), **70 306 mots = 16 % du
    corpus**, en 4 grappes : cloud/IaC 7 · web platform + Next.js 8 · Kubernetes 3 ·
    Linux/livraison 4.
  - **Prérequis : 37 candidats, 0 `INVALID_FORWARD_PREREQUISITE`, 37 `EXPLICIT_LOOKAHEAD`.**
    L'ambiguïté A/B est close par une taxonomie sémantique. Classement fait sur la **clause
    d'optionalité lue**, pas sur l'étiquette.
  - **Charge** : BALANCED 264 · HEAVY 55 · UNDERLOADED 40 · IMPOSSIBLE 6 — mais la
    **sensibilité va de 0 à 60 IMPOSSIBLE** selon la vitesse de lecture et le coût de la
    relecture. Aucune décision ne doit reposer sur « 6 ».
  - **Ressource clé pour le CP3** : **31 des 40 journées UNDERLOADED sont entre j91 et j180**
    (mois 4-5-6). C'est là que CSS et Next.js peuvent entrer sans créer de journée.
  - **Revues** : 52/52 ont test pratique, test théorique, grille chiffrée, remédiation, rappel
    sans notes ; **0 n'introduit une leçon inédite**. Deux vrais défauts : la relecture
    (**104 min médians**) n'est **jamais budgétée** face aux 90 min annoncés, et l'**espacement
    médian est de 2 jours**.
  - **Récurrence** : `algo`, `ds`, `patterns`, `gitlinux` sans aucun rappel pendant les **290 à
    326 derniers jours**, alors que j365 propose de l'algorithmique.
  - **Progression** : `difficulty` = **3 sur 271 journées consécutives** (j91→j360) ;
    découpage horaire présent sur **26 journées, toutes au mois 1**.
  - **Semaines** : **13 / 52** thèmes décrivent mieux une autre semaine ; deux blocs de
    décalage (s8-s13, s28-s34), **aucune permutation constante** ne les corrige.
  - **Références mortes** : `api-idempotency` et `dlq-duplicate` **déjà corrigées par V72**
    (citées par 0 leçon) ; **1 seule référence morte réelle** — lab `terminal` sans route.
  - **CINQ ANOMALIES DE SONDE PUBLIÉES** (règle 6) : 24 → 0 faux identifiants morts ; 9 → 0
    après restriction aux composés ; 10 → 1 `practiceRefs` (un lab est une **route**, pas un
    fichier) ; 5 → 0 sections « manquantes » (l'émoji varie) ; 5 → 0 prérequis « sans clause »
    (le préfixe `>` coupait la phrase). **Une propriété structurelle ne se détecte pas en
    scannant de la prose.**
  - **Non-régression académique** : échantillon de 24, graine **20260910** publiée avant le
    tirage, 17 domaines, 6 hors parcours, notes V71 de 4,79 à 5,00. **8 lues intégralement,
    16 contrôlées par sections. 24/24 complètes. Les 8 lues sont excellentes.** L'hypothèse
    « les cours sont mauvais » est **fausse**. Anomalie de tirage publiée : le premier jet
    donnait **0 leçon du milieu** (tri alphabétique des strates), corrigé en tourniquet.

## Tests

- **CP0** : lecture seule, aucun test rejoué (état hérité de V72 : 1420/1420 · tsc 0 ·
  52 gates · build OK).
- **CP1** : document seul, aucun code modifié — aucun test à rejouer.
- **CP2** : 1420/1420 · tsc 0 · 52 gates verts · porte V73 verte · 10/10 tests négatifs ·
  corpus `c1ac869e…` inchangé.
- **CP3** : 1420/1420 · tsc 0 · 0 violation de gate · porte V73 verte · corpus `77feba18…`
  (1 leçon modifiée, 9 gels regelés).
- **CP4** : 1420/1420 · tsc 0 · 0 violation de gate · porte V73 verte · corpus `92d5fae6…`
  (2 leçons modifiées, 9 gels regelés).
- **CP5** : mesure seule, aucun fichier de produit modifié — porte V73 verte, corpus inchangé.
- **CP6** : mesure seule, aucun fichier de produit modifié — corpus inchangé (`92d5fae6…`).
- **CP7** : 1420/1420 · tsc 0 · 0 violation de gate · porte V73 verte · corpus `92d5fae6…`
  **inchangé** (seuls le générateur et les 365 journées générées changent).
- **CP8** : 1420/1420 · tsc 0 · 0 violation de gate · porte V73 verte · corpus `92d5fae6…`
  **inchangé** · charge 362 BALANCED / 3 UNDERLOADED / 0 HEAVY / 0 IMPOSSIBLE.
- **CP12** : 1420/1420 · tsc 0 · 0 violation de gate (V49 régénérée) · porte V73 verte · corpus
  `92d5fae6…` **inchangé** · **R1→R7 = 0 défaut** · **376/376 solutions de référence exécutées
  et passantes** · 0/52 semaines déclarant une compétence non portée · L1 = 0 · L2 = 0/52 ·
  L3 = 6/365.
- **CP11** : 1420/1420 · tsc 0 · **build OK** · 0 violation de gate · porte V73 verte · corpus
  `92d5fae6…` **inchangé** · L1 = 0 · L2 = 0/52 · L3 = 6/365 · **64 journées de projet
  déclarées** = les 64 titrées · `days-difficulty-v73.mjs` régénéré identique.
- **CP10** : 1420/1420 · tsc 0 · 0 violation de gate · porte V73 verte · corpus `92d5fae6…`
  **inchangé** · 52 semaines · 12 mois · L1 = 0 · L2 = 0/52 · L3 = 6/365 · les 8 parcours du
  catalogue gardent leur longueur · `days-difficulty-v73.mjs` régénéré **identique** (preuve de
  non-circularité du CP9).
- **CP9** : 1420/1420 · tsc 0 · 0 violation de gate · porte V73 verte · corpus `92d5fae6…`
  **inchangé** · `data/progress.json` toujours absent · **L1 = 0 · L2 = 0/52 · L3 = 6/365** ·
  charge 315 BALANCED / 6 UNDERLOADED / **44 HEAVY** / 0 IMPOSSIBLE (le HEAVY est publié comme
  P1, pas masqué).
