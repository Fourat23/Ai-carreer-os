# V70 — CORE CURRICULUM DEEP REWRITE II
## Finir le corpus, et casser le moule

> Écrit après le rapport final V69, conformément au §29 du brief V69.
> **Ne pas lancer sans décision humaine sur le §2 ci-dessous.**

---

## 0. Mode d'exécution

Exécute CP0 → CP15 de manière autonome. Ne t'arrête pas après un checkpoint ou un
commit intermédiaire. Demande une décision humaine uniquement si : deux choix
pédagogiques incompatibles modifieraient réellement le curriculum ; une information
fondamentale manque et l'inventer serait dangereux ; une modification toucherait un
invariant protégé ; une action destructive est nécessaire. Sinon : prends la décision
la plus conservatrice, documente-la, continue.

Si la limite de session approche : commite un état cohérent, pousse, écris précisément
où reprendre et quel est le prochain checkpoint. **Ne présente pas le sprint comme
terminé.** Le verdict n'arrive qu'après CP15.

## 1. Interdictions absolues

Identiques à V69, sans exception :
modifier `progress.json` pour faire passer un test · modifier les données utilisateur ·
modifier l'ordre des 365 jours sans décision explicite · inventer une notion déjà
« acquise » · inventer des résultats de progression · ajouter XP, streak, niveaux ou
gamification · falsifier un temps de lecture · assouplir un gate après mesure pour
obtenir READY · remplacer une explication par davantage de mots-clés.

Fais un snapshot AVANT immuable et hashé. Aucun contenu pédagogique ne doit
disparaître silencieusement.

**Un interdit nouveau, issu de V69 :** ne renomme pas des étiquettes pour faire bouger
une sonde. Si une mesure te déplaît, soit tu changes le fond, soit tu déclares la
limite de la mesure. Jamais la surface.

## 2. DÉCISION HUMAINE REQUISE AVANT DE COMMENCER

Le barème V69 note le **corpus** (128 leçons) ; les sprints traitent un **périmètre**.
Tant que les deux ne coïncident pas, aucun sprint partiel ne peut atteindre
`ACADEMIC_QUALITY_READY` — V69 a échoué sur 6 conditions sur 6 pour cette seule
raison arithmétique, alors que son périmètre atteignait 4,25 de moyenne.

Trois options, et c'est à l'humain de trancher :

- **(a)** Finir le corpus en V70 (88 leçons restantes). Beaucoup de travail, mais
  READY redevient atteignable.
- **(b)** Garder le barème corpus et accepter plusieurs sprints sans READY, en suivant
  la progression du D6 corpus sprint après sprint.
- **(c)** Introduire un verdict par périmètre, distinct du verdict corpus.

**Ne choisis pas seul.** Cette décision change ce que « terminé » veut dire.

## 3. Objectif principal

Deux chantiers, dans cet ordre de priorité.

### Chantier 1 — casser le moule (les 40 leçons de V69)

C'est le défaut principal identifié par V69 sur son propre travail, mesuré :

| motif | leçons concernées |
|---|---|
| étiquette « **Décision N** » | 33 / 40 (83 %) |
| exactement 3 ou 4 unités étiquetées | 36 / 40 (90 %) |

Le brief V69 §7 interdisait « même nombre de sections ; mêmes titres ». V69 a produit
quarante exemples au même rythme. Le contenu est bon et vérifié — la forme est un
gabarit.

**La consigne est exigeante et il faut la lire deux fois : re-décide la forme de
chaque exemple en fonction de son sujet.** Certains appellent deux décisions creusées,
d'autres six brèves, d'autres aucune étiquette du tout. Renommer « Décision 2 » en
« Deuxième question » n'est pas un correctif, c'est une fraude à la mesure.

Sept leçons V69 montrent que c'est faisable et servent de modèles de variation :
`api-design-basics` (questions du consommateur), `express-backend` (enquête),
`clean-code` (passes successives), `error-handling` (tableau de pannes),
`docker-containers` (candidats éliminés), `prompt-injection-defense` (couches qu'on
regarde échouer), `transformers` (calcul déroulé).

**Ne rallonge pas ces 40 leçons.** Elles font 586 à 927 mots ; c'est assez. Si une
réécriture de forme les allonge, elle a échoué.

### Chantier 2 — les 88 leçons intouchées

77 d'entre elles ont un exemple guidé sous 120 mots ; la médiane est de 84 mots contre
752 sur le périmètre V69. Le corpus est à deux vitesses, et c'est visible pour
n'importe quel lecteur qui ouvre `docker-containers` (753 mots) et
`docker-networking-volumes` (58) le même jour.

Le défaut dominant de ce lot n'est pas la longueur : c'est le **catalogue** — une liste
de vérifications correctes qui n'enseigne aucun critère de décision.
`slo-error-budget` explique comment calculer un budget d'erreur, jamais comment décider
d'arrêter de livrer. C'est la seule question intéressante du sujet.

Cible : 35 à 45 leçons, priorité aux leçons les plus fréquentées du parcours.
`css-fundamentals` est le meilleur candidat du lot — il lui manque un seul choix pesé.

