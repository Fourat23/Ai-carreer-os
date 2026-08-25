# V59 · CP12 — Navigation aléatoire sur le tirage pré-enregistré

Tirage gelé au §6 de `docs/V59-CRITERIA-FROZEN.md` : graine `V59-SIGNATURE`,
`scripts/v59-draw.mjs`, 12 routes, quotas par famille. **La sélection n'a pas
été touchée.** Deux largeurs par route : 1440 et 390.

## Correction de ma propre sonde, avant tout résultat

Première exécution : **5 routes sur 12 signalées cassées**. Puis j'ai regardé
les captures. `/day/80` à 390 px, annoncé avec 47 débordements, est une page
correcte : ses 47 « débordements » sont les icônes de la barre de phases,
placées dans un conteneur à **défilement horizontal volontaire**
(`overflow-x: auto`). Mon détecteur comptait tout élément dépassant la largeur
de la fenêtre, sans regarder ses ancêtres.

Deux définitions corrigées avant de publier quoi que ce soit :

- **Débordement de page** = `documentElement.scrollWidth > clientWidth`. Les
  dépassements locaux ne comptent que si aucun ancêtre n'est un conteneur
  défilable.
- **Perte d'information** = contenu coupé par `overflow: hidden` **sans**
  `text-overflow: ellipsis` ni `-webkit-line-clamp` ni conteneur défilable.
  Une troncature à l'ellipse est un choix de mise en page, pas une perte.

Les cinq « routes cassées » du premier passage étaient cinq faux positifs de
mon instrument. Le premier chiffre est consigné ici parce qu'il a existé.

## Résultat après correction de la sonde

| Route | Famille | 1440 | 390 | verdict |
|---|---|:--:|:--:|:--:|
| `/resources` | document | 200 · page ok · 0 perte | 200 · page ok · 0 perte | ✓ |
| `/calendar` | pilotage | 200 · page ok · 0 perte | 200 · page ok · 0 perte | ✓ |
| `/settings` | document | 200 · page ok · 0 perte | 200 · page ok · 0 perte | ✓ |
| `/career` | document | 200 · page ok · 0 perte | 200 · page ok · 0 perte | ✓ |
| `/cloud-foundations` | technique | 200 · page ok · 0 perte | 200 · page ok · 0 perte | ✓ |
| `/capstones/agent-tool-loop-incident` | détail | 200 · page ok · 0 perte | 200 · page ok · 0 perte | ✓ |
| `/projects` | learner | 200 · page ok · 0 perte | 200 · page ok · 0 perte | ✓ |
| `/missions` | learner | 200 · page ok · 0 perte | 200 · page ok · 0 perte | ✓ |
| `/week/12` | détail | 200 · page ok · 0 perte | 200 · page ok · 0 perte | ✓ |
| `/pipelines` | technique | 200 · page ok · 0 perte | 200 · page ok · 0 perte | ✓ |
| `/day/80` | détail | 200 · page ok · 0 perte | 200 · page ok · 0 perte | ✓ |
| `/parcours` | pilotage | 200 · page ok · 0 perte | 200 · page ok · 0 perte | ✓ |

**0 route cassée sur 12.** Condition §6 satisfaite.
Toutes les routes : statut 200, `scrollWidth == clientWidth` aux deux
largeurs, 0 perte d'information, exactement un `h1`, aucune erreur JS.

## Le seul signal réseau, et ce qu'il était vraiment

Le premier passage a relevé sur `/resources` :
`Failed to load resource: 404 (Not Found)`. Reproduit quatre fois : présent au
**premier** chargement d'une session de navigateur, absent aux trois suivants.
Cause : `GET /favicon.ico` → 404, le produit n'a pas de fichier d'icône. Le
navigateur ne la demande qu'une fois par origine et par session ; elle est
donc attribuée à la première page chargée — `/resources` par hasard.

**Ce n'est pas un défaut de `/resources`.** C'est une icône de site absente.
Elle n'est pas ajoutée dans ce sprint : le brief exclut explicitement la
création d'un logo, et une favicon en est un. Le défaut est déclaré, pas
corrigé, pas maquillé.

## Ce que montrent les captures

Inspection visuelle de `/missions`, `/settings`, `/pipelines` à 1440 et de
`/day/80` à 390 :

- La bande d'identité — surtitre en petites capitales, titre display,
  accroche, chiffres alignés à droite — est identique sur les quatre.
- `/pipelines` porte le bloc **« Ce que ce laboratoire ne fait pas »** au-dessus
  de la ligne de flottaison, comme `/security` et `/cloud-lab`. Les limites
  sont déclarées avant les résultats. C'est la composition la plus propre au
  produit qu'ait relevée le CP11.
- `/settings` affiche 0 partout (jours suivis, journées terminées, notes,
  compétences notées). C'est l'état réel de `data/progress.json`, gelé et non
  muté par la consultation. Un zéro honnête, pas un vide de rendu.
- `/day/80` à 390 px : le rail de phases devient une barre d'icônes à
  défilement horizontal, la phase courante nommée au-dessus. Comportement
  voulu depuis V58, confirmé ici sur capture.

## Réserve de méthode

Le §6 demande le test « BEFORE **et** AFTER sur la même sélection ». Le BEFORE
disponible pour ces 12 routes est **structurel** : `docs/audits/v59/cp0-before.json`,
figé avant toute modification et vérifié intact à l'octet près par
`npm run v59:check`. Aucun jugement visuel n'avait été consigné au CP0 pour ce
tirage. Je ne reconstitue pas après coup une impression BEFORE que je n'ai pas
prise : la colonne BEFORE est structurelle, et c'est dit.

Le résultat de navigation aléatoire de V58 (8/10 modernes, 2 cassées) porte sur
un **autre tirage**, appartient à V58, et n'est ni rejoué ni réinterprété ici.
