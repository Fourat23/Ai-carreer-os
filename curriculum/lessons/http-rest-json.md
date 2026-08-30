<!-- keep -->
# Leçon — HTTP, REST et JSON

## 🌍 Le problème d'abord
Tu cliques sur un lien, une appli mobile affiche ton profil, un chatbot te répond :
à chaque fois, un programme a DEMANDÉ quelque chose à un autre ordinateur (un
serveur), qui a RÉPONDU. Cette conversation suit des règles précises : c'est
**HTTP**. Le débutant voit surtout ses symptômes cryptiques — « erreur 404 », « 500 »,
« ça marche dans Postman mais pas dans mon code » — sans comprendre ce qui circule
vraiment. Cette leçon ouvre la boîte : comprendre la conversation demande→réponse, le
format des données échangées (**JSON**) et les conventions d'organisation (**REST**),
pour concevoir et déboguer n'importe quelle intégration.

## 🎯 Objectif
Comprendre **HTTP** (requête/réponse, méthodes, codes de statut, en-têtes), le style
**REST** (organiser une API autour de ressources) et le format **JSON** — de quoi
lire, concevoir et déboguer une API.

## 🧩 Prérequis
Tu dois avoir l'intuition de « client / serveur » (une machine DEMANDE, une autre
RÉPOND) et être à l'aise avec les objets/tableaux vus en JavaScript
(`/doc/lessons/javascript-basics`), car JSON en reprend la forme. Aucune connaissance
réseau préalable n'est nécessaire : les notions sont construites ici.

## 🧠 Modèle mental
HTTP est une conversation en deux temps : le client envoie une **requête** (une
méthode + une adresse + parfois des données), le serveur renvoie une **réponse** (un
**code de statut** + des données). Chaque échange est indépendant. JSON est juste la
façon d'écrire les données échangées (les mêmes objets/tableaux qu'en JS). REST est un
ensemble de conventions pour organiser ces échanges autour de « ressources ».

## 💡 Pourquoi c'est important
HTTP est la langue du web : chaque page, chaque API, chaque appel à un LLM est une requête HTTP. Comprendre ce qui circule VRAIMENT (et pas juste « ça marche dans Postman ») te permet de concevoir, débugger et sécuriser n'importe quelle intégration. « Que se passe-t-il quand tu tapes une URL ? » est la question d'entretien système la plus posée au monde.

## Explication complète

### Le modèle : requête → réponse, sans mémoire
HTTP est un protocole TEXTE, **sans état** : le client envoie une requête complète et autonome (méthode + URL + headers + corps éventuel), le serveur renvoie une réponse (statut + headers + corps), et OUBLIE tout. Chaque requête repart de zéro — c'est ce qui rend le web scalable (n'importe quel serveur peut répondre) et c'est pourquoi l'authentification doit être RÉPÉTÉE à chaque requête (le token dans un header).

### Sous le capot : le trajet complet
1. **DNS** : traduire `api.example.com` en adresse IP (un annuaire distribué, avec caches).
2. **TCP** : établir une connexion fiable (handshake en 3 temps).
3. **TLS** : chiffrer le canal (HTTPS = HTTP dans TLS) — confidentialité + intégrité + identité du serveur (certificats).
4. **HTTP** : enfin, la requête et la réponse.
Chaque étape coûte des allers-retours réseau : c'est la LATENCE (incompressible, liée à la distance), à distinguer de la bande passante (le débit).

### Les méthodes portent un sens
`GET` lit (JAMAIS de modification), `POST` crée, `PUT` remplace, `PATCH` modifie partiellement, `DELETE` supprime. GET/PUT/DELETE sont **idempotentes** : les rejouer ne change rien de plus — propriété cruciale pour les retries automatiques (un réseau instable rejoue sans risque une requête idempotente, jamais un POST).

