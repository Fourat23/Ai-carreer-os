# V76 · CP12 — Les douze parcours réels, rejoués après les CP3 → CP11

> Rejouable : `node scripts/v76/cp12-e2e.mjs` · résultats bruts :
> `docs/v76/cp12-e2e.json` · mesure AVANT : `docs/v76/cp0-e2e.json`.

## 1 · Pourquoi rejouer, et avec quel instrument

Le CP0 avait joué douze parcours complets — un par famille de runtime, plus les
cas structurellement différents — et obtenu **12/12**. Depuis, neuf checkpoints
ont modifié l'exécution elle-même :

| CP | ce qui a changé sous les pieds des douze |
|---|---|
| CP3 | deux grammaires d'éditeur en plus |
| **CP5** | **toute l'exécution passe par `unshare` ; Python entre dans une racine minimale en chroot** |
| CP6 | un diagnostic est calculé sur chaque échec |
| CP7 | chaque aide servie devient un fait |
| CP8 | la page de transfert ne sert plus les réponses |
| CP9 | une sauvegarde périmée est refusée en 409 |
| CP10 | chaque lancement écrit un journal |
| CP11 | une réussite n'écrit plus qu'une preuve |

Le plus dangereux est le CP5. Une frontière d'exécution qui tient sur `node-js`
peut très bien céder sur `python-ds`, et *« ça marchait au CP5 »* n'est pas une
mesure d'aujourd'hui.

**Le script du CP12 n'est pas une réécriture** : il importe `choisirDouze` et
`parcours` depuis `cp0-e2e.mjs`. Une comparaison n'a de valeur que si les deux
côtés ont été mesurés par le même instrument — un instrument réécrit entre deux
mesures mesure surtout sa réécriture.

## 2 · La boucle pédagogique, exercice par exercice

