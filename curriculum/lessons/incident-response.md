<!-- keep -->
# Leçon — Répondre à un incident : méthode sous pression

## 🌍 Le problème d'abord
15 h 03. Les alertes explosent, le support est submergé, le chat s'affole : « la
prod est down ! ». Ton premier réflexe, sous l'adrénaline, est peut-être de plonger
dans le code au hasard, ou de tenter dix corrections à la fois. C'est exactement
comme ça qu'on aggrave un incident. Un incident n'est pas un problème de code : c'est
un problème d'ORGANISATION sous pression. Il faut une méthode calme et répétable :
qui décide, quoi regarder d'abord, comment limiter la casse AVANT de comprendre, quoi
communiquer. Cette leçon donne cette méthode — celle qui distingue une équipe qui
rétablit en 15 minutes d'une qui s'agite pendant 3 heures.

## 🎯 Objectif
Comprendre le **cycle de vie d'un incident** (détection → mitigation → résolution),
savoir qualifier sa **severity / impact / scope**, appliquer le **triage**, connaître
le rôle de l'**incident commander** et de la **communication**, et documenter une
**timeline** exploitable.

## 🧩 Prérequis
Tu dois savoir lire des signaux d'observabilité (`/doc/lessons/observability-fundamentals`,
`/doc/lessons/metrics-percentiles`) et connaître la notion d'**error budget**
(`/doc/lessons/slo-error-budget`) qui aide à décider de la gravité. Les mécaniques de
retour en arrière (rollback/hotfix) sont vues dans
`/doc/lessons/release-incident-recovery` — ici on couvre le PROCESSUS.

