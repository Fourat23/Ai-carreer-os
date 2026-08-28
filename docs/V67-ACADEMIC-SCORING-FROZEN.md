# V67 — Barème académique gelé : 15 dimensions, ancres 1 / 3 / 5

> **Gelé au CP1, avant toute transformation.** Ni les dimensions, ni les ancres,
> ni les seuils de verdict ne changent après le CP1. Une dimension mal formée
> est **écartée et déclarée**, jamais réajustée.
>
> Les métriques sont des **sondes**, pas des verdicts. Neuf sondes ont déjà été
> écartées sur ce projet parce qu'elles mesuraient un marqueur typographique en
> croyant mesurer une substance. Chaque note ci-dessous s'appuie sur une lecture,
> pas sur un compteur.

---

## Comment une note est produite

Chaque dimension est notée **1 à 5, entier**, sur l'échantillon gelé
(`docs/V67-RANDOM-SAMPLE-FROZEN.md`), par LECTURE. Les mesures automatiques
servent à **repérer où lire**, jamais à décider.

Le score global est la **moyenne non pondérée des 15**, publiée avec le détail
dimension par dimension. Une moyenne seule n'a jamais rien prouvé.

---

## Les 15 dimensions

### D1 — Clarté
- **1** — Il faut relire une phrase sur trois pour la comprendre ; les référents sont ambigus.
- **3** — Compréhensible, mais des passages demandent un effort qui ne vient pas du sujet.
- **5** — On lit une fois et on comprend ; la difficulté vient du sujet, jamais de la phrase.

### D2 — Vulgarisation
- **1** — Aucune traduction en langage accessible ; le texte suppose le vocabulaire acquis.
- **3** — Une analogie ou une reformulation, mais sans limite énoncée, ou trop rare.
- **5** — Chaque notion abstraite est ramenée à quelque chose que le lecteur possède déjà, et l'analogie annonce où elle cesse d'être vraie.

### D3 — Modèle mental
- **1** — Aucune image mentale ; une suite de faits.
- **3** — Un modèle est proposé mais n'est pas réutilisé ensuite.
- **5** — Un modèle explicite, correct, et qui SERT à raisonner dans la suite de la leçon.

### D4 — Profondeur explicative
- **1** — Le mécanisme est nommé, jamais exposé. Échoue au test des mots-clés.
- **3** — Le mécanisme est exposé pour la notion principale, survolé pour les autres.
- **5** — On comprend ce qui se passe réellement, y compris pourquoi le comportement surprend.

### D5 — Progression conceptuelle
- **1** — Sujets juxtaposés ; aucun ne prépare le suivant.
- **3** — Un ordre raisonnable, mais les transitions sont implicites.
- **5** — Chaque notion s'appuie sur la précédente, et la transition est écrite.

### D6 — Qualité des exemples
- **1** — Un exemple cité, jamais déroulé.
- **3** — Un exemple complet, mais sans le raisonnement qui y mène.
- **5** — Énoncé, raisonnement, solution, et une variante qui déplace le problème.

### D7 — Qualité des exercices
- **1** — Un seul exercice, autonome, sans marche d'approche.
- **3** — Un exercice guidé et un exercice autonome, sans gradation entre eux.
- **5** — Une échelle réelle : reconnaître, expliquer, compléter, modifier, produire, déboguer.

### D8 — Qualité des corrections
- **1** — La réponse, sans plus.
- **3** — La réponse et un critère de vérification.
- **5** — La démarche, l'erreur probable et pourquoi elle séduit, une alternative, un critère vérifiable seul.

### D9 — Transfert
- **1** — Rien au-delà du cas traité.
- **3** — Une question d'entretien ou un cas métier, sans mise en situation.
- **5** — Une tâche qui applique la notion à un contexte non traité dans la leçon.

### D10 — Charge pédagogique réelle
- **1** — La durée annoncée n'a aucun rapport avec le travail décrit.
- **3** — Le travail est décrit, mais sa durée ne l'est pas.
- **5** — L'apprenant sait ce qu'il fait, dans quel ordre, et à quoi il reconnaît que c'est fini.

### D11 — Cohérence avec les prérequis
- **1** — La leçon exige des notions qu'elle ne cite pas et que rien n'a enseignées.
- **3** — Les prérequis sont déclarés, mais une ressource citée ne contient pas la notion citée.
- **5** — Tout ce qui est exigé a été enseigné avant, ou est défini sur place.

### D12 — Gestion du jargon
- **1** — Termes empilés sans construction ; plus de 5 termes marqués en trois lignes, plusieurs fois.
- **3** — Le vocabulaire est marqué et souvent défini, mais certains termes restent orphelins.
- **5** — Chaque terme apparaît quand son contexte le rend nécessaire, et il est atteignable.

### D13 — Exactitude technique
- **1** — Une affirmation fausse.
- **3** — Exact, mais une simplification pourrait induire une erreur non signalée.
- **5** — Exact, et les simplifications sont signalées comme telles.

### D14 — Rétention / récupération active
- **1** — Rien à produire ; on lit et on passe.
- **3** — Une checklist ou un quiz à réponse visible.
- **5** — Une production est demandée AVANT que la réponse soit accessible, et la notion revient plus tard.

### D15 — Utilité professionnelle
- **1** — Aucun lien avec ce qu'on fait dans un vrai poste.
- **3** — Un cas métier cité.
- **5** — La notion est située dans une décision professionnelle réelle, avec ses compromis.

---

## Seuils de verdict — gelés

`ACADEMIC_QUALITY_READY` exige **toutes** les conditions suivantes :

| | Condition |
|---|---|
| 1 | 0 leçon restant dans la famille académique insuffisante |
| 2 | Les 128 leçons passent le contrat structurel, ou portent une justification explicite |
| 3 | Les 52 revues sont de véritables expériences de consolidation |
| 4 | Les 365 journées exposent un travail concret |
| 5 | Aucun jour annoncé 4–5 h ne repose sur moins de 90 min de matière sans activité autonome concrète |
| 6 | Audit gelé **≥ 4,2 / 5** |
| 7 | Aucune dimension **< 4,0** |
| 8 | D1 Clarté **≥ 4,3** |
| 9 | D2 Vulgarisation **≥ 4,3** |
| 10 | D4 Profondeur **≥ 4,2** |
| 11 | D7 Exercices **≥ 4,0** |
| 12 | D8 Corrections **≥ 4,0** |
| 13 | D10 Charge **≥ 4,2** |
| 14 | Le second échantillon aveugle est cohérent avec le premier |
| 15 | Aucun P0 académique |
| 16 | Aucune donnée pédagogique inventée |
| 17 | Les tests négatifs voient réellement les régressions |

`ACADEMIC_QUALITY_CANDIDATE` : moyenne **≥ 3,6**, aucune dimension **< 3,0**, et
aucun P0 académique ouvert.

`ACADEMIC_QUALITY_NOT_READY` : tout le reste.

**Si une condition échoue, le verdict n'est pas promu.** Aucune exception, et
aucune renégociation d'un seuil après mesure.

---

## Condition 3 — précision inscrite au gel

Le CP0 a mesuré que les 52 revues portent déjà **11 composants sur 11** de la
grille du brief. La condition 3 est donc considérée comme **satisfaite à
l'entrée du sprint sur le fond**, et reste à satisfaire sur **le chiffrage du
travail** (condition 4). Cette précision est écrite AVANT la mesure finale pour
qu'on ne puisse pas la présenter après coup comme un succès de V67.
