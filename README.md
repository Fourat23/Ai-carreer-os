# AI Career OS

**Plateforme locale d'apprentissage sur 12 mois** pour passer de quasi-débutant à profil employable sur des rôles IA appliquée : *AI Engineer junior+, LLM/RAG Engineer junior, AI Product Engineer, Full-stack orienté IA, AI Solutions Builder*.

Une application web qui tourne en **localhost**, sans authentification ni cloud. Tout le contenu pédagogique (365 jours, 52 semaines, 12 mois, 7 projets, corrections, rubriques, méthodologie, carrière) est en **Markdown éditable**. Ta progression est sauvegardée dans un simple fichier JSON local.

> **Outil personnel, 100 % local.** Pas d'authentification, pas de base de données, pas d'hébergement ni de service externe requis : tu clones, tu lances `npm run dev`, tu travailles sur `http://localhost:3000`. Ce n'est ni un SaaS ni une application publique — c'est ton système d'apprentissage exécuté sur ta machine.

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
│   ├── lessons/            # Vue Leçons de fond (index des 60 leçons)
│   ├── glossary/           # Vue Glossaire IT & monde du travail
│   ├── guide/              # Vue Mode d'emploi
│   ├── doc/[...slug]/      # Rendu des documents (méthodologie, rubriques, leçons)
│   └── api/progress/       # API de progression (lit/écrit data/progress.json) + export/import
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

## Recommended daily workflow (déroulé quotidien recommandé)

1. **Ouvre le Dashboard.** Il affiche ta progression, le jour actuel, les compétences de la semaine, le prochain livrable et un éventuel retard.
2. **Clique sur « ▶ Commencer la journée ».** Le compteur démarre (la date de début est enregistrée au premier clic) et tu arrives sur la **Vue Jour**.
3. **Travaille la journée dans l'ordre des blocs** : 🎯 Objectif → 📖 Cours approfondi (+ la **leçon de fond** liée) → 🧭 Exemple guidé → ✍️ Pratique autonome **seul, sans IA** → ❓ Mini-quiz.
4. **Remplis ton suivi** (panneau « Mon suivi du jour ») : statut, auto-évaluation 0-5, checklist de validation, **ta réponse**, tes notes personnelles. Tout est sauvegardé automatiquement.
5. **Ensuite seulement**, déplie la **Correction** (« ⛔ Voir la correction »). Elle explique la *logique attendue*, les *erreurs probables*, une *solution simple*, une *solution améliorée*, et pose des *questions de réflexion*.
6. Relis **🧠 À retenir** et **🚀 Pourquoi ça comptera plus tard**, puis **marque le jour « Terminé »** (ou « À revoir »). Le Dashboard avance au jour suivant.

Guide complet : **Mode d'emploi** (menu de gauche → `curriculum/how-to-use-12-months.md`).

> **Règle d'or anti-dépendance :** d'abord seul au moins 30 minutes, jamais de copier-coller de l'IA. Voir `curriculum/methodology/how-to-use-ai-without-dependency.md`.

### Cours vs exercice vs correction (bien les distinguer)
- **📖 Cours approfondi** (+ leçons de fond) : la THÉORIE. Le *pourquoi*, le modèle mental, les pièges. À lire et reformuler de mémoire.
- **🧭 Exemple guidé** : un pas-à-pas travaillé, PLUS SIMPLE que l'exercice. À étudier puis fermer.
- **✍️ Pratique autonome** : ce que tu FAIS toi-même, sans IA d'abord.
- **⛔ Correction** : à ouvrir APRÈS avoir essayé. Ce n'est pas une réponse à copier mais un outil pour comprendre ta démarche (logique, solution simple, solution améliorée, oral).

### Comment utiliser les leçons de fond (`curriculum/lessons/`)
60 leçons approfondies et réutilisables, réparties en 8 catégories : Fondations (9), Web & backend (7), Data & SQL (5), Software engineering & architecture (6), Python & ML (8), IA appliquée (15 : LLM, RAG, agents, évaluation, sécurité IA), Production & DevOps (5 : Docker, CI/CD, secrets, observabilité, monitoring), Portfolio & carrière (5). Chaque jour renvoie vers la ou les leçons correspondantes dans son bloc « Cours approfondi ». Accès direct via le menu **📖 Leçons de fond** (route `/lessons`). Lis-les pour la profondeur, relis-les pour consolider.

---

## Comment faire les revues hebdo / mensuelles

- **Revue hebdomadaire** (chaque 7e jour) : la Vue Jour affiche le bilan, un test pratique, un test théorique, un mini-projet, une checklist, les critères de passage et un exercice d'architecture. Coche, note-toi, mets à jour tes **scores de compétences** dans la Vue Compétences.
- **Revue mensuelle** (dernier jour du mois) : ouvre la **Vue Mois** — projet validant, scores attendus, compétences acquises, lacunes, livrable portfolio, simulation d'entretien, exercice oral. La grille détaillée est dans la **Vue Évaluations**.
- La **Vue Compétences** est ta scorecard 0-5 : réévalue-toi honnêtement à chaque revue (clique sur les ronds). La grille de niveaux est intégrée.

---

