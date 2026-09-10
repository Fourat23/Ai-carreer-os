# V74 · CP7 — MOTEUR DE REMÉDIATION

> **Ce que le brief interdit, et qui commande tout le checkpoint :**
> *« Après un échec : ne pas simplement redonner la réponse. »*

---

## 1. Pourquoi donner la réponse trop tôt est un défaut MESURABLE, pas un défaut de goût

Le contrat gelé, §1.4, condition **R-b** : une tentative postérieure à l'ouverture de la
correction **ne vaut plus RÉCUPÉRATION**. Elle reste un contact significatif, jamais un rappel.

Donner la correction complète au premier échec n'est donc pas seulement une mauvaise
pédagogie : **cela détruit la seule mesure objective du produit.** Le CP0 avait établi que
l'exercice est le seul événement à verdict non déclaré ; répondre à chaque échec par la
solution reviendrait à convertir cet actif en lecture.

C'est la raison pour laquelle `CORRECTION_COMPLETE` est la **dernière** marche, et pourquoi un
test dédié vérifie qu'**aucun chemin, y compris un repli pour matière manquante, ne permet d'y
arriver avant le niveau 5**.

---

## 2. Le substrat, mesuré AVANT d'écrire la règle

Une marche de remédiation qui n'a de matière que sur quatre exercices n'est pas une marche,
c'est une décoration. `scripts/v74/cp7-remediation-substrat.mjs` (lecture seule) a donc mesuré
d'abord :

| ressource | couverture réelle |
|---|---|
| section « Modèle mental » | **128 / 128 leçons** |
| section « Erreurs fréquentes » | **128 / 128** |
| section « Exemple guidé » | **128 / 128** |
| section « Correction attendue » | **127 / 128** |
| section « Anti-patterns » | **51 / 128** |
| section « Exemple appliqué » | **39 / 128** |
| exercice voisin strictement plus simple, compétence commune | **331 / 376** (médiane **7** candidats) |
| exercice nommé par une misconception enregistrée | **121 / 376** |
| tests par exercice | médiane **3**, min **1**, max **7** |
| exercices sans aucun test public | **0** |
| tests sans nom | **0** |

Deux conséquences directes sur la conception :

- le **sous-problème** est la marche la plus solide du produit : 0 exercice sur 376 est
  dépourvu d'un test public nommé, donc il y a toujours un objectif réel à isoler ;
- les deux marches à couverture partielle (misconception 32 %, voisin plus simple 88 %) ont un
  **repli explicite**, et ce repli ne saute **jamais** à la correction.

---

## 3. Aucun quatrième moteur, aucun second registre

Le brief interdit de créer un quatrième moteur de révision. Deux vérifications :

- **`lib/remediation.mjs` ne définit aucune échéance de rappel.** Il rend un *délai de reprise
  de séance* (20 h), ce qui est autre chose : l'espacement des rappels reste la responsabilité
  de `INTERVALS` de V66, que la règle **C11** de `v651:check` garde ;
- **`lib/misconceptions.mjs` existait déjà** — 57 entrées, 18 compétences, `lessonRefs` et
  `exerciseRefs`, **0 référence fantôme** vérifiée par la sonde. Le CP7 la **consomme** au lieu
  d'écrire un registre concurrent. C'était la tentation évidente : rédiger sept indices sur
  mesure aurait été plus rapide que de brancher un registre existant.

Le module **n'écrit aucun contenu pédagogique**. Comme `lib/retrieval-task.mjs` au CP5, il
produit une **consigne** et un **pointeur** vers une section réelle, un test réel ou un
exercice réel. Le savoir reste dans les 128 leçons écrites par un humain.

---

## 4. L'échelle : sept actions, ordonnées par l'assistance qu'elles donnent

Le principe est de proposer **la plus petite aide qui puisse débloquer**, et de n'escalader que
sur la preuve que la précédente n'a pas suffi.

| niveau | condition | action | pourquoi celle-là |
|---|---|---|---|
| 1 | des tests passent déjà | `SOUS_PROBLEME` | il avance ; ce qui lui manque est un objectif, pas une aide |
| 1 | **zéro** test ne passe | `MODELE_MENTAL` | zéro test qui passe ne signale presque jamais un détail : c'est la forme du problème qui n'est pas tenue |
| 2 | — | `INDICE` | misconception enregistrée si elle existe, sinon « Erreurs fréquentes » |
| 3 | **avec** progression | `SOUS_PROBLEME` | il fait passer plus de tests qu'avant : on ne redescend pas l'échelle de quelqu'un qui progresse |
| 3 | **sans** progression | `EXEMPLE_ANALOGUE` | un raisonnement travaillé de bout en bout, sur un cas voisin |
| 4 | — | `EXERCICE_PLUS_SIMPLE` | la marche est trop haute : on en prend une plus basse sur la même notion |
| 5 et + | — | `CORRECTION_COMPLETE` | la réponse est due — **et elle arrive en dernier** |

