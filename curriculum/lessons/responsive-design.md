<!-- keep -->
# Leçon — Responsive design : une interface pour tous les écrans

> **📚 Étagère de référence — cette leçon n'est programmée par aucune des 365 journées.**
> Tu ne l'as pas manquée : le parcours ne t'y enverra jamais, et aucune journée ne suppose
> que tu l'as lue. Elle est là pour être ouverte quand tu en as besoin — par curiosité, pour
> un projet, ou parce qu'une leçon du parcours y renvoie pour approfondir un point.


## 🌍 Le problème d'abord
Ton interface est superbe sur ton grand écran. Un utilisateur l'ouvre sur son téléphone : le texte
est minuscule, il faut zoomer, les colonnes se chevauchent, un bloc déborde et crée une barre de
défilement horizontale disgracieuse. Or aujourd'hui, la majorité du trafic web est mobile. Une
interface qui ne s'adapte pas est une interface à moitié cassée pour la moitié de ses utilisateurs.
Le problème : tu as conçu pour UNE taille d'écran alors qu'il en existe une infinité. Le responsive
design résout ça — non pas en faisant « une version mobile », mais en rendant l'interface FLUIDE et
ADAPTATIVE. Cette leçon t'apprend à penser multi-écrans.

## 🎯 Objectif
Savoir rendre une interface utilisable de 320 px à 1920 px+ : comprendre le rôle du `viewport`, le
principe **mobile-first**, les **media queries** (adapter la mise en page à des seuils de largeur),
et le réflexe de contenus FLUIDES plutôt que de largeurs fixes — pour ne plus jamais livrer une page
cassée sur mobile.

## 🧩 Prérequis
Tu dois savoir disposer des éléments avec Flexbox et Grid, et connaître les unités relatives
(`/doc/lessons/css-flexbox`, `/doc/lessons/css-grid`, `/doc/lessons/css-fundamentals`). Comprendre le box model
et `min-width: 0` est indispensable pour diagnostiquer les débordements. Aucune expérience de design
mobile n'est supposée.

## 🧠 Modèle mental
Le responsive n'est pas « faire un site mobile À CÔTÉ du site desktop » : c'est UN seul document qui
se RÉORGANISE selon la place disponible. Deux idées portent tout :
1. **Fluidité par défaut** : les contenus s'étirent et se contractent (largeurs en `%`/`fr`/`max-width`,
   images `max-width: 100%`) au lieu d'être figés en pixels.
2. **Points de bascule (breakpoints)** : à certaines largeurs, on CHANGE la disposition (une colonne
   sur mobile → trois colonnes sur desktop) via des **media queries**.
Le bon réflexe est **mobile-first** : on écrit d'abord le style pour petit écran (le plus contraint,
donc le plus simple), puis on AJOUTE de la richesse quand l'écran s'élargit. Concevoir dans ce sens
évite d'« entasser » puis de « désentasser » — on construit par ajouts, pas par corrections.

## 💡 Pourquoi c'est important
Un site non responsive perd et frustre ses utilisateurs mobiles, et se fait pénaliser par les moteurs
de recherche (indexation mobile-first). En équipe, « ça marche sur mon écran » n'est jamais une
preuve : la validation multi-largeurs fait partie du travail sérieux. Savoir raisonner responsive,
c'est livrer des interfaces réellement utilisables — et savoir diagnostiquer pourquoi une page déborde
à 375 px (un vrai problème récurrent, y compris sur cette plateforme).

## Explication complète

### La balise viewport (indispensable)
Sans elle, le mobile fait semblant d'être un écran large et « dézoome » ta page. À mettre dans le
`<head>` :
```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```
Elle dit au navigateur : « la largeur de rendu = la largeur réelle de l'appareil ». C'est le
préalable non négociable de tout responsive.

