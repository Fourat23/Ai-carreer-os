<!-- keep -->
# Projet 3 — BiblioApp (application full-stack)

> **Mois 4 · Semaine 17** · Compétences : React/TypeScript, full-stack, tests.
> Une application complète que tu comprends **de bout en bout** et que tu peux présenter en entretien.

## 🎯 Objectif
Construire le front React (TypeScript) de la bibliothèque, branché sur **ton** API du projet 2 : CRUD complet, recherche, états soignés, tests. Une vraie application full-stack.

## Ce que le projet prouve
- Tu construis une **UI React** propre (composants, état, effets).
- Tu maîtrises le **cycle de données async** (loading/error/data).
- Tu comprends l'**architecture 3-tiers** concrète (front / API / DB).
- Tu **testes** la logique et les composants.
- Tu sais **présenter** un projet full-stack.

## Fonctionnalités
- Liste des livres avec recherche et filtres.
- Page détail d'un livre.
- Ajout / édition / suppression (formulaires validés).
- Emprunter / rendre depuis l'UI.
- États soignés partout : chargement, erreur, liste vide.

## Stack
- Vite + React + TypeScript.
- Un module `api.ts` unique et typé (tous les appels réseau).
- Tests : Vitest + Testing Library.
- Back : LivreAPI (projet 2).

## Architecture
```
src/
├── api/api.ts            # tous les appels réseau, typés, gestion d'erreur commune
├── components/           # composants réutilisables (BookCard, SearchBar, ...)
├── pages/                # BookList, BookDetail, BookForm
├── hooks/                # useFetch, useBooks...
├── types.ts             # types partagés (idéalement dérivés du contrat d'API)
└── App.tsx
```
**3-tiers :** navigateur (React) → API (Express) → base (SQLite). Chaque couche testable et remplaçable.

## Critères de qualité
- [ ] Chaque appel réseau gère loading / error / data explicitement.
- [ ] Aucun `fetch` hors du module `api.ts`.
- [ ] State **immuable** (aucune mutation).
- [ ] États edge soignés (liste vide, erreur réseau, chargement).
- [ ] Aucun warning React en console.
- [ ] Tests sur la logique + composants critiques.

## Tests attendus
- Logique de filtrage/recherche (pure).
- Rendu et interaction d'un composant clé (ajout d'un livre).
- Un test d'intégration : formulaire → API mockée → mise à jour de la liste.

## README attendu
Description · **GIF de démo** · install (`npm install && npm run dev`) · **schéma d'architecture 3-tiers** · comment lancer front + back · tests · ce que j'ai appris.

## Démo attendue
GIF ou vidéo : rechercher un livre, l'ouvrir, l'éditer, l'emprunter, voir la liste se mettre à jour.

## ADR n°3 (à écrire)
**« État global (Context) vs état local + props pour BiblioApp »** — décision, justification, signe qu'il faudrait changer d'approche.

## Erreurs à éviter
- `useEffect` mal maîtrisé (dépendances, double appel StrictMode).
- Muter le state (React ne détecte rien).
- Fetch dupliqué dans plusieurs composants.
- États edge négligés (liste vide = page blanche).

## Extensions possibles (FUTURE.md)
Authentification UI, pagination infinie, mode sombre, optimistic updates, tests e2e (Playwright).
