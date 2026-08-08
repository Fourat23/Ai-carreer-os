# Sprint V30 — Core Curriculum Hardening III : Backend/API + React II + Data/SQL + AI/ML historical debt

Rapport de sprint (français). Sprint d'abord PÉDAGOGIQUE : résorber la dette réelle
(fondations AI/ML historiques, Backend/API, documentation SE), relier théorie et pratique,
sans course à la quantité ni refonte UI.

## 1. État initial constaté (CP0)
Dépôt propre, socle vert. HEAD `4c66723`, 110… (avant V30 : 109) leçons, 195 exercices, 40
missions, 28 playbooks, 631 termes de glossaire, 6 parcours, 949 tests. Aucun travail V30
préexistant. `progress.json` gitignoré (SHA `598f27c2…`), sauvegardé hors repo.

## 2. Anomalies
Aucune. Batterie verte (generate idempotent, curriculum/depth/glossary, 949 tests, build,
liens, caractères). Seule « anomalie » d'audit : déséquilibre pédagogique (voir §10).

## 3. Architecture réellement trouvée
Moteur d'audit `lib/pedagogy-audit.mjs`, runtimes `node-js/typescript/python3/react-tsx/web`
(pas de runtime SQL), `practiceRefs`, gates v26→v29 actifs, catalogue 6 parcours + 3 annoncés.
Réutilisés tels quels — aucun second moteur.

## 4. Objectifs V30
Concentrer l'effort sur la dette RÉELLE (l'audit fait foi) : (A) AI/ML historique (flagship),
(B) Backend/API, (C) documentation SE ; auditer React & Data (déjà bâtis en V29) sans forcer
de leçons ; trancher la décision runtime SQL ; relier la pratique partout.

## 5. Décisions ADR/HSD/TSD-030
ADR-030 : correction additive ; AI/ML = sous-ensemble P0 prioritaire (pas les 23) ; Backend/API
durci + relié ; documentation SE ; **runtime SQL = Option A** (raisonnement relationnel node-js,
SQLite/DuckDB différé — pas de second moteur) ; React/Data déjà bâtis → audit seulement.
HSD-030 : contrat de leçon, modèles mentaux, maths honnêtes, anti-slop. TSD-030 : gate
v30:check, ledger, réutilisation runtimes.

## 6. Audit Backend (CP3)
`api-design-basics` (P0), `express-backend`, `authentication`, `async-javascript` : sans rampe/
prérequis, sans practiceRefs, alors que la pratique existe. → durcies + reliées (api-router,
http-status, http-method-idempotent, validate-user, async-sum, auth-status-decision).

## 7. Audit React (CP4)
Chaîne bâtie en V29 (browser-dom-rendering → react-* → accessibility), complète, useEffect
enseigné correctement. **Aucune nouvelle leçon** (qualité > quantité). Dette d'extension
(routing, data-fetching avancé) cadrée V31. Voir `docs/architecture/v30-react-audit.md`.

## 8. Audit Data/SQL (CP5)
Chaîne bâtie en V29 (foundations → modeling → performance → transactions → migrations),
complète, modèle mental avant JOIN/ACID/index. **Aucune nouvelle leçon** ; ajout d'une note
« réel vs simulé » (pratique node-js, pas de vrai SGBD — décision ADR-030). Voir
`docs/architecture/v30-data-audit.md`.

## 9. Audit Software Engineering (CP6)
V29 couvrait testing/refactoring/dette/breaking-changes. Trou réel : **documentation
technique** (ADR/RFC/HLD/HSD/TSD/LLD/runbook/post-mortem/changelog) + types de maintenance —
aucune leçon dédiée. → 1 nouvelle leçon `technical-documentation`.

## 10. Audit AI/ML (CP8 — flagship)
23 leçons (Python & ML 8 + IA appliquée 15), majoritairement P0/P1, sans practiceRefs — le
parcours phare reposait sur des fondations IA médiocres pendant que Cloud/SRE excellaient.
Correction d'un sous-ensemble prioritaire de **6** : statistics-for-ml, machine-learning-basics,
model-evaluation, llm-fundamentals, agents-fundamentals, ai-security. Maths expliquées par
l'intuition. Dette restante documentée (§29).

## 11. Nouvelles leçons (1)
`technical-documentation` (documentation SE + maintenances). Aucune leçon React/Data forcée.

## 12. Anciennes leçons durcies (14)
Backend/API (4) : api-design-basics, express-backend, authentication, async-javascript.
AI/ML (6) : statistics-for-ml, machine-learning-basics, model-evaluation, llm-fundamentals,
agents-fundamentals, ai-security. Data/SQL (5, note réel/simulé) : sql-foundations,
database-modeling, sql-performance-indexing, database-transactions-concurrency,
database-migrations. (Correction additive, contenu technique conservé.)

## 13. Pratique réutilisée
Backend relié aux exercices HTTP/validation existants ; AI/ML relié aux 2 nouveaux exercices
de raisonnement ; 3 playbooks reliés aux leçons. Aucune duplication des 195 exercices.

## 14. Nouveaux exercices (3)
`auth-status-decision` (401/403/404), `ml-metric-choice` (métrique selon le coût),
`prompt-injection-classify` (donnée non fiable) — node-js déterministes, contrat vérifié par
exécution.

