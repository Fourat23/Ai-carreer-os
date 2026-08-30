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

## 🧭 Exemple guidé — « la porte est à 90 % de couverture, on est protégés »

Cette porte est la plus répandue de toutes, et c'est aussi celle qui se trompe
le plus discrètement. Plutôt que d'en discuter, on va écrire deux suites de
tests sur le **même** code et mesurer laquelle protège. Le script
`scripts/v70-verifications/porte-couverture.mjs` le fait avec le calcul de
couverture intégré à Node.

**Le code testé** est une fonction de remise contenant un défaut réel et
précis :

```js
export function prixApresRemise(prix, pourcentage) {
  if (pourcentage < 0) throw new RangeError('pourcentage negatif');
  if (pourcentage > 100) return 0;
  return Math.floor(prix * (100 - pourcentage)) / 100;   // ← l arrondi ne sert à rien
}
```

`Math.floor` est appliqué **avant** la division, donc il n'arrondit rien :
`Math.floor(1999 × 90)` vaut 179910, puis `/ 100` donne **1799,1**. La fonction
rend un nombre de centimes fractionnaire, qui se propagera dans la base et dans
tous les totaux.

**La suite A** appelle chaque fonction avec plusieurs entrées, y compris les cas
limites, et termine par `assert.ok(true)`. C'est exactement la suite qu'on écrit
quand l'objectif à atteindre est un pourcentage.

**La suite B** contient un seul test, une seule assertion, et une valeur
attendue calculée à la main.

Mesure :

```
suite A (appelle tout, n affirme rien) : lignes 100,00 % · branches 100,00 % · fonctions 100,00 %  -> VERTE
suite B (une seule assertion vraie)     : lignes  88,89 % · branches  66,67 % · fonctions  66,67 %  -> ROUGE
```

La suite A obtient **100 % sur les trois indicateurs** et passe la porte. La
suite B est à 88,89 % de lignes : elle est **refusée par une porte à 90 %**. Et
c'est la suite B qui a trouvé le défaut — parce qu'elle compare, tandis que la
suite A se contente d'exécuter.

Le test se poursuit avec une régression franche : on remplace `100 - pourcentage`
par `100 + pourcentage`, ce qui transforme une remise en majoration.

```
suite A : couverture lignes 100,00 % -> VERTE
suite B : couverture lignes  87,50 % -> ROUGE
```

**Une remise qui augmente le prix passe la porte sans la faire bouger d'un
point.** La couverture n'a pas baissé, parce qu'elle ne mesure pas ce que le
code fait : elle mesure quelles lignes ont été exécutées.

### Ce qu'il faut en conclure — et ce qu'il ne faut pas

La mauvaise conclusion est « la couverture ne sert à rien ». C'est faux dans le
sens utile : une couverture **basse** est une information fiable. Elle prouve
que du code n'est jamais exécuté par les tests, et donc qu'aucun test ne peut le
protéger. À 30 % de couverture, on sait quelque chose de vrai.

La bonne conclusion porte sur le sens de l'implication. La couverture est une
**condition nécessaire et non suffisante** : ligne non couverte ⇒ ligne non
protégée, mais ligne couverte ⇏ ligne protégée. Une porte de couverture peut
donc refuser du travail insuffisant ; elle ne peut jamais certifier du travail
suffisant.

Et il y a pire que « ne rien certifier » : la porte **oriente le comportement**.
Quand le nombre devient l'objectif, la suite A est la réponse rationnelle — elle
est plus rapide à écrire que la suite B et elle rapporte davantage. Une équipe
sous pression convergera vers elle sans mauvaise intention. C'est la raison pour
laquelle une porte de couverture haute, posée seule, produit souvent une
couverture élevée et une protection faible. La contre-mesure n'est pas de monter
le seuil : c'est d'ajouter une porte qui mesure autre chose — un test de
mutation, qui modifie le code et vérifie qu'un test rougit, répond exactement à
la question à laquelle la couverture ne répond pas.

### Instaurer une porte qui protège vraiment — la démarche

1. **Inventorier ce qui bloque réellement.** Pour chaque vérification du
   pipeline, une seule question : si elle échoue, la fusion est-elle impossible ?
   Beaucoup de vérifications affichent un résultat sans rien empêcher. Elles
   informent, elles ne protègent pas — et il faut le savoir.
2. **Choisir ce que chaque porte mesure, et ce qu'elle ne mesure pas.** Écrire
   la limite à côté de la porte, comme ci-dessus. Une porte dont personne ne
   connaît la limite finit par être lue comme une garantie générale.
3. **Poser le seuil avant de voir le résultat.** Un seuil ajusté après coup ne
   fait que décrire l'état actuel.
4. **Vérifier que la porte peut refuser.** Le test est le même que pour la CI :
   fabriquer une modification qui doit être refusée, et constater le refus. Une
   porte jamais vue rouge est une décoration.
5. **Construire l'artefact une fois, le promouvoir ensuite.** L'artefact est
   versionné par l'empreinte du commit, immuable, et c'est **le même octet pour
   octet** qui passe de recette à production. La configuration et les secrets
   sont injectés au déploiement, jamais gravés dedans — sinon il faut
   reconstruire par environnement, et « le même code » redevient une supposition.
