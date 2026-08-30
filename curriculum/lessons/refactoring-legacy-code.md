<!-- keep -->
# Leçon — Refactoring et code legacy : changer sans casser

## 🌍 Le problème d'abord
La plupart du temps, tu ne pars pas d'une page blanche : tu modifies du code qui existe déjà,
parfois écrit il y a des années, souvent sans tests, que personne n'ose toucher. Tu dois y
ajouter une fonctionnalité ou corriger un bug — mais comment changer un code que tu comprends
mal, sans tout casser ? Foncer, c'est jouer à la roulette. Le **refactoring** (améliorer la
structure du code sans changer son comportement) et les techniques de travail sur le **code
legacy** répondent exactement à ça : transformer un code intimidant en un code modifiable, par
petites étapes sûres et vérifiables. C'est la compétence quotidienne du métier — bien plus
fréquente que d'écrire du neuf.

## 🎯 Objectif
Savoir **refactorer** (améliorer la structure sans changer le comportement observable), poser
un **filet de sécurité** sur du code sans tests via des **tests de caractérisation**, et
appliquer une démarche de changement **incrémentale et réversible** sur du code legacy.

## 🧩 Prérequis
Tu dois maîtriser le clean code (nommage, fonctions courtes, responsabilité unique,
`/doc/lessons/clean-code`) et savoir écrire des tests, notamment tester le comportement
plutôt que l'implémentation (`/doc/lessons/testing-foundations`), car le refactoring s'appuie
sur les tests comme filet. Git t'est indispensable pour avancer par petits commits réversibles
(`/doc/lessons/git-fundamentals`).

## 🧠 Modèle mental
Refactorer, c'est changer la FORME sans changer le FOND : le comportement observable reste
identique, seul l'intérieur devient plus clair. La règle absolue : **une seule chose à la
fois**. Soit tu changes le comportement (ajouter une fonctionnalité, corriger un bug), soit tu
refactores (réorganiser) — jamais les deux dans le même mouvement, sinon tu ne sais plus ce
qui a cassé quoi. Sur du code legacy sans tests, la première étape n'est pas de comprendre :
c'est de POSER un filet (des tests qui capturent le comportement actuel) pour pouvoir bouger
en sécurité.

## 💡 Pourquoi c'est important
Écrire du code neuf est l'exception ; modifier de l'existant est la règle. Un développeur qui
sait apprivoiser un code legacy — le rendre testable, le clarifier par petites touches, y
ajouter une fonctionnalité sans régression — vaut de l'or, parce que c'est précisément là que
la plupart des développeurs se figent ou cassent tout. C'est aussi ce qui empêche un projet de
pourrir : sans refactoring continu, toute base de code se dégrade jusqu'à devenir intouchable.

## Explication complète

### Refactoring : définition stricte
Refactorer = améliorer la structure interne **sans modifier le comportement observable de
l'extérieur**. Renommer pour l'intention, extraire une fonction, remplacer une pyramide de
`if` par des guard clauses, séparer calcul et effets : à chaque étape, l'entrée et la sortie
restent identiques. Si le comportement change, ce n'est plus un refactoring — c'est une
modification, qui doit être annoncée et testée comme telle.

### La règle des deux casquettes
Kent Beck la résume : « fais que le changement soit facile, PUIS fais le changement facile ».
On porte deux casquettes, jamais en même temps :
1. **Casquette refactoring** : je réorganise pour que la modification à venir devienne simple
   — sans changer le comportement (les tests restent verts).
2. **Casquette fonctionnalité** : maintenant que c'est propre, j'ajoute le comportement — et
   j'écris le test qui le prouve.
Mélanger les deux est la source n°1 de régressions difficiles à diagnostiquer.

### Le problème du legacy : pas de filet
Le « code legacy » se définit utilement comme **du code sans tests** : on ne peut pas le
modifier en confiance, car rien ne dira si on l'a cassé. Le paradoxe : pour le tester
proprement il faudrait le refactorer, mais pour le refactorer sans risque il faudrait des
tests. On brise le cercle avec les tests de caractérisation.

### Les tests de caractérisation : capturer l'existant
Un **test de caractérisation** ne vérifie pas ce que le code DEVRAIT faire, mais ce qu'il fait
ACTUELLEMENT. On appelle la fonction avec des entrées représentatives, on observe la sortie
réelle, et on la fige comme « valeur attendue ». Ce n'est pas une validation du comportement
correct — c'est un HARNAIS qui te prévient si un refactoring change quoi que ce soit. Une fois
le filet posé, tu peux réorganiser sans peur : au moindre écart, un test rougit.

