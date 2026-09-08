# V71 — RAPPORT FINAL

**Certification académique et passe de qualité profonde des 128 leçons**
Branche `claude/ai-career-os-saas-phfg49` · checkpoints CP0 → CP15 · 2026-08-30 → 2026-09-08

---

## 1. Résumé exécutif — en français simple

Vous m'avez demandé une chose précise : **prouver, en lisant, que les 128 leçons de ce
programme sont réellement bonnes pour quelqu'un qui ne connaît pas encore le sujet.** Pas
compter des mots. Pas passer des tests automatiques. Lire.

Voici ce qui a été fait, sans arrondir.

**Les 128 leçons ont été lues une par une.** Pas échantillonnées, pas survolées : lues, avec
une grille de 14 critères fixée à l'avance et jamais modifiée ensuite. Trente-deux d'entre
elles ont été lues **deux fois**, la seconde fois sans regarder les notes de la première, pour
voir si je me contredisais moi-même. Je me suis contredit sur 10,5 % des cases, et chaque
contradiction a été tranchée **en faveur de la seconde lecture**, jamais de la première.

**Quarante-huit défauts ont été trouvés et corrigés.** Vingt-quatre graves (un exercice qui ne
travaille pas ce que la leçon enseigne, un prérequis enseigné trop tard, un chiffre faux),
quatorze moyens, dix mineurs. Il n'en reste aucun d'ouvert dans ces trois catégories.

**Quatre-vingt-douze affirmations chiffrées du corpus ont été exécutées**, pas relues :
scripts Python, base de données réelle, serveur HTTP local. Trois étaient fausses. **Les trois
avaient été écrites par moi pendant ce sprint**, pas par le corpus d'origine. Elles sont
corrigées et le script qui les vérifie est dans le dépôt.

**Les garde-fous automatiques ont été testés à l'envers.** Cinquante-deux contrôles sont verts,
mais un contrôle vert peut vouloir dire « tout va bien » ou « je ne regarde rien ». J'ai donc
cassé le dépôt exprès, quatorze fois, chaque fois avec le défaut précis qu'un contrôle prétend
attraper. Les quatorze l'ont attrapé. Chaque fichier a été restauré à l'octet près.

**La note finale est de 4,94 sur 5.** Les douze seuils fixés avant de mesurer sont tous
atteints. Le verdict formel est donc `ACADEMIC_QUALITY_READY`.

**Et pourtant ma réponse à votre question est « oui, avec réserves ».** Pas par prudence
rhétorique — pour cinq raisons concrètes, chiffrées, listées en section 21 et reprises à la
fin. La principale : **c'est moi qui ai lu, moi qui ai corrigé, et moi qui ai noté.** Aucun
regard extérieur n'a validé ce travail. Un dispositif d'audit à l'aveugle a été monté pour
réduire ce biais, il a effectivement trouvé quelque chose — mais il ne remplace pas quelqu'un
d'autre.

Le reste de ce rapport détaille chacun de ces points, y compris ceux qui ne m'arrangent pas.

---

## 2. Ce qu'était la mission — et ce qu'elle n'était pas

**La question posée**, textuellement : « Est-ce qu'un humain qui ne connaît pas encore
correctement le sujet peut réellement apprendre avec cette leçon ? »

**L'ordre de priorité imposé** : contenu > pédagogie > pratique > correction > progression >
moteur > interface.

**Ce que le cahier des charges interdisait explicitement** : toucher à `progress.json`, à
l'état utilisateur, à l'ordre des 365 jours, au mapping du curriculum, à l'interface, au
système de design ; ajouter une fonctionnalité sans rapport direct avec la qualité académique.
V71 = contenu académique. Pas de redesign, pas de nouveau moteur, pas de fonctionnalité
spectaculaire.

**Ce que ces interdictions ont coûté**, et c'est important pour lire la suite : deux défauts
réels trouvés au CP14 n'ont **pas** été corrigés parce que les réparer aurait voulu dire
modifier le mapping du curriculum (section 18). Ils sont documentés et transmis.

**Une règle qui a structuré tout le sprint** : la longueur n'est pas une métrique de qualité.
La leçon `git-fundamentals` sert de référence opposable — elle est courte et elle est
excellente. Une mauvaise leçon reste mauvaise avec 2 000 mots.

---

## 3. La méthode — ce que « lire » veut dire ici

C'est le point sur lequel il ne faut pas me croire sur parole, alors voici exactement ce qui a
été fait.

**Une sonde ne peut pas attribuer une note.** C'est écrit dans le contrat gelé et cela a été
tenu : chaque note des 128 leçons vient d'une lecture, et chaque note porte une justification
écrite qui cite le texte de la leçon. Les sondes automatiques ont servi à **ordonner la
lecture** — « regarde ces 32 leçons d'abord » — jamais à conclure.

**Ce que ça donne concrètement.** La sonde de redites du CP13 signale 32 leçons. J'en ai lu
22 hors échantillon : **14 confirment le défaut, 8 ne le confirment pas**. Si j'avais fait
confiance à la sonde, j'aurais dégradé huit leçons sans raison. Ce rapport ne contient aucune
note attribuée par une machine.

**Le test Feynman.** Après avoir lu une leçon, je la réexplique **sans y revenir**, et je note
où ça casse. Une leçon dont on ne peut pas restituer le cœur n'a pas enseigné. Quinze
restitutions écrites pendant l'audit aveugle sont publiées dans le rapport du CP13. Une seule
a buté sur un manque réel (section 15).

**Les corrections ont été écrites, pas signalées.** Quand un défaut demandait une phrase, la
phrase a été écrite dans la leçon. Le ledger enregistre le défaut, la correction, la
dimension touchée et la note avant/après.

---

## 4. Le contrat gelé : 14 dimensions, 12 seuils, 3 verdicts

Tout a été fixé au checkpoint 1, **avant la première lecture**, et n'a pas bougé.

**Les quatorze dimensions.** D1 exactitude · D2 prérequis · D3 objectif · D4 modèle mental ·
D5 vulgarisation · D6 profondeur · D7 exemple guidé · D8 pratique · D9 correction ·
D10 transfert · D11 charge cognitive · D12 autonomie · D13 vérification · D14 qualité
éditoriale. Chacune a une ancre écrite pour chaque niveau de 1 à 5.

**Les douze seuils** figurent en section 8, avec leur résultat.

**Les trois verdicts**, et leur définition exacte, citée du contrat :
- `ACADEMIC_QUALITY_READY` — les douze seuils S1→S12 sont atteints.
- `ACADEMIC_QUALITY_CANDIDATE` — S5, S7, S8, S11, S12 atteints, et au plus **deux** seuils non
  atteints parmi les autres.
- `ACADEMIC_QUALITY_NOT_READY` — tous les autres cas.

Et la phrase qui compte le plus : **« Le verdict est le résultat de la mesure. Il n'est pas
l'objectif du sprint. »**

