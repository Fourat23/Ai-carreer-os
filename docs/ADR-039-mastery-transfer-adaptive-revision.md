# ADR-039 — Maîtrise, évaluation de transfert & révisions adaptatives

Statut : accepté (Sprint V39). Décision fondée sur l'audit CP0 réel. **Priorité : pédagogie >
cohérence curriculaire > pratique > fiabilité > features > UI.** Local, mono-utilisateur, sans
auth/SaaS/réseau, **une seule source de vérité**, sans fausse « IA adaptative ».

## Problème (établi au CP0)

Le prompt V39 demande un « Mastery Engine », un « moteur de révision » et les pages `/synthese`,
`/revisions`, `/competences`, `/parcours`. L'audit CP0 corrige une hypothèse implicite du prompt :
**la plus grande partie existe déjà et fonctionne.**

Déjà présents et à **NE PAS dupliquer** :
- **États de maîtrise** : `lib/skill-state.mjs` dérive **par règles explicites** (aucun faux score)
  5 états — `not-started / discovered / practiced / demonstrated / to-consolidate` — à partir de
  signaux réels (jours terminés, preuves, révision en attente), plus des niveaux 0-5.
- **Révision espacée** : `lib/review.mjs` — moteur SM-2 **déterministe, sans « IA »**, horloge
  injectable, `getDueReviews / getUpcomingReviews / calculateNextReview`. Page `/revisions` câblée.
- **Preuves & auto-évaluation** : `lib/learning.mjs` (`EVIDENCE_TYPES`, compréhension, confiance).
- **Vue transversale** : `lib/curriculum-graph.mjs` (arêtes REQUIRES/PRACTICES/BUILDS_SKILL, audité).
- **Pages** : `/skills` (compétences), `/revisions`, `/synthese`, `/parcours`.

**Le seul trou authentique** : il n'existe **aucune couche d'ÉVALUATION structurée à taxonomie**.
Pas de répertoire `data/assessments/`, pas de type de preuve `assessment`, pas de taxonomie
RECALL/UNDERSTANDING/APPLICATION/DIAGNOSIS/TRANSFER. Le plus proche : les 238 exercices déterministes
et **1** exercice de transfert (`system-design-diagnose`, V38).

## Décisions

