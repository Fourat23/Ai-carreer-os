# V77 · CP14 — TRENTE-SIX MENSONGES, ZÉRO SURVIVANT

> Le harnais ne mesure pas si le produit est bon. Il mesure si **les gardes le
> verraient devenir mauvais** — la seule question qu'une suite de tests puisse
> honnêtement se poser sur elle-même.

---

## 1. Le résultat

```
36 mutations jouées · 36 vues échouer · 0 survivante
26 familles · 11 grands thèmes
```

Chaque mutation est un mensonge **plausible** : le genre de ligne qu'on
écrirait de bonne foi, un vendredi soir, pour simplifier. Le détail est publié
dans `docs/v77/cp14-mutations.json`.

| thème | mutations | ce qui serait devenu faux |
|---|---|---|
| l'usage devient une réussite | `M01`–`M03` | un `TerminalAttempt` déguisé |
| le fait perd le disque (P7, 4 listes) | `M04`–`M07` | un fait écrit, puis silencieusement perdu |
| cinq échecs redeviennent une trace | `M08`–`M10` | la courbe d'apprentissage disparaît |
| l'issue est reçue au lieu d'être dérivée | `M11`–`M13` | le jugé se juge lui-même |
| la mission se redéclare réussie | `M14`–`M18` | un clic vaut une démonstration |
| le capstone redevient une déclaration | `M19`–`M21` | une correction serveur archivée `self` |
| une page vue devient un travail | `M22`–`M26` | analyser la fixture compte |
| l'ambiguïté est devinée | `M27`–`M29` | 125 résolus par heuristique |
| la qualification redevient généreuse | `M30`–`M32` | `DECLARED` crédite une compétence |
| filiation et comptage | `M33`–`M34` | l'usage additionné au travail |
| **la porte elle-même** | `M35`–`M36` | une porte décorative |

## 2. Deux survivantes, et ce qu'elles ont appris

Le premier passage a donné **34/36**. Les deux survivantes étaient de vrais
trous **dans mes propres tests**, pas dans le produit.

### `M01` — un test qui dérivait ses attentes de la chose testée

```js
for (const champ of CHAMPS_INTERDITS) { assert.equal(champ in e.detail, false); }
```

Vider `CHAMPS_INTERDITS` rendait ce test **vert avec zéro assertion**. La boucle
tournait à vide et personne ne le voyait.

> Un test qui dérive ses attentes de la chose qu'il teste ne teste rien.

C'est la même famille de défaut que V76 a payée deux fois (une assertion qui
n'atteint pas la branche qu'elle croit garder), sous une forme nouvelle. Corrigé
en **pinant la liste en clair** ET en vérifiant les champs un par un.

### `M10` — l'ordre du texte ne suffit pas

Le test du CP4 vérifiait que `RECORD_ASSESSMENT_ATTEMPT` apparaît **avant**
`if (body.record !== true)`. Mais glisser une condition **à l'intérieur** du bloc
d'écriture laisse l'ordre intact et rétablit pourtant la dissymétrie corrigée au
CP4 — n'observer que les tentatives que l'apprenant conserve.

La première version de la mutation ne mutait d'ailleurs rien du tout : elle a été
**réécrite** pour être un vrai mensonge, et le test renforcé pour vérifier la
propriété plutôt que la disposition :

> rien qui parle de `record` ne se tient entre la correction et l'enregistrement.

## 3. La porte `v77:check`

**146 vérifications**, ajoutée à `gates:active` — qui passe donc de 49 à **50
portes**.

Elle garde ce qui se dégrade **sans casser** :

