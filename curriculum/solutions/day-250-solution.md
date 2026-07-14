# Correction — Jour 250 : Budget latence et optimisation

[← Retour au jour 250](../days/day-250.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
L'optimisation suit la chaîne : instrumenter (chrono par étage), lire en percentiles, attaquer le poste dominant (le seul où l'effort paie), re-mesurer, puis FIGER un budget par poste avec marge. La latence perçue (streaming) se traite comme un levier à part entière, distinct du total.

## ⚠️ Erreurs probables et points à vérifier
- Optimiser à la moyenne : le p95 est l'expérience d'1 utilisateur sur 20 — c'est lui qui définit la réputation du système.
- Micro-optimiser un poste à 30 ms pendant que le rerank en prend 900 : l'effort sans le tableau est du zèle mal placé.
- Paralléliser les appels rerank sans penser au rate limit : 20 appels simultanés × N utilisateurs = 429 assurés — le composant du jour 214 (retry/backoff) et un sémaphore bornent la casse.
- Écrire un budget sans marge (p95 mesuré = budget) : la première variation naturelle le crève — la marge est ce qui sépare un budget d'une photo.

## 🔍 Comment vérifier ta solution
- La décomposition p50/p95 par poste existe (sur ≥ 50 requêtes).
- Le poste dominant a été attaqué et le gain re-mesuré.
- Le streaming est en place et la latence au premier token notée.
- Le budget final est écrit poste par poste avec marge, et un check le compare aux mesures.
- Les outliers du p95 ont une cause identifiée (variante).

## 🎤 À savoir expliquer à l'oral
Raconte l'optimisation comme une enquête : « le tableau désignait le rerank (900 sur 1310 ms) ; 10 lignes d'asyncio → -790 ms ; streaming pour le perçu ; budget écrit avec marge ». Termine par la règle : « on optimise ce que le tableau désigne, jamais ce que l'intuition suggère ». Chiffres + méthode + punchline : imparable.
