# V54 — Visual QA (before → after, navigateur réel)

Captures : `docs/audits/visual/v54-before/` (état V53) et `docs/audits/visual/v54-after/`
(état V54) — 55 chacune (11 routes × 375/768/1024/1440/1920). Produites par
`scripts/v53-visual.mjs` (Chromium préinstallé). **55/55 : HTTP 200, 0 overflow.**

## Verdicts par route (honnêtes — pas d'« EXCELLENT » automatique)

| Route | HIERARCHY | DENSITY | PRIMARY_ACTION | SPACE | RAIL | CONSISTENCY | IDENTITY | RESPONSIVE | A11Y | TRUTH | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Dashboard** | cockpit dominant | maîtrisée | CTA indigo évident | vide bas résiduel | hiérarchisé | forte | indigo + focus | ✅ 5/5 | skip+focus | réelle | **FORT** |
| **Aujourd'hui** | déroulé + header net | dense | reprise claire | ok | rail sections | forte | phase-path | ✅ 5/5 | ✅ | réelle | **FORT** |
| **Missions** | groupé par statut | dense | ligne → mission | ok | — | forte | ListRow | ✅ 5/5 | ✅ | réelle | **FORT** |
| **Révisions** | file priorisée | ok (vide honnête) | résultats de révision | vide assumé | — | forte | Metric+Status | ✅ 5/5 | ✅ | réelle | **BON** |
| **Compétences** | groupé par état | dense | dots clavier | ok | — | forte | Status | ✅ 5/5 | ✅ | réelle | **BON** (hérité V53) |
| **Diagnostics** | PageHeader | ok | board | ok | — | forte | partagée | ✅ 5/5 | ✅ | réelle | **BON** |
| **Capstones** | groupé par domaine | dense | cartes | ok | — | forte | hérité | ✅ 5/5 | ✅ | réelle | **BON** (déjà solide) |
| **Parcours** | grammaire partagée | ok | actions parcours | ok | — | forte | partagée | ✅ 5/5 | ✅ | réelle | **BON** (composant différé V55) |
| **Projects** | onglets + spec | dense | ouvrir projet | ok | — | moyenne | non migré | ✅ 5/5 | ✅ | réelle | **MOYEN** (dette V55) |

## « V54 est-elle immédiatement identifiable comme plus aboutie que V53 ? » — OUI
Preuve indépendante du diff Git :
- **Accent** : indigo conservé, mais **profondeur de surfaces nouvelle** (`--raised`,
  ombres) → le dashboard passe d'un assemblage de blocs à un **cockpit** avec un
  PRIMARY FOCUS dominant (titre h1, surface haute, ombre, CTA indigo plein).
- **Nav** : état actif désormais **teinté accent + icône indigo + barre 3px**.
- **Missions** : liste plate de 42 lignes → **groupée par statut** + synthèse.
- **Aujourd'hui** : ajout du **DÉROULÉ** (chemin de phases cliquable).
Deux captures dashboard V53 vs V54 à 1440px **ne peuvent pas être confondues**.

## Dette visuelle restante (honnête)
- Dashboard : vide vertical résiduel bas-gauche quand la trajectoire est courte.
- Projects : spec riche mais pas d'en-tête objectif/état/artefacts (V55).
- Parcours : header encore en grammaire `.page-head` (dépend de `page-wide`).
- Labs / surfaces techniques : non touchées (SPECIALIZED, V55).
