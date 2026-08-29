<!-- keep -->
# Leçon — La récursion en profondeur

## 🌍 Le problème d'abord
On te donne un dossier qui contient des fichiers ET d'autres dossiers, eux-mêmes contenant des
fichiers et des dossiers, sur une profondeur que tu ne connais pas d'avance. Comment compter
TOUS les fichiers ? Une boucle simple ne suffit pas : tu ne sais pas combien de niveaux il y a.
Le même problème revient partout — un JSON profondément imbriqué, un arbre de commentaires,
l'arborescence d'un site. La récursion est l'outil taillé pour ça : une fonction qui, pour
résoudre un gros problème, se rappelle elle-même sur un problème plus PETIT, jusqu'à un cas
trivial. Le piège du débutant est d'y voir une curiosité intimidante ; en réalité c'est un
outil quotidien, à condition de respecter deux règles simples. Cette leçon te les donne.

## 🎯 Objectif
Maîtriser la récursion comme OUTIL (pas comme curiosité) : pile d'appels, confiance récursive, structures imbriquées, backtracking d'introduction, et conversion récursif ↔ itératif. Indispensable pour les arbres, le JSON profond, et les entretiens.

## 🧠 Modèle mental
Une fonction récursive, c'est **des poupées russes** : chaque appel ouvre une poupée plus petite, jusqu'à la plus petite (le cas de base), puis on referme en remontant les résultats. Deux règles absolues : une poupée finale existe, et chaque ouverture rapproche d'elle.

## 🧩 Prérequis
Tu dois maîtriser les fonctions (paramètres, valeur de retour, portée) et les conditions
(`/doc/lessons/javascript-basics`), et avoir une intuition de la pensée algorithmique — découper
un problème en sous-problèmes (`/doc/lessons/algorithmic-thinking`). Comprendre qu'un appel de
fonction « met en pause » l'appelant jusqu'au retour aide à visualiser la pile d'appels. Aucune
structure de données avancée n'est supposée : on les aborde ici.

## Explication complète

### La pile d'appels, construite une fois

Quand une fonction en appelle une autre, la première ne disparaît pas : elle attend. Le
langage doit donc mémoriser où elle en était — la ligne suivante à exécuter, la valeur de
ses variables. Il empile ce contexte, exécute la nouvelle fonction, puis dépile pour
reprendre là où il s'était arrêté. C'est vrai pour tout appel de fonction, récursif ou non.

La récursion n'ajoute rien à ce mécanisme. Elle l'utilise seulement en empilant la **même**
fonction plusieurs fois, chaque copie avec ses propres variables. Prenons `factorielle(3)` :

```
factorielle(3)   →  besoin de factorielle(2)   [en attente : 3 × ?]
  factorielle(2) →  besoin de factorielle(1)   [en attente : 2 × ?]
    factorielle(1) → 1                          ← cas de base, plus d'appel
  factorielle(2) reprend : 2 × 1 = 2
factorielle(3) reprend : 3 × 2 = 6
```

Trois contextes coexistent au plus profond. Chacun a **son** `n` : celui du milieu vaut 2 et
ne bouge pas pendant que celui du dessous s'exécute. C'est là toute la magie apparente, et
elle disparaît dès qu'on l'a vue une fois.

Deux conséquences pratiques en découlent immédiatement. D'abord, **rien ne se calcule à la
descente** : `factorielle(3)` ne peut pas multiplier tant qu'elle n'a pas la valeur d'en
dessous, donc tout le travail a lieu à la remontée. Ensuite, cette pile a une **taille
limitée** — quelques milliers de niveaux — et la dépasser produit un `RangeError: Maximum
call stack size exceeded`. Ce message ne veut jamais dire « ton algorithme est mauvais » : il
veut dire « tu es descendu trop profond », soit parce que la profondeur est réelle, soit
parce que tu ne remontes jamais.

### La confiance récursive, et pourquoi elle est nécessaire

Écrire une fonction récursive en la déroulant mentalement est épuisant, et devient
impossible au-delà de trois niveaux. Ce n'est pas un manque d'entraînement : c'est la
mauvaise méthode.

