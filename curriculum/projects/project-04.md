<!-- keep -->
# Projet 4 — DataPulse (pipeline ETL + dashboard)

> **Mois 5 · Semaine 21** · Compétences : Python, SQL/data, autonomie.
> Un pipeline de données **rejouable** qui répond à de **vraies questions**.

## 🎯 Objectif
Construire un pipeline ETL en Python qui ingère une source de données publique, la nettoie (avec un rapport de qualité), la charge dans SQLite, et alimente un dashboard répondant à 3 questions métier précises.

## Ce que le projet prouve
- Tu construis un **pipeline de données** structuré et rejouable.
- Tu prends au sérieux la **qualité des données** (nettoyage documenté).
- Tu maîtrises **Python** (pandas) et **SQL** (modélisation, chargement transactionnel).
- Tu transformes des données en **décisions** (dashboard orienté questions).

## Fonctionnalités
- Extraction depuis une source publique (CSV et/ou API).
- Nettoyage avec rapport de qualité (complétude, doublons, aberrations).
- Chargement transactionnel dans SQLite, rejouable sans duplication.
- Dashboard répondant à 3 questions métier.
- Tout lançable en **une commande**.

## Stack
- Python (venv, pandas).
- SQLite (schéma modélisé, transactions).
- Dashboard : matplotlib/plotly (notebook ou script) **ou** petite app web.
- Tests : pytest sur les fonctions de transformation.

## Architecture
```
datapulse/
├── extract.py      # ingestion source(s) — la coquille impure
├── transform.py    # nettoyage en fonctions PURES (testables)
├── load.py         # chargement SQLite transactionnel
├── quality.py      # rapport de qualité
├── dashboard.py    # visualisations répondant aux 3 questions
├── pipeline.py     # orchestration (extract → transform → load)
├── schema.sql
└── tests/
```

## Modèle de données
À concevoir selon ta source, **normalisé**, avec index sur les colonnes filtrées/jointes.
Documente le schéma et justifie chaque table.

## Critères de qualité
- [ ] Pipeline rejouable de zéro en **une commande**, sans duplication (idempotent).
- [ ] Chaque décision de nettoyage **justifiée** (rapport avant/après).
- [ ] Transformations en **fonctions pures** testées.
- [ ] Chargement **transactionnel** (survit à une interruption).
- [ ] Dashboard répondant explicitement aux **3 questions** (pas de graphique décoratif).
- [ ] **Vérification d'intégrité** : les totaux se recoupent (ex : Σ par catégorie = total).

## Tests attendus
- Fonctions de transformation (entrées sales → sorties propres attendues).
- Idempotence : relancer le pipeline ne duplique pas les données.
- Robustesse : une interruption au chargement ne laisse pas la base à moitié remplie.

## README attendu
Description · les **3 questions** · source de données (lien) · install · **une commande pour tout lancer** · rapport de qualité · dashboard · ce que j'ai appris.

## Démo attendue
Vidéo 2 min : lancer le pipeline de zéro, montrer le rapport de qualité, ouvrir le dashboard et répondre aux 3 questions.

## ADR n°4 (à écrire)
**« SQLite vs PostgreSQL pour DataPulse »** — à quel signal (volume, concurrence, déploiement) migrer, et ce qui changerait dans le code.

## Erreurs à éviter
- Choisir une source trop propre (aucun apprentissage) ou trop chaotique (blocage).
- Dashboard sans question directrice.
- Nettoyage silencieux non documenté.
- Pipeline non rejouable (duplication à chaque lancement).

## Extensions possibles (FUTURE.md)
Orchestration planifiée (cron), incrémental (ne charger que le nouveau), alertes qualité, plusieurs sources jointes, déploiement du dashboard.
