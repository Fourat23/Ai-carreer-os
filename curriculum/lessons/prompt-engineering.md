<!-- keep -->
# Leçon — Prompt engineering (sérieux)

## 🌍 Le problème d'abord
Tu essaies un LLM : tu tapes une phrase, ça répond, magie. Puis tu veux t'en servir DANS un
programme — extraire un montant, classer un ticket, alimenter un RAG — et là, la magie devient
un cauchemar : la même demande donne parfois un JSON propre, parfois un paragraphe poli avec le
JSON noyé dedans, parfois un champ inventé. Le réflexe « j'ajoute “réponds en JSON” » ne règle
rien : il réduit la fréquence des erreurs, il ne les supprime pas. Le problème n'est pas de
trouver la formule magique ; c'est de traiter le prompt comme une SPÉCIFICATION (rôle,
contraintes, format, exemples) dont le résultat est ensuite VÉRIFIÉ par ton code. Cette leçon te
sort de la chasse aux astuces pour entrer dans une discipline d'ingénierie : spécifier, tester,
mesurer, versionner.

## 🎯 Objectif
Comprendre qu'un prompt est une **spécification**, pas une incantation ; savoir écrire des prompts robustes, versionnés et **validés par le code** ; et savoir pourquoi « ajoute “réponds en JSON” » ne suffit jamais en production. Utile dès que tu intègres un LLM dans une application (extraction, classification, RAG, agents).

## 🧠 Modèle mental
Un prompt, c'est **le cahier des charges que tu donnes à un exécutant très rapide, très cultivé, mais distrait et non déterministe**. Tu ne le supplies pas : tu le spécifies (rôle, contraintes, format, exemples), puis tu VÉRIFIES son travail.

## 🧩 Prérequis
Tu dois comprendre ce qu'est un LLM et son non-déterminisme — pourquoi la même entrée peut
donner deux sorties (`/doc/lessons/llm-fundamentals`) — et savoir parser/valider des données
aux frontières d'un programme, gérer un échec proprement (`/doc/lessons/error-handling`). Les
notions de sortie structurée et de retry sont formalisées juste après
(`/doc/lessons/structured-outputs-tools`) ; l'évaluation d'un prompt par un jeu de cas mesuré
s'appuie sur (`/doc/lessons/ai-evaluation`). Sans l'idée de non-déterminisme, « valider la
sortie » paraît superflu — c'est pourtant tout l'enjeu.

## 📖 Explication complète
Un prompt efficace combine quelques éléments :
- **Rôle et tâche** clairs : « Tu es un extracteur d'informations. Extrais X, Y, Z. »
- **Contraintes explicites** : ce qu'il faut faire ET ne pas faire, le format de sortie, quoi faire en cas de doute (« si absent, mets null »).
- **Exemples (few-shot)** : montrer 1-3 cas résolus vaut mieux que dix phrases d'explication — surtout pour un format précis ou une nuance.
- **Format de sortie imposé ET validé** : demander du JSON ne garantit rien ; ton CODE doit parser, valider contre un schéma, et gérer l'échec (retry avec le message d'erreur).
- **Versionner** : un prompt est du code. Il vit dans un fichier, il a des cas de test, il évolue avec des mesures.

Le prompt engineering « sérieux » n'est pas une collection d'astuces magiques (« je vais te donner 100 $ ») mais une **discipline d'ingénierie** : spécifier, tester, mesurer, itérer.

**Le message système et le message utilisateur ne sont pas la même chose**, et le vocabulaire de cette leçon le mentionne sans l'expliquer. Une conversation est une SUITE de messages étiquetés par leur rôle : *system* porte les instructions durables que tu écris, toi, développeur ; *user* porte ce que la personne tape ; *assistant* porte les réponses précédentes. Deux conséquences pratiques. La consigne stable (« tu extrais des informations, tu réponds en JSON, tu mets `null` si absent ») va dans le système, où elle n'a pas à être répétée à chaque tour. Et surtout, **le modèle accorde plus de poids au système sans pour autant le rendre inviolable** : c'est une priorité, pas une barrière. Une instruction de sécurité placée dans le système reste contournable par un texte utilisateur suffisamment insistant — d'où le fait que la sécurité ne se joue jamais dans le prompt seul.

**Laisser au modèle la place de raisonner.** Demander « donne la réponse » sur un problème à plusieurs étapes force le modèle à tout produire d'un coup ; demander de dérouler les étapes avant de conclure améliore nettement les tâches de raisonnement. La raison n'a rien de mystique : un modèle produit un jeton à la fois, chaque jeton produit devient une entrée pour le suivant, et les étapes intermédiaires sont **l'endroit où le calcul se fait**. Sans elles, il n'y a pas d'espace pour calculer — seulement pour deviner.

Deux conséquences opérationnelles qu'on oublie souvent : ce raisonnement coûte des jetons de sortie, donc de l'argent et de la latence ; et il ne doit pas être montré à l'utilisateur ni mélangé aux données. En pratique on le range dans un champ dédié (`{"raisonnement": "...", "resultat": {...}}`) et le code ne lit que `resultat`.

**Ce qui change vraiment un taux de réussite, dans l'ordre.** Sur les prompts qui échouent, la cause est presque toujours l'une de celles-ci, et rarement la formulation :
1. **La tâche est ambiguë** — deux lectures possibles de la consigne, et le modèle choisit la mauvaise une fois sur trois. Un exemple résolu lève l'ambiguïté mieux qu'un paragraphe d'explication.
2. **Le cas limite n'est pas spécifié** : que faire si le champ est absent, si le document est vide, si la question sort du sujet ? Non dit, le modèle improvise — et improvise différemment à chaque appel.
3. **La sortie n'est pas contrainte**, donc elle varie de forme même quand le fond est juste.
4. **Le contexte est trop long ou mal ordonné**, et l'information utile se noie.

Reformuler poliment, promettre une récompense ou insister en majuscules n'apparaît nulle part dans cette liste. C'est ce qui sépare la discipline de la superstition : **on ne peut pas savoir si un prompt s'est amélioré sans un jeu de cas et un taux mesuré**, et beaucoup d'astuces populaires ne survivent pas à cette mesure.

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
