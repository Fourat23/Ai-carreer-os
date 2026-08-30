<!-- keep -->
# Leçon — Métriques et percentiles : quand la moyenne ment

## 🌍 Le problème d'abord
Ton tableau de bord affiche « latence moyenne : 120 ms ». Tout va bien, non ? Et
pourtant le support reçoit des plaintes : « le site rame ». Comment est-ce possible si
la moyenne est bonne ? Parce que la **moyenne écrase les cas graves** : si 99
requêtes prennent 50 ms et 1 requête prend 7 secondes, la moyenne reste basse (~120
ms) alors qu'un utilisateur sur cent attend 7 secondes. Cette personne, c'est
peut-être ton plus gros client. Pour VOIR ces cas, il faut d'autres outils que la
moyenne : les **percentiles**. Cette leçon apprend à lire les bons nombres pour
qu'une catastrophe cachée ne passe plus inaperçue.

## 🎯 Objectif
Comprendre les grandes familles de **métriques** (latence, trafic, erreurs,
saturation), pourquoi la **moyenne trompe** et comment les **percentiles**
(p50/p95/p99) révèlent l'expérience réelle, et connaître trois cadres de lecture :
**RED**, **USE** et les **Golden Signals**.

## 🧩 Prérequis
Tu dois comprendre le rôle des **métriques** parmi les piliers de l'observabilité
(`/doc/lessons/observability-fundamentals`) et avoir une idée des **ressources**
d'une machine (CPU, mémoire, I/O — `/doc/lessons/linux-resources-io`). Aucune
statistique avancée n'est requise : la notion de percentile est construite ici.

