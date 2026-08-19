# ADR-048 — Deep practice & scénarios professionnels intégrés (V48)

## Statut
Accepté (V48, CP1).

## Contexte

À l'ouverture V48 (mesuré au CP0, le dépôt fait foi) :

- Corpus académique **gelé** (128 leçons, SHA-1 `4c1f3028…`).
- **333 exercices** : D1=21 · D2=150 · D3=107 · D4=43 · D5=12. Modes : 323
  locaux · 8 `TOOLING` · 2 `PROXY`.
- `.venv-ds` (numpy/pandas/scikit-learn) **réel et disponible** ; 8 exercices
  `python-ds` s'exécutent vraiment.
- **5 capstones** couvrant rag/llm/evalia, http/sql/se, cloud/se, ml/evalia,
  jsts/comm. **42 missions**, 18 transfer, 46 misconceptions.
- Découverte majeure : `lib/capstone.mjs` **est déjà** le moteur de scénario
  professionnel à divulgation progressive demandé par V48.

Dette identifiée (CP0-C/E/F) : `agents`, `archi`, `patterns`, `llm` n'ont **aucun
scénario professionnel** ; `llm` a D4=0 ; `patterns` est étroit et sans
transfert ; `algo`/`ds` n'ont aucune misconception ; Data/ML ne couvre pas
imbalance/drift/train-serve-skew.

## Décisions

### 1. RÉUTILISER le moteur de capstone comme moteur de scénario professionnel

`lib/capstone.mjs` fournit déjà : `context` + `signal` (symptôme), `artifacts`
avec bruit (`useful:false` = information inutile), **7 phases**
`hypotheses → investigation → diagnosis → decision → remediation → validation →
communication` (divulgation progressive), questions notées (`gradeQuestion`,
kinds `mcq`/`multi`/`predict`), `debrief.expectedReasoning`, pont vers preuves
(`capstoneToEvidence`) et remédiation (`capstoneRemediation`).

- **INTERDIT** de créer un second moteur d'assessment/capstone/scénario.
- V48 **ajoute des capstones** (données) à ce moteur : agents, LLM-engineering,
  architecture-refactor, et approfondit ml/rag. Chaque capstone = 7 phases =
  unités substantielles (raisonnement, pas quiz).
- Le bruit (`useful:false`) matérialise « informations inutiles » ; l'absence
  délibérée d'un artefact matérialise « informations manquantes ».

### 2. Deep practice = ambiguïté + diagnostic, pas « input propre → sortie »

Les nouveaux exercices D4/D5 doivent embarquer au moins un de : donnée
imparfaite, symptôme à investiguer, hypothèses concurrentes, trade-off,
contrainte de production, ou choix entre plusieurs solutions valides. Un
exercice « nettoie l'entrée puis calcule » reste D2/D3 et n'est pas compté comme
deep practice.

### 3. Data/ML — étendre le track réel `python-ds`, portabilité préservée

- Nouveaux exercices `python-ds` (pandas/sklearn RÉELS) pour imbalance, métrique
  trompeuse, fuite temporelle, mauvaise feature, calibration, drift.
- **Le venv reste opt-in** : absent ⇒ `TOOLING_ENVIRONMENT_REQUIRED`, sautés
  proprement. La **suite de tests CI principale reste déterministe** (les
  `python-ds` sont sautés si le venv manque, comme `python3` l'est sans Python).
- Interdits maintenus : pas de faux sklearn, pas de binaires commités, pas de
  réseau au runtime, pas d'install globale.

### 4. LLM engineering — frontière d'honnêteté (aucun modèle réel)

Aucun appel de modèle. Les exercices `llm`/`eval` manipulent des **entrées,
sorties fournies, traces, budgets de tokens, résultats de retrieval, appels
d'outils, erreurs, coûts** et **évaluent les décisions d'ingénierie**. La logique
d'ingénierie est **réelle et exécutable localement** ; les signaux non calculables
hors ligne restent `PROXY` ; toute donnée de sortie de modèle est `SIMULATION`
étiquetée. On vise à faire passer `llm` de D4=0 à ≥2 D4.

### 5. Cloud/infra — statut inchangé

Pas de fausse exécution. Docker/K8s/cloud restent `EXTERNAL_ENVIRONMENT_REQUIRED`.
Le raisonnement sur artefacts (manifests/logs/configs) est autorisé mais reste
étiqueté (statut existant), sans prétendre à une exécution.

### 6. Anti-collision & anti-seconde-source (maintenus)

- Unicité d'ids sur toutes les familles d'artefacts (hard-fail `v48:check`,
  hérité de `v47:check`).
- Aucune nouvelle source de vérité : read-models dérivés (`practice-coverage`,
  `curriculum-graph`) réutilisés ; pas de catalogue parallèle.

### 7. Gate `v48:check`

Étend `v47:check` : corpus gelé, collisions, floors D3/D4/D5 et unités
substantielles V48, existence des scénarios pro par domaine cible, frontière LLM
(aucun exercice `llm`/`rag`/`agents` non-code sans `practiceMode`), références
mortes (exos/leçons/misconceptions/capstones), progress.json non modifié.

## Conséquences

- L'apprenant gagne des boucles professionnelles complètes sur agents,
  LLM-engineering et architecture, en plus de la pratique exécutable approfondie.
- Aucun moteur ajouté ; la surface de vérité reste unique.
- Le venv Data/ML reste un accélérateur opt-in, jamais une dépendance dure de CI.

## Étiquettes de preuve (rappel)
`LOCAL_EXECUTABLE` · `TOOLING_ENVIRONMENT_REQUIRED` · `SIMULATION` · `PROXY` ·
`EXTERNAL_ENVIRONMENT_REQUIRED`.
