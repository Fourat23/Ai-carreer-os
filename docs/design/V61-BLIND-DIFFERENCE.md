# V61 — Test à l'aveugle et test anti-gabarit

Captures : `docs/design/v61/blind/a.png` … `h.png`, 1440 px.
Retirés avant capture : le rail de navigation, la marque, le monogramme, la
barre supérieure, le lien d'évitement, l'URL et tout numéro de version. Il ne
reste que le contenu et sa composition.

| Vignette | Surface (révélée après jugement) |
|---|---|
| a | Tableau de bord |
| b | Journée 80 |
| c | Calendrier |
| d | Missions |
| e | Laboratoire |
| f | Révisions (état vide réel) |
| g | Capstones |
| h | Mois 3 |

---

## 1. Test d'identité — les huit appartiennent-elles au même produit ?

**Oui.** Cinq marqueurs se retrouvent sur les huit, sans le secours d'un logo :

1. **La ligne de système en tête.** Une bande monospace, capitales, paires
   `CLÉ valeur`, avec un seul terme mis en avant — celui qui dit « où je suis ».
   Elle ouvre les huit vignettes, et c'est le signal le plus fort : on
   reconnaît le produit avant d'avoir lu un mot de contenu.
2. **Le double registre typographique.** Titre à l'échelle display (49 px) sur
   corps de 15 px, ratio 3,3 identique sur les huit — mesuré, pas estimé.
3. **La sobriété de l'accent.** Le violet ne remplit qu'une surface par écran,
   toujours l'action primaire. Partout ailleurs il est un trait ou un mot.
4. **Le fond réglé.** Une trame orthogonale très faible, jamais un aplat plat,
   jamais un dégradé décoratif.
5. **La paire libellé/valeur en petites capitales**, qui sert aussi bien à
   « DIFFICULTÉ 3 / 5 » qu'à « TERMINÉES 0 journées ».

## 2. Test de différence — se distinguent-elles les unes des autres ?

**Oui, et par la structure, pas par la couleur.** Quatre compositions
réellement distinctes :

- **a, c** — surfaces de position : un objet graphique porte la réponse
  (TrajectoryMap pour a, YearBand pour c).
- **b** — atelier à trois zones : le déroulé, la lecture, l'action, côte à côte
  dans un cadre borné.
- **d, e, g** — catalogues : index de tête, sections nommées, lignes.
- **f, h** — surfaces documentaires : un document du curriculum encadré par des
  faits réels.

Une personne à qui l'on montrerait `b` et `d` ne pourrait pas les confondre :
l'une est un poste de travail, l'autre une liste. C'était exactement le défaut
que V57 avait constaté et que V61 devait finir de fermer.

## 3. Test anti-gabarit — est-ce le même écran répété ?

**Non.** Le contre-test est `c` contre `h` : les deux affichent la bande
d'année, le même motif propriétaire, sur des pages de nature différente.

- Sur `c`, la bande est l'**objet principal** : 365 marques, hauteur variable,
  échelle de mois, légende complète. Elle est là pour être lue.
- Sur `h`, la même bande est un **repère secondaire** placé sous un en-tête de
  mois, et le document du curriculum reste le centre de la page.

Le motif se plie à la fonction de la page au lieu d'imposer la sienne. C'est la
définition d'un langage, par opposition à un gabarit.

Deuxième contre-test, `d` contre `e` : deux catalogues, deux compositions
distinctes. `/missions` groupe par catégorie en sections déployées ; `/lab`
borne ses résultats dans un cadre défilant sous une barre d'outils. Deux
réponses à deux questions différentes — « lesquelles existe-t-il ? » contre
« laquelle je cherche ? ».

## 4. Ce que le test à l'aveugle a permis de VOIR, et qu'aucune sonde n'avait vu

Sur `e` (Laboratoire), les sept menus de filtre s'affichaient **chacun sur toute
la largeur de la colonne**, un par ligne : 340 px de hauteur pour une barre
d'outils, à 1440 px comme à 375 px, et depuis bien avant V61.

Cause : la base de formulaire déclare `select { width: 100% }`, ce que
`.lab-filters` ne rattrapait pas.

Aucune métrique ne l'avait signalé — pas de débordement, pas de rognage, pas de
violation d'accessibilité, dominance dans les clous. **C'est la capture qui l'a
montré.** Corrigé, portée au conteneur ; la page passe de 1 588 à 1 342 px et
les filtres redeviennent une barre de deux rangs.

C'est la deuxième fois dans ce sprint qu'un défaut réel n'existe pour aucune
sonde. La leçon se répète et mérite d'être écrite telle quelle : **les seuils
gelés prouvent que rien n'a cassé parmi ce qu'ils couvrent ; ils ne prouvent
jamais qu'une page est bonne.** Seul le regard le fait.

## 5. Verdict des trois tests

| Test | Résultat |
|---|---|
| identité — même produit sans logo | **réussi**, cinq marqueurs sur huit vignettes |
| différence — surfaces distinctes | **réussi**, quatre compositions |
| anti-gabarit — pas un écran répété | **réussi**, deux contre-tests (`c`/`h`, `d`/`e`) |
