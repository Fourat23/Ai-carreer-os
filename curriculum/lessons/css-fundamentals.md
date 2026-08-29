<!-- keep -->
# Leçon — CSS : cascade, spécificité et box model

> **📚 Étagère de référence — cette leçon n'est programmée par aucune des 365 journées.**
> Tu ne l'as pas manquée : le parcours ne t'y enverra jamais, et aucune journée ne suppose
> que tu l'as lue. Elle est là pour être ouverte quand tu en as besoin — par curiosité, pour
> un projet, ou parce qu'une leçon du parcours y renvoie pour approfondir un point.


## 🌍 Le problème d'abord
Tu écris une règle CSS pour colorer un bouton en bleu… et rien ne change. Ou pire : un autre style
que tu n'as jamais écrit s'applique à sa place. Tu ajoutes `!important` par dépit, ça marche une
fois, puis tout se casse ailleurs. Ce chaos n'est pas de la malchance : c'est que le CSS obéit à
des RÈGLES précises pour décider quel style gagne, et que la taille d'un élément suit un modèle
géométrique précis (le box model). Tant que tu ne vois pas ces règles, le CSS ressemble à de la
magie capricieuse. Cette leçon te rend ces règles visibles.

## 🎯 Objectif
Comprendre comment le navigateur choisit la valeur d'une propriété quand plusieurs règles
s'appliquent (la **cascade** et la **spécificité**), comment un élément calcule sa taille réelle (le
**box model** : contenu, padding, border, margin), et savoir raisonner un style au lieu de le
deviner par essais-erreurs.

## 🧩 Prérequis
Tu dois savoir qu'une page est un arbre de balises que le CSS habille, et connaître les balises de
base (`/doc/lessons/html-semantic-structure`). Aucune connaissance préalable de CSS n'est supposée :
on part de zéro. Savoir ouvrir les outils de développement du navigateur (onglet « Éléments/Styles »)
aide à observer, mais n'est pas obligatoire.

## 🧠 Modèle mental
Le CSS répond à « à quoi ça RESSEMBLE ? », séparé du HTML qui dit « qu'est-ce que c'est ? ». Une
feuille de style est une liste de **règles** : un **sélecteur** (qui cibler) + des **déclarations**
(`propriété: valeur`). Quand plusieurs règles visent le même élément, le navigateur n'en choisit pas
une au hasard : il applique un arbitrage en trois temps — **importance**, puis **spécificité**, puis
**ordre d'apparition**. Et chaque élément est une **boîte** : ce que tu vois (sa largeur, sa hauteur)
est la somme de son contenu, de son padding, de sa bordure et de sa marge. Maîtriser le CSS, c'est
maîtriser ces deux mécanismes : QUI gagne, et QUELLE taille fait la boîte.

## 💡 Pourquoi c'est important
Sans le modèle de la cascade, on « débogue » le CSS en empilant des `!important` et des sélecteurs
de plus en plus tordus — une dette qui rend chaque écran fragile. Sans le box model, on ne comprend
pas pourquoi un élément « déborde » de 20 px ou pourquoi deux marges se chevauchent. Ces deux notions
sont le socle de TOUTE mise en page (layout, responsive) : les sauter, c'est condamner tout le reste
du frontend à l'aléatoire.

## Explication complète

### Une règle CSS
```css
.carte {            /* sélecteur : les éléments de classe "carte" */
  color: navy;      /* déclaration : propriété "color", valeur "navy" */
  padding: 12px;
}
```
On cible par **type** (`button`), **classe** (`.carte`), **identifiant** (`#menu`), ou combinaisons.
Les classes sont le choix par défaut : réutilisables et de spécificité modérée.

### L'héritage
Certaines propriétés (couleur du texte, police) se **transmettent** des parents aux enfants : définir
`color` sur `<body>` colore tout le texte descendant, sauf redéfinition locale. D'autres (marges,
bordures) ne s'héritent pas. L'héritage évite de répéter les mêmes règles partout.

