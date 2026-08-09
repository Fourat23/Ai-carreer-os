# HSD-035 — Composition de parcours & stratégie de burn-down pédagogique

Document de conception haut niveau (Sprint V35). Complète l'ADR-035.

## 1. Architecture de composition (existante, réutilisée)
```
catalogue (buildCatalogue)
  └── track { id, status, moduleRefs, technologies, totalDays }
       └── module { id, title, summary, dayRefs[], skills[] }
            └── dayRefs = PLAGE contiguë [from,to]  OU  LISTE explicite [j1, j2, …]
                 └── jours réels de program.days (aucune copie)
```
`resolveTrackDays` agrège l'union des dayRefs des modules. La progression, la recherche, le
backup/export/import et l'affichage `/parcours` consomment ce read-model. Aucune seconde source.

## 2. Parcours Data/ML — principe de composition
Modules dérivés des compétences réellement enseignées (python, sql, ml, dl, llm, evalia), en
listes de jours curées pour former une progression lisible : fondations → Python/données →
SQL → statistiques → ML → évaluation → workflow → deep learning → transformers → LLM appliqué.
Réutilise le corpus AI Engineer sans le dupliquer ; l'identité pédagogique vient de l'ORDRE et
du CADRAGE des modules, pas d'un nouveau contenu.

## 3. Standard de leçon (burn-down)
Pour chacune des 12 leçons sans on-ramp : ajouter `## 🌍 Le problème d'abord` (situation
concrète, sans jargon, pourquoi le concept existe) + `## 🧩 Prérequis` (ce qu'il faut savoir,
pourquoi, liens). Conserver le contenu technique existant s'il est sain (durcissement additif).
Relier une pratique existante si pertinente.

## 4. Anti-slop & honnêteté
Réutiliser → relier → durcir → créer. Pas de practiceRef hors sujet, pas de section vide notée
P3, pas de parcours activé avec trous, pas de faux runtime. Les warnings du graphe se corrigent
à la source ou se documentent, jamais ne se maquillent.
