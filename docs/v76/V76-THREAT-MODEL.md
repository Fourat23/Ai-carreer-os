# V76 — MODÈLE DE MENACE DE L'ENVIRONNEMENT DE PRATIQUE

> **Écrit AVANT toute architecture**, comme le brief l'exige, et **après avoir
> attaqué le produit en marche** — pas après avoir lu son code.
>
> La règle qui commande ce document :
>
> > *Si certains runtimes ne peuvent pas être sandboxés correctement, NE PAS
> > prétendre qu'ils le sont. Dégrader la capacité ou déclarer la limite.*

---

## 0. La conclusion, d'abord

AI Career OS exécute du code écrit par l'apprenant. Les sondes du CP0 montrent
une asymétrie nette, et il faut la nommer sans la maquiller :

| couche | état |
|---|---|
| **la surface d'API** (`/api/lab/[id]`) | **bien gardée** — traversée, chemins absolus, noms malveillants, charge utile, nombre de fichiers, fichiers protégés, actions inconnues : tout est refusé |
| **la couche d'exécution** (le processus enfant) | **non isolée** — le code de l'apprenant lit et écrit tout le disque, lance des processus, et atteint l'API du produit par le réseau local |

Autrement dit : **on ne peut pas tromper le portier, mais une fois entré on est
dans la maison.**

### Le contexte qui rend cela supportable aujourd'hui — et qui doit être écrit

AI Career OS est, à ce jour, une **application locale mono-utilisateur** :
l'apprenant lance le serveur sur sa propre machine et écrit son propre code.
Dans ce cadre, « le code de l'apprenant peut lire les fichiers de l'apprenant »
n'est pas une élévation de privilège — il pourrait ouvrir un terminal.

**Deux conséquences n'en restent pas moins réelles, même en local**, et ce sont
elles qui justifient un travail au CP5 :

1. **une fuite pédagogique** : le corpus des corrections (`data/exercises/*.json`)
   est lisible depuis le code d'un exercice. Le produit peut donc **donner la
   réponse à qui la demande de travers**, ce que le CP0.G interdit explicitement ;
2. **une dette bloquante pour la suite** : le jour où ce produit est servi à
   plus d'une personne, cette architecture devient une exécution de code
   arbitraire à distance. Il vaut mieux l'avoir écrit maintenant.

---

## 1. Les biens à protéger

| # | bien | pourquoi il compte |
|---|---|---|
| `B1` | **les corrections du corpus** (`reference`, tests privés) | leur fuite vide les exercices de leur sens |
| `B2` | **la progression de l'apprenant** | c'est son histoire d'apprentissage ; un faux fait la corrompt |
| `B3` | **la machine hôte** | fichiers personnels, clés SSH, secrets d'environnement |
| `B4` | **la disponibilité du produit** | une boucle infinie ne doit pas geler l'application |
| `B5` | **l'intégrité du dépôt** | `data/progress.json` ne doit jamais exister ; le corpus est gelé |
| `B6` | **le réseau** | ni exfiltration, ni SSRF vers l'API du produit |

---

## 2. La table de menace, mesurée

`CONTRÔLE ACTUEL` décrit ce qui a été **observé** sur le produit en marche, pas
ce qu'on lit dans une source. Les sondes sont dans
`scripts/v76/cp0-security.mjs`, les résultats dans `docs/v76/cp0-security.json`.

