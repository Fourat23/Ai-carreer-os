# HSD-034 — Stratégie pédagogique : fondations Data & complétion theory→practice

Document de conception haut niveau (Sprint V34). Complète l'ADR-034.

## 1. Principe directeur
Un néophyte doit comprendre ce qu'EST une donnée avant qu'on lui parle de DataFrame, de feature
ou de modèle. La chaîne Data/ML se construit du plus concret (une ligne, une colonne, une
valeur manquante) vers l'abstrait (pipeline, drift). On RELIE et on DURCIT l'existant avant de
créer.

## 2. La sous-chaîne « fondations data » à rendre franchissable
```
python & données → structures tabulaires (ligne/colonne/observation/variable) →
qualité (valeurs manquantes, doublons, types, cohérence) → transformations →
SQL / modèle relationnel → (puis statistiques → features → ML …)
```
Maillons durcis en V34 : `pandas-data-wrangling` (manipuler des tables), `data-cleaning-quality`
(qualité), `etl-pipelines` (extraire→transformer→charger). `python-foundations` et
`sql-foundations` sont déjà au standard.

## 3. Modèles mentaux imposés
- **Donnée tabulaire** : un tableau = des observations (lignes) décrites par des variables
  (colonnes) ; une feature est une colonne d'entrée, la target la colonne à prédire.
- **Qualité** : « garbage in, garbage out » — une donnée sale (manquants, doublons, types
  incohérents) ruine tout modèle en aval ; nettoyer AVANT de modéliser.
- **ETL** : un pipeline = extraire (sources) → transformer (nettoyer, dériver) → charger
  (destination), reproductible et ordonné ; l'ordre des étapes compte (ne pas dédupliquer après
  avoir agrégé).
- **Leakage précoce** : certaines transformations (imputation, normalisation) doivent être
  apprises sur le train seulement — la fuite commence dès la préparation.

## 4. Pratique déterministe (mécanismes, jamais de faux pandas)
Exercices node-js sur le RAISONNEMENT data : détecter une donnée incohérente/manquante, choisir
l'ordre correct d'un pipeline ETL, décider d'une stratégie de qualité. Plus, pour
`llm-fundamentals`, un exercice de budget de contexte / grounding. Sorties entières/chaînes,
étiquetés SIMULATION.

## 5. Contrat de leçon
On-ramp 🌍 → 🎯 → 🧩 prérequis rédigés → 🧠 modèle mental → explication → exemples → ⚠️ erreurs →
pratique reliée → 🧾 → 📚 → 🔗. Les 3 data-foundations ont un contenu correct : V34 ajoute
on-ramp, prérequis et pratique, sans réécrire l'existant.

## 6. Anti-slop
Pas de texte long pour faire profond, pas de jargon non introduit, pas d'exercice de syntaxe
pour un cours de raisonnement, pas de fausse exécution pandas/ML. Réutiliser avant de créer.
