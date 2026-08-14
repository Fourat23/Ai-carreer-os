# ADR-043 — Practice Mastery, couverture dérivée & feedback diagnostique

Statut : accepté (Sprint V43). Décision fondée sur l'audit CP0 réel. **Priorité : pédagogie/acquisition >
qualité de la pratique > feedback > progression > réutilisation > preuves > qualité technique > quantité >
UI.** Local, mono-utilisateur, **une seule source de vérité**, sans fausse « IA », sans infra réelle.

## Problème (établi au CP0)
Le corpus de **238 exercices** (tous réellement exécutables) est solide en fondations mais l'audit
automatisé révèle trois trous authentiques : (1) **0/238 feedback diagnostique** (réussite/échec + « attendu
X, obtenu Y », aucune reliure à une misconception) ; (2) **aucune vue de couverture par compétence** —
impossible de savoir si une compétence possède une chaîne cohérente fondation→pratique→autonomie→diagnostic
→variation→transfert→professionnel ; (3) **dette transfert** (5 compétences structurantes sans défi).

## Décisions

### D1 — Read-model de couverture DÉRIVÉ : `lib/practice-coverage.mjs` (PUR)
Aucune vérité propre. Il PROJETTE et COMPOSE les sources existantes (leçons via lessons-map, exercices,
assessments, capstones, transfer-challenges, missions, playbooks, misconceptions) en une **matrice par
compétence de programme** sur 7 dimensions : `foundation`, `practice`, `autonomy`, `diagnostic`,
`variation`, `transfer`, `professional`. Chaque cellule est un **signal explicite** (présent/partiel/absent
+ d'où il vient), jamais un score opaque. **Interdits** : `skills-v2.json`, `practice-database`, second
catalogue, `progression-v2`.

### D2 — Projection fine → programme (documentée, pas une 2e source)
Les exercices utilisent la taxonomie FINE (conditions, functions, react…) ; leçons/assessments/capstones
utilisent les compétences de PROGRAMME (21). `practice-coverage.mjs` porte une **projection documentée**
`FINE_TO_PROGRAM` (conditions/functions/arrays/… → jsts ; algo/recursion/search → algo ; ds/hashmap/stack/
queue → ds ; http → http ; sql → sql ; testing → se ; linux/git → gitlinux ; python/data → python ; react/
dom/css/… → jsts ; secu → secu ; …). C'est une VUE, elle ne modifie ni les exercices ni program.json.

### D3 — Taxonomie de progression de pratique (RÉUTILISE l'existant)
On NE crée PAS une nouvelle taxonomie P0–P8 concurrente : la **difficulté numérique** des exercices (1-4)
et la **taxonomie de transfert T0–T5** (V42) couvrent déjà la nature de la progression. `practice-coverage`
DÉRIVE les dimensions à partir de ces signaux existants (ex. `autonomy` = exercice de difficulté ≥ 3 ;
`transfer` = assessment TRANSFER ou transfer-challenge ; `diagnostic` = assessment DIAGNOSIS, phase capstone
diagnosis, ou exercice de debug). Documenté, pas de vocabulaire nouveau.

### D4 — Feedback diagnostique par COMPOSITION (misconceptions V42)
Plutôt qu'ajouter un hint à 238 fichiers (coûteux, faible valeur unitaire), on RELIE des exercices aux
**misconceptions** V42 via une donnée légère (`exerciseRefs` déjà présents dans misconceptions, complétés
au besoin) et un helper pur `diagnosticFeedback(skill|exerciseId)` qui, sur un échec, surface la
misconception probable + la remédiation ciblée. Langage prudent : « cette erreur est COMPATIBLE avec la
misconception X », jamais « tu ne comprends pas ». Aucun moteur IA.

### D5 — Combler les trous transfert confirmés (au mérite)
Créer des défis de transfert T4/T5 RÉELS pour les compétences structurantes sans couverture (algo/ds,
jsts, secu, cloud), en réutilisant le modèle V42 (`transfer-challenge.mjs`). Anti-faux-transfert vérifié
(pont réel, changement de domaine, multi-étapes, distracteurs). Pas de quota.

### D6 — Gate `v43:check` + matrice
Gate : projection cohérente (toute compétence de programme classée), mappings misconception valides,
aucun exercice orphelin de compétence, aucune source concurrente interdite sur disque. Produit une matrice
lisible. Câblé dans `gates:active`.

### D7 — Pas de création massive ; qualité > quantité
V43 PEUT créer des exercices/défis, mais seulement là où l'audit prouve un trou. Éditer 238 exercices pour
des hints inline est reporté (dette V44, documentée) : la valeur est dans la reliure dérivée + le comblement
transfert ciblé.

### D8 — Réel / Simulé / Proxy
Les exercices restent réellement exécutés (harnais existant). Les défis de transfert d'infra/RAG/ML sont
**SIMULÉS** étiquetés. La couverture et la professional-readiness sont des **PROXYS** structurels, jamais
« compétence maîtrisée ».

## Conséquences
- **Positives** : l'état réel de la pratique devient visible et actionnable par compétence ; les erreurs
  mènent à un feedback conceptuel ; les trous transfert sont comblés ou nommés.
- **Coûts** : pas de hints inline généralisés (dette V44) ; audit qualitatif = échantillon, pas 238
  relectures profondes (honnêtement borné).
- **Rejeté** : second moteur/catalogue (D1), taxonomie P0–P8 concurrente (D3), création massive (D7).