### D1 — PAS de second « Mastery Engine » ; on RÉUTILISE l'existant
Construire un moteur parallèle avec un vocabulaire concurrent (`fragile / en progression /
opérationnel / solide`) créerait une **seconde source de vérité** — interdit. Les états de maîtrise
restent ceux de `skill-state.mjs`. V39 n'invente aucun état ; il **enrichit les signaux** qui les
alimentent (les preuves d'évaluation), et **surface** l'état existant plus clairement.

### D2 — La couche d'évaluation produit des PREUVES, pas un score parallèle
Une évaluation réussie devient une **preuve** (`evidence`) typée `assessment`, portant les compétences
concernées. `skill-state.mjs` en dérive déjà l'état (`evidenceCount ≥ 1 → demonstrated`) : **aucune
règle d'état nouvelle**. On réutilise le flux de mutation de preuves existant ; on n'écrit pas un
nouveau writer de progression. La frontière **PREUVE vs PROXY** est explicite : réussir une évaluation
est un **indice**, jamais une « maîtrise prouvée ».

### D3 — Modèle d'évaluation PUR, déterministe, honnête : `lib/assessment.mjs`
Miroir du modèle d'exercice (`lib/exercise.mjs`) : `validateAssessment`, `gradeAssessment` (PUR),
`assessmentTaxonomySummary`. Trois familles de questions **100 % déterministes** :
- `mcq` : choix unique parmi des options, une bonne réponse indexée.
- `multi` : sous-ensemble exact de bonnes réponses (comparaison ensembliste).
- `predict` : prédiction d'une sortie/valeur déterministe (chaîne/entier ; jamais de flottant).
Chaque question porte un **niveau de taxonomie** et une **explication** (feedback). **Aucun** LLM,
aucune notation « intelligente » : la correction est une comparaison de données.

### D4 — Taxonomie d'évaluation (5 niveaux, ordonnés)
`RECALL` (se souvenir) → `UNDERSTANDING` (expliquer) → `APPLICATION` (appliquer) → `DIAGNOSIS`
(diagnostiquer une situation) → `TRANSFER` (transposer à un contexte nouveau, sans qu'on nomme le
concept). Le transfert est le niveau le plus élevé et le plus rare ; on ne le revendique que lorsque
la question exige réellement une transposition.

### D5 — Catalogue de ~12-20 évaluations diagnostiques : `data/assessments/*.json`
Couvre les colonnes clés déjà enseignées (fondations, web/backend, system design, données, sécurité,
IA/ML) plus des défis de **transfert**. Chaque évaluation référence des **compétences de programme**
(taxonomie skill du programme : algo, jsts, http, sql, se, archi, ml, …) et des **leçons**
(`lessonRefs`), et déclare une **remédiation** (leçons à revoir en cas d'échec).

### D6 — Révision adaptative = RÉUTILISATION de `review.mjs`, pas un nouveau moteur
Aucune pseudo-science. La « révision adaptative » se limite à ce que le moteur déterministe existant
fait déjà : intervalle fonction de la compréhension/confiance (espacement), rappel actif (l'apprenant
se teste), et **interleaving** = surfacer, sur la page révisions, des évaluations reliées aux
compétences « à consolider » (mélange des sujets) — sans inventer d'algorithme opaque.

### D7 — Curriculum Graph : arêtes `ASSESSES` et `REMEDIATES` (extension, pas remplacement)
`buildCurriculumGraph` accepte un nouvel intrant `assessments` (données passées par l'appelant, pur).
Nouveau type de nœud `assessment` ; arêtes `ASSESSES` (évaluation → compétence évaluée) et
`REMEDIATES` (évaluation → leçon de remédiation). Nouvelle anomalie **bloquante**
`dead-assessment-ref` (remédiation ou compétence inexistante). Objectif : **0 bloquant** conservé.

### D8 — Gate `v39:check` (structure, jamais profondeur par longueur)
Valide : présence/forme du catalogue, taxonomie dans l'allowlist, `skills` = compétences de programme
connues, `lessonRefs`/remédiations résolus, **déterminisme** (chaque question a une réponse correcte
bien formée, pas d'égalité de flottant), couverture minimale de la taxonomie (au moins un `TRANSFER`
et un `DIAGNOSIS`). Câblé dans `gates:active`.

### D9 — UX apprenant : ÉTENDRE les pages existantes
Nouvelle page `/evaluations` (liste lisible, lecture seule des définitions) + reliures depuis
`/competences` (évaluations par compétence) et `/revisions` (rappel actif interleavé). `/synthese` et
`/parcours` inchangés sauf liens. Aucune page ne prétend mesurer une maîtrise humaine ; chaque écran
rappelle la frontière PREUVE/PROXY.

### D10 — Densité des 4 leçons V38 → **KEEP** (verdict CP0)
`api-production-contracts`, `async-messaging-queues`, `system-design-scaling`,
`distributed-systems-failures` sont **complètes, cohérentes, denses** (131-152 lignes, sections 🧪/💼/🎤
présentes). Aucune n'est un assemblage superficiel (SPLIT injustifié) ; async et distribués sont déjà à
charge cognitive 3 (approfondir **augmenterait** la charge). Décision : **stabiliser**, relier aux
évaluations, ne pas gonfler. NO_COMMIT sur le contenu si aucune reliure n'est nécessaire.

## Conséquences
- **Positives** : un vrai manque comblé (évaluation à taxonomie) sans second moteur ; maîtrise et
  révision restent une source de vérité unique ; tout déterministe et explicable.
- **Coûts** : le catalogue d'évaluations est un corpus à maintenir ; la frontière PREUVE/PROXY doit
  être répétée dans l'UX pour rester honnête.
- **Rejeté** : moteur de maîtrise parallèle (D1), notation « IA » (D3), algorithme de révision opaque
  (D6), revendication « maîtrise prouvée » (D2) — tous incompatibles avec l'honnêteté et l'unicité de
  la source de vérité.
