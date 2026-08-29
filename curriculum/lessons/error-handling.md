<!-- keep -->
# Leçon — Gestion d'erreurs

## 🌍 Le problème d'abord
Ton programme marche… tant que tout se passe bien. Mais un fichier peut être absent, une API
peut ne pas répondre, l'utilisateur peut envoyer n'importe quoi. Le débutant traite ces cas
« quand ça arrivera » — et ça arrive toujours, en production, au pire moment : l'application
plante avec un message cryptique, ou pire, elle continue en silence avec des données
corrompues. Bien gérer les erreurs, ce n'est pas semer des `try/catch` au hasard : c'est
DÉCIDER À L'AVANCE, pour chaque chose qui peut mal tourner, qui répond quoi. Cette leçon
t'apprend à concevoir la gestion d'erreurs comme une architecture, pour que ton système reste
vivable quand le monde réel le maltraite.

## 🎯 Objectif
Concevoir la gestion d'erreurs comme une ARCHITECTURE, pas des try/catch éparpillés : distinguer erreurs attendues et bugs, centraliser, ne jamais crasher ni fuiter, et dégrader gracieusement quand une dépendance (base, LLM) échoue. C'est ce qui rend un système vivable en production.

## 🧠 Modèle mental
Une erreur est **un message, pas une catastrophe** : quelque chose dit « je ne peux pas faire ce que tu demandes, voilà pourquoi ». Ton travail : décider QUI répond QUOI à chaque message possible — à l'avance, pas dans la panique.

## 🧩 Prérequis
Tu dois savoir écrire des fonctions et manipuler `try/catch` en JavaScript, y compris
l'asynchrone (`/doc/lessons/javascript-basics`, `/doc/lessons/async-javascript`), car les
erreurs surgissent surtout aux frontières et dans les opérations asynchrones. Une notion des
codes de statut HTTP aide pour la partie API (`/doc/lessons/http-rest-json`). La distinction
erreur attendue / bug est construite ici.

## 📖 Explication complète
- **Deux familles** : l'erreur **opérationnelle** (attendue : fichier absent, entrée invalide, API distante en panne, ressource inexistante) se GÈRE — on informe, on réessaie, on dégrade. Le **bug** (inattendu : null déréférencé, invariant violé) se LOGGE en détail et on échoue proprement — le masquer, c'est corrompre en silence.
- **Traiter à la frontière, centraliser la réponse** : valider les entrées à l'entrée ; attraper au niveau qui SAIT quoi faire ; un gestionnaire central (middleware d'erreurs) formate les réponses — 400/404/409 informatifs pour l'opérationnel, 500 générique pour les bugs (les détails restent dans les logs, jamais chez le client : sécurité).
- **Les dépendances échouent** : le réseau, la base, l'API LLM tomberont. Prévoir : **timeout** (ne jamais attendre indéfiniment), **retry avec backoff** (uniquement sur les opérations idempotentes !), **fallback/dégradation** (mode réduit plutôt que page blanche), et le refus propre quand rien ne marche.
- **L'idempotence, parce que « retry seulement si c'est idempotent » ne sert à rien tant qu'on ne sait pas le décider.** Une opération est idempotente si l'exécuter deux fois donne le même résultat que l'exécuter une fois. `GET /livres/42` : idempotent. `PUT /livres/42 {titre}` : idempotent, il écrit un état voulu. `POST /paiements {montant: 50}` : **pas** idempotent — deux exécutions, deux débits. Or le cas qui fait mal n'est pas « l'appel a échoué », c'est « l'appel a RÉUSSI mais la réponse s'est perdue » : le serveur a débité, ton code n'a rien reçu, et ton retry débite une seconde fois. La parade se construit : le client génère une **clé d'idempotence** (un identifiant unique par intention de paiement), l'envoie avec la requête, et le serveur, s'il a déjà traité cette clé, renvoie le résultat d'origine au lieu de refaire l'opération. On ne « constate » pas l'idempotence, on la FABRIQUE.
- **Le circuit breaker : arrêter d'insister.** Le retry aide quand un service hoquette. Il aggrave tout quand un service est réellement tombé — chacun de tes clients réessaie, tu multiplies la charge sur un service à genoux et tu l'empêches de se relever. Le disjoncteur compte les échecs récents ; au-delà d'un seuil il **s'ouvre** et refuse immédiatement les appels suivants sans même les tenter, pendant un délai. Puis il laisse passer un appel d'essai : s'il réussit, il se referme ; sinon il repart pour un tour. Le gain est double — le service en panne obtient le répit dont il a besoin, et ton application répond en quelques millisecondes au lieu d'accumuler des requêtes bloquées jusqu'à saturer sa propre mémoire. Retry et disjoncteur ne sont pas concurrents : le premier absorbe les à-coups, le second reconnaît une panne installée.
- **Les erreurs font partie du contrat** : une fonction documente ce qu'elle lance ; une API documente ses codes d'erreur ; un CLI sort avec un code non nul et un message utile.
- L'anti-règle absolue : le `catch` vide. Avaler une erreur, c'est transformer un signal en bombe à retardement. C'est la version défensive du même réflexe qu'au jour 41 sur le débogage : un symptôme qu'on fait taire est un diagnostic qu'on s'interdit.

