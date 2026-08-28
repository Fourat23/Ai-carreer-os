# V67 · CP0 — Baseline académique forensique

> **Lecture seule.** Aucun fichier de `curriculum/`, `data/` ou `data/progress.json`
> n'a été modifié pour produire ce rapport. Rejouable :
> `node scripts/v67-audit.mjs`.

---

## 0. Position de départ

| | |
|---|---|
| HEAD | `dcc958b` (V66 CP15) · branche `claude/ai-career-os-saas-phfg49` |
| local == origin | oui · 0 fichier modifié · 0 stash · 0 serveur résiduel |
| `data/progress.json` | `73c1ee39a255c879…` (inchangé, gitignoré) |
| Corpus | 128 leçons · 365 journées · 365 corrigés · 52 revues · 711 entrées de glossaire |
| Durée annoncée | **270 min pour les 365 journées**, sans exception |

---

## 1. La réponse aux huit questions du brief

### Q1 — Combien de leçons A / B / C ?

**A 71 · B 12 · C 45**, inchangé depuis V66 — et ce chiffre est trompeur, il
faut le dire tout de suite.

Le classement mesure un marqueur de SURFACE : la présence de sous-titres `###`
dans le noyau explicatif. Les neuf leçons durcies en V66 restent classées A
parce qu'elles utilisent des paragraphes introduits par leur sujet plutôt que
des `###`. **Le classement A/B/C ne prédit pas la qualité**, et le CP0 de V67
l'établit plus durement encore que V66 :

