# V62 — PRODUCT MIGRATION II · UX CLOSURE · Rapport final

Toutes les valeurs sont mesurées au navigateur sur le build de production ou
lues dans le dépôt. Aucune n'est estimée. Les manques sont écrits comme tels.

---

## 1 à 10 — État du dépôt et invariants

| # | | |
|---|---|---|
| 1 | HEAD au départ | `288bf2d3ff02f177ae160683777c0edf3d30287d` |
| 2 | HEAD final | voir le commit de clôture de ce sprint |
| 3 | branche | `claude/ai-career-os-saas-phfg49` |
| 4 | local == origin | oui (après le push de clôture) |
| 5 | working tree | propre |
| 6 | stash | vide |
| 7 | serveurs résiduels | aucun (vérifié en fin de sprint) |
| 8 | SHA du corpus | `a2099b51db9d75a6db74f5547c5a60681ff69bac9f7be14fdf3c4684ae7a2edf` — **identique** à l'entrée |
| 9 | hash `progress.json` | `73c1ee39a255c87972f4f42b36873b1081081d6f278bd767089c0cef1fc6e7a6` — **identique** avant et après 37 visites |
| 10 | 365 jours | **365**, ordre inchangé |

## 11 à 15 — Chaîne technique

| # | | |
|---|---|---|
| 11 | tests | **1 285 / 1 285**, cinq exécutions consécutives en fin de sprint |
| 12 | `tsc --noEmit` | vert |
| 13 | `build` | vert · `.next/static` = 2,6 Mo |
| 14 | gates | **41 / 41** (40 hérités + `v62:check`) |
| 15 | axe-core | **0 critical, 0 serious sur 324 états** |

**Réserve sur les tests, maintenue.** La toute première exécution de la session
(CP0) a donné `1284 / 1 fail`. Le nom du test n'a pas été capturé avant que la
sortie ne défile. Neuf exécutions au total dans ce sprint, **une seule en
échec, la première**. Je ne dis donc pas « suite stable » : je dis 1 échec sur
9, non reproduit, cause non identifiée.

## 16 — Responsive

**36 routes × 9 largeurs (375, 480, 640, 768, 1024, 1200, 1440, 1600, 1920) =
324 états.**

| | |
|---|--:|
| débordement horizontal | **0** |
| texte rogné | **0** |
| `h1` ≠ 1 | **0** |
| ratios typographiques distincts | **un seul : 3,3** |

`/doc/[...slug]` était la seule route à 2,24 ; elle est rentrée dans le rang.

## 17 — BEFORE → AFTER

| grandeur | BEFORE | AFTER | |
|---|--:|--:|:--:|
| routes learner-facing en classe **A** | 22 | **35 / 35** | ✅ |
| classe **B** | 12 | **0** | ✅ |
| classe **C** | 1 | **0** | ✅ |
| routes portant `ContextLine` | 15 | **31 / 36** | ✅ (cible ≥ 28) |
| `/lessons` @375 | 18 762 px | **3 295 px** | ✅ (cible ≤ 6 000) |
| `/missions` @375 | 13 776 px | **2 328 px** | ✅ (cible ≤ 7 000) |
| `/day/80` @375 | 13 425 px | **13 613 px** | ❌ (cible ≤ 7 000) |
| `/lab` nœuds | 6 438 | **367** | ✅ (cible ≤ 2 000) |
| `/lab` nœuds en `<details>` fermé | 5 264 | **217** | ❌ de justesse (cible ≤ 200) |
| `/lab` HTML | 867 Ko | **366 Ko** | ❌ de justesse (cible ≤ 350) |
| `/lab` @375 | 9 637 px | **3 709 px** | ✅ |
| `/glossary` HTML | 1 073 Ko | **445 Ko** | ❌ (cible ≤ 400) |
| signature de carte la plus répétée | 12 | **4** | ✅ (cible ≤ 6) |
| pages > 5 000 px @375 | 13 | **10** | ❌ (cible ≤ 8) |
| traitements de l'action primaire | 2 | **2** | ❌ (cible 1) — volontaire, cf. §26 |
| axe critical / serious | 0 / 0 | **0 / 0** | ✅ |

