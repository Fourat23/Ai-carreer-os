# V45 — PRACTICE AUDIT (domaines, acquisition, exercices, labs)

Audit **lecture seule**. Données : `docs/audits/v45-audit-data.json` + read-models existants.
Principe anti-gonflage : quantité d'exercices ≠ qualité de pratique.

## CP4 — Matrice de couverture des connaissances (par compétence de programme)

Échelle : ABSENT · INTRODUCED (leçon seule) · FOUNDATIONAL (leçon + diagnostic/assessment) ·
OPERATIONAL (+ pratique de code EXÉCUTABLE) · PROFESSIONAL (+ capstone/mission/lab ; SIMULÉ si labs).

| Compétence | Théorie | Pratique code | Diagnostic | Transfert | Pro | **Niveau réel** |
|---|---|---|---|---|---|---|
| jsts | ✓ | ✓ (215) | ✓ | ✓ | ✓ | **OPERATIONAL→PRO** |
| algo | ✓ | ✓ (25) | ✓ | ✓ | ✓ | **OPERATIONAL** |
| ds | ✓ | ✓ (16) | ✓ | ✓ | ✓ | **OPERATIONAL** |
| http | ✓ | ✓ (14) | ✓ | ✓ | ✓ | **OPERATIONAL→PRO** |
| gitlinux | ✓ | ✓ (22) | ✓ | partiel | ✓ | **OPERATIONAL** |
| se | ✓ | ✓ (6) | ✓ | ✓ | ✓ | **OPERATIONAL** |
| sql | ✓ | ✓ (5) | ✓ | ✓ | ✓ | **OPERATIONAL** (mince) |
| python | ✓ | ✓ (15) | ✗ | ✓ | ✓ | **OPERATIONAL** (diagnostic manquant) |
| cloud | ✓ | ✗ (labs) | ✓ | ✓ | SIMULÉ | **FOUNDATIONAL + PRO SIMULÉ** |
| secu | ✓ | ✗ (labs) | ✓ | ✓ | SIMULÉ | **FOUNDATIONAL + PRO SIMULÉ** |
| archi | ✓ | ✗ | ✓ | ✓ | SIMULÉ | **FOUNDATIONAL** |
| ml | ✓ | ✗ | ✓ | ✓ | SIMULÉ | **FOUNDATIONAL** (pas de code) |
| rag | ✓ | ✗ | ✓ | ✓ | SIMULÉ | **FOUNDATIONAL** (pas de code) |
| evalia | ✓ | ✗ | ✓ | ✓ | SIMULÉ | **FOUNDATIONAL** |
| llm | ✓ | ✗ | ✓ | partiel | SIMULÉ | **FOUNDATIONAL** |
| agents | ✓ | ✗ | partiel | ✓ | ✗ | **INTRODUCED→FOUNDATIONAL** |
| patterns | ✓ | ✗ | ✓ | partiel | ✗ | **INTRODUCED** |
| dl | ✓ | ✗ | ✗ | ✗ | ✗ | **INTRODUCED** (théorie seule) |
| comm | ✓ | ✗ | ✓ | ✗ | ✓ | **FOUNDATIONAL** (narratif) |
| autonomy | ✗* | ✗ | ✗ | ✗ | ✗ | **méta-compétence, non enseignée comme skill** |

\* `autonomy` n'a pas de leçon dédiée ; c'est une compétence transverse (23 jours du programme s'y
rattachent via projets). À traiter comme méta-compétence, pas comme trou.

**Constat CP4** : 8 compétences atteignent OPERATIONAL (pratique de code réelle), 8 restent
FOUNDATIONAL avec professionnalisation SIMULÉE (cloud/secu/archi/ml/rag/evalia/llm/comm), 3 restent
INTRODUCED (patterns/dl/agents partiel). **La théorie couvre 20/20 ; la pratique EXÉCUTABLE couvre
8/20.**

## CP7 — Matrice d'acquisition (THEORY→…→PROFESSIONAL)

Échelle par étape : 0 absent · 1 symbolique · 2 faible · 3 utilisable · 4 forte.

| Compétence | Théorie | Guidée | Autonome | Diagnostic | Variation | Transfert | Scénario pro |
|---|---|---|---|---|---|---|---|
| jsts | 4 | 4 | 4 | 4 | 4 | 4 | 3 |
| algo | 4 | 4 | 4 | 3 | 3 | 4 | 2 |
| ds | 4 | 4 | 4 | 3 | 3 | 4 | 2 |
| http | 4 | 4 | 4 | 4 | 3 | 4 | 3 |
| gitlinux | 4 | 3 | 3 | 3 | 2 | 2 | 2 |
| se | 4 | 3 | 4 | 4 | 3 | 4 | 3 |
| sql | 4 | 3 | 3 | 3 | 2 | 4 | 2 |
| python | 4 | 3 | 3 | **1** | 3 | 4 | 2 |
| cloud/secu/archi | 4 | 2 (labs) | 2 (labs) | 3 | 3 | 4 | 3 (SIMULÉ) |
| ml/rag/evalia/llm | 4 | **0** | **0** | 3 | 3 | 3 | 2 (SIMULÉ) |
| dl/agents/patterns | 3-4 | **0-1** | **0** | 0-3 | 0-3 | 0-4 | 0-1 |

