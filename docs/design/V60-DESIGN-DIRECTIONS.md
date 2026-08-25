# V60 — TROIS DIRECTIONS DE DESIGN
## Prototypes de comparaison. Aucune migration.

Contrat : `docs/V60-DESIGN-SPIKE-BRIEF.md`.
Prototypes : `app/design-spike/v60/{a,b,c}/{dashboard,day,calendar}`.
Captures : `docs/design/v60/direction-{a,b,c}/` — 9 écrans × 3 largeurs = **27**.

Les trois directions consomment **les mêmes données réelles** : 365 journées,
12 mois, 52 semaines, 20 compétences, 1 643 heures, et la journée 80 du corpus
lue intégralement. Aucune donnée n'est inventée.

---

## Ce que les données réelles ne contiennent pas

Vérifié avant d'écrire une ligne de prototype :

```
data/progress.json          → 0 journée enregistrée · 0 compétence notée · startDate null
data/progress.example.json  → également vide
```

**Il n'existe aucune donnée de progression dans ce produit.** Le brief interdit
d'en fabriquer. Les trois prototypes ne dessinent donc **aucun remplissage de
progression** : ils composent l'année à partir de ce qui est réellement là —
difficulté, charge horaire, compétence, semaine de révision, jalon de projet,
thème du mois — et déclarent l'absence là où elle compte
(« progression non enregistrée — 0 journée »).

C'est une contrainte subie, et c'est aussi un test plus dur : **une direction
qui n'est lisible qu'une fois coloriée par la progression n'a pas de
composition propre.** Les trois ont dû tenir sans.

---

# A — MISSION CONTROL

## Philosophie

Le produit est un instrument de navigation vers une cible professionnelle. La
page n'est pas une collection de contenus : c'est un **tableau de bord de
conduite**, lu de haut en bas comme un cockpit — état, opération, registres.

## Architecture

**Dashboard.** Trois bandes pleine largeur d'amplitude **délibérément
inégale** : une bande d'état de 40 px en monospace bord à bord ; un bloc
opératoire de **58 vh** coupé en deux (la mission courante à gauche, l'horizon
à droite) ; puis trois registres serrés séparés par des filets. Le rythme
vertical est 1 : 14 : 4 — l'inverse d'une pile régulière.

**L'horizon** est `PositionRing` **ouvert et porté à l'échelle d'un
demi-écran** : un arc de 365 traits, chacun long en proportion de la difficulté
réelle du jour, les jalons de projet plus profonds, les semaines de révision
teintées, la position marquée d'un trait clair. Ce n'est ni un anneau de
progression, ni une grille de petits carrés.

**Day.** Un **plan de vol** horizontal en tête : les six temps de la journée en
segments, celui en cours portant un liseré d'accent et son propre fond. Sous
lui, une gouttière verticale collante répète l'étape courante **par la
position**, et le contenu défile en sections ouvertes séparées par des filets
pleine largeur. Ni six cartes empilées, ni un article avec sommaire.

**Calendar.** L'année en **un seul ruban**, pas douze cartes. Chaque mois est un
secteur dont la **largeur est proportionnelle à son nombre réel de journées** —
M12 (36 j) est visiblement plus large que M1 (28 j) — subdivisé en colonnes
d'un jour dont la hauteur porte la difficulté. Dessous, un registre tabulaire
dense de douze lignes.

## Points forts

- Le rythme vertical est réellement irrégulier : bande fine, bloc énorme,
  registres serrés. C'est le seul des trois à traiter la **hauteur** comme une
  variable de composition.
- L'action principale est incontestable : un seul bouton plein, à 58 vh du
  haut, dans le bloc dominant.
- Zéro carte sur les trois écrans. Les zones sont découpées par des filets d'un
  pixel et des fonds de bande.
- Le ruban de calendrier est **honnête par construction** : un mois court est
  un secteur court, sans intervention.

## Points faibles

