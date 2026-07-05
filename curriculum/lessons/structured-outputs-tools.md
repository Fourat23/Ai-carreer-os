<!-- keep -->
# Leçon — Sorties structurées et function calling

## 🎯 Objectif
Savoir obtenir d'un LLM des sorties EXPLOITABLE par du code (JSON validé), et lui faire APPELER des outils (function calling) de façon robuste. C'est ce qui transforme un LLM « qui cause » en composant applicatif fiable.

## 🧠 Modèle mental
Un LLM seul produit du texte. **Les sorties structurées le rendent programmable** (le code peut agir dessus), et **le function calling lui donne des mains** (il DEMANDE une action, ton code l'EXÉCUTE). Le modèle propose ; ton code dispose et contrôle.

## 📖 Explication complète
**Sorties structurées** : on impose un schéma (JSON) et on VALIDE côté code. Le modèle est faillible : parfois il ajoute du texte autour, oublie un champ, invente un type. Donc : parser dans un try/catch, valider contre le schéma, et sur échec, RETRY en renvoyant l'erreur au modèle. Ne jamais faire confiance à la sortie brute.
**Function calling / tool use** : on DÉCLARE au modèle des outils (nom, description, paramètres typés). Le modèle, au lieu de répondre, peut renvoyer « appelle `get_weather(ville="Paris")` ». Point crucial : **ce n'est pas le modèle qui exécute** — c'est TON code qui reçoit la demande, exécute la fonction, et renvoie le résultat au modèle, qui poursuit. Tu gardes le contrôle (validation des arguments, moindre privilège, timeout).
La qualité des descriptions d'outils détermine leur bon usage : c'est de la conception d'API dont le consommateur est un LLM.

## 🔧 Exemple simple
Structuré : imposer `{"sentiment":"positif|neutre|négatif"}` et valider que la valeur est dans l'ensemble. Outil : déclarer `chercher_doc(query: string)` que le modèle peut appeler.

## 🧭 Exemple guidé
**Énoncé** : boucle de function calling pour un outil `calculer(expression)`.
**Raisonnement** : appeler le modèle ; s'il demande l'outil, l'exécuter, renvoyer le résultat, rappeler ; sinon, c'est la réponse finale.
**Solution (pseudo)** :
```
messages = [question]
boucle (max 5 fois):
    r = LLM(messages, outils=[calculer])
    si r est un appel d'outil:
        res = calculer(r.args.expression)   # MON code exécute
        messages += [r, res]
    sinon:
        retourner r.texte
```
**Explication** : le budget d'itérations évite les boucles infinies ; c'est mon code qui exécute et valide. **Variante** : gère le cas où l'outil échoue (renvoyer l'erreur au modèle).

## 🤖 Exemple appliqué (IA / data / architecture)
Extracteur de factures : le LLM renvoie `{fournisseur, montant, date}` en JSON validé (structured output). Assistant documentaire : le LLM appelle un outil `rechercher(query)` sur ta base (function calling), ton code exécute la recherche et lui renvoie les extraits. Ces deux patterns sont la base des apps LLM et des agents.

## ⚠️ Erreurs fréquentes
- Faire confiance à la sortie sans parser/valider.
- Croire que le modèle exécute les outils (c'est ton code).
- Descriptions d'outils vagues → le modèle les utilise mal.
- Pas de budget d'itérations sur la boucle d'outils.

## 🚫 Anti-patterns
- Donner un outil trop puissant (« exécute du shell ») sans garde-fous.
- Mettre la logique de contrôle dans le prompt au lieu du code.

## ✍️ Mini-exercice
Écris un prompt + une validation de code qui garantit une sortie `{"note": 1..5}` et rejette/retente toute sortie non conforme.

## 🔥 Exercice plus difficile
Implémente un mini-assistant à 2 outils (une recherche mockée + un calcul) avec la boucle complète, un budget d'itérations, et la gestion d'un outil qui échoue.

## ✅ Correction attendue
La logique : structurer = imposer un schéma + valider + retry ; outiller = déclarer, laisser le modèle DEMANDER, exécuter côté code, renvoyer, boucler avec budget. Vérifie : sortie non-JSON gérée, argument d'outil invalide rejeté, boucle bornée, outil en échec renvoyé proprement au modèle.

## 🎤 Questions d'entretien
- « Qui exécute les outils, le modèle ou ton code ? » → Ton code ; le modèle ne fait que demander.
- « Pourquoi “réponds en JSON” ne suffit pas ? » → Il faut valider et retry côté code.
- « Comment rends-tu le function calling sûr ? » → Validation des arguments, moindre privilège, timeout, budget.

## 🧾 À retenir
- Sortie structurée = schéma + validation + retry (jamais de confiance aveugle).
- Function calling : le modèle demande, TON code exécute et contrôle.
- Décrire les outils précisément = de la conception d'API pour un LLM.

## 📚 Vocabulaire
**structured output** · **schéma / validation** · **retry** · **function calling / tool use** · **argument** · **budget d'itérations** · **moindre privilège**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je valide toujours une sortie LLM contre un schéma avec retry.
- [ ] Je sais implémenter une boucle de function calling robuste et bornée.
- [ ] Je sécurise les outils (validation, moindre privilège).

## 🔗 Liens avec le programme
Mois 8 et 10 (jours ~215-225, agents), projet final. Leçons liées : `prompt-engineering`, `llm-fundamentals`, `agents-fundamentals`.
