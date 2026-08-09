// Carte des leçons approfondies (curriculum/lessons/) et sections par défaut.
// - LESSON_BY_SKILL : leçon de référence par compétence (lien affiché dans « Cours approfondi »).
// - FUTURE_BY_SKILL : section « Pourquoi ça comptera plus tard » par défaut,
//   utilisée quand un jour n'a pas de section spécifique.

// Chaque leçon : file, title, cat (catégorie d'affichage), level (1=débutant,
// 2=intermédiaire, 3=avancé), min (durée de lecture+exercices estimée, minutes),
// skills (compétences associées). L'ordre DANS une catégorie = ordre recommandé.
export const LESSONS = [
  // ── Fondations ──
  { file: 'terminal-shell-filesystem.md', title: 'Terminal, shell et système de fichiers', cat: 'Fondations', level: 1, min: 40, skills: ['gitlinux'], practiceRefs: [{ kind: 'lab', id: 'terminal' }] },
  { file: 'git-fundamentals.md', title: 'Git : les fondamentaux', cat: 'Fondations', level: 1, min: 45, skills: ['gitlinux'], practiceRefs: [{ kind: 'exercise', id: 'git-commit-grouping' }] },
  { file: 'javascript-basics.md', title: 'JavaScript : les bases solides', cat: 'Fondations', level: 1, min: 50, skills: ['jsts'], practiceRefs: [{ kind: 'exercise', id: 'js-array-objects' }, { kind: 'exercise', id: 'js-conditions' }, { kind: 'exercise', id: 'js-loops' }, { kind: 'exercise', id: 'js-even-squares' }] },
  { file: 'algorithmic-thinking.md', title: 'La pensée algorithmique', cat: 'Fondations', level: 1, min: 50, skills: ['algo'], practiceRefs: [{ kind: 'exercise', id: 'algo-two-sum' }, { kind: 'exercise', id: 'fizzbuzz' }, { kind: 'exercise', id: 'algo-binary-search' }] },
  { file: 'recursion.md', title: 'La récursion en profondeur', cat: 'Fondations', level: 2, min: 45, skills: ['algo'] },
  { file: 'data-structures-intro.md', title: 'Structures de données : choisir son outil', cat: 'Fondations', level: 2, min: 50, skills: ['ds'], practiceRefs: [{ kind: 'exercise', id: 'ds-stack' }, { kind: 'exercise', id: 'algo-two-sum' }, { kind: 'exercise', id: 'perf-pair-count' }] },
  { file: 'typescript-basics.md', title: 'TypeScript : typer pour fiabiliser', cat: 'Fondations', level: 2, min: 45, skills: ['jsts'], practiceRefs: [{ kind: 'exercise', id: 'ts-greeter' }, { kind: 'exercise', id: 'ts-interface-cart' }, { kind: 'exercise', id: 'ts-generic-first' }, { kind: 'exercise', id: 'ts-debug-positives' }] },
  { file: 'async-javascript.md', title: 'JavaScript asynchrone', cat: 'Fondations', level: 2, min: 45, skills: ['jsts'], practiceRefs: [{ kind: 'exercise', id: 'async-sum' }, { kind: 'exercise', id: 'async-user-lookup' }, { kind: 'exercise', id: 'ts-async-fetch-user' }] },
  { file: 'git-advanced.md', title: 'Git avancé : rebase et historique propre', cat: 'Fondations', level: 3, min: 40, skills: ['gitlinux'] },
  // ── Web & backend ──
  { file: 'http-rest-json.md', title: 'HTTP, REST et JSON', cat: 'Web & backend', level: 1, min: 45, skills: ['http'], practiceRefs: [{ kind: 'exercise', id: 'http-status' }, { kind: 'exercise', id: 'api-router' }] },
  { file: 'api-design-basics.md', title: 'Concevoir une API', cat: 'Web & backend', level: 2, min: 45, skills: ['http'], practiceRefs: [{ kind: 'exercise', id: 'api-router' }, { kind: 'exercise', id: 'http-status' }, { kind: 'exercise', id: 'http-method-idempotent' }] },
  { file: 'express-backend.md', title: 'Backend Express : structure et robustesse', cat: 'Web & backend', level: 2, min: 50, skills: ['http', 'se'], practiceRefs: [{ kind: 'exercise', id: 'api-router' }, { kind: 'exercise', id: 'validate-user' }, { kind: 'exercise', id: 'http-status' }] },
  { file: 'authentication.md', title: 'Authentification et autorisation', cat: 'Web & backend', level: 2, min: 45, skills: ['secu', 'http'], practiceRefs: [{ kind: 'exercise', id: 'auth-status-decision' }, { kind: 'exercise', id: 'validate-user' }] },
  { file: 'caching-performance.md', title: 'Cache et performance', cat: 'Web & backend', level: 3, min: 45, skills: ['archi', 'se'] },

  // ── Frontend & React ──
  { file: 'browser-dom-rendering.md', title: 'Le navigateur, le DOM et le rendu', cat: 'Frontend & React', level: 1, min: 45, skills: ['jsts'], practiceRefs: [{ kind: 'exercise', id: 'web-semantic' }, { kind: 'exercise', id: 'web-counter' }, { kind: 'exercise', id: 'web-debug-selector' }, { kind: 'exercise', id: 'web-inline-style' }] },
  { file: 'react-fundamentals.md', title: 'React : les fondamentaux', cat: 'Frontend & React', level: 2, min: 50, skills: ['jsts'], practiceRefs: [{ kind: 'exercise', id: 'react-hello' }, { kind: 'exercise', id: 'react-greeting' }, { kind: 'exercise', id: 'react-conditional' }, { kind: 'exercise', id: 'react-counter' }, { kind: 'exercise', id: 'react-list' }, { kind: 'exercise', id: 'react-lift-state' }] },
  { file: 'react-hooks-effects.md', title: 'React : effets, données async et hooks', cat: 'Frontend & React', level: 2, min: 50, skills: ['jsts'], practiceRefs: [{ kind: 'exercise', id: 'react-toggle' }, { kind: 'exercise', id: 'react-form-name' }, { kind: 'exercise', id: 'react-search' }, { kind: 'exercise', id: 'react-parent-child' }] },
  { file: 'react-composition-architecture.md', title: 'React : composition, architecture d\'état et hooks personnalisés', cat: 'Frontend & React', level: 3, min: 55, skills: ['jsts', 'archi'], practiceRefs: [{ kind: 'exercise', id: 'react-profile' }, { kind: 'exercise', id: 'react-parent-child' }, { kind: 'exercise', id: 'react-search' }, { kind: 'playbook', id: 'frontend-regression' }] },
  { file: 'react-accessibility.md', title: 'Accessibilité des interfaces web', cat: 'Frontend & React', level: 2, min: 45, skills: ['jsts'], practiceRefs: [{ kind: 'exercise', id: 'web-semantic' }, { kind: 'exercise', id: 'web-card' }, { kind: 'exercise', id: 'react-avatar' }, { kind: 'exercise', id: 'react-debug-list' }] },
  // ── Data & SQL ──
  { file: 'sql-foundations.md', title: 'SQL : les fondations', cat: 'Data & SQL', level: 1, min: 50, skills: ['sql'], practiceRefs: [{ kind: 'exercise', id: 'sql-inner-join' }, { kind: 'exercise', id: 'sys-log-level-counts' }, { kind: 'exercise', id: 'fix-nplus1' }] },
  { file: 'database-modeling.md', title: 'Modélisation, index et transactions', cat: 'Data & SQL', level: 2, min: 50, skills: ['sql'], practiceRefs: [{ kind: 'exercise', id: 'sys-log-level-counts' }, { kind: 'exercise', id: 'fix-nplus1' }] },
  { file: 'sql-performance-indexing.md', title: 'Performance SQL : index, plans et N+1', cat: 'Data & SQL', level: 3, min: 50, skills: ['sql', 'archi'], practiceRefs: [{ kind: 'exercise', id: 'fix-nplus1' }, { kind: 'exercise', id: 'perf-pair-count' }, { kind: 'playbook', id: 'slow-sql-query' }] },
  { file: 'database-transactions-concurrency.md', title: 'Transactions, ACID et concurrence', cat: 'Data & SQL', level: 3, min: 50, skills: ['sql', 'se'], practiceRefs: [{ kind: 'exercise', id: 'db-concurrency-risk' }, { kind: 'playbook', id: 'intermittent-incident' }] },
  { file: 'database-migrations.md', title: 'Migrations de schéma et compatibilité', cat: 'Data & SQL', level: 3, min: 50, skills: ['sql', 'se'], practiceRefs: [{ kind: 'exercise', id: 'migration-compat' }] },
  { file: 'pandas-data-wrangling.md', title: 'pandas : manipuler des données', cat: 'Data & SQL', level: 2, min: 45, skills: ['python', 'sql'], practiceRefs: [{ kind: 'exercise', id: 'table-groupby' }, { kind: 'exercise', id: 'data-quality-detect' }] },
  { file: 'data-cleaning-quality.md', title: 'Nettoyage et qualité des données', cat: 'Data & SQL', level: 2, min: 45, skills: ['python', 'sql'], practiceRefs: [{ kind: 'exercise', id: 'data-quality-detect' }, { kind: 'exercise', id: 'data-missing-strategy' }] },
  { file: 'etl-pipelines.md', title: 'Pipelines ETL', cat: 'Data & SQL', level: 2, min: 45, skills: ['python', 'sql'], practiceRefs: [{ kind: 'exercise', id: 'etl-pipeline-order' }] },
  // ── Software engineering & architecture ──
  { file: 'clean-code.md', title: 'Clean code', cat: 'Software engineering & architecture', level: 1, min: 45, skills: ['se'], practiceRefs: [{ kind: 'exercise', id: 'refactor-legacy' }, { kind: 'exercise', id: 'debug-cart' }] },
  { file: 'testing-foundations.md', title: 'Tester son code', cat: 'Software engineering & architecture', level: 2, min: 50, skills: ['se'], practiceRefs: [{ kind: 'exercise', id: 'validate-user' }, { kind: 'exercise', id: 'debug-cart' }, { kind: 'playbook', id: 'ci-passes-locally-fails' }] },
  { file: 'error-handling.md', title: "Gestion d'erreurs", cat: 'Software engineering & architecture', level: 2, min: 45, skills: ['se'], practiceRefs: [{ kind: 'exercise', id: 'retry-should' }, { kind: 'exercise', id: 'sh-exit-retry' }, { kind: 'playbook', id: 'third-party-outage' }] },
  { file: 'design-patterns-intro.md', title: 'Design patterns : introduction', cat: 'Software engineering & architecture', level: 2, min: 45, skills: ['patterns'] },
  { file: 'architecture-basics.md', title: 'Architecture logicielle : les bases', cat: 'Software engineering & architecture', level: 3, min: 55, skills: ['archi'], practiceRefs: [{ kind: 'lab', id: 'cloud-architecture' }] },
  { file: 'refactoring-legacy-code.md', title: 'Refactoring et code legacy : changer sans casser', cat: 'Software engineering & architecture', level: 2, min: 50, skills: ['se'], practiceRefs: [{ kind: 'exercise', id: 'refactor-legacy' }, { kind: 'exercise', id: 'debt-legacy-refactor' }] },
  { file: 'technical-debt.md', title: 'La dette technique : décider en connaissance de cause', cat: 'Software engineering & architecture', level: 2, min: 45, skills: ['se'], practiceRefs: [{ kind: 'exercise', id: 'debt-legacy-refactor' }] },
  { file: 'breaking-changes-compatibility.md', title: 'Changements cassants et compatibilité', cat: 'Software engineering & architecture', level: 3, min: 45, skills: ['se'], practiceRefs: [{ kind: 'exercise', id: 'breaking-change-classify' }, { kind: 'playbook', id: 'breaking-api-change' }] },
  { file: 'technical-documentation.md', title: 'La documentation technique : quel document, pour qui, quand', cat: 'Software engineering & architecture', level: 2, min: 40, skills: ['se', 'comm'], practiceRefs: [{ kind: 'mission', id: 'feature-design-docs' }, { kind: 'mission', id: 'health-incident-postmortem' }] },
  { file: 'observability-logging.md', title: 'Observabilité et logs structurés', cat: 'Software engineering & architecture', level: 2, min: 40, skills: ['archi', 'cloud'] },
  // ── Python & ML ──
  { file: 'python-foundations.md', title: 'Python : les fondations', cat: 'Python & ML', level: 1, min: 45, skills: ['python'], practiceRefs: [{ kind: 'exercise', id: 'py-list-sum' }, { kind: 'exercise', id: 'py-word-count' }, { kind: 'exercise', id: 'py-slugify' }] },
  { file: 'statistics-for-ml.md', title: 'Statistiques pour le ML', cat: 'Python & ML', level: 2, min: 50, skills: ['ml'], practiceRefs: [{ kind: 'exercise', id: 'ml-split-choice' }] },
  { file: 'machine-learning-basics.md', title: 'Machine learning : les bases', cat: 'Python & ML', level: 2, min: 55, skills: ['ml'], practiceRefs: [{ kind: 'exercise', id: 'ml-metric-choice' }] },
  { file: 'feature-engineering.md', title: 'Feature engineering', cat: 'Python & ML', level: 2, min: 45, skills: ['ml'], practiceRefs: [{ kind: 'exercise', id: 'ml-data-leakage' }, { kind: 'exercise', id: 'ml-feature-encoding' }] },
  { file: 'model-evaluation.md', title: 'Évaluer un modèle ML', cat: 'Python & ML', level: 2, min: 50, skills: ['ml', 'evalia'], practiceRefs: [{ kind: 'exercise', id: 'ml-metric-choice' }, { kind: 'exercise', id: 'ml-confusion-metric' }, { kind: 'exercise', id: 'ml-overfit-diagnose' }] },
  { file: 'scikit-learn-workflow.md', title: 'Le workflow scikit-learn', cat: 'Python & ML', level: 2, min: 45, skills: ['ml', 'python'], practiceRefs: [{ kind: 'exercise', id: 'ml-split-choice' }, { kind: 'exercise', id: 'ml-data-leakage' }] },
  { file: 'neural-networks.md', title: 'Réseaux de neurones : ouvrir la boîte noire', cat: 'Python & ML', level: 3, min: 55, skills: ['dl'], practiceRefs: [{ kind: 'exercise', id: 'nn-forward-neuron' }, { kind: 'exercise', id: 'ml-overfit-diagnose' }] },
  { file: 'transformers.md', title: "Transformers : l'architecture des LLM", cat: 'Python & ML', level: 3, min: 55, skills: ['dl', 'llm'], practiceRefs: [{ kind: 'exercise', id: 'attention-argmax' }] },
  // ── IA appliquée ──
  { file: 'llm-fundamentals.md', title: 'LLM : comprendre les grands modèles', cat: 'IA appliquée', level: 2, min: 55, skills: ['llm'], practiceRefs: [{ kind: 'exercise', id: 'llm-context-budget' }] },
  { file: 'prompt-engineering.md', title: 'Prompt engineering (sérieux)', cat: 'IA appliquée', level: 2, min: 45, skills: ['llm'], practiceRefs: [{ kind: 'exercise', id: 'rag-structured-validate' }] },
  { file: 'structured-outputs-tools.md', title: 'Sorties structurées et function calling', cat: 'IA appliquée', level: 2, min: 45, skills: ['llm', 'agents'], practiceRefs: [{ kind: 'exercise', id: 'rag-structured-validate' }] },
  { file: 'embeddings.md', title: 'Embeddings', cat: 'IA appliquée', level: 2, min: 40, skills: ['rag', 'dl'], practiceRefs: [{ kind: 'exercise', id: 'rag-cosine-rank' }] },
  { file: 'rag-fundamentals.md', title: 'RAG : retrieval-augmented generation', cat: 'IA appliquée', level: 2, min: 55, skills: ['rag'], practiceRefs: [{ kind: 'exercise', id: 'rag-failure-locate' }] },
  { file: 'chunking-strategies.md', title: 'Stratégies de chunking', cat: 'IA appliquée', level: 2, min: 40, skills: ['rag'], practiceRefs: [{ kind: 'exercise', id: 'rag-chunking-overlap' }] },
  { file: 'vector-databases.md', title: 'Bases de données vectorielles', cat: 'IA appliquée', level: 2, min: 40, skills: ['rag'], practiceRefs: [{ kind: 'exercise', id: 'rag-cosine-rank' }] },
  { file: 'retrieval-reranking.md', title: 'Retrieval, hybride et reranking', cat: 'IA appliquée', level: 3, min: 50, skills: ['rag'], practiceRefs: [{ kind: 'exercise', id: 'rag-rrf-fusion' }, { kind: 'exercise', id: 'rag-failure-locate' }] },
  { file: 'ai-evaluation.md', title: 'Évaluer un système IA', cat: 'IA appliquée', level: 3, min: 55, skills: ['evalia'], practiceRefs: [{ kind: 'exercise', id: 'rag-failure-locate' }] },
  { file: 'rag-evaluation.md', title: 'Évaluation RAG avancée', cat: 'IA appliquée', level: 3, min: 50, skills: ['evalia', 'rag'], practiceRefs: [{ kind: 'exercise', id: 'rag-failure-locate' }] },
  { file: 'agents-fundamentals.md', title: 'Agents IA : fondamentaux', cat: 'IA appliquée', level: 2, min: 50, skills: ['agents'], practiceRefs: [{ kind: 'exercise', id: 'agent-tool-select' }, { kind: 'exercise', id: 'agent-state-transition' }] },
  { file: 'agent-workflows-orchestration.md', title: 'Agents avancés et orchestration', cat: 'IA appliquée', level: 3, min: 50, skills: ['agents'], practiceRefs: [{ kind: 'exercise', id: 'agent-loop-detect' }, { kind: 'exercise', id: 'agent-state-transition' }, { kind: 'exercise', id: 'agent-tool-validate' }, { kind: 'exercise', id: 'agent-retry-policy' }] },
  { file: 'ai-security.md', title: 'Sécurité des systèmes IA', cat: 'IA appliquée', level: 3, min: 50, skills: ['secu'], practiceRefs: [{ kind: 'exercise', id: 'prompt-injection-classify' }] },
  { file: 'prompt-injection-defense.md', title: 'Défense contre la prompt injection', cat: 'IA appliquée', level: 3, min: 45, skills: ['secu'], practiceRefs: [{ kind: 'exercise', id: 'prompt-injection-classify' }, { kind: 'exercise', id: 'agent-hitl-decision' }] },
  { file: 'llm-cost-optimization.md', title: "Coûts d'inférence : estimer et optimiser", cat: 'IA appliquée', level: 3, min: 40, skills: ['llm', 'cloud'], practiceRefs: [{ kind: 'exercise', id: 'llm-cost-estimate' }] },
  // ── Observabilité, SRE & fiabilité ──
  { file: 'observability-fundamentals.md', title: 'Observabilité : voir ce qui se passe en production', cat: 'Observabilité, SRE & fiabilité', level: 2, min: 45, skills: ['archi', 'cloud'], practiceRefs: [{ kind: 'exercise', id: 'cloud-observability-gap' }, { kind: 'exercise', id: 'incident-health-rollup' }, { kind: 'exercise', id: 'alert-actionable' }] },
  { file: 'logging-structured.md', title: 'Logs structurés et correlation ID', cat: 'Observabilité, SRE & fiabilité', level: 2, min: 40, skills: ['archi', 'secu'], practiceRefs: [{ kind: 'exercise', id: 'cicd-mask-secrets' }] },
  { file: 'distributed-tracing.md', title: 'Traces distribuées : suivre une requête de bout en bout', cat: 'Observabilité, SRE & fiabilité', level: 3, min: 45, skills: ['archi', 'cloud'], practiceRefs: [{ kind: 'exercise', id: 'latency-percentiles' }] },
  { file: 'metrics-percentiles.md', title: 'Métriques et percentiles : quand la moyenne ment', cat: 'Observabilité, SRE & fiabilité', level: 2, min: 45, skills: ['archi', 'cloud'], practiceRefs: [{ kind: 'exercise', id: 'latency-percentiles' }, { kind: 'exercise', id: 'perf-budget' }, { kind: 'exercise', id: 'cloud-observability-gap' }] },
  { file: 'slo-error-budget.md', title: 'SLI, SLO et error budget : la fiabilité comme un budget', cat: 'Observabilité, SRE & fiabilité', level: 2, min: 45, skills: ['archi', 'cloud'], practiceRefs: [{ kind: 'exercise', id: 'cloud-error-budget' }, { kind: 'exercise', id: 'slo-burn-rate' }] },
  { file: 'incident-response.md', title: 'Répondre à un incident : méthode sous pression', cat: 'Observabilité, SRE & fiabilité', level: 3, min: 50, skills: ['archi', 'cloud'], practiceRefs: [{ kind: 'exercise', id: 'incident-health-rollup' }, { kind: 'exercise', id: 'cloud-rollback-decision' }, { kind: 'exercise', id: 'k8s-recovery-decision' }, { kind: 'mission', id: 'health-incident-postmortem' }, { kind: 'exercise', id: 'incident-severity' }] },
  { file: 'postmortem-rca.md', title: 'Post-mortem et analyse de cause racine (RCA)', cat: 'Observabilité, SRE & fiabilité', level: 3, min: 45, skills: ['archi', 'comm'], practiceRefs: [{ kind: 'exercise', id: 'sec-recovery-decision' }, { kind: 'mission', id: 'health-incident-postmortem' }, { kind: 'exercise', id: 'rca-classify-cause' }] },
  { file: 'resilience-patterns.md', title: 'Patterns de résilience : survivre aux pannes des autres', cat: 'Observabilité, SRE & fiabilité', level: 3, min: 50, skills: ['archi', 'cloud'], practiceRefs: [{ kind: 'exercise', id: 'cloud-detect-spof' }, { kind: 'exercise', id: 'cloud-multi-az' }, { kind: 'exercise', id: 'cloud-rpo-met' }, { kind: 'mission', id: 'cloud-high-availability' }, { kind: 'exercise', id: 'circuit-breaker-state' }, { kind: 'exercise', id: 'retry-should' }] },
  // ── Systèmes & Linux ──
  { file: 'linux-filesystem-permissions.md', title: 'Linux : système de fichiers et permissions', cat: 'Systèmes & Linux', level: 2, min: 45, skills: ['gitlinux', 'secu'], practiceRefs: [{ kind: 'exercise', id: 'linux-path-traversal-x' }] },
  { file: 'linux-processes-signals.md', title: 'Linux : processus et signaux', cat: 'Systèmes & Linux', level: 2, min: 45, skills: ['gitlinux'], practiceRefs: [{ kind: 'exercise', id: 'sys-process-top-cpu' }, { kind: 'exercise', id: 'docker-exit-diagnosis' }, { kind: 'exercise', id: 'linux-signal-choice' }] },
  { file: 'linux-services-systemd.md', title: 'Linux : services et systemd', cat: 'Systèmes & Linux', level: 2, min: 45, skills: ['gitlinux', 'cloud'], practiceRefs: [{ kind: 'exercise', id: 'systemd-restart-loop' }] },
  { file: 'linux-resources-io.md', title: 'Linux : ressources, mémoire et I/O', cat: 'Systèmes & Linux', level: 3, min: 50, skills: ['gitlinux', 'archi'], practiceRefs: [{ kind: 'exercise', id: 'sys-process-top-cpu' }, { kind: 'exercise', id: 'k8s-oom-risk' }, { kind: 'exercise', id: 'linux-fd-ulimit' }] },
  { file: 'linux-ssh-remote.md', title: 'Linux : SSH et accès distant', cat: 'Systèmes & Linux', level: 2, min: 45, skills: ['gitlinux', 'secu'], practiceRefs: [{ kind: 'exercise', id: 'ssh-key-perms-accepted' }] },
  // ── Réseau ──
  { file: 'networking-tcp-ip-model.md', title: 'Réseau : le modèle TCP/IP en couches', cat: 'Réseau', level: 1, min: 40, skills: ['http', 'archi'], practiceRefs: [{ kind: 'exercise', id: 'net-http-status-class' }, { kind: 'exercise', id: 'net-dns-resolve' }] },
  { file: 'networking-addressing-routing.md', title: 'Réseau : adressage IP, CIDR et routage', cat: 'Réseau', level: 2, min: 50, skills: ['cloud', 'archi'], practiceRefs: [{ kind: 'exercise', id: 'cloud-cidr-overlap' }, { kind: 'exercise', id: 'cloud-subnet-visibility' }, { kind: 'exercise', id: 'cloud-sg-port-range' }] },
  { file: 'networking-dns.md', title: 'Réseau : DNS, la résolution de noms', cat: 'Réseau', level: 2, min: 45, skills: ['http', 'cloud'], practiceRefs: [{ kind: 'exercise', id: 'net-dns-resolve' }, { kind: 'exercise', id: 'dns-record-type-choice' }, { kind: 'exercise', id: 'dns-ttl-still-cached' }] },
  { file: 'networking-http-tls.md', title: 'Réseau : HTTP et TLS', cat: 'Réseau', level: 2, min: 50, skills: ['http', 'secu'], practiceRefs: [{ kind: 'exercise', id: 'net-http-status-class' }, { kind: 'exercise', id: 'http-status' }, { kind: 'exercise', id: 'tls-cert-usable' }, { kind: 'exercise', id: 'http-method-idempotent' }, { kind: 'mission', id: 'incident-dns-tls-http' }] },
  { file: 'networking-proxy-loadbalancing.md', title: 'Réseau : proxy, reverse proxy et load balancing', cat: 'Réseau', level: 3, min: 50, skills: ['archi', 'cloud'], practiceRefs: [{ kind: 'exercise', id: 'cloud-readiness-routing' }, { kind: 'exercise', id: 'k8s-service-endpoints' }] },
  // ── Conteneurs & Docker ──
  { file: 'docker-images-layers.md', title: 'Docker : images, couches et registre', cat: 'Conteneurs & Docker', level: 2, min: 45, skills: ['cloud'], practiceRefs: [{ kind: 'exercise', id: 'docker-layer-cache' }, { kind: 'exercise', id: 'docker-image-size' }, { kind: 'exercise', id: 'docker-tag-vs-digest' }] },
  { file: 'docker-build-dockerfile.md', title: 'Docker : maîtriser le Dockerfile et le multi-stage', cat: 'Conteneurs & Docker', level: 2, min: 50, skills: ['cloud', 'secu'], practiceRefs: [{ kind: 'exercise', id: 'docker-instruction-order' }, { kind: 'exercise', id: 'docker-dockerignore' }, { kind: 'exercise', id: 'docker-cmd-entrypoint' }] },
  { file: 'docker-networking-volumes.md', title: 'Docker : réseau et persistance des données', cat: 'Conteneurs & Docker', level: 2, min: 45, skills: ['cloud', 'archi'], practiceRefs: [{ kind: 'exercise', id: 'docker-port-mapping' }] },
  { file: 'docker-compose.md', title: 'Docker Compose : orchestrer une application multi-services', cat: 'Conteneurs & Docker', level: 2, min: 45, skills: ['cloud', 'archi'], practiceRefs: [{ kind: 'exercise', id: 'docker-port-mapping' }, { kind: 'exercise', id: 'compose-depends-ready' }] },
  { file: 'docker-production-hardening.md', title: 'Docker : durcissement pour la production', cat: 'Conteneurs & Docker', level: 3, min: 50, skills: ['cloud', 'secu'], practiceRefs: [{ kind: 'exercise', id: 'docker-detect-root' }, { kind: 'exercise', id: 'docker-detect-secret' }, { kind: 'exercise', id: 'docker-exit-diagnosis' }, { kind: 'mission', id: 'docker-container-incident' }] },
  // ── CI/CD & livraison ──
  { file: 'ci-cd-pipeline-anatomy.md', title: "CI/CD : anatomie d'un pipeline", cat: 'CI/CD & livraison', level: 2, min: 45, skills: ['cloud', 'se'], practiceRefs: [{ kind: 'exercise', id: 'cicd-critical-path' }, { kind: 'exercise', id: 'cicd-topo-order' }, { kind: 'exercise', id: 'cicd-fail-fast' }, { kind: 'exercise', id: 'cicd-cache-key' }, { kind: 'mission', id: 'cicd-blocked-delivery' }] },
  { file: 'ci-cd-quality-gates-artifacts.md', title: 'CI/CD : portes qualité et artefacts versionnés', cat: 'CI/CD & livraison', level: 2, min: 45, skills: ['cloud', 'se'], practiceRefs: [{ kind: 'exercise', id: 'cicd-stale-artifact' }, { kind: 'exercise', id: 'cicd-mask-secrets' }, { kind: 'exercise', id: 'cicd-env-promotion' }, { kind: 'exercise', id: 'cicd-branch-policy' }] },
  { file: 'deployment-strategies.md', title: 'Stratégies de déploiement sans coupure', cat: 'CI/CD & livraison', level: 3, min: 50, skills: ['cloud', 'archi'], practiceRefs: [{ kind: 'exercise', id: 'cloud-deploy-strategy' }, { kind: 'exercise', id: 'k8s-rolling-available' }, { kind: 'exercise', id: 'cloud-readiness-routing' }, { kind: 'mission', id: 'k8s-rolling-regression' }] },
  { file: 'release-incident-recovery.md', title: 'Reprise après incident : rollback, roll-forward, hotfix', cat: 'CI/CD & livraison', level: 3, min: 45, skills: ['cloud', 'archi'], practiceRefs: [{ kind: 'exercise', id: 'cloud-rollback-decision' }, { kind: 'exercise', id: 'k8s-recovery-decision' }, { kind: 'exercise', id: 'incident-health-rollup' }, { kind: 'mission', id: 'cloud-broken-release' }] },
  // ── Kubernetes ──
  { file: 'k8s-why-architecture.md', title: 'Kubernetes : pourquoi et architecture', cat: 'Kubernetes', level: 2, min: 50, skills: ['cloud', 'archi'], practiceRefs: [{ kind: 'exercise', id: 'k8s-count-kinds' }, { kind: 'exercise', id: 'k8s-pod-phase' }, { kind: 'lab', id: 'kubernetes' }] },
  { file: 'k8s-workloads.md', title: 'Kubernetes : Pods, Deployments et workloads', cat: 'Kubernetes', level: 2, min: 50, skills: ['cloud', 'archi'], practiceRefs: [{ kind: 'exercise', id: 'k8s-choose-workload' }, { kind: 'exercise', id: 'k8s-replicas-ha' }, { kind: 'exercise', id: 'k8s-statefulset-pvc' }, { kind: 'exercise', id: 'k8s-image-pinned' }, { kind: 'lab', id: 'kubernetes' }] },
  { file: 'k8s-networking-services.md', title: 'Kubernetes : réseau, Services et Ingress', cat: 'Kubernetes', level: 3, min: 50, skills: ['cloud', 'archi'], practiceRefs: [{ kind: 'exercise', id: 'k8s-service-endpoints' }, { kind: 'exercise', id: 'k8s-selector-match' }, { kind: 'exercise', id: 'k8s-ingress-backends' }, { kind: 'lab', id: 'kubernetes' }] },
  { file: 'k8s-config-probes.md', title: 'Kubernetes : configuration, secrets, probes et ressources', cat: 'Kubernetes', level: 3, min: 50, skills: ['cloud', 'secu'], practiceRefs: [{ kind: 'exercise', id: 'k8s-needs-probe' }, { kind: 'exercise', id: 'k8s-probe-role' }, { kind: 'exercise', id: 'k8s-oom-risk' }, { kind: 'exercise', id: 'k8s-secret-placement' }, { kind: 'mission', id: 'k8s-oomkilled-sizing' }] },
  { file: 'k8s-troubleshooting.md', title: 'Kubernetes : diagnostiquer un incident', cat: 'Kubernetes', level: 3, min: 50, skills: ['cloud', 'archi'], practiceRefs: [{ kind: 'exercise', id: 'k8s-pod-phase' }, { kind: 'exercise', id: 'k8s-recovery-decision' }, { kind: 'exercise', id: 'k8s-config-drift' }, { kind: 'lab', id: 'kubernetes' }, { kind: 'mission', id: 'k8s-crashloop' }, { kind: 'mission', id: 'k8s-service-no-endpoints' }] },
  { file: 'k8s-security.md', title: 'Kubernetes : sécurité et moindre privilège', cat: 'Kubernetes', level: 3, min: 50, skills: ['secu', 'cloud'], practiceRefs: [{ kind: 'exercise', id: 'sec-networkpolicy-open' }, { kind: 'exercise', id: 'k8s-secret-placement' }, { kind: 'lab', id: 'security' }] },
  // ── Cloud, AWS, Azure & IaC ──
  { file: 'cloud-fundamentals.md', title: 'Cloud : concepts fondamentaux', cat: 'Cloud, AWS, Azure & IaC', level: 2, min: 50, skills: ['cloud', 'archi'], practiceRefs: [{ kind: 'exercise', id: 'cloud-service-model' }, { kind: 'exercise', id: 'cloud-classify-tier' }, { kind: 'lab', id: 'cloud-architecture' }, { kind: 'mission', id: 'cloud-three-tier' }] },
  { file: 'cloud-networking.md', title: 'Cloud : le réseau (VPC/VNet, subnets, pare-feu)', cat: 'Cloud, AWS, Azure & IaC', level: 3, min: 50, skills: ['cloud', 'secu'], practiceRefs: [{ kind: 'exercise', id: 'cloud-cidr-overlap' }, { kind: 'exercise', id: 'cloud-subnet-visibility' }, { kind: 'exercise', id: 'cloud-sg-port-range' }, { kind: 'exercise', id: 'cloud-public-exposure' }, { kind: 'mission', id: 'cloud-secure-exposure' }] },
  { file: 'cloud-compute-storage.md', title: 'Cloud : compute et stockage', cat: 'Cloud, AWS, Azure & IaC', level: 2, min: 50, skills: ['cloud', 'archi'], practiceRefs: [{ kind: 'exercise', id: 'cloud-compute-choice' }, { kind: 'exercise', id: 'cloud-storage-class' }, { kind: 'exercise', id: 'cloud-scaling-choice' }, { kind: 'exercise', id: 'cloud-scaling-kind' }, { kind: 'mission', id: 'cloud-high-availability' }] },
  { file: 'cloud-aws-core.md', title: 'AWS : les services cœur et le modèle IAM', cat: 'Cloud, AWS, Azure & IaC', level: 3, min: 55, skills: ['cloud', 'secu'], practiceRefs: [{ kind: 'exercise', id: 'cloud-iam-wildcard' }, { kind: 'exercise', id: 'cloud-iam-excess-actions' }, { kind: 'exercise', id: 'cloud-iam-credential-choice' }, { kind: 'exercise', id: 'cloud-provider-map' }, { kind: 'lab', id: 'cloud-architecture' }] },
  { file: 'cloud-azure-core.md', title: "Azure : les services cœur et le modèle d'identité", cat: 'Cloud, AWS, Azure & IaC', level: 3, min: 55, skills: ['cloud', 'secu'], practiceRefs: [{ kind: 'exercise', id: 'cloud-provider-map' }, { kind: 'exercise', id: 'cloud-iam-credential-choice' }, { kind: 'lab', id: 'cloud-architecture' }] },
  { file: 'iac-fundamentals.md', title: 'Infrastructure as Code : les fondamentaux', cat: 'Cloud, AWS, Azure & IaC', level: 3, min: 50, skills: ['cloud', 'archi'], practiceRefs: [{ kind: 'exercise', id: 'k8s-config-drift' }, { kind: 'exercise', id: 'iac-plan-destructive' }, { kind: 'exercise', id: 'iac-idempotent-changes' }, { kind: 'mission', id: 'iac-drift-remediation' }] },
  { file: 'cloud-finops.md', title: 'FinOps : maîtriser le coût du cloud', cat: 'Cloud, AWS, Azure & IaC', level: 2, min: 45, skills: ['cloud', 'archi'], practiceRefs: [{ kind: 'exercise', id: 'cloud-rightsizing-savings' }, { kind: 'exercise', id: 'cloud-monthly-cost' }, { kind: 'exercise', id: 'cloud-error-budget' }, { kind: 'mission', id: 'cloud-cost-reduction' }] },
  // ── Production & DevOps ──
  { file: 'deployment-secrets.md', title: 'Secrets, environnements et déploiement', cat: 'Production & DevOps', level: 2, min: 40, skills: ['cloud', 'secu'] },
  { file: 'docker-containers.md', title: 'Docker et conteneurs', cat: 'Production & DevOps', level: 2, min: 45, skills: ['cloud'], practiceRefs: [{ kind: 'exercise', id: 'docker-instruction-order' }, { kind: 'exercise', id: 'docker-layer-cache' }, { kind: 'exercise', id: 'docker-image-size' }] },
  { file: 'ci-cd.md', title: 'Intégration continue (CI/CD)', cat: 'Production & DevOps', level: 2, min: 40, skills: ['cloud'] },
  { file: 'monitoring-production.md', title: 'Monitoring et production', cat: 'Production & DevOps', level: 3, min: 45, skills: ['cloud', 'archi'] },
  { file: 'llm-observability.md', title: 'LLMOps : observer un système LLM', cat: 'Production & DevOps', level: 3, min: 45, skills: ['cloud', 'llm'], practiceRefs: [{ kind: 'exercise', id: 'llm-cost-estimate' }] },
  // ── Portfolio & carrière ──
  { file: 'readme-documentation.md', title: 'Le README recruteur', cat: 'Portfolio & carrière', level: 1, min: 35, skills: ['comm'] },
  { file: 'portfolio-github.md', title: 'Portfolio technique GitHub', cat: 'Portfolio & carrière', level: 1, min: 35, skills: ['comm'] },
  { file: 'technical-storytelling.md', title: 'Storytelling technique', cat: 'Portfolio & carrière', level: 2, min: 40, skills: ['comm'] },
  { file: 'system-design-interview.md', title: "L'entretien de design système", cat: 'Portfolio & carrière', level: 3, min: 50, skills: ['archi', 'comm'] },
  { file: 'interview-preparation.md', title: "Préparation à l'entretien IA", cat: 'Portfolio & carrière', level: 2, min: 45, skills: ['comm'] },
];

