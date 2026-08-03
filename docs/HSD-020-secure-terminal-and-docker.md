# HSD-020 — Terminal pédagogique borné & Docker Foundations (High-level System Design)

Compagnon de l'ADR-020. Décrit l'architecture **réellement compatible avec le
dépôt** (Next.js App Router, `lib/*.mjs` purs + `lib/*-server.ts`, exécution via
`execFile` dans `lib/workspace-fs.mjs`). Aucun composant imaginaire.

## 1. Composants principaux

| Composant | Emplacement (prévu) | Nature |
|---|---|---|
| Modèle d'audit pédagogique | `lib/pedagogy-audit.mjs` (**livré CP1**) | pur |
| Gate d'audit | `scripts/v20-pedagogy-check.mjs` (**livré CP1**) | script Node |
| Registre d'audit | `docs/architecture/v20-pedagogy-audit.json` (**livré CP1**) | données |
| Modèle de terminal | `lib/terminal.mjs` (CP4) | pur |
| Interface d'exécution | `lib/terminal-adapter.*` (CP4/CP5) | contrat |
| Adaptateur local borné | `lib/terminal-local-server.ts` (CP5) | serveur |
| Adaptateur Docker | `lib/terminal-docker-server.ts` (CP6) | serveur |
| Catalogue de TerminalTask | `data/terminal-tasks/*.json` (CP4+) | données |
| API terminal | `app/api/terminal/[taskId]/route.ts` (CP7) | route serveur |
| Panneau Terminal | onglet du Workbench `app/lab/[exerciseId]` (CP7) | UI lazy |
| Contenu/exos/missions Docker | `scripts/data/*` + `data/exercises` + `data/missions` (CP8) | éditorial |

Réutilisés sans duplication : `lib/workspace-fs.mjs` (exécution `execFile`
bornée), `lib/workspace.mjs` (grading pur), `lib/exercise*.mjs` (contrat
d'exercice), `lib/mission*.mjs` (moteur de missions V18), `lib/catalogue.mjs`
(parcours), `lib/progress-store.mjs` (progression v3), `lib/search.mjs`,
`curriculum/glossary`.

## 2. Flux pédagogiques

1. **Audit** : auditeur → rubrique 16 dimensions → notes humaines dans le
   registre → `v20:pedagogy-check` (danger + seuils) → rapport
   `docs/PEDAGOGICAL-AUDIT-V20.md`.
2. **Terminal** : Vue Jour/Lab propose une TerminalTask liée à une leçon/mission →
   l'apprenant choisit des arguments validés → exécution bornée → sortie + exit
   code + explication pédagogique → preuve éventuelle liée au parcours actif.
3. **Docker** : mêmes tâches via l'adaptateur Docker si `available` ; sinon
   exercice déterministe (analyse de Dockerfile/config) — la disponibilité est
   affichée, jamais feinte.

## 3. Audit (composant transverse)

`pedagogy-audit.mjs` fournit : `DIMENSIONS`, `evaluateScores`,
`detectDangerSignals` (bloquant/warn), `structuralSignals`, `validateAuditLedger`.
Le gate scanne `scanGlobs` (tout le curriculum + exercices + missions) pour les
signaux **bloquants** et valide les notes du registre. Le rapport CP2/CP10 en
dérive matrices, défauts et actions correctives.

## 4. Terminal (modèle + adaptateurs)

- **TerminalTask** (donnée) : décrit *quoi* exécuter (binaire allowlisté, schéma
  d'arguments, politique de cwd/env, limites, critères de succès, nettoyage,
  liens pédagogiques).
- **TerminalRun** (résultat) : décrit *ce qui s'est passé* (statut, exit code,
  signal, stdout/stderr bornés, tronqué, annulé, timeout, nettoyé, diagnostic).
- **Interface d'exécution** : `prepare(task) → runToken`, `execute(task, args) →
  TerminalRun`, `cancel(runId)`, `cleanup(runToken)`, `availability()`. Deux
  implémentations : locale bornée, Docker optionnelle. La partie **pure**
  (validation d'arguments, construction de la commande, machine à états, bornage
  de sortie) vit dans `lib/terminal.mjs` et est testable **sans exécuter**.

## 5. Runtime adapters (réutilisation)

L'exécution locale réutilise le motif de `lib/workspace-fs.mjs` :
`execFile(binary, argv, { cwd, shell:false, timeout, killSignal:'SIGKILL',
maxBuffer, windowsHide:true, env:minimal })`. Le terminal n'introduit **pas** de
nouveau mécanisme de spawn ; il ajoute une couche de **validation d'allowlist +
argv** au-dessus.

## 6. Workspace

Dossier temporaire par exécution (motif `mkdtemp` déjà utilisé), `cwd` de la
commande, `realpath` vérifié pour rester sous la racine, symlinks contrôlés,
supprimé après exécution (`cleanup` idempotent). Aucun accès au dépôt complet, au
home, à `/`, ni au socket Docker.

## 7. Docker (optionnel)

Encapsulé dans un seul module serveur : détection (`cli`/`daemon`/`canRun`),
construction de la commande `docker run` durcie (D4 de l'ADR), exécution via la
même interface, suppression du conteneur. La **construction de commande est pure
et testable sans Docker** ; les smoke tests réels ne tournent que si `available`.

## 8. Intégration Workbench

Onglet « Terminal » ajouté à `app/lab/[exerciseId]` (lazy `dynamic(() =>
import(...))`, comme CodeMirror). Affiche tâche, binaire, arguments, **commande
lisible**, avertissement de sécurité, adaptateur, disponibilité, boutons
Exécuter/Annuler/Réinitialiser, statut, exit code, durée, stdout, stderr,
troncature, état de nettoyage, explication post-exécution, lien vers la
leçon/mission. Jamais de prompt de shell libre ni d'émulateur laissant croire à
un shell complet.

## 9. Données

Une seule progression `data/progress.json` (v3, multi-parcours). L'état de
terminal éventuellement persisté est **borné** (statut/exit code/preuve), jamais
de stdout massif, jamais de secret, jamais de commande dangereuse, jamais de
donnée Docker volatile. Migration **additive** ; anciennes sauvegardes toujours
importables.

## 10. Sécurité (voir ADR §Sécurité)

Allowlist + argv validé ; `shell:false` ; workspace borné + realpath ; env sans
secret ; sortie plafonnée ; timeout + SIGTERM→SIGKILL ; Docker durci (network
none, read-only, cap-drop, no-new-privileges, non-root, sans socket) ; aucune
promesse d'isolation OS.

## 11. Observabilité

Journal d'exécution **borné** (statut, durée, exit code, tronqué, nettoyé) ;
aucun contenu sensible ; historique limité en nombre. Aucun polling permanent.

## 12. Nettoyage

`cleanup` idempotent après chaque exécution et après crash : suppression du
workspace temporaire, suppression du conteneur Docker (même déjà absent), arrêt
des processus enfants. Vérifié par tests dédiés.

## 13. Interactions avec l'existant

- **Exercices** : les exercices Docker déterministes suivent le contrat V7
  (`data/exercises/*.json`) et le lien jour↔exercice (`data/day-exercises.json`).
- **Missions** : les missions Docker utilisent le moteur V18 inchangé.
- **Parcours** : enrichissement du parcours `systems-cloud-foundations-v1`
  (aucun 5ᵉ parcours), sans casser les 3 autres.
- **Preuves/compétences/révisions/recherche/glossaire** : intégration additive.
