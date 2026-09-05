<!-- keep -->
# Leçon — Performance frontend : mesurer avant d'optimiser

## 🌍 Le problème d'abord
Ton interface « rame » : une liste qui saccade à la frappe, une page lente à s'afficher sur mobile.
Le réflexe du débutant : saupoudrer `useMemo`/`useCallback`/`memo` PARTOUT « pour optimiser ». Résultat
fréquent : plus de complexité, des bugs de dépendances, et… aucun gain mesurable, parce que le vrai
coût était ailleurs (une image de 4 Mo, un bundle énorme, un re-rendu géant). Le problème : on optimise
à l'aveugle. La performance frontend se RAISONNE et se MESURE ; on corrige ensuite le vrai goulot.
Cette leçon t'apprend à diagnostiquer avant d'agir.

## 🎯 Objectif
Savoir raisonner la performance d'une interface : comprendre le coût du rendu et des re-rendus,
identifier un vrai goulot par la MESURE (profiling) plutôt que par intuition, et connaître les leviers
adaptés (mémoïsation ciblée, lazy loading / code splitting, poids des images, réseau/cache) — sans
tomber dans l'optimisation prématurée.

## 🧩 Prérequis
Tu dois comprendre le rendu et les re-rendus React (`/doc/lessons/react-fundamentals`) et les
bases du réseau/HTTP et du cache (`/doc/lessons/http-rest-json`, `/doc/lessons/caching-performance`).
La **mémoïsation** n'est pas supposée connue : elle est définie et mesurée ici, et c'est justement
son usage par réflexe que cette leçon cherche à corriger.

> **Où trouver le détail.** `/doc/lessons/react-composition-architecture` traite le découpage en
> composants et le placement de l'état — le levier que cette leçon place **avant** la mémoïsation
> dans son tableau. Elle est **programmée plus loin** dans le parcours ; rien ici ne suppose que
> tu l'as lue.

> **Étagère de référence.** `/doc/lessons/responsive-design` traite la performance perçue sur
> mobile. Elle n'est programmée par aucune des 365 journées — rien dans cette leçon ne suppose
> que tu l'as lue. Le seul point utile ici : sur mobile, le réseau et le processeur sont
> plusieurs fois plus lents que sur ton poste, donc **c'est là que se joue la performance de
> chargement**, et c'est la configuration qu'il faut simuler pour mesurer.

## 🧠 Modèle mental
La performance n'est pas une intuition, c'est une MESURE. Avant toute optimisation, pose deux
questions : « est-ce vraiment lent, pour qui, et OÙ exactement ? ». Un profil (outils du navigateur,
profiler React) te montre le vrai coût ; sans lui, tu optimises du bruit. Le second principe :
distingue le temps de CHARGEMENT (obtenir et afficher la page : réseau, bundle, images) du temps
d'EXÉCUTION (réactivité pendant l'usage : re-rendus, calculs). Ce sont deux problèmes différents, avec
des leviers différents. « Mesure d'abord, optimise le goulot, re-mesure. »

## 💡 Pourquoi c'est important
Une interface lente perd des utilisateurs et se fait pénaliser au référencement. Mais une
sur-optimisation prématurée coûte cher aussi : du code plus complexe, des bugs, pour un gain nul. Un
développeur qui sait MESURER et cibler la vraie cause livre des interfaces rapides sans alourdir le
code inutilement — un équilibre que les recruteurs et les équipes valorisent. C'est aussi ce qui rend
tes apps (y compris IA, avec du streaming) utilisables en conditions réelles.

## Explication complète

### Le coût du rendu et les re-rendus inutiles
Par défaut, un composant se re-rend quand son état ou ses props changent, et re-rend ses enfants.
C'est GÉNÉRALEMENT rapide. Le problème n'apparaît que si un re-rendu est à la fois FRÉQUENT et COÛTEUX
(une grande liste, un calcul lourd) — ou si un re-rendu se propage inutilement à tout un sous-arbre.
Le bon réflexe : d'abord identifier AVEC le profiler React quels composants re-rendent trop, puis
agir. Éviter les re-rendus inutiles passe souvent par une meilleure ARCHITECTURE (état plus bas, état
dérivé au bon endroit) avant toute mémoïsation.

