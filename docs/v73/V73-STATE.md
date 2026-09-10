# V73 — ÉTAT D'AVANCEMENT

> Fichier de reprise. Mis à jour après **chaque CP**. En cas d'interruption : relire ce
> fichier, vérifier Git, reprendre au CP indiqué. **NE PAS refaire un CP terminé.**

## Position

- **dernier CP terminé** : **CP5**
- **CP courant** : —
- **NEXT_CP** : **CP6** — modèle de charge des 365 journées
- **NEXT_ACTION** : recalcul complet **APRÈS** de la charge des 365 journées, décomposée par
  poste (lecture · exemple guidé · pratique · correction · projet · revue · setup déclaré non
  mesuré), avec **P10 / P25 / médiane / P75 / P90 / max** et l'**analyse de sensibilité
  obligatoire** sur les six hypothèses gelées. Comparer **CP0 → CP6** en publiant les deux
  lectures côte à côte (budget-point 270 du CP0 et fourchette `[240,300]` du contrat CP1).
  **Ne traiter QUE les journées structurellement impossibles** — IMPOSSIBLE sous ≥ 4 des
  6 hypothèses. **Ne pas maquiller une journée en raccourcissant les cours.** État actuel
  (contrat CP1) : 350 BALANCED · 6 HEAVY · 6 UNDERLOADED · 3 IMPOSSIBLE, toutes des revues.

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
