# V67 · CP2 — Architecture éditoriale de référence

> Le brief demande d'« identifier les meilleures leçons B existantes », d'en
> « extraire ce qui fonctionne » et d'en tirer « une architecture éditoriale
> commune réutilisable », sans les copier aveuglément.
>
> Ce document répond à cette demande. Il contient aussi un constat que le CP2
> n'attendait pas et qui commande la suite du sprint.

---

## 0. Le constat qui rend ce CP2 inconfortable

Le CP0 avait établi que 68 des 128 leçons ne sont programmées par aucune
journée. Le CP2 mesure **lesquelles**.

| | Orphelines (68) | Sur le chemin (60) |
|---|---|---|
| Noyau explicatif médian | **312 mots** | 272 mots |
| Échecs objectifs du contrat | **1** | **16** |
| Familles A / B / C | 32 / **12** / 24 | 39 / **0** / 21 |

> **Les douze leçons de famille B — celles que ce CP2 devait ériger en modèle —
> sont orphelines toutes les douze.** Sept des dix plus gros noyaux du corpus
> le sont aussi. Seize des dix-sept échecs objectifs, à l'inverse, sont sur le
> chemin.

Le modèle de référence que ce checkpoint devait construire **existe déjà dans
le corpus**, et c'est exactement la partie que l'apprenant ne rencontre jamais.
Ce n'est pas une nuance de présentation : cela déplace le premier chantier de
V67 de « mieux écrire » vers « rendre atteignable, puis hisser le reste ».

### La cause, mécanique et exacte

Elle n'est ni éditoriale ni pédagogique. Elle tient en trois lignes de code.

- `scripts/generate-curriculum.mjs:335` — une journée lie
  `day.lessonsOverride ?? LESSON_BY_SKILL[day.skill]`.
- `scripts/data/lessons-map.mjs:159` — `LESSON_BY_SKILL` associe 20 compétences
  à **56 leçons distinctes sur 128**.
- Aucune journée ne porte la compétence `cloud`, alors que `LESSON_BY_SKILL`
  lui réserve une entrée : les 32 leçons Linux / Docker / K8s / réseau /
  observabilité / CI-CD / IaC / FinOps sont inatteignables **par
  construction**.

Le mécanisme d'échappement existe pourtant déjà : le champ `lessons` de
`DAYS_ENRICH` alimente `lessonsOverride`. Il est documenté dans
`scripts/data/days-enrich.mjs:7`. Il suffit qu'une journée le renseigne.

---

## 1. Ce que le corpus enseigne réellement, et où

Vérifié avant d'écrire quoi que ce soit, parce que « les cours » n'est pas un
objet unique dans ce projet :

| Objet | Nombre | Généré ? | Rôle réel |
|---|---|---|---|
| `curriculum/days/*.md` | 365 | **oui**, depuis `scripts/data/` | porte l'essentiel du cours |
| `curriculum/solutions/*.md` | 365 | oui | la correction |
| `curriculum/lessons/*.md` | 128 | **non**, écrites à la main | la leçon de fond |

`npm run generate` réécrit 795 fichiers et n'en change **aucun** : le
générateur est idempotent, vérifié (seul `generatedAt` bouge). Les 128 leçons
sont hors de sa portée.

Conséquence opératoire pour les CP3→CP8 : **une correction de journée se fait
dans `scripts/data/`, jamais dans `curriculum/days/`**, sous peine d'être
effacée à la première régénération. Une correction de leçon se fait dans le
fichier de leçon.

### Anatomie mesurée des 365 journées

| | |
|---|---|
| Mots par journée (médiane) | 1 316 |
| Mots de « Cours approfondi » (p10 / méd. / p90) | 31 / **376** / 696 |
| Exemple guidé | 313/365 |
| Pratique autonome | 313/365 |
| Livrable annoncé (mots, médiane) | 9 |
| Critères cochables (médiane) | 4 |
| Mini-quiz | 78/365 |

Les 52 journées sans exemple guidé, sans pratique, sans livrable et sans lien
de leçon sont **exactement les 52 revues** — aucune journée ordinaire n'est
vide. La formule de V66, « les journées n'exposent pas de travail concret »,
ne survit pas à cette mesure et n'est pas reprise.

---

## 2. Les sept gestes — extraits par lecture, pas par comptage

Extraits de `system-design-scaling`, `observability-fundamentals`,
`react-fundamentals` et de la journée 79. Aucun n'est un intertitre à imposer :
ce sont des **gestes**, et une leçon peut en réussir un sans le nommer.

### Geste 1 — Ouvrir sur le manque, jamais sur la définition

> « Ton application tourne sur UNE machine et marche très bien : 10
> utilisateurs, tout est fluide. Puis le succès arrive […] Et si LA machine
> tombe, tout s'arrête. » — `system-design-scaling`

Le lecteur doit **ressentir le problème avant d'entendre le mot**. « SPOF »
n'arrive qu'après qu'on ait vu une machine tomber.

### Geste 2 — Un modèle mental qui SERT, et une analogie qui annonce sa limite

