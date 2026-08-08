# Cohérence des parcours — audit V29

Audit CP9 des 6 parcours disponibles et des 3 parcours annoncés, après l'enrichissement
V29 (socle P0, Frontend/React, Data/SQL, Software Engineering). Question directrice :
« l'enrichissement V29 rend-il un parcours incohérent, et un parcours annoncé
(Frontend/Data) est-il désormais réellement livrable ? ». Réponse : les 6 disponibles
restent cohérents (durée dérivée inchangée), et les parcours Frontend/Data restent
**annoncés** (le socle de connaissance a été renforcé, mais pas la curation jour-par-jour
d'un parcours dédié).

## 1. Rappel du modèle

Un parcours réutilise des **journées existantes** (via des modules qui référencent des
`dayRefs`) ; sa durée est DÉRIVÉE (`totalDays == jours réellement résolus`, vérifié au
chargement du catalogue et par test). Les **Leçons de fond** (bibliothèque de connaissance
canonique) sont rattachées par DOMAINE (catégorie) et reliées à la pratique par
`practiceRefs` ; elles enrichissent la profondeur d'un domaine **sans** modifier la
structure en jours des parcours. V29 ajoute donc de la profondeur de connaissance et des
liens vers la pratique, pas des journées.

## 2. Parcours disponibles (6) — durée dérivée inchangée

| Parcours | Statut | Modules | Jours dérivés | Cohérent |
|---|---|---|---|---|
| ai-engineer-foundations-v1 | available | 12 | 365 | ✅ |
| fullstack-typescript | available | 11 | 119 | ✅ |
| backend-engineer-v1 | available | 8 | 85 | ✅ |
| systems-cloud-foundations-v1 | available | 8 | 31 | ✅ |
| appsec-cloud-security-v1 | available | 7 | 15 | ✅ |
| cloud-devops-engineer-v1 | available | 7 | 29 | ✅ |

Cohérent = `totalDays` déclaré == jours réellement résolus (vérifié programmatiquement,
inchangé par V29 puisqu'aucune journée n'a été ajoutée/retirée).

## 3. Enrichissement de la bibliothèque de connaissance (V29)

V29 a porté le corpus de 100 à **109 Leçons de fond**, en renforçant trois domaines à fort
enjeu employabilité et le socle de premier contact :

- **Frontend & React** (nouvelle catégorie, 5 leçons) : `browser-dom-rendering` →
  `react-fundamentals` → `react-hooks-effects` → `react-composition-architecture` /
  `react-accessibility`. Reliées aux 26 exercices `react-tsx`/`web` existants.
- **Data & SQL** (8 leçons) : `sql-foundations`, `database-modeling`,
  `sql-performance-indexing`, `database-transactions-concurrency`, `database-migrations`
  (+ pandas/cleaning/etl). Pratique par raisonnement relationnel `node-js`.
- **Software Engineering & architecture** (9 leçons) : ajout de `refactoring-legacy-code`,
  `technical-debt`, `breaking-changes-compatibility` ; durcissement de
  `testing-foundations`, `error-handling`, `design-patterns-intro`, `architecture-basics`.
- **Fondations** (socle P0 durci) : `terminal-shell-filesystem`, `git-fundamentals`,
  `data-structures-intro`, `typescript-basics` (+ `sql-foundations` côté Data).

## 4. Impact par parcours (connaissance, pas jours)

- **fullstack-typescript** : sa dimension FRONTEND est désormais couverte par un parcours de
  connaissance cohérent (navigateur/DOM → React → architecture → accessibilité), là où il
  n'existait que 2 leçons React sans rampe ni pratique liée. Le parcours reste à 119 jours
  (structure inchangée) mais la profondeur frontend disponible pour l'apprenant est
  substantiellement meilleure.
- **backend-engineer-v1** : sa dimension DONNÉES (index/plans, transactions/concurrence,
  migrations) et GÉNIE LOGICIEL (refactoring/legacy, dette technique, changements cassants)
  est nettement renforcée, avec pratique reliée.
- **ai-engineer-foundations-v1** (programme complet) : bénéficie de tout l'enrichissement,
  ses journées Fondations/Web/Data/SE renvoyant à des leçons plus solides.
- Les 3 parcours orientés exploitation/sécurité/cloud (systems-cloud, appsec-cloud,
  cloud-devops) sont inchangés (domaines déjà couverts en V26/V27/V28).

## 5. Parcours annoncés (Frontend / Data) — pourquoi ils restent `announced`

Le catalogue expose déjà `frontend-engineer-v1` et `data-ml-v1` en statut **annoncé**
(`totalDays: 0`, sans modules). V29 **ne les promeut pas** en `available`, conformément au
principe « un parcours ne devient disponible que si corpus + pratique + progression + durée
crédible + audit le justifient » :

- V29 a renforcé la **connaissance canonique** (leçons + pratique liée) de ces domaines,
  mais **pas** la curation d'un enchaînement jour-par-jour dédié (modules → `dayRefs`) qui
  ferait un parcours autonome à durée crédible.
- Promouvoir un parcours sans cette curation afficherait `totalDays: 0` ou une durée
  bricolée — du greenwashing pédagogique, explicitement refusé.

Ces parcours restent donc honnêtement **annoncés** ; leur activation (curation de journées +
projets fil rouge) est une dette documentée pour V30.

## 6. Honnêteté (pas de greenwashing)

- Aucun parcours n'a changé de durée : V29 ajoute de la profondeur de connaissance, pas des
  journées, et ne prétend pas le contraire.
- Aucun parcours annoncé n'est promu sans curation réelle.
- La bascule de parcours, l'isolation de progression, la recherche et le backup restent
  couverts par les tests existants (track-aggregate, backup-multitrack, v2x-e2e) ; V29 n'y
  touche pas.
