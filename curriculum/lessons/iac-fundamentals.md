<!-- keep -->
# Leçon — Infrastructure as Code : les fondamentaux

> **📚 Étagère de référence — cette leçon n'est programmée par aucune des 365 journées.**
> Tu ne l'as pas manquée : le parcours ne t'y enverra jamais, et aucune journée ne suppose
> que tu l'as lue. Elle est là pour être ouverte quand tu en as besoin — par curiosité, pour
> un projet, ou parce qu'une leçon du parcours y renvoie pour approfondir un point.


## 🌍 Le problème d'abord
Créer son infrastructure « à la main » en cliquant dans la console du fournisseur
paraît simple… au début. Puis les problèmes arrivent : personne ne sait exactement
ce qui tourne, impossible de recréer à l'identique, un collègue modifie un réglage en
douce et plus rien n'est cohérent. La solution : **décrire** l'infrastructure voulue
dans du **code** versionné, et laisser un outil la créer et la mettre à jour. C'est
l'**Infrastructure as Code**. C'est la même idée que Kubernetes appliquée aux
serveurs/réseaux : on déclare l'état voulu, l'outil calcule les changements. Cette
leçon explique pourquoi, et les notions clés (plan/apply, state, dérive) — en
enseignant les CONCEPTS, sans provisionner quoi que ce soit de réel.

## 🎯 Objectif
Comprendre pourquoi on DÉCRIT l'infrastructure dans du code versionné plutôt que
de cliquer dans une console : l'approche **déclarative**, l'**idempotence**, le
**state** (état), le cycle **plan → apply**, la **dérive** et les **modules**.
Concevoir une infra reproductible et auditable — sans prétendre l'avoir
provisionnée.

## 🧩 Prérequis
Vous devez connaître les **fondamentaux cloud** (`/doc/lessons/cloud-fundamentals`)
et au moins un fournisseur (`/doc/lessons/cloud-aws-core` ou
`/doc/lessons/cloud-azure-core`), car l'IaC crée ces ressources. Il est très utile
d'avoir vu l'idée **déclarative** de Kubernetes (`/doc/lessons/k8s-why-architecture`)
— l'IaC applique la même logique à l'infrastructure.

## 🧠 Modèle mental
L'IaC applique à l'infrastructure la même idée que Kubernetes aux applications :
on DÉCLARE l'état désiré (« je veux ce réseau, ces machines, cette base ») et un
outil calcule et applique les changements pour y arriver. On ne clique plus, on
écrit un code que l'on relit, versionne, révise en équipe et rejoue à l'identique.
L'infrastructure devient un artefact logiciel.

## 📖 Explication complète
**Déclaratif, pas impératif.** On décrit le RÉSULTAT voulu, pas la suite de
commandes. L'outil compare l'état désiré à l'existant et n'applique que les
DIFFÉRENCES. Deux exécutions successives du même code ne recréent pas tout :
c'est l'**idempotence** (appliquer plusieurs fois donne le même résultat).

**Le state (état).** L'outil garde une représentation de ce qu'il a créé (le
**state**) pour savoir quoi comparer et quoi modifier. Ce fichier d'état est
SENSIBLE (il peut contenir des identifiants) et CRITIQUE (le perdre brouille le
lien code↔réalité). En équipe, on le stocke de façon partagée et verrouillée
(remote state) pour éviter les écritures concurrentes.

**plan → apply.** Le cycle sûr : un **plan** montre CE QUI VA CHANGER (créer /
modifier / DÉTRUIRE) AVANT d'agir ; on relit ce plan, puis on **apply**. Lire le
plan est non négociable : il révèle les destructions accidentelles (un simple
changement peut, selon la ressource, entraîner un remplacement destructif).

**La dérive (drift).** Quand quelqu'un modifie l'infra À LA MAIN (dans la console),
la réalité s'écarte du code : c'est la **dérive**. L'outil la détecte au plan
suivant. La discipline : tout changement passe par le code (sinon la prochaine
application peut ANNULER la modification manuelle, ou échouer).

**Modules et réutilisation.** On factorise des ensembles réutilisables (un
**module** « réseau standard », « service web ») paramétrés par des variables.
Cela évite la duplication et diffuse les bonnes pratiques. Les environnements
(dev/staging/prod) réutilisent les mêmes modules avec des variables différentes.

**Outils.** Terraform (multi-fournisseurs) est emblématique ; il existe aussi des
outils natifs (CloudFormation côté AWS, Bicep/ARM côté Azure) et des approches
programmatiques. Le concept — état désiré déclaré, state, plan/apply — est le même.