**Interdit pendant tout le sprint** : modifier le barème, déplacer un seuil après avoir
mesuré, ajouter du texte sans valeur pédagogique, renommer une section pour satisfaire un
contrôle automatique.

---

## 5. Le déroulé, checkpoint par checkpoint

| CP | objet | état |
|---|---|---|
| CP0 | gel forensique de l'état de départ, empreintes des 128 leçons | fait |
| CP1 | contrat académique : 14 ancres, 12 seuils, 3 verdicts — **gelés** | fait |
| CP2 | standard humain, archétypes pédagogiques, échantillon aveugle tiré et figé | fait |
| CP3 | **lecture et notation des 128 leçons**, 16 lots | fait |
| CP4 | corrections fondations et systèmes — 5 P1 | fait |
| CP5 | corrections frontend — 3 P1 de prérequis | fait |
| CP6 | web, backend, SQL, données — le P1 de pratique | fait |
| CP7 | ML, IA appliquée, LLM, RAG, agents — 8 corrections | fait |
| CP8 | les quatre derniers P1 → **P1 = 0** | fait |
| CP9 | les 14 P2 → **P2 = 0** | fait |
| CP10 | passe transversale sur la pratique (grille R/E/D/P/T) + les 10 P3 | fait |
| CP11 | vulgarisation, jargon, prérequis, continuité | fait |
| CP12 | vérification factuelle **exécutable** | fait |
| CP13 | **audit aveugle** de 32 leçons et contre-notation | fait |
| CP14 | portique technique, invariants, budget-temps, **tests négatifs** | fait |
| CP15 | ce rapport | fait |

Un incident de session (perte du conteneur le 2026-09-05) a été traité par une reprise
forensique documentée : aucun reset destructif, aucun force-push, aucune reconstruction « de
mémoire ». L'état a été repris depuis Git et les fichiers persistés.

---

## 6. Le résultat global de la notation

| | |
|---|---|
| leçons lues | **128 / 128** |
| leçons notées sur les 14 dimensions | **128 / 128** |
| cases notées (128 × 14) | **1 792** |
| **moyenne du corpus** | **4,9364 / 5** |
| leçon la plus basse | **4,714** (`api-design-basics`, `linux-resources-io`) |
| leçon la plus haute | 5,000 |
| leçons sous 4,00 | **0** |
| leçons sous 3,00 | **0** |

**Distribution des 1 792 cases** : 1 679 à 5 · **112 à 4** · **1 à 3** · aucune à 2 ou 1.

**Ce chiffre demande une mise en garde, et je la donne avant que vous ne la formuliez.** Une
moyenne de 4,94 sur un barème de 1 à 5 est un chiffre qui ne discrimine presque plus. C'est le
principal problème de ce ledger et il est de deux origines :

1. **Le corpus était déjà bon au départ.** Le CP3 a trouvé des défauts dans 43 leçons sur 128 —
   soit 85 leçons sans aucun défaut à la première lecture. Ce n'est pas un corpus qu'il fallait
   sauver, c'est un corpus qu'il fallait vérifier.
2. **Les défauts trouvés ont été corrigés**, ce qui a fait remonter mécaniquement les notes.

Le CP13 a été conçu précisément pour tester si ce 4,94 était mérité ou complaisant. Sa réponse
est en section 15 : **partiellement complaisant, sur un point précis, et le ledger a été baissé
en conséquence** (4,9554 → 4,9364).

---

## 7. Le résultat par dimension

| dimension | moyenne | leçons sous 5 |
|---|---|---|
| D1 exactitude | 4,953 | 6 |
| D2 prérequis | **5,000** | 0 |
| D3 objectif | 4,969 | 4 |
| D4 modèle mental | 4,992 | 1 |
| D5 vulgarisation | 4,969 | 4 |
| D6 profondeur | 4,891 | 14 |
| D7 exemple guidé | 4,992 | 1 |
| D8 pratique | 4,984 | 2 |
| D9 correction | **5,000** | 0 |
| D10 transfert | 4,813 | 24 |
| D11 charge cognitive | 4,883 | 15 |
| D12 autonomie | 4,961 | 5 |
| D13 vérification | 4,969 | 4 |
| **D14 qualité éditoriale** | **4,734** | **33** |

**Les trois points bas sont interprétables, et ils ne disent pas la même chose.**

**D14 (4,734) — la qualité éditoriale.** C'est la découverte du CP13 : dans 33 leçons, deux des
sections d'ouverture disent la même chose, parfois mot pour mot. Détail en section 15. **Ce
chiffre est un plancher, pas une valeur** : il est plus bas en réalité, et je peux dire de
combien (section 15).

**D10 (4,813) — le transfert.** 24 leçons à 4. Le transfert demande que la leçon fasse
appliquer la notion à un cas que l'apprenant n'a pas vu. C'est l'exigence la plus difficile
d'un cours écrit, et c'est normal que ce soit là que ça plafonne.

**D11 (4,883) — la charge cognitive.** 15 leçons à 4, toujours pour la même raison : une
densité réelle de notions nouvelles par page (`git-advanced` couvre sept sujets au jour 1 du
parcours ; `react-accessibility` enchaîne neuf sous-sections avant le premier exemple). Dans
tous les cas, l'ordre est linéaire et chaque section autonome, ce qui compense — d'où 4 et
non 3.

**D2 et D9 sont à 5,000 partout**, et ce n'est pas gratuit : D2 (prérequis) était la dimension
la plus dégradée au CP3 et c'est celle qui a reçu le plus de corrections (CP4, CP5, CP11).

---

## 8. Les douze seuils, un par un

Fixés au CP1, **avant** toute lecture. Jamais modifiés.

| # | seuil | exigence | mesure | verdict |
|---|---|---|---|---|
| **S1** | moyenne du corpus | ≥ 4,00 | **4,9364** | ATTEINT |
| **S2** | moyenne de **chaque** dimension | ≥ 3,70 | **min 4,734 (D14)** | ATTEINT |
| **S3** | leçons de moyenne < 3,00 | 0 | **0** | ATTEINT |
| **S4** | leçons < 3,50 programmées au parcours | ≤ 3 | **0** | ATTEINT |
| **S5** | P0 ouverts | 0 | **0** | ATTEINT |
| **S6** | P1 ouverts non justifiés | 0 | **0** | ATTEINT |
| **S7** | leçons réellement lues | 128 / 128 | **128 / 128** | ATTEINT |
| **S8** | notations D1→D14 complètes | 128 / 128 | **128 / 128** | ATTEINT |
| **S9** | écart moyen ledger ↔ audit aveugle | ≤ 0,40 | **0,0759** | ATTEINT |
| **S10** | leçons à écart individuel > 1,00 | ≤ 4 | **0** | ATTEINT |
| **S11** | invariants (128/365/365, `progress.json`, mapping des jours) | inchangés | **inchangés** — avec une réserve, ci-dessous | ATTEINT |
| **S12** | `gates:active`, `npm test`, `tsc --noEmit`, `npm run build` | tous verts | **52/52 · 1420/1420 · 0 · compilé** | ATTEINT |

