# V68 · CP0 — Audit forensique et audit du texte des leçons

> Publié **avant toute modification**. Aucun fichier de `curriculum/` n'a été
> touché entre le gel des échantillons (`2d92477`) et ce rapport.

---

## A. L'état déclaré, reproduit

Le brief exigeait de ne faire confiance à aucun de ses propres chiffres. Chacun a
été reproduit depuis le dépôt.

| Affirmation du brief | Commande | Résultat | Verdict |
|---|---|---|---|
| HEAD `e5ee456` | `git rev-parse HEAD` | `e5ee4564efd432af…` | ✅ |
| Branche propre, alignée | `git status`, `git log origin/…` | propre, alignée | ✅ |
| 128 leçons | `ls curriculum/lessons/*.md \| wc -l` | 128 | ✅ |
| 365 journées + 365 solutions | idem | 365 / 365 | ✅ |
| `progress.json` intact | `sha256sum` | `73c1ee39…f1fc6e7a6` | ✅ |
| Toutes les portes vertes | `npm run gates:active` | rc=0 | ✅ |
| Tests | `npm test` | 1420 passent | ✅ |
| Types | `npx tsc --noEmit` | rc=0 | ✅ |
| 25 leçons hors parcours | `v67-stock.mjs` | 25 | ✅ |
| 1 échec d'objectif restant | idem | 1 | ✅ |
| Familles A 71 / B 12 / C 45 | `v67-audit.mjs` | 71 / 12 / 45 | ✅ |
| 23 familles C sans clôture | idem | 23 (22 avec) | ✅ |
| Jargon : médiane 8, seuil 5 | `v67-glossaire.mjs` | p10 7 · méd. 8 · p90 11 · max 12 | ✅ |
| 52/52 revues liées | idem | 52/52 | ✅ |
| Condition 5 (heures fantômes) | `v67-charge.mjs` | 0 violation | ✅ |

**Aucun chiffre du brief n'est démenti.** L'état d'entrée est celui annoncé.
Ce qui suit ne conteste donc pas les mesures de V67 — il conteste ce que V67 en a
conclu.

### Ce que les compteurs ne disaient pas

Toutes ces mesures sont vertes, et pourtant. La suite de ce rapport montre qu'un
corpus peut satisfaire quinze contrôles structurels tout en laissant **67 leçons
sur 128 sans la moindre correction**, et en publiant, dans la leçon dont c'est
le sujet même, **un percentile faux d'un facteur cinquante**.

C'est le fait central du CP0 : les portes vertes ne mesuraient pas le cours.

---

## B. Ce que la lecture a trouvé et qu'aucune sonde n'avait vu

### B.1 — Un P0 factuel : `metrics-percentiles` se trompe sur son propre sujet

La leçon définit correctement le percentile, ligne 30 :

> Un **percentile** répond à « quelle valeur n'est PAS dépassée par X % des
> requêtes ? ». p95 = 800 ms signifie « 95 % des requêtes sont sous 800 ms ».

Puis, vingt lignes plus bas, elle applique cette définition — et se trompe :

> **Exemple chiffré (la moyenne ment).** 100 requêtes : 99 à 50 ms, 1 à 5 000 ms.
> Moyenne ≈ 100 ms (« ça va »). **p99 = 5 000 ms** (« un utilisateur sur cent
> attend 5 s »). Le p99 dit la vérité que la moyenne cache.

Sur 100 requêtes dont 99 à 50 ms, **99 % des requêtes sont sous 50 ms**. Par la
définition donnée douze lignes plus haut, `p99 = 50 ms`. Vérifié :

```
p50  = 50 ms      p95 = 50 ms      p99 = 50 ms      p100 (max) = 5 000 ms
```

Aucune convention ne sauve le chiffre : en rang le plus proche p99 vaut 50 ms, en
interpolation linéaire 99,5 ms. La leçon annonce 5 000 ms — **entre cinquante et
cent fois trop**. La valeur qu'elle décrit est le maximum, pas le p99.

La phrase entre parenthèses (« un utilisateur sur cent attend 5 s ») est vraie et
c'est ce qui rend l'erreur durable : le fait décrit est juste, seule l'étiquette
est fausse. Un apprenant qui retient cet exemple lira désormais tous ses tableaux
de bord à l'envers, et il aura appris cela **de la leçon qui existe pour lui
apprendre à les lire**.

