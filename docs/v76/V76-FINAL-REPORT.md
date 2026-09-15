# V76 — ATELIER DE PRATIQUE & IDE INTÉGRÉ · RAPPORT FINAL

> Sprint CP0 → CP15 · branche `claude/ai-career-os-saas-phfg49` ·
> base `e36ee65` (fin V75) · **15 commits, 94 fichiers, +30 974 lignes**.
> Tous les artefacts sont dans `docs/v76/`, toutes les sondes dans
> `scripts/v76/`, et tout est rejouable.

---

## 1. Les deux verdicts

### 1.1 Axe ingénierie

> # `PRACTICE_WORKBENCH_READY`

**Les 22 critères `W1`–`W22` gelés au CP1, avant toute implémentation, sont
atteints.** Le contrat dit alors — mot pour mot, et il a été écrit avant de
savoir si ce serait facile :

> Si `W1`–`W22` sont tous atteints, le verdict d'ingénierie **DOIT** être
> `PRACTICE_WORKBENCH_READY`. L'absence de validation humaine ne se soustrait
> pas de cet axe : elle s'exprime sur le second, et **nulle part ailleurs**.

### 1.2 Axe pédagogique

> # `HUMAN_PRACTICE_EFFICACY_NOT_MEASURED`

**Aucun être humain n'a utilisé ce Workbench pendant ce sprint.** Zéro
apprenant recruté, zéro session observée, zéro mesure d'apprentissage réel.
Toutes les mesures de ce rapport sont des mesures de MACHINE.

### 1.3 Pourquoi deux axes, et pourquoi c'est la correction d'une erreur

V75 s'était rendu `ADAPTIVE_RECOVERY_CANDIDATE` alors que ses critères
d'ingénierie étaient atteints — parce que le doute pédagogique avait débordé sur
l'axe technique. Le brief de V76 l'a nommé : *« NE PLUS FAIRE L'ERREUR V75. »*

Le contrat gelé du CP1 a donc posé l'échelle **avant** de connaître les
résultats. Aujourd'hui, rendre autre chose que `READY` sur l'axe d'ingénierie
reviendrait à redéfinir le sens du verdict après coup pour se donner l'air
prudent. La prudence a son axe, et il dit `NOT_MEASURED`.

---

## 2. Les 22 critères, un par un

| # | critère | état | preuve |
|---|---|---|---|
| `W1` | le Workbench est réellement branché | ✅ | 12/12 parcours `DAY → EXERCISE → RUN → …→ EVIDENCE`, CP0 et CP12 |
| `W2` | ≥ 5 familles d'exercices | ✅ | **6 runtimes**, parcours E2E réel sur chacun |
| `W3` | tout `RUN` produit un `ATTEMPT` | ✅ | `cp11:I1` (échec) et `cp11:I2` (réussite) |
| `W4` | l'échec est persistant | ✅ | 12/12 au CP12, `cp11:I1` sur état neuf |
| `W5` | la reprise après échec est persistante | ✅ | `cp11:I3` · journal `M26` |
| `W6` | l'`EVIDENCE` est correcte et non dupliquée | ✅ | **corrigé au CP11** — `cp11:I2` : 1 preuve, `cp12` : 12/12 |
| `W7` | la provenance d'une réussite après aide | ✅ | `cp11:I8`, `cp11:I9` · `provenanceDeLaReussite` |
| `W8` | l'historique est consultable | ✅ | **construit au CP10** — `cp10:H2`, `H3`, `U1` |
| `W9` | `DRAFT ≠ ATTEMPT` | ✅ | `S13` (55 → 55), `cp9:P2` |
| `W10` | `RESET` est sûr | ✅ | `cp9:P8` (43→43 · 12→12 · 3→3), `cp10:H12` |
| `W11` | `SEC1`–`SEC5` contenues | ✅ | **16/16 sondes**, CP5 puis CP14 |
| `W12` | délai, sortie, taille, nombre de fichiers | ✅ | `S1`, `S2`, `S10`, `S11` |
| `W13` | tests cachés et fichiers protégés non modifiables | ✅ | `S9`, `cp9:P10`, `cp4` |
| `W14` | aucune fuite de réponse avant tentative | ✅ | **corrigé au CP8** — 25/25 défis, 12/12 exercices |
| `W15` | déterminisme là où il est requis | ✅ | **mesuré au CP15** — `F1` (6 runtimes), `F2` |
| `W16` | ≥ 30 mutations vues rouges | ✅ | **33 appliquées, 33 tuées** |
| `W17` | `npm test` · `tsc` · `build` · portes | ✅ | 1984 · 0 · OK · **49 portes** |
| `W18` | responsive acceptable | ✅ | 35/35 rendus, 0 débordement, 375 → 1440 |
| `W19` | accessibilité minimale | ✅ | clavier `U5`, focus, `aria-live` `U4`, 0 sans nom |
| `W20` | performance comparée au CP0 | ✅ | CP12 §3, sous le bruit de mesure |
| `W21` | `data/progress.json` non fabriqué | ✅ | `[B15]`, `cp11:I12` |
| `W22` | les fonctionnalités existantes ne sont pas cassées | ✅ | `I1`–`I11`, §4 ci-dessous |

## 3. Les onze invariants de non-régression

