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

## 🧭 Exemple guidé — la même fenêtre modale, parcourue sans souris

L'accessibilité s'enseigne mal en listant des attributs. Elle s'apprend en **faisant la
tâche autrement** : range la souris, et essaie d'utiliser ce que tu as construit. Ce qui
paraissait une exigence administrative devient, en trente secondes, une évidence.

Prenons la fenêtre modale « Supprimer le projet », telle qu'on l'écrit spontanément.

```tsx
{ouverte && (
  <div className="fond" onClick={fermer}>
    <div className="modale">
      <div className="titre">Supprimer le projet</div>
      <p>Cette action est définitive.</p>
      <div className="btn annuler" onClick={fermer}>Annuler</div>
      <div className="btn danger" onClick={supprimer}>Supprimer</div>
      <div className="croix" onClick={fermer}>✕</div>
    </div>
  </div>
)}
```

À la souris, c'est parfait. Suivons maintenant un utilisateur au clavier, touche par touche.

### Le parcours, touche par touche

**Il ouvre la modale.** Le focus ne bouge pas : il est resté sur le bouton « Supprimer »
de la page, derrière. Un utilisateur de lecteur d'écran n'entend rien du tout — une boîte
est apparue quelque part, et rien ne le lui dit.

**Il appuie sur Tab.** Le focus passe au lien suivant… **de la page en arrière-plan**. La
modale n'est nulle part dans l'ordre de tabulation, parce qu'un `<div>` n'est pas focusable.
Il tabule dix fois et ne rencontre jamais ni « Annuler », ni « Supprimer », ni la croix.

**Il appuie sur Échap.** Rien. Aucune touche n'est écoutée.

**Il essaie de cliquer au clavier sur ce qu'il croit être un bouton.** Il n'y arrive pas :
il n'a jamais pu y arriver, faute d'avoir pu s'y rendre.

Bilan : cette modale est **entièrement inutilisable** sans souris. Pas dégradée : inutilisable.
Et rien dans le code ne signale un problème — il n'y a ni avertissement, ni erreur, ni test
qui échoue.

### La correction, dans l'ordre de gravité

**1. Utiliser les balises natives.** C'est la correction la plus rentable de toute
l'accessibilité, et c'est une suppression, pas un ajout.

```tsx
<h2>Supprimer le projet</h2>
<button type="button" onClick={fermer}>Annuler</button>
<button type="button" onClick={supprimer}>Supprimer</button>
<button type="button" onClick={fermer} aria-label="Fermer la fenêtre">✕</button>
```

Ce que ces quatre lignes apportent, sans une seule ligne de JavaScript en plus :

| Comportement | Fourni par |
|---|---|
| atteignable par Tab | `<button>` |
| activable par Entrée et Espace | `<button>` |
| annoncé « Annuler, bouton » | `<button>` |
| annoncé comme titre de niveau 2 | `<h2>` |
| état désactivé, focus visible, clic long, menu contextuel | `<button>` |

Le `aria-label` sur la croix mérite une explication, car c'est le seul ARIA de tout
l'exemple : le contenu du bouton est le caractère `✕`, que le lecteur d'écran annoncerait
« multiplication » ou rien du tout. `aria-label` **remplace** le nom accessible par un texte
utile. C'est l'usage légitime d'ARIA : ajouter une **information** qu'aucune balise ne peut
porter. ARIA n'ajoute jamais de **comportement**.

**2. Dire que c'est une fenêtre modale.**

```tsx
<div role="dialog" aria-modal="true" aria-labelledby="titre-modale">
  <h2 id="titre-modale">Supprimer le projet</h2>
```

`aria-labelledby` désigne l'élément qui nomme la boîte : à l'ouverture, l'utilisateur
entend « Supprimer le projet, boîte de dialogue » au lieu du silence. C'est le nom de la
boîte, et il est déjà à l'écran — on ne le duplique pas, on le **pointe**.

