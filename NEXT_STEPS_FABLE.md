# NEXT_STEPS_FABLE — plan de qualité des 365 jours

Fichier de pilotage du chantier « rendre les 365 jours réellement qualitatifs ».
Mis à jour à chaque batch. **Reprends toujours ce fichier en premier.**

---

## Batch 0 — Audit initial (FAIT)

### État mesuré (au démarrage du chantier)
| Élément | Valeur |
|---|---|
| Jours | 365/365 |
| Corrections | 365/365 (313 détaillées + 52 grilles de revue) |
| Semaines / Mois | 52 / 12 |
| Leçons de fond | **21** (cible : ≥ 60) |

### Qualité moyenne par tranche (mots/jour, jours de travail)
| Tranche | Jours travail | Moy. mots | Exemple guidé | Vraie question d'entretien | Théorie inline |
|---|---|---|---|---|---|
| 1-30 | 26 | **1263** | 26/26 ✅ | oui (quiz + oral) | riche ✅ |
| 31-90 | 52 | 565 | **0/52** ❌ | non (bloc générique) | correcte |
| 91-180 | 77 | 366 | **0/77** ❌ | non | **mince** (surtout liens leçons) |
| 181-270 | 77 | 366 | **0/77** ❌ | non | **mince** |
| 271-365 | 81 | 358 | **0/81** ❌ | non | **mince** |

> Note : « entretien » est cité partout mais via le bloc générique « Pourquoi ça comptera plus tard » — **ce ne sont pas de vraies questions d'entretien** hors jours 1-30.