### Contenus fluides
- Largeurs relatives : `width: 100%`, `max-width: 640px` (fluide jusqu'à un plafond lisible).
- Images/médias : `img { max-width: 100%; height: auto; }` pour qu'ils ne débordent jamais.
- Typographie et espacements en `rem` : ils suivent les préférences de l'utilisateur.
- Les blocs larges (code, tableaux) gèrent leur propre défilement : `overflow-x: auto` sur eux, et
  `min-width: 0` sur leurs parents flex/grid pour ne pas forcer la page à déborder.

### Les media queries
Elles appliquent des règles CONDITIONNELLES à partir d'un seuil de largeur :
```css
/* Mobile-first : style de base = petit écran (une colonne) */
.galerie { display: grid; grid-template-columns: 1fr; gap: 16px; }

/* À partir de 768px : deux colonnes */
@media (min-width: 768px) {
  .galerie { grid-template-columns: repeat(2, 1fr); }
}
/* À partir de 1200px : trois colonnes */
@media (min-width: 1200px) {
  .galerie { grid-template-columns: repeat(3, 1fr); }
}
```
On utilise `min-width` (mobile-first : on enrichit vers le haut) plutôt que `max-width`. Les seuils
(breakpoints) se choisissent d'après le CONTENU (quand la mise en page « craque »), pas d'après des
modèles de téléphones précis.

### Tester réellement
On valide à plusieurs largeurs typiques — par exemple **375 / 768 / 1024 / 1440 / 1920** — en
vérifiant : pas de défilement horizontal de page, texte lisible sans zoom, cibles cliquables
suffisamment grandes, rien qui se chevauche. Les outils de développement du navigateur simulent ces
largeurs ; c'est un contrôle de routine, pas une option.

## Concepts clés
`viewport` · mobile-first · fluidité (`%`/`fr`/`max-width`, `img{max-width:100%}`) · **media query**
(`@media (min-width: …)`) · breakpoint choisi d'après le contenu · anti-débordement (`overflow-x:auto`
+ `min-width:0`) · validation multi-largeurs.

## 🧭 Exemple guidé — arrêter de choisir les seuils, et les mesurer

Ouvre n'importe quel projet et regarde ses média-queries. Tu y trouveras 768, 1024, 1200,
peut-être 576 et 992. Demande à l'auteur d'où viennent ces nombres : la réponse honnête est
« du framework que j'utilisais » ou « c'est la taille d'un iPad ».

Ces nombres ne décrivent rien de ta page. Le seuil correct est celui où **ton** contenu cesse
de tenir, et il se mesure. C'est ce qu'on va faire — mais il faut d'abord régler une question
préalable, parce qu'elle rend tout le reste inutile si on l'oublie.

> Les nombres de cette section sont **mesurés** par
> `scripts/v70-verifications/responsive-viewport-seuils.mjs`, qui rend ces pages dans Chromium,
> avec émulation d'appareil mobile pour la première partie.

### La question préalable : 980

Prenons une page ordinaire, avec du texte à `16px`, et rendons-la sur un appareil mobile émulé
de **390 px** de large. Deux fois : sans la balise `viewport`, puis avec.

| | largeur de rendu (`document.documentElement.clientWidth`) |
|---|---|
| Sans `<meta name="viewport">` | **980 px** |
| Avec `<meta name="viewport" content="width=device-width, initial-scale=1">` | **390 px** |

Le nombre 980 n'est ni la largeur de l'écran, ni un calcul : c'est une **valeur par défaut
historique**. Les navigateurs mobiles, à une époque où presque aucun site n'était conçu pour
eux, ont choisi de faire semblant d'être un écran de bureau d'environ 980 px, puis de réduire
le rendu pour qu'il tienne sur la vitre. C'était la bonne décision en 2008 ; c'est resté le
comportement par défaut.

Ce que ça donne aujourd'hui : ta page est mise en page pour 980 px, puis compressée dans
390 px physiques. Le facteur est `390 / 980 ≈ 0,4`. Ton texte déclaré à 16 px arrive à
l'utilisateur avec une hauteur apparente d'environ **6,4 px**. Il est là, il est correct, il
est illisible.

