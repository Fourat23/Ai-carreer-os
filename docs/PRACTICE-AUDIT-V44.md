# PRACTICE-AUDIT-V44 — Audit qualitatif de la pratique (Practice Mastery II)

Sprint V44. Priorité : **pédagogie > maîtrise réelle > pratique > transfert > cohérence**.
Document d'audit HONNÊTE : ce qui est vérifié par exécution, ce qui reste un proxy structurel,
ce qui est corrigé, ce qui ne l'est pas encore. Aucun greenwashing.

## 0. Méthode

- **FLOOR A (structurel, 100 %)** : `scripts/v44-ledger.mjs` audite les 262 exercices et écrit
  `docs/practice-ledger-v44.json` (runtime, difficulté, compétences projetées, tests public/privé,
  type de pratique, diagnostic/transfert, misconception liée, preuve générable, position ladder,
  duplication potentielle, anomalies dures + signaux à revoir).
- **FLOOR B (qualitatif, ce document)** : revue cognitive de **≥ 60 exercices** — la TOTALITÉ des 21
  exercices D4/D5 (qui portent le poids pédagogique), plus un échantillon représentatif de ≥ 45
  D2/D3 couvrant TOUS les domaines. Le verdict porte sur la *fonction cognitive*, pas sur le volume.
- **Exécution réelle** : les 24 exercices créés au CP7 sont vérifiés par le vrai harnais
  (`runExercise`) : référence 100 % verte, starter fautif ≥ 1 test public, ≥ 1 public + ≥ 1 privé,
  sorties entières/chaînes, anti-fuite (`tests/v44-new-exercises.test.mjs`).

## 1. Corpus (ledger V44)

| Métrique | V43 (avant) | V44 (après) |
|---|---|---|
| Exercices exécutables | 238 | **262** |
| Distribution difficulté | d1=21 d2=142 d3=69 d4=6 **d5=0** | d1=21 d2=142 d3=78 **d4=17 d5=4** |
| Exercices reliés à une misconception | 9 | **49** |
| Défis de transfert | 9 | **17** |
| Preuve générable (référence + tests) | 238/238 | **262/262** |
| Anomalies dures | (non mesuré) | 24 (test privé manquant) |

**Pathologie CP0 corrigée** : la pyramide de difficulté n'est plus plate. d5 passe de 0 à 4 ; d4 de 6
à 17 ; les avertissements « pyramide plate » du gate (ds, http, gitlinux) ont disparu.

## 2. Définitions de difficulté appliquées (cognitives, cf. ADR-044)

- **D3** stratégie / plusieurs étapes : l'apprenant choisit l'approche.
- **D4** diagnostic / contraintes concurrentes / information partielle.
- **D5** décision professionnelle : plusieurs signaux en tension, ordre de priorité, trade-offs.

La difficulté est cognitive, **jamais** « plus de lignes / plus gros JSON / énoncé plus long ».

## 3. Audit détaillé — les 21 exercices D4/D5 (100 %)

Verdict = la difficulté annoncée correspond-elle à la nature cognitive réelle ?

### D5 (décision pro, contraintes concurrentes) — 4/4 CONFORMES
| Exercice | Nature D5 vérifiée | Verdict |
|---|---|---|
| `http-resilient-consumer` | combine 3 mécanismes (idempotence + budget de retry + DLQ) ; borne exacte du budget testée | ✅ D5 réel |
| `se-release-decision` | 4 signaux en tension (Sev1 / canari / couverture / flaky) avec ordre de priorité | ✅ D5 réel |
| `sql-index-advice` | trade-off lecture/écriture + sélectivité + type de requête, 4 issues plausibles | ✅ D5 réel |
| `http-cache-policy` | personnalisation vs mutabilité vs revalidation, précédence non triviale | ✅ D5 réel |

