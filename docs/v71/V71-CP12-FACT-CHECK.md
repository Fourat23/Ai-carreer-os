# V71 — CP12 · Vérification factuelle exécutable

> Checkpoint 12 du sprint V71. Règle de la passe : **ne pas croire le texte parce qu'il
> paraît plausible.** Chaque affirmation technique vérifiable est exécutée, ou bien elle
> est déclarée non vérifiable dans cet environnement — jamais réputée vraie par défaut.

---

## Résultat en une ligne

**92 assertions exécutées. 3 fausses, toutes corrigées. Les trois avaient été écrites
par moi pendant ce sprint** — aux CP10 et CP11 — et aucune n'existait dans le corpus
avant V71.

| famille | scripts | assertions | fausses |
|---|---:|---:|---:|
| scripts de vérification V70 (déjà en place) | 50 | 50 exécutions vertes | 0 |
| assertions chiffrées V71 (nouveau, `cp12-assertions.py`) | 1 | 30 | **2** |
| SQL et HTTP (nouveau, `cp12-sql-http.mjs`) | 1 | 12 | 0 |
| arithmétique CI (nouveau, `ci-instabilite-cumulee.mjs`) | 1 | — | **1** |

---

## 1. Les 50 scripts de vérification existants : tous verts

Le corpus portait déjà 50 scripts de vérification (`scripts/v70-verifications/`, 34 en
Node, 9 en Python, 7 en shell). Ils ont **tous été exécutés** :

```
mjs : 34 OK / 0 KO      py : 9 OK / 0 KO      sh : 7 OK / 0 KO
```

Trois d'entre eux exigent React 18 hors du projet et échouaient faute de dépendance ; ils
ont été exécutés après installation dans `/tmp` — c'est ce que leur propre message d'erreur
prescrit. Aucune dérive entre ce que les leçons publient et ce que le code produit.

Le plus utile pour la suite est `react-usefetch-course.mjs`, parce qu'il valide le critère
que j'ai écrit au CP10 pour `react-hooks-effects` :

```
=== 1. SANS garde de nettoyage ===
affiché : données de /lent          ← la réponse lente écrase la bonne
=== 2. AVEC drapeau de nettoyage ===
affiché : données de /rapide        ← le critère du CP10 est vérifié
```

---

## 2. Les trois affirmations fausses, et elles sont de moi

### 2.1 `ci-cd` — deux pourcentages faux dans un critère de réussite

**Ce que la leçon disait** (écrit au CP10) :

> « Avec un seul test qui échoue une fois sur vingt, un pipeline de cent tests est vert
> environ **99 %** du temps ; avec cinq tests dans ce cas, il tombe autour de **78 %**. »

**Pourquoi c'était faux.** Le modèle correct est `(1 − p)^k` où *k* est le nombre de tests
**instables** — le nombre total de tests n'intervient pas du tout, ce que la formulation
« un pipeline de cent tests » laissait croire. Et l'arithmétique elle-même était fausse :
un seul test instable à 1/20 laisse le pipeline vert **95 %** du temps, pas 99 %.

**Contre-preuve** (`scripts/v70-verifications/ci-instabilite-cumulee.mjs`) :

```
p \ k           1        2        3        5       10       20
p=0.05     95.0 %   90.3 %   85.7 %   77.4 %   59.9 %   35.8 %
```

