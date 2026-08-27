# V63 · CP1 — Critères gelés

Les dix conditions sont reprises **verbatim** de `docs/audits/V62-FINAL-REPORT.md`
§32. Elles ne sont pas réécrites, pas renumérotées, pas assouplies. Leur
formulation est antérieure à ce sprint et déjà committée : aucun ajustement
a posteriori n'est possible sans que le diff le montre.

## 1. Les dix conditions de clôture

| # | condition | métrique | seuil | largeurs | méthode | bloquante |
|---|---|---|---|---|---|:--:|
| 1 | 0 route learner-facing critique sans contexte suffisant | classe A/B/C | **35 A, 0 B, 0 C** | 1440 | sonde `ctxmatrix` (fond **et** image de fond) | oui |
| 2 | `/lessons` et `/missions` scannables | hauteur @375 | ≤ 6 000 / ≤ 7 000 px | 375 | `scrollHeight` | oui |
| 3 | `/lab` sans DOM massif injustifié | nœuds dans `main` | ≤ 2 000 | 1440 | `querySelectorAll('main *')` | oui |
| 4 | grammaire identifiable par famille | coquilles partagées | 3 | — | `v62:check` | oui |
| 5 | aucun sixième motif | motifs déclarés | **5** | — | `v62:check` | oui |
| 6 | 0 débordement | `scrollWidth > clientWidth` | **0** | 375→1920 | sonde responsive | oui |
| 7 | 0 axe critical / serious | axe-core wcag2a/aa, 21a/aa | **0 / 0** | 375 + 1440 | axe-core injecté | oui |
| 8 | invariants produit | corpus, `progress.json`, 365 jours | inchangés | — | sha256 avant/après | oui |
| 9 | blind-difference convaincant | jugement sur ≥ 10 vignettes anonymes | convaincant, ambiguïtés publiées | 1440 | inspection visuelle | oui |
| 10 | **aucune régression des surfaces déjà modernisées** | hauteur, débordement, a11y | **≤ baseline** | **375 inclus explicitement** | budget de hauteur | oui |

## 2. Baseline de la condition 10 pour `/day/[id]`

C'est elle qui a fait échouer V62. Elle est donc chiffrée ici, par journée et
par largeur, à partir de la mesure d'entrée de V62 (= sortie de V61).

| jour | @375 baseline | seuil V63 |
|---|--:|--:|
| `/day/80` | **13 425 px** | ≤ 13 425 |
| `/day/1` | 6 349 px (dérivé : 6 537 − 188) | ≤ 6 350 |
| `/day/181` | 3 615 px (dérivé) | ≤ 3 616 |
| `/day/205` | 4 826 px (dérivé) | ≤ 4 827 |
| `/day/320` | 11 482 px (dérivé) | ≤ 11 483 |

À 1440, la baseline est **1 321 px** pour `/day/80` et ne doit pas augmenter.

**Les valeurs « dérivées » sont marquées comme telles** : seule `/day/80` avait
été mesurée à 375 px avant V62. Pour les quatre autres journées, la baseline
est reconstruite en retranchant la contribution mesurée du bloc supprimé
(168 px + bordure/marge), établie au CP0 de V63. Cette dérivation est une
hypothèse explicite, pas une mesure historique.

## 3. Ce qui NE compte PAS comme régression

- la **longueur intrinsèque** d'un cours long. `/day/80` porte 2 430 mots et
  8 sections de lecture : sa hauteur à 375 px est le cours. Le brief V63 le dit
  explicitement — « le problème recherché est la RÉGRESSION artificielle, pas
  la longueur intrinsèque » ;
- un écart de mesure inférieur à **2 px** (arrondi sous-pixel, bordure).

## 4. Ce qui compte comme échec, sans discussion

- toute hauteur supérieure à la baseline du §2 ;
- toute perte fonctionnelle sur `/day` : distinction lecture/action, phases,
  repères, hiérarchie, CTA, contexte, contenu intégral, accessibilité ;
- toute correction mobile qui dégrade le desktop ;
- toute condition du §1 qui passe de PASS à FAIL.

## 5. Règle de verdict

**10/10 → `UX_CLOSURE_READY`. 9/10 → `UX_CLOSURE_NOT_READY`.**
Aucun cumul de bons résultats ne compense un blocker. Le barème ne sera pas
modifié après mesure — c'est ce qui a fait refuser la clôture en V62, et la
même règle s'applique ici, y compris si elle est défavorable.
