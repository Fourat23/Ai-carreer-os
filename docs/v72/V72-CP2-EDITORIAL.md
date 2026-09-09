# V72 — CP2. Redondances d'ouverture : reclassement et correction

**Ce que ce checkpoint devait faire.** Appliquer les critères R0–R3 **gelés au CP1** aux
33 leçons signalées par V71, puis corriger uniquement les R2 et R3.

**Ce qu'il a produit.** Le reclassement mécanique par les critères gelés **contredit le
classement préliminaire du CP0 sur sept leçons**, et il conduit à en toucher **moins** :
17 au lieu de 23. C'est la bonne direction — l'interdit n° 3 du contrat est de réécrire une
leçon sans défaut mesuré.

---

## 1. Reclassement par les critères gelés

Les critères du §1 du contrat ne se déduisent pas d'une seule mesure : la branche littérale
(nombre de paires de phrases dupliquées ≥ 0,30, part de l'ouverture) s'applique
mécaniquement ; les branches « section entière supprimable sans perte », « trois
énonciations » et « formulations concurrentes » exigent la lecture.

| classe | CP0 (préliminaire) | CP2 (critères gelés) | écart |
|---|---:|---:|---|
| R0 | 2 | **2** | — |
| R1 | 8 | **14** | +6 |
| R2 | 18 | **12** | −6 |
| R3 | 5 | **5** | composition différente |

**Les sept désaccords, publiés :**

| leçon | CP0 | CP2 | raison du changement |
|---|---|---|---|
| `api-design-basics` | R2 | **R1** | une seule paire dupliquée (10 %) ; le « Pourquoi » ajoute la question d'entretien — la section n'est pas supprimable |
| `ci-cd` | R2 | **R1** | une seule paire ; le modèle mental ajoute « filet de sécurité impartial » |
| `deployment-secrets` | R2 | **R1** | une seule paire ; l'objectif ajoute la parenthèse clés d'API / mots de passe |
| `k8s-networking-services` | R2 | **R1** | une seule paire ; le modèle mental ajoute la sélection **par labels** et le niveau transport |
| `k8s-security` | R2 | **R1** | une seule paire ; le modèle mental ajoute la raison (noyau partagé) |
| `nextjs-server-client-components` | R2 | **R1** | aucune paire littérale ; l'objectif est une table des matières, le modèle mental est le modèle |
| `iac-fundamentals` | R2 | **R3** | l'idée déclarative est énoncée **trois fois** — branche « trois occurrences » de R3 |
| `design-patterns-intro` | R3 | **R2** | **deux** répétitions, pas trois ; la note D14 = 3 de V71 n'est pas un critère du contrat V72 |

**Ce que cet écart dit.** Le classement du CP0 s'appuyait sur mon jugement de lecteur avant que
les critères ne soient écrits. Les critères gelés sont **plus exigeants sur ce qui compte comme
défaut** : une seule phrase reprise, dans une section qui apporte par ailleurs une information
nouvelle, n'est pas une redondance à corriger. Six leçons ont donc été **épargnées**.

---

## 2. Les 17 corrections

**Règle appliquée partout** : rendre à chaque section sa fonction propre — (1) donner envie de
résoudre un vrai problème, (2) dire ce qu'on va apprendre, (3) construire un premier modèle
mental — plutôt que raccourcir. Aucune section n'a été supprimée ; deux passages de **corps**
l'ont été.

### R3 — cinq leçons

| leçon | avant | après | ce qui a été fait |
|---|---|---|---|
| `neural-networks` | 42 % | **0** | la métaphore boutons/note/gradient était développée en entier **deux fois**. Elle reste au modèle mental ; le « problème d'abord » pose désormais la question à laquelle elle répond (« qu'est-ce qui est réglé, et par quel mécanisme ? ») au lieu d'y répondre. « pas de magie, des maths simples empilées » retiré de l'objectif. **−24 mots.** |
| `readme-documentation` | 35 % | **0** | le « problème d'abord » contenait déjà le modèle mental. Il décrit maintenant le **réflexe qui aggrave** le problème (écrire beaucoup), et la formule « page d'atterrissage, pas documentation exhaustive » ne vit plus qu'au modèle mental. |
| `react-fundamentals` | 3 formulations | **1** | plombier/dessinateur, `UI = f(state)` et déclaratif/impératif étaient dispersés dans trois sections adjacentes. Les trois sont **réunis dans le modèle mental**, où ils forment un seul énoncé cohérent ; le « problème d'abord » explique désormais pourquoi le problème grandit (les **combinaisons** d'état, pas le nombre d'écrans). |
| `transformers` | 3 images | **2** | l'exemple de la souris était donné au « problème d'abord » **et** repris au modèle mental. Le modèle mental garde la salle de réunion et gagne les deux propriétés qui en découlent (écoute simultanée → coût quadratique et portée longue ; pondération et non choix binaire). L'exemple « banque » reste : il est **réutilisé** par l'exemple guidé qui mesure les poids d'attention. |
| `iac-fundamentals` | 3 énonciations | **1 + 1** | l'idée déclarative apparaissait dans les trois sections. Le « problème d'abord » nomme maintenant le vrai coût du clic — **aucune trace de la décision ne subsiste**, le même problème qu'un projet sans Git. L'objectif la cite comme notion à acquérir, le modèle mental la développe. |

### R2 — douze leçons

