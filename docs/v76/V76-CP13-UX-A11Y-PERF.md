# V76 · CP13 — UX, responsive, accessibilité, performance

> Rejouables : `node scripts/v76/ui-audit.mjs cp13` (35 rendus Chromium :
> 5 pages × 7 largeurs) et `node scripts/v76/cp13-ux.mjs` (10 sondes
> d'interaction) · résultats bruts : `docs/v76/ui-audit-cp13.json` et
> `docs/v76/cp13-ux.json` · mesure AVANT : `docs/v76/ui-audit-cp2.json`.

## 1 · Deux instruments, parce qu'un seul est aveugle

`ui-audit.mjs` — **le même script qu'au CP2**, relancé avec l'étiquette `cp13`
pour que les deux fichiers soient directement comparables — ouvre les pages et
mesure ce qui s'y trouve **au chargement**. C'est exactement ce qu'il faut pour
un débordement horizontal ou une cible tactile.

Et c'est parfaitement aveugle à trois surfaces de ce sprint, qui n'existent
qu'après une interaction et **n'avaient jamais été ouvertes dans un
navigateur** :

- l'avertissement de conflit du CP9 — il faut une sauvegarde refusée ;
- l'historique du CP10 — il faut avoir lancé ;
- la comparaison du CP10 — il faut cocher deux tentatives.

D'où le second instrument, `cp13-ux.mjs`, qui pilote Chromium et provoque ces
états. *Un composant qu'on n'a jamais vu à l'écran est un composant dont on ne
sait rien.*

## 2 · Le défaut que l'audit a trouvé — et je l'avais introduit

| | CP2 | CP13 (1ʳᵉ mesure) |
|---|---|---|
| `workbench@1440` — cibles < 24 px | **5** | **9** |
| `workbench@1440` — focusables | 54 | 58 |

Quatre nouvelles cibles sous le seuil WCAG 2.2 AA, mesurées à **13 × 13 px** :
les cases à cocher de l'historique, ajoutées au CP10. Personne ne les avait
regardées à l'écran, parce que le CP10 s'est vérifié par des fonctions pures et
des sondes HTTP — les deux bons outils pour ce qu'il construisait, et aucun des
deux ne mesure un pixel.

### La première correction n'a pas marché, et il a fallu le mesurer

Réflexe : `padding: 6px` avec `box-sizing: content-box`, pour élargir la zone
cliquable sans grossir la case. Re-mesure : **toujours 12 × 12 px**. Chromium
traite `input[type=checkbox]` comme un élément **remplacé** et ignore son
`padding`.

La correction qui fonctionne passe par `appearance: none` — l'élément redevient
une boîte ordinaire, on lui donne 24 px de zone cliquable, et un `::before` de
12 px pour l'apparence. Les marges négatives absorbent le débordement, donc la
grille de l'historique ne bouge pas d'un pixel.

**Mesure finale : 24 × 24 px, 0 cible sous le seuil**, et le total du Workbench
revient à ses 5 d'origine.

Deux choses ont été ajoutées au passage, parce qu'`appearance: none` retire ce
que le natif donnait gratuitement : un anneau de focus visible
(`:focus-visible`) et une coche **glyphe** `✓` plutôt qu'un simple aplat de
couleur — l'état coché ne doit pas reposer sur la seule couleur.

## 3 · Le second défaut : une erreur de console permanente

L'audit relevait « erreurs de console : 1 rendu », sans réponse ≥ 400
correspondante. En interrogeant le serveur directement :

```
/favicon.ico        → 404
/apple-touch-icon.png → 404
```

Le navigateur demande l'icône une fois par contexte, reçoit 404, et journalise
une erreur. Sur **chaque première visite**.

Ce n'est pas une question de décoration. **Une erreur permanente dans la console
est une ligne rouge qu'on apprend à ignorer, et une console qu'on ignore ne
signale plus rien** — c'est précisément le mécanisme qui a laissé le double
comptage du CP11 vivre un sprint entier dans un commentaire. Corrigé par
`app/icon.svg` (convention Next.js, aucun binaire, les couleurs du thème).

**Après : erreurs de console 0 / 35, réponses ≥ 400 : 0 / 35.**

## 4 · CP2 → CP13 : tout ce qui a bougé

Trois écarts sur 35 rendus, et un seul est un progrès du produit.

| écart | lecture |
|---|---|
| `transfert` · `aria-live` **0 → 1**, aux **7 largeurs** | **Le correctif du CP8, confirmé dans un vrai navigateur.** Le CP2 avait mesuré `0` : un apprenant au lecteur d'écran soumettait un défi et n'apprenait rien de ce qui s'était passé. |
| `workbench` · focusables **54 → 62** (≥ 1280 px) | Les huit cases de l'historique du CP10. Attendu : une ligne de tentative offre une case de comparaison. |
| `liste-lab` · focusables **46 → 47**, aux 7 largeurs | **Aucun changement de produit.** Le lien « Ouvrir l'exercice » n'apparaît que lorsqu'un exercice a déjà été travaillé ; la fixture du CP13 porte `12 / 376` réussis, celle du CP2 n'en portait aucun. C'est la DONNÉE qui diffère, pas la page. |

Tout le reste est identique au pixel : hauteur d'éditeur, part de fenêtre,
boutons visibles, rôles, `aria-selected`, éléments sans nom accessible.

### Ce qui n'a pas bougé, et c'est le résultat correct

| page | largeur | débordement | éditeur | part de la fenêtre |
|---|---|---|---|---|
| `workbench` | 1440 | ✅ non | ✅ 581 px | 65 % |
| `workbench` | 1280 | ✅ non | ✅ 518 px | 58 % |
| `workbench` | 1024 | ✅ non | ✅ 582 px | 65 % |
| `workbench` | 768 | ✅ non | ✅ 582 px | 65 % |
| `workbench` | 430 | ✅ non | ✅ 431 px | 55 % |
| `workbench` | 390 | ✅ non | ✅ 399 px | 51 % |
| `workbench` | 375 | ✅ non | ✅ 398 px | **51 %** |

**Zéro débordement horizontal sur 35 rendus. Zéro élément sans nom accessible
sur 35 rendus.** À 375 px, l'éditeur occupe encore la moitié de l'écran.

## 5 · Les surfaces neuves, vues pour la première fois

| # | sonde | résultat | observation |
|---|---|---|---|
| U1 | l'historique apparaît, et il vient du SERVEUR | ✅ | 8 lignes, présentes **avant tout lancement dans cet onglet** |
| U2 | les cases font au moins 24 px | ✅ | 24 × 24 px · 0 sous le seuil |
| U3 | la comparaison s'ouvre en cochant deux tentatives | ✅ | 10 lignes de diff (+4 / −3) et la lecture en français |
| U4 | la comparaison est annoncée, et ne déborde pas | ✅ | `aria-live="polite"` · 327 × 353 px |
| U5 | **atteignable au clavier, sans souris** | ✅ | focus natif, barre d'espace, comparaison ouverte |
| U6 | l'avertissement de conflit apparaît, et il est annoncé | ✅ | `role="alert"` · 324 × 135 px |
| U7 | l'avertissement ne propose PAS d'écraser | ✅ | 0 bouton · « Rien n'a été écrasé » présent |
| U8 | **à 200 % de zoom, rien ne déborde** | ✅ | document 640 px pour 640 px, éditeur visible |
| U9 | le diff défile seul, il ne pousse pas la page | ✅ | `overflow-x: auto` sur le diff, page intacte |
| U10 | aucune erreur de console inattendue | ✅ | 0 · 1 message attendu écarté |

### Le clavier n'a rien coûté, et ce n'est pas un hasard

`U5` passe parce que la sélection utilise un `<input type="checkbox">` natif :
focusable, actionnable à la barre d'espace, annoncé comme une case à cocher,
sans une ligne de JavaScript. Un « faux bouton » stylé aurait exigé
`role`, `tabindex`, `aria-checked` et un gestionnaire clavier — quatre occasions
d'oublier quelque chose.

`appearance: none` change l'apparence, **pas la sémantique** : c'est pourquoi
la correction du §2 n'a rien cassé de tout cela.

### Le zoom à 200 %, et la limite qu'il révèle

`U8` mesure à 640 px de large, c'est-à-dire un écran de 1 280 px zoomé à 200 %
(critère WCAG 1.4.4). Rien ne déborde, l'éditeur reste visible.

La sonde note aussi `historique: false` à cette largeur, et c'est **exact sans
être un défaut** : sous 1 024 px le Workbench bascule en mode étroit, qui
n'affiche qu'une zone à la fois derrière une navigation segmentée. Vérifié à la
main : en basculant sur « Tests », l'historique est là, **8 lignes, sans
débordement**. Ce n'est donc pas une perte de fonctionnalité, c'est le mode
étroit qui fait son travail.

## 6 · Performance : AVANT / APRÈS

Les temps d'exécution du produit ont été mesurés au CP12, sur les mêmes douze
parcours qu'au CP0 — c'est là que se trouve le chiffre qui compte, parce que
c'est là que le CP5 a inséré `unshare` et le chroot.

| | CP0 | CP12 |
|---|---|---|
| `python-ds` · lancement en échec | 1 693 ms | **1 207 ms** |
| `react-tsx` · lancement en réussite | 1 046 ms | **749 ms** |
| `node-js` · ouverture de page | 4–120 ms | **2–117 ms** |

**Ce que ces chiffres ne prouvent pas** : que l'isolation soit gratuite. Les deux
mesures ont été prises sur la même machine, mais pas sur le même serveur ni au
même état de cache ; les runtimes compilés sont dominés par la compilation TSX
et l'import de `numpy`/`pandas`, tous deux sensibles au cache disque.

**Ce qu'ils prouvent** : le coût d'isolation, quel qu'il soit, **reste sous le
bruit de mesure** de ces parcours — donc sous le seuil de perception d'un
apprenant. C'est l'affirmation exacte que les mesures soutiennent, pas une de
plus.

## 7 · Les cibles tactiles restantes, consignées ici

Le brief demande que les cibles < 24 px soient **consignées** au CP13. Après
correction des cases de l'historique, il en reste **cinq** sur le Workbench en
large, **trois** en étroit, toutes présentes depuis le CP2 :

| élément | taille | lecture |
|---|---|---|
| `<a>` fil d'Ariane « Laboratoire » | 120 × 14 px | **largeur suffisante** ; seule la hauteur du texte est sous le seuil |
| `<a>` « jour 103 » | 61 × 15 px | idem |
| `.wb-sep` × 2 (séparateurs de panneaux) | 6 × 688 px | **poignée de redimensionnement** : la finesse est la fonction. Non tactile, doublée par le bouton « Réinitialiser la disposition » |
| `.wb-tab-x` (fermer un onglet) | 28 × 12 px | **largeur suffisante**, hauteur à 12 px |

Aucune n'est corrigée dans ce checkpoint, et la raison est écrite plutôt que
tue : ce sont des éléments **existants**, mesurés identiques au CP2, dont la
modification touche la mise en page de la coquille — précisément ce que `G14`
interdit de refaire sans défaut démontré. Les quatre cases de l'historique,
elles, étaient une **régression de ce sprint** : c'est la différence qui décide.

**Ce que cela veut dire concrètement** : sur écran tactile, fermer un onglet ou
saisir un séparateur demande de la précision. C'est une dette, elle est chiffrée,
et elle n'est pas nouvelle.

## 8 · Vérifications

| | |
|---|---|
| rendus Chromium | **35 / 35** (5 pages × 7 largeurs) |
| débordement horizontal | **0 / 35** |
| éléments sans nom accessible | **0 / 35** |
| erreurs de console | **0 / 35** *(1 avant correction du favicon)* |
| réponses ≥ 400 | **0 / 35** |
| sondes d'interaction | **10 / 10** |
| cibles < 24 px introduites par ce sprint | **0** *(4 avant correction)* |
| `npm test` · tsc · build · `gates:active` | voir §9 du rapport final |
