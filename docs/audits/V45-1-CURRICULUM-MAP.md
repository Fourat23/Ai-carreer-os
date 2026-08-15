# V45.1 — CURRICULUM MAP (read-model dérivé, lecture seule)

Données : `docs/audits/V45-1-CURRICULUM-MAP.json` (généré par `scripts/v45-1-curriculum-map.mjs`).
Aucune seconde source de vérité : composition de `program.json` + `catalogue` + exercices.

## Structure globale
- **1 programme** de 365 jours / 12 mois / 12 modules ; **8 parcours disponibles** (+1 annoncé) = VUES
  (sous-ensembles de modules) sur ce programme. 67 modules au catalogue.
- **128 leçons** (ordre curriculaire, cf. JSON) ; **20 compétences** ; **262 exercices**.

## Parcours (moduleRefs / jours / technologies)
| Parcours | Statut | Jours | Modules | Techs |
|---|---|---|---|---|
| ai-engineer-foundations-v1 | available | 365 | 12 | 20 |
| fullstack-typescript | available | 119 | 11 | 10 |
| frontend-engineer-v1 | available | 54 | 7 | 4 |
| backend-engineer-v1 | available | 85 | 8 | 9 |
| systems-cloud-foundations-v1 | available | 31 | 8 | 5 |
| appsec-cloud-security-v1 | available | 15 | 7 | 7 |
| cloud-devops-engineer-v1 | available | 29 | 7 | 8 |
| data-ml-v1 | available | 188 | 7 | 5 |
| ai-fullstack-v1 | announced | 0 | 0 | 5 |

## Jours par compétence (allocation du programme)
rag 42 · jsts 42 · ml 35 · comm 25 · autonomy 23 · secu 23 · llm 21 · agents 21 · evalia 20 · archi 19 ·
python 16 · dl 15 · se 14 · http 13 · algo 11 · sql 11 · gitlinux 7 · ds 5 · patterns 2.
→ **IA/ML (ml+rag+llm+agents+evalia+dl) = 154 jours (42 %)**.

## Compétences × pratique de code exécutable
**8/20 avec exercices** : jsts (215), algo (25), gitlinux (22), ds (16), python (15), http (14), se (6),
sql (5). **12/20 sans aucun exercice** : archi, patterns, ml, dl, llm, rag, agents, evalia, secu, cloud,
comm, autonomy.

## Chaîne pédagogique par leçon (extrait du modèle)
Chaque leçon du JSON porte : `order, slug, cat, level, skills, practiceRefs, execPractice` (booléen :
au moins une compétence de la leçon a une pratique de code réelle). C'est le squelette utilisé par
l'audit 128/128 (CP3→CP10) et l'audit des chaînes (CP11).

## Lecture
Le désalignement structurel est confirmé côté MAP : le programme investit massivement dans l'IA/ML
(42 % des jours) alors que `execPractice=false` pour toutes ces compétences. La colonne vertébrale
exécutable est le tronc ingénierie logicielle (jsts/algo/ds/http/git/se/sql/python).
