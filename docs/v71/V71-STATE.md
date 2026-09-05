# V71 — ÉTAT D'AVANCEMENT

> Fichier de reprise. Mis à jour après **chaque lot** et après **chaque CP**. En cas
> d'interruption, relire ce fichier, vérifier Git, et reprendre au point indiqué.
> NE PAS refaire CP0, CP1, CP2.

## Position

- **dernier CP terminé** : **CP9**
- **CP actuel** : **CP10 en cours — 36 / 128 sections de pratique lues**
- **leçons réellement lues et notées** : **128 / 128** ✅
- **P0 : 0 · P1 : 0 · P2 : 0** — tous fermés. Les 10 P3 sont désormais ouverts (§12).
- **prochaine action EXACTE** : **CP10, lot 3** — les 10 leçons encore à D8 = 4
  (`ai-evaluation`, `database-migrations`, `etl-pipelines`, `machine-learning-basics`,
  `prompt-engineering`, `prompt-injection-defense`, `python-foundations`, `rag-evaluation`,
  `retrieval-reranking`, `vector-databases`), puis le reste de l'ordre de lecture. Les 10 P3
  sont traités au fil du passage.

### CP10 — ce que la lecture a trouvé sur les notes D8 elles-mêmes

Le lot 2 a lu **28 leçons** dont **26 notées D8 = 5 au CP3 mais signalées sans marqueur de
critère** par la sonde. Résultat, et il tranche la question dans les deux sens :

- **24 des 26 portent un critère réel** — le marqueur manquait parce que le bloc
  « Vérifie seul, sans corrigé » écrit ses critères sans jamais employer le mot. Ce sont de
  vrais critères, décidables seul : « compte tes formats d'erreur, il doit y en avoir **un** »
  (`api-design-basics`), « tout ce que tu arrives à écrire n'a pas besoin d'un agent »
  (`agents-fundamentals`), « dix secondes pile signifient que le délai de grâce a expiré »
  (`docker-build-dockerfile`), « si les scores sont meilleurs sur le jeu d'entraînement, tu
  mesurais de la mémorisation » (`model-evaluation`). **Le D8 = 5 du CP3 est confirmé par
  relecture sur ces 24.**
- **2 ne portaient aucun critère** : `monitoring-production` (aucun bloc « Vérifie seul ») et,
  en partie, `docker-containers`, `interview-preparation`, `observability-logging`,
  `release-incident-recovery` dont les livrables étaient nommés mais sans énoncé de réussite.
  Leur **D8 = 5 au CP3 était optimiste**. Corrigé en écrivant les critères, pas en baissant la
  note — mais la note était acquise avant de l'être, et cela doit être dit.

### CP10 — la grille R/E/D/P/T

Opérationnalisation des **cinq éléments déjà écrits dans l'ancre D8 = 5** du contrat gelé au
CP1. Elle n'ajoute aucune dimension et ne touche pas au barème (§6) — elle rend les cinq
éléments vérifiables un par un :

| | élément de l'ancre D8 = 5 |
|---|---|
| **R** | production **réelle** et observable — l'apprenant produit, il ne restitue pas |
| **E** | **énoncé du contexte** — une situation, pas un énoncé hors-sol |
| **D** | contraintes **données** — ce qui est imposé, ce qui est interdit |
| **P** | livrable nommé — le **produit** attendu est dit |
| **T** | critère de réussite vérifiable seul — le **test** que l'apprenant s'applique |

**La sonde a été jetée trois fois avant d'être utilisable, et c'est le résultat le plus utile
du début de CP10 :**

1. *v1* incluait les sections « 🛠️ Pratique », qui ne sont pas des consignes mais des
   **renvois** vers les exercices auto-corrigés de la plateforme. Leurs 45 à 60 mots de
   routage plaçaient en tête de l'ordre de lecture des leçons dont la vraie consigne est
   ailleurs et va très bien (vérifié sur `api-design-basics`).
