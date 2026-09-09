# V72 — CP3. Variété éditoriale et défauts factuels ouverts

Deux objets distincts : les **motifs mécaniques** à l'échelle des 128 leçons, et les **six
défauts factuels** que V71 a mesurés au CP13 sans jamais toucher au texte.

---

## 1. Motifs mécaniques — mesure d'abord

| motif recherché | mesure |
|---|---|
| le « problème d'abord » se clôt par « **Cette leçon** t'apprend / te donne / te fait… » | **118 / 128** |
| répartition des verbes | `t'apprend` 30 · `te donne` 10 · `te fait` 9 · `te montre` 6 · `explique` 4 · `ouvre` 3 · `présente` 3 · `installe` 2 · `construit` 1 |
| deux premiers mots de l'accroche, motifs vus ≥ 4 fois | « Tu as… » 8 · « Tu veux… » 7 · « Ton application… » 5 · « Tu sais… » 4 |
| section « Pourquoi c'est important » | présente dans **45** leçons seulement |
| section « Modèle mental » | présente dans **128 / 128** |
| l'objectif reprend tous les mots porteurs du titre | 23 |

### Ce que ces chiffres disent — et ce qu'ils ne disent pas

**La cadence de clôture est réellement mécanique : 118 leçons sur 128 finissent leur première
section par la même construction.** C'est le motif le plus uniforme du corpus.

**Mais uniforme n'est pas redondant, et c'est ce qu'il fallait mesurer.** J'ai calculé le
recouvrement de cette phrase de clôture avec l'objectif de sa propre leçon :

| recouvrement | leçons |
|---|---|
| ≥ 0,30 (la phrase dit ce que l'objectif dit) | **4** |
| ≥ 0,20 | 17 |
| ≥ 0,10 | 37 |
| < 0,10 | **81** |

Dans 114 cas sur 118, la phrase de clôture **annonce** sans **répéter** : elle fait le pont
entre le problème et ce qui vient, ce qui est exactement le travail de la fin d'une accroche.
Corriger les 118 serait une réécriture de masse sans défaut mesuré — précisément ce que
l'interdit n° 3 du contrat proscrit.

**Règle appliquée, bornée et publiée** : supprimer la phrase de clôture **uniquement** quand
son recouvrement avec l'objectif atteint 0,30 — c'est-à-dire quand elle dit déjà ce que la
section suivante va dire. **Quatre leçons** concernées, toutes traitées :

| leçon | recouvrement | phrase supprimée |
|---|---|---|
| `deployment-secrets` | 0,43 | « Cette leçon t'apprend à gérer secrets et configuration proprement (hors du code, par environnement) et à déployer sans fuiter… » |
| `embeddings` | 0,43 | « Cette leçon te fait comprendre géométriquement ce que c'est et pourquoi ça rend possible la recherche par sens… » |
| `ci-cd` | 0,32 | « Cette leçon te montre pourquoi elle attrape les régressions tôt et comment écrire un pipeline simple… » |
| `resilience-patterns` | 0,31 | « Cette leçon présente les patterns qui contiennent les pannes : timeout, retry, circuit breaker… » |

Après correction : **0 leçon** au-dessus de 0,30. Aucune autre n'a été touchée.

**Les trois autres motifs ne sont pas des défauts.** Huit accroches sur 128 qui commencent par
« Tu as… » n'est pas une uniformité ; 45 leçons sur 128 portant une section « Pourquoi c'est
important » est une **variation**, pas un moule ; et un objectif qui reprend les mots du titre
est inévitable quand le titre est « CSS Flexbox ».

---

## 2. Les six défauts factuels laissés ouverts par V71

L'audit aveugle du V71 (CP13) a baissé D1 sur six leçons pour des erreurs réelles, puis n'a
modifié **aucun fichier** : les constats sont enregistrés comme des changements de note. Le
seuil **C7** du contrat V72 exige zéro défaut factuel ouvert. Les six sont traités ici.

### 2.1 `design-patterns-intro` — Java 8 date de 2014

**Avant** : « les exemples canoniques sont écrits en Java, **langage où l'on ne peut pas passer
une fonction** ».
**Le fait** : faux depuis Java 8 (mars 2014) — lambdas et références de méthode.
**Après** : la phrase situe l'affirmation dans le temps (« le Java des années 1990, qui n'avait
aucun moyen de passer un comportement en argument »), ajoute la date entre parenthèses, et
garde intact le raisonnement, qui ne dépendait pas de la fausseté : les classes des exemples
canoniques contournent une limite du langage de l'époque.

