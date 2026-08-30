<!-- keep -->
# Leçon — La dette technique : décider en connaissance de cause

## 🌍 Le problème d'abord
Au début, ajouter une fonctionnalité prend une heure. Six mois plus tard, la même taille de
fonctionnalité prend trois jours, tout le monde a peur de toucher au code, et les bugs se
multiplient. Que s'est-il passé ? Le projet a accumulé de la **dette technique** : des
raccourcis, des « on nettoiera plus tard », des structures dépassées qui, mis bout à bout,
ralentissent tout. Le débutant croit que « dette technique = mauvais code ». C'est faux et ça
mène à des décisions absurdes. La dette est un OUTIL FINANCIER : parfois on l'emprunte
sciemment pour aller plus vite, parfois elle s'accumule par accident. Cette leçon t'apprend à
la reconnaître, à la nommer, et surtout à décider quoi en faire — comme un investissement, pas
comme une faute morale.

## 🎯 Objectif
Comprendre la dette technique comme un **arbitrage risque/vitesse** (principal + intérêt),
distinguer ses **types** (volontaire/accidentelle, et par dimension), savoir la **prioriser**
selon son coût réel, et la **prévenir** — plutôt que de la traiter comme un simple synonyme de
« mauvais code ».

## 🧩 Prérequis
Tu dois avoir une notion de clean code et de code smells (`/doc/lessons/clean-code`) et de
refactoring (`/doc/lessons/refactoring-legacy-code`), car rembourser de la dette passe souvent
par du refactoring. Une familiarité avec le fait qu'un projet évolue dans le temps
(fonctionnalités, équipe) aide à saisir pourquoi la dette « coûte des intérêts ».

## 🧠 Modèle mental
La métaphore financière est exacte et éclairante. Le **principal**, c'est le raccourci pris
(le code pas idéal). L'**intérêt**, c'est le surcoût que ce raccourci fait payer à CHAQUE
modification future (plus lent, plus risqué, plus de bugs). Comme une vraie dette : parfois
emprunter est malin (livrer vite pour valider une idée), mais si on ne rembourse jamais, les
intérêts finissent par étouffer le projet — on passe tout son temps à « payer les intérêts »
(contourner le code pourri) au lieu d'avancer. Décider sur la dette, c'est comparer le coût de
la rembourser au coût de continuer à en payer les intérêts.

## 💡 Pourquoi c'est important
La dette technique est LA raison la plus fréquente pour laquelle des projets ralentissent puis
s'enlisent. Savoir en parler en termes de risque et de coût (et non de morale) permet de
convaincre une équipe ou un manager d'investir dans un remboursement — ou, au contraire, de
justifier un raccourci assumé pour tenir une échéance. C'est une compétence de communication
d'ingénieur autant que de technique : « on prend cette dette consciemment, voici quand on la
remboursera » est une phrase de professionnel.

## Explication complète

### Principal et intérêt
Le **principal** est le travail qu'il faudrait faire pour rendre le code idéal. L'**intérêt**
est le surcoût récurrent tant qu'on ne l'a pas fait : chaque nouvelle fonctionnalité contourne
le raccourci, chaque modification risque un bug. Une dette à fort intérêt (dans du code touché
tous les jours) est bien plus urgente qu'une dette à faible intérêt (dans un coin jamais
modifié) — même si la seconde est « plus laide ».

### Les quatre quadrants (Martin Fowler)
La dette se classe selon deux axes : **prudente/imprudente** et **délibérée/accidentelle**.
- **Délibérée et prudente** : « on sait que ce n'est pas idéal, on livre pour valider le
  marché, on remboursera au sprint prochain » — la bonne dette, assumée et tracée.
- **Délibérée et imprudente** : « pas le temps de bien faire » sans plan — dangereux.
- **Accidentelle et prudente** : « maintenant qu'on a fini, on aurait dû faire autrement » — on
  apprend, c'est normal.
- **Accidentelle et imprudente** : on ne savait même pas qu'il y avait une meilleure façon —
  se réduit par la montée en compétence.
