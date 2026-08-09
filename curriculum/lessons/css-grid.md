<!-- keep -->
# Leçon — CSS Grid : organiser en lignes et colonnes

## 🌍 Le problème d'abord
Tu veux une galerie régulière : 3 colonnes égales sur desktop, 2 sur tablette, 1 sur mobile, avec des
gouttières nettes. Ou la charpente d'une page : en-tête, barre latérale, contenu, pied, alignés à la
fois horizontalement ET verticalement. Avec Flexbox, tu bricoles des largeurs en pourcentage qui ne
s'alignent jamais parfaitement d'une ligne à l'autre. C'est normal : Flexbox ne gère qu'UN axe. Pour
un vrai **damier** (lignes ET colonnes), l'outil est **CSS Grid**. Cette leçon te donne le modèle 2D
complet, jusqu'aux zones nommées et à la grille implicite.

## 🎯 Objectif
Maîtriser Grid comme un système à **deux dimensions** : définir des pistes (colonnes/lignes) avec
`grid-template-columns/rows`, l'unité `fr`, `repeat()`, `minmax()` ; comprendre la grille **explicite**
vs **implicite** et le placement automatique ; placer des éléments et nommer des **zones**
(`grid-template-areas`) ; et savoir quand Grid est le bon choix plutôt que Flexbox.

## 🧩 Prérequis
Tu dois maîtriser le box model et les unités (`/doc/lessons/css-fundamentals`) et connaître Flexbox et
la notion de conteneur/enfants (`/doc/lessons/css-flexbox`), car Grid en est le complément 2D. La
structure sémantique (`/doc/lessons/html-semantic-structure`) sert à disposer les repères de page.

## 🧠 Modèle mental
Grid transforme un **conteneur** (`display: grid`) en une **grille de pistes** : des colonnes et des
lignes que TU définis, formant des cellules. Tu ne pousses plus les éléments les uns contre les autres
(Flexbox) : tu dessines une TRAME, puis tu y places le contenu (automatiquement, ou explicitement par
zones). La bascule : Flexbox pense « suite d'éléments sur un axe » ; Grid pense « plan à deux
dimensions ». « Deux directions → Grid. »

## 💡 Pourquoi c'est important
Galeries, tableaux de bord, cartes régulières, charpentes de page : dès que l'alignement doit tenir
sur DEUX axes en même temps, Grid donne un code plus court, plus lisible et plus robuste que des
largeurs Flex bricolées. Comprendre pistes, `fr`, `minmax` et zones, c'est construire des mises en
page adaptatives sans média-queries superflues — et les diagnostiquer sereinement.

## Explication complète

### Définir les pistes
```css
.galerie {
  display: grid;
  grid-template-columns: repeat(3, 1fr);  /* 3 colonnes égales */
  gap: 16px;                              /* gouttières lignes ET colonnes */
}
```
- L'unité **`fr`** répartit l'espace DISPONIBLE : `1fr 1fr 1fr` = trois parts égales ; `2fr 1fr` = la
  première deux fois plus large.
- **`repeat(n, …)`** évite la répétition : `repeat(3, 1fr)`.
- On peut mélanger : `grid-template-columns: 200px 1fr` (barre fixe + contenu fluide).
- `grid-template-rows` définit les lignes de la même façon.

### Grille explicite vs implicite
La grille **explicite** est celle que tu déclares (`grid-template-columns/rows`). Si tu ajoutes plus
d'éléments que de cellules prévues, Grid crée des pistes **implicites** pour les accueillir. Tu
contrôles leur taille avec `grid-auto-rows` / `grid-auto-columns`, et le sens de remplissage avec
`grid-auto-flow` (`row` par défaut, `column`, ou `dense` pour combler les trous).

### Grilles adaptatives sans média-query
```css
.galerie { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
```
- **`minmax(min, max)`** : chaque colonne fait au moins `min`, au plus `max`.
- **`auto-fill` / `auto-fit`** : Grid crée autant de colonnes que la largeur le permet. Le nombre de
  colonnes s'adapte tout seul — souvent sans aucune média-query. (`auto-fit` réduit les pistes vides ;
  `auto-fill` les conserve.)

### Placer les éléments
- Par lignes : `grid-column: 1 / 3` (de la ligne de grille 1 à 3, soit 2 colonnes), `grid-row: 2 / 4`.
- `span` : `grid-column: span 2` (occupe 2 colonnes à partir de sa position).
- Par **zones nommées** (très lisible pour une charpente) :
```css
.page {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-areas:
    "entete entete"
    "aside  contenu"
    "pied   pied";
}
.page > header  { grid-area: entete; }
.page > aside   { grid-area: aside; }
.page > main    { grid-area: contenu; }
.page > footer  { grid-area: pied; }
```
La trame se LIT dans le CSS ; réorganiser la page revient à réécrire les `areas` (idéal en responsive).

