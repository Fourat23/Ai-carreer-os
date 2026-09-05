<!-- keep -->
# Leçon — Préparation à l'entretien IA

## 🌍 Le problème d'abord
Tu décroches enfin un entretien pour un poste IA junior. Tu connais tes projets… mais le jour J, le stress te fait bafouiller, oublier des points clés, répondre à côté. Beaucoup croient que réussir un entretien est une question de personnalité ou de chance. C'est faux : c'est une compétence qui s'ENTRAÎNE. Un poste IA comporte quatre types d'entretien (technique, projet, design système, comportemental), chacun avec ses attentes et ses pièges. Sans préparation systématique, tu improvises quatre fois. Cette leçon te donne une méthode d'entraînement (fiches, simulations enregistrées, grilles d'auto-évaluation) pour transformer le stress en répétition maîtrisée.

## 🎯 Objectif
Aborder les 4 types d'entretien d'un poste IA junior (technique, projet, design système, comportemental) avec une préparation SYSTÉMATIQUE : fiches, simulations enregistrées, grilles d'auto-évaluation. L'entretien est une compétence qui s'entraîne — pas un test de personnalité.

## 🧩 Prérequis
Tu dois avoir **des projets concrets à présenter** — c'est le seul prérequis réel de cette leçon, et il ne s'apprend pas, il se constitue. Une idée réaliste des attentes d'un poste junior aide. Aucune expérience préalable d'entretien technique n'est supposée : justement, on s'y entraîne.

Deux des quatre types d'entretien traités ici sont approfondis ailleurs dans le parcours, et cette leçon donne d'eux ce qu'il faut pour s'entraîner dès aujourd'hui : **raconter un projet** se structure en situation, tâche, action, résultat — avec au moins un chiffre avant/après ; **l'entretien de design système** consiste à clarifier les besoins, poser une architecture simple, puis discuter ce qui casse en premier quand la charge augmente.

> **Où trouver le détail.** `/doc/lessons/technical-storytelling` traite la construction d'un récit de projet, `/doc/lessons/system-design-interview` la méthode complète de l'exercice de design. Les deux sont **programmées plus loin** dans le parcours ; rien ici ne suppose que tu les as lues, et tu pourras reprendre tes simulations à ce moment-là.

## 🧠 Modèle mental
Un entretien est **une démo de ta façon de penser, en conditions de stress**. Deux
conséquences pratiques en découlent. Le stress se réduit par la **répétition**, jamais par
la relecture — relire ses notes la veille ne change rien à ce qui se passe le jour même. Et
la pensée ne se note que si elle est **verbalisée** : un raisonnement juste mais silencieux
vaut exactement zéro pour l'évaluateur, qui n'a accès qu'à ce que tu dis.

D'où le renversement qui organise toute la leçon : **préparer un entretien, ce n'est pas
réviser, c'est produire des artefacts** — une banque de chiffres, des histoires écrites, des
simulations enregistrées. La différence est mesurable : un artefact sert plusieurs formats
et survit à l'entretien ; une révision ne sert qu'une fois et s'évapore. Le candidat calme
et structuré n'est pas plus doué : il a plus répété, et sur les bonnes choses.

