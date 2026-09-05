<!-- keep -->
# Leçon — Observabilité et logs structurés

> **Observabilité** : capacité à répondre à une question qu'on n'avait pas
> prévue sur un système en marche, **sans le modifier ni le redéployer**.
> C'est une propriété du système, pas un outil qu'on installe.

## 🌍 Le problème d'abord
Un utilisateur signale : « votre appli a planté hier soir vers 22 h ». Tu ouvres ton code… et tu n'as AUCUNE idée de ce qui s'est passé : pas de trace, pas d'événement enregistré, rien à rejouer. Tu devines, tu tâtonnes, tu ne reproduis pas. Un système qu'on ne peut pas OBSERVER est une boîte noire indéfendable — et c'est encore pire pour un système IA non déterministe. Il te faut des enregistrements exploitables : des logs structurés, des niveaux, un identifiant pour suivre une requête de bout en bout. Cette leçon t'apprend à rendre un système observable, et surtout ce qu'il ne faut JAMAIS enregistrer.

## 🎯 Objectif
Rendre un système OBSERVABLE : savoir ce qui s'est passé en production sans deviner. Maîtriser les logs structurés, les niveaux, le correlation id, et savoir quoi ne JAMAIS logger. Sans observabilité, tout système (surtout IA) est une boîte noire indéfendable.

## 🧩 Prérequis
Tu dois comprendre le cycle de vie d'une requête (entrée, traitement, réponse) vu en HTTP (`/doc/lessons/http-rest-json`) et la gestion d'erreurs (`/doc/lessons/error-handling`), car on enregistre justement erreurs et événements. La notion de donnée sensible/secret (`/doc/lessons/deployment-secrets`) éclaire ce qu'il ne faut jamais logger. Aucun outil d'observabilité particulier n'est supposé.

## 🧠 Modèle mental
L'observabilité, c'est **la boîte noire d'un avion** : quand quelque chose se passe (crash, lenteur, réponse étrange), tu peux REJOUER le film. Trois instruments : les **logs** (les événements), les **métriques** (les agrégats), les **traces** (le parcours d'UNE requête).

## 📖 Explication complète
- **Logs structurés** : du JSON (`{"ts":"…","level":"info","msg":"…","requestId":"…"}`), pas du texte libre. Un log JSON s'interroge mécaniquement (« toutes les erreurs de cette requête ») ; un log texte exige des yeux humains.
- **Niveaux** : `debug` (détail dev), `info` (événements normaux), `warn` (anormal mais géré), `error` (échec). Filtrer par niveau permet de monter/baisser le volume sans redéployer.
- **Correlation id** : un identifiant unique généré à l'ENTRÉE de chaque requête et propagé dans TOUS les logs qu'elle traverse. C'est lui qui relie « la question de l'utilisateur » à « l'appel LLM » à « l'erreur de parsing » — sans lui, impossible de reconstituer une session.
- **Ce qu'on ne logge jamais** : mots de passe, tokens, données personnelles sensibles, prompts contenant des données privées. Un log est une base de données que tout le monde lit.
- **Métriques** : compteurs et latences agrégés (requêtes/min, p95). Les logs disent « quoi », les métriques disent « combien et à quelle vitesse ».

**Comment le correlation id se propage réellement**, parce que « propagé dans tous les logs » cache la seule difficulté du sujet. À l'intérieur d'un service, il faut que chaque fonction qui logue puisse y accéder — soit on le passe en paramètre partout, ce qui pollue toutes les signatures, soit on l'attache à un contexte lié à la requête (`AsyncLocalStorage` en Node) que le logger consulte tout seul. Entre services, il ne se propage pas par magie : **le service appelant doit le mettre dans un en-tête HTTP** (`X-Request-Id` ou le standard `traceparent`), et le service appelé doit le lire au lieu d'en générer un nouveau. Un seul maillon qui oublie de transmettre, et la chaîne se casse en deux à cet endroit précis — sans erreur, sans alerte, juste une enquête qui s'arrête net le jour où on en a besoin.

**Le volume est un vrai problème, et l'ignorer coûte cher.** À quelques milliers de requêtes par seconde, tout journaliser en `info` produit des téraoctets et une facture supérieure à celle du service lui-même. Trois leviers, dans cet ordre : **le niveau** (`info` en production, `debug` activable temporairement), **l'échantillonnage** (journaliser 1 % des requêtes réussies, mais **100 % des erreurs** — les échecs sont rares et c'est eux qu'on relit), et la **rétention** (garder 7 jours en accès rapide, archiver le reste). Le principe qui guide : on journalise ce qu'on relira, avec la certitude de garder ce qui est rare et grave.

