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

## ✅ BATCH 1 TERMINÉ — 60/60 leçons

- **60 leçons de fond** dans `curriculum/lessons/` (39 au gabarit complet neuf, 21 au gabarit d'origine — toutes structurées, avec exercices et vocabulaire).
- **Métadonnées par leçon** (catégorie, niveau 1-3, durée en minutes, compétences) dans `LESSONS` de `lessons-map.mjs`, exportées dans `program.json`, affichées sur **/lessons** (ordre recommandé, badges niveau/durée/compétences, 8 catégories).
- **Audits durcis** : `curriculum:check` et `curriculum:depth-check` ÉCHOUENT désormais sous 60 leçons (exigence, plus un warning).
- Mappings compétence→leçons complets (chaque compétence pointe vers ses leçons de référence, y compris avancées).

### Leçons ajoutées cette session (sous-batchs 4-7)
- Production/LLMOps : observability-logging, monitoring-production, deployment-secrets, error-handling, llm-observability, llm-cost-optimization.
- IA avancée & carrière : prompt-injection-defense, rag-evaluation, agent-workflows-orchestration, readme-documentation, portfolio-github, interview-preparation.
- Fondations & web : recursion, async-javascript, react-fundamentals, react-hooks-effects, express-backend, authentication.
- ML/DL & data : neural-networks, transformers, scikit-learn-workflow, database-modeling, caching-performance, git-advanced.

### Retrofit optionnel (non bloquant)
Les 21 leçons d'origine n'ont pas les sections « Modèle mental / Exemple guidé / Questions d'entretien / Checklist » du nouveau gabarit (39/60 les ont). Les upgrader ferait 60/60 au gabarit complet. Prompt : `prompts/create-lesson.md` en mode réécriture.

## ✅ BATCH 4A TERMINÉ — jours 181-210 (cœur IA : ML final, DL, LLM)

- **25 jours d'apprentissage enrichis en profondeur** (181, 183-188, 190-195, 197-202, 204-209 ; les jours 182/189/196/203/210 sont des revues générées).
- Chaque jour a désormais : **cours théorique substantiel avec modèle mental**, **exemple guidé** (code commenté + variante), **cas métier concret**, **question d'entretien réaliste avec réponse attendue**, **section bankable** (`future`), et une **correction exigeante** (logique, pièges, vérifications, + nouvelle section « 🎤 À savoir expliquer à l'oral »).
- **Fichiers de données** : `scripts/data/days-enrich-181-196.mjs` (ENRICH_W26_28), `days-enrich-197-210.mjs` (ENRICH_W29_30), agrégés par `days-enrich-181-210.mjs` (ENRICH_181_210) et fusionnés dans le générateur avec `days-enrich.mjs`.
- **Générateur étendu** : les jours planifiés acceptent désormais `future` et `solution` par jour ; les corrections savent rendre une section `oral`.
- Thèmes couverts : reproductibilité ML, neurone/gradient/autograd/MLP/MNIST/régularisation, tokenisation, embeddings, attention, transformer, fonctionnement LLM, API, température, tokens/coûts, hallucinations/grounding, banc d'essai/évaluation, prompts-spécifications, structured outputs, few-shot, function calling/tool use, intégration app, consolidation « LLM = composant d'ingénierie ».

## PROCHAIN BATCH RECOMMANDÉ : Batch 4B — jours 211-240 (RAG, vector DB, chunking, retrieval)
Continuer sur le même mécanisme : créer `scripts/data/days-enrich-211-240.mjs` sur le modèle exact
de `days-enrich-197-210.mjs` (champs `theory`, `guided`, `caseStudy`, `interview`, `future`,
`solution {logic, pitfalls, checks, oral}`), l'agréger et le fusionner dans
`generate-curriculum.mjs` comme `ENRICH_181_210` l'est déjà. Attention : le jour 211 a déjà un
exemplaire dans `days-enrich.mjs` — l'enrichissement 211-240 le remplace s'il est plus profond.
Ensuite : Batch 4C (241-270), puis Batch 2 (31-90), Batch 3 (91-180), Batch 5 (271-365).

## Journal d'avancement
- **Batch 0** : ✅ FAIT — audit + ce fichier.
- **Batch 7 (anticipé)** : ✅ FAIT — `AUTHORING_GUIDE.md`, `templates/*`, `prompts/*`.
- **Mécanisme d'enrichissement** : ✅ FAIT — `INTERVIEW_BY_SKILL` + `CASE_BY_SKILL` (chaque jour a une vraie question d'entretien ; jours data/IA ont un cas métier), `days-enrich.mjs` (override par jour), blocs générés « Cas métier » et « Question d'entretien ».
- **Batch 1** : ✅ TERMINÉ — **60/60 leçons** (voir section « BATCH 1 TERMINÉ » ci-dessus).
- **Batch 6** : ✅ FAIT — scripts d'audit renforcés (compte de leçons + cible 60, structure des leçons, question d'entretien + cas métier obligatoires pour jours data/IA, alerte vague/court, kit d'auteur requis).
- **Batch 4A** : ✅ TERMINÉ — jours 181-210 enrichis en profondeur (25 jours d'apprentissage ; voir section « BATCH 4A TERMINÉ » ci-dessus).

### État qualité actuel (mesuré)
- 313/313 jours de travail : Cours approfondi, Question d'entretien, Pourquoi, correction. 183/313 avec Cas métier (jours data/IA). Exemple guidé : **53/313** (1-30 + 181-210).
- Jours 91-365 : vraie question d'entretien partout ; jours 181-210 au niveau « cours complet » (~900-1200 mots).
- Leçons : **60/60** (39 au gabarit complet neuf).

## RESTE À FAIRE (par ordre de priorité)

### Batch 4B — jours 211-240 (RAG v1 : chunking, embeddings, vector DB, retrieval) — PRIORITAIRE
Créer `scripts/data/days-enrich-211-240.mjs` sur le modèle de `days-enrich-197-210.mjs`
(mêmes champs, même exigence), agréger et fusionner dans le générateur. Sous-batchs : 211-220, 221-230, 231-240.

### Batch 4C — jours 241-270 (RAG avancé, agents, éval, sécurité IA)
Même mécanisme, après 4B.

### Batch 2 — jours 31-90 : ajouter des exemples guidés (52 jours)
Éditer `scripts/data/days-31-90.mjs` (ajouter `guidedExample`) OU `days-enrich.mjs` par jour. Prompt : `prompts/enrich-day.md`.

### Batch 3 — jours 91-180 : enrichir théorie inline + exemple guidé + cas métier spécifiques
Cibler d'abord les jours ML/data. Via `days-enrich.mjs` (champs `theory`, `guided`, `caseStudy`, `interview`, `future`, `solution`) — exemplaires : jours 92 et 181-210.

### Batch 5 — jours 271-365 : projet final, prod, carrière
Enrichir via le même mécanisme ; les leçons DevOps/carrière existent toutes (Batch 1 terminé).

### Retrofit optionnel
Les 21 leçons d'origine suivent un gabarit plus ancien (sans « Modèle mental / Exemple guidé / Questions d'entretien / Checklist »). Les faire passer au gabarit complet ferait 60/60 au gabarit neuf (39/60 aujourd'hui). Non bloquant.

## Où j'en suis (dernier point stable)
Batch 4A (jours 181-210) terminé, commité et poussé. `curriculum:check` OK, `curriculum:depth-check` OK, 20/20 tests, build OK. Prochaine action recommandée : **Batch 4B (jours 211-240)** par sous-batchs de 10 jours.
