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

## 🧭 Exemple guidé — la barre de défilement horizontale, et l'enquête qui la trouve

Un site s'affiche correctement sur un ordinateur. Sur téléphone, une barre de défilement
horizontale apparaît : on peut pousser la page vers la gauche et découvrir une bande vide.
Rien de cassé, mais l'impression d'amateurisme est immédiate.

C'est le bug CSS le plus fréquent et le plus mal débogué. Il se résout en quatre minutes
avec la bonne méthode, et en deux heures d'essais aléatoires sans elle. Faisons-le
proprement.

### Ce qu'on sait déjà, avant de toucher au code

Une barre de défilement horizontale signifie une seule chose : **quelque chose est plus
large que la fenêtre**. Pas « le CSS est bizarre » — un élément, précisément mesurable, sort
du cadre. L'enquête consiste à trouver lequel, puis à comprendre pourquoi.

Deux erreurs de méthode courantes, à écarter tout de suite :

- Ajouter `overflow-x: hidden` sur `<body>`. Ça fait disparaître la barre, donc le symptôme.
  Le contenu qui dépasse est toujours là, mais devenu invisible et inatteignable. On a caché
  le corps, pas résolu le meurtre.
- Réduire les largeurs au hasard jusqu'à ce que ça rentre. Ça fonctionne parfois, et on ne
  sait jamais lequel des huit changements a agi.

### Étape 1 — trouver le coupable

Le navigateur peut répondre à la question directement. Dans la console des outils de
développement :

```js
document.querySelectorAll('*').forEach(el => {
  if (el.getBoundingClientRect().right > document.documentElement.clientWidth) {
    console.log(el.tagName, el.className, Math.round(el.getBoundingClientRect().right));
  }
});
```

On liste tous les éléments dont le bord droit dépasse la largeur visible. Sur notre page,
avec une fenêtre de 375 px, la console affiche exactement une ligne :

```
DIV carte 407
```

*(Mesure réelle. Chromium, fenêtre 375 px, `<div class="carte">` avec `width: 100%` et
`padding: 16px` dans une section pleine largeur : `getBoundingClientRect().right` vaut 407 et
`document.documentElement.scrollWidth` vaut 407 contre 375 pour `clientWidth`.)*

Un seul élément, et c'est déjà un enseignement. On s'attendrait à voir aussi la `<section>`
qui contient la carte — elle n'apparaît pas. Sa propre boîte fait bien 375 px : un enfant qui
déborde **ne redimensionne pas son parent**, il sort de lui. La sonde désigne donc directement
le coupable, sans la chaîne de ses ancêtres, ce qui est précisément ce qu'on veut.

Dépassement : **407 − 375 = 32 pixels**.

Retiens ce chiffre. Un nombre rond comme 32 n'est presque jamais un hasard en CSS ; c'est
une somme d'espacements qu'on a écrits soi-même.

### Étape 2 — d'où viennent les 32 pixels

Le CSS de la carte :

```css
.carte {
  width: 100%;
  padding: 16px;
  border: 0;
}
```

`width: 100%` semble être exactement la précaution qu'il fallait prendre : « la carte fait la
largeur de son parent ». Et pourtant elle dépasse de 32 px, soit exactement `16 + 16` —
le padding gauche et le padding droit.

Voilà le box model dans sa version qui fait mal. Par défaut, `width` ne mesure **que le
contenu**. La largeur réellement occupée est :

```
largeur occupée = width + padding-gauche + padding-droit + border-gauche + border-droite
                = 375 + 16 + 16 + 0 + 0
                = 407
```

`width: 100%` ne veut donc pas dire « occupe toute la largeur du parent ». Ça veut dire
« que mon **contenu** fasse toute la largeur du parent » — après quoi on ajoute le padding
par-dessus, et on déborde de la somme des paddings. La formulation par défaut du CSS est
contre-intuitive, et c'est pour cela que ce bug est universel.

### Étape 3 — la correction

Trois corrections sont possibles. Elles ne se valent pas.

**a. Retirer le padding.** La carte rentre, et le texte colle aux bords. On a supprimé le
symptôme en supprimant la fonctionnalité.