- L'arc est beau mais **coûteux à lire finement** : à 365 traits sur un demi-
  cercle, on voit une forme, pas un jour. Il informe sur la texture de l'année,
  pas sur « où exactement ».
- Le vocabulaire militaire/spatial (« mission », « secteur », « engager »)
  est un pari : il porte l'identité, et il peut aussi rebuter un apprenant en
  reconversion. **C'est le point le plus discutable de la direction.**
- La bande d'état déborde horizontalement sous 900 px et devient une zone à
  défilement — fonctionnel, mais moins net que le reste.

## Score

| Critère | /5 |
|---|:--:|
| sophistication | 4,3 |
| profondeur | 4,0 |
| hiérarchie | **4,7** |
| composition | **4,6** |
| utilisation de l'espace | 4,4 |
| identité | **4,5** |
| typographie | 4,2 |
| cohérence | 4,4 |
| impression premium | 4,2 |
| originalité | **4,5** |
| **moyenne** | **4,38** |

**Avantage principal** — la seule des trois qui compose avec la hauteur.
**Défaut principal** — l'arc est une signature forte mais un instrument faible.
**Risque d'intégration** — le vocabulaire, plus que le code.
**Dette technique** — faible : bandes en flux, arc en SVG pur, aucune mesure JS.
**S'étend facilement à** — `/parcours`, `/synthese`, `/pipelines`, `/security`,
`/cloud-lab`, `/kubernetes` : toutes les surfaces « état + opération ».
**S'étend difficilement à** — `/career`, `/resources`, `/guide`, `/doc` : la
lecture longue ne supporte pas les bandes bord à bord, et `/glossary`.

---

# B — LEARNING WORKSTATION

## Philosophie

Le produit est le **poste de travail** de l'apprenant, pas un tableau de bord
qu'on consulte. La fenêtre entière est l'application ; la page ne défile pas,
ce sont les volets qui défilent.

## Architecture

**Dashboard.** Barre d'onglets en tête, barre d'état en pied, et entre les deux
trois volets **accolés** — contexte 250 px / travail 1 fr / preuve 330 px —
séparés par un filet d'un pixel, **sans gouttière, sans rayon, sans ombre**.
C'est ce qui rend l'absence de carte structurelle et non décorative : il n'y a
littéralement pas de boîte qui flotte.

Au-dessus de la barre d'état, une **règle d'année** pleine largeur :
`YearBand` transformé en règle d'atelier, 365 graduations dont la hauteur porte
la difficulté.

**Day — l'écran phare.** Une règle unique, tenue partout :
**LECTURE À GAUCHE, ACTION À DROITE**, séparées par un filet plein du haut au
bas du volet. Le partage n'est pas arbitraire : il suit `data-family`, la
taxonomie que le corpus porte déjà. 8 sections de lecture, 7 sections d'action,
comptées et affichées. Les deux colonnes défilent indépendamment. Le rail de
gauche n'est pas un sommaire : c'est le plan de travail, et il **surligne en
accent les sections d'action**.

**Calendar.** Un planning tabulaire : 12 lignes de mois × 5 colonnes de
semaines, chaque cellule portant le thème réel et un profil de difficulté en
barres. Les mois à 4 semaines laissent leur cinquième cellule **vide et
estompée** plutôt que remplie.

## Points forts

- **La meilleure réponse à « qu'est-ce que j'apprends / que dois-je faire /
  comment le prouver »** : les trois sont visibles simultanément, sans défiler.
- La densité est la plus élevée des trois sans être illisible.
- Le Calendar est le plus **utilisable** : on lit 52 thèmes de semaine d'un
  coup d'œil.
- Le partage lecture/action est **dérivé du corpus**, pas décrété.

## Points faibles

- **La fenêtre à hauteur fixe est un engagement lourd.** `height: 100vh` avec
  volets à défilement propre casse le comportement de défilement natif, la
  restauration de position, l'impression, et complique le clavier.