Le guichet unique de `system-design-scaling` n'est pas décoratif : il est
réutilisé à la section 3 pour justifier le *stateless* (« n'importe quel
guichet doit pouvoir servir n'importe quel client »).

Et l'analogie borne sa propre validité :

> « Limite de l'analogie : un logiciel n'a pas de capot physique — les
> "traces" sont des données qu'il faut avoir DÉCIDÉ d'émettre AVANT la panne. »
> — `observability-fundamentals`

Un modèle mental posé puis abandonné vaut 3/5 au barème (D3). Celui-là vaut 5.

### Geste 3 — Chaque pas rappelle le précédent, et rappelle une journée déjà faite

C'est ce qui sépare `react-fundamentals` — famille A, six puces, excellent — de
`database-modeling` — famille A, six puces, juxtaposées :

> « Ta discipline du jour 26 n'était pas un dogme : c'était l'entraînement. »
> « C'est la décomposition en fonctions (jour 9), appliquée à l'UI. »
> « ne stocke jamais ce qui se CALCULE (le total se dérive du panier — jour 10,
> même principe). »

Trois rappels explicites vers des journées antérieures dans un seul noyau.
**C'est le geste que la famille éditoriale ne voit pas**, et c'est pourquoi la
famille n'a jamais prédit la qualité.

### Geste 4 — Nommer le comportement qui SURPREND

Une leçon qui décrit seulement le comportement normal ne dépasse pas 3/5 en
profondeur (D4).

> « `setCount(count + 1); setCount(count + 1);` n'ajoute que **1** (les deux
> lisent le MÊME `count`). » — `react-fundamentals`
>
> « Un réplica peut être légèrement en retard. » — `system-design-scaling`

C'est là que se loge la différence entre savoir le nom d'un mécanisme et
savoir ce qu'il fait.

### Geste 5 — L'exemple guidé est une suite de DÉCISIONS, pas une solution

`system-design-scaling` ne montre pas une architecture : il montre l'ordre dans
lequel on y arrive — diagnostic du goulot, puis cache (« le levier le moins
cher »), puis stateless + répartiteur, puis réplicas, puis suppression du SPOF —
et il termine en **énonçant la règle de décision** :

> « on traite le goulot réel, du levier le moins coûteux au plus structurant.
> On n'a pas "tout distribué" d'emblée. »

`observability-fundamentals` fait la même chose en trois signaux : la métrique
alerte, la trace localise, le log explique. Le lecteur repart avec une méthode,
pas avec une réponse.

### Geste 6 — Une correction donne un critère vérifiable SEUL

> « Vérifie : aucune mutation (relis chaque setter), les keys sont stables, et
> déplacer une carte ne perd aucune donnée. » — `react-fundamentals`

Trois critères qu'un apprenant seul peut appliquer sans corrigé. Le CP0 a
mesuré que 100 % des corrigés donnent un critère mais que **24 % seulement
montrent une alternative** — c'est la moitié manquante de ce geste.

### Geste 7 — Une échelle, et une production avant la réponse

`react-fundamentals` monte : exemple simple → exemple guidé → mini-exercice →
exercice plus difficile → correction attendue → checklist « quand suis-je
prêt ? ».

Et la journée 79 impose l'ordre :

> « Étudie ce pas-à-pas, puis FERME-le et attaque la pratique autonome de
> mémoire. »

C'est la seule forme qui vaut 5 en récupération active (D14) : produire
**avant** que la réponse soit accessible.

---

## 3. Le contre-modèle : le prospectus

`nextjs-foundations` est de famille C, fait 1 068 mots, ouvre sur un vrai
problème et pose un modèle mental correct. Elle échoue quand même, et il faut
nommer précisément pourquoi — c'est le défaut à traquer dans les CP3→CP8.

Elle **annonce et diffère**. Quatre fois :

> « traités dans les leçons suivantes » · « on verra que le rendu serveur
> EXÉCUTE du React » · « la syntaxe exacte dépend de la version » ·
> « prépare `/doc/lessons/nextjs-rendering` »

Elle présente le routing par fichiers comme « le mécanisme structurant » et
n'en montre jamais un seul fichier de page, ni ce qui se passe à la requête.
Elle n'a ni vérification de compréhension, ni cas professionnel, ni question
d'entretien, ni correction pour son mini-exercice.

**Un prospectus n'est pas une leçon.** Le défaut n'est ni la longueur, ni la
famille, ni le nombre d'intertitres : c'est que rien n'y est mené à terme.

---

## 4. L'architecture réutilisable

Une **grammaire**, pas un gabarit. L'ordre est indicatif ; la présence des
fonctions ne l'est pas. Une leçon de débogage doit ressembler à du débogage.