### Mémoïsation ciblée (après mesure)
`useMemo` (mémoriser un calcul), `useCallback` (mémoriser une fonction), `memo` (éviter le re-rendu
d'un composant à props inchangées) sont des outils LÉGITIMES — mais coûteux en lisibilité et sources
de bugs de dépendances. Règle honnête : ne les applique qu'après avoir MESURÉ un vrai problème (une
liste de milliers d'éléments, un calcul lourd re-exécuté à chaque frappe). Mémoïser par réflexe ajoute
de la complexité pour un gain nul dans la grande majorité des cas.

### Chargement : bundle et code splitting
Tout le JavaScript de l'app n'a pas besoin d'arriver d'un coup. Le **code splitting** (chargement
paresseux / *lazy loading*) découpe le bundle et ne charge une partie qu'au moment utile (une route,
une vue lourde). Résultat : la première page s'affiche plus vite. On charge « à la demande » ce qui
n'est pas immédiatement nécessaire.

### Images et médias
Souvent le vrai coupable d'une page lente. Sers des images à la bonne taille (pas une photo de 4000 px
pour une vignette), dans un format efficace, avec `loading="lazy"` pour celles hors écran, et des
dimensions déclarées pour éviter les décalages de mise en page. Une seule grosse image mal servie
ruine plus la performance que dix `useMemo` oubliés.

### Réseau et cache
Réduis et regroupe les requêtes, évite les allers-retours en cascade, et réutilise ce qui peut l'être
(cache HTTP, cache côté client). La performance PERÇUE compte aussi : afficher un état de chargement
immédiat (squelette, spinner) rend l'attente acceptable même quand les données tardent.

### Les Core Web Vitals (au bon niveau)
Des indicateurs standard mesurent l'expérience réelle : rapidité d'affichage du contenu principal,
réactivité aux interactions, stabilité visuelle (éviter que le contenu « saute » pendant le
chargement). Tu n'as pas à les mémoriser par cœur : retiens qu'on MESURE l'expérience utilisateur, on
ne la devine pas.

## Concepts clés
Mesure/profiling avant optimisation · chargement vs exécution · re-rendus inutiles (architecture avant
mémoïsation) · `useMemo`/`useCallback`/`memo` (ciblés, après mesure) · code splitting / lazy loading ·
poids et service des images (`loading="lazy"`, dimensions) · réseau/cache · performance perçue · Core
Web Vitals.

## 🧭 Exemple guidé — deux boucles identiques, un facteur 420

La performance est le domaine où l'intuition se trompe le plus souvent, et où elle se trompe
**avec assurance**. Voici deux mesures qui le montrent, et une méthode qui en découle.

> Les durées ci-dessous sont **mesurées** par
> `scripts/v70-verifications/perf-thrash-et-rendus.mjs` dans Chromium. Les valeurs absolues
> dépendent de la machine ; ce qui compte, et ce que tu retrouveras chez toi, est le rapport
> entre les deux.

### Première mesure : le code qui ralentit sans rien faire de lourd

Deux boucles. Elles produisent exactement le même résultat sur 2 000 éléments : lire la
hauteur de chacun, et lui donner cette hauteur plus un pixel.

```js
// Version A — je lis, j'écris, je lis, j'écris…
for (const el of els) {
  el.style.height = el.offsetHeight + 1 + 'px';
}

// Version B — je lis TOUT, puis j'écris TOUT
const hauteurs = els.map((el) => el.offsetHeight);
els.forEach((el, i) => (el.style.height = hauteurs[i] + 1 + 'px'));
```

Mesure :

| Version | Durée |
|---|---|
| A — entrelacée | **9 088,7 ms** |
| B — groupée | **21,6 ms** |

**Un rapport de 420.** Neuf secondes contre deux centièmes, pour un code qui fait la même
chose, avec le même nombre d'opérations, sans qu'aucune ligne ne soit visiblement « lourde ».

