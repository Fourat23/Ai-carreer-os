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

## Mini-exercice
Reprends une page faite de `<div>` (ou pars d'une page de profil : nom, menu, bio, liens) et
réécris-la avec les repères sémantiques (`header`/`nav`/`main`/`footer`), une hiérarchie de titres
correcte, et de vrais `<a>`/`<button>`. Vérifie mentalement : un lecteur d'écran saurait-il nommer
chaque région ? Peux-tu tout atteindre au clavier ? Pratique associée : `web-semantic`, `web-nav`,
`web-card`.

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