**La misconception est préférée à la section quand elle existe** : elle *nomme* ce qui est
probablement cru à tort, là où une section renvoie à une liste à parcourir.

**Le voisin plus simple n'est pas le plus facile.** Avec une médiane de 7 candidats, choisir au
hasard serait un aléa déguisé en pédagogie, et choisir le plus facile enverrait quelqu'un
bloqué au niveau 4 vers un exercice de niveau 1 — décourageant et hors sujet. La règle est
**la difficulté la plus haute strictement en dessous**, puis le plus de compétences en commun,
puis l'identifiant. Le dernier critère n'est pas cosmétique : sans lui, deux exécutions
pourraient rendre deux voisins (critère **B2**).

---

## 5. Trois dérogations, et leur ordre EST la décision

### D1 · Outillage avant raisonnement — **et le niveau ne monte pas**

Si la tentative n'a pas atteint la phase `run` (`compile`, `timeout`), l'échec ne dit rien de
ce dont l'apprenant se souvient : le contrat §3.4 l'écrit déjà. L'action est un indice
d'outillage, et surtout **la série d'échecs ne s'incrémente pas**.

Sans cette exclusion, **trois points-virgules manquants suffiraient à faire donner la
correction complète.** Un test le garde.

### D2 · La correction déjà vue ferme l'échelle

`correctionSeen === true` → `TENTATIVE_DIFFEREE`. Proposer un indice à quelqu'un qui a la
réponse sous les yeux est du théâtre ; lui reproposer la correction ne lui apprend rien. Seule
une reprise à froid peut encore produire un signal — c'est le lien direct avec R-b.

### D3 · Le pilonnage

≥ **4 échecs en ≤ 20 minutes** → `TENTATIVE_DIFFEREE`, délai proposé **20 h** (« demain », pas
« dans dix minutes »). Passé un point, répéter dans la même séance n'est plus de
l'apprentissage, et donner la correction à quelqu'un qui pilonne produit une recopie.

**Mais la dérogation s'arrête au niveau de la correction.** Le report existe pour empêcher de
donner la réponse à quelqu'un qui pilonne ; **il ne doit pas devenir un moyen de ne jamais la
donner**. Un test vérifie que sept échecs serrés rendent bien la correction.

Cette borne est aussi ce qui empêche la boucle infinie que le CP13 ira chercher : le report ne
peut se répéter que tant que l'échelle n'est pas au bout, et l'échelle, elle, monte.

---

## 6. Le repli : une marche sans matière n'est pas un raccourci vers la réponse

