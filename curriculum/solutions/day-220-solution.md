# Correction — Jour 220 : RAG : génération avec citations

[← Retour au jour 220](../days/day-220.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le pipeline complet enchaîne tes briques : top-k (jour 219) → sources numérotées avec métadonnées (jour 216) → llm_call sous contrat (jour 214). La qualité se juge sur les trois régimes, et le refus honnête est un CAS DE SUCCÈS, pas un échec du système.

## ⚠️ Erreurs probables et points à vérifier
- Un contrat mou (« aide-toi des extraits ») : le modèle mélange sources et mémoire d'entraînement — impossible à auditer.
- Citations vérifiées seulement en apparence : vérifie que [2] pointe VRAIMENT vers l'extrait qui soutient l'affirmation (le modèle peut citer décorativement).
- Ne pas transmettre les scores au contrôle : génération forcée sur un top-k à 0.35 = hallucination avec décor.
- Injecter 10 chunks « pour être sûr » : bruit, coût, et le modèle cite tout et n'importe quoi — k reste une décision (3-5).

## 🔍 Comment vérifier ta solution
- 5/5 questions nominales : réponse correcte + citations exactes (vérifiées manuellement).
- La question multi-chunks cite ses deux sources.
- 2/2 questions hors corpus → refus explicite, zéro invention.
- Chaque réponse logge coût et latence (via llm_call).
- Une affirmation sans citation déclenche ton œil : audit fait sur les 5 réponses.

## 🎤 À savoir expliquer à l'oral
La démo en 90 secondes : une question normale (réponse + citations), puis LA question piège hors corpus (refus propre). Termine par : « un RAG qui sait dire je-ne-sais-pas est un RAG qu'on peut déployer ». C'est le moment le plus vendeur de tout ton portfolio RAG.
