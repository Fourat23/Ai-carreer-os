# V78 — SCRIPT DU FACILITATEUR

> **Ce document se lit avant, et se suit pendant.** Les phrases en **gras
> encadré** se disent telles quelles. Tout ce qui n'y figure pas ne se dit pas.
>
> `protocolVersion = V78-PILOT-PROTOCOL-1` · scope `V78-SCOPE-HTTP-PRODUCTION`

---

## 0. La règle qui prime sur toutes les autres

> **Une explication hors script rend la session `INVALID`** (condition `N1` du
> contrat gelé). Pas « moins bonne » : **inutilisable**. Le temps que la personne
> t'a donné est alors perdu, et c'est ta responsabilité, pas la sienne.

Ce que tu as le droit de faire :

| ✅ autorisé | ❌ interdit |
|---|---|
| répéter une phrase du script **mot pour mot** | reformuler un énoncé « plus clairement » |
| aider sur le clavier, le navigateur, l'éditeur, le copier-coller | donner une piste sur l'exercice |
| dire « je ne peux pas t'aider là-dessus, et c'est normal » | confirmer qu'une réponse est bonne |
| noter une confusion | expliquer pourquoi c'est faux |
| proposer une pause | insister pour continuer |

Si tu déraille, **note-le immédiatement** et marque la session `INVALID`. Une
session honnêtement écartée vaut infiniment mieux qu'une session polluée qui
entre dans le décompte.

---

## 1. Avant l'arrivée — 10 minutes

```
□ Fichier de progression NEUF pour ce participant :
     export AICOS_PROGRESS_FILE=/chemin/hors/depot/<participant>.json
     export AICOS_PILOT_SESSION_ID=<identifiant de session>
  → Condition N5 : deux participants sur le même fichier
    rendent les DEUX sessions ininterprétables.

□ Serveur démarré, et vérifié :
     curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:<port>/api/progress   → 200

□ /settings ouvert une fois : les cinq boutons sont là
  (« Exporter une sauvegarde », « Télécharger l'archive complète »,
   « Choisir un fichier de sauvegarde », « Réinitialiser la progression »,
   « Supprimer toutes mes données »)

□ Compteur d'amorces de rappel prêt (§4.1) — papier, pas de mémoire

□ Grille de confusion sous la main (§6)

□ Aucune modification du produit prévue pendant la session (condition N8)
```

---

## 2. Accueil — 5 minutes

> **« Merci. Ce qu'on teste ici, c'est le logiciel, pas toi. On veut savoir si
> le système note correctement ce que tu fais — pas si tu réussis. »**

> **« Rater un exercice nous est utile. Rater puis réessayer nous est encore
> plus utile. Il n'y a aucune note, aucun score, et personne ne sera jugé. »**

> **« Dis tout ce qui te passe par la tête, surtout quand quelque chose te
> bloque. Et tu peux arrêter quand tu veux, sans te justifier. »**

> **« Je ne pourrai pas t'aider à résoudre l'exercice. Ce n'est pas de la
> sévérité : si je t'explique quelque chose, la séance ne sert plus à rien. Je
> peux t'aider sur ton clavier ou ton navigateur, ça oui. »**

Puis : donner `V78-PARTICIPANT-PROCEDURE.md`, laisser lire, répondre aux
questions **sur le protocole** — jamais sur le contenu.

---

## 3. Étape 1 — le PRETEST · ~10 minutes

### 3.1 Le chemin, et pourquoi ce n'est pas celui qu'on croit

> ⚠️ **`/retention` ne proposera RIEN.** Mesuré au CP4, et re-vérifié dans un
> navigateur : un participant neuf y lit *« Aucune tentative de rappel
> enregistrée »*, *« Rien à réactiver »*, et `Notions du programme 128 ·
> Rencontrées 0`. La station sert le **plan du jour**, qui dépend de la position
> dans le programme de 365 jours. Elle ne connaît pas notre participant.

