# V60.1 — BARÈME GELÉ
## Committé AVANT la première ligne d'implémentation

Ce fichier est écrit au CP1, avant le CP2. **Aucun seuil ne sera déplacé après
mesure.** Aucune note ne sera révisée parce que le total serait décevant.

---

## 1. Les dix critères, /5

| # | Critère | Ce sur quoi la note s'adosse |
|:--:|---|---|
| 1 | **Hiérarchie** | dominance du bloc focal, un seul point d'entrée par écran, plan de titres correct |
| 2 | **Composition** | nombre de variantes de largeur, rapports de masse, rythme vertical non uniforme |
| 3 | **Utilisation de l'espace** | hauteur de page bornée, absence de vide mort, densité par écran |
| 4 | **Identité** | motifs réellement perceptibles, reconnaissance en aveugle et en niveaux de gris |
| 5 | **Typographie** | ratio display / corps **dans la cible 3,3–4,5**, nombre de crans réellement rendus, confort de lecture |
| 6 | **Densité informationnelle** | faits utiles par écran sans surcharge, information réelle et non décorative |
| 7 | **Valeur learner-facing** | les six questions du Day sont-elles répondues au premier écran ; le Dashboard dit-il quoi faire ; le Calendar aide-t-il à se situer |
| 8 | **Cohérence inter-pages** | mêmes primitives, même vocabulaire, même grammaire de zones sur les trois surfaces |
| 9 | **Premium** | finition, respiration, rythme, absence de défaut visible sur capture |
| 10 | **Originalité** | non-généricité : la composition serait-elle transposable telle quelle à un autre SaaS |

## 2. Seuils de `REFERENCE_CANDIDATE` — tous obligatoires

- moyenne des dix ≥ **4,50**
- **aucune** catégorie < **4,00**
- identité ≥ **4,40**
- originalité ≥ **4,20**
- valeur learner-facing ≥ **4,50**

## 3. Conditions bloquantes — un seul échec interdit `REFERENCE_CANDIDATE`

### Dashboard
1. Le focus principal est **indiscutable** — un seul candidat évident au
   premier regard.
2. **Aucune grille de cartes générique.**
3. La trajectoire **porte réellement de l'information** : 365 jours réels,
   mois lisibles, révisions et jalons distingués, position marquée sans
   inventer de progression.

### Day
4. **Lecture ET action visibles dans le premier viewport à 1440 × 900**,
   mesuré au navigateur, pas estimé.
5. Le passage **lire → faire** est perceptible **structurellement** — par la
   position, la surface ou le fond, pas par une étiquette seule.
6. Le modèle **tient sur au moins cinq journées réelles** de natures
   différentes (courte, très longue, code, projet, IA/data).

### Calendar
7. La **structure annuelle est comprise immédiatement** au premier écran.
8. Les **longueurs réelles des mois sont préservées** — un mois court reste
   court, aucun remplissage.
9. Une **action contextuelle utile** est disponible.
10. **Pas une constellation de 365 boutons.**

### Identité
11. En mode aveugle, les **trois écrans sur trois** semblent appartenir au même
    produit.
12. **Au moins deux motifs propriétaires** sont réellement perceptibles dans
    l'ensemble.
13. L'identité **ne dépend pas du violet seul** — vérifié en niveaux de gris.

### Technique
14. **0 débordement horizontal** sur 375 · 768 · 1024 · 1440 · 1920.
15. **axe-core : 0 critical, 0 serious.**
16. Corpus, `data/progress.json`, curriculum et ordre des 365 jours
    **inchangés**.
17. Tests, `tsc`, build et gates **verts**.
18. Les **36 routes produit inchangées**, vérifié par la sonde gelée V56/V57
    comparée à `docs/audits/v59/cp15-after.json`.

## 4. Interdits — « design slop »

Déclarer un échec si l'on observe : grille de cartes génériques · un même
espacement partout · un même rayon partout · trois cartes de KPI sous un hero ·
dégradé décoratif omniprésent · grosse icône + titre + texte sur chaque bloc ·
glassmorphism · barre latérale de SaaS générique · gabarit de tableau de bord ·
« bento grid » sans justification · immense hero suivi d'un simple article ·
tout mis dans des rectangles · visualisation décorative sans information.

**Une surface peut être simple. Elle ne doit pas être générique.**

## 5. Verdicts autorisés

`REFERENCE_CANDIDATE` · `STRONG_IMPROVEMENT` · `IMPROVED` · `FAILED`

Si une seule condition échoue : **le verdict inférieur exact**, avec l'énoncé
de ce qui manque. Aucune réinterprétation favorable.

## 6. Cibles chiffrées dérivées du diagnostic CP0

Mesurées sur les neuf écrans V60, elles bornent l'objectif :

| Grandeur | A | B | C | **cible V60.1** |
|---|--:|--:|--:|--:|
| hauteur de page, Day | 9 331 px | **930 px** | 11 720 px | **≤ 1 400 px** |
| ratio display / corps | 4,2–5,2 | **2,1–2,4** | 5,4–6,0 | **3,3 – 4,5** |
| variantes de largeur, Day | 2 | **4** | 2 | **≥ 4** |
| dominance du focal, Dashboard | **0,55** | 0,60 | 0,68 | **0,45 – 0,65** |

Ces cibles sont des **instruments de diagnostic**, pas des objectifs à
maximiser. Une composition n'est pas meilleure parce qu'un ratio monte.
