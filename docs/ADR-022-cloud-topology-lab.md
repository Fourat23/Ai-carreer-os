# ADR-022 — Cloud Topology Lab & analyse d'architecture déterministe

Statut : accepté (Sprint V22). Décision fondée sur l'audit CP0 réel. Étend
l'existant ; aucun second moteur de progression, aucun provisioning réel, aucun
appel à un fournisseur cloud, **aucun réseau requis**, aucun credential, aucun
secret réel, **aucune isolation OS prétendue**.

## Problème produit

L'audit CP0 montre que le parcours Systems & Cloud s'arrête aux **fondations
opérationnelles** (terminal, réseau, Linux, architecture 3-tiers/observabilité
jours 78-81, durcissement, Docker, CI/CD). **L'architecture de déploiement cloud
n'est pas enseignée** : modèles de service (IaaS/PaaS/SaaS/FaaS), compute/réseau/
stockage, **haute disponibilité** (SPOF, multi-zone, failover, actif/actif vs
actif/passif), **sauvegarde & reprise** (RTO/RPO, disaster recovery, test de
restauration), **stratégies de déploiement** (blue/green, canary, rolling,
recreate, feature flag), et surtout **régressions & déploiements cassés**
(rollback / roll-forward / hotfix / mitigation / workaround, blast radius,
post-mortem sans blâme). Il n'existe **aucune surface** pour *composer, analyser,
diagnostiquer et comparer* une architecture de déploiement.

## Décision : un LABORATOIRE D'ANALYSE DÉTERMINISTE, pas une console cloud

V22 livre un **modèle générique de topologie** + un **moteur de validation &
diagnostics pur déterministe** + un **Cloud Topology Lab** intégré. Le produit
dit clairement ce qu'il est :

- un **laboratoire d'analyse d'architecture pédagogique** ;
- **pas** une console AWS/Azure/GCP, **pas** un provisioning réel, **pas** un
  moteur d'IaC, **pas** une VM, **pas** un conteneur, **pas** une isolation OS,
  **pas** une estimation contractuelle de disponibilité ou de coût.

### D1 — Topologie ≠ provisioning ; analyse ≠ déploiement

Une topologie est un **document déclaratif pur** (`nodes`, `edges`, `zones`,
`environments`, `constraints`, `objectives`). Elle décrit une **intention
d'architecture**, jamais une infrastructure vivante. Les « actions » du Lab
(valider, analyser, comparer, simuler un incident) sont un **allowlist fermé de
fonctions internes déterministes**. **Jamais** une topologie transformée en appel
réseau, en commande système ou en ressource cloud ; jamais `eval` ; jamais de
script utilisateur arbitraire. Aucun `nodeType` ne « fait » quoi que ce soit : il
porte des **propriétés analysées**, pas du code exécuté.

### D2 — Séparation stricte des responsabilités

- **Modèle pur** (`lib/topology.mjs`) : types, bornes (`TOPOLOGY_CAPS`), invariants
  structurels, `validateTopology(topo, ctx)`, `publicTopologyView(topo)`
  (anti-fuite). Sans I/O, sans réseau, sans horloge.
- **Moteur d'analyse** (`lib/topology-analysis.mjs`) : **pur et déterministe** —
  applique un **registre de règles** à une topologie et produit des **diagnostics**
  stables (code, sévérité, preuve, recommandation, compromis). Ordre de sortie
  déterministe. Aucun score « cloud universel » inventé.
- **Simulation d'incident** (`lib/topology-scenario.mjs`) : **pure, horloge non
  requise** — applique un scénario borné (perte d'un nœud, perte d'une zone,
  pic de charge conceptuel) et recalcule des **propriétés qualitatives**
  (atteignabilité, présence d'un SPOF, chemin restant) — jamais une métrique
  chiffrée présentée comme réelle.
- **Serveur** (`lib/topologies-server.ts`) : chargement + validation des exemples
  contre le contexte réel (jours/parcours/compétences), **vues publiques** pour
  catalogue et recherche.
- **UI** (`app/cloud-lab/**`) : rendu structuré en panneaux, lazy-loadé sur la
  route ; **état utilisateur** borné et local uniquement.

### D3 — Aucun appel cloud, aucun credential, aucun réseau

Le Lab fonctionne **entièrement hors-ligne**. Aucune requête sortante, aucune clé,
aucun secret réel (les nœuds « secret store » sont **conceptuels** : ils portent
la propriété « les secrets vivent ici », jamais une valeur). Un `secret-store`
mal placé est un **diagnostic**, pas une fuite.

### D4 — Cycles : interdits par défaut, autorisés si typés

Le graphe de dépendances refuse les **cycles** par défaut (une dépendance
circulaire non typée est une erreur d'architecture). Un `edge` explicitement typé
comme **flux bidirectionnel légitime** (ex. réplication primaire/réplica) est
accepté sans être compté comme cycle de dépendance de démarrage.

### D5 — Diagnostics : preuve + compromis, jamais de note magique

Chaque diagnostic porte : `code` stable, `severity`
(`blocking`/`risk`/`warning`/`observation`), `title`, `explanation`, `evidence`
(les ids concernés), `impact`, `recommendation`, `tradeoff`, liens `skills`/
`glossary`. La synthèse agrège par sévérité et liste les **dimensions couvertes**
(disponibilité, sécurité, coût, performance, maintenabilité, complexité) **sans**
prétendre calculer une note unique. Un compromis est présenté comme un compromis,
jamais comme « la bonne réponse ».

### D6 — Intégration aux missions & au parcours

Le contenu cloud enrichit **additivement** les jours d'ancrage réels **78-81**
(module `scf-05-architecture-observability`) et un nouveau module cloud dans le
parcours Systems & Cloud. Les exercices réutilisent le **contrat existant**
(call-equals, tests privés cachés, référence 100 % verte, starter échoue ≥ 1 test
public, compétences validées par `isKnownSkill`). Les missions réutilisent le
**moteur V18** (livrables auto + structurel + revue humaine). Aucun second moteur
de progression : la sauvegarde par parcours (`schemaVersion:3`) existe déjà.

## Simulation vs provisioning (honnêteté)

| | Ce laboratoire | Un vrai cloud |
|---|---|---|
| Ressources | métadonnées locales | machines/réseaux réels |
| Disponibilité | propriété **qualitative** | mesurée en production |
| Coût | ordre de grandeur **pédagogique** | facturé contractuellement |
| Incident | scénario **déterministe** | panne réelle |
| Secrets | **conceptuels** | vraies valeurs chiffrées |

## Persistance & migration

L'état utilisateur (topologie éditée, preuves d'exercices, livrables de mission)
passe par le **modèle de sauvegarde existant** (`backup.mjs`, `schemaVersion:3`,
progression par parcours). Migrations **additives uniquement** ; refus des schémas
futurs ; import/export rétrocompatible. Une topologie sauvegardée est **validée**
à la relecture (jamais exécutée).

## Budgets de ressources & discipline de bundle

`TOPOLOGY_CAPS` borne nœuds/arêtes/zones/profondeur/longueur de chaîne/taille
sérialisée. L'analyse est **bornée** (pas de boucle, pas de recalcul complet à
chaque frappe sans nécessité). L'UI du Lab est **lazy-loadée** sur sa route ;
**aucun composant lourd** sur `/` ni sur les pages hors Lab. **Aucune bibliothèque
de diagramming externe** : rendu en panneaux structurés + représentation
graphique simple accessible, avec **alternative textuelle complète**. Aucun CDN,
aucun script distant.

