# Correction — Jour 72 : Terminal et Linux avancés : scripts, permissions, processus

[← Retour au jour 72](../days/day-072.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Encoder le lancement d'un projet dans un script robuste : set -e (arrêt à la première erreur), config lue depuis l'environnement avec défauts (tourne partout), messages d'étape clairs, codes de sortie vérifiés, et chmod +x pour l'exécution. Maîtriser permissions et processus. La preuve : le script lance un projet complet de zéro, s'arrête proprement sur une erreur simulée, et tournerait en CI sans modification.

## ✅ Une solution simple
Un script qui enchaîne install, init base et démarrage. Le lancement est automatisé.

## 🚀 Une solution améliorée
Rendre le script robuste (set -euo pipefail, arrêt propre sur erreur avec message clair), lire TOUTE la config depuis l'environnement avec des valeurs par défaut (aucune valeur en dur), annoncer chaque étape, et le rendre idempotent/ré-exécutable. Prouver qu'une erreur simulée (dépendance manquante) l'arrête avec un message clair.

## ⚠️ Erreurs probables et points à vérifier
- Secrets ou chemins en dur dans le script : il ne tourne que sur une machine et fuit potentiellement des secrets.
- Pas de set -e : le script continue après une erreur, sur un état cassé, jusqu'à une erreur obscure plus loin.
- chmod 777 pour « régler » un permission denied : ouvre tous les droits à tous (faille) — utiliser chmod +x.
- Script non idempotent qui casse s'il est relancé : viser la ré-exécutabilité.

## 🔍 Comment vérifier ta solution
- setup.sh lance un projet complet de zéro (install + init + démarrage) avec set -e.
- Le script lit sa config depuis l'environnement (aucune valeur en dur).
- Une erreur simulée (dépendance manquante) arrête le script avec un message clair.
- Le script est exécutable (chmod +x) et pourrait tourner en CI sans modification.

## ❓ Réponses du mini-quiz
1. **Que fait `set -e` et pourquoi est-ce important ?**
   → Il arrête le script à la première commande qui échoue, au lieu de continuer aveuglément sur un état cassé. Sans lui, une install ratée mènerait à un démarrage qui échoue plus loin avec une erreur obscure.
2. **Pourquoi lire la configuration depuis l'environnement plutôt qu'en dur ?**
   → Pour que le script tourne PARTOUT sans modification (local, CI, Docker) : l'environnement fournit les valeurs selon le contexte. Coder les valeurs en dur enchaîne le script à une seule machine.
3. **À quoi sert `chmod +x` sur un script ?**
   → À ajouter le droit d'EXÉCUTION (le x du modèle rwx). Sans lui, lancer le script donne « permission denied ». On évite `chmod 777`, qui ouvre tous les droits à tous (anti-pattern de sécurité).
4. **En quoi un script d'automatisation est-il le germe de la CI ?**
   → Il encode un savoir-faire répétable, exécutable de façon identique par n'importe qui — y compris une machine de CI. Un script qui lit sa config de l'environnement tournerait en CI sans modification.

## 🎤 À savoir expliquer à l'oral
Explique la valeur : « un script encode un savoir-faire répétable, versionnable, exécutable à l'identique par une machine de CI ». Détaille la robustesse (set -e, codes de sortie, messages) et surtout la config par environnement (« le même script tourne partout, c'est le contrat de la CI et de Docker »). Mentionner l'idempotence et éviter chmod 777 montre que tu penses fiabilité et sécurité, pas juste « ça marche sur mon poste ».
