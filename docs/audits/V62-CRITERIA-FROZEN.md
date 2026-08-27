# V62 · CP1 — Plan, critères et métriques gelés

Écrit et committé **avant toute modification de code**. Aucun seuil ne sera
abaissé, aucune métrique supprimée, aucun critère réinterprété a posteriori.

---

## 1. Écart assumé au plan du brief §20

Le brief autorise un ordre différent s'il est « objectivement préférable » et
documenté au CP1 **avant** implémentation. Trois écarts, tous imposés par la
mesure du CP0 :

1. **`/glossary` entre au périmètre.** Le brief ne la nomme pas. Elle est la
   route **la plus lourde du produit** — 1 073 Ko d'HTML, plus que `/lab`.
   Traiter la dette de DOM sans elle serait traiter la moitié du problème.
   → rattachée au CP6 (architecture de rendu).
2. **`/day/[id]` à 375 px entre au périmètre.** 13 425 px, troisième page la
   plus haute. V61 ne l'avait jamais mesurée à cette largeur (cf. CP0 §6.1).
   → rattachée au CP3 (longues surfaces).
3. **Le CP2 traite d'abord l'action primaire, pas la ligne de contexte.**
   La mesure montre que « où suis-je » est déjà répondu partout sauf une route,
   tandis que « quelle suite » manque sur 13. L'urgence est inverse de celle
   supposée.

## 2. Ce qui est INTERDIT — invariants

Corpus, leçons, exercices, missions, diagnostics, capstones, ordre des
365 jours, `progress.json`, données inventées, seconde source de vérité,
gamification sous toute forme, suppression ou changement d'URL publique, hex en
dur dans le TSX, `prefers-reduced-motion`.

**Interdit spécifique à V62 :**
- ajouter un bouton accentué sur un écran uniquement pour satisfaire une sonde ;
- utiliser `display:none` comme réduction de DOM et l'appeler optimisation ;
- créer un sixième motif ;
- ajouter de la virtualisation React sans problème mesuré qui la justifie ;
- réduire une hauteur de page en supprimant du contenu pédagogique.

## 3. Les quatre conditions de sortie, rendues mesurables

### CONDITION A — grammaire de contexte

| | BEFORE | cible |
|---|--:|--:|
| routes learner-facing en classe **C** | 1 | **0** |
| routes learner-facing en classe **B** | 12 | **≤ 2**, chacune justifiée par écrit |
| routes learner-facing en classe **A** | 22 | **≥ 33** |
| traitements visuels distincts de l'action primaire | **2** | **1** |

Une action ne compte que si elle **mène à une route réelle** et découle du
contenu. Un lien vers une route inexistante est un échec, pas un point.

### CONDITION B — longues surfaces

| route | @375 BEFORE | cible @375 |
|---|--:|--:|
| `/lessons` | 18 762 | **≤ 6 000** |
| `/missions` | 13 776 | **≤ 7 000** |
| `/day/80` | 13 425 | **≤ 7 000** |
| routes > 5 000 px @375 | 13 | **≤ 8** |

Contrainte : **aucun contenu pédagogique retiré**. Vérification par comptage —
le nombre de leçons, missions et activités rendues doit être identique
avant/après, `<details>` fermés compris.

### CONDITION C — santé structurelle du laboratoire

| | BEFORE | cible |
|---|--:|--:|
| `/lab` nœuds dans `main` | 6 438 | **≤ 2 000** |
| `/lab` nœuds dans un `<details>` fermé | 5 264 | **≤ 200** |
| `/lab` HTML | 867 Ko | **≤ 350 Ko** |
| `/glossary` HTML | 1 073 Ko | **≤ 400 Ko** |

Contrainte : les 376 exercices et les 738 termes restent **tous atteignables**.
`display:none` ne compte pas comme réduction.

### CONDITION D — cohérence du produit

- ensemble des motifs **fermé à 5**, vérifié par gate ;
- signature de carte la plus répétée : `/calendar` 12 → **≤ 6** ;
- couverture `ContextLine` : 15 → **≥ 28** routes ;
- test à l'aveugle sur **≥ 10 routes**, jugé et documenté, ambiguïtés incluses.

## 4. Seuils hérités qui restent en vigueur

Repris de V61, non modifiables : 0 débordement horizontal · 0 texte rogné ·
axe **0 critical / 0 serious** · `h1` unique et aucun saut de niveau ·
dominance ≤ 0,80 sur toute route migrée · ratio typographique 3,3–4,5.

`/lessons` (0,90) et `/doc/[...slug]` (2,24) sont **hors seuil aujourd'hui** et
doivent y rentrer.

## 5. Gates nouveaux, à tester en négatif (§19)

`scripts/v62-check.mjs` :

1. **classe de contexte** — chaque route learner-facing déclarée doit exposer
   une action primaire ; casser une action fait échouer le gate ;
2. **traitement unique de l'action primaire** — une seule classe autorisée ;
3. **budget de DOM `/lab`** — comptage statique du rendu conditionnel ;
4. **ensemble des motifs fermé** — ajouter un sixième fait échouer ;
5. **anti-cartification** — plafond de signatures répétées par route.

**Chaque gate doit être vu échouer, puis restauré.** Un gate jamais vu échouer
n'est pas prouvé. En V61, au premier essai, 3 vérifications sur 6 laissaient
passer la casse ; ce test n'est pas une formalité.

## 6. Conditions de la clôture UX

`UX_CLOSURE_READY` exige les **dix** points du brief §17, sans exception et
sans compensation entre eux. Si un seul échoue → `UX_CLOSURE_NOT_READY`, avec
l'énoncé de ce qui manque. Aucune promotion par enthousiasme.

## 7. Plan CP1 → CP15

| CP | contenu |
|---|---|
| CP1 | ce document + gel (fait) |
| CP2 | action primaire unifiée + `ContextLine` propagée aux familles restantes |
| CP3 | `/lessons` — catalogue navigable ; **et** `/day/[id]` à 375 px |
| CP4 | `/missions` — densité mobile |
| CP5 | `/missions/[id]` + cohérence catalogue ↔ détail |
| CP6 | `/lab` **et** `/glossary` — architecture de rendu |
| CP7 | `/security` + `/cloud-foundations` — dé-cartification |
| CP8 | `/notes` + `/settings` |
| CP9 | `/career` + `/resources` + `/guide` |
| CP10 | `/doc/[...slug]` — la seule route de classe C |
| CP11 | famille technique détail (`pipelines`, `kubernetes`, `cloud-lab`) |
| CP12 | propagation du contexte aux learner routes restantes |
| CP13 | orchestration des motifs + audit anti-cartification |
| CP14 | responsive 9 largeurs + axe + clavier + test à l'aveugle + captures |
| CP15 | intégrité + chaîne complète + rapport + commit + push |