export const LESSON_BY_SKILL = {
  gitlinux: ['terminal-shell-filesystem.md', 'git-fundamentals.md', 'git-advanced.md'],
  jsts: ['javascript-basics.md', 'typescript-basics.md', 'async-javascript.md'],
  algo: ['algorithmic-thinking.md', 'recursion.md'],
  ds: ['data-structures-intro.md', 'recursion.md'],
  http: ['http-rest-json.md', 'api-design-basics.md', 'express-backend.md'],
  sql: ['sql-foundations.md', 'database-modeling.md', 'etl-pipelines.md', 'data-cleaning-quality.md'],
  se: ['clean-code.md', 'testing-foundations.md', 'error-handling.md'],
  archi: ['architecture-basics.md', 'caching-performance.md', 'system-design-interview.md'],
  patterns: ['design-patterns-intro.md'],
  python: ['python-foundations.md', 'pandas-data-wrangling.md'],
  ml: ['machine-learning-basics.md', 'statistics-for-ml.md', 'scikit-learn-workflow.md', 'feature-engineering.md', 'model-evaluation.md'],
  dl: ['neural-networks.md', 'transformers.md'],
  llm: ['llm-fundamentals.md', 'prompt-engineering.md', 'structured-outputs-tools.md', 'llm-cost-optimization.md'],
  rag: ['rag-fundamentals.md', 'embeddings.md', 'chunking-strategies.md', 'retrieval-reranking.md', 'vector-databases.md', 'rag-evaluation.md'],
  agents: ['agents-fundamentals.md', 'agent-workflows-orchestration.md', 'structured-outputs-tools.md'],
  evalia: ['ai-evaluation.md', 'rag-evaluation.md', 'model-evaluation.md'],
  secu: ['ai-security.md', 'prompt-injection-defense.md', 'authentication.md'],
  cloud: ['docker-containers.md', 'ci-cd.md', 'deployment-secrets.md', 'monitoring-production.md'],
  comm: ['technical-storytelling.md', 'readme-documentation.md', 'portfolio-github.md', 'interview-preparation.md'],
  autonomy: ['system-design-interview.md', 'algorithmic-thinking.md'],
};

