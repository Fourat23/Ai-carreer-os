# FINAL_REPORT — AI Career OS

Rapport de fin de construction. À lire en entier avant de commencer.

---

## 0-octies. Mise à jour — React, ingénierie logicielle front, Projet 3 BiblioApp & entrée Python jours 91-120 (Batch 5D terminé)

- **25 jours d'apprentissage enrichis en profondeur** (92-97, 99-104, 106-111, 113-118, 120) + **5 revues enrichies** (91, 98, 105, 112, 119). Sous-batchs : 5D1 (91-100), 5D2 (101-110), 5D3 (111-120). Couvre : les **fondations React** (composants/props/JSX, state immuable via useState, rendu conditionnel et listes à keys stables, useEffect et les 3 états async, formulaires contrôlés validés, couche `api.ts` centralisée avec gestion d'erreur), l'**architecture front** (routing avec l'URL comme état, lever l'état au plus petit ancêtre commun, Context pour le global stable, performance par la mesure des re-renders, accessibilité par le HTML sémantique, cadrage de projet arbre/état/backlog), l'**ingénierie logicielle front** (tests unitaires Vitest qui rougissent, tests de composants par le comportement, mocks et tests d'intégration, clean code appliqué au front, hooks personnalisés, gestion d'erreur robuste avec error boundaries), le **Projet 3 BiblioApp** (socle marchant, CRUD complet immuable, recherche/filtres en état dérivé, tests des parcours critiques, polish des états non-heureux, README + schéma 3-tiers + ADR + démo), et l'**entrée en Python idiomatique** (comprehensions, dict, enumerate/zip, snake_case, venv).
- **Note de cadrage importante** : la consigne présentait cette tranche comme « le début du parcours Python/data ». Or les titres RÉELS du programme (`days-plan.mjs`, semaines 14-18) sont React/front/tests/Projet 3, avec **un seul** jour Python (120). Conformément à la règle « respecter les titres réels du programme, ne forcer aucun sujet qui ne correspond pas au jour », ce sont les vrais intitulés qui ont été enrichis. Les différences JS→Python attendues par la consigne sont explicitées au **jour 120**, le seul où elles s'appliquent réellement (comprehensions vs boucles-push, `dict`/`.get`, `enumerate`/`zip`, indentation, snake_case, isolation par venv).
- **Même gabarit complet** que 181-365 : cours théorique + **modèle mental distinct** par jour, exemple guidé (avec exemple simple + mini-quiz de compréhension), cas métier distinct, question d'entretien avec réponse attendue, section bankable, correction exigeante (solution simple + améliorée, pièges, vérifications, section orale), liens vers les leçons de fond ciblées (react-fundamentals, react-hooks-effects, error-handling, api-design-basics, caching-performance, architecture-basics, testing-foundations, clean-code, readme-documentation, python-foundations).
- **Progression pédagogique** : chaque jour s'appuie explicitement sur les précédents (l'immutabilité du jour 93 sert au CRUD du 114 ; la couche api du 97 et le hook useFetch du 110 alimentent le socle du 113 ; les tests des jours 106-108 protègent le Projet 3 ; le cadrage du 104 devient le plan d'exécution des jours 113-118). Le fil rouge « l'UI est une fonction pure du state » et « une application se PROUVE (tests), se LIT (clean code) et ne casse jamais silencieusement (résilience) » structure tout le mois.
- **Audit anti-générique (passe Opus 4.8)** : les **25 modèles mentaux** ont été vérifiés tous distincts et propres au titre de chaque jour ; **aucune question d'entretien dupliquée** ; cas métier propres à chaque sujet. Le jour 118 (README/ADR/démo de BiblioApp) réutilise le principe « un projet non documenté n'existe pas pour un recruteur » mais avec un contenu entièrement distinct du jour 272 (projet full-stack, schéma 3-tiers front/API/base, ADR « Context vs état local », démo CRUD) — application du même principe à un projet différent, pas un copier-coller.
- **Mécanisme** : `scripts/data/days-enrich-91-120.mjs` (ENRICH_91_120), fusionné dans `generate-curriculum.mjs` (import + ajout au merge DAYS_ENRICH). Overrides `lessons` par jour pour pointer les leçons React/testing/Python pertinentes.
- Checks : `curriculum:check` ✅ · `curriculum:depth-check` ✅ (exemples guidés **209/313**, vs 185 avant ce batch) · tests 20/20 ✅ · build ✅.
- **Périmètre strictement respecté** : aucun jour hors 91-120 modifié ; interface, architecture générale et leçons inchangées (seuls le nouveau fichier d'enrichissement et deux lignes d'import/merge du générateur ont été touchés).

