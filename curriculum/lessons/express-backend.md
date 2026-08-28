<!-- keep -->
# Leçon — Backend Express : structure et robustesse

## 🌍 Le problème d'abord
Tu écris ta première API : au début, tout tient dans un fichier, chaque route fait un peu de
tout — lire la requête, vérifier les données, appliquer la règle métier, parler à la base,
gérer les erreurs. Ça marche… jusqu'à ce que le fichier atteigne 800 lignes, que tu ne
saches plus où une erreur est traitée, et que tu ne puisses plus tester une règle sans lancer
tout le serveur. **Express** est l'outil le plus répandu pour construire ces APIs en Node ;
bien l'utiliser, ce n'est pas connaître sa syntaxe mais STRUCTURER la requête en étapes
claires et séparer les responsabilités. Cette leçon te donne le squelette robuste et testable
de toutes tes APIs.

## 🎯 Objectif
Construire des APIs Express structurées en couches, avec middlewares compris (pas subis), validation systématique et erreurs centralisées. C'est le squelette de toutes tes APIs — y compris celles qui serviront tes systèmes IA.

## 🧠 Modèle mental
Express est **une chaîne de guichets** : chaque requête traverse des guichets successifs (middlewares) — identification, journal, parsing, validation — avant d'atteindre le guichet final (la route) qui répond. Chaque guichet traite PUIS passe (next), ou court-circuite en répondant.

## 🧩 Prérequis
Tu dois comprendre HTTP et le style REST (`/doc/lessons/http-rest-json`), la conception d'un
contrat d'API (`/doc/lessons/api-design-basics`), l'asynchrone en JavaScript
(`/doc/lessons/async-javascript`) et la gestion d'erreurs
(`/doc/lessons/error-handling`), car une API Express assemble exactement ces briques. La
notion de code lisible en couches (`/doc/lessons/clean-code`) est réutilisée ici.

