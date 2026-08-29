<!-- keep -->
# Leçon — Accessibilité des interfaces web

## 🌍 Le problème d'abord
Tu construis une interface qui marche… pour toi, à la souris, avec une bonne vue. Mais une
partie de tes utilisateurs navigue au clavier (sans souris), écoute la page via un lecteur
d'écran (parce qu'ils sont aveugles ou malvoyants), ou distingue mal les couleurs. Si tu as
fabriqué tes boutons avec des `<div>` stylés et cliquables, ces personnes ne peuvent tout
simplement pas les utiliser : rien ne se passe au clavier, le lecteur d'écran n'annonce
rien. L'**accessibilité** (souvent abrégée **a11y**) consiste à construire des interfaces
utilisables par TOUS. Bonne nouvelle : l'essentiel s'obtient gratuitement en écrivant du HTML
correct — pas en ajoutant une couche compliquée à la fin. Cette leçon te montre comment.

## 🎯 Objectif
Savoir rendre une interface **utilisable au clavier et au lecteur d'écran** : choisir le HTML
sémantique, garantir des noms accessibles (textes alternatifs, labels), gérer le focus et le
contraste, utiliser ARIA avec parcimonie — et tester ce que l'utilisateur PERÇOIT, pas les
détails d'implémentation.

## 🧩 Prérequis
Tu dois connaître le HTML, le DOM et les événements (`/doc/lessons/browser-dom-rendering`),
car l'accessibilité repose d'abord sur le bon choix de balises. Une familiarité avec les
composants React (`/doc/lessons/react-fundamentals`) aide pour les exemples, mais les
principes valent pour toute interface web. Aucune connaissance préalable d'ARIA n'est
supposée.

## 🧠 Modèle mental
Une page a deux « lectures » : la lecture VISUELLE (ce que voit une personne voyante) et la
lecture PROGRAMMATIQUE (ce que le navigateur expose aux technologies d'assistance — clavier,
lecteur d'écran). L'accessibilité, c'est faire en sorte que ces deux lectures disent la MÊME
chose. Le HTML sémantique le fait presque tout seul : un vrai `<button>` est déjà focusable,
activable à Entrée/Espace, et annoncé « bouton » par le lecteur d'écran. Chaque fois que tu
remplaces une balise sémantique par un `<div>`, tu casses la lecture programmatique et tu
dois tout reconstruire à la main.

## 💡 Pourquoi c'est important
C'est d'abord une question d'inclusion : exclure des utilisateurs par négligence n'est pas
acceptable. C'est aussi une obligation LÉGALE dans de nombreux contextes (secteur public,
grandes entreprises). Et c'est un marqueur de professionnalisme : un recruteur repère
immédiatement un candidat qui met des `<div onclick>` partout. Enfin, une interface
accessible est souvent plus claire, mieux structurée et plus facile à tester pour tout le
monde.

## Explication complète

### Le HTML sémantique fait 80 % du travail
Utilise la balise qui porte le SENS de l'élément : `<button>` pour une action, `<a>` pour un
lien, `<nav>` pour la navigation, `<h1>`–`<h6>` pour la hiérarchie des titres, `<label>` pour
étiqueter un champ, `<ul>/<li>` pour une liste. Ces balises apportent GRATUITEMENT le
comportement clavier, le rôle annoncé et la navigation par repères. Le réflexe « je stylise
un `<div>` en bouton » est l'erreur d'accessibilité n°1.

### Noms accessibles : que « voit » un lecteur d'écran ?
Chaque élément interactif doit avoir un NOM que le lecteur d'écran peut annoncer :
- une image porteuse de sens a un texte alternatif : `<img alt="Graphique des ventes 2024">`
  (une image purement décorative prend un `alt=""` vide, pour être ignorée) ;
- un champ de formulaire est relié à un `<label>` (`<label for="email">` + `<input id="email">`) ;
- un bouton n'affichant qu'une icône a besoin d'un nom : `aria-label="Fermer"`.
Sans nom accessible, l'utilisateur entend « bouton » sans savoir ce qu'il fait.

