# Correction — Jour 121 : Python : fonctions, modules, fichiers

[← Retour au jour 121](../days/day-121.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : une CLI qui lit un JSON, agit, réécrit. Solution améliorée : découper en modules à responsabilité unique (stockage I/O, métier pur sans I/O, interface argparse), protéger le point d'entrée par `if __name__ == "__main__"`, ouvrir les fichiers avec `with` et manipuler les chemins avec `pathlib`, garder la logique métier immuable et testable sans fichier. La preuve de bon découpage : ajouter une commande ne touche qu'un module.

## ⚠️ Erreurs probables et points à vérifier
- Tout mettre dans un seul fichier (I/O + métier + CLI) : intestable, non réutilisable — découper en modules.
- Oublier `if __name__ == "__main__"` : le code s'exécute à l'import, effet de bord surprenant.
- Ouvrir un fichier sans `with` (open/close manuel) : le fichier reste ouvert en cas d'erreur — fuite de ressource.
- Mélanger I/O et logique dans les mêmes fonctions : impossible de tester le métier sans toucher au disque.

## 🔍 Comment vérifier ta solution
- Le projet est découpé en modules à responsabilité unique (stockage, métier, interface).
- La logique métier est pure (sans I/O) et testable isolément.
- Le point d'entrée est protégé par `if __name__ == "__main__"`.
- Les fichiers sont ouverts avec `with` et les chemins gérés par `pathlib`.
- Ajouter une commande ne modifie qu'un module (bon découpage).

## 🎤 À savoir expliquer à l'oral
Explique la structure : « stockage (I/O) séparé du métier (pur) séparé de l'interface — j'importe explicitement, rien n'est global ». Insiste sur le rôle de `__main__` (bibliothèque vs point d'entrée) et de `with` (fermeture garantie). Montrer qu'ajouter une commande ne touche qu'un module prouve que ton découpage est sain, pas cosmétique.
