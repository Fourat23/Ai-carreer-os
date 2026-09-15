# V77 · CP3 — TERMINAL : UN USAGE, PAS UNE RÉUSSITE

> **Politique retenue : `USAGE_ONLY`.** Le terminal écrit désormais un fait, et
> ce fait ne dit qu'une chose : *quelque chose a eu lieu*. Il ne dit jamais que
> quelque chose a réussi.

---

## 1. Ce que le CP0 avait mesuré, et pourquoi la réponse n'allait pas de soi

Le CP0 a mesuré **les deux moitiés** du problème du terminal, et elles tirent en
sens contraire.

**Le terminal exécute vraiment.** Sonde `A4` : `exitCode 0`, **263 octets** de
sortie, commande allowlistée dans un bac à sable, workspace éphémère supprimé
après coup. Ce n'est pas une maquette.

**Et le terminal n'observe aucune réussite.** Ses trois tâches ne portent
**aucun critère de réussite pédagogique**, et leurs arguments sont des
**énumérations fermées**. Mesuré sur la source, pas supposé :

```
term-list-files · argumentSchema : [{ name: "format", kind: "flag",
                                      values: ["-1", "-l", "-la"] }]
```

Trois options, toutes valides. La description de la tâche dit d'elle-même
« démonstration d'exécution bornée ».

> **Un apprenant qui choisit `-la` parmi trois options valides n'a rien
> démontré.**

Écrire `TerminalAttempt(success = true)` aurait donc fabriqué un **verdict
pédagogique** là où le produit n'observe qu'un **usage**. C'est nommément
interdit par le contrat gelé du CP1, et c'est le piège de Goodhart que V77 a
pour mission d'éviter : *améliorer la couverture en inventant du sens.*

## 2. Pourquoi écrire quelque chose, alors

Parce que `NO_FACT` laisserait sans réponse une question que V78 posera
d'humains réels :

> « ce participant a-t-il pratiqué au terminal, ou n'y est-il jamais allé ? »

C'est une question d'**usage**, pas de réussite. Un pilote qui ne peut pas
distinguer « a essayé » de « n'est jamais venu » perd du contexte réel sur ce
qu'il observe — et il le perd en silence.

Le contrat gelé (§3.4) autorise exactement cela, sous **cinq contraintes** qui
empêchent l'événement d'usage de devenir de la télémétrie déguisée en
pédagogie. Voici comment chacune est tenue, et **par quoi elle est vérifiée**.

| # | contrainte gelée | tenue par | vérifiée par |
|---|---|---|---|
| 1 | champ **séparé** de l'état | `usageEvents`, hors des huit faits pédagogiques | `emptyFlat` / round-trip disque |
| 2 | **jamais** d'`EVIDENCE` | la commande ne construit aucune preuve | « n'écrire un usage ne modifie QUE `usageEvents` » |
| 3 | **aucun** moteur | aucun moteur n'importe le module ni ne lit le champ | test de dépendance sur 5 moteurs |
| 4 | borné, exportable, supprimable | `MAX_USAGE_EVENTS = 5 000`, export/import | test de plafond + aller-retour de sauvegarde |
| 5 | jamais `passed`/`success`/`outcome`/`score` | `detail` construit par **liste blanche** | `CHAMPS_INTERDITS`, vérifié champ par champ |

### 2.1 Le détail est une liste blanche, pas un filtre

Recopier l'objet reçu **en retirant** les champs interdits laisserait passer
tout ce qu'on n'a pas pensé à interdire. `normalizeUsageEvent` ne garde donc que
ce qu'on a décidé d'observer, nommément : `adapter`, `exitCode`, `durationMs`,
`disponible`. Un `score` envoyé par un appelant futur n'entre pas ; un
`maitrise: 0.9` non plus, alors qu'aucune liste noire ne l'attendait.

### 2.2 `exitCode` est enregistré sans être interprété

