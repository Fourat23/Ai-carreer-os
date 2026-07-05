<!-- keep -->
# Leçon — HTTP, REST et JSON

## Pourquoi c'est important
HTTP est la langue du web : chaque page, chaque API, chaque appel à un LLM est une requête HTTP. Comprendre ce qui circule VRAIMENT (et pas juste « ça marche dans Postman ») te permet de concevoir, débugger et sécuriser n'importe quelle intégration. « Que se passe-t-il quand tu tapes une URL ? » est la question d'entretien système la plus posée au monde.

## Explication complète

### Le modèle : requête → réponse, sans mémoire
HTTP est un protocole TEXTE, **sans état** : le client envoie une requête complète et autonome (méthode + URL + headers + corps éventuel), le serveur renvoie une réponse (statut + headers + corps), et OUBLIE tout. Chaque requête repart de zéro — c'est ce qui rend le web scalable (n'importe quel serveur peut répondre) et c'est pourquoi l'authentification doit être RÉPÉTÉE à chaque requête (le token dans un header).

### Sous le capot : le trajet complet
1. **DNS** : traduire `api.example.com` en adresse IP (un annuaire distribué, avec caches).
2. **TCP** : établir une connexion fiable (handshake en 3 temps).
3. **TLS** : chiffrer le canal (HTTPS = HTTP dans TLS) — confidentialité + intégrité + identité du serveur (certificats).
4. **HTTP** : enfin, la requête et la réponse.
Chaque étape coûte des allers-retours réseau : c'est la LATENCE (incompressible, liée à la distance), à distinguer de la bande passante (le débit).

### Les méthodes portent un sens
`GET` lit (JAMAIS de modification), `POST` crée, `PUT` remplace, `PATCH` modifie partiellement, `DELETE` supprime. GET/PUT/DELETE sont **idempotentes** : les rejouer ne change rien de plus — propriété cruciale pour les retries automatiques (un réseau instable rejoue sans risque une requête idempotente, jamais un POST).

### Les statuts : un langage à 3 chiffres
- **2xx** succès : 200 OK, 201 créé (avec l'objet créé), 204 sans contenu (après DELETE).
- **3xx** redirection.
- **4xx** faute du CLIENT : 400 requête invalide (avec les détails), 401 non authentifié, 403 authentifié mais interdit, 404 introuvable, 409 conflit (règle métier violée).
- **5xx** faute du SERVEUR : 500 = « on a un bug » (sans jamais fuiter les détails internes).
Choisir le bon statut EST de la conception : le client programme ses réactions dessus.

### REST : organiser l'API en ressources
REST modélise l'API en **ressources** nommées (des noms au pluriel) manipulées par les verbes HTTP : `GET /livres`, `POST /livres`, `GET /livres/42`, `DELETE /livres/42`, `GET /livres/42/emprunts`. Règle d'or : l'URL dit QUOI, le verbe dit COMMENT — jamais de verbe dans l'URL (`/getLivres` est un anti-pattern). Une bonne API REST est PRÉVISIBLE : on la devine sans documentation. Filtres, pagination, recherche passent en query string (`?page=2&genre=sf`).

### JSON : le format d'échange universel
JSON (JavaScript Object Notation) transporte des données structurées en texte : objets `{}`, tableaux `[]`, strings, nombres, booléens, null. `JSON.stringify` sérialise, `JSON.parse` désérialise — et peut ÉCHOUER (toujours dans un try/catch aux frontières). Limites à connaître : pas de dates (des strings ISO), pas de fonctions, pas de commentaires.

## Concepts clés
Requête/réponse · sans état · headers (Content-Type, Authorization) · méthodes et idempotence · statuts par famille · DNS → TCP → TLS → HTTP · latence vs bande passante · ressources REST · query string · sérialisation JSON.

## Exemple
```bash
curl -i -X POST https://api.example.com/livres \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"titre": "Dune", "auteurId": 3}'
# ← HTTP/1.1 201 Created  +  le livre créé avec son id
```
Chaque morceau est nommable : méthode, URL de collection, deux headers, corps JSON, statut de création.

## Pièges classiques
- Tout répondre en 200 (même les erreurs) : le client ne peut plus réagir correctement.
- Confondre 401 (qui es-tu ?) et 403 (je sais qui tu es, c'est non).
- Un GET qui modifie l'état : les robots, caches et préchargements vont le déclencher.
- Secret dans l'URL : les URLs sont loggées partout — les secrets vont dans les headers.

## Lien avec l'IA / le futur
Appeler un LLM (mois 8), c'est LITTÉRALEMENT ceci : un POST avec un header d'auth et un corps JSON, un statut à vérifier, un corps à parser prudemment. Ton RAG est une API qui appelle des APIs. Le streaming des réponses LLM est du HTTP qui envoie le corps par morceaux. Maîtriser cette leçon = ne jamais subir un SDK comme une boîte noire.

## Mini-exercice
Avec curl uniquement : GET une API publique, provoque un 404, un 400 (corps invalide), suis une redirection (-L), affiche les headers (-i). Note pour chaque réponse : statut, 2 headers intéressants, forme du corps.

## Vocabulaire à retenir
**sans état** · **header** · **corps (body)** · **idempotence** · **statut** · **ressource** · **collection** · **query string** · **sérialisation** · **latence** · **TLS / certificat**.

## Résumé
HTTP : des requêtes autonomes (méthode + URL + headers + corps) et des réponses (statut + corps), sans mémoire entre elles, transportées sur DNS + TCP + TLS. Les méthodes et statuts portent une sémantique précise qui EST le contrat. REST organise l'API en ressources prévisibles ; JSON transporte les données. Tout ton avenir (APIs, apps LLM, RAG, webhooks) parle cette langue.
