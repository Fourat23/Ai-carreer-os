# Correction — Jour 312 : DocSense : génération avec citations

[← Retour au jour 312](../days/day-312.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : générer une réponse avec des citations. Solution améliorée : un contrat de génération strict (sources uniquement, citation par affirmation, refus si insuffisant), une vérification automatique des citations en aval (la source soutient vraiment l'affirmation, jour 262), un refus honnête sur ancrage insuffisant ou scores faibles (jour 263), et un format soigné. Les citations vérifiables + le refus sont ce qui rend DocSense digne de confiance et déployable auprès d'un professionnel.

## ⚠️ Erreurs probables et points à vérifier
- Citations présentes mais non vérifiées : le modèle peut citer décorativement ou mal — la vérification aval est indispensable.
- Pas de refus : un système qui répond toujours invente parfois, et un mensonge découvert détruit la confiance — le refus est une feature.
- Format brut (réponse et refus identiques) : l'utilisateur ne distingue pas une réponse d'un refus — soigner le format.
- Seuil de refus non calibré : trop bas il hallucine, trop haut il refuse des questions couvertes — calibrer sur le corpus DocSense (jour 263).

## 🔍 Comment vérifier ta solution
- Chaque affirmation cite sa source et la citation est vérifiée automatiquement.
- Le refus honnête fonctionne sur une question hors corpus (message utile, pas d'invention).
- Le format distingue clairement réponse et refus, citations lisibles/cliquables.
- Les 3 régimes (répondable, hors corpus, multi-documents) sont testés sur le corpus DocSense.
- Le seuil de refus est calibré sur le corpus DocSense.

## 🎤 À savoir expliquer à l'oral
Fais la démo de confiance en 60 secondes : « je pose une question, voici la réponse avec ses citations — je clique, la source contient bien l'affirmation ; maintenant une question hors corpus, DocSense refuse honnêtement au lieu d'inventer ». Puis la phrase clé : « un assistant qui cite et sait dire je-ne-sais-pas est un assistant qu'un professionnel ose utiliser ». C'est la démonstration la plus vendeuse de tout le projet.
