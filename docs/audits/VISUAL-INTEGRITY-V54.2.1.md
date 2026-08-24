# V54.2.1 — Audit Visual Integrity (AVANT → APRÈS, mesures réelles)

Captures : `docs/audits/visual/v5421-before/` et `v5421-after/` (5 routes ×
375/768/1024/1440/1920), plus `v5421-tracks-after/` (calendrier de chacun des
8 parcours à 1440). Toutes ont été **ouvertes et inspectées**, pas seulement
produites.

## 1. Ordre de rendu du calendrier — balayage 8 parcours × 4 largeurs

| | AVANT | APRÈS |
|---|:--:|:--:|
| États conformes | **8 / 32** | **32 / 32** |

Détail des ruptures mesurées AVANT (`scripts/v5421-calendar-order.mjs`) :

| Parcours | Symptôme mesuré |
|---|---|
| ai-engineer-foundations-v1 | ordre de lecture des mois `1 5 9 2 6 10 3 7 11 4 8 12` (1024/1440/1920) |
| fullstack-typescript | `1 3 4 2` (1440/1920), `1 3 2 4` (1024) |
| frontend-engineer-v1 | `1 3 2 4` (1024) |
| backend-engineer-v1 | `1 3 2` (1024) |
| systems-cloud-foundations-v1 | rupture de jours `86 → 320 → 321 → 307 → 326` (toutes largeurs) |
| appsec-cloud-security-v1 | rupture `54 71 79 → 67 68 → 85` (toutes largeurs) |
| cloud-devops-engineer-v1 | rupture `55 56 71 → 67 68 → 78 79` (toutes largeurs) |
| data-ml-v1 | mois `1 3 6 9 10 5 7 11 2 8` (1440) · rupture `73 82 84 → 57 58 → 120` |

Deux causes indépendantes, cumulatives :

1. **Données** — `resolveTrackDays` concaténait les `dayRefs` module par module
   sans trier. Sa docstring promettait « liste ORDONNÉE » ; l'implémentation ne
   le garantissait pas. Touchait 4 parcours sur 8.
2. **CSS** — `.cal-months { column-count: 2 / 3 }` : le DOM restait
   chronologique, l'ordre de lecture ne l'était plus. Touchait les 8 parcours,
   à partir de 900 px.

**Pourquoi V54.2 ne l'a pas vu** : le harnais ne testait que l'état gelé par
défaut (Fondations = les 365 jours, déjà triés) et n'a jamais reconstruit
l'ordre de lecture visuel. Les deux angles morts sont désormais couverts.

## 2. Vide structurel du Dashboard

Mesure `bas du PrimaryFocus → haut de la Trajectoire`, état « jour 1 » :

| Largeur | AVANT | APRÈS |
|---|:--:|:--:|
| 375 | 24 px (colonnes empilées) | 24 px |
| 768 | 24 px (colonnes empilées) | 24 px |
| 1024 | 24 px (colonnes empilées) | 24 px |
| **1440** | **122 px** (dont 98 imposés par le rail) | **24 px** |
| **1920** | **155 px** (dont 131 imposés par le rail) | **24 px** |

Vide **inexpliqué** (espace sous la colonne la plus courte, imposé par la plus
haute) : **122 / 155 px → 0 px** aux deux largeurs concernées.

Correction du rapport V54.2, qui annonçait « ~95 px » : c'était une mesure
partielle. La valeur réelle à 1440 était de 122 px, et de 155 px à 1920.

Hauteur de page @1440 : 1230 → **1187 px**. @1920 : 1230 → **1140 px**.

**Contrepartie assumée et mesurée** : le rail est désormais plus court que la
colonne principale (déséquilibre 516 px @1440, 470 px @1920). C'est une
propriété de l'**état neuf** — le rail ne contient que 2 panneaux tant qu'aucune
révision, aucun rythme et aucune preuve n'existent. Le rail est `sticky` : en
navigation réelle il accompagne le défilement. Le remplir serait de l'invention.

## 3. Réconciliation 365 / 188 / hors parcours

| Grandeur | AVANT | APRÈS |
|---|---|---|
| Badge calendrier | « 141 jour(s) hors parcours » — comptait les **trous dans l'intervalle couvert**, pas les jours hors parcours | « 188 / 365 jours du programme » |
| Jours 330→365 | **invisibles** (ni comptés ni expliqués) | comptés : « 36 au-delà du jour 329 » |
| Somme affichée | 188 + 141 = 329 ≠ 365 | **188 + 177 = 365**, affiché comme fait |

Partition vérifiée sur les 8 parcours (`SUM === 365` testé) :