### 2.2 `technical-debt` — la norme ISO/IEC 14764 dit « perfective »

**Avant** : quatrième type de maintenance donné comme « **évolutive** : ajouter/modifier une
capacité à la demande du métier ».
**Le fait** : la norme nomme ce type **perfective**, et sa définition est **plus large** — elle
couvre aussi l'amélioration des performances et de la maintenabilité.
**Après** : le type est nommé `perfective`, sa définition normative est donnée, et l'écart avec
le mot français courant est **expliqué** plutôt que caché : « évolutive » est une traduction
plus étroite qui couvre l'ajout de fonctions, pas l'amélioration interne.

### 2.3 `react-application-states` — deux comptages incompatibles

**Avant** : l'exemple guidé conclut « **cinq** états ont un sens clair, un est contradictoire,
deux dépendent d'une intention » (5+1+2 = 8) ; cent lignes plus loin, la pratique annonce
« **quatre** états valides sur huit représentables ».
**Le fait** : les deux comptages sont chacun cohérents avec **leur propre convention**, mais
rien ne le dit — le lecteur qui remarque l'écart conclut qu'un des deux est faux.
**Après** : un encadré explicite la différence et en tire l'enseignement, qui vaut au-delà du
cas : le premier décompte distingue « aucun résultat » de « rien n'a encore été cherché »
parce qu'un écran doit les afficher différemment ; le second ne compte que les états du
chargement, où les deux se confondent. « Le nombre d'états d'un système n'est jamais une
propriété du code seul — il dépend de la question qu'on lui pose. »

### 2.4 `pandas-data-wrangling` — le facteur 50 à 100, mesuré

**Avant** : « c'est de là que vient le facteur 50 à 100 », sans source ni mesure, dans une
leçon qui mesure tout le reste.
**Le fait** : le facteur n'est pas une constante. Mesuré par
`scripts/v72/cp3-vectorisation.py` (pandas 2.x, ce conteneur) :

| lignes | boucle Python ordinaire | `df.apply(..., axis=1)` |
|---:|---:|---:|
| 10 000 | ×7 | **×333** |
| 100 000 | ×41 | **×1 673** |
| 1 000 000 | ×72 | **×3 072** |

**Après** : le tableau remplace le chiffre, avec les deux enseignements que la formule
universelle effaçait — le facteur **croît avec la taille** (donc un test sur mille lignes ne
dit rien de la production), et l'écart spectaculaire vient de `apply(axis=1)`, l'idiome que le
débutant écrit parce qu'il « a l'air pandas », pas d'une boucle `for`. La mention « 50 à 100 »
de la section Erreurs fréquentes est corrigée en conséquence.

### 2.5 `ai-evaluation` — « 90 % des projets RAG de portfolio »

**Avant** : chiffre non sourcé présenté comme un fait, dans un paragraphe de motivation.
**Après** : l'affirmation qualitative est conservée (elle est défendable), le chiffre est
retiré, et la leçon **dit pourquoi** : « aucun chiffre n'est avancé ici, parce qu'aucun
recensement sérieux n'existe » — avec l'invitation à le vérifier soi-même sur des dépôts
publics. Dans une leçon qui enseigne à ne pas croire un nombre sans protocole, c'était le
minimum.

### 2.6 `javascript-basics` — « les 6 falsy »

**Avant** : « les 6 falsy : `false, 0, "", null, undefined, NaN` », présenté comme exhaustif.
**Le fait** : il en existe **huit** — `-0` et `0n` (BigInt) manquent.
**Après** : « les 6 que tu rencontreras… il en existe deux autres, `-0` et `0n`, que tu
n'écriras pas par accident ». La simplification pédagogique est conservée et **déclarée comme
telle**, ce qui est la différence entre simplifier et se tromper.

---

## 3. Vérification

| contrôle | résultat |
|---|---|
| phrases de clôture à recouvrement ≥ 0,30 | 4 → **0** |
| défauts factuels ouverts (C7) | 6 → **0** |
| leçons touchées au CP3 | **10** (4 clôtures + 6 factuels) |
| `npm test` | **1420 / 1420** |
| `npx tsc --noEmit` | **0** |
| `npm run gates:active` | **vert** |
| corpus | `a45e9f5b…` → `d535fcf6…`, 9 gels mis à jour |
| invariants | 128 / 365 / 365 inchangés |

**Script ajouté** : `scripts/v72/cp3-vectorisation.py`, rejouable, qui produit le tableau
de §2.4 et publie ses conditions (version de pandas, tailles testées, trois répétitions,
minimum retenu).
