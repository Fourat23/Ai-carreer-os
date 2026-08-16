# SPRINT V47 — Professional Practice II

**Type** : construction (pas d'audit). **Corpus** : gelé (V45.3), inchangé
(SHA-1 `4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3`). **Langue** : français.
**Branche** : `claude/ai-career-os-saas-phfg49`.

## 1. État Git

Branche `claude/ai-career-os-saas-phfg49` ; working tree propre ;
`data/progress.json` intact (blob `323604021055588a9528a86875f36598dbdc7758`,
non modifié) ; `.venv-ds/` gitignoré ; aucun serveur ni workspace résiduel.

## 2. Ce qui existait déjà (réutilisé, aucun second moteur)

- Harness d'exécution (`lib/workspace-fs.mjs`) + adaptateurs Node/Python/TS/
  web/react — étendu, jamais dupliqué.
- 308 exercices, read-model `practice-coverage.mjs`, registre `misconceptions.mjs`,
  gates v43/v44/v46, capstones (data-ml, rag, backend, cloud, frontend).
- 3 capstones **réutilisés** comme aboutissement des scénarios V47.
- Builder `v46-build-lib.mjs` **réutilisé** (référence verte + starter cassant).

## 3. Ce qui a été réellement créé

- **25 exercices V47** (`sprint: v47`), vérifiés par EXÉCUTION RÉELLE :
  - **Data/ML pro** : 8 exos `python-ds` (numpy/pandas/scikit-learn RÉELS via
    venv opt-in) — `pdx-*` (nettoyage, dtypes, groupby, merge), `skl-*`
    (train/test split, matrice de confusion, régression logistique, **Pipeline +
    CV anti-fuite** D5).
  - **Éval IA / LLM** : 9 exos `python3` déterministes — exact match, sortie
    structurée, contrat d'outil, **ancrage PROXY**, porte de non-régression,
    catégorisation d'échecs, tokens/coût, **harnais de rapport composite** D5.
  - **Archi / Patterns** : 8 exos `node-js` — strategy, factory, adapter,
    observer, **violation de couche**, **détection de cycle**, handler idempotent,
    **when-not-yagni** D5.
- **8 misconceptions V47** reliant les nouveaux exercices au feedback
  diagnostique (invariant : 0 exercice partagé).
- **Nouveau runtime `python-ds`** (opt-in, détecté, honnête) + provisionnement
  `scripts/v47-provision-ds-venv.sh` + `requirements-ds.txt` épinglé.
- **Protection anti-collision d'ids** à 3 niveaux : garde du builder, gate
  `v47:check` (hard-fail sur toutes les familles d'artefacts), test
  `tests/v47-catalogue-safety.test.mjs`.
- **Gate `v47:check`** (unicité d'ids, capacités runtime, contrat V47) +
  **test d'exécution** `tests/v47-exercises.test.mjs`.
- **4 nouveaux labs EXTERNAL** honnêtes (Docker build/run, Compose healthcheck,
  K8s endpoints, AWS VPC) dans `data/external-tasks.json`.
- Docs : ADR-047, PRACTICE-AUDIT-V47, PROFESSIONAL-PRACTICE-V47,
  CURRICULUM-INTEGRATION-V47, PROFESSIONAL-READINESS-V47, RUNTIME-CAPABILITIES-V47,
  EXTERNAL-LABS-V47, ce rapport, prompt V48.

## 4. Compétences : mouvement théorie → pratique

**Avant V47** : 13/20 réellement pratiquables.
**Après V47** : **17/20** (FORT 7 · SOLIDE 7 · ÉMERGENT 3).

- `evalia` : de **NO_PRACTICE** à **FORT** (9 exos + harnais D5).
- `archi` : de **NO_PRACTICE** à **SOLIDE** (couche/cycle/idempotence).
- `patterns` : de **NO_PRACTICE** à **ÉMERGENT** (5 exos, yagni D5).
- `llm` : de concept seul à **ÉMERGENT** (tokens/coût/éval PROXY).
- `ml` : approfondi avec **outillage RÉEL** (pandas/sklearn, Pipeline anti-fuite).

Détail et limites : `docs/PROFESSIONAL-READINESS-V47.md`.

## 5. Réponse à la question centrale (domaine par domaine)

> « Peut-on aujourd'hui PRATIQUER réellement chaque compétence à un niveau pro ? »

- **Data/ML** : **OUI** (avec outillage). pandas/scikit-learn s'exécutent
  réellement via `.venv-ds` ; sans le venv, honnêtement `TOOLING_ENVIRONMENT_REQUIRED`.
- **Éval IA/LLM** : **OUI** pour l'ingénierie autour du modèle (métriques,
  contrats, gates, coût) ; **NON** pour l'appel de modèle réel (par conception —
  déterminisme, hors ligne ; ancrage = `PROXY` explicite).
- **Architecture** : **OUI** — violations de couche, cycles, idempotence se
  détectent en code exécuté.
- **Design patterns** : **PARTIELLEMENT** — les patterns clés s'exécutent et le
  jugement « ne pas sur-concevoir » est testé ; axe encore étroit (5 exos).
- **Cloud/Infra** : **EXTERNAL PRACTICE REQUIRED** — enseigné et raisonné,
  exécution réelle déportée (7 labs honnêtes) ; aucune fausse exécution.
- **Comm / Autonomie** : **NON (non-code)** — s'évaluent par production écrite et
  capstones, pas par exécution.

## 6. Validation de clôture

- `npm test` : **1234 tests, 0 échec** (dont exécution réelle des 25 exos V47,
  pandas/sklearn inclus).
- `tsc --noEmit` : **0 erreur**.
- `gates:active` : **tous verts** (curriculum 365/365 + v18…v47).
- Corpus SHA-1 : **identique** à l'ouverture.
- `data/progress.json` : **intact**, non commité.
- Working tree : **propre**, aucun résidu.

## 7. Verdict

**BON → FORT (partiel).** V47 tient sa promesse de construction : trois axes qui
étaient à **zéro pratique** (evalia, archi, patterns) sont désormais exécutables,
`ml` gagne un outillage professionnel réel, et le compte « réellement
pratiquable » passe de 13 à 17/20 **sans un seul mensonge de statut** (RÉEL /
SIMULÉ / PROXY / TOOLING / EXTERNAL strictement étiquetés) et **sans toucher au
corpus gelé**. Ne pas revendiquer EXCELLENT : `llm` reste émergent (pas d'appel
modèle), `patterns` est étroit, `cloud` demeure externe, et `algo`/`ds` manquent
d'une misconception dédiée. Ce sont les cibles de V48.
