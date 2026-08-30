# V70 CP13 — Audit à l'aveugle de l'échantillon gelé

**Échantillon :** `V70-ACADEMIC-CORPUS-24`, graine `V70-ACADEMIC-CORPUS-24`,
tiré au CP0 **avant toute réécriture** et publié tel quel dans
`docs/V70-BLIND-SAMPLE.md`. Il n'a pas été modifié.

**Question posée à chaque leçon**, celle du §0 du brief : *si je retire
entièrement l'interface et que je donne cette seule leçon à un apprenant humain
motivé ayant quelques notions de JavaScript et de Postman, est-ce suffisant pour
apprendre ?*

---

## 1. Mesures des 24 leçons au CP13

| leçon | total | guidé | correction | pratique | métier |
|---|---:|---:|---:|---:|---:|
| ai-evaluation | 2656 | 701 | 424 | 53 | 201 |
| ai-security | 2829 | 756 | 466 | 56 | 210 |
| architecture-basics | 3365 | 737 | 453 | 213 | 205 |
| caching-performance | 3041 | 1115 | 1074 | 50 | 0 |
| cloud-azure-core | 2475 | 621 | 578 | 233 | 52 |
| cloud-finops | 2544 | 717 | 542 | 274 | 53 |
| css-grid | 3717 | 1075 | 1208 | 442 | 0 |
| database-transactions-concurrency | 3713 | 1007 | 733 | 216 | 0 |
| deployment-secrets | 2901 | 725 | 650 | 317 | 0 |
| error-handling | 2990 | 764 | 1160 | 48 | 0 |
| frontend-testing | 4119 | 834 | 588 | 501 | 0 |
| k8s-workloads | 2348 | 691 | 477 | 213 | 44 |
| linux-resources-io | 2740 | 980 | 584 | 62 | 43 |
| llm-cost-optimization | 2448 | 749 | 846 | 58 | 0 |
| llm-observability | 2702 | 683 | 940 | 46 | 0 |
| networking-tcp-ip-model | 3130 | 748 | 560 | 240 | 43 |
| neural-networks | 2491 | 641 | 746 | 238 | 0 |
| python-foundations | 2487 | 766 | 420 | 50 | 188 |
| react-composition-architecture | 3875 | 873 | 691 | 427 | 0 |
| react-fundamentals | 2908 | 777 | 1228 | 41 | 0 |
| system-design-scaling | 2888 | 1001 | 581 | 48 | 43 |
| terminal-shell-filesystem | **1986 → 3201** | 338 | 302 | **43 → 235** | 151 |
| typescript-frontend | 3671 | 1158 | 427 | 404 | 170 |
| vector-databases | 2790 | 670 | 856 | 49 | 0 |

**Moyennes avant l'action du CP13 :** total 2951, guidé 797, correction 689,
pratique 180. **Les 24 passent les trois seuils** (guidé ≥ 300, correction
≥ 300, total ≥ 1800).

---

## 2. Ce que l'échantillon a servi à trouver

La stratification du CP0 incluait délibérément un axe « note superficielle »,
pour pouvoir **contredire les compteurs**. C'est ce qui s'est produit.

### 2.1 Deux leçons de l'échantillon n'avaient jamais été revues par V70

Contrôle par l'historique git, et non par mémoire :

| leçon | dernière révision | verdict CP13 |
|---|---|---|
| `terminal-shell-filesystem` | **V67** | défaut confirmé, corrigé |
| `ai-security` | **V69** | tient, écart mineur signalé |

Le brief est explicite au §3C : « V69 n'accorde aucun passe-droit ». Ces deux
leçons sont donc examinées au même titre que les autres, et l'une des deux n'a
pas passé la lecture.

### 2.2 `terminal-shell-filesystem` — défaut réel, passant la grille numérique

C'est la leçon **la plus faible des 24 sur les trois métriques** : total 1986,
guidé 338, correction 302 — juste au-dessus des seuils. Et elle avait la
pratique la plus faible de tout l'échantillon : **43 mots**, une simple suite de
commandes sans livrable.

Or c'est une leçon de **tout premier contact**, celle sur laquelle tout le reste
du programme est posé. Un défaut y coûte plus qu'ailleurs.

Second constat : elle affirmait, sans l'avoir vérifié, que « le `cd` échoue et
le shell continue à la ligne suivante ».

**Action.** La vérification `scripts/v70-verifications/shell-erreurs-silencieuses.sh`
a été écrite et exécutée. L'affirmation est **confirmée**, et la mesure va plus
loin que la leçon ne le disait :

