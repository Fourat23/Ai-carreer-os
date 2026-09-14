# V76 · CP5 — L'isolation de l'exécution : les cinq évasions, fermées

> **Les cinq menaces mesurées au CP0 sont contenues. Les 12 exercices de
> référence fonctionnent toujours.**
>
> Une isolation qui casse le produit n'est pas une réussite — elle a d'ailleurs
> cassé cinq exercices avant d'être corrigée, et ce rapport le raconte.

---

## 1. AVANT → APRÈS

Mesuré contre le produit **en marche**, avec le même script
(`scripts/v76/cp0-security.mjs`), avant et après.

| # | menace | AVANT (CP0) | APRÈS (CP5) |
|---|---|---|---|
| `T12` `SEC1` | lire l'hôte | ❌ `/etc/passwd` → `root:x:0:0:…` | ✅ **bloqué** |
| `T13` `SEC5` | lire une **correction** | ❌ `reference` d'un autre exercice lue | ✅ **bloqué** |
| `T14` `SEC2` | écrire hors bac à sable | ❌ fichier créé **dans le dépôt** | ✅ **bloqué** |
| `T15` `SEC3` | créer un processus | ❌ `execSync('id')` → **`uid=0(root)`** | ✅ **bloqué** (Node) · ⚠️ **partiel** (Python, §5) |
| `T16` `SEC4` | SSRF vers l'API | ❌ `/api/progress` → **200** | ✅ **bloqué** |

**Les 16 sondes du CP0 : 11 contenues → 16 contenues.**

Et les mêmes attaques, réécrites **en Python** et jouées sur un exercice
`python3` réel :

| attaque | résultat |
|---|---|
| `open('/etc/passwd')` | `BLOQUÉ:FileNotFoundError` |
| lire `data/exercises/py-debug-grades.json` | `BLOQUÉ:FileNotFoundError` |
| écrire dans le dépôt | `BLOQUÉ:FileNotFoundError` |
| `urlopen('http://127.0.0.1:…/api/progress')` | `BLOQUÉ:URLError` |

---

## 2. La cause, et pourquoi ce n'était pas un réglage à corriger

Le runner faisait :

```js
execFile(binaire, [harnais], { cwd, shell: false, env: {…}, timeout, maxBuffer })
```

**Chaque réglage est correct. Aucun n'isole.**

`cwd` fixe un répertoire de **départ**, pas une **racine** : un chemin absolu le
contourne en un caractère. Le processus hérite de l'identité du serveur — ici
`uid=0(root)` — et de sa pile réseau.

Le CP1 avait nommé ce piège d'avance (`G2` : *« appeler `cwd` une sandbox »*),
parce qu'il est exactement le genre d'erreur qui se relit comme une protection.

---

## 3. Deux frontières, choisies pour ce que le noyau offre réellement

Aucun Docker sur cette installation (`docker info` échoue). Deux mécanismes
disponibles ont été **sondés, pas supposés** :

### `PERMISSION_NET` — 275 exercices (`node-js`, `typescript`, `react-tsx`, `web`)

```
unshare --net  node --permission --allow-fs-read=<ws> --allow-fs-write=<ws>  <harnais>
```

| interdit | tenu | par quoi |
|---|---|---|
| `SEC1` lecture hôte | **total** | modèle de permissions de Node |
| `SEC2` écriture hôte | **total** | idem — **aucune exception** |
| `SEC3` processus | **total** | `child_process` refusé par le modèle |
| `SEC4` réseau | **total** | espace de noms réseau vide |
| `SEC5` corrections | **total** | conséquence de `SEC1` |

### `NAMESPACE_CHROOT` — 101 exercices (`python3`, `python-ds`)

Le modèle de permissions de Node **ne protège pas Python** : un `import os` ne
traverse aucun crochet JavaScript. Le CP1 l'avait écrit d'avance. La frontière
est donc construite au niveau du noyau :

```
unshare --user --map-root-user --mount --net --propagation private
        /bin/sh <aide> <racine minimale> <espace de travail> <interpréteur> …
```

La racine minimale ne contient **que** `/usr` en lecture seule et l'espace de
travail. **Ni `/etc`, ni `/home`, ni `/root`, ni le dépôt** — donc ni
`/etc/passwd`, ni le corpus de corrections.

| interdit | tenu |
|---|---|
| `SEC1` · `SEC2` · `SEC4` · `SEC5` | **total** |
| `SEC3` processus | **partiel** — voir §5 |

---

## 4. Ce qui a cassé, et comment

**L'isolation a cassé cinq exercices avant d'être juste.** Chaque panne a
enseigné quelque chose, et aucune n'a été résolue en desserrant une protection.