**Ce n'est pas un bug, et il ne faut pas improviser devant la personne.** Le
PRETEST se conduit **oralement**, et le facilitateur enregistre chaque réponse
par la commande directe :

```
POST http://127.0.0.1:<port>/api/progress
Content-Type: application/json

{ "command": { "type": "RECORD_RECALL",
               "conceptId": "<concept>",
               "outcome": "recalled" | "partial" | "failed",
               "format": "<forme>",
               "sourceRef": "/retention" } }
```

Le fait écrit porte l'**instant serveur** et la provenance `recall-station`.
Exercé neuf fois pendant la répétition à blanc du CP4 : il fonctionne.

### 3.2 Les quatre amorces, dans cet ordre exact

| # | concept | forme | question posée à voix haute |
|---|---|---|---|
| 1 | `networking-http-tls` | `discrim` | **« Une requête HTTP qui renvoie 404 et une qui renvoie 500 — laquelle veut dire que le serveur a un problème, et pourquoi ? »** |
| 2 | `networking-http-tls` | `cued` | **« Qu'est-ce qu'une méthode HTTP, et peux-tu en citer trois ? »** |
| 3 | `api-production-contracts` | `free` | **« Si un client renvoie deux fois la même requête de paiement, qu'est-ce qui devrait se passer ? »** |
| 4 | `api-production-contracts` | `discrim` | **« Un service limite à 100 requêtes par minute. Le compteur repart-il à zéro chaque minute, ou glisse-t-il ? Qu'est-ce que ça change ? »** |

**Procédure pour chacune** : poser la question · **laisser répondre à voix haute
avant toute révélation** · demander **« tu savais, à moitié, ou pas ? »** ·
enregistrer ce que la personne déclare, **jamais ton propre jugement**.

> L'issue d'un rappel est **auto-déclarée** par le participant — c'est ainsi que
> le produit fonctionne, et son niveau de preuve plafonne à `DECLARED`. Ta seule
> parade est de faire **dire la réponse avant de révéler**, et de **noter tout
> écart** entre ce qui est dit et ce qui est déclaré. Tu notes l'écart ; tu ne
> corriges pas la déclaration.

### 3.3 Les deux décisions, chiffrées

| constat | décision |
|---|---|
| amorces **3 et 4** toutes deux `recalled` | **`PRETEST_HIGH`** → basculer sur le scope de repli `V78-SCOPE-ALGO` (`algorithmic-thinking`). Si le repli plafonne aussi → **`INVALID`** (`N6`), **pas** `ABORTED` |
| amorces **1 et 2** toutes deux `failed` | **`MISSING_PREREQUISITE`** → **`INVALID`** (`N7`). Dire : **« Le prérequis HTTP n'est pas là, et c'est une information pour nous. On s'arrête ici, merci beaucoup. »** |

---

## 4. Étape 2 — la leçon · ~30 minutes

Ouvrir `/doc/lessons/api-production-contracts`.

> **« Lis normalement. Tu n'as pas à mémoriser. Dis-moi si une phrase te bloque —
> c'est exactement ce qu'on cherche. »**

Ne rien dire d'autre. Ne pas commenter. Ne pas répondre à « c'est ça que ça veut
dire ? ».

### 4.1 Le compteur d'amorces — à tenir sur papier

> **Rien, dans un fait de rappel, ne dit à quelle étape du protocole il
> appartient.** Un PRETEST et un rappel immédiat produisent le même genre de
> fait, sur le même concept, avec le même `sourceRef`. La reconstruction les
> distingue **uniquement** par leur ordre et par le nombre attendu à chaque
> étape, déclaré d'avance dans la fixture.
>
> **Une amorce de trop décale tout l'alignement, et rien ne le signale.**

```
PRETEST prérequis   [ ][ ]      exactement 2
PRETEST focal       [ ][ ]      exactement 2
Rappel immédiat     [ ]         exactement 1
Rappel différé      [ ]         exactement 1
```

