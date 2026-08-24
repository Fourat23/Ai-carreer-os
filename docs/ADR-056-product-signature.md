# ADR-056 — Product Signature & High-Value Experience

**Statut** : accepté (V56) · **Complète** : ADR-055 (identité), ADR-054.2.1
(intégrité visuelle), ADR-054.2 (composition).

## Contexte

V55 a fait franchir la marche « outil interne → produit ». La mesure CP0 de V56
montre deux dettes que la palette masquait :

1. **`/day/[id]` n'a jamais reçu le système V55.** 4 fonds distincts, **1 seul
   niveau d'ombre**, police maximale **34 px**, amplitude **2,00** — les valeurs
   d'avant V55. C'est la surface où l'apprenant passe ses 4-5 heures.
2. **La signature n'existe presque pas.** Au sens de la définition gelée (un
   motif compte s'il est réutilisé sur ≥ 2 surfaces), **un seul** motif
   propriétaire comptait : `PositionRing`.

## Décision 1 — La signature est un ensemble fermé de 5 motifs, pas un style

Plafond **3 à 5 motifs pour tout le produit** (gelé à CP0). Un motif est
propriétaire s'il **porte une donnée réelle**, est **réutilisé sur ≥ 2
surfaces**, n'est **pas** un composant standard, et possède une **raison
informationnelle écrite dans le code**.

L'ensemble est arrêté à cinq, et il est complet :

| Motif | Donnée portée | Raison informationnelle |
|---|---|---|
| `PositionRing` (V55) | progression + position + mois réels | « où j'en suis dans le programme » d'un seul regard |
| `TrajectoryMap` (V55) | journées réelles groupées par mois | « comment mon année se remplit », mois par mois |
| **`PhaseRail`** (V56) | phases réellement présentes dans le contenu du jour | « où j'en suis dans la journée » et « ce qui reste à faire » |
| **`EvidenceMark`** (V56) | type de preuve réel (exercice, diagnostic, mission, capstone, projet…) | rendre un type de preuve reconnaissable sans lire son étiquette |
| **`YearBand`** (V56) | 365 journées réelles en une bande continue | rétablir la **continuité temporelle** que douze blocs de mois détruisent |

**Aucun sixième motif ne sera créé.** Un besoin nouveau se résout en réutilisant
l'un des cinq ou en n'ajoutant rien.

## Décision 2 — `EvidenceMark` n'est pas un badge de collection

Un glyphe géométrique **déterministe par type de preuve**, jamais par quantité,
jamais par rareté, jamais coloré selon un mérite. Il ne se gagne pas : il
**nomme**. Le type vient du read-model existant (`evidence.type`), rien n'est
inventé, et le libellé textuel reste présent — le glyphe ne porte jamais
l'information seul.

## Décision 3 — La page Journée est un poste de travail, pas un article

Quatre zones distinctes et visuellement différenciées, dans cet ordre :

1. **Mission** — hero : jour, titre display, objectif, compétence, difficulté,
   durée, position dans le mois et le parcours, état, action.
2. **Déroulé** — `PhaseRail` : phases réelles du contenu, position, état
   (parcourue / courante / à venir), navigation directe.
3. **Lecture** — le document. Largeur de lecture maîtrisée, hiérarchie de
   titres, code nettement distinct. **Le cours n'est pas mis en cartes** : c'est
   un document pédagogique, et la mesure `canvasShare` protège cette règle.
4. **Pratique** — zone visuellement différente : il doit être évident qu'on
   passe de « je lis » à « je fais ». Exercices, laboratoire, missions,
   correction, preuves.

Le rail de contexte n'est affiché que s'il a un contenu réel ; il n'est jamais
rempli pour occuper la colonne.

## Décision 4 — Anti-cardification : une mesure, pas une intention

Emballer chaque donnée dans une carte est la signature du travail générique.
Seuils gelés à CP0 : `cards ≤ 8`, `maxRepeat ≤ 12`, `canvasShare ≥ 0,25` sur les
pages de contenu, `surfaceRatio ≥ 0,5`. Une page peut légitimement contenir un
document, un rail, une frise, une liste, une matrice, un tableau — **sans les
emballer**.

Exemption unique, déclarée avant mesure : le calendrier affiche douze mois
structurellement équivalents.

## Décision 5 — Le calendrier gagne une continuité, pas une refonte

`DATA ORDER = DOM ORDER = READING ORDER` reste intangible, et `column-count`
reste interdit. La `YearBand` ajoute **au-dessus** des douze blocs une lecture
continue de l'année : position courante évidente, densité de pratique
perceptible, mois pauvres visibles comme **courts** plutôt que comme de grands
panneaux vides.

## Décision 6 — Ne pas créer de churn pour réussir un test

Dashboard, Parcours et Calendrier sont des références V55. Ils ne changent que
sur un défaut **mesuré**. Le blind-difference n'est exigé que sur `/day/[id]` et
`/revisions`.

## Décision 7 — Les critères ne bougent plus après CP0

Formules, seuils, pondérations et définitions de succès sont figés dans
`docs/V56-SCORING-FROZEN.md`. Une métrique qui se révèle mauvaise conserve son
résultat, sa limite est signalée, une métrique complémentaire peut être ajoutée
— la règle n'est jamais réécrite après coup.

Cas déjà rencontré à CP0 et traité selon cette règle : la **dominance n'est pas
informative sur une page-document** (l'article occupe 0,73-0,82 par sa seule
longueur). Le résultat est conservé et reporté tel quel ; la lecture de la
hiérarchie de `/day` s'appuie sur les autres indicateurs.

## Conséquences

- Trois nouvelles primitives : `PhaseRail`, `EvidenceMark`, `YearBand`.
- `/day/[id]` recomposée en quatre zones ; `/revisions` recomposée en
  zero-state utile + file priorisée.
- Gate `v56:check` : plafond de motifs, seuils anti-cardification, profondeur
  et typographie de la page Journée, réutilisation ≥ 2 surfaces par motif.
- Le harnais `scripts/v56-visual.mjs` mesure les 5 journées représentatives.