| # | symptôme | cause réelle | correctif |
|---|---|---|---|
| 1 | 15 exercices `react-tsx` à 0/3 | le harnais importe `react` depuis `node_modules`, hors de l'espace de travail | **lecture** autorisée sur `node_modules` et le répertoire de Node — l'**écriture** reste bornée |
| 2 | Python « indisponible » | la sonde de racine minimale échouait… parce qu'`existsSync` **suit** les liens et rend `false` sur un lien cassé. Les liens `lib → usr/lib` sont cassés **vus de l'hôte** : ils ne se résolvent que dans l'espace de noms | `lstatSync`, qui ne suit pas le lien |
| 3 | `exec: chroot: not found` | le `PATH` minimal (`/usr/bin:/bin`) ne contient pas `/usr/sbin` | binaires nommés en **absolu**, cherchés parmi leurs emplacements usuels |
| 4 | `/usr/bin/python3: No such file` | c'est un lien vers `/etc/alternatives/python3`, et `/etc` n'est pas monté — **c'est le but** | résoudre l'interpréteur **avant** d'entrer dans la racine |
| 5 | `pandas` ne trouve plus `dateutil` | deux causes empilées : `python-ds` tourne dans un **environnement virtuel** que la résolution du lien fait quitter ; et le répertoire de paquets « utilisateur » se déduit de `$HOME`, que la racine minimale **cache volontairement** | nommer explicitement les répertoires de paquets, par montage **et** par `PYTHONPATH` |

### La dernière erreur, et c'est la plus instructive

Après tout cela, `pandas` échouait encore. La cause n'était pas dans le montage
mais **dans deux affectations successives** :

```js
envEffectif = { ...envEffectif, PYTHONPATH: … };
envEffectif = { ...env, AICOS_LIBS: … };   // ← repart de `env` : écrase la ligne précédente
```

Le symptôme (`dateutil` introuvable) désignait la frontière ; la faute était à
six lignes de là. **Une demi-heure passée à durcir une protection qui
fonctionnait déjà.**

---

## 5. La limite déclarée : `SEC3` partiel en Python

**Un processus enfant reste possible depuis du code Python.** Il naît cependant
dans la même prison : racine minimale, aucun réseau, aucun privilège sur l'hôte,
aucune commande de l'hôte atteignable.

Le contrat gelé (§3) exigeait `NO HOST PROCESS EXECUTION`. **Aucun processus de
l'hôte n'est exécutable** — mais un processus *dans le bac à sable* l'est. La
nuance est écrite dans le code (`CONTENU_PAR_MODE.NAMESPACE_CHROOT.SEC3 =
'partiel'`) plutôt que gommée, et **un test refuse que cette valeur passe à
`total`** sans qu'une mesure l'accompagne.

Fermer complètement `SEC3` demanderait `seccomp` ou un conteneur — hors de
portée sans Docker, et le contrat interdit de le prétendre.

---

## 6. Ce que le produit fait quand aucune frontière n'existe

**Il refuse d'exécuter, et le dit :**

> *« Le runtime « python3 » est indisponible sur cette installation : aucune
> racine minimale n'est montable. Le produit n'exécute pas de code sans
> frontière d'isolation — il préfère ne rien faire plutôt que d'exécuter ton
> code sans protection. »*

Le mode `HOTE` existe dans le code comme **valeur nommée et refusée** :
construire une ligne de commande avec lui **lève une exception**. Un test le
vérifie, et une mutation qui le rendrait constructible rougit.

C'est la règle §3.4, et le modèle vient de `lib/terminal-docker.mjs`, qui
déclarait déjà honnêtement `unavailable` — le CP0 avait relevé qu'il n'avait
jamais été appliqué au runner.

---

## 7. Ce qui n'a pas régressé

| vérification | résultat |
|---|---|
| les 12 parcours E2E du CP0 | **12/12**, échec compris, preuve comprise |
| `npm test` | **1863 / 1863** |
| `tsc --noEmit` | 0 |
| `npm run build` | compilé |
| latence `node-js` | inchangée (~50–150 ms) |
| latence `python3` | inchangée (~50–80 ms) |

---

## 8. Sept mutations, vues rouges

| mutation | résultat |
|---|---|
| repli vers l'hôte autorisé quand rien n'est disponible | 🔴 |
| `HOTE` rendu constructible (repli silencieux) | 🔴 |
| l'écriture étendue hors de l'espace de travail | 🔴 |
| un mode prétend tenir `SEC3` totalement | 🔴 |
| le corpus de corrections ajouté aux lectures autorisées | 🔴 |
| un point d'exécution contourne la frontière | 🔴 |
| l'aide monte `/etc` dans la racine minimale | 🔴 |

**La sixième est la plus importante** : le CP0 avait trouvé **trois** points
d'exécution distincts (harnais web, harnais React, runtime générique). Il
suffirait d'en oublier un pour rouvrir les cinq évasions sur tout un runtime.
Un test compte les points isolés et refuse tout spawn direct.

---

## 9. Artefacts

| fichier | rôle |
|---|---|
| `lib/sandbox.mjs` | la **décision** — pure, testable sans processus |
| `lib/sandbox-detect.mjs` | les **sondes** — on crée un espace de noms, on ne demande pas |
| `scripts/sandbox/enter-root.sh` | l'entrée en racine minimale, chemins en `argv` |
| `tests/v76-sandbox.test.mjs` | 13 tests de décision |
| `docs/v76/cp0-security.json` | les 16 sondes, rejouées après |