### Zones faibles identifiées
- **Z1 — Jours 31-90** : pas d'exemple guidé ; pas de vraie question d'entretien ; théorie à approfondir.
- **Z2 — Jours 91-365 (235 jours)** : théorie inline mince (~360 mots), pas d'exemple guidé, pas de vraie question d'entretien, pas de cas métier explicite pour les jours IA. C'est la plus grosse zone à traiter.
- **Z3 — Leçons** : seulement 21 (cible ≥ 60) ; structure à étendre (modèle mental, exemple appliqué IA, anti-patterns, exercice difficile + correction, questions d'entretien, checklist « quand je suis prêt », vocabulaire).
- **Z4 — Maintenabilité** : `curriculum/AUTHORING_GUIDE.md`, `curriculum/templates/*`, `prompts/*` ABSENTS.
- **Z5 — Scripts** : n'imposent pas ≥ 60 leçons, structure des leçons, exemple guidé hors 1-30, question d'entretien + cas métier pour jours IA, détection de vague/trop court.

### Architecture (rappel pour la suite)
Les jours sont **générés** depuis `scripts/data/*.mjs` par `scripts/generate-curriculum.mjs`.
- Jours 1-15 / 16-30 : `days-01-15.mjs`, `days-16-30.mjs` (riches) + `days-01-30-guided.mjs` (exemples guidés).
- Jours 31-90 : `days-31-90.mjs` + `days-31-90-extras.mjs` (théorie/critères).
- Jours 91-365 : `days-plan.mjs` (WEEK_PLANS, 1 entrée/semaine × 6 jours) + `lessons-map.mjs`.
- **Levier clé** : enrichir les leçons + faire injecter par le générateur (exemple guidé, cas métier, question d'entretien) depuis des données par jour ou par compétence améliore massivement 91-365 sans réécrire 275 fichiers à la main.

---

## Plan des batchs

### Batch 1 — Bibliothèque de leçons (→ ≥ 60 leçons)
Enrichir la structure des leçons (nouveau gabarit) et en ajouter ~40 réparties par catégorie
(fondations, JS/TS, algo/DS, web/API/backend, data/SQL, SE/archi, Python/ML/DL,
LLM/RAG/agents/éval/sécurité, DevOps/cloud/prod, portfolio/carrière).
Gabarit : objectif · modèle mental · explication · exemple simple · exemple guidé ·
exemple appliqué IA/data/archi · erreurs fréquentes · anti-patterns · mini-exercice ·
exercice difficile · correction · questions d'entretien · à retenir · vocabulaire ·
checklist « quand je suis prêt » · liens programme.

### Batch 2 — Qualité jours 1-90
Exemples guidés pour 31-90 ; théorie approfondie ; corrections plus explicatives ;
liens vers les bonnes leçons ; vraies questions d'entretien.

### Batch 3 — Qualité jours 91-180 (Python, data, SQL avancé, pipelines, stats, ML)
Théorie inline substantielle + exemple guidé + correction exploitable + cas métier + question d'entretien.

### Batch 4 — Qualité jours 181-270 (LLM, embeddings, RAG, vector DB, chunking, retrieval, reranking, agents, tool calling, éval, sécurité IA)
Bloc le plus critique (cœur « bankable IA ») : profondeur maximale + cas métier + questions d'entretien.

### Batch 5 — Qualité jours 271-365 (projet final, prod, tests, monitoring, coûts, sécurité, portfolio, carrière)
Transformer les compétences en preuves employables.

### Batch 6 — Scripts d'audit
`curriculum:check` et `curriculum:depth-check` : imposer ≥ 60 leçons, structure des leçons,
cours substantiel, exemple guidé, correction, livrable, critères, lien futur, cas métier +
question d'entretien pour jours IA, alerte vague/court.

### Batch 7 — Documentation maintenable
`AUTHORING_GUIDE.md`, `templates/day|lesson|solution|project-template.md`,
`prompts/enrich-day|create-lesson|audit-curriculum|deepen-theory|improve-solution|map-lessons-to-days.md`.

---

## Règle de sécurité (chaque batch)
`npm run generate` (si besoin) → `curriculum:check` → `curriculum:depth-check` → `npm test` → `npm run build` → corriger → commit + push.

## Journal d'avancement
- **Batch 0** : ✅ FAIT — audit + ce fichier.
- **Batch 7 (anticipé)** : ✅ FAIT — `AUTHORING_GUIDE.md`, `templates/*`, `prompts/*`.
- **Mécanisme d'enrichissement** : ✅ FAIT — `INTERVIEW_BY_SKILL` + `CASE_BY_SKILL` (chaque jour a une vraie question d'entretien ; jours data/IA ont un cas métier), `days-enrich.mjs` (override par jour), blocs générés « Cas métier » et « Question d'entretien ».
- **Batch 1 (en cours)** : ✅ +11 leçons → **32/60**.
  - IA-core (6) : prompt-engineering, structured-outputs-tools, embeddings, vector-databases, chunking-strategies, retrieval-reranking.
  - Data/ML (5) : pandas-data-wrangling, data-cleaning-quality, etl-pipelines, feature-engineering, model-evaluation.
- **Batch 6** : ✅ FAIT — scripts d'audit renforcés (compte de leçons + cible 60, structure des leçons, question d'entretien + cas métier obligatoires pour jours data/IA, alerte vague/court, kit d'auteur requis).

### État qualité actuel (mesuré)
- 313/313 jours de travail : Cours approfondi, Question d'entretien, Pourquoi, correction. 183/313 avec Cas métier (jours data/IA). Exemple guidé : 28/313.
- Jours 91-365 : ~440-460 mots (vs 360 au départ), 235/235 avec vraie question d'entretien.
- Leçons : 32 (dont 11 au gabarit complet neuf).

## RESTE À FAIRE (par ordre de priorité)

### Batch 1 (finir) — atteindre 60 leçons (28 restantes)
À créer avec `prompts/create-lesson.md` + `templates/lesson-template.md`, puis enregistrer dans `scripts/data/lessons-map.mjs` (`LESSONS` + `LESSON_BY_SKILL`) :
- **Fondations/JS/TS** : recursion, async-javascript, react-fundamentals, react-hooks-effects, git-advanced.
- **Web/backend** : express-backend, authentication, caching-performance.
- **Data/SQL** : database-modeling (indexes/transactions), numpy-fundamentals.
- **ML/DL** : neural-networks, transformers, scikit-learn-workflow, overfitting-regularization.
- **IA** : llm-cost-optimization, llm-observability, rag-evaluation (dédiée), prompt-injection-defense (dédiée), agent-workflows-orchestration.
- **DevOps/prod** : docker-containers, ci-cd, deployment-secrets, monitoring-production, error-handling, observability-logging.
- **Carrière** : readme-documentation, technical-storytelling, portfolio-github, interview-preparation, system-design-interview.
(Le regroupement d'affichage est dans `app/lessons/page.tsx` → `groupOf()` : ajouter les nouveaux slugs.)

### Batch 2 — jours 31-90 : ajouter des exemples guidés (52 jours)
Éditer `scripts/data/days-31-90.mjs` (ajouter `guidedExample`) OU `days-enrich.mjs` par jour. Prompt : `prompts/enrich-day.md`.

### Batch 3 — jours 91-180 : enrichir théorie inline + exemple guidé + cas métier spécifiques
Cibler d'abord les jours ML/data. Via `days-enrich.mjs` (champs `theory`, `guided`, `caseStudy`, `interview`) — voir les exemplaires jours 92 et 211.

### Batch 4 — jours 181-270 (cœur IA, PRIORITAIRE) : profondeur maximale
Enrichir chaque jour LLM/RAG/agents/éval/sécurité via `days-enrich.mjs` (theory 200-300 mots + guided + interview spécifique). Le mapping vers les leçons profondes est déjà en place.

### Batch 5 — jours 271-365 : projet final, prod, carrière
Enrichir via `days-enrich.mjs` ; relier aux leçons DevOps/carrière (à créer en Batch 1).

### Retrofit optionnel
Les 21 leçons d'origine suivent un gabarit plus ancien (sans « Modèle mental / Exemple guidé / Questions d'entretien / Checklist »). Les faire passer au gabarit complet améliorerait `fullGabarit` (11/32 → 32/32). Non bloquant.

## Où j'en suis (dernier point stable)
Tout est commité et poussé. `curriculum:check` OK, `curriculum:depth-check` OK (warnings = cible 60 leçons), 20/20 tests, build OK. Prochaine action recommandée : **finir Batch 1 (28 leçons)** puis **Batch 4 (cœur IA)**.
