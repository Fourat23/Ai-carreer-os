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

## 🧭 Exemple guidé
Une recherche filtrée, bien architecturée :
```tsx
// État minimal : on stocke la liste et le terme ; le résultat est DÉRIVÉ.
function Annuaire({ personnes }: { personnes: Personne[] }) {
  const [terme, setTerme] = useState('');
  const resultats = personnes.filter((p) =>          // dérivé, pas stocké
    p.nom.toLowerCase().includes(terme.toLowerCase())
  );
  return (
    <section>
      <ChampRecherche valeur={terme} onChange={setTerme} />  {/* callback qui remonte */}
      <ListePersonnes personnes={resultats} />               {/* props qui descendent */}
    </section>
  );
}
```
`ChampRecherche` et `ListePersonnes` sont de petits composants réutilisables ; `Annuaire`
orchestre. Le résultat filtré est dérivé (jamais un second `useState`), donc toujours
cohérent.

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

## Mini-exercice
Reprends un composant que tu as écrit et qui dépasse ~80 lignes. (1) Extrais-en deux
sous-composants nommés. (2) Identifie un état dérivé stocké à tort et supprime-le au profit
d'un calcul au rendu. (3) Extrais une logique répétée en un hook `useNomDeHook`. Explique à voix
haute OÙ vit chaque état et pourquoi.

## 📚 Vocabulaire
**composition** · **`children`** · **prop drilling** · **lifting state up** · **état dérivé**
· **`context`** · **hook personnalisé** · **mémoïsation** · **responsabilité unique**.

## 🧾 À retenir
Une bonne app React est un arbre de petits composants à responsabilité unique : les données
descendent (props), les événements remontent (callbacks), l'état vit au plus proche ancêtre
commun, et on ne stocke jamais ce qui se dérive. Le `context` sort les données transversales
du tunnel de props ; les hooks personnalisés factorisent la logique. Et on ne mémoïse
qu'après avoir MESURÉ un vrai problème — pas par réflexe.
