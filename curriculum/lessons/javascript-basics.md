<!-- keep -->
# Leçon — JavaScript : les bases solides

## 🌍 Le problème d'abord
Tu écris ta première ligne de code et tu veux qu'un ordinateur FASSE quelque chose :
garder une liste de courses, calculer un total, afficher un message. Pour ça, il faut
lui parler dans une langue qu'il comprend. **JavaScript** est cette langue — et elle a
un super-pouvoir : elle tourne PARTOUT (dans ton navigateur, sur un serveur, dans des
outils). Mais comme toute langue, elle a des règles surprenantes qui piègent les
débutants (par exemple, additionner du texte et un nombre ne fait pas ce qu'on croit).
Cette leçon te donne les bases solides pour dire à la machine QUOI faire, en évitant
les pièges qui causent l'essentiel des bugs de débutant.

## 🎯 Objectif
Manipuler les **valeurs** et **types**, comprendre la différence cruciale entre
**valeur et référence**, utiliser **tableaux**, **objets** et **fonctions**, et
adopter deux disciplines (**pureté**, **immutabilité**) qui rendent le code fiable.

## 🧩 Prérequis
Aucune expérience de programmation n'est requise : c'est une leçon de premier
contact. Il faut seulement savoir ouvrir un éditeur ou une console JavaScript pour
essayer les exemples. Les notions de valeur, type, variable et fonction sont
construites ici, à partir de zéro.

## 🧠 Modèle mental
Un programme, c'est des **valeurs** (des données : un texte, un nombre) rangées dans
des **variables** (des étiquettes), et des **fonctions** (des actions réutilisables)
qui les transforment. L'idée la plus importante à intégrer tout de suite : certaines
valeurs se **copient** quand on les passe (les nombres, les textes), d'autres se
**partagent** (les objets, les tableaux). Confondre les deux est LA source de bugs du
débutant — on y revient en détail plus bas.

## 💡 Pourquoi c'est important
JavaScript est le seul langage qui tourne partout : navigateur, serveur (Node), scripts, outils. C'est ta première langue de programmation sérieuse et le véhicule de la moitié de ton année (CLI mois 2, API mois 3, front mois 4, apps LLM mois 8-12). Mais surtout : les CONCEPTS appris ici (types, références, fonctions, immutabilité) sont universels — Python (mois 5) ne sera qu'un changement de syntaxe.

## Explication complète

### Valeurs et types : ce que manipule vraiment le programme
Un programme manipule des **valeurs**, chacune d'un **type** : `string` (texte), `number` (42 et 3.14 — un seul type), `boolean`, `undefined` (pas encore de valeur), `null` (absence volontaire). Une **variable** est une étiquette posée sur une valeur : `const` par défaut (l'étiquette ne bougera pas), `let` si elle doit être réassignée.