- `react-fundamentals` est **famille A** et son noyau explique l'état-instantané
  de React avec son piège (`setCount(count+1)` deux fois n'ajoute que 1) mieux
  que la plupart des tutoriels — c'est une excellente leçon.
- `nextjs-foundations`, `sql-foundations`, `clean-code` sont **famille C** et
  leurs noyaux sont des listes de définitions.

Conclusion opérationnelle : **V67 ne travaillera pas « la famille A ». Il
travaillera les leçons que la lecture identifie comme insuffisantes**, quelle
que soit leur famille.

### Q2 — Combien échouent réellement à la grille V67 ?

| | |
|---|---:|
| Échec **objectif** (noyau < 200 mots, ou ≥ 4 fonctions pédagogiques absentes) | **17** |
| **Drapeau de lecture** levé (liste plate de sujets, ou exemple guidé sans chemin) | **56** |
| Ni l'un ni l'autre | 55 |

**Et ce compteur SOUS-DÉTECTE, volontairement.** J'ai tenté trois fois
d'affiner la condition « l'exemple guidé montre-t-il un chemin ? » pour qu'elle
cesse d'accuser `algorithmic-thinking`, dont l'exemple oppose « naïf O(n×k) » à
« fenêtre glissante O(n) » — un raisonnement complet en deux lignes. À la
troisième tentative il est devenu évident que j'itérais une expression
régulière jusqu'à ce qu'elle soit d'accord avec ma lecture. C'est exactement le
geste interdit, et le **neuvième faux positif du projet**.

La condition a donc été rétrogradée en drapeau. **C'est la lecture qui
dimensionne V67, pas ce compteur.**

### Q3 — Combien de journées ont une charge explicite crédible ?

**Zéro.** Les 365 journées annoncent **270 minutes**, la même valeur pour
toutes, y compris les 52 revues et les 4 journées de difficulté 1.

Ce que le corpus fournit réellement, mesuré :

| | Médiane | p10 | p90 |
|---|---:|---:|---:|
| Minutes de lecture (journée + leçons liées + corrigé) | **33** | 10 | 55 |
| Mots consacrés à DÉCRIRE le travail | **111** | 0 | — |
| Cases à cocher | 4 | — | — |

- **206 / 365** journées décrivent un livrable de plus de 8 mots.
- **40 / 365** consacrent moins de 40 mots à dire quoi faire.
- **16** délèguent le vrai travail à un fichier extérieur (« le projet EST le
  test — spec dans `project-06.md` »).

### Q4 — Combien de journées annoncent plus de 2× leur contenu réel ?

**365 sur 365**, et **329 annoncent plus de 4×**.

Précision méthodologique qui manquait à V66 : ces ratios comparent le temps
annoncé au temps de **LECTURE**. Ils ne prouvent pas que la journée est vide —
une journée qui commande « termine le projet 2 » fournit six minutes de lecture
et plusieurs heures de travail. Ce qu'ils prouvent, c'est que **le produit ne
chiffre jamais la part productive**, et que rien ne permet à l'apprenant de
savoir si sa journée est finie.

### Q5 — Combien de revues sont de vraies sessions de review ?

**Les 52.** Et c'est la correction la plus importante que le CP0 de V67 apporte
au CP0 de V66.

V66 a écrit « 52 revues hebdomadaires à 3 % de leur durée annoncée ». Ce chiffre
mesurait le **temps de lecture de la page de revue**, et il a été présenté
comme si les revues étaient vides. Lecture directe des jours 7, 91 et 350 :
elles ne le sont pas. Mesuré sur les 52, contre les onze composants que le
brief V67 §8 énumère :

| Composant | Présent sur |
|---|---:|
| récupération sans notes | 52 / 52 |
| questions cumulatives | 52 / 52 |
| pratique mélangée (test pratique + mini-projet) | 52 / 52 |
| exercice de correction | 52 / 52 |
| analyse d'erreur (plan de remédiation) | 52 / 52 |
| comparaison de concepts proches | 42 / 52 |
| tâche de transfert (ADR, réflexion architecturale) | 52 / 52 |
| révision espacée | 52 / 52 |
| mini-diagnostic (grille /3 par compétence) | 52 / 52 |
| correction commentée (« attendu : … ») | 52 / 52 |
| décision sur ce qui doit être revu | 52 / 52 |

**Médiane 11 composants sur 11. Minimum 10.** Une revue type contient un bilan,
un test pratique, un test théorique, un livrable, une checklist, des critères de
passage, un exercice d'architecture, une synthèse de semaine, une grille de
notation à six compétences, un plan de remédiation qui diagnostique quatre modes
d'échec, quatre questions d'entretien avec attendus, et une auto-évaluation.

**Le défaut des revues n'est donc pas l'absence de matière. C'est le même que
partout : le travail n'est pas chiffré.** Le brief V67 demande de « recomposer
les 52 reviews » sur la base d'un constat de vacuité qui est faux. Je le signale
avant de commencer, et je traiterai les revues sur leur vrai défaut.

### Q6 — Combien de notions apparaissent avant d'être expliquées ?

35 candidats bruts, **environ 20 réels après lecture** — les 15 autres sont des
mots français ordinaires que le glossaire contient aussi (`région`, `session`,
`température`, `migration`, `conflict`, `index`…), employés dans leur sens
courant.

Les cas réels, par gravité :

| Terme | Employé jour | Enseigné jour | Écart |
|---|---:|---:|---:|
| `runner` | 59 | 307 | **248** |
| `latency` | 80 | 325 | **245** |
| `CI/CD` | 72 | 307 | **235** |
| `OWASP` | 57 | 260 | **203** |
| défense en profondeur | 62 | 260 | **198** |
| `outlier` | 27 | 128 | **101** |
| `instrumentation` | 250 | 325 | 75 |
| `dashboard` · `refactoring` · `scope` | 1 · 5 · 9 | 38 · 40 · 44 | ~35 |
| `fine-tuning` · `groundedness` · `monitoring` | 184 · 220 · 50 | 218 · 253 · 79 | ~30 |
| `gradient` · `neuron` · `grounding` · `monolith` | | | 17–20 |
| `middleware` · `rate limiting` · `prompt injection` | | | 4–14 |

**Sept notions techniques sont employées plus de cent jours avant d'être
enseignées.**

### Q7 — Combien de corrections expliquent le raisonnement ?

Sur les 365 corrigés (médiane 351 mots, 26 avec du code) :

| Marqueur | Présent sur | |
|---|---:|---|
| Donne un critère vérifiable seul | 365 / 365 | **100 %** |
| Explique POURQUOI la bonne réponse est bonne | 184 / 365 | 50 % |
| Traite l'erreur PROBABLE, pas seulement la bonne réponse | 163 / 365 | 45 % |
| Montre une alternative ou un compromis | 88 / 365 | **24 %** |
| **Réunit au moins 3 des 4** | **122 / 365** | **33 %** |

Le brief §9 demande qu'une correction dise « pourquoi B, pourquoi A/C/D sont
séduisants mais incorrects, et quel principe général retenir ». **Deux
corrections sur trois n'y répondent pas.**

### Q8 — Quel est le principal défaut académique du corpus ?

**Plus de la moitié du corpus de leçons n'est sur aucun chemin d'apprentissage.**

C'est le constat le plus lourd du CP0, il n'était dans aucun sprint précédent,
et il déclasse tout le reste :

> **68 leçons sur 128 (53 %) ne sont liées par AUCUNE des 365 journées.**

Vérifié dans les deux sens : les journées référencent leurs leçons par des liens
`/doc/lessons/<slug>`, 60 slugs distincts apparaissent, 68 n'apparaissent
jamais. Les orphelines se citent entre elles, mais rien ne les assigne. Un
apprenant qui suit le programme jour après jour ne les rencontre jamais ; elles
ne sont atteignables que par le catalogue `/lessons`.

Et le cas extrême, mesuré sur `data/program.json` :

> **La compétence `cloud` (Cloud / DevOps) ne compte AUCUNE des 365 journées.**
> Zéro. 32 leçons portent cette compétence — Linux, Docker, Kubernetes,
> réseau, observabilité, CI/CD, IaC, FinOps — et pas une journée du cursus ne
> la porte.

C'est la même forme de défaut que V65.1 avait trouvée sur `autonomy` (aucune
source de preuve), mais du côté de l'ENSEIGNEMENT et à une tout autre échelle :
un domaine professionnel entier du métier visé est écrit, rédigé, relu — et
jamais programmé.

