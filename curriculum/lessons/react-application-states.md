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
Tu dois maîtriser composants, props/state et le re-rendu (`/doc/lessons/react-fundamentals`) ainsi
que les effets et le chargement de données async (`/doc/lessons/react-hooks-effects`). Cette leçon
ASSEMBLE ces briques à l'échelle d'une application.

La seule notion d'architecture d'état nécessaire ici tient en une phrase : **un état se place au
plus proche ancêtre commun des composants qui le lisent, et ce qui peut se calculer ne se stocke
pas**. C'est tout ce que la leçon utilise — elle s'occupe d'une autre question, celle des états
que ton modèle rend *représentables*.

> **Où trouver le détail.** `/doc/lessons/react-composition-architecture` traite le découpage en
> composants, le placement de l'état et la mémoïsation. Elle est **programmée plus loin** dans le
> parcours, et rien ici ne suppose que tu l'as lue.

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

## 🛠️ Pratique — les états impossibles, et comment les rendre inexprimables

**Contexte.** Voici l'état d'un écran de recherche, tel qu'on l'écrit spontanément :

```jsx
const [chargement, setChargement] = useState(false);
const [erreur, setErreur] = useState(null);
const [resultats, setResultats] = useState([]);
```

Trois variables indépendantes. Cette pratique consiste à démontrer, par le calcul, que cette
forme est **fausse** — pas maladroite : fausse — puis à la corriger, puis à mesurer le gain.

**Ta production, en cinq parties.**

**1. Le dénombrement.** Combien d'états distincts ces trois variables peuvent-elles représenter ?
Traite `chargement` comme un booléen, `erreur` comme *présente ou absente*, `resultats` comme
*vide ou non vide*. Écris le calcul, pas seulement le résultat.

**2. Le tableau de vérité.** Énumère **toutes** ces combinaisons. Pour chacune :
`ce que ça signifie` · `possible ou impossible` · `si impossible, ce que l'utilisateur verrait
si elle survenait`.

Trois d'entre elles au moins sont des états que le produit ne doit jamais atteindre. Nomme-les.

**3. La reformulation.** Réécris cet état sous une forme où les états impossibles ne sont plus
**exprimables**. La contrainte : une seule variable d'état pour la requête, et le compilateur
ou la structure doit rendre la faute impossible, pas seulement improbable. Compte les états
représentables après reformulation.

**4. Le rendu des quatre issues.** Écris le rendu correspondant. Les quatre issues doivent être
**explicitement** traitées — chargement, vide, erreur, succès — et le vide doit être distingué
de l'erreur. Pour chacune, écris en une phrase ce que l'utilisateur voit et **ce qu'il peut
faire** : une erreur sans action possible est un cul-de-sac.

**5. L'URL comme source de vérité.** Ajoute une vue détail. Deux versions à comparer :

- **V1** : `const [idOuvert, setIdOuvert] = useState(null)` ;
- **V2** : l'identifiant vit dans l'URL (`/recherche/detail/42`), la vue en est dérivée.

Puis remplis ce tableau, en testant réellement les six situations sur ta V1 :

| Situation | V1 (état local) | V2 (URL) |
|---|---|---|
| l'utilisateur actualise la page | | |
| il copie le lien et l'envoie à un collègue | | |
| il appuie sur « précédent » | | |
| il ouvre le détail dans un nouvel onglet | | |
| il met la page en favori | | |
| tu veux reproduire un bug qu'il t'a signalé | | |

**Critère de réussite.** (a) Ton dénombrement de la partie 1 est un calcul explicite ; (b) tu as
nommé au moins trois combinaisons impossibles ; (c) après reformulation, le nombre d'états
représentables est strictement égal au nombre d'états réels ; (d) le tableau de la partie 5 est
rempli à partir d'essais, pas de suppositions.

**Durée.** 45 à 60 minutes.

## ✅ Correction

### Partie 1 — le calcul

```
chargement : 2 valeurs (true, false)
erreur     : 2 valeurs (présente, absente)
resultats  : 2 valeurs (vide, non vide)

2 × 2 × 2 = 8 états représentables
```

