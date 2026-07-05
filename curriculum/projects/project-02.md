<!-- keep -->
# Projet 2 — LivreAPI (API REST de bibliothèque + collection Postman)

> **Mois 3 · Semaine 13** · Compétences : HTTP/API, SQL, software engineering.
> Une API qu'un recruteur peut **cloner, lancer et tester en 5 minutes** avec ta collection Postman.

## 🎯 Objectif
Concevoir et implémenter une API REST complète (Node/Express + SQLite) pour gérer une bibliothèque : livres, auteurs, membres, emprunts — avec validation, gestion d'erreurs, sécurité de base et une collection Postman de tests automatisés.

## Ce que le projet prouve
- Tu conçois une **API REST cohérente** (ressources, verbes, statuts corrects).
- Tu maîtrises **SQL** (schéma normalisé, JOIN, requêtes paramétrées).
- Tu **valides** les entrées et gères les erreurs proprement (jamais de crash ni de fuite).
- Tu **testes** une API (Postman + tests d'intégration).
- Tu **documentes** de façon exploitable.

## Fonctionnalités
- CRUD livres, auteurs, membres.
- Emprunter / rendre un livre (règle métier : un livre disponible ne peut être emprunté qu'une fois).
- Recherche de livres (par titre / auteur), pagination, filtres (disponible, genre).
- Auth par token sur les routes d'écriture.
- Statuts HTTP corrects partout (200/201/204/400/401/404/409/500).

## Stack
- Node.js + Express + TypeScript.
- SQLite (`better-sqlite3` ou `node:sqlite`), requêtes **paramétrées** partout.
- Postman pour la collection de tests.
- Tests d'intégration : `node:test` + `fetch` (ou `supertest`).

## Architecture (3 couches)
```
src/
├── db/
│   ├── schema.sql        # tables + clés, versionné
│   └── connection.ts     # connexion SQLite
├── data/                 # couche accès données (requêtes paramétrées)
│   ├── books.ts
│   ├── loans.ts
│   └── ...
├── services/             # logique métier (règles d'emprunt)
├── routes/               # endpoints Express (HTTP uniquement)
├── middleware/           # auth, logs, erreurs, validation
└── app.ts
```

## Modèle de données
```sql
CREATE TABLE authors (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL
);
CREATE TABLE books (
  id INTEGER PRIMARY KEY, title TEXT NOT NULL,
  author_id INTEGER NOT NULL REFERENCES authors(id),
  genre TEXT, available INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE members (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL
);
CREATE TABLE loans (
  id INTEGER PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES books(id),
  member_id INTEGER NOT NULL REFERENCES members(id),
  borrowed_at TEXT NOT NULL, returned_at TEXT
);
CREATE INDEX idx_books_author ON books(author_id);
CREATE INDEX idx_loans_book ON loans(book_id);
```

## Contrat d'API (extrait)
| Méthode | URL | Corps | Succès | Erreurs |
|---|---|---|---|---|
| GET | /books?search=&genre=&page= | — | 200 liste | — |
| GET | /books/:id | — | 200 | 404 |
| POST | /books | {title, authorId, genre} | 201 | 400, 401 |
| PUT | /books/:id | {…} | 200 | 400, 401, 404 |
| DELETE | /books/:id | — | 204 | 401, 404 |
| POST | /loans | {bookId, memberId} | 201 | 400, 401, 404, **409** (déjà emprunté) |
| POST | /loans/:id/return | — | 200 | 401, 404 |

## Critères de qualité
- [ ] Statuts HTTP corrects (dont **409** pour un emprunt en conflit).
- [ ] **Aucune** concaténation de SQL (100 % paramétré).
- [ ] Validation de toutes les entrées, erreurs 400 détaillées.
- [ ] Middleware d'erreurs centralisé, aucun crash, aucune fuite de stack trace.
- [ ] Auth token sur les écritures, secrets en `.env`.
- [ ] Schéma versionné (`schema.sql`), base reconstructible.

## Tests attendus
- Collection Postman : chaque endpoint, avec tests (statut + schéma de réponse + cas d'erreur), variables d'environnement, un scénario create→borrow→return→delete.
- Tests d'intégration sur base isolée : règles d'emprunt (double emprunt refusé → 409), validation, 404.

## README attendu
Description · démo (import de la collection) · install · **lancement en 5 minutes** · endpoints documentés · schéma d'architecture · comment lancer les tests · ce que j'ai appris.

## Démo attendue
Vidéo 2 min : importer la collection Postman, lancer le scénario complet, montrer un cas d'erreur (double emprunt → 409).

## ADR n°2 (à écrire)
**« Validation à la main vs librairie de validation (zod, etc.) »** — contexte, options, décision pour ce projet, à partir de quand tu changerais.

## Erreurs à éviter
- Statuts incorrects (200 pour tout, ou 400 au lieu de 409 pour un conflit métier).
- Logique métier dans les routes (intestable).
- Validation à une seule porte d'entrée (oubli d'une autre).
- Collection Postman non exportée/versionnée.

## Extensions possibles (FUTURE.md)
Réservations, historique par membre, rappels d'échéance, rôles (admin/membre), rate limiting, OpenAPI/Swagger.