## 🧠 Modèle mental
Un incident se gère comme une urgence médicale, pas comme une enquête tranquille. Aux
urgences, on STABILISE le patient (arrêter l'hémorragie) AVANT de diagnostiquer en
profondeur. Pareil : on **limite l'impact** d'abord (rétablir le service), on
comprend la cause racine APRÈS (post-mortem). Et il y a UN médecin qui coordonne
(l'incident commander) — sinon dix personnes tirent dans dix directions. Limite de
l'analogie : ici « le patient » est un service, et on peut souvent revenir en arrière
(rollback), ce qu'un corps ne permet pas.

## 📖 Explication progressive
**Cycle de vie.** Détection (une alerte, un utilisateur) → déclaration (« c'est un
incident ») → triage (gravité ?) → mitigation (limiter l'impact) → résolution
(service rétabli) → post-mortem (comprendre et prévenir — leçon suivante). Séparer
« mitiger » et « résoudre la cause » est essentiel : on peut rétablir par un rollback
sans encore savoir POURQUOI ça cassait.

**Qualifier : severity, impact, scope.**
- **Impact** : qui/quoi est touché (tous les utilisateurs ? une région ? une
  fonctionnalité ?) et à quel point (service inutilisable vs dégradé).
- **Scope** : l'étendue (un endpoint, un service, tout le système).
- **Severity** (SEV1/2/3…) : un niveau de gravité qui découle de l'impact et du
  scope, et qui décide de la réponse (réveiller l'astreinte ? prévenir la direction ?).
Un SEV1 (prod down pour tous) ne se traite pas comme un SEV3 (bug mineur pour 1 %).

**Triage.** Comme aux urgences : classer vite pour agir sur ce qui compte. On ne
corrige pas tout ; on identifie le symptôme le plus impactant et l'action qui limite
le plus l'impact pour le moindre risque.

**Incident commander (IC).** UNE personne coordonne : elle ne répare pas
forcément elle-même, elle ORCHESTRE (qui fait quoi, quelle hypothèse on teste, quand
on communique). Sans IC, on a des efforts redondants et des décisions contradictoires.
Des rôles annexes : « scribe » (tient la timeline), « communications » (parle aux
parties prenantes).

**Communication.** Prévenir tôt et régulièrement : statut, impact connu, ce qu'on
fait, prochaine mise à jour. Le silence pendant un incident fait paniquer clients et
direction plus que la panne elle-même. On communique des FAITS, pas des promesses.

**Timeline et preuves.** On note l'heure de chaque événement et décision : alerte à
15 h 03, rollback lancé à 15 h 12, service ok à 15 h 18. On conserve les preuves
(graphes, logs, traces) AVANT qu'elles ne disparaissent (rotation des logs) — elles
serviront au post-mortem. Ne pas « nettoyer » un incident sans avoir gardé les traces.

## 🔎 Décomposition
- mitiger (limiter l'impact) ≠ résoudre la cause (post-mortem).
- severity découle de impact × scope, et décide de l'escalade.
- IC = coordination ; scribe = timeline ; comms = parties prenantes.
- garder les preuves avant qu'elles disparaissent.

## 🛠 Exemple guidé — « les 5xx explosent après une release »
1. **Détection** : alerte sur le taux d'erreur (burn rate élevé, cf. SLO).
2. **Qualifier** : impact = tous les utilisateurs, scope = tout le service → SEV1.
3. **IC désigné** ; comms : « incident en cours, on investigue, update dans 15 min ».
4. **Mitiger AVANT de comprendre** : la release est le suspect n°1 → rollback (cf.
   release-incident-recovery). Service rétabli à 15 h 18.
5. **Preuves gardées** (graphes, logs de la fenêtre) → post-mortem plus tard pour la
   cause racine.

## 🧪 Mise en pratique
Voir la pratique associée : agréger l'état de santé, prioriser les symptômes, décider
rollback vs roll-forward.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. Il est 15 h 02, les 5xx explosent après une release de 15 h 00. Quelle est ta
   première action, et pourquoi celle-là plutôt qu'une autre ?
2. Cinq ingénieurs compétents sont sur l'incident. Pourquoi faut-il en désigner un qui
   ne répare rien ?
3. Tu ne sais pas encore quoi dire aux clients parce que tu ne comprends pas la panne.
   Communiques-tu quand même ? Que dis-tu ?
4. Le service est rétabli à 15 h 18 par un rollback. L'incident est-il terminé ?

## ✅ Correction attendue

**La démarche.** Un incident se traite dans un ordre qui n'est pas celui de la
curiosité : **qualifier, mitiger, communiquer, comprendre.** L'envie de comprendre
arrive naturellement en premier et c'est précisément ce qu'il faut différer.

**L'erreur probable : chercher la cause avant de réduire l'impact.** Devant les 5xx, le
réflexe d'un bon ingénieur est d'ouvrir les logs. C'est du travail utile, fait
correctement, par la personne compétente — et c'est la mauvaise action à 15 h 02.

Pendant qu'on lit les logs, les utilisateurs continuent de subir la panne. Or
**rétablir et comprendre sont deux tâches séparables**, et l'une des deux est urgente.
Le rollback ne demande pas de savoir *pourquoi* la release a cassé : il suffit de
savoir *qu'elle* a cassé, ce que la corrélation temporelle établit en dix secondes. On
rétablit d'abord, on enquête ensuite — avec les preuves conservées, sans la pression,
et sans les utilisateurs en attente.

Le piège séduit parce que **comprendre paraît plus sérieux que rétablir**. Rollbacker
sans savoir pourquoi ressemble à de la magie honteuse, et il reste toujours la crainte
de « masquer » le problème. C'est confondre deux temps : la mitigation ne remplace pas
le post-mortem, elle lui laisse le temps d'être fait correctement. Une équipe qui
enquête pendant l'incident produit un mauvais diagnostic **et** une longue panne.

**Sur les autres questions.** L'incident commander ne répare rien parce que c'est
justement ce qui lui permet de décider : il tient l'état d'ensemble, arbitre les
hypothèses concurrentes, et sait qui fait quoi. Sans lui, cinq personnes compétentes
testent trois hypothèses en double, deux d'entre elles modifient la production
simultanément, et plus personne ne sait ce qui a produit quel effet. **Le rôle existe
parce que la compétence technique ne se coordonne pas toute seule** — et il est
d'autant plus nécessaire que les gens sont bons, puisque chacun a une piste crédible.

Communiquer sans comprendre : **oui, immédiatement**, et c'est contre-intuitif. On ne
communique pas une explication, on communique des faits et un rythme : *« Depuis 15 h 02,
les paiements échouent pour une partie des utilisateurs. Nous investiguons. Prochaine
mise à jour à 15 h 20. »* Trois informations, aucune promesse. Le silence, lui, est
interprété comme de l'incompétence ou de la dissimulation, et il déclenche des appels
qui consomment le temps de ceux qui réparent.

Enfin, l'incident **n'est pas terminé** à 15 h 18. Le service est rétabli, ce qui est
autre chose : la cause est intacte, la release est toujours à livrer, et la migration
destructive qui a empêché le rollback est encore là. Confondre « rétabli » et
« résolu » est ce qui produit le même incident deux semaines plus tard.

**Alternative défendable.** Le **roll-forward** — corriger et redéployer plutôt que
revenir en arrière — est le bon choix quand le retour arrière est impossible (migration
destructive déjà appliquée) ou plus risqué que la correction. Ce n'est pas un aveu
d'échec : c'est le calcul honnête entre deux risques. Ce qui n'est jamais défendable,
c'est de choisir entre les deux **sans avoir vérifié que le rollback fonctionne** — la
plupart des équipes découvrent qu'il ne fonctionne pas au pire moment.

**Vérifie seul, sans corrigé** :
1. Ton dernier incident : combien de temps entre la détection et la première action de
   mitigation ? Combien entre la détection et la première communication ?
2. Ton rollback a-t-il été testé cette année, en conditions réelles ? Si la réponse est
   non, tu n'as pas de rollback, tu as une intention.
3. Écris à l'avance le message de communication des trois premières minutes, avec les
   trous à remplir. Le rédiger sous stress est la pire façon de le rédiger.

## ⚠️ Erreurs fréquentes / anti-patterns
- **Chercher la cause AVANT de limiter l'impact** (l'utilisateur attend).
- **Pas d'incident commander** → chaos, actions contradictoires.
- **Silence** vers les parties prenantes → panique.
- Tenter **plusieurs corrections à la fois** → on ne sait plus ce qui a marché.
- **Ne pas garder les preuves** → post-mortem impossible.
- Traiter un SEV3 comme un SEV1 (ou l'inverse) → mauvaise allocation.

## 🏢 Cas métier
Sans processus, une panne durait souvent 2-3 h dans une équipe : tout le monde
débuggait en parallèle, personne ne communiquait. Après avoir instauré un IC, une
échelle de severity et une timeline systématique, le temps de rétablissement (MTTR)
a chuté : on mitige d'abord (rollback), on communique, on comprend ensuite. Le calme
organisé bat l'héroïsme individuel.

## 🚨 Que faire dans ce cas ? — « incident déclaré, tout le monde s'affole »
1. **Nommer un IC** (une seule voix qui coordonne).
2. **Qualifier** severity/impact/scope.
3. **Communiquer** un premier statut.
4. **Mitiger** l'impact (rollback, feature flag, redirection) AVANT de chercher la
   cause.
5. **Une hypothèse à la fois**, testée, tracée dans la timeline.
6. **Valider** le rétablissement (les métriques reviennent).
7. **Garder les preuves** → post-mortem sans blâme (leçon suivante).

## 🎤 Questions d'entretien
- « Quelle est la première priorité dans un incident ? » → limiter l'impact
  (rétablir), pas comprendre la cause.
- « À quoi sert un incident commander ? » → coordonner ; éviter les efforts
  redondants et les décisions contradictoires.
- « Différence mitigation / résolution ? » → limiter l'impact vs corriger la cause
  racine.

## ✅ À retenir
- Stabiliser d'abord, comprendre ensuite (mitiger ≠ résoudre la cause).
- Qualifier severity/impact/scope pour dimensionner la réponse.
- Un incident commander coordonne ; on communique tôt et souvent.
- Timeline + preuves conservées = post-mortem possible.

## 📚 Vocabulaire
**incident** · **cycle de vie** · **severity (SEV1/2/3)** · **impact / scope** ·
**triage** · **mitigation vs résolution** · **incident commander** · **escalade** ·
**timeline** · **MTTR / MTTD** · **communication d'incident**.

## 🎯 Pratique associée
Exercices : agrégation de santé, priorisation, décision rollback/roll-forward.

## 🔗 Liens avec le programme
Jour `/day/79` (observabilité/incident). Leçons liées :
`/doc/lessons/slo-error-budget`, `/doc/lessons/release-incident-recovery`,
`/doc/lessons/postmortem-rca`, `/doc/lessons/deployment-strategies`. Mitiger d'abord ;
le post-mortem traite la cause racine.
