# ADR-050 — Intégration temporelle du curriculum & verrou de parcours (V50)

## Statut
Accepté (V50, CP1).

## Contexte

Le corpus (128 leçons) est ACADÉMIQUEMENT GELÉ (SHA-1 `4c1f3028…`). La pratique
(376 exercices, 13 scénarios, 25 transferts, 57 misconceptions) est mature. Mais
l'audit CP0 (le dépôt fait foi) révèle une **rupture d'intégration temporelle** :

- **189/376 exercices orphelins** du parcours quotidien (jamais atteints en
  suivant Jour 1 → 365), dont **les 114 exercices professionnels V46-V49**.
- **Mois 7 à 12 quasi sans pratique mappée** (M7=0, M8=0, M9=0, M10=1, M11=4,
  M12=0), alors que ces mois enseignent ML/DL/LLM/RAG/agents/evalia.
- **Oubli** : toute compétence fondamentale disparaît >90 jours jusqu'à la fin
  (algo −317 j, ds −323 j, jsts −246 j, http −274 j, sql −225 j, python −218 j).

Le problème n'est plus « avons-nous X ? » mais « l'apprenant rencontre-t-il X au
bon moment, avec assez de rappels et de pratique ? ».

## Décisions

### 1. Le programme 365 jours devient la colonne vertébrale — intégration ADDITIVE

On n'ajoute PAS de `program-v2`. On INTÈGRE les **activités** (exercices, revues,
transferts, scénarios) au parcours existant via :
- `data/day-exercises.json` (mapping AUTHORED jour→exercices, déjà consommé par
  l'app et le Curriculum Graph) — **ce n'est ni le corpus gelé, ni progress.json**.
- un **read-model dérivé** `lib/curriculum-timeline.mjs` qui reconstruit, pour
  chaque jour, la chaîne complète (concepts, compétences, pratique, revue,
  diagnostic, transfert, scénario, preuve) sans détenir de vérité propre.

### 2. Le séquençage des JOURS n'est PAS réordonné

Les fondations et l'ordre macro des 365 jours sont stables (V45.x les a certifiés).
V50 **repositionne des ACTIVITÉS**, il ne déplace pas les concepts. Aucune journée
n'est renumérotée, aucune leçon gelée n'est modifiée.

### 3. Modèle temporel (rôles pédagogiques, PAS une source de vérité)

Un concept suit idéalement, dans le temps :

`T0 introduction → T1 application → T2 rappel actif → T3 diagnostic →
T4 variation → T5 transfert → T6 réactivation distante → T7 scénario pro`

Les intervalles sont indicatifs, non rigides. On étiquette chaque activité par un
**rôle** dérivé (NEW, PRACTICE, REVIEW, DIAGNOSTIC, TRANSFER, PROFESSIONAL) —
attribut de lecture calculé, jamais un nouveau champ persisté concurrent.

### 4. Réutilisation du moteur de révision existant

La réactivation réutilise le `review` engine et les **52 jours `isReview`** déjà
présents. **Aucun second scheduler**, aucun moteur de progression concurrent.

### 5. Règles d'intégration (déterministes, vérifiables par le gate)

- Un exercice n'est rattaché qu'à un jour **dont la compétence projetée
  correspond** à la sienne ET **≥ jour de première exposition** de cette
  compétence (prérequis respecté : jamais de pratique avant l'introduction).
- Distribution : on privilégie les jours peu chargés et les fenêtres vides
  (M6-M12) ; plafond par jour pour éviter la surcharge.
- Réactivation : les exercices de compétences fondamentales peuvent être placés
  sur des jours de révision tardifs partageant la compétence.
- Aucun exercice orphelin professionnel ne doit subsister après V50.

### 6. Frontières d'honnêteté (inchangées)

`cloud` reste `EXTERNAL_ENVIRONMENT_REQUIRED` : le curriculum énonce des
**External Practice Contracts** (quoi faire dehors, quand, quelle preuve), sans
fausse infra. `comm`/`autonomy` restent `NON_CODE` : preuves qualitatives
structurées (debrief, ADR, post-mortem), aucun faux score.

### 7. Verrou : CURRICULUM 1.0

À la clôture, `docs/audits/CURRICULUM-1.0-FREEZE.md` déclare STABLES l'ordre macro
des 365 jours, les fondations, les dépendances et les grandes transitions. Restent
ADDITIFS sans version majeure : nouveaux exercices/variantes/transferts/
diagnostics/missions et corrections factuelles. Toute réorganisation ultérieure
exige un ADR + preuve d'un défaut bloquant.

## Conséquences

L'apprenant qui suit le parcours rencontre désormais la pratique professionnelle
au bon moment ; les fondamentaux sont réactivés ; les mois vides sont comblés — le
tout sans nouveau moteur, sans seconde source, sans toucher au corpus gelé, et
avec un parcours désormais verrouillé pour permettre un apprentissage réel.
