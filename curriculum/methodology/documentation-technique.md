<!-- keep -->

# Documentation technique professionnelle — modèles réutilisables

Écrire de la documentation, ce n'est pas « tout documenter ». C'est choisir **le
bon document, pour la bonne audience, au bon niveau de détail, au bon moment**.
Cette page réunit les modèles que tu réutiliseras en entreprise, avec pour
chacun : à quoi il sert, pour qui, quand l'écrire, quand le mettre à jour, quand
**ne pas** l'utiliser, et en quoi il diffère de ses voisins.

## La pyramide documentaire (du « pourquoi » au « comment »)

Un même système se décrit à plusieurs niveaux. On descend du problème vers le
code :

- **HSD — High-Level Solution Design** *(convention de ce cours ; l'acronyme
  n'est pas universel, voir ADR-017)* : quelle **solution** répond au problème
  métier, et pourquoi celle-là plutôt qu'une autre. Niveau le plus haut.
- **HLD — High-Level Design** : l'**architecture** — les composants, leurs
  responsabilités, leurs interactions. Le « plan de la ville ».
- **LLD — Low-Level Design** : le détail d'**un** composant — classes, schémas de
  table, algorithmes. Le « plan d'un bâtiment ».
- **TSD — Technical Specification Document** : le **contrat d'implémentation**
  précis dont un développeur a besoin pour coder sans ambiguïté.

Décisions et évolution s'écrivent à côté (ADR, RFC, changelog) ; l'exploitation a
ses propres documents (runbook, post-mortem). Règle transverse : **la doc vit
avec le code**. Une doc jamais mise à jour ment, et une doc qui ment est pire que
pas de doc.

---

## README technique

- **But** : rendre un projet utilisable par un inconnu en 5 minutes.
- **Audience** : tout nouvel arrivant (dev, recruteur, toi dans six mois).
- **Détail** : minimal et orienté action.
- **Quand l'écrire** : dès le premier commit utile. **Mettre à jour** à chaque
  changement de la façon d'installer/lancer. **Ne pas** y mettre la conception
  détaillée (c'est le rôle du HLD/LLD).

```md
# Nom du projet
Une phrase : ce que ça fait, pour qui.
## Prérequis
## Installation
## Lancer
## Tester
## Structure du projet
## Décisions clés  (liens vers ADR)
## Ce que j'ai appris  (3–5 puces honnêtes)
```

## ADR — Architecture Decision Record

- **But** : capturer **une** décision structurante et son contexte, pour que le
  futur comprenne *pourquoi* (pas seulement *quoi*).
- **Audience** : l'équipe, présente et future.
- **Quand l'écrire** : au moment de la décision, tant que le contexte est frais.
  **Immuable** ensuite : une décision qui change se remplace par un nouvel ADR qui
  « supersede » l'ancien. **Ne pas** l'utiliser pour proposer/débattre (c'est un
  RFC).
- **Diffère du RFC** : l'ADR **acte** une décision prise ; le RFC la **propose**.

```md
# ADR-000 : Titre de la décision
Statut : proposé | accepté | remplacé par ADR-XXX
## Contexte      (le problème, les contraintes)
## Options considérées   (au moins deux, avec leurs coûts)
## Décision      (ce qu'on retient)
## Conséquences  (positives, négatives, ce qu'on accepte)
## Signal de révision   (ce qui nous ferait changer d'avis)
```

## RFC — Request for Comments

- **But** : **proposer** un changement significatif et recueillir des retours
  *avant* de s'engager.
- **Audience** : les parties prenantes qui doivent challenger la proposition.
- **Quand l'écrire** : avant une décision coûteuse ou irréversible. Il a un cycle
  de vie (brouillon → en revue → accepté/rejeté). **Ne pas** l'utiliser pour un
  petit changement local.
- **Diffère de l'ADR** : le RFC est **vivant et discuté** ; une fois tranché, sa
  conclusion devient un ADR.

```md
# RFC : Titre
Auteur · Date · Statut
## Résumé
## Motivation      (le problème, pourquoi maintenant)
## Proposition détaillée
## Alternatives envisagées
## Impact           (compat, migration, risques, coût)
## Questions ouvertes
```

## HLD — High-Level Design

- **But** : montrer l'**architecture** — composants, responsabilités, flux — sans
  détail d'implémentation.
- **Audience** : développeurs, architectes, nouveaux arrivants.
- **Quand l'écrire** : au démarrage d'un système non trivial. **Mettre à jour**
  quand l'architecture change. **Ne pas** y mettre le code.
- **Diffère du LLD** : le HLD est la carte des composants ; le LLD est l'intérieur
  d'**un** composant.

```md
# HLD : Nom du système
## Objectif & contraintes
## Vue de contexte      (le système et ses acteurs/externes — C4 niveau 1)
## Vue des composants   (les modules internes et leurs échanges — C4 niveau 2)
## Flux principaux      (1–2 séquences clés)
## Décisions liées      (ADR)
```

## HSD — High-Level Solution Design (convention de ce cours)

- **But** : au-dessus du HLD, décrire **la solution** retenue face au problème
  métier et **pourquoi**, avant de figer l'architecture.
- **Audience** : parties prenantes techniques et produit.
- **Quand l'écrire** : en cadrage, quand plusieurs solutions sont plausibles.
- **Diffère du HLD** : le HSD répond à « **quelle** solution et pourquoi » ; le
  HLD à « **comment** on la structure ». L'acronyme HSD n'étant pas standard, on
  précise toujours qu'on parle de *Solution Design* (voir ADR-017).

```md
# HSD : Titre de la solution
## Problème métier & critères de succès
## Contraintes            (délai, coût, équipe, existant)
## Options de solution     (2–3, avec compromis)
## Solution retenue & justification
## Vue d'ensemble          (renvoi vers le HLD)
```

## LLD — Low-Level Design

- **But** : spécifier l'**intérieur d'un composant** : classes, schéma de tables,
  algorithmes, cas limites.
- **Audience** : le développeur qui va l'implémenter.
- **Quand l'écrire** : juste avant de coder un composant complexe. **Ne pas** en
  produire pour du code trivial (sur-documentation).

```md
# LLD : Composant X
## Responsabilité unique
## Interface publique       (signatures, entrées/sorties)
## Modèle de données        (schéma, contraintes)
## Algorithme / logique     (étapes, cas limites)
## Erreurs & invariants
```

## TSD — Technical Specification Document

- **But** : le **contrat d'implémentation** sans ambiguïté (souvent LLD + contrat
  d'API + critères d'acceptation réunis).
- **Audience** : développeur, testeur, revieweur.
- **Diffère du LLD** : le TSD ajoute les **critères d'acceptation** vérifiables —
  c'est ce qui permet de dire « fini ».

## Contrat d'API

- **But** : figer ce qu'une API **promet** : routes, entrées, sorties, codes
  d'erreur, versions.
- **Audience** : les **consommateurs** de l'API (autres équipes, clients).
- **Quand le mettre à jour** : tout changement est un événement de compatibilité
  (voir *breaking change*, jour 85). Le contrat **précède** l'implémentation.

```md
## POST /ressource
Auth : Bearer
Corps : { champ: type }          (contraintes)
201 → { id, ... }                (créé)
400 → { error }                  (entrée invalide)
409 → { error }                  (conflit métier)
```

## Modèle C4

- **But** : diagrammer une architecture à **4 niveaux de zoom** : (1) Contexte —
  le système et le monde ; (2) Conteneurs — apps/bases/services ; (3) Composants —
  l'intérieur d'un conteneur ; (4) Code (rarement dessiné).
- **Quand l'utiliser** : dans un HLD, pour ne pas mélanger les niveaux. On choisit
  **le** niveau utile à l'audience, on ne dessine pas tout.

## Runbook

- **But** : la procédure **opérationnelle** pour exploiter un service : démarrer,
  arrêter, diagnostiquer une alerte, **faire un rollback**.
- **Audience** : la personne d'astreinte, à 3 h du matin, sous stress.
- **Quand l'écrire** : avant la mise en production. **Mettre à jour** après chaque
  incident. **Ne pas** y mettre de la théorie — que des étapes exécutables.
- **Diffère du playbook** : le runbook traite **une** procédure précise ; le
  playbook orchestre une **classe** de situations.

```md
# Runbook : Service X
## Démarrer / Arrêter        (commandes exactes)
## Vérifier la santé         (URL, métrique attendue)
## Symptôme → Cause → Action (tableau)
## Rollback                  (revenir à la version saine, étapes)
## Contacts / escalade
```

## Playbook

- **But** : la marche à suivre pour une **famille** de situations (ex. « réponse à
  incident », « onboarding »). Plus large qu'un runbook.
- **Audience** : l'équipe qui répond à ce type de situation.

## Post-mortem (sans blâme)

- **But** : après un incident, comprendre **le système** qui a permis l'erreur —
  pas désigner un coupable — et en tirer des actions.
- **Audience** : l'équipe et son organisation.
- **Quand l'écrire** : après tout incident significatif, à froid. Principe **sans
  blâme** : on cherche la cause racine (*RCA*), pas la faute.

```md
# Post-mortem : Incident du JJ/MM
## Résumé & impact           (durée, utilisateurs touchés)
## Chronologie               (détection → résolution)
## Cause racine (RCA)        (les « 5 pourquoi »)
## Ce qui a bien/mal marché
## Actions correctives       (avec responsable et échéance)
```

## Changelog

- **But** : lister, **pour les utilisateurs**, ce qui a changé entre versions
  (ajouts, corrections, changements cassants).
- **Diffère du decision log** : le changelog dit *ce qui a changé* ; le decision
  log dit *ce qui a été décidé et pourquoi*.

```md
## [1.2.0] — AAAA-MM-JJ
### Ajouté
### Corrigé
### Changé (⚠ cassant si applicable)
```

## Decision log

- **But** : l'index chronologique des décisions (souvent la liste des ADR).
- **Audience** : quiconque veut retracer *pourquoi* le système est ainsi.

---

## Choisir vite : l'anti-sur-documentation

La bonne question n'est pas « quel document est le plus complet » mais « **quel
est le plus petit document qui répond à la question de mon lecteur** ». Un README
clair vaut mieux qu'un HLD que personne ne lit. On écrit un document quand son
absence **coûte** (un inconnu bloqué, une décision reperdue, une astreinte sans
procédure) — et on le supprime quand il ment plus qu'il n'aide.

---

# Modèles détaillés pour les missions d'ingénierie (V18)

Ces gabarits complets servent aux **missions** : copie la structure, remplis chaque
section, retire les crochets. La validation de l'application est **structurelle**
(sections présentes, pas de placeholder, taille raisonnable) — elle ne juge pas le
fond : la justesse reste ton auto-évaluation et une revue humaine.

## ADR détaillé

```md
# ADR-00X : [décision]
## Contexte      [problème, contraintes, ce qui force à décider]
## Décision      [ce qu'on retient, formulé à l'affirmatif]
## Alternatives  [≥ 2 options écartées, avec leur coût]
## Conséquences  [positives ET négatives assumées]
## Risques       [ce qui pourrait mal tourner + mitigation]
## Statut        [proposé | accepté | remplacé par ADR-00Y]
```

## HSD — High-Level Solution Design

```md
# HSD : [nom de la solution]
## Contexte         [problème métier, contraintes]
## Objectifs        [ce que la solution doit atteindre, mesurable]
## Non-objectifs    [ce qu'on ne fait PAS, explicitement]
## Architecture     [vue d'ensemble, renvoi au diagramme C4]
## Composants       [les briques et leurs responsabilités]
## Flux             [1–2 séquences clés, du déclencheur au résultat]
## Interfaces       [ce que la solution expose / consomme]
## Données          [modèle, volumétrie, cycle de vie]
## Sécurité         [authn/authz, secrets, surface d'attaque]
## Observabilité    [logs, métriques, traces ; ce qu'on saura en prod]
## Disponibilité    [SLO visé, dégradation, points de défaillance]
## Déploiement      [comment ça arrive en prod, feature flag éventuel]
## Risques          [techniques et projet, avec mitigation]
```

## TSD — Technical Solution Design (+ LLD ciblé)

```md
# TSD : [composant / évolution]
## Contrat          [ce que le composant garantit à ses appelants]
## Modèles          [types, schémas de données, invariants]
## API              [routes, entrées, sorties, versions]
## Erreurs          [codes, cas, messages ; comportement en échec]
## Validations      [règles d'entrée, bornes, refus]
## Persistance      [tables, index, transactions]
## Migrations       [avant/arrière, données existantes]
## Tests            [unitaires, intégration, cas limites, non-régression]
## Performances     [budget, coût attendu, points chauds]
## Rollback         [comment revenir à l'état sain, étapes]
## LLD              [détail interne du composant clé : responsabilités,
                     fonctions/états, séquences, cas limites, invariants]
```

## Runbook détaillé

```md
# Runbook : [service / fonctionnalité]
## Symptômes                [ce que l'astreinte observe]
## Diagnostic               [étapes pour localiser la cause, commandes]
## Mitigation               [réduire l'impact tout de suite]
## Rollback                 [revenir à la version saine, étapes exactes]
## Escalade                 [qui prévenir, quand]
## Validation du rétablissement  [comment confirmer que c'est réglé]
```

## Post-mortem sans blâme détaillé

```md
# Post-mortem : [incident] — [date]
## Résumé                   [1–2 phrases]
## Impact                   [durée, utilisateurs, pertes]
## Timeline                 [détection → mitigation → résolution]
## Détection                [comment on l'a su ; MTTD]
## Cause racine (RCA)       [les « 5 pourquoi », pas un coupable]
## Facteurs contributifs    [ce qui a aggravé ou masqué]
## Résolution               [ce qui a rétabli le service ; MTTR]
## Actions correctives      [avec responsable et échéance]
## Prévention               [ce qui empêche la récidive]
```
