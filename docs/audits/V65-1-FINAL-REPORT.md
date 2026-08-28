# V65.1 — RAPPORT FINAL

**Competency Engine Product Closure**
Base `2237f2d` (V65) → `HEAD`. Branche `claude/ai-career-os-saas-phfg49`.

---

## 0. Ce que ce sprint devait fermer

V65 avait livré un moteur : preuve canonique, projection de compétence,
explicabilité, historique. Son verdict était `COMPETENCY_ENGINE_READY`.

Le **produit** autour du moteur, lui, était resté ouvert. Le CP0 l'a mesuré :

| | Mesure d'entrée |
|---|---|
| `gates:active` à HEAD | **ROUGE** — `v64:check`, 2 régressions |
| Compétences divergentes entre `/` et `/skills` | **20 / 20**, dont **8 sémantiquement** |
| « Preuves qualifiantes » annoncées par `/skills` | **28**, pour **14** réelles |
| Vocabulaires de compétence affichés | **2** (fin et programme) |
| `/diagnostics` connaît l'apprenant | **non** |
| Surface de détail par compétence | **absente** |

Quatre compétences réellement démontrées — `ds`, `se`, `sql`, `archi` — étaient
annoncées **« Non abordée »** sur le tableau de bord.

---

## 1. Baseline re-mesurée, et ce qu'elle a démenti

Le §0 du brief interdisait de croire V65 sur parole. Bien pris :

| Contrôle | V65 annonçait | Mesuré au CP0 | |
|---|---|---|---|
| `npm test` | 1 368 | **1 368**, 0 échec | conforme |
| `tsc --noEmit` | 0 erreur | **0** | conforme |
| `npm run build` | compilé | **compilé** | conforme |
| `gates:active` | « 43 gates » | **ÉCHEC** | **non conforme** |

`v64:check` était rouge sur un arbre propre, à `2237f2d`. Le rapport final de
V65 affichait pourtant `gates:active : 43 gates` dans son encadré de clôture :
la chaîne n'a pas été rejouée avant le verdict, ou son échec n'a pas été lu.

---

## 2. Ce qui a été fait

### 2.1 P0-0 — le gate mesurait une photo, pas un invariant

`v64:check` énumérait ses six « écrivains » à la main. V65 a fait de
`SkillsBoard` une surface de lecture seule ; le gate a continué d'exiger de lui
`sendCommand` et un affichage d'erreur. La liste est désormais **dérivée** : est
écrivain tout composant client émettant `{ type: 'UPPERCASE' … }` ou appelant la
route de commandes — la forme, pas le nom de l'appelant.

Dérivée, la règle a immédiatement trouvé ce que l'énumération cachait :
`SettingsPanel` appelle `/api/progress/import` et `/reset`. Ce sont des
opérations de fichier assumées, désormais surveillées **séparément**. Puis une
**troisième catégorie** est apparue, que rien ne mesurait : les **correcteurs
serveur** (`record: true`), qui écrivent dans la progression sans passer par
`sendCommand` — à raison, puisque le serveur calcule tout.

Une règle N12 empêche de réénumérer. Trois tests négatifs vus échouer.

### 2.2 P0-1 — suppression du modèle concurrent

`lib/skill-state.mjs` et `lib/skill-vocabulary.mjs` sont **supprimés**. Ils
faisaient :

- « **3 journées terminées** → Pratiquée » — invariant 10 ;
- « **≥ 1 preuve quelconque** → Démontrée » — une note personnelle valait
  démonstration, invariant 9.

Leurs libellés français chevauchaient ceux du modèle canonique **en désignant
autre chose** : « Pratiquée » y voulait dire « trois jours faits », ici « des
traces existent, aucune validation réussie ». Deux surfaces affichaient le même
mot pour deux faits différents.

`learning-experience.mjs` et `track-aggregate.mjs` sont refondés sur le ledger.
`explainSkillState` disparaît au profit de `whyCompetencyState` +
`nextActionForCompetency`, qui vivent dans `competency.mjs`, à côté de l'état
qu'ils commentent. Un module qui n'existe plus que pour être testé est une
seconde source qui attend d'être réimportée.