| # | Fonction | Ce qui la rend suffisante | Peut manquer si… |
|---|---|---|---|
| 1 | Le manque | le lecteur voit le problème avant le mot | jamais |
| 2 | Objectif | dit ce qu'on saura FAIRE | jamais |
| 3 | Prérequis | nomme les notions et où elles ont été vues | la leçon ouvre un domaine |
| 4 | Modèle mental | il est réutilisé plus bas ; l'analogie borne sa validité | le sujet est purement procédural |
| 5 | Noyau explicatif | chaque pas s'appuie sur le précédent ; ≥1 rappel d'une journée antérieure | jamais |
| 6 | Ce qui surprend | un comportement contre-intuitif est exposé | le sujet n'en a pas — à justifier |
| 7 | Exemple guidé | une suite de décisions, close par la règle de décision | jamais |
| 8 | Échelle d'exercices | ≥2 niveaux, dont un autonome | la leçon est une référence déclarée |
| 9 | Correction | démarche + erreur probable + **alternative** + critère vérifiable seul | la correction vit dans `solutions/` |
| 10 | Erreurs fréquentes | l'erreur est expliquée, pas seulement listée | jamais |
| 11 | Récupération active | une production demandée AVANT la réponse | jamais |
| 12 | Situation professionnelle | une décision réelle avec son compromis | jamais |
| 13 | Synthèse | tient sans relire la leçon | jamais |
| 14 | Vocabulaire | chaque terme est atteignable dans le glossaire | jamais |
| 15 | Liens | vers ce qui précède ET ce qui suit | jamais |

**Ce que cette architecture interdit explicitement :** imposer ces quinze
intitulés à 128 pages. Le CP0 a déjà mesuré que la famille éditoriale — le
marqueur de surface le plus évident — ne prédit rien. Un seizième marqueur de
surface ne prédirait pas davantage.

---

## 5. Défauts trouvés au CP2, à traiter dans les checkpoints suivants

### P0-1 — 68 leçons inatteignables, dont les 12 meilleures
Cause : `LESSON_BY_SKILL` couvre 56/128 leçons ; la compétence `cloud` n'a
aucune journée. Correctif : renseigner `lessons` dans `DAYS_ENRICH` pour les
journées concernées. Aucun réordonnancement des 365 journées n'est nécessaire —
et le contrat gelé l'interdit.

### P1-2 — 38 journées renvoient vers des leçons sans rapport
`scripts/generate-curriculum.mjs:459` construit le rappel « Approfondis via la
leçon de fond » depuis `LESSON_BY_SKILL[day.skill]` **en oubliant
`lessonsOverride`**, que la ligne 335 honore pourtant pour les liens réels. La
journée 79, consacrée à l'observabilité, renvoie ainsi vers « Cache et
performance » ; la journée 87, consacrée à React, vers « JavaScript
asynchrone ». Correctif : un mot, à la ligne 459, puis régénération.

### P1-3 — 16 leçons sur le chemin échouent au contrat
Noyaux de 144 à 197 mots, toutes de famille A : `async-javascript`,
`data-cleaning-quality`, `deployment-secrets`, `error-handling`,
`express-backend`, `feature-engineering`, `llm-observability`,
`model-evaluation`, `monitoring-production`, `observability-logging`,
`prompt-engineering`, `readme-documentation`, `scikit-learn-workflow`,
`structured-outputs-tools`, `system-design-interview`,
`technical-storytelling`.

Deux d'entre elles — `model-evaluation` (31 journées) et
`structured-outputs-tools` (36 journées) — sont les leçons les plus programmées
du corpus. Ce sont donc les plus lues, et elles font 172 et 144 mots de noyau.

### P2-4 — 30 drapeaux de lecture sur le chemin
Non retenus comme défauts sans lecture : le CP1 a publié que les conditions
objectives sous-détectent, et `react-fundamentals` figure dans cette liste tout
en étant l'un des modèles de ce document. **La lecture décide, pas le
compteur.**

---

## 6. Sonde écartée au CP2 — la dixième

Pour mesurer le défaut P1-2, j'ai d'abord découpé la chaîne de renvoi sur les
virgules et cherché chaque morceau parmi les titres de leçons. Résultat :
« 42 journées renvoient ailleurs », avec en tête la journée 50 accusée de
renvoyer vers « HTTP » et « REST et JSON » alors qu'elle lie `http-rest-json`.

Le titre de cette leçon est **« HTTP, REST et JSON »**. Ma virgule le coupait
en deux. Même faute sur « Terminal, shell et système de fichiers » et
« Modélisation, normalisation, index, transactions ».

Corrigé en cherchant le titre entier de chaque leçon réellement liée dans la
chaîne, sans segmentation à inventer : **38**, et le défaut de la journée 79
reste vrai. Le chiffre publié est 38.

Deux autres erreurs de mesure ont été attrapées dans le même checkpoint, dans
`scripts/v67-days.mjs` : un `$` en drapeau `m` qui arrêtait chaque section à la
fin de son propre titre (d'où « 0/365 livrables » sur un corpus qui en a 313),
et un `\w{20,}` qui exigeait vingt caractères de mot consécutifs, donc sans
espace. Les deux ont été trouvées parce qu'elles contredisaient une lecture
faite quelques minutes plus tôt — pas par un compteur.