| règle | ce qu'elle empêche |
|---|---|
| `A1` | un module « pur » se met à lire le disque |
| `A2` | un fait perd une de ses **quatre** listes blanches — **exécutées**, pas lues |
| `A3` | un usage se met à porter une issue |
| `A4` | une analyse enregistrée **sans artefact** |
| `A5` | la matrice des preuves se contredit (192 lignes, vérifiées entièrement) |
| `A6` | une mission se redéclare réussie · les 42 maillons faibles re-mesurés |
| `A7` | une commande de V77 disparaît, ou expose une issue |
| `A8` | un moteur apprend à lire un fait qui ne le concerne pas |
| `A9` | une mesure publiée cesse de correspondre au code |
| `A10` | un score apparaît |
| `A11` | le contrat gelé ou la carte des surfaces s'altère |
| `A12` | `data/progress.json` entre dans le dépôt |
| `A13` | **autotest** — la porte sait-elle rougir ? |

### 3.1 Elle exécute le produit, elle ne lit pas du texte

Les règles décisives **importent les modules et les font tourner** : `A2`
traverse `writeActiveTrack` → sérialisation → `activeTrackProgress` →
`serializeBackupV3` → `parseBackupV3`. `A5` parcourt les 192 lignes de la
matrice. `A4` appelle le normaliseur.

C'est la leçon que V76 a payée deux fois, et que le CP3 a rappelée en réécrivant
`[B7]` et `[A5]` des portes V76 et V75 : *une assertion de texte tient une
convention, jamais un comportement.*

### 3.2 Elle ne se juge pas elle-même

V76 · CP14 a mesuré que deux mutations de règles avaient **survécu** parce
qu'elles étaient vérifiées en lançant la porte : *une porte ne peut pas détecter
sa propre neutralisation en se lançant elle-même.*

`tests/v77-gate.test.mjs` est le **juge externe**. Il vérifie que la porte sait
rougir (`V77_SELFTEST=1` → sortie non nulle nommant `[A13]`), qu'elle compte un
nombre plausible de vérifications — un garde-fou contre le vidage progressif — et
qu'elle est bien déclarée dans `gates:active`.

Les mutations `M35` et `M36` (`if (false && violations.length)`, `check()`
réduit à un no-op) sont jugées **par lui**, jamais par la porte. Les deux sont
vues.

### 3.3 Une mutation dont le motif a disparu est REFUSÉE

Le CP3 avait trouvé que les harnais de V75 et V76 visaient des lignes qui
n'existaient plus : la mutation s'appliquait **sans effet** et concluait à tort
que la garde tenait. Ce harnais refuse plutôt que de conclure :

```
⚠️  Mxx — MOTIF INTROUVABLE dans <fichier> (mutation NON appliquée)
```

et le rapport le porte comme un verdict distinct de « vue » et de « survivante ».

## 4. Le gantelet complet

| étape | résultat |
|---|---|
| `npm test` | **2177 / 2177** |
| `npx tsc --noEmit` | **0 erreur** |
| `npx next build` | **OK** |
| `npm run gates:active` | **50 portes, 0 violation** |
| `v74:check` · `v75:check` · `v76:check` · `v77:check` | ✅ ✅ ✅ ✅ |
| `bash scripts/v76-negative.sh` | **11 règles vues échouer, 0 trou** |
| `node scripts/v77/cp14-mutations.mjs` | **36 / 36 vues, 0 survivante** |
| `data/progress.json` | **absent** |

**`v73:check` n'a pas été lancé, et n'a pas été créé.** Le brief le suppose ; le
CP0 a mesuré qu'il n'a jamais existé dans ce dépôt. En fabriquer un pour faire
correspondre la réalité au document serait la pire façon de « corriger » un
écart — un test du juge externe vérifie qu'il n'a pas été inventé.

## 5. Ce que ce checkpoint ne prouve pas

**Que les gardes couvrent tout.** 36 mensonges vus, ce sont 36 mensonges
**auxquels j'ai pensé**. Une mutation qu'on n'écrit pas ne survit pas : elle
n'existe pas dans le rapport, et son absence n'est pas une preuve d'absence de
trou.

**Que le produit est pédagogiquement juste.** Aucune mutation ne pose cette
question, et aucune ne le pourrait. Le gantelet garde la manière d'observer, pas
la valeur de ce qui est observé.