| # | invariant | état |
|---|---|---|
| `I1` | la boucle sur les six runtimes | **12/12** |
| `I2` | un échec est persisté | 12/12 |
| `I3` | une réussite produit une preuve | 12/12 |
| `I4` | `DRAFT ≠ ATTEMPT` | ✅ |
| `I5` | l'anti-fuite du laboratoire | ✅ |
| `I6` | la première aide n'est jamais la correction | ✅ `MODELE_MENTAL` / `SOUS_PROBLEME` / `INDICE` sur 12/12 |
| `I7` | un fichier protégé est refusé | ✅ |
| `I8` | les onze contrôles d'API | ✅ |
| `I9` | `data/progress.json` n'existe pas | ✅ |
| `I10` | `data/lab-workspaces/` ignoré | ✅ (+ `data/lab-journals/`) |
| `I11` | 376 exercices, 1 357 tests, corpus `92d5fae6` | ✅ |

**Le curriculum n'a pas été touché.** Aucun jour, aucune leçon, aucun exercice,
aucune correction de référence n'a changé d'un caractère.

---

## 4. Ce que le sprint a trouvé, checkpoint par checkpoint

### 4.1 CP0 — le Workbench existait déjà

Pour la troisième fois de suite, le sprint commence par découvrir que la chose
à construire existe. Le brief supposait « un simple textarea et un bouton
Run » ; la mesure a trouvé **1 330 lignes d'interface**, six runtimes, cinq
panneaux, autosave, palette de fichiers, historique et mode étroit — et
**12/12 parcours complets** qui bouclaient déjà, échec compris.

### 4.2 Les données ont refusé deux ateliers

**Zéro exercice SQL. Zéro exercice HTTP.** Neuf exercices mentionnent SQL ;
aucun n'en exécute. Construire `SQL_WORKBENCH` aurait été bâtir pour personne,
et le contrat l'a interdit sous le nom `G13` avant que la tentation n'arrive.

### 4.3 Le vrai sujet était ailleurs que là où le brief le classait

Le brief plaçait la sécurité d'exécution en priorité n° 3. Le CP0 a mesuré
qu'elle aurait dû être n° 1 : le portier de l'API tenait sur onze sondes, mais
la couche d'exécution **n'isolait rien** — disque, processus, réseau local, et
surtout **les corrections des autres exercices**.

### 4.4 CP1 — geler à partir de ce qui existe, pas de ce qu'on imaginait

Le modèle de capacités n'a pas été inventé : il **existait déjà** dans
`lib/runtime.mjs` (`execution`, `preview`, `publicTests`, `privateTests`,
`multiFile`, `stdin`, `cancellation`, `timeout`, `syntaxHighlighting`) et a été
gelé tel quel.

Le contrat déclare les cinq interdits de sécurité en termes **absolus** alors
que les cinq étaient violés le jour de sa signature. Les geler avant de savoir
si ce serait faisable est exactement le point : les poser après aurait été le
contournement `G11` de V74.

La conséquence la plus désagréable y est écrite d'avance : *« un chargeur
restrictif Node ne protégera pas Python, et 101 exercices pourraient devoir
être déclarés non isolés. »* Le CP5 a trouvé mieux — mais il aurait pu ne pas
trouver, et la ligne rouge était déjà écrite.

### 4.5 CP2 — chercher un défaut dans un vrai navigateur, et ne pas en trouver

**35 rendus réels.** L'éditeur est visible et utilisable partout, y compris à
375 px où il occupe encore **51 %** de l'écran. Zéro débordement, zéro élément
sans nom accessible.

**Aucune ligne de la coquille n'a été modifiée**, et c'est le résultat correct.
`G14` interdit de remplacer sans défaut démontré : une refonte « parce que le
neuf paraît plus moderne » aurait coûté une régression pour zéro gain mesuré.

### 4.6 CP3 — le langage était bien calculé, puis jeté à la dernière ligne

`lib/exercise-files.mjs` détecte correctement `html` et `css`.
`CodeMirrorEditor.tsx` ne connaissait que quatre langages et **retombait sur
JavaScript pour tout le reste** : 11 fichiers `.html` et 3 `.css` colorés avec
la mauvaise grammaire, dans les exercices `web` où le langage est le sujet.

« Ça colore » n'était pas une preuve : une grammaire fausse produit aussi des
jetons. Le test compare donc les **arbres syntaxiques**. Le test décisif : sur
`.card { max-width: 320px; }`, la grammaire JavaScript produit un nœud d'erreur
`⚠` — le repli n'était pas moins joli, il était **faux**.

### 4.7 CP4 — trois exercices multi-fichier sur 376, et la séquence passe

`web-card`, `web-counter`, `web-nav`. Séquence complète sur les trois : départ,
éditer A, éditer B, lancer, échouer, reprendre, réussir, réinitialiser,
recharger. **3/3 sur neuf étapes.**

La vérification qui n'était pas évidente : le défaut caractéristique du
multi-fichier est qu'une sauvegarde écrase les autres fichiers. Chaque fichier
est donc marqué séparément, et les marques précédentes revérifiées après
**chaque** sauvegarde.

**Limite déclarée** : les trois sont `web`. Le multi-fichier n'a jamais été
exercé sur un runtime qui exécute réellement du code.

### 4.8 CP5 — cinq évasions fermées sans Docker

