# Correction — Jour 218 : RAG : embeddings

[← Retour au jour 218](../days/day-218.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
L'ingestion est correcte si elle est idempotente (relançable sans doublons ni re-paiement), traçable (méta : modèle, date, n) et vérifiée (le test de santé aux 3 requêtes). Le stockage JSON est un choix ASSUMÉ pour ce volume, pas une négligence — tu sais ce qui le fera craquer.

## ⚠️ Erreurs probables et points à vérifier
- Embedder question et chunks avec des modèles différents : l'erreur silencieuse la plus coûteuse du RAG — rien ne plante, tout est faux.
- Ingestion non reprenable : le plantage au chunk 800 coûte 800 chunks re-payés.
- Oublier de stocker le texte avec le vecteur : un vecteur seul est inutilisable pour la génération.
- Sauter le test de santé : tu découvriras demain, empilé sur la logique de recherche, que l'espace était cassé aujourd'hui.

## 🔍 Comment vérifier ta solution
- Relancer l'ingestion complète → 0 appel API (tout est déjà fait) : idempotence prouvée.
- Les méta d'index contiennent modèle/date/n.
- Test de santé : 3/3 cibles dans le top-3.
- Coût et durée de l'ingestion notés.

## 🎤 À savoir expliquer à l'oral
Explique « pourquoi JSON et pas une vector DB dès maintenant » : à ce volume, la recherche exacte en mémoire est instantanée et transparente ; la vector DB résout l'échelle et le filtrage — des problèmes que j'aurai plus tard et que je saurai reconnaître. Décision dimensionnée = maturité.
