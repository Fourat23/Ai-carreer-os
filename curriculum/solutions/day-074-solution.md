# Correction — Jour 74 : Documentation technique : écrire pour être compris

[← Retour au jour 74](../days/day-074.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Documenter pour un lecteur précis, avec la bonne hiérarchie : README (entrée, testé sur clone frais), docstrings/JSDoc (contrat des fonctions publiques : params, retour, erreurs), ADR (pourquoi des décisions), diagramme simple et à jour (vue d'ensemble). Documenter le POURQUOI et le contrat, pas le QUOI que le code montre déjà. La preuve : un inconnu comprend le projet et utilise les fonctions publiques via leur contrat, sans lire l'implémentation.

## ✅ Une solution simple
Un README refait, quelques commentaires et un schéma. Le projet est documenté.

## 🚀 Une solution améliorée
Refondre et TESTER le README sur un clone frais, écrire des docstrings/JSDoc qui documentent le CONTRAT complet des fonctions publiques (params, retour, erreurs), un ADR complet, et un diagramme d'architecture simple et JUSTE (Mermaid ou papier). Documenter le pourquoi et le contrat, pas la paraphrase du code. Faire relire à voix haute.

## ⚠️ Erreurs probables et points à vérifier
- Documenter ce que fait le code (visible) au lieu du pourquoi et du contrat (invisibles) : bruit qui se périme.
- README générique qui pourrait décrire n'importe quel projet, écrit sans lecteur cible.
- Diagramme complexe et périmé qui trompe : mieux vaut un schéma simple et à jour, ou pas de diagramme.
- Docstrings qui paraphrasent la signature sans dire les erreurs possibles ni l'intention.

## 🔍 Comment vérifier ta solution
- README refondu et TESTÉ (instructions suivies sur clone frais).
- Docstrings sur les fonctions publiques clés (contrat complet : params, retour, erreurs).
- Un diagramme d'architecture simple et juste (Mermaid ou photo de papier).
- Un inconnu comprend le projet en quelques minutes de lecture.

## ❓ Réponses du mini-quiz
1. **Pourquoi documenter pour un lecteur PRÉCIS plutôt qu'« en général » ?**
   → Une doc générale ne sert personne (trop technique pour le recruteur, trop superficielle pour le contributeur). Identifier le lecteur (qui, quoi, dans quel ordre) permet d'écrire ce qui l'aide réellement.
2. **Que documente une docstring/un JSDoc de fonction publique ?**
   → Son CONTRAT : ce qu'elle attend (paramètres), ce qu'elle retourne, et les erreurs qu'elle peut lever — pour qu'on l'utilise sans lire son implémentation.
3. **Quelle est la hiérarchie de la documentation d'un projet ?**
   → README (porte d'entrée), docstrings/JSDoc (contrat des fonctions publiques), ADR (pourquoi des décisions), diagramme (vue d'ensemble). Chacun pour un besoin et un lecteur.
4. **Pourquoi « un diagramme simple et à jour vaut mieux que dix complexes et périmés » ?**
   → Un diagramme périmé ou faux TROMPE le lecteur — pire que pas de diagramme. Un schéma simple et juste montre l'essentiel (composants et relations) et reste maintenable.

## 🎤 À savoir expliquer à l'oral
Pose le principe : « je documente pour un lecteur précis, dans son ordre de questions ; le recruteur, le collègue et le futur moi ne cherchent pas la même chose ». Décris la hiérarchie (README / docstrings-contrat / ADR / diagramme) et la règle « pourquoi et contrat, pas paraphrase du code ». Insister sur « je teste ma doc sur un clone frais » et « un diagramme périmé ment » montre que tu penses au lecteur et à la maintenance, la marque d'une vraie compétence de communication.