C'est le seul défaut de ce rapport qui soit une information incorrecte, et non
une insuffisance. Il est classé **P0**.

### B.2 — La section « Vocabulaire » sert de dépôt à termes non enseignés

Trente termes, dans trente leçons, apparaissent **exactement une fois** dans leur
leçon : à la ligne « 📚 Vocabulaire ». Le cours ne les prononce nulle part
ailleurs, donc ne les explique jamais. Vérifiés un par un :

| Leçon | Terme | Occurrences |
|---|---|---|
| `prompt-engineering` | **température**, **zero-shot** | 1 (ligne 105) |
| `transformers` | **logits** | 1 (ligne 91) |
| `machine-learning-basics` | **hyperparamètre** | 1 (ligne 128) |
| `sql-performance-indexing` | **sélectivité** | 1 (ligne 125) |
| `algorithmic-thinking` | **mémoïsation** | 1 (ligne 126) |
| `metrics-percentiles` | **cardinalité** | 1 (ligne 129) |
| `data-structures-intro` | **racine**, **feuille**, **équilibrage** | 1 |
| `distributed-tracing` | **échantillonnage** | 1 |
| `rag-evaluation` | **calibration**, **sur-adaptation** | 1 |
| …et 20 autres | | |

C'est très exactement le symptôme que le brief demande d'instruire : **du
vocabulaire professionnel déposé sans enseignement**. La section qui devrait
récapituler ce que le cours a construit sert à afficher ce qu'il n'a pas traité.

Quatre des trente-quatre signalements sont des artefacts de découpage
(`Promise.all` → `Promiseall`, `.env.example` → `envexample`, `compose.yaml`,
`requête-clé-valeur`) et sont écartés. **Trente sont réels et vérifiables.**

Fait aggravant : le défaut est **plus fréquent dans les leçons réécrites par V67**
(39 %) que dans celles qu'il n'a pas touchées (21 %). V67 a ajouté du vocabulaire
sans ajouter l'explication correspondante.

### B.3 — Le corpus ne permet presque jamais de se tester

**114 leçons sur 128** posent au moins une question dont la réponse est sur la
même ligne :

> « Combien d'adresses dans un `/24` ? » → 256 (254 hôtes utilisables).
> — `networking-addressing-routing`, ligne 105

> Votre API doit joindre une base sur le même réseau Docker. Quelle URL ? →
> `db:5432` — `docker-networking-volumes`, mini-exercice

**Quatre leçons sur 128** possèdent une section de questions sans réponses
adjacentes. `api-production-contracts` est l'une d'elles :

> ## 🧪 Vérification de compréhension
> - Pourquoi un `POST` de création a-t-il besoin d'une clé d'idempotence, mais
>   pas un `PUT` ?

La différence n'est pas cosmétique. Dans le premier cas l'apprenant lit une
affirmation déguisée en question ; dans le second il doit produire quelque chose.
**Le corpus est constitué à 97 % de lecture passive.**

Ce défaut est invisible pour toute sonde structurelle : la section « Questions
d'entretien » est bien présente, bien titrée, bien remplie.

### B.4 — L'« Exemple guidé » fait 53 mots

| | médiane | p10 | p90 |
|---|---|---|---|
| Taille de la section « Exemple guidé », en mots de prose | **53** | 31 | 87 |

Les 128 leçons ont une section « Exemple guidé ». Aucune n'en manque. Et la
médiane est de **cinquante-trois mots**.

Cinquante-trois mots ne peuvent pas contenir : état initial, problème, hypothèse,
première tentative, résultat, observation, raisonnement, correction, résultat
final, enseignement généralisable. Ce que le CP5 demande est **structurellement
impossible** dans le format actuel. Ce qu'on y trouve à la place est une liste
d'étapes numérotées qui réussissent du premier coup :

> ## 🧭 Exemple guidé — « mon API ne joint pas la base »
> 1. Les deux conteneurs sont-ils sur le MÊME réseau ?
> 2. L'URL utilise-t-elle le nom de service et le port interne ?
> 3. La base écoute-t-elle bien sur son port interne ?
> 4. Les données survivent-elles à un redémarrage ?

C'est une **check-list de diagnostic**, et une bonne. Ce n'est pas un exemple
guidé : rien n'y est tenté, rien n'y échoue, rien n'y est corrigé. L'apprenant
lit une procédure, il ne suit personne qui réfléchit.