```
script.sh: line 1: cd: /repertoire-qui-nexiste-pas: No such file or directory
LIGNE SUIVANTE EXECUTEE, repertoire courant = /tmp/.../sim
code de sortie du script entier : 0
```

Le code de sortie est **0** : l'échec est invisible non seulement dans le
comportement, mais aussi pour tout appelant — tâche planifiée, intégration
continue, superviseur.

Les protections ont été mesurées séparément :

```
aucune       : suite exécutée = OUI | code de sortie = 0
set -e       : suite exécutée = non | code de sortie = 1
cd || exit   : suite exécutée = non | code de sortie = 1
```

Et les angles morts de `set -e` ont été mesurés aussi : il est désactivé dans
une condition, après `&&` ou `||`, et en milieu de pipeline —
`cat /fichier-inexistant | wc -l` rend **0** sans `pipefail` et non nul avec.

La leçon passe de 1986 à 3201 mots, avec une section mesurée et une pratique en
cinq points à livrables. **Elle a été corrigée parce que l'audit l'a trouvée,
pas pour faire monter une moyenne.**

### 2.3 `ai-security` — tient, avec un écart mineur signalé et non corrigé

Lecture intégrale. La leçon est solide sur le fond : son exemple guidé porte sur
la fuite plutôt que sur l'injection, sa pratique demande d'**attaquer son propre
système avant de le défendre** et d'en réussir au moins une attaque, et sa
correction identifie le piège le plus profond du domaine — une défense écrite
dans le prompt n'est pas une barrière, seulement du texte concurrent dans le
même contexte, et elle ne résiste qu'aux attaques qu'on a soi-même imaginées.

**Écart signalé, non corrigé :** sa pratique fait 56 mots et n'a pas la forme en
cinq points à livrables nommés adoptée au CP10. Le fond est là, la forme est
antérieure. Ce n'est pas un défaut pédagogique, et le corriger reviendrait à
uniformiser une leçon qui fonctionne — ce que le §11 du brief interdit
explicitement (« la clonification n'est pas la cohérence »). **Signalé ici,
laissé en l'état.**

---

## 3. Restitution simulée

Protocole : pour quatre leçons de l'échantillon, on liste ce qu'un apprenant
pourrait **restituer et refaire** à partir de la seule leçon, sans autre source.

**`caching-performance`** — restituable : la distinction entre invalider et
expirer ; pourquoi un cache placé sur une requête N+1 n'est jamais touché
(mesuré : 51 requêtes avec cache comme sans) ; le calcul du taux de succès
nécessaire pour qu'un cache soit rentable. Refaisable : poser un cache, mesurer
le taux de succès, démontrer qu'il ne sert à rien sur des clés non réutilisées.
**Suffisant.**

**`css-grid`** — restituable : la différence entre `auto-fill` et `auto-fit`
avec les nombres (238 px × 4 contre 322,66 px × 3 + 0) ; pourquoi une piste
vide occupe de la place dans un cas et pas dans l'autre. Refaisable : reproduire
la mesure dans un navigateur. **Suffisant**, et c'est la leçon dont la
restitution est la plus vérifiable de l'échantillon.

**`llm-observability`** — restituable : ce qu'il faut journaliser sur un appel
de modèle et pourquoi le coût se journalise par appel et non en agrégat.
Refaisable : instrumenter un appel. **Suffisant**, mais la pratique (46 mots)
ne demande pas de livrable nommé — même écart de forme que `ai-security`,
signalé et laissé.

**`k8s-workloads`** — restituable : le test de destruction, et les six endroits
où un état se cache. Refaisable : l'audit « sans état » de sa propre application,
qui produit un tableau à quatre colonnes. **Suffisant**, et remarquable en ceci
que la pratique ne demande **aucun accès à Kubernetes** — elle porte sur
l'application de l'apprenant. C'est la bonne réponse à une contrainte
d'environnement, plutôt qu'une pratique fictive.

---

## 4. Verdict du CP13

- **24 / 24** passent les trois seuils numériques.
- **1 / 24** a échoué à la lecture (`terminal-shell-filesystem`) : défaut réel,
  trouvé par l'audit, corrigé avec une vérification exécutée.
- **2 / 24** portent un écart de forme signalé et **non corrigé**
  (`ai-security`, `llm-observability`) : pratique substantielle sur le fond,
  sans la forme en cinq points. Uniformiser serait de la clonification.
- **0 / 24** présente une sortie comme mesurée sans l'être.

Le fait que l'échantillon ait été tiré **avant** toute réécriture est ce qui rend
ce résultat exploitable : il n'a pas été choisi pour être flatteur, et il a
effectivement produit un défaut que les compteurs ne voyaient pas.
