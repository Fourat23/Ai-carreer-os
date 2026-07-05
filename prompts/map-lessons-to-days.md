# Prompt — Associer leçons et jours

Colle ceci. Relis et corrige.

---

Voici la liste des leçons de fond disponibles (fichiers de `curriculum/lessons/`) et la liste des jours avec leur sujet et leur compétence (extraits de `scripts/data/`).

{LISTE LEÇONS}
{LISTE JOURS}

Pour chaque jour, indique la ou les leçons de fond les plus pertinentes à lier dans son bloc « Cours approfondi ». Objectif : chaque jour renvoie vers 1-2 leçons qui approfondissent VRAIMENT son sujet (pas juste la compétence générale).

Sortie : une table `jour → [slugs de leçons]`, puis les modifications à faire dans `scripts/data/lessons-map.mjs` (`LESSON_BY_SKILL`) ou dans `scripts/data/days-enrich.mjs` (champ `lessons` par jour) si un jour a besoin d'un mapping spécifique.