### Clavier et focus
Tout ce qui est cliquable doit être utilisable au clavier : atteignable par Tab, activable
par Entrée/Espace. Les éléments sémantiques le sont déjà ; les faux boutons en `<div>` ne le
sont pas. L'ORDRE de focus doit suivre l'ordre logique de lecture, et le focus doit rester
VISIBLE (ne supprime pas le contour de focus sans le remplacer).

### Gérer le focus : `tabindex` et l'ordre de tabulation
L'ordre de tabulation suit l'ordre du DOM — c'est pourquoi un DOM bien structuré est déjà à
moitié accessible. `tabindex` l'ajuste, avec prudence :
- `tabindex="0"` : rend focusable un élément qui ne l'est pas nativement (rare — préfère une
  vraie balise interactive), en le plaçant dans l'ordre naturel.
- `tabindex="-1"` : focusable par script (`element.focus()`) mais PAS par Tab — utile pour
  déplacer le focus vers une zone (message d'erreur, titre de modale) sans l'ajouter au parcours.
- `tabindex` **positif** (`1`, `2`…) : à PROSCRIRE — il casse l'ordre naturel et devient
  ingérable. Le bon ordre se règle en réordonnant le DOM, pas avec des numéros.

### Gérer le focus : modales et changements de vue
Quand tu ouvres une **modale**, trois gestes non négociables : (1) DÉPLACER le focus dans la
modale (sur son titre ou son premier champ) ; (2) PIÉGER le focus à l'intérieur tant qu'elle
est ouverte (Tab ne doit pas partir derrière) ; (3) fermer avec **Échap** et RENDRE le focus à
l'élément qui l'avait ouverte. Sans cela, un utilisateur au clavier « tombe » derrière la modale
et se perd. Même logique après une navigation : place le focus sur le titre de la nouvelle vue.

### Mouvement et préférences utilisateur
Certaines animations (défilements, transitions fortes) provoquent gêne ou malaise. Respecte le
réglage système via la media query `@media (prefers-reduced-motion: reduce)` : réduis ou
supprime les animations non essentielles. L'accessibilité, c'est aussi respecter ce que
l'utilisateur a DÉJÀ demandé à son système.

### Contraste et couleur
Le texte doit avoir un contraste suffisant avec son fond (les recommandations WCAG donnent
des seuils chiffrés). Et ne transmets JAMAIS une information par la seule couleur : « les
champs en rouge sont invalides » exclut les daltoniens — ajoute une icône ou un message.

### ARIA : avec parcimonie
**ARIA** est un ensemble d'attributs (`role`, `aria-label`, `aria-expanded`…) qui complètent
la sémantique quand le HTML natif ne suffit pas (composants riches : onglets, menus). Règle
d'or : « pas d'ARIA vaut mieux qu'un mauvais ARIA ». N'ajoute ARIA que si aucune balise native
ne convient, et jamais pour contredire la sémantique. Un `<button>` natif n'a besoin
d'aucun `role="button"`.

### Tester l'accessibilité (et tester le bon niveau)
Trois tests simples et gratuits : navigue la page ENTIÈREMENT au clavier ; vérifie que chaque
image/bouton a un nom ; passe un vérificateur automatique (comme axe) qui détecte les
manques évidents. Côté tests automatisés de composants, la bonne pratique rejoint
l'accessibilité : sélectionne les éléments par leur RÔLE et leur nom accessible (« le bouton
nommé Envoyer ») plutôt que par une classe CSS interne — tu testes alors ce que l'utilisateur
perçoit, pas un détail d'implémentation (voir `/doc/lessons/testing-foundations`).

## Concepts clés
Accessibilité (a11y) · HTML sémantique · nom accessible (`alt`, `<label>`, `aria-label`) ·
navigation clavier / focus visible / ordre de focus · contraste / information non portée par
la seule couleur · ARIA (rôle, avec parcimonie) · test par rôle et nom accessible.

