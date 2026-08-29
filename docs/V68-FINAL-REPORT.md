# V68 — ACADEMIC CORPUS CLOSURE & DEEP LESSON QUALITY
## Rapport final

---

## 1. État git

| | |
|---|---|
| HEAD d'entrée | `e5ee4564efd432af00a265d31d563403a78b0e80` |
| HEAD de sortie | `8879e1cd6c254eb17adc8ec36afe29d73ef5a795` (+ ce rapport) |
| Branche | `claude/ai-career-os-saas-phfg49` |
| Commits | 12 |
| SHA-1 du corpus | `7c9db74f…` → **`7a3fd01729c0d01fde1edb3a0064dd21b5e7adfe`** |
| SHA-256 de `data/progress.json` | `73c1ee39…f1fc6e7a6` — **inchangé** |
| Leçons / journées / solutions | 128 / 365 / 365 — **inchangés** |

---

## 2. Leçons auditées sur 128

**32 lues au CP0** (échantillon d'audit tiré au sort avant toute lecture) : 14 en
intégralité, 18 par leurs sections décisives. **20 lues au CP13** (échantillon aveugle,
disjoint). **52 leçons lues sur 128, soit 41 % du corpus**, plus les sections décisives des
41 leçons traitées au CP8.

Les deux échantillons ont été **publiés avant toute modification**
(`docs/V68-SAMPLES-FROZEN.md`, commit `2d92477`), avec leurs seeds, leur méthode de tirage
et l'état du dépôt au moment du gel.

---

## 3. Leçons réellement réécrites

**42 leçons modifiées.**

- **41 leçons du parcours** qui n'avaient **aucune** correction en ont désormais une, qui
  nomme une erreur probable, explique **pourquoi elle séduit**, propose une alternative
  défendable et donne une vérification sans corrigé.
- **`metrics-percentiles`**, traitée intégralement au titre du P0.
- **25 leçons de l'étagère de référence** ont reçu un avertissement de tête (CP14).
- **6 leçons** ont vu leur section « Prérequis » complétée (CP11).
- **1 fichier de `scripts/data/`** corrigé, régénérant `day-233`.

Volume : le corpus passe de ~127 000 à **181 821 mots**. Médiane par leçon : 993 → **1 457**.

---

## 4. P0 / P1 / P2 / P3 avant et après

| | Défaut | Avant | Après |
|---|---|---|---|
| **P0** | `metrics-percentiles` : p99 faux d'un facteur 50 | 1 | **0** |
| **P0** | exige un calcul de percentile jamais enseigné | 1 | **0** |
| **P0** | `day-233` affirme un acquis Next.js inexistant | 1 | **0** |
| **P1** | leçons du parcours sans correction | 41 | **0** |
| **P1** | chaînes de prérequis vers une leçon inatteignable, sans avertissement | 6 | **0** |
| **P1** | leçons sans section de vérification muette | 124 | **86** |
| **P1** | termes du Vocabulaire jamais expliqués | 30 | **31** |
| **P2** | corrections plates (G2) | 37 | **37** |
| **P2** | contre-exemple explicite absent | 121 | **120** |
| **P2** | exemple guidé médian | 53 mots | **53 mots** |
| **P3** | `iac-fundamentals` : « Modules et réutation » | 1 | **0** |

**Les trois P0 sont fermés. Le P1 principal est fermé. Trois lignes n'ont pas bougé, et
elles sont déclarées en dette.**

Le compteur de termes non expliqués passe de 30 à 31 : les nouvelles corrections ont
introduit du vocabulaire, et une leçon supplémentaire est tombée sous la sonde. **C'est une
régression, petite mais réelle, et elle n'est pas maquillée.**

---

## 5. Résolution des 25 leçons hors parcours

Décidée **avec preuve** — non pas une opinion sur l'importance des sujets, mais le corpus
lui-même : six leçons **programmées** déclarent comme prérequis une leçon que l'apprenant
ne rencontrera jamais.

| Catégorie | Nombre | Décision |
|---|---|---|
| **A — fondamentale** | 4 | `deployment-strategies`, `release-incident-recovery`, `responsive-design`, `cloud-fundamentals`. **À programmer — décision escaladée.** |
| **B — profondeur utile** | 21 | Étagère de référence assumée et **annoncée dans le produit**. |
| **C — redondante** | 0 | Aucune ne duplique une leçon programmée. |
| **D — obsolète** | 0 | Aucune suppression. |

**Pourquoi les 4 de catégorie A n'ont pas été programmées.** La règle gelée exige une
journée dont le sujet est **déjà** celui de la leçon. Or aucun des 365 titres de journée ne
porte « déploiement », « release », « incident », « rollback », « responsive », « CSS »,
« cloud » ni « hébergement ». Les trois options — ajouter des journées, en remplacer,
rattacher malgré tout — sont hors du périmètre de V68. **La décision appartient au
propriétaire du curriculum et mérite son propre sprint.**

Ce qui a été fait à la place, et qui sert l'apprenant immédiatement : les six prérequis
portent l'essentiel en deux ou trois phrases et un avertissement explicite. **Le trou n'est
pas bouché ; il est rendu visible et franchissable.**

---

## 6. État final des familles C sans clôture

L'objet de la condition 1 de V67 — « 23 leçons de famille C privées de correction » — n'a
plus d'existence : la mesure pertinente est désormais la génération éditoriale.

| | Entrée V68 | Sortie V68 |
|---|---|---|
| G1 — correction profonde | 24 | **66** |
| G2 — correction plate | 37 | **37** |
| G3 — aucune correction | 67 | **25** |

**Les 25 sans correction sont exactement les 25 hors parcours.** Toute leçon que
l'apprenant rencontre au cours des 365 journées possède une correction qui nomme une
erreur probable.

---

## 7. Couverture cloud

Mesurée sur le texte des 365 journées, avec deux témoins de calibrage.

| | journées |
|---|---|
| Docker *(témoin — enseigné)* | 24 |
| Observabilité *(témoin — enseigné)* | 26 |
| Kubernetes | 4 |
| CSS | 3 |
| cloud (VPC, subnet, IAM) | **1** |
| IaC / Terraform | **1** |
| Next.js | **1** |
| FinOps | **1** |

La compétence `cloud` n'a **aucune** journée sur 365 : dix-neuf compétences se partagent
les 365 journées et `cloud` n'y figure pas. **Cinq compétences cloud sur les treize du
brief sont enseignées ; huit ne le sont pas.** Les quelques occurrences relevées sont des
mentions de passage — `day-078` écrit « subnet » sans l'expliquer, `day-104` et `day-107`
ne parlent de CSS que pour dire de ne pas s'y attarder.

Autres compétences orphelines confirmées : **Kubernetes, IaC (zéro mention sur 365), CSS,
Next.js** — 15 leçons au total.

---

## 8. Temps annoncé et activités

| | |
|---|---|
| Engagement annoncé | 1 642 h |
| Lecture mesurée (modèle gelé : 150 mots/min, 20 lignes de code/min) | 293 h |
| Part de lecture | **18 %** — médiane 16 % par journée |
| Violations de la condition 5 | **0** |

Le rapport de grandeur est cohérent pour un parcours d'ingénierie : les 82 % restants sont
de la pratique. **Mais ce n'est démontré qu'au niveau global.** Le CP6 aurait dû vérifier
journée par journée que ces 82 % correspondent à un travail réellement décrit et non à un
solde arithmétique. **Il ne l'a pas fait, et c'est une dette.**

---

## 9. Jargon contextualisé

| | Entrée | Sortie |
|---|---|---|
| Densité médiane de termes marqués (fenêtre de 3 lignes) | 8 | 8 |
| Leçons avec ≥1 terme du Vocabulaire jamais prononcé | 30 | **31** |

**D12 est la dimension qui n'a pas progressé, pour le deuxième sprint consécutif.** V67
l'avait déclarée « inchangée à 3/5 » ; la mesure de V68 montre qu'elle avait en réalité
**empiré** dans les leçons que V67 avait touchées (39 % contre 21 %). V68 a expliqué
`cardinalité` dans `metrics-percentiles` et introduit du vocabulaire ailleurs : **bilan
net légèrement négatif.**

---

## 10. Profondeur des exemples

| | Entrée | Sortie |
|---|---|---|
| Taille médiane de « Exemple guidé » | 53 mots | **53 mots** |
| p90 | 87 mots | 87 mots |
| Plus long | 61 mots | **438 mots** (`metrics-percentiles`) |

**Aucun progrès sur la médiane.** Une seule leçon a été refaite en profondeur, à titre de
démonstration : elle comporte une première tentative qui échoue (indexer la requête la plus
appelée), ce qu'elle coûte, pourquoi elle était raisonnable, l'observation qui retourne le
diagnostic (`0,99²⁰ = 0,82`, donc 1 % des requêtes fait 18 % des sessions dégradées), et un
enseignement qui dépasse le cas.

C'est la dimension la plus basse du barème (**D5 = 2,8**) et **elle n'a été traitée par
aucun sprint depuis trois versions**.

---

## 11. Qualité des exercices

- **42 leçons sur 128** possèdent une section de vérification dont les réponses ne sont pas
  adjacentes — contre **4** à l'entrée. C'est le progrès structurel le plus net du sprint
  sur l'apprentissage actif.
- **25 leçons sur 128** posent encore un exercice sans le corriger — exactement les 25 hors
  parcours.
- La progression de difficulté (reconnaître → expliquer → appliquer → diagnostiquer →
  transférer) reste partielle : les nouvelles vérifications couvrent bien « expliquer » et
  « diagnostiquer », rarement « transférer ».

---

## 12. Qualité des corrections

Le geste appliqué 41 fois, extrait des 24 leçons qui le pratiquaient déjà :

1. le raisonnement attendu ;
2. **l'erreur probable nommée** — celle que le lecteur fera vraiment ;
3. **pourquoi elle séduit** ;
4. comment la reconnaître la prochaine fois ;
5. une **alternative défendable**, quand il y en a une ;
6. une **vérification sans corrigé** — des critères, pas des réponses.

Exemples de ce que « pourquoi elle séduit » veut dire concrètement :

> Le piège séduit parce que **la migration vers JSON ressemble au travail**. C'est visible,
> mécanisable, et ça produit un diff satisfaisant. — `logging-structured`

> Le piège séduit parce que **le test EST réel** : la connexion s'établit vraiment, le
> cadenas s'affiche vraiment. Le défaut n'est pas dans le résultat mais dans l'échantillon :
> un seul client, et le plus équipé de tous. — `networking-http-tls`

> Le piège séduit parce que **chaque motif est individuellement correct**. C'est le mode de
> défaillance propre aux bonnes pratiques : elles s'ajoutent, leurs effets se multiplient.
> — `resilience-patterns`

**Reste 37 corrections plates (G2)** qui répètent le cours. C'est la dette principale.

---

## 13. Les 15 dimensions, avant et après

| # | Dimension | V67 | **V68 CP0** | **V68 final** | Seuil | Verdict |
|---|---|---|---|---|---|---|
| D1 | Vulgarisation | 4,0 | 4,0 | **4,4** | 4,20 | ✅ |
| D2 | Progression cognitive | 4,0 | 3,5 | **4,2** | 4,20 | ✅ |
| D3 | Profondeur explicative | 4,0 | 3,5 | **4,3** | 4,20 | ✅ |
| D4 | Modèles mentaux | 4,5 | 4,5 | **4,6** | 4,00 | ✅ |
| D5 | Exemples guidés | 4,0 | 2,5 | **2,8** | 4,00 | ❌ |
| D6 | Version incorrecte montrée | — | 1,5 | **2,2** | 4,00 | ❌ |
| D7 | Apprentissage actif | 3,5 | 2,0 | **3,6** | 4,00 | ❌ |
| D8 | Difficulté progressive | 3,5 | 3,0 | **3,4** | 4,00 | ❌ |
| D9 | Qualité des corrections | 3,5 | 2,5 | **4,1** | 4,00 | ✅ |
| D10 | Exactitude | 4,5 | 4,0 | **4,6** | 4,00 | ✅ |
| D11 | Cas professionnel | 4,0 | 4,0 | **4,2** | 4,00 | ✅ |
| D12 | Jargon contextualisé | 3,0 | 2,5 | **3,3** | 4,00 | ❌ |
| D13 | Transfert | 3,5 | 3,0 | **3,3** | 4,00 | ❌ |
| D14 | Honnêteté du contrat | 4,5 | 4,5 | **4,7** | 4,00 | ✅ |
| D15 | Cohérence d'ensemble | 4,0 | 3,0 | **3,6** | 4,00 | ❌ |

**Moyenne : 3,20 → 3,82.** Progression de **+0,62**. Seuil : 4,20. **Écart restant : 0,38.**

**Sept dimensions sur quinze restent sous 4,00.** La condition 5 échoue.

---

## 14. Résultat de l'échantillon aveugle

| | |
|---|---|
| Moyenne échantillon d'audit (32) | 3,82 |
| **Moyenne échantillon aveugle (20)** | **3,69** |
| Écart | **0,13** (seuil : ≤ 0,40) ✅ |
| Seuil absolu | ≥ 4,00 ❌ |

**L'écart de 0,13 est le résultat le plus important du sprint.** Il dit que les règles
dérivées au CP2 **généralisent** : appliquées à vingt leçons qui n'ont pas servi à les
écrire — dont six traitées sans savoir qu'elles étaient dans l'échantillon — elles
produisent presque exactement le même niveau. **V67 avait échoué précisément ici.**

Décomposition honnête de la moyenne aveugle :

| Sous-groupe | Moyenne |
|---|---|
| 8 leçons G1 | **4,25** — au-dessus du seuil |
| 7 leçons G2 | 3,8 |
| 5 leçons hors parcours (G3) | **3,1** — coûtent 0,22 point à elles seules |

**Le standard fonctionne partout où il a été appliqué. Il n'a pas été appliqué partout.**

---

## 15. Défauts trouvés par la lecture humaine que les sondes n'ont pas vus

1. **Le p99 faux.** Quinze portes vertes, 1 420 tests, et une leçon annonçait `p99 = 5 000 ms`
   sur un échantillon où il vaut 50 ms. Aucun automate ne pouvait le voir : le texte était
   bien formé, la section bien titrée, le chiffre plausible.
2. **L'acquis Next.js fantôme.** `day-233` disait « ton acquis Next.js du mois 3 ». Aucune
   journée n'enseigne Next.js. Trouvé en croisant deux mesures, jamais signalé par une porte.
3. **`ci-cd` est meilleure que sa classification.** Comptée G2 (correction plate), elle est
   la meilleure vulgarisation du corpus — elle définit `linter`, `build` et `pull request`
   pour qui ne les connaît pas. **La classification mesure la correction, pas la qualité.**
4. **`k8s-troubleshooting` enseigne un catalogue, pas une méthode.** Elle a tout ce qui se
   compte. Le lecteur sait quoi faire devant quatre symptômes nommés et rien devant le
   cinquième. Aucune sonde ne distingue cela.
5. **L'analogie dont la limite était promise.** `networking-addressing-routing` annonçait
   partir des « quartiers d'une ville » *en précisant vite ses limites*, puis employait
   « quartier » douze fois sans jamais en préciser aucune.
6. **Trouvé au navigateur, pas à la lecture** : une leçon de l'étagère de référence ne
   signalait rien à l'apprenant. Il ne pouvait pas savoir s'il l'avait manquée.

---

## 16. Dette restante, déclarée

1. **4 leçons de catégorie A non programmées** — décision de curriculum escaladée.
2. **8 compétences cloud sur 13 non enseignées** ; Kubernetes, IaC, CSS, Next.js orphelins.
3. **37 corrections G2** répètent le cours.
4. **25 leçons hors parcours sans correction** — assumées.
5. **L'exemple guidé reste à 53 mots médians.** D5 = 2,8, la dimension la plus basse, non
   traitée depuis trois sprints.
6. **D6 = 2,2** — 8 leçons sur 128 montrent une version fausse.
7. **D12 en léger recul net** — 30 → 31 leçons avec un terme jamais expliqué.
8. **Le temps annoncé n'est vérifié qu'au global**, pas journée par journée.
9. **Une erreur 404 sur `/lessons` à 375 px**, observée une fois, **non reproductible** au
   second passage. Signalée, pas expliquée.

---

## 17. Aucune donnée inventée

Chaque chiffre de ce rapport est reproductible par une commande publiée. Les calculs
arithmétiques ont été vérifiés par exécution, et non de tête :

| Affirmation | Vérification |
|---|---|
| `p99 = 50 ms` sur 99×50 ms + 1×5 000 ms | `python3` — rang le plus proche **et** interpolation linéaire |
| `0,99²⁰ = 0,82`, donc 18 % de sessions dégradées | `python3` |
| 99,9 % sur 30 j = 43,2 min ; 99,99 % = 4,3 min | `python3` |
| `/24` = 256 adresses, `/25` = 128, `/22` = 1 024 | `python3` |
| Timeout 2 s + 3 tentatives + backoff = 9 s | arithmétique explicitée dans la leçon |

**Deux sondes ont été écrites, puis écartées après vérification par lecture** —
`vocabulaireOrphelin` (annonçait 84 %, mesurait la coïncidence typographique) et
`exempleSansEchec` (repérait un champ lexical, pas une tentative). Elles sont conservées en
toutes lettres dans `scripts/v68-lecture.mjs` avec le détail de leurs faux positifs. **Aucun
chiffre issu de ces deux sondes n'apparaît dans ce rapport.**

---

## 18. Invariants

| Invariant | État |
|---|---|
| 365 journées, ordre inchangé | ✅ |
| 128 leçons | ✅ |
| 365 solutions | ✅ |
| `data/progress.json` — SHA-256 identique à l'entrée | ✅ |
| Aucune journée réordonnée ni supprimée | ✅ |
| Corrections de journée faites dans `scripts/data/`, jamais dans le fichier généré | ✅ |
| `npm run generate` idempotent — 795 fichiers | ✅ |
| Barème et seuils gelés, non modifiés après mesure | ✅ |

---

## 19. Portes, tests et validation

| Contrôle | Résultat |
|---|---|
| `npm run gates:active` | **52 portes vertes**, rc=0 |
| `npm test` | **1 420 réussis**, 0 échec |
| `npx tsc --noEmit` | rc=0 |
| `npm run build` | rc=0 |
| Tests négatifs V68 | **5/5 régressions détectées**, 2/2 aveuglements documentés |
| Navigateur — 6 pages × 5 largeurs | 30 vérifications |
| Débordement horizontal | **0/30** |
| axe-core sérieux/critique | **0/30** |
| 25 leçons hors parcours atteignables depuis `/lessons` | **25/25 — vérifié, pas affirmé** |

**Deux régressions de mon fait**, trouvées par les portes et corrigées à la source :
j'avais **remplacé** deux mini-exercices par des vérifications de compréhension (la porte
avait raison : faire et restituer ne sont pas la même chose), et mes deux nouvelles mentions
de `chmod 777` n'avaient pas de mise en garde dans la fenêtre de 160 caractères exigée. **La
sonde n'a pas été assouplie ; c'est le texte qui a été corrigé.**

