# V53 — Preuves visuelles (avant/après, navigateur réel)

Captures produites par `scripts/v53-visual.mjs` (Chromium préinstallé via
`playwright-core`, aucun téléchargement). **Avant** = état V52 (accent teal) ;
**après** = état V53 (accent indigo + primitives + hiérarchie).

- **Avant** : `docs/audits/visual/before/` — 25 captures (5 routes × 5 largeurs).
- **Après** : `docs/audits/visual/after/` — 25 captures (5 routes × 5 largeurs).

## Le produit a-t-il visiblement changé ? — OUI (preuve non fondée sur le diff Git)

| Surface | Avant (V52) | Après (V53) |
|---|---|---|
| **Global** | accent **teal `#63a6a0`** | accent **indigo `#8b8ff5`** (marque, nav active, boutons, focus) |
| **Dashboard** | rail = pile de ~6 cartes de poids égal | rail **hiérarchisé** : Révisions en panneau primaire (`Panel is-emphasis`), reste sobre ; `Metric` + `Status` à points |
| **Compétences** | liste plate de 22 lignes identiques | **groupée par état** (en-tête de groupe + libellé + compteur), bandeau de synthèse `Metric` + distribution `Status` |
| **Aujourd'hui** | badges ad-hoc | `Status` unifié (Réussi/À faire/Terminé) partagé avec le reste du produit |

Deux captures V52 vs V53 de la même page **ne peuvent pas être confondues**
(couleur d'accent + structure du rail + regroupement des compétences).

## Responsive (assertion réelle d'overflow)

Le harnais mesure `documentElement.scrollWidth > clientWidth` à chaque largeur.

| Largeur | 375 | 768 | 1024 | 1440 | 1920 |
|---|:--:|:--:|:--:|:--:|:--:|
| `/` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/day/1` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/day/186` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/day/320` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/skills` | ✅ | ✅ | ✅ | ✅ | ✅ |

**25/25 : HTTP 200, 0 overflow horizontal.** Avant ET après.

## Non-destructivité (leçon réelle)

Visiter une page `/day/[id]` déclenche un **POST client** vers `/api/progress` qui
écrit `data/progress.json` (fichier local gelé). Le harnais **sauvegarde et
restaure** ce fichier autour de chaque exécution ; l'intégrité du blob gelé
(`323604021055588a9528a86875f36598dbdc7758`) est vérifiée après coup. Aucune
donnée de progression réelle n'existe (état neuf).
