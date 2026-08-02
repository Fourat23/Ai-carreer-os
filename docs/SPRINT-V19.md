# Sprint V19 — Fondations opérationnelles Linux, système, CLI & réseaux

Rapport de clôture. Sprint fondé sur un audit CP0 réel (non supposé). Transforme
des notions surtout **mentionnées/expliquées** (terminal, Linux, réseau, SSH,
diagnostic) en fondations réellement **pratiquées et évaluées**, et ouvre un
**4ᵉ parcours disponible**, en ÉTENDANT l'existant (ADR-019) : une seule
progression v3, aucun second moteur, aucun second catalogue, aucun nouveau
runtime/IDE/UI, **aucun shell arbitraire**, **aucune isolation OS prétendue**.

## 1. État initial (audité au CP0)

- Branche `claude/ai-career-os-saas-phfg49`, baseline **`84dc1f5`** (V18 clos).
- 617 tests verts ; `tsc` propre ; build sans warning ; gates `v17:check`,
  `v18` (tests), `curriculum:check`, `glossary:check` vertes.
- 3 parcours disponibles : Foundations (365 j), Full-Stack (119 j), Backend (85 j).
- 76 exercices, 4 missions, glossaire à 297 entrées.
- Linux/terminal/réseau : surtout en **prose** (j1, j2, j50, j71, j72) ; systemd/
  journalctl, SSH par clés, inode/descripteurs, rwx↔octal, umask **absents**.
- `data/progress.json` : état local mono-utilisateur, **gitignoré** (jamais
  committé), sauvegardé au CP0 dans le scratchpad.

## 2. Anomalie

Aucune anomalie nouvelle. Aucun historique réécrit.

## 3. Architecture retenue (ADR-019)

- **Contenu** : la source de vérité reste `scripts/data/*.mjs` → `curriculum/**`
  + `data/program.json`. Mutation **contrôlée** de 2 modules seulement, verrouillée
  par une gate anti-dérive (`v19:check`).
- **4ᵉ parcours** : `systems-cloud-foundations-v1` défini par
  `SYSTEMS_CLOUD_MODULE_SPECS` dans `lib/catalogue.mjs` — **réutilise** des
  journées existantes (plages de jours), aucun jour créé, aucun curriculum copié,
  durée **dérivée** de `resolveTrackDays`.
- **Exercices** : `data/exercises/*.json` (contrat V7 inchangé), **fonctions
  pures sur fixtures**, liés aux jours par `data/day-exercises.json`.
- **Missions** : `data/missions/*.json` via le **moteur V18 inchangé**.
- **Glossaire / recherche / révisions / progression** : surfaces existantes,
  intégration additive.

## 4. Résumé avant → après

| | Avant V19 | Après V19 |
|---|---|---|
| Terminal / Linux / réseau | mentionnés, expliqués en prose | **pratiqués** (12 exercices) et **évalués** (4 missions) |
| Sujets absents | systemd/journalctl, SSH clés, inode/fd, rwx↔octal, umask | **enrichis** (j1, j2, j71, j72) |
| Parcours disponibles | 3 | **4** (+ Systems & Cloud Foundations, 27 j) |
| Exercices | 76 | **88** (+12 déterministes) |
| Missions | 4 | **8** (+4 : port, permissions, DNS/TLS/HTTP, ressources) |
| Glossaire | 297 | **353** (+56 termes opérationnels) |
| Tests | 617 | **628** |

## 5. Checkpoints

- **CP0** audit lecture seule ; **CP1** ADR-019 ; **CP2** modèle de couverture pur
  + gate `v19:check` ; **CP3** terminal & Linux (j1, j2, j72) ; **CP4** réseau,
  SSH & diagnostic (j71) ; **CP5** 12 exercices ; **CP6** 4 missions ; **CP7** 4ᵉ
  parcours ; **CP8** glossaire +56 & recherche ; **CP9** E2E 4 parcours & backup ;
  **CP10** durcissement, validations, ce rapport + prompt V20.

