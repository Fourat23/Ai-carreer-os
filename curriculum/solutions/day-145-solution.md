# Correction — Jour 145 : Projet 4 — Dashboard

[← Retour au jour 145](../days/day-145.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : faire quelques graphiques à partir de la base. Solution améliorée : une visualisation par question, la forme choisie selon la nature (évolution→ligne, comparaison→barres, répartition→histogramme), chaque graphique requêtant la base par agrégation, titré avec sa question, honnête (axes non tronqués) et épuré, en supprimant tout graphique qui ne répond à aucune question. La preuve : un lecteur retrouve les 3 questions rien qu'en regardant le dashboard.

## ⚠️ Erreurs probables et points à vérifier
- Empiler des graphiques « parce qu'on peut » : dashboard encombré qui noie le message.
- Mauvaise forme (évolution en camembert, comparaison en ligne) : le graphique trahit la question.
- Axe Y tronqué (ne partant pas de zéro) : exagère les écarts, manipule le lecteur.
- Décoration inutile (3D, chartjunk) qui distrait de la donnée.

## 🔍 Comment vérifier ta solution
- Chaque visualisation répond à une des 3 questions du cadrage.
- La forme est adaptée à la nature de la question.
- Chaque graphique est titré avec sa question.
- Les axes sont honnêtes (non tronqués) et le graphique épuré.
- Aucun graphique ne répond à zéro question (pas de bruit).

## 🎤 À savoir expliquer à l'oral
Pose la règle « une question, une visualisation ; la forme suit la nature ». Donne les correspondances (évolution→ligne, comparaison→barres, répartition→histogramme) et insiste sur l'honnêteté visuelle (axes non tronqués). « Trois graphiques clairs valent mieux qu'un dashboard sophistiqué illisible » montre que tu vises la communication de la donnée, pas la démonstration technique.