Deux conséquences pratiques :

1. **Sans cette balise, toutes tes média-queries sont mortes.** Elles interrogent la largeur de
   rendu, qui vaut 980 quel que soit le téléphone. Tu peux écrire `@media (max-width: 600px)`
   pendant des heures : la condition ne sera jamais vraie sur mobile.
2. C'est aussi le meilleur test de diagnostic. Un site dont le texte est minuscule sur mobile
   **et** dont le zoom fonctionne parfaitement n'a pas un problème de CSS : il lui manque une
   ligne dans le `<head>`.

### Maintenant, le seuil

Voici une page de tableau de bord, écrite sans aucune média-query :

```css
.grille    { display: flex; gap: 24px; padding: 24px; }
.principal { flex: 1 1 auto; min-width: 0; }
.cote      { flex: 0 0 280px; }      /* colonne latérale, largeur fixe */
td, th     { white-space: nowrap; }  /* un tableau de chiffres ne se coupe pas */
```

À quelle largeur cesse-t-elle de tenir ? Ne devinons pas : balayons.

```js
// à coller dans la console, sur une page ouverte
for (let w = 320; w <= 1440; w += 20) {
  await page.setViewportSize({ width: w, height: 800 });   // ou le mode appareil des outils
  const d = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  if (d > 0) console.log(w, 'déborde de', d);
}
```

Le relevé :

| Largeur | Débordement |
|--------:|------------:|
| 320 px | 213 px |
| 480 px | 53 px |
| **540 px** | **0** |
| 640 px et au-delà | 0 |

**Le seuil de cette page est 540.** Pas 768. Pas 576. Cinq cent quarante, parce que
`280 px de colonne latérale + le tableau + les gouttières + le remplissage` font 540, et pour
aucune autre raison.

### Ce que le nombre 540 dit, et ce qu'il ne dit pas

Il dit où la mise en page **casse**. Il ne dit pas où elle doit **changer**.

Ce sont deux choses différentes, et les confondre est l'erreur suivante. À 560 px, la page ne
déborde pas — mais le tableau est comprimé au maximum et la colonne latérale prend la moitié
de l'écran. Techniquement conforme, concrètement désagréable.

Le seuil mesuré est donc un **plancher absolu**, pas une recommandation. La règle utilisable :

> Mesure la largeur où ça casse, puis place ton seuil **au-dessus**, à la largeur où ça
> redevient confortable.

Ici, on placerait le passage en une colonne vers 700 ou 720 px — un choix, cette fois assumé
et argumenté, et non un nombre recopié. Il a une justification qu'on peut écrire dans le
fichier :

```css
/* Base : une colonne. En dessous de 700 px, la colonne latérale et le tableau
   ne cohabitent plus confortablement (rupture mesurée à 540, marge de confort). */
.grille { display: block; }

@media (min-width: 700px) {
  .grille { display: flex; gap: 24px; }
}
```

### Pourquoi mobile-first, concrètement

Note le sens de la média-query : la base est la version étroite, et la règle **ajoute** la
disposition en colonnes quand la place existe. Ce n'est pas une préférence de style.

Écrit dans l'autre sens — base en deux colonnes, `@media (max-width: 699px)` pour repasser en
une — chaque nouvelle règle doit **défaire** quelque chose. Tu écris `display: flex`, puis plus
loin `display: block` pour l'annuler ; `flex: 0 0 280px`, puis `width: auto`. À la troisième
média-query, la moitié du fichier sert à corriger l'autre moitié, et personne ne sait plus
quelle valeur s'applique à quelle largeur sans ouvrir le navigateur.

En mobile-first, on n'annule jamais : on ajoute. C'est la même différence qu'entre un texte
écrit et un texte raturé.

### Les trois vérifications qui restent

Le balayage ne détecte qu'un seul type de défaut, le débordement horizontal. Trois autres se
vérifient à l'œil, aux largeurs qui comptent :

