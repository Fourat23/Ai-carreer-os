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
(`/doc/lessons/slo-error-budget`) qui aide à décider de la gravité. Ici on couvre le
PROCESSUS de réponse, pas les mécaniques de retour en arrière.

Ce qu'il faut savoir de ces mécaniques pour lire cette leçon, en trois phrases : **revenir en
arrière (rollback)**, c'est redéployer la version précédente — possible seulement si son
artefact existe encore et si aucune migration destructive n'a été appliquée depuis ;
**aller de l'avant (roll-forward)**, c'est corriger et redéployer, ce qu'on choisit quand le
retour est impossible ou plus risqué ; et un **correctif à chaud (hotfix)** est un
roll-forward minimal, limité à la ligne qui casse. C'est tout ce dont cette leçon a besoin.

> **Où trouver le détail.** `/doc/lessons/release-incident-recovery` approfondit ces
> mécaniques. Elle est sur **l'étagère de référence** : aucune des 365 journées ne la
> programme, tu peux l'ouvrir quand tu veux, et rien dans le parcours ne suppose que tu l'as
> lue.

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

## 🛠 Exemple guidé — « les 5xx explosent après une mise en production »

L'instinct pendant un incident est de faire vite. Le problème est qu'on fait vite
la mauvaise chose, parce qu'on n'a jamais regardé où part réellement le temps.
Le script `scripts/v70-verifications/incidents-arithmetique.mjs` fait ce calcul.
Tout y est de l'arithmétique explicite : ce ne sont pas des mesures de
laboratoire, mais chaque formule est donnée et tu peux la refaire avec **tes**
chiffres.

### 1. Décomposer le temps de rétablissement

Un incident de 37 minutes, décomposé :

```
détection       (le système signale)  :  6,0 min  (16 %)
prise en charge (quelqu un regarde)   :  4,0 min  (11 %)
diagnostic      (on comprend)         : 22,0 min  (59 %)
décision        (on choisit)          :  3,0 min  ( 8 %)
exécution       (on rétablit)         :  2,0 min  ( 5 %)
```

**Le diagnostic pèse 59 %. L'exécution pèse 5 %.** Automatiser parfaitement le
retour arrière fait gagner au mieux deux minutes sur trente-sept — alors que
c'est l'investissement que les équipes font en premier, parce qu'il est
technique, mesurable et satisfaisant.

Ce qui accélère un diagnostic n'est pas de l'outillage de déploiement : c'est de
l'observabilité (savoir quelle version, quelle route, quel taux d'erreur, sans
enquête) et un manuel écrit d'avance. Refais ce calcul sur ton dernier incident
réel avant de décider quoi améliorer ; la répartition ci-dessus est un exemple,
la tienne est ce qui compte.

### 2. Rétablir avant de comprendre — sauf pour l'irréversible

L'ordre est bien « rétablir d'abord, comprendre ensuite » : l'utilisateur attend
le service, pas l'explication. Mais cette règle a une exception qui n'est jamais
énoncée et qui coûte cher.

**Rétablir ne veut pas dire « faire quelque chose ».** La leçon
`release-incident-recovery` mesure un cas où l'action de rétablissement — exécuter
le retour arrière d'une migration — a détruit définitivement la devise de 50
commandes, alors que le bug initial n'avait rien détruit. L'action était
légitime, rapide, et bien intentionnée.

D'où la règle qui s'ajoute : **sous pression, l'action irréversible est celle
qu'il faut refuser de prendre vite.** Les quatre questions, dans l'ordre :

1. **Un drapeau de fonctionnalité couvre-t-il le fautif ?** Le couper est le
   rétablissement le plus rapide, et le seul qui ne redéploie rien.
2. **Une opération irréversible est-elle passée ?** Suppression de données,
   courriels envoyés, paiements capturés, messages publiés dans une file. Si oui,
   le retour arrière est **fermé** : il ne restaurera pas l'état d'avant, il en
   fabriquera un troisième. Direction correction en avant.
3. **Sinon, revenir à l'artefact précédent** — à condition qu'il existe encore,
   versionné et immuable.
4. **Une fois disponible, vérifier la correction et pas seulement la
   disponibilité.** Un service qui répond peut produire des totaux faux, et c'est
   la disponibilité qu'on surveille.

