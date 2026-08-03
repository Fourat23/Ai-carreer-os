# ADR-024 — Security & Incident Lab (analyse déterministe de configurations)

Statut : accepté (Sprint V24). Décision fondée sur l'audit CP0 réel. Étend
l'existant ; aucun second moteur de progression, aucune source de vérité parallèle,
aucun nouveau Workbench, **aucun réseau**, aucun scanner tiers, aucun secret réel,
aucune revendication d'isolation OS.

## Problème produit

L'audit CP0 montre que la sécurité est enseignée par touches (OWASP jour 67, auth &
secrets jour 68, durcissement jour 85, secrets jour 298, RBAC/workloads en 320-321)
mais qu'il **manque un fil conducteur pratique** : gestion et **rotation/révocation
des secrets**, **supply chain** (lockfiles, pinning, typosquatting, dependency
confusion, SBOM, provenance), **moindre privilège / RBAC** analysés sur des cas
concrets, et surtout la **réponse à incident** (détection → confinement →
éradication → récupération → post-mortem) avec la décision **rollback / roll-forward
/ hotfix / mitigation / révocation / rotation**. Il n'existe aucune surface pour
*analyser une configuration, diagnostiquer un défaut de sécurité, comparer l'état
vulnérable et corrigé, et dérouler un playbook d'incident*.

## Décision : un ANALYSEUR DÉTERMINISTE, pas un scanner de sécurité

V24 livre un **modèle de scénario de sécurité** + un **analyseur de règles pur** +
un **simulateur de réponse à incident** + un **Security & Incident Lab** intégré, et
un **5ᵉ parcours** AppSec & Cloud Security. Le produit dit clairement ce qu'il est :

- un **laboratoire d'analyse de sécurité pédagogique** sur fixtures locales ;
- **pas** un SAST, **pas** un scanner de dépendances, **pas** un audit
  professionnel, **pas** une console cloud, **pas** un accès à une base CVE
  distante, **pas** une garantie de détecter toutes les vulnérabilités.

### D1 — Trois niveaux honnêtement séparés

1. **Analyse RÉELLE et déterministe** sur des artefacts LOCAUX (config, manifeste,
   diff de lockfile, RBAC, en-têtes) — `lib/security.mjs` + `security-analysis.mjs`,
   PURS.
2. **Simulation** d'incident (fuite de secret, dépendance compromise, accès
   compromis) — `lib/security-incident.mjs`, allowlist déterministe.
3. **Environnement externe NON vérifié** : tout ce qui dépendrait d'un vrai
   registre / d'Internet / d'un cluster est **hors périmètre** et présenté comme
   tel. Aucune base CVE distante : une base de vulnérabilités **factice, locale et
   versionnée** sert de référentiel pédagogique.

### D2 — Threat model du laboratoire

