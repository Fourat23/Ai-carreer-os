# V47 — Capacités d'exécution (runtimes)

Sortie de `v47:check` dans CET environnement (les capacités sont détectées, pas
supposées — `lib/runtime-detect.mjs`). L'absence d'une capacité n'invalide pas
un exercice : elle le rend `TOOLING_ENVIRONMENT_REQUIRED` ou `EXTERNAL_…` et il
est sauté honnêtement.

| Runtime | Détecté ici | Nature | Étiquette de preuve |
|---------|-------------|--------|---------------------|
| `node-js` | ✅ v22 | Code réel, sandbox (execFile, timeout, allowlist) | `LOCAL_EXECUTABLE` |
| `python3` | ✅ 3.11 | Code réel stdlib, sandbox | `LOCAL_EXECUTABLE` |
| `python-ds` | ✅ (venv opt-in) | numpy/pandas/scikit-learn RÉELS via `.venv-ds` | `TOOLING_ENVIRONMENT_REQUIRED` |
| `typescript` | ✅ 5.9 | Compilation + exécution réelles | `LOCAL_EXECUTABLE` |
| `web` | ✅ | Aperçu navigateur local | `LOCAL_EXECUTABLE` |
| `react-tsx` | ✅ React 19 | Rendu réel | `LOCAL_EXECUTABLE` |

## `python-ds` — outillage Data Science opt-in

- **Provisionnement** : `scripts/v47-provision-ds-venv.sh` crée `.venv-ds/`
  (gitignoré) à partir de `requirements-ds.txt` (numpy 2.4.6, pandas 2.3.3,
  scikit-learn 1.7.2). Aucune installation globale, aucun réseau au runtime.
- **Détection** : `detectPythonDs()` vérifie `.venv-ds/bin/python` puis
  `import numpy, pandas, sklearn`. Absent → les 8 exercices `pdx-*/skl-*` sont
  déclarés `TOOLING_ENVIRONMENT_REQUIRED` et sautés, jamais simulés.
- **Sandbox** : identique aux autres runtimes Python (interpréteur dédié, pas de
  shell, timeout + SIGKILL, env minimal, sortie plafonnée).
- **Reproductibilité** : versions épinglées ; le venv n'est pas commité (poids +
  spécificité machine). Le contrat est le fichier de requirements, pas le binaire.

## Ce qui reste hors runtime (par conception)

- **Aucun appel de modèle réel** (OpenAI/Anthropic/local LLM). Les exercices
  `llm-*`/`eval-*` opèrent sur des briques déterministes ; l'ancrage est un
  `PROXY` explicite.
- **Aucune infra Docker/K8s/cloud locale** : démon Docker absent → tous les labs
  infra sont `EXTERNAL_ENVIRONMENT_REQUIRED` (voir `EXTERNAL-LABS-V47.md`).

## Garanties de sécurité d'exécution (rappel)

`lib/workspace-fs.mjs` : racine dédiée par exécution, `execFile` sans shell,
allowlist de fichiers, `readOnly` respecté, timeout dur + SIGKILL, variables
d'environnement de l'application invisibles au code testé, sortie plafonnée.
Couvert par `tests/` (dont l'invisibilité des secrets et l'absence de résidu).
