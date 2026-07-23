# Correction — Jour 314 : DocSense : jalon RAG bout-en-bout

[← Retour au jour 314](../days/day-314.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : montrer que le RAG répond. Solution améliorée : une démonstration bout-en-bout sur le corpus réel (10 questions → réponses citées + un refus), idéalement depuis un clone frais (reproductibilité), plus une revue d'architecture hebdomadaire qui attrape les dérives (écart architecture décidée vs réalité, dette accumulée). Le jalon démontrable force l'honnêteté sur le progrès et garantit une version fonctionnelle chaque semaine.

## ⚠️ Erreurs probables et points à vérifier
- Confondre « du travail fait » et « jalon démontrable » : seul ce qu'on peut MONTRER compte — 10 réponses citées, pas « le RAG avance ».
- Démontrer sur sa propre machine mal configurée : « ça marche chez moi » ne prouve pas la livrabilité — viser le clone frais.
- Sauter la revue d'architecture : les dérives (cœur contaminé, dette) s'accumulent silencieusement et coûtent cher plus tard.
- Une démo hésitante : montrer un système qui marche de façon FLUIDE se prépare — c'est aussi l'entraînement de la démo finale.

## 🔍 Comment vérifier ta solution
- La démo montre 10 questions → réponses citées sur le corpus DocSense.
- La chaîne complète (ingestion → retrieval hybride → génération citée) fonctionne bout en bout.
- Au moins un refus honnête est démontré (question hors corpus).
- La démo tourne idéalement depuis un clone frais (reproductibilité).
- La revue d'architecture est faite (écart décidé/réalité, décision continuer/corriger).

## 🎤 À savoir expliquer à l'oral
Explique le jalon démontrable comme un mécanisme d'honnêteté : « chaque semaine je montre quelque chose de concret — 10 questions, 10 réponses citées, depuis un clone frais ; si je ne peux pas le montrer, c'est un retard que je traite, pas que je cache ». Puis la revue d'archi : « je vérifie chaque semaine que l'architecture tient le choc du build ». Un projet fait de jalons démontrables a toujours quelque chose à montrer — l'assurance d'un projet fini.
