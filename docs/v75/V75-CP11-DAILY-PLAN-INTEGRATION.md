# V75 · CP11 — Le plan unique : arbitrer, pas concaténer

> **Un seul plan, un seul budget, une explication en français.**
> Le moteur de récupération peut différer, réduire, proposer, recommander.
> **Il ne peut pas créer du temps.**

---

## 1. Ce qui manquait

Avant ce checkpoint, le produit savait répondre à **cinq questions séparément** :

| nature | qui décide | depuis |
|---|---|---|
| `NEW` | la charge de la journée | V73 |
| `REVIEW` | le scheduler de réactivation | V74 · CP4 |
| `REMEDIATION` | l'échelle de remédiation | V74 · CP7 |
| `TRANSFER` | les 25 défis T4/T5 | V75 · CP9 |
| `PROJECT` | le programme | V73 |

Il ne savait pas répondre à **la seule question qui compte pour l'apprenant** :
*« qu'est-ce que je fais aujourd'hui, et pourquoi comme ça ? »*

Et surtout : **tout le moteur de récupération vivait sur `/retention`.** La page
d'une journée — celle qu'on ouvre pour travailler — n'en savait rien. Elle
proposait la journée entière, quel que soit l'arriéré, le mode, la charge.

---

## 2. La règle qui interdit la solution facile

> §11.1 — *« sans simplement concaténer les cinq »*

Mises bout à bout, les cinq natures produiraient une journée de 400 minutes.
Elles **se disputent un seul budget**, dans un **ordre qui dépend du mode**.

### L'ordre d'arbitrage, déclaré en un seul endroit

| mode | ordre de service |
|---|---|
| `NORMAL` | `PROJECT` → `NEW` → `REVIEW` → `REMEDIATION` → `TRANSFER` |
| `CATCH_UP` | **`REMEDIATION`** → `REVIEW` → `PROJECT` → `NEW` → `TRANSFER` |
| `RECOVERY` | **`REMEDIATION`** → `REVIEW` → `PROJECT` → `NEW` → *(transfert suspendu)* |
| `CRITICAL` | **`REMEDIATION`** → `REVIEW` → `NEW` → `PROJECT` → *(transfert suspendu)* |

**Servir dans cet ordre, c'est arbitrer ; les additionner, ce serait concaténer.**
Un ordre unique pour tous les modes est testé négativement.

**Pourquoi `REMEDIATION` passe devant tout dès `CATCH_UP`** : le CP3 de V74 avait
établi qu'un échec non repris est *le signal le plus actionnable du produit*.
Reprendre ce qui vient d'échouer coûte douze minutes et débloque le reste ;
avancer par-dessus creuse.

**Pourquoi `PROJECT` passe en premier en `NORMAL`** : un livrable a une date, et
le reporter coûte plus cher que de reporter une révision.

---

## 3. La contrainte qui ne se négocie pas

**`total accordé ≤ budget de la journée`, toujours.** Vérifié sur toute la
grille — 4 modes × 7 charges × 4 demandes de révision × 3 de remédiation,
**336 combinaisons**, y compris des demandes absurdes (400 min de révision).

### §11.2 — la journée lourde

Le CP10 de V74 avait mesuré **44 journées sur 365 déjà au-dessus du plafond**.
Une journée à 341 minutes ne reçoit **pas** trente minutes de réactivation
cachées : le produit le **dit**.

> *Cette journée de programme pèse déjà 341 minutes sur un budget de 300 : le
> produit n'ajoute aucune révision par-dessus. Ce qui n'est pas fait aujourd'hui
> n'est pas perdu.*

### Les minutes non placées sont publiées

`budget.nonPlacees = demande − accordé`. Ce que la journée ne peut pas donner
est **affiché**, jamais effacé — même logique que l'arriéré total du CP5.

### Un bug trouvé par cette contrainte même

La première version laissait le bloc `NEW` de `CRITICAL` passer à sa demande
entière, **sans le borner** : le total montait à **320 min sur un plafond de
300**. Le checkpoint censé défendre le budget le violait. Corrigé : recommander
une pause ne dispense pas de la contrainte — *la recommandation porte sur ce
qu'on fait, jamais sur le temps dont on dispose*.

---

## 4. §11.3 — Recommander, pas verrouiller

En `CRITICAL`, le bloc `NEW` reçoit le statut **`recommande-pause`** : il garde
ses minutes, il n'est **pas retiré**. La suspension réelle passe uniquement par
`SET_CURRICULUM_PAUSE` (CP7), déclenchée par l'apprenant.

Un test vérifie **fichier par fichier** qu'aucun module du plan n'émet cette
commande. La surface de la journée ne porte **aucun `disabled`, aucun verrou**,
et le dit :

