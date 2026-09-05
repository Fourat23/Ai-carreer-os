# V71 — ÉTAT D'AVANCEMENT

> Fichier de reprise. Mis à jour après **chaque lot** et après **chaque CP**. En cas
> d'interruption, relire ce fichier, vérifier Git, et reprendre au point indiqué.
> NE PAS refaire CP0, CP1, CP2.

## Position

- **dernier CP terminé** : CP2
- **CP actuel** : CP3
- **leçons réellement lues et notées** : **48 / 128**
- **dernier lot complet** : **6 / 16**
- **prochaine action EXACTE** : CP3 — **lot 7/16**, leçons 49 à 56 de
  `docs/v71/ordre-lecture.json`. Lire (`node scripts/v71/lire.mjs <slug>`), noter D1→D14 selon
  `V71-ACADEMIC-CONTRACT-FROZEN.md`, écrire dans `docs/v71/LEDGER-128.json`, commit, push.

---

## Incident de session — perte du conteneur (2026-09-05)

La session du 2026-08-30 a été interrompue par une limite d'usage, puis le conteneur a été
détruit. Le nouveau conteneur est reparti d'un dépôt vide. Audit forensique effectué avant
toute écriture ; aucun `reset --hard`, aucun force-push, aucune ref supprimée.

**Récupéré** : tout ce qui avait été poussé, jusqu'à `aebbdaa` (CP3 lot 5).

**Perdu** — matériellement, non reconstructible sans relecture :

| perdu | contenu | statut |
|---|---|---|
| commit `8045888` | CP3 lot 6 — 8 leçons lues et notées | **à refaire par lecture** |
| lot 7 partiel | 4 leçons lues, jamais notées ni commitées | **à refaire par lecture** |
| `PREREQUIS-ORDRE.md` | jamais commité | **reconstruit par re-mesure** (§ ci-dessous) |

Le chiffre « 48/128 » annoncé en console avant la coupure **n'est pas repris**. Les huit
notations du lot 6 n'existent dans aucun artefact : elles seront refaites par lecture.
L'état prouvé est **40/128**, et c'est celui qui est publié.

