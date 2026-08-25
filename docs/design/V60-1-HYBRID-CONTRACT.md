# V60.1 — CONTRAT HYBRIDE
## AI Career OS — CAREER WORKSTATION

Écrit **avant toute implémentation**, après le gel d'ouverture. Ce document
fait foi ; aucune exigence de V60.1 ne vit uniquement dans la conversation.

---

## 0. Gel d'ouverture — CP0

| Vérification | Valeur |
|---|---|
| Branche | `claude/ai-career-os-saas-phfg49` |
| `HEAD` | `b85970a` (clôture V60) |
| `local == origin` | oui |
| Arbre de travail | propre |
| Stash | 0 |
| Serveurs résiduels | 0 |
| Corpus gelé | SHA-1 `4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3` (gate V48) |
| `data/progress.json` | blob `323604021055588a9528a86875f36598dbdc7758` |
| 365 jours | ordonnés, 376/376 exercices mappés, 0 orphelin (gate V51) |
| `tsc` · tests · build · gates | propre · **1285/1285** · compilé · **39 vertes** |
| Routes produit | 36 |

## 1. Diagnostic CP0 — les trois directions V60, mesurées

Sonde à 1440 × 900, lecture seule, sur les neuf écrans V60 :

| écran | hauteur de page | dominance du bloc principal | display / corps | variantes de largeur |
|---|--:|--:|--:|--:|
| **A** dashboard | 1 181 px | **0,55** | 51,8 / 10 = **5,18** | 2 |
| A day | **9 331 px** | 0,44 | 46,1 / 11 = 4,19 | 2 |
| A calendar | 2 210 px | — | 37,4 | — |
| **B** dashboard | **930 px** | 0,60 | 34,6 / 14,5 = **2,38** | 3 |
| **B** day | **930 px** | 0,38 | 28,8 / 13,5 = **2,13** | **4** |
| B calendar | **930 px** | 0,77 | — | 2 |
| **C** dashboard | 1 863 px | 0,68 | 59,0 / 11 = **5,37** | **1** |
| C day | **11 720 px** | 0,56 | 63,4 / 11 = 5,76 | 2 |
| C calendar | 3 427 px | 0,72 | 66,2 / 11 = **6,02** | 1 |

**Ce que les chiffres disent, et qui fonde tout le sprint :**

1. **B est la seule à borner la page.** Ses trois écrans tiennent en 930 px :
   ce sont les volets qui défilent, pas la page. A et C font défiler jusqu'à
   **9 331** et **11 720 px** sur le Day. Un poste de travail ne défile pas sur
   dix mille pixels.
2. **B est la seule à composer en largeur** — 4 variantes sur son Day, contre
   1 pour les deux écrans phares de C.
3. **B a la typographie la plus plate** : ratio display/corps **2,13**, quand
   le brief vise 3,3–4,5. C monte à **6,02**, au-dessus de la cible.
4. **A a la meilleure dominance de pilotage** avec le meilleur ratio
   typographique de son groupe (5,18 pour 0,55 de dominance).

**La cible chiffrée du sprint tombe donc toute seule :**
page bornée comme B · largeurs variées comme B · dominance de A ·
ratio typographique **entre** B et C, soit **3,3 à 4,5**.

---

## 2. L'architecture en trois couches

### LAYER 1 — PILOTAGE, hérité de A

Employé quand la question est : **où suis-je dans ma trajectoire, et que
dois-je faire maintenant ?**

Ce que V60.1 prend de A :
- la **bande d'état** monospace bord à bord, comme ligne de contexte système ;
- un **bloc focal dominant** occupant une part mesurable du premier écran ;
- un **objet graphique de trajectoire réellement grand**, portant les 365 jours
  réels, les mois, les révisions et les jalons ;
- le **découpage par filets et fonds de bande** plutôt que par cartes.

Ce que V60.1 **ne prend pas** de A : le vocabulaire militaire (« mission »,
« secteur », « engager »), signalé comme le point le plus discutable de la
direction dans le rapport V60. La Career Workstation parle le vocabulaire du
curriculum : journée, semaine, mois, compétence, livrable, preuve.

### LAYER 2 — TRAVAIL, hérité de B

Employé quand la question est : **qu'est-ce que je lis, qu'est-ce que je fais,
où en suis-je dans mon travail ?**

Ce que V60.1 prend de B :
- la **page bornée** — la hauteur de fenêtre est la surface de travail ;
- la **séparation lecture / action** dérivée de `data-family`, la taxonomie que
  le corpus porte déjà ;
- le **contexte local persistant** (semaine, jours voisins, plan de journée) ;
- les **zones accolées séparées par un filet d'un pixel**, sans gouttière,
  sans rayon, sans ombre — ce qui rend l'absence de carte structurelle ;
- la **barre d'état** comme ligne de faits.

Ce que V60.1 **corrige** de B : sa typographie plate (2,13), et la disparition
pure et simple du volet de preuve sous 1100 px.

### LAYER 3 — ÉDITORIAL, hérité de C

**Ce n'est pas une troisième structure.** C ne fournit aucune architecture.
C fournit **une échelle et une respiration** :

