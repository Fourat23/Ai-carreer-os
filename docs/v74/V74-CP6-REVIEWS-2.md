# V74 — CP6. Reviews 2.0

**Résultat : l'écart médian entre une revue et le dernier contact avec ce qu'elle révise passe
de 1 jour à 3 jours, et la part des rappels à 7 jours ou plus triple — sans que le plafond de
sept leçons bouge, et sans qu'aucune revue ne dépasse le budget.**

---

## 1. Ce que le CP0 avait établi, et qui commande cette correction

| | |
|---|---|
| paires leçon × revue | **247** |
| écart de **1 jour** | **135 (55 %)** |
| leçons liées au **jour 6, la veille** | **135 (55 %)** |
| **leçons liées aux SIX journées de leur semaine** | **94 / 247** → écart de 1 **inévitable** |
| leçons issues de la propre semaine de la revue | **218 / 247** |

**Conclusion du CP0, reprise telle quelle** : le terme dominant n'est **pas** le calendrier
hebdomadaire mais le **rattachement des leçons aux journées** — le défaut `P1-CP13-1` de V73.
**Déplacer les revues ne corrigerait rien.**

Il restait donc deux leviers : changer *ce qu'une revue révise*, ou changer le rattachement des
leçons. Le second est un chantier de curriculum que V73 a explicitement laissé ouvert. **Le
CP6 prend le premier.**

---

## 2. Ce qui change : la composition, jamais le volume par revue

Le plafond reste **sept leçons**. Jusqu'à **deux des sept places** sont désormais réservées à
de la matière plus ancienne, **prises sur les sept, jamais ajoutées à côté**.

| catégorie | définition, dérivée du curriculum seul | raison affichée |
|---|---|---|
| **`RECENT`** | enseignée cette semaine | *(implicite — c'est ce que la revue a toujours fait)* |
| **`SPACED`** | enseignée il y a **≥ 21 jours**, et pas rappelée depuis | « vue il y a N jours, et pas rappelée depuis » |
| **`TRANSFER`** | `SPACED`, **et d'une autre compétence** que celle de la semaine | « vue il y a N jours, et sur une autre compétence — l'employer ici, c'est l'employer hors de son contexte » |

**Chaque leçon ancienne porte sa raison, visible dans la page.** Une revue qui ne dit pas
pourquoi elle propose telle notion demande une obéissance, pas un travail.

Une trace interne (`DERNIERE_REVUE`) empêche les mêmes deux leçons de revenir à chaque revue :
une leçon rappelée n'est pas reproposée avant 21 jours.

---

## 3. Deux catégories sont VOLONTAIREMENT absentes du générateur

Le brief demande cinq catégories : `RECENT · SPACED · WEAK · PREREQUISITE · TRANSFER`. Trois
sont ici. Les deux autres ne peuvent pas y être, et il vaut mieux le dire que le simuler.

**`WEAK` exige de savoir ce que l'apprenant a raté.** Le curriculum est **généré, statique,
identique pour tous** : il ne peut pas le savoir. L'inventer serait fabriquer de la
progression — ce que le contrat V73 et le §9 du contrat V74 interdisent. `WEAK` appartient à
la surface d'exécution `/retention`, là où l'état apprenant existe.

**`PREREQUISITE` exige le graphe des prérequis** — qui est construit **à partir du curriculum
généré**. Le faire lire par le générateur créerait une **dépendance circulaire** entre la
génération et son propre audit. Il appartient lui aussi à l'exécution.

> Le contrat §4 assigne aux 52 revues le **rendez-vous hebdomadaire de rappel libre**. Il ne
> leur demande pas de connaître l'apprenant.

---

## 4. BEFORE / AFTER, mesuré

### 4.1 Espacement

| | BEFORE | AFTER |
|---|---|---|
| paires leçon × revue | 247 | **307** |
| **écart de 1 jour** | **135 (55 %)** | **121 (39 %)** |
| **écart ≥ 7 jours** | **29 (12 %)** | **114 (37 %)** |
| **écart médian** | **1 jour** | **3 jours** |

**La part des rappels à une semaine ou plus est multipliée par trois.**

### 4.2 Charge — le plafond tient, et le coût est de deux minutes

| | BEFORE | AFTER |
|---|---|---|
| revues HEAVY ou IMPOSSIBLE (**L2 ≤ 12/52**) | **0 / 52** | **0 / 52** ✅ |
| journées structurellement impossibles (**L1 = 0**) | **0** | **0** ✅ |
| UNDERLOADED (**L3 ≤ 20/365**) | 6 | **6** ✅ |
| borne haute médiane d'une revue | 186 min | **188 min** |
| borne haute maximale d'une revue | 293 min | **295 min** |
| leçons par revue | max 7 | **max 7** — plafond respecté |

### 4.3 Le volume total augmente, et il faut le dire

**247 → 307 paires, soit +60 (+24 %).** Le plafond par revue n'a pas bougé, mais **26 revues
sur 52 avaient moins de sept leçons** : ce sont elles qui ont reçu les places anciennes.

| leçons par revue | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|
| nombre de revues | 4 | 6 | 7 | 9 | **26** |

**Ce n'est donc pas « à volume constant », et le présenter ainsi serait faux.** Le coût mesuré
est de **+2 minutes sur la borne haute médiane**, et **aucun seuil de charge ne bouge**.

**Ce n'est pas non plus le contournement G12**, qui interdit « d'augmenter le nombre de
révisions pour faire monter un score » : ici le nombre monte parce que des créneaux **déjà
budgétés et vides** reçoivent de la matière ancienne — et le score qui monte est l'espacement,
c'est-à-dire précisément la propriété visée, pas un compteur de couverture.

---

## 5. Ce que le CP6 n'a pas fait

- **Il n'a pas déplacé les revues** : le CP0 a montré que cela ne corrigerait rien.
- **Il n'a pas touché au rattachement des leçons aux journées** — c'est `P1-CP13-1` de V73, un
  chantier de curriculum, et le brief de V74 interdit de modifier les 365 journées pour
  satisfaire une sonde.
- **Il n'a pas relevé le plafond de sept.**
- **Il n'a pas ajouté de bloc de rappel aux 313 journées de travail** : cela ferait passer le
  `FREE_RECALL` de 52 à 365 sans qu'aucune propriété pédagogique ne change (**G12**, nommé
  d'avance au CP1).

---

## 6. Vérifications

| contrôle | résultat |
|---|---|
| `npm test` | **1482 / 1482** |
| `npx tsc --noEmit` | **0** |
| `npm run gates:active` | **0 violation** |
| porte V73 du graphe | **verte** |
| intégrité R1 → R7 | **0 défaut** |
| **corpus des 128 leçons** | **`92d5fae6…` INCHANGÉ** |
| invariants | 365 journées · 52 semaines · 12 mois |
| **`data/progress.json`** | **absent** |
| **L1 · L2 · L3** | **0 · 0/52 · 6/365** ✅ |