Si une case déborde : **le noter immédiatement dans le rapport de session.** Ne
pas « rattraper ». C'est une donnée, pas une faute.

---

## 5. Étapes 3 à 6 — l'exercice · ~25 minutes

Ouvrir `/lab/http-rate-limit-decide`.

> **« Le code de départ contient déjà un bug. C'est voulu. Lance les tests quand
> tu veux. »**

Ce que la personne voit, vérifié au navigateur : la consigne, un éditeur avec
`solution.mjs`, les boutons **« Lancer ⌘⏎ »**, **« Enregistrer »**, **« Reset »**,
et les onglets **« Tests »**, **« Console »**, **« Aide »**. Après un échec :
`2/4 tests`, l'écart attendu/reçu, un indice ciblé, la mention
*« Tests privés : 1/2 réussis (détails masqués) »*, et la liste des tentatives
avec **« 1 aide »**.

### 5.1 Les trois cas, et ce qu'on fait

| cas | conduite |
|---|---|
| **échoue puis réessaie** | c'est le chemin nominal. **Ne rien dire.** Laisser lire l'indice. |
| **réussit du PREMIER coup** | **« Parfait. On en fait un second, plus court. »** → passer à `api-pagination-choice`. Les étapes 3-4-5 du premier exercice sont notées `NOT_OBSERVED`, **jamais `FAILED`**. |
| **réussit aussi le second du premier coup** | noter les trois étapes `NOT_OBSERVED`. La session reste **`COMPLETE`**. |
| **bloque et demande de l'aide** | **« Je ne peux pas t'aider là-dessus, et c'est normal. Regarde l'onglet Aide, il y a un indice. »** |
| **veut abandonner** | **« Aucun problème. On note que tu t'arrêtes là. »** → étape suivante, rien n'est raté. |

### 5.2 Ne pas relancer deux fois d'affilée en moins d'une seconde

Deux lancements identiques dans la **même seconde** produisent la même clé
métier et le second est traité comme un rejeu réseau : il n'est pas enregistré.
Un humain ne le fait pas. **Si la personne double-clique sur « Lancer », le
noter.**

---

## 6. Étape 7 — le rappel immédiat · 3 minutes

**UNE seule amorce**, format `free`, concept `api-production-contracts` :

> **« Sans regarder la leçon : à quoi sert une fenêtre glissante, et pourquoi
> pas un simple compteur remis à zéro ? »**

Laisser répondre. Demander **« tu savais, à moitié, ou pas ? »**. Enregistrer.
Cocher la case.

> **« On se revoit demain, une quinzaine de minutes. Viens à l'heure qui
> t'arrange. »**

Noter l'**heure exacte de fin** : la fenêtre acceptée est `[18 h, 36 h]`, et
au-delà de **72 h** la session devient `PARTIAL`.

---

## 7. Séance 2 — rappel différé, transfert, clôture · ~15 minutes

### 7.1 Étape 8 — le rappel différé

**La MÊME question qu'à l'étape 7**, mot pour mot, format `discrim`. Même
procédure, même case à cocher.

> Si le délai réel sort de `[18 h, 36 h]`, l'enregistrer quand même et **noter le
> délai réel**. Il sera marqué `DELAY_OUT_OF_WINDOW` : exclu du décompte de
> l'intégrité du délai, **conservé** dans le résultat principal.
> **Ne jamais décaler une heure pour « faire entrer » une session dans la
> fenêtre** — ce serait le mensonge que tout ce protocole existe pour éviter.

### 7.2 Étape 9 — le transfert

Ouvrir `/transfer/throttling-everywhere`.

> **« Trois questions. C'est fait pour être difficile, et se tromper n'est pas
> grave. Le sujet n'a rien à voir avec une API — c'est le but. »**

