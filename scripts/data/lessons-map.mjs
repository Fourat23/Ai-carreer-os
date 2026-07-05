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
  // Approfondissements IA (batch qualité)
  { file: 'prompt-engineering.md', title: 'Prompt engineering (sérieux)' },
  { file: 'structured-outputs-tools.md', title: 'Sorties structurées et function calling' },
  { file: 'embeddings.md', title: 'Embeddings' },
  { file: 'vector-databases.md', title: 'Bases de données vectorielles' },
  { file: 'chunking-strategies.md', title: 'Stratégies de chunking' },
  { file: 'retrieval-reranking.md', title: 'Retrieval, recherche hybride et reranking' },
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
  llm: ['llm-fundamentals.md', 'prompt-engineering.md', 'structured-outputs-tools.md'],
  rag: ['rag-fundamentals.md', 'embeddings.md', 'chunking-strategies.md', 'retrieval-reranking.md', 'vector-databases.md'],
  agents: ['agents-fundamentals.md', 'structured-outputs-tools.md'],
  evalia: ['ai-evaluation.md'],
  secu: ['ai-security.md'],
  cloud: ['architecture-basics.md'],
  comm: ['clean-code.md'],
  autonomy: ['algorithmic-thinking.md'],
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
