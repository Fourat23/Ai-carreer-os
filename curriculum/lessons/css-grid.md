<!-- keep -->
# Leçon — CSS Grid : organiser en lignes et colonnes

> **📚 Étagère de référence — cette leçon n'est programmée par aucune des 365 journées.**
> Tu ne l'as pas manquée : le parcours ne t'y enverra jamais, et aucune journée ne suppose
> que tu l'as lue. Elle est là pour être ouverte quand tu en as besoin — par curiosité, pour
> un projet, ou parce qu'une leçon du parcours y renvoie pour approfondir un point.


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

## 🧭 Exemple guidé — deux mots qui diffèrent d'une syllabe

Voici la déclaration la plus utile de tout CSS Grid. Elle construit une galerie qui s'adapte
à n'importe quelle largeur **sans une seule média-query** :

```css
.galerie {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
```

Elle existe en deux variantes, et à peu près tout le monde les emploie au hasard :
`auto-fill` et `auto-fit`. Cinq lettres d'écart. La documentation dit qu'`auto-fit`
« réduit les pistes vides » — une phrase exacte, et qui n'apprend rien tant qu'on n'a pas
vu ce que ça change.

Mesurons.

> Toutes les valeurs qui suivent sont **mesurées** dans Chromium par
> `scripts/v70-verifications/css-grid-autofill-autofit.mjs`, qui lit
> `getComputedStyle(...).gridTemplateColumns` — c'est-à-dire les pistes réellement calculées,
> pas la déclaration écrite.

### Le décor

Conteneur de **1000 px**, `gap: 16px`, pistes `minmax(220px, 1fr)`.

Combien de colonnes ? Le navigateur cherche le plus grand nombre `n` tel que
`n × 220 + (n − 1) × 16 ≤ 1000`. Pour `n = 4` : `880 + 48 = 928`, ça passe. Pour `n = 5` :
`1100 + 64`, non. **Quatre colonnes**, et les 72 px restants sont redistribués par le `1fr` :
chaque piste fait `238 px`.

C'est le mécanisme entier. Le nombre de colonnes n'est pas déclaré : il est **déduit** d'une
largeur minimale. C'est ce qui rend les média-queries inutiles ici — on n'a pas dit « à partir
de 700 px, trois colonnes », on a dit « pas moins de 220 px par carte », et le navigateur
recalcule à chaque largeur.

### Le cas où les deux mots donnent le même résultat

**Huit cartes dans ce conteneur.** Mesure, pour `auto-fill` comme pour `auto-fit` :

```
4 colonnes · pistes [238, 238, 238, 238] · cartes [238 × 8]
```

Strictement identique. Deux rangées pleines, aucune différence.

C'est déjà une information : **tant que la grille est remplie, les deux mots sont
interchangeables.** Voilà pourquoi tant de gens utilisent l'un ou l'autre depuis des années
sans jamais voir de différence — et pourquoi, le jour où elle apparaît, elle est
incompréhensible.

### Le cas où ils divergent

**Trois cartes seulement**, tout le reste inchangé.

```
auto-fill → 4 colonnes · pistes [238, 238, 238, 238]     · cartes [238, 238, 238]
auto-fit  → 4 colonnes · pistes [322.656, 322.672, 322.656, 0] · cartes [322.66, 322.67, 322.66]
```

Regarde la quatrième piste. Avec `auto-fill` elle mesure **238 px** ; avec `auto-fit`, elle
mesure **0**.

Dans les deux cas le navigateur a bien créé quatre pistes — la largeur le permettait. La
différence est ce qu'il en fait quand la quatrième reste **vide** :

- **`auto-fill` la conserve.** Elle occupe sa place. Les trois cartes gardent 238 px et
  laissent un blanc à droite, comme s'il manquait une carte.
- **`auto-fit` l'effondre à zéro.** La place libérée retourne au `1fr` des trois pistes
  occupées, qui passent de 238 à **322,66 px** et remplissent la rangée.

Les deux comportements sont corrects. Ce sont deux intentions différentes :

