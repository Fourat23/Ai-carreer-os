# Correction / Grille — Jour 210 : Revue de la semaine 30

[← Retour au jour 210](../days/day-210.md)

> Une revue ne « se corrige » pas : elle s'ÉVALUE. Voici l'attendu, la grille et les critères de passage.

## 🎯 Attendu de la semaine
Thème : **LLM : fonctionnement, APIs, hallucinations + revue mensuelle 7**. Tu utilises enfin des LLM en sachant ce qu'il y a dedans. Appels API propres, paramètres compris, limites mesurées toi-même. Revue mensuelle 7 en fin de semaine.

## ✅ Grille d'évaluation (note chaque axe de 0 à 5)
- **Test pratique réussi** dans le temps imparti : 75 min : script (Node ou Python) qui appelle une API LLM — system prompt, température comparée (0 vs 1) sur 5 prompts, streaming, comptage de tokens et coût calculé, 3 hallucinations provoquées et documentées.
- **Test théorique** (réponds de mémoire puis auto-corrige) : Qu'est-ce qu'un LLM prédit exactement ; pourquoi il hallucine (mécanisme, pas morale) ; température/top-p ; pourquoi le même prompt donne des réponses différentes ; que contient VRAIMENT le contexte envoyé ?
- **Mini-projet / livrable** conforme : Petit banc d'essai : 10 questions dont tu connais les réponses, posées à 2 modèles, avec un tableau juste/faux/inventé et 10 lignes de conclusions.
- **Exercice d'architecture** fait sérieusement : Un LLM dans une architecture n'est PAS une base de données ni un moteur de règles. Écris 5 propriétés d'ingénierie qui le distinguent (non-déterminisme, latence, coût/appel, faillibilité, dérive) et ce que chacune impose à ton code appelant.

## 📋 Checklist de validation
- [ ] Clé API dans .env, jamais commitée
- [ ] Coût par appel calculé
- [ ] Hallucination : je peux en provoquer et l'expliquer
- [ ] Revue mensuelle 7 faite

## 🚦 Critères de passage à la semaine suivante
- [ ] Script API complet fonctionnel
- [ ] Banc d'essai documenté
- [ ] Revue mensuelle 7 complétée
- [ ] Note transformer publiée (livrable mois 7)

## ⚠️ Erreurs fréquentes en revue
- Se sur-noter (familiarité ≠ maîtrise) : ne compte que ce que tu produis SEUL et sais EXPLIQUER.
- Bâcler le test théorique en le relisant au lieu de répondre de mémoire (rappel actif).
- Avancer malgré des critères non atteints : mieux vaut consolider 2-3 jours que bâtir sur du sable.
- Oublier de mettre à jour ses scores de compétences dans l'application.

## 🧩 Auto-évaluation finale
- Note honnête de la semaine (0-5) : ____
- Ma plus grande difficulté cette semaine : ____
- Ce que je dois revoir avant d'avancer : ____
- Si des critères ne sont pas atteints : quel plan de rattrapage (daté) ?