### Performance (1440, build de production)

| route | navigation | nœuds | HTML |
|---|--:|--:|--:|
| `/` | 152 ms | 1 707 | 202 Ko |
| `/day/80` | 159 ms | 1 399 | 175 Ko |
| `/lab` | 211 ms | **1 000** (était 7 073) | 366 Ko |
| `/calendar` | 188 ms | 2 199 | 371 Ko |
| `/missions` | 108 ms | 1 352 | 155 Ko |

## 18 — Routes modifiées (23)

`/lessons`, `/missions`, `/lab`, `/glossary`, `/doc/[...slug]`, `/career`,
`/guide`, `/resources`, `/security`, `/cloud-foundations`, `/cloud-lab`,
`/kubernetes`, `/pipelines`, `/security/[id]`, `/cloud-foundations/[id]`,
`/cloud-lab/[id]`, `/kubernetes/[id]`, `/pipelines/[id]`, `/lab/[exerciseId]`,
`/capstones/[id]`, `/missions/[id]`, `/day/[id]`, `/notes` (indirectement, via
la classe d'action).

## 19 — Routes RÉELLEMENT recomposées (7)

Structure, navigation ou architecture de rendu changées :

- **`/lessons`** — recherche, filtre de niveau, index collant, catégories
  dépliables. 128 leçons toutes conservées.
- **`/missions`** — catégories dépliables ; 42 missions conservées.
- **`/lab`** — rendu conditionnel des lignes ; index de 32 en-têtes.
- **`/glossary`** — index léger côté client, fiche complète à la demande via
  `/api/glossary/[id]` ; 711 termes conservés.
- **`/doc/[...slug]`** — `h1` réel et visible, ligne de contexte, suite,
  largeur d'en-tête.
- **les 5 catalogues techniques** — grille de cartes → lignes.
- **`/day/[id]`** — le déroulé reste visible pendant la lecture en écran étroit.

## 20 — Routes simplement ajustées (16)

Ajout de la ligne de contexte et/ou d'une suite, sans changement de structure :
les 5 laboratoires techniques (via `TechBench`), les 5 postes de travail
techniques (via `WorkbenchShell`), `/career`, `/guide`, `/resources`,
`/glossary`, plus deux corrections de classe d'action.

## 21 — Contexte A/B/C

| | avant | après |
|---|--:|--:|
| A | 22 | **35** |
| B | 12 | **0** |
| C | 1 | **0** |

## 22 — Action primaire et suite

Avant : 13 routes learner-facing sans aucune action proéminente.
Après : **0**. Chaque action mène à une route réelle et dérive du contenu —
le premier scénario du catalogue, la leçon de la compétence du jour, la
pratique associée d'une leçon, le document suivant d'une séquence.
Aucun bouton n'a été ajouté pour satisfaire une sonde : là où une page n'a pas
de suite légitime (catalogue vide), aucune action n'est rendue.

## 23 — `/lessons`

18 762 → 3 295 px @375 ; 9 627 → 2 136 @1440 ; 239 → 143 Ko ; dominance
0,90 → 0,60. **Les 128 leçons sont toutes rendues** — vérifié par comptage.

## 24 — `/missions`

13 776 → 2 328 px @375 ; dominance 0,431 → 0,296. **42 missions conservées.**

## 25 — `/lab` : DOM et HTML

| | avant | après |
|---|--:|--:|
| nœuds dans `main` | 6 438 | **367** |
| dont dans un `<details>` fermé | 5 264 | **217** |
| HTML | 867 Ko | **366 Ko** |
| hauteur @375 | 9 637 px | **3 709 px** |

**Stratégie de rendu :** les lignes d'exercice ne sont rendues que pour les
groupes réellement ouverts, et plus aucun groupe ne s'ouvre automatiquement.
Ce n'est **pas** du `display:none` — les nœuds n'existent pas. Ce n'est pas de
la virtualisation : la mesure ne la justifiait pas.

**Effets fonctionnels :** les 376 exercices restent filtrables et atteignables ;
les 32 en-têtes de groupe (nom, progression, compte) restent tous rendus et
forment l'index ; un filtre ouvre tout.
**Compromis assumé :** il faut un clic de plus pour voir la première liste. En
échange, la page passe de 9 637 à 3 709 px sur mobile et le catalogue devient
scannable d'un coup d'œil. L'action « prochain exercice » en tête reste le
chemin direct.

**`/glossary`** — 1 073 → 445 Ko. Même nature de correction : l'index (108 Ko)
part au client, la fiche complète est chargée à la demande. Vérifié au
navigateur : 711 lignes listées, fiche chargée au clic, recherche
« kubernetes » → 52 résultats.

## 26 — Motifs

Ensemble **fermé à cinq**, vérifié par gate : `pos-ring`, `tmap`, `phase-rail`,
`evi-mark`, `year-band`. **Aucun sixième motif n'a été créé.**

21 routes sur 36 n'en portent aucun. Ce n'est pas un défaut : un motif qui
n'apporte pas de sens serait un ornement. Les familles « apprendre » et
« technique » n'ont pas de question de position ou de trajectoire à poser ;
elles portent la ligne de contexte, qui est le vrai marqueur d'identité.

**Deux traitements d'action primaire — conservés délibérément.**
Le CP1 avait gelé « 2 → 1 ». L'examen des 32 usages a montré que la distinction
est sémantique : `.btn.cta` (dégradé) est toujours *navigationnel* — « Ouvrir »,
« Choisir », « Tester » ; `.btn.primary` (aplat) est toujours une *action en
place* — « Enregistrer », « Terminer », « Lancer », « Corriger ». Les fusionner
rendrait « Lancer » aussi fort que « Commencer le jour 1 » et détruirait une
hiérarchie utile.
**Le critère gelé n'est donc pas tenu, et il compte comme non tenu.** Je l'avais
gelé sur une lecture incomplète ; je ne le réinterprète pas en ma faveur.

## 27 — Test à l'aveugle

12 vignettes à 1440, sans rail, sans marque, sans URL, sans version —
`docs/design/v62/blind/`. Routes : lessons, security, doc, lab, missions,
cloud-foundations, glossary, day, pipelines/[id], career, calendar, notes.

**« Ces pages appartiennent-elles au même produit ? » — Oui.** Quatre marqueurs
communs, inspectés vignette par vignette :

1. la ligne de système en tête, monospace, capitales, paires `CLÉ valeur` ;
2. le double registre typographique — display sur corps 15 px, ratio 3,3 sur
   les 36 routes, sans exception ;
3. la bande d'action à filet d'accent, même forme sur `/security`, `/doc`,
   `/lessons`, `/lab` ;
4. les catalogues en lignes sur surface continue, plus une seule grille de
   cartes.

**Ambiguïtés documentées** — le test ne donne pas 5/5 :
- `/notes` et `/settings` n'ont pas de ligne de contexte : leur vignette se
  reconnaît par la typographie et l'action, pas par le registre de tête ;
- `/calendar` et `/day` restent les deux surfaces les plus singulières du
  produit — c'est voulu, mais un observateur pourrait les prendre pour un
  autre outil que les catalogues ;
- `/glossary` est un explorateur à deux volets qui n'a d'équivalent nulle part
  ailleurs. Sa parenté tient à la ligne de contexte et à la typographie, pas à
  sa composition.

## 28 — Bugs découverts pendant les captures et les mesures

1. **`btn-primary` n'existe pas.** Deux boutons « Lancer » (`/pipelines/[id]`,
   `/lab/[exerciseId]`) portaient une classe déclarée **nulle part** dans la
   feuille de style. L'action principale de ces pages se rendait en bouton
   secondaire. Aucun test ne le voyait. Corrigé, et un gate l'interdit désormais.
