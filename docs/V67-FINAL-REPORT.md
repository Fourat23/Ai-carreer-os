# V67 — ACADEMIC CURRICULUM HARDENING I · Rapport final

> Question centrale du sprint : **les cours enseignent-ils réellement à un être
> humain, ou sont-ils des fiches techniques pleines de mots-clés ?**
>
> Consigne reçue : « Ne cherche PAS à me donner raison. »

---

## A · Verdict

# `ACADEMIC_QUALITY_CANDIDATE`

`ACADEMIC_QUALITY_READY` n'est **pas** prononcé. Quatre des dix-sept conditions
gelées échouent, et l'une d'elles — la première — échoue franchement.

| | Condition gelée | État |
|---|---|---|
| 1 | 0 leçon restant dans la famille académique insuffisante | ❌ **23 leçons C sans clôture** |
| 2 | 128 leçons passent le contrat, ou portent une justification | ⚠️ partiel, dettes déclarées |
| 3 | Les 52 revues sont de véritables expériences de consolidation | ✅ |
| 4 | Les 365 journées exposent un travail concret | ✅ 365/365 |
| 5 | Aucun jour 4–5 h sous 90 min sans activité autonome | ✅ 0 violation |
| 6 | Audit gelé ≥ 4,2 / 5 | ❌ **3,93** |
| 7 | Aucune dimension < 4,0 | ❌ **D12 jargon = 3** |
| 8 | D1 Clarté ≥ 4,3 | ❌ 4 |
| 9 | D2 Vulgarisation ≥ 4,3 | ❌ 4 |
| 10 | D4 Profondeur ≥ 4,2 | ❌ 4 |
| 11 | D7 Exercices ≥ 4,0 | ✅ 4 |
| 12 | D8 Corrections ≥ 4,0 | ✅ 4 |
| 13 | D10 Charge ≥ 4,2 | ❌ 4 |
| 14 | Échantillon aveugle cohérent avec le primaire | ⚠️ cohérent, et **plus bas** |
| 15 | Aucun P0 académique | ✅ |
| 16 | Aucune donnée pédagogique inventée | ✅ |
| 17 | Les tests négatifs voient les régressions | ✅ 5/5 + 1 aveuglement publié |

`ACADEMIC_QUALITY_CANDIDATE` exige moyenne ≥ 3,6, aucune dimension < 3,0, aucun
P0 ouvert. **3,93 · minimum 3 · aucun P0.** Le seuil est atteint, et il l'est de
justesse.

---

## B · La réponse à la question posée

**Non, les cours n'étaient pas majoritairement des fiches de mots-clés.** Et ce
n'était pas non plus le vrai problème.

Le CP0 et le CP2 ont trouvé un défaut d'une autre nature, plus grave, que la
question ne visait pas :

> **68 des 128 leçons n'étaient programmées par aucune des 365 journées — dont
> les DOUZE leçons de famille B, c'est-à-dire les mieux écrites du corpus.**

Sept des dix plus gros noyaux explicatifs étaient inatteignables depuis le
parcours. Seize des dix-sept leçons échouant objectivement au contrat étaient, à
l'inverse, sur le chemin. Autrement dit : **le corpus contenait déjà d'excellents
cours, et le parcours ne visitait que les minces.**

La cause était mécanique, ni éditoriale ni pédagogique : `LESSON_BY_SKILL` ne
couvrait que 56 leçons sur 128, aucune journée ne portait la compétence `cloud`,
et le mécanisme d'échappement prévu (`DAYS_ENRICH.lessons`) n'était utilisé nulle
part pour ces 68 leçons.

Un second constat a corrigé mon propre CP0. La famille éditoriale ne prédit pas
la qualité de l'explication — `react-fundamentals` est A et excellent,
`nextjs-foundations` est C et creux — **mais elle prédit à 44 sur 45 si la leçon
CLÔTURE.** Les 45 leçons de famille C étaient privées des quatre mêmes fonctions
(correction, cas professionnel, transfert, récupération active) ; aucune leçon A
ni B ne présentait ce trou. La famille C n'est pas un style : c'est un lot de
génération produit sans la moitié finale de la leçon.

---

## C · Ce qui a été fait