Combien d'états le produit possède-t-il réellement ? **Quatre** : on charge, c'est vide, ça a
échoué, on a des résultats.

**Huit représentables pour quatre réels.** Quatre combinaisons sur huit décrivent des situations
qui ne devraient jamais exister — et pourtant le code peut les produire, parce que rien ne
l'en empêche.

C'est le cœur de cette pratique, et c'est un changement de regard : un état mal modélisé n'est
pas « un peu lâche ». Il rend certains bugs **atteignables**. Le rapport 8/4 est la mesure
exacte de la dette.

### Partie 2 — le tableau de vérité

| chargement | erreur | résultats | Signification | Verdict |
|---|---|---|---|---|
| `false` | absente | vide | rien n'est encore demandé, ou zéro résultat | **ambigu** |
| `true` | absente | vide | chargement en cours | valide |
| `false` | absente | non vide | succès | valide |
| `false` | présente | vide | échec | valide |
| `true` | **présente** | vide | « ça charge, et ça a échoué » | **impossible** |
| `true` | absente | **non vide** | « ça charge, et voici les résultats » | **impossible** |
| `true` | **présente** | **non vide** | les trois à la fois | **impossible** |
| `false` | **présente** | **non vide** | « ça a échoué, et voici les résultats » | **impossible** |

Quatre impossibles, et un cinquième cas — le premier — qui est le plus perfide de tous : il
confond **« aucune recherche lancée »** et **« recherche lancée, zéro résultat »**. Ce sont
deux situations que l'utilisateur vit très différemment, et qui produisent ici le même état.
C'est la cause directe de l'écran vide sans explication, où l'on ne sait pas si le formulaire
a fonctionné.

Ce que verrait l'utilisateur si les impossibles survenaient :

- `chargement + erreur` : un indicateur de chargement qui tourne indéfiniment **par-dessus** un
  message d'erreur. On voit ça régulièrement en production, et c'est la signature exacte de ce
  défaut de modélisation ;
- `erreur + résultats` : un message « une erreur est survenue » au-dessus d'une liste de
  données parfaitement valides. L'utilisateur ne sait pas s'il peut se fier à ce qu'il lit.

Et ces états surviennent réellement : il suffit d'une erreur suivie d'une nouvelle recherche
qui réussit, sans que `setErreur(null)` ait été appelé. Un oubli d'une ligne, et l'écran ment.

### Partie 3 — rendre l'impossible inexprimable

```ts
type EtatRecherche =
  | { statut: 'inactif' }
  | { statut: 'chargement' }
  | { statut: 'erreur'; message: string }
  | { statut: 'succes'; resultats: Produit[] };

const [etat, setEtat] = useState<EtatRecherche>({ statut: 'inactif' });
```

**Quatre états représentables, quatre états réels.** Le rapport est de 1 à 1.

Trois propriétés valent d'être remarquées :

- `message` n'existe **que** dans la branche erreur, et `resultats` **que** dans la branche
  succès. Écrire `etat.resultats` sans avoir vérifié `etat.statut === 'succes'` est refusé par
  le compilateur. Ce n'est plus une convention à respecter : c'est mécaniquement impossible ;
- `'inactif'` est distinct de `'succes'` avec zéro résultat. L'ambiguïté du premier cas
  disparaît ;
- il n'y a **plus rien à remettre à zéro**. Chaque transition remplace l'état entier, donc
  aucun résidu d'un état précédent ne peut subsister. L'oubli de `setErreur(null)` n'existe
  plus, parce que la ligne n'existe plus.

Ce motif porte un nom, *l'union discriminée* : plusieurs formes possibles, distinguées par un
champ commun — ici `statut`. C'est l'outil standard pour modéliser « une chose parmi
plusieurs ».

Quand les transitions se compliquent — annulation, nouvelle tentative, pagination — on passe à
`useReducer`, qui garde ce même type d'état mais centralise les transitions en un endroit
lisible : `dispatch({ type: 'echec', message })` au lieu de trois setters éparpillés dans des
gestionnaires.

### Partie 4 — les quatre issues, et ce qu'on peut faire

