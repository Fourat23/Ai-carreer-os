# V47 — Intégration au curriculum (relations seulement, corpus GELÉ)

Le corpus académique est **ACADEMICALLY_FROZEN**. Aucune leçon, aucun jour,
aucun `data/program.json`, aucun Markdown de `curriculum/lessons/**` n'a été
modifié par V47. L'intégration des nouveaux artefacts se fait **uniquement par
des relations dérivées**, jamais par une écriture dans le corpus.

Preuve de non-régression du corpus (au sprint V47) :
- `curriculum:check` : 365/365 jours, 52/52 semaines, 12/12 mois, 128 leçons — OK.
- `v42:check` : graphe du curriculum **sans référence morte** (46 misconceptions,
  tous les `lessonRefs`/`exerciseRefs` résolus).
- SHA-1 du corpus inchangé (vérifié en clôture CP15).

## Comment V47 se relie au parcours SANS toucher au corpus

Trois canaux de relation, tous en lecture dérivée :

1. **Projection de compétence (skill → programme).** Chaque exercice V47 porte
   des `skills` fines résolues vers les 20 compétences de programme par
   `lib/skill-taxonomy.mjs` (ex. `pandas`→`python`, `machine-learning`→`ml`,
   `evaluation`→`evalia`). `lib/practice-coverage.mjs` agrège alors ces exercices
   dans la matrice de couverture par compétence. Compétences de programme
   touchées par les 25 exercices V47 :

   | Compétence programme | Exercices V47 (exemples) |
   |----------------------|--------------------------|
   | `ml`      | pdx-fix-dtype-sum, skl-pipeline-cv, skl-confusion-matrix, skl-logreg-accuracy |
   | `python`  | pdx-dropna-count, pdx-groupby-mean, pdx-merge-inner, skl-train-test-split |
   | `evalia`  | eval-exact-match, eval-groundedness-proxy, eval-regression-gate, eval-harness-report |
   | `llm`     | llm-token-estimate, llm-cost-per-call |
   | `agents`  | eval-tool-call-contract |
   | `patterns`| patterns-strategy-table, patterns-adapter-legacy, patterns-when-not-yagni |
   | `archi`   | arch-layer-violation, arch-cycle-detect, arch-idempotent-handler |

   Aucun `practiceRef` n'est ajouté dans une leçon gelée : la relation naît de la
   projection, calculée à la lecture.

2. **Remédiation (misconception → leçon existante + exercice).** Les 8
   misconceptions V47 (`lib/misconceptions.mjs`) pointent chacune vers des
   `lessonRefs` **déjà présents** dans le corpus (ex. `machine-learning-basics`,
   `ai-evaluation`, `rag-evaluation`, `architecture-basics`,
   `design-patterns-intro`) et vers des exercices V47. La boucle
   `échec → misconception → explication → remédiation → exercice/leçon → retry`
   se referme sans ajouter de contenu au corpus.

3. **Culmination (exercices → capstone existant).** Les 3 scénarios pro
   (`docs/PROFESSIONAL-PRACTICE-V47.md`) enchaînent des exercices V47 puis
   réutilisent un capstone **existant** (`data-ml-validation-production-gap`,
   `applied-ai-rag-regression`, `backend-latency-after-release`). Aucun nouveau
   moteur, aucune seconde source de vérité.

## Ce que V47 n'a délibérément PAS fait

- **Pas d'ancrage jour-par-jour.** Comme en V46, les exercices ne sont pas
  inscrits dans `data/day-exercises.json` : cela reviendrait à réorganiser le
  parcours de 365 jours (interdit). Ils restent atteignables par la compétence.
- **Pas de reclassement de leçon** ni de modification d'intention pédagogique.
- **Pas de création de compétence de programme** : les 20 restent autoritaires ;
  la taxonomie ne fait que RÉSOUDRE des synonymes vers elles.

## Frontière honnête

L'intégration rend les exercices V47 **découvrables et comptés par compétence**.
Elle ne prétend pas qu'ils sont insérés dans la séquence quotidienne : ce serait
un mensonge de structure. La relation est réelle (projection + remédiation +
capstone), pas cosmétique, et strictement additive.