**Les douze sont atteints.**

**Deux seuils demandent un commentaire honnête plutôt qu'une coche.**

**S9 est un test faible par construction, et je l'ai su après l'avoir mesuré.** Une note de
leçon est la moyenne de 14 dimensions ; un désaccord d'un point sur une dimension déplace la
moyenne de la leçon de 0,071 seulement. Pour faire échouer S9 (0,40), il faudrait que l'audit
aveugle contredise le ledger sur **près de six dimensions par leçon**. S9 exclut donc que le
ledger soit une invention ; il n'exclut pas qu'il soit systématiquement trop généreux sur un
point. C'est exactement ce qui s'était produit. Le chiffre informatif n'est pas S9, c'est
l'accord case par case : **89,5 %** (section 15).

**S11 est atteint mais partiellement invérifiable ici.** `data/progress.json` est de l'état
utilisateur, ignoré par Git, et **il n'existe pas dans ce conteneur**. Il n'a donc pas pu être
muté — mais le contrôle qui prétend le geler à une empreinte précise tombe dans sa branche de
rattrapage et émet un **avertissement**, pas une erreur. Autrement dit, « 52 contrôles verts »
recouvre ici un invariant qui n'a pas pu être positivement vérifié. Le test négatif n° 14 du
CP14 montre que ce contrôle fonctionne dès que le fichier existe.

---

## 9. Ce qui a été corrigé — les défauts graves (P1)

Le CP3 n'a trouvé **aucun P0** (défaut qui rend une leçon inutilisable ou dangereuse). Il a
trouvé **24 P1**, répartis sur les CP4 à CP8. Tous fermés. Quelques exemples représentatifs.

**Un exercice qui ne travaille pas la compétence enseignée.**
`sql-performance-indexing` enseigne `EXPLAIN`, en fait son premier geste (« ne devine JAMAIS
pourquoi une requête est lente : demande son plan ») et **ne le fait jamais exécuter**. Son
unique exercice, 57 mots, renvoyait à un exercice externe qui corrige un problème de requêtes
répétées par un dictionnaire en mémoire : ni index, ni plan, ni base de données. Corrigé au
CP6. Et vérifié pour de bon au CP12 : le plan passe bien de `SCAN t` à
`SEARCH t USING INDEX idx_cat (cat=?)` sur une table de 20 000 lignes.

**Des prérequis enseignés après avoir été utilisés.** Plusieurs leçons s'appuyaient sur une
notion programmée plus tard dans les 365 jours, sans le dire. Deux traitements possibles :
retirer la dépendance, ou l'assumer en la nommant. Les deux ont été utilisés selon le cas.
Exemple du second : `technical-storytelling` cite `technical-documentation` — la notion utile
est désormais donnée en une phrase sur place, et la leçon citée est **annoncée comme
programmée huit jours plus tard**, avec la mention que rien ici ne suppose qu'on l'a lue.

**Un trou de curriculum fermé.** Le CP11 a trouvé une référence, parmi 31, qui restait
formulée comme si la leçon citée était déjà connue. C'est la dernière.

---

## 10. Ce qui a été corrigé — les défauts moyens (P2) et mineurs (P3)

**14 P2**, tous traités au CP9. Type dominant : un chiffre juste dans son calcul mais mal
arrondi ou mal étiqueté. Exemple : `cloud-finops` présentait une colonne de facture dont la
somme des lignes arrondies donne 1 884 € quand le total annoncé est 1 885 €. Aucune conclusion
n'était inversée, mais un apprenant qui refait le calcul conclut que **son** travail est faux.

**Une incohérence entre deux leçons**, trouvable seulement en lisant l'une contre l'autre :
`react-composition-architecture` (jour 104) donnait comme corrigé modèle un inventaire où
« chargement » et « erreur » sont deux états séparés — la forme exacte que
`react-application-states` (jour 95) démontre être « fausse, pas maladroite : fausse ». Cette
découverte mérite d'être retenue pour une raison de méthode : **le barème D1→D14 ne pouvait pas
la voir**, puisqu'il note une leçon lue seule. Elle vient de la lecture suivie, pas de la
grille.

**10 P3**, traités au CP10.

**Le solde au 2026-09-08 : P0 = 0 · P1 = 0 · P2 = 0.** Les 14 P3 encore ouverts sont ceux
trouvés au CP13 et volontairement non corrigés (section 18).

---

## 11. La passe transversale sur la pratique (CP10)

Les 128 leçons ont été repassées sur une grille R/E/D/P/T : la pratique **R**eprend-elle la
compétence annoncée, l'**E**nnoncé est-il exécutable, le livrable est-il **D**éfini, la
**P**ratique produit-elle quelque chose, y a-t-il de quoi se **T**ester seul ?

**Ce qui s'est passé de plus utile n'est pas le résultat mais l'outil.** La sonde a été jetée
**trois fois** avant d'être juste : d'abord elle comptait les sections de renvoi comme des
pratiques (121 leçons « conformes », donc inutile) ; puis elle excluait tous les blocs marqués
🛠️ et jetait de vraies pratiques ; puis elle excluait les corrections et manquait le bloc
« Vérifie seul » présent dans 66 leçons sur 128. La version retenue est documentée avec ses
trois versions abandonnées, dans `scripts/v71/pratique-redpt.mjs`.

**Résultat.** Des critères de réussite explicites ont été écrits là où ils manquaient, en
formulant **ce qui doit être vrai** plutôt que ce qu'il faut faire. Trois exemples réels :
« si tu classes les cinq du même côté, tu n'as pas encore compris que la dérive peut venir des
deux directions » ; « s'il ne peut plus **rien** faire, tu t'es trompé quelque part, il reste
toujours quelque chose » ; « la réussite n'est pas *il a compris* mais **il a reformulé sans
employer un seul de tes termes techniques** ».

---

## 12. Vulgarisation, jargon, prérequis, continuité (CP11)

**Le résultat principal de ce checkpoint est un aveu.** Mes sondes ont produit
**185 signalements. 168 étaient des faux positifs — 91 %.** Six corrections réelles en sont
sorties.

**Pourquoi.** La première sonde de jargon repérait les mots en capitales pour trouver les
acronymes. En JavaScript, la limite de mot `\b` est ASCII : sur un texte français accentué,
« SUPÉRIEUR » se coupe en deux et produit le faux acronyme `RIEUR`, « QUALITÉ » produit
`QUALIT`. 121 leçons sur 128 signalées, donc rien. Réécrite à partir du glossaire du projet
lui-même, la sonde a produit 34 candidats — dont **31 encore faux**, parce qu'elle exigeait la
forme développée anglaise alors que l'ancre demande la **compréhensibilité**, et que le corpus
explique en français.

**Ce que ça dit du corpus** : il est plus propre que mes outils ne le supposaient.

