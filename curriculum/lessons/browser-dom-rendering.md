<!-- keep -->
# Leçon — Le navigateur, le DOM et le rendu

## 🌍 Le problème d'abord
Tu ouvres une page web : un titre, un bouton, une liste. Tu cliques, et le contenu change.
Mais concrètement, QUI change le contenu, et COMMENT ? Beaucoup de débutants apprennent
React (ou un autre outil) sans jamais avoir compris ce qui se passe SOUS l'interface — du
coup, la moindre bizarrerie devient de la magie noire. Avant tout framework, il faut voir
le décor : une page est un ARBRE d'éléments que le navigateur affiche, et du code
JavaScript peut modifier cet arbre pour rendre la page vivante. Le hic : dès que la page
devient complexe, modifier cet arbre « à la main » devient vite ingérable — et c'est
précisément le problème que des outils comme React viennent résoudre. Cette leçon plante ce
décor.

## 🎯 Objectif
Comprendre les rôles de **HTML**, **CSS** et **JavaScript**, ce qu'est le **DOM** (l'arbre
de la page en mémoire), comment on le **modifie** et on **réagit aux événements**, et
pourquoi cette manipulation manuelle devient fragile quand l'interface grandit — la
motivation d'un rendu déclaratif.

## 🧩 Prérequis
Tu dois savoir écrire du JavaScript de base — variables, fonctions, tableaux, objets,
callbacks (`/doc/lessons/javascript-basics`) — car c'est le JavaScript qui manipule la
page. Aucune connaissance de HTML/CSS n'est supposée : leurs rôles sont introduits ici.
Aucun framework (React, etc.) n'est requis : cette leçon est justement ce qui vient AVANT.

## 🧠 Modèle mental
Trois langages, trois rôles : **HTML** décrit la STRUCTURE (le squelette : titres,
paragraphes, boutons), **CSS** décrit l'APPARENCE (couleurs, tailles, disposition),
**JavaScript** décrit le COMPORTEMENT (ce qui se passe quand on interagit). Quand le
navigateur lit ton HTML, il en construit une représentation vivante en mémoire : le **DOM**
(Document Object Model), un ARBRE d'objets où chaque balise devient un nœud. Ton JavaScript
ne réécrit pas le texte HTML : il modifie cet arbre, et le navigateur re-dessine ce qui a
changé. « Rendre la page interactive » = « écouter des événements et mettre à jour le DOM ».

## 💡 Pourquoi c'est important
Tout ce qui s'affiche dans un navigateur — un site, une application, l'interface de tes
futures apps IA — repose sur ce trio et sur le DOM. Comprendre le DOM, c'est cesser de
subir le frontend : tu sauras pourquoi un bouton ne réagit pas, pourquoi un style ne
s'applique pas, et surtout POURQUOI React existe. Un développeur qui saute cette étape
utilise React comme une formule magique et se retrouve démuni au premier comportement
inattendu.

## Explication complète

### HTML : la structure en balises
Une page HTML est faite de **balises** imbriquées : `<h1>Titre</h1>`, `<button>Clique</button>`,
`<ul><li>…</li></ul>`. L'imbrication crée une hiérarchie (un `<li>` DANS un `<ul>` DANS un
`<body>`). Choisir la bonne balise pour le bon sens — un vrai `<button>` pour une action, un
`<nav>` pour la navigation — s'appelle le **HTML sémantique** : le navigateur, les moteurs
de recherche et les lecteurs d'écran comprennent alors ta page (on y revient en
accessibilité).

### CSS : l'apparence, séparée de la structure
Le CSS applique des règles de style à des éléments (`button { background: navy; color: white }`).
L'idée clé : la STRUCTURE (HTML) et l'APPARENCE (CSS) sont séparées, pour changer l'une sans
casser l'autre. On cible les éléments par leur type, leur classe (`.carte`) ou leur rôle.

### Le DOM : l'arbre vivant de la page
Quand la page charge, le navigateur transforme ton HTML en **DOM** : un arbre d'objets
manipulable par JavaScript. `document.querySelector('.carte')` retrouve un nœud ;
`element.textContent = 'Bonjour'` change son texte ; `element.classList.add('actif')` change
son style ; `document.createElement('li')` crée un nœud à insérer. Modifier le DOM = modifier
ce que l'utilisateur voit, sans recharger la page.