**Le test négatif 2 mérite une mention.** V67 avait déclaré aveugle le scénario « correction
vidée de sa substance mais gardant son intertitre » — sa grammaire lisait des titres. **La
sonde de V68 le détecte**, parce qu'elle lit le corps et y cherche une erreur nommée.
L'instrumentation s'est réellement améliorée, et c'est mesuré, pas affirmé.

---

## 20. Verdict

### Les dix-sept conditions

| # | Condition | Seuil | Mesure | |
|---|---|---|---|---|
| 1 | Aucun P0 | 0 | 0 | ✅ |
| 2 | Aucune leçon fondamentale hors parcours sans justification | 0 | 4 **justifiées et escaladées** | ⚠️ |
| 3 | Aucune compétence majeure orpheline | 0 | **4** (cloud, K8s, IaC, CSS/Next.js) | ❌ |
| 4 | Aucune famille C incomplète sans justification | 0 | 0 | ✅ |
| 5 | Aucune dimension sous 4,0 | min ≥ 4,0 | **min 2,2** | ❌ |
| 6 | Moyenne globale | ≥ 4,20 | **3,82** | ❌ |
| 7 | Vulgarisation (D1) | ≥ 4,20 | 4,4 | ✅ |
| 8 | Progression (D2) | ≥ 4,20 | 4,2 | ✅ |
| 9 | Profondeur (D3) | ≥ 4,20 | 4,3 | ✅ |
| 10 | Pratique (D7) | ≥ 4,00 | **3,6** | ❌ |
| 11 | Corrections (D9) | ≥ 4,00 | 4,1 | ✅ |
| 12 | Échantillon aveugle | ≥ 4,00 | **3,69** | ❌ |
| 13 | Écart primaire / aveugle | ≤ 0,40 | **0,13** | ✅ |
| 14 | Temps honnête | vérifié par journée | vérifié **au global seulement** | ⚠️ |
| 15 | Aucune régression corpus / progress / 365 j | 0 | 0 | ✅ |
| 16 | Portes vertes | rc=0 | 52/52 | ✅ |
| 17 | Aucune donnée inventée | 0 | 0 | ✅ |

