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
Tu dois comprendre le rendu et les re-rendus React (`/doc/lessons/react-fundamentals`), la
mémoïsation et l'architecture d'état (`/doc/lessons/react-composition-architecture`), et les bases du
réseau/HTTP et du cache (`/doc/lessons/http-rest-json`, `/doc/lessons/caching-performance`). 
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

## 🧭 Exemple guidé
Une liste qui saccade à la frappe : diagnostiquer avant d'agir.
1. **Mesurer** : le profiler React montre que TOUTE la liste (5 000 lignes) se re-rend à chaque frappe.
2. **Comprendre** : le champ de recherche et la liste partagent un parent qui re-rend tout à chaque
   caractère.
3. **Cibler** : d'abord vérifier l'architecture (le résultat filtré est-il dérivé au bon niveau ?),
   puis, si le calcul de filtrage est réellement lourd, le `useMemo` sur `resultats` ; si les lignes
   sont coûteuses, `memo` sur la ligne.
```tsx
const resultats = useMemo(
  () => personnes.filter(p => p.nom.toLowerCase().includes(terme.toLowerCase())),
  [personnes, terme]
);
```
Raisonnement : on a MESURÉ (5 000 lignes re-rendues), COMPRIS la cause, puis appliqué le levier
ADAPTÉ — pas saupoudré des `useMemo` au hasard. On re-mesure ensuite pour confirmer le gain.

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

## Mini-exercice
Prends une liste ou une page « lente » (réelle ou simulée). (1) Formule une HYPOTHÈSE de cause. (2)
« Mesure » (profiler React / onglet réseau) pour la confirmer ou l'infirmer. (3) Applique UN levier
adapté (architecture d'état, `useMemo`/`memo` ciblé, ou service d'image / lazy loading) et explique
pourquoi c'est le bon. Résiste à l'envie de tout mémoïser. Pratique associée : `perf-pair-count`,
`react-search`.

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
