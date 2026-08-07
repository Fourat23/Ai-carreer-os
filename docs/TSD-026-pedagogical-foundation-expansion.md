# TSD-026 — Expansion de la fondation pédagogique (Technical Solution Design)

TSD = Technical Solution Design. Contrats techniques de l'expansion V26.

## Fichiers de contenu
- `curriculum/lessons/<slug>.md` — une leçon par fichier, en-tête `<!-- keep -->`,
  titre `# Leçon — …`, sections `## 🎯 Objectif` … `## 🔗 Liens avec le programme`.
  Sections minimales exigées par la gate : Objectif, Modèle mental, une section de
  théorie/explication, Erreurs fréquentes (ou Pièges), À retenir, Vocabulaire, Liens.
- Contenu français, honnête (réel/simulé étiqueté), fournisseurs cloud distingués,
  aucune credential réelle (valeurs factices explicites).

## Métadonnées
- `scripts/data/lessons-map.mjs` : ajouter à `LESSONS`
  `{ file:'<slug>.md', title, cat, level:1|2|3, min:<int>, skills:[<known>] }`.
  `skills` doivent être des ids de compétences connus du programme.
- `npm run generate` régénère `data/program.json` (lessons) en préservant les .md keep.

## Plan versionné
- `docs/architecture/v26-lessons-plan.json` : `{ sprint, baselineRef, newLessons:[{slug,cat,domain,concepts:[…]}], requiredConcepts:{slug:[…]} }`.
  Sert de source à `v26:check` (périmètre + concepts requis).

## Gate `scripts/v26-check.mjs` (`npm run v26:check`, ajoutée à gates:active)
Pour chaque leçon du plan : le fichier existe ; une entrée LESSONS correspond
(slug, title non vide, cat, level 1-3, min>0, skills connus) ; sections minimales
présentes ; concepts requis présents (substring, insensible casse/accents) ; aucun
marqueur d'authoring (`TODO`, `PLACEHOLDER`, `Lorem`, `FIXME`, `à compléter`) ;
liens internes valides (`/doc/lessons/<slug>` et `/day/<n>` existants) ; empreinte
de contenu (normalisée) unique parmi les leçons V26 (anti-duplication). Robuste si le
plan est absent (n'échoue pas avant CP2). Ne juge JAMAIS la profondeur par la longueur.

## Catalogue (CP8)
- `lib/catalogue.mjs` : `CLOUD_DEVOPS_TRACK_ID = 'cloud-devops-engineer-v1'`,
  modules (jours réels, non contigus), techs, durée dérivée. Tests catalogue/agrégat/
  contexte rendus data-driven (aucun compte de parcours codé en dur).

## Invariants
- Aucune leçon existante modifiée en régression.
- progress.json byte-identique à la baseline après tests.
- Aucun `eval`/`Function`/`shell`/réseau ; aucune dépendance lourde ; aucune
  solution/test privé dans le client.