La bonne méthode consiste à écrire la fonction en **supposant qu'elle marche déjà**. Pour
`somme([1,2,3,4])`, on ne se demande pas comment obtenir 10 ; on se demande : *si quelqu'un
me donnait la somme du reste, qu'est-ce que j'en ferais ?* La réponse est immédiate :
j'ajoute le premier élément. Le code s'écrit alors sans avoir rien déroulé.

Cette supposition n'est pas de la foi. Elle est **valide** dès que deux choses sont vraies,
et ce sont exactement les deux règles :

1. **il existe un cas qui n'appelle pas** — sinon la descente ne s'arrête jamais ;
2. **chaque appel réduit le problème** — sinon on n'atteint jamais ce cas.

Si ces deux conditions tiennent, la récursion se termine, et le raisonnement est correct par
construction. Le vérifier prend cinq secondes ; dérouler quinze niveaux prend un quart
d'heure et se trompe.

### Où la récursion est le bon outil

Une boucle parcourt une séquence : elle avance d'un cran, puis d'un autre. Elle suppose donc
qu'on sait **combien de crans** il y a, ou au moins qu'ils sont alignés.

La récursion s'impose quand la structure se **contient elle-même** à une profondeur inconnue :
un dossier contient des dossiers, un commentaire a des réponses qui ont des réponses, un
JSON a des objets dans des tableaux dans des objets. Écrire une boucle pour cela demande de
gérer soi-même une pile de « où j'en étais à chaque niveau » — c'est-à-dire de réimplémenter
à la main ce que le langage fait déjà.

Le repère : **si la définition du problème contient le nom du problème, la solution est
récursive.** « La taille d'un dossier est la somme de la taille de ce qu'il contient » — le
mot « taille » apparaît des deux côtés.

### Une donnée mixte : trois cas, pas un de plus

Un JSON quelconque ne contient que trois sortes de choses, et il suffit de décider quoi
faire pour chacune :

- **un tableau** — on ne sait rien de ses éléments, donc on relance la fonction sur chacun ;
- **un objet** — pareil, sur chacune de ses valeurs ;
- **autre chose** — un nombre, une chaîne, un booléen, `null` : il n'y a plus rien à
  descendre. C'est le cas de base.

Attention à un piège du langage : en JavaScript, `typeof null` vaut `"object"`. Tester
`typeof x === "object"` fera donc descendre dans `null`, et l'accès aux valeurs échouera. Le
test correct est `x !== null && typeof x === "object"`. Ce n'est pas une subtilité
académique : c'est le bug qui casse un parcours de JSON sur trois.

### Le backtracking : rencontrer le problème avant de nommer la solution

Pour lister tous les sous-ensembles de `[1,2,3]`, tu prends chaque élément et tu décides :
je le garde, ou je ne le garde pas. Deux décisions par élément, trois éléments : huit
chemins. C'est un arbre, et l'explorer revient à parcourir cet arbre.

Le problème arrive à la remontée. Si tu construis le sous-ensemble courant dans un tableau
partagé, l'élément ajouté dans la branche « je le garde » est **toujours là** quand tu pars
explorer la branche « je ne le garde pas ». Tes deux branches ne partent pas du même état, et
tes résultats sont faux — sans qu'aucune erreur ne soit levée.

D'où le troisième geste, qui n'a rien d'évident tant qu'on ne s'est pas fait avoir :
**avant de remonter, on retire ce qu'on avait ajouté.** C'est ce qu'on appelle *défaire*, et
c'est la seule différence entre parcourir un arbre et faire du **backtracking**.

Un mot sur le coût, parce qu'il inquiète à tort : huit sous-ensembles pour trois éléments,
donc 2ⁿ en général. Cet exponentiel n'est pas la faute de la récursion — il y a réellement
2ⁿ sous-ensembles, et n'importe quelle méthode devra tous les produire. **Un algorithme n'est
lent que par rapport à ce que le problème permet.**

### Récursif ou itératif : ce qui décide vraiment

Tout ce qui s'écrit récursivement s'écrit en boucle, et réciproquement : la conversion
consiste à remplacer la pile du langage par une pile qu'on gère soi-même. La question n'est
donc jamais « lequel est possible » mais « lequel se relit ».

Pour un parcours **linéaire** — sommer, compter, chercher dans une liste plate — la boucle
gagne : elle est plus courte, et elle n'a pas de limite de profondeur. Pour un parcours
**arborescent**, la récursion gagne largement, parce que la pile explicite qu'il faudrait
écrire à la main est exactement ce qu'on cherchait à éviter.

