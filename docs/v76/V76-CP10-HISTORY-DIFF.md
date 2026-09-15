# V76 · CP10 — Historique des tentatives et comparaison

> Sondes rejouables : `node scripts/v76/cp10-history.mjs` (13 sondes HTTP contre
> le produit en marche) · tests : `tests/v76-attempt-history.test.mjs` (27) ·
> résultats bruts : `docs/v76/cp10-history.json`.

## 1 · « L'historique existe déjà » — vrai deux fois, et de deux façons qui ne se rejoignaient pas

Le brief est explicite :

> « L'historique existe déjà. Construire uniquement le manque démontré :
> comparaison utile entre tentatives. **Pas un Git clone.** »

La mesure confirme la première phrase, et découvre que les deux moitiés ne se
parlaient pas :

- **le FAIT existe** — `ExerciseAttempt`, créé au CP2 de V74, persisté à chaque
  lancement, réussite comme échec, dédupliqué par clé métier, trié à la
  lecture ;
- **la SURFACE existe** — le panneau « Exécutions récentes » du Workbench.

Mais la surface ne lisait pas le fait. Elle tenait sa propre liste, dans un
`useState<…>([])`, plafonnée à cinq entrées, **affichée seulement à partir du
deuxième lancement** — c'est-à-dire précisément pas après le premier échec, qui
est le moment où un apprenant regarde son historique. Et un rechargement de page
la vidait, alors que le serveur, lui, avait tout gardé.

**Quatrième sprint de suite où la chose à construire existe déjà, débranchée.**

## 2 · Mesure AVANT

| # | sonde | AVANT | observation |
|---|---|---|---|
| H1 | le FAIT est persisté à chaque lancement | ✅ | 11 → 13 tentatives persistées |
| H2 | l'API sert-elle cet historique ? | ❌ | la réponse contient : `exercise, files, activeFile` |
| H3 | la surface le garde-t-elle après rechargement ? | ❌ | liste en mémoire seule (`useState([])`) |
| H4 | de quoi COMPARER deux tentatives ? | ❌ | présents : outcome, horodatage · **absents : tests, aides, code** |
| H5 | le CODE d'une tentative passée est-il retrouvable ? | ❌ | le fait ne porte que des compteurs |
| H6 | quels tests ont changé d'état ? | ❌ | `3/5` puis `4/5` ne dit pas LEQUEL |
| H7 | les AIDES sont-elles rattachées à l'historique ? | ❌ | le fait existe depuis le CP7, il n'atteint pas l'historique |
| H8 | une COMPARAISON est-elle offerte ? | ❌ | `400 — Action inconnue.` |
| H9 | l'historique servi ne fuit rien | ✅ | *(vert par vacuité : rien n'était servi)* |
| H10 | l'historique reste borné | ✅ | *(vert par vacuité : 0 entrée, 2 octets)* |

**H9 et H10 étaient verts parce qu'ils ne mesuraient rien.** Un historique vide
ne fuit pas et ne grossit pas. Les deux lignes ne deviennent des garanties
qu'après le CP10 — c'est dit ici plutôt que compté comme un acquis.

### Trois sondes reformulées, et pourquoi ce n'est pas un affaiblissement

`H4`, `H5` et `H6` interrogeaient les **champs du fait** : elles cherchaient
`results`, `hintViews` et `files` parmi eux. La mesure était juste, la question
mal posée — le CP10 a décidé de **ne pas étendre le fait** (§3 ci-dessous). Ce
que le produit doit offrir est une *capacité*, pas un champ à un endroit donné :
les trois sondes la vérifient donc là où elle vit désormais, l'historique servi
et la comparaison. Leur verdict AVANT (❌ pour les trois) est conservé dans le
tableau ci-dessus, et elles exigent maintenant **plus**, pas moins : `H5` ne se
contente plus de trouver une clé, elle demande qu'une comparaison réelle
retrouve des fichiers.

## 3 · Le choix de conception : ne pas toucher au fait

Il aurait été plus court d'ajouter `results`, `files` et `hintViews` à
`ExerciseAttempt`. Trois raisons de ne pas le faire, dans l'ordre d'importance :