2. **`/cloud-lab/[id]`** — le bouton qui lance le scénario n'avait aucune
   classe d'action. Corrigé.
3. **Une émoji dans un titre** (`<h2>🎯 Pratique associée</h2>` dans `/doc`),
   contre la direction déclarée du produit. Retirée, et un gate l'interdit.
4. **`/doc` : `h1` hors écran** (`sr-only`) — exactement le défaut que V59 avait
   introduit sur `/capstones` et que V61 y avait corrigé. Il avait survécu ici,
   et expliquait le ratio typographique de 2,24.
5. **`/doc` : en-tête bridé à la mesure de lecture** — titre cassé sur quatre
   lignes, 500 px de canevas vides à droite. Vu sur la capture à l'aveugle,
   **après** une première correction que je croyais suffisante. Invisible à
   toute sonde.

## 29 — Erreurs introduites puis corrigées, et sondes fausses

**Quatre incidents de sonde dans ce sprint. Aucun n'a été corrigé en modifiant
le produit.**

1. **Faux négatif d'action.** La sonde cherchait `.btn.cta` ; le produit utilise
   aussi `.btn.primary`. Cinq routes déclarées « sans action » en avaient une.
   Repéré **à l'œil** sur la capture de `/notes`.
2. **Faux négatif inverse.** La sonde corrigée lisait `backgroundColor` ; or
   `.btn.cta` est peint par un `linear-gradient`, dont le `backgroundColor`
   calculé vaut transparent. La correction du bug 1 effaçait les 16 actions des
   routes migrées en V61. La sonde finale lit fond **et** image de fond.