Un cas mérite d'être connu : quand la profondeur peut atteindre des dizaines de milliers de
niveaux — une liste chaînée très longue, un fichier de données pathologique — la récursion
dépasse la pile alors que la boucle passe. C'est le seul cas où l'on convertit pour une
raison technique et non de lisibilité.

### Le piège du recalcul

`fib(n) = fib(n-1) + fib(n-2)` respecte les deux règles et donne des résultats justes. Il est
pourtant inutilisable au-delà de n ≈ 40, et la raison mérite d'être vue plutôt que crue.

`fib(5)` appelle `fib(4)` et `fib(3)`. Mais `fib(4)` appelle à son tour `fib(3)` et `fib(2)`.
**`fib(3)` est donc calculé deux fois — entièrement, avec tout son sous-arbre.** Plus bas,
`fib(2)` l'est cinq fois. Le nombre d'appels double à chaque niveau : l'arbre est exponentiel
alors qu'il n'existe que n valeurs distinctes à connaître.

La correction est le **mémoïsation** : garder les résultats déjà calculés dans une table et
les rendre au lieu de recalculer. L'arbre s'effondre en une ligne de n valeurs, et
`fib(100)` devient instantané. Retiens le symptôme plutôt que le cas : **quand un appel
récursif redemande un sous-problème déjà résolu ailleurs dans l'arbre, il y a un recalcul à
éliminer.**

## 🔧 Exemple simple
```js
const somme = (arr) => arr.length === 0 ? 0 : arr[0] + somme(arr.slice(1));
```
Cas de base : tableau vide → 0. Pas : premier + somme du reste.

## 🧭 Exemple guidé — retrouver le chemin d'un fichier

**La situation.** Tu as une arborescence en mémoire : chaque nœud est soit un fichier
(`{ type: "fichier", nom, taille }`), soit un dossier (`{ type: "dossier", nom, enfants }`).
On te demande une fonction `chemin(racine, nom)` qui renvoie le chemin complet du premier
fichier portant ce nom — `"projet/src/app.js"` — ou `null` s'il n'existe pas.

**Ce qui rend le cas non trivial.** Compter des fichiers est facile : chaque appel rend un
nombre, on additionne. Ici, le résultat cherché — un chemin — n'existe **à aucun endroit**
de la structure. Il doit être construit à partir de choses situées à des profondeurs
différentes : le nom du fichier est en bas, les noms des dossiers traversés sont au-dessus.

**Décision 1 — qui construit le chemin, la descente ou la remontée ?**

Le réflexe naturel est de le construire en descendant : on passe le chemin accumulé en
paramètre, `chemin(enfant, nom, prefixe + "/" + noeud.nom)`. Ça fonctionne, et c'est même
une réponse acceptable. Mais elle t'oblige à trimballer un troisième paramètre dont
l'appelant n'a que faire, et à lui donner une valeur initiale — que met-on au premier appel,
`""` ou le nom de la racine ? Deux essais et un doute.

L'autre voie : **chaque appel ne connaît que son propre nom** et laisse celui du dessus
préfixer. Un dossier qui reçoit `"src/app.js"` de son enfant rend `"projet/src/app.js"`. La
fonction garde deux paramètres, et il n'y a rien à initialiser.

**Décision 2 — que rend un appel qui ne trouve rien ?**

Il faut une réponse qui se distingue d'un chemin. `null` s'impose, et il change la forme du
code : le parent ne peut plus additionner aveuglément, il doit **tester** chaque enfant et
s'arrêter au premier qui répond.

C'est là que la confiance récursive paie. On ne se demande pas comment l'enfant trouve son
chemin ; on suppose qu'il rend soit un chemin, soit `null`, et on écrit ce qu'on fait des
deux cas.

**Décision 3 — s'arrêter au premier, ou tout parcourir ?**

L'énoncé dit « le premier ». Un `for` avec un `return` immédiat suffit — et il est
**meilleur** qu'un `map` suivi d'un `find`, parce qu'il n'explore pas les branches restantes
une fois la réponse trouvée. Sur une arborescence profonde, la différence est réelle.

