<!-- keep -->
# Leçon — CSS Flexbox : aligner et répartir sur un axe

> **📚 Étagère de référence — cette leçon n'est programmée par aucune des 365 journées.**
> Tu ne l'as pas manquée : le parcours ne t'y enverra jamais, et aucune journée ne suppose
> que tu l'as lue. Elle est là pour être ouverte quand tu en as besoin — par curiosité, pour
> un projet, ou parce qu'une leçon du parcours y renvoie pour approfondir un point.


## 🌍 Le problème d'abord
Tu veux une barre : un logo à gauche, des liens à droite, le tout aligné verticalement au centre. Tu
essaies `float`, `display: inline-block`, des marges qui « tombent juste »… puis un lien passe à la
ligne, le centrage vertical casse, et à la moindre largeur différente tout se déforme. Ces outils
n'ont jamais été conçus pour aligner. **Flexbox** l'a été : il range les enfants d'un conteneur sur
**une** direction (une rangée OU une colonne) et gère alignement, espacement et rétrécissement pour
toi. Cette leçon te donne le modèle complet — pas juste « `display:flex` et ça marche ».

## 🎯 Objectif
Maîtriser Flexbox comme un système à **un axe** : comprendre l'axe principal et l'axe secondaire,
aligner et répartir (`justify-content`, `align-items`), contrôler la taille des enfants
(`flex-grow`, `flex-shrink`, `flex-basis` et le raccourci `flex`), gérer le passage à la ligne
(`flex-wrap`) et éviter le débordement (`min-width: 0`). À la fin, tu sais construire et DÉBOGUER une
disposition 1D.

## 🧩 Prérequis
Tu dois connaître le box model, `box-sizing`, l'héritage et les unités CSS
(`/doc/lessons/css-fundamentals`), ainsi que la structure sémantique d'une page
(`/doc/lessons/html-semantic-structure`). Aucune expérience de mise en page n'est supposée : on part
de « je ne sais pas aligner deux blocs ».

## 🧠 Modèle mental
Flexbox transforme un **conteneur** (`display: flex`) en chef d'orchestre qui aligne ses **enfants
directs** le long d'**un axe**. Deux axes structurent tout : l'**axe principal** (défini par
`flex-direction` : `row` par défaut, ou `column`) le long duquel les enfants se suivent, et l'**axe
secondaire**, perpendiculaire. La bascule mentale : tu ne positionnes plus chaque enfant ; tu déclares
sur le CONTENEUR comment répartir sur l'axe principal et aligner sur l'axe secondaire, et tu dis à
chaque ENFANT comment il occupe l'espace restant. « Une direction → Flexbox. »

## 💡 Pourquoi c'est important
Barres de navigation, cartes, boutons alignés, listes horizontales, centrage : la disposition 1D est
le pain quotidien du frontend. Bien comprendre les deux axes et le comportement de taille des enfants,
c'est cesser de deviner et savoir POURQUOI un élément déborde, ne se centre pas, ou ne rétrécit pas.
C'est aussi la moitié de la réponse à « Flexbox ou Grid ? ».

## Explication complète

### Le conteneur et les deux axes
```css
.barre { display: flex; }            /* row par défaut : axe principal horizontal */
```
- `flex-direction: row | column` : choisit l'axe principal (et donc lequel est le secondaire).
- `justify-content` agit sur l'**axe principal** : `flex-start`, `center`, `flex-end`, `space-between`,
  `space-around`, `space-evenly`.
- `align-items` agit sur l'**axe secondaire** : `stretch` (défaut), `center`, `flex-start`, `flex-end`,
  `baseline`.
- `gap` : l'espace entre enfants (préfère-le aux marges bricolées).
Centrer parfaitement devient trivial : `display:flex; justify-content:center; align-items:center;`.

### La taille des enfants : grow, shrink, basis
Chaque enfant a trois leviers, résumés par le raccourci `flex: <grow> <shrink> <basis>` :
- **`flex-basis`** : la taille de DÉPART de l'enfant sur l'axe principal (avant répartition). `auto`
  part de son contenu ; une valeur (`200px`, `0`) la fixe.
