# Correction — Jour 102 : Performance React : re-renders

[← Retour au jour 102](../days/day-102.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : envelopper le composant lourd dans React.memo. Solution améliorée : MESURER d'abord au Profiler, diagnostiquer la référence instable (fonction/objet en ligne), stabiliser avec useCallback/useMemo pour que memo agisse réellement, puis RE-profiler pour prouver le gain. Le jugement clé : ne mémoïser que ce qu'un profil désigne comme coûteux et inutile — pas par principe. La preuve : un avant/après chiffré au Profiler.

## ⚠️ Erreurs probables et points à vérifier
- Mémoïser partout « au cas où » : coût en complexité et en mémoire sans gain, code illisible.
- React.memo sans stabiliser les props-fonctions (useCallback) : l'enfant re-rend quand même car l'identité change à chaque rendu.
- Optimiser sans mesurer : on complexifie à l'aveugle, souvent le mauvais composant.
- useMemo sur un calcul trivial : du bruit qui dégrade la lisibilité pour un gain nul.

## 🔍 Comment vérifier ta solution
- Un profil (Profiler) identifie le re-rendu coûteux AVANT toute optimisation.
- La cause (référence instable) est diagnostiquée, pas devinée.
- memo est accompagné de useCallback/useMemo pour que les props restent stables.
- Un re-profilage prouve le gain après optimisation.
- Aucune mémoïsation n'est posée sans justification mesurée.

## 🎤 À savoir expliquer à l'oral
Formule la règle d'or : « mesurer avant d'optimiser ». Explique la chaîne référence instable → props changent → memo inefficace, et pourquoi useCallback débloque memo. Insiste sur le jugement anti-sur-ingénierie : « je ne mémoïse que le re-rendu coûteux prouvé au Profiler ». Montrer un avant/après chiffré est bien plus convaincant que réciter les trois hooks.