Aucun Docker sur cette machine. Deux frontières construites sur ce que le noyau
offre réellement : `node --permission` + `unshare --net` pour les 275 exercices
Node/TS/React/web, espaces de noms + racine minimale en chroot pour les 101
Python. **16/16 sondes contenues**, et les mêmes attaques réécrites en Python :
4/4 bloquées.

**L'isolation a cassé cinq exercices avant d'être juste, et aucune panne n'a été
résolue en desserrant une protection.**

### 4.9 CP6 — le module a violé la règle pour laquelle il existe

Le produit savait qu'un test attendait `"C"` et recevait `"F"` ; l'échelle
d'aide ne savait que compter les tentatives. La route **jetait** `expected` et
`received` au moment précis où ils auraient servi.

La première version du diagnostic nommait un motif `BORNE` et affirmait « c'est
celui de la limite ». Juste sur `py-debug-grades`, **faux sur `react-counter`**
où un compteur démarre à 0 au lieu de 7 : la piste envoyait relire une
comparaison inexistante. « Un seul cas échoue » est une **observation** ;
« c'est une borne » est une **interprétation** que le résultat de test ne
soutient pas.

### 4.10 CP7 — le produit ne savait pas qu'il avait aidé

Huitième fait du produit : `RECORD_HINT_VIEW`. Sans lui, une réussite après
trois indices était indiscernable d'une réussite immédiate, et l'échelle
reproposait la même marche à l'identique.

`hintViews` a été ajouté aux **deux** listes blanches du store **dans le même
commit** — le défaut P7 de V75 avait laissé `curriculumPause` dans une seule
pendant trois checkpoints, verte et sans effet sur le disque.

### 4.11 CP8 — le repli hors ligne ÉTAIT la fuite

`GET /transfer/[id]` servait `"answer":0` et le texte complet des explications
dans sa charge utile. **25/25 défis.** Un « afficher le code source » donnait
les réponses avant toute tentative.

Une fonctionnalité a disparu, et c'était juste : le client corrigeait hors
ligne — ce qui n'était possible que parce qu'il détenait le corrigé.

### 4.12 CP9 — un onglet oublié effaçait le travail d'un autre

`T20` était écrit « non mesuré » depuis le CP0. Mesuré : **le scénario se
produisait.** Un onglet laissé ouvert renvoyait son état au prochain autosave et
écrasait silencieusement le travail fait entre-temps.

### 4.13 CP10 — l'historique était complet, et personne ne le servait

Le fait `ExerciseAttempt` est persisté depuis V74 · CP2. La surface tenait sa
propre liste dans un `useState`, plafonnée à cinq, **affichée à partir du
deuxième lancement** — donc pas après le premier échec, qui est le moment où on
regarde son historique — et vidée à chaque rechargement.

### 4.14 CP11 — une réussite, deux preuves

Une seule réussite écrivait **2 preuves**, fournissait **2 « sources
distinctes »** et produisait **2 contacts de rétention**. La règle de
consolidation promeut une compétence à `reinforced` sur « deux sources
distinctes et deux dates distinctes » : **un seul exercice en fournissait
deux**.

**Et c'était écrit.** Un commentaire de V75 · CP4 l'annonçait mot pour mot, et
s'en servait comme d'une contrainte au lieu d'y voir le défaut. Quinze lignes
plus haut, un autre commentaire affirmait le contraire.

### 4.15 CP12 — les scores n'ont pas bougé d'un test

Les douze parcours rejoués **avec le même instrument** (`choisirDouze` et
`parcours` importés, pas recopiés) après neuf checkpoints qui ont modifié
l'exécution elle-même. Les mêmes fichiers de départ échouent avec exactement
les mêmes compteurs qu'au CP0, et les mêmes références passent avec les mêmes :
**l'isolation n'a modifié aucun verdict de test.**

### 4.16 CP13 — l'audit a trouvé une régression que j'avais introduite

Quatre cibles tactiles à **13 × 13 px** : les cases de l'historique du CP10.
Le CP10 s'était vérifié par des fonctions pures et des sondes HTTP — les deux
bons outils pour ce qu'il construisait, et **aucun des deux ne mesure un
pixel**.

### 4.17 CP14 — une porte ne peut pas détecter sa propre neutralisation

Les deux mutations de la porte ont survécu, parce qu'on les vérifiait **en
lançant la porte**. Il lui faut un juge extérieur.

---

## 5. Ce qui a été construit

| module | nature | rôle |
|---|---|---|
| `lib/sandbox.mjs` | **PUR** | quelle frontière pour quel runtime, et ce qu'elle tient |
| `lib/sandbox-detect.mjs` | sondes réelles | ce que le noyau permet ICI, mesuré |
| `scripts/sandbox/enter-root.sh` | entrée | racine minimale pour Python |
| `lib/diagnostic.mjs` | **PUR** | le symptôme observé d'un échec |
| `lib/hint-view.mjs` | **PUR** | l'aide consultée, huitième fait du produit |
| `lib/workspace-conflit.mjs` | **PUR** | la lecture d'une sauvegarde refusée |
| `lib/attempt-journal.mjs` | **PUR** | le journal d'accompagnement d'une tentative |
| `lib/attempt-diff.mjs` | **PUR** | la comparaison de deux tentatives |
| `lib/attempt-journal-fs.mjs` | I/O | lecture et écriture du journal |
| `scripts/v76-check.mjs` | porte | 79 vérifications structurelles |