- le cran display, appliqué au **texte** et pas seulement aux chiffres ;
- la mesure de lecture confortable ;
- les blancs et les rapports de masse ;
- les filets capillaires plutôt que les contours pleins ;
- le traitement éditorial de l'introduction d'une surface ;
- **le renversement de fond pour marquer un changement de geste** — la
  meilleure idée du spike V60, retenue comme grammaire et non comme effet.

Ce que V60.1 **ne prend pas** de C : le Day en colonne verticale géante
(11 720 px) et le Dashboard en page d'accroche.

---

## 3. Règles anti-Frankenstein

Le rapport V60 a nommé trois collages à ne jamais faire. Ils deviennent des
règles :

1. **Jamais la coquille de B avec la typographie de C.** La typographie de C
   exige des marges que les volets de B n'accordent pas. V60.1 résout cela en
   **élargissant les zones** de B au lieu d'y injecter l'échelle de C telle
   quelle : l'échelle est réduite à la cible 3,3–4,5, pas importée à 6,0.
2. **Jamais les bandes bord à bord de A traversées par du texte long.** Les
   bandes de A supposent qu'aucune colonne de lecture ne les coupe. Dans
   V60.1 les bandes sont réservées au **pilotage et aux lignes de faits**,
   jamais au corps de lecture.
3. **Jamais trois grammaires de trajectoire coexistantes.** V59 a retiré
   `PositionRing` de `/` et `/parcours` précisément pour cela.
   **Une seule représentation d'un intervalle par surface.**

Et une quatrième, propre à V60.1 :

4. **Le vocabulaire est unique.** Pas de « mission » de A à côté de
   « poste de travail » de B à côté de « manuel » de C. Une seule voix.

---

## 4. Rôle exact des cinq motifs — ensemble fermé

Aucun sixième motif. Chaque motif reçoit **un rôle et un seul**, et n'apparaît
que sur les surfaces où ce rôle est posé.

| Motif | Rôle unique en V60.1 | Surfaces |
|---|---|---|
| **TrajectoryMap** | l'année **entière** comme champ de 365 jours réels — le seul objet de trajectoire à grande échelle | Dashboard (dominant), Calendar (structure) |
| **YearBand** | l'année **compactée en une ligne**, comme règle de position permanente | Day (barre d'état), Calendar (bande de tête) |
| **PhaseRail** | la position **dans un document**, navigable | Day (contexte) |
| **PositionRing** | la position **dans un intervalle borné** — mois ou semaine | Dashboard (contexte du mois) |
| **EvidenceMark** | la **nature d'une preuve** attendue | Day (zone de production) |

Règle de non-duplication : `TrajectoryMap` et `YearBand` disent la même chose à
deux échelles. **Ils ne coexistent jamais sur une même surface** — le Calendar
utilise la bande en tête et le champ en corps, ce qui est une exception
explicite justifiée par le changement d'échelle (vue d'ensemble → détail
mensuel), et elle est déclarée ici avant mesure.

---

## 5. Données — réelles, en lecture seule

Rappel du constat V60, revérifié : `data/progress.json` **et**
`data/progress.example.json` contiennent **zéro journée enregistrée**, zéro
compétence notée, aucune date de démarrage.

Les prototypes :
- consomment les read-models existants **en lecture seule** ;
- **ne dessinent aucun remplissage de progression** ;
- affichent en permanence
  `Prototype de comparaison — aucune écriture de progression` ;
- déclarent l'absence là où elle compte, jamais ne l'estiment.

Interdits reconduits : progression fictive · compétences, preuves, projets ou
métriques inventés · gamification · seconde source de vérité · modification du
curriculum, des 365 jours, de `progress.json` · migration d'une route produit ·
sixième motif.

## 6. Mode aveugle

`?blind=1` sur les trois routes retire : le nom du produit, toute étiquette
révélant l'origine A/B/C, et le bandeau de prototype. Les prototypes n'ont de
toute façon ni logo ni barre latérale produit — la coquille du spike est nue
par construction.

## 7. Critères de succès

Détaillés et gelés dans `docs/design/V60-1-SCORING-FROZEN.md`, committé avant
la première ligne d'implémentation. Résumé :

- **Dashboard** — focus principal indiscutable, aucune grille de cartes, la
  trajectoire porte réellement de l'information.
- **Day** — **lecture ET action visibles dans le premier viewport à 1440**,
  passage lire → faire perceptible structurellement, tenue sur **≥ 5 journées
  réelles** de natures différentes.
- **Calendar** — structure annuelle comprise immédiatement, longueurs réelles
  des mois préservées, action contextuelle disponible, pas 365 boutons.
- **Identité** — en aveugle, 3/3 écrans du même produit, ≥ 2 motifs réellement
  perceptibles, identité indépendante du violet seul.
- **Technique** — 0 débordement, axe 0 critical/serious, corpus et progression
  intacts, tests / tsc / build / gates verts.

## 8. Emplacement

`app/design-spike/v60-1/` — **V60 n'est pas détruit** : `app/design-spike/v60/`
et ses 29 captures restent consultables comme référence de comparaison.

Aucun lien du produit ne mène au spike. Les 36 routes produit restent
**inchangées** et cela sera vérifié en rejouant la sonde gelée V56/V57 contre
`docs/audits/v59/cp15-after.json`.