1. **le fait reste le fait.** Il est gelé au contrat V74 §3.2 et alimente le
   moteur de rétention. Un fait est petit, non révisable, rejouable — y verser
   du code source en change la nature ;
2. **la taille.** 20 000 tentatives × un espace de travail donnerait un fichier
   de progression inutilisable. La borne du journal doit être indépendante de
   celle du fait ;
3. **le journal peut disparaître sans rien casser.** Perdre le code d'une vieille
   tentative fait perdre une comparaison, jamais une preuve.

D'où la règle qui tient tout le checkpoint :

> **Le journal ne fait jamais autorité.** Les compteurs affichés viennent du
> fait. Le journal n'ajoute que ce que le fait ne porte pas. Une entrée
> manquante se dit « code non conservé », jamais « zéro ».

Un test l'impose : un journal qui prétendrait `passed: 999` ne change pas le
score affiché.

### Où il vit, et pourquoi pas à côté des espaces de travail

`resetWorkspace` fait `rmSync(dir, { recursive: true })`. Le journal vit donc
dans `data/lab-journals/`, **pas** dans `data/lab-workspaces/` — parce que le
contrat gelé §1.11 dit :

> Aucun `RESET` n'efface jamais un `ATTEMPT`, une `SUBMISSION` ou une
> `EVIDENCE`. Effacer l'histoire d'un échec est le contournement `R4` de V75.

Le code d'une tentative passée n'est pas la preuve, mais il en est l'histoire.
Le ranger à un endroit qu'un bouton « Reset » balaie aurait été la même faute,
prise par la porte de derrière. La sonde `H12` le vérifie en réinitialisant deux
fois, de deux façons.

## 4 · Ce qui a été construit

Quatre modules, dont **deux purs**, et rien dans le fait.

| fichier | rôle |
|---|---|
| `lib/attempt-journal.mjs` | **PUR** — forme d'une entrée, bornes, fusion fait + journal |
| `lib/attempt-diff.mjs` | **PUR** — tests qui ont changé d'état, diff de fichier, lecture |
| `lib/attempt-journal-fs.mjs` | I/O seulement |
| `lib/attempt-journal-server.ts` | liant Next, fixe `data/lab-journals/` |

La leçon du CP9 est appliquée **d'avance** : la décision est pure, donc un test
peut l'appeler. Aucune des propriétés de ce checkpoint n'est tenue par une
recherche de texte dans une route.

### Ce que la comparaison rend

- **les tests qui ont changé d'état**, en quatre catégories — et la quatrième
  compte autant que les autres : `reussis` (rouge → vert), **`casses`
  (vert → rouge)**, `toujoursKO`, `inchanges`.
  `casses` est celle qu'on oublie, et celle qui explique un score qui stagne :
  un apprenant qui répare un test en cassant un autre voit `2/3` puis `2/3` et
  croit n'avoir rien fait. La lecture le dit explicitement : *« Le score est le
  même des deux côtés, mais ce ne sont pas les mêmes tests. »* ;
- **le diff, réduit à ses passages modifiés**, avec deux lignes de contexte et
  une coupure annoncée (`⋮`) entre deux passages éloignés. Un diff qui rend 400
  lignes identiques oblige à chercher le changement dedans, c'est-à-dire à faire
  le travail qu'on voulait éviter. Un test l'impose : une ligne modifiée sur
  soixante doit rendre **moins de quinze lignes** ;
- **les aides lues entre les deux tentatives** — ce qui distingue « réussi à la
  4ᵉ tentative » de « réussi à la 4ᵉ, après avoir lu la correction entre la 3ᵉ
  et la 4ᵉ ». Décrit, jamais compté comme une pénalité : le contrat §1.12
  l'interdit, et le CP7 avait déjà tranché ce point ;
- **une lecture en français**, qui décrit sans donner la réponse. Même discipline
  qu'au CP6 : un test interdit « remplace X par Y », « il faut écrire… »,
  « la solution est… ».

### L'ordre vient des dates, pas de l'appelant

