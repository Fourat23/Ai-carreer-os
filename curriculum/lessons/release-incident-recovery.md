<!-- keep -->
# Leçon — Reprise après incident : rollback, roll-forward, hotfix

> **📚 Étagère de référence — cette leçon n'est programmée par aucune des 365 journées.**
> Tu ne l'as pas manquée : le parcours ne t'y enverra jamais, et aucune journée ne suppose
> que tu l'as lue. Elle est là pour être ouverte quand tu en as besoin — par curiosité, pour
> un projet, ou parce qu'une leçon du parcours y renvoie pour approfondir un point.


## 🌍 Le problème d'abord
Il est 15 h, vous venez de livrer, et le taux d'erreurs explose. Panique ? Non :
méthode. La toute première décision n'est PAS « comprendre le bug » — c'est
**rétablir le service** au plus vite pour les utilisateurs, quitte à comprendre
après. Mais rétablir comment ? Revenir à la version d'avant (rollback) ? Foncer vers
un correctif (roll-forward / hotfix) ? Couper la fonctionnalité fautive ? Le mauvais
choix aggrave l'incident — par exemple, un rollback devient IMPOSSIBLE si une
modification de base de données est déjà passée. Cette leçon donne le réflexe et les
critères pour choisir, puis la discipline de l'après (post-mortem sans blâme). On
part du principe fondateur : « rétablir d'abord, comprendre ensuite ».

## 🎯 Objectif
Savoir RÉAGIR quand une release tourne mal : distinguer **rollback**,
**roll-forward** et **hotfix**, choisir la bonne réponse selon la situation, et
comprendre pourquoi les artefacts versionnés et les migrations compatibles rendent
la reprise possible. L'objectif d'un incident : rétablir vite, comprendre ensuite.

## 🧩 Prérequis
Vous devez comprendre les **artefacts versionnés** (ce qui rend un rollback possible
— `/doc/lessons/ci-cd-quality-gates-artifacts`) et les **stratégies de déploiement**
(rolling, canary, feature flag, migrations — `/doc/lessons/deployment-strategies`).
Les termes rollback, roll-forward, hotfix et post-mortem sont définis ici.

## 🧠 Modèle mental
En incident, la priorité n'est pas de COMPRENDRE, c'est de RÉTABLIR le service
(stop the bleeding), puis de diagnostiquer à froid. Trois façons de rétablir :
revenir à la version d'avant (**rollback**), avancer vite vers une version
corrigée (**roll-forward**/hotfix), ou désactiver le coupable (**feature flag**).
Le bon réflexe dépend de ce qui est le plus RAPIDE et le plus SÛR ici et
maintenant.

## 📖 Explication complète
**Rollback.** Redéployer l'artefact précédent, connu bon. C'est possible SI les
artefacts sont versionnés et immuables ET si aucune migration destructive n'a
rendu l'ancienne version incompatible avec la base. Rapide et sûr quand ces
conditions tiennent. Un blue-green rend le rollback quasi instantané (rebascule).

**Roll-forward.** Quand le rollback est impossible ou risqué (une migration de
base est déjà passée, ou l'ancienne version a d'autres défauts), on avance : on
corrige et on déploie une NOUVELLE version. Plus lent qu'un rollback, mais parfois
la seule option sûre. Souligne pourquoi les migrations doivent être compatibles :
un schéma non rétro-compatible ferme la porte du rollback.

**Hotfix.** Un correctif URGENT, minimal, ciblé sur le bug de prod, déployé hors
du cycle normal. Discipline indispensable : le hotfix doit être **reporté** sur la
branche principale (sinon il « disparaît » à la release suivante — régression). Un
hotfix reste soumis aux portes qualité essentielles ; on ne contourne pas tout
sous prétexte d'urgence.

**Feature flag comme filet.** Si la fonctionnalité fautive est derrière un flag,
la réponse la plus rapide est souvent de la COUPER : rétablissement immédiat sans
redéploiement, le temps de corriger.

**Décider vite.** Critère : quelle action rétablit le plus vite avec le moins de
risque ? Souvent rollback si disponible ; flag si applicable ; roll-forward si le
rollback est fermé (migration) ou insuffisant.

