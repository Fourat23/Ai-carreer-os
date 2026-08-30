<!-- keep -->
# Leçon — React : composition, architecture d'état et hooks personnalisés

## 🌍 Le problème d'abord
Tu sais faire un composant qui marche. Puis l'application grandit : un composant enfle à
300 lignes, la même logique de chargement est copiée dans cinq endroits, et une donnée doit
soudain être partagée entre des composants très éloignés — alors tu la fais « descendre » de
parent en parent à travers dix niveaux (`props` partout). L'application devient un plat de
spaghettis : chaque changement en casse trois. Le problème n'est plus « comment faire un
composant » mais « comment ORGANISER beaucoup de composants et leur état pour que ça reste
modifiable ». Cette leçon donne les principes d'architecture React qui gardent une base de
code saine en grandissant.

## 🎯 Objectif
Savoir **composer** des composants (plutôt que les gonfler), **placer l'état au bon niveau**
(stocké vs dérivé, remontée d'état, `context` quand c'est justifié), **extraire la logique**
en hooks personnalisés, et savoir **quand mémoïser** — sans optimisation prématurée.

## 🧩 Prérequis
Tu dois maîtriser les composants, props, state et le re-rendu (`/doc/lessons/react-fundamentals`)
ainsi que les effets, la logique async et les hooks personnalisés
(`/doc/lessons/react-hooks-effects`), car cette leçon organise ces briques à plus grande
échelle. Les principes de clean code (fonctions courtes, responsabilité unique,
`/doc/lessons/clean-code`) sont réutilisés ici, appliqués à l'UI.

