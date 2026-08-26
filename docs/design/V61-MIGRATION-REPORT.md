# V61 — REFERENCE HARDENING + PRODUCT MIGRATION I · Rapport final

Branche `claude/ai-career-os-saas-phfg49`. Sprint autonome CP0 → CP15.
Toutes les valeurs de ce rapport ont été mesurées au navigateur sur le build de
production, jamais estimées.

---

## 1. Ce que le sprint devait faire

Industrialiser dans le produit la direction visuelle retenue au prototype de
référence, sans en inventer une quatrième et sans toucher au corpus. Deux
objets à durcir en priorité, quinze routes à migrer, une preuve à fournir.

## 2. Ce qui a été fait — les cinq chantiers

### 2.1 Reference Hardening — le contrat des deux motifs (P0)

Le CP0 a mesuré une **inversion de rôle**. `TrajectoryMap` rendait douze pistes
indépendantes, sans lien de l'une à l'autre : on y lisait une distribution,
c'est-à-dire une carte. Or la carte est le rôle de `YearBand`, et le rôle de
`TrajectoryMap` est l'inverse — « où j'en suis ». Les deux motifs disaient la
même chose de deux façons.

| Motif | Rôle contractuel | Ce qui a été ajouté |
|---|---|---|
| `TrajectoryMap` | **le chemin** | épine continue reliant les 12 mois, tête de position nommée et dominante, lecture différenciée parcouru / à-venir, repères « départ » et « fin de programme » |
| `YearBand` | **le relief** | hauteur de marque portant la difficulté réelle du corpus, aucune tête de position concurrente (le halo de position a été retiré) |

Facteur de séparation des deux motifs : **6,0 → 8,1**.
Aucune donnée nouvelle, aucun sixième motif. L'ensemble reste fermé à cinq :
`pos-ring`, `tmap`, `phase-rail`, `evi-mark`, `year-band` — vérifié par gate.

### 2.2 Le mur de `/day/[id]`

**14 340 px → 1 321 px** (÷ 10,9), dominance **0,941 → 0,459**.
La page devient un atelier borné à trois zones — déroulé, lecture, action —
avec bascule de volet sans JavaScript sous 1100 px. La séparation lecture /
action n'est pas décidée par moi : elle suit `data-family`, la taxonomie
pédagogique du corpus lui-même (`practice`, `apply`, `verify`, `prepare`).

### 2.3 Un défaut de fidélité au corpus, sur les 365 journées

La ligne de métadonnées du corpus (`Mois n · Semaine n · Compétence · Difficulté`)
était rendue comme chapô éditorial de la journée. Détecté par `isDayMetaLine()`,
elle rejoint désormais les registres de contexte. Le corpus n'a pas été modifié
— c'est son rendu qui mentait sur sa nature.

### 2.4 La primitive `ContextLine`

La « ligne de système » du prototype, industrialisée en primitive partagée et
posée sur les **quinze** surfaces migrées. Le test à l'aveugle la désigne comme
le signal d'identité le plus fort du produit : on reconnaît l'application avant
d'avoir lu un mot de contenu.

### 2.5 Deux murs de catalogue (CP11)

| Route | Cause réelle | Dominance |
|---|---|--:|
| `/missions` | structurée par STATUT ; à progression nulle, 42 missions sur 42 portent le même — l'axe de tête ne séparait rien | 0,867 → **0,431** |
| `/lab` | filtres et résultats dans un seul bloc de 6 520 px | 0,882 → **0,388** |

`/missions` passe à un premier niveau par CATÉGORIE — la taxonomie du corpus,
seule discriminante quel que soit l'avancement — le statut restant dit dans un
index de tête et sur chaque ligne. `/lab` sépare contrôles et résultats, et
borne le cadre de résultats au-delà de 1000 px selon la grammaire d'atelier déjà
fixée pour `/day`. Page `/lab` : 7 002 → **1 342 px**.

---

## 3. Les seuils gelés au CP1, confrontés au résultat

