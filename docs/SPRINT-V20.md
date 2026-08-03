# Sprint V20 — Terminal d'exécution sécurisé, Docker Foundations & audit pédagogique

Rapport de clôture. Sprint fondé sur un audit CP0 réel. Étend l'existant : aucun
second moteur d'exécution ou de progression, aucun nouveau runtime/IDE/UI, aucun
shell arbitraire, **aucune isolation OS prétendue**.

## 1. État initial réel

- Branche `claude/ai-career-os-saas-phfg49`, baseline **`a7e5e65`** (V19 CP10).
- 628 tests verts ; tsc propre ; build sans warning.
- 4 parcours (Foundations 365 j, Full-Stack 119 j, Backend 85 j, Systems & Cloud 27 j).
- 88 exercices, 8 missions, 353 termes de glossaire, 5 runtimes.
- **Docker : CLI présent, daemon INDISPONIBLE** dans l'environnement.
- `data/progress.json` (gitignoré) au SHA initial `cea317e8`.

## 2. Divergence avec le prompt

Aucune divergence de périmètre. Une contrainte d'environnement structurante : le
**daemon Docker est indisponible** → toute l'exécution Docker réelle est
honnêtement dégradée (`unavailable`), et le bloc Docker s'appuie sur des
exercices **statiques déterministes** exécutables sans daemon.

## 3. Commits CP0 → CP10

| CP | Commit | Objet |
|---|---|---|
| CP0 | — (audit) | forensique lecture seule |
| CP1 | `bb1e404` | modèle d'audit pédagogique + gate + ADR/HSD/TSD-020 |
| CP2 | `1a3d63b` | audit pédagogique réel (rapport + registre) |
| CP3 | `4e80b11` | corrections ciblées (modèle mental j2, erreurs fréquentes surfacées) |
| CP4 | `828cc15` | modèle de terminal borné (pur) |
| CP5 | `4695899` | adaptateur local (execFile, shell:false) |
| CP6 | `5b118ef` | adaptateur Docker optionnel honnête |
| CP7 | `a6ebf39` | terminal intégré au Workbench |
| CP8 | `623618f` | Docker Foundations (contenu, exercices, missions, glossaire) |
| CP9 | `7223d57` | intégration + assainissement des gates + audit final |
| CP10 | (ce commit) | hardening, validation, rapport, prompt V21 |

## 4. État avant → après

| | Avant V20 | Après V20 |
|---|---|---|
| Tests | 628 | **681** |
| Exercices | 88 | **98** (+10 Docker) |
| Missions | 8 | **11** (+3 Docker) |
| Glossaire | 353 | **388** (+35 Docker) |
| Tâches terminal | 0 | **3** |
| Terminal exécutable | non | **oui, borné (local)** |
| Erreurs fréquentes (couverture) | 78/313 j | **312/313 j** |
| Gates courantes | v18 figée sur 3 parcours | **source-dérivées** |

## 5. Audit pédagogique

Modèle pur `lib/pedagogy-audit.mjs` : 16 dimensions × échelle 0-4, seuils
d'exploitabilité, signaux de **danger** bloquants (chmod 777 non encadré, rm -rf
destructif, isolation OS surévaluée, sécurité absolue promise, code non fermé) et
signaux **structurels** informatifs — jamais de note fondée sur le comptage de
mots. Gate `v20:pedagogy-check` : **0 signal bloquant sur 474 fichiers**, registre
de **27 items notés à la main** (moyenne récente 3,51 ; base 3,45).

## 6. Corrections pédagogiques CP3

Découverte majeure : un **bug de cohérence du générateur** masquait les
`solution.pitfalls` déjà rédigés des journées planifiées 91-365 (les jours 1-90
les rendaient déjà). Correctif **d'une ligne, purement additif** (0 ligne
retirée) : couverture « Erreurs fréquentes » **78 → 312/313**. + section « modèle
mental » ajoutée au jour 2. Aucun contenu fabriqué.

## 7. Modèle Terminal (CP4)

`lib/terminal.mjs` (pur) : `TerminalTask`/`TerminalRun`, 9 statuts, machine à
états stricte, validation d'arguments élément par élément (enum/int/flag/literal/
path) construisant l'**argv final** (jamais une chaîne shell), garde-fous de
chemin (absolu/../backslash/~/octet nul), aperçu de commande lisible, bornage de
sortie. 11 tests.

## 8. Adaptateur local (CP5)

