# V66 — Rapport final

**Sprint** : Retention Engine I + Academic Pedagogy Forensics + Flagship Lesson Hardening
**Base** : `7434974` (V65.1, `REFERENCE_READY`) · **Branche** : `claude/ai-career-os-saas-phfg49`
**Commits** : `536cf7d` · `3ec37c4` · `db9e513` · `1db72f0` · `71a3a33`

> Documents à lire avec celui-ci :
> `docs/V66-ACADEMIC-GRID-FROZEN.md` (grille et barème gelés avant mesure) ·
> `docs/audits/V66-CP0-AUDIT.md` (audit forensique) ·
> `docs/audits/V66-FLAGSHIPS.md` (inventaire du durcissement) ·
> `docs/audits/V66-CERTIFICATION.md` (les 25 questions + la question finale).

---

## I. La question du sprint, et la réponse

**1.** La question posée était : *les cours enseignent-ils réellement, ou sont-ils
des fiches techniques condensées pleines de mots-clés ?* Réponse mesurée :
**les deux, et on peut dire exactement lesquels.** Le corpus n'est pas homogène.

**2.** Trois familles éditoriales, mesurables sur les 128 leçons :
**A** condensée (71 leçons, noyau 239 mots, aucune structure interne),
**B** progressive (12), **C** sous-sections (45). L'hypothèse est **vraie pour
la famille A**, **fausse pour les 57 autres leçons**.

**3.** Le résultat le plus utile n'était l'hypothèse de personne : **le modèle
éditorial correct existait déjà dans le dépôt.** La règle 12 du brief
interdisait toute réécriture massive « sans preuve que le modèle éditorial est
correct » ; la preuve, ce sont les 12 leçons de famille B, mesurées et lues.

**4.** Ce qui est **faux** dans l'hypothèse de départ, et il faut le dire aussi
nettement : 91 % des journées ont un exemple guidé complet hors revues (99 % sur
le corpus), la densité de jargon marqué est basse (1,9 / 100 mots), les analogies
sont assorties de leur limite, et aucune affirmation fausse n'a été relevée.

**5.** Ce qui est **vrai, et plus grave qu'annoncé** : le contenu fourni couvre
**25 % des 4 h 30 annoncées** (médiane 67 min), et **267 journées sur 365** ne
chiffrent aucune activité. Le problème n'est pas que les cours soient courts :
c'est que le produit **ne dit pas ce que l'apprenant fait pendant 75 % du temps
qu'il annonce**.

---

## II. Ce que le CP0 a établi, en chiffres

**6.** Échantillon stratifié gelé AVANT toute lecture : 43 journées, 18/18
domaines, seed **20260828**, tirage déterministe sans `Math.random`.

**7.** Longueur des leçons : min 867 · médiane 1 122 · **max 1 524**. Aucune
leçon ne dépassait 1 524 mots, quel que soit le sujet. Un plafond de fait.

**8.** Uniformité : 47 signatures de plan pour 128 leçons ; **une seule en
couvre 42**, les trois premières en couvrent 80.

**9.** Charge réelle, modèle de conversion publié avant mesure et non réajusté :
lecture 18 min · réflexion 27 · rappel 10 · correction 5 · **exemple guidé 3** ·
énoncé de pratique 1. Total **67 min = 25 %** des 4 h 30.

**10.** Les 52 revues hebdomadaires fournissent **9 minutes de contenu, soit 3 %**
de leur durée annoncée. Une semaine sur sept, toute l'année.

**11.** Dégradation au fil de l'année : la correction explicative passe de
**100 %** (M1–M3) à **42 %** (M10–M12), pendant que le volume monte. Plus de
matière, moins de guidage, sur des sujets plus durs.

**12.** Le drapeau `detailed` de `program.json` ne correspond à **aucune**
différence mesurable : `true` 4 079 mots / 66 min, `false` 3 727 / 69 min.

**13.** Vocabulaire orphelin : **116 termes sur 778 (15 %)** listés en
Vocabulaire et absents du corps, dans **65 leçons sur 128**.

**14.** Le défaut de portée maximale : **0 lien vers le glossaire** depuis les
128 leçons, pour **711 entrées** disponibles avec traduction en langage simple.
Le vocabulaire était défini, jamais atteignable au point de blocage.

**15.** Walkthrough néophyte sur 10 leçons : **11 gaps bloquants**, tous en
famille A, **zéro** en familles B et C.

**16.** Test de compréhension (10 leçons × 3 questions, répondues uniquement
avec ce que le corpus enseigne) : **5 oui, 3 partiels, 2 non**. Les deux « non »
et deux des trois « partiels » sont de famille A.

**17.** Notation au barème gelé : **2,83 / 5**. Deux dimensions à 1 —
contre-exemples (D7) et honnêteté de la charge (D10). Une à 5 — honnêteté
académique (D12).

