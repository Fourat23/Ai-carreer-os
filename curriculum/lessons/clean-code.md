<!-- keep -->
# Leçon — Clean code

## 🌍 Le problème d'abord
Tu ouvres un fichier de code écrit il y a six mois (peut-être par toi) et… tu ne
comprends plus rien : des variables nommées `x`, `data2`, des fonctions de 200 lignes,
aucune logique apparente. Résultat : tu as PEUR d'y toucher, tu introduis des bugs, tu
perds des heures. Le **clean code** attaque ce problème très concret : écrire du code
qu'un humain (souvent toi-même plus tard) peut relire, comprendre et modifier sans
douleur. Ce n'est pas de la décoration : c'est ce qui fait qu'un projet reste
modifiable au lieu de pourrir. Cette leçon donne les principes qui rendent le code
lisible.

## 🎯 Objectif
Écrire du code **lisible et modifiable** : nommage intentionnel, fonctions courtes à
responsabilité unique, réduction de la complexité, commentaires utiles — et savoir
reconnaître le code « sale » pour le corriger.

## 🧩 Prérequis
Tu dois savoir écrire des **fonctions** et manipuler des **variables/structures**
(`/doc/lessons/javascript-basics`), car le clean code parle de la FAÇON d'écrire ce
que tu sais déjà écrire. Aucune notion préalable de « qualité » n'est supposée : elle
est construite ici, exemple à l'appui.

## 🧠 Modèle mental
Le code est LU bien plus souvent qu'écrit. On optimise donc pour le LECTEUR, pas pour
le clavier. Un bon nom remplace un commentaire ; une fonction courte qui fait UNE
chose se comprend d'un coup d'œil ; réduire les niveaux d'imbrication réduit la charge
mentale. « Est-ce que quelqu'un d'autre comprendrait ça en 10 secondes ? » est le test.

## 💡 Pourquoi c'est important
Le code est LU dix fois plus qu'il n'est écrit — par tes collègues, tes reviewers, et surtout par toi-dans-six-mois, qui est un étranger. Le clean code n'est pas de l'esthétique : c'est de l'économie (moins de temps de lecture, moins de bugs, moins de peur de modifier). En entretien, la propreté de ton code sous pression est évaluée dans CHAQUE exercice, même quand personne ne le dit.

## Explication complète

### Le principe unique : optimiser pour le lecteur
Toutes les règles découlent d'une question : « le prochain lecteur comprendra-t-il sans effort ? ». Le prochain lecteur ne connaît ni le contexte de ta journée, ni tes raccourcis mentaux, ni le ticket que tu traitais.

### Le nommage : la moitié du travail
Un nom doit révéler l'INTENTION : `calculerRemiseFidelite` > `calcRem` > `f2`. Les booléens se lisent comme des questions (`estValide`, `aExpire`). Les fonctions commencent par un verbe. La longueur d'un nom est proportionnelle à sa portée (un `i` de boucle courte : OK ; une variable globale cryptique : non). Renommer est GRATUIT et rapporte à chaque lecture — c'est le refactoring au meilleur rapport qualité/prix.

### Les fonctions : petites, à une responsabilité
Une fonction fait UNE chose, nommable sans « et ». Elle tient à l'écran. Elle garde UN niveau d'abstraction : une fonction qui mélange logique métier (« calculer la remise ») et détails techniques (« parser les centimes ») force le lecteur à zoomer/dézoomer sans cesse — extraire le détail dans une fonction nommée rétablit la lecture fluide.

Les **guard clauses** (retours anticipés pour évacuer les cas invalides) gardent le code principal à plat : trois `if` imbriqués = une pyramide illisible ; trois guards = un texte qui se lit de haut en bas.

### Les commentaires : POURQUOI, jamais QUOI
La ligne suivante se lit toute seule ; ce qui ne se lit pas, c'est la DÉCISION invisible : « pourquoi ce timeout de 30s ? », « pourquoi pas la lib standard ici ? ». Un commentaire qui paraphrase le code est du bruit qui se périme ; un commentaire qui explique une contrainte est de l'or. Corollaire : si tu as besoin d'un commentaire pour expliquer CE QUE fait un bloc, extrais le bloc dans une fonction dont le NOM le dit.

