# V60 — VISUAL DESIGN SPIKE
## Contrat du sprint. Ce document fait foi.

Écrit **avant toute création**, après le gel d'ouverture. Il survit à une
compaction : aucune exigence de V60 ne vit uniquement dans la conversation.

---

## 0. Nature du sprint — ce que V60 n'est pas

V52 → V59 ont travaillé par **audit → métriques → corrections → gates**. Le
résultat est un produit techniquement sain dont la perception n'a pas changé.
Le rapport V59 le dit sans détour :

| Constat V59 | Valeur |
|---|:--:|
| routes à largeur de blocs unique | 28 / 36 |
| routes au même rythme vertical (20 px) | 19 / 36 |
| routes sans aucun motif propriétaire | **26 / 36** |
| routes enfermant > 90 % du texte dans une carte | 19 / 36 |
| `motifShare` | 0,013 → 0,013 |
| routes portant un motif | 10/36 → 10/36 |
| identité · originalité | +0,2 · +0,2 |

**V60 change de méthode : CONCEVOIR → COMPARER → CHOISIR.** L'intégration
viendra plus tard, ou pas.

## 1. RÈGLE ABSOLUE — aucune modification produit

V60 **ne modifie aucune route produit existante**. Les 36 routes doivent
rester visuellement et fonctionnellement **identiques** à `6f4e359`.

Interdit pendant ce spike : réécrire `/`, `/day/[id]`, `/calendar` ou toute
autre route ; migrer une route ; toucher au curriculum, à `data/progress.json`,
aux read-models métier, à l'ordre des 365 jours ; introduire une seconde source
de vérité ; optimiser l'application actuelle ; propager quoi que ce soit aux
36 routes.

**Isolation retenue : `app/design-spike/v60/…`**, hors de toute navigation du
produit. Aucun lien depuis une page de production ne pointe vers un prototype.

## 2. Interdiction de designer pour les métriques

Pendant la conception, les scores V56/V57/V58/V59 **ne sont pas des cibles**.
Ne pas gonfler `dominance`, `typeRange`, `surfaces` ou `motifShare` ; ne pas
retirer du texte utile pour gagner un ratio.

> Goodhart : une métrique utilisée comme cible cesse d'être une bonne métrique.

Les mesures ne servent qu'**après** les prototypes, comme instruments de
diagnostic descriptifs. **Aucun prototype n'est modifié après avoir vu ses
scores.**

## 3. Périmètre — 3 directions × 3 écrans = 9 prototypes

| Écran | Pourquoi lui |
|---|---|
| **Dashboard** | orientation et prochaine action |
| **Day** | la surface où l'apprenant passe réellement ses heures |
| **Calendar** | la représentation de la trajectoire longue |

Ce trio doit suffire à définir l'ADN du produit.

## 4. Données — réelles, en lecture seule

Les prototypes consomment les read-models existants **en lecture seule**, ou
une extraction immuable de données réelles.

**Interdit d'inventer** : progression, XP, badges, série, statistiques
personnelles, compétences fictivement maîtrisées, alertes, recommandations
présentées comme réelles. Une donnée inconnue est **omise** ou **déclarée
indisponible**. Aucune gamification. Aucune écriture dans `progress.json`.

## 5. Critère de différence

À 1440 px, un utilisateur doit voir immédiatement **trois produits
différents**. Si l'écart se résume à couleur, rayon, ombre, padding, taille de
titre ou fond, **V60 est un échec**.

Une différence doit porter sur : architecture spatiale · proportion des zones ·
hiérarchie · navigation de l'information · représentation de la trajectoire ·
rapport texte/visualisation · présence ou absence de rails · exposition des
actions · rythme vertical · relation contexte/contenu.

## 6. Les trois directions

