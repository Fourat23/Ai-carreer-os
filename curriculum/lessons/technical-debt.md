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

## Concepts clés
Dette technique = arbitrage risque/vitesse · principal vs intérêt · quadrants (délibérée/
accidentelle × prudente/imprudente) · dimensions (code, tests, archi, données, infra, doc) ·
priorisation par coût × fréquence · remboursement continu (boy-scout) · dette visible et tracée.

## 🧭 Exemple guidé
Décider face à une dette, comme un investisseur :
```
Situation : le module de paiement est dupliqué en 3 endroits légèrement différents.
- Principal : unifier derrière une seule fonction bien testée (~2 jours).
- Intérêt : chaque évolution de tarif doit être faite 3 fois, avec un risque d'oubli
  (bugs de facturation) — et ce module change ~tous les mois.
Décision : intérêt élevé (code fréquemment touché + risque financier) → on rembourse
maintenant. À comparer avec une duplication dans un script lancé une fois par an :
même laideur, intérêt quasi nul → on laisse.
```
La laideur ne décide pas : c'est l'intérêt (coût récurrent × fréquence) qui décide.

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
coût × fréquence** · **boy-scout rule** · **dette tracée**.

## 🧾 À retenir
La dette technique n'est pas « du mauvais code » : c'est un arbitrage entre vitesse et coût
futur, avec un principal (le raccourci) et un intérêt (le surcoût de chaque modification). Une
dette délibérée, prudente et tracée est saine ; une dette subie et cachée étouffe le projet. On
la priorise par son intérêt réel (coût × fréquence), on la rembourse surtout en continu (boy-
scout), et on la rend visible pour décider — pas pour culpabiliser.