## 📖 Explication complète
- **Technique (algo/code)** : le recruteur note la DÉMARCHE plus que la solution : reformuler, poser des exemples, énoncer le plan, coder en verbalisant, tester les cas limites, donner la complexité. Le silence est l'erreur n°1. S'entraîne par katas À VOIX HAUTE, enregistrés, 25 min chrono.
- **Projet (portfolio)** : STAR + décisions + chiffres (leçon storytelling). Prépare pour CHAQUE projet : le pitch 90 s, deux décisions défendables (ADRs), un obstacle réel résolu, les limites. Le schéma « spécial entretien » de DocSense (une slide, 5 questions que tu maîtrises) ORIENTE la discussion vers tes forces.
- **Design système** : la méthode en 4 étapes (leçon system-design-interview) — clarifier, composants/flux, trade-offs, échelle/pannes.
- **Comportemental** : banque de 6-8 histoires STAR réutilisables (échec, conflit, décision difficile, apprentissage rapide, fierté). « Parle-moi de toi » en 90 s, appris puis naturalisé. Et 3 questions À POSER (équipe, process d'éval des systèmes IA, première mission).
- **Spécifique IA** : les ~20 questions récurrentes (tokens, hallucinations, RAG, debug retrieval/génération, éval, injection, coûts, agent vs workflow — les questions d'entretien de chaque leçon IA de ce programme en sont la banque). Ta botte secrète : répondre avec TON vécu (« sur mon projet, le reranking a gagné 6 points de fidélité ») — imbattable face aux réponses théoriques.
- **Les deux réflexes qui rassurent** : « je ne sais pas, voici comment je chercherais » (honnêteté structurée > bluff), et clarifier avant de foncer.
- **Logistique** : simulations complètes enregistrées + auto-évaluées à la grille (rubrics/interview-evaluation.md) ; post-mortem après chaque vrai entretien (questions notées → fiches mises à jour) : chaque entretien améliore le suivant.

### Ce que cette liste ne dit pas : par quoi commencer

Cinq formats, un temps fini. Les préparer à parts égales est le plus sûr moyen de n'en
maîtriser aucun — et l'erreur de répartition est presque toujours la même : on passe
l'essentiel du temps sur les katas d'algorithmique. Pas par mauvais calcul, mais parce que
c'est **le seul format où l'on voit un score monter le soir même**. C'est aussi celui dont
le rendement décroît le plus vite, et le seul dont une partie des entreprises se passe
entièrement.

Le critère qui répartit correctement est le **taux de réemploi**. La banque de chiffres sert
le format projet, le comportemental *et* le spécifique IA. Une histoire STAR bien écrite
couvre deux ou trois questions différentes. Une simulation enregistrée révèle des défauts
— débit, silences, structure — qui abîment les cinq formats à la fois. Un kata résolu, lui,
ne sert qu'à lui-même. **Prépare d'abord ce qui se réemploie, ensuite ce qui ne sert qu'une
fois.** Et avant de répartir quoi que ce soit, demande au recruteur le format exact du
processus : une question de trente secondes t'épargne des semaines placées au mauvais
endroit.

**Quand ne pas suivre cet ordre.** Si l'entreprise annonce un test technique éliminatoire en
première étape, ce test devient la seule priorité jusqu'à ce qu'il soit franchi — le
réemploi ne vaut rien après une élimination au premier tour. C'est l'exception, pas la
règle : vérifie qu'elle s'applique vraiment avant de t'en servir comme d'une permission.

## 🔧 Exemple simple
Question : « Pourquoi un LLM hallucine ? » Réponse structurée : mécanisme (il prédit le plausible, pas le vrai) → conséquence (confiance ≠ vérité) → remède que TU as implémenté (RAG + citations vérifiées + refus).

## 🧭 Exemple guidé — préparer, c'est produire des artefacts, pas relire

La préparation d'entretien échoue presque toujours de la même façon : on relit
des fiches, on se sent prêt, et on découvre le jour venu qu'on n'avait jamais
formulé une réponse à voix haute. Relire produit une **impression de maîtrise**
sans la maîtrise — c'est le mécanisme décrit dans la leçon
`active-recall-testing`, et il s'applique ici comme ailleurs.

La préparation utile produit des artefacts vérifiables. En voici quatre.

### 1. La banque de chiffres — l'artefact fondateur

Presque toutes les questions d'entretien technique se répondent mieux avec un
chiffre issu de **ton** travail. Cette banque se constitue pendant que tu
construis, pas la veille.

Un extrait de ce qu'elle peut contenir, à partir des vérifications de ce
programme :

```
sujet                    avant            après          décision
----------------------------------------------------------------------------
requêtes N+1             51 requêtes      1 requête      jointure au lieu d une
                                                          lecture par ligne
index SQL                7,819 ms         0,012 ms       index sur la colonne
                         (balayage)       (recherche)     filtrée
hachage de mot de passe  681 015 h/s      23,6 h/s       fonction lente
                         (SHA-256)        (scrypt)        volontairement
coût d appel à un modèle 900 €/mois       5 €/mois       cache + modèle plus
                                                          petit sur les cas simples
disjoncteur              600 appels       5 appels       ouverture après N échecs
```

Ce tableau est plus utile que dix fiches de révision, pour une raison simple :
**il ne se récite pas, il se raconte.** Chaque ligne est une histoire de
quatre-vingt-dix secondes prête à l'emploi, et chaque chiffre rend une
affirmation vérifiable.

### 2. Les réponses en trois temps

Une bonne réponse technique tient en trois mouvements : **mécanisme →
conséquence → vécu.**

> « **Mécanisme** : un index est une structure triée qui permet d'atteindre une
> ligne sans lire toute la table. **Conséquence** : il accélère la lecture et
> ralentit l'écriture, puisqu'il faut le maintenir à jour à chaque insertion.
> **Vécu** : sur un test que j'ai fait, la recherche est passée de 7,8 ms à
> 0,012 ms, et le coût d'écriture a été multiplié par 1,85. »

Le troisième temps est celui qui manque presque toujours, et c'est celui qui
distingue une réponse apprise d'une réponse vécue. Les deux premiers sont dans
n'importe quel cours ; le troisième ne peut venir que de toi.

Une nuance qui compte : le vécu peut être un exercice, et il faut le dire tel
quel. « Sur un test que j'ai fait » est honnête et suffisant. Présenter un
exercice comme une expérience professionnelle est le seul vrai risque de cet
exercice, et il se retourne toujours contre le candidat lors des questions de
suivi.

### 3. Le code à voix haute

Écrire du code en silence pendant qu'on est observé donne une très mauvaise
information à l'examinateur : il ne voit qu'un écran et un résultat. Ce qu'il
évalue est la **démarche**, et la démarche est inaudible si tu ne la verbalises
pas.

Ce qu'il faut dire à voix haute, dans l'ordre :

1. **Reformuler l'énoncé** et poser une question de clarification. Une seule
   suffit à changer la lecture qu'on a de toi.
2. **Donner un exemple à la main**, y compris un cas limite : tableau vide,
   valeur unique, doublons.
3. **Annoncer une approche naïve et son coût**, puis dire si elle suffit.
   « En force brute c'est quadratique ; sur mille éléments c'est un million
   d'opérations, donc acceptable — je commence par là et j'optimise si besoin »
   est une excellente réponse.
4. **Coder en nommant ce qu'on fait**, sans commenter chaque ligne.
5. **Tester à la main** sur l'exemple du point 2, avant de dire qu'on a fini.

Le point 5 est celui qui rapporte le plus et qui coûte le moins. Un candidat qui
déroule son propre exemple à la main et **trouve son propre bug** produit une
bien meilleure impression qu'un candidat dont le code était juste du premier
coup, parce qu'il a démontré la compétence qu'on cherche : vérifier son travail.

### 4. La simulation enregistrée

C'est le seul artefact qui mesure la préparation au lieu de l'estimer. Le
protocole : une heure, chronomètre lancé, sans pause et sans reprise. Un exercice
de code à voix haute, un pitch de projet, trois questions techniques.

Ce qu'on écoute à la réécoute, et qui surprend systématiquement :

- **les silences** — leur durée réelle, toujours plus courte qu'elle ne l'a
  paru ; savoir cela supprime la panique du silence ;
- **les affirmations non justifiées** — combien de fois as-tu dit « c'est plus
  performant » sans dire de combien ni pourquoi ;
- **les réponses qui n'utilisent aucun chiffre** de ta banque ;
- **les questions que tu n'as pas posées** avant de te lancer.

Le décompte de la deuxième ligne est le résultat principal de l'exercice. Il est
toujours plus élevé qu'on ne croit, et il baisse vite dès qu'on l'a mesuré une
fois.

### La démarche de préparation

1. **Constituer la banque de chiffres**, en continu, pendant le travail.
2. **Écrire dix réponses en trois temps** sur les sujets les plus probables de ta
   cible, chacune ancrée dans un chiffre de la banque.
3. **Trois histoires complètes** en versions 30 et 90 secondes (leçon
   `technical-storytelling`).
4. **Une simulation enregistrée par semaine**, avec le décompte des affirmations
   non justifiées.
5. **Un compte rendu après chaque entretien réel** : les questions posées, celles
   qui t'ont mis en difficulté, ce que tu ajoutes à la banque.

Le point 5 est celui qu'on saute, et c'est le plus rentable : les questions se
répètent d'un entretien à l'autre, et une question qui t'a bloqué une fois te
bloquera deux fois si tu ne l'as pas écrite.

## 🤖 Exemple appliqué (IA / data / architecture)
Le « dossier d'entretien » de la semaine 51 assemble tout : fiches projets, schéma DocSense, réponses aux 20 questions IA, histoires STAR, questions à poser, fourchettes salariales. Relu avant chaque entretien, enrichi après. C'est un système, pas de l'improvisation.

## ⚠️ Erreurs fréquentes
- Coder en silence (le recruteur ne peut pas noter une pensée invisible).
- Réponses théoriques récitées sans vécu personnel.
- Bluffer sur une question inconnue (détecté, disqualifiant).
- Zéro question à poser (signal de désintérêt).
- Ne jamais simuler en conditions réelles avant le premier vrai entretien.

## 🚫 Anti-patterns
- Réviser encore la veille au soir au lieu de dormir.
- Mémoriser 100 solutions d'algo au lieu de 10 patterns + la méthode.

## ✍️ Mini-exercice
Sans relire : quel est le troisième temps d'une bonne réponse technique, et
pourquoi est-ce celui qui manque presque toujours ?

## 🔥 Pratique — produire les quatre artefacts

**A. La banque de chiffres.** Constitue le tableau : sujet, chiffre avant,
chiffre après, décision. Au moins quinze lignes, toutes issues de mesures que tu
as réellement faites. Livrable : le tableau.

**B. Dix réponses en trois temps.** Choisis dix questions probables pour ta
cible et écris chaque réponse en mécanisme → conséquence → vécu, en utilisant un
chiffre de A. Livrable : les dix réponses, chacune en moins de cent mots.

**C. Le code à voix haute.** Résous trois exercices de difficulté moyenne en
t'enregistrant, en appliquant les cinq points. Livrable : les trois
enregistrements, et pour chacun le nombre de bugs que **tu** as trouvés en
testant à la main avant de déclarer avoir fini.

**D. La simulation complète.** Une heure enregistrée : un exercice de code, un
pitch, trois questions. Auto-évalue avec une grille que tu écris **avant** de
t'enregistrer. Livrable : la grille, la note, et les trois axes d'amélioration.

**E. Refaire après une semaine.** Reprends la même simulation une semaine plus
tard sans relire tes notes entre-temps. Compare les deux notes. Livrable : les
deux notes et ce qui a bougé.

## ✅ Correction attendue

**A — la banque.** Le critère est que chaque ligne soit **vérifiable par toi**,
c'est-à-dire que tu puisses réexécuter la mesure. Un chiffre lu dans un article
n'a pas sa place : tu ne pourras pas répondre à « comment tu as mesuré ça ? »,
qui est la première question de suivi.

Si tu peines à atteindre quinze lignes, le diagnostic n'est pas « je manque
d'expérience » mais « je n'ai pas mesuré ». La correction est immédiate et vaut
pour la suite de ton parcours : à chaque exercice, note le chiffre avant et le
chiffre après. C'est trente secondes de travail qui produisent la matière de
toute ta préparation.

**B — les trois temps.** L'erreur la plus fréquente est de s'arrêter au deuxième
temps, parce qu'il « fait complet ». Une réponse qui explique le mécanisme et la
conséquence est correcte et interchangeable : n'importe quel candidat ayant lu le
même cours la donnera. Le troisième temps est le seul qui te distingue.

La seconde erreur est plus grave : maquiller un exercice en expérience
professionnelle. « Sur un test que j'ai fait » et « en production chez mon
employeur » ne se confondent pas, et les questions de suivi révèlent l'écart en
deux minutes. L'honnêteté n'est pas seulement une exigence morale ici : elle est
plus efficace, parce qu'un exercice que tu maîtrises vraiment se défend mieux
qu'une expérience que tu n'as pas eue.

**C — le code à voix haute.** Le chiffre à publier est le nombre de bugs trouvés
par **ton** test à la main. S'il est zéro sur les trois, c'est presque toujours
que tu n'as pas vraiment déroulé l'exemple, pas que ton code était parfait —
déroule-le ligne à ligne sur un cas limite, pas sur le cas nominal.

Trouver son propre bug devant l'examinateur est un **gain**, contrairement à ce
qu'on croit sur le moment. Cela démontre la vérification, qui est la compétence
évaluée. Un code juste du premier coup ne prouve pas que tu vérifies ; il prouve
que ce problème-là t'était familier.

**D — la simulation.** Point de méthode : la grille s'écrit **avant**
l'enregistrement. Écrite après, elle décrit ce que tu as fait et te donne une
bonne note — c'est le même défaut qu'un seuil de qualité ajusté après avoir vu le
résultat.

Ce que la grille doit contenir, au minimum : as-tu posé une question avant de te
lancer ; as-tu annoncé une approche et son coût ; as-tu testé à la main ; combien
d'affirmations non chiffrées ; combien de réponses ancrées dans un vécu.

**E — la reprise à une semaine.** L'intervalle est délibéré, et il est ce qui
rend l'exercice utile. Refaire le lendemain mesure ta mémoire immédiate ; refaire
à une semaine mesure ce qui est réellement disponible — c'est le principe de
récupération espacée de la leçon `spaced-repetition-schedule`.

Attends-toi à une baisse sur certains points, et ne la lis pas comme un échec :
elle t'indique exactement ce qui n'était que du bachotage. Ce qui reste stable
d'une semaine sur l'autre est ce que tu sais réellement, et c'est sur ce
périmètre-là que tu peux te présenter avec confiance.

## 🎤 Questions d'entretien
- « Parle-moi de toi. » → 90 s orientés cible : d'où tu viens, ce que tu as CONSTRUIT (chiffres), ce que tu cherches.
- « Une question difficile dont tu ne connais pas la réponse. » → « Je ne sais pas, voici comment je chercherais » + raisonnement à voix haute.
- « As-tu des questions ? » → Toujours : équipe, comment ils évaluent leurs systèmes IA, première mission.

## 🧾 À retenir
- 4 entretiens, 4 préparations spécifiques — et des simulations ENREGISTRÉES.
- Réponds avec ton vécu chiffré : imbattable face à la théorie récitée.
- « Je ne sais pas + méthode » bat le bluff ; verbalise toujours ta pensée.

## 📚 Vocabulaire
**screening** · **STAR** · **pitch 30/90 s** · **simulation / mock interview** · **post-mortem d'entretien** · **banque d'histoires** · **grille d'évaluation** · **questions inversées**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] J'ai un dossier d'entretien complet (fiches, réponses, histoires, questions).
- [ ] J'ai fait ≥ 2 simulations enregistrées avec grille ≥ 3,5/5.
- [ ] Chaque réponse IA s'appuie sur mon vécu de projet.

## 🔗 Liens avec le programme
Mois 12 (jours ~351-362), simulations mensuelles dès le mois 1. Leçons liées : `technical-storytelling`, `system-design-interview`, `rag-evaluation`, toutes les leçons IA (leurs sections 🎤).