### DRY, avec discernement
Ne te répète pas… quand c'est la MÊME connaissance. Deux blocs identiques qui changeraient pour la même raison → factoriser. Deux blocs RESSEMBLANTS qui évolueront différemment → les fusionner crée un couplage pire que la duplication (le futur `if` de paramétrage qui enfle). La duplication se corrige facilement ; la mauvaise abstraction se paie longtemps.

### La séparation calcul / effets
Le cœur du clean code structurel (jour 26) : la LOGIQUE en fonctions pures (testables, prévisibles), les EFFETS (fichiers, réseau, affichage) aux frontières. Si c'est dur à tester, c'est mal découpé — le test est un détecteur de design.

## Concepts clés
Nommage d'intention · une fonction = une responsabilité · niveau d'abstraction cohérent · guard clauses · commentaire = pourquoi · DRY vs mauvaise abstraction · code smells (fonction géante, paramètres en rafale, imbrication profonde, noms menteurs, duplication) · boy-scout rule (laisser le code un peu plus propre qu'on l'a trouvé).

## 🧭 Exemple guidé — quatre passes sur une fonction hostile

**La situation.** Tu ouvres un fichier et tu tombes sur ceci. Le code marche, il est en
production, et personne ne sait exactement ce qu'il fait.

```js
function proc(u, d) {
  if (u) { if (u.act) { let t = 0; for (let i = 0; i < d.length; i++) {
    if (d[i].uid == u.id && d[i].st != 'x') t += d[i].mt; } return t; } }
  return null;
}
```

**Ce qui rend le cas non trivial.** On ne peut pas « rendre ce code propre » en une fois :
on ne sait pas encore ce qu'il fait. Chaque passe doit donc **révéler quelque chose** sans
rien changer au comportement — et l'ordre des passes n'est pas indifférent.

**Passe 1 — comprendre avant de toucher, en nommant.**

Le premier geste n'est pas de restructurer, c'est de **lire et renommer**. `u` a un champ
`act` et un `id` ; les éléments de `d` ont `uid`, `st`, `mt`, et on additionne `mt`. On
devine : un utilisateur, des commandes, un montant.

```js
function proc(utilisateur, commandes) {
  if (utilisateur) { if (utilisateur.actif) { let total = 0;
    for (let i = 0; i < commandes.length; i++) {
      if (commandes[i].utilisateurId == utilisateur.id && commandes[i].statut != 'x')
        total += commandes[i].montant; } return total; } }
  return null;
}
```

Rien n'a bougé structurellement, et pourtant la fonction vient de devenir lisible. **Le
renommage n'est pas de la cosmétique : c'est l'outil de compréhension le moins cher qui
existe**, et il se fait sans risque puisqu'un éditeur le vérifie.

Reste une inconnue : `'x'`. On ne peut pas la deviner — il faut chercher dans le code ou la
base. Supposons qu'on trouve `'annulee'`. **On ne renomme jamais une valeur qu'on n'a pas
vérifiée** : c'est là qu'un refactoring introduit un bug.

**Passe 2 — aplatir les conditions imbriquées.**

Deux `if` emboîtés, et le vrai retour est au fond. La transformation standard est la **guard
clause** : on traite les cas de sortie d'abord, et le corps se retrouve au niveau supérieur.

```js
if (!utilisateur || !utilisateur.actif) return null;
// ... le reste, dégagé de deux niveaux d'indentation
```

Ce n'est pas seulement plus plat. Le lecteur apprend en deux lignes ce que la fonction
refuse de traiter, avant d'avoir à comprendre ce qu'elle fait.

**Passe 3 — nommer l'intention de la boucle.**

La boucle fait deux choses : elle **sélectionne** (les commandes de cet utilisateur, non
annulées) puis elle **additionne**. Les séparer met l'intention dans le code au lieu de la
laisser dans la tête du lecteur :

```js
function totalCommandesActives(utilisateur, commandes) {
  if (!utilisateur?.actif) return null;
  return commandes
    .filter((c) => c.utilisateurId === utilisateur.id && c.statut !== 'annulee')
    .reduce((total, c) => total + c.montant, 0);
}
```