`lib/terminal-local.mjs` : `execFile` `shell:false`, allowlist stricte (pwd, ls,
cat, head, wc, echo, node, python3, git), workspace temporaire, `timeout` +
SIGKILL, sortie plafonnée, env minimal sans secret, realpath (anti-symlink),
chemins neutralisés (anti-fuite), annulation SIGTERM→SIGKILL, cleanup idempotent.
13 tests à **exécution réelle**.

## 9. Adaptateur Docker (CP6)

`lib/terminal-docker.mjs` : détection séparée (CLI/daemon/version) → `available`/
`cli-only`/`absent`. Construction **pure** de la commande durcie (`--network none`,
`--read-only`, `--tmpfs`, `--pids-limit`, `--memory`, `--cpus`, `no-new-privileges`,
`--cap-drop ALL`, user non-root, montage borné, `--rm`, nom aléatoire). Refus :
image hors allowlist, réseau ≠ none, privileged, device, root, ressources non
bornées, socket Docker, montage de /. Exécution réelle uniquement si `available` ;
sinon `unavailable`. 8 tests.

## 10. Terminal Workbench (CP7)

Panneau Terminal **lazy** dans `/lab/[id]` (aucun code terminal hors Lab), onglet
+ zone mobile dédiés. L'apprenant choisit une tâche déclarée et des arguments
contraints — **jamais** de commande libre. Sortie en **texte brut** (jamais
HTML), statut aria-live, boutons Exécuter/Annuler/Effacer. Route
`/api/terminal/[taskId]` : actions `run|cancel|cleanup|availability`, run
synchrone borné (aucun polling), annulation par abandon de requête, garde de
concurrence, workspace seedé puis supprimé. Vérifié HTTP : ls→success sans fuite,
node exit 2→failed+stderr, arg hors énumération→rejet, Docker→`unavailable`,
action inconnue→400, tâche inconnue→404.

## 11. Contenus Docker (CP8)

Jour 320 (« dockerisation ») enrichi (additif, 0 danger) : image/conteneur/couche,
cache & ordre des couches, CMD vs ENTRYPOINT, multi-stage & taille, durcissement,
PID 1/signaux, healthcheck, diagnostic par couches. **Limite honnête : noyau
partagé ≠ isolation OS absolue.**

## 12. Exercices Docker (10)

Statiques, déterministes, **exécutables sans daemon** : ordre pour le cache,
secret exposé, exécution root, taille d'image, CMD/ENTRYPOINT, mapping de port,
.dockerignore, invalidation de cache, diagnostic de conteneur, tag vs digest.
Contrat respecté (réf verte, starter échoue, tests privés). Vérifié E2E : une
solution de référence passe **5/5** via l'API Lab, sans Docker.

## 13. Missions Docker (3)

Conteneuriser proprement une API ; diagnostiquer un incident de conteneur ;
réduire la dette d'une image legacy. Chacune : livrable **auto** (exercice réel)
+ document **structurel** + **revue humaine**. Aucun pseudo-score sémantique.

## 14. Intégration parcours / jours / compétences / révisions

Parcours Systems & Cloud : module « Conteneurs & Docker » (jours 320-321),
**27 → 29 jours**, durée **dérivée du catalogue**. Exercices Docker reliés au jour
320, atteignables depuis Foundations. Missions Docker dans `/missions`.
Compétences/révisions restent scopées au parcours actif (isolation v3). Aucun des
3 autres parcours n'est modifié.

## 15. Recherche / glossaire

Contenu Docker (exercices, missions) indexé par la recherche ; **aucune fuite**
(référence/solution/docSpec/tests privés absents de l'index — vérifié).
Glossaire +35 termes Docker (image, couche, registry, digest, Dockerfile,
multi-stage, volume, bridge, healthcheck, PID 1, namespace, cgroup, distroless,
SBOM, supply chain, container escape, socket Docker…), `glossary:check` vert.

## 16. Sauvegarde / import

Round-trip vérifié : état d'une mission Docker (livrable + preuve d'exercice +
jour) préservé après export/import ; **aucune donnée volatile** (runToken,
containerId, pid, stdout, workspaceDir, runId) dans la sauvegarde. Migration
additive ; anciennes sauvegardes importables.

## 17. Sécurité

`execFile`/`spawn` `shell:false` partout ; binaire ∈ allowlist ; argv validé ;
chemins bornés (absolu/../symlink/octet nul rejetés) ; env minimal sans secret ;
sortie plafonnée ; timeout + SIGTERM→SIGKILL ; cleanup idempotent. Docker durci
(network none, read-only, cap-drop, no-new-privileges, non-root, sans socket,
sans privileged). Aucune isolation OS prétendue (gate de danger bloque les
formulations trompeuses).

