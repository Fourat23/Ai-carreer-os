# Correction — Jour 207 : Function calling / tool use

[← Retour au jour 207](../days/day-207.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
L'assistant est une boucle bornée : le modèle choisit (texte OU demande d'outil) via les descriptions, ton code valide et exécute, le résultat repart au modèle. La robustesse se juge sur les cas non nominaux : pas d'outil pertinent, outil en échec, arguments invalides.

## ⚠️ Erreurs probables et points à vérifier
- eval() sur l'expression du LLM : exécution de code arbitraire proposé par un composant non fiable — LA faille à ne jamais commettre.
- Boucle sans limite d'itérations : le modèle peut redemander des outils indéfiniment.
- Descriptions d'outils vagues : le modèle appelle la météo pour tout — la description EST l'interface de décision.
- Masquer l'échec d'un outil au modèle : il invente alors un résultat plausible au lieu de signaler le problème.

## 🔍 Comment vérifier ta solution
- Question météo → outil météo appelé, réponse intègre le mock.
- Question calcul → outil calcul, résultat exact.
- Question sans outil pertinent → réponse honnête SANS appel d'outil.
- Outil forcé en échec → l'assistant le DIT au lieu d'inventer.
- La boucle s'arrête toujours (limite testée).

## 🎤 À savoir expliquer à l'oral
Dessine la boucle au tableau (utilisateur → modèle → tool_call → validation/exécution → tool_result → modèle → réponse) et place la frontière de confiance d'un trait rouge : tout ce qui vient du modèle est une PROPOSITION. Ce schéma est une question d'entretien quasi certaine en 2026.