Quand la marche nominale n'a pas de matière (pas de misconception, pas de voisin, pas de
section), le moteur **descend vers la marche disponible la plus proche**, jamais vers la
correction — qui reste réservée au niveau 5. La décision le dit dans sa `raison` (« repli : la
marche prévue n'a pas de matière sur cet exercice »).

Couverture effective par marche, mesurée par `scripts/v74/cp7-rattachement.mjs` :

| marche | matière disponible |
|---|---|
| niveau 1 · `MODELE_MENTAL` | **184 / 376 (49 %)** |
| niveau 2 · `INDICE` | **256 / 376 (68 %)** — dont misconception nommée 121/376 |
| niveau 3 · `EXEMPLE_ANALOGUE` | **184 / 376 (49 %)** |
| niveau 4 · `EXERCICE_PLUS_SIMPLE` | **331 / 376 (88 %)** |
| niveau 5 · `CORRECTION_COMPLETE` | **376 / 376** |
| exercices sans **aucune** marche adossée à une leçon ni à un voisin | **13 / 376 (3 %)** |

**Les 49 % ne sont pas un défaut du corpus des leçons — les sections existent sur 128/128.**
C'est le **rattachement exercice → leçon** qui plafonne : seuls **184 exercices sur 376**
(140 par déclaration unique + 44 par journée unique) se rattachent à une leçon sans ambiguïté.
Pour les 192 autres, pointer vers « la » leçon exigerait d'en choisir une parmi plusieurs —
c'est exactement ce que le contrat §3.4 refuse.

**Je ne corrige pas ce plafond au CP7, et c'est délibéré.** Le corriger voudrait dire enrichir
les `practiceRefs` des 128 leçons pour qu'un moteur de rétention trouve plus de matière —
c'est-à-dire **modifier le curriculum pour verdir une métrique de rétention**, ce que N1/N2 non
bloquants interdisent explicitement. C'est une **dette**, elle est nommée `D8`, et elle est
inscrite comme telle.

Pour ces exercices, le `SOUS_PROBLEME` reste disponible dans tous les cas — 0 exercice sur 376
est sans test public nommé.

---

## 7. ANOMALIE DE SONDE n° 7 — une mesure du CP1 était fausse, et elle l'était dans le sens qui m'arrangeait

En branchant le rattachement du CP7 sur la même règle que le produit, la sonde a rendu **140**
là où le CP1 avait publié **207**. Vérification faite, **c'est le CP1 qui avait tort.**

La sonde du CP1 comptait les exercices **déclarés par au moins une leçon** et les présentait
comme « rattachables », alors que la règle gelée exige **exactement une** leçon déclarante.
Les **67** exercices déclarés par 2 à 6 leçons étaient comptés du bon côté alors que le code
les écarte depuis toujours.

| | mesure CP1 | mesure réelle |
|---|---|---|
| rattachables par déclaration **unique** | 207 / 376 | **140 / 376** |
| **non** rattachables | 169 / 376 | **236 / 376** |
| dont déclarés par 2 à 6 leçons | *(non compté)* | **67** (`2→52 · 3→9 · 4→4 · 6→2`) |
| dont jamais déclarés | *(confondus)* | **169** |
| leçons candidates, via la journée | médiane 3, max 15 | **médiane 3, max 14** |

Trois choses à dire, dans cet ordre :

1. **aucun comportement de produit ne change.** `lib/learner-memory-server.ts` a toujours
   appliqué `slugs.size !== 1 → non rattaché`. Le code attachait déjà 140 exercices, jamais
   207. **C'est la mesure publiée qui était fausse, pas l'implémentation** ;
2. **la décision du CP1 en sort renforcée** : ce sont 236 exercices — et non 169 — qu'une
   équivalence automatique obligerait à trancher arbitrairement. Refuser l'option C était
   *encore plus* justifié que le chiffre ne le laissait croire ;
3. **c'est précisément pour cela qu'il faut le dire.** Une erreur de sonde qui va dans le sens
   de ma propre conclusion est celle qui a le moins de chances d'être découverte et le plus
   besoin d'être publiée. Le chiffre est corrigé dans le contrat gelé, dans le commentaire du
   code, et ici — **la RÈGLE, elle, n'est pas touchée.**

Ce que la sonde du CP1 mesurait : *la déclaration*. Ce qu'elle prétendait mesurer : *l'unicité
de la déclaration*.

---

## 8. Pureté et explicabilité

- **B2 · déterminisme.** Aucune I/O, aucune horloge lue, aucun aléa ; `now` et les ressources
  sont injectés. Deux tests : sortie strictement identique à entrée identique, et **aucune date
  fabriquée quand `now` est absent** (`reprendreApres` vaut alors `null` plutôt qu'une heure
  inventée).
- **B10 · explicabilité.** Toute décision porte `action`, `niveau`, `consigne`, `pointeur`,
  `minutes`, `raison` lisible, et `prochaine` — *ce qui suivrait si cette marche ne suffisait
  pas*. Un test parcourt les six niveaux et le vérifie sur chacun.
- **§9 du contrat.** Un test vérifie qu'**aucune consigne ne montre un score chiffré** à
  l'apprenant. Le moteur ne dit jamais « niveau de maîtrise 0,42 ».
- **Les minutes par action sont des ordres de grandeur DÉCLARÉS**, pas des mesures — aucune
  donnée d'apprenant réel n'existe pour les calibrer (contournement **G7**). Publiées et
  configurables ; elles serviront à l'arbitrage de budget du CP10.

---

## 9. Les quatre mutations qui ont été VUES rougir

Vingt-sept tests passant du premier coup est une raison de se méfier, pas de se réjouir. Chaque
règle décisive a donc été cassée volontairement, et le rouge observé :

| mutation | effet sur la suite |
|---|---|
| `NIVEAU_CORRECTION = 5` → `2` (la réponse arrive au 2ᵉ échec) | **7 tests rouges** |
| le repli sans matière saute à `CORRECTION_COMPLETE` | **1 test rouge** |
| un échec de compilation fait monter l'échelle | **2 tests rouges** |
| le voisin retenu devient le **plus facile** au lieu du plus proche | **1 test rouge** |

Toutes restaurées : **27 / 27**.

---

## 10. Ce qui n'est PAS fait au CP7, et le sera ailleurs

- **le branchement à l'interface** — le moteur est écrit et testé, mais l'apprenant ne le voit
  pas encore. C'est le **CP12**, et le critère bloquant **B12** l'exige : `READY` est interdit
  si le moteur n'est pas réellement utilisé par le produit ;
- **l'arbitrage de budget** entre remédiation et réactivation — **CP10** ;
- **la dette `D8`** (192 exercices sans leçon rattachable sans ambiguïté), qui plafonne deux
  marches à 49 %. Elle appartient au curriculum, pas au moteur de rétention.

---

## 11. Fichiers

**Créés** : `lib/remediation.mjs`, `lib/remediation.d.ts`, `lib/remediation-server.ts`,
`tests/v74-remediation.test.mjs` (27 tests), `scripts/v74/cp7-remediation-substrat.mjs`,
`scripts/v74/cp7-rattachement.mjs`, ce document.

**Modifiés** : `docs/v74/V74-RETENTION-CONTRACT-FROZEN.md` (correction de mesure §3.4, règle
inchangée), `lib/learner-memory-server.ts` (commentaire : chiffres corrigés).