| leçon | ce qui était dupliqué | traitement |
|---|---|---|
| `cloud-azure-core` | « MÊMES concepts », « Deux spécificités à intégrer d'emblée », « erreur numéro un » | ouverture réécrite sur le **symptôme** (un schéma Azure où rien ne s'aligne) ; ajout du point que la table de correspondance ne dit pas : deux services voisins peuvent avoir des **frontières de sécurité différentes** |
| `design-patterns-intro` | la sous-section de corps « Le bon état d'esprit » redisait **mot pour mot** le modèle mental ; le « Pourquoi » redisait la définition | sous-section de corps **supprimée** ; le « Pourquoi » porte maintenant ce qu'il était seul à pouvoir dire — savoir nommer un pattern permet de le **refuser** avec argument |
| `docker-containers` | la phrase de la boîte, mot pour mot | le « problème d'abord » nomme la vraie difficulté : l'environnement est **invisible**, fait de ce qu'on a installé sans le noter — et une doc d'installation décrit ce dont on se souvient, pas ce dont le programme a besoin |
| `interview-preparation` | les quatre types d'entretien listés deux fois ; « une compétence qui s'entraîne » deux fois | la liste ne vit plus qu'à l'objectif ; le « problème d'abord » donne le **contre-exemple** qui réfute la thèse de la personnalité, et distingue réviser de préparer |
| `monitoring-production` | les quatre points, et « j'ai déployé » / « je fais tourner un service » | le « problème d'abord » nomme le piège suivant (alertes partout → plus personne ne les lit) ; l'objectif liste ce qui s'apprend, sans reprendre la formule |
| `observability-logging` | « boîte noire indéfendable » deux fois, plus les quatre points | le « problème d'abord » porte le réflexe inverse — « je vais tout logger » — qui crée l'autre panne : incident introuvable et secret en clair |
| `system-design-interview` | la méthode complète et « teste ton RAISONNEMENT » | la méthode ne vit plus qu'à l'objectif ; le « problème d'abord » explique ce que le silence **et** le bavardage donnent tous deux à voir au recruteur |
| `technical-storytelling` | « un projet qu'on ne sait pas raconter n'existe pas », **mot pour mot** | la phrase reste à l'objectif ; le « problème d'abord » ajoute le mécanisme d'aggravation : plus la description est fournie, moins le raisonnement est visible |
| `git-fundamentals` | **corps** : « Les photos chaînées en détail » redisait le modèle mental, même parenthèse | la sous-section devient « Ce que la chaîne de photos rend possible » : elle **tire la conséquence** (structure interrogeable, `git bisect`, dix essais pour mille commits) au lieu de redéfinir |
| `linux-resources-io` | le modèle mental recopiait le paragraphe des quatre ressources | remplacé par un **outil de diagnostic** : pour chacune des quatre, le signe qui la trahit (CPU : load haut, disque immobile · mémoire : bascule brutale, swap, OOM · disque : processeur inactif, processus en état `D` · descripteurs : « too many open files » alors que tout le reste est au repos) |
| `portfolio-github` | l'objectif recopiait la liste des signaux négatifs et « le portfolio EST le CV technique » | l'objectif dit maintenant ce qui **s'apprend** : quoi mettre en avant et dans quel ordre, quoi archiver, comment retirer un signal négatif sans effacer la progression |
| `technical-debt` | **corps** : « Principal et intérêt » redisait le modèle mental | devient « Ce que le taux d'intérêt change à la priorité » : on ne rembourse pas la dette la plus grosse mais celle **qu'on doit contourner le plus souvent** — le critère n'est pas la laideur |

---

## 3. Contrôle : est-ce que j'ai gonflé les leçons ?

Le §12.8 du contrat interdit de gonfler un texte. Mesure sur les 17 leçons touchées :

| | |
|---|---|
| avant CP2 | 50 063 mots |
| après CP2 | **50 296 mots** |
| écart | **+233 (+0,5 %)** |
| leçons qui ont **maigri** | 5 (`neural-networks` −24, `design-patterns-intro` −26, `technical-storytelling` −21, `portfolio-github` −4, `readme-documentation` −2) |
| plus forte hausse | `linux-resources-io` **+118** — remplacement d'un résumé par un tableau de diagnostic |

Une correction de redondance qui n'enlève pas de mots serait suspecte ; une qui n'en ajoute
aucun le serait aussi, puisqu'il faut bien écrire ce que la section dupliquée ne disait pas.
+0,5 % avec cinq leçons qui rétrécissent est le profil attendu.

---

## 4. Vérification

| contrôle | résultat |
|---|---|
| paires de phrases ≥ 0,30 restantes sur les 17 | **0**, sauf trois échos courts de niveau R1 (`cloud-azure-core` 5 %, `docker-containers` 4 %, `technical-storytelling` 6 %) |
| leçons R1/R0 modifiées | **0** — aucune leçon hors R2/R3 n'a été touchée |
| `npm test` | **1420 / 1420** |
| `npx tsc --noEmit` | **0 erreur** |
| `npm run gates:active` | **vert** (52 gates) |
| gels de corpus | 9 constantes `FROZEN_CORPUS` mises à jour : `7eb88ba5…` → `a45e9f5b…` |
| invariants | 128 / 365 / 365, ordre des jours inchangé, `progress.json` intouché |

**Un avertissement de gate, conservé tel quel** : `error-handling` — « densité conceptuelle
élevée (53 termes en gras > 42) ». Cette leçon **n'a pas été touchée par le CP2** ;
l'avertissement préexistait. Il est noté ici pour le CP14, pas traité au passage.

---

## 5. Ce que le CP2 n'a pas fait

- **Les six défauts factuels** laissés ouverts par V71 (Java 8, ISO/IEC 14764, incohérence de
  comptage de `react-application-states`, deux chiffres non sourcés, la liste des falsy) ne
  sont **pas** traités ici : ce ne sont pas des redondances. Ils sont l'objet du **CP3**.
- **Les 14 R1 et 2 R0** n'ont reçu aucune modification, conformément au contrat.
