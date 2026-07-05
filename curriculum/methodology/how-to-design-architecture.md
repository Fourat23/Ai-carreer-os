<!-- keep -->
# Concevoir une architecture

L'entretien d'architecture (« conçois un système pour X ») fait peur parce qu'il est ouvert. Voici une méthode pour ne jamais être pris au dépourvu, et les concepts à maîtriser.

## La méthode en 4 étapes (à dérouler à voix haute)

### 1. Clarifier les besoins et contraintes
Ne conçois JAMAIS avant d'avoir posé des questions. Combien d'utilisateurs ? Quel volume de données ? Lecture ou écriture intensive ? Latence acceptable ? Budget ? Contraintes (privacy, local vs cloud) ? **Le hors-scope est aussi important que le scope.** Un bon candidat clarifie ; un mauvais fonce.

### 2. Définir les composants et le flux de données
Quels sont les grands blocs (client, API, base, cache, file, service LLM…) ? Comment une donnée circule-t-elle de bout en bout ? Dessine : des boîtes, des flèches, des légendes. Un schéma clair vaut mille mots et **structure la discussion**.

### 3. Choisir et JUSTIFIER par les trade-offs
Pour chaque décision (monolithe vs microservices, SQL vs NoSQL, synchrone vs file…), expose les **options** et choisis selon le contexte de l'étape 1. « Je prendrais un monolithe modulaire car le volume ne justifie pas la complexité des microservices » vaut dix fois mieux que « microservices parce que c'est moderne ».

### 4. Anticiper l'échelle et les défaillances
« Et avec 10× le trafic ? » → cache, réplicas, file d'attente, partitionnement. « Et si ce composant tombe ? » → résilience, dégradation gracieuse, retries. Aborde les **coûts** (un système IA coûte à l'inférence). Montrer que tu penses production impressionne.

## Les concepts à maîtriser

### Styles d'architecture
- **3-tiers** : présentation / logique / données. Le socle de toute app web.
- **MVC** : organise la présentation.
- **Clean architecture / hexagonale** : le cœur métier au centre, sans dépendance aux détails (UI, DB, API) ; ceux-ci branchés via des **ports/adapters**. Bénéfice : changer un détail = changer un adapter (testé au projet 6).
- **Monolithe modulaire** : un déploiement, des modules bien séparés. Le bon défaut pour la plupart des projets (dont DocSense).
- **Microservices** : services indépendants. Puissants mais **coûteux en complexité** (réseau, cohérence, ops). À justifier, pas à choisir par défaut.
- **Event-driven** : les composants réagissent à des événements. Découplage fort, mais raisonnement plus difficile.

### Briques transverses
- **Cache** : accélère les lectures. Deux problèmes durs : l'**invalidation** et le nommage.
- **Queue / file** : découple producteur et consommateur, absorbe les pics, permet le traitement asynchrone.
- **Auth / authz** : qui es-tu (authentification) vs as-tu le droit (autorisation).
- **Observabilité** : logs (événements), métriques (agrégats), traces (parcours d'une requête). Sans elle, on est aveugle en production.
- **Scalabilité** : verticale (machine plus grosse) vs horizontale (plus de machines) ; stateless pour scaler horizontalement.
- **Résilience** : timeouts, retries, circuit breakers, dégradation gracieuse.

### Design patterns et anti-patterns
- Patterns utiles (Strategy, Factory, Adapter, Observer…) : des solutions nommées à des problèmes récurrents. À appliquer **quand le problème existe**, pas par principe.
- Anti-patterns : sur-ingénierie (résoudre des problèmes qu'on n'a pas), god object, couplage fort, état global, « agent partout ».

## Spécificités d'une architecture IA
- Un **LLM n'est pas une base de données** : non-déterministe, faillible, latent, coûteux par appel, sujet à dérive. Ton code appelant doit valider, réessayer, mettre en cache, dégrader gracieusement.
- **RAG** quand la connaissance dépasse la fenêtre de contexte ou change souvent.
- **Workflow vs agent** : préfère un workflow explicite (prévisible, moins cher) sauf si l'adaptabilité de l'agent est vraiment nécessaire. Savoir dire « un workflow suffit ici » est un signal de maturité.
- **Évaluation** intégrée dès le début : un système IA sans mesure de qualité est un pari, pas un produit.
- **Sécurité IA** : prompt injection (directe et via documents), fuite de données via le contexte, excès d'autonomie des outils.

## L'exercice d'entraînement (hebdomadaire dès le mois 11)
Chaque semaine, prends un système (« analyse de contrats », « support client », « recherche documentaire ») et déroule les 4 étapes en 30-45 min, schéma à l'appui. Enregistre-toi. La fluidité vient de la répétition — le jour de l'entretien, tu auras déjà conçu vingt systèmes.

## Le réflexe qui fait la différence
Il n'y a pas de « bonne » architecture dans l'absolu, seulement une architecture **adaptée à des contraintes**. Le recruteur n'évalue pas si tu connais la réponse (il n'y en a pas) : il évalue si tu **raisonnes** — clarifier, structurer, arbitrer, anticiper. C'est une compétence qui s'entraîne.
