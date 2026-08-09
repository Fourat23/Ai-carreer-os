<!-- keep -->
# Leçon — Mise en page : Flexbox et Grid

## 🌍 Le problème d'abord
Tu veux placer deux blocs côte à côte, centrer un bouton dans une carte, ou aligner une galerie en
grille régulière. Tu essaies `float`, des `margin` négatives, `position: absolute`… et dès que
l'écran change de taille, tout se chevauche ou déborde. C'est l'expérience frustrante de milliers de
débutants : ils bricolent la mise en page avec des outils qui n'ont jamais été conçus pour ça. Le
CSS moderne a DEUX systèmes faits exactement pour disposer des éléments : **Flexbox** (une
dimension) et **Grid** (deux dimensions). Cette leçon t'apprend lequel choisir et comment raisonner.

## 🎯 Objectif
Savoir disposer des éléments proprement avec **Flexbox** (aligner/répartir sur UNE ligne ou UNE
colonne) et **CSS Grid** (organiser en LIGNES et COLONNES), comprendre quand utiliser lequel, et
cesser de bricoler la mise en page avec des outils détournés (`float`, positionnements absolus).

## 🧩 Prérequis
Tu dois maîtriser le box model et la notion de conteneur/enfant, ainsi que les unités CSS
(`/doc/lessons/css-fundamentals`). Tu dois aussi savoir structurer une page sémantique
(`/doc/lessons/html-semantic-structure`), car on dispose des repères (`header`, `main`, cartes…).
Aucune expérience de mise en page n'est supposée.

## 🧠 Modèle mental
Flexbox et Grid transforment un ÉLÉMENT CONTENEUR en un chef d'orchestre qui range ses ENFANTS
directs. La bascule mentale décisive : tu ne positionnes plus chaque enfant un par un ; tu
DÉCLARES une intention sur le conteneur (« répartis-les sur une ligne avec un espace égal », « fais
une grille de 3 colonnes ») et le navigateur calcule les positions. Le choix est simple :
- **une seule direction** (une rangée OU une colonne, du contenu qui s'aligne et se répartit) →
  **Flexbox** ;
- **deux directions** (un vrai damier lignes × colonnes) → **Grid**.
On combine souvent les deux : Grid pour la structure globale de la page, Flexbox à l'intérieur des
zones.

## 💡 Pourquoi c'est important
La mise en page est le quotidien du frontend : toute interface est un assemblage de zones alignées et
réparties. Flexbox et Grid rendent ce travail fiable, lisible et responsive-friendly, là où les
anciennes techniques (`float`, `table`, positions absolues) produisaient un code fragile et
imprévisible. Un développeur qui raisonne « conteneur → intention » construit des interfaces qui ne
cassent pas au premier changement de taille — et se diagnostiquent facilement.

## Explication complète

### Flexbox : aligner et répartir sur un axe
On active Flexbox sur le conteneur avec `display: flex`. Deux axes : l'**axe principal** (défini par
`flex-direction: row` — défaut — ou `column`) et l'**axe secondaire** (perpendiculaire).
- `justify-content` : répartition sur l'axe PRINCIPAL (`flex-start`, `center`, `space-between`…).
- `align-items` : alignement sur l'axe SECONDAIRE (`center` pour centrer verticalement une rangée).
- `gap` : l'espace entre enfants (préfère `gap` aux marges bricolées).
- `flex-wrap: wrap` : autorise le passage à la ligne quand ça ne rentre plus.
- Sur un enfant, `flex: 1` lui dit « prends l'espace disponible » (utile pour des colonnes fluides).
Le fameux « centrer un élément » devient trivial :
```css
.carte { display: flex; justify-content: center; align-items: center; }
```

### Grid : organiser en lignes et colonnes
On active Grid avec `display: grid` et on décrit les colonnes :
```css
.galerie {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 colonnes de largeur égale */
  gap: 16px;
}
```
L'unité `fr` (fraction) répartit l'espace disponible. `repeat(3, 1fr)` = trois colonnes égales.
`minmax(200px, 1fr)` combiné à `repeat(auto-fill, …)` crée des grilles qui s'adaptent au nombre
d'éléments. Grid gère nativement les DEUX dimensions : parfait pour une galerie, un tableau de bord,
la structure d'une page.