**Le piège fondateur de JS** : les conversions implicites. `"5" + 2` donne `"52"` (le `+` concatène dès qu'une string est là) mais `"5" - 2` donne `3` (le `-` force la conversion). D'où la règle absolue : comparer avec `===` (valeur ET type), jamais `==`. Et d'où l'existence de TypeScript, qui verrouille tout ça à la compilation.

### Le concept qui cause 50 % des bugs débutants : valeur vs référence
Les primitifs (nombres, strings, booléens) se copient PAR VALEUR : `let b = a` fait une vraie copie. Les objets et tableaux se copient PAR RÉFÉRENCE : `const b = a` ne copie RIEN — a et b pointent vers le MÊME objet ; modifier l'un modifie « l'autre » (c'est le même).

**Analogie** : le primitif est une photocopie (chacun la sienne) ; l'objet est un Google Doc partagé (deux liens, un seul document). Pour copier réellement : `[...arr]`, `{ ...obj }` — et attention, cette copie est SUPERFICIELLE (un seul niveau : les objets imbriqués restent partagés).

### Les structures : tableau et objet
- Le **tableau** ordonne (accès par index, `push/pop`, parcours). 
- L'**objet** nomme (accès par clé : `user.nom` ou `user[cle]` quand la clé est dynamique). 
- Le monde réel est fait de **tableaux d'objets** : c'est le format de toute API, toute base, tout fichier de données. Les six gestes universels dessus : chercher, filtrer, transformer, agréger, trier, regrouper — d'abord en boucles, puis avec `map/filter/reduce`.

### Les fonctions : des valeurs comme les autres
Une fonction se stocke dans une variable, se passe en argument (callback), se retourne. C'est ce qui rend possibles `sort((a, b) => a - b)`, `map`, `filter` — et les **closures** : une fonction retournée qui se souvient des variables de sa fabrique (l'état privé de JS, massivement utilisé par React).

### La discipline qui paie : pureté et immutabilité
Une fonction **pure** (même entrée → même sortie, zéro effet de bord) est testable, cachable, prévisible. L'**immutabilité** (retourner des versions neuves au lieu de modifier) évite les bugs de référence partagée et rend possible l'undo/redo. Ce sont des choix de style aujourd'hui, des OBLIGATIONS en React demain.

## Concepts clés
`const`/`let` · types primitifs · conversions et `===` · truthy/falsy (les 6 falsy : `false, 0, "", null, undefined, NaN`) · valeur vs référence · copie superficielle (spread) · tableaux, objets, tableaux d'objets · fonctions fléchées · callbacks · closures · `map/filter/reduce` · pureté, immutabilité.

## 🧭 Exemple guidé
```js
const employes = [
  { nom: "Lina", service: "tech", salaire: 45000 },
  { nom: "Marc", service: "rh", salaire: 38000 },
];
// « les noms des employés tech » — se lit comme une phrase :
const nomsTech = employes
  .filter((e) => e.service === "tech")
  .map((e) => e.nom);
// Immutabilité : augmenter Lina SANS toucher l'original
const augmentes = employes.map((e) =>
  e.nom === "Lina" ? { ...e, salaire: e.salaire * 1.1 } : e
);
```

## ⚠️ Erreurs fréquentes
- `const b = a; b.push(x)` → a change aussi (référence partagée).
- `[10, 9, 1].sort()` → `[1, 10, 9]` (tri ALPHABÉTIQUE sans comparateur).
- `if (arr.indexOf(x))` bugge quand x est en position 0 (0 est falsy) — utiliser `includes`.
- `{ ...obj }` ne protège qu'UN niveau : l'imbriqué reste partagé.

## 🔗 Liens avec le programme
Tes applications RAG (mois 8-9) manipuleront des tableaux d'objets (chunks avec métadonnées) avec exactement ces gestes : filtrer par score, trier par similarité, regrouper par document. Valider la sortie JSON d'un LLM = vérifier types et structure — la conscience des types commence ici. Et le cache d'appels LLM (mois 10) = une closure + une Map, deux concepts de cette leçon.

## Mini-exercice
Sur un tableau de 10 produits `{nom, prix, categorie}` : (1) les noms des produits < 20 €, (2) le prix total, (3) appliquer -10 % sur une catégorie SANS modifier l'original (prouve-le), (4) regrouper par catégorie. En boucles d'abord, puis en map/filter/reduce.

## 📚 Vocabulaire
**primitif** · **référence** · **copie superficielle / profonde** · **truthy / falsy** · **callback** · **fonction d'ordre supérieur** · **closure** · **fonction pure** · **effet de bord** · **immutabilité** · **accumulateur**.

## 🧾 À retenir
JS manipule des valeurs typées ; les primitifs se copient, les objets se PARTAGENT (référence) — la source du bug débutant n°1. Les données réelles sont des tableaux d'objets traités par six gestes universels. Les fonctions sont des valeurs (callbacks, closures), et la discipline pureté + immutabilité rend le code testable et prévisible. Tout ton stack futur (TypeScript, React, apps LLM) repose sur ces fondations.