## Where is my data? (où sont mes données ?)
- Ta progression : `data/progress.json` (lisible et éditable à la main).
- Elle survit au navigateur (c'est un fichier, pas du localStorage).
- **Ce fichier est local et non versionné** (il est dans `.gitignore`) : ta progression personnelle
  ne part jamais dans Git, et un `git pull` ne l'écrase pas. Un modèle vierge est fourni :
  `data/progress.example.json`.

## Initialiser la progression locale
L'application fonctionne même si `data/progress.json` est **absent** (elle démarre alors sur un état
vide en mémoire, puis crée le fichier au premier suivi enregistré). Pour partir d'un fichier propre
tout de suite :
```bash
cp data/progress.example.json data/progress.json
```
Si le fichier est **corrompu**, l'app ne plante pas : elle repart d'un état vide sans écraser
silencieusement le fichier existant.

## How to backup progress (sauvegarder ma progression)
- **Depuis l'app** : Dashboard → carte « Sauvegarde de ma progression » → **⬇️ Exporter** télécharge `progress-AAAA-MM-JJ.json`. **⬆️ Restaurer** recharge un fichier exporté (validé avant écrasement).
- **API directe** : `GET /api/progress/export` (télécharge), `POST /api/progress/import` (restaure).
- **À la main** : copie simplement le fichier `data/progress.json` ailleurs. Pour restaurer, remets-le en place.
- **Conseil** : exporte avant chaque `git pull`/mise à jour, et de temps en temps par sécurité.

## How to reset progress (repartir de zéro)
Remplace le contenu de `data/progress.json` par :
```json
{ "startDate": null, "days": {}, "skills": {}, "weeklyReviews": {}, "monthlyReviews": {} }
```
(Sauvegarde-le d'abord si tu veux pouvoir revenir en arrière.)

## How to customize the curriculum (personnaliser le programme)
Deux façons :
1. **Éditer un fichier Markdown** dans `curriculum/` et ajouter `<!-- keep -->` en première ligne pour qu'il ne soit jamais réécrit par le générateur.
2. **Éditer les données sources** dans `scripts/data/` (jours, semaines, mois, leçons, plan), puis `npm run generate`.
Le standard de qualité d'une journée est décrit dans `curriculum/QUALITY_STANDARD.md` (menu **📘 Mode d'emploi → standard de qualité**).

## How to run the curriculum integrity & depth checks
```bash
npm run curriculum:check         # intégrité : 365 jours, 365 corrections, 52 semaines,
                                 # 12 mois, sections obligatoires, compétences, liens internes
npm run curriculum:depth-check   # profondeur pédagogique : cours approfondi, exemple guidé,
                                 # « pourquoi ça comptera plus tard », correction, longueur minimale
```
Les deux sortent en erreur (code 1) si un problème est détecté — pratique en pré-commit.

## Glossaire IT & monde du travail (`/glossary`)
Une page dédiée pour décoder les acronymes, anglicismes et expressions du métier
(développement, architecture, cloud, data, IA, production, gestion de projet, entreprise,
carrière). Chaque terme explique sa signification, sa forme développée, sa traduction
française, son contexte réel, une phrase « entendue en réunion », les confusions possibles
et les termes liés. Les acronymes ambigus (PR, PM, PO, CD, CI, ADR, SME, MVP, POC, QA,
UAT, TSD…) documentent explicitement leurs différents sens.

- **Route** : `/glossary` (lien « 📚 Glossaire IT » dans la barre latérale).
- **Données éditables** : `curriculum/glossary/glossary.json` — format documenté dans
  `curriculum/glossary/README.md` (champs, catégories, niveaux, ajout d'entrée/alias/relation).
- **Recherche** instantanée, insensible à la casse et aux accents (terme, forme développée,
  français, alias, tags), filtres par catégorie et par niveau, navigation A–Z, vues
  compacte/détaillée, filtres reflétés dans l'URL.
- **Validation** :
```bash
npm run glossary:check      # (alias : npm run glossary:validate)
```
Le validateur détecte identifiants/termes dupliqués, définitions manquantes, catégories ou
niveaux invalides, relations vers un `id` inexistant, alias en collision et champs
obligatoires manquants ; il échoue (code 1) au moindre problème. Tests : `tests/glossary.test.mjs`.

## Known limitations (limites connues)
- **Glossaire non exhaustif** : base initiale de grande qualité (~250 termes), pensée pour être
  étendue à la main (`curriculum/glossary/glossary.json`) — pas un dictionnaire complet.
- **Jours 91-365 moins verbeux** que les jours 1-30 : ils restent *actionnables* (objectif, tâche, livrable, critères, correction/grille, renvoi vers une leçon de fond) mais leur théorie propre est plus courte. Enrichissables via `scripts/data/days-plan.mjs` + `npm run generate`.
- **Corrections des jours planifiés** = grilles d'auto-évaluation guidées (pas des solutions détaillées ligne à ligne, contrairement aux jours 1-30).
- **Scores de compétences déclaratifs** : auto-évaluation guidée par rubrique, non calculée par un correcteur automatique (honnête pour un outil solo).
- **Pas d'IDE intégré** : tu codes dans ton propre éditeur ; l'app est le pilote pédagogique, pas un environnement d'exécution.
- **Usage mono-utilisateur local** : pas d'authentification ni de multi-profils (par conception).

## Stack technique
Next.js 15 (App Router) · TypeScript · React 19 · `marked` (rendu Markdown) · stockage fichier JSON · tests `node:test`. Aucune dépendance superflue, aucun service externe.

Bon apprentissage. La régularité bat l'intensité — voir `FINAL_REPORT.md` pour tes 10 premières actions.
