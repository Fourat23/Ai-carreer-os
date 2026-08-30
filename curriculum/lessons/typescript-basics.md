<!-- keep -->
# Leçon — TypeScript : typer pour fiabiliser

## 🌍 Le problème d'abord
En JavaScript, rien ne t'empêche d'appeler une fonction avec le mauvais type : tu passes
un texte là où un nombre était attendu, et ça n'explose qu'à l'exécution — parfois en
production, devant un client. Tu passes alors des heures à chercher un bug qu'une simple
relecture aurait pu attraper. **TypeScript** répond exactement à ça : tu ANNOTES ce que
tes fonctions attendent et renvoient, et un vérificateur relit tout ton code AVANT
l'exécution pour signaler les incohérences. C'est comme un correcteur orthographique, mais
pour la cohérence de ton code. Cette leçon te montre comment ces annotations transforment
des bugs d'exécution coûteux en erreurs attrapées en une seconde.

## 🎯 Objectif
Savoir **typer** du JavaScript (signatures, interfaces, unions littérales, génériques,
optionnels), comprendre que la vérification est **statique** (à la compilation, pas à
l'exécution), et utiliser `unknown` + validation comme **frontière** avec toute donnée
externe (fichier, API, sortie de LLM).

## 🧩 Prérequis
Tu dois déjà savoir programmer en JavaScript — valeurs, types, objets, tableaux, fonctions,
notamment la conscience des types et la différence valeur/référence
(`/doc/lessons/javascript-basics`). TypeScript n'est PAS un nouveau langage : c'est
JavaScript avec des annotations. Aucun outillage préalable (`tsc`, `tsconfig`) n'est
supposé : il est présenté ici.

## 🧠 Modèle mental
TypeScript n'exécute rien : c'est **JavaScript + des annotations**, relues par un
compilateur (`tsc`) qui signale les incohérences AVANT l'exécution ; le code produit est du
JS normal. Conséquence CAPITALE à intégrer tout de suite : les types existent à la
COMPILATION et DISPARAISSENT à l'exécution. TypeScript ne vérifie donc PAS les données au
moment où elles arrivent (une réponse d'API, une sortie de LLM) — il faut, à ces
frontières, une validation qui s'exécute vraiment.

## 💡 Pourquoi c'est important
TypeScript est le standard de l'industrie pour tout projet JS sérieux. La raison est économique : un bug attrapé à la compilation coûte des secondes ; le même bug en production coûte des heures (ou des clients). Le typage est aussi une **documentation vérifiée** : la signature dit le contrat, le compilateur le fait respecter partout, pour toujours. Pour tes futurs systèmes IA, c'est vital : la sortie d'un LLM est par nature incertaine — la frontière typée est ce qui empêche cette incertitude de contaminer ton application.

## Explication complète

### Le vérificateur au-dessus de JavaScript, en détail
TypeScript n'exécute rien : c'est JavaScript + des annotations, relues par un compilateur (`tsc`) qui signale les incohérences AVANT l'exécution. Le code produit est du JS normal. Donc : mêmes concepts qu'en JS, plus un garde du corps qui lit tout ton code à chaque sauvegarde.

```ts
function payer(montant: number, moyen: MoyenPaiement): Recu { ... }
```
Cette ligne est un CONTRAT : qui appelle avec une string se fait refuser à la compilation. Multiplie ça par tout ton code : des centaines de bugs potentiels éliminés mécaniquement.

### L'inférence : TypeScript devine
Tu n'annotes pas tout : `const x = 42` est inféré `number`. La règle pratique : **annoter les signatures de fonctions** (les frontières, les contrats) et laisser l'inférence gérer l'intérieur.

### Les outils de modélisation
- **`interface`** décrit la forme d'un objet : `interface Task { id: number; titre: string; fait: boolean }`.
- **Unions littérales** — l'outil le plus rentable du langage : `type Statut = 'panier' | 'payee' | 'expediee'`. Une simple string devient un contrat : la typo `'payé'` est une erreur de compilation, et un `switch` sur le statut peut être vérifié EXHAUSTIF (ajouter un statut → le compilateur pointe tous les switch à mettre à jour).
- **Optionnels et null-safety** : `telephone?: string` dit « peut être absent » ; en mode `strict`, utiliser une valeur possiblement `undefined` sans vérifier est une erreur. La moitié des crashs JS (`cannot read property of undefined`) meurt ici.
- **Génériques `<T>`** : écrire UNE logique valable pour tous les types sans perdre le typage. `premier<T>(arr: T[], p: (x: T) => boolean): T | undefined` fonctionne sur des nombres comme des Commandes, et le résultat est du BON type. C'est le mécanisme derrière `Array<T>`, `Map<K, V>`, `Promise<T>`.

### any vs unknown : la frontière avec l'incertain
`any` DÉSACTIVE la vérification — c'est un trou dans la coque, à bannir. `unknown` dit « je ne sais pas ENCORE » et force une validation avant usage. Pour toute donnée externe (fichier, API, **sortie de LLM**), le circuit correct est : `unknown` → validation → type précis. C'est le pattern exact de tes futurs structured outputs (mois 8).

### Le narrowing : le compilateur suit ton raisonnement
```ts
function afficher(x: string | number) {
  if (typeof x === "string") return x.toUpperCase(); // ici x EST string
  return x.toFixed(2);                               // ici x EST number
}
```
Dans chaque branche, TypeScript AFFINE le type selon tes tests. Tes guard clauses (jour 5) deviennent des preuves que le compilateur comprend.

## Concepts clés
`tsc`, `tsconfig`, mode `strict` · annotations de signatures · inférence · `interface` vs `type` · unions et littéraux · optionnels `?` · `readonly` · génériques · `any` vs `unknown` · narrowing.

## 🧭 Exemple guidé
**Énoncé** : marquer une tâche comme terminée, sans modifier la liste d'origine, et faire vérifier les deux contraintes par le compilateur plutôt que par ta vigilance.

**Raisonnement, décision par décision.**

1. Le statut ne peut valoir que deux choses. Le déclarer `string` accepterait `'don'`, `'DONE'`, `'terminé'` — trois bugs qui compilent. Une union littérale ferme la porte : `type Statut = 'pending' | 'done'`.
2. « Sans modifier l'origine » est une contrainte qu'on peut oublier de respecter. `readonly Task[]` la confie au compilateur : `tasks.push(...)` devient une erreur de compilation, pas une revue de code à espérer.
3. Le type de retour `Task[]` (sans `readonly`) dit quelque chose de précis : j'accepte de ne pas toucher ce qu'on me donne, et je rends un tableau neuf dont l'appelant fait ce qu'il veut.
4. À l'intérieur, plus rien à annoter : `map` et le spread sont inférés. On annote la frontière, pas le ventre de la fonction.

```ts
type Statut = 'pending' | 'done';
interface Task { id: number; titre: string; statut: Statut }

function terminer(tasks: readonly Task[], id: number): Task[] {
  return tasks.map((t) => (t.id === id ? { ...t, statut: 'done' } : t));
}
```

Ta discipline du jour 26 est devenue un contrat outillé : ce que tu devais te rappeler, le compilateur te le rappelle.

**Variante qui déplace le problème** : ajoute `'archived'` à `Statut`. Le code ci-dessus continue de compiler — normal, il n'énumère pas les statuts. Mais écris maintenant une fonction qui rend une couleur par statut avec un `switch`, et donne-lui un type de retour explicite : le compilateur signale que le cas `'archived'` ne renvoie rien. **C'est là que l'union littérale paie vraiment** : elle ne protège pas seulement contre les typos, elle te DÉSIGNE tous les endroits à mettre à jour le jour où le domaine change.

### Où s'arrête TypeScript — mesuré

La question la plus utile sur TypeScript n'est pas « comment écrire ce type »
mais **« jusqu'où va la vérification ? »**. Le script
`scripts/v70-verifications/js-async-et-types.mjs` répond en exécutant du code.

TypeScript est **effacé à la compilation**. Il ne reste rien de tes types dans le
JavaScript produit : aucune vérification n'existe à l'exécution. La conséquence
est précise et coûteuse.

```
JSON.parse rend : {"age":"trente"}
typeof depuisJson.age = string
depuisJson.age * 2 = NaN
```

Voici ce qui s'est passé. Le code déclarait une interface avec `age: number` et
recevait ce JSON d'une API. `JSON.parse` renvoie `any`, donc TypeScript
**accepte** l'affectation sans broncher. Le programme compile, passe la revue, et
calcule `NaN` en production.

**Un type déclaré n'est pas un contrôle : c'est une affirmation que tu fais au
compilateur, et qu'il croit.** À la frontière du programme — réponse d'API,
lecture de fichier, paramètre d'URL, contenu du stockage local, variable
d'environnement — cette affirmation n'est vérifiée par personne.

La règle qui en découle : **valider à la frontière avec du code qui s'exécute.**
Une fonction de validation, ou une bibliothèque de schémas, qui inspecte
réellement la valeur et lève une erreur explicite. Ce que TypeScript garantit,
c'est la cohérence **à l'intérieur** du programme une fois les données entrées ;
c'est déjà énorme, et ce n'est pas la même chose.

Le corollaire pratique : chaque `any` que tu laisses passer est un trou par
lequel toute cette cohérence interne s'échappe, et il se propage silencieusement
à tout ce qu'il touche. C'est pourquoi `any` sur une valeur venant de l'extérieur
est le cas le plus dangereux — il est exactement à l'endroit où le contrôle
manquait déjà.

## ⚠️ Erreurs fréquentes
- `any` pour faire taire une erreur : tu viens de payer TypeScript pour le débrancher. Cherche le vrai type, ou utilise `unknown` + validation.
- Statut en `string` au lieu d'union littérale : toute la protection s'évapore.
- Croire que TS valide À L'EXÉCUTION : les annotations disparaissent à la compilation. Les données externes exigent une validation runtime (code qui vérifie vraiment).
- Sur-typer l'interne : annote les frontières, laisse l'inférence vivre.

## 🔗 Liens avec le programme
Le pattern central de tes apps LLM (mois 8+) : définir le type attendu de la sortie du modèle, parser en `unknown`, VALIDER, puis seulement utiliser. Le LLM est un composant faillible ; le typage est la douane à sa frontière. DocSense (mois 11) sera intégralement typé : ports et adapters de l'architecture hexagonale sont... des interfaces TypeScript.

## Mini-exercice
Sans relire : `JSON.parse` renvoie une valeur que tu affectes à un champ
`age: number`. Que vérifie le compilateur ?

## 🔥 Pratique — typer un domaine, puis attaquer la frontière

**A. Modéliser.** Écris `Produit`, `LigneCommande` et `Commande`, avec le statut
en union de littéraux. Écris `total(commande): number` et une fonction générique
`chercher<T>(tableau: T[], predicat: (x: T) => boolean): T | undefined`. Mode
strict, zéro `any`. Livrable : le fichier qui compile.

**B. Faire échouer le compilateur, exprès.** Écris trois erreurs qui **doivent**
être refusées à la compilation : une faute de frappe dans un statut, l'oubli de
traiter le cas `undefined` du retour de `chercher`, et un champ manquant à la
construction d'une commande. Livrable : les trois messages d'erreur exacts.

**C. Mesurer ce que `string` te coûte.** Remplace l'union de littéraux par
`statut: string` et recompile les trois erreurs de B. Livrable : combien sont
encore détectées.

**D. La frontière.** Écris une fonction qui reçoit du JSON et rend une
`Commande`. Fais-lui d'abord confiance (`as Commande`), passe-lui un JSON
invalide, et observe ce qui se produit à l'exécution. Puis écris une vraie
validation qui s'exécute. Livrable : les deux comportements.

**E. Traquer les `any` implicites.** Active les options de compilation les plus
strictes, recompile, et compte les erreurs. Livrable : le nombre, et les trois
endroits les plus fréquents dans ton code.

## ✅ Correction attendue

**A — modéliser d'abord.** La démarche : les données d'abord, puis les seules
signatures de fonctions, puis laisser l'inférence faire le reste. Annoter chaque
variable locale est du bruit — le compilateur déduit mieux et plus vite que toi.

Sur `chercher`, l'erreur classique est `chercher(t: any[], p: (x: any) => boolean): any`.
Ça compile, ça marche, et **le résultat n'a plus de type** : tous les appelants
perdent la vérification. Le générique existe exactement pour ne pas avoir à
choisir entre « réutilisable » et « typé ».

Sur le retour `T | undefined` : il est délibéré. Une fonction de recherche peut
ne rien trouver, et le type l'annonce, ce qui force l'appelant à traiter le cas.
Renvoyer `T` en promettant qu'on trouvera toujours est un mensonge que le
compilateur croira.

**B — les trois refus.** Les messages attendus mentionnent le type littéral
attendu pour la faute de frappe, la possibilité d'`undefined` pour l'accès non
gardé, et le nom du champ manquant. Si l'une des trois **compile**, c'est que la
modélisation est plus laxiste que tu ne le croyais — et c'est le vrai résultat de
l'exercice.

**C — ce que `string` coûte, mesuré chez toi.** Avec `statut: string`, la faute
de frappe n'est plus détectée : `string` accepte toutes les chaînes. Le piège est
séduisant parce que `string` est **techniquement exact** — un statut *est* une
chaîne. Mais le type utile n'est pas le plus vrai, c'est **le plus restrictif qui
reste vrai**.

Le bénéfice de l'union de littéraux dépasse la détection de fautes de frappe : le
compilateur peut vérifier qu'un `switch` couvre **tous** les cas, et te signaler
le jour où un statut est ajouté. Avec `string`, cette vérification est
impossible, et l'ajout d'un statut passe silencieusement.

**Alternative défendable** : un objet figé par `as const` dont on dérive le type.
Plus verbeux, mais il fournit en prime une **valeur** parcourable à l'exécution —
pour peupler un menu déroulant, par exemple — ce que le type seul ne permet pas,
puisqu'il n'existe plus.

**D — la frontière, et ce que la mesure montre.** Avec `as Commande`, la sortie
mesurée dans la section précédente s'applique :

```
JSON.parse rend : {"age":"trente"}
typeof depuisJson.age = string
depuisJson.age * 2 = NaN
```

Le programme compile, la revue passe, et le calcul produit `NaN` en production.
`as` n'est pas une conversion ni une vérification : c'est une **affirmation** que
tu fais au compilateur, et qu'il croit sur parole.

La validation attendue est du code qui s'exécute : elle inspecte chaque champ,
vérifie son type réel, et **lève une erreur explicite** en cas d'écart. Ce que le
langage garantit, c'est la cohérence **à l'intérieur** du programme une fois les
données entrées — ce qui est énorme, et ce n'est pas la même chose que valider
l'entrée.

La liste des frontières à traiter, qu'une bonne réponse énumère : réponses
d'API, contenu de fichiers, paramètres d'URL, stockage local du navigateur,
variables d'environnement, et messages reçus d'une file. Toutes ont en commun
d'être écrites par quelqu'un d'autre.

**E — les `any` implicites.** Les trois endroits les plus fréquents : les
paramètres de fonctions de rappel non annotées, les résultats de bibliothèques
sans types, et les blocs `catch` — dont la variable est `unknown` en mode strict,
ce qui oblige à vérifier avant d'accéder à `.message`.

Le point de fond : **chaque `any` est un trou par lequel la cohérence interne
s'échappe**, et il se propage silencieusement à tout ce qu'il touche. Le cas le
plus dangereux est précisément celui de D — un `any` sur une valeur venant de
l'extérieur, c'est-à-dire exactement là où le contrôle manquait déjà.

## ✅ Correction attendue
**La démarche** : modéliser les données d'abord (`Produit`, `LigneCommande`, `Commande`), le statut en union littérale ; puis annoter les seules signatures ; puis laisser l'inférence faire le reste.

**L'erreur probable, et pourquoi elle est presque irrésistible.** Au moment de déclarer le statut, `statut: string` s'écrit tout seul — c'est plus court, ça compile, et rien ne proteste. Le problème n'apparaît qu'à la dernière étape de l'exercice : tu introduis volontairement la typo `'expédiee'`… et **le compilateur ne dit rien**. Beaucoup en concluent que « TypeScript ne sert à rien » ou que leur configuration est cassée. Non : `string` accepte toutes les chaînes, tu as demandé au compilateur de ne rien vérifier. Le piège séduit parce que `string` est *techniquement exact* — un statut EST une chaîne — alors que le type utile n'est pas le plus vrai, c'est le plus RESTRICTIF qui reste vrai.

Deuxième erreur classique, sur `chercher` : écrire `chercher(arr: any[], p: (x: any) => boolean): any`. Ça compile, ça marche, et le résultat n'a plus de type — tous les appelants perdent la vérification. Le générique `<T>` existe pour ne pas avoir à choisir entre « réutilisable » et « typé ».

**Alternative défendable à l'union littérale** : un objet figé par `as const` dont on dérive le type. Plus verbeux, mais on obtient en prime une valeur à parcourir à l'exécution (pour peupler un menu déroulant, par exemple), ce que le type seul ne permet pas — il n'existe plus à l'exécution.

**Vérifie seul, sans corrigé** — trois épreuves, chacune doit ÉCHOUER à la compilation :
1. Écris `commande.statut = 'expédiee'` (avec la typo). Erreur attendue.
2. Écris une fonction `couleur(s: Statut): string` avec un `switch` où il manque un cas. Erreur attendue.
3. Cherche `any` dans ton fichier. Zéro occurrence attendue.
Si l'une des trois compile sans broncher, ce n'est pas TypeScript qui a échoué : c'est que tu as typé trop large.

## 🏢 Cas professionnel
Une équipe ajoute un statut `'remboursee'` à ses commandes. Avec un statut en `string`, la modification se fait en une minute — et le bug se déclare trois semaines plus tard : un écran d'export affiche « statut inconnu », un calcul de chiffre d'affaires compte les remboursements comme des ventes, une relance automatique part vers des clients déjà remboursés. Personne n'avait la liste des endroits à mettre à jour ; il fallait la reconstituer de mémoire.

Avec l'union littérale et des `switch` exhaustifs, la même modification échoue à compiler, et **le compilateur imprime la liste** : sept fichiers, sept endroits, aucun oublié. Le typage n'a pas seulement empêché une typo — il a transformé « se souvenir de tout » en « suivre une liste ». C'est la raison pour laquelle les équipes acceptent le coût du typage sur les projets qui durent : la valeur n'est pas au premier jour, elle est au vingtième changement.

## 🎤 Questions d'entretien
- « TypeScript valide-t-il les données reçues d'une API ? » → Non. Les types disparaissent à la compilation ; une réponse d'API est un `unknown` qu'il faut valider avec du code qui s'exécute vraiment.
- « `any` ou `unknown` ? » → `any` désactive la vérification et se propage silencieusement ; `unknown` la reporte et FORCE une vérification avant usage. `unknown` aux frontières, `any` jamais.
- « Qu'apporte une union littérale par rapport à `string` ? » → Elle rend les valeurs invalides incompilables, et surtout elle rend les `switch` vérifiables exhaustivement : ajouter un cas désigne mécaniquement tous les sites à mettre à jour.
- « Qu'est-ce que le narrowing ? » → L'affinage du type par le compilateur à l'intérieur d'une branche conditionnelle : après `if (typeof x === 'string')`, il sait que `x` est une string et autorise `.toUpperCase()`.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je sais expliquer pourquoi un type ne protège PAS une réponse d'API.
- [ ] J'écris mes ensembles de valeurs finies en union littérale, jamais en `string`.
- [ ] J'annote les signatures et je laisse l'inférence travailler à l'intérieur.
- [ ] Je n'écris pas `any` pour faire taire une erreur — je cherche le type, ou je passe par `unknown` + validation.

## 📚 Vocabulaire
**compilation** · **inférence** · **contrat / signature** · **union littérale** · **narrowing** · **générique** · **strict mode** · **`unknown`** · **validation runtime** (≠ typage statique).

## 🧾 À retenir
TypeScript est un vérificateur posé sur JavaScript : les signatures deviennent des contrats vérifiés mécaniquement. Les unions littérales transforment les strings en états sûrs, les génériques donnent des outils réutilisables sans perte de type, `unknown` + validation est la frontière avec toute donnée externe — dont les sorties de LLM. Annote les frontières, bannis `any`, active `strict` : le compilateur devient ton premier relecteur.
