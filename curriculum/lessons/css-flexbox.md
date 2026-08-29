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

## 🧭 Exemple guidé — où passent les 600 pixels

Tout le mystère de Flexbox tient dans une seule opération : le navigateur a une largeur
disponible, il a des enfants, et il doit décider combien chacun reçoit. Cette opération est
**arithmétique**, pas magique. Une fois qu'on sait la poser, `flex: 1`, `flex: auto` et
`min-width: 0` cessent d'être des incantations.

Prenons un conteneur unique et regardons neuf configurations.

```html
<div class="c">
  <div class="e e1">…contenu naturel : 100 px…</div>
  <div class="e e2">…contenu naturel : 200 px…</div>
  <div class="e e3">…contenu naturel : 60 px…</div>
</div>
```

```css
.c { display: flex; width: 600px; }
```

Le conteneur fait **600 px**. La somme des contenus naturels fait `100 + 200 + 60 = 360 px`.
Il reste donc **240 px d'espace libre**. Voilà les deux nombres qui gouvernent tout.

> Toutes les largeurs qui suivent sont **mesurées**, pas déduites. Le script
> `scripts/v70-verifications/css-flexbox-repartition.mjs` construit ces pages dans Chromium
> et imprime chaque nombre publié ici.

### `flex: 1` — la répartition qui ignore le contenu

```css
.e { flex: 1; }        /* raccourci de : flex-grow:1  flex-shrink:1  flex-basis:0 */
```

Mesure : **200 · 200 · 200**.

Le contenu naturel n'apparaît nulle part dans le résultat, et c'est voulu. `flex-basis: 0`
signifie « pars de zéro » : le navigateur considère que chaque enfant a une taille de départ
nulle, ce qui laisse **600 px** à distribuer, et non 240. Les trois `flex-grow: 1` se les
partagent en parts égales : `600 / 3 = 200`.

C'est pourquoi `flex: 1` donne des colonnes **égales** : il efface la taille du contenu avant
de répartir.

### `flex: auto` — la répartition qui part du contenu

```css
.e { flex: auto; }     /* flex-grow:1  flex-shrink:1  flex-basis:auto */
```

Mesure : **180 · 280 · 140**.

Ici `flex-basis: auto` veut dire « pars de ta taille naturelle ». Chaque enfant garde donc
son contenu, et **seul l'espace libre** est partagé :

```
espace libre = 600 − (100 + 200 + 60) = 240
part de chacun = 240 / 3 = 80
résultat = 100+80 · 200+80 · 60+80 = 180 · 280 · 140
```

Les écarts d'origine sont conservés, adoucis. `flex: 1` égalise, `flex: auto` proportionne
sans égaliser. **C'est la seule différence entre les deux**, et elle explique la moitié des
mises en page « presque bonnes ».

### `flex: 0 0 300px` — le refus de rétrécir

```css
.e { flex: 0 0 300px; }    /* ne grandit pas, ne rétrécit pas, part de 300 px */
```

Mesure : **300 · 300 · 300**, somme **900**, dépassement du conteneur : **300 px**.

Trois fois 300 dans 600, ça ne rentre pas — et `flex-shrink: 0` interdit au navigateur d'y
remédier. Il obéit : il déborde. Retiens le principe général, il vaut au-delà de Flexbox :
**une contrainte impossible ne produit pas d'erreur, elle produit un débordement.** Personne
ne t'avertira ; c'est à toi de mesurer.

### `flex: 1 1 300px` — le rétrécissement autorisé

```css
.e { flex: 1 1 300px; }
```

Mesure : **200 · 200 · 200**.

Même point de départ que le cas précédent — 900 px demandés pour 600 disponibles — mais
`flex-shrink: 1` autorise cette fois la réduction. Le manque de 300 px est réparti au
prorata des tailles de départ, égales ici : chacun perd 100 px.

Un seul chiffre a changé, le comportement est passé de « ça déborde » à « ça s'ajuste ». Le
`shrink` est la valve de sécurité de la mise en page.

### Le cas qui piège tout le monde : `min-width: auto`

