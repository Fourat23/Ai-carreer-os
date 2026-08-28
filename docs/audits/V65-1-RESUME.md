# V65.1 — fichier de reprise

> Tenu à jour au fil du sprint. Sert à reprendre exactement où on en est, sans
> relire la conversation.

**Sprint** : V65.1 — Competency Engine Product Closure
**Base** : `2237f2d` (V65)
**Branche** : `claude/ai-career-os-saas-phfg49`

## Avancement

| CP | Sujet | État |
|---|---|---|
| CP0 | Baseline forensique, captures BEFORE, cartographie | ✅ `docs/audits/V65-1-CP0-AUDIT.md` |
| CP1 | Critères gelés | ⏳ |
| CP2 | Audit domaine + consolidation du modèle | ✅ ancien modèle SUPPRIMÉ |
| CP3 | Fermeture de la taxonomie | ⏳ |
| CP4 | Evidence ledger | ⏳ |
| CP5 | Explicabilité | ⏳ |
| CP6 | History engine | ⏳ |
| CP7 | Recomposition Compétences | ⏳ |
| CP8 | Skill Detail (surface nouvelle) | ⏳ |
| CP9 | Convergence diagnostics | ⏳ |
| CP10 | Dashboard + Synthèse — dette P0 V65 | ✅ fait en avance avec CP2 |
| CP11 | Pont révisions | ⏳ |
| CP12 | Matrice de cohérence transverse | ⏳ |
| CP13 | UX / responsive / a11y | ⏳ |
| CP14 | Gauntlet | ⏳ |
| CP15 | Rapport final + verdict + push + prompt V66 | ⏳ |

## Dette ouverte (mise à jour à chaque CP)

| | Sujet | État |
|---|---|---|
| P0-0 | `gates:active` rouge à HEAD (`v64:check`, liste d'écrivains codée en dur) | ✅ **fermé** — liste dérivée, 2 tests négatifs vus échouer |
| P0-1 | Dashboard + Synthèse sur l'ancien modèle — 20/20 divergences, 8 sémantiques | ✅ **fermé** — sonde transverse : 0 écart |
| P0-2 | « 28 preuves qualifiantes sur 30 » — somme de crédits présentée comme un décompte | ✅ **fermé** — 14/30, deux grandeurs nommées séparément |
| P0-3 | Deux vocabulaires de compétence affichés côte à côte | ✅ **fermé** — noms français du programme partout |
| P0-4 | `/diagnostics` aveugle à l'historique de l'apprenant | ouvert |
| P1-1 | Aucune surface de détail par compétence | ouvert |
| P1-2 | Étiquettes superposées dans l'échéancier `/revisions` | ouvert |
| P1-3 | `/history` sans filtre ni regroupement | ouvert |
| P2-1 | Identifiants d'état anglais visibles sur le Dashboard | ✅ **fermé** — sonde DOM sur 4 surfaces |

## Trouvailles ajoutées en cours de sprint

| | Sujet | État |
|---|---|---|
| P0-5 | Un capstone réussi ne produit **aucune preuve** : `CapstoneRunner` n'écrit rien, `capstoneToEvidence` n'a aucun appelant. Le jalon « Premier capstone terminé » est donc inatteignable. | ouvert — CP9 |
| P1-4 | `app/settings/SettingsPanel.tsx` appelle `/api/progress/import` et `/reset` : opérations de fichier assumées, désormais surveillées séparément par le gate. | ✅ documenté |

## Outils de mesure du sprint

- **Fixture** : produite par l'API réelle (57 commandes, 0 refus) + décalage
  d'horloge documenté. 30 preuves, 14 qualifiantes, 8 compétences touchées,
  13 dates UTC.
- **Captures BEFORE** : `docs/design/v651/before/` — 7 surfaces × 5 largeurs.
- **Méthode d'empreinte** (à réutiliser jusqu'au CP15) :
  `find <dir> -type f -print0 | sort -z | xargs -0 sha256sum | sha256sum`.
- **Baseline** : 1 368 tests, `tsc` 0 erreur, build OK, `gates:active`
  **rouge** (P0-0).

## Rappels d'exécution

- Serveur : `setsid nohup npx next start -p PORT > log 2>&1 < /dev/null &`
  puis `disown`. **Ne jamais utiliser `pkill`** (tue le shell appelant) —
  `kill -9 <PID>` sur un PID précis.
- Ports déjà utilisés : jusqu'à 3493.
- Chromium : `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`,
  `playwright-core` résolu depuis la racine du dépôt.