`PREREQUIS-ORDRE.md` n'a pas été recopié de mémoire : la détection a été écrite en script
(`scripts/v71/prerequis-ordre.mjs`, qui n'existait pas), rejouée sur le corpus intact, et les
31 formulations relues. Les comptes sont identiques ; un point a été corrigé par la relecture
(§5 du document : 6/6 prérequis hors parcours correctement signalés, et non 4/6).

**Règle adoptée pour la suite** : commit + push après **chaque lot de 8**, sans attendre la
fin d'un CP. Une future perte de conteneur coûte au maximum 8 lectures.

---

## Invariants revérifiés à la reprise (2026-09-05)

| invariant | attendu | mesuré | état |
|---|---|---|---|
| leçons | 128 | 128 | OK |
| journées | 365 | 365 | OK |
| solutions | 365 | 365 | OK |
| corpus des 128 leçons (SHA1) | `edbfecdf…` | `edbfecdff1d3e4c320cedd51ede95601fd94750d` | **identique au CP0** |
| `data/program.json` (SHA1) | `5ac3da30…` | `5ac3da304994c298ab964a4b03e13da336bb8935` | **identique au CP0** |
| `data/progress.json` | non versionné (`.gitignore` l. 8) | absent du dépôt | **non vérifiable, et normal** |
| working tree | propre | propre | OK |
| stash | vide | vide | OK |
| objets orphelins (`git fsck`) | — | aucun | OK |
| local == origin | oui | `aebbdaa` des deux côtés | OK |

`data/progress.json` est un fichier d'état utilisateur local, ignoré par Git depuis l'origine.
Son empreinte notée au CP0 portait sur le fichier du conteneur détruit ; elle **ne peut pas**
être revérifiée ici, et cela ne constitue pas une perte : V71 interdit d'y toucher (§30).

## Validation à la reprise

`npm test` **1420 / 1420** · `npx tsc --noEmit` **0** · `npm run build` **0** ·
`npm run gates:active` **0** (dont `v66:check` 56 vérifications, `v66:render` 950 fichiers).

---

## Avancement de la notation

- leçons réellement lues : **48 / 128**
- notations D1→D14 complètes : **48 / 128**
- moyenne provisoire (48 notées) : **4,763**
- leçons sous 3,00 : **0**
- **P0 : 0** · **P1 : 9** · **P2 : 4** · **P3 : 7**

### Moyenne par dimension (48 notées)

| D1 | D2 | D3 | D4 | D5 | D6 | D7 |
|---|---|---|---|---|---|---|
| 4,81 | **4,27** | 4,92 | 4,98 | 4,96 | 4,58 | 4,96 |

| D8 | D9 | D10 | D11 | D12 | D13 | D14 |
|---|---|---|---|---|---|---|
| 4,98 | 4,98 | 4,42 | 4,69 | 5,00 | **4,25** | 4,90 |

Les deux points bas sont **D2** (prérequis, qui va encore descendre : 16 des 20 leçons à
D2 = 1 ne sont pas encore notées) et **D13** (vérification de compréhension — présente
partout, mais souvent fondue dans la pratique plutôt qu'en contrôle distinct).

### Lot 6 — ce que la lecture a trouvé

Trois défauts nouveaux, tous établis par mesure et non par sonde :

- **`observability-logging` (P1, D1 = 2)** — la correction de la pratique C annonce un
  centile 95 de 3 000 ms pour un jeu à 95 % / 5 %. Mesuré : p95 = 50 ms, p99 = 3 000 ms.
  Aggravant : l'énoncé demande un jeu où le p95 est **mauvais**, et la correction en
  fournit un où il est bon — elle échoue à l'exercice qu'elle corrige. Fix CP8.
- **`technical-debt` (P1, D1 = 2)** — l'exemple guidé publie « ~10 j » de coût annuel pour
  la dette C là où sa propre formule donne **10,67 heures**. Les trois autres lignes sont
  en heures et exactes. Conséquence : C s'amortit en 2,25 ans, pas 0,30, donc elle passe
  derrière A et l'observation « C est celle qu'on sous-estime » ne découle plus du tableau.
  Fix CP9.
- **`python-foundations` (P2)** — `except TypeErreur:` dans la table de traduction :
  `TypeErreur` n'est pas un nom Python (`NameError` vérifié). Fix CP4.

Et un modèle opposable : **`slo-error-budget`** intègre en quatre phrases la notion de
disponibilité dont elle a besoin au lieu de l'exiger. C'est le remède à appliquer aux 20
défauts de prérequis. **`portfolio-github`** est la première leçon du corpus à 5 sur les
quatorze dimensions.

### Correction D2 appliquée à la reprise

L'enquête prérequis (voir `PREREQUIS-ORDRE.md`) prouve que **20 leçons** exigent un prérequis
enseigné plus tard sans le signaler, et que **8 autres** citent un concept postérieur en le
signalant comme aide. L'ancre D2 gelée au CP1 est sans ambiguïté : niveau **1** si « un
prérequis renvoie vers une leçon située après », niveau **4** si le concept non enseigné est
« explicitement signalé comme périphérique ».

Le barème n'a pas été modifié — il a été **appliqué**. Douze des 40 leçons déjà notées étaient
concernées, toutes à D2 = 5. Les deux chiffres sont publiés :

| | avant | après |
|---|---|---|
| moyenne D2 (40 notées) | 5,000 | **4,250** |
| moyenne corpus (40 notées) | 4,802 | **4,748** |

Détail : `design-patterns-intro`, `express-backend`, `interview-preparation`,
`readme-documentation`, `technical-documentation`, `technical-storytelling` passent de 5 à
**1** (P1) ; `api-design-basics`, `api-production-contracts`, `architecture-basics`,
`async-javascript`, `authentication`, `breaking-changes-compatibility` passent de 5 à **4**
(P3, plafond structurel, comportement correct).

Les 16 leçons restantes de la liste seront notées à leur lot. Conséquence attendue : **S2
(≥ 3,70 sur chaque dimension) sera le seuil le plus difficile de V71**, et il ne sera
franchissable qu'après les corrections P1 des CP4→CP9.

---

## Empreintes (snapshot CP0, inchangées)

- HEAD au démarrage V71 : `c8259501dcbf92c9601b9605bb49d5b5762f2bf4`
- corpus des 128 leçons : `edbfecdff1d3e4c320cedd51ede95601fd94750d`
- `data/program.json` : `5ac3da304994c298ab964a4b03e13da336bb8935`
- snapshot par leçon : `docs/v71/SNAPSHOT-CP0.json`
- échantillon aveugle : `docs/v71/ECHANTILLON-AVEUGLE.json` — **graine 20260831**

---

## Lots

| CP | objet | état |
|---|---|---|
| CP0 | audit forensique + snapshot + rapport | **terminé** |
| CP1 | contrat académique gelé, ancres D1→D14, seuils READY | **terminé** |
| CP2 | standard humain + archétypes + règles anti-template | **terminé** |
| CP3 | lecture et notation des 128 + ledger initial | **en cours — 48/128** |
| CP4 | P0+P1 fondations / systèmes / cloud / Kubernetes | à faire |
| CP5 | P0+P1 frontend / CSS / React / Next.js | à faire |
| CP6 | P0+P1 web / backend / API / SQL / data | à faire |
| CP7 | P0+P1 ML / IA appliquée / LLM / RAG / agents | à faire |
| CP8 | P0+P1 architecture / perf / sécurité / observabilité / incidents | à faire |
| CP9 | P0+P1 carrière / Git / pratiques pro / documentation | à faire |
| CP10 | passe transversale PRATIQUE (128) | à faire |
| CP11 | passe corrections + vulgarisation + jargon + prérequis | à faire |
| CP12 | validation factuelle et assertions exécutables | à faire |
| CP13 | audit aveugle (32 leçons, graine 20260831) | à faire |
| CP14 | tests négatifs + gauntlet + budget temps | à faire |
| CP15 | notation finale 128×14 + rapport + recommandation V72 | à faire |

## Commits V71

- CP0 : `1fb8ea6`
- CP1 : `5472c2c`
- CP2 : `b3e4592`
- CP3 lot 1 : `b3c9489` · lot 2 : `2440c0b` · lot 3 : `237ded7` · lot 4 : `6d79aa0` ·
  lot 5 : `aebbdaa`
- reprise après perte de conteneur + enquête prérequis : `44747e5`
- CP3 lot 6 : ce commit
