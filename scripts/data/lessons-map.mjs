// Carte des leçons approfondies (curriculum/lessons/) et sections par défaut.
// - LESSON_BY_SKILL : leçon de référence par compétence (lien affiché dans « Cours approfondi »).
// - FUTURE_BY_SKILL : section « Pourquoi ça comptera plus tard » par défaut,
//   utilisée quand un jour n'a pas de section spécifique.

export const LESSONS = [
  { file: 'terminal-shell-filesystem.md', title: 'Terminal, shell et système de fichiers' },
  { file: 'git-fundamentals.md', title: 'Git : les fondamentaux' },
  { file: 'javascript-basics.md', title: 'JavaScript : les bases solides' },
  { file: 'typescript-basics.md', title: 'TypeScript : typer pour fiabiliser' },
  { file: 'algorithmic-thinking.md', title: 'La pensée algorithmique' },
  { file: 'data-structures-intro.md', title: 'Structures de données : choisir son outil' },
  { file: 'http-rest-json.md', title: 'HTTP, REST et JSON' },
  { file: 'api-design-basics.md', title: "Concevoir une API" },
  { file: 'sql-foundations.md', title: 'SQL : les fondations' },
  { file: 'clean-code.md', title: 'Clean code' },
  { file: 'testing-foundations.md', title: 'Tester son code' },
  { file: 'architecture-basics.md', title: "Architecture logicielle : les bases" },
  { file: 'design-patterns-intro.md', title: 'Design patterns : introduction' },
  { file: 'python-foundations.md', title: 'Python : les fondations' },
  { file: 'statistics-for-ml.md', title: 'Statistiques pour le ML' },
  { file: 'machine-learning-basics.md', title: 'Machine learning : les bases' },
  { file: 'llm-fundamentals.md', title: 'LLM : comprendre les grands modèles de langage' },
  { file: 'rag-fundamentals.md', title: 'RAG : retrieval-augmented generation' },
  { file: 'agents-fundamentals.md', title: 'Agents IA : fondamentaux' },
  { file: 'ai-evaluation.md', title: "Évaluer un système IA" },
  { file: 'ai-security.md', title: 'Sécurité des systèmes IA' },
];

export const LESSON_BY_SKILL = {
  gitlinux: ['terminal-shell-filesystem.md', 'git-fundamentals.md'],
  jsts: ['javascript-basics.md', 'typescript-basics.md'],
  algo: ['algorithmic-thinking.md'],
  ds: ['data-structures-intro.md'],
  http: ['http-rest-json.md', 'api-design-basics.md'],
  sql: ['sql-foundations.md'],
  se: ['clean-code.md', 'testing-foundations.md'],
  archi: ['architecture-basics.md'],
  patterns: ['design-patterns-intro.md'],
  python: ['python-foundations.md'],
  ml: ['statistics-for-ml.md', 'machine-learning-basics.md'],
  dl: ['machine-learning-basics.md', 'llm-fundamentals.md'],
  llm: ['llm-fundamentals.md'],
  rag: ['rag-fundamentals.md'],
  agents: ['agents-fundamentals.md'],
  evalia: ['ai-evaluation.md'],
  secu: ['ai-security.md'],
  cloud: ['architecture-basics.md'],
  comm: ['clean-code.md'],
  autonomy: ['algorithmic-thinking.md'],
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
