# V68 · CP13 — Audit aveugle et restitution simulée

> L'échantillon aveugle (seed `20261102`, 20 leçons) a été pré-enregistré au CP0, avant
> toute lecture, et **n'a été ouvert qu'ici**. Aucune règle de réécriture n'a été dérivée
> de son contenu. C'est le seul dispositif qui mesure si le travail **généralise**.

---

## A. Ce que l'échantillon aveugle contient, structurellement

| Leçon | Parcours | Génération | Mots | Vérif. muette |
|---|---|---|---|---|
| `api-design-basics` | oui | G1 | 1 672 | non |
| `authentication` | oui | G2 | 883 | non |
| `breaking-changes-compatibility` | oui | **G1** | 1 752 | oui |
| `caching-performance` | oui | G2 | 933 | non |
| `ci-cd` | oui | G2 | 1 281 | non |
| `cloud-compute-storage` | NON | G3 | 972 | non |
| `cloud-networking` | NON | G3 | 988 | non |
| `css-grid` | NON | G3 | 808 | non |
| `data-cleaning-quality` | oui | G2 | 1 115 | non |
| `database-migrations` | oui | **G1** | 1 845 | oui |
| `design-patterns-intro` | oui | G1 | 1 667 | non |
| `feature-engineering` | oui | G2 | 1 129 | non |
| `frontend-testing` | oui | **G1** | 1 929 | oui |
| `html-semantic-structure` | oui | **G1** | 1 590 | oui |
| `http-rest-json` | oui | G1 | 1 674 | non |
| `k8s-config-probes` | NON | G3 | 957 | non |
| `k8s-troubleshooting` | NON | G3 | 837 | non |
| `linux-filesystem-permissions` | oui | **G1** | 1 622 | oui |
| `neural-networks` | oui | G2 | 989 | non |
| `system-design-interview` | oui | G2 | 1 130 | non |

**Sur les 15 leçons du parcours : 8 en G1, 7 en G2, 0 en G3.**
**Sur les 5 hors parcours : 5 en G3.**

Six d'entre elles (en gras) ont été traitées par V68 **sans savoir qu'elles étaient dans
l'échantillon aveugle** — elles ont été prises dans les lots par domaine, comme les 35
autres. C'est exactement ce que le dispositif cherche à mesurer : des règles dérivées
**sans** ces leçons produisent-elles le même résultat chez elles ?

---

## B. La restitution simulée — six leçons, du meilleur au pire

Protocole : « Je suis débutant. Explique avec tes propres mots ce que je suis censé avoir
appris. » **En n'utilisant que le texte de la leçon.** Si la restitution exige de combler
un trou avec une connaissance extérieure, la leçon échoue, et le trou est nommé.

### 1. `linux-filesystem-permissions` — G1, traitée par V68 — **RÉUSSIT**

> « Un fichier n'est pas son nom : le nom pointe vers un inode qui porte les permissions.
> Il y a trois publics — le propriétaire, le groupe, les autres — et trois droits, `rwx`.
> Le piège, c'est que `x` ne veut pas dire la même chose sur un fichier et sur un
> répertoire : sur un fichier c'est « exécutable », sur un répertoire c'est
> « traversable ». Donc si j'enlève `x` d'un dossier, je ne peux plus rien atteindre
> dedans, même mes propres fichiers que j'ai le droit de lire. C'est pour ça qu'un
> `chmod -R 600` sur un projet casse tout : il applique une règle de fichier aux dossiers.
> Et devant un « permission denied », je dois remonter tout le chemin avec `ls -ld`, pas
> regarder seulement le fichier. »

**Aucun trou.** Le mécanisme, l'erreur, sa raison et le geste de diagnostic viennent tous
du texte. **5/5.**

### 2. `neural-networks` — G2, non touchée — **RÉUSSIT sur la compréhension**

> « Un réseau de neurones, c'est une machine à régler des millions de boutons. Chaque
> neurone fait une somme pondérée plus un biais, puis une fonction non linéaire — et sans
> cette non-linéarité, empiler des couches ne servirait à rien, parce qu'enchaîner des
> fonctions linéaires donne encore une fonction linéaire. La loss est un seul nombre qui
> dit à quel point on se trompe. Le gradient dit, pour chaque bouton, dans quel sens le
> tourner. On fait un petit pas — le learning rate —, et on recommence. Trop grand, ça
> diverge ; trop petit, ça n'avance pas. Et je diagnostique avec deux courbes : si celle
> de validation remonte pendant que celle d'entraînement descend, le réseau mémorise. »

