<!-- keep -->
# Leçon — Agents avancés et orchestration de workflows

## 🌍 Le problème d'abord
Tu as fait tourner un petit agent en démo : impressionnant. Puis tu veux le mettre en
production sur une vraie tâche répétée, et tout se complique — il coûte cher, part parfois dans
une boucle, donne des résultats différents à chaque exécution, et tu ne sais plus s'il a
réussi. La question n'est alors plus « comment coder un agent » mais « comment ORCHESTRER le
travail de façon fiable et prévisible » : quand enchaîner des étapes fixes (workflow), quand
laisser le modèle décider (agent), comment paralléliser, borner les budgets, reprendre sur
échec. Cette leçon te fait passer de la démo à l'ingénierie — et à décider agent vs workflow
sur des CHIFFRES, pas sur la mode.

## 🎯 Objectif
Passer du « petit agent démo » à l'orchestration sérieuse : les 4 patterns de workflow, la parallélisation, la reprise sur échec, les budgets, et les critères CHIFFRÉS pour trancher agent vs workflow. C'est la compétence d'architecture appliquée à l'IA.

## 🧠 Modèle mental
Un workflow est **une chaîne de production** (étapes fixées, débit prévisible) ; un agent est **un artisan autonome** (s'adapte, mais variable et cher). L'orchestrateur, c'est toi : tu choisis l'outil par tâche, tu bornes les budgets, tu prévois les pannes.

## 🧩 Prérequis
Tu dois maîtriser les fondamentaux des agents — boucle décider→agir→observer, function calling,
garde-fous, modes d'échec (`/doc/lessons/agents-fundamentals`) — et les sorties structurées/
outils (`/doc/lessons/structured-outputs-tools`). Les patterns d'architecture (parallélisation,
reprise sur échec, files) viennent de `/doc/lessons/architecture-basics` et de la résilience
(`/doc/lessons/resilience-patterns`). Aucun framework d'agents particulier n'est supposé.

## 📖 Explication complète
- **Les 4 patterns de workflow** :
  1. **Chaînage** : A → B → C (extraire → analyser → rapporter). Simple, débuggable étape par étape.
  2. **Parallélisation** : traiter n éléments indépendants en parallèle (n documents → n résumés) — latence divisée, coût identique.
  3. **Routage** : un classifieur léger dirige vers le bon traitement (question simple → petit modèle ; complexe → gros ; hors-sujet → refus).
  4. **Évaluateur-optimiseur** : générer → évaluer → régénérer si insuffisant (boucle bornée).
