# ADR-017 — Mutation contrôlée du curriculum (enrichissement V17)

Statut : accepté (Sprint V17). Décision fondée sur l'audit CP0 réel. Premier
sprint autorisé à modifier **intentionnellement** le contenu pédagogique. Aucun
nouveau curriculum, aucune seconde source de vérité, aucun nouveau runtime,
aucune refonte graphique.

## Contexte — état réel audité (CP0)

Des sprints V6 à V16, une invariante forte protégeait le contenu : les 365
Markdown générés (`curriculum/**/*.md`) et `data/program.json` devaient rester
**byte-identiques** à la baseline, à l'exception de la métadonnée volatile connue
`generatedAt`. Cette invariante a garanti que les refontes techniques et UI
n'altéraient jamais la pédagogie (gate `curriculum-guard`).

V17 a un objectif **éditorial** : combler des manques réels identifiés par
l'audit de couverture — dette technique (taxonomie), maintenance
(corrective/adaptative/préventive/évolutive), refactoring sans régression,
performance/profiling raisonnés, et documentation technique professionnelle
(ADR, RFC, HLD, HSD, LLD, TSD, runbook, post-mortem, changelog). Ces sujets sont
**absents ou seulement mentionnés** aujourd'hui. Les atteindre impose de modifier
le contenu — donc de lever l'invariante byte-identical, **de façon strictement
encadrée**.

## Décisions

### 1. Sources canoniques inchangées

La **source de vérité rédactionnelle reste `scripts/data/*.mjs`** (36 modules).
`data/program.json` et les 365 `curriculum/**/*.md` restent **générés** par
`scripts/generate-curriculum.mjs`. On **n'édite jamais** un `.md` généré ni
`program.json` à la main ; on édite le `.mjs` source puis on régénère. Les 85
`.md` marqués `<!-- keep -->` (édités à la main, jamais écrasés) ne sont touchés
que si explicitement listés. `resolveTrackDays`, `resolveTrackDayObjects`,
`buildCatalogue` et les modèles existants restent réutilisés — aucune logique de
parcours en dur dans les pages.

### 2. Ce qui est levé, et ce qui ne l'est pas

- **Levé** : la contrainte byte-identical sur les `.mjs` sources, sur les `.md`
  générés qui en dérivent, et sur `program.json`, **uniquement** pour les
  journées explicitement listées comme cibles d'enrichissement V17.
- **Non levé** : le déterminisme et l'idempotence de la génération (hors
  `generatedAt`) ; l'intégrité structurelle (`curriculum:check`,
  `depth-check`, `glossary:check`) ; l'anti-fuite (aucune solution/test privé
  indexé) ; la stabilité des trois parcours ; l'absence de dérive **hors
  périmètre**.

### 3. Sélection des journées modifiées

Aucune réécriture massive. La sélection est **explicite, justifiée, traçable** :
un fichier `docs/architecture/v17-enrichment-plan.json` liste, pour chaque
journée cible, le sujet couvert, le parcours concerné et la raison. Une journée
absente de cette liste **ne doit pas** dériver. Priorité aux journées déjà
thématiquement proches (refactoring, projets, revues, SRE) pour préserver la
cohérence pédagogique plutôt que d'injecter des blocs hors-sol.

### 4. Audit des différences (matrice avant/après)

Avant toute mutation : baseline des hashes de tous les `.mjs`, `.md`,
`glossary.json` et `program.json` (919 fichiers, conservée). Après chaque
génération, un validateur compare l'ensemble des hashes à la baseline et
**échoue** si un fichier **hors liste autorisée** a changé (dérive involontaire).
`program.json` est comparé **hors `generatedAt`**. La matrice avant/après
(fichier × hash avant × hash après × sujet) est consignée dans le rapport
`docs/SPRINT-V17.md`.

### 5. Préservation des parcours

Les trois parcours (Foundations, Full-Stack, Backend) doivent continuer à
résoudre leurs journées et exercices. Les tests d'isolation multi-parcours
(preuves/compétences par parcours, backup v3, vue agrégée en lecture seule)
restent verts. Aucun sujet V17 n'est codé en dur par parcours : l'appartenance
d'une journée à un parcours reste dérivée de `resolveTrackDays`.

