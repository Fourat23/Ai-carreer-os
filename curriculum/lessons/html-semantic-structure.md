<!-- keep -->
# Leçon — HTML sémantique : structurer une page

## 🌍 Le problème d'abord
Tu veux construire une page : un en-tête, un menu, un contenu principal, un pied de page. La
tentation du débutant : tout mettre dans des `<div>`. Ça « marche » visuellement… puis les
ennuis arrivent. Un lecteur d'écran lit une bouillie de boîtes sans nom, l'utilisateur au
clavier ne peut pas sauter au contenu, Google ne comprend pas ta page, et toi-même tu te perds
dans quarante `<div class="...">` identiques. Le problème : une `<div>` ne dit RIEN de ce qu'elle
contient. HTML propose des balises qui portent un SENS — un vrai `<button>`, un `<nav>`, un
`<main>`. Cette leçon t'apprend à structurer une page avec le bon élément pour le bon rôle.

## 🎯 Objectif
Savoir choisir la balise HTML qui exprime le SENS d'un contenu (titres hiérarchisés, repères de
page `header`/`nav`/`main`/`footer`, listes, boutons vs liens), comprendre pourquoi la sémantique
profite à l'accessibilité, au référencement et à ta propre maintenabilité, et distinguer « ça
s'affiche » de « c'est correctement structuré ».

## 🧩 Prérequis
Tu dois avoir vu ce qu'est une balise HTML et que le navigateur en construit un arbre (le DOM)
que le CSS habille et que JavaScript anime (`/doc/lessons/browser-dom-rendering`). Aucune
connaissance de CSS n'est nécessaire ici : on parle de STRUCTURE et de SENS, pas d'apparence.
Aucune expérience préalable de conception de page n'est supposée.

## 🧠 Modèle mental
Le HTML n'est pas de la mise en forme, c'est du **sens**. Chaque balise répond à la question
« qu'est-ce que ce contenu EST ? » — un titre ? une navigation ? un paragraphe ? un bouton
d'action ? Bien choisir la balise, c'est écrire un document que **trois publics** comprennent
gratuitement : le navigateur (comportements natifs), les technologies d'assistance (lecteurs
d'écran), et les moteurs de recherche. Une `<div>` est une boîte MUETTE : à réserver quand
aucune balise sémantique ne convient. Règle d'or : **le sens d'abord, l'apparence ensuite (en CSS)**.

## 💡 Pourquoi c'est important
Une page sémantique est accessible par défaut, mieux référencée, et bien plus facile à faire
évoluer. À l'inverse, une « soupe de div » se paie cher : bugs d'accessibilité découverts tard,
refontes coûteuses, régressions. En entretien comme en équipe, savoir structurer proprement une
page est un signal de sérieux — c'est la fondation sur laquelle CSS, formulaires, React et
l'accessibilité viennent se poser. Sauter cette marche, c'est bâtir sur du sable.

## Explication complète

### Le squelette d'un document
Une page valide part d'une ossature : `<!DOCTYPE html>`, `<html lang="fr">`, un `<head>`
(métadonnées : `<title>`, `<meta charset>`, `<meta name="viewport">`) et un `<body>` (le contenu
visible). Le `lang` et le `charset` ne sont pas décoratifs : ils pilotent la prononciation des
lecteurs d'écran et l'affichage correct des accents.

### Les repères de page (landmarks)
Ces balises découpent la page en régions que les outils d'assistance savent nommer et parcourir :
- `<header>` : l'en-tête (logo, titre du site) ;
- `<nav>` : un bloc de navigation (menu de liens) ;
- `<main>` : le contenu principal — **un seul par page** ;
- `<article>` : un contenu autonome (un billet, une carte réutilisable) ;
- `<section>` : un regroupement thématique, généralement introduit par un titre ;
- `<aside>` : un contenu annexe (encadré, complément) ;
- `<footer>` : le pied de page.
Un lecteur d'écran peut alors proposer « aller au contenu principal » ou lister les régions —
impossible avec des `<div>`.

### La hiérarchie des titres
Les titres `<h1>`…`<h6>` forment un PLAN, comme une table des matières. Un seul `<h1>` (le sujet
de la page), puis des `<h2>` pour les grandes parties, des `<h3>` pour les sous-parties. On ne
saute pas de niveau (pas de `<h4>` juste après un `<h2>`) et on ne choisit JAMAIS un niveau « parce
qu'il est plus petit » : la taille est l'affaire du CSS, la hiérarchie est l'affaire du sens.

