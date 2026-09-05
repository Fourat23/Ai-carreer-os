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

### Trois vérifications à faire une fois, et à ne plus jamais oublier

Avant de manipuler des salaires et des listes, trois comportements de JavaScript qu'aucune
intuition ne donne. Ils sont **exécutés** par `scripts/v70-verifications/js-pieges.mjs` ; ouvre
une console et refais-les toi-même, ça prend deux minutes.

**1. Les nombres à virgule ne sont pas ceux de l'école.**

```
0.1 + 0.2              ->  0.30000000000000004
0.1 + 0.2 === 0.3      ->  false
19.99 * 100            ->  1998.9999999999998
Math.round(19.99 * 100)->  1999
```

Ce n'est pas un défaut de JavaScript : c'est la représentation binaire des décimaux, commune à
presque tous les langages. Un dixième ne s'écrit pas exactement en base deux, comme un tiers ne
s'écrit pas exactement en base dix.

La conséquence pratique est directe et elle concerne ton code de tous les jours : **ne stocke
jamais un montant en euros dans un nombre à virgule.** Stocke des centimes, en entiers —
`1999` et non `19.99` — et divise seulement à l'affichage. C'est la règle de tous les systèmes
qui manipulent de l'argent, et son absence produit des écarts d'un centime qui, en
comptabilité, sont des écarts.