| Chantier | Avant | Après |
|---|---|---|
| Leçons non programmées | 68 | **25**, toutes déclarées comme référence facultative |
| Échecs objectifs du contrat | 17 | **1**, déclaré |
| Leçons C avec clôture complète | 1/45 | **22/45** |
| Renvois « leçon de fond » incohérents | 38 | **0** |
| Revues liant les leçons de leur semaine | 0/52 | **52/52** |
| Journées à activité autonome concrète | — | **365/365** |
| Violations de la condition 5 | 1 | **0** |
| Leçons au gabarit complet (depth-check) | 71 | **93** |

**33 leçons traitées**, chacune sur ses défauts lus, jamais sur un gabarit. Les
gains de noyau vont de +140 à +500 mots et sont tous justifiés par un mécanisme
qui manquait, jamais par un quota :

- `structured-outputs-tools` 144 → 645 : la leçon la plus programmée du corpus
  (36 journées) disait « on impose un schéma » sans distinguer les **trois**
  mécanismes aux garanties opposées, et laissait croire qu'un schéma garantit la
  justesse — `{"montant": 4200}` est parfaitement conforme sur une facture de 42 €.
- `model-evaluation` 172 → 623 : deuxième leçon la plus programmée, elle nommait
  précision, rappel, F1 et AUC **sans jamais en calculer une seule**.
- `error-handling` 197 → 509 : elle exigeait de ne réessayer que les opérations
  idempotentes sans définir l'idempotence, et listait *circuit breaker* dans son
  vocabulaire sans l'expliquer nulle part.
- `technical-storytelling` 148 → 650 : STAR était nommé, ses quatre lettres
  développées, et **aucun récit STAR n'était jamais montré**.

---

## D · Le contrat temporel

Les 365 journées annonçaient **toutes** 4,5 h — jour 1 (installer son
environnement) comme jour 232 (évaluer un pipeline RAG).

La lecture corrige l'accusation facile : ce n'est pas une estimation ratée, c'est
l'**engagement quotidien** que le programme demande, et le contenu est
dimensionné pour le remplir. Le défaut n'était pas le chiffre, c'était que rien
ne disait laquelle des deux choses il était.

La journée affiche désormais deux grandeurs qu'on ne peut plus confondre :
**Engagement 4,5 h** et **Dont lecture ~N min**, calculée depuis le contenu réel
avec le modèle publié au CP0 et jamais réajusté. Sur l'année : **242 h de lecture
mesurée contre 1 642 h d'engagement**. Le reste est du travail autonome, décrit
par un livrable et des critères, et qu'on se garde de chiffrer faussement.

---

## E · Ce que le navigateur a trouvé et que dix checkpoints de lecture avaient manqué

Huit natures de journée × cinq largeurs = 40 vérifications.

**Les 52 revues ne liaient aucune leçon.** Une journée dont l'objet est de
réviser une semaine n'offrait aucun chemin vers ce qu'il faut réviser. Corrigé
sans rien inventer : les leçons d'une revue sont l'union de celles que les
journées de sa semaine ont réellement liées.

Résultat final : **0 échec sur 40** — engagement et lecture visibles et
distincts, leçons cliquables, aucun débordement horizontal, **aucune violation
d'accessibilité sérieuse ou critique**, aucune erreur JavaScript.

---

## F · Tests négatifs — le contrôle rougit-il vraiment ?

**5 régressions sur 5 détectées**, plus **un aveuglement confirmé et publié**.

| Sabotage | Détecté |
|---|---|
| Modèle mental supprimé | ✅ la grammaire signale la fonction absente |
| 12 termes marqués injectés en 3 lignes | ✅ soupe 8 → 15 |
| Journée vidée, durée inchangée | ✅ condition 5 : 0 → 1 violation |
| Revue privée de ses tests | ✅ 52/52 → 51/52 |
| Rattachement V67 retiré | ✅ 25 → **68** orphelines |
| Correction réduite à « voir la solution » | 📎 **NON détecté** |

Le dernier est le plus instructif et il est conservé comme tel : en gardant
l'intertitre et en vidant le corps, la grammaire continue de compter la fonction
« correction » comme présente. **Elle lit des titres, pas de la substance.**
C'est précisément pourquoi le barème gelé note les quinze dimensions PAR LECTURE
et ne se sert des compteurs que pour savoir où lire. Le publier vaut mieux que
fabriquer un contrôle qui prétendrait voir ce qu'il ne voit pas.

