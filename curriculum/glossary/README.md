# Glossaire IT & monde du travail — format des données

Ce dossier contient la source du glossaire affiché sur la route **`/glossary`** de
l'application. Le glossaire aide un débutant à décoder les acronymes, anglicismes et
expressions du développement, de l'architecture, du cloud, de la data, de l'IA, de la
production, de la gestion de projet et de l'entreprise.

- **Données** : `glossary.json` (un tableau JSON d'entrées, éditable à la main).
- **Logique** (recherche, filtres, validation) : `../../lib/glossary-core.mjs`
  (+ types `../../lib/glossary-core.d.ts`).
- **Chargement serveur** : `../../lib/glossary.ts`.
- **Page** : `../../app/glossary/page.tsx` + `../../app/glossary/GlossaryBrowser.tsx`.
- **Validation** : `npm run glossary:check` (alias `npm run glossary:validate`).
- **Tests** : `../../tests/glossary.test.mjs`.

## Structure d'une entrée

Chaque entrée est un objet JSON. Champs **obligatoires** :

| Champ | Type | Rôle |
|---|---|---|
| `id` | string | Identifiant **stable et unique** (convention : `categorie-terme`, ex. `git-pr`). Ne jamais le renommer : les relations pointent dessus. |
| `term` | string | Le terme ou l'acronyme affiché (ex. `PR`, `rollback`). Unique (insensible casse/accents). |
| `frenchMeaning` | string | La traduction / signification française courte. |
| `category` | string | Un `id` de catégorie contrôlé (voir plus bas). |
| `level` | string | `débutant`, `intermédiaire` ou `avancé`. |
| `shortDefinition` | string | Définition courte (1 phrase), compréhensible par un débutant. |
| `detailedDefinition` | string | Explication approfondie : ce que c'est, pourquoi ça existe, comment ça marche. |
| `usageContext` | string | Dans quel contexte réel le terme est employé. |
| `meetingExample` | string | Une phrase crédible « entendue en réunion » (entre guillemets `« … »`). |
| `plainTranslation` | string | Reformulation en langage simple de ce que veut dire l'interlocuteur. |

Champs **optionnels** (omettre ou `null`/`[]` si non pertinent) :

| Champ | Type | Rôle |
|---|---|---|
| `fullForm` | string \| null | Forme développée d'un acronyme (`null` pour un terme non acronymique). |
| `aliases` | string[] | Synonymes et variantes recherchables (forme longue, français, orthographes). |
| `relatedTerms` | string[] | Liste d'**`id`** d'autres entrées (rendus cliquables). Doivent exister. |
| `possibleConfusions` | string[] | Termes proches à ne pas confondre. |
| `ambiguityNote` | string \| null | Note expliquant les sens multiples (rend l'entrée « ambiguë »). |
| `senses` | object[] | Sens multiples structurés d'un terme ambigu : `{ meaning, domain, hint, example }`. |
| `tags` | string[] | Mots-clés recherchables (sans accents de préférence). |

Une entrée est marquée **« ambiguë »** (badge) si elle a `≥ 2` `senses` **ou** une `ambiguityNote`.

## Catégories (contrôlées)

Définies dans `lib/glossary-core.mjs` (`CATEGORIES`). L'`id` est stable, le libellé est affiché :

`dev` Développement · `git` Git et collaboration · `test` Tests et qualité ·
`arch` Architecture logicielle · `agile` Agile et produit · `pm` Gestion de projet ·
`devops` DevOps et CI/CD · `cloud` Cloud et infrastructure · `network` Réseau et protocoles ·
`db` Bases de données · `data` Data et analytics · `ai` IA et machine learning ·
`security` Sécurité · `prod` Production et exploitation · `itsm` ITSM et support ·
`business` Entreprise et monde du travail · `career` Carrière et recrutement.

## Niveaux (contrôlés)

`débutant` · `intermédiaire` · `avancé` (constante `LEVELS`).

## Comment…

**Ajouter une entrée** — ajoute un objet au tableau de `glossary.json` avec tous les
champs obligatoires, un `id` unique en `categorie-terme`, puis lance `npm run glossary:check`.

**Ajouter un alias** — ajoute la chaîne dans `aliases` de l'entrée. Les alias sont
recherchables et ne doivent pas entrer en collision avec un autre `id` (le validateur le vérifie).

**Ajouter une relation** — ajoute l'`id` cible dans `relatedTerms`. La cible **doit exister**
(sinon le validateur échoue). Une relation ne peut pas se référencer elle-même.

**Ajouter une catégorie** — ajoute `{ id, label }` à `CATEGORIES` dans
`lib/glossary-core.mjs` (et pense à l'ordre d'affichage). Mets à jour ce README.

**Valider** — `npm run glossary:check` (ou `:validate`). Le script détecte : `id`/terme
dupliqués, définition manquante, catégorie/niveau invalides, relations vers un `id`
inexistant, alias en collision, champ obligatoire manquant. Il échoue (code ≠ 0) au moindre
problème et affiche un rapport de couverture.

## Recherche (comportement)

La recherche est insensible à la **casse** et aux **accents**. Elle porte sur `term`,
`fullForm`, `frenchMeaning`, `aliases` et `tags`. Pour éviter les faux positifs (« PR » ne
doit pas matcher « entrePRise »), une requête d'un seul mot matche par **jeton** (exact
partout ; préfixe sur terme/forme/alias dès 3 caractères ; préfixe sur français/tags dès 4).
Une requête multi-mots (« test driven ») matche en sous-chaîne.

## Limites d'exhaustivité

Ce glossaire est une **base initiale** de grande qualité, pas un dictionnaire exhaustif : il
couvre les termes les plus fréquents et utiles pour un débutant. Il est conçu pour être
**étendu à la main** — ajoute une entrée dès qu'un terme récurrent manque. Les sens
multiples des acronymes sont documentés au cas par cas (`senses`/`ambiguityNote`) et ne
prétendent pas couvrir tous les domaines existants.