`0` ne veut pas dire « réussi ». Il veut dire que le processus s'est terminé
sans erreur. Le fait porte l'observation et **aucune conclusion** ; `usageDe()`
rend `vautReussite: false` explicitement, et sa phrase le dit en toutes lettres :
« usage constaté, aucune réussite mesurée ».

## 3. La chaîne réelle, mesurée en HTTP

Le défaut P7 de V75 a été payé pour avoir cru des tests unitaires qui
n'appelaient jamais la persistance. La chaîne a donc été traversée **en vrai**,
serveur de production lancé, progression dans un fichier hors du dépôt.

```
POST /api/terminal/term-list-files  { action: "run", args: { format: "-la" } }
  → run.exitCode 0 · run.durationMs 7

progression écrite :
  usageEvents : [{ at: "2026-09-15T09:09:11.615Z", surface: "terminal",
                   action: "run", ref: "term-list-files",
                   detail: { adapter: "local", exitCode: 0, durationMs: 7 },
                   provenance: { producer: "terminal-route",
                                 method: "POST /api/terminal/[taskId] action=run" },
                   schemaVersion: 1 }]
  evidence : 0   ·   exerciseAttempts : 0   ·   recallAttempts : 0

GET /api/progress/export  → export usageEvents : 1 (ref: term-list-files)
```

**Un usage. Zéro preuve. Zéro fait pédagogique.** C'est exactement la politique
`USAGE_ONLY`, observée sur le produit et non dans un test.

## 4. LE DÉFAUT TROUVÉ EN CHEMIN : la **quatrième** liste blanche

C'est la découverte du checkpoint, et elle ne concerne pas le terminal.

Le store filtre les champs à trois endroits — `flatOf` (écriture),
`activeTrackProgress` (lecture), `emptyFlat` (état vide). V75 a payé le défaut
`P7` pour en avoir oublié un ; V76 l'a rappelé en commentaire. En branchant
`usageEvents`, j'ai vérifié le chemin d'export et **trouvé un quatrième
filtre**, invisible depuis le store : `validateStrict`, dans `lib/backup.mjs`,
reconstruit la progression importée champ par champ et ne connaissait que
`startDate`, `days`, `skills`, les deux revues et `missions`.

**Mesuré avant correction**, sur un aller-retour export → import :

| fait | exporté | réimporté |
|---|---|---|
| `recallAttempts` | 1 | **0** |
| `hintViews` | 1 | **0** |
| `usageEvents` | 1 | **0** |

L'export était **fidèle** ; la restauration était **muette**. Les quatre faits
introduits depuis V66 — tentatives de rappel, d'exercice, de transfert, aides
consultées — **ne survivaient pas à leur propre sauvegarde**, et le registre de
preuves était alors reconstruit depuis `days[*].evidence`, ce qui perd toute
preuve sans journée (transfert, mission) tout en ressemblant à une restauration
réussie.

### 4.1 La correction : énumérer les faits une seule fois

Ajouter `usageEvents` à trois endroits sur quatre aurait rejoué `P7` une
troisième fois. La liste des faits vit donc désormais dans **une seule
fonction**, `normaliserLesFaits`, que les **quatre** sites appellent.
`FAITS_DU_PRODUIT` en publie l'énumération.

C'est une liste blanche bornée : un fichier importé n'y gagne **aucun droit**
d'écrire ce que les normaliseurs refusent — vérifié par un test qui importe une
sauvegarde contenant une surface hors vocabulaire et un fait sans provenance, et
constate qu'un seul des trois entre. Le seul changement est qu'on cesse de
**jeter** ce que les normaliseurs acceptent.

### 4.2 Deux règles de porte réécrites — et pourquoi ce n'est pas un affaiblissement

Le regroupement a fait rougir deux règles qui tenaient une **disposition de
code**, pas une propriété :

- `[B7]` de `v76:check` : « `hintViews` apparaît entre `function flatOf` et
  `function activeTrackProgress` » ;
- `[A5]` de `v75:check` : idem pour `transferAttempts` et `curriculumPause`.

