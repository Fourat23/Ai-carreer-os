<!-- keep -->
# Leçon — La documentation technique : quel document, pour qui, quand

## 🌍 Le problème d'abord
Six mois après avoir livré une fonctionnalité, quelqu'un (peut-être toi) demande : « pourquoi
a-t-on choisi cette base de données plutôt qu'une autre ? », « comment redémarre-t-on ce
service en pleine nuit ? », « qu'est-ce qui a changé dans la version 2.3 ? ». Si la réponse
n'existe que dans la tête d'une personne — partie en vacances ou en poste ailleurs — l'équipe
est bloquée, re-débat des décisions déjà tranchées, ou improvise dangereusement en incident.
La **documentation technique** répond à ça : capturer la bonne information, sous la bonne
forme, pour la bonne audience. Le piège du débutant est de croire qu'il existe « une doc »
unique ; en réalité, chaque question appelle un TYPE de document différent. Cette leçon
t'apprend à choisir le bon artefact et à écrire une doc qui sert vraiment.

## 🎯 Objectif
Savoir **choisir le bon artefact de documentation** selon la question et l'audience (README,
ADR, RFC, HLD/HSD, LLD/TSD, runbook, playbook, post-mortem, changelog), écrire une
documentation **vivante** plutôt que morte, et situer la **maintenance** (corrective,
adaptative, préventive, évolutive) dans le cycle de vie d'un logiciel.

## 🧩 Prérequis
Tu dois avoir une notion d'architecture et de compromis de conception
(`/doc/lessons/architecture-basics`), de gestion d'erreurs/incidents
(`/doc/lessons/error-handling`) et de changements de contrat
(`/doc/lessons/breaking-changes-compatibility`), car la documentation sert à capturer des
DÉCISIONS et des PROCÉDURES autour de ces sujets. Le README de base est vu ailleurs
(`/doc/lessons/readme-documentation`) ; cette leçon couvre les autres artefacts.

## 🧠 Modèle mental
Une documentation n'est utile que si elle répond à une QUESTION précise pour une AUDIENCE
précise, au bon MOMENT. Deux axes structurent tout : **temporel** — décide-t-on quelque chose
(avant : RFC/ADR), décrit-on comment ça marche (pendant : HLD/LLD), ou explique-t-on quoi
faire face à une situation (après/en opération : runbook/post-mortem) — et **audience** :
un nouveau venu, un pair qui code, un opérateur en astreinte, un utilisateur de l'API. La
mauvaise doc n'est pas « trop courte » : c'est le mauvais TYPE pour la question posée. Bonne
règle : documenter le POURQUOI (qui se perd) plus que le QUOI (qui se lit dans le code).

## 💡 Pourquoi c'est important
La documentation est ce qui permet à une équipe de ne pas re-débattre sans cesse, d'intégrer
un nouveau venu en jours plutôt qu'en semaines, et de survivre à un incident à 3 h du matin.
C'est aussi un marqueur de séniorité très visible : un ingénieur qui écrit un bon ADR ou un
post-mortem sans blâme se distingue immédiatement. Enfin, écrire clarifie la pensée : rédiger
la décision AVANT de coder évite des impasses coûteuses.

## Explication complète

### Décider : RFC et ADR (le POURQUOI)
- **RFC** (*Request For Comments*) : une proposition mise en DISCUSSION avant décision.
  « Voici le problème, les options envisagées, ma recommandation ; qu'en pensez-vous ? ». Elle
  sert à aligner l'équipe AVANT de s'engager.
- **ADR** (*Architecture Decision Record*) : le compte-rendu d'une décision PRISE, court et
  daté. Structure classique : contexte → options considérées → décision → conséquences
  (positives ET négatives). Un ADR ne se modifie pas : s'il devient caduc, on en écrit un
  nouveau qui le remplace. C'est la mémoire des « pourquoi » — exactement ce qui manque le
  plus six mois plus tard. (Ce projet en contient : `docs/ADR-030-*` en est un.)

### Concevoir : HLD/HSD et LLD/TSD (le COMMENT)
- **HLD / HSD** (*High-Level Design* / *High-level Software Design*) : la vue d'ensemble —
  composants, flux de données, frontières, choix majeurs. Pour comprendre le système sans
  entrer dans le code.
- **LLD / TSD** (*Low-Level Design* / *Technical Specification Document*) : le détail
  d'implémentation d'un composant — schémas de données, signatures, algorithmes, cas limites.
  Pour celui qui va coder précisément la chose.
Le niveau se choisit selon le lecteur : un décideur lit le HLD, un implémenteur lit le TSD.

### Opérer : runbook, playbook, post-mortem (le QUOI FAIRE)
- **Runbook** : la procédure PAS À PAS d'une opération routinière ou d'urgence (« redémarrer
  proprement le service X », « faire une restauration »). Écrit pour être suivi sous stress,
  par quelqu'un qui n'a pas tout le contexte.
- **Playbook** : la MÉTHODE de raisonnement face à une CLASSE de situations (« que faire quand
  une requête devient lente ? ») — symptômes → hypothèses → diagnostic → correction. Plus
  général qu'un runbook (voir les « Que faire dans ce cas ? » du programme).
- **Post-mortem** : l'analyse SANS BLÂME d'un incident passé — chronologie, cause racine,
  impact, actions préventives. Son but est d'apprendre, jamais de désigner un coupable.

