# V66 · CP8–CP12 — Les 9 leçons durcies : inventaire, avant/après, tests

> Inventaire exigé par la règle absolue 11 du brief : « toute modification
> volontaire du curriculum doit être inventoriée précisément ». C'est aussi le
> document que les neuf portes de gel du corpus citent pour justifier leur
> nouvelle empreinte.
>
> Empreinte `curriculum/lessons/` : `4c1f3028…` → `e34b1c76…`
> (`find curriculum/lessons -name '*.md' | sort | xargs cat | sha1sum`).

---

## 0. Comment ces neuf leçons ont été choisies — critères publiés avant le choix

1. **Famille A** au sens du CP0 : noyau explicatif plat, sans structure interne
   (71 leçons sur 128, noyau médian 239 mots).
2. **Levier** : nombre de journées du programme qui enseignent la leçon.
3. **Au moins un LEARNING GAP bloquant** localisé au CP0, ou un noyau parmi les
   plus minces du corpus.

Aucune leçon n'a été retenue parce qu'elle était facile à réécrire, et aucune
leçon de famille B ou C n'a été touchée : elles servent de MODÈLE, pas de
matériau.

| Leçon | Journées | Noyau avant | Gap bloquant relevé au CP0 |
|---|---:|---:|---|
| `rag-evaluation` | **54** | 226 | — (mais 11 sections sur 18 invisibles, voir §1) |
| `embeddings` | 36 | **126** | produit scalaire · norme · rappel@k |
| `vector-databases` | 36 | 130 | interface / adapter |
| `retrieval-reranking` | 36 | 135 | — (terme « reranking » irrésolvable depuis `embeddings`) |
| `chunking-strategies` | 36 | 150 | rappel@k · golden set |
| `ci-cd` | 18 | 123 | `lint` (absent du corpus ET du glossaire) · pull request |
| `docker-containers` | 12 | **107** | `npm ci` · couche (layer) |
| `etl-pipelines` | 9 | 128 | — (noyau parmi les 5 plus minces) |
| `pandas-data-wrangling` | 8 | 116 | — (noyau parmi les 5 plus minces) |

Couverture réelle : **66 journées DISTINCTES** du programme enseignent au moins
une de ces neuf leçons.

> La somme de la colonne « Journées » donne 245, et ce chiffre serait un
> mensonge : les six leçons de la chaîne RAG sont enseignées par les MÊMES
> journées, chacune y comptant une fois. C'est exactement la faute que V65.1 a
> passé un sprint à corriger sur `/skills` — additionner des crédits et
> présenter le total comme un décompte. Le nombre honnête est 66.

---

## 1. Le défaut le plus grave, trouvé en lisant et non par une règle

`curriculum/lessons/rag-evaluation.md`, ligne 48. Une clôture de bloc de code
échappée — `\``` ` au lieu de ``` ``` `` — empêchait le bloc de se fermer.

Sur la leçon que **54 journées** enseignent, la plus couverte du corpus :

- **11 sections sur 18 ne s'affichaient pas** ;
- **3 509 caractères** rendus en monospace brut ;
- disparus de la page : Exemple appliqué, Erreurs fréquentes, Anti-patterns,
  Mini-exercice, Exercice plus difficile, Correction attendue, Questions
  d'entretien, À retenir, Vocabulaire, Checklist, Liens avec le programme.

Aucune des 45 portes actives ne pouvait le voir : toutes vérifient la SOURCE,
aucune ne vérifiait le RENDU. Correction : un caractère retiré. Le contrôle
`v66:render` couvre désormais les 950 fichiers du curriculum.

---

## 2. Ce qui a été fait sur chacune, et rien d'autre

La même transformation partout, dérivée du modèle éditorial de la famille B —
celui qui EXISTE DÉJÀ dans le dépôt et que le CP0 a mesuré comme le meilleur :

1. le noyau explicatif passe d'un bloc plat (ou d'une liste de définitions) à
   des **paragraphes introduits par leur sujet**, qui exposent le MÉCANISME ;
2. une section **Décomposition** est ajoutée : « quelle question ? → quelle
   partie du mécanisme y répond » ;
3. la section d'erreurs **MONTRE** l'approche fautive en code, puis la réfute
   avec des chiffres ou un test, avant de donner la version juste ;
4. les termes bloquants sont **définis au point d'usage**, pas renvoyés ailleurs ;
5. le vocabulaire orphelin est soit défini dans le corps, soit retiré.

**Ce qui n'a PAS été touché** : « Le problème d'abord », « Objectif »,
« Modèle mental », « Exemple guidé », « Cas métier », « Questions d'entretien »,
« À retenir ». Le CP0 les a mesurés bons ; les réécrire aurait été du bruit.

### Avant → après, mesuré

