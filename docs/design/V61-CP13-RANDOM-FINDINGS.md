# V61 · CP13 — Constat des quatorze visites

Écrit **après** `V61-CP13-RANDOM-DRAW.md`, qui n'a pas été modifié.
Toutes les mesures ci-dessous ont été prises au navigateur (Chromium, axe-core
injecté), à 375 px et 1440 px, sur le build de production.

## Tableau brut — état AVANT correction

| Route | Ligne de contexte | CTA | h1 | Déb. | Rogné | Haut. 375 / 1440 | axe (375) |
|---|:--:|:--:|:--:|:--:|:--:|--:|---|
| `/pipelines` | **non** | non | 1 | 0 | 0 | 1 498 / 900 | 0 |
| `/security/leaked-secret-config` | **non** | non | 1 | 0 | 0 | 3 225 / 1 630 | **2 serious** |
| `/cloud-lab/canary-no-metric` | **non** | non | 1 | 0 | 0 | 4 111 / 2 315 | **2 serious** |
| `/kubernetes` | **non** | non | 1 | 0 | 0 | 1 775 / 960 | 0 |
| `/career` | **non** | non | 1 | 0 | 0 | 5 445 / 3 300 | 0 |
| `/pipelines/deploy-staging` | **non** | non | 1 | 0 | 0 | 1 806 / 1 338 | **1 serious** |
| `/missions` ✱ | oui | oui | 1 | 0 | 0 | 13 776 / 5 853 | 0 |
| `/lessons` | **non** | non | 1 | 0 | 0 | **18 762** / 9 627 | 0 |
| `/settings` | **non** | non | 1 | 0 | 0 | 1 620 / 1 132 | 0 |
| `/projects` ✱ | oui | oui | 1 | 0 | 0 | 7 129 / 4 535 | 0 |
| `/revisions` ✱ | oui | oui | 1 | 0 | 0 | 2 218 / 1 184 | 0 |
| `/lab` ✱ | oui | oui | 1 | 0 | 0 | 9 678 / 1 588 | 0 |
| `/cloud-foundations/aws-ha-api` | **non** | non | 1 | 0 | 0 | 4 078 / 2 786 | **1 serious** |
| `/capstones` ✱ | oui | oui | 1 | 0 | 0 | 3 570 / 2 137 | 0 |

✱ route migrée en V61.

## Ce que le tirage a révélé

### 1. La frontière de migration est visible à l'œil nu — et elle est nette

Les cinq routes migrées portent la ligne de contexte et une action primaire.
Les neuf autres n'en ont aucune : **zéro sur neuf**, sans une seule exception.
Ce n'est pas un hasard d'échantillon, c'est la définition même de la frontière.
Le produit est aujourd'hui à deux vitesses, et le tirage l'a démontré au lieu de
le laisser supposer. C'est le constat central de ce CP.

### 2. Le défaut de lien n'était jamais propre à `/month/3` — CORRIGÉ

`link-in-text-block` reparaît sur `/security/[id]`, `/cloud-lab/[id]` et
`/cloud-foundations/[id]`, toujours sur le même objet : un renvoi
« jour N » vers la théorie, au fil d'une phrase, dans un `<p class="muted">`.

Au CP12 j'avais traité ce défaut comme un incident de `/month/3` et perdu quatre
tentatives à styler un tableau de bureau invisible à 375 px. Le tirage montre
que c'était une famille, pas un cas. Corrigé par une règle unique sur `.muted a`,
symétrique de celle posée sur `.prose a`.

### 3. Trois zones défilantes hors d'atteinte du clavier — CORRIGÉ

`scrollable-region-focusable` sur `<pre class="sec-code">` (artefacts de
sécurité), `<table class="cl-table">` (topologie cloud) et
`<div class="pl-dag">` (graphe de pipeline). Contenu réellement inaccessible
sans souris. `tabIndex={0}` plus un nom accessible sur chacun — exactement le
correctif appliqué à `.lab-groups` au CP11, appliqué ici parce que le tirage a
prouvé qu'il manquait ailleurs.

### 4. `/lessons` : 18 762 px à 375 px — NON CORRIGÉ, assumé

C'est la page la plus haute du produit, plus haute que `/day/[id]` avant sa
migration. Elle mérite une recomposition, pas un rafistolage : ce serait une
seizième route migrée, décidée par un tirage plutôt que par le plan du sprint.
**Non corrigé dans V61.** Consigné ici et reporté en tête du backlog V62 — la
règle du sprint est de ne pas élargir le périmètre en fin de course, pas de
cacher ce qu'on a vu.

### 5. `/missions` à 375 px : 13 776 px — NON CORRIGÉ, assumé

Ma propre route migrée. À 1440 px la recomposition par catégorie a divisé la
dominance par deux (0,867 → 0,431) ; à 375 px les quatre sections s'empilent et
la page reste longue. Aucun débordement, aucun rognage, aucune violation — mais
c'est long. Le seuil gelé au CP1 ne portait la hauteur que sur `/day/[id]` ; je
ne vais pas m'en prévaloir pour dire que tout va bien. **Écart réel, non
corrigé, consigné.**

### 6. Ce qui tient

- **h1 = 1 sur les quatorze**, migrées ou non. Le plan de document est un acquis
  du produit entier, pas de la seule zone migrée.
- **Zéro débordement horizontal et zéro rognage sur les 28 états.**
- Les quatre routes dynamiques répondent en 200 et n'écrivent rien.

## Vérification élargie après correction

Les corrections 2 et 3 ne concernaient pas que les routes tirées. Balayage
complet ensuite :

```
axe-core sur 66 états (33 routes de production × 375 et 1440)
  → 0 critical, 0 serious
```

Le produit entier, et non la seule zone migrée.

## Intégrité de la progression (§25)

```
sha256 AVANT  73c1ee39a255c87972f4f42b36873b1081081d6f278bd767089c0cef1fc6e7a6
32 visites de routes, toutes en HTTP 200
sha256 APRÈS  73c1ee39a255c87972f4f42b36873b1081081d6f278bd767089c0cef1fc6e7a6
```

Identique. Naviguer est une lecture. Aucun fichier n'a été restauré : le hachage
d'avant est celui d'après parce que rien n'a écrit.

## Bilan honnête du CP13

Le tirage a trouvé **six choses**. Quatre étaient corrigeables sans sortir du
périmètre du sprint, et l'ont été. Deux sont des défauts de composition réels
que V61 laisse ouverts : `/lessons` et la hauteur mobile de `/missions`. Elles
sont écrites ici, elles comptent contre le verdict, et elles ne seront pas
requalifiées en « hors périmètre » au CP15.