3. **Serveur périmé.** Un relevé a donné « 34 routes en classe B » — y compris
   le tableau de bord, dont l'action était visible à l'écran. La sonde pointait
   sur un serveur d'une build antérieure. Aucune régression : un artefact de
   mesure, corrigé en vérifiant l'URL avant de croire le chiffre.
4. **Fausse cartification.** La sonde comptait 12 « cartes » identiques sur
   `/calendar` : ce sont les douze **pastilles de numéro de mois**, 50 × 50 px.
   Corriger le produit pour satisfaire cette sonde aurait été absurde. La
   définition a été resserrée — une carte est un conteneur, ≥ 2 enfants et
   ≥ 15 000 px². Avec la bonne définition, `/calendar` porte **zéro** carte.

**Une erreur dans le gate lui-même, trouvée par le test négatif.** La première
vérification (`includes('<ContextLine')`) acceptait `<ContextLineX` : casser la
balise ne faisait **pas** échouer le gate. C'est exactement le trou que le gate
V61 avait déjà trouvé et que celui-ci a reproduit. Remplacé par
`/<ContextLine[\s/>]/`, puis re-testé en négatif avec succès.

**Les huit vérifications du gate `v62:check` ont été vues échouer, puis
restaurées** (§19 du brief) : contexte retiré d'une coquille, suite codée en
dur, classe d'action inexistante, rendu conditionnel de `/lab` retiré,
glossaire renvoyé au corpus complet, `.pl-cards` redevenu une grille, émoji
réintroduite dans un titre. Chacune a rendu le code 1 avec un message nommant
la cause.

## 30 — Dette restante

| # | constat | mesure |
|---|---|---|
| 1 | `/day/[id]` à 375 px | **13 613 px** — voir §31 |
| 2 | 10 pages > 5 000 px à 375 px | cible ≤ 8, non tenue |
| 3 | `/lab` HTML 366 Ko, `<details>` fermés 217 nœuds | cibles 350 Ko / 200, ratées de peu |
| 4 | `/glossary` 445 Ko, 3 964 nœuds | la liste de 711 termes est le poids résiduel |
| 5 | 5 routes sans ligne de contexte | `capstones/[id]`, `missions/[id]`, `lab/[id]`, `notes`, `settings` |
| 6 | 2 traitements d'action primaire | délibéré, cf. §26 |

## 31 — Ce qui n'a PAS été fait, et pourquoi

