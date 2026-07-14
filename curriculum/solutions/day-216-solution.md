# Correction — Jour 216 : RAG : chunking

[← Retour au jour 216](../days/day-216.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le chunker est 20 lignes ; la valeur du jour est dans l'inspection outillée : stats de tailles, lecture d'un échantillon, et vérification manuelle que les chunks capables de répondre à tes questions types EXISTENT. Un chunk illisible pour toi est illisible pour le pipeline.

## ⚠️ Erreurs probables et points à vérifier
- Oublier l'overlap (ou le mettre ≥ taille : boucle infinie — teste ce bord).
- Chunker en caractères en croyant compter des tokens : facteur ~4 d'erreur sur la taille réelle.
- Jeter les métadonnées (source, position) « pour simplifier » : les citations du jour 220 deviennent impossibles sans ré-ingestion.
- Valider le chunking sur les stats seules sans LIRE : la moyenne peut être parfaite et les chunks incompréhensibles (tableaux hachés, code coupé).

## 🔍 Comment vérifier ta solution
- Stats affichées : n, min/moy/max — pas de chunks fantômes de 5 mots.
- 20 chunks lus, verdict noté (autoportant ou coupé) pour chacun.
- Pour 3 questions types, le chunk-réponse existe et est entier.
- Chaque chunk porte source + position.
- Le cas limite overlap ≥ taille est géré (erreur explicite).

## 🎤 À savoir expliquer à l'oral
Explique la tension petit/gros avec un exemple LU dans tes propres chunks (le chunk orphelin « il a augmenté de 12 % » est parfait). Puis la règle pro : partir de 300-500 + overlap, inspecter, mesurer ensuite. Concret, vécu, mesurable.