- À moins de 1100 px, le volet de preuve **disparaît** : un tiers de la
  proposition de valeur est réservé aux grands écrans.
- Le mobile est le plus dégradé des trois : les volets s'empilent et le poste
  de travail redevient une page ordinaire.
- Esthétiquement, c'est la direction **la plus proche d'un outil existant** —
  la parenté avec un IDE est assumée, mais elle est aussi le risque de
  déjà-vu.

## Score

| Critère | /5 |
|---|:--:|
| sophistication | 4,4 |
| profondeur | 4,2 |
| hiérarchie | 4,3 |
| composition | **4,7** |
| utilisation de l'espace | **4,8** |
| identité | 4,2 |
| typographie | 3,9 |
| cohérence | **4,8** |
| impression premium | 4,1 |
| originalité | 4,0 |
| **moyenne** | **4,34** |

**Avantage principal** — le meilleur écran Day des trois, de loin.
**Défaut principal** — le prix technique et responsive du poste à hauteur fixe.
**Risque d'intégration** — élevé : impose une coquille applicative nouvelle.
**Dette technique** — la plus lourde : gestion du défilement par volet, états
de repli à trois paliers, restauration de position, impression.
**S'étend facilement à** — `/day`, `/lab`, `/missions`, `/pipelines`,
`/security`, `/kubernetes`, `/capstones/[id]` : tout ce qui est « travailler ».
**S'étend difficilement à** — `/`, `/synthese`, `/parcours` (le pilotage n'a pas
besoin de trois volets), et toute la famille éditoriale.

---

# C — CAREER INTELLIGENCE

## Philosophie

Le produit est un **manuel premium de montée en compétences**. Le contenu vit
sur le canvas, pas dans des boîtes. La hiérarchie est portée par l'échelle
typographique et le blanc, pas par des contours.

## Architecture

**Dashboard.** Une accroche qui **énonce la position en toutes lettres**
(« Douze mois pour devenir ingénieur IA. Vous entrez au jour 1. »), jusqu'à
72 px — contre 28-34 px dans le produit actuel. Des chiffres traités comme des
figures de magazine sur un filet capillaire. L'action principale est un lien
souligné à grande échelle, **pas un bouton dans une carte**.

**La portée de l'année** — `TrajectoryMap` redessiné : 365 traits groupés en 12
colonnes mensuelles, hauteur = difficulté réelle, jalons de projet en accent,
révisions teintées. Une signature qui tient sur une seule ligne d'écran.

**Day.** La rupture ne se fait pas par une carte mais par **renversement de
fond pleine largeur**, et c'est l'idée la plus forte des trois directions :

| geste | encre |
|---|---|
| **lire** | fond sombre du papier |
| **travailler** | fond indigo franc, deux filets d'accent |
| **prouver** | **fond CLAIR, encre sombre** — on change de support |

Trois encres pour trois gestes. Le mode vient de `data-family` (`practice`,
`observe` → travail ; `apply`, `verify`, `prepare` → preuve), et les sections
consécutives de même mode sont **regroupées** : une rupture par bloc, pas une
par section, sinon le renversement devient un clignotement.

**Calendar.** Douze **colonnes de densité** sur une ligne de sol commune. La
hauteur est le nombre réel de journées : M3, M6, M9 (35 j) et M12 (36 j)
dominent visiblement les mois à 28 j. Un mois court **reste court**.

## Points forts

- **La plus forte amplitude typographique** et la seule qui ose une accroche
  éditoriale — sans tomber dans la landing page.
- Le renversement clair pour « produire une preuve » est **la meilleure idée du
  spike, toutes directions confondues** : il dit sans mot que le geste change.
- Le Calendar est le plus honnête visuellement : l'inégalité des mois est le
  sujet, pas un défaut à masquer.
- La direction la moins dépendante des boîtes : presque tout est sur le canvas.

## Points faibles

