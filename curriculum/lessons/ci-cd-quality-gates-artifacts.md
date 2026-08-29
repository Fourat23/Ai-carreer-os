<!-- keep -->
# Leçon — CI/CD : portes qualité et artefacts versionnés

## 🌍 Le problème d'abord
Un pipeline vert ne veut pas dire « du bon code ». Si les vérifications n'empêchent
pas réellement de fusionner ou de livrer, elles rassurent à tort. Et un piège
classique casse la production : on reconstruit l'application à chaque étape
(dev, préproduction, prod) — donc on déploie potentiellement un objet DIFFÉRENT de
celui qu'on a testé. « Mais c'est le même code ! » … pas forcément le même résultat.
Cette leçon résout deux problèmes concrets : rendre les contrôles réellement
BLOQUANTS, et **construire une seule fois** un livrable figé (un « artefact ») qu'on
promeut ensuite d'un environnement à l'autre sans le refabriquer. On part de l'idée
simple : qu'est-ce qu'un « artefact », et pourquoi le figer ?

## 🎯 Objectif
Transformer un pipeline « qui passe » en pipeline « qui protège » : définir des
**portes qualité** (tests, couverture, sécurité, lint) qui BLOQUENT vraiment,
produire des **artefacts immuables et versionnés**, et appliquer le principe
**construire une fois, déployer partout**.

## 🧩 Prérequis
Vous devez comprendre l'**anatomie d'un pipeline** (jobs, artefacts, cache —
`/doc/lessons/ci-cd-pipeline-anatomy`), car les portes qualité sont des jobs
bloquants et l'artefact est ce qui circule entre les étapes. Les notions de porte
qualité, d'immuabilité et de promotion sont définies ici.

## 🧠 Modèle mental
Une porte qualité est un **contrat** : « ce qui ne satisfait pas ces critères ne
passe pas ». Un artefact est le **même objet** qui traverse tous les
environnements : on ne reconstruit pas en dev, puis en staging, puis en prod (ce
serait trois objets potentiellement différents) ; on construit UN artefact,
versionné, et on promeut CE MÊME artefact d'un environnement à l'autre.

## 📖 Explication complète
**Portes qualité qui bloquent.** Une porte n'a de valeur que si elle empêche
réellement de merger/déployer. Exemples : suite de tests verte, **seuil de
couverture** minimal, lint sans erreur, **scan de sécurité** des dépendances et
de l'image, vérification de format. Le piège : des portes « informatives » qu'on
ignore — elles donnent une fausse assurance. Une porte doit être soit bloquante,
soit assumée comme simple indicateur.

**Couverture : un signal, pas une religion.** La couverture de tests mesure le
code EXÉCUTÉ par les tests, pas la qualité des assertions. Un seuil évite les
régressions grossières, mais 100 % de couverture ne prouve pas l'absence de bug.
On l'utilise comme garde-fou, pas comme objectif ultime.

