# Prompt — Créer une leçon de fond

Colle ceci dans un assistant IA, remplace {SUJET}, relis et CORRIGE le résultat (l'IA aide, ne décide pas).

---

Tu écris une **leçon de fond** pour une plateforme d'apprentissage destinée à un débutant qui vise un poste d'AI Engineer / LLM-RAG Engineer junior. Sujet : **{SUJET}**.

Contraintes :
- Français, ton direct, 600-1000 mots UTILES. Zéro remplissage, zéro buzzword non défini.
- Le *pourquoi* avant le *comment*. Un modèle mental clair. Des exemples concrets.
- Relie toujours au métier (IA/LLM/RAG/data/architecture) et à l'entretien.

Structure EXACTE (titres Markdown `##`), première ligne du fichier = `<!-- keep -->` :
1. `# Leçon — {Titre}`
2. `## 🎯 Objectif` (comprendre + savoir faire + pourquoi utile)
3. `## 🧠 Modèle mental`
4. `## 📖 Explication complète`
5. `## 🔧 Exemple simple`
6. `## 🧭 Exemple guidé` (énoncé → raisonnement → solution → explication → variante)
7. `## 🤖 Exemple appliqué (IA / data / architecture)`
8. `## ⚠️ Erreurs fréquentes`
9. `## 🚫 Anti-patterns`
10. `## ✍️ Mini-exercice`
11. `## 🔥 Exercice plus difficile`
12. `## ✅ Correction attendue` (logique + solution simple + améliorée + vérifications)
13. `## 🎤 Questions d'entretien` (3-6, avec l'idée de la bonne réponse)
14. `## 🧾 À retenir`
15. `## 📚 Vocabulaire`
16. `## 🟢 Checklist « quand suis-je prêt ? »`
17. `## 🔗 Liens avec le programme`

Puis rappelle-moi d'ajouter le slug dans `scripts/data/lessons-map.mjs` (`LESSONS` + `LESSON_BY_SKILL`).