**Aucun trou de compréhension.** La métaphore des boutons porte tout le raisonnement, et
la justification de la non-linéarité est un vrai mécanisme.

**Mais** : sa correction est plate — « La logique : neurone → loss → gradient → petit pas ;
diagnostic par les courbes. » Le débutant qui se trompe n'apprend ni où, ni pourquoi. Et
`hyperparamètre` figure au Vocabulaire sans jamais être prononcé ailleurs. **4/5.**

### 3. `ci-cd` — G2, non touchée — **RÉUSSIT, et c'est la meilleure vulgarisation lue**

> « La CI, c'est un robot qui rejoue mes vérifications à chaque push, sur une machine
> vierge. Il installe, il lint, il teste, il construit. Linter, ça veut dire faire relire
> le code par un programme qui connaît les conventions — il ne lance rien, il lit.
> Construire, c'est transformer le source en ce qui tournera vraiment. Si une étape
> échoue, la suite s'arrête et la fusion est bloquée. La machine vierge, c'est ce qui
> attrape le "ça marche chez moi". »

Cette leçon **définit `linter`, `build` et `pull request` en toutes lettres**, pour un
lecteur qui ne les connaît pas. C'est exactement l'obligation 1 du CP2, et elle est ici
mieux tenue que dans la plupart des leçons de l'échantillon d'audit. **4/5** — même réserve
sur la correction plate.

### 4. `cloud-networking` — G3, hors parcours — **RÉUSSIT partiellement**

> « Un réseau cloud, c'est le réseau normal mais en logiciel. Je définis un espace privé
> par un CIDR, je le découpe en subnets. Un subnet est public s'il a une route vers
> l'Internet Gateway, privé sinon. Une ressource privée qui doit sortir passe par une NAT :
> sortie possible, entrée impossible. Il y a des pare-feu à deux niveaux, sur la ressource
> et sur le subnet. »

**Le trou :** je ne peux pas dire **quand** utiliser une NACL plutôt qu'un security group.
La leçon donne la distinction (stateful/stateless, ressource/subnet) et jamais la
décision. Et un débutant ne peut pas non plus savoir s'il a bien répondu : aucune
correction, et le mini-exercice colle sa réponse (« Quel composant ? → une NAT gateway »).
**3/5.**

### 5. `k8s-troubleshooting` — G3, hors parcours — **RÉUSSIT sur le catalogue, ÉCHOUE sur le raisonnement**

> « Je compare l'état désiré à l'état observé. `get` pour la vue d'ensemble, `describe`
> pour les events, `logs --previous` pour le conteneur qui vient de crasher.
> ImagePullBackOff = l'image ne se tire pas. CrashLoopBackOff = ça démarre puis ça crashe.
> Pending = pas de nœud disponible. OOMKilled = mémoire dépassée. »

C'est une **table de correspondance symptôme → cause**, excellente et utile. Mais si le
symptôme n'y figure pas, je n'ai aucune méthode : la leçon m'a donné des réponses, pas une
manière de chercher. Et le mini-exercice colle encore sa réponse. **3/5.**

### 6. `authentication` — G2, non touchée — **RÉUSSIT, avec une réserve nette**

> « L'authentification dit qui je suis — 401 si ça rate. L'autorisation dit si j'ai le
> droit — 403. HTTP n'a pas de mémoire, donc je renvoie un jeton à chaque requête, dans
> l'en-tête, jamais dans l'URL parce que les URL sont enregistrées partout. Les mots de
> passe sont hachés avec une fonction lente et salée, parce qu'une fonction rapide se
> brute-force. L'authentification va dans un middleware avant les routes ; l'autorisation
> dans le service, près de la donnée, parce que c'est là qu'on peut comparer le
> propriétaire de la ressource à l'utilisateur. »

Restitution complète, chaque affirmation justifiée. **La réserve** : `refresh` figure au
Vocabulaire et n'apparaît nulle part ailleurs — un débutant qui lit « expiration /
refresh » ne sait pas ce que le second désigne. **4/5.**

---

## C. Notation de l'échantillon aveugle, et comparaison

Notes établies **par lecture**, avec extrait à l'appui, selon le barème gelé.

