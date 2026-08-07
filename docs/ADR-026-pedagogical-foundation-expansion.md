# ADR-026 — Expansion de la fondation pédagogique (Cloud / DevOps)

Statut : accepté (Sprint V26). Décision fondée sur l'audit CP0 réel. **Priorité
produit : PÉDAGOGIE > cohérence des parcours > pratique > nouvelles features.**
Local, mono-utilisateur, sans réseau, sans cloud réel, sans nouveau moteur de
progression, sans Workbench.

## Problème produit

L'audit CP0 établit un **déséquilibre** : les Labs (Docker V20, Pipeline V21, Cloud
Topology V22, Kubernetes V23, Security V24, Cloud Architecture V25) et
l'enrichissement AWS/Azure dépassent largement la bibliothèque canonique « Leçons de
fond » (60 leçons, 2 785 min). Trous critiques : **Kubernetes** (Lab riche, **zéro
leçon** de fond), **Cloud/AWS/Azure/IaC/Réseau/Linux-système** absents ou
superficiels, **Docker/CI-CD** sous-dimensionnés vs leurs Labs. AI Career OS demande
d'utiliser des technologies qu'il n'explique pas encore. C'est une **dette produit
prioritaire**.

## Décision : étendre la bibliothèque canonique, à qualité constante

V26 ajoute des **Leçons de fond profondes** sur la colonne Cloud/DevOps (Linux,
réseau, Docker, CI/CD, Kubernetes, cloud/AWS/Azure/IaC/FinOps), en réutilisant
l'architecture existante :

- Contenu : fichiers `.md` hand-authored dans `curriculum/lessons/` (marqueur
  `<!-- keep -->`, jamais régénérés).
- Métadonnées : entrées dans `scripts/data/lessons-map.mjs` (`LESSONS`), injectées
  dans `program.json` par `generate-curriculum.mjs`.
- Aucune nouvelle source de vérité, aucun nouveau schéma de stockage : on suit le
  modèle des 60 leçons existantes.

**Cible : ~28-32 nouvelles leçons profondes** sur le périmètre Cloud/DevOps. Ce n'est
PAS un KPI : si le volume sûr sans dette est inférieur, on en fait moins et on
documente le backlog exact pour V27/V28. La profondeur prime sur le nombre.

## Contrat d'une « Leçon de fond »

Une leçon enseigne un **savoir canonique réutilisable**, distinct du Jour (quoi
apprendre aujourd'hui), de l'Exercice (vérifier une compétence bornée), du Lab
(manipuler/raisonner un système), de la Mission (situation professionnelle), du
Projet (livrable long), du Playbook (que faire en incident), du Glossaire (référence
terminologique). Les couches se **complètent**, ne se **dupliquent** pas.

Une leçon sélectionne intelligemment parmi : objectif, prérequis, intuition, pourquoi
le concept existe, modèle mental, théorie, fonctionnement interne, vocabulaire,
exemple minimal, exemple réaliste, code/commandes, diagramme textuel, pièges, erreurs
fréquentes, diagnostic, sécurité, performance, production, comparaison avec concepts
voisins, cas métier, entretien, pratique guidée, mini-vérification, liens
exercice/mission/Lab, synthèse, glossaire. Toutes les sections ne sont pas
obligatoires ; la pertinence prime.

## Anti-slop (qualité éditoriale non négociable)

Interdits : contenu générique type résumé encyclopédique ; template répété sans fond ;
remplissage ; « en entreprise il est important de… » sans contenu ; faux chiffres
présentés comme vérités ; commandes dangereuses sans contexte ; AWS présenté comme
synonyme d'Azure ; prétendre avoir exécuté Docker/K8s/AWS/Azure ; « isolation OS »
pour une simple protection applicative ; contenu copié entre leçons avec renommage.
Chaque fournisseur cloud est **distingué** ; chaque simulation est **étiquetée**.

## Graphe pédagogique

Chaque leçon déclare ses **prérequis** et ses **liens** (jours, exercices, Labs,
missions, leçons voisines, termes de glossaire) via la section « Liens » et les
métadonnées `skills`/`prereqs`. On ne crée **pas** de nouvelle base de données de
graphe : on réutilise les liens `/doc/lessons/<slug>`, `/day/<n>`, `/lab/<id>`,
`/glossary?q=…` déjà indexés. Chaînes visées : Linux processes → Docker → Pod →
probes → observabilité → incident ; HTTP → TLS → reverse proxy → load balancer →
cloud networking → K8s Service ; Git → CI → artefact → déploiement → rollback →
post-mortem ; IAM cloud → AWS IAM → Azure RBAC → K8s RBAC → moindre privilège.

## Gate `v26:check`

Validation **structurelle**, jamais « longueur = profondeur » : les leçons du plan
V26 existent (fichier + entrée LESSONS) ; ids/slugs uniques ; catégories cohérentes ;
métadonnées obligatoires ; sections minimales présentes ; liens internes valides
(pas de lien mort vers jour/leçon inexistant) ; concepts requis couverts (substring) ;
absence de marqueurs d'authoring (TODO/PLACEHOLDER/Lorem) ; absence de duplication
manifeste (empreinte de contenu entre leçons V26) ; périmètre V26 borné. La profondeur
réelle est jugée par l'audit humain documenté (`docs/PEDAGOGICAL-AUDIT-V26.md`).

## Parcours Cloud/DevOps

V26 prépare/active `cloud-devops-engineer-v1` (data-driven, journées réutilisées,
durée dérivée) **seulement si** le corpus le supporte réellement. Sinon, on documente
la dette. Aucun second moteur de progression ; isolation avec les 5 parcours ;
tests/surfaces rendus data-driven (aucun « 6 » codé en dur).

## Hors périmètre (reporté)

Refonte UI/UX globale, gamification, Data/Frontend/Game complets, IaC réellement
exécutée, provisioning cloud, cluster K8s réel, réécriture des 365 jours. V26 = **socle
théorique** Cloud/DevOps + parcours cohérent + backlog V27/V28.
