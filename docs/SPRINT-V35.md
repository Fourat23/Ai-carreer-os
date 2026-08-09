# Sprint V35 — Track Architecture V2 + Data/ML Engineer Path + Legacy Pedagogical Debt Burn-down

Rapport de sprint (français), factuel, sans langage promotionnel. Sprint de **macro-structuration** :
décider (sur preuve) de l'architecture des parcours, activer le parcours Data/ML si — et seulement
si — c'est honnête, et **finir** le chantier de dette des 12 leçons sans rampe d'accès. Aucune
course au volume, aucune refonte UI, aucun second moteur, aucun faux runtime ML.

## 1. État initial audité (CP0, HEAD cbddb85)
110 leçons · 223 exercices · 40 missions · 39 playbooks · 705 termes glossaire · 6 parcours dotés +
3 annoncés · ~1030 tests · 14 gates. Tree propre, local == origin, 0 serveur résiduel. progress.json
baseline `323604021055588a9528a86875f36598dbdc7758`. Curriculum Graph : 7 warnings, 0 bloquant, 0
foundation-without-practice. 12 leçons héritées sans on-ramp. Débordement ~6px signalé sur
data-cleaning-quality @375px.

## 2. Divergence avec le prompt
Aucune divergence de fond. Chiffres conformes au déclaré V34.

## 3. Décision d'architecture — ADR/HSD/TSD-035 (CP1)
**Constat décisif du CP0** : la sélection de jours **non contiguë** est **déjà** supportée par
`lib/catalogue.mjs` (`Array.isArray(from) ? from.includes(d.day) : range`) — appsec, systems-cloud
et cloud-devops l'utilisent déjà. **Track Architecture V2 = réutiliser ce mécanisme existant**
(option B), en **read model** au-dessus de l'unique `data/program.json`. Décision : **ne pas
construire de second moteur**. Le packaging Data/ML devient possible sans dupliquer la colonne
vertébrale AI-Engineer.

## 4. Gate v35:check + plan + ledger + tests (CP2)
15 gates actives (`v35:check` ajouté, adapté de v34). `docs/architecture/v35-lessons-plan.json`
(hardenedLegacy = 12, critical = docker-containers, prereq déclarés), registre d'audit scaffold, et
`tests/v35-pedagogy.test.mjs` + `tests/v35-e2e.test.mjs`. Le gate valide **structurellement** ; il
ne juge jamais la profondeur par la longueur.

## 5. Compat parcours (CP3, NO_COMMIT) + design Data/ML (CP4)
CP3 : vérification que la composition non contiguë couvre le besoin → aucun changement de code
nécessaire → **pas de commit vide**. CP4 : `docs/architecture/v35-data-ml-track-design.md` — spéc du
parcours par modules → compétences → jours réels.

