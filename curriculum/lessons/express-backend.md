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
contrat d'API (`/doc/lessons/api-design-basics`) et l'asynchrone en JavaScript
(`/doc/lessons/async-javascript`). La notion de code lisible en couches
(`/doc/lessons/clean-code`) est réutilisée ici.

Ce que tu dois savoir de la **gestion d'erreurs** pour lire cette leçon tient en une
distinction : une erreur *attendue* — une saisie invalide, une ressource absente — est un cas
normal du programme, qu'on traite et qu'on renvoie avec le bon code ; une erreur *inattendue*
est un défaut, qu'on ne masque pas et qu'on laisse remonter jusqu'à un endroit unique qui
journalise et répond `500`. C'est cette distinction qui décide de ce qui va dans une route et
de ce qui va dans le gestionnaire d'erreurs — et la leçon la met en œuvre pas à pas.

> **Où trouver le détail.** `/doc/lessons/error-handling` traite la conception complète d'une
> stratégie d'erreurs. Elle est **programmée deux jours plus loin** ; rien ici ne suppose que
> tu l'as lue.

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

## ✅ Correction

> Les résultats de la première section sont **mesurés** : le script
> `scripts/v70-verifications/express-erreur-async.mjs` démarre un vrai serveur, envoie de
> vraies requêtes, et imprime ce que le client reçoit — sur Express 4 **et** sur Express 5.

### La démarche

Dans l'ordre, et l'ordre compte :

1. **Vérifier que la chaîne est complète** — le gestionnaire d'erreurs est-il vraiment le
   dernier maillon déclaré ?
2. **Vérifier que les erreurs y arrivent** — c'est une question différente de la précédente,
   et c'est celle que presque personne ne teste.
3. **Vérifier ce qu'elles y deviennent** — statut correct, et aucun détail interne qui sorte.
4. **Vérifier que les couches sont étanches** — le service se teste-t-il sans serveur ?

Le point 2 mérite qu'on s'y arrête, parce qu'il produit la panne la plus déroutante du
développement backend.

### Le test que presque personne ne fait

Quatre routes, un gestionnaire d'erreurs final, et une question simple : **le client
reçoit-il quelque chose ?**

| Route | Ce qu'elle fait |
|---|---|
| `/sync` | `throw` synchrone dans le gestionnaire |
| `/async` | gestionnaire `async` dont la promesse rejette, **sans** `try/catch` |
| `/async-ok` | le même, avec `try/catch` + `next(err)` |
| `/apres` | envoie la réponse, **puis** appelle `next(err)` |

Résultats mesurés :

| Route | Express 4 | Express 5 |
|---|---|---|
| `/sync` | `500 {"erreur":"Erreur interne"}` | `500 {"erreur":"Erreur interne"}` |
| `/async` | **AUCUNE RÉPONSE** — la requête reste suspendue | `500 {"erreur":"Erreur interne"}` |
| `/async-ok` | `500 {"erreur":"Erreur interne"}` | `500 {"erreur":"Erreur interne"}` |
| `/apres` | `200 {"ok":true}` puis erreur dans le guichet | idem |
| guichet atteint pour | `/sync`, `/async-ok`, `/apres` | `/sync`, `/async`, `/async-ok`, `/apres` |
| rejets de promesse non gérés | **`['panne async']`** | `[]` |

### Ce que dit la ligne `/async` sur Express 4

Le gestionnaire d'erreurs **n'est jamais atteint**, et le client ne reçoit **rien du tout** —
pas un 500, pas un 502 : la connexion reste ouverte jusqu'à ce que quelqu'un abandonne.

La raison est mécanique. Express 4 entoure l'appel du gestionnaire d'un `try/catch`
**synchrone**. Un `throw` synchrone est attrapé ; un rejet de promesse survient plus tard, à
un moment où ce `try/catch` est terminé depuis longtemps. Personne n'attrape rien, personne
n'appelle `next`, et la requête n'a plus de suite.

Et la mesure ajoute un second effet, plus grave : la ligne `rejets de promesse non gérés`
contient `panne async`. Sur les versions récentes de Node, un rejet non géré **termine le
processus** par défaut. Autrement dit, cette route ne se contente pas de suspendre une
requête : elle peut faire tomber le serveur pour tous les autres utilisateurs.

C'est pourquoi le motif suivant existe dans presque tous les projets Express 4 :

```js
const asyncH = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
app.get('/commandes', asyncH(async (req, res) => { /* … */ }));
```

Cinq mots utiles : *transformer un rejet en appel à `next`*. Sans ce genre d'enveloppe — ou
sans un `try/catch` explicite comme dans `/async-ok` — la chaîne de guichets ne sert à rien
pour tout ce qui est asynchrone, c'est-à-dire pour l'essentiel d'une API.

**Sur Express 5, le comportement a changé** : les rejets sont acheminés vers le gestionnaire
d'erreurs, et l'enveloppe devient inutile. C'est une différence de version, pas une question
de style — et c'est exactement le genre de chose qu'il faut vérifier plutôt que supposer, car
un tutoriel écrit pour l'une des deux versions donne un conseil faux pour l'autre.

### Ce que dit la ligne `/apres`