Personne ne devine ce résultat en lisant le code. Et surtout : aucun des réflexes habituels ne
l'aurait trouvé. Ce n'est pas une boucle mal écrite, pas un algorithme quadratique, pas un
calcul coûteux.

**L'explication.** `offsetHeight` n'est pas une lecture de variable : c'est une **question posée
au navigateur** — « quelle hauteur cet élément a-t-il *actuellement* à l'écran ? ». Pour y
répondre, il faut que la mise en page soit à jour.

Or le navigateur, laissé tranquille, regroupe les écritures de style et ne recalcule la mise en
page qu'une fois, à la fin. C'est son optimisation principale. En intercalant une question
après chaque écriture, la version A l'oblige à recalculer **avant chaque réponse**. Deux mille
recalculs de mise en page au lieu d'un.

Ce motif porte un nom — on parle de *layout thrashing*, littéralement « le piétinement de la
mise en page ». Il apparaît dès qu'on lit une propriété géométrique (`offsetTop`, `clientWidth`,
`getBoundingClientRect()`, `scrollHeight`) à l'intérieur d'une boucle qui écrit aussi. La
correction est toujours la même, et elle ne coûte rien : **séparer les lectures des écritures.**

### Deuxième mesure : le rendu qu'on ne voit pas

Un écran avec un champ de recherche et 500 lignes affichées. La liste ne dépend pas du champ —
c'est un cas courant, où le champ et la liste partagent simplement un parent.

Combien de composants sont re-rendus quand l'utilisateur tape **une** lettre ?

| | rendus au montage | rendus pour une frappe |
|---|---|---|
| ligne ordinaire | 500 | **500** |
| ligne enveloppée dans `memo` | 500 | **0** |

Cinq cents composants recalculés pour un caractère tapé, alors que pas une ligne n'a changé.
Multiplie par la vitesse de frappe : une saisie de dix caractères déclenche cinq mille rendus.

C'est ce qui produit la sensation de saccade — non pas une opération lente, mais un travail
inutile répété à chaque événement.

### Ce que ces deux mesures enseignent ensemble

Elles décrivent le même phénomène sous deux formes : **le coût vient de la répétition d'un
travail invisible, pas de la lourdeur d'une opération visible.** C'est pour cela que le
« relire son code en cherchant ce qui a l'air lent » ne donne rien.

D'où la méthode, en quatre temps, dans cet ordre :

**1. Mesurer d'abord.** Pas « ça semble lent » : un nombre. Combien de millisecondes, combien
de rendus, combien de requêtes, quelle taille transférée. Sans nombre de départ, on ne pourra
même pas dire si la correction a servi.

**2. Comprendre la cause.** 500 rendus par frappe est un fait ; « le parent re-rend ses enfants
à chaque changement d'état » est la cause. Corriger sans cause, c'est déplacer le problème.

**3. Choisir le levier adapté.** Et ici, l'ordre compte énormément :

| Levier | Quand | Coût |
|---|---|---|
| **architecture** | l'état est trop haut : le champ pourrait vivre dans un composant qui n'englobe pas la liste | nul, souvent moins de code |
| **`memo`** | l'architecture est correcte et les enfants sont réellement nombreux ou coûteux | une comparaison à chaque rendu, du code en plus |
| **`useMemo`** | un **calcul** est réellement coûteux, ou une identité doit être stable | idem |
| **virtualisation** | des milliers de lignes affichées | une dépendance, de la complexité |

L'architecture d'abord, toujours. Descendre l'état du champ de recherche dans un petit
composant qui n'englobe pas la liste supprime les 500 rendus **sans ajouter une seule ligne**.
Le `memo` les supprime aussi, mais en ajoutant une comparaison permanente et une contrainte à
respecter pour toujours — car il suffit d'une prop non stable pour l'annuler silencieusement.

**4. Re-mesurer.** C'est l'étape qu'on saute, et c'est celle qui distingue une optimisation
d'une superstition. Sans elle, on accumule des `memo` et des `useMemo` dont personne ne sait
lesquels servent — et retirer un `useMemo` inutile devient impossible, parce que personne
n'ose.

### Le piège qui annule tout

```jsx
<LigneMemo nom={p.nom} style={{ color: 'red' }} onClick={() => choisir(p.id)} />
```

