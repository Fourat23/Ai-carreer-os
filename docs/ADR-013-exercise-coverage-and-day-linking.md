# ADR-013 — Couverture d'exercices, taxonomie de compétences et liaison aux journées

Statut : accepté (Sprint V13). Décision pédagogique et de données, concise.
Aucun nouveau runtime, aucune modification de `data/program.json` ni des 365
Markdown.

## Contexte

V8→V12 ont livré un Laboratoire multi-runtime (Node / Python / TypeScript / Web /
React) et 53 exercices pilotes reliés à 26 journées via `data/day-exercises.json`.
La couverture reste inégale : compétence `javascript` trop large (24 usages), une
journée surchargée (j92 = 12 exercices React), des journées pratiques du parcours
actif « AI Engineer — Foundations » sans exercice, et pas de rôle pédagogique
explicite (principal / complément / remédiation / défi). V13 **enrichit le
dispositif pratique et sa liaison au curriculum ; il n'enrichit pas le contenu
rédactionnel des 365 cours.**

## Décisions

### 1. Liaison exercice ↔ journée : `data/day-exercises.json`, pilotée par le besoin

La liaison reste une **fixture pure** (`{ "<jour>": ["<exId>", …] }`) validée au
chargement (jour existant 1..365, exercice connu, pas de doublon). Un exercice
n'est rattaché à une journée que si la journée **enseigne réellement** la
compétence exercée et que les **prérequis** ont déjà été introduits. « Liaison
massive » ne signifie **jamais** viser 365/365 : une journée théorique peut
légitimement rester sans exercice.

### 2. Rôles pédagogiques (représentation minimale, rétrocompatible)

Le rôle est **dérivé**, pas stocké dans la fixture (qui reste un simple tableau
d'ids, rétrocompatible). Convention : dans une journée, le **premier** exercice
de plus faible difficulté est le *principal* ; les suivants sont des *compléments*
(pratique supplémentaire) ; un exercice dont l'id/type est `debug*` sur une
journée de débogage est une *remédiation* ; un exercice de difficulté nettement
supérieure aux autres est un *défi*. Cette dérivation est **pure et testée**
(`roleForExercise`) et n'exige aucune migration ni évolution de schéma.

### 3. Charge par journée bornée

Cible : **1 principal + 0 à 2 compléments** (max 3) sur une journée pratique ;
**0** sur une journée purement théorique. Un validateur pur signale tout
dépassement. Exception tolérée et documentée : les journées « hub » d'un thème
(ex. j92 React) peuvent excéder la cible tant que chaque exercice y est
pédagogiquement à sa place — mais V13 **redistribue** les exercices déplaçables
vers leurs journées propres (conditionnel/listes → j94, etc.).

### 4. Prérequis

Un exercice ne doit jamais apparaître avant que ses prérequis soient enseignés.
Le prérequis est exprimé par le **numéro de journée** minimal : lier l'exercice à
une journée ≥ à la journée d'introduction du concept. Aucun graphe de prérequis
lourd n'est introduit (reporté V14+ si besoin réel).

### 5. Taxonomie canonique des compétences

Les identifiants de compétence d'exercice sont des chaînes libres (preuves). V13
introduit un **résolveur pur** (`lib/skill-taxonomy.mjs`) : synonymes / casses /
pluriels → identifiant **canonique** (ex. `arrays`→`arrays`, `js`→`javascript`,
`hooks`→`hooks`). Le résolveur est **additif et rétrocompatible** : tout id
historique reste résoluble, les anciennes preuves restent valides. Les **nouveaux**
exercices déclarent des compétences **fines et réellement testées** (ex.
`conditions`, `loops`, `functions`, `arrays`, `objects`, `hof`, `recursion`,
`search`, `hashmap`, `stack`, `http`, `errors`, `lifting-state`). On **ne migre
pas** `data/progress.json` (aucune nécessité) et on ne touche **ni** program.json
**ni** les Markdown.

### 6. Règle de création des preuves (inchangée)

Une preuve de compétence n'est créée **que** par une réussite réelle
(`recordExerciseSuccess`, tous tests verts). Le simple **rattachement** d'un
exercice à une journée ne crée **jamais** de preuve et n'augmente **jamais** un
niveau de compétence. Une compétence large (`javascript`) ne remplace pas les
compétences fines réellement évaluées : un exercice déclare les deux quand c'est
justifié, la fine étant la vérité de ce qui est testé.

### 7. Confidentialité (inchangée, réaffirmée)

Aucune indexation ni exposition de : code apprenant, starter, solution de
référence, tests privés, résultats privés détaillés, logs, contenu compilé.
Seules les métadonnées publiques (titre, compétences, langage, runtime,
difficulté, rôle dérivé, statut) alimentent catalogue, recherche et palette.

### 8. Limites honnêtes de la notation

La notation React repose sur le **rendu statique serveur** (structure, props,
état **initial**, listes, accessibilité). Les **transitions par événement** et
les **effets** (`useEffect`) ne sont **pas exécutés** par `renderToStaticMarkup` :
ils sont visibles en **preview** mais **non auto-notés**. V13 n'ajoute **aucun**
exercice prétendant noter un effet ou une interaction non observée ; `useEffect`
reste une démonstration de preview, documentée comme telle. Les protections sont
**applicatives** (sandbox iframe, CSP, allowlist, timeouts, sorties bornées) —
jamais présentées comme une isolation OS.

### 9. Décisions reportées à V14+

- Deuxième parcours réellement disponible et exploitable (priorité V14).
- Graphe de prérequis explicite et UI de rôle riche (si un besoin réel émerge).
- Runtimes shell (Git/terminal) et SQL : hors périmètre tant qu'aucun runtime
  adapté n'existe ; les journées correspondantes restent sans exercice, à dessein.