**Artefacts immuables et versionnés.** L'artefact (image, paquet, bundle) reçoit
une **version** unique (numéro sémantique, hash de commit, ou digest). Il est
**immuable** : une fois publié, il ne change plus. C'est ce qui rend un
déploiement TRAÇABLE (« la prod tourne l'artefact 1.4.2 = commit abc123 ») et un
**rollback** possible (redéployer 1.4.1).

**Construire une fois, déployer partout (build once, deploy many).** On construit
l'artefact UNE fois, on le teste, puis on PROMEUT exactement le même objet vers
staging puis prod, en ne changeant que la **configuration** (variables,
secrets — externalisés). Reconstruire par environnement casse la garantie : le
binaire testé en staging ne serait pas celui déployé en prod.

**Séparer config et artefact.** L'artefact ne contient pas la configuration
spécifique à un environnement (ni les secrets). La config est injectée au
déploiement. Ainsi le même artefact vaut pour tous les environnements.

**Promotion.** Le passage d'un environnement au suivant est une **promotion** de
l'artefact déjà validé, éventuellement soumise à une approbation manuelle pour la
prod. On ne « rejoue » pas le build ; on avance le même livrable.

## 🔧 Repères pratiques
```yaml
# Extrait : porte de couverture bloquante + publication d'un artefact versionné
- run: npm test -- --coverage
- run: node scripts/check-coverage.mjs --min 80    # échoue si < 80 % → bloque
- run: docker build -t monapi:${{ github.sha }} .  # version = hash de commit
# la config (URL, secrets) N'EST PAS dans l'image : injectée au déploiement
```
La version par hash de commit relie sans ambiguïté l'artefact au code source.

## 🧭 Exemple guidé — instaurer une porte qui protège vraiment
1. Lister les vérifications existantes : lesquelles BLOQUENT réellement ?
2. Rendre bloquantes celles qui doivent l'être (tests, seuil de couverture, scan).
3. Versionner l'artefact (hash de commit) et le publier UNE fois.
4. Promouvoir ce même artefact vers staging puis prod, config injectée à part.
5. Vérifier la traçabilité : « quel artefact tourne où ? ».

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Ton pipeline construit l'image en préproduction, la teste, puis la reconstruit pour la
   production à partir du même commit. Où est le risque ?
2. Ta porte de couverture exige 80 %. Un développeur ajoute des tests sans assertion pour
   passer. Que révèle cet épisode ?
3. Une porte « informative » signale des vulnérabilités depuis six mois. Que vaut-elle ?
4. Comment fais-tu un rollback en trente secondes ?

## ✅ Correction attendue

**La démarche.** Une porte n'a de valeur que si elle bloque ; un artefact n'a de valeur que
s'il est **le même** partout. Ces deux principes couvrent l'essentiel des incidents de
livraison.

**L'erreur probable : reconstruire à chaque étape au lieu de promouvoir.** Le raisonnement
paraît solide — même commit, même Dockerfile, même pipeline, donc même image. Il est faux,
et la liste de ce qui peut différer entre deux constructions du même commit est longue :

- une **dépendance transitive** publie une nouvelle version dans l'intervalle, et rien ne
  l'épinglait ;
- l'**image de base** (`node:20-slim`) a été redéployée sur un autre contenu — un tag est
  mutable ;
- un paquet système est mis à jour dans le registre de la distribution ;
- l'ordre des fichiers, les horodatages, un identifiant généré au build diffèrent.

Résultat : **on déploie en production un artefact que personne n'a jamais testé.** Il est
probablement identique. « Probablement » est le mot qui coûte cher, parce que le jour où il
diffère, on cherchera le bug dans le code — le seul endroit où il n'est pas.

D'où le principe **construire une fois, déployer partout** : l'artefact est construit une
seule fois, identifié par un **digest** immuable, testé, puis **promu** tel quel de
préproduction vers production. Ce qui a été validé est exactement ce qui tourne, et la
phrase « la production tourne l'artefact `sha256:abc…` = commit `abc123` » devient
vérifiable.

Le piège séduit parce que **reconstruire est plus simple à écrire**. Chaque environnement
a son job, chaque job fait son build, la configuration est symétrique et lisible. Promouvoir
demande de transporter un identifiant d'artefact entre les étapes, donc un peu de
plomberie. On choisit la symétrie apparente contre une garantie invisible — jusqu'à ce
qu'elle manque.

**Sur les autres questions.** Le développeur qui ajoute des tests sans assertion pour
franchir la porte de couverture ne révèle pas un problème de personne, mais un problème de
**mesure** : la couverture compte les lignes **exécutées**, pas les lignes **vérifiées**.
Un test qui appelle une fonction et n'affirme rien couvre parfaitement et ne teste rien.
Toute métrique transformée en cible cesse d'être une bonne métrique, et celle-ci est
particulièrement facile à satisfaire sans rien apporter. Un seuil reste utile comme
garde-fou contre les régressions grossières ; il ne remplace pas la revue des assertions.

Une porte informative ignorée depuis six mois vaut **moins que rien** : elle donne
l'impression que les vulnérabilités sont surveillées, alors qu'elles ne sont que
comptées. C'est le pire des deux mondes — le coût de l'outil, l'illusion de la protection,
et une équipe entraînée à ignorer un signal rouge. Deux issues honnêtes : la rendre
bloquante, ou la supprimer en assumant qu'on ne traite pas ce risque aujourd'hui. La
laisser clignoter est le seul choix indéfendable.

Enfin, un rollback en trente secondes suppose trois choses réunies : l'artefact précédent
**existe encore** dans le registre ; il est **identifié précisément** (digest, pas
`latest`) ; et le déploiement consiste à **désigner** une version plutôt qu'à reconstruire.
Si l'une manque, le rollback devient un redéploiement — quelques minutes dans le meilleur
cas, et l'espoir que le build passe encore. Et si une migration destructive a été appliquée
entre-temps, le rollback du code ne suffit plus : c'est ce que traite `expand/contract`.

**Alternative défendable.** Le **roll-forward systématique** — on ne revient jamais en
arrière, on corrige et on redéploie — est une politique tenable, et c'est celle de beaucoup
d'équipes à haute fréquence de livraison. Elle suppose un pipeline très rapide et une
grande confiance dans les tests. Son avantage réel : elle évite la fausse sécurité d'un
rollback jamais éprouvé.

**Vérifie seul, sans corrigé** :
1. L'image qui tourne en production a-t-elle été construite pour la production, ou promue
   depuis la préproduction ? La réponse est dans ton pipeline.
2. Tes déploiements référencent-ils un digest ou un tag ? Un tag ne te dit pas ce qui
   tourne.
3. Fais un rollback maintenant, sur un environnement de test. Chronomètre. C'est ton vrai
   temps de rétablissement, pas celui que tu annonces.

## ⚠️ Erreurs fréquentes
- Portes « informatives » qu'on ignore → fausse assurance.
- **Reconstruire par environnement** → l'objet en prod n'est pas celui testé.
- Mettre la config/les secrets DANS l'artefact → non promouvable, non sûr.
- Prendre la couverture pour une preuve d'absence de bug.
- Artefacts non versionnés → rollback impossible, prod non traçable.

## 🔐 Sécurité
Le **scan de dépendances et d'image** intégré au pipeline attrape des
vulnérabilités connues avant la prod. Les secrets ne sont jamais dans l'artefact
ni dans les logs ; ils sont injectés au déploiement. La provenance de l'artefact
(qui l'a construit, depuis quel commit) fait partie de la chaîne de confiance.

## 🏢 Cas métier
Une équipe reconstruisait l'image à chaque étape (dev, staging, prod). Un jour, la
prod échoue alors que staging était vert : une dépendance transitive avait changé
entre deux builds. Correction : construire UNE image versionnée par le hash de
commit, la promouvoir telle quelle, n'injecter que la config. Les surprises « vert
en staging, rouge en prod » disparaissent.

## 🚑 Que faire dans ce cas ? — « le pipeline passe mais l'appli ne démarre pas »
- **Symptômes** : tous les jobs sont verts, l'artefact est publié, mais une fois
  déployé, l'application ne démarre pas.
- **Premières vérifications** : l'artefact déployé est-il bien celui testé (même
  version/digest) ? la **configuration** d'exécution (variables, secrets, URL de
  base de données) est-elle fournie à l'exécution ? les logs de démarrage disent
  quoi ?
