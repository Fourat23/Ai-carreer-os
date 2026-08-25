# V60.1 — RAPPORT FINAL

## Prototype hybride de référence — AI Career OS · Career Workstation

**Verdict : `STRONG_IMPROVEMENT`**
Moyenne mesurée **4,49 / 5** — le seuil de `REFERENCE_CANDIDATE` est **4,50**.
Manqué de **0,01**. Les dix-huit conditions bloquantes sont toutes tenues ;
c'est la moyenne, et elle seule, qui ne passe pas. Le barème a été gelé et
committé au CP1 (`b95a23f`), **avant** la première ligne d'implémentation, et
n'a pas été touché après mesure.

Trois surfaces : `/design-spike/v60-1/dashboard`, `/day/[id]`, `/calendar`.
Aucune route produit modifiée. Aucune écriture. Toutes les actions inertes.

---

## 1. Ce qui a été construit

Un système local de 121 classes, toutes préfixées `cw-`, dans
`app/design-spike/v60-1/`, plus trois surfaces qui le consomment.

| Fichier | Rôle |
|---|---|
| `cw.css` | le système : encres, échelle, coquille, les trois surfaces, le responsive |
| `data.ts` | extraction **en lecture seule** de `program.json`, du corpus et de `progress.json` |
| `motifs.tsx` | les cinq motifs propriétaires, un rôle chacun |
| `shell.tsx` | ligne de système, ligne de faits, sélecteur de volet, mode aveugle |
| `dashboard/`, `day/[id]/`, `calendar/` | les trois surfaces |

### La règle d'architecture des trois couches

> A définit le langage de pilotage. B définit le langage de travail.
> C définit le langage typographique.

Elle a été tenue comme une règle d'attribution, pas comme un collage :

- **de A** : la ligne de système en tête, le bloc focal unique, le champ de
  trajectoire large ;
- **de B** : la page **bornée à la hauteur de fenêtre**, les zones accolées
  qui défilent indépendamment, la ligne de faits en pied ;
- **de C** : l'échelle typographique (un élément display par écran), la
  respiration, le renversement de matière entre lecture et action, et le refus
  d'égaliser les mois.

Ce qui fait le produit n'est aucune des trois : c'est la **coquille**. Même
ligne de système, même ligne de faits, même grammaire d'en-tête de zone, même
légende, même sélecteur de volet en écran étroit. Le corps change ; le cadre
jamais.

---

## 2. Les quatre grandeurs gelées — mesurées

| Grandeur | A | B | C | cible | **V60.1 mesuré** | |
|---|--:|--:|--:|--:|--:|:--|
| hauteur de page, Day | 9 331 px | 930 px | 11 720 px | ≤ 1 400 | **900 px** @1440 · **1 080 px** @1920 | ✅ |
| ratio display / corps | 4,2–5,2 | 2,1–2,4 | 5,4–6,0 | 3,3 – 4,5 | **3,36 – 3,65** @1440 · **3,73 – 4,27** @1920 | ✅ |
| variantes de largeur, Day | 2 | 4 | 2 | ≥ 4 | **4** (250 · 684 · 506 · 1190) | ✅ |
| dominance du focal, Dashboard | 0,55 | 0,60 | 0,68 | 0,45 – 0,65 | **0,60** @1440 · **0,52** @1920 | ✅ |

Le ratio est mesuré **sur les trois écrans**, aux deux largeurs — six mesures,
toutes dans la cible. Ce n'était pas le cas avant le CP14 : voir §6.

---

## 3. Les dix-huit conditions bloquantes