**`/day/[id]` à 375 px reste à 13 613 px, contre une cible gelée de 7 000.**
Décomposition : le volet LIRE seul porte 12 802 px, et c'est **le cours** —
les huit sections de lecture de la journée. Le brief interdit explicitement de
retirer du contenu pédagogique pour réduire une hauteur, et il a raison.
Les deux issues qui restaient étaient de masquer le cours derrière un accordéon
— que le brief interdit tout aussi explicitement — ou d'améliorer la
navigation dedans. C'est la seconde qui a été prise : le déroulé, qui ancre les
douze sections, reste désormais visible pendant la lecture au lieu d'être
enfermé dans un volet séparé.
**La cible n'est pas tenue. Elle était mal posée** : je l'ai gelée au CP1 avant
d'avoir décomposé la page. La tenir aurait exigé de désobéir au brief.

**Les 10 pages > 5 000 px.** Trois d'entre elles (`/guide`, `/resources`,
`/career`) ont **grandi d'environ 350 px** parce que j'y ai ajouté la ligne de
contexte et la bande d'action. C'est un coût réel de la mise en cohérence, et
il est écrit. Les autres sont des surfaces de pilotage denses dont la hauteur
est du contenu. Poursuivre aurait été de la réduction de pixels, ce que le
brief distingue explicitement de la réduction de fatigue de navigation.

**`/notes` et `/settings` n'ont pas reçu la ligne de contexte.** Ce sont des
outils mono-objet — un journal, des réglages — sans état à énoncer en tête.
Leur y coller un registre vide aurait été un ornement.

---

## 32 — Verdict

# UX_CLOSURE_NOT_READY

Les dix conditions du §17 sont évaluées sans compensation entre elles :

| # | condition | |
|---|---|:--:|
| 1 | 0 route learner-facing critique sans contexte suffisant | ✅ 35/35 en classe A |
| 2 | `/lessons` et `/missions` scannables | ✅ 18 762 → 3 295 · 13 776 → 2 328 |
| 3 | `/lab` sans DOM massif injustifié | ✅ 6 438 → 367 nœuds |
| 4 | grammaire identifiable par famille | ✅ trois coquilles partagées |
| 5 | aucun sixième motif | ✅ fermé à cinq, vérifié par gate |
| 6 | 0 débordement | ✅ 324 états |
| 7 | 0 axe critical / serious | ✅ 324 états |
| 8 | invariants produit | ✅ corpus, progression, 365 jours intacts |
| 9 | blind-difference convaincant | ✅ avec trois ambiguïtés documentées |
| 10 | aucune régression des surfaces déjà modernisées | ❌ **non** |

**La condition 10 échoue, et c'est elle qui décide.** `/day/[id]` mesure
13 613 px à 375 px contre 13 425 au début du sprint : **+188 px**. La cause est
connue et assumée — le déroulé reste affiché pendant la lecture, ce qui améliore
la navigation — mais c'est une augmentation de hauteur sur la surface centrale
du produit, mesurée, sur une route explicitement citée par la condition 10.

Trois cibles chiffrées gelées au CP1 sont par ailleurs manquées : hauteur de
`/day` à 375, nombre de pages longues, poids de `/lab` et `/glossary`.

Le §17 est explicite : les dix points, sans exception. Une seule condition qui
échoue donne `UX_CLOSURE_NOT_READY`. **Je ne promeus pas ce verdict par
enthousiasme pour le reste du sprint**, qui est pourtant substantiel :
35 routes sur 35 en classe A contre 22, quatre bugs réels trouvés dont deux
invisibles depuis des mois, une dette de DOM divisée par dix-sept, et un
produit qui passe le test à l'aveugle.

### Ce qu'il reste à faire pour fermer, précisément

1. Trancher `/day/[id]` à 375 px : soit accepter que la hauteur du cours est le
   cours et **réécrire la condition** en connaissance de cause, soit décider
   d'une pagination par section — décision **humaine**, pas technique.
2. Ramener les pages longues de 10 à ≤ 8.
3. Finir les trois budgets ratés de peu (`/lab` 366→350 Ko, `/glossary`
   445→400 Ko).

Ces trois points tiennent dans un sprint court. **La clôture UX est à portée,
elle n'est pas acquise.**

### Verdict qualité traditionnel, secondaire

`STRONG_IMPROVEMENT`.
