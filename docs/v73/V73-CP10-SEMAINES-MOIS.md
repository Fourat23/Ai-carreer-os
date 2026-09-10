# V73 — CP10. Les 52 semaines et les 12 mois

**Résultat : douze semaines faisaient réviser ce qu'elles n'avaient pas enseigné. Il n'en reste
aucune.** Le CP0 avait signalé « 13 thèmes sur 52 décrivent mieux une autre semaine ». Le défaut
est plus grave que ce que ce mot laissait croire : ce n'est pas l'étiquette qui était décalée,
**c'est tout l'appareil de révision** — bilan, test pratique, test théorique, mini-projet,
critères de passage et exercice d'architecture.

**Les 52 semaines et les 12 mois restent 52 et 12. Aucune journée n'a bougé.**

---

## 1. Le défaut, tel qu'on peut le lire sans aucune sonde

La semaine 8 est le cas le plus net. Voici ses six journées, et ce que sa revue du dimanche
demandait de réviser :

| | |
|---|---|
| **journées de la semaine 8** | HTTP en profondeur · REST design · Node natif puis Express · Express : routes, middlewares, couches · Validation, erreurs centralisées · SQL : SELECT, WHERE, JOIN |
| **thème déclaré** | « PROJET 1 : TaskFlow CLI + revue mensuelle 2 » |
| **test pratique** | « Le projet EST le test : CRUD de tâches, persistance JSON, commandes list/add/done/rm/stats » |
| **où se trouve ce projet** | **semaine 7**, journées 44 à 47 |

**La revue de la semaine 8 évaluait le projet de la semaine 7, et rien de ce que la semaine 8
avait enseigné.** Ce n'est pas une nuance de formulation : un apprenant qui suit la revue
travaille une semaine entière sur HTTP, REST et Express, puis passe son évaluation
hebdomadaire sur un gestionnaire de tâches en ligne de commande.

Et ce n'est pas isolé :

| semaine | ses journées enseignent | sa revue évaluait | l'écart |
|---|---|---|---|
| **s6** | TypeScript, POO, design patterns, clean code, debugging | piles, files, listes chaînées, arbres, BFS/DFS | s5 |
| **s8** | HTTP, REST, Express, validation, SQL | le projet TaskFlow | s7 |
| **s10** | Projet 2 livré, sécurité OWASP, auth | « construire un serveur Express » | s8 |
| **s11** | réseau, Linux, Git, documentation, lecture de code | middleware d'erreurs Express | s8 |
| **s12** | architecture 3-tiers, observabilité, cache, Python | « SELECT, JOIN, agrégats » | s8-s9 |
| **s13** | Projet 2 durci, premier front React | « collection Postman du projet 2 » | s9-s10 |
| **s15** | routing, état partagé, contexte, performance, a11y | effets, fetch, formulaires | s14 |
| **s28** | NLP, embeddings, attention, transformers | MLP sur MNIST, régularisation | s27 |
| **s29** | LLM, API, température, coûts, hallucinations | tokenisation et attention | s28 |
| **s30** | prompt engineering, structured outputs, function calling | « appeler une API LLM, provoquer 3 hallucinations » | s29 |
| **s32** | RAG : embeddings, similarité, citations, pipeline | « assistant à 2 outils, boucle tool-call » | s30-s31 |
| **s34** | interface DocQA, session, robustesse | « extraction PDF, métadonnées par chunk » | s33 |

### Pourquoi les sondes précédentes ne l'avaient pas vu

Ce défaut est passé sous **quatre contrôles** qui, chacun, mesuraient une propriété vraie mais
insuffisante :

- **CP0** : « 52/52 revues ont un test pratique, un test théorique, une grille chiffrée, un plan
  de remédiation ». Vrai — et **jamais on n'avait vérifié sur quoi portaient ces tests**.