### `min-width: 0` : le piège de débordement
Un enfant Flex ou Grid a, par défaut, une taille minimale égale à son contenu (`min-width: auto`) : un
bloc de code ou un texte très long peut alors FORCER le conteneur à déborder, malgré `overflow`. La
parade : donner `min-width: 0` (ou `min-height: 0`) à l'enfant concerné pour l'autoriser à rétrécir.
C'est LA cause n°1 des débordements horizontaux mystérieux.

### Choisir : Flexbox ou Grid ?
- Une barre de navigation, une rangée de boutons, une pile verticale → **Flexbox** (1D).
- Une galerie régulière, un tableau de bord, la charpente d'une page → **Grid** (2D).
- En cas de doute : si tu contrôles UN axe, Flexbox ; si tu penses en LIGNES ET COLONNES, Grid.

## Concepts clés
Conteneur vs enfants · Flexbox (`display:flex`, `flex-direction`, `justify-content`, `align-items`,
`gap`, `flex-wrap`, `flex:1`) · Grid (`display:grid`, `grid-template-columns`, `repeat`, `fr`,
`minmax`, `gap`) · `min-width: 0` (anti-débordement) · 1D (Flex) vs 2D (Grid).

## 🧭 Exemple guidé
Une barre de navigation (logo à gauche, liens à droite) puis une galerie de cartes.
```css
/* 1D : Flexbox — répartir sur une rangée, aligner verticalement */
.barre { display: flex; justify-content: space-between; align-items: center; gap: 12px; }

/* 2D : Grid — galerie responsive de cartes */
.galerie { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
.galerie > article { min-width: 0; } /* autorise les cartes à rétrécir, évite le débordement */
```
Raisonnement : la barre est un problème 1D (une rangée) → Flexbox, `space-between` pousse le logo et
les liens aux extrémités. La galerie est 2D (des cartes en grille qui se reflowent) → Grid, avec
`auto-fill`/`minmax` pour un nombre de colonnes qui s'adapte à la largeur. Le `min-width: 0` protège
du débordement si une carte contient un long contenu.

## ⚠️ Erreurs fréquentes
- Utiliser `float` ou `position: absolute` pour une mise en page → fragile ; préfère Flex/Grid.
- Choisir Grid pour un simple alignement 1D (sur-complexité) ou Flexbox pour un vrai damier 2D.
- Bricoler les espaces avec des marges au lieu de `gap`.
- Oublier `min-width: 0` sur un enfant flex/grid → débordement horizontal quand le contenu est long.
- Confondre `justify-content` (axe principal) et `align-items` (axe secondaire).

## 🔗 Liens avec le programme
Cette leçon suit `/doc/lessons/css-fundamentals` (box model requis) et précède directement
`/doc/lessons/responsive-design`, qui rend ces dispositions adaptatives selon la taille d'écran. Les
mêmes principes structurent les interfaces React que tu bâtiras (`/doc/lessons/react-fundamentals`) :
le JSX produit le HTML, le CSS le dispose.

## Mini-exercice
Construis deux mises en page : (1) une barre `header` avec un titre à gauche et un menu à droite via
Flexbox (`space-between`) ; (2) une galerie de 6 cartes via Grid (`repeat(auto-fill, minmax(200px,
1fr))`). Réduis la fenêtre et observe le comportement. Ajoute `min-width: 0` à une carte contenant un
mot très long et constate la différence. Pratique associée : `web-nav`, `web-card`.

## 📚 Vocabulaire
**conteneur / enfants** · **Flexbox** (`display:flex`) · **axe principal / secondaire** ·
**`justify-content` / `align-items`** · **`gap`** · **`flex-wrap` / `flex:1`** · **Grid**
(`display:grid`) · **`grid-template-columns` / `repeat` / `fr` / `minmax`** · **`min-width: 0`**.

## 🧾 À retenir
Ne bricole plus la mise en page : utilise les systèmes conçus pour ça. Flexbox aligne et répartit sur
UNE dimension (rangées, colonnes, centrage) ; Grid organise en DEUX dimensions (galeries, charpentes,
tableaux de bord). Tu déclares une intention sur le CONTENEUR, le navigateur place les enfants.
Pense `gap` plutôt que marges, et n'oublie pas `min-width: 0` sur les enfants pour éviter les
débordements. En cas de doute : un axe → Flex, deux axes → Grid.
