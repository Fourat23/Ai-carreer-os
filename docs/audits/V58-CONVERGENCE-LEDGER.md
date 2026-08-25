# V58 — Registre de convergence · métriques gelées AVANT → APRÈS

Métriques : celles gelées en V56 §3/§4, **inchangées**, plus les compteurs
additifs de V57 (`topBlocks`, `cardsContainer`, `cardsItem`). Mesure à 1440 px,
Chromium, `main.content`.

## Avertissement d'intégrité sur la source du AVANT

Le fichier de sonde `v58-cp0.json` a été **réécrit en cours de sprint** (un
rejeu de la sonde l'a écrasé à 08:45, après les CP4 à CP7). Il ne contient donc
plus l'état CP0 pour les routes déjà migrées à cet instant, et il n'est **pas**
utilisé comme AVANT ici.

Le AVANT publié ci-dessous provient des **messages de commit**, écrits au
moment même de la mesure et horodatés par git — `196f5dd`, `a3ce7b1`,
`636d52b`, `465901c`, `111fd46`, `119772e`, `9f46e2d`. C'est la seule source
non réécrite. Là où un commit ne consigne pas une métrique, la case porte `—`
plutôt qu'une valeur reconstruite : rien n'est extrapolé.

`docs/audits/V58-CONVERGENCE-LEDGER.md` était annoncé au §5 des critères gelés
mais n'avait jamais été écrit. Ce fichier corrige cet oubli.

## Les 18 routes de la baseline

| Route | topBlocks | dominance | fonds/ombres | typeRange | cartes | R satisfaits | Verdict |
|---|---|---|---|---|---|:--:|---|
| `/glossary` | 1 → 2 | 1,00 → 0,511 | — → 5/3 | 3,27 → 4,08 | 712 → 4 | R1 R2 R4 = **3** | **RECOMPOSÉE** |
| `/lessons` | 1 → 2 | — → 0,981 | — → 5/3 | 3,27 → 4,08 | 18 → 3 | R1 R2 R4 = **3** | **RECOMPOSÉE** |
| `/missions` | — → 2 | — → 0,949 | 4/3 → 6/3 | — → 4,08 | 2 → 2 | R1 R2 R3 R4 = **4** | **RECOMPOSÉE** |
| `/missions/[id]` | 5 → 6 | — → 0,416 | 4/— → 5/2 | 1,87 → 3,27 | — → 11 | R1 R2 R4 = **3** | **RECOMPOSÉE** |
| `/capstones/[id]` | 9 → 4 | 0,128 → 0,778 | — → 5/2 | 3,27 → 3,27 | — → 14 | R1 R2 R4 = **3** | **RECOMPOSÉE** |
| `/security` | 1 → 4 | 1,00 → 0,678 | 3/1 → 7/3 | — → 3,50 | 52 → 11 | R1 R2 R3 R4 = **4** | **RECOMPOSÉE** |
| `/cloud-foundations` | 1 → 4 | 1,00 → 0,393 | 3/1 → 7/3 | — → 4,08 | 19 → 13 | R1 R2 R3 R4 = **4** | **RECOMPOSÉE** |
| `/notes` | 1 → 2 | 1,00 → 0,702 | 4/2 → 7/2 | 2,43 → 3,77 | 2 → 3 | R1 R2 R4 = **3** | **RECOMPOSÉE** |
| `/guide` | 1 → 3 | 1,00 → 0,891 | 2/0 → 6/3 | 2,88 → 2,88 | 2 → 2 | R1 R2 R3 = **3** | **RECOMPOSÉE** |
| `/career` | 1 → 3 | 1,00 → 0,868 | — → 5/2 | 2,88 → 2,88 | 2 → 2 | R1 R2 = **2** | **RESKINNÉE SEULEMENT** |
| `/resources` | 1 → 3 | 1,00 → 0,888 | — → 3/2 | 2,88 → 2,88 | 2 → 2 | R1 R2 = **2** | **RESKINNÉE SEULEMENT** |
| `/pipelines/[id]` | 3 → 4 | — → 0,489 | 2/0 → 5/2 | 3,27 → 3,77 | — → 9 | R1 R2 R4 = **3** | **RECOMPOSÉE** |
| `/security/[id]` | 2 → 4 | — → 0,595 | 3/0 → 10/3 | — → 4,08 | — → 10 | R1 R2 R3 R4 = **4** | **RECOMPOSÉE** |
| `/kubernetes/[id]` | 2 → 4 | — → 0,549 | 3/0 → 10/3 | — → 4,08 | — → 6 | R1 R2 R3 R4 = **4** | **RECOMPOSÉE** |
| `/cloud-lab/[id]` | 2 → 4 | — → 0,739 | 2/0 → 9/3 | — → 3,77 | — → 9 | R1 R2 R3 R4 = **4** | **RECOMPOSÉE** |
| `/cloud-foundations/[id]` | 3 → 4 | — → 0,779 | 3/0 → 10/3 | — → 3,77 | — → 13 | R1 R2 R3 R4 = **4** | **RECOMPOSÉE** |
| `/settings` | 0 → 4 | 0,000 → 0,576 | 3/0 → 6/2 | 3,77 → 3,77 | 4 → 5 | R1 R2 R4 = **3** | **RECOMPOSÉE** |
| `/doc/[...slug]` | 3 → 3 | 0,881 → 0,881 | 6/2 → 6/2 | 2,00 → 2,00 | 3 → 3 | R1 échoue | **NON TRAITÉE** |

Conditions obligatoires vérifiées sur les 18 : `overflow = 0`, `clipped = 0`,
axe 0 critical / 0 serious. Aucune route ne les manque.

## Décompte de clôture

| Classe | Nombre | Routes |
|---|:--:|---|
| **Réellement recomposées** | **15** | les quinze ci-dessus |
| **Reskinnées seulement** | **2** | `/career`, `/resources` |
| **Non traitées** | **1** | `/doc/[...slug]` |

**Routes anciennes ou intermédiaires restantes : 3.**
Cible du sprint : ≤ 4. **Cible atteinte** — sans qu'aucun seuil n'ait bougé et
sans qu'aucune route non conforme ait été reclassée.

## Ce que la sonde n'a pas vu, et pourquoi c'est publié

- **R3 (`fonds ≥ 6` ET `ombres ≥ 3`) échoue sur 7 des 15 recomposées.**
  Aucun fond ni aucune ombre n'a été ajouté pour le faire basculer : le §2 et
  le §10 des critères gelés l'interdisent. Le résultat est publié tel quel.
- **`/career` et `/resources` restent comptées anciennes.** Elles ont reçu la
  coquille éditoriale mais leur amplitude typographique (2,88) reste sous le
  seuil de 3,20 et leur profondeur sous R3. Deux critères sur cinq : c'est un
  reskin, et c'est dit.
- **`/doc/[...slug]` n'a pas été traitée.** Elle a reçu des correctifs CSS au
  CP12 (tableaux du curriculum sur mobile) mais aucune recomposition. Une
  route non terminée reste non terminée.

## Reculs mesurés pendant le sprint

- **`/capstones` : amplitude 4,08 → 2,83.** Cause : la suppression, au CP2,
  d'un titre fantôme dupliqué que `[hidden]` ne masquait pas. Ce titre gonflait
  artificiellement `maxFont`. La valeur basse est la **vraie** ; l'ancienne
  était fausse. Le recul est conservé et déclaré.
- **`/missions` : fonds 4 → 3** après suppression de trois en-têtes redondants,
  puis 3 → 6 en donnant au contenu principal la surface de catalogue déjà
  employée sur /diagnostics, /capstones et /lessons. Les deux mouvements sont
  consignés au commit `111fd46`.
- **`/security` : dominance 0,686 → 0,678** et **`/cloud-foundations` :
  0,423 → 0,393** entre le CP5 et la clôture, du fait des retouches de
  convergence du CP10. Écart réel, sans conséquence sur R2.

## Régression introduite par ce sprint, trouvée et corrigée

Le CP6 avait ajouté `.cat-row-link { grid-template-columns: 24px … }` sans
condition pour l'ordinal de `/lessons`. La règle s'appliquait à toutes les
rangées de catalogue : sur `/capstones` et `/diagnostics`, dont les rangées
n'ont que trois enfants, chaque titre se coupait à **un mot par ligne**.

`overflow`, `clipped`, `dominance`, `surfaces`, `shadows` et `typeRange`
étaient **strictement inchangés** sur les deux routes : aucune métrique gelée
ne pouvait le détecter. C'est la navigation aléatoire du CP11, sur capture, qui
l'a trouvé. Corrigé par `.cat-row-link:has(.cat-row-ord)`.

Effet mesuré de la correction :
`/capstones` hauteur 4 835 → 1 871 px, dominance 0,934 → 0,814 ;
`/diagnostics` hauteur 4 865 → 2 408 px, dominance 0,931 → 0,845.
