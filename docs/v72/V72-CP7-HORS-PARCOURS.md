# V72 — CP7. Les 25 leçons hors parcours

**Résultat, en une phrase :** en appliquant les critères gelés au CP1, **aucune des 25 leçons
n'est de classe A**, donc aucune insertion n'est faite — et le vrai problème, celui qui reste
entier, n'est pas une leçon manquante mais **une compétence déclarée que le programme
n'enseigne jamais**.

---

## 1. Le critère A, et pourquoi il ne se déclenche jamais

Le §5 du contrat définit la classe A par **deux conditions cumulatives** :

> la leçon porte une **compétence déclarée** dans `program.json` **et** le parcours l'exige
> implicitement (un livrable la suppose, ou une leçon programmée s'appuie dessus).

**La seconde condition a été testée sérieusement**, parce qu'elle est la seule qui puisse
déclencher une insertion. Six leçons **programmées** citent une leçon hors parcours dans leur
propre section « Prérequis » — le signal le plus fort possible :

| leçon programmée | cite en prérequis |
|---|---|
| `breaking-changes-compatibility` | `deployment-strategies` |
| `database-migrations` | `deployment-strategies` |
| `frontend-performance` | `responsive-design` |
| `incident-response` | `release-incident-recovery` |
| `postmortem-rca` | `release-incident-recovery` |
| `slo-error-budget` | `cloud-fundamentals` |

**Les six ont été lues. Les six déclarent explicitement le contraire d'une dépendance :**

> « **Étagère de référence.** `/doc/lessons/deployment-strategies` applique la compatibilité au
> déploiement lui-même. Elle n'est programmée par aucune des 365 journées — tu peux l'ouvrir
> librement, et **rien ici ne suppose que tu l'as lue**. »

> « **Où trouver le détail.** `/doc/lessons/cloud-fundamentals` situe la disponibilité parmi les
> autres propriétés d'une architecture. Elle est sur **l'étagère de référence** : aucune des
> 365 journées ne la programme. »

Et chacune **donne sur place** la notion nécessaire. `slo-error-budget` écrit la disponibilité
en une phrase et sa table des « neuf » avant de renvoyer ; `postmortem-rca` rappelle que
l'essentiel est déjà dans les prérequis d'`incident-response`, qui est programmée.

**Ce n'est donc pas une dépendance non satisfaite : c'est un renvoi d'approfondissement,
correctement annoncé.** Le travail fait par V71 au CP11 sur ces six liens était juste, et il
tient. La seconde condition de la classe A n'est remplie par aucune leçon.

**Le côté « livrable » a aussi été testé.** Trois livrables de journée sur 365 évoquent la mise
en forme, et le seul candidat sérieux — j117, « BiblioApp : tous les états soignés » — emploie
« états » au sens de `react-application-states` (chargement, erreur, vide, succès), pas au sens
du style. Aucun livrable ne suppose CSS.

---

## 2. Classement des 25

| classe | définition | n |
|---|---|---|
| **A** — fondamentale, doit intégrer les 365 jours | compétence déclarée **et** exigée implicitement | **0** |
| **B** — approfondissement utile | citée comme approfondissement par une leçon programmée, ou nécessaire au métier sans qu'aucun livrable ne la suppose | **9** |
| **C** — référence | consultation ; le parcours reste cohérent sans elle | **16** |
| **D** — fusionnable | redondante avec une leçon programmée | **0** |
| **E** — hors périmètre | ne relève pas du métier visé | **0** |

**Classe B (9)** — `deployment-strategies` · `release-incident-recovery` · `responsive-design` ·
`cloud-fundamentals` · `cloud-compute-storage` · `cloud-finops` · `css-fundamentals` ·
`nextjs-data-production` · `linux-services-systemd`.

**Classe C (16)** — `cloud-aws-core` · `cloud-azure-core` · `cloud-networking` · `css-flexbox` ·
`css-grid` · `iac-fundamentals` · `k8s-config-probes` · `k8s-networking-services` ·
`k8s-security` · `k8s-troubleshooting` · `k8s-why-architecture` · `k8s-workloads` ·
`linux-ssh-remote` · `nextjs-foundations` · `nextjs-rendering` ·
`nextjs-server-client-components`.

**Aucune classe D ni E.** Les 25 sont toutes pertinentes pour l'environnement d'un ingénieur IA
et aucune ne double une leçon programmée. Une bibliothèque de référence de 25 leçons de bonne
qualité est un objet légitime — le contrat le dit, et la mesure le confirme.

---

## 3. Le problème qui reste entier : `cloud` est déclarée et jamais enseignée

`data/program.json` déclare **vingt compétences**. La répartition réelle des 365 journées en
couvre **dix-neuf**. Il en manque une, et c'est **`cloud` — « Cloud / DevOps »**, avec **zéro
journée**.

Ce n'est pas la même chose que « 25 leçons sont sur une étagère ». Une étagère de référence est
un choix ; **une compétence affichée dans la liste des vingt compétences du programme est une
promesse**. Un apprenant qui suit les 365 jours dans l'ordre ne rencontrera jamais cette
compétence, alors que la page du programme la lui annonce.

C'est le seuil **C3** du contrat (« compétences déclarées sans aucune journée : **0** »), et il
**échoue**.

### Les deux réparations possibles sont toutes deux réservées à l'utilisateur

Le §5 du contrat, écrit au CP1 avant toute mesure, réserve explicitement :

> la suppression d'une compétence déclarée de `program.json`, et toute création d'une journée
> nouvelle (impossible sans casser M2).

Ce sont exactement les deux seules façons de faire passer C3 :

1. **retirer `cloud` des compétences déclarées** — le programme cesse de promettre ce qu'il
   n'enseigne pas. Honnête, et cela réduit le périmètre affiché du produit ;
2. **donner des journées à `cloud`** — il faudrait en prendre à d'autres compétences, puisque
   le total est figé à 365. C'est un arbitrage de curriculum, pas une correction.

**V72 ne tranche ni l'une ni l'autre.** La question est posée au CP15.

### Une troisième voie, examinée et REFUSÉE

Une journée existe dont le contenu est du DevOps et dont l'étiquette de compétence est autre :
**j320, « DocSense : dockerisation », porte la compétence `evalia`** (évaluation IA). Ré-étiqueter
cette journée en `cloud` serait défendable en soi — c'est un vrai défaut d'étiquetage, et cela
lierait à cette journée les leçons Docker/CI/secrets/monitoring plutôt que les trois leçons
d'évaluation.

**Cela ferait aussi passer C3 mécaniquement**, puisque `cloud` aurait alors « au moins une
journée ». Une compétence affichée dans la liste des vingt, discharged par **une** journée sur
365, resterait une promesse non tenue — et le seuil aurait été franchi par la lettre contre son
intention. C'est la définition même de ce que le §7 anti-Goodhart interdit.

**Le ré-étiquetage n'est donc pas fait.** Il est signalé comme correction candidate, à traiter
*après* que la question de fond aura été tranchée — jamais à sa place.

---

## 4. Ce que le CP7 a modifié

**Rien.** Aucune insertion, aucun changement de mapping, aucune leçon touchée.

C'est le résultat correct : les critères gelés au CP1 ne désignent aucune insertion sûre, et le
contrat interdit d'en inventer une. Le principe posé au §5 — « ne pas chercher à ramener 25 à
zéro » — est respecté par la mesure, pas par renoncement.

| contrôle | résultat |
|---|---|
| leçons hors parcours | 25 → **25** |
| insertions faites | **0** |
| corpus | inchangé |
| `program.json` | inchangé |
| seuil **C3** | **ÉCHOUE** — 1 compétence déclarée sans journée |