**b. Calculer soi-même :** `width: calc(100% - 32px)`. C'est exact, et c'est une dette : le
jour où quelqu'un passe le padding à 24 px, il faut penser à modifier le `calc`. Deux
endroits à garder synchronisés à la main, c'est un bug programmé.

**c. Changer la définition de `width` :**

```css
*, *::before, *::after { box-sizing: border-box; }
```

Avec `border-box`, `width` inclut désormais le padding et la bordure. `width: 100%` signifie
enfin ce que tout le monde croyait qu'il signifiait : la boîte entière fait 375 px, et le
contenu s'ajuste à `375 − 32 = 343 px`. La carte rentre, le padding reste, et il n'y a rien
à maintenir.

*(Même page, même mesure, après ajout de ces trois lignes : la sonde ne renvoie plus aucun
élément, `scrollWidth` retombe à 375, et la largeur de la carte passe de 407 à 375.)*

C'est pourquoi ces trois lignes se trouvent en tête de pratiquement tous les projets
professionnels. Ce n'est pas une astuce : c'est le choix d'un modèle de mesure plus proche de
la façon dont un humain pense une boîte.

### Étape 4 — pourquoi l'ordinateur ne montrait rien

Une question reste, et elle est instructive : pourquoi le bug n'apparaissait-il que sur
téléphone ?

Sur un écran large, la carte est dans une colonne centrale qui laisse des marges vides de
part et d'autre. Les 32 px de dépassement mordent sur cet espace disponible et ne créent
aucun défilement. À 375 px de large, il n'y a plus de marge à mordre.

Enseignement général : **un défaut de mise en page ne se manifeste qu'aux largeurs où il n'y
a plus de mou.** C'est la raison pour laquelle on vérifie une page sur une fenêtre étroite,
et non parce que « le mobile est important » — c'est parce que la fenêtre étroite est le
révélateur.

### Le lien avec la cascade

Un dernier détail sur ce cas, que tu rencontreras. Supposons que la règle de réinitialisation
soit bien présente dans le projet, mais que la carte déborde quand même. Le panneau des
styles du navigateur montrerait :

```
.carte      box-sizing: border-box;   ← barré
.grille .carte  box-sizing: content-box;
```

La déclaration barrée est celle qui a perdu l'arbitrage. Ici, `.grille .carte` est composé de
deux classes, contre une seule pour `.carte` : il est plus spécifique, il gagne, quel que
soit l'ordre d'écriture dans le fichier.

C'est tout l'intérêt du panneau des styles : il ne montre pas seulement ce qui s'applique, il
montre **ce qui a été écarté et par quoi**. Le réflexe utile n'est pas d'ajouter une règle
plus forte, c'est de lire la règle barrée et de trouver qui l'a battue. Dans ce cas précis, la
bonne correction est de supprimer le `content-box` de `.grille .carte`, pas d'ajouter un
`!important` à `.carte` — lequel gagnerait aujourd'hui et perdrait demain contre le prochain
`!important`.

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

## 🛠️ Pratique — prédire avant de tester

C'est la pratique la plus utile de cette leçon, et la seule qui dise honnêtement si tu as
compris : **tu écris tes prédictions, puis tu mesures.** Le désaccord entre les deux est
l'information. Tricher en regardant d'abord ne trompe personne d'autre que toi.

**Le fichier.** Crée `cascade.html` avec exactement ceci :

```html
<!doctype html>
<html><head><meta charset="utf-8"><style>
*, *::before, *::after { box-sizing: border-box; }
html { font-size: 16px; }
body { margin: 0; }

main            { width: 300px; color: #333333; }
.panneau        { color: #00aa00; padding: 1rem; }
.sombre .carte  { background: #222222; color: #eeeeee; }
.carte          { background: #ffffff; color: #111111;
                  width: 100%; padding: 24px; border: 2px solid #000000; }
#app .carte     { padding: 8px; }
.carte[data-etat="actif"] { border-width: 6px; }
article.carte   { width: 320px; }
h2              { font-size: 2em; }
.titre          { font-size: 1.5rem; }
</style></head><body>
  <main id="app">
    <section class="panneau sombre">
      <article class="carte" data-etat="actif">
        <h2 class="titre">Rapport</h2>
        <p class="texte">Contenu</p>
      </article>
    </section>
  </main>
</body></html>
```