| # | menace | vecteur | bien | contrôle actuel | écart | gravité | contrôle proposé |
|---|---|---|---|---|---|---|---|
| `T1` | boucle infinie | code apprenant | `B4` | ✅ **timeout 5 s** observé (5 105 ms) | — | — | conserver, et le geler au contrat |
| `T2` | inondation de la sortie | `console.log` en masse | `B4` | ✅ **sortie bornée** (réponse 1 Ko pour 10⁹ octets émis) | — | — | conserver |
| `T3` | traversée de chemin | `../../` dans un nom de fichier | `B3` `B5` | ✅ **refusé 400** | — | — | conserver |
| `T4` | chemin absolu | `/etc/...` dans un nom de fichier | `B3` | ✅ **refusé 400** | — | — | conserver |
| `T5` | nom de fichier malveillant | octet nul, `....//`, antislash | `B3` | ✅ **refusé 400** | — | — | conserver |
| `T6` | charge utile géante | 10 Mo dans un fichier | `B4` | ✅ **refusé 400** en 180 ms | — | — | conserver |
| `T7` | trop de fichiers | 200 fichiers par requête | `B4` | ✅ **refusé 400** (plafond 40) | — | — | conserver |
| `T8` | modification d'un test protégé | réécrire un fichier `readOnly`/`hidden` | `B1` | ✅ **refusé**, message explicite | — | — | conserver, et tester les DEUX natures |
| `T9` | fait fabriqué | un brouillon compté comme tentative | `B2` | ✅ **`save` n'écrit aucun fait** (36 → 36) | — | — | geler `draft ≠ attempt` au contrat |
| `T10` | capacité non déclarée | action inconnue sur l'API | `B3` | ✅ **refusé 400** | — | — | geler le vocabulaire d'actions |
| `T11` | fuite de secret d'environnement | `process.env` depuis le code | `B3` | ✅ **environnement filtré** : 2 variables (`PATH`, `NODE_ENV`) | — | — | conserver — c'est le contrôle le plus réussi |
| **`T12`** | **lecture du disque hôte** | `readFileSync('/etc/passwd')` | `B3` | ❌ **AUCUN** | lecture totale | **HAUTE** | racine de bac à sable imposée au processus enfant |
| **`T13`** | **lecture des corrections** | `readFileSync('data/exercises/*.json')` | **`B1`** | ❌ **AUCUN** | corpus lisible | **HAUTE** | idem `T12` + ne pas exposer le corpus au processus |
| **`T14`** | **écriture hors bac à sable** | `writeFileSync('<dépôt>/x')` | `B5` `B3` | ❌ **AUCUN** | écriture totale | **HAUTE** | idem `T12` |
| **`T15`** | **création de processus** | `execSync('id')` → `uid=0(root)` | `B3` | ❌ **AUCUN** | shell disponible, en root | **HAUTE** | interdire `child_process` au niveau du chargeur |
| **`T16`** | **SSRF vers l'API du produit** | `fetch('http://127.0.0.1:3301/api/progress')` → 200 | **`B2`** `B6` | ❌ **AUCUN** | la progression est joignable | **HAUTE** | couper le réseau du processus enfant |
| `T17` | exfiltration vers un tiers | `fetch('https://…')` | `B6` | ⚠️ **accidentel** — bloqué par le certificat du mandataire du conteneur, **pas par un contrôle du produit** | aucun contrôle propre | MOYENNE | même contrôle que `T16` ; ne pas compter sur l'environnement |
| `T18` | XSS dans l'aperçu web | HTML/JS d'apprenant rendu | `B2` | ⚠️ **non mesuré au CP0** | inconnu | À MESURER | à sonder au CP14 (`iframe` cloisonnée, `sandbox`) |
| `T19` | fuite de réponse d'un défi de transfert | lire le HTML de `/transfer/[id]` | **`B1`** | ❌ **AUCUN** — `"answer":0` et `explanation` sont dans la charge utile de la page | réponse lisible **avant** la tentative | **HAUTE** | ne servir au client que ce qu'il doit voir |
| `T20` | empoisonnement de la persistance | brouillon écrasant une version plus récente | `B2` | ⚠️ **non mesuré** | inconnu | À MESURER | sonder au CP9 / CP14 |
| `T21` | `data/progress.json` créé | écriture accidentelle dans le dépôt | `B5` | ✅ **absent**, gardé par `v74:check` | — | — | conserver |

### Ce que la table dit en une phrase

**Onze menaces sur vingt-et-une sont contenues et mesurées. Six ne le sont pas
du tout** (`T12`–`T16`, `T19`), **une est bloquée par accident** (`T17`), et
**trois restent à mesurer** (`T18`, `T20`, et la seconde nature de `T8`).

