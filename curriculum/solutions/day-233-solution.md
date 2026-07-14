# Correction — Jour 233 : Interface du RAG

[← Retour au jour 233](../days/day-233.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
L'interface réussit si les trois écrans existent (réponse citée vérifiable, refus utile, état du corpus) et si le test utilisateur passe : vérifier une source en < 10 secondes, comprendre un refus sans explication orale. La technologie (CLI riche ou page web) est secondaire ; la vérifiabilité est le critère.

## ⚠️ Erreurs probables et points à vérifier
- Passer la journée sur le style au lieu des trois écrans : l'interface est un véhicule de confiance, pas un portfolio de CSS.
- Des citations qui pointent vers le document entier (« voir guide.pdf ») : sans l'extrait exact, la vérification coûte trop cher et personne ne la fait.
- Utiliser le gabarit « réponse » pour afficher un refus : l'utilisateur croit à une réponse et lit un non — confusion garantie.
- Sauter le test utilisateur : TU sais où cliquer ; le test révèle ce qui n'est évident que pour toi.

## 🔍 Comment vérifier ta solution
- Question nominale → réponse + citations dépliables avec extrait exact.
- Question hors corpus → écran de refus dédié avec suggestions.
- L'état du corpus (documents, date d'ingestion) est visible quelque part.
- Le test utilisateur est fait et 2-3 frictions sont notées.
- La latence est habitée (états ou streaming) — pas d'écran figé de 4 secondes.

## 🎤 À savoir expliquer à l'oral
Ta démo de 2 minutes est maintenant complète : question nominale (réponse + vérification d'une source EN DIRECT), question piège (refus propre), et l'état du corpus. Répète-la une fois chronomètre en main — c'est elle qui ouvrira tes entretiens.
