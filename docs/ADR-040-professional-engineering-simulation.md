# ADR-040 — Professional Engineering Simulation & Integrated Capstones

Statut : accepté (Sprint V40). Décision fondée sur l'audit CP0 réel. **Priorité : pédagogie > transfert >
raisonnement d'ingénieur > cohérence parcours > réutilisation > preuves > qualité technique > quantité >
UI.** Local, mono-utilisateur, sans auth/SaaS/réseau, **une seule source de vérité**, sans fausse « IA
adaptative » ni fausse infrastructure.

## Problème (établi au CP0)
Après V26→V39, le corpus est riche. Le manque n'est plus « assez de contenu ? » mais : **l'apprenant
sait-il mobiliser plusieurs compétences ensemble dans une situation professionnelle ambiguë ?** Le
parcours dominant est `cours → exercice → assessment`. Il manque : `situation métier → hypothèses →
preuves → diagnostic → décision → remédiation → validation → communication → debrief`.

L'audit CP0 a comparé les briques existantes :
- **Missions** (`lib/mission.mjs`) : scénario long mais **orienté livrables** (produire code/doc/metrics),
  pas raisonnement diagnostique par phases avec artefacts et hypothèses concurrentes.
- **Assessments** (`lib/assessment.mjs`, V39) : questions isolées à taxonomie, pas de scénario multi-étapes.
- **Labs** (k8s/pipeline/cloud/security), **playbooks** : méthode et scénarios réutilisables.

## Décisions

### D1 — Un capstone est une COMPOSITION, jamais un second moteur
Un capstone se construit **au-dessus** des moteurs existants :
- le **scoring** réutilise `gradeQuestion` de `lib/assessment.mjs` (mcq/multi/predict, correction par
  comparaison de données) — chaque phase contient des questions ;
- l'**evidence** réutilise le patron de `mission-state.recordMissionCompletion` (evidence typée + montée
  de `skill-state`) ;
- la **remédiation** réutilise `skill-state`, `review`, le Curriculum Graph et les
  `lessonRefs/exerciseRefs/playbookRefs` ;
- **aucun** `mastery-engine-v2`, aucun `capstone-skills.json`, aucune taxonomie concurrente.

### D2 — Modèle `lib/capstone.mjs` PUR (validation + scoring par phases)
Miroir de `assessment.mjs`. Un capstone porte : `context`, `signal`, `artifacts[]` (signal + bruit),
`phases[]` (chacune = un moment de raisonnement contenant des questions déterministes), `debrief`.
`gradeCapstone` agrège les phases via `gradeQuestion`, renvoie résultat par phase, global, compétences
mobilisées/faibles, et le pont evidence. PUR : aucun I/O, aucune horloge implicite, aucun LLM.

### D3 — Phases de raisonnement (allowlist)
`hypotheses → investigation → diagnosis → decision → remediation → validation → communication`.
`diagnosis` est obligatoire (au moins une phase). La cause **n'est pas donnée** dans le contexte/signal :
elle se déduit des artefacts. La phase `communication` reste évaluée **structurellement/déterministement**
(choix des bons éléments d'un compte rendu), sans prétendre juger la qualité rédactionnelle humaine.

### D4 — Artefacts : signal + bruit
`artifacts[]` fournit des éléments plausibles (logs, métriques, diff, config, manifest, payload, résultat
SQL, trace…). Certains sont **non déterminants** (`useful:false`) — l'apprenant doit distinguer signal et
bruit. `useful` sert au debrief et au gate (au moins un artefact non déterminant), **jamais** affiché
comme réponse avant soumission.

### D5 — Evidence `capstone` (extension justifiée du modèle existant)
`assessment` ne suffit pas : un capstone mobilise **plusieurs compétences sur plusieurs phases** — c'est
une preuve plus forte qu'un MCQ. On étend `EVIDENCE_TYPES` avec `capstone` (additif, comme V39 a ajouté
`assessment`). `capstoneToEvidence(capstone, result)` produit une evidence
`{ type:'capstone', skills, title, url, createdAt, ... }` consommée par la règle EXISTANTE de
`skill-state` (evidence → `demonstrated`). **Jamais** « mastered » automatique ; un capstone réussi reste
un PROXY, pas une maîtrise absolue.

### D6 — Remédiation exploitable
`capstoneRemediation(capstone, result)` dérive, à partir des phases échouées : compétences fragiles,
leçons recommandées (`lessonRefs`), exercices (`exerciseRefs`), playbooks (`playbookRefs`), et pousse la
révision espacée existante. La boucle cible : **capstone → evidence → skill-state → remédiation → review**.

### D7 — Sûreté progress.json (choix explicite)
Comme `/diagnostics` (V39), l'UX `/capstones` **corrige en local et n'écrit rien d'office** dans
`progress.json`. La boucle evidence est prouvée RÉELLE par des fonctions pures + tests ; la remédiation
est rendue exploitable par des liens actionnables (leçons/exos/révisions). Un enregistrement de preuve
resterait un opt-in réutilisant le flux existant (hors périmètre write-risk de ce sprint).

### D8 — Gate `v40:check` (structure, jamais longueur)
Valide : capstones bien formés ; `skills` ∈ compétences de programme ; `lessonRefs/exerciseRefs/
playbookRefs/dayRefs` résolus ; ≥ 3 phases dont ≥ 1 `diagnosis` ; ≥ 3 artefacts dont ≥ 1 non déterminant ;
questions déterministes (invariants d'`assessment`) ; **anti-leak** (le signal ne contient pas
littéralement la bonne réponse de diagnostic) ; frontière SIMULATION présente sur les domaines simulés ;
debrief non vide. Câblé dans `gates:active`.

### D9 — Audit honnête des questions `TRANSFER` V39
Les 16 questions marquées `TRANSFER` sont ré-auditées avec une grille explicite (contexte nouveau ?
informations concurrentes ? plusieurs étapes ? au-delà de la reconnaissance ?). Reclassement honnête si
nécessaire ; rapport dédié. Le nom `TRANSFER` n'est jamais une preuve.

### D10 — Capstones cibles : 4 solides (5e au mérite)
Backend/DB/incident, Frontend/React/a11y, Cloud/K8s (réutilise les Labs, tout SIMULÉ), Applied AI/RAG.
Un 5e (Data/ML) **seulement si** l'audit prouve un scénario distinct de valeur ; sinon approfondir les 4.
**4 excellents > 5 moyens.**

## Conséquences
- **Positives** : le travail intellectuel d'ingénieur est simulé proprement, en composant l'existant ;
  transfert réellement exercé et évalué ; une seule source de vérité préservée.
- **Coûts** : le corpus de capstones est exigeant à écrire (qualité > quantité) ; la frontière
  SIMULATION/PROXY doit être répétée dans l'UX.
- **Rejeté** : moteur de compétence/évaluation parallèle (D1), auto-write progress.json depuis l'UX (D7),
  « IA adaptative » (D1), revendication de maîtrise (D5).