### D4 (diagnostic / contraintes) — 17/17 CONFORMES
| Exercice | Nature D4 vérifiée | Verdict |
|---|---|---|
| `ds-lru-cache` | éviction + rafraîchissement de récence (get ET update) | ✅ |
| `sql-window-running-total` | partition + tri par seq + retour dans l'ordre d'entrée | ✅ |
| `sql-dedup-latest` | garder la version MAX (pas la dernière lue) | ✅ |
| `http-idempotency-dedup` | dédup par clé + cas « sans clé » (jamais idempotent) | ✅ |
| `http-etag-revalidation` | 200/304 selon If-None-Match, joker `*`, absence | ✅ |
| `sh-pipeline-exit-diagnose` | code de sortie selon `pipefail` + premier échec | ✅ |
| `se-flaky-vs-real` | discriminer instable / régression nette / sain | ✅ |
| `py-sliding-window-max` | gestion des bords (w=0, w>len) | ✅ |
| `py-retry-idempotent` | dédup par id + id `None` toujours appliqué | ✅ |
| `algo-coin-change-min` | l'avidité échoue → programmation dynamique | ✅ |
| `algo-kadane-max-subarray` | piège de l'init à 0 (cas tout-négatif) | ✅ |
| `cicd-critical-path` (existant) | chemin critique d'un DAG | ✅ |
| `debug-cart` (existant) | débogage multi-compétence | ✅ |
| `py-debug-average` (existant) | débogage + cas limites | ✅ |
| `sh-pipeline-run` (existant) | modèle de pipeline déterministe | ✅ |
| `system-design-diagnose` (existant) | diagnostic d'architecture (T4) | ✅ |
| `ts-interface-cart` (existant) | modélisation typée + contraintes | ✅ (limite D3/D4, conservé) |

**Conclusion §3** : les 21 D4/D5 sont cognitivement conformes. `ts-interface-cart` est à la frontière
D3/D4 mais conservé (durcir pour du diff serait un anti-pattern, cf. ADR-044 D6).

## 4. Audit par grappes — échantillon D2/D3 (≥ 45, tous domaines)

Verdict de grappe (fonction pédagogique + honnêteté RÉEL/SIMULÉ), avec notes individuelles.

- **Cloud (31, ex. cloud-iam-wildcard, cloud-multi-az, cloud-spof-detect, cloud-rpo-meets,
  cloud-scaling-choice)** — décisions d'architecture SIMULÉES honnêtement (aucune infra réelle).
  Bien reliées aux misconceptions (moindre privilège, réplicas≠HA, scaling, sauvegarde≠reprise).
  ✅ Utiles ; SIMULATION étiquetée.
- **Kubernetes (16, ex. k8s-needs-probe, k8s-image-pinned, k8s-replicas-ha, k8s-oom-risk)** —
  raisonnement sur manifestes ; complémentés par le lab K8s. ✅ ; SIMULÉ.
- **Sécurité (16, ex. sec-least-privilege, sec-rbac-wildcard, sec-image-digest,
  prompt-injection-classify)** — reliés aux misconceptions wildcard / épinglage / injection.
  ✅ ; SIMULÉ. *Limite* : aucune pratique de CODE `secu` (voir §5, ladder creuse).
- **CI/CD & conteneurs (26, ex. cicd-topo-order, cicd-detect-cycle, docker-image-size)** —
  `cicd-detect-cycle` et `cicd-topo-order` sont de vrais exercices de graphe. ✅ RÉEL (calcul).
- **ML / données (9, ex. ml-overfit-diagnose, ml-data-leakage, ml-metric-choice, nn-forward-neuron)**
  — diagnostics conceptuels solides, reliés aux misconceptions (overfit, fuite, accuracy).
  ✅ ; SIMULÉ (aucun entraînement réel). *Limite* : pas de pratique de code `ml`.
- **RAG (5) / Agents (6, ex. agent-loop-detect, agent-hitl-decision, rag-structured-validate)** —
  reliés aux misconceptions (boucle non bornée, injection). ✅ ; SIMULÉ.
- **React (16, ex. react-debug-list, react-lift-state, react-conditional)** — `react-debug-*`
  alimentent l'échelon L4 (diagnostic) de jsts et la misconception useEffect. ✅ RÉEL (rendu serveur).
- **Web / DOM / a11y (13, ex. a11y-accessible-name, dom-event-delegation, web-debug-selector)** —
  ✅ RÉEL (modèle DOM).