**18.** **Quatre faux positifs écartés avant publication**, dont un qui aurait
titré « 100 % des journées ont un acronyme jamais développé » : la règle cassait
sur les accents et lisait ÉTAT comme TAT. Le chiffre honnête est 53 %.

---

## III. Le Retention Engine I

**19.** Un seul fait est écrit : la **tentative de rappel** (concept, date
serveur, issue, forme). Exposition, historique, état et échéance sont des
**projections** recalculées depuis cette liste.

**20.** Conséquence voulue et vérifiée par le gate : **il n'existe aucune
commande capable de poser un état de rétention**. Un concept devient « retenu »
parce que trois réussites existent, à trois dates distinctes, étalées sur au
moins 21 jours — ou il ne le devient pas.

**21.** Espacement déterministe et publié : **1, 3, 7, 16, 35, 75, 160 jours**,
indexés par les réussites consécutives. Entiers, croissants, plafonnés à la durée
d'un cursus. Un échec ramène au premier palier sans effacer les réussites passées.

**22.** L'échéance se calcule depuis la **dernière tentative**, jamais depuis
« maintenant » : la rejouer six mois plus tard rend la même date.

**23.** Trois réussites le même jour comptent pour **une** date. Répéter dans la
journée ne consolide rien, et le modèle refuse de faire semblant.

**24.** Le concept est la **leçon** (128). Choix dérivé du corpus : c'est la plus
petite unité que le corpus traite comme une idée, elle porte des prérequis et un
rattachement aux compétences, et les journées s'y relient elles-mêmes. Les 711
entrées du glossaire auraient donné un grain plus fin et un moteur creux.

**25.** Entrelacement **dérivé du Curriculum Graph** : deux notions d'une même
compétence ne se suivent pas tant qu'une autre attend. Un concept sans compétence
forme sa propre famille — les fondre affirmerait une parenté que rien n'établit.

**26.** Cinq formes de rappel, chacune adossée à une section réelle des leçons.
Le gate vérifie sur les 128 leçons qu'aucune forme déclarée n'est morte et
qu'aucune leçon n'est privée de toute forme.

**27.** La surface `/retention` impose le geste : **la consigne d'abord, la
réponse après**. Les trois issues ne s'ouvrent qu'après « J'ai tenté ».

**28.** `lib/review.mjs` (V19) n'est ni supprimé ni remplacé. Il planifie une
JOURNÉE depuis la compréhension DÉCLARÉE ; le nouveau moteur planifie un CONCEPT
depuis des tentatives RÉELLES. Le gate vérifie qu'aucun des deux ne lit l'autre.

---

## IV. Le durcissement, et ce qu'il a coûté

**29.** Neuf leçons migrées vers le modèle de famille B. **66 journées
distinctes** du programme les enseignent. Noyau explicatif médian **128 → 430**
mots.

**30.** Test des mots-clés : **1 réussite sur 9 avant, 9 sur 9 après**. Test
Feynman sur cinq concepts : **1 sur 5 avant, 5 sur 5 après**. « Ce qu'un linter
fait » était littéralement inexplicable : le mot apparaît six fois dans `ci-cd`,
jusque dans sa checklist, et n'était défini ni dans les 128 leçons ni dans les
711 entrées du glossaire.

**31.** **Le défaut le plus grave du sprint, trouvé en lisant.** Dans
`rag-evaluation.md` — la leçon que **54 journées** enseignent — une clôture de
bloc de code échappée faisait disparaître **11 sections sur 18**, soit 3 509
caractères rendus en monospace brut. Aucune des 45 portes actives ne pouvait le
voir : toutes vérifiaient la source, aucune le rendu.

**32.** Le contrôle `v66:render` couvre désormais les **950 fichiers** du
curriculum, en les passant par le moteur de rendu réel du produit.

**33.** Deux erreurs de mesure commises en écrivant ce contrôle, conservées en
commentaire : la première accusait 17 fichiers innocents (des `##` à l'intérieur
de blocs de code, montrant du markdown) ; la seconde, « corrigée », est devenue
**aveugle au défaut d'origine**. C'est le test négatif qui l'a montré, pas la
relecture.

**34.** Neuf portes de gel du corpus ont rougi sur ces modifications, comme
prévu. Leur empreinte est regelée avec, dans chaque fichier, ce qui a changé et
le renvoi à l'inventaire. Le gel n'est pas assoupli — il a fait son travail.

---

## V. Le produit

**35.** **P0-1 fermé** : la première occurrence de chaque terme du glossaire dans
une leçon est désormais un lien vers sa définition (10 à 18 liens par leçon).
Jamais dans le code, jamais dans un titre, jamais dans un lien existant.