Le client reçoit `200 {"ok":true}`. La réponse était déjà partie quand l'erreur est survenue ;
le gestionnaire d'erreurs s'exécute bien, mais il ne peut plus rien écrire.

Sans précaution, il tente d'envoyer un 500 et provoque `ERR_HTTP_HEADERS_SENT` — une seconde
erreur, dans le code censé traiter les erreurs. D'où le réflexe qui manque presque toujours :

```js
app.use((err, req, res, next) => {
  journaliser(err, { chemin: req.path, requete: req.id });
  if (res.headersSent) return next(err);   // trop tard : Express coupera la connexion
  res.status(err.statut || 500).json({ erreur: err.public || 'Erreur interne' });
});
```

Et la leçon plus générale : **le client a déjà reçu un succès alors que l'opération a échoué.**
Quand une action est réellement importante — un paiement, une écriture en base — la réponse
ne doit partir qu'**après** que tout ait abouti, jamais avant.

### La réponse envoyée au client

Trois propriétés, dans les mesures ci-dessus :

- **un statut correct** : 500 pour un bug, et non un 200 avec `{ "erreur": … }` dans le corps.
  Un client, un cache, une supervision lisent le statut ;
- **aucun détail interne** : `{"erreur":"Erreur interne"}`. Pas de trace d'appels, pas de
  message d'exception SQL, pas de chemin de fichier. Une trace d'appels renseigne un attaquant
  sur ta version, tes bibliothèques et ta structure ;
- **le détail existe malgré tout — dans le journal.** L'erreur n'est pas perdue, elle est
  envoyée là où l'on peut la lire sans la publier. Avec un identifiant de requête, qu'on peut
  donner au client : « erreur interne, référence a3f9 » permet de retrouver la trace exacte.

### Les trois couches, et le test qui les valide

```
route (HTTP)      → lit la requête, valide la forme, appelle le service, renvoie le statut
service (métier)  → applique les règles, ne connaît ni req ni res
dépôt (données)   → parle à la base, ne connaît aucune règle métier
```

Le critère d'étanchéité n'est pas esthétique, il est vérifiable en une phrase : **puis-je
tester le service sans démarrer de serveur HTTP ?**

```js
// aucun serveur, aucune base : des données fabriquées
const service = creerServiceCommandes({ depot: depotFactice });
assert.rejects(() => service.annuler('cmd-1', { role: 'lecteur' }), /interdit/);
```

Si ce test exige un `req` ou un `res`, c'est que du HTTP a fui dans le métier. Si le test d'une
règle métier exige une base de données, c'est que la règle vit dans le dépôt.

L'exercice demandait cinq tests du service sans serveur : **s'ils ont été faciles à écrire, le
découpage est réussi ; s'ils ont été pénibles, le découpage ne l'est pas.** La difficulté du
test est ici la mesure, pas une conséquence de la mesure.

### La mauvaise solution plausible

Attraper les erreurs dans chaque route et y répondre sur place :

```js
app.get('/commandes/:id', async (req, res) => {
  try { res.json(await service.lire(req.params.id)); }
  catch (e) { res.status(500).json({ erreur: e.message }); }   // ⚠️
});
```

Ça fonctionne, et ça pose trois problèmes qui apparaissent tous plus tard :

1. **`e.message` part chez le client.** Un jour, ce message contiendra le nom d'une table ou
   une chaîne de connexion ;
2. **le format des erreurs diverge** entre les routes, parce que chacune est écrite un jour
   différent. Les clients de l'API doivent gérer plusieurs formes ;
3. **une route oubliée n'a plus aucun filet** — et il n'y a aucun moyen de savoir lesquelles
   sont couvertes sans les relire toutes.

Le guichet unique final résout les trois d'un coup : un seul endroit qui décide du format, du
statut et de ce qui sort. Les routes se contentent de **signaler**, avec `next(err)`.

### Auto-évaluation

| Vérification | Comment |
|---|---|
| le gestionnaire d'erreurs est atteint pour l'async | provoque un rejet dans une vraie route, et regarde ce que reçoit le client |
| aucune fuite | provoque une erreur SQL et lis le corps de la réponse : contient-il un mot de ton schéma ? |
| couches étanches | un test de service qui n'importe ni `express` ni le pilote de base |
| ordre de la chaîne | le gestionnaire d'erreurs est la **dernière** ligne `app.use` du fichier |
| réponse déjà envoyée | une route qui répond puis échoue ne doit pas produire de seconde erreur |

### Généralisation

La chaîne de guichets d'Express est un cas particulier d'un motif qu'on retrouve partout :
intercepteurs HTTP, filtres de servlets, pipeline de traitement de messages, chaîne de
handlers d'un ordonnanceur. À chaque fois, deux propriétés décident de tout : **l'ordre de
déclaration** et **ce qui a le droit d'interrompre la chaîne**.

Et à chaque fois, la même question se pose et se teste de la même façon : *ce filet attrape-t-il
vraiment ce qu'il est censé attraper ?* La réponse ne se lit pas dans le code — Express 4 et
Express 5 ont exactement le même code de gestionnaire d'erreurs, et deux comportements
opposés. Elle se mesure en provoquant la panne.

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