---

## 3. Pourquoi l'exécution n'est pas isolée — la cause, pas le symptôme

Le runner fait, en substance :

```
execFile(<binaire du runtime>, [<harnais>], {
  cwd: <dossier de travail de l'exercice>,
  shell: false,          // ✅ aucune interprétation de commande
  env: { PATH, NODE_ENV },// ✅ environnement filtré
  timeout: 5000,          // ✅ borne de temps
  maxBuffer: <borne>,     // ✅ borne de sortie
})
```

Chaque ligne de cette configuration est **correcte**, et aucune n'isole quoi que
ce soit. `cwd` fixe le dossier **de départ**, pas une **racine** : un chemin
absolu le contourne en un caractère. Le processus hérite de l'identité du
serveur — ici `uid=0(root)` — et de sa pile réseau.

**Le contrôle manquant n'est pas un oubli de configuration : il n'existe pas à ce
niveau d'API.** Isoler réellement demande une frontière que `execFile` ne fournit
pas — espace de noms, conteneur, ou un chargeur qui refuse les modules dangereux.

**Le produit possède déjà cette frontière ailleurs** : `lib/terminal-docker.mjs`
exécute ses tâches de terminal dans un conteneur `alpine` durci — réseau `none`,
non-root, système de fichiers en lecture seule — et **déclare honnêtement
« indisponible »** quand Docker manque, au lieu de simuler un succès. Le modèle
existe ; il n'a simplement jamais été appliqué au runner d'exercices.

---

## 4. Les contrôles proposés, par ordre de rapport

Ils seront **gelés au CP1** et implémentés au **CP5**. Aucun ne sera affaibli
ensuite pour faire passer un exercice : c'est la règle du contrat.

| # | contrôle | traite | coût | remarque |
|---|---|---|---|---|
| `C1` | **chargeur restrictif** : refuser `node:fs`, `node:child_process`, `node:net`, `node:http`, et le `fetch` global dans le harnais | `T12`–`T16` | moyen | protège **tous** les runtimes Node/TS/React d'un coup |
| `C2` | **racine de bac à sable vérifiée** : tout chemin résolu doit rester sous la racine de l'exercice | `T12` `T14` | faible | défense en profondeur, indépendante de `C1` |
| `C3` | **ne pas servir la réponse avant la tentative** sur `/transfer/[id]` | `T19` | faible | même correctif que celui déjà en place côté laboratoire |
| `C4` | **aperçu web cloisonné** : `iframe` avec `sandbox`, origine nulle | `T18` | faible | à mesurer d'abord |
| `C5` | **exécution conteneurisée** pour Python (`C1` ne s'y applique pas) | `T12`–`T16` pour Python | élevé | **si Docker est indisponible, dégrader et le DIRE** |
| `C6` | **sondes de sécurité en test permanent** | toutes | faible | une protection sans test négatif est une protection supposée |

### La limite qu'il faudra déclarer, quoi qu'il arrive

`C1` protège les runtimes qui passent par le chargeur de modules Node. **Python
n'en fait pas partie** : un `import os` ne traverse aucun crochet JavaScript.
Sans conteneur, **Python restera non isolé**, et le produit devra l'écrire au
lieu de le laisser croire — 101 exercices sont concernés.

---

## 5. Ce que ce modèle ne couvre pas

- **l'apprenant contre lui-même** : rien n'empêche quelqu'un d'ouvrir le fichier
  de correction dans son éditeur. Ce n'est pas une menace, c'est son produit ;
- **le multi-utilisateur** : il n'existe pas aujourd'hui. Tout ce document
  change de gravité le jour où il existera, et `T15`/`T16` deviendraient
  alors bloquantes ;
- **la chaîne d'approvisionnement** : les dépendances npm ne sont pas auditées
  ici ;
- **le navigateur** : `T18` est déclarée, pas mesurée.
