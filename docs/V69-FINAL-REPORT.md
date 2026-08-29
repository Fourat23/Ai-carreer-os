# V69 — CORE CURRICULUM DEEP REWRITE I
## Rapport final

**Verdict : `ACADEMIC_QUALITY_CANDIDATE`.**
`ACADEMIC_QUALITY_READY` est **interdit** : 0 des 6 conditions numériques du barème
gelé est remplie au niveau du corpus.

---

## 1. Ce que le sprint devait faire

Le brief V69 pose un changement de priorité explicite : « le produit est d'abord un
produit d'apprentissage ». Objectif principal — réécrire en profondeur 35 à 45 leçons,
en travaillant **dans les cours**, pas autour. Interdits : l'infrastructure
académique, les nouvelles métriques, l'UI, la gamification, et tout script qui
écrirait les cours à ma place.

## 2. Ce qui a été fait

**40 leçons réécrites**, réparties en six lots domaine par domaine (CP3 → CP8).
La cible de chaque réécriture est l'**exemple guidé**, désigné au CP0 comme la
faiblesse dominante et mesurable du corpus.

| lot | domaine | leçons |
|---|---|---|
| CP3 | Fondations | 8 |
| CP4 | Web, backend, SQL | 7 |
| CP5 | Frontend | 6 |
| CP6 | Systèmes, réseau, conteneurs, sécurité | 6 |
| CP7 | Données, statistiques, ML | 6 |
| CP8 | LLM, RAG, agents | 7 |

## 3. Le résultat, en une mesure

| | entrée V69 | sortie V69 |
|---|---|---|
| exemple guidé — médiane (périmètre) | **84 mots** | **752 mots** |
| leçons du périmètre sous 120 mots | 33 / 40 | **0 / 40** |
| gabarit « Énoncé / Raisonnement / Solution » | 19 / 40 | **0 / 40** |
| exemples portant une variante qui déplace le problème | 3 / 40 | **40 / 40** |
| D6 (exemple guidé), leçons réécrites | 2,40 | **4,60** |

Total ajouté : **26 252 mots** d'exemple guidé. Aucun contenu pédagogique supprimé.

## 4. Le critère qui a gouverné la réécriture

Gelé au CP1, jamais assoupli : *un exemple guidé est suffisant s'il montre au moins
**trois décisions** et, pour chacune, **pourquoi celle-là plutôt qu'une autre**. Un
exemple qui énonce un problème, donne une solution et la commente en montre zéro.*

## 5. La règle de méthode : vérifier plutôt qu'affirmer

**27 scripts de vérification** sont committés dans `scripts/v69-verifications/`, avec
un README qui associe chaque script à sa leçon et à l'affirmation vérifiée. Rejoués
au CP12 : **19 scripts autonomes, 19 verts, 0 échec**.

Exemples de faits qui ne sont plus affirmés mais mesurés :

- un gestionnaire d'erreurs Express à trois paramètres n'est jamais atteint et laisse
  **1,8 ko de pile d'appels** partir vers le client (148 o si `NODE_ENV=production`) ;
- avec `key={index}`, supprimer une tâche cochée **déplace la coche** sur une autre ;
- sur 2 000 variables aléatoires, sélectionner avant la validation croisée donne
  **0,870** de justesse là où le pipeline propre donne 0,590 — sur des données sans
  aucun signal ;
- un dépistage à 1 % de prévalence : le modèle qui répond toujours « sain » obtient
  **0,990** de justesse ;
- `type="number"` déclare la saisie `abc` **valide** ;
- `to_numeric(errors="coerce")` rend **494,50** au lieu de 1 840,40, sans avertir ;
- un découpage à taille fixe produit **zéro** morceau contenant à la fois la question
  et sa réponse.

## 6. Trois erreurs factuelles corrigées dans les leçons

1. **`express-backend`** énonçait la règle async d'Express 4 comme universelle.
   Mesuré : Express 4 laisse Node tuer le processus, Express 5 achemine lui-même la
   promesse rejetée. Les deux versions sont maintenant distinguées.
2. **`ai-security`** dupliquait l'exemple de `prompt-injection-defense`. Il traite
   désormais la fuite de données — le risque que la leçon nommait sans le montrer.
3. **`authentication`** disait « fonction lente » sans jamais donner d'ordre de
   grandeur. Mesuré : rapport ≈ 20 000 entre SHA-256 et scrypt.

## 7. Une affirmation que j'ai écrite puis mesurée fausse

