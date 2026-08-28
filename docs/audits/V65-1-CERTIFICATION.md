# V65.1 — Certification : les 25 questions, avec leur preuve

> Chaque réponse cite **où elle a été vérifiée**. Une réponse sans vérification
> n'est pas une réponse — c'est une intention.
>
> Rapport complet : `docs/audits/V65-1-FINAL-REPORT.md`.
> Critères gelés au CP1 : `docs/V65-1-CRITERIA-FROZEN.md`.

Fixture de mesure : produite par l'API réelle
(`scripts/v651-fixture.mjs`, 57 commandes acceptées, 0 refusée) —
**31 preuves, 15 qualifiantes, 8 compétences touchées sur 20, 13 dates UTC.**

---

## I. Ce qui ne doit JAMAIS créer une preuve

**1. Une visite peut-elle créer une preuve ?**
**Non.** Navigation exhaustive des 51 routes plus quatre vues paramétrées :
`progress.json` inchangé à l'octet près
(`dccf5d1a…` avant et après). Critère C13.

**2. Une visite peut-elle faire progresser une compétence ?**
**Non.** L'état est une projection ; aucune surface n'écrit au rendu. Vérifié
par la même mesure que Q1, et par `v64:check` (le moteur est pur, l'API n'écrit
que sur commande acceptée).

**3. Terminer une journée démontre-t-il une compétence ?**
**Non.** La règle « 3 journées terminées → Pratiquée » a disparu avec
`lib/skill-state.mjs`. Test dédié : une compétence à trois journées terminées et
zéro preuve reste **Non évaluée**
(`tests/v41-learning-experience.test.mjs`, premier test).

**4. Une note personnelle est-elle une preuve ?**
**Non.** `declared` n'est pas un type qualifiant (contrat V65 §3).
`/skills/[id]` la range sous « traces qui ne démontrent pas », avec sa raison :
« déclarée par toi — le produit ne certifie pas ».

**5. Une preuve échouée crédite-t-elle une compétence ?**
**Non.** `isQualifying` exige `validation.status === 'passed'`. Test négatif N9
du gate `v651` : en retirant la garde, la règle est **vue échouer**.

**6. Une révision fait-elle progresser un état ?**
**Non.** Une preuve `review` portant `passed` est **refusée**
(`UNQUALIFIABLE_SOURCE`). Une révision seule laisse la compétence
« Pratiquée ». Vérifié par gate (C11) et par la matrice transverse.

---

## II. Intégrité du registre

**7. Une même preuve métier peut-elle être créditée deux fois ?**
**Non.** Clé `sourceType:sourceId:compétences triées:q|n`. Testé sur le seul cas
que la clé attrape et que l'identifiant ne peut pas : **le même fait sous un
autre identifiant**. Le premier essai de ce test restait vert parce qu'une garde
par `id` suffisait — il ne mesurait rien.

**8. Un échec puis une réussite sont-ils deux faits distincts ?**
**Oui — depuis ce sprint.** C'était **P0-6**, le défaut le plus grave trouvé :
la réussite était silencieusement jetée par la garde d'unicité, et la commande
répondait « ok ». Mesuré sur la fixture (journée 7,
`linux-path-traversal-x`) ; après correction, 14 → **15** preuves qualifiantes.

**9. Une compétence est-elle écrite directement quelque part ?**
**Non.** Aucune écriture d'état dérivé. Les niveaux **auto-déclarés** subsistent
comme déclaration et sont comptés à part (`declaredCount`) — la Synthèse les
présentait comme un décompte de compétences, c'est corrigé.

**10. La projection est-elle reconstructible ?**
**Oui.** Effacer tout champ dérivé et rejouer depuis les seules preuves rend un
résultat **strictement égal**. Critère C7, testé dans le gate et dans la matrice
(S15).

**11. La projection est-elle déterministe ?**
**Oui.** Deux appels successifs, sortie strictement égale. Critère C6.

**12. Existe-t-il deux modèles de compétence ?**
**Non.** `lib/skill-state.mjs` et `lib/skill-vocabulary.mjs` sont **supprimés**.
Un seul fichier définit les états, vérifié par **trois** gates (`v52`, `v53`,
`v651`). Test négatif : recréer un second modèle fait échouer les trois.

---

## III. Cohérence transverse