// Vraie question d'entretien par défaut, par compétence (question + idée de réponse).
export const INTERVIEW_BY_SKILL = {
  gitlinux: `**« Que se passe-t-il quand tu tapes \`git commit\` ? »** → Git fige un instantané du contenu STAGÉ (pas du working directory) dans un nouveau commit qui pointe vers le précédent ; d'où l'intérêt du staging pour composer des commits cohérents. Bonus : différence entre \`git reset\`, \`git revert\`, \`git checkout\`.`,
  jsts: `**« Explique la différence entre valeur et référence en JS, avec un bug qu'elle cause. »** → Les primitifs se copient, les objets/tableaux se partagent ; \`const b = a; b.push(x)\` modifie aussi \`a\`. On copie avec \`[...a]\` (superficiel). Enchaîne sur l'immutabilité et pourquoi React l'exige.`,
  algo: `**« Quelle est la complexité de ta solution, et peux-tu faire mieux ? »** → Compter les boucles (imbriquées = ×, successives = +), repérer les méthodes cachant une boucle (\`includes\` = O(n)), puis proposer une structure (Map/Set) qui échange mémoire contre temps pour passer de O(n²) à O(n).`,
  ds: `**« Quelle structure choisirais-tu pour X et pourquoi ? »** → Identifier l'opération DOMINANTE et son coût : hash map pour associer/compter (O(1)), Set pour l'unicité, queue pour l'ordre FIFO, arbre pour des données triées dynamiques. Justifier par le coût, pas par habitude.`,
  http: `**« Décris le trajet d'une requête HTTP et le rôle des statuts. »** → DNS → TCP → TLS → HTTP ; requête (méthode + URL + headers + corps) / réponse (statut + corps) ; sans état ; 2xx succès, 4xx faute client, 5xx faute serveur ; idempotence de GET/PUT/DELETE pour les retries.`,
  sql: `**« Écris une requête des 3 clients au plus gros CA, et explique WHERE vs HAVING. »** → \`SELECT client, SUM(montant) ... GROUP BY client ORDER BY 2 DESC LIMIT 3\` ; WHERE filtre les lignes AVANT agrégation, HAVING filtre les groupes APRÈS. Enchaîne sur les index et l'injection SQL (requêtes paramétrées).`,
  python: `**« Différence entre une liste et un tuple, et quand utiliser un dict ? »** → Liste mutable, tuple immuable (clé de dict possible, sûr comme constante) ; dict pour associer clé→valeur en O(1). Bonus : les comprehensions et le piège de l'argument par défaut mutable.`,
  se: `**« Comment testes-tu ce code, et comment sais-tu qu'un test est utile ? »** → Arrange/Act/Assert sur la logique pure ; un test doit pouvoir ÉCHOUER (on sabote pour le prouver) ; isoler l'extérieur par des mocks ; tester les cas limites et d'erreur, pas seulement le chemin heureux.`,
  archi: `**« Conçois un système pour {besoin} — monolithe ou microservices ? »** → Clarifier les besoins/volumes AVANT ; par défaut monolithe modulaire (le distribué coûte cher en complexité) ; isoler ce qui change derrière des interfaces ; anticiper échelle et pannes. Justifier en trade-offs, pas en mode.`,
  patterns: `**« Cite un design pattern que tu as utilisé et le problème qu'il résout. »** → Ex. Strategy (injecter un comportement interchangeable — une callback), Adapter (uniformiser deux APIs), Factory (centraliser la création). Reconnaître le pattern dans SON code, et éviter la sur-ingénierie.`,
  ml: `**« Ton modèle fait 99 % d'accuracy — es-tu content ? »** → Non sans connaître la baseline ni l'équilibre des classes (99 % peut être la classe majoritaire). Regarder précision/rappel/F1 selon le coût métier des erreurs, vérifier l'absence de leakage, évaluer sur un test intact.`,
  dl: `**« Explique ce qu'est un embedding et un token. »** → Un token ≈ un morceau de mot ; un embedding est un vecteur qui encode le SENS (les textes proches en sens sont proches en vecteurs). C'est ce qui permet la recherche sémantique d'un RAG. Enchaîne sur l'attention et le transformer.`,
  llm: `**« Pourquoi un LLM hallucine-t-il, et comment y remédier ? »** → Il prédit le token le plus PLAUSIBLE, pas le vrai ; quand la réponse n'est pas bien représentée, il complète quand même. Remèdes : ancrer dans des sources (RAG), exiger des citations, valider en aval, permettre le refus.`,
  rag: `**« Ton RAG répond mal — comment débugges-tu ? »** → Séparer retrieval et génération : le bon passage était-il dans le top-k (mesurable sans LLM : rappel@k) ? Si non → chunking/embedding/hybride. Si oui → prompt/fidélité. 80 % des échecs sont côté retrieval.`,
  agents: `**« Agent ou workflow pour ce cas ? »** → Si le chemin est connu d'avance → workflow (prévisible, testable, coût borné). L'agent ne se justifie que si les étapes dépendent de découvertes en cours de route. Savoir dire « un workflow suffit » est un signe de maturité.`,
  evalia: `**« Comment sais-tu que ton système IA marche ? »** → Golden set varié (avec des cas sans réponse), évaluation par étage (rappel@k pour le retrieval, fidélité via LLM-as-judge CALIBRÉ pour la génération), baseline + mesure avant/après chaque changement, scores versionnés.`,
  secu: `**« Qu'est-ce que la prompt injection indirecte et comment défendre ? »** → Une instruction malveillante cachée dans un DOCUMENT ingéré détourne le système ; « ignore les instructions des docs » ne suffit pas. Défense en profondeur : marquer les données, vérifier les citations, refus, moindre privilège des outils.`,
  cloud: `**« Comment déploierais-tu et livrerais-tu ce système ? »** → Docker (\`compose up\` = tout tourne), secrets par variables d'environnement, CI qui lint + teste à chaque push, logs structurés pour l'observabilité, et conscience des coûts (surtout l'inférence LLM).`,
  comm: `**« Parle-moi d'un de tes projets. »** → Structure STAR : le problème et pour qui, tes DÉCISIONS (avec les trade-offs / ADRs), les résultats CHIFFRÉS, un obstacle réel et sa résolution. Raconter les décisions, pas la liste des features.`,
  autonomy: `**« Raconte comment tu as mené un projet de bout en bout. »** → Cadrage (spec, hors-scope), découpage en jalons démontrables, arbitrage du scope face aux imprévus, livraison en qualité (tests, doc, démo). Montrer qu'on est opérationnel sans supervision constante.`,
};