**Onze conditions passent. Quatre échouent. Deux sont partielles.**

### Verdict prononcé

# `ACADEMIC_QUALITY_CANDIDATE`

`ACADEMIC_QUALITY_READY` est **interdit** : les conditions 3, 5, 6, 10 et 12 échouent.

Le verdict d'entrée était déjà `CANDIDATE`. **Le sprint ne change donc pas l'étiquette — et
c'est une information à ne pas maquiller.** Ce qui a changé est mesurable :

- la moyenne passe de **3,20 à 3,82** (+0,62) ;
- **D9 franchit son seuil** (2,5 → 4,1) ;
- **D2, D3, D1 franchissent le leur** ;
- **l'échantillon aveugle ne décroche plus** (écart 0,13 contre le décrochage de V67) ;
- **les trois P0 sont fermés**, dont une erreur factuelle publiée sur la leçon dont c'était
  le sujet.

---

## 21. Les trois questions terminales

### A. « Si je prends une leçon au hasard et que je ne connais pratiquement rien au sujet, AI Career OS peut-il réellement ME L'ENSEIGNER ? »

**Oui pour 66 leçons sur 128. Partiellement pour 37. Non pour 25.**

Ce n'est pas une réponse de compromis, c'est la mesure. Sur une leçon G1, un débutant
comprend, se trompe, apprend **pourquoi** il s'est trompé, et dispose d'un critère pour
vérifier seul. La restitution simulée du CP13 le montre sans trou sur
`linux-filesystem-permissions`.