**Sonde transverse : 0 écart** entre `/`, `/skills`, `/history` et `/synthese`.

### 2.3 P0-2 — le nombre inventé

`/skills` affichait « **28** preuves qualifiantes sur 30 enregistrées » pour
**14** réelles. 28 était la **somme des crédits par compétence** — 13 des 14
preuves en créditent plusieurs — présentée dans la même phrase qu'un vrai
décompte d'enregistrements (« sur 30 »), donc lue comme tel.

Les deux grandeurs portent maintenant deux noms : `qualifyingEvidenceCount`
(enregistrements) et `competencyCreditCount` (crédits).

### 2.4 P0-3 — deux vocabulaires

`/synthese` affichait `javascript · algo`, `linux · arrays`, `hashmap · data` ;
`/skills` affichait « JavaScript / TypeScript », « Git / Linux ». La
chronologie lit le ledger et rend les **noms français du programme**. Le jalon
« transfert multi-domaines » comptait **12** étiquettes fines là où le ledger
connaît **7** compétences.

### 2.5 P0-4 — les diagnostics ignoraient leur lecteur

`/diagnostics` était rigoureusement identique pour un apprenant en ayant passé
zéro et pour un en ayant passé deux, dont un réussi — alors que le ledger et
`/history` portaient les deux tentatives. Chaque ligne porte désormais date,
résultat et nombre de tentatives ; **rien du tout** pour un diagnostic jamais
passé.

### 2.6 P0-5 — un capstone réussi ne produisait aucune preuve

`capstone` est un type de source **qualifiant** au contrat V65 §2.
`capstoneToEvidence` existait dans `lib/capstone.mjs` depuis V40 **sans aucun
appelant**, et `CapstoneRunner` portait en tête « N'écrit RIEN dans la
progression ». Conséquence : le jalon « Premier capstone terminé » était
structurellement inatteignable, et aucune compétence ne pouvait être démontrée
par cette voie.

Nouvelle route `/api/capstones/[id]`, miroir exact de celle des diagnostics :
correction par le **serveur**, écriture seulement sur `record: true`,
dédoublonnage par clé métier, conservation par geste explicite avec échec
visible.

### 2.7 P0-6 — la réussite après un échec était silencieusement jetée

**Le défaut le plus grave du sprint**, trouvé par un test négatif du CP12.

Une tentative **ratée puis réussie** sur le même exercice ne créditait rien.
`deterministicId(sourceType, sourceId)` ignorait le caractère qualifiant que
`evidenceKey`, elle, distinguait (`…:q` / `…:n`). Les deux preuves partageaient
donc le même identifiant, et la garde `DUPLICATE_ID` de `appendEvidence`
rejetait la **seconde** — c'est-à-dire la réussite. Le ledger ne gardait que
l'échec. Et la commande répondait « ok ».

Mesuré sur la fixture : **journée 7, `linux-path-traversal-x`** — une seule
preuve au ledger, celle de l'échec. Après correction, la fixture passe de **14 à
15 preuves qualifiantes** et `gitlinux` récupère sa quatrième trace.

Ce trou avait la forme exacte de celui trouvé au CP2 de V65 : **deux mécanismes
protégeant le même invariant en se contredisant**, et un test négatif qui reste
vert parce que l'autre attrape le cas.

### 2.8 CP3 — atteignabilité : le manque du corpus n'est pas celui de l'apprenant

Audit du corpus réel : 376/376 exercices projetables, 51 étiquettes fines,
**0 non projetable**. Mais :

| Compétence | exos | diagnostics | missions | capstones |
|---|---|---|---|---|
| `autonomy` | 0 | 0 | 0 | **0** |
| `comm` | 0 | 0 | 0 | 1 |
| `cloud` | 0 | 3 | 0 | 1 |
| `python`, `dl`, `agents`, `evalia` | oui | **0** | 0 | oui |

