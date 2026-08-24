# V58 — Tirage de navigation aléatoire · **FIGÉ AVANT INSPECTION**

Graine : **`V58-1440`** · algorithme : `scripts/v58-random-nav.mjs`
(déterministe, sans remise, `index = sha1(seed:i) % N`).

Ce fichier et le script sont committés **avant** l'ouverture de la moindre
capture AFTER. Le tirage ne peut donc pas avoir été choisi après coup, et il
n'est pas rejoué s'il est défavorable.

| # | Route | Classe CP0 |
|:--:|---|---|
| 1 | `/security` | **ancienne** (A) |
| 2 | `/cloud-foundations/aws-ha-api` | **ancienne** (C) |
| 3 | `/capstones` | moderne |
| 4 | `/` | moderne |
| 5 | `/missions` | **intermédiaire** (B) |
| 6 | `/pipelines` | moderne |
| 7 | `/security/leaked-secret-config` | **ancienne** (C) |
| 8 | `/week/12` | moderne |
| 9 | `/diagnostics` | moderne |
| 10 | `/cloud-foundations` | **ancienne** (B) |

**Le tirage est difficile** : 5 des 10 routes sont anciennes ou intermédiaires
à la baseline. Il est conservé tel quel.

Classement à effectuer à 1440 px, à CP14 :
`MODERN_AI_CAREER_OS` · `LEGACY_AI_CAREER_OS` · `AMBIGUOUS`.
Objectif figé : **≥ 8 / 10 MODERN, 0 route cassée**.

_Résultats — remplis à CP14, après inspection._