Sur une leçon G2, il comprend et ne peut pas savoir s'il a bien fait. Sur les 25 de
l'étagère, il comprend et n'a aucun retour.

**Et surtout : si la leçon est tirée parmi celles que l'apprenant rencontre réellement au
cours des 365 journées, la réponse est oui ou partiellement — jamais non.** Les 25 « non »
sont hors du parcours et l'annoncent désormais.

### B. « Est-ce désormais comparable à un bon cours structuré, ou toujours à une excellente fiche de révision ? »

**Les deux coexistent encore, et la frontière est nette.**

Ce qui relève du **cours** : les 66 leçons G1. Elles anticipent la pensée du lecteur,
nomment sa tentation, lui rendent le contrôle. Ce passage n'est pas une fiche :

> Le piège séduit parce que la résolution *ressemble* à une opération Git, alors que c'est
> une décision de code : on choisit ce que le programme doit faire, pas quelle version du
> texte garder. — `git-fundamentals`

Ce qui relève encore de la **fiche** : l'« Exemple guidé », partout. **53 mots médians, et
la valeur n'a pas bougé d'un mot depuis l'entrée.** C'est le dernier endroit du corpus où
l'on compresse au lieu d'enseigner, et c'est le principal reproche qui subsiste.

Verdict honnête : **le corpus est passé de « excellente fiche de révision » à « bon cours
dont les exemples restent des fiches ».** C'est un progrès réel et une insuffisance réelle.