Le Lab n'exécute rien et ne fait aucune I/O réseau ; sa surface d'attaque se limite
à des **entrées de données** (artefacts de scénario, ou contenu d'éditeur borné).
Menaces traitées par conception : injection (aucun `eval`/`Function`/`vm`/shell),
pollution de prototype (clés dangereuses refusées), déni de service (tailles/
profondeurs/nombre d'éléments bornés, aucune récursion incontrôlée), traversal
(aucune écriture hors workspace), **fuite** (vues publiques anti-secret ;
solution/test privé jamais indexés ni bundlés). Un **Namespace/securityContext**
n'est **jamais** présenté comme une isolation OS.

### D3 — Modèle de diagnostic (preuve + niveaux)

Chaque diagnostic porte `code` stable, `severity` (**blocking / risk / warning /
observation**), `domain`, `resource`, `path`, `message`, `explanation`, `risk`,
`recommendation`, `remediationOrder?`, `autofixable`, `confidence` (le degré de
certitude — les faux positifs sont assumés), `real` (analyse réelle) vs `simulated`,
`cwe?` (conceptuel), `glossary`. **Aucune note magique** ; la synthèse agrège par
sévérité et domaine et **liste les limites**.

### D4 — Détection de secrets prudente (faux positifs assumés)

La détection ne classe **pas** aveuglément toute chaîne comme secret : elle combine
motifs reconnaissables (préfixes `sk-`/`ghp_`/`AKIA`/`xox`, clés PEM, entropie
élevée sur longueur suffisante) **et** contexte (nom de champ `password`/`token`/…),
avec un champ `confidence` et une documentation explicite des **faux positifs et
limites**. **Aucun secret réel** n'entre dans le dépôt : toutes les valeurs sont
**factices et explicitement reconnaissables** (ex. `FAKE_…`, `changeme`, motifs de
démonstration). Une gate vérifie qu'aucune chaîne ressemblant trop à un vrai secret
ne traîne.

### D5 — Modèle de réponse à incident

`lib/security-incident.mjs` déroule des phases déterministes : **détection →
qualification (sévérité) → confinement → éradication → récupération → retour
d'expérience (post-mortem)**. Pour un secret : **révocation → rotation →
redéploiement** dans cet ordre. Le vocabulaire est précis : **bugfix** (correction
normale), **hotfix** (urgent en prod), **patch** (livraison corrective limitée),
**rollback** (version précédente), **roll-forward** (nouvelle version corrective),
**mitigation** (réduire l'impact sans supprimer la cause), **révocation** (invalider
un credential), **rotation** (remplacer un secret). Critère **rollback vs
roll-forward** : réversibilité (migration non rétrocompatible → roll-forward) et
urgence.

### D6 — « Que faire dans ce cas ? » (surface pilotée par données)

Extension du patron introduit en V23 (jour 321) : des **playbooks** structurés
(symptômes → premières vérifications → à ne pas faire → confinement → communication
→ correction → validation → déploiement → surveillance → documentation →
post-mortem → prévention → critères de sortie d'incident), **pilotés par des
données** (`data/playbooks/*.json`), en lecture seule vis-à-vis de la progression,
retrouvables par la recherche.

## Intégration (données pilotent les surfaces)

Aucune valeur magique : le catalogue, les parcours (`buildCatalogue`), les
exercices, missions, preuves, compétences, glossaire, recherche, sauvegarde v3 et
Labs sont **étendus**, jamais dupliqués. Le 5ᵉ parcours **AppSec & Cloud Security**
dérive ses jours des données (non contigu, modules cohérents), sans total codé en
dur ni condition `trackId === "…"` dispersée.

## Stratégie d'imports & discipline de bundle

`SECURITY_CAPS` borne tailles/profondeurs/nombre d'artefacts. Analyse/simulation
**côté serveur** (absentes des bundles client). Si un éditeur est nécessaire :
**CodeMirror en lazy**, types de fichiers limités, **aucune exécution**, rien de
lourd hors route Lab. **Aucune dépendance ajoutée**, aucun paquet mis à jour, aucun
CDN.

## Sécurité d'implémentation

Modèle/analyse/incident **purs** : aucun `eval`, `Function`, `vm`, `exec*`, `spawn`,
`shell`, aucune I/O réseau, aucun argument utilisateur injecté dans une commande,
aucun import dynamique depuis une valeur utilisateur. Entrées validées par schéma,
normalisées, bornées, en allowlist. Secrets **factices** uniquement.

## Alternatives rejetées

- **Scanner de dépendances / SAST réel, base CVE distante** — réseau + non
  déterministe + hors nature locale : rejeté ; base CVE **factice locale versionnée**.
- **Exécuter les artefacts** (kubectl apply, docker run, npm install de scénario) —
  dangereux et inutile : rejeté ; analyse statique/simulation seulement.
- **Nouveau Workbench / éditeur dédié** — contraire à la réutilisation : rejeté ;
  patron des Labs V21-V23 réutilisé.
- **Notation sémantique par IA des livrables** — malhonnête : rejeté ; validation
  **structurale** distincte de la **revue humaine**, affichée clairement.
- **Détection de secret « tout est secret »** — trop de faux positifs : rejeté ;
  motif + contexte + `confidence` + limites documentées.

## Limites honnêtes

Analyseur déterministe sur **fixtures locales**, **pas** un audit exhaustif ni un
scanner ; il ne détecte pas toutes les vulnérabilités ; les CVE proviennent d'une
base **factice** ; les incidents/environnements externes sont **simulés** ; la
qualité **sémantique** des livrables (runbook, post-mortem, plan de containment) est
en **revue humaine** ; aucune isolation OS.

## Conséquences (voir HSD-024 / TSD-024)

Nouveaux modules `lib/security*.mjs` (+ `.d.ts`), `lib/security-server.ts`,
`data/security/*.json`, `data/playbooks/*.json`, `app/security/**`,
`app/api/security/**` ; gate **`v24:check`** ajoutée à `gates:active` ; 5ᵉ parcours ;
enrichissement additif ciblé ; exercices/missions/glossaire ; surface playbooks.