## 🧠 Modèle mental
Pense l'interface comme un ARBRE de composants, chacun avec UNE responsabilité claire, où
l'état vit au plus proche ancêtre commun de ceux qui en ont besoin. Deux forces à équilibrer :
faire DESCENDRE les données (props, du parent vers l'enfant) et faire REMONTER les événements
(callbacks, de l'enfant vers le parent). Quand une donnée doit traverser trop de niveaux sans
que les intermédiaires s'en servent, on la sort du chemin par le `context`. Et toute logique
qui se répète se range dans un **hook personnalisé** — comme on extrait une fonction.

## 💡 Pourquoi c'est important
La différence entre un projet React amateur et professionnel n'est pas de savoir écrire un
composant — c'est de savoir les ORGANISER pour que l'ajout d'une fonctionnalité reste facile
six mois plus tard. Un recruteur lit ton architecture (découpage, où vit l'état, hooks
réutilisés) comme un signal de maturité. Et l'interface de tes apps IA (mois 8+), qui gère
des états complexes (question, streaming, sources, erreurs), s'effondre sans cette discipline.

## Explication complète

### Composer plutôt que gonfler
Un composant fait UNE chose et tient à l'écran. Quand il grossit, on l'EXTRAIT en
sous-composants nommés — comme on extrait une fonction. La **composition** consiste à
assembler de petits composants : un `<Carte>` contient un `<Titre>`, un `<Corps>`, un
`<PiedDeCarte>`. La prop spéciale `children` permet à un composant d'en ENVELOPPER d'autres
sans les connaître (`<Panneau><Formulaire/></Panneau>`) — c'est plus souple que de tout
passer en props.

### Faire descendre les données, remonter les événements
Les **props** descendent (parent → enfant) ; les **callbacks** remontent (l'enfant appelle
une fonction reçue en prop pour prévenir le parent). Ce flux à sens unique rend l'app
prévisible : on sait toujours d'où vient une donnée. L'état partagé par deux frères remonte
à leur parent commun (« lifting state up ») ; l'état purement local reste dans le composant.

### Stocké vs dérivé : ne stocke que le nécessaire
La règle d'or de l'architecture d'état : ne stocke JAMAIS ce qui se CALCULE. Le nombre
d'articles se dérive du panier ; le résultat filtré se dérive de la liste + du terme de
recherche. Stocker un dérivé, c'est créer une seconde source de vérité qui se
désynchronisera. Le dérivé se recalcule au rendu — simple et toujours juste.

### Context : sortir une donnée du tunnel de props
Quand une donnée (thème, utilisateur connecté, langue) est nécessaire à beaucoup de
composants dispersés, la faire passer de props en props sur dix niveaux (« prop drilling »)
est pénible. Le **`context`** fournit cette valeur à tout un sous-arbre sans la faire
transiter par les intermédiaires. Attention : le context n'est pas un entrepôt à tout mettre
— réserve-le aux données vraiment transversales, sinon il devient un couplage global opaque.

### Hooks personnalisés : la factorisation de la logique
Un **hook personnalisé** est une fonction `useNomDeHook` qui appelle d'autres hooks pour EXTRAIRE
une logique réutilisable : `useLivres()` encapsule le chargement (les trois états
loading/error/data) et se réutilise dans plusieurs composants. C'est la factorisation du
clean code appliquée aux composants : la logique se teste et se réutilise, l'UI reste lisible.

### Quand mémoïser (et surtout quand ne pas le faire)
Par défaut, un composant se re-rend quand son état ou ses props changent — et c'est
généralement RAPIDE. `useMemo`/`useCallback`/`memo` évitent des recalculs/re-rendus, mais
ajoutent de la complexité. La règle honnête : **n'optimise pas par réflexe**. Mémoïse
seulement quand tu as MESURÉ un vrai problème de performance (une liste énorme, un calcul
lourd re-exécuté à chaque frappe). L'optimisation prématurée ajoute des bugs de dépendances
pour un gain nul dans 90 % des cas.

## Concepts clés
Composition · `children` · props (descente) vs callbacks (remontée) · lifting state up · état
stocké vs dérivé · `context` (données transversales, pas entrepôt global) · hook personnalisé
· `useMemo`/`useCallback`/`memo` (seulement après mesure) · responsabilité unique d'un
composant.

## 🧭 Exemple guidé — le composant qui a grossi, découpé sous tes yeux

Personne n'écrit un composant de 300 lignes d'un coup. On écrit 40 lignes qui vont bien,
puis on ajoute un filtre, puis un tri, puis un export, et un jour quelqu'un dit « il
faudrait découper ça ». La question intéressante n'est pas *s'il faut* découper — c'est
**où couper**, et il existe une méthode.

Voici l'annuaire d'entreprise, tel qu'il est réellement écrit après six mois.

```tsx
function Annuaire({ personnes }: { personnes: Personne[] }) {
  const [terme, setTerme] = useState('');
  const [resultats, setResultats] = useState<Personne[]>(personnes);   // ①
  const [nbResultats, setNbResultats] = useState(personnes.length);    // ②
  const [triCroissant, setTriCroissant] = useState(true);
  const [selection, setSelection] = useState<string | null>(null);

  useEffect(() => {                                                    // ③
    const filtrees = personnes.filter((p) =>
      p.nom.toLowerCase().includes(terme.toLowerCase()),
    );
    setResultats(filtrees);
    setNbResultats(filtrees.length);
  }, [terme, personnes]);

  return (
    <section>
      <input value={terme} onChange={(e) => setTerme(e.target.value)} />
      <button onClick={() => setTriCroissant((t) => !t)}>Trier</button>
      <p>{nbResultats} personne(s)</p>
      <ul>
        {[...resultats]
          .sort((a, b) => (triCroissant ? 1 : -1) * a.nom.localeCompare(b.nom))
          .map((p) => (
            <li key={p.id} onClick={() => setSelection(p.id)}>{p.nom}</li>
          ))}
      </ul>
      {selection && <FichePersonne id={selection} />}
    </section>
  );
}
```

Il fonctionne. Il n'a aucun avertissement. C'est important de le dire : ce code passerait
en production, et c'est précisément pour ça qu'on ne le corrige jamais.

### Premier passage : quel état est réellement de l'état ?

Avant de découper quoi que ce soit, on trie les cinq `useState`. Une seule question :
**cette valeur peut-elle être calculée à partir d'une autre ?**

| Valeur | Verdict | Pourquoi |
|---|---|---|
| `terme` | **état** | vient de l'utilisateur, rien ne permet de la deviner |
| `triCroissant` | **état** | idem |
| `selection` | **état** | idem |
| `resultats` ① | **dérivé** | c'est `personnes` filtré par `terme` |
| `nbResultats` ② | **dérivé** | c'est `resultats.length` |

Trois états, deux copies. Le rapport est presque toujours celui-là quand on n'a jamais posé
la question.

Les deux dérivés disparaissent, et l'effet ③ avec eux :

```tsx
const resultats = personnes.filter((p) =>
  p.nom.toLowerCase().includes(terme.toLowerCase()),
);
const nbResultats = resultats.length;
```

Deux lignes de calcul à la place de deux états et d'un effet. Ce n'est pas seulement plus
court : c'est **impossible à désynchroniser**. Avant, il existait un instant — le rendu qui
suit la frappe, avant que l'effet ne s'exécute — où `nbResultats` annonçait un nombre et la
liste en affichait un autre. Un utilisateur rapide voyait « 12 personnes » au-dessus de
4 lignes. Après, ce moment n'existe plus, parce qu'il n'y a plus deux valeurs à accorder.

**Retiens l'ordre :** on supprime les états superflus **avant** de découper. Découper
d'abord aurait figé les deux copies dans deux composants différents, et on aurait alors
« besoin » d'un context pour les partager. Beaucoup d'architectures compliquées sont nées
d'un état dérivé qu'on n'a pas vu.

### Deuxième passage : où couper

Maintenant on découpe. Le critère n'est pas le nombre de lignes — c'est le **test du
« et »** : décris le composant en une phrase, et compte les « et ».

> « Il gère la saisie de recherche **et** filtre **et** trie **et** affiche la liste **et**
> ouvre la fiche. »

Quatre « et », donc cinq responsabilités. Mais elles ne se valent pas, et c'est le point
que la plupart des découpages ratent : **certaines veulent devenir des composants, d'autres
veulent devenir des fonctions.**

| Responsabilité | Devient | Pourquoi |
|---|---|---|
| saisir un terme | `<ChampRecherche>` | a un rendu propre, réutilisable ailleurs |
| afficher la liste | `<ListePersonnes>` | idem |
| afficher une fiche | `<FichePersonne>` | déjà séparé |
| filtrer | une fonction pure | aucun rendu, aucun état |
| trier | une fonction pure | idem |

Filtrer et trier n'ont pas d'interface. En faire des composants serait une erreur
symétrique de celle qu'on vient de corriger : on emballerait du calcul dans une machinerie
de rendu. Ce sont des fonctions ordinaires, qu'on peut tester sans navigateur.

### Le résultat

```tsx
const filtrer = (ps: Personne[], t: string) =>
  ps.filter((p) => p.nom.toLowerCase().includes(t.toLowerCase()));

const trier = (ps: Personne[], croissant: boolean) =>
  [...ps].sort((a, b) => (croissant ? 1 : -1) * a.nom.localeCompare(b.nom));

function Annuaire({ personnes }: { personnes: Personne[] }) {
  const [terme, setTerme] = useState('');
  const [triCroissant, setTriCroissant] = useState(true);
  const [selection, setSelection] = useState<string | null>(null);

  const affichees = trier(filtrer(personnes, terme), triCroissant);   // dérivé

  return (
    <section>
      <ChampRecherche valeur={terme} onChange={setTerme} />
      <BasculeTri croissant={triCroissant} onBascule={setTriCroissant} />
      <p>{affichees.length} personne(s)</p>
      <ListePersonnes personnes={affichees} onSelection={setSelection} />
      {selection && <FichePersonne id={selection} />}
    </section>
  );
}
```

`Annuaire` ne fait plus qu'une chose : **orchestrer**. Il détient les trois états, calcule
ce qui en découle, et distribue. Il n'affiche presque rien lui-même, et sa description tient
maintenant sans « et » : *« il coordonne la recherche dans l'annuaire »*.

Note la direction des flèches, parce que c'est tout le modèle : **les données descendent**
en props (`personnes={affichees}`), **les intentions remontent** en fonctions de rappel
(`onSelection={setSelection}`). `ListePersonnes` ne sait pas ce qu'est une sélection ; elle
signale qu'on a cliqué sur quelqu'un, et c'est l'orchestrateur qui décide de ce que ça veut
dire. C'est ce qui la rend réutilisable dans un autre écran où le clic ferait autre chose.

### Ce que cet exemple ne dit pas

Il ne dit pas qu'il faut découper tôt. Un composant de 60 lignes qui fait une chose n'a
aucun besoin d'être coupé, et le découper produit une arborescence de fichiers qui coûte
plus à lire qu'elle ne rapporte.

Le bon moment est celui où la **description** devient composée, pas celui où le fichier
devient long. Un composant de 200 lignes qui affiche un tableau complexe est parfaitement
sain ; un composant de 50 lignes qui charge des données **et** gère un formulaire mérite
d'être coupé en deux.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Pour éviter le prop drilling, tu mets l'état de l'application dans un `context`
   unique. Que se passe-t-il quand une seule de ses valeurs change ?
2. Tu enveloppes un composant dans `memo` et tu lui passes `style={{ color: 'red' }}`.
   Le `memo` sert-il à quelque chose ?
3. Tu stockes `resultats` dans un `useState` et tu le mets à jour dans un `useEffect`
   qui écoute `terme`. Nomme deux bugs que cela produit.
4. À quel moment un composant devient-il « trop gros » ?

## ✅ Correction attendue

**La démarche.** Deux questions, dans cet ordre : **où doit vivre cette donnée** (au plus
proche ancêtre commun de ceux qui en ont besoin), et **est-elle stockée ou dérivée**. Tout
le reste — context, hooks personnalisés, mémoïsation — n'intervient qu'après.

**L'erreur probable, et elle transforme un inconfort en problème de performance.** Le
prop drilling est pénible, `context` le supprime, la conclusion « mettons tout dans un
context » s'impose d'elle-même. Ce qu'elle produit :

**tout consommateur d'un context se re-rend lorsque la VALEUR du context change — quelle
que soit la partie qu'il utilise.** React ne sait pas que ton composant ne lit que
`context.theme` : il compare la valeur entière, par identité. Un context qui contient
`{ user, theme, panier, notifications }` re-rend donc l'intégralité des consommateurs à
chaque ajout au panier, y compris ceux qui n'affichent que le thème.

S'y ajoute un piège d'identité que presque tout le monde rencontre :

```tsx
// ❌ un objet neuf à CHAQUE rendu du provider → tous les consommateurs se re-rendent,
//    même si user et theme n'ont pas bougé d'un octet
<AppContext.Provider value={{ user, theme }}>
```

La valeur est un **littéral d'objet** : une nouvelle référence à chaque rendu. La
comparaison par identité échoue toujours, et le context notifie tout le monde en
permanence.

Les parades : **découper en plusieurs contexts** selon la fréquence de changement — un
pour le thème, qui ne bouge jamais ; un pour le panier, qui bouge souvent — et
**stabiliser la valeur** avec `useMemo`. C'est d'ailleurs l'un des rares cas où
`useMemo` se justifie sans avoir mesuré : il ne sert pas ici à gagner du temps de calcul,
il sert à **préserver une identité**, ce qui est un problème de correction et non de
performance.

Le piège séduit parce que le prop drilling est **visible et pénible** — dix niveaux de
props qu'on écrit à la main — tandis que le coût du context est **invisible** : rien
n'échoue, rien ne ralentit tant que l'application est petite. On échange un inconfort
qu'on ressent contre une dette qu'on ne perçoit pas. La règle utile : le context sert à
**diffuser ce qui change rarement**, pas à ranger l'état.

**Sur les autres questions.** `memo` avec un `style={{...}}` en ligne ne sert à **rien** :
l'objet littéral crée une nouvelle référence à chaque rendu du parent, la comparaison
superficielle des props échoue systématiquement, et le composant se re-rend toujours. On a
ajouté un `memo`, une comparaison à chaque rendu, et de la complexité, pour un gain
exactement nul. C'est le cas le plus fréquent de mémoïsation inutile, et il est
indétectable sans profiler — le code a l'air optimisé.

Stocker `resultats` dans un `useState` alimenté par un `useEffect` produit deux bugs
distincts. D'abord un **rendu de trop avec des données périmées** : au premier rendu après
la frappe, `resultats` contient encore l'ancien filtrage, et l'utilisateur voit brièvement
le résultat précédent. Ensuite, une **désynchronisation durable** dès qu'un autre chemin
modifie `personnes` sans passer par cet effet : deux sources de vérité pour la même
information, et rien ne garantit qu'elles s'accordent. Calculer au rendu supprime les deux
d'un coup, parce qu'il n'y a plus qu'une source.

Enfin, un composant est « trop gros » non pas à un nombre de lignes, mais **quand on ne
peut plus le nommer d'un seul mot**. Si sa description demande un « et » — « il affiche la
liste **et** gère le formulaire **et** appelle l'API » — il y a autant de composants que de
« et ». Le seuil est sémantique, pas typographique.

**Alternative défendable.** Pour un état vraiment global et très mouvant, une bibliothèque
de gestion d'état à abonnement sélectif est supérieure au context : chaque composant
s'abonne à la **tranche** qui l'intéresse et ne se re-rend que si elle change, ce que le
context ne sait pas faire nativement. C'est le bon outil pour un panier, un éditeur
collaboratif, un tableau de bord temps réel — et de la complexité gratuite pour un thème.

**Vérifie seul, sans corrigé** :
1. Ouvre le profiler React et tape une lettre dans un champ. Quels composants se
   re-rendent ? Ceux qui n'ont rien à voir avec ce champ désignent un context trop large.
2. Cherche `value={{` dans tes providers. Chaque occurrence est une valeur neuve à chaque
   rendu.
3. Prends ton plus gros composant et décris-le en une phrase. Compte les « et ».

## ⚠️ Erreurs fréquentes
- Le composant « Dieu » de 300 lignes qui fait tout : décompose en sous-composants nommés.
- Stocker un dérivé dans un `useState` (puis un `useEffect` pour le tenir à jour) → double
  source de vérité et bugs de synchronisation. Calcule au rendu.
- Tout mettre dans un `context` global → couplage opaque et re-rendus inutiles.
- Mémoïser partout « au cas où » → complexité et bugs de dépendances pour un gain nul.

## 🔗 Liens avec le programme
Ces principes prolongent `/doc/lessons/clean-code` (responsabilité unique, factorisation)
côté UI et `/doc/lessons/architecture-basics` (frontières, dépendances) à l'échelle du
frontend. L'interface de DocSense (mois 11) applique tout ceci : petits composants, état
minimal au bon niveau, un `useQuestion()` réutilisé, un `context` pour l'utilisateur.

## 🛠️ Pratique — le rapport de découpage

**Contexte.** Prends le plus gros composant que **tu** as écrit — celui devant lequel tu
hésites avant d'ouvrir le fichier. À défaut, prends celui-ci : un écran « Commandes » qui
charge une liste depuis une API, offre un filtre par statut, un tri par date, une sélection
multiple avec cases à cocher, un bouton « Exporter la sélection » et un panneau de détail
qui s'ouvre à droite.

Cette pratique produit un **rapport de découpage** : le document qu'on écrit avant de
toucher au code, et qu'on fait relire. C'est exactement ce qu'on attend d'un développeur
qui propose une refonte, et c'est ce qui distingue une refonte d'un grand remaniement à
l'aveugle.

**Écris les cinq parties suivantes.**

**1. L'inventaire de l'état.** Un tableau : `valeur` · `état ou dérivé` · `si dérivé, de
quoi` · `si état, d'où elle vient`. Une ligne par `useState`, `useReducer` et `useRef` du
composant. Aucune ligne ne doit rester sans verdict.

**2. Le test du « et ».** Écris la description du composant en **une** phrase, telle
qu'elle sort naturellement, avec ses « et ». Puis la liste numérotée des responsabilités
qu'elle révèle.

**3. Le tri composant / fonction.** Pour chaque responsabilité : `deviendra un composant`
ou `deviendra une fonction pure`, avec la raison. Rappel du critère : une responsabilité
sans rendu propre n'est pas un composant.

**4. Le découpage proposé.** L'arborescence cible, avec pour chaque nouveau composant :
son nom, ses props entrantes, ses fonctions de rappel sortantes, et — la colonne qui
compte — **l'état qu'il ne possède pas**. Écris ensuite en une phrase où vit chaque état
restant et pourquoi il ne peut pas descendre plus bas.

**5. Le coût et l'ordre.** Trois choses :
- ce que le découpage **ne corrigera pas** (il y a toujours quelque chose) ;
- le **premier** changement à faire, et pourquoi celui-là d'abord ;
- une chose que tu ne découpes **pas** délibérément, avec ta justification.

**Critère de réussite.** (a) Ton inventaire contient au moins un état qui se révèle dérivé —
si aucun ne l'est, relis-le, c'est très rare ; (b) au moins une responsabilité devient une
fonction et non un composant ; (c) pour chaque état conservé, tu peux nommer les deux
composants au moins qui le lisent, sinon il est trop haut ; (d) la partie 5 est écrite, y
compris le « je ne découpe pas ceci ».

**Durée.** 45 à 60 minutes. Aucun code n'est écrit — c'est volontaire : la valeur de cette
pratique est de constater que la décision se prend **avant** l'éditeur, et qu'elle
s'argumente.

## ✅ Correction

Cette pratique portant sur ton propre code, la correction donne la grille de relecture, le
corrigé de l'écran « Commandes » proposé en repli, et les trois erreurs de raisonnement qui
reviennent.

### Le corrigé de l'écran « Commandes »

**1. Inventaire de l'état**

| Valeur | Verdict | Détail |
|---|---|---|
| `commandes` | état | vient de l'API |
| `chargement`, `erreur` | état | issus de la même requête |
| `statutFiltre` | état | choix de l'utilisateur |
| `triDate` | état | choix de l'utilisateur |
| `idsSelectionnes` | état | choix de l'utilisateur |
| `detailOuvert` | état | choix de l'utilisateur |
| `commandesAffichees` | **dérivé** | `commandes` filtré puis trié |
| `nbSelectionnees` | **dérivé** | `idsSelectionnes.size` |
| `toutSelectionne` | **dérivé** | `idsSelectionnes.size === commandesAffichees.length` |
| `exportPossible` | **dérivé** | `idsSelectionnes.size > 0` |

Six états, quatre dérivés. `toutSelectionne` mérite un mot : c'est l'état de la case à
cocher de l'en-tête, et le stocker est **le** bug classique de ce type d'écran. Stocké, il
reste à `true` après un changement de filtre qui a fait apparaître de nouvelles lignes non
cochées : l'en-tête affirme que tout est sélectionné, ce qui est faux, et l'export part avec
la mauvaise liste. Dérivé, l'incohérence est impossible.

**2. Le test du « et »**

> « Il charge les commandes **et** les filtre **et** les trie **et** gère une sélection
> multiple **et** exporte la sélection **et** affiche le détail d'une commande. »

Six responsabilités.

**3. Le tri**

| Responsabilité | Devient | Pourquoi |
|---|---|---|
| charger | un hook `useCommandes()` | logique avec état, sans rendu |
| filtrer, trier | deux fonctions pures | ni rendu ni état |
| barre de filtres | `<BarreFiltres>` | rendu propre |
| tableau + sélection | `<TableauCommandes>` | rendu propre |
| bouton export | `<BoutonExport>` | rendu propre |
| détail | `<PanneauDetail>` | rendu propre |

Noter le hook. C'est la troisième catégorie, celle qu'on oublie : une responsabilité qui a
de l'**état** mais pas de **rendu**. En faire un composant obligerait à inventer un rendu
inutile ; en faire une fonction pure est impossible, il y a un `useEffect` dedans. Le hook
personnalisé existe exactement pour ce cas.

**4. Le découpage**

```
<EcranCommandes>                    ← détient les 6 états, calcule les 4 dérivés
  useCommandes()                    ← charge : {commandes, chargement, erreur, recharger}
  <BarreFiltres statut onStatut />
  <TableauCommandes
      lignes={commandesAffichees}   ← dérivé, jamais un état
      selection={idsSelectionnes}
      toutCoche={toutSelectionne}   ← dérivé
      onBasculerLigne onBasculerTout onOuvrirDetail />
  <BoutonExport actif={exportPossible} onExport />
  {detailOuvert && <PanneauDetail id={detailOuvert} onFermer />}
```

Pourquoi `idsSelectionnes` ne peut pas descendre dans `<TableauCommandes>` : parce que
`<BoutonExport>` en a besoin aussi. C'est la règle du plus proche ancêtre commun, appliquée
littéralement. Si l'export était rendu *à l'intérieur* du tableau, la sélection pourrait y
descendre — la position de l'état dépend de la forme de l'arbre, pas d'un principe abstrait.

**5. Coût et ordre**

- **Ce que ça ne corrige pas :** la lenteur si l'API renvoie 5 000 commandes. Le découpage
  n'a jamais accéléré quoi que ce soit ; il rend seulement lisible l'endroit où ajouter une
  pagination.
- **Le premier changement :** supprimer les quatre dérivés. C'est le seul qui corrige un
  **bug** — celui de `toutSelectionne` — et il se fait sans déplacer une seule ligne de JSX,
  donc sans risque.
- **Ce qu'on ne découpe pas :** l'intérieur de `<PanneauDetail>`, même s'il fait 150 lignes,
  parce qu'il fait une seule chose. La longueur n'est pas le critère.

### Les trois erreurs de raisonnement

**Découper avant de trier l'état.** L'erreur la plus coûteuse, et la plus fréquente. On
répartit les six responsabilités en six composants, chacun emportant les états qu'il
utilise — dont les dérivés. Deux composants détiennent alors deux copies de la même
information, et il faut « les synchroniser ». On introduit un context, ou pire un effet qui
recopie l'un dans l'autre. Le résultat est une architecture qui a l'air sophistiquée et dont
la complexité entière vient d'un `.length` qu'on aurait pu calculer.

**Croire que « découper » veut dire « faire des composants ».** Trois catégories, pas une :
composant (rendu), hook (état sans rendu), fonction pure (ni l'un ni l'autre). Un découpage
qui ne produit que des composants a raté au moins une extraction, et probablement la plus
facile à tester.

**Placer l'état « en haut, on verra bien ».** Tout mettre dans le composant racine ou dans un
context global supprime la question, et la remplace par un problème de rendu : chaque frappe
dans le filtre re-rend l'écran entier. La règle « au plus proche ancêtre commun » se lit dans
les deux sens — *aussi bas que possible*, et pas plus bas.

### Généralisation

Ce rapport n'a de spécifique à React que son vocabulaire. Le même document, avec d'autres
mots, s'écrit avant de découper un service devenu trop gros : *quelles données possède-t-il
réellement, lesquelles ne fait-il que recopier, quelles responsabilités porte-t-il, laquelle
mérite un service à part et laquelle n'est qu'une bibliothèque, et qu'est-ce qui restera
cassé après.*

La compétence n'est pas « savoir découper ». C'est **savoir défendre un découpage** — parce
que le découpage sera contesté, souvent par quelqu'un qui préfère celui qu'il aurait fait.
Un rapport qui dit d'où vient chaque décision transforme un débat de goûts en une
conversation sur des faits.

## 📚 Vocabulaire
**composition** · **`children`** · **prop drilling** · **lifting state up** · **état dérivé**
· **`context`** · **hook personnalisé** · **mémoïsation** · **responsabilité unique**.

## 🧾 À retenir
Une bonne app React est un arbre de petits composants à responsabilité unique : les données
descendent (props), les événements remontent (callbacks), l'état vit au plus proche ancêtre
commun, et on ne stocke jamais ce qui se dérive. Le `context` sort les données transversales
du tunnel de props ; les hooks personnalisés factorisent la logique. Et on ne mémoïse
qu'après avoir MESURÉ un vrai problème — pas par réflexe.