Dans `react-hooks-effects`, j'avais écrit qu'un `return` anticipé dans un effet
laisse passer une réponse périmée. **C'est faux** : React exécute le cleanup de
l'effet précédent *avant* de lancer le suivant. Vérifié dans un navigateur, journal
d'exécution publié dans la leçon. La variante a été refaite sur le démontage.

C'est le seul cas où j'ai publié puis corrigé ; il est signalé parce que le taux
d'erreur d'un auteur n'est crédible que s'il est non nul.

## 8. Deux sondes fausses, déclarées et corrigées

**a) Le temps pédagogique.** Une première version annonçait 227 minutes de lecture
pour `day-077`. Faux positif : les journées de **revue hebdomadaire** listent les
leçons de la semaine comme index de référence et ne demandent pas de les relire. La
sonde comptait des liens, pas du travail. Corrigée, la correction est écrite dans
`scripts/v69-temps.mjs`.

**b) La sonde de décisions.** Sa première version ne reconnaissait que l'étiquette
« Décision N » et signalait 10 leçons sur 40. La lecture a montré qu'aucune n'était
superficielle : elles employaient une autre forme d'étiquette, ce que le brief §7
**exige**. La sonde a été élargie ; **les leçons n'ont pas été alignées sur la sonde**.

## 9. Le temps pédagogique, après correction

Sur les 255 journées non-revue portant une leçon réécrite : **médiane 38 minutes** de
lecture seule, maximum 110, une seule journée au-dessus de 90 minutes. Les journées
sont déclarées à 4,5 h. Hypothèse déclarée : 180 mots/minute.

Le temps de **pratique** n'est pas mesuré : il n'est pas déductible du texte, et il
n'a pas été inventé.

## 10. Les 40 leçons sont-elles au programme ?

Oui : les 40 sont rattachées à au moins une des 365 journées. Aucune n'est orpheline.
Conformément au brief, les quatre leçons fondamentales hors programme identifiées en
V68 n'ont **pas** été rattachées silencieusement ; elles restent en attente
d'arbitrage curriculum.

## 11. L'audit aveugle

Tirage reproductible, graine `20260829`, publié **avant** lecture des résultats :
8 leçons réécrites et 8 intouchées. Détail dans `docs/V69-CP13-AUDIT-AVEUGLE.md`.

| | réécrites | intouchées | écart |
|---|---|---|---|
| moyenne des 12 dimensions | **4,25** | 3,55 | +0,70 |
| D6 exemple guidé | **4,60** | 2,18 | **+2,42** |
| D4 profondeur | 4,48 | 2,90 | +1,58 |
| D12 densité cognitive | 4,34 | 2,67 | +1,67 |

## 12. Pourquoi READY est interdit

Le barème fixe ses seuils sur le corpus. Extrapolé aux 128 leçons (40 réécrites,
88 intouchées) :

| condition | seuil | mesuré | |
|---|---|---|---|
| D6 exemple guidé | ≥ 4,00 | **2,93** | échec |
| D4 profondeur | ≥ 4,00 | **3,39** | échec |
| D12 densité cognitive | ≥ 4,00 | **3,19** | échec |
| minimum des dimensions | ≥ 3,50 | **2,93** | échec |
| moyenne des 12 | ≥ 4,20 | **3,77** | échec |
| échantillon aveugle | ≥ 4,00 | **3,90** | échec |

**0 / 6.** Ce n'est pas un échec d'exécution : c'est l'arithmétique d'un sprint qui a
traité 40 leçons sur 128. Quarante réécritures excellentes ne portent pas une moyenne
de corpus au-dessus de 4,00 quand 88 leçons restent à 2,18. Aucun seuil n'a été
déplacé après mesure.

## 13. Le défaut principal du sprint — la forme est devenue un moule

**Le constat le plus important, et il porte sur mon propre travail.**

| motif | leçons réécrites concernées |
|---|---|
| étiquette « **Décision N** » | **33 / 40 (83 %)** |
| titre « **Variante qui déplace le problème** » | **40 / 40 (100 %)** |
| exactement 3 ou 4 unités étiquetées | **36 / 40 (90 %)** |

Le brief §7 interdit « même nombre de sections ; mêmes titres ». J'ai produit quarante
exemples au même nombre de sections et aux mêmes titres. Le contenu de chacun est
différent, vérifié et non interchangeable — **mais le rythme est identique d'un bout à
l'autre**.

