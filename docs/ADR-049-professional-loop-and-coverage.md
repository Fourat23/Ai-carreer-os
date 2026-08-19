# ADR-049 — Boucle professionnelle & clôture de couverture (V49)

## Statut
Accepté (V49, CP1).

## Contexte

Le corpus (128 leçons) est ACADÉMIQUEMENT GELÉ (SHA-1 `4c1f3028…`). Le problème
n'est plus la prose des cours mais la **chaîne** menant du concept à la décision
professionnelle. Mesuré au CP0 (le dépôt fait foi) : 369 exercices, 10 capstones,
55 misconceptions, 18 transfer, D4=61 D5=18 ; **9 compétences** ont une boucle
professionnelle complète (les 8 dimensions), 6 sont presque complètes, 4 ont des
ruptures critiques (`patterns`/`llm` sans transfert, `secu` sans scénario, `dl`
sans transfert/scénario/profondeur), 2 sont non-code, 1 externe.

Le moteur de scénario (`lib/capstone.mjs`), l'assessment (`lib/assessment.mjs`),
la couverture (`lib/practice-coverage.mjs`), les misconceptions et le graphe
existent déjà. V49 est ADDITIF autour du corpus gelé : meilleure pratique,
variation, diagnostic, transfert — pas de restructuration.

## Décisions

### 1. Modèle de boucle professionnelle (définition normative)

Une compétence a une **boucle professionnelle complète** ssi ses 8 dimensions
sont satisfaites par des artefacts réels :

| Dimension | Satisfaite par | Faux positif à rejeter |
|-----------|----------------|------------------------|
| FOUNDATION | ≥1 leçon de programme | — |
| PRACTICE | ≥1 exercice exécutable localement (REAL ou TOOLING) | lab externe seul ; quiz |
| AUTONOMY | ≥2 exercices D3+ (raisonnement, pas application guidée) | 20 exercices D1/D2 |
| DIAGNOSTIC | ≥1 misconception reliée + feedback qui n'exhibe pas la solution | « expected X got Y » seul |
| VARIATION | plusieurs contextes (≥4 exercices distincts OU transfert) | 3 copies cosmétiques |
| TRANSFER | ≥1 défi de transfert T4/T5 cross-domain | même problème renommé |
| PROFESSIONAL | ≥1 scénario (capstone) à décision sous contraintes | phase d'exposition sans décision |
| EVIDENCE | l'artefact produit une preuve typée (skill-state) | cours lu = maîtrise |

Une **mission** compte comme professionnel PARTIEL (multi-étapes) mais pas comme
scénario à divulgation progressive : seul un capstone satisfait pleinement
PROFESSIONAL.

### 2. Ce qui NE compte PAS (anti-greenwashing)

- Volume brut d'exercices ≠ readiness.
- Cours lus ≠ maîtrise. Capstone réussi ≠ « mastered » automatique (evidence →
  `demonstrated`, jamais `mastered` sans règle).
- Un exercice syntaxiquement difficile n'est pas D4/D5 : D4 = ambiguïté/hypothèses
  concurrentes ; D5 = décision multi-étapes avec coût/risque/compromis.
- Un score de readiness est un **PROXY** dérivé, jamais une preuve.

### 3. Frontières d'honnêteté (classification obligatoire)

`REAL` (sqlite3, pandas/sklearn, node, python exécutés) · `SIMULATION` (calcul
déterministe imitant un LLM) · `PROXY` (readiness dérivée, ancrage heuristique) ·
`TOOLING_REQUIRED` (`.venv-ds` opt-in) · `EXTERNAL_ENVIRONMENT_REQUIRED`
(Docker/K8s/cloud) · `NON_CODE` (communication, autonomie).

### 4. Réutilisation stricte (aucun second moteur)

RÉUTILISER > RELIER > DURCIR > ÉTENDRE > CRÉER. Interdits : mastery-engine-v2,
skills-v2, seconde taxonomie, second moteur de scénario/scoring/évaluation,
nouvelle source de vérité persistée si un read-model dérivé suffit. Les nouveaux
modules sont des read-models / validateurs / catalogues de contenu.

### 5. Cibles de clôture V49 (effort réalloué vers les ruptures)

- `llm` : +transfert T4/T5 → boucle complète (scénario déjà présent).
- `patterns` : +transfert + durcissement jugement → boucle complète.
- `dl` : +profondeur exécutable (NumPy/stdlib, aucun framework tiers obligatoire)
  + transfert + scénario → de ÉMERGENT à OPÉRATIONNEL.
- `secu` : +scénario professionnel → boucle complète (transfert déjà présent).
- `archi` : +transfert « la bonne architecture change quand une contrainte
  apparaît » (T0 correct → T1 mauvais).
- `gitlinux` : +transfert.
- Éventuel capstone mobilisant `python`/`algo`/`ds` (incident perf) pour compléter.

Objectif honnête : **9 → ~14-15** boucles complètes. **Pas un quota** : si seules
13 sont défendables, on annonce 13.

### 6. Gate `v49:check` + ledger

`v49:check` détecte : compétence « pro » sans pratique/diagnostic/scénario/evidence
suffisants, pratique sans diagnostic, diagnostic sans variation, refs mortes
(transfer/scénario/misconception), D5 incohérent, scénario REAL utilisant une
simulation, collisions d'ids, seconde source. Produit
`docs/audits/v49-coverage-ledger.json` (matrice 20 compétences, machine-readable),
dérivé — pas une source de vérité.

## Conséquences

L'apprenant obtient une cartographie honnête et davantage de compétences à boucle
complète, sans nouveau moteur, sans toucher au corpus gelé, avec des verdicts
conservateurs et vérifiables.
