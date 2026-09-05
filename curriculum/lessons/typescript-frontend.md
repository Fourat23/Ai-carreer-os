<!-- keep -->
# Leçon — TypeScript côté frontend : props, événements et données d'API

## 🌍 Le problème d'abord
Tu connais TypeScript en général : tu types des fonctions, des objets. Mais côté interface, des
questions concrètes surgissent : quel type a l'événement d'un `onClick` ? Comment décrire les
`props` d'un composant pour que l'oubli d'une prop soit signalé AVANT l'exécution ? Et surtout :
quand tu reçois des données d'une API, elles arrivent en `any`/`unknown` — comment les manipuler
sans que tout casse au premier champ manquant ? Beaucoup de bugs frontend viennent de données mal
typées venues du réseau. Cette leçon applique TypeScript là où ça compte pour une interface : props,
événements, et surtout la frontière de confiance avec les données externes.

## 🎯 Objectif
Savoir typer les briques d'une interface : `props` de composant (objets, optionnels, unions),
événements du DOM/React, et données venues d'une API — en utilisant le **narrowing** (rétrécissement
de type) pour manipuler en sécurité des données d'origine externe. Comprendre que le type décrit une
PROMESSE, et qu'à la frontière (réseau) cette promesse doit être VÉRIFIÉE, pas supposée.

## 🧩 Prérequis
Tu dois connaître les bases de TypeScript — types, interfaces, unions, génériques
(`/doc/lessons/typescript-basics`) — et le modèle async/fetch
(`/doc/lessons/async-javascript`, `/doc/lessons/http-rest-json`). Comprendre le DOM et les événements
(`/doc/lessons/browser-dom-rendering`) aide pour la partie événements. Cette leçon ne réexplique pas
TypeScript en général : elle l'APPLIQUE au frontend.