## 🔧 Exemple simple
```js
try {
  data = JSON.parse(fs.readFileSync(PATH, "utf8"));
} catch (err) {
  if (err.code === "ENOENT") data = [];   // attendu : premier lancement
  else throw err;                          // bug ou corruption : on ne masque pas
}
```

## 🧭 Exemple guidé

Voici la fonction que tout le monde écrit pour appeler un service externe — un LLM, ici. Elle
est raisonnable : timeout, retry borné, backoff exponentiel, dégradation. Elle contient
pourtant une erreur de conception qui ne se voit qu'en panne.

```js
async function appelRobuste(prompt) {
  for (let essai = 1; essai <= 3; essai++) {
    try {
      return await avecTimeout(llm(prompt), 30_000);
    } catch (err) {
      if (!estTransitoire(err) || essai === 3) break;   // 429/503 → retry, 401 → non
      await attendre(1000 * 2 ** essai);                // backoff exponentiel
    }
  }
  return { degrade: true, message: "Service IA indisponible, réessayez." };
}
```

**Fais-la tourner mentalement sur quatre pannes différentes**, en additionnant les durées.
C'est l'exercice que presque personne ne fait, et c'est lui qui révèle tout.

| Ce qui se passe côté service | Ce que fait la fonction | Temps total |
|---|---|---|
| Clé d'API invalide (401) | abandonne au 1er essai | **0,1 s** |
| Hoquet : refuse une fois, puis répond en 2 s | réessaie, réussit | **4,0 s** |
| Saturé, refuse vite (503 × 3) | 3 essais + attentes | **6,2 s** |
| Ne répond plus du tout | 3 timeouts + attentes | **96 s** |

La deuxième ligne est la raison d'être du retry : le hoquet est absorbé, l'utilisateur n'a
rien vu. La dernière ligne est le problème. **96 secondes**, pour une fonction dont le
timeout affiché est de 30. Personne n'a écrit 96 nulle part : c'est
30 + 2 + 30 + 4 + 30, et ça n'apparaît qu'en additionnant.

**Première décision : de quel budget parle-t-on ?** Le `30_000` du code est un budget *par
tentative*. Or ce qui compte n'appartient pas à cette fonction — c'est le temps que
l'appelant peut attendre. Si c'est une requête HTTP dont le client abandonne à 30 s, alors
dès la deuxième tentative la fonction travaille pour personne : elle occupe une connexion,
tient de la mémoire, et produira une réponse que plus rien n'attend. Le retry est devenu du
gaspillage pur. La règle à retenir se formule dans l'autre sens : **on ne fixe pas un délai
par essai, on reçoit un budget total et on le dépense.** Concrètement, la fonction prend une
échéance en paramètre, la compare avant chaque tentative, et renvoie la réponse dégradée dès
qu'il ne reste pas de quoi tenter honnêtement.

**Deuxième décision : « transitoire » suffit-il à décider ?** `estTransitoire` met 429 et 503
dans le même sac, et c'est trop grossier. Un `503` veut dire « je suis tombé, reviens
plus tard » — le backoff aveugle est correct. Un `429` veut dire « tu vas trop vite », et il
s'accompagne très souvent d'un en-tête `Retry-After` qui indique **combien de temps**
attendre. Ignorer cette valeur pour appliquer son propre backoff, c'est répondre à une
information précise par une devinette — et généralement revenir trop tôt, donc reprendre un
429. Quand le service te dit quoi faire, obéis-lui plutôt que de recalculer.

