# V75 — Protocole de validation humaine de l'apprentissage

> **Ce document décrit une étude. Il n'en rapporte aucune.**
>
> `REAL_HUMAN_LEARNING_EVIDENCE = NOT YET MEASURED` — inchangé depuis V72, et
> **V75 ne le change pas**. Aucun participant n'a été recruté, aucune session
> n'a été conduite, aucun résultat n'existe.
>
> Ce qui change avec le CP12 : le protocole est **exécutable plus tard**, et le
> produit sait enregistrer ce qu'il faudrait enregistrer.

---

## 1. Pourquoi un protocole, et pas simplement « plus de télémétrie »

Le produit sait déjà enregistrer des tentatives de rappel, d'exercice et de
transfert. Ce qu'il ne sait pas faire, c'est **isoler l'effet d'un
apprentissage**. Trois ambiguïtés le lui interdisent :

| sans… | une réussite peut signifier |
|---|---|
| **mesure avant** | « j'ai appris » **ou** « je le savais déjà » |
| **délai** | « je retiens » **ou** « c'est encore en mémoire de travail » |
| **transfert** | « je comprends » **ou** « j'ai retenu la forme de la question » |

Les sept étapes existent pour lever ces trois ambiguïtés. **Aucune n'est
décorative**, et aucune n'est ajoutée « au cas où ».

---

## 2. Les sept étapes

```
PRETEST → LEARNING → IMMEDIATE_RETRIEVAL → DELAY
        → DELAYED_RETRIEVAL → TRANSFER → CONFUSION_REPORT
```

| étape | ce qu'elle mesure | ce qu'elle lève |
|---|---|---|
| `PRETEST` | ce qui est déjà su **avant** la séance | l'illusion du gain |
| `LEARNING` | la séance : lu, tenté, corrigé | — (contexte) |
| `IMMEDIATE_RETRIEVAL` | restitution immédiate | plafond haut, **valeur faible** |
| `DELAY` | le temps écoulé | la mémoire de travail |
| `DELAYED_RETRIEVAL` | ce qui **reste** | **la seule mesure qui intéresse** |
| `TRANSFER` | reconnaissance hors contexte | la mémorisation de la forme |
| `CONFUSION_REPORT` | ce que l'apprenant **dit** ne pas comprendre | *(déclaratif, nommé comme tel)* |

**Délai minimal : `DELAI_MINIMAL_H = 24`.** Déclaré, pas mesuré — un rappel le
même jour ne distingue pas la mémoire durable de la mémoire de travail, ce qui
est précisément la raison d'être de l'étape `DELAY`.

---

## 3. Hypothèses

Elles sont écrites pour pouvoir être **réfutées**.

