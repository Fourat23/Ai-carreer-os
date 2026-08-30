<!-- keep -->
# Leçon — Logs structurés et correlation ID

## 🌍 Le problème d'abord
Sur ta machine, tu mets un `print("ici ça marche")` et tu lis la console. En
production, il y a des milliers de requêtes mélangées, sur plusieurs machines, et
tes `print("erreur !")` deviennent inutiles : impossible de savoir QUELLE requête,
de QUEL utilisateur, a produit CETTE ligne, ni de relier les événements d'une même
requête éparpillés dans le flot. Il faut donc écrire les logs autrement : non plus
des phrases pour un humain qui regarde en direct, mais des **données** qu'une machine
peut filtrer, et un **fil** qui relie toutes les lignes d'une même requête. Cette
leçon transforme le `print` en outil de diagnostic de production.

## 🎯 Objectif
Savoir écrire des **logs structurés** (données clé/valeur plutôt que texte libre),
utiliser les **niveaux** de log à bon escient, et relier les événements d'une même
requête avec un **correlation ID** — sans jamais logger de secret.

## 🧩 Prérequis
Tu dois comprendre ce qu'est l'**observabilité** et le rôle des logs parmi les trois
piliers (`/doc/lessons/observability-fundamentals`), et savoir ce qu'est une
**requête** traitée par un service. Aucune bibliothèque de logging particulière n'est
supposée.

## 🧠 Modèle mental
Un log en texte libre (`"user 42 a échoué"`) est une phrase : agréable à lire, mais
pénible à FILTRER quand il y en a des millions. Un log **structuré** est une petite
fiche : `{ niveau: "error", userId: 42, action: "login", raison: "mdp" }`. On peut
alors demander à la machine « montre-moi tous les logs `error` de l'action `login` »
— ce qui est impossible avec des phrases. Penser « fiche de données », pas « phrase ».

