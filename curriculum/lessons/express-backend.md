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
- **Async, et la réponse dépend de ta version** : sur **Express 4**, une promesse rejetée dans un handler n'est reliée à rien — Express ne regarde pas la valeur de retour. Node la traite en rejet non géré et, depuis Node 15, **arrête le processus** : le client ne reçoit pas une erreur, il perd le serveur. D'où la discipline `try/catch` + `next(err)`, ou un wrapper qui l'applique à toutes les routes. Sur **Express 5**, le framework attend lui-même la promesse et l'achemine vers la chaîne d'erreurs : le `try/catch` devient superflu. Les deux versions coexistent largement en entreprise ; vérifie laquelle tu as avant d'appliquer la règle, et sache expliquer la différence.
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

Ton API d'emprunts tourne en recette. Un collègue signale deux comportements qui n'ont
apparemment rien à voir : parfois le bouton « Emprunter » tourne indéfiniment ; parfois il
affiche un gros pavé rouge illisible. Tu as un gestionnaire d'erreurs central, écrit et
testé. Il n'apparaît dans aucun des deux cas.

**Par quoi commencer.** Le pavé rouge, sans hésiter — pas parce qu'il est plus fréquent,
mais parce qu'un texte inattendu qui arrive jusqu'au navigateur est un problème de sécurité
avant d'être un problème de confort. Tu le reproduis et tu regardes le corps de la réponse
brute, pas l'affichage : `500`, environ 1,8 ko, et dedans le message d'erreur *et la pile
d'appels complète* — chemins de fichiers du serveur, noms de modules internes. Exactement
ce que la leçon interdit de laisser sortir.

Première déduction, et c'est elle qui compte : **ce n'est pas ton gestionnaire qui a
répondu**. Le tien renvoie 26 octets, `{"error":"Erreur interne"}`. Une pile d'appels dans
le corps, c'est la signature du gestionnaire d'erreurs *par défaut* d'Express — celui qui
s'exécute quand aucun des tiens n'a pris l'erreur. Ta question passe donc de « pourquoi
mon message est-il moche ? » à « pourquoi mon gestionnaire n'a-t-il pas été appelé ? ».

Tu ouvres le fichier. Trois semaines plus tôt, l'éditeur a signalé `next` comme paramètre
inutilisé et quelqu'un l'a retiré :

```js
app.use((err, req, res) => res.status(500).json({ error: 'Erreur interne' }));
```

C'est la bascule décrite plus haut : Express reconnaît la chaîne d'erreurs **à l'arité**.
Trois paramètres, ce n'est plus un gestionnaire d'erreurs — c'est un middleware ordinaire
qui ne sera jamais atteint, puisque `next(err)` saute la chaîne normale. Aucun avertissement
au démarrage, aucun test rouge : la route répond toujours 500, seul le corps a changé. Remets
le quatrième paramètre, le corps repasse à 26 octets.

**La décision qui suit est moins évidente.** On pourrait s'arrêter là. Mais la vraie question
est : *pourquoi une pile d'appels était-elle imprimable ?* Le gestionnaire par défaut d'Express
ne renvoie la pile que si `NODE_ENV` ne vaut pas `production` — passe-le à `production` et le
même appel renvoie 148 octets sans pile. La recette n'avait donc pas la même configuration
que la production. Deux corrections, deux niveaux : l'arité, c'est le bug ; `NODE_ENV`, c'est
ce qui a transformé un bug en fuite d'information. Corrige les deux, et note que la seconde
protège aussi tous les bugs que tu n'as pas encore écrits.

**Le second symptôme, la requête qui ne revient jamais.** Deux causes possibles, et elles ne
se distinguent pas depuis le navigateur : soit un middleware ne rappelle jamais `next()` et
la requête reste bloquée au guichet, soit le handler `async` a rejeté et l'erreur a disparu.
Le test qui tranche ne coûte rien : regarde si le **processus serveur est encore vivant**.

- S'il tourne toujours : c'est un `next()` manquant. La requête est suspendue, le client
  attendra jusqu'à son propre délai d'expiration.
- S'il a disparu : c'est le handler `async`. Sur **Express 4**, une promesse rejetée dans un
  handler n'est reliée à rien ; Node la voit comme un rejet non géré et, depuis Node 15,
  **tue le processus**. Le client n'a pas une erreur : il n'a plus de serveur. C'est là toute
  la raison d'être du `try { … } catch (err) { next(err) }` — pas la propreté, la survie.
- Nuance à connaître, parce qu'elle change la réponse en entretien : **Express 5 attrape
  lui-même les promesses rejetées** et les envoie à la chaîne d'erreurs. Le `try/catch`
  devient inutile. Vérifie donc ta version avant de recopier une règle : ici, la même ligne
  de code est indispensable dans un cas et superflue dans l'autre.

**Ce que l'incident dit de la structure.** Ces deux bugs vivent dans la plomberie HTTP, et
c'est pour ça qu'ils ont été si longs à trouver : la règle métier, elle, était juste. Si
`emprunter(livreId, membreId)` avait été une fonction de service testable sans serveur, la
recherche aurait commencé bien plus vite — on aurait su en trente secondes que le métier
était innocent, et on aurait cherché dans la chaîne dès le début.

```js
// routes/emprunts.js — traduction HTTP uniquement
router.post('/', async (req, res, next) => {
  try {
    const { livreId, membreId } = valider(req.body);   // 400 si invalide
    res.status(201).json(await empruntService.emprunter(livreId, membreId));
  } catch (err) { next(err); }                          // vers le guichet erreurs
});

// services/empruntService.js — la RÈGLE, testable sans HTTP
async function emprunter(livreId, membreId) {
  const livre = await livres.parId(livreId);
  if (!livre) throw httpError(404, 'Livre inconnu');
  if (!livre.disponible) throw httpError(409, 'Déjà emprunté');
  return emprunts.creer(livreId, membreId);
}
```

Le `409` naît dans le service, la route ne fait que traduire, le middleware final formate.
Découper en couches ne rend pas le code plus joli : ça rend les pannes **localisables**.

**Variante qui déplace le problème.** Ton gestionnaire d'erreurs est bien atteint… mais la
route avait déjà appelé `res.json()` avant de signaler l'erreur. Sa tentative de répondre
lève alors `ERR_HTTP_HEADERS_SENT`, et le client, lui, conserve la première réponse : il
reçoit **200 `{"premier":true}`** pour une requête qui a échoué. C'est le pire des cas —
une panne silencieuse côté client, visible seulement dans les journaux du serveur. La chaîne
suppose qu'un seul guichet répond ; dès qu'un maillon répond *puis* continue, le modèle
mental ne tient plus. D'où `res.headersSent`, à tester dans le gestionnaire avant d'écrire —
et surtout la règle qu'il protège : dans un maillon, on répond **ou** on passe la main,
jamais les deux.

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