**13. `/`, `/skills` et `/history` affichent-ils la même dernière preuve et le
même décompte ?**
**Oui.** Sonde navigateur sur données réelles : même décompte
(« **15 preuves qualifiantes sur 31 enregistrées** » sur `/` comme sur
`/skills`), mêmes compétences évaluées (**8 / 20**), même dernière preuve.

> *C'est la question 13 de V65, qui n'avait pas de réponse : elle passe à
> « oui » sans réserve.* Mesure d'entrée : **20 compétences sur 20 divergentes**,
> dont 8 sémantiquement.

**14. Un nombre affiché correspond-il toujours à une grandeur réelle ?**
**Oui.** P0-2 fermé : `/skills` annonçait « 28 preuves qualifiantes sur 30 »
pour **14** réelles — la somme des crédits par compétence présentée comme un
décompte d'enregistrements. Les deux grandeurs portent désormais deux noms
distincts, et le gate refuse qu'on les reconfonde.

**15. Le produit affiche-t-il « 0 » pour dire « non évalué » ?**
**Non.** Les 12 compétences non évaluées affichent « aucune trace enregistrée ».
Sonde sur 7 surfaces.

**16. Le produit invente-t-il une « dernière preuve » ?**
**Non.** Une preuve hors journée (diagnostic, capstone) a `dayId: null` et ne
produit plus de lien `/day/null` : elle renvoie à l'historique, qui la porte.

**17. Un identifiant d'état anglais peut-il atteindre l'écran ?**
**Non.** Le Dashboard affichait `practiced → demonstrated` en clair. Vérifié
désormais par gate sur tous les textes produits par le moteur **et** par sonde
DOM sur 7 surfaces.

**18. Une étiquette fine peut-elle s'afficher comme une compétence du
programme ?**
**Non.** `competencyIds` n'est jamais rendu brut ; `/synthese` et `/history`
traduisent en noms français. Sonde DOM sur quatre motifs connus
(`javascript · algo`, `linux · arrays`…).

---

## IV. Le produit se rend-il compréhensible ?

**19. Le produit explique-t-il ses états ?**
**Oui.** Règle, faits, preuves retenues, provenance de chacune, et raison
explicite pour chaque trace insuffisante. Aucun texte de règle n'est écrit en
dur dans une route — vérifié par gate (test négatif N6 vu échouer).

**20. Le produit dit-il quand il ne peut RIEN proposer ?**
**Oui.** `autonomy` n'est alimentée par **aucune** source du corpus.
`/skills/autonomy` le dit, nomme le manque comme celui du **programme** et ne
propose aucune action inexistante.

**21. Une action proposée peut-elle contredire l'état affiché ?**
**Non.** Le Dashboard proposait « Démontrer JavaScript / TypeScript — pratiquée
mais jamais démontrée » pour une compétence portant huit preuves qualifiantes et
affichée « Consolidée » deux clics plus loin. Testé désormais :
`demonstrate` n'est proposé que sur « Pratiquée », `practice` que sur « Non
évaluée » (matrice S9, S11).

**22. Un capstone réussi laisse-t-il une trace ?**
**Oui — depuis ce sprint** (P0-5). `capstone` était un type qualifiant au
contrat, `capstoneToEvidence` existait depuis V40 **sans aucun appelant**, et le
jalon « Premier capstone terminé » était inatteignable.

---

## V. Invariants du programme

**23. Le Curriculum 1.0 est-il intact ?**
**Oui.** `git diff` **vide** sur `curriculum/` et `data/` contre `2237f2d`.
365 journées, ordre strict `1..365`.

**24. Y a-t-il de la gamification ?**
**Non.** Ni XP, ni niveau joueur, ni streak, ni classement, ni badge de mérite.
Vérifié par gate sur `lib/` et `app/` ; test négatif N13 vu échouer.

**25. Le Retention Engine a-t-il été commencé ?**
**Non.** Aucun moteur de répétition espacée supplémentaire (vérifié par gate).
Le pont s'arrête au **candidat** de révision, comme exigé. La suite est décrite
dans `docs/V65-1-PROMPT-V66.md`, **à ne pas lancer sans décision humaine**.

---

## Récapitulatif

| | |
|---|---|
| Réponses « oui » attendues | 25 / 25 |
| Conditions de sortie tenues | **17 / 17** |
| Tests négatifs vus échouer | **12 / 12**, 0 trou |
| Dette P0 | **aucune** |
| Audit UI/UX | **4,29 / 5**, aucun axe sous 4 |

# `REFERENCE_READY`