**3. Déplacer le focus à l'ouverture, et le rendre à la fermeture.**

```tsx
const ref = useRef<HTMLButtonElement>(null);
const declencheur = useRef<Element | null>(null);

useEffect(() => {
  if (!ouverte) return;
  declencheur.current = document.activeElement;   // d'où l'on vient
  ref.current?.focus();                           // on entre dans la modale
  return () => (declencheur.current as HTMLElement)?.focus();   // on rend le focus
}, [ouverte]);
```

Le retour est la moitié qu'on oublie systématiquement. Sans lui, la modale se ferme et le
focus repart au début du document : l'utilisateur doit re-tabuler jusqu'à l'endroit où il
était. Une fois, c'est agaçant ; vingt fois dans une journée de travail, c'est une raison de
changer d'outil.

Note que ce nettoyage est exactement le motif de la leçon sur les effets — ce que l'effet a
déplacé, son nettoyage le remet.

**4. Écouter Échap, et retenir le focus.**

Fermer sur Échap est une convention que tout le monde connaît. Retenir le focus — l'empêcher
de sortir de la modale par Tab tant qu'elle est ouverte — est plus subtil et se fait mal la
première fois : il faut trouver les éléments focusables, boucler du dernier au premier, gérer
`Shift+Tab`, et tenir compte de ceux qui sont désactivés ou masqués.

C'est précisément à ce point que la réponse professionnelle n'est plus « je l'écris » mais
**« j'utilise une primitive éprouvée »**. Une modale correcte, c'est une dizaine de
comportements dont trois sont franchement délicats. Les réimplémenter par principe n'est pas
de la rigueur, c'est du travail refait — mal, en général.

### Ce que le parcours a montré

Relis la liste des corrections. La première — remplacer trois `<div>` par trois `<button>` —
résout à elle seule la majorité des problèmes, et c'est celle qui **retire** du code.

C'est l'enseignement central de cette leçon, et il est contre-intuitif : l'accessibilité
n'est pas une couche qu'on ajoute par-dessus. C'est très souvent ce qui reste quand on
arrête de réécrire à la main ce que le navigateur fait déjà correctement.

Et la méthode de diagnostic tient en une phrase, qui ne demande aucun outil : **fais la
tâche complète au clavier.** Ce que tu ne peux pas faire, un utilisateur au clavier ne peut
pas le faire non plus.

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

## 🛠️ Pratique — le parcours au clavier, chronométré et écrit

**Contexte.** Prends une interface réelle avec au moins un formulaire et un élément qui
s'ouvre — menu, modale, panneau. Ton application, ou n'importe quel site que tu utilises.
Définis **une tâche complète** qui a du sens pour un utilisateur : « créer un compte », «
ajouter un article au panier et le supprimer », « filtrer une liste puis ouvrir un détail ».

**La contrainte est physique : débranche ta souris, ou pose-la hors d'atteinte.** Cette
pratique ne fonctionne pas si tu « fais comme si ». La main revient au pavé tactile sans que
tu t'en aperçoives, et c'est justement l'automatisme qui empêche de voir le problème.

**Ta production : un rapport de parcours.**

**1. La tâche et le point de départ.** Une phrase pour la tâche, et l'URL ou l'écran de
départ.

**2. Le journal des touches.** Un tableau, une ligne par étape :

| # | Touche | Où va le focus (élément visible à l'écran) | Ce qui est annoncé, si tu utilises un lecteur d'écran | Blocage ? |

Note **tout**, y compris les tabulations qui ne font rien de remarquable. Le nombre de
lignes est en soi une donnée : si atteindre le bouton principal demande 23 tabulations, tu
viens de mesurer quelque chose que personne dans l'équipe ne sait.

