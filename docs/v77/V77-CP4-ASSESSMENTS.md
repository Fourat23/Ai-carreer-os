# V77 · CP4 — ASSESSMENTS : CINQ ÉCHECS NE LAISSAIENT QU'UNE TRACE

> **Fait construit : `AssessmentAttempt`.** Une soumission de diagnostic est un
> ACTE daté. Le produit n'en gardait que la projection — la preuve — et la
> projection, par nature, se déduplique.

---

## 1. Le défaut, mesuré en HTTP avant d'écrire une ligne

Le CP0 avait noté la dette `D6` (« un assessment échoué 5× laisse 1 trace »).
Je l'ai **remesurée** sur le produit réel plutôt que de la recopier, et la
mesure dit plus que la dette.

**Première mesure** — sept soumissions humaines sur le même diagnostic :

```
0/5 échec   → conservé
0/5 échec   → « Ce résultat est déjà enregistré. »
0/5 échec   → « Ce résultat est déjà enregistré. »
0/5 échec   → « Ce résultat est déjà enregistré. »
0/5 échec   → « Ce résultat est déjà enregistré. »
5/5 réussi  → conservé
5/5 reprise → « Ce résultat est déjà enregistré. »

état écrit : 2 preuves · 0 tentative
```

**Seconde mesure, plus gênante** — une progression réelle sous le seuil :

```
0/5 → conservé
1/5 → REFUSÉ comme doublon
4/5 → conservé
```

La clé d'une preuve est `sourceType:sourceId:compétences:qualifiante`. **Elle
ignore le score.** Deux échecs de scores différents ont donc la même clé, et
c'est le **premier** qui survit.

> Le produit gardait la première tentative et appelait ça un historique.

Un apprenant qui passe de `0/5` à `3/5` sans atteindre le seuil laissait une
trace disant `0/5`. Pour un pilote humain, c'est pire qu'une absence de
donnée : c'est une donnée qui dit le contraire de ce qui s'est passé.

## 2. La même cause qu'en V74 · CP2, trois sprints plus tard

Ce n'est pas un oubli d'écriture, c'est un **choix d'objet** :

> le produit persiste la **projection** (la preuve, dédupliquée par nature) et
> jette le **fait** (la soumission, qui ne se déduplique pas).

V74 · CP2 l'a corrigé pour les exercices, V75 · CP10 pour les transferts. Les
diagnostics étaient restés — et c'est la surface où l'apprenant recommence le
plus.

## 3. Ce que le fait porte, et ce qu'il refuse de porter

| champ | pourquoi |
|---|---|
| `passed` / `total` | ce que le correcteur SERVEUR a compté |
| `seuil` | `passThreshold` de la fixture, **recopié** pour que le calcul reste refaisable |
| `outcome`, `reussiteGlobale` | **dérivés**, jamais reçus de l'appelant |
| `kind` | `assessment` ou `capstone` — un seul fait pour deux surfaces (décision CP2) |
| `simulation` | booléen, jamais du texte libre (dette `D9`) |
| `empreinte` | empreinte des réponses, pour distinguer un acte d'un rejeu |

Et ce qu'il ne porte pas : **aucun niveau, pourcentage de maîtrise, rang ou
percentile.** « Transformer assessment en mastery » est nommément interdit ; le
moyen le plus sûr de ne pas le faire est de ne jamais calculer autre chose que
ce que le correcteur a compté. Un test vérifie les **clés du fait**, pas une
promesse en commentaire.

### 3.1 Le seuil appartient au fait

`4/5 = 0,8` : réussi sous un seuil de 0,7, échoué sous un seuil de 0,9. Le même
score change de sens selon la fixture. Recopier le seuil dans le fait permet à
un lecteur futur de refaire le calcul sans avoir à retrouver la version du
contenu qui était en vigueur ce jour-là.

## 4. Le point décisif : **où** le fait est écrit

L'interface appelle la route **deux fois**, et ce détail change tout :

- `submit()` — corriger, **sans** `record` ;
- `keep()` — conserver, avec `record: true`.

Écrire la tentative dans la branche `record` n'aurait observé que **les
tentatives dont l'apprenant est assez content pour les garder**. C'est
exactement la dissymétrie que V74 · CP2 a corrigée pour les exercices, réécrite
à l'identique. Le fait est donc écrit **à chaque correction serveur**, avant la
branche `record`, et la preuve continue de dépendre du choix de l'apprenant.

### 4.1 Deux gardes, qui ne disent pas la même chose