**Six modules purs sur dix.** Ce n'est pas une élégance : le CP9 a payé pour
apprendre qu'une décision vivant dans une route TypeScript n'est vérifiée par
personne.

## 6. Ce qui n'a PAS été construit, et pourquoi

- **`SQL_WORKBENCH` et `HTTP_WORKBENCH`** : zéro exercice (`G13`) ;
- **un éditeur neuf** : le CP2 a cherché un défaut dans 35 rendus réels et n'en
  a pas trouvé (`G14`) ;
- **un arbre de fichiers, création/suppression/renommage** : aucun exercice n'a
  de sous-répertoire, 3/376 sont multi-fichier et à plat ;
- **un linter temps réel** : il ferait le travail que l'exercice demande ;
- **un clone de Git** : le besoin démontré tient en une comparaison entre deux
  tentatives ;
- **aucun champ ajouté à `ExerciseAttempt`** ;
- **`RESET_EXERCISE`**, gelé au CP1 comme la sémantique qui n'existera pas.

---

## 7. Les huit anomalies de mes propres sondes

C'est la section la plus importante du rapport, parce que **chacune de ces
anomalies aurait produit une ligne verte dans ce document**.

| # | CP | l'anomalie | la famille |
|---|---|---|---|
| 1 | CP0 | fausse fuite : je cherchais les 60 premiers caractères de la correction, identiques au fichier de départ | **chercher la bonne chose au mauvais endroit** |
| 2 | CP0 | **trois évasions réussies déclarées « contenues »** : les sondes visaient un exercice dont les tests portent sur `stdout`, où une valeur retournée n'apparaît jamais | **la sonde ne sait pas lire son propre résultat** |
| 3 | CP2 | quatre faux « sans nom accessible » : des cases `aria-hidden` correctement retirées de l'arbre | chercher au mauvais endroit |
| 4 | CP2 | un `404` inventé : la fermeture du contexte annulait les préchargements RSC | **mesurer son propre dispositif** |
| 5 | CP6 | une classe nommée `BORNE` affirmait une interprétation que le résultat de test ne soutient pas | une interprétation prise pour une observation |
| 6 | CP12 | la colonne « aide » changeait à chaque exécution : ma sonde rejouait le même échec **dans la même seconde**, donc tentative dédupliquée | mesurer son propre dispositif |
| 7 | CP14 | **trois faux survivants** : un serveur d'une exécution tuée tenait le port, les sondes interrogeaient du code non muté | mesurer son propre dispositif |
| 8 | CP15 | les deux aperçus déclarés non cloisonnés : ma sonde lisait `allow-same-origin` **dans le commentaire qui explique son absence** | chercher au mauvais endroit |

**Une sonde de sécurité qui ne sait pas lire son propre résultat rend un faux
négatif, et un faux négatif de sécurité produit une ligne verte dans un
rapport.** L'anomalie n° 2 est la plus grave du sprint : trois évasions
réussies, toutes trois déclarées contenues.

**Les huit sont publiées, aucune n'a été corrigée en silence.**

## 8. Les quatre mutations qui ont survécu, et ce qu'elles ont appris

| mutation | CP | pourquoi elle a survécu |
|---|---|---|
| `M3`/`M4`/`M7` (CP9) | 9 | mes tests cherchaient du **texte** dans la route. `if (false && conflits.length)` les laissait tous verts |
| `M11` (CP9) | 9 | le composant contient **deux** `setConflit(` ; effacer la branche de refus laissait la remise à zéro |
| `N4` (CP10) | 10 | mes entrées ne dépassaient jamais la borne à elles seules : **la branche gardée n'était jamais atteinte** |
| `O7` (CP11) | 11 | mes tests ne produisaient jamais deux preuves qualifiantes pour une seule source |
| `M26` (CP14) | 14 | **aucun test ne disait qu'un journal sert à en garder plusieurs** |

Et deux règles de ma propre porte étaient décoratives — `[B2]` comptait les
`execIsole(` en incluant la définition de la fonction, `[B7]` comptait les
occurrences de `hintViews` sans regarder où elles étaient.

**La leçon commune, payée cinq fois** : *une assertion de texte tient une
convention, jamais un comportement ; et un test qui n'atteint pas la branche
qu'il croit garder ne garde rien.*

---

## 9. Sécurité : où en est le produit

### 9.1 Les cinq interdits

| | `PERMISSION_NET` (275 exercices) | `NAMESPACE_CHROOT` (101 exercices) |
|---|---|---|
| `SEC1` pas de lecture de l'hôte | **total** | **total** |
| `SEC2` pas d'écriture hors workspace | **total** | **total** |
| `SEC3` pas de processus | **total** | **partiel** |
| `SEC4` pas de réseau ni loopback | **total** | **total** |
| `SEC5` pas d'accès aux corrections | **total** | **total** |

### 9.2 La limite, déclarée plutôt que maquillée

**`SEC3` est PARTIEL en Python.** Un processus enfant peut naître — confiné à la
même racine minimale, sans réseau et sans privilège sur l'hôte. Aucune commande
de la machine n'est atteignable.

