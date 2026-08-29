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

Un écran de recherche de livres. Personne ne commence par un reducer — on commence par ça,
et c'est raisonnable :

```tsx
const [loading, setLoading] = useState(false);
const [error, setError]     = useState<string | null>(null);
const [items, setItems]     = useState<Livre[] | null>(null);
```

Un testeur remonte un bug étrange : « quand une recherche échoue et que je relance, j'ai mes
résultats **et** le message d'erreur en même temps ». Le code fautif est celui-ci, et il
paraît complet :

```tsx
setLoading(true);
api.chercher(q)
  .then((r) => { setItems(r); setLoading(false); })          // on oublie setError(null)
  .catch((e) => { setError(e.message); setLoading(false); });
```

**Décision 1 — traiter le symptôme ou la cause ?** Le correctif immédiat est d'ajouter
`setError(null)` dans le `then`. Il marche. Fais-le, puis pose la vraie question : *combien
d'autres oublis de ce type le code permet-il ?* Compte les combinaisons. Trois variables
donnent **huit** états représentables :

| loading | error | items | ce que ça signifie |
|---|---|---|---|
| non | non | absent | rien n'a encore été cherché — légitime |
| oui | non | absent | premier chargement — légitime |
| non | non | vide | aucun résultat — légitime |
| non | non | présent | succès — légitime |
| non | oui | absent | échec — légitime |
| **non** | **oui** | **présent** | **résultats + erreur : le bug du testeur** |
| oui | oui | absent | on recharge après un échec — affiche-t-on encore l'erreur ? |
| oui | non | présent | on recharge en gardant l'ancienne liste — voulu, ou accident ? |

Cinq états ont un sens clair, un est franchement contradictoire, et deux dépendent d'une
intention que personne n'a écrite nulle part. Le bug n'était pas un oubli isolé : le modèle
**autorisait** l'incohérence, et il l'autorisera encore la prochaine fois.

**Décision 2 — rendre l'état impossible plutôt que le corriger.** Si les trois informations
ne peuvent pas varier indépendamment, elles ne doivent pas être trois variables
indépendantes :

```tsx
type Etat =
  | { statut: 'repos' }
  | { statut: 'chargement' }
  | { statut: 'erreur'; message: string }
  | { statut: 'succes'; items: Livre[] };
```

Quatre états, et l'incohérence n'est plus exprimable : il n'existe aucune valeur de ce type
portant à la fois un `message` d'erreur et des `items`. Le compilateur refuse même d'écrire
le bug. Note ce qui vient de se passer — on n'a pas ajouté de garde, on a **retiré la
possibilité**. C'est le même mouvement que la contrainte en base plutôt que la vérification
dans le service : le meilleur endroit pour traiter un cas invalide, c'est là où il cesse
d'exister.

**Décision 3 — a-t-on besoin d'un reducer ?** Non, pas encore, et c'est important : le type
ci-dessus suffit à supprimer le bug, avec un simple `useState<Etat>`. Le reducer devient
utile quand les transitions elles-mêmes ont des règles — « on ne peut pas relancer une
recherche pendant un chargement », « une annulation ne s'applique que si l'on chargeait » —
parce qu'il rassemble ces règles en une fonction pure, lisible d'un seul tenant et testable
sans monter le moindre composant :

```tsx
function reducer(e: Etat, a: Action): Etat {
  switch (a.type) {
    case 'chercher': return e.statut === 'chargement' ? e : { statut: 'chargement' };
    case 'succes':   return { statut: 'succes', items: a.items };
    case 'erreur':   return { statut: 'erreur', message: a.message };
  }
}
```

`reducer({statut:'chargement'}, {type:'chercher'})` doit rendre l'état inchangé : un test de
trois lignes, sans navigateur, sans rendu. Choisis le reducer pour ça — pas parce qu'il fait
plus professionnel.

**La limite de la solution, qu'il faut connaître avant de la rencontrer.** En mettant `items`
dans la variante `succes`, on a rendu inexprimable non seulement le bug, mais aussi la
dernière ligne du tableau : afficher l'ancienne liste grisée pendant qu'on recharge. C'est
une contrainte réelle, pas un détail — beaucoup d'interfaces la veulent. Il faut alors
l'exprimer exprès, par exemple `{ statut: 'chargement'; precedents?: Livre[] }`. Le principe
tient toujours : **un état légitime doit être déclaré, pas obtenu par accident.** Un modèle
trop serré se corrige ; un modèle trop permissif produit des bugs qu'on ne voit qu'en
production.

