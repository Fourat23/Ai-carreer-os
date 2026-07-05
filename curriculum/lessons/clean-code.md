<!-- keep -->
# Leçon — Clean code

## Pourquoi c'est important
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

## Exemple
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

## Pièges classiques
- Sur-commenter l'évident et sous-commenter les décisions.
- « Je nettoierai plus tard » : plus tard n'existe pas ; la propreté se maintient en continu.
- Refactorer sans tests : on casse en croyant améliorer.
- Le clean code dogmatique : des fonctions de 2 lignes partout peuvent être PIRES qu'une fonction claire de 15 lignes. Le juge est la lisibilité, pas la règle.

## Lien avec l'IA / le futur
Les pipelines RAG (mois 8-9) sont des chaînes de transformations : la discipline « petites fonctions pures nommées » les rend débuggables étape par étape. Les prompts eux-mêmes bénéficient du clean code (structure claire, intention explicite, versionnés). Et un recruteur juge ton portfolio d'abord par la lisibilité de ton code — avant même de le lancer.

## Mini-exercice
Prends ta plus grosse fonction du mois 1. Applique dans l'ordre : (1) renommer pour l'intention, (2) guard clauses, (3) extraire les blocs commentables en fonctions nommées, (4) séparer calcul et affichage. Compare avant/après à voix haute : lequel expliques-tu le plus vite ?

## Vocabulaire à retenir
**intention** · **responsabilité unique** · **niveau d'abstraction** · **guard clause** · **code smell** · **refactoring** · **dette technique** · **DRY** · **couplage** · **boy-scout rule**.

## Résumé
Optimise pour le lecteur : noms qui disent l'intention, fonctions courtes à une responsabilité et un seul niveau d'abstraction, guards plutôt que pyramides, commentaires réservés aux POURQUOI, DRY sans fusionner ce qui n'est que ressemblant, logique pure séparée des effets. C'est une hygiène quotidienne — pas un grand nettoyage de printemps.
