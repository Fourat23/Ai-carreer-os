# V76 — CONTRAT DU WORKBENCH, GELÉ

> **Gelé au CP1, avant toute implémentation.** Ce document ne décrit pas ce qui
> serait souhaitable : il fixe ce que les checkpoints suivants n'ont plus le
> droit de renégocier.
>
> **Aucun seuil de ce contrat ne sera affaibli pour faire passer un exercice.**
> C'est la règle qui rend le reste vérifiable.

---

## 0. Ce que ce contrat n'autorise jamais

Douze contournements, nommés maintenant pour ne pas être découverts au CP15.
Chacun est une façon plausible d'obtenir un rapport vert sans avoir résolu quoi
que ce soit.

| # | interdit | pourquoi c'est tentant |
|---|---|---|
| `G1` | **désactiver un runtime pour faire disparaître une faille** | la sonde passe au vert, et 101 exercices meurent |
| `G2` | **appeler `cwd` une sandbox** | c'est exactement l'erreur que le CP0 a trouvée |
| `G3` | **filtrer `stdout` sans isoler le système de fichiers** | la fuite ne passe plus par la sortie, elle passe par le disque |
| `G4` | **masquer une référence côté client sans empêcher sa lecture depuis le runner** | l'interface est propre, le corpus reste lisible |
| `G5` | **faire passer une sonde de sécurité en changeant son texte** | la ligne devient verte sans que rien ne change |
| `G6` | **remplacer un vrai runner par une simulation silencieuse** | tout réussit, plus rien ne mesure |
| `G7` | **supprimer des tests privés pour simplifier l'isolation** | 344 exercices perdent leur verdict non contournable |
| `G8` | **considérer un `HTTP 200` comme un parcours E2E réussi** | le brief l'interdit explicitement |
| `G9` | **appeler un composant « branché » parce qu'il est importé** | l'import n'est pas l'usage |
| `G10` | **déclarer le transfert sécurisé parce que l'interface n'affiche pas la réponse** | « afficher le code source » suffit |
| `G11` | **ne mesurer que les chemins heureux** | un exercice qu'on ne peut pas rater ne mesure rien |
| `G12` | **affaiblir une mutation pour qu'elle rougisse** | on teste alors le test, pas le produit |
| `G13` | **construire `SQL` / `HTTP` pour cocher le brief malgré zéro exercice** | une capacité pour personne |
| `G14` | **remplacer le Workbench existant sans défaut démontré** | le neuf paraît plus moderne, et coûte une régression |

---

## 1. Le vocabulaire, gelé

Quinze termes. Chacun désigne **une seule chose**, et deux d'entre eux — `DRAFT`
et `ATTEMPT` — ne doivent jamais se confondre.

### 1.1 `WORKBENCH`
La surface où l'apprenant travaille : éditeur, fichiers, exécution, tests,
retours, aides. Aujourd'hui `app/lab/[exerciseId]/LabWorkspace.tsx`.
**Un Workbench n'est pas un éditeur** : un éditeur reçoit du texte, un Workbench
exécute, juge, explique et enregistre.

### 1.2 `WORKSPACE`
L'ensemble des fichiers d'un exercice pour un apprenant donné, à un instant
donné. Trois natures, et la distinction est un invariant de sécurité :

| nature | l'apprenant peut… | exemple |
|---|---|---|
| `USER_FILE` | lire et écrire | `solution.mjs` |
| `READ_ONLY_FILE` | lire seulement | `data.mjs` (jeu de données fourni) |
| `HIDDEN_TEST_FILE` | **ni lire ni écrire** | harnais de tests privés |

### 1.3 `DRAFT`
Le contenu courant d'un `USER_FILE`, sauvegardé pour survivre à un
rafraîchissement. **Un `DRAFT` n'est pas un fait d'apprentissage.** Il n'entre
dans aucune projection : ni rétention, ni compétence, ni arriéré, ni plan.

### 1.4 `RUN`
Une exécution réellement lancée du `WORKSPACE` courant contre les tests de
l'exercice. **Un `RUN` a une sémantique explicite** : il matérialise les
fichiers, exécute le harnais dans la frontière d'exécution, capture la sortie et
produit un `TEST_RESULT`.

