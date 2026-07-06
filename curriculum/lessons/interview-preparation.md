<!-- keep -->
# Leçon — Préparation à l'entretien IA

## 🎯 Objectif
Aborder les 4 types d'entretien d'un poste IA junior (technique, projet, design système, comportemental) avec une préparation SYSTÉMATIQUE : fiches, simulations enregistrées, grilles d'auto-évaluation. L'entretien est une compétence qui s'entraîne — pas un test de personnalité.

## 🧠 Modèle mental
Un entretien est **une démo de ta façon de penser, en conditions de stress**. Le stress se réduit par la RÉPÉTITION (simulations), et la pensée se montre en la VERBALISANT. Le candidat calme et structuré a simplement plus répété — c'est accessible à tous.

## 📖 Explication complète
- **Technique (algo/code)** : le recruteur note la DÉMARCHE plus que la solution : reformuler, poser des exemples, énoncer le plan, coder en verbalisant, tester les cas limites, donner la complexité. Le silence est l'erreur n°1. S'entraîne par katas À VOIX HAUTE, enregistrés, 25 min chrono.
- **Projet (portfolio)** : STAR + décisions + chiffres (leçon storytelling). Prépare pour CHAQUE projet : le pitch 90 s, deux décisions défendables (ADRs), un obstacle réel résolu, les limites. Le schéma « spécial entretien » de DocSense (une slide, 5 questions que tu maîtrises) ORIENTE la discussion vers tes forces.
- **Design système** : la méthode en 4 étapes (leçon system-design-interview) — clarifier, composants/flux, trade-offs, échelle/pannes.
- **Comportemental** : banque de 6-8 histoires STAR réutilisables (échec, conflit, décision difficile, apprentissage rapide, fierté). « Parle-moi de toi » en 90 s, appris puis naturalisé. Et 3 questions À POSER (équipe, process d'éval des systèmes IA, première mission).
- **Spécifique IA** : les ~20 questions récurrentes (tokens, hallucinations, RAG, debug retrieval/génération, éval, injection, coûts, agent vs workflow — les questions d'entretien de chaque leçon IA de ce programme en sont la banque). Ta botte secrète : répondre avec TON vécu (« sur mon projet, le reranking a gagné 6 points de fidélité ») — imbattable face aux réponses théoriques.
- **Les deux réflexes qui rassurent** : « je ne sais pas, voici comment je chercherais » (honnêteté structurée > bluff), et clarifier avant de foncer.
- **Logistique** : simulations complètes enregistrées + auto-évaluées à la grille (rubrics/interview-evaluation.md) ; post-mortem après chaque vrai entretien (questions notées → fiches mises à jour) : chaque entretien améliore le suivant.

## 🔧 Exemple simple
Question : « Pourquoi un LLM hallucine ? » Réponse structurée : mécanisme (il prédit le plausible, pas le vrai) → conséquence (confiance ≠ vérité) → remède que TU as implémenté (RAG + citations vérifiées + refus).

## 🧭 Exemple guidé
**Énoncé** : préparer « Parle-moi d'un problème difficile que tu as résolu ».
**Raisonnement** : choisir une histoire TECHNIQUE avec démarche visible et résultat chiffré.
**Solution (trame)** :
```
[S] Mon RAG répondait faux sur 30 % des questions de mon golden set.
[T] Diagnostiquer et corriger sans casser le reste.
[A] Méthode : séparer retrieval/génération → rappel@5 à 61 % → le problème était
    le chunking (idées coupées) → test de 3 stratégies MESURÉES → structure Markdown.
[R] Rappel@5 : 61 → 84 %. Et le réflexe durable : toujours diagnostiquer par étage.
```
**Explication** : la démarche (mesurer, isoler, comparer) est le vrai héros ; le chiffre clôt. 90 secondes chrono. **Variante** : décline la même histoire en version 30 s (S+R seulement).

## 🤖 Exemple appliqué (IA / data / architecture)
Le « dossier d'entretien » de la semaine 51 assemble tout : fiches projets, schéma DocSense, réponses aux 20 questions IA, histoires STAR, questions à poser, fourchettes salariales. Relu avant chaque entretien, enrichi après. C'est un système, pas de l'improvisation.

## ⚠️ Erreurs fréquentes
- Coder en silence (le recruteur ne peut pas noter une pensée invisible).
- Réponses théoriques récitées sans vécu personnel.
- Bluffer sur une question inconnue (détecté, disqualifiant).
- Zéro question à poser (signal de désintérêt).
- Ne jamais simuler en conditions réelles avant le premier vrai entretien.

## 🚫 Anti-patterns
- Réviser encore la veille au soir au lieu de dormir.
- Mémoriser 100 solutions d'algo au lieu de 10 patterns + la méthode.

## ✍️ Mini-exercice
Choisis 5 questions IA (une par leçon IA de ce programme), écris ta réponse en 3 phrases chacune : mécanisme → conséquence → ton vécu.

## 🔥 Exercice plus difficile
Simulation complète enregistrée (60 min : 1 algo à voix haute + pitch projet + 3 questions IA), auto-évaluée avec la grille. Note tes 3 axes d'amélioration et refais dans une semaine.

## ✅ Correction attendue
La logique : préparation par TYPE d'entretien, banque d'histoires et de réponses ancrées dans ton vécu, simulations enregistrées, post-mortems. Vérifie : tu verbalises en codant (réécoute-toi), chaque réponse IA cite ton expérience, ta grille montre une progression entre deux simulations.

## 🎤 Questions d'entretien
- « Parle-moi de toi. » → 90 s orientés cible : d'où tu viens, ce que tu as CONSTRUIT (chiffres), ce que tu cherches.
- « Une question difficile dont tu ne connais pas la réponse. » → « Je ne sais pas, voici comment je chercherais » + raisonnement à voix haute.
- « As-tu des questions ? » → Toujours : équipe, comment ils évaluent leurs systèmes IA, première mission.

## 🧾 À retenir
- 4 entretiens, 4 préparations spécifiques — et des simulations ENREGISTRÉES.
- Réponds avec ton vécu chiffré : imbattable face à la théorie récitée.
- « Je ne sais pas + méthode » bat le bluff ; verbalise toujours ta pensée.

## 📚 Vocabulaire
**screening** · **STAR** · **pitch 30/90 s** · **simulation / mock interview** · **post-mortem d'entretien** · **banque d'histoires** · **grille d'évaluation** · **questions inversées**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] J'ai un dossier d'entretien complet (fiches, réponses, histoires, questions).
- [ ] J'ai fait ≥ 2 simulations enregistrées avec grille ≥ 3,5/5.
- [ ] Chaque réponse IA s'appuie sur mon vécu de projet.

## 🔗 Liens avec le programme
Mois 12 (jours ~351-362), simulations mensuelles dès le mois 1. Leçons liées : `technical-storytelling`, `system-design-interview`, `rag-evaluation`, toutes les leçons IA (leurs sections 🎤).
