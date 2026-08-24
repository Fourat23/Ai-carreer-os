# SPRINT V54.2 — Visual Quality Bar (Dashboard · Parcours · Synthèse)

**Type** : élévation visuelle mesurable sur 3 surfaces de référence, avant toute
migration générale. **Curriculum 1.0** : gelé. **365 jours** : inchangés.

## 1. Git
HEAD départ `df1b649` (V54.1). Branche `claude/ai-career-os-saas-phfg49`.
local == origin après push ; working tree propre ; aucun serveur résiduel ;
corpus `4c1f3028…` ; `progress.json` `32360402…`.

## 2. CP0 — audit forensique (scores honnêtes /5)
| Critère | Dash. AVANT | Parc. AVANT | Synth. AVANT |
|---|:--:|:--:|:--:|
| Hiérarchie / Densité / Scannabilité | 3.5 / 2.5 / 3.0 | 3.0 / 3.0 / 2.5 | 3.5 / 3.5 / 3.5 |
| Composition / Espace | 2.5 / **2.0** | 2.5 / 3.0 | 3.0 / 3.5 |
| Cohérence / Affordance | 4.0 / 4.0 | 3.5 / **2.0** | 3.5 / 2.5 |
| Identité / Mobile / Premium | 3.5 / 3.5 / 3.0 | 3.0 / 3.0 / 2.5 | 3.0 / **1.0** / 3.0 |
| **Moyenne** | **3.15** | **2.80** | **3.05** |

Réponse à la question centrale (AVANT) : **NON** — outil interne propre, pas encore
un produit premium (vide du dashboard, aucune action principale sur Parcours,
perte d'information mobile sur Synthèse).

## 3. Scores APRÈS
| Critère | Dashboard | Parcours | Synthèse |
|---|:--:|:--:|:--:|
| Hiérarchie | 3.5 → **4.5** | 3.0 → **4.5** | 3.5 → **4.0** |
| Densité | 2.5 → **4.0** | 3.0 → **4.0** | 3.5 → **4.0** |
| Scannabilité | 3.0 → **4.0** | 2.5 → **4.5** | 3.5 → **4.0** |
| Composition | 2.5 → **4.5** | 2.5 → **4.5** | 3.0 → **3.5** |
| Utilisation de l'espace | 2.0 → **4.0** | 3.0 → **4.0** | 3.5 → **4.0** |
| Cohérence | 4.0 → **4.5** | 3.5 → **4.5** | 3.5 → **4.5** |
| Affordance | 4.0 → **4.5** | 2.0 → **4.5** | 2.5 → **4.0** |
| Identité visuelle | 3.5 → **4.0** | 3.0 → **4.5** | 3.0 → **3.5** |
| Mobile | 3.5 → **4.0** | 3.0 → **3.5** | 1.0 → **4.0** |
| Impression premium | 3.0 → **4.0** | 2.5 → **4.0** | 3.0 → **3.5** |
| **Moyenne** | **3.15 → 4.25** | **2.80 → 4.30** | **3.05 → 3.90** |

## 4. Décisions de composition (ADR-054.2)
« Une page = 1 focus + N supports + 1 socle. » Anti-vide **par la composition**
(déplacer le transversal en socle pleine largeur), jamais par du remplissage.
Anti-redondance : deux blocs pour la même donnée = un de trop. Métrique non
démarrée = omise, pas affichée en tiret.

## 5. Design system / primitives
- **Créée** : `ProgressRail` — justifiée par **2 usages réels** (socle Dashboard +
  avancement Parcours). Aucune autre primitive créée (pas de composant « pour avoir
  un design system »).
- **Réutilisées** : `PrimaryFocus`, `Panel`, `Status`, `Metric`, `PageHeader`,
  `SectionHeader`, `ListRow`, `EmptyState`, `InlineNotice`, `ActionRow`.
- Tokens : `--faint` remonté (contraste), suppression de deux `opacity` qui
  cassaient l'AA. **0 hex en dur dans le TSX**.

## 6. Accessibilité (axe-core intégré)
`axe-core` ajouté en devDependency (JS pur, aucun appel réseau, aucune dépendance
native) et exécuté dans la page via `scripts/v542-a11y.mjs`, complété par des
contrôles clavier réels.

| | Dashboard | Parcours | Synthèse |
|---|:--:|:--:|:--:|
| axe critical/serious | 30 → **0** | 50 → **0** | 15 → **0** |
| `aria-allowed-role` | 365 → **0** | — | — |
| landmarks / skip-link | ok | ok | ok |
| h1 unique · saut de niveau | 1 · non | 1 · non | 1 · non |
| focusables sans nom | 0 | 0 | 0 |
| statut « couleur seule » | 0 | 0 | 0 |
| 12 × Tab · focus visible | 12/12 · oui | 12/12 · oui | 12/12 · oui |

## 7. Responsive
45 états vérifiés (3 pages × 5 largeurs × BEFORE/AFTER + re-mesures). **0 overflow
horizontal** sur les 15 états AFTER. Synthèse vérifiée en plus à 480/640/700/1200 :
la table **tient dans son conteneur** à toutes les largeurs (plus de colonne rognée).

## 8. Intégrité produit
`VISIT_DASHBOARD` / `VISIT_PARCOURS` / `VISIT_SYNTHESE_DOES_NOT_MUTATE_PROGRESS`
**verts, sans aucune restauration** (`scripts/v542-integrity.mjs`). Aucune donnée
inventée, aucune gamification, aucune seconde source, aucune URL supprimée.

## 9. Tests / gates
`npm test` **1271/0** · `tsc --noEmit` **0** · `npm run build` **OK** ·
`gates:active` **exit 0** (dont le nouveau `v542:check`).
Un avertissement subsiste : `[decor] animation` — **faux positif connu** (le gate
découpe le fichier CSS au marqueur « V54.2 » et attrape le spinner `.spin`
préexistant, déjà neutralisé sous `prefers-reduced-motion`).

## 10. Ce qui n'a PAS été fait
- Aucune autre route migrée (hors périmètre explicite du sprint).
- Synthèse desktop : évolution **modérée** (bandeau + CTA + densité), la table
  reste une table — verdict IMPROVED, pas STRONG_IMPROVEMENT.
- Dashboard : ~95 px de vide résiduel sous le focus à l'état « jour 1 ».
- Contraste AAA non visé (AA atteint) ; pas de test lecteur d'écran réel.

## 11. Verdicts
- **Dashboard : STRONG_IMPROVEMENT**
- **Parcours : STRONG_IMPROVEMENT**
- **Synthèse : IMPROVED**
- **Global : FORT** — pas « EXCELLENT » : la Synthèse desktop reste proche de
  V54.1 et un vide résiduel subsiste au Dashboard.

## 12. Décision de fin
**VISUAL_QUALITY_BAR_LOCKED** — les trois surfaces atteignent la barre : hiérarchie
nette, action principale évidente partout, densité maîtrisée, 0 overflow,
0 violation axe critical/serious, données 100 % réelles, aucune gamification.
La Synthèse est le maillon le plus faible (3.90) mais dépasse le seuil et ses deux
défauts bloquants (mobile vide, colonne rognée) sont corrigés et mesurés.
→ V55 (migration des routes restantes) peut être recommandé.
