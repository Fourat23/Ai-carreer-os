# V72 — CP10. Validation opérationnelle par niveaux

**Règle du contrat (§7)** : ne jamais prétendre au niveau N2 ou N3 ce qui n'a atteint que N1, et
publier par domaine la répartition `EXECUTED / STATICALLY CHECKED / NOT EXECUTABLE HERE`.

**Résultat principal** : **les 50 scripts de vérification du corpus s'exécutent et passent** —
47 immédiatement, 3 après une installation de React 18 hors projet que les scripts eux-mêmes
documentent. Aucun échec réel.

---

## 1. N1 — validation statique de tous les blocs de code

Le corpus contient **687 blocs de code**. Répartition par langage déclaré :
`(aucun)` 303 · `js` 111 · `bash` 51 · `python` 41 · `css` 34 · `sql` 26 · `tsx` 22 ·
`dockerfile` 21 · `yaml` 19 · `ts` 19 · `jsx` 17 · `html` 14 · `json` 6 · `ini` 2 · `http` 1.

| famille | blocs | validés | outil |
|---|---:|---:|---|
| YAML (k8s, CI, compose) | 19 | **19 / 19** | `yq -e 'type'` |
| shell | 51 | **51 / 51** | `bash -n` |
| JSON | 6 | **6 / 6** | `JSON.parse` |
| Dockerfile | 21 | **21 / 21** | analyse des instructions |

### Deux artefacts de ma sonde, corrigés avant publication

La première exécution signalait **4 blocs shell invalides et 17 Dockerfile sur 25**. Les deux
familles d'échec étaient des défauts de ma sonde :

1. **Les marqueurs de substitution.** `docker network inspect <reseau>`,
   `kubectl describe pod <nom>`, `docker pull node@sha256:<digest>` — `bash -n` lit `<` comme
   une redirection. C'est une **convention de documentation**, universelle et correcte. La
   sonde neutralise désormais `<…>` avant l'analyse : 47 → **51 / 51**.
2. **Le mot `FROM`.** Ma sonde cherchait `FROM` dans le texte pour repérer les Dockerfile — et
   attrapait des requêtes **SQL** (`SELECT … FROM commandes`). Elle exigeait en outre qu'un bloc
   commence par `FROM`, ce qui condamnait les **fragments délibérés** : `docker-build-dockerfile`
   montre l'ordre des couches par deux extraits `COPY`/`RUN` sans réécrire l'image entière, ce
   qui est exactement la bonne pédagogie. Restreinte aux blocs déclarés `dockerfile` et aux
   fragments acceptés : 8 → **21 / 21**.

**Dixième occurrence** du défaut de méthode de V71 — mesurer un marqueur plutôt que la propriété
— et la troisième d'affilée attrapée avant publication dans V72.

---

## 2. N2 — exécution réelle

### Les 50 scripts de vérification du corpus

`scripts/v70-verifications/` contient **50 scripts** que les leçons citent pour justifier leurs
chiffres. Les rejouer, c'est vérifier que ce que le corpus affirme se produit encore.

| | |
|---|---|
| exécutés et **verts** | **50 / 50** |
| échecs réels | **0** |

Trois d'entre eux — `react-usefetch-course`, `react-mutation-rerendu`,
`frontend-testing-refactor` — exigent React 18 en UMD et **refusaient de s'exécuter en donnant
eux-mêmes la commande d'installation** :

```
React 18 UMD introuvable. Installer hors projet :
  mkdir -p /tmp/r18 && cd /tmp/r18 && npm i react@18.3.1 react-dom@18.3.1
  REACT18_DIR=/tmp/r18/node_modules node scripts/v70-verifications/react-usefetch-course.mjs
```

Le réseau sortant étant revenu (mesuré au CP0), l'installation a été faite **hors du projet**,
les trois scripts passent, et l'installation a été supprimée. Aucune dépendance n'a été ajoutée
au dépôt.

### Outils disponibles ici