**Variante qui déplace le problème.** L'utilisateur cherche « dune », ouvre un résultat,
puis clique sur « retour ». Il revient sur un écran `repos`, sa recherche effacée. Le
reducer n'y peut rien : le terme cherché n'est pas un état d'écran, c'est une **destination**
— il appartient à l'URL (`/recherche?q=dune`). La règle de partage est celle-ci : ce qu'on
doit pouvoir partager par lien, recharger ou retrouver avec le bouton retour va dans l'URL ;
ce qui n'a de sens que pendant la vie de l'écran reste dans l'état local. Se tromper de côté
ne produit pas d'erreur — seulement une application qui « perd » ce que l'utilisateur
croyait acquis.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Tu gères une requête avec `const [loading, setLoading] = useState(false)`,
   `[error, setError]` et `[data, setData]`. Combien de combinaisons ces trois états
   permettent-ils, et combien sont valides ?
2. Une recherche échoue, l'utilisateur relance, elle réussit. Que voit-il si tu as oublié
   quelque chose ?
3. Tu stockes l'onglet actif dans un `useState`. L'utilisateur partage l'URL de la page.
   Que reçoit son destinataire ?
4. L'utilisateur tape « ab », puis « abc ». La réponse de « ab » arrive après celle de
   « abc ». Qu'affiche la liste ?

## ✅ Correction attendue

**La démarche.** Avant d'écrire un `useState`, énumérer les états dans lesquels
l'interface a le droit de se trouver. C'est ce dénombrement, et non le confort de
l'écriture, qui décide de la structure.

**L'erreur probable : trois booléens indépendants pour un état qui n'en est qu'un.** Le
trio `loading` / `error` / `data` est la première solution qui vient, chacun de ces états
est réellement nécessaire, et c'est ce qui la rend si difficile à remettre en cause.

Le dénombrement est pourtant sans appel. Trois valeurs indépendantes produisent
**huit combinaisons**, dont **quatre** correspondent à quelque chose :

| loading | error | data | sens |
|---|---|---|---|
| ✅ | — | — | chargement |
| — | ✅ | — | erreur |
| — | — | ✅ | résultat |
| — | — | — | état initial |
| ✅ | ✅ | — | **impossible** : ça charge et ça a échoué |
| ✅ | — | ✅ | **ambigu** : anciens résultats pendant un rechargement ? |
| — | ✅ | ✅ | **le bug de la question 2** |
| ✅ | ✅ | ✅ | **incohérent** |

Quatre états valides sur huit représentables : **la moitié du domaine ne veut rien dire**,
et rien n'empêche l'interface d'y tomber. Un seul état à quatre valeurs —
`'idle' | 'loading' | 'error' | 'ok'` — rend ces combinaisons **inexprimables**. C'est
exactement ce que le reducer de cette leçon apporte : il ne range pas du code, il
**supprime des états impossibles**.

Le piège séduit parce que chaque `useState` est ajouté **au moment où on en a besoin**,
un par un, et qu'aucune de ces additions n'est fautive prise isolément. Le défaut naît de
leur accumulation, jamais d'une décision qu'on aurait pu discuter. C'est ce qui le rend
invisible en revue de code : chaque ligne se défend.

**Sur les autres questions.** L'utilisateur dont la recherche échoue puis réussit voit
**le message d'erreur ET les résultats** — la ligne `— ✅ ✅` du tableau. On a bien pensé
à `setData` au succès, on a oublié `setError(null)`. C'est l'oubli le plus banal de React,
et il disparaît structurellement avec un état unique, puisque passer à `'ok'` **est** la
disparition de l'erreur.

L'onglet actif dans un `useState` produit une URL qui ne décrit pas ce qu'on regarde : le
destinataire du lien atterrit sur l'onglet par défaut. Cassés du même coup : le bouton
retour, le rechargement, la mise en favori. **L'URL est un état**, le seul que
l'utilisateur peut copier, et le mettre ailleurs revient à en créer une seconde source.

Enfin, la réponse tardive de « ab » **écrase** celle de « abc » : la liste affiche les
résultats d'une requête que l'utilisateur a déjà abandonnée, sans aucun message d'erreur.
C'est la *race condition* classique du frontend. La parade est d'annuler la requête
précédente (`AbortController`) ou d'ignorer toute réponse qui ne correspond plus à la
requête courante — vérifier, avant d'écrire dans l'état, que le terme n'a pas changé.

**Alternative défendable.** Pour un chargement unique et simple — une page qui lit une
ressource et n'en change plus — deux `useState` sont parfaitement acceptables : le coût
d'un reducer ne se justifie pas. Et dans une application réelle, une bibliothèque de
gestion de données serveur traite d'un coup les états, le cache, l'annulation et les
courses : c'est le choix le plus courant, et savoir pourquoi elle existe vaut mieux que
de réécrire son contenu.

**Vérifie seul, sans corrigé** :
1. Compte tes `useState` dans ton composant le plus chargé. Multiplie leurs valeurs
   possibles. Combien de combinaisons ont un sens ?
2. Provoque une erreur, puis relance avec succès. Le message d'erreur disparaît-il ?
3. Change d'onglet, copie l'URL, ouvre-la dans une autre fenêtre. Retrouves-tu le même
   écran ?

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
