# Audit pédagogique V27 — durcissement débutant des leçons Cloud/DevOps

> Sprint V27 « Cloud/DevOps Practice Studio & Pedagogical Hardening ».
> Priorité : qualité pédagogique réelle > accessibilité néophyte > cohérence >
> exactitude > pratique délibérée > robustesse. Local, sans réseau, sans cloud réel.

## 1. Méthode d'audit

Trois niveaux combinés (aucun ne suffit seul) :

1. **Structurel automatisé** — gate `v27:check` : on-ramp « Le problème d'abord »
   AVANT l'Objectif, prérequis explicités (pas un lien nu), vocabulaire, sections
   minimales, absence de placeholders, liens internes valides, `practiceRefs`
   résolus, graphe de prérequis acyclique, scan réel/simulé. Ne juge JAMAIS la
   profondeur par la longueur.
2. **Rubrique humaine 16 dimensions (0-4)** — `lib/pedagogy-audit.mjs`, ledger
   `docs/architecture/v27-pedagogy-audit.json`. Seuils : moyenne ≥ 3,25 (contenu
   récent) ; dimensions obligatoires ≥ 3 (exactitude, objectif, progression,
   pratique autonome) ; aucune dimension < 2.
3. **Parcours « néophyte complet »** — lecture de bout en bout d'un échantillon (une
   leçon par domaine), en répondant aux 12 questions de validation débutant (§5).

Distinction maintenue entre **couverture** (le sujet est-il là ?), **profondeur**
(est-ce sérieux ?), **clarté** (un débutant comprend-il ?), **exploitabilité
pratique** (peut-il s'entraîner ?) et **qualité professionnelle** (est-ce crédible
en poste ?).

## 2. Problème initial (rappel CP0)

Les 32 leçons V26 étaient **exactes et bien structurées** mais, pour un néophyte :
ouvraient sur du jargon (Objectif) sans situation concrète ; prérequis = un lien nu ;
pratique déconnectée (les ~75 exercices et ~30 missions Cloud/DevOps n'étaient reliés
à AUCUNE leçon). Faiblesses récurrentes : `accessibility`, `prerequisites`,
`progression`, `autonomous-practice`, `cognitive-load`, `track-coherence`.

## 3. Corrections apportées (V27)

- **On-ramp « 🌍 Le problème d'abord »** ajouté aux **32** leçons : situation
  concrète + problème + intuition sans jargon, AVANT l'Objectif.
- **Prérequis explicités** sur les 32 : « ce qu'il faut déjà savoir ET pourquoi ».
- **Graphe leçon → pratique** (`practiceRefs`) : **32/32** leçons reliées à au moins
  un artefact EXISTANT (exercice / Lab / mission). Les leçons Linux permissions,
  systemd et ssh — sans pratique jusqu'ici — en ont désormais une.
- **12 exercices ciblés** comblant des trous réels (permissions/traversée, signaux,
  systemd, descripteurs, ssh, DNS, TLS, HTTP idempotence, IaC, Compose) — sans
  doublon.
- **1 mission** `iac-drift-remediation` (seul trou de missions).
- **Ajouts pédagogiques ponctuels** : « Exemple guidé » manquant sur `linux-ssh-remote` ;
  blocs « 🚑 Que faire dans ce cas ? » (Docker/CI-CD).
- **Surface « 🎯 Pratique associée »** sous chaque leçon (liens cliquables).

## 4. Matrice de scores avant / après (rubrique 16 dimensions)

Scores APRÈS dans `docs/architecture/v27-pedagogy-audit.json`. Deux profils honnêtes :

| Profil | Leçons | Moyenne après | Dimensions relevées vs V26 |
|---|---|---|---|
| Standard | 23 leçons | ≈ 3,56 / 4 | accessibility 2→4, prerequisites 2→3, progression 3→4, autonomous-practice 2→3, track-coherence 3→4 |
| Dense / critique | 9 leçons | ≈ 3,44 / 4 | idem, mais accessibility 2→3 et cognitive-load maintenu à 3 (sujet plus riche) |

Moyenne globale des 32 leçons **≈ 3,53 / 4**. **Aucune** dimension < 2 ; toutes les
dimensions obligatoires ≥ 3. Les 9 leçons « denses/critiques »
(`networking-http-tls`, `cloud-aws-core`, `cloud-azure-core`, `k8s-troubleshooting`,
`iac-fundamentals`, `cloud-finops`, `ci-cd-quality-gates-artifacts`,
`linux-resources-io`, `docker-images-layers`) passent le seuil mais restent les plus
exigeantes pour un débutant : à surveiller (voir §6).

