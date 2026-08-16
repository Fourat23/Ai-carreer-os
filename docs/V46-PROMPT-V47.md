# Prompt V47 — EXECUTABLE PRACTICE REMEDIATION II

> À lancer APRÈS V46. Ne PAS démarrer pendant V46. Macro-sprint de PRATIQUE
> (pas d'audit, pas de refonte de corpus). Fondé sur l'état réel V46.

## Constat hérité (à lire d'abord)

- `docs/SPRINT-V46.md` (verdict BON ; 13 domaines pratiquables sur 20).
- `docs/PRACTICE-AUDIT-V46.md`, `docs/PRACTICE-COVERAGE-V46.md`.
- `docs/ADR-040-executable-practice-runtime.md` (Python stdlib + sqlite3, sans
  dépendance tierce, sans second moteur).
- Gate `v46:check` ; test `tests/v46-exercises.test.mjs`.

## Invariants absolus (inchangés)

- **Corpus ACADEMICALLY_FROZEN** : `curriculum/lessons/**`, program, ordre,
  prérequis, modèles mentaux — intouchables sauf preuve d'un défaut (SHA-1
  `4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3`).
- **Pas de second moteur** ; réutiliser le harness (Python/sqlite3), catalogue,
  contrats, scoring, sandbox uniques.
- **Pas de dépendance tierce** non reproductible (numpy/pandas/sklearn exclus).
- **Anti-scope-collapse** : réutiliser puis compléter ; ne pas réduire le
  périmètre silencieusement.
- **Déterminisme** : sorties entières/chaînes, jamais de flottant nu.

## Cibles prioritaires (domaines encore sans pratique exécutable)

1. **LLM** (llm) : ladder exécutable — comptage de tokens (approx déterministe),
   estimation de coût entrée/sortie, effet de la température (déterminisme à
   T=0), structured output + validation, troncature de fenêtre de contexte.
2. **Évaluation IA** (evalia) : golden set, précision/rappel d'un juge,
   comparaison de versions, détection de régression, biais de mesure — au-delà
   du recall@k déjà présent en RAG.
3. **Architecture** (archi) : exercices de décision (choisir couplage/frontière,
   détecter une dépendance qui traverse une couche, idempotence/queue) — code
   déterministe modélisant les décisions.
4. **Design patterns** (patterns) : implémenter Strategy/Factory/Observer en
   petit, refactoriser un `switch` en table de stratégies, etc.

## Cibles secondaires

5. **Cloud / Docker / K8s** : étoffer les tâches `EXTERNAL_ENVIRONMENT_REQUIRED`
   (data/external-tasks.json) ; envisager un mode d'auto-vérification de la
   PREUVE collée (parse de sortie `kubectl`/`docker inspect`) sans exiger l'infra.
6. **evalia/llm** : relier ces exercices à des misconceptions dédiées (feedback
   diagnostique), comme en V46.

## Floor V47 (indicatif, pas quota aveugle ; réallouer si prouvé nuisible)

- ≥ 28 nouveaux exercices exécutables sur llm/evalia/archi/patterns ;
- ≥ 10 D3, ≥ 8 D4, ≥ 4 D5 ;
- ≥ 12 exercices reliés à une misconception ;
- ≥ 2 nouveaux scénarios professionnels (réutiliser capstones/missions) ;
- couverture exécutable : viser **≤ 4** compétences encore sans pratique
  (comm/autonomy restant non-code par nature).

## Méthode & garde-fous

- Chaque exercice : starter imparfait, référence 100 % verte, ≥1 test public +
  ≥1 privé, **vérifié par exécution réelle** (réutiliser `scripts/v46-build-lib.mjs`).
- **Vérifier l'absence de collision d'id** AVANT d'écrire (leçon V46 : 4 ids
  avaient écrasé des exercices existants) — comparer à `data/exercises/` d'abord.
- Étiqueter honnêtement SIMULATION / EXTERNAL_ENVIRONMENT_REQUIRED.
- `v46:check` (ou un `v47:check`) doit rester vert ; readiness cohérente avec le
  gate v44 (diagnostic full requis pour strong-junior).
- `data/progress.json` restauré au blob de référence, jamais commité.
- Vérif finale : `npm test`, tsc, build, gates verts ; corpus re-haché ; tree
  propre ; local == origin.

## Critère de succès V47

Faire passer le verdict de **BON** vers **FORT** : llm/evalia/archi/patterns
disposent d'une vraie boucle exécutable, cloud a des tâches externes solides, et
il ne reste que les compétences non-code (comm, autonomy) sans exercices — sans
jamais toucher au corpus gelé.
