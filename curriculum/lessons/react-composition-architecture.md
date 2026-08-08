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