**Corrections réelles** : les quatre lettres d'ACID avec ce que chacune achète
(`sql-foundations`) ; une explication du RAG au jour 1 réécrite en langage courant
(`terminal-shell-filesystem`) ; MRR développé avec son rôle et l'avertissement de collision
avec l'autre MRR du glossaire (`rag-evaluation`) ; numpy introduit en deux phrases là où il est
requis pour la première fois (`statistics-for-ml`).

**Une limite du glossaire est consignée pour V72** : il porte un terme par entrée. Les champs
`senses` et `isAmbiguous` existent dans le code (`lib/glossary-core.mjs`) et sont utilisés par
**zéro** des 711 entrées. Deux de mes propres ajouts ont d'ailleurs été **refusés** par
`glossary:check` (doublon de terme, collision d'alias) : le contrôle avait raison, et j'ai
retiré mes ajouts plutôt que d'affaiblir le contrôle.

---

## 13. La vérification factuelle exécutable (CP12)

Principe : **ne pas croire un chiffre parce qu'il paraît plausible.** 92 affirmations du corpus
ont été exécutées.

**Comment**, sans réseau sortant ni base installée : Python + numpy pour les mathématiques ;
`node:sqlite`, intégré à Node 22, pour le SQL ; un serveur HTTP local pour les affirmations
HTTP. Deux scripts rejouables : `scripts/v71/cp12-assertions.py` et
`scripts/v71/cp12-sql-http.mjs`.

**Exemples de ce qui a été vraiment exécuté.** L'évanouissement du gradient : 0,25 puissance 20
donne bien 9,1 × 10⁻¹³. Deux couches linéaires sans activation : le rang du produit est bien
3 et non 8. XOR sans couche cachée : les quatre sorties se figent bien à 0,500 après 200 000
itérations. Le coût quadratique des transformers : ×62 500 entre 512 et 128 000 unités.
L'empreinte mémoire d'un index vectoriel : 614 400 000 octets exactement. Les quatre promesses
du bloc « Vérifie seul » de `sql-foundations`, dont le fait que `WHERE COUNT(*)` doit être
**refusé** par la base — et il l'est, avec `near "WHERE": syntax error`.

**Trois affirmations étaient fausses. Les trois étaient de moi**, écrites pendant ce sprint aux
CP9–CP11, pas présentes dans le corpus d'origine : deux pourcentages de CI (99 %/78 % au lieu
de 95 %/77 %) et un « trois fois sur quatre » qui vaut en réalité une fois sur deux. Corrigées,
avec le script qui les vérifie.

**Ce qui n'a pas pu être vérifié est listé en section 19**, et le §31 du cahier des charges a
été tenu : aucune leçon du corpus ne prétend valider AWS, Kubernetes ou systemd depuis un
environnement qui ne le permet pas.

---

## 14. Le portique technique et les tests négatifs (CP14)

**Portique** : `npm test` 1420/1420 · `npx tsc --noEmit` 0 erreur · `npm run build` compilé ·
`npm run gates:active` 52/52 · corpus `7eb88ba5…` identique au gel · 128/365/365 · ordre des
365 jours inchangé · aucun serveur résiduel · arbre de travail propre.

**Les tests négatifs sont le vrai contenu de ce checkpoint.** Cinquante-deux contrôles verts
peuvent vouloir dire deux choses opposées : le dépôt est sain, ou le contrôle ne regarde rien.
Rien dans « 52 verts » ne permet de trancher.

Méthode : pour chaque contrôle, **introduire le défaut précis qu'il prétend attraper**,
l'exécuter, vérifier qu'il rougit, restaurer, contrôler la restauration à l'octet près. Le
script s'arrête net si une restauration échoue.

**14 tests, 14 conformes, 0 contrôle invalide.** Ont bien été attrapés : la suppression d'une
leçon ; la disparition du mot « exercice » d'une leçon ; une leçon réduite sous 350 mots ; un
titre de section renommé dans une journée ; un doublon de glossaire ; **un seul octet ajouté à
une leçon** ; une collision d'identifiant ; deux journées interverties ; un état utilisateur au
mauvais contenu ; un mot de gamification dans l'interface ; une couleur en dur ; du HTML brut
injecté en JSX ; une clôture de bloc de code échappée.

**Une lacune de couverture, et ce n'est pas la même chose qu'un contrôle invalide.** Retirer le
titre « Exemple guidé » d'une leçon laisse `curriculum:depth-check` vert. En lisant son code :
pour les leçons, il n'exige que quatre choses — au moins 350 mots, au moins 6 sections, le mot
« exercice », le mot « vocabulaire ». Le « gabarit complet », qui contient bien *Exemple
guidé*, est **compté et jamais exigé**. Le contrôle ne ment pas ; **c'est son message de succès
qui promet plus qu'il ne tient**. Signalé — et surtout pas durci maintenant, ce qui serait
modifier un critère après mesure.

**Trois tests sur quatorze ont été mal visés avant d'être justes.** J'ai inséré
`dangerouslySetInnerHTML` dans un **commentaire** (le contrôle retire les commentaires avant de
tester, et il a raison : un commentaire ne rend rien). J'ai ajouté une section ordinaire en fin
de fichier pour tester l'intégrité de rendu (elle atteint bien la page ; le défaut que ce
contrôle attrape est une clôture de bloc échappée). Et le cas « Exemple guidé » ci-dessus.
**Trois fois, un contrôle que j'avais déclaré invalide était un test mal visé.** Un test négatif
teste donc deux choses à la fois : le contrôle, et la compréhension qu'on en a.

---

## 15. L'audit aveugle (CP13) — le checkpoint qui a fait baisser la note

Trente-deux leçons tirées au sort et figées **avant** toute correction ont été relues sans
consulter le ledger, et renotées dans un fichier séparé avant toute comparaison.

**Les deux seuils passent** : S9 = 0,0759 (limite 0,40) et S10 = 0 (limite 4). Le rapport du
CP13 explique en détail pourquoi ce passage ne prouve presque rien (voir section 8).

**Le chiffre qui compte est l'accord case par case.**

| | |
|---|---|
| cases comparées (32 × 14) | 448 |
| accord exact | **401 — 89,5 %** |
| désaccord | 47 — 10,5 %, dont **33** où la seconde lecture est plus sévère |

**Répartition des 47 désaccords** : **D14 = 17** · D1 = 8 · D5 = 4 · D10 = 4 · D12 = 4 ·
D6 = 3 · D4 = 2 · D8 = 2 · D11 = 2 · D9 = 1.

**D14 concentre 36 % des désaccords et les dix-sept vont tous dans le même sens.** Ce n'est pas
du bruit : c'est un motif que la première lecture n'avait pas vu.

**Le motif.** Chaque leçon ouvre sur trois ou quatre sections courtes — « Le problème
d'abord », « Objectif », « Modèle mental », « Pourquoi c'est important ». Dans 33 leçons, deux
de ces sections **disent la même chose**. Trois exemples cités tels quels :

