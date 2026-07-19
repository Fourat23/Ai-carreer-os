# Correction — Jour 317 : DocSense : harnais d'évaluation

[← Retour au jour 317](../days/day-317.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : un script qui calcule les métriques. Solution améliorée : un harnais en une commande produisant un rapport structuré (retrieval + génération, par type + agrégat), reproductible (temp 0, golden versionné), comparable entre versions (--compare), branché sur le cœur hexagonal (teste les configs via les ports). Évaluer DÈS MAINTENANT permet de piloter tout le build par la mesure — le principe des tests automatisés appliqué à la qualité IA.

## ⚠️ Erreurs probables et points à vérifier
- Reporter l'évaluation à la fin : les problèmes sont découverts trop tard pour être corrigés — évaluer en continu.
- Un harnais lent/cher : il ne sera pas lancé souvent — optimiser (cache des jugements) pour qu'il reste sans friction.
- Rapport agrégat seul : le score global ne dit pas OÙ améliorer — par type + par question.
- Non reproductible (juges à température > 0) : les comparaisons de versions deviennent non fiables.

## 🔍 Comment vérifier ta solution
- `docsense eval` produit un rapport en une commande (retrieval + fidélité, par type + agrégat).
- Le rapport est reproductible (temp 0, golden versionné, config enregistrée).
- Le mode --compare montre les deltas entre versions.
- Le harnais évalue le cœur via les ports (teste les configs sans le changer).
- Le temps et le coût d'une campagne sont mesurés (variante).

## 🎤 À savoir expliquer à l'oral
Fais le parallèle avec la CI : « comme la CI rend les tests automatiques, mon harnais rend l'évaluation automatique — une commande, un rapport ; je le lance à chaque changement, donc j'améliore DocSense guidé par les chiffres, pas à l'aveugle ». Évaluer tôt et souvent plutôt qu'à la fin est une culture d'ingénierie qui distingue.