- **CP2, règle I3** : « aucune revue n'introduit une leçon inédite ». Vrai : les **leçons**
  reliées à une revue sont générées depuis ses propres journées. Seul le **texte** des tests
  est écrit à la main, semaine par semaine. Une revue peut donc simultanément lier les bonnes
  leçons et évaluer les mauvaises.
- **CP7** : les 52 revues ont reçu un rappel actif budgété. La correction portait sur la
  **forme** de l'étape de révision, pas sur son **objet**.
- **CP8** : l'écart médian revue ↔ dernier contact valait 1 jour. Mesuré sur les leçons liées —
  qui étaient justes.

> **La leçon de méthode, la treizième du même genre dans ce sprint : quatre contrôles verts sur
> quatre propriétés vraies ne font pas une revue juste.** Aucun ne posait la question
> « qu'est-ce que cette page demande de réviser ? ».

---

## 2. Deux blocs, deux causes distinctes, deux corrections distinctes

### Bloc 2 — s28 à s34 : un décalage d'exactement une semaine

Sept correspondances de contenu indépendantes le confirment, et aucune n'a besoin d'une mesure
pour être lue :

| narration déclarée en | décrit les journées de | preuve textuelle |
|---|---|---|
| s28 « MLP, régularisation, courbes » | **s27** | s27 j4-j6 = MLP, entraînement, régularisation |
| s29 « NLP, tokenisation, attention » | **s28** | mini-projet « Le trajet d'une phrase dans un transformer » = s28 j6 |
| s30 « LLM, APIs, hallucinations » | **s29** | mini-projet « Petit banc d'essai » = s29 j6 « Banc d'essai LLM » |
| s31 « prompt engineering, structured outputs » | **s30** | s30 j1-j2, titres identiques |
| s32 « function calling, tool use » | **s31** | exercice d'archi « dessine le composant *appel LLM robuste* » = s31 j4, titre identique |
| s33 « RAG v1 : chunking, embeddings, retrieval » | **s32** | s32 j1-j3 |
| s34 « RAG multi-formats, métadonnées » | **s33** | exercice d'archi « calcule n docs × chunks × dimensions » = s33 j4 « Estimation de la taille de l'index » |

**Correction : réattachement, pas réécriture.** Chaque narration a été déplacée d'une semaine
vers l'amont, vers les journées qu'elle décrit. **Rien n'a été réécrit de ce qui était bon** —
le test du tokenizer, le banc d'essai LLM, le composant d'appel robuste, le calcul de la taille
d'index sont intacts, sur la bonne semaine.

Deux ajustements accompagnent le déplacement :

- **les marqueurs de revue mensuelle sont des ancres de calendrier et ne se déplacent pas.**
  Le mois 7 finit en s30, le mois 8 en s34. La mention « + revue mensuelle 7 » a donc quitté la
  narration qui descendait vers s29 et rejoint celle qui arrive en s30 — de même pour le
  mois 8 ;
- **s34 a été écrite** — c'est la seule semaine du bloc qui n'avait aucune narration à
  recevoir. Elle est écrite depuis ses six journées : interface du DocQA, gestion de session,
  optimisation du prompt de génération, robustesse et cas limites, bilan RAG.

Une narration reste orpheline : l'ancienne s28 (MLP sur MNIST). Elle décrit les journées 4 à 6
de s27, **qui possède déjà sa propre narration** couvrant ses journées 1 à 3. Elle n'est donc
pas perdue par négligence : elle est redondante avec le mini-projet de s27, qui demande déjà le
MLP en PyTorch. **Le fait est publié plutôt que passé sous silence.**

### Bloc 1 — s6 à s13, puis s15 : une compression, pas un décalage

Ici il n'existe **aucun décalage constant**, et le CP0 avait raison de le dire. Le plan des
semaines allouait quatre semaines à HTTP, REST, Express et SQL (s9, s10, s11, s12) ; le plan
des journées a compressé tout cela dans **la seule semaine 8**, et employé s9 à s12 à autre
chose — SQL et projet 2, réseau et Linux, architecture et observabilité. Le retard passe donc
de −1 à −3 semaines, puis se résorbe.

