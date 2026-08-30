<!-- keep -->
# Leçon — Monitoring et production

## 🌍 Le problème d'abord
Ton service tourne en production. Tout va bien… jusqu'à ce qu'un client appelle, furieux : le site est lent depuis deux heures et tu ne le savais pas. Découvrir les pannes PAR les utilisateurs, c'est déjà avoir perdu. Il te faut détecter qu'un système va mal AVANT eux : des jauges qui mesurent en continu, des voyants qui s'allument quand quelque chose sort de la normale — et, pour l'IA, surveiller aussi la qualité, les coûts et la dérive. Cette leçon te fait passer de « j'ai déployé » à « je fais tourner un service » : définir des alertes utiles, pas du bruit.

## 🎯 Objectif
Savoir surveiller un système en production : détecter qu'il va mal AVANT les utilisateurs, définir des seuils d'alerte utiles, et surveiller ce qui est spécifique à l'IA (qualité, coûts, dérive). C'est ce qui sépare « j'ai déployé » de « je fais tourner un service ».

## 🧩 Prérequis
Tu dois connaître les bases de l'observabilité — logs, métriques, traces (`/doc/lessons/observability-logging`) — car le monitoring s'appuie dessus pour déclencher des alertes. Les notions de latence, de percentile et de disponibilité (vues en architecture) aident à définir des seuils. Pour la partie IA, une idée de la dérive et du coût par requête (`/doc/lessons/llm-observability`) est utile mais rappelée ici.

## 🧠 Modèle mental
Le monitoring, c'est **le tableau de bord d'une voiture** : jauges (métriques) + voyants (alertes). Tu ne regardes pas le moteur en permanence ; tu veux qu'un voyant s'allume quand quelque chose sort de la normale — et AVANT la panne.

