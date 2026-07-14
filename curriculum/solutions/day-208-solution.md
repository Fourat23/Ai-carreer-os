# Correction — Jour 208 : Intégration LLM dans une app

[← Retour au jour 208](../days/day-208.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
L'intégration est jugée sur les quatre protections : latence maîtrisée (timeout, UX de chargement), coût observé (log par appel), sortie validée, panne dégradée gracieusement. Le test qui fait foi : clé API coupée → l'app reste utilisable, le message est honnête.

## ⚠️ Erreurs probables et points à vérifier
- Appel LLM dans le chemin critique d'une page : la latence du tiers devient TA latence perçue.
- Pas de timeout : un appel qui pend gèle l'expérience entière.
- Afficher la sortie LLM brute sans validation ni possibilité d'édition : l'hallucination part chez l'utilisateur avec TON logo dessus.
- Tester uniquement le cas nominal : la panne se teste EXPRÈS, en coupant la clé.

## 🔍 Comment vérifier ta solution
- Le parcours nominal marche (suggestion utile, latence acceptable).
- Clé coupée → app utilisable, message clair, zéro stacktrace.
- Chaque appel est loggé (tokens, coût, latence, statut).
- L'utilisateur peut éditer/refuser la sortie IA.
- Le retry sur 429 est en place avec backoff.

## 🎤 À savoir expliquer à l'oral
Prépare la démo en 3 actes (2 min) : la feature qui marche → les logs de coût qui tournent → la panne simulée et l'app qui tient debout. C'est le troisième acte qui fait la différence en entretien.
