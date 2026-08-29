<!-- keep -->
# Leçon — Concevoir une API

## 🌍 Le problème d'abord
Tu construis un service, et d'autres programmes doivent l'utiliser : ton application front,
l'appli mobile d'un collègue, un autre service, demain un client externe. Comment se
mettent-ils d'accord sur la façon de te parler — quelle adresse appeler, quoi envoyer, quoi
attendre en retour ? Si chacun devine, l'intégration devient un cauchemar et le moindre
changement casse tout le monde. Une **API** est ce point d'accord : un CONTRAT clair entre
ton système et ceux qui l'utilisent. Bien la concevoir, c'est penser d'abord à celui qui
l'utilisera. Cette leçon t'apprend à concevoir un contrat qu'on devine sans documentation et
qui survit aux évolutions.

## 🎯 Objectif
Savoir **concevoir le contrat** d'une API avant de coder : ressources et URLs, verbes HTTP,
statuts précis, format d'erreur uniforme, validation aux frontières, pagination — puis penser
son **évolution** sans casser les consommateurs.

## 🧩 Prérequis
Tu dois maîtriser HTTP (requête/réponse, méthodes, statuts, JSON) et le style REST
(`/doc/lessons/http-rest-json`), car concevoir une API, c'est appliquer ces briques avec
cohérence. La notion de changement compatible vs cassant
(`/doc/lessons/breaking-changes-compatibility`) éclaire la partie évolution. Aucune
expérience de conception d'API n'est supposée.

## 🧠 Modèle mental
Pense « CONTRAT avant code ». Une API est une promesse : pour telle requête (méthode +
adresse + corps), tu t'engages sur telle réponse (statut + forme). Comme tout contrat, il se
lit sans documentation quand il est cohérent, et le rompre (renommer, supprimer) casse ceux
qui s'appuient dessus. Concevoir une API, c'est donc un exercice d'EMPATHIE : se mettre à la
place du consommateur (humain, service, ou même un modèle de langage) et lui offrir des
règles prévisibles.

## 💡 Pourquoi c'est important
Une API est un CONTRAT entre ton système et ses consommateurs (front, autres services, clients). Un bon contrat se devine sans documentation, survit aux évolutions et protège des erreurs ; un mauvais contrat se paie à chaque intégration, pour toujours (le changer casse les clients). Concevoir une API est un exercice d'EMPATHIE technique : penser comme celui qui l'utilisera — et c'est une question d'entretien récurrente (« design une API pour un blog »).

## Explication complète

### Le design AVANT le code
Le contrat s'écrit d'abord (endpoints, verbes, statuts, corps, erreurs) : coder puis documenter produit des APIs incohérentes ; PROMETTRE d'abord force la cohérence, et la collection Postman devient le vérificateur de la promesse.