L'apprenant coche deux lignes ; rien ne garantit qu'il commence par la plus
ancienne. Comparer « du récent vers l'ancien » échangerait ajouts et
suppressions et **présenterait un progrès comme une régression** — la pire
erreur possible pour une surface d'apprentissage. La sonde `H13` compare dans
les deux sens et exige le même résultat.

## 5 · Le défaut que la sonde a trouvé, et qu'aucun test unitaire ne pouvait voir

À la première exécution complète, `H11` a rendu **`❌ aucun test nommé`** — alors
que les 27 tests unitaires étaient verts.

La cause : le produit nomme ce champ **`testId`** dans un *résultat* de test
(`lib/exercise.mjs`, `splitAttempt`) et **`id`** dans un *descripteur* de test.
Le journal ne lisait que `id`. Il acceptait donc la tentative, gardait le code,
et **jetait silencieusement tous les résultats** — la comparaison ne pouvait
nommer aucun test, c'est-à-dire précisément ce pour quoi elle existe.

**Pourquoi mes tests ne pouvaient pas le voir** : mes fixtures écrivaient déjà
`id`.

> *Un test qui fabrique ses propres données ne découvre jamais qu'il les fabrique
> au mauvais format.*

C'est la même famille que l'anomalie n° 2 du CP0 (une sonde qui ne sait pas lire
son propre résultat) et que le défaut P7 de V75 (un champ absent d'une des deux
listes blanches). Un test unitaire garde la logique ; seule une exécution réelle
garde le **contrat entre deux modules**. Le correctif lit les deux noms, et un
test l'épingle désormais avec des données de chaque forme.

## 6 · Les treize sondes

| # | sonde | résultat | observation |
|---|---|---|---|
| H1 | le FAIT est persisté à chaque lancement | ✅ | 49 → 51 tentatives persistées |
| H2 | l'API sert cet historique | ✅ | 12 entrées |
| H3 | la surface le garde après rechargement | ✅ | hydratée depuis le serveur |
| H4 | l'historique servi porte de quoi comparer | ✅ | outcome · horodatage · tests · aides · fichiers |
| H5 | le CODE d'une tentative passée est retrouvable | ✅ | `solution.mjs` |
| H6 | quels tests ont changé d'état | ✅ | 2 tentatives portent leurs résultats publics |
| H7 | les AIDES rejoignent l'historique | ✅ | 12/12 |
| H8 | une COMPARAISON est offerte | ✅ | *2 tests passés au vert : aria-label gagne sur le texte, image : le alt sert de nom* |
| H11 | elle dit QUEL test a basculé | ✅ | +4 / −3 sur un fichier |
| H13 | l'ordre de sélection n'inverse pas la lecture | ✅ | les deux sens donnent la même comparaison |
| H12 | un `RESET` n'efface PAS le journal | ✅ | 4 → 4 conservées |
| H9 | aucun test privé ni correction servis | ✅ | 2 tests privés, 3 lignes distinctives vérifiées |
| H10 | l'historique reste borné | ✅ | 12 entrées · 3 942 octets |

## 7 · Le gantelet de mutations — 19 mutations, 19 tuées, et une équivalente

### Groupe A — tuables par `node --test tests/v76-attempt-history.test.mjs`

| # | mutation | tuée par |
|---|---|---|
| `N1` | la clé du journal diverge de celle du fait | la clé est EXACTEMENT celle du fait |
| `N2` | le journal ne déduplique plus | deux rejeux ne font qu'une entrée |
| `N3` | plus de borne en nombre | le journal est BORNÉ |
| `N4` | la borne en octets vide le journal | la borne ne vide jamais le journal |
| `N5` | la troncature devient silencieuse | un fichier tronqué le DIT |
| `N6` | une tentative sans journal est cachée | elle est LISTÉE, pas cachée |
| `N7` | les compteurs viennent du journal | ils viennent du fait |
| `N8` | les tests cassés ne sont plus signalés | réparés ET cassés sont nommés |
| `N9` | le diff rend tout le fichier | il ne rend QUE les passages qui changent |
| `N10` | la coupure n'est plus annoncée | une coupure est ANNONCÉE |
| `N11` | une tentative absente rend une comparaison « lisible » | elle rend ILLISIBLE, pas vide |
| `N12` | le journal archive l'attendu et le reçu | l'entrée ne retient qu'id, nom, état |
| `N13` | un résultat n'est lu que sous `id` | reconnu sous SES DEUX noms de champ |
| `N14` | la route journalise les résultats COMPLETS | seulement les PUBLICS |
| `N15` | la route journalise TOUS les fichiers | seulement les ÉDITABLES |
| `N17′` | le journal est rangé dans `lab-workspaces` | le journal vit HORS de l'espace de travail |

