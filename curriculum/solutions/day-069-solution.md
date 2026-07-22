# Correction — Jour 69 : Consolidation mois 3 : refactor complet d'une API

[← Retour au jour 69](../days/day-069.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Refactorer sous filet : d'abord verrouiller le comportement par des tests écrits AVANT, ensuite restructurer par petites étapes committables (couches séparées, erreurs centralisées, config sortie), en relançant les tests à chaque étape. Jamais de big-bang. Documenter la dette restante (quoi, pourquoi accepté, signal de paiement). La preuve : les tests écrits avant restent verts, l'historique montre plusieurs petites étapes.

## ✅ Une solution simple
Améliorer la structure de l'API (séparer un peu les couches, centraliser les erreurs). Le code est plus propre.

## 🚀 Une solution améliorée
Écrire les tests AVANT de toucher au code (verrouiller le comportement), refactorer par PETITES étapes committables (chacune laisse le système fonctionnel, tests verts), cibler couches/erreurs/config, et DOCUMENTER la dette restante (quoi, pourquoi accepté, signal de paiement). Éviter tout big-bang.

## ⚠️ Erreurs probables et points à vérifier
- Refactorer sans tests : on casse le comportement en croyant l'améliorer, régressions silencieuses.
- Big-bang (tout réécrire d'un coup) : système cassé pendant des jours, impossible à déboguer, souvent abandonné.
- Ne pas commiter les petites étapes : perte de la traçabilité et de la réversibilité.
- Laisser la dette restante invisible au lieu de la documenter : elle est subie au lieu d'être gérée.

## 🔍 Comment vérifier ta solution
- Le refactor est couvert par des tests écrits AVANT (et toujours verts après).
- Historique : plusieurs petites étapes commitées, jamais un big-bang.
- La dette restante est documentée (quoi, pourquoi accepté, signal de paiement).
- Le comportement de l'API est inchangé (mêmes réponses, prouvé par les tests).

## ❓ Réponses du mini-quiz
1. **Qu'est-ce que refactorer, et qu'est-ce qui garantit qu'on ne casse rien ?**
   → Améliorer la STRUCTURE du code sans changer son COMPORTEMENT. La garantie, ce sont les TESTS écrits AVANT : s'ils restent verts après restructuration, le comportement est identique.
2. **Pourquoi procéder par petites étapes plutôt qu'une grande réécriture ?**
   → Le big-bang laisse le système cassé pendant des jours, cumule les changements et devient impossible à déboguer. Les petites étapes laissent le système fonctionnel et committable à chaque fois — traçable et réversible.
3. **Quelles sont les cibles typiques d'un refactoring d'API ?**
   → Séparer les couches (logique hors des routes → services), centraliser les erreurs (middleware unique), sortir la config (secrets/paramètres en environnement), nommer clairement. Chaque amélioration réduit le couplage sans changer ce que l'API fait.
4. **Que fait-on de la dette technique restante après un refactoring ?**
   → On la DOCUMENTE (quoi reste imparfait, pourquoi c'est accepté, quel signal déclencherait son paiement) au lieu de la laisser invisible — la rendre gérable plutôt que subie.

## 🎤 À savoir expliquer à l'oral
Martèle la règle : « je ne refactore jamais sans tests — ils garantissent que le comportement ne change pas ». Décris la méthode : verrouiller par des tests, puis petites étapes committables (couches, erreurs, config), tests à chaque fois, jamais de big-bang. Mentionner les tests de caractérisation pour du legacy non testé et la documentation de la dette montre que tu sais opérer sur du code réel, pas seulement sur du neuf.