## 📖 Explication complète
- **Le middleware** : une fonction `(req, res, next)`. L'ORDRE de déclaration est l'ordre d'exécution — le parsing JSON avant les routes, le gestionnaire d'erreurs en DERNIER. Oublier `next()` = requête suspendue à jamais.
- **Les 3 couches** (la structure qui rend tout testable) :
  - **routes/** : traduire HTTP ↔ appels de fonctions (AUCUNE logique métier) ;
  - **services/** : la logique métier, PURE autant que possible → testable sans serveur ;
  - **data/** : la persistance (requêtes paramétrées), isolée → remplaçable.
  Le test de propreté : la règle « un livre déjà emprunté ne peut l'être » se teste SANS lancer de serveur → elle est dans un service.
- **Validation aux frontières** : toute entrée (body, params, query) est hostile jusqu'à validation — présence, type, bornes. Refus en 400 avec la LISTE des problèmes.
- **Erreurs centralisées** : un middleware final `(err, req, res, next)` attrape tout : erreurs opérationnelles → statut précis et message utile ; bugs → log interne détaillé + 500 générique (jamais de stack au client).
- **Async** : une erreur dans un handler async doit ATTEINDRE le middleware d'erreurs (try/catch + next(err), ou un wrapper).
- **Il y a DEUX chaînes, et c'est ce qui surprend tout le monde.** Express ne distingue pas un middleware normal d'un gestionnaire d'erreurs par un enregistrement particulier : il regarde **le nombre de paramètres de ta fonction**. Trois paramètres `(req, res, next)` → chaîne normale. Quatre `(err, req, res, next)` → chaîne d'erreurs, qui ne s'active QUE si quelqu'un a appelé `next(quelqueChose)`. Conséquence directe et déroutante : supprimer le paramètre `next` inutilisé de ton gestionnaire d'erreurs — un geste que ton éditeur te suggérera — le fait passer à trois paramètres, donc le transforme silencieusement en middleware ordinaire. Il ne s'exécutera plus jamais sur une erreur, sans le moindre avertissement. C'est la raison n°1 des gestionnaires d'erreurs « qui ne se déclenchent pas ».
- **`next()` contre `next(err)`** : `next()` sans argument passe au maillon suivant de la chaîne normale. `next(err)` **saute** tous les maillons normaux restants et va directement au premier gestionnaire à quatre paramètres. C'est pourquoi celui-ci doit être déclaré en dernier : il n'est pas « le dernier appelé », il est le premier de l'autre chaîne, et Express cherche cette chaîne à partir de la position courante.
- **`httpError`, utilisé plus bas, n'a rien de magique** : c'est une fonction à toi, trois lignes, qui fabrique une `Error` en lui accrochant un `status` et un drapeau `expose` disant si le message peut être montré au client. C'est tout ce qui sépare une erreur métier lisible d'un 500 opaque — et c'est écrit par toi, pas fourni par le framework.

## 🔧 Exemple simple
```js
app.use(express.json());                            // guichet parsing
app.use((req, res, next) => {                       // guichet journal
  req.id = crypto.randomUUID(); next();
});
app.get('/livres/:id', getLivre);                   // route
app.use((err, req, res, next) => {                  // guichet erreurs (DERNIER)
  if (err.expose) return res.status(err.status).json({ error: err.message });
  console.error(req.id, err);                       // bug : détail en interne
  res.status(500).json({ error: 'Erreur interne' });
});
```

## 🧭 Exemple guidé
**Énoncé** : la route « emprunter un livre » en 3 couches.
**Raisonnement** : la route traduit, le service décide, la data persiste.
**Solution** :
```js
// routes/loans.js — traduction HTTP uniquement
router.post('/', async (req, res, next) => {
  try {
    const { bookId, memberId } = valider(req.body);        // 400 si invalide
    const loan = await loanService.emprunter(bookId, memberId);
    res.status(201).json(loan);
  } catch (err) { next(err); }                              // vers le guichet erreurs
});
// services/loanService.js — la RÈGLE métier, testable sans HTTP
async function emprunter(bookId, memberId) {
  const livre = await books.parId(bookId);
  if (!livre) throw httpError(404, 'Livre inconnu');
  if (!livre.disponible) throw httpError(409, 'Déjà emprunté');
  return loans.creer(bookId, memberId);                     // transactionnel
}
```
**Explication** : le 409 (conflit métier) naît dans le SERVICE ; la route ne fait que traduire ; le middleware final formate. Chaque couche se teste isolément. **Variante** : écris le test du service avec un `books` fake en mémoire — zéro serveur nécessaire.

## 🤖 Exemple appliqué (IA / data / architecture)
DocSense expose `POST /questions` : la route valide et traduit ; le service orchestre retrieval + génération (avec timeout/retry) ; la data parle à la base vectorielle. Même squelette, composants IA à l'intérieur. Une API mal structurée rend tout ça intestable — la discipline commence ici.

## ⚠️ Erreurs fréquentes
- Logique métier dans les routes (intestable sans serveur).
- Oublier `next(err)` dans un handler async → erreur avalée, requête pendue.
- Middleware d'erreurs pas en dernier (il ne voit rien).
- Statuts imprécis (400 pour un conflit métier qui mérite 409).

## 🚫 Anti-patterns
- Le fichier `app.js` de 800 lignes qui fait tout.
- Valider « plus tard » (les frontières non gardées se paient en prod).

## ✍️ Mini-exercice
Dessine la chaîne complète de guichets d'une de tes APIs (dans l'ordre réel de déclaration), et vérifie que le gestionnaire d'erreurs est bien dernier.

## 🔥 Exercice plus difficile
Refactore une API « tout-dans-les-routes » en 3 couches, puis écris 5 tests du service SANS serveur (data fake) — le refactor est réussi si c'est facile.

## ✅ Correction attendue
La logique : chaîne ordonnée de middlewares, 3 couches étanches, validation aux frontières, erreurs centralisées sans fuite. Vérifie : aucune règle métier dans les routes, une erreur async atteint bien le guichet final (teste-le), les 10 requêtes malveillantes reçoivent des réponses propres.

## 🎤 Questions d'entretien
- « Qu'est-ce qu'un middleware Express ? » → Un maillon (req, res, next) d'une chaîne ordonnée ; il traite puis passe, ou répond.
- « Où mets-tu la logique métier et pourquoi ? » → Dans les services, purs → testables sans serveur, réutilisables.
- « Comment gères-tu les erreurs async ? » → try/catch + next(err) (ou wrapper) vers le middleware d'erreurs final.

## 🧾 À retenir
- L'ordre des middlewares EST le pipeline ; erreurs en dernier.
- Routes = traduction ; services = métier pur ; data = persistance isolée.
- Valider chaque frontière ; centraliser les erreurs ; jamais de fuite interne.

## 📚 Vocabulaire
**middleware / next** · **chaîne de traitement** · **routes/services/data** · **validation aux frontières** · **erreur opérationnelle vs bug** · **httpError / statut** · **wrapper async** · **testabilité**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je dessine la chaîne de middlewares de mon API de tête.
- [ ] Mes règles métier se testent sans lancer de serveur.
- [ ] Mes erreurs async atteignent le gestionnaire central (prouvé).

## 🔗 Liens avec le programme
Mois 3 (jours ~52-66), projets 2-3, API de DocSense. Leçons liées : `http-rest-json`, `api-design-basics`, `error-handling`, `testing-foundations`.
