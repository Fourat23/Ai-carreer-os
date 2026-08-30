# V71 — Contrat académique gelé

**Gelé au CP1, avant toute réécriture.** Empreinte du corpus au moment du gel :
`edbfecdff1d3e4c320cedd51ede95601fd94750d`. Commit CP0 : `1fb8ea6`.

Les ancres, les seuils et les conditions de verdict ci-dessous **ne bougent plus**.
Aucune mesure postérieure ne peut les assouplir. Si un résultat est mauvais mais
correct, le mauvais résultat est publié.

---

## 1. Règle fondatrice : une sonde ne note pas

> **Aucune note D1→D14 ne peut être produite par un script, une expression régulière,
> une statistique ou la présence d'une section.**

Une note exige d'avoir **lu** le contenu correspondant. Le ledger porte, pour chaque
leçon, un champ `lu` qui vaut `oui` uniquement si le texte de la leçon a effectivement
été lu dans la session qui l'a notée.

Les sondes servent à **détecter, prioriser, comparer, contrôler une assertion, calculer
une distribution**. Elles ne servent jamais à conclure.

Corollaire opposable au CP15 : si le nombre de leçons réellement lues est inférieur à
128, le verdict `ACADEMIC_QUALITY_READY` est **interdit**, quels que soient les autres
résultats.

### Ce que « lire » veut dire, précisément

Lire une leçon, au sens de ce contrat, c'est avoir pris connaissance de :
le problème d'ouverture · l'objectif · les prérequis · le modèle mental · le noyau
explicatif · l'exemple guidé · la ou les pratiques · la ou les corrections · le
transfert professionnel s'il existe.

Les sections d'appoint (vocabulaire, checklist, questions d'entretien, liens avec le
programme) peuvent être parcourues. Elles n'entrent dans aucune note à elles seules.

---

## 2. Les quatorze dimensions

Reprises **mot pour mot** du brief V71. Aucune n'est ajoutée, aucune retirée, aucune
fusionnée.

| # | dimension | ce qu'elle mesure |
|---|---|---|
| D1 | Exactitude technique | affirmations correctes, contextualisées, non trompeuses |
| D2 | Prérequis et progressivité | n'exige pas silencieusement des concepts non enseignés |
| D3 | Objectif pédagogique | on comprend ce que l'apprenant saura faire à la fin |
| D4 | Modèle mental | construit une représentation permettant de raisonner au-delà d'un exemple |
| D5 | Vulgarisation | un débutant sérieux comprend sans le vocabulaire d'un senior |
| D6 | Profondeur explicative | pourquoi, comment, conséquences, limites, arbitrages |
| D7 | Exemple guidé | expose le raisonnement, les décisions, les erreurs possibles |
| D8 | Pratique active | produire, transformer, diagnostiquer, construire, corriger, décider |
| D9 | Correction pédagogique | explique comment parvenir au résultat et traite les erreurs probables |
| D10 | Transfert professionnel | relié à une situation réaliste, quand c'est pertinent |
| D11 | Charge cognitive | densité, longueur et ordre adaptés au niveau visé |
| D12 | Autonomie | les consignes permettent de travailler sans deviner les attentes |
| D13 | Vérification de compréhension | exige une restitution révélant si la notion est comprise |
| D14 | Qualité éditoriale | cohérent, lisible, non mécanique, non répétitif |

---

## 3. Ancres 0 → 5, par dimension

L'ancre décrit **ce qu'il faut observer dans le texte** pour attribuer la note. Une note
se justifie par un fait citable, jamais par une impression.

Barème général :
**5** excellent, aucune correction substantielle · **4** bon, améliorations mineures ·
**3** utilisable mais pédagogiquement insuffisant par endroits · **2** faiblesse sérieuse
empêchant un apprentissage autonome fiable · **1** largement inadéquat · **0** absent,
faux ou inutilisable.

### D1 — Exactitude technique
- **5** — aucune affirmation fausse ; les affirmations dépendantes d'une version ou d'un
  contexte le disent ; les chiffres sont sourcés ou mesurés.
