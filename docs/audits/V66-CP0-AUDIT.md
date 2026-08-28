# V66 · CP0 — Audit pédagogique forensique, avant toute modification

> **Rien n'a été modifié dans `curriculum/` ni dans `data/` pour produire ce
> rapport.** Tous les chiffres sont rejouables :
> `node scripts/v66-sample.mjs`, `node scripts/v66-pedagogy-metrics.mjs --all`,
> `node scripts/v66-load.mjs --all`.
>
> Grille et barème gelés **avant** ce rapport : `docs/V66-ACADEMIC-GRID-FROZEN.md`.

---

## 0. Position de départ

| | |
|---|---|
| Branche | `claude/ai-career-os-saas-phfg49` |
| HEAD | `7434974` (V65.1, verdict `REFERENCE_READY`) |
| local == origin | oui · 0 fichier modifié · 0 stash · 0 serveur résiduel |
| Tests | **1 381 passent** |
| `tsc` | 0 erreur · build compilé |
| `gates:active` | vert, 44 gates |
| Empreinte `curriculum/` | `a2099b51db9d75a6…` (951 fichiers) |
| Empreinte `data/` hors progression | `4d3e5e9cc82e030b…` |

Corpus : **128 leçons · 365 journées · 365 corrigés · 376 exercices ·
16 diagnostics · 42 missions · 13 capstones · 45 playbooks ·
25 défis de transfert · 711 entrées de glossaire.**
Les 365 journées annoncent **toutes 4,5 h** — 1 642,5 h au total.

---

## 1. La question posée, et ce que j'ai trouvé

> « Est-ce que les cours actuels enseignent réellement à un apprenant humain
> débutant/intermédiaire, ou sont-ils principalement des fiches techniques
> condensées pleines de mots-clés ? »

**Réponse courte du CP0 : ni l'un ni l'autre, parce que le corpus n'est pas
homogène.** Il contient trois modèles éditoriaux mesurablement différents, et
l'hypothèse est vraie pour le plus répandu, fausse pour les deux autres.

C'est le résultat le plus important de ce checkpoint, et il n'était pas
l'hypothèse de départ — ni la vôtre, ni la mienne.

---

## 2. Quatre faux positifs écartés avant d'écrire quoi que ce soit

Le brief interdit de transformer une métrique jusqu'à obtenir le résultat
voulu. Voici les quatre mesures qui **auraient produit un titre de rapport
faux**, et pourquoi elles ont été refusées.

**FP-1 — « 100 % des journées contiennent un acronyme jamais développé ».**
Règle initiale : `\b[A-Z]{2,6}\b`. Vérification par lecture directe du jour 50,
qui rendait 15 « acronymes » : `EST SANS TOUT OUBLIE PASSER FERME` (des mots
français que le corpus met en capitales pour insister) et
`TAT REQU TE PONSE CHELLE SUCC SUME CR` (des **fragments de mots accentués** :
`\b` casse sur É/È/Ê, donc ÉTAT → TAT, REQUÊTE → REQU + TE). Un seul était réel :
`MDN`. Après correction (bornes conscientes des accents + test « ces lettres
apparaissent-elles en minuscules ailleurs dans le corpus comme un mot ? »), le
chiffre honnête est **53 %**, avec 1 à 2 acronymes par journée.
*Le même artefact a resurgi plus tard* : `\bPR\b` en mode insensible à la casse
« trouve » `PR` dans « **Pr**érequis » et « **pr**écédente ». Toute mesure de ce
corpus qui utilise `\b` sur du français est suspecte par construction.

**FP-2 — « densité de jargon : 1 terme pour 100 mots ».** Chiffre invraisemblable
obtenu en cherchant camelCase et kebab-case, alors que l'essentiel du jargon du
corpus est en minuscules ordinaires (« embedding », « reranker », « conteneur »).
Remplacé par une lecture du vocabulaire **que le corpus marque lui-même**
(back-ticks, gras, section Vocabulaire) : médiane **1,9 / 100 mots**, max 4,6.