- **Cause probable** : la config a été confondue avec l'artefact — soit l'artefact
  a été reconstruit, soit la config d'exécution manque (elle n'est PAS dans
  l'artefact, elle est injectée au déploiement).
- **Correction** : promouvoir l'artefact exact déjà testé ; fournir la config au
  déploiement (pas dans l'image).
- **Prévention** : « build once, deploy many » + séparation stricte config/artefact ;
  tracer quel artefact tourne où.

## 🎤 Questions d'entretien
- « Que signifie "build once, deploy many" ? » → construire un artefact unique et
  promouvoir le même objet, config à part.
- « La couverture à 100 % garantit-elle l'absence de bug ? » → non, elle mesure le
  code exécuté, pas la qualité des tests.
- « Pourquoi versionner les artefacts ? » → traçabilité et rollback.

## ✍️ Mini-exercice
Staging est vert mais la prod casse, alors que « c'est le même code ». Quelle
pratique aurait évité ça ? → construire un artefact unique versionné et le
promouvoir (au lieu de reconstruire par environnement).

## 🧾 À retenir
- Une porte qualité n'a de valeur que si elle BLOQUE vraiment.
- Couverture = garde-fou, pas preuve d'absence de bug.
- Artefact immuable + versionné = traçabilité + rollback.
- Construire une fois, promouvoir le même objet ; config et secrets injectés à
  part.

## 📚 Vocabulaire
**porte qualité (quality gate)** · **couverture** · **scan de sécurité** ·
**artefact immuable** · **versionnage (sémantique / hash)** · **build once, deploy
many** · **promotion** · **séparation config/artefact**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Mes portes qualité bloquent réellement le passage.
- [ ] Je produis un artefact unique, versionné, immuable.
- [ ] Je promeus le même artefact et j'injecte la config à part.

## 🔗 Liens avec le programme
Mois 11 (livraison). Leçons liées :
`/doc/lessons/ci-cd-pipeline-anatomy`, `/doc/lessons/deployment-strategies`,
`/doc/lessons/testing-foundations`. L'artefact versionné est ce qui rend possibles
les stratégies de déploiement et le rollback.