## 📖 Explication progressive
**Niveaux de log.** Chaque message porte un niveau de gravité : `debug` (détail de
mise au point), `info` (événement normal notable), `warn` (anormal mais non
bloquant), `error` (échec d'une opération). Le niveau permet de FILTRER : en
production on garde souvent `info` et au-dessus, en investigation on descend à
`debug`. Erreur classique : tout mettre en `error` (plus rien ne ressort) ou tout en
`info` (on rate les vrais problèmes).

**Log structuré.** Au lieu d'une phrase, on émet des champs : horodatage, niveau,
message court, et des **attributs** (userId, endpoint, durée, code d'erreur). Un
système central peut alors indexer, filtrer, agréger. C'est ce qui rend les logs
exploitables à grande échelle.

**Correlation ID (request ID).** Une seule requête utilisateur peut produire 20
lignes de log, éparpillées et mélangées à celles des autres requêtes. On attribue à
chaque requête un **identifiant unique** (correlation ID) qu'on ajoute à CHAQUE log
de cette requête, et qu'on **propage** aux services appelés. Résultat : on filtre par
cet ID et on reconstitue toute l'histoire d'une requête, même à travers plusieurs
services. C'est le fil d'Ariane du diagnostic.

**Ne jamais logger de secret.** Mots de passe, jetons, numéros de carte, données
personnelles : jamais dans les logs (ils sont stockés, indexés, souvent largement
accessibles). On masque ou on omet. Une fuite par les logs est une fuite réelle.

## 🔎 Décomposition
- niveau = à quel point c'est grave / faut-il agir.
- message = quoi, en une ligne stable.
- attributs = le contexte filtrable (qui, où, combien de temps).
- correlation ID = le fil qui relie les lignes d'une même requête.

## 🛠 Exemple guidé — le journal texte donne souvent la bonne réponse, et c'est le problème

L'argument habituel pour le journal structuré est « c'est plus facile à
requêter ». C'est vrai et c'est faible : on peut toujours écrire une expression
régulière. L'argument fort est ailleurs, et il se mesure. Le script
`scripts/v70-verifications/journaux-et-correlation.mjs` fabrique **la même
réalité** — 5 000 événements — sous deux formes, puis pose deux questions.
Il utilise une graine fixe : les chiffres ci-dessous sont reproductibles à
l'identique.

**La forme texte**, celle qu'on écrit naturellement parce qu'elle se lit :

```
2026-03-14T09:00:00.037Z [INFO] cli-1204 /panier 88ms - requete servie
```

**La forme structurée**, un objet par ligne :

```json
{"ts":"2026-03-14T09:00:00.037Z","niveau":"info","client":"cli-1204",
 "route":"/panier","ms":88,"message":"requete servie"}
```

Une précision qui décide de tout : un tiers des erreurs porte un motif renvoyé
par la banque, **qui contient un retour à la ligne**. Ce n'est pas un cas
tordu — un message d'un fournisseur, une adresse saisie par un client, une pile
d'exécution en contiennent tous.

### Première question : « combien d'erreurs sur /paiement ont dépassé 300 ms ? »

```
réponse vraie     : 9
réponse via JSON  : 9   (lignes illisibles :  0)
réponse via texte : 9   (lignes illisibles : 24)
```

Le journal texte donne **la bonne réponse**. Il a pourtant rejeté silencieusement
24 lignes : les lignes de continuation des messages multilignes, qui n'ont ni
horodatage ni niveau et que l'expression régulière refuse. Elles n'ont pas
faussé ce décompte parce que la première ligne de chaque événement portait déjà
les champs interrogés.

Retiens ce moment. **C'est exactement ce qui rend le format texte dangereux :
il donne souvent la bonne réponse, donc on lui fait confiance.** Aucune erreur,
aucun avertissement, un total juste.

### Deuxième question : « combien d'erreurs ont pour motif un refus de la banque ? »

```
réponse vraie     : 58
réponse via JSON  : 58
réponse via texte : 37   (écart : −21)
```

Trente-six pour cent de sous-estimation. Le motif se trouve sur la ligne de
continuation pour un tiers des erreurs ; cette ligne est rejetée ; ces erreurs
deviennent invisibles. Le rapport transmis à l'équipe métier annonce 37 refus
bancaires là où il y en a 58, **et rien dans la sortie ne l'indique**.

Même journal, même défaut de parsage, deux questions : la première juste, la
seconde fausse. **La fiabilité du format texte dépend de la question posée** —
ce qui revient à dire qu'on ne peut pas s'y fier, puisqu'on ne connaît pas
d'avance les questions qu'on posera pendant un incident.

Le mécanisme est simple à énoncer : en texte, la structure est **devinée à la
lecture** par une expression régulière écrite après coup ; en JSON, elle est
**écrite à l'émission** par celui qui connaît les données. Le retour à la ligne
est échappé dans le champ, un événement reste une ligne quoi que contienne le
message.

### Ce que ça coûte

```
texte : 358,3 Kio
JSON  : 612,3 Kio  (×1,71)
```

Soixante et onze pour cent de plus. C'est un vrai coût — stockage, réseau,
facture d'agrégateur — et il faut le dire plutôt que de le passer sous silence.
La contrepartie est ce qui précède : une requête au lieu d'une expression
régulière, et aucune ligne perdue en silence. Sur un journal compressé, l'écart
se réduit fortement (les clés se répètent, donc se compressent bien), mais on ne
publiera pas ici de chiffre de compression qui n'a pas été mesuré.

### Passer d'un affichage à un journal — la démarche

1. **Un événement, une ligne, un objet.** La règle qui décide en cas de doute.
2. **Les champs d'identification d'abord** : horodatage en temps universel,
   niveau, service, version, identifiant de corrélation.
3. **Ce sur quoi on filtrera devient un champ**, pas du texte dans un message.
   `"ms": 88` et non `"a pris 88ms"` : un nombre se compare, une chaîne non.
4. **Le message reste pour l'humain.** Il ne doit jamais être la seule source
   d'une information dont on aura besoin — la deuxième question ci-dessus est
   précisément ce qui arrive quand il l'est.
5. **Rien de secret dans un champ.** Les journaux sont conservés longtemps,
   copiés chez un agrégateur, et lus par plus de gens que la base de données.

## 🧪 Mise en pratique — convertir, puis prouver que c'était nécessaire

**A. Reproduire l'écart.** Prends 2 000 lignes de journal d'un de tes projets
(ou fabrique-les). Écris l'expression régulière qui les parse, puis compte
combien de lignes elle rejette. Livrable : le nombre de lignes rejetées, et ce
qu'elles contenaient.

**B. Trouver ta question qui casse.** Pose à ton journal texte deux questions :
une qui ne porte que sur les champs de la première ligne, une qui porte sur le
contenu du message. Compare chaque réponse à la vérité calculée sur les objets.
Livrable : les deux écarts.

**C. Convertir.** Remplace tes appels d'affichage par un journal structuré, avec
les cinq champs d'identification. Refais A et B. Livrable : le nouveau nombre de
lignes rejetées et les nouveaux écarts.

**D. Mesurer le coût.** Compare la taille des deux journaux, brute puis
compressée (`gzip -9`). Livrable : les quatre tailles et les deux rapports.

**E. Interdire la fuite.** Écris une fonction de journalisation qui refuse
d'émettre un champ dont le nom figure dans une liste (`mot_de_passe`, `token`,
`authorization`, `carte`). Vérifie par un test qu'un appel contenant ce champ
est bien caviardé, et regarde ce qui se passe si le secret est **dans le
message** plutôt que dans un champ.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Ce log est-il structuré ? `{"level":"error","msg":"login échoué pour jean@ex.com"}`
2. Tu veux compter les échecs de connexion par heure. Quelle requête poses-tu sur les
   logs de la question 1 ? Et sur ceux de l'exemple guidé ?
3. Une requête HTTP produit sept lignes de log réparties sur trois services. Que
   faut-il pour les retrouver toutes ensemble, et qui doit le poser ?
4. Ton équipe décide de tout passer en `debug` en production « pour mieux voir ». Que
   se passe-t-il, en trois effets distincts ?

## ✅ Correction attendue

**La démarche.** Un log structuré n'est pas un log en JSON. C'est un log dont **chaque
information exploitable est un champ**. Le format est le contenant ; la question est
ce qu'on met dedans.

**L'erreur probable, et elle passe toutes les revues de code.** On remplace
`print("login échoué pour " + email)` par :

```json
{ "level": "error", "msg": "login échoué pour jean@ex.com" }
```

C'est du JSON. Le linter est content, l'agrégateur l'ingère, la tâche est cochée. Et
**rien n'a été gagné** : l'identité de l'utilisateur et la raison de l'échec sont
toujours enfermées dans une phrase. Pour compter les échecs par heure il faut faire
une recherche de sous-chaîne sur `msg` — exactement ce qu'on voulait éviter. Pire,
l'email est toujours là : la fuite de données personnelles n'a pas bougé d'un
caractère, elle est simplement mieux formatée.

Le piège séduit parce que **la migration vers JSON ressemble au travail**. C'est
visible, mécanisable, et ça produit un diff satisfaisant. Structurer le contenu
demande de décider *quels champs existent*, ce qui est une décision de conception et
non une conversion de format.

Le repère : `msg` doit être une **constante**, un identifiant d'événement
(`"login_failed"`), jamais une phrase construite. Tout ce qui varie devient un champ.
Si ton `msg` contient une concaténation, ton log n'est pas structuré.

**Sur les autres questions.** Le comptage par heure devient
`level=warn AND msg=login_failed`, groupé par heure — une agrégation, pas une
recherche textuelle. Les sept lignes se retrouvent grâce à un **correlation ID**
généré **à la frontière d'entrée** (le premier service qui reçoit la requête) et
propagé dans les en-têtes à chacun des suivants : si chaque service génère le sien, il
y en a trois, et ils ne relient rien. Et le passage en `debug` en production produit
trois effets distincts : le coût de stockage et d'ingestion explose, les requêtes de
recherche ralentissent pour tout le monde, et l'information utile devient
statistiquement introuvable — le troisième étant le plus grave et le moins visible sur
une facture.

**Alternative défendable.** En développement local, le texte lisible reste supérieur :
personne n'agrège ses propres logs. Beaucoup d'équipes configurent donc **deux
formats** — lisible en local, structuré en production — à partir du même appel de
code. Ce n'est pas une compromission, c'est reconnaître que les deux publics sont
différents : un humain qui lit une ligne, une machine qui en filtre un million.

**Vérifie seul, sans corrigé** :
1. Prends dix lignes de tes logs. Combien ont un `msg` contenant une valeur variable ?
   Ce nombre est ta dette.
2. Cherche `password`, `token`, `authorization`, `@` dans tes logs. Si tu trouves
   quelque chose, c'est déjà écrit sur disque et probablement répliqué.
3. Prends une requête au hasard et essaie d'en reconstituer le parcours complet. Si tu
   n'y arrives pas, il manque le correlation ID, pas des logs.

### Sur la mise en pratique A → E

**A — les lignes rejetées.** Presque personne n'obtient zéro. Les rejets viennent
toujours des mêmes sources : les messages multilignes (piles d'exécution,
retours de fournisseurs, saisies utilisateur), les lignes émises par une
bibliothèque tierce qui n'a pas ton format, et les lignes tronquées par une
rotation de fichier. Le chiffre à retenir n'est pas le nombre : c'est le fait que
**rien ne t'a averti**. Une expression régulière qui ne concorde pas renvoie
`null`, et `null` ne lève pas d'exception.

**B — les deux écarts.** Le résultat attendu est asymétrique, comme dans la
mesure de la section guidée : 0 sur la première question, franchement négatif sur
la seconde. Si tes deux écarts sont nuls, cherche une question qui porte sur ce
qui est *dans* le message — c'est là que le format texte perd l'information, pas
sur les champs de tête.

Ce qu'il faut savoir formuler : le défaut n'est pas « l'expression régulière est
mauvaise ». Une meilleure expression régulière recollerait les lignes de
continuation… au prix d'une heuristique (« une ligne sans horodatage appartient à
la précédente ») qui sera fausse le jour où une ligne commence par une date.
**Le format texte oblige à deviner une structure ; toute règle de devinette a un
contre-exemple.**

