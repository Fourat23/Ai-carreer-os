# Prompt V48 — PROFESSIONAL PRACTICE III (consolidation & depth)

> À lancer APRÈS V47. Ne PAS démarrer pendant V47. Macro-sprint de PRATIQUE et de
> CONSOLIDATION (pas d'audit de corpus, pas de refonte). Fondé sur l'état réel V47.

## Constat hérité (à lire d'abord)

- `docs/SPRINT-V47.md` (verdict BON→FORT partiel ; **17/20** domaines pratiquables).
- `docs/PROFESSIONAL-READINESS-V47.md` (matrice par compétence, limites assumées).
- `docs/ADR-047-professional-practice-runtime.md`, `docs/RUNTIME-CAPABILITIES-V47.md`,
  `docs/EXTERNAL-LABS-V47.md`, `docs/CURRICULUM-INTEGRATION-V47.md`.
- Gates `v46:check`, `v47:check` ; tests `tests/v47-exercises.test.mjs`,
  `tests/v47-catalogue-safety.test.mjs`.

## Invariants absolus (inchangés)

- **Corpus ACADEMICALLY_FROZEN** : `curriculum/lessons/**`, program, jours, ordre,
  prérequis, missions, playbooks, glossaire — intouchables sauf preuve d'un défaut
  (SHA-1 `4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3`, identique en clôture).
- **`data/progress.json`** : restauré exact (blob
  `323604021055588a9528a86875f36598dbdc7758`), jamais commité.
- **Pas de second moteur / pas de seconde source de vérité** : réutiliser le
  harness, le catalogue, les misconceptions, les gates, la sandbox.
- **Anti-greenwashing** : RÉEL / SIMULÉ / PROXY / TOOLING_ENVIRONMENT_REQUIRED /
  EXTERNAL_ENVIRONMENT_REQUIRED strictement étiquetés. **Aucun appel de modèle
  réel.** Aucune fausse exécution d'infra.
- **Anti-scope-collapse** : l'économie d'un CP se RÉALLOUE, ne réduit pas
  l'ambition. « Qualité > quantité » n'est pas une excuse pour ne rien construire.
- **Déterminisme** : sorties entières/chaînes formatées, jamais de flottant nu.
- **Anti-collision d'ids** : hard-fail conservé (`v47:check` + test de sûreté).
- Branche `claude/ai-career-os-saas-phfg49` ; trailers de commit requis ;
  identifiant de modèle absent des artefacts ; pas de PR sauf demande explicite.

## Cibles prioritaires (dette identifiée en V47)

1. **`patterns` (ÉMERGENT → SOLIDE)** : densifier au-delà de 5 exos —
   decorator, template-method, command/undo, dependency-inversion exécutables,
   avec ≥2 D4 et 1 D5 de jugement supplémentaires.
2. **`llm` (ÉMERGENT, sans modèle réel)** : approfondir les briques
   déterministes — troncature de fenêtre de contexte, budget de tokens sous
   contrainte, effet T=0 (déterminisme), retry/backoff idempotent, prompt
   d'injection défensif (mesure PROXY). Rester honnête sur l'absence de modèle.
3. **`algo` / `ds`** : combler la dette de **misconception dédiée** (aucune
   aujourd'hui) — au moins 2 misconceptions reliées à des exos existants.
4. **`dl`** : profondeur exécutable locale (backprop pas-à-pas déterministe,
   descente de gradient à la main, init/normalisation) — sans framework tiers.
5. **`comm` / `autonomy` (non-code)** : formaliser une **rubrique d'évaluation**
   reproductible (production écrite, décision de capstone) sans prétendre à une
   exécution ; les relier explicitement aux capstones.
6. **Data/ML** : 2-3 exos `python-ds` de plus au niveau D4/D5 (feature
   engineering, class imbalance + métrique adaptée, calibration).

## Livrables attendus

- Exercices exécutables vérifiés (référence verte, starter cassant ≥1 public).
- Misconceptions étendues (invariant : 0 exercice partagé).
- ≥1 scénario professionnel supplémentaire réutilisant un capstone existant.
- Gate `v48:check` (ou extension de `v47:check`) + test d'exécution `v48`.
- Docs : ADR-048 si décision de runtime, SPRINT-V48, readiness recomputé, prompt V49.
- Objectif honnête : viser **18/20** pratiquables et faire passer `patterns` et
  `llm` à SOLIDE — **sans quota** : ne rien fabriquer qui ne s'exécute pas.

## Clôture (obligatoire)

`npm test` + `tsc --noEmit` + `gates:active` verts ; corpus SHA-1 identique ;
`progress.json` restauré ; working tree propre ; aucun serveur résiduel ;
rapport de verdict (INSUFFISANT/MOYEN/BON/FORT/EXCELLENT, EXCELLENT rare) avec
réponse domaine-par-domaine. **Ne pas démarrer V49.**