Le nom de la fonction vient en dernier, et c'est normal : **on ne peut nommer correctement
qu'une fois qu'on a compris.** `proc` était un aveu d'ignorance de l'auteur ; `totalCommandesActives`
dit ce qu'on obtient.

**Passe 4 — la seule qui change réellement quelque chose.**

`==` est devenu `===`. Ce n'est pas un détail de style : `==` convertit les types, donc
`utilisateurId == "42"` est vrai pour l'utilisateur 42. Si des identifiants arrivent en
chaîne depuis une API, l'ancienne version comptait des commandes qui ne sont pas les
siennes.

**Cette passe modifie le comportement.** Elle ne fait donc pas partie du refactoring : elle
mérite son propre commit, son propre test, et une vérification que rien ne dépendait de
l'ancien laxisme. Confondre les deux est la manière la plus fiable de rendre une régression
introuvable.

**Comment tu sais que ça marche.** Avant la passe 1, écris deux ou trois tests de
caractérisation sur la fonction d'origine — un utilisateur inactif (`null`), un utilisateur
avec deux commandes dont une annulée, un utilisateur sans commande (`0`, pas `null`). Ils
doivent rester verts après les passes 1 à 3. S'ils rougissent à la passe 4, c'est **normal**
et c'est l'information : tu viens de mesurer ce que `==` laissait passer.

**Ce que ça t'a appris.** Le code propre ne s'obtient pas en visant la propreté. Il s'obtient
par une suite de gestes dont chacun **révèle** le suivant : nommer permet de voir la
structure, aplatir permet de voir l'intention, séparer permet de nommer la fonction. Et
l'on garde soigneusement à part le seul geste qui change le comportement.

**Variante qui déplace le problème.** La même fonction, mais la boucle contient un
`console.log` et un `await sauvegarder(...)`. Rejoue les quatre passes : tu buteras à la
passe 3, parce qu'on ne transforme pas en `filter`/`reduce` une boucle qui produit des
**effets**. Le geste devient un autre — séparer d'abord le calcul de l'effet, en deux
fonctions dont l'une est pure. **La technique de refactoring ne se choisit pas sur la forme
du code mais sur ce qu'il fait au monde extérieur.**

## ⚠️ Erreurs fréquentes
- Sur-commenter l'évident et sous-commenter les décisions.
- « Je nettoierai plus tard » : plus tard n'existe pas ; la propreté se maintient en continu.
- Refactorer sans tests : on casse en croyant améliorer.
- Le clean code dogmatique : des fonctions de 2 lignes partout peuvent être PIRES qu'une fonction claire de 15 lignes. Le juge est la lisibilité, pas la règle.

## 🔗 Liens avec le programme
Les pipelines RAG (mois 8-9) sont des chaînes de transformations : la discipline « petites fonctions pures nommées » les rend débuggables étape par étape. Les prompts eux-mêmes bénéficient du clean code (structure claire, intention explicite, versionnés). Et un recruteur juge ton portfolio d'abord par la lisibilité de ton code — avant même de le lancer.

## Mini-exercice
Prends ta plus grosse fonction du mois 1. Applique dans l'ordre : (1) renommer pour l'intention, (2) guard clauses, (3) extraire les blocs commentables en fonctions nommées, (4) séparer calcul et affichage. Compare avant/après à voix haute : lequel expliques-tu le plus vite ?

## 🔥 Exercice plus difficile
« Ce code est plus lisible » est une opinion. Tu vas construire l'outil qui en mesure
une partie — et découvrir précisément quelle partie lui échappe.

**A — l'instrument.** Écris trois fonctions de mesure sur une chaîne de code source :
la **complexité cyclomatique** (1, plus un par point de décision : `if`, `else if`, `for`,
`while`, `case`, `catch`, `&&`, `||`, `??`, ternaire), la **profondeur d'imbrication**
maximale (compte les accolades ouvrantes et fermantes), et le **nombre de lignes non
vides**. Une trentaine de lignes suffit.