**Sécurité et honnêteté.** Le code d'infra ne contient JAMAIS de secrets en dur
(on référence un gestionnaire de secrets) ; le state est protégé. Important : cette
leçon enseigne les CONCEPTS ; elle ne provisionne aucune ressource réelle et ne
prétend pas l'avoir fait.

## 🔧 Repères (illustratifs, non exécutés)
```bash
# Cycle type (outil déclaratif générique)
plan     # afficher les changements (create/update/DESTROY) SANS agir → À LIRE
apply    # appliquer après relecture du plan
# state : stocké de façon partagée + verrouillée en équipe ; sensible.
```

## 🧭 Exemple guidé — le vendredi soir où le code d'infrastructure supprime la base

Un incident, raconté dans l'ordre où il s'est produit. Il contient tout ce qu'il faut
comprendre sur l'infrastructure décrite en code, et notamment la notion que personne
n'explique avant qu'elle ne fasse mal : **l'état**.

### Mardi

La production est lente. Un collègue augmente la taille de la base de données depuis la
console web du fournisseur. Deux clics, la lenteur disparaît, tout le monde passe à
autre chose. Il ne prévient personne — ce n'était « qu'un réglage ».

### Vendredi

Quelqu'un ajoute un sous-réseau dans le code d'infrastructure et lance le calcul de
plan. La sortie annonce :

```
Plan: 1 to add, 1 to change, 0 to destroy.
```

Le « 1 to change » est la base de données : le code dit *taille moyenne*, la réalité
dit *grande*. L'outil se propose de la ramener à ce que le code décrit.

Personne ne lit cette ligne — on cherchait le sous-réseau, on l'a trouvé. Application.
La base redescend en taille moyenne, la production redevient lente, et il faut vingt
minutes pour comprendre pourquoi, un vendredi soir.

### Ce que l'incident révèle

**L'outil n'a pas eu tort.** Son travail est de rendre la réalité conforme au code. Il
a fait exactement cela.

Le décalage entre le code et la réalité s'appelle la **dérive**, et c'est le concept
central du sujet. Elle apparaît dès que quelqu'un modifie l'infrastructure autrement
que par le code — et elle est **silencieuse** : rien ne casse le mardi. Elle ne se
manifeste que le jour où quelqu'un applique, et souvent sur une modification sans
rapport.

D'où une règle qui a l'air bureaucratique et qui est en réalité une protection : **si
l'infrastructure est décrite en code, la console web devient un outil de lecture.**
Pas par principe d'autorité — parce que toute modification faite ailleurs sera annulée
à un moment qu'on ne choisit pas.

### Le troisième acteur : le fichier d'état

Il reste une question. Comment l'outil sait-il que cette base est « la sienne » ?

Il tient un **fichier d'état** : une correspondance entre les objets déclarés dans ton
code et les identifiants réels chez le fournisseur. Le cycle complet de chaque
exécution comporte donc trois termes, et non deux :

```
ce que dit le code   ←→   ce que dit l'état   ←→   ce qui existe vraiment
```

L'outil lit l'état, va vérifier la réalité, compare au code, et propose les écarts.

Cela explique deux comportements qui déroutent tous les débutants :

- **Une ressource supprimée à la main revient.** L'état la référence, elle n'existe
  plus, le code la demande : elle est recréée.
- **Une ressource créée à la main est ignorée**, puis parfois entre en conflit. Elle
  n'est dans aucun état ; l'outil ne la voit pas. Jusqu'au jour où le code veut créer
  un objet portant le même nom, et le fournisseur refuse.

Et cela explique surtout pourquoi **le fichier d'état est un objet critique** : il
contient les identifiants de toute ton infrastructure, parfois des valeurs sensibles,
et le perdre revient à ce que l'outil ne reconnaisse plus rien de ce qu'il a créé. Il
se stocke à distance, versionné et verrouillé — pas sur le poste de celui qui a lancé
la dernière commande.

Le verrou n'est pas un luxe : deux personnes qui appliquent en même temps sur le même
état produisent une corruption dont la sortie est manuelle et pénible.

### Ce qui aurait évité le vendredi

Trois choses, par ordre de coût croissant.

**Lire le plan.** Le plan avait raison et il l'avait écrit. Un plan qui annonce une
modification qu'on n'a pas demandée est un signal d'arrêt, pas une ligne à faire
défiler. C'est gratuit et c'est le plus efficace.

**Faire du plan une étape obligatoire** dans la chaîne d'intégration, affichée sur la
demande de fusion : la dérive devient alors visible par toute l'équipe avant fusion,
et non par une seule personne au moment d'appliquer.

**Détecter la dérive périodiquement** : un plan lancé chaque nuit qui alerte s'il
trouve autre chose que « aucun changement ». On apprend le mardi, pas le vendredi.

