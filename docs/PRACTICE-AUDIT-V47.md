# V47 — CP0 : Forensic Practice Audit (lecture seule)

Sprint **Professional Practice II**. Objet : professionnaliser la pratique et
couvrir les domaines encore à zéro. Aucune modification en CP0. Corpus gelé.

## État Git & baseline

- Branche `claude/ai-career-os-saas-phfg49` ; HEAD `bd99f55` ; local == origin ;
  tree propre ; stash vide ; aucun serveur résiduel.
- Corpus gelé : `4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3` (inchangé).
- `data/progress.json` : `323604021055588a9528a86875f36598dbdc7758`.
- `npm test` **1222/1222** ✓ ; `tsc` 0 ; gates 0 ; build 0 ; 308 exercices.

## Matrice de capacités runtime (mesurée)

| Outil | Présent | Exécutable | Version | Sûr local | Utilisé | Reco V47 |
|---|:---:|:---:|---|:---:|:---:|---|
| node | ✅ | ✅ | 22.22.2 | ✅ | ✅ | continuer |
| python3 | ✅ | ✅ | 3.11.15 | ✅ | ✅ | continuer |
| sqlite3 (stdlib) | ✅ | ✅ | 3.45.1 | ✅ | ✅ | continuer |
| npm | ✅ | ✅ | 10.9.7 | ✅ | ✅ | build/test |
| **pip (venv)** | ✅ | ✅ | 24.0 | ⚠️ | ❌ | **opt-in** (numpy install OK, mais non reproductible offline) |
| docker (CLI) | ✅ | ❌ | 29.3.1 | — | ❌ | **daemon ABSENT → EXTERNAL** |
| docker compose | ✅ | ❌ | v5.1.1 | — | ❌ | EXTERNAL |
| kubectl | ❌ | ❌ | — | — | ❌ | EXTERNAL |
| terraform | ❌ | ❌ | — | — | ❌ | EXTERNAL |
| aws / az | ❌ | ❌ | — | — | ❌ | EXTERNAL |

**Constats décisifs** :
- **pip fonctionne** (numpy 2.4.6 installé en venv via le proxy) → tooling
  Data/ML professionnel **techniquement installable**, mais : non commitable
  (binaires ~200 Mo), non reproductible hors-ligne/CI, et le runtime des
  exercices s'exécute sans réseau avec un `python3` système. → **track opt-in**,
  pas un défaut (ADR-047).
- **Docker daemon ABSENT** : on ne peut PAS exécuter de conteneur → Docker reste
  **EXTERNAL_ENVIRONMENT_REQUIRED** (pas de fausse exécution).
- kubectl/terraform/aws/az absents → EXTERNAL.

## Matrice de pratique (20 compétences, données réelles)

| Compétence | Exos | Code exéc. | D4 | D5 | État |
|---|:---:|:---:|:---:|:---:|---|
| algo | 25 | 25 | 5 | 0 | OPERATIONAL |
| ds | 16 | 16 | 1 | 0 | OPERATIONAL |
| jsts | 215 | 215 | 4 | 0 | OPERATIONAL |
| python | 31 | 31 | 9 | 2 | OPERATIONAL |
| gitlinux | 22 | 22 | 1 | 0 | OPERATIONAL |
| http | 14 | 14 | 2 | 2 | OPERATIONAL |
| sql | 13 | 13 | 5 | 2 | OPERATIONAL (réel) |
| se | 6 | 6 | 3 | 1 | OPERATIONAL |
| ml | 7 | 7 | 2 | 1 | OPERATIONAL (stdlib) |
| dl | 5 | 5 | 1 | 0 | OPERATIONAL (stdlib) |
| rag | 7 | 7 | 2 | 1 | OPERATIONAL |
| agents | 12 | 12 | 2 | 1 | OPERATIONAL |
| secu | 5 | 5 | 2 | 0 | OPERATIONAL |
| **archi** | 0 | 0 | 0 | 0 | **NO_PRACTICE** |
| **patterns** | 0 | 0 | 0 | 0 | **NO_PRACTICE** |
| **llm** | 0 | 0 | 0 | 0 | **NO_PRACTICE** |
| **evalia** | 0 | 0 | 0 | 0 | **NO_PRACTICE** |
| **cloud** | 0 | 0 | 0 | 0 | **EXTERNAL_ONLY** |
| comm | 0 | 0 | 0 | 0 | NON-CODE (capstones/missions) |
| autonomy | 0 | 0 | 0 | 0 | NON-CODE (capstones/missions) |

**13/20 opérationnelles**. Cibles V47 exécutables : **archi, patterns, llm,
evalia** (de 0 → réel). cloud → labs EXTERNAL durcis. comm/autonomy hors
pratique-code par nature.

## Revue des 46 exercices V46 (professionnalisme)

- **Forces** : exécution réelle, déterminisme, diagnostic (leakage, overfit,
  detect-loop, diagnose-fault), décisions (metric-selection, secret-placement),
  SQL réel.
- **Limites** (à professionnaliser, Axe E) : entrées souvent « parfaites »
  (peu de données bruitées), un seul niveau d'appel (peu de multi-étapes),
  peu d'artefacts produits. Bons comme PREMIÈRE boucle ; à durcir pour se
  rapprocher d'un contexte pro (données sales, contraintes concurrentes).

## Incident V46 à corriger structurellement

Collision d'ids (4 exercices avaient écrasé des existants). **V47 doit ajouter
une protection dure : duplicate id ⇒ HARD FAIL avant écriture** (exercices,
lessons, assessments, missions, playbooks, capstones, transfer-challenges).

## Plan ajusté (aucune réduction d'ambition)

- CP1 ADR-047 (tooling Python opt-in ; infra local/external ; eval harness ;
  collision protection).
- CP2 duplicate-ID hard-fail + gate `v47:check` + capability read-model.
- CP3 track venv Data/ML opt-in (`python-ds`) + preuve d'exécution réelle
  numpy/pandas/sklearn ; portable track stdlib conservé.
- CP4 Data eng (durci) · CP5 ML workflow · CP6 AI/LLM eval harness (evalia+llm) ·
  CP7 archi/patterns (réel TS/Node) · CP8 Docker EXTERNAL (daemon absent) ·
  CP9 cloud/k8s external labs durcis.
- CP10 profondeur D4/D5 · CP11 feedback · CP12 scénarios · CP13 intégration ·
  CP14 readiness · CP15 hardening + docs + prompt V48.

**Réallocation** : Docker non exécutable localement (économie sur CP8 exécutable)
→ effort réalloué à archi/patterns/evalia/llm (domaines à zéro, fort levier).

Poursuite automatique.