Mesure décisive : la médiane est de **51 mots dans les leçons réécrites par V67**
et de **54 dans celles qu'il n'a jamais touchées**. **V67 n'a pas amélioré
l'exemple guidé d'un seul mot.**

### B.5 — Sept leçons sur 128 montrent une version fausse

Le CP5 demande une version incorrecte crédible, expliquée. **7 leçons sur 128**
en ont une. `css-flexbox` est l'une d'elles :

> ## 🚫 Contre-exemple
> ```css
> .barre .liens { margin-left: 200px; }   /* MAUVAIS : marge fixe */
> ```
> Ça « marche » sur ton écran, puis casse dès que la largeur change.

`vector-databases` va plus loin et donne le meilleur exemple du corpus — un index
vectoriel interrogé après un changement de modèle d'embedding :

> Les deux modèles rendent des vecteurs de dimensions compatibles, la requête
> passe, la base répond cinq documents. Mais les coordonnées produites par deux
> modèles différents ne désignent pas les mêmes directions : comparer les unes
> aux autres revient à mesurer une distance entre une carte de Paris et une carte
> de Lyon. Les résultats sont plausibles, ordonnés, et faux. Aucune exception ne
> sera levée.

Voilà ce que produit une version fausse bien écrite : elle enseigne un mode de
défaillance *silencieux*, ce qu'aucune liste d'erreurs fréquentes ne peut faire.
Cent vingt et une leçons s'en passent.

---

## C. Le fait structurant : trois générations éditoriales coexistent

C'est la découverte principale du CP0, et elle réoriente tout le sprint.

Le corpus n'est pas homogène, et il n'est pas non plus « bon d'un côté, mauvais
de l'autre ». Il contient **trois strates**, empilées par les sprints successifs,
qui n'ont pas la même définition de ce qu'est enseigner.

| | Leçons | Ce que fait la correction |
|---|---|---|
| **G1 — correction profonde** | **24** | nomme l'erreur probable, explique **pourquoi elle séduit**, propose une alternative défendable, donne une vérification sans corrigé |
| **G2 — correction plate** | **37** | répète le résumé du cours sous forme de consignes |
| **G3 — aucune correction** | **67** | l'exercice est posé, rien ne dit ce qu'on attendait |

### G1 — ce que le projet sait déjà faire

`git-fundamentals`, sur la résolution d'un conflit de merge :

> **L'erreur probable, et pourquoi elle est presque inévitable la première fois.**
> Face aux marqueurs, le réflexe est de supprimer la partie qui n'est pas la
> sienne, retirer les `<<<<<<<`, `add`, `commit` — et c'est terminé en trente
> secondes. Deux choses ont mal tourné sans que rien ne proteste. D'abord, le
> travail de l'autre branche a disparu silencieusement : Git valide n'importe
> quelle résolution, il ne vérifie que l'absence de marqueurs. Ensuite, personne
> n'a relancé le programme. **Un fichier sans marqueur n'est pas un fichier qui
> fonctionne** — c'est très exactement la même illusion que le code qui compile
> sans marcher.
>
> Le piège séduit parce que la résolution *ressemble* à une opération Git, alors
> que c'est une décision de code.

`ai-evaluation`, sur la construction d'un golden set :

> On écrit les 10 questions **en lisant les documents**. Elles reprennent alors
> les mots exacts du corpus […] Le retrieval affiche un rappel proche de 100 %,
> et l'on croit son système excellent. Un vrai utilisateur écrira « si je pars,
> je dois rester combien de temps ? ». Aucun mot commun […] Le piège séduit
> parce qu'écrire des questions en lisant la source est mille fois plus rapide,
> et parce que le résultat est flatteur.

`agents-fundamentals`, dont la correction ose contredire sa propre leçon :

> **La bonne réponse à « agent ou workflow ? » est très souvent « ni l'un ni
> l'autre ».** C'est la réponse la plus difficile à donner quand on vient
> d'apprendre les deux, et c'est celle qui distingue un ingénieur d'un
> enthousiaste.

**Ceci est un vrai cours.** Il enseigne à un humain. Il anticipe sa pensée, nomme
sa tentation, et lui rend le contrôle. Le standard que le CP2 doit écrire n'est
pas à inventer : **il existe déjà, dans ce dépôt, sur 24 leçons.**

