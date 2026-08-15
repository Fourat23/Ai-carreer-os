# V45.3 — Calibration (PASS B) & test de sur-calibration V45.2 ↔ V45.3

## Partie 1 — PASS B : re-notation aveugle de 6 anchors

6 anchors re-notés dans un ORDRE DIFFÉRENT, en masquant les scores PASS A, pour
mesurer la reproductibilité INTERNE de la grille V45.3.

Ordre PASS B : ai-security → docker-containers → metrics-percentiles →
sql-foundations → machine-learning-basics → embeddings.

| Anchor | PASS A (grade/T) | PASS B (grade/T) | Concorde ? |
|--------|:---:|:---:|:---:|
| ai-security | A / T3 | A / T3 | ✅ |
| docker-containers | B / T2 | B / T2 | ✅ |
| metrics-percentiles | A / T3 | A / T3 | ✅ |
| sql-foundations | A / T2 | A / T2 | ✅ |
| machine-learning-basics | A / T3 | A / T3 | ✅ |
| embeddings | A / T2 | A / T2 | ✅ |

**Concordance PASS A / PASS B : 6/6 sur le grade ET le transfert.** La grille
V45.3 est reproductible : re-noter dans un autre ordre, sans les scores antérieurs,
redonne le même verdict — y compris le downgrade de docker-containers en B.

## Partie 2 — Test de sur-calibration V45.2 ↔ V45.3 (sur les 38 leçons)

### Distribution des grades

| Grade | V45.2 (sur l'échantillon) | V45.3 |
|-------|:---:|:---:|
| A | 38 (100 %) | 34 (89 %) |
| B | 0 | 4 (11 %) |
| C/D/E | 0 | 0 |

### Matrice de transition (V45.2 → V45.3)

| | → A | → B | → C/D/E |
|---|:---:|:---:|:---:|
| **A (38)** | 34 | 4 | 0 |

4 transitions A→B : `pandas-data-wrangling`, `observability-logging`,
`docker-containers`, `ci-cd`. 0 transition vers C/D/E.

### Distribution du transfert

| | T2 | T3 | T4 |
|---|:---:|:---:|:---:|
| V45.2 (échantillon, T0-T4) | ~0 | ~18 | ~20 |
| V45.3 (T0-T5, preuve exigée) | 17 | 19 | 2 |

Écart majeur : **T4 chute de ~20 à 2** sur l'échantillon. C'est la divergence la
plus forte du sprint.

### Motifs de downgrade les plus fréquents

1. **Redondance curriculaire** (récap qui n'est pas la ressource primaire) :
   docker-containers, ci-cd, observability-logging → 3/4 des A→B.
2. **Pratique d'outil manquante** (autonomous-practice faible) : pandas → 1/4.
3. **Sur-classement de transfert** (T4 sans preuve de combinaison) : motif le
   plus répandu, touche ~18 leçons de l'échantillon (recalibrées T2/T3).

### Variation moyenne des dimensions

Les 18 dimensions restent hautes pour les 34 A (exactitude, modèle mental,
prérequis quasi au plafond). Les deux dimensions INÉDITES de V45.3
(counter-example-quality, limits-and-non-applicability) sont là où le corpus est
le plus inégal : fortes sur les leçons de diagnostic (SRE, réseau, ML), plus
faibles sur les récaps et quelques fondations — sans jamais violer une porte A.

## Partie 3 — Détermination du verdict

Options : CONFIRMED / PARTIALLY_CONFIRMED / REJECTED.

- **Pas REJECTED** : aucune erreur technique, aucun D/E, 34/38 tiennent le grade
  A le plus strict, calibration interne 6/6. Le corpus est réellement fort.
- **Pas CONFIRMED tel quel** : (a) le « 128/128 A » ne résiste pas entièrement —
  sous REFERENCE-GRADE, ~11 % de l'échantillon est plus honnêtement B (récaps
  redondants + pratique d'outil) ; (b) le **transfert était matériellement
  surévalué** (T4 de ~53 % à ~5 % sur l'échantillon).

### Verdict : **CERTIFICATION_PARTIALLY_CONFIRMED**

Le corpus est **académiquement fort et sans fausseté**, mais deux affirmations de
V45.2 étaient trop généreuses :
1. le **grade A universel** (4/38 relèvent de B sous une définition stricte de
   « ressource de référence ») ;
2. le **niveau de transfert** (inflation T4 nette).

Extrapolé au corpus complet (128), on s'attend à **~85-90 % de A réels** et à une
**minorité de B** concentrée sur les récaps redondants et les leçons dont la
pratique d'outil est simulée — jamais des C/D/E. La qualité de fond n'est pas en
cause ; la CALIBRATION de V45.2 (grade + transfert) l'était légèrement.