## 🧠 Modèle mental
Un type est une **promesse vérifiée par le compilateur** — mais uniquement DANS ton code. Ce qui
entre par le réseau, le stockage ou la saisie utilisateur n'est PAS typé : le déclarer `SomeType`
sans le vérifier, c'est mentir au compilateur. D'où deux zones :
- **l'intérieur** (props, état, fonctions) où les types te protègent réellement ;
- **la frontière** (données d'API `unknown`) où tu dois VALIDER puis RÉTRÉCIR (narrowing) avant de
  faire confiance.
Bien typer une interface, c'est décrire des contrats à l'intérieur et poser des sas de vérification à
la frontière.

## 💡 Pourquoi c'est important
Le type le plus dangereux est le faux type : un `as User` posé sur des données API non vérifiées fait
planter l'interface loin de la cause, avec un message obscur. À l'inverse, des props bien typées
transforment des bugs d'exécution en erreurs de compilation détectées immédiatement, et le narrowing
rend le code robuste face à des réponses incomplètes. C'est ce qui distingue un frontend « qui marche
sur les données de démo » d'un frontend fiable en production.

## Explication complète

### Typer les props
Décris la forme attendue d'un composant, avec optionnels et valeurs par défaut :
```ts
type BadgeProps = {
  label: string;
  tone?: 'info' | 'success' | 'danger'; // union : valeurs autorisées, optionnelle
  onDismiss?: () => void;
};
```
L'union `'info' | 'success' | 'danger'` empêche une valeur invalide dès la compilation ; le `?` marque
l'optionnel. Oublier `label` devient une erreur immédiate, pas un `undefined` à l'écran.

### Typer les événements
Un gestionnaire reçoit un événement typé. En React :
```ts
function onClick(e: React.MouseEvent<HTMLButtonElement>) { e.preventDefault(); }
function onChange(e: React.ChangeEvent<HTMLInputElement>) { const v: string = e.target.value; }
```
Le type précise l'élément source (`HTMLButtonElement`) et donne l'autocomplétion sûre sur `e`. En DOM
pur : `addEventListener('click', (e: MouseEvent) => …)`.

### La frontière de confiance : données d'API
`fetch(...).json()` renvoie `any`/`Promise<any>` : tout devient permis, et donc dangereux. Le réflexe
sûr : traiter la donnée comme `unknown` et la VÉRIFIER avant usage.
```ts
type User = { id: number; name: string };

function isUser(v: unknown): v is User {           // type guard : rétrécit unknown -> User
  return typeof v === 'object' && v !== null
    && typeof (v as any).id === 'number'
    && typeof (v as any).name === 'string';
}

const data: unknown = await res.json();
if (isUser(data)) {
  // ici, TypeScript SAIT que data est un User
  console.log(data.name.toUpperCase());
} else {
  // réponse inattendue : gérer l'erreur au lieu de planter plus loin
}
```
Le `is User` (prédicat de type) documente et opère le **narrowing** : après le `if`, l'accès est sûr.
`as User` sans vérification ferait exactement l'inverse : supposer sans vérifier.

### Narrowing du quotidien
TypeScript rétrécit aussi les types via `typeof`, `in`, la vérification de `null`, ou les **unions
discriminées** :
```ts
type Shape = { kind: 'circle'; r: number } | { kind: 'rect'; w: number; h: number };
function area(s: Shape) {
  return s.kind === 'circle' ? Math.PI * s.r ** 2 : s.w * s.h; // kind discrimine, accès sûr
}
```
Ce style élimine des classes entières de bugs (« propriété qui n'existe pas sur ce variant »).

## Concepts clés
Props typées (objets, `?` optionnel, unions littérales) · événements typés (`React.MouseEvent`,
`ChangeEvent`, `MouseEvent` DOM) · frontière de confiance (`unknown` vs `any`) · type guard
(`v is T`) · narrowing (`typeof`/`in`/null) · union discriminée · `as` = supposer (à éviter à la frontière).

## 🧭 Exemple guidé — cinq lignes soumises au compilateur, et les deux qui passent

TypeScript inspire une confiance qu'il ne mérite pas toujours, et la raison est simple :
**il ne vérifie que ce qui existe au moment de la compilation.** Une réponse réseau arrive
plus tard, quand le compilateur n'est plus là depuis longtemps.

Pour voir exactement où passe la limite, on ne va pas en discuter : on va soumettre cinq
situations au compilateur et lire ce qu'il dit — et surtout ce qu'il ne dit pas.

> Les messages ci-dessous sont la **sortie brute** de `tsc --strict`, produite par
> `scripts/v70-verifications/ts-frontiere.mjs`. Le fichier compilé contient des erreurs
> volontaires ; il est stocké en `.ts.txt` pour ne pas casser la vérification de types du
> projet.

### Les cinq situations

```ts
type User = { id: number; name: string; email?: string };

// 1. le cast sur une réponse réseau
async function chargeCast(id: number): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  return (await res.json()) as User;
}

// 2. la même chose, en unknown
async function chargeUnknown(id: number) {
  const data: unknown = await (await fetch(`/api/users/${id}`)).json();
  return data.name;
}

// 3. une faute de frappe sur un nom de propriété
function afficher(u: User) { return u.nom; }

// 4. une prop oubliée à l'appel d'un composant
type Props = { user: User; onBuy: (id: number) => void };
const x = Fiche({ user: { id: 1, name: 'Ada' } });

// 5. le cast qui ment
const faux = { id: '42', name: 123 } as unknown as User;
const majuscules = faux.name.toUpperCase();
```

### Ce que dit le compilateur

```
frontiere.ts(17,10): error TS18046: 'data' is of type 'unknown'.
frontiere.ts(22,12): error TS2339: Property 'nom' does not exist on type 'User'.
frontiere.ts(28,17): error TS2345: Argument of type '{ user: { id: number; name: string; }; }'
  is not assignable to parameter of type 'Props'.
  Property 'onBuy' is missing in type '{ user: …; }' but required in type 'Props'.

3 erreur(s) sur 5 cas.
```

**Trois erreurs sur cinq.** Les cas 1 et 5 passent en silence, et ce sont exactement les deux
qui produisent un plantage en production.

### Ce que TypeScript fait très bien : les cas 2, 3 et 4

Le cas 3 est la valeur quotidienne du typage : une faute de frappe sur `u.nom` est signalée à
la ligne où elle est écrite, avant même d'enregistrer le fichier. Sans types, cette erreur
serait apparue à l'exécution, sur un écran, chez quelqu'un.

Le cas 4 est le même service rendu aux composants : oublier `onBuy` est refusé, avec le nom de
la prop manquante dans le message. C'est ce qui rend un composant typé réellement
documenté — sa signature dit ce qu'il attend, et le compilateur le fait respecter.

Le cas 2 est le plus intéressant, parce que l'erreur est **désirée**. `'data' is of type
'unknown'` n'est pas un obstacle : c'est le compilateur qui refuse de deviner, et qui
t'oblige à vérifier avant d'utiliser. `unknown` veut dire « je ne sais pas ce que c'est »,
et la seule façon d'en sortir est de le prouver.

### Ce que TypeScript ne peut pas faire : les cas 1 et 5

Le cas 1 est la ligne la plus dangereuse du fichier, et c'est celle qu'on écrit le plus
souvent :

```ts
return (await res.json()) as User;
```

`as` n'est pas une vérification. C'est une **affirmation** adressée au compilateur : « fais-moi
confiance, c'est un `User` ». Il te croit — c'est son rôle — et se tait.

Or `res.json()` renvoie ce que le serveur a envoyé, pas ce que tu espérais. Si l'API a renommé
`name` en `fullName` la semaine dernière, si elle renvoie une page d'erreur HTML, si le champ
est `null` pour les comptes désactivés, le `as` ne le remarquera jamais.

Le cas 5 le montre sans réseau, en trois lignes :

```ts
const faux = { id: '42', name: 123 } as unknown as User;
const majuscules = faux.name.toUpperCase();
```

`id` est une chaîne au lieu d'un nombre, `name` un nombre au lieu d'une chaîne. Aucune erreur
de compilation. À l'exécution : `faux.name.toUpperCase is not a function`.

Et note **où** ça casse : pas à la ligne du `as`, mais à la ligne suivante — et dans un vrai
projet, quinze fichiers plus loin, dans un composant qui n'a rien fait de mal. C'est ce qui
rend ces bugs si coûteux : le message d'erreur désigne la victime, jamais le coupable.

### La correction : vérifier au lieu d'affirmer

```ts
function isUser(v: unknown): v is User {
  return !!v && typeof v === 'object'
    && typeof (v as Record<string, unknown>).id === 'number'
    && typeof (v as Record<string, unknown>).name === 'string';
}

async function loadUser(id: number): Promise<User | null> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) return null;                 // l'échec réseau est un cas, pas une exception
  const data: unknown = await res.json();   // on ne présume rien
  return isUser(data) ? data : null;        // on vérifie, PUIS on rétrécit
}
```

Trois points méritent d'être vus.

**Le type de retour `User | null`.** Il oblige tout appelant à traiter le cas d'échec — le
compilateur refusera un `user.name` sans vérification préalable. La discipline se propage
d'elle-même, sans qu'on ait à y penser.

**La signature `v is User`.** C'est ce qu'on appelle une *garde de type* : elle dit au
compilateur « si cette fonction renvoie `true`, alors la valeur est un `User` ». Après le
`isUser(data) ?`, dans la branche vraie, `data` **est** un `User` pour le compilateur. On n'a
pas menti : on a prouvé.

**Le `as Record<string, unknown>` à l'intérieur de la garde.** Il reste un `as`, et c'est
assumé : c'est le seul endroit où l'on manipule une valeur non encore vérifiée, et il est
confiné à quatre lignes qu'on relit une fois. La différence avec le cas 1 n'est pas la
présence du mot `as`, c'est **ce qu'on affirme** : ici, seulement « c'est un objet avec des
clés », ce qu'on vient de tester ; là-bas, « c'est exactement un `User` », ce qu'on n'a pas
testé du tout.

### La règle qui résume tout

> **Le type protège à l'intérieur. La vérification protège à la frontière.**

Une frontière est tout point où une donnée entre dans ton code sans que ton compilateur ait pu
la voir : une réponse d'API, un `localStorage`, un paramètre d'URL, un fichier téléversé, un
message d'une autre fenêtre, une variable d'environnement.

À l'intérieur, fais confiance aux types : c'est leur métier, et le cas 3 montre qu'ils le font
bien. À la frontière, ne fais confiance à rien — et si tu écris `as`, demande-toi ce que tu
viens exactement d'affirmer, et qui l'a vérifié.

### Ce que cet exemple ne dit pas

Il ne dit pas qu'il faut écrire ses gardes à la main. Pour un objet de trois champs, c'est
raisonnable ; pour une réponse d'API de quarante champs imbriqués, c'est du travail fastidieux
et faux à la première évolution.

Les bibliothèques de validation de schéma existent pour ça : on décrit la forme attendue une
fois, et l'on obtient **à la fois** la vérification à l'exécution et le type TypeScript, dérivé
automatiquement du même schéma. Le principe reste identique — vérifier à la frontière — mais
les deux ne peuvent plus diverger, ce qui est le défaut principal des gardes écrites à la main.

## ⚠️ Erreurs fréquentes
- Poser `as User` sur `res.json()` sans vérifier → faux type ; plantage lointain et obscur.
- Typer les props avec `any` (ou pas du tout) → perte de tout le bénéfice de TypeScript.
- Confondre `any` (désactive les vérifications) et `unknown` (force à vérifier avant usage).
- Oublier de gérer le cas où la donnée ne correspond pas (pas de branche « sinon »).
- Réécrire un cours TypeScript général au lieu de l'appliquer aux props/événements/API.

## 🔗 Liens avec le programme
Cette leçon applique `/doc/lessons/typescript-basics` au frontend et s'appuie sur
`/doc/lessons/async-javascript` et `/doc/lessons/http-rest-json` pour la donnée réseau. Elle prépare
directement les composants React typés (`/doc/lessons/react-fundamentals`,
`/doc/lessons/react-hooks-effects`) et rejoint la validation client≠serveur de
`/doc/lessons/web-forms-validation`.

## 🛠️ Pratique — la frontière, et les six réponses hostiles

**Contexte.** Une API produit, dont tu ne contrôles pas le code. Tu écris le client TypeScript
qui la consomme. Le point de cette pratique : **une API ne renvoie pas toujours ce que sa
documentation promet**, et la question n'est pas de savoir si ça arrivera mais ce que ton
interface fera ce jour-là.

**Écris les quatre livrables suivants** dans un fichier `.ts` que tu compiles avec
`npx tsc --noEmit --strict`.

**1. Le type et la garde.**

```ts
type Product = { id: number; title: string; price: number; tag?: 'promo' | 'nouveau' };
function isProduct(v: unknown): v is Product { /* à écrire */ }
```

Note l'union littérale sur `tag` : elle fait partie du contrat, donc la garde doit la vérifier
aussi.

**2. La fonction de chargement.**

```ts
async function loadProduct(id: number): Promise<Product | null>
```

Le type de retour est imposé. Elle doit traiter l'échec réseau, la réponse non conforme, et
n'exposer à l'appelant qu'un `Product` valide ou `null`.

**3. Le composant.** En pseudo-JSX, avec des props typées
`{ product: Product; onBuy: (id: number) => void }`. Appelle-le une fois **en oubliant
volontairement `onBuy`**, et copie dans ton rendu le message exact du compilateur.

**4. Le tableau des six réponses hostiles.** C'est le livrable principal. Fabrique ces six
réponses (une constante `as unknown` suffit, inutile d'un vrai serveur), passe chacune à
`isProduct`, et remplis :

| # | Réponse renvoyée par l'API | `isProduct` répond | Ce que voit l'utilisateur | Est-ce le bon comportement ? |
|---|---|---|---|---|
| 1 | `{ id: 1, title: "Lampe", price: 39 }` | | | |
| 2 | `{ id: "1", title: "Lampe", price: 39 }` — `id` en chaîne | | | |
| 3 | `{ id: 1, name: "Lampe", price: 39 }` — champ renommé | | | |
| 4 | `null` | | | |
| 5 | `{ id: 1, title: "Lampe", price: 39, tag: "solde" }` — valeur hors union | | | |
| 6 | `"<!DOCTYPE html><html>…"` — une page d'erreur HTML | | | |

**5. Les trois questions à répondre par écrit :**

- **A.** Pour chacune des six, ton interface affiche-t-elle quelque chose de compréhensible,
  ou un écran vide ? `null` sans traitement de l'échec est un écran vide.
- **B.** Ajoute un champ obligatoire `stock: number` au type `Product` **sans toucher à
  `isProduct`**. Le projet compile-t-il encore ? Que s'est-il passé, et pourquoi est-ce
  dangereux ?
- **C.** Remplace ta garde par `as Product`. Combien des six réponses hostiles sont encore
  détectées ?

**Critère de réussite.** (a) Les six lignes du tableau sont remplies avec le résultat réel, pas
prédit ; (b) le cas 5 est traité — si ta garde ignore `tag`, dis-le et corrige ; (c) la réponse
à B est un constat inquiétant, pas rassurant ; (d) la réponse à C est un nombre.

**Durée.** 45 à 60 minutes.

## ✅ Corrigé de la pratique

**Les six réponses.**

| # | `isProduct` | Pourquoi |
|---|---|---|
| 1 | `true` | conforme |
| 2 | `false` | `typeof id === 'number'` échoue sur `"1"` |
| 3 | `false` | `title` absent |
| 4 | `false` | le `!!v` initial l'écarte — **et c'est la raison de ce `!!v`** : `typeof null === 'object'` en JavaScript, sans lui la garde planterait |
| 5 | `true` **si ta garde ignore `tag`** — c'est le piège | une union littérale non vérifiée laisse passer n'importe quelle chaîne |
| 6 | `false`, **ou une exception** avant même la garde | `res.json()` sur du HTML lève une erreur de parsage : si ton `await res.json()` n'est pas dans un `try`, la fonction rejette au lieu de renvoyer `null` |

Les cas 5 et 6 sont ceux qui distinguent une garde écrite avec soin d'une garde écrite vite.

Le cas 5 : un champ optionnel doit être vérifié **quand il est présent**.

```ts
(v.tag === undefined || v.tag === 'promo' || v.tag === 'nouveau')
```

Sans cette ligne, `tag: "solde"` traverse la frontière, et le composant qui fait
`tag === 'promo' ? … : 'nouveau'` affichera « nouveau » sur un article en solde. Aucune erreur,
juste une information fausse à l'écran — le pire des deux mondes.

Le cas 6 rappelle que la frontière commence **avant** la garde. `res.ok` d'abord, `try` autour
du parsage ensuite, garde en dernier. Trois filets, dans cet ordre.

**Réponse à B — et c'est le constat le plus important de la pratique.** Le projet **compile
encore**. Ajouter `stock: number` au type ne provoque aucune erreur dans `isProduct`, parce
qu'une garde n'est qu'une fonction qui renvoie un booléen : rien n'oblige le compilateur à
vérifier qu'elle teste tous les champs du type qu'elle prétend prouver.

Tu viens de créer une **garde qui ment** : elle affirme `v is Product` alors qu'elle ne vérifie
plus la totalité de `Product`. Le compilateur fait ensuite confiance à cette affirmation
partout, et `product.stock` sera `undefined` dans un code où le type dit qu'il est un nombre.

C'est le défaut structurel des gardes manuscrites, et c'est l'argument décisif en faveur des
bibliothèques de validation de schéma : elles **dérivent** le type du schéma, ce qui rend la
désynchronisation impossible par construction. On ne peut pas oublier de valider un champ qu'on
vient d'ajouter, puisque le champ n'existe que dans le schéma.

Ce qui pose la question que tu dois te poser maintenant : **pourquoi t'a-t-on fait écrire
un prédicat à la main, si une bibliothèque le fait mieux ?** Parce que la bibliothèque ne
supprime pas la décision, elle l'exécute — et une équipe qui l'installe sans avoir compris
ce qu'elle remplace finit par valider ses réponses d'API dans un coin et pas dans un autre,
sans savoir dire pourquoi. Cet exercice manuel est ce qui rend le choix de la bibliothèque
délibéré au lieu d'être une habitude.

**Réponse à C.** Avec `as Product` : **zéro sur six**. Aucune détection, aucune erreur de
compilation, aucune trace. Les cinq réponses invalides traversent, et le plantage survient
plus tard, ailleurs, sur une ligne innocente.

C'est le chiffre à retenir de toute cette leçon.

## 🧭 L'ordre de travail, et un dernier angle mort

**L'ordre.** Type les props en premier — c'est le contrat du composant. Les événements
ensuite. La frontière API **en dernier**, parce que c'est la seule des trois où le typage
statique ne protège de rien et où il faut donc écrire du code qui s'exécute.

**L'angle mort.** Tout ce qui précède parle de détecter une donnée invalide. Personne ne
parle de ce qu'on en fait. Écrire le prédicat puis oublier la branche « sinon » est le
second réflexe fautif, et il est plus difficile à voir que le premier : on a vérifié, on
est content, et quand la vérification échoue le composant reste simplement vide. **Une
validation sans traitement de l'échec ne supprime pas le silence, elle le déplace** —
d'un plantage bruyant vers un écran blanc que personne ne sait expliquer.

**Vérifie seul, sans corrigé** :
1. Fais renvoyer volontairement une forme incorrecte par ton API simulée. Ton interface
   doit afficher une erreur maîtrisée — pas un écran blanc, pas une exception en console.
2. Passe une valeur invalide à `tone`. Le compilateur doit refuser. S'il accepte, ton
   union littérale n'en est pas une.

## 🏢 Cas professionnel
Une équipe front consomme une API interne. Tous les appels sont écrits en `as`, parce que « les types du backend sont connus ». Un jour, le backend renomme `name` en `fullName` dans une réponse — un changement rétrocompatible côté serveur, puisque l'ancien champ reste temporairement.

Le front ne compile pas moins bien, il ne signale rien, et affiche `undefined` à des milliers d'utilisateurs. Le ticket met deux jours à remonter, et l'enquête commence côté backend, qui n'a rien cassé de son point de vue.

Ce que cet incident enseigne dépasse TypeScript : **les types du front décrivent une hypothèse sur un système que le front ne contrôle pas.** Un type est une promesse tenue par le compilateur à l'intérieur de ton code, et par personne à sa frontière. Deux pratiques en découlent chez les équipes qui ont vécu cela : la validation à l'exécution sur toute réponse d'API, et une alerte quand le taux d'échec de validation augmente — car ce taux est le seul signal qui détecte un changement de contrat avant les utilisateurs.

## 🎤 Questions d'entretien
- « `as User` ou un type guard ? » → `as` est une affirmation non vérifiée ; le type guard est un contrôle qui s'exécute. À une frontière, seul le second protège.
- « Pourquoi typer les événements React ? » → Pour connaître l'élément source et accéder sûrement à ses propriétés — `e.target.value` n'existe pas sur tous les éléments.
- « Qu'est-ce qu'une union discriminée ? » → Une union dont chaque variante porte un champ littéral distinctif ; tester ce champ suffit au compilateur pour savoir quelles propriétés existent.
- « Le typage protège-t-il des données d'une API ? » → Non. Il disparaît à la compilation ; seule une validation à l'exécution vérifie ce qui arrive vraiment.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Aucun `as` sur une donnée venue de l'extérieur.
- [ ] Chaque validation a une branche d'échec qui fait quelque chose de visible.
- [ ] Mes props utilisent des unions littérales plutôt que `string` pour les ensembles finis.
- [ ] Je sais expliquer pourquoi un type ne protège pas une frontière.

## 📚 Vocabulaire
**props typées** · **union littérale** · **événement typé** (`MouseEvent`/`ChangeEvent`) ·
**`unknown` vs `any`** · **type guard** (`v is T`) · **narrowing** · **union discriminée** ·
**frontière de confiance**.

## 🧾 À retenir
Applique TypeScript là où l'interface en profite : props (unions, optionnels) et événements typés
protègent l'intérieur de ton code ; à la frontière réseau, les données sont `unknown`, pas `User` —
vérifie-les avec un type guard puis rétrécis (narrowing) avant d'y faire confiance. Le vrai danger
est le faux type (`as` non vérifié). Type à l'intérieur, vérité vérifiée à la frontière.
