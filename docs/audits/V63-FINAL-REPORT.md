# V63 — UX CLOSURE + FINAL UI/UX AUDIT · Rapport final

Toutes les valeurs sont mesurées au navigateur ou lues dans le dépôt.

---

## 1 à 7 — État et invariants

| # | | avant | après |
|---|---|---|---|
| 1 | HEAD | `9363d91` | `c6bb234` + commit de clôture |
| 2 | branche | `claude/ai-career-os-saas-phfg49` | idem |
| 3 | local == origin | oui | oui |
| 4 | working tree | propre | propre |
| 5 | corpus (sha des sha) | `a2099b51…a7a2edf` | **identique** |
| 6 | `progress.json` | `73c1ee39…1fc6e7a6` | **identique** |
| 7 | 365 jours + ordre | 365, md5 `5d7f8a3d…` | **identique** |

Fichiers : `curriculum/` 951, `data/` 547, routes de production 36 — inchangés.

## 8 — Cause exacte du +188 px

Budget de hauteur construit sur **5 journées × 6 largeurs** avant toute
modification. L'attribution est exacte, pas approchée :

```
/day/80 @375 — sortie V62
  ligne de contexte              37 px
  bloc mission (hero + CTA)     375 px
  sélecteur de volet             47 px
  ┌ atelier                   12 990 px
  │   déroulé  .day-shop-ctx    168 px   ← AJOUTÉ PAR V62
  │   lecture  .day-shop-read 12 802 px
  │   action   .day-shop-do        0 px  (volet masqué)
  └ + bordure et marge du déroulé ~20 px ← AJOUTÉ PAR V62
  navigation de fin              ~50 px
  ────────────────────────────────────
  TOTAL                       13 613 px

  168 + 20 = 188 px
```

**Cause unique et prouvée par le diff CSS** : V61 masquait `.day-shop-ctx`
dans les volets « lire » et « faire » ; V62 l'affichait, plafonné à 168 px,
pour rendre le déroulé visible pendant la lecture.

**Ce qui est légitime** : les 12 802 px du volet lecture. `/day/80` porte
2 430 mots et 8 sections. C'est le cours, pas un mur.
**Ce qui était accidentel** : les 188 px — un remède réel à un manque réel,
mais dont le coût était permanent alors que le service s'arrêtait après le
premier écran d'un document de 12 800 px.

## 9 — Correction appliquée

Le déroulé retrouve sa place (volet « Plan ») et **le sélecteur de volet devient
collant**. Il existait déjà — 47 px en V61 comme en V62 — donc il ne coûte rien
de plus, et « Plan » devient atteignable à n'importe quelle profondeur de
défilement au lieu du seul haut de page.

**Plus de navigation qu'en V62, pour zéro pixel ajouté.**

Deux défauts trouvés en vérifiant ma propre correction :

1. **La barre supérieure de l'application est elle-même collante** (52 px,
   z-index 30). Mon `top: 0` faisait glisser le sélecteur *derrière* elle : il
   était à `top=0` et **invisible**. Ma première sonde l'avait déclaré
   « visible » parce qu'elle vérifiait la géométrie et non l'occlusion.
   Ancré à `top: var(--topbar-h)`, il est réellement visible — vérifié en
   capture à 5 000 px de défilement.
2. **Deux bandes collantes empilées font ~100 px.** Sans marge de défilement,
   la cible du focus clavier se rangeait dessous et disparaissait. Mesuré :
   **5 arrêts de tabulation sur 43** recouverts. `scroll-margin-top` sur les
   cibles interactives des deux volets → **0 sur 43**, aux deux largeurs.

Une sonde a aussi été affinée plutôt que le produit : elle comptait comme
« masquée » une région plus haute que la fenêtre dont le bord supérieur passe
sous la barre, sans que son contenu soit caché.

## 10 — Mesures BEFORE / AFTER

