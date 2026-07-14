# Correction — Jour 248 : Reranking

[← Retour au jour 248](../days/day-248.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le reranking se juge sur les rangs à rappel constant : même top-20 d'entrée, « bon chunk dans le top-3 » et rang moyen avant/après, plus le prix (latence, coût) affiché à côté du gain. La sortie du reranker est contrainte et validée (0-10, rien d'autre) — 20 appels non validés = 20 occasions de casser le tri.

## ⚠️ Erreurs probables et points à vérifier
- Mesurer le reranking sur la présence dans le top-20 : il ne peut PAS l'améliorer (le filet est fixé en amont) — un « gain de rappel » mesuré ici est un bug de protocole.
- Reranker un filet trop étroit (top-5) : si le bon chunk n'est pas dedans, le meilleur reranker du monde réordonne des mauvais candidats — le rappel d'abord, la précision ensuite.
- Sortie LLM non contrainte : un « 7/10 car... » qui ne parse pas au 14e chunk fausse silencieusement le classement — schema + temp 0, comme toujours.
- Cacher le coût : +900 ms et +0,004 €/question changent l'équation produit — le tableau les affiche à côté du gain, et le jour 250 (budget latence) arbitrera.

## 🔍 Comment vérifier ta solution
- Le protocole tient le filet constant (top-20 identique avant/après).
- Le tableau rangs + latence + coût est complet.
- La question résiduelle du jour 247 est récupérée (c'était le cas d'école).
- La sortie du reranker est validée (teste un passage piège qui ferait bavarder le modèle).
- La comparaison cross-encoder local vs LLM est faite ou planifiée (grille du jour 243).

## 🎤 À savoir expliquer à l'oral
Dessine l'entonnoir au tableau : 20 000 chunks → hybride (ms, ~0 €) → top-20 → reranker (900 ms, 0,004 €) → top-3. Une phrase par étage : sa mission (couverture vs précision), son coût. Puis TES chiffres : 22→24/26. L'entonnoir chiffré est LA figure d'entretien search — maîtrise-la au marqueur.
