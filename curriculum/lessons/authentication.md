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

## ✅ Correction attendue
La logique : AuthN au middleware (401), AuthZ au service près de la donnée (403), mots de passe hachés lents+salés, token en header sur HTTPS. Vérifie : les 3 cas du middleware, l'IDOR impossible (accéder à la ressource d'un autre par son id), le message de login neutre.

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