**A — Mission Control.** Un système de navigation vers une cible
professionnelle. Control room, mission planning, outillage développeur haut de
gamme — sans copier Linear/Raycast/Vercel. Dashboard : « où suis-je, que
dois-je faire, où vais-je », un bloc opérationnel dominant, trajectoire au
premier écran, prochaine action incontestable. La trajectoire **ne doit pas**
ressembler à un graphe de contributions GitHub. Day : une mission active, le
statut courant spatialement évident, pas six cartes empilées. Calendar : une
carte stratégique de l'année, mois chronologiques et exacts, en secteurs de
trajectoire plutôt qu'en maçonnerie de 12 cartes.

**B — Learning Workstation.** L'environnement de travail personnel de
l'apprenant, plus proche d'un IDE que d'un dashboard. Dashboard : composition
fortement asymétrique, une zone de travail centrale dominante, un rail
secondaire court et utile. Day : la surface phare — distinguer **LECTURE /
RÉFÉRENCE** de **ACTION / PRODUCTION**, savoir en < 5 s ce qu'on apprend, ce
qu'on doit faire, comment le prouver. Éviter le syndrome « article Markdown +
sidebar ». Calendar : le planning d'un professionnel — dense, très lisible,
direct.

**C — Career Intelligence.** Un produit éditorial premium de pilotage de
montée en compétences. Calme, expressif, narratif — **pas marketing**.
Dashboard : composition éditoriale, grandes différences d'échelle
typographique, moins de boîtes, davantage de contenu sur le canvas. Day : un
manuel interactif premium, où les phases pratiques sont des **ruptures
visuelles fortes** — je lis ≠ je travaille ≠ je produis une preuve — sans
transformer chaque phase en carte. Calendar : plus graphique ; un mois court ou
vide reçoit une représentation **honnête**, pas un panneau rempli
artificiellement.

## 7. Langage de marque commun aux trois

Dark mode premium · bleu-noir / indigo / violet · le vert **uniquement** pour
un succès réel · monospace parcimonieux pour les métadonnées · aucune couleur
décorative arbitraire · aucun dégradé arc-en-ciel · pas de glassmorphism
excessif · pas de néon gaming · pas d'« AI slop » · pas de quinze cartes
flottantes · pas de dashboard crypto · pas de landing page marketing.

Le produit reste : **professionnel · sobre · technique · dense · calme · haut
de gamme.**

## 8. La carte est une exception, pas la primitive par défaut

Outils autorisés : canvas ouvert · séparateurs · changement de fond de zone ·
grille · rail · bande · typographie · alignement · blanc · contours partiels ·
lignes de connexion · progression graphique · sections ouvertes · tableaux ·
surfaces pleines · contexte collant · surimpressions raisonnables.

**Une carte doit avoir une raison fonctionnelle claire.**

## 9. Typographie

Amplitude display réellement utilisée : à 1440/1920 le H1 peut dépasser
nettement les 28-34 px historiques. Hiérarchie immédiatement perceptible,
**sans faire du landing-page design**. Forte amplitude **+** densité
professionnelle. Le corps de lecture long reste lisible. **Ne jamais réduire du
texte utile pour satisfaire un ratio.**

## 10. Motifs — ensemble fermé à cinq

`PositionRing` · `TrajectoryMap` · `PhaseRail` · `EvidenceMark` · `YearBand`.

**Aucun sixième motif ne peut être inventé pendant V60.** En revanche ils
peuvent être transformés visuellement, agrandis, combinés, rechorégraphiés,
déplacés, et voir leur dominance changée. Le problème n'est pas leur nombre :
c'est qu'ils sont trop petits et trop peu orchestrés.

## 11. Nature technique des prototypes

De vrais composants React rendus dans Chromium. **Pas** de Figma, de maquette
SVG statique, d'image générée, de HTML exporté à la main, de capture
Photoshop. Les interactions métier peuvent être inertes ou locales si c'est
clairement indiqué comme prototype.

## 12. Captures — minimum 27

Pour chacun des 9 écrans : **1440**, **1920**, **375**.

