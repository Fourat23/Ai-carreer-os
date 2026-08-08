# ADR-029 — Durcissement du socle + Frontend/React + Data/SQL + Software Engineering

Statut : accepté (Sprint V29). Décision fondée sur l'audit CP0 réel (état vérifié, non
supposé). **Priorité produit : compréhension réelle par un néophyte > cohérence des
parcours > pratique > qualité logicielle > fonctionnalités > UI.** Local,
mono-utilisateur, sans auth, sans SaaS, sans réseau requis, **sans nouveau moteur**
(progression, exercices, missions, preuves, compétences, catalogue, glossaire, runtimes
restent uniques).

## Problème produit (établi au CP0)

Le corpus n'est plus limité par le manque de Labs/features mais par un **déséquilibre
pédagogique**. Les domaines récents (Linux, réseau, Docker, CI/CD, K8s, cloud, sécurité,
obs/SRE) sont au standard V27 (100 leçons, dont ~45 conformes P3). Mais :

1. **Dette P0 de premier contact** encore ouverte sur 5 leçons fondatrices, sans rampe
   d'accès ni modèle mental : `terminal-shell-filesystem`, `git-fundamentals`,
   `sql-foundations`, `data-structures-intro`, `typescript-basics`. Ce sont pourtant les
   toutes premières rencontres du débutant avec l'informatique.
2. **Frontend/React sous-doté en LEÇONS** : seulement 2 leçons (`react-fundamentals`,
   `react-hooks-effects`), au vieux gabarit (ni on-ramp, ni prérequis), et — constat clé
   du CP0 — **sans aucun `practiceRef`** alors que la pratique frontend existe déjà en
   abondance.
3. **Data/SQL** : `sql-foundations` est P0, `database-modeling` P1, et surtout **il
   n'existe AUCUN exercice exécutable de SQL/données relationnelles** (0 exo, pas de
   runtime SQL).
4. **Software Engineering** : `testing-foundations`, `design-patterns-intro`,
   `architecture-basics` sont sans rampe/modèle mental ; les sujets pro (dette technique,
   tests de caractérisation, régression, breaking change, feature flags, rollback) sont
   dispersés ou absents.

## Découverte CP0 déterminante — la pratique frontend existe déjà

Contrairement à l'hypothèse du prompt, le moteur d'exercices porte **déjà** :
- runtime `react-tsx` : **15 exercices** (react-hello, react-counter, react-toggle,
  react-conditional, react-list, react-lift-state, react-search, react-debug-*…) ;
- runtime `web`/DOM : **11 exercices** (web-card, web-nav, web-semantic, web-list-filter,
  web-inline-style, web-debug-*…) ;
- runtime `typescript` : **15 exercices** (ts-generic-first, ts-union-area,
  ts-interface-cart, ts-debug-*…) ;
- taxonomie de skills déjà prête : `react, jsx, props, state, events, hooks, forms,
  lifting-state, dom, html, css, accessibility, responsive, typescript`.

**Conséquence** : V29 n'invente aucun moteur ni runtime pour le frontend. Il relie les
leçons à cette pratique existante via `practiceRefs`, et ne crée de nouveaux exercices
que pour des trous réels.

## Décision 1 — Éliminer la dette P0 de premier contact (correction additive)

Corriger les 5 leçons P0 avec le patron V27/V28 déjà éprouvé : ajout on-ramp « 🌍 Le
problème d'abord » AVANT l'objectif, « 🧩 Prérequis » rédigés, « 🧠 Modèle mental » si
absent, homogénéisation des titres, et `practiceRefs` vers des artefacts **existants**.
Le contenu technique correct est **conservé** (jamais de suppression arbitraire).

## Décision 2 — Corpus Frontend/React cohérent (durcir 2 + créer les manquantes)

Durcir les 2 leçons React existantes et créer un ensemble FOCALISÉ (qualité > quantité)
comblant les trous du modèle mental de rendu, chacune au standard V29 :

- navigateur, DOM et cycle de rendu (pourquoi manipuler le DOM à la main est fragile) ;
- React : pourquoi un modèle déclaratif (`state → render → UI → interaction → state`) ;
- composants, JSX et props (composition) ;
- state, events et cycle de rendu ;
- listes, keys, formulaires et state lifting ;
- `useEffect` et synchronisation avec l'extérieur (dépendances, cleanup, états
  loading/error/empty/success, race conditions de base) ;