### Trouver la « couture » pour tester
Souvent, le code legacy est difficile à tester parce qu'il fait tout en dur (lit un fichier,
appelle le réseau, lit l'horloge). On cherche une **couture (seam)** : un endroit où l'on peut
INSÉRER une dépendance contrôlable (extraire l'accès disque derrière un paramètre, injecter une
fonction `now()`). Créer cette couture est souvent le premier micro-refactoring — assez petit
pour être sûr à l'œil nu — qui rend le reste testable.

### Avancer par petits pas réversibles
Chaque étape doit être minuscule et vérifiable : un renommage, une extraction, un commit. On
relance les tests après CHAQUE pas. Si quelque chose casse, on annule le dernier micro-pas
(`git`), on ne s'enfonce pas. C'est lent en apparence, mais bien plus rapide que de déboguer
un gros refactoring raté.

## Concepts clés
Refactoring (structure sans comportement) · comportement observable · règle des deux casquettes
(refactorer puis modifier) · code legacy = code sans tests · test de caractérisation · couture
(seam) / injection de dépendance · petits pas réversibles · code smells (rappel clean-code).

## 🧭 Exemple guidé
On te demande d'ajouter une règle de remise à `calculPrix()`. La fonction fait 240 lignes,
elle n'a aucun test, et elle est en production depuis six ans.

La question n'est pas « comment la réécrire proprement ». C'est : **comment ne pas casser ce
qui marche, alors que je ne sais pas ce que ça fait ?**

### Le problème, énoncé correctement

Tu ne peux pas tester ce que tu ne comprends pas, et tu ne peux pas comprendre 240 lignes sans
les modifier pour les explorer. C'est circulaire, et c'est ce qui rend le code hérité
intimidant.

La sortie de cette boucle tient en une inversion : **tu n'as pas besoin de comprendre ce que le
code fait pour capturer ce qu'il fait.**

### Étape 1 — le filet : capturer, pas juger

```js
// caracterisation.test.js — ce ne sont PAS des tests de spécification
test('panier standard', () => {
  expect(calculPrix(PANIER_1)).toBe(127.44);   // ← valeur OBSERVÉE, pas attendue
});
test('panier avec code promo', () => {
  expect(calculPrix(PANIER_2)).toBe(89.90);
});
test('panier vide', () => {
  expect(calculPrix(PANIER_3)).toBe(0);
});
test('panier avec quantité négative', () => {
  expect(calculPrix(PANIER_4)).toBe(-15.00);   // ← oui, c'est bizarre. On le fige quand même.
});
test('client sans adresse', () => {
  expect(calculPrix(PANIER_5)).toBe(142.10);
});
```

Ces tests s'appellent des **tests de caractérisation**, et leur propriété est déroutante :
**ils ne disent pas ce que le code devrait faire, ils disent ce qu'il fait.** On exécute, on
lit la valeur, on la fige.

Le quatrième mérite un arrêt. Un prix négatif est manifestement un bug. La tentation est de le
corriger tout de suite — et c'est l'erreur. Cette valeur est peut-être compensée ailleurs ; un
export comptable en dépend peut-être ; un client l'utilise peut-être depuis six ans. **Corriger
un comportement pendant qu'on réorganise du code rend impossible de savoir laquelle des deux
actions a cassé quoi.**

On note le bug, on l'ouvre comme un ticket séparé, et on fige la valeur bizarre. Le filet
protège le comportement **existant**, y compris ses défauts.

Comment choisir les cinq paniers : le cas nominal, un cas limite (vide), un cas extrême
(quantité énorme), un cas absurde (négatif), un cas incomplet (champ manquant). Cinq entrées
qui font passer le code par ses branches principales. Si l'outil le permet, une mesure de
couverture indique lesquelles restent inexplorées.

### Étape 2 — la casquette « réorganisation »

Une seule règle, et c'est toute la discipline de cette leçon : **une seule casquette à la
fois.**

```js
// AVANT — au milieu des 240 lignes
if (client.type === 'pro' && total > 500) { total = total * 0.85; }
else if (client.anciennete > 3) { total = total * 0.95; }

// APRÈS — extrait, nommé, rien d'autre n'a changé
function tauxDeRemise(client, total) {
  if (client.type === 'pro' && total > 500) return 0.85;
  if (client.anciennete > 3) return 0.95;
  return 1;
}
total = total * tauxDeRemise(client, total);
```

On relance les cinq tests. **Ils doivent tous rester verts.** S'ils le sont, la réorganisation
n'a rien changé — c'est démontré, pas espéré. Si l'un rougit, on annule et on recommence plus
petit : le rouge dit exactement que l'on vient de modifier un comportement en croyant ne
réorganiser que la forme.