**FP-3 — « 5 % des erreurs sont expliquées causalement ».** Titre dévastateur et
faux, produit par une regex cherchant `parce que|car|pourquoi|conséquence`.
Lecture directe des jours 232, 303 et 165 : la causalité est **partout**,
exprimée par le deux-points et la juxtaposition — « sans taxonomie, l'évaluation
mélangera des choses incomparables et le score global ne voudra rien dire ».
Conformément à la règle 4, la regex n'a **pas** été ajustée : elle a été
remplacée par une mesure structurelle (l'approche fautive est-elle *montrée* ou
seulement *nommée* ?), et la qualité causale est redescendue au rang de constat
qualitatif.

**FP-4 — « 12 leçons n'ont pas de noyau explicatif ».** Elles ont une section
« Explication **progressive** » au lieu d'« Explication **complète** ». Ce sont,
après lecture, les **meilleures leçons du corpus**. La mesure disait exactement
le contraire de la vérité. Corrigée : **0 leçon sans noyau explicatif.**

---

## 3. Anatomie réelle du corpus — trois familles éditoriales

Mesure sur les 128 leçons (`scripts/v66-pedagogy-metrics.mjs`) :

| Famille | n | Mots/leçon | Noyau explicatif | % de la leçon | Sous-sections | « Décomposition » | « Que faire dans ce cas » |
|---|---:|---:|---:|---:|---:|---:|---:|
| **A — condensée** | **71** | 1 058 | **239** | **23 %** | 0 | 0 | 4 |
| **B — progressive** | 12 | 1 255 | 335 | 27 % | 0 (mais 4 paragraphes guidés) | **12/12** | **8/12** |
| **C — sous-sections** | 45 | 1 198 | **396** | **33 %** | **5** | 0 | 1 |

Autrement dit : **55 % des leçons ont un noyau explicatif de ~240 mots, sans
aucune structure interne** — ni sous-titre, ni paragraphe introduit par son
sujet, ni décomposition. Le reste de la leçon (≈ 820 mots) est du cadrage :
problème, objectif, prérequis, modèle mental, vocabulaire, checklist, liens,
questions d'entretien.

**C'est le cœur du diagnostic.** Le corpus n'est pas pauvre en pédagogie : il
est pauvre **à l'endroit précis où l'explication doit avoir lieu**, et riche
partout autour.

### 3.1 Uniformité structurelle

- 47 signatures de plan distinctes pour 128 leçons ; **une seule couvre
  42 leçons**, les trois premières en couvrent 80.
- Longueur des leçons : **min 867 · médiane 1 122 · max 1 524 mots.**
  Aucune leçon du corpus ne dépasse 1 524 mots — que le sujet soit
  « les trois zones de Git » ou « les modes de défaillance des systèmes
  distribués ».

Un gabarit de longueur fixe appliqué à des sujets de difficulté très inégale est
un choix éditorial, pas un accident. Il explique mécaniquement le symptôme que
vous décrivez : sur les sujets denses, le gabarit force à **nommer** au lieu
d'expliquer.

---

## 4. Ce qui va objectivement bien (et qui contredit l'hypothèse)

Ces chiffres sont mesurés sur l'échantillon gelé de 43 journées :

| Constat | Valeur |
|---|---|
| Exemple guidé **complet** (énoncé + raisonnement + solution) | **74 %** — et **91 %** hors revues hebdomadaires (99 % sur le corpus entier hors revues) |
| Rappel actif à **réponse cachée** dans la journée | **91 %** |
| Journées sans rien à produire | **0** — les 118 journées sans exercice formel ont toutes un livrable annoncé |
| Densité de jargon | médiane **1,9** terme marqué / 100 mots |
| Glossaire | **711 entrées**, avec `shortDefinition`, `detailedDefinition`, `plainTranslation`, `possibleConfusions` |
| Analogie assortie de sa **limite explicite** | présente dans toutes les leçons lues au §6 |

Sur ce dernier point, le corpus fait mieux que la plupart des cours en ligne :
« Limite de l'analogie : un logiciel n'a pas de capot physique — les traces sont
des données qu'il faut avoir DÉCIDÉ d'émettre AVANT la panne »
(`observability-fundamentals.md`).

**Le corpus n'est donc pas un empilement de mots-clés.** Il faut le dire aussi
nettement que le reste.

---

## 5. Charge réelle (§I) — les 4 h 30 annoncées

Modèle de conversion publié **avant** la mesure (`scripts/v66-load.mjs`, en-tête)
et non réajusté : 150 mots/min de prose technique, 20 lignes/min de code,
1,5 min par question de rappel, 4 min par question de réflexion ouverte. Ces
taux sont **généreux côté lecture** : ils produisent une borne inférieure.

