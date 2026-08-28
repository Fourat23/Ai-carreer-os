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
**Énoncé** : définir le monitoring minimal d'une API RAG.
**Raisonnement** : partir des symptômes utilisateur, ajouter les axes IA.
**Solution** :
```
Techniques : latence p95 < 3 s ; taux 5xx < 1 % ; /health OK.
IA         : coût/jour < budget ; taux de parse-fail < 2 % ;
             taux de refus (suivi de tendance) ; éval hebdo : fidélité ≥ baseline - 2 pts.
Alertes    : symptômes seulement, actionnables, avec lien vers les logs corrélés.
```
**Explication** : chaque ligne répond à « comment saurais-je que ça va mal ? ». **Variante** : ajoute une alerte de dérive (score d'éval qui chute après une mise à jour du modèle fournisseur).

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
La logique : symptômes utilisateur d'abord, seuils actionnables, axes IA (qualité/coût/dérive) en plus des 4 signaux d'or. Vérifie : chaque alerte a une ACTION associée ; le health check teste les dépendances ; le coût est borné par un garde-fou.

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
