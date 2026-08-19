# Prompt V50 — PROFESSIONAL DEPTH & NON-CODE CLOSURE

> À lancer APRÈS V49. Ne PAS démarrer pendant V49. Macro-sprint de PROFONDEUR et
> de clôture non-code (pas d'audit de corpus, pas de refonte). Fondé sur l'état
> réel V49. Le dépôt fait foi.

## Constat hérité (à lire d'abord)
- `docs/SPRINT-V49.md` (verdict FORT ; **17/20** boucles complètes).
- `docs/audits/PROFESSIONAL-COVERAGE-V49.md`, `TRANSFER-AUDIT-V49.md`,
  `WALKTHROUGHS-V49.md`, `PRACTICE-VALIDATION-V49.md`.
- `docs/ADR-049-professional-loop-and-coverage.md`, ledger
  `docs/audits/v49-coverage-ledger.json`.
- Gates `v46/v47/v48/v49:check` ; tests `v49-coverage`, `v49-exercises`.

## Invariants absolus (inchangés)
- **Corpus ACADEMICALLY_FROZEN** (SHA-1 `4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3`,
  identique en clôture). `data/progress.json` restauré exact
  (blob `323604021055588a9528a86875f36598dbdc7758`), jamais commité.
- **Pas de second moteur / pas de seconde source.** RÉUTILISER > RELIER > DURCIR >
  ÉTENDRE > CRÉER.
- **Anti-greenwashing** : REAL / SIMULATION / PROXY / TOOLING_REQUIRED /
  EXTERNAL_ENVIRONMENT_REQUIRED / NON_CODE. Aucun appel de modèle réel, aucune
  fausse infra.
- **Anti-scope-collapse** : l'économie d'un CP se RÉALLOUE. « Qualité > quantité »
  n'excuse pas 20 % de sprint.
- **Déterminisme** ; **anti-collision d'ids** (garde + `v49:check`).
- Branche `claude/ai-career-os-saas-phfg49` ; trailers requis ; id de modèle
  absent des artefacts ; pas de PR sauf demande.

## Cibles prioritaires (dette V49)
1. **Profondeur D4/D5** là où PROFESSIONAL_READY est mince : `ds` (D4=1, D5=0),
   `gitlinux` (D4=1, D5=0), `patterns` (D4=1), `jsts` (D5=0). ≥2 D4/D5 réels
   (ambiguïté/décision, pas syntaxe) par compétence.
2. **`autonomy` (BLOCKED → NON_CODE évalué)** : rubrique reproductible (données
   pures) reliée aux phases « communication/decision » des capstones — sans
   prétendre à une exécution ; définir des signaux de preuve honnêtes.
3. **`comm`** : formaliser la rubrique d'évaluation de la communication technique
   (structure, clarté, honnêteté) reliée à la phase communication des scénarios.
4. **Variation data-driven** : un mécanisme (réutilisant le moteur existant, PAS
   un nouveau) pour varier domaine/symptômes/bruit d'un scénario sans dupliquer,
   afin de contrer la mémorisation. Mesurer la distance de transfert.
5. **Consolidation LLM/RAG/agents** : +1 D5 chacun si un vrai gap de jugement
   subsiste (audit d'abord).

## Floors (substance, réallouables)
≥24 unités substantielles nouvelles/approfondies : ≥8 D4, ≥6 D5 ; rubrique
non-code (comm + autonomy) reliée ; ≥1 mécanisme de variation ; aucune régression.

## Clôture (obligatoire)
`npm test` + `tsc --noEmit` + `npm run build` + `gates:active` verts ; corpus
SHA-1 identique ; `progress.json` restauré ; working tree propre ; aucun serveur
résiduel ; ledger sans dérive ; rapport de verdict
(INSUFFISANT/MOYEN/BON/FORT/EXCELLENT, EXCELLENT rare et démontré) répondant
compétence-par-compétence. **Ne pas démarrer V51.**