Vérifié au navigateur : quatre boutons radio (question 1), quatre cases à cocher
(question 2), un champ libre *« Ta réponse… »* (question 3), puis **« Corriger
mes réponses »**. Seuil de réussite : **0,7**.

**Ne commenter aucune réponse, même après correction.**

### 7.3 Étape 10 — le rapport de confusion · 5 minutes

> **« Qu'est-ce qui t'a bloqué, à n'importe quel moment ? »**
> **« Y a-t-il eu un moment où tu ne savais pas où cliquer ? »**
> **« Y a-t-il eu une consigne que tu as dû relire plusieurs fois ? »**

Pour chaque chose citée, ranger dans **une** catégorie. La grille :

| catégorie | la question qui tranche |
|---|---|
| `INSTRUCTION_UNCLEAR` | sait-elle **ce qu'on lui demande** de produire ? |
| `UI_CONFUSION` | sait-elle **où cliquer**, ou ce que le produit vient de faire ? |
| `CONCEPT_CONFUSION` | elle comprend la demande, **mais ne sait pas la satisfaire** |
| `TOOL_CONFUSION` | éditeur, clavier, navigateur — **pas le produit** |
| `BUG` | le produit fait **le contraire de ce qu'il annonce** |
| `FATIGUE` | elle décroche **sans que rien ne soit incompris** |
| `OTHER` | aucune des six, **honnêtement** → écrire le **verbatim complet** |

> **`INSTRUCTION_UNCLEAR` contre `CONCEPT_CONFUSION` est LA distinction du
> pilote.** La première dit qu'un énoncé est mauvais ; la seconde qu'un
> apprentissage n'a pas eu lieu. Les confondre rendrait le décompte muet.
>
> `OTHER` sans verbatim est refusé : un décompte sans contenu ne sert à rien.
> Si plus d'un tiers des rapports tombent en `OTHER`, **`H6` est falsifiée** —
> et c'est un résultat, pas un échec.

### 7.4 Étape 11 — clôture et données

```
□ /settings → « Télécharger l'archive complète » → remettre le fichier
□ Demander : « Veux-tu qu'on efface tout maintenant ? »
     si oui → « Supprimer toutes mes données », saisir SUPPRIMER, puis
              re-télécharger l'archive DEVANT la personne : elle est vide
□ Remercier. Ne pas commenter sa performance. Il n'y en a pas.
```

---

## 8. Les règles d'arrêt — à connaître par cœur

**Arrêter la session (`ABORTED`) immédiatement si :**

- la personne demande à s'arrêter — **sans avoir à se justifier** ;
- elle manifeste de la fatigue ou de la gêne ;
- un défaut du produit bloque, et tu ne peux pas le contourner **sans sortir du
  script**, en moins de **10 minutes** ;
- une perte de données est constatée ;
- **tu t'aperçois que tu as donné une aide hors script.**

**Arrêter tout le pilote si :**

| # | déclencheur |
|---|---|
| `A1` | **2 des 3 premières** sessions `ABORTED` pour défaut produit |
| `A2` | l'instrumentation modifie ce qu'elle observe |
| `A3` | une donnée d'apprenant ne peut pas être supprimée ou exportée comme promis |
| `A4` | une donnée d'apprenant est perdue ou exposée |
| `A5` | la version de protocole appliquée n'est pas celle qui est gelée |

`A2`, `A3` et `A4` **invalident rétroactivement** les sessions déjà conduites
sous la même version de protocole. C'est coûteux, et c'est le prix de la
déclaration préalable.

---

## 9. Les cinq phrases qu'il ne faut jamais dire

> ❌ « C'est presque ça. »
> ❌ « Regarde plutôt du côté de… »
> ❌ « Ce n'est pas grave, tout le monde se trompe là-dessus. » *(c'est un indice déguisé)*
> ❌ « Tu as bien réussi. »
> ❌ « Normalement ça devrait marcher. » *(si ça ne marche pas, c'est un `BUG` à noter)*
