<!-- keep -->
# Leçon — Stratégies de déploiement sans coupure

> **📚 Étagère de référence — cette leçon n'est programmée par aucune des 365 journées.**
> Tu ne l'as pas manquée : le parcours ne t'y enverra jamais, et aucune journée ne suppose
> que tu l'as lue. Elle est là pour être ouverte quand tu en as besoin — par curiosité, pour
> un projet, ou parce qu'une leçon du parcours y renvoie pour approfondir un point.


## 🌍 Le problème d'abord
Mettre en ligne une nouvelle version, c'est risqué : et si elle contient un bug ? La
tentation du débutant est de tout remplacer d'un coup — mais alors, si ça casse, TOUT
casse pour TOUS les utilisateurs en même temps. Il existe des façons de déployer qui
limitent la casse : remplacer progressivement, ou n'exposer d'abord la nouveauté qu'à
1 % des visiteurs, ou pouvoir revenir en arrière en une seconde. Et un piège sournois
guette : modifier la base de données de façon irréversible pendant que l'ancienne
version tourne encore. Cette leçon présente les stratégies (rolling, blue-green,
canary, feature flags) comme des réponses à UNE question : « comment réduire le rayon
d'impact d'une mauvaise version ? ».

## 🎯 Objectif
Livrer une nouvelle version SANS interrompre le service et en limitant le rayon
d'impact d'un bug : **rolling update**, **blue-green**, **canary**, **feature
flags**, et le cas piégeux des **migrations de base compatibles**. Choisir la
bonne stratégie selon le risque.

## 🧩 Prérequis
Vous devez comprendre les **artefacts versionnés** (pour pouvoir revenir à une
version précédente — `/doc/lessons/ci-cd-quality-gates-artifacts`) et le **load
balancing / health check** (`/doc/lessons/networking-proxy-loadbalancing`), car le
déploiement sans coupure repose sur le routage vers les instances saines.

## 🧠 Modèle mental
Déployer, c'est **remplacer progressivement** l'ancienne version par la nouvelle
en gardant le service debout. Deux leviers : COMMENT on bascule le trafic
(d'un coup, par vagues, sur une fraction d'utilisateurs) et COMMENT on peut
revenir en arrière vite. Plus le rayon d'impact d'une erreur est petit et
réversible, plus on déploie sereinement — donc souvent.

## 📖 Explication complète
**Rolling update.** On remplace les instances par petits lots : quelques
nouvelles montent, on retire quelques anciennes, et ainsi de suite. Le service
reste disponible pendant la bascule. Nécessite un **health check** fiable (ne
router que vers les instances saines) et que ancienne et nouvelle versions
cohabitent le temps de la transition.

**Blue-green.** On maintient deux environnements complets : « bleu » (actuel) et
« vert » (nouvelle version). On déploie et teste sur le vert pendant que le bleu
sert le trafic, puis on **bascule le routage** d'un coup vers le vert. Rollback =
rebasculer vers le bleu, quasi instantané. Coût : faire tourner deux
environnements.

**Canary.** On envoie une PETITE fraction du trafic (1 %, 5 %) vers la nouvelle
version et on OBSERVE (erreurs, latence, métriques métier). Si tout va bien, on
augmente progressivement ; sinon on retire la canary. C'est la stratégie qui
limite le mieux le rayon d'impact — à condition d'avoir de l'**observabilité** — de quoi répondre à une question imprévue sans redéployer — pour
décider.

**Feature flags.** Découpler le DÉPLOIEMENT du code de son ACTIVATION : on livre
la fonctionnalité désactivée, puis on l'active (pour un pourcentage, un segment)
sans redéployer. Permet un « rollback » logique instantané (couper le flag) et le
test en production maîtrisé. Piège : les flags s'accumulent → dette à nettoyer.