### Le bon élément interactif
- Une ACTION (envoyer, ouvrir, basculer) → `<button>`. Il est focusable, activable au clavier
  (Entrée/Espace) et annoncé « bouton » — gratuitement.
- Une NAVIGATION vers une URL → `<a href="...">`. Un lien mène quelque part ; un bouton fait
  quelque chose.
- Un champ de saisie → `<input>`/`<textarea>` associés à un `<label>` (on approfondit dans la
  leçon formulaires).
Détourner une `<div>` en bouton (`<div onclick>`) casse le clavier et l'accessibilité : c'est
l'anti-pattern classique.

### Listes et contenus de texte
Une énumération → `<ul>`/`<ol>` + `<li>` (le lecteur d'écran annonce « liste de 5 éléments »).
Un paragraphe → `<p>`. Une citation, une figure, un tableau de données → la balise dédiée
(`<blockquote>`, `<figure>`, `<table>`). Le bon conteneur porte un sens que le style seul ne
donnera jamais.

## Concepts clés
Sémantique (sens vs apparence) · squelette (`doctype`/`html lang`/`head`/`body`) · repères
`header`/`nav`/`main`/`article`/`section`/`aside`/`footer` · hiérarchie `h1`→`h6` · `button` vs
`a` · listes `ul`/`ol`/`li` · `<div>`/`<span>` = boîtes neutres de dernier recours.

## 🧭 Exemple guidé
Structurer une page d'accueil de blog, **sans une seule `<div>`** :
```html
<body>
  <header>
    <h1>Le carnet de Léa</h1>
    <nav aria-label="Principale">
      <ul>
        <li><a href="/">Accueil</a></li>
        <li><a href="/articles">Articles</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <article>
      <h2>Premiers pas en HTML</h2>
      <p>Le HTML décrit le sens d'un contenu…</p>
    </article>
  </main>
  <footer>
    <p>© 2026 Léa</p>
  </footer>
</body>
```
Raisonnement : chaque balise répond à « qu'est-ce que c'est ? ». Le menu est une LISTE de LIENS
dans un `<nav>` nommé ; l'article est autonome avec son propre titre `<h2>` sous l'`<h1>` de la
page. Résultat : navigable au clavier, compréhensible par un lecteur d'écran, lisible par Google
— **avant même** d'avoir écrit une ligne de CSS.

**Jusqu'ici, c'est une affirmation. Voici comment la vérifier — et ce que ça coûte de se
tromper.** Ajoutons un bouton d'action à cette page. Deux versions, visuellement identiques
une fois stylées :

```html
<div onclick="envoyer()" class="bouton">Envoyer</div>
<button onclick="envoyer()">Envoyer</button>
```

Mesuré dans un navigateur, sur les mêmes deux éléments :

| | `<div onclick>` | `<button>` |
|---|---|---|
| compté comme bouton par les aides techniques | **non** | oui |
| `tabIndex` | **−1** | 0 |
| atteignable par la touche Tab | **non** | oui |
| se déclenche avec Entrée puis Espace | **0 fois sur 2** | 2 fois sur 2 |
| se déclenche au clic souris | oui | oui |

Le `<div>` fonctionne parfaitement — pour qui utilise une souris et voit l'écran. Pour tous
les autres, ce bouton **n'existe pas**. Et c'est un bug qu'aucun test manuel ordinaire ne
révèle, puisque celui qui teste clique dessus.

**Décision 1 — « je vais le réparer ».** C'est le raisonnement qu'il faut suivre jusqu'au
bout, parce que c'est celui que tout le monde tient. Ajoute `tabindex="0"` : l'élément
devient atteignable. Ajoute `role="button"` : il est annoncé comme un bouton. Ajoute un
gestionnaire `keydown` qui filtre Entrée **et** Espace, en pensant à `preventDefault` sur
Espace pour que la page ne défile pas. Il reste encore : l'état désactivé (`disabled`
empêche vraiment le déclenchement, `aria-disabled` ne fait que l'annoncer), la soumission
d'un formulaire par la touche Entrée, le comportement en mode contraste élevé. Tu as écrit
une dizaine de lignes pour réobtenir, imparfaitement, ce que six caractères donnaient. **Le
HTML sémantique n'est pas une bonne pratique morale : c'est du comportement déjà écrit,
testé et cohérent entre navigateurs.** La question à se poser n'est donc jamais « quelle
balise a la bonne apparence ? » mais « quelle balise a le bon comportement ? » — l'apparence,
c'est le rôle du CSS, et un `<button>` se restyle entièrement.

**Décision 2 — le contre-piège, et il attrape ceux qui ont compris la leçon trop vite.**
Ayant appris que `<div>` n'est pas sémantique, on remplace machinalement tous ses `<div>` par
des `<section>`. Mesure du résultat : sur une page contenant un `<div>`, une `<section>` nue
et une `<section aria-label="Résultats">`, les outils ne trouvent **qu'une seule** région —
la troisième. Une `<section>` sans nom accessible n'apporte strictement rien de plus qu'un
`<div>` ; elle est seulement plus longue à écrire. Le sens ne vient pas du nom de la balise,
il vient de ce que la balise **permet d'affirmer**, et une section anonyme n'affirme rien.
Le bon réflexe : garder `<div>` quand on regroupe pour styler — c'est exactement son rôle,
et il est légitime — et n'employer `<section>` que lorsqu'on peut lui donner un titre.

**Décision 3 — les niveaux de titre ne sont pas des tailles.** Le sous-titre paraît trop
gros, on passe de `<h2>` à `<h4>`. Visuellement, c'est réglé. Structurellement, on vient de
créer un trou : la page annonce un niveau 4 sans niveau 3, et l'utilisateur qui navigue de
titre en titre — un mode de lecture courant avec un lecteur d'écran — perd le fil de la
hiérarchie. Les titres forment un **plan**, comme celui d'un mémoire ; leur numéro dit la
profondeur, pas la taille de la police. La taille, elle, se règle en CSS, et il faut le dire
franchement : c'est une ligne de CSS contre une structure de document cassée.

**Le test qui ne coûte rien.** Range ta souris et parcours ta page à la touche Tab.
Peux-tu atteindre chaque chose cliquable ? Vois-tu toujours où tu es ? Arrives-tu à valider
avec Entrée ? Trois minutes, aucune installation, et ce test attrape la majorité des défauts
de ce genre — y compris ceux que les outils automatiques ne signalent pas, comme un focus
invisible parce qu'un `outline: none` traîne dans la feuille de style.

**Variante qui déplace le problème.** Ton menu déroulant est fait de vrais `<button>` et
d'une vraie liste, tout est sémantique — mais quand il s'ouvre, rien n'annonce qu'il est
ouvert, et la touche Échap ne le ferme pas. Ici, aucune balise HTML ne porte la notion
« déployé ou replié » : il faut la déclarer soi-même avec `aria-expanded`, et gérer le
clavier. C'est la limite honnête de la sémantique native — elle couvre les éléments, pas
les comportements composés. La règle qui en découle vaut pour toute la suite : utilise ce
que le HTML sait faire, et n'écris à la main que ce qu'il ne sait pas.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Tu as appris que `<div>` n'est pas sémantique. Tu remplaces tous tes `<div>` par des
   `<section>`. Qu'as-tu amélioré ?
2. Ton sous-titre doit être plus petit. Tu passes de `<h2>` à `<h4>`. Quel est le
   problème, et comment l'aurais-tu résolu ?
3. Un `<div onclick>` stylisé en bouton : cite trois comportements que tu viens de
   perdre.
4. Pourquoi `<main>` ne doit-il apparaître qu'une fois ?

## ✅ Correction attendue

**La démarche.** Devant chaque élément, poser une seule question : *qu'est-ce que c'est ?*
— pas *à quoi je veux qu'il ressemble*. La réponse désigne la balise ; le CSS s'occupe du
reste.

**L'erreur probable, et c'est une règle à moitié apprise qui produit un résultat pire que
le point de départ.** Remplacer tous les `<div>` par des `<section>` **dégrade**
l'accessibilité au lieu de l'améliorer.

`<section>` n'est pas « un `<div>` de meilleure qualité ». C'est un élément qui affirme
quelque chose : *ceci est une région thématique de la page*. Les outils d'assistance la
prennent au mot et l'ajoutent au plan du document. Une page avec quarante `<section>`
présente donc à un utilisateur de lecteur d'écran quarante régions à parcourir, dont
trente-cinq n'ont aucune existence pour lui. Le plan devient inutilisable — et il l'était
moins avec des `<div>`.

Pire, une `<section>` sans **nom accessible** — sans titre ni `aria-label` — n'est
souvent même pas annoncée comme une région : on a payé le bruit sans obtenir le repère.

Le piège séduit parce que la règle apprise est vraie dans un sens et fausse dans l'autre.
« Utilise l'élément qui porte le sens » ne signifie pas « n'utilise jamais d'élément
neutre ». **`<div>` est le bon choix quand il n'y a rien à signifier** : un conteneur de
mise en page, un wrapper pour une grille, un groupe purement visuel. Un `<div>` là où il
n'y a pas de sens est correct ; une `<section>` là où il n'y en a pas est un mensonge
adressé aux outils qui te font confiance.

Le test qui tranche : *est-ce que je peux donner un titre à ce bloc ?* Si oui, c'est
peut-être une `<section>` — et alors donne-lui ce titre. Si non, c'est un `<div>`.

**Sur les autres questions.** Passer de `<h2>` à `<h4>` pour obtenir une taille plus
petite casse le **plan** du document : un lecteur d'écran qui navigue de titre en titre
comprend qu'il manque un niveau et que la structure est incohérente. La taille est
l'affaire du CSS — `h2 { font-size: 1.1rem }` règle le problème sans toucher au sens. La
hiérarchie décrit l'organisation des idées, pas l'apparence.

Un `<div onclick>` perd au minimum : **le focus clavier** (Tab ne l'atteint pas, faute
d'être focalisable), **l'activation** par Entrée et par Espace, et **l'annonce du rôle**
(le lecteur d'écran ne dit pas « bouton », donc l'utilisateur ignore qu'il y a une action
possible). S'y ajoutent l'état désactivé, la participation à la soumission d'un
formulaire, et le comportement au clic droit. Tout cela est gratuit avec `<button>`, et
demande une vingtaine de lignes fragiles à reconstituer.

Enfin, `<main>` est unique parce que c'est un **repère de destination** : il permet le
« aller au contenu principal », le raccourci le plus utilisé par ceux qui naviguent au
clavier ou au lecteur d'écran. Deux `<main>`, et la destination devient ambiguë : le
raccourci ne sait plus où aller, et le seul mécanisme qui permettait de sauter la
navigation cesse de fonctionner.

**Alternative défendable.** `<div>` avec un `role` ARIA explicite est parfois nécessaire
— pour des composants qui n'ont pas d'équivalent natif, un onglet, un arbre. C'est
légitime **et** coûteux : le rôle ARIA n'apporte que l'annonce, jamais le comportement,
qu'il faut alors écrire entièrement. La première règle d'ARIA reste : ne pas utiliser
ARIA quand un élément natif existe.

**Vérifie seul, sans corrigé** :
1. Ouvre ta page et navigue uniquement au clavier. Ce que tu ne peux pas atteindre est
   inaccessible, sans exception.
2. Liste tes titres dans l'ordre. Le plan obtenu ressemble-t-il à une table des matières
   sensée ?
3. Compte tes `<section>`. Peux-tu donner un titre à chacune ? Celles pour lesquelles tu
   n'y arrives pas sont des `<div>`.

## ⚠️ Erreurs fréquentes
- La « soupe de div » : `<div>` partout au lieu des repères sémantiques → page muette.
- Choisir un titre par sa TAILLE (`<h3>` « parce que c'est plus petit ») au lieu de son NIVEAU.
- `<div onclick>` ou `<span onclick>` en guise de bouton → cassé au clavier et pour l'assistance.
- Plusieurs `<h1>` ou plusieurs `<main>` sur une page.
- Mettre de la mise en forme dans le HTML (`<b>`, `style="…"`) au lieu de laisser le CSS habiller.

## 🔗 Liens avec le programme
Cette leçon prolonge `/doc/lessons/browser-dom-rendering` (qui introduit le trio HTML/CSS/JS) et
prépare le CSS (`/doc/lessons/css-fundamentals`), les formulaires web et surtout l'accessibilité
(`/doc/lessons/react-accessibility`), qui REPOSE sur un HTML sémantique correct. En React, tu
écriras du JSX qui produit exactement ces balises : les bons réflexes pris ici te suivront.

## 🛠️ Pratique — la page qu'on ne peut pas parcourir

**Contexte.** Voici une page de profil, écrite comme la moitié du web l'est.

```html
<div class="page">
  <div class="top">
    <div class="logo">Réseau Pro</div>
    <div class="menu">
      <div class="lien" onclick="aller('/accueil')">Accueil</div>
      <div class="lien" onclick="aller('/messages')">Messages</div>
    </div>
  </div>
  <div class="contenu">
    <div class="gros-titre">Lina Berger</div>
    <div class="sous">Ingénieure plateforme · Lyon</div>
    <div class="bloc">
      <div class="titre-bloc">À propos</div>
      <div class="texte">Douze ans d'infrastructure…</div>
    </div>
    <div class="bloc">
      <div class="titre-bloc">Expériences</div>
      <div class="item"><div class="titre-item">Architecte</div><div>2021 – aujourd'hui</div></div>
      <div class="item"><div class="titre-item">Développeuse</div><div>2016 – 2021</div></div>
    </div>
    <div class="bouton" onclick="contacter()">Contacter</div>
  </div>
  <div class="bas">© 2026 Réseau Pro</div>
</div>
```

Elle s'affiche parfaitement. Aucun outil ne s'en plaint. Et elle est, littéralement,
**imparcourable** : c'est ce que cette pratique va te faire mesurer avant de la corriger.

**Ta production, en quatre parties.**

**1. Le diagnostic par extraction.** Colle cette page dans un fichier, ouvre-la, et exécute ces
trois sondes dans la console. Publie ce que chacune renvoie.

```js
// a. les repères de la page — ce sur quoi un lecteur d'écran propose de sauter
document.querySelectorAll('header, nav, main, aside, footer').length

// b. le plan du document — la table des matières
[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => h.tagName + ' ' + h.textContent)

// c. tout ce qui est atteignable au clavier
[...document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')].length
```

Pour chacune : le résultat, et **ce que ça signifie pour l'utilisateur**. La sonde (b) est la
plus parlante — c'est exactement la liste qu'un lecteur d'écran propose pour naviguer dans la
page.

**2. La réécriture.** Réécris la page en HTML sémantique. Exigences :

- un seul `<h1>`, et une hiérarchie de titres **sans saut de niveau** ;
- les repères `header` / `nav` / `main` / `footer`, avec un nom sur la navigation s'il y en a
  plusieurs ;
- les faux liens deviennent de vrais `<a href>`, le faux bouton un vrai `<button>` ;
- la liste d'expériences devient une vraie liste, et chaque expérience un `<article>` ;
- les dates utilisent `<time datetime="…">` ;
- **aucune classe CSS supprimée** — l'apparence doit rester identique, c'est la contrainte qui
  rend l'exercice réaliste.

**3. Les mêmes sondes, après.** Rejoue les trois. Publie le tableau avant/après.

**4. Les trois questions.**

- **A.** Pourquoi « Accueil » doit-il être un `<a href>` et « Contacter » un `<button>` ? La
  règle en une phrase, et ce que perd l'utilisateur dans chaque cas si on se trompe.
- **B.** Ta page a-t-elle besoin d'un `<section>` ou d'un `<article>` pour le bloc « À propos » ?
  Justifie — l'un des deux est un mauvais choix ici, et beaucoup les emploient au hasard.
- **C.** Le `<h1>` doit-il être « Réseau Pro » ou « Lina Berger » ? Il n'y a qu'une bonne
  réponse et elle se déduit d'un principe, pas d'un goût.

**Critère de réussite.** (a) Les six mesures (trois sondes × avant/après) sont publiées ;
(b) la sonde (c) passe de 0 à au moins 3 ; (c) le plan de la page se lit comme une table des
matières compréhensible sans voir la page ; (d) les trois questions sont répondues avec un
principe, pas une préférence.

**Durée.** 45 à 60 minutes.

## ✅ Correction

> Les six mesures de cette correction sont **exécutées** : le script
> `scripts/v70-verifications/html-semantique-sondes.mjs` rend les deux versions de la page
> dans Chromium et imprime le résultat des trois sondes pour chacune.

### Partie 1 — ce que disent les sondes, avant

| Sonde | Résultat | Ce que ça signifie |
|---|---|---|
| (a) repères | **0** | un lecteur d'écran ne peut proposer aucun saut : ni « aller au contenu », ni « aller à la navigation ». L'utilisateur doit parcourir la page depuis le début, à chaque visite |
| (b) plan | **`[]`** | la page n'a **aucune** structure. Ni titre, ni sous-titre. Pour un moteur de recherche comme pour un lecteur d'écran, c'est un bloc de texte indifférencié |
| (c) atteignable au clavier | **0** | ni les liens de menu, ni le bouton « Contacter ». La page est en lecture seule pour qui n'a pas de souris — le bouton principal est inatteignable |

Le zéro de la sonde (b) est le plus révélateur. Un lecteur d'écran propose habituellement de
naviguer de titre en titre : c'est le mode de lecture le plus utilisé, l'équivalent du survol
visuel d'une page. Ici, cette navigation ne renvoie rien. Le contenu est présent, il est
correct, et il n'est pas **parcourable**.

Le zéro de la sonde (c) est le plus grave en pratique : l'action principale de la page ne peut
pas être déclenchée.

### Partie 2 — la réécriture

```html
<header class="top">
  <div class="logo">Réseau Pro</div>
  <nav class="menu" aria-label="Navigation principale">
    <a class="lien" href="/accueil">Accueil</a>
    <a class="lien" href="/messages">Messages</a>
  </nav>
</header>

<main class="contenu">
  <h1 class="gros-titre">Lina Berger</h1>
  <p class="sous">Ingénieure plateforme · Lyon</p>

  <section class="bloc" aria-labelledby="t-apropos">
    <h2 class="titre-bloc" id="t-apropos">À propos</h2>
    <p class="texte">Douze ans d'infrastructure…</p>
  </section>

  <section class="bloc" aria-labelledby="t-exp">
    <h2 class="titre-bloc" id="t-exp">Expériences</h2>
    <ul>
      <li><article class="item">
        <h3 class="titre-item">Architecte</h3>
        <p><time datetime="2021">2021</time> – aujourd'hui</p>
      </article></li>
      <li><article class="item">
        <h3 class="titre-item">Développeuse</h3>
        <p><time datetime="2016">2016</time> – <time datetime="2021">2021</time></p>
      </article></li>
    </ul>
  </section>

  <button class="bouton" type="button" onclick="contacter()">Contacter</button>
</main>

<footer class="bas">© 2026 Réseau Pro</footer>
```

Toutes les classes sont conservées : l'apparence est identique au pixel près. C'est le point
qui rend cette correction applicable en vrai — on ne demande pas de refaire le CSS, on demande
de remplacer le contenant.

### Partie 3 — après

| Sonde | Avant | Après |
|---|---|---|
| (a) repères | 0 | **4** (`header`, `nav`, `main`, `footer`) |
| (b) plan | `[]` | `H1 Lina Berger` · `H2 À propos` · `H2 Expériences` · `H3 Architecte` · `H3 Développeuse` |
| (c) atteignable au clavier | 0 | **3** (deux liens, un bouton) |

Lis la colonne « après » de la sonde (b) **sans regarder la page**. Tu sais de qui parle ce
document, quelles sections il contient et ce qu'elles contiennent. C'est précisément
l'expérience d'un utilisateur de lecteur d'écran, et c'est le meilleur test de qualité d'une
structure : **un plan qui se lit seul est une page bien structurée.**

### Question A — lien ou bouton

**La règle : un lien change d'endroit, un bouton déclenche une action.** « Accueil » vous
emmène ailleurs ; « Contacter » fait quelque chose ici.

Ce que perd l'utilisateur si on se trompe :

- **un faux lien** (un `<div>` avec `onclick` qui navigue) : plus d'ouverture dans un nouvel
  onglet, plus de clic milieu, plus de copie d'adresse, plus de survol montrant la destination,
  plus d'indexation de la cible. Toutes ces fonctions viennent de l'attribut `href`, pas du
  clic ;
- **un vrai lien utilisé comme bouton** (`<a href="#">` avec un `onclick`) : le lecteur d'écran
  annonce « lien » et l'utilisateur s'attend à changer de page ; il reçoit une action. Et un
  `href="#"` fait remonter la page en haut si le gestionnaire échoue.

Le raccourci qui tranche : **si tu peux imaginer quelqu'un vouloir l'ouvrir dans un nouvel
onglet, c'est un lien.**

### Question B — `section` ou `article`

`<section>` pour « À propos ». `<article>` serait un mauvais choix, et voici pourquoi.

Un `<article>` est un contenu **autonome** : il garde son sens sorti de son contexte, comme un
billet de blog, un commentaire, une fiche produit, une offre d'emploi. Le test : *peut-on le
publier ailleurs tel quel et le comprendre ?*

« À propos » sans « Lina Berger » ne veut rien dire — c'est une **partie** de la page, pas un
contenu autonome. C'est un `<section>`.

En revanche, chaque **expérience** est un bon `<article>` : « Architecte, 2021 – aujourd'hui »
garde son sens dans une liste de résultats de recherche ou un flux d'actualité. C'est le
découpage retenu dans la correction, et c'est aussi ce qui explique la liste `<ul>` : plusieurs
choses de même nature, dont le **nombre** est une information — un lecteur d'écran annonce
« liste de 2 éléments ».

Dernier point : `<section>` n'apporte réellement quelque chose que s'il est **nommé**. Une
section sans titre associé n'est pas annoncée comme une région et ne vaut pas mieux qu'un
`<div>`. D'où le `aria-labelledby` qui pointe le `<h2>` — on ne duplique pas le titre, on le
désigne.

### Question C — quel `<h1>`

**« Lina Berger ».**

Le principe : le `<h1>` nomme **le contenu de cette page**, pas le site. Le nom du site est
déjà dans le titre de l'onglet, dans l'en-tête, dans l'URL. S'il est aussi le `<h1>`, alors
toutes les pages du site ont le même titre principal — et le plan de chaque page commence par
une information sans valeur.

Le test : *si je ne lis que le `<h1>`, est-ce que je sais où je suis ?* « Réseau Pro » ne le dit
pas ; « Lina Berger » le dit.

C'est aussi la raison du `<h2>` pour les sections : un saut direct du `<h1>` au `<h3>` casserait
la hiérarchie, et les niveaux de titre décrivent **l'imbrication logique**, jamais la taille du
texte. La taille est une affaire de CSS.

### La mauvaise solution plausible

Garder les `<div>` et ajouter des rôles ARIA : `role="banner"`, `role="navigation"`,
`role="main"`, `role="heading" aria-level="1"`.

Techniquement, la sonde (a) remonterait. Mais on a écrit quatre attributs pour obtenir ce que
quatre balises donnent gratuitement, et surtout : `role="heading"` sur un `<div>` ne le rend
pas cliquable au clavier, `role="link"` ne crée pas d'`href`. La sonde (c) resterait à **0**.

La première règle d'ARIA est de ne pas utiliser ARIA quand une balise fait le travail. Ici, les
balises font tout le travail, et le HTML final est plus court que l'original.

### Généralisation

La sonde (b) — extraire le plan des titres — est le contrôle qualité le plus rentable qui soit
sur n'importe quelle page web, et il tient en une ligne de console. Un plan illisible signale
en même temps un problème d'accessibilité, un problème de référencement, et le plus souvent un
problème de **conception** : si tu n'arrives pas à écrire une hiérarchie de titres cohérente,
c'est en général que la page elle-même n'a pas de structure claire.

C'est le cas particulier d'un principe qui vaut partout : **une structure explicite est ce qui
rend un contenu exploitable par autre chose que des yeux humains** — un lecteur d'écran, un
moteur de recherche, un aperçu de partage, un lecteur de flux, un outil d'extraction. Le HTML
sémantique n'est pas une politesse envers les personnes handicapées : c'est ce qui rend une page
lisible par des machines, et les personnes handicapées en sont les premières bénéficiaires.

## 📚 Vocabulaire
**sémantique** · **repère / landmark** (`header`/`nav`/`main`/`footer`) · **`article`/`section`/`aside`**
· **hiérarchie de titres** (`h1`→`h6`) · **`button` vs `a`** · **liste** (`ul`/`ol`/`li`) ·
**`div`/`span`** (boîtes neutres) · **`lang`/`charset`**.

## 🧾 À retenir
Le HTML décrit le SENS, pas l'apparence. Choisis toujours la balise qui exprime ce qu'un contenu
EST : repères de page pour les grandes régions, `h1`→`h6` pour le plan, `<button>` pour une action
et `<a>` pour un lien, listes pour les énumérations. Une page sémantique est accessible, référencée
et maintenable par défaut ; la `<div>` est le dernier recours, pas le réflexe. Le sens d'abord, le
style ensuite (en CSS).
