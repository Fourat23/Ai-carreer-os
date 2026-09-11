# V74 · CP12 — EXPLICATION À L'APPRENANT ET AUDIT UI/UX

> **Critère BLOQUANT B12 :** *« READY est interdit si le scheduler n'est pas réellement utilisé
> par le produit. »*
>
> **Réponse avant ce checkpoint : NON.** Aucun des six modules écrits entre le CP2 et le CP11
> n'était atteignable depuis le produit.

---

## 1. L'audit, et le fait qu'il a établi

Audit en lecture seule, sur le code réel et le rendu réel (serveur lancé, quatre viewports).
Aucune modification pendant l'audit.

**Le constat qui commande le checkpoint :**

| module | checkpoint | références dans `app/` | read-model |
|---|---|---|---|
| `learner-memory` | CP2 | **0** | **0** |
| `retention-priority` | CP3 | **0** | **0** |
| `retention-scheduler` | CP4 | **0** | **0** |
| `retrieval-task` | CP5 | **0** | **0** |
| `remediation` | CP7 | **0** *(7 correspondances, toutes de faux positifs : capstones, cloud, libellé de phase)* | **0** |
| `daily-plan` | CP10 | **0** | **0** |

**Six modules, des centaines de tests verts, et rien qu'un apprenant puisse voir.** C'est
exactement ce que B12 vise, et c'est le genre de situation qu'un tableau de tests verts cache
parfaitement.

### Constats classés

| # | sév. | route | constat (preuve) |
|---|---|---|---|
| 1 | **P0** | toutes | les 6 modules V74 injoignables (tableau ci-dessus) |
| 2 | **P0** | `/retention` | la page consomme `getRetentionSummary()` (V66) : l'ordre vient des **réussites consécutives seules**. Les 7 facteurs du CP3, les bandes du CP8 et la place réservée n'existent pas pour l'apprenant |
| 3 | **P0** | `/lab/[id]` | après un échec, seulement `passed/total` + le diff (`LabWorkspace.tsx:472-486`). **Aucune remédiation** |
| 4 | **P1** | `/retention` | le « pourquoi » affiché est un **fait** V66 (« Échéance dépassée (7 j) »), pas la priorité explicable du CP3 |
| 5 | **P1** | `/day/[id]` | ni charge du jour ni signal de ralentissement (CP10) |
| 6 | **P1** | `/transfer` | **404** — 25 défis prêts, aucune route (dette D10) |
| 7 | **P1** | `/day/[id]` | `DayCorrection.tsx:35` : `outcome: 'attempted'` **en dur** (dette D3) |
| 8 | **P2** | `/retention` | l'état vide est **exemplaire** — à préserver tel quel |

**Ce qui était déjà bon et n'a pas été « amélioré »** : responsive **0 débordement / 0
superposition** aux 4 viewports · `<html lang="fr">` · 20 règles `focus-visible` · `role="alert"`
sur les erreurs, `role="group"` + `aria-label` sur les issues · **aucun score chiffré** ·
le geste « consigne d'abord, réponse après » du CP6 de V66.

---

## 2. Ce qui a été branché

**Aucun redesign.** Un read-model nouveau, quatre fichiers touchés, les composants existants
réutilisés tels quels (`Panel`, `InlineNotice`, `ContextLine`), et **aucune couleur ni motif
nouveau** — les styles ajoutés n'emploient que des jetons existants du design system.

### 2.1 `lib/plan-jour-server.ts` — la couche qui manquait

Elle assemble la chaîne dans l'ordre du contrat et **ne décide rien** :

```
faits persistés → learner-memory (CP2) → priorité (CP3) → scheduler (CP4)
                → tâche (CP5) → budget de journée (CP10)
```

Aucun seuil, aucune échelle : elle appelle, dans l'ordre, des modules qui décident déjà. C'est ce
qui l'empêche de devenir un sixième moteur.

### 2.2 `/retention` — l'arbitre décide de l'ORDRE, V66 de l'ÉTAT

Le partage est celui que le CP1 avait écrit (§4 du contrat) : V66 garde l'état d'une notion,
l'arbitre l'ordre, la forme, le budget et le pourquoi.

Ce que l'apprenant voit maintenant, **vérifié sur le rendu réel** :

