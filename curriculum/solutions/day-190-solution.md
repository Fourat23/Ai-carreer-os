# Correction — Jour 190 : NLP : tokenisation

[← Retour au jour 190](../days/day-190.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
La manipulation directe (encoder/décoder morceau par morceau) construit l'intuition qu'aucune lecture ne donne : les espaces collés, la granularité variable, l'écart français/anglais. Ton ratio tokens/mots personnel est le livrable durable.

## ⚠️ Erreurs probables et points à vérifier
- Croire 1 token = 1 mot (faux : ~0.75 mot en anglais, moins en français).
- Oublier que la SORTIE se paie aussi en tokens.
- Comparer des tokenizers différents comme s'ils étaient interchangeables (chaque famille de modèles a le sien).

## 🔍 Comment vérifier ta solution
- Tableau : 4 textes × (nb tokens, morceaux surprenants).
- Ratio tokens/mots calculé sur TES prompts (~1.3-2 en français).
- " chat" et "chat" donnent des ids différents — vérifié et compris.

## 🎤 À savoir expliquer à l'oral
Montre UN exemple de découpage surprenant et déroule ses trois conséquences : coût, fenêtre, comportements étranges. Concret, mémorable, trois phrases.