Reprenons `flex: 1`, mais avec un mot long et insécable dans le deuxième enfant, du genre
`ProvisionnementAutomatiqueDesRessources` — un identifiant technique, une URL, un nom de
fichier.

Mesure : **112,16 · 375,69 · 112,16**.

L'égalité a disparu, alors que la règle CSS n'a pas changé d'un caractère. Ce qui a changé,
c'est un plancher invisible : par défaut, un enfant flex a `min-width: auto`, ce qui veut dire
« je refuse de descendre sous la largeur de mon contenu **insécable** ». Le mot fait 375,69 px
et ne peut pas être coupé : l'enfant du milieu s'y accroche, et les deux autres se partagent
ce qui reste.

Noter la subtilité : **rien ne déborde ici.** La somme fait toujours 600. Le défaut n'est pas
un débordement, c'est une **répartition volée**. On cherche alors pendant vingt minutes
pourquoi trois colonnes marquées identiques ne le sont pas.

Avec un mot vraiment long — 66 caractères — la mesure devient : **100 · 635,77 · 60**, somme
**795,77**, dépassement **196 px**. Cette fois les trois enfants sont tous coincés à leur
plancher (100, 635,77 et 60 : leurs contenus respectifs), la somme des planchers dépasse le
conteneur, et le débordement horizontal apparaît.

### La correction, et sa limite honnête

```css
.e { flex: 1; min-width: 0; }
```

Mesure, dans les deux cas : **200 · 200 · 200**. L'égalité revient, le débordement de la
boîte disparaît. `min-width: 0` supprime le plancher : l'enfant accepte enfin d'être plus
étroit que son contenu.

Mais mesurons plus loin, parce que c'est là qu'on ment souvent par omission. Avec le mot de
66 caractères et `min-width: 0`, le dépassement mesuré sur le conteneur vaut encore **236 px**.

Les *boîtes* rentrent — le *texte*, lui, sort de sa boîte. `min-width: 0` a réglé le problème
de mise en page, pas celui du contenu. Il faut une seconde décision, distincte :

```css
.e { flex: 1; min-width: 0; overflow-wrap: break-word; }
```

Mesure : **200 · 200 · 200**, dépassement **0**. Le mot est coupé en fin de ligne.

`overflow: hidden` (couper), `overflow-x: auto` (faire défiler ce bloc) ou `text-overflow:
ellipsis` (abréger) sont les autres réponses possibles, selon ce que l'utilisateur doit
pouvoir faire du contenu. Le point à retenir est qu'il y a **deux problèmes** — la boîte qui
ne rétrécit pas, et le contenu qui ne se coupe pas — et que `min-width: 0` n'en résout qu'un.

### Le tableau à mémoriser

| Ce que tu écris | Point de départ | Ce que ça donne |
|-----------------|-----------------|-----------------|
| `flex: 1` | 0 | colonnes **égales**, contenu ignoré |
| `flex: auto` | contenu | écarts **conservés**, espace libre partagé |
| `flex: none` | contenu | taille **figée**, ni grandit ni rétrécit |
| `flex: 0 0 X` | X | figé à X, **déborde** si ça ne rentre pas |
| `flex: 1 1 X` | X | part de X, s'ajuste dans les deux sens |

Et la question à se poser devant toute mise en page flex qui se comporte mal : **est-ce que
quelque chose refuse de rétrécir ?** Dans l'immense majorité des cas, la réponse est oui, et
c'est un `min-width: auto` que personne n'a écrit.

### La barre de navigation, une fois le modèle acquis

```css
.barre       { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.barre .logo { flex: none; }                                   /* jamais déformé */
.barre .liens{ display: flex; gap: 8px; margin-left: auto; min-width: 0; }
```

Chaque ligne se lit maintenant sans effort. `align-items: center` aligne sur l'axe secondaire
— le vertical, puisque l'axe principal est horizontal. `flex: none` protège le logo de toute
répartition. `margin-left: auto` absorbe **tout** l'espace libre à gauche du groupe de liens
et le pousse à droite, ce qui est plus robuste qu'une marge fixe, laquelle « tombe juste » sur
ton écran et nulle part ailleurs. Et `min-width: 0` désarme le plancher, pour que le jour où
un lien s'appelle « Approvisionnement et facturation », la barre rétrécisse au lieu de casser.

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