### Communiquer les évolutions : le changelog
Le **changelog** liste, par version, ce qui a changé — en signalant clairement les
changements CASSANTS et les dépréciations. C'est le canal par lequel les utilisateurs de ton
code apprennent ce qu'ils doivent adapter (lié au versionnement sémantique).

### Documentation vivante vs morte
Une doc qui se périme silencieusement est PIRE que pas de doc : elle ment. On préfère donc la
doc VIVANTE — au plus près du code (README dans le dépôt, ADR versionnés, diagrammes générés
depuis une source, exemples testés) — à la doc MORTE (un wiki oublié, un document figé). Règle
de survie : moins de doc, mais juste et maintenue, plutôt que beaucoup et fausse.

### Les quatre maintenances (situer la doc dans le cycle de vie)
Après la livraison, un logiciel vit, et on distingue quatre types de maintenance :
- **corrective** : réparer un défaut (bug, incident) ;
- **adaptative** : s'ajuster à un changement d'environnement (nouvelle version d'une
  dépendance, d'un OS, d'une API tierce) ;
- **préventive** : réduire des risques futurs (rembourser de la dette, améliorer les tests)
  avant qu'ils ne deviennent des pannes ;
- **évolutive** : ajouter des fonctionnalités.
Chaque type s'appuie sur des documents différents (post-mortem pour la corrective, ADR pour
l'évolutive/adaptative, runbook pour l'exploitation).

## Concepts clés
Audience × moment (décider/concevoir/opérer/communiquer) · RFC · ADR (contexte/options/
décision/conséquences) · HLD/HSD · LLD/TSD · runbook · playbook · post-mortem sans blâme ·
changelog · documentation vivante vs morte · POURQUOI > QUOI · maintenance corrective/
adaptative/préventive/évolutive.

## 🧭 Exemple guidé
Une même fonctionnalité, quatre documents pour quatre questions :
```
Décision : « choisir la file de messages » → ADR
  (contexte, options RabbitMQ vs SQS vs table SQL, décision, conséquences)
Conception : « comment le worker consomme la file » → HLD (schéma) + TSD (détail)
Exploitation : « la file est saturée en pleine nuit » → runbook (procédure) +
  playbook (méthode de diagnostic)
Après incident : « pourquoi a-t-elle saturé » → post-mortem sans blâme
Livraison : « la v2 change le format des messages » → changelog (changement cassant)
```
Aucun de ces documents ne remplace les autres : chacun répond à une question, pour une
audience, à un moment.

## ⚠️ Erreurs fréquentes
- Écrire « une doc » fourre-tout au lieu du bon artefact pour la question posée.
- Documenter le QUOI (que le code dit déjà) et oublier le POURQUOI (qui se perd).
- Laisser une doc se périmer : une doc fausse est pire que pas de doc.
- Un post-mortem qui cherche un coupable au lieu d'une cause racine et d'actions préventives.
- Un runbook trop vague pour être suivi sous stress par quelqu'un sans contexte.

## 🚨 Que faire dans ce cas ?
« On répète le même incident tous les mois, et personne ne sait pourquoi. » Méthode :
1. écrire un **post-mortem sans blâme** du dernier incident (chronologie, impact) ;
2. remonter à la **cause racine** (au-delà du symptôme) ;
3. décider des **actions préventives** (maintenance préventive) et les tracer ;
4. si la correction implique un choix structurel, l'acter dans un **ADR** ;
5. transformer la réaction en **runbook** (procédure) et **playbook** (méthode) pour la
   prochaine fois ;
6. **surveiller** que l'incident ne se reproduit plus. On documente pour ne plus subir.

## Mini-exercice
Prends une décision technique réelle de tes projets (ex. « pourquoi SQLite et pas Postgres »).
Écris-en l'**ADR** complet : contexte, 2–3 options avec leurs compromis, décision, conséquences
(bonnes ET mauvaises). Puis rédige le **runbook** d'une opération courante du projet (ex.
« régénérer et vérifier le curriculum »), assez précis pour être suivi sans toi.

## 🔗 Liens avec le programme
Cette leçon prolonge `/doc/lessons/architecture-basics` (l'ADR y est nommé comme la mémoire
des décisions), `/doc/lessons/breaking-changes-compatibility` (le changelog communique les
ruptures) et la fondation Observabilité/SRE (`/doc/lessons/postmortem-rca` pour le
post-mortem sans blâme). Les artefacts d'architecture de ce projet lui-même (ADR/HSD/TSD) en
sont des exemples réels. La pratique associée passe par les missions « concevoir et documenter
une évolution d'API » et « gérer un incident et écrire le post-mortem ».

## 📚 Vocabulaire
**RFC** · **ADR** · **HLD / HSD** · **LLD / TSD** · **runbook** · **playbook** ·
**post-mortem (sans blâme)** · **changelog** · **cause racine** · **documentation vivante** ·
**maintenance corrective/adaptative/préventive/évolutive**.

## 🧾 À retenir
Il n'y a pas « une doc » mais des artefacts qui répondent chacun à une question, pour une
audience, à un moment : RFC/ADR pour décider (le POURQUOI), HLD/LLD pour concevoir (le
COMMENT), runbook/playbook/post-mortem pour opérer (le QUOI FAIRE), changelog pour communiquer
les évolutions. On documente le POURQUOI plus que le QUOI, on préfère la doc vivante à la doc
morte, et on relie chaque type au bon moment du cycle de vie — dont les quatre maintenances
(corrective, adaptative, préventive, évolutive).
