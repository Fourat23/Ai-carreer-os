<!-- keep -->
# Leçon — Portfolio technique GitHub

## 🌍 Le problème d'abord
Un recruteur reçoit ta candidature et ouvre ton GitHub. En 2-3 minutes, il décide si ton profil mérite un entretien. Ce qu'il voit : un profil vide ou soigné, des repos qui racontent une progression ou un grenier de projets abandonnés, des commits réguliers ou un désert. Pour un reconverti sans expérience salariée, ce GitHub EST le CV technique — la seule preuve tangible que tu sais coder et que tu es constant. Laissé au hasard, il travaille CONTRE toi (secrets exposés, code honteux public, repos morts). Cette leçon t'apprend à en faire une vitrine qui plaide en ta faveur.

## 🎯 Objectif
Transformer ton GitHub en PREUVE d'employabilité : profil soigné, repos épinglés qui racontent une progression, historique de commits qui démontre la constance, et zéro signal négatif (secrets, repos morts, code honteux public). Pour un reconverti, le portfolio EST le CV technique.

## 🧩 Prérequis
Tu dois maîtriser Git et la notion d'historique de commits (`/doc/lessons/git-fundamentals`), savoir écrire un README clair (`/doc/lessons/readme-documentation`), et être conscient du risque de fuite de secrets (`/doc/lessons/deployment-secrets`). Avoir un ou deux projets à exposer est le point de départ. Aucune notoriété open-source préalable n'est attendue.

## 🧠 Modèle mental
Ton GitHub est **une vitrine de magasin, pas un grenier** : on y expose le meilleur, rangé et étiqueté — pas tout ce qu'on possède. Le recruteur y passe 2-3 minutes : chaque élément visible doit travailler POUR toi.