## 0-septies. Mise à jour — projet final DocSense, DevOps, portfolio & carrière jours 301-365 (Batch 5B/5C terminé → JOURS 181-365 ENRICHIS AU STANDARD COMPLET)

- **55 jours d'apprentissage enrichis en profondeur** + **10 revues enrichies** (301, 308, 315, 322, 329, 336, 343, 350, 357, 364). Sous-batchs : 5B1 (301-315), 5B2 (316-330), 5C1 (331-347), 5C2 (348-365). Couvre : la construction complète du projet final **DocSense** (cadrage SPEC/ADR/modèle de données/backlog/spikes/CI ; RAG build : ingestion multi-format, RAG core hexagonal, retrieval hybride, génération citée ; évaluation : golden set, harnais, dashboard, baseline, dockerisation ; fonctionnalités : workflow d'analyse, détection d'incohérences, coûts/observabilité, CI complète, tests LLM mock/replay ; polish : guardrails, gestion d'erreur bout-en-bout, observabilité finale, couverture de tests, rapport qualité, feature freeze) ; le **portfolio** (README exemplaire, démo vidéo, storytelling des 7 projets, polish GitHub, schéma d'entretien, cohérence) ; la **carrière** (CV orienté preuves, LinkedIn, ciblage, pitch, analyse d'offres, dossier de candidature, révision algo, questions IA, simulations technique/archi/comportemental, dossier d'entretien, négociation, candidatures réelles, entretiens blancs, bilan annuel, PLAN-90-JOURS, clôture).
- **Même gabarit complet** que 4A-5A : cours théorique + modèle mental, exemple guidé (avec exemple simple + mini-quiz), cas métier distinct, question d'entretien avec réponse attendue, section bankable, correction exigeante (solution simple + améliorée, pièges, vérifications, section orale), liens vers les leçons. Le jour 365 (clôture, cas spécial du générateur) a reçu le support d'enrichissement.
- **Audit qualité (passe Opus 4.8)** : les jours 348-365 ont été audités contre le meilleur niveau des jours 181-300 (anti-contenu générique : modèles mentaux et cas métier vérifiés distincts et liés au titre de chaque jour ; corrections vérifiées complètes, pas des checklists). Aucune correction anti-générique nécessaire sur 348-363. Le **jour 365 a été retravaillé** d'un texte de clôture narratif vers un véritable **outil d'audit de préparation au marché** : bilan factuel chiffré par compétence (niveau 1-5 + preuve démontrable), inventaire des preuves, grille prêt/presque-prêt/pas-encore sur critères objectifs, critères de ciblage d'offres (à viser vs encore trop avancées), plans 30 et 90 jours avec stratégie de maintien des acquis, plan de remédiation conditionnel, et exercice final de présentation du portfolio + simulation d'entretien.
- **Respect strict du plan source** : chaque jour épouse son titre réel (`days-plan.mjs`) — projet DocSense, DevOps, portfolio, carrière selon les vrais intitulés des semaines 44-52. Contenu sécurité maintenu défensif et pédagogique (prévention, permissions, validation, observabilité, résilience).
- **Mécanisme** : `scripts/data/days-enrich-301-365.mjs` (ENRICH_301_365), fusionné dans `generate-curriculum.mjs`.
- Checks : `curriculum:check` ✅ · `curriculum:depth-check` ✅ (exemples guidés **185/313**, vs 130 en fin de 5A) · tests 20/20 ✅ · build ✅.
- **✅ JOURS 181-365 ENRICHIS AU STANDARD COMPLET** : 185 jours de travail (du deep learning à la clôture de carrière) + 24 revues enrichies. Le cœur IA, le mois agents/archi/sécurité, le projet final et la préparation carrière forment désormais un parcours complet et cohérent, chaque jour vraiment exploitable pour apprendre.

## 0-sexies. Mise à jour — agents, workflows, architecture & sécurité jours 271-300 (Batch 5A terminé → mois 10 COMPLET)

- **26 jours d'apprentissage enrichis en profondeur** (271-272, 274-279, 281-286, 288-293, 295-300) + **4 revues enrichies** (273, 280, 287, 294). Couvre : finalisation du Projet 6 (rapport d'évaluation reproductible, README + ADR + démo) ; les agents (boucle plan/act/observe, modes d'échec, cas d'usage réel, mémoire/état, agent vs workflow, doctrine) ; les workflows (workflows explicites, les 4 patterns, orchestration à l'échelle, cache LLM, maîtrise des coûts, doctrine script/workflow/agent) ; l'architecture (clean architecture, hexagonale ports/adapters, event-driven, monolithe modulaire vs microservices, design patterns, design système) ; la sécurité IA (OWASP LLM Top 10, politique de données, observabilité, gestion des secrets, threat model, consolidation).
- **Même gabarit complet** que 4A/4B/4C : cours théorique + modèle mental, exemple guidé (avec exemple simple + mini-quiz de compréhension), cas métier distinct, question d'entretien avec réponse attendue, section bankable, correction exigeante (solution simple + améliorée, pièges, vérifications, section orale), liens vers les leçons de fond.
- **Respect strict du plan source** : chaque jour épouse son titre réel (`days-plan.mjs`) — les thèmes agents/workflows/architecture/sécurité correspondent aux vrais intitulés des semaines 40-43, aucun thème forcé.
- **Mécanisme** : `scripts/data/days-enrich-271-300.mjs` (ENRICH_271_300), fusionné dans `generate-curriculum.mjs`.
- Checks : `curriculum:check` ✅ · `curriculum:depth-check` ✅ (exemples guidés **130/313**, vs 104 en fin de 4C) · tests 20/20 ✅ · build ✅.

## 0-quinquies. Mise à jour — retrieval avancé, évaluation & sécurité RAG jours 241-270 (Batch 4C terminé → cœur IA 181-270 COMPLET)

- **27 jours d'apprentissage enrichis en profondeur** (241-244, 246-251, 253-258, 260-265, 267-270 — les jours 245/252/259/266 sont des revues). Couvre : la comparaison mesurée des stratégies de chunking, le chunking structurel, le versioning documents/chunks/embeddings/index et la stratégie de réindexation, la comparaison de modèles d'embedding, la recherche lexicale BM25/FTS5, la recherche hybride et la fusion RRF, le filtrage par métadonnées, le reranking par cross-encoder, le pipeline retrieval complet et son ablation, le budget coûts/latence ; puis l'évaluation systématique (golden sets, métriques de retrieval rappel@k/MRR, LLM-as-judge et ses limites, métriques de génération fidélité/pertinence/exactitude, harnais d'évaluation, validation du juge par kappa) ; puis la sécurité (prompt injection directe et indirecte, défense en profondeur, citations vérifiables, refus calibré comme feature, suite de tests adverses, observabilité) ; puis le Projet 6 évalué (baseline chiffrée, améliorations pilotées par les métriques, intégration qualité/sécurité).
- **4 revues enrichies** (245, 252, 259, 266) avec synthèse de semaine, grille de notation /N, plan de remédiation ciblé et questions d'entretien de la semaine — en plus des sections de revue de base.
- **Même gabarit complet** que 4A/4B : cours théorique + modèle mental, exemple guidé (code commenté + variante), cas métier distinct, question d'entretien avec réponse attendue, section bankable, correction exigeante (logique/pièges/vérifications/section orale), liens vers les leçons de fond.
- **Mécanisme** : `scripts/data/days-enrich-241-270.mjs` (ENRICH_241_270), fusionné dans `generate-curriculum.mjs` ; le générateur rend désormais les sections enrichies des jours de revue (synthèse, grille, remédiation, entretien).
- **Note de périmètre** : les thèmes « agents / tool calling / orchestration / mémoire d'agent » relèvent du **mois 10 (semaine 40, jours 274-289)**, hors de la tranche 241-270 (qui, selon `days-plan.mjs`, porte sur retrieval avancé + évaluation + sécurité + Projet 6). Ces jours agents restent dans la zone 271-365 non touchée.
- **Audit Fable des jours 251-260** (rédigés lors du basculement de modèle) : passés au crible contre le standard 241-250 — profondeur (1090-1182 mots/jour vs 1015-1099), gabarit complet, corrections avec section orale. **Aucune correction nécessaire** : ils étaient déjà au niveau.
- Checks : `curriculum:check` ✅ · `curriculum:depth-check` ✅ (exemples guidés **104/313**, vs 78 en fin de 4B) · tests 20/20 ✅ · build ✅.
- **Cœur IA 181-270 terminé** : 78 jours d'apprentissage enrichis en profondeur, du deep learning à la sécurité RAG évaluée.