## 🛠️ Pratique — l'en-tête qui ne tient pas ses promesses

**Contexte.** Tu reprends l'en-tête d'une application de gestion. Il est écrit en Flexbox et
il « marche » — sur l'écran de la personne qui l'a écrit. Trois défauts sont remontés du
support, jamais reproduits par l'équipe.

```html
<header class="entete">
  <img class="logo" src="logo.svg" width="140" height="32" alt="Gestion Pro">
  <nav class="onglets">
    <a href="/tableau">Tableau de bord</a>
    <a href="/appro">Approvisionnement et facturation</a>
    <a href="/rapports">Rapports</a>
  </nav>
  <div class="compte">
    <span class="email">prenom.nom@entreprise-exemple.fr</span>
    <button class="deconnexion">Déconnexion</button>
  </div>
</header>
```

```css
.entete   { display: flex; align-items: center; }
.logo     { flex: 1; }
.onglets  { display: flex; gap: 8px; flex: 2; }
.compte   { display: flex; gap: 8px; margin-left: 40px; }
.email    { flex: 1; }
```

Les trois signalements :

1. **« Le logo est déformé sur les grands écrans. »** Une capture montre le logo étiré en
   largeur. Le fichier fait pourtant 140 px de large, et l'attribut `width="140"` est bien là.
2. **« Sur mon portable, l'adresse électronique se coupe en deux lignes »**, alors qu'elle
   tient sur une seule sur les postes de bureau. Personne n'a demandé qu'elle se coupe.
3. **« Sur ma tablette en mode portrait, il y a une barre de défilement horizontale sur
   toutes les pages. »**

**Ta production, en trois parties.**

**Partie 1 — diagnostic.** Pour chacun des trois signalements : la **ligne de CSS
responsable**, ce qu'elle demande au navigateur, et pourquoi le résultat est celui observé.
Une déclaration précise par signalement, pas « le CSS est mal écrit ».

Un des trois signalements a une cause que le CSS montré **ne contient pas explicitement** —
c'est une valeur par défaut. Nomme-la.

**Partie 2 — mesure.** Reproduis le fichier et vérifie. Dans la console :

```js
const px = (n) => Math.round(n * 100) / 100;
document.querySelectorAll('.entete > *, .compte > *').forEach((el) => {
  const s = getComputedStyle(el);
  console.log(el.className.padEnd(12), 'largeur', px(el.getBoundingClientRect().width),
              '| flex', s.flexGrow, s.flexShrink, s.flexBasis, '| min-width', s.minWidth);
});
console.log('débordement page :',
  px(document.documentElement.scrollWidth - document.documentElement.clientWidth));
```

Relève les largeurs à **1600, 1280, 900, 768, 700 et 600 px** de fenêtre. Trois questions
auxquelles tes mesures doivent répondre par un nombre :

- à quelle largeur le logo cesse-t-il de grandir, et pourquoi celle-là ?
- à quelle largeur l'adresse passe-t-elle sur deux lignes ?
- à quelle largeur la barre de défilement apparaît-elle, et de combien de pixels ?

Ton diagnostic de la partie 1 prédisait-il ces seuils ? Si non, dis lequel t'a surpris.

**Partie 3 — correction.** Réécris le bloc CSS. Contraintes :

- le logo garde ses proportions à toute largeur ;
- le bloc compte est poussé à droite **sans marge fixe** ;
- entre 1600 px et 600 px, rien ne déborde et l'adresse ne se replie jamais sur deux lignes ;
- l'adresse électronique a le droit d'être abrégée, mais le bouton Déconnexion doit
  **toujours** rester lisible en entier ;
- une phrase par déclaration : ce qu'elle protège.

**Critère de réussite.** (a) Tes trois diagnostics nomment une déclaration précise ;
(b) tu as identifié la valeur par défaut non écrite ; (c) ta correction distingue clairement
ce qui ne doit **jamais** rétrécir de ce qui rétrécit en premier ; (d) tu as mesuré aux deux
largeurs, pas seulement regardé.

