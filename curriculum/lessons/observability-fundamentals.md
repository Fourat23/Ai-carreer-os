<!-- keep -->
# Leçon — Observabilité : voir ce qui se passe en production

## 🌍 Le problème d'abord
Ton service tourne sur une machine que tu ne regardes pas en direct. Un utilisateur
écrit : « c'est lent, parfois ça plante ». Tu ouvres le code… mais le code a l'air
correct. Le vrai problème : **tu ne VOIS pas ce que fait le service en vrai**. Sur ta
machine tu pouvais mettre des `print` et regarder ; en production, il y a des milliers
de requêtes, plusieurs machines, et personne devant l'écran. Il faut donc que le
service RACONTE lui-même ce qu'il fait — laisser des traces exploitables. C'est tout
le sujet de l'**observabilité** : équiper un système pour pouvoir répondre, après
coup, à la question « mais qu'est-ce qui s'est passé ? ». Cette leçon pose le
vocabulaire et distingue deux mots qu'on confond : **monitoring** et
**observability**.

## 🎯 Objectif
Comprendre la différence entre **monitoring** (« est-ce cassé ? ») et
**observability** (« pourquoi c'est cassé ? »), et connaître les **trois piliers**
(logs, métriques, traces) : à quoi sert chacun et quand l'utiliser.

## 🧩 Prérequis
Tu dois savoir ce qu'est un **service** qui répond à des **requêtes** (par exemple
une API HTTP — voir `/doc/lessons/http-rest-json`) et avoir une idée de ce qu'est la
**production** (le service utilisé pour de vrai, pas sur ta machine). Aucune notion
d'observabilité n'est supposée : on part de « je ne vois pas ce qui se passe ».

## 🧠 Modèle mental
Imagine une voiture (analogie — ses limites plus bas). Le **monitoring**, c'est le
voyant rouge du tableau de bord : il s'allume quand quelque chose de PRÉVU va mal
(plus d'essence, moteur trop chaud). L'**observability**, c'est pouvoir ouvrir le
capot et comprendre une panne que PERSONNE n'avait anticipée, à partir des traces
laissées. Limite de l'analogie : un logiciel n'a pas de capot physique — les
« traces » sont des données qu'il faut avoir DÉCIDÉ d'émettre AVANT la panne. On
n'observe que ce qu'on a instrumenté.

## 📖 Explication progressive
**Monitoring vs observability.** Le monitoring surveille des questions connues
d'avance (« le taux d'erreur dépasse-t-il 1 % ? ») et déclenche des alertes.
L'observability est la capacité à poser des questions NOUVELLES sur le système sans
redéployer (« pourquoi CES requêtes-là, pour CES utilisateurs, sont-elles lentes le
mardi ? »). Le monitoring te dit QUE ça va mal ; l'observability t'aide à comprendre
POURQUOI. Les deux sont complémentaires.

**Les trois piliers.** On instrumente un service de trois façons complémentaires :
- **Logs** : des messages horodatés décrivant des événements (« requête reçue »,
  « erreur base de données »). Précis, riches en contexte, mais volumineux.
- **Métriques** : des NOMBRES agrégés dans le temps (nombre de requêtes/seconde,
  latence, taux d'erreur, mémoire). Légers, parfaits pour les tendances et les
  alertes, mais sans détail.
- **Traces** : le parcours d'UNE requête à travers les différents composants (l'API,
  puis la base, puis un service externe), avec le temps passé à chaque étape. Idéal
  quand « c'est lent » et qu'on cherche OÙ.

**Comment ils se complètent.** Une métrique t'alerte (« le taux d'erreur monte ») ;
une trace te montre QUELLE étape échoue ; un log te donne le DÉTAIL de l'erreur. Les
trois répondent à des questions différentes ; aucun ne remplace les autres.

**Instrumentation.** Aucun de ces signaux n'existe par magie : il faut **instrumenter**
le code (émettre des logs, exposer des métriques, propager des traces). Un service non
instrumenté est une boîte noire — d'où l'expression « on n'observe que ce qu'on a
préparé ».

