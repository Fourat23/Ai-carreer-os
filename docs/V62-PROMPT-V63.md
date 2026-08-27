# V63 — UX CLOSURE (sprint court)

> Préparé à la clôture de V62. **Ne pas lancer avant décision humaine.**

## Pourquoi ce n'est PAS encore le Learning Engine

Le brief V62 §23 conditionnait le passage au Learning Engine au verdict
`UX_CLOSURE_READY`. **V62 a rendu `UX_CLOSURE_NOT_READY`** : neuf des dix
conditions du §17 sont tenues, la dixième ne l'est pas. Le §17 interdit la
compensation entre conditions.

`docs/V62-UX-CLOSURE.md` n'a donc **pas** été écrit. Il ne devra l'être qu'au
terme de V63, et seulement si le verdict bascule.

Lire `docs/audits/V62-FINAL-REPORT.md` §30, §31 et §32 avant de commencer.

## Le seul objet de V63

Fermer trois écarts mesurés. **Rien d'autre.** Pas de nouvelle direction, pas
de nouvelle route recomposée, pas de sixième motif, pas de redesign.

### P0 — `/day/[id]` à 375 px : 13 613 px — DÉCISION HUMAINE REQUISE

C'est le seul point qui a fait échouer V62, et il n'est **pas** technique.
Le volet LIRE porte 12 802 px : c'est le cours de la journée, huit sections.
Le brief V62 interdisait d'en retirer une ligne et interdisait l'accordéon.
V62 a donc amélioré la navigation sans réduire la hauteur, ce qui a coûté
+188 px et fait échouer la condition « aucune régression ».

**Trois issues, à trancher AVANT d'écrire du code :**

- **(a)** admettre que la hauteur d'un cours est le cours, et réécrire la
  condition de sortie en conséquence — la mesure pertinente devient alors la
  fatigue de navigation, pas les pixels ;
- **(b)** paginer le volet LIRE par section, avec l'URL comme état — le
  déroulé devient une vraie table des matières navigable ;
- **(c)** accepter les 13 613 px et retirer `/day` de la condition 10.

Ne choisis pas seul. Pose la question, avec les trois options et leurs coûts.

### P1 — Ramener les pages > 5 000 px à 375 de 10 à ≤ 8

Liste mesurée : `parcours` 6 270 · `synthese` 6 105 · `calendar` 6 352 ·
`month/3` 6 382 · `projects` 7 129 · `guide` 7 049 · `resources` 6 872 ·
`career` 5 746 · `security` 5 459 · `day/80` 13 613.

Les trois routes éditoriales ont grandi d'environ 350 px en V62 parce qu'on y a
ajouté la ligne de contexte et la bande d'action. C'est là que se trouve le
gain le plus honnête : compacter ces deux bandes en écran étroit, pas supprimer
du contenu.

### P2 — Finir trois budgets ratés de peu

| | mesuré | cible |
|---|--:|--:|
| `/lab` HTML | 366 Ko | ≤ 350 Ko |
| `/lab` nœuds en `<details>` fermé | 217 | ≤ 200 |
| `/glossary` HTML | 445 Ko | ≤ 400 Ko |

Diagnostiquer avant d'agir : sur `/lab`, le résidu est probablement les listes
d'`<option>` des filtres ; sur `/glossary`, les 711 lignes de l'index.

## Interdits — inchangés

Corpus, leçons, exercices, missions, capstones, diagnostics, ordre des
365 jours, `progress.json`, données inventées, seconde source de vérité,
gamification, suppression ou changement d'URL publique, hex en dur dans le TSX,
`prefers-reduced-motion`. Ensemble des motifs **fermé à cinq**.

Interdits propres à V63 :
- retirer du contenu pédagogique pour tenir un seuil de hauteur ;
- transformer un cours en accordéon ;
- ajouter une action pour satisfaire une sonde ;
- utiliser `display:none` comme réduction de DOM.

## Hygiène de mesure — la leçon de V62

Quatre incidents de sonde en V62, dont deux qui inversaient le résultat.
**Avant de croire un chiffre : vérifier que la sonde mesure la bonne chose, sur
le bon serveur.** Trois règles issues du sprint :

1. une sonde qui cherche une classe CSS se trompe dès qu'il en existe deux ;
2. lire `backgroundColor` seul rate tout élément peint par un dégradé ;
3. un relevé aberrant sur TOUTES les routes est presque toujours un problème
   d'outillage, pas une régression produit — vérifier l'URL d'abord.

Et : **la capture gagne sur la métrique pour le diagnostic visuel.** Les cinq
défauts les plus réels de V62 ont été vus à l'œil, pas mesurés.

## Gates

`v62:check` reste en vigueur, ses huit vérifications ont été prouvées en
négatif. Tout nouveau gate doit l'être aussi : le casser, constater l'échec avec
son message, restaurer. Rappel : au premier essai, la vérification 1 de
`v62:check` laissait passer la casse.

## Condition de sortie

- P0 tranché par une décision humaine, et appliqué ;
- pages > 5 000 px @375 : ≤ 8 ;
- les trois budgets de P2 tenus ;
- 324 états responsive : 0 débordement, 0 rognage ;
- axe : 0 critical, 0 serious ;
- invariants produit intacts ;
- **aucune régression sur les 35 routes en classe A** ;
- rapport final avec les dix conditions du §17 réévaluées une par une.

Si les dix conditions passent : écrire `docs/V62-UX-CLOSURE.md` avec la
formule prévue, puis préparer — **sans le lancer** — `docs/V63-PROMPT-V64.md`
pour le **Learning Engine** : reprise d'apprentissage, progression réelle,
révisions, preuves, compétences, diagnostics, historique, orchestration de la
journée, feedback pédagogique.

**Ne lance pas V64.**