**Durée.** 45 à 60 minutes, mesures comprises.

## ✅ Correction

> Les nombres de cette correction sont **mesurés** : le script
> `scripts/v70-verifications/css-flexbox-repartition.mjs` rend cet en-tête dans Chromium aux
> six largeurs demandées et imprime chaque largeur publiée ici.

### La démarche

Devant une mise en page flex qui se comporte mal, remplis mentalement trois colonnes, dans
cet ordre :

1. **Qui grandit ?** (`flex-grow` non nul) — cause des déformations.
2. **Qui refuse de rétrécir ?** (`flex-shrink: 0`, ou un `min-width: auto` par défaut) —
   cause des débordements.
3. **Qui prend l'espace libre ?** (`margin: auto`, `justify-content`) — cause des
   positionnements surprenants.

L'erreur de méthode habituelle est de partir de ce qui est visuellement cassé. Ici, les trois
signalements viennent de blocs différents, et le troisième a une cause **cumulée** : aucune
des déclarations prise isolément ne le produit.

### Le relevé

| Fenêtre | logo | onglets | compte | email | hauteur du texte de l'email | débordement |
|--------:|-----:|--------:|-------:|------:|----------------------------:|------------:|
| 1600 | **411,03** | 822,06 | 326,91 | 225,09 | 16 (une ligne) | 0 |
| 1280 | **304,36** | 608,73 | 326,91 | 225,09 | 16 | 0 |
| 900 | 177,70 | 355,39 | 326,91 | 225,09 | 16 | 0 |
| 768 | **140** | 261,09 | 326,91 | 225,09 | 16 | 0 |
| 700 | 140 | 241,72 | 278,28 | **176,47** | **32 (deux lignes)** | 0 |
| 600 | 140 | 241,72 | 261,55 | **159,73** | 32 | **83** |

Trois seuils s'y lisent directement, et ils répondent aux trois questions de la partie 2.

### Signalement 1 — le logo déformé

La ligne coupable : `.logo { flex: 1; }`.

`flex: 1` développe en `flex-grow: 1; flex-shrink: 1; flex-basis: 0`. On l'a écrit en pensant
« que le logo prenne sa place » ; on a écrit « **pars de zéro, et absorbe ta part de tout
l'espace disponible** ». L'image fait 140 px ; elle est rendue à **411 px** en 1600 et à
**304 px** en 1280. Elle est donc étirée de près du triple sur un grand écran — et comme
c'est une image, l'étirement se voit.

C'est le contresens le plus répandu sur `flex: 1` : il est lu comme une part modeste, alors
qu'il est une instruction de croissance depuis zéro.

**Le seuil.** À 768 px et en dessous, le logo mesure exactement 140. Il a cessé de grandir
parce qu'il n'y a plus d'espace libre à absorber : sa largeur retombe alors sur son plancher,
qui est la taille naturelle de l'image. Autrement dit, le défaut disparaît précisément là où
l'équipe teste, et il n'existe que là où l'équipe ne regarde pas.

Ce qu'il fallait écrire : `flex: none` — c'est-à-dire `0 0 auto`, « ma taille est celle de mon
contenu, ne me touche pas ». Un logo, une icône, un avatar : `flex: none` presque toujours.

### Signalement 2 — l'adresse sur deux lignes

Deux déclarations conjuguées, et c'est ce qui rend le cas instructif.

`.email { flex: 1; }` fait de l'adresse un élément qui part de zéro et grandit. Tant que
`.compte` a la place, l'adresse est servie à **225,09 px**, sa largeur naturelle sur une
ligne. Mais `.compte` est lui-même un enfant flex, avec le `flex-shrink: 1` par défaut : quand
la place manque, il rétrécit, et il fait rétrécir l'adresse avec lui.

**Le seuil.** Entre 768 et 700 px, `.compte` passe de 326,91 à 278,28, l'adresse de 225,09 à
**176,47** — et la hauteur de son texte passe de 16 à **32 pixels** : deux lignes. Le
navigateur n'a pas « décidé » de couper ; on lui a donné une boîte trop étroite et il a fait
ce qu'il fait toujours, passer à la ligne.