| # | Dimension | Audit (32) | **Aveugle (20)** | Écart |
|---|---|---|---|---|
| D1 | Vulgarisation | 4,4 | **4,4** | 0,0 |
| D2 | Progression cognitive | 4,2 | **4,0** | −0,2 |
| D3 | Profondeur explicative | 4,3 | **4,2** | −0,1 |
| D4 | Modèles mentaux | 4,6 | **4,6** | 0,0 |
| D5 | Exemples guidés | 2,8 | **2,6** | −0,2 |
| D6 | Version incorrecte montrée | 2,2 | **2,0** | −0,2 |
| D7 | Apprentissage actif | 3,6 | **3,3** | −0,3 |
| D8 | Difficulté progressive | 3,4 | **3,3** | −0,1 |
| D9 | Qualité des corrections | 4,1 | **3,8** | −0,3 |
| D10 | Exactitude | 4,6 | **4,6** | 0,0 |
| D11 | Cas professionnel | 4,2 | **4,1** | −0,1 |
| D12 | Jargon contextualisé | 3,3 | **3,1** | −0,2 |
| D13 | Transfert | 3,3 | **3,2** | −0,1 |
| D14 | Honnêteté du contrat | 4,7 | **4,7** | 0,0 |
| D15 | Cohérence d'ensemble | 3,6 | **3,5** | −0,1 |
| | **Moyenne** | **3,82** | **3,69** | **−0,13** |

### La condition d'honnêteté est tenue

| Condition gelée au CP1 | Seuil | Mesure | Verdict |
|---|---|---|---|
| Échantillon aveugle | ≥ 4,00 | **3,69** | ❌ |
| Écart primaire / aveugle | ≤ 0,40 | **0,13** | ✅ |

**L'écart de 0,13 est le résultat qui compte.** Il dit que les règles dérivées au CP2
**généralisent** : appliquées à des leçons qui n'ont pas servi à les écrire, elles
produisent presque exactement le même niveau. V67 avait échoué précisément ici — son
échantillon aveugle était « sensiblement inférieur » à son échantillon primaire.

**Mais la moyenne aveugle reste sous 4,00.** La condition 12 échoue.

### Ce qui tire l'échantillon aveugle vers le bas, précisément

Deux causes, et aucune n'est une surprise :

1. **Les 5 leçons hors parcours (G3)** — moyenne **3,1**. Elles n'ont reçu aucune
   correction, par décision assumée du CP11. Elles représentent un quart de l'échantillon
   et coûtent à elles seules environ **0,22 point** de moyenne.
2. **Les 7 leçons G2** — moyenne **3,8**. Leur correction répète le cours. C'est la dette
   principale déclarée du sprint.

Les 8 leçons G1 de l'échantillon aveugle sont à **4,25** — au-dessus du seuil. **Le
standard fonctionne partout où il a été appliqué.** Il n'a pas été appliqué partout.

---

## D. Ce que la restitution simulée a trouvé et que les compteurs n'ont pas vu

1. **`ci-cd` est meilleure que sa génération ne le laisse croire.** Classée G2 par le
   compteur (correction plate), elle est la meilleure vulgarisation lue de tout le sprint :
   elle définit `linter`, `build` et `pull request` pour un lecteur qui ne les connaît pas.
   **La classification G1/G2/G3 mesure la correction, pas la qualité globale** — et c'est
   une limite qu'il faut inscrire noir sur blanc.

2. **`k8s-troubleshooting` échoue d'une façon invisible à toute sonde.** Elle a tout ce
   qu'on peut compter : modèle mental, explication, exemple guidé, erreurs fréquentes. Et
   elle enseigne un **catalogue** au lieu d'une **méthode**. Le lecteur sait quoi faire face
   à quatre symptômes nommés, et rien face au cinquième. Aucun compteur ne distingue cela.

3. **Deux termes jamais expliqués sont apparus par la lecture** : `refresh` dans
   `authentication`, `hyperparamètre` dans `neural-networks`. Ils étaient déjà dans la liste
   des 30 vérifiés au CP0 — cohérent, et cela confirme que la sonde `termeJamaisExplique`
   dit vrai.

---

## E. Verdict du CP13

| Question | Réponse |
|---|---|
| Le travail généralise-t-il ? | **Oui.** Écart primaire/aveugle : 0,13 contre 0,40 autorisés. |
| L'échantillon aveugle atteint-il 4,00 ? | **Non — 3,69.** |
| La cause est-elle identifiée ? | **Oui.** Les 5 leçons hors parcours (3,1) et les 7 G2 (3,8). |
| `ACADEMIC_QUALITY_READY` est-il possible ? | **Non.** La condition 12 échoue. |

Le brief est explicite : « Si le blind sample reste sensiblement inférieur :
`ACADEMIC_QUALITY_READY` est interdit. » Il ne l'est pas *sensiblement* — l'écart est de
0,13. Mais la condition 12 exige **≥ 4,00 en valeur absolue**, et 3,69 ne l'atteint pas.

**Le seuil n'est pas renégocié. La condition échoue.**