- `technical-storytelling` : « Un projet qu'on ne sait pas raconter n'existe pas pour un
  employeur » figure **mot pour mot** dans deux sections successives.
- `react-fundamentals` : le basculement déclaratif est énoncé **trois fois** dans trois sections
  adjacentes — « travail de plombier vers travail de dessinateur », puis « UI = f(state) », puis
  « Déclaratif (QUOI), pas impératif (COMMENT) ».
- `transformers` : « le sens d'un mot vient de son contexte » est illustré **trois fois** par
  trois images différentes. Chacune est bonne ; ensemble, elles font une longueur.

**Pourquoi la première lecture est passée à côté** : elle lisait chaque section pour ce qu'elle
contient, et chaque section est juste. Le défaut n'apparaît qu'en lisant les sections
**d'affilée**, comme le fait un apprenant.

**Toutes les corrections ont été portées dans le sens de l'audit**, sans exception, y compris
les quatre cas où la seconde lecture était plus **généreuse**. Moyenne 4,9554 → 4,9364 ;
D14 4,984 → 4,734 ; leçons à D14 < 5 : de 2 à 33.

**Le comptage est un plancher, et je peux dire de combien.**

| population | n | D14 | leçons à D14 < 5 | taux |
|---|---:|---:|---:|---:|
| échantillon aveugle, **relu en entier** | 32 | 4,406 | 18 | **56 %** |
| hors échantillon, **lu là où une sonde pointe** | 96 | 4,844 | 15 | 16 % |
| corpus complet | 128 | **4,734** | 33 | 26 % |

**Ces deux taux ne mesurent pas deux corpus. Ils mesurent deux méthodes de lecture.** La sonde
utilisée hors échantillon a un rappel **mesuré** de 59 % (elle retrouve 10 des 17 cas trouvés
par la lecture) et une précision de 64 %. Au taux de l'échantillon, ce ne sont pas 15 mais de
l'ordre de **54** leçons hors échantillon qui seraient concernées. Je ne l'affirme pas — je
n'ai pas relu les 96 en entier. J'affirme seulement : **D14 = 4,734 est une borne supérieure
généreuse.**

**Une restitution Feynman a buté sur un manque réel** : `ai-evaluation` — « je peux expliquer
l'examen avec corrigé, l'évaluation par étage et la calibration du juge sans relire. Là où ça
casse : comment **choisir** k dans rappel@k — la leçon dit que k = 50 noie la génération mais ne
donne pas de critère. » C'est le genre de trou qu'une note ne montre pas et qu'une restitution
montre.

---

## 16. Le budget-temps des 365 journées

Méthode : recalculer les minutes de lecture **sur les fichiers réels d'aujourd'hui** (journée +
leçons liées + correction) avec la formule du projet lui-même, et comparer au budget annoncé.

**Vue d'ensemble, et c'est le bon rapport** : **522 h** de lecture pour **1 643 h** de budget,
soit **31,8 %**. Deux tiers du temps restent à la pratique. Le cahier des charges est explicite
— « une journée de 4 h 30 ne doit surtout pas devenir 4 h 30 de prose » — et c'est mesuré, pas
affirmé.

**Trois journées où la lecture SEULE dépasse le budget**, toutes des revues hebdomadaires :

| jour | budget | lecture | part | leçons listées |
|---|---|---|---|---|
| **77** | 270 min | **464 min** | **172 %** | **20** |
| 84 | 270 min | 347 min | 129 % | 15 |
| 70 | 270 min | 283 min | 105 % | 12 |

**Le jour 77 est le cas d'école.** La journée annonce 4 h 30, contient un test pratique minuté
à 75 min, un test théorique, un mini-projet livrable et un exercice de réflexion — puis une
section « **Leçons de fond à relire cette semaine** » suivie de **vingt leçons**, soit 7 h 44 de
lecture. **La journée n'est pas faisable telle qu'elle est écrite.** Second point indépendant :
le thème de la semaine est « Express complet », mais les vingt leçons listées couvrent le
réseau, Linux, Git, le README, le storytelling, le clean code, l'architecture et les design
patterns. **La liste ne correspond pas au thème.**

**48 journées où la lecture pèse moins de 15 % du budget.** Elles ne tiennent que si la
pratique est réelle : livrable nommé, correction substantielle, checklist et critères de
passage sont présents **48 / 48**. Ma sonde avait signalé 49 « trous » — **les 49 sont des
artefacts de la sonde**, vérifiés par lecture.

---

## 17. Ce que V71 a ajouté au corpus, en volume

Le volume n'est pas une métrique de qualité. Ce tableau sert uniquement de **contrôle de
non-dérive** : si V71 avait rempli des leçons pour faire du chiffre, cela se verrait.

| | |
|---|---|
| corpus au gel CP0 | 356 296 mots |
| corpus après CP13 | 369 183 mots |
| **écart** | **+12 887 mots, soit +3,6 %** |
| leçons touchées | 68 / 128 |
| moyenne par leçon touchée | +190 mots |
| plus forte hausse | `interview-preparation` +628 (+29 %) |
| plus forte **baisse** | `javascript-basics` **−383 (−13 %)** |

Une leçon a maigri de 13 %. C'est le meilleur indice que les corrections n'ont pas été des
ajouts de confort.

---

## 18. Les défauts connus et NON corrigés

Cette section est la plus importante du rapport pour quelqu'un qui doit décider.

**1. Les 33 leçons à ouverture redondante (P3).** Défaut réel, petit, facile à réparer. **Non
corrigé délibérément.** Trois raisons. *La première*, décisive : le défaut a été trouvé par
l'audit, à l'étape d'audit, par la personne qui avait écrit les corrections précédentes. Le
réparer immédiatement remonterait D14 à 5,000 et effacerait de l'historique la seule chose que
ce checkpoint a découverte — c'est le mécanisme de Goodhart dans sa forme la plus pure, que le
§7 interdit. *La deuxième* : une ouverture redondante coûte trente secondes d'ennui, elle
n'empêche pas d'apprendre ; le défaut est classé P3 et il ne reste aucun P0, P1 ni P2 ouvert.
*La troisième* : réécrire 33 ouvertures touche un corpus gelé par neuf contrôles, à deux
checkpoints de la fin. Les 33 leçons sont listées nommément avec la phrase exactement redite,
dans `docs/v71/V71-CP13-BLIND-AUDIT.md`.

**2. Les trois journées de revue intenables (j77, j84, j70).** Défaut pédagogique réel. **Non
corrigé** parce que le réparer signifie changer la liste de leçons attachée à une journée,
c'est-à-dire **le mapping du curriculum**, que le §30 interdit explicitement de modifier sans
décision de curriculum. Localisé pour transmission : `scripts/generate-curriculum.mjs`,
fonction `lessonsDeLaRevue`, ligne 800.

