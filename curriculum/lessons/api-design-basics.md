<!-- keep -->
# Leçon — Concevoir une API

## Pourquoi c'est important
Une API est un CONTRAT entre ton système et ses consommateurs (front, autres services, clients). Un bon contrat se devine sans documentation, survit aux évolutions et protège des erreurs ; un mauvais contrat se paie à chaque intégration, pour toujours (le changer casse les clients). Concevoir une API est un exercice d'EMPATHIE technique : penser comme celui qui l'utilisera — et c'est une question d'entretien récurrente (« design une API pour un blog »).

## Explication complète

### Le design AVANT le code
Le contrat s'écrit d'abord (endpoints, verbes, statuts, corps, erreurs) : coder puis documenter produit des APIs incohérentes ; PROMETTRE d'abord force la cohérence, et la collection Postman devient le vérificateur de la promesse.

### Les règles de conception REST
1. **Ressources = noms au pluriel** : `/livres`, `/livres/42`, `/livres/42/emprunts` (sous-ressource). Le verbe HTTP porte l'action — jamais l'URL.
2. **Statuts précis** : 201 + objet créé (POST), 204 (DELETE), 400 + détails (entrée invalide), 404 (absent), 409 (conflit métier : « déjà emprunté »). Le statut est de l'INFORMATION programmable.
3. **Cohérence absolue** : mêmes conventions de nommage, même format d'erreur, même pagination PARTOUT. La cohérence est plus précieuse que l'élégance locale.
4. **Format d'erreur unique** : `{ "error": { "message": "...", "details": [...] } }` — le client écrit UN gestionnaire d'erreurs, pas dix.
5. **Pagination, filtres, tri en query string** : `?page=2&limit=20&genre=sf&sort=-date`. Prévois la pagination DÈS le début (l'ajouter après casse les clients).

### La validation : la douane de l'API
Toute entrée est hostile jusqu'à validation : présence, type, bornes, format — à CHAQUE porte d'entrée. Le refus est utile : 400 avec la liste complète des problèmes (pas juste le premier). Et la validation vit à la frontière (middleware/début de route), pas éparpillée dans la logique.

### Les erreurs : centralisées, sans fuite
Un middleware d'erreurs final distingue :
- l'erreur **opérationnelle** (attendue) : ressource absente → 404, conflit → 409 — on informe précisément ;
- le **bug** (inattendu) : on logge les détails EN INTERNE, on répond un 500 générique. Les stack traces ne sortent JAMAIS (sécurité).

### L'évolution : penser au jour 2
Une API vit : nouveaux champs (ajout non cassant — les clients ignorent l'inconnu), champs supprimés/renommés (CASSANT → versionner `/v2` ou déprécier progressivement). Règle : être libéral sur ce qu'on accepte en plus, strict sur ce qu'on promet.

## Concepts clés
Contrat d'abord · ressources et sous-ressources · statuts sémantiques (dont 409) · format d'erreur uniforme · validation aux frontières · erreurs centralisées sans fuite · pagination/filtres/tri · idempotence · versionnement · moindre exposition (ne renvoyer que le nécessaire).

## Exemple
Design d'un endpoint d'emprunt (le cas intéressant : une ACTION métier, pas un simple CRUD) :
```
POST /loans          { bookId, memberId }
→ 201 + l'emprunt créé          (succès)
→ 400 + détails                  (entrée invalide)
→ 404                            (livre ou membre inconnu)
→ 409 + { error: "book_already_borrowed" }   (règle métier)
```
L'action est modélisée comme la CRÉATION d'une ressource « emprunt » — le pattern REST pour les verbes métier. Le retour : `POST /loans/42/return` (ou PATCH du statut) — les deux se défendent, la COHÉRENCE tranche.

## Pièges classiques
- Verbes dans les URLs (`/getLivres`, `/creerLivre`) : le contrat devient une liste de fonctions ad hoc.
- 400 pour tout (y compris les conflits métier → 409 et les absences → 404) : le client ne peut plus distinguer.
- Renvoyer l'objet interne complet (mot de passe hashé, champs techniques) : ne renvoyer QUE le nécessaire.
- Oublier la pagination sur les collections : la liste de 100 000 éléments finira par arriver.

## Lien avec l'IA / le futur
Tes systèmes IA SONT des APIs : DocQA expose `POST /questions`, DocSense `POST /documents/analyze`. Le function calling des LLM (mois 8) est... de la conception d'API : décrire précisément des outils (nom, paramètres, types) pour qu'un consommateur (le modèle !) les utilise correctement — les mêmes qualités de contrat s'appliquent. Et une API bien conçue est ce qui rend ton portfolio testable en 5 minutes par un recruteur.

## Mini-exercice
Conçois sur papier le contrat complet d'une API de blog : articles, commentaires, tags, brouillons vs publiés. Endpoints, verbes, statuts (y compris : commenter un article inexistant ? publier un brouillon déjà publié ?), format d'erreur, pagination. Puis fais-le critiquer (ou critique-le toi-même 24 h plus tard).

## Vocabulaire à retenir
**contrat** · **endpoint** · **ressource / sous-ressource** · **payload** · **validation** · **erreur opérationnelle vs bug** · **pagination** · **versionnement** · **rétrocompatibilité** · **moindre exposition**.

## Résumé
Une API se conçoit contrat d'abord : ressources nommées, verbes HTTP sémantiques, statuts précis, format d'erreur unique, validation à chaque porte, erreurs centralisées sans fuite interne, pagination prévue dès le début. La cohérence prime sur l'élégance, et chaque décision pense au consommateur — humain, service, ou modèle de langage.