- **4** — exact, mais une ou deux formulations universelles là où le contexte compte.
- **3** — exact sur le fond, avec une simplification qui deviendrait fausse si on la
  généralisait, et qui n'est pas signalée comme telle.
- **2** — une affirmation importante trompeuse, ou un chiffre invérifiable présenté comme
  un fait.
- **1** — plusieurs affirmations fausses.
- **0** — le cœur technique de la leçon est faux.

### D2 — Prérequis et progressivité
- **5** — les prérequis sont nommés, renvoient vers des leçons existantes situées **avant**
  dans le parcours, et tout autre concept employé est construit dans la leçon.
- **4** — un concept non enseigné apparaît, mais il est explicitement signalé comme
  périphérique.
- **3** — un concept non enseigné est utilisé sans être signalé, mais le passage reste
  compréhensible sans lui.
- **2** — un concept non enseigné est **nécessaire** pour suivre un passage.
- **1** — plusieurs, ou un prérequis renvoie vers une leçon située après.
- **0** — la leçon est illisible au point du parcours où elle est placée.

### D3 — Objectif pédagogique
- **5** — l'objectif énonce une **capacité observable** (« choisir X en justifiant »,
  « diagnostiquer Y »), et la leçon la travaille effectivement.
- **4** — objectif clair mais formulé en connaissances (« connaître X ») plutôt qu'en
  capacités, alors que la leçon fait travailler une capacité.
- **3** — objectif présent, plus large que ce que la leçon couvre réellement.
- **2** — objectif vague (« comprendre X ») sans indication de ce qui compte.
- **1** — objectif décoratif, sans rapport net avec le contenu.
- **0** — absent.

### D4 — Modèle mental
- **5** — la leçon donne une représentation qui permet de **raisonner sur un cas non
  traité** : un critère, une question à se poser, une image dont la limite est dite.
- **4** — modèle présent et juste, mais peu réutilisé ensuite dans la leçon.
- **3** — le modèle est une reformulation de la définition, pas un outil de raisonnement.
- **2** — analogie sans limite explicite, ou modèle qui induit en erreur hors du cas
  présenté.
- **1** — aucune représentation, seulement des faits.
- **0** — absent, ou analogie fausse.

### D5 — Vulgarisation
- **5** — chaque terme technique important est **compréhensible au moment où il apparaît**,
  par ce que la leçon en dit, sans recours au glossaire.
- **4** — un ou deux termes reposent sur une glose courte plutôt que sur une explication.
- **3** — plusieurs termes sont définis mais non expliqués : on sait ce que le mot désigne,
  pas ce qu'il change.
- **2** — un passage central suppose un vocabulaire que la leçon n'a pas donné.
- **1** — la leçon s'adresse manifestement à quelqu'un qui connaît déjà le sujet.
- **0** — inintelligible pour le niveau visé.

**Précision opposable.** Un sigle est introduit s'il est développé à sa première
occurrence **et** si son rôle est dit. « TTL = Time To Live » vaut **2** ; expliquer ce
que la valeur contrôle, qui la lit, et ce que change sa diminution, vaut **4 ou 5**.

### D6 — Profondeur explicative
- **5** — la leçon dit pourquoi le problème existe, comment la solution agit, ce qu'elle
  coûte, quand elle **ne** s'applique pas, et comment choisir entre deux options
  plausibles.
- **4** — quatre de ces cinq éléments.
- **3** — deux ou trois : typiquement le quoi et le comment, sans le quand-pas ni
  l'arbitrage.
- **2** — une suite de définitions correctes sans mécanisme ni conséquence.
- **1** — énumération de termes.
- **0** — absent.

**Précision opposable, ajoutée au vu du constat CP0.** Un noyau explicatif constitué de
paragraphes ouvrant sur `**Terme.**` suivi d'une définition **peut** atteindre 4 s'il
donne pour chaque terme le mécanisme et la conséquence. Il est plafonné à **3** s'il
n'énonce que des définitions, quelle que soit leur justesse, et quelle que soit la
qualité de l'exemple guidé qui suit — celui-ci est noté en D7, pas ici.