## 0-quater. Mise à jour — LLM prod & RAG jours 211-240 (Batch 4B terminé)

- **26 jours d'apprentissage enrichis en profondeur** (211-216, 218-223, 225-230, 232-237, 239-240 — les jours 217/224/231/238 sont des revues). Couvre le LLM en production (prompts versionnés + testés, guardrails, function calling avancé, composant appel-LLM robuste) et tout le RAG v1 → DocQA (chunking, embeddings, retrieval maison, citations et refus honnête, pipeline modulaire, PDF/Markdown, ré-ingestion idempotente, diagnostic des échecs, décisions de conception, dimensionnement, filtrage métadonnées, ADR, projet évalué, interface, multi-tours, optimisation mesurée du prompt, cas limites, golden set, migration Chroma, chunking structurel).
- **Même gabarit complet que le Batch 4A** : cours théorique avec modèle mental, exemple guidé, cas métier, question d'entretien avec réponse attendue, section bankable, correction exigeante (logique, pièges, vérifications, section orale).
- **Mécanisme** : `scripts/data/days-enrich-211-240.mjs` (ENRICH_211_240), fusionné dans `generate-curriculum.mjs`.
- Checks : `curriculum:check` ✅ · `curriculum:depth-check` ✅ (exemples guidés 78/313) · tests 20/20 ✅ · build ✅.
- Prochaine étape (voir NEXT_STEPS_FABLE.md) : **Batch 4C — jours 241-270** (retrieval avancé mesuré, agents, éval, sécurité IA), même mécanisme.