| jour | @375 V62 | @375 V63 | delta | baseline gelée | |
|---|--:|--:|--:|--:|:--:|
| `/day/1` | 6 537 | **6 349** | −188 | 6 349 | ✅ |
| `/day/80` | 13 613 | **13 425** | −188 | 13 425 | ✅ |
| `/day/181` | 3 803 | **3 615** | −188 | 3 615 | ✅ |
| `/day/205` | 5 014 | **4 826** | −188 | 4 826 | ✅ |
| `/day/320` | 11 670 | **11 482** | −188 | 11 482 | ✅ |

À 430, 768 et 1024 : −188 px sur les cinq journées.
À **1440 et 1920 : delta 0** sur les cinq journées — aucune correction mobile
n'a dégradé le desktop.

## 11 — Les dix conditions de V62, rejouées

| # | Condition | V62 | V63 | |
|---|---|---|---|:--:|
| 1 | 0 route learner-facing sans contexte | 35 A / 0 B / 0 C | **35 A / 0 B / 0 C** | ✅ |
| 2 | `/lessons` et `/missions` scannables | 3 295 / 2 328 | **3 295 / 2 328** | ✅ |
| 3 | `/lab` sans DOM massif | 367 nœuds | **367 nœuds** | ✅ |
| 4 | grammaire par famille | 3 coquilles | **3 coquilles** | ✅ |
| 5 | aucun sixième motif | 5 | **5** | ✅ |
| 6 | 0 débordement | 0 / 324 | **0 / 324** | ✅ |
| 7 | 0 axe critical / serious | 0 / 0 | **0 / 0** | ✅ |
| 8 | invariants produit | intacts | **intacts** | ✅ |
| 9 | blind-difference convaincant | oui, 3 ambiguïtés | **oui, 3 ambiguïtés** | ✅ |
| 10 | **aucune régression** | **13 613 > 13 425** ❌ | **13 425 = 13 425** | ✅ |

**10 / 10.**

## 12 à 16 — Validation

| | |
|---|---|
| responsive | **324 états** (36 routes × 9 largeurs) — 0 débordement, 0 rognage, `h1` = 1, tous HTTP 200 |
| axe-core | **0 critical, 0 serious** |
| clavier | 0 cible de focus masquée à 375 et 1440 |
| tests | **1 285 / 1 285** |
| `tsc` | vert |
| build | vert |
| gates | **41 / 41** |

## 17 — Intégrité de navigation

`progress.json` et le corpus : hachages **identiques** avant et après 32 visites
de routes, **sans aucune restauration**. 365 jours, même ordre.

## 18 — Défauts découverts pendant le sprint

1. Le sélecteur collant glissait derrière la barre supérieure (invisible).
2. 5 arrêts de tabulation sur 43 masqués par les deux bandes collantes.
3. Ma sonde de « masquage » comptait des régions pleine page comme masquées.

## 19 — Ce qui n'a PAS été corrigé

- **La hauteur intrinsèque des journées longues.** `/day/80` reste à 13 425 px
  à 375 px. C'est le cours. Le brief V63 le dit : « le problème recherché est
  la RÉGRESSION artificielle, pas la longueur intrinsèque ».
- **Les 10 pages > 5 000 px à 375** héritées de V62 : inchangées, hors périmètre
  d'un sprint chirurgical.
- **Les budgets ratés de peu en V62** (`/lab` 366 Ko vs 350, `/glossary` 445 vs
  400) : ce ne sont pas des conditions de clôture, ils restent en dette.

---

## 20 — AUDIT UI/UX FINAL

Seize surfaces inspectées à 1440, plus 375 sur les critiques. Notes /5, sans
complaisance.