```js
function chemin(noeud, nom) {
  if (noeud.type === "fichier") {
    return noeud.nom === nom ? noeud.nom : null;   // cas de base : je me connais, c'est tout
  }
  for (const enfant of noeud.enfants) {
    const trouve = chemin(enfant, nom);            // confiance : chemin PARTIEL ou null
    if (trouve !== null) return noeud.nom + "/" + trouve;   // je préfixe MON nom
  }
  return null;                                     // rien dans aucune branche
}
```

**Comment tu sais que ça marche.** Trois vérifications, dans cet ordre :
un fichier seul (`chemin({type:"fichier",nom:"a.js"}, "a.js")` → `"a.js"`) ; un nom absent
(→ `null`, sans exception) ; un fichier à deux niveaux, où le chemin rendu doit compter
exactement autant de `/` que de dossiers traversés. Si le nombre de barres est faux, c'est
le préfixage qui l'est.

**Ce que ça t'a appris.** Quand le résultat doit être **assemblé** à partir de plusieurs
niveaux, chaque appel n'a pas à connaître le tout : il lui suffit d'ajouter **sa** part au
résultat de l'appel du dessous. La récursion ne sert pas seulement à descendre — elle sert
surtout à composer en remontant.

**Variante qui déplace le problème.** Fais maintenant rendre **tous** les chemins des
fichiers portant ce nom, pas seulement le premier. Le `return` immédiat disparaît, et avec
lui la ressemblance avec l'exemple : chaque appel doit désormais rendre un **tableau**, le
parent concatène ceux de ses enfants (`resultats.push(...chemin(enfant, nom))`), et le cas
de base rend `[]` ou `[nom]`. Tu verras alors que le cas de base ne dépend pas du problème
mais du **type de retour** : c'était `null` pour « un ou rien », c'est `[]` pour « une
liste ». Le jour où tu hésiteras sur un cas de base, demande-toi d'abord ce que ta fonction
promet de rendre.

## 🤖 Exemple appliqué (IA / data / architecture)
Les documents d'un RAG sont des arbres (doc → sections → paragraphes) : le chunking par structure est un parcours récursif. Le JSON de sortie d'un LLM se valide récursivement. Les arbres de décision ML (mois 6) se parcourent récursivement. Une structure, l'outil partout.

## ⚠️ Erreurs fréquentes
- Cas de base absent ou jamais atteint (paramètre qui ne décroît pas) → stack overflow.
- Oublier `x !== null` avant `typeof x === "object"` (bug historique JS).
- Dérouler mentalement 10 niveaux au lieu de faire confiance (paralysie).
- fib naïf sur n > 35 (exponentiel) sans mémoïsation.

## 🚫 Anti-patterns
- La récursion pour du linéaire simple (une boucle est plus claire et sans limite de pile).
- L'état global muté depuis les appels récursifs (préférer paramètres et retours).

## ✍️ Mini-exercice
Écris `compterFeuilles(structure)` sur une donnée mixte — objets et tableaux imbriqués — en
traitant les trois cas vus plus haut. Teste sur un JSON à quatre niveaux contenant au moins
un `null`.

## 🔥 Exercice plus difficile
`sousEnsembles([1,2,3])` par le choix binaire prendre / ne-pas-prendre, en dessinant l'arbre
avant d'écrire une ligne. Puis `fib` mémoïsé : chronomètre `fib(35)` avant et après, et note
les deux chiffres.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Une fonction récursive respecte les deux règles et provoque quand même un dépassement de
   pile. Comment est-ce possible ?
2. Dans `chemin`, pourquoi le cas de base rend-il `noeud.nom` et pas le chemin complet ?
3. `fib` mémoïsé : où mets-tu la table, et que se passe-t-il si tu la crées **à l'intérieur**
   de la fonction ?
4. Tu dois parcourir une liste chaînée de 500 000 éléments. Récursif ou itératif ?

## ✅ Correction attendue

**La démarche.** Trois questions dans cet ordre, avant d'écrire quoi que ce soit : quel est
le cas qui n'appelle pas ? qu'est-ce qui décroît à chaque appel ? et **que promet de rendre
ma fonction** — car c'est cela qui détermine le cas de base.

**L'erreur probable, et elle survit longtemps parce qu'elle produit des résultats justes.**
Sur `compterFeuilles`, presque tout le monde écrit :

```js
if (typeof x === "object") { /* descendre */ }   // ❌
```