- **Le Dashboard laisse un tiers droit vide** au premier écran. C'est
  éditorialement défendable, mais c'est de l'espace non travaillé.
- La densité d'information est la plus faible des trois. Pour un produit qu'on
  ouvre tous les jours pendant un an, **le calme peut devenir de la lenteur.**
- Le Day est **le plus long** : 12 310 px de défilement contre une page à deux
  volets chez B. La première rupture n'arrive qu'à 5 691 px, donc **jamais dans
  le premier écran** — mesuré, pas estimé.
- Le fond clair impose de maintenir **deux jeux de contraste** : dette réelle.

## Score

| Critère | /5 |
|---|:--:|
| sophistication | **4,6** |
| profondeur | 3,9 |
| hiérarchie | 4,5 |
| composition | 4,3 |
| utilisation de l'espace | 3,8 |
| identité | 4,4 |
| typographie | **4,9** |
| cohérence | 4,3 |
| impression premium | **4,8** |
| originalité | **4,6** |
| **moyenne** | **4,41** |

**Avantage principal** — le renversement de fond comme grammaire de geste.
**Défaut principal** — densité faible et défilement long sur le Day.
**Risque d'intégration** — moyen : c'est surtout une échelle typographique et
des sections pleine largeur, pas une nouvelle coquille.
**Dette technique** — le double jeu de contraste clair/sombre.
**S'étend facilement à** — `/career`, `/resources`, `/guide`, `/doc`,
`/glossary`, `/parcours`, `/synthese`, `/month`, `/week`.
**S'étend difficilement à** — `/lab`, `/pipelines`, `/security`, `/kubernetes`,
`/cloud-lab` : les surfaces d'outil ont besoin de densité, pas de calme.

---

# Comparaison

| Critère | A · Mission Control | B · Learning Workstation | C · Career Intelligence |
|---|:--:|:--:|:--:|
| sophistication | 4,3 | 4,4 | **4,6** |
| profondeur | 4,0 | 4,2 | 3,9 |
| hiérarchie | **4,7** | 4,3 | 4,5 |
| composition | 4,6 | **4,7** | 4,3 |
| utilisation de l'espace | 4,4 | **4,8** | 3,8 |
| identité | **4,5** | 4,2 | 4,4 |
| typographie | 4,2 | 3,9 | **4,9** |
| cohérence | 4,4 | **4,8** | 4,3 |
| impression premium | 4,2 | 4,1 | **4,8** |
| originalité | 4,5 | 4,0 | **4,6** |
| **moyenne** | 4,38 | 4,34 | **4,41** |

Les trois moyennes tiennent en **sept centièmes**. **Le classement par moyenne
n'est pas une décision** : les trois sont bonnes à des choses différentes, et
c'est le résultat utile de ce spike.

| Question | A | B | C |
|---|:--:|:--:|:--:|
| carte comme primitive par défaut ? | non | non | non |
| rythme vertical variable ? | **oui** | non (grille fixe) | oui |
| variation de largeur des blocs ? | oui | **oui** | oui |
| trajectoire au premier écran ? | **oui** | **oui** | non (sous la ligne) |
| lecture / action distinguées ? | partiel | **oui** | **oui** |
| mois court représenté honnêtement ? | **oui** | **oui** | **oui** |
| survit en niveaux de gris ? | **oui** | **oui** | **oui** |
| mobile ≥ acceptable | **oui** | dégradé | **oui** |

# Test de différence à l'aveugle (§15)

Les prototypes n'ont **ni logo, ni barre latérale, ni nom de produit** : la
coquille du spike est nue par construction. Il ne reste donc à masquer que le
bandeau de prototype, et **le vrai test qui subsiste est la couleur** — d'où
neuf captures en niveaux de gris, `docs/design/v60/` et scratchpad de session.

**« Dashboard, Day et Calendar semblent-ils appartenir au même produit ? »**