**B — avant/après.** Applique-les à ta fonction du mini-exercice, dans ses deux versions.
Livrable : un tableau à six cases. Puis la question qui compte : compare la complexité
**maximale d'une seule fonction** et la complexité **totale du fichier**. Que constates-tu ?

**C — le test négatif de ton propre instrument.** Prends une fonction courte et bien
nommée, et réécris-la à l'identique en renommant tout en `proc`, `x`, `y`, `t`, `v`.
Mesure les deux. Livrable : la conclusion écrite sur ce que ton instrument ne voit pas.

**D — le faux positif.** Fabrique une fonction que ton instrument signale (complexité
supérieure à 10) et qui se lit pourtant sans le moindre effort. Livrable : le code, ses
chiffres, et la mesure qui permet de rattraper le faux positif.

**Critère de réussite** : tu peux répondre à « faut-il refuser une fusion sur un seuil de
complexité ? » en citant tes propres chiffres du C et du D.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Après extraction en quatre fonctions, la complexité totale du fichier a-t-elle beaucoup
   baissé ? Si non, qu'est-ce qui s'est amélioré ?
2. Pourquoi la profondeur d'imbrication est-elle un meilleur indicateur de charge mentale
   que le nombre de branches ?
3. Une porte d'intégration continue refuse toute fonction au-dessus de 10 de complexité.
   Cite un cas où elle bloque du bon code, et un cas où elle laisse passer du mauvais.
4. Les *guard clauses* réduisent la profondeur. Réduisent-elles la complexité cyclomatique ?

## ✅ Correction attendue
**La démarche**, et l'ordre n'est pas décoratif. Renommer d'abord : c'est sans risque, et une fois les noms justes, la moitié des problèmes de structure deviennent visibles — on VOIT qu'une fonction fait deux choses quand son nom honnête contient « et ». Guards ensuite, pour aplatir. Extraction après, parce qu'on sait enfin quoi extraire. Séparation calcul/affichage en dernier, parce que c'est la seule étape qui change vraiment la forme du programme.

**L'erreur probable, et elle est structurelle, pas esthétique.** Le réflexe le plus courant est d'extraire en découpant par POSITION : les trente premières lignes deviennent `partie1()`, les vingt suivantes `partie2()`. La fonction d'origine tient maintenant à l'écran, chaque morceau est court, tous les compteurs sont au vert — et le code est devenu **plus difficile** à lire. `partie1` ne se comprend pas sans `partie2`, elles se passent six variables, et on doit désormais sauter entre trois endroits pour suivre ce qu'on lisait d'une traite.

Le piège séduit parce qu'il satisfait la règle énoncée (« des fonctions courtes ») en trahissant sa raison d'être (« une fonction = une idée nommable »). Le test qui départage est simple : **si tu ne peux pas nommer le morceau extrait sans dire « la suite de » ou « la deuxième partie de », tu as coupé au mauvais endroit.** Découpe par responsabilité, jamais par longueur.

**Alternative défendable** : ne pas extraire du tout. Une fonction de quinze lignes qui se lit de haut en bas, sans imbrication, avec de bons noms, est souvent supérieure à quatre fonctions de quatre lignes éparpillées. La lisibilité est le juge ; « courte » n'est qu'un indice, et la leçon le dit déjà dans ses anti-patterns. Face à deux versions, choisis celle que tu peux expliquer le plus vite à voix haute — c'est exactement ce que demande la dernière étape de l'exercice.

**Vérifie seul, sans corrigé** :
1. Donne à chaque fonction extraite un nom sans « et », sans « partie », sans « suite ». Si tu n'y arrives pas, la découpe est mauvaise.
2. Compte les niveaux d'imbrication : tu dois être passé de trois ou quatre à un ou deux.
3. Relis chaque commentaire survivant : s'il dit CE QUE fait le code, supprime-le ou remplace-le par un nom.
4. **Le comportement n'a pas changé.** Si tu n'as pas de test, écris-en un AVANT de refactorer — sinon tu ne nettoies pas, tu paries.

### Correction de l'exercice difficile

> Chiffres produits par `scripts/v70-verifications/lisibilite-mesuree.mjs`, sur une
> fonction de calcul de commande écrite dans les deux styles. Les tiens différeront ;
> les rapports entre les colonnes, non.