**Formulation corrigée.** La leçon publie désormais 95 % et 77 %, dit explicitement que le
nombre total de tests n'intervient pas, ajoute le seuil auquel une équipe décroche
(**quatorze** tests instables suffisent pour qu'un pipeline sur deux échoue sans raison),
et **énonce la limite du modèle** : le calcul suppose les instabilités indépendantes, alors
qu'en pratique elles se corrèlent — une base partagée, une horloge, un port occupé — ce qui
rend la réalité pire que ce chiffre, jamais meilleure.

### 2.2 `embeddings` — une fréquence publiée sur quatre tirages

**Ce que la leçon disait** (écrit au CP10) :

> « Sur quatre vecteurs aléatoires de huit dimensions, cette comparaison rend `false`
> **trois fois sur quatre**. »

**Pourquoi c'était faux.** C'était vrai *de mes quatre tirages*. Ce n'est pas une fréquence.

**Contre-preuve** — 10 000 tirages, trois graines, puis cinq dimensions :

```
graine 3         : 44.8 %        dimension 2   : 49.6 %
graine 42        : 45.8 %        dimension 8   : 43.7 %
graine 20260908  : 46.1 %        dimension 768 : 50.2 %
```

Le taux réel est **d'environ une fois sur deux**, et il ne dépend pas de la dimension.

**Formulation corrigée**, avec la référence au script — et la leçon retourne l'erreur en
enseignement, puisque c'est exactement son voisinage :

> « Une remarque de méthode, et elle vaut au-delà de ce cas : **un essai sur quatre vecteurs
> ne suffit pas à annoncer une fréquence.** Cette leçon a d'abord publié “trois fois sur
> quatre” sur la foi de quatre tirages ; la mesure sur dix mille en donne une sur deux.
> C'est exactement l'erreur que `/doc/lessons/statistics-for-ml` traite, commise ici. »

### 2.3 Ce que ces deux erreurs ont en commun

Les deux sont des **chiffres publiés sans exécution**, dans des critères de réussite écrits
au CP10 — c'est-à-dire dans la passe dont l'objet était précisément de rendre les pratiques
vérifiables. **Le CP10 a produit des critères vérifiables dont deux n'avaient pas été
vérifiés.** C'est le défaut le plus embarrassant du sprint et il justifie à lui seul
l'existence du CP12.

---

## 3. Les 30 assertions V71 vérifiées par exécution

`scripts/v71/cp12-assertions.py` — chaque ligne affiche ce que la leçon affirme, ce que
l'exécution produit, et le verdict. Sortie complète reproductible.

| leçon | assertion | vérifié |
|---|---|---|
| `neural-networks` | gradient après 1, 5, 10, 20, 50 couches : `0,25` → `9,8e-4` → `9,5e-7` → `9,1e-13` → `7,9e-31` | ✅ |
| `neural-networks` | rang du produit de deux matrices aléatoires = min des dimensions | ✅ 3 |
| `neural-networks` | XOR **sans** couche cachée : les quatre sorties se figent à 0,500 après 200 000 itérations | ✅ |
| `transformers` | de 512 à 128 000 unités, le nombre de paires est multiplié par **62 500** | ✅ |
| `transformers` | l'écart-type des scores croît comme √d (2,80 · 7,88 · 22,82 pour d = 8, 64, 512) et retombe à ~1 après division | ✅ |
| `embeddings` | `cos(v, v)` comparé par égalité stricte échoue ~une fois sur deux | ✅ (corrigé) |
| `embeddings` | `cos(v, −v) = −1` à la tolérance ; `cos([1,0],[0,1]) = 0` **exactement** | ✅ |
| `vector-databases` | 200 000 × 768 × float32 = **614 400 000 octets** = 614 Mo = 586 Mio | ✅ |
| `ci-cd` | pipeline vert à p = 1/20 : 95 % (k=1), 77 % (k=5), 49 % (k=14) | ✅ (corrigé) |
| `cloud-finops` | total exact 1 884,80 → 1 885 ; **colonne arrondie = 1 884** ; geste 2 = 273 € ; cumul 535 € = 28 % | ✅ |
| `ai-evaluation` | pondération 0,40 / 0,40 / 0,20 → A 0,78 · B 0,78 · C 0,76 | ✅ |
| `statistics-for-ml` | les trois affirmations sur numpy (`mean`, diffusion, `default_rng` rejouable) | ✅ |

Le cas `cloud-finops` mérite d'être souligné : **la leçon affirme que sa propre colonne ne
somme pas au total affiché**, et l'exécution le confirme (1 884 contre 1 885). C'est une
affirmation d'erreur, vérifiée comme telle.

---

## 4. Les 12 assertions SQL et HTTP

`scripts/v71/cp12-sql-http.mjs` — moteur `node:sqlite` intégré à Node 22 et serveur HTTP
local. **Aucun appel sortant, aucune infrastructure inventée.**

### SQL — le bloc « Vérifie seul » de `sql-foundations` tient ses promesses

Ce bloc promet à l'apprenant des résultats précis. Si la promesse est fausse, l'apprenant
conclut que **son** travail est faux. Les quatre sont exactes :

```
OK  LEFT JOIN -> le livre jamais emprunté      1 ligne(s) : JamaisEmprunte
OK  INNER à la place de LEFT -> vide           0 ligne(s)
OK  HAVING COUNT(*) > 2 exclut les 2 livres    aucun auteur — correct
OK  HAVING >= 2 inclut Alan (contre-épreuve)   Ada,Alan
OK  WHERE COUNT(*) -> la base refuse           near "WHERE": syntax error
```

La contre-épreuve `>= 2` a été ajoutée pour que le test ne puisse pas passer par accident :
un résultat vide prouve peu, un résultat vide **et** un résultat non vide au seuil voisin
prouvent le mécanisme.

### SQL — `sql-performance-indexing` : SCAN → SEARCH

```
plan sans index :  SCAN t
plan avec index :  SEARCH t USING INDEX idx_cat (cat=?)
```

Sur 20 000 lignes. C'est exactement le critère écrit au CP10 : **le gain se lit dans le
plan, pas au chronomètre.**

### HTTP — `http-rest-json`

```
OK  GET rend 200 et du JSON                    200 application/json
OK  même URL, corps valide -> 201              201
OK  même URL, corps invalide -> 400            400
OK  sans suivi -> 3xx + Location               301 /nouvelle
OK  avec suivi -> 200                          200
```

Les deux lignes du milieu vérifient l'affirmation la plus utile du bloc « Vérifie seul » de
la leçon : **« ton 400 vient bien du corps envoyé, pas d'une URL fautive »**. Même URL,
deux corps, deux statuts.

---

## 5. Ce que cet environnement NE permet PAS de vérifier (§31 du brief)

Relevé exécuté, pas supposé :

| dépendance | état réel ici | conséquence |
|---|---|---|
| démon Docker | **inactif** (le binaire existe, le démon est injoignable) | les leçons Docker ne sont pas exécutées ici |
| `kubectl` / cluster | **absent** | aucune leçon Kubernetes n'est exécutée ici |
| systemd | **absent** — PID 1 est `process_api` | `linux-services-systemd` n'est pas exécuté ici |
| `ssh` / `ssh-keygen` | **absents** | `linux-ssh-remote` n'est pas exécuté ici |
| serveur PostgreSQL | client présent, **aucun serveur en écoute** | SQL vérifié via `node:sqlite` |
| réseau sortant | **indisponible** (HTTP 000) | HTTP vérifié via un serveur local |

**Ces six familles n'ont donc PAS été validées par exécution, et le rapport ne prétend pas
le contraire.** Deux remarques honnêtes :

1. Les codes de sortie `143` et `137` de `linux-services-systemd` **ont** été vérifiés ici
   par un shell ordinaire (`128 + 15` et `128 + 9`) — ils ne dépendent pas de systemd.
2. Le mécanisme de couches d'`overlay` de `docker-containers` **a** été vérifié par
   `couches-overlay.sh`, qui utilise le noyau et non le démon Docker : c'est exactement
   pourquoi la pratique de cette leçon est écrite sans Docker.

---

## 6. Classement des affirmations du corpus

Le brief demande de distinguer les statuts. Répartition après cette passe :

| statut | ce que cela signifie | exemples |
|---|---|---|
| **fait vérifié** | exécuté ici, sortie reproductible | les 92 assertions ci-dessus, les 50 scripts V70 |
| **fait documenté** | vrai par définition ou par spécification, non exécutable | ACID, les couches TCP/IP, `RCA`, la sémantique des verbes HTTP |
| **hypothèse déclarée** | modèle simplifié, et la leçon le dit | l'indépendance des tests instables (`ci-cd`), les tarifs « illustratifs et à revérifier » (`cloud-finops`) |
| **convention pédagogique** | choix de présentation assumé | le mois de 730 h de `cloud-finops`, les graines fixes des scripts |
| **non vérifiable ici** | dépendance absente, déclaré tel quel | Docker, Kubernetes, systemd, SSH, réseau sortant |

---

## 7. Ce que le CP12 n'a pas fait

1. **Aucune leçon corrigée pour satisfaire une sonde.** Les trois corrections viennent
   d'une exécution qui contredit un chiffre, jamais d'un compteur.
2. **Aucune infrastructure simulée pour « pouvoir » valider Docker ou Kubernetes.** Le brief
   l'interdit et c'est la bonne règle : un test qui invente son environnement ne prouve rien.
3. **Aucune vérification des 25 leçons de l'étagère de référence par exécution** — elles
   portent sur du cloud, du Kubernetes et du CSS rendu, dont rien n'est disponible ici.
   Leurs affirmations restent au statut « fait documenté », et c'est une limite réelle de ce
   sprint, à porter au CP15.