2. *v2* excluait donc **tout** titre commençant par 🛠️ — et jetait avec eux des pratiques
   réelles, la même icône servant aux deux usages (vérifié sur `browser-dom-rendering`, dont
   la pratique est l'un des meilleurs dispositifs du corpus). Discriminant retenu : un renvoi
   s'intitule « Pratique » tout court, une consigne annonce ce qu'on va faire après un tiret.
3. *v3* — la plus instructive — **excluait les sections de correction**, où vit le bloc
   « Vérifie seul, sans corrigé ». Ce bloc est présent dans **66 des 128 leçons** et il porte
   très souvent le **T** à lui seul. La sonde déclarait donc « aucune pratique » sur quatre
   leçons qui en ont une, et « T absent » sur des dizaines qui le portent.

**Ce que cela dit du CP3 :** une sonde mal cadrée aurait produit un ordre de travail faux, et
aucune des trois erreurs n'était visible sans ouvrir les leçons concernées. C'est la
justification empirique de la règle du brief §4 — une sonde priorise, elle ne note pas.

> **Ordre imposé (brief §12) : P0, puis P1, puis P2 — pas les P3 tant qu'il reste des P1.**
> Ordre respecté : P1 fermés du CP4 au CP8, P2 fermés au CP9, P3 ouverts seulement ensuite.

---

## CP4 — corrections fondations et systèmes

Cinq P1 corrigés, **tous vérifiés après correction**. Aucun P2 ni P3 touché (ordre §12).

### Le défaut de contenu

**`observability-logging`** — la correction de la pratique C annonçait un centile 95 de
3 000 ms pour un jeu à 95 % / 5 %, alors que ce jeu donne p95 = 50 ms. Elle échouait donc à
l'exercice qu'elle corrigeait, puisque l'énoncé demandait un jeu où le p95 est **mauvais**.

Correction : le jeu passe à **94 % / 6 %**, recalculé — moyenne **227 ms**, p95 **3 000 ms**,
**60 000** personnes sur un million de requêtes. Et l'erreur d'origine est **retournée en
matériau pédagogique** : un paragraphe ajouté montre qu'au même jeu à 5 %, le p95 vaut 50 ms
et devient *excellent* pendant que cinquante mille personnes attendent toujours trois
secondes — parce que le centile est posé pile à la frontière du groupe lent. La règle qui en
sort est plus forte que le chiffre : **un centile choisi ne dit rien de ce qui se passe
au-delà de lui.** D1 : 2 → 5. D9 : 4 → 5.

### Les quatre défauts de prérequis

Remède 1 de `PREREQUIS-ORDRE.md` §6 appliqué aux quatre : la notion nécessaire est
**intégrée dans la leçon**, et la leçon postérieure sort de la liste des prérequis vers un
encadré « Où trouver le détail » qui signale explicitement qu'elle vient plus loin.

| leçon | ce qui a été intégré | D2 |
|---|---|---|
| `ci-cd-pipeline-anatomy` | ce qu'est un artefact, et qu'une image est un paquet contenant l'application | 1 → 5 |
| `design-patterns-intro` | les trois principes de code propre dont un pattern est l'application nommée | 1 → 5 |
| `readme-documentation` | rien à intégrer : la structure du README est déjà construite sur place | 1 → 5 |
| `scikit-learn-workflow` | la définition de la **fuite de données** en une phrase — la notion dont dépend l'existence même du Pipeline | 1 → 5 |

**Ce que la sonde dit, et pourquoi c'est correct.** `scripts/v71/prerequis-ordre.mjs` compte
toujours **31** citations pointant vers une leçon postérieure — le chiffre n'a pas bougé, et
il ne devait pas : les citations existent encore. Ce qui a changé est leur **formulation**,
donc leur classe à la lecture : cinq citations passent de la classe B (exigence non signalée)
à la classe A (aide explicitement signalée). C'est exactement le rappel du contrat §1 — une
sonde détecte, elle ne classe pas.

### Effet mesuré

| | avant CP4 | après CP4 |
|---|---|---|
| moyenne du corpus | 4,820 | **4,831** |
| moyenne D2 | 4,31 | **4,44** |
| leçons à D2 = 1 | 20 | **16** |
| P1 ouverts | 23 | **18** |

Validation après correction et re-gel des 9 gates de corpus (nouveau hash
`0da3692f1eda45bf0ae9749e8f03738d9fc3f24a`) : `gates:active` **0**, `npm test`
**1420/1420**, `tsc --noEmit` **0**, `npm run build` **0**.

---

## CP5 — corrections frontend

Trois P1, tous des défauts de prérequis, tous fermés par le remède 1 (intégrer la notion,
sortir la citation vers un encadré signalé).

| leçon | ce qui a été intégré, ou pourquoi rien ne l'était | D2 |
|---|---|---|
| `react-application-states` | « un état se place au plus proche ancêtre commun de ceux qui le lisent, et ce qui peut se calculer ne se stocke pas » — la leçon précise ensuite qu'elle s'occupe d'une **autre** question, celle des états que le modèle rend *représentables* | 1 → 5 |
| `web-forms-validation` | « une balise porte un sens, et le navigateur en tire un comportement gratuit » — label cliquable et annoncé, `<button>` atteignable au clavier, `<input>` typé déclenchant le bon clavier mobile | 1 → 5 |
| `frontend-performance` | **rien** : la mémoïsation était présentée comme prérequis alors que la leçon la définit et la mesure elle-même, et que c'est précisément son usage **par réflexe** qu'elle cherche à corriger | 1 → 5 |

Le cas de `frontend-performance` mérite d'être noté : le remède était **déjà dans la même
section**. La leçon traitait correctement `responsive-design` par un encadré « Étagère de
référence » deux lignes plus bas, tout en exigeant `react-composition-architecture` sans le
signaler. Corriger revenait à appliquer à la seconde citation ce que la leçon faisait déjà
pour la première.

Validation après re-gel (hash `8a428b9b4bf2c890b2d1a0e0963839b686f01387`) : `gates:active`
**0**, `npm test` **1420/1420**, `tsc --noEmit` **0**.

Effet cumulé CP4 + CP5 : moyenne **4,820 → 4,838**, D2 **4,31 → 4,53**, leçons à D2 = 1
**20 → 13**, P1 **23 → 15**.

---

## CP6 — web, backend, SQL, données

**Le seul P1 de pratique du sprint est fermé.** `sql-performance-indexing` enseignait
`EXPLAIN`, en faisait son premier geste, et ne le faisait jamais exécuter : son unique
exercice renvoyait à un `fix-nplus1` en JavaScript sur des tableaux d'objets. Une pratique en
cinq parties a été écrite sur la compétence annoncée — mesure de départ avec
`EXPLAIN QUERY PLAN`, pose de l'index et vérification que le **verbe** passe de `SCAN` à
`SEARCH`, trois requêtes où l'index reste inutilisable, coût en écriture sur 20 000
insertions, et création délibérée d'un index inutile avec la phrase de revue de code qui
demanderait sa suppression.

Elle est faisable **sans aucune installation** : `node:sqlite` est intégré à Node, ce que j'ai
vérifié en rejouant le script de la leçon. La note « réel vs simulé » a été réécrite pour
distinguer l'exercice auto-corrigé de la plateforme — qui reste en JavaScript, et c'est
assumé — de cette pratique qui tourne sur une vraie base. D8 : 2 → 5, D12 : 4 → 5.

**Un second défaut trouvé pendant la correction, en rejouant le script.** La leçon écrivait
que « les valeurs absolues dépendent de la machine ; les plans **et les rapports**, non ».
Quatre exécutions consécutives sur la **même** machine donnent des rapports de **436, 542, 726
et 760** — le rapport varie d'un facteur 1,7. Les plans, eux, sont parfaitement stables
(`SCAN` sans index, `SEARCH` avec, à chaque fois). Le texte publie désormais les quatre
valeurs et en tire un argument qui sert la leçon : **même ce script ne se reproduit pas au
chiffre près lui-même**, ce qui est la première raison de mesurer sur *sa* base.

Les trois défauts de prérequis du lot :

| leçon | ce qui a été intégré | D2 |
|---|---|---|
| `express-backend` | la distinction erreur *attendue* / *inattendue*, celle qui décide de ce qui va dans une route et de ce qui va dans le gestionnaire d'erreurs | 1 → 5 |
| `caching-performance` | **rien** : l'exemple guidé construit lui-même le ralentissement qu'il mesure, à partir d'une table vide, et compte les allers-retours plutôt que les millisecondes | 1 → 5 |
| `async-messaging-queues` | « on réessaie » — un message non acquitté est représenté, l'espacement croît, et c'est exactement ce qui rend la livraison *au moins une fois*, donc ce qui oblige à un consommateur idempotent | 1 → 5 |

`caching-performance` était le **plus grand écart de la classe B corrigé à ce jour** (+55 j),
et il n'a rien coûté : la leçon n'avait aucun besoin réel de `sql-performance-indexing`. Les
deux sujets sont désormais distingués d'une phrase — l'une s'occupe du travail qu'on peut
**éviter**, l'autre du travail qu'on ne peut pas éviter mais qu'on peut accélérer.

Validation après re-gel (hash `e3d3f1d05b85e3fb10ae3688aaa461701276b067`) : `gates:active`
**0**, `npm test` **1420/1420**, `tsc --noEmit` **0**.

Effet cumulé CP4 → CP6 : moyenne **4,820 → 4,847**, D2 **4,31 → 4,63**, D8 **4,82 → 4,84**,
leçons à D2 = 1 **20 → 10**, P1 **23 → 11**.

---

## CP7 — ML, IA appliquée, LLM, RAG, agents

Le plus gros lot : **sept défauts de prérequis et un défaut de contenu**, tous fermés.

**Les deux plus graves du corpus sont dans ce lot, et aucun n'a coûté cher.**

`agent-workflows-orchestration` exigeait `resilience-patterns` avec **+57 j** — le plus grand
écart mesuré. Or la leçon **construit déjà elle-même**, dans son exemple guidé, les trois
mécanismes qu'elle semblait exiger : borner le parallélisme, écrire l'état au fur et à mesure
pour pouvoir reprendre, isoler l'échec d'un élément. Chacun y est introduit par le problème
qu'il résout et écrit en entier. Il suffisait de le dire.

`transformers` exigeait `embeddings` avec **+35 j**, et c'était le plus grave *par la
centralité de la notion* : un transformer manipule des embeddings de bout en bout. La notion
est désormais définie en deux phrases sur place — chaque token devient une liste de nombres
telle que deux mots employés dans des contextes semblables reçoivent des vecteurs proches, et
« proche » se mesure par l'angle. C'est exactement ce que le tableau d'attention de la leçon
calcule : elle est maintenant autoportante.

| leçon | écart | ce qui a été intégré |
|---|---|---|
| `agent-workflows-orchestration` | +57 j | rien : les trois mécanismes étaient déjà construits |
| `prompt-engineering` | +56 j | comment on juge qu'un prompt est meilleur : vingt cas écrits d'avance, on compare les cas passés |
| `transformers` | +35 j | la définition de l'embedding, en deux phrases |
| `rag-evaluation` | +35 j | les quatre notions d'évaluation, une ligne chacune |
| `llm-cost-optimization` | +21 j | ce qu'est un RAG, en une phrase |
| `ai-security` | +14 j | ce qu'est un agent : un modèle à qui l'on a donné des outils |
| `prompt-injection-defense` | +14 j | le moindre privilège, rattaché aux droits sur un système de fichiers |

### Le défaut de contenu : `llm-cost-optimization` D1 2 → 5

Les deux leviers énoncés en **ratios de jetons** sont corrigés en **ratios de facture** :

| | avant | après (recalculé) |
|---|---|---|
| levier 1, modèle A → C | « environ 60, sur n'importe quelle ligne » | **53,6 · 48,3 · 44,6 · 48,3** |
| levier 2, contexte 6 000 → 1 100 jetons | « par cinq environ » | **2,9** (A) · **3,1** (B) · **2,4** (C) |
| RAG contre historique complet | « trois fois moins cher » | **deux fois** (900 € contre 444 €) |

Et l'erreur est **retournée en enseignement, deux fois**. Le rapport des prix d'entrée vaut
bien 60 — mais **un rapport de prix n'est pas un rapport de facture**, puisque la sortie suit
un autre rapport (37,5) et pèse lourd. Et diviser les jetons par 5,5 ne divise la facture que
par 2,9, parce que le coût de sortie n'a pas bougé et pèse d'autant plus que l'entrée maigrit.
**La leçon enseigne désormais le piège qu'elle commettait.**

Validation après re-gel (hash `db3c1a6d34511d38e559b14d142423749c91963f`) : `gates:active`
**0**, `npm test` **1420/1420**, `tsc --noEmit` **0**.

Effet cumulé CP4 → CP7 : moyenne **4,820 → 4,864**, D2 **4,31 → 4,84**, leçons à D2 = 1
**20 → 3**, P1 **23 → 4**.

---

## CP8 — les quatre derniers P1. **P1 = 0.**

Les quatre relèvent du domaine Carrière, donc formellement du CP9 — mais il ne restait qu'eux,
et le brief §12 interdit d'ouvrir les P2 tant qu'un P1 subsiste. Les traiter ici ferme la
séquence.

**`technical-debt` : la ligne C a été recalculée, pas seulement corrigée d'unité.** Le défaut
n'était pas seulement que « ~10 j » valait 10,67 h : c'est qu'avec 1,33 j/an la dette C passait
**derrière** A, et que l'observation « C est celle qu'on sous-estime » ne découlait plus du
tableau. Les deux tableaux sont donc refaits de façon cohérente — l'export est touché ~1 fois
par **mois** et non par trimestre, et retrouver puis corriger un export faux coûte ~**2 jours**
et non 1. Le calcul est posé en clair : `(1/3) × 2 × 12 = 8 jours par an` pour un principal de
3, soit **le coût annuel le plus élevé du tableau** devant les 4,5 j de A, et l'amortissement
le plus court (4,5 mois contre 5,5). **La thèse de la leçon découle enfin de ses propres
chiffres.** Le paragraphe est de surcroît renforcé : ce qui rend cette dette invisible n'est
pas sa taille mais sa **forme** — on se souvient des mois calmes, pas de l'espérance.

Les trois derniers prérequis :

| leçon | écart | ce qui a été intégré |
|---|---|---|
| `interview-preparation` | +23 j **et** +18 j | la seule leçon à **deux** prérequis postérieurs. Le seul prérequis réel est nommé comme tel (avoir des projets, qui ne s'apprend pas mais se constitue) ; les deux méthodes sont données en une ligne chacune |
| `technical-storytelling` | +17 j | rien : le vrai prérequis est d'avoir mené un projet. L'encadré ajoute l'ordre logique — le récit se prépare d'abord, la vitrine l'expose ensuite |
| `technical-documentation` | +2 j | ce qu'est un changement cassant, avec la raison qu'on l'écrit : parce qu'on ne s'en souvient plus deux ans après |

### Résultat de la séquence CP4 → CP8 sur les prérequis

`scripts/v71/prerequis-ordre.mjs` compte toujours **31** citations pointant vers une leçon
postérieure — il ne pouvait pas en compter moins, puisque les citations sont conservées :
c'était l'objet du remède, signaler plutôt que supprimer. Ce qui a changé est leur **classe à
la lecture** :

| | avant CP4 | après CP8 |
|---|---|---|
| classe A — signalées | 9 | **31** |
| classe B — exigences ≥ 7 j | 17 | **0** |
| classe C — exigences à 2 j | 5 | **0** |

**Zéro citation postérieure non signalée dans le corpus.** Un filtre heuristique en signalait
une (`scikit-learn-workflow` → `model-evaluation`) : vérification faite, c'est un faux positif
de mon propre extracteur, qui coupe l'encadré « Où trouver le détail » en deux. La citation est
bien signalée dans le fichier.

Validation (hash `a0d4f462b822b7276a273531407c262a566e74a8`) : `gates:active` **0**,
`npm test` **1420/1420**, `tsc --noEmit` **0**, `npm run build` **0**.

### Bilan des P1

| | avant CP4 | après CP8 |
|---|---|---|
| **P1** | **23** | **0** |
| moyenne du corpus | 4,820 | **4,873** |
| D2 | 4,31 | **4,94** |
| leçons à D2 = 1 | 20 | **0** |

Les 24 défauts P1 (23 leçons, `llm-cost-optimization` en portait deux) se répartissaient en
**20 défauts de prérequis, 3 erreurs de calcul et 1 pratique manquante**. Tous fermés, chacun
vérifié après correction.

---

## CP9 — les 14 P2. **P2 = 0.**

Cinq classes, quatorze leçons, quatorze défauts fermés. Le point qui compte pour la
crédibilité de la mesure vient à la fin de cette section : **dix des quatorze corrections ne
déplacent aucune note.**

### Classe 1 — les cinq chiffres qui ne se reproduisaient pas

| leçon | ce qui était faux | ce qui est publié maintenant |
|---|---|---|
| `browser-dom-rendering` | `N = 21` alors que la démonstration en produit 20 | `N = 20`, et « vingt et une occasions d'erreur » → « vingt » |
| `prompt-engineering` | « cinq sorties sur neuf » alors que le décompte en donne quatre | « quatre sorties sur neuf » |
| `python-foundations` | `TypeErreur` — nom d'exception francisé, inexistant en Python | `TypeError` partout |
| `ai-evaluation` | note globale non reproductible : une moyenne simple donne 0,63 pour C, pas 0,77 | la pondération **0,40 / 0,40 / 0,20 est énoncée avant le tableau**, et C vaut **0,76** |
| `cloud-finops` | colonne à 1 884 contre un total publié à 1 885 ; second geste à 269 € pour « 14 heures par jour » | voir ci-dessous |

**`ai-evaluation` : la correction devait préserver l'argument, pas seulement l'arithmétique.**
La thèse de la leçon est que trois systèmes très différents obtiennent des notes globales
quasi identiques, C restant la plus basse de peu. Avec la pondération désormais explicite :
**A = 0,78 · B = 0,78 · C = 0,76.** L'argument tient et devient vérifiable au lieu d'être
affirmé.

**`cloud-finops` : deux défauts, dont un corrigé en l'expliquant plutôt qu'en le masquant.**

1. *La colonne qui ne somme pas.* Additionner les neuf lignes donne 1 884 €, le total publié
   est 1 885 €. La tentation était de retoucher une ligne. Ce qui a été fait à la place :
   **dire pourquoi**. Chaque ligne est arrondie à l'euro pour la lisibilité, le total est
   calculé sur les montants exacts (1 884,80 €). Une vraie facture cloud fait exactement
   cela, c'est une source classique de discussions pénibles avec la comptabilité, et la
   leçon en tire une règle : on additionne les montants exacts, puis on arrondit — jamais
   l'inverse. **Un défaut converti en point d'enseignement.**
2. *Le geste à 269 €.* Le script calculait l'extinction sur un mois de **30 jours** alors que
   la facture est calculée sur **730 heures** (30,42 jours). Un lecteur qui fait 467 × 14/24
   trouve 273 et croit s'être trompé. Le script utilise désormais la même base horaire :
   **273 €**, cumul **535 €** au lieu de 531, pourcentage inchangé à **28 %**. La leçon
   publie le calcul (350 + 117 = 467, dont 14/24). Défaut annexe corrigé au passage : le
   libellé du script annonçait « la nuit **et le week-end** » alors qu'il ne calculait que
   14 h/24.

### Classe 2 — les deux sections dupliquées, traitées différemment

Les deux leçons portaient une seconde « Vérification de compréhension » non corrigée,
reliquat d'une restructuration. **Elles n'ont pas reçu le même traitement, et c'est le point
méthodologique de cette classe :**

- `async-messaging-queues` — les trois questions de l'annexe étaient couvertes par la section
  corrigée et par le corps. La troisième (« file ou pub/sub pour prévenir facturation, stock
  et e-mail ») est **littéralement** la phrase de la section « File vs publish/subscribe »,
  trois écrans plus haut. **Supprimée sans reprise.**
- `system-design-scaling` — sa question sur les points de défaillance unique n'était couverte
  **nulle part** dans la section corrigée. La supprimer aurait fait disparaître du contenu.
  Elle est **reprise comme question 5**, avec une correction écrite pour l'occasion : les
  trois instances ne sont pas des SPOF (c'est ce que la redondance a acheté), le répartiteur
  s'élimine à bas coût parce qu'il ne détient aucun état, et la base est le cas difficile
  parce qu'ajouter une réplique ne suffit pas — il faut trancher qui déclenche la bascule,
  comment on empêche deux primaires simultanés, et ce qu'on fait des écritures acquittées non
  répliquées. **La haute disponibilité d'une base ne se paie pas en machines, elle se paie en
  décisions de cohérence.** Plus le troisième SPOF que le schéma ne montre pas : la zone.

Les deux passent D13 4 → 5 : avant, un tiers des questions n'avait pas de correction, ce qui
est exactement l'ancre « vérification présente mais **partielle** ».

### Classe 3 — les deux gloses cassées

`database-migrations` répétait « rejouables sans double effet » deux fois dans la même phrase
avec deux ponctuations différentes. `feature-engineering` insérait sa glose sur
« surapprentissage » entre le terme et la fin de la phrase, orphelinant le fragment « servi
sur un plateau ». Édition inachevée dans les deux cas. Corrigées.

### Classe 4 — `typescript-frontend` et `javascript-basics` : la redite mesurée

`typescript-frontend` produisait **trois fois** l'argument sur `as`, la troisième quasi mot
pour mot, dans une section intitulée « ✅ Correction attendue » **qui ne corrigeait aucun
exercice** — la leçon n'a pas de vérification de compréhension à cet endroit. La redite est
supprimée, la section retitrée « L'ordre de travail, et un dernier angle mort », et ne
conserve que ce qui n'est dit nulle part ailleurs : l'ordre props → événements → frontière,
et le fait qu'**une validation sans traitement de l'échec ne supprime pas le silence, elle le
déplace** vers un écran blanc que personne ne sait expliquer.

`javascript-basics` portait la seule note à **2** du corpus (D14, répétition interne) : son
« Mini-exercice » était un **sous-ensemble strict** de la « Pratique A → E », et sa correction
redisait la mutation dans `map`, la copie superficielle et les dix expressions — 114 mots sur
trois blocs. Mini-exercice et correction supprimés (82 lignes), **après reversement des deux
seuls éléments qui n'existaient que là** : l'alternative « stocké contre dérivé » qui annonce
React, et la vérification concrète `const avant = produits[0].prix` — qui est ce qui montre
pourquoi `soldes !== produits` ne prouve rien, le tableau étant bien neuf dans la version
fautive. Les six règles du bloc des dix expressions ont été conservées dans leur version
**longue**, la plus explicative des deux. D14 : **2 → 5**. D11 : 3 → **4** et pas 5 — la
pratique D renvoie explicitement à la liste d'expressions de la correction qui suit, ce qui
reste un renvoi vers l'aval, signalé donc toléré par l'ancre 4.

### Classe 5 — les deux noyaux catalogue, corrigés sans gonfler

Les deux étaient **plafonnés à 3 en D6 par la précision opposable du contrat** : un noyau qui
n'énonce que des définitions ne dépasse pas 3, quelle que soit leur justesse. La correction ne
pouvait donc pas être du volume — elle devait apporter un **outil de raisonnement**.

- `database-modeling` (199 mots, le plus court et le plus catalogue) reçoit une **colonne
  vertébrale** : les six notions deviennent **trois décisions ordonnées** — où vit chaque
  fait / qu'est-ce qui doit rester vrai / qu'est-ce qui est trop lent — avec la raison de
  l'ordre, qui est le vrai enseignement : *une base contenant déjà des données incohérentes
  refuse la contrainte qui les aurait empêchées*, et on n'indexe qu'après avoir mesuré. Plus
  l'arbitrage manquant : normalisation contre dénormalisation tranchées par **qui paie
  l'erreur**, avec une règle opérable — si tu ne sais pas écrire le recalcul de la copie, tu
  ne dénormalises pas, tu improvises. Les cinq éléments de l'ancre D6=5 sont présents :
  **D6 3 → 5**.
- `interview-preparation` (247 mots, cinq formats énumérés) reçoit le critère de répartition
  qui manquait : le **taux de réemploi** (la banque de chiffres sert trois formats, un kata ne
  sert qu'à lui-même), l'erreur typique **avec sa cause** (on sur-investit les katas parce que
  c'est le seul format où l'on voit un score monter le soir même — et celui dont le rendement
  décroît le plus vite), et le quand-ne-pas (un test technique éliminatoire en première étape
  annule le critère). Le modèle mental passe de 44 mots énonciatifs à un renversement
  argumenté : préparer, ce n'est pas réviser, c'est produire des artefacts réutilisables.
  **D6 3 → 4 et non 5** : quatre des cinq éléments de l'ancre sont là, le coût de la
  préparation reste implicite. La différence de traitement entre les deux leçons est
  délibérée et opposable.

### `react-composition-architecture` — le défaut trouvé par lecture croisée

La leçon présentait le hook personnalisé comme encapsulant « les trois états
loading/error/data » — **la forme exacte que `react-application-states` démontre fausse par
dénombrement**, neuf jours plus tôt (jour 95 contre jour 104, vérifié). Corrigé en une
demi-phrase de principe : le hook renvoie un état à **statut unique**, la leçon antérieure est
citée comme la démonstration, et l'incohérence devient un **argument pour** le hook — il n'y a
plus qu'un endroit où cette forme peut être correcte, au lieu de cinq.

### Le point qui compte : dix corrections sur quatorze ne déplacent aucune note

| | avant CP9 | après CP9 |
|---|---|---|
| **P2** | **14** | **0** |
| moyenne du corpus | 4,873 | **4,883** |
| D1 | 4,945 | 4,984 |
| D6 | 4,844 | 4,867 |
| D11 | 4,875 | 4,883 |
| D13 | 4,289 | 4,305 |
| D14 | 4,922 | **4,984** |

Quatorze défauts fermés font monter la moyenne de **0,010 point**. Ce n'est pas un échec de la
correction, c'est une propriété du barème gelé au CP1, et il faut la dire franchement : sur
dix des quatorze leçons, **la note n'avait pas été baissée pour ce défaut**. Un comptage faux
isolé dans une leçon par ailleurs exacte ne fait pas tomber D1 de 5 à 4 sous l'ancre ; il a été
inscrit comme P2 au ledger sans coût en note. Corriger ferme le défaut sans rien rendre.

Trois conséquences, toutes assumées :

1. **Aucune note n'a été baissée rétroactivement pour rendre les corrections rentables.** Ce
   serait exactement le déplacement de seuil après mesure qu'interdit le §7.
2. **`react-composition-architecture` reste à 5/5 sur les quatorze dimensions** alors qu'elle
   portait une incohérence réelle. La raison est structurelle et mérite d'être notée pour le
   CP15 : le défaut est **inter-leçons**, et la notation D1→D14 s'applique à une leçon lue
   seule. Le barème ne peut pas le voir. Il a été trouvé en lisant deux leçons l'une contre
   l'autre — c'est-à-dire par la méthode, pas par la grille.
3. **Le mapping des notes a été refait après vérification.** Le premier jet attribuait les
   hausses aux dimensions thématiquement proches (D3 pour un chiffre faux, D12 pour une glose).
   Relecture des justifications CP3 : `ai-evaluation` et `cloud-finops` portent littéralement
   « D1 à 4 : voir le défaut ci-dessus », et les gloses avaient coûté **D14**, pas D12. Les
   notes ont été **remises à leur valeur CP3 puis redéplacées** selon la dimension réellement
   pénalisée. Deux hausses du premier jet ont été **annulées** faute de pouvoir les
   démontrer : `typescript-frontend` D9 (le corrigé A→E n'a pas été relu en entier au CP9) et
   `database-migrations` D12 (mauvaise dimension).

### Un cas où une porte a eu raison, et un où elle n'aurait pas dû décider

`curriculum:depth-check` a signalé après coup : « `typescript-frontend` : pas de
mini-exercice ». Sa règle est `/exercice|mini-exercice/i` — un test de **présence de mot**. La
réponse conforme au §7 aurait été de refuser d'insérer le mot. Vérification faite, le mot
disparu appartenait à une phrase que j'avais supprimée avec la redite et **dont l'absence était
une perte réelle** : celle qui répond à la question qu'un lecteur se pose forcément — *pourquoi
m'a-t-on fait écrire un prédicat à la main si une bibliothèque le fait mieux ?* Le passage a
donc été réécrit et développé (la bibliothèque n'annule pas la décision, elle l'exécute ; une
équipe qui l'installe sans avoir compris ce qu'elle remplace valide dans un coin et pas dans un
autre). **C'est le contenu qui a été restauré, pas le mot** — si la vérification n'avait pas
mis au jour une perte, la porte aurait été contestée dans ce fichier plutôt que satisfaite.

### Probes

Les deux sondes structurelles portent désormais leur verdict CP9 en clair. `titres-doubles`
tombe de **2 défauts réels à 0** (26 doubles « Correction attendue » restent, légitimes : deux
exercices, deux corrections). `glose-dupliquee` tombe de **1 à 0** ; les **19 parallélismes
délibérés sont conservés** — les supprimer pour faire tomber un compteur serait du Goodhart.

Validation (hash `a852a39002f5981d849cee686343438ed1dbb232`) : `gates:active` **0**,
`npm test` **1420/1420**, `tsc --noEmit` **0**, `npm run build` **0**.

---

## Incident de session — perte du conteneur (2026-09-05)

La session du 2026-08-30 a été interrompue par une limite d'usage, puis le conteneur a été
détruit. Le nouveau conteneur est reparti d'un dépôt vide. Audit forensique effectué avant
toute écriture ; aucun `reset --hard`, aucun force-push, aucune ref supprimée.

**Récupéré** : tout ce qui avait été poussé, jusqu'à `aebbdaa` (CP3 lot 5).

**Perdu** — matériellement, non reconstructible sans relecture :

| perdu | contenu | statut |
|---|---|---|
| commit `8045888` | CP3 lot 6 — 8 leçons lues et notées | **à refaire par lecture** |
| lot 7 partiel | 4 leçons lues, jamais notées ni commitées | **à refaire par lecture** |
| `PREREQUIS-ORDRE.md` | jamais commité | **reconstruit par re-mesure** (§ ci-dessous) |

Le chiffre « 48/128 » annoncé en console avant la coupure **n'est pas repris**. Les huit
notations du lot 6 n'existent dans aucun artefact : elles seront refaites par lecture.
L'état prouvé est **40/128**, et c'est celui qui est publié.

`PREREQUIS-ORDRE.md` n'a pas été recopié de mémoire : la détection a été écrite en script
(`scripts/v71/prerequis-ordre.mjs`, qui n'existait pas), rejouée sur le corpus intact, et les
31 formulations relues. Les comptes sont identiques ; un point a été corrigé par la relecture
(§5 du document : 6/6 prérequis hors parcours correctement signalés, et non 4/6).

**Règle adoptée pour la suite** : commit + push après **chaque lot de 8**, sans attendre la
fin d'un CP. Une future perte de conteneur coûte au maximum 8 lectures.

---

## Invariants revérifiés à la reprise (2026-09-05)

| invariant | attendu | mesuré | état |
|---|---|---|---|
| leçons | 128 | 128 | OK |
| journées | 365 | 365 | OK |
| solutions | 365 | 365 | OK |
| corpus des 128 leçons (SHA1) | `edbfecdf…` | `edbfecdff1d3e4c320cedd51ede95601fd94750d` | **identique au CP0** |
| `data/program.json` (SHA1) | `5ac3da30…` | `5ac3da304994c298ab964a4b03e13da336bb8935` | **identique au CP0** |
| `data/progress.json` | non versionné (`.gitignore` l. 8) | absent du dépôt | **non vérifiable, et normal** |
| working tree | propre | propre | OK |
| stash | vide | vide | OK |
| objets orphelins (`git fsck`) | — | aucun | OK |
| local == origin | oui | `aebbdaa` des deux côtés | OK |

`data/progress.json` est un fichier d'état utilisateur local, ignoré par Git depuis l'origine.
Son empreinte notée au CP0 portait sur le fichier du conteneur détruit ; elle **ne peut pas**
être revérifiée ici, et cela ne constitue pas une perte : V71 interdit d'y toucher (§30).

## Validation à la reprise

`npm test` **1420 / 1420** · `npx tsc --noEmit` **0** · `npm run build` **0** ·
`npm run gates:active` **0** (dont `v66:check` 56 vérifications, `v66:render` 950 fichiers).

---

## Avancement de la notation

- leçons réellement lues : **128 / 128**
- notations D1→D14 complètes : **128 / 128**
- moyenne du corpus : **4,820** · minimum **4,14** · maximum **5,00**
- leçons sous 3,00 : **0** · minimum du corpus : **4,14** (`interview-preparation`)
- **P0 : 0** · **P1 : 23** · **P2 : 14** · **P3 : 10**

### Moyenne par dimension (128 / 128)

| D1 | D2 | D3 | D4 | D5 | D6 | D7 |
|---|---|---|---|---|---|---|
| 4,88 | **4,31** | 4,97 | 4,99 | 4,98 | 4,84 | 4,98 |

| D8 | D9 | D10 | D11 | D12 | D13 | D14 |
|---|---|---|---|---|---|---|
| 4,82 | 4,98 | 4,78 | 4,88 | 4,84 | **4,29** | 4,92 |

### Prédiction du lot 12 : VÉRIFIÉE

Au lot 12 j'ai écrit qu'aucune des 32 leçons restantes ne devait porter de défaut de
prérequis, les 20 annoncées par `PREREQUIS-ORDRE.md` étant toutes notées. Contrôle après
lecture des 32 : **0 leçon à D2 = 1**, total corpus **20 à D2 = 1** et **8 à D2 = 4**,
exactement les listes annoncées. L'enquête prérequis est close et complète.

### État des seuils gelés du CP1, après CP3 et **avant toute correction**

| seuil | exigence | mesuré | état |
|---|---|---|---|
| **S1** | moyenne corpus ≥ 4,00 | **4,820** | franchi |
| **S2** | chaque dimension ≥ 3,70 | min **4,29** (D13) | franchi |
| **S3** | 0 leçon sous 3,00 | **0** | franchi |
| **S5** | 0 P0 | **0** | franchi |
| **S7** | 128 leçons réellement lues | **128** | franchi |
| **S8** | 128 notations D1→D14 | **128** | franchi |
| **S9** | écart de l'audit aveugle ≤ 0,40 | — | **CP13** |
| **S10** | ≤ 4 écarts individuels > 1,00 | — | **CP13** |

**Il faut dire ce que ce tableau signifie, et ne pas s'en réjouir.** Six seuils sur huit sont
franchis **sans qu'une seule correction ait été appliquée**. Deux lectures sont possibles et
une seule sera tranchée au CP13 :

1. le corpus est réellement bon — ce que 128 lectures et une soixantaine de vérifications
   numériques indépendantes soutiennent ;
2. **ma grille n'est pas assez exigeante**, et les seuils du CP1 ont été fixés trop bas.

Le contrat interdit de déplacer un seuil après avoir vu le résultat (§7), donc la seconde
hypothèse ne peut pas être traitée en durcissant le barème maintenant. Elle sera traitée par
le seul dispositif prévu pour cela : **l'audit aveugle du CP13** (32 leçons, graine 20260831),
dont S9 et S10 sont désormais **les deux seuls seuils encore capables d'échouer**. Le CP13
devient donc le point décisif du sprint, et il doit être conduit sans complaisance.

Les 23 P1, 14 P2 et 10 P3 restent à corriger aux CP4→CP9 **indépendamment** du fait que les
seuils soient franchis : ce sont des défauts établis par mesure, pas des ajustements de note.

### Les vingt leçons à D2 = 1 sont toutes notées

La prédiction de `PREREQUIS-ORDRE.md` est close : les **20** leçons annoncées à D2 = 1 ont
toutes été lues et notées, et les 8 annoncées à D2 = 4 aussi. **Aucune leçon des 32 restantes
ne devrait donc porter un défaut de prérequis** — c'est une prédiction vérifiable au lot 16.

Ces 20 leçons occupent **neuf des dix dernières places du corpus** :

| | leçon | moyenne |
|---|---|---|
| 1 | `interview-preparation` (deux prérequis postérieurs) | **4,14** |
| 2 | `llm-cost-optimization` (D2 = 1 **et** D1 = 3) | **4,29** |
| 3 | `prompt-engineering` | 4,43 |
| 4–7 | `express-backend`, `rag-evaluation`, `prompt-injection-defense`, `agent-workflows-orchestration` | 4,50 |
| 8 | `javascript-basics` (seul du bas de tableau **sans** défaut de prérequis) | 4,57 |

**Le défaut d'ordre des prérequis est, de loin, la première cause de perte de points de V71.**
Il ne coûte rien à réparer — trois remèdes de texte, aucune modification du parcours — et sa
correction aux CP4→CP9 devrait à elle seule faire remonter D2 de 4,08 à environ 4,9.

**Dix-sept leçons à 5,00 sur 104.** La concentration reste à surveiller : l'audit aveugle du CP13
(32 leçons, graine 20260831) est le contrôle prévu sur ma propre sévérité.

**Six leçons à 5,00 sur les quatorze dimensions** : `portfolio-github`,
`html-semantic-structure`, `react-accessibility`, `react-composition-architecture`,
`frontend-testing`, `database-transactions-concurrency`. Quatre d'entre elles sont dans le
seul lot 8, ce qui est anormalement concentré — **à revérifier au CP13** (audit aveugle) et
au CP15. Ce qu'elles ont en commun et qui justifie la note : preuve exécutée ou mesurée,
erreur plausible nommée **avec la raison qui la rend séduisante**, limite de leur propre
approche déclarée, section de vérification distincte, et pratique à critère falsifiable.

Les deux points bas sont **D2** (prérequis, qui va encore descendre : 16 des 20 leçons à
D2 = 1 ne sont pas encore notées) et **D13** (vérification de compréhension — présente
partout, mais souvent fondue dans la pratique plutôt qu'en contrôle distinct).

### Lot 6 — ce que la lecture a trouvé

Trois défauts nouveaux, tous établis par mesure et non par sonde :

- **`observability-logging` (P1, D1 = 2)** — la correction de la pratique C annonce un
  centile 95 de 3 000 ms pour un jeu à 95 % / 5 %. Mesuré : p95 = 50 ms, p99 = 3 000 ms.
  Aggravant : l'énoncé demande un jeu où le p95 est **mauvais**, et la correction en
  fournit un où il est bon — elle échoue à l'exercice qu'elle corrige. Fix CP8.
- **`technical-debt` (P1, D1 = 2)** — l'exemple guidé publie « ~10 j » de coût annuel pour
  la dette C là où sa propre formule donne **10,67 heures**. Les trois autres lignes sont
  en heures et exactes. Conséquence : C s'amortit en 2,25 ans, pas 0,30, donc elle passe
  derrière A et l'observation « C est celle qu'on sous-estime » ne découle plus du tableau.
  Fix CP9.
- **`python-foundations` (P2)** — `except TypeErreur:` dans la table de traduction :
  `TypeErreur` n'est pas un nom Python (`NameError` vérifié). Fix CP4.

Et un modèle opposable : **`slo-error-budget`** intègre en quatre phrases la notion de
disponibilité dont elle a besoin au lieu de l'exiger. C'est le remède à appliquer aux 20
défauts de prérequis. **`portfolio-github`** est la première leçon du corpus à 5 sur les
quatorze dimensions.

### Correction D2 appliquée à la reprise

L'enquête prérequis (voir `PREREQUIS-ORDRE.md`) prouve que **20 leçons** exigent un prérequis
enseigné plus tard sans le signaler, et que **8 autres** citent un concept postérieur en le
signalant comme aide. L'ancre D2 gelée au CP1 est sans ambiguïté : niveau **1** si « un
prérequis renvoie vers une leçon située après », niveau **4** si le concept non enseigné est
« explicitement signalé comme périphérique ».

Le barème n'a pas été modifié — il a été **appliqué**. Douze des 40 leçons déjà notées étaient
concernées, toutes à D2 = 5. Les deux chiffres sont publiés :

| | avant | après |
|---|---|---|
| moyenne D2 (40 notées) | 5,000 | **4,250** |
| moyenne corpus (40 notées) | 4,802 | **4,748** |

Détail : `design-patterns-intro`, `express-backend`, `interview-preparation`,
`readme-documentation`, `technical-documentation`, `technical-storytelling` passent de 5 à
**1** (P1) ; `api-design-basics`, `api-production-contracts`, `architecture-basics`,
`async-javascript`, `authentication`, `breaking-changes-compatibility` passent de 5 à **4**
(P3, plafond structurel, comportement correct).

Les 16 leçons restantes de la liste seront notées à leur lot. Conséquence attendue : **S2
(≥ 3,70 sur chaque dimension) sera le seuil le plus difficile de V71**, et il ne sera
franchissable qu'après les corrections P1 des CP4→CP9.

---

## Empreintes (snapshot CP0, inchangées)

- HEAD au démarrage V71 : `c8259501dcbf92c9601b9605bb49d5b5762f2bf4`
- corpus des 128 leçons : `edbfecdff1d3e4c320cedd51ede95601fd94750d`
- `data/program.json` : `5ac3da304994c298ab964a4b03e13da336bb8935`
- snapshot par leçon : `docs/v71/SNAPSHOT-CP0.json`
- échantillon aveugle : `docs/v71/ECHANTILLON-AVEUGLE.json` — **graine 20260831**

---

## Lots

| CP | objet | état |
|---|---|---|
| CP0 | audit forensique + snapshot + rapport | **terminé** |
| CP1 | contrat académique gelé, ancres D1→D14, seuils READY | **terminé** |
| CP2 | standard humain + archétypes + règles anti-template | **terminé** |
| CP3 | lecture et notation des 128 + ledger initial | **terminé — 128/128** |
| CP4 | P0+P1 fondations / systèmes / cloud / Kubernetes | **terminé** |
| CP5 | P0+P1 frontend / CSS / React / Next.js | **terminé** |
| CP6 | P0+P1 web / backend / API / SQL / data | **terminé** |
| CP7 | P0+P1 ML / IA appliquée / LLM / RAG / agents | **terminé** |
| CP8 | P0+P1 architecture / perf / sécurité / observabilité / incidents | **terminé** |
| CP9 | P1 carrière **terminés au CP8** → CP9 traite les 14 P2 | **terminé** |
| CP10 | passe transversale PRATIQUE (128) R/E/D/P/T + les 10 P3 | à faire |
| CP11 | passe corrections + vulgarisation + jargon + prérequis | à faire |
| CP12 | validation factuelle et assertions exécutables | à faire |
| CP13 | audit aveugle (32 leçons, graine 20260831) | à faire |
| CP14 | tests négatifs + gauntlet + budget temps | à faire |
| CP15 | notation finale 128×14 + rapport + recommandation V72 | à faire |

## Commits V71

- CP0 : `1fb8ea6`
- CP1 : `5472c2c`
- CP2 : `b3e4592`
- CP3 lot 1 : `b3c9489` · lot 2 : `2440c0b` · lot 3 : `237ded7` · lot 4 : `6d79aa0` ·
  lot 5 : `aebbdaa`
- reprise après perte de conteneur + enquête prérequis : `44747e5`
- CP3 lot 6 : `cde0206` · lot 7 : `d5ebfcc` · lot 8 : `6354c84` · lot 9 : `6d93243` · lot 10 : `a53cdf7` · lot 11 : `43fd152` · lot 12 : `c8553b8` · lot 13 : `86a6886` · lot 14 : `4a83fcc` · lot 15 : `f40a5fe` · lot 16 : `a6a4270` — **CP3 terminé**
- CP4 : `c9045cf` · CP5 : `e9635e2` · CP6 : `3fd6f8b` · CP7 : `4fd6fa2` · CP8 : `8701d27` · CP9 : ce commit

### Lot 7 — frontend (8 leçons)

Le lot le plus fort du corpus jusqu'ici sur D1/D4/D6/D7, et le plus faible sur D2 : **trois
des huit** portent un défaut de prérequis de classe B ou C (`react-application-states` +9 j,
`web-forms-validation` +7 j, `frontend-performance` +2 j), tous vers
`react-composition-architecture` ou `html-semantic-structure`. Corrections au CP5.

`html-semantic-structure` est la **deuxième leçon du corpus à 5 sur les quatorze dimensions**
(après `portfolio-github`). Deux défauts nouveaux, mineurs :

- **`browser-dom-rendering` (P2)** — la matrice de synchronisation totalise **20** croix
  (comptées dans le fichier) et la leçon publie `N = 21`, répété en toutes lettres. N'inverse
  aucune conclusion, mais l'apprenant doit produire ce nombre lui-même et comparer. Fix CP5.
- **`typescript-frontend` (P2)** — l'argument sur `as` est produit **trois fois**, deux fois en
  termes quasi identiques, et la section « Correction attendue » ne corrige aucun énoncé (la
  pratique a déjà son corrigé juste au-dessus) : elle réexplique le cours. Fix CP5.

Les huit archétypes du lot sont **tous distincts** — fondation conceptuelle, debugging,
construction, architecture, sécurité, comparaison, optimisation, revue de code — ce qui
satisfait la règle anti-clonage du CP2 sur huit leçons consécutives d'un même domaine.

### Lot 8 — fin du frontend, début des données

**Premier P1 de pratique de V71.** `sql-performance-indexing` enseigne `EXPLAIN`, en fait son
premier geste (« ne devine JAMAIS pourquoi une requête est lente : demande son plan ») et **ne
le fait jamais exécuter**. Son unique exercice — 57 mots — renvoie à un exercice externe qui
corrige un N+1 par une `Map` en mémoire : ni index, ni plan, ni base. Ancre D8 niveau 2,
« l'exercice ne travaille pas la compétence annoncée ». Fix CP6.

**Une incohérence entre leçons**, trouvable seulement par lecture suivie :
`react-composition-architecture` (jour 104) donne comme corrigé modèle un inventaire où
`chargement` et `erreur` sont deux états séparés — la forme exacte que
`react-application-states` (jour 95) démontre être « fausse, pas maladroite : fausse ».
Involontaire (le sujet de la seconde est état/dérivé, pas la forme de l'état). P2, aucune
dimension déduite, remède d'une demi-phrase. Fix CP11.

**Asymétrie éditoriale entre domaines, à reporter au CP15.** Les pratiques du lot frontend
font 400 à 550 mots, en parties lettrées, avec un bloc « Critère de réussite » explicite.
Celles du lot données font 20 à 60 mots sans critère énoncé. Le contenu explicatif est de
niveau équivalent — c'est l'énoncé de pratique qui diffère, et c'est ce qui tire D8, D12 et
D13 vers le bas sur `pandas-data-wrangling`, `data-cleaning-quality` et `etl-pipelines`.
Ce n'est pas un défaut par leçon mais un choix éditorial non uniforme.

### Lot 9 — migrations, statistiques, ML

Le lot le plus **vérifiable** du sprint, et tout a été revérifié avant notation : les douze
chiffres du dépistage de `model-evaluation`, le paradoxe de Simpson de `statistics-for-ml`
(un vrai paradoxe, A gagne les deux sous-groupes et perd au total), le calcul métier de
`scikit-learn-workflow` (16 fraudes × 200 € contre 247 alertes × 5 min ≈ 20 h) obtenu en
**réexécutant** `scripts/v70-verifications/ml-pieges-mesures.py`, et les lignes de la matrice
d'attention de `transformers` qui somment bien à 1.

**Un chiffre non sourcé, reproduit plutôt que cru.** `machine-learning-basics` publie
« Résultats mesurés : 0,870 / 0,590 » sans citer de script — seule leçon mesurée du corpus
dans ce cas. Les figures ont donc été reproduites sur quatre graines
(`scripts/v71/ml-fuite-selection.py`) : **A 0,835 · B 0,515 en moyenne**, la fuite de
sélection vaut **+0,32** et la fuite de normalisation **+0,00**. L'effet est réel, massif et
robuste ; les quatre valeurs publiées tombent dans l'intervalle observé. P3 de traçabilité
seulement, aucune dimension déduite — l'ancre D1 dit « sourcés **ou** mesurés ».

**Deuxième glose cassée**, même signature que `database-migrations` : `feature-engineering`
écrit « c'est du **surapprentissage** — le modèle mémorise au lieu de généraliser — servi sur
un plateau », où la glose a été insérée entre le terme et son complément. Deux instances
connues, toutes deux dans une glose définissant un terme technique. Une sonde ciblée a été
tentée et **ne généralise pas** (les parenthèses par tirets cadratins légitimes noient le
signal) : vérification systématique reportée au CP11.

**D13 est le point bas structurel du domaine ML** : six des huit leçons du lot n'ont pas de
section de vérification de compréhension distincte, contre la quasi-totalité du lot frontend
qui en a une.

### Lot 10 — LLM et RAG

**La leçon la plus faible du corpus à ce stade : `llm-cost-optimization`, 4,29.** Ses douze
cellules de coût sont exactes et son facteur global de 196 aussi, mais la section « Les trois
leviers, par ordre d'efficacité » énonce en **ratios de jetons** ce qu'elle présente comme des
ratios de **facture** :

| affirmation | mesuré |
|---|---|
| « divise la facture par environ 60, sur n'importe quelle ligne » | 53,6 · 48,3 · 44,6 · 48,3 |
| « divise la facture par cinq environ » | 2,9 (A) · 3,1 (B) · 2,4 (C) |
| « coûte trois fois moins cher » | 2,0 |

Le 60 est le rapport des prix d'**entrée** ; le 5,5 est le rapport des **jetons** d'entrée. Le
classement des leviers reste juste (48 > 2,9 > 1,4), donc D1 = 3 et non 2. Aggravant : le
levier 3 est calculé **correctement** sur la facture par la même leçon (1,4 ×, et « 12 % des
jetons pour 41 % du coût » vérifié exactement) — elle sait faire et ne l'a pas fait deux fois
sur trois. Fix CP7.

**Trois P1 de prérequis dans un seul lot** : `prompt-engineering` → `ai-evaluation` (+56 j,
deuxième plus grand écart du corpus), `rag-evaluation` → `ai-evaluation` (+35 j),
`llm-cost-optimization` → `rag-fundamentals` (+21 j). Le domaine IA appliquée concentre les
défauts d'ordre.

**Un comptage faux** dans `prompt-engineering` : le tableau des neuf sorties montre **quatre**
lignes qui passent `JSON.parse` en violant le schéma, le texte en annonce **cinq**. Même
classe que le `N = 21` de `browser-dom-rendering`. P2.

Tout le reste du lot a été **recalculé et confirmé exact** : les trois lignes de coût de
`llm-fundamentals` (36 675 / 2 025 / 2 925 €), les sept lignes de `chunking-strategies`, et
les **dix valeurs** du tableau de cosinus aléatoires d'`embeddings`, vérifiées par simulation
de Monte-Carlo sur 200 000 paires par dimension.

### Lot 11 — recherche, sécurité IA, agents, files

**Quatre P1 de prérequis sur huit leçons**, dont le **plus grand écart du corpus** :
`agent-workflows-orchestration` (jour 274) exige `resilience-patterns` (jour 331), **+57 j**.
Puis `async-messaging-queues` → `resilience-patterns` (+41 j), `ai-security` et
`prompt-injection-defense` → `agents-fundamentals` (+14 j chacune). Le domaine IA appliquée
concentre à lui seul près de la moitié des 20 défauts d'ordre du corpus.

**Un chiffre non reproductible**, et c'est celui qui porte l'argument. Dans `ai-evaluation`,
la colonne « Note globale » donne A 0,78 · B 0,78 · C **0,77**. Recalculé : en moyenne simple,
A et B tombent juste, mais **C vaut 0,63**. Le 0,77 exige une pondération d'environ
0,40 / 0,40 / 0,19 que la leçon n'énonce nulle part — et c'est précisément d'elle que dépend
l'argument « le troisième est le plus dangereux, alors que sa note est la plus basse de très
peu ». Sous la lecture naturelle, la note globale **attrape** le défaut et l'argument
s'inverse. P2, fix CP7.

**Deux sections de vérification en double**, trouvées par `scripts/v71/titres-doubles.mjs` —
une sonde fiable dont la lecture retourne néanmoins le chiffre : **28 détections, 26
légitimes** (« Correction attendue » ×2 est la forme normale d'une leçon à deux exercices),
et seulement 2 défauts réels (`async-messaging-queues`, `system-design-scaling`), où une
restructuration a ajouté la section au bon endroit sans retirer l'ancienne annexe.

Le reste du lot a été **recalculé et confirmé exact** : les douze métriques de
`retrieval-reranking` (dont les deux nDCG@5, qui exigent la bonne formule d'escompte
logarithmique), les quatorze cellules d'empreinte de `vector-databases`, et les quatre taux
de fiabilité d'`agents-fundamentals` (0,95ⁿ pour n = 5, 10, 20, 40).

### Lot 12 — systèmes distribués, CI/CD, Docker

**Le lot le plus solide du sprint** : quatre leçons à 5,00 et un seul P1, sur le prérequis de
`ci-cd-pipeline-anatomy` (→ `docker-images-layers`, +13 j). C'est le domaine que V70 a le plus
retravaillé, et cela se lit.

`docker-build-dockerfile` mérite d'être signalée à part : c'est la leçon qui traite le mieux
du corpus une **contrainte d'environnement**. Elle interrompt son propre exposé pour déclarer
que le démon Docker n'était pas disponible à la rédaction, que les tailles citées sont des
ordres de grandeur et non des mesures, et que le geste — pas le chiffre — est ce qu'il faut
retenir. J'ai vérifié indépendamment que le démon Docker n'est effectivement pas disponible
ici : la déclaration est exacte, pas une précaution de style. C'est exactement ce que le
contrat demande, et cela vaut D1 = 5.

Mesure faite **sur ce dépôt même** dans `ci-cd-pipeline-anatomy` : les 155 fichiers de tests
chronométrés, 129,2 s cumulées, cinq fichiers pesant 47,9 % du total (recalculé exact), et un
plafond de parallélisation à ×6,75 qui vaut exactement la durée du fichier le plus long —
la démonstration la plus économique possible qu'on ne parallélise pas un chemin critique.

Le second exemplaire du défaut de section dupliquée est confirmé dans `system-design-scaling`,
avec une **nuance qui change la correction** : contrairement à `async-messaging-queues`, ses
questions d'annexe ne sont pas toutes couvertes par la section principale — celle sur les
points de défaillance unique doit être reprise avant suppression, pas jetée.

### Lot 13 — Docker production, observabilité LLM, résilience, incidents

**Aucun défaut nouveau, et cinq leçons à 5,00.** C'est le second lot consécutif sans P1 de
contenu, et il prolonge le constat du lot 12 : les domaines que V70 a le plus retravaillés
sont ceux qui tiennent le mieux à la lecture.

Trois passages méritent d'être retenus comme modèles opposables pour les CP4→CP9 :

- **`incident-response`** est le **troisième** modèle de traitement d'un prérequis, après
  `slo-error-budget` et `database-migrations` : elle intègre en trois phrases le retour
  arrière, l'aller de l'avant et le correctif à chaud, puis signale `release-incident-recovery`
  comme étagère de référence. Cela **confirme par lecture** le §5 de `PREREQUIS-ORDRE.md`.
- **`ci-cd-quality-gates-artifacts`** contient la démonstration la plus efficace du corpus
  contre une pratique répandue : deux suites de tests sur le **même** code, la suite qui
  appelle tout sans rien affirmer obtient **100 %** de couverture et passe la porte, celle qui
  contient une seule assertion vraie obtient **88,89 %**, échoue à la porte — et c'est la seule
  des deux qui attrape le défaut.
- **`postmortem-rca`** attaque une méthode enseignée partout en démontrant que les cinq
  pourquoi produisent une réponse **différente selon qui pose les questions**, avec trois
  chaînes valides menant à trois actions non redondantes.

**`cloud-aws-core`**, première leçon hors parcours du sprint, traite correctement la contrainte
§31 du brief : ses repères sont explicitement titrés « illustratifs, **non exécutés** ».

### Auto-contrôle : mes 5,00 suivent-elles la structure plutôt que la pédagogie ?

Question posée parce que 17 leçons à 5,00 sur 104 est beaucoup. Test : les leçons à 5,00
ont-elles simplement plus souvent une section « Vérification de compréhension » **et** une
« Pratique » ?

| | n | avec les deux sections |
|---|---:|---:|
| leçons à 5,00 | 12 | 9 (**75 %**) |
| leçons < 5,00 | 84 | 22 (**26 %**) |

La corrélation existe, et elle est **attendue** : D13 note précisément la présence d'un
contrôle de compréhension distinct. Mais elle n'est ni suffisante ni nécessaire —
**22 leçons ont les deux sections sans atteindre 5,00** (elles perdent sur D2, D1 ou D14), et
**3 l'atteignent sans les avoir** (`portfolio-github`, `statistics-for-ml`,
`rag-fundamentals`). La note ne se réduit donc pas à un gabarit. L'audit aveugle du CP13
reste le contrôle prévu.

### Lot 14 — l'étagère de référence (cloud, CSS)

Premier lot entièrement **hors parcours** : 5 leçons cloud, 3 CSS. Aucune n'est programmée par
les 365 journées, donc aucune contrainte d'ordre ne s'y applique — le script de prérequis le
confirme, et les 8 sont à D2 = 5.

**Contrainte §31 correctement traitée.** Vérifié leçon par leçon : `cloud-aws-core` et
`cloud-azure-core` titrent leurs repères « illustratifs, **non exécutés** » ; `cloud-finops`
et les trois CSS citent un script exécuté ; `cloud-compute-storage`, `cloud-fundamentals` et
`cloud-networking` ne publient **aucune** mesure — elles traitent de CIDR, de ports et de
scénarios d'exercice. **Aucune leçon ne prétend valider un cloud réel depuis cet
environnement.**

**Un défaut**, et il est ironique. `cloud-finops`, dont le sujet est de lire une facture avec
attention, affirme que « l'arithmétique est exacte et reproductible » — et sa colonne de neuf
postes totalise **1 884 €** quand le tableau annonce **1 885 €**. J'ai exécuté le script cité :
il reproduit le même écart, parce qu'il totalise des valeurs non arrondies puis arrondit,
tandis que les lignes sont arrondies individuellement. Second point : le texte attribue
269 € au fait d'éteindre les environnements « 14 heures par jour », alors que ce calcul donne
272 € et que l'étiquette du script mentionne « la nuit **et le week-end** ». Aucune conclusion
n'est inversée et tous les pourcentages tiennent. P2, fix CP8.

**Un faux positif écarté par lecture** : le schéma réseau du mini-exercice de
`cloud-networking` contredit celui de son exemple guidé (`10.0.2.0/24` public au lieu de
privé). Vérification faite : le premier est **délibérément défectueux** — présenté comme
« livré par un prestataire », l'apprenant doit y trouver cinq défauts classés par gravité.

### Constat structurel : D13 et l'étagère de référence

| | n | avec une section « Vérification de compréhension » | D13 moyen |
|---|---:|---:|---:|
| leçons **hors parcours** | 9 | **0 (0 %)** | **4,00** |
| leçons **programmées** | 103 | 50 (49 %) | 4,36 |

Aucune des neuf leçons hors parcours lues n'a de contrôle de compréhension distinct. C'est le
premier facteur explicatif du point bas de D13, et c'est cohérent avec leur statut : ce sont
des leçons de consultation, pas de parcours. **À trancher au CP15** — soit on l'assume et on
le déclare, soit D13 doit devenir NA pour l'étagère de référence, ce qui ne peut pas se
décider maintenant sans modifier le barème gelé.

Contrôle que ma notation D13 n'est pas mécanique : parmi les 37 leçons à D13 = 5, **31** ont
la section (6 l'obtiennent sans) ; parmi les 75 à D13 = 4, **19** l'ont quand même.

### Lot 15 — Kubernetes, IaC, stratégies de déploiement

Huit leçons hors parcours, **aucun défaut**, toutes à 4,93 — le plafond mécanique de l'étagère
de référence, D13 = 4 faute de contrôle de compréhension distinct (voir le constat structurel
ci-dessus). Le contenu, lui, est de premier ordre.

**Vérification §31 close pour tout le corpus.** Les 16 dernières leçons ont été passées en
revue : `iac-fundamentals`, `k8s-troubleshooting` et `k8s-why-architecture` déclarent leurs
repères « non exécutés » ; `deployment-strategies`, `linux-services-systemd`,
`linux-ssh-remote`, `release-incident-recovery` et `responsive-design` citent un script
exécuté ; les sept restantes (quatre k8s, trois Next.js) ne publient **aucune** mesure — elles
traitent de manifestes YAML, de réglages (`initialDelaySeconds: 60` est une *consigne*, pas un
relevé) et de prémisses de scénario. **Aucune leçon du corpus ne prétend valider Kubernetes,
un cloud réel ou systemd depuis un environnement qui ne le permet pas.**

Trois passages à retenir pour le CP15 :

- **`k8s-workloads`** confirme le choix qu'en faisait déjà le document du CP2. Elle refuse
  d'emblée le tableau de correspondance « qui se retient en trente secondes et ne sert à rien
  parce qu'il suppose la question déjà résolue », et dit **trois fois non** à son propre
  catalogue d'objets : la correction n'est pas de changer de workload, ni même de déplacer
  l'état, mais de sortir le travail de l'application. Un cours qui refuse trois fois sa propre
  nomenclature enseigne à décider, pas à nommer.
- **`deployment-strategies`** produit le corollaire chiffré le plus utile du lot : 1 % du
  trafic pendant trois heures fait **21 600** requêtes en erreur, davantage que la bascule
  globale détectée en six minutes (**72 000** → mais sur six minutes seulement). Donc **un
  canari non observé est pire qu'une bascule globale observée**, et *investir dans la détection
  rapporte plus que raffiner le pourcentage*. Les quatre chiffres sont recalculés exacts.
- **`k8s-config-probes`** applique à Kubernetes le principe exact de `monitoring-production` —
  une sonde de vivacité ne doit dépendre d'aucune dépendance externe — et montre la
  configuration de surveillance **provoquant la panne qu'elle est censée détecter**. La
  cohérence entre domaines éloignés du corpus est réelle, pas déclarative.