**36.** Le lien mène à la définition **ouverte** (`/glossary?terme=<id>`). Sans
ce paramètre, mille six cents liens auraient atterri sur un catalogue de 711
entrées où il aurait fallu rechercher le mot qu'on venait de cliquer.

**37.** Walkthrough navigateur réel : 6 routes × 5 largeurs (375 / 768 / 1024 /
1440 / 1920), axe-core injecté. **Deux défauts « serious »**, dont un
**antérieur à ce sprint et présent sur les 128 pages de leçon** : le rail de
phases n'avait aucun nom accessible en variante compacte — un lecteur d'écran
annonçait « lien » douze fois de suite. Après correction : **30 rendus, 0
débordement, 0 violation serious/critical.**

**38.** Le harnais d'intégrité (19 vérifications à travers l'API réelle) a trouvé
un défaut que la relecture du code n'aurait pas vu : sur une progression vierge,
`/retention` affichait « Nouveau 127 » **et** « 128 notions pas encore dans le
décompte » — les mêmes notions comptées des deux côtés, et la légende de la page
contredite par son propre nombre. Même faute que celle que V65.1 a passé un
sprint à supprimer. Les deux grandeurs sont désormais disjointes.

---

## VI. Ce qui reste ouvert, sans arrangement

**39.** **62 leçons de famille A ne sont pas touchées** (noyau médian 265 mots).
Neuf sur 71 ont été durcies. Le reste est identifié, mesuré, et non traité.

**40.** **PED-14 et PED-15 restent entiers** : 25 % du temps annoncé est décrit,
267 journées sur 365 ne chiffrent aucune activité, les 52 revues hebdomadaires
annoncent 4 h 30 pour 9 minutes de contenu. C'est la dette la plus lourde du
produit, et V66 ne l'a pas traitée.

**41.** **La métrique gelée `counterExample` reste à 0 %** après le durcissement,
et ce n'est pas un échec du travail : elle ne cherche une réfutation montrée que
dans une section « anti-pattern », alors que le durcissement les a placées dans
« Erreurs fréquentes ». La règle 4 interdisant de retoucher une mesure après
avoir vu son résultat, la métrique gelée n'a **pas** été élargie ; une mesure
NOUVELLE et nommée est publiée à côté :
**réfutation montrée — 1 leçon sur 128 avant, 10 sur 128 après.**

**42.** **Aucune conclusion de rétention n'est possible aujourd'hui.** Le moteur
est vérifié — déterminisme, reconstructibilité, refus de fabriquer un état — mais
il n'a jamais tourné sur des tentatives humaines réelles. Dire qu'il « améliore la
rétention » serait exactement le genre d'affirmation que ce sprint a passé son
temps à démonter.

---

## Verdicts

Les deux verdicts autorisés par le brief sont examinés séparément.

### `RETENTION_ENGINE_FOUNDATION_READY` — **prononcé**

Le moteur existe, il est pur, déterministe, reconstructible, branché sur une
surface réelle et sur l'API de commandes. Un état ne peut pas être fabriqué :
22 tests négatifs l'ont vérifié en cassant chaque règle séparément, dont deux
gardes protégeant le même invariant, cassées une à une. C'est une **fondation**,
au sens strict : elle ne prouve rien sur la rétention effective (point 42).

### `ACADEMIC_BASELINE_ESTABLISHED` — **prononcé, avec dette déclarée**

La règle de verdict gelée au CP1 fixait : moyenne < 3,0 → baseline établie avec
dette déclarée, l'énoncé du défaut publié en tête. Note mesurée **2,83 / 5**.
La dette s'énonce ainsi :

> Le corpus est exact, bien cadré et honnête, mais il **montre trop rarement
> l'erreur**, il **rend son propre vocabulaire inatteignable au point de
> blocage** — corrigé ce sprint — et il **annonce quatre fois plus de temps
> qu'il n'en décrit** — non corrigé.

### `ACADEMIC_QUALITY_READY` — **non prononcé**

Interdit par le brief sur la seule base de flagships, et de toute façon hors
d'atteinte : neuf leçons sur 128.

---

## Vérification finale

| | |
|---|---|
| Tests | **1 420 passent**, 0 échec |
| `tsc` | 0 erreur |
| Build | compilé |
| `gates:active` | **vert**, 46 portes |
| `v66:check` | 56 vérifications |
| Tests négatifs v66 | **22 vus échouer, 0 trou** |
| `v66:render` | 950 fichiers, 0 contenu perdu |
| `v66:integrity` | 19 vérifications via l'API réelle |
| Walkthrough | 30 rendus, 0 débordement, 0 violation serious |
| local == origin | oui · 0 fichier modifié · 0 stash · 0 serveur résiduel |
| `curriculum/` | `a2099b51…` → `e58ff1c4…` (10 fichiers, inventoriés) |
