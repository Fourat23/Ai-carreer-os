<!-- keep -->
# Leçon — TypeScript : typer pour fiabiliser

## Pourquoi c'est important
TypeScript est le standard de l'industrie pour tout projet JS sérieux. La raison est économique : un bug attrapé à la compilation coûte des secondes ; le même bug en production coûte des heures (ou des clients). Le typage est aussi une **documentation vérifiée** : la signature dit le contrat, le compilateur le fait respecter partout, pour toujours. Pour tes futurs systèmes IA, c'est vital : la sortie d'un LLM est par nature incertaine — la frontière typée est ce qui empêche cette incertitude de contaminer ton application.

## Explication complète

### Le modèle mental : un vérificateur AU-DESSUS de JavaScript
TypeScript n'exécute rien : c'est JavaScript + des annotations, relues par un compilateur (`tsc`) qui signale les incohérences AVANT l'exécution. Le code produit est du JS normal. Donc : mêmes concepts qu'en JS, plus un garde du corps qui lit tout ton code à chaque sauvegarde.

```ts
function payer(montant: number, moyen: MoyenPaiement): Recu { ... }
```
Cette ligne est un CONTRAT : qui appelle avec une string se fait refuser à la compilation. Multiplie ça par tout ton code : des centaines de bugs potentiels éliminés mécaniquement.

### L'inférence : TypeScript devine
Tu n'annotes pas tout : `const x = 42` est inféré `number`. La règle pratique : **annoter les signatures de fonctions** (les frontières, les contrats) et laisser l'inférence gérer l'intérieur.

### Les outils de modélisation
- **`interface`** décrit la forme d'un objet : `interface Task { id: number; titre: string; fait: boolean }`.
- **Unions littérales** — l'outil le plus rentable du langage : `type Statut = 'panier' | 'payee' | 'expediee'`. Une simple string devient un contrat : la typo `'payé'` est une erreur de compilation, et un `switch` sur le statut peut être vérifié EXHAUSTIF (ajouter un statut → le compilateur pointe tous les switch à compléter).
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

## Exemple
```ts
type Statut = 'pending' | 'done';
interface Task { id: number; titre: string; statut: Statut }

function terminer(tasks: readonly Task[], id: number): Task[] {
  return tasks.map((t) => (t.id === id ? { ...t, statut: 'done' } : t));
}
```
`readonly` fait vérifier l'immutabilité par le compilateur : `tasks.push(...)` est une erreur. Ta discipline du jour 26, devenue contrat outillé.

## Pièges classiques
- `any` pour faire taire une erreur : tu viens de payer TypeScript pour le débrancher. Cherche le vrai type, ou utilise `unknown` + validation.
- Statut en `string` au lieu d'union littérale : toute la protection s'évapore.
- Croire que TS valide À L'EXÉCUTION : les annotations disparaissent à la compilation. Les données externes exigent une validation runtime (code qui vérifie vraiment).
- Sur-typer l'interne : annote les frontières, laisse l'inférence vivre.

## Lien avec l'IA / le futur
Le pattern central de tes apps LLM (mois 8+) : définir le type attendu de la sortie du modèle, parser en `unknown`, VALIDER, puis seulement utiliser. Le LLM est un composant faillible ; le typage est la douane à sa frontière. DocSense (mois 11) sera intégralement typé : ports et adapters de l'architecture hexagonale sont... des interfaces TypeScript.

## Mini-exercice
Modélise une commande e-commerce : `Produit`, `LigneCommande`, `Commande` (statut en union littérale). Écris `total(commande): number` et une fonction générique `chercher<T>(arr: T[], p: (x: T) => boolean): T | undefined`. Tout doit compiler en strict, zéro `any`. Puis introduis volontairement une typo de statut et constate l'erreur.

## Vocabulaire à retenir
**compilation** · **inférence** · **contrat / signature** · **union littérale** · **narrowing** · **générique** · **strict mode** · **`unknown`** · **validation runtime** (≠ typage statique).

## Résumé
TypeScript est un vérificateur posé sur JavaScript : les signatures deviennent des contrats vérifiés mécaniquement. Les unions littérales transforment les strings en états sûrs, les génériques donnent des outils réutilisables sans perte de type, `unknown` + validation est la frontière avec toute donnée externe — dont les sorties de LLM. Annote les frontières, bannis `any`, active `strict` : le compilateur devient ton premier relecteur.
