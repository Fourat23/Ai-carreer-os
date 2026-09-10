// V73 · CP9 — DIFFICULTÉ DÉRIVÉE DU TRAVAIL DEMANDÉ.
//
// Avant ce fichier, les journées 91-365 portaient toutes la constante `difficulty: 3` écrite
// en dur dans le générateur, et les revues `2`. La suite valait donc 3,3,3,3,3,3,2 répétée
// cinquante-deux fois : une fonction de la POSITION DANS LA SEMAINE, qui ne disait rien de la
// journée. Les valeurs ci-dessous sont dérivées de sept propriétés déclarées — nouveauté,
// autonomie, guidance, complexité de prérequis, intégration, ambiguïté de la commande,
// responsabilité du livrable — et l'échelle est calibrée sur les 78 journées 1-90 dont la
// difficulté a été écrite à la main.
//
// Regénérer : node scripts/v73/cp9-progression.mjs --ecrire --ecrire-difficulte
// Méthode et limites : docs/v73/V73-CP9-PROGRESSION.md
export const DIFFICULTY_V73 = {
  92: 3, // React : composants, props, JSX
  93: 3, // State et interactivité (useState)
  94: 3, // Rendu conditionnel et listes
  95: 3, // Effets et fetch (useEffect)
  96: 3, // Formulaires contrôlés et validation
  97: 3, // Module api.ts et gestion d'erreur centralisée
  99: 3, // Routing et navigation
  100: 3, // Lever l'état et le partager
  101: 3, // Context pour l'état global léger
  102: 5, // Performance React : re-renders
  103: 5, // Accessibilité et UX de base
  104: 4, // Consolidation front + préparation Projet 3
  106: 3, // Tests unitaires (Vitest)
  107: 4, // Tester des composants React
  108: 3, // Mocks et tests d'intégration
  109: 3, // Clean code appliqué au front
  110: 3, // Hooks personnalisés
  111: 4, // Gestion d'erreur front robuste
  113: 3, // Projet 3 — BiblioApp : socle
  114: 3, // Projet 3 — CRUD complet
  115: 3, // Projet 3 — Recherche et filtres
  116: 3, // Projet 3 — Tests
  117: 4, // Projet 3 — Polish et états edge
  118: 3, // Projet 3 — README, schéma, ADR, démo
  120: 3, // Python : syntaxe et structures
  121: 2, // Python : fonctions, modules, fichiers
  122: 3, // Python : exceptions et robustesse
  123: 3, // Python : POO et style pythonique
  124: 3, // Python : tests (pytest)
  125: 3, // Python : environnements et outils
  127: 3, // pandas : charger et inspecter
  128: 3, // pandas : nettoyer (data quality)
  129: 3, // pandas : filtrer, trier, sélectionner
  130: 3, // pandas : grouper et agréger
  131: 3, // pandas : joindre (merge)
  132: 3, // Data quality en fonctions réutilisables
  134: 3, // SQL avancé : normalisation
  135: 3, // SQL avancé : index
  136: 3, // SQL avancé : transactions (ACID)
  137: 2, // SQL avancé : requêtes analytiques
  138: 3, // ETL : concevoir un pipeline
  139: 4, // ETL : robustesse et rejouabilité
  141: 4, // Projet 4 — DataPulse : cadrage et source
  142: 3, // Projet 4 — Extract
  143: 4, // Projet 4 — Transform
  144: 3, // Projet 4 — Load
  145: 3, // Projet 4 — Dashboard
  146: 3, // Projet 4 — README, ADR, démo
  148: 3, // Statistiques : tendance et dispersion
  149: 3, // Statistiques : distributions et visualisation
  150: 3, // Corrélation et causalité
  151: 3, // Probabilités utiles
  152: 3, // Échantillonnage et biais
  153: 3, // Mini-étude statistique
  155: 4, // ML : le workflow et scikit-learn
  156: 3, // Régression linéaire
  157: 4, // Train/test split et baseline
  158: 3, // Métriques de régression
  159: 3, // Régression logistique (classification)
  160: 3, // Rapport de modèle
  162: 3, // Métriques de classification
  163: 3, // Arbres de décision
  164: 3, // Random forests
  165: 3, // Cross-validation
  166: 3, // Overfitting et régularisation
  167: 3, // Analyse d'erreurs qualitative
  169: 3, // Feature engineering
  170: 3, // Encodage et préprocessing
  171: 3, // Pipelines scikit-learn
  172: 3, // Clustering (k-means)
  173: 3, // Interprétabilité
  174: 3, // Consolidation ML + cadrage Projet 5
  176: 3, // Projet 5 — ChurnScope : EDA et baseline
  177: 4, // Projet 5 — Premiers modèles
  178: 3, // Projet 5 — Feature engineering
  179: 4, // Projet 5 — Optimisation et validation
  180: 3, // Projet 5 — Analyse d'erreurs et rapport
  181: 5, // Projet 5 — README, reproductibilité, démo
  183: 5, // Le neurone : de zéro en NumPy
  184: 4, // Descente de gradient
  185: 4, // PyTorch : tenseurs et autograd
  186: 4, // MLP : perceptron multicouche
  187: 4, // Entraînement sur données réelles
  188: 4, // Régularisation et diagnostic
  190: 4, // NLP : tokenisation
  191: 4, // Embeddings
  192: 4, // Attention
  193: 4, // Architecture transformer
  194: 4, // Classification de texte
  195: 4, // Note 'un LLM expliqué à un dev backend'
  197: 5, // Fonctionnement des LLM
  198: 4, // Appeler une API LLM
  199: 4, // Température et paramètres
  200: 4, // Tokens et coûts
  201: 4, // Hallucinations
  202: 4, // Banc d'essai LLM
  204: 4, // Prompt engineering sérieux
  205: 4, // Structured outputs
  206: 4, // Few-shot et patterns de prompts
  207: 4, // Function calling / tool use
  208: 4, // Intégration LLM dans une app
  209: 4, // Consolidation LLM + revue mensuelle 7
  211: 4, // Prompts en production
  212: 4, // Guardrails d'entrée/sortie
  213: 4, // Function calling avancé
  214: 4, // Le composant 'appel LLM robuste'
  215: 4, // Introduction au RAG : le pourquoi
  216: 4, // RAG : chunking
  218: 5, // RAG : embeddings
  219: 5, // RAG : recherche par similarité
  220: 5, // RAG : génération avec citations
  221: 5, // RAG : pipeline modulaire
  222: 5, // RAG : multi-formats (PDF, Markdown)
  223: 5, // RAG : robustesse et ré-ingestion
  225: 4, // DocQA v0 sur ton corpus
  226: 5, // Diagnostic des échecs de retrieval
  227: 5, // Décisions de conception du RAG
  228: 5, // Estimation de la taille de l'index
  229: 5, // Métadonnées et filtrage
  230: 4, // Consolidation RAG v1 + revue mensuelle 8
  232: 4, // Préparation Projet 6 : DocQA évalué
  233: 4, // Interface du RAG
  234: 5, // Gestion de session et historique
  235: 5, // Optimisation du prompt de génération
  236: 4, // Robustesse et cas limites
  237: 5, // Bilan RAG et préparation évaluation
  239: 4, // Vector DB : migration vers Chroma
  240: 4, // Chunking avancé : par structure
  241: 5, // Chunking : comparaison objective
  242: 5, // Versioning de l'index
  243: 4, // Embeddings : comparer les modèles
  244: 4, // Consolidation vector DB + chunking
  246: 4, // Recherche lexicale (BM25/FTS5)
  247: 5, // Hybrid search
  248: 4, // Reranking
  249: 4, // Tableau d'ablation
  250: 4, // Budget latence et optimisation
  251: 4, // Consolidation retrieval avancé
  253: 5, // Golden set : construction
  254: 4, // Évaluation du retrieval
  255: 4, // LLM-as-judge
  256: 4, // Métriques : fidélité, pertinence, exactitude
  257: 4, // Harnais d'évaluation automatisé
  258: 4, // Évaluer l'évaluateur
  260: 5, // Prompt injection : attaque
  261: 4, // Prompt injection : défense
  262: 4, // Citations vérifiables
  263: 4, // Le refus comme feature
  264: 3, // Suite de tests adverses
  265: 4, // Défense en profondeur : synthèse
  267: 5, // Projet 6 — DocQA : baseline chiffrée
  268: 5, // Projet 6 — Amélioration 1 pilotée
  269: 5, // Projet 6 — Amélioration 2 pilotée
  270: 5, // Projet 6 — Guardrails et robustesse
  271: 5, // Projet 6 — Rapport d'évaluation
  272: 5, // Projet 6 — README, ADR, démo
  274: 4, // Agent : la boucle de base
  275: 3, // Modes d'échec des agents
  276: 3, // Agent : cas d'usage utile
  277: 3, // Mémoire et état d'agent
  278: 3, // Agent vs workflow : les critères
  279: 4, // Consolidation agents
  281: 3, // Workflows explicites
  282: 3, // Les 4 patterns de workflow
  283: 3, // Orchestration
  284: 3, // Caching des appels LLM
  285: 3, // Coûts d'inférence : maîtrise
  286: 3, // Consolidation workflows
  288: 3, // Clean architecture
  289: 3, // Architecture hexagonale
  290: 5, // Event-driven et queues
  291: 5, // Monolithe modulaire vs microservices
  292: 3, // Design patterns dans ton code
  293: 4, // Exercice d'architecture
  295: 3, // OWASP pour applications LLM
  296: 4, // Privacy et données
  297: 4, // Observabilité d'une app IA
  298: 3, // Sécurité des secrets
  299: 3, // Threat model
  300: 3, // Consolidation sécurité + revue mensuelle 10
  302: 4, // DocSense : cadrage produit (SPEC)
  303: 5, // DocSense : architecture (ADRs)
  304: 4, // DocSense : modèle de données
  305: 3, // DocSense : maquettes et backlog
  306: 3, // DocSense : dérisquage (spikes)
  307: 5, // DocSense : setup et CI vide
  309: 5, // DocSense : ingestion multi-format
  310: 4, // DocSense : RAG core (architecture cible)
  311: 5, // DocSense : retrieval hybride
  312: 4, // DocSense : génération avec citations
  313: 4, // DocSense : spikes exécutés
  314: 4, // DocSense : jalon RAG bout-en-bout
  316: 5, // DocSense : golden set
  317: 5, // DocSense : harnais d'évaluation
  318: 4, // DocSense : dashboard qualité
  319: 5, // DocSense : baseline officielle
  320: 5, // DocSense : dockerisation
  321: 5, // DocSense : jalon évaluation et reproductibilité
  323: 3, // DocSense : workflow d'analyse
  324: 3, // DocSense : détection d'incohérences
  325: 5, // DocSense : coûts et observabilité
  326: 5, // DocSense : CI complète
  327: 3, // DocSense : tests du workflow LLM
  328: 3, // DocSense : jalon + revue mensuelle 11
  330: 4, // DocSense : guardrails testés
  331: 5, // DocSense : gestion d'erreur bout-en-bout
  332: 5, // DocSense : observabilité finale
  333: 3, // DocSense : couverture de tests
  334: 5, // DocSense : rapport qualité v1.0
  335: 4, // DocSense : feature freeze v1.0
  337: 3, // README DocSense exemplaire
  338: 3, // Démo vidéo de DocSense
  339: 3, // Storytelling des 7 projets
  340: 3, // Polish GitHub
  341: 3, // Schéma d'architecture 'spécial entretien'
  342: 3, // Relecture et cohérence du portfolio
  344: 4, // CV orienté preuves
  345: 4, // LinkedIn optimisé
  346: 3, // Ciblage : 30 entreprises
  347: 3, // Pitch 'parle-moi de toi'
  348: 3, // Analyse d'offres réelles
  349: 3, // Dossier de candidature
  351: 3, // Révision algo pour entretien
  352: 4, // Questions système et IA
  353: 3, // Simulation d'entretien technique
  354: 3, // Simulation d'entretien architecture
  355: 3, // Dossier d'entretien complet
  356: 3, // Négociation et questions au recruteur
  358: 4, // Candidatures : premier lot
  359: 3, // Entretien blanc technique + projet
  360: 4, // Candidatures : deuxième lot
  361: 3, // Entretien blanc archi + comportemental
  362: 3, // Bilan annuel
  363: 4, // Plan des 90 prochains jours
};
