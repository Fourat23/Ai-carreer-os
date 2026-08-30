<!-- keep -->
# Leçon — Authentification et autorisation

## 🌍 Le problème d'abord
Ton API fonctionne, mais pour l'instant N'IMPORTE QUI peut tout faire : lire les données de
tout le monde, en supprimer, en modifier. Il te faut deux garde-fous distincts : d'abord
savoir QUI fait la requête (est-ce bien Alice ?), ensuite décider si cette personne a le
DROIT de faire cette action précise (Alice peut-elle supprimer la note de Bob ?). Ces deux
questions — **authentification** et **autorisation** — sont souvent confondues, et cette
confusion est la source de failles de sécurité classiques. Comme HTTP n'a pas de mémoire
entre deux requêtes, l'identité doit être re-prouvée à chaque appel. Cette leçon t'apprend à
protéger une API proprement.

## 🎯 Objectif
Distinguer authentification (qui es-tu ?) et autorisation (qu'as-tu le droit de faire ?), comprendre tokens, sessions et hachage de mots de passe, et protéger des routes proprement. Le b.a.-ba de sécurité de toute API — questions d'entretien garanties.

## 🧠 Modèle mental
L'authentification, c'est **le contrôle d'identité à l'entrée du bâtiment** (badge) ; l'autorisation, c'est **les portes que ton badge ouvre** (étages autorisés). Deux questions distinctes, deux mécanismes — et HTTP étant sans état, le badge se présente À CHAQUE requête.

## 🧩 Prérequis
Tu dois comprendre HTTP — requêtes sans état, en-têtes, statuts (dont 401/403) — et le style
REST (`/doc/lessons/http-rest-json`), ainsi que la structure d'une API en couches
(`/doc/lessons/express-backend`), car l'auth s'implémente comme un middleware devant les
routes protégées. Une notion de sécurité applicative aide (`/doc/lessons/ai-security` viendra
plus loin). Le hachage de mots de passe et les tokens sont introduits ici.

## 📖 Explication complète
- **AuthN vs AuthZ** : authentifier = vérifier l'identité (mot de passe, token) → 401 si échec. Autoriser = vérifier les droits de cette identité (rôle, propriété de la ressource) → 403 si refus. Les confondre = la confusion 401/403, classique d'entretien.
- **Le token** : après login, le serveur délivre un jeton que le client renvoie à chaque requête dans `Authorization: Bearer <token>` (JAMAIS dans l'URL : les URLs sont loggées partout). Deux familles : le token OPAQUE (stocké côté serveur, révocable facilement) et le **JWT** (auto-porteur : les infos + une SIGNATURE ; le serveur vérifie sans stockage — mais révocation difficile avant expiration → durée de vie courte).
- **Les mots de passe** : JAMAIS en clair, JAMAIS chiffrés-réversibles — HACHÉS avec une fonction LENTE et salée (bcrypt, argon2, scrypt). Se faire voler la base ne doit pas donner les mots de passe. « Lente » mérite un ordre de grandeur, parce que c'est ce qui rend la règle non négociable : sur un seul cœur d'une machine ordinaire, SHA-256 exécute environ **434 000 hachages par seconde**, contre **22** pour scrypt aux paramètres recommandés — un rapport de l'ordre de **20 000**. Concrètement, essayer un milliard de mots de passe issus de fuites connues demande une quarantaine de minutes avec SHA-256, et plus d'un an avec scrypt — sur un cœur ; un attaquant réel utilise des GPU et des dizaines de machines, donc ce sont les *rapports* qui comptent, pas les durées absolues. C'est exactement ce facteur qui décide si une base volée est exploitable le soir même ou jamais. Le sel, lui, ne ralentit rien : il empêche de casser tous les comptes d'un coup avec une table précalculée.
- **Le middleware d'auth** : vérifie le token AVANT les routes protégées, attache l'identité à `req.user`, et laisse l'AuthZ aux services (« ce user est-il propriétaire de cette ressource ? »).
- **L'essentiel autour** : HTTPS obligatoire (le token circule), expiration + renouvellement, rate limiting sur le login (force brute), messages d'échec neutres (« identifiants invalides » — ne pas révéler si l'email existe).

## 🔧 Exemple simple
```js
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = verifierToken(token);            // signature/lookup
  if (!user) return res.status(401).json({ error: 'Non authentifié' });
  req.user = user;
  next();
}
app.post('/livres', requireAuth, creerLivre);   // route protégée
```

## 🧭 Exemple guidé

Une API de notes personnelles. Toutes les routes passent par `requireAuth`, les tests
passent, la revue de code est validée. Voici les deux routes de lecture :

```js
router.get('/notes',     requireAuth, async (req, res) =>
  res.json(await notes.parAuteur(req.user.id)));          // liste : filtrée

router.get('/notes/:id', requireAuth, async (req, res) =>
  res.json(await notes.parId(req.params.id)));            // détail : ???
```

Connecte-toi comme Alice et demande `GET /notes/812` — une note de Bob. Tu la reçois. Le
token était valide, `requireAuth` a fait son travail, aucune erreur nulle part. C'est un
**IDOR**, et c'est l'une des failles les plus répandues du web précisément parce qu'elle ne
ressemble pas à un bug : la route est protégée, elle est simplement protégée contre la
mauvaise chose.

**Ce que l'incident révèle.** Les deux lignes se ressemblent, mais la première filtre par
auteur et la seconde ne filtre par rien. Ce n'est pas un oubli isolé, c'est **structurel** :
sur une liste, on est forcé de dire de quoi on parle, donc le filtre par utilisateur s'écrit
naturellement ; sur un accès par identifiant, l'identifiant *semble* déjà tout dire. Le
premier réflexe de correction est donc le mauvais réflexe.

**Décision 1 — quel statut renvoyer à Alice ?** Le manuel dit `403` : Alice est identifiée,
elle n'a pas le droit. Mais un `403` sur `/notes/812` et un `404` sur `/notes/813` disent
à Alice que la note 812 existe et pas la 813. En bouclant sur les identifiants, elle
cartographie le nombre de notes du service, leur rythme de création, et peut cibler des
identités. Répondre `404` dans les deux cas coûte un peu de précision de diagnostic et
supprime cette fuite. Aucun des deux n'est universellement bon : `403` est plus honnête et
plus facile à déboguer, `404` ne divulgue rien. La règle utilisable est de trancher **par
sensibilité** — `403` sur des ressources dont l'existence est publique (un dépôt, une
équipe), `404` sur des ressources personnelles. L'essentiel est que ce soit décidé et écrit,
pas laissé au hasard de chaque route.

**Décision 2 — où poser la vérification ?** La réponse évidente :

```js
const note = await notes.parId(id);
if (!note) throw httpError(404, 'Note inconnue');
if (note.auteurId !== userId) throw httpError(404, 'Note inconnue');   // choix décidé ci-dessus
```

C'est correct. Ce n'est pas suffisant, et c'est là que la plupart des équipes s'arrêtent.
Cette protection dépend de la mémoire du développeur : elle fonctionne sur les routes où
quelqu'un a pensé à l'écrire. Demain, `PATCH /notes/:id`, l'export CSV, la recherche
plein-texte et l'endpoint de partage seront ajoutés par quatre personnes différentes, et
l'une d'elles oubliera. Une règle de sécurité qui repose sur la discipline sera violée ;
c'est une question de temps, pas de compétence.

**Décision 3 — rendre l'oubli impossible plutôt qu'improbable.** Change la couche d'accès aux
données pour qu'il n'existe plus de fonction capable de lire une note sans savoir pour qui :

```js
// data/notes.js — il n'y a plus de parId(noteId) tout court
async function parIdPour(noteId, userId) {
  return db.get(`SELECT * FROM notes WHERE id = ? AND auteur_id = ?`, noteId, userId);
}
```

La différence est de nature, pas de degré. Avec la version précédente, écrire une route non
sécurisée est facile et silencieux. Avec celle-ci, il faut délibérément contourner la couche
d'accès — et un `grep` sur les requêtes qui lisent `notes` sans `auteur_id` devient un
contrôle automatisable. On est passé d'une règle que l'on applique à une règle que
l'architecture applique. C'est le même mouvement que la contrainte en base plutôt que la
vérification dans le service : **place l'invariant là où on ne peut pas le sauter.**

**Le test qui compte.** Le test qui vérifie qu'Alice lit ses propres notes ne prouve rien —
il passait déjà avec le code vulnérable. Le seul test utile crée **deux** utilisateurs et
demande à l'un la ressource de l'autre. Écris-le une fois par type de ressource ; c'est le
test le moins spectaculaire et le plus rentable de toute ton API.

**Variante qui déplace le problème.** On ajoute un rôle admin qui peut tout lire. La
tentation est un `if (user.role === 'admin') return notes.parId(id)` — et l'on vient de
recréer, pour un seul cas, exactement la fonction non filtrée qu'on avait supprimée. Mieux
vaut que le droit reste exprimé dans la requête (`WHERE auteur_id = ? OR ? = 'admin'`, ou
une portée passée explicitement), pour qu'il n'existe toujours qu'un seul chemin de lecture.
Et pose-toi la question que l'audit posera : un admin qui lit les notes d'un membre, est-ce
tracé quelque part ? Un accès privilégié non journalisé n'est pas un droit, c'est un angle
mort.

## 🤖 Exemple appliqué (IA / data / architecture)
Ton API DocSense est protégée par token (qui a le droit d'interroger le corpus ?), et l'AuthZ peut FILTRER LE RETRIEVAL : un utilisateur ne doit retrouver QUE les documents auxquels il a accès (filtre de métadonnées dans la recherche vectorielle) — sinon le RAG devient un canal d'exfiltration. L'auth rencontre l'IA exactement ici.

## ⚠️ Erreurs fréquentes
- Confondre 401 (pas identifié) et 403 (identifié mais interdit).
- Token dans l'URL (loggée partout) au lieu du header.
- Mots de passe hachés avec une fonction RAPIDE (SHA) au lieu de bcrypt/argon2.
- AuthZ oubliée : authentifié ≠ autorisé à tout (l'IDOR : deviner l'id d'une ressource d'autrui).

## 🚫 Anti-patterns
- Implémenter sa propre crypto (utiliser les bibliothèques éprouvées).
- Un JWT de 30 jours sans possibilité de révocation.

## ✍️ Mini-exercice
Ajoute un middleware `requireAuth` à ton API et prouve les 3 cas : sans token → 401, mauvais token → 401, bon token → succès.

## 🔥 Exercice plus difficile
Implémente login (hachage bcrypt) + délivrance de token + une règle d'AuthZ de propriété (mes notes seulement), avec les tests des cas 401/403/404 et un rate limit sur /login.

## ✅ Correction

### La démarche : deux questions, deux endroits

L'authentification (**AuthN** — *qui es-tu ?*) et l'autorisation (**AuthZ** — *as-tu le droit
de faire ceci ?*) sont deux questions distinctes, et le fait de les traiter à deux endroits
différents n'est pas une préférence d'organisation : c'est ce qui rend l'une des deux
impossible à oublier.

| | Question | Où | Réponse en cas d'échec |
|---|---|---|---|
| **AuthN** | l'identité est-elle établie ? | un middleware, **avant** toutes les routes protégées | **401** |
| **AuthZ** | cette identité a-t-elle le droit ? | dans le service, **au plus près de la donnée** | **403** |

Le raisonnement derrière ce placement :

- l'AuthN est **la même pour toutes les routes** : un middleware unique la garantit, et une
  nouvelle route en hérite automatiquement. C'est ce qui la rend non oubliable ;
- l'AuthZ **dépend de la donnée** : « puis-je lire cette note ? » ne se répond qu'en sachant à
  qui la note appartient. Une vérification placée dans la route, avant d'avoir lu la donnée,
  ne peut pas poser la bonne question.

401 et 403 ne sont pas interchangeables. **401** dit « je ne sais pas qui tu es » — le client
doit s'authentifier, et un client bien écrit rafraîchit son jeton et réessaie. **403** dit « je
sais qui tu es, et c'est non » — réessayer ne servira à rien. Renvoyer 401 à la place de 403
met les clients dans une boucle de reconnexion inutile.

### Le hachage : pourquoi « lent » est une qualité

Le mot de passe n'est jamais stocké, ni en clair, ni chiffré — **chiffré** implique
déchiffrable, donc une clé, donc une clé qui fuit un jour. Il est **haché** : une
transformation à sens unique, dont on ne peut pas revenir en arrière.

Reste la question qui décide de tout : *quelle fonction de hachage ?* On lit souvent « pas
SHA-256, utilisez bcrypt ». Voici pourquoi, en chiffres.

> Mesuré par `scripts/v70-verifications/hachage-lent.mjs`, sur une seule machine, sans carte
> graphique. Les valeurs absolues dépendent du matériel ; l'ordre de grandeur du rapport, non.

| Fonction | Débit mesuré | Durée d'un hachage |
|---|---|---|
| SHA-256 | **681 015 hachages/s** | 0,0015 ms |
| scrypt (N=16384, r=8, p=1) | **23,6 hachages/s** | 42,4 ms |

Un rapport de **28 857**.

Ce que ça donne face à un attaquant qui a volé ta base et essaie un dictionnaire de dix
millions de mots de passe courants :

| Base hachée en… | Temps pour tout essayer |
|---|---|
| SHA-256 | **14,7 secondes** |
| scrypt | **4,9 jours** |

Voilà l'argument entier. Une base en SHA-256 n'est pas « moins bien protégée » : elle est,
en pratique, **non protégée** — quatorze secondes sur un ordinateur portable, et un attaquant
équipé de cartes graphiques fait bien mieux.

La lenteur n'est donc pas un effet secondaire qu'on tolère : c'est **la fonctionnalité**. Elle
ne coûte rien à ton service — 42 ms une fois par connexion — et coûte des jours à quelqu'un qui
doit la payer dix millions de fois. C'est une asymétrie construite exprès.

Deux compléments indispensables :

- **le sel** : une valeur aléatoire différente **par utilisateur**, stockée à côté du haché. Sans
  lui, deux personnes ayant le même mot de passe ont le même haché, et une table
  précalculée casse toute la base d'un coup. Avec lui, l'attaquant doit refaire le travail pour
  chaque compte, ce qui multiplie les 4,9 jours par le nombre d'utilisateurs ;
- **le paramètre de coût** : il est stocké dans le haché lui-même, ce qui permet de l'augmenter
  au fil des années sans invalider les anciens mots de passe — on rehache à la connexion
  suivante.

En pratique on utilise **argon2** ou **bcrypt** plutôt que scrypt directement ; le principe
mesuré ci-dessus est le même pour les trois.

### Le message de login, et le détail qui trahit

```js
// ❌ deux messages différents
if (!utilisateur) return res.status(401).json({ erreur: "Cet e-mail n'existe pas" });
if (!ok)          return res.status(401).json({ erreur: 'Mot de passe incorrect' });

// ✅ un seul
return res.status(401).json({ erreur: 'Identifiants invalides' });
```

La version fautive transforme ton formulaire de connexion en **service de vérification
d'adresses** : on y teste une liste de courriels et on apprend lesquels ont un compte. C'est
une information monnayable, et le point de départ d'un hameçonnage ciblé.

Il y a plus subtil, et c'est ce qui distingue une réponse d'entretien correcte d'une réponse
excellente : **le temps de réponse trahit aussi**. Si l'utilisateur n'existe pas, on répond
tout de suite ; s'il existe, on vérifie le mot de passe pendant 42 ms. L'écart est mesurable
de l'extérieur, et il redonne exactement l'information qu'on venait de masquer.

La parade : **hacher quand même**, contre un haché factice, quand l'utilisateur n'existe pas.
Les deux chemins prennent alors le même temps.

Le même principe s'applique à la comparaison du jeton :

```
timingSafeEqual(a, b)  → compare TOUS les octets, durée constante
a === b                → peut s'arrêter au premier octet différent
```

Une comparaison naïve fuit, octet par octet, la position de la première différence. Pour tout
secret comparé — jeton, signature, clé d'API — on utilise une comparaison à temps constant.

### L'IDOR, la faille que l'exercice doit rendre impossible

**IDOR** — *Insecure Direct Object Reference*, référence directe à un objet non sécurisée : je
remplace `/notes/42` par `/notes/43` et je lis la note de quelqu'un d'autre.

C'est la faille la plus fréquente des API, et sa cause est presque toujours la même : on a
vérifié l'AuthN, on a oublié l'AuthZ. L'utilisateur est bien connecté — simplement, il n'est
pas le propriétaire.

```js
// ❌ authentifié ≠ autorisé
const note = await depot.lire(req.params.id);
res.json(note);

// ✅ la règle de propriété, au plus près de la donnée
const note = await depot.lire(id);
if (!note) throw new ErreurHttp(404);
if (note.proprietaire !== utilisateur.id) throw new ErreurHttp(404);   // ← 404, pas 403
```

Le détail qui compte : **404 plutôt que 403**. Un 403 confirme que la note 43 existe. Pour une
ressource privée, le fait même de son existence est une information ; on répond donc comme si
elle n'existait pas. Un 403 reste correct quand l'existence n'est pas secrète — « ce document
public existe, tu n'as pas le droit de le modifier ».

Meilleure encore, la formulation qui rend l'oubli impossible :

```js
const note = await depot.lireDeUtilisateur(id, utilisateur.id);   // le filtre est DANS la requête
```

La règle n'est plus un `if` qu'on peut oublier d'écrire : elle fait partie de la manière dont
la donnée est lue. C'est le même principe que dans la leçon sur les états impossibles —
**quand une faute ne doit pas arriver, on la rend inexprimable plutôt que surveillée**.

### JWT ou jeton opaque : le compromis, sans dogme

| | **JWT** (jeton signé, auto-porteur) | **Jeton opaque** (référence en base) |
|---|---|---|
| vérification | signature seule, aucun accès base | nécessite une lecture serveur |
| révocation | **difficile** : valide jusqu'à expiration | immédiate : on supprime la ligne |
| changement de droits | pris en compte à la prochaine émission | immédiat |
| passage à l'échelle | excellent | dépend du magasin de sessions |

Il n'y a pas de bonne réponse absolue, seulement une conséquence à assumer. Avec un JWT, un
compte désactivé **reste actif** jusqu'à expiration du jeton — d'où les durées courtes (quelques
minutes) accompagnées d'un jeton de rafraîchissement, lui révocable. Répondre « JWT, c'est
moderne » en entretien est une mauvaise réponse ; répondre « JWT court + rafraîchissement
révocable, parce qu'on ne peut pas se permettre qu'un compte licencié reste ouvert une heure »
en est une bonne.

Trois points communs aux deux, non négociables : **HTTPS toujours** (un jeton en clair sur le
réseau est un jeton volé), **jamais dans l'URL** (elle finit dans les journaux, l'historique et
l'en-tête `Referer`), et **jamais de secret dans le corps d'un JWT** — il est signé, pas
chiffré : n'importe qui peut le lire.

### La mauvaise solution plausible

Placer la vérification de propriété dans le middleware, avec le reste de l'AuthN :

```js
app.use('/notes/:id', async (req, res, next) => {
  const note = await depot.lire(req.params.id);
  if (note.proprietaire !== req.user.id) return res.sendStatus(403);
  next();
});
```

Ça marche, et ça a l'air plus propre — tout est au même endroit. Deux problèmes apparaissent
plus tard :

1. **la donnée est lue deux fois** : une fois pour vérifier, une fois dans le service. Sur une
   route très sollicitée, c'est le double de charge pour rien ;
2. surtout, **la règle ne suit pas la donnée**. Le jour où un autre chemin accède aux notes —
   un traitement par lots, un export, une seconde API — il ne passe pas par ce middleware, et
   la règle disparaît sans que personne ne s'en aperçoive.

Une règle d'autorisation attachée à une route protège la route. Une règle attachée à la lecture
de la donnée protège la donnée. C'est la donnée qu'on cherche à protéger.

### Auto-évaluation

| Vérification | Comment |
|---|---|
| les trois cas du middleware | sans jeton → 401, jeton invalide → 401, jeton valide → succès |
| IDOR impossible | connecte-toi en A, demande la ressource de B par son identifiant : tu dois recevoir 404 |
| message neutre | compare la réponse pour un courriel inconnu et pour un mot de passe faux : identiques |
| temps neutre | chronomètre les deux cas : l'écart doit être négligeable |
| hachage lent | une connexion prend quelques dizaines de millisecondes, pas une fraction de milliseconde |
| limite de débit sur `/login` | six tentatives ratées d'affilée doivent être refusées |

### Généralisation

Le principe qui traverse toute cette correction : **une vérification de sécurité doit être
placée là où on ne peut pas l'oublier.** Un middleware pour ce qui est universel, la requête
elle-même pour ce qui dépend de la donnée — jamais un `if` isolé qu'un développeur pressé
recopiera de travers dans la prochaine route.

Et le second, qui vaut au-delà de l'authentification : **ce qui est mesurable de l'extérieur
est une information publique.** Un message d'erreur, un temps de réponse, un statut HTTP, la
taille d'une réponse : tout cela sort de ton système et peut être comparé. Se demander « qu'est-ce
que ma réponse apprend à quelqu'un qui n'a pas le droit de savoir ? » est un réflexe qui
distingue immédiatement, en entretien comme en revue de code.

## 🎤 Questions d'entretien
- « 401 vs 403 ? » → 401 : identité non établie ; 403 : identité connue, action interdite.
- « Comment stockes-tu les mots de passe ? » → Hachés avec bcrypt/argon2 (lents, salés) — jamais en clair ni chiffrés-réversibles.
- « JWT ou session/token opaque ? » → JWT : sans état, mais révocation difficile (durée courte) ; opaque : révocable, mais lookup serveur. Trade-off selon le besoin.

## 🧾 À retenir
- AuthN (401) ≠ AuthZ (403) : deux questions, deux endroits.
- Token en header, HTTPS, expiration ; mots de passe : bcrypt/argon2.
- L'AuthZ va jusque dans le retrieval d'un RAG (filtrer par droits).

## 📚 Vocabulaire
**AuthN / AuthZ** · **401 / 403** · **Bearer token** · **JWT / signature** · **token opaque** · **bcrypt / argon2 / sel** · **IDOR** · **rate limiting** · **expiration / refresh**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je place AuthN et AuthZ au bon endroit (middleware vs service).
- [ ] Je sais expliquer JWT vs token opaque en trade-offs.
- [ ] Mes tests couvrent 401, 403 et l'IDOR.

## 🔗 Liens avec le programme
Mois 3-4 (jours ~64-68, 96), mois 10 (sécurité), DocSense. Leçons liées : `express-backend`, `ai-security`, `http-rest-json`.