La règle du brief était : *« Si certains runtimes ne peuvent pas être sandboxés
correctement : NE PAS prétendre qu'ils le sont. Dégrader la capacité ou déclarer
la limite. »* La limite est déclarée dans le code, gardée par un test, gardée
par la porte, et la mutation qui la maquillerait en `total` meurt.

### 9.3 `T18`, la menace que le contrat renvoyait au CP14

Le CP14 ne l'a pas mesurée. **Le CP15 l'a fait**, parce que rendre `READY` en
laissant une menace « à mesurer » non mesurée aurait été la ligne verte que ce
sprint passe son temps à refuser.

Les deux aperçus portent `sandbox="allow-scripts"` **sans
`allow-same-origin`** — la combinaison des deux aurait rendu le cloisonnement
nul. Le document d'aperçu ne transporte ni adresse d'API, ni cookie.

### 9.4 Ce qui change le jour où le produit n'est plus local

Le §6 du contrat le dit : **tout le modèle de menace change de gravité** si le
produit devient multi-utilisateur. `SEC3` partiel deviendrait critique.
Aujourd'hui, l'attaquant et la victime sont la même personne sur sa propre
machine.

---

## 10. Performance

| | CP0 | CP12 |
|---|---|---|
| `python-ds`, lancement | 1 693 ms | **1 207 ms** |
| `react-tsx`, lancement | 1 046 ms | **749 ms** |
| `node-js`, ouverture | 4–120 ms | **2–117 ms** |

**Ce que ces chiffres ne prouvent pas** : que l'isolation soit gratuite. Les
deux mesures n'ont pas été prises au même état de cache.

**Ce qu'ils prouvent** : le coût d'isolation reste **sous le bruit de mesure**,
donc sous le seuil de perception d'un apprenant.

## 11. Accessibilité et responsive

**35 rendus Chromium réels** (5 pages × 7 largeurs) : **0 débordement
horizontal, 0 élément sans nom accessible, 0 erreur de console.**

Progrès mesuré : `transfert` passe de `aria-live: 0` à `1` **aux sept
largeurs** — au CP2, un apprenant au lecteur d'écran soumettait un défi et
n'apprenait rien de ce qui s'était passé.

**Dette consignée** : cinq cibles tactiles sous 24 px en large, trois en étroit,
toutes antérieures à ce sprint. Non corrigées, avec la raison écrite : leur
modification touche la coquille (`G14`). Les quatre cases de l'historique,
elles, étaient une **régression de ce sprint** — corrigées.

---

## 12. Vérifications finales

| | |
|---|---|
| `npm test` | **1984 / 1984** |
| `npx tsc --noEmit` | **0** |
| `npx next build` | **OK** |
| `npm run gates:active` | **49 portes, 0 violation** |
| `npm run v76:check` | **79 vérifications** |
| `npm run v76:negative` | **11 règles vues échouer, 0 trou** |
| sondes de sécurité | **16 / 16 contenues** |
| mutations | **33 / 33 tuées** |
| parcours E2E | **12 / 12** |
| sondes d'interaction | **10 / 10** |
| `data/progress.json` | **absent** |
| corpus | **376 exercices, 1 357 tests, intact** |

---

## 13. Le modèle de menace, ligne par ligne

Vingt et une menaces déclarées au CP0 (`docs/v76/V76-THREAT-MODEL.md`).

### 13.1 Ce qui tenait déjà au CP0

Timeout, sortie bornée, traversée de chemin, chemin absolu, nom de fichier
malveillant, charge de 10 Mo, 200 fichiers, fichier protégé, brouillon ≠
tentative, action inconnue, environnement filtré à deux variables. **Onze
protections réelles, mesurées et non supposées.**

### 13.2 Ce qui ne tenait pas, et qui tient

| # | menace | avant | après |
|---|---|---|---|
| `T12` | lecture du disque hôte | `/etc/passwd` lisible | contenue (CP5) |
| `T13` | corrections d'autres exercices | lisibles | contenue (CP5) |
| `T14` | écriture hors bac à sable | fichier créé dans le dépôt | contenue (CP5) |
| `T15` | création de processus | `execSync('id')` → `uid=0(root)` | contenue (CP5) |
| `T16` | SSRF vers l'API du produit | `fetch('…/api/progress')` → 200 | contenue (CP5) |
| `T17` | fuite des réponses de transfert | 25/25 défis | fermée (CP8) |
| `T20` | brouillon périmé | **non mesuré** | mesuré, puis fermé (CP9) |
| `T18` | XSS dans l'aperçu | **non mesuré** | mesuré, contenu (CP15) |

### 13.3 La cause unique des cinq évasions

`execFile` avec `cwd` + `shell: false` + `env` filtré + `timeout` + `maxBuffer`.
Chaque réglage est correct ; **aucun n'isole**. `cwd` est un dossier de départ,
pas une racine — c'est le contournement `G2` du contrat, nommé avant d'être
rencontré.

## 14. Les deux frontières d'exécution

### 14.1 `PERMISSION_NET` — 275 exercices Node, TypeScript, React, web

```
unshare --net  node --permission
  --allow-fs-read=<workspace> --allow-fs-read=<node_modules> --allow-fs-read=<dir de node>
  --allow-fs-write=<workspace>
```

Le modèle de permissions de Node borne le disque **et bloque `child_process`** ;
l'espace de noms réseau retire la pile réseau. Lecture autorisée sur
`node_modules` — le harnais React importe `react` depuis là — **écriture jamais**.