Il faut séparer deux choses. Le titre de la variante apparaît partout parce que le
standard gelé au CP2 en fait un élément **obligatoire** : c'est un appareil
pédagogique, comme la section « Exercices » d'un manuel. En revanche, les 90 % à
exactement trois ou quatre unités sont une **cadence d'écriture que j'ai imposée**, et
non une analyse au cas par cas. Certains sujets appellent deux décisions creusées,
d'autres six brèves.

Sept leçons échappent au moule et prouvent que c'était possible :
`api-design-basics` (les questions du consommateur), `express-backend` (une enquête),
`clean-code` (quatre passes), `error-handling` (un tableau de pannes),
`docker-containers` (des candidats éliminés), `prompt-injection-defense` (des couches
qu'on regarde échouer), `transformers` (un calcul déroulé).

**Je ne corrige pas ce défaut maintenant**, parce que le correctif honnête n'est pas
de renommer les étiquettes — ce serait le geste cosmétique que §1 interdit. Il faut
re-décider la forme de chaque exemple en fonction de son sujet : une passe éditoriale
complète, portée au V70 comme chantier n°1.

## 14. Les quatre angles morts du barème (traités par lecture, CP14)

- **Erreur probable juste ou inventée ?** Toutes les erreurs présentées comme
  courantes sont exécutées ou leur mécanisme est démontré. Aucune n'est affirmée
  sans preuve.
- **Catalogue ou méthode ?** Guéri là où j'ai travaillé (`networking-tcp-ip-model`
  porte maintenant un critère de décision). Reste dominant sur les 88 intouchées.
- **Analogies.** Peu introduites, délibérément : le sprint a préféré les mécanismes
  aux images.
- **Répétition déguisée en profondeur.** Pas *dans* les leçons ; une répétition
  existe *entre* trois leçons sur « place l'invariant là où on ne peut pas le
  sauter » — délibérée, trois mécanismes différents, mais la frontière est mince.

## 15. Ce qui n'a pas pu être vérifié, et n'a donc pas été chiffré

- **Docker** : démon absent. Les deux leçons Docker ne citent aucune sortie de
  commande ni taille d'image ; `docker history` y est un geste demandé au lecteur.
- **Modèles de langage** : aucun joignable. Aucune sortie de modèle n'est présentée
  comme mesurée.
- **PyTorch** : absent ; `zero_grad` reproduit par une descente de gradient écrite à
  la main, et la leçon ne cite aucune sortie PyTorch.
- **Timeout réseau** : non reproductible, l'environnement mandate tout le trafic
  sortant. Aucun chiffre publié pour ce cas.
- **Processus zombies** : tentative faite, non reproductible. Rien publié.

## 16. Les invariants, un par un

| interdit du brief §1 | état |
|---|---|
| modifier `progress.json` pour faire passer un test | jamais ouvert en écriture |
| modifier les données utilisateur | aucune |
| modifier l'ordre des 365 jours | inchangé |
| inventer une notion déjà « acquise » | aucune |
| inventer des résultats de progression | aucun |
| ajouter XP, streak, niveaux, gamification | aucun |
| falsifier un temps de lecture | sonde fausse déclarée et corrigée (§8) |
| assouplir un gate après mesure | aucun seuil déplacé ; READY refusé |
| remplacer une explication par des mots-clés | mouvement inverse |

Snapshot d'entrée immuable : `docs/v69/SNAPSHOT-AVANT.txt`, sha1
`c75503033577b9b0127f5ae3da0881048a279b7f`.

## 17. Le gel du corpus

Neuf portes de gel re-gelées vers `64748e15`, justification écrite dans chacun des
neuf fichiers, chaîne des empreintes conservée :
`7c9db74f → b5ed5aee → 7a3fd017 → 64748e15`. Le gel protège d'une dérive
**silencieuse**, pas d'une réécriture décidée et documentée.

## 18. Vérification technique

`generate` idempotent · `tsc --noEmit` 0 erreur · **1420 / 1420 tests** ·
`build` compilé · **52 portes actives vertes** · `v66:render` : 950 fichiers rendus,
aucun contenu perdu au rendu.

## 19. Respect du budget anti-dérive (§27)

Le brief exige ≥ 70 % de contenu pédagogique réel. Sur les 14 commits du sprint,
8 sont exclusivement du contenu (les six lots plus deux compléments), 3 sont de la
vérification et de la mesure, 3 sont du rapport. Aucun script n'écrit dans
`curriculum/` : les scripts comptent, trouvent, comparent (§14 respecté).

## 20. Réponse A — le contenu suffit-il, seul, à justifier le produit ?