**Troisième décision, la moins intuitive : faut-il réessayer du tout ?** Compte les requêtes,
pas les secondes. Chaque appel client génère 3 requêtes vers le service. Avec 200 utilisateurs
simultanés, tu envoies **600 requêtes** à un service qui est déjà à terre. Ton mécanisme de
robustesse est devenu, du point de vue du service en panne, une attaque par déni de service
— et il l'empêche de redémarrer. C'est exactement ce que résout le disjoncteur décrit plus
haut : après N échecs il s'ouvre, et les appels suivants échouent en quelques millisecondes
sans même partir. Retry et disjoncteur répondent à deux questions différentes — *cet appel-ci
peut-il réussir en réessayant ?* et *ce service est-il encore là ?* — et il faut les deux.

**Comment vérifier que tu as raison.** Ne teste pas l'échec, teste le *temps* de l'échec.
Un faux service qui ne répond jamais, un chronomètre autour de `appelRobuste`, et une
assertion : la durée doit rester sous le budget annoncé. Ce test échoue sur la version
ci-dessus, et c'est ce qui prouve que le défaut est réel plutôt que théorique. Un second test
mesure le nombre d'appels reçus par le faux service quand vingt appels partent en parallèle :
c'est celui qui vérifie le disjoncteur.

**Variante qui déplace le problème.** Remplace le LLM par un `POST /paiements`. Tout ce qui
précède reste vrai, mais un cas nouveau apparaît et il est plus grave : le timeout ne dit pas
si l'opération a eu lieu. Un service qui ne répond pas dans les 30 s peut très bien avoir
débité le client à la 31ᵉ. Réessayer, c'est risquer un double débit ; ne pas réessayer,
c'est risquer de perdre un paiement réussi. Aucune des deux options n'est bonne — parce que
la question n'est plus « faut-il réessayer ? » mais « comment rendre le second essai
inoffensif ? ». C'est là que la clé d'idempotence cesse d'être une bonne pratique abstraite :
elle est la seule chose qui permet de réessayer sans choisir entre deux dégâts.

## 🤖 Exemple appliqué (IA / data / architecture)
DocSense doit survivre à : LLM down (réponse dégradée), document corrompu (ingestion qui signale et continue), sortie non parsable (retry puis refus propre), question vide (400 clair). La liste des 10 scénarios d'erreur testés un par un est un critère de qualité du projet final.

## ⚠️ Erreurs fréquentes
- `catch {}` vide (le pire anti-pattern du métier).
- Retry sur une opération NON idempotente (double paiement).
- Stack trace renvoyée au client (fuite d'infos internes).
- Tout traiter au même endroit, ou nulle part.

## 🚫 Anti-patterns
- « Ça n'arrivera jamais » (ça arrivera).
- Codes d'erreur maison incohérents d'un endpoint à l'autre.

## ✍️ Mini-exercice
Liste les 5 erreurs possibles d'une de tes routes API et, pour chacune : attendue ou bug ? qui répond quoi, avec quel statut ?

## 🔥 Exercice plus difficile
Implémente `appelRobuste` pour de vrai (timeout + retry idempotent + fallback), et prouve chaque branche par un test (mock qui échoue N fois, qui traîne, qui échoue durablement).

## ✅ Correction attendue
La logique : classer (attendu/bug) → traiter au bon niveau → centraliser la réponse → prévoir la panne des dépendances. Vérifie : aucun catch vide, aucun détail interne chez le client, retry borné et idempotent, un mode dégradé UTILISABLE, et chaque scénario d'erreur testé.

## 🎤 Questions d'entretien
- « Erreur opérationnelle vs bug ? » → L'attendue se gère (400/404/retry) ; le bug se logge et échoue proprement (500 générique).
- « Quand peux-tu retry ? » → Erreur transitoire ET opération idempotente, avec backoff et borne.
- « Que renvoies-tu au client sur un bug ? » → Un 500 générique ; les détails vont dans les logs.

## 🧾 À retenir
- Classer : attendu (gérer) vs bug (logger + échouer proprement).
- Timeout partout, retry borné sur l'idempotent, dégradation gracieuse.
- Jamais de catch vide, jamais de détails internes au client.

## 📚 Vocabulaire
**erreur opérationnelle** · **timeout** · **retry / backoff exponentiel** · **idempotence** · **fallback / dégradation gracieuse** · **circuit breaker** · **fail fast** · **contrat d'erreur**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je classe chaque erreur (attendue/bug) et je sais qui répond quoi.
- [ ] Mes appels externes ont timeout, retry borné, fallback.
- [ ] Aucun catch vide ni fuite de détails internes dans mon code.

## 🔗 Liens avec le programme
Mois 3 (API robuste), mois 8 (appels LLM), mois 11-12 (DocSense). Leçons liées : `observability-logging`, `structured-outputs-tools`, `testing-foundations`.
