# Correction — Jour 244 : Consolidation vector DB + chunking

[← Retour au jour 244](../days/day-244.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
La consolidation réussit si un tiers peut reconstruire ton système ET tes raisons depuis le commit : config avec justifications pointant vers les tableaux, baseline complète (qualité, latence, coût) dans le manifeste, dette listée avec ses raisons. Rien de neuf ne s'invente — tout se compile et se fige.

## ⚠️ Erreurs probables et points à vérifier
- Consolider en recopiant les conclusions sans les chiffres : « structurel car meilleur » ne permet aucune ré-évaluation — le renvoi au tableau, si.
- Une baseline partielle (qualité sans latence ni coût) : l'hybride et le reranking DÉGRADENT la latence — sans baseline latence, impossible d'arbitrer la semaine prochaine.
- Cacher la dette d'expérimentation : les synthèses à 3/6 non résolues sont une info CRUCIALE pour la suite, pas une honte à masquer.
- Différer la consolidation (« je le ferai après l'hybride ») : chaque expérience de plus rend la compilation plus floue — on fige à chaque palier.

## 🔍 Comment vérifier ta solution
- Le fichier de config existe, chaque paramètre a sa justification avec renvoi.
- La baseline couvre qualité (par type), refus, latence décomposée, coût.
- La dette liste ≥ 3 non-testés avec leurs raisons.
- Le commit est tagué retrieval-v1 et le manifeste de l'index pointe vers cette config.

## 🎤 À savoir expliquer à l'oral
Le récit de la semaine en 90 secondes : « trois expériences contrôlées — chunking, versioning, embeddings — compilées en une config de référence justifiée ligne à ligne, une baseline chiffrée à battre, et une dette explicite dont une observation clé : mes synthèses résistent au retrieval, le problème est probablement ailleurs ». C'est un rapport de fin d'itération d'ingénieur ML — à 30 ans de carrière, le format ne changera pas.