**Étape 1 — prédis, par écrit, sans ouvrir le fichier.** Un tableau à trois colonnes :
`ce qui est demandé` · `ma prédiction` · `la règle qui gagne, et pourquoi elle gagne`.

Neuf lignes :

1. la couleur de fond de `.carte` ;
2. la couleur du texte de `.carte` ;
3. le `padding` de `.carte` ;
4. l'épaisseur de bordure de `.carte` ;
5. la largeur **occupée** par `.carte`, en pixels ;
6. la largeur de la **zone de contenu** de `.carte`, en pixels ;
7. la couleur du `<p class="texte">` ;
8. la taille de police du `<h2 class="titre">`, en pixels ;
9. `.carte` dépasse-t-elle le bord droit de `<main>` ? Si oui, de combien ?

Pour la colonne « pourquoi », une justification par **spécificité** ou par **héritage** est
attendue. « Parce que c'est écrit plus bas » n'est recevable que si tu as d'abord vérifié
que les spécificités sont égales.

**Étape 2 — mesure.** Ouvre le fichier, puis dans la console des outils de développement :

```js
const c = document.querySelector('.carte'), s = getComputedStyle(c);
console.table({
  fond: s.backgroundColor, texte: s.color, padding: s.padding,
  bordure: s.borderTopWidth,
  occupee: c.getBoundingClientRect().width,
  contenu: c.getBoundingClientRect().width
           - parseFloat(s.paddingLeft) * 2 - parseFloat(s.borderLeftWidth) * 2,
  p: getComputedStyle(document.querySelector('.texte')).color,
  h2: getComputedStyle(document.querySelector('.titre')).fontSize,
  depassement: c.getBoundingClientRect().right
             - document.querySelector('main').getBoundingClientRect().right,
});
```

**Étape 3 — ta production finale.** Complète le tableau avec une quatrième colonne, `mesure`,
puis écris trois choses :

- **A.** Combien de lignes sur neuf tu as prédites juste. Écris le chiffre réel.
- **B.** Pour chaque erreur : la règle que tu croyais gagnante, celle qui gagne vraiment, et
  en une phrase la croyance fausse que ton erreur révèle. C'est la partie qui a de la valeur.
- **C.** Une modification d'**une seule ligne** du CSS qui ferait passer la carte au fond
  blanc, **sans** `!important` et **sans** toucher au HTML. Explique pourquoi elle marche.

**Critère de réussite.** Non, ce n'est pas « neuf sur neuf ». C'est : (a) tes neuf prédictions
sont écrites avant la mesure ; (b) chaque justification nomme une règle précise du fichier,
pas un principe général ; (c) pour la ligne 6, ton calcul est posé, pas deviné ; (d) la
proposition C tient en une ligne et n'emploie pas `!important`.

**Durée.** 35 à 45 minutes.

## ✅ Correction

> Les valeurs ci-dessous ne sont pas déduites : elles sont **mesurées**. Le script
> `scripts/v70-verifications/css-cascade-boxmodel.mjs` rend cette page dans Chromium et
> imprime chaque nombre publié ici.

### La démarche

Pour chaque propriété, la méthode tient en trois temps, toujours dans cet ordre :

1. **Lister les règles qui la fixent sur cet élément.** Beaucoup d'erreurs viennent d'une
   règle qu'on n'a pas vue, pas d'un arbitrage mal compris.
2. **Calculer la spécificité de chacune**, avec le barème à trois nombres
   `(identifiants, classes/attributs/pseudo-classes, éléments)`. On compare de gauche à
   droite : le premier nombre qui diffère tranche, et il tranche définitivement — cent classes
   ne battent pas un identifiant.
3. **Départager par l'ordre du fichier uniquement en cas d'égalité stricte.**

Et une quatrième question, à part : *cette propriété est-elle héritée ?* Une valeur héritée
est battue par **n'importe quelle** déclaration portant directement sur l'élément, aussi
faible soit-elle. L'héritage n'est pas au bas du classement de spécificité : il est hors
concours.

### Les spécificités du fichier