- **`flex-grow`** : comment l'enfant se PARTAGE l'espace RESTANT (0 = ne grandit pas ; 1 = prend sa
  part ; 2 = deux fois la part d'un enfant à 1).
- **`flex-shrink`** : comment l'enfant RÉTRÉCIT quand l'espace manque (0 = ne rétrécit jamais ; 1 =
  défaut).
Raccourcis fréquents : `flex: 1` = `1 1 0` (colonnes fluides égales, basées sur 0) ; `flex: auto` =
`1 1 auto` (grandit à partir du contenu) ; `flex: none` = `0 0 auto` (taille fixe, ne bouge pas).

### Le passage à la ligne
Par défaut, les enfants restent sur UNE ligne et rétrécissent. `flex-wrap: wrap` autorise le retour à
la ligne quand ça ne rentre plus — indispensable pour une barre ou une galerie 1D responsive.
`align-content` gère alors l'espacement ENTRE les lignes (à ne pas confondre avec `align-items`).

### Le piège `min-width: auto` (débordement)
Par défaut, un enfant flex a `min-width: auto` : il refuse de rétrécir sous la taille de son contenu
(un long mot, un bloc de code). Résultat : il FORCE le conteneur à déborder, malgré `flex-shrink: 1`.
La parade quasi systématique : donner `min-width: 0` (ou `min-height: 0` en colonne) à l'enfant
concerné. C'est LA cause n°1 des débordements horizontaux mystérieux en Flexbox.

### Aligner un enfant seul
`align-self` sur un enfant surcharge `align-items` du conteneur pour CET enfant (ex. un élément aligné
en bas alors que les autres sont centrés). `margin-left: auto` sur un enfant le pousse à l'extrême
(astuce classique pour « ce bouton tout à droite »).

## Concepts clés
Conteneur (`display:flex`) · axe principal/secondaire · `flex-direction` · `justify-content` (principal)
· `align-items`/`align-content`/`align-self` (secondaire) · `gap` · `flex-basis`/`flex-grow`/`flex-shrink`
+ raccourci `flex` · `flex-wrap` · `min-width: 0` (anti-débordement) · `margin: auto`.

## 🧭 Exemple guidé
Une barre responsive : logo à gauche, liens à droite, qui passe à la ligne sur mobile.
```css
.barre { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.barre .logo { flex: none; }              /* taille fixe : ne grandit ni ne rétrécit */
.barre .liens { display: flex; gap: 8px; margin-left: auto; min-width: 0; } /* poussé à droite, peut rétrécir */
```
Raisonnement : le conteneur aligne verticalement (`align-items: center`) et autorise le wrap ; le logo
est `flex: none` (jamais déformé) ; le groupe de liens est poussé à droite par `margin-left: auto` et
reçoit `min-width: 0` pour rétrécir proprement au lieu de déborder. Chaque décision découle du modèle
des deux axes et du comportement de taille.

## 🚫 Contre-exemple
```css
.barre { display: flex; }
.barre .liens { margin-left: 200px; }   /* MAUVAIS : marge fixe */
```
Ça « marche » sur ton écran, puis casse dès que la largeur change (chevauchement ou débordement). Le
bon outil est `margin-left: auto` (ou `justify-content: space-between`), qui s'adapte à l'espace réel.

## ⚠️ Erreurs fréquentes
- Confondre `justify-content` (axe principal) et `align-items` (axe secondaire).
- Oublier `min-width: 0` sur un enfant au contenu long → débordement horizontal.
- Croire que `flex: 1` part du contenu : non, il part de `basis: 0` (utilise `flex: auto` sinon).
- Utiliser des marges fixes pour espacer au lieu de `gap`.
- Vouloir une vraie grille 2D (lignes ET colonnes alignées) avec Flexbox → c'est le rôle de Grid.

## 🔗 Liens avec le programme
Cette leçon suit `/doc/lessons/css-fundamentals` (box model requis) et précède `/doc/lessons/css-grid`
(le système 2D complémentaire) puis `/doc/lessons/responsive-design`. Les interfaces React
(`/doc/lessons/react-fundamentals`) se disposent avec ces mêmes principes ; les débordements réels de
cette plateforme se diagnostiquent avec `min-width: 0`.

## Mini-exercice
Construis une carte : une image à gauche (taille fixe), un bloc texte à droite qui prend le reste
(`flex: 1; min-width: 0`), le tout aligné verticalement. Puis une rangée de 5 boutons avec `gap` et
`flex-wrap` : réduis la fenêtre et observe le wrap. Retire `min-width: 0` d'un enfant au texte long et
constate le débordement. Pratique associée : `web-nav`, `web-card`.

## 📚 Vocabulaire
**conteneur flex** · **axe principal / secondaire** · **`justify-content`** · **`align-items` /
`align-self`** · **`gap`** · **`flex-basis` / `flex-grow` / `flex-shrink`** · **raccourci `flex`** ·
**`flex-wrap` / `align-content`** · **`min-width: 0`**.

## 🧾 À retenir
Flexbox range les enfants d'un conteneur sur UN axe : `justify-content` répartit sur l'axe principal,
`align-items` aligne sur le secondaire, `gap` espace. La taille des enfants se contrôle avec
`flex-grow`/`shrink`/`basis` (raccourci `flex` : `1` part de 0, `auto` part du contenu, `none` = fixe).
Autorise le retour à la ligne avec `flex-wrap`, et n'oublie pas `min-width: 0` pour éviter les
débordements. Un seul axe → Flexbox ; un vrai damier 2D → Grid.