| Tu veux… | Le mot |
|----------|--------|
| que les cartes gardent une taille régulière, et qu'une rangée incomplète le reste | `auto-fill` |
| que le contenu occupe toujours toute la largeur, quitte à s'étirer | `auto-fit` |

Un catalogue produit où toutes les vignettes doivent avoir la même taille d'une page à
l'autre : `auto-fill`. Une rangée de trois indicateurs sur un tableau de bord : `auto-fit`,
sinon le troisième laisse un trou permanent à droite.

Et le choix n'a de conséquence que **sur la dernière rangée** — celle qui, précisément, est
rarement présente dans la maquette qu'on a sous les yeux au moment d'écrire le CSS.

### L'adaptativité, vérifiée

Toujours avec huit cartes, en changeant seulement la largeur du conteneur :

| Largeur du conteneur | Colonnes |
|---------------------:|---------:|
| 1000 px | 4 |
| 700 px | 3 |
| 480 px | 2 |

Aucune média-query n'a été écrite. Aucun seuil n'a été choisi. Les seuils **découlent** du
`220px` de la déclaration : ils se déplaceraient tout seuls si on passait à `minmax(180px, 1fr)`.

C'est la différence de nature entre Grid et l'ancienne façon de faire du responsive. Une
média-query déclare des paliers ; `minmax` + `auto-fill` déclare une **contrainte**, et laisse
le navigateur en dériver les paliers. Une contrainte ne se désynchronise jamais du contenu.

### Le piège de `1fr`, jumeau de celui de Flexbox

Une dernière mesure, et c'est celle qui fait perdre le plus de temps.

Grille de 600 px, trois colonnes `1fr 1fr 1fr`, sans gap. Le deuxième enfant contient un mot
insécable de 66 caractères. Pistes calculées :

```
64,59 px   |   470,81 px   |   64,59 px
```

Trois pistes déclarées égales, et deux d'entre elles font sept fois moins que la troisième.

La raison est la même qu'en Flexbox, sous un autre nom : `1fr` signifie en réalité
`minmax(auto, 1fr)`, et ce `auto` est un plancher — « au moins la largeur de mon contenu
insécable ». Le mot long impose 470,81 px, et le `1fr` ne répartit plus que ce qui reste.

La correction, dans le même esprit que `min-width: 0` :

```css
grid-template-columns: repeat(3, minmax(0, 1fr));
```

Pistes mesurées : **200 · 200 · 200**. Le plancher `auto` est remplacé par `0`, et les
colonnes redeviennent égales.

Retiens la parenté : `1fr` est à Grid ce que `flex: 1` est à Flexbox, et `minmax(0, 1fr)` est
à Grid ce que `min-width: 0` est à Flexbox. Le même piège, deux fois, sous deux vocabulaires.
Le reconnaître une fois suffit à ne plus jamais le chercher pendant une heure.

### Et la charpente

Le second usage de Grid n'a rien à voir avec les galeries : dessiner la structure d'une page.

```css
.page {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-areas:
    "entete entete"
    "aside  contenu"
    "pied   pied";
  gap: 16px;
}
.page > header { grid-area: entete; }
.page > aside  { grid-area: aside; }
.page > main   { grid-area: contenu; }
.page > footer { grid-area: pied; }

@media (max-width: 640px) {
  .page {
    grid-template-columns: 1fr;
    grid-template-areas: "entete" "contenu" "aside" "pied";
  }
}
```

Ce qu'il faut voir ici est typographique autant que technique : **la trame se lit dans le
CSS**. Les guillemets dessinent la page. Quelqu'un qui n'a jamais vu ce fichier comprend la
structure en trois secondes, sans ouvrir le navigateur.

Et le passage en une colonne se fait en réécrivant la trame — quatre lignes, dans lesquelles
on peut aussi **changer l'ordre** : ici, `contenu` remonte avant `aside`, alors que le HTML
place `aside` en premier. Le contenu principal arrive donc en tête sur mobile, sans toucher au
document. C'est précisément ce que Grid permet et que le flux normal interdit : dissocier
l'ordre du document de l'ordre visuel.

