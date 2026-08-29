<!-- keep -->
# Leçon — Infrastructure as Code : les fondamentaux

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

## 🧭 Exemple guidé — introduire l'IaC sur une infra « cliquée »
1. Décrire l'existant en code (réseau, compute, base) par petits morceaux.
2. Lancer un **plan** : le code correspond-il à la réalité ? écarts = points à
   réconcilier.
3. Interdire les changements manuels ; tout passe désormais par le code (revue +
   versionnement).
4. Factoriser en **modules** réutilisés entre environnements.

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

## ✍️ Mini-exercice
Un collègue a modifié un pare-feu à la main dans la console. Que risque-t-il au
prochain `apply` du code d'infra ? → la dérive : l'application peut ANNULER sa
modification (l'état réel est ramené vers l'état décrit dans le code).

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
