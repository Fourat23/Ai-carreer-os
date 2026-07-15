# Correction — Jour 261 : Prompt injection : défense

[← Retour au jour 261](../days/day-261.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
La défense empile des couches imparfaites (séparation, consigne durcie, filtre d'entrée, ancrage de sortie, moindre privilège) et se PROUVE par le re-test mesuré des attaques du jour 260 après chaque couche. La couche de sortie (ancrage) est la plus solide car indépendante de la coopération du modèle — c'est elle qui neutralise l'injection indirecte. Ce qui passe encore est documenté.

## ⚠️ Erreurs probables et points à vérifier
- Chercher LA rustine parfaite (un super-prompt anti-injection) : illusoire — le modèle ne distingue pas instructions et données, seules les couches combinées réduisent le risque.
- Tout miser sur les couches d'ENTRÉE : elles n'arrêtent pas l'injection indirecte (le payload est dans les données récupérées) — l'ancrage de SORTIE est indispensable.
- Déclarer « sécurisé » après avoir bloqué les attaques connues : de nouvelles passeront — la posture est « réduit et détectable », pas « immunisé ».
- Ne pas re-tester : une défense non mesurée est une croyance ; re-joue les attaques du jour 260 et compte ce qui passe.

## 🔍 Comment vérifier ta solution
- Les couches sont implémentées et le tableau de réduction (attaque × couche) est rempli.
- L'injection INDIRECTE du jour 260 est bien attrapée par la couche d'ancrage de sortie (et pas avant).
- Au moins une attaque résiduelle qui passe TOUTES les couches est documentée honnêtement.
- La réduction est mesurée (x attaques sur y neutralisées), pas affirmée.

## 🎤 À savoir expliquer à l'oral
Explique pourquoi l'ancrage de sortie est la couche reine : « les couches d'entrée relèvent la barre mais l'injection indirecte a son payload DANS les données — seule une vérification de sortie qui ne fait pas confiance au modèle l'attrape ». Puis la phrase de maturité : « je ne bloque pas tout, je réduis, je détecte, je limite les dégâts — et je sais ce qui passe encore ».
