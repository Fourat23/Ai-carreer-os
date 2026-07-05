<!-- keep -->
# Comment débugger (méthode)

Le debugging n'est presque jamais enseigné, et c'est pourtant 50 % du métier. Le débutant modifie au hasard ; le professionnel déroule une méthode. Voici la méthode.

## Le principe : ne JAMAIS modifier au hasard
Chaque changement non compris crée deux bugs potentiels et te fait perdre le fil. Une modification = une hypothèse testée.

## La méthode en 6 étapes

### 1. Reproduire de façon fiable
Si tu ne peux pas reproduire le bug à volonté, tu ne pourras pas vérifier ta correction. Trouve la **plus petite série d'actions** qui déclenche le bug. Note-la.

### 2. Lire le message d'erreur EN ENTIER
Le message et la **stack trace** disent souvent la ligne exacte et la cause. Lis-les vraiment, de haut en bas. La première ligne dit *quoi*, la stack dit *où* et *comment on y est arrivé*.

### 3. Isoler par bissection
Le bug est quelque part entre A et Z. Coupe en deux : vérifie au milieu (un `console.log`, un breakpoint). Le bug est-il déjà présent à mi-chemin ? Tu viens d'éliminer la moitié du code. Répète. (C'est la recherche binaire du jour 16 appliquée au debug — et ce que fait `git bisect`.)

### 4. Formuler UNE hypothèse
« Je pense que X est faux parce que Y. » Une seule à la fois, précise, **falsifiable**.

### 5. Prouver l'hypothèse par une observation
Ajoute un log ou un breakpoint qui **confirme ou infirme** l'hypothèse. Ne corrige pas encore : **observe** d'abord. La valeur est-elle vraiment celle que tu crois ?

### 6. Corriger la CAUSE, pas le symptôme
Une fois la cause prouvée, corrige-la. Puis **reproduis** (étape 1) pour vérifier que le bug a disparu, et que tu n'en as pas créé un autre.

## Les outils
- **`console.log` stratégique** : peu, mais aux bons endroits (frontières, avant/après une transformation). Log la **valeur ET son type** (`console.log('x=', x, typeof x)`).
- **Le debugger** (`node --inspect`, breakpoints VS Code) : pour inspecter l'état sans polluer le code. Indispensable dès que le bug est non trivial.
- **Rubber duck** : explique le bug à voix haute (à un canard, un mur, l'app). Formuler le problème révèle souvent la solution.

## Les bugs classiques (et où regarder)
- **Référence partagée** (jour 8) : « pourquoi ces deux choses changent ensemble ? » → une copie manquante.
- **Off-by-one** (jour 6) : bornes de boucle, `<` vs `<=`, index 0.
- **Type inattendu** (jour 4) : `"5" + 2`, `undefined`, `NaN` qui se propage.
- **Async** : quelque chose s'exécute avant que les données soient prêtes.
- **État périmé** (React) : le state qu'on lit n'est pas celui qu'on croit.
- **Le bug n'est pas où tu crois** : si l'hypothèse évidente est prouvée fausse, remonte en amont.

## Les principes de fond
- **Le bug a une cause logique.** L'ordinateur fait exactement ce que tu lui as dit. « C'est bizarre » = « je n'ai pas encore compris ».
- **Rendre le bug reproductible = 80 % du travail.**
- **Un test qui reproduit le bug** est le meilleur point de départ (et il empêche la régression).
- **Prends des notes** : symptôme → hypothèses → preuve → correction. Sur les bugs durs, c'est ce qui t'évite de tourner en rond.

## Quand demander de l'aide (à l'IA ou à un humain)
Seulement après avoir : reproduit, lu l'erreur en entier, isolé la zone, formulé une hypothèse. À ce stade, tu peux poser une **question précise** (« j'ai isolé le bug à cette fonction, la valeur X vaut Y alors que j'attends Z, une piste ? ») — et tu apprendras de la réponse au lieu de la subir.
