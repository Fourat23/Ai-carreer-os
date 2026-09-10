# V73 — CP13. Audit à l'aveugle, 36 unités

**Verdict de lecture : aucune régression. Les corrections des CP3 à CP12 n'ont dégradé aucune
des unités lues, et les témoins non touchés sont indiscernables des unités corrigées.**

**Et une chose que douze sondes n'avaient pas vue : 141 journées sur 365 — 39 % de l'année —
annoncent exactement la même liste de leçons que la veille, et la même durée de lecture. La
plus longue suite fait 35 jours.** Trouvée en lisant, pas en mesurant.

---

## 1. Le protocole, et sa preuve

| | |
|---|---|
| graine | **20260913**, écrite dans le code **avant** le tirage |
| unités | **36** (le brief en exige ≥ 32) |
| strates | **8**, décidées avant le tirage |
| tirage | **tourniquet** sur les strates |
| **gel** | l'échantillon a été **committé et poussé (`95cc41d`) AVANT la première lecture** |

**L'anomalie de tirage du CP0 a été évitée d'avance, pas rattrapée.** Le premier jet du CP0
parcourait les strates dans l'ordre alphabétique et ne tirait aucune leçon du milieu du
parcours. Le tourniquet est repris ici tel quel, et le tirage donne bien les huit strates.

### Les huit strates, et pourquoi celles-là

Un audit qui ne tirerait que des unités touchées ne pourrait pas dire si les corrections ont
dégradé quoi que ce soit — il faut des **témoins**.

| | strate | population | tirées |
|---|---|---|---|
| **A** | semaines **réécrites** au CP10 | 10 | 5 — s8, s10, s12, s13, s34 |
| **B** | semaines **réattachées** au CP10 | 6 | 5 — s29, s30, s31, s32, s33 |
| **C** | journées dont `readingMinutes` a changé au CP12 | 27 | 5 — j198, j208, j215, j216, j217 |
| **D** | journées dont la difficulté a été **redérivée à 4 ou 5** au CP9 | 127 | 5 — j139, j197, j223, j241, j257 |
| **E** | journées de projet **nouvellement déclarées** au CP11 | 54 | 4 — j114, j146, j303, j309 |
| **F** | leçons **rattachées au parcours** au CP3 | 15 | 4 — `css-flexbox`, `responsive-design`, `cloud-fundamentals`, `cloud-networking` |
| **G** | **TÉMOINS** : leçons qu'aucun CP n'a touchées | 125 | 4 — `react-fundamentals`, `linux-services-systemd`, `technical-debt`, `frontend-performance` |
| **H** | **TÉMOINS** : journées qu'aucun CP n'a touchées | 180 | 4 — j44, j61, j144, j355 |

---

## 2. Ce que la lecture donne, strate par strate

### A — les cinq semaines réécrites : elles décrivent leurs journées, et elles demandent du travail

Chacune des cinq a été relue en entier, thème, bilan, tests, mini-projet, critères, exercice
d'architecture, face à la liste de ses six journées. **Cinq sur cinq correspondent.**

Ce qui compte davantage que la correspondance : **ces épreuves demandent une démonstration, pas
une récitation.**

> **s8** — « (3) Ajoute-lui un middleware d'erreurs centralisé et des 400 détaillées, puis
> **CASSE-le exprès** (JSON invalide, id inexistant, champ manquant) et vérifie qu'aucune erreur
> ne fuit en 500. »
>
> **s13** — « Le test est réussi quand **tu coupes ton API en direct** et que l'interface reste
> compréhensible. »
>
> **s12** — « mets un cache sur la route la plus lue, mesure le gain, et surtout : **provoque
> une donnée périmée et montre-la**. »

Le test de s8 est en **trois temps explicitement numérotés** (curl, puis serveur, puis
robustesse), ce qui répond au constat du CP9 selon lequel 290 journées sur 313 énoncent leur
exercice en une seule phrase. **Aucune des cinq semaines réécrites ne fait cette faute.**

### B — les cinq semaines réattachées : le contenu d'origine est intact, sur la bonne semaine

