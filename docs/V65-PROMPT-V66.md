# V66 — proposition, dérivée de la dette réelle de V65

> Préparé à la clôture de V65. **Ne pas lancer avant décision humaine.**
> La portée ci-dessous est déduite de `docs/audits/V65-FINAL-REPORT.md` §25,
> pas décidée à l'avance.

## Pourquoi V65 n'est pas `REFERENCE_READY`

Une seule dette P0 : **le Dashboard et `/synthese` n'ont pas été migrés** sur les
read-models transverses. Ils lisent encore `skillStats()` et
`learning-experience`, deux modèles que V65 a remplacés partout ailleurs. Les
chiffres peuvent donc diverger entre `/` et `/skills` — exactement la seconde
source de vérité que le sprint devait supprimer.

Ce n'est pas un sprint. C'est un préalable, et il devrait ouvrir V66.

## Phase 0 — fermer la dette V65 (préalable, pas un sprint)

1. Migrer `/` et `/synthese` sur `getLearnerOverview()` / `getCompetencySummary()`.
2. Migrer `evidenceTimeline()` de `learning-experience.mjs` sur le ledger, ou le
   retirer.
3. Décider du sort de `days[N].evidence[]` : marqueur UI assumé et documenté, ou
   dérivé du ledger.
4. Vérifier par sonde que `/`, `/skills` et `/history` affichent **la même
   dernière preuve** et **le même décompte**.

Condition de sortie : la question 13 des 25 passe à « oui » sans réserve.

## Phase 1 — REVIEW, RETENTION & MEMORY ENGINE

Le pont de V65 s'arrête au **candidat** de révision. Ce qui manque :

- la planification pilotée par la **preuve**, pas par le seul statut de journée —
  aujourd'hui `getDueReviews` lit `days[*].review`, un champ posé à la clôture ;
- l'**oubli mesuré** plutôt que supposé : le moteur SM-2 existe et fonctionne,
  mais rien ne confronte sa prédiction à ce qui se passe réellement ;
- la boucle complète **révision → preuve → réordonnancement**, dont V65 n'a
  livré que le premier segment ;
- la distinction entre une compétence **jamais revue** et une compétence **revue
  et retombée** — la seconde est un signal fort, aujourd'hui invisible.

### Question à trancher au CP0 de V66

> Le produit peut-il aujourd'hui distinguer « je n'ai pas revu » de « j'ai revu
> et j'ai oublié » ? Et si non, quelle donnée manque exactement ?

### Ce que V66 ne doit pas être

Ni tuteur IA, ni recommandation adaptative, ni score de rétention inventé. Le
même interdit qu'en V65 : **aucun chiffre sans grandeur réelle derrière.**

## Invariants hérités, toujours en vigueur

- une visite ne crée jamais de preuve ni ne fait progresser une compétence ;
- une compétence se projette depuis les preuves, jamais écrite directement ;
- provenance obligatoire, déduplication par clé métier, `createdAt` serveur ;
- historique factuel, aucun événement de navigation ;
- 0 modification de `curriculum/` ;
- `progress.json` intact après navigation ;
- tout nouveau gate **vu échouer** — V65 a montré que quatre règles sur douze ne
  détectaient rien au premier essai.

## Leçon de mesure à emporter

`.rev-track` portait `role="img"` autour de liens depuis V57. La suite axe était
verte pendant huit sprints **parce qu'aucune fixture n'avait jamais rempli
l'échéancier**. Un état vide peut cacher un défaut aussi longtemps qu'on ne le
remplit pas : **tester avec des données réelles fait partie du test.**
