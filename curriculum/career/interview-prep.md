<!-- keep -->
# Préparation aux entretiens

Guide de préparation aux 4 types d'entretien d'un poste IA appliqué junior. À travailler surtout en semaine 51, mais à commencer bien avant (les simulations mensuelles t'y préparent).

## Les 4 types d'entretien
1. **Technique (algo/code)** — résoudre un problème en direct.
2. **Technique projet** — présenter et défendre ton portfolio.
3. **Architecture / design système** — concevoir un système à voix haute.
4. **Comportemental** — motivation, collaboration, gestion des difficultés.

(Grilles d'auto-évaluation détaillées dans `rubrics/interview-evaluation.md`.)

## 1. Entretien technique : les classiques à maîtriser
Entraîne-toi **à voix haute**, avec la méthode (jour 19), 25 min max par exercice :
- Chaînes : inverser, palindrome, anagrammes, premier caractère unique, compter les occurrences.
- Tableaux : two-sum, fusion de tableaux triés, sous-tableau de somme max (fenêtre glissante), deuxième plus grand.
- Structures : parenthèses valides (stack), BFS/DFS d'un arbre, LRU cache.
- Récursion : sous-ensembles, permutations, parcours d'arbre.
- Recherche/tri : recherche binaire (de mémoire), comprendre les tris.
- Hachage : « as-tu déjà vu X ? » → réflexe Map/Set.

**Ce que le recruteur évalue** : la démarche à voix haute > la solution parfaite. Clarifie, donne des exemples, énonce la complexité, teste tes cas limites.

## 2. Entretien projet : raconter DocSense (et les autres)
Prépare pour **chaque** projet une fiche STAR :
- **Situation/Tâche** : quel problème, pour qui.
- **Action** : tes décisions clés (appuie-toi sur tes **ADRs**).
- **Résultat** : chiffré (éval, tests, perf).
- **Apprentissage** : un vrai obstacle et sa résolution.

Prépare ton **schéma d'architecture DocSense** (une slide, lisible en 30 s) qui amorce 5 questions que tu maîtrises. Entraîne le pitch de 5 min (enregistre-toi).

## 3. Entretien architecture : la méthode des 4 étapes
(Détaillée dans `methodology/how-to-design-architecture.md`.) Clarifier → composants/flux → trade-offs → échelle/défaillances. Entraîne-toi sur : « système d'analyse de contrats », « support client augmenté par IA », « recherche documentaire d'entreprise », « détection de fraude ». 45 min, schéma, à voix haute.

## 4. Les 20 questions IA les plus probables (prépare 2 min chacune)
1. Qu'est-ce qu'un token ? Pourquoi ça compte (coût, contexte) ?
2. Pourquoi un LLM hallucine-t-il ? (mécanisme, pas morale)
3. Que fait la température ? top-p ?
4. Qu'est-ce que le RAG et quand l'utiliser plutôt qu'un gros prompt ou un fine-tuning ?
5. Comment choisis-tu la taille des chunks ? l'overlap ?
6. Recherche vectorielle vs lexicale : différences, quand combiner ?
7. Qu'est-ce que le reranking et pourquoi après le retrieval ?
8. Comment évalues-tu un système RAG ? (golden set, LLM-as-judge, fidélité/pertinence)
9. Quels sont les biais du LLM-as-judge et comment les limiter ?
10. Ton RAG répond mal : comment débugges-tu ? (retrieval d'abord, génération ensuite)
11. Function calling / tool use : qui exécute quoi ?
12. Structured outputs : pourquoi « réponds en JSON » ne suffit pas ?
13. Agent vs workflow : comment choisis-tu ?
14. Qu'est-ce que la prompt injection (directe et indirecte) ? Comment défendre ?
15. Que ne faut-il jamais envoyer à une API LLM externe ? (privacy)
16. Comment estimes-tu et réduis-tu les coûts d'inférence ?
17. Comment testes-tu du code qui appelle un LLM ? (mock, replay, éval)
18. Embeddings : qu'est-ce que c'est, géométriquement ?
19. Explique un transformer en 2 minutes.
20. Comment mets-tu un système IA en production de façon fiable ? (guardrails, observabilité, monitoring de dérive)

## Questions techniques générales fréquentes
- « Que se passe-t-il quand tu tapes une URL ? » (DNS→TCP→TLS→HTTP)
- Différence processus/thread, synchrone/asynchrone.
- Comment empêches-tu l'injection SQL ? (requêtes paramétrées)
- Différence tests unitaires/intégration ; qu'est-ce qu'un mock ?
- Explique une décision d'architecture d'un de tes projets et son trade-off.

## Comportemental : les incontournables
- « Parle-moi de toi » (90 s, orienté IA, appris puis naturel).
- « Pourquoi l'IA / pourquoi ce poste ? » (récit cohérent, pas de buzzwords).
- « Parle-moi d'un échec / d'une difficulté » (STAR, apprentissage).
- « Une décision technique difficile » (montre le raisonnement par trade-offs).
- Prépare **3 questions à poser au recruteur** (équipe, stack, comment ils évaluent leurs systèmes IA).

## Le dossier d'entretien (à constituer semaine 51)
Un document unique : fiches projets, schéma DocSense, réponses aux 20 questions IA, questions à poser, fourchettes salariales, grille d'auto-évaluation. Relis-le avant chaque entretien.

## Les réflexes qui rassurent
- **Penser à voix haute** (le recruteur évalue le raisonnement).
- **« Je ne sais pas, mais voici comment je chercherais »** > bluffer.
- **Clarifier avant de foncer** (questions = maturité).
- **Connaître les limites** de tes projets (honnêteté = confiance).
- **Rester calme** : tu as fait des dizaines de simulations. L'entretien n'est qu'une simulation de plus.
