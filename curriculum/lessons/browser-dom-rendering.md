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
