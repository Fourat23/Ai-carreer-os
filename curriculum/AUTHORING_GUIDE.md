<!-- keep -->
# Guide de rédaction (AUTHORING_GUIDE)

Comment enrichir AI Career OS **sans Fable**, en gardant la cohérence et en ne cassant rien.

## Principes
1. **Qualité > quantité.** Moins de blabla, plus de clarté. Chaque paragraphe apprend quelque chose.
2. **Le pourquoi avant le comment.** Toujours un modèle mental et un exemple concret.
3. **Relier au métier.** Chaque notion pointe vers son usage IA/data/architecture et une question d'entretien quand c'est pertinent.
4. **Ne rien casser.** Après toute modification : `curriculum:check`, `curriculum:depth-check`, `test`, `build`.

## Où vit le contenu
| Contenu | Source |
|---|---|
| Jours 1-15, 16-30 (riches) | `scripts/data/days-01-15.mjs`, `days-16-30.mjs` |
| Exemples guidés jours 1-30 | `scripts/data/days-01-30-guided.mjs` |
| Jours 31-90 | `scripts/data/days-31-90.mjs` + `days-31-90-extras.mjs` |
| Jours 91-365 | `scripts/data/days-plan.mjs` (WEEK_PLANS) |
| Enrichissements 91-365 (exemple guidé, cas métier, question d'entretien) | `scripts/data/days-enrich.mjs` |
| Association compétence → leçons + bloc « futur » | `scripts/data/lessons-map.mjs` |
| Leçons de fond | `curriculum/lessons/*.md` (Markdown direct, `<!-- keep -->`) |
| Fiches projets, rubriques, méthodo, carrière | `curriculum/**` (Markdown direct, `<!-- keep -->`) |

Après édition d'un fichier `scripts/data/*.mjs` : **`npm run generate`**.
Un fichier `.md` commençant par `<!-- keep -->` n'est jamais réécrit par le générateur.

## Rédiger une LEÇON (le plus haut levier)
1. Copie `curriculum/templates/lesson-template.md` → `curriculum/lessons/<slug>.md`.
2. Remplis TOUTES les sections du gabarit (objectif, modèle mental, explication, exemple simple, exemple guidé, exemple appliqué IA, erreurs, anti-patterns, mini-exercice, exercice difficile, correction, questions d'entretien, à retenir, vocabulaire, checklist, liens).
3. Ajoute `{ file, title }` dans `LESSONS` de `scripts/data/lessons-map.mjs`, et mappe la compétence concernée dans `LESSON_BY_SKILL`.
4. Vise 600-1000 mots utiles. `npm run curriculum:depth-check` vérifie la structure.

## Enrichir un JOUR 91-365
Deux façons :
- **Vite** : édite l'entrée du jour dans `days-plan.mjs` (WEEK_PLANS[semaine].days[i]) : enrichis `objective`, `exercise`, `deliverable`. Ajoute éventuellement `guided`, `caseStudy`, `interview` (voir `days-enrich.mjs`).
- **Ciblé** : ajoute une entrée `{ [jour]: { guided, caseStudy, interview, theory } }` dans `scripts/data/days-enrich.mjs` — le générateur l'injecte dans le jour.
Puis `npm run generate`.

## Enrichir un JOUR 1-90
Édite la donnée du jour dans `days-01-15/16-30/31-90.mjs` (théorie, exercice, quiz, solution) ou l'exemple guidé dans `days-01-30-guided.mjs` / `days-31-90-extras.mjs`, puis `npm run generate`.

## Définition d'un « jour qualitatif » (à respecter)
Objectif clair · cours théorique substantiel · modèle mental · exemple guidé · pratique autonome ·
quiz de compréhension · correction exploitable · erreurs fréquentes · livrable · critères de validation ·
lien futur (archi/data/IA) · question d'entretien quand pertinent.
Jours revue/projet : grille · attendu concret · checklist · erreurs fréquentes · critères de passage · auto-évaluation · action de rattrapage.

## Les prompts d'assistance
Dossier `prompts/` : des consignes prêtes à coller dans n'importe quel assistant IA pour t'aider
à enrichir (`enrich-day`, `create-lesson`, `deepen-theory`, `improve-solution`,
`map-lessons-to-days`, `audit-curriculum`). Rappel : l'IA aide, elle ne remplace pas ta compréhension.

## Boucle de sécurité (à faire après CHAQUE session d'édition)
```bash
npm run generate            # si tu as touché scripts/data/
npm run curriculum:check    # intégrité
npm run curriculum:depth-check   # profondeur
npm test                    # tests
npm run build               # compile
git add -A && git commit -m "…" && git push
```