### La cascade : qui gagne ?
Quand plusieurs règles fixent la même propriété sur un élément, le navigateur tranche dans cet ordre :
1. **Importance** : une déclaration `!important` bat une déclaration normale. (À éviter : c'est un
   marteau qui casse l'arbitrage — on n'y recourt qu'en dernier ressort.)
2. **Spécificité** : un sélecteur plus « précis » gagne. Barème simplifié — identifiant (`#id`, poids
   fort) > classe/attribut/pseudo-classe (`.x`, `[type]`, `:hover`) > type/élément (`div`, poids
   faible). Ainsi `#menu a` bat `.lien` qui bat `a`.
3. **Ordre d'apparition** : à importance et spécificité ÉGALES, la DERNIÈRE règle écrite l'emporte.
Comprendre ces trois niveaux, c'est savoir POURQUOI un style gagne — et corriger sans `!important`.

### Le box model
Chaque élément est une boîte à quatre couches, de l'intérieur vers l'extérieur :
- **contenu** (le texte/l'image) ;
- **padding** : l'espace INTÉRIEUR, entre le contenu et la bordure ;
- **border** : la bordure ;
- **margin** : l'espace EXTÉRIEUR, entre cette boîte et les voisines.
Par défaut, `width` ne mesure QUE le contenu : la largeur réelle = `width + padding + border`. D'où
les débordements surprises. La parade quasi universelle :
```css
*, *::before, *::after { box-sizing: border-box; }
```
Avec `border-box`, `width` inclut padding et bordure : la boîte fait la taille annoncée, sans
arithmétique mentale. C'est le réglage de base de tout projet sérieux.

### Le flux normal et `display`
Sans aucune mise en page, le navigateur empile les éléments dans le **flux normal** : les éléments de
type **bloc** (`<p>`, `<div>`, `<section>`) prennent toute la largeur et s'empilent verticalement ; les
éléments **en ligne** (`<span>`, `<a>`, `<strong>`) se suivent horizontalement dans le texte. La
propriété **`display`** change ce comportement : `block`, `inline`, `inline-block` (en ligne mais avec
largeur/hauteur/marges), `none` (retire l'élément du flux et de l'affichage), et surtout `flex`/`grid`
(qui activent les systèmes de mise en page, vus dans leurs leçons dédiées). Comprendre le flux normal,
c'est comprendre l'état PAR DÉFAUT que Flexbox et Grid viennent réorganiser.

### Le positionnement
`position` sort (partiellement) un élément du flux normal :
- `static` (défaut) : dans le flux, `top/left` ignorés.
- `relative` : reste dans le flux mais peut être décalé par rapport à sa position, et sert d'ancrage.
- `absolute` : retiré du flux, positionné par rapport à l'ancêtre positionné le plus proche.
- `fixed` : positionné par rapport à la fenêtre (reste visible au défilement).
- `sticky` : dans le flux, puis « se colle » à un bord au défilement (en-têtes collants).
Le positionnement sert des cas ciblés (badge, info-bulle, en-tête collant) — **pas** à faire une mise
en page générale : pour cela, Flexbox et Grid sont les bons outils.

### `overflow` : quand le contenu déborde
Quand un contenu dépasse la taille de sa boîte, `overflow` décide : `visible` (défaut, ça déborde),
`hidden` (coupé), `scroll`/`auto` (barre de défilement). Un réflexe clé du responsive : un bloc large
(code, tableau) reçoit `overflow-x: auto` pour défiler à l'intérieur au lieu d'élargir la page.

### Les unités
`px` (pixels, absolus), `%` (relatif au parent), `rem` (relatif à la taille de police racine — idéal
pour des tailles cohérentes et accessibles), `em` (relatif à l'élément courant). Préfère `rem` pour
les typographies et espacements : l'utilisateur qui agrandit la police voit toute l'interface suivre.

## Concepts clés
Règle (sélecteur + déclarations) · sélecteurs type/classe/id · héritage · **cascade** (importance →
spécificité → ordre) · **spécificité** (id > classe > type) · **box model** (contenu/padding/border/
margin) · `box-sizing: border-box` · unités `px`/`%`/`rem`/`em`.

## 🧭 Exemple guidé
« Pourquoi mon bouton n'est-il pas bleu ? »
```html
<button class="btn" id="envoyer">Envoyer</button>
```
```css
button       { background: grey; }   /* spécificité : type (faible) */
.btn         { background: green; }  /* spécificité : classe (moyenne) */
#envoyer     { background: navy; }   /* spécificité : id (forte) → GAGNE */
```
Raisonnement : les trois règles ciblent le même bouton. L'id `#envoyer` a la spécificité la plus
forte → le bouton est **navy**, quel que soit l'ordre. Si tu voulais imposer le vert sans changer le
HTML, tu n'ajouterais PAS `!important` : tu réduirais la spécificité de la règle id, ou tu ciblerais
`.btn` plus précisément. La cascade s'explique, elle ne se force pas.

## ⚠️ Erreurs fréquentes
- Dégainer `!important` au lieu de comprendre la spécificité → dette qui empire à chaque écran.
- Ignorer le box model : un élément « déborde » car `width` n'inclut pas padding/bordure (oubli de
  `border-box`).
- Empiler des sélecteurs très spécifiques (`#a .b div span`) impossibles à surcharger ensuite.
- Confondre `padding` (dedans) et `margin` (dehors) ; s'étonner que deux marges verticales fusionnent
  (collapsing margins).
- Tout mettre en `px` et casser l'accessibilité quand l'utilisateur agrandit la police.

## 🔗 Liens avec le programme
Cette leçon suit `/doc/lessons/html-semantic-structure` (on habille une structure saine) et fonde la
mise en page (`/doc/lessons/css-flexbox`, `/doc/lessons/css-grid`) et le responsive
(`/doc/lessons/responsive-design`), qui supposent le box model acquis. Les bugs d'overflow que tu
rencontreras (y compris dans cette plateforme) se diagnostiquent avec ces notions.

## Mini-exercice
Prends une carte simple (`<article class="carte">` avec un titre et un texte). Donne-lui
`box-sizing: border-box`, un `padding`, une `border` et une `width`, et vérifie dans les outils du
navigateur que la largeur réelle correspond bien à `width` (et non `width + padding + border`).
Ensuite, écris trois règles de spécificités différentes sur le même élément et prédis laquelle gagne
AVANT de tester. Pratique associée : `web-inline-style`, `web-card`.

## 📚 Vocabulaire
**règle / sélecteur / déclaration** · **héritage** · **cascade** · **spécificité** · **`!important`**
· **box model** · **padding / border / margin** · **`box-sizing: border-box`** · **`rem`/`em`/`px`/`%`**.

## 🧾 À retenir
Le CSS n'est pas capricieux : quand plusieurs règles s'affrontent, le navigateur tranche par
importance, puis spécificité (id > classe > type), puis ordre. Comprendre cet arbitrage évite le
piège `!important`. Chaque élément est une boîte (contenu + padding + border + margin) ; adopte
`box-sizing: border-box` pour que `width` soit la vraie largeur. Cascade et box model sont le socle
de toute mise en page : maîtrise-les avant Flexbox et Grid.