- architecture React (composition, custom hooks, state dérivé vs stocké, context).

Cible indicative ~6–8 leçons nouvelles/reconstruites, **ajustable à la baisse** si la
qualité l'exige. Aucune leçon ne doit devenir une encyclopédie ; les hooks ne sont pas
enseignés comme une liste de recettes mais via le modèle de rendu. Chaque leçon est
reliée aux exercices `react-tsx`/`web` existants par `practiceRefs`.

## Décision 3 — Data/SQL : combler les trous, pratique par raisonnement relationnel

Durcir `sql-foundations` (déjà en P0, traité en CP3) et `database-modeling`, puis créer
les leçons nécessaires à une progression cohérente (jointures, index & plans, transactions/
ACID/isolation, migrations & compatibilité, N+1 & performance).

**Décision d'architecture clé** : le moteur n'a **pas** de runtime SQL et V29 n'en
introduira **pas** (garde-fou « pas de second moteur »). La pratique SQL/données est
modélisée par des exercices `node-js` de **raisonnement relationnel** (des lignes =
tableaux d'objets ; implémenter la logique de JOIN/GROUP BY/agrégation/déduplication en
JS déterministe). Cela enseigne le RAISONNEMENT sur les données sans prétendre exécuter
du vrai SQL — et c'est étiqueté honnêtement comme tel dans les leçons.

## Décision 4 — Software Engineering / Testing / Architecture

Durcir `testing-foundations`, `error-handling`, `design-patterns-intro`,
`architecture-basics`, et créer les leçons pro manquantes réellement importantes :
tests de caractérisation & régression, refactoring sûr / code legacy, dette technique
(principal/intérêt, volontaire/accidentelle, code/archi/test/data/infra/doc), sécurité de
livraison (breaking change, compatibilité, dépréciation, hotfix/bugfix/patch, feature
flags, rollback vs roll-forward, smoke test, vérification post-déploiement). Ces leçons
se RÉFÈRENT à V17/V18/V21/V28 (déjà présentes), sans dupliquer.

## Décision 5 — Réutiliser le moteur d'audit + gate `v29:check`

Étendre `lib/pedagogy-audit.mjs` (16 dimensions) et le format de ledger ; ajouter deux
signaux structurels pédagogiques : **concept-density / surcharge cognitive** (alerte si
une leçon introduit trop de concepts nouveaux d'un coup) et **jargon non introduit**
(termes techniques employés avant définition — heuristique explicitement présentée comme
un proxy, jamais comme une preuve de compréhension). Nouveau `scripts/v29-check.mjs`
(esprit v27/v28) validant le périmètre V29 déclaré dans un plan. `v26/v27/v28:check`
**restent actifs** (périmètres vivants distincts).

## Alternatives rejetées

- **Introduire un runtime SQL** : rejeté — viole « pas de second moteur » pour un gain
  incertain ; le raisonnement relationnel en `node-js` couvre l'objectif pédagogique.
- **Réécrire les 2 leçons React de zéro et jeter le contenu** : rejeté — correction
  additive, contenu correct conservé.
- **Créer les parcours Frontend Engineer / Data Engineer** : rejeté en V29 — un parcours
  ne passe `available` que si corpus + pratique + progression + durée + audit le
  justifient (cf. CP9). Restent `announced` sinon.
- **Atteindre un quota de leçons** : rejeté — « une excellente leçon vaut mieux que cinq
  superficielles ».
- **Refonte UI/UX globale, gamification** : hors scope, différées.

## Risques et limites

- La pratique SQL est SIMULÉE en JS (raisonnement relationnel), pas exécutée sur un vrai
  SGBD — étiqueté honnêtement.
- L'audit rétroactif reste partiel : les P1/P2 hors domaines V29 (AI/ML, prod ancienne,
  carrière) restent dette documentée pour V30.
- Les scores d'audit et les heuristiques (densité, jargon) sont des proxys ; le
  walkthrough néophyte (CP11) reste une lecture experte, pas un test utilisateur.

## Migration additive

Ajout/durcissement de leçons, ajout de `practiceRefs`, d'exercices, de missions/playbooks,
d'un gate et d'un ledger, enrichissement du glossaire. Aucune donnée détruite, aucun jour
réécrit, `progress.json` (runtime, gitignoré) préservé et restauré.