## 6. Burn-down de dette (CP5) — 12 / 12
Les 12 leçons héritées sans rampe reçoivent, en **ADDITIF**, un on-ramp `## 🌍 Le problème d'abord`
(avant l'objectif) et des prérequis rédigés `## 🧩 Prérequis` (avant le modèle mental) :
git-advanced, docker-containers, ci-cd, observability-logging, monitoring-production,
deployment-secrets, caching-performance, system-design-interview, interview-preparation,
portfolio-github, readme-documentation, technical-storytelling. Résultat mesuré (test e2e) :
**0 leçon sans on-ramp**. Aucun fond réécrit, aucun contenu supprimé.

## 7. Pratique (CP6, NO_COMMIT) + playbook incident data (CP7)
CP6 : les leçons durcies s'appuient déjà sur des pratiques existantes → aucune création forcée →
**pas de commit vide**. CP7 : playbook `data-pipeline-broken` (incident de pipeline/schéma en
production) — comble un manque réel, ne double aucun playbook. Total : 40 playbooks.

## 8. Activation du parcours Data/ML (CP8) — DISPONIBLE
`data-ml-v1` promu `announced → available`. `dataMlModules(program)` compose **7 modules**
(fondations, python-data, sql, ml, deep-learning, transformers-llm, applied-ai) par sélection de
jours **par compétence**, non contiguë : **188 jours** dérivés du programme réel. Preuve e2e :
module → jour réel → leçon ; `data-ml-v1` (188 j) est un **sous-ensemble focalisé** du parcours
AI Engineer (365 j), `taille ≤ 0,75 ×` (exclut frontend/JS/web) → identité **distincte**, pas une
copie. Tests mis à jour honnêtement : `catalogue`, `v29-e2e`, `v30-e2e` (annoncés restants), et
`v34-e2e` (test inversé : data-ml-v1 est désormais DISPONIBLE, décision assumée en V35).

## 9. Curriculum Graph (CP9) — inchangé sur preuve
7 warnings, 0 bloquant. Les prérequis du burn-down (8 leçons) maintiennent le graphe sain sans
introduire de nouveau `concept-without-foundation`. Restants : 6 `advanced-before-prerequisite`
(dépendances conceptuelles légitimes, non supprimées) + 1 `concept-not-practiced` (hors thème).
Aucun nouveau diagnostic nécessaire. Trajectoire V32→V33→V34→V35 : **15 → 13 → 7 → 7**.

## 10. Intégration produit + validation navigateur + overflow (CP10)
Build OK, serveur de production, routes rendues. Reproduction du débordement ~6px @375px sur
data-cleaning-quality. **Cause racine** : la règle globale `textarea, input, select { width:100% }`
étirait les **cases à cocher** des task-lists GFM (`- [ ]`) à 321px. **Second facteur** : un bloc de
code (`overflow-x:auto`) laissait fuiter ~6px vers le `scrollWidth` racine (artefact de conteneur de
défilement imbriqué), sans qu'aucun élément ne dépasse réellement le viewport. **Deux correctifs
ciblés, aucune refonte UI** : `input:not([type=checkbox]):not([type=radio])` (les cases/radios ne
sont plus étirées) et `.prose.reading { overflow-x: clip }` (la colonne de lecture ne produit jamais
de scroll de page ; le code garde son propre scroll interne). Validation navigateur : **8 pages × 5
largeurs (375/768/1024/1440/1920) → 40/40**, statut < 400, 0 erreur console, overflow ≤ 2px partout.

## 11. Audit pédagogique (CP11)
Registre `v35-pedagogy-audit.json` rempli : 12 items (notes humaines à la lecture intégrale),
moyenne du lot **3,59**, aucune dimension < 3, dimensions dures ≥ 3. Honnêteté : soft-skills notés
3 sur autonomous-practice (pratique réflexive, non exécutable). `docs/PEDAGOGICAL-AUDIT-V35.md` :
méthodologie, matrice 16 dimensions, avant/après, walkthrough néophyte Data/ML, audit rétroactif,
mesures qualitatives, frontière réel/simulé.

## 12. Métriques avant / après
| Indicateur | Avant V35 (cbddb85) | Après V35 |
|---|---|---|
| Leçons | 110 | 110 |
| Exercices | 223 | 223 |
| Missions | 40 | 40 |
| Playbooks | 39 | **40** |
| Glossaire | 705 | 705 |
| Parcours disponibles | 6 | **7** (data-ml-v1 activé) |
| Parcours annoncés | 3 | **2** (frontend-engineer-v1, ai-fullstack-v1) |
| Leçons sans on-ramp | 12 | **0** |
| Gates actives | 14 | **15** |
| Tests | ~1030 | **1043** |
| Curriculum Graph (bloquants / warnings) | 0 / 7 | 0 / 7 |
| Overflow @375px | ~6px | **0** |

## 13. Ce qui existait déjà (anti-duplication)
Le mécanisme de composition non contiguë (catalogue), le contenu de fond des 12 leçons, la rubrique
d'audit v20, le Curriculum Graph comme auditeur, les exercices data/ML (V33/V34). V35 a **relié et
packagé** l'existant plutôt que de le recréer.

## 14. Ce qui a été corrigé / ajouté
On-ramp + prérequis sur 12 leçons ; activation `data-ml-v1` (7 modules, 188 j) via
`dataMlModules` ; playbook `data-pipeline-broken` ; gate `v35:check` ; 2 correctifs CSS ciblés ;
registre d'audit + 2 documents (`SPRINT-V35.md`, `PEDAGOGICAL-AUDIT-V35.md`).

## 15. Validations réellement réalisées
`node --test` → **1043/1043**. `tsc --noEmit` → **0 erreur**. `npm run build` → OK. `gates:active` →
15/15 vertes. Validation navigateur Playwright → 40/40. Ledger validé par `validateAuditLedger`.

## 16. Validations NON réalisées / limites
Aucun test de charge, aucune vérification d'accessibilité ARIA automatisée, aucune exécution réelle
de modèle ML (interdite par conception). La pratique des leçons soft-skills n'est pas auto-corrigée
(réflexive). Profondeur/évaluation/charge cognitive à 3 sur le lot (marge réelle, non masquée).

## 17. Réel vs simulé
Toute logique ML/LLM/RAG du programme est **SIMULATION** (raisonnement déterministe node-js),
étiquetée et testée. Aucune dépendance ML (`numpy`/`pandas`/`sklearn`/`torch`) installée. Aucun
appel réseau, aucune base vectorielle réelle, aucun entraînement.

## 18. progress.json
Gitignoré, jamais commité. Vérifié **inchangé** au blob baseline `3236040…` en fin de sprint.

## 19. Dette restante (P1/P2/P3)
- **P2** : 7 warnings graphe documentés (dépendances conceptuelles légitimes).
- **P3** : marges depth/evaluation/cognitive-load à 3 sur le lot durci ; pratique réflexive des
  soft-skills non auto-corrigée ; parcours `frontend-engineer-v1` et `ai-fullstack-v1` restent
  annoncés (horizon crédible, à activer sur preuve — objet de V36 pour le frontend).

## 20. État Git final
Branche `claude/ai-career-os-saas-phfg49`. Commits CP1→CP11 atomiques (CP3 et CP6 = NO_COMMIT
assumés, aucun commit vide), poussés. local == origin, tree propre, 0 serveur résiduel.

## 21. Résumé avant → après
Les 12 dernières leçons sans rampe deviennent **franchissables** (0 leçon sans on-ramp) ; le
parcours **Data/ML Engineer** passe d'« annoncé » à **disponible** (7 modules, 188 j) en réutilisant
un mécanisme existant plutôt qu'un second moteur ; le débordement responsive est corrigé à la source
(≤ 2px partout) ; le graphe reste sain (0 bloquant). **110 leçons inchangées — la qualité prime.**

## 22. Évaluation du sprint

Barème : FAIBLE · MOYEN · BON · FORT.

| Axe | Note | Justification |
|---|---|---|
| Qualité pédagogique | **FORT** | 12/12 leçons franchissables, moyenne du lot 3,59, notes honnêtes (soft-skills à 3). |
| Cohérence des parcours | **FORT** | Data/ML activé sur preuve e2e, distinct du parcours AI Engineer, aucune duplication de source. |
| Réutilisation vs création | **FORT** | Mécanisme non contigu réutilisé (0 second moteur) ; 1 seul artefact créé (playbook) pour un vrai manque. |
| Honnêteté / anti-greenwashing | **FORT** | Frontière réel/simulé explicite, limites notées, décision V34 « annoncé » revue ouvertement. |
| Preuves & tests | **FORT** | 1043 tests, tsc 0, build OK, 15 gates, 40/40 navigateur, ledger validé. |
| Finition UI | **BON** | Overflow corrigé à la source (≤ 2px), mais pas d'audit responsive exhaustif ni ARIA. |
| Ampleur du contenu créé | **MOYEN** | 0 nouvelle leçon (assumé : sprint de structuration, pas de production de fond). |

**VERDICT : BON→FORT.** V35 atteint son objectif de macro-structuration sans gonfler aucun
compteur : il **finit** une dette (franchissabilité 12/12), **active** un parcours réel sur preuve,
et **corrige** un défaut responsive à la racine. Il ne produit pas de nouvelle leçon — choix assumé
et cohérent avec « qualité > quantité ». La dette résiduelle est P2/P3 et documentée. Aucun
greenwashing, aucune fausse profondeur.

---

## 23. Prompt de reprise V36
Voir ci-dessous. **Ne pas démarrer V36 dans cette session.**

---

# Prompt de lancement — Sprint V36 (à démarrer PLUS TARD, PAS maintenant)

> Ce prompt clôt V35. **Ne démarre pas V36 dans cette session.** Rédigé pour être collé tel quel
> au lancement du sprint suivant.

Reprends **AI Career OS** pour le **Sprint V36 — « Frontend Engineer Path : activation sur preuve +
fondations UI/DOM/accessibilité + hardening premier-contact »**.

**IMPORTANT — travaille sur l'état RÉEL du dépôt.** Ne suppose jamais que ce résumé V35 correspond
encore au repository. Commence par un **CP0 strictement en lecture seule** : audite l'état réel
(git, tests, build, gates, leçons, exercices, missions, playbooks, glossaire, parcours, Curriculum
Graph, serveurs résiduels, baseline progress.json, couverture frontend/UI/DOM/accessibilité) et
présente un **rapport d'audit CP0 en français AVANT toute implémentation**. Si V36 est déjà
(partiellement) livré, NE RECOMMENCE RIEN.

**Langue** : rapports, audits, synthèses et prompt V37 final en **français**.

**Priorité (inchangée)** : pédagogie > cohérence des parcours > pratique > preuves > outillage > UI.
Une excellente leçon vaut mieux que cinq superficielles. L'audit CP0 fait foi.

**État attendu (à VÉRIFIER)** : branche `claude/ai-career-os-saas-phfg49`, HEAD final V35, ~110
leçons, ~223 exercices, 40 missions, 40 playbooks, ~705 glossaire, 15 gates, ~1043 tests, 7 parcours
disponibles (dont data-ml-v1), 2 annoncés (frontend-engineer-v1, ai-fullstack-v1). Curriculum Graph :
~7 warnings, 0 bloquant.

**Objectif central V36 — décider et livrer le parcours Frontend Engineer :**
TRANCHER honnêtement, sur preuve, comme pour Data/ML en V35 :
- soit **activer** `frontend-engineer-v1` par composition (modules → compétences → jours réels, via
  le mécanisme non contigu existant `dataMlModules`/plages — **aucun second moteur**), en vérifiant
  qu'un tronc frontend cohérent (HTML sémantique, CSS/layout, DOM/événements, état & rendu,
  accessibilité, perf front, tests UI) émerge de jours RÉELS du programme, sans dupliquer un parcours
  existant ni recopier la colonne AI-Engineer ; promouvoir `announced → available`, ajouter les
  preuves de parcours, et prouver l'e2e module→jour→leçon→exercice→compétence→preuve + la distinction
  vs les autres parcours ; mettre à jour les tests de catalogue (availableIds) ;
