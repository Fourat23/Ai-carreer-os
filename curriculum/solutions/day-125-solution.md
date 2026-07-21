# Correction — Jour 125 : Python : environnements et outils

[← Retour au jour 125](../days/day-125.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : un venv et un pip install. Solution améliorée : les trois piliers — venv isolé, dépendances FIGÉES avec versions (requirements.txt/pyproject.toml), linter + formateur (ruff/black) configurés — plus une structure claire (code/tests séparés), un `.gitignore` qui exclut le venv, et 5 conventions documentées. La preuve de reproductibilité : un tiers clone, `pip install -r requirements.txt`, et le projet tourne à l'identique.

## ⚠️ Erreurs probables et points à vérifier
- Installer globalement sans venv : conflits de versions entre projets, « ça marche sur ma machine ».
- Ne pas figer les versions (requirements sans numéros) : l'installation n'est pas reproductible.
- Committer le dossier `.venv/` : des milliers de fichiers inutiles dans le repo — l'exclure via `.gitignore`.
- Compter sur la discipline manuelle pour le style au lieu d'un formateur : incohérences et débats stériles.

## 🔍 Comment vérifier ta solution
- Un venv isole les dépendances du projet.
- Les dépendances sont figées avec versions (requirements.txt/pyproject.toml).
- Un linter et un formateur (ruff/black) sont configurés.
- Le `.gitignore` exclut le venv (jamais commité).
- 5 conventions sont documentées et la structure sépare code et tests.

## 🎤 À savoir expliquer à l'oral
Structure ta réponse en trois piliers : isolation (venv), figeage (requirements/pyproject), style automatique (ruff/black). Explique le POURQUOI de chacun (Python installe globalement ; installation reproductible ; style non négociable). Mentionne que le venv ne se commite jamais. « Un collègue clone et lance à l'identique » est le critère qui prouve que tu vises la reproductibilité, pas juste « ça tourne ».
