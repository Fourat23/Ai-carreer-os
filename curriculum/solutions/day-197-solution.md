# Correction — Jour 197 : Fonctionnement des LLM

[← Retour au jour 197](../days/day-197.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
La note tient en trois lois démontrées par tes expériences : (1) la fenêtre de contexte est la seule mémoire, (2) le system prompt conditionne toutes les continuations, (3) le modèle optimise la plausibilité, pas la vérité. Chaque loi cite l'expérience qui la prouve.

## ⚠️ Erreurs probables et points à vérifier
- Écrire la note depuis des articles sans faire les manipulations : les phrases seront justes mais tu ne sauras pas les DÉFENDRE.
- Confondre « le modèle a été entraîné sur X » et « le modèle a accès à X » : l'entraînement laisse des régularités statistiques, pas une base consultable.
- Croire que les gros contextes règlent tout : l'information noyée au milieu d'un long contexte est moins bien utilisée (« lost in the middle »).

## 🔍 Comment vérifier ta solution
- Chaque affirmation de la note est adossée à une expérience que tu as faite.
- Tu sais répondre à « pourquoi il ne se souvient pas ? » en une phrase.
- La note explique la différence entre plausible et vrai avec TON exemple.

## 🎤 À savoir expliquer à l'oral
Entraîne-toi à l'explication en 60 secondes : « un LLM continue du texte, token par token ; sa seule mémoire est le contexte de l'appel ; il optimise la plausibilité — donc trois règles d'ingénierie... ». C'est la question d'ouverture de la moitié des entretiens IA.