Estimation AVANT V27 (CP0, mêmes dimensions) : moyenne ≈ 3,1-3,2 avec
`accessibility`/`prerequisites`/`autonomous-practice` fréquemment à 2 — plusieurs
leçons sous le seuil de 3,25 pour un contenu « récent ». Le durcissement fait passer
l'ensemble au-dessus du seuil de façon nette.

## 5. Validation « néophyte complet » (échantillon, 1 par domaine)

Échantillon audité de bout en bout : `linux-filesystem-permissions`, `networking-dns`,
`docker-images-layers`, `ci-cd-pipeline-anatomy`, `k8s-troubleshooting`,
`cloud-fundamentals`, `cloud-aws-core`, `cloud-azure-core`, `iac-fundamentals`,
`cloud-finops`. Chacune porte : on-ramp ✓, exemple guidé ✓, mini-exercice ✓,
vocabulaire ✓, ≥1 practiceRef ✓ (vérifié automatiquement).

Réponses aux 12 questions (synthèse représentative) :

- **Prérequis avant de commencer ?** Oui, désormais explicités (« ce qu'il faut
  savoir ET pourquoi ») et reliés, ex. DNS → adressage IP ; K8s troubleshooting →
  workloads/services/config.
- **Problème concret résolu ?** Oui, énoncé dès l'on-ramp (« Permission denied »,
  « c'est toujours le DNS », build lent, incident = écart désiré/observé, facture qui
  dérape…).
- **Premier exemple compréhensible sans expérience ?** Oui : l'on-ramp est
  jargon-free et amène le vocabulaire avant l'usage.
- **Chaque terme défini ?** Oui au premier usage ; section Vocabulaire présente.
- **L'apprenant peut-il reformuler / résoudre une variante ?** Oui : mini-exercice +
  practiceRefs (exercices déterministes distincts de l'exemple).
- **La pratique vérifie-t-elle le concept ?** Oui : exercices avec test public
  échouant sur un starter faux, référence verte.
- **Erreurs fréquentes + raisonnement de correction ?** Oui (sections dédiées +
  « Que faire dans ce cas ? »).
- **Lien professionnel crédible ?** Oui (cas métier).
- **Réel/simulé honnête ?** Oui : aucune exécution réelle affirmée ; conteneur ≠ VM ;
  Secret K8s = base64 ; AWS ≠ Azure.

Aucune leçon de l'échantillon n'est restée sous le seuil après durcissement.

## 6. Contenus non corrigés et raisons

- Les 9 leçons denses restent **plus exigeantes** (sujet intrinsèquement riche :
  HTTP+TLS, tout le troubleshooting K8s, IAM/Entra ID). Choix ASSUMÉ : ne pas les
  scinder en V27 (hors périmètre, risque de fragmenter la cohérence) ; elles passent
  le seuil. Découpage éventuel à étudier en V28.
- Les `practiceRefs` de kind `playbook` ne sont pas rendus comme liens (pas de route
  dédiée) ; les Labs `terminal`/`cloud-topology` non plus (non utilisés).

## 7. Dette pédagogique restante

- Journées/Labs de pratique DÉDIÉS pour faire mûrir `cloud-devops-engineer-v1` d'un
  niveau junior vers un niveau plus complet (le parcours réutilise des jours
  existants).
- Observabilité approfondie (métriques/logs/traces, SLI/SLO/error budget) : leçons de
  fond dédiées manquantes.
- Domaines hors Cloud/DevOps (Data, Frontend) : rééquilibrage non traité.

## 8. Priorités V28 / V29

- **V28** : observabilité, incidents, SRE et fiabilité (métriques/logs/traces, SLO,
  error budget, runbooks) + 2ᵉ vague de durcissement (leçons denses : envisager un
  découpage progressif) + éventuelle route de rendu pour playbooks.
- **V29** : rééquilibrage des bibliothèques Data/Frontend ; pratique dédiée avancée
  (labs K8s/IaC guidés) ; audit a11y automatisé (axe).

## 9. Limites de l'audit (honnêteté)

- La rubrique et le scan sont des **proxys** : ils ne prouvent pas la compréhension
  d'un apprenant réel. La validation néophyte est une lecture experte simulant un
  débutant, pas un test utilisateur.
- Les scores sont attribués par profil (standard/dense), pas dimension par dimension
  et leçon par leçon de façon indépendante — approche assumée vu le traitement commun,
  mais qui lisse des différences fines.
- Aucun test d'accessibilité automatisé (contraste/lecteur d'écran) n'a été exécuté.
- Aucune affirmation non vérifiée : toutes les mentions « validé » ci-dessus
  correspondent à une vérification automatisée ou à une lecture effective.