## 15. Playbooks (3)
`ci-passes-locally-fails`, `intermittent-incident`, `third-party-outage` — scénarios absents,
méthode complète, reliés aux leçons.

## 16. Glossaire (+14)
middleware, authentification, autorisation, session, température, overfitting, train/test split,
precision, recall, feature, tool use, workflow (vs agent), maintenance logicielle, défense en
profondeur. 631 → 645. (idempotence/fenêtre de contexte/post-mortem déjà présents — non
dupliqués.)

## 17. Matrice des parcours (CP10)
`docs/architecture/v30-track-coherence.md` : 6 parcours disponibles cohérents (durée inchangée,
V30 = profondeur + liens) ; ai-engineer-foundations fortement amélioré (fondations IA) ;
backend-engineer renforcé ; frontend-engineer-v1 / data-ml-v1 restent **annoncés**.

## 18. Audit pédagogique CP11
Voir `docs/PEDAGOGICAL-AUDIT-V30.md` (registre 16-dim, avant/après, walkthroughs néophyte,
dette restante). Rempli au CP11.

## 19. Métriques avant/après
Leçons 109 → **110** ; exercices 195 → **198** ; playbooks 28 → **31** ; glossaire 631 →
**645** ; missions 40 (inchangé). Tests 949 → **961**. 15 leçons touchées (1 nouvelle + 14
durcies), dont 6 fondations AI/ML P0→standard.

## 20. Validations réellement réalisées
generate idempotent, curriculum/depth/glossary, **961 tests**, tsc/build, gates:active (10,
dont v30), 0 lien cassé, 0 caractère invalide ; validation navigateur Chromium (§23).

## 21. Validations non réalisées
Interaction UI pilotée réelle (soumission d'exercice via l'UI) ; audit a11y automatisé (axe) ;
test utilisateur réel (les scores restent des proxys).

## 22. Réel vs simulé
Réel : leçons, exercices (exécutés), playbooks, gate, glossaire, validation navigateur.
Simulé (étiqueté) : raisonnement relationnel SQL et raisonnement AI/ML en node-js. Aucun vrai
SGBD, modèle ML entraîné, ou appel LLM réel.

## 23. Accessibilité & responsive (validation navigateur)
Chromium (sans playwright install) : /lessons, /parcours, /glossary + 8 leçons V30
(api-design-basics, express-backend, statistics-for-ml, machine-learning-basics, llm-fundamentals,
ai-security, agents-fundamentals, technical-documentation) → **HTTP 200, aucun débordement
horizontal, aucune erreur console** à **375/768/1024/1440/1920**. Section « Pratique associée »
rendue.

## 24. Performances / bundles
Aucun code runtime ajouté (V30 = données/docs/scripts/tests) ; build de production sans erreur ;
aucun impact bundle.

## 25. Sécurité / anti-fuite
Aucun secret réel ; aucune fuite de solution/test privé (vérifié par exécution). La leçon
ai-security et l'exercice prompt-injection-classify enseignent la défense sans exposer d'attaque
réelle exploitable.

## 26. Données / progress restore
`progress.json` sauvegardé au CP0 (SHA `598f27c2…`), jamais committé, inchangé.
`data/program.json` régénéré déterministe (hors `generatedAt`).

## 27. État Git
Branche `claude/ai-career-os-saas-phfg49`, commits atomiques par CP, poussés.

## 28. HEAD final / local == origin
Confirmés dans la synthèse finale (après CP11).

## 29. Dette restante
- **AI/ML P1/P2 non traités (V31)** : feature-engineering, scikit-learn-workflow, neural-networks,
  transformers, prompt-engineering, structured-outputs-tools, embeddings, rag-fundamentals,
  chunking-strategies, vector-databases, retrieval-reranking, ai-evaluation, rag-evaluation,
  agent-workflows-orchestration, prompt-injection-defense, llm-cost-optimization, llm-observability.
- **Backend/Fondations P1** : caching-performance, recursion, git-advanced.
- **Runtime SQL réel** : différé (Option B, V31 si besoin décisif).
- **Parcours Frontend/Data** : curation jour-par-jour à faire pour les rendre disponibles.

## 30. Limites honnêtes
Scores d'audit = proxys (pas de test utilisateur) ; audit AI/ML partiel par conception ;
pratique SQL/AI simulée en JS. La correction est additive : le contenu historique riche est
conservé, pas réécrit.

## 31. Backlog pédagogique V31/V32
Vague IV AI/ML (RAG, embeddings, prompt-engineering, agents-orchestration) ; rattrapage
Backend/Fondations P1 ; complétion du graphe de prérequis ; curation éventuelle des parcours
Frontend/Data ; runtime SQL réel si justifié.

## 32. Résumé avant / après
Corpus plus équilibré : les fondations AI/ML du parcours phare passent au standard néophyte,
Backend/API est cohérent et relié, la documentation technique existe. 110 leçons, 198 exercices,
31 playbooks, 645 termes, 961 tests. Aucune régression.

## 33. HEAD final
Renseigné dans la synthèse finale (après CP11).

## 34. local == origin
Vérifié après chaque push.

## 35. Prompt de reprise V31
Voir la fin de ce document (ajouté au CP11) ; **ne pas démarrer V31**.
