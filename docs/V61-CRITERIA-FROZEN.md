# V61 — CRITÈRES GELÉS

## Committé AVANT la première ligne d'implémentation V61

Ces critères sont **immuables** pendant le sprint. Aucun seuil ne sera abaissé,
aucune pondération modifiée après mesure, aucune métrique supprimée parce
qu'elle est devenue gênante.

Base de mesure : `docs/design/V61-CP0-BASELINE.md`, HEAD `425e7b2`.

---

## 1. Ce que V61 doit établir

> Le langage de la Career Workstation survit-il au passage de trois surfaces
> choisies à des surfaces qu'on n'a pas choisies ?

V61 n'est pas un spike. La direction est arrêtée. On l'industrialise.

---

## 2. Reference Hardening — le P0 visuel

Le CP0 a mesuré que la confusion signalée par V60.1 §7.1 **n'existe pas dans
le produit** : `.tmap` a un ratio largeur/hauteur de 1,7–2,5 et 60 pistes,
`.year-band` un ratio de 12,4–13,9 et 12 pistes. Un facteur 6.

Le défaut réel est autre : **les deux rôles sont inversés**.

### Contrat sémantique — gelé

| Motif | Doit signifier | Lecture | Silhouette |
|---|---|---|---|
| **TrajectoryMap** `.tmap` | position, chemin, progression, passage dans le temps, « où j'en suis » | **directionnelle** | un parcours continu, orienté |
| **YearBand** `.year-band` | structure du programme, distribution des mois, charge, texture, « à quoi ressemble mon année » | **cartographique, statique** | un relief, non orienté |

### Conditions de réussite du P0 — toutes obligatoires

1. `.tmap` porte une **continuité visible** d'un mois au suivant. Aujourd'hui
   ses 12 pistes sont indépendantes : rien ne relie la fin d'un mois au début
   du suivant.
2. `.tmap` porte une **tête de position** qui est la marque la plus forte de
   l'objet, mesurable : sa surface ou son contraste dominent toute autre
   marque de l'objet.
3. `.tmap` distingue **le parcouru du à-venir**, y compris — et surtout —
   quand le parcouru est vide. Aucune progression fictive.
4. `.year-band` porte une **grandeur verticale réelle** (la difficulté
   déclarée de la journée), ce qui le sort de la lecture de frise. Sa hauteur
   cesse d'être uniforme.
5. `.year-band` ne porte **aucune tête de position dominante** : ce n'est pas
   son rôle.
6. **Test aveugle obligatoire** : les deux objets isolés, sans logo, sans
   barre latérale, sans titre, sans libellé de composant, côte à côte à 1440.
   Si un observateur peut raisonnablement les confondre au premier regard :
   **FAIL**, corriger, retester.
7. **Aucun sixième motif** n'est créé pour résoudre le problème. L'ensemble
   reste fermé à `pos-ring`, `tmap`, `phase-rail`, `evi-mark`, `year-band`.
8. Mesure de séparation, publiée : ratio l/h, nombre de pistes, nombre de
   marques, hauteur des marques (uniforme ou non), présence d'une tête.

### Le barème V60.1 est rejoué sans être modifié

`docs/design/V60-1-SCORING-FROZEN.md` : dix critères, seuil `REFERENCE_CANDIDATE`
à **4,50**, cinq seuils obligatoires, dix-huit conditions bloquantes.

**Interdit** d'abaisser 4,50, de modifier une pondération, de supprimer une
métrique, de choisir des captures favorables.

Le but n'est pas de gagner 0,01. Le but est de corriger le défaut réel.

---

## 3. Ce qui compte comme MIGRATION — et ce qui n'y compte pas

### Ne compte PAS

- une recolorisation ;
- l'adoption d'un `SurfaceHead` ou d'un `PageHeader` ;
- le changement de trois classes CSS ;
- l'ajout d'un motif décoratif ;
- l'ajout d'un dégradé, d'une ombre ou d'un rayon.

### Compte comme migration RÉELLE — au moins **quatre** des huit

1. une zone focale claire, mesurable par la dominance ;
2. une ou plusieurs zones secondaires réellement subordonnées ;
3. une cadence verticale **non uniforme** ;
4. au moins **deux largeurs structurelles significatives** quand le contenu
   le justifie ;
5. une hiérarchie perceptible avant lecture ;
6. des transitions de contexte visibles ;
7. des cartes **uniquement** lorsque l'objet EST réellement une carte ;
8. du contenu directement sur le canvas lorsqu'une carte n'ajoute aucune
   sémantique.

Chaque route déclarée migrée doit nommer lesquelles des huit elle satisfait,
avec la mesure correspondante.

---

## 4. Seuils chiffrés — dérivés du CP0, gelés

| Grandeur | Mesure CP0 (le pire) | Cible V61 |
|---|--:|--:|
| hauteur de page, `/day/[id]` | **14 340 px** | **≤ 3 000 px** |
| dominance d'un bloc de premier niveau | 0,941 | **≤ 0,80** sur toute route migrée |
| blocs de premier niveau | 1 | **≥ 3** sur toute route migrée |
| largeurs structurelles distinctes | 1 | **≥ 2** sur toute route migrée dont le contenu le justifie |
| rectangles de signature identique | 20 / 24 | **≤ 8** par route migrée |
| débordement horizontal | 0 | **0** — acquis, à préserver |
| éléments au texte rogné | 42 à 375 px | **0** sur toute route migrée |
| ratio display / corps | 2,24 – 3,30 | **3,3 – 4,5** sur toute route migrée |
| routes sans CTA primaire | 11 / 16 | **≤ 3** parmi les routes migrées dont la fonction appelle une action |

