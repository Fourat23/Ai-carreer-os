# V59 — CRITÈRES GELÉS

**Ce document est le contrat du sprint.** Il est écrit et committé **avant toute
modification produit**. Aucune exigence de V59 ne vit ailleurs : une compaction
de contexte ne peut donc rien faire perdre.

Les seuils de ce document **ne changent plus après ce commit**.

---

## 0. Règle zéro — immuabilité forensique

V58 a laissé réécrire son instantané de mesure en cours de sprint. C'est
interdit ici.

| Élément | Valeur |
|---|---|
| Instantané BEFORE | `docs/audits/v59/cp0-before.json` |
| **SHA-256 du BEFORE** | **`f444e45af361c3562771510391ecc59080b6e9c5885c3dfcf72f3bc2bfb2437d`** |
| Instantané AFTER | `docs/audits/v59/cp15-after.json` |
| Gate d'immuabilité | `npm run v59:check` |

`cp0-before.json` est **immuable** à partir de ce commit. Le harnais de mesure
n'écrit **jamais** sur ce chemin ; l'AFTER va dans `cp15-after.json`.
`scripts/v59-check.mjs` échoue si le hash diffère d'un seul octet.

## 1. Métriques — reprises et additives

Les métriques gelées en **V56 §3/§4** et les compteurs additifs de **V57** sont
repris **à l'identique**, formules inchangées : `overflow`, `clipped`,
`topBlocks`, `dominance`, `surfaces`, `shadows`, `typeRange`, `fontSteps`,
`cards`, `cardsContainer`, `cardsItem`, `canvasShare`, `motifs`.

V59 ajoute, **strictement en plus**, les mesures de signature suivantes :

| Mesure | Définition |
|---|---|
| `massRatio` | surface du 1er bloc / surface du 2e bloc |
| `widthVariants` | nombre de largeurs distinctes chez les blocs de tête (tranche 40 px) |
| `heightVariants` | nombre de hauteurs distinctes chez les blocs de tête (tranche 80 px) |
| `gapMedian` | écart vertical médian entre blocs de tête consécutifs |
| `cardShare` | part des caractères enfermés dans une carte (= 1 − `canvasShare`) |
| `h2` | nombre de titres de section de niveau 2 |
| `accentEls` / `accentStructural` | éléments visibles tirant leur distinction de l'accent ; « structural » = surface > 4 000 px² |
| `motifArea` / `motifShare` | surface absolue et relative occupée par les motifs propriétaires |
| `fingerprint` | suite ordonnée des blocs de tête avec leur part de surface |

Aucune métrique existante n'est supprimée. Aucun seuil V56/V57 n'est déplacé.

## 2. Grille de notation — 12 catégories, /5

Notée à la clôture (CP14) **et** à l'ouverture (CP0), sur les mêmes bases.

| # | Catégorie | Ancrage mesurable |
|:--:|---|---|
| 1 | Hiérarchie | `dominance`, `massRatio`, `h2`, un seul point focal |
| 2 | Composition | `widthVariants`, `heightVariants`, `fingerprint` |
| 3 | Profondeur | `surfaces`, `shadows` |
| 4 | Densité | `charsTotal` rapporté à `pageH`, `cardShare` |
| 5 | Scannabilité | `h2`, `typeRange`, `fontSteps` |
| 6 | Affordance | `actionCount`, position de l'action principale, cibles ≥ 32 px |
| 7 | Typographie | `typeRange`, `fontSteps`, `maxFont`/`bodyPx` |
| 8 | Cohérence | réutilisation des primitives partagées, familles `sh-{kind}` |
| 9 | **Identité** | `motifShare`, nombre de routes portant un motif, grammaire propre |
| 10 | **Originalité** | `cardShare` (inverse), variation de composition, non-généricité |
| 11 | **Premium** | respiration, rythme, rapport des masses, finition sur capture |
| 12 | Utilité learner | où suis-je / pourquoi / quoi faire / quelle preuve / et après |

**Aucune note sans justification mesurable ou visuelle.** Aucune note n'est
révisée parce que le résultat final serait décevant.

## 3. Conditions de `REFERENCE_GRADE`

### 3.1 Seuils de score — tous obligatoires