## 0-ter. Mise à jour — cœur IA jours 181-210 (Batch 4A terminé)

- **25 jours d'apprentissage enrichis en profondeur** (jours 181, 183-188, 190-195, 197-202, 204-209 — les jours 182/189/196/203/210 sont des revues). Couvre la fin du projet ML, tout le deep learning (neurone → gradient → PyTorch → MLP → MNIST → régularisation), l'intuition LLM (tokenisation, embeddings, attention, transformer) et le LLM en pratique (fonctionnement, API, température, tokens/coûts, hallucinations/grounding, banc d'essai, prompts-spécifications, structured outputs, few-shot, function calling, intégration app, consolidation).
- **Chaque jour contient désormais** : un cours théorique substantiel ouvert par un modèle mental, un exemple guidé avec code commenté et variante, un cas métier concret, une question d'entretien réaliste avec la réponse attendue, une section « pourquoi ça comptera » orientée bankable, et une correction exigeante (logique, pièges, vérifications, + section « 🎤 À savoir expliquer à l'oral »).
- **Mécanisme** : `scripts/data/days-enrich-181-196.mjs` + `days-enrich-197-210.mjs`, agrégés par `days-enrich-181-210.mjs` et fusionnés dans `generate-curriculum.mjs` (qui accepte désormais `future` et `solution` par jour, et rend la section orale des corrections).
- Checks : `curriculum:check` ✅ · `curriculum:depth-check` ✅ (exemples guidés 53/313) · tests 20/20 ✅ · build ✅.
- Prochaine étape (voir NEXT_STEPS_FABLE.md) : **Batch 4B — jours 211-240** (RAG v1), même mécanisme.

## 0-bis. Mise à jour — bibliothèque de 60 leçons (Batch 1 terminé)