Le seuil de `/day/[id]` à 3 000 px est délibérément plus généreux que les
900 px du prototype : le prototype masquait des sections dans des colonnes à
défilement indépendant, le produit doit rester une page. 3 000 px reste une
division par **4,8** de l'existant.

---

## 5. Conditions bloquantes — un seul échec interdit le verdict supérieur

### Intégrité — non négociable

1. `curriculum/` inchangé — SHA-1 `4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3`.
2. `data/progress.json` inchangé — blob `323604021055588a9528a86875f36598dbdc7758`.
3. 365 journées, ordre 1..365 strict.
4. Aucune donnée pédagogique modifiée : exercices, missions, capstones,
   diagnostics, preuves, textes, durées, difficultés, parcours.
5. **Naviguer ne mute pas `progress.json`** — hash avant / visite réelle /
   hash après, sur chaque famille de routes migrée. Aucune restauration de
   fichier n'est admise comme mécanisme de réussite.
6. Aucune progression fictive. Si aucune progression n'existe, l'interface
   le dit.
7. Aucune route supprimée.

### Technique

8. `npm test` vert — au moins 1 285 tests.
9. `tsc --noEmit` propre.
10. `npm run build` OK.
11. `npm run gates:active` vert — au moins 39 gates.
12. **axe-core : 0 critical, 0 serious** sur toute route migrée.
13. **0 débordement horizontal** sur 375 · 480 · 640 · 768 · 1024 · 1200 ·
    1440 · 1600 · 1920, sur toute route migrée.
14. Aucune régression mesurée sur les routes **non** migrées, vérifiée par la
    sonde gelée.

### Motifs

15. Ensemble fermé à cinq. Aucun sixième.
16. Chaque motif utilisé a : une fonction sémantique documentée, un contrat,
    un nombre borné de contextes, une version étroite, et un comportement
    `prefers-reduced-motion` s'il anime.
17. Aucun motif ajouté à une route pour augmenter un score.

### Gates

18. Tout nouveau gate V61 est **testé en négatif** : on casse volontairement
    ce qu'il protège, on vérifie qu'il échoue, on restaure. Un gate qu'on n'a
    jamais vu échouer n'est pas prouvé.

### Portée CSS

19. Aucune règle globale nouvelle sur `article`, `section`, `h1`, `h2`, `a`,
    `button`, `.page-head`, `.prose` sans vérification sur toutes les routes
    consommatrices.

---

## 6. Volume attendu

- **≥ 12 routes produit** reçoivent une recomposition réelle au sens du §3,
  **ou** une justification écrite route par route explique pourquoi moins
  étaient pertinentes.
- Une route « seulement reskinnée » est comptée comme telle dans le rapport,
  pas comme migrée.
- Le rapport publie trois nombres : recomposées / reskinnées / non traitées.

---

## 7. Navigation aléatoire — protocole

Avant clôture :

- **≥ 12 routes produit** tirées au sort ;
- dont **≥ 5 modifiées** par V61 ;
- dont **≥ 4 non modifiées** ;
- dont **≥ 1 dynamique** ;
- dont **≥ 1 état dense** ;
- dont **≥ 1 état vide**.

Le tirage est **publié avant** toute correction de ce qu'il révèle, et n'est
jamais réécrit après coup.

---

## 8. Test anti-template

Sur les routes principales, masquer logo, nom, barre latérale et violet, puis :

> Pourrait-on changer le logo et vendre cette page telle quelle comme dashboard
> générique d'un autre SaaS ?

Si **oui** : la migration n'est pas terminée. Identifier pourquoi, corriger par
composition, architecture d'information ou interaction. **Pas par décoration.**

---

## 9. Blind difference

Après chaque lot, BEFORE/AFTER à 1440 sans logo, barre latérale, nom, URL ni
numéro de version.

La différence doit être citable en termes de **zones, proportions, hiérarchie,
densité, rythme, objets graphiques, interaction, relation contenu/action**.

Ne comptent pas : « le violet est plus fort », « les bordures ont changé »,
« le padding a changé ».

---

## 10. Interdits — reconduits de V60.1

Grille de cartes génériques · un même espacement partout · un même rayon
partout · trois cartes de KPI sous un hero · dégradé décoratif omniprésent ·
grosse icône + titre + texte sur chaque bloc · glassmorphism · barre latérale
de SaaS générique · gabarit de tableau de bord · « bento grid » sans
justification · immense hero suivi d'un simple article · tout mis dans des
rectangles · visualisation décorative sans information · gamification · XP ·
séries · niveaux · classement · confettis.

**Une surface peut être simple. Elle ne doit pas être générique.**

---

## 11. Verdicts autorisés

`FAILED` · `IMPROVED` · `STRONG_IMPROVEMENT` · `REFERENCE_CANDIDATE` ·
`REFERENCE_GRADE`

Si une seule condition bloquante échoue : **le verdict inférieur exact**, avec
l'énoncé de ce qui manque. Aucune réinterprétation favorable, aucune promotion
par enthousiasme.

---

## 12. Ce qui n'est PAS testable dans cet environnement

Déclaré d'avance, pour que le rapport final n'ait pas à s'en excuser :

- aucun lecteur d'écran réel — ni NVDA, ni VoiceOver, ni JAWS ;
- aucun appareil physique ;
- aucun utilisateur réel ;
- tout est mesuré dans un Chromium sans tête.

Ce qui sera affirmé sera ce qui aura été mesuré.