**Migrations de base compatibles.** Le point qui casse les beaux plans : pendant
une transition, ancienne et nouvelle versions du code tournent EN MÊME TEMPS sur
la MÊME base. Une migration destructive (renommer/supprimer une colonne
utilisée) casse l'ancienne version encore en service. La règle est le
changement **rétro-compatible en plusieurs étapes** : d'abord ajouter (colonne,
table) sans rien casser, déployer le code qui l'utilise, puis seulement plus tard
retirer l'ancien — l'**expand/contract**. Jamais « migration destructive + déploiement » d'un bloc.

## 🔧 Repères pratiques (conceptuels)
- Rolling : lots + health check fiable ; adapté par défaut.
- Blue-green : bascule/rollback instantanés ; coût de deux environnements.
- Canary : fraction + observation ; exige des métriques.
- Feature flag : activation découplée du déploiement ; nettoyer les flags.
- Base : expand/contract, jamais de destructif pendant la cohabitation.

## 🧭 Exemple guidé — pourquoi un canari protège, et de quoi il ne protège pas

On présente souvent le canari comme « moins risqué ». C'est vague, et le vague
conduit à l'utiliser dans le seul cas où il ne sert à rien. Le raisonnement
juste tient en une distinction : le canari agit sur **le nombre de personnes
exposées**, pas sur **la réversibilité du dommage**.

### 1. Ce que le canari divise, chiffré

Le canari ne rend pas le défaut moins probable : le code déployé est le même. Il
agit uniquement sur la fraction du trafic qui le rencontre pendant la fenêtre de
détection. Pour un service à 200 requêtes par seconde et six minutes entre le
début du déploiement et la décision de rebasculer — six minutes est optimiste,
cela suppose une alerte déjà en place et quelqu'un devant l'écran :

```
bascule globale (100 %) : 72 000 requêtes servies en erreur avant la décision
canari 5 %              :  3 600 requêtes servies en erreur avant la décision
canari 1 %              :    720 requêtes servies en erreur avant la décision
```

C'est une multiplication, pas une simulation : 200 × 360 × la fraction. Deux
choses à en tirer. D'abord l'ordre de grandeur : même à 1 %, sept cents requêtes
échouent. Un canari ne rend pas un incident indolore, il le rend **absorbable**.
Ensuite, le facteur qui pèse le plus n'est pas la fraction, c'est la durée de
détection. Passer de 5 % à 1 % divise par cinq ; passer de six minutes à une
minute divise par six, et bénéficie aussi à tous les déploiements globaux.
**Investir dans la détection rapporte plus que raffiner le pourcentage.**

Corollaire moins agréable : un canari sans métriques ne divise rien du tout. Si
la détection passe de six minutes à trois heures parce que personne ne regarde
la fraction canari séparément, 1 % du trafic pendant trois heures fait 21 600
requêtes — davantage que la bascule globale détectée en six minutes. **Un canari
non observé est pire qu'une bascule globale observée.**

### 2. Ce que le canari ne divise pas

Le script `scripts/v70-verifications/retour-arriere.mjs` déroule une livraison
qui ajoute une colonne `devise` à une table de commandes, avec une vraie base.
Voici l'étape qui change la conclusion.

Le code v2 tourne et écrit 50 commandes avec une devise, moitié `EUR`, moitié
`USD`. Incident. On revient en arrière — et on revient aussi en arrière sur le
schéma, ce que fait tout script de migration qui possède un `down` :

```
colonne devise supprimée. Lignes qui portaient 'USD' : 25
relire la colonne : no such column: devise
```

Aucune commande n'a été supprimée. Les 151 lignes sont toujours là. Mais la
seule trace de la devise de 50 commandes vient de disparaître, dont 25 en
dollars qui seront désormais facturées comme des euros. Le retour arrière a
« réussi » et a détruit de l'information.