### G2 — la même leçon, le geste en moins

`error-handling` et `express-backend` ont été réécrits par V67 dans le même
sprint que `git-fundamentals`. Leur correction :

> **✅ Correction attendue** — La logique : classer (attendu/bug) → traiter au bon
> niveau → centraliser la réponse → prévoir la panne des dépendances. Vérifie :
> aucun catch vide, aucun détail interne chez le client, retry borné et
> idempotent […]

C'est utile. Ce n'est pas une correction : c'est le résumé du cours, réécrit à
l'impératif. Aucune erreur n'est nommée, aucune tentation n'est expliquée, aucune
autre réponse n'est jugée défendable. Un apprenant qui s'est trompé n'apprend pas
**où** ni **pourquoi**.

### G3 — la majorité du corpus

Soixante-sept leçons posent un exercice et ne le corrigent jamais. Cinquante-deux
pour cent du corpus. `deployment-strategies`, `docker-networking-volumes`,
`frontend-performance`, `react-composition-architecture`, `linux-resources-io`,
`networking-addressing-routing` en sont — toutes des leçons par ailleurs **justes,
bien motivées et agréables à lire**.

### Ce que cette strate dit de V67

V67 a touché 38 leçons. **Vingt-quatre ont reçu le geste G1 ; quatorze non.** V67
a donc inventé un excellent standard et l'a appliqué à 19 % du corpus, sans le
dire — son rapport final ne distingue pas ces deux traitements.

Comparaison directe des deux groupes :

| | réécrites V67 (38) | jamais touchées (90) |
|---|---|---|
| exercice sans correction | **0 %** | **70 %** |
| longueur médiane | 1 637 mots | 993 mots |
| exemple guidé (médiane) | 51 mots | 54 mots |
| terme du Vocabulaire jamais prononcé | **39 %** | 21 % |
| réponse collée à sa question | **100 %** | 84 % |
| contre-exemple explicite | 5 % | 6 % |

V67 a réellement fermé le stock (0 % contre 70 %) et doublé la longueur. Il a
aussi **aggravé** le vocabulaire prématuré et la lecture passive dans les leçons
qu'il a touchées, et **n'a rien changé** à l'exemple guidé ni au contre-exemple.

C'est la réponse honnête à « V67 s'est-il noté trop généreusement ? » : **oui sur
D12 (jargon), qu'il déclarait "inchangée à 3/5" alors qu'elle a empiré là où il
est intervenu ; non sur la clôture, qui est un succès réel et mesurable.**

---

## D. Le diagnostic de l'utilisateur, mis à l'épreuve

Le brief demande explicitement de ne pas chercher à donner raison à ce
diagnostic, mais de déterminer où il est vrai et où il est faux.

> « Ça jette beaucoup de mots-clés, les cours sont courts comme si l'apprenant
> était une IA, ça manque de vulgarisation. »

**« Ça jette beaucoup de mots-clés » — VRAI, et localisable.** Trente termes
déposés au Vocabulaire sans jamais être expliqués (B.2). Densité médiane de 8
termes marqués par fenêtre de trois lignes contre un seuil d'alerte à 5. Et des
phrases comme celle-ci, dans `agent-workflows-orchestration` :

> découpage en unités reprenables, file de travail, état persisté, reprise sur
> échec PARTIEL, budget global avec arrêt propre, et traces par unité.

Six concepts dans une phrase, aucun expliqué. C'est exactement le grief.

**« Les cours sont courts » — VRAI pour 90 leçons, FAUX pour 24.** Médiane de
993 mots hors traitement V67, contre 1 637 après. `statistics-for-ml` fait 1 999
mots et se lit comme un cours ; `agent-workflows-orchestration` fait 1 071 mots
répartis sur 18 sections, soit **50 mots par section**, et se lit comme une fiche.

**« Comme si l'apprenant était une IA » — VRAI, et c'est la formulation la plus
juste du rapport.** Un modèle de langage n'a pas besoin qu'on lui explique
pourquoi une erreur séduit ; il lui suffit d'une liste de faits corrects et
denses. C'est précisément ce que sont les 67 leçons de G3 : **des résumés
optimisés pour la restitution, pas des cours conçus pour la compréhension.** Le
symptôme le plus net est celui de B.3 — 97 % du corpus ne laisse jamais
l'apprenant produire quoi que ce soit avant de lui donner la réponse.