**`autonomy` n'est alimentée par aucune source qualifiante.** Elle ne peut
structurellement pas sortir de « Non évaluée », quoi que fasse l'apprenant. Le
Curriculum 1.0 étant gelé (invariant 2) et une donnée absente devant le rester
(invariant 7), on ne fabrique rien : **on le dit**. `/skills/autonomy` affiche
« Le programme ne propose aujourd'hui aucun exercice, diagnostic, mission ni
capstone portant sur cette compétence […] ce n'est pas une lacune de ta part. »

`getCompetencyReachability()` dérive ce constat du corpus. Ajouter un exercice
suffit à le changer.

### 2.9 CP8 — la surface qui manquait

`/skills/[id]` : identité, état, **pourquoi cet état** (règle et faits produits
par `whyCompetencyState`, rien écrit en dur), **preuves retenues** avec leur
provenance, **traces qui ne démontrent pas** avec la raison de chacune,
atteignabilité, **prochaine action réelle**, historique. Atteignable depuis
`/skills`, `/revisions` et l'historique.

### 2.10 CP6 / CP11 — historique exploitable, pont révision visible

`/history` : 84 événements en un mur unique. Les filtres (type, compétence)
vivent **dans l'URL** — une vue rechargeable, pas un état client ; chaque option
porte son décompte réel ; une option qui ne rendrait rien n'est pas proposée ;
un filtre actif dit combien il cache.

`/revisions` : `getReviewCandidates()` existait depuis V65 et **n'était lu par
aucune surface**. La page portait des journées, `/skills` des compétences, rien
ne reliait les deux à l'écran. Le pont est rendu, avec sa frontière énoncée :
réviser enregistre une **trace non qualifiante**.

---

## 3. Défauts trouvés à l'œil ou par axe, corrigés