### Les événements : réagir à l'utilisateur
L'interactivité repose sur les **événements** : clic, saisie, survol… On y attache un
*écouteur* (une fonction appelée quand l'événement se produit) :
```js
const bouton = document.querySelector('#ajouter');
bouton.addEventListener('click', () => {
  compteur = compteur + 1;
  document.querySelector('#total').textContent = `Total : ${compteur}`;
});
```
Le cycle est toujours : **événement → mise à jour d'un état → mise à jour du DOM**.

### Propagation et délégation
Un événement ne reste pas sur l'élément cliqué : il **remonte** l'arbre, du nœud le plus profond vers
ses parents (c'est le *bubbling*). Un clic sur un `<button>` dans un `<li>` déclenche donc aussi les
écouteurs du `<li>`, de l'`<ul>`, etc. On peut arrêter cette remontée avec `event.stopPropagation()`
(à utiliser avec parcimonie). Cette remontée rend possible la **délégation** : au lieu d'attacher un
écouteur à chaque `<li>` d'une liste (coûteux, et cassé pour les éléments ajoutés ensuite), on met UN
seul écouteur sur le parent `<ul>` et on lit `event.target` pour savoir quel enfant a été cliqué.
```js
document.querySelector('#liste').addEventListener('click', (e) => {
  const item = e.target.closest('li');   // quel <li> a été cliqué ?
  if (item) item.classList.toggle('fait');
});
```
La délégation est robuste (elle couvre les éléments futurs) et économe (un seul écouteur).

### Pourquoi la manipulation manuelle devient fragile
Sur une petite page, tout va bien. Mais quand l'interface grandit, tu dois te souvenir, à
CHAQUE changement d'état, de TOUS les endroits du DOM à mettre à jour manuellement — le
total, le badge, la liste, le bouton désactivé… Oublie-en un, et l'écran ment (il affiche
une valeur périmée). C'est **le** problème : synchroniser à la main l'affichage avec des
données qui changent est source de bugs sans fin. L'idée qui résout ça (React et
compagnie) : tu DÉCRIS à quoi la page doit ressembler pour un état donné, et l'outil se
charge de mettre le DOM à jour — tu ne touches plus le DOM toi-même.

## Concepts clés
HTML (balises, imbrication, sémantique) · CSS (règles, sélecteurs, séparation structure/
apparence) · DOM (arbre de nœuds, `querySelector`, `textContent`, `classList`,
`createElement`) · événements (`addEventListener`, écouteur) · cycle événement → état → DOM
· manipulation impérative vs rendu déclaratif.

## 🧭 Exemple guidé
Un compteur « à la main », sans framework :
```html
<p id="total">Total : 0</p>
<button id="plus">+1</button>
<script>
  let compteur = 0;                                   // l'état
  const total = document.querySelector('#total');
  document.querySelector('#plus').addEventListener('click', () => {
    compteur += 1;                                    // 1. mettre à jour l'état
    total.textContent = `Total : ${compteur}`;        // 2. mettre à jour le DOM
  });
</script>
```
Remarque la double étape manuelle (état PUIS DOM). Imagine dix affichages dépendant de
`compteur` : tu devrais penser à les dix à chaque clic. C'est exactement ce que le rendu
déclaratif automatise.

**Maintenant, passe à une liste — et le raccourci évident se retourne contre toi.** Une
liste de tâches, chacune avec un champ modifiable. À chaque changement, on redessine :

```js
liste.innerHTML = taches
  .map((t) => `<li><input value="${t.titre}"><button>ok</button></li>`)
  .join('');
```

Une ligne, ça marche du premier coup, et c'est ce que tout le monde écrit. Voici ce qui se
passe réellement quand l'utilisateur est en train de taper dans un champ et que la liste se
rafraîchit — mesuré dans un navigateur :

```
avant le rafraîchissement : le champ contient le texte que l'utilisateur vient de taper,
                            le curseur y clignote
après le rafraîchissement : le champ a repris son ancienne valeur, le focus a disparu
```

Sa saisie est perdue. Le même test avec des nœuds réutilisés plutôt que recréés la conserve.

**Décision 1 — comprendre avant de contourner.** Le réflexe est de sauvegarder la valeur
avant, de la restaurer après. Mauvaise piste : il faudrait aussi restaurer le focus, la
position du curseur, la sélection, le défilement, l'état ouvert/fermé de chaque menu… La
liste des choses à restaurer n'a pas de fin, parce que le problème n'est pas la valeur du
champ. Écrire dans `innerHTML` **détruit les anciens nœuds et en crée de nouveaux** : ce ne
sont plus les mêmes objets, seulement des objets qui se ressemblent. Tout ce que le
navigateur attachait aux anciens — focus, curseur, valeur saisie, écouteurs d'événements —
est parti avec eux. Retiens la formulation, elle resservira : ce n'est pas la valeur qui est
perdue, c'est **l'identité** des éléments.

C'est aussi pourquoi les boutons cessent de réagir si tu avais posé tes `addEventListener`
avant le rafraîchissement — les boutons visibles à l'écran ne sont plus ceux que tu avais
écoutés.