**3. L'estimation de temps de lecture affichée est périmée.** `data/program.json` date du
2026-08-30 ; ses `readingMinutes` sont faux sur 314 journées, de +1 369 minutes au total
(+4,4 min par journée en moyenne, +16 min au pire). **Non régénéré** : régénérer réécrirait les
365 fichiers de journée et casserait neuf gels à deux checkpoints de la fin d'un sprint dont le
sujet est le contenu. À faire au prochain build normal.

**4. `curriculum:depth-check` promet plus qu'il ne vérifie.** Lacune de couverture décrite en
section 14. **Non durci** : durcir un contrôle après avoir mesuré est interdit par le §7.

**5. L'asymétrie éditoriale entre domaines**, relevée au CP3 et jamais traitée : les énoncés de
pratique du lot frontend font 400 à 550 mots en parties lettrées avec un critère de réussite
explicite ; ceux du lot données font 20 à 60 mots sans critère. Le contenu explicatif est
équivalent — c'est l'énoncé qui diffère. Ce n'est pas un défaut par leçon mais un choix
éditorial non uniforme.

**6. Un cinquième du corpus est hors parcours.** **25 leçons sur 128 ne sont citées par aucune
des 365 journées** : cloud (6), Kubernetes (6), Next.js (4), CSS (3), Linux et livraison (6).
Ce n'est pas un défaut — une étagère de référence est légitime, et le ledger la reconnaît — mais
c'est à déclarer sans l'arrondir : **V71 certifie 128 leçons, dont 103 sont enseignées par le
parcours et 25 ne sont atteignables qu'en naviguant.**

---

## 19. Ce que l'environnement n'a pas permis de vérifier

Mesuré, pas supposé. Le §31 interdit de prétendre valider ce qui ne peut pas l'être ici.

| | état constaté | conséquence |
|---|---|---|
| démon Docker | binaire présent, **démon inactif** | aucune leçon Docker exécutée |
| `kubectl` | **absent** | aucune leçon Kubernetes exécutée |
| systemd | `systemctl` présent, mais **systemd ne tourne pas** (PID 1 = `process_api`) | `linux-services-systemd` non exécutée |
| `ssh`, `ssh-keygen` | **absents** | `linux-ssh-remote` non exécutée |
| PostgreSQL | client présent, **aucun serveur à l'écoute** | SQL vérifié via `node:sqlite` |
| réseau sortant | **indisponible** | HTTP vérifié via un serveur local |
| `data/progress.json` | **absent** (état utilisateur) | gel non vérifiable ici |

**Ce que cela veut dire concrètement** : la justesse *conceptuelle* des leçons Docker,
Kubernetes, systemd et SSH a été vérifiée par lecture, comme toutes les autres. Leur justesse
*opérationnelle* — est-ce que la commande donnée produit bien le résultat annoncé sur une vraie
machine — **n'a pas pu l'être**. C'est une réserve réelle qui porte sur 14 leçons environ.

---

## 20. Mes propres erreurs pendant ce sprint

Cette section n'est pas de la modestie. Elle est nécessaire pour que vous puissiez pondérer le
reste.

**Le défaut central, survenu sept fois : j'ai mesuré un marqueur structurel au lieu de
l'exigence réelle du barème.** Le motif est toujours le même — je choisis un marqueur
observable, il corrèle mal avec ce que l'ancre demande, et seule la lecture tranche.

1. **D13** — j'ai exigé une section « Vérification de compréhension » que l'ancre ne demande
   nulle part. **38 leçons** ont été sous-notées. Corrigé au CP10 : leurs notes sont remontées
   **sans qu'une ligne de leçon ne soit modifiée**. C'est la plus grosse erreur du sprint.
2. **D8** — j'ai exigé un « bloc de pratique multiple » (3 leçons).
3. **D5** — j'ai exigé la forme développée **anglaise** d'un acronyme alors que l'ancre demande
   la compréhensibilité (**31 acronymes** faussement signalés).
4. **D2** — j'ai exigé un encadré `>` pour les prérequis (2 leçons).
5. **D11** — j'ai appliqué à D5 le libellé de D11 (2 leçons).
6. **CP14, budget-temps** — j'ai exigé un minutage explicite dans les journées (**49 faux
   signalements**, tous écartés par lecture).
7. **CP14, tests négatifs** — trois tests mal visés qui m'ont fait déclarer trois contrôles
   « invalides » à tort.

**Trois affirmations chiffrées fausses écrites de ma main** aux CP9–CP11, attrapées au CP12 en
les exécutant. Aucune ne venait du corpus d'origine.

**Un mapping de notes fait à l'envers au CP9.** J'avais attribué les hausses aux dimensions
thématiquement proches — D3 pour un chiffre faux, D12 pour une glose maladroite. En relisant
les justifications du CP3, deux leçons disaient littéralement « D1 à 4 : voir le défaut
ci-dessus », et les gloses avaient coûté **D14**, pas D12. J'ai remis les quatorze notes à leur
valeur du CP3 et réappliqué par la dimension réellement pénalisée : **deux hausses ont été
annulées**.

**Une correction que j'ai failli faire pour la mauvaise raison.** Après une suppression au CP9,
`curriculum:depth-check` a rougi sur `typescript-frontend` : sa règle est une recherche du mot
« exercice ». J'ai refusé d'insérer le mot pour faire passer le contrôle. J'ai vérifié que la
phrase disparue portait une vraie perte de sens — pourquoi écrire une garde à la main quand une
bibliothèque le fait mieux — et j'ai **restauré le contenu**.

**Une conclusion trop rapide au CP13**, corrigée en section 22.

---

## 21. Ce que ce rapport ne prouve pas

Cinq limites. Elles ne sont pas des formules de prudence : chacune est chiffrée.

**1. Un audit vraiment aveugle est impossible ici.** L'auditeur, c'est moi. J'ai lu les 128
leçons au CP3, écrit les corrections des CP4 à CP12, et figé l'échantillon moi-même. « Aveugle »
signifie seulement : le ledger n'a pas été rouvert avant de renoter, et les notes ont été
écrites dans un fichier séparé avant toute comparaison. Le dispositif a produit 47 désaccords,
donc il n'est pas cosmétique — mais il ne corrige ni le biais d'auteur (je note mon propre
travail), ni le biais d'attente (ayant trouvé le motif D14 tôt, je l'ai cherché ensuite, donc
les 17 occurrences ne sont pas 17 découvertes indépendantes). **Seule une relecture par
quelqu'un d'autre lèverait ces deux biais.**

**2. D14 = 4,734 est un plancher, pas une valeur.** Chiffré en section 15 : la vraie valeur est
plus basse, probablement autour de 4,4.

**3. Quatorze leçons environ n'ont pas pu être vérifiées opérationnellement** (Docker,
Kubernetes, systemd, SSH) — section 19.

**4. Un invariant du contrat n'a pas pu être positivement vérifié** : le gel de
`data/progress.json`, faute de fichier — section 8.