### 3. Le coût de l'alerte, qui décide de tout le reste

Une alerte qui se déclenche à tort n'est pas neutre : elle consomme la ressource
qui manque pendant un incident, qui est l'attention. À huit minutes pour vérifier
une alerte et conclure « rien » :

```
 50 contrôles · 1 %   de faux par contrôle et par heure -> 12,0/jour ->  1,6 h/jour
200 contrôles · 1 %   de faux par contrôle et par heure -> 48,0/jour ->  6,4 h/jour
200 contrôles · 0,1 % de faux par contrôle et par heure ->  4,8/jour -> 38,4 min/jour
```

À deux cents contrôles et 1 % de faux, quelqu'un passe **plus de six heures par
jour** à vérifier des alertes qui ne sont rien. Personne ne tient : on cesse de
les vérifier. **C'est ainsi qu'une vraie alerte est ignorée** — non par
négligence, mais parce que la charge rendait la vigilance impossible.

Deux conséquences, dont la seconde est contre-intuitive. Le **nombre** de
contrôles n'est pas gratuit : ajouter une alerte a un coût permanent, et une
alerte qui n'a jamais rien attrapé se retire. Et un taux de faux de 1 % par
contrôle, qui semble excellent pris isolément, est ingérable à l'échelle — c'est
la même multiplication que pour les tests instables dans la leçon `ci-cd`.

Le critère qui départage une bonne alerte : **elle décrit un symptôme pour
l'utilisateur, et elle est actionnable.** « Le taux d'erreur de la route de
paiement dépasse 2 % depuis 5 minutes » l'est. « L'utilisation processeur dépasse
80 % » ne l'est pas : ce n'est ni un symptôme utilisateur, ni une action.

### 4. Pendant l'incident, la partie qu'on néglige

Trois choses se jouent en parallèle du technique, et l'absence de chacune allonge
la durée mesurée en 1.

**Un rôle de coordination**, distinct de celui qui répare. La personne qui a les
mains dans le système ne peut pas en même temps répondre aux questions,
communiquer et arbitrer. Sans ce partage, le diagnostic est interrompu toutes les
deux minutes — et c'est le poste de 59 %.

**Une communication rythmée**, même sans nouvelle. « Point à 14 h 40 : toujours
en cours, périmètre inchangé » vaut mieux que le silence : le silence produit des
questions, et les questions interrompent.

**Un journal horodaté**, écrit pendant et non après. Ce que tu as vu, ce que tu
as fait, à quelle heure. C'est la matière du compte rendu, et il est
impossible à reconstituer de mémoire — surtout l'ordre exact des actions, qui est
justement ce qu'on cherchera pour comprendre laquelle a aggravé.

## 🧪 Mise en pratique — chiffrer ton propre dispositif