Le sabotage du rattachement vaut aussi comme preuve : retirer `LESSONS_V67`
ramène le compte à 68. Les 43 rattachements sont réels.

---

## G · Notation des quinze dimensions

Échantillon primaire gelé au CP1 (seed 20260901), rejoué à l'identique.

| | Dimension | Avant | Après | Ce qui a bougé |
|---|---|---|---|---|
| D1 | Clarté | 3 | 4 | — |
| D2 | Vulgarisation | 3 | 4 | analogies désormais bornées (async, JS, observabilité) |
| D3 | Modèle mental | 3 | 4 | — |
| D4 | Profondeur | 3 | 4 | idempotence, disjoncteur, event loop, métriques calculées, fuite de données |
| D5 | Progression | 3 | 4 | rappels explicites vers des journées antérieures |
| D6 | Exemples | 3 | 4 | exemples guidés devenus des suites de décisions |
| D7 | Exercices | 3 | 4 | — |
| D8 | Corrections | 2 | 4 | erreur probable + pourquoi elle séduit + alternative + critère vérifiable seul |
| D9 | Transfert | 3 | 4 | questions d'entretien réelles |
| D10 | Charge | 2 | 4 | engagement et lecture séparés ; 365/365 avec activité concrète |
| D11 | Prérequis | 4 | 4 | déjà bon |
| D12 | **Jargon** | 3 | **3** | **RRF déplié, mais la densité médiane reste à 8-9 termes marqués** |
| D13 | Exactitude | 4 | 4 | — |
| D14 | Récupération | 2 | 4 | production demandée avant la réponse, checklists |
| D15 | Utilité pro | 3 | 4 | incidents réels avec leur règle de décision |
| | **Moyenne** | **2,93** | **3,93** | |

**D12 n'a pas bougé, et c'est le point dur.** La densité de termes marqués reste
à 8 en médiane et 12 au maximum, très au-dessus du seuil d'alerte de 5 énoncé
par le brief. Déplier RRF dans `rag-fundamentals` a traité un cas ; il en reste
beaucoup. C'est la principale raison pour laquelle le verdict n'est pas promu.

---

## H · L'échantillon aveugle

Ouvert pour la première fois au CP14 (seed 20260902, publiée au CP1).

**Il est cohérent avec le primaire, et il est plus bas.** C'est le résultat
attendu d'un contrôle honnête, et il mérite d'être lu littéralement : sur ses
20 leçons, **trois seulement** ont été traitées par V67. Le reste — Kubernetes,
Linux, réseau, Docker, CI/CD, Next.js — appartient au stock non traité.

| | Primaire | Aveugle |
|---|---|---|
| Clôture complète | 12/20 | 16/20 |
| Non programmées | 4/20 | **7/20** |
| Noyau médian | 412 mots | **320 mots** |
| Échecs objectifs | 0 | 0 |

L'aveugle affiche paradoxalement une meilleure clôture, parce qu'il est dominé
par des leçons de famille A — qui n'ont jamais eu ce trou. Il affiche en revanche
**sept leçons hors parcours sur vingt**, contre quatre, et un noyau médian
inférieur de 92 mots.

**Lecture honnête : V67 a traité une partie du corpus, pas le corpus.** L'audit
aveugle le montre sans ambiguïté, et c'est exactement ce pour quoi il avait été
gelé avant le sprint.

---

## I · Dette restante, déclarée

1. **23 leçons de famille C sans clôture** — 15 sur le parcours (une journée
   chacune) et 8 sur l'étagère de référence. C'est la condition 1, et elle
   échoue. Le stock a été réduit de 44 à 23, pas éliminé.
2. **25 leçons non programmées**, déclarées dans `REFERENCE_LIBRE` : Kubernetes
   (6), fournisseurs cloud et IaC (7), Next.js (4), CSS et responsive (4),
   déploiement progressif et reprise d'incident (2), services systemd et accès
   distant (2). Les combler demanderait d'**ajouter des journées** au parcours —
   décision sur le programme lui-même, hors périmètre de V67.