C'est la définition rigoureuse du mot : **réorganiser, c'est changer la structure sans changer
le comportement.** Un changement qui modifie le comportement n'est pas une réorganisation,
quelle que soit son intention.

### Étape 3 — la casquette « fonctionnalité »

Maintenant seulement, la nouvelle règle :

```js
function tauxDeRemise(client, total) {
  if (client.type === 'pro' && total > 500) return 0.85;
  if (client.codeParrainage) return 0.90;          // ← la nouveauté
  if (client.anciennete > 3) return 0.95;
  return 1;
}

test('remise de parrainage', () => {
  expect(tauxDeRemise({ codeParrainage: 'ABC' }, 100)).toBe(0.90);
});
```

Deux choses à vérifier, et elles ne disent pas la même chose :

- **le nouveau test passe** → la fonctionnalité fonctionne ;
- **les cinq anciens restent verts** → rien d'autre n'a bougé.

Note l'ordre des conditions dans la fonction : le parrainage est placé **après** la remise pro.
Ce n'est pas anodin — un client pro avec un code de parrainage garde 15 % au lieu de 10 %. Cet
ordre est une **décision métier**, qu'il faut poser à quelqu'un plutôt que trancher seul. Dans
la version d'origine, noyée dans 240 lignes, cette question ne se voyait même pas.

C'est un bénéfice inattendu de l'extraction : **rendre visibles des décisions qui étaient
implicites.**

### Ce que la méthode garantit, et ce qu'elle ne garantit pas

**Elle garantit** que tu n'as pas introduit de régression sur les cinq comportements capturés.
C'est peu et c'est énorme : c'est la différence entre modifier du code hérité et jouer aux dés.

**Elle ne garantit pas** que les cinq paniers couvrent tous les cas. Une branche jamais
exécutée par tes tests peut casser sans que rien ne rougisse. C'est pourquoi la mesure de
couverture n'est pas un ornement ici : elle dit quelles parties du code ton filet ne protège
pas.

La formulation honnête, celle qu'on donne en revue : *« ce changement est couvert par cinq
tests de caractérisation qui exercent 68 % des lignes ; la branche des commandes
internationales n'est pas couverte. »* C'est une phrase qu'on peut discuter — contrairement à
« j'ai fait attention ».

### La règle en une ligne

> **Ne jamais réorganiser et modifier le comportement dans le même commit.**

Quand les deux sont mêlés et qu'un test casse, il n'existe aucun moyen de savoir laquelle des
deux actions est en cause — sinon défaire les deux. Séparées, un test rouge après une
réorganisation ne peut avoir qu'une seule explication.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Tu dois modifier une fonction de 400 lignes, sans tests, que personne ne comprend.
   Pour la tester il faudrait la découper ; pour la découper en sécurité il faudrait des
   tests. Comment sors-tu de là ?
2. En refactorant, tu découvres un bug vieux de trois ans. Le corriges-tu dans le même
   commit ?
3. Tes tests passent après ton refactoring. Cela prouve-t-il que tu n'as rien cassé ?
4. Une fonction s'appelle `traiterDonnees`. Qu'est-ce que ce nom t'apprend ?

## ✅ Correction attendue

**La démarche.** Une casquette à la fois. Refactorer, c'est changer la structure **sans**
changer le comportement ; si le comportement change, ce n'est plus un refactoring, et cela
doit être annoncé, testé et commité séparément.

**L'erreur probable, et c'est le blocage qui fait renoncer.** Face au cercle vicieux de la
première question, la réponse spontanée est l'une des deux mauvaises : « je vais faire
attention » — et l'on refactore sans filet, en espérant — ou « on ne peut pas y toucher »
— et le code pourrit un an de plus.

La sortie existe, et elle passe par un renversement : **écrire un test qui décrit ce que
le code FAIT, pas ce qu'il devrait faire.** C'est un *test de caractérisation*. On appelle
la fonction avec des entrées représentatives, on observe la sortie réelle, et **on grave
cette sortie dans le test** — même si elle est manifestement fautive.

```
// Le test ne dit pas « c'est correct ». Il dit « c'est ce qui se passe aujourd'hui ».
// L'arrondi ci-dessous est probablement un bug. Il est GARDÉ, exprès :
// on refactore d'abord, on corrigera ensuite, séparément.
assert(calculerRemise(100, 'VIP') === 84.99);
```

Ce filet ne valide rien. Il détecte **le changement**, ce qui est précisément ce dont on a
besoin : un refactoring réussi laisse ces tests verts. Et le bug de l'arrondi, une fois le
code découpé et compris, se corrige dans un commit à lui, où la modification de
l'assertion est visible et discutable.

