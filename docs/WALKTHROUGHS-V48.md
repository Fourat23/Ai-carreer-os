# V48 — Walkthroughs d'apprenants (bout en bout)

Huit apprenants fictifs traversant des artefacts V48 RÉELS. Chaque parcours
montre la réponse pédagogique : échec → **misconception** → explication →
remédiation (exercice/leçon/scénario) → retry. **La solution complète n'est
jamais donnée** ; le feedback guide le raisonnement.

---

### 1. Le débutant — `ml-imbalance-metric-trap`
Nadia n'a jamais vu de déséquilibre de classes. Elle soumet le starter (renvoie
`acc=0.00 …`). Le test public échoue. Le feedback la relie à la misconception
**baseline-blindness** : « un score élevé ne prouve pas la valeur ; compare à la
baseline ». Remédiation proposée : leçon `model-evaluation` + exercice
`ml-baseline-vs-model`. Elle revient, calcule accuracy/rappel/F1 et découvre que
`rec1=0.00` quand on prédit la majorité. Vert. Elle a appris à MÉFIER de
l'accuracy, pas juste à écrire une formule.

### 2. Réponse partiellement correcte — `arch-cache-invalidation`
Karim renvoie `cache-aside` pour le cas « lecture lourde tolérante » (juste) mais
aussi pour « écriture lourde » (faux : devrait être `no-cache`). Un test public
casse. Le feedback pointe la règle du résumé (ratio lecture/écriture) et la
misconception **cache-everything**. Il ne reçoit PAS la réponse ; il relit la
règle, distingue les trois régimes, et complète. Il a intégré que le cache peut
COÛTER plus qu'il ne rapporte.

### 3. Bonne réponse pour la mauvaise raison — scénario `ml-imbalance-fraud-incident`
Léa conclut « le modèle est mauvais » (phase diagnosis) — et coche par chance une
option juste en decision. Mais en phase investigation elle avait ignoré
l'artefact `baseline` (0.995 > 0.98). Le debrief révèle que sa décision correcte
reposait sur une lecture erronée : elle croyait à un bug de code, pas à un
mauvais CHOIX de métrique. Le `keySignals` la renvoie à la baseline. Elle rejoue
et reconstruit le vrai raisonnement.

### 4. Correction locale mais mauvais diagnostic — scénario `agent-tool-loop-incident`
Tom voit la boucle et propose « augmenter la limite d'étapes à 200 » (phase
decision). Ça « corrige » superficiellement (l'agent finit par s'arrêter) mais
ignore la cause : l'escalade supprimée. Le grading rejette l'option ; le feedback
via **agent-needs-no-guardrail** explique qu'augmenter la limite ne fait
qu'aggraver le coût. Remédiation : `agent-cycle-index` (garde-boucle) +
`agent-transition-guard`. Tom rétablit la transition ET ajoute un garde-boucle.

### 5. Bon diagnostic, mauvaise priorité — scénario `legacy-service-refactor`
Sophie identifie les trois défauts (idempotence, outbox, switch) — bon
diagnostic. Mais en decision elle veut « tout réécrire en micro-services + CQRS »
d'abord. Le grading marque l'option de sur-ingénierie comme fausse ; le debrief
(`tradeoffs`, `alternatives`) montre qu'on corrige d'abord ce que les incidents
PROUVENT, et qu'on NOMME ce qu'on refuse. Elle repriorise : idempotency-key en
premier (incident actif), micro-services écartés.

### 6. Solution valide mais risquée — `arch-idempotency-key` → transfert
Ravi répond correctement `idempotency-key` pour le paiement. Puis, sur le défi de
transfert lié (webhook → file de messages), il applique la MÊME idée sans voir
que le consumer peut aussi rejouer. Le feedback ne corrige pas « faux » (sa
réponse marche) mais signale le RISQUE opérationnel : l'idempotence doit être
garantie côté consommateur aussi. Il élargit sa solution.

### 7. Le vrai transfert — `arch-consistency-tradeoff` (D5)
Amina a appris CAP sur un exemple bancaire (`CP`). Le scénario lui présente un
« stock unique » (dernière place). Sans qu'on le lui dise, elle reconnaît que
lire un stock périmé est dangereux (survente) → `CP`. Elle transfère le principe
d'un domaine (solde) à un autre (inventaire) : c'est le signal recherché — pas la
récitation, la MOBILISATION.

### 8. Échec puis remédiation — `llm-context-budget-truncate` → scénario
Yanis échoue d'abord (il garde les messages les plus ANCIENS). Feedback via
**more-context-better** : borner au budget en gardant système + RÉCENTS.
Remédiation : `llm-cost-budget-plan`. Il réussit l'exercice, puis affronte le
scénario `llm-context-budget-regression` : il diagnostique correctement que
« tout l'historique » a dilué le signal ET quintuplé le coût, propose une gate de
non-régression. La boucle échec → remédiation → application en contexte est
bouclée.

---

## Ce que ces parcours prouvent

- Le feedback **distingue** l'erreur de connaissance (1), de lecture (3), de
  diagnostic (4), de priorité (5), de risque opérationnel (6).
- La solution complète n'est **jamais** donnée : on renvoie vers une
  misconception, une leçon, un exercice ou un debrief.
- Les scénarios forcent l'ordre professionnel : observer → investiguer →
  hypothèses → décider → valider → expliquer, avec de vrais faux indices.
- Le transfert (7) et la remédiation (8) montrent une compétence MOBILISABLE, pas
  seulement récitée.