### Les règles de conception REST
1. **Ressources = noms au pluriel** : `/livres`, `/livres/42`, `/livres/42/emprunts` (sous-ressource). Le verbe HTTP porte l'action — jamais l'URL.
2. **Statuts précis** : 201 + objet créé (POST), 204 (DELETE), 400 + détails (entrée invalide), 404 (absent), 409 (conflit métier : « déjà emprunté »). Le statut est de l'INFORMATION programmable.
3. **Cohérence absolue** : mêmes conventions de nommage, même format d'erreur, même pagination PARTOUT. La cohérence est plus précieuse que l'élégance locale.
4. **Format d'erreur unique** : `{ "error": { "message": "...", "details": [...] } }` — le client écrit UN gestionnaire d'erreurs, pas dix.
5. **Pagination, filtres, tri en query string** : `?page=2&limit=20&genre=sf&sort=-date`. Prévois la pagination DÈS le début (l'ajouter après casse les clients).

### La validation : la douane de l'API
Toute entrée est hostile jusqu'à validation : présence, type, bornes, format — à CHAQUE porte d'entrée. Le refus est utile : 400 avec la liste complète des problèmes (pas juste le premier). Et la validation vit à la frontière (middleware/début de route), pas éparpillée dans la logique.

### Les erreurs : centralisées, sans fuite
Un middleware d'erreurs final distingue :
- l'erreur **opérationnelle** (attendue) : ressource absente → 404, conflit → 409 — on informe précisément ;
- le **bug** (inattendu) : on logge les détails EN INTERNE, on répond un 500 générique. Les stack traces ne sortent JAMAIS (sécurité).

### L'évolution : penser au jour 2
Une API vit : nouveaux champs (ajout non cassant — les clients ignorent l'inconnu), champs supprimés/renommés (CASSANT → versionner `/v2` ou déprécier progressivement). Règle : être libéral sur ce qu'on accepte en plus, strict sur ce qu'on promet.

## Concepts clés
Contrat d'abord · ressources et sous-ressources · statuts sémantiques (dont 409) · format d'erreur uniforme · validation aux frontières · erreurs centralisées sans fuite · pagination/filtres/tri · idempotence · versionnement · moindre exposition (ne renvoyer que le nécessaire).

## 🧭 Exemple guidé

Une bibliothèque veut exposer l'emprunt d'un livre. C'est le cas intéressant : ce n'est pas
« créer une fiche », c'est une action métier avec des règles. Tu écris un premier jet en
trente secondes, comme tout le monde :

```
POST /livres/42/emprunter    { membreId: 7 }
→ 200 OK
```

Ça se lit très bien. Et c'est en le faisant lire à celui qui va l'utiliser — le développeur
de l'appli mobile — que le contrat se met à parler. Il pose quatre questions. Chacune est
une décision de conception que le premier jet avait esquivée.

**« C'est quoi, l'objet que je viens de créer ? »** Il en a besoin : il veut afficher une
date de retour, et plus tard permettre d'annuler. Le premier jet ne lui renvoie rien —
`200 OK` dit « c'est fait », pas « voilà quoi ». Or il *s'est* passé quelque chose de
durable : il existe maintenant un emprunt, avec une date, une échéance, un état. Cet objet
mérite un nom et une adresse. Donc `POST /emprunts { livreId, membreId }` qui répond
`201` avec `{ id: 991, livreId: 42, membreId: 7, echeanceLe: "2026-09-19" }`. La règle
n'est pas « pas de verbes dans les URLs » par esthétique : c'est que la plupart des verbes
métier cachent un nom qu'on n'a pas encore nommé. Quand tu trouves ce nom, l'annulation
(`DELETE /emprunts/991`) et la consultation (`GET /membres/7/emprunts`) deviennent gratuites.

**« Et si le livre est déjà emprunté ? »** Le réflexe est `400`. Il est faux, et c'est
subtil : la requête est parfaitement bien formée. Le `livreId` existe, le `membreId` existe,
les types sont bons. Ce n'est pas *ce qu'il a envoyé* qui pose problème, c'est *l'état du
monde au moment où il l'envoie*. Un `400` dit au client « corrige ta requête » — il ne peut
pas, elle est correcte. `409 Conflict` dit « ta requête est valide mais elle entre en
conflit avec l'état actuel », ce qui déclenche la bonne réaction côté mobile : ne pas
réessayer à l'identique, afficher « déjà emprunté ». Note bien la ligne de partage, elle
resservira partout : **400/422 = le client doit changer sa requête ; 409 = le client doit
attendre ou changer de scénario ; 404 = il doit changer d'adresse.**

**« Si je double-clique, j'ai deux emprunts ? »** Silence gêné. Oui. `POST` n'est pas
idempotent : deux appels identiques créent deux ressources. Sur un réseau mobile, ce n'est
pas un cas rare — la requête part, la réponse se perd, l'appli réessaie, et le membre a
emprunté le même livre deux fois. Trois sorties, et il faut choisir explicitement. (a) Le
serveur détecte le doublon métier : un membre ne peut pas avoir deux emprunts ouverts sur le
même livre → le second appel repart en `409`, ce qui est correct et gratuit ici. (b) Le
client fournit une clé : en-tête `Idempotency-Key` (convention largement adoptée, pas un
standard HTTP), et le serveur rejoue la même réponse pour la même clé. (c) On ne fait rien
et on documente. On retient (a) : la contrainte métier existe déjà, autant s'en servir. Mais
tu remarques que (a) marche parce que la règle métier a la bonne forme — sur un `POST
/paiements`, elle ne l'aurait pas, et il faudrait (b).

**« Comment je rends le livre ? »** `POST /emprunts/991/rendre` revient au verbe. En
appliquant ce qu'on vient de faire, deux réponses tiennent : `PATCH /emprunts/991
{ etat: "rendu" }`, ou `POST /emprunts/991/retours` — un retour est, lui aussi, un objet
avec une date. Les deux sont défendables ; ce qui ne l'est pas, c'est d'en choisir une ici
et l'autre pour la prolongation.

Le contrat final n'est pas plus long que le premier jet. Il est simplement passé par
quelqu'un qui allait s'en servir. C'est tout ce que veut dire « empathie technique » :
non pas être gentil, mais tester le contrat contre les questions qu'un consommateur pose
forcément.

**Variante qui déplace le problème.** Ajoute une file d'attente : si le livre est pris, on
réserve. Le `409` devient discutable — le service *peut* faire quelque chose de la requête.
Faut-il un `202 Accepted` avec une réservation créée ? Ou garder `409` et exiger un appel
explicite à `POST /reservations` ? Le second, sauf demande contraire : une API qui fait
silencieusement autre chose que ce qu'on lui a demandé est ingérable côté client. Un statut
d'erreur n'est pas un échec du design — c'est souvent l'endroit où l'API refuse de décider
à la place de son utilisateur.

## ⚠️ Erreurs fréquentes
- Verbes dans les URLs (`/getLivres`, `/creerLivre`) : le contrat devient une liste de fonctions ad hoc.
- 400 pour tout (y compris les conflits métier → 409 et les absences → 404) : le client ne peut plus distinguer.
- Renvoyer l'objet interne complet (mot de passe hashé, champs techniques) : ne renvoyer QUE le nécessaire.
- Oublier la pagination sur les collections : la liste de 100 000 éléments finira par arriver.

## 🔗 Liens avec le programme
Tes systèmes IA SONT des APIs : DocQA expose `POST /questions`, DocSense `POST /documents/analyze`. Le function calling des LLM (mois 8) est... de la conception d'API : décrire précisément des outils (nom, paramètres, types) pour qu'un consommateur (le modèle !) les utilise correctement — les mêmes qualités de contrat s'appliquent. Et une API bien conçue est ce qui rend ton portfolio testable en 5 minutes par un recruteur.

## Mini-exercice
Conçois sur papier le contrat complet d'une API de blog : articles, commentaires, tags, brouillons vs publiés. Endpoints, verbes, statuts (y compris : commenter un article inexistant ? publier un brouillon déjà publié ?), format d'erreur, pagination. Puis fais-le critiquer (ou critique-le toi-même 24 h plus tard).

## ✅ Correction attendue
**La démarche** : lister les ressources (articles, commentaires, tags), puis les relations (un commentaire appartient à un article → sous-ressource `/articles/12/commentaires`), puis les états (brouillon / publié), et seulement ensuite les endpoints. Les deux questions piégées de l'énoncé se traitent par le statut : commenter un article inexistant → **404** (la ressource parente n'existe pas) ; publier un brouillon déjà publié → **409** (la requête est bien formée, c'est l'état qui s'y oppose).

**L'erreur probable, et elle vient d'une bonne intention.** Le statut « publié » se modélise presque toujours comme un endpoint dédié : `POST /articles/12/publier`. C'est expressif, ça se lit bien, et ça viole la règle que la leçon vient d'énoncer — un verbe dans l'URL. Le piège séduit parce qu'on a un vrai problème : *publier* n'est pas *modifier*, il y a une transition, des règles, peut-être un e-mail à envoyer. « Mettre à jour un champ » semble trahir cette richesse.

Deux sorties honnêtes, et il faut savoir les défendre. Soit on modélise l'ÉTAT : `PATCH /articles/12 { statut: "publie" }`, et le serveur refuse en 409 les transitions interdites — cohérent avec le reste de l'API, et le client n'a rien de nouveau à apprendre. Soit on modélise la TRANSITION comme une ressource : `POST /articles/12/publications`, ce qui reste un nom, et donne en prime un historique des publications si on en a besoin un jour.

**Ce qu'il ne faut pas faire, en revanche, c'est mélanger les deux dans la même API.** Un consommateur qui a compris `PATCH` pour le statut d'un article ne devinera jamais `POST /commentaires/5/approuver`. C'est le sens de « la cohérence prime sur l'élégance locale » : le second endpoint, isolé, est peut-être plus joli ; l'ensemble est plus coûteux à intégrer.

**Alternative défendable** : ne pas exposer de sous-ressource du tout et tout mettre à plat (`GET /commentaires?articleId=12`). Plus simple à implémenter, et c'est le bon choix si les commentaires se consultent aussi indépendamment des articles. La hiérarchie d'URL n'est pas une vertu, c'est une affirmation sur la manière dont les données sont réellement consultées.

**Vérifie seul, sans corrigé** :
1. Fais lire ton contrat par quelqu'un — ou par toi 24 h plus tard — et demande de DEVINER l'URL pour « les commentaires du troisième article ». Si la personne se trompe, l'API n'est pas prévisible.
2. Compte tes formats d'erreur. Il doit y en avoir **un**.
3. Cherche un verbe dans tes URLs. S'il y en a, choisis explicitement l'une des deux sorties ci-dessus, et applique-la partout.
4. Pour chaque collection, demande-toi ce qui se passe à 100 000 éléments. Si tu n'as pas de réponse, il manque la pagination — et l'ajouter plus tard cassera tes clients.

## 🏢 Cas professionnel
Une API renvoie l'objet utilisateur complet sur `GET /utilisateurs/42`, tel qu'il sort de la base : `email`, `motDePasseHash`, `role`, `interne_score_fraude`. Le front n'affiche que le nom, donc personne ne s'en inquiète pendant deux ans.

Le jour où l'API s'ouvre à un partenaire, trois problèmes arrivent ensemble. Le hash de mot de passe est exposé à un tiers. Le score de fraude interne, qui n'aurait jamais dû sortir, devient une donnée que le partenaire commence à utiliser — et donc un engagement de fait. Et l'équipe qui veut renommer une colonne découvre qu'elle ne le peut plus : la structure de sa base est devenue son contrat public, sans que personne ne l'ait jamais décidé.

C'est le sens exact de « moindre exposition ». Ce n'est pas d'abord une règle de sécurité — c'est une règle de **liberté** : tout champ qu'on expose devient une promesse qu'on ne peut plus retirer sans casser quelqu'un. Une API qui renvoie une projection explicite (`{ id, nom, inscritLe }`) laisse sa base évoluer librement ; une API qui renvoie ses lignes de base a signé un contrat qu'elle n'a pas lu.

## 🎤 Questions d'entretien
- « Design une API pour un blog. » → Commence par les ressources et les relations, pas par les endpoints. Nomme les états, les statuts d'erreur, le format d'erreur unique, et mentionne la pagination sans qu'on te la demande.
- « Où mets-tu la validation ? » → À la frontière, en entrée, avant toute logique — et elle renvoie la liste complète des problèmes, pas seulement le premier.
- « Comment fais-tu évoluer une API sans casser tes clients ? » → Ajouter est sûr, retirer et renommer ne le sont pas. On ajoute, on déprécie avec un délai annoncé, on versionne quand la rupture est inévitable.
- « 404 ou 409 ? » → 404 si la ressource visée n'existe pas ; 409 si elle existe mais que son état interdit l'opération. La distinction permet au client de savoir s'il doit corriger son adresse ou son scénario.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Quelqu'un peut deviner mes URLs sans documentation.
- [ ] J'ai un seul format d'erreur, et un seul endroit qui le produit.
- [ ] Je ne renvoie que les champs choisis, jamais l'objet de base tel quel.
- [ ] Je sais dire, pour chaque endpoint, ce qui est un ajout sûr et ce qui casserait un client.

## 📚 Vocabulaire
**contrat** · **endpoint** · **ressource / sous-ressource** · **payload** · **validation** · **erreur opérationnelle vs bug** · **pagination** · **versionnement** · **rétrocompatibilité** · **moindre exposition**.

## 🧾 À retenir
Une API se conçoit contrat d'abord : ressources nommées, verbes HTTP sémantiques, statuts précis, format d'erreur unique, validation à chaque porte, erreurs centralisées sans fuite interne, pagination prévue dès le début. La cohérence prime sur l'élégance, et chaque décision pense au consommateur — humain, service, ou modèle de langage.
