# Correction — Jour 123 : Python : POO et style pythonique

[← Retour au jour 123](../days/day-123.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : des classes avec __init__ et des méthodes. Solution améliorée : utiliser des `@dataclass` pour les structures de données (init/repr/eq générés), n'ajouter une classe que si données et comportement vont ensemble, composer plutôt qu'hériter, exposer les idiomes via les dunder methods (`__len__`), éviter la valeur par défaut mutable (`field(default_factory=list)`), et supprimer les classes qui ne sont que des fonctions déguisées. La preuve : le code est plus court et lisible qu'une POO « à la Java ».

## ⚠️ Erreurs probables et points à vérifier
- Valeur par défaut mutable (`livres: list = []`) : partagée entre TOUTES les instances — utiliser `field(default_factory=list)`.
- Une classe pour ce qui devrait être une fonction (un seul __init__ + une méthode) : over-engineering.
- Hiérarchie d'héritage profonde là où la composition suffit : couplage rigide et fragile.
- Réécrire à la main `__init__`/`__repr__` que `@dataclass` génère : code répétitif et sujet aux erreurs.

## 🔍 Comment vérifier ta solution
- Les structures de données utilisent `@dataclass`.
- Une classe n'existe que si données et comportement vont ensemble.
- La composition est préférée à l'héritage (héritage réservé au « est-un »).
- Aucune valeur par défaut mutable (`field(default_factory=...)` utilisé).
- Aucune classe n'est une fonction déguisée.

## 🎤 À savoir expliquer à l'oral
Pose la question d'abord : « ai-je vraiment besoin d'une classe ? ». Explique dataclass (données), composition > héritage, duck typing (comportement pas type), et le piège de la valeur par défaut mutable. Savoir dire « ici une fonction suffit » est aussi pythonique que savoir écrire une classe — c'est ce qui distingue du code Python idiomatique d'une POO plaquée d'un autre langage.
