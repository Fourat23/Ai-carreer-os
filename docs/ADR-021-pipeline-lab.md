# ADR-021 — Pipeline Lab & exécution déclarative bornée (CI/CD)

Statut : accepté (Sprint V21). Décision fondée sur l'audit CP0 réel. Étend
l'existant ; aucun second moteur de progression, aucun runner CI généraliste,
aucun shell arbitraire, aucun réseau, **aucune isolation OS prétendue**, aucune
connexion à un fournisseur externe (GitHub Actions/GitLab CI/Jenkins/Azure DevOps).

## Problème produit

L'audit CP0 montre que le CI/CD est enseigné au **niveau basique projet**
(jour 326 : lint + tests + éval smoke à chaque push) mais que l'**ingénierie de
livraison profonde** est absente ou seulement mentionnée : anatomie d'un pipeline
(stages/jobs/steps), **DAG / dépendances / parallélisme**, triggers & politiques
de branche, **artefacts & cache**, secrets/environnements, **approbations /
promotion / rollback**, **blue-green / canary**, flaky / chemin critique / dette
de pipeline. Il n'existe **aucun exercice ni mission CI/CD**, et pas de surface
pour *construire, déclencher, diagnostiquer et évaluer* un pipeline.

## Décision : un simulateur pédagogique DÉTERMINISTE, pas un runner CI

V21 livre un **modèle générique de pipeline** + un **orchestrateur pur
déterministe** + un **Pipeline Lab** intégré. Le produit dit clairement ce qu'il
est :

- un **simulateur exécutable de pipeline pédagogique** ;
- **pas** un runner CI généraliste, **pas** un système de déploiement réel,
  **pas** une isolation OS, **pas** une connexion à un fournisseur externe,
  **pas** un remplacement de GitHub Actions/GitLab CI/Jenkins/Azure DevOps.

### D1 — Pipeline ≠ shell ; pipeline ≠ Docker

Un pipeline est **déclaratif**. Ses jobs n'exécutent QUE des **actions internes
allowlistées et déterministes** (validation de config, lint synthétique sur
fixture, tests déterministes sur fixture, build synthétique, contrôle d'artefact,
contrôle de cache, politique de branche, approbation simulée, détection de secret
dans un log factice, calcul de statut, diagnostic de DAG). **Jamais** une chaîne
de configuration transformée en commande système ; jamais `eval` ; jamais de
commande utilisateur brute.

### D2 — Exécution : pure d'abord, bornée ensuite

- L'**orchestrateur** (`lib/pipeline-engine.mjs`) est **pur et déterministe**
  (horloge injectable) : résolution du trigger, tri topologique du DAG,
  parallélisme logique, statuts (success/failed/skipped/cancelled/blocked),
  fail-fast, allowFailure, approbation simulée, agrégation, logs structurés
  bornés, **masquage des valeurs sensibles**, artefacts en **métadonnées locales**
  (jamais de publication externe). Aucune I/O.
- Un **adaptateur local borné** (CP4) n'est ajouté **que si l'audit le justifie**,
  pour quelques actions sûres (ex. un lint/test réel sur fixture du workspace),
  en **réutilisant les primitives du terminal V20** (execFile `shell:false`,
  allowlist, workspace temporaire, timeout+SIGKILL, sortie plafonnée, env minimal,
  nettoyage) mais **plus restrictif** : exécutables fixés, aucun argument
  utilisateur arbitraire, aucun réseau, aucun secret, aucune mutation de `data/`.
  Docker reste **optionnel** ; daemon indisponible → état explicite, jamais de
  faux succès, jamais d'échec global du produit.

### D3 — Événements & triggers

Le déclenchement est **évaluable** : un événement simulé (`push`/`pull_request`/
`tag`/`manual`/`schedule`) + des **filtres de branche/tag** décident si le
pipeline se lance. Aucun webhook, aucun dépôt réel.

### D4 — DAG & ordre d'exécution

Les jobs déclarent leurs `needs`. L'orchestrateur calcule un **ordre topologique**,
**refuse les cycles**, marque `blocked` les jobs dont un prérequis a échoué (sauf
`allowFailure`), `skipped` ceux dont la condition est fausse, et agrège un statut
global déterministe.

### D5 — Logs, masquage, persistance

Logs **structurés et bornés** ; toute valeur déclarée `secret` est **masquée**
(`***`) dans les logs et la vue publique. Les runs ne sont **pas persistés dans
`progress.json`** (données volatiles) : seule une **preuve d'exercice/mission**
(via les moteurs existants) l'est. Aucun runToken/pid/containerId/stdout brut en
sauvegarde.

### D6 — Intégration aux missions & au parcours

Les missions de livraison réutilisent le **moteur V18** (auto + structurel +
revue humaine). Le contenu enrichit les journées d'ancrage réelles (307, 326,
+325) du **parcours Systems & Cloud**, sans copier de curriculum ni créer de
5ᵉ parcours.

## Migration / sauvegarde

Additif : aucun champ obligatoire nouveau dans `progress.json` (schéma v3
inchangé). Les preuves de pipeline passent par le système de preuves existant.
Anciennes sauvegardes importables ; restauration exacte du track actif.

## Budgets de ressources

Pipeline borné : nombre de stages/jobs/steps plafonné, timeout par job, sortie de
log plafonnée, historique borné. L'orchestrateur pur est O(V+E) sur le DAG.

## Sécurité

Actions allowlistées ; aucune interpolation non contrôlée ; secrets masqués ;
chemins bornés (path traversal / octet nul / clés dangereuses refusés côté
modèle) ; adaptateur local plus restrictif que le terminal ; aucun token/
credential réel ; aucun accès réseau ; nettoyage garanti.

## Alternatives rejetées

- **Fausse intégration GitHub Actions/GitLab/Jenkins** : rejeté (réseau, secrets,
  comptes) → simulateur déterministe local.
- **Second moteur de progression / source parallèle** : rejeté → v3 + moteurs V18/V20.
- **Exécuter la config comme un script** : rejeté (surface arbitraire) → actions
  internes allowlistées.
- **Sprint Kubernetes** : hors périmètre → « orchestration » = stages/jobs d'une
  chaîne de livraison, pas de cluster.

## Limites honnêtes

- Simulateur pédagogique déterministe, **pas** un runner CI réel.
- Aucun déploiement réel, aucun registry, aucun push Git, aucun artefact externe.
- Docker peut être indisponible → smoke réel seulement si daemon présent.
- L'évaluation documentaire des missions reste **structurelle + revue humaine**.

## Conséquences

- Positives : l'ingénierie de livraison devient **construite, déclenchée,
  diagnostiquée et évaluée** localement, sans réseau ni risque.
- Coûts : une gate de plus (`v21:check`) ; discipline de périmètre éditorial.
- Non-objectifs : runner CI externe, déploiement réel, isolation OS, Kubernetes.