| # | Condition | Preuve | |
|---|---|---|:--|
| 1 | Focus indiscutable sur le Dashboard | un seul objet en violet plein (`.cw-go`), un seul plan élevé (`--focal`), dominance 0,52–0,60 | ✅ |
| 2 | Aucune grille de cartes générique | zéro `border-radius` de carte, zéro ombre ; les registres sont des plans accolés séparés par un filet d'1 px | ✅ |
| 3 | Trajectoire réellement informative | 365 colonnes réelles, hauteur = difficulté réelle (1→5), 12 groupes mensuels, 52 révisions et 9 jalons distingués, position marquée ; **aucune progression dessinée** — `progress.json` est vide et le prototype le dit | ✅ |
| 4 | Lecture ET action au premier viewport 1440 × 900 | sonde navigateur, 6/6 éléments requis sur 5 journées, `scrollHeight = 900` | ✅ |
| 5 | Passage lire → faire structurel | fond `#080a10` → `#1b2233`, arête d'accent 2 px pleine hauteur, mesure de lecture 74ch → colonne dense 13 px, bloc de preuve en tête ; **survit au niveau de gris** | ✅ |
| 6 | Tient sur cinq journées réelles | J181 (la plus courte, 4 734 car) · J80 (la plus longue, 19 483) · J89 (code) · J45 (projet) · J326 (IA/data) — toutes 6/6, page 900 px | ✅ |
| 7 | Structure annuelle comprise au premier écran | règle de l'année à l'échelle `rule` + 12 lignes de mois de longueur variable | ✅ |
| 8 | Longueurs réelles préservées | segments proportionnels (28 j → 99 px, 35 j → 122 px, rapport 1,23 pour un rapport réel de 1,25) ; les lignes de 4 semaines **ne sont pas complétées** jusqu'à 5 | ✅ |
| 9 | Action contextuelle utile | sélection de mois par la règle **et** par la grille ; « Ouvrir J*n* — première journée du mois » | ✅ |
| 10 | Pas 365 boutons | 12 liens de mois + 12 liens de ligne. Les 365 journées sont des traits, pas des cibles | ✅ |
| 11 | Trois écrans sur trois en aveugle | `blind-trio-1440.png` | ✅ |
| 12 | ≥ 2 motifs réellement perceptibles | TrajectoryMap (170 px), YearRule (46 px + graduations), PhaseRail (15 entrées navigables), EvidenceMark (20 px), YearBand (pied) — **cinq** | ✅ |
| 13 | Identité indépendante du violet | `blind-trio-gris-1440.png` — coquille, échelle, grammaire et renversement de matière tiennent tous en niveaux de gris | ✅ |
| 14 | 0 débordement sur 5 largeurs | 15/15 états, sonde `documentElement.scrollWidth > clientWidth` + détection d'élément débordant hors conteneur à défilement assumé | ✅ |
| 15 | axe-core : 0 critical, 0 serious | 8 états (3 surfaces × 375/1440 + le volet FAIRE) → **0 violation** | ✅ |
| 16 | Corpus / progress / curriculum inchangés | corpus SHA-1 `4c1f3028…` identique · `progress.json` blob `323604021…` identique · aucun fichier de `curriculum/` ni de `data/` touché | ✅ |
| 17 | Tests, tsc, build, gates verts | **1 285 tests** passés, 0 échec · `tsc --noEmit` propre · build OK · **39 gates** verts | ✅ |
| 18 | 36 routes produit inchangées | sonde gelée V56/V57 rejouée et comparée à `docs/audits/v59/cp15-after.json` : **identique, métrique par métrique, sur les 36 routes** | ✅ |

**18 / 18.** Aucune condition bloquante n'échoue.

---

## 4. Notation — les dix critères

