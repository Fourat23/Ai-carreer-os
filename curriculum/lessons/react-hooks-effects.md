<!-- keep -->
# Leçon — React : effets, données async et hooks

## 🌍 Le problème d'abord
Ton composant sait afficher un état. Mais dans la vraie vie, l'interface doit se
SYNCHRONISER avec le monde extérieur : aller chercher des données sur une API, s'abonner à
un flux, lancer un minuteur. Ces choses ne sont pas « du rendu » — elles se produisent À
CÔTÉ, et il faut les déclencher au bon moment, les nettoyer quand il faut, et gérer les cas
où ça charge, où ça échoue, ou où l'utilisateur tape plus vite que le réseau ne répond. Mal
fait, on obtient des pages blanches, des spinners éternels et des résultats qui s'affichent
dans le désordre. Cette leçon t'apprend à brancher proprement ton interface sur le monde
extérieur — avec `useEffect` et les états d'une donnée asynchrone.

## 🎯 Objectif
Maîtriser useEffect (et savoir quand NE PAS l'utiliser), gérer les trois états de toute donnée async (loading/error/data), les formulaires contrôlés, et extraire la logique en hooks personnalisés. C'est le pont entre ton UI et le monde (APIs, LLM).

## 🧠 Modèle mental
`useEffect` est **une synchronisation avec l'EXTÉRIEUR** (réseau, abonnements, timers) — pas un fourre-tout « code à exécuter ». Question filtre avant chaque effet : « est-ce que je synchronise avec quelque chose d'externe ? » Non → tu n'as probablement pas besoin d'un effet (calcule au rendu).

## 🧩 Prérequis
Tu dois maîtriser les fondamentaux de React — composants, props, state, re-rendu, état
dérivé (`/doc/lessons/react-fundamentals`) — car un effet réagit à ces rendus. Tu dois aussi
comprendre l'asynchrone en JavaScript, les promesses et `async/await`
(`/doc/lessons/async-javascript`), puisque les effets orchestrent surtout des opérations
asynchrones (appels réseau). La notion des trois états d'une donnée distante est construite
ici.

## 📖 Explication complète
- **useEffect(fn, deps)** : fn s'exécute APRÈS le rendu ; le tableau `deps` dit QUAND rejouer (`[]` = au montage ; `[id]` = quand id change). Le **cleanup** (la fonction retournée) nettoie avant le prochain effet/démontage (annuler un abonnement, un timer).
- **Les 3 états async** : toute donnée distante a TROIS états à rendre explicitement — `loading` (indicateur), `error` (message + retry), `data` (le contenu). Les oublier = pages blanches et spinners éternels. Modéliser en un seul état discriminé (`{status: 'loading' | 'error' | 'ok', data?}`) rend les états impossibles à mélanger.
- **StrictMode double appel** : en dev, React monte chaque composant DEUX fois exprès — si ton effet casse, il lui manque un cleanup ou il n'est pas idempotent. C'est un détecteur, pas un bug.
- **« You might not need an effect »** : une valeur dérivée du state se calcule PENDANT le rendu (pas dans un effet + state doublon) ; un événement utilisateur se gère dans le handler. Les effets superflus sont la source n°1 de bugs React.
- **Formulaires contrôlés** : le state est la source de vérité des champs (`value={v} onChange={e => setV(e.target.value)}`) — validation et soumission deviennent triviales.
- **Hooks personnalisés** : extraire une logique réutilisable (`useFetch(url)` qui gère les 3 états) — la factorisation (jour 22), appliquée aux composants.

## 🔧 Exemple simple
```tsx
const [state, setState] = useState<{status:'loading'|'error'|'ok'; data?: Livre[]}>({status:'loading'});
useEffect(() => {
  api.getLivres()
    .then((data) => setState({ status: 'ok', data }))
    .catch(() => setState({ status: 'error' }));
}, []);
if (state.status === 'loading') return <Spinner />;
if (state.status === 'error') return <Erreur onRetry={...} />;
return <Liste livres={state.data!} />;
```

## 🧭 Exemple guidé

Un champ de recherche qui interroge l'API à chaque frappe. Le code fait exactement ce que
la documentation suggère : un effet, une dépendance, trois états.

```tsx
useEffect(() => {
  if (!terme) return;
  setState({ status: 'loading' });
  api.chercher(terme)
    .then((data) => setState({ status: 'ok', data }))
    .catch(() => setState({ status: 'error' }));
}, [terme]);
```

Un utilisateur tape « chat », lettre par lettre, à une vitesse normale — environ 80 ms entre
deux frappes. Quatre requêtes partent donc : `c`, `ch`, `cha`, `chat`. Voici les instants
d'arrivée réels, mesurés dans un navigateur :

```
réponse de "chat" arrive à t = 401 ms
réponse de "cha"  arrive à t = 449 ms
réponse de "ch"   arrive à t = 556 ms
réponse de "c"    arrive à t = 561 ms
→ à l'écran : « 7 résultats pour "c" »
```

Le champ affiche `chat`, la liste affiche les résultats de `c`. Et ce n'est pas un cas
tordu : les réponses sont arrivées dans l'ordre **exactement inverse** de leur départ,
parce que la requête la plus large est celle qui demande le plus de travail au serveur.
Plus l'utilisateur tape vite et plus sa recherche est précise, plus il a de chances de voir
un résultat faux.

**Décision 1 — nommer le problème correctement.** La tentation est de dire « il faut un
debounce ». Un debounce réduit le nombre de requêtes ; il ne garantit rien. Avec 300 ms
d'attente, l'utilisateur qui marque une pause après « ch » puis complète en « chat » relance
deux requêtes, et la course reste possible — plus rare, donc plus difficile à reproduire et
à diagnostiquer. **Ce qui est rare n'est pas corrigé, c'est déguisé.** Le vrai énoncé est :
*plusieurs requêtes sont en vol simultanément et n'importe laquelle peut écrire dans le même
état.* Formulé ainsi, la solution devient évidente — il faut qu'une réponse sache si elle
est encore d'actualité.

**Décision 2 — qui décide qu'une réponse est périmée ?** On ne peut pas annuler le passé,
mais on peut refuser de l'écouter. React donne le point d'accroche : la fonction retournée
par l'effet s'exécute **avant** le prochain effet. On s'en sert pour lever un drapeau que la
réponse en retard consultera :

```tsx
useEffect(() => {
  if (!terme) return;
  let actif = true;                       // vrai tant que CET effet est le courant
  setState({ status: 'loading' });
  api.chercher(terme)
    .then((data) => { if (actif) setState({ status: 'ok', data }); })
    .catch(() => { if (actif) setState({ status: 'error' }); });
  return () => { actif = false; };        // le prochain terme périme celui-ci
}, [terme]);
```

Le point subtil, et c'est lui qu'il faut avoir compris : **chaque exécution de l'effet a son
propre `actif`**. Ce n'est pas une variable partagée qu'on remettrait à `true` — c'est une
variable locale capturée par la fermeture de chaque `.then()`. Quatre requêtes en vol, quatre
`actif` distincts, dont un seul vaut encore `true`. Si tu déclarais `actif` en dehors de
l'effet, tout s'effondrerait : la dernière requête remettrait le drapeau à `true` pour tout
le monde.

Même scénario, même code sauf ces trois lignes :

```
réponse de "chat" arrive à t = 381 ms   → affichée
réponse de "cha"  arrive à t = 429 ms   → ignorée (périmée)
réponse de "ch"   arrive à t = 539 ms   → ignorée (périmée)
réponse de "c"    arrive à t = 546 ms   → ignorée (périmée)
→ à l'écran : « 28 résultats pour "chat" »
```

**Décision 3 — et le debounce, alors ?** Il redevient utile, mais pour ce qu'il fait
vraiment : économiser des requêtes. Quatre appels au lieu d'un pour un mot de quatre
lettres, c'est quatre fois la charge serveur et, sur une API facturée, quatre fois le coût.
Debounce et drapeau de fraîcheur répondent à deux questions distinctes — *combien de
requêtes envoyer ?* et *quelle réponse a le droit d'écrire à l'écran ?* — et l'erreur
courante est de croire que la première réponse dispense de la seconde.

**Ce que ça t'apprend sur `useEffect` en général.** Le cleanup n'est pas un accessoire pour
les abonnements et les timers : il est la manière dont un effet dit « je ne suis plus le
courant ». Chaque fois qu'un effet démarre quelque chose qui peut se terminer *après* que
ses dépendances ont changé — un fetch, un timer, une écoute d'événement, une animation — la
question à se poser est la même : que doit-il se passer si ma valeur arrive trop tard ?
S'il n'y a pas de réponse, il manque un cleanup.

**Une inquiétude légitime, qu'il vaut mieux lever en l'essayant.** L'utilisateur tape
« chat » puis efface tout. `terme` redevient `''`, l'effet sort par le `if (!terme) return`
sans rien déclarer ni retourner de cleanup — et la réponse de « chat », partie avant, est
toujours en route. Va-t-elle s'afficher sous un champ vide ? Non, et la raison mérite d'être
sue : **React exécute le cleanup de l'effet précédent avant de lancer le suivant.** Le
`actif = false` de « chat » a donc déjà eu lieu quand le nouvel effet démarre. Journal
d'exécution réel :

```
effet : lance la requête "chat"
cleanup de "chat" : actif = false
effet : terme vide, return anticipé
  réponse "chat" arrive → actif = false, ignorée
```

L'ordre cleanup-puis-effet est ce qui rend le motif fiable ; sans lui, il faudrait
coordonner les effets entre eux à la main.

**Variante qui déplace le problème.** Même écran, mais l'utilisateur quitte la page pendant
le chargement. Le composant est démonté, la requête est toujours en vol. Le drapeau protège
là aussi — le cleanup s'exécute au démontage exactement comme au changement de dépendance,
donc rien n'est écrit dans un composant disparu. Mais une question nouvelle apparaît : la
requête, elle, continue de consommer du réseau et du temps serveur pour un résultat que
personne ne lira jamais. C'est le moment d'`AbortController`, et il faut voir qu'il répond à
autre chose que le drapeau : le drapeau garantit la **justesse** de l'affichage, l'abandon
récupère des **ressources**. Sur une recherche à chaque frappe, la différence se voit sur la
facture ; sur la justesse, elle ne change rien.

## 🤖 Exemple appliqué (IA / data / architecture)
L'UI de DocSense : la question part (loading), la réponse streame (data incrémentale), l'API LLM échoue (error + retry). Le hook `useQuestion()` encapsule ce cycle. Les 3 états async sont EXACTEMENT la gestion d'erreurs de la leçon error-handling, côté interface.

## ⚠️ Erreurs fréquentes
- Dépendances manquantes/en trop (effet qui ne rejoue pas, ou boucle infinie).
- Fetch sans gestion d'error (page cassée dès que le réseau tousse).
- Effet pour calculer un dérivé (calcule au rendu !).
- Réponses obsolètes affichées (pas de cleanup dans les recherches).

## 🚫 Anti-patterns
- Le useEffect fourre-tout de 80 lignes.
- Copier le state dans un autre state via un effet (source de vérité dupliquée).

## ✍️ Mini-exercice
Branche une liste sur ton API (mois 3) avec les 3 états rendus, puis coupe le serveur et vérifie que l'UI affiche l'erreur proprement (avec retry).

## 🔥 Exercice plus difficile
Écris `useFetch<T>(url)` : les 3 états, le cleanup anti-course, le retry — puis utilise-le dans 2 composants différents.

**Le protocole de vérification est imposé**, parce que le défaut visé ne se voit pas en usage
normal. Une fois ton hook écrit, fabrique la course délibérément : une URL qui répond en
300 ms, une autre en 50 ms, et un changement d'URL 30 ms après le premier rendu. Journalise
chaque écriture d'état. Ton livrable comprend **le journal obtenu**, pas seulement le code.

## ✅ Correction

> Les journaux de cette correction ne sont pas rédigés : ils sont **produits**. Le script
> `scripts/v70-verifications/react-usefetch-course.mjs` exécute réellement ce code dans
> Chromium avec React 18 et imprime les trois traces ci-dessous.

### La démarche : commencer par le défaut, pas par le code

L'ordre naturel est d'écrire le hook, puis de vérifier qu'il marche. Il conduit à un hook qui
marche — et qui contient le bug, parce que le bug ne se manifeste pas quand tout va bien.

L'ordre efficace est inverse : **fabrique d'abord la situation qui casse**, constate qu'elle
casse, puis écris la protection. Tu sauras alors ce que ta protection protège, et tu auras un
test que tu peux rejouer.

La situation qui casse ici s'appelle une **course** (en anglais *race condition*) : deux
requêtes lancées dans un ordre, deux réponses qui reviennent dans l'autre.

### Étape 1 — la version naïve, et sa trace

```jsx
function useFetch(url) {
  const [etat, setEtat] = useState({ statut: 'chargement', donnees: null });
  useEffect(() => {
    setEtat({ statut: 'chargement', donnees: null });
    charger(url).then((d) => setEtat({ statut: 'succès', donnees: d }));
  }, [url]);
  return etat;
}
```

Ce code est correct au sens où il n'a ni faute de syntaxe, ni dépendance manquante, ni
avertissement de React. Il passerait une relecture rapide.

Scénario : l'utilisateur demande `/lent` (300 ms), change d'avis au bout de 30 ms et demande
`/rapide` (50 ms). Trace mesurée :

```
effet /lent | nettoyage /lent | effet /rapide | écrit /rapide | écrit /lent
```

Affichage final : **`données de /lent`**.

Lis la fin de la ligne. `écrit /rapide` arrive à 80 ms, `écrit /lent` à 330 ms. La dernière
écriture gagne, et la dernière écriture est celle de la requête **abandonnée**. L'utilisateur
regarde une page qui affiche le résultat d'une demande qu'il a annulée.

C'est le défaut typique du champ de recherche : on tape « pa », puis « paris », et l'écran
affiche les résultats de « pa » parce que cette requête-là a mis plus longtemps. Personne ne
le signale comme un bug — les gens croient avoir mal tapé.

### Étape 2 — la protection, et pourquoi elle marche

```jsx
function useFetch(url) {
  const [etat, setEtat] = useState({ statut: 'chargement', donnees: null });
  useEffect(() => {
    let vivant = true;                                    // ① propre à CETTE exécution
    setEtat({ statut: 'chargement', donnees: null });
    charger(url)
      .then((d) => { if (vivant) setEtat({ statut: 'succès', donnees: d }); })
      .catch((e) => { if (vivant) setEtat({ statut: 'erreur', erreur: e }); });
    return () => { vivant = false; };                     // ② le nettoyage la périme
  }, [url]);
  return etat;
}
```

Trace mesurée, même scénario :

```
effet /lent | nettoyage /lent | effet /rapide | écrit /rapide | ignoré /lent
```

Affichage final : **`données de /rapide`**.

Le mécanisme tient en deux points, et c'est le seul endroit de cette correction qu'il faut
vraiment comprendre :

**① `vivant` est déclaré *dans* la fonction de l'effet.** Ce n'est donc pas une variable
partagée : chaque exécution de l'effet crée la sienne. Les deux requêtes n'ont pas le même
drapeau, elles ont chacune le leur. Une variable déclarée en dehors du `useEffect` — ou pire,
un `useRef` unique — casserait tout, parce que les deux requêtes se marcheraient dessus.

**② Le nettoyage retourné capture cette variable-là.** Quand React démonte l'ancien effet, il
exécute sa fonction de nettoyage, qui met à `false` le drapeau *de cette exécution* — pas
celui de la nouvelle. La réponse tardive de `/lent` trouve son propre drapeau à `false` et se
tait.

Note la ligne `nettoyage /lent` dans la trace, **avant** `effet /rapide`. C'est une garantie de
React, pas un hasard d'ordonnancement : le nettoyage de l'exécution précédente est joué avant
le lancement de la suivante. C'est ce qui rend le motif fiable — au moment où la nouvelle
requête part, l'ancienne est déjà désarmée.

### Étape 3 — StrictMode, et ce que la trace révèle

En développement, React exécute les effets deux fois pour révéler ceux qui ne se nettoient pas.
Trace mesurée du même hook sous `StrictMode` :

```
effet /lent | nettoyage /lent | effet /lent | nettoyage /lent | effet /rapide
            | écrit /rapide | ignoré /lent | ignoré /lent
```

Trois choses s'y lisent :

- **le doublement est visible** : `effet /lent` apparaît deux fois ;
- **le nettoyage s'intercale systématiquement** entre les deux ;
- **deux réponses sont ignorées** au lieu d'une, et l'affichage reste correct.

C'est exactement le diagnostic que StrictMode est censé produire. Sans le drapeau, cette même
trace se terminerait par deux écritures périmées au lieu de deux mises au silence — et le
comportement en développement serait *pire* qu'en production, ce qui déroute beaucoup de
débutants. Le double appel n'est pas un défaut de React : c'est un test qui échoue bruyamment.

### Le retry, et le piège de sa dépendance

```jsx
const [essai, setEssai] = useState(0);
useEffect(() => { /* … */ }, [url, essai]);
const reessayer = () => setEssai((n) => n + 1);
```

`essai` est dans les dépendances parce que sa modification doit **relancer** l'effet. C'est
l'usage légitime d'une dépendance qui n'est pas une donnée : un compteur dont la seule fonction
est de déclencher une réexécution.

Le piège à éviter : appeler directement la fonction de chargement dans le gestionnaire du
bouton. Ça marche, et ça duplique la logique — deux chemins pour charger, deux endroits à
corriger, dont un qui oubliera le drapeau. Le bouton ne charge pas : il **demande à l'effet de
se rejouer**.

### La mauvaise solution plausible

`AbortController` à la place du drapeau :

```jsx
useEffect(() => {
  const ctrl = new AbortController();
  fetch(url, { signal: ctrl.signal }).then(/* … */);
  return () => ctrl.abort();
}, [url]);
```

Ce n'est pas une erreur — c'est même meilleur sur un point : la requête réseau est réellement
annulée, alors que le drapeau la laisse se terminer et jette le résultat. Sur une liste
paginée ou un téléchargement, la différence est réelle.

Mais deux précisions manquent presque toujours dans les réponses d'entretien :

1. l'annulation fait **rejeter** la promesse avec une erreur `AbortError`. Un `catch` naïf la
   traitera comme une panne réseau et affichera « une erreur est survenue » à un utilisateur
   dont tout va bien. Il faut l'écarter explicitement ;
2. `AbortController` ne s'applique qu'à ce qui l'accepte. Un client maison, une bibliothèque
   ancienne, une lecture de base locale : le drapeau reste la seule protection.

La bonne réponse est donc « les deux » : `AbortController` quand c'est possible, drapeau
toujours, parce que le drapeau protège contre l'écriture d'état — qui est le vrai problème —
et l'annulation contre le trafic inutile.

### Auto-évaluation

Ton hook est bon si tu peux répondre par « oui » à ces cinq points, chacun vérifiable :

| Vérification | Comment |
|---|---|
| aucune écriture périmée | la trace se termine par `ignoré`, pas par `écrit` de l'URL abandonnée |
| les trois états sont **rendus** | coupe le serveur : un message d'erreur s'affiche, pas un écran vide |
| le retry passe par l'effet | le gestionnaire du bouton ne contient aucun appel réseau |
| aucun avertissement React | console propre, dépendances complètes |
| réutilisable tel quel | deux composants l'emploient sans copier-coller ni paramètre ajouté |

### Généralisation

Le motif « déclarer un jeton propre à cette exécution, l'invalider à la sortie, ignorer ce qui
revient d'un jeton invalidé » n'a rien de spécifique à React. C'est la réponse standard à toute
opération asynchrone qui peut être supplantée : une requête de recherche, un calcul lancé sur
un fil d'exécution séparé, un rafraîchissement périodique, une souscription à un flux.

La question à se poser, chaque fois que du code démarre quelque chose de long : **si on me
redemande la même chose avant que j'aie fini, qui gagne ?** Si la réponse est « celui qui
finit en dernier », il y a un bug qui attend son jour.

## 🎤 Questions d'entretien
- « Quand utilises-tu useEffect — et quand pas ? » → Synchroniser avec l'externe ; jamais pour un dérivé (calcul au rendu) ni un événement (handler).
- « Pourquoi le double appel en StrictMode ? » → Détecter les effets sans cleanup/non idempotents — une feature de dev.
- « Comment évites-tu les réponses obsolètes ? » → Cleanup avec drapeau (ou AbortController) : l'effet périmé ignore sa réponse.

## 🧾 À retenir
- useEffect = synchronisation externe, avec deps justes et cleanup.
- Toute donnée async a 3 états, TOUS rendus.
- Dérivés au rendu, événements dans les handlers — pas d'effets superflus.

## 📚 Vocabulaire
**useEffect / dépendances / cleanup** · **course (race condition)** · **AbortController** · **formulaire contrôlé** · **hook personnalisé** · **StrictMode** · **debounce** · **état discriminé**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Mes fetchs rendent les 3 états et survivent au réseau coupé.
- [ ] Mes effets ont deps justes + cleanup (zéro warning).
- [ ] J'ai extrait au moins un hook personnalisé réutilisé.

## 🔗 Liens avec le programme
Mois 4 (jours ~95-115), projet 3, UI DocSense. Leçons liées : `react-fundamentals`, `async-javascript`, `error-handling`.