Ce `memo` ne sert à **rien**. `style` est un littéral d'objet et `onClick` une fonction
fléchée : deux nouvelles références à chaque rendu du parent. La comparaison superficielle des
props échoue systématiquement, l'enfant se re-rend toujours, et on a ajouté une comparaison
pour un gain exactement nul.

C'est le cas le plus fréquent de mémoïsation inutile, et il est indétectable à la lecture — le
code a l'air optimisé. Seule la mesure du point 4 le révèle.

### La question à se poser avant tout

Avant d'optimiser quoi que ce soit : **est-ce que quelqu'un ressent ce problème ?**

Les 9 secondes de la version A, oui — l'interface se fige. Les 500 rendus par frappe, en
général oui, sur un téléphone. Un calcul de 0,3 ms exécuté deux fois par minute, non, jamais,
et le `useMemo` qu'on y placerait est du code à maintenir pour rien.

L'optimisation prématurée n'est pas condamnée parce qu'elle serait inutile : elle l'est parce
qu'elle **ajoute des contraintes permanentes** — ne pas passer d'objet littéral, garder les
dépendances stables — en échange d'un gain que personne n'a mesuré.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Ta page met quatre secondes à s'afficher. Tu ajoutes `useMemo` sur tes calculs et
   `memo` sur tes composants. Combien de temps gagnes-tu ?
2. `useMemo(() => a + b, [a, b])`. Bonne ou mauvaise idée ?
3. Une liste de 5 000 lignes saccade. Tu mémoïses la ligne. Est-ce le bon levier ?
4. Comment sais-tu qu'une optimisation a marché ?

## ✅ Correction attendue

**La démarche.** Mesurer, identifier le goulot, appliquer **un** levier adapté à **ce**
goulot, re-mesurer. Les trois étapes comptent, et c'est la première qu'on saute.

**L'erreur probable : appliquer un levier d'exécution à un problème de chargement.** Face
à une page lente, la mémoïsation est le premier outil qui vient — c'est le plus enseigné,
le plus discuté, et il donne l'impression d'optimiser. Sur les quatre secondes décrites,
il fait gagner **zéro milliseconde**.

Ces quatre secondes se passent avant que le moindre composant ne se rende : télécharger le
bundle, l'analyser, l'exécuter, chercher les données, charger les images. `useMemo` évite
de recalculer une valeur **pendant** un rendu — il agit sur un temps qui n'a pas encore
commencé.

La leçon insiste sur cette séparation parce que c'est elle qui gouverne le choix du
levier :

| Symptôme | Nature | Leviers |
|---|---|---|
| la page met du temps à **apparaître** | chargement | bundle, code splitting, images, réseau, cache |
| la page réagit mal **pendant** l'usage | exécution | architecture d'état, mémoïsation ciblée, virtualisation |

Le piège séduit parce que **« lent » est un seul mot pour deux phénomènes** qui n'ont rien
en commun. L'utilisateur dit « c'est lent » dans les deux cas, le développeur entend un
problème unique, et il attrape l'outil dont il a le plus entendu parler. La cause la plus
fréquente d'une page lente reste d'ailleurs une image mal dimensionnée : un fichier de
4 Mo coûte plus cher que tous les rendus React de la page réunis.

**Sur les autres questions.** `useMemo(() => a + b, [a, b])` est une **mauvaise** idée, et
c'est net : mémoriser une addition coûte plus cher que l'addition. Il faut allouer le
tableau de dépendances, le comparer élément par élément, retenir le résultat. Une addition
est de l'ordre de la nanoseconde ; la machinerie du `useMemo` est plus lourde. On a
ajouté du code, un risque de dépendance oubliée, et on a rendu le programme **plus lent**.
`useMemo` se justifie pour un calcul réellement coûteux — un tri de dix mille éléments,
une agrégation — ou pour stabiliser une **identité** dont dépend un `memo` ou un effet.