| | Défaut | Où trouvé |
|---|---|---|
| 1 | La colonne des compétences de `/history` débordait de 8 px à 375 depuis qu'elle porte les noms français | sonde de débordement |
| 2 | 6 × `link-in-text-block` (serious) : un lien dans un paragraphe ne se distinguait que par la couleur | axe-core |
| 3 | Étiquettes superposées dans l'échéancier `/revisions` — on lisait **« J1J12 »** | capture 1440 |
| 4 | La colonne de type de la chronologie débordait — **« DIAGNOSTIQDiagnostic : … »** | capture 1440 |
| 5 | Le bouton d'action portait `goal`, une phrase d'intention (« réactiver un acquis avant qu'il ne retombe ») là où l'apprenant attend une destination | capture 1440 |

Le défaut 3 était invisible tant que l'échéancier restait vide — le même angle
mort que le `role="img"` de `.rev-track`, resté huit sprints sous des suites
vertes.

### Faux diagnostic de sonde, corrigé dans la sonde

`/synthese` était accusée d'afficher « 0 % de maîtrise ». Elle lit
`0/119 · 0%` : la progression réelle d'un parcours jamais commencé, un quotient
avec son numérateur et son dénominateur affichés à côté. **Dixième faux
diagnostic de sonde** de la série V62→V65.1 ; aucun n'a jamais été résolu en
changeant le produit.

---

## 4. Les 25 questions de certification

| # | Question | Réponse |
|---|---|---|
| 1 | Une visite peut-elle créer une preuve ? | **Non.** 51 routes visitées, `progress.json` inchangé à l'octet près (C13 vérifié). |
| 2 | Une visite peut-elle faire progresser une compétence ? | **Non.** L'état se projette depuis les preuves ; aucune écriture au rendu. |
| 3 | Terminer une journée démontre-t-il une compétence ? | **Non.** La règle « 3 journées → pratiquée » est supprimée avec `skill-state.mjs`. Test S-préalable : `http` a 3 journées terminées et reste « Non évaluée ». |
| 4 | Une note personnelle est-elle une preuve ? | **Non.** `declared` n'est pas un type qualifiant ; `/skills/[id]` l'affiche sous « traces qui ne démontrent pas » avec sa raison. |
| 5 | Une preuve échouée crédite-t-elle une compétence ? | **Non.** `isQualifying` exige `validation.status === 'passed'`. Vérifié par gate (N9 vu échouer). |
| 6 | Une révision fait-elle progresser un état ? | **Non.** `review` ne peut pas porter `passed` (`UNQUALIFIABLE_SOURCE`). Une révision seule laisse « Pratiquée ». |
| 7 | Une même preuve métier peut-elle être créditée deux fois ? | **Non.** Clé `sourceType:sourceId:compétences triées:q\|n`. Testé sur le cas que **seule** la clé attrape : même fait, autre identifiant. |
| 8 | Un échec puis une réussite sont-ils deux faits ? | **Oui — depuis ce sprint.** C'était P0-6 : la réussite était jetée en silence. |
| 9 | Une compétence est-elle écrite directement quelque part ? | **Non.** Aucun `skills[x] = n` dérivé ; les niveaux déclarés restent une déclaration, comptés à part (`declaredCount`). |
| 10 | La projection est-elle reconstructible ? | **Oui.** Effacer tout champ dérivé et rejouer rend un résultat strictement égal (C7, testé). |
| 11 | La projection est-elle déterministe ? | **Oui.** Deux appels, sortie strictement égale (C6, testé). |
| 12 | Existe-t-il deux modèles de compétence ? | **Non.** `skill-state.mjs` et `skill-vocabulary.mjs` supprimés ; un seul fichier définit les états, vérifié par trois gates. |
| 13 | `/`, `/skills` et `/history` affichent-ils la même dernière preuve et le même décompte ? | **Oui.** Sonde navigateur : même décompte (« 15 preuves qualifiantes sur 31 »), mêmes compétences évaluées, même dernière preuve. *La question 13 de V65 passe à « oui » sans réserve.* |
| 14 | Un nombre affiché correspond-il toujours à une grandeur réelle ? | **Oui.** P0-2 corrigé ; la somme des crédits porte son propre nom et n'est jamais affichée comme un décompte de preuves. |
| 15 | Le produit affiche-t-il « 0 » pour dire « non évalué » ? | **Non.** 12 compétences non évaluées affichent « aucune trace enregistrée ». |
| 16 | Le produit invente-t-il une « dernière preuve » ? | **Non.** Une preuve hors journée n'a pas de `dayId` et ne produit plus de lien `/day/null`. |
| 17 | Un identifiant d'état anglais peut-il atteindre l'écran ? | **Non.** Vérifié par gate sur les textes du moteur et par sonde DOM sur 7 surfaces. |
| 18 | Une étiquette fine peut-elle s'afficher comme une compétence ? | **Non.** `competencyIds` n'est jamais rendu brut ; `/synthese` et `/history` traduisent. Sonde DOM sur 4 motifs connus. |
| 19 | Le produit explique-t-il ses états ? | **Oui.** Règle + faits + preuves retenues + provenance, produits par le moteur. Aucun texte de règle écrit en dur dans une route (vérifié par gate). |
| 20 | Le produit dit-il quand il ne peut RIEN proposer ? | **Oui.** `autonomy` : le manque est nommé comme celui du programme, pas de l'apprenant. |
| 21 | Une action proposée peut-elle contredire l'état affiché ? | **Non.** Testé : `demonstrate` n'est proposé que sur « Pratiquée », `practice` que sur « Non évaluée ». La régression du CP0 (« Démontrer JS/TS » sur une compétence consolidée) est impossible. |
| 22 | Un capstone réussi laisse-t-il une trace ? | **Oui — depuis ce sprint** (P0-5). |
| 23 | Le Curriculum 1.0 est-il intact ? | **Oui.** `git diff` vide sur `curriculum/` et `data/` ; 365 jours, ordre strict `1..365`. |
| 24 | Y a-t-il de la gamification ? | **Non.** Ni XP, ni niveau joueur, ni streak, ni classement, ni badge. Vérifié par gate sur `lib/` et `app/` (N13 vu échouer). |
| 25 | Le Retention Engine a-t-il été commencé ? | **Non.** Aucun moteur de répétition espacée supplémentaire (vérifié par gate) ; le pont s'arrête au candidat de révision. |

---

## 5. Audit UI/UX — 14 axes, notés /5

Sur les captures AFTER (`docs/design/v651/after/`, 50 fichiers), données réelles.

| Axe | Note | Fondement |
|---|---|---|
| Hiérarchie visuelle | 4 | Un point focal par page ; le détail de compétence oppose clairement « ce qui explique » à « ce qu'on peut en faire ». |
| Densité d'information | 4 | `/skills/[id]` porte 17 traces sans pagination et reste lisible ; `/history` a cessé d'être un mur grâce aux filtres. |
| Lisibilité | 4 | 0 débordement sur 90 états ; noms français partout ; plus d'identifiant brut. |
| Navigation / repérage | 4 | Compétence → détail → preuve → journée, et retour ; fil d'ariane sur le détail. |
| Responsive | 5 | 9 largeurs × 10 routes, 0 débordement. Le rail du détail passe au-dessus sous 900 px : sur mobile, la prochaine action est ce qu'on vient chercher. |
| Accessibilité | 4 | 0 axe critical/serious ; liens soulignés dans les blocs de texte ; état jamais porté par la seule couleur. |
| Cohérence des composants | 4 | `Panel`, `Status`, `ContextLine`, `PageHeader` réutilisés ; aucun motif nouveau introduit. |
| Feedback / erreurs | 4 | Trois catégories d'écrivain surveillées, chacune devant montrer son échec — dont une qui ne l'était pas. |
| États vides | **5** | « aucune trace enregistrée », « aucun diagnostic passé », « le programme ne propose rien » : le produit distingue *je ne sais pas* de *zéro*. |
| Honnêteté des chiffres | **5** | P0-2 fermé ; les deux grandeurs séparées ; « 20 affichées sur 31 enregistrées ». |
| Vocabulaire | 4 | Un seul lexique d'état, un seul lexique de compétence. Reste des libellés techniques dans la provenance — assumés, c'est leur rôle. |
| Explicabilité | **5** | Chaque état porte sa règle, ses faits, ses preuves et sa provenance ; chaque trace insuffisante dit pourquoi. |
| Friction pédagogique | 4 | La prochaine action nomme la preuve attendue et mène à une surface qui existe. |
| Apparence générique | 4 | Aucune décoration sans donnée ; l'échéancier, la trajectoire et l'échelle portent tous une grandeur réelle. |

**Moyenne 4,29 / 5. Aucun axe sous 4.**

---

## 6. Gauntlet

```
tests            : 1 381 / 1 381        (1 368 au CP0 ; +16 matrice, −3 ancien modèle)
tsc --noEmit     : 0 erreur
build            : compilé
gates:active     : 44 gates — VERT de bout en bout (ROUGE au CP0)
v651:check       : 44 vérifications
v651:negative    : 12 règles sur 12 VUES ÉCHOUER, 0 trou
v651:ux          : 0 débordement / 90 états · 0 axe critical|serious · 0 arrêt masqué
cohérence        : / et /skills — même décompte, mêmes compétences évaluées
curriculum/      : a2099b51… — git diff VIDE contre 2237f2d
data/            : 4d3e5e9c… — git diff VIDE
progress.json    : 73c1ee39… — inchangé ; et inchangé à l'octet près après
                   navigation exhaustive des 51 routes
journées         : 365, ordre strict 1..365
routes           : 51 (50 au CP0, +1 : /skills/[id]) — aucune supprimée
```

---

## 7. Dette

### P0 — aucune

Les six P0 ouverts au CP0 (P0-0 à P0-5) sont fermés, plus P0-6 trouvé en cours
de sprint.

### P1

| | Sujet | Pourquoi ce n'est pas P0 |
|---|---|---|
| P1-1 | `cloud` et `comm` n'ont **aucun exercice** ; `python`, `dl`, `agents`, `evalia` **aucun diagnostic** | Le produit le **dit** désormais (CP3). Combler suppose d'écrire du contenu pédagogique : interdit par l'invariant 2. À trancher hors sprint technique. |
| P1-2 | `app/design-spike/v60/b/dashboard` rend des libellés de compétence hors du modèle | Route de maquette, hors navigation, sans donnée de progression. |
| P1-3 | Les preuves héritées `days[N].evidence[]` coexistent avec le ledger | Elles ne sont plus lues par aucune surface d'état. Leur suppression est une migration de données, à décider explicitement. |

### P2

| | Sujet |
|---|---|
| P2-1 | La chronologie de `/synthese` est bornée à 20 sans pagination — le décompte total est affiché, mais il n'y a pas de « voir plus ». |
| P2-2 | `/skills/[id]` liste toutes les traces sans repli : au-delà de ~40, la page devient longue. |

**Aucune dette P0 silencieuse.** Chaque ligne ci-dessus est nommée, localisée et
justifiée.

---

## 8. Verdict

Les conditions ont été **fixées au CP1, avant toute mesure**
(`docs/V65-1-CRITERIA-FROZEN.md` §3) et n'ont pas été modifiées.

`COMPETENCY_PRODUCT_READY` exige : C1→C17 toutes tenues, 12 tests négatifs vus
échouer, `gates:active` vert, 0 dette P0.

| Condition | |
|---|---|
| C1 source unique | ✅ modèle concurrent supprimé, 3 gates |
| C2 divergence nulle | ✅ 0 écart (20/20 au CP0) |
| C3 vocabulaire unique | ✅ gate + sonde DOM |
| C4 aucun identifiant anglais | ✅ gate + sonde DOM sur 7 surfaces |
| C5 aucun nombre inventé | ✅ 15 sur 31, grandeurs séparées |
| C6 explicabilité déterministe | ✅ testé |
| C7 reconstructibilité | ✅ testé |
| C8 Skill Detail | ✅ `/skills/[id]` |
| C9 diagnostics convergents | ✅ + capstones (P0-5) |
| C10 historique utile | ✅ deux axes de filtre |
| C11 pont révision | ✅ non qualifiante, aucun second moteur |
| C12 idempotence et dédoublonnage | ✅ + P0-6 |
| C13 `progress.json` immobile | ✅ 51 routes |
| C14 aucune route supprimée | ✅ 50 → 51 |
| C15 les gates mesurent | ✅ 12/12 vues échouer |
| C16 Curriculum gelé | ✅ `git diff` vide |
| C17 aucune gamification | ✅ gate |

**17 / 17.**

`REFERENCE_READY` exige en plus un audit UI/UX ≥ 4/5 sur les 14 axes, sans axe
sous 3. Mesuré : **4,29 de moyenne, minimum 4**.

# VERDICT : `REFERENCE_READY`

---

## 9. Ce que ce sprint apprend

**Un gate qui énumère mesure une photo.** `v64:check` listait six fichiers ; le
produit a changé, la liste non, et `gates:active` est resté rouge pendant toute
la clôture de V65 sans que personne le lise. Dérivée, la même règle a trouvé
deux catégories d'écrivain qu'aucune règle ne surveillait.

**Deux gardes qui protègent le même invariant en se contredisant valent moins
qu'une.** L'identifiant déterministe et la clé métier n'étaient pas d'accord sur
ce qui constitue « le même fait ». La plus stricte des deux a gagné, et elle
jetait les réussites. Un test négatif qui reste vert parce que l'autre garde
attrape le cas ne prouve rien — c'est la deuxième fois en deux sprints.

**Une donnée absente n'est pas la même chose qu'un apprenant qui n'a rien
fait.** `autonomy` n'a aucune source dans le corpus. Sans le dire, le produit
faisait porter à l'apprenant un manque qui est le sien.

**La capture bat la métrique, encore.** Trois défauts de ce sprint —
« J1J12 », « DIAGNOSTIQDiagnostic », un bouton portant une phrase d'intention —
ont été vus à l'œil sur des captures pendant que toutes les sondes étaient
vertes. Et le dixième faux positif de sonde s'est encore corrigé dans la sonde.

**Une suite verte sur une progression vide ne mesure rien.** La fixture est
désormais un artefact du dépôt, produite par l'API réelle, couvrant les quatre
états, les sept types de source et le cas « raté puis réussi » — celui-là même
qui a révélé P0-6.