## 🔧 Exemple simple
```json
{"ts":"2026-07-05T10:12:03Z","level":"error","requestId":"a1b2","msg":"parse LLM output failed","attempt":2}
```
Une ligne : quand, quoi, pour quelle requête, à quelle tentative.

## 🧭 Exemple guidé — trois questions qu'un journal doit savoir répondre

Le mot « observabilité » est vague, et le vague empêche de décider quoi
journaliser. Une définition opérationnelle le remplace avantageusement : **un
système est observable si tu peux répondre à une question que tu n'avais pas
prévue, sans redéployer.** C'est ce critère qu'on va appliquer à trois questions
réelles, chacune mesurée par
`scripts/v70-verifications/journaux-et-correlation.mjs`.

### Question 1 — « combien d'erreurs ont pour motif un refus de la banque ? »

On pose la question à deux journaux qui décrivent **la même réalité** : l'un en
texte lisible, l'autre structuré. Un tiers des messages d'erreur contient un
retour à la ligne, parce que le motif vient de la banque.

```
réponse vraie     : 58
réponse via JSON  : 58
réponse via texte : 37   (écart : −21)
```

Trente-six pour cent de sous-estimation, **sans aucun signal d'erreur**.
L'expression régulière rejette les lignes de continuation ; elles n'ont ni
horodatage ni niveau ; elles disparaissent du décompte.

Et le détail qui rend le défaut si difficile à repérer : sur une autre question
posée au même journal — « combien d'erreurs sur `/paiement` au-delà de 300 ms ? »
— le journal texte donne **la bonne réponse** (9 contre 9), tout en ayant rejeté
24 lignes. La fiabilité dépend de la question, ce qui revient à dire qu'on ne
peut pas s'y fier : pendant un incident, on pose justement les questions qu'on
n'avait pas prévues.

**Conséquence pour la conception :** tout ce sur quoi on filtrera doit être un
**champ**, jamais du texte dans une phrase. `"ms": 88` se compare ; « a pris
88ms » se cherche.

### Question 2 — « que s'est-il passé pour CETTE requête, dans les trois services ? »

L'objection habituelle est raisonnable : les horodatages sont précis à la
milliseconde, on peut recoller par proximité temporelle. Mesure sur 200 requêtes
traversant trois services, en faisant varier la concurrence :

```
 1 requête simultanée   : par proximité temporelle 200/200 · par identifiant 200/200
 5 requêtes simultanées : par proximité temporelle   1/200 · par identifiant 200/200
20 requêtes simultanées : par proximité temporelle   1/200 · par identifiant 200/200
```

Parfait sans concurrence — ce qui est la situation d'un poste de développement,
et donc la raison pour laquelle la méthode survit. Inutilisable dès cinq requêtes
simultanées, c'est-à-dire dès le plus petit trafic réel.

Le pire n'est pas l'échec : c'est qu'il est **silencieux**. La méthode ne dit
jamais « je ne sais pas ». Elle rend une reconstitution plausible, avec des
services dans le bon ordre et des durées cohérentes, composée de morceaux de
requêtes différentes. On analyse une requête qui n'a jamais existé.

**Conséquence pour la conception :** un identifiant de corrélation, généré **une
fois** à la frontière d'entrée et propagé dans un en-tête. Deux erreurs
l'annulent : chaque service génère le sien (il y en a trois, ils ne relient
rien), ou un service oublie de propager (la chaîne se coupe exactement là).

### Question 3 — « ce défaut rare, l'ai-je enregistré ? »

Tout conserver coûte cher, donc on échantillonne. Ce que l'échantillonnage
uniforme retire est calculable :

```
taux  10 % · défaut survenu  1 fois -> capturé au moins une fois :  10,0 %
taux  10 % · défaut survenu 50 fois -> capturé au moins une fois :  99,5 %
taux   1 % · défaut survenu  5 fois -> capturé au moins une fois :   4,9 %
taux   1 % · défaut survenu 50 fois -> capturé au moins une fois :  39,5 %
```

À 1 %, un défaut survenu cinquante fois est manqué six fois sur dix. Or ce qu'on
veut absolument garder — les erreurs, les requêtes lentes — est exactement ce qui
est rare, donc ce que l'échantillonnage uniforme supprime en priorité.

**Conséquence pour la conception :** on échantillonne **le succès, pas l'échec**.
Cent pour cent des erreurs et des requêtes lentes ; 1 % ou moins des requêtes
rapides et réussies, qui sont nombreuses et se ressemblent. Cette décision se
prend avant l'incident : pendant, la trace cherchée n'a simplement jamais été
écrite.

### Ce que ces trois questions imposent, ensemble

Un journal utile n'est pas « un journal en JSON ». C'est un journal qui porte,
sur **chaque ligne** :