**Décision 2 — une faille s'est ouverte au passage.** Une tâche dont le titre est
`"><img src=x onerror="…">` n'est pas affichée comme du texte : ce titre a été **concaténé
dans du HTML**, donc le navigateur l'interprète comme du balisage. Le code de l'attaquant
s'exécute, dans ta page, avec l'accès de ton utilisateur. Un test rapide montre pourquoi ce
piège attrape même les gens prudents :

| ce qu'on injecte via `innerHTML` | s'exécute ? |
|---|---|
| `<script>…</script>` | **non** |
| `<img src=x onerror="…">` | **oui** |
| `<iframe srcdoc="…">` | **oui** |

Beaucoup de développeurs testent avec une balise `<script>`, constatent qu'elle ne part pas,
et concluent qu'`innerHTML` est sûr. Il ne l'est pas : la spécification interdit seulement
l'exécution des `<script>` insérés ainsi, pas celle des gestionnaires d'événements portés
par d'autres balises. **Un test négatif sur un seul cas ne démontre rien.**

**Décision 3 — quel correctif ?** Trois candidats. *Échapper à la main* les caractères
dangereux : à éviter, c'est un exercice où l'on perd toujours contre plus inventif que soi.
*Une bibliothèque d'assainissement* : légitime quand on doit vraiment accepter du HTML riche
(un éditeur de texte), coûteux et inutile ici. *Ne jamais faire passer une donnée par du
HTML* : `element.textContent = t.titre` place la chaîne comme du **texte**, quelle que soit
sa forme — vérifié, le titre malveillant s'affiche alors littéralement, tel quel, sans rien
exécuter. C'est le bon choix par défaut, et il est plus simple que les deux autres.

La règle générale est celle-ci : `innerHTML` sert à poser du balisage que **tu** as écrit ;
dès qu'une donnée venue d'ailleurs entre dans la page, elle passe par `textContent` ou par
un attribut, jamais par une concaténation de chaînes.

**Le lien avec la suite du programme.** Réunis les deux problèmes : il faut mettre à jour
l'affichage sans détruire les nœuds existants, donc savoir lesquels réutiliser, donc pouvoir
dire « cet élément affiché correspond à cette donnée ». Tu viens de reconstituer, à la main,
le problème que résolvent les bibliothèques de rendu déclaratif — et tu comprendras
pourquoi React réclame une `key` sur chaque élément de liste : c'est précisément la réponse
à la question d'identité que `innerHTML` évacue en détruisant tout.

**Variante qui déplace le problème.** Ta liste ne fait plus deux lignes mais deux mille, et
tu insères les nouvelles une par une avec `appendChild` dans une boucle. Tout est correct,
rien n'est détruit — et la page se fige une seconde. Chaque insertion peut obliger le
navigateur à recalculer la mise en page ; multipliée par deux mille, l'opération devient
visible. C'est la même leçon qu'en algorithmique : un geste anodin répété est un coût, et la
parade (préparer les nœuds hors du document, puis les insérer en une fois) consiste à
réduire le nombre de fois où l'on dérange le navigateur, pas à écrire du code plus malin.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Pour rafraîchir une liste, tu écris `liste.innerHTML = items.map(...).join('')`. Cite
   deux choses que l'utilisateur perd, et une faille que tu ouvres.
2. Dans le compteur de l'exemple, tu ajoutes un second affichage du total ailleurs dans
   la page. Que se passe-t-il, et pourquoi est-ce inévitable ?
3. `document.querySelector('.carte')` renvoie `null` alors que l'élément existe dans ton
   HTML. Donne deux causes possibles.
4. Qu'est-ce que le rendu déclaratif automatise, exactement ?

## ✅ Correction attendue

**La démarche.** Manipuler le DOM à la main, c'est tenir soi-même la correspondance entre
un **état** et un **affichage**. Toute la difficulté — et tout l'intérêt des frameworks —
tient dans le mot « soi-même ».

**L'erreur probable : reconstruire par `innerHTML`.** C'est une ligne, ça marche
visuellement, et c'est le raccourci que tout le monde emprunte. Ce qu'il détruit :

- **le focus** — si l'utilisateur était dans un champ de cette zone, le nœud est détruit
  et recréé : le curseur disparaît, et au clavier on est renvoyé au début de la page ;
- **l'état non déclaré du DOM** — texte saisi, position de défilement, case cochée,
  élément sélectionné, vidéo en cours de lecture : tout cela vit dans les nœuds, et les
  nœuds n'existent plus ;
- **les écouteurs d'événements** attachés aux anciens éléments, qui partent avec eux —
  d'où le classique « ça marche au premier affichage, plus après ».

Et la faille : si l'une des valeurs vient d'un utilisateur, `innerHTML` **interprète le
HTML qu'elle contient**. Un `<img src=x onerror=...>` dans un nom d'utilisateur s'exécute.
C'est une injection de script (XSS), et elle est ouverte par la commodité même de la
méthode. `textContent` n'a pas ce problème : il pose du texte, jamais du balisage.