**C — après conversion.** Zéro ligne rejetée et zéro écart, sur les deux
questions. Si tu obtiens encore un écart, c'est probablement le piège décrit plus
haut : tu as converti le *format* sans structurer le *contenu*, et l'information
est toujours dans une phrase.

**D — le coût.** L'ordre de grandeur mesuré en brut est ×1,7. Après compression,
l'écart se réduit nettement parce que les clés se répètent d'une ligne à l'autre
et se compressent très bien — mais publie **tes** chiffres, pas cette phrase :
c'est précisément le genre d'affirmation qu'il faut vérifier sur ses propres
données. Le bon réflexe est de rapporter le surcoût à ce qu'il achète, et de
constater qu'il est presque toujours inférieur au coût d'une heure de plus
passée à chercher pendant un incident.

**E — le caviardage.** La fonction attendue filtre par nom de champ :

```js
const INTERDITS = /^(mot_de_passe|token|authorization|carte|secret)$/i;
const assainir = (o) => Object.fromEntries(
  Object.entries(o).map(([k, v]) => [k, INTERDITS.test(k) ? '[caviardé]' : v]));
```

Et la seconde partie de l'exercice est celle qui compte : **si le secret est dans
le message, ce filtre ne le voit pas.** `logger.error(\`echec pour token=\${t}\`)`
passe intact. C'est la même leçon que dans la section guidée, appliquée à la
sécurité : une information enfermée dans une phrase échappe à tout traitement
automatique — au filtrage comme au comptage. Le caviardage par nom de champ ne
fonctionne que si la discipline « tout ce qui varie est un champ » est tenue.