**Après coup : post-mortem sans blâme.** Une fois rétabli, on analyse la cause
racine et on tire des actions correctives (tests manquants, porte qualité,
migration mal planifiée). Sans blâme : on corrige le SYSTÈME qui a laissé passer,
pas la personne. C'est ce qui fait progresser la fiabilité.

## 🔧 Repères pratiques (démarche)
```
1. Détecter + confirmer l'impact (métriques, alertes).
2. Rétablir : rollback (artefact précédent) OU couper le flag OU roll-forward.
3. Communiquer (statut, périmètre, ETA) aux parties prenantes.
4. Stabiliser, vérifier le retour à la normale.
5. Post-mortem sans blâme : cause racine + actions durables.
```

## 🧭 Exemple guidé — « la nouvelle version provoque des erreurs 500 »
1. Confirmer : quel taux d'erreur, depuis quand, corrélé au déploiement ?
2. Une **migration destructive** est-elle passée ? Si non → **rollback** vers
   l'artefact précédent (rapide, sûr).
3. Si oui (rollback fermé) → **roll-forward** : hotfix ciblé + déploiement ; ou
   couper un flag si le fautif est isolable.
4. Une fois stable : reporter le hotfix sur main, écrire le post-mortem.

## ⚠️ Erreurs fréquentes
- Vouloir COMPRENDRE avant de RÉTABLIR (l'utilisateur attend le service).
- Tenter un **rollback** après une **migration destructive** → incompatibilité,
  aggravation.
- **Hotfix non reporté** sur main → le bug revient à la release suivante.
- Contourner TOUTES les vérifications « parce que c'est urgent » → second incident.
- Post-mortem transformé en recherche de coupable → on n'apprend rien.

## 🔐 Sécurité
Garder la traçabilité : quel artefact tournait, qui a déclenché quoi. Un rollback
ne doit pas réintroduire une version vulnérable connue (arbitrer). Les accès de
déploiement d'urgence restent audités ; l'urgence ne justifie pas de désactiver la
journalisation.

## 🏢 Cas métier
Une release fait grimper les 500. Les artefacts sont versionnés et aucune
migration destructive n'a eu lieu : rollback vers la version précédente en deux
minutes, service rétabli. Post-mortem : un cas limite non testé ; ajout d'un test
de non-régression et d'une porte qualité. La release suivante repasse, corrigée,
par le cycle normal.

## 🎤 Questions d'entretien
- « Rollback vs roll-forward ? » → revenir à la version précédente vs avancer vers
  une version corrigée.
- « Qu'est-ce qui empêche un rollback ? » → une migration de base destructive /
  non rétro-compatible.
- « Que faire d'un hotfix après l'incident ? » → le reporter sur la branche
  principale pour éviter la régression.

## ✍️ Mini-exercice
Une release casse la prod, mais une migration a supprimé une colonne. Rollback ou
roll-forward ? → roll-forward (le rollback est fermé : l'ancienne version serait
incompatible avec le nouveau schéma).

## 🧾 À retenir
- Rétablir d'abord, comprendre ensuite.
- Rollback si artefact versionné + pas de migration destructive ; sinon
  roll-forward.
- Feature flag = rétablissement immédiat quand applicable.
- Hotfix toujours reporté sur main ; post-mortem sans blâme, actions durables.

## 📚 Vocabulaire
**rollback** · **roll-forward** · **hotfix** · **feature flag** · **migration
destructive** · **post-mortem sans blâme** · **cause racine** · **rayon
d'impact**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je choisis rollback / roll-forward / flag selon la situation.
- [ ] Je sais pourquoi une migration destructive ferme le rollback.
- [ ] Je reporte les hotfix et je conduis un post-mortem sans blâme.

## 🔗 Liens avec le programme
Mois 11 (production, incidents). Leçons liées :
`/doc/lessons/deployment-strategies`,
`/doc/lessons/ci-cd-quality-gates-artifacts`,
`/doc/lessons/observability-logging`. La reprise après incident boucle le cycle de
livraison et prépare la fiabilité en cloud/Kubernetes.
