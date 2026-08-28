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

## 🧭 Exemple guidé
```js
// ❌ avant
function proc(u, d) {
  if (u) { if (u.act) { let t = 0; for (let i = 0; i < d.length; i++) {
    if (d[i].uid == u.id && d[i].st != 'x') t += d[i].mt; } return t; } }
  return null;
}
// ✅ après
function totalCommandesActives(utilisateur, commandes) {
  if (!utilisateur?.actif) return null;
  return commandes
    .filter((c) => c.utilisateurId === utilisateur.id && c.statut !== 'annulee')
    .reduce((total, c) => total + c.montant, 0);
}
```
Même logique, zéro commentaire nécessaire : les noms et la structure PORTENT le sens.

## ⚠️ Erreurs fréquentes
- Sur-commenter l'évident et sous-commenter les décisions.
- « Je nettoierai plus tard » : plus tard n'existe pas ; la propreté se maintient en continu.
- Refactorer sans tests : on casse en croyant améliorer.
- Le clean code dogmatique : des fonctions de 2 lignes partout peuvent être PIRES qu'une fonction claire de 15 lignes. Le juge est la lisibilité, pas la règle.

## 🔗 Liens avec le programme
Les pipelines RAG (mois 8-9) sont des chaînes de transformations : la discipline « petites fonctions pures nommées » les rend débuggables étape par étape. Les prompts eux-mêmes bénéficient du clean code (structure claire, intention explicite, versionnés). Et un recruteur juge ton portfolio d'abord par la lisibilité de ton code — avant même de le lancer.

## Mini-exercice
Prends ta plus grosse fonction du mois 1. Applique dans l'ordre : (1) renommer pour l'intention, (2) guard clauses, (3) extraire les blocs commentables en fonctions nommées, (4) séparer calcul et affichage. Compare avant/après à voix haute : lequel expliques-tu le plus vite ?

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