- **le texte** reste-t-il lisible sans zoomer ? (le test de la balise `viewport` en est le cas
  extrême) ;
- **les cibles tactiles** — boutons, liens — sont-elles assez grandes et assez espacées pour un
  doigt, et non pour un curseur ?
- **rien ne se chevauche et rien ne disparaît** — un élément écrasé à zéro, comme dans la
  leçon Flexbox, ne déborde pas et n'apparaît dans aucune mesure automatique.

Le balayage automatique trouve le défaut le plus fréquent ; il ne remplace pas le fait de
regarder la page.

## ⚠️ Erreurs fréquentes
- Oublier la balise `viewport` → le mobile « dézoome » toute la page (texte illisible).
- Penser desktop-first puis « rétrécir » → on empile des `max-width` correctifs difficiles à suivre.
- Largeurs fixes en `px` et images sans `max-width: 100%` → débordements sur petit écran.
- Choisir des breakpoints d'après des modèles de téléphones au lieu du moment où le contenu craque.
- Ne tester qu'à une seule largeur (« ça marche chez moi ») et livrer une page cassée sur mobile.

## 🔗 Liens avec le programme
Cette leçon clôt le socle Web Platform (`/doc/lessons/html-semantic-structure`,
`/doc/lessons/css-fundamentals`, `/doc/lessons/css-flexbox`, `/doc/lessons/css-grid`) et irrigue tout le frontend :
les interfaces React (`/doc/lessons/react-fundamentals`) et l'accessibilité
(`/doc/lessons/react-accessibility`) doivent rester utilisables sur tous les écrans. La méthode de
validation multi-largeurs sert aussi à diagnostiquer les débordements réels de la plateforme.

## 🛠️ Pratique — l'audit responsive d'une page que tu n'as pas écrite

**Contexte.** Choisis une page réelle : un site que tu consultes, une page d'un projet
personnel, ou la page d'accueil d'une administration. **Une seule condition : tu n'en es pas
l'auteur.** Auditer son propre travail apprend moins, parce qu'on connaît déjà les intentions.

Cette pratique produit un livrable qui a une valeur en soi : c'est exactement le document
qu'on demande à un frontend en mission de conseil, et c'est un excellent objet à montrer en
entretien.

**Ta production : une note d'audit de deux pages, structurée ainsi.**

**1. La balise.** La page a-t-elle un `<meta name="viewport">` ? Relève-le tel quel. Puis
mesure, dans la console, `document.documentElement.clientWidth` en mode appareil mobile. Écris
le nombre. S'il vaut 980, tu as trouvé un défaut à toi seul plus grave que tous les suivants.

**2. Le balayage.** Exécute le relevé de 320 à 1440 px par pas de 20, et publie :

- la **première largeur sans débordement** ;
- le **débordement maximal**, et à quelle largeur ;
- l'**élément coupable** à cette largeur, trouvé avec la sonde de la leçon `css-fundamentals` :

```js
document.querySelectorAll('*').forEach((el) => {
  if (el.getBoundingClientRect().right > document.documentElement.clientWidth) {
    console.log(el.tagName, el.className, Math.round(el.getBoundingClientRect().right));
  }
});
```

**3. Les seuils déclarés.** Relève les média-queries réellement présentes :

```js
[...document.styleSheets].flatMap((f) => {
  try { return [...f.cssRules]; } catch { return []; }        // feuilles d'un autre domaine
}).filter((r) => r.media).map((r) => r.conditionText);
```

Compare-les au seuil que **tu** as mesuré. Écarts constatés, et ton hypothèse sur leur
origine : contenu, framework, ou modèle d'appareil ?

**4. Les trois vérifications à l'œil**, à 375 et 768 px : lisibilité du texte sans zoom, taille
et espacement des cibles tactiles, éléments écrasés ou masqués. Une phrase et une capture par
constat.

