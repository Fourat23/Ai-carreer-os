# Inventaire des gates — statut et classement (V23)

Ce document recense TOUTES les gates du dépôt et les classe en trois groupes.
Objectif : conserver les preuves historiques sans réécrire l'histoire Git, ne
jamais masquer une vraie régression, et cesser d'afficher comme « défaut produit »
une extension additive légitime. Voir aussi `v20-gates-strategy.md`.

## A. Invariants ACTIFS (batterie principale — `npm run gates:active`)

Ces gates dérivent leurs invariants des **sources canoniques** (aucune liste de
parcours, aucun total codé en dur, aucune dépendance à une fixture future). Elles
doivent rester **vertes** à tout moment ; un échec = un vrai problème.

| Gate | Script | Ce qu'elle garantit |
|---|---|---|
| `curriculum:check` | `scripts/curriculum-check.mjs` | Intégrité structurelle du curriculum (365 jours, cohérence). |
| `curriculum:depth-check` | `scripts/curriculum-depth-check.mjs` | Profondeur pédagogique (blocs présents, leçons structurées). |
| `glossary:check` | `scripts/glossary-check.mjs` | Schéma/catégories/niveaux/relations/unicité du glossaire. |
| `v18:check` | `scripts/v18-missions-check.mjs` | Missions valides + anti-fuite ; **dérive les parcours du catalogue** (accepte tout nouveau contenu additif). |
| `v20:pedagogy-check` | `scripts/v20-pedagogy-check.mjs` | Scan de danger (toujours actif) + registre de notes humaines ≥ seuils. |
| `v23:check` | `scripts/v23-check.mjs` | Manifests Kubernetes valides + anti-fuite + dérive bornée à V23 + profondeur. |

Note : `v23:check` borne sa détection de dérive à SON périmètre (baseline +
targetDays du sprint) et valide un contenu **propre au sprint** (manifests). Tant
qu'un sprint ULTÉRIEUR ne modifie pas ses jours cibles (320-321), elle reste un
invariant actif. Le jour où V24+ touchera ces jours, elle basculera en groupe B —
comme `v21:check` (en V22) puis `v22:check` (en V23) l'ont fait — et sera retirée
de `gates:active`. C'est le cycle de vie normal d'une gate de sprint, pas une
régression : la gate d'un sprint reste active tant que le sprint est le « dernier »
à avoir touché son périmètre, puis devient un instantané historique.

## B. Audits HISTORIQUES figés (informatifs — `npm run gates:historical`)

Ces gates sont **figées sur le baseline de leur sprint**. Elles détectent la
**dérive vs ce baseline** — c'était leur rôle au moment de leur sprint. Un sprint
ultérieur qui mute légitimement le contenu couvert les fait remonter de la dérive :
**ce n'est pas une régression**, c'est un instantané historique qui a fait son
travail. Elles ne sont **pas** dans la batterie principale, ne sont **pas** rendues
vertes artificiellement, et ne sont **pas** supprimées (elles documentent le
périmètre contrôlé de leur sprint).

| Gate | Script | Baseline | Pourquoi figée |
|---|---|---|---|
| `v17:check` | `scripts/v17-coverage-check.mjs` | V17 | Contenu couvert enrichi par V19/V20+. |
| `v19:check` | `scripts/v19-coverage-check.mjs` | V19 | Jours gelés touchés par V20/CP3, CP8, etc. |
| `v21:check` | `scripts/v21-check.mjs` | V21 (8d224f3) | Jours 78-81 enrichis par V22 (hors périmètre 307/326). Les 3 pipelines livrés restent valides ; seule la détection de dérive se déclenche. |
| `v22:check` | `scripts/v22-check.mjs` | V22 (9d59a9c) | Jours 320-321 enrichis par V23 (hors périmètre 78-81). Les 3 topologies livrées restent valides ; seule la détection de dérive se déclenche. Figée en V23. |

`gates:historical` les exécute de façon **informative** (n'échoue jamais le shell) :
elles servent de trace, pas de condition de succès pour les sprints suivants.

## C. Gates obsolètes ou codées en dur

**Aucune** à ce jour. Toutes les gates actives dérivent leurs invariants des
sources canoniques (correctif `v18:check` en V20/CP9). Si une gate future codait en
dur une liste de parcours, un total d'exercices/missions, ou dépendait d'une
fixture d'un sprint futur, elle serait rangée ici et corrigée pour dériver des
sources — jamais affaiblie pour « passer ».

## Règle générale

- Une gate **active** dérive ses invariants des sources ; elle reste verte.
- Une gate **historique** est un instantané figé, informatif, jamais bloquant pour
  un sprint ultérieur — conservée comme preuve, jamais réécrite.
- On ne supprime pas les anciens scripts ; on les reclasse et on les documente ici.
- La batterie de CI/validation d'un sprint = `gates:active` (+ tests, tsc, build).
