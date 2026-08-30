<!-- keep -->
# Leçon — Architecture logicielle : les bases

## 🌍 Le problème d'abord
Un petit projet tient dans ta tête. Mais dès qu'il grossit — plus de fonctionnalités, plus de
code, plus de gens qui y touchent — chaque modification devient risquée : changer l'affichage
casse une règle métier, changer la base casse l'interface, et personne n'ose plus rien
toucher. L'**architecture logicielle** répond à ce problème : comment ORGANISER un système
pour qu'il reste modifiable quand il grandit et que les besoins changent ? Il n'y a pas
d'« architecture parfaite » universelle — seulement des façons d'isoler ce qui change pour des
raisons différentes, chacune avec ses compromis. Cette leçon te donne la grille pour
raisonner ces choix, y compris en entretien de design système.

## 🎯 Objectif
Comprendre le principe directeur (isoler ce qui change pour des raisons différentes derrière
des frontières explicites), connaître les découpages fondamentaux (couches, MVC, hexagonal,
monolithe modulaire, microservices, event-driven) comme des **compromis**, et savoir mener une
conception : clarifier → schématiser → arbitrer → anticiper l'échelle et les pannes.

## 🧩 Prérequis
Tu dois avoir intégré le clean code (responsabilité unique, dépendances,
`/doc/lessons/clean-code`) et les design patterns, notamment l'inversion de dépendance
(`/doc/lessons/design-patterns-intro`), car l'architecture applique ces idées à l'échelle d'un
système entier. Une notion de client/serveur et d'API aide (`/doc/lessons/http-rest-json`).
Le vocabulaire d'architecture (couplage, port, ADR) est construit ici.

## 🧠 Modèle mental
Architecturer, c'est répondre à une question par des frontières : « qu'est-ce qui change pour
des raisons DIFFÉRENTES, et comment l'isoler pour qu'un changement n'en entraîne pas dix ? ».
L'UI change pour l'ergonomie, les règles métier pour le business, le stockage pour la
technique : les mélanger fait payer chaque évolution au triple. Chaque style d'architecture
est une façon plus ou moins raffinée d'appliquer cette idée — et un COMPROMIS (jamais un
dogme) qu'on justifie par les contraintes réelles du projet.

## 💡 Pourquoi c'est important
L'architecture est l'art d'organiser un système pour qu'il reste MODIFIABLE : les besoins changent, les technologies changent, l'équipe change — seul un système bien découpé survit à bas coût. C'est aussi l'entretien décisif des rôles AI Engineer (« conçois un système d'analyse de documents ») : on n'y évalue pas une bonne réponse (il n'y en a pas) mais un RAISONNEMENT — clarifier, structurer, arbitrer.

## Explication complète

### Isoler ce qui change : en détail
Tout le reste en découle. L'UI change pour des raisons d'ergonomie, les règles métier pour des raisons business, le stockage pour des raisons techniques : les mélanger, c'est payer chaque changement au triple. Les découpages classiques sont des façons de plus en plus raffinées d'appliquer cette idée.

