# Inventaire des gates — statut et classement (V25)

Ce document recense TOUTES les gates du dépôt et les classe en trois groupes.
Objectif : conserver les preuves historiques sans réécrire l'histoire Git, ne
jamais masquer une vraie régression, et cesser d'afficher comme « défaut produit »
une extension additive légitime. Voir aussi `v20-gates-strategy.md`.

## A. Invariants ACTIFS (batterie principale — `npm run gates:active`)

Ces gates dérivent leurs invariants des **sources canoniques** (aucune liste de
parcours, aucun total codé en dur, aucune dépendance à une fixture future). Elles
doivent rester **vertes** à tout moment ; un échec = un vrai problème.

| Gate | Script | Sprint | Périmètre | Bloquant | Ce qu'elle garantit |
|---|---|---|---|---|---|
| `curriculum:check` | `scripts/curriculum-check.mjs` | transverse | 365 jours | oui | Intégrité structurelle du curriculum (365 jours, cohérence). |
| `curriculum:depth-check` | `scripts/curriculum-depth-check.mjs` | transverse | tous jours | oui | Profondeur pédagogique (blocs présents, leçons structurées). |
| `glossary:check` | `scripts/glossary-check.mjs` | transverse | glossaire (520) | oui | Schéma/catégories/niveaux/relations/unicité du glossaire. |
| `v18:check` | `scripts/v18-missions-check.mjs` | transverse | missions | oui | Missions valides + anti-fuite ; **dérive les parcours du catalogue** (accepte tout nouveau contenu additif). |
| `v20:pedagogy-check` | `scripts/v20-pedagogy-check.mjs` | transverse | danger + revue | oui | Scan de danger (toujours actif) + registre de notes humaines ≥ seuils. |
| `v25:check` | `scripts/v25-check.mjs` | V25 (courant) | jours 78/79/80/81/325 (cloud) | oui | Architectures cloud (problématique↔sain) + price-book/provider-map factices + playbooks cloud (15 rubriques) + anti-fuite + dérive bornée à V25 + profondeur. **Dérive les parcours du catalogue** (`buildCatalogue`), jamais de compte codé en dur. |

Note : `v25:check` borne sa détection de dérive à SON périmètre (baseline +
targetDays du sprint : jours 78/79/80/81/325) et valide un contenu **propre au sprint**
(architectures/playbooks cloud). Elle reste active tant qu'aucun sprint ultérieur ne
touchera ces jours. **Cycle de vie appliqué en V25** : `v24:check` détectait la dérive
vs le baseline V24 sur *toute* modification de `curriculum`/`scripts/data` hors de son
périmètre (68/85/298) ; or V25 a légitimement enrichi les jours 78/79/80/81/325.
`v24:check` a donc rempli son rôle et **bascule en groupe B (historique)** — exactement
comme `v22:check` (en V23) puis `v23:check` (en V24). Les 4 scénarios de sécurité et
15 playbooks livrés par V24 restent valides ; seule la détection de dérive se déclenche.
Ce n'est pas une régression produit, c'est la fin de vie normale d'une gate de sprint.

## B. Audits HISTORIQUES figés (informatifs — `npm run gates:historical`)

Ces gates sont **figées sur le baseline de leur sprint**. Elles détectent la
**dérive vs ce baseline** — c'était leur rôle au moment de leur sprint. Un sprint
ultérieur qui mute légitimement le contenu couvert les fait remonter de la dérive :
**ce n'est pas une régression**, c'est un instantané historique qui a fait son
travail. Elles ne sont **pas** dans la batterie principale, ne sont **pas** rendues
vertes artificiellement, et ne sont **pas** supprimées (elles documentent le
périmètre contrôlé de leur sprint).

| Gate | Script | Baseline | Statut | Pourquoi figée |
|---|---|---|---|---|
| `v17:check` | `scripts/v17-coverage-check.mjs` | V17 | informatif | Contenu couvert enrichi par V19/V20+. |
| `v19:check` | `scripts/v19-coverage-check.mjs` | V19 | informatif | Jours gelés touchés par V20/CP3, CP8, etc. |
| `v21:check` | `scripts/v21-check.mjs` | V21 (8d224f3) | informatif | Jours 78-81 enrichis par V22 (hors périmètre 307/326). Les 3 pipelines livrés restent valides ; seule la détection de dérive se déclenche. |
| `v22:check` | `scripts/v22-check.mjs` | V22 (9d59a9c) | informatif | Jours 320-321 enrichis par V23 (hors périmètre 78-81). Les 3 topologies livrées restent valides ; seule la détection de dérive se déclenche. Figée en V23. |
| `v23:check` | `scripts/v23-check.mjs` | V23 (e904bda…) | informatif | Jours 68/85/298 enrichis par V24 (hors périmètre 320-321). Les 3 manifests Kubernetes livrés restent valides ; seule la détection de dérive se déclenche. **Figée en V24.** |
| `v24:check` | `scripts/v24-check.mjs` | V24 (23e90c6…) | informatif | Jours 78/79/80/81/325 enrichis par V25 (hors périmètre 68/85/298). Les 4 scénarios de sécurité et 15 playbooks livrés restent valides ; seule la détection de dérive se déclenche. **Figée en V25.** |

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