| axe | note | ce qui la justifie |
|---|:--:|---|
| 1. hiérarchie visuelle | **4** | ligne de contexte → titre display → corps : lisible d'un coup d'œil partout. Perd un point sur les états vides, où quatre compteurs à zéro reçoivent autant de poids qu'une vraie donnée. |
| 2. composition | **4** | 36 routes, dominance médiane 0,45, aucune page à bloc unique. `/skills` (51 blocs, 0,71) et `/projects` (0,78) restent les plus lâches. |
| 3. usage de l'espace | **3** | le point faible. Le hero de `/skills` laisse ~250 px vides à droite ; `/projects` a une colonne gauche nettement plus courte que la droite ; `/day` à 1440 a ~100 px morts entre le hero et l'atelier. |
| 4. densité | **4** | bonne sur les catalogues et l'atelier. Les pages de pilotage à progression nulle sont sous-denses par nature. |
| 5. scannabilité | **4** | index, groupes dépliables, lignes plutôt que cartes. `/day` à 375 reste un long document malgré le sélecteur collant. |
| 6. typographie | **4** | ratio 3,3 sur les 36 routes, un seul jeu, monospace pour les registres. Manque une vraie échelle intermédiaire entre le display et le corps. |
| 7. profondeur | **4** | 4 à 17 fonds, 2 à 7 ombres selon la famille. Cohérent, jamais plat. |
| 8. cohérence | **5** | trois coquilles partagées, une seule grammaire, un seul ratio, deux traitements d'action sémantiquement distincts. C'est l'acquis le plus solide. |
| 9. identité propriétaire | **4** | la ligne de contexte est un marqueur fort et unique. Les cinq motifs sont bien tenus mais **21 routes sur 36 n'en portent aucun**. |
| 10. originalité | **3** | reconnaissable, mais l'ossature (rail + canevas + hero + listes) reste celle d'un outil d'ingénierie sombre. Peu de partis pris risqués. |
| 11. impression premium | **4** | dense, sobre, sans décor gratuit. Ce qui manque est le raffinement de détail : micro-états, transitions, alignements optiques. |
| 12. qualité responsive | **5** | 324 états sans un seul débordement ni rognage, de 375 à 1920. Mesuré, pas supposé. |
| 13. affordance des actions | **4** | 35/35 routes ont une action primaire réelle. `.cta` navigationnel vs `.primary` en place : hiérarchie claire. |
| 14. confort longue durée | **4** | fond bleu-nuit, contrastes AA, mesure de lecture bornée à 632 px, `prefers-reduced-motion` respecté. |
| 15. complexité sans encombrement | **4** | 711 termes, 376 exercices, 365 jours, 128 leçons — tous rendus navigables sans mur. C'est la démonstration la plus convaincante du sprint. |

**Moyenne : 4,0 / 5.**

### Question 1 — produit ambitieux ou outil interne bien habillé ?

**Un produit personnel ambitieux et cohérent, qui n'est pas encore distinctif.**

Ce qui plaide pour le produit : la grammaire tenue sur 36 routes, la ligne de
contexte, la discipline anti-cartes, le responsive irréprochable, une
accessibilité réellement à zéro violation. Ce n'est pas de l'habillage : c'est
de la composition.

Ce qui le retient : l'ossature reste celle d'un outil d'ingénierie sombre à
rail latéral. Un observateur dirait « très bon outil interne » avant de dire
« produit ». La différence tient à des choses que V63 n'avait pas mandat de
faire : une signature de marque au-delà du monogramme, des micro-états
soignés, une page d'entrée qui raconte quelque chose.

### Question 2 — sans logo, sans nom, sans indigo, reste-t-elle identifiable ?

**Oui, partiellement.** Deux marqueurs survivent au masquage de l'accent :

- **la ligne de système** monospace en capitales, paires `CLÉ valeur` — c'est
  le signal le plus fort, et il est structurel, pas chromatique ;
- **le double registre typographique** display/corps à 3,3, constant sur les
  36 routes.

