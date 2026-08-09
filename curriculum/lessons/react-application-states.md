<!-- keep -->
# Leçon — De composant à application : routing, useReducer et états d'écran

## 🌍 Le problème d'abord
Tu sais faire des composants et gérer un `useState`. Puis tu assembles une vraie application et
trois problèmes surgissent d'un coup. (1) Il y a PLUSIEURS écrans (accueil, détail, recherche) : où
« vit » l'écran affiché, et comment revenir en arrière ? (2) Un écran a un état COMPLEXE — un
formulaire à étapes, un panier — et tes six `useState` se marchent dessus, incohérents. (3) Tu
affiches des données venues du réseau, mais tu n'as prévu que le cas « ça a marché » : à l'exécution,
l'utilisateur voit une page blanche pendant le chargement, un plantage en cas d'erreur, ou « rien »
quand la liste est vide. Cette leçon te fait passer du composant isolé à l'APPLICATION qui tient
debout.

## 🎯 Objectif
Savoir structurer une application React réelle : gérer plusieurs vues avec le **routing** (l'URL comme
source de vérité de l'écran), regrouper un état complexe avec **`useReducer`** (actions → nouvel
état) plutôt qu'une nuée de `useState`, et traiter systématiquement les **quatre états d'un écran de
données** (chargement, vide, erreur, succès) au lieu du seul cas heureux.

## 🧩 Prérequis
Tu dois maîtriser composants, props/state et le re-rendu (`/doc/lessons/react-fundamentals`), les
effets et le chargement de données async (`/doc/lessons/react-hooks-effects`), et les principes de
composition et d'architecture d'état (`/doc/lessons/react-composition-architecture`). Cette leçon
ASSEMBLE ces briques à l'échelle d'une application.

## 🧠 Modèle mental
Une application, c'est trois choses à orchestrer :
1. **Quelle vue ?** — le routing fait de l'**URL** la source de vérité de l'écran affiché. Naviguer =
   changer l'URL ; l'interface en découle. Bénéfice : le bouton « retour », le partage de lien et le
   rechargement fonctionnent gratuitement.
2. **Quel état ?** — quand plusieurs valeurs changent ENSEMBLE selon des événements, un **reducer**
   centralise « comment l'état passe d'une version à la suivante » via des **actions** nommées, plus
   prévisible qu'une dispersion de `useState`.
3. **Dans quel état d'affichage ?** — tout écran qui dépend de données externes existe dans l'un de
   **quatre** états : *chargement*, *vide*, *erreur*, *succès*. Les traiter tous, c'est la différence
   entre une démo et une vraie application.

## 💡 Pourquoi c'est important
La plupart des bugs visibles en production ne sont pas des erreurs de logique métier : ce sont des
états non gérés (spinner infini, écran blanc, « undefined » affiché, liste vide sans message). Savoir
router proprement, modéliser un état complexe avec un reducer et couvrir les quatre états d'écran est
exactement ce qui distingue un junior « qui a fait un tuto » d'un développeur qui livre une interface
robuste — y compris l'UI de tes futures apps IA (question → chargement → réponse ou erreur).

## Explication complète

### Le routing : l'URL comme état de la vue
Une application « single-page » affiche différentes vues sans recharger la page, en lisant l'URL. Le
principe (indépendant de la bibliothèque) : une table associe des CHEMINS à des composants.
```tsx
// Idée conceptuelle d'un routeur (schématique) :
// "/"            -> <Accueil/>
// "/livres/:id"  -> <DetailLivre id={id}/>
// "/recherche"   -> <Recherche/>
```
On NAVIGUE en changeant l'URL (un lien `<a href>` géré par le routeur, ou une fonction `navigate('/livres/42')`), et le paramètre (`:id`) alimente le composant. Règle d'or : **l'URL est la source de
vérité de la vue** — ne duplique pas « quel écran » dans un `useState` à côté, sinon les deux se
désynchronisent (le bouton retour casse).

### useReducer : un état complexe, prévisible
Quand un composant accumule des `useState` qui changent ensemble (valeur, erreurs, étape, envoi en
cours…), un **reducer** clarifie tout : une fonction pure `(état, action) => nouvelState` et un
`dispatch(action)` pour déclencher les transitions.
```tsx
type State = { count: number; step: number };
type Action = { type: 'inc' } | { type: 'setStep'; step: number } | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'inc':     return { ...state, count: state.count + state.step };
    case 'setStep': return { ...state, step: action.step };
    case 'reset':   return { count: 0, step: 1 };
  }
}
const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 });
// dispatch({ type: 'inc' })
```
Avantages : les transitions sont NOMMÉES et centralisées (on lit le reducer pour comprendre toute la
logique), le reducer est une fonction pure TESTABLE, et l'immutabilité reste la règle (`...state`).
Choisis `useReducer` quand la logique d'état devient un « si… alors… » éparpillé ; garde `useState`
pour le simple.