- **60 leçons de fond** (`curriculum/lessons/`), organisées en 8 catégories (Fondations, Web & backend, Data & SQL, SE & architecture, Python & ML, IA appliquée, Production & DevOps, Portfolio & carrière), chacune avec exercices, corrections, questions d'entretien et vocabulaire. 39 suivent le gabarit complet neuf (modèle mental, exemple guidé, exemple appliqué IA, anti-patterns, checklist « quand je suis prêt »).
- **Page /lessons enrichie** : ordre recommandé par catégorie, badges niveau (débutant/intermédiaire/avancé), durée estimée, compétences associées — alimentée par `program.json` (source : `scripts/data/lessons-map.mjs`).
- **Audits durcis** : moins de 60 leçons = ERREUR bloquante dans `curriculum:check` et `curriculum:depth-check` ; question d'entretien + cas métier restent obligatoires pour tous les jours data/IA.
- **Chaque jour du programme** renvoie vers ses leçons de référence (mappings compétence→leçons complets, y compris DL→transformers, RAG→évaluation RAG, cloud→Docker/CI/secrets/monitoring).
- Checks : `curriculum:check` ✅ (365/365/52/12, 60 leçons) · `curriculum:depth-check` ✅ · tests 20/20 ✅ · build ✅.
- Reste à faire (voir NEXT_STEPS_FABLE.md) : Batch 4 prioritaire (enrichir les jours 181-270 cœur IA via `days-enrich.mjs`), puis Batches 2/3/5 ; retrofit optionnel des 21 leçons d'origine au gabarit complet.

## 0. Mise à jour — audit de complétion + enrichissement pédagogique

Cette section résume le second passage (audit brutal + renforcement théorique). Le reste du rapport (sections 1-10) reste valable.

### Résultats des checks (tous verts)
- `npm run curriculum:check` → **Jours 365/365 · Corrections 365/365 · Semaines 52/52 · Mois 12/12 · Leçons 21/21 · ✅ Intégrité OK**
- `npm run curriculum:depth-check` → **Jours 1-30 : 26/26 avec Cours approfondi ET Exemple guidé · 313 jours de travail avec « Pourquoi ça comptera plus tard » et correction · ✅ Profondeur OK**
- `npm test` → **20/20 verts** · `npm run build` → **OK (18 routes)**

### Nombres exacts
- **365 fichiers jour** (`day-001.md` … `day-365.md`).
- **365 corrections** (`day-XXX-solution.md`) : 313 corrections détaillées (jours de travail) + **52 grilles d'évaluation** (jours de revue — créées lors de cet audit ; auparavant absentes).
- **21 leçons de fond** approfondies (`curriculum/lessons/`).
- 52 semaines, 12 mois, 7 fiches projets, 3 rubriques, 5 docs méthodologie, 2 docs carrière.

### Ce qui a été enrichi
- **Nouvelle structure pédagogique sur CHAQUE jour** : 🎯 Objectif → 📖 Cours approfondi (+ renvoi leçon de fond) → 🧭 Exemple guidé → ✍️ Pratique autonome → ❓ Mini-quiz → 📦 Livrable → ✅ Critères → ⚠️ Erreurs fréquentes → 🧠 À retenir → 🚀 Pourquoi ça comptera plus tard.
- **Jours 1-30** : théorie déjà riche + **exemple guidé pas-à-pas ajouté à chacun** + « À retenir » + « Pourquoi ça comptera plus tard ».
- **Jours 31-90** : **théorie courte substantielle ajoutée** (via `days-31-90-extras.mjs`), **critères de validation**, erreurs fréquentes (reprises des pièges), renvoi vers les leçons de fond.
- **Jours 91-365** : objectif, tâche, livrable, **critères de validation par défaut**, compétence, correction/grille, et **au moins un renvoi vers une leçon de fond** (≥ 400-800 mots de théorie disponibles via la leçon).
- **21 leçons de fond** créées : chacune avec explication complète, pourquoi, concepts, exemple, pièges, mini-exercice, lien IA/ML/LLM, vocabulaire, résumé.
- **`curriculum/QUALITY_STANDARD.md`** : définit ce qu'est une bonne journée (structure, profondeur, fiche superficielle vs vrai cours).
- **`curriculum/how-to-use-12-months.md`** (page « Mode d'emploi ») : quoi faire chaque jour, si je rate un jour / une semaine, réviser, corrections, IA sans tricher, portfolio, savoir si je suis prêt à candidater.
- **Sauvegarde** : export/restore de `data/progress.json` depuis le Dashboard + `GET /api/progress/export` / `POST /api/progress/import` (validé).
- **2 scripts d'audit** : `curriculum:check` (intégrité) et `curriculum:depth-check` (profondeur).
- **Nouvelles pages** : 📖 Leçons de fond (index), 📘 Mode d'emploi.

### Combien de jours ont un cours approfondi
- **313 jours de travail** ont le bloc « Cours approfondi ». Les **90 premiers** (hors revues) ont une théorie propre substantielle rédigée ; **tous** renvoient vers une leçon de fond (400-2000+ mots selon le sujet).
- **26 jours (1-30 hors revues)** ont en plus un **exemple guidé** rédigé à la main.

### Limites restantes
- Les jours 91-365 s'appuient surtout sur les **leçons de fond** pour la profondeur (leur théorie inline reste courte) : c'est le compromis assumé « moins de jours ultra-détaillés, mais tous adossés à une vraie leçon ».
- Les exemples guidés ne sont rédigés que pour les jours 1-30 (les jours suivants s'appuient sur l'exemple des leçons de fond).
- Corrections des jours planifiés = grilles d'auto-évaluation (non ligne-à-ligne).

### Prochaine priorité pédagogique
1. Rédiger des **exemples guidés** pour les jours 31-90 (mêmes standards que 1-30).
2. Étoffer la **théorie inline** des jours 91-365 les plus techniques (RAG, agents, éval) via `scripts/data/days-plan.mjs`.
3. Ajouter 2-3 **leçons de fond** supplémentaires (Docker/CI, observabilité, prompt engineering avancé) et les relier aux jours des mois 10-11.
4. Enrichir chaque jour au fur et à mesure que tu l'atteins (le meilleur moment pour approfondir, c'est la veille).