> *Rien n'a été retiré de la journée : tu peux lire et faire tout ce qui suit,
> dans l'ordre que tu veux.*

---

## 5. §11.4 — `TOTAL` / `ACTIVE` / `PARKED`

Les trois nombres **traversent le plan sans être agrégés**, et la somme reste
exacte. Aucun champ `backlog` unique n'existe.

Rendu réel sur `/day/181` (profil L, jour 180) :

> *En retard : **78** notions — **2** aujourd'hui, **12** plus tard, **64** en
> attente d'un prérequis. « En attente » ne veut pas dire « acquise ».*

---

## 6. §11.5 — L'explication, en langage humain

Le brief donne la forme attendue, et l'interdit. Les deux sont testés.

**Produit** (mode `RECOVERY`, charge 290, révision 35, 3 bloquantes) :

> *Tu as 3 notions en retard dont la suite du parcours dépend. Le nouveau
> contenu est réduit aujourd'hui pour laisser 35 minutes à leur réactivation.*

**Interdit** — un test refuse `recoveryPressure`, `score`, `decay`,
`percentile`, et les noms de modes eux-mêmes dans toute phrase affichée.

Chaque bloc ajusté porte **sa propre raison**. Un plan modifié sans explication
est un plan qu'on ne peut pas contester.

---

## 7. §11.6 — Le branchement, vérifié sur le produit réel

Serveur lancé, fixture hors dépôt (profil L au jour 180, **78 notions en
retard**, mode `CRITICAL`). Rendu réel de `/day/181` :

```
Ta journée, telle que le produit l'organiserait

  Tu as 4 notions en retard dont la suite du parcours dépend. Le produit te
  propose de suspendre le nouveau contenu et de garder 60 minutes pour les
  reprendre — c'est une proposition, pas une décision prise à ta place.
  « Défi de transfert » est mis de côté tant que des prérequis sont en retard.

  Reprise après échec    12 min   4 tentatives n'ont pas abouti
  Réactivation           60 min   4 notions dont la suite dépend sont en retard
  Nouveau contenu       228 min   sur 294 — le produit te propose de suspendre
  Défi de transfert         —     les prérequis en retard passent d'abord

  Total proposé : 300 min sur un budget de 300 min.
  66 min n'ont pas trouvé de place aujourd'hui — elles ne sont pas perdues.
  Le produit ne rallonge jamais ta journée pour rattraper.
```

**Ce que ce rendu démontre**, point par point :

- l'arbitrage a réordonné la journée (`REMEDIATION` avant `NEW`) ;
- le nouveau contenu est **réduit** de 294 à 228, pas supprimé ;
- le transfert est **suspendu**, et la raison est donnée ;
- le total vaut **exactement** le budget, jamais plus ;
- les 66 minutes refusées sont **affichées** ;
- l'explication est en français, sans un seul nom de mode.

Responsive revérifié : **375 / 768 / 1024 / 1440 px** sur `/day/181` et
`/retention` — 0 débordement, 0 superposition.

---

## 8. Ce que le read-model ne fait pas

`lib/plan-unifie-server.ts` **consomme** `getPositionApprenant`, `getPlanDuJour`,
`getVueArriere`, `getVueRecuperation` — et **ne redéclare aucun seuil**. Un test
le vérifie.

La raison est l'audit du CP8 : une couche d'assemblage qui se met à décider
devient un sixième moteur, et deux moteurs finissent par afficher deux nombres
différents sur la même page.

---

## 9. Vérifications

- **1818/1818** tests · `tsc` 0 · build OK · `gates:active` **47 portes, 0 violation** ;
- **21 tests** dédiés au CP11 ;
- **8 mutations négatives vues rougir** : budget dépassé · ordre unique ·
  transfert non suspendu · minutes non placées effacées · `CRITICAL` verrouille ·
  explication en jargon · arriéré garé effacé · plan absent de la page journée ;
- `data/progress.json` **absent**, fixture hors dépôt.

---

## 10. Limites déclarées

- **`PROJECT` ne demande aucune minute propre.** Le livrable est déjà compté
  dans la charge de la journée publiée par V73 ; lui attribuer une estimation
  séparée inventerait du temps et le compterait deux fois.
- **`MINUTES_DEFI_TRANSFERT = 12`** est un ordre de grandeur **déclaré**, comme
  toutes les minutes de ce sprint. Aucune donnée réelle ne permet de le calibrer.
- **Le plan n'agit pas.** Il décrit ce que le produit ferait ; il ne retire, ne
  masque et ne verrouille aucune section de la journée.