Maintenant applique le canari à cette livraison. À 1 %, la colonne est quand
même ajoutée et supprimée pour **toute** la base — une migration n'a pas de
fraction. Et même si l'on ne comptait que les commandes passées par les
instances canari, on perdrait définitivement la devise de 1 % des commandes au
lieu de 100 %. Un pour cent de perte définitive n'est pas un incident absorbé :
c'est un incident plus difficile à détecter, avec une réconciliation comptable
à la clé.

**La règle qui en découle :** le canari est un outil pour les défauts
**réversibles** — des erreurs 500, une latence qui monte, une page cassée. Face
à un changement irréversible — suppression de colonne, envoi d'e-mails,
mouvement d'argent, appel à un système tiers — il déplace le problème sans le
réduire. Ces changements-là se traitent par la conception, pas par le
pourcentage de trafic.

### 3. Le troisième cas, celui qu'on oublie

Il y a un troisième moment de la même livraison, mesuré à l'étape 1 du script.
La migration part **avant** que toutes les instances v1 soient remplacées — ce
qui est le cas dans tout déploiement progressif, par construction. La colonne
est ajoutée en `NOT NULL DEFAULT ''` :

```
une instance v1 écrit encore : ACCEPTÉ, devise = ""
```

Pas d'erreur, pas d'alerte, pas de 500. Une commande entre en base avec une
devise vide, et le défaut se découvrira à la facturation, des semaines plus
tard. **Un défaut silencieux échappe entièrement à la logique du canari**, qui
suppose qu'on observe quelque chose. Aucune métrique de taux d'erreur ne
signalera cette ligne.

### 4. La démarche, dans l'ordre

1. **Le changement est-il réversible ?** S'il touche des données ou déclenche un
   effet externe, la question de la stratégie de déploiement vient après celle
   de la conception du changement.
2. **Si oui : rendre le retour arrière instantané.** Artefact versionné et
   immuable, configuration injectée au déploiement et non gravée dedans.
3. **Rendre le changement de schéma indépendant du changement de code**
   (expand/contract, détaillé dans la correction ci-dessous). Les deux ne
   partent jamais ensemble.
4. **Choisir la stratégie selon ce qu'on veut acheter** : blue-green achète un
   retour arrière en une bascule, au prix de deux environnements complets ;
   canari achète une exposition réduite, au prix de métriques par fraction ;
   rolling n'achète ni l'un ni l'autre mais ne coûte rien, ce qui en fait le
   défaut raisonnable pour un changement peu risqué.
5. **Mesurer la durée de détection**, puis la réduire. C'est le seul levier qui
   améliore les trois stratégies à la fois.

## ⚠️ Erreurs fréquentes
- **Migration destructive** déployée d'un bloc → casse l'ancienne version encore
  en service.
- Rolling sans **health check** fiable → trafic routé vers des instances non
  prêtes.