Sur les 365 journées :

| Poste | Médiane |
|---|---:|
| Lecture (cours, leçons, modèle mental, vocabulaire, à retenir) | **18 min** |
| Réflexion / questions d'entretien | 27 min |
| Rappel actif (quiz, mini-exercice, checklist) | 10 min |
| Correction fournie (corrigé + erreurs fréquentes) | 5 min |
| Exemple guidé | **3 min** |
| Énoncé de pratique autonome | **1 min** |
| **Total de contenu FOURNI** | **67 min** |
| **Part des 4 h 30 annoncées** | **25 %** |

Et le point décisif :

> **98 journées sur 365** donnent un budget de temps propre à leurs activités.
> Sur les 267 autres, les seules durées présentes sont **deux lignes de gabarit
> identiques sur toute l'année** : « tenté seul (sans IA) au moins 30 minutes »
> et « expliquer chaque décision à l'oral, en 2 minutes ».

**Conclusion du §I, sans exagération.** Votre intuition — « le contenu théorique
semble incompatible avec 4,5 h de véritable apprentissage » — est **exacte sur
les faits, et pour une raison plus précise que la longueur**. Le produit fournit
environ une heure de matière et annonce quatre heures et demie ; les trois
heures et demie restantes correspondent à un travail de production que le
produit **demande sans jamais le décrire, le découper, le chiffrer, ni dire
quand il est fini**. Ce n'est pas « les cours sont trop courts » : c'est
« le produit ne dit pas ce que l'apprenant est censé faire pendant 75 % du temps
qu'il annonce ».

C'est réparable sans écrire une ligne de cours supplémentaire.

---

## 6. Walkthrough néophyte (§4) — 10 leçons, LEARNING GAPS localisés

Protocole P1 de la grille gelée. Un gap est **bloquant** quand la notion
manquante est nécessaire pour faire l'exercice de la leçon ou cocher sa
checklist.

### 6.1 Graphe des gaps

| Leçon | Famille | Notion requise | Requise où | Définie où | Bloquant |
|---|---|---|---|---|:--:|
| `embeddings` | A | **produit scalaire** | Mini-exercice : « implémente `cosinus` à la main (produit scalaire / produits des normes) » | nulle part — absent des 711 entrées de glossaire ; listé en Vocabulaire **et** supposé acquis en Prérequis, dans la même leçon | **oui** |
| `embeddings` | A | **norme d'un vecteur** | même phrase | nulle part | **oui** |
| `embeddings` | A | **rappel@k** | Exercice difficile **et** checklist « je sais mesurer la qualité d'un retrieval (rappel@k) » | glossaire `ai-recall-at-k` — **non lié depuis la leçon** | **oui** |
| `embeddings` | A | reranking | « d'où le reranking », 2× | leçon `retrieval-reranking` — **non liée**, ni au point d'usage ni en bas de page | non |
| `embeddings` | A | chunk | Exemple appliqué | leçon `chunking-strategies` — non liée | non |
| `embeddings` | A | espace latent | Vocabulaire | **jamais dans le corps** (orphelin) | non |
| `chunking-strategies` | A | **rappel@k** | Explication, exercice difficile, correction, checklist (4×) | glossaire, non lié | **oui** |
| `chunking-strategies` | A | **golden set** | Explication + exemple appliqué | glossaire `ai-golden-set`, non lié | **oui** |
| `ci-cd` | A | **lint** | 6 occurrences, dont la checklist | **nulle part dans le corpus** — absent du glossaire | **oui** |
| `ci-cd` | A | **pull request** | Prérequis : « le workflow Git de collaboration par branches et pull requests (`git-fundamentals`) » | **`git-fundamentals` ne contient pas l'expression** (vérifié : 0 occurrence) | **oui** |
| `ci-cd` | A | éval smoke · mock/replay · fidélité | 4 termes dans une même phrase | `ai-evaluation`, liée en bas de page seulement | non |
| `docker-containers` | A | **`npm ci`** | utilisé dans le code **et** cité dans les erreurs fréquentes | jamais expliqué dans la leçon | **oui** |
| `docker-containers` | A | **couche (layer)** | anti-pattern « mal ordonner les couches » | Vocabulaire uniquement — **jamais définie dans le corps** | **oui** |
| `vector-databases` | A | interface / adapter | Exercice difficile : « implémente une interface `VectorStore` avec DEUX adapters » | `architecture-basics`, liée en bas | **oui** |
| `caching-performance` | A | LRU | Exemple simple + niveaux de cache | renvoyé au « jour 30 », pas défini ici | non |
| `observability-fundamentals` | **B** | connection pool | conclusion de l'exemple guidé | nulle part ; absent du glossaire | non |
| `observability-fundamentals` | **B** | p95 | exemple guidé | `metrics-percentiles`, liée en bas | non |
| `git-fundamentals` | **C** | fast-forward | Concepts clés | jamais expliqué | non |
| `algorithmic-thinking` | **C** | Map / Set | pattern « mémoriser le vu » | `javascript-basics` (prérequis) — 1 occurrence seulement | non |
| `algorithmic-thinking` | **C** | test par oracle | Concepts clés | glosé sur place entre parenthèses ✔ | non |

