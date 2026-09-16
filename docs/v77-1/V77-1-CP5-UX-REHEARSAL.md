# V77.1 · CP5 — RÉPÉTITION UX, ET LES TROIS DOCUMENTS

> Le CP4 a traversé la boucle en HTTP. Un humain, lui, ne poste pas de commande :
> il regarde une page et cherche le bouton. Le CP5 ouvre les cinq surfaces du
> protocole dans un **vrai navigateur**, puis écrit ce qu'un facilitateur et un
> participant auront sous les yeux.
>
> Relevé brut : `docs/v77-1/cp5-ux.json`.

---

## 1. Ce que le navigateur a montré

Chromium réel, 1280 × 900, `networkidle`, aucune erreur JavaScript sur aucune
surface.

| surface | étape | statut | mots | boutons | champs | erreurs JS |
|---|---|---|---|---|---|---|
| `/doc/lessons/api-production-contracts` | 2 | 200 | 5 837 | 3 | 0 | 0 |
| `/lab/http-rate-limit-decide` | 3-6 | 200 | 534 | 10 | 0 | 0 |
| `/retention` | 1, 7, 8 | 200 | **738** | **2** | **0** | 0 |
| `/transfer/throttling-everywhere` | 9 | 200 | 526 | 4 | **9** | 0 |
| `/settings` | 11 | 200 | 494 | 7 | 1 | 0 |

### 1.1 `/retention` confirme `R8` — visuellement, cette fois

**Deux boutons seulement**, et ce sont « Rechercher » et « Replier » : la barre
latérale. **Aucune amorce de rappel.** Le corps de la page dit, mot pour mot :

> « Notions du programme **128** · Rencontrées **0** · Mises à l'épreuve **0** »
> « **Aucune tentative de rappel enregistrée** »
> « **Rien à réactiver** : aucune notion n'a encore été tentée. »
> « 128 notions ne sont pas encore dans le décompte : le programme les enseigne
> dans des journées que tu n'as pas ouvertes. »

La page est **honnête et bien écrite** — elle refuse de deviner ce que
l'apprenant retient. Mais pour le pilote, elle est **inutilisable en l'état** :
un participant neuf n'y trouvera jamais `api-production-contracts`.

> Le CP4 avait mesuré l'absence dans le HTML. Le CP5 la voit à l'écran, avec la
> phrase exacte que le participant lira. **C'est cette phrase que le script du
> facilitateur cite**, pour que personne ne découvre l'écran vide en direct.

### 1.2 `/lab` — le chemin nominal fonctionne à l'écran

Après **un** clic sur « Lancer », la page affiche, sans rien demander :

```
Tests (2/4)   Console   Aide
2/4 tests · 53 ms
« les vieilles requêtes expirent » attend ["allow","allow","allow"]
                                   et reçoit ["allow","allow","deny"].
Compare la valeur attendue et la valeur obtenue : l'écart te dit quelle
étape du calcul dévie.
  deuxième échec : un indice ciblé, pas encore un exemple
Tests privés : 1/2 réussis (détails masqués)
Tentatives — cochez-en deux pour comparer
  16/09 11:09  2/4  53 ms  1 aide
```

Tout ce dont le protocole a besoin est **visible sans explication** : l'échec,
l'écart attendu/reçu, l'indice, le compteur d'aides, l'historique des
tentatives. Les boutons sont « Lancer ⌘⏎ », « Enregistrer », « Reset », et les
onglets « Tests », « Console », « Aide ».

### 1.3 `/transfer` — la forme correspond au défi

**9 champs** : 4 boutons radio (question 1, `mcq`), 4 cases à cocher
(question 2, `multi`), 1 champ libre *« Ta réponse… »* (question 3, `predict`),
puis « Corriger mes réponses ». C'est exactement la forme du défi
`throttling-everywhere` — trois questions, seuil 0,7.

### 1.4 `/settings` — le CP2 est bien à l'écran

Les cinq boutons sont là, dans l'ordre : « Exporter une sauvegarde » ·
« Télécharger l'archive complète » · « Choisir un fichier de sauvegarde » ·
« Réinitialiser la progression » · « Supprimer toutes mes données ».

La correction de wording du CP2 n'est pas restée dans le code : **elle est
devant les yeux du participant.**

