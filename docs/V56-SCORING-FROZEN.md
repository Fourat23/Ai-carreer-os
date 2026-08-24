# V56 — Grille de scoring et seuils · **GELÉS À CP0**

> Écrit et committé **avant toute mesure et toute modification**.
> Après ce point, aucune formule, aucun seuil, aucune pondération et aucune
> définition de succès ne peut être modifiée pour mieux correspondre au
> résultat obtenu. Si une métrique se révèle mauvaise : on **conserve son
> résultat**, on **signale la limite**, on peut **ajouter** une métrique
> complémentaire — on ne réécrit jamais la règle rétroactivement.
>
> Précédent que cette règle vise : en V55, le seuil « 1,8× le second bloc » a
> été révisé *après* mesure. La révision était défendable, mais elle n'aurait
> pas dû être possible. Elle ne l'est plus.

## 1. Surfaces notées

Dashboard `/` · Journée `/day/[id]` · Révisions `/revisions` ·
Parcours `/parcours` · Calendrier `/calendar`.

Note d'une surface = moyenne de ses 10 catégories.
Note globale = moyenne non pondérée des 5 surfaces.

## 2. Les 10 catégories et leurs ancres (échelle 0 → 5, pas de 0,5)

| # | Catégorie | 2 = insuffisant | 3 = correct | 4 = bon | 5 = référence |
|---|---|---|---|---|---|
| 1 | **Identité** | rien ne distingue la page d'un dashboard générique | palette et typo reconnaissables | ≥ 1 motif propriétaire porteur de donnée | ≥ 2 motifs propriétaires, cohérents entre surfaces |
| 2 | **Originalité** | composants standards uniquement | 1 objet spécifique au problème | 2 objets spécifiques, dérivés du concept produit | langage visuel reconnaissable sans le logo |
| 3 | **Sophistication** | aplats et bordures | quelques niveaux | profondeur combinée (fond+bordure+élévation+gradient) | traitement soigné jusqu'aux états secondaires |
| 4 | **Profondeur** | ≤ 3 fonds rendus | 4-5 fonds | ≥ 6 fonds **et** ≥ 3 niveaux d'ombre | ≥ 8 fonds, ≥ 4 ombres, gradients locaux |
| 5 | **Hiérarchie** | blocs de poids équivalent | un focus visible | focus dominant + supports hiérarchisés | lecture en < 2 s des 4 questions (où / quoi / action / suite) |
| 6 | **Composition** | empilement | zones distinctes | rythme et proportions maîtrisés, pas de cardification | mise en page spécifique au contenu |
| 7 | **Pédagogie visuelle** | le contenu pédagogique est indifférencié | lire/faire distingués | phases, preuves et pratique lisibles d'un coup d'œil | la page enseigne sa propre structure |
| 8 | **Cohérence** | vocabulaire divergent | primitives partagées | tokens + primitives + vocabulaire alignés | indiscernablement du même système |
| 9 | **Utilisabilité** | actions ambiguës | action principale claire | navigation, clavier et états clairs | zéro friction sur le parcours principal |
| 10 | **Premium** | outil interne | propre | soigné et dense | on croirait un produit vendu |

**Règle de notation** : une note ≥ 4 sur les catégories 1, 2, 4 exige que les
**indicateurs objectifs correspondants (§3) soient atteints**. Les catégories
5-10 restent qualitatives mais doivent citer une capture inspectée.

## 3. Indicateurs objectifs, mesurés par harnais (`scripts/v56-visual.mjs`)

Mesurés à **1440 px** sauf mention. Aucun n'est à lui seul une preuve de
qualité ; ils bornent la notation.

| Clé | Définition | Seuil « bon » |
|---|---|:--:|
| `surfaces` | fonds distincts rendus (couleur + image), éléments ≥ 60×24 px | ≥ 6 |
| `shadows` | niveaux d'ombre distincts rendus | ≥ 3 |
| `typeRange` | police max rendue ÷ police portant le plus de caractères | ≥ 3,2 |
| `dominance` | part de surface du plus grand bloc structurant | ≥ 0,35 |
| `motifs` | motifs propriétaires détectés sur la page (§5) | ≥ 1 |
| `overflow` | dépassement horizontal | = 0 |
| `clipped` | contenu réellement rogné (hors ellipse/scroll volontaire) | = 0 |

### Anti-cardification (§12 du brief), seuils gelés

| Clé | Définition | Seuil |
|---|---|:--:|
| `cards` | surfaces « carte » : fond ≠ transparent **et** bordure **et** rayon ≥ 6 px **et** aire ≥ 12 000 px² | **≤ 8** par page |
| `maxRepeat` | plus grand nombre de blocs (≥ 140×60 px) partageant une signature de classe identique | **≤ 12** |
| `canvasShare` | part des caractères du contenu principal vivant **hors** d'une surface carte | **≥ 0,25** sur les pages de contenu (`/day`) |
| `surfaceRatio` | `surfaces` ÷ `cards` | **≥ 0,5** |