Le code marche sur les données de test, puis casse un jour sur une vraie donnée. Parce que
**`typeof null` vaut `"object"`** — un accident historique de JavaScript, jamais corrigé pour
ne pas casser le web existant. La fonction descend donc dans `null`, tente d'en lire les
valeurs, et échoue.

Le piège séduit parce que le test **exprime exactement l'intention** : « si c'est un objet,
descends ». La formulation est correcte, c'est le langage qui ment. Et rien ne le signale :
`null` est rare dans un JSON écrit à la main, fréquent dans un JSON venu d'une API.

Le repère à garder : **en JavaScript, tout test `typeof x === "object"` doit être précédé de
`x !== null`.** Sans exception.

**Sur les autres questions.** Un dépassement de pile malgré les deux règles signifie que la
profondeur est **réelle** : la récursion se terminerait, mais après plus de niveaux que la
pile n'en accepte. Les deux règles garantissent la terminaison, pas la faisabilité. C'est
exactement le cas de la liste chaînée de 500 000 éléments — la quatrième question — où il
faut une boucle, non pour la lisibilité mais parce que la pile ne suit pas.

Dans `chemin`, le cas de base rend `noeud.nom` seul parce qu'**un fichier ne connaît pas les
dossiers au-dessus de lui** — il n'a aucun moyen de les nommer. Le chemin complet n'existe
nulle part dans la structure : il se compose à la remontée, chaque niveau ajoutant sa part.
C'est le point de l'exemple.

Pour `fib`, la table doit **survivre entre les appels** — donc à l'extérieur de la fonction,
ou passée en paramètre, ou capturée par une fermeture. La créer à l'intérieur est l'erreur
classique : chaque appel récursif fabrique sa propre table vide, aucune mise en cache
n'opère, et le code reste exponentiel tout en ayant l'air mémoïsé. Le symptôme est net —
`fib(35)` met toujours plusieurs secondes.

**Alternative défendable** pour `sousEnsembles` : la méthode itérative, qui part de `[[]]` et
double la liste à chaque élément (pour chaque sous-ensemble déjà connu, en produire un
second avec l'élément ajouté). Elle est plus courte, sans limite de pile, et beaucoup la
trouvent plus claire. La version récursive garde un avantage : elle **montre** l'arbre de
décision, qui est le concept réutilisable — on le retrouvera dans tout problème de choix
successifs.

**Vérifie seul, sans corrigé** :
1. Mets un `null` dans ton JSON de test. Ta fonction survit-elle ?
2. Compte les résultats de `sousEnsembles` sur 4 éléments. Tu dois en avoir exactement 16 ;
   8 signifie que tu as oublié une branche, 24 que tu ne défais pas.
3. Chronomètre `fib(35)` mémoïsé. Si c'est encore lent, ta table est au mauvais endroit.
4. Dessine la pile de `chemin` sur une arborescence à trois niveaux, puis compare au nombre
   de `/` du résultat. Les deux doivent correspondre.

## 🎤 Questions d'entretien
- « Explique la récursion et ses deux règles. » → Cas de base sans appel ; chaque appel s'en rapproche. Sinon : stack overflow.
- « Pourquoi fib naïf est-il lent ? » → Arbre d'appels exponentiel (recalculs) ; mémoïsation → linéaire.
- « Récursif ou itératif ? » → Itératif pour le linéaire ; récursif pour l'arborescent ; savoir convertir les deux sens.

## 🧾 À retenir
- Cas de base + rapprochement + confiance récursive.
- La récursion épouse les structures imbriquées (arbres, JSON, DOM).
- Moule à 3 branches pour les données mixtes ; mémoïsation contre les recalculs.

## 📚 Vocabulaire
**cas de base / cas récursif** · **pile d'appels** · **stack overflow** · **leap of faith** · **parcours en profondeur** · **backtracking** · **mémoïsation** · **profondeur**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je dessine la pile d'appels d'une récursion simple sans hésiter.
- [ ] J'applique le moule à 3 branches à tout JSON imbriqué.
- [ ] Je sais convertir récursif ↔ itératif et dire quand chacun gagne.

## 🔗 Liens avec le programme
Jours 25, 29, 32 (mois 1-2) ; arbres semaine 6 ; chunking mois 8. Leçons liées : `algorithmic-thinking`, `data-structures-intro`, `chunking-strategies`.