### 14.2 `NAMESPACE_CHROOT` — 101 exercices Python

```
unshare --user --map-root-user --mount --net --propagation private
  → racine minimale : /usr en lecture seule, le workspace, les paquets Python
  → chroot, puis l'interprète
```

`import os` ne traverse aucun crochet JavaScript : il fallait une frontière du
noyau. La racine ne contient ni `/etc`, ni `$HOME`, ni aucun chemin du dépôt.

### 14.3 Les cinq exercices cassés en chemin, et comment ils ont été réparés

Aucun n'a été réparé en desserrant une protection.

1. **15 `react-tsx` à 0/3** — le harnais importe `react` hors du workspace.
   Lecture autorisée sur `node_modules`, écriture jamais.
2. **Python « indisponible »** — `existsSync` **suit** les liens symboliques et
   rend `false` sur un lien cassé ; `lib → usr/lib` ne se résout qu'à
   l'intérieur de la racine. Remplacé par `lstatSync`.
3. **`chroot: not found`** — le `PATH` minimal ignore `/usr/sbin`. Binaires
   nommés en absolu.
4. **`/usr/bin/python3: No such file`** — c'est un lien vers
   `/etc/alternatives/python3`, et `/etc` n'est pas monté **par conception**.
   Interprète résolu AVANT d'entrer dans la racine.
5. **`pandas` ne trouve pas `dateutil`** — le venv, puis `$HOME` que la racine
   cache précisément. Répertoires de paquets nommés explicitement.

### 14.4 La sixième erreur, et la plus instructive

Après tout cela, `pandas` échouait encore — à cause de **deux affectations
successives partant toutes deux de `env`**, la seconde écrasant la première.
Le symptôme désignait la frontière ; la faute était à six lignes de là.

## 15. Le retour pédagogique construit

### 15.1 Le diagnostic — huit classes, vocabulaire fermé

`COMPILATION` · `ERREUR_LEVEE` · `TYPE` · `CARDINALITE` · `CAS_ISOLE` ·
`VALEUR` · `RIEN_NE_PASSE` · **`INDETERMINE`**.

La dernière compte autant que les sept autres : **le produit sait dire « je ne
sais pas »**. Sur les douze parcours du CP12, elle n'apparaît jamais — mais elle
existe, et un test interdit de la supprimer.

### 15.2 Le diagnostic décrit, il ne corrige pas

Un test interdit précisément le **contenu** d'un correctif : opérateur, appel,
valeur, « remplace X par Y ». Il n'interdit pas les impératifs — le premier
correctif les interdisait tous et rejetait « Corrige d'abord ce que l'outil
signale », qui est une consigne d'ordre sans réponse. **L'affaiblir aurait été
`G12` ; le préciser était le bon geste.**

### 15.3 L'échelle d'aide, et sa dernière marche

`SOUS_PROBLEME` → `MODELE_MENTAL` → `INDICE` → `EXEMPLE_ANALOGUE` →
`EXERCICE_PLUS_SIMPLE` → `CORRECTION_COMPLETE` → `TENTATIVE_DIFFEREE`.

**La correction complète est la dernière**, jamais la première. Sur les douze
parcours, la marche servie au premier échec est `MODELE_MENTAL`,
`SOUS_PROBLEME` ou `INDICE` — jamais la réponse.

### 15.4 Ce que le CP7 a changé, et ce qu'il a refusé de changer

L'échelle ne repropose plus ce qui vient d'être lu. Mais laisser la liste des
marches se vider ferait tomber `remedier` dans sa branche de dernier recours —
**c'est-à-dire donner la réponse**. Le repli sur la liste complète n'est donc
pas une concession, c'est la protection.

## 16. Le journal et la comparaison

### 16.1 Pourquoi un journal séparé du fait

Le fait `ExerciseAttempt` est gelé au contrat V74 §3.2 et alimente la
rétention : un fait est petit, non révisable, rejouable. Y verser du code source
en changerait la nature, et 20 000 tentatives × un espace de travail rendraient
la progression inutilisable.

**Le journal ne fait jamais autorité.** Un journal qui prétendrait `passed: 999`
ne change pas le score affiché — un test l'impose.

### 16.2 La catégorie qu'on oublie

Les tests **cassés** entre deux tentatives. Un apprenant qui répare un test en
cassant un autre voit `2/3` puis `2/3` et croit n'avoir rien fait. La lecture le
dit : *« Le score est le même des deux côtés, mais ce ne sont pas les mêmes
tests. »*

### 16.3 Le diff est réduit à ses passages modifiés

Un diff qui rend 400 lignes identiques oblige à chercher le changement dedans,
c'est-à-dire à faire le travail qu'on voulait éviter. Un test l'impose : une
ligne modifiée sur soixante doit rendre **moins de quinze lignes**, avec deux
lignes de contexte et une coupure annoncée entre deux passages éloignés.

## 17. Les huit faits du produit

| fait | depuis | ce qu'il observe |
|---|---|---|
| `Evidence` | V27 | une démonstration validée |
| `days` / `submissions` | V64 | le travail rendu dans une journée |
| `weeklyReviews` | V64 | une revue hebdomadaire |
| `RecallAttempt` | V66 | une tentative de rappel |
| `ExerciseAttempt` | V74 · CP2 | **un lancement réel, succès ou échec** |
| `curriculumPause` | V75 | une pause déclarée |
| `TransferAttempt` | V75 · CP10 | un défi de transfert, réussi ou non |
| **`hintViews`** | **V76 · CP7** | **une aide réellement consultée** |