Répartition des 68 orphelines par compétence déclarée :
`archi` 35 · `cloud` 32 · `jsts` 17 · `se` 11 · `secu` 11 · `gitlinux` 5 ·
`http` 4 · `sql` 3 · `comm` 2 (une leçon peut porter plusieurs compétences).

**Ce défaut explique en partie le défaut de charge.** Une journée fournit
33 minutes de lecture parce qu'elle lie deux leçons en médiane, alors que la
matière existe : cinq leçons Docker sont écrites, la journée « DocSense :
dockerisation » (j. 320) n'en lie qu'une.

### Q8 bis — Le défaut de rédaction, une fois celui-là mis de côté

**Le corpus explique correctement, et n'accompagne pas.**

Ce n'est ni l'exactitude (aucune affirmation fausse relevée en deux sprints), ni
le manque d'exemples (91 % des journées hors revues en ont un complet), ni le
jargon brut (faible). Trois choses se cumulent :

1. **Le noyau juxtapose au lieu de construire.** Six sujets, six puces, aucune
   progression de l'un à l'autre. `database-modeling` explique correctement la
   normalisation, les relations, la dénormalisation, les index, les transactions
   et les contraintes — six fois, sans qu'aucune ne prépare la suivante. C'est
   une fiche de révision exacte.