| Grandeur | CP0 | Cible gelée | Mesuré | |
|---|--:|--:|--:|:--:|
| hauteur `/day/[id]` | 14 340 px | ≤ 3 000 | **1 321** | ✅ |
| dominance max, routes migrées | 0,941 | ≤ 0,80 | **0,78** | ✅ |
| blocs de premier niveau | 1 | ≥ 3 | **3 à 20** | ✅ |
| largeurs structurelles | 1 | ≥ 2 | 2 à 4 quand justifié | ✅ |
| débordement horizontal | 0 | 0 | **0 / 144 états** | ✅ |
| texte rogné | 42 | 0 | **0 / 144 états** | ✅ |
| ratio display / corps | 2,24–3,30 | 3,3–4,5 | **3,3 sur les 16** | ✅ |
| routes sans CTA primaire | 11 / 16 | ≤ 3 | **0 / 16** | ✅ |
| axe critical / serious | 16 serious | 0 / 0 | **0 / 0** | ✅ |

**Aucun seuil n'a été abaissé, aucune pondération modifiée après mesure, aucune
métrique supprimée.** Là où la mesure ne passait pas — le ratio typographique,
la dominance de `/missions` et `/lab` — c'est la composition qui a bougé.

## 4. Portée réelle de la validation

- **Responsive** : 16 routes × 9 largeurs (375 → 1920) = **144 états**,
  0 débordement, 0 rognage.
- **Accessibilité** : axe-core sur **66 états — les 33 routes de production**
  × 375 et 1440, pas seulement les migrées → **0 critical, 0 serious**.
  Plan de titres : `h1` unique et aucun saut de niveau partout.
- **Tests** : 1 285 / 1 285. **Gates** : 40 / 40. `tsc` et `build` : verts.

### Performance (1440 px, build de production)

| Route | Navigation | Nœuds DOM | Poids HTML |
|---|--:|--:|--:|
| `/` | 316 ms | 1 703 | 202 Ko |
| `/day/80` | 303 ms | 1 400 | 175 Ko |
| `/calendar` | 373 ms | 2 196 | 371 Ko |
| `/missions` | 175 ms | 1 348 | 155 Ko |
| `/lab` | 339 ms | **7 073** | **867 Ko** |
| `/projects` | 133 ms | 864 | 76 Ko |

`.next/static` : 2,6 Mo. `/lab` reste l'écart notable — 376 exercices rendus
côté serveur en une passe. Ce n'est pas une régression de V61 (la page était
déjà ainsi) mais c'est le poids le plus élevé du produit, et il est écrit ici.

## 5. Intégrité de la progression (§25)

```
sha256 AVANT  73c1ee39a255c87972f4f42b36873b1081081d6f278bd767089c0cef1fc6e7a6
32 routes visitées, toutes en HTTP 200
sha256 APRÈS  73c1ee39a255c87972f4f42b36873b1081081d6f278bd767089c0cef1fc6e7a6
```

Identique. **Aucun fichier n'a été restauré** : le hachage d'après est celui
d'avant parce que rien n'écrit. Naviguer est une lecture.

## 6. Les gates, et la preuve qu'ils mordent

`scripts/v61-check.mjs` ajoute sept vérifications au chaînage : ordre du
calendrier, séparation lecture/action, détection de la ligne de métadonnées,
propagation de `ContextLine` sur quinze routes, contrat des deux motifs, portée
CSS, fermeture de l'ensemble des motifs.

**Chaque gate a été testé en négatif** (§24). Le premier passage de ce test a
laissé passer **trois vérifications sur six** — et c'est ce qui les a rendues
sérieuses :

1. `read(file).includes('<ContextLine')` acceptait `<ContextLineXX` → remplacé
   par `/<ContextLine[\s/>]/`.
2. Chercher les chaînes `difficulty` et `has-relief` n'empêchait pas
   `const hasRelief = false && …` → la hauteur de marque a été extraite en
   fonction pure `bandMarkHeight()` et c'est son **comportement** qui est
   testé : cinq valeurs distinctes, croissantes, maximum à 100, `null` à 0.