Le piège séduit parce qu'**écrire un test qui affirme un comportement faux ressemble à une
faute professionnelle**. On a appris qu'un test exprime une intention correcte ; en graver
un bug donne l'impression de l'entériner. C'est la résistance à franchir, et c'est ce qui
fait que la technique reste peu employée alors qu'elle débloque la situation en une heure.

**Sur les autres questions.** Le bug vieux de trois ans **ne se corrige pas dans le même
commit** — et pour une raison très pratique : si le comportement change en même temps que
la structure, plus rien ne permet d'attribuer une régression. Elle vient du découpage ou de
la correction ? Personne ne peut le dire, et l'on relit trois cents lignes de diff. Deux
commits, deux intentions, deux revues. C'est la règle des deux casquettes appliquée au
niveau du commit.

Des tests verts après refactoring **ne prouvent pas** l'absence de casse : ils prouvent que
ce qui était couvert n'a pas changé. Sur du code legacy, la couverture est justement le
problème. Le contrôle complémentaire est de **vérifier que les tests savent échouer** —
casser volontairement une branche et s'assurer qu'un test rougit. Un filet dont on n'a pas
vérifié les mailles n'est pas un filet.

Enfin, `traiterDonnees` n'apprend **rien**, et c'est une information en soi : un nom vague
signale presque toujours une fonction qui fait plusieurs choses. On ne peut pas la nommer
parce qu'il n'y a pas *une* chose à nommer. **L'incapacité à trouver un nom précis est le
diagnostic**, pas un manque d'imagination — et le renommage n'est pas cosmétique : c'est
souvent le premier pas qui révèle le découpage.

**Alternative défendable.** Face à du code très abîmé, **réécrire** plutôt que refactorer
est parfois le bon choix — quand la spécification est claire, le périmètre limité, et le
code sans valeur historique. C'est un pari risqué et il faut le nommer comme tel : une
réécriture perd toutes les corrections de cas particuliers accumulées, dont personne ne se
souvient et qui ne sont écrites nulle part. **Le code laid contient souvent des années de
réponses à des problèmes réels.**

**Vérifie seul, sans corrigé** :
1. Prends ta fonction la plus redoutée. Écris trois tests de caractérisation, y compris sur
   un comportement qui te semble faux. Le blocage disparaît en général à ce moment-là.
2. Casse volontairement une ligne et relance. Un test rougit-il ? Sinon, ton filet est
   décoratif.
3. Ouvre ton dernier commit de refactoring. Contient-il un changement de comportement ? Si
   oui, il aurait dû être deux commits.

## ⚠️ Erreurs fréquentes
- Refactorer ET changer le comportement dans le même commit → impossible de savoir ce qui a
  cassé quoi.
- Toucher du legacy sans poser de filet d'abord → régressions silencieuses.
- Le « grand refactoring » de deux semaines sans étapes intermédiaires livrables : risque
  maximal, souvent abandonné. Préfère la stratégie du boy-scout (améliorer un peu à chaque
  passage).
- Réécrire de zéro (« rewrite ») par réflexe : on perd des années de correctifs de cas limites
  invisibles. À réserver aux cas vraiment justifiés.

## 🔗 Liens avec le programme
Cette leçon met en action `/doc/lessons/clean-code` (les cibles du refactoring) et
`/doc/lessons/testing-foundations` (le filet). Elle prépare la gestion de la
`/doc/lessons/technical-debt` (refactorer, c'est rembourser de la dette) et les changements
sûrs de contrat (`/doc/lessons/breaking-changes-compatibility`). En entretien, « comment
modifies-tu du code legacy ? » distingue immédiatement les profils expérimentés.

## Mini-exercice
Avec l'exercice `refactor-legacy` (ou une grosse fonction à toi) : (1) écris 3 tests de
caractérisation capturant le comportement actuel ; (2) casquette refactoring — extrais une
fonction nommée, garde les tests verts ; (3) casquette fonctionnalité — ajoute une petite règle
+ son test. Vérifie qu'à aucune étape un ancien test n'a rougi par surprise.

## 📚 Vocabulaire
**refactoring** · **comportement observable** · **règle des deux casquettes** · **code legacy**
· **test de caractérisation** · **couture (seam)** · **injection de dépendance** · **petits pas
réversibles** · **boy-scout rule** · **rewrite**.

## 🧾 À retenir
Refactorer, c'est améliorer la structure sans changer le comportement — et jamais en même temps
qu'une modification fonctionnelle (les deux casquettes, portées séparément). Sur du code legacy
(= sans tests), on commence par poser un filet : des tests de caractérisation qui figent
l'existant, rendus possibles en créant une couture testable. Ensuite, on avance par petits pas
réversibles, tests verts après chaque pas. C'est ainsi qu'on change un code intimidant sans le
casser.
