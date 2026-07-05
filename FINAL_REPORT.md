# FINAL_REPORT — AI Career OS

Rapport de fin de construction. À lire en entier avant de commencer.

---

## 1. Ce qui a été construit

Une application web locale complète (**AI Career OS**) contenant un programme d'apprentissage de 12 mois pour devenir employable sur des rôles IA appliquée, avec :

- **Une application Next.js + TypeScript** qui tourne en localhost (`npm run dev`), sans auth ni cloud.
- **11 vues** : Dashboard, Calendrier, Vue Jour, Vue Semaine, Vue Mois, Projets, Compétences, Évaluations, Notes, Ressources, Carrière (+ pages méthodologie).
- **Suivi de progression persistant** (fichier `data/progress.json` via une API locale) : statut par jour, auto-évaluation 0-5, checklist, « ma réponse », notes, scores de 20 compétences.
- **365 jours de contenu** générés (`curriculum/days/`), **313 corrections** (`curriculum/solutions/`), **52 semaines**, **12 mois**.
- **7 fiches projets** portfolio détaillées (dont le projet final **DocSense**).
- **3 rubriques** d'évaluation (scorecard, mensuelle, entretien), **5 documents de méthodologie**, **2 documents carrière**, **1 fichier ressources**.
- **Un générateur** (`npm run generate`) qui reconstruit tout le curriculum depuis des données sources éditables, en préservant tes retouches (marqueur `<!-- keep -->`).
- **Des tests** (`npm test`) qui vérifient l'intégrité du curriculum et la logique de progression.

### Le projet final recommandé (et pourquoi)
**DocSense** — assistant d'analyse documentaire technique avec pipeline RAG évalué et dashboard qualité. C'est le choix le plus **bankable** : la Q&R/analyse sur corpus documentaire privé est le cas d'usage LLM n°1 en entreprise, et l'ajout d'une **évaluation chiffrée**, de **guardrails testés** et d'un **dashboard qualité** est exactement ce qui distingue un ingénieur IA d'un simple « prompteur ». Détails dans `curriculum/projects/project-final.md`.

---

## 2. Comment lancer le projet

```bash
npm install
npm run dev       # → http://localhost:3000
npm test          # tests d'intégrité (18 tests)
npm run generate  # régénère le curriculum si tu édites scripts/data/
```
Prérequis : Node.js 20+ (testé sur Node 22). Voir `README.md` pour le détail.

---

## 3. Ce qui est complet