Vérification faite pièce par pièce : le mini-projet « Petit banc d'essai : 10 questions dont tu
connais les réponses » est sur **s29**, dont la journée 6 s'intitule « Banc d'essai LLM ».
L'exercice d'architecture « dessine le composant *appel LLM robuste* » est sur **s31**, dont la
journée 4 s'intitule « Le composant *appel LLM robuste* ». **Rien n'a été réécrit, et rien n'a
été perdu.**

#### Un reste, trouvé en lisant et corrigé ici

**Le test pratique de s33 ouvrait sur les journées 5 et 6 de s32** — « extraction PDF et
Markdown, ré-ingestion » — tandis que trois de ses propres journées (diagnostic des échecs,
décisions de conception, dimensionnement de l'index) n'étaient évaluées nulle part.

La sonde lexicale du CP10 ne l'avait pas vu : elle compare une semaine aux **52** et déclare un
défaut quand une autre semaine colle mieux. Ici, s33 colle bien à s33 — mais **pas à la bonne
moitié de s33**. *Une mesure de classement ne voit pas un déséquilibre interne.*

Corrigé : le test de s33 porte désormais sur **ses** journées — classer dix échecs de retrieval
par cause, ajouter métadonnées et filtre en montrant une question qui échouait sans lui,
calculer le dimensionnement de l'index. Et **le multi-format et la ré-ingestion, qui n'étaient
plus évalués nulle part, sont entrés dans le test théorique de s32**, où ils sont enseignés.
**Aucune matière n'a été retirée du parcours.**

### C — les cinq journées dont la durée de lecture a changé : le nouveau chiffre est le bon

j198, j208, j215, j216 et j217 annoncent désormais **99 à 104 minutes** au lieu de 44 à 49.
Vérification manuelle sur j198 : la journée lie `llm-fundamentals` (3 446 mots),
`prompt-engineering` (1 472), `structured-outputs-tools` (3 107) et `llm-cost-optimization`
(3 182), plus son propre texte et sa correction. **Le compte est juste ; c'est l'ancien qui
était faux.**

### D — les cinq journées montées en difficulté : le niveau est défendable, et l'une est discutable

| journée | niveau | lecture |
|---|---|---|
| **j197** « Fonctionnement des LLM » | **5** | ouvre une compétence, 4 leçons neuves, énoncé d'une phrase — défendable |
| **j223** « RAG : robustesse et ré-ingestion » | **5** | 6 leçons, prérequis profonds, trois compétences — défendable |
| **j241** « Chunking : comparaison objective » | **5** | demande une comparaison outillée sur plusieurs stratégies — défendable |
| **j257** « Harnais d'évaluation automatisé » | **4** | construire un harnais reproductible — défendable |
| **j139** « ETL : robustesse et rejouabilité » | **4** | 2 leçons seulement, mais un ETL qui survit à une interruption — défendable |

**Aucune des cinq n'est absurde.** La plus discutable est **j197** au niveau 5 : c'est une
journée d'**ouverture** de compétence, et ouvrir n'est pas culminer. Le score la place là parce
qu'elle cumule nouveauté maximale, quatre leçons neuves et un énoncé d'une phrase — trois
facteurs sur sept au maximum. **C'est exactement le genre d'écart que les 55 % d'accord de la
calibration du CP9 laissent attendre, et c'est pourquoi les 78 journées témoins gardent leur
difficulté écrite à la main.**

### E — les quatre journées de projet nouvellement déclarées : rattachement exact

j114 → projet 3 (« Projet 3 — CRUD complet »), j146 → projet 4 (« Projet 4 — README, ADR,
démo »), j303 et j309 → projet 7 (« DocSense : architecture (ADRs) », « DocSense : ingestion
multi-format »). **Quatre sur quatre justes**, et leurs livrables sont concrets : « ARCHITECTURE.md
+ 4 ADRs », « Ingestion robuste (testée sur 5 PDF réels) ».

### F et G — les leçons corrigées et les leçons témoins sont indiscernables

| | mots | blocs de code | sections |
|---|---|---|---|
| **F** `css-flexbox` | 4 381 | 17 | 16 |
| **F** `responsive-design` | 3 362 | 7 | 15 |
| **F** `cloud-fundamentals` | 2 974 | 0 | 17 |
| **F** `cloud-networking` | 2 715 | 2 | 17 |
| **G** `react-fundamentals` | 3 220 | 10 | 18 |
| **G** `linux-services-systemd` | 3 154 | 6 | 18 |
| **G** `technical-debt` | 4 099 | 4 | 17 |
| **G** `frontend-performance` | 4 331 | 3 | 17 |

**Aucun écart structurel entre les leçons que V73 a touchées et celles qu'il n'a pas touchées.**

Le prérequis de `cloud-fundamentals`, réécrit au CP3, a été relu en entier. Il fait exactement
ce que le CP3 annonçait : il **donne la notion sur place** (« un conteneur est une application
empaquetée avec tout ce dont elle a besoin pour tourner »), puis renvoie au détail en le
déclarant postérieur (« **programmée plus loin** dans le parcours ; rien ici ne suppose que tu
l'as lue »), et referme sur « Aucune notion cloud n'est supposée ».

Le passage de cours ajouté au CP3 sur **j103** a lui aussi été relu. Il tient la promesse d'un
vrai passage d'enseignement, pas d'un remplissage :

> « **La disposition est une question d'accessibilité, pas de décoration.** […] **Flexbox**
> aligne sur **un** axe […] **Grid** dispose sur **deux** axes. […] **Le piège commun aux deux,
> et il fait perdre des heures.** Un enfant flex ou une piste `1fr` a une taille minimale égale
> à son contenu insécable […] La parade est `min-width: 0` côté Flexbox, `minmax(0, 1fr)` côté
> Grid. »

### H — les quatre journées témoins : rien n'a bougé

j44, j61, j144 et j355 : 12 à 15 sections, 1 427 à 1 839 mots. Conformes au reste du corpus.

---

## 3. Ce que la lecture a trouvé et qu'aucune sonde n'avait vu

### 3.1 — 39 % de l'année annonce la même liste de leçons que la veille

En lisant les cinq journées de la strate C, le même bloc revient à l'identique :
`llm-fundamentals`, `prompt-engineering`, `structured-outputs-tools`, `llm-cost-optimization`
— **sur j197, j198, j215, j216 et j217**. Mesuré ensuite :

| suite | longueur | leçons |
|---|---|---|
| **j218 → j252** | **35 jours** | les 6 leçons RAG |
| **j197 → j217** | **21 jours** | les 4 leçons LLM |
| j183 → j196 | 14 jours | `neural-networks`, `transformers` |
| j274 → j287 | 14 jours | les 3 leçons agents |
| j337 → j350 | 14 jours | les 4 leçons de communication |
| *(6 autres suites de 7 à 8 jours)* | | |

> ## **141 journées sur 365 — 39 % de l'année — appartiennent à une suite d'au moins six jours consécutifs liant EXACTEMENT le même jeu de leçons.**

**Le mécanisme est identifié et il est déclaratif** : `lessonsOf(day)` retombe sur
`LESSON_BY_SKILL[day.skill]` quand la journée n'a pas de liste propre. **Seules 35 journées sur
365 portent un rattachement explicite** ; toutes les autres reçoivent la liste entière de leur
compétence.

**Trois conséquences, dont une chiffrée par ce sprint même :**

1. le bloc « Leçons de fond à lire/relire » affiche la même chose **trente-cinq jours de
   suite** ;
2. `readingMinutes` compte ces leçons **en entier chaque jour** : les 161 minutes de j223 sont
   les mêmes que celles de j222 et de j224 ;
3. le modèle de charge du CP6 attribue **70 minutes de lecture de leçons par journée de
   travail en moyenne** — c'est le deuxième poste du parcours, et il est largement produit par
   cette répétition.

**Ce n'est pas un mensonge** : la section dit « à lire/**relire** ». Mais annoncer cent minutes
de lecture au trente-cinquième jour de la même liste ne décrit pas le travail réel.

**Le CP13 ne le corrige pas, et la raison est écrite.** Corriger demanderait d'écrire une liste
de leçons propre à chacune des 141 journées — c'est le travail que le CP3 a fait pour seize
journées, et le faire pour 141 serait la réécriture massive que le brief interdit. **Deux
tentations ont par ailleurs été écartées** : compter la relecture à demi-tarif dans le modèle
de charge ferait baisser 141 journées d'un coup **sans qu'une ligne du produit change**, et
tronquer la liste retirerait à l'apprenant des liens qui lui sont utiles. **Enregistré en
P1-CP13-1.**

### 3.2 — 44 leçons sur 128 mêlent le tutoiement et le vouvoiement

`cloud-fundamentals` écrit « **Vous devez** avoir une idée de ce qu'est une adresse réseau »
quatre lignes avant « rien ici ne suppose que **tu** l'as lue ».

| | |
|---|---|
| leçons mêlant les deux adresses | **44 / 128** |
| leçons entièrement en vouvoiement | **0** |
| les plus mêlées | `linux-ssh-remote` (21 « tu » / 23 « vous »), `k8s-why-architecture` (29/9), `cloud-fundamentals` (48/8) |

**Ce défaut est ANTÉRIEUR à V73** — vérifié dans le dépôt au commit `fe7a10c`, avant le CP0 —
et il se concentre sur les familles d'infrastructure (Linux, Docker, Kubernetes, cloud, réseau).
**Ce n'est donc pas une régression de ce sprint**, et il est publié comme tel plutôt que passé
sous silence parce qu'il ne nous incombe pas. **Enregistré en P2-CP13-1.**

---

## 4. Comparaison au CP0

Le CP0 avait lu 24 unités et conclu : **« L'hypothèse *les cours sont mauvais* est fausse. Les
8 leçons lues intégralement sont excellentes. »**

| | CP0 | **CP13** |
|---|---|---|
| unités | 24 | **36** |
| lues en entier | 8 | **12** (5 semaines, 3 leçons, 4 passages de cours) |
| **unités incomplètes ou fautives** | **0 / 24** | **0 / 36** |
| régressions attribuables aux corrections | *(sans objet)* | **0** |
| défauts trouvés par la lecture seule | 1 (anomalie de tirage) | **2** (§3.1 et §3.2) |

> ### La conclusion du CP0 tient, et elle est renforcée : **le corpus est bon, et les onze checkpoints qui l'ont modifié ne l'ont pas dégradé.**

**Ce que le CP13 ajoute au CP0**, et qui n'était pas visible sur 24 unités non stratifiées :
les deux défauts du §3 ne sont pas des défauts de **contenu** mais des défauts de
**présentation du travail** — quelle liste on affiche, à qui on s'adresse. Ils étaient
invisibles pour toutes les sondes du sprint parce qu'aucune ne demandait *« qu'est-ce que cette
page dit à l'apprenant, deux jours de suite ? »*.

---

## 5. Ce que le CP13 a modifié

| fichier | nature |
|---|---|
| `scripts/data/program-structure.mjs` | test pratique de **s33** recentré sur ses propres journées ; multi-format et ré-ingestion versés au test théorique de **s32**, où ils sont enseignés |
| `scripts/v73/cp13-echantillon.mjs` | **nouveau** — le tirage, rejouable, graine dans le code |
| `docs/v73/CP13-ECHANTILLON-36.json` | **nouveau** — l'échantillon, committé avant lecture |

**Aucune leçon touchée** — corpus `92d5fae6…` inchangé.

---

## 6. Ce que le CP13 laisse ouvert

| # | constat | pour |
|---|---|---|
| **P1-CP13-1** | **141 journées sur 365 (39 %) annoncent la même liste de leçons et la même durée de lecture que la veille**, jusqu'à 35 jours d'affilée. Mécanisme : le repli sur `LESSON_BY_SKILL`, seules 35 journées ayant un rattachement explicite. | verdict CP15 |
| **P2-CP13-1** | **44 leçons sur 128 mêlent tutoiement et vouvoiement** — défaut **antérieur à V73**, concentré sur les familles d'infrastructure. | verdict CP15 |

---

## 7. Vérifications

| contrôle | résultat |
|---|---|
| `npm test` | **1420 / 1420** |
| `npx tsc --noEmit` | **0** |
| `npm run gates:active` | **0 violation** |
| porte V73 du graphe | **verte** |
| **R1 → R7 (intégrité du CP12)** | **0 défaut** |
| **corpus des 128 leçons** | **`92d5fae6…` INCHANGÉ** |
| semaines en défaut de description | **0 / 52** |
| **L1 · L2 · L3** | **0 · 0/52 · 6/365** ✅ |
| **`data/progress.json`** | **toujours absent** |