**B — avant/après.**

| | complexité | profondeur | lignes |
|---|---|---|---|
| avant, une fonction | 14 | **8** | 32 |
| après, quatre fonctions | 10 (fichier) | **2** | 22 |

Et le détail, qui est le vrai résultat :

| fonction | complexité | profondeur |
|---|---|---|
| `verifierCommande` | 3 | 1 |
| `verifierLigne` | 3 | 1 |
| `appliquerRemise` | 4 | 1 |
| `totalCommande` | 3 | 2 |

Complexité **maximale d'une fonction** : 14 → **4**. Complexité **totale** : 14 → **13**.

*Pourquoi deux chiffres différents pour l'après — 10 et 13 ?* Parce que la formule part
de 1 (le chemin qui traverse sans brancher) et ajoute les points de décision. Mesuré comme
un seul bloc, le fichier compte **un** chemin de base : 1 + 9 = 10. Mesuré fonction par
fonction, chacune compte le sien : quatre chemins de base au lieu d'un, soit 10 + 3 = 13.
Les deux sont exacts ; ils ne répondent pas à la même question. Si un chiffre te surprend,
c'est presque toujours qu'il répond à une autre question que celle que tu poses — et
vérifier laquelle vaut mieux que le recopier.

**Le constat qui doit te rester** : la refactorisation n'a supprimé qu'un point de
complexité sur quatorze. Elle ne l'a pas fait disparaître, elle l'a **répartie**. La
logique métier est la même, elle a toujours autant de cas ; ce qui a changé, c'est la
quantité qu'il faut tenir en tête d'un seul coup. La profondeur passe de 8 à 2.

C'est la raison profonde pour laquelle on découpe : **pas pour simplifier le programme,
mais pour tenir dans une mémoire de travail humaine.** Une machine exécute les deux
versions à la même vitesse. Si tu retiens une phrase de cette leçon, prends celle-là —
elle explique aussi pourquoi une découpe qui produit quatre fonctions dépendantes les unes
des autres n'améliore rien : la charge revient au moment où il faut les lire ensemble.

**C — ce que l'instrument ne voit pas.** Les deux versions suivantes mesurent
**exactement pareil** : complexité 3, profondeur 1, 5 lignes.

```js
function appliquerRemise(montant, remise) { … }   // complexité 3
function proc(x, y) { … }                          // complexité 3
```

Aucune des trois mesures ne distingue un nom d'intention d'un nom opaque. Or le nommage
est le premier facteur de lisibilité — c'est le point 1 de cette leçon. **La partie la
plus importante de la propreté du code est invisible à toute métrique automatique.**

**D — le faux positif.** Un `switch` de douze cas plats atteint une complexité de **13**,
au-dessus du seuil habituel de 10, avec une profondeur de **2**. Il se lit pourtant
instantanément : les douze branches sont indépendantes et ne s'imbriquent pas.

**L'erreur probable, et elle est institutionnelle.** On installe une porte « complexité
≤ 10 » et l'on croit avoir mis de la qualité. Les mesures ci-dessus montrent qu'elle fait
les deux erreurs à la fois : elle **bloque** le `switch` parfaitement clair (D) et
**laisse passer** `proc(x, y)` sans un mot (C). Le piège séduit parce qu'un seuil chiffré
paraît objectif, et parce qu'il est le seul critère qu'on puisse appliquer sans lire.

**Alternative défendable** : garder la porte, mais sur la **profondeur** plutôt que sur la
complexité, avec un seuil de 3 ou 4. La profondeur suit bien mieux la charge mentale, ne
sanctionne pas les branches plates, et se contourne moins facilement. Elle reste aveugle
au nommage — aucune métrique ne le voit — donc elle ne remplace pas la relecture ; elle
choisit seulement ce qu'on automatise et ce qu'on laisse aux humains. C'est la même
discipline que dans `readme-documentation` : savoir ce que le contrôle mesure et ce qu'il
ne mesure pas.

### Correction de la vérification de compréhension