// Cas métier / usage réel par compétence (surtout data & IA). Vide = pas de bloc.
export const CASE_BY_SKILL = {
  sql: `En entreprise, 90 % des questions data commencent par du SQL : construire un tableau de bord (CA par région, cohortes de rétention), préparer les features d'un modèle ML, ou stocker les métadonnées et faire la recherche lexicale (FTS5) d'un système RAG.`,
  python: `Python est le langage de la data et de l'IA : un pipeline ETL nocturne qui nettoie des CSV avec pandas, un notebook d'analyse, un script d'entraînement scikit-learn, ou l'orchestration d'un pipeline RAG et de son évaluation.`,
  ml: `Cas typique : prédire la résiliation (churn) pour cibler les relances, scorer des leads, détecter la fraude. La valeur n'est pas le modèle mais la DÉCISION qu'il éclaire — d'où l'importance de la métrique choisie et de l'analyse d'erreurs.`,
  dl: `Cas typique : classer des tickets support par thème, extraire des entités de documents, ou fournir les embeddings qui alimentent la recherche sémantique d'un assistant documentaire.`,
  llm: `Cas typique : un assistant qui extrait des champs structurés (JSON validé) depuis des factures en texte libre, ou qui appelle des outils (function calling) pour répondre à une demande — le LLM comme composant faillible qu'on encadre (validation, retry, coût).`,
  rag: `Cas typique : répondre aux questions des employés sur la base de connaissances interne (RH, procédures, contrats) avec citations vérifiables et refus quand l'info n'existe pas — le cas d'usage IA n°1 en entreprise, et le cœur du projet final DocSense.`,
  agents: `Cas typique : un workflow d'analyse de documents (résumé, points clés, incohérences) orchestré en étapes explicites, plutôt qu'un agent libre — moins cher, testable, reproductible. L'agent est réservé aux tâches dont le chemin dépend des découvertes.`,
  evalia: `Cas typique : un dashboard qualité qui montre l'évolution de la fidélité et du rappel@k d'un RAG à chaque version — la pièce qui prouve à un client (et à un recruteur) que le système marche, chiffres à l'appui.`,
  secu: `Cas typique : un assistant documentaire qui refuse d'exécuter une instruction cachée dans un PDF piégé, ne fuite pas de données personnelles vers l'API du fournisseur, et journalise sans secrets — la sécurité d'un système IA en production.`,
  cloud: `Cas typique : livrer l'assistant en \`docker compose up\`, avec une CI qui lance les tests et une éval smoke à chaque push, des secrets en variables d'environnement, et un suivi des coûts d'inférence.`,
  http: `Cas typique : appeler un LLM (POST + header d'auth + corps JSON + streaming), exposer ton système RAG comme une API (\`POST /questions\`), ou consommer une API tierce — comprendre HTTP, c'est comprendre comment les systèmes IA se parlent.`,
};