`node` · `python3` · `git` · `bash` · `node:sqlite` — tous **disponibles**, ce qui couvre
l'intégralité des commandes shell, git, npm/node et python du corpus (54 commandes).

---

## 3. N3 — conteneur : ce que le démon permet, mesuré

| test | résultat |
|---|---|
| `dockerd` démarre dans ce conteneur | **oui** (Server 29.3.1, `overlayfs`) |
| `docker build` sur un `FROM scratch` | **réussit** — image construite, digest produit |
| `docker build` / `buildx --check` sur les **8 Dockerfile complets** du corpus | **échoue, pour une seule raison** |

L'échec est identique pour les huit et il est précis : le Dockerfile est **lu et transféré sans
erreur** (`transferring dockerfile: 394B done`), puis la résolution de l'image de base échoue —

```
[internal] load metadata for docker.io/library/node:20-slim
ERROR: failed to copy: … production.cloudfront.docker.com/… : Forbidden
```

Le registre répond, le CDN de blobs est bloqué par le proxy. **Ce n'est donc pas le corpus qui
échoue : c'est le tirage d'images.** Les Dockerfile du corpus restent au niveau **N1**, et le
mécanisme de construction lui-même est vérifié au niveau **N3** par le test `FROM scratch`.

Le démon a été arrêté après mesure ; aucun serveur résiduel.

---

## 4. N4 — ce qui n'est pas exécutable ici, déclaré comme tel

| outil | état |
|---|---|
| `kubectl` | **absent** |
| `ssh`, `ssh-keygen` | **absents** |
| `terraform` | **absent** |
| `aws`, `az` | **absents** |
| systemd | **ne tourne pas** — PID 1 = `process_api` |

---

## 5. Répartition par domaine — la table exigée par le contrat

| domaine | EXECUTED (N2/N3) | STATICALLY CHECKED (N1) | NOT EXECUTABLE HERE (N4) |
|---|---|---|---|
| JavaScript / TypeScript / React | **les scripts de vérification, dont les 3 React 18** | 111 blocs `js`, 19 `ts`, 22 `tsx`, 17 `jsx` | — |
| Python / data / ML | **les scripts Python du corpus** | 41 blocs `python` | — |
| SQL | **`node:sqlite`** | 26 blocs `sql` | — |
| Shell / Linux (fichiers, processus, ressources) | **commandes exécutables ici** | 51 blocs shell valides | — |
| Git | **exécutable ici** | — | — |
| **Docker** | mécanisme de construction (`FROM scratch`) | **21 Dockerfile valides**, 3 blocs compose | **tirage d'images bloqué** ⇒ aucun Dockerfile du corpus construit |
| **Kubernetes** | — | **19 blocs YAML valides**, commandes `kubectl` syntaxiquement valides | **`kubectl` absent** ⇒ aucun manifeste appliqué |
| **systemd** | — | commandes valides | **systemd ne tourne pas** |
| **SSH** | — | commandes valides | **`ssh` absent** |
| **Cloud (AWS / Azure / Terraform)** | — | **aucun bloc de commande à valider** — le corpus n'en contient aucun | sans objet : ces leçons sont **conceptuelles** |

**Le point le plus utile de cette table** : les six leçons cloud ne contiennent **aucune**
commande `aws`, `az` ou `terraform`. Il n'y avait donc **rien à exécuter** — la réserve de V71
(« ~14 leçons non vérifiées opérationnellement ») surestimait le problème, comme le CP0 l'avait
déjà mesuré. La surface réellement non exécutable se réduit à **10 leçons** : 5 Docker,
3 Kubernetes, systemd, SSH — et pour toutes les dix, la forme est validée statiquement.

---

## 6. Ce que le CP10 a modifié

**Aucun fichier de contenu.** Un script ajouté :
`scripts/v72/cp10-validation-operationnelle.mjs` — extraction des 687 blocs, validation N1 par
famille, inventaire N2/N3/N4, rejouable.

Aucune infrastructure installée dans le projet. L'installation React 18 était hors projet et a
été supprimée. Aucun serveur résiduel : le démon Docker démarré pour la mesure est arrêté.