### 1.5 `ATTEMPT`
Le **fait** persisté qu'un `RUN` a eu lieu — `ExerciseAttempt`, contrat V74/V75 :
horloge serveur, `provenance`, vocabulaire fermé, `schemaVersion`.

> **`DRAFT ≠ ATTEMPT`.** Sauvegarder n'est pas tenter.
> **Tout `RUN` réellement exécuté produit un `ATTEMPT`, qu'il réussisse ou
> échoue.** C'est la dette D1/D2 payée par V74 ; elle ne se rouvre pas.

### 1.6 `SUBMISSION`
Un `ATTEMPT` dont tous les tests passent (`allPassed`). C'est la seule chose qui
autorise une `EVIDENCE`. **Une `SUBMISSION` n'efface jamais les `ATTEMPT`
précédents** : l'historique est append-only.

### 1.7 `TEST_RESULT`
Le résultat structuré d'un `RUN`. **Jamais un texte de terminal à reparser.**

| champ | gelé |
|---|---|
| `status` | `passed` · `failed` · `compile-failed` · `timeout` · `error` |
| `passed` / `total` | entiers, calculés sur **tous** les tests (publics + privés) |
| `allPassed` | dérivé, jamais fourni |
| `results[]` | uniquement les tests **publics** — `{ id, name, ok, expected, received, message }` |
| `privateSummary` | agrégat `{ total, passed }` — **jamais** un nom, un attendu ou un reçu |
| `durationMs` | mesuré |
| `phase` | `compile` · `run` · `test` |
| `stdout` | borné, chemins neutralisés |

### 1.8 `DIAGNOSTIC`
Un fait **observé** sur un `RUN` échoué, déductible sans supposer l'intention :
un symptôme de test (attendu ≠ reçu), une erreur de compilation avec sa ligne,
un dépassement de délai. **Si le test ne permet pas de déduire un symptôme, le
produit ne doit pas en fabriquer un** — un repli honnête est exigé.

### 1.9 `HINT`
Une aide **partielle** qui oriente sans résoudre. Elle ne contient jamais le
code corrigé.

### 1.10 `REMEDIATION`
L'échelle d'aide graduée de V74 · CP7. **Sa dernière marche, et seulement la
dernière, est la correction complète.**

> **Une solution complète n'est jamais la première aide.** Gelé.

### 1.11 `RESET`
Trois sémantiques **distinctes**, à nommer séparément dans l'interface — un
bouton destructeur ambigu est un défaut, pas un raccourci :