## Sécurité

Modèle/moteur/scénario **purs** : aucun `eval`, aucun `exec`/`spawn`, aucun
`shell`, aucune I/O réseau. Les vues publiques sont **anti-fuite** (jamais de
solution d'exercice, de test privé, de livrable, ni de propriété interne
dangereuse). Les protections sont décrites honnêtement (**validation, allowlist,
bornes de taille, vues publiques**) — elles ne constituent **pas** une isolation
noyau/OS.

## Alternatives rejetées

- **Diagramme libre non structuré** — non analysable déterministe : rejeté.
- **Canvas graphique / drag-and-drop obligatoire** — inaccessible clavier/mobile,
  lourd : rejeté comme *unique* moyen ; représentation graphique **simple et
  optionnelle** seulement, doublée d'une vue textuelle.
- **Bibliothèque externe de diagramming** — poids bundle injustifié, dépendance
  distante : rejeté.
- **Moteur de graphe générique** — surdimensionné ; un modèle typé borné suffit.
- **iframe / scripts arbitraires** — surface d'exécution non maîtrisée : rejeté.
- **Appels réels AWS/Azure/GCP ou IaC** — contraire à la nature locale : rejeté.
- **Formulaire structuré seul** — retenu comme **base d'édition bornée**, complété
  d'une vue synthétique — c'est le compromis choisi (déterministe, accessible,
  testable).

## Décision sur la future section « Que faire dans ce cas ? »

L'architecture **n'interdit pas** — et prépare — une future section professionnelle
de scénarios structurés (situation → urgence → premières vérifications → à ne pas
faire → données → hypothèses → décision rollback/roll-forward/hotfix/mitigation →
communication → validation → surveillance → root cause → correctifs → prévention →
post-mortem → questions d'entretien). Le modèle de **mission V18** (contexte +
livrables typés + rubrique + revue humaine) et le modèle de **diagnostic** (code +
preuve + recommandation + compromis) sont **suffisants** pour la porter plus tard.
**V22 en livre quelques instances via les missions** (notamment « déploiement
cassé & régression »), mais **ne crée pas** de section globale décorative ou
incomplète, ni d'infrastructure morte « pour plus tard ».

## Limites honnêtes

- Simulateur **déterministe**, **pas** un cloud réel ; disponibilité/coût
  **qualitatifs et pédagogiques**, jamais contractuels.
- Aucune isolation OS/noyau ; aucune VM ; aucun conteneur ; aucune iframe présentée
  comme conteneur.
- La qualité **sémantique** des livrables documentaires de mission (ADR, runbook,
  post-mortem, plan de rollback) relève de la **revue humaine**, jamais d'une
  notation automatique.
- Playwright indisponible dans l'environnement : la matrice navigateur sera
  **documentée comme dette**, jamais affirmée comme exécutée.

## Conséquences

- Nouveaux modules : `lib/topology.mjs` (+ `.d.ts`), `lib/topology-analysis.mjs`,
  `lib/topology-scenario.mjs`, `lib/topologies-server.ts`, `app/cloud-lab/**`,
  `app/api/cloud-lab/**`, `data/topologies/*.json`.
- Nouvelle gate `v22:check` (topologies valides + anti-fuite + dérive éditoriale
  + profondeur minimale des jours enrichis).
- Enrichissement additif des jours 78-81 ; +35-45 termes de glossaire ;
  12-16 exercices ; 5-6 missions ; intégration parcours/recherche/sauvegarde.