**Aucun réattachement n'est possible.** Les neuf semaines concernées — s6, s7, s8, s9, s10,
s11, s12, s13 et s15 — ont donc été **écrites à partir de leurs propres journées**, thème,
bilan, test pratique, test théorique, mini-projet, checklist, critères de passage et exercice
d'architecture.

**Rien de ce qui était bon n'est perdu, et cela se vérifie une par une :**

| narration retirée | ce qu'elle évaluait | où ce contenu est désormais évalué |
|---|---|---|
| ancienne s6 | piles, files, listes chaînées, arbres | **s5**, dont le test théorique et les critères ont été complétés sur ses journées 5 et 6 |
| ancienne s7 | TypeScript, POO, FP | **s6** (typage, POO, patterns) et **s7** (composition et pureté, j43) |
| ancienne s8 | le projet TaskFlow | **s7**, où le projet se déroule réellement |
| ancienne s9 | curl, statuts HTTP, DNS | **s8**, premier temps du test pratique |
| ancienne s10 | serveur Express, routes, validation | **s8**, deuxième temps |
| ancienne s11 | middleware d'erreurs, validation stricte | **s8**, troisième temps |
| ancienne s12 | SELECT, JOIN, agrégats, injection SQL | **s8** (premiers SELECT) et **s9** (dix requêtes, injection) |
| ancienne s13 | collection Postman du projet 2 | **s9**, mini-projet |
| ancienne s15 | effets, fetch, formulaires contrôlés | **s14**, qui les enseigne et les évaluait déjà |

**La semaine 5 a été complétée plutôt que réécrite** : sa narration couvrait ses journées 1 à 4
(récursion, hash maps) et ignorait les journées 5 et 6 (piles, files, listes chaînées, arbres).
Trois questions de théorie et un critère de passage y ont été ajoutés. C'est le seul endroit du
CP10 où du contenu a été ajouté à une semaine déjà juste.

---

## 3. Mesure, avant et après

La sonde compare le vocabulaire de la narration d'une semaine (thème + bilan + les deux tests +
mini-projet + critères + exercice d'architecture) au vocabulaire de ses six journées (titres et
leçons reliées), et cherche s'il existe **une autre semaine que la narration décrit mieux**.
Un écart est déclaré significatif au-delà de 0,03 de Jaccard — les écarts plus petits sont du
bruit et ne sont pas traités comme des défauts.

| | AVANT | APRÈS |
|---|---|---|
| semaines dont la narration colle mieux à une autre semaine (écart significatif) | **12 / 52** | **0 / 52** |
| semaines dont la narration ne partage **aucun** mot de contenu avec ses journées | **6** (s8, s11, s12, s28, s29, s32) | **0** |
| recouvrement propre médian | 0,120 | **0,110** |

**Le recouvrement médian baisse légèrement, et c'est normal** : les narrations réécrites
couvrent six journées au lieu d'en décrire deux avec précision. Un thème qui parle de toute sa
semaine partage mécaniquement une plus petite fraction de son vocabulaire avec chaque journée.
**Le chiffre qui compte est le classement, pas le niveau** — et aucune semaine ne décrit plus
une autre semaine que la sienne.

---

## 4. Les compétences déclarées par semaine

