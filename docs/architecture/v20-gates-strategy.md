# Stratégie des gates (V20 CP9)

Le dépôt accumule des gates de sprint. V20 les clarifie sans les supprimer
aveuglément, selon **trois rôles distincts**.

## A. Gates ACTUELLES autoritatives (doivent rester vertes)

Elles **dérivent leurs invariants des sources réelles** (catalogue, program.json,
data/exercises, data/missions, glossaire) — jamais de liste ou de compteur codé
en dur. Elles restent valides quand on ajoute légitimement un parcours, un jour,
un exercice ou une mission.

| Gate | Vérifie |
|---|---|
| `curriculum:check` | structure/cohérence des 365 jours générés |
| `curriculum:depth-check` | profondeur minimale du contenu |
| `glossary:check` | schéma, catégories, niveaux, unicité, relations du glossaire |
| `v18:check` | catalogue de missions valide **contre les parcours réels** (dérivés de `buildCatalogue`) + anti-fuite de la vue publique |
| `v20:pedagogy-check` | scan de danger sur tout le corpus + registre de notes ≥ seuils |

Correctif CP9 : `v18:check` dérivait 3 parcours en dur → il **dérive désormais
la liste des parcours du catalogue**, donc il accepte le 4ᵉ parcours et les
missions Docker/V19. Il redevient une gate courante utile.

## B. Gates HISTORIQUES de snapshot (informatives, non autoritatives)

`v17:check`, `v19:check`, `v21:check` (depuis V22) et `v22:check` (depuis V23)
sont **figées sur le baseline de leur sprint** (V17, V19, V21, V22). Un inventaire
central classe toutes les gates : `docs/architecture/gates-inventory.md`. Elles détectent la **dérive vs ce
baseline** — c'est leur but. Après un sprint ULTÉRIEUR qui mute légitimement le
contenu (V19 a touché des jours gelés par V17 ; V20/CP3 a surfacé des « Erreurs
fréquentes » et CP8 a enrichi le jour 320 + le glossaire ; **V22 a enrichi les
jours 78-81 et `days-enrich-61-90.mjs`, hors du périmètre V21 [307/326]**), elles
remontent naturellement de la dérive. **Ce n'est pas une régression** : c'est un
instantané historique qui a fait son travail au moment de son sprint. Note :
`v21:check` valide toujours correctement les 3 pipelines livrés — seule sa
**détection de dérive** (par nature bornée au baseline V21) se déclenche sur le
contenu V22 ; le produit CI/CD n'est pas cassé.

Elles ne sont donc **pas** exécutées comme conditions de succès pour le travail
des sprints suivants. On ne les rend pas vertes artificiellement en affaiblissant
leurs assertions, et on ne les supprime pas (elles documentent le périmètre
contrôlé de leur sprint). Le contenu courant est verrouillé par les gates du
groupe A.

## C. Règle générale

- Une gate **courante** dérive ses invariants des sources — aucune liste de
  parcours, aucun nombre de jours/exercices codé en dur, aucune dépendance à une
  fixture future.
- Une gate **historique** est un instantané figé, informatif, jamais bloquant
  pour un sprint ultérieur.
- Un test (`tests/v20-integration.test.mjs`) garantit que les invariants
  courants (validité du catalogue de missions, atteignabilité) se dérivent bien
  des données réelles et survivent à l'ajout de contenu.