## 🧭 Exemple guidé
Un bouton icône, mal puis bien fait :
```tsx
// ❌ inaccessible : pas focusable, pas activable au clavier, aucun nom annoncé
<div className="btn" onClick={fermer}>✕</div>

// ✅ accessible : vrai bouton (clavier gratuit) + nom pour le lecteur d'écran
<button type="button" onClick={fermer} aria-label="Fermer la fenêtre">✕</button>
```
Le second est atteignable par Tab, s'active à Entrée/Espace, et est annoncé « Fermer la
fenêtre, bouton ». Aucune ligne de JavaScript en plus — juste la bonne balise et un nom.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Tu ajoutes `role="button"` et `tabIndex={0}` à ton `<div>` cliquable. Est-il
   accessible ?
2. Ton audit automatique ne remonte aucune erreur. Ton interface est-elle accessible ?
3. Une image de graphique porte `alt="graphique"`. Est-ce suffisant ?
4. Le contour de focus « fait moche » sur ta maquette. Que fais-tu ?

## ✅ Correction attendue

**La démarche.** Choisir l'élément natif d'abord, ARIA seulement pour ce qu'aucun élément
natif ne couvre. L'ordre compte : ARIA ajoute de l'information, jamais du comportement.

**L'erreur probable, et elle est commise avec les meilleures intentions.**
`role="button"` et `tabIndex={0}` sur un `<div>` : la réponse spontanée est « oui,
maintenant il a le rôle et il est focusable, c'est bon ». Il ne l'est pas — **il ne
s'active pas au clavier.**

Ce qui manque, et qu'il faut écrire soi-même :

```tsx
// ❌ ce qu'on croit suffisant
<div role="button" tabIndex={0} onClick={fermer}>✕</div>

// ce qu'il faudrait VRAIMENT écrire pour égaler un <button>
<div
  role="button"
  tabIndex={0}
  onClick={fermer}
  onKeyDown={(e) => {
    if (e.key === 'Enter') fermer();
    if (e.key === ' ') { e.preventDefault(); fermer(); }  // sinon la page défile
  }}
>✕</div>
```

Et ce n'est encore pas équivalent : il manque l'état désactivé, la soumission de
formulaire, le comportement au clic droit, et la gestion correcte du clic *long*. Un
`<button>` fournit tout cela, gratuitement, testé par tous les navigateurs.

Le piège séduit pour une raison structurelle : **ARIA a le nom du domaine.** Quand on
cherche à rendre une interface accessible, on trouve ARIA, et ajouter un attribut ARIA
donne le sentiment très net d'avoir fait de l'accessibilité. Or ARIA ne fait **que**
décrire : il dit au lecteur d'écran « traite ceci comme un bouton ». Il ne rend rien
focusable, ne câble aucune touche, ne change aucun comportement. Un `role="button"` sans
gestion du clavier crée exactement la pire situation : **l'utilisateur est informé qu'il
y a un bouton, et ne peut pas l'actionner.** C'est le sens de la première règle d'ARIA :
ne pas utiliser ARIA.

**Sur les autres questions.** Un audit automatique sans erreur ne prouve presque rien :
les outils détectent bien les contrastes, les `alt` manquants, les champs sans label —
soit environ un tiers des problèmes réels. Ils ne peuvent pas juger si un `alt` est
*pertinent*, si l'ordre de focus est *logique*, si un message d'erreur est *annoncé*, ou
si une modale *piège* correctement le focus. Le test qui vaut vraiment tient en une
phrase : **range la souris et fais la tâche complète au clavier.**

`alt="graphique"` est insuffisant : il décrit le contenant, pas le contenu. L'utilisateur
apprend qu'il y a un graphique, ce qu'il devinait, et rien de ce qu'il dit. Un `alt` utile
porte **l'information** — « Ventes 2024 : croissance de 12 % au premier trimestre, recul
en août » — ou renvoie à une description longue quand les données sont riches.