**« Ça manque de vulgarisation » — PARTIELLEMENT FAUX, et il faut le dire.** C'est
la partie du diagnostic que la lecture contredit. Les sections « 🌍 Le problème
d'abord » sont, presque partout, une vraie vulgarisation : elles partent d'une
situation concrète et vécue avant de nommer quoi que ce soit.

> « Le serveur est lent. » C'est la plainte la plus fréquente… et la plus vague.
> Lent POURQUOI ? — `linux-resources-io`

> On t'annonce « le salaire moyen de l'équipe est de 60 000 € » — mais personne
> autour de toi ne gagne ça. — `statistics-for-ml`

> Chaque machine sur un réseau a une **adresse**, comme une maison a une adresse
> postale. — `networking-addressing-routing`

Les modèles mentaux existent aussi, et sont souvent bons (« un workflow est une
chaîne de production, un agent est un artisan autonome »). **Le corpus n'a pas un
problème d'entrée en matière — il a un problème de sortie.** Il ouvre bien, puis
il condense, puis il ne corrige pas. Le défaut n'est pas l'absence de
vulgarisation ; c'est que la vulgarisation **s'arrête après le premier
paragraphe**.

Une réserve sur les analogies, qui est un vrai défaut de vulgarisation :
`networking-addressing-routing` annonce en toutes lettres partir de l'analogie
des quartiers d'une ville « **en précisant vite ses limites** » — puis utilise
« quartier » douze fois et **ne précise jamais aucune limite**. Une analogie dont
la limite est promise et jamais donnée est pire qu'une analogie assumée.

---

## E. Les huit questions du brief, répondues sans complaisance

**1. Combien de leçons ressemblent encore à des fiches de révision ?**
**Soixante-sept**, celles de G3 : un exercice posé, aucune correction, 993 mots
médians, 62 mots par section. À quoi s'ajoutent les 37 de G2 dont la correction
n'enseigne rien. **104 sur 128 relèvent encore de la fiche**, à des degrés
différents. Vingt-quatre n'en relèvent plus.

**2. Combien supposent implicitement un vocabulaire non acquis ?**
Trente leçons déposent au moins un terme jamais expliqué (B.2, vérifié un par un).
La densité médiane de 8 termes marqués par fenêtre de trois lignes, contre un
seuil d'alerte à 5, indique que le problème dépasse ces trente : il est diffus.
La mesure de V67 reste valide et **son verdict D12 = 3/5 était trop indulgent
pour les leçons qu'il avait lui-même touchées**.

**3. Combien enseignent réellement avant d'exiger l'usage ?**
La grande majorité, et c'est la bonne nouvelle du rapport. L'ordre
problème → modèle mental → explication → exemple est respecté partout. Le défaut
n'est pas l'ordre, c'est la profondeur de l'étape « explication » et l'absence de
l'étape « correction ». **Une exception nette et grave** : `metrics-percentiles`
demande en « Mise en pratique » de « calculer p50/p95/p99 d'un échantillon » alors
que la leçon **n'a jamais montré comment on calcule un percentile** — elle l'a
seulement défini par une phrase. C'est le cas interdit par le CP7 : une question
dont la réponse exige une notion jamais expliquée.

**4. Combien ont un exemple réellement reproductible ?**
Peu. Les 128 ont une section « Exemple guidé » de 53 mots médians. Les exemples
réellement reproductibles sont ceux qui portent du code exécutable avec son
contexte : `database-transactions-concurrency` (le `SELECT … FOR UPDATE` complet),
`express-backend` (les deux couches), `git-fundamentals` (la séquence de six
commandes commentée une par une), `vector-databases`, `css-flexbox`. **De l'ordre
de vingt.** Les autres donnent des étapes à suivre, pas une manipulation à
refaire.

**5. Combien expliquent les erreurs probables ?**
**Vingt-quatre** nomment une erreur probable et expliquent pourquoi elle séduit.
Les autres ont une section « ⚠️ Erreurs fréquentes » qui **liste des interdits sans
jamais montrer l'erreur ni expliquer sa tentation** : « Ne pas gérer le rejeu en
verrouillage optimiste », « Optimiser sans mesurer ». Nommer un piège n'est pas
l'enseigner ; sept leçons seulement le montrent (B.5).