**5. Le classement.** Trois défauts au maximum, ordonnés par **impact utilisateur**, pas par
facilité de correction. Pour chacun : ce que vit l'utilisateur, la déclaration en cause, la
correction en une à trois lignes de CSS.

**6. La phrase honnête.** Une chose que ton audit **ne** couvre **pas**, et pourquoi. Le
balayage automatique a un angle mort ; nomme-le.

**Critère de réussite.** (a) Tous tes constats portent un nombre mesuré, aucun n'est une
impression ; (b) tu as identifié un élément coupable précis, pas « la page déborde » ; (c) ton
classement par impact diffère du classement par facilité, et tu le dis ; (d) la partie 6 est
écrite et n'est pas une formule de politesse.

**Durée.** 60 à 90 minutes. C'est la pratique la plus longue de ce lot, et la plus proche d'une
tâche professionnelle réelle.

## ✅ Correction

Cette pratique portant sur une page que tu choisis, la correction ne donne pas de réponses :
elle donne la **grille de relecture** de ta note, les résultats typiques, et les erreurs de
raisonnement qui reviennent le plus souvent.

### La démarche : pourquoi cet ordre

Les six parties ne sont pas dans un ordre arbitraire. Elles vont du **défaut qui invalide tout
le reste** vers le plus fin :

1. sans la balise `viewport`, aucune média-query ne s'applique — inutile d'auditer des règles
   qui ne s'exécutent pas ;
2. le débordement horizontal est le seul défaut mesurable automatiquement, donc le premier à
   éliminer ;
3. les seuils déclarés ne se jugent qu'une fois le seuil réel connu ;
4. ce qui reste demande un œil humain ;
5. le classement transforme des constats en décisions ;
6. la limite déclarée est ce qui distingue un audit d'un réquisitoire.

Un audit qui commence par « les boutons sont trop petits » alors que la balise manque est un
audit mal ordonné, même si le constat est vrai.

### Ce que tu vas probablement trouver

**Partie 1.** La balise est presque toujours là — c'est le premier réflexe enseigné partout.
Les cas où elle manque se trouvent surtout dans les pages générées par un outil interne ancien
ou dans un courriel converti en page web. Si tu la trouves absente, ton audit a déjà payé son
temps.

Variante à signaler : la balise présente mais assortie de `user-scalable=no` ou
`maximum-scale=1`. Ça interdit à l'utilisateur de zoomer. C'est un défaut d'accessibilité
sérieux, et une correction d'une ligne — retirer ces valeurs.

**Partie 2.** Le débordement à 320 px est très fréquent, et le coupable appartient presque
toujours à l'une de ces cinq familles :

| Coupable | Déclaration en cause |
|----------|----------------------|
| une image sans plafond | il manque `img { max-width: 100%; height: auto; }` |
| un tableau de données | `table` large, sans conteneur `overflow-x: auto` |
| un bloc de code | même chose, avec en plus des lignes insécables |
| une chaîne insécable (URL, identifiant) | il manque `overflow-wrap` |
| une largeur fixe oubliée | un `width: 360px` écrit un jour pour une maquette |

Si ton coupable n'entre dans aucune de ces cinq familles, relis ta mesure : soit tu as trouvé
quelque chose d'intéressant, soit la sonde a désigné un parent plutôt que l'enfant qui déborde.

**Partie 3.** Le résultat typique : la page déclare 576, 768, 992 et 1200 — la série exacte
d'un framework répandu — alors que son contenu craque à une largeur qui n'est aucune des
quatre. Ce n'est pas nécessairement une faute : hériter des seuils de son framework a une
valeur de cohérence. Ce qui est une faute, c'est de ne pas savoir que ce sont ceux du
framework et non ceux du contenu — parce que le jour où le contenu change, personne ne pense
à revoir le seuil.

**Partie 4.** Le constat qui revient le plus est celui des cibles tactiles : des liens de
navigation espacés de quelques pixels, cliquables à la souris, impraticables au doigt. Il est
systématiquement absent des audits automatiques, et c'est le défaut que les utilisateurs
mobiles subissent tous les jours.