| Parcours | parcours | avant | intercalés | au-delà | somme |
|---|:--:|:--:|:--:|:--:|:--:|
| ai-engineer-foundations-v1 | 365 | 0 | 0 | 0 | 365 |
| fullstack-typescript | 119 | 0 | 0 | 246 | 365 |
| frontend-engineer-v1 | 54 | 7 | 58 | 246 | 365 |
| backend-engineer-v1 | 85 | 0 | 1 | 279 | 365 |
| systems-cloud-foundations-v1 | 31 | 0 | 295 | 39 | 365 |
| appsec-cloud-security-v1 | 15 | 49 | 262 | 39 | 365 |
| cloud-devops-engineer-v1 | 29 | 0 | 297 | 39 | 365 |
| **data-ml-v1** | **188** | **0** | **141** | **36** | **365** |

Réponse directe à la question posée : **ce n'était pas une incohérence métier**.
Les 365 jours étaient intacts ; c'est la grandeur affichée qui ne correspondait
pas à son libellé, et une catégorie qui manquait.

## 4. CTA du Parcours

| Largeur | AVANT | APRÈS |
|---|---|---|
| 375 / 768 / 1024 | hors contexte, 45 px | **dans le bloc du parcours actif** |
| 1440 / 1920 | hors contexte, **107 px** | **dans le bloc du parcours actif** |

Il est désormais adjacent à la progression réelle et à la prochaine étape —
les deux informations qui le justifient.

## 5. Révisions — état vide

Hauteur du contenu @1440 : ~605 px → **~865 px** sur 1000 px de viewport.
Aucune révision inventée (la file reste à 0). Ajouté : les trois étapes réelles
du mécanisme, et une action existante (« Continuer le parcours — jour N »,
dérivée du même read-model que le Dashboard).
Retiré : le doublon « Rien à revoir aujourd'hui » et les pastilles
« Dues · 0 / À venir · 0 » qui répétaient la métrique voisine.

## 6. Accessibilité (axe-core, 5 routes)

| | Dashboard | Calendrier | Parcours | Synthèse | Révisions |
|---|:--:|:--:|:--:|:--:|:--:|
| critical/serious AVANT | 0 | 0 | 0 | 0 | — |
| `aria-allowed-role` AVANT | 0 | **365** | 0 | 0 | — |
| critical/serious APRÈS | **0** | **0** | **0** | **0** | **0** |

Corrigés pendant le sprint :
- `aria-allowed-role ×365` : `role="listitem"` posé sur `<a>` dans le calendrier
  → vraie liste `<ul>/<li>`, le lien reste un lien.
- `color-contrast ×1` (introduit par le nouvel état vide) : `--faint` sur la
  surface `--raised` tombe à 4,42:1 → `--muted` sur ce fond.
- `link-in-text-block ×2` : lien au fil du texte à 1,02:1 du texte environnant
  → soulignement dans les blocs de prose (le repère ne dépend plus de la teinte).

## 7. Responsive — 9 largeurs × 5 routes

**45 / 45 états conformes** : 0 overflow horizontal, 0 contenu réellement rogné,
ordre du calendrier chronologique à chaque largeur.

Le compteur « rogné » exclut trois cas justifiés (débordement `visible`,
conteneur qui défile volontairement, troncature par ellipse) et le motif
« visuellement masqué » à 1 px — sans ces exclusions il produisait 17 faux
positifs et n'aurait rien valu.

Synthèse, largeurs critiques re-mesurées : la table **tient dans son conteneur**
à 375 / 768 / 1024 / 1200 / 1400 / 1439 / 1440 / 1600 / 1920, avec **0
chevauchement d'en-tête**.

## 8. Défauts trouvés par l'INSPECTION des captures, pas par les métriques

1. **En-têtes `RÉVISIONS` / `COMPÉT.` superposés** à 1440 sur la Synthèse. Aucune
   métrique ne pouvait le voir : le texte débordait en `overflow: visible`, donc
   ni « overflow » ni « rogné ». Corrigé (largeur d'en-tête + césure de secours),
   et le seuil de repli des colonnes secondaires déplacé de 1400 à 1440 px pour
   supprimer la bande [1400–1439] où la table devait défiler.
2. **Résumé du mois écrasé** dans le pied du Dashboard : la règle « texte | accès
   rapides » à partir de 900 px s'appliquait désormais dans une colonne de
   ~750 px et non plus 1140 px. Repassé en une colonne sous 1500 px.

## 9. Intégrité de progression

`VISIT_{DASHBOARD,CALENDAR,PARCOURS,SYNTHESE,REVISIONS}_DOES_NOT_MUTATE_PROGRESS`
— **5 / 5 verts, sans aucune restauration**. `data/progress.json` reste au blob
gelé `32360402…`.

Le balayage multi-parcours bascule volontairement de parcours via l'API réelle
du produit (`POST /api/track`, action utilisateur légitime) puis remet la
baseline. Cette remise n'est **pas** un moyen de faire passer un test : les
assertions portent sur le rendu observé pendant la bascule, et la vérification
d'intégrité ci-dessus ne restaure rien.