**Total : 11 gaps bloquants sur 10 leçons — mais répartis de façon très
inégale.** Famille A : 11 gaps bloquants sur 7 leçons. Familles B et C :
**0 gap bloquant sur 3 leçons**.

### 6.2 Le défaut le plus grave, et il est réparable en une passe

Le corpus contient un glossaire de **711 entrées** de bonne facture, avec
traduction en langage simple et confusions courantes.

> **Aucune des 128 leçons ne contient un seul lien vers `/glossary`.**
> (`grep -rl "/glossary" curriculum/lessons/` → 0 fichier.)

Le vocabulaire est défini, mais jamais à l'endroit où l'apprenant le rencontre.
`rappel@k`, `golden set`, `reranking`, `chunking`, `p95`, `pull request` sont
tous définis — et tous invisibles au point de blocage. C'est un défaut de
**produit**, pas de corpus : il se corrige sans réécrire une ligne de cours.

Six termes bloquants ne sont, eux, définis **nulle part** : `lint`, `linter`,
`produit scalaire`, `norme`, `connection pool`, `endpoint`.

### 6.3 Incohérence interne des prérequis (dimension H)

Deux cas relevés, tous deux vérifiables en une commande :

1. `ci-cd` déclare `git-fundamentals` comme couvrant les *pull requests* — la
   leçon citée ne mentionne pas l'expression.
2. `embeddings` déclare en Prérequis « savoir écrire une petite fonction
   (produit scalaire) suffit » **et** liste `produit scalaire` dans son propre
   Vocabulaire. La leçon suppose acquis ce qu'elle annonce enseigner, et ne fait
   ni l'un ni l'autre.

---

## 7. Test de compréhension (§5) — 10 leçons × 3 questions

Protocole P2 : je réponds **uniquement avec ce que le corpus enseigne**. Toute
connaissance extérieure mobilisée est comptée comme un manque.

| Leçon | Restitution | Explication reformulée | Transfert | Le cours seul suffit-il ? |
|---|:--:|:--:|:--:|---|
| `git-fundamentals` | ✅ | ✅ | ✅ | **oui** — les trois zones, le staging, le conflit sont expliqués causalement |
| `algorithmic-thinking` | ✅ | ✅ | ✅ | **oui** — la méthode en 6 étapes est opérationnelle, Big-O est ancré sur « n double → ? » |
| `observability-fundamentals` | ✅ | ✅ | ✅ | **oui** — l'exemple guidé chiffré donne le raisonnement complet |
| `caching-performance` | ✅ | ✅ | ✅ | **oui** — N+1, clé de cache, TTL, taux de hit : mécanismes explicités |
| `chunking-strategies` | ✅ | ✅ | ⚠️ | **partiellement** — le transfert demande de comparer par `rappel@k`, jamais défini |
| `vector-databases` | ✅ | ✅ | ⚠️ | **partiellement** — le calcul mémoire est donné ; l'exercice d'interface ne l'est pas |
| `embeddings` | ✅ | ⚠️ | ❌ | **non** — « similarité cosinus = l'angle » est un *nom*, pas un mécanisme ; l'exemple guidé appelle `cosinus()` comme boîte noire, et le mini-exercice demande de l'implémenter |
| `ci-cd` | ✅ | ✅ | ⚠️ | **partiellement** — on peut copier le YAML ; on ne peut pas savoir ce que « lint » vérifie |
| `docker-containers` | ✅ | ❌ | ❌ | **non** — « Explication complète » = 5 puces définitionnelles ; le mécanisme des couches, cité en anti-pattern, n'est jamais posé |
| `rag-fundamentals` (via jour 232) | ✅ | ✅ | ✅ | **oui** — la journée, elle, développe |