### Les quatre états d'un écran de données
Un écran qui charge des données n'a pas deux issues (« vide » / « rempli ») mais **quatre** :
```tsx
if (loading) return <Spinner/>;                 // 1. chargement
if (error)   return <Erreur onRetry={reload}/>; // 2. erreur (avec action de reprise)
if (items.length === 0) return <AucunResultat/>;// 3. vide (message clair, pas une page blanche)
return <Liste items={items}/>;                  // 4. succès
```
Oublier un seul de ces états produit les bugs classiques (spinner infini, plantage, « rien » sans
explication). Les modéliser explicitement est une DISCIPLINE, pas une option.

### Error boundaries (garde-fou)
Une erreur de rendu dans un composant peut casser toute l'application. Un **error boundary** est un
composant qui CAPTURE les erreurs de son sous-arbre et affiche une UI de secours au lieu d'un écran
blanc. On en place autour des zones à risque (une vue entière, un widget tiers). C'est le filet de
sécurité complémentaire de la gestion d'erreur des données.

## Concepts clés
Routing (URL = source de vérité de la vue, paramètres, navigation) · `useReducer` (`(state, action)
=> state`, `dispatch`, transitions nommées, pur/testable) · `useState` vs `useReducer` · les 4 états
d'écran (chargement/vide/erreur/succès) · error boundary · immutabilité (rappel).

## 🧭 Exemple guidé
Un écran de recherche complet, avec ses quatre états et un reducer pour l'état de requête :
```tsx
type S = { status: 'idle'|'loading'|'error'|'ok'; items: Livre[]; q: string };
type A = { type: 'search'; q: string } | { type: 'ok'; items: Livre[] } | { type: 'error' };

function reducer(s: S, a: A): S {
  switch (a.type) {
    case 'search': return { ...s, status: 'loading', q: a.q };
    case 'ok':     return { ...s, status: 'ok', items: a.items };
    case 'error':  return { ...s, status: 'error' };
  }
}
// À l'affichage : status 'loading' -> Spinner ; 'error' -> Erreur+retry ;
// 'ok' && items.length===0 -> AucunResultat ; sinon -> Liste.
```
Raisonnement : la requête a une logique d'états (idle → loading → ok/error) → un reducer la rend
lisible et testable. À l'affichage, on couvre les quatre cas explicitement. La vue « détail d'un
livre » serait une ROUTE `/livres/:id` : l'URL, pas un `useState`, décide de l'écran.

## ⚠️ Erreurs fréquentes
- Stocker « quel écran est affiché » dans un `useState` au lieu de l'URL → bouton retour et partage
  de lien cassés.
- Empiler dix `useState` interdépendants là où un reducer clarifierait les transitions.
- Ne gérer que le cas « succès » → spinner infini, écran blanc, ou « rien » sans message quand c'est vide.
- Un reducer qui MUTE l'état (`state.count++`) au lieu de retourner du neuf (`{ ...state }`).
- Aucune barrière d'erreur : une exception de rendu fait planter toute l'application.

## 🔗 Liens avec le programme
Cette leçon assemble `/doc/lessons/react-fundamentals`, `/doc/lessons/react-hooks-effects` et
`/doc/lessons/react-composition-architecture` à l'échelle d'une application, et prépare le Projet 3
(BiblioApp, jours ~113-118) qui exige routing, états d'écran et un état structuré. La discipline des
quatre états rejoint la gestion d'erreur robuste vue en hooks, et le raisonnement « état = machine »
fait écho à `/doc/lessons/architecture-basics`.

## Mini-exercice
Reprends une liste chargée depuis une API. (1) Transforme son état de requête en `useReducer`
(actions `search`/`ok`/`error`). (2) Affiche EXPLICITEMENT les quatre états (chargement, vide, erreur
avec bouton réessayer, succès). (3) Ajoute (conceptuellement) une route `/detail/:id` et fais dériver
la vue de l'URL, pas d'un `useState`. Pratique associée : `react-search`, `react-parent-child`,
playbook `frontend-regression`.

## 📚 Vocabulaire
**routing** · **URL comme source de vérité** · **`useReducer`** · **action / `dispatch`** ·
**reducer (fonction pure)** · **quatre états d'écran** (chargement/vide/erreur/succès) · **error
boundary** · **UI de secours**.

## 🧾 À retenir
Passer du composant à l'application, c'est orchestrer trois choses : la VUE via le routing (l'URL est
la source de vérité — pas un `useState` parallèle), l'ÉTAT complexe via `useReducer` (transitions
nommées, pures, testables), et l'AFFICHAGE via les quatre états d'écran (chargement, vide, erreur,
succès) plus un error boundary comme filet. Gérer tous les états, et non le seul cas heureux, est ce
qui rend une interface réellement fiable.