### Les statuts : un langage à 3 chiffres
- **2xx** succès : 200 OK, 201 créé (avec l'objet créé), 204 sans contenu (après DELETE).
- **3xx** redirection.
- **4xx** faute du CLIENT : 400 requête invalide (avec les détails), 401 non authentifié, 403 authentifié mais interdit, 404 introuvable, 409 conflit (règle métier violée).
- **5xx** faute du SERVEUR : 500 = « on a un bug » (sans jamais fuiter les détails internes).
Choisir le bon statut EST de la conception : le client programme ses réactions dessus.

### REST : organiser l'API en ressources
REST modélise l'API en **ressources** nommées (des noms au pluriel) manipulées par les verbes HTTP : `GET /livres`, `POST /livres`, `GET /livres/42`, `DELETE /livres/42`, `GET /livres/42/emprunts`. Règle d'or : l'URL dit QUOI, le verbe dit COMMENT — jamais de verbe dans l'URL (`/getLivres` est un anti-pattern). Une bonne API REST est PRÉVISIBLE : on la devine sans documentation. Filtres, pagination, recherche passent en query string (`?page=2&genre=sf`).

### JSON : le format d'échange universel
JSON (JavaScript Object Notation) transporte des données structurées en texte : objets `{}`, tableaux `[]`, strings, nombres, booléens, null. `JSON.stringify` sérialise, `JSON.parse` désérialise — et peut ÉCHOUER (toujours dans un try/catch aux frontières). Limites à connaître : pas de dates (des strings ISO), pas de fonctions, pas de commentaires.

## Concepts clés
Requête/réponse · sans état · headers (Content-Type, Authorization) · méthodes et idempotence · statuts par famille · DNS → TCP → TLS → HTTP · latence vs bande passante · ressources REST · query string · sérialisation JSON.

## 🧭 Exemple guidé — lire un échange, puis décider d'une réponse

**Première partie : lire.** Voici un échange complet. L'objectif n'est pas de le retenir mais
de savoir **nommer chaque morceau**, parce que c'est ce qui permet ensuite de dire où ça
coince.

```bash
curl -i -X POST https://api.example.com/livres \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGci..." \
  -d '{"titre": "Dune", "auteurId": 3}'
```

Quatre décisions sont déjà prises dans ces quatre lignes, et chacune a une raison.

`POST` **sur `/livres`**, au pluriel, et non `/creerLivre`. En REST, l'URL désigne une
**ressource** — une chose — et le verbe HTTP dit ce qu'on en fait. Mettre l'action dans
l'URL revient à réinventer un vocabulaire là où il en existe déjà un.

`Content-Type` annonce le format du **corps envoyé**. Sans lui, le serveur reçoit une suite
d'octets et doit deviner ; la plupart refusent. C'est une déclaration sur ce que **tu**
envoies, pas une demande sur ce que tu veux recevoir — cette dernière s'appelle `Accept`, et
la confusion entre les deux est constante.

`Authorization: Bearer <jeton>` place l'identité dans un **en-tête**, jamais dans l'URL. La
raison est concrète : les URL sont écrites dans les journaux du serveur, du proxy, du
navigateur, et dans l'historique. Un jeton dans une URL est un jeton publié.

Et la réponse :

```
HTTP/1.1 201 Created
Location: /livres/42
Content-Type: application/json

{"id": 42, "titre": "Dune", "auteurId": 3}
```

`201` et non `200` : la création a un code à elle, et `Location` dit **où** la ressource
vit désormais. Le corps renvoie l'objet créé avec son `id` — que le client ne pouvait pas
connaître, puisque c'est le serveur qui l'attribue.

**Deuxième partie : décider.** Le même appel, mais l'auteur `3` n'existe pas. Que
réponds-tu ?

**Décision 1 — quelle famille ?** `4xx` ou `5xx` ? La question à poser est : *qui doit
changer quelque chose pour que ça marche ?* Ici, c'est le client — il a envoyé un
identifiant invalide. Donc `4xx`. Un `5xx` dirait « je suis cassé », enverrait le client
réessayer à l'identique, et déclencherait une alerte chez toi pour rien.

**Décision 2 — lequel des 4xx ?** Trois candidats plausibles, et le choix se raisonne :

- `400 Bad Request` — la requête est **mal formée**. Ce n'est pas le cas : le JSON est
  valide et les champs attendus sont là.
- `404 Not Found` — **la ressource demandée** n'existe pas. Piège fréquent : ici, la
  ressource demandée est `/livres`, et elle existe. C'est une *référence dans le corps* qui
  est introuvable, ce qui n'est pas la même chose.
- `422 Unprocessable Content` — la requête est bien formée mais **sémantiquement**
  inacceptable. C'est exactement le cas.

`422` est le plus juste. Cela dit, beaucoup d'API renvoient `400` pour tout ce qui est
invalide, et c'est un choix défendable : moins de codes à documenter, moins d'hésitations
dans l'équipe. **Ce qui n'est pas défendable, c'est de mélanger les deux sans règle** — le
client ne peut alors plus rien traiter automatiquement.

**Décision 3 — que met-on dans le corps ?** Un statut seul ne suffit pas : le client doit
pouvoir afficher quelque chose d'utile, et le développeur corriger.

```json
{ "error": "auteur_introuvable",
  "message": "L'auteur 3 n'existe pas.",
  "champ": "auteurId" }
```

Trois éléments, trois destinataires. `error` est un **code stable** que le code client peut
tester — il ne changera pas quand on réécrira le message. `message` est pour un humain et
peut être traduit. `champ` permet à un formulaire de surligner la bonne case. Renvoyer
uniquement `{"error": "Erreur"}` oblige chaque client à faire de la comparaison de chaînes,
et casse le jour où l'on corrige une faute de frappe.

**Comment tu sais que c'est bon.** Rejoue l'appel avec `curl -i` et vérifie trois choses : le
code de statut correspond à qui doit agir ; le corps contient un code stable ; et — le test
que personne ne fait — **coupe la base de données et refais l'appel**. Tu dois obtenir `503`
ou `500`, pas `422`. Si tu obtiens `422`, ton code confond « donnée invalide » et « je n'ai
pas pu vérifier », et le client réagira de travers.

**Ce que ça t'a appris.** Un code de statut n'est pas une étiquette décorative : c'est une
**instruction au client** sur ce qu'il doit faire ensuite — corriger sa requête, réessayer
plus tard, ou renoncer. Choisir le code, c'est choisir le comportement de tous les
programmes qui t'appellent.

**Variante qui déplace le problème.** L'appel réussit, mais un livre du même titre existe
déjà pour cet auteur, et ta règle métier l'interdit. Reprends les trois décisions. La famille
reste `4xx`. Mais ni `400` ni `422` ne conviennent vraiment : la requête est bien formée
**et** sémantiquement valide — elle entre en conflit avec l'**état actuel** du serveur.
C'est précisément ce que `409 Conflict` désigne. Et note la conséquence : contrairement au
`422`, ce refus pourrait **disparaître de lui-même** si l'autre livre était supprimé. Un
code de statut renseigne aussi sur la **stabilité** du refus.

## ⚠️ Erreurs fréquentes
- Tout répondre en 200 (même les erreurs) : le client ne peut plus réagir correctement.
- Confondre 401 (qui es-tu ?) et 403 (je sais qui tu es, c'est non).
- Un GET qui modifie l'état : les robots, caches et préchargements vont le déclencher.
- Secret dans l'URL : les URLs sont loggées partout — les secrets vont dans les headers.

## 🔗 Liens avec le programme
Appeler un LLM (mois 8), c'est LITTÉRALEMENT ceci : un POST avec un header d'auth et un corps JSON, un statut à vérifier, un corps à parser prudemment. Ton RAG est une API qui appelle des APIs. Le streaming des réponses LLM est du HTTP qui envoie le corps par morceaux. Maîtriser cette leçon = ne jamais subir un SDK comme une boîte noire.

## Mini-exercice
Avec curl uniquement : GET une API publique, provoque un 404, un 400 (corps invalide), suis une redirection (-L), affiche les headers (-i). Note pour chaque réponse : statut, 2 headers intéressants, forme du corps.

## ✅ Correction attendue
**La démarche** : `curl -i` sur chaque appel, et on lit la réponse AVANT de conclure. Un 404 s'obtient sur une ressource inexistante (`/livres/999999`) ; un 400 en envoyant un corps que le serveur ne peut pas interpréter ; `-L` révèle qu'une redirection est une réponse 3xx assortie d'un header `Location`, et que curl ne la suit pas de lui-même.

**L'erreur probable, et c'est le malentendu fondateur du sujet.** Beaucoup obtiennent un 404 en tapant une adresse au hasard (`/api/nimportequoi`) et cochent la case. Le piège est qu'on croit avoir provoqué « l'erreur 404 », alors qu'on n'a pas su la distinguer d'un vrai 404 métier. Ce sont deux situations très différentes qu'un client doit traiter différemment : « cette route n'existe pas » est un bug d'intégration à corriger tout de suite, « ce livre n'existe pas » est un cas normal qu'il faut afficher à l'utilisateur.

Le malentendu est entretenu par le protocole lui-même — HTTP ne fournit qu'un seul code pour les deux. La réponse professionnelle consiste à regarder le CORPS, pas seulement le statut : une API bien conçue renvoie un objet d'erreur qui dit laquelle des deux situations s'applique. C'est exactement ce que la leçon appelle « choisir le bon statut EST de la conception » — et sa limite : le statut ne suffit jamais seul.

**Alternative défendable** : Postman ou un client graphique plutôt que curl. Plus confortable, historisé, partageable. Mais il masque justement ce qu'on cherche à voir ici, et il est absent des serveurs. On apprend avec curl, on travaille avec ce qu'on veut — et l'on garde curl pour le jour où l'on débogue depuis une machine sans écran.

**Vérifie seul, sans corrigé** :
1. Tu sais dire, pour chacune de tes cinq réponses, à quoi sert **chaque** header que tu as retenu — pas seulement son nom.
2. Ton 400 vient bien du corps envoyé, pas d'une URL fautive. Si tu changes le corps et que le statut change, c'est prouvé.
3. Sans `-L`, tu obtiens un 3xx et un header `Location`. Avec `-L`, un 200. Si tu ne vois pas cette différence, `-L` n'a rien démontré.
4. Épreuve finale : fais un `GET` avec un corps JSON. Observe qu'il part sans erreur, et que le serveur l'ignore. Comprendre pourquoi — un `GET` demande, il ne transporte pas d'intention de modification — vaut mieux que retenir la liste des méthodes.

## 🏢 Cas professionnel
Une API renvoie `200 OK` pour tout, en mettant `{"success": false, "error": "..."}` dans le corps quand ça échoue. L'argument de départ tient debout : « c'est plus simple, le client lit un seul champ ». Les conséquences arrivent en cascade.

Le cache HTTP mémorise les réponses 200 : les erreurs sont mises en cache et resservies. Le client HTTP ne lève plus d'exception sur échec, donc chaque appelant doit penser à tester `success` — et un seul oubli fait passer une erreur pour une donnée. La supervision, qui compte les 5xx, affiche un taux d'erreur de 0 % pendant une panne. Et le mécanisme de retry, qui ne rejoue que les échecs, ne rejoue plus rien.

L'ensemble de l'infrastructure — caches, proxys, clients, sondes, disjoncteurs — lit le **statut**, jamais le corps. Choisir un statut, ce n'est pas décorer une réponse : c'est parler à une douzaine de composants qu'on n'a pas écrits et qui n'ouvriront jamais le corps du message. C'est ce qui rend le 401/403 ou le 409 utiles, et le 200 universel coûteux.

## 🔥 Pratique — concevoir une API, puis l'attaquer

**A. Les sept opérations.** Conçois les points d'entrée d'une ressource
« commande » : lister, lire une, créer, modifier entièrement, modifier
partiellement, supprimer, et une action métier qui n'est pas un verbe de gestion
de ressource (annuler, par exemple). Livrable : les sept lignes, avec méthode,
chemin et code de retour attendu.

**B. Les codes de retour.** Pour chacune, écris le code du cas nominal **et** de
trois cas d'erreur : donnée invalide, ressource absente, action interdite dans
l'état courant. Livrable : le tableau complet.

**C. Le format d'erreur.** Écris une réponse d'erreur exploitable par un client
qui doit afficher un message à l'utilisateur **et** décider s'il peut réessayer.
Livrable : le corps de réponse, et ce que chaque champ permet.

**D. L'idempotence.** Envoie deux fois la même création. Livrable : ce qui se
passe, et le mécanisme qui rend le second envoi sans effet.

**E. La pagination.** Fais lister dix mille commandes. Livrable : ta solution, et
ce qui se passe si une commande est créée entre deux pages.

## ✅ Correction attendue

**A — les sept opérations.** La forme attendue s'appuie sur des **noms de
ressources** au pluriel et laisse la méthode porter le verbe. `POST /commandes`
plutôt que `POST /creerCommande` : le chemin dit **quoi**, la méthode dit
**quelle action**.

L'action métier est le point intéressant, parce que c'est là que la règle
s'arrête. « Annuler une commande » n'est ni une modification ni une suppression :
c'est une transition d'état avec ses propres règles. Deux réponses défendables —
un sous-chemin d'action (`POST /commandes/42/annulation`), ou une modification
partielle du statut. La première est plus explicite et se prête mieux aux
autorisations ; la seconde est plus régulière. **Ce qui compte est de choisir et
de s'y tenir**, pas de trouver la seule bonne réponse : il n'y en a pas.

**B — les codes.** Les distinctions qui départagent :

- **400 contre 422** : la requête est mal formée contre elle est bien formée mais
  métier-invalide. Beaucoup d'API renvoient 400 pour tout, ce qui prive le client
  de l'information la plus utile — a-t-il un bogue, ou l'utilisateur a-t-il mal
  saisi ?
- **401 contre 403** : je ne sais pas qui tu es contre je sais qui tu es et tu
  n'as pas le droit. Confondre les deux fait boucler un client sur une
  réauthentification qui ne changera rien.
- **404 contre 403** sur une ressource existante mais interdite : c'est une
  décision de sécurité. Renvoyer 404 masque l'existence de la ressource ;
  renvoyer 403 la révèle. À décider explicitement, pas par défaut.
- **409** pour une action interdite dans l'état courant — annuler une commande
  déjà livrée. C'est le code que presque personne n'utilise, et c'est exactement
  celui qui correspond.

**C — le format d'erreur.** Un corps utile contient trois choses **distinctes** :
un code stable et lisible par la machine, un message destiné à l'humain, et
l'information sur la **reprise possible**.

```json
{ "code": "stock_insuffisant",
  "message": "Il ne reste que 2 exemplaires de cet article.",
  "reessayable": false,
  "champ": "quantite" }
```

Le code est stable et le message ne l'est pas : un client ne doit **jamais**
tester le contenu du message, sinon toute reformulation casse les intégrations.
Et le champ `reessayable` est ce qui manque presque toujours — sans lui, un
client ne peut pas distinguer « inutile de réessayer » de « réessaie dans une
seconde », et il choisit mal dans les deux sens.

**D — l'idempotence.** Sans mécanisme, la seconde création crée une seconde
commande. Ce n'est pas théorique : c'est ce qui se produit quand un client
réessaie après un délai d'attente **alors que la première requête avait
réussi** — il n'a pas reçu la réponse, il ne peut pas savoir.

Le mécanisme attendu : une **clé d'idempotence** fournie par le client, que le
serveur enregistre avec le résultat. Un second envoi portant la même clé renvoie
le résultat mémorisé sans rien recréer.

C'est exactement le mécanisme mesuré dans `etl-pipelines`, où une insertion
rejouée sans clé produit **2000 lignes et une somme de 299000** au lieu des
valeurs attendues. Le même raisonnement, un contexte différent.

**E — la pagination.** La solution par numéro de page est simple et a un défaut
que l'exercice fait apparaître : si une commande est créée entre deux pages, les
éléments décalent, et le client **voit deux fois** le même élément ou **en rate
un** — sans qu'aucune erreur ne l'indique.

La pagination par curseur — « donne-moi les 50 suivants après cet
identifiant » — n'a pas ce défaut, parce que la position est ancrée sur un
élément et non sur un rang. Son coût : on ne peut plus sauter directement à la
page 47.

Le choix suit l'usage : par numéro pour une interface de navigation humaine où le
décalage est sans conséquence, par curseur pour toute consommation programmatique
qui doit être exhaustive. Une synchronisation qui rate silencieusement une ligne
sur mille est un défaut qu'on découvre très tard.

## 🎤 Questions d'entretien
- « Que se passe-t-il quand tu tapes une URL dans un navigateur ? » → DNS, puis TCP, puis TLS, puis la requête HTTP et la réponse. Chaque étape coûte des allers-retours : c'est là qu'est la latence.
- « 401 ou 403 ? » → 401 : je ne sais pas qui tu es (authentifie-toi). 403 : je le sais, et c'est non. Le premier invite à réessayer autrement, le second non.
- « Pourquoi peut-on rejouer un PUT et pas un POST ? » → PUT est idempotent : il écrit un état voulu, le rejouer donne le même résultat. POST crée : le rejouer crée deux fois.
- « Que veut dire "HTTP est sans état" ? » → Chaque requête est autonome ; le serveur ne se souvient de rien entre deux appels. C'est ce qui permet à n'importe quelle instance de répondre — et ce qui oblige à renvoyer le jeton d'authentification à chaque fois.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je choisis un statut en pensant aux caches, aux retries et à la supervision, pas seulement au client.
- [ ] Je sais nommer chaque partie d'une requête que je lis dans un log.
- [ ] Je distingue latence et bande passante, et je sais laquelle un serveur plus proche améliore.
- [ ] Je ne mets jamais de secret dans une URL, et je sais pourquoi.

## 📚 Vocabulaire
**sans état** · **header** · **corps (body)** · **idempotence** · **statut** · **ressource** · **collection** · **query string** · **sérialisation** · **latence** · **TLS / certificat**.

## 🧾 À retenir
HTTP : des requêtes autonomes (méthode + URL + headers + corps) et des réponses (statut + corps), sans mémoire entre elles, transportées sur DNS + TCP + TLS. Les méthodes et statuts portent une sémantique précise qui EST le contrat. REST organise l'API en ressources prévisibles ; JSON transporte les données. Tout ton avenir (APIs, apps LLM, RAG, webhooks) parle cette langue.