- **L'orchestration à l'échelle** (500 documents/jour) : découpage en unités reprenables, file de travail, état persisté (quel doc traité, lequel a échoué), reprise sur échec PARTIEL (on ne relance pas les 400 réussis), budget global (coût/temps) avec arrêt propre, et traces par unité.
- **Agent : quand et comment** : seulement si le chemin dépend des découvertes. Et alors : boucle bornée, outils au moindre privilège, traces complètes, mémoire gérée (l'historique enfle → résumer/élaguer), et un TAUX DE RÉUSSITE mesuré sur des cas répétés (un agent à 60 % de réussite est inutilisable ; on le sait en mesurant, pas en démo).
- **Trancher par les chiffres** : implémenter les deux sur un cas réel et comparer coût / latence / fiabilité / qualité sur 5-10 exécutions. La réponse la plus fréquente en production : workflow, avec parfois un agent encapsulé dans UNE étape bien bornée.

## 🔧 Exemple simple
Veille quotidienne : lister les sources → résumer chacune (parallèle) → agréger → publier. Quatre étapes fixes : chaînage + parallélisation, zéro agent nécessaire.

## 🧭 Exemple guidé
**Énoncé** : orchestrer l'analyse de 500 documents avec reprise sur échec.
**Raisonnement** : unités indépendantes → file + état + parallélisation bornée.
**Solution (pseudo)** :
```
file = docs.filter(d => etat[d.id] !== 'fait')      # reprise : on saute les réussis
pour lot de 10 docs en parallèle :                   # parallélisation bornée (rate limits)
    essayer : analyser(doc) ; etat[doc.id] = 'fait'
    sinon   : etat[doc.id] = 'echec:' + raison       # on continue, on n'arrête pas tout
    si coutTotal > BUDGET : arrêt propre + rapport
rapport final : faits / échecs (relançables) / coût
```
**Explication** : l'état persisté rend le pipeline REPRENABLE ; un échec n'annule pas le lot ; le budget borne le pire cas. **Variante** : ajoute le routage (docs courts → petit modèle).

## 🤖 Exemple appliqué (IA / data / architecture)
Le workflow d'analyse de DocSense (résumé, points clés, incohérences) est un chaînage avec parallélisation par section, coût affiché par analyse, et reprise si un appel échoue. Le choix « workflow, pas agent » y est documenté en ADR avec les chiffres de la comparaison — exactement ce qu'un recruteur senior veut entendre.

## ⚠️ Erreurs fréquentes
- L'agent par défaut (plus cher, moins fiable, pour rien si le chemin est connu).
- Orchestration sans état persisté → tout relancer au moindre échec.
- Parallélisation sans borne → rate limits et facture.
- Aucun taux de réussite mesuré (la démo qui marche 1 fois sur 3).

## 🚫 Anti-patterns
- La « chaîne d'agents » quand une chaîne d'ÉTAPES suffit.
- L'historique d'agent qui enfle sans gestion (coût et contexte explosent).

## ✍️ Mini-exercice
Pour ces 4 tâches — résumé quotidien de 20 articles, tri de tickets support, investigation d'un bug inconnu, migration de 10 000 fiches — choisis : chaînage, parallélisation, routage, ou agent. Justifie en une ligne chacune.

## 🔥 Exercice plus difficile
Implémente le même cas (vérification de cohérence de docs) en version agent ET en version workflow ; compare sur 5 exécutions : coût, latence, fiabilité, qualité. Rédige la décision en ADR.

## ✅ Correction attendue
La logique : patterns de workflow d'abord, agent seulement si le chemin dépend des découvertes ; orchestration = état + reprise + budgets + traces ; décision par comparaison chiffrée. Vérifie : ton pipeline reprend après échec partiel sans refaire le travail, ton budget borne le pire cas, ta décision agent/workflow cite des chiffres.

## 🎤 Questions d'entretien
- « Conçois le traitement quotidien de 10 000 documents par LLM. » → File + état + parallélisation bornée + reprise + budget + traces (pas un agent).
- « Quand un agent se justifie-t-il vraiment ? » → Chemin dépendant des découvertes ; borné, outillé au moindre privilège, taux de réussite mesuré.
- « Comment gères-tu un échec au milieu de 500 documents ? » → État persisté par unité : on ne relance que les échecs.

## 🧾 À retenir
- 4 patterns de workflow : chaînage, parallélisation, routage, évaluateur-optimiseur.
- Orchestration = état persisté + reprise partielle + budgets + traces.
- Agent vs workflow se tranche par les CHIFFRES (coût/latence/fiabilité), pas par la mode.

## 📚 Vocabulaire
**chaînage / routage / parallélisation / évaluateur-optimiseur** · **file de travail** · **état persisté** · **reprise (resume)** · **échec partiel** · **budget** · **taux de réussite** · **rate limit**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je choisis le bon pattern par tâche et je le justifie.
- [ ] Mes pipelines reprennent après échec partiel sans tout refaire.
- [ ] Ma décision agent/workflow s'appuie sur une comparaison mesurée.

## 🔗 Liens avec le programme
Mois 10 (jours ~274-287), mois 11 (workflow DocSense). Leçons liées : `agents-fundamentals`, `structured-outputs-tools`, `llm-cost-optimization`, `architecture-basics`.