Mémoïser la ligne d'une liste de 5 000 éléments n'est pas le bon levier : même
parfaitement mémoïsées, **5 000 lignes existent dans le DOM**, et c'est le navigateur qui
peine — mise en page, peinture, mémoire. Le levier adapté est la **virtualisation** : ne
rendre que la vingtaine de lignes visibles et recycler les nœuds au défilement. On passe
de 5 000 éléments à 20, ce qu'aucune mémoïsation ne peut approcher.

Enfin, on sait qu'une optimisation a marché **en re-mesurant la métrique qui avait
motivé le travail**, dans les mêmes conditions — même appareil, même réseau simulé, même
jeu de données. Sans mesure d'après, on ne sait rien : ni si le gain existe, ni s'il vient
du bon changement. C'est aussi le seul moyen de découvrir qu'on a dégradé autre chose.

**Alternative défendable.** Optimiser la performance **perçue** plutôt que la performance
réelle est souvent le meilleur rapport effort/résultat : un squelette de contenu affiché
immédiatement, un rendu progressif, une réponse optimiste à un clic. La page n'est pas
plus rapide et l'expérience est nettement meilleure — parce que ce que l'utilisateur
mesure n'est pas une durée, c'est une attente pendant laquelle il ne se passe rien.

**Vérifie seul, sans corrigé** :
1. Ouvre l'onglet réseau, recharge, et regarde le poids total. Compare-le à ton temps de
   rendu React. Lequel des deux domine ?
2. Cherche tes `useMemo`. Pour chacun, le calcul mémorisé est-il plus coûteux que la
   comparaison des dépendances ?
3. Mesure avant, change **une** chose, mesure après. Si tu changes deux choses, tu
   n'apprendras rien de l'écart.

## ⚠️ Erreurs fréquentes
- Optimiser sans mesurer : ajouter `useMemo`/`memo` partout « au cas où » → complexité, bugs, gain nul.
- Ignorer les vrais goulots (images énormes, bundle massif) au profit de micro-optimisations React.
- Charger tout le bundle d'un coup au lieu de découper (code splitting) les vues lourdes.
- Servir des images surdimensionnées, sans `loading="lazy"` ni dimensions → lenteur et décalages.
- Confondre performance réelle et performance perçue : sans état de chargement, l'attente semble un bug.

## 🔗 Liens avec le programme
Cette leçon s'appuie sur `/doc/lessons/react-composition-architecture` (mémoïsation après mesure) et
`/doc/lessons/caching-performance` (cache, principes de performance) appliqués au front. Elle rejoint
`/doc/lessons/responsive-design` (performance perçue sur mobile) et
`/doc/lessons/react-application-states` (états de chargement). L'UI de tes apps IA (streaming) tire
directement parti de ces réflexes.

## 🛠️ Pratique — le compte rendu d'optimisation

**Contexte.** Reproduis toi-même l'écran mesuré dans l'exemple guidé : un champ de recherche
et une liste de 500 lignes rendues par un composant `<Ligne>`, le tout dans un même parent.
Ajoute un compteur de rendus dans `<Ligne>` :

```jsx
let rendus = 0;
function Ligne({ nom }) { rendus++; return <li>{nom}</li>; }
// dans la console : rendus
```

**Ta production : un compte rendu d'optimisation**, c'est-à-dire le document qu'on joint à une
demande de fusion pour justifier un changement de performance. Il a toujours la même forme, et
c'est celle qu'on te demandera en poste.

**1. La mesure de départ.** Un tableau avec au moins trois nombres, tous relevés avant de
toucher au code :

| Mesure | Valeur |
|---|---|
| rendus de `<Ligne>` au montage | |
| rendus de `<Ligne>` pour une frappe | |
| durée de traitement d'une frappe (onglet Performance) | |

**2. L'hypothèse, écrite avant vérification.** Une phrase : « je pense que la cause est… ».
Écris-la même si tu te trompes — surtout si tu te trompes, c'est cette ligne qui a de la
valeur en partie 5.

**3. Trois corrections, mesurées séparément.** Applique-les **une par une**, en revenant à
l'état de départ entre chaque, et relève le même tableau :

- **C1 — architecture** : descends l'état du champ dans un composant `<Recherche>` qui
  n'englobe pas la liste ;