### 6. Retour en arrière (rollback)

Chaque checkpoint est un commit atomique. Un enrichissement problématique se
révoque par `git revert <sha>` puis régénération — la source `.mjs` étant
canonique, la régénération restaure déterministiquement les `.md` et
`program.json`. La baseline de hashes (CP0) permet de vérifier un retour exact
sur les fichiers hors périmètre. `data/progress.json` est **toujours** sauvegardé
avant et restauré après les validations (contrairement au contenu V17, qui reste
en place).

### 7. Éviter l'enrichissement générique de masse

Interdits : paragraphes génériques, listes d'outils sans explication, définitions
circulaires, contenu répétitif, conseils non mesurables, affirmations de
performance sans baseline, exercices artificiels. Tout bloc ajouté vise, quand
pertinent, le gabarit pédagogique du projet : définition claire, modèle mental,
exemple, contre-exemple/erreur fréquente, activité guidée, activité autonome,
critère de validation objectif, application professionnelle, question
d'entretien, lien vers un exercice/projet à valeur réelle. La revue humaine
(diff par journée) prime sur le volume.

### 8. Documentation de cours vs documentation du produit

Deux natures distinctes, à ne pas confondre :

- **Documentation de cours** (pédagogique) : le contenu *enseigné* aux
  apprenants — ce qu'est un ADR, quand écrire un RFC, comment lire un profil de
  performance. Elle vit dans `scripts/data/*.mjs` → `curriculum/**/*.md`, et dans
  le glossaire. C'est le périmètre éditorial de V17.
- **Documentation du produit** (l'application AI Career OS elle-même) : ADR de
  décisions techniques (`docs/ADR-0XX-*.md`), rapports de sprint
  (`docs/SPRINT-VX.md`), architecture interne. Elle décrit *comment le produit
  est construit*, pas ce qu'il enseigne.

Un ADR *du produit* (comme celui-ci) documente une décision d'ingénierie ; un
ADR *enseigné* est un artefact que l'apprenant apprend à rédiger. V17 enrichit la
première catégorie de contenu (cours) et fournit des **modèles réutilisables**
(templates) que l'apprenant produit — sans jamais mélanger les deux dépôts de
sens.

### 9. Convention HSD du projet (choix documenté)

L'acronyme **HSD** n'est pas universel ; plusieurs lectures coexistent dans
l'industrie (« High-Level Solution Design », « High-Level System Design », voire
« Hardware/Software Design » dans l'embarqué). AI Career OS **ne prétend pas**
qu'une seule définition est standard. Convention retenue et utilisée partout dans
le curriculum et le glossaire :

> **HSD = High-Level Solution Design** — la vue *solution* de haut niveau : le
> problème métier, les contraintes, les options de solution envisagées et le
> choix retenu, à un niveau au-dessus du **HLD** (High-Level Design, qui décrit
> déjà la structure technique des composants). Positionnement dans la pyramide
> documentaire du projet : **HSD** (quelle solution, pourquoi) → **HLD**
> (architecture des composants) → **LLD** (Low-Level Design, détail d'un
> composant) → **TSD** (Technical Specification Document, contrat
> d'implémentation).

Toute entrée de glossaire et toute leçon citant HSD référence explicitement cette
convention et signale l'ambiguïté (`ambiguityNote`) plutôt que de la masquer.

## Conséquences

- Positives : le curriculum devient professionnellement exploitable sur les
  sujets transverses ; les enrichissements sont traçables, déterministes et
  audités ; le rollback est mécanique ; les parcours restent stables.
- Coûts : une gate supplémentaire (validation de périmètre d'enrichissement) ;
  une discipline de plan explicite avant toute édition ; la baseline
  byte-identical historique n'est plus un invariant global mais un invariant
  **hors périmètre**.
- Non-objectifs : pas de second curriculum, pas de refonte, pas de réseau, pas de
  micro-benchmark systématique, pas d'enrichissement au kilomètre.
