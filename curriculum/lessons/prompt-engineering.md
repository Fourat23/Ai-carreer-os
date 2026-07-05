<!-- keep -->
# Leçon — Prompt engineering (sérieux)

## 🎯 Objectif
Comprendre qu'un prompt est une **spécification**, pas une incantation ; savoir écrire des prompts robustes, versionnés et **validés par le code** ; et savoir pourquoi « ajoute “réponds en JSON” » ne suffit jamais en production. Utile dès que tu intègres un LLM dans une application (extraction, classification, RAG, agents).

## 🧠 Modèle mental
Un prompt, c'est **le cahier des charges que tu donnes à un exécutant très rapide, très cultivé, mais distrait et non déterministe**. Tu ne le supplies pas : tu le spécifies (rôle, contraintes, format, exemples), puis tu VÉRIFIES son travail.

## 📖 Explication complète
Un prompt efficace combine quelques éléments :
- **Rôle et tâche** clairs : « Tu es un extracteur d'informations. Extrais X, Y, Z. »
- **Contraintes explicites** : ce qu'il faut faire ET ne pas faire, le format de sortie, quoi faire en cas de doute (« si absent, mets null »).
- **Exemples (few-shot)** : montrer 1-3 cas résolus vaut mieux que dix phrases d'explication — surtout pour un format précis ou une nuance.
- **Format de sortie imposé ET validé** : demander du JSON ne garantit rien ; ton CODE doit parser, valider contre un schéma, et gérer l'échec (retry avec le message d'erreur).
- **Versionner** : un prompt est du code. Il vit dans un fichier, il a des cas de test, il évolue avec des mesures.

Le prompt engineering « sérieux » n'est pas une collection d'astuces magiques (« je vais te donner 100 $ ») mais une **discipline d'ingénierie** : spécifier, tester, mesurer, itérer.

## 🔧 Exemple simple
Faible : `"Résume ce texte."`
Fort : `"Résume le texte ci-dessous en 3 puces factuelles, sans opinion, en français. Si le texte est vide, réponds exactement: AUCUN CONTENU."`

## 🧭 Exemple guidé
**Énoncé** : extraire `{ nom, email, montant }` d'un texte libre, en JSON strict.
**Raisonnement** : je spécifie le schéma, je donne un exemple, je prévois les absents, et je valide côté code.
**Prompt** :
```
Tu extrais des informations. Réponds UNIQUEMENT par un JSON de la forme
{"nom": string|null, "email": string|null, "montant": number|null}.
Si un champ est absent, mets null. Aucune autre sortie.
Exemple: "Facture de Lina (lina@x.com) : 240€" -> {"nom":"Lina","email":"lina@x.com","montant":240}
Texte: "..."
```
**Côté code** : `JSON.parse` dans un try/catch → si échec, on relance UNE fois en ajoutant « ta réponse précédente n'était pas un JSON valide ». **Variante** : ajouter un champ `devise` et le rendre obligatoire.

## 🤖 Exemple appliqué (IA / data / architecture)
Dans un RAG, le prompt de génération impose : « réponds UNIQUEMENT à partir des extraits fournis, cite les sources [id], et si l'information n'y est pas, dis-le ». Ce prompt + la validation des citations = ta première ligne de défense contre l'hallucination.

## ⚠️ Erreurs fréquentes
- Croire que « réponds en JSON » suffit (il faut valider).
- Prompts en dur, éparpillés, non versionnés, non testés.
- Prompts vagues (« sois précis ») au lieu de contraintes vérifiables.
- Empiler des instructions contradictoires.

## 🚫 Anti-patterns
- Le « prompt magique » copié sans comprendre.
- Optimiser un prompt au feeling sur 2-3 exemples (biais).
- Mettre toute la logique dans le prompt au lieu du code (parsing, contrôle, boucles).

## ✍️ Mini-exercice
Écris un prompt de classification (texte → une catégorie parmi 4) qui refuse (« INCERTAIN ») si la confiance est faible, et teste-le sur 10 exemples dont 2 ambigus.

## 🔥 Exercice plus difficile
Construis un mini banc d'essai : 15 cas (dont pièges), un script qui appelle le LLM, valide la sortie, et affiche un taux de réussite. Améliore le prompt jusqu'à > 90 %, en notant chaque version.

## ✅ Correction attendue
La logique : spécifier → exemple → format validé → retry sur échec → mesurer. La solution robuste sépare le PROMPT (fichier versionné) de la LOGIQUE (parse, validation, retry, log). Vérifie : que se passe-t-il sur une entrée vide, une entrée piège, une sortie non-JSON ? Chaque cas doit être géré, pas planté.

## 🎤 Questions d'entretien
- « Pourquoi “réponds en JSON” ne suffit-il pas ? » → Le LLM est non déterministe ; il faut parser + valider + retry côté code.
- « Quand le few-shot aide-t-il vraiment ? » → Pour un format précis ou une nuance difficile à décrire ; inutile si la tâche est déjà claire.
- « Comment testes-tu un prompt ? » → Un jeu de cas (dont pièges), un taux de réussite mesuré, versionner et comparer.

## 🧾 À retenir
- Un prompt est une spécification, pas une incantation.
- Le format de sortie se VALIDE dans le code, jamais on ne fait confiance.
- Versionner et tester les prompts comme du code.

## 📚 Vocabulaire
**few-shot** · **zero-shot** · **system prompt** · **structured output** · **schéma** · **retry** · **banc d'essai (eval set)** · **température**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Mes prompts sont dans des fichiers versionnés avec des cas de test.
- [ ] Je valide toujours la sortie côté code (schéma + retry).
- [ ] Je sais mesurer le taux de réussite d'un prompt et l'améliorer par la mesure.
- [ ] Je réponds aux questions d'entretien ci-dessus.

## 🔗 Liens avec le programme
Mois 8 (jours ~211-230), projet 6 (DocQA) et projet final (DocSense). Leçon liée : `llm-fundamentals`, `ai-evaluation`.