### D7 — Exemple guidé
- **5** — on suit une situation, une observation, des hypothèses, un critère de choix, la
  décision, l'exécution, la vérification et les limites. Les titres n'ont pas d'importance ;
  le raisonnement doit être **perceptible**.
- **4** — le raisonnement est là mais un maillon manque (souvent la vérification ou les
  limites).
- **3** — l'exemple montre une solution correcte et la commente, sans exposer d'alternative
  écartée.
- **2** — l'exemple est une correction déguisée : énoncé, solution, fin.
- **1** — extrait de code sans narration.
- **0** — absent.

**Longueur : hors critère.** `git-fundamentals` obtient 5 avec 353 mots. Aucun minimum
n'est fixé, ici ni ailleurs dans ce contrat.

### D8 — Pratique active
- **5** — production observable, contexte, contraintes, livrable nommé, critère de réussite
  vérifiable par l'apprenant seul, et la compétence travaillée est bien celle du cours.
- **4** — les cinq éléments sauf un, sans que l'exercice devienne ambigu.
- **3** — production demandée mais critère de réussite absent ou invérifiable seul.
- **2** — la consigne contient sa propre solution, ou l'exercice ne travaille pas la
  compétence annoncée.
- **1** — exercice de restitution seul (« qu'est-ce que X ? », « cite… »).
- **0** — aucune pratique.

### D9 — Correction pédagogique
- **5** — permet à l'apprenant de situer **où son raisonnement a divergé** : indice décisif,
  fausse piste crédible et sa raison d'échec, vérification, généralisation.
- **4** — trois de ces quatre éléments.
- **3** — explique la bonne réponse et pourquoi elle marche, sans traiter d'erreur probable.
- **2** — donne la réponse avec une justification minimale.
- **1** — donne la réponse.
- **0** — absente.

**Précision opposable, ajoutée au vu du constat CP0.** Une correction qui **réexplique le
cours** au lieu de corriger l'exercice est plafonnée à **3**, quelle que soit sa longueur.
La longueur n'entre pas dans cette note.

### D10 — Transfert professionnel
- **5** — la leçon montre où la notion se rencontre réellement, et ce qu'elle change dans
  la décision de quelqu'un qui travaille.
- **4** — transfert présent et concret, mais sans conséquence de décision.
- **3** — mention réaliste mais générique.
- **2** — cas manifestement fabriqué pour cocher la case.
- **1** — aucun ancrage.
- **0** — sans objet **et** non signalé comme tel.

**Règle de non-applicabilité.** Certaines leçons n'ont pas de transfert professionnel
distinct de leur pratique (algorithmique élémentaire, syntaxe de base). D10 y est notée
**NA**. Une NA est **exclue du calcul** de la moyenne de la leçon et de la moyenne de la
dimension ; elle n'est jamais convertie en 5 ni en 0. Le nombre de NA par dimension est
publié au CP15.

**Règle opposable.** L'absence de section « Cas professionnel » n'implique pas une note
basse : le transfert peut vivre dans l'exemple guidé. D10 se note sur le **contenu réel**.

### D11 — Charge cognitive
- **5** — l'ordre des notions permet de lire linéairement sans revenir en arrière ; la
  densité est adaptée ; rien d'essentiel n'arrive après ce qui en dépend.
- **4** — un passage dense, mais signalé ou compensé.
- **3** — le modèle mental ou l'explication arrive **après** l'exigence qu'ils éclairent.
- **2** — le lecteur doit lire la correction pour comprendre le cours.
- **1** — accumulation sans hiérarchie.
- **0** — illisible.

### D12 — Autonomie
- **5** — un apprenant seul sait quoi faire, avec quoi, jusqu'où, et comment savoir qu'il a
  fini.
- **4** — une ambiguïté mineure, levable par bon sens.
- **3** — le format attendu du livrable est à deviner.
- **2** — plusieurs interprétations mènent à des travaux différents.
- **1** — la consigne suppose un encadrant.
- **0** — inexploitable seul.

### D13 — Vérification de compréhension
- **5** — la leçon exige une restitution, une décision ou une production **qui révèle** si
  la notion est comprise, et l'apprenant peut se juger seul.
- **4** — vérification présente mais partielle.
- **3** — vérification réduite à une checklist déclarative (« je sais faire X »).
- **2** — seule la correction permet de savoir si on avait compris.
- **1** — rien qui distingue « j'ai lu » de « j'ai compris ».
- **0** — absent.

### D14 — Qualité éditoriale
- **5** — la leçon se lit comme un texte écrit pour ce sujet-là ; pas de répétition
  interne ; le rythme sert le propos.
- **4** — quelques longueurs ou une formule de remplissage.
- **3** — cadence perceptiblement identique à celle de plusieurs leçons voisines.
- **2** — répétition interne de contenu, ou remplissage mécanique.
- **1** — texte manifestement produit en série.
- **0** — inexploitable.

---

## 4. Défauts : P0 / P1 / P2 / P3

| priorité | définition | exemples |
|---|---|---|
| **P0** bloquant | rend la leçon fausse ou inutilisable | information fausse importante, correction incorrecte, prérequis impossible, exercice impossible, contradiction interne, livrable incohérent avec la consigne |
| **P1** grave | empêche un apprentissage autonome fiable | raisonnement absent, leçon incompréhensible au niveau visé, exemple réduit à une solution, correction inutilisable, pratique qui ne fait pas pratiquer la compétence |
| **P2** important | dégrade nettement l'apprentissage | vulgarisation insuffisante, cas métier pauvre, progression imparfaite, charge cognitive mal répartie, jargon prématuré, répétition interne |
| **P3** mineur | éditorial | formulation, clarté locale, répétition légère |

**Règle d'ordre opposable :** on corrige P0, puis P1, puis P2. **Aucun P3 ne peut être
corrigé tant qu'un P1 subsiste**, sauf si la correction P3 est un effet de bord gratuit
d'une correction P1 sur la même leçon.

**Correspondance note → défaut**, pour éviter qu'un défaut soit noté deux fois de façon
incohérente : une dimension à **0 ou 1** implique au moins un P1 ; D1 à 0 ou 1 implique un
P0.

---

## 5. Seuils agrégés — gelés

Calculés sur les 128 leçons, en excluant les NA du dénominateur de leur dimension.

| # | agrégat | seuil |
|---|---|---|
| S1 | moyenne du corpus sur les 14 dimensions | **≥ 4,00 / 5** |
| S2 | moyenne de **chaque** dimension | **≥ 3,70** |
| S3 | leçons de moyenne < 3,00 | **0** |
| S4 | leçons de moyenne < 3,50, programmées au parcours | **≤ 3** |
| S5 | P0 ouverts | **0** |
| S6 | P1 ouverts non justifiés | **0** |
| S7 | leçons réellement lues | **128 / 128** |
| S8 | notations D1→D14 complètes | **128 / 128** |
| S9 | écart moyen \|ledger − audit aveugle\| sur l'échantillon de 32 | **≤ 0,40** |
| S10 | leçons où l'écart individuel dépasse 1,00 | **≤ 4** |
| S11 | invariants (128 / 365 / 365, `progress.json`, mapping des jours) | **inchangés** |
| S12 | `gates:active`, `npm test`, `tsc --noEmit`, `npm run build` | **tous verts** |

**Justification des niveaux, écrite avant de mesurer.** S1 est fixé à 4,00 et non à 4,20
parce que la grille V71 comporte quatre dimensions absentes des barèmes précédents (D3,
D11, D12, D13) et que rien ne permet de supposer le corpus déjà bon sur elles. S2 est
fixé à 3,70 pour interdire qu'une dimension faible soit compensée par les autres. S9 et
S10 encadrent l'écart aveugle dans les deux sens : moyenne **et** dispersion.

---

## 6. Verdicts

Trois valeurs, et trois seulement.

**`ACADEMIC_QUALITY_READY`** — les douze seuils S1→S12 sont atteints.

**`ACADEMIC_QUALITY_CANDIDATE`** — S5 (aucun P0), S7, S8, S11 et S12 sont atteints, et il
reste au plus **deux** seuils non atteints parmi S1, S2, S3, S4, S6, S9, S10.

**`ACADEMIC_QUALITY_NOT_READY`** — tous les autres cas. En particulier : un seul P0
ouvert, ou moins de 128 leçons lues, suffit.

Le verdict est le **résultat** de la mesure. Il n'est pas l'objectif du sprint.

---

## 7. Règles anti-Goodhart

Interdit, quel qu'en soit l'effet sur une note :

1. ajouter du texte sans valeur pédagogique ;
2. multiplier les sections ;
3. répéter une définition ;
4. fabriquer un exemple ou un cas professionnel pour cocher une case ;
5. dupliquer une pratique ;
6. renommer un titre pour satisfaire une sonde ;
7. ajouter du vocabulaire sans explication ;
8. **déplacer un seuil après avoir vu le résultat** ;
9. diluer une difficulté dans du texte ;
10. contourner une porte ;
11. transformer une analyse statique en « lecture » ;
12. compter une section présente comme une dimension validée.

**Règle de longueur.** Le nombre de mots n'entre dans **aucune** des quatorze notes. Si
250 mots enseignent mieux que 800, on garde 250. `git-fundamentals` (353 mots d'exemple
guidé) est la référence opposable à tout réflexe d'allongement.

**Règle de correction de sonde.** Une sonde ne se corrige que si l'on **démontre** qu'elle
mesure autre chose que ce qu'elle prétend, la démonstration étant écrite dans le script
avec un extrait réel. Les deux chiffres — avant et après correction — sont publiés.

---

## 8. Protocole de notation

1. lire la leçon au sens du §1 ;
2. situer sa position dans le parcours (journées où elle est enseignée, ou hors parcours) ;
3. attribuer D1→D14, ou NA quand la règle du §3 D10 s'applique ;
4. écrire une justification courte mais substantielle, citant un fait du texte ;
5. classer les défauts en P0/P1/P2/P3 ;
6. décider : **CONSERVE** (aucune modification), **RETOUCHE** (correction ciblée),
   **RÉÉCRIT** (section reconstruite) ;
7. inscrire la ligne au ledger, avec `lu = oui`.

**Une leçon notée sans avoir été lue est une faute de protocole**, pas une approximation.
Elle doit être retirée du ledger, pas ajustée.

---

## 9. Ce que ce barème ne sait pas faire

Écrit d'avance, pour que le rapport final ne prétende pas le contraire.

- Il ne mesure pas si un apprenant réel apprend : il mesure si le texte lui en donne les
  moyens.
- Il ne distingue pas une erreur plausible **juste** d'une erreur plausible **inventée**
  dans une correction.
- Il ne sait pas si un exercice annoncé pour deux heures en demande réellement deux.
- Il ne détecte pas une répétition **déguisée** — reformulée plutôt que recopiée.
- Il ne juge pas la pertinence d'un sujet dans le programme, seulement la qualité de son
  enseignement.
- La note D14 sur le clonage de rythme est la plus subjective des quatorze ; l'audit
  aveugle du CP13 est là pour la contrôler.

---

## 10. Interdits de périmètre

V71 ne touche pas à : `data/progress.json` · l'ordre et le mapping des 365 journées ·
l'interface · le système de design · toute fonctionnalité sans rapport direct avec la
qualité académique. Les 25 leçons hors parcours sont **auditées et corrigées** comme les
autres, et **jamais rattachées** — le rattachement est une décision de curriculum,
recommandée au CP15, non appliquée.