## 📖 Explication complète
Ce qu'un recruteur regarde (dans l'ordre, en ~3 minutes) :
1. **Le profil** : photo correcte, bio d'une ligne orientée cible (« AI Engineer junior — RAG, évaluation, TypeScript/Python »), README de profil sobre qui met en avant 2-3 projets.
2. **Les repos épinglés (6 max)** : TES meilleurs, pas les plus récents. Chacun : description d'une ligne + topics + README exemplaire. L'ordre raconte une histoire : le projet vitrine (DocSense) d'abord.
3. **La heatmap de commits** : la CONSTANCE sur des mois vaut plus qu'un pic isolé — c'est la preuve visuelle de ta discipline de 12 mois (le commit quotidien du programme la construit automatiquement).
4. **Un repo au hasard** : structure claire, commits atomiques aux messages propres (l'historique se lit comme un journal de rigueur), pas de secrets, pas de fichiers générés commités.
Hygiène : les expérimentations brouillonnes restent PRIVÉES ; chaque repo public a été audité (historique sans secrets — leçon deployment-secrets) ; les repos morts sont archivés (signal assumé) plutôt que laissés pourrir.
La règle des 6 : mieux vaut 6 projets solides et racontables que 30 tutoriels clonés — le recruteur détecte le tutoriel copié en 10 secondes (même structure, mêmes noms, aucun ADR).

## 🔧 Exemple simple
Bio faible : « Étudiant passionné de code ». Bio forte : « AI Engineer junior — j'ai construit un assistant documentaire RAG évalué (fidélité 90 %) · TypeScript/Python ».

## 🧭 Exemple guidé — ce qu'un recruteur voit réellement, et en combien de temps

Le raisonnement habituel sur le portfolio est « avoir de beaux projets ». C'est
insuffisant parce que ça ignore la contrainte réelle : **la personne qui regarde
dispose de deux à trois minutes, et elle décide de continuer ou d'arrêter dans les
dix premières secondes.** Tout le reste en découle.

### 1. Le budget d'attention, et où il se dépense

Le parcours d'un recruteur technique, dans l'ordre : la bio (5 secondes), les
dépôts épinglés (20 secondes), **un** dépôt ouvert (60 secondes), et dans ce
dépôt le README d'abord, l'historique des commits ensuite, le code en dernier —
si le reste a donné envie.

Trois conséquences qui contredisent l'intuition.

**Le code compte moins que sa présentation.** Non pas parce que la qualité
n'importe pas, mais parce que **personne n'atteint le code** si le README ne
donne pas envie. Un excellent projet sans README ne sera pas jugé sévèrement : il
ne sera pas jugé du tout.

**Un seul dépôt sera vraiment lu.** Le premier épinglé. Les cinq autres servent à
montrer l'étendue, en un coup d'œil, à partir de leur titre et de leur
description d'une ligne. Un dépôt épinglé sans description est une case vide.

**La quantité nuit.** Trente dépôts dont vingt-cinq sont des tutoriels suivis
diluent les cinq qui comptent. Le signal n'est pas « j'ai beaucoup codé », c'est
« voici ce que je sais faire ». Ce qui n'est pas montrable s'archive ou se passe
en privé — et ne pas savoir trier est en soi une information sur le candidat.

### 2. Ce qui se vérifie mécaniquement, sur ton propre dépôt

La leçon `readme-documentation` exécute le README de ce cours plutôt que de le
relire. Les mêmes contrôles s'appliquent à chacun de tes dépôts, et deux d'entre
eux sont éliminatoires.

**Les commandes du README fonctionnent-elles depuis un clone neuf ?** Mesuré sur
le dépôt de ce cours : `npm install` 23 s, `npm test` 35 s, `npm run build` 65 s,
`npm run generate` 1 s — quatre sur quatre. C'est le résultat qu'on veut, et il
n'est pas acquis : un README vieillit à chaque commit qui renomme un script, sans
que l'auteur s'en aperçoive puisqu'il connaît les vraies commandes.

**Y a-t-il un secret dans l'historique ?** C'est le seul contrôle dont l'échec
est disqualifiant, et il est mesuré dans la leçon `deployment-secrets` : un
secret commité puis supprimé reste lisible par `git show`, apparaît **deux fois**
dans `git log -p --all` (le diff de suppression le réaffiche), et survit à
`gc --prune=now`. Sur un dépôt public, il est aussi indexé par des robots en
quelques minutes.

Un recruteur technique ne cherche pas systématiquement. Mais s'il trouve, la
conversation est terminée — et il ne s'agit pas de sévérité : une clé exposée est
une information factuelle sur la façon dont on travaille. L'audit se fait avec
`--all` et non `git log -p`, pour la raison mesurée dans cette leçon.

### 3. Ce que raconte l'historique des commits

C'est la partie qu'on ne peut pas fabriquer après coup, et c'est pour cela qu'elle
est regardée.

Un historique de trois commits — « initial », « wip », « final » — dit qu'on ne
sait pas découper un travail. Un historique de quarante commits dont chacun a un
message qui dit **pourquoi** dit l'inverse. Ce n'est pas une question de
politesse envers un lecteur imaginaire : c'est la trace de la façon dont on
raisonne, et c'est le seul élément du portfolio qui résiste au maquillage.

Le repère utile pour un message : il explique le **pourquoi**, le diff montre
déjà le **quoi**. « corrige le bug » ne dit rien ; « le retour arrière du schéma
détruisait la devise des commandes déjà écrites : la colonne devient nullable »
dit tout.

### 4. Choisir et ordonner six dépôts épinglés

L'ordre n'est pas chronologique et n'est pas par préférence : il va **de la cible
visée vers le socle**, et chaque position prouve une facette différente.

```
1. le projet le plus proche du poste visé — la pièce maîtresse, celle qui sera lue
2. la profondeur technique — quelque chose construit sans cadre, qui montre le mécanisme
3. la rigueur de la méthode — mesures, comparaison à une référence, résultats honnêtes
4. le socle du métier — propre, testé, ennuyeux, indispensable
5. la polyvalence — une facette différente des quatre premières
6. le bout en bout — quelque chose qui va de la donnée brute au résultat utilisable
```

La règle qui organise cette liste : **aucun doublon de facette.** Deux projets
qui prouvent la même chose gaspillent une position sur six. Et l'ordre se
réadapte à l'offre : pour un poste orienté données, les positions 3 et 6
remontent.

### 5. La démarche, chronomètre en main

1. **Ouvre ton profil en navigation privée** et laisse-toi trois minutes.
   Note ce que tu vois, dans l'ordre, sans rien corriger.
2. **Lis ta bio comme un inconnu.** Dit-elle ce que tu cherches à faire ? Une
   bio qui décrit un passé plutôt qu'une cible ne trie rien.
3. **Pour chaque épinglé, une ligne de justification** : quelle facette
   prouve-t-il, que ne prouve aucun autre ? Si tu n'y arrives pas, il n'a pas sa
   place.
4. **Exécute le README du premier épinglé** depuis un clone neuf.
5. **Audite les secrets** de tous tes dépôts publics, avec `--all`.
6. **Regarde ton propre historique de commits** sur le premier épinglé, et
   demande-toi ce qu'il raconte de ta façon de travailler.

Les étapes 4 et 5 sont mécaniques et s'automatisent. Les étapes 1 à 3 demandent
de renoncer à ce que tu sais du projet, ce qui est la vraie difficulté — et la
raison pour laquelle faire faire l'étape 1 par quelqu'un d'autre vaut mieux.

## 🤖 Exemple appliqué (IA / data / architecture)
Pour un poste AI Engineer, le trio gagnant visible en 3 minutes : un RAG ÉVALUÉ (chiffres dans le README), un historique de commits constant sur 12 mois, et des ADRs dans les repos (la preuve que tu ARBITRES). C'est exactement ce que le programme construit — le portfolio n'est pas une étape finale, il s'accumule chaque jour.

## ⚠️ Erreurs fréquentes
- Tout rendre public, y compris le brouillon (bruit qui noie le signal).
- Secrets dans l'historique d'un repo rendu public (audit obligatoire AVANT).
- Repos épinglés par défaut (les plus récents, pas les meilleurs).
- Heatmap vide 6 mois puis un pic (l'inverse du signal recherché).

## 🚫 Anti-patterns
- 30 tutoriels clonés pour « remplir ».
- Le faux commit quotidien vide (détectable, décrédibilisant).

## ✍️ Mini-exercice
Sans relire : sur six dépôts épinglés, combien seront réellement lus, et
qu'est-ce que cela impose aux cinq autres ?

## 🔥 Pratique — auditer son profil comme le ferait un inconnu

**A. L'audit en trois minutes.** Ouvre ton profil en navigation privée,
chronomètre trois minutes, et note ce que tu vois dans l'ordre sans rien
corriger. Livrable : la liste ordonnée, et les cinq corrections prioritaires que
tu en tires.

**B. La justification des épinglés.** Pour chacun de tes dépôts épinglés
actuels, écris en une ligne la facette qu'il prouve et qu'aucun autre ne prouve.
Livrable : la liste, et les dépôts que tu retires faute de justification.

**C. Exécuter le README du premier.** Applique le protocole du clone neuf à ton
dépôt le plus important : suis le README à la lettre, chronomètre, note chaque
friction. Livrable : le temps jusqu'à « ça tourne » et la liste des frictions.

**D. L'audit des secrets, sur tous les dépôts publics.** Écris un script qui
cherche des motifs de secrets dans **tout** l'historique (`--all`, pas la seule
branche courante) de chacun de tes dépôts publics. Livrable : la sortie, et pour
chaque trouvaille l'action menée — en commençant par la révocation.

**E. Lire son propre historique.** Prends les vingt derniers commits de ton
dépôt principal et classe chaque message : dit-il **pourquoi**, ou seulement
**quoi** ? Livrable : le décompte, et cinq messages réécrits.

## ✅ Correction attendue

**A — l'audit.** Ce qu'on attend n'est pas une liste de corrections cosmétiques
mais le constat de l'ordre : bio, épinglés, un dépôt. Si en trois minutes tu n'as
pas su dire quelle est ta cible professionnelle en lisant ton propre profil,
personne d'autre ne le saura.

L'erreur classique est de corriger pendant l'audit. Note d'abord, corrige après :
en corrigeant au fil de l'eau, tu perds la vue d'ensemble, qui est le seul
apport de l'exercice.

**B — les épinglés.** Le critère est l'**absence de doublon de facette**. Deux
projets qui prouvent la même chose gaspillent une position sur six ; il vaut
mieux cinq épinglés distincts que six dont deux se recouvrent.

Le cas fréquent, et la bonne réponse : les projets suivis en tutoriel. Ils
prouvent qu'on a suivi un tutoriel, ce que tout le monde a fait. La règle
utilisable : **un projet ne mérite une position que si tu peux répondre à
« pourquoi as-tu fait ce choix plutôt qu'un autre ? »** sur au moins une décision
de conception. Si toutes les décisions viennent du tutoriel, le projet ne parle
pas de toi.

**C — les frictions.** Les frictions typiques et leur fréquence sont les mêmes
que dans la leçon `readme-documentation` : commande renommée, variable non
documentée, dépendance système supposée. Le point à formuler ici est l'ordre de
priorité : **c'est le premier épinglé qui compte**, parce que c'est le seul qui
sera ouvert. Perfectionner les README des cinq autres avant celui-là est du
travail correctement fait au mauvais endroit.

**D — les secrets.** Le point technique qui départage : `--all` et non `git log
-p`. La leçon `deployment-secrets` mesure pourquoi — après une réécriture
d'historique, la branche est propre alors que `refs/original/` et
`refs/remotes/origin/*` détiennent toujours le secret, et le dépôt distant plus
encore.

L'ordre des actions ensuite est celui mesuré dans cette même leçon : **révoquer
d'abord** (trente secondes, et c'est la seule action qui rend le secret
inutilisable), remplacer, puis nettoyer, puis empêcher la récidive. Nettoyer
d'abord occupe une heure pendant laquelle la clé reste valide.