Ce qui ne survit pas : la hiérarchie des actions repose largement sur l'indigo.
Sans lui, `.cta` et `.primary` deviennent difficiles à distinguer d'un bouton
secondaire. C'est une vraie limite, et elle est mesurable.

### Question 3 — les trois plus gros écarts avec une référence premium

1. **L'usage de l'espace horizontal** (note 3/5). Plusieurs surfaces laissent
   200 à 300 px vides à droite d'un hero ou d'une colonne. Une référence
   premium ne laisse pas de vide non intentionnel.
2. **L'absence de micro-états.** Pas de transitions d'entrée, pas d'états de
   chargement composés, pas de retour visuel sur les actions longues. Le
   produit est statique là où une référence est vivante.
3. **Les états vides sous-travaillés.** À progression nulle — l'état réel d'un
   nouvel utilisateur — plusieurs surfaces affichent des colonnes de zéros avec
   le même poids visuel qu'une donnée. C'est honnête mais ce n'est pas
   accueillant.

---

## 21 — Recommandations (NON implémentées en V63)

### P0 — avant le Learning Engine · **1 recommandation**

**P0-1 · Les états vides des surfaces de pilotage à progression nulle**
· pages : `/skills`, `/synthese`, `/parcours`, `/revisions`
· problème : quatre compteurs à zéro reçoivent le poids visuel d'une donnée
réelle ; `/skills` affiche « 0 / 20 » trois fois sur le premier écran
· preuve : `docs/design/v63/audit/skills-1440.png`
· impact : c'est le **premier écran de tout nouvel utilisateur** — l'état par
défaut du produit aujourd'hui
· proposition : un état vide qui dit ce qui va le remplir, au lieu de compter
des zéros. Pas de nouvelle abstraction : la grammaire « prochaine action »
existe déjà
· coût **M** · risque de régression **faible**
· pourquoi cela mérite de précéder le Learning Engine : le Learning Engine va
précisément **remplir** ces surfaces. Les concevoir vides d'abord évite de les
refaire deux fois — mais c'est un travail de contenu, pas de redesign.

### P1 — à intégrer AVEC le Learning Engine · **4 recommandations**

| # | pages | problème | proposition | coût | risque |
|---|---|---|---|---|---|
| P1-1 | `/skills`, `/projects`, `/day` @1440 | 200-300 px vides à droite des heros ; colonnes désalignées | rééquilibrer quand les données réelles arriveront — le vide vient partiellement de l'absence de progression | S | faible |
| P1-2 | toutes | aucun micro-état sur les actions (soumission, validation, calcul) | le Learning Engine introduit ces actions : les états y naîtront avec elles | M | faible |
| P1-3 | `/day` @375 | 13 425 px restent un long document malgré le sélecteur collant | indicateur de section courante dans la barre collante, alimenté par la progression réelle | M | moyen |
| P1-4 | 21 routes sans motif | familles « apprendre » et « technique » sans marqueur propriétaire | n'ajouter un motif que si le Learning Engine crée une question de position sur ces surfaces — sinon ne rien faire | S | faible |

### P2 — polish ultérieur · **3 recommandations**

| # | pages | problème | proposition | coût | risque |
|---|---|---|---|---|---|
| P2-1 | global | la hiérarchie des actions dépend de l'indigo (test à l'aveugle) | différencier `.cta` / `.primary` aussi par la forme ou le poids | S | faible |
| P2-2 | global | pas d'échelle typographique intermédiaire entre display et corps | ajouter un palier, sans toucher au ratio 3,3 gelé | S | moyen |
| P2-3 | `/lab`, `/glossary` | budgets ratés de peu (366 vs 350 Ko, 445 vs 400 Ko) | finir la diète — options de filtres, lignes d'index | S | faible |

**Aucune de ces recommandations n'a été codée en V63.** Seul le blocker l'a été.

---

## 22 — Comparaison avec les prototypes V60