3. Le modèle du calendrier trie toujours, donc inverser l'entrée ne prouvait
   rien → ajout de contrôles sur la VUE (`.reverse()`, `.sort(`).

Dernier test en négatif, à la fin du CP12 : `<ContextLine` cassé sur `/reviews`
fait échouer le gate avec le code 1 et le nom de la route ; restauré, il repasse.

## 7. Le tirage au sort (CP13)

Publié **avant** tout constat, graine non ajustable, jamais réécrit :
`docs/design/V61-CP13-RANDOM-DRAW.md`. 14 routes, dont 9 non touchées par V61.

Il a trouvé six choses. **Quatre corrigées :**

- la frontière de migration est nette — 0 ligne de contexte et 0 CTA sur 9
  routes non migrées, sans exception ;
- `link-in-text-block` reparaissait sur trois routes non migrées, toujours sur
  le même objet (un renvoi « jour N » dans un `<p class="muted">`) : au CP12
  j'avais traité ce défaut comme un incident de `/month/3`, c'était une famille ;
- trois zones défilantes hors d'atteinte du clavier (`pre.sec-code`,
  `table.cl-table`, `div.pl-dag`) ;
- (voir §8) la barre de filtres de `/lab`.

**Deux non corrigées, assumées :** `/lessons` à 18 762 px et `/missions` à
13 776 px en 375 px. Elles sont écrites, elles comptent contre le verdict, et
elles ne sont pas requalifiées en « hors périmètre ».

## 8. Les erreurs de ce sprint, telles quelles

1. **Quatre tentatives sur le mauvais élément.** Pour corriger six violations
   sur `/month/3` à 375 px, j'ai stylé quatre fois `.period-table th a` — un
   tableau en `display: none` à cette largeur. Les sélecteurs d'axe disaient
   `li:nth-child(n) > a` depuis le début. La cause était dans `.prose`, donc
   dans les documents du curriculum, donc sur douze mois et cinquante-deux
   semaines — pas sur une route.
2. **Une hauteur fixe sur un conteneur flex.** Premier essai du cadre borné de
   `/lab` : les enfants ont rétréci au lieu de déborder, le groupe ouvert est
   passé de 3 707 px à 347 px, contenu réellement coupé. La sonde a signalé
   32 états en défaut et elle avait raison. `flex-shrink: 0`.
3. **Deux faux positifs dans ma propre sonde**, même famille que trois faux
   diagnostics de V59 : `sr-only` compté comme texte tronqué, et des boîtes de
   masquage de 1 px comptées de même. Exclus explicitement, avec le motif écrit
   dans le code.
4. **Un CTA vers une route inexistante** : `/diagnostics/[id]` n'existe pas, les
   diagnostics s'ouvrent côté client. Rattrapé avant livraison.
5. **Un défaut vu, jamais mesuré.** Les sept menus de filtre de `/lab`
   s'affichaient chacun sur toute la largeur — 340 px de barre d'outils — parce
   que la base de formulaire déclare `select { width: 100% }`. Aucune sonde ne
   l'a signalé : ni débordement, ni rognage, ni violation. **C'est la capture
   à l'aveugle qui l'a montré.**

Le point 5 est la leçon principale du sprint, et c'est la deuxième fois qu'elle
se présente : **les seuils gelés prouvent que rien n'a cassé parmi ce qu'ils
couvrent ; ils ne prouvent jamais qu'une page est bonne.**

## 9. Test à l'aveugle, différence, anti-gabarit

Détail et captures : `docs/design/V61-BLIND-DIFFERENCE.md`,
`docs/design/v61/blind/`.

| Test | Résultat |
|---|---|
| identité sans logo ni rail ni URL | **réussi** — cinq marqueurs communs aux 8 vignettes |
| différence entre surfaces | **réussi** — 4 compositions distinctes |
| anti-gabarit | **réussi** — `c`/`h` (même motif, deux rôles), `d`/`e` (deux catalogues, deux réponses) |

