# V54.1 — Visual Direction Lock

Décision fondée sur les captures réelles `docs/audits/visual/v541-before/` (état V54)
et `docs/audits/visual/v541-after/` (état V54.1), 5 pages × 5 largeurs.

## 1. Cette UI est-elle la direction à propager ? — **OUI (LOCKED)**
Les 5 surfaces de pilotage partagent désormais une grammaire cohérente et
premium : `PageHeader`, `Status` (ton + libellé + point), `Metric`, `ListRow`,
tables comparatives, panneaux à élévation, accent indigo parcimonieux, navigation
resserrée. Deux captures V54/V54.1 des mêmes pages ne peuvent pas être confondues.

## 2. Patterns APPROVED
- **PrimaryFocus** pour « quoi faire maintenant » (1 par page max).
- **Panel** (élévation) pour encarts/rail ; `is-emphasis` pour le primaire.
- **ListRow / liste 1 colonne** pour les listes denses (missions, parcours, révisions).
- **Table comparative** (scroll + colonnes masquées en responsive) pour la Synthèse.
- **Calendrier** : maçonnerie de mois (colonnes CSS) + semaine = grille de 7 jours +
  badge de couverture.
- **Navigation** groupée Pilotage/Apprendre/Évaluer/Outils + sections repliables.
- **Status / Metric** : donnée réelle, couleur jamais seule.
- **EmptyState / InlineNotice** : vide honnête + explication du mécanisme.

## 3. Patterns FORBIDDEN
Grille de cartes clonées comme layout par défaut · CTA lourds répétés (×8) ·
semaines wrappées / trous de calendrier · 6 labs au 1er niveau · XP/niveau/streak/
badge RPG/leaderboard/confetti · hero marketing · glow/gradient gadget · radar ·
stat vanity · faux score · fausses données · emoji structurel · couleur seule.

## 4. Pages de référence
- **Calendrier** (`/calendar`) — maçonnerie + semaines nettes + couverture.
- **Synthèse** (`/synthese`) — table comparative multi-parcours.
- **Missions** (`/missions`, V54) — liste groupée par statut.
- **Dashboard** (`/`, V54) — cockpit PrimaryFocus.

## 5. Ce qui reste insuffisant (honnête)
- **Dashboard** : vide vertical résiduel bas-gauche à trajectoire courte (colonnes
  déséquilibrées).
- **Projects** : non migré (spec prose, pas d'en-tête objectif/état/artefacts).
- **Parcours** : en-tête encore en grammaire `.page-head` (dépend de `page-wide`).
- **Synthèse** : la table déborde le `--content-max` en desktop moyen → scroll
  interne (acceptable) ; à affiner en V55.
- Surfaces techniques (labs) non migrées (SPECIALIZED).

## 6. Peut-on lancer la migration des autres routes ? — **OUI**
La direction est verrouillée et cohérente sur les surfaces de pilotage. La migration
large (V55) peut démarrer en s'appuyant sur ces patterns de référence, en traitant
d'abord la dette ci-dessus.

**Décision : VISUAL_DIRECTION_LOCKED.**