- moyenne des 12 catégories **≥ 4,50**
- **aucune** catégorie **< 4,00**
- identité **≥ 4,40**
- originalité **≥ 4,20**
- premium **≥ 4,40**

### 3.2 Conditions bloquantes — un seul échec interdit `REFERENCE_GRADE`

1. route ancienne/intermédiaire restante **> 0**, sauf exemption justifiée
   **avant mesure** et inscrite au §7 ;
2. blind-difference insuffisant (§5) ;
3. la signature dépend **uniquement** de la palette ;
4. **plus de 5** motifs propriétaires ;
5. la navigation aléatoire révèle une route cassée ;
6. donnée inventée ;
7. mutation de `progress.json` par simple consultation ;
8. corpus ou curriculum modifié ;
9. axe critical/serious **> 0** ;
10. responsive avec perte d'information ;
11. instantané CP0 modifié (hash différent) ;
12. critères ou questions de certification absents du dépôt.

### 3.3 Verdicts autorisés

`FAILED` · `IMPROVED` · `STRONG_IMPROVEMENT` · `REFERENCE_GRADE`

Si une seule condition échoue : **le verdict inférieur exact**, avec l'énoncé
de ce qui manque. Aucune réinterprétation favorable d'un résultat publié.

## 4. Exclusions et interdits

**Interdits reconduits** : XP · niveau utilisateur · streak · leaderboard ·
badges de mérite · confetti · progression artificielle · **données inventées** ·
fausses statistiques · seconde source de vérité · suppression ou changement
d'URL · modification du curriculum, d'une leçon, d'un exercice, d'une mission,
d'un capstone, d'un diagnostic ou de l'ordre des 365 jours ·
**sixième motif propriétaire** ·
**ajout de fonds / ombres / wrappers / cartes pour satisfaire une sonde**.

**Ensemble de motifs fermé à cinq** : `PositionRing`, `TrajectoryMap`,
`PhaseRail`, `EvidenceMark`, `YearBand`. V59 les **orchestre mieux** ; il n'en
ajoute aucun.

**Interdit spécifique V59** : augmenter un compteur en multipliant les
composants ; modifier une structure qui fonctionne dans le seul but d'obtenir
un delta ; remplir un vide avec une donnée fabriquée.

## 5. Blind difference — protocole

Testé **sans logo, sans barre latérale, sans le nom « AI Career OS »**, en
masquant ces trois éléments dans la capture.

Sélection **pré-enregistrée ci-dessous, avant toute modification**. Aucune
capture AFTER n'est choisie a posteriori.

**Sélection gelée (8 surfaces, une par famille + les 3 routes à fermer)**

| # | Route | Famille |
|:--:|---|---|
| 1 | `/` | pilotage |
| 2 | `/day/80` | learner detail |
| 3 | `/lessons` | catalogue |
| 4 | `/cloud-lab/canary-no-metric` | workbench technique |
| 5 | `/security` | catalogue technique |
| 6 | `/career` | éditorial *(à fermer)* |
| 7 | `/resources` | éditorial *(à fermer)* |
| 8 | `/doc/lessons/agents-fundamentals` | document *(à fermer)* |

Cinq questions par surface :

1. appartient-elle manifestement au même produit ?
2. son type fonctionnel est-il identifiable ?
3. le focus est-il compris en moins de 5 secondes ?
4. sa composition est-elle reconnaissable ?
5. dépend-elle d'une simple couleur indigo ?

**Condition `REFERENCE_GRADE`** : ≥ 90 % « même produit » **et**
≥ 80 % « composition identifiable » **et** aucune route cassée.
Résultats bruts publiés, échecs compris.

## 6. Navigation aléatoire — tirage pré-enregistré

Graine **`V59-SIGNATURE`**, algorithme déterministe `scripts/v59-draw.mjs`
(`index = sha1(graine:i) % N`, sans remise, complétion de quotas déterministe).
**12 routes.** Quotas exigés et atteints : ≥ 3 détails, ≥ 2 techniques,
≥ 2 learner-facing, ≥ 2 pilotage, ≥ 1 document/utilitaire.

