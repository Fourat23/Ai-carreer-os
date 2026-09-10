# V73 — ÉTAT D'AVANCEMENT

> Fichier de reprise. Mis à jour après **chaque CP**. En cas d'interruption : relire ce
> fichier, vérifier Git, reprendre au CP indiqué. **NE PAS refaire un CP terminé.**

## Position

- **dernier CP terminé** : **CP0**
- **CP courant** : —
- **NEXT_CP** : **CP1**
- **NEXT_ACTION** : geler `docs/v73/V73-CURRICULUM-CONTRACT-FROZEN.md` — définitions
  (compétence enseignée / pratiquée / produite / révisée / maîtrisée ; leçon core /
  approfondissement / référence / optionnelle / dépréciée), règles d'intégrité, et **seuils de
  charge gelés APRÈS la mesure du CP0 mais AVANT toute modification**. Objectif utilisateur
  réel : **4 à 5 h par jour**, en fourchettes, sans normaliser les 365 journées à 270 min.

## Repères Git

| | |
|---|---|
| dépôt | `Fourat23/Ai-carreer-os` (**deux `r`**) |
| branche canonique | `claude/ai-career-os-saas-phfg49` |
| HEAD au début du CP0 | `fe7a10c` |
| HEAD après CP0 | *(voir dernier commit)* |
| local == origin | oui |
| working tree | propre · stash vide · aucun serveur résiduel |

## Invariants (à revérifier à chaque CP)

`128` leçons · `365` journées · `365` corrections · `52` semaines · `12` mois ·
ordre `days[i].day === i+1` · corpus `c1ac869e…` · curriculum entier `04d40526…` ·
**`data/progress.json` n'existe pas dans le dépôt** (gitignoré) — l'invariant est de ne
jamais le créer.

## Décisions gelées

- **CP0** : aucune (lecture seule).

## Journal des CP

- **CP0** — audit forensique, lecture seule. **Aucun fichier de produit modifié.**
  - **P0-1** `cloud` déclarée et chiffrée au mois 11, **0 journée** ; 39 leçons la déclarent,
    26 sont programmées sous une autre étiquette, 13 hors parcours.
  - **P0-2** CSS enseigné nulle part (4 leçons hors parcours, 16 969 mots).
  - **P0-3** Next.js : 4 leçons hors parcours, aucune séquence.
  - **22** leçons hors parcours (pas 25 — V72 en a raccroché 3), **70 306 mots = 16 % du
    corpus**, en 4 grappes : cloud/IaC 7 · web platform + Next.js 8 · Kubernetes 3 ·
    Linux/livraison 4.
  - **Prérequis : 37 candidats, 0 `INVALID_FORWARD_PREREQUISITE`, 37 `EXPLICIT_LOOKAHEAD`.**
    L'ambiguïté A/B est close par une taxonomie sémantique. Classement fait sur la **clause
    d'optionalité lue**, pas sur l'étiquette.
  - **Charge** : BALANCED 264 · HEAVY 55 · UNDERLOADED 40 · IMPOSSIBLE 6 — mais la
    **sensibilité va de 0 à 60 IMPOSSIBLE** selon la vitesse de lecture et le coût de la
    relecture. Aucune décision ne doit reposer sur « 6 ».
  - **Ressource clé pour le CP3** : **31 des 40 journées UNDERLOADED sont entre j91 et j180**
    (mois 4-5-6). C'est là que CSS et Next.js peuvent entrer sans créer de journée.
  - **Revues** : 52/52 ont test pratique, test théorique, grille chiffrée, remédiation, rappel
    sans notes ; **0 n'introduit une leçon inédite**. Deux vrais défauts : la relecture
    (**104 min médians**) n'est **jamais budgétée** face aux 90 min annoncés, et l'**espacement
    médian est de 2 jours**.
  - **Récurrence** : `algo`, `ds`, `patterns`, `gitlinux` sans aucun rappel pendant les **290 à
    326 derniers jours**, alors que j365 propose de l'algorithmique.
  - **Progression** : `difficulty` = **3 sur 271 journées consécutives** (j91→j360) ;
    découpage horaire présent sur **26 journées, toutes au mois 1**.
  - **Semaines** : **13 / 52** thèmes décrivent mieux une autre semaine ; deux blocs de
    décalage (s8-s13, s28-s34), **aucune permutation constante** ne les corrige.
  - **Références mortes** : `api-idempotency` et `dlq-duplicate` **déjà corrigées par V72**
    (citées par 0 leçon) ; **1 seule référence morte réelle** — lab `terminal` sans route.
  - **CINQ ANOMALIES DE SONDE PUBLIÉES** (règle 6) : 24 → 0 faux identifiants morts ; 9 → 0
    après restriction aux composés ; 10 → 1 `practiceRefs` (un lab est une **route**, pas un
    fichier) ; 5 → 0 sections « manquantes » (l'émoji varie) ; 5 → 0 prérequis « sans clause »
    (le préfixe `>` coupait la phrase). **Une propriété structurelle ne se détecte pas en
    scannant de la prose.**
  - **Non-régression académique** : échantillon de 24, graine **20260910** publiée avant le
    tirage, 17 domaines, 6 hors parcours, notes V71 de 4,79 à 5,00. **8 lues intégralement,
    16 contrôlées par sections. 24/24 complètes. Les 8 lues sont excellentes.** L'hypothèse
    « les cours sont mauvais » est **fausse**. Anomalie de tirage publiée : le premier jet
    donnait **0 leçon du milieu** (tri alphabétique des strates), corrigé en tourniquet.

## Tests

- **CP0** : lecture seule, aucun test rejoué (état hérité de V72 : 1420/1420 · tsc 0 ·
  52 gates · build OK).
