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

## 🧭 Exemple guidé
Consommer une API utilisateur en sécurité :
```ts
type User = { id: number; name: string; email?: string };

function isUser(v: unknown): v is User {
  return !!v && typeof v === 'object'
    && typeof (v as any).id === 'number'
    && typeof (v as any).name === 'string';
}

async function loadUser(id: number): Promise<User | null> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) return null;               // gérer l'échec réseau
  const data: unknown = await res.json(); // NE PAS présumer du type
  return isUser(data) ? data : null;      // vérifier PUIS rétrécir
}
```
Raisonnement : la réponse réseau est `unknown`, pas `User`. On la valide avec un type guard ; si elle
ne correspond pas, on renvoie `null` (l'appelant affichera un état d'erreur) au lieu de laisser un
`undefined.name` exploser dans un composant. Le type protège À L'INTÉRIEUR, la vérification protège À
LA FRONTIÈRE.

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

## Mini-exercice
Écris un type `Product = { id: number; title: string; price: number }`, un type guard
`isProduct(v: unknown): v is Product`, et une fonction `loadProduct(id)` qui `fetch` puis renvoie
`Product | null` selon la vérification. Ajoute un composant (pseudo-JSX) dont les `props` sont
`{ product: Product; onBuy: (id: number) => void }` et fais échouer volontairement une prop pour voir
l'erreur de compilation. Pratique associée : `ts-union-area`, `ts-interface-cart`, `ts-pluck`,
`react-profile`.

## ✅ Correction attendue
**La démarche** : typer les props en premier (c'est le contrat du composant), les événements ensuite, et traiter la frontière API en dernier — parce que c'est la seule des trois où le typage statique ne protège de rien.

**L'erreur probable, et elle est massivement répandue.** À la frontière, presque tout le monde écrit :

```ts
const data = await res.json() as User;   // ⚠️
```

Le code compile, l'autocomplétion fonctionne, `data.name` est proposé — tout **semble** typé. En réalité `as` ne vérifie rien : c'est une affirmation adressée au compilateur, pas un contrôle. Si l'API renvoie `{ id: "42", nom: "Lina" }`, TypeScript reste silencieux et le programme plante plus loin, sur `data.name.toUpperCase()`, avec un message qui ne mentionne ni l'API ni le champ manquant.

Le piège séduit pour une raison précise : `as` produit exactement la même expérience d'édition qu'un type honnête. On croit avoir typé parce qu'on voit les propriétés s'afficher. **La règle qui protège tient en une phrase : `as` sert à convertir ce qu'on sait déjà, jamais à découvrir ce qu'on reçoit.** À une frontière, la seule réponse est `unknown` suivi d'un contrôle qui s'exécute — le prédicat `v is User` de la leçon.

Second réflexe fautif, plus subtil : écrire le type guard et oublier la branche `else`. On vérifie, on est content, et si la vérification échoue on ne fait rien — le composant reste vide sans que personne ne sache pourquoi. Une validation sans traitement de l'échec ne fait que déplacer le silence.

**Alternative défendable** aux prédicats écrits à la main : une bibliothèque de validation de schéma, qui génère à la fois le contrôle d'exécution ET le type TypeScript à partir d'une seule déclaration. C'est ce que font la plupart des équipes, et cela supprime le risque de désynchronisation entre le type et le guard — le défaut principal de l'écriture manuelle, où l'on ajoute un champ au type sans l'ajouter au prédicat. Écrire un guard à la main reste l'exercice utile pour comprendre ce que la bibliothèque fait à ta place.

**Vérifie seul, sans corrigé** :
1. Cherche `as` dans ton code. Chaque occurrence à une frontière est un bug qui attend.
2. Fais renvoyer volontairement une forme incorrecte par ton API simulée. Ton interface doit afficher une erreur maîtrisée — pas un écran blanc, pas une exception dans la console.
3. Ajoute un champ à ton type `User` sans toucher au guard. Si tout compile encore, tu viens de créer la désynchronisation décrite ci-dessus : c'est le cas exact où une bibliothèque de schéma gagne.
4. Passe une valeur invalide à `tone`. Le compilateur doit refuser. Sinon, l'union littérale n'en est pas une.

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