3. **`typescript-frontend`** reste sous le seuil de prose (165 mots hors code sur
   354). Elle enseigne par du code commenté ; je ne l'ai pas allongée pour
   satisfaire un compteur.
4. **D12 jargon** : densité médiane de 8 termes marqués par fenêtre de trois
   lignes.
5. **La compétence `cloud` n'a toujours aucune journée** sur 365.

---

## J · Sondes fausses écartées pendant ce sprint

Le projet en avait écarté neuf. V67 en ajoute **quatre**, toutes publiées avec
leurs chiffres successifs et leur cause exacte.

| # | Sonde | Chiffre annoncé | Pourquoi elle était fausse |
|---|---|---|---|
| 10 | Renvois incohérents, découpés sur les virgules | « 42 journées » | « HTTP, REST et JSON » est **un** titre, coupé en deux. Vrai chiffre : 38 |
| 11 | Orphelins du glossaire, champ `term` seul | « 274 » | `term` est en anglais, le corpus en français ; 586 des 711 entrées ont des alias jamais lus |
| 12 | Orphelins, tout le corpus | « 152 » | `webhook` présent au **pluriel** ; frontière de mot rejetée |
| 13 | Premier emploi d'un terme | « REST, jour 9 » | La casse insensible confond REST, le style d'API, avec `rest`, le paramètre JavaScript |

Deux autres fautes ont été attrapées dans les harnais eux-mêmes : un `$` en
drapeau `m` qui arrêtait chaque section à la fin de son propre titre (d'où
« 0/365 livrables » sur un corpus qui en a 313), et un `\w{20,}` qui exigeait
vingt caractères de mot **consécutifs**. Les deux ont été trouvées parce qu'elles
contredisaient une lecture faite quelques minutes plus tôt — jamais par un
compteur.

**Le CP12 ne fonde aucun chantier sur ses chiffres.** Trois de ses quatre mesures
sont écartées : une quatrième correction aurait demandé de gérer pluriels,
accords, casse significative et homonymes entre domaines, c'est-à-dire d'itérer
une expression régulière jusqu'à ce qu'elle soit d'accord avec ce que je voulais
trouver.

---

## K · Intégrité

| | |
|---|---|
| `data/progress.json` | **inchangé**, `73c1ee39a255c87972f4f42b36873b1081081d6f278bd767089c0cef1fc6e7a6` |
| Générateur | idempotent, 795 fichiers, 0 dérive |
| `gates:active` | **46/46 vert** |
| Tests | **1 420 / 1 420** |
| `tsc` | 0 erreur · `build` OK |
| `v66:render` | 950 fichiers, aucun contenu perdu au rendu |
| Gel du corpus | re-gelé `e34b1c76` → `7c9db74f`, justification inscrite dans les 9 gates |
| Ordre des 365 journées | **inchangé** |
| Identifiants publics et routes | **inchangés** |

Aucune journée n'a été déplacée, aucune n'a été réécrite pour accueillir une
leçon, aucune durée n'a été inventée, aucun résultat de test n'a été fabriqué.

---

## L · Ce que je referais autrement

**J'ai traité le stock dans le mauvais ordre.** J'ai commencé par les fondations
— domaine le plus lu, choix défendable — alors que la mesure disait déjà que les
deux leçons les plus programmées du corpus (`structured-outputs-tools` et
`model-evaluation`, 36 et 31 journées) étaient parmi les plus minces. Les traiter
en premier aurait servi plus d'apprenants, plus tôt.

**J'ai failli publier un chiffre faux sur 365 pages.** Le temps de lecture
calculé sur la seule page de la journée donnait 9 minutes en médiane. Exact, et
trompeur, puisque la journée envoie explicitement lire ses leçons. Je m'en suis
aperçu parce que le chiffre contredisait mon propre CP0 — pas parce que je l'avais
vérifié.

**Le navigateur a trouvé en quarante vérifications ce que dix checkpoints de
lecture n'avaient pas vu.** Les 52 revues sans lien de leçon étaient visibles
depuis le début dans les fichiers ; personne, moi compris, ne les a regardées
sous l'angle « qu'est-ce qu'un apprenant peut cliquer ». C'est un argument pour
faire la validation navigateur plus tôt, pas en avant-dernier checkpoint.