### Le piège du débordement (rappel)
Comme en Flexbox, un enfant Grid a une taille minimale égale à son contenu : un contenu long peut
faire déborder une piste. La parade reste `min-width: 0` (ou `minmax(0, 1fr)` sur la piste) pour
autoriser le rétrécissement.

## Concepts clés
Conteneur (`display:grid`) · pistes `grid-template-columns/rows` · `fr` · `repeat` · `minmax` ·
`auto-fill`/`auto-fit` · grille explicite vs implicite (`grid-auto-rows/flow`) · placement
(`grid-column/row`, `span`) · zones nommées (`grid-template-areas`, `grid-area`) · `gap` · `min-width: 0` /
`minmax(0, …)`.

## 🧭 Exemple guidé
Une galerie responsive SANS média-query, puis une charpente par zones.
```css
/* Galerie : autant de colonnes que la largeur le permet, min 220px */
.galerie { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
.galerie > article { min-width: 0; }   /* autorise le rétrécissement, évite le débordement */

/* Charpente : zones nommées, une seule colonne sur mobile via média-query */
.page { display: grid; grid-template-columns: 200px 1fr;
        grid-template-areas: "entete entete" "aside contenu" "pied pied"; gap: 16px; }
@media (max-width: 640px) {
  .page { grid-template-columns: 1fr; grid-template-areas: "entete" "contenu" "aside" "pied"; }
}
```
Raisonnement : la galerie est 2D et régulière → `auto-fill`/`minmax` adaptent le nombre de colonnes
sans média-query. La charpente aligne sur deux axes → les zones nommées la rendent lisible, et le
responsive se résume à réécrire la trame. `min-width: 0` protège du débordement.

## 🚫 Contre-exemple
Recréer une galerie 2D régulière avec Flexbox et des `width: 33.33%` : les cartes ne s'alignent pas
d'une rangée à l'autre dès que leur hauteur varie, et le calcul de largeur casse avec le `gap`. Grid
(`repeat(auto-fill, minmax(...))`) résout tout cela nativement — c'est le signe qu'on avait un
problème 2D.

## ⚠️ Erreurs fréquentes
- Utiliser Grid pour un simple alignement 1D (une rangée de boutons) → Flexbox est plus simple.
- Oublier que `auto-fill`/`auto-fit` + `minmax` remplacent souvent des média-queries entières.
- Confondre lignes de grille et pistes dans `grid-column: 1 / 3` (ce sont des LIGNES, d'où 2 colonnes).
- Contenu long qui déborde une piste → `min-width: 0` ou `minmax(0, 1fr)`.
- Micro-gérer chaque cellule alors que `grid-template-areas` serait plus lisible.

## 🔗 Liens avec le programme
Cette leçon complète `/doc/lessons/css-flexbox` (1D) pour former le système de mise en page, suit
`/doc/lessons/css-fundamentals` et précède `/doc/lessons/responsive-design` (qui rend ces grilles
adaptatives). La charpente d'une application React (`/doc/lessons/react-application-states`) s'appuie
sur ces trames.

## Mini-exercice
Construis (1) une galerie de 6 cartes en `repeat(auto-fill, minmax(200px, 1fr))` et réduis la fenêtre
pour voir le nombre de colonnes s'adapter ; (2) une charpente `header/aside/main/footer` avec
`grid-template-areas`, puis passe-la en une colonne via une média-query en réécrivant les `areas`.
Ajoute `min-width: 0` à une carte contenant un mot très long. Pratique associée : `web-card`, `web-nav`.

## 📚 Vocabulaire
**conteneur grid** · **piste** (`grid-template-columns/rows`) · **`fr`** · **`repeat`** · **`minmax`** ·
**`auto-fill` / `auto-fit`** · **grille explicite / implicite** (`grid-auto-rows/flow`) · **placement**
(`grid-column/row`, `span`) · **zones nommées** (`grid-template-areas`, `grid-area`) · **`min-width: 0`**.

## 🧾 À retenir
Grid organise en DEUX dimensions : tu définis des pistes (`grid-template-columns/rows`, `fr`, `repeat`,
`minmax`), Grid place le contenu (auto ou par zones nommées). `repeat(auto-fill, minmax(…))` crée des
grilles adaptatives souvent sans média-query ; `grid-template-areas` rend une charpente lisible et
facile à réorganiser en responsive. Comme en Flexbox, `min-width: 0` évite les débordements. Un axe →
Flexbox ; deux axes → Grid.
