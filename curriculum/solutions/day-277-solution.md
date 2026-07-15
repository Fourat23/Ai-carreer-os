# Correction — Jour 277 : Mémoire et état d'agent

[← Retour au jour 277](../days/day-277.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : garder l'historique et le tronquer aux N derniers tours quand il déborde. Solution améliorée : maintenir un ÉTAT STRUCTURÉ compact (objectif, sous-tâches faites, faits établis, derniers tours) plutôt que l'historique brut ; résumer l'ancien par un appel LLM quand le budget de contexte est dépassé ; persister la mémoire long terme dans un fichier réinjecté entre sessions. Le trade-off coût/complétude/fiabilité est arbitré explicitement et idéalement mesuré.

## ⚠️ Erreurs probables et points à vérifier
- Laisser l'historique brut grossir sans stratégie : l'agent devient cher (tokens) et confus (lost in the middle) au fil de la session.
- Confondre mémoire du modèle et mémoire de l'agent : le modèle n'a rien — toute mémoire vient de TON code qui gère le contexte.
- Tronquer bêtement les vieux tours en perdant l'objectif ou un fait clé : préférer un état structuré qui garde l'essentiel, ou résumer.
- Ne pas mesurer le trade-off : garder « tout par sécurité » coûte cher et dégrade la fiabilité — mesurer coût vs qualité guide le bon niveau.

## 🔍 Comment vérifier ta solution
- L'agent maintient un état structuré compact, pas seulement l'historique brut.
- Une stratégie de gestion du débordement est en place (résumé de l'ancien + troncature du récent).
- La mémoire persistante entre sessions fonctionne (fichier réinjecté au démarrage).
- Le trade-off coût/complétude/fiabilité est mesuré (avec/sans résumé, variante).
- L'objectif n'est jamais perdu lors de la troncature.

## 🎤 À savoir expliquer à l'oral
Explique que la mémoire d'un agent est une ILLUSION que ton code fabrique : « le modèle n'a rien ; je maintiens un état structuré compact, je résume quand ça déborde, je persiste ce qui doit survivre entre sessions ». Puis le trade-off : « coût vs complétude vs fiabilité, arbitré explicitement ». Le terme context engineering, bien placé, signale que tu connais l'état de l'art.