---

## 2. Les trois documents

### 2.1 `V78-PARTICIPANT-PROCEDURE.md` — deux pages, rien à préparer

Ce qu'elle dit en premier, parce que c'est ce qui change tout :

> **« On teste un logiciel, pas toi. »**
> **« Rater un exercice est utile. Rater puis réessayer l'est encore plus. »**
> **« Personne ne verra une note. Il n'y en a pas. »**

Puis le déroulé en onze étapes, **les six phrases utiles** à dire à voix haute
(qui sont les six catégories de confusion, traduites en langage humain), et
les droits sur les données tels que le CP2 les a établis — **« ton code
compris »**, parce que c'est vrai depuis le CP2 et que ça ne l'était pas avant.

### 2.2 `V78-FACILITATOR-SCRIPT.md` — ce qui se dit, et ce qui ne se dit pas

Il s'ouvre sur la règle qui prime :

> **Une explication hors script rend la session `INVALID`.** Pas « moins
> bonne » : **inutilisable**. Le temps que la personne t'a donné est alors
> perdu, et c'est ta responsabilité, pas la sienne.

Il contient les **quatre questions de PRETEST rédigées mot pour mot**, le chemin
de repli de `R8` avec la requête exacte, les trois cas de l'exercice (échoue /
réussit du premier coup / abandonne), et **cinq phrases qu'il ne faut jamais
dire** — dont *« Ce n'est pas grave, tout le monde se trompe là-dessus »*, qui
est un indice déguisé.

### 2.3 `V78-PILOT-CHECKLIST.md` — une page, une copie par participant

Cases à cocher, de la préparation à la reconstruction. Elle porte le point le
plus fragile du protocole en section propre (§3).

---

## 3. Le point le plus fragile du protocole, et il tient sur papier

> **Rien, dans un fait de rappel, ne dit à quelle étape du protocole il
> appartient.**

Un `PRETEST` et un `IMMEDIATE_RETRIEVAL` produisent le **même genre de fait**,
sur le **même concept**, avec le **même `sourceRef`** (`/retention`). La
reconstruction ne les distingue que par leur **ordre** et par le **nombre
attendu** à chaque étape — nombre déclaré d'avance dans la fixture
(`occurrences`), donc légitime.

**Mais une amorce de trop décale tout l'alignement, et rien ne le signale.** La
trace reste vraie ; c'est le lecteur qui compte mal. *(Constaté au CP4 : le
rappel immédiat héritait de la seconde amorce du PRETEST, et le rapport annonçait
un instant « antérieur à l'étape précédente ».)*

La parade **n'est pas logicielle**. C'est un compteur, sur papier, dans la liste
de contrôle :

```
PRETEST prérequis  networking-http-tls        [ ] [ ]     exactement 2
PRETEST focal      api-production-contracts   [ ] [ ]     exactement 2
Rappel immédiat    api-production-contracts   [ ]         exactement 1
Rappel différé     api-production-contracts   [ ]         exactement 1

□ Aucune case en trop. Si débordement → NOTER, ne pas rattraper.
```

Écrire un mécanisme d'étiquetage d'étape dans les faits aurait été une
modification du moteur, pour un pilote de trois personnes, en touchant
précisément ce que l'instrumentation observe. **Une case à cocher coûte moins et
tient mieux.**

---

## 4. La taxonomie de confusion — gelée, et exécutable

`lib/confusion-taxonomy.mjs` — sept catégories, décidées **avant** le pilote.
Une catégorie inventée après avoir lu les rapports est une catégorie taillée sur
mesure, et le décompte qu'elle produit ne dit plus rien.

| catégorie | la question qui tranche | porte sur |
|---|---|---|
| `INSTRUCTION_UNCLEAR` | sait-elle **ce qu'on lui demande** de produire ? | le **TEXTE** |
| `UI_CONFUSION` | sait-elle **où cliquer** ? | la **SURFACE** |
| `CONCEPT_CONFUSION` | elle comprend la demande, **ne sait pas la satisfaire** | la **NOTION** |
| `TOOL_CONFUSION` | éditeur, clavier, navigateur | l'**OUTILLAGE** |
| `BUG` | le produit fait **le contraire de ce qu'il annonce** | le **PRODUIT** |
| `FATIGUE` | elle décroche **sans que rien ne soit incompris** | la **PERSONNE** |
| `OTHER` | aucune des six, honnêtement | rien de classable |