- **H1** — un rappel actif différé prédit mieux la rétention à un mois qu'une
  compréhension auto-déclarée. *(Le produit est construit sur cette hypothèse
  depuis V66 ; elle n'a jamais été testée sur un humain.)*
- **H2** — l'écart `IMMEDIATE_RETRIEVAL − DELAYED_RETRIEVAL` est un meilleur
  signal de fragilité que le nombre de tentatives.
- **H3** — la réussite d'un défi de transfert T4/T5 n'est pas prédite par la
  réussite aux exercices de la même notion. *(Si elle l'était, les défis
  n'apporteraient rien et il faudrait le dire.)*
- **H4** — le mode de récupération réduit l'arriéré bloquant sans réduire la
  quantité de nouveau contenu réellement acquis.

---

## 4. Métriques

| métrique | définition | grain |
|---|---|---|
| gain immédiat | `IMMEDIATE_RETRIEVAL` − `PRETEST` | concept |
| **rétention différée** | `DELAYED_RETRIEVAL` − `PRETEST` | concept |
| **décroissance** | `IMMEDIATE_RETRIEVAL` − `DELAYED_RETRIEVAL` | concept |
| taux de transfert | défis réussis / défis tentés | compétence |
| écart déclaré/observé | compréhension déclarée vs `DELAYED_RETRIEVAL` | concept |
| aide consultée | correction ouverte **avant** la réponse | tentative |

Aucune de ces métriques n'est un « score de mémoire ». Ce sont des
**différences entre deux mesures observées**, et elles portent le nom de ce
qu'elles soustraient.

---

## 5. Ce qui est enregistré

Un événement d'étude, et rien d'autre :

| champ | source | note |
|---|---|---|
| `at` | **horloge serveur** | jamais le client |
| `studySessionId` | la session d'étude | opt-in, révocable |
| `stage` | l'une des **sept** étapes | vocabulaire fermé |
| `conceptIds[]` | les notions concernées | **cardinalité réelle** |
| `outcome` | `success` · `partial` · `failure` · `skipped` | fermé |
| `durationMs` | **mesuré ou `null`** | voir §6 |
| `helpConsulted` | correction ouverte avant la réponse | règle R-b de V74 |
| `note` | texte libre, pour `CONFUSION_REPORT` | **déclaratif** |
| `provenance` | obligatoire | contrat du CP2 |
| `schemaVersion` | `2` | contrat du CP2 |

---

## 6. Ce qui n'est **pas** enregistré

Écrit pour être **vérifiable**, pas pour rassurer — `NON_COLLECTE` est exporté
par le module et lisible par une porte.

- aucune frappe, aucun mouvement de souris, aucun défilement ;
- **aucune durée de lecture estimée à partir du temps passé sur une page** —
  cela mesure surtout les onglets laissés ouverts. La durée est **mesurée par le
  protocole ou absente** ; `null` est une réponse ;
- aucun identifiant de machine, de navigateur, de réseau ou de localisation ;
- **aucune comparaison entre apprenants, aucun percentile, aucun classement** ;
- aucun envoi vers un tiers — les faits restent dans le fichier de progression
  local ;
- aucune inférence de niveau, de vitesse d'apprentissage ou de potentiel.

---

## 7. Données personnelles

**Local et personnel par défaut.** Le produit écrit dans un fichier de
progression sur la machine de l'apprenant ; il n'existe aucun serveur
d'analytique, et le CP12 n'en crée pas.

| question | réponse |
|---|---|
| où est-ce stocké ? | dans la progression locale, à côté des autres faits |
| comment l'exporter ? | par la sauvegarde existante (`/backup`), qui exporte la progression entière |
| **comment le supprimer ?** | en supprimant la session d'étude : les événements portent tous son `studySessionId` |
| qui y a accès ? | l'apprenant, et personne d'autre |
| que se passe-t-il si je refuse ? | **rien** — le parcours est identique, le mode est opt-in |

---

## 8. Mode « étude » — opt-in, non bloquant, isolé

Quatre exigences, et elles sont cumulatives :

1. **opt-in** — rien n'est enregistré tant qu'une session d'étude n'est pas
   explicitement ouverte ;
2. **non bloquant** — le parcours fonctionne exactement à l'identique sans lui ;
3. **identifiable** — chaque événement porte son `studySessionId` ;
4. **isolé** — les événements d'étude **n'entrent dans aucune projection du
   produit** : ni rétention, ni compétence, ni arriéré, ni plan.

Le point 4 est le plus important et le plus facile à perdre de vue : si les
données d'étude nourrissaient le moteur, **l'observation modifierait ce qu'elle
observe**, et la mesure ne vaudrait plus rien.

---

## 9. Procédure

### Avant

1. recruter des participants — **ce document n'en recrute aucun** ;
2. obtenir un consentement écrit couvrant §5, §6 et §7 ;
3. figer les hypothèses **avant** de voir la moindre donnée. Les ajuster après
   coup serait exactement le contournement `G11` que V74 a nommé.

### Pendant

4. `PRETEST` sur les notions ciblées, **avant** toute exposition ;
5. `LEARNING` — la séance normale du produit, sans modification ;
6. `IMMEDIATE_RETRIEVAL` à la fin de la séance ;
7. `DELAY` — **au moins 24 h**, et la durée réelle est enregistrée, pas supposée ;
8. `DELAYED_RETRIEVAL` sur les mêmes notions, **mêmes formes de question** ;
9. `TRANSFER` — un défi T4/T5 sur une notion travaillée ;
10. `CONFUSION_REPORT` — ce que la personne dit ne pas comprendre, dans ses mots.

### Après

11. publier **l'effectif, les abandons et les données manquantes** avant les
    résultats ;
12. publier les hypothèses **réfutées** aussi visiblement que les confirmées.

---

## 10. Biais et limites, déclarés d'avance

| biais | pourquoi il menace cette étude |
|---|---|
| **auto-sélection** | qui accepte une étude sur l'apprentissage est déjà motivé |
| **effet de test** | `PRETEST` est lui-même un apprentissage — il gonfle le post-test |
| **familiarité de forme** | mêmes questions aux deux rappels ⇒ on peut retenir la question |
| **effectif** | un produit personnel ne réunit pas des centaines de participants |
| **absence de témoin** | sans groupe sans réactivation, on mesure un apprentissage, pas l'effet du produit |
| **déclaratif** | `CONFUSION_REPORT` est une parole, pas une observation — et reste nommé ainsi |
| **Hawthorne** | savoir qu'on est observé change le travail fourni |

**La plus lourde est l'absence de témoin.** Sans groupe de comparaison, ce
protocole peut montrer que des gens apprennent **avec** AI Career OS ; il ne peut
pas montrer qu'ils apprennent **grâce à** lui. Le dire maintenant évite de le
découvrir en lisant les résultats.

---

## 11. Ce que ce protocole ne pourra jamais montrer

- **qu'une compétence est acquise** — il mesure du rappel et du transfert sur
  des notions, pas une compétence professionnelle ;
- **qu'un apprenant est prêt pour un emploi** — aucune étape ne s'en approche ;
- **une causalité** sans groupe témoin ;
- **une généralisation** à partir d'un effectif de produit personnel.

---

## 12. État

| | |
|---|---|
| protocole | **écrit et instrumenté** |
| participants | **aucun** |
| sessions conduites | **aucune** |
| résultats | **aucun** |
| `REAL_HUMAN_LEARNING_EVIDENCE` | **`NOT YET MEASURED`** |

Le module `lib/study-protocol.mjs` rend `conclusionPossible: false` **en
permanence**, quel que soit l'état d'une session. Ce champ n'est pas une
précaution de style : il existe pour qu'aucune surface, aucun rapport et aucune
lecture pressée n'ait à déduire ce qu'une session d'étude autorise à conclure.

**Réponse : rien.**