- **HTTP / API (6, ex. auth-status-decision, api-pagination-choice, http-method-idempotent)** —
  reliés aux misconceptions 401/403, pagination. ✅ RÉEL.
- **Algo / DS (algo-two-sum, algo-binary-search, ds-stack, ds-min-stack, ds-two-stack-queue,
  algo-interval-merge)** — ✅ RÉEL, ladder complète.
- **Python (py-word-count, py-topk-frequent, py-safe-divide, py-report, py-slugify)** — ✅ RÉEL.
- **TypeScript (ts-generic-first, ts-pluck, ts-debug-*, ts-union-area)** — ✅ RÉEL (compilé).
- **Git / Shell / Système (git-commit-grouping, git-conflicting-files, sh-exit-retry,
  sys-perms-to-octal, sys-process-top-cpu)** — ✅ RÉEL (calcul déterministe).
- **SQL / data-wrangling (sql-inner-join, sql-left-join-nulls, sql-group-having, table-groupby,
  etl-pipeline-order, latency-percentiles)** — ✅ RÉEL (jointures/agrégations en mémoire).

**Total audité §3 + §4 : 21 + ≥ 45 = ≥ 66 exercices**, tous domaines et tous les D4/D5 couverts (FLOOR B tenu).

## 5. Ladders de pratique (read-model dérivé `lib/practice-ladder.mjs`)

Sur les 21 compétences de programme, **6 ont une ladder complète** L0→L3 + (L4 ou L5) :
`algo, ds, jsts, http, gitlinux` complètes ; `python` complète jusqu'à L4 (L5 manquant).

**Constat honnête — « ladders creuses »** : `sql, se, secu, cloud, archi, ml, rag, llm, agents, evalia,
comm` ont L0 (leçon) + L4/L5 (assessment / capstone / défi de transfert) MAIS **peu ou pas de pratique
de code L1–L3**. Pour `sql` et `se`, le CP7 a AJOUTÉ cette pratique de code (sql-left-join-nulls,
sql-group-having, sql-window-running-total, sql-index-advice, sql-dedup-latest ; se-flaky-vs-real,
se-semver-bump, se-release-decision).

**Limite assumée** : `secu, cloud, archi, ml, rag, agents…` ne peuvent PAS recevoir d'exercices de code
tagués directement sans étendre la taxonomie de compétences (`isKnownSkill` rejette `secu/cloud/archi`
comme ids fins). Ces domaines restent couverts par des exercices *thématiques* projetés vers `jsts`,
des **labs**, des **assessments**, des **capstones** et des **défis de transfert** — honnêtement
étiquetés SIMULATION. Étendre la taxonomie serait une décision de conception à part entière (hors
périmètre V44) ; c'est la dette pédagogique n°1 identifiée pour V45.

## 6. Anomalies structurelles & plan

