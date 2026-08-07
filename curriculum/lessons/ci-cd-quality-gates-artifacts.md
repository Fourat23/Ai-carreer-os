<!-- keep -->
# Leçon — CI/CD : portes qualité et artefacts versionnés

## 🎯 Objectif
Transformer un pipeline « qui passe » en pipeline « qui protège » : définir des
**portes qualité** (tests, couverture, sécurité, lint) qui BLOQUENT vraiment,
produire des **artefacts immuables et versionnés**, et appliquer le principe
**construire une fois, déployer partout**.

## 🧩 Prérequis
Anatomie d'un pipeline (`/doc/lessons/ci-cd-pipeline-anatomy`).

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