**Résultat : 5 / 10 « oui » sans réserve, 3 « partiellement », 2 « non ».**
Les 2 « non » et 2 des 3 « partiellement » sont de famille A. Les 3 leçons de
familles B et C testées sont à « oui » sans réserve.

### 7.1 Le test des mots-clés (P3), appliqué au cas le plus net

`embeddings.md`, section « Explication complète », amputée de tous ses noms
propres et termes marqués :

> « Un modèle prend un texte et sort une liste de nombres. La géométrie encode
> la sémantique : deux textes de sens voisin ont des listes voisines. Pour
> comparer deux listes, on mesure l'angle entre elles. On travaille souvent avec
> des listes de longueur 1, auquel cas la mesure se réduit à une opération plus
> simple. »

Ce qui reste **ne contient aucun mécanisme** : ni comment on passe d'un texte à
des nombres, ni pourquoi un angle mesure une ressemblance de sens, ni ce qu'est
« l'opération plus simple ». Le passage nomme ; il n'enseigne pas.

Le même test sur `observability-fundamentals` laisse intact : « le premier signal
te dit *que* ça va mal, le deuxième *où* le temps est passé, le troisième *quoi*
précisément — et aucun n'existe si on n'a pas décidé de l'émettre avant la
panne. » Le mécanisme survit entièrement.

**Ce test discrimine les familles, et c'est précisément ce que le brief cherche.**

---

## 8. Typologie des défauts — PED-01 à PED-20

Chaque défaut porte : sa définition, son **statut de preuve** (mesuré / lu /
jugé), son comptage, et au moins une occurrence citée. Un défaut sans occurrence
citée n'est pas listé.

| # | Défaut | Preuve | Ampleur | Occurrence citée |
|---|---|---|---|---|
| **PED-01** | Noyau explicatif hors de proportion avec le cadrage | mesuré | **71 leçons** (famille A), noyau 239 mots = 23 % de la leçon | `docker-containers` : 107 mots pour 867 |
| **PED-02** | Le noyau est une **liste de définitions**, pas une explication | lu | vérifié sur 5 des 7 leçons A lues | `docker-containers` : « 📖 Explication complète » = 5 puces |
| **PED-03** | L'erreur est **nommée**, jamais **montrée** | mesuré | **81 %** des journées (médiane 4 items) ; corpus entier : 54 sections de contre-exemples, **1 seule contient du code** | `css-flexbox.md` est le seul contre-exemple exécutable du corpus |
| **PED-04** | Terme requis par l'exercice, défini nulle part | lu + mesuré | 6 termes : `lint`, `linter`, `produit scalaire`, `norme`, `connection pool`, `endpoint` | `ci-cd`, checklist : « ma CI lint … » |
| **PED-05** | Terme défini au glossaire, **jamais atteignable depuis le point d'usage** | mesuré | **0 lien `/glossary` sur 128 leçons**, 711 entrées disponibles | `rappel@k` : défini, invisible |
| **PED-06** | Prérequis pointant vers une ressource qui ne contient pas la notion | lu | 2 cas sur 10 leçons lues | `ci-cd` → `git-fundamentals` pour « pull requests » : 0 occurrence |
| **PED-07** | Vocabulaire orphelin : terme listé, absent du corps | mesuré | **116 termes sur 778 (15 %)**, dans **65 leçons sur 128** | `embeddings` → « espace latent » |
| **PED-08** | Contradiction interne prérequis / vocabulaire | lu | 1 cas net | `embeddings` : `produit scalaire` supposé acquis **et** enseigné |
| **PED-09** | Correction qui reformule le résumé au lieu de corriger | mesuré | **28 %** des journées : correction absente ou plate | `docker-containers`, « Correction attendue » |
| **PED-10** | Correction n'expliquant pas l'erreur de raisonnement | mesuré | seulement **42 %** l'expliquent | — |
| **PED-11** | Dégradation de la correction au fil de l'année | mesuré | 100 % (M1-M3) → 63 % → 66 % → **42 %** (M10-M12) | voir §9 |
| **PED-12** | Longueur plafonnée indépendamment de la difficulté du sujet | mesuré | 128 leçons dans une bande de 657 mots (867–1 524) | `distributed-systems-failures` = 1 441 mots |
| **PED-13** | Uniformité de plan | mesuré | 1 signature couvre **42 leçons**, 3 en couvrent 80 | — |
| **PED-14** | Charge annoncée sans contenu correspondant | mesuré | contenu fourni = **25 %** des 4 h 30 (médiane 67 min) | les 365 journées |
| **PED-15** | Travail demandé sans durée, sans découpage, sans critère d'arrêt | mesuré | **267 journées sur 365** n'ont aucun budget propre | — |
| **PED-16** | Acronyme jamais développé | mesuré | **53 %** des journées, 1–2 par journée | jour 50 : `MDN` |
| **PED-17** | Le drapeau `detailed` ne correspond à aucune différence réelle | mesuré | `true` (78 j.) : 4 079 mots / 66 min · `false` (287 j.) : 3 727 mots / **69 min** | `data/program.json` |
| **PED-18** | Rappel actif absent des **leçons** (présent seulement dans les journées) | mesuré | **0 bloc `<details>` sur 128 leçons** ; 91 % des journées en ont | — |
| **PED-19** | Aucun retour à distance sur une notion déjà vue | mesuré | aucun mécanisme de réactivation planifiée dans le corpus (c'est l'objet du Retention Engine, CP2–CP7) | — |
| **PED-20** | Exemple guidé absent sur les journées légères | mesuré | **19 %** des journées de l'échantillon ; concentré sur la difficulté 2 (24 % d'exemples complets) | jours 91, 126, 147, 273, 287 |