## 🔎 Décomposition
- « est-ce cassé ? » → monitoring + alertes (métriques).
- « où ça casse ? » → traces.
- « pourquoi précisément ? » → logs.
- « pourrai-je répondre à une question que je n'ai pas encore imaginée ? » →
  observability (dépend de l'instrumentation).

## 🛠 Exemple guidé — « c'est lent, parfois ça plante »
1. **Métrique** : le taux d'erreur est à 3 % (avant : 0,1 %) et la latence p95 a
   doublé → il y a bien un problème, et il a commencé à une certaine heure.
2. **Trace** : sur une requête lente, 90 % du temps est passé dans l'appel à la base
   de données → le problème est là, pas dans le code de l'API.
3. **Log** : au moment des erreurs, « connection pool exhausted » → la base refuse de
   nouvelles connexions.
4. Conclusion étayée par des DONNÉES, pas par des suppositions : le pool de
   connexions est trop petit pour la charge. On sait quoi corriger.

## 🧪 Mise en pratique
Voir la pratique associée : identifier ce qui MANQUE pour diagnostiquer une panne
(quel pilier absent ?), et lire un récapitulatif de santé de service.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Ton équipe a quarante tableaux de bord et vingt alertes. Est-elle observable ?
   Qu'est-ce qui te permettrait de trancher ?
2. Un incident survient. Quelle question dois-tu pouvoir poser à tes données que tu
   n'avais pas anticipée ? Donne un exemple concret sur un service que tu connais.
3. Métrique, log, trace : laquelle répond à « combien », laquelle à « où », laquelle à
   « pourquoi » ? Et pourquoi aucune ne suffit seule ?
4. Un tableau de bord est vert pendant qu'un client ne peut pas payer. Nomme deux
   raisons structurellement différentes à cela.

## ✅ Correction attendue

**La démarche.** L'observabilité ne se mesure pas au nombre d'écrans. Elle se mesure à
une seule chose : **le nombre de questions nouvelles auxquelles tes données peuvent
répondre sans redéployer.**

**L'erreur probable : confondre couverture et observabilité.** La réponse spontanée à
la première question est « oui, quarante tableaux de bord, c'est bien couvert ». Elle
est fausse, et pour une raison qui mérite d'être nommée : **un tableau de bord est la
réponse figée à une question que quelqu'un s'est déjà posée.** Quarante tableaux de
bord, ce sont quarante pannes anticipées. L'incident qui te coûtera ta nuit sera le
quarante-et-unième — celui que personne n'a imaginé, donc celui pour lequel aucun
écran n'existe.

Le piège séduit parce que **les tableaux de bord sont du travail visible**. On les
montre, on les compte, ils rassurent en réunion. L'observabilité, elle, est une
propriété invisible tant qu'on n'en a pas besoin : elle se paie en instrumentation
(cardinalité maîtrisée, contexte propagé, champs utiles) et ne se voit que le jour de
la panne inédite.

Le test décisif, à poser à n'importe quelle équipe : *« Hier, une requête sur mille a
échoué pour un seul client, sur une seule région, entre 14 h 02 et 14 h 09. Peux-tu me
dire pourquoi, maintenant, sans déployer quoi que ce soit ? »* Si la réponse est
« il faudrait que j'ajoute un log », le système n'est pas observable — quel que soit le
nombre d'écrans.

**Sur les autres questions.** La métrique répond à **combien** et **depuis quand** (une
tendance agrégée, bon marché, sans détail) ; la trace répond à **où** (quel composant,
dans quel ordre) ; le log répond à **quoi exactement** (le message d'erreur, la valeur
fautive). Aucune ne suffit seule parce que chacune jette ce que les autres gardent :
la métrique perd l'individu, la trace perd le détail, le log perd la vue d'ensemble.

Le tableau de bord vert pendant qu'un client ne peut pas payer a deux causes
**structurellement** différentes, et les confondre coûte cher. Soit **on mesure la
mauvaise chose** — le taux de succès HTTP est à 100 % parce que l'API répond `200` avec
un corps d'erreur, ou parce qu'on mesure la santé de l'infrastructure et pas celle du
parcours utilisateur. Soit **on mesure la bonne chose mais on l'agrège trop** — un
client sur dix mille disparaît dans une moyenne, et un incident régional disparaît
dans un total mondial. Le premier se corrige en changeant l'indicateur, le second en
changeant sa granularité.

**Alternative défendable.** Certaines équipes matures suppriment volontairement des
tableaux de bord pour n'en garder que trois ou quatre, et investissent le temps gagné
dans l'instrumentation et les requêtes ad hoc. C'est défendable et souvent supérieur :
un écran que personne ne regarde coûte en maintenance sans rien apprendre. Mais cela
suppose que l'équipe sache écrire des requêtes sous pression, à trois heures du matin —
ce qui n'est pas donné et doit être entraîné.

**Vérifie seul, sans corrigé** :
1. Pose le test décisif ci-dessus à ton propre service. La réponse honnête est
   généralement « il faudrait que j'ajoute un log ».
2. Compte tes tableaux de bord, puis compte ceux qui ont été ouverts lors du dernier
   incident. L'écart est ton coût de maintenance inutile.
3. Prends ta métrique principale. Quelle panne réelle pourrait-elle laisser passer sans
   bouger ? Si tu n'en trouves aucune, tu n'as pas assez cherché.

## ⚠️ Erreurs fréquentes / anti-patterns
- **Confondre monitoring et observability** : avoir des alertes ne garantit pas de
  pouvoir comprendre une panne inédite.
- **Tout logger** : des logs énormes et sans structure coûtent cher et noient
  l'information (voir la leçon logs structurés).
- **Zéro instrumentation** puis s'étonner de ne rien voir pendant un incident.
- Croire qu'une seule métrique (le CPU) suffit à tout expliquer.
- Regarder un dashboard vert et conclure « tout va bien » alors qu'on ne mesure pas
  la bonne chose.

## 🏢 Cas métier
Une équipe n'avait que des logs. Pendant un incident, elle a passé une heure à
grep-er des millions de lignes pour comprendre « où » ça ralentissait. Après avoir
ajouté des métriques (alertes + tendances) et des traces (localiser l'étape lente),
le même type d'incident se diagnostique en minutes : la métrique alerte, la trace
localise, le log explique.

## 🚨 Que faire dans ce cas ? — « incident réel mais dashboard vert »
- **Observer** : le dashboard mesure-t-il ce que vivent les UTILISATEURS (latence
  côté client, erreurs métier) ou seulement l'infra (CPU, mémoire) ?
- **Hypothèse** : un « angle mort » — on ne mesure pas le bon signal.
- **Corriger** : ajouter la métrique manquante (ex. taux d'erreur par endpoint,
  latence p95 vue du client) ; ajouter une trace sur le chemin suspect.
- **Prévenir** : partir des besoins UTILISATEUR pour choisir quoi mesurer, pas de ce
  qui est facile à mesurer.

## 🎤 Questions d'entretien
- « Monitoring vs observability ? » → savoir QUE ça casse vs pouvoir comprendre
  POURQUOI, y compris des pannes non anticipées.
- « Cite les trois piliers et leur usage. » → logs (détail), métriques (tendances/
  alertes), traces (où le temps est passé).
- « Un dashboard vert prouve-t-il que tout va bien ? » → non, seulement que ce qu'on
  mesure va bien.

## ✅ À retenir
- Monitoring = « est-ce cassé ? » ; observability = « pourquoi ? ».
- Trois piliers complémentaires : logs, métriques, traces.
- On n'observe que ce qu'on a instrumenté.
- Métrique pour alerter, trace pour localiser, log pour expliquer.

## 📚 Vocabulaire
**observability / observabilité** · **monitoring** · **télémétrie** ·
**instrumentation** · **log** · **métrique** · **trace** · **pilier
d'observabilité** · **angle mort (blind spot)** · **dashboard**.

## 🎯 Pratique associée
Exercices : identifier le signal manquant, lire un récapitulatif de santé (voir liens
ci-dessous).

## 🔗 Liens avec le programme
Jour `/day/79` (observabilité). Leçons liées : `/doc/lessons/observability-logging`,
`/doc/lessons/logging-structured`, `/doc/lessons/distributed-tracing`,
`/doc/lessons/metrics-percentiles`. La suite couvre les leçons SRE et incident.