### Le vrai bénéfice, qui n'est pas celui qu'on annonce

On présente l'infrastructure en code comme un moyen de *recréer l'environnement
rapidement*. C'est vrai et c'est rare — on recrée un environnement complet quelques
fois dans une vie de projet.

Le bénéfice quotidien est ailleurs : **il existe un endroit unique qui décrit la
vérité, il est relu avant modification, et son historique dit qui a changé quoi et
pourquoi.** C'est ce qui transforme « je crois que la production est configurée comme
ça » en « voici le fichier ».

## ⚠️ Erreurs fréquentes
- **Appliquer sans lire le plan** → destruction/replacement inattendu.
- Modifier à la main → **dérive** ; le prochain apply annule ou casse.
- **State non partagé/non verrouillé** en équipe → corruption, écrasements.
- Secrets **en dur** dans le code d'infra.
- Copier-coller au lieu de **modules** → duplication ingérable.

## 🔐 Sécurité
Protéger le **state** (chiffrement, accès restreint, verrouillage) : il peut
contenir des données sensibles. Pas de secret en dur (référencer un coffre). Le
code d'infra passe par revue : une PR qui élargit un accès réseau se voit et se
discute — l'IaC rend la sécurité AUDITABLE, contrairement aux clics non tracés.

## 🏢 Cas métier
Une infra « cliquée » était impossible à reproduire : personne ne savait
exactement ce qui tournait. Passage à l'IaC : l'existant est décrit en code
versionné, chaque changement passe par un **plan** relu et une revue. Un jour, un
plan révèle qu'un innocent changement aurait DÉTRUIT une base ; on adapte avant
d'appliquer. La reproductibilité et la sécurité changent de niveau.

## 🎤 Questions d'entretien
- « Pourquoi lire le plan avant d'appliquer ? » → repérer les destructions/
  remplacements avant qu'ils n'arrivent.
- « Qu'est-ce que la dérive ? » → écart entre le code et la réalité, souvent dû à
  des changements manuels.
- « À quoi sert le state ? » → mémoriser ce qui a été créé pour calculer les
  différences ; sensible et critique.

## ✍️ Mini-exercice — lire un plan avant de l'appliquer

**Contexte.** Tu reprends l'infrastructure d'une application. Tu ajoutes une variable
d'environnement à un service, tu lances le calcul de plan, et tu obtiens ceci :

```
  ~ service.api
      ~ env["LOG_LEVEL"]        "info" -> "debug"

  ~ database.principale
      ~ instance_class          "db.t3.large" -> "db.t3.medium"
      ~ backup_retention_days   30 -> 7

  ~ security_group.web
      - ingress { from_port = 22, cidr = "0.0.0.0/0" }

  - storage.exports
      (destroy)

  + storage.exports-v2
      (create)

Plan: 1 to add, 3 to change, 1 to destroy.
```

**Ce que tu produis.** Pour **chacune des cinq** modifications proposées : est-ce
(a) ce que tu voulais, (b) une **dérive** que le plan veut annuler, ou (c) une
**destruction dangereuse** ? Écris, pour chaque ligne, ce qui se passe si tu appliques
tel quel, et le geste à faire avant.

Puis réponds à la question qui décide : **appliques-tu ce plan ?** Oui, non, ou
partiellement — et dans ce dernier cas, comment.

**Livrable.** Les cinq verdicts avec leur conséquence, plus ta décision d'application
argumentée.

**Critère de réussite.** Vérifiable seul : ton analyse doit distinguer les lignes où le
code a raison de celles où **la réalité a raison**. Si tu classes les cinq du même
côté, tu n'as pas encore compris que la dérive peut venir des deux directions.

**Piège.** Une des cinq lignes est bien plus grave que les autres et ne ressemble
pourtant pas à un problème. Une autre a l'air catastrophique et est peut-être
parfaitement voulue.

## ✅ Correction attendue

**La démarche.** Un plan se lit ligne par ligne, en posant à chaque fois la même
question : *ai-je demandé ceci ?* Tout ce à quoi on répond non est une dérive ou une
surprise, et **aucune surprise ne s'applique**. Le symbole compte aussi : `~` modifie,
`+` crée, `-` détruit. Un `-` sur une ressource de données mérite toujours un arrêt.

**Ligne 1 — `LOG_LEVEL` de `info` à `debug`.** C'est ta modification. Verdict (a). Une
réserve tout de même : passer les journaux en mode débogage en production augmente le
volume, donc le coût de stockage et parfois le risque de journaliser des données
sensibles. Voulu, mais à assumer.