Un avertissement, parce que ce pouvoir a un coût : la navigation au clavier et la lecture par
synthèse vocale suivent l'ordre du **document**, pas celui de la grille. Réordonner
visuellement au-delà du raisonnable produit une page où le focus saute d'un bout à l'autre de
l'écran. La règle prudente : réordonner des **blocs entiers** de la charpente, oui ; réordonner
des éléments interactifs voisins, non.

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

## 🛠️ Pratique — la trame d'un écran réel, et ses seuils

**Contexte.** Tu conçois la mise en page d'une console de supervision. On te donne le contenu,
pas la maquette — c'est volontaire : le but est que la trame **découle** du contenu.

L'écran contient six blocs :

| Bloc | Contenu | Contrainte connue |
|------|---------|-------------------|
| `entete` | logo, fil d'ariane, compte | hauteur fixe, toute la largeur |
| `filtres` | 6 champs de filtre | lisibles à partir de 240 px de large chacun |
| `indicateurs` | 4 tuiles chiffrées (« 128 alertes », « 99,2 % »…) | doivent toujours remplir la largeur, jamais laisser de trou |
| `graphe` | courbe temporelle | illisible sous 480 px de large |
| `journal` | 200 lignes de texte, avec des identifiants techniques sans espace (`req-8f3a-...`) | doit pouvoir défiler |
| `pied` | mentions | toute la largeur |

**Ta production, en quatre parties.**

**Partie 1 — la trame.** Écris le CSS de la charpente en `grid-template-areas`, pour deux
largeurs : bureau (≥ 1024 px) et mobile (< 700 px). Donne la disposition sous forme de trame
lisible, comme dans l'exemple guidé. Justifie **en une phrase par bloc** sa position et sa
largeur, en citant la contrainte du tableau.

**Partie 2 — les deux sous-grilles.** `filtres` et `indicateurs` sont chacun une grille
interne. Pour chacun : la déclaration complète, et surtout **le choix entre `auto-fill` et
`auto-fit`**, avec la phrase du tableau qui le justifie. Les deux ne reçoivent pas le même mot.

**Partie 3 — les trois pièges.** Trois défauts précis guettent cet écran. Nomme la déclaration
qui les évite, et dis ce que verrait l'utilisateur sans elle :

- le journal contient des identifiants insécables ;
- le graphe ne doit jamais descendre sous 480 px, y compris quand la place manque ;
- sur mobile, l'ordre visuel souhaité n'est pas l'ordre du HTML.

**Partie 4 — la vérification.** Reproduis la trame avec des blocs de couleur et mesure, à
1440, 1024, 768 et 375 px :

```js
const g = document.querySelector('.console');
console.log('colonnes', getComputedStyle(g).gridTemplateColumns);
console.log('filtres/colonne',
  getComputedStyle(document.querySelector('.filtres')).gridTemplateColumns);
console.log('débordement',
  document.documentElement.scrollWidth - document.documentElement.clientWidth);
```

Publie le tableau des quatre mesures. Une des quatre largeurs révèle un problème que ta trame
ne résout pas — dis lequel, et propose la décision (pas le réglage) qui le traite.

**Critère de réussite.** (a) Aucune largeur de colonne n'est un nombre choisi au hasard : chaque
valeur vient d'une contrainte du tableau ; (b) tu as employé `auto-fill` **et** `auto-fit`, à
des endroits différents, avec la justification ; (c) tes trois parades citent une déclaration
exacte ; (d) tu as publié les quatre mesures, y compris celle qui ne va pas.

**Durée.** 50 à 70 minutes, mesures comprises.

## ✅ Correction

### La démarche

Ne dessine pas la trame en premier. Traduis d'abord chaque contrainte du tableau en **nombre
CSS** ; la trame en découle presque mécaniquement.

```
filtres      ≥ 240 px par champ   →  minmax(240px, 1fr)
indicateurs  jamais de trou       →  auto-fit
graphe       ≥ 480 px             →  une piste minmax(480px, …), ou il passe pleine largeur
journal      texte insécable      →  minmax(0, 1fr) + overflow-wrap
entete/pied  pleine largeur       →  une zone qui couvre toutes les colonnes
```