| nom | efface | conserve |
|---|---|---|
| `RESET_FILE` | un `USER_FILE` → son contenu de départ | les autres fichiers, l'historique |
| `RESET_WORKSPACE` | **tous** les `USER_FILE` → départ | **l'historique des `ATTEMPT`** |
| `RESET_EXERCISE` | *(n'existe pas et ne sera pas créé)* | — |

> **Aucun `RESET` n'efface jamais un `ATTEMPT`, une `SUBMISSION` ou une
> `EVIDENCE`.** Effacer l'histoire d'un échec est le contournement `R4` de V75.

### 1.12 `SOLUTION_VIEW`
La consultation de la correction. **Elle est enregistrée**, et elle influence la
valeur pédagogique d'une réussite ultérieure : une tentative postérieure à
l'ouverture de la correction reste un contact significatif, **jamais un rappel
actif** (règle `R-b` de V74, déjà implémentée via `correctionSeen`).

> **La réussite après une aide lourde reste une réussite.** Sa **provenance**
> doit le montrer. On n'annule pas un succès ; on ne le maquille pas non plus.

### 1.13 `EVIDENCE`
La preuve canonique V65/V75, produite **uniquement** par une `SUBMISSION`,
idempotente par identité. Elle porte ses `conceptIds` à leur **cardinalité
réelle** (V75 · CP3/CP4).

### 1.14 `PREVIEW`
Le rendu visuel d'un exercice `web` ou `react-tsx`. **Une `PREVIEW` n'est pas un
verdict** : elle montre, elle ne juge pas. Le verdict vient des tests.

### 1.15 `TERMINAL_SESSION`
Une exécution de **tâche déclarée** (`data/terminal-tasks/`), à binaire
allowlisté et argv validé par schéma. **Ce n'est pas un shell libre, et ça ne le
deviendra pas.**

---

## 2. Le modèle de capacités — gelé à partir de l'existant

Le brief l'exige : *« partir du modèle existant, ne pas réinventer une
taxonomie »*. Le modèle **existe déjà** dans `lib/runtime.mjs` et il est
**gelé tel quel** :

```js
capabilities: {
  execution, preview, publicTests, privateTests,
  multiFile, stdin, cancellation, timeout, syntaxHighlighting,
}
```

### Les six runtimes réels, et ce qu'ils déclarent

| runtime | exercices | `execution` | `preview` | `multiFile` | délai | sortie max |
|---|---|---|---|---|---|---|
| `node-js` | **233** | ✅ | — | ✅ | 5 000 ms | 100 000 o |
| `python3` | **83** | ✅ | — | ✅ | 5 000 ms | 100 000 o |
| `python-ds` | **18** | ✅ | — | ✅ | 8 000 ms | 100 000 o |
| `typescript` | **16** | ✅ | — | ✅ | 5 000 ms | 100 000 o |
| `react-tsx` | **15** | — | ✅ `react` | ✅ | 8 000 ms | 100 000 o |
| `web` | **11** | — | ✅ `html` | ✅ | 5 000 ms | 100 000 o |

### Ce qui n'existe pas et ne sera pas créé

| capacité | exercices qui la justifient | décision |
|---|---|---|
| `database` / SQL | **0** | **NE PAS CONSTRUIRE** (`G13`) |
| `http` / constructeur de requêtes | **0** | **NE PAS CONSTRUIRE** (`G13`) |
| `config` (JSON/YAML validé) | **0** en tant que runtime | ne pas construire |
| `text` | **0** | ne pas construire |
| `stdin` | déclaré `false` partout | ne pas construire |

### Les capacités de produit, distinctes des capacités de runtime

Elles ne dépendent pas du langage mais de l'exercice et de la surface. Gelées :

`editor` · `files` · `run` · `tests` · `diagnostics` · `hints` · `remediation` ·
`solution` · `persistence` · `history` · `preview` · `terminal`.

**Règle** : une surface ne doit **jamais** invoquer une capacité que le runtime
ou l'exercice ne déclare pas. Une action inconnue est refusée (`400`), comme
aujourd'hui.

---

## 3. Le contrat de sécurité — le cœur du sprint

Le CP0 a mesuré, contre le produit en marche, **cinq menaces non contenues**
(`T12`–`T16`). Ce qui suit est ce que le CP5 doit atteindre, gelé **avant** de
savoir si ce sera facile.

### 3.1 Les cinq interdits absolus

Formulés comme le brief les demande, sans adoucissement :

| # | interdit | état CP0 |
|---|---|---|
| `SEC1` | **NO HOST FILESYSTEM READ** — le code de l'apprenant ne lit aucun fichier hors de son `WORKSPACE` | ❌ violé (`/etc/passwd` lu) |
| `SEC2` | **NO HOST FILESYSTEM WRITE** — il n'écrit nulle part hors de son `WORKSPACE` | ❌ violé (fichier créé dans le dépôt) |
| `SEC3` | **NO HOST PROCESS EXECUTION** — il ne crée aucun processus | ❌ violé (`execSync('id')` → `uid=0`) |
| `SEC4` | **NO LOOPBACK / INTERNAL NETWORK ACCESS** — il n'atteint ni `localhost`, ni l'API du produit, ni un réseau interne | ❌ violé (`/api/progress` → 200) |
| `SEC5` | **NO ACCESS TO REFERENCE SOLUTIONS** — il ne lit ni `reference`, ni test privé, ni le corpus `data/exercises/` | ❌ violé |

**Exception unique et encadrée** : une capacité qui aurait besoin d'un de ces
accès doit être **explicitement déclarée par l'exercice**, **isolée**, et
**justifiée par écrit**. Aucune n'existe aujourd'hui, et aucune n'est prévue.

### 3.2 Les bornes, gelées

| borne | valeur | source |
|---|---|---|
| délai d'exécution | **5 000 ms** (8 000 pour `python-ds` et `react-tsx`) | existant, mesuré à 5 105 ms |
| sortie capturée | **100 000 octets** par flux | existant |
| taille d'un fichier | **200 000 octets** | existant (`MAX_FILE_BYTES`) |
| taille du workspace | **1 000 000 octets** | existant (`MAX_TOTAL_BYTES`) |
| fichiers par requête | **40** | existant (`MAX_FILES_IN_REQUEST`) |
| processus enfants | **0** au-delà du processus de run lui-même | à imposer au CP5 |
| signal de mise à mort | `SIGKILL` | existant |

**Un runtime peut être plus strict que ce tableau. Jamais plus permissif.**

### 3.3 Frontières

| élément | règle gelée |
|---|---|
| **racine d'exécution** | le répertoire de travail de l'exercice, et **rien au-dessus** — vérifié par résolution de chemin, pas par convention |
| **répertoire courant** | `cwd` est un point de départ. **`cwd` n'est PAS une frontière** (`G2`) |
| **identité** | non-root **si la frontière le permet** ; sinon, la limite est **déclarée** |
| **environnement** | allowlist stricte. Aujourd'hui `PATH` + `NODE_ENV`, et c'est le contrôle le mieux tenu du produit — il est gelé |
| **réseau** | **aucun**, sortant comme loopback |
| **chemins inscriptibles** | les `USER_FILE` de l'exercice, uniquement |
| **chemins en lecture seule** | les `READ_ONLY_FILE` de l'exercice |
| **tests cachés** | **jamais servis au client, jamais inscriptibles**, et invisibles depuis le code exécuté |
| **corpus de corrections** | **hors de portée du processus d'exécution** |
| **nettoyage** | déterministe : chaque `RUN` part d'un état matérialisé connu et ne laisse rien derrière lui |

### 3.4 Docker indisponible — la règle qui ne se négocie pas

> **Si une frontière d'exécution n'est pas disponible, le runtime concerné est
> déclaré indisponible. Il n'y a jamais de repli silencieux vers l'exécution
> hôte.**

Le modèle existe déjà dans `lib/terminal-docker.mjs`, qui renvoie le statut
`unavailable` plutôt que de simuler un succès. **Ce comportement est gelé et
étendu.**

Et sa conséquence, écrite d'avance pour ne pas être découverte au CP15 :

> **Un chargeur restrictif Node ne protège pas Python.** Un `import os` ne
> traverse aucun crochet JavaScript. Si aucune frontière n'est disponible pour
> Python, **les 101 exercices Python seront déclarés non isolés** — écrit, pas
> laissé croire (`G1` interdit de les désactiver pour faire disparaître la
> ligne rouge).

---

## 4. Ce qui ne doit pas régresser

Le CP0 a mesuré des choses qui **fonctionnent déjà**. Elles deviennent des
invariants : un CP qui les casse a échoué, quel que soit son apport.

| # | invariant | mesure CP0 |
|---|---|---|
| `I1` | la boucle complète fonctionne sur les six runtimes | **12/12** parcours réels |
| `I2` | un échec est **persisté** | 12/12 |
| `I3` | une réussite produit une **preuve** | 12/12 |
| `I4` | `DRAFT ≠ ATTEMPT` | `save` : 36 → 36 tentatives |
| `I5` | l'anti-fuite du laboratoire tient | `reference`, `expected`, noms de tests privés : aucun ne sort |
| `I6` | la première aide n'est jamais la correction | échelon `1` sur 12/12 |
| `I7` | un fichier protégé est refusé | message explicite |
| `I8` | les onze contrôles d'API tiennent | traversée, absolu, nom malveillant, 10 Mo, 200 fichiers, action inconnue… |
| `I9` | `data/progress.json` n'existe pas | ✅ |
| `I10` | `data/lab-workspaces/` reste ignoré par git | ✅ |
| `I11` | **376** exercices, corpus gelé `92d5fae6` | ✅ |

---

## 5. Les critères de verdict, gelés AVANT implémentation

### 5.1 Axe ingénierie — conditions bloquantes

Un seul manquement interdit `PRACTICE_WORKBENCH_READY`.

| # | critère | seuil |
|---|---|---|
| `W1` | le Workbench est **réellement branché** au produit | une journée mène à un exercice qui mène au Workbench |
| `W2` | **plusieurs familles** d'exercices supportées | ≥ 5 runtimes, parcours E2E réel |
| `W3` | tout `RUN` produit un `ATTEMPT` | succès **et** échec, testé |
| `W4` | l'échec est **persistant** | testé sur le disque |
| `W5` | la reprise après échec est persistante | historique append-only |
| `W6` | l'`EVIDENCE` est correcte et **non dupliquée** | aucun double comptage |
| `W7` | la **provenance** d'une réussite après aide est conservée | `correctionSeen` / aides consultées |
| `W8` | l'**historique** est consultable | ≥ tentatives horodatées avec issue |
| `W9` | `DRAFT ≠ ATTEMPT` | testé négativement |
| `W10` | `RESET` est **sûr** | n'efface aucun fait |
| `W11` | **`SEC1`–`SEC5` contenues** | 5 sondes vertes sur le produit en marche |
| `W12` | délai, sortie, taille, nombre de fichiers | bornes du §3.2 tenues |
| `W13` | tests cachés et fichiers protégés **non modifiables** | testé négativement |
| `W14` | **aucune fuite de réponse avant tentative**, laboratoire **et** transfert | HTML, charge utile RSC, JSON |
| `W15` | déterminisme là où il est requis | deux exécutions identiques |
| `W16` | **≥ 30 mutations négatives** vues rouges puis restaurées | 30/30 |
| `W17` | `npm test` · `tsc` · `build` · `gates:active` · V73/V74/V75/**V76** | tous verts |
| `W18` | responsive acceptable | 1440 → 375, éditeur utilisable |
| `W19` | accessibilité minimale | clavier, focus, **résultat annoncé** |
| `W20` | performance acceptable, comparée au CP0 | pas de régression non expliquée |
| `W21` | `data/progress.json` non fabriqué | ✅ |
| `W22` | **les fonctionnalités critiques existantes ne sont pas cassées** | `I1`–`I11` tiennent |

### 5.2 Échelle du verdict d'ingénierie

| verdict | condition |
|---|---|
| `PRACTICE_WORKBENCH_READY` | **`W1` → `W22` tous atteints** |
| `PRACTICE_WORKBENCH_CANDIDATE` | `W11` **ou** `W14` non atteint, tout le reste oui |
| `PRACTICE_WORKBENCH_FOUNDATION_READY` | `W1`–`W10` atteints, au plus **trois** manquements ailleurs |
| `PRACTICE_WORKBENCH_NOT_READY` | tous les autres cas |

> **La leçon de V75, appliquée.** Si `W1`–`W22` sont tous atteints, le verdict
> d'ingénierie **DOIT** être `PRACTICE_WORKBENCH_READY`. L'absence de validation
> humaine ne se soustrait pas de cet axe : elle s'exprime sur le second, et
> **nulle part ailleurs**. Le sens du premier verdict ne sera pas redéfini après
> coup.

### 5.3 Axe pédagogique — séparé, et non négociable

| verdict | condition |
|---|---|
| `HUMAN_PRACTICE_EFFICACY_VALIDATED` | une expérience humaine réelle a été menée **et** publiée |
| `HUMAN_PRACTICE_EFFICACY_CANDIDATE` | un protocole existe, instrumenté, prêt à être exécuté |
| `HUMAN_PRACTICE_EFFICACY_NOT_MEASURED` | tous les autres cas |

**État à l'ouverture de V76 : `HUMAN_PRACTICE_EFFICACY_NOT_MEASURED`.** V76 ne
recrute personne et ne changera pas cela.

---

## 6. Hypothèses et incertitudes, déclarées

- **aucune borne de ce contrat n'est calibrée** sur des données réelles : 5 000 ms,
  100 000 octets, 40 fichiers sont **déclarés**, hérités, et non mesurés contre
  un besoin pédagogique ;
- **le produit est local et mono-utilisateur.** Tout le §3 change de gravité le
  jour où il ne le sera plus, et `SEC3`/`SEC4` deviendraient alors critiques ;
- **`T18` (XSS dans l'aperçu) et `T20` (brouillon périmé) ne sont pas mesurés** à
  la signature de ce contrat. Ils le seront aux CP9 et CP14 ;
- **une frontière d'exécution a un coût** — en latence, en dépendance, en
  complexité. Si ce coût s'avère prohibitif pour un runtime, la réponse gelée est
  **déclarer la limite**, jamais la masquer.
