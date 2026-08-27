# V64 · CP1 — Critères de sortie gelés

Fixés **avant** toute écriture de code moteur, committés avec l'ADR-064.
Le barème ne sera pas modifié après mesure, y compris s'il est défavorable
(brief §44 : « Ne baisse jamais le seuil pour obtenir READY »).

## 1. Les douze conditions

| # | Condition | Méthode | Seuil | Bloquante |
|---|---|---|---|:--:|
| 1 | Une visite ne mute jamais la progression | hachage avant/après, **sans restauration**, sur toutes les familles de routes | 0 mutation | oui |
| 2 | `NOT_STARTED → COMPLETED` est rejeté | test unitaire + test d'intégrité HTTP | rejeté, **0 écriture** | oui |
| 3 | Une transition invalide ne mute rien | hachage du fichier après appel refusé | identique | oui |
| 4 | `START` mute exactement une fois | hachage + comparaison de champs | 1 mutation, `startedAt` écrit | oui |
| 5 | `COMPLETE` est idempotent | 3 appels successifs | `completedAt` inchangé après le 1er | oui |
| 6 | Une soumission ne touche que sa cible | diff structurel des autres journées | 0 champ étranger modifié | oui |
| 7 | Un rechargement préserve la session | navigateur réel, reload | état + soumissions identiques | oui |
| 8 | Migration v3 → v4 déterministe, idempotente, sans perte | `migrate(migrate(x)) === migrate(x)` ; aucun champ perdu ; fixture = `progress.json` réel | égalité stricte | oui |
| 9 | Écriture interrompue récupérable | fichier temporaire + `rename` ; test de troncature | ancien fichier intact | oui |
| 10 | ≥ 1 validation automatique déterministe branchée | `exercise-tests` bout en bout | preuve créée, idempotente | oui |
| 11 | Aucun test ne touche `data/progress.json` | sha256 avant/après `npm test` | identique | oui |
| 12 | Invariants produit | corpus `curriculum/` + `data/`, 365 jours, ordre | inchangés | oui |

## 2. Non-régression héritée — la clôture UX de V63

Les dix conditions de `docs/V63-UX-CLOSURE.md` restent en vigueur. Une seule
qui passe de PASS à FAIL suffit à refuser V64.

En particulier, la **condition 10** — hauteur de `/day/[id]` @375 :

| jour | seuil |
|---|--:|
| `/day/80` | ≤ 13 425 px |
| `/day/1` | ≤ 6 350 px |

Le moteur ajoute des affordances à la Vue Jour. Il n'a pas le droit de la
rallonger.

Également maintenus : 0 débordement horizontal et 0 violation axe
critical/serious sur les états mesurés ; ensemble de motifs fermé à 5 ;
trois coquilles partagées ; 41 gates verts.

## 3. Ce qui ne compte PAS comme échec

- une métrique imparfaite qui n'est pas dans le tableau du §1 (brief : « Une
  métrique imparfaite n'est PAS un motif d'arrêt ») ;
- l'absence de validation automatique pour une activité **ouverte** — c'est le
  comportement voulu (`manual`), pas un manque ;
- un écart de mesure inférieur à 2 px.

## 4. Ce qui compte comme échec, sans discussion

- toute condition bloquante du §1 en FAIL ;
- toute condition de clôture UX qui régresse ;
- toute mutation de `data/progress.json` par un test ;
- tout contenu pédagogique modifié ;
- toute donnée learner-facing inventée ;
- toute gamification introduite.

## 5. Règle de verdict

**12/12 et aucune régression UX → `LEARNING_ENGINE_FOUNDATION_READY`.**
**Sinon → `LEARNING_ENGINE_FOUNDATION_NOT_READY`.**

Aucun cumul de bons résultats ne compense un blocker.