Fait dans cet ordre, l'exercice n'a presque plus de choix arbitraires. Fait dans l'autre sens,
on dessine une jolie maquette puis on passe la soirée à la faire tenir.

### Partie 1 — la trame

```css
.console {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(480px, 2fr) minmax(0, 1fr);
  grid-template-areas:
    "entete       entete"
    "filtres      filtres"
    "indicateurs  indicateurs"
    "graphe       journal"
    "pied         pied";
}
.entete { grid-area: entete; }  /* … une ligne par bloc … */
```

Une phrase par bloc :

- **entete** et **pied** couvrent les deux colonnes : leur contrainte dit « toute la largeur ».
- **filtres** et **indicateurs** occupent aussi toute la largeur, mais pour une autre raison :
  ce sont des grilles internes qui gèrent elles-mêmes leur découpage. Leur imposer une colonne
  de la charpente extérieure les priverait de cette liberté.
- **graphe** reçoit `minmax(480px, 2fr)` : le `480px` est littéralement la contrainte du
  tableau, écrite dans le CSS. Le `2fr` lui donne le double de la place restante, parce qu'une
  courbe se lit mieux large.
- **journal** prend `minmax(0, 1fr)` — le `0` est ici indispensable, on y revient en partie 3.

Version mobile :

```css
@media (max-width: 700px) {
  .console {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      "entete"
      "indicateurs"
      "graphe"
      "filtres"
      "journal"
      "pied";
  }
}
```

Une seule colonne, et **l'ordre change** : les indicateurs remontent avant les filtres. Sur un
petit écran, on veut voir l'état du système avant de pouvoir le filtrer. Le HTML n'a pas
bougé.

### Partie 2 — les deux sous-grilles, et pourquoi les mots diffèrent

```css
.filtres {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}
```

**`auto-fill`**, parce que six champs ne remplissent pas toujours un nombre entier de rangées.
Sur une largeur qui permet quatre colonnes, il en reste deux sur la seconde rangée. Avec
`auto-fit`, ces deux champs s'étireraient chacun à la moitié de l'écran : deux champs de
saisie géants sous quatre champs normaux, ce qui est laid et surtout trompeur — la taille d'un
champ suggère la longueur attendue de la saisie.

```css
.indicateurs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
```

**`auto-fit`**, parce que le tableau le dit explicitement : « doivent toujours remplir la
largeur, jamais laisser de trou ». Quatre tuiles sur une largeur qui en permettrait cinq
laisseraient, avec `auto-fill`, un blanc de la taille d'une tuile à droite — et sur un tableau
de bord, un rectangle vide se lit comme une donnée manquante, pas comme un espace.

C'est le passage important de cette correction : **le même besoin apparent (« une grille de
cartes adaptative ») reçoit deux réponses opposées selon ce que signifie une rangée
incomplète.**

### Partie 3 — les trois pièges

**Le journal et ses identifiants insécables.** Sans parade :

```css
.journal { /* piste 1fr, contenu req-8f3a-4c21-b7e0-… */ }
```

`1fr` vaut `minmax(auto, 1fr)`, et ce `auto` est un plancher égal au plus long fragment
insécable. Un identifiant de 40 caractères impose donc la largeur de la colonne journal, qui
vole sa place au graphe — exactement le mécanisme mesuré dans l'exemple guidé (64,59 / 470,81 /
64,59 au lieu de 200 / 200 / 200). Ce que verrait l'utilisateur : un graphe écrasé, sans
comprendre pourquoi, et qui change de taille selon les identifiants du jour.

```css
.console  { grid-template-columns: minmax(480px, 2fr) minmax(0, 1fr); }
.journal  { min-width: 0; overflow-wrap: anywhere; overflow-y: auto; max-height: 60vh; }
```

Deux déclarations distinctes, pour deux problèmes distincts — c'est la leçon de Flexbox
répétée ici : `minmax(0, …)` règle la **piste**, `overflow-wrap` règle le **texte**.

