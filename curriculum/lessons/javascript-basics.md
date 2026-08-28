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

**Limite de l'analogie** : avec un Google Doc, tu VOIS le curseur de l'autre bouger. Ici, rien ne signale le partage — c'est justement ce qui rend le bug si difficile. Le code qui casse `a` peut se trouver dans un autre fichier, écrit six mois plus tôt, et il ne mentionne jamais `a` : il ne connaît que `b`. Retiens la conséquence plutôt que l'image : **passer un objet à une fonction, c'est lui donner le droit de le modifier.**

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
**Énoncé** : on te donne une liste d'employés. Il faut (a) les noms de ceux du service tech, et (b) augmenter Lina de 10 % **sans abîmer la liste d'origine**, qu'un autre écran affiche encore.

```js
const employes = [
  { nom: "Lina", service: "tech", salaire: 45000 },
  { nom: "Marc", service: "rh", salaire: 38000 },
];
```

**Raisonnement, étape par étape.**

1. « Les noms des employés tech » contient deux gestes, pas un : d'abord **choisir** des employés, ensuite **en extraire** une donnée. Deux gestes, deux outils — `filter` puis `map`. Écrire une seule boucle qui fait les deux marche aussi, mais on ne relit plus l'intention.
2. Pour la sélection : `filter` garde les éléments pour lesquels le test est vrai, et on compare avec `===` — jamais `==`, pour la raison vue plus haut.
3. Pour l'augmentation, la contrainte « sans abîmer l'original » est ce qui décide de tout. Le réflexe naturel serait `lina.salaire *= 1.1`. Mais `lina` est une RÉFÉRENCE vers l'objet du tableau : le modifier modifie la liste que l'autre écran affiche. Il faut donc produire du NEUF.
4. `map` construit un tableau neuf. Reste à décider quoi mettre dedans pour chaque employé : une copie modifiée pour Lina, l'employé inchangé pour les autres.
5. `{ ...e, salaire: ... }` copie les champs de `e` puis écrase `salaire` — l'ordre compte, la dernière écriture gagne.

```js
const nomsTech = employes
  .filter((e) => e.service === "tech")
  .map((e) => e.nom);

const augmentes = employes.map((e) =>
  e.nom === "Lina" ? { ...e, salaire: e.salaire * 1.1 } : e
);
```

**Ce que ça t'a appris** : la contrainte « sans toucher l'original » ne s'obtient pas en faisant attention, elle s'obtient en ne modifiant jamais — on fabrique du neuf et on laisse l'ancien tranquille.

**Variante qui déplace le problème** : et si l'employé était `{ nom, service, contact: { email } }` et qu'il fallait changer l'email ? `{ ...e, contact: { ...e.contact, email } }`. Le spread ne copie qu'UN niveau : `{ ...e, contact: { email } }` perdrait tous les autres champs de `contact`, et `e.contact.email = x` modifierait l'original. Copier en profondeur se fait niveau par niveau.

## ⚠️ Erreurs fréquentes
- `const b = a; b.push(x)` → a change aussi (référence partagée).
- `[10, 9, 1].sort()` → `[1, 10, 9]` (tri ALPHABÉTIQUE sans comparateur).
- `if (arr.indexOf(x))` bugge quand x est en position 0 (0 est falsy) — utiliser `includes`.
- `{ ...obj }` ne protège qu'UN niveau : l'imbriqué reste partagé.

## 🔗 Liens avec le programme
Tes applications RAG (mois 8-9) manipuleront des tableaux d'objets (chunks avec métadonnées) avec exactement ces gestes : filtrer par score, trier par similarité, regrouper par document. Valider la sortie JSON d'un LLM = vérifier types et structure — la conscience des types commence ici. Et le cache d'appels LLM (mois 10) = une closure + une Map, deux concepts de cette leçon.

## Mini-exercice
Sur un tableau de 10 produits `{nom, prix, categorie}` : (1) les noms des produits < 20 €, (2) le prix total, (3) appliquer -10 % sur une catégorie SANS modifier l'original (prouve-le), (4) regrouper par catégorie. En boucles d'abord, puis en map/filter/reduce.

## ✅ Correction attendue
**La démarche**, dans cet ordre : choisir (`filter`), transformer (`map`), agréger (`reduce`). Le regroupement est un `reduce` dont l'accumulateur est un objet dont les clés sont les catégories.