| | |
|---|---|
| **ce qui a survécu** | la **ligne de système** de *Mission Control* — devenue `ContextLine`, aujourd'hui sur 31 routes, et le marqueur d'identité le plus fort du produit. L'**atelier borné** de *Learning Workstation* — devenu `.day-shop` à 1440 et `.lab-results`. Le fond bleu-nuit réglé, le double registre typographique, la sobriété de l'accent. |
| **ce qui a été perdu** | la **densité de commandement** de *Mission Control* : le prototype affichait plus de faits par écran avec moins de chrome. Le rail latéral de production consomme 236 px que le prototype n'avait pas. L'ambition éditoriale de *Career Intelligence* — le produit n'a pas de surface qui raconte une trajectoire de carrière. |
| **meilleur dans le prototype** | l'usage de l'espace horizontal ; l'audace typographique (le prototype osait des titres plus grands sur canevas plein) ; l'absence de rail, qui rendait chaque écran plus impressionnant. |
| **meilleur dans le produit réel** | tout ce qui touche au **contenu réel** : le prototype composait sur des données fictives et courtes, le produit tient 365 jours, 711 termes, 376 exercices. Le responsive (le prototype ne visait que 1440). L'accessibilité (0 violation sur 324 états). Et la **navigabilité** — le prototype n'avait pas à faire tenir un cours de 12 800 px. |
| **hybridation cohérente ?** | **Oui.** Le produit a pris de V60 sa grammaire (contexte, atelier, sobriété) et non son décor. Il n'a pas copié trois directions collées bout à bout — c'était l'échec que V60.1 devait éviter, et il l'a évité. |

> **Avons-nous suffisamment capturé l'ambition visuelle de V60 pour arrêter le
> redesign et avancer sur le moteur produit ?**

# OUI AVEC RÉSERVES

**Oui** : la grammaire de V60 est dans le produit, tenue sur 36 routes, vérifiée
par gate, et elle survit au test à l'aveugle. Ce qui manque encore n'est plus
de la *direction* — c'est du raffinement et du contenu.

**Réserves** : deux écarts réels avec le prototype subsistent — l'usage de
l'espace horizontal et l'absence de micro-états. Aucun des deux ne se répare
par un sprint de redesign autonome : le premier se règle quand les surfaces
porteront des données réelles, le second quand il y aura des actions à animer.
**Les deux sont donc du ressort du Learning Engine, pas d'une V64 de redesign.**

---

## 23 — Verdict

# UX_CLOSURE_READY

Les dix conditions passent. La régression qui avait fait échouer V62 est
corrigée par sa cause, mesurée au pixel, sans toucher au contenu pédagogique,
sans réduire une police, sans compresser un espacement, et sans dégrader le
desktop.

## 24 — Le Learning Engine peut-il commencer ?

# OUI

## 25 — Dette restante, explicitement assumée

1. `/day/[id]` : 13 425 px à 375 px — la longueur du cours, assumée.
2. 10 pages > 5 000 px à 375 px.
3. `/lab` 366 Ko (cible 350), `/glossary` 445 Ko (cible 400).
4. 5 routes sans ligne de contexte : `/capstones/[id]`, `/missions/[id]`,
   `/lab/[id]`, `/notes`, `/settings` — outils mono-objet, choix assumé.
5. 21 routes sans motif propriétaire.
6. Usage de l'espace horizontal noté 3/5.
7. Aucun micro-état sur les actions.
8. La hiérarchie des actions dépend de l'accent indigo.
9. Aucun test lecteur d'écran réel (NVDA/VoiceOver) n'a été réalisé — seulement
   axe-core, la structure des titres, les landmarks et le parcours clavier.

---

> **Le redesign autonome doit maintenant s'arrêter : OUI.**

V64 sera le Learning Engine. Les évolutions d'interface doivent désormais être
tirées par une fonctionnalité ou un défaut utilisateur mesuré — jamais par une
recherche générale de nouvelle direction visuelle.