Deuxième contrôle, indépendant du premier : `week.skills` est-elle portée par les leçons des
journées de la semaine (règle I4 — on contrôle sur le **contenu**, pas sur l'étiquette) ?

| | AVANT | APRÈS |
|---|---|---|
| semaines déclarant une compétence qu'aucune de leurs leçons ne porte | **22 / 52** | **10 / 52** |

**`autonomy` est exclue de ce contrôle, et la raison est publiée** : le CP2 a établi
qu'**aucune leçon du corpus ne déclare `autonomy`**. Toute semaine qui la déclare échouerait
donc mécaniquement. Sur les semaines de projet, `autonomy` est une affirmation éditoriale
— « cette semaine, tu travailles seul » — et non une prétention de contenu.

### Quatre corrections, et dix constats laissés à leur cause réelle

**Corrigé (la compétence n'est pas travaillée du tout par la semaine)** : s2 ne travaille pas
`algo` (ses journées sont du JavaScript de base ; `algo` s'ouvre en s3) · s16 ne travaille pas
`http` (tests, composants, hooks, erreurs côté client) · s25 ne travaille pas `se` mais
`python` · s31 ne travaille pas `jsts`.

**NON corrigé, avec le diagnostic** : les dix restants sont des cas où la compétence **est
réellement travaillée** mais où **aucune leçon reliée ne la déclare**. Les exemples parlent
d'eux-mêmes :

- **s42** déclare `patterns` et sa journée 5 s'intitule « **Design patterns dans ton code** » ;
- **s38** déclare `llm` et ses six journées portent sur la **prompt injection** ;
- **s27** déclare `python` et ses journées codent en **NumPy et PyTorch** ;
- **s48** déclare `se` et ses journées font des **tests, de la gestion d'erreur et de
  l'observabilité**.

**Retirer ces déclarations rendrait la sonde verte et le produit faux.** Le défaut est dans
`scripts/data/lessons-map.mjs`, qui sous-déclare les compétences de ces leçons. **C'est un
constat pour le CP12** (intégrité factuelle des références), pas une correction du CP10.

---

## 5. Les 12 mois

### 5.1 `expectedScores` : zéro évaluation sans source

`expectedScores` se lit **cumulativement** — « à la fin du mois N, tu devrais être à ce niveau »
— et non « ce mois enseigne ceci ». Sous cette lecture, déclarée avant la mesure :

> ## Compétences évaluées à un mois où elles n'ont jamais été enseignées : **0 / 52 déclarations**

Le premier mois d'enseignement de chaque compétence : `gitlinux` `jsts` `algo` M1 · `ds`
`patterns` `se` `archi` `autonomy` `comm` `http` `sql` M2 · `secu` `cloud` `python` M3 ·
`ml` `evalia` M6 · `dl` `llm` `agents` M7 · `rag` M8. **Chaque `expectedScores` porte sur une
compétence déjà enseignée à cette date.**

Sous une lecture non cumulative — « ce mois enseigne ce qu'il évalue » — huit mois seraient en
défaut. **Les deux chiffres sont publiés ; c'est la lecture cumulative qui est retenue**, parce
que c'est celle que le contrat du CP1 a gelée (`expectedScores` = intention de niveau, jamais
constat) et que le sens d'une progression annuelle l'impose.

### 5.2 Deux titres de mois réalignés

Le décalage du bloc 1 remontait jusqu'aux mois :

| mois | titre AVANT | ce que ses semaines enseignent | titre APRÈS |
|---|---|---|---|
| **M2** | « Algorithmie, structures de données, TypeScript, POO/FP » | s5-s7 **plus s8 : HTTP, REST, Express, SQL** — absente du titre | « Structures de données, TypeScript et POO/FP, Projet 1 ; **premières APIs** » |
| **M3** | « HTTP, REST, APIs, Node/Express, SQL — Projet 2 » | s9-s13 : SQL, projet 2, sécurité, réseau/Linux/Git, architecture, front | « **SQL et persistance, sécurité et auth, réseau/Linux/Git, architecture** — Projet 2 » |

**Le titre du mois 3 décrivait le contenu du mois 2.** Les résumés et les listes de compétences
acquises ont suivi. Les dix autres mois décrivent correctement leurs semaines et n'ont pas été
touchés.

---

## 6. Effet de bord mesuré : huit journées changent d'étiquette

Le générateur donne à une journée de revue l'étiquette `week.skills[0]`. Corriger les
compétences déclarées change donc l'étiquette de huit revues — **et de huit journées
seulement** :

| journée | AVANT → APRÈS | ce que la semaine enseigne réellement |
|---|---|---|
| j42 (revue s6) | `ds` → **`jsts`** | TypeScript, POO, patterns |
| j56 (revue s8) | `jsts` → **`http`** | HTTP, REST, Express |
| j63 (revue s9) | `http` → **`sql`** | SQLite, modélisation, transactions |
| j84 (revue s12) | `sql` → **`archi`** | architecture 3-tiers, observabilité, cache |
| j91 (revue s13) | `http` → **`jsts`** | projet 2 durci, premier React |
| j112 (revue s16) | `jsts` → **`se`** | tests, mocks, clean code |
| j203 (revue s29) | `dl` → **`llm`** | LLM, API, hallucinations |
| j224 (revue s32) | `llm` → **`rag`** | RAG de bout en bout |

**Les huit sont des corrections**, et **les huit parcours du catalogue gardent exactement leur
longueur** (365 · 119 · 54 · 85 · 31 · 15 · 29 · 188). Le jour 84 quitte le module SQL du
parcours data-ml et le jour 63 y entre : la revue de la semaine 9 est réellement une revue SQL,
celle de la semaine 12 ne l'a jamais été.

### Un test gelait l'ancienne étiquette fausse

`tests/v5421-visual-integrity.test.mjs` vérifiait que le jour 57 précède le jour 84 dans le
parcours data-ml — une garde contre un désordre d'affichage réellement observé en V54.2
(« …73, 82, 84, 57, 58… »). Le jour 84 ayant quitté ce parcours, l'assertion devenait
`6 < -1`, donc fausse.

**Le test n'a pas été supprimé et le seuil n'a pas été déplacé.** La paire de contrôle est
passée à (57, 82), toutes deux toujours dans le parcours, et la garde d'ordre global
(`asc(days)`) et de longueur (188) est intacte. Le commentaire du test explique pourquoi le
jour 84 est parti. **1420 / 1420.**

---

## 7. Ce que le CP10 n'a pas fait

- **Aucune journée n'a été déplacée, ajoutée ou retirée.** Les 365 journées, les 52 semaines et
  les 12 mois sont inchangés en nombre et en ordre.
- **Aucune leçon n'a été touchée** — corpus `92d5fae6…` inchangé.
- **Les dix sous-déclarations de `lessons-map.mjs` ne sont pas corrigées ici** : la correction
  appartient au CP12, et la corriger en retirant une déclaration vraie de la semaine aurait été
  exactement le contournement que le §7 du contrat interdit.
- **Les semaines s9, s14, s16, s17 et toutes celles au-delà de s35 n'ont pas été retouchées** :
  la mesure ne les désigne pas, et les lire confirme qu'elles décrivent leurs journées.

---

## 8. Vérifications

| contrôle | résultat |
|---|---|
| `npm test` | **1420 / 1420** |
| `npx tsc --noEmit` | **0** |
| `npm run gates:active` | **0 violation** |
| porte V73 du graphe | **verte** — prérequis ordonnés, revues qui révisent, évaluations sourcées |
| **corpus des 128 leçons** | **`92d5fae6…` INCHANGÉ** |
| invariants | 365 journées · 128 leçons · 365 corrections · **52 semaines** · **12 mois** |
| **`data/progress.json`** | **toujours absent** |
| **L1** journées structurellement impossibles | **0** ✅ |
| **L2** revues en dépassement | **0 / 52** ✅ |
| **L3** UNDERLOADED non justifiées | **6 / 365** ✅ |
| difficultés dérivées au CP9 | **inchangées** — le fichier régénéré est identique bit à bit, ce qui vérifie au passage la non-circularité annoncée |
| anomalies de rétention du CP8 | **inchangées** (4 · 4 · 9 · 15) |