Enfin, le contour de focus ne se supprime jamais : il se **remplace**. `outline: none`
seul rend l'interface inutilisable au clavier — on ne sait plus où l'on est. On dessine
donc un indicateur conforme à la maquette, visible sur tous les fonds, en s'appuyant sur
`:focus-visible` pour qu'il n'apparaisse qu'à la navigation clavier et jamais au clic
souris. La demande esthétique est légitime ; c'est la méthode qui doit changer.

**Alternative défendable.** Les bibliothèques de composants sans style (*headless*)
fournissent des primitives accessibles — modale, menu, onglets — déjà correctes sur le
clavier, le focus et les annonces. Les utiliser plutôt que réécrire est souvent le bon
choix : ces comportements sont bien plus subtils qu'ils n'en ont l'air, et les
réimplémenter mal est la règle plutôt que l'exception.

**Vérifie seul, sans corrigé** :
1. Débranche ta souris et accomplis le parcours principal de ton application. Ce que tu
   ne peux pas faire, un utilisateur au clavier ne le peut pas non plus.
2. Cherche `role=` dans ton code. Chaque occurrence sur un élément non natif est une
   dette de comportement à écrire à la main.
3. Tabule dans ta page. Vois-tu toujours où tu es ? L'ordre suit-il la lecture ?

## ⚠️ Erreurs fréquentes
- Faux boutons/liens en `<div>` cliquables : inutilisables au clavier et muets pour le
  lecteur d'écran.
- Images sans `alt` (ou icônes-boutons sans `aria-label`) : contenu invisible pour
  l'assistance.
- Supprimer le contour de focus « parce que c'est moche » sans le remplacer : navigation
  clavier impossible à suivre.
- Modale sans gestion du focus : focus non déplacé, non piégé, non rendu à la fermeture (Échap
  ignoré) → l'utilisateur clavier se perd derrière la modale.
- `tabindex` positif pour « corriger » l'ordre : casse tout ; réordonne le DOM à la place.
- Ignorer `prefers-reduced-motion` : animations imposées à qui a demandé de les réduire.
- Information transmise par la seule couleur (rouge = erreur) : ajoute texte/icône.
- Empiler des attributs ARIA pour « faire accessible » alors qu'une balise native suffisait.

## 🔗 Liens avec le programme
Cette leçon prolonge `/doc/lessons/browser-dom-rendering` (le HTML sémantique) et outille
`/doc/lessons/react-fundamentals` et `/doc/lessons/react-composition-architecture` (des
composants accessibles par construction). La façon de tester « par rôle et nom accessible »
rejoint `/doc/lessons/testing-foundations`. L'interface de tes apps IA (mois 8+) doit être
accessible comme toute autre.

## Mini-exercice
Prends une petite interface que tu as écrite. (1) Navigue-la uniquement au clavier : tout est-il
atteignable et activable ? (2) Remplace tout faux bouton/lien par la balise sémantique
correcte. (3) Ajoute les noms accessibles manquants (`alt`, `<label>`, `aria-label`). (4)
Vérifie qu'aucune information n'est portée par la seule couleur. Note ce que tu as dû corriger.

## 📚 Vocabulaire
**accessibilité (a11y)** · **HTML sémantique** · **nom accessible** · **texte alternatif
(`alt`)** · **`<label>`** · **focus / ordre de tabulation** · **`tabindex` (0 / -1)** ·
**piège de focus (modale)** · **`prefers-reduced-motion`** · **contraste** · **ARIA** ·
**rôle** · **lecteur d'écran**.

## 🧾 À retenir
L'accessibilité fait qu'une interface est utilisable par tous — au clavier, au lecteur
d'écran, avec un contraste suffisant. L'essentiel s'obtient GRATUITEMENT avec du HTML
sémantique : un vrai `<button>` vaut mieux qu'un `<div>` stylé. Donne un nom accessible à
chaque élément interactif, garde le focus visible, ne transmets pas d'information par la seule
couleur, et n'utilise ARIA qu'en dernier recours. Teste par rôle et nom accessible : tu
valides alors ce que l'utilisateur perçoit vraiment.