## 6. Commits

```
4857413 docs(adr): ADR-019 — fondations Linux/système/réseau & 4e parcours (V19)
30d493c feat(v19): CP2 — modèle de couverture + gate anti-dérive
b3b4d04 feat(v19): CP3 — fondations terminal & Linux opérationnel (j1, j2, j72)
f8a22d0 feat(v19): CP4 — réseau opérationnel, SSH & diagnostic par couches (j71)
e43c19c feat(v19): CP5 — 12 exercices déterministes systèmes/réseau
65b063f feat(v19): CP6 — 4 missions systèmes/réseau (moteur V18 inchangé)
e300559 feat(v19): CP7 — 4ᵉ parcours « Systems & Cloud Foundations »
aea4700 feat(v19): CP8 — glossaire +56 termes opérationnels, intégration recherche
f6aaecf test(v19): CP9 — E2E multi-parcours (4 parcours), sauvegarde & migration additive
```
(+ le commit CP10 portant ce rapport.)

## 7. 4ᵉ parcours — Systems & Cloud Foundations

- Id `systems-cloud-foundations-v1`, statut **disponible**, **27 journées**
  dérivées (non contigu — saut du jour 82 Python, comme Backend).
- 6 modules réutilisant l'existant : terminal/shell/Git (1-7), HTTP/services
  (50-56), sécurité/secrets (67-68), réseau/Linux/CLI avancés (71-73),
  architecture/observabilité (78-81), consolidation/durcissement (83-86).
- Apparaît dans `/parcours` ; fonctionne avec Dashboard, calendrier, Vue Jour,
  Lab, Missions, Compétences, Révisions, recherche, Synthèse ; s'active/se quitte
  sans perte via l'isolation native de la progression v3 ; **ne contamine aucun
  autre parcours** (vérifié E2E). Les 3 parcours existants restent **intacts**
  (365 / 119 / 85 jours inchangés).

## 8. Journées enrichies (mutation contrôlée)

- **j1** : quoting (`'` vs `"`), globbing (`* ? [...]` développés par le shell).
- **j2** : redirections (`>`, `>>`, `2>`, `<`), pipes, chaînage `&&` / `||`.
- **j71** : ports/sockets/localhost, SSH par clés (privée/publique, `known_hosts`,
  agent, tunnel), méthode de diagnostic **par couches** (DNS→port→TLS→HTTP).
- **j72** : rwx↔octal détaillé, umask (soustraction), inode/descripteurs de
  fichiers, signaux (SIGTERM/SIGKILL), services & journaux (systemd/journalctl).

## 9. Exercices ajoutés (12, déterministes)

`sys-perms-to-octal`, `sys-perms-to-symbolic`, `sys-umask-apply`,
`sys-process-top-cpu`, `sys-port-listener`, `sys-log-level-counts`,
`net-layer-classify`, `net-dns-resolve`, `net-http-status-class`,
`net-first-failure`, `sh-pipeline-run`, `sh-exit-retry`.

Tous : **fonctions pures sur fixtures**, contrat respecté (starter non trivial,
référence 100 % verte, ≥ 1 test public échoue sur le starter, tests privés réels,
compétences de la micro-taxonomie existante, journée liée). Vérifiés par
exécution dans `tests/v19-exercises.test.mjs`.

## 10. Missions ajoutées (4)

- `port-occupe-service-indisponible` (incident) — EADDRINUSE, PID qui occupe le
  port, résolution propre, journal d'incident.
- `permissions-secret-expose` (incident/sécurité) — secret en 666, permissions
  correctes (600), umask sain, remédiation + rotation, moindre privilège.
- `incident-dns-tls-http` (incident) — diagnostic par couches, postmortem.
- `saturation-ressources` (performance) — ressource saturée par les métriques,
  processus gourmands, plan ordonné par coût.

Chaque mission : 1 livrable **auto** (exercice réel V19) + document en validation
**structurelle** honnête + **revue humaine** obligatoire. Aucun pseudo-score de
qualité, aucune fausse IA. Vérifié par `tests/v19-missions.test.mjs`.