**A. Décomposer un incident réel.** Prends le dernier incident de ton projet (ou
un exercice si tu n'en as pas) et décompose sa durée en cinq phases : détection,
prise en charge, diagnostic, décision, exécution. Livrable : le tableau avec les
pourcentages, et la phase qui domine.

**B. Chiffrer tes fausses alertes.** Compte le nombre de contrôles qui peuvent te
notifier et estime leur taux de faux. Calcule le temps de vérification quotidien.
Puis liste les alertes qui n'ont **jamais** correspondu à un problème réel.
Livrable : le chiffre en heures par jour, et la liste des alertes à retirer.

**C. Écrire le manuel.** Rédige la procédure de rétablissement de ton service sur
une page : la commande exacte de retour arrière, la liste **nominative** des
opérations qui ferment le retour arrière dans ton système, la requête qui répond
à « combien de lignes la version fautive a-t-elle écrites », et qui prévenir.

**D. Éprouver le manuel, chronomètre en main.** Provoque une panne dans un
environnement de test et exécute ton manuel sans improviser. Chaque fois que tu
dois en sortir pour avancer, note-le. Livrable : le temps de rétablissement et la
liste des trous.

**E. Comparer deux actions correctives.** À partir de A, calcule ce que
rapporterait sur un an : corriger le bug de cette fois, contre diviser par deux
le temps de diagnostic. Livrable : les deux chiffres et ta décision.

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

### Sur la mise en pratique A → E

**A — la décomposition.** Attends-toi à ce que le diagnostic domine, souvent
au-delà de la moitié. Deux pièges de mesure. Le premier : faire commencer
l'incident au moment où **tu** as été prévenu, ce qui efface la phase de
détection — or c'est justement elle qui se réduit par l'outillage. Le second :
oublier la prise en charge, le temps entre l'alerte et le moment où quelqu'un
regarde vraiment, qui peut être énorme la nuit.

La conclusion attendue est un choix d'investissement. Si le diagnostic pèse
60 %, l'argent va dans l'observabilité et le manuel, pas dans l'automatisation du
déploiement. Ce dernier a d'autres mérites — il ne raccourcit simplement pas les
incidents autant qu'on le croit.

**B — les fausses alertes.** Presque toutes les équipes découvrent ici un chiffre
qu'elles ne soupçonnaient pas, parce que le coût est réparti sur plusieurs
personnes et jamais additionné.

Sur les alertes à retirer, le critère est celui d'un contrôle : **une alerte qui
n'a jamais correspondu à un problème réel ne protège de rien et coûte en
permanence.** L'objection « mais elle pourrait servir un jour » est exactement le
raisonnement qui produit les six heures par jour. Une alerte se justifie par ce
qu'elle a attrapé, pas par ce qu'elle pourrait attraper.

Deux critères pour celles qu'on garde : elles décrivent un **symptôme
utilisateur** (pas une métrique de machine), et elles sont **actionnables** — la
personne réveillée doit savoir quoi faire. Une alerte qui n'appelle aucune
action précise n'est pas une alerte, c'est un tableau de bord qui téléphone.

**C — le manuel.** Trois critères le séparent d'un document décoratif.

*La commande est copiable.* « Revenir à la version précédente » suppose qu'on
sache où la chercher, sous quel nom, avec quelle autorisation — trois choses
qu'on ne cherche pas à trois heures du matin.

*La liste des opérations qui ferment le retour arrière est nominative.* « Éviter
les migrations destructives » n'aide personne. Il faut **tes** tables, **tes**
envois de courriels, **tes** appels de paiement. La personne d'astreinte doit
pouvoir répondre oui ou non en trente secondes.

*La requête de périmètre est écrite d'avance.* « Combien de commandes entre
14 h 02 et 14 h 19 » ne s'écrit pas correctement sous pression.

**D — les trous.** On n'attend pas zéro. Un manuel jamais éprouvé en contient
typiquement trois à six, et ce sont toujours les mêmes familles : une
autorisation manquante (la personne d'astreinte n'a pas le droit de déclencher le
retour arrière), une commande qui a changé depuis sa rédaction, une étape
implicite que l'auteur connaissait par cœur, un contact qui a changé d'équipe.
**Le nombre de trous est le résultat de l'exercice, pas son échec** — un manuel
jamais exécuté a une valeur inconnue.

Le chronomètre sert à une chose précise : comparer le temps réel au temps que tu
aurais annoncé. L'écart va systématiquement dans le même sens, et c'est lui qui
rend les estimations d'incident irréalistes.

**E — les deux actions.** Les ordres de grandeur calculés, sur six occurrences
par an de 37 minutes (3,7 h/an) :

```
corriger le bug de cette fois        : 3,1 h/an  (−17 %)
diviser le temps de diagnostic par 2 : 2,6 h/an  (−30 %)
les deux                             : 2,2 h/an  (−41 %)
```

La lecture attendue va au-delà des pourcentages. **Corriger le bug ne protège que
de ce bug** ; réduire le temps de diagnostic protège de tous les incidents à
venir, y compris de ceux qu'on ne peut pas prévoir — et c'est la catégorie qui
compte, puisque par définition on ne l'a pas anticipée.

Un compte rendu d'incident qui ne produit que des actions du premier type
recommence à chaque incident. C'est le lien direct avec la leçon
`postmortem-rca` : la qualité d'un compte rendu se juge à la proportion
d'actions du second type qu'il produit.

Nuance à ne pas manquer : les deux actions ne s'opposent pas et ne coûtent pas la
même chose. Corriger le bug est presque toujours moins cher et se fait de toute
façon. La question posée est celle de l'action **supplémentaire** qu'on choisit
de financer, et c'est là que la comparaison tranche.

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