- **24 exercices de code sans test privé** (`no-private-test`, ex. fizzbuzz, greeting, ts-greeter,
  py-*, k8s-*, sec-*). Ce sont majoritairement des exercices anciens/introductifs. Ils restent
  exécutables et corrects, mais le contrat « ≥ 1 public + ≥ 1 privé » n'est pas tenu.
  **Décision V44** : documenté ici, NON corrigé en masse ce sprint (réécrire 24 fixtures anciennes =
  risque > bénéfice immédiat ; aucun n'est D4/D5). Ajouter un test privé à chacun est planifié pour V45.
- **5 exercices à `call-equals` flottant** (debt-legacy-refactor, py-exceptions, py-safe-divide,
  slo-burn-rate, ts-union-area) : vérifiés DÉTERMINISTES (valeurs exactement représentables — 0.25,
  0.5, 0.75, π — ou arrondies par la référence). Non bloquant ; interdit pour tout NOUVEL exercice.

## 7. Réel / Simulé / Proxy (honnêteté)

- **RÉEL** : 262 exercices exécutés par le harnais ; 17 défis de transfert notés déterministes ;
  read-models (coverage, ladder) et gate testés.
- **PROXY** : ladder et readiness = indices STRUCTURELS (une activité de ce type existe), pas des
  preuves de maîtrise professionnelle.
- **SIMULÉ** : contextes cloud / k8s / ML / RAG / agents — aucune infra, aucun LLM, aucun entraînement.

## 8. Anti-scope-collapse — réallocation documentée

Aucun floor n'a été supprimé. Là où un floor était déjà atteint en COMPTE, l'effort a été réalloué
vers la SUBSTANCE :

- **FLOOR E** : le corpus contenait déjà ≥ 24 exercices D3+. **SUPPRESSION** : aucune.
  **EFFORT RÉALLOUÉ À** : créer de vrais D4 (diagnostic) et D5 (décision pro), corrigeant d5=0 et les
  pyramides plates — pas gonfler un compteur déjà vert.
- **FLOOR C** : le read-model examine les 21 compétences (≥ 10) ; les « ladders creuses » sont
  exposées au lieu d'être masquées.
- Toute limite (taxonomie secu/cloud/archi, 24 tests privés manquants) est **déclarée**, pas contournée.

## 9. Hardening académique des leçons (FLOOR G — CP9/CP10)

**Audit ≥ 24 leçons, Data/ML inclus.** Constat MÉTHODIQUE : les 128 leçons portent toutes le
marqueur `<!-- keep -->` ET une section d'ouverture « 🌍 Le problème d'abord » (intuition/analogie
AVANT le jargon). La cluster Data/ML auditée en profondeur (machine-learning-basics, statistics-for-ml,
feature-engineering, model-evaluation, embeddings, neural-networks, transformers) est exemplaire :
chacune ouvre sur un problème concret (spam, salaire moyen trompeur, résiliation, fraude à 99 %,
recherche par sens, boutons à régler, souris ambiguë) avant tout terme technique. Fondations et
SE/archi auditées (algorithmic-thinking, data-structures-intro, recursion, http-rest-json,
api-production-contracts, async-messaging-queues, breaking-changes-compatibility, caching-performance,
sql-foundations, sql-performance-indexing, testing-foundations, git-fundamentals,
terminal-shell-filesystem, python-foundations) : même standard.

**Verdict prose : KEEP.** Réécrire une prose déjà intuition-first pour produire du diff est
explicitement interdit (ADR-044 D6). **Aucune réécriture cosmétique n'a été faite.**

**Correction RÉELLE et justifiée (anti-scope-collapse — réallocation)** : la dette pédagogique
concrète au niveau leçon n'était PAS la prose mais le CÂBLAGE concept → pratique délibérée. Les
24 nouveaux exercices D3/D4/D5 (CP7) étaient orphelins de leur leçon-concept. **13 leçons** ont reçu
des `practiceRefs` vers ces exercices, dont `caching-performance` qui n'avait AUCUNE pratique reliée
(vrai trou comblé : ds-lru-cache, http-cache-policy, http-etag-revalidation). Chaque `practiceRef`
résout vers un exercice réel (vérifié par `tests/v27-e2e`). C'est la « boucle cible » de HSD-044 §3
rendue navigable : concept → guidé → application → autonomie → diagnostic → transfert.

Leçons câblées : terminal-shell-filesystem, git-fundamentals, algorithmic-thinking,
data-structures-intro, http-rest-json, caching-performance, api-production-contracts, sql-foundations,
sql-performance-indexing, testing-foundations, async-messaging-queues, breaking-changes-compatibility,
python-foundations.

**Limite déclarée** : `secu/cloud/archi/ml/rag/agents` n'ont pas reçu de nouveaux exercices de code
(taxonomie, cf. §5) ; leurs leçons restent reliées à labs/assessments/capstones/défis de transfert.

## 10. Verdict

La pratique gagne en PROFONDEUR réelle (D4/D5 exécutables), en FEEDBACK (49 exercices reliés à des
misconceptions), en TRANSFERT (17 défis cross-domain) et en LISIBILITÉ (ladders explicites). Les
limites — ladders creuses des domaines simulés, taxonomie de compétences, tests privés anciens —
sont documentées sans euphémisme et priorisées pour V45.