**Le graphe et son plancher.** `minmax(480px, 2fr)` garantit qu'il ne descend jamais sous
480 px. Attention : cette garantie a une conséquence qu'il faut assumer — quand la fenêtre
devient trop étroite pour `480 + journal + gap`, la grille **déborde**. C'est voulu : mieux
vaut un défilement horizontal assumé qu'un graphe illisible. Mais c'est une décision, et elle
doit être prise consciemment, pas subie. C'est aussi pourquoi la version mobile passe en une
seule colonne bien avant d'en arriver là.

**L'ordre visuel sur mobile.** Traité par la réécriture de `grid-template-areas`, sans toucher
au HTML. Avec le rappel d'accessibilité de l'exemple guidé : ici on réordonne des **blocs
entiers** de la charpente, ce qui reste sain ; le focus clavier traverse chaque bloc dans son
ordre interne, qui est inchangé.

### Partie 4 — les mesures, et celle qui ne va pas

Relevé attendu, pour une trame conforme :

| Fenêtre | colonnes de `.console` | colonnes de `.filtres` | débordement |
|--------:|------------------------|------------------------|------------:|
| 1440 | 2 pistes (graphe large, journal étroit) | 5 | 0 |
| 1024 | 2 pistes | 4 | 0 |
| 768 | 2 pistes, graphe au plancher de 480 | 3 | 0 ou léger |
| 375 | 1 piste | 1 | 0 |

**La largeur qui pose problème est 768 px** — et c'est le cœur de la partie 4. La média-query
bascule en une colonne à 700 px ; entre 700 et 768, on est encore en deux colonnes, avec un
graphe cloué à 480 px et un journal réduit à la portion congrue. Le graphe est à sa limite de
lisibilité, le journal devient une colonne de texte de 250 px pleine de retours à la ligne, et
l'écran n'est bon ni pour l'un ni pour l'autre.

La bonne réponse n'est **pas** de rogner le plancher du graphe à 380 px : ce serait déplacer
le seuil après avoir vu le résultat, en renonçant à une contrainte qu'on s'était donnée pour
une raison. C'est une **décision de conception** : remonter le point de bascule vers une
colonne à 900 px, ou empiler graphe et journal dès que les deux ne tiennent pas
confortablement. Une seule question la tranche, et elle n'est pas technique : *à 768 px, mon
utilisateur veut-il voir les deux à la fois ?*

Note au passage la parenté avec la limite honnête de la leçon Flexbox : dans les deux cas, on
arrive à un point où aucun réglage de mise en page ne répond, parce que la question posée est
devenue « que montre-t-on ? ».

### La mauvaise solution plausible

Écrire la charpente en pistes numériques plutôt qu'en zones nommées :

```css
.entete { grid-column: 1 / 3; grid-row: 1; }
.graphe { grid-column: 1;     grid-row: 4; }
```

C'est strictement équivalent au rendu près. Et le jour où il faut insérer une rangée
« bannière d'incident » en deuxième position, il faut renuméroter **toutes** les lignes de
tous les blocs, à la main, sans que rien ne signale un oubli. Avec `grid-template-areas`, on
ajoute une ligne de guillemets et c'est fini.

Le CSS numérique n'est pas faux ; il est simplement muet. La trame en guillemets dit ce qu'elle
fait, et c'est la seule partie du CSS d'une application qu'un non-développeur peut relire.

### Généralisation

L'ordre de travail de cette pratique — *traduire les contraintes en nombres, puis laisser la
trame en découler* — est l'inverse de ce qu'on fait spontanément, et il vaut bien au-delà de
CSS. Le réflexe naturel est de dessiner d'abord la solution, puis de vérifier qu'elle satisfait
les contraintes ; le réflexe professionnel est d'écrire les contraintes d'abord, parce que ce
sont elles qu'il faudra défendre quand quelqu'un demandera de les assouplir. Un `minmax(480px,
2fr)` dans une feuille de style est une contrainte visible et discutable ; le même 480 obtenu
par tâtonnement est une valeur que personne n'osera toucher parce que personne ne sait d'où
elle vient.

## Mini-exercice
Sur une galerie existante, remplace `auto-fill` par `auto-fit` (ou l'inverse) et retire une carte
jusqu'à obtenir une rangée incomplète. Lis `getComputedStyle(grille).gridTemplateColumns` dans les deux
cas et repère la piste qui vaut `0`.

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