- soit **CONFIRMER** qu'aucun tronc frontend distinct et cohérent n'émerge (couverture de fond
  insuffisante), le laisser annoncé, et **documenter définitivement** le blocker (matrice de
  couverture : quelles leçons/exercices frontend manquent). Aucun greenwashing.

**Objectif secondaire V36 — combler la couverture frontend de fond (SI nécessaire, qualité > quantité) :**
si — et seulement si — le CP0 démontre un trou réel (p.ex. DOM/événements, accessibilité, CSS
layout, rendu/état côté client), créer un **petit** nombre de leçons P3 **franchissables** (on-ramp +
prérequis rédigés + modèle mental + exemple guidé + erreurs fréquentes + à retenir + vocabulaire +
liens) et **relier** une pratique (exercice node-js déterministe : logique DOM/état simulée,
accessibilité — **jamais** de faux navigateur ni de rendu réel ; étiqueter SIMULATION si pertinent).
Réutiliser un exercice existant avant d'en créer.

**Objectif tertiaire V36 — accessibilité & responsive :** audit responsive/ARIA ciblé des pages
éditoriales et du workbench (rôles, labels, navigation clavier, contraste), correctifs **ciblés**,
PAS de refonte UI.

**Contraintes (inchangées)** : local, mono-utilisateur, sans auth/SaaS/réseau, sans dépendance
lourde, sans faux runtime (ni ML, ni navigateur simulé côté contenu), sans second moteur/base.
Réutiliser le Curriculum Graph comme auditeur et le mécanisme de composition non contigu.
`progress.json` sauvegardé puis restauré (gitignoré, jamais commité). Aucun secret, aucune fuite de
solution/test privé.

