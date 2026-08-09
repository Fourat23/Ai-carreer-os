<!-- keep -->
# Leçon — Storytelling technique (raconter ses projets)

## 🌍 Le problème d'abord
En entretien, on te demande de parler d'un projet. Tu réponds : « j'ai fait une application avec React et une base de données ». Silence poli. Le recruteur n'a rien retenu, rien appris de ta façon de penser. Le problème : tu as décrit CE QUE tu as tapé, pas COMMENT tu as décidé. Un projet qu'on ne sait pas raconter n'existe pas aux yeux d'un employeur. Un bon récit technique montre un problème, des décisions arbitrées sous contraintes, des résultats chiffrés et des apprentissages — la « façon de penser » que le recruteur achète réellement. Cette leçon t'apprend à transformer ton travail en récit qui convertit en entretiens.

## 🎯 Objectif
Savoir transformer un projet technique en un RÉCIT qui convainc un recruteur : problème, décisions, résultats chiffrés, apprentissages. Un projet qu'on ne sait pas raconter n'existe pas pour un employeur — c'est LA compétence qui convertit ton travail en offres d'entretien.

## 🧩 Prérequis
Tu dois avoir mené un projet technique avec de vraies décisions (`/doc/lessons/portfolio-github`) et savoir en tirer des résultats mesurables (avant/après, chiffres). Les bases de la communication technique — adapter son propos à l'auditoire (`/doc/lessons/technical-documentation`) — aident. Aucune aisance orale préalable n'est supposée : le récit se prépare et se répète.

## 🧠 Modèle mental
Un recruteur n'achète pas des features, il achète une **façon de penser**. Raconter un projet, c'est montrer comment tu DÉCIDES sous contraintes — pas réciter ce que tu as tapé. « J'ai fait un CRUD » n'intéresse personne ; « j'ai arbitré X vs Y pour telle raison, et voici le résultat mesuré » recrute.

## 📖 Explication complète
La structure **STAR** organise n'importe quel récit de projet :
- **Situation** : le problème, et pour QUI (le contexte donne du sens).
- **Tâche** : ce qu'il fallait accomplir, les contraintes.
- **Action** : tes DÉCISIONS clés et leurs trade-offs (c'est là que tes ADRs brillent). Le cœur du récit.
- **Résultat** : chiffré et démontrable (« fidélité +18 % », « 40 questions d'éval », « temps de réponse < 2 s »).
On y ajoute l'**apprentissage** : un vrai obstacle rencontré et comment tu l'as résolu — la preuve vivante de ta valeur.
Trois formats à préparer : 30 s (accroche), 90 s (standard), 3-5 min (détaillé avec schéma). Et un README qui raconte la même chose par écrit (problème → démo → chiffres → archi → install). Les CHIFFRES et les DÉCISIONS sont le signal ; « motivé et passionné » est du bruit.

## 🔧 Exemple simple
Faible : « J'ai créé un chatbot RAG. »
Fort : « J'ai construit un assistant Q&R sur des docs techniques ; en ajoutant un reranking mesuré sur un golden set de 40 questions, la fidélité est passée de 72 % à 90 %. »

## 🧭 Exemple guidé
**Énoncé** : pitcher DocSense en 90 secondes.
**Raisonnement** : STAR condensé, finir sur un chiffre.
**Trame** :
```
[S] Les équipes techniques perdent du temps à chercher dans leur doc.
[T] J'ai construit un assistant qui répond avec citations vérifiables.
[A] Décisions clés : chunking par structure (mesuré meilleur que taille fixe),
    retrieval hybride + reranking, et une éval automatisée dès le début.
[R] 40 questions de golden set, fidélité 90 %, réponses en < 2 s, refus quand
    l'info manque. Livré en `docker compose up`.
```
**Explication** : chaque phrase porte une décision ou un chiffre, zéro remplissage. **Variante** : la version 30 s = juste [S] + [R].

## 🤖 Exemple appliqué (IA / data / architecture)
Pour un poste IA, les chiffres d'ÉVALUATION sont ton meilleur argument : ils prouvent que tu sais mesurer, pas seulement brancher une API. « Comment sais-tu que ton système marche ? » se répond par un tableau avant/après — c'est le différenciateur n°1 face aux autres juniors.

## ⚠️ Erreurs fréquentes
- Raconter les features (QUOI) au lieu des décisions (POURQUOI).
- Aucun chiffre (« ça marche bien »).
- Survendre (« architecture révolutionnaire ») au lieu d'être précis et honnête.
- Prétendre que « tout s'est bien passé » (aucun obstacle = aucune histoire).

## 🚫 Anti-patterns
- Le jargon pour impressionner sans rien clarifier.
- Le monologue de 10 minutes sans structure.

## ✍️ Mini-exercice
Écris la version 90 s d'un de tes projets en STAR, en finissant par un chiffre. Lis-la à voix haute et chronomètre.

## 🔥 Exercice plus difficile
Prépare les 3 formats (30 s / 90 s / 3 min) d'un projet, enregistre-toi, réécoute, et supprime chaque phrase qui n'apporte ni décision ni chiffre.

## ✅ Correction attendue
La logique : STAR + apprentissage + chiffres. Vérifie que chaque phrase de ton pitch porte une DÉCISION ou un RÉSULTAT mesuré ; qu'un non-technicien comprend le problème ; que tu cites un vrai obstacle. Si tu peux retirer une phrase sans rien perdre, retire-la.

## 🎤 Questions d'entretien
- « Parle-moi d'un de tes projets. » → STAR : problème/pour qui → décisions et trade-offs → résultats chiffrés → apprentissage.
- « Quelle a été la difficulté la plus dure ? » → Un vrai obstacle + ta démarche de résolution.
- « Pourquoi ce choix technique ? » → Répondre en trade-offs (ADR), pas en dogme.

## 🧾 À retenir
- On recrute une façon de PENSER : raconte tes décisions, pas tes features.
- Les chiffres et les trade-offs sont le signal ; les adjectifs sont du bruit.
- Prépare 30 s / 90 s / 3 min, et un README qui raconte pareil.

## 📚 Vocabulaire
**STAR** · **trade-off / ADR** · **pitch** · **résultat chiffré** · **portfolio** · **apprentissage** · **README** · **honnêteté (limites)**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je peux pitcher chaque projet en 90 s avec un chiffre.
- [ ] Je raconte mes décisions et trade-offs, pas la liste des features.
- [ ] J'ai un obstacle réel et son apprentissage prêts pour chaque projet.

## 🔗 Liens avec le programme
Mois 12 (jours ~340-360), tous les projets. Leçons liées : `readme-documentation`, `interview-preparation`, `system-design-interview`.