Chaque exercice est joué en entier : ouvrir → soumettre le fichier de départ
(que l'énoncé déclare faux) → lire le retour → appliquer la référence →
re-soumettre → vérifier les faits écrits sur le disque → réinitialiser.

| exercice | runtime | ouvre | échoue | échec persisté | réussit | réussite persistée | preuve | reset |
|---|---|---|---|---|---|---|---|---|
| `a11y-accessible-name` | node-js | ✅ | ✅ 2/5 | ✅ | ✅ 5/5 | ✅ | ✅ | ✅ |
| `dl-forward-2layer` | **python-ds** | ✅ | ✅ 0/3 | ✅ | ✅ 3/3 | ✅ | ✅ | ✅ |
| `agent-detect-loop` | python3 | ✅ | ✅ 1/3 | ✅ | ✅ 3/3 | ✅ | ✅ | ✅ |
| `eval-groundedness-proxy` | python3 | ✅ | ✅ 1/3 | ✅ | ✅ 3/3 | ✅ | ✅ | ✅ |
| `react-avatar` | react-tsx | ✅ | ✅ 1/3 | ✅ | ✅ 3/3 | ✅ | ✅ | ✅ |
| `ds-stack` | typescript | ✅ | ✅ 0/3 | ✅ | ✅ 3/3 | ✅ | ✅ | ✅ |
| `web-card` | web | ✅ | ✅ 0/5 | ✅ | ✅ 5/5 | ✅ | ✅ | ✅ |
| `greeting` | node-js | ✅ | ✅ 0/2 | ✅ | ✅ 2/2 | ✅ | ✅ | ✅ |
| `react-counter` | react-tsx | ✅ | ✅ 2/3 | ✅ | ✅ 3/3 | ✅ | ✅ | ✅ |
| `agent-excessive-agency` | node-js | ✅ | ✅ 1/3 | ✅ | ✅ 3/3 | ✅ | ✅ | ✅ |
| `web-counter` | web | ✅ | ✅ 2/4 | ✅ | ✅ 4/4 | ✅ | ✅ | ✅ |
| `system-design-diagnose` | node-js | ✅ | ✅ 1/7 | ✅ | ✅ 7/7 | ✅ | ✅ | ✅ |

**Les six runtimes passent, isolation comprise.** Les `python3` et `python-ds`
s'exécutent dans une racine minimale en chroot et réussissent leurs tests avec
les mêmes scores qu'au CP0.

## 3 · CP0 → CP12, chiffre à chiffre

| exercice | ouverture | échec | réussite | scores |
|---|---|---|---|---|
| `a11y-accessible-name` | 120 → 117 ms | 233 → 205 ms | 66 → 61 ms | identiques |
| `dl-forward-2layer` | 5 → 3 ms | **1693 → 1207 ms** | 185 → 149 ms | identiques |
| `agent-detect-loop` | 10 → 3 ms | 97 → 96 ms | 57 → 71 ms | identiques |
| `eval-groundedness-proxy` | 4 → 3 ms | 61 → 71 ms | 58 → 69 ms | identiques |
| `react-avatar` | 4 → 2 ms | **1582 → 1181 ms** | **1046 → 749 ms** | identiques |
| `ds-stack` | 4 → 2 ms | 181 → 116 ms | 177 → 137 ms | identiques |
| `web-card` | 4 → 3 ms | 71 → 58 ms | 68 → 54 ms | identiques |
| `greeting` | 4 → 3 ms | 73 → 89 ms | 71 → 72 ms | identiques |
| `react-counter` | 5 → 3 ms | **1148 → 984 ms** | **1460 → 1084 ms** | identiques |
| `agent-excessive-agency` | 4 → 3 ms | 148 → 49 ms | 105 → 89 ms | identiques |
| `web-counter` | 4 → 3 ms | 140 → 59 ms | 90 → 52 ms | identiques |
| `system-design-diagnose` | 10 → 4 ms | 68 → 55 ms | 75 → 49 ms | identiques |

### Les scores sont identiques sur les douze

C'est la ligne qui compte le plus. Les mêmes fichiers de départ échouent avec
exactement les mêmes compteurs qu'au CP0, et les mêmes références passent avec
les mêmes. **L'isolation n'a modifié aucun verdict de test.**

### Le coût de l'isolation : mesuré, et il est négatif

C'est contre-intuitif et il faut le dire prudemment. `unshare` et le chroot
ajoutent un coût réel par lancement — le CP5 l'avait annoncé. Pourtant les temps
mesurés sont **plus bas** qu'au CP0, y compris sur les deux cas lourds
(`python-ds` : −486 ms ; `react-tsx` : jusqu'à −376 ms).

**Ce que cette comparaison NE prouve pas** : que l'isolation soit gratuite. Les
deux mesures ont été prises sur la même machine mais pas sur le même serveur, à
des états de cache différents ; les temps des runtimes compilés sont dominés par
la compilation TSX et l'import de `numpy`/`pandas`, tous deux sensibles au cache
disque. Une ligne de moins de 100 ms qui bouge de 20 ms ne dit rien du tout.

**Ce qu'elle prouve** : que le coût d'isolation, quel qu'il soit, **reste sous
le bruit de mesure** de ces parcours, et donc sous le seuil de perception d'un
apprenant. C'est l'affirmation exacte que les chiffres soutiennent, et pas une
de plus.

### La ligne « fuite » 11/12 → 12/12 n'est PAS un correctif

Le fichier du CP0 porte `fuiteReference: true` sur `agent-detect-loop`. Le
rapport du CP0 ne l'a pas compté comme une fuite, et il avait raison : **c'est
un artefact de fixture**. La sonde lit l'espace de travail servi par `GET` ; sur
la fixture du CP0, cet espace contenait encore la solution laissée par une
exécution antérieure. La sonde a donc retrouvé les lignes de la référence —
dans le propre travail de l'apprenant, ce qui est parfaitement normal.

Le CP12 part d'une fixture vide et d'un `data/lab-workspaces/` effacé, donc la
ligne passe à 12/12. **Rien n'a été corrigé ; c'est la mesure qui est plus
propre.** L'écrire autrement serait s'attribuer un correctif imaginaire.

## 4 · Ce que le CP0 ne pouvait pas mesurer

| exercice | révisions | historique | refus 409 | diagnostic | aide servie | provenance | preuves |
|---|---|---|---|---|---|---|---|
| `a11y-accessible-name` | ✅ | ✅ | ✅ | `VALEUR` | `MODELE_MENTAL` | ✅ | **1** |
| `dl-forward-2layer` | ✅ | ✅ | ✅ | `RIEN_NE_PASSE` | `INDICE` | ✅ | **1** |
| `agent-detect-loop` | ✅ | ✅ | ✅ | `VALEUR` | `INDICE` | ✅ | **1** |
| `eval-groundedness-proxy` | ✅ | ✅ | ✅ | `VALEUR` | `INDICE` | ✅ | **1** |
| `react-avatar` | ✅ | ✅ | ✅ | `TYPE` | `MODELE_MENTAL` | ✅ | **1** |
| `ds-stack` | ✅ | ✅ | ✅ | `RIEN_NE_PASSE` | `SOUS_PROBLEME` | ✅ | **1** |
| `web-card` | ✅ | ✅ | ✅ | `RIEN_NE_PASSE` | `INDICE` | ✅ | **1** |
| `greeting` | ✅ | ✅ | ✅ | `RIEN_NE_PASSE` | `INDICE` | ✅ | **1** |
| `react-counter` | ✅ | ✅ | ✅ | `CAS_ISOLE` | `MODELE_MENTAL` | ✅ | **1** |
| `agent-excessive-agency` | ✅ | ✅ | ✅ | `RIEN_NE_PASSE` | `INDICE` | ✅ | **1** |
| `web-counter` | ✅ | ✅ | ✅ | `CAS_ISOLE` | `MODELE_MENTAL` | ✅ | **1** |
| `system-design-diagnose` | ✅ | ✅ | ✅ | `RIEN_NE_PASSE` | `MODELE_MENTAL` | ✅ | **1** |

Trois observations sur cette table :

- **le diagnostic n'est jamais le même par hasard.** `VALEUR` quand un test
  attend une chose et en reçoit une autre, `CAS_ISOLE` quand un seul cas cède,
  `TYPE` sur une erreur de type React, `RIEN_NE_PASSE` quand rien ne part. La
  classe `INDETERMINE` n'apparaît sur aucun des douze ;
- **l'aide servie suit le symptôme**, pas un compteur : `SOUS_PROBLEME` quand
  des tests passent déjà, `MODELE_MENTAL` quand la forme du problème manque ;
- **une seule preuve, sur les douze.** C'est la correction du CP11, vérifiée ici
  par le chemin réel et non plus sur une progression fabriquée.

## 5 · Bilan

| vérification | CP0 | CP12 |
|---|---|---|
| la boucle complète passe | 12 / 12 | **12 / 12** |
| aucune fuite de correction | 11 / 12 *(artefact)* | **12 / 12** |
| aucun attendu servi à l'ouverture | 12 / 12 | **12 / 12** |
| la remédiation est servie après l'échec | 12 / 12 | **12 / 12** |
| révisions servies (CP9) | — | **12 / 12** |
| historique servi (CP10) | — | **12 / 12** |
| sauvegarde périmée refusée (CP9) | — | **12 / 12** |
| diagnostic rendu (CP6) | — | **12 / 12** |
| provenance rendue (CP7) | — | **12 / 12** |
| **une seule preuve par réussite (CP11)** | — | **12 / 12** |

**Parcours cassés : aucun. Fuites : aucune. Preuves en double : aucune.**

## 6 · Anomalie de sonde n° 6 — ma sonde allait plus vite que l'horloge du produit

La colonne « aide servie » changeait **à chaque exécution** : tantôt une marche,
tantôt rien, et jamais sur les mêmes exercices. Deux exécutions consécutives ont
donné 4/12 puis 5/12 colonnes vides, sur des exercices différents.

Le produit n'y était pour rien. La clé métier d'une tentative (V74 §3.6) est
`exerciseId | horodatage à la SECONDE | passed/total`. Ce script rejoue le
fichier de départ quelques centaines de millisecondes après que `parcours` l'a
déjà fait : **même clé**, donc tentative dédupliquée, donc rien de nouveau
écrit. `remedier` voit alors une dernière tentative *réussie*, une série
d'échecs à zéro, et rend `null` — ce qui est **le comportement correct**.

Autrement dit : ma sonde allait plus vite que la résolution temporelle du modèle
de faits. Un humain ne relance pas deux fois le même échec dans la même seconde ;
une boucle de script, si. La sonde attend désormais une seconde pleine, comme
celles du CP10 et du CP11 le faisaient déjà.

C'est la sixième anomalie de sonde de ce sprint, et la troisième famille :
n° 1 et n° 3 cherchaient la mauvaise chose, n° 2 et n° 4 ne savaient pas lire
leur propre résultat, n° 5 et n° 6 mesuraient un artefact de leur propre
dispositif. **Une sonde instable qu'on n'explique pas devient une ligne qu'on
finit par ignorer** — et une ligne ignorée est exactement ce qui a permis au
double comptage du CP11 de vivre un sprint entier dans un commentaire.
