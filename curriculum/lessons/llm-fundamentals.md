<!-- keep -->
# Leçon — LLM : comprendre les grands modèles de langage

## Pourquoi c'est important
Les LLM sont l'outil central de ton futur métier — et la différence entre un « prompteur » et un ingénieur IA tient à UNE chose : comprendre ce que le modèle FAIT réellement. Cette compréhension te permet de prédire quand il échouera, de concevoir autour de ses limites (RAG, validation, guardrails), d'en maîtriser les coûts, et de répondre aux questions d'entretien qui trient les candidats (« pourquoi les LLM hallucinent-ils ? »).

## Explication complète

### Ce qu'un LLM fait vraiment : prédire le token suivant
Un LLM est un réseau de neurones entraîné sur d'immenses corpus de texte à UNE tâche : étant donné une séquence, prédire le **token** suivant (un token ≈ un morceau de mot, ~4 caractères en anglais). Génération = prédire un token, l'ajouter à la séquence, recommencer. Tout le reste — dialogue, raisonnement apparent, code — ÉMERGE de cette mécanique entraînée à très grande échelle.

**Conséquence capitale** : le modèle produit du texte STATISTIQUEMENT PLAUSIBLE, pas du texte vrai. La vérité n'est pas dans sa fonction objectif.

### Pourquoi il hallucine (mécanisme, pas morale)
Quand la réponse exacte n'est pas fortement représentée dans ce qu'il a appris, le modèle produit quand même la suite LA PLUS PLAUSIBLE — une référence inventée mais bien formée, une API plausible mais inexistante. Il ne « ment » pas : il complète. L'hallucination n'est pas un bug à corriger mais une PROPRIÉTÉ à concevoir autour : ancrer les réponses dans des sources (RAG), exiger des citations, valider en aval, permettre le refus (« je ne sais pas »).

### Le contexte : la mémoire de travail (et rien d'autre)
Le modèle ne voit QUE la fenêtre de contexte de la requête courante : le system prompt, l'historique qu'ON lui renvoie, les documents qu'on y insère. Pas de mémoire entre les appels (c'est ton code qui renvoie l'historique), pas d'accès au monde (sauf outils). La fenêtre est bornée (des centaines de kilotokens au mieux) → « connaître 10 000 documents » exige d'en SÉLECTIONNER les extraits pertinents à chaque question : c'est la raison d'être du RAG.

### Température et non-déterminisme
À chaque étape, le modèle a une distribution de probabilités sur les tokens suivants. **Température 0** : toujours le plus probable (quasi déterministe — pour l'extraction, la classification). **Température élevée** : échantillonnage plus libre (créativité, diversité — et plus d'erreurs). Même à température 0, ne JAMAIS supposer un déterminisme parfait : ton code doit valider.

### Les coûts : des tokens, dans les deux sens
Tu paies les tokens d'ENTRÉE (prompt + contexte + documents) et de SORTIE. Un RAG qui injecte 20 chunks de 500 tokens paie 10 000 tokens d'entrée PAR question. Réflexes d'ingénieur : compter (tiktoken), estimer AVANT de lancer (n appels × tokens moyens × prix), réduire (cache, contexte plus court, modèle plus petit quand ça suffit).

### Le LLM comme composant d'ingénierie
Cinq propriétés qui dictent ton code appelant : **non-déterministe** (→ valider les sorties), **faillible** (→ retry, fallback, refus), **latent** (des secondes → streaming, async), **coûteux par appel** (→ cache, batch), **sujet à dérive** (le fournisseur met à jour le modèle → évaluations versionnées). Un LLM n'est ni une base de données, ni un moteur de règles : c'est un composant probabiliste à encadrer.

## Concepts clés
Token · fenêtre de contexte · system/user prompts · prédiction du token suivant · hallucination (mécanisme) · température, top-p · structured outputs (JSON contraint + validation côté code) · function calling (le modèle DEMANDE, ton code EXÉCUTE) · coûts entrée/sortie · streaming · dérive.

## Exemple
```
Entrée : "La capitale de la France est"
Le modèle calcule : P("Paris") = 0.92, P("une") = 0.03, ...
Température 0 → "Paris". 
Maintenant : "La capitale de la Zorbaquie est"
→ le modèle produit un nom PLAUSIBLE avec le même aplomb.
```
Même mécanique dans les deux cas — c'est exactement pourquoi la confiance apparente d'un LLM n'est PAS un signal de vérité, et pourquoi tes systèmes exigeront des sources.

## Pièges classiques
- Traiter le LLM comme une base de connaissances fiable (il est un générateur plausible).
- « Réponds en JSON » sans validation : le parse échouera un jour — schéma validé + retry, toujours.
- Ignorer les coûts jusqu'à la facture.
- Croire que le modèle « se souvient » de la conversation (c'est TON code qui renvoie l'historique).
- Confondre function calling (le modèle demande) et exécution (ton code décide et exécute).

## Lien avec l'IA / le futur
Tout ton dernier trimestre est bâti sur cette leçon : le RAG (mois 8-9) contourne la fenêtre de contexte et ancre contre l'hallucination ; l'évaluation (mois 9) mesure ce que le non-déterminisme rend incertain ; les agents (mois 10) enchaînent des prédictions faillibles — d'où budgets et garde-fous ; les coûts pilotent l'architecture de DocSense. Et les questions d'entretien IA (tokens, température, hallucinations) viennent TOUTES d'ici.

## Mini-exercice
Avec une API LLM : (1) pose 5 fois la même question à température 0 puis 1 — observe ; (2) provoque une hallucination (question précise sur un sujet inventé plausible) et explique le mécanisme ; (3) compte les tokens d'un de tes prompts et calcule le coût de 10 000 appels/jour. Trois manipulations, trois piliers du métier.

## Vocabulaire à retenir
**token** · **fenêtre de contexte** · **inférence** · **température / top-p** · **hallucination** · **system prompt** · **structured output** · **function calling / tool use** · **streaming** · **coût par token** · **dérive de modèle**.

## Résumé
Un LLM prédit le token suivant le plus plausible — c'est tout, et c'est immense. Il n'a ni vérité, ni mémoire hors contexte, ni déterminisme garanti ; il hallucine par construction et coûte à chaque token. L'ingénierie LLM consiste à bâtir autour de ces propriétés : ancrer (RAG), contraindre et valider (structured outputs), outiller (function calling), mesurer (éval), encadrer (guardrails). Comprendre la mécanique, c'est cesser de subir la magie.