**3. Les trois questions à chaque étape**, à répondre par oui/non dans le journal ou juste
après :
- **Sais-tu où tu es ?** (le focus est-il visible, y compris sur fond coloré)
- **L'ordre est-il celui de la lecture ?** (le focus ne saute pas d'un bout à l'autre)
- **Peux-tu revenir en arrière ?** (Échap, Maj+Tab, fermeture)

**4. Le classement des blocages.** Trois catégories, et c'est le cœur du rapport :

| Catégorie | Définition |
|---|---|
| **bloquant** | la tâche est impossible à terminer au clavier |
| **majeur** | la tâche est possible mais l'utilisateur peut se perdre ou se tromper |
| **mineur** | inconfort, sans risque d'erreur ni de blocage |

Pour chaque blocage : l'élément en cause, ce qui manque exactement (balise native, nom
accessible, gestion du focus, touche non écoutée), et la correction — en code, une à cinq
lignes.

**5. Le contrôle de la couleur.** Trouve une information portée par la **seule** couleur —
un statut, une erreur, une ligne mise en évidence, un lien dans un paragraphe. Décris ce que
perd quelqu'un qui ne distingue pas ces teintes, et la correction (une forme, un mot, une
icône, un soulignement).

**6. La comparaison à l'outil.** Passe un audit automatique sur la même page. Compare :
combien de tes blocages l'outil a-t-il vus ? Combien a-t-il signalé de choses que ton
parcours n'a pas jugées gênantes ? Écris les deux nombres.

**Critère de réussite.** (a) Le journal couvre la tâche entière, pas seulement l'écran
d'entrée ; (b) au moins un blocage est classé `bloquant` ou tu expliques pourquoi il n'y en
a aucun ; (c) chaque correction cite une balise ou un attribut précis ; (d) la partie 6
donne deux nombres.

**Durée.** 45 à 60 minutes.

## ✅ Correction

Cette pratique portant sur l'interface que tu choisis, la correction donne le corrigé de
référence, les résultats attendus, et l'interprétation de la partie 6.

### La démarche : pourquoi le clavier avant tout le reste

Le clavier n'est pas une population d'utilisateurs parmi d'autres. C'est la **couche de
base** dont dépendent presque toutes les autres : un lecteur d'écran navigue au clavier ; une
commande vocale déclenche des actions clavier ; un utilisateur au pavé tactile cassé ou à la
souris capricieuse tabule. Ce qui n'est pas atteignable au clavier n'est atteignable par
aucun de ces chemins.

D'où l'ordre : le clavier d'abord, les annonces ensuite, les attributs ARIA en dernier — et
seulement pour ce qu'aucune balise ne dit.

### Les cinq blocages que tu vas probablement trouver

| # | Symptôme dans ton journal | Cause | Correction |
|---|---|---|---|
| 1 | une action jamais atteinte par Tab | `<div onClick>` | `<button type="button">` |
| 2 | le focus disparaît de l'écran | modale ouverte sans déplacer le focus | `ref.current?.focus()` à l'ouverture, retour au déclencheur à la fermeture |
| 3 | Tab quitte la modale et parcourt la page derrière | pas de retenue du focus | boucler le focus, ou une primitive éprouvée |
| 4 | on ne voit plus où l'on est | `outline: none` dans le CSS | un indicateur `:focus-visible` visible sur tous les fonds |
| 5 | un champ dont on ne sait pas ce qu'il attend | pas de `<label>` associé | `<label htmlFor>` ou `aria-label` |

Le numéro 1 est de loin le plus fréquent, et c'est celui dont la correction **retire** du
code. Le numéro 4 est le plus vite créé : une seule ligne de CSS écrite pour des raisons
esthétiques rend l'interface inutilisable sans souris, et cette ligne est presque toujours
copiée d'une réinitialisation trouvée en ligne.

### La partie 4 : pourquoi classer, et pas seulement lister

Un rapport qui liste douze problèmes à plat ne sera pas traité. Un rapport qui dit « un
bloquant, trois majeurs, huit mineurs » est traité, parce qu'il donne un ordre.

