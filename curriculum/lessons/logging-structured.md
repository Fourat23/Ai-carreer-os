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

## 🛠 Exemple guidé — d'un `print` à un log exploitable
Avant : `print("login échoué pour " + email)` → non filtrable, et **fuite l'email**.
Après (structuré, sans secret) :
```json
{ "ts": "2026-05-01T10:00:00Z", "level": "warn", "msg": "login_failed",
  "userId": 42, "reason": "bad_password", "requestId": "req-9f3a" }
```
On peut maintenant : compter les `login_failed` par heure (détecter une attaque),
filtrer par `requestId` pour voir toute la requête, et on n'a divulgué ni email ni
mot de passe.

## 🧪 Mise en pratique
Voir la pratique associée : repérer un secret qui fuite dans des logs et le masquer,
distinguer les niveaux.

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
