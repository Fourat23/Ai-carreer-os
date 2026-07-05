<!-- keep -->
# Penser comme un ingénieur

Coder, c'est de la syntaxe. **Ingénierie**, c'est une façon de penser. Voici les réflexes à construire — ils comptent plus que n'importe quel langage.

## 1. Décomposer
Face à un gros problème, le réflexe d'ingénieur est de le **couper en sous-problèmes** plus petits, chacun trivial ou déjà résolu. « Construire une API » devient : modéliser les données → une route → la validation → la persistance → les erreurs → les tests. Si un morceau reste trop gros, redécoupe.

## 2. La méthode avant le code
(Voir *how-to-debug.md* pour le debug, et la méthode du jour 19 pour les algos.) Comprendre → exemples → décomposer → pseudo-code → coder → vérifier. Écrire du code est la **dernière** étape, pas la première. Trois minutes de réflexion économisent trente minutes d'errance.

## 3. Raisonner sur le coût (trade-offs)
Il n'existe pas de solution parfaite, seulement des compromis. Chaque choix sacrifie quelque chose : temps vs mémoire (jour 15), simplicité vs flexibilité, vitesse vs robustesse, coût vs qualité. La maturité n'est pas de connaître LA réponse, mais de **nommer les trade-offs et de choisir consciemment selon le contexte**. « Ça dépend » est souvent la vraie réponse — à condition de savoir *de quoi* ça dépend.

## 4. Penser aux cas limites et aux erreurs
Le débutant code le « chemin heureux ». L'ingénieur se demande : *et si l'entrée est vide ? nulle ? gigantesque ? malveillante ? Et si le réseau tombe ? Et si le fichier n'existe pas ?* Un programme qui ne gère que le cas nominal est à moitié écrit.

## 5. Rendre le code lisible pour le prochain
Le code est lu bien plus qu'il n'est écrit. Le « prochain » est souvent **toi dans six mois**. Nommage d'intention, fonctions courtes, structure claire : ce n'est pas de l'esthétique, c'est de l'économie (de temps, de bugs).

## 6. Rendre le code testable
Un code testable est un code bien conçu : logique **pure** séparée des effets de bord (fichiers, réseau, affichage). Si c'est dur à tester, c'est mal découpé. Le test n'est pas une corvée d'après-coup : c'est un **révélateur de conception**.

## 7. Mesurer avant d'optimiser
« L'optimisation prématurée est la racine de tous les maux. » On ne devine pas le goulot d'étranglement, on le **mesure** (jour 15, jour 80). Optimiser au hasard, c'est ajouter de la complexité sans bénéfice prouvé.

## 8. Une source de vérité
Ne stocke jamais ce qui se calcule (le poids total se déduit de l'inventaire, jour 10). Une donnée dupliquée finit désynchronisée. Une seule source de vérité, le reste se dérive.

## 9. Isoler ce qui change
Ce qui varie (le stockage, l'API externe, le modèle LLM) doit être **derrière une interface** (jours 44, 42). Le reste du code ne doit pas savoir *comment* c'est fait. C'est l'inversion de dépendance : le cœur stable, les détails remplaçables.

## 10. Documenter les décisions, pas le code
Le code dit *ce qu'il fait*. La documentation (commentaires, ADRs) doit dire *pourquoi* — l'information qui n'est pas dans le code. Un ADR (« pourquoi JSON et pas SQLite ») vaut de l'or en équipe et en entretien.

## 11. Remarquer l'ambiguïté
Souvent, la vraie compétence n'est pas de coder vite, mais de **remarquer** qu'une spec est ambiguë (« un étudiant de 70 ans, quel tarif ? »), de choisir consciemment et de documenter le choix. Détecter les zones floues avant de coder évite les bugs coûteux.

## 12. Penser « production »
Un code qui marche en démo peut geler en production (jour 15), fuir des données (mois 3), coûter une fortune (mois 8). L'ingénieur se demande tôt : *et à l'échelle ? et si ça tourne 10 000 fois par jour ? et si ça échoue au milieu ?*

## Le méta-réflexe
Avant de coder, pose-toi : **« Quel est vraiment le problème ? Quelles sont les contraintes ? Quel est le plus simple qui marche ? Qu'est-ce qui peut mal tourner ? »** Ces quatre questions séparent celui qui pond du code de celui qui résout des problèmes. C'est le second qu'on embauche.