Second effet, moins connu : au-delà de `Number.MAX_SAFE_INTEGER` (**9 007 199 254 740 991**),
les entiers cessent d'être distincts. La mesure le montre : `9007199254740993 ===
9007199254740992` renvoie **`true`**. Un identifiant venu d'une base sur 64 bits n'est donc pas
manipulable en `Number` — il se transporte en chaîne de caractères, ou en `BigInt`.

**2. `sort()` sans argument ne trie pas des nombres.**

```
[10, 9, 100, 1].sort()                 ->  [1, 10, 100, 9]
[10, 9, 100, 1].sort((a, b) => a - b)  ->  [1, 9, 10, 100]
```

Par défaut, `sort` convertit chaque élément **en texte** et compare des chaînes : `"10"` vient
avant `"9"` comme « ba » vient avant « c ». Le tri par défaut n'est correct que pour des mots.

Et même pour des mots, il faut se méfier en français :

```
['Émile','Alice','Zoé','Édouard'].sort()                       -> Alice, Zoé, Édouard, Émile
… .sort((a, b) => a.localeCompare(b, 'fr'))                    -> Alice, Édouard, Émile, Zoé
```

Le tri par défaut compare des codes de caractères : les lettres accentuées, situées plus loin
dans la table, arrivent **après le Z**. `localeCompare` connaît les règles de la langue. Toute
liste de noms affichée à un utilisateur francophone doit l'utiliser.

**3. `==` compare après conversion ; `===` compare vraiment.**

```
'' == 0        ->  true          '' === 0    ->  false
'0' == 0       ->  true          '' == '0'   ->  false
[] == false    ->  true          NaN === NaN ->  false
```

Regarde les deux premières lignes de la colonne de gauche : `''` égale `0`, `'0'` égale `0`, et
pourtant `''` **n'égale pas** `'0'`. L'égalité lâche n'est pas transitive — elle ne se
mémorise pas, elle ne se raisonne pas.

D'où la règle sans exception : **toujours `===`.** La seule utilisation défendable de `==` est
`x == null`, qui teste `null` **et** `undefined` d'un coup.

Note aussi `NaN === NaN` qui vaut `false` : c'est la seule valeur du langage qui n'est pas
égale à elle-même. Pour la tester, `Number.isNaN(x)`.

## ⚠️ Erreurs fréquentes
- `const b = a; b.push(x)` → a change aussi (référence partagée).
- `[10, 9, 1].sort()` → `[1, 10, 9]` (tri ALPHABÉTIQUE sans comparateur).
- `if (arr.indexOf(x))` bugge quand x est en position 0 (0 est falsy) — utiliser `includes`.
- `{ ...obj }` ne protège qu'UN niveau : l'imbriqué reste partagé.

## 🔗 Liens avec le programme
Tes applications RAG (mois 8-9) manipuleront des tableaux d'objets (chunks avec métadonnées) avec exactement ces gestes : filtrer par score, trier par similarité, regrouper par document. Valider la sortie JSON d'un LLM = vérifier types et structure — la conscience des types commence ici. Et le cache d'appels LLM (mois 10) = une closure + une Map, deux concepts de cette leçon.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je sais dire, pour n'importe quelle variable, si elle se copie ou se partage.
- [ ] J'écris `===` sans y penser, et je sais pourquoi `"5" + 2` ≠ `"5" - 2`.
- [ ] Je transforme un tableau d'objets sans jamais modifier l'original, et je sais le PROUVER.
- [ ] Je sais que `{ ...obj }` ne protège qu'un seul niveau.

## 🏢 Cas professionnel
Une équipe corrige un bug de panier : le total ne correspond plus aux articles affichés. La cause, trouvée après deux jours, tenait en une ligne — une fonction de calcul de remise recevait le panier et faisait `article.prix *= 0.9` « pour aller vite ». Elle ne retournait rien de faux ; elle abîmait son entrée. Le panier affiché et le panier facturé divergeaient selon l'ordre d'appel des écrans.

C'est le scénario typique : le bug de référence ne casse pas au moment de la faute, il casse **ailleurs et plus tard**, chez quelqu'un d'autre. D'où la règle que beaucoup d'équipes écrivent noir sur blanc dans leur guide de style : **une fonction ne modifie pas ce qu'on lui donne**. Le coût de la discipline est un spread ; le coût de son absence est une enquête.

## 🔥 Pratique — les tableaux, les objets, et ce qui se partage

**A. Les quatre opérations.** Sur un tableau de dix produits `{nom, prix,
categorie}` : les noms sous 20 €, le prix total, une remise de 10 % sur une
catégorie **sans modifier l'original**, et un regroupement par catégorie. Fais-le
en boucles, puis avec les fonctions de tableau. Livrable : les deux versions.

**B. Prouver la non-modification.** Pour la remise, **prouve** que l'original est
intact — pas « je crois », une vérification. Livrable : la preuve.

**C. La copie qui ne copie pas.** Reproduis le cas d'un objet de configuration
copié superficiellement, dont un niveau imbriqué est partagé. Livrable : la
sortie qui le montre, et la correction.

**D. Les résultats qui surprennent.** Exécute les dix expressions de la
correction ci-dessous et, pour chacune, écris ta prédiction **avant**. Livrable :
tes prédictions, les résultats, et la règle derrière chaque écart.

**E. Le tri.** Trie un tableau de nombres avec et sans fonction de comparaison,
puis un tableau d'objets par deux critères. Livrable : les trois résultats.

## ✅ Correction attendue — sur la pratique A → E

> Les valeurs de C et D sont **exécutées** par
> `scripts/v70-verifications/js-async-et-types.mjs`.

**A — la démarche.** L'ordre qui organise les quatre opérations : **choisir**
(filtrer), **transformer** (appliquer), **agréger** (réduire). Le regroupement est
une réduction dont l'accumulateur est un objet dont les clés sont les catégories.

La version en boucles n'est pas un exercice de style : elle est là pour que tu
saches ce que font les fonctions de tableau. Si tu ne peux pas écrire la version
en boucles, tu utilises un outil dont tu ignores le mécanisme.

**B — la preuve de non-modification.** L'erreur presque universelle :

```js
const soldes = produits.map((p) => {
  if (p.categorie === "jeux") p.prix = p.prix * 0.9;   // ⚠️ modifie l original
  return p;
});
```

La fonction de transformation rend un **nouveau tableau**, mais elle contient les
**mêmes objets**. Modifier une propriété modifie l'original, et le nouveau tableau
donne l'illusion du contraire.

La forme correcte construit un nouvel objet :

```js
const soldes = produits.map((p) =>
  p.categorie === "jeux" ? { ...p, prix: p.prix * 0.9 } : p);
```

Et la preuve n'est pas « je vois que ça marche » : c'est une comparaison explicite
de l'original **avant** et après — `const avant = produits[0].prix`, puis on
recompare une fois la remise appliquée. C'est le seul test qui ne se laisse pas
tromper : le test naïf `soldes !== produits` répond `true` même dans la version
fautive, puisque le tableau, lui, est bien neuf. Ce défaut est invisible tant
qu'on ne regarde que le résultat.

**Une alternative défendable, et elle est meilleure qu'on ne croit.** Ne construis
aucun second tableau : garde les produits intacts et calcule le prix remisé au
moment de l'affichage. Une seule source de vérité, donc aucune désynchronisation
possible — au prix d'un recalcul à chaque rendu. C'est exactement l'arbitrage
**stocké contre dérivé** que tu retrouveras en React, et il vaut la peine de le
reconnaître ici, sur dix produits, plutôt que plus tard sur une interface.

**C — la copie d'un seul niveau.** Mesuré :

```
apres { ...d1 } puis modification de la copie :
  d1.nom             = "defaut"   <- inchangé
  d1.options.verbeux = true       <- MODIFIÉ

