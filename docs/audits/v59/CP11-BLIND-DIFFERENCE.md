# V59 · CP11 — Test de différence à l'aveugle

Protocole appliqué : `docs/V59-CRITERIA-FROZEN.md` §5.
Sélection des huit surfaces **pré-enregistrée avant toute modification**,
au §5 du fichier de critères. Aucune capture n'a été choisie après coup.

## Masquage réellement appliqué

```css
.app-rail, .brand, .app-topbar, .app-drawer { display:none !important }
.app  { grid-template-columns: 1fr !important; display:block !important }
main.content { margin:0 auto !important; padding:24px !important }
```

Le premier masque écrit ciblait `.sidebar` et `aside.nav` — **des classes qui
n'existent pas dans ce produit**. Le logo et le rail seraient restés visibles
et le test n'aurait rien testé. Les classes réelles ont été trouvées dans le
DOM, et un contrôle automatique vérifie désormais, sur chaque capture, que
`.app-rail` et `.brand` sont hors flux et qu'aucun nœud feuille visible ne
contient « AI Career ». Aucune fuite signalée sur les 16 captures.

Chaque surface est capturée deux fois, 1440 × 1000 : couleur et
`filter: grayscale(1)`. Le jugement porte sur la version en niveaux de gris.

## Résultats bruts — huit surfaces, cinq questions

| Surface | 1. même produit | 2. type identifiable | 3. focus < 5 s | 4. composition reconnaissable | 5. dépend de l'indigo |
|---|:--:|:--:|:--:|:--:|:--:|
| `/` | oui | oui | oui | **oui** | non |
| `/day/80` | oui | oui | oui | **oui** | non |
| `/doc/lessons/agents-fundamentals` | oui | oui | oui | **oui** | non |
| `/cloud-lab/canary-no-metric` | oui | oui | oui | **oui** | non |
| `/security` | oui | oui | oui | **oui** | non |
| `/lessons` | oui | oui | oui | **partiel** | non |
| `/resources` | oui | oui | oui | **non** | non |
| `/career` | oui | oui | oui | **non** | non |

### Ce qui rend la composition reconnaissable, quand elle l'est

- `/` — le champ de trajectoire : douze pistes de jours, compte réel par mois.
  Aucun tableau de bord générique ne rend l'année ainsi.
- `/day/80` — le rail de douze phases avec les icônes de famille
  (CADRER · COMPRENDRE · OBSERVER · PRATIQUER · PRODUIRE · VÉRIFIER ·
  PRÉPARER · RÉVISER) et les titres numérotés portant le filet de famille.
- `/doc/…` — la même grammaire à sept phases, sur un document du corpus.
- `/cloud-lab/…` et `/security` — l'état système, les compteurs de sévérité en
  chiffres display, et le bloc **« Ce que cette analyse / ce laboratoire ne
  fait pas »** placé au-dessus de la ligne de flottaison. Déclarer ses limites
  avant ses résultats est une composition que ce produit est seul à tenir.

### Ce qui échoue, et pourquoi

- `/lessons` — la bande d'identité et l'index par catégorie appartiennent au
  produit ; les rangées ordinales elles-mêmes sont une liste de catalogue
  ordinaire. **Partiel**, pas oui.
- `/resources` et `/career` — sous la bande d'identité il reste une colonne de
  document et un sommaire à droite. C'est la mise en page éditoriale la plus
  répandue du web. **Non.**

### Verdict des seuils §5

| Seuil | Exigé | Mesuré | |
|---|:--:|:--:|:--:|
| « manifestement le même produit » | ≥ 90 % | **100 %** (8/8) | ✅ |
| « composition identifiable » | ≥ 80 % | **62,5 %** (5/8, `/lessons` compté 0) — **68,75 %** si `partiel` compte ½ | ❌ |
| dépendance à l'indigo | 0 | **0/8** | ✅ |
| surface cassée | 0 | **0/8** | ✅ |

**Le second seuil n'est pas atteint.** C'est un échec, il est publié comme
tel, et il déclenche la condition bloquante n° 2 du §3 : `REFERENCE_GRADE`
ne pourra pas être déclaré au CP14, quelles que soient les notes.

La cause est nommée et non contournée : la famille éditoriale
(`/career`, `/guide`, `/resources`) porte des documents du corpus **sans
`data-family`**. La couche 2 de la grammaire ne peut pas les atteindre sans
inventer une équivalence que le corpus ne porte pas — refus déjà posé au CP5
et maintenu ici. Fabriquer un ornement pour faire passer le seuil aurait été
l'inverse du travail demandé.

---

## Défauts trouvés PAR ce test, et corrigés

Le test aveugle a fait ce qu'aucune métrique gelée ne faisait : regarder.

### 1. Les entités HTML du hero de `/doc`

L'accroche affichait littéralement `qu&#39;est-ce que c&#39;est`. Le CP2 avait
décodé les entités des intitulés de sections, mais `docTitle` et `docLead`
sont extraits par la page elle-même et n'étaient pas passés par
`decodeEntities`. Corrigé au même endroit, avec la même fonction.

### 2. Le titre imprimé deux fois — **dix routes sur 36**

Sonde `h1` par route, avant / après :