Ici intervient la **valeur par défaut non écrite** demandée en partie 1 : `min-width: auto`.
Chaque enfant flex refuse par défaut de descendre sous la largeur de son **plus long fragment
insécable**. Pour cette adresse, ce fragment n'est pas la chaîne entière : le navigateur
accepte de couper après `@` et après les points. C'est pourquoi elle se plie en deux lignes au
lieu de déborder — et c'est aussi pourquoi le plancher de `.email` s'établit vers 160 px et
pas plus bas.

Rien dans le CSS montré ne contient les mots `min-width`. C'est bien le problème : la
déclaration la plus déterminante de cette mise en page est celle que personne n'a écrite.

### Signalement 3 — la barre de défilement

Trois causes se cumulent, et **aucune ne suffit seule** — c'est ce qui rend ce défaut si long
à diagnostiquer quand on cherche un coupable unique.

À 600 px, chacun des blocs est arrivé à son plancher :

```
logo    140,00   (taille naturelle de l'image)
onglets 241,72   (le plus long onglet, insécable en pratique)
compte  261,55   (adresse repliée + bouton)
marge    40,00   (margin-left fixe)
------  -------
        683,27   pour 600 px disponibles   →   débordement de 83 px
```

Mesure : **83 px**. Le calcul et la mesure concordent à moins d'un pixel.

`.compte { margin-left: 40px; }` mérite un mot à part. Une marge fixe n'est pas fausse en
soi ; elle devient fausse quand elle sert à **positionner** (« pousser le bloc compte à
droite ») au lieu d'**espacer**. Une marge qui positionne réclame ses 40 px même quand il n'y
en a plus un seul de libre. `margin-left: auto` fait le même travail et vaut zéro quand il n'y
a plus d'espace : c'est la différence entre demander une place et prendre la place qui reste.

Le débordement le plus large impose sa barre de défilement à toute la page — d'où « sur toutes
les pages », puisque l'en-tête est partout. C'est aussi pourquoi ce genre de ticket est
signalé de façon si vague par les utilisateurs : ils voient le symptôme global, jamais
l'élément coupable.

### La correction

```css
.entete   { display: flex; align-items: center; gap: 16px; }

.logo     { flex: none; }
/* Une image ne se répartit pas : sa taille est une donnée, pas une variable. */

.onglets  { display: flex; gap: 8px; flex: 1 1 auto; min-width: 0; overflow: hidden; }
/* Prend l'espace restant en partant de son contenu, et accepte de rétrécir : c'est ici
   que la place se prend quand la fenêtre est large, et se rend quand elle est étroite. */

.compte   { display: flex; align-items: center; gap: 8px; flex: none; margin-left: auto; }
/* flex: none — le bloc compte ne rétrécit pas, il est le dernier à céder.
   margin-left: auto — il est poussé à droite par l'espace libre, sans nombre fixe. */

.email    { flex: 0 1 auto; min-width: 0;
            overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
/* Le seul élément qui a le droit d'être abrégé. min-width: 0 retire le plancher,
   text-overflow: ellipsis rend l'abrègement lisible plutôt que brutal. */

.deconnexion { flex: none; white-space: nowrap; }
/* Une action ne s'abrège jamais : un bouton coupé est un bouton qu'on n'ose pas cliquer. */
```

### Pourquoi ça marche

La correction repose sur une décision unique, prise explicitement : **établir un ordre de
sacrifice.** Quand la place manque, quelque chose doit céder, et le rôle du CSS est de dire
quoi, dans quel ordre.