apres structuredClone(d2) puis modification du clone :
  d2.options.verbeux = false      <- inchangé
```

L'opérateur de décomposition copie **un niveau**. Les objets imbriqués restent
partagés, et une modification les traverse.

Le cas le plus coûteux en pratique : un objet de configuration par défaut, copié
superficiellement pour chaque utilisateur. La première modification contamine
tout le monde, et **le défaut ne se manifeste qu'au deuxième utilisateur** —
donc jamais en développement.

Ce n'est pas un piège du langage : c'est la distinction entre valeur et
référence, présente dans presque tous les langages. Savoir la **nommer** vaut
mieux que mémoriser une liste de cas.

**D — les dix expressions.**

```
0.1 + 0.2 === 0.3                  -> false
0.1 + 0.2                          -> 0.30000000000000004
[10, 9, 100].sort()                -> [10, 100, 9]
[10, 9, 100].sort((a,b) => a-b)    -> [9, 10, 100]
[] == false                        -> true
[] === false                       -> false
typeof null                        -> "object"
NaN === NaN                        -> false
Object.is(NaN, NaN)                -> true
["1","2","3"].map(parseInt)        -> [1, NaN, NaN]
```

Les règles derrière, à retenir plutôt que les résultats :

- les nombres sont en binaire à virgule flottante, et 0,1 n'a pas de
  représentation binaire finie. **On ne stocke jamais de l'argent en nombre à
  virgule** : on stocke des centimes en entier ;
- le tri sans argument **convertit chaque élément en chaîne** et trie
  lexicographiquement : « 10 » vient avant « 9 » comme « ab » vient avant « b » ;
- `==` convertit les deux côtés avant de comparer, `===` ne convertit rien — d'où
  l'usage de `===` par défaut, qui supprime toute une famille de surprises ;
- `typeof null` est un défaut historique du langage, conservé pour compatibilité.
  Il ne s'explique pas, il se connaît ;
- `NaN === NaN` est faux parce que la norme des nombres à virgule flottante le
  spécifie ainsi ; on teste avec `Number.isNaN(x)` ou `Object.is` ;
- la fonction de transformation passe **trois** arguments (valeur, index, tableau)
  et `parseInt` en accepte **deux**, le second étant la **base** de numération. On
  demande donc `parseInt('2', 1)` — base invalide, d'où `NaN`. D'où la règle, qui
  vaut bien au-delà de ce cas : **ne passe jamais directement à un `map` une
  fonction dont tu ne connais pas l'arité**.

**E — le tri.** Le résultat sans fonction de comparaison est la démonstration
directe du troisième point ci-dessus. Sur des objets à deux critères, la forme
attendue compare le second critère seulement quand le premier est à égalité.

Un piège que la correction attend que tu connaisses : **le tri modifie le tableau
d'origine.** Si tu tries pour afficher, tu viens de réordonner la donnée de
quelqu'un d'autre. Trier une copie est la règle sûre, et c'est le même sujet que
B et C.

## 🎤 Questions d'entretien
- « Quelle est la différence entre valeur et référence en JavaScript ? » → Les primitifs se copient à l'affectation ; objets et tableaux se partagent. Passer un objet à une fonction, c'est l'autoriser à le modifier.
- « `{ ...obj }` fait-il une copie ? » → Oui, sur un seul niveau. Les objets imbriqués restent partagés — c'est une copie superficielle, et c'est la source des bugs qu'on croit avoir évités.
- « Pourquoi `===` plutôt que `==` ? » → `==` convertit les types avant de comparer, ce qui produit des égalités surprenantes. `===` compare valeur ET type, donc ne réserve aucune surprise.
- « `[10, 9, 1].sort()` renvoie quoi ? » → `[1, 10, 9]` : sans comparateur, `sort` trie les représentations TEXTUELLES. Pour des nombres il faut `sort((a, b) => a - b)`.

## 📚 Vocabulaire
**primitif** · **référence** · **copie superficielle / profonde** · **truthy / falsy** · **callback** · **fonction d'ordre supérieur** · **closure** · **fonction pure** · **effet de bord** · **immutabilité** · **accumulateur**.

## 🧾 À retenir
JS manipule des valeurs typées ; les primitifs se copient, les objets se PARTAGENT (référence) — la source du bug débutant n°1. Les données réelles sont des tableaux d'objets traités par six gestes universels. Les fonctions sont des valeurs (callbacks, closures), et la discipline pureté + immutabilité rend le code testable et prévisible. Tout ton stack futur (TypeScript, React, apps LLM) repose sur ces fondations.
