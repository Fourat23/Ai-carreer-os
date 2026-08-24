# V56 — Product Identity Propagation & Signature

> À lancer APRÈS V55. **LE DÉPÔT FAIT FOI.** Références :
> `docs/ADR-055-product-identity.md`, `docs/SPRINT-V55.md`,
> `docs/audits/visual/v55-before|after/`.
>
> V55 a livré la grammaire d'identité sur **5 routes** et l'a mesurée
> (moyenne prototype 2,60 → 4,10, verdict STRONG_IMPROVEMENT, **pas**
> REFERENCE_GRADE). V56 a deux buts, et un seul est de la propagation.

## 0. Les deux objectifs, dans l'ordre

**A. Signature** — combler l'écart qui a fait manquer REFERENCE_GRADE :
originalité 3,5/5 et composition 4,0/5. Aujourd'hui l'identité est *cohérente*
sans être *singulière* : deux objets seulement appartiennent en propre au
produit (l'anneau de position, la carte de trajectoire par mois). Le reste
emprunte au vocabulaire des outils développeurs.

**B. Propagation** — **32 routes sur 37** n'ont reçu que la nouvelle peau
(palette, typographie), pas la nouvelle composition.

A avant B : propager une identité incomplète la fige.

## 1. Ce qui est verrouillé et se propage tel quel

- Échelle de surfaces à six crans `canvas → shell → surface → raised →
  focus → interactive`, différenciée par luminance **+ bordure + élévation +
  gradient local**, jamais par la seule teinte.
- Quatre crans d'élévation ; `--glow-accent` **réservé à une zone par page**
  (le focus du Dashboard) — le gate le compte.
- Sept crans typographiques, `--fs-display-xl` **fluide** et consommé par les
  titres de page. Amplitude titre/corps visée **≥ 3,5**.
- **Un seul point focal par grande page** (`HeroFocus`), pleine largeur,
  part de surface ≥ 0,40 à 1440, distinct par la profondeur.
- Un élément graphique n'existe **que** s'il porte une donnée réelle.
- `DATA ORDER = DOM ORDER = READING ORDER` ; `column-count` / `columns`
  interdits sur toute séquence.
- Toute grandeur affichée appartient à une partition qui boucle.
- Un CTA vit dans le bloc qui porte les informations le justifiant.

## 2. Interdits (inchangés)

XP · niveaux utilisateur · streak · leaderboard · badges de collection ·
confettis · monnaie · progression artificielle · données inventées · scores
arbitraires · fausses statistiques · faux graphiques · seconde source de vérité ·
suppression ou changement d'URL · modification du curriculum, d'une leçon, d'un
exercice, d'une mission, d'un capstone, d'un diagnostic, ou de l'ordre des
365 jours.

## 3. Objectif A — Signature (prioritaire)

Cibles concrètes, toutes dérivées de données réelles :

1. **Un système de représentation propre au produit.** Aujourd'hui la
   compétence, la preuve et la difficulté sont rendues par des pastilles
   génériques. Concevoir une famille cohérente (formes, densité, rythme) qui
   rende ces trois notions reconnaissables **d'un coup d'œil et sans légende**.
2. **`/revisions` : recomposer, pas rhabiller.** Seule surface V55 verdictée
   IMPROVED ; remplissage 0,55 à 1440. La file pleine doit devenir une vraie
   file priorisée (urgence, ancienneté, compétence concernée).
3. **Calendrier : sortir du plafond de 0,18 de dominance** sans casser l'ordre
   ni revenir à une maçonnerie. Piste : une vue « année » condensée en tête,
   les 12 mois restant la vue détaillée.
4. **État neuf.** Tous les chiffres valent zéro au jour 1. Concevoir une
   composition *pour cet état* — sans inventer de donnée, sans remplir.

## 4. Objectif B — Propagation, par valeur learner-facing

1. `/day/[id]` — la surface la plus utilisée du produit, jamais migrée.
2. `/skills`, `/diagnostics`, `/capstones`, `/missions`, `/projects`, `/reviews`.
3. `/lessons`, `/doc/*`, `/month`, `/week`.
4. `/notes`, `/resources`, `/glossary`, `/settings`.
5. Surfaces techniques (labs, pipelines, kubernetes, cloud, security) : audit
   d'abord, migration prudente, ROI mesuré.

## 5. Floors par route migrée (vérifiés, pas supposés)

- Un point focal, part de surface ≥ 0,40 à 1440 (ou justification écrite si la
  page est légitimement égalitaire, comme le calendrier).
- ≥ 6 fonds distincts rendus, ≥ 3 niveaux d'ombre, amplitude typo ≥ 3,5
  (`scripts/v55-visual.mjs`).
- Responsive **375/480/640/768/1024/1200/1440/1600/1920** : 0 overflow **et**
  0 contenu rogné (`scripts/v5421-responsive.mjs`).
- `axe-core` **0 critical/serious** (`scripts/v542-a11y.mjs`, ajouter la route).
- Intégrité : étendre `scripts/v542-integrity.mjs`, **sans restauration**.
- Captures BEFORE/AFTER **ouvertes et inspectées**, jamais seulement produites.

## 6. Méthode — les leçons payées cher

- **Un harnais mono-état ne prouve rien** : balayer les 8 parcours pour toute
  donnée dépendant du parcours actif.
- **Tout nouveau gate se teste EN NÉGATIF** : réintroduire la régression et
  vérifier l'échec.
- **Un critère qui punit une amélioration est faux** : le seuil « 1,8× le
  second bloc » a été abandonné en V55 parce qu'il récompensait un second bloc
  pauvre. Mesurer ce qu'on veut, pas ce qui est facile.
- **Les captures trouvent ce que les métriques ratent** : cinq défauts réels de
  V55 (titre replié, anneau trop discret, mois tronqués, cellules invisibles,
  en-tête coupé) n'ont été vus qu'à l'œil.
- **Un gate qui bute sur une évolution de contrat n'est pas une régression** :
  mettre à jour la forme, conserver l'intention, écrire le motif dans le code.

## 7. Anti-scope-collapse

Une page « déjà propre » n'est pas une raison de ne pas la migrer. Si un
objectif est atteint : le prouver, marquer NO_CHANGE_JUSTIFIED, **réallouer**
l'effort vers la profondeur, la composition, l'identité ou la surface suivante.
Ne jamais transformer un objectif visuel substantiel en documentation.

## 8. Clôture

`npm test` + `tsc --noEmit` + `npm run build` + `gates:active` (dont
`curriculum:check`, `v542:check`, `v5421:check`, `v55:check`) verts ; corpus
identique ; 365 jours inchangés ; `progress.json` intact ; captures BEFORE/AFTER
produites **et inspectées** ; working tree propre ; `local == origin` ; aucun
serveur résiduel.

Rapport final en français : mesures AVANT/APRÈS, changements structurels vs
cosmétiques, blind-difference, comparaison au prototype /5 avec écarts
**expliqués**, dette restante, routes non traitées, verdict sans embellissement
(FAIL / WEAK / IMPROVED / STRONG_IMPROVEMENT / REFERENCE_GRADE).

**Ne pas démarrer V57.**
