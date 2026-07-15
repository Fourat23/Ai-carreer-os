# Correction — Jour 284 : Caching des appels LLM

[← Retour au jour 284](../days/day-284.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : un dict prompt→réponse consulté avant l'appel. Solution améliorée : clé = hash(prompt+modèle+params), persistance (SQLite pour survivre aux runs), garde-fou température 0 (cacher du non-déterministe est un bug), mesure du taux de hit (l'indicateur qui décide si le cache vaut le coup), et conscience des limites (n'aide que sur le répété/déterministe, invalidation si le corpus change). Mesurer le taux de hit AVANT de conclure est le réflexe clé.

## ⚠️ Erreurs probables et points à vérifier
- Cacher à température > 0 : on fige un tirage aléatoire comme s'il était LA réponse — la variabilité voulue disparaît, bug subtil.
- Ne pas mesurer le taux de hit : un cache à 2 % de hit ne sert à rien ; sans la mesure, on croit optimiser sans effet.
- Clé incomplète (oublier le modèle ou les paramètres) : deux appels réellement différents partagent une entrée → mauvaise réponse servie.
- Ignorer l'invalidation : une réponse cachée devient obsolète si le corpus change — lier la clé à la version de l'index quand c'est pertinent.

## 🔍 Comment vérifier ta solution
- Le cache est fonctionnel (hit sur un appel identique répété — un seul appel réel).
- La clé inclut prompt + modèle + paramètres.
- Un garde-fou empêche le cache à température > 0.
- Le taux de hit est mesuré et interprété (le cache vaut-il le coup ?).
- La différence de taux de hit dev vs questions uniques est observée (variante).

## 🎤 À savoir expliquer à l'oral
Explique la condition de validité comme la clé de compréhension : « le cache n'est correct qu'à température 0 — cacher du non-déterministe fige un tirage aléatoire ». Puis le réflexe de mesure : « je mesure le taux de hit avant de conclure — 40 % c'est un levier, 2 % c'est inutile ; le cache n'aide que sur le répété ». Nuancer un optimisation (quand elle aide, quand non) est un signal d'ingénieur.