### 8.1 Ce qui a été cherché et **n'a pas** été trouvé

Le brief demande de ne pas chercher à lui donner raison. Ces hypothèses ont été
testées et **rejetées** :

- « Beaucoup de noms de concepts pour peu d'explication » → **partiellement
  faux** : la densité de jargon marqué est de 1,9 / 100 mots, ce qui est bas.
  Le problème n'est pas le nombre de termes, c'est que 15 % d'entre eux ne sont
  jamais utilisés et qu'aucun n'est cliquable.
- « Manque d'exemples développés » → **faux, et largement** : 74 % des journées
  de l'échantillon ont un exemple guidé complet ; hors revues hebdomadaires,
  **91 % dans l'échantillon et 99 % sur les 313 journées concernées du corpus**.
  C'est la mesure qui contredit le plus nettement l'hypothèse de départ.
- « Manque d'explication du pourquoi » → **faux** : la causalité est présente
  partout, exprimée par juxtaposition plutôt que par connecteurs (FP-3).
- « Textes écrits comme si l'apprenant possédait déjà le contexte » → **vrai
  seulement en famille A**, et de façon localisée (11 gaps bloquants, tous
  nommables).
- « Journées de 4,5 h dont le contenu est incompatible » → **vrai**, mais la
  cause n'est pas la brièveté des cours : c'est l'absence de description du
  travail attendu (PED-14, PED-15).

---

## 9. Ancien vs récent, facile vs difficile

### 9.1 Par période (365 journées)

| Période | Contenu fourni | % des 4 h 30 | Budget de temps propre | Exemple guidé complet | Correction ≥ partielle | Acronyme non développé |
|---|---:|---:|---:|---:|---:|---:|
| M1–M3 (j. 1–90) | 64 min | 24 % | **39 %** | 82 % | **100 %** | 64 % |
| M4–M6 (j. 91–181) | 46 min | 17 % | 18 % | 86 % | 63 % | 51 % |
| M7–M9 (j. 182–273) | **99 min** | **37 %** | 25 % | 85 % | 66 % | 62 % |
| M10–M12 (j. 274–365) | 78 min | 29 % | 26 % | 86 % | **42 %** | 50 % |

Deux mouvements nets, en sens contraire :

- **le volume monte** (46 → 99 min entre le 2ᵉ et le 3ᵉ trimestre) ;
- **l'accompagnement descend** : la correction explicative passe de **100 % à
  42 %**, et le budget de temps par activité de 39 % à 26 %.