| # | Critère | Note | Ce qui la fixe |
|---|---|--:|---|
| 1 | Hiérarchie | **4,6** | dominance mesurée dans la cible aux deux largeurs ; un seul `h1` par écran ; un seul objet en aplat d'accent |
| 2 | Composition | **4,3** | 4 variantes de largeur, rythme vertical non uniforme, lignes de mois de longueur réelle — mais **deux vides identifiés** : le tiers droit de l'en-tête du Day sur 5 journées / 5, et la bande droite des mois de 4 semaines |
| 3 | Utilisation de l'espace | **4,5** | 15/15 états bornés à la hauteur de fenêtre ; aucune page au-delà du viewport ; 900 px contre 9 331 (A) et 11 720 (C) |
| 4 | Identité | **4,4** | le triptyque aveugle tient, et il tient en gris — mais TrajectoryMap et YearRule se lisent comme deux frères au premier regard (§7) |
| 5 | Typographie | **4,6** | 6 mesures sur 6 dans la cible ; **10 crans réellement rendus** : 10,5 · 11,5 · 13 · 15 · 16,5 · 17 · 21 · 27 · 30 · 50–56 px |
| 6 | Densité informationnelle | **4,6** | trois redites supprimées sur mesure : le livrable dit deux fois, la double numérotation, et 103 étiquettes de grille à information nulle (§6) |
| 7 | Valeur learner-facing | **4,6** | les six questions du Day répondues sans défiler sur 5 journées de natures différentes ; l'action du Dashboard au-dessus de la ligne de flottaison **aux 5 largeurs** |
| 8 | Cohérence inter-pages | **4,7** | une seule coquille, une seule légende, un seul sélecteur de volet, un seul pavé de faits, un seul jeu de quatre valeurs pour coder une journée |
| 9 | Premium | **4,2** | encres profondes, filets d'1 px, chiffres tabulaires, zéro ombre — mais la colonne de contexte du Day reste serrée à 250 px, et les limites de défilement coupent en milieu de mot |
| 10 | Originalité | **4,4** | le renversement lire/faire est piloté par `data-family`, la taxonomie que le corpus porte déjà ; la règle de l'année à segments proportionnels ; la grille « norme dite une fois, écart dit sur place » ; le sélecteur de volet **sans JavaScript** |

**Moyenne : 44,9 / 10 = 4,49.**

| Seuil `REFERENCE_CANDIDATE` | Exigé | Mesuré | |
|---|--:|--:|:--|
| moyenne | ≥ 4,50 | **4,49** | ❌ |
| aucune catégorie sous | 4,00 | min **4,20** | ✅ |
| identité | ≥ 4,40 | **4,40** | ✅ |
| originalité | ≥ 4,20 | **4,40** | ✅ |
| valeur learner-facing | ≥ 4,50 | **4,60** | ✅ |

Un seul seuil manque, de 0,01. Le barème dit : *« Si une seule condition
échoue : le verdict inférieur exact, avec l'énoncé de ce qui manque. Aucune
réinterprétation favorable. »* Le verdict est donc `STRONG_IMPROVEMENT`, et ce
qui manque est énoncé au §8.

---

## 5. Les cinq motifs — un rôle, une occurrence par écran

| Motif | Rôle unique | Dashboard | Day | Calendar |
|---|---|:--:|:--:|:--:|
| **TrajectoryMap** | l'année entière comme **champ**, hauteur = difficulté | ● 170 px | — | — |
| **YearBand** | l'année compactée en **règle de position** | ○ pied | ○ pied | ● **tête, échelle `rule`** |
| **PhaseRail** | la position dans un **document**, navigable | — | ● 15 ancres | — |
| **PositionRing** | la position dans un **intervalle borné** | ● mois | — | — |
| **EvidenceMark** | la **nature** d'une preuve | — | ● 3 glyphes | — |

Décision du CP8, visible dans le code : **le Calendrier ne porte pas de
YearBand dans sa ligne de faits**, parce que le motif y est promu en tête à
grande échelle. Un motif, un rôle, une occurrence par écran.

Aucun sixième motif n'a été créé. Le gate V59 vérifie l'ensemble fermé à
cinq et il est vert.

---

## 6. Ce qui a été trouvé et corrigé — par la mesure, pas par l'impression

Chaque défaut ci-dessous a été **mesuré** avant d'être corrigé, et le nombre
mesuré est inscrit dans le commentaire du code qui le corrige.

### Le livrable était affiché deux fois, mot pour mot

Sur les cinq journées de test, la section « Livrable attendu » du corpus ne
contient **rien d'autre** que la chaîne `deliverable` du programme — égalité
stricte, de 18 à 70 caractères. Sur J326, la phrase « CI complète verte. »
apparaissait à `y = 357` et à `y = 857` du même écran. La section est
désormais **repliée dans le bloc de preuve**, qui devient son emplacement
unique et porte son ancre et son rang.

### La même section portait deux numéros sur le même écran

Le rail numérotait globalement (« 04 Pratique autonome »), les colonnes
renumérotaient localement (« 01 Pratique autonome »). Le rang est maintenant
porté par la donnée (`CwSection.n`) et il est le même partout.