---

## 1. Ce qui a été construit

Une application web locale complète (**AI Career OS**) contenant un programme d'apprentissage de 12 mois pour devenir employable sur des rôles IA appliquée, avec :

- **Une application Next.js + TypeScript** qui tourne en localhost (`npm run dev`), sans auth ni cloud.
- **11 vues** : Dashboard, Calendrier, Vue Jour, Vue Semaine, Vue Mois, Projets, Compétences, Évaluations, Notes, Ressources, Carrière (+ pages méthodologie).
- **Suivi de progression persistant** (fichier `data/progress.json` via une API locale) : statut par jour, auto-évaluation 0-5, checklist, « ma réponse », notes, scores de 20 compétences.
- **365 jours de contenu** générés (`curriculum/days/`), **313 corrections** (`curriculum/solutions/`), **52 semaines**, **12 mois**.
- **7 fiches projets** portfolio détaillées (dont le projet final **DocSense**).
- **3 rubriques** d'évaluation (scorecard, mensuelle, entretien), **5 documents de méthodologie**, **2 documents carrière**, **1 fichier ressources**.
- **Un générateur** (`npm run generate`) qui reconstruit tout le curriculum depuis des données sources éditables, en préservant tes retouches (marqueur `<!-- keep -->`).
- **Des tests** (`npm test`) qui vérifient l'intégrité du curriculum et la logique de progression.

### Le projet final recommandé (et pourquoi)
**DocSense** — assistant d'analyse documentaire technique avec pipeline RAG évalué et dashboard qualité. C'est le choix le plus **bankable** : la Q&R/analyse sur corpus documentaire privé est le cas d'usage LLM n°1 en entreprise, et l'ajout d'une **évaluation chiffrée**, de **guardrails testés** et d'un **dashboard qualité** est exactement ce qui distingue un ingénieur IA d'un simple « prompteur ». Détails dans `curriculum/projects/project-final.md`.

---

## 2. Comment lancer le projet

```bash
npm install
npm run dev       # → http://localhost:3000
npm test          # tests d'intégrité (18 tests)
npm run generate  # régénère le curriculum si tu édites scripts/data/
```
Prérequis : Node.js 20+ (testé sur Node 22). Voir `README.md` pour le détail.

---

## 3. Ce qui est complet