// « Pourquoi ça comptera plus tard » par défaut, par compétence.
export const FUTURE_BY_SKILL = {
  gitlinux: `- **En architecture / DevOps** : le terminal et Git sont le socle de Docker, de la CI et de tout déploiement (mois 11) — un Dockerfile est une suite de commandes shell.
- **En data / IA** : les pipelines de données et les scripts d'évaluation RAG (mois 9) se lancent et s'orchestrent au terminal.
- **En entretien** : « montre-moi comment tu lances ton projet » et un historique Git propre sont des signaux immédiats de professionnalisme.`,
  jsts: `- **En architecture** : le typage et la modularité JS/TS structurent toutes tes futures applications (API mois 3, front mois 4, DocSense mois 11).
- **En IA/LLM** : tes applications RAG et agents (mois 8-10) seront écrites en TypeScript — valider les sorties d'un LLM, c'est du typage appliqué à un composant faillible.
- **En entretien** : les questions de code (closures, immutabilité, async) tombent systématiquement pour les rôles full-stack orientés IA.`,
  algo: `- **En architecture** : estimer un coût (Big O) avant de coder, c'est exactement le raisonnement de dimensionnement d'un système (mois 10).
- **En data / IA** : le chunking, le retrieval et l'évaluation RAG (mois 8-9) sont des problèmes algorithmiques (fenêtres, similarité, tri, top-k).
- **En entretien** : l'entretien algo est un passage obligé — la méthode et les patterns d'aujourd'hui sont ta préparation directe.`,
  ds: `- **En architecture** : files (queues) et caches (hash maps) sont des briques d'infrastructure entières — Redis est une hash map géante, RabbitMQ une queue distribuée.
- **En IA** : l'index inversé est le cœur de la recherche lexicale de ton RAG hybride (mois 9) ; les arbres structurent les documents que tu chunkeras.
- **En entretien** : « quelle structure choisirais-tu et pourquoi » est LA question technique junior par excellence.`,
  http: `- **En architecture** : toute intégration système passe par des APIs — comprendre HTTP en profondeur, c'est comprendre comment les systèmes se parlent.
- **En IA/LLM** : appeler un LLM, C'EST une requête HTTP (headers d'auth, corps JSON, streaming, statuts d'erreur) ; ton RAG est une API qui appelle des APIs.
- **En entretien** : « que se passe-t-il quand tu tapes une URL » et « design une API pour X » sont des classiques absolus.`,
  sql: `- **En data** : SQL est LA langue des données en entreprise — pipelines, analytics, feature engineering ML (mois 6) commencent par des requêtes.
- **En IA** : ta base vectorielle a des métadonnées SQL ; la recherche lexicale FTS5 de ton RAG hybride (mois 9) est du SQL ; SQLite portera l'évaluation de DocSense.
- **En entretien** : 2-3 requêtes SQL en live (JOIN, GROUP BY) sont quasi systématiques pour les rôles data/IA.`,
  se: `- **En architecture** : tests, gestion d'erreurs et refactoring sont ce qui rend une architecture VIVABLE — sans eux, tout design s'effondre à la première évolution.
- **En IA** : tester un composant qui appelle un LLM (mock, replay, éval — mois 11) est une extension directe des tests d'aujourd'hui.
- **En entretien** : la qualité de ton code sous pression (nommage, découpage, cas limites) est évaluée dans CHAQUE exercice, même quand on ne le dit pas.`,
  archi: `- **En architecture** : c'est le cœur du sujet — ces patterns (couches, ports/adapters, queues, cache) sont le vocabulaire de l'entretien système.
- **En IA** : DocSense (mois 11-12) appliquera l'hexagonal pour rendre le LLM et la vector DB remplaçables ; un système RAG EST une architecture de composants faillibles.
- **En entretien** : l'entretien design système est décisif dès le niveau junior+ pour les rôles AI Engineer.`,
  patterns: `- **En architecture** : les patterns sont le vocabulaire partagé des équipes — une revue de code parle en Strategy, Adapter, Observer.
- **En IA** : Strategy = interchanger les modèles LLM ; Adapter = uniformiser vector DBs ; Factory = créer le bon pipeline selon la config (DocSense, mois 11).
- **En entretien** : reconnaître un pattern dans TON propre code et le nommer est un signal fort de maturité.`,
  python: `- **En data** : Python est la langue de pandas, des pipelines ETL et de toute la stack data (mois 5).
- **En IA/ML** : scikit-learn, PyTorch, et la majorité de l'outillage LLM/RAG sont Python-first — sans Python, pas de ML crédible (mois 6-7).
- **En entretien** : les rôles IA exigent Python ; les exercices data en live se font en Python + pandas.`,
  ml: `- **En data** : les métriques, le split honnête et l'anti-leakage sont la base de toute analyse sérieuse, ML ou pas.
- **En IA/LLM** : l'évaluation RAG (mois 9) réutilise exactement ces concepts — golden set = jeu de test, fidélité = métrique, biais du juge = biais de mesure.
- **En entretien** : overfitting, choix de métrique et leakage sont les 3 questions ML junior les plus posées.`,
  dl: `- **En IA/LLM** : comprendre tokens, embeddings et attention te permet de RAISONNER sur les LLM (pourquoi ils hallucinent, pourquoi le contexte est limité) au lieu de les subir.
- **En RAG** : les embeddings sont le cœur du retrieval vectoriel (mois 8-9) — les avoir manipulés à la main change tout.
- **En entretien** : « explique-moi un transformer » ou « qu'est-ce qu'un embedding » sont des questions différenciantes pour les rôles LLM.`,
  llm: `- **En architecture** : un LLM est un composant non-déterministe, coûteux et faillible — l'intégrer proprement (validation, retry, cache, fallback) est LE savoir-faire du métier AI Engineer.
- **En RAG/agents** : prompts robustes, structured outputs et function calling sont les briques de DocQA (mois 8-9) et de DocSense (mois 11).
- **En entretien** : les 20 questions IA types (tokens, température, hallucinations, coûts) viennent directement d'ici.`,
  rag: `- **En architecture** : un pipeline RAG est un système complet (ingestion, index, retrieval, génération) — le concevoir, c'est faire de l'architecture appliquée.
- **En projet final** : DocSense (mois 11-12) est un RAG évalué de bout en bout — chaque décision d'aujourd'hui (chunking, hybride, reranking) y resservira, chiffres à l'appui.
- **En entretien** : « comment débugges-tu un RAG qui répond mal » est LA question qui sépare les candidats sérieux des prompteurs.`,
  agents: `- **En architecture** : la boucle agent (plan → outil → observation) et les workflows explicites sont les deux patterns d'orchestration IA — savoir choisir entre eux est une décision d'architecte.
- **En projet final** : le workflow d'analyse de DocSense (mois 11) appliquera exactement ces critères de choix.
- **En entretien** : « agent ou workflow pour ce cas ? » teste ta maturité — la bonne réponse est souvent « un workflow suffit ».`,
  evalia: `- **En architecture** : un système IA sans évaluation est un pari, pas un produit — le harnais d'éval est un composant d'architecture à part entière.
- **En projet final** : le dashboard qualité de DocSense (mois 11-12) est TON différenciateur n°1 face aux autres candidats.
- **En entretien** : « comment sais-tu que ton RAG marche ? » — ta réponse chiffrée (golden set, fidélité, avant/après) vaut plus que dix features.`,
  secu: `- **En architecture** : la sécurité se conçoit en couches dès le design (validation, moindre privilège, défense en profondeur) — l'ajouter après coût 10× plus cher.
- **En IA** : la prompt injection (directe et via documents) est LA faille des systèmes LLM — tes guardrails de DocSense (mois 12) seront testés par une suite adverse.
- **En entretien** : citer l'OWASP LLM et démontrer une injection sur TON propre système est un différenciateur rare chez les juniors.`,
  cloud: `- **En architecture** : Docker, CI et variables d'environnement sont le standard de livraison — un projet non dockerisé est un projet difficile à évaluer.
- **En IA** : DocSense se livre en \`docker compose up\` avec une CI qui lance les évals (mois 11) — c'est ce qui le rend crédible.
- **En entretien** : « comment déploierais-tu ce système » clôt la plupart des entretiens design.`,
  comm: `- **En carrière** : un projet non racontable n'existe pas — le storytelling (STAR, décisions, chiffres) transforme ton travail en offres d'entretien.
- **En équipe** : READMEs, ADRs et démos sont la communication asynchrone qui fait fonctionner les équipes techniques.
- **En entretien** : la clarté d'explication est évaluée dans TOUS les entretiens — c'est la compétence transversale n°1.`,
  autonomy: `- **En poste** : cadrer, découper, arbitrer le scope et livrer sans supervision constante est ce qui distingue un junior+ d'un junior.
- **En projet final** : DocSense (8 semaines en autonomie totale) est l'examen pratique de cette compétence.
- **En entretien** : raconter comment tu as cadré et tenu un projet de 8 semaines répond à la question « es-tu opérationnel ? ».`,
};