Le corpus donne donc **plus de matière et moins de guidage** à mesure que les
sujets deviennent plus durs. C'est l'inverse de ce qu'on attend d'un cursus.

### 9.2 Par difficulté déclarée

| Difficulté | n | Mots | Contenu fourni | Exemple guidé complet | Correction ≥ partielle |
|---|---:|---:|---:|---:|---:|
| 1 | 4 | 4 594 | 68 min | 75 % | 100 % |
| 2 | 68 | **1 001** | **9 min** | **24 %** | 99 % |
| 3 | 280 | 4 550 | 76 min | 99 % | **58 %** |
| 4 | 13 | 4 014 | 64 min | 100 % | 100 % |

La difficulté 2 regroupe **52 revues hebdomadaires** et 16 journées de début de
programme. Isolées, les 52 revues donnent : 960 mots, **9 minutes de contenu
fourni, soit 3 % des 4 h 30 annoncées**. C'est l'écart annoncé/fourni le plus
extrême du corpus — et il est systématique, une semaine sur sept, toute l'année.
Hors revues, les 313 autres journées sont à 71 min (26 %).

Note de méthode : ces 52 journées tirent vers le bas toutes les moyennes du
corpus. C'est pour cette raison que les taux d'exemple guidé sont donnés ici
avec **et** sans elles.

---

## 10. Les cinq meilleures et les cinq moins bonnes leçons observées

Classement **argumenté**, pas dérivé d'un score : la longueur n'est pas la
qualité (règle 7).

**Les cinq meilleures.**

1. `observability-fundamentals` (B) — analogie + sa limite, quatre paragraphes
   guidés par leur sujet, exemple guidé chiffré qui déroule métrique → trace →
   log jusqu'à une conclusion étayée, et une section « Que faire dans ce cas »
   qui donne une démarche (observer / hypothèse / corriger / prévenir).
2. `algorithmic-thinking` (C) — la méthode en 6 étapes est utilisable telle
   quelle ; Big-O est ancré sur « n double → que se passe-t-il ? » ; le piège
   n°1 (`includes` dans une boucle) est un vrai contre-exemple.
3. `git-fundamentals` (C) — traite la **peur** du conflit comme un objet
   pédagogique (« aucune donnée n'est en danger… la peur disparaît en en
   résolvant dix »), et le schéma des trois zones est explicitement « à savoir
   dessiner ».
4. `caching-performance` (A) — la meilleure leçon de famille A : mesurer avant
   d'optimiser, N+1 chiffré (1 + 50 = 51 allers-retours), clé de cache dont on
   dit ce qu'elle casse dans les deux sens.
5. `chunking-strategies` (A) — le problème d'abord est concret et le contre-cas
   (« Article 4 — Préavis » contre une tranche de 500 caractères) est le
   meilleur exemple de vulgarisation du domaine RAG.

**Les cinq moins bonnes.**

1. `docker-containers` — noyau explicatif de **107 mots**, le plus mince du
   corpus, en cinq puces définitionnelles ; « couche » citée dans un
   anti-pattern sans avoir jamais été définie ; correction qui reformule le
   résumé. Le cadrage est excellent, le centre est vide.
2. `embeddings` — échoue au test des mots-clés (§7.1), suppose et enseigne le
   même prérequis, et demande d'implémenter une fonction dont aucune des deux
   briques n'est définie nulle part dans le corpus.
3. `pandas-data-wrangling` — 116 mots de noyau pour 889.
4. `etl-pipelines` — 128 mots de noyau, sujet à trois notions nouvelles.
5. `ci-cd` — six occurrences de `lint`, terme absent du corpus **et** du
   glossaire, présent jusque dans la checklist de fin.

Aucune de ces cinq n'est **fausse**. C'est important : le problème du corpus
n'est pas l'exactitude (dimension K), c'est la profondeur du noyau (C) et
l'atteignabilité du vocabulaire (E).

---

## 11. Notation sur le barème gelé

Application du barème du §2 de `docs/V66-ACADEMIC-GRID-FROZEN.md`. Rappel : la
note globale est une moyenne non pondérée, publiée avec son détail.