## 11. Séparation simulation / réalité

Toutes les représentations (permissions, processus, logs, table DNS, réponses
par couche) sont des **modèles déterministes explicitement étiquetés** dans les
énoncés. **Aucun shell arbitraire** (aucun `shell:true`/`eval`/`exec`/
`child_process` dans le code livré — vérifié). L'application **ne prétend jamais**
simuler un OS réel ni offrir une isolation OS ; le terminal réel et Docker sont
**explicitement renvoyés à V20**.

## 12. Tests & gates

- **628 tests verts** (617 → 628 : +8 couverture, +3 exercices/missions/E2E).
- `tsc --noEmit` propre ; **build de production sans warning**.
- Gates vertes : `v19:check` (plan cohérent, **aucune dérive hors périmètre**),
  `glossary:check`, `curriculum:check`.

## 13. Validations serveur (rendu réel)

`next start` puis requêtes HTTP : `/parcours` (200, « Systems &amp; Cloud
Foundations » + id du parcours présents), `/lab/sys-perms-to-octal` (200),
`/lab/net-dns-resolve` (200), `/missions/port-occupe-service-indisponible` (200),
`/missions/incident-dns-tls-http` (200), `/day/72` (200), `/glossary` (200).
Serveur arrêté après validation ; 0 workspace résiduel.

## 14. E2E (4 parcours)

`tests/v19-e2e.test.mjs` : enrôlement du 4ᵉ parcours, progression (jour +
compétence + preuve d'exercice + mission), sauvegarde/restauration **sans perte
ni contamination** de Foundations, aucune solution/test privé exporté, migration
additive = no-op, non-contiguïté (saut du jour 82) vérifiée.

## 15. Bundles & performance

CodeMirror, compilateurs et previews restent **lazy et confinés à `/lab/[id]`**
(≈ 118 kB) ; les autres routes restent à 103-116 kB — **aucun runtime lourd**
n'entre dans les bundles non-Lab. Le 4ᵉ parcours n'ajoute aucun poids client
(données dérivées côté serveur). Sorties et historiques bornés.

## 16. Sécurité & anti-fuite

Application locale mono-utilisateur, sans réseau/CDN/auth/SaaS. Aucune exécution
arbitraire de shell. Aucune solution, aucun code apprenant, aucun secret, aucun
test privé indexé ou envoyé au client (vérifié dans l'export de sauvegarde et la
vue publique des missions).

## 17. Sauvegarde / migration

Additif : le 4ᵉ parcours est un nouvel identifiant de track ; les progressions
sans lui restent valides (migration = no-op). La sauvegarde v3 préserve l'état
du nouveau parcours (jours, compétences, missions).

## 18. `data/progress.json`

Fichier **gitignoré** (état local mono-utilisateur, jamais committé). Aucun test
mutateur n'écrit dans le fichier réel (l'E2E opère en mémoire). Vérifié
**byte-identique** à l'instantané pris au CP0 — **inchangé par V19**.

## 19. Limites honnêtes

- Les exercices « système » sont des **modèles déterministes**, pas un vrai OS :
  ils enseignent le raisonnement (calcul de permissions, lecture de signaux,
  diagnostic par couches), pas l'exécution réelle.
- Les missions documentaires sont évaluées **structurellement** (sections,
  mentions, taille) + **revue humaine** — jamais un jugement de qualité automatique.
- Certains outils diffèrent selon le système (`ss`/`netstat`, `dig`/`nslookup`,
  `traceroute`/`tracert`) — signalé explicitement dans le contenu.