| | routes avec `h1` ≠ 1 |
|---|---|
| **avant** | `/skills` 2 · `/projects` 2 · `/reviews` **3** · `/month/3` 2 · `/week/12` 2 · `/career` 2 · `/guide` 2 · `/resources` 2 · `/doc/…` 2 · `/capstones` **0** |
| **après** | *aucune* — 36/36 à exactement un `h1` |

Sur `/resources` les deux `h1` disaient le même mot, « Ressources », l'un
sous l'autre. Sur `/reviews` il y en avait trois.

Deux traitements, selon ce que le titre du document apporte :

- **Surfaces éditoriales** — `extractSections` retire le `h1` de la prose et
  rend son texte à la page, qui le compare à son propre titre. Identique
  (`/resources`) : il disparaît. Différent (`/career` → « Stratégie CV /
  LinkedIn / GitHub », `/guide`) : il est rendu au rang h2, sous le titre de
  surface. **Aucun texte n'est perdu.**
- **Autres surfaces** — `demoteDocTitle` rétrograde le `h1` du corpus en h2 en
  place, texte et position inchangés. Volontairement séparé de
  `annotateProseA11y` : les surfaces éditoriales ont besoin de voir le `h1`
  intact pour en extraire le titre, un rabotage caché en amont leur volerait
  leur source.
- `/capstones` était la seule des 36 sans aucun `h1` — `HeroFocus` porte son
  titre au rang h2 et son texte dépend du décompte. Un `h1` accessible stable
  est exposé, comme `/doc` le fait déjà.

Première tentative de style du titre rétrogradé : `font-size: var(--fs-lg)`.
Le titre est ressorti **plus petit** que ses propres sections. Ce qui a mené
au défaut suivant.

### 3. `--fs-lg` — un jeton appelé treize fois, défini nulle part

`font-size: var(--fs-lg)` sans repli, avec `--fs-lg` indéfini, est une
déclaration **invalide au calcul** : la propriété retombe sur `unset`, donc,
pour une propriété héritée, sur la taille du parent.

Mesuré au navigateur **avant** correction — treize sélecteurs, onze titres de
bloc rendus sur les routes sondées :

```
.rev-h              15px  /revisions  « Échéancier »
.period-h           15px  /month/3    « Position dans l'année »
.period-next-t      15px  /month/3    « Jour 57 — SQLite branché sur… »
.lab-next-t         15px  /lab        « Premier programme : la sortie… »
.proj-h             15px  /projects   « Journées du programme »
.rv-h               15px  /reviews    « Revues hebdomadaires »
.rv-next-t          15px  /reviews    « Semaine 1 — jour 7 »
.tb-h               15px  /pipelines  « Ce que ce laboratoire ne fait… »
.set-h              15px  /settings   « Ce que contient ta progression… »
.jn-h               15px  /notes      « Comment une entrée arrive ici »
.sh-facts dd        15px  /glossary   « 711 »
```

Tous à **15 px**, c'est-à-dire exactement la taille du texte d'interface qui
les entoure. Seule la graisse 650 les en distinguait. Neuf routes concernées :
`/revisions`, `/month/[id]`, `/lab`, `/projects`, `/reviews`, `/pipelines`,
`/settings`, `/notes`, `/glossary`.

`--fs-lg: 18px` n'est pas un cran inventé : c'est celui que `.prose h2` code
en dur depuis V52. Le jeton nomme un rang qui existait déjà. Après
correction : les onze mesurés à 18 px.

**Ce que ce défaut dit du dispositif de mesure.** `typeRange` vaut
`maxFont / bodyPx`. Le plus grand corps d'une page est son titre display
(49 px), le plus petit son corps ; passer un titre de bloc de 15 à 18 px ne
touche ni l'un ni l'autre :

```
typeRange moyen des 36 routes :  3,623  →  3,623   (aucun mouvement)
routes sous le seuil R4 (3,2)  :      8  →      8
```

Onze titres de bloc rendus à la taille du texte courant sur neuf routes, et
**zéro métrique gelée ne bouge**. C'est le miroir exact de la régression V58
CP6 (`.cat-row-link`), qu'aucune métrique ne voyait non plus. La leçon est la
même et elle est écrite ici pour qu'elle survive au sprint : *les métriques
gelées prouvent qu'on n'a rien cassé de ce qu'elles couvrent ; elles ne
prouvent jamais que la page est bonne.*

### 4. « 1 artefacts »

`/security` affichait l'accord au pluriel sur un compte de 1.

## Contrôles de non-régression après ces corrections

| Contrôle | Résultat |
|---|---|
| Sonde gelée V56/V57, 36 routes | `overflow = 0`, `clipped = 0` partout |
| `h1` par route | 36/36 à exactement 1 |
| axe-core, 18 routes modifiées | **0 critical, 0 serious** (2 `landmark-unique` moderate, préexistants) |
| `tsc --noEmit` | propre |
| `next build` | compilé |

## Second passage aveugle

Les huit surfaces ont été recapturées après correction, même protocole, même
sélection. Les jugements du tableau ci-dessus **n'ont pas été révisés à la
hausse** : la hiérarchie de `/resources` et `/career` est désormais juste,
mais leur composition reste celle d'un document avec sommaire à droite. Le
seuil de 80 % reste manqué. Les deux passages sont conservés dans le
scratchpad de session (`blind/` et `blind2/`).
