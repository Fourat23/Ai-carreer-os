# UX FOUNDATION CLOSED

Clôturé au terme de V63, sur les **dix conditions de sortie fixées en V62** —
formulées avant ce sprint, committées avant ce sprint, et rejouées sans être
réécrites.

| # | Condition | Résultat |
|---|---|---|
| 1 | 0 route learner-facing sans contexte suffisant | 35 A / 0 B / 0 C |
| 2 | `/lessons` et `/missions` scannables | 3 295 px / 2 328 px @375 |
| 3 | `/lab` sans DOM massif injustifié | 367 nœuds |
| 4 | grammaire identifiable par famille | 3 coquilles partagées |
| 5 | aucun sixième motif | ensemble fermé à 5 |
| 6 | 0 débordement horizontal | 0 sur 324 états |
| 7 | 0 axe critical / serious | 0 / 0 sur 324 états |
| 8 | invariants produit | corpus, progression, 365 jours intacts |
| 9 | blind-difference convaincant | oui, trois ambiguïtés publiées |
| 10 | aucune régression des surfaces modernisées | `/day/80` @375 : 13 425 px = baseline |

---

## Ce que cette clôture veut dire

**L'interface n'est pas « finie pour toujours ».** Elle ne le sera jamais, et
ce document ne prétend pas le contraire.

**Ce qui est fermé, c'est la fondation.** Le produit possède désormais :

- une **grammaire de contexte** tenue sur 36 routes — où suis-je, qu'est-ce que
  je regarde, quelle est la suite — portée par trois coquilles partagées et non
  par 36 implémentations ;
- un **langage visuel** stable : un ratio typographique unique (3,3), un
  ensemble de cinq motifs propriétaires fermé et vérifié par gate, deux
  traitements d'action sémantiquement distincts ;
- une **discipline de composition** : les catalogues sont des lignes, pas des
  grilles de cartes ; une frontière ne se dessine que si elle sépare deux objets
  réellement distincts ;
- un **socle mesuré** : 324 états responsive sans un débordement ni un rognage,
  0 violation d'accessibilité critique ou sérieuse, 41 gates dont huit testés en
  négatif.

## Ce que cela interdit désormais

**Aucun sprint autonome de redesign ne doit être lancé sans problème
utilisateur mesuré.**

Les futures évolutions d'interface doivent être **opportunistes et liées aux
fonctionnalités** : on retouche un écran parce qu'une fonction nouvelle
l'exige, ou parce qu'un défaut réel a été observé et chiffré — jamais parce
qu'on cherche « une meilleure direction visuelle ».

La règle pratique, à opposer à toute proposition de refonte :

> Quel problème utilisateur mesuré cette refonte résout-elle ?
> Si la réponse est « le produit pourrait être plus beau », la réponse est non.

## Dette assumée à la clôture

La clôture n'est pas une déclaration de perfection. Neuf points de dette sont
listés au §25 de `docs/audits/V63-FINAL-REPORT.md`, dont les trois plus
significatifs :

1. l'usage de l'espace horizontal (noté 3/5) ;
2. l'absence de micro-états sur les actions ;
3. la hiérarchie des actions qui repose largement sur l'accent indigo.

**Aucun des trois ne se répare par un sprint de redesign.** Les deux premiers se
règlent quand les surfaces porteront des données réelles et des actions réelles
— c'est-à-dire avec le Learning Engine. Le troisième est un raffinement de
détail, listé en P2.

---

**Prochain chantier : le Learning Engine** (`docs/V63-PROMPT-V64.md`).