### Le Calendrier imprimait 103 étiquettes à information nulle

Mesure sur les 52 semaines : la charge vaut 32 h dans 51 cas, le nombre de
journées 7 dans 51 cas, le nombre de révisions **1 dans les 52 cas**. La grille
imprimait donc « 32 h » 52 fois et « 1 RÉVISION » 52 fois — et ces 103
étiquettes masquaient les deux seules cellules qui portaient une information
(S52 : 8 j, 36 h). La norme est désormais énoncée **une fois** en tête de zone,
et une cellule ne porte un chiffre que lorsqu'elle s'en écarte.

### La règle de l'année était un code-barres, puis un peigne

Premier état : 365 barres identiques, même hauteur, même gris — une texture.
Deuxième état, sur-corrigé : journées ordinaires à 38 % en `#333c54`,
révisions à 66 % en ambre plein — il ne restait visuellement que 52 traits
ambre réguliers. Troisième état : la masse des journées ordinaires porte la
règle (62 %, `#4a5474`), la révision est un accent (80 %, ambre .40), le jalon
et la position montent à pleine hauteur.

### La ligne de système débordait de la fenêtre à 1024 px

Mesuré : queue à 1 217 px pour 1 024 px de large, sur le Dashboard **et** sur
le Day. Les champs sont en `nowrap` par nature. La ligne défile désormais
latéralement et sa queue se tronque.

### L'échelle typographique ne tenait pas là où elle comptait le plus

Mesuré au CP14 : le Day plafonnait à **2,30** et le Calendrier à **2,02**,
contre une cible gelée de 3,3–4,5 — alors même que le Dashboard la tenait à
3,65. Le Calendrier n'avait **aucun** caractère à l'échelle display. Le seuil
étant gelé, c'est le dessin qui a bougé : chaque surface porte désormais un
élément display, et un seul, celui qui nomme son sujet.

### Onze mille pixels d'accessibilité

axe-core, huit états : **16 violations sérieuses** au premier passage.

- `--txt-4` à `#4f5670` donnait **2,64:1** sur le plan structurel et
  **1,99:1** dans le bloc de preuve, sur 40 à 50 nœuds par écran ; `--txt-3`
  tombait à 3,43:1. Les deux registres sourds ont été relevés au-dessus de
  4,5:1 **sur tous les fonds du système**.
- `.cw-go` — le bouton le plus important du produit — se rendait en `#eaecf3`
  sur `#7b6bf2`, soit **3,4:1**. Cause : la règle avait été écrite sans son
  préfixe de portée et perdait en spécificité contre `.cw a { color: inherit }`.
- Trois régions à défilement sans contenu focalisable : inatteignables au
  clavier.
- La règle de l'année portait `role="img"` **et** douze liens.

Après correction : **0 violation sur les 8 états.**

### Conséquence assumée du contraste

Sur ce fond, l'AA n'admet pas quatre gris de texte franchement distincts —
ni deux encres sur l'accent (l'accent lui-même ne vaut que 4,83:1 contre une
encre quasi noire). L'écart entre registres n'est donc plus porté par la
valeur, mais par la **taille**, la **casse**, l'**approche** et la **famille**.
C'est une distinction plus solide qu'un écart de luminance : elle survit au
niveau de gris, ce que le triptyque en gris confirme.

### Le modèle étroit

Sous 900 px, une station à trois colonnes n'a que deux issues : tout empiler,
ou n'afficher qu'un volet à la fois. Le Day de A faisait 9 331 px, celui de C
11 720 px. V60.1 choisit le volet : la page garde sa hauteur de fenêtre, sa
ligne de système et sa ligne de faits ; un sélecteur **sans JavaScript** —
de vrais liens sur un paramètre d'URL — dit quel volet est monté. Le même
objet, à la même place, sur les trois surfaces.

À 375 px, l'action principale du Dashboard tombait sous la ligne de
flottaison — sur l'écran dont la fonction est justement de dire quoi faire.
Le display a été ramené à `clamp(24px, 6,6vw, 30px)` et la description du
livrable passe après l'action. Elle est maintenant visible aux cinq largeurs.