Le piège séduit parce que **le résultat est visuellement parfait**. La liste est à jour,
rien ne clignote, aucune erreur en console. Tous les dégâts portent sur des choses
invisibles à l'inspection : le focus qu'on ne regardait pas, la saisie qu'on n'avait pas
commencée, l'écouteur dont on n'a pas encore reproduit l'usage. Ils se manifestent chez
l'utilisateur, jamais chez celui qui a écrit la ligne.

**Sur les autres questions.** Ajouter un second affichage du compteur oblige à **penser à
le mettre à jour aussi**, dans le même gestionnaire de clic. Rien ne le rappellera, et
c'est inévitable parce que la correspondance état → affichage n'est écrite **nulle part** :
elle n'existe que dans la tête de celui qui a écrit le `addEventListener`. Avec dix
affichages, il faut se souvenir des dix, à chaque endroit qui modifie le compteur. C'est
précisément la charge que le rendu déclaratif supprime.

Un `querySelector` qui renvoie `null` sur un élément existant a deux causes principales :
le script s'exécute **avant** que l'élément ne soit dans le DOM — balise `<script>` placée
dans le `<head>` ou avant l'élément, sans `defer` ; ou l'élément est **créé plus tard**,
dynamiquement, et la recherche a eu lieu avant sa création. Dans les deux cas le sélecteur
est correct : c'est le moment qui ne l'est pas.

Enfin, ce que le rendu déclaratif automatise se dit en une phrase : **il calcule le DOM à
partir de l'état, au lieu de te demander de le modifier**. Tu décris « voici à quoi la page
doit ressembler pour cet état » ; il compare avec l'existant et n'applique que les
différences — en préservant les nœuds inchangés, donc le focus, la saisie et le
défilement. C'est le même raisonnement que le `plan/apply` d'un outil d'infrastructure :
on déclare la cible, la machine calcule le chemin.

**Alternative défendable.** Pour une page simple — une poignée d'interactions, aucun état
partagé — le DOM à la main est parfaitement raisonnable, plus léger, et sans dépendance.
Le seuil n'est pas la taille de la page mais le **nombre d'affichages qui dépendent du même
état**. À un ou deux, la main suffit. À dix, elle ne suffit plus, et c'est un fait
d'expérience avant d'être un argument de framework.

**Vérifie seul, sans corrigé** :
1. Mets un `<input>` dans ta liste, tape dedans, déclenche un rafraîchissement par
   `innerHTML`. Regarde où va ta saisie.
2. Cherche `innerHTML` dans ton code. Chacune de ces occurrences reçoit-elle des données
   d'un utilisateur ?
3. Ajoute un second affichage d'une valeur déjà affichée. Combien d'endroits dois-tu
   modifier ? Ce nombre est ta dette.

## ⚠️ Erreurs fréquentes
- Utiliser `<div onclick>` au lieu d'un vrai `<button>` : cassé au clavier, illisible pour
  les lecteurs d'écran (préfère la balise sémantique).
- Oublier de mettre à jour UN endroit du DOM après un changement d'état → affichage périmé.
- Sélecteur qui ne correspond à rien (`querySelector` renvoie `null`) → erreur au premier
  usage : vérifie le sélecteur.
- Mélanger structure et style dans le HTML (`style="…"` partout) au lieu de classes CSS.

## 🔗 Liens avec le programme
Cette leçon est la marche d'avant React (`/doc/lessons/react-fundamentals`) : « UI = f(état) »
n'est que l'automatisation du cycle événement → état → DOM que tu viens de voir à la main.
L'accessibilité (`/doc/lessons/react-accessibility`) part du HTML sémantique introduit ici.
Et toute interface de tes apps LLM (mois 8+) s'affiche via ce même DOM.

## Mini-exercice
Sans framework : une liste de courses. Un champ + un bouton « Ajouter » qui insère un `<li>`
dans un `<ul>` (crée le nœud avec `createElement`), et un compteur « N articles » qui se met
à jour à chaque ajout. Puis compte combien d'endroits du DOM tu dois penser à mettre à jour
— c'est la motivation de la prochaine leçon.

## 📚 Vocabulaire
**HTML / balise** · **CSS / sélecteur** · **DOM** · **nœud** · **`querySelector`** ·
**`textContent`** · **événement / écouteur** · **HTML sémantique** · **impératif vs
déclaratif**.

## 🧾 À retenir
HTML structure, CSS habille, JavaScript anime — et le navigateur matérialise le tout dans le
DOM, un arbre d'objets que ton code modifie. L'interactivité suit toujours le cycle
événement → état → DOM. Mettre à jour le DOM À LA MAIN marche pour une petite page mais
devient ingérable quand l'interface grandit : c'est précisément le problème que le rendu
déclaratif (React) vient résoudre.