V76 en ajoute **un**, et n'en modifie aucun autre.

## 18. Les quatorze contournements interdits, et leur sort

| règle | ce qu'elle interdit | respectée |
|---|---|---|
| `G1` | désactiver un exercice pour effacer une ligne rouge | ✅ aucun désactivé |
| `G2` | appeler `cwd` une sandbox | ✅ deux frontières réelles |
| `G8` | « HTTP 200 = E2E réussi » | ✅ 12 parcours complets, échec compris |
| `G11` | poser les règles après avoir vu les résultats | ✅ contrat gelé au CP1 |
| `G12` | affaiblir une mutation ou une sonde pour la faire passer | ✅ 33/33, aucune affaiblie |
| `G13` | construire SQL/HTTP malgré zéro exercice | ✅ non construits |
| `G14` | remplacer sans défaut démontré | ✅ coquille intacte (CP2), pas de clone de Git (CP10) |

Les sept autres (`G3`–`G7`, `G9`, `G10`) portent sur des pratiques
— score fabriqué, capture d'écran en guise de preuve, test qui s'auto-valide —
dont aucune n'apparaît dans ce sprint.

## 19. L'ordre de priorité du brief, et ce qui a été fait

| rang | priorité du brief | traité |
|---|---|---|
| 1 | pratique réellement exécutable | existait déjà — **vérifié**, CP0 et CP12 |
| 2 | feedback pédagogique | **construit** — CP6 (diagnostic), CP7 (aide) |
| 3 | **sécurité d'exécution** | **construit** — CP5, le plus gros poste du sprint |
| 4 | reprise / persistance | **construit** — CP9 (conflit), CP10 (historique) |
| 5–8 | intégrations | **audité** — CP11 |
| 9 | UX | **vérifié** — CP2, CP13 |
| 10 | esthétique | un favicon, parce qu'il rendait 404 |

**Le rang 3 aurait dû être le rang 1**, et la mesure du CP0 l'a établi dès le
premier jour.

## 20. Comment tout rejouer

```bash
# 1 · le produit, avec une progression HORS DÉPÔT
export AICOS_PROGRESS_FILE=/tmp/v76/progress.json
npx next build && npx next start -p 3300 &
export V76_BASE=http://127.0.0.1:3300

# 2 · les sondes, dans l'ordre du sprint
node scripts/v76/cp0-practice-forensics.mjs   # inventaire statique
node scripts/v76/cp0-security.mjs             # 16 sondes d'attaque
node scripts/v76/cp0-e2e.mjs                  # les 12 parcours (AVANT)
node scripts/v76/cp4-multifile.mjs            # multi-fichier
node scripts/v76/cp8-transfer.mjs             # 25 défis, 10 vérifications
node scripts/v76/cp9-persistence.mjs          # 10 sondes de persistance
node scripts/v76/cp10-history.mjs             # 13 sondes d'historique
node scripts/v76/cp11-integration.mjs         # 13 scénarios d'intégration
node scripts/v76/cp12-e2e.mjs                 # les 12 parcours (APRÈS)
node scripts/v76/ui-audit.mjs cp13            # 35 rendus Chromium
node scripts/v76/cp13-ux.mjs                  # 10 sondes d'interaction
node scripts/v76/cp15-cloture.mjs             # déterminisme + T18

# 3 · les portes et le gantelet
npm test && npx tsc --noEmit && npm run build && npm run gates:active
npm run v76:check && npm run v76:negative
node scripts/v76/cp14-mutations.mjs gate      # par lots : gate / test / sonde / autoporte
```

**`AICOS_PROGRESS_FILE` n'est pas un confort** : sans lui, les sondes
écriraient `data/progress.json` dans le dépôt, ce que l'invariant `I9` interdit.

## 21. Par où commencer pour relire ce travail

Dans cet ordre, parce que c'est l'ordre du risque :

1. **`lib/sandbox.mjs`** — la frontière, et ce que chaque mode prétend tenir.
   Si cette table ment, tout le reste du rapport est faux ;
2. **`scripts/v76-check.mjs`** — les 79 règles structurelles ;
3. **`scripts/v76-negative.sh`** — chaque règle **vue échouer** ;
4. **`docs/v76/cp14-mutations.json`** — les 33 mensonges et qui les a vus ;
5. **`docs/v76/V76-WORKBENCH-CONTRACT-FROZEN.md`** — l'échelle de verdict,
   écrite avant les résultats, et que ce rapport applique sans la redéfinir.

## 22. Ce que le prochain sprint trouvera probablement

Sur la foi des quatre derniers : **la chose à construire existera déjà**,
débranchée ou incomplète. Les candidats, chiffrés et non traités :

- **neuf surfaces de pratique sur onze n'écrivent aucun fait** — c'est le plus
  gros écart mesuré et non comblé du produit ;
- **le multi-fichier n'est vérifié que sur `web`**, alors qu'il est déclaré pour
  les six runtimes ;
- **aucune borne n'est calibrée** contre un besoin pédagogique réel ;
- **et surtout : personne n'a encore appris quoi que ce soit avec ce produit**,
  ou du moins personne ne l'a mesuré.