## 🧠 Modèle mental
Une **métrique** est un nombre mesuré dans le temps (requêtes/seconde, ms de latence,
% d'erreurs). La **moyenne** résume mal une distribution asymétrique : quelques
valeurs extrêmes la tirent peu, mais font très mal aux utilisateurs concernés. Un
**percentile** répond à « quelle valeur n'est PAS dépassée par X % des requêtes ? ».
p95 = 800 ms signifie « 95 % des requêtes sont sous 800 ms, mais 5 % sont AU-DESSUS ».
Penser « le pire vécu par les 5 % / 1 % les plus malchanceux », pas « la valeur
typique ».

## 📖 Explication progressive
**Les quatre familles de signaux.** Pour un service, on surveille surtout :
- **Latence** : combien de temps pour répondre (et pour les requêtes en ERREUR aussi
  — une erreur rapide vs lente n'a pas le même sens).
- **Trafic / débit** : combien de requêtes par seconde.
- **Erreurs** : quelle fraction échoue (4xx/5xx, exceptions).
- **Saturation** : à quel point les ressources sont pleines (CPU, mémoire, file
  d'attente) — le signal qui précède l'effondrement.

**Percentiles vs moyenne.** p50 (médiane) = l'expérience typique. p95/p99 = la queue,
là où vivent les utilisateurs qui souffrent. On surveille les percentiles ÉLEVÉS
parce que : (1) la moyenne cache la queue ; (2) un utilisateur fait souvent plusieurs
requêtes — la probabilité qu'AU MOINS UNE tombe dans les 1 % lents est élevée. Règle :
on parle de latence en p95/p99, pas en moyenne.

**Comment on calcule un percentile, concrètement.** Trois gestes, et aucune formule à
retenir :

1. **Trier** les mesures de la plus petite à la plus grande.
2. **Compter** combien il faut en garder : pour le pXX de `n` mesures, c'est le rang
   `XX % × n`, arrondi au supérieur.
3. **Lire** la valeur à ce rang.

Sur douze latences en millisecondes — `40 45 50 50 55 60 60 70 90 120 400 900` (déjà
triées) :

| | rang | valeur |
|---|---|---|
| **p50** | 50 % × 12 = 6 | **60 ms** |
| **p95** | 95 % × 12 = 11,4 → 12 | **900 ms** |

On lit donc : la moitié des requêtes répondent en 60 ms ou moins, et 5 % dépassent…
eh bien, il n'y en a qu'une au-dessus du rang 11, donc le p95 tombe sur la plus
lente. **Avec douze mesures, le p95 n'a presque aucun sens** : il désigne une seule
requête. C'est la première chose à vérifier devant un percentile — *combien de
mesures y a-t-il derrière ?* Un p99 calculé sur 50 requêtes ne décrit rien.

Les outils de monitoring emploient parfois une interpolation entre les deux valeurs
qui encadrent le rang, ce qui donne un nombre légèrement différent. Cela ne change ni
la lecture ni les décisions ; ne t'en préoccupe que si tu compares deux outils entre
eux.

**Exemple chiffré (la moyenne ment).** 100 requêtes : 99 à 50 ms, 1 à 5 000 ms.
Moyenne ≈ 100 ms (« ça va »), alors qu'**aucune requête réelle n'a jamais pris
100 ms** : la moyenne décrit une expérience que personne n'a vécue. C'est le premier
enseignement.

Le second est plus subtil, et c'est celui sur lequel presque tout le monde se trompe.
Applique les trois gestes : rang du p99 = 99 % × 100 = 99, et la 99ᵉ valeur triée
vaut **50 ms**. Donc **p99 = 50 ms**, pas 5 000. La requête à 5 000 ms est la
centième : c'est le **maximum**, le p100.

Autrement dit : sur cet échantillon, **même le p99 ne voit pas le problème.** Un seul
utilisateur sur cent souffre, et il faut regarder le maximum — ou compter les
requêtes au-dessus d'un seuil — pour le découvrir. Retiens la règle générale : **un
percentile ne peut pas révéler un incident qui touche moins de requêtes que sa propre
marge.** Le p99 est aveugle en dessous de 1 %.

Change une seule chose et tout bascule : si **cinq** requêtes sur cent prennent
5 000 ms, alors le rang du p99 est toujours 99, mais les valeurs 96 à 100 valent
désormais 5 000 — et p99 = 5 000 ms. Le p95, lui, vaut encore 50 ms. Le percentile
qui « voit » un problème dépend directement de la fraction d'utilisateurs touchés.

**Trois cadres pour ne rien oublier.**
- **RED** (pour les services orientés requêtes) : **R**ate (trafic), **E**rrors,
  **D**uration (latence).
- **USE** (pour les ressources) : **U**tilization, **S**aturation, **E**rrors.
- **Golden Signals** (Google SRE) : latence, trafic, erreurs, saturation.
Ce sont des check-lists : elles évitent l'angle mort « je ne mesurais pas les
erreurs ».

**Baseline et régression.** Un nombre seul ne dit rien : 300 ms, c'est bien ou mal ?
Il faut une **baseline** (la normale). Une **régression de performance** = un écart
significatif vs la baseline après un changement (ex. p95 x2 après une release). D'où
l'intérêt de comparer AVANT/APRÈS, pas de juger dans l'absolu.

**Bottleneck et profiling.** Quand une étape domine le temps (cf. traces), c'est le
**goulot d'étranglement** (bottleneck). Le **profiling** mesure où le CPU/le temps
est réellement dépensé DANS le code. On optimise le goulot, pas au hasard.

**La cardinalité, ou pourquoi on ne peut pas tout étiqueter.** Une métrique porte des
**étiquettes** (labels) qui permettent de la découper : latence *par endpoint*, *par
code de statut*, *par région*. La **cardinalité** est le nombre de combinaisons
distinctes d'étiquettes — et le système de monitoring stocke **une série temporelle
par combinaison**. Trois endpoints × quatre statuts × deux régions = 24 séries :
tranquille.

Le piège apparaît quand on ajoute une étiquette dont les valeurs sont nombreuses.
Étiqueter la latence par `user_id` sur 100 000 utilisateurs crée 100 000 séries par
combinaison des autres étiquettes. Le stockage explose, les requêtes ralentissent,
et le système de monitoring devient lui-même l'incident. La règle : **une étiquette
doit avoir peu de valeurs possibles, et ces valeurs doivent être connues d'avance.**
Identifiants, adresses, chemins d'URL complets, messages d'erreur : jamais en
étiquette. Pour retrouver un cas individuel, ce sont les **traces** et les **logs**
qui servent, pas les métriques.

## 🔎 Décomposition
- métrique = un nombre dans le temps ; moyenne = résumé trompeur si distribution
  asymétrique.
- percentile = trier, rang `XX % × n` arrondi au supérieur, lire la valeur.
- p50 = typique ; p95/p99 = la queue qui fait mal ; **le p99 est aveugle sous 1 %**.
- RED (requêtes), USE (ressources), Golden Signals = check-lists de couverture.
- baseline = la normale ; régression = écart significatif vs baseline.
- cardinalité = nombre de séries créées par les étiquettes ; elle borne ce qu'on a le
  droit de mesurer.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction. Aucune de ces réponses n'est dans le texte
ci-dessus telle quelle.

1. Un service traite 200 requêtes par minute. Son tableau de bord affiche un p99 par
   minute. Que vaut ce nombre, et pourquoi ?
2. Ton p95 et ton p99 sont tous deux égaux à 2 000 ms, et ton maximum aussi. Qu'est-ce
   que cela t'apprend sur la forme de la distribution ?
3. On te demande d'ajouter une étiquette `pays` (une trentaine de valeurs) puis une
   étiquette `session_id`. Laquelle acceptes-tu, et qu'arrive-t-il si tu acceptes
   l'autre ?
4. Une release fait passer le p50 de 60 à 65 ms et le p99 de 6 000 à 900 ms. Est-ce
   une amélioration ? Pour qui ?

## 🛠 Exemple guidé — « la moyenne est bonne, les clients râlent »

**La situation.** Le tableau de bord affiche « latence moyenne : 120 ms », stable
depuis des mois. Le support remonte chaque semaine des plaintes de lenteur, jamais
reproductibles. Les deux camps ont raison et personne ne se comprend.

**Première tentative, celle que tout le monde fait.** On ouvre le code de l'endpoint
le plus appelé et on cherche ce qui pourrait être lent. On trouve une requête SQL sans
index, on l'indexe, on déploie. Une semaine plus tard : moyenne à 118 ms, et les
plaintes continuent, identiques.

**Ce que cette tentative a coûté, et pourquoi elle était raisonnable.** Une semaine,
et surtout la conviction d'avoir agi. Elle était raisonnable parce qu'on a bien trouvé
un vrai défaut et bien fait une vraie correction. Le problème est ailleurs : **on n'a
jamais vérifié que ce défaut était CELUI dont se plaignaient les utilisateurs.** On a
optimisé ce qu'on savait trouver, pas ce qui faisait mal.

**On repart de la mesure.** Les percentiles, cette fois :

```
p50 =  60 ms      p95 = 400 ms      p99 = 6 000 ms
```

**Ce que ces trois nombres disent, lus ensemble.** Le p50 à 60 ms confirme que le cas
courant va bien — l'index n'a rien cassé. Le p95 à 400 ms montre que la dégradation
commence bien avant la queue extrême. Le p99 à 6 000 ms dit qu'une requête sur cent
est inutilisable.

Et la moyenne à 120 ms ? Elle se situe **entre le p50 et le p95**, dans une zone où
presque aucune requête ne tombe. Elle ne décrivait aucun utilisateur. C'est pour cela
qu'elle ne bougeait pas quand on corrigeait, et pour cela qu'elle était stable et
rassurante.

**L'observation qui change le diagnostic.** Une requête sur cent semble négligeable —
1 % d'utilisateurs mécontents. Mais une page déclenche typiquement vingt appels. La
probabilité qu'aucun des vingt ne tombe dans le mauvais 1 % est `0,99²⁰ ≈ 0,82`.
**Un chargement de page sur cinq contient donc au moins une requête à 6 secondes.**
Le « 1 % » des requêtes est 18 % des sessions. Voilà pourquoi le support voit ce que
le tableau de bord ne voit pas.

**On cible, maintenant qu'on sait où.** Une trace sur une requête effectivement lente
(pas sur une prise au hasard) montre où part le temps. On corrige ce goulot-là, puis
**on re-mesure le p99, pas la moyenne** — c'est le nombre qui doit bouger.

**L'enseignement qui dépasse le cas.** Une métrique n'est pas un score, c'est une
question posée aux données. « Quelle est la latence moyenne ? » est une mauvaise
question : elle a toujours une réponse et cette réponse ne décide de rien. « Quelle
est la pire latence que subit un utilisateur sur vingt, et combien de fois par
session ? » est une bonne question. Change la question avant de changer le code.

## 🧪 Mise en pratique
Calculer p50/p95/p99 d'un échantillon avec les trois gestes ci-dessus (trier, rang,
lire), rendre un verdict de régression vs baseline, repérer un signal d'observabilité
manquant. Voir la pratique associée.

## ⚠️ Erreurs fréquentes / anti-patterns
- **Juger la latence à la moyenne** → on rate la queue (p95/p99).
- Comparer un nombre à rien (**pas de baseline**) → « 300 ms » ne veut rien dire seul.
- Oublier une famille de signaux (souvent la **saturation** ou les **erreurs**).
- Optimiser au hasard sans identifier le **goulot** (profiling/traces d'abord).
- Mesurer la latence des seules requêtes en SUCCÈS (les erreurs lentes comptent aussi).

## 🏢 Cas métier
Une équipe pilotait sur la latence moyenne (stable). Le taux de churn augmentait sans
explication. En passant au p99, elle découvre que 2 % des requêtes prenaient > 8 s —
concentrées sur les gros comptes (plus de données). Correctif ciblé (pagination +
index) : p99 divisé par 10, churn en baisse. La moyenne ne l'aurait jamais montré.

## 🚨 Que faire dans ce cas ? — « le p95 explose après une release »
- **Observer** : confirmer avec la métrique (p95 avant/après) et localiser via une
  trace.
- **Limiter l'impact** : si la release est la cause, envisager rollback (cf.
  release-incident-recovery).
- **Hypothèses** : nouveau code dans le chemin critique ? requête N+1 ? cache perdu ?
- **Corriger puis valider** : re-mesurer le p95 vs baseline ; ne considérer résolu que
  si la métrique revient.
- **Prévenir** : porte de perf en CI (comparer à la baseline), alerte sur p95/p99.

## ✅ Correction attendue

**La démarche.** Trier, calculer le rang, lire la valeur. Puis, avant toute
interprétation, se demander **sur combien de mesures** le percentile est calculé et
**quelle fraction d'utilisateurs** il laisse hors de son champ.

**L'erreur probable, et elle survit à des années de carrière.** Devant l'échantillon
« 99 requêtes à 50 ms, 1 à 5 000 ms », la réponse spontanée est `p99 = 5 000 ms`. Elle
est fausse : le p99 vaut 50 ms, et 5 000 ms est le maximum.

Le piège séduit pour une raison précise, et il faut la nommer parce qu'elle ne
disparaît pas toute seule : **on entend « p99 » comme « le pire centième », alors que
la définition dit « la valeur que 99 % ne dépassent pas ».** Ce sont deux bornes
opposées du même intervalle. La formulation courante « le p99, c'est ce que vivent
les 1 % les plus malchanceux » entretient la confusion — elle est utile comme image et
fausse comme définition.

**Comment reconnaître le problème la prochaine fois.** Un réflexe suffit : *le pXX est
toujours l'une des valeurs de l'échantillon, et c'est toujours l'une des plus grandes
— mais jamais la plus grande, sauf si XX % × n arrondi tombe sur le dernier rang.*
Si ton p99 est égal à ton maximum, tu as soit trop peu de mesures, soit une queue plus
épaisse que 1 %.

**Alternative défendable au pilotage par percentiles.** Compter les requêtes au-dessus
d'un **seuil absolu** — « combien de requêtes ont dépassé 1 seconde aujourd'hui ? ».
C'est moins élégant, mais cela répond directement à la question métier, cela reste
lisible avec peu de trafic, et cela ne devient pas aveugle sous 1 % comme le p99. Les
budgets d'erreur des SLO fonctionnent exactement ainsi. Les deux approches se
complètent : le percentile pour la tendance, le comptage au seuil pour l'engagement.

**Vérifie seul, sans corrigé** :
1. Reprends tes douze latences et calcule le p90 à la main. Puis retire la valeur à
   900 ms et recalcule. Si le p90 ne bouge pas, tu as compris pourquoi les percentiles
   élevés sont instables sur de petits échantillons.
2. Prends le p99 de ton service. Combien de requêtes y a-t-il derrière sur la fenêtre
   affichée ? Si c'est moins de quelques centaines, ce nombre est du bruit — et
   pourtant il est affiché avec trois décimales.
3. Sur ton tableau de bord : la moyenne tombe-t-elle entre ton p50 et ton p95 ? Si
   oui, elle ne décrit aucune requête réelle, et tu peux la retirer de l'écran.
4. Un incident touche 0,3 % des requêtes. Lequel de tes indicateurs actuels le
   verrait ? Si la réponse est « aucun », c'est le trou à combler.

## 🔥 Pratique — faire dire la vérité à des mesures

**A. La moyenne qui ment.** Fabrique un jeu de latences où la moyenne est
excellente et le centile 95 mauvais. Livrable : les deux valeurs, et le nombre
d'utilisateurs concernés sur un million de requêtes par jour.

**B. Calculer un centile.** Implémente le calcul à partir d'une liste triée,
puis vérifie-le sur un jeu dont tu connais la réponse. Livrable : le code et la
vérification.

**C. Ce qui ne s'additionne pas.** Prends deux instances ayant chacune un centile
95, calcule leur moyenne, puis calcule le centile 95 de l'ensemble des
observations. Compare. Livrable : les deux nombres.

**D. Compteur, jauge, histogramme.** Pour chacun des trois types, donne une
métrique de ton service et dis ce qu'on peut et ne peut pas en déduire.
Livrable : le tableau.

**E. Le taux d'erreur qui trompe.** Construis un cas où le taux d'erreur global
est bon et où une route est cassée. Livrable : les deux chiffres, et ce qui
manque à la métrique globale.

## ✅ Correction attendue

**A — la moyenne.** Un jeu typique : 95 % des requêtes à 50 ms, 5 % à 3 000 ms.
Moyenne **197 ms**, ce qui paraît correct. Centile 95 : **3 000 ms**.

La conversion qui rend le chiffre parlant : sur un million de requêtes par jour,
**cinquante mille personnes attendent trois secondes**. C'est ce calcul qu'il faut
savoir faire en réunion — un centile est un pourcentage, un nombre d'utilisateurs
est un argument.

Nuance à connaître : le centile 99 n'est pas « 1 % des gens ». C'est 1 % des
**requêtes**, et les utilisateurs les plus actifs en font le plus — donc ils ont
la plus forte probabilité d'en rencontrer une lente. La proportion d'utilisateurs
touchés est nettement supérieure à 1 %.

**B — le calcul.** Sur une liste triée de *n* valeurs, le centile *p* est la
valeur à l'indice `p × n`. Le piège est le traitement des bords et
l'interpolation entre deux indices — d'où la vérification sur un jeu dont on
connaît la réponse, qui n'est pas une formalité : c'est le seul moyen de savoir
si ta convention correspond à celle de ton outil de mesure.

**C — les centiles ne se moyennent pas.** C'est le résultat central de
l'exercice, et il surprend systématiquement. La moyenne de deux centiles 95
**n'est pas** le centile 95 de l'ensemble.

La raison : un centile est une position dans une distribution, pas une quantité
additive. Deux instances dont l'une est lente et l'autre rapide produisent un
centile global qui n'a aucune raison d'être entre les deux.

La conséquence pratique est sévère : un tableau de bord qui affiche « centile 95
moyen sur les instances » affiche un nombre **qui ne correspond à rien**. La
bonne méthode est d'agréger les observations — ou des histogrammes — et de
calculer le centile ensuite.

**D — les trois types.**

| type | exemple | ce qu'on peut en déduire | ce qu'on ne peut pas |
|---|---|---|---|
| compteur | requêtes servies | un **taux** par dérivation | la valeur instantanée n'a pas de sens |
| jauge | connexions ouvertes | l'état à un instant | ce qui s'est passé entre deux mesures |
| histogramme | latences | des **centiles**, agrégeables | la valeur d'une requête précise |

Le piège de la jauge mérite d'être nommé : entre deux relevés, elle a pu monter à
dix fois sa valeur et redescendre. Une jauge relevée toutes les minutes **ne peut
pas** détecter un pic de dix secondes, et son graphique plat est trompeur.

**E — le taux global.** Le cas à construire : neuf routes à 0,1 % d'erreur, une
route cassée à 100 %, mais qui ne représente que 1 % du trafic. Le taux global
vaut environ 1,1 % — un chiffre qui ne déclenche aucune alerte.

Ce qui manque à la métrique globale est la **ventilation**. Une métrique agrégée
est faite pour être découpée : par route, par version, par client. Sans étiquettes
pour le faire, elle ne peut détecter que les pannes qui touchent tout le monde —
c'est-à-dire les seules qu'on aurait vues de toute façon.

Réserve à connaître : la ventilation a un coût, et il est traité dans
`observability-fundamentals` sous le nom de cardinalité. Découper par route et
par version est raisonnable ; découper par identifiant d'utilisateur fait tomber
le système de métriques. La ventilation utile est celle qui a peu de valeurs
distinctes et qui correspond à une décision.

## 🎤 Questions d'entretien
- « Pourquoi la moyenne trompe-t-elle ? » → Parce qu'une distribution de latences est
  asymétrique : la moyenne tombe entre la masse et la queue, dans une zone où presque
  aucune requête ne se trouve. Elle décrit une expérience que personne ne vit.
- « Que signifie p99 = 800 ms ? » → Que 99 % des requêtes répondent en 800 ms ou
  moins. Ce n'est PAS la latence des 1 % restants : celle-là peut valoir n'importe
  quoi au-dessus, et seul le maximum la borne.
- « Un utilisateur sur cent est lent, est-ce grave ? » → Presque toujours oui, parce
  qu'une page enchaîne des dizaines de requêtes : 1 % des requêtes fait couramment
  15 à 20 % des sessions dégradées. Les taux par requête et par session sont deux
  choses différentes.
- « RED vs USE ? » → Rate/Errors/Duration décrit un service vu de l'extérieur ;
  Utilization/Saturation/Errors décrit une ressource vue de l'intérieur. On a besoin
  des deux : le premier dit qu'on souffre, le second dit pourquoi.

## ✅ À retenir
- La moyenne ment sur les distributions asymétriques : piloter en p95/p99.
- Quatre signaux : latence, trafic, erreurs, saturation.
- RED (requêtes), USE (ressources), Golden Signals : check-lists de couverture.
- Toujours une baseline ; une régression = écart significatif vs baseline.

## 📚 Vocabulaire
**métrique** · **latence / débit / erreurs / saturation** · **moyenne vs
percentile** · **p50 / p95 / p99** · **RED · USE · Golden Signals** · **baseline** ·
**régression de performance** · **goulot d'étranglement (bottleneck)** ·
**profiling** · **cardinalité**.

## 🎯 Pratique associée
Exercices : calcul de percentiles, verdict de régression, signal manquant.

## 🔗 Liens avec le programme
Jours `/day/79` (observabilité) et `/day/80` (performance). Leçons liées :
`/doc/lessons/observability-fundamentals`, `/doc/lessons/distributed-tracing`,
`/doc/lessons/linux-resources-io`, `/doc/lessons/slo-error-budget`. Les percentiles
sont la base des SLO et de l'error budget.
