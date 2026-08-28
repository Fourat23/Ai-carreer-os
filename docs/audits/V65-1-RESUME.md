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
| CP1 | Critères gelés | ✅ `docs/V65-1-CRITERIA-FROZEN.md` |
| CP2 | Audit domaine + consolidation du modèle | ✅ ancien modèle SUPPRIMÉ |
| CP3 | Fermeture de la taxonomie | ✅ atteignabilité dérivée du corpus |
| CP4 | Evidence ledger | ✅ décomptes honnêtes, historique par source |
| CP5 | Explicabilité | ✅ déterminisme testé, action distincte de l'intention |
| CP6 | History engine | ✅ filtres dans l'URL, noms français |
| CP7 | Recomposition Compétences | ✅ liens vers le détail, aucun faux zéro |
| CP8 | Skill Detail (surface nouvelle) | ✅ `/skills/[id]` |
| CP9 | Convergence diagnostics | ✅ + route capstone (P0-5) |
| CP10 | Dashboard + Synthèse — dette P0 V65 | ✅ fait en avance avec CP2 |
| CP11 | Pont révisions | ✅ compétences signalées, frontière énoncée |
| CP12 | Matrice de cohérence transverse | ✅ 16 scénarios ; a trouvé P0-6 |
| CP13 | UX / responsive / a11y | ✅ 0 débordement / 90, 0 axe serious |
| CP14 | Gauntlet | ✅ gate v651, 12/12 règles vues échouer |
| CP15 | Rapport final + verdict + push + prompt V66 | ✅ `REFERENCE_READY` |

## Dette ouverte (mise à jour à chaque CP)

| | Sujet | État |
|---|---|---|
| P0-0 | `gates:active` rouge à HEAD (`v64:check`, liste d'écrivains codée en dur) | ✅ **fermé** — liste dérivée, 2 tests négatifs vus échouer |
| P0-1 | Dashboard + Synthèse sur l'ancien modèle — 20/20 divergences, 8 sémantiques | ✅ **fermé** — sonde transverse : 0 écart |
| P0-2 | « 28 preuves qualifiantes sur 30 » — somme de crédits présentée comme un décompte | ✅ **fermé** — 14/30, deux grandeurs nommées séparément |
| P0-3 | Deux vocabulaires de compétence affichés côte à côte | ✅ **fermé** — noms français du programme partout |
| P0-4 | `/diagnostics` aveugle à l'historique de l'apprenant | ✅ **fermé** |
| P1-1 | Aucune surface de détail par compétence | ✅ **fermé** — `/skills/[id]` |
| P1-2 | Étiquettes superposées dans l'échéancier `/revisions` | ✅ **fermé** — décalage vertical |
| P1-3 | `/history` sans filtre ni regroupement | ✅ **fermé** — filtres dans l'URL |
| P2-1 | Identifiants d'état anglais visibles sur le Dashboard | ✅ **fermé** — sonde DOM sur 4 surfaces |

## Trouvailles ajoutées en cours de sprint

| | Sujet | État |
|---|---|---|
| P0-5 | Un capstone réussi ne produisait **aucune preuve** | ✅ **fermé** — route `/api/capstones/[id]` |
| P0-6 | Une réussite APRÈS un échec sur la même source était silencieusement jetée (identifiant sans discriminant qualifiant) | ✅ **fermé** — 14 → 15 preuves qualifiantes sur la fixture |
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


## Clôture

**Verdict : `REFERENCE_READY`** — `docs/audits/V65-1-FINAL-REPORT.md`.

17 conditions de sortie sur 17. 12 tests négatifs sur 12 vus échouer. Aucune
dette P0. Audit UI/UX 4,29 / 5, aucun axe sous 4.

Suite pour V66 : `docs/V65-1-PROMPT-V66.md` — **ne pas lancer sans décision
humaine.**