### L'erreur de raisonnement principale

Elle est dans la **partie 5**, et presque tout le monde la commet : classer les défauts par
ordre de facilité de correction, tout en croyant les classer par impact.

Ça donne des notes qui commencent par « ajouter `max-width: 100%` aux images » — correction
d'une ligne, effet réel mais modeste — et qui finissent par « la navigation est inutilisable
au doigt sur mobile », défaut qui empêche littéralement l'usage du site, mais dont la
correction demande de repenser un composant.

Le classement par impact met la navigation en premier, **même si tu ne sais pas encore comment
la corriger**. Un audit sert à dire ce qui compte, pas à commander le travail par ordre de
confort. Si tu remarques que ton classement par impact est identique à ton classement par
facilité, vérifie-le : la coïncidence est possible, elle est rare.

### La partie 6, et pourquoi elle est notée

Un audit qui ne déclare pas ses angles morts se lit comme exhaustif, et c'est faux. Le
balayage de la partie 2 en a au moins quatre, et en citer un précisément vaut mieux que d'en
lister quatre vaguement :

- **il ne voit que la largeur.** Un menu qui recouvre le contenu, un texte blanc sur fond
  blanc, une modale qu'on ne peut pas fermer au doigt : rien de tout cela n'affecte
  `scrollWidth` ;
- **il ne voit pas ce qui est écrasé à zéro.** L'en-tête corrigé de la leçon `css-flexbox`
  finit avec `onglets: 0` — navigation disparue, débordement nul, mesure parfaite ;
- **il ne voit pas les états.** La page est mesurée au repos : menu fermé, formulaire vide,
  aucun message d'erreur. Un menu déployé ou un message d'erreur long change la mise en page ;
- **il ne teste pas un vrai appareil.** L'émulation reproduit une largeur, pas un clavier
  virtuel qui remonte, une barre d'adresse qui se rétracte, ni un doigt de 9 mm.

Choisis-en un, explique-le en deux phrases, et ta note devient un document professionnel plutôt
qu'un rapport d'outil.

### Généralisation

Ce que cette pratique installe dépasse le responsive : c'est la différence entre **vérifier** et
**mesurer**. « J'ai regardé sur mon téléphone, ça a l'air bien » est une vérification ; « la
page déborde de 213 px à 320 et le coupable est ce tableau » est une mesure. La première ne se
transmet pas, ne se rejoue pas, et ne prouve rien à la personne qui devra corriger. La seconde
tient dans une ligne, se reproduit en dix secondes, et clôt la discussion.

C'est aussi la forme que prend une compétence quand elle devient professionnelle : non pas
savoir davantage de propriétés CSS, mais produire des constats qu'une autre personne peut
vérifier sans te croire sur parole.

## Mini-exercice
Sur une page ouverte, exécute la sonde de débordement à 375 px. Si elle ne renvoie rien, réduis à
320 px. Note l'élément désigné et à laquelle des cinq familles du tableau de correction il appartient.

## 📚 Vocabulaire
**responsive** · **`viewport`** · **mobile-first** · **fluidité** · **media query** (`@media`) ·
**breakpoint** · **`max-width`** · **`overflow-x: auto` / `min-width: 0`** · **validation multi-largeurs**.

## 🧾 À retenir
Le responsive, c'est UNE interface qui se réorganise, pas deux sites. Mets la balise `viewport`,
raisonne mobile-first (style de base pour petit écran, enrichi par media queries `min-width`), garde
les contenus fluides (`%`/`max-width`, images `max-width: 100%`) et protège-toi des débordements
(`overflow-x` sur les blocs larges, `min-width: 0` sur les parents flex/grid). Choisis les
breakpoints d'après le contenu, et valide toujours à plusieurs largeurs : « ça marche chez moi » n'est
pas une preuve.