**6. Combien permettent à un débutant de répondre « pourquoi ? »**
Toutes répondent au « pourquoi » de haut niveau — pourquoi ce sujet existe, à quoi
il sert. C'est le rôle réussi de « Le problème d'abord ». Beaucoup moins répondent
au « pourquoi » de mécanisme — pourquoi *ça* marche comme *ça*. Les leçons qui le
font sont identifiables : `linux-resources-io` explique pourquoi une RAM « pleine »
est saine (le cache est libéré à la demande) ; `css-flexbox` explique pourquoi un
enfant flex déborde (`min-width: auto` refuse de rétrécir sous son contenu) ;
`vector-databases` explique pourquoi deux exécutions diffèrent (le chemin exploré
n'est pas exhaustif). **Ces trois-là sont le modèle, et elles sont minoritaires.**

**7. Combien permettent d'apprendre sans tutoriel externe ?**
Les 24 de G1, sans réserve. Les 37 de G2, pour comprendre mais pas pour se
corriger — il faudra une autre source pour savoir si l'on a bien fait. Les 67 de
G3, non : l'exercice est posé, rien ne dit ce qu'on attendait, et sans correction
un débutant ne peut pas savoir qu'il s'est trompé. **Réponse honnête : 24 sur
128.**

**8. Combien annoncent une durée sans activité suffisante ?**
La condition 5 de V67 ne compte **aucune violation**, et c'est exact au sens où
chaque journée porte une activité concrète identifiable. Mais le rapport de
grandeur mérite d'être publié : **293 heures de lecture mesurées pour 1 642 heures
d'engagement annoncées, soit 18 %** — médiane de 16 % par journée. Les 82 %
restants sont de la pratique, ce qui est cohérent pour un parcours d'ingénierie.
**Ce n'est donc pas une heure fantôme, mais ce n'est démontré qu'au niveau global.**
Le CP6 devra vérifier journée par journée que les 82 % correspondent à un travail
réellement décrit, et non à un solde arithmétique.

---

## F. Les 15 dimensions — notation d'entrée V68

Barème gelé de V67, **non rouvert**. Notes établies **par lecture** de 14 leçons
en intégralité et des sections décisives de 18 autres, les compteurs ne servant
qu'à savoir si ce qui est lu se généralise.

| # | Dimension | V67 | V68 CP0 | Justification tirée de la lecture |
|---|---|---|---|---|
| D1 | Vulgarisation | 4,0 | **4,0** | « Le problème d'abord » réussit partout ; les analogies ne disent pas leur limite |
| D2 | Progression cognitive | 4,0 | **3,5** | l'ordre est bon, mais elle s'arrête à l'exemple : ni erreur, ni correction, ni transfert dans 67 leçons |
| D3 | Profondeur explicative | 4,0 | **3,5** | 62 mots par section hors G1 ; mécanismes expliqués dans une minorité |
| D4 | Modèles mentaux | 4,5 | **4,5** | réellement bons et présents partout |
| D5 | Exemples guidés | 4,0 | **2,5** | 53 mots médians ; aucune tentative, aucun échec, aucune correction |
| D6 | Version incorrecte montrée | — | **1,5** | 7 leçons sur 128 |
| D7 | Apprentissage actif | 3,5 | **2,0** | 114/128 collent la réponse à la question ; 4/128 laissent produire |
| D8 | Difficulté progressive | 3,5 | **3,0** | reconnaître/appliquer présents ; diagnostiquer et transférer rares |
| D9 | Qualité des corrections | 3,5 | **2,5** | 24 profondes, 37 plates, 67 absentes |
| D10 | Exactitude | 4,5 | **4,0** | un P0 factuel (B.1) dans la leçon dont c'est le sujet |
| D11 | Cas professionnel | 4,0 | **4,0** | présents et crédibles |
| D12 | Jargon contextualisé | 3,0 | **2,5** | 30 termes jamais expliqués, plus fréquents dans les leçons réécrites |
| D13 | Transfert | 3,5 | **3,0** | « Liens avec le programme » relie, ne fait pas transférer |
| D14 | Honnêteté du contrat | 4,5 | **4,5** | les limites du runtime sont dites explicitement, y compris quand c'est gênant |
| D15 | Cohérence d'ensemble | 4,0 | **3,0** | **trois générations éditoriales incompatibles dans le même corpus** |

**Moyenne V68 CP0 : 3,20 / 5.** V67 déclarait 3,93.

**V68 régresse donc le verdict d'entrée.** Ce n'est pas que le corpus se soit
dégradé — il n'a pas changé d'un caractère. C'est que la mesure de V67 portait sur
un échantillon primaire qu'il avait lui-même réécrit, et que la lecture d'un quart
du corpus tiré au sort donne un résultat sensiblement plus bas. Le brief autorise
explicitement cette régression et demande de la dire.

Seuil `ACADEMIC_QUALITY_READY` : 4,20. **Écart à combler : 1,00 point.**

---

## G. Priorités déduites

| Rang | Défaut | Portée | CP |
|---|---|---|---|
| **P0** | `metrics-percentiles` : p99 faux d'un facteur 50 | 1 leçon | CP4 |
| **P0** | `metrics-percentiles` : exige de calculer un percentile jamais enseigné | 1 leçon | CP7 |
| **P1** | 67 leçons sans aucune correction | 52 % du corpus | CP8 |
| **P1** | 30 termes déposés au Vocabulaire, jamais expliqués | 30 leçons | CP9 |
| **P1** | exemple guidé de 53 mots : aucune tentative, aucun échec | 128 leçons | CP5 |
| **P1** | 114 leçons collent la réponse à leur question | 89 % du corpus | CP6 |
| **P2** | 37 corrections qui répètent le cours | 37 leçons | CP8 |
| **P2** | 7 leçons sur 128 montrent une version fausse | 121 leçons | CP5 |
| **P2** | analogies dont la limite est promise et jamais donnée | à recenser | CP3 |
| **P3** | `iac-fundamentals` ligne 58 : « Modules et réutation » | 1 coquille | CP4 |

---

## H. Ce que ce CP0 change pour la suite du sprint

1. **Le standard du CP2 ne s'invente pas.** Il s'extrait des 24 leçons G1, qui
   prouvent que ce dépôt sait déjà écrire un vrai cours, dans sa propre voix.
   Écrire un gabarit neuf serait la « usine à Markdown » que le brief interdit.

2. **La cible de travail est G3 → G1, pas « les 128 ».** Une réécriture uniforme
   des 128 leçons est interdite par le brief et serait de toute façon nuisible :
   `css-flexbox`, `vector-databases`, `statistics-for-ml`, `git-fundamentals`,
   `database-transactions-concurrency`, `linux-resources-io` n'ont pas besoin
   d'être touchées.

3. **Deux défauts sont universels et se traitent partout** : l'exemple guidé de
   53 mots (D5 = 2,5) et la réponse collée à sa question (D7 = 2,0). Ce sont les
   deux notes les plus basses, et les seules qui n'aient été améliorées par aucun
   sprint précédent.

4. **Une leçon excellente et hors parcours reste inutile.** `css-flexbox`,
   `iac-fundamentals`, `k8s-security`, `responsive-design` sont parmi les
   meilleures lues, et aucune journée ne les programme. Le CP11 est donc un
   chantier de valeur, pas de rangement.

---

## I. Sondes écartées à ce CP0

Deux sondes, écrites puis abandonnées après vérification par lecture. Elles sont
conservées en toutes lettres dans `scripts/v68-lecture.mjs`, avec le détail de
leurs faux positifs. Ce projet en a produit treize ; les déclarer coûte moins cher
que de les corriger jusqu'à ce qu'elles disent ce qui arrange.

- **`vocabulaireOrphelin`** — annonçait 84 %. Cherchait les libellés du
  Vocabulaire littéralement, y compris ceux contenant un retour à la ligne du
  fichier source. Mesurait la coïncidence typographique, pas l'explication.
  Remplacée par `termeJamaisExplique`, restreinte aux termes d'un seul mot et
  vérifiée un par un — 30 vrais positifs, 4 artefacts déclarés.
- **`exempleSansEchec`** — cherchait un champ lexical d'échec. Classait
  `linux-resources-io` comme « comporte un échec » parce que le mot « corriger »
  y figure. Écartée sans remplacement : ce qu'elle visait est mesuré par
  `contreExemple`, qui exige une section ou un bloc de code marqué comme tel.

Aucun chiffre issu de ces deux sondes n'est repris ailleurs dans ce rapport.