| Sélecteur | Calcul | Score |
|-----------|--------|-------|
| `#app .carte` | 1 identifiant, 1 classe | **(1,1,0)** |
| `.sombre .carte` | 2 classes | (0,2,0) |
| `.carte[data-etat="actif"]` | 1 classe + 1 attribut | (0,2,0) |
| `article.carte` | 1 classe + 1 élément | (0,1,1) |
| `.carte`, `.panneau`, `.titre` | 1 classe | (0,1,0) |
| `main`, `h2` | 1 élément | (0,0,1) |

### Le tableau des réponses

| # | Demandé | Mesure | Règle gagnante | Pourquoi |
|---|---------|--------|----------------|----------|
| 1 | fond de `.carte` | `rgb(34,34,34)` | `.sombre .carte` | (0,2,0) bat (0,1,0) |
| 2 | texte de `.carte` | `rgb(238,238,238)` | `.sombre .carte` | (0,2,0) bat (0,1,0) ; les couleurs héritées sont hors concours |
| 3 | `padding` | `8px` | `#app .carte` | (1,1,0) : l'identifiant tranche au premier nombre |
| 4 | bordure | `6px` | `.carte[data-etat="actif"]` | (0,2,0) bat le raccourci `border` de `.carte` (0,1,0) |
| 5 | largeur occupée | `320px` | `article.carte` | (0,1,1) bat (0,1,0) |
| 6 | largeur de contenu | `292px` | — | `320 − (8 × 2) − (6 × 2)` |
| 7 | couleur du `<p>` | `rgb(238,238,238)` | aucune | héritée de `.carte` |
| 8 | police du `<h2>` | `24px` | `.titre` | (0,1,0) bat `h2` (0,0,1) |
| 9 | dépassement | **36 px** | — | voir plus bas |

### Les quatre lignes où l'on se trompe

**Ligne 2 — le vert n'a jamais eu sa chance.** `.panneau` fixe `color: #00aa00` sur le
parent, et beaucoup prédisent du vert en raisonnant « le parent transmet sa couleur ». C'est
vrai en l'absence de règle locale. Ici, deux règles portent directement sur `.carte` ; elles
s'affrontent entre elles, et la valeur héritée n'entre même pas dans l'arbitrage. La couleur
verte du panneau ne s'applique en fait à aucun texte visible de cette page.

**Ligne 3 — l'identifiant écrase tout.** `#app .carte` a une seule classe de plus que
`.carte`, mais il porte un identifiant : le premier nombre du score est 1 contre 0, et la
comparaison s'arrête là. C'est la raison pour laquelle styler par identifiant est déconseillé
— non pas parce que ça ne marche pas, mais parce que ça marche trop bien : plus rien ne peut
le surcharger sans employer un identifiant à son tour, ou `!important`. La spécificité est
une dette : elle se paie au moment où quelqu'un veut modifier ton style.

**Ligne 4 — le piège du raccourci.** `border: 2px solid #000000` est un **raccourci** qui fixe
trois propriétés distinctes, dont `border-width`. Il n'est pas « plus fort » parce qu'il est
plus long à écrire : sa spécificité est celle de son sélecteur, `.carte`, soit (0,1,0). La
règle `.carte[data-etat="actif"]` marque (0,2,0) grâce au sélecteur d'attribut, et gagne sur
`border-width` seul — la couleur et le style de bordure, eux, restent ceux du raccourci. Une
seule des trois sous-propriétés a changé de propriétaire.

**Ligne 5 — `width: 100%` ne gagne pas.** C'est l'erreur la plus fréquente du lot, parce que
`100%` a l'air d'être « la valeur souple » et `320px` « la valeur rigide ». La cascade
n'évalue jamais les valeurs, seulement les sélecteurs : `article.carte` marque (0,1,1) contre
(0,1,0), le `320px` l'emporte, et c'est ce qui déclenche le dépassement de la ligne 9.

### La ligne 6, posée

Le fichier commence par `box-sizing: border-box`. Donc `width: 320px` décrit la boîte
**entière**, bordure comprise. La zone de contenu se déduit en retirant les deux paddings et
les deux bordures :

```
320 − (8 + 8) − (6 + 6) = 292 px
```