### 4.1 La distinction qui porte tout le pilote

`INSTRUCTION_UNCLEAR` contre `CONCEPT_CONFUSION`. La première dit qu'un **énoncé
est mauvais** ; la seconde qu'un **apprentissage n'a pas eu lieu**. Les confondre
rendrait le décompte muet, et c'est pourquoi `H6` du contrat gelé les nomme
explicitement.

### 4.2 Trois décisions que le code impose

- **`OTHER` sans verbatim est refusé.** Un décompte sans contenu ne sert à rien.
  `OTHER` existe pour **corriger la taxonomie**, pas pour la sauver.
- **Le décompte porte les sept catégories, y compris à zéro.** Un zéro est une
  information ; une catégorie absente du tableau est une information perdue.
- **Aucun rapport ne donne `NOT_OBSERVED`, pas `H6_TIENT`.** Une hypothèse qu'on
  n'a pas pu éprouver n'est pas une hypothèse vérifiée.

Falsification, gelée au CP1 : **plus d'un tiers des rapports en `OTHER`**.
`verdictH6()` rend le verdict **et son chiffre** — un seuil franchi doit pouvoir
être relu.

---

## 5. Les tests

`tests/v771-confusion-taxonomy.test.mjs` — **24 tests**. Ils ne tiennent pas le
style des documents : ils tiennent la **correspondance** entre le code, la
fixture et ce que le facilitateur aura sous les yeux.

| ce qui est tenu |
|---|
| les sept catégories, **pinnées en clair** |
| chacune porte la question qui la distingue **et** une conduite |
| `INSTRUCTION_UNCLEAR` et `CONCEPT_CONFUSION` portent sur des choses **différentes** |
| un rapport hors vocabulaire est **refusé**, jamais rangé de force |
| `OTHER` sans verbatim est **refusé** |
| le décompte porte les sept catégories, **y compris à zéro** |
| `H6` falsifiée au-delà d'un tiers, **avec son chiffre** |
| zéro rapport → `NOT_OBSERVED`, **pas** `H6_TIENT` |
| les sept catégories figurent dans le **script** ET dans la **liste** |
| le script **nomme le chemin de repli de `R8`** et cite la phrase que le participant lira |
| le **compteur d'amorces** figure dans les deux documents |
| les cinq règles d'arrêt `A1`–`A5` et les huit conditions `N1`–`N8` y figurent |
| le délai, la fenêtre et le seuil `PARTIAL` sont **les mêmes** que dans la fixture |
| le scope, l'exercice principal, l'exercice de secours et le transfert sont **ceux de la fixture** |
| le plafond au PRETEST donne **`INVALID`, pas `ABORTED`** |
| la procédure ne promet **aucune note, aucun score** |
| la liste rappelle ce que la session **ne permettra pas de conclure** |

---

## 6. Le gantelet

| | |
|---|---|
| `npm test` | **2280 / 2280** (2256 + 24) |
| `npx tsc --noEmit` | **0 erreur** |
| `npx next build` | **OK** |
| `npm run gates:active` | **50 portes, 0 violation** |
| navigateur réel | **5 surfaces, 0 erreur JS** |
| `data/progress.json` | **absent** |

---

## 7. Ce que le CP5 n'a pas fait

- **Aucune surface n'a été modifiée pour le pilote.** `/retention` reste telle
  qu'elle est — honnête et vide pour un participant neuf. Lui ajouter un mode
  « pilote » aurait fait voir au participant instrumenté autre chose que le
  produit : c'est `H4`, et c'est une règle d'arrêt.
- **Aucun formulaire de confusion n'a été construit dans le produit.** Le
  rapport de confusion vit **hors du produit**, par contrat — l'étape 10 le
  déclare `NO_FACT` depuis le CP3.
- **Aucun humain n'a été recruté, contacté ou sollicité.**
- **Le script n'a pas été « testé » sur quelqu'un.** Il a été écrit à partir de
  ce que le navigateur montre. La première fois qu'il sera lu à voix haute sera
  la première session — et c'est une limite, pas une omission.