**Ligne 2 — la base repasse de `large` à `medium`.** Verdict (b), dérive classique :
quelqu'un a agrandi la base à la main, probablement pour une bonne raison. **Ici, c'est
la réalité qui a raison, pas le code.** Le geste n'est donc pas d'appliquer, c'est de
corriger le code pour qu'il déclare `large`, puis de vérifier auprès de l'équipe
pourquoi l'agrandissement a eu lieu — la lenteur d'origine a-t-elle été traitée ?

**Ligne 3 — rétention des sauvegardes de 30 à 7 jours.** C'est le **piège grave**, et
il ne ressemble à rien : une ligne de configuration parmi d'autres. Appliquer supprime
23 jours d'historique de sauvegarde, immédiatement et sans confirmation. Aucune alerte,
aucune couleur particulière dans la sortie.

Et il faut se demander d'où vient l'écart. Soit quelqu'un a allongé la rétention à la
main pour une raison de conformité — auquel cas le code doit être corrigé — soit le
code a toujours dit 7 et la valeur 30 vient d'ailleurs. Dans les deux cas, on ne
diminue pas une rétention de sauvegarde par accident un mardi après-midi.

**Ligne 4 — suppression d'une règle SSH ouverte au monde.** Verdict (a), et c'est la
seule ligne qu'on est content de voir. Quelqu'un avait ouvert le port 22 à
`0.0.0.0/0` pour déboguer ; le code ne la contient pas, le plan la retire. **La dérive
va dans les deux sens : le code corrige ici une erreur de la réalité.**

**Ligne 5 — `storage.exports` détruit, `exports-v2` créé.** Verdict (c), le plus
spectaculaire — et peut-être parfaitement voulu. C'est ce qu'on appelle un
**remplacement** : certaines propriétés d'une ressource ne peuvent pas être modifiées
en place, donc l'outil détruit et recrée. Un renommage suffit à le déclencher.

La question à trancher est : **que contient `storage.exports` ?** S'il est vide ou
reconstructible, c'est sans conséquence. S'il contient des exports clients, la
destruction est irréversible et il faut migrer les données avant, ou renommer dans
l'état plutôt que dans la réalité.

**La décision.** **Non, on n'applique pas ce plan.** Une seule des cinq lignes était
voulue sans réserve. La bonne marche à suivre : corriger le code pour la taille de la
base et la rétention, vérifier le contenu du stockage à détruire, puis relancer un plan
qui devra annoncer exactement deux changements — la variable d'environnement et la
suppression de la règle SSH. **Un plan qu'on peut prédire ligne à ligne est un plan
qu'on peut appliquer.**

**L'erreur probable, et elle est de comportement plus que de compétence.** Lire le
résumé `1 to add, 3 to change, 1 to destroy`, constater que ça « a l'air normal », et
appliquer. Le résumé ne dit rien de la gravité : détruire un stockage vide et détruire
trois ans d'exports comptent tous les deux pour `1 to destroy`.

**Les indices qui font reconnaître ce type de problème.** Trois signaux à traiter comme
des arrêts systématiques : un `-` ou un `replace` sur une ressource qui contient des
données · une modification que **tu** n'as pas demandée · une valeur numérique qui
**diminue** (rétention, taille, nombre d'exemplaires), car la diminution est presque
toujours destructrice là où l'augmentation ne l'est pas.

**Quand la réponse changerait.** Sur un environnement jetable recréé chaque nuit, tout
ce raisonnement est inutile : on applique et on regarde. **La prudence devant un plan
est proportionnelle à ce qui est irremplaçable derrière** — et c'est aussi pourquoi
séparer les environnements dans des états distincts est la première protection.

## 🧾 À retenir
- IaC = état désiré déclaré, versionné, rejouable ; idempotent.
- plan → apply : toujours LIRE le plan (destructions/remplacements).
- State = mémoire du réel : sensible, critique, partagé/verrouillé en équipe.
- Dérive = changements manuels ; tout passe par le code. Pas de secret en dur.

## 📚 Vocabulaire
**déclaratif** · **idempotence** · **state (état)** · **plan / apply** ·
**dérive (drift)** · **module** · **remote state / verrouillage** · **remplacement
destructif**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] J'explique déclaratif, idempotence et le cycle plan/apply.
- [ ] Je sais pourquoi lire un plan et protéger le state.
- [ ] Je comprends la dérive et la discipline « tout par le code ».

## 🔗 Liens avec le programme
Mois 11 (cloud, automatisation). Leçons liées :
`/doc/lessons/cloud-aws-core`, `/doc/lessons/cloud-azure-core`,
`/doc/lessons/k8s-why-architecture`. L'IaC applique à l'infra la logique
déclarative de Kubernetes et rend la sécurité auditable.