**5. Aucun apprenant réel n'a suivi ce programme.** Toute cette certification porte sur le
**texte**, jugé contre des ancres écrites. Personne n'a mesuré si un débutant apprend
effectivement. C'est la limite la plus fondamentale et aucun aménagement de ce sprint ne peut
la lever.

---

## 22. La règle pré-engagée du CP12 — et pourquoi je la corrige

Au CP12, avant de connaître le résultat de l'audit aveugle, j'ai écrit dans le fichier d'état :

> « si l'audit aveugle du CP13 produit des notes matériellement plus basses que le ledger,
> **c'est le ledger qui a tort, pas l'audit**, et le verdict sera `ACADEMIC_QUALITY_NOT_READY`. »

**Sa première moitié a été appliquée intégralement.** Les 47 désaccords ont été portés au ledger
dans le sens de l'audit, sans exception, y compris les quatre où l'audit était plus généreux.
Aucune note d'audit n'a été remontée pour protéger le ledger.

**Sa seconde moitié — j'ai écrit au CP13 qu'elle se déclenchait. Je me suis trompé, et il faut
le dire ici plutôt que le laisser passer.**

J'ai appliqué ma propre règle **sans mesurer si sa condition était remplie**. La condition est
« matériellement plus basses ». Voici la mesure, que je n'avais pas faite :

- La correction déplace la moyenne du corpus de **4,9554 à 4,9364**, soit **0,019**. Le seuil
  S1 est à 4,00.
- Elle déplace D14 de 4,984 à 4,734. Le plancher S2 est à **3,70**. Il reste **1,03 point** de
  marge.
- **Test du pire cas.** Si le taux de 56 % observé sur l'échantillon relu en entier valait pour
  les 96 leçons non relues, D14 tomberait à **4,44** — encore 0,74 au-dessus du plancher. Et si
  D14 valait 4,00 pour les **128** leçons, S2 serait à 4,00 et S1 à environ 4,88 : **les deux
  seuils passeraient encore.**

**Conclusion : l'incertitude qui subsiste sur D14 ne peut faire échouer aucun seuil.** La
condition « matériellement plus basses » n'est donc pas remplie, et déclarer
`ACADEMIC_QUALITY_NOT_READY` sur cette base serait une erreur symétrique de celle que la règle
voulait empêcher : un verdict choisi pour son apparence de rigueur au lieu d'être dérivé de la
mesure. Le contrat gelé est explicite : **« Le verdict est le résultat de la mesure. »**

Je précise que ce raisonnement est publié pour être contesté : le calcul du pire cas est en
trois lignes ci-dessus et n'importe qui peut le refaire. Si les nombres étaient allés dans
l'autre sens — si le pire cas passait sous 3,70 — la conclusion serait `NOT_READY`, et je
l'écrirais.

---

## 23. Le verdict, au sens du contrat gelé

**`ACADEMIC_QUALITY_READY`** — les douze seuils S1 → S12 sont atteints (section 8).

**Ce que ce label signifie exactement, et il ne faut pas lui faire dire plus** : les douze
critères que je me suis fixés au checkpoint 1, avant d'avoir lu la première leçon, sont
remplis. Rien de plus.

**Ce qu'il ne signifie pas :**
- il ne signifie pas qu'un tiers a validé ce corpus — personne ne l'a fait ;
- il ne signifie pas qu'il n'y a plus de défauts — il en reste six connus, listés en
  section 18 ;
- il ne signifie pas que D14 vaut 4,734 — cette valeur est un plancher ;
- il ne signifie pas que les leçons Kubernetes ou Docker ont été exécutées — elles ne l'ont
  pas été.

Le cahier des charges disait : « Ne cherche pas READY. Mérite-le. » Je n'ai pas cherché à
l'obtenir : le CP13 a fait **baisser** la note, et le CP14 a produit trois défauts non
corrigés. Le label tombe parce que les seuils tombent, pas parce qu'on l'a visé.

---

## 24. Recommandations pour la suite (V72)

Par ordre d'utilité décroissante, avec ce que chacune coûte.

**1. Faire relire une partie du corpus par quelqu'un d'autre que l'auteur des corrections.**
C'est la seule action qui lève la limite n° 1 de la section 21, et aucune sophistication de
méthode ne la remplace. Vingt leçons suffiraient à donner un signal.

**2. Traiter le lot des 33 ouvertures redondantes.** La liste est prête, phrase par phrase. Le
travail est mécanique et sans risque. **Et il doit être fait par quelqu'un qui ne renote pas
ensuite**, sinon on retombe exactement dans le problème qui a justifié de ne pas le faire ici.

**3. Reprendre les trois journées de revue intenables.** C'est une décision de curriculum, pas
une correction de contenu : soit la liste de leçons à relire est réduite au thème de la semaine,
soit le budget de la journée est revu. Le générateur est localisé.

**4. Étendre la mesure de D14 aux 96 leçons non relues en entier.** Le chiffre publié est un
plancher ; il faut savoir de combien. Coût : une relecture des ouvertures, pas des leçons
entières.

**5. Ouvrir le glossaire aux termes à plusieurs sens.** Les champs `senses` et `isAmbiguous`
existent déjà dans le code et ne sont utilisés par aucune des 711 entrées. MRR et IC sont les
deux cas déjà identifiés.

**6. Uniformiser les énoncés de pratique entre domaines** (section 18, point 5).

**7. Régénérer `data/program.json`** au prochain build normal, pour que les temps de lecture
affichés redeviennent exacts.

**8. Faire du test négatif une pratique permanente.** Les 14 tests du CP14 sont rejouables et
peuvent être étendus. Un contrôle qui n'a jamais été mis en échec volontairement n'a jamais été
vérifié.

---

## 25. La réponse à votre question

> **Est-ce que ces 128 leçons permettent réellement à un humain qui ne connaît pas le sujet
> d'apprendre ?**

## **OUI AVEC RÉSERVES**

**Premier paragraphe — pourquoi oui.** Les 128 leçons ont été lues intégralement, une par une,
contre une grille écrite avant la première lecture. Ce que j'y ai trouvé n'est pas un corpus à
sauver : 85 leçons sur 128 ne portaient **aucun** défaut à la première lecture. Les 43 autres
en portaient 48 au total, tous fermés depuis. La note finale de 4,94 est haute, et le CP13 a
été construit exprès pour tester si elle était méritée — il a fait **baisser** le ledger, ce qui
est le comportement d'un dispositif qui fonctionne, pas d'un dispositif complaisant.