**Exemption déclarée à l'avance** : le calendrier affiche 12 mois
structurellement équivalents. `cards ≤ 8` et `maxRepeat ≤ 12` **ne s'y
appliquent pas** ; ils sont mesurés et reportés, sans être un échec.

## 4. Définition gelée de « route réellement recomposée »

Une route compte dans le plancher des **≥ 10 recompositions** si elle satisfait
**au moins 3 des 5** critères R, **et** les 3 conditions obligatoires.

**Critères R (au moins 3) :**
- **R1 — structure** : la structure de blocs de premier niveau a changé
  (ajout/suppression/réordonnancement d'au moins 30 % d'entre eux).
- **R2 — focus** : exactement un point focal, pleine largeur, `dominance ≥ 0,35`.
- **R3 — profondeur** : `surfaces ≥ 6` **et** `shadows ≥ 3`.
- **R4 — typographie** : `typeRange ≥ 3,2`.
- **R5 — motif** : la page emploie ≥ 1 motif propriétaire (§5).

**Conditions obligatoires (les 3) :** `overflow = 0`, `clipped = 0`,
axe critical/serious `= 0`.

Une route qui n'atteint pas 3 critères R est comptée **« skinnée »**, pas
recomposée. Les deux listes sont publiées séparément dans le rapport.

## 5. Motifs propriétaires — définition gelée

Un motif compte comme **propriétaire** s'il satisfait les quatre conditions :
1. il **porte une donnée réelle** issue d'un read-model existant ;
2. il est **réutilisé sur ≥ 2 surfaces** ;
3. il n'est pas un composant standard (carte, badge, barre de progression
   linéaire, tableau, onglets) ;
4. il possède une **raison informationnelle écrite** dans le code.

**Plafond gelé : 3 à 5 motifs maximum** pour l'ensemble du produit.
Les motifs existants (V55) comptent dans ce plafond : `PositionRing`,
`TrajectoryMap` (carte de mois). Il reste donc **1 à 3 créations possibles**.

Détection par harnais : présence des classes racines déclarées dans
`scripts/v56-visual.mjs` (liste figée à CP0).

## 6. Blind difference — protocole gelé

Pour `/day/[id]` et `/revisions` : capture BEFORE et AFTER à 1440 px, même
journée, même état de progression. Le test est **réussi** si au moins **trois**
des cinq éléments suivants diffèrent de façon immédiatement visible :
nombre de zones structurantes · largeur/proportions des colonnes ·
présence d'un motif propriétaire · échelle typographique dominante ·
nature de la représentation (document / rail / file / matrice).

Pour Dashboard, Parcours et Calendrier : **la différence n'est pas exigée**.
Aucune modification ne doit être faite pour réussir un test.

## 7. Journées représentatives — figées à CP0

| Rôle | Jour | Justification (mesurée avant sélection) |
|---|:--:|---|
| courte | **181** | plus petit contenu du corpus (4 965 o) |
| longue | **80** | plus grand contenu du corpus (20 217 o), 13 exercices |
| code / exercices | **1** | entrée du programme, Git/Linux, exercices de laboratoire |
| Data/ML | **150** | Machine learning — corrélation et causalité |
| IA avancée | **205** | LLM — structured outputs |

Tout layout `/day` doit être validé sur **les cinq**, à toutes les largeurs.

## 8. Largeurs — figées

375 · 480 · 640 · 768 · 1024 · 1200 · 1440 · 1600 · 1920.

## 9. Planchers non négociables

- axe-core **critical = 0** et **serious = 0** sur toutes les surfaces notées.
- clavier : focus visible, ordre cohérent, noms accessibles.
- `prefers-reduced-motion` neutralise toute transition ajoutée.
- Corpus `4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3` inchangé.
- `data/progress.json` blob `323604021055588a9528a86875f36598dbdc7758`,
  jamais muté par une visite (preuve sans restauration).
- 365 jours, ordre inchangé · `DATA = DOM = READING ORDER` sur le calendrier.
- Aucune donnée inventée · aucune gamification · aucune seconde source.
- `npm test`, `tsc --noEmit`, `npm run build`, `gates:active` verts.

## 10. Verdict — barème gelé

`REFERENCE_GRADE` **uniquement si toutes** ces conditions sont vraies :
moyenne ≥ 4,5 · aucune catégorie < 4 · originalité ≥ 4,2 · Day ≥ 4,5 ·
Révisions ≥ 4,0 · 0 P0 · 0 axe critical/serious · aucune donnée inventée ·
aucun invariant cassé · ≥ 10 routes réellement recomposées (§4) ·
blind-difference Day **et** Révisions réussi (§6) · corpus et curriculum intacts.

Sinon, dans l'ordre décroissant : `STRONG_IMPROVEMENT` · `IMPROVED` · `WEAK` ·
`FAIL`. **Le verdict n'est pas gonflé** : `STRONG_IMPROVEMENT` est un résultat
acceptable et sera annoncé tel quel.