**L'erreur probable sur le point 3, et pourquoi elle passe inaperçue.** Presque tout le monde écrit :

```js
const soldes = produits.map((p) => {
  if (p.categorie === "jeux") p.prix = p.prix * 0.9;   // ⚠️ modifie l'original
  return p;
});
```

Le piège est redoutable parce que le code **a l'air immuable** : il y a un `map`, il y a un `return`, on obtient bien un nouveau tableau. Mais ce nouveau tableau contient les MÊMES objets, et on vient de les modifier au passage. `produits` est corrompu, et le test naïf `soldes !== produits` répond `true` — donc tout semble aller bien. La version correcte ne modifie jamais `p` : `p.categorie === "jeux" ? { ...p, prix: p.prix * 0.9 } : p`.

**Alternative défendable** : garder les produits intacts et calculer le prix remisé au moment de l'affichage, sans jamais stocker de second tableau. Une seule source de vérité, aucun risque de désynchronisation — mais il faut recalculer à chaque rendu. C'est exactement l'arbitrage « stocké contre dérivé » que tu retrouveras en React.

**Vérifie seul, sans corrigé** : garde le prix d'origine dans une variable AVANT (`const avant = produits[0].prix`), puis compare après coup. Si `avant` a changé, tu as muté — quelle que soit l'allure du code. C'est le seul test qui ne se laisse pas tromper.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je sais dire, pour n'importe quelle variable, si elle se copie ou se partage.
- [ ] J'écris `===` sans y penser, et je sais pourquoi `"5" + 2` ≠ `"5" - 2`.
- [ ] Je transforme un tableau d'objets sans jamais modifier l'original, et je sais le PROUVER.
- [ ] Je sais que `{ ...obj }` ne protège qu'un seul niveau.

## 🏢 Cas professionnel
Une équipe corrige un bug de panier : le total ne correspond plus aux articles affichés. La cause, trouvée après deux jours, tenait en une ligne — une fonction de calcul de remise recevait le panier et faisait `article.prix *= 0.9` « pour aller vite ». Elle ne retournait rien de faux ; elle abîmait son entrée. Le panier affiché et le panier facturé divergeaient selon l'ordre d'appel des écrans.

C'est le scénario typique : le bug de référence ne casse pas au moment de la faute, il casse **ailleurs et plus tard**, chez quelqu'un d'autre. D'où la règle que beaucoup d'équipes écrivent noir sur blanc dans leur guide de style : **une fonction ne modifie pas ce qu'on lui donne**. Le coût de la discipline est un spread ; le coût de son absence est une enquête.

## 🎤 Questions d'entretien
- « Quelle est la différence entre valeur et référence en JavaScript ? » → Les primitifs se copient à l'affectation ; objets et tableaux se partagent. Passer un objet à une fonction, c'est l'autoriser à le modifier.
- « `{ ...obj }` fait-il une copie ? » → Oui, sur un seul niveau. Les objets imbriqués restent partagés — c'est une copie superficielle, et c'est la source des bugs qu'on croit avoir évités.
- « Pourquoi `===` plutôt que `==` ? » → `==` convertit les types avant de comparer, ce qui produit des égalités surprenantes. `===` compare valeur ET type, donc ne réserve aucune surprise.
- « `[10, 9, 1].sort()` renvoie quoi ? » → `[1, 10, 9]` : sans comparateur, `sort` trie les représentations TEXTUELLES. Pour des nombres il faut `sort((a, b) => a - b)`.

## 📚 Vocabulaire
**primitif** · **référence** · **copie superficielle / profonde** · **truthy / falsy** · **callback** · **fonction d'ordre supérieur** · **closure** · **fonction pure** · **effet de bord** · **immutabilité** · **accumulateur**.

## 🧾 À retenir
JS manipule des valeurs typées ; les primitifs se copient, les objets se PARTAGENT (référence) — la source du bug débutant n°1. Les données réelles sont des tableaux d'objets traités par six gestes universels. Les fonctions sont des valeurs (callbacks, closures), et la discipline pureté + immutabilité rend le code testable et prévisible. Tout ton stack futur (TypeScript, React, apps LLM) repose sur ces fondations.
