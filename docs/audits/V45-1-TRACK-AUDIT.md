# V45.1 — TRACK & CHAIN AUDIT (CP11)

Audit **lecture seule** des chaînes de compétences. Pour chaque chaîne :
FOUNDATION → UNDERSTANDING → APPLICATION → DIAGNOSIS → TRANSFER → PROFESSIONAL. On indique où la chaîne
CASSE. Base : ledger 128/128 (CERTIFIED) + matrice de couverture V45.

Convention : ✅ solide · ◐ partiel/simulé · ✗ absent.

## Chaînes

### Software foundations (terminal, Linux, Git, JS, algo, DS, TS)
FOUNDATION ✅ · UNDERSTANDING ✅ · APPLICATION ✅ (exos réels) · DIAGNOSIS ✅ (debug exos, D4) ·
TRANSFER ✅ (défis) · PROFESSIONAL ◐ (capstones JS). **La chaîne ne casse pas.** C'est la seule
entièrement solide de bout en bout.

### Web Platform (HTTP, HTML, CSS, DOM, responsive, forms, a11y)
FOUNDATION ✅ · UNDERSTANDING ✅ · APPLICATION ✅ (exos web/DOM) · DIAGNOSIS ◐ (web-debug) ·
TRANSFER ◐ · PROFESSIONAL ◐. **Casse légèrement à DIAGNOSIS/TRANSFER** (peu de diagnostic web). Globalement solide.

### Frontend (React, architecture, states, testing, performance, Next.js)
FOUNDATION ✅ · UNDERSTANDING ✅ · APPLICATION ✅ (react exos) · DIAGNOSIS ✅ (react-debug) ·
TRANSFER ◐ · PROFESSIONAL ◐ (capstone frontend). **Casse à Next.js APPLICATION** (nextjs-* sans pratique
exécutable). Reste solide sur React pur.

### Backend (HTTP/API, Node, Express, auth, SQL, API prod, async, reliability, system design)
FOUNDATION ✅ · UNDERSTANDING ✅ · APPLICATION ✅ (http/sql exos) · DIAGNOSIS ✅ · TRANSFER ✅ (défis) ·
PROFESSIONAL ◐ (capstone backend, archi SIMULÉ). **Casse à system-design APPLICATION** (raisonnement, pas
de construction). Solide jusqu'à l'API de production.

### Data (Python, pandas, data quality, ETL, SQL, statistics)
FOUNDATION ✅ (python exos) · UNDERSTANDING ✅ · APPLICATION ◐ (**Python oui, pandas/ETL non
exécutables**) · DIAGNOSIS ◐ · TRANSFER ◐ · PROFESSIONAL ◐ (capstone data SIMULÉ). **Casse à APPLICATION
pandas/data** : on apprend à raisonner la donnée, on ne la manipule pas en code ici.

### ML (feature engineering, ML basics, evaluation, sklearn, neural nets, transformers)
FOUNDATION ✅ (théorie FORTE) · UNDERSTANDING ✅ · APPLICATION ✗ (**aucune pratique de code ML**) ·
DIAGNOSIS ◐ (assessments/misconceptions) · TRANSFER ◐ (défis) · PROFESSIONAL ◐ (capstone data/ML SIMULÉ).
**Casse nettement à APPLICATION.** Chaîne « comprendre » complète, chaîne « faire » absente.

### Applied AI (LLM, prompting, structured outputs, embeddings, RAG, retrieval, evaluation, agents, security, cost)
FOUNDATION ✅ (théorie FORTE) · UNDERSTANDING ✅ · APPLICATION ✗ (**aucune pratique de code IA**) ·
DIAGNOSIS ◐ · TRANSFER ◐ (défis) · PROFESSIONAL ◐ (capstone RAG SIMULÉ). **Casse à APPLICATION** — c'est
la chaîne la plus investie en TEMPS (42 % de l'année) et la plus incomplète en PRATIQUE. Dette n°1.

### Systems / Cloud / DevOps (Linux, networking, Docker, K8s, CI/CD, cloud, AWS, Azure, IaC, observability, SRE)
FOUNDATION ✅ (Linux/net réels) · UNDERSTANDING ✅ · APPLICATION ◐ (**Linux exos ; Docker/K8s/cloud =
labs SIMULÉS, pas de code**) · DIAGNOSIS ◐ (labs) · TRANSFER ◐ · PROFESSIONAL ◐ (capstone cloud/k8s
SIMULÉ). **Casse à APPLICATION hors Linux.** Raisonnement d'infra fort, geste réel absent (attendu en local).

### Software Engineering (clean code, testing, error handling, patterns, architecture, debt, docs, breaking changes)
FOUNDATION ✅ · UNDERSTANDING ✅ · APPLICATION ◐ (testing/refactoring exos ; patterns/archi non
exécutables) · DIAGNOSIS ✅ (testing, flaky) · TRANSFER ✅ · PROFESSIONAL ◐. **Casse à patterns/archi
APPLICATION.** Bonne chaîne, pratique partielle.

## Synthèse des ruptures
Le point de rupture est TOUJOURS le même : **APPLICATION (pratique de code)** pour tout ce qui n'est pas
JS/TS/algo/DS/HTTP/SQL/Python/Linux. Les maillons FOUNDATION/UNDERSTANDING (leçons) et souvent
DIAGNOSIS/TRANSFER (assessments/défis) tiennent ; le maillon « faire de ses mains » manque.

## Rappel parcours (cf. V45-CURRICULUM-MAP)
8 parcours disponibles, vues sur 1 programme de 365 j. 🟢 fullstack / frontend / backend (chaînes non
cassées). 🟠 systems-cloud / appsec / cloud-devops / data-ml / ai-engineer-foundations (chaîne cassée à
APPLICATION). 🔴 ai-fullstack (annoncé, indisponible).