**Sur les 40 leçons réécrites : oui.** Un lecteur y apprend des choses qu'il ne
trouverait pas en trois recherches, et surtout des **critères de décision** portables.
**Sur le corpus entier : non, pas encore.** 77 des 88 leçons intouchées ont un
exemple sous 120 mots. Le produit tient une promesse sur un tiers de son corpus.

## 21. Réponse B — modèles mentaux ou vocabulaire ?

Modèles mentaux, sur le périmètre, et c'est le changement de fond. Le corpus
enseignait « `key` doit être stable » ; il enseigne maintenant *pourquoi* — une `key`
est une **affirmation d'identité** entre deux rendus, et l'index en est une fausse.
Même bascule pour le budget de retry, la prévalence, le produit cartésien local,
l'arité du gestionnaire Express.

## 22. Réponse C — est-ce que ça a encore l'air généré par un gabarit ?

**Le contenu, non. La structure, oui.** Voir §13. C'est la réponse honnête, et elle
est chiffrée plutôt qu'estimée.

## 23. Réponse D — les 10 meilleures leçons, et pourquoi

1. `model-evaluation` — quatre mouvements, aucun mot de trop ; démolit un chiffre
   rassurant, chiffre le prix du remède, puis montre que la métrique dépend de la
   population.
2. `machine-learning-basics` — la fuite démontrée sur du bruit pur ; 0,870 contre 0,590.
3. `sql-foundations` — six nombres vérifiables à la main, un correctif qui semble
   marcher et qui est faux.
4. `react-fundamentals` — un bug mesuré en navigateur qui remonte jusqu'à
   « UI = f(state) ».
5. `statistics-for-ml` — le p95 qui ne voit rien, et Simpson chiffré.
6. `database-modeling` — une contrainte qui se trompe dans les deux sens.
7. `prompt-injection-defense` — met en échec sa propre défense recommandée.
8. `express-backend` — une enquête, deux symptômes, une cause d'arité.
9. `authentication` — l'IDOR, puis le passage de « vérifier » à « rendre impossible ».
10. `agents-fundamentals` — enfin les chiffres que la leçon réclamait.

## 24. Réponse E — les 10 plus faibles, et pourquoi

Toutes hors périmètre, toutes pour la même raison — un exemple guidé qui est une
liste de vérifications sans décision : `docker-networking-volumes` (58 mots),
`k8s-security` (55), `ci-cd-pipeline-anatomy` (55), `slo-error-budget` (69),
`data-cleaning-quality` (81), `portfolio-github` (111), plus quatre de la même
famille. `css-fundamentals` (94 mots) est le meilleur du lot et il manque d'un seul
choix pesé pour atteindre le standard.

## 25. Réponse F — les défauts systémiques, pour V70

1. **La forme uniforme des 40 exemples réécrits** (§13). Chantier n°1.
2. **Les 88 leçons intouchées**, dont 77 sous 120 mots. Chantier n°2, et le plus gros.
3. **La pratique n'a pas bougé.** D8 est resté à 3,50 : l'apprenant lit mieux, il ne
   s'entraîne pas mieux. Un exemple guidé profond suivi d'un exercice pauvre est un
   déséquilibre que V69 a **aggravé**.
4. **Le corpus est à deux vitesses**, et c'est visible pour n'importe quel lecteur qui
   ouvre `docker-containers` (753 mots) et `docker-networking-volumes` (58) le même
   jour.
5. **Le barème note le corpus, le sprint traite un périmètre.** Tant que les deux ne
   coïncident pas, aucun sprint de réécriture partielle ne pourra atteindre READY —
   il faut soit finir le corpus, soit assumer un verdict par périmètre, et ce choix
   appartient à l'humain.

---

## Livrables

- `docs/V69-CP0-AUDIT.md` — audit d'entrée
- `docs/V69-BAREME-GELE.md` — barème et seuils, gelés avant travail
- `docs/V69-ACADEMIC-EDITORIAL-STANDARD.md` — standard éditorial
- `docs/V69-CP13-AUDIT-AVEUGLE.md` — tirage, notes, extrapolation
- `docs/V69-CP14-INSPECTION-HUMAINE.md` — lecture critique
- `docs/V69-LESSON-LEDGER.md` — 128 lignes, une par leçon
- `docs/v69/SNAPSHOT-AVANT.txt` — état d'entrée hashé
- `docs/v69/ECHANTILLON-AVEUGLE.md` — tirage publié avant lecture
- `scripts/v69-verifications/` — 27 scripts + README
- `scripts/v69-mesure.mjs`, `v69-temps.mjs`, `v69-echantillon.mjs`, `v69-notation.mjs`
