# PLAN — AI Career OS

Plateforme locale d'apprentissage sur 12 mois pour devenir employable sur des rôles IA applicative
(AI Engineer junior+, LLM/RAG Engineer junior, AI Product Engineer, Full-stack orienté IA).

## 1. Architecture technique

```
ai-career-os/
├── app/                    # Next.js App Router (UI + API)
│   ├── layout.tsx          # Layout global + sidebar
│   ├── page.tsx            # Dashboard
│   ├── calendar/           # Planning 12 mois → semaines → jours
│   ├── day/[id]/           # Vue Jour (théorie, exercice, correction, quiz, auto-éval)
│   ├── week/[id]/          # Vue Semaine (revue hebdo)
│   ├── month/[id]/         # Vue Mois (revue mensuelle)
│   ├── projects/           # Vue Projets portfolio
│   ├── skills/             # Vue Compétences (grille 0-5, 20 compétences)
│   ├── resources/          # Vue Ressources
│   ├── notes/              # Vue Notes (agrégées depuis les jours)
│   ├── reviews/            # Vue Évaluations (hebdo + mensuelles)
│   ├── career/             # Vue Carrière
│   └── api/progress/       # GET/POST progression (fichier JSON)
├── lib/                    # Lecture contenu, calculs progression, types
├── curriculum/             # TOUT le contenu pédagogique (Markdown, éditable)
│   ├── year-overview.md
│   ├── month-01.md … month-12.md
│   ├── week-01.md … week-52.md
│   ├── days/day-001.md … day-365.md
│   ├── solutions/day-001-solution.md … day-365-solution.md
│   ├── projects/project-01.md … project-06.md, project-final.md
│   ├── rubrics/  (skills-scorecard, monthly-evaluation, interview-evaluation)
│   ├── resources/resources.md
│   ├── career/   (cv-linkedin-strategy, interview-prep)
│   └── methodology/ (how-to-learn, how-to-use-ai-without-dependency,
│                     how-to-debug, how-to-think-like-an-engineer,
│                     how-to-design-architecture)
├── scripts/
│   ├── generate-curriculum.mjs   # Génère jours/semaines/mois + data/program.json
│   └── data/                     # SOURCE DE VÉRITÉ du programme (JS structuré)
│       ├── program-structure.mjs # 12 mois, 52 semaines : thèmes, projets, revues
│       ├── days-detailed.mjs     # Jours 1-30 : contenu très détaillé (horaire, quiz…)
│       ├── days-core.mjs         # Jours 31-90 : contenu complet
│       └── days-plan.mjs         # Jours 91-365 : plan actionnable par jour
├── data/
│   ├── program.json        # Index généré (méta de chaque jour/semaine/mois)
│   └── progress.json       # Progression utilisateur (écrit par l'app)
└── tests/                  # node --test (zéro dépendance de test)
```

## 2. Stack et compromis

| Choix | Décision | Pourquoi |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | Un seul process pour UI + API fichiers ; `npm run dev` suffit |
| Rendu Markdown | **marked** (1 dépendance, zéro sous-dépendance) | Fiable, léger ; app 100 % locale donc pas de besoin de sanitisation externe |
| Stockage contenu | **Markdown dans `curriculum/`** | Lisible et modifiable à la main, versionnable |
| Stockage progression | **`data/progress.json` via API route** | Survit au navigateur (contrairement à localStorage), zéro base à installer |
| Source du programme | **Fichiers de données JS + générateur** | 365 jours × 2 fichiers = ~800 fichiers ; générés depuis une source unique éditable, régénérables via `npm run generate` |
| Tests | **node:test natif** | Zéro dépendance ; `npm test` |
| Pas de | auth, cloud, ORM, Tailwind, UI kit | Inutiles pour un usage solo local ; CSS global simple |

## 3. Format des données

- **Contenu pédagogique** : Markdown pur, un fichier par jour/semaine/mois/projet.
  Modifiable directement, OU en modifiant `scripts/data/*.mjs` puis `npm run generate`
  (le générateur ne réécrit PAS les fichiers marqués `<!-- keep -->` en première ligne).
