# V55 — Product UX Migration II (routes restantes)

> À lancer APRÈS V54.2.1. **LE DÉPÔT FAIT FOI.** Références visuelles
> **verrouillées** (`docs/SPRINT-V54.2.1.md` §14, `docs/ADR-054.2.1`,
> `docs/audits/VISUAL-INTEGRITY-V54.2.1.md`) : **propager** les patterns
> validés, ne pas ré-inventer une direction.
>
> Mise à jour V54.2.1 : la version précédente de ce prompt s'appuyait sur des
> références qui contenaient encore trois défauts structurels (ordre du
> calendrier, vide du Dashboard, partition 365). Elles sont corrigées et
> mesurées. Ce prompt propage donc **aussi** le contrat d'intégrité visuelle.

## 0. Règle fondamentale — trois niveaux, mesurés séparément

| Niveau | Question | Ce qui le prouve |
|---|---|---|
| **Correctness** | ça fonctionne ? | tests, `tsc`, build, HTTP |
| **Visual integrity** | le rendu représente-t-il correctement les données **et leur ordre** ? | ordre DOM **et** ordre de lecture (bounding boxes), partitions qui bouclent |
| **Composition quality** | l'information est-elle bien disposée ? | vide structurel mesuré, distance CTA↔contexte, **inspection réelle des captures** |

HTTP 200 + overflow 0 + axe 0 **ne prouvent que le niveau 1**.
Toute capture produite doit être **ouverte et regardée**. Ne jamais écrire
« visuellement amélioré » parce que le CSS a changé.

## 1. Surfaces de référence (à imiter)

- **Dashboard `/`** — 1 focus dominant · rail court hiérarchisé · **socle et pied
  DANS la colonne principale** (colonnes indépendantes par construction).
- **Calendrier `/calendar`** — grille **régulière** en ordre de lecture
  chronologique · attributs `data-calendar-*` · bandeau de réconciliation
  affichant la somme quand la couverture est partielle.
- **Parcours `/parcours`** — roadmap verticale à états dérivés · **CTA principal
  dans le bloc du parcours actif**, adjacent à la progression et à la prochaine
  étape · rangées de comparaison pour les alternatives.
- **Synthèse `/synthese`** — table comparative PRIMARY/SECONDARY · représentation
  mobile empilée libellée.
- **Révisions `/revisions`** — **état vide intentionnel** : pourquoi c'est vide,
  quand ça se remplira, quelle action réelle est possible maintenant.

## 2. Loi de composition (ADR-054.2 + ADR-054.2.1)

1. **Un seul `PrimaryFocus` par page.**
2. **Anti-vide par la composition** — jamais de remplissage, jamais de fausse
   donnée, jamais de `min-height` arbitraire ni de `position: absolute` pour
   masquer un défaut. Deux colonnes doivent progresser **indépendamment** : un
   bloc placé *après* une grille attend la plus haute des colonnes.
3. **Anti-redondance** — deux blocs pour la même donnée = un de trop.
4. **Métrique non démarrée = omise**, pas affichée en tiret.
5. **Une carte n'est pas la primitive de mise en page par défaut.**
6. Accent indigo = identité/action/focus ; vert `--ok` = succès uniquement ;
   statut = ton **+ libellé**, jamais la couleur seule.
7. **Ordre temporel/séquentiel** : DATA ORDER = DOM ORDER = READING ORDER.
   `column-count` / `columns` **interdits** sur toute séquence.
8. **Toute grandeur affichée appartient à une partition qui boucle** : si un
   total est annoncé, la somme des catégories doit le valoir, et être affichée.
9. **Un CTA appartient cognitivement à son contexte** : dans le bloc qui porte
   les informations qui le justifient, pas dans l'en-tête de page.

## 3. Invariants absolus

Curriculum 1.0 gelé · corpus `4c1f3028…` · `progress.json` `32360402…` **jamais
muté par la navigation** · 365 jours, ordre inchangé · une seule source de vérité
· aucune gamification · aucune URL supprimée ou changée · 0 hex en dur dans le
TSX · aucune donnée inventée pour remplir un espace.

