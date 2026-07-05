<!-- keep -->
# Leçon — Architecture logicielle : les bases

## Pourquoi c'est important
L'architecture est l'art d'organiser un système pour qu'il reste MODIFIABLE : les besoins changent, les technologies changent, l'équipe change — seul un système bien découpé survit à bas coût. C'est aussi l'entretien décisif des rôles AI Engineer (« conçois un système d'analyse de documents ») : on n'y évalue pas une bonne réponse (il n'y en a pas) mais un RAISONNEMENT — clarifier, structurer, arbitrer.

## Explication complète

### L'idée maîtresse : isoler ce qui change pour des raisons différentes
Tout le reste en découle. L'UI change pour des raisons d'ergonomie, les règles métier pour des raisons business, le stockage pour des raisons techniques : les mélanger, c'est payer chaque changement au triple. Les découpages classiques sont des façons de plus en plus raffinées d'appliquer cette idée.

### Les découpages fondamentaux
- **3-tiers** : présentation / logique métier / données. Chaque couche ne parle qu'à sa voisine. C'est ton front → API → SQLite depuis le mois 3.
- **MVC** organise la présentation : Modèle (données + logique), Vue (rendu), Contrôleur (orchestration des actions). Tes routes Express sont des contrôleurs.
- **Clean / hexagonale (ports & adapters)** : le CŒUR métier au centre, sans dépendance à rien de concret ; les détails (UI, DB, LLM, vector store) branchés via des **ports** (interfaces) et des **adapters** (implémentations). Le test de vérité : « changer de base de données = changer UN fichier ». Ton interface `Store` du projet 1 en était le germe.
- **Monolithe modulaire** : UN déploiement, des modules à frontières nettes dedans. Le bon défaut pour 90 % des projets — dont DocSense.
- **Microservices** : des services déployés indépendamment. Puissants (équipes autonomes, scaling ciblé) mais au prix ÉLEVÉ du distribué : réseau faillible, cohérence difficile, observabilité complexe. À justifier, jamais par défaut.
- **Event-driven** : les composants réagissent à des ÉVÉNEMENTS via un bus/broker. Découplage maximal (l'émetteur ignore les consommateurs), raisonnement plus dur (qui a traité quoi, quand ?).

### Les briques transverses
- **Queue** : découple producteur et consommateur, absorbe les pics, permet l'asynchrone (« traite ces 500 documents quand tu peux »).
- **Cache** : échange de la fraîcheur contre de la vitesse. Ses deux problèmes DIFFICILES : l'invalidation, le nommage.
- **Auth / authz** : QUI es-tu (authentification) / QU'AS-TU le droit de faire (autorisation) — deux questions distinctes.
- **Observabilité** : logs (événements), métriques (agrégats), traces (le parcours d'UNE requête via un correlation id). Sans elle, la production est une boîte noire.
- **Résilience** : timeouts, retries (sur les opérations idempotentes !), circuit breakers, dégradation gracieuse — le réseau ÉCHOUE, le design doit le prévoir.
- **Scalabilité** : verticale (machine plus grosse) vs horizontale (plus de machines — exige du stateless).

### La méthode de conception (l'entretien en 4 étapes)
1. **Clarifier** : volumes, latence acceptable, budget, contraintes — et le HORS-SCOPE. Concevoir sans questions est éliminatoire.
2. **Composants + flux de données** : des boîtes, des flèches, une légende. Le schéma structure la discussion.
3. **Choisir en TRADE-OFFS** : « monolithe modulaire ici, car le volume ne justifie pas le coût du distribué » vaut dix fois « microservices parce que c'est moderne ».
4. **Échelle et pannes** : « et à 10× le trafic ? et si ce composant tombe ? combien ça coûte ? ».

## Concepts clés
Couplage / cohésion · frontière / interface · inversion de dépendance · 3-tiers, MVC, hexagonal, monolithe modulaire, microservices, event-driven · queue, cache, auth/authz · observabilité (logs/métriques/traces) · résilience · stateless · trade-off · ADR (Architecture Decision Record : contexte, options, décision, conséquences).

## Exemple
Le MÊME besoin (« analyser des documents uploadés ») en trois architectures :
- **Monolithe modulaire** : une app, modules ingestion/analyse/restitution — simple, déployable en un `docker compose up`. ✅ pour un produit local ou une petite équipe.
- **Microservices** : service d'ingestion + service d'analyse + service de restitution — justifiable si des équipes séparées scalent indépendamment. Coût : réseau, contrats, ops.
- **Event-driven** : l'upload émet `document.recu`, des workers consomment — absorbe des pics massifs, mais le suivi d'un document exige des traces sérieuses.
La bonne réponse dépend des CONTRAINTES — savoir le dire est la compétence.

## Pièges classiques
- Choisir l'architecture à la mode plutôt qu'adaptée (microservices pour un projet solo).
- Frontières floues : tout importe tout → un monolithe modulaire devient un plat de spaghettis.
- Ignorer les pannes : tout design qui suppose « le réseau marche » est faux.
- Ne pas documenter les décisions : sans ADR, l'équipe re-débat tout, tous les six mois.

## Lien avec l'IA / le futur
Un système RAG EST une architecture : ingestion (pipeline), index (stockage spécialisé), retrieval (service), génération (dépendance externe faillible et coûteuse), évaluation (observabilité qualité). DocSense (mois 11) appliquera l'hexagonal pour rendre LLM et vector DB remplaçables — et ton entretien design système portera très probablement sur « un système IA pour analyser X » : cette leçon est ta grille de réponse.

## Mini-exercice
Déroule les 4 étapes (45 min, schéma papier) sur : « un système qui reçoit 10 000 documents/jour, les analyse par LLM et alerte sur les anomalies ». Impose-toi : 3 questions de clarification écrites, un schéma légendé, 2 trade-offs explicites, un paragraphe « à 10× le volume ».

## Vocabulaire à retenir
**couplage / cohésion** · **port / adapter** · **inversion de dépendance** · **monolithe modulaire** · **event-driven / broker** · **idempotence** · **circuit breaker** · **correlation id** · **stateless** · **ADR** · **C4** (niveaux de schémas).

## Résumé
Architecturer = isoler ce qui change pour des raisons différentes, derrière des frontières explicites : couches (3-tiers), cœur + ports/adapters (hexagonal), modules (monolithe modulaire), services (microservices) ou événements (event-driven) — chaque style étant un trade-off, pas un dogme. Les briques transverses (queues, cache, observabilité, résilience) complètent le vocabulaire. En entretien comme en projet : clarifier → schématiser → arbitrer → anticiper l'échelle et les pannes.
