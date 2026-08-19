# V51 — Certification temporelle du curriculum

Dérivé du read-model (`lib/curriculum-timeline.mjs`), recomputable et vérifié par
`v51:check`. Couvre charge (CP3), espacement/oubli (CP4), difficulté (CP5),
second semestre (CP6), placement professionnel (CP8), certification mensuelle (CP9).

## CP3 — Charge quotidienne (365/365)

Modèle transparent (pas de « score IA ») : `none`(0) `light`(1-2) `normal`(3-4)
`heavy`(5-6) `excessive`(7+), + un cran si ≥3 D4/D5 le même jour.

| Niveau | Jours |
|--------|:--:|
| none (0 activité) | 118 |
| light (1-2) | 216 |
| normal (3-4) | 18 |
| heavy (5-6) | 6 |
| excessive (7+) | 7 |

Les **118 jours sans pratique** sont majoritairement légitimes (théorie, révision,
projet, comm/autonomy non-code). Les **7 journées « excessives » sont HÉRITÉES**
(journées thématiques dockerisation/architecture pré-V50) : V51 n'en a créé
aucune (plafond de 3 sur les jours de révision, gate `v51:check`).

## CP4 — Espacement & oubli (mesuré sur la PRATIQUE)

**Correction d'un angle mort V50** : la métrique V50, bornée par l'enseignement,
annonçait 1 anomalie. Mesuré sur les jours de PRATIQUE, l'audit CP0 en trouvait
**10** (gitlinux 248 j, archi 157, algo/http 146, python 138, patterns 134,
secu 130, ds 117, ml 95 ; dl queue 109).

**Remédiation** (`scripts/v51-reactivate.mjs`) : 15 exercices EXISTANTS rattachés à
des JOURS DE RÉVISION existants situés DANS les écarts (retrieval espacé), toutes
compétences introduites avant placement, sans réordonner ni dupliquer.

**Résultat : 0 écart de pratique > 90 j** pour les compétences de code (hors
non-code et compétences enseignées en toute fin d'année). Vérifié par `v51:check`.

## CP5 — Progression de difficulté

`isolated-d5` : **0** (aucun D5 sans D3/D4 en pratique). `difficulty-jump`
résiduel : **1** — `ds` (D3 apparent au jour 2, D4 au jour 203). Le « D3 au j2 »
est un artefact hérité (exercice d'échauffement `sys-log-level-counts` sur un jour
d'on-ramp) : `ds` est réellement enseigné d30-42. Info, non bloquant.

## CP6 — Second semestre : réutilisation croisée (pas simple cohabitation)

Les fondamentaux **recourent réellement** en S2 (jours de pratique d148+) :

| Compétence | Jours de pratique en S2 |
|-----------|:--:|
| python | 22 |
| jsts | 19 |
| archi | 15 |
| http | 8 |
| ds | 7 |
| algo | 6 |
| se | 6 |
| sql | 4 |
| gitlinux | 4 |

Mélange de réutilisation intégrée (python dans ML/data, archi dans les projets IA)
et de réactivations espacées (V51). Réponse à la question centrale : **oui**, les
fondamentaux continuent d'être pratiqués pendant ML/DL/RAG/Agents, pas seulement
juxtaposés.

## CP8 — Placement professionnel

Chaque scénario/capstone arrive APRÈS l'introduction et une pratique de ses
compétences (vérifié en V50, `V50-PROFESSIONAL-INTEGRATION.md`). Les transferts
T4/T5 arrivent à distance de la première exposition (l'espacement V51 renforce ce
désancrage). Aucun capstone avant prérequis détecté.

## CP9 — Certification mensuelle M1→M12

| Mois | Jours | Jours pratique | Révisions | D4+ | D5 | Verdict |
|------|:--:|:--:|:--:|:--:|:--:|:--:|
| M1 | 28 | 28 | 4 | 2 | 0 | 🟢 GREEN |
| M2 | 28 | 27 | 4 | 5 | 0 | 🟢 GREEN |
| M3 | 35 | 28 | 5 | 5 | 2 | 🟢 GREEN |
| M4 | 28 | 20 | 4 | 4 | 2 | 🟢 GREEN |
| M5 | 28 | 20 | 4 | 9 | 4 | 🟢 GREEN |
| M6 | 35 | 28 | 5 | 13 | 3 | 🟢 GREEN |
| M7 | 28 | 19 | 4 | 10 | 1 | 🟢 GREEN |
| M8 | 28 | 13 | 4 | 12 | 7 | 🟢 GREEN |
| M9 | 35 | 18 | 5 | 9 | 1 | 🟢 GREEN |
| M10 | 28 | 24 | 4 | 14 | 5 | 🟢 GREEN |
| M11 | 28 | 17 | 4 | 13 | 4 | 🟢 GREEN |
| M12 | 36 | 5 | 5 | 5 | 0 | 🟡 AMBER (justifié) |

**M12 = AMBER justifié** : mois intégratif (comm/autonomy non-code + projet de
synthèse/portfolio). 5 jours de pratique de code y sont appropriés ; ce n'est pas
un trou mais la nature d'un mois de clôture. La progression D4/D5 monte
correctement (M8 pic de D5, M10-11 riches en diagnostic).

## Verdict de certification
**11 mois GREEN, 1 mois AMBER justifié.** Rétention certifiée honnêtement (0 écart
> 90 j), progression cohérente, charge maîtrisée, second semestre réellement
pratiquant.
