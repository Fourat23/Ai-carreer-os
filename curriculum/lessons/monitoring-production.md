<!-- keep -->
# Leçon — Monitoring et production

## 🎯 Objectif
Savoir surveiller un système en production : détecter qu'il va mal AVANT les utilisateurs, définir des seuils d'alerte utiles, et surveiller ce qui est spécifique à l'IA (qualité, coûts, dérive). C'est ce qui sépare « j'ai déployé » de « je fais tourner un service ».

## 🧠 Modèle mental
Le monitoring, c'est **le tableau de bord d'une voiture** : jauges (métriques) + voyants (alertes). Tu ne regardes pas le moteur en permanence ; tu veux qu'un voyant s'allume quand quelque chose sort de la normale — et AVANT la panne.

## 📖 Explication complète
- **Quoi surveiller (les 4 signaux d'or)** : la latence (p95/p99, pas la moyenne — leçon stats), le trafic (requêtes/min), les erreurs (taux de 5xx), la saturation (CPU/mémoire/disque).
- **Alerter sur les symptômes, pas les causes** : « taux d'erreurs > 2 % pendant 5 min » (symptôme utilisateur) vaut mieux que « CPU > 80 % » (cause possible mais souvent bénigne). Une alerte doit être ACTIONNABLE ; une alerte qu'on ignore entraîne à ignorer les alertes (alert fatigue).
- **Spécifique IA** : en plus des signaux techniques, surveiller la QUALITÉ (scores d'éval par version, taux de refus, taux d'échec de parsing des sorties LLM), les COÛTS (tokens/jour, coût/requête — un bug de boucle peut coûter cher en heures), et la DÉRIVE (le fournisseur met à jour le modèle : tes scores bougent sans que ton code change → d'où les évals régulières).
- **Health checks** : un endpoint `/health` que la supervision interroge ; distinguer « vivant » (le process répond) de « prêt » (les dépendances — base, LLM — répondent).
- La boucle complète : mesurer → seuils → alerter → diagnostiquer (via les logs corrélés) → corriger → post-mortem.

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
