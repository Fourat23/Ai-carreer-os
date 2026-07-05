<!-- keep -->
# Projet 1 — TaskFlow CLI (gestionnaire de tâches en ligne de commande)

> **Mois 2 · Semaine 8** · Compétences : TypeScript, software engineering, autonomie.
> Ton premier vrai projet portfolio. Objectif : **livrer un outil complet et propre**, pas un jouet.

## 🎯 Objectif
Construire une application en ligne de commande, écrite en TypeScript, qui gère des tâches (CRUD complet) avec persistance sur fichier JSON, une bonne gestion d'erreurs, des tests, et un README exemplaire.

## Ce que le projet prouve à un recruteur
- Tu sais concevoir des **types** et une **interface** (inversion de dépendance via un `Store`).
- Tu structures ton code en **modules** à responsabilité unique.
- Tu gères les **erreurs** et les cas limites (pas seulement le chemin heureux).
- Tu **documentes** (README, ADR) et tu **testes**.
- Tu tiens un **historique Git** propre et progressif.

## Fonctionnalités
- `add "<titre>" [--priority high|med|low]` — ajoute une tâche.
- `list [--done|--pending] [--priority X]` — liste, filtrée et triée.
- `done <id>` / `undone <id>` — change le statut.
- `edit <id> --title "..." | --priority X` — modifie.
- `rm <id>` — supprime.
- `stats` — nombre de tâches par statut et par priorité.
- Toute erreur (id inconnu, arguments manquants, fichier corrompu) → message clair, jamais de stack trace.

## Stack
- TypeScript strict (aucun `any`).
- Node.js (exécution via `tsx` ou compilation `tsc`).
- Persistance : fichier JSON (`data/tasks.json`).
- Tests : `node:test` (natif, zéro dépendance) ou Vitest.

## Architecture (3 couches dans un petit projet)
```
src/
├── types.ts       # Task, Priority, Status, interface Store
├── store.ts       # JsonStore implements Store (toute la persistance ISOLÉE)
├── commands.ts    # logique métier PURE (add, done, filter, stats) — testable
├── cli.ts         # parsing des arguments + affichage (la coquille impure)
└── index.ts       # point d'entrée
```
**Règle clé :** `commands.ts` ne connaît pas les fichiers (il reçoit un `Store`).
Migrer vers SQLite plus tard = réécrire **uniquement** `store.ts`.

## Modèle de données
```ts
type Priority = 'high' | 'med' | 'low';
type Status = 'pending' | 'done';
interface Task {
  id: number;
  title: string;
  priority: Priority;
  status: Status;
  createdAt: string;   // ISO
}
interface Store {
  all(): Task[];
  save(tasks: Task[]): void;
}
```

## Critères de qualité
- [ ] Toutes les commandes fonctionnent, y compris les filtres combinés.
- [ ] `tsc` passe en strict, zéro `any` non justifié.
- [ ] Ids uniques même après suppressions (`max(ids)+1`, pas `length+1`).
- [ ] Erreurs gérées : id inconnu, fichier absent (1er lancement), JSON corrompu.
- [ ] Le style de mise à jour est **immuable** (pas de mutation des tâches).
- [ ] Code en modules à responsabilité unique.

## Tests attendus (minimum)
- `add` crée une tâche avec un id incrémenté et une date.
- `done` passe le statut à `done` sans muter l'original.
- `filter` par statut et priorité renvoie le bon sous-ensemble.
- `stats` compte correctement.
- Ids : après suppression de la tâche du milieu puis ajout, pas de doublon d'id.
- Un `Store` en mémoire (fake) permet de tester `commands.ts` sans fichiers.

## README attendu (structure)
1. Titre + une phrase de description.
2. Démo (capture ou copier-coller d'une session terminal).
3. Prérequis + installation (`npm install`).
4. Usage (chaque commande avec un exemple).
5. Architecture (le schéma des 3 couches + pourquoi).
6. Tests (`npm test`).
7. **Ce que j'ai appris** (3-5 puces honnêtes).

## Démo attendue
Une session terminal de 90 secondes : ajouter 3 tâches, en marquer une faite, filtrer, afficher les stats, tenter une commande invalide (montrer la gestion d'erreur).

## ADR n°1 (à écrire)
**« Pourquoi un fichier JSON plutôt que SQLite pour TaskFlow ? »**
Format d'ADR :
- **Contexte** : besoin de persistance pour un CLI mono-utilisateur.
- **Options** : JSON, SQLite, un service distant.
- **Décision** : JSON (simplicité, zéro dépendance, lisible/éditable à la main).
- **Conséquences** : pas de requêtes complexes ni de concurrence ; migration facile grâce à l'interface `Store`.
- **Quand je changerais d'avis** : gros volumes, requêtes analytiques, plusieurs processus.

## Erreurs à éviter
- Tout mettre dans `cli.ts` (logique + fichiers + affichage mélangés → intestable).
- `id = length + 1` (bug de doublon après suppression).
- Avaler les erreurs (`catch {}` vide).
- README bâclé — c'est la première chose qu'un recruteur voit.

## Extensions possibles (pour FUTURE.md, PAS maintenant)
- Dates d'échéance et tri par urgence. Tags. Export CSV. Sous-tâches. Migration SQLite (change seulement `store.ts` — c'est le test de ton architecture).