- **C2 — `memo`** : laisse l'architecture d'origine et enveloppe `<Ligne>` dans `memo` ;
- **C3 — `memo` saboté** : garde C2 et passe en plus `style={{ color: 'red' }}` à chaque
  ligne.

**4. Le tableau comparatif.** Quatre colonnes : `départ`, `C1`, `C2`, `C3`. Le résultat de C3
doit te surprendre ; s'il ne te surprend pas, tu avais déjà compris, dis-le.

**5. La recommandation.** C'est la partie notée. Écris :
- **laquelle** tu retiens et **pourquoi**, en citant tes nombres ;
- le **coût permanent** de ce choix — ce que l'équipe devra respecter pour toujours ;
- si ton hypothèse de la partie 2 était **fausse**, en quoi ;
- une situation où tu recommanderais l'**autre** correction.

**6. Le test de nécessité.** Une phrase honnête : sur une machine récente, un utilisateur
aurait-il **remarqué** le problème de départ ? Si la réponse est non, dis-le et explique
pourquoi tu recommandes ou non le changement quand même.

**Critère de réussite.** (a) Tous les nombres sont relevés, pas estimés ; (b) C1 et C2 donnent
le même gain de rendus mais tu recommandes l'un des deux avec un argument qui n'est pas le
nombre de rendus ; (c) tu as expliqué C3 ; (d) la partie 6 est écrite et peut conclure « ce
n'était pas nécessaire ».

**Durée.** 60 à 75 minutes.

## ✅ Correction

### Les résultats attendus

| Mesure | Départ | C1 (architecture) | C2 (`memo`) | C3 (`memo` saboté) |
|---|---|---|---|---|
| rendus au montage | 500 | 500 | 500 | 500 |
| rendus **par frappe** | **500** | **0** | **0** | **500** |
| lignes de code ajoutées | — | **0** (déplacées) | 1 | 2 |
| contrainte permanente créée | — | aucune | oui | oui, et déjà violée |

Le point central du tableau : **C1 et C2 donnent exactement le même gain**. C'est fait exprès.
Si tu choisis sur le seul critère du nombre de rendus, tu ne peux pas trancher — et le critère
qui tranche est ailleurs.

### Pourquoi C1 plutôt que C2

Descendre l'état du champ dans son propre composant ne « corrige » pas le problème : il le
**supprime**. Le parent ne se re-rend plus du tout à la frappe, donc la question de savoir si
ses enfants doivent se re-rendre ne se pose plus.

`memo`, lui, laisse le parent se re-rendre 500 fois par frappe et ajoute une comparaison pour
décider de ne rien faire. Le résultat visible est identique ; ce qui diffère, c'est ce qui
reste dans le code :

- **C1 laisse une contrainte nulle.** Aucune règle à retenir, aucun piège futur.
- **C2 laisse une contrainte permanente et silencieuse** : toute personne qui, dans deux ans,
  ajoutera une prop non stable à `<Ligne>` annulera le `memo` sans le savoir. Rien n'échouera,
  aucun test ne rougira, la page redeviendra simplement lente.

La règle générale que cette pratique installe : **préfère la correction qui supprime le
problème à celle qui le compense**, même quand elles donnent le même chiffre. La première ne
demande rien à personne ; la seconde demande une vigilance à toute l'équipe, pour toujours.

**La situation où C2 devient le bon choix** — la question de la partie 5 : quand
l'architecture ne peut pas être changée. Une liste qui dépend réellement de l'état du parent —
elle est filtrée par le champ — ne peut pas s'en détacher. Il n'y a alors plus de C1
disponible, et `memo` sur la ligne devient la réponse correcte.

### Pourquoi C3 ne gagne rien

`style={{ color: 'red' }}` crée un **nouvel objet à chaque rendu du parent**. `memo` compare
les props par identité : `{} !== {}`, toujours. La comparaison échoue systématiquement,
l'enfant se re-rend, et on retombe à 500.

On a donc : la lenteur du départ, plus le coût de 500 comparaisons inutiles, plus un `memo`
dans le code qui donne à tout relecteur l'impression que ce point est réglé. Objectivement pire
que de n'avoir rien fait.