Le commentaire de `[B7]` raconte déjà que sa **première** version comptait des
occurrences et ne disait rien de leur emplacement. Sa deuxième version pinçait
l'emplacement — et a rougi pour une amélioration qui rend `P7` structurellement
impossible. *Une assertion de texte tient une convention, jamais un
comportement.* C'est la leçon que V76 a payée deux fois.

Les deux règles **exécutent maintenant le store** : écrire, sérialiser, relire,
et regarder si le fait est encore là. Vérifié par mutation avant de conclure —
en retirant `transferAttempts` de l'énumération :

```
v75:check  ❌  [A5] `transferAttempts` survit à l’écriture PUIS à la relecture
               [A5] `transferAttempts` existe dans l’état vide
v76:check  ❌  [B7] le fait `transferAttempts` traverse les listes blanches du store
```

`[B7]` garde désormais **les six faits**, là où elle n'en gardait qu'un : elle
attrape une régression sur `transferAttempts` qu'elle laissait passer avant.
Les deux harnais de mutation (`scripts/v76-negative.sh` N11,
`scripts/v75/cp14-mutations.mjs` M15, `scripts/v76/cp14-mutations.mjs` M25)
visaient un texte qui n'existe plus : laissés tels quels, ils auraient appliqué
un remplacement **sans effet** et conclu à tort que les portes tiennent. Ils
visent maintenant la déclaration unique. `v76:negative` : **11 règles vues
échouer, 0 trou**.

## 5. Ce que ce checkpoint N'A PAS fait

- **Aucun `TerminalAttempt`.** Aucune surface n'a gagné une réussite fabriquée.
- **Aucune preuve** n'est née d'une exécution de terminal.
- **Aucun moteur** n'a changé : compétence, rétention et récupération ignorent
  `usageEvents`, et un test de dépendance le garde.
- **`pipelines` n'a pas été branché.** Le vocabulaire `SURFACES_USAGE` l'accepte
  — le CP1 l'a tranché ainsi — mais la route n'émet rien : ce sera le CP7, avec
  sa propre justification. Ouvrir le vocabulaire n'écrit pas un fait.
- **Le nombre de surfaces observées n'a pas été « amélioré ».** Le terminal
  passe de « rien » à « un usage », pas à « une pratique validée ».

## 6. Vérifications

| vérification | résultat |
|---|---|
| `tests/v77-usage-event.test.mjs` | **21 / 21** |
| `npm test` | **2024 / 2024** |
| `npx tsc --noEmit` | **0 erreur** |
| `npx next build` | **OK** |
| `npm run gates:active` | **49 portes, 0 violation** |
| `bash scripts/v76-negative.sh` | **11 règles vues échouer, 0 trou** |
| chaîne HTTP réelle | 1 usage écrit · 0 preuve · 0 fait pédagogique · export fidèle |
| `data/progress.json` | **absent** (progression de sonde hors dépôt) |

## 7. Ce qui reste incertain, et le restera

**Un usage ne dit pas qu'on a appris.** Il ne dit même pas qu'on a essayé
sérieusement : ouvrir une tâche et lancer `ls` trois fois produit trois
événements. Le fait répond à **une** question — « cette surface a-t-elle été
utilisée ? » — et V78 ne devra pas lui en faire dire une seconde.

**La dette `D7` n'est pas soldée**, elle est entamée : cinq des six surfaces qui
calculent sans rien garder restent muettes. `kubernetes`, `cloud-lab`,
`cloud-foundations` et `security` relèvent du CP7 ; `pipelines` aussi, avec sa
politique propre.

**Une question ouverte pour le CP7** : le terminal et les pipelines partagent le
vocabulaire `USAGE_ONLY`, mais pas la même raison. Le terminal n'a **aucun
critère** ; le pipeline en a un, objectif, qui mesure **la fixture et non la
personne**. Deux chemins différents vers le même fait pauvre — il faudra que le
CP7 le dise explicitement plutôt que de laisser croire à une symétrie.
