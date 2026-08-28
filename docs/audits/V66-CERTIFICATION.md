# V66 — Certification : 25 questions, chacune avec sa preuve

> Une réponse sans vérification n'est pas une réponse, c'est une intention.
> Chaque réponse ci-dessous cite **où elle a été vérifiée** et **par quoi**.
>
> Rapport complet : `docs/audits/V66-FINAL-REPORT.md`.
> Grille gelée avant mesure : `docs/V66-ACADEMIC-GRID-FROZEN.md`.

---

## I. Le moteur ne fabrique rien

**1. Peut-on écrire un état de rétention directement ?**
**Non.** Aucune commande de ce type n'existe. `SET_RETENTION`, `MARK_RETAINED`,
`SET_DUE`, `SCHEDULE_CONCEPT` sont toutes refusées avec `UNKNOWN_COMMAND`.
Vérifié par la règle R2 du gate et par le test négatif N1, qui ajoute une telle
commande et voit la règle rougir.

**2. Qu'est-ce qui est réellement écrit sur le disque ?**
**Une liste de tentatives**, et rien d'autre : concept, date, issue, forme,
provenance. La règle R1 vérifie qu'une tentative ne porte aucun autre champ, et
que la progression ne contient aucun champ dérivé (`retention`, `due`,
`interval`). Test négatif N2 : ajouter `state` à la tentative fait échouer.

**3. Une visite de `/retention` crée-t-elle quelque chose ?**
**Non.** Harnais d'intégrité I1 : navigation de quatre routes, `progress.json`
inchangé à l'octet près.

**4. Un apprenant peut-il antidater une tentative ?**
**Non.** La date est celle du serveur. Une commande portant `at: 2020-…` est
enregistrée avec l'horodatage réel. Règle R1, test négatif N3.