---

## 7. Ce qui reste faible — sans réinterprétation favorable

### 7.1 TrajectoryMap et YearRule se ressemblent trop

Sur le triptyque aveugle, le champ de trajectoire du Dashboard et la règle de
l'année du Calendrier se lisent au premier regard comme **le même objet** :
une bande de traits verticaux sur toute la largeur, mêmes quatre valeurs,
même légende, même position dans la page. Ils ne le sont pas — l'un module la
hauteur par la difficulté et ondule, l'autre est plat et gradué par mois — et
ils sont sur des écrans différents, donc aucune donnée n'est dite deux fois
sur un même écran. Mais **la parenté est plus forte que la distinction**.

C'est le point le plus discutable du prototype et la première question de
V61 : est-ce une signature (deux objets d'une même famille, comme une carte et
son échelle) ou une confusion (deux objets qu'on croit être le même) ?

### 7.2 Le tiers droit de l'en-tête du Day est vide

Sur les cinq journées testées, l'en-tête du Day laisse sa moitié droite vide
sous le titre. C'est défendable comme geste éditorial — la mesure ouverte à
droite d'un titre display est une pratique typographique, et c'est
précisément l'apport de la direction C. Mais c'est une surface vide, et elle
est comptée comme telle dans la note de composition. Aucune donnée réelle
non déjà affichée ailleurs n'a été trouvée pour l'occuper ; y mettre quelque
chose pour meubler aurait été un défaut plus grave.

### 7.3 La colonne de contexte du Day est la région la moins résolue

250 px, intitulés tronqués, étiquettes de famille à 10,5 px. Elle fonctionne
et elle est navigable, mais elle n'est pas au niveau de finition du reste.

### 7.4 La révision se lit mal en niveaux de gris sur la règle

Le jalon (pleine hauteur) et la position (pleine hauteur, blanc) survivent au
gris. La révision, codée par l'ambre et par un écart de hauteur de 62 % à
80 %, devient presque indiscernable. L'identité du produit ne dépend pas du
violet (condition 13 tenue), mais **cet encodage-là** dépend trop de la
couleur.

### 7.5 Les limites de défilement coupent en milieu de mot

Sur plusieurs captures, le bas d'un volet coupe un titre ou une ligne de
texte. C'est le prix de la page bornée, et c'est le bon prix — mais un
dégradé de fin de zone, ou une graduation de padding, l'atténuerait.

---

## 8. Ce qu'il manque exactement pour `REFERENCE_CANDIDATE`

Il manque **0,01 de moyenne**. Trois travaux, tous identifiés et tous
mesurables, la feraient passer sans toucher au barème :

1. **Distinguer franchement TrajectoryMap et YearRule** (critère 4, identité,
   4,40 → 4,6). Par exemple : donner à la règle une graduation explicite
   (traits de mois plus hauts, chiffres alignés dessous) et au champ un profil
   plus marqué, de sorte que l'un se lise comme un **instrument de mesure** et
   l'autre comme un **relief**.
2. **Résoudre la colonne de contexte du Day** (critère 9, premium, 4,20 →
   4,4) : élargir à ~290 px, remonter les intitulés à 13 px, aérer le rail.
3. **Traiter les deux vides identifiés** (critère 2, composition, 4,30 → 4,5)
   soit en les assumant explicitement par une composition qui les rend
   intentionnels, soit en resserrant la mesure du bloc d'en-tête.

Aucun de ces trois travaux n'est un ajout de contenu. Ce sont trois décisions
de dessin sur des surfaces déjà construites.

---

## 9. Les 25 points demandés

1. **La règle A/B/C a-t-elle été tenue ?** Oui, comme une règle d'attribution
   (§1). A donne le pilotage, B la page bornée, C l'échelle et le
   renversement de matière.
2. **Le produit ressemble-t-il à un collage A+B+C ?** Non. Aucun écran ne
   reprend la composition d'une direction. Ce qui est repris, ce sont trois
   *langages*, appliqués à des compositions neuves — voir `cmp-day-1440.png`,
   où le Day hybride ne ressemble à B que par le principe des deux colonnes.
3. **Combien de surfaces ?** Trois, et seulement trois.
4. **Une route produit a-t-elle été touchée ?** Aucune. Sonde gelée rejouée :
   36 routes identiques métrique par métrique.
5. **Le corpus a-t-il été touché ?** Non. SHA-1 `4c1f3028…` identique.
6. **`data/progress.json` ?** Non. Blob `323604021…` identique.
7. **De la progression a-t-elle été inventée ?** Non. Le prototype **déclare
   l'absence** : « progression non enregistrée · 0 journée ». Aucun
   remplissage, aucune barre de complétion, aucun pourcentage.
8. **Des compétences, preuves, projets ou métriques inventés ?** Aucun. Tout
   vient de `program.json`, du corpus annoté par `data-family`, et de
   `catalogue`. Les seuls calculs sont des agrégats (sommes, comptages,
   extrema) sur ces sources.
9. **Les actions sont-elles inertes ?** Oui. Aucun `POST`, aucun handler,
   aucune écriture disque. Les seuls liens qui sortent du spike pointent vers
   des routes produit en lecture.
10. **La mention obligatoire est-elle affichée ?** Oui, en tête de chaque
    écran : « Prototype de comparaison — aucune écriture de progression ».
    Masquée uniquement en mode aveugle, où elle révélerait l'origine.
11. **Un sixième motif a-t-il été ajouté ?** Non. Le gate V59 vérifie
    l'ensemble fermé à cinq et il est vert.
12. **Les six questions du Day sont-elles répondues au premier écran ?** Oui,
    vérifié au navigateur, 6/6 sur cinq journées, sans défiler, à 1440 × 900.
13. **Le modèle tient-il sur des journées très différentes ?** Oui. De la plus
    courte du corpus (4 734 caractères) à la plus longue (19 483), page
    toujours à 900 px.
14. **Le passage lire → faire est-il structurel ?** Oui : fond, arête
    d'accent, mesure de lecture, densité — et il survit au niveau de gris.
15. **Le Dashboard dit-il quoi faire ?** Oui, et l'action est au-dessus de la
    ligne de flottaison aux cinq largeurs, y compris 375 px.
16. **Le Calendrier aide-t-il à se situer ?** Oui, à trois granularités
    distinctes — la journée (règle), la semaine (grille), le mois (panneau) —
    et aucune donnée n'est portée par deux registres.
17. **Les mois courts restent-ils courts ?** Oui. Segments proportionnels
    dans la règle, lignes non complétées dans la grille.
18. **Le responsive tient-il ?** 15/15 états bornés, 0 débordement, aux cinq
    largeurs demandées.
19. **Le modèle mobile du Day est-il une pile de 6 000 px ?** Non : 812 px,
    hauteur de fenêtre exacte, un volet à la fois, sélecteur sans JavaScript.
20. **L'accessibilité ?** axe-core : 0 violation sur 8 états. Un seul `h1` par
    écran, plan de titres correct, focus visible sur tous les éléments
    focalisables, régions à défilement atteignables au clavier, `role="img"`
    tous étiquetés, `prefers-reduced-motion` respecté, contraste AA vérifié
    par calcul sur chaque couple encre/fond du système. **Aucun test avec un
    lecteur d'écran réel n'a été fait** — ni NVDA, ni VoiceOver, ni JAWS. Ce
    qui est affirmé ici est ce qui a été mesuré par outil et au clavier.
21. **Le test d'identité aveugle ?** Les trois écrans, sans logo, sans barre
    latérale, sans le nom du produit, côte à côte à 1440 :
    `blind-trio-1440.png`. Ils appartiennent au même produit, et ce qui le dit
    est nommable — coquille, échelle, grammaire de zones, jeu de valeurs.
22. **L'identité dépend-elle du violet ?** Non : `blind-trio-gris-1440.png`.
    Réserve honnête au §7.4 sur l'encodage de la révision.
23. **La comparaison avec V60 ?** `cmp-dashboard-1440.png`,
    `cmp-day-1440.png`, `cmp-calendar-1440.png`. Sur le Day, l'écart le plus
    net : B compose son titre à 21 px dans une bande de métadonnées, l'hybride
    à 50,4 px ; B sépare lire/faire par un filet entre deux fonds quasi
    identiques, l'hybride par un changement de matière ; B n'a pas de bloc de
    preuve.
24. **Le verdict ?** `STRONG_IMPROVEMENT`. 18/18 conditions bloquantes,
    4 seuils sur 5, moyenne 4,49 contre 4,50 exigés.
25. **Est-ce la direction à transformer en produit réel à partir de V61 ?**
    **Oui — mais pas telle quelle, et le rapport ne prétend pas qu'elle est
    prête.** Ce qui justifie le oui : les quatre grandeurs gelées sont dans
    la cible ; les dix-huit conditions bloquantes tiennent ; le modèle Day
    tient sur les extrêmes réels du corpus ; l'identité survit à l'aveugle et
    au gris ; et l'accessibilité est propre à l'outil sur les huit états
    testés. Ce qui interdit un oui sans réserve : les trois travaux du §8, et
    surtout l'ambiguïté TrajectoryMap / YearRule, qui touche au cœur même de
    la question d'identité et doit être tranchée **avant** toute migration.

---

## 10. Ce que ce sprint n'a pas prouvé

- Il n'a pas prouvé que le modèle tient sur les 36 routes. Il tient sur
  **trois**. Les 33 autres n'ont pas de composition dans ce langage.
- Il n'a pas prouvé que le modèle tient sur un corpus qui changerait. Le
  Curriculum 1.0 est gelé ; le Day a été taillé pour ses formes réelles.
- Il n'a pas été testé avec un lecteur d'écran, ni par un utilisateur, ni sur
  un appareil physique. Tout ce qui est affirmé ici l'a été mesuré dans un
  Chromium sans tête.
- La note de §4 est la mienne. Elle est argumentée critère par critère et
  adossée à des mesures, mais dix nombres sur cinq restent un jugement. Les
  dix-huit conditions bloquantes, elles, sont vérifiables sans moi.

---

## 11. Leçon de méthode, reconduite de V59 et V60

> Les métriques gelées prouvent que rien n'a cassé parmi ce qu'elles
> couvrent. Elles ne prouvent jamais qu'un écran est bon.

En V60.1, les gates étaient verts et les tests passaient pendant que la ligne
de système rendait 1 440 × 1 px, que le livrable s'affichait deux fois, que le
bouton principal était à 3,4:1 et que 103 étiquettes vides remplissaient la
grille du Calendrier. **Tous ces défauts ont été trouvés en regardant des
captures ou en mesurant explicitement dans le navigateur** — aucun par la
chaîne de validation.

Et l'inverse est vrai aussi : trois de mes propres sondes ont produit des
diagnostics faux en V59, corrigés par les captures. Ni l'œil seul ni l'outil
seul ne suffit. Ce sprint a fonctionné parce que chaque défaut a été
**mesuré après avoir été vu**, et corrigé avec le nombre inscrit dans le code.

---

## 12. Captures

`docs/design/v60-1/` — 32 fichiers.

| Fichier | Contenu |
|---|---|
| `dashboard-{375,768,1024,1440,1920}.png` | Dashboard, 5 largeurs |
| `day-{375,768,1024,1440,1920}.png` | Day, 5 largeurs |
| `calendar-{375,768,1024,1440,1920}.png` | Calendar, 5 largeurs |
| `day-{181,80,89,45,326}-1440.png` | les cinq journées de test |
| `day-mobile-{faire,plan}-375.png` | les volets du modèle étroit |
| `calendar-mobile-mois-375.png` | le volet mois en écran étroit |
| `calendar-m12-1440.png` | sélection d'un autre mois |
| `blind-{dashboard,day,calendar}-1440.png` | mode aveugle, écran par écran |
| `blind-trio-1440.png` | **le test d'identité** |
| `blind-trio-gris-1440.png` | **le test en niveaux de gris** |
| `cmp-{dashboard,day,calendar}-1440.png` | comparaison avec V60 |

---

*Prototype de comparaison. Aucune écriture de progression. Aucune route
produit modifiée. Aucune migration.*