## 4. Le chantier que V69 a aggravé, et qu'il faut regarder

**La pratique n'a pas bougé.** D8 est resté à 3,50 : l'apprenant lit désormais un
exemple guidé de 750 mots qui pèse quatre décisions, puis tombe sur un mini-exercice
inchangé. V69 a creusé un déséquilibre entre la lecture et l'entraînement.

Ce n'est pas forcément le sujet de V70 — mais si tu ne le traites pas, **écris-le dans
le rapport final** au lieu de le laisser passer une deuxième fois.

## 5. Principe éditorial

Inchangé depuis V69 :
PROBLÈME → INTUITION → MODÈLE MENTAL → VOCABULAIRE → MÉCANISME → EXEMPLE → LIMITE →
PRATIQUE → TRANSFERT. Le jargon arrive APRÈS que le besoin soit intelligible.

Critère de suffisance d'un exemple guidé, inchangé et non négociable : **au moins trois
décisions, et pour chacune, pourquoi celle-là plutôt qu'une autre.**

## 6. La règle de preuve, à conserver

C'est l'acquis méthodologique de V69, et il ne doit pas se perdre : **vérifie par
exécution plutôt que par relecture.** 27 scripts sont committés dans
`scripts/v69-verifications/` — étends ce répertoire, ne le contourne pas.

Trois règles qui en découlent :

1. Ce qui ne peut pas être vérifié n'est pas chiffré. V69 a déclaré cinq zones non
   vérifiables (Docker, LLM, PyTorch, timeout réseau, zombies) plutôt que d'inventer.
2. Une sonde qui contredit une lecture attentive est probablement fausse. V69 en a
   déclaré deux (le temps des journées de revue, l'étiquetage des décisions) et les a
   corrigées **sans aligner les leçons dessus**.
3. Publie tes propres erreurs. V69 a écrit puis mesuré fausse une affirmation sur
   `useEffect` ; elle est corrigée et le fait est dans le rapport.

## 7. Interdiction du « AI course slop »

Reprise de V69 §7, et cette fois **elle est le sujet du chantier 1**, pas une consigne
de fond : « Dans cette leçon, nous allons… » partout ; même nombre de sections ; mêmes
titres ; listes interminables ; analogies artificielles systématiques ; surusage du
gras ; emojis ; slogans ; storytelling artificiel ; anecdotes inventées.

**VARIE LA FORME EN FONCTION DU CONTENU.** V69 a échoué sur ce point ; ne le répète pas.

Ajout issu de la lecture V69 : surveille l'**épigramme en gras de fin de paragraphe**
(« X n'est pas Y »). 20 des 40 leçons V69 en portent une, et elle est parfois une
reformulation de ce que le paragraphe vient de démontrer. Vraie mais inutile.

## 8. Anti-scope-collapse

≥ 70 % de contenu pédagogique réel · ≤ 15 % audit et vérification factuelle ·
≤ 10 % tests et portes · ≤ 5 % correctifs de rendu.

Si après CP5 tu as écrit plus d'outillage que de contenu : **arrête l'outillage et
reviens aux cours.**

Les scripts peuvent compter, trouver, vérifier, détecter, comparer. **Ils ne doivent
pas écrire les cours à ta place.**

## 9. Ce que le CP15 doit répondre

A. Le contenu seul justifie-t-il le produit — sur le corpus entier, cette fois ?
B. Modèles mentaux ou vocabulaire ?
C. Est-ce que ça a encore l'air généré par un gabarit ? **Mesure-le, ne l'estime pas.**
D. Les 10 meilleures leçons et pourquoi.
E. Les 10 plus faibles et pourquoi.
F. Les défauts systémiques pour V71.

## 10. Livrables obligatoires

- `docs/V70-FINAL-REPORT.md` — 25 sections minimum
- `docs/V70-LESSON-LEDGER.md` — une ligne par leçon du corpus
- Un audit aveugle avec **graine neuve** (`20260829` est brûlée, comme `20261101` et
  `20261102`), tiré et publié **avant** lecture des résultats, incluant des leçons
  traitées et non traitées.
- Le prompt V71, écrit **après** le rapport final. Ne lance pas V71.

## 11. État d'entrée

Branche `claude/ai-career-os-saas-phfg49`. Corpus des leçons figé à
`64748e15`. Portes actives : 52, vertes. Tests : 1420/1420. `tsc` : 0.
Lis `docs/V69-FINAL-REPORT.md`, `docs/V69-CP14-INSPECTION-HUMAINE.md` et
`docs/V69-LESSON-LEDGER.md` avant d'écrire une ligne.

---

## Dernière consigne

Le danger de V69 était de produire 40 cours plus longs qui restent médiocres. Il a
été évité sur le fond et **manqué sur la forme**.

Le danger de V70 est différent et plus insidieux : produire 40 cours de plus au même
moule, et croire que le corpus s'améliore parce que la médiane monte. Ne confonds
jamais **uniformité** avec **cohérence**, **structure** avec **pédagogie**, ni
**une médiane qui monte** avec **un apprenant qui comprend**.