C'est le défaut de mémoïsation le plus courant, et il ne se voit qu'en mesurant. La parade :
stabiliser ce qu'on passe — un objet de style défini **hors** du composant, une fonction de
rappel enveloppée dans `useCallback`, ou mieux, ne pas passer d'objet du tout.

### Si ton hypothèse était fausse

Deux hypothèses erronées reviennent, et toutes deux sont instructives :

- **« la liste est trop longue »** — non : le montage de 500 lignes est instantané. Ce n'est
  pas la taille qui coûte, c'est la **répétition**. Une liste de 500 lignes rendue une fois ne
  pose aucun problème ; la même rendue à chaque caractère, si.
- **« le filtrage est lent »** — non : filtrer 500 objets par une comparaison de chaînes prend
  une fraction de milliseconde. C'est le réflexe qui conduit à poser un `useMemo` sur le
  filtrage, où il ne gagne rien de mesurable.

Ces deux erreurs ont un point commun : elles accusent l'opération **visible** dans le code.
La vraie cause était invisible — un rendu déclenché par une relation entre composants.

### La partie 6, et pourquoi elle est notée

La réponse honnête, sur une machine de développement récente, est souvent : **non, personne
n'aurait rien remarqué.** 500 rendus de composants triviaux se font en quelques millisecondes.

Ce qui ne rend pas le changement inutile, mais **change l'argument** :

- sur un téléphone d'entrée de gamme, le même travail est cinq à dix fois plus lent, et
  devient perceptible ;
- 500 lignes aujourd'hui, ce sont 5 000 dans deux ans, et le coût croît linéairement ;
- surtout, **C1 ne coûte rien** : c'est une meilleure organisation du code, qui se trouve être
  aussi plus rapide. On ne l'adopte pas pour la performance, on l'adopte parce qu'elle est plus
  juste.

C'est ce qui distingue une optimisation défendable d'une superstition. Recommander C1 en
écrivant « personne ne l'aurait senti, mais c'est plus simple **et** plus rapide » est une
excellente recommandation. Recommander C2 en écrivant « c'est plus rapide » sans avoir mesuré
que quiconque en souffrait est ce qu'on reproche à l'optimisation prématurée.

### Généralisation

Le compte rendu que tu viens d'écrire — *mesure de départ, hypothèse, corrections mesurées
séparément, recommandation avec son coût permanent, test de nécessité* — est la forme
canonique de toute décision de performance, du frontend à la base de données.

Deux de ses parties sont presque toujours absentes des discussions réelles, et ce sont les
deux qui font la différence : **mesurer les corrections séparément** (sinon on ne sait pas
laquelle a agi) et **nommer le coût permanent** (sinon on ne compte que le gain). Une équipe
qui exige ces deux points sur chaque optimisation n'accumule pas de complexité inutile ; une
équipe qui ne les exige pas en accumule à chaque sprint.

## Mini-exercice
Cherche `useMemo` et `memo` dans ton projet. Pour la première occurrence trouvée, réponds à deux
questions sans exécuter quoi que ce soit : quelle mesure a justifié son ajout, et quelle prop non
stable pourrait l'annuler aujourd'hui ? Si tu ne peux répondre à la première, tu viens de trouver une
optimisation non mesurée.

## 📚 Vocabulaire
**profiling / mesure** · **chargement vs exécution** · **re-rendu inutile** · **`useMemo`/`useCallback`/`memo`**
· **code splitting / lazy loading** · **poids d'image / `loading="lazy"`** · **cache** · **performance
perçue** · **Core Web Vitals**.

## 🧾 À retenir
La performance frontend se mesure, elle ne se devine pas : profile d'abord, cible le vrai goulot,
re-mesure. Distingue le chargement (réseau, bundle, images — souvent le vrai coupable) de l'exécution
(re-rendus, calculs). Corrige les re-rendus d'abord par l'architecture, et ne mémoïse (`useMemo`/`memo`)
qu'après avoir mesuré un problème réel. Sers des images adaptées, découpe le bundle (lazy loading), et
soigne la performance perçue (états de chargement). Jamais d'optimisation prématurée.