| Leçon | Total | Noyau explicatif | Contre-exemple montré |
|---|---|---|---|
| `embeddings` | 992 → **1 728** | 126 → **477** | non → **oui** |
| `docker-containers` | 867 → **1 537** | 107 → **449** | non → **oui** |
| `chunking-strategies` | 987 → **1 625** | 150 → **561** | non → **oui** |
| `ci-cd` | 924 → **1 468** | 123 → **430** | non → **oui** |
| `vector-databases` | 956 → **1 478** | 130 → **420** | non → **oui** |
| `retrieval-reranking` | 970 → **1 557** | 135 → **473** | non → **oui** |
| `pandas-data-wrangling` | 889 → **1 292** | 116 → **303** | non → **oui** |
| `etl-pipelines` | 882 → **1 330** | 128 → **388** | non → **oui** |
| `rag-evaluation` | 1 007 → **1 309** | 226 → 226 | non → **oui** |

Noyau médian des neuf : **128 → 430 mots.**

> **Sur la longueur, et il faut être franc.** La règle 7 du brief dit que la
> longueur n'est pas la qualité, et la règle 6 interdit de gonfler pour
> atteindre un quota. Ces neuf leçons ont grossi de 60 à 75 %. Ce n'est
> défendable que si chaque paragraphe ajouté fait un travail que rien ne
> faisait : définir une notion que l'exercice exigeait, exposer un mécanisme qui
> n'était que nommé, montrer une faute qui n'était qu'énoncée. Le test des
> mots-clés du §3 est là pour vérifier exactement cela — et c'est lui, pas le
> compte de mots, qui décide.
>
> `rag-evaluation` est le contre-exemple utile : son noyau est resté à 226 mots
> parce qu'il était **déjà** causal et structuré. Il n'a reçu qu'un
> contre-exemple montré et une Décomposition. Ne pas l'allonger était le bon
> geste.

---

## 3. Test des mots-clés (protocole P3), avant et après

**Méthode.** On retire du passage tous les noms propres, acronymes et termes
marqués. Ce qui reste explique-t-il encore le mécanisme ? Si non, le passage
nomme au lieu d'enseigner. Constat **LU**, pas mesuré.

### `embeddings` — le cas le plus net

**AVANT**, noyau amputé de son vocabulaire :

> « Un modèle prend un texte et sort une liste de nombres. La géométrie encode
> la sémantique : deux textes de sens voisin ont des listes voisines. Pour
> comparer deux listes, on mesure l'angle entre elles. On travaille souvent avec
> des listes de longueur 1, auquel cas la mesure se réduit à une opération plus
> simple. »

Ce qui reste ne contient **aucun mécanisme** : ni comment un texte devient des
nombres, ni pourquoi un angle mesurerait une ressemblance de sens, ni ce qu'est
« l'opération plus simple ». **Échec.**

**APRÈS**, le même traitement :

> « Le modèle a été entraîné à deviner les mots qui entourent un mot ; pour y
> arriver il a dû ranger côte à côte ceux qui s'emploient dans les mêmes
> contextes. On multiplie les coordonnées deux à deux et on additionne : un seul
> nombre, grand quand les deux ont de grandes coordonnées aux mêmes endroits. On
> divise ensuite par les deux longueurs, ce qui annule l'effet de la taille du
> texte et ne laisse que l'orientation. »

Le mécanisme survit **entièrement** au retrait du vocabulaire. **Réussite.**

### Les huit autres, en une ligne chacune

| Leçon | Avant | Après | Ce qui fait la différence |
|---|:--:|:--:|---|
| `docker-containers` | ❌ | ✅ | l'empilement des couches et l'invalidation du cache sont exposés, plus seulement nommés |
| `chunking-strategies` | ❌ | ✅ | pourquoi un chunk trop gros dilue, pourquoi un trop petit perd son contexte |
| `ci-cd` | ❌ | ✅ | ce qu'une machine neuve rend impossible, et pourquoi |
| `vector-databases` | ❌ | ✅ | ce qu'un index approximatif parcourt au lieu de tout comparer |
| `retrieval-reranking` | ❌ | ✅ | pourquoi deux scores incomparables ne s'additionnent pas ; ce qu'un cross-encoder fait de plus |
| `pandas-data-wrangling` | ❌ | ✅ | d'où vient réellement le facteur 100, et ce qu'est un masque |
| `etl-pipelines` | ❌ | ✅ | ce qu'est un état « ni l'ancien ni le nouveau », et ce que la transaction en fait |
| `rag-evaluation` | ✅ | ✅ | passait déjà — d'où le refus de l'allonger |

**Bilan : 1 réussite sur 9 avant, 9 sur 9 après.**

---

## 4. Test Feynman sur cinq concepts (protocole P4)