## 10. Ce qui reste ouvert

| # | Constat | Où |
|---|---|---|
| 1 | `/lessons` : 18 762 px à 375 px, la page la plus haute du produit | CP13 |
| 2 | `/missions` : 13 776 px à 375 px — ma propre route migrée | CP13 |
| 3 | 21 routes de production n'ont ni ligne de contexte ni CTA | CP13 |
| 4 | `/lab` : 7 073 nœuds, 867 Ko d'HTML | CP14 |

---

## 11. Verdict

### `STRONG_IMPROVEMENT`

**Pourquoi pas moins.** Les neuf seuils gelés au CP1 sont tous tenus, sans
qu'aucun ait été abaissé. Le contrat des deux motifs est rempli et vérifié par
un gate testé en négatif. Quinze routes portent une identité commune que le
test à l'aveugle confirme sans logo. L'accessibilité est à zéro violation
grave sur **l'ensemble** des 33 routes de production, pas sur la seule zone
migrée. La progression n'a pas bougé d'un octet.

**Pourquoi pas `REFERENCE_CANDIDATE`.** Trois raisons factuelles :

1. Le tirage au sort a trouvé deux défauts de composition réels qui ne sont
   **pas corrigés** — `/lessons` et la hauteur mobile de `/missions`.
   §11 des critères gelés est explicite : une condition bloquante qui échoue
   donne le verdict inférieur exact, sans réinterprétation favorable.
2. Le produit est à **deux vitesses**, et c'est mesuré : 0 ligne de contexte et
   0 CTA sur les 9 routes non migrées tirées. Une référence n'a pas de frontière
   visible en son milieu.
3. Un défaut visible depuis toujours n'a été trouvé qu'au CP13, par une capture.
   Un sprint dont l'outillage laisse passer une barre d'outils de 340 px n'est
   pas encore au niveau de preuve d'une référence.

V61 fait ce qu'il annonçait : il industrialise. Il ne termine pas la migration.

---

## 12. Les deux questions de clôture (§29)

> **« Le produit ressemble-t-il maintenant à un produit conçu, et non à une
> collection d'écrans ? »**

**PARTIELLEMENT.** Sur les quinze surfaces migrées, oui, et le test à l'aveugle
le prouve sans le secours de la marque : cinq marqueurs communs, quatre
compositions distinctes, un motif qui change de rôle selon la page. Mais le
tirage au sort a montré une frontière nette — neuf routes sur neuf sans ligne de
contexte ni action primaire. Un produit conçu n'a pas de moitié non conçue.
La réponse est « partiellement » parce que la mesure dit « partiellement ».

> **« La direction retenue tient-elle sous la contrainte du contenu réel ? »**

**OUI.** Elle a tenu sur les trois contraintes les plus dures du corpus, sans
qu'aucune donnée soit inventée, arrondie ou masquée :

- **la densité** — `/day/80` porte 8 sections de lecture et 24 activités, et
  tient en 1 321 px ; `/lab` porte 376 exercices en 32 groupes et tient en
  1 342 px ;
- **le vide** — `/revisions` à progression nulle n'a rien à réactiver, et le
  dit : « Rien à réactiver aujourd'hui », suivi de ce qui remplira la file.
  L'état vide est une réponse, pas une page ratée ;
- **l'uniformité** — 42 missions au même statut, 51 semaines sur 52 à 32 h.
  La direction a répondu en changeant d'axe (la catégorie) plutôt qu'en
  répétant un libellé sans information.

La contrainte a d'ailleurs corrigé la direction plus souvent que l'inverse : le
contrat des motifs vient d'une mesure, la séparation lecture/action vient de la
taxonomie du corpus, et la recomposition de `/missions` vient d'un chiffre.

---

**Ne pas lancer V62.** Le prompt du sprint suivant est dans
`docs/V61-PROMPT-V62.md`.