6. **Rendre la traçabilité interrogeable.** « Quel artefact tourne où, et de
   quel commit vient-il ? » doit avoir une réponse en une commande, pas une
   enquête.

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
Sans relire : une porte à 90 % de couverture peut-elle refuser une bonne suite
de tests et accepter une mauvaise ? Justifie en une phrase.

## 🔥 Pratique — mesurer ce que tes portes protègent réellement

**A. Reproduire l'expérience sur ton propre code.** Choisis un module de l'un de
tes projets. Écris deux suites : une qui maximise la couverture sans vérifier
grand-chose, une qui vérifie peu de choses mais réellement. Mesure la couverture
des deux. Livrable : les deux pourcentages et les deux fichiers.

**B. Le test de mutation, à la main.** Introduis dix modifications ponctuelles
dans ton code — inverser une comparaison, remplacer `&&` par `||`, changer un
`+` en `-`, supprimer une ligne de garde, décaler une borne de 1. Pour chacune,
lance ta suite et note si elle rougit. Livrable : le tableau des dix mutations
avec « détectée / non détectée », et le score.

**C. Éprouver chaque porte de ton pipeline.** Pour chaque vérification
bloquante, fabrique une modification qui doit la faire échouer, pousse, et
garde la trace du refus. Livrable : la liste des portes avec, pour chacune, le
lien vers l'exécution rouge — ou la mention « n'a pas refusé ».

**D. Prouver l'unicité de l'artefact.** Fais construire ton projet deux fois
dans le pipeline et compare les empreintes des deux sorties. Puis construis-le
une fois et déploie le même fichier vers deux environnements. Livrable : les
empreintes, et la réponse à « est-ce le même octet pour octet ? ».

## ✅ Correction attendue

**A — l'écart attendu.** Sur la plupart des modules, la suite « pour le
pourcentage » dépasse la suite « pour la vérité », souvent largement. Les
valeurs mesurées dans la section guidée — 100 % contre 88,89 % — ne sont pas une
curiosité : elles sont le résultat normal, parce qu'appeler une fonction est
plus rapide que calculer sa valeur attendue. Si ton expérience donne l'inverse,
regarde si ta suite « pour le pourcentage » n'affirme pas quelque chose par
accident.

Le point à formuler : la couverture ne distingue pas `f(x)` de
`assert.equal(f(x), attendu)`. Les deux exécutent les mêmes lignes.

**B — le score de mutation.** C'est le chiffre qui répond vraiment à « mes tests
protègent-ils ». Une suite qui détecte 9 mutations sur 10 protège ; une suite à
3 sur 10 ne protège pas, quelle que soit sa couverture. Les mutations qui
survivent le plus souvent, dans l'ordre :

- **les bornes** (`<` contre `<=`) — presque jamais testées, parce qu'un seul
  cas nominal les traverse sans les distinguer ;
- **la gestion d'erreur** — le chemin d'échec est couvert par un test qui vérifie
  qu'« une erreur est levée » sans vérifier laquelle ;
- **les valeurs de retour dans les branches rares**, exécutées par un test qui
  ne regarde pas ce qui sort.

Une mutation qui survit n'est pas nécessairement un test à ajouter : parfois
c'est du code mort, et la bonne action est de le supprimer. C'est un bénéfice
secondaire et réel de l'exercice.

**C — les portes qui ne refusent pas.** Attends-toi à en trouver. Les causes
récurrentes : la vérification tourne sur `push` mais pas sur les demandes de
fusion ; elle est bloquante dans le fichier de pipeline mais n'est pas déclarée
requise dans le réglage de branche protégée ; elle est marquée
`continue-on-error`. Cette dernière est particulièrement traître, parce que
l'exécution apparaît en rouge dans l'interface tout en laissant la fusion
possible.

La réponse attendue distingue deux niveaux : **le pipeline décide de l'échec, la
plateforme décide du blocage.** Une porte n'est bloquante que si les deux sont
alignés, et seul un essai réel le prouve.

**D — l'artefact unique.** Deux constructions successives du même commit
donnent rarement des fichiers identiques : horodatages intégrés, ordre de
parcours de fichiers, chemins absolus, versions de dépendances résolues
différemment. Ce résultat est le bon résultat de l'exercice — il justifie la
règle qui suit.

Puisqu'on ne peut pas garantir que deux constructions sont identiques, on ne
construit qu'**une fois**. L'artefact porte l'empreinte du commit, il est stocké
et immuable, et c'est ce fichier-là qui est promu vers recette puis production.
Reconstruire par environnement fait de « c'est le même code » une supposition
non vérifiée — et c'est très exactement le mécanisme derrière « ça passe en
recette, ça casse en production ».

Corollaire à ne pas manquer : si le même artefact va dans les deux
environnements, alors ce qui les distingue ne peut plus être dedans. La
configuration et les secrets sont **injectés au déploiement**. Un artefact qui
contient l'URL de la base de recette n'est pas promouvable ; il faut le
reconstruire, et on a reperdu la propriété qu'on cherchait.

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