- ✅ **Application** : build de production réussi, toutes les routes répondent 200, l'API de progression lit/écrit correctement (testé end-to-end).
- ✅ **Jours 1 à 30** : très détaillés (durée, découpage horaire, théorie, exercice principal + bonus, mini-quiz, livrable, critères, erreurs fréquentes, ressources, consignes « sans IA d'abord » + usage IA, correction complète en 6 volets, questions de réflexion).
- ✅ **Jours 31 à 90** : complets (objectif, concepts, exercice concret, livrable, correction guidée : logique / pièges / réflexion). Alignés sur les mois 2-3.
- ✅ **Jours 91 à 365** : plan actionnable — chaque jour a un sujet précis, un exercice concret et un livrable, généré depuis `scripts/data/days-plan.mjs` (une entrée par semaine × 6 jours).
- ✅ **Revues hebdomadaires** (52) : bilan, test pratique, test théorique, mini-projet, checklist, critères de passage, exercice d'architecture.
- ✅ **Revues mensuelles** (12) : projet validant, scores attendus, compétences acquises, lacunes, livrable portfolio, simulation d'entretien, exercice oral.
- ✅ **7 projets** : objectif, ce que ça prouve, fonctionnalités, stack, architecture, modèle de données, critères de qualité, tests, README attendu, démo, erreurs à éviter, extensions, ADRs.
- ✅ **Système d'évaluation** : scorecard 0-5 interactive pour les 20 compétences + 3 grilles.
- ✅ **Méthodologie et carrière** : apprendre, utiliser l'IA sans en dépendre, débugger, penser en ingénieur, concevoir une architecture, CV/LinkedIn, préparation entretiens.
- ✅ **Corrections** : elles expliquent la logique, les erreurs probables, les points à vérifier, une solution simple + une améliorée, et posent des questions — pas juste une réponse finale.
- ✅ **README** suffisant (prérequis, install, lancement, structure, édition, usage quotidien, revues).

---

## 4. Ce qui est partiel (limites assumées)

- 🟡 **Densité décroissante des jours 91-365.** Ils sont *actionnables* (sujet + exercice + livrable clairs) mais moins verbeux que les jours 1-30. C'est **voulu** (autonomie croissante) et **corrigeable** : édite `scripts/data/days-plan.mjs` puis `npm run generate`. Les corrections de ces jours sont des grilles d'auto-évaluation génériques, pas des solutions détaillées.
- 🟡 **Scores de compétences déclaratifs.** L'auto-évaluation 0-5 est guidée par la rubrique mais non calculée par un correcteur automatique — honnête pour un outil solo.
- 🟡 **Pas de rendu de code exécutable dans l'app.** Tu codes dans ton propre éditeur (VS Code) ; l'app est le pilote pédagogique, pas un IDE.
- 🟡 **Contenu généré, donc perfectible.** Certaines formulations des jours planifiés sont volontairement génériques. Enrichis-les au fil de l'eau quand un jour approche.

---

## 5. Comment continuer (enrichir le programme)

1. **Pour retoucher un jour précis** sans le perdre : édite `curriculum/days/day-XXX.md`, ajoute `<!-- keep -->` en première ligne.
2. **Pour enrichir en masse les jours 91-365** : édite les entrées de `scripts/data/days-plan.mjs` (ajoute théorie, quiz, ressources — le schéma accepte plus de champs), puis `npm run generate`.
3. **Pour ajuster la structure** (thèmes de semaine, revues, scores attendus) : édite `scripts/data/program-structure.mjs`, puis régénère.
4. **Vérifie toujours** après édition : `npm test` (intégrité) puis `npm run build`.

---

## 6. Tes 10 premières actions

1. `npm install` puis `npm run dev`, ouvre **http://localhost:3000**.
2. Lis `curriculum/methodology/how-to-learn.md` et `how-to-use-ai-without-dependency.md` (via la sidebar « Méthode »). **La règle « d'abord seul » conditionne tout le reste.**
3. Ouvre la **Vue Compétences** et fais une auto-évaluation *honnête* de départ (elle sera basse — c'est le point de comparaison de ta transformation).
4. Sur le **Dashboard**, clique **« ▶ Commencer la journée »** (jour 1). Le compteur démarre.
5. Installe ton environnement réel : **Node.js, VS Code, Git, un compte GitHub** (c'est justement le jour 1).
6. Fais le **jour 1 en entier**, sans IA d'abord, puis remplis ton suivi et déplie la correction.
7. **Crée ton dépôt GitHub `ia-lab`** et prends l'habitude du **commit quotidien** dès aujourd'hui (la chaîne verte est un moteur).
8. Bloque **4-5 h/jour** dans ton agenda, à heure fixe si possible. La régularité bat l'intensité.
9. Ouvre la **Vue Calendrier** pour visualiser les 12 mois et les 7 projets — garde la vue d'ensemble en tête.
10. Ce week-end (jour 7), fais ta **première revue hebdomadaire** et réévalue tes compétences.

---

## 7. Les risques du programme (et comment les gérer)

- **Le tutorial hell** (accumuler du contenu sans construire) → la règle « d'abord seul » et les livrables quotidiens l'évitent. Construis, ne te contente pas de lire.
- **La dépendance à l'IA** → tu vises un métier IA ; paradoxalement, tu dois d'abord savoir coder *sans*. Respecte le protocole « lire-fermer-réécrire ».
- **L'abandon vers le mois 3-4** (le creux classique) → vise la constance, célèbre les jalons (chaque projet), ne casse pas la chaîne de commits.
- **La sur-évaluation de soi** → applique le test « puis-je le faire seul + l'expliquer ? » à chaque score.
- **Le perfectionnisme sur le projet final** → premières candidatures envoyées au jour 358 quoi qu'il arrive.
- **Le marché de l'emploi** → un programme sérieux ne garantit pas un poste, mais un portfolio de 7 projets crédibles + une vraie compréhension technique te met dans le peloton employable. Candidate aussi à des postes full-stack orientés IA (ton profil hybride est un atout).

---

## 8. Comment adapter le programme si tu prends du retard

- **Retard de quelques jours** : normal. Le Dashboard affiche l'écart entre le jour attendu (selon ta date de début) et ton jour actuel. Rattrape sur un week-end ou décale — le compteur n'est qu'un indicateur, pas un juge.
- **Retard structurel (une compétence ne rentre pas)** : ne fonce pas. Utilise un jour de revue hebdo pour **consolider** au lieu d'avancer. Mieux vaut décaler que bâtir sur du sable.
- **Retard important (semaines)** : **coupe le scope, pas la qualité.** Priorise le chemin critique : fondations (mois 1-2) → un projet full-stack (mois 3-4) → un projet ML (mois 6) → **le RAG évalué (mois 8-9)** → **DocSense (mois 11-12)**. Les mois 5, 7, 10 peuvent être allégés si nécessaire — mais ne saute jamais l'évaluation RAG ni le projet final, ce sont tes différenciateurs.
- **Règle générale** : un jour à 2 h vaut mieux qu'un jour à zéro. Ne vise pas la perfection, vise à ne pas t'arrêter.
- Détails dans `curriculum/rubrics/monthly-evaluation.md` (« si les critères ne sont pas atteints »).

---

## 9. Comment utiliser ce SaaS pendant 12 mois

- **Chaque jour** : Dashboard → « Commencer la journée » → travailler seul → remplir le suivi → correction → marquer terminé.
- **Chaque semaine (jour 7)** : revue hebdo dans la Vue Jour, mise à jour des scores de compétences.
- **Chaque mois (dernier jour)** : revue mensuelle dans la Vue Mois, projet validant, simulation d'entretien, bilan écrit dans les Notes.
- **Aux jalons (jours 30, 60, 90, 180, 270, 365)** : relis tes anciennes notes, mesure ta transformation, ajuste tes scores, replanifie si besoin.
- **En continu** : commits GitHub quotidiens, journal d'apprentissage dans les Notes, projets poussés et documentés au fil de l'eau (pas à la fin).
- **Au mois 12** : bascule carrière (CV, LinkedIn, GitHub, entretiens) et **envoie tes candidatures** — c'est l'objectif de toute l'année.

---

## 10. Vérification du travail (auto-contrôle du build)

- ✅ `npm run build` : compilation et types OK, 14 routes générées.
- ✅ `npm test` : 18 tests verts (intégrité curriculum + logique de progression).
- ✅ Toutes les routes testées répondent 200 (dashboard, calendrier, jours 1/8/92/200/365, semaine, mois, projets, compétences, ressources, notes, évaluations, carrière, doc).
- ✅ API de progression testée end-to-end : sauvegarde d'un jour, d'un score de compétence, rejet des entrées invalides (400), persistance vérifiée, Dashboard qui reflète l'état.
- ✅ Jour 1 complet (toutes les sections), mois 1 complet (revue mensuelle), corrections présentes.
- ✅ Liens internes fonctionnels (jour ↔ semaine ↔ mois ↔ projets ↔ docs).

### Prochaines améliorations possibles (si tu veux itérer sur l'outil)
- Enrichir progressivement les jours 91-365 (théorie + quiz) au fur et à mesure que tu les atteins.
- Ajouter un export/import de `progress.json` (bouton dans l'UI).
- Ajouter un graphe d'évolution des scores de compétences dans le temps.
- Générer un « rapport de fin de mois » automatique agrégeant tes notes et scores.

Bon courage. Dans 12 mois, relis ta lettre du jour 1.