Un complément qu'une bonne réponse mentionne : ce filtre protège de l'erreur
d'inattention, pas d'un adversaire. Il doit être doublé d'un contrôle côté
agrégateur et d'une durée de conservation courte, parce qu'un journal est copié
et conservé bien plus longtemps qu'une base de données.

## ⚠️ Erreurs fréquentes / anti-patterns
- **Texte libre** non filtrable à grande échelle.
- **Secrets dans les logs** (mot de passe, jeton, PII) — fuite réelle.
- Tout en `error` (bruit) ou tout en `debug` en production (volume, coût).
- Pas de **correlation ID** → impossible de relier les lignes d'une requête.
- Logger des objets énormes à chaque requête (coût, saturation).

## 🏢 Cas métier
Un incident : « certains paiements échouent ». Sans correlation ID, l'équipe ne
pouvait pas suivre une transaction à travers l'API, le service de paiement et la
base. Après ajout d'un `requestId` propagé partout, on filtre sur un paiement échoué
et on voit toute sa chaîne : le service de paiement renvoyait un timeout. Diagnostic
en minutes.

## 🚨 Que faire dans ce cas ? — « un secret a été trouvé dans les logs »
- **Limiter l'impact** : considérer le secret comme COMPROMIS (les logs sont
  largement accessibles/archivés).
- **Collecter** : depuis quand, où, quelle portée.
- **Corriger** : révoquer/rotationner le secret ; retirer/masquer le champ fautif
  dans le code de logging.
- **Prévenir** : liste de champs à masquer par défaut ; revue ; test qui échoue si un
  champ sensible apparaît dans un log.

## 🎤 Questions d'entretien
- « Pourquoi des logs structurés ? » → filtrables/agrégeables à grande échelle.
- « À quoi sert un correlation ID ? » → relier tous les logs d'une même requête, même
  à travers plusieurs services.
- « Que ne met-on jamais dans un log ? » → des secrets / données sensibles.

## ✅ À retenir
- Log structuré = données clé/valeur, pas une phrase.
- Niveaux (debug/info/warn/error) pour filtrer selon la gravité.
- Correlation ID propagé = fil d'Ariane d'une requête.
- Jamais de secret dans les logs.

## 📚 Vocabulaire
**log structuré** · **niveau de log (debug/info/warn/error)** · **attribut/champ** ·
**correlation ID / request ID** · **propagation** · **agrégation** · **masquage
(redaction)** · **PII**.

## 🎯 Pratique associée
Exercices : masquer un secret dans des logs ; raisonner les niveaux.

## 🔗 Liens avec le programme
Jour `/day/79` (observabilité). Leçons liées :
`/doc/lessons/observability-fundamentals`, `/doc/lessons/distributed-tracing`,
`/doc/lessons/observability-logging`. Les logs structurés alimentent les métriques et
se relient aux traces par le correlation ID.
