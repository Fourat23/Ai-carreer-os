# V59 · CP5 — Grammaire propriétaire AI Career OS

Écrite **après** l'audit CP4, à partir de ce que le produit possède déjà.
**Aucun sixième motif.** Aucun composant créé pour gonfler un compteur.

Le métier du produit est : **TRAJECTOIRE · COMPÉTENCE · PREUVE ·
TRANSFORMATION**. La grammaire en découle en trois couches, chacune répondant à
une question différente, chacune dérivée de données réelles.

---

## Couche 1 — CHAMP DE TRAJECTOIRE

**Question** : où suis-je dans les 365 jours ?

**Porteurs** : `TrajectoryMap` (12 pistes × 365 jours, 809 cellules) et
`YearBand` (l'année en une bande de 365 graduations, pondérée par la durée
réelle de chaque mois).

**Ce qui la rend propriétaire** : ce n'est ni une barre de progression ni un
anneau. C'est **l'année entière rendue comme un champ mesuré**, où chaque jour
occupe sa place réelle et porte son état réel. Vérifié en niveaux de gris : la
forme seule reste spécifique, sans aucune couleur d'accent.

**Règle** : une surface qui parle d'un intervalle du curriculum le montre
comme un champ de jours réels. Elle n'affiche jamais deux représentations
concurrentes du même intervalle sur la même page.

## Couche 2 — GRAMMAIRE D'ACTIVITÉ ET DE PREUVE

**Question** : de quelle nature est cette activité, et qu'est-ce qu'elle prouve ?

**Porteurs**, aux trois échelles où la question se pose :

| Échelle | Rendu | Surface |
|---|---|---|
| Section d'un document | filet latéral coloré + eyebrow numéroté (`fam-h2`) | `/day/[id]`, `/doc/[...slug]` |
| Déroulé d'un document | `PhaseRail` — icône + libellé de famille + position | `/day/[id]`, `/doc/[...slug]` |
| Pièce de preuve | `EvidenceMark` — glyphe géométrique déterminé par le type | `/projects`, `/reviews`, `/day/[id]`, `/synthese` |

**Vocabulaire unique, huit valeurs, dérivées du corpus** (`data-family`) :
cadrer · comprendre · observer · pratiquer · produire · préparer · vérifier ·
réviser.

Correspondance **preuve → nature**, déjà en place et conservée :
exercice → pratiquer · évaluation → vérifier · capstone → produire ·
mission → préparer · projet → observer.

**Aucune gamification** : la famille dit *ce que c'est*, jamais *combien ça
vaut*. Pas d'XP, pas de niveau, pas de série, pas de classement.

### Ce que le CP5 a corrigé pour rendre cette couche apprenable

Les huit jetons `--fam-*` servaient **deux taxonomies à la fois**. Depuis
V58 CP2, la bande d'identité les empruntait pour marquer la famille de
*surface* : `--fam-learn` signifiait « comprendre » sur une section de Journée
**et** « catalogue » sur une bande d'identité. La même teinte avait deux sens :
un code de couleur qui a deux sens ne s'apprend pas, et perd donc sa valeur de
grammaire.

Les deux taxonomies ont désormais chacune la sienne :

```
--fam-objective/learn/observe/practice/apply/prepare/verify/retain
    nature PÉDAGOGIQUE d'une activité — 8 valeurs, dérivées du corpus

--surf-catalog/detail/workbench/editorial
    type FONCTIONNEL d'une page — 4 valeurs, + l'accent pour le pilotage
```

Vérifié dans le navigateur : `/lessons` → `#6f8fa6`, `/settings` → `#a68a6f`,
`/lab` → `#8f9c72`, `/career` → `#8a7fa6`, `/reviews` → accent.

## Couche 3 — FAMILLE DE SURFACE

**Question** : quel type de page est-ce ?

**Porteurs** : `SurfaceHead` avec son filet latéral de 3 px (`sh-{kind}`),
`WorkbenchShell` (contexte → état système → diagnostic → opération →
prolongements), `EditorialShell` (contexte → titre → intention → navigation →
sommaire de lecture → contenu long), et la grammaire de catalogue `cat-*`.

Cinq familles : **pilotage · catalogue · détail · poste de travail ·
éditorial**. C'est la couche qui garantit que la convergence n'est pas de
l'uniformité : les pages appartiennent au même produit *et* restent
distinguables entre elles.

---

## Ce que la grammaire interdit

- Représenter un intervalle du curriculum autrement qu'en champ de jours réels
  quand la donnée existe.
- Employer une teinte de famille pédagogique pour signifier autre chose que la
  nature d'une activité.
- Rendre un motif à une échelle où il n'est plus perceptible, puis le compter
  comme signature. `EvidenceMark` occupe 0,02 % de `/projects` : il est compté
  comme **glyphe**, pas comme motif porteur d'identité.
- Ajouter un motif. L'ensemble reste fermé à cinq.

## Ce que le CP5 n'a délibérément PAS fait

**Étendre `[data-family]` au-delà de `/day` et `/doc`.** J'ai cherché où la
couche 2 pouvait honnêtement se propager. `/lessons` classe par catégorie,
`/skills` par état, `/diagnostics` par taxonomie cognitive
(RECALL / EXPLAIN / APPLY / DIAGNOSE / TRANSFER) — trois taxonomies réelles,
mais **différentes**. Les faire correspondre aux huit familles pédagogiques
demanderait d'inventer une équivalence que le corpus ne porte pas. Refusé.

La couche 2 reste donc sur les deux surfaces où `data-family` est réellement
dérivé du corpus. C'est une limite du corpus, pas un manque de design, et elle
est déclarée comme telle.