**Deuxième paragraphe — ce qui rend le oui solide.** La qualité de ce corpus ne tient pas à sa
longueur mais à des dispositifs précis, que j'ai vus se répéter d'un domaine à l'autre. Une
leçon qui **fige délibérément un bug** et explique pourquoi le corriger tout de suite serait
l'erreur (`refactoring-legacy-code`). Une leçon qui **mesure quatre approches** au lieu d'en
recommander une, chacune avec sa limite (`database-transactions-concurrency`). Une leçon qui
donne la **limite de sa propre analogie** — « avec un Google Doc tu VOIS le curseur de l'autre
bouger ; ici rien ne signale le partage » (`javascript-basics`). Une leçon qui **refuse trois
fois sa propre nomenclature** parce que la bonne réponse n'est pas de choisir dans le catalogue
(`k8s-workloads`). Une leçon dont le seuil responsive est **mesuré par balayage** et ne
correspond à aucun seuil canonique, avec la raison exacte (`responsive-design`). Ce sont des
gestes d'enseignement, pas des gestes de rédaction, et ils sont partout.

**Troisième paragraphe — la première réserve, et c'est la vraie.** C'est moi qui ai lu, moi qui
ai corrigé, moi qui ai noté. Le dispositif d'audit aveugle a été monté honnêtement et il a
produit un résultat réel — 10,5 % de désaccord case par case, un défaut systématique découvert,
le ledger baissé. Mais il ne remplace pas un regard extérieur, et deux biais subsistent que
rien dans ce sprint ne peut lever : je note mon propre travail, et ayant trouvé un motif tôt, je
l'ai cherché ensuite. **Tant que personne d'autre n'a relu, ce rapport est une auto-évaluation
rigoureuse, pas une certification indépendante.** C'est la différence entre les deux mots que je
vous demande de retenir.

**Quatrième paragraphe — la deuxième réserve.** La qualité éditoriale (D14) est le point bas, et
le chiffre publié, 4,734, est **un plancher connu comme tel**. Là où j'ai relu chaque leçon en
entier, le défaut touche 56 % d'entre elles ; là où je n'ai lu que les ouvertures désignées par
une sonde dont le rappel est de 59 %, il en touche 16 %. Ces deux taux ne décrivent pas deux
corpus, ils décrivent deux façons de lire. La vraie valeur est probablement autour de 4,4. Cela
ne change aucun seuil — c'est démontré en section 22 — mais cela veut dire qu'**un lecteur
attentif rencontrera des redites d'ouverture plus souvent que le chiffre ne le suggère**.

**Cinquième paragraphe — la troisième réserve.** Trois journées de revue ne sont pas faisables
telles qu'elles sont écrites. Le jour 77 demande 7 h 44 de lecture dans un budget de 4 h 30, en
plus d'un test pratique, d'un test théorique, d'un mini-projet et d'un exercice de réflexion —
et les vingt leçons qu'il demande de relire ne correspondent même pas au thème de sa semaine.
Ce n'est pas un défaut de leçon, c'est un défaut de journée, et je ne l'ai pas corrigé parce que
le cahier des charges interdit de toucher au mapping du curriculum. **Un apprenant qui arrive au
jour 77 va se retrouver en échec sans que ce soit de sa faute.** C'est la réserve la plus
concrète du lot et elle demande une décision de votre part, pas une correction de ma part.

**Sixième paragraphe — la quatrième réserve.** Environ quatorze leçons (Docker, Kubernetes,
systemd, SSH) n'ont pas pu être vérifiées autrement que par lecture : cet environnement n'a ni
démon Docker actif, ni `kubectl`, ni systemd, ni `ssh`, ni réseau sortant. Leur justesse
conceptuelle a été contrôlée comme les autres ; leur justesse opérationnelle ne l'a pas été.
J'ai vérifié en revanche qu'**aucune de ces leçons ne prétend le contraire** : celles qui
citent un repère non exécuté le déclarent.

**Septième paragraphe — la cinquième réserve, la plus fondamentale.** Aucun apprenant réel n'a
suivi ce programme. Tout ce rapport porte sur le **texte**, jugé contre des ancres écrites par
moi. Personne n'a mesuré si un débutant apprend effectivement, ni combien abandonnent au jour
40, ni quelles leçons produisent des questions. C'est la limite que les 128 lectures ne peuvent
pas lever, et elle vaut pour n'importe quelle certification faite sur un texte.

**Huitième paragraphe — ce que je ferais à votre place.** Trois choses, dans cet ordre. D'abord,
faire relire vingt leçons par quelqu'un d'autre — c'est la seule action qui transforme cette
auto-évaluation en certification. Ensuite, trancher les trois journées de revue, parce que c'est
la seule réserve qui mettra un apprenant en échec de façon certaine. Enfin, faire traiter le lot
des 33 ouvertures redondantes par quelqu'un qui ne renotera pas ensuite. Le reste peut attendre.

**Neuvième paragraphe — pour être tout à fait clair sur ce que « oui » veut dire.** Si vous me
demandez « est-ce qu'un débutant motivé peut apprendre le métier d'ingénieur IA avec ces 128
leçons ? », ma réponse est oui, et je la tiens : le corpus explique **pourquoi** avant
**comment**, il montre ses propres limites, il fait produire quelque chose et il donne de quoi
se vérifier seul. Si vous me demandez « est-ce que quelqu'un d'indépendant a confirmé cela ? »,
la réponse est non, et c'est exactement ce que les mots « avec réserves » recouvrent.

---

## Fichiers produits par V71

| Fichier | Contenu |
|---|---|
| `docs/v71/V71-ACADEMIC-CONTRACT-FROZEN.md` | le contrat gelé au CP1 : 14 ancres, 12 seuils, 3 verdicts |
| `docs/v71/V71-STANDARD-HUMAIN.md` | ce qu'est une bonne leçon et comment on la note |
| `docs/v71/LEDGER-128.json` | les 128 leçons × 14 dimensions, avec justification et historique |
| `docs/v71/V71-STATE.md` | journal de bord complet, checkpoint par checkpoint |
| `docs/v71/V71-CP11-VULGARISATION-JARGON-PREREQUIS.md` | rapport CP11 |
| `docs/v71/V71-CP12-FACT-CHECK.md` | rapport CP12 — 92 assertions exécutées |
| `docs/v71/V71-CP13-BLIND-AUDIT.md` | rapport CP13 — audit aveugle et contre-notation |
| `docs/v71/CP13-BLIND-32.json` | les 32 notations aveugles, écrites avant comparaison |
| `docs/v71/V71-CP14-PORTIQUE.md` | rapport CP14 — portique, budget-temps, tests négatifs |
| `scripts/v71/pratique-redpt.mjs` | grille R/E/D/P/T, avec ses trois versions abandonnées |
| `scripts/v71/jargon-non-explique.mjs` | sonde de jargon reconstruite à partir du glossaire |
| `scripts/v71/cp12-assertions.py` | 30 assertions numériques exécutables |
| `scripts/v71/cp12-sql-http.mjs` | 12 assertions SQL et HTTP exécutables |
| `scripts/v71/cp13-redite-ouverture.mjs` | sonde de redites — rappel 59 %, précision 64 %, publiés |
| `scripts/v71/cp14-tests-negatifs.mjs` | les 14 tests négatifs, rejouables |
| `scripts/v70-verifications/ci-instabilite-cumulee.mjs` | modèle d'instabilité cumulée de CI |