1. **Non** : 14 → 13, un point. Ce qui a changé est la complexité **par unité de lecture**,
   14 → 4, et la profondeur, 8 → 2. On ne supprime pas la complexité d'un problème en
   déplaçant du code ; on la découpe en morceaux qui tiennent dans la tête.
2. Parce que des branches plates se lisent l'une après l'autre et s'oublient aussitôt
   traitées, tandis qu'une imbrication oblige à retenir **toutes les conditions
   englobantes en même temps** pour comprendre la ligne qu'on lit. À la profondeur 8, il
   faut tenir huit conditions simultanément — au-delà de ce qu'une mémoire de travail
   humaine retient.
3. Elle bloque le `switch` plat de douze cas (complexité 13, profondeur 2), qui est du bon
   code. Elle laisse passer `proc(x, y)` (complexité 3), qui est du mauvais code. Un seuil
   automatique se trompe dans les deux sens ; il sert à **attirer l'attention**, jamais à
   trancher.
4. **Non.** Une *guard clause* transforme `if (ok) { … }` en `if (!ok) return;` — même
   point de décision, même chemin. La mesure le confirme : la complexité totale bouge à
   peine (14 → 13) alors que la profondeur est divisée par quatre. Les deux quantités
   mesurent des choses différentes, et c'est précisément pourquoi il en faut deux.

## 🏢 Cas professionnel
Une équipe reprend un service de tarification écrit par quelqu'un parti depuis. Une fonction de 400 lignes, des noms comme `tmp2` et `flagB`, aucun test. Personne n'ose y toucher : chaque évolution demandée est chiffrée en semaines, puis contournée par un `if` supplémentaire au début — ce qui rend la fonction encore plus longue à chaque passage.

Ce cercle a un nom, et c'est le seul argument qui compte vraiment pour le clean code : **le coût d'un changement est proportionnel à ce qu'il faut comprendre avant de le faire.** Du code illisible ne coûte rien à écrire et se paie à chaque lecture, pendant des années. C'est aussi ce qui rend la *boy-scout rule* rentable : personne n'obtiendra jamais le budget d'un « grand nettoyage », alors que nettoyer les vingt lignes qu'on touche aujourd'hui ne demande l'autorisation de personne.

Ce que les équipes en tirent en pratique : on ne refactorise pas un fichier parce qu'il est laid, on le refactorise **quand on doit le modifier** — et on y laisse les noms et les tests qui rendront la prochaine modification moins chère.

## 🎤 Questions d'entretien
- « Qu'est-ce qu'un bon nom ? » → Un nom qui révèle l'intention, de longueur proportionnelle à sa portée, et qui rend un commentaire inutile.
- « Quand commentes-tu ? » → Pour un POURQUOI qu'on ne peut pas déduire du code : une contrainte, un compromis, une décision. Jamais pour paraphraser.
- « DRY jusqu'où ? » → Jusqu'à la duplication de CONNAISSANCE. Deux morceaux qui se ressemblent mais évolueront pour des raisons différentes doivent rester séparés : la mauvaise abstraction coûte plus cher que la duplication.
- « Comment refactorises-tu sans casser ? » → Avec un filet de tests d'abord, par petites étapes, en vérifiant que le comportement observable ne change pas.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je nomme mes fonctions sans avoir besoin d'un « et ».
- [ ] Mes cas invalides sortent en guard clause plutôt qu'en pyramide de `if`.
- [ ] Mes commentaires expliquent des décisions, pas des lignes.
- [ ] Je sais dire quand NE PAS factoriser deux blocs qui se ressemblent.

## 📚 Vocabulaire
**intention** · **responsabilité unique** · **niveau d'abstraction** · **guard clause** · **code smell** · **refactoring** · **dette technique** · **DRY** · **couplage** · **boy-scout rule**.

## 🧾 À retenir
Optimise pour le lecteur : noms qui disent l'intention, fonctions courtes à une responsabilité et un seul niveau d'abstraction, guards plutôt que pyramides, commentaires réservés aux POURQUOI, DRY sans fusionner ce qui n'est que ressemblant, logique pure séparée des effets. C'est une hygiène quotidienne — pas un grand nettoyage de printemps.