| | réponse | ce qui fait le lien |
|---|:--:|---|
| **A** | **oui** | la bande d'état mono bord à bord, les filets d'un pixel, l'absence totale de carte, les eyebrows numérotés |
| **B** | **oui** | la barre d'onglets, la barre d'état, les volets accolés, les en-têtes de volet en petites capitales |
| **C** | **oui** | l'échelle display, les filets capillaires, les chiffres-figures, le contenu à même le canvas |

**« Cette direction pourrait-elle être vendue telle quelle à un autre SaaS en
changeant seulement logo + couleur ? »**

| | réponse | pourquoi |
|---|:--:|---|
| **A** | **NON** | l'arc de 365 traits pondérés par la difficulté et le ruban à largeur proportionnelle n'ont de sens que pour un curriculum de 365 jours. Sur un CRM, ils ne veulent rien dire. |
| **B** | **NON, mais moins nettement** | la coquille à volets est transposable telle quelle à beaucoup d'outils. Ce qui ne l'est pas : le partage lecture/action dérivé d'une taxonomie pédagogique, et la règle d'année. **C'est la direction la plus revendable des trois.** |
| **C** | **NON** | le renversement de fond lire → travailler → prouver n'a de sens que dans un produit où l'on produit des preuves. Les colonnes de densité mensuelle non plus. |

Aucune fuite de nom de produit détectée sur les neuf captures (contrôle
automatique).

---

# RECOMMANDATION CLAUDE

## Meilleure base produit : **C — Career Intelligence**

Et je donne la raison avant le classement, parce que la moyenne ne la porte
pas : **C est la seule direction dont l'identité tient dans une grammaire, pas
dans une coquille.**

- A tient dans une **coquille** (bandes bord à bord). Hors du pilotage, elle ne
  se propage pas : `/career` ou `/doc` en bandes seraient illisibles.
- B tient dans une **coquille** encore plus contraignante (`100vh`, trois
  volets). Sur les 36 routes, une bonne moitié n'a pas trois volets à remplir.
- C tient dans **trois règles transposables** — échelle typographique large,
  contenu sur le canvas, renversement de fond pour marquer un changement de
  geste. Ces trois règles s'appliquent à un tableau de bord, à un document, à
  un calendrier et à un catalogue **sans changer d'architecture**.

Le rapport V59 disait que le problème est la propagation : 26 routes sur 36 sans
motif, 19 sur 36 enfermées dans des cartes. Une direction dont la grammaire se
propage vaut mieux qu'une direction plus spectaculaire sur trois écrans.

## Meilleur de chaque écran, séparément

| Écran | Gagnant | Pourquoi |
|---|---|---|
| **Dashboard** | **A** | le seul à composer avec la hauteur ; action incontestable ; trajectoire au premier écran. C laisse un tiers vide et pousse sa portée sous la ligne de flottaison. |
| **Day** | **B** | lecture et action simultanément visibles, partage dérivé du corpus, plan de travail qui n'est pas un sommaire. Écart net sur les deux autres. |
| **Calendar** | **B** pour l'usage, **C** pour l'identité | B fait lire 52 thèmes de semaine d'un coup ; C fait *comprendre* la forme de l'année en une seconde. Choix entre consulter et saisir. |

## Une hybridation est-elle pertinente ?

**Oui, mais seulement une, et précisément délimitée.**

Prendre **C comme socle** et lui greffer **exactement deux choses de B** :

1. **Le partage lecture / action du Day** — appliqué non pas en deux volets à
   défilement indépendant (la dette de B), mais **en deux colonnes de page
   normales** sous la barre de contexte, en gardant les renversements de fond
   de C pour les blocs de preuve. On prend la *règle* de B, pas sa *mécanique*.
2. **Le tableau de planning du Calendar** — en second écran de `/calendar`,
   sous les colonnes de densité de C. La forme d'abord, la consultation
   ensuite.

Et de **A**, une seule chose : **l'idée de largeur proportionnelle** (un mois
court est un secteur court), que C applique déjà en hauteur. Cohérent.