- ✅ **Application** : build de production réussi, toutes les routes répondent 200, l'API de progression lit/écrit correctement (testé end-to-end).
- ✅ **Jours 1 à 30** : très détaillés (durée, découpage horaire, théorie, exercice principal + bonus, mini-quiz, livrable, critères, erreurs fréquentes, ressources, consignes « sans IA d'abord » + usage IA, correction complète en 6 volets, questions de réflexion).
- ✅ **Jours 31 à 90** : complets (objectif, concepts, exercice concret, livrable, correction guidée : logique / pièges / réflexion). Alignés sur les mois 2-3.
- ✅ **Jours 91 à 365** : plan actionnable — chaque jour a un sujet précis, un exercice concret et un livrable, généré depuis `scripts/data/days-plan.mjs` (une entrée par semaine × 6 jours).
- ✅ **Revues hebdomadaires** (52) : bilan, test pratique, test théorique, mini-projet, checklist, critères de passage, exercice d'architecture.
- ✅ **Revues mensuelles** (12) : projet validant, scores attendus, compétences acquises, lacunes, livrable portfolio, simulation d'entretien, exercice oral.
- ✅ **7 projets** : objectif, ce que ça prouve, fonctionnalités, stack, architecture, modèle de données, critères de qualité, tests, README attendu, démo, erreurs à éviter, extensions, ADRs.
- ✅ **Système d'évaluation** : scorecard 0-5 interactive pour les 20 compétences + 3 grilles.
- ✅ **Méthodologie et carrière** : apprendre, utiliser l'IA sans en dépendre, débugger, penser en ingénieur, concevoir une architecture, CV/LinkedIn, préparation entretiens.
- ✅ **Corrections** : elles expliquent la logique, les erreurs probables, les points à vérifier, une solution simple + une améliorée, et posent des questions — pas juste une réponse finale.
- ✅ **README** suffisant (prérequis, install, lancement, structure, édition, usage quotidien, revues).

---

## 4. Ce qui est partiel (limites assumées)

- 🟡 **Densité décroissante des jours 91-365.** Ils sont *actionnables* (sujet + exercice + livrable clairs) mais moins verbeux que les jours 1-30. C'est **voulu** (autonomie croissante) et **corrigeable** : édite `scripts/data/days-plan.mjs` puis `npm run generate`. Les corrections de ces jours sont des grilles d'auto-évaluation génériques, pas des solutions détaillées.
- 🟡 **Scores de compétences déclaratifs.** L'auto-évaluation 0-5 est guidée par la rubrique mais non calculée par un correcteur automatique — honnête pour un outil solo.
- 🟡 **Pas de rendu de code exécutable dans l'app.** Tu codes dans ton propre éditeur (VS Code) ; l'app est le pilote pédagogique, pas un IDE.
- 🟡 **Contenu généré, donc perfectible.** Certaines formulations des jours planifiés sont volontairement génériques. Enrichis-les au fil de l'eau quand un jour approche.

---

## 5. Comment continuer (enrichir le programme)

1. **Pour retoucher un jour précis** sans le perdre : édite `curriculum/days/day-XXX.md`, ajoute `<!-- keep -->` en première ligne.
2. **Pour enrichir en masse les jours 91-365** : édite les entrées de `scripts/data/days-plan.mjs` (ajoute théorie, quiz, ressources — le schéma accepte plus de champs), puis `npm run generate`.
3. **Pour ajuster la structure** (thèmes de semaine, revues, scores attendus) : édite `scripts/data/program-structure.mjs`, puis régénère.
4. **Vérifie toujours** après édition : `npm test` (intégrité) puis `npm run build`.

---

## 6. Tes 10 premières actions

1. `npm install` puis `npm run dev`, ouvre **http://localhost:3000**.
2. Lis `curriculum/methodology/how-to-learn.md` et `how-to-use-ai-without-dependency.md` (via la sidebar « Méthode »). **La règle « d'abord seul » conditionne tout le reste.**
3. Ouvre la **Vue Compétences** et fais une auto-évaluation *honnête* de départ (elle sera basse — c'est le point de comparaison de ta transformation).
4. Sur le **Dashboard**, clique **« ▶ Commencer la journée »** (jour 1). Le compteur démarre.
5. Installe ton environnement réel : **Node.js, VS Code, Git, un compte GitHub** (c'est justement le jour 1).
6. Fais le **jour 1 en entier**, sans IA d'abord, puis remplis ton suivi et déplie la correction.
7. **Crée ton dépôt GitHub `ia-lab`** et prends l'habitude du **commit quotidien** dès aujourd'hui (la chaîne verte est un moteur).
8. Bloque **4-5 h/jour** dans ton agenda, à heure fixe si possible. La régularité bat l'intensité.
9. Ouvre la **Vue Calendrier** pour visualiser les 12 mois et les 7 projets — garde la vue d'ensemble en tête.
10. Ce week-end (jour 7), fais ta **première revue hebdomadaire** et réévalue tes compétences.

---

## 7. Les risques du programme (et comment les gérer)

- **Le tutorial hell** (accumuler du contenu sans construire) → la règle « d'abord seul » et les livrables quotidiens l'évitent. Construis, ne te contente pas de lire.
- **La dépendance à l'IA** → tu vises un métier IA ; paradoxalement, tu dois d'abord savoir coder *sans*. Respecte le protocole « lire-fermer-réécrire ».
- **L'abandon vers le mois 3-4** (le creux classique) → vise la constance, célèbre les jalons (chaque projet), ne casse pas la chaîne de commits.
- **La sur-évaluation de soi** → applique le test « puis-je le faire seul + l'expliquer ? » à chaque score.
- **Le perfectionnisme sur le projet final** → premières candidatures envoyées au jour 358 quoi qu'il arrive.
- **Le marché de l'emploi** → un programme sérieux ne garantit pas un poste, mais un portfolio de 7 projets crédibles + une vraie compréhension technique te met dans le peloton employable. Candidate aussi à des postes full-stack orientés IA (ton profil hybride est un atout).

---

## 8. Comment adapter le programme si tu prends du retard

- **Retard de quelques jours** : normal. Le Dashboard affiche l'écart entre le jour attendu (selon ta date de début) et ton jour actuel. Rattrape sur un week-end ou décale — le compteur n'est qu'un indicateur, pas un juge.
- **Retard structurel (une compétence ne rentre pas)** : ne fonce pas. Utilise un jour de revue hebdo pour **consolider** au lieu d'avancer. Mieux vaut décaler que bâtir sur du sable.
- **Retard important (semaines)** : **coupe le scope, pas la qualité.** Priorise le chemin critique : fondations (mois 1-2) → un projet full-stack (mois 3-4) → un projet ML (mois 6) → **le RAG évalué (mois 8-9)** → **DocSense (mois 11-12)**. Les mois 5, 7, 10 peuvent être allégés si nécessaire — mais ne saute jamais l'évaluation RAG ni le projet final, ce sont tes différenciateurs.
- **Règle générale** : un jour à 2 h vaut mieux qu'un jour à zéro. Ne vise pas la perfection, vise à ne pas t'arrêter.
- Détails dans `curriculum/rubrics/monthly-evaluation.md` (« si les critères ne sont pas atteints »).

---

## 9. Comment utiliser ce SaaS pendant 12 mois

- **Chaque jour** : Dashboard → « Commencer la journée » → travailler seul → remplir le suivi → correction → marquer terminé.
- **Chaque semaine (jour 7)** : revue hebdo dans la Vue Jour, mise à jour des scores de compétences.
- **Chaque mois (dernier jour)** : revue mensuelle dans la Vue Mois, projet validant, simulation d'entretien, bilan écrit dans les Notes.
- **Aux jalons (jours 30, 60, 90, 180, 270, 365)** : relis tes anciennes notes, mesure ta transformation, ajuste tes scores, replanifie si besoin.
- **En continu** : commits GitHub quotidiens, journal d'apprentissage dans les Notes, projets poussés et documentés au fil de l'eau (pas à la fin).
- **Au mois 12** : bascule carrière (CV, LinkedIn, GitHub, entretiens) et **envoie tes candidatures** — c'est l'objectif de toute l'année.

---

## 10. Vérification du travail (auto-contrôle du build)

- ✅ `npm run build` : compilation et types OK, 14 routes générées.
- ✅ `npm test` : 18 tests verts (intégrité curriculum + logique de progression).
- ✅ Toutes les routes testées répondent 200 (dashboard, calendrier, jours 1/8/92/200/365, semaine, mois, projets, compétences, ressources, notes, évaluations, carrière, doc).
- ✅ API de progression testée end-to-end : sauvegarde d'un jour, d'un score de compétence, rejet des entrées invalides (400), persistance vérifiée, Dashboard qui reflète l'état.
- ✅ Jour 1 complet (toutes les sections), mois 1 complet (revue mensuelle), corrections présentes.
- ✅ Liens internes fonctionnels (jour ↔ semaine ↔ mois ↔ projets ↔ docs).

### Prochaines améliorations possibles (si tu veux itérer sur l'outil)
- Enrichir progressivement les jours 91-365 (théorie + quiz) au fur et à mesure que tu les atteins.
- Ajouter un export/import de `progress.json` (bouton dans l'UI).
- Ajouter un graphe d'évolution des scores de compétences dans le temps.
- Générer un « rapport de fin de mois » automatique agrégeant tes notes et scores.

Bon courage. Dans 12 mois, relis ta lettre du jour 1.