- **`data/program.json`** : index généré — pour chaque jour : titre, mois, semaine,
  compétence, difficulté, durée, livrable. Sert au dashboard/calendrier sans parser 365 MD.
- **`data/progress.json`** : `{ startDate, days: { "1": { status, selfScore, answer,
  notes, checklist } }, skills: { algo: 2, ... }, weeklyReviews, monthlyReviews }`.

## 4. Découpage du programme (12 mois, 6 j/sem + jour 7 = revue hebdo, 4-5 h/j)

| Mois | Thème | Projet |
|---|---|---|
| 1 | Fondations : terminal, Git, JS, algorithmie de base | — |
| 2 | Algorithmie + structures de données, TypeScript, POO/FP | **P1 : Fondations algo (CLI TaskFlow)** |
| 3 | HTTP, REST, JSON, Postman, Node/Express, SQL de base | **P2 : API + Postman** |
| 4 | Frontend React, full-stack, tests, clean code | **P3 : App full-stack** |
| 5 | Python, SQL avancé, data, ETL, pipelines | **P4 : Data/SQL + dashboard** |
| 6 | Stats, ML classique, scikit-learn, métriques | **P5 : ML classique** |
| 7 | Deep learning, réseaux de neurones, transformers, fonctionnement des LLM | — |
| 8 | LLM apps : prompts sérieux, structured outputs, function calling, RAG v1 | P6 (début) |
| 9 | RAG avancé : chunking, embeddings, reranking, évaluation LLM | **P6 : App RAG/LLM** |
| 10 | Agents, workflows, guardrails, sécurité IA, architecture avancée | — |
| 11 | **Projet final (build)** + Docker, CI, observabilité | Projet final |
| 12 | **Projet final (éval, docs, polish)** + carrière, CV, entretiens | Projet final |

**Projet final choisi : « DocSense » — assistant d'analyse documentaire technique avec
pipeline RAG évalué et dashboard qualité.** Justification : la Q&A sur corpus documentaire
privé est LE cas d'usage entreprise n°1 des LLM ; y ajouter évaluation chiffrée, guardrails
et dashboard qualité est exactement ce qui distingue un candidat d'un « prompt engineer ».

## 5. Ce qui est généré automatiquement vs rédigé

- **Rédigé en détail (source riche)** : jours 1-30 (horaire, théorie, exercice, quiz,
  correction expliquée, livrable, erreurs fréquentes, consignes anti-IA), mois 1-12,
  projets 1-6 + final, rubriques, méthodologie, carrière, ressources, year-overview.
- **Rédigé en version complète** : jours 31-90 (objectif, concepts, exercice concret,
  livrable, correction guidée).
- **Généré depuis un plan actionnable** : jours 91-365 (chaque jour a quand même un
  sujet précis, un exercice concret et un livrable définis dans `days-plan.mjs`) ;
  semaines 1-52 et solutions correspondantes.

## 6. Compromis assumés

1. Les jours 91-365 sont moins verbeux que les jours 1-30 : c'est voulu (autonomie
   croissante) et corrigeable en éditant `scripts/data/days-plan.mjs` puis `npm run generate`.
2. Pas de SQLite : un JSON suffit pour un utilisateur unique ; migration facile plus tard.
3. Les scores de compétences sont déclaratifs (auto-évaluation guidée par rubrique),
   pas calculés par un correcteur automatique — honnête pour un outil solo.
4. Design volontairement sobre : sidebar + pages denses, lisibilité avant esthétique.

## 7. Ordre d'implémentation

1. PLAN.md (ce fichier) → 2. scaffold Next.js + deps → 3. données du programme
→ 4. générateur + génération → 5. contenus rédigés (projets, rubriques, méthodo, carrière)
→ 6. UI (dashboard, calendrier, jour, semaine, compétences…) → 7. tests → 8. README
→ 9. vérifications (build, jour 1, mois 1, corrections) → 10. FINAL_REPORT.md.