**Méthode.** Réexpliquer le concept à quelqu'un qui ne connaît pas le domaine,
**sans employer le vocabulaire de la leçon**, et **en n'utilisant que ce que la
leçon fournit**. Le point exact où l'explication devient impossible est le trou
du cours.

**1. La similarité cosinus.** *Avant* : blocage immédiat. « C'est l'angle entre
deux directions » n'est pas une explication mais une reformulation ; rien dans
la leçon ne permettait d'aller plus loin, ni le produit scalaire ni la norme
n'étant définis. *Après* : « Chaque texte devient une liste de nombres. Pour
savoir si deux listes se ressemblent, on les multiplie terme à terme et on
additionne. Le résultat est plus grand quand les gros nombres tombent aux mêmes
endroits. Mais un texte long a de plus gros nombres partout, donc on divise par
la taille des deux listes : il ne reste que la ressemblance de forme. » Aucun
mot de la leçon, et l'explication tient. **Trou fermé.**

**2. Les couches d'une image Docker.** *Avant* : blocage sur « pourquoi l'ordre
compte ». La leçon disait qu'il fallait bien les ordonner sans dire ce qu'était
une couche. *Après* : « Chaque ligne de la recette ajoute une pellicule
par-dessus les précédentes. Si tu changes une ligne, tout ce qui est posé
au-dessus doit être refait. Donc ce qui bouge rarement se met en bas de la
pile, et ce qui bouge tout le temps en haut. » **Trou fermé.**

**3. L'idempotence d'un pipeline.** *Avant* : le mot était défini
(« relancer ne duplique pas »), mais rien ne disait POURQUOI on relance, donc
la propriété paraissait théorique. *Après* : « Le réseau coupe, la source
arrive en retard, tu corriges un bug et tu rejoues hier. Un traitement qu'on ne
peut pas relancer sans tout doubler est un traitement qu'on n'ose plus
relancer. » **Trou fermé.**

**4. Le rappel@k.** *Avant* : utilisé dans deux leçons, dans un exercice et dans
une checklist, défini dans une troisième que rien ne liait à cet endroit —
blocage total pour qui suit l'ordre du programme. *Après* : défini au point
d'usage dans les trois. « Tu prends des questions dont tu connais déjà la bonne
réponse. Tu regardes si elle est dans les trois premières que la machine te
sort. Quatre fois sur cinq, ça fait 0,8. » **Trou fermé.**

**5. Ce qu'un linter fait.** *Avant* : **impossible** — le mot apparaît six fois
dans `ci-cd`, jusque dans la checklist de fin, et n'est défini nulle part dans
les 128 leçons ni dans les 711 entrées du glossaire. *Après* : « Un programme
qui RELIT ton code sans l'exécuter, et qui te signale ce qu'un relecteur
attentif verrait : une variable déclarée et jamais utilisée, un import oublié,
une comparaison douteuse. » **Trou fermé.**

**Cinq concepts sur cinq passent après ; un seul passait avant.**

---

## 5. Audit des corrections (dimension D9)

Le CP0 mesurait 28 % de corrections absentes ou plates, et une dégradation de
100 % (M1–M3) à 42 % (M10–M12).

Sur les neuf leçons durcies, la correction a été reprise là où elle
**reformulait le résumé au lieu de corriger un raisonnement**. Cas le plus net,
`docker-containers` :

- **avant** : « La logique : Dockerfile = recette reproductible ; secrets au
  run ; volumes pour la persistance ; compose pour l'orchestration. » — un
  rappel des titres de sections, qui ne corrige rien ;
- **après** : l'erreur de raisonnement est nommée d'abord (« croire qu'un
  Dockerfile est une liste d'instructions dont l'ordre n'importe que pour la
  logique ; il décrit une pile »), puis une seconde (« croire qu'un fichier
  supprimé a disparu ; une couche ne défait pas la précédente »), puis quatre
  vérifications exécutables sur son propre travail.

---

## 6. Ce que ce CP8 ne prouve pas

- **Neuf leçons sur 128.** Les 62 autres leçons de famille A n'ont pas été
  touchées, et rien ne dit qu'elles se corrigeraient aussi bien.
- Le test des mots-clés et le test Feynman sont conduits **par moi**. Ils
  détectent l'absence d'un mécanisme dans le texte ; ils ne mesurent pas ce
  qu'un humain comprend réellement.
- Aucune de ces modifications ne dit quoi que ce soit sur la **rétention** :
  c'est l'objet du moteur des CP2–CP7, et il faudra des tentatives réelles pour
  en juger.
- La dette **PED-14/PED-15** (25 % du temps annoncé décrit, 267 journées sans
  budget d'activité) n'est **pas traitée ici** et reste ouverte.