Ici : l'adresse d'abord (elle s'abrège), les onglets ensuite (ils rétrécissent), puis plus
rien — le logo et le bouton sont `flex: none`, ils ne participent jamais. C'est ce qui rend
la mise en page prévisible à toutes les largeurs, alors que la version d'origine laissait le
navigateur arbitrer avec les planchers implicites de chaque contenu.

Formulé autrement : la version d'origine ne disait pas au navigateur qui devait céder, donc
c'est la longueur du texte qui décidait. Une mise en page dont le comportement dépend de la
longueur des adresses électroniques des utilisateurs n'est pas une mise en page, c'est une
loterie.

Le relevé du corrigé, aux mêmes largeurs :

| Fenêtre | logo | onglets | compte | email | lignes de l'email | débordement |
|--------:|-----:|--------:|-------:|------:|------------------:|------------:|
| 1600 | 140 | 1101,09 | 326,91 | 225,09 | 1 | 0 |
| 900 | 140 | 401,09 | 326,91 | 225,09 | 1 | 0 |
| 700 | 140 | 201,09 | 326,91 | 225,09 | 1 | 0 |
| 600 | 140 | 101,09 | 326,91 | 225,09 | 1 | 0 |
| 500 | 140 | 1,09 | 326,91 | 225,09 | 1 | 0 |
| 375 | 140 | **0** | 326,91 | 225,09 | 1 | **124** |

Le logo reste à 140 partout. L'adresse reste sur une ligne partout. Les trois signalements
sont clos de 1600 à 500 px, et c'est la colonne `onglets` qui absorbe toute la variation —
c'est exactement l'ordre de sacrifice qu'on a écrit.

### Ce que la correction ne règle pas, et il faut le dire

À 375 px, la mesure montre `onglets: 0` et un débordement de **124 px**. La correction ne
tient donc pas sur un téléphone, et il serait malhonnête de conclure sur le tableau
précédent.

Le calcul le dit sans ambiguïté : `logo 140 + compte 326,91 + deux gaps de 16` font déjà
498,91 px de contenu incompressible, pour 375 px disponibles. Aucun réglage de `flex` ne fera
rentrer 499 px dans 375. Les onglets, seuls compressibles, sont écrasés à zéro — ce qui n'est
pas un compromis mais une disparition : la navigation devient invisible et inatteignable.

**Enseignement, et il est plus important que la correction elle-même :** quand la somme des
éléments incompressibles dépasse la largeur disponible, le problème a cessé d'être un problème
de Flexbox. C'est une décision de **conception** : masquer l'adresse électronique sous
l'avatar, replier les onglets dans un menu, ou passer l'en-tête sur deux lignes. Flexbox
répartit l'espace ; il ne décide pas ce qu'on montre. Continuer à ajuster des `flex` à ce
stade, c'est chercher une solution technique à une question éditoriale — et c'est ainsi qu'on
obtient les en-têtes mobiles illisibles qu'on voit partout.

### La mauvaise solution plausible

`.entete { overflow-x: hidden; }`.

La barre de défilement disparaît. Le signalement 3 est clos. Et le bouton Déconnexion est
maintenant **hors de l'écran, inatteignable** pour les utilisateurs de tablette, sans aucun
indice visuel. On a transformé un défaut visible et signalé en un défaut invisible et
insignalable — objectivement pire, alors que le ticket est passé en « résolu ».

Deuxième mauvaise réponse, plus subtile : ajouter `flex-wrap: wrap` sur `.entete`. Ça évite
effectivement le débordement, mais un en-tête qui passe sur deux lignes déplace tout le
contenu de la page vers le bas, à une largeur donnée et pas à une autre. Le retour à la ligne
est une bonne réponse pour une galerie ou une liste de filtres ; pour une barre d'en-tête à
hauteur fixe, c'en est rarement une.

### Généralisation

Le raisonnement de cette pratique — *nommer ce qui ne doit jamais céder, nommer ce qui cède
en premier, laisser le reste s'ajuster* — n'est pas une technique CSS. C'est la façon dont on
conçoit tout système soumis à une ressource limitée : un budget, une capacité serveur, un
temps de traitement, une largeur d'écran. La question « que se passe-t-il quand il n'y a pas
assez ? » a toujours une réponse ; la seule question est de savoir si c'est toi qui l'as
écrite, ou si tu la découvriras en production.

## Mini-exercice
Sur une page de ton choix, ouvre la console et exécute la sonde de la partie 2 sur un conteneur flex.
Trouve un enfant dont `min-width` vaut `auto` et dont le contenu est insécable — puis prédis, avant de
tester, ce qui changera si tu lui donnes `min-width: 0`.

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