### C. « Si l'interface disparaissait demain et qu'il ne restait que le contenu pédagogique, le projet aurait-il encore une valeur suffisante pour justifier son existence ? »

C'est la question que le brief désigne comme la plus importante. **Oui.**

Ce qui resterait : 181 821 mots, 128 leçons, 365 journées, 365 corrections. Soixante-six
leçons qui enseignent au niveau d'un bon cours écrit. Un corpus **cohérent** — les leçons se
citent, les prérequis forment une chaîne, les concepts se répondent d'un domaine à l'autre
(le moindre privilège de Linux revient dans Docker puis dans Kubernetes ; les percentiles
fondent les SLO ; l'idempotence relie l'API, la file de messages et le système distribué).

Ce qui aurait le plus de valeur, précisément : **les corrections.** On trouve partout des
cours qui expliquent le protocole DNS. On trouve beaucoup plus rarement un texte qui dit
*pourquoi baisser le TTL le matin d'une migration ne sert à rien*, et *pourquoi tout le
monde fait cette erreur*. Cette connaissance-là s'acquiert normalement en se trompant en
production, et elle est très peu écrite.

**Ce qui manquerait :** la programmation sur 365 jours — mais elle est dans les fichiers, pas
dans l'interface — et surtout la vérification. Sans produit, personne ne dit à l'apprenant
s'il a bien répondu ; c'est justement ce que les 42 sections « Vérifie seul, sans corrigé »
tentent de rendre indépendant du logiciel, en donnant des **critères** plutôt que des
réponses.

**La réponse honnête, sans complaisance : oui, et l'écart avec un livre technique bien fait
s'est réduit ce sprint, sans être comblé.** Ce qui justifierait l'existence du projet en
tant que texte seul, ce sont les 66 corrections. Ce qui l'en empêche encore, ce sont les 53
mots de l'exemple guidé.

---

## 22. Ce qu'un V69 devrait faire, dans l'ordre

1. **L'exemple guidé.** 53 mots médians, D5 = 2,8, aucune amélioration depuis trois sprints.
   `metrics-percentiles` (438 mots, avec une tentative qui échoue) est le modèle. C'est le
   plus gros gisement de points restant.
2. **Les 37 corrections G2.** Le geste est écrit, extrait et démontré 41 fois. Il reste à
   l'appliquer.
3. **La décision de programme sur les 4 leçons de catégorie A**, et plus largement sur les
   compétences cloud/K8s/IaC/CSS/Next.js. Ce n'est pas un sprint de durcissement.
4. **D6 — la version fausse crédible.** 8 leçons sur 128. `vector-databases` et `css-flexbox`
   sont les modèles.
5. **D12.** Deux sprints sans progrès, et un léger recul. Traiter les 31 termes un par un,
   pas au compteur.
