# V76 · CP14 — Sécurité rejouée, porte V76, gantelet de mutations

> Rejouables : `node scripts/v76/cp0-security.mjs` (16 sondes d'attaque) ·
> `npm run v76:check` (79 vérifications) · `npm run v76:negative` (11 cas) ·
> `node scripts/v76/cp14-mutations.mjs [lot]` (33 mutations) · résultats bruts :
> `docs/v76/cp0-security.json`, `docs/v76/cp14-mutations.json`.

## 1 · Les seize sondes d'attaque, rejouées après tout

Le CP0 en avait mesuré **11 contenues sur 16**. Le CP5 avait fermé les cinq
évasions. Le CP14 les rejoue sur le produit tel qu'il est après onze
checkpoints.

| # | menace | résultat | observation |
|---|---|---|---|
| S1 | boucle infinie | ✅ | 5 106 ms puis coupure |
| S2 | inondation de `stdout` | ✅ | réponse bornée à 4 Ko |
| S3 | traversée `../../` | ✅ | 400 |
| S4 | chemin absolu | ✅ | 400 |
| S5 | secrets d'environnement | ✅ | 2 variables transmises, aucune sensible |
| S6 | **lecture du disque hôte** | ✅ | bloqué |
| S7 | **création de processus** | ✅ | bloqué |
| S8 | **réseau sortant / SSRF** | ✅ | bloqué |
| S9 | modification d'un test CACHÉ | ✅ | aucune tentative enregistrée |
| S10 | charge de 10 Mo | ✅ | 400 en 134 ms |
| S11 | trop de fichiers | ✅ | 400 |
| S12 | nom de fichier malveillant | ✅ | 400 |
| S13 | brouillon compté comme tentative | ✅ | 55 → 55 |
| S14 | action inconnue | ✅ | 400 |
| S15 | **écriture hors bac à sable** | ✅ | refusée |
| S16 | **lecture de la solution d'un autre exercice** | ✅ | bloqué |

**16 / 16 contenues.** Aucune régression depuis le CP5.

### La limite, toujours déclarée

`SEC3` reste **partiel** en Python : un processus enfant peut naître, mais dans
la même racine minimale, sans réseau et sans privilège sur l'hôte. C'est écrit
dans `lib/sandbox.mjs`, gardé par un test, **et désormais par la porte** — la
mutation `M03` (`SEC3: 'total'`) meurt sur la règle `[B4]`.

## 2 · La porte `v76:check`

**79 vérifications**, branchée dans `gates:active` (48 → **49 portes**). Elle ne
duplique pas les tests : elle garde ce qui **se dégrade sans rien casser**.

| bloc | ce qu'il tient |
|---|---|
| `B1` | les six modules purs de V76 le restent — et `workspace-conflit.mjs` n'importe aucun module Node, puisqu'un composant client le charge |
| `B2` | les **trois** points d'exécution passent par `execIsole`, et le seul spawn direct vit à l'intérieur de la frontière |
| `B3` | aucun repli vers l'hôte ; `ligneDeCommande` **jette** sur le mode `HOTE` ; les six runtimes exigent une frontière isolée |
| `B4` | `SEC3` reste `partiel` en Python, les quatre autres restent `total`, et `PERMISSION_NET` tient les cinq |
| `B5` | la vue publique des défis ne revient pas en arrière, et le type l'impose |
| `B6` | une réussite n'écrit qu'une preuve (`canonicalSourceId`) |
| `B7` | `hintViews` traverse les **trois** listes du store, chacune vérifiée par son corps de fonction |
| `B8` | aucun `RESET` n'efface un fait, `RESET_EXERCISE` n'existe pas, le journal vit hors de l'espace de travail |
| `B9` | le journal ne devient pas une fuite (publics seulement, éditables seulement, ni attendu ni reçu) |
| `B10` | la surface ne se corrige jamais seule et ne propose jamais d'écraser |
| `B11` | le vocabulaire du diagnostic reste fermé, `BORNE` n'est pas réintroduite |
| `B12` | l'aide ne devient pas une note |
| `B13` | 376 exercices, aucun runtime SQL ou HTTP inventé, aucun identifiant en `lab-` |
| `B14` | les limites déclarées restent écrites |
| `B15` | `data/progress.json` n'existe pas, `data/lab-journals/` est ignoré |
| `B16` | **la porte sait échouer** — voir §4 |

### Deux règles étaient décoratives, et c'est le script négatif qui l'a dit

`scripts/v76-negative.sh` casse **une vraie règle à la fois** et vérifie que la
porte la voit. Au premier passage : **2 trous sur 11**.

| trou | pourquoi la règle ne voyait rien |
|---|---|
| `B2` — « les trois points d'exécution » | La règle comptait les `execIsole(` et exigeait `>= 3`. Le fichier en contient **quatre** : la définition de la fonction, plus trois appels. Neutraliser un appel en laissait trois, et la règle restait verte pendant qu'un runtime entier repassait par un spawn direct. *Un seuil calculé sur un total qui inclut la définition ne mesure pas ce qu'il croit mesurer.* |
| `B7` — « `hintViews` dans les deux listes blanches » | La règle comptait les occurrences dans le fichier et exigeait `>= 3`. Il y en a cinq ; en supprimer une de la liste de LECTURE en laissait trois. C'est-à-dire **exactement le défaut P7 de V75 que cette règle prétend garder**. *Compter des occurrences dans un fichier ne dit rien de l'endroit où elles se trouvent.* |

Les deux règles regardent désormais la **structure** : les appels par leur
forme `await execIsole({`, et chaque liste blanche par **son corps de
fonction**. **11 / 11 règles vues échouer, 0 trou.**

## 3 · Le gantelet : 33 mutations, 33 tuées

Trois niveaux de défense, et le choix du niveau fait partie du résultat :

| garde | n | ce qu'il prouve |
|---|---|---|
| `test` | 13 | un comportement a changé |
| `gate` | 13 | une propriété structurelle s'est dégradée sans rien casser |
| `sonde` | 5 | **ce qu'aucune lecture de source ne peut prouver** — produit reconstruit et servi |
| `autoporte` | 2 | la porte elle-même |

| # | famille | mutation | garde | tuée par |
|---|---|---|---|---|
| M01 | lecture du disque hôte | un point d'exécution contourne la frontière | `gate` | `[B2]` |
| M02 | repli vers l'hôte | le mode hôte devient un repli silencieux | `gate` | `[B3]` |
| M03 | `SEC3` maquillé | le produit ment sur son isolation Python | `gate` | `[B4]` |
| M04 | runtime sans frontière | 101 exercices Python repassent sur l'hôte | `gate` | `[B3]` |
| M05 | écriture hors bac à sable | `PERMISSION_NET` cesse de tenir l'écriture | `gate` | `[B4]` |
| M06 | fuite de correction | `answer` revient dans la charge utile | `test` | CP8 |
| M07 | le client se corrige seul | le message honnête disparaît | `test` | CP8 |
| M08 | tests cachés journalisés | les résultats privés entrent au journal | `test` | CP10 |
| M09 | fichiers cachés journalisés | un test caché finirait archivé puis relu | `test` | CP10 |
| M10 | attendu archivé | l'attendu d'un test entre au journal | `test` | CP10 |
| M11 | brouillon périmé qui écrase | la vérification de révision devient décorative | `sonde` | `cp9:P5` |
| M12 | écriture avant vérification | le fichier est écrasé avant le 409 | `sonde` | `cp9:P5` |
| M13 | révision horodatée | deux sauvegardes identiques deviennent un conflit | `test` | CP9 |
| M14 | refus invisible | la surface n'annonce plus rien | `test` | CP9 |
| M15 | `RESET` destructeur | la réinitialisation efface l'histoire d'un échec | `gate` | `[B8]` |
| M16 | `RESET_EXERCISE` inventé | la sémantique gelée comme inexistante est créée | `gate` | `[B8]` |
| M17 | journal effaçable | le journal rejoint ce qu'un `RESET` balaie | `gate` | `[B8]` |
| M18 | échec non persisté | **le défaut V74 · CP0 ressuscité** | `sonde` | `cp11:I1 I8` |
| M19 | preuve dupliquée (route) | le double comptage du CP11 revient | `gate` | `[B6]` |
| M20 | preuve dupliquée (moteur) | le moteur ignore le nom du fait | `test` | CP14 |
| M21 | registres hérités non réparés | les doublons déjà écrits restent comptés deux fois | `gate` | CP11 |
| M22 | fusion qui perd une preuve | la réparation devient une suppression | `test` | CP11 |
| M23 | provenance perdue | une réussite après aide cesse d'en être une | `gate` | `[B12]` |
| M24 | aide devenue une note | un score fabriqué apparaît | `gate` | `[B12]` |
| M25 | fait perdu par liste blanche | **le défaut P7 de V75 rejoué** sur `hintViews` | `gate` | CP7 |
| M26 | reprise qui écrase l'historique | chaque lancement remplace tout l'historique | `test` | CP10 |
| M27 | tentative masquée | une tentative sans code se prétend conservée | `test` | CP10 |
| M28 | compteurs venus du journal | le journal fait autorité sur le fait | `test` | CP10 |
| M29 | régression masquée | un test cassé n'est plus signalé | `test` | CP10 |
| M30 | comparaison inversée | un progrès se lit comme une régression | `sonde` | `cp10:H13` |
| M31 | journal non écrit | plus aucune comparaison possible | `sonde` | `cp10:H5…H13` |
| M32 | la porte ne compte plus | la porte rend vert quoi qu'il arrive | `autoporte` | CP14 |
| M33 | la porte n'enregistre plus | chaque vérification devient un no-op | `autoporte` | CP14 |

**33 appliquées, 33 tuées, aucune protection affaiblie pour y parvenir.**

## 4 · La porte testée par mutation — et ce que ça a appris

Le brief l'exige : *« TESTER LA PORTE V76 ELLE-MÊME PAR MUTATION. »* Deux
mutations, `M32` et `M33`. **Les deux ont survécu au premier passage.**

Il n'y avait rien d'étonnant à cela, et c'est tout l'intérêt : on les vérifiait
en lançant `npm run v76:check`, c'est-à-dire **en demandant à la porte si elle
allait bien**. Avec `if (false && violations.length)`, elle sort en 0 et se
déclare satisfaite. Avec un `check()` vidé, elle n'a rien à déclarer.

> **Une porte ne peut pas détecter sa propre neutralisation en se lançant
> elle-même.** Il lui faut un juge extérieur.

Ce juge est `tests/v76-gate.test.mjs`, qui ne vérifie pas que la porte est
verte — n'importe quel `exit 0` y suffirait — mais qu'elle **sait rougir** :
`V76_SELFTEST=1` lui impose une violation, et elle doit sortir en erreur **en la
nommant**. Les deux mutations meurent maintenant dans `npm test`.

Le crochet est gardé à son tour : un test vérifie qu'il ne fait qu'**ajouter**
une règle, qu'il n'altère pas le déroulement de la porte, et qu'il n'existe
qu'à un seul endroit du code.

## 5 · Trois mutations ont survécu en chemin, et les trois enseignent

**`M26` — « chaque lancement remplace tout l'historique ».** Quatre de mes tests
sont restés verts : l'idempotence tient avec une seule entrée, la borne par
nombre aussi, la borne par octets encore mieux. **Aucun ne disait la chose la
plus simple : un journal sert à en garder plusieurs.** C'est la troisième fois
de ce sprint qu'une propriété évidente n'est tenue par personne précisément
parce qu'elle va de soi.

**`M18`, `M30`, `M31` — trois faux « survivants ».** Ils ont été déclarés
survivants à tort, et la raison est plus instructive que la mutation :

- un serveur resté vivant d'une exécution **tuée pour épuisement mémoire**
  tenait encore le port. Le nouveau `next start` échouait sur `EADDRINUSE`, et
  les sondes interrogeaient donc **du code non muté** ;
- `M31` (« le journal n'est plus écrit ») a survécu une seconde fois parce que
  les entrées des exécutions précédentes étaient encore sur le disque : la
  mutation empêche d'**écrire** un journal, pas d'en **lire** un ancien.

Un faux négatif de gantelet est exactement ce que ce checkpoint existe pour
empêcher. Le harnais vérifie désormais que le serveur interrogé est **bien celui
qu'il vient de lancer**, efface l'état avant chaque sonde, et distingue
`SONDE INVALIDE` d'une mutation tuée comme d'une survivante — **on ne sait pas**
est un troisième verdict, et le confondre avec un succès serait pire que ne rien
mesurer.

C'est la septième anomalie de sonde du sprint, et la même famille que la n° 6 :
*le dispositif de mesure mesurait son propre état, pas le produit.*

## 6 · Les 32 familles du brief, et où chacune est gardée

| famille demandée | gardée par |
|---|---|
| lecture du disque hôte · `/etc/passwd` | `S6` · `M01` · `[B2]` |
| écriture hors bac à sable | `S15` · `M05` · `[B3]` |
| création de processus · `child_process` | `S7` · `M02` · `[B3]`/`[B4]` |
| injection shell | `S7` + `ligneDeCommande` sans shell (`[B3]`) |
| SSRF loopback · API interne · réseau externe | `S8` · `M04` |
| boucle infinie | `S1` |
| inondation de sortie | `S2` |
| fichier énorme · trop de fichiers | `S10` · `S11` |
| traversée · chemin absolu · nom malveillant | `S3` · `S4` · `S12` |
| fuite de correction | `S16` · `M06` · `[B5]` |
| tests cachés | `S9` · `M08` · `M09` · `[B9]` |
| fuite de réponse de transfert | `M06` · `M07` · `[B5]` |
| brouillon périmé | `M11` · `M12` · `cp9:P5` |
| soumission en double | `M20` · `cp11:I3` |
| reprise qui écrase l'historique | `M26` |
| échec non persisté | `M18` · `cp11:I1` |
| preuve dupliquée | `M19` · `M20` · `M21` · `[B6]` |
| `DRAFT == ATTEMPT` | `S13` · `cp9:P2` |
| provenance perdue | `M23` · `[B12]` |
| `RESET` destructeur | `M15` · `M16` · `M17` · `[B8]` |
| transfert == maîtrise | `cp11:I10` (fait distinct) |
| `progress.json` créé | `[B15]` · `cp11:I12` |
| runner non déterministe | `M13` (révision horodatée) · `cp12` (scores identiques) |
| fichier protégé mutable | `cp9:P10` · `M09` |

### Deux familles ne sont pas gardées par une mutation, et c'est dit

- **« transfert == maîtrise »** : le produit n'a jamais établi cette
  équivalence — `TransferAttempt` est un fait distinct, mesuré par `cp11:I10`.
  Fabriquer une mutation pour un chemin qui n'existe pas donnerait une ligne
  verte sans objet ;
- **« runner non déterministe »** : couvert indirectement (`M13`, et les scores
  identiques du CP12 sur les douze parcours), pas par une mutation dédiée.
  Rendre un runner non déterministe demanderait d'introduire une source d'aléa
  dans l'exécution ; la propriété est mesurée, pas mutée. **Écrit ici plutôt que
  compté comme couvert.**

## 7 · Vérifications

| | |
|---|---|
| sondes de sécurité | **16 / 16 contenues** |
| `npm run v76:check` | **79 vérifications, 0 violation** |
| `npm run v76:negative` | **11 règles vues échouer, 0 trou** |
| mutations | **33 appliquées, 33 tuées** |
| `npm test` | **1984 / 1984** |
| `npx tsc --noEmit` | 0 |
| `npx next build` | OK |
| `npm run gates:active` | **49 portes, 0 violation** |
| `data/progress.json` | **absent** |
