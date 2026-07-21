# Correction — Jour 178 : Projet 5 — Feature engineering

[← Retour au jour 178](../days/day-178.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : ajouter des features et voir si le score monte. Solution améliorée : dériver des features justifiées par le métier ET l'analyse d'erreurs, mesurer chaque gain en CV (modèle/protocole fixes), journaliser, et surtout vérifier à CHAQUE ajout l'absence de leakage temporel (feature calculable à la date d'observation, fenêtre antérieure, calcul sur le train seul via Pipeline). La preuve : des gains mesurés et reproductibles, aucune feature encodant la cible ou postérieure à l'observation.

## ⚠️ Erreurs probables et points à vérifier
- Ajouter une feature qui encode la cible (ex. 'jours depuis résiliation') : gain magique, modèle inutilisable.
- Agrégat temporel incluant des données postérieures à la date d'observation : leakage temporel subtil.
- Garder des features sans mesurer leur gain : certaines hypothèses séduisantes n'apportent rien.
- Créer les features hors Pipeline (sur tout le dataset) : leakage — les intégrer au Pipeline, apprises sur le train seul.

## 🔍 Comment vérifier ta solution
- Les features dérivent d'hypothèses métier et de l'analyse d'erreurs.
- Chaque feature est mesurée sur la validation et journalisée.
- Aucune feature n'encode la cible ni n'inclut d'information postérieure à l'observation.
- Les fenêtres temporelles sont antérieures à la date d'observation.
- Les features sont calculées via le Pipeline (train seul, pas de leakage).

## 🎤 À savoir expliquer à l'oral
Explique que sur un projet réel les features rapportent plus que le modèle, et qu'elles viennent du métier et de l'analyse d'erreurs. Insiste sur le leakage temporel spécifique au churn (« jours depuis résiliation » encode la cible ; fenêtres antérieures à l'observation). Montrer qu'une feature qui fuit fait exploser l'AUC à ~1,0 prouve que tu sais reconnaître un gain illusoire, la vigilance clé d'un projet réel.