**Gates** : garder `v26→v35:check` actifs. Nouveau contrat → `v36:check` ciblé et testé. Attention
aux faux positifs du scan d'authoring (`à compléter`, `TODO`, `XXX`, `placeholder="…"`).

**Checkpoints** CP0→CP11 (audit → design ADR/HSD/TSD-036 → implémentation → tests → tsc → build →
validation navigateur → restauration progress → cleanup → commit → push), un commit par CP réellement
terminé, **pas de commit vide** (NO_COMMIT explicite si un CP ne requiert aucun changement). CP11
obligatoire : ré-audit + walkthrough néophyte du parcours frontend + matrice P0→P3 dans
`docs/PEDAGOGICAL-AUDIT-V36.md` + évolution chiffrée des warnings + évaluation du sprint
(FAIBLE/MOYEN/BON/FORT + VERDICT) + prompt V37 (sans démarrer).

**Critères de refus** : remplissage, jargon non introduit, fausse profondeur, gonflage de scores,
longueur = qualité, faux rendu/navigateur, greenwashing d'un parcours, contenu créé sans besoin réel.

**Livrable final** : `docs/SPRINT-V36.md` + synthèse française (existant / ajouté / corrigé / testé /
non testé / simulé / insuffisant), chiffres avant/après, dette restante, HEAD final.

**Commence maintenant par CP0. N'implémente rien avant d'avoir présenté le rapport CP0.**