> **Terminal, shell et système de fichiers** — À revoir
> *ta dernière tentative n'a pas abouti, il y a 16 jours, et tu n'y es pas revenu depuis, et tu
> l'as retrouvé il y a 39 jours.*
> **Question posée · environ 3 min**
> Réponds à voix haute aux questions d'entretien de la leçon, sans les relire d'abord.

Quatre checkpoints sont visibles dans ces quatre lignes : le **pourquoi explicable** du CP3 (deux
facteurs cités, jamais plus — critère B10), la **forme soutenue après un échec** du CP4, la
**consigne d'un archétype réel** du CP5 citant une section de la leçon, et le **coût en minutes**
du CP10.

Et la place réservée du CP8 se voit aussi :

> **JavaScript asynchrone** — Nouveau
> *tu l'as rencontré, mais tu ne l'as jamais mis à l'épreuve.*

### 2.3 Le laboratoire — la remédiation du CP7, enfin rendue

Vérifié par un appel réel à l'API, sur un exercice délibérément cassé :

```
tests     : 2 / 5
action    : SOUS_PROBLEME
niveau    : 1
raison    : premier échec, 2/5 tests passent : il avance, on le focalise plutôt que de l'aider
consigne  : Oublie les autres tests. Fais passer celui-ci, et seulement celui-ci :
            « aria-label gagne sur le texte ».
prochaine : INDICE
```

**Au premier échec, l'apprenant ne reçoit pas la réponse** — il reçoit un objectif unique, tiré
d'un test réel. Et `prochaine` lui dit que l'aide montera s'il en a besoin, ce qui évite
d'aller chercher la solution ailleurs.

**L'anti-fuite est préservé** : seuls les tests **publics** échoués sont nommés. Un sous-problème
tiré d'un test privé révélerait l'attendu — un test le garde.

### 2.4 Trois autres signaux atteignent l'apprenant

- le **signal de charge** du CP10 (`InlineNotice`) — qui **propose** sans décider : « c'est toi
  qui décides, le programme ne saute rien tout seul » ;
- **ce que l'arbitre a écarté**, avec le motif (« budget de la session atteint ») — le CP4 traite
  `differes` comme une *sortie*, pas un reliquat : savoir ce qui n'a pas été retenu rend l'ordre
  contestable ;
- le **signal silencieux du CP11** : « *N* notions que tu sais retrouver n'ont jamais été
  employées hors de leur contexte d'origine. Rien n'échoue dessus, donc rien ne t'alerte — c'est
  précisément pourquoi c'est écrit ici. »

---

## 3. Deux défauts trouvés en LISANT LA PAGE RENDUE, pas en lisant le code

Les deux sont passés au travers de `tsc`, des 1556 tests et du build. Ils ne sont apparus qu'en
regardant le HTML servi par le vrai serveur, contre un état d'apprenant synthétique.

### 3.1 La page annonçait un exercice et en demandait un autre

Le libellé de forme venait de la forme choisie par **V66**, la consigne de la forme choisie par
le **CP4**. Résultat affiché :

> **Mise en application** · environ 3 min
> *Réponds à voix haute aux questions d'entretien de la leçon.*

« Mise en application » est `applied` ; la consigne est celle de `CONCEPTUAL_QUESTION`, qui est
`cued`. **Une carte ne peut pas annoncer un exercice et en demander un autre.** J'avais remplacé
la consigne sans remplacer la forme.

Corrigé : la forme vient du même décideur que la consigne. Un test le garde.

### 3.2 « Rien n'est dû aujourd'hui » pendant que le plan écartait des unités

La page affichait simultanément *« Rien n'est dû aujourd'hui »* et, dans le rail, *« Écarté
aujourd'hui : TypeScript — budget de la session atteint »*. Une page qui se contredit à deux
centimètres d'intervalle.

Cause : je cherchais les unités du plan dans `s.queue` (la file **due** de V66) au lieu de
`s.projection` (toutes les notions). Le choix de l'arbitre était donc **refiltré par la règle
d'échéance de V66** — deux décideurs pour une même question.

Corrigé : un seul décide de l'ordre. L'état vide se lit désormais sur le plan, pas sur la file
V66.

**Ces deux défauts sont l'argument le plus fort en faveur du CP12 lui-même** : un moteur qu'on
ne regarde pas fonctionner peut être parfaitement testé et parfaitement faux à l'écran.

---

## 4. Une porte a rougi, et elle avait raison de regarder