---

## 23. Les trois questions finales

### 23.1 « Est-ce qu'un apprenant peut réellement FAIRE le travail ici ? »

**Oui, et c'était déjà vrai avant ce sprint.** Douze parcours complets, six
familles de runtime, joués par HTTP sur le produit en marche : ouvrir, échouer
réellement, voir l'échec persisté, recevoir une aide graduée, corriger,
réussir, obtenir une preuve.

Ce que V76 a ajouté n'est pas la capacité de faire le travail — elle existait —
mais **les conditions dans lesquelles ce travail compte** : le code s'exécute
désormais derrière une frontière, le produit dit ce qu'il observe de l'échec,
il se souvient de l'aide qu'il a donnée, il refuse d'écraser du travail récent,
il montre ce qui a changé entre deux tentatives, et une réussite ne vaut plus
qu'une seule fois.

**Ce que je ne peux pas dire** : si ce travail est le BON travail, ni s'il
apprend quelque chose. Aucun humain ne l'a fait pendant ce sprint.

### 23.2 « Est-ce que le produit est honnête sur ce qu'il mesure ? »

**Oui, et c'est le résultat dont je suis le plus sûr, parce qu'il a été attaqué
33 fois.**

- une réussite après trois indices **reste une réussite**, et la provenance le
  dit sans en faire une note ;
- une tentative postérieure à l'ouverture de la correction **ne vaut pas
  récupération** ;
- une réussite ne produit **qu'une preuve** — corrigé au CP11 ;
- un exercice ambigu **ne crédite aucune leçon** : « je ne sais pas » est une
  réponse ;
- un `RESET` **n'efface aucun fait** ;
- le diagnostic **décrit sans donner la réponse**, et la classe `INDETERMINE`
  existe.

**La réserve** : le produit est honnête sur ce qu'il mesure, et ce qu'il mesure
reste *« des tests sont passés »*. C'est un fait objectif. Ce n'est pas une
preuve d'apprentissage, et le produit ne prétend pas le contraire.

### 23.3 « Qu'est-ce qui reste faux, incomplet ou non mesuré ? »

**Non mesuré — le plus important** : l'efficacité pédagogique. Aucun humain.
C'est le second verdict, et il n'a pas bougé.

**Non mesuré — concret** :

- **le multi-fichier n'a jamais été exercé sur un runtime qui exécute du
  code.** Les trois exercices multi-fichier sont `web`. `lib/runtime.mjs`
  déclare pourtant `multiFile: true` pour tous : capacité **déclarée mais non
  vérifiée** sur `node-js`, `python3`, `typescript`, `python-ds` ;
- **neuf surfaces de pratique sur onze n'écrivent aucun fait** — `terminal`,
  `assessments`, `capstones`, `missions`, `cloud-lab`, `cloud-foundations`,
  `kubernetes`, `pipelines`, `security`. Chiffré au CP0, inchangé : V76 n'a
  traité que `lab` et `transfer` ;
- **aucune borne de ce contrat n'est calibrée** : 5 000 ms, 100 000 octets,
  40 fichiers sont hérités et déclarés, jamais mesurés contre un besoin
  pédagogique réel ;
- **le journal du CP10 ne commence qu'après le CP10.** Les tentatives
  antérieures sont listées « code non conservé ». Reconstruire serait inventer.

**Incomplet** :

- `SEC3` partiel en Python (§9.2) ;
- la dette de cibles tactiles (§11) ;
- **deux familles du brief ne sont pas gardées par une mutation** : « transfert
  == maîtrise » (le produit n'a jamais établi cette équivalence) et « runner non
  déterministe » (mesuré au CP15, pas muté).

**Ce que je crois faux et que je ne peux pas prouver** : que la borne de 12
entrées de journal soit le bon nombre, que `MODELE_MENTAL` soit la bonne
première marche quand aucun test ne passe, que deux lignes de contexte suffisent
dans un diff. **Ce sont des choix, pas des mesures**, et ils sont écrits comme
tels partout où ils apparaissent.

---

## 24. Ce que ce sprint m'a appris, et qui vaut pour le suivant

1. **Pour la quatrième fois de suite, la chose à construire existait déjà** —
   débranchée, incomplète, ou invisible. Commencer par mesurer plutôt que par
   construire a économisé quatre constructions inutiles.
2. **Une assertion de texte tient une convention, jamais un comportement.**
   Payé cinq fois. Quand la propriété est comportementale, il faut une fonction
   pure qu'un test peut appeler, ou une exécution réelle.
3. **Un test qui n'atteint pas la branche qu'il croit garder ne garde rien** —
   `N4`, `O7`, `M26`.
4. **Un fait connu mais non mesuré se comporte exactement comme un fait
   ignoré.** Le double comptage a vécu un sprint entier dans un commentaire.
5. **Une porte ne peut pas se juger elle-même**, et une sonde qui mesure son
   propre dispositif ne mesure pas le produit — trois anomalies sur huit.
6. **Le symptôme désigne rarement la faute.** Au CP5, `pandas` échouait à cause
   de deux affectations successives six lignes plus loin.
7. **Une ligne rouge permanente est une ligne qu'on apprend à ignorer.** Le 404
   du favicon, corrigé au CP13, tenait la console occupée depuis toujours.