| # | Dimension | Note | Ce qui décide |
|---|---|:--:|---|
| D1 | Accessibilité au néophyte | **3** | 11 gaps bloquants / 10 leçons, mais 0 sur les familles B et C |
| D2 | Vulgarisation | **4** | analogie + limite explicite dans toutes les leçons lues |
| D3 | Profondeur du noyau explicatif | **2** | 71 leçons à 239 mots sans structure ; 2 échecs nets au test des mots-clés |
| D4 | Progression interne | **3** | ordre correct en B/C ; en A, notions introduites sans transition |
| D5 | Maîtrise du jargon | **2** | 0 lien glossaire, 15 % de vocabulaire orphelin, 6 termes définis nulle part |
| D6 | Exemples développés | **4** | 91 % hors revues dans l'échantillon, 99 % sur le corpus hors revues |
| D7 | Contre-exemples | **1** | 1 contre-exemple exécutable dans tout le corpus |
| D8 | Justesse des prérequis | **3** | 2 chaînes cassées sur 10 leçons lues |
| D9 | Correction pédagogique | **3** | 42 % expliquent l'erreur de raisonnement ; dégradation M1→M12 |
| D10 | Charge réelle honnête | **1** | 25 % du temps annoncé est couvert, et le produit ne dit pas ce que couvre le reste |
| D11 | Rétention active | **3** | 91 % de rappel caché dans les journées, **0** dans les leçons, aucun retour à distance |
| D12 | Honnêteté académique | **5** | aucune affirmation fausse relevée ; limites et compromis systématiquement énoncés |

**Moyenne : 2,83 / 5.** Deux dimensions à 1 (D7 contre-exemples, D10 charge
réelle honnête).

Selon la règle de verdict gelée : moyenne < 3,0 → **baseline établie avec dette
déclarée**, et la dette s'énonce ainsi :

> Le corpus est exact, bien cadré et honnête, mais il **montre trop rarement
> l'erreur**, il **rend son propre vocabulaire inatteignable au point de
> blocage**, et il **annonce quatre fois plus de temps qu'il n'en décrit**.

---

## 12. Réponse provisoire à la question du sprint

> Les cours enseignent-ils réellement, ou sont-ils des fiches techniques
> condensées ?

**Les deux, et on peut dire exactement lesquels.**

- **57 leçons sur 128** (familles B et C) enseignent : noyau structuré de 335 à
  396 mots, décomposition, exemple guidé chiffré, démarche face à un incident.
  Testées, elles passent le test de compréhension et le test des mots-clés.
- **71 leçons sur 128** (famille A) sont, dans leur section centrale, des fiches
  condensées : 239 mots, aucune structure interne, notions nommées plutôt que
  mécanismes exposés. Elles restent excellentes **autour** du noyau — le
  problème d'abord, le modèle mental et les erreurs fréquentes y sont souvent
  très bons.

**La bonne nouvelle méthodologique : le modèle éditorial correct existe déjà
dans le dépôt.** Il n'y a rien à inventer, et la règle absolue 12 du brief
(« pas de réécriture massive générative des 365 jours sans preuve que le modèle
éditorial est correct ») est satisfaisable : la preuve, ce sont les 12 leçons de
famille B, mesurées et lues.

Le durcissement des 8–12 flagships (CP8–CP12) consistera donc à **faire migrer
des leçons de famille A vers le modèle B**, pas à inventer un format.

---

## 13. Ce que ce CP0 ne prouve pas

Par honnêteté, et pour que le CP15 ne s'appuie pas sur du sable :

- Je n'ai lu intégralement que **10 leçons sur 128** et une poignée de journées.
  Les familles B et C sont créditées sur 3 lectures ; c'est peu.
- Le test de compréhension est fait **par moi**, sur des questions écrites **par
  moi**. Il détecte l'absence d'information, pas la difficulté ressentie.
- Le modèle de charge (150 mots/min) est un ordre de grandeur défendable, pas
  une mesure. Il donne une borne inférieure ; il ne dit pas combien de temps un
  humain met réellement.
- Rien ici ne mesure la **rétention** : c'est précisément l'objet des CP2–CP7,
  et aucune conclusion de rétention ne peut être tirée du corpus seul.
- `ACADEMIC_QUALITY_READY` reste hors d'atteinte de ce sprint, et ne sera pas
  prononcé.

---

## 14. Suite immédiate

**CP1** — geler dans un commit : échantillon, seed, métriques, barème, seuils,
définitions de défauts, protocoles de lecture, résultats BEFORE, empreintes.
Puis CP2 → CP15 sans arrêt volontaire.