| garde | écarte | n'écarte pas |
|---|---|---|
| **clé métier** — diagnostic + seconde serveur + empreinte | la même requête livrée deux fois | deux réponses différentes à la même seconde |
| **`estUnRejeu`** — mêmes réponses, même issue, < 10 s | la séquence « corriger puis conserver » de l'interface | la même réponse resoumise une minute plus tard |

Sans la seconde, chaque diagnostic conservé compterait **double** — ce qui
gonflerait la courbe d'échecs au lieu de la révéler, et serait un mensonge de
sens contraire à celui qu'on corrige. Une soumission humaine distincte, elle,
reste toujours un fait distinct.

`empreinteReponses` n'est pas réécrite : elle vient de V75 · CP10. Deux
implémentations de la même empreinte dériveraient un jour, et deux règles de
déduplication différentes sur deux surfaces jumelles seraient exactement
l'incohérence que ce sprint retire.

## 5. La chaîne réelle, après correction

Même scénario que §1, rejoué sur le produit reconstruit :

```
0/5 · 1/5 · 2/5 · 2/5 · 3/5 · 5/5 · 5/5   →  7 tentatives écrites
                                              (2 preuves, inchangées)

09:19:28  0/5  failure  seuil=0.7  reussiteGlobale=false
09:19:39  1/5  partial  seuil=0.7  reussiteGlobale=false
09:19:50  2/5  partial  seuil=0.7  reussiteGlobale=false
09:20:01  2/5  partial  seuil=0.7  reussiteGlobale=false
09:20:12  3/5  partial  seuil=0.7  reussiteGlobale=false
09:20:23  5/5  success  seuil=0.7  reussiteGlobale=true
09:20:34  5/5  success  seuil=0.7  reussiteGlobale=true

doublon réseau (deux POST identiques à la suite)  →  1 seule tentative
```

**Ce que le CP4 n'a pas changé** : les deux preuves sont les mêmes qu'avant, avec
la même déduplication. Aucune migration, aucune preuve rétroactive, aucune
donnée historique reconstruite — les soumissions d'avant le CP4 n'ont jamais été
observées et le resteront.

## 6. Ce que ce checkpoint N'A PAS fait

- **Aucune preuve supplémentaire.** Enregistrer une tentative ne modifie que
  `assessmentAttempts` — vérifié en comparant l'état complet avant/après.
- **Aucun capstone branché.** Le fait porte déjà `kind: 'capstone'` et
  `simulation`, mais la route des capstones n'émet rien : c'est le CP6, avec sa
  propre justification (`capstone-grade` dégradé en `self`, dette `D4`).
- **Aucun moteur touché.** Un `AssessmentAttempt` n'entre ni dans la
  compétence, ni dans la rétention, ni dans la récupération. Le CP9 tranchera ce
  que chaque fait qualifie ; jusque-là, il est observé et rien de plus.
- **Aucune migration des preuves existantes.** Elles restent telles quelles.

## 7. Vérifications

| vérification | résultat |
|---|---|
| `tests/v77-assessment-attempt.test.mjs` | **23 / 23** |
| `npm test` | **2047 / 2047** |
| `npx tsc --noEmit` | **0 erreur** |
| `npx next build` | **OK** |
| `npm run gates:active` | **49 portes, 0 violation** |
| `bash scripts/v76-negative.sh` | **11 règles vues échouer, 0 trou** |
| chaîne HTTP réelle | 7 soumissions → **7 faits** · doublon réseau → **1 fait** · preuves inchangées |
| `data/progress.json` | **absent** |

## 8. Ce qui reste incertain

**Une courbe de scores n'est pas une courbe d'apprentissage.** `0/5 → 3/5 → 5/5`
peut être de la compréhension, de la mémorisation du corrigé, ou l'effet d'un
questionnaire à choix multiples. Le fait décrit ; il ne conclut pas, et `lecture`
n'emploie délibérément aucun verbe de progression.

**Ce que le fait ne dit pas encore** : *quelles* questions ont échoué.
`gradeAssessment` produit un détail par taxonomie, volontairement laissé de côté
pour garder le fait pauvre. Si un pilote humain en a besoin, ce sera une décision
explicite, pas un ajout opportuniste.

**Ce qui reste invisible** : une correction rendue **hors ligne**. L'interface
retombe sur un correcteur client quand la route échoue, et le serveur ne peut pas
observer ce qu'il n'a pas corrigé. C'est une limite déclarée, pas un trou à
combler par une déclaration du client — ce serait `DECLARED` présenté comme
`VALIDATED`.