## 18. Anti-fuite

Aucune solution, code apprenant, test privé, référence, secret, chemin hôte ou
sortie brute indexé ou persisté. Vue publique des tâches sans seedFiles/dockerImage.
Chemins de workspace neutralisés dans stdout/stderr/diagnostic.

## 19. Tests

**681 tests verts** (628 → 681 : +11 audit, +11 terminal, +13 local, +8 Docker,
+4 tâches, +6 intégration, ajustements). `tsc --noEmit` propre. Suites ciblées
terminal/Docker/missions/progression/multi-parcours/sauvegarde/recherche/
anti-fuite/glossaire/audit toutes vertes.

## 20. Validation navigateur

**Playwright n'est pas installé** dans l'environnement (et n'a pas été ajouté
comme dépendance lourde injustifiée). Validation réalisée : **build de production
sans warning + serveur `next start` réel + matrice HTTP**. 16 routes testées
(`/`, `/parcours`, `/calendar`, `/day/320`, `/day/72`, `/lab`, `/lab/sys-perms-
to-octal`, `/lab/docker-detect-secret`, `/missions`, 2 missions Docker, `/skills`,
`/revisions`, `/glossary`, `/synthese`, `/settings`) → **toutes 200**. Contenu
vérifié (Docker foundations rendues au jour 320, onglet Terminal présent, glossaire
Docker, exercice Docker 5/5 via l'API, terminal Docker `unavailable` honnête).
**Non vérifié faute d'outil visuel** : rendu pixel aux largeurs 375/768/1024/1440/
1920, focus visible, absence d'overflow horizontal — à valider par une revue
humaine ou une session avec navigateur automatisable.

## 21. Accessibilité

Panneau Terminal : `role="region"`/`aria-label`, statut `role="status"`
`aria-live="polite"`, boutons natifs (clavier), sortie en `<pre>` scrollable,
`.spin` respecte `reduced-motion` (réutilise l'existant). Validation clavier
réelle non couverte sans outil visuel (revue humaine recommandée).

## 22. Responsive

Onglet Terminal ajouté aux zones mobiles (`mv`) du Workbench, sélectionnable comme
Code/Tests/Console, une zone active à la fois. Sortie bornée dans un panneau
`overflow:auto`. CSS en unités relatives, `max-width:100%`, `overflow-x:auto` sur
la commande. Rendu pixel non vérifié sans navigateur (cf. §20).

## 23. Performances

Run terminal borné (timeout ≤ 5 s local), sortie plafonnée (≤ 256 Ko), **aucun
polling** (run synchrone, annulation par abandon de requête). Détection Docker
bornée (timeout 4 s). Aucune fuite de processus (cleanup + adaptateur RUNNING
vidé) ; aucun workspace résiduel (vérifié).

## 24. Bundles

Référence CP0 tenue : **shared 103 kB**, `/lab/[id]` **118 kB** (CodeMirror +
terminal **lazy**), `/day/[id]` 116 kB, `/` 109 kB, autres 106-110 kB. **Aucune
régression** ; aucun code terminal/Docker dans les bundles hors Lab (Docker et
compilateurs restent serveur ; le panneau Terminal est un chunk lazy).

## 25. Disponibilité réelle de Docker

`cli-only` (CLI présent, daemon indisponible). Conséquences assumées : les
exercices Docker sont **statiques** (analyse, exécutables sans daemon) ; le
terminal Docker renvoie `unavailable` ; aucun faux succès. Les smoke tests Docker
réels ne s'exécutent que si un daemon devient disponible.

## 26. Limites honnêtes

- Un terminal borné n'est pas un shell généraliste.
- Un workspace n'est pas une isolation OS ; un conteneur partage le noyau — pas
  d'isolation absolue.
- Docker peut être indisponible ; certains exercices Docker sont nécessairement
  statiques sans daemon ; Docker Compose n'est pas Kubernetes.
- L'évaluation automatique ne mesure pas la qualité sémantique d'une documentation
  → revue humaine obligatoire pour les missions documentaires.
- La qualité pédagogique n'est pas prouvée par des tests logiciels ; un audit
  statique ne remplace pas l'observation d'apprenants réels.
- V20 audite en profondeur 16 journées sur 365 : il **ne certifie pas** les 365.

## 27. Dette restante

- `v17:check` / `v19:check` : snapshots historiques figés (documentés, non
  bloquants) — non « réparés » volontairement.
- Généralisation des **quiz** (77 journées sans rappel actif) : reportée.
- Exercices Docker **réels** (build/run) : à activer quand un daemon est présent.
- Validation navigateur **visuelle** (matrice de largeurs) : à faire avec un outil.

## 28. État Git final

HEAD `<commit CP10>` ; local == origin ; working tree propre ; `data/progress.json`
gitignoré, restauré au SHA initial `cea317e8` ; aucun workspace, serveur ou
conteneur résiduel.

## 29. SHA final des données

`data/progress.json` : **`cea317e8`** (identique au CP0). `data/program.json` :
inchangé (seul `generatedAt` volatil régénéré puis restauré). Curriculum : seuls
les jours 1/2/71/72/320 + les jours 91-365 (section « Erreurs fréquentes »
surfacée) ont changé, tous de façon additive et vérifiée.

## 30. Prompt de reprise — Sprint V21

> **Sprint V21 — CI/CD, orchestration légère & durcissement de la chaîne de livraison**
>
> Tu reprends « AI Career OS » (app locale mono-utilisateur, une seule
> `progress.json` v3, 4 parcours, terminal borné + Docker Foundations livrés en
> V20). Commence par un **audit CP0 lecture seule** (ne suppose rien) : lis
> `docs/SPRINT-V20.md`, ADR/HSD/TSD-020, `docs/architecture/v20-gates-strategy.md`,
> les adaptateurs terminal (`lib/terminal*.mjs`), le modèle d'audit
> (`lib/pedagogy-audit.mjs`) et le registre. Vérifie git, données, gates, Docker.
>
> **Objectif** : sur les fondations V20, bâtir un bloc **CI/CD & livraison**
> honnête — pipelines (build → test → lint → package), reproductibilité, gestion
> des artefacts, stratégies de déploiement (blue-green, canary au niveau
> conceptuel), rollback, et une **introduction bornée à l'orchestration** (Compose
> multi-services ; Kubernetes au niveau conceptuel, JAMAIS présenté comme
> disponible). Toujours : **aucune isolation OS prétendue**, aucun secret réel,
> aucune exécution non bornée, une seule progression v3, réutilisation stricte des
> moteurs V18 (missions) et du modèle d'audit V20.
>
> **Périmètre proposé (à confirmer au CP0)** :
> 1. **Audit pédagogique** des journées CI/CD/observabilité existantes (mois 11,
>    ex. 325 observabilité, 326 CI) via `v20:pedagogy-check` ; corriger les
>    défauts démontrés (additif, ciblé).
> 2. **Modèle de pipeline pur** (`lib/pipeline.mjs`) : étapes typées, dépendances,
>    statuts, échec-rapide, artefacts — testable sans exécuter de CI réelle.
> 3. **Exercices CI/CD déterministes** (8-12) : ordonner des étapes, détecter une
>    étape non reproductible, diagnostiquer un pipeline rouge, valider un cache de
>    build, repérer un secret dans un workflow, choisir une stratégie de rollback.
> 4. **Missions** (≥3) : concevoir un pipeline de bout en bout ; diagnostiquer un
>    déploiement échoué ; durcir une chaîne de livraison (supply chain, SBOM,
>    digests). Moteur V18, évaluation honnête (auto + structurel + revue).
> 5. **Panneau « Pipeline »** optionnel dans le Workbench (lazy, réutilise
>    l'interface d'exécution bornée si une simulation locale déterministe suffit ;
>    sinon pur modèle), sans nouveau runtime.
> 6. **Glossaire** +25-45 termes (pipeline, artefact, runner, matrix build, cache,
>    blue-green, canary, rollback, IaC, drift, promotion, gate de déploiement…).
> 7. **Intégration** au parcours Systems & Cloud (jours existants du mois 11),
>    recherche, révisions, sauvegarde ; **assainir** les gates si besoin (dériver
>    des sources).
>
> **Discipline** : CP0→CP10, gate anti-danger `v20:pedagogy-check` maintenue verte,
> `progress.json` sauvegardé au CP0 et **restauré au SHA initial** après toute
> validation mutatrice (les runs via l'API Lab écrivent des preuves — restaurer !),
> workspaces supprimés, serveurs arrêtés, conteneurs nettoyés, build + tsc verts,
> bundles non régressés (terminal/CI lazy hors Lab), rapport `docs/SPRINT-V21.md`
> + prompt V22. Ne démarre pas V22. Ne prétends JAMAIS une isolation, une
> disponibilité ou une réussite que tu ne fournis pas. Valide réellement au
> navigateur si un outil visuel est disponible ; sinon documente la limite.
