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
