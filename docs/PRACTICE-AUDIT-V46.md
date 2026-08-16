# V46 — CP0 : Forensic Practice Audit (lecture seule)

Sprint **Executable Practice Remediation I**. Objet : mesurer honnêtement la
**pratique exécutable** par compétence AVANT toute construction. Aucune
modification en CP0.

## État Git & environnement (constaté)

- Branche `claude/ai-career-os-saas-phfg49` ; HEAD `f069a3f` ; local == origin ;
  tree **propre** ; stash **vide** ; aucun serveur résiduel.
- Corpus gelé : `4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3` (inchangé).
- `data/progress.json` : blob `323604021055588a9528a86875f36598dbdc7758`.
- Baseline V45.3 : `npm test` 1217 ✓, tsc 0, gates 0, build 0.

## Runtimes réellement disponibles (mesuré sur la machine)

| Runtime | Disponible | Détail |
|---|:---:|---|
| Node.js | ✅ | `process.execPath` (toujours) |
| TypeScript | ✅ | compilé → Node (package local) |
| React/TSX | ✅ | rendu serveur |
| Web (HTML/CSS/JS) | ✅ | preview serveur |
| **Python 3** | ✅ | **3.11.15** |
| **sqlite3 (stdlib Python)** | ✅ | **3.45.1 — SQL réel possible** |
| numpy / pandas / scikit-learn | ❌ | non installés |
| pip | ⚠️ | présent, mais installs **non reproductibles** (env éphémère, CI, offline) |

**Conséquence** : Python stdlib + **sqlite3** permettent de la **vraie**
pratique exécutable pour Data et SQL sans aucune dépendance tierce. numpy/pandas/
sklearn ne peuvent PAS être supposés présents → on n'en dépend pas (ADR CP1).

## Architecture de pratique existante (lue, non réinventée)

- Catalogue unique : `data/exercises/*.json` (**262 exercices**).
- Modèle pur : `lib/exercise.mjs` (`validateExercise`, allowlist runtimes/tests).
- Exécution sandboxée : `lib/workspace-fs.mjs` (`runExercise`) ; harnais générés
  par `lib/runtime.mjs` (adaptateurs node/python/ts/web/react) ; détection
  `lib/runtime-detect.mjs`.
- Contrats de test : `call-equals`, `stdout-equals`, `stdout-contains` (+ web/react).
- Read-model couverture : `lib/practice-coverage.mjs` (7 axes : foundation,
  practice, autonomy, diagnostic, variation, transfer, professional ; readiness
  not-ready→strong-junior). **Source unique.**
- Diagnostic : `lib/misconceptions.mjs` (misconception → skill + exerciseRefs).
- Gates actifs : `v43:check`, `v44:check`.

## Matrice de pratique exécutable (20 compétences, données réelles)

| Compétence | Exos | Exécutables | Code (js/ts/py) | D3 | D4 | D5 | Verdict pratique |
|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| algo | 25 | 25 | 25 | 11 | 5 | 0 | **fort** (D5 manquant) |
| ds | 16 | 16 | 16 | 9 | 1 | 0 | fort (D4/D5 faibles) |
| jsts | 215 | 215 | 189 | 58 | 4 | 0 | **fort** (D4/D5 faibles) |
| python | 15 | 15 | 15 | 5 | 3 | 0 | moyen (à approfondir) |
| gitlinux | 22 | 22 | 22 | 5 | 1 | 0 | moyen |
| http | 14 | 14 | 14 | 4 | 2 | 2 | correct |
| sql | 5 | 5 | 5 | 2 | 2 | 1 | **SIMULÉ en JS** (pas de vrai SQL) |
| se | 6 | 6 | 6 | 2 | 3 | 1 | correct |
| archi | 0 | 0 | 0 | 0 | 0 | 0 | **ZÉRO** |
| patterns | 0 | 0 | 0 | 0 | 0 | 0 | **ZÉRO** |
| ml | 0 | 0 | 0 | 0 | 0 | 0 | **ZÉRO** |
| dl | 0 | 0 | 0 | 0 | 0 | 0 | **ZÉRO** |
| llm | 0 | 0 | 0 | 0 | 0 | 0 | **ZÉRO** |
| rag | 0 | 0 | 0 | 0 | 0 | 0 | **ZÉRO** |
| agents | 0 | 0 | 0 | 0 | 0 | 0 | **ZÉRO** |
| evalia | 0 | 0 | 0 | 0 | 0 | 0 | **ZÉRO** |
| secu | 0 | 0 | 0 | 0 | 0 | 0 | **ZÉRO** |
| cloud | 0 | 0 | 0 | 0 | 0 | 0 | **ZÉRO** |
| comm | 0 | 0 | 0 | 0 | 0 | 0 | ZÉRO (non-code par nature) |
| autonomy | 0 | 0 | 0 | 0 | 0 | 0 | ZÉRO (capstones/missions) |

> Projection via `projectSkill` (taxonomie fine → programme). Un exercice compte
> pour toutes ses compétences projetées ; jsts capte donc large.

## Constats exacts

- **12/20 compétences ont 0 exercice exécutable** : archi, patterns, ml, dl, llm,
  rag, agents, evalia, secu, cloud, comm, autonomy.
- **SQL = 5 exercices mais SIMULÉS** (runtime node-js : raisonnement relationnel
  en JS, note « réel vs simulé » explicite dans la leçon). Aucun SQL réellement
  exécuté — alors que **sqlite3 est disponible**.
- **D5 quasi inexistant** hors http/sql/se : la difficulté « décision sous
  contrainte » manque presque partout.
- Le socle logiciel (algo/ds/jsts/gitlinux/http/python) est réellement pratiqué ;
  c'est cohérent avec les audits V45.x (Barre B forte sur le socle uniquement).

## Cibles V46 (priorités, cf. plancher §6 du prompt)

1. **Python / Data** (CP3) : approfondir (D3-D5, diagnostic) — répond au B V45.3.
2. **SQL réel via sqlite3** (CP4) : passer de SIMULÉ à EXÉCUTÉ.
3. **ML** (CP5) : de 0 à une vraie ladder (split/leakage/métriques/baseline) en
   Python stdlib.
4. **DL** (CP6) : forward/gradient/diagnostic en Python déterministe.
5. **RAG** (CP7) : mini-pipeline local exécutable (chunk→retrieval→RRF→éval).
6. **Agents** (CP8) : orchestration déterministe (state machine, budget, garde-fous).
7. **Sécurité** (CP9, LOCAL_EXECUTABLE) ; Cloud/K8s → EXTERNAL_ENVIRONMENT_REQUIRED honnête.

## Décision CP0

Poursuite automatique. La dette est un **manque de volume ET de domaines** de
pratique exécutable (12/20 à zéro), pas un défaut de moteur : le harness existant
supporte déjà Python et sqlite3. V46 étend le **catalogue** et, au besoin, le
**runtime** (ADR CP1) — sans second moteur, sans toucher au corpus gelé.