- l'**horodatage** en temps universel, avec les millisecondes ;
- le **niveau**, choisi pour vouloir dire quelque chose (voir plus bas) ;
- l'**identifiant de corrélation**, sans lequel les deux tiers des questions
  n'ont pas de réponse ;
- le **service** et sa **version**, sans quoi « depuis quel déploiement ? » est
  sans réponse ;
- les **valeurs sur lesquelles on filtrera**, chacune dans son champ ;
- **rien de secret ni de personnel** — un journal est conservé longtemps, copié
  chez un agrégateur, et lu par plus de monde que la base de données.

Sur les niveaux, une convention qui évite le débat : `error` signifie « quelqu'un
doit regarder », `warn` « ça a dégradé mais on a continué », `info` « un événement
métier a eu lieu », `debug` « pour comprendre le code ». Le test qui les
départage : si personne ne regarde jamais tes `error`, ce ne sont pas des
erreurs — c'est du bruit qui a usurpé le niveau, et il rendra les vraies erreurs
invisibles.

## 🤖 Exemple appliqué (IA / data / architecture)
Dans DocSense, chaque question loggue : requestId, question (si non sensible), chunks retenus (ids), tokens entrée/sortie, coût, latence par étage, verdict de validation. Résultat : « pourquoi cette réponse étrange hier à 15 h ? » se répond en rejouant les logs — c'est aussi la matière première du dashboard qualité.

## ⚠️ Erreurs fréquentes
- Logs texte libre non interrogeables.
- Pas de correlation id → impossible de suivre une requête.
- Logger des secrets ou des données personnelles.
- Tout en `info` (bruit) ou rien du tout (silence).

## 🚫 Anti-patterns
- Le `console.log("ici 2")` de debug laissé en prod.
- Logger tellement que plus personne ne lit (bruit = cécité).

## ✍️ Mini-exercice
Sans relire : cite une question à laquelle un journal texte répond juste, et une
à laquelle il répond faux — sur le même journal.

## 🔥 Pratique — rendre une API réellement interrogeable

**A. Poser la corrélation.** Sur une de tes API, génère un identifiant au premier
intergiciel, porte-le sur l'objet requête, et inclus-le dans chaque ligne de
journal, y compris celles émises depuis les couches profondes. Livrable : la
reconstitution complète d'une requête par un seul filtre sur l'identifiant.

**B. Mesurer avant d'optimiser.** Ajoute la durée mesurée à la fin de la réponse,
puis expose un point d'entrée qui publie, par route : le nombre de requêtes, le
nombre d'erreurs, et les **centiles** 50, 95 et 99 de la latence — le centile 95 est la valeur
en dessous de laquelle tombent 95 % des mesures. Livrable : la
sortie, et la route la plus lente identifiée par un chiffre.

**C. Prouver que la moyenne ment.** Sur les mêmes données, compare la latence
moyenne et le centile 95. Fabrique un jeu où la moyenne est excellente et où le
centile 95 est mauvais. Livrable : les deux nombres, et le nombre d'utilisateurs
concernés par le centile 95 sur ton volume réel.

**D. Interdire la fuite.** Écris un test qui parcourt un échantillon de tes
journaux et échoue s'il y trouve un motif de secret ou de donnée personnelle
(`authorization`, `token`, une adresse électronique, un numéro de carte).
Livrable : le test, et son résultat sur tes journaux actuels.

**Critère de réussite, et il vient avant le résultat : commence par faire échouer
ton test.** Écris volontairement une ligne de journal contenant un jeton, lance le
test, et vérifie qu'il **échoue**. Alors seulement lance-le sur tes vrais
journaux. Un test de fuite qui n'a jamais échoué ne prouve rien — il peut très
bien ne rien chercher du tout, à cause d'une expression régulière fausse ou d'un
chemin de fichier qui ne pointe nulle part, et il te donnera un feu vert
rassurant tous les jours jusqu'à l'incident.

**E. Décider ton échantillonnage.** À partir de ton volume et de ton taux
d'erreur, calcule ce que trois taux uniformes te feraient perdre sur un défaut
touchant une requête sur mille. Écris la règle que tu retiens.

## ✅ Correction attendue

**A — la corrélation.** Le point qui départage : l'identifiant doit être
accessible **depuis les couches profondes** sans être passé en argument à chaque
fonction. Passer `requestId` de main en main à travers dix appels est possible et
ingérable ; en pratique on utilise un stockage de contexte lié à la requête
(`AsyncLocalStorage` en Node) que la fonction de journalisation consulte
elle-même. Une réponse qui journalise correctement dans l'intergiciel mais pas
dans la couche d'accès aux données n'a pas résolu le problème : les lignes qui
manqueront pendant l'incident sont précisément les profondes.