```
docs/design/v60/direction-{a,b,c}/{dashboard,day,calendar}-{1440,1920,375}.png
```

Pleine page quand c'est utile, mais **le critère principal est le premier
viewport**.

## 13. Blind difference

Logo, nom « AI Career OS » et barre latérale masqués. Pour chaque direction :

1. Dashboard, Day et Calendar semblent-ils appartenir au même produit ?
2. Cette direction pourrait-elle être vendue telle quelle à un autre SaaS en
   changeant seulement le logo et la couleur ?

**Réponse attendue à la seconde : NON.** Un OUI signale un manque d'identité.

## 14. Évaluation — après conception uniquement

Score /5 sur : sophistication · profondeur · hiérarchie · composition ·
utilisation de l'espace · identité · typographie · cohérence · impression
premium · originalité.

Plus, pour chaque direction : avantage principal · défaut principal · risque
d'intégration · dette technique potentielle · pages d'extension facile · pages
d'extension difficile.

**Les scores décrivent. Ils ne pilotent pas.**

## 15. Critères de rejet automatique

Une direction est rejetée si : elle ressemble à V59 avec une autre peau · son
Dashboard reste un assemblage de cartes · son Day reste un article long +
sommaire · son Calendar reste douze cartes identiques · la différence
principale tient aux jetons · elle dépend de fausses données · elle ajoute de
la gamification · elle réduit l'information utile · elle dégrade le mobile ·
elle exige une seconde source de vérité.

## 16. Livrable

`docs/design/V60-DESIGN-DIRECTIONS.md` — philosophie, architecture des trois
écrans, captures, points forts, points faibles et score par direction ; puis un
tableau comparatif ; puis une recommandation nommant le meilleur Dashboard, le
meilleur Day, le meilleur Calendar, la pertinence d'une hybridation et ses
risques de Frankenstein visuel.

## 17. Interdiction de migration

À la fin de V60 : **ne pas** modifier `/`, `/day/[id]`, `/calendar` ; **ne pas**
lancer V61 ; **ne pas** migrer la direction gagnante ; **ne pas** propager de
composants ; **ne pas** réécrire le design system de production.

La décision — A · B · C · HYBRIDE · AUCUNE — appartient à l'utilisateur.

## 18. Intégrité à la clôture

Corpus inchangé · `progress.json` inchangé · curriculum inchangé · 365 jours
inchangés · tests verts · build vert · `tsc` vert · gates actifs verts · aucune
navigation du produit vers un prototype · aucun prototype en route métier
officielle · commit · push · `local == origin` · arbre propre · 0 serveur
résiduel.

---

## Gel d'ouverture — mesuré avant toute création

| Vérification | Valeur |
|---|---|
| Branche | `claude/ai-career-os-saas-phfg49` |
| `HEAD` | `6f4e359` (clôture V59) |
| `local == origin` | oui — `6f4e359dfb808cd1640fddef8964ac79cc7d0c9f` des deux côtés |
| Arbre de travail | **propre** |
| Stash | **0** |
| Serveurs Next résiduels | **0** |
| `data/progress.json` | blob `323604021055588a9528a86875f36598dbdc7758` |
| Corpus gelé | SHA-1 `4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3` (gate V48) |
| Ordre des 365 jours | inchangé — 365 jours, 376/376 exercices mappés, 0 orphelin (gate V51) |
| Routes publiques | 36 |
| `tsc --noEmit` | propre |
| `npm test` | **1285 / 1285** |
| `npm run build` | compilé |
| `npm run gates:active` | **39 gates vertes** |

## La question centrale de V60

Pas « le design est-il meilleur ? » mais :

> « Si je retire le logo, le nom AI Career OS et sa couleur indigo, est-ce que
> cette interface possède suffisamment de composition, de comportement et de
> langage visuel pour être reconnue comme un produit spécifique ? »

**V60 est réussi si au moins UNE des trois directions permet de répondre
clairement OUI.**