### Groupe B — que seule une exécution réelle peut tuer

| # | mutation | sondes en échec |
|---|---|---|
| `N16` | le journal n'est plus écrit | `H5 H6 H8 H11 H13 H12` |
| `N17` | une réinitialisation efface le journal | `H12` |
| `N18` | la comparaison ignore l'ordre des dates | `H13` |

### Deux mutations ont survécu, et la raison compte

**`N4`** (« la borne vide le journal ») a survécu au premier passage : mes
entrées faisaient 5 000 octets pour une borne de 12 000, donc la boucle
s'arrêtait toujours à deux entrées sans jamais atteindre zéro. Le garde
`out.length > 1` ne sert que lorsqu'**une seule entrée dépasse à elle seule** —
c'est-à-dire sur l'exercice le plus lourd, celui où l'historique est le plus
utile. *Un test qui n'atteint pas la branche qu'il croit garder ne garde rien.*
Le test exerce désormais ce cas précis.

**`N17′`** (déplacer la racine du journal dans `data/lab-workspaces/`) a survécu
à la sonde `H12`, et **c'est correct** : le fichier `…/<exerciseId>.json` se
trouve *à côté* du répertoire `…/<exerciseId>/` que `resetWorkspace` supprime,
pas dedans. La mutation est donc **équivalente pour cette propriété-là**. Elle
n'en est pas anodine — n'importe quel nettoyage de `data/lab-workspaces/`
(que le `.gitignore` présente comme jetable) emporterait le journal. La
protection reste donc tenue par le test statique, et la mutation est comptée
comme équivalente, pas comme tuée.

**`N18`** avait également survécu à son premier passage, parce que la sonde
passait déjà les deux tentatives dans le bon ordre. C'est la sonde qui était
faible, pas la mutation : `H13` a été écrite pour exercer les deux sens.

## 8 · Ce qui n'a PAS été construit

`G14` interdit de remplacer ou d'élargir sans défaut démontré. Le besoin mesuré
tient en une comparaison entre **deux** tentatives.

- **aucune branche, aucune fusion, aucune restauration, aucun blâme ligne à
  ligne** — un test le vérifie en refusant toute fonction exportée portant ces
  noms, et l'absence d'action `restore` dans la route ;
- **aucun historique de l'historique**, aucune plage, aucun « depuis » ;
- **aucun champ ajouté au fait `ExerciseAttempt`** ;
- **aucun export, aucun téléchargement du journal** — rien ne l'a demandé ;
- le diff n'est pas proposé comme éditeur : on regarde, on ne réécrit pas depuis
  là.

### Limite déclarée

Le journal ne commence qu'aux tentatives postérieures au CP10. Les **49
tentatives déjà persistées** sur la fixture sont listées avec
`code non conservé` — dites, pas masquées. Aucune reconstruction rétroactive
n'est possible : le code de ces tentatives n'a jamais été écrit nulle part, et
l'inventer serait pire que l'absence.

## 9 · Vérifications

| | |
|---|---|
| `npm test` | **1963 / 1963** |
| `npx tsc --noEmit` | 0 |
| `npx next build` | OK |
| `npm run gates:active` | **48 portes, 0 violation** |
| sondes CP10 | **13 / 13** |
| mutations | **19 appliquées · 18 tuées · 1 équivalente (déclarée)** |
| `data/progress.json` | **absent** |
| `data/lab-journals/` | ignoré par git |