La distinction clé : une dette DÉCIDÉE et tracée est saine ; une dette subie et cachée est un
poison.

### Les dimensions de la dette
La dette n'est pas que dans le code : **dette de code** (structure, duplication), **dette de
tests** (couverture manquante → peur de modifier), **dette d'architecture** (frontières
floues), **dette de données** (schéma bancal, données sales), **dette d'infrastructure**
(serveurs non reproductibles), **dette de documentation** (savoir dans une seule tête). La
dette de tests et d'architecture est souvent la plus coûteuse car elle ralentit TOUT le reste.

### Prioriser : coût × fréquence
On ne rembourse pas toute la dette (impossible et inutile). On priorise là où l'**intérêt** est
le plus élevé : le code à la fois DOULOUREUX (difficile à modifier, source de bugs) et
FRÉQUEMMENT touché. Une carte simple : croiser « fréquence de modification » (visible dans
l'historique Git) et « douleur ressentie ». Le code souvent modifié ET pénible est la priorité
absolue ; le code stable et laissé tranquille peut attendre indéfiniment.

### Rembourser et prévenir
On rembourse surtout de façon CONTINUE (la boy-scout rule : laisser chaque fichier touché un peu
plus propre) plutôt que par de grands « sprints de refactoring » risqués. On prévient en
rendant la dette VISIBLE : la nommer dans les revues, la tracer (un ticket, un commentaire de
suivi daté et motivé dans le code), et l'intégrer aux décisions plutôt que de la laisser
s'accumuler en silence.

### Situer la dette dans les quatre types de maintenance
Rembourser la dette n'est qu'une des formes du travail de maintenance. La classification
professionnelle (norme ISO/IEC 14764) distingue **quatre types** :
- **corrective** : réparer un défaut constaté (un bug, un incident) — c'est le bugfix/hotfix.
- **adaptative** : adapter le logiciel à un CHANGEMENT d'environnement extérieur (nouvelle version
  d'une dépendance, d'un OS, d'une API tierce, nouvelle réglementation) sans changer les fonctions.
- **préventive** : agir AVANT la panne pour réduire un risque futur (corriger une faiblesse latente,
  ajouter des tests, durcir un point fragile) — c'est là que vit une grande part du remboursement de
  dette.
- **évolutive** : faire ÉVOLUER les fonctionnalités (ajouter/modifier une capacité à la demande du
  métier) — la maintenance la plus visible.
Savoir nommer le type de maintenance en cours aide à prioriser et à communiquer : un correctif urgent
(corrective) ne se planifie pas comme une montée de version (adaptative) ou un ajout de feature
(évolutive). La dette technique se rembourse surtout par de la maintenance **préventive**, souvent à
l'occasion d'une maintenance évolutive (boy-scout rule).

## Concepts clés
Dette technique = arbitrage risque/vitesse · principal vs intérêt · quadrants (délibérée/
accidentelle × prudente/imprudente) · dimensions (code, tests, archi, données, infra, doc) ·
priorisation par coût × fréquence · remboursement continu (boy-scout) · dette visible et tracée ·
quatre types de maintenance (corrective / adaptative / préventive / évolutive).

## 🧭 Exemple guidé
Quatre dettes sur la table, deux jours pour en rembourser une. Laquelle ?

C'est la situation réelle, et c'est celle où le mot « dette » cesse d'être une métaphore
décorative pour devenir un outil de décision. Comparons-les avec la même grille.

### Les quatre candidates

| # | Dette | Ce qu'elle coûte quand on y touche | Fréquence de modification |
|---|---|---|---|
| A | module de paiement dupliqué en 3 endroits | chaque évolution tarifaire à faire 3 fois, risque d'oubli → erreur de facturation | ~1 fois par mois |
| B | fonction de 600 lignes, illisible, mais correcte | 2 h de relecture avant toute modification | ~2 fois par an |
| C | pas de tests sur le module d'export | chaque modification est un pari ; 1 régression sur 3 environ | ~1 fois par trimestre |
| D | duplication dans un script d'archivage annuel | il faut modifier 2 endroits | **1 fois par an** |

Les quatre sont de la vraie dette. Aucune ne relève du goût.

### La grille : principal, intérêt, fréquence

L'analogie financière n'est pas une image — elle donne trois quantités distinctes, et c'est le
fait de les séparer qui permet de décider.

| | Définition | Comment l'estimer |
|---|---|---|
| **principal** | ce qu'il faudrait payer une fois pour l'éliminer | en jours de travail |
| **intérêt** | le surcoût payé **à chaque fois** qu'on touche cette zone | en heures, ou en probabilité de bug |
| **fréquence** | combien de fois par an on y touche | dans l'historique du dépôt |

Et la seule formule qui compte :

```
coût annuel de la dette  =  intérêt × fréquence
```

Le principal ne décide de rien : il dit ce que coûte le remboursement, pas ce que coûte de ne
pas rembourser.

### Le tableau, rempli

| # | Principal | Intérêt | Fréquence | **Coût annuel** | Décision |
|---|---|---|---|---|---|
| A | 2 j | 3 h + risque de facturation | 12 / an | **36 h + risque financier** | **rembourser maintenant** |
| B | 4 j | 2 h de relecture | 2 / an | 4 h | plus tard |
| C | 3 j | 1 régression sur 3, ~1 j de correction | 4 / an | **~10 j** | **rembourser maintenant** |
| D | 0,5 j | 30 min | 1 / an | 0,5 h | **jamais** |

Trois observations, et ce sont elles la leçon.

**B est la plus laide, et elle attend.** Six cents lignes illisibles font mal aux yeux de tout
le monde ; leur coût annuel est de quatre heures. C'est le piège principal du domaine : **la
laideur est visible, le coût ne l'est pas**, et une équipe qui priorise à l'œil rembourse
toujours la mauvaise dette.

**D ne sera jamais remboursée, et c'est une décision, pas une négligence.** Une demi-journée
de travail pour économiser trente minutes par an ne se rentabilise qu'au bout de huit ans.
Écrire « on ne rembourse pas, et voici pourquoi » est un résultat d'analyse — pas un aveu.

**C est celle qu'on sous-estime.** Son intérêt n'est pas du temps, c'est une **probabilité**.
Une régression sur trois modifications, quatre modifications par an, une journée de correction
chacune : dix jours par an, pour un principal de trois. Les dettes dont l'intérêt est un risque
sont systématiquement sous-évaluées parce qu'elles ne coûtent rien **certains** trimestres.

### Le chiffre qu'on n'invente pas : la fréquence

C'est la seule colonne du tableau qui ne repose pas sur une estimation. Elle se lit dans
l'historique :

```bash
git log --since="1 year ago" --format= --name-only | sort | uniq -c | sort -rn | head -20
```

Les fichiers les plus modifiés de l'année. Croise cette liste avec celle des zones que tout le
monde trouve pénibles : **l'intersection est ta liste de dettes à rembourser**, dans l'ordre.

Un fichier horrible qui n'apparaît pas dans les vingt premiers n'est pas une priorité, quelle
que soit l'insistance de celui qui vient de le lire.

### La dette n'est pas toujours une faute

Point que les discussions d'équipe manquent presque toujours : **contracter une dette peut être
la bonne décision.** Livrer une version simplifiée pour valider un marché, quitte à réécrire si
ça marche, est un arbitrage rationnel — on échange de la qualité future contre de
l'information présente.

Ce qui distingue une dette assumée d'une dette subie n'est pas sa nature, c'est qu'elle soit
**écrite** :

```
// DETTE — dupliqué avec facturation/tarifs.js
// Assumée le 12/03 pour tenir la date de la campagne.
// Intérêt : toute évolution tarifaire est à faire deux fois.
// Condition de remboursement : à la prochaine modification des tarifs.
```

Quatre lignes, et la dette devient visible, datée, chiffrée, et associée à un déclencheur. Sans
elles, elle devient dans six mois « du code bizarre que personne n'ose toucher », ce qui est le
même code avec un coût bien supérieur.

### La conversation avec un responsable

Dernier point, et c'est celui qui rend cette leçon utile en poste. « Il faudrait refactorer, le
code est sale » n'obtient jamais de temps, et c'est normal : la phrase parle d'esthétique à
quelqu'un qui arbitre des priorités.

La version qui obtient du temps porte sur les mêmes faits, dans l'autre unité :

> *« Le module de paiement est dupliqué en trois endroits. On y touche une fois par mois, et
> chaque évolution tarifaire prend trois heures au lieu d'une, avec un risque d'oubli qui a
> déjà produit deux erreurs de facturation. Deux jours de travail suppriment ce surcoût. »*

Aucun jugement, deux nombres, un risque déjà réalisé. C'est la même demande, exprimée dans
l'unité de celui qui décide — et c'est exactement ce que la grille principal / intérêt /
fréquence permet de produire.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Deux zones de code. L'une est atroce et n'a pas été modifiée depuis deux ans. L'autre
   est correcte mais un peu confuse, et cinq personnes y travaillent chaque semaine.
   Laquelle rembourses-tu ?
2. « On n'a pas le temps de bien faire, on nettoiera après. » Dans quel quadrant es-tu, et
   qu'est-ce qui déciderait entre deux d'entre eux ?
3. Comment justifies-tu un remboursement de dette auprès de quelqu'un qui ne lit pas de
   code ?
4. Une dette peut-elle être un bon investissement ?

## ✅ Correction attendue

**La démarche.** Une dette se juge sur son **intérêt** — le surcoût qu'elle prélève à
chaque passage — et non sur son principal, encore moins sur la répulsion qu'elle inspire.

**L'erreur probable : prioriser par la laideur.** La réponse spontanée est « la zone
atroce, évidemment ». C'est la seconde qu'il faut traiter, et l'écart n'est pas un détail
de méthode : il est d'un ou deux ordres de grandeur.

Un code atroce que **personne ne touche** ne prélève rien. Son intérêt est nul. Le
rembourser coûte des semaines et fait économiser zéro — c'est de la dépense pure, avec en
prime le risque d'introduire une régression dans du code qui fonctionnait. Un code un peu
confus traversé **cinq fois par semaine par cinq personnes** prélève, lui, à chaque
passage : dix minutes de compréhension, une hésitation, un bug de temps en temps. Sur un
an, ces dix minutes deviennent des semaines.

La formule à retenir : **intérêt ≈ coût par passage × fréquence des passages.** La
fréquence est le facteur qu'on oublie, et c'est celui qui domine.

Le piège séduit parce que **la répulsion est un signal fort et immédiat**. Ouvrir un
fichier horrible produit une réaction physique, et cette réaction se présente comme un
jugement technique. La fréquence de modification, elle, ne se ressent pas : elle se
mesure — et personne ne la mesure. On priorise donc sur l'émotion disponible plutôt que
sur le coût réel.

Cette mesure existe pourtant et tient dans une commande : l'historique du dépôt donne le
nombre de modifications par fichier. **Croiser « souvent modifié » et « difficile à
modifier » désigne la dette à rembourser en premier**, et le résultat contredit
régulièrement l'intuition de l'équipe.

**Sur les autres questions.** « On n'a pas le temps, on nettoiera après » est **délibéré**
— on sait qu'on prend un raccourci. Ce qui décide entre *prudent* et *imprudent* n'est
pas l'intention mais la **trace** : la dette est-elle écrite quelque part, avec ce qu'il
faudrait faire et pourquoi on ne l'a pas fait ? Si oui, c'est de la dette prudente, et
c'est une décision d'ingénierie légitime. Sinon, la phrase est un vœu, personne ne s'en
souviendra dans trois mois, et le raccourci devient un fait permanent que le prochain
prendra pour une intention.

Pour justifier un remboursement auprès d'un non-technicien, on ne parle **jamais** du
code. On parle du **coût constaté** : « cette fonctionnalité a pris trois semaines au lieu
d'une à cause de ce module ; trois demandes similaires sont prévues ce trimestre ;
deux jours de nettoyage en économisent une quinzaine ». Des jours, une fréquence, une
projection. C'est le langage de la décision, et il est bien plus convaincant que
« le code est sale » — qui ne se distingue pas, pour l'auditeur, d'une préférence
esthétique.

Enfin, oui : une dette peut être un excellent investissement. Livrer vite pour valider un
marché, quitte à jeter, est souvent la bonne décision — **on ne rembourse pas la dette d'un
produit qu'on abandonne**. Ce qui distingue l'investissement du naufrage est la lucidité :
savoir qu'on emprunte, à quel taux, et pour quoi.

**Alternative défendable.** Certaines équipes ne tiennent aucun registre de dette et
appliquent la **règle du boy-scout** — laisser le code un peu meilleur qu'on l'a trouvé, à
chaque passage. C'est efficace et cela résout automatiquement le problème de priorisation :
on améliore ce qu'on traverse, donc ce qui est fréquenté. La limite est qu'aucune dette
structurelle ne se rembourse ainsi : un mauvais découpage ne se corrige pas par petites
touches.

**Vérifie seul, sans corrigé** :
1. `git log --format=format: --name-only | sort | uniq -c | sort -rn | head -20`. Ces
   fichiers sont ceux dont la dette coûte réellement.
2. Ta dernière dette délibérée est-elle écrite quelque part ? Sinon elle est imprudente,
   quelle qu'ait été ton intention.
3. Chiffre une dette en jours perdus par trimestre. Si tu n'y arrives pas, tu ne pourras
   pas la défendre — et tu ne sais peut-être pas si elle en vaut la peine.

## ⚠️ Erreurs fréquentes
- Confondre « dette technique » et « mauvais code » : la dette peut être un choix malin et
  assumé.
- Vouloir tout rembourser (« grand nettoyage ») au lieu de cibler la dette à fort intérêt.
- Prendre de la dette sans la tracer ni la communiquer → elle devient invisible et s'accumule.
- Justifier n'importe quel raccourci par « c'est de la dette assumée » sans plan de
  remboursement (dette imprudente déguisée).

## 🔗 Liens avec le programme
La dette se rembourse surtout par le refactoring (`/doc/lessons/refactoring-legacy-code`) sur
des cibles de clean code (`/doc/lessons/clean-code`), et sa dimension tests renvoie à
`/doc/lessons/testing-foundations`. Savoir en parler en risque/coût rejoint la communication
technique et la préparation d'entretien (mois 12). Tes propres projets accumuleront de la dette :
la nommer est un réflexe de maturité qu'un recruteur remarque.

## Mini-exercice
Prends un de tes projets des mois précédents. Liste 3 dettes techniques réelles. Pour chacune :
principal (que faudrait-il faire ?), intérêt (quel surcoût à chaque modif ?), fréquence de
modification de cette zone, et ta décision (rembourser maintenant / plus tard / jamais) avec sa
justification. Tu viens de faire une revue de dette comme en équipe.

## 📚 Vocabulaire
**dette technique** · **principal / intérêt** · **dette délibérée / accidentelle** · **dette
prudente / imprudente** · **dimensions (code/tests/archi/données/infra/doc)** · **priorisation
coût × fréquence** · **boy-scout rule** · **dette tracée** · **maintenance corrective / adaptative /
préventive / évolutive**.

## 🧾 À retenir
La dette technique n'est pas « du mauvais code » : c'est un arbitrage entre vitesse et coût
futur, avec un principal (le raccourci) et un intérêt (le surcoût de chaque modification). Une
dette délibérée, prudente et tracée est saine ; une dette subie et cachée étouffe le projet. On
la priorise par son intérêt réel (coût × fréquence), on la rembourse surtout en continu (boy-
scout), et on la rend visible pour décider — pas pour culpabiliser.