Sans `border-box`, le même CSS donnerait une boîte occupant `320 + 16 + 12 = 348 px` pour une
zone de contenu de 320 px. Même déclaration, deux résultats, selon une ligne écrite en tête
de fichier. C'est ce qui rend le débogage CSS déroutant quand on n'a pas vérifié quel modèle
est actif.

### La ligne 9, et ce qu'elle apprend

`<main>` fait 300 px. `.panneau` a `padding: 1rem`, soit 16 px, ce qui laisse **268 px** de
zone de contenu. Et `.carte` mesure 320 px, fixes.

La carte commence à 16 px du bord gauche et s'étend sur 320 px : son bord droit est à 336,
celui de `<main>` à 300. **Dépassement : 36 px.**

Le détail qui fait la différence : `box-sizing: border-box` n'a rien empêché ici. On le
présente souvent comme le remède au débordement — il ne l'est que pour les largeurs
**relatives**. Une largeur fixe supérieure à l'espace disponible déborde toujours, quel que
soit le modèle de boîte. Le vrai remède pour une carte est `max-width: 320px` avec
`width: 100%` : demander « au plus 320 px, et moins si la place manque ».

Dernière observation, et elle explique bien des heures perdues : cette page ne montre
**aucune barre de défilement horizontale**. Sur une fenêtre de 1024 px, les 36 px de
dépassement se perdent dans l'espace vide à droite de `<main>`. Le défaut existe, il est
mesurable, et il est invisible — jusqu'au jour où quelqu'un ouvre la page sur un téléphone.

### La proposition C

Une ligne, sans `!important`, sans toucher au HTML. Plusieurs réponses sont correctes :

```css
#app .carte { background: #ffffff; }     /* (1,1,0) — bat le (0,2,0) de .sombre .carte */
```

ou, plus sobre :

```css
.panneau.sombre .carte { background: #ffffff; }   /* (0,3,0) */
```

Les deux gagnent l'arbitrage. La seconde est préférable : elle reste dans le registre des
classes et laisse la porte ouverte à une surcharge future. La première introduit un
identifiant de plus dans la feuille de style et rend la prochaine modification plus coûteuse.

La **mauvaise** réponse plausible, et elle est instructive : déplacer la règle `.carte` en fin
de fichier, après `.sombre .carte`. Cela paraît raisonnable — « la dernière gagne ». Mais
l'ordre ne départage qu'à spécificité **égale**, et (0,1,0) reste inférieur à (0,2,0).
Déplacer la règle ne change rien du tout, et l'on conclut souvent, à tort, que « le CSS ne
marche pas ». Il marche : c'est le modèle mental qui manquait.

### Généralisation

Ce que cette pratique installe n'est pas une liste de scores, c'est un réflexe : devant un
style qui ne s'applique pas, **ne rien ajouter avant d'avoir lu ce qui a gagné**. Le panneau
des styles du navigateur barre les déclarations perdantes et affiche le sélecteur vainqueur —
la réponse est déjà à l'écran. Ajouter une règle plus spécifique sans lire cette information,
c'est répondre à une question qu'on n'a pas posée, et c'est exactement le mécanisme par lequel
une feuille de style devient impossible à modifier au bout de deux ans.

## Mini-exercice
Sur la page de ton choix, ouvre les outils de développement, sélectionne un élément et trouve dans le
panneau des styles **une déclaration barrée**. Note : quelle propriété, quel sélecteur perdant, quel
sélecteur gagnant, et par quel critère (importance, spécificité, ou ordre).

## 📚 Vocabulaire
**règle / sélecteur / déclaration** · **héritage** · **cascade** · **spécificité** · **`!important`**
· **box model** · **padding / border / margin** · **`box-sizing: border-box`** · **`rem`/`em`/`px`/`%`**.

## 🧾 À retenir
Le CSS n'est pas capricieux : quand plusieurs règles s'affrontent, le navigateur tranche par
importance, puis spécificité (id > classe > type), puis ordre. Comprendre cet arbitrage évite le
piège `!important`. Chaque élément est une boîte (contenu + padding + border + margin) ; adopte
`box-sizing: border-box` pour que `width` soit la vraie largeur. Cascade et box model sont le socle
de toute mise en page : maîtrise-les avant Flexbox et Grid.