## Risques de Frankenstein visuel

Réels, et il faut les nommer :

- **Prendre la coquille de B *et* l'échelle de C produirait un monstre** : la
  typographie de C a besoin de marges que les volets de B n'accordent pas. Ne
  jamais mélanger *coquille de B* et *typographie de C*.
- **Prendre les bandes bord à bord de A dans une page éditoriale de C** casse
  la colonne de lecture. Les bandes de A supposent qu'aucun texte long ne les
  traverse.
- **Trois grammaires de trajectoire coexistantes** (arc de A, règle de B,
  portée de C) seraient exactement le défaut que V59 a corrigé en retirant
  `PositionRing` de `/` et `/parcours` : deux représentations du même intervalle
  sur une même page. **Une seule doit survivre par surface.**
- Le vocabulaire de A (« mission », « secteur », « engager ») ne se greffe pas
  sur le ton de C. C'est du texte, pas du style : le mélanger produirait une
  incohérence de voix, plus visible qu'une incohérence de couleur.

## Si l'on ne devait retenir qu'un seul élément du spike

Le **renversement de fond clair pour « produire une preuve »** (C, Day). C'est
le seul moment des neuf écrans où l'interface change de nature au lieu de
changer d'apparence, et c'est exactement ce que le produit a à dire.

---

# Réponse à la question centrale de V60

> « Si je retire le logo, le nom AI Career OS et sa couleur indigo, est-ce que
> cette interface possède suffisamment de composition, de comportement et de
> langage visuel pour être reconnue comme un produit spécifique ? »

**OUI — pour les trois directions**, vérifié en niveaux de gris sur les neuf
écrans. Chacune reste reconnaissable et cohérente sans marque et sans couleur.

**V60 est donc réussi au sens de son propre critère** : il fallait qu'au moins
une direction permette de répondre clairement oui ; les trois le permettent.

Avec la réserve honnête déjà écrite plus haut : **B est la moins spécifique des
trois.** Sa coquille à volets est transposable à beaucoup d'outils ; seuls son
partage lecture/action et sa règle d'année ne le sont pas.

---

# Limites de ce spike

- **Aucune donnée de progression n'existe** : les neuf écrans sont donc jugés
  sur un état à zéro. Une direction pourrait mieux ou moins bien vieillir une
  fois l'année remplie de statuts — ce spike ne peut pas le dire.
- **Trois écrans sur trente-six.** Rien ne garantit qu'une grammaire tenant sur
  ce trio tienne sur `/glossary`, `/diagnostics` ou `/settings`. Les colonnes
  « s'étend facilement / difficilement » ci-dessus sont des **jugements
  argumentés, pas des mesures**.
- **Les interactions sont inertes.** Aucun état de survol, de sélection, de
  chargement ou d'erreur n'a été prototypé. Une direction peut s'effondrer sur
  ses états, et c'est exactement ce qu'un spike de composition ne teste pas.
- **Aucune mesure de performance ni d'accessibilité** n'a été faite sur les
  prototypes : ce ne sont pas des routes produit et le brief demande de juger
  le rendu, pas la conformité.
- **Les scores sont les miens et ils sont serrés** — sept centièmes entre la
  première et la troisième. Ils décrivent, ils ne décident pas.

---

# Aucune migration

`/`, `/day/[id]`, `/calendar` et les 33 autres routes sont **inchangées**.
Vérifié en rejouant la sonde gelée V56/V57 sur les 36 routes et en la
comparant à `docs/audits/v59/cp15-after.json` : **zéro écart** sur `overflow`,
`clipped`, `topBlocks`, `dominance`, `surfaces`, `shadows`, `maxFont`,
`bodyPx`, `typeRange`, `fontSteps`, `cards`, `canvasShare`, `h1` et la liste
des motifs.

La décision — **A · B · C · HYBRIDE · AUCUNE** — appartient à l'utilisateur.