La vérification honnête n'est pas « mes journaux contiennent un identifiant » :
c'est **« puis-je reconstituer une requête complète avec un seul filtre ? »**.
Fais-le sur une requête qui a échoué, pas sur une qui a réussi.

**B — les centiles.** La forme attendue expose au moins trois compteurs par route
et trois centiles. Le piège fréquent : calculer les centiles sur une fenêtre
glissante mal définie, ou les moyenner entre instances — **un centile ne
s'additionne pas et ne se moyenne pas**. La moyenne de deux centiles 95 n'est pas
le centile 95 de l'ensemble. Il faut agréger les observations (ou des histogrammes)
et calculer le centile ensuite.

**C — ce que la moyenne cache.** Un jeu qui répond à l'énoncé : 94 % des requêtes
à 50 ms, 6 % à 3 000 ms. Moyenne : **227 ms**, ce qui paraît correct. Centile
95 : **3 000 ms**. Et la conversion qui rend le chiffre parlant : sur un million
de requêtes par jour, **soixante mille personnes attendent trois secondes**.
C'est le calcul à savoir faire en entretien comme en réunion — un centile est un
pourcentage, un nombre d'utilisateurs est un argument.

**Le choix de 6 % n'est pas cosmétique, et c'est le vrai piège de cet exercice.**
Reprends exactement le même jeu avec **5 %** de requêtes lentes : la moyenne
descend à 197 ms, et le centile 95 vaut **50 ms**. Il devient excellent. Pourtant
cinquante mille personnes attendent toujours trois secondes — le centile 95 est
posé *pile* à la frontière du groupe lent, et il ne voit rien au-delà de
lui-même. Seul le p99 les montre.

Retiens la règle plutôt que les nombres : **un centile choisi ne dit rien de ce
qui se passe au-delà de lui.** Un p95 vert ne signifie pas que la queue est
saine ; il signifie que la queue commence après 95 %. C'est exactement pourquoi
on en regarde plusieurs, et pourquoi le point B te demandait p50, p95 **et** p99.

Corollaire : le centile 99 concerne souvent les utilisateurs les plus actifs, qui
font le plus de requêtes et ont donc la plus forte probabilité d'en rencontrer
une lente. Le centile 99 n'est pas « 1 % des gens » : c'est « 1 % des requêtes »,
et ces deux quantités ne se ressemblent pas.

**D — la fuite.** Attends-toi à trouver quelque chose. Les sources habituelles :
un objet journalisé en entier (`log(req.body)`), un message d'erreur d'une
bibliothèque qui inclut la requête SQL avec ses paramètres, une pile d'exécution
contenant une valeur, un en-tête `Authorization` journalisé avec les autres.

Le test attendu échoue sur ces motifs. Et la conclusion à formuler : ce test
protège de l'erreur d'inattention, pas d'un adversaire. Il se double d'un
caviardage à l'émission, d'un contrôle côté agrégateur, et d'une durée de
conservation courte — parce qu'un journal, contrairement à une base, est copié
partout et supprimé nulle part.

**E — l'échantillonnage.** La règle attendue conserve 100 % des erreurs et des
requêtes lentes, et descend fortement sur le reste. Le point technique : la
décision se prend à l'entrée, avant de savoir si la requête échouera. Il faut
donc soit garder les lignes en mémoire tampon et décider à la fin, soit propager
la décision aux services suivants — sans quoi on obtient des enregistrements à
trous, où un service a gardé sa ligne et son voisin non. C'est pire qu'une
absence, parce que ça a l'air complet.

## 🎤 Questions d'entretien
- « Logs, métriques, traces : quelle différence ? » → Événements / agrégats / parcours d'une requête.
- « Qu'est-ce qu'un correlation id ? » → Un id unique par requête, propagé partout, qui relie tous ses logs.
- « Que ne faut-il jamais logger ? » → Secrets, tokens, données personnelles.

## 🧾 À retenir
- Logs structurés JSON + niveaux + correlation id = sessions rejouables.
- Les métriques agrègent ; les logs détaillent ; les traces relient.
- Jamais de secrets/PII dans les logs.

## 📚 Vocabulaire
**log structuré** · **niveau (debug/info/warn/error)** · **correlation id** · **métrique / p95** · **trace** · **rétention** · **PII**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Mes APIs loggent en JSON avec correlation id.
- [ ] Je peux reconstituer une session complète depuis les logs.
- [ ] Aucun secret/PII dans mes logs (vérifié).

## 🔗 Liens avec le programme
Mois 10-12 (jours ~280, 300-330), projet final. Leçons liées : `monitoring-production`, `llm-observability`, `architecture-basics`.