2. **La correction ne corrige pas.** Elle valide (100 % de critères) et
   n'enseigne pas l'échec (24 % d'alternatives).
3. **Le contrat temporel est vide.** 270 minutes annoncées, 33 minutes de
   lecture, 111 mots pour dire quoi faire. Le produit ne dit pas ce que
   l'apprenant fait pendant les trois quarts du temps qu'il promet.

Signal secondaire, à confirmer par lecture au CP2 : la pire fenêtre de trois
lignes d'une leçon contient **8 termes marqués en médiane** (max 12), là où le
brief §2.6 place l'alerte à 5.

---

## 2. Ce que ce CP0 corrige de V66

| Affirmation V66 | Statut après vérification |
|---|---|
| « 52 revues à 3 % de leur durée » | **Trompeur.** Mesurait le temps de lecture. Les 52 revues ont 11 composants sur 11. |
| « famille A = 71 leçons à traiter » | **Mauvais découpage.** La famille ne prédit pas la qualité, dans les deux sens. |
| « contenu fourni = 25 % du temps annoncé » | **Exact**, et c'est bien le défaut n°1. |
| « 0 lien glossaire depuis les leçons » | **Corrigé en V66** ; reste à mesurer la qualité du raccordement (CP12). |

---

## 3. Sondes écartées à ce CP0 (huitième et neuvième du projet)

**FP-8 — densité de connecteurs causaux.** Classait `embeddings` — durcie en
V66, dont le noyau explique le produit scalaire, la norme et pourquoi on divise
par les deux longueurs — **dernière sur 128**. Le français explique par
juxtaposition et par le deux-points autant que par « donc ». Écartée, pas
raffinée. C'est la répétition exacte de FP-3 de V66.

**FP-9 — verbes à l'impératif.** Annonçait « médiane 1 consigne par journée,
170 journées à zéro ». Le jour 232 dit « Lis project-06.md. Définis le corpus,
les types de questions, le plan d'évaluation » : deux impératifs, aucun dans ma
liste. Une liste de verbes est ouverte ; l'allonger jusqu'à ce que le chiffre
paraisse juste est interdit. Remplacée par une mesure indépendante du
vocabulaire : les mots consacrés aux sections de travail.

---

## 4. Ce que V67 doit faire, dimensionné par ce CP0

| | Chantier | Volume réel | Priorité |
|---|---|---|---|
| **1** | **Remettre les 68 leçons orphelines sur le chemin** — dont les 32 de `cloud`, compétence à zéro journée | 68 leçons, 365 journées à examiner | **P0** |
| **2** | Contrat temporel des 365 journées | aucune n'a de charge crédible | **P0** |
| **3** | Corrections qui n'enseignent pas l'échec | 243 corrigés sous le seuil (67 %) | P1 |
| **4** | Noyaux qui juxtaposent au lieu de construire | 17 échecs objectifs + 56 drapeaux à lire | P1 |
| **5** | Notions employées avant d'être enseignées | ~20 réelles, dont 7 à plus de 100 jours | P2 |
| **6** | Revues | **pas de recomposition** — elles sont riches (11/11 composants) ; leur défaut est le chiffrage, donc le chantier 2 | — |

> **Note de cadrage, et elle engage la suite du sprint.** Le brief demande de
> « recomposer les 52 reviews » et de traiter « les 62 leçons de famille A ».
> Les deux consignes reposent sur des constats que ce CP0 a vérifiés et
> corrigés : les revues ne sont pas vides, et la famille A ne prédit pas la
> qualité. Suivre ces consignes à la lettre reviendrait à réécrire ce qui
> fonctionne pendant que 68 leçons restent hors du chemin. Le sprint traite
> donc le défaut réel, en le disant, plutôt que la cible annoncée.

---

## 4 bis. Les chiffres du chantier 1, pour dimensionner

| | |
|---|---:|
| Leçons liées depuis au moins une journée | **60 / 128** |
| Leçons orphelines | **68 / 128** |
| Compétences du programme sans aucune journée | **1** (`cloud`) |
| Journées portant la compétence `cloud` | **0 / 365** |
| Leçons liées par journée (médiane) | **2** |

---

## 5. Ce que ce CP0 ne prouve pas

- Je n'ai lu intégralement, à ce stade, que **6 leçons** (`react-fundamentals`,
  `javascript-basics`, `database-modeling`, `llm-observability`,
  `technical-storytelling`, plus les 10 lues en V66) et **3 revues**. Les
  chiffres structurels couvrent les 128 et les 365 ; les jugements de qualité
  ne couvrent que ce qui a été lu.
- Les 17 « échecs objectifs » sous-détectent, par construction et volontairement.
- Aucune mesure ici ne dit ce qu'un humain comprend. Elles disent ce qu'un texte
  contient.
