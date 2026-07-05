# AI Career OS

**Plateforme locale d'apprentissage sur 12 mois** pour passer de quasi-débutant à profil employable sur des rôles IA appliquée : *AI Engineer junior+, LLM/RAG Engineer junior, AI Product Engineer, Full-stack orienté IA, AI Solutions Builder*.

Une application web qui tourne en **localhost**, sans authentification ni cloud. Tout le contenu pédagogique (365 jours, 52 semaines, 12 mois, 7 projets, corrections, rubriques, méthodologie, carrière) est en **Markdown éditable**. Ta progression est sauvegardée dans un simple fichier JSON local.

---

## Prérequis
- **Node.js 20+** (testé sur Node 22) et npm.
- Rien d'autre : pas de base de données à installer, pas de compte, pas de clé.

## Installation
```bash
npm install
```

## Lancement
```bash
npm run dev
```
Puis ouvre **http://localhost:3000**.

Autres commandes :
```bash
npm run build      # build de production
npm start          # sert le build de production
npm test           # tests d'intégrité (node:test, zéro dépendance)
npm run generate   # régénère les fichiers du curriculum depuis les données sources
```

---

## Structure du projet
```
ai-career-os/
├── app/                    # Application Next.js (App Router) — UI + API
│   ├── page.tsx            # Dashboard
│   ├── calendar/           # Vue calendrier 12 mois → semaines → jours
│   ├── day/[id]/           # Vue Jour (théorie, exercice, correction masquée, suivi)
│   ├── week/[id]/          # Vue Semaine (revue hebdo)
│   ├── month/[id]/         # Vue Mois (revue mensuelle)
│   ├── projects/           # Vue Projets portfolio
│   ├── skills/             # Vue Compétences (scorecard 0-5)
│   ├── reviews/            # Vue Évaluations (hebdo/mensuelles + grilles d'entretien)
│   ├── notes/              # Vue Notes (agrégées depuis les jours)
│   ├── resources/          # Vue Ressources
│   ├── career/             # Vue Carrière (CV, entretiens)
│   ├── doc/[...slug]/      # Rendu des documents (méthodologie, rubriques)
│   └── api/progress/       # API de progression (lit/écrit data/progress.json)
├── lib/                    # Types, chargement du programme, calculs, progression
├── curriculum/             # 📚 TOUT le contenu pédagogique (Markdown éditable)
│   ├── year-overview.md
│   ├── month-01.md … month-12.md
│   ├── week-01.md … week-52.md
│   ├── days/day-001.md … day-365.md
│   ├── solutions/day-001-solution.md … day-365-solution.md
│   ├── projects/project-01.md … project-06.md, project-final.md
│   ├── rubrics/            # scorecard, évaluation mensuelle, grille d'entretien
│   ├── resources/resources.md
│   ├── career/            # cv-linkedin-strategy, interview-prep
│   └── methodology/       # how-to-learn, how-to-use-ai-without-dependency, etc.
├── scripts/
│   ├── generate-curriculum.mjs   # Générateur (source de vérité → Markdown + JSON)
│   └── data/                     # 📝 Données sources du programme (à éditer)
│       ├── skills.mjs            # les 20 compétences
│       ├── program-structure.mjs # 12 mois, 52 semaines, revues
│       ├── days-01-15.mjs        # jours 1-15 (très détaillés)
│       ├── days-16-30.mjs        # jours 16-30 (très détaillés)
│       ├── days-31-90.mjs        # jours 31-90 (complets)
│       └── days-plan.mjs         # jours 91-365 (plan actionnable par semaine)
├── data/
│   ├── program.json        # Index généré (consommé par l'app)
│   └── progress.json       # Ta progression (écrite par l'app)
└── tests/                  # Tests d'intégrité (node:test)
```

---

## Comment modifier le programme

Le contenu vient de deux endroits — tu peux éditer l'un ou l'autre :

### 1. Éditer directement un fichier Markdown (le plus simple)
Modifie n'importe quel fichier dans `curriculum/` (ex : `curriculum/days/day-042.md`).
Pour que le générateur **ne l'écrase pas** au prochain `npm run generate`, ajoute cette ligne tout en haut du fichier :
```
<!-- keep -->
```
Les fiches projets, rubriques, méthodologie et carrière sont déjà protégées ainsi.

### 2. Éditer les données sources puis régénérer
Pour modifier en masse (ex : enrichir les jours 91-365), édite les fichiers de `scripts/data/`, puis :
```bash
npm run generate
```
Cela régénère tous les fichiers non protégés + `data/program.json`.

> Astuce : le générateur préserve toujours les fichiers commençant par `<!-- keep -->`. Utilise cette règle pour retoucher un jour à la main sans perdre tes changements.

---

## Comment utiliser l'app chaque jour

1. **Ouvre le Dashboard.** Il affiche ta progression, le jour actuel, les compétences de la semaine, le prochain livrable et un éventuel retard.
2. **Clique sur « ▶ Commencer la journée ».** Le compteur démarre (la date de début est enregistrée au premier clic) et tu arrives sur la **Vue Jour**.
3. **Travaille la journée** dans l'ordre : théorie courte → exercice principal **seul, sans IA** → bonus → mini-quiz.
4. **Remplis ton suivi** (panneau « Mon suivi du jour ») : statut, auto-évaluation 0-5, checklist de validation, **ta réponse**, tes notes personnelles. Tout est sauvegardé automatiquement.
5. **Ensuite seulement**, déplie la correction (« ⛔ Voir la correction »). Elle explique la *logique attendue*, les *erreurs probables*, une *solution simple*, une *solution améliorée*, et pose des *questions de réflexion*.
6. **Marque le jour « Terminé »** (ou « À revoir » si besoin). Le Dashboard avance au jour suivant.

> **Règle d'or anti-dépendance :** d'abord seul au moins 30 minutes, jamais de copier-coller de l'IA. Voir `curriculum/methodology/how-to-use-ai-without-dependency.md`.

---

## Comment faire les revues hebdo / mensuelles

- **Revue hebdomadaire** (chaque 7e jour) : la Vue Jour affiche le bilan, un test pratique, un test théorique, un mini-projet, une checklist, les critères de passage et un exercice d'architecture. Coche, note-toi, mets à jour tes **scores de compétences** dans la Vue Compétences.
- **Revue mensuelle** (dernier jour du mois) : ouvre la **Vue Mois** — projet validant, scores attendus, compétences acquises, lacunes, livrable portfolio, simulation d'entretien, exercice oral. La grille détaillée est dans la **Vue Évaluations**.
- La **Vue Compétences** est ta scorecard 0-5 : réévalue-toi honnêtement à chaque revue (clique sur les ronds). La grille de niveaux est intégrée.

---

## Où sont mes données ?
- Ta progression : `data/progress.json` (lisible et éditable à la main).
- Elle survit au navigateur (c'est un fichier, pas du localStorage).
- Pour repartir de zéro : remets le contenu à `{ "startDate": null, "days": {}, "skills": {}, "weeklyReviews": {}, "monthlyReviews": {} }`.

## Stack technique
Next.js 15 (App Router) · TypeScript · React 19 · `marked` (rendu Markdown) · stockage fichier JSON · tests `node:test`. Aucune dépendance superflue, aucun service externe.

Bon apprentissage. La régularité bat l'intensité — voir `FINAL_REPORT.md` pour tes 10 premières actions.