- Canary sans observabilité → on déploie « en aveugle », inutile.
- Feature flags jamais nettoyés → dette et complexité.
- Big bang (tout remplacer d'un coup, sans plan de retour).

## 🔐 Sécurité
Un canary ou un flag peut exposer une fonctionnalité à un sous-ensemble : veiller
à ne pas fuiter de données/permissions non prêtes. La configuration par
environnement (et les secrets) reste injectée à part de l'artefact promu.

## 🏢 Cas métier
Une équipe a renommé une colonne et déployé dans le même coup. Le temps du rolling
update, l'ancienne version cherchait l'ancien nom → erreurs 500 pour une partie
des utilisateurs. Adoption de l'**expand/contract** : ajouter la nouvelle colonne,
écrire dans les deux, migrer, basculer la lecture, puis retirer l'ancienne — plus
aucune coupure lors des changements de schéma.

## 🎤 Questions d'entretien
- « Blue-green vs canary ? » → deux environnements avec bascule d'un coup vs
  fraction de trafic observée progressivement.
- « Pourquoi une migration doit être rétro-compatible ? » → ancienne et nouvelle
  versions cohabitent pendant le déploiement.
- « À quoi sert un feature flag ? » → activer/désactiver sans redéployer, limiter
  le risque.

## ✍️ Mini-exercice
Sans relire : un canari à 1 % te protège-t-il d'une migration qui supprime une
colonne ? Réponds en une phrase, puis dis pourquoi.

## 🔥 Pratique — livrer un renommage de colonne sans coupure

Objectif : transformer un changement qui casse en une séquence dont chaque étape
est réversible seule. Tu travailles sur une table `commande(id, client,
total_cents)` et tu dois renommer `total_cents` en `montant_cents`. Le service
tourne, plusieurs instances, déploiement progressif.

**A. Établir que le geste direct casse.** Écris un script qui : crée la table,
insère des lignes avec un code « v1 », exécute `ALTER TABLE commande RENAME
COLUMN total_cents TO montant_cents`, puis fait écrire une instance v1 encore
vivante. Capture l'erreur exacte. Livrable : le message d'erreur et le nombre de
requêtes qui échouent.

**B. Écrire la séquence expand/contract complète.** Produis les migrations et
les versions de code, dans l'ordre, avec pour **chaque** étape : ce qui est
déployé, ce qui tourne encore de l'ancienne version, et comment on revient en
arrière depuis cette étape précise.

**C. Prouver la réversibilité étape par étape.** Pour chaque étape de B,
exécute-la puis exécute son retour arrière, et vérifie par une requête qu'aucune
donnée n'a été perdue. Livrable : le tableau étape / retour arrière / lignes
avant / lignes après / information perdue.

**D. Chiffrer ton propre service.** Prends un trafic et une durée de détection
plausibles pour un service que tu connais, et calcule les requêtes exposées en
bascule globale, canari 5 % et canari 1 %. Puis recalcule en divisant la durée
de détection par deux. Compare les deux leviers.

## ✅ Correction attendue

**A — ce que produit le geste direct.** Sur SQLite comme sur PostgreSQL, la
requête de l'ancienne version échoue avec une erreur de colonne inconnue (`no
such column: total_cents`). Toutes les écritures de toutes les instances v1
échouent, pendant toute la durée du déploiement progressif. Le point à formuler
explicitement : **ce n'est pas une erreur de déploiement, c'est une propriété du
déploiement progressif.** Tant qu'il existe une seule instance v1 vivante, le
schéma doit lui convenir. Un renommage rend cela impossible, parce qu'il retire
et ajoute au même instant.

**B — la séquence attendue.** Cinq étapes, jamais quatre :

1. **Expand.** `ALTER TABLE commande ADD COLUMN montant_cents INTEGER` —
   *nullable*, sans contrainte. Le code déployé est encore v1 et l'ignore
   complètement. Retour arrière : supprimer la colonne, qui est vide. Sans
   conséquence.
2. **Double écriture.** Code v2 : écrit dans `total_cents` **et**
   `montant_cents`, lit encore `total_cents`. Retour arrière : redéployer v1.
   La colonne reste, elle est simplement moins remplie. Sans perte.
3. **Rattrapage.** `UPDATE commande SET montant_cents = total_cents WHERE
   montant_cents IS NULL`, par lots pour ne pas verrouiller la table. Puis la
   requête de contrôle qui décide de la suite :
   `SELECT count(*) FROM commande WHERE montant_cents IS NULL` doit renvoyer 0.
   Retour arrière : aucun besoin, l'opération est **idempotente** : la rejouer ne change rien de plus.
4. **Bascule de lecture.** Code v3 : lit `montant_cents`, écrit toujours les
   deux. Retour arrière : redéployer v2, qui lit `total_cents` — encore
   maintenu à jour, donc correct. C'est précisément la double écriture de
   l'étape 2 qui rend ce retour arrière sûr.
5. **Contract.** Code v4 : n'écrit plus que `montant_cents`. Puis, **plus tard**,
   `ALTER TABLE commande DROP COLUMN total_cents`.

Le point de conception qui départage une bonne réponse : entre l'étape 4 et le
`DROP` de l'étape 5, on peut attendre des jours, et il faut le faire. Le `DROP`
est la seule opération irréversible de toute la séquence ; elle ne doit jamais
partager une fenêtre de déploiement avec un changement de code. Une équipe qui
fusionne 4 et 5 « pour ne pas oublier » vient de reconstruire le renommage
direct, avec cinq migrations au lieu d'une.

Trois erreurs de détail à éviter dans les migrations écrites :
- **`NOT NULL` à l'étape 1.** Mesuré dans le script de vérification : une
  colonne `NOT NULL DEFAULT ''` fait entrer des lignes vides sans erreur —
  `une instance v1 écrit encore : ACCEPTÉ, devise = ""`. La contrainte ne se
  pose qu'à l'étape 5, une fois le rattrapage vérifié.
- **Un `UPDATE` global sans lots.** Sur une grosse table, il verrouille et
  provoque exactement la coupure qu'on cherchait à éviter.
- **Passer l'étape 3 sans la requête de contrôle.** « Le rattrapage a tourné »
  n'est pas « le rattrapage est complet » : des lignes ont pu être insérées
  pendant son exécution.

**C — le tableau de réversibilité.** Le résultat attendu est qu'aux étapes 1 à
4, le nombre de lignes et l'information disponible sont identiques avant et
après le retour arrière. La seule ligne du tableau où la colonne « information
perdue » n'est pas vide est le `DROP` final — et c'est le résultat qu'il faut
publier tel quel, parce qu'il est la justification de toute la séquence. Le
script de vérification le montre sur le cas jumeau :

```
colonne devise supprimée. Lignes qui portaient 'USD' : 25
relire la colonne : no such column: devise
```

151 lignes avant, 151 après, et l'information de devise de 50 commandes
définitivement perdue. **« Aucune ligne supprimée » n'est pas « aucune donnée
perdue »** — c'est la confusion qui rend les scripts `down` dangereux.

**D — les deux leviers.** Avec 200 requêtes par seconde et six minutes de
détection : 72 000 / 3 600 / 720 requêtes exposées. En divisant la détection par
deux, la bascule globale tombe à 36 000 — c'est-à-dire qu'**améliorer la
détection d'un facteur deux fait, pour un déploiement global, la moitié du
chemin que fait un canari à 5 %**, et le fait aussi pour tous les autres
déploiements, y compris ceux qu'on n'a pas pensé à canariser.

La conclusion attendue n'est pas « le canari est inutile ». C'est que les deux
leviers se multiplient et que l'un des deux est transversal. Une équipe qui
canarise tout mais met trois heures à voir une anomalie est moins protégée
qu'une équipe qui déploie globalement et alerte en quatre-vingt-dix secondes.

## 🧾 À retenir
- Rolling (défaut), blue-green (bascule/rollback rapides), canary (rayon d'impact
  minimal + observation), flags (activation découplée).
- Health check fiable indispensable pour le sans-coupure.
- Migrations en expand/contract, jamais de destructif pendant la cohabitation.
- Petit rayon d'impact + réversibilité = déployer souvent, sereinement.

## 📚 Vocabulaire
**rolling update** · **blue-green** · **canary** · **feature flag** · **rayon
d'impact** · **health check** · **expand/contract** · **rétro-compatibilité** ·
**zéro coupure**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je choisis une stratégie selon le risque du changement.
- [ ] Je gère les migrations de base en expand/contract.
- [ ] Je sais limiter le rayon d'impact et revenir en arrière.

## 🔗 Liens avec le programme
Mois 11 (livraison). Leçons liées :
`/doc/lessons/ci-cd-quality-gates-artifacts`,
`/doc/lessons/release-incident-recovery`,
`/doc/lessons/networking-proxy-loadbalancing`. Ces stratégies s'appuient sur les
artefacts versionnés et préparent le déploiement Kubernetes.
