# V57 — Signature Completion & Honest Debt Closure

> À lancer APRÈS V56. **LE DÉPÔT FAIT FOI.** Références :
> `docs/V56-SCORING-FROZEN.md` (grille gelée, à reprendre telle quelle),
> `docs/ADR-056-product-signature.md`, `docs/SPRINT-V56.md`.
>
> V56 a livré cinq motifs propriétaires et transformé `/day/[id]`. Verdict
> **STRONG_IMPROVEMENT** — pas REFERENCE_GRADE, et le rapport dit précisément
> pourquoi. V57 ferme cette dette **nommée**, il n'ouvre pas de nouveau front.

## 0. Règle reconduite — gel des critères à CP0

Reprendre `docs/V56-SCORING-FROZEN.md` **sans en modifier un seul seuil**, et
le committer à CP0. Les deux limites déjà constatées y sont ajoutées **en
complément**, jamais en remplacement :
- `typeRange` doit être lu séparément sur page-tableau et page-document ;
- `maxRepeat` doit être lu à côté de `maxRepeatCarded`.

Aucune formule, aucune pondération, aucune définition de succès ne peut bouger
après CP0. Si une métrique se révèle mauvaise : conserver son résultat,
signaler la limite, **ajouter** au besoin.

## 1. Dette nommée à fermer — c'est le cœur du sprint

| # | Dette | Mesure de V56 | Cible |
|---|---|---|---|
| 1 | **`/revisions` sous-transformée** | 3,40/5 · blind-difference **échoué** (2/5) · 0 motif | ≥ 4,0 · blind-difference réussi (≥ 3/5) |
| 2 | **`/diagnostics` et `/capstones`** | dominance 0,10 et 0,12 · 15 et 12 cartes · la dé-cardification n'a pas pris effet, **cause non identifiée** | dominance ≥ 0,35 · cartes ≤ 8 · **trouver la cause avant de re-styler** |
| 3 | **`/lab`** | 5 px de débordement qu'aucune boîte ne explique · 385 cartes · 44 711 px | overflow 0 · cartes ≤ 8 · hauteur divisée |
| 4 | **`/glossary`** | 712 cartes · 111 686 px · **accessibilité jamais vérifiée** | vérifier axe d'abord, puis recomposer |
| 5 | **`/projects`, `/reviews`** | échouent R4 (amplitude 2,27) | 3 critères R sur 5 |
| 6 | **Rail de la Journée sous 1200 px** | l'apprenant retombe sur la bande compacte entre 768 et 1199 px | rail utile dès 1024 px, ou justification écrite |
| 7 | **Lecteur d'écran** | jamais testé — **reporté, jamais simulé** | test manuel documenté, ou report explicite renouvelé |

**Plancher de recomposition** : **≥ 10 routes NOUVELLES** au sens de la §4
gelée. V56 en a livré 8 ; les surfaces déjà recomposées ne comptent plus.

## 2. Signature — étendre sans en créer une sixième

L'ensemble est **fermé à cinq** (ADR-056 §1) et le gate `v56:check` le vérifie.
V57 ne crée **aucun** motif : il porte les cinq existants à davantage de
surfaces, là où ils ont un sens réel.

Couverture V56 : 7 surfaces sur 36. Cible V57 : **≥ 14**, avec pour chaque
emploi une raison informationnelle écrite. Un motif posé sans raison est un
ornement, et sera refusé.

Cas particulier `/revisions` : V56 n'y a placé aucun motif parce qu'aucun n'y
avait de sens. Deux issues acceptables, pas une troisième :
soit un des cinq y trouve un emploi **justifié**, soit la page se distingue
par sa **composition** — et l'absence de motif est assumée par écrit.

## 3. Interdits (inchangés)

XP · niveaux utilisateur · streak · leaderboard · badges de collection ·
confettis · monnaie · progression artificielle · **données inventées** · scores
arbitraires · fausses statistiques · faux graphiques · seconde source de vérité ·
suppression ou changement d'URL · modification du curriculum, d'une leçon, d'un
exercice, d'une mission, d'un capstone, d'un diagnostic, ou de l'ordre des
365 jours · **sixième motif propriétaire**.

## 4. Planchers non négociables

- axe-core **critical = 0** et **serious = 0** sur toute route touchée —
  **`/glossary` inclus**, qui n'a jamais été vérifié.
- Responsive 375 → 1920 (9 largeurs), les 5 journées représentatives incluses :
  0 overflow **et** 0 contenu rogné.
- `VISIT_*_DOES_NOT_MUTATE_PROGRESS` **sans restauration** sur chaque route
  touchée.
- `DATA = DOM = READING ORDER` sur le calendrier · `column-count` interdit.
- Corpus `4c1f3028…` · `progress.json` `32360402…` · 365 jours ordonnés.
- `npm test`, `tsc --noEmit`, `npm run build`, `gates:active` verts.

## 5. Méthode — les leçons payées, à ne pas repayer

- **Un correctif CSS qui ne bouge pas la mesure n'est pas un correctif.**
  V56 a appliqué deux passes de dé-cardification sur `/diagnostics` et
  `/capstones` sans effet mesurable, et a livré sans en identifier la cause.
  En V57 : **diagnostiquer avant de styler**, et re-mesurer après chaque passe.
- **Un harnais mono-état ne prouve rien** : balayer les 5 journées et les
  8 parcours pour toute donnée qui en dépend.
- **Tout nouveau gate se teste EN NÉGATIF.**
- **Les captures trouvent ce que les métriques ratent** — les ouvrir, pas
  seulement les produire.
- **Ne pas créer de churn pour réussir un test** : Dashboard, Parcours,
  Calendrier et Journée ne changent que sur un défaut mesuré.

## 6. Clôture

Rapport en français : grille gelée rappelée, scores AVANT/APRÈS, **aucune
métrique réécrite**, dette fermée / dette restante, routes réellement
recomposées vs seulement skinnées (**les deux listes**), blind-difference,
responsive, a11y, intégrité, invariants, verdict **non gonflé**
(FAIL / WEAK / IMPROVED / STRONG_IMPROVEMENT / REFERENCE_GRADE).

Répondre explicitement :
> La dette nommée par V56 est-elle fermée ? OUI / PARTIELLEMENT / NON.
> La signature couvre-t-elle désormais le produit, et non cinq écrans ?

**Ne pas démarrer V58.**