| # | Route | Famille |
|:--:|---|---|
| 1 | `/resources` | document |
| 2 | `/calendar` | pilotage |
| 3 | `/settings` | document |
| 4 | `/career` | document |
| 5 | `/cloud-foundations` | technique |
| 6 | `/capstones/agent-tool-loop-incident` | détail |
| 7 | `/projects` | learner |
| 8 | `/missions` | learner |
| 9 | `/week/12` | détail |
| 10 | `/pipelines` | technique |
| 11 | `/day/80` | détail |
| 12 | `/parcours` | pilotage |

Testé BEFORE **et** AFTER sur **la même sélection**.
**Condition : 0 route cassée en AFTER.** Le résultat initial n'est jamais
réinterprété.

## 7. Classification des 36 routes

Quatre classes, la somme doit faire **exactement 36** :

- **RECOMPOSÉE** — ≥ 3 critères R sur 5 (définition V56 §4, inchangée) **et**
  `overflow = 0`, `clipped = 0`, axe 0 critical/serious ;
- **RESKINNÉE** — touchée, mais échoue la définition ci-dessus ;
- **ANCIENNE** — non traitée ;
- **EXEMPTÉE** — exemption justifiée **avant mesure**, inscrite ici.

**Exemptions déclarées avant mesure : aucune.**

## 8. Invariants vérifiés à l'ouverture et à la clôture

| Invariant | Valeur d'ouverture |
|---|---|
| `data/progress.json` | blob `323604021055588a9528a86875f36598dbdc7758` |
| Corpus gelé | SHA-1 `4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3` |
| Routes publiques | 36 |
| Motifs propriétaires | 5, ensemble fermé |
| `curriculum/` et `data/` | 0 fichier modifié |
| Ordre des 365 jours | inchangé |

## 9. QUESTIONS DE CERTIFICATION — à répondre explicitement au CP15

Elles vivent **dans le dépôt** : une compaction ne peut plus les effacer.

1. L'instantané `cp0-before.json` est-il bit-à-bit identique à son hash gelé ?
2. Une métrique a-t-elle été supprimée, adoucie, ou un seuil déplacé après ce
   commit ? Si oui, laquelle et pourquoi ?
3. Combien de routes anciennes/intermédiaires restent-elles, nommément ?
4. Un fond, une ombre, un wrapper ou une carte a-t-il été ajouté dans le seul
   but de faire basculer une sonde ?
5. Un sixième motif propriétaire a-t-il été introduit, sous quelque nom que ce
   soit (composition, primitive, shell) ?
6. Une donnée affichée est-elle fabriquée, estimée ou extrapolée plutôt que
   dérivée du corpus ou de la progression réelle ?
7. `progress.json` a-t-il été muté par une simple consultation ?
8. Le curriculum, une leçon, un exercice, une mission, un capstone, un
   diagnostic ou l'ordre des 365 jours a-t-il été modifié ?
9. La navigation aléatoire pré-enregistrée a-t-elle révélé une route cassée,
   et le résultat d'ouverture est-il publié sans réinterprétation ?
10. Le blind-difference atteint-il ≥ 90 % « même produit » et ≥ 80 %
    « composition identifiable » ? Résultats bruts publiés ?
11. Une perte d'information a-t-elle été mesurée sur l'une des 10 largeurs ?
12. axe-core rapporte-t-il 0 critical et 0 serious sur toutes les routes
    modifiées et sur l'échantillon aléatoire ?

## 10. QUESTION FINALE OBLIGATOIRE

À répondre mot pour mot au CP15 :

> « Si je masque le logo, la sidebar, le nom AI Career OS et la couleur
> d'accent principale, est-ce que l'interface possède encore une signature
> suffisamment forte pour être reconnue comme un même produit ? »

> « Cette signature est-elle suffisamment spécifique pour ne pas pouvoir être
> remplacée par celle d'un dashboard SaaS générique sans perte d'identité ? »

**Les deux réponses doivent être OUI pour `REFERENCE_GRADE`.**

## 11. Largeurs de test — CP13

`375 · 480 · 640 · 700 · 768 · 1024 · 1200 · 1440 · 1600 · 1920`

Vérifiés : overflow, clipping, perte d'information, ordre de lecture,
colonnes, actions, cibles tactiles, focus, navigation, lisibilité, proportions.
`/glossary` est inclus d'office.

axe-core : **0 critical, 0 serious**. Aucun test NVDA/VoiceOver réel n'est
revendiqué — les tests sont automatisés et déclarés comme tels.