La ligne de partage à retenir : **bloquant = la tâche ne peut pas être terminée**. Ce n'est
pas « c'est difficile », c'est « c'est impossible ». Un bouton d'envoi de formulaire
inatteignable est bloquant ; un ordre de tabulation illogique dans un pied de page est
mineur. Confondre les deux fait perdre la crédibilité du rapport entier.

### La partie 5 : ce que la couleur seule ne dit pas

Cas typique : une colonne « Statut » où le vert veut dire *payé* et le rouge *impayé*, sans
aucun texte. Pour environ un homme sur douze et une femme sur deux cents, ces deux colonnes
sont identiques. Ce n'est pas une gêne : c'est une **information absente**.

Correction : ajouter le mot. « Payé » / « Impayé », en gardant la couleur si elle plaît. La
couleur devient alors un **renfort** de l'information, ce qu'elle doit toujours être, et
jamais son support unique.

Le même raisonnement s'applique aux liens dans un paragraphe : si seule la couleur les
distingue du texte, ils sont invisibles pour une partie des lecteurs. Le soulignement, longtemps
jugé démodé, existe exactement pour ça.

### La partie 6 : ce que le chiffre veut dire

Le résultat typique : l'outil automatique voit **un à deux** de tes cinq blocages — en
général le contraste et le label manquant — et signale trois ou quatre points que ton
parcours n'a pas jugés gênants.

C'est le résultat attendu, et il ne disqualifie pas l'outil : il en délimite l'usage. Un
outil automatique vérifie des propriétés **statiques** du document — un attribut présent, un
rapport de contraste, un identifiant unique. Il ne peut pas juger d'un **parcours** : que
l'ordre de focus soit logique, qu'un message d'erreur soit annoncé au bon moment, qu'une
modale rende le focus. Ce sont des propriétés de la séquence, pas de la page.

La conclusion à écrire dans ton rapport : *l'outil couvre les défauts qu'on peut constater
sans utiliser le produit ; le parcours couvre ceux qu'on ne peut constater qu'en l'utilisant.*
Les deux sont nécessaires, et un projet qui n'a que le premier croit être accessible.

### La mauvaise solution plausible

Après ce rapport, la tentation est d'ajouter des attributs ARIA partout — `role`,
`aria-label`, `aria-describedby` — parce que c'est le vocabulaire du domaine et que ça donne
le sentiment d'agir.

Or ARIA ne rend rien focusable et ne câble aucune touche. Un `role="button"` posé sur le
`<div>` du blocage n° 1 produit le pire résultat possible : le lecteur d'écran annonce « bouton »
à un utilisateur qui ne peut ni l'atteindre ni l'actionner. On a transformé un élément
invisible en une promesse non tenue.

L'ordre correct est toujours : **balise native d'abord, comportement clavier ensuite, ARIA en
dernier et seulement pour l'information manquante.**

### Généralisation

Ce que cette pratique installe, au-delà de l'accessibilité, c'est le réflexe de **faire la
tâche dans les conditions de quelqu'un d'autre**. On ne découvre pas qu'une interface est
inutilisable au clavier en relisant du code : on le découvre en débranchant la souris. Comme
on ne découvre pas qu'une page est lente en regardant son propre écran, mais en la chargeant
sur un réseau mobile bridé.

La compétence commune s'appelle **changer de conditions d'observation**, et c'est l'une des
rares qui distingue durablement un développeur expérimenté : il sait que son environnement de
travail est le moins représentatif de tous ceux où son produit va tourner.

## Mini-exercice
Sur la page que tu as sous les yeux, appuie sur Tab cinq fois. À chaque arrêt, réponds à deux
questions : est-ce que je vois où je suis, et est-ce que je saurais dire ce que fait cet élément sans
regarder autour ? Note le premier arrêt où la réponse est non.

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
