# Correction — Jour 265 : Défense en profondeur : synthèse

[← Retour au jour 265](../days/day-265.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le schéma cartographie les 5 couches du flux (entrée, consignes, récupération/moindre privilège, sortie/ancrage, observabilité) avec pour chacune ce qu'elle attrape ET laisse passer. La maturité tient aux limites explicites (menaces résiduelles assumées) et au principe directeur : réduction de surface + limitation des dégâts + détectabilité, jamais l'étanchéité. La couche sortie est reine (indépendante du modèle), la couche récupération (moindre privilège) est la plus oubliée.

## ⚠️ Erreurs probables et points à vérifier
- Prétendre à l'étanchéité : un schéma qui dit « tout est bloqué » est naïf — le professionnel expose ce qui passe encore.
- Oublier le moindre privilège (couche récupération) : c'est elle qui empêche les fuites de données inter-utilisateurs, les pires incidents — et celle que les débutants omettent.
- Traiter l'observabilité comme accessoire : une attaque non détectée se répète ; les logs de refus/anomalies sont ce qui permet d'apprendre et d'étendre la suite adverse.
- Un schéma décoratif sans lien aux tests : chaque couche devrait pointer vers le cas adverse (jour 264) qui la vérifie — sinon c'est un dessin, pas une architecture.

## 🔍 Comment vérifier ta solution
- Le schéma couvre les 5 couches dans l'ordre du flux, avec rôle ET limite de chacune.
- Le moindre privilège (couche récupération) est présent et mis en évidence.
- La couche sortie (ancrage) est identifiée comme la plus solide et pourquoi.
- La section « menaces résiduelles assumées » existe et est honnête.
- Le principe directeur (réduction/limitation/détection, pas étanchéité) est énoncé.

## 🎤 À savoir expliquer à l'oral
Dessine le schéma en 2 minutes en insistant sur deux points contre-intuitifs : « la couche de SORTIE est la plus solide car elle ne fait pas confiance au modèle, et la couche de RÉCUPÉRATION — le moindre privilège — est la plus oubliée alors qu'elle empêche les fuites de données ». Termine par le principe : « je ne vise pas l'étanchéité, je vise réduire, limiter, détecter ». Une architecture assumée avec ses trous = maturité sécurité rare.
