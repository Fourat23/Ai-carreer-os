<!-- keep -->
# Leçon — Authentification et autorisation

## 🎯 Objectif
Distinguer authentification (qui es-tu ?) et autorisation (qu'as-tu le droit de faire ?), comprendre tokens, sessions et hachage de mots de passe, et protéger des routes proprement. Le b.a.-ba de sécurité de toute API — questions d'entretien garanties.

## 🧠 Modèle mental
L'authentification, c'est **le contrôle d'identité à l'entrée du bâtiment** (badge) ; l'autorisation, c'est **les portes que ton badge ouvre** (étages autorisés). Deux questions distinctes, deux mécanismes — et HTTP étant sans état, le badge se présente À CHAQUE requête.

## 📖 Explication complète
- **AuthN vs AuthZ** : authentifier = vérifier l'identité (mot de passe, token) → 401 si échec. Autoriser = vérifier les droits de cette identité (rôle, propriété de la ressource) → 403 si refus. Les confondre = la confusion 401/403, classique d'entretien.
- **Le token** : après login, le serveur délivre un jeton que le client renvoie à chaque requête dans `Authorization: Bearer <token>` (JAMAIS dans l'URL : les URLs sont loggées partout). Deux familles : le token OPAQUE (stocké côté serveur, révocable facilement) et le **JWT** (auto-porteur : les infos + une SIGNATURE ; le serveur vérifie sans stockage — mais révocation difficile avant expiration → durée de vie courte).
- **Les mots de passe** : JAMAIS en clair, JAMAIS chiffrés-réversibles — HACHÉS avec une fonction LENTE et salée (bcrypt/argon2). Se faire voler la base ne doit pas donner les mots de passe. (Un hash rapide type SHA-256 se brute-force : il FAUT une fonction conçue pour être lente.)
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
**Énoncé** : « un membre ne peut supprimer QUE ses propres notes » — où va cette règle ?
**Raisonnement** : c'est de l'AUTORISATION (l'identité est déjà connue) → dans le service, avec la ressource sous les yeux.
**Solution** :
```js
// service — AuthZ près de la donnée
async function supprimerNote(noteId, userId) {
  const note = await notes.parId(noteId);
  if (!note) throw httpError(404, 'Note inconnue');
  if (note.auteurId !== userId) throw httpError(403, 'Interdit');  // ← AuthZ
  await notes.supprimer(noteId);
}
```
**Explication** : le middleware a établi QUI (401 sinon) ; le service décide SI (403 sinon). 404 avant 403 : ne pas révéler l'existence d'une ressource interdite est un choix à documenter. **Variante** : ajoute un rôle admin qui bypasse la règle — où le testes-tu ?

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