### Les découpages fondamentaux
- **3-tiers** : présentation / logique métier / données. Chaque couche ne parle qu'à sa voisine. C'est ton front → API → SQLite depuis le mois 3.
- **MVC** organise la présentation : Modèle (données + logique), Vue (rendu), Contrôleur (orchestration des actions). Tes routes Express sont des contrôleurs.
- **Clean / hexagonale (ports & adapters)** : le CŒUR métier au centre, sans dépendance à rien de concret ; les détails (UI, DB, LLM, vector store) branchés via des **ports** (interfaces) et des **adapters** (implémentations). Le test de vérité : « changer de base de données = changer UN fichier ». Ton interface `Store` du projet 1 en était le germe.
- **Monolithe modulaire** : UN déploiement, des modules à frontières nettes dedans. Le bon défaut pour 90 % des projets — dont DocSense.
- **Microservices** : des services déployés indépendamment. Puissants (équipes autonomes, scaling ciblé) mais au prix ÉLEVÉ du distribué : réseau faillible, cohérence difficile, observabilité complexe. À justifier, jamais par défaut.
- **Event-driven** : les composants réagissent à des ÉVÉNEMENTS via un bus/broker. Découplage maximal (l'émetteur ignore les consommateurs), raisonnement plus dur (qui a traité quoi, quand ?).

### Les briques transverses
- **Queue** : découple producteur et consommateur, absorbe les pics, permet l'asynchrone (« traite ces 500 documents quand tu peux »).
- **Cache** : échange de la fraîcheur contre de la vitesse. Ses deux problèmes DIFFICILES : l'invalidation, le nommage.
- **Auth / authz** : QUI es-tu (authentification) / QU'AS-TU le droit de faire (autorisation) — deux questions distinctes.
- **Observabilité** : logs (événements), métriques (agrégats), traces (le parcours d'UNE requête via un correlation id). Sans elle, la production est une boîte noire.
- **Résilience** : timeouts, retries (sur les opérations idempotentes !), circuit breakers, dégradation gracieuse — le réseau ÉCHOUE, le design doit le prévoir.
- **Scalabilité** : verticale (machine plus grosse) vs horizontale (plus de machines — exige du stateless).

### La méthode de conception (l'entretien en 4 étapes)
1. **Clarifier** : volumes, latence acceptable, budget, contraintes — et le HORS-SCOPE. Concevoir sans questions est éliminatoire.
2. **Composants + flux de données** : des boîtes, des flèches, une légende. Le schéma structure la discussion.
3. **Choisir en TRADE-OFFS** : « monolithe modulaire ici, car le volume ne justifie pas le coût du distribué » vaut dix fois « microservices parce que c'est moderne ».
4. **Échelle et pannes** : « et à 10× le trafic ? et si ce composant tombe ? combien ça coûte ? ».

## Concepts clés
Couplage / cohésion · frontière / interface · inversion de dépendance · 3-tiers, MVC, hexagonal, monolithe modulaire, microservices, event-driven · queue, cache, auth/authz · observabilité (logs/métriques/traces) · résilience · stateless · trade-off · ADR (Architecture Decision Record : contexte, options, décision, conséquences).

## 🧭 Exemple guidé — le même besoin, trois architectures, et le calcul qui tranche

Le besoin : **analyser des documents déposés par des utilisateurs**. Trois
architectures le satisfont. Le travail d'architecture consiste à savoir dire
laquelle, et surtout **pourquoi**.

### Les trois options, avec ce que chacune coûte

**Monolithe modulaire.** Une seule application, trois modules internes —
ingestion, analyse, restitution — avec des frontières nettes entre eux. Un seul
dépôt, un seul déploiement, un seul journal, une seule base. Les appels entre
modules sont des appels de fonction : instantanés, typés, impossibles à
interrompre par le réseau.

**Microservices.** Trois services déployés séparément, communiquant par le
réseau. Chaque équipe déploie le sien à son rythme. Chaque appel devient une
requête réseau qui peut échouer, être lente, ou arriver deux fois.

**Piloté par les événements.** Le dépôt d'un document publie un message ; des
travailleurs le consomment à leur rythme. Les pics sont absorbés par la file au
lieu d'être subis par le service.

### Ce que le premier découpage coûte réellement

C'est ici que la plupart des raisonnements s'arrêtent trop tôt. Passer d'un appel
de fonction à un appel réseau ne change pas seulement la latence : cela change
**la nature des pannes possibles**, et les leçons de ce programme l'ont mesuré.

- **La latence.** Un aller-retour dans un centre de données coûte environ 500 µs
  contre 0,1 µs pour une lecture en mémoire — un facteur cinq mille (mesuré dans
  `system-design-interview`). Une chaîne de cinq appels internes devient une
  chaîne de cinq allers-retours.
- **Le N+1 traverse le réseau.** La mesure de `sql-performance-indexing` montre
  51 requêtes là où une seule suffisait. Sur un appel de fonction c'est
  regrettable ; sur un appel réseau, chaque unité devient un aller-retour.
- **Le retour arrière se complique.** Trois services déployables séparément, ce
  sont trois versions qui cohabitent. La mesure de `release-incident-recovery`
  montre qu'une colonne `NOT NULL DEFAULT` laisse alors passer des écritures
  silencieusement fausses (`ACCEPTÉ, devise = ""`).
- **La corrélation devient obligatoire.** Sans identifiant propagé, reconstituer
  une requête à travers trois services par proximité temporelle donne **1
  reconstitution correcte sur 200** dès cinq requêtes simultanées (mesuré dans
  `distributed-tracing`) — et l'échec est silencieux.
- **Les pannes partielles apparaissent.** Un service lent bloque ses appelants ;
  sans disjoncteur, la mesure de `resilience-patterns` montre 600 appels vers un
  service en panne là où 5 suffisaient.

Aucun de ces coûts n'existe dans un monolithe modulaire. **Le découpage en
services n'achète pas de la propreté : il achète de l'indépendance de
déploiement, et il la paie en complexité de panne.**

### La question qui tranche

Elle n'est pas technique : **combien d'équipes doivent déployer indépendamment ?**

- Une équipe → le monolithe modulaire gagne, sans discussion. L'indépendance de
  déploiement n'a aucune valeur pour des gens qui déploient ensemble, et les
  coûts ci-dessus sont bien réels.
- Plusieurs équipes qui se bloquent mutuellement à chaque livraison → le
  découpage commence à se justifier, et la frontière suit **l'organisation**, pas
  le schéma technique.
- Des pics de charge très irréguliers sur une seule étape → l'architecture
  événementielle traite ce problème précis, et elle peut s'introduire **dans** un
  monolithe : une file interne suffit souvent.

### Ce qui doit être décidé tôt, et ce qui peut attendre

La distinction la plus utile de tout le sujet.

**Réversible, donc à décider plus tard** : le découpage en services, le choix
d'un cadre applicatif, le fournisseur d'hébergement, le format des journaux. Ces
choix se changent, au prix d'un travail borné.

**Difficilement réversible, donc à décider tôt** : le modèle de données, le
contrat public d'une API, le choix « synchrone ou asynchrone » sur un flux
central, et la stratégie d'identifiants. La leçon
`breaking-changes-compatibility` détaille pourquoi : dès qu'un tiers dépend de
ton contrat, tu ne le changes plus, tu en publies un second.

**On investit son temps d'architecture sur la seconde liste.** L'erreur la plus
répandue est l'inverse : de longues discussions sur le découpage en services — un
choix réversible — et une décision de modèle de données prise en dix minutes en
début de projet.

### La forme de la décision

Quelle que soit l'option retenue, elle s'écrit : le contexte et les contraintes,
**les options envisagées avec ce que chacune coûte**, la décision, et les
conséquences — les bonnes **et** les mauvaises.

C'est cette dernière partie qui distingue un document utile. Une décision sans
conséquences négatives écrites n'a pas été instruite : toute architecture a un
coût, et ne pas le nommer signifie soit qu'on ne l'a pas cherché, soit qu'on le
cache. Six mois plus tard, quand quelqu'un demandera « pourquoi ce choix ? », ce
document est la seule chose qui existera encore — le code, lui, montre ce qui a
été fait, jamais ce qui a été écarté ni pourquoi.

## ⚠️ Erreurs fréquentes
- Choisir l'architecture à la mode plutôt qu'adaptée (microservices pour un projet solo).
- Frontières floues : tout importe tout → un monolithe modulaire devient un plat de spaghettis.
- Ignorer les pannes : tout design qui suppose « le réseau marche » est faux.
- Ne pas documenter les décisions : sans ADR, l'équipe re-débat tout, tous les six mois.

## 🔗 Liens avec le programme
Un système RAG EST une architecture : ingestion (pipeline), index (stockage spécialisé), retrieval (service), génération (dépendance externe faillible et coûteuse), évaluation (observabilité qualité). DocSense (mois 11) appliquera l'hexagonal pour rendre LLM et vector DB remplaçables — et ton entretien design système portera très probablement sur « un système IA pour analyser X » : cette leçon est ta grille de réponse.

## Mini-exercice
Déroule les 4 étapes (45 min, schéma papier) sur : « un système qui reçoit 10 000 documents/jour, les analyse par LLM et alerte sur les anomalies ». Impose-toi : 3 questions de clarification écrites, un schéma légendé, 2 trade-offs explicites, un paragraphe « à 10× le volume ».

## ✅ Correction attendue
**La démarche** : les trois questions de clarification passent avant tout schéma. Sur cet énoncé, les plus rentables sont : 10 000 documents par jour, mais **répartis comment** ? (uniformément, c'est 7 par minute — une seule machine suffit ; tous à 8 h du matin, c'est un tout autre système) ; quel délai est acceptable entre le dépôt et l'alerte, une seconde ou une heure ? ; que se passe-t-il si un document échoue — on le perd, on le rejoue, on alerte quelqu'un ?

Ces trois réponses décident de l'architecture avant qu'on ait dessiné quoi que ce soit. C'est le sens de « concevoir sans questions est éliminatoire ».

**L'erreur probable, et elle est presque un réflexe.** Le mot « 10 000 » déclenche un schéma à six services, une queue, un cache et une base répliquée. Or 10 000 documents par jour, c'est **0,12 par seconde**. Une machine et un script séquentiel suffisent, avec une marge confortable. Le piège séduit parce qu'un gros chiffre *ressemble* à une contrainte d'échelle, et parce qu'un schéma riche a l'air d'un meilleur travail qu'un schéma pauvre.

Le geste qui désamorce tout : **convertir en unité par seconde avant de dessiner**. C'est du capacity planning élémentaire, et c'est ce qui sépare un candidat qui récite des composants d'un candidat qui dimensionne.

Attention toutefois à l'excès inverse, qui est réel ici : l'analyse passe par un LLM, donc chaque document coûte peut-être 3 secondes et de l'argent. 10 000 × 3 s = **8 heures de calcul par jour** — le goulot n'est pas le débit d'entrée, il est chez le fournisseur, et il se traite par du parallélisme borné et une file, pas par plus de machines. Trouver le vrai goulot est le travail ; en supposer un est l'erreur.

**Alternative défendable** : commencer event-driven dès le départ. Plus coûteux à construire et à observer, mais si les alertes doivent être temps réel et les pics imprévisibles, la file n'est pas une sophistication, c'est le composant qui évite de perdre des documents pendant un pic. Le monolithe modulaire reste le bon défaut — « défaut » signifiant *ce qu'on choisit quand rien ne justifie autre chose*, pas *ce qui est toujours juste*.

**Vérifie seul, sans corrigé** :
1. Ton schéma a-t-il une **légende** ? Sans elle, une flèche peut vouloir dire un appel HTTP, une lecture de fichier ou une dépendance de compilation — et personne ne peut te contredire, ce qui est le contraire d'un bon schéma.
2. Pour chacun de tes deux trade-offs, écris ce que tu PERDS. Un trade-off sans coût énoncé est une préférence déguisée.
3. Écris le débit par seconde. S'il ne figure nulle part, tu as conçu sans dimensionner.
4. Épreuve du 10× : ton paragraphe doit nommer **quel composant sature en premier**. « On scale horizontalement » n'est pas une réponse si l'on ne dit pas quoi.

## 🏢 Cas professionnel
Une équipe de six personnes découpe son produit en onze microservices dès le premier jour, pour « être prêts à l'échelle ». Dix-huit mois plus tard, l'échelle n'est jamais venue, et le coût, lui, est arrivé en entier : une modification traversant trois services demande trois dépôts, trois revues, trois déploiements coordonnés ; un bug se poursuit à travers des logs non corrélés ; l'environnement local ne démarre plus sur un portable. Deux développeurs passent l'essentiel de leur temps sur la plomberie.

Le point important n'est pas que les microservices soient mauvais — ils résolvent un problème réel : **permettre à des équipes séparées de déployer sans se coordonner**. Cette équipe n'avait pas ce problème. Elle a payé la solution d'un problème qu'elle n'avait pas, ce qui est la définition même de la sur-ingénierie, et exactement le même geste que la Factory posée sur deux occurrences.

La contrepartie mérite d'être dite aussi : le monolithe modulaire ne tient sa promesse que si les frontières internes sont réellement respectées. Sans discipline — ou sans un contrôle automatique interdisant à un module d'importer les entrailles d'un autre — il devient en dix-huit mois le plat de spaghettis que les microservices prétendaient éviter. Les deux styles échouent par la même cause : des frontières que personne ne fait respecter.

## 🎤 Questions d'entretien
- « Conçois un système qui analyse des documents. » → Clarifier d'abord (volumes, latence, échec), schématiser ensuite, arbitrer explicitement, finir par l'échelle et les pannes. On évalue la démarche, pas la réponse.
- « Monolithe ou microservices ? » → Monolithe modulaire par défaut. Microservices quand des équipes ou des besoins de scaling réellement indépendants le justifient — et en acceptant le coût du distribué.
- « Que mets-tu dans un ADR ? » → Le contexte, les options envisagées, la décision, et surtout ses conséquences. Sans lui, l'équipe rejoue le même débat tous les six mois.
- « Comment rends-tu un composant externe remplaçable ? » → En le plaçant derrière un port défini par MON domaine, avec un adapter par fournisseur. Le cœur ne connaît alors ni le SDK ni son vocabulaire.
- « Et si ce composant tombe ? » → Timeout, retry borné sur l'idempotent, disjoncteur, et un mode dégradé utilisable. Un design qui suppose que le réseau fonctionne est faux.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je pose des questions de clarification avant de dessiner, et je sais lesquelles rapportent le plus.
- [ ] Je convertis les volumes annoncés en unités par seconde avant de choisir quoi que ce soit.
- [ ] J'énonce ce que chaque choix me COÛTE, pas seulement ce qu'il m'apporte.
- [ ] Mes schémas ont une légende, et je sais nommer le composant qui saturera en premier.

## 📚 Vocabulaire
**couplage / cohésion** · **port / adapter** · **inversion de dépendance** · **monolithe modulaire** · **event-driven / broker** · **idempotence** · **circuit breaker** · **correlation id** · **stateless** · **ADR** · **C4** (niveaux de schémas).

## 🧾 À retenir
Architecturer = isoler ce qui change pour des raisons différentes, derrière des frontières explicites : couches (3-tiers), cœur + ports/adapters (hexagonal), modules (monolithe modulaire), services (microservices) ou événements (event-driven) — chaque style étant un trade-off, pas un dogme. Les briques transverses (queues, cache, observabilité, résilience) complètent le vocabulaire. En entretien comme en projet : clarifier → schématiser → arbitrer → anticiper l'échelle et les pannes.
