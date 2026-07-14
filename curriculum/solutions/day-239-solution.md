# Correction — Jour 239 : Vector DB : migration vers Chroma

[← Retour au jour 239](../days/day-239.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
La migration est validée par la concordance : ~30/30 top-k identiques (ou permutations expliquées sur scores quasi égaux) entre brute force et Chroma. Les fonctionnalités migrées (upsert idempotent, filtrage where) sont re-testées avec les tests existants des jours 223 et 229 — le harnais du jour 221 boucle le tout.

## ⚠️ Erreurs probables et points à vérifier
- Métrique par défaut (L2) au lieu de cosine à la création de la collection : top-k différents, diagnostic laborieux — LA cause n°1 d'écart.
- Laisser Chroma générer ses embeddings au lieu de fournir les tiens : deux modèles, deux espaces, résultats incomparables.
- Confondre distance et similarité dans les scores exposés au reste du pipeline (le seuil de refus du jour 227 casserait en silence).
- Supprimer la brute force après la bascule : c'est ta référence exacte de diagnostic — elle reste, désactivée par défaut.

## 🔍 Comment vérifier ta solution
- Double-run : 30/30 concordants (écarts restants expliqués par écrit).
- Ré-ingestion double → pas de doublons (upsert sur chunk_id vérifié).
- Le filtrage where reproduit le test deux-documents du jour 229.
- Le harnais du jour 221 passe à l'identique sur le backend Chroma.
- ADR-006 annotée : fait, écarts, durée réelle.

## 🎤 À savoir expliquer à l'oral
Raconte la migration comme une opération contrôlée : « j'avais une référence exacte, j'ai validé les 30 questions en double-run, deux écarts — tous deux la métrique par défaut — corrigés, re-validés ». La maîtrise du récit d'incident évité vaut tous les badges de certification.