**5. Trois réussites le même jour valent-elles trois dates ?**
**Non — une seule.** `distinctSuccessDays` compte par date UTC. Deux gardes
protègent cet invariant (le comptage par date et le seuil d'étalement) : elles
sont cassées **séparément** par les tests N4 et N4b, parce que la première
version de N4 restait invisible, masquée par la seconde garde.

**6. Un échec efface-t-il les réussites passées ?**
**Non.** La série repart de zéro, les réussites restent comptées. Test N9, et
test unitaire dédié.

---

## II. L'espacement

**7. L'espacement est-il déterministe ?**
**Oui.** Paliers entiers publiés : 1, 3, 7, 16, 35, 75, 160 jours. Aucun facteur
flottant, aucune dérive. Règle R5, quatre paliers vérifiés individuellement.

**8. L'échéance dépend-elle de l'heure à laquelle on la calcule ?**
**Non.** Elle se calcule depuis la dernière tentative. La rejouer six mois plus
tard rend la même date. Règle R4, test négatif N7 : remplacer par `Date.now()`
fait rougir.

**9. Deux appels successifs donnent-ils le même résultat ?**
**Oui**, strictement. Et l'ordre d'insertion des tentatives est indifférent : le
tri par date le garantit (règle R4, test N6).

**10. Un concept jamais tenté a-t-il une échéance ?**
**Non.** `dueAt: null`, `intervalDays: null`. On n'invente pas de date.

**11. Que se passe-t-il après un échec ?**
Retour au **premier palier, un jour** — pas de reproposition immédiate.
Re-tester trente secondes après un échec ne mesure que la mémoire immédiate,
exactement ce que le moteur existe pour ne pas confondre avec de la rétention.
Une attente de test contraire a été corrigée comme fausse, pas contournée.

---

## III. Ce que le produit affiche

**12. Les décomptes de `/retention` sont-ils cohérents entre eux ?**
**Oui — depuis ce sprint.** Le harnais d'intégrité a trouvé le contraire : sur
une progression vierge, la page affichait « Nouveau 127 » **et** « 128 notions
pas encore dans le décompte ». Les deux grandeurs sont désormais disjointes et
leur somme vaut le total (I4b, plus deux tests unitaires).

**13. La page explique-t-elle comment un état est obtenu ?**
**Oui**, règle par règle, et les seuils affichés sont **importés du modèle**, pas
recopiés. Règle R13, test négatif N18 : recopier les paliers à la main fait
rougir.

**14. Un échec d'enregistrement est-il visible ?**
**Oui**, dans un bloc `role="alert"`. Règle R13, test N20 — c'est le défaut que
V64 avait corrigé sur `/revisions` et qui ne devait pas revenir.

**15. Peut-on répondre avant d'avoir tenté ?**
**Non.** Les trois issues ne s'ouvrent qu'après « J'ai tenté ». Sans cette
contrainte, l'apprenant lit puis se déclare bon — la confusion même que le sprint
attaque. Règle R13, test N19.

**16. Propose-t-on une forme de rappel que la leçon ne permet pas ?**
**Non.** Les formes sont mesurées sur les sections réelles de chaque leçon. Le
gate vérifie en plus, sur les 128 leçons, qu'aucune forme déclarée n'est morte et
qu'aucune leçon n'est privée de toute forme (R9, test N13).

---

## IV. L'audit pédagogique

**17. L'échantillon a-t-il été choisi avant de lire ?**
**Oui.** 43 journées, 18/18 domaines, seed 20260828, tirage déterministe. Publié
au CP1 et non modifié depuis — le gate refuse un changement de seed (R12, tests
N16 et N17).

**18. Une métrique a-t-elle été ajustée jusqu'à donner le bon résultat ?**
**Non**, et quatre cas sont publiés en détail. Deux mesures ont été **remplacées**
(pas raffinées) après avoir été démenties par lecture directe ; deux ont été
corrigées sur un défaut identifié **avant** d'en regarder l'effet. Le cas le plus
net : `\b[A-Z]{2,6}\b` annonçait « 100 % des journées ont un acronyme jamais
développé » en lisant ÉTAT comme TAT.

**19. Le rapport donne-t-il raison à l'hypothèse de départ ?**
**En partie seulement**, et les contre-preuves sont publiées avec les preuves :
91 % d'exemples guidés complets hors revues, jargon marqué à 1,9 / 100 mots,
analogies assorties de leur limite, aucune affirmation fausse relevée.

**20. La conclusion sur les 4 h 30 est-elle mesurée ou supposée ?**
**Mesurée**, avec un modèle de conversion publié avant la mesure et non
réajusté : 67 minutes de contenu fourni en médiane, soit **25 %** des 4 h 30. Et
**9 minutes (3 %)** pour les 52 revues hebdomadaires.

**21. La note du barème a-t-elle été calculée après avoir vu les résultats ?**
**Non.** Les douze dimensions, leurs critères de bascule et les règles de verdict
étaient gelés au CP1, avant toute notation. Le résultat, **2,83 / 5**, tombe dans
la zone « dette déclarée » — et la dette est publiée en tête du rapport.

---

## V. Le curriculum

**22. Le curriculum a-t-il été modifié, et est-ce inventorié ?**
**Oui, 10 fichiers, et oui.** Neuf leçons durcies plus une clôture de bloc
réparée. L'inventaire ligne à ligne est dans `docs/audits/V66-FLAGSHIPS.md`, cité
par les neuf portes de gel dont l'empreinte a été mise à jour.

**23. Le durcissement a-t-il gonflé les leçons pour atteindre un quota ?**
**Non**, et le contre-exemple le prouve : `rag-evaluation` est resté à 226 mots
de noyau parce qu'il était déjà causal et structuré. Ce qui décide n'est pas le
compte de mots, c'est le test des mots-clés : **1 réussite sur 9 avant, 9 sur 9
après**.

**24. Le rendu du corpus perd-il du contenu ?**
**Non — depuis ce sprint.** Il en perdait : 11 sections sur 18 de la leçon la
plus enseignée du corpus. `v66:render` vérifie désormais les 950 fichiers en les
passant par le moteur de rendu réel.

**25. Le vocabulaire est-il atteignable là où l'apprenant bute ?**
**Oui — depuis ce sprint.** 711 entrées étaient définies et **zéro lien** y menait
depuis les 128 leçons. La première occurrence de chaque terme est désormais liée
à sa définition ouverte. Vérifié bout en bout par I8 : le lien pointe une entrée
qui existe réellement.

---

## Récapitulatif

| | |
|---|---|
| Réponses vérifiées | 25 / 25 |
| Tests négatifs vus échouer | **22 / 22**, 0 trou |
| Faux positifs écartés et publiés | 6 (4 au CP0, 2 au CP8) |
| Dette P0 fermée | P0-1 (glossaire) · P0-4 (rendu) |
| Dette P0 **ouverte** | PED-14 / PED-15 (charge annoncée) |
| Note au barème gelé | **2,83 / 5** |

Verdicts : **`RETENTION_ENGINE_FOUNDATION_READY`** ·
**`ACADEMIC_BASELINE_ESTABLISHED`** (avec dette déclarée).
`ACADEMIC_QUALITY_READY` **non prononcé**.

---

# La question obligatoire (§26 du brief)

> « Si je supprimais les exercices, les badges, les parcours et toute
> l'interface, et que je donnais uniquement les textes de cours à un étudiant
> humain sérieux, est-ce que ces textes constitueraient aujourd'hui un cursus
> suffisamment pédagogique pour apprendre réellement les sujets — ou
> principalement un excellent plan de révision pour quelqu'un qui les connaît
> déjà ? »

**Réponse : aujourd'hui, non — pas comme cursus autonome. Mais la réponse n'est
pas la même selon la partie du corpus, et l'écart est mesurable.**

**Pour 57 leçons sur 128** (familles B et C, plus les 9 durcies ce sprint), la
réponse est **oui**. Un étudiant sérieux, seul avec ces textes, apprend
réellement. La preuve n'est pas une impression : sur les trois leçons de ces
familles soumises au test de compréhension, les trois passent sans réserve, y
compris la question de transfert. Le test des mots-clés — retirer tout le
vocabulaire et voir si le mécanisme survit — les laisse intactes.
`observability-fundamentals` explique pourquoi une métrique alerte, une trace
localise et un log explique, sans que ces trois mots soient nécessaires à la
compréhension. C'est ce que fait un cours.

**Pour 62 leçons sur 128**, la réponse est **non**, et c'est exactement le mot
que vous employez : ce sont d'excellents **plans de révision**. Leur cadrage est
souvent remarquable — le problème d'abord, le modèle mental avec sa limite, les
erreurs fréquentes. Mais leur noyau explicatif fait 265 mots médians sans
structure interne, et il NOMME. Avant durcissement, `embeddings` disait « on
mesure la similarité cosinus : l'angle entre deux vecteurs », puis demandait
d'implémenter cette fonction — alors que ni le produit scalaire ni la norme
n'étaient définis nulle part dans le corpus. Un lecteur qui sait déjà comprend ;
un lecteur qui apprend est bloqué, et le texte ne lui donne aucun moyen de se
débloquer. C'est la définition d'un aide-mémoire.

**Mais la partie la plus honnête de la réponse n'est pas là.** Même en imaginant
les 128 leçons au niveau des meilleures, votre hypothèse tomberait sur un mur
plus dur : **le corpus décrit une heure de travail par jour et en annonce quatre
et demie.** Il ne dit pas ce qu'on fait pendant les trois heures et demie
restantes. Un cursus autonome, ce n'est pas seulement un texte qui explique :
c'est un texte qui dit quoi faire, combien de temps, et à quoi on reconnaît qu'on
a fini. Sur ce point, 267 journées sur 365 ne chiffrent rien, et une semaine sur
sept annonce 4 h 30 pour neuf minutes de matière. **C'est cette dette-là qui
empêche aujourd'hui de répondre « oui », bien plus que la densité des textes.**

**Ce que je ne peux pas affirmer**, et je préfère le dire que de conclure trop
largement : je n'ai lu intégralement que dix leçons. Les familles B et C sont
créditées sur trois lectures. Le test de compréhension a été écrit et passé par
moi, ce qui détecte l'absence d'information dans un texte, pas la difficulté
réelle qu'un humain éprouve. Et rien de ce sprint ne dit quoi que ce soit sur ce
qu'un apprenant **retient** : le moteur qui pourra l'établir existe désormais,
mais il n'a encore mesuré personne.