**Constat CP7** : le maillon systématiquement faible est **guidée + autonome** (pratique de code) hors
JS/TS. La théorie, le diagnostic (via assessments/misconceptions) et le transfert (via défis) sont
souvent forts, mais **sans passage par les mains** pour la moitié des compétences. C'est le pattern
« on lit et on raisonne, mais on ne fait pas ».

## CP8 — Évaluation des exercices & assessments

### Ce que mesurent réellement les 262 exercices (heuristique difficulté→Bloom, INSPECTÉ)
| Mesure | Nombre | % |
|---|---|---|
| RECALL | 21 | 8 % |
| UNDERSTANDING | 137 | 52 % |
| APPLICATION | 75 | 29 % |
| DEBUGGING | 10 | 4 % |
| DIAGNOSIS | 15 | 6 % |
| PROFESSIONAL_JUDGEMENT | 4 | 1,5 % |

→ **60 % rappel/compréhension, 11,5 % haut niveau cognitif.** Les nouveaux D4/D5 de V44 ont amorcé le
haut de la pyramide, mais la masse reste en compréhension.

### Problèmes structurels détectés
- **24 exercices de code sans test privé** (contrat non tenu) : array-sum-even, async-sum,
  async-user-lookup, fizzbuzz, greeting, k8s-* (4), py-* (5), sec-* (5), ts-async-double, ts-fizzbuzz,
  ts-greeter, validate-user, word-frequencies. Réponse reconnaissable / test permissif possible.
- **Starters parfois très proches de la solution** sur les d1-d2 (échantillon) : le bug injecté est
  parfois trivialement visible → mesure surtout la lecture, pas la conception.
- **Assessments (16, 83 questions)** : bien typés (RECALL→TRANSFER, Bloom), mais volume modeste vs
  365 jours. `python` n'a AUCUN assessment diagnostic (dimension Dg=none).
- **Capstones (5)** : un par domaine majeur (backend, frontend, cloud/k8s, applied-AI/RAG, data/ML) ;
  déterministes (notés via gradeQuestion) — réalistes en raisonnement mais SIMULÉS (pas d'exécution).
- **Défis de transfert (18)** : cross-domain réels, anti-substitution vérifiée (V44).

### Échantillonnage qualitatif (stratifié, honnête)
Lus en profondeur : ds-lru-cache, http-resilient-consumer, sql-window-running-total, se-release-decision
(D4/D5 V44 — genuinely diagnostic/pro) ; fizzbuzz, greeting, a11y-accessible-name (d1-d2 — corrects
mais faible charge cognitive) ; cloud-iam-wildcard, sec-least-privilege (SIMULÉ, décision, corrects).
**Pas de prétention** d'avoir lu qualitativement les 262 ; l'échantillon confirme la distribution.

## CP9 — Labs / missions / playbooks / professionnalisation

- **Labs (6 familles : kubernetes, cloud-topology, cloud-architecture, security, pipeline, terminal)** :
  moteurs de SIMULATION spécialisés (manifest*, security*, topology*, pipeline*, terminal*). Objectif :
  entraîner le RAISONNEMENT d'infra/sécurité sans infra réelle. Guidage + diagnostic présents. Limite
  honnête : ce sont des modèles, pas des systèmes réels (aucun kubectl/docker réel). **BON en tant que
  SIMULATION ; à ne jamais présenter comme expérience réelle.**
- **Missions (42)** : orientées testing (17), debugging (24), http (9), linux (8) — surtout JS/TS/ops.
  Concentrées sur les mêmes domaines que les exercices ; peu pour data/ML/IA.
- **Playbooks (45)** : structure professionnelle riche (situation, symptoms, firstChecks, containment,
  recommendedOrder, communication, evidence, doNot, mitigation, correction, validation, prevention,
  exitCriteria). **FORT** comme référentiel de raisonnement d'incident — mais ce sont des LECTURES, pas
  des exercices notés.

**Réponse à la question centrale du CP9** : la plateforme enseigne des concepts ET entraîne le
raisonnement professionnel (playbooks, labs, capstones, défis) de façon SIMULÉE. Elle entraîne la
PRATIQUE DE CODE réelle surtout en JS/TS + un peu algo/ds/http/sql/python/git. Pour data/ML/IA/cloud/
sécurité, elle développe la compréhension et le jugement, pas le geste technique exécuté.

## Verdict pratique global
- Pratique de code JS/TS et fondations algo/ds/http : **FORT**.
- Pratique diagnostique/pro (D4/D5) : **CORRECT** (amorcée V44, encore minoritaire — 11 %).
- Pratique de code data/ML/IA/cloud/sécurité : **INSUFFISANT** (absente, compensée par SIMULATION).
- Système d'évaluation (assessments/capstones/transferts) : **BON**, mais volume modeste et déterministe.
