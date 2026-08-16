# V46 — Scénarios professionnels multi-compétences

Trois scénarios qui ENCHAÎNENT des exercices V46 réellement exécutables (chaque
étape se lance et se note dans la plateforme) puis culminent dans un **capstone
existant** (réutilisé, anti-scope-collapse). Chaque scénario suit la boucle
`LEARN → PRACTICE → DIAGNOSE → DECIDE → TRANSFER → EVIDENCE`.

## Scénario A — « L'écart validation/production en Data/ML »

**Objectif** : un modèle brille en validation mais échoue en production.
Diagnostiquer et décider.

Étapes exécutables (exercices V46, dans l'ordre) :
1. `py-data-clean-missing` — les valeurs manquantes ne sont pas des zéros.
2. `py-data-validate-schema` (D4) — repérer les lignes invalides en amont.
3. `ml-leakage-detect` (D4) — trouver l'étape qui fait fuiter le test.
4. `ml-baseline-majority` (D3) — recadrer l'accuracy par la baseline.
5. `ml-metric-choice` (D4) — choisir la métrique selon le coût métier.
6. `ml-overfit-diagnose` (D5) — lire l'écart train/val.

**Capstone (réutilisé)** : `data-ml-validation-production-gap`.
**Décision attendue** : nommer la cause (leakage / métrique inadaptée / overfit)
et l'action corrective, chiffres à l'appui.
**Preuve** : les 6 exercices verts + la décision écrite du capstone.

## Scénario B — « Régression de retrieval dans un RAG »

**Objectif** : le RAG répond mal après une mise à jour. Localiser l'étage fautif.

Étapes exécutables :
1. `rag-chunk-by-size` — vérifier le découpage.
2. `rag-cosine-similarity` (D3) — la mesure de proximité.
3. `rag-topk-retrieve` (D3) — ce qui remonte réellement.
4. `rag-rrf-fusion` (D4) — combler les angles morts (sens + mots).
5. `rag-recall-at-k` (D4) — MESURER avant de conclure.
6. `rag-diagnose-fault` (D5) — retrieval vs génération vs « lucky-guess ».

**Capstone (réutilisé)** : `applied-ai-rag-regression`.
**Décision attendue** : étage responsable + correctif + preuve de non-régression
(rappel@k avant/après).
**Preuve** : exercices verts + tableau d'ablation du capstone.

## Scénario C — « API lente : de la requête à la décision » (Backend/Data)

**Objectif** : une API ralentit ; remonter des symptômes à la cause SQL et
décider.

Étapes exécutables :
1. `sqlite-select-where` / `sqlite-inner-join` — rejouer la requête réelle.
2. `sqlite-group-having` (D3) — l'agrégation coûteuse.
3. `sqlite-subquery-above-avg` (D4) — reformuler.
4. `sqlite-index-explain` (D4) — prouver SEARCH vs SCAN via EXPLAIN QUERY PLAN.
5. `sqlite-transaction-last-seat` (D5) — intégrité sous concurrence.
6. `sec-sql-injection-safe` (D3) — au passage, paramétrer, ne pas concaténer.

**Capstone (réutilisé)** : `backend-latency-after-release`.
**Décision attendue** : index manquant / N+1 / requête à réécrire + test de
non-régression.
**Preuve** : SQL réel exécuté (sqlite3) + plan d'exécution + décision du capstone.

## Pourquoi c'est « professionnel »

- Chaque étape est du **code réellement exécuté** (Python/SQL), pas un QCM.
- Le fil va du **symptôme** au **diagnostic** puis à la **décision** — la
  compétence évaluée est le raisonnement d'ingénieur, pas la récitation.
- Les scénarios **réutilisent** les capstones existants (aucun doublon) : les
  exercices V46 en deviennent les marches d'entraînement exécutables qui
  manquaient.
