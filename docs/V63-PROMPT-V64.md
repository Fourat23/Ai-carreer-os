# V64 — LEARNING ENGINE I

> Préparé à la clôture de V63. **Ne pas lancer avant décision humaine.**

## 0. Ce que V64 est, et n'est pas

La fondation UX est **fermée** (`docs/V63-UX-CLOSURE.md`). V64 ouvre le
**moteur d'apprentissage**.

**V64 n'est pas un sprint d'interface.** Il produira nécessairement des écrans,
mais chaque écran devra être justifié par une fonction, jamais par une
recherche esthétique. La règle de clôture s'applique dès ce sprint :

> Quel problème utilisateur mesuré cet écran résout-il ?

Interdits hérités, toujours en vigueur : pas de sixième motif, pas de nouvelle
direction visuelle, pas de nouvelle palette, pas de refonte de navigation, pas
de cartification. Réutiliser les trois coquilles partagées et la grammaire
contexte → travail → suite.

## 1. Le problème que V64 doit résoudre

Aujourd'hui le produit **montre** un parcours de 365 jours ; il ne
l'**accompagne** pas. `progress.json` existe, la lecture est correcte, mais :

- une journée n'a pas d'**état de travail** riche (commencée, en cours,
  livrable produit, validée) ;
- il n'y a pas de **soumission de preuve** ni de validation associée ;
- les compétences sont dérivées, mais rien ne les **alimente** au fil de l'eau ;
- les révisions existent en modèle, mais aucune boucle ne les **déclenche** ;
- la **reprise** — « où en étais-je, que faire maintenant » — est déduite de la
  première journée non terminée, pas d'un vrai état.

C'est pourquoi toutes les surfaces de pilotage sont vides : **elles sont
correctes, mais rien ne les remplit.**

## 2. Périmètre fonctionnel

1. **État d'une journée** — modèle explicite et son cycle de vie complet.
2. **Soumission de preuve** — ce que l'apprenant produit, rattaché à la journée.
3. **Validation** — déterministe et locale ; jamais une note arbitraire.
4. **Compétences** — alimentées par les preuves, dérivées, jamais déclarées.
5. **Révisions** — la clôture d'une journée crée une échéance réelle.
6. **Diagnostics** — leur résultat devient une preuve, avec sa réserve
   (« un score est un indice, pas une preuve de maîtrise »).
7. **Historique** — ce qui s'est passé, quand, et avec quelle preuve.
8. **Reprise** — « continuer » doit repartir d'un état, pas d'une déduction.
9. **Feedback pédagogique** — dérivé du corpus, jamais généré.
10. **Orchestration** lecture → pratique → validation → preuve.
11. **Persistance locale fiable** — écriture atomique, sauvegarde, migration de
    schéma, récupération après écriture interrompue.
12. **Préparation à l'IDE local** — les frontières du modèle doivent permettre
    qu'un éditeur local vienne s'y brancher plus tard, sans réécriture.

## 3. Invariants — non négociables

- corpus pédagogique inchangé ; 365 jours, même ordre ;
- **une visite ne mute jamais `progress.json`** — seule une action explicite
  écrit. C'est le test de non-régression le plus important du produit ;
- aucune seconde source de vérité : la progression a **un** propriétaire ;
- aucune donnée inventée, aucune progression fictive ;
- **aucune gamification** : ni XP, ni niveau, ni série, ni classement, ni
  confettis, ni trophée ;
- une preuve reste une **preuve**, pas un score ; un score reste un **indice** ;
- aucune URL publique supprimée ou modifiée ;
- pas de réseau sortant ; tout est local et déterministe.

## 4. Ordre suggéré

| CP | contenu |
|---|---|
| CP0 | audit forensique de l'existant : ce que `progress.json` porte déjà, ce que les read-models dérivent, ce qui manque. Lecture seule. |
| CP1 | ADR du moteur + schéma d'état + critères gelés + stratégie de migration |
| CP2 | modèle pur d'état de journée + tests (aucune I/O) |
| CP3 | persistance : écriture atomique, sauvegarde, migration, récupération |
| CP4 | cycle de vie d'une journée de bout en bout sur `/day/[id]` |
| CP5 | preuves : soumission, stockage, rattachement |
| CP6 | validation déterministe + feedback issu du corpus |
| CP7 | compétences alimentées par les preuves |
| CP8 | révisions déclenchées par la clôture d'une journée |
| CP9 | diagnostics → preuves |
| CP10 | historique + reprise |
| CP11 | les surfaces de pilotage avec des données réelles (voir §5) |
| CP12 | gate `v64:check` + tests négatifs |
| CP13 | parcours complet : jour 1 → preuve → compétence → révision |
| CP14 | intégrité, responsive, accessibilité, gauntlet |
| CP15 | rapport final + push |

## 5. La seule dette UX à traiter dans V64 — P0-1 de V63

**Les états vides des surfaces de pilotage** (`/skills`, `/synthese`,
`/parcours`, `/revisions`). À progression nulle, elles affichent des colonnes de
zéros avec le poids visuel d'une donnée réelle — c'est le premier écran de tout
nouvel utilisateur.

Ce n'est pas un travail de redesign : le Learning Engine va **remplir** ces
surfaces. Les traiter au moment où les données arrivent évite de les refaire
deux fois. Preuve : `docs/design/v63/audit/skills-1440.png`.

Les recommandations **P1** de V63 (espace horizontal, micro-états, indicateur de
section sur `/day` à 375) doivent être intégrées **avec** les fonctions qui les
justifient — pas avant, pas séparément.
Les **P2** ne sont pas dans le périmètre de V64.

## 6. Hygiène de mesure — leçons cumulées V61→V63

Quatre sondes fausses en V62, deux en V63. Aucune n'a été corrigée en modifiant
le produit. Règles acquises :

1. une sonde qui cherche une classe CSS se trompe dès qu'il en existe deux ;
2. lire `backgroundColor` seul rate tout élément peint par un dégradé ;
3. **vérifier l'occlusion, pas seulement la géométrie** — un élément à `top: 0`
   peut être invisible derrière une bande collante (trouvé en V63) ;
4. un relevé aberrant sur toutes les routes est presque toujours un problème
   d'outillage : vérifier l'URL et le serveur avant de croire une régression ;
5. une région plus haute que la fenêtre n'est pas « masquée » parce que son bord
   supérieur passe sous une barre ;
6. **la capture gagne sur la métrique** pour le diagnostic visuel. Les défauts
   les plus réels de V62 et V63 ont été vus à l'œil, pas mesurés.

## 7. Gates

Les 41 gates existants restent en vigueur. Tout nouveau gate doit être **vu
échouer** : casser ce qu'il protège, constater l'échec avec son message,
restaurer. Rappel : au premier essai, la vérification 1 de `v62:check` laissait
passer la casse — c'est le troisième sprint consécutif où le test négatif trouve
un trou dans un gate neuf.

## 8. Condition de sortie

- les douze points du §2 traités ou justifiés par écrit un par un ;
- **une visite ne mute pas la progression** — vérifié par hachage sur toutes les
  familles de routes, sans restauration ;
- migration de schéma testée depuis l'état actuel de `progress.json` ;
- récupération après écriture interrompue testée ;
- parcours complet jour 1 → preuve → compétence → révision, démontré ;
- 324 états responsive : 0 débordement, 0 rognage ;
- axe : 0 critical, 0 serious ;
- aucune régression sur les dix conditions de la clôture UX ;
- tests, tsc, build, gates verts ;
- rapport final.

**Ne lance pas V65.**
