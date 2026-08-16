# V46 — Runtime d'exécution & sécurité du harness

## Runtime utilisé (sans second moteur)

Toute la pratique V46 réutilise le harness existant :
- adaptateur **`python3`** (`lib/runtime.mjs`) pour Python et **SQL réel**
  (`import sqlite3`, base `:memory:` avec fixtures) ;
- exécution sandboxée par `lib/workspace-fs.mjs` (`runExercise`) ;
- notation commune (`gradeRun`, `call-equals`).

Aucune dépendance tierce ajoutée (cf. ADR-040). Python 3 requis pour les
exercices Python/SQL ; ils sont **sautés proprement** si Python 3 est absent
(`detectRuntime('python3').available`), comme les tests d'exécution.

## Surface de sécurité (audit CP14)

Le bac à sable était déjà durci (ADR-009/010, `workspace-fs.mjs`) ; V46
n'introduit pas de nouvelle surface :

| Risque | Mitigation en place | V46 |
|---|---|---|
| Command injection | `execFile` sans shell ; args = [harnais] | inchangé |
| Path traversal | `resolveWithinRoot`, allowlist de fichiers | inchangé |
| Écriture hors sandbox | racine dédiée par exercice, `readOnly` respecté | `db.py` en `readOnly` |
| Runaway process | timeout + SIGKILL | inchangé |
| Sortie illimitée | sortie plafonnée (100 Ko) | inchangé |
| Secrets / env | env minimal, aucun secret | inchangé |
| **Accès réseau** | Node : aucun ; **sqlite3 : aucun réseau par nature** | pas de nouvelle surface |
| Fichiers temporaires | `:memory:` (SQL) ou dans la racine sandboxée | nettoyés |

**Conclusion** : sqlite3 n'ouvre que `:memory:` (ou un fichier dans la racine
isolée) et n'a aucune capacité réseau. Les exercices Python V46 n'importent que
la stdlib (`sqlite3`, `math`, `re`, `collections`). Aucun correctif de sécurité
n'était requis ; les protections existantes couvrent le nouveau code.

## Vérification

`tests/v46-exercises.test.mjs` exécute RÉELLEMENT les 46 exercices via
`runExercise` : référence 100 % verte, starter cassant ≥1 test public, ≥1 public
+ ≥1 privé. Couplé à `workspace.test.mjs` / `python-runtime.test.mjs` (traversal,
readOnly, timeout), la robustesse du runner est couverte.
