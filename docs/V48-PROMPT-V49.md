# Prompt V49 — PROFESSIONAL PRACTICE V (transfer, depth & non-code rubrics)

> À lancer APRÈS V48. Ne PAS démarrer pendant V48. Macro-sprint de PRATIQUE et de
> CONSOLIDATION (pas d'audit de corpus, pas de refonte). Fondé sur l'état réel V48.

## Constat hérité (à lire d'abord)
- `docs/SPRINT-V48.md` (verdict FORT ; **10** compétences à boucle complète, 17/20
  pratiquables).
- `docs/PROFESSIONAL-READINESS-V48.md`, `docs/PRACTICE-AUDIT-V48.md`,
  `docs/WALKTHROUGHS-V48.md`, `docs/ADR-048-deep-practice-and-professional-scenarios.md`.
- Gates `v46/v47/v48:check` ; tests `tests/v48-exercises.test.mjs`.

## Invariants absolus (inchangés)
- **Corpus ACADEMICALLY_FROZEN** (SHA-1 `4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3`,
  identique en clôture). `data/progress.json` restauré exact (blob
  `323604021055588a9528a86875f36598dbdc7758`), jamais commité.
- **Pas de second moteur / pas de seconde source de vérité.** Réutiliser le
  harness, le catalogue, les misconceptions, le moteur de capstone, les gates.
- **Anti-greenwashing** : RÉEL / SIMULÉ / PROXY / TOOLING / EXTERNAL étiquetés.
  **Aucun appel de modèle réel. Aucune fausse infra.**
- **Anti-scope-collapse** : l'économie d'un CP se RÉALLOUE, ne réduit pas
  l'ambition. « Qualité > quantité » n'excuse pas l'absence de construction.
- **Déterminisme** ; **anti-collision d'ids** (garde du builder + `v48:check`).
- Branche `claude/ai-career-os-saas-phfg49` ; trailers requis ; id de modèle
  absent des artefacts ; pas de PR sauf demande.

## Cibles prioritaires (dette V48)
1. **Transfert `llm` et `patterns`** (aucun défi de transfert aujourd'hui) : ≥2
   défis chacun, T4/T5, cross-domain (ex. budget de contexte → budget mémoire ;
   strategy → routage d'événements).
2. **`dl` (ÉMERGENT → SOLIDE)** : profondeur exécutable locale SANS framework —
   descente de gradient à la main, backprop pas-à-pas déterministe, init/normalisation,
   vanishing gradient diagnostiqué. ≥6 exos dont ≥2 D4/D5.
3. **`comm` / `autonomy` (non-code)** : formaliser une **rubrique d'évaluation**
   reproductible (données pures) reliée à la phase « communication » des scénarios
   et aux capstones — sans prétendre à une exécution.
4. **Profondeur Data/ML** : +2-3 `python-ds` D4/D5 (feature engineering réel,
   sélection de modèle, validation croisée temporelle).
5. **Nouveaux scénarios** : ≥3 supplémentaires (ex. incident SQL/perf, régression
   frontend, pipeline data/drift) réutilisant le moteur de capstone.

## Floors (substance, réallouables)
≥30 unités substantielles nouvelles/approfondies : ≥10 D3, ≥10 D4, ≥5 D5 ;
≥4 défis de transfert ; ≥3 scénarios ; rubrique non-code reliée.

## Clôture (obligatoire)
`npm test` + `tsc --noEmit` + `npm run build` + `gates:active` verts ; corpus
SHA-1 identique ; `progress.json` restauré ; working tree propre ; aucun serveur
résiduel ; rapport de verdict (INSUFFISANT/MOYEN/BON/FORT/EXCELLENT, EXCELLENT
rare) répondant domaine-par-domaine. **Ne pas démarrer V50.**