## 4. Cibles, par ordre de valeur learner-facing

1. **Dette V54.2.1**
   (a) Dashboard — le rail reste court à l'état neuf (déséquilibre mesuré 516 px
   à 1440). Chercher une composition qui l'absorbe **sans inventer de contenu**
   (par exemple faire descendre un support réel dans le rail selon l'état), ou
   prouver que l'état neuf ne peut pas mieux faire et marquer NO_CHANGE_JUSTIFIED.
   (b) Synthèse desktop — la faire passer de IMPROVED à STRONG (densité,
   lisibilité des barres à 0 %, hiérarchie des colonnes).
   (c) Calendrier — mois peu couverts laissant du blanc dans leur panneau
   (Data/ML, mois 2 = 1 journée) : améliorer **sans** revenir à une maçonnerie.
2. **Routes cœur restantes** : `/missions`, `/projects`, `/skills`,
   `/diagnostics`, `/capstones`, `/reviews`.
3. **Contenu** : `/lessons`, `/day/[id]`, `/month`, `/week`, `/doc/*`.
4. **Utilitaires** : `/notes`, `/resources`, `/glossary`, `/settings`.
5. **Surfaces techniques** (labs, pipelines, kubernetes, cloud, security) : audit
   d'abord, migration prudente, ROI mesuré.

## 5. Floors par route migrée (vérifiés, pas supposés)

- Réutilisation des primitives · **0 hex** · données réelles uniquement.
- **Responsive 375/480/640/768/1024/1200/1440/1600/1920** : 0 overflow **ET**
  aucun contenu réellement rogné — réutiliser `scripts/v5421-responsive.mjs`,
  dont le compteur exclut déjà les trois cas justifiés (débordement `visible`,
  conteneur qui défile volontairement, ellipse).
- **Ordre de lecture** : si la page affiche une séquence, poser des `data-*` et
  l'asserter en navigateur (`scripts/v5421-calendar-order.mjs` comme modèle).
- **Partition** : si la page affiche un total, prouver que la somme boucle.
- `axe-core` **0 critical/serious** (`scripts/v542-a11y.mjs`, y ajouter la route).
- Clavier : focus visible, ordre cohérent, noms accessibles.
- États loading/empty/error/partial cohérents ; **vide intentionnel**.
- Intégrité : étendre `scripts/v542-integrity.mjs` à chaque route migrée,
  **sans restauration**.
- Captures BEFORE/AFTER par lot migré, **ouvertes et inspectées**.

## 6. Le harnais doit balayer plusieurs ÉTATS, pas un seul

Leçon coûteuse de V54.2 : le défaut d'ordre était invisible dans l'état gelé par
défaut. Toute assertion structurelle sur une donnée dépendant du parcours actif
doit balayer **les 8 parcours disponibles**. Un harnais mono-état ne prouve rien.

De même, **tout nouveau gate doit être testé en négatif** : réintroduire
volontairement la régression et vérifier qu'il échoue. Un gate naïf n'a aucune
valeur.

## 7. Anti-scope-collapse

Une page « qui fonctionne » ou « déjà sobre » n'est **pas** une raison de ne pas
la migrer. Si un objectif est déjà atteint : le prouver, marquer
NO_CHANGE_JUSTIFIED, et **réallouer** l'effort vers une autre amélioration de
valeur équivalente. Qualité > nombre de routes : mieux vaut 10 routes réellement
transformées que 37 routes ayant reçu trois classes CSS.

## 8. Clôture

`npm test` + `tsc --noEmit` + `npm run build` + `gates:active` (dont
`curriculum:check`, `v542:check`, `v5421:check`) verts ; corpus identique ;
365 jours inchangés ; `progress.json` intact et vérifié ; captures BEFORE/AFTER
produites **et inspectées** ; working tree propre ; `local == origin` ; aucun
serveur résiduel.

Rapport final en français, avec : cause racine de chaque défaut, mesures
physiques AVANT/APRÈS, ce qui n'a PAS été fait, dette restante, verdict par
surface et verdict global. Pas de marketing.

**Ne pas démarrer V56.**