`v651:check` règle **C11** a rougi sur `lib/retention-priority.d.ts` et
`lib/retention-scheduler.d.ts` : des fichiers de `lib/` dont le nom porte « retention ».

**Mais un `.d.ts` ne contient aucune implémentation.** Il déclare les types de son jumeau, sans
une ligne exécutable — il ne peut pas être un moteur. La liste contenait d'ailleurs déjà
`lib/retention.d.ts` : la nature du fichier était reconnue, mais au cas par cas, ce qui obligeait
à rallonger la liste à chaque nouveau jumeau.

**Ce n'est pas un élargissement de confort, et la preuve est négative** : les `.d.ts` restent
intégralement soumis à la **vérification de propriété** (qui scanne `.ts$`). Vérifié en injectant
un `INTERVALS = [1,2,3]` dans un faux `.d.ts` :

```
❌ [C11] aucune ÉCHELLE D'ESPACEMENT hors des deux moteurs nommés — lib/faux-moteur.d.ts
```

Et un vrai `.mjs` non déclaré rougit toujours :

```
❌ [C11] aucun TROISIÈME moteur de répétition espacée — lib/retention-faux.mjs
```

**On retire du contrôle par le NOM ce que le nom ne sait pas juger, et on laisse le contrôle par
la PROPRIÉTÉ intact.**

---

## 5. B12 est désormais gardé par un test, pas par une lecture

`tests/v74-b12-branchement.test.mjs` (10 tests) ne teste pas une fonction : il teste un
**branchement**. Si quelqu'un débranche le moteur, la suite rougit.

Il vérifie que les cinq modules sont dans le read-model, que la page appelle l'arbitre, que le
pourquoi du CP3 atteint l'écran, que forme et consigne viennent du même décideur, que la
remédiation est calculée puis rendue, que les tests privés ne fuitent pas, et qu'aucun score
chiffré n'est interpolé.

### Une de ses assertions était creuse, et une mutation l'a révélé

La première version se contentait de `includes('getPlanDuJour')`. Une mutation qui remplaçait
l'appel par un objet vide **passait** : le nom subsistait dans un
`as ReturnType<typeof getPlanDuJour>`.

**Le test gardait la présence d'une chaîne, pas l'existence d'un branchement** — le motif exact
des anomalies n° 9 et n° 10 de ce sprint. Corrigé en exigeant la forme d'un appel affecté
(`/=\s*getPlanDuJour\s*\(/`). Les trois mutations rougissent désormais.

---

## 6. Ce qui n'est PAS fait, et reste en dette

- **`/transfer` reste en 404** (dette D10, verrous 1 à 3). Créer la page demandait aussi de lier
  les 25 défis aux journées — donc de toucher au curriculum. Hors périmètre d'un checkpoint
  d'interface ;
- **dette D3** (`outcome: 'attempted'` en dur) — non payée ;
- **la tendance de l'arriéré n'est pas persistée**, donc le signal reste en « vigilance » et ne
  propose jamais de ralentir. **Inventer une tendance aurait été fabriquer un fait** : le
  read-model passe `tendance: null` et le dit en commentaire.

---

## 7. Vérifications

**1566 / 1566 tests** (10 nouveaux) · `tsc` 0 · **build OK** · **46 portes, 0 violation** ·
responsive **0 débordement / 0 superposition** aux 4 viewports · **0 score chiffré** dans le HTML
servi · `data/progress.json` **absent** (l'état synthétique de vérification a été écrit hors du
dépôt, via `AICOS_PROGRESS_FILE`).

---

## 8. Fichiers

**Créés** : `lib/plan-jour-server.ts`, `lib/daily-plan.d.ts`, `lib/learner-memory.d.ts`,
`lib/retention-priority.d.ts`, `lib/retention-scheduler.d.ts`, `lib/retrieval-task.d.ts`,
`tests/v74-b12-branchement.test.mjs` (10 tests), ce document.

**Modifiés** : `app/retention/page.tsx`, `app/retention/RecallStation.tsx`,
`app/api/lab/[exerciseId]/route.ts`, `app/lab/[exerciseId]/LabWorkspace.tsx`,
`app/globals.css` (jetons existants uniquement), `scripts/v651-check.mjs` (C11 : les `.d.ts`
sortent du contrôle par le nom, restent sous celui par la propriété).
