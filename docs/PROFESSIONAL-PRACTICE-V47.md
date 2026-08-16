# V47 — Scénarios professionnels multi-compétences

Trois scénarios qui ENCHAÎNENT des exercices V47 réellement exécutables (chaque
étape se lance et se note dans la plateforme) puis culminent dans un **capstone
existant** (réutilisé — anti-scope-collapse). Chaque scénario suit la boucle
`LEARN → PRACTICE → DIAGNOSE → DECIDE → TRANSFER → EVIDENCE`.

**Frontière d'exécution honnête.** Les étapes marquées `python-ds` exécutent du
code RÉEL (numpy / pandas / scikit-learn) **uniquement si le venv opt-in
`.venv-ds` est provisionné** (`scripts/v47-provision-ds-venv.sh`). Sans lui,
elles sont `TOOLING_ENVIRONMENT_REQUIRED` : sautées honnêtement, jamais simulées.
Les étapes `python3` / `node-js` s'exécutent partout. Les étiquettes `PROXY`
signalent une mesure locale déterministe qui approche un signal non calculable
hors ligne (jamais présentée comme une vraie mesure sémantique).

---

## Scénario A — « De la donnée brute au modèle évalué et gouverné » (Data/ML pro)

**Rôle** : ingénieur ML junior. Une équipe vous confie un CSV sale et un modèle
« qui marche en notebook ». Objectif : livrer un modèle dont la performance est
**mesurée honnêtement** et **gouvernée** par une porte de non-régression.

Étapes exécutables (dans l'ordre) :
1. `pdx-dropna-count` (D3, `python-ds`) — quantifier les lignes exploitables
   avant toute chose.
2. `pdx-fix-dtype-sum` (D4, `python-ds`) — une colonne numérique arrivée en
   TEXTE fausse toute agrégation : convertir explicitement.
3. `pdx-groupby-mean` (D3, `python-ds`) — premières statistiques par segment.
4. `skl-train-test-split` (D3, `python-ds`) — séparer avant de toucher au modèle.
5. `skl-logreg-accuracy` (D4, `python-ds`) — entraîner et mesurer.
6. `skl-confusion-matrix` (D4, `python-ds`) — au-delà de l'accuracy : où le
   modèle se trompe (coût métier des faux positifs/négatifs).
7. `skl-pipeline-cv` (D5, `python-ds`) — **le point clé** : un scaler fit hors
   du Pipeline fuit dans chaque pli ; le Pipeline refit dans chaque pli rend
   l'estimation honnête.
8. `eval-harness-report` (D5, `python3`) — produire le rapport livrable :
   score + décision de porte de non-régression + catégories d'échec.

**Capstone (réutilisé)** : `data-ml-validation-production-gap`.
**Misconceptions couvertes** : `string-numbers-aggregate`, `scaler-outside-pipeline`.
**Décision attendue** : nommer la cause de l'écart validation/production (fuite
en CV / métrique inadaptée / seuil de gate mal posé) et l'action corrective,
chiffres à l'appui.
**Preuve** : les étapes vertes (ou honnêtement `TOOLING_ENVIRONMENT_REQUIRED` si
`.venv-ds` absent) + le rapport d'évaluation + la décision écrite du capstone.

---

## Scénario B — « Évaluer et gouverner un système IA avant de livrer » (Éval IA / LLM)

**Rôle** : ingénieur IA. Un système RAG doit passer en production. Aucune
métrique « à l'œil » n'est acceptée : tout signal doit être calculé et gouverné,
et le coût estimé AVANT le passage à l'échelle. Aucun appel modèle réel — briques
déterministes ; l'ancrage est un `PROXY` explicite.

Étapes exécutables (toutes `python3`, exécutables partout) :
1. `eval-exact-match` (D3) — la brique de base de toute non-régression.
2. `eval-structured-output` (D3) — une sortie « JSON » non validée casse un jour :
   valider contre un schéma est la douane.
3. `eval-tool-call-contract` (D4) — un appel d'outil émis par le modèle doit
   respecter son contrat (nom + args requis).
4. `eval-groundedness-proxy` (D4, `PROXY`) — mesurer l'ancrage des citations
   (proxy déterministe), pas se fier à la plausibilité.
5. `eval-failure-categorize` (D4) — classer les échecs pour prioriser.
6. `eval-regression-gate` (D4) — refuser une dégradation silencieuse.
7. `eval-harness-report` (D5) — assembler score + gate + top-échecs en un
   livrable unique.
8. `llm-token-estimate` (D3) puis `llm-cost-per-call` (D3) — chiffrer le coût
   (entrée + sortie) avant l'échelle.

**Capstone (réutilisé)** : `applied-ai-rag-regression`.
**Misconceptions couvertes** : `json-output-trusted`, `looks-good-is-eval`,
`grounded-equals-plausible`, `cost-is-free`.
**Décision attendue** : go / no-go argumenté par le rapport de harnais (exact
match, ancrage PROXY, gate) + coût estimé par requête à l'échelle visée.
**Preuve** : exercices verts + rapport d'évaluation + estimation de coût.

---

## Scénario C — « Concevoir sans sur-concevoir : refactor gouverné » (Archi / Patterns)

**Rôle** : ingénieur logiciel qui reprend un service enchevêtré. Objectif :
améliorer la conception **là où c'est justifié** — et savoir ne PAS ajouter de
pattern quand rien ne l'exige.

Étapes exécutables (toutes `node-js`, exécutables partout) :
1. `patterns-when-not-yagni` (D5) — **d'abord** décider si un pattern se justifie
   par des contraintes réelles (variantes, interface partagée, changement
   fréquent) ou si c'est de la sur-ingénierie.
2. `patterns-strategy-table` (D3) — remplacer un `switch` qui grossit par une
   table de stratégies, quand les variantes se multiplient.
3. `patterns-adapter-legacy` (D3) — envelopper une API héritée derrière une
   interface propre sans réécrire l'appelant.
4. `patterns-observer-filter` (D4) — découpler l'émission des réactions.
5. `arch-layer-violation` (D4) — détecter une dépendance qui remonte les couches
   (présentation → domaine → data, jamais l'inverse).
6. `arch-cycle-detect` (D4) — repérer un cycle de dépendances qui rend le système
   impossible à modifier isolément.
7. `arch-idempotent-handler` (D4) — rendre un handler rejouable sans effet double.

**Capstone (réutilisé)** : `backend-latency-after-release` (la décision de refactor
du service s'appuie sur les contraintes de conception ci-dessus).
**Misconceptions couvertes** : `pattern-because-named`, `layers-any-direction`.
**Décision attendue** : liste des changements de conception **justifiés par une
contrainte** (et la liste, tout aussi importante, de ceux qu'on n'ajoute PAS),
avec le sens des dépendances rétabli.
**Preuve** : exercices verts + note de conception (justification contrainte par
contrainte) + décision du capstone.

---

## Traçabilité

Chaque scénario réutilise un capstone existant (aucun nouveau moteur, aucune
seconde source de vérité) et ne référence que des exercices présents dans
`data/exercises/` au sprint `v47`. Les misconceptions citées existent dans
`lib/misconceptions.mjs` et relient chaque échec à une remédiation sans jamais
donner la solution.