| Statut | Ce que l'utilisateur voit | Ce qu'il peut faire |
|---|---|---|
| `inactif` | « Saisissez un terme pour lancer la recherche » | taper |
| `chargement` | une structure grise à la place des résultats | attendre, ou annuler |
| `erreur` | « La recherche n'a pas abouti » + le motif si connu | **réessayer** |
| `succes`, 0 résultat | « Aucun résultat pour *lampe* » + une suggestion | modifier sa recherche |
| `succes`, n résultats | la liste | consulter |

Le point qu'on rate le plus souvent est la troisième ligne. Un message d'erreur sans bouton
« Réessayer » laisse l'utilisateur devant un mur : sa seule option est d'actualiser la page,
ce qui perd sa saisie. Une issue non heureuse doit toujours proposer une sortie.

Le cinquième cas — succès avec zéro résultat — mérite le mot exact tapé par l'utilisateur dans
le message. « Aucun résultat » est correct ; « Aucun résultat pour *lampe de bureau* » lui
apprend en plus que sa recherche a bien été prise en compte, et lui rappelle ce qu'il a
cherché.

### Partie 5 — l'URL

| Situation | V1 (état local) | V2 (URL) |
|---|---|---|
| actualise la page | le détail se referme, retour à la liste | le détail est toujours ouvert |
| copie le lien | le collègue arrive sur la liste | le collègue arrive sur le bon détail |
| bouton « précédent » | quitte la page entière, ou ne fait rien | referme le détail |
| ouvre dans un nouvel onglet | impossible, il n'y a rien à ouvrir | fonctionne |
| met en favori | le favori pointe la liste | le favori pointe le détail |
| reproduire un bug signalé | il faut demander la suite de clics | il suffit de l'URL |

La dernière ligne est celle qu'on ne mentionne jamais et qui coûte le plus cher en équipe. Un
état qui vit dans l'URL est un état **communicable** : un rapport de bug tient dans un lien, un
test automatique se positionne directement sur le cas, un collègue vérifie en trois secondes.
Un état local n'est reproductible que par la description d'un parcours, que personne ne rédige
correctement.

**La règle :** si un état décrit *ce que l'utilisateur regarde* — quelle page, quel élément
ouvert, quel filtre, quel onglet, quelle page de pagination — il appartient à l'URL. S'il
décrit *ce qu'il est en train de faire* — le contenu d'un champ pas encore validé, un menu
déroulant ouvert, la position d'un curseur — il reste local.

### La mauvaise solution plausible

Garder les trois booléens et ajouter des garde-fous : un `useEffect` qui remet `erreur` à
`null` dès que `resultats` change, un `if` qui masque le chargement quand une erreur est
présente.

Ça fonctionne — jusqu'à la prochaine transition qu'on ajoute sans penser au garde-fou. On a
préservé les huit états représentables et ajouté du code dont le seul rôle est d'en interdire
quatre à l'exécution. C'est plus de code pour un résultat moins sûr.

Le principe général : **quand un état ne doit pas exister, la bonne réponse est de le rendre
inexprimable, pas de le surveiller.** Un garde-fou peut être oublié ; un type ne peut pas.

### Généralisation

Le dénombrement de la partie 1 — *combien d'états mon modèle peut-il représenter, combien
existent vraiment* — s'applique bien au-delà de React. Une table de base de données avec quatre
colonnes nullables représente seize combinaisons dont douze sont peut-être absurdes. Un fichier
de configuration avec cinq drapeaux booléens indépendants en représente trente-deux, dont on
n'en teste jamais que trois.

Chaque fois que ce rapport est supérieur à 1, l'écart mesure le nombre de bugs que le modèle
**autorise**. Les réduire n'est pas de l'élégance : c'est enlever de la place aux erreurs.

## Mini-exercice
Prends un écran de ton projet et compte : combien d'états ton modèle peut-il représenter (le produit
des valeurs possibles de chaque variable d'état), et combien en existe-t-il réellement ? Si le
rapport dépasse 1, nomme une combinaison impossible que ton code peut pourtant produire.

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