Et une précision sur le portfolio spécifiquement : un dépôt public ayant contenu
un secret ne redevient pas sûr en devenant privé. Il a été public ; on doit
supposer qu'il a été copié.

**E — les messages de commit.** Le décompte typique est déprimant la première
fois, et c'est normal : la plupart des messages décrivent le diff. Le repère est
qu'un message utile explique **pourquoi**, puisque le diff montre déjà le
**quoi**.

```
❌ corrige le bug de la migration
✅ le retour arrière du schéma détruisait la devise des commandes déjà écrites ;
   la colonne devient nullable pour rendre l étape réversible
```

Ce que cet exercice révèle vraiment : **l'historique est la seule partie du
portfolio qu'on ne peut pas maquiller après coup.** On peut réécrire un README en
une soirée ; on ne peut pas fabriquer six mois de commits réfléchis. C'est
précisément pour cette raison qu'il est regardé, et c'est un argument pour
soigner les messages **maintenant**, sur le projet en cours, plutôt qu'au moment
de chercher un poste.

## 🎤 Questions d'entretien
- « Montre-moi ton GitHub. » → Profil orienté cible, épinglés qui racontent la progression, DocSense en tête avec ses chiffres.
- « Ce projet, c'est un tutoriel ? » → Non : ADRs, décisions documentées, éval chiffrée, limites honnêtes — les marqueurs du travail original.
- « Pourquoi ce projet est-il épinglé ? » → Chaque épinglé prouve une facette précise (récit préparé).

## 🧾 À retenir
- Vitrine, pas grenier : 6 épinglés solides, le reste privé ou archivé.
- La heatmap prouve la constance ; les ADRs prouvent l'arbitrage.
- Audit secrets AVANT toute publication ; l'historique n'oublie rien.

## 📚 Vocabulaire
**repos épinglés** · **README de profil** · **topics** · **heatmap de contributions** · **archivage** · **commits atomiques** · **audit de secrets** · **projet vitrine**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Ma bio et mes épinglés sont orientés vers ma cible.
- [ ] Ma heatmap montre une constance réelle.
- [ ] Tous mes repos publics sont audités (secrets, README, description).

## 🔗 Liens avec le programme
Dès le jour 6 (premier push), mois 12 (jours ~340-348). Leçons liées : `readme-documentation`, `technical-storytelling`, `deployment-secrets`.