- Pas de validation navigateur visuelle (Playwright non installé dans
  l'environnement) : validation par **build de production** + **rendu serveur réel**.

## 20. Périmètre de dérive (preuve)

`git diff --name-only 84dc1f5 -- scripts/data curriculum data/program.json` se
limite à : `days-01-30-guided.mjs`, `days-enrich-61-90.mjs`,
`curriculum/days/day-001.md`, `day-002.md`, `day-071.md`, `day-072.md`,
`data/program.json` (seul `generatedAt` volatil) et `glossary.json` (56 termes
déclarés). Comparaison par-jour de `program.json` : **aucune journée hors
périmètre modifiée**, 365 → 365 jours. Gate `v19:check` : verte.

## 21. Préparation de V20 (rédigée, non démarrée)

V19 pose les prérequis opérationnels. **V20** traitera « Environnement d'exécution
terminal sécurisé + Docker Foundations ». Le prompt de reprise est ci-dessous ;
**rien de V20 n'a été démarré**.

---

## Prompt de reprise — Sprint V20

> **Sprint V20 — Environnement d'exécution terminal sécurisé & Docker Foundations**
>
> Tu reprends « AI Career OS » (app locale mono-utilisateur, une seule
> `progress.json` v3, 4 parcours disponibles). Commence par un **audit CP0 en
> lecture seule** (ne suppose rien) : lis ADR-019, `docs/SPRINT-V19.md`, la gate
> `v19:check`, `lib/catalogue.mjs`, `lib/mission*.mjs`, le contrat d'exercice
> (`lib/exercise*.mjs`, `data/exercises`), et le confinement lazy `/lab/[id]`.
>
> **Objectif** : bâtir, sur les fondations V19 (terminal/Linux/réseau/SSH/
> diagnostic **pratiqués**), un **environnement d'exécution terminal borné** et
> une **introduction Docker**, en ÉTENDANT l'existant. Toujours :
> - **aucune isolation OS prétendue** : qualifier explicitement le niveau réel de
>   confinement (ce qui est isolé, ce qui ne l'est pas), sans jamais le surévaluer ;
> - **aucun runtime/IDE/UI nouveau**, une seule progression v3, aucun second moteur ;
> - séparer **simulation** (déterministe, étiquetée) et **exécution réelle bornée**.
>
> **Périmètre proposé (à confirmer au CP0 selon l'audit réel)** :
> 1. **Terminal d'exécution sécurisé** : un bac à sable **réellement borné**
>    (liste blanche de commandes ou runtime confiné existant), limites strictes
>    (temps, mémoire, sortie, système de fichiers éphémère), **jamais** de
>    `shell:true`/`eval` d'entrée brute non filtrée. Documenter honnêtement le
>    modèle de menace et ses limites.
> 2. **Docker Foundations** : images, conteneurs, `Dockerfile`, couches, volumes,
>    réseau de conteneurs, `docker compose` — d'abord par **modèles déterministes**
>    (comme V19), puis, si un runtime sûr le permet, exécution bornée. Enrichir le
>    contenu (mutation contrôlée + gate anti-dérive dédiée `v20:check`).
> 3. **Exercices & missions** : ≥ 10 exercices déterministes (Dockerfile lint,
>    résolution de couches, mapping de ports, calcul de tailles d'image, etc.) et
>    ≥ 3 missions (conteneuriser un service, diagnostiquer un conteneur qui ne
>    démarre pas, réduire une image). Réutiliser strictement le moteur V18.
> 4. **Parcours** : enrichir `systems-cloud-foundations-v1` (ou préparer un 5ᵉ
>    parcours orienté conteneurs/cloud) **sans copier de curriculum** ni casser
>    les 4 parcours existants.
> 5. **Glossaire** +30-60 termes (image, conteneur, couche, volume, registry,
>    orchestrateur, namespace, cgroup, capability…), recherche/révisions intégrées.
>
> **Discipline** : CP0→CP10, gate anti-dérive, `progress.json` sauvegardé au CP0
> et restauré à l'identique après les validations mutatrices, workspaces supprimés,
> serveurs arrêtés, build + `tsc` verts, rapport `docs/SPRINT-V20.md` + prompt V21
> rédigé (V21 non démarré). Ne démarre PAS V21. Ne prétends JAMAIS une isolation
> que tu ne fournis pas.
