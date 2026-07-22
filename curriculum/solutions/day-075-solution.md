# Correction — Jour 75 : Lecture de code existant : la compétence sous-estimée

[← Retour au jour 75](../days/day-075.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Comprendre un codebase inconnu par une stratégie active, jamais linéaire : trouver le point d'entrée, cartographier les grandes zones, suivre UN flux de bout en bout en notant les fonctions, et lire avec des hypothèses ÉCRITES AVANT vérification. Chercher l'intention avant les détails, s'appuyer sur les outils (recherche, tests). La preuve : architecture et un flux documentés, hypothèses confrontées à la réalité.

## ✅ Une solution simple
Parcourir le projet, repérer les grandes parties et lire quelques fichiers clés. On a une idée du projet.

## 🚀 Une solution améliorée
Suivre la stratégie complète : identifier le point d'entrée, cartographier l'architecture sans tout lire, tracer UN flux complet (liste ordonnée des fonctions traversées), et écrire ses hypothèses AVANT de vérifier avec le verdict (justes/fausses). S'appuyer sur les tests comme documentation. Ne pas chercher à tout comprendre — assez pour la tâche.

## ⚠️ Erreurs probables et points à vérifier
- Vouloir tout lire linéairement : paralysie garantie sur un codebase non trivial.
- Lire sans hypothèse : errance, on parcourt sans retenir ni comprendre.
- Se noyer dans les détails avant d'avoir la carte et l'intention des grandes zones.
- Ignorer les tests et le README, qui documentent le comportement et l'usage attendus.

## 🔍 Comment vérifier ta solution
- Point d'entrée et architecture du repo inconnu identifiés et documentés.
- Un flux complet tracé (liste des fonctions traversées, dans l'ordre).
- Tes hypothèses écrites AVANT vérification, avec le verdict (justes/fausses).
- L'intention des grandes zones comprise avant les détails.

## ❓ Réponses du mini-quiz
1. **Pourquoi ne faut-il jamais lire un codebase linéairement ?**
   → Un codebase n'est pas un roman : lire de haut en bas est une paralysie garantie. On navigue — point d'entrée, carte des zones, un flux suivi de bout en bout — avec une question, pas en spectateur.
2. **Quelles sont les 4 étapes de la stratégie de lecture ?**
   → (1) Trouver le point d'entrée (le fichier qui démarre tout), (2) cartographier les grandes zones (les dossiers), (3) suivre UN flux de bout en bout, (4) formuler des hypothèses et les vérifier.
3. **Quelle est la différence entre lire avec et sans hypothèse ?**
   → Sans hypothèse, on erre (on parcourt sans savoir quoi chercher, on ne retient rien). Avec une hypothèse (« le calcul doit être ici »), on cherche une réponse, on va droit au but et on corrige son modèle mental.
4. **Cherche-t-on à tout comprendre en détail d'emblée ?**
   → Non : on cherche d'abord l'INTENTION (que fait ce module, pourquoi) et on comprend ASSEZ pour la tâche du moment. Vouloir tout comprendre en détail d'emblée est la paralysie ; les détails se lisent ensuite, là où c'est nécessaire.

## 🎤 À savoir expliquer à l'oral
Décris la stratégie active : « jamais linéairement — point d'entrée, carte des zones, un flux suivi de bout en bout, hypothèses vérifiées ». Insiste sur « lire avec une question, pas en spectateur » et « comprendre l'intention avant les détails, assez pour la tâche ». Relier à la lecture dirigée du débogage (reproduire puis remonter le flux) montre que tu as une méthode transférable, pas juste de la bonne volonté — exactement ce qu'un recruteur veut chez quelqu'un qui rejoindra un codebase existant.
