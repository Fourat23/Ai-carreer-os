# Prompt — Enrichir une journée

Colle ceci, remplace {JOUR}, {SUJET}, {COMPÉTENCE}. Relis et corrige.

---

Enrichis le **jour {JOUR}** (sujet : {SUJET}, compétence : {COMPÉTENCE}) d'une plateforme d'apprentissage IA pour débutant visant un poste AI Engineer junior.

Je veux, en français, concis et sans remplissage :
1. **Théorie inline** (150-300 mots) : le pourquoi, un modèle mental, un exemple concret. (Renvoie aussi vers la leçon de fond du sujet.)
2. **Exemple guidé** : énoncé simple → raisonnement → solution → explication ligne par ligne → variante. Plus simple que l'exercice.
3. **Exercice principal** (autonome, sans IA) + **exercice bonus**.
4. **Mini-quiz** (4 questions : définition, raisonnement, application, piège).
5. **Livrable** concret + **critères de validation** cochables.
6. **Erreurs fréquentes**.
7. **Cas métier** (comment ce sujet sert dans un vrai système IA/data).
8. **Question d'entretien** réaliste + idée de bonne réponse.

Format de sortie : un objet à coller dans `scripts/data/days-enrich.mjs` :
```js
{JOUR}: {
  theory: `…`,
  guided: `…`,
  caseStudy: `…`,
  interview: `…`,
}
```
Puis je lance `npm run generate` et je vérifie avec `npm run curriculum:depth-check`.