## 📖 Explication complète
- **Quoi surveiller (les 4 signaux d'or)** : la latence (p95/p99, pas la moyenne — leçon stats), le trafic (requêtes/min), les erreurs (taux de 5xx), la saturation (CPU/mémoire/disque).
- **Alerter sur les symptômes, pas les causes** : « taux d'erreurs > 2 % pendant 5 min » (symptôme utilisateur) vaut mieux que « CPU > 80 % » (cause possible mais souvent bénigne). Une alerte doit être ACTIONNABLE ; une alerte qu'on ignore entraîne à ignorer les alertes (alert fatigue).
- **Spécifique IA** : en plus des signaux techniques, surveiller la QUALITÉ (scores d'éval par version, taux de refus, taux d'échec de parsing des sorties LLM), les COÛTS (tokens/jour, coût/requête — un bug de boucle peut coûter cher en heures), et la DÉRIVE (le fournisseur met à jour le modèle : tes scores bougent sans que ton code change → d'où les évals régulières).
- **Health checks** : un endpoint `/health` que la supervision interroge ; distinguer « vivant » (le process répond) de « prêt » (les dépendances — base, LLM — répondent).
- La boucle complète : mesurer → seuils → alerter → diagnostiquer (via les logs corrélés) → corriger → post-mortem.

**Tableau de bord et alerte ne servent pas à la même chose**, et les confondre produit la moitié des systèmes de supervision inutiles. Un tableau de bord se consulte quand on cherche quelque chose ; il peut afficher trente courbes sans nuire. Une alerte **interrompt un humain**, éventuellement à trois heures du matin. Le critère de tri est donc brutal : une alerte n'existe que si quelqu'un doit AGIR immédiatement. Tout le reste — utile mais pas urgent — appartient au tableau de bord, ou à un ticket créé automatiquement.

**Ce qui rend une alerte utilisable**, au-delà d'être actionnable : elle dit ce qui est cassé du point de vue de l'utilisateur, et elle pointe vers un **runbook** — quelques lignes écrites à l'avance qui disent quoi vérifier en premier, quoi faire en attendant, et qui prévenir. Une alerte sans runbook réveille quelqu'un pour qu'il improvise. C'est ce qui explique que les équipes matures aient peu d'alertes et beaucoup de tableaux de bord, tandis que les équipes qui débutent font l'inverse et finissent par toutes les ignorer.

**Le seuil fixe a un défaut qu'il faut connaître.** « Taux d'erreur > 2 % pendant 5 minutes » se déclenche identiquement à 3 h du matin sur dix requêtes — où une seule erreur fait 10 % — et en pleine journée sur cent mille. Le premier cas est du bruit statistique, le second une panne majeure. Deux corrections simples : exiger un **volume minimum** avant d'évaluer le taux, et raisonner sur la consommation du budget d'erreur plutôt que sur un pourcentage instantané. C'est le lien direct avec les SLO : un budget se consomme d'autant plus vite que le trafic est élevé, ce qui pondère naturellement l'urgence par l'impact réel.

## 🔧 Exemple simple
Un compteur d'erreurs par minute et une alerte « > 5 erreurs/min pendant 5 min » suffisent à attraper 80 % des incidents d'une petite API.

## 🧭 Exemple guidé
Un service part en production ce soir. Combien d'indicateurs faut-il, et lesquels ?

La mauvaise réponse est « le plus possible ». Un tableau de bord de quarante graphiques n'est
regardé par personne, et une alerte sur trente métriques réveille l'astreinte pour du bruit —
jusqu'à ce qu'on coupe les alertes, ce qui est le vrai risque.

### Partir des symptômes, pas des composants

Deux façons de choisir ce qu'on surveille :

| Approche | Ce qu'on obtient |
|---|---|
| par **composant** — processeur, mémoire, disque de chaque machine | des dizaines de graphiques verts pendant que le produit est cassé |
| par **symptôme utilisateur** — est-ce lent, est-ce en erreur, est-ce saturé ? | ce qui compte, en quatre lignes |

Le premier réflexe est le mauvais, et pour une raison simple : **un processeur à 90 % n'est pas
un problème**, c'est peut-être exactement ce pour quoi on paie. Ce qui est un problème, c'est
qu'un utilisateur attende.

Les quatre symptômes qui couvrent l'essentiel, dans cet ordre :

| Symptôme | Métrique | Ce qu'il détecte |
|---|---|---|
| **latence** | p95 par point d'entrée | « c'est lent » |
| **erreurs** | taux de 5xx | « ça ne marche pas » |
| **trafic** | requêtes par seconde | le contexte des deux précédents |
| **saturation** | file d'attente, connexions, mémoire | ce qui **va** casser |

La quatrième est la seule prédictive : une file d'attente qui monte annonce la panne avant
qu'elle n'ait lieu. Les trois autres la constatent.

### Les cinq lignes d'un service qui appelle un modèle

Un service d'IA ajoute des modes de défaillance que les quatre symptômes ne voient pas. Le
minimum, avec les seuils **et l'action** :

| Métrique | Seuil | Action si dépassé |
|---|---|---|
| latence p95 | > 3 s | alerte ticket ; vérifier le fournisseur et la taille du contexte |
| taux de 5xx | > 1 % | **alerte réveil** ; c'est le service qui est cassé |
| coût cumulé du jour | > budget/30 × 1,5 | alerte ticket ; chercher une boucle ou un usage nouveau |
| taux de sortie non conforme | > 2 % | alerte ticket ; le modèle ou le prompt a changé |
| taux de refus / réponses vides | > 5 % | ticket ; la recherche ne trouve plus rien |

Deux remarques sur ce tableau, et ce sont elles la leçon.

**Chaque ligne a une action.** Une métrique sans action définie est un graphique, pas une
supervision. Le test est direct : *si cette alerte se déclenche à 3 h du matin, que fait la
personne d'astreinte ?* Si la réponse est « elle regarde », l'alerte ne devrait pas réveiller.

**Une seule ligne réveille.** C'est délibéré. Une alerte qui réveille doit signifier « un
humain doit agir maintenant » ; tout le reste est un ticket pour le lendemain. Une astreinte
réveillée trois fois par semaine pour rien cesse de lire les alertes en deux semaines — et
c'est ainsi qu'on rate la vraie.

### Le point de santé : deux questions, pas une

```
GET /health/live   → le processus est-il vivant ?   (sinon : le redémarrer)
GET /health/ready  → peut-il servir du trafic ?     (sinon : le sortir de la rotation)
```

La distinction n'est pas cosmétique, et la confondre produit deux pannes symétriques :

- un service **vivant mais pas prêt** — base injoignable, cache vide, modèle non chargé —
  qui reçoit du trafic et renvoie des erreurs, parce que le point de santé unique répond
  « OK » ;
- un service **prêt mais déclaré mort** parce que son contrôle de vivacité interroge la base :
  la base tombe, tous les processus sont redémarrés en boucle, et l'on a transformé une panne
  de base en panne totale.

La règle : **le contrôle de vivacité ne doit dépendre d'aucune dépendance externe.** Il répond
« oui » tant que le processus n'est pas bloqué. Les dépendances appartiennent au contrôle de
disponibilité.

### Ce qu'on croit surveiller et qu'on ne surveille pas

Trois angles morts classiques, à vérifier explicitement :

- **les tâches planifiées.** Un traitement de nuit qui ne s'exécute plus ne génère aucune
  erreur — il ne génère rien. Il faut une alerte sur l'**absence** d'exécution, ce qui est un
  type d'alerte que les outils ne proposent pas par défaut ;
- **les dépendances tierces.** Ton service va bien, le prestataire de paiement est en panne,
  et tes 5xx ne bougent pas parce que tu renvoies proprement une erreur métier. Il faut
  surveiller le taux d'échec **par dépendance** ;
- **la supervision elle-même.** Si le collecteur de métriques tombe, les graphiques deviennent
  plats — et un graphique plat ressemble beaucoup à « tout va bien ». Une alerte sur l'absence
  de données est la seule protection.

Le troisième est celui qui prolonge le plus les incidents : on regarde un tableau de bord qui
n'est plus alimenté, et l'on conclut que le problème est ailleurs.


## 🤖 Exemple appliqué (IA / data / architecture)
Le dashboard qualité de DocSense EST du monitoring de qualité : scores par version, tendance, coût par analyse. Couplé aux logs corrélés (leçon observabilité), il permet de répondre : « la qualité a-t-elle baissé ? depuis quand ? quel changement ? ».

## ⚠️ Erreurs fréquentes
- Surveiller la moyenne de latence (le p95 raconte la vraie douleur).
- Alertes non actionnables → fatigue → alertes ignorées.
- Aucun suivi des coûts LLM jusqu'à la facture.
- Découvrir les pannes par les utilisateurs.

## 🚫 Anti-patterns
- Le dashboard de 40 graphes que personne ne regarde.
- Alerter sur tout (bruit) ou sur rien (silence).

## ✍️ Mini-exercice
Pour une de tes APIs, écris les 5 lignes de son monitoring minimal (métrique, seuil, action si dépassé).

## 🔥 Exercice plus difficile
Implémente un endpoint `/health` (vivant + prêt) et un compteur de coût LLM par jour avec un seuil qui coupe (ou alerte) au dépassement du budget.

## ✅ Correction attendue
### La démarche

*Partir des symptômes utilisateur, ajouter les axes propres au domaine, donner à chaque
métrique un seuil **et** une action.*

Le troisième point est le critère de qualité de tout l'exercice : une métrique sans action
définie n'est pas de la supervision, c'est de la décoration.

### Les cinq lignes : ce qu'on attend

Le format est imposé, et il tient en trois colonnes — `métrique` · `seuil` · `action si
dépassé`. Sa vertu est de rendre visibles deux fautes qu'on ne voit pas autrement :

**Une métrique sans action.** Si la colonne de droite dit « on regarde » ou « on investigue »,
la ligne ne devrait pas exister comme alerte. Elle peut rester sur un tableau de bord — c'est
une information —, mais elle ne réveille personne.

**Un seuil sans justification.** « p95 < 3 s » vient d'où ? Trois réponses acceptables, et une
seule mauvaise :

| Origine du seuil | Verdict |
|---|---|
| un engagement de service pris auprès des clients | excellent |
| l'observation de la distribution actuelle + une marge | bon |
| une limite technique connue (délai d'attente du client) | bon |
| « ça semblait raisonnable » | **à mesurer avant de l'écrire** |

Un seuil trop bas produit des alertes permanentes qu'on finit par ignorer ; un seuil trop haut
ne se déclenche que quand tout le monde a déjà appelé le support.

### Vivacité et disponibilité : le test qui les distingue

```js
app.get('/health/live',  (req, res) => res.sendStatus(200));   // AUCUNE dépendance

app.get('/health/ready', async (req, res) => {
  const checks = {
    base:  await pingBase().then(() => true, () => false),
    cache: await pingCache().then(() => true, () => false),
  };
  const pret = Object.values(checks).every(Boolean);
  res.status(pret ? 200 : 503).json(checks);
});
```

Le contrôle de vivacité **ne doit interroger aucune dépendance**. La raison est mécanique :
l'orchestrateur redémarre ce qui n'est pas vivant. Si le contrôle interroge la base et que la
base tombe, tous les processus sont redémarrés en boucle — et l'on a converti une panne de base
en panne totale, avec une aggravation à chaque redémarrage.

Le contrôle de disponibilité, lui, sort le processus de la rotation sans le tuer : il reste
prêt à revenir dès que la dépendance revient.

Le test qui vérifie que la distinction est correcte, et il se fait en une minute : **coupe la
base, et regarde.** Le processus doit rester vivant et devenir non disponible. S'il est
redémarré, la vivacité dépend de la base.

### Le compteur de coût, et son seuil sur la dérivée

```js
const cout = { jour: aujourdhui(), total: 0 };
function ajouterCout(eur) {
  if (cout.jour !== aujourdhui()) { cout.jour = aujourdhui(); cout.total = 0; }
  cout.total += eur;
  if (cout.total > BUDGET_JOUR * 1.5) alerter('coût journalier anormal', cout.total);
}
```

Le seuil est délibérément sur le **coût du jour** comparé à l'ordinaire, et non sur le cumul du
mois. La raison est celle de `/doc/lessons/llm-observability` : une boucle lancée un vendredi
soir consomme un mois de budget en une nuit, et le compteur mensuel ne franchira son seuil
qu'une fois le mal fait.

Deux seuils valent mieux qu'un : le cumul mensuel à 80 % **prévient**, le journalier anormal
**détecte**. Ils ne servent pas à la même chose.

### La mauvaise solution plausible

Ajouter des alertes sur tout ce qui est mesurable : processeur, mémoire, disque, nombre de
connexions, taille des files, latence de chaque dépendance.

Le résultat est connu et il est pire que l'absence de supervision. Trois alertes par nuit dont
aucune n'exige d'action produisent, en deux semaines, une équipe qui ne lit plus les alertes.
La vraie panne arrive ensuite, dans le même canal, et personne ne la distingue du bruit.

Le principe correct : **une alerte doit être actionnable, urgente et rare.** Si l'une des trois
manque, ce n'est pas une alerte — c'est un tableau de bord.

Et le critère de révision, à appliquer tous les trimestres : pour chaque alerte déclenchée,
quelqu'un a-t-il agi ? Une alerte qui n'a provoqué aucune action en six mois est à supprimer ou
à retransformer en ticket.

### Auto-évaluation

| Vérification | Comment |
|---|---|
| symptômes avant composants | tes cinq lignes parlent d'utilisateurs, pas de machines |
| chaque seuil justifié | tu peux dire d'où vient chaque nombre |
| chaque ligne actionnable | tu peux dire ce que fait l'astreinte à 3 h |
| une seule alerte réveille | les autres sont des tickets |
| vivacité indépendante | couper la base ne redémarre pas le processus |
| alerte sur l'absence | une tâche planifiée qui ne tourne plus déclenche quelque chose |

La dernière ligne est celle que presque personne n'a. Une alerte sur l'**absence** d'événement
attendu — une tâche de nuit, un flux de données, un flot de métriques — est le seul moyen de
détecter ce qui s'arrête silencieusement.

### Généralisation

Le raisonnement de cette leçon vaut pour tout dispositif de surveillance, y compris humain :
**ce qu'on surveille doit être ce dont on souffre, pas ce qui est facile à mesurer.**

Les métriques de composant sont faciles et abondantes ; les métriques de symptôme demandent de
définir ce qu'est un service rendu. C'est plus difficile, et c'est la seule chose qui permette
de dire, à 3 h du matin, si l'on a un problème.


## 🎤 Questions d'entretien
- « Que surveilles-tu sur un service en production ? » → Latence p95, trafic, erreurs, saturation — plus qualité/coût/dérive pour l'IA.
- « Pourquoi p95 plutôt que la moyenne ? » → La moyenne noie les cas lents qui font la douleur réelle.
- « Comment détectes-tu une dérive de modèle ? » → Évals régulières versionnées : le score bouge sans changement de code.

## 🧾 À retenir
- Alerter sur les symptômes, avec des seuils actionnables.
- IA : surveiller aussi qualité, coûts, dérive — pas seulement la technique.
- p95/p99, jamais la moyenne ; un budget de coût avec garde-fou.

## 📚 Vocabulaire
**4 signaux d'or** · **p95/p99** · **alerte actionnable / alert fatigue** · **health check (live/ready)** · **dérive** · **post-mortem** · **budget de coût**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je sais définir le monitoring minimal d'un service (5 lignes).
- [ ] Mes alertes sont actionnables et fondées sur des symptômes.
- [ ] Je surveille qualité, coûts et dérive de mes systèmes IA.

## 🔗 Liens avec le programme
Mois 11-12 (jours ~310-335), projet final. Leçons liées : `observability-logging`, `llm-observability`, `ci-cd`.
