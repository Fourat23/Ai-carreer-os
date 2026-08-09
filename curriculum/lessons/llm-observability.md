<!-- keep -->
# Leçon — LLMOps : observer un système LLM en production

## 🌍 Le problème d'abord
Ton système LLM tourne en production. Un client se plaint : « la réponse était fausse hier
soir ». Tu ouvres ton code… et tu n'as AUCUNE trace de ce qui s'est passé : quel prompt, quel
modèle, quel contexte récupéré, combien ça a coûté, combien de temps. Pire : quelqu'un a
changé le prompt la semaine dernière et tu ne sais pas si la qualité a baissé depuis. Un
système LLM n'est pas un logiciel classique déterministe : chaque appel est unique, coûteux et
non reproductible. Sans instrumentation, tu es aveugle — incapable d'expliquer une facture, un
bug ou une régression. Cette leçon montre comment donner à chaque appel un « reçu » et suivre
la santé du système dans le temps, pour le faire VIVRE et pas seulement le lancer.

## 🎯 Objectif
Savoir instrumenter un système LLM : tracer chaque appel (prompt, version, tokens, coût, latence), relier les traces aux évaluations, détecter les régressions et la dérive. « LLMOps » = faire vivre un système IA dans le temps, pas juste le lancer.

## 🧠 Modèle mental
Un appel LLM est **une transaction coûteuse et non déterministe** : comme une transaction bancaire, chacune mérite un REÇU (qui, quoi, combien, résultat). Sans reçus, impossible d'expliquer une facture, un bug ou une baisse de qualité.

## 🧩 Prérequis
Tu dois comprendre les principes d'observabilité (logs, métriques, traces, corrélation par
identifiant) vus côté systèmes (`/doc/lessons/observability-fundamentals`), et ce qu'est un
appel LLM avec ses tokens et son coût (`/doc/lessons/llm-fundamentals`,
`/doc/lessons/llm-cost-optimization`). Les notions d'évaluation par version (golden set,
régression) éclairent le suivi de qualité (`/doc/lessons/ai-evaluation`). Aucun outil
propriétaire n'est supposé.

## 📖 Explication complète
Ce qu'on trace PAR APPEL (le « reçu ») : requestId (corrélation), version du prompt, modèle utilisé, tokens entrée/sortie, coût calculé, latence, statut (ok / parse-fail / retry / refus), et — si non sensible — un échantillon des entrées/sorties pour le debug.
Ce qu'on suit EN AGRÉGÉ : coût/jour et par fonctionnalité, latence p95, taux de parse-fail, taux de refus, distribution des scores d'éval PAR VERSION (prompt + modèle + config RAG).
Les trois problèmes que ça résout :
1. **La facture inexpliquée** : le coût par fonctionnalité montre où partent les tokens (souvent : trop de contexte injecté).
2. **La régression silencieuse** : un changement de prompt fait chuter la fidélité — visible seulement si les scores sont VERSIONNÉS (ce score ↔ ce commit ↔ cette version de prompt).
3. **La dérive fournisseur** : le modèle est mis à jour côté API, tes scores bougent sans changement de code — détectable par des évals régulières comparées à la baseline.
La boucle LLMOps : tracer → agréger → évaluer régulièrement → comparer aux baselines → alerter/corriger. C'est le monitoring classique + la dimension QUALITÉ, propre à l'IA.

## 🔧 Exemple simple
```json
{"requestId":"a1b2","promptVersion":"extract-v3","model":"claude-sonnet-5",
 "tokensIn":4200,"tokensOut":310,"costUsd":0.017,"latencyMs":2100,"status":"ok"}
```
Un reçu par appel : tout incident devient explicable.

## 🧭 Exemple guidé
**Énoncé** : envelopper les appels LLM pour tout tracer.
**Raisonnement** : un seul point de passage (wrapper) → aucune trace oubliée.
**Solution (pseudo)** :
```js
async function llmTrace(promptVersion, messages, ctx) {
  const t0 = Date.now();
  try {
    const r = await llm(messages);
    log('info', { requestId: ctx.id, promptVersion, model: r.model,
      tokensIn: r.usage.in, tokensOut: r.usage.out,
      costUsd: cout(r.usage), latencyMs: Date.now() - t0, status: 'ok' });
    return r;
  } catch (err) {
    log('error', { requestId: ctx.id, promptVersion, latencyMs: Date.now() - t0,
      status: 'error', err: err.code });
    throw err;
  }
}
```
**Explication** : le wrapper est l'UNIQUE porte vers le LLM — chaque appel a son reçu, succès ou échec. **Variante** : ajoute un compteur de coût journalier avec seuil (garde-fou budget).

## 🤖 Exemple appliqué (IA / data / architecture)
Le dashboard qualité de DocSense croise ces traces avec le harnais d'éval : « depuis la version extract-v4, la fidélité a gagné 6 points et le coût par question a baissé de 20 % ». Cette phrase — impossible sans LLMOps — vaut de l'or en entretien.

## ⚠️ Erreurs fréquentes
- Appels LLM éparpillés sans wrapper → traces incomplètes.
- Prompts non versionnés → scores incomparables.
- Logger des données sensibles dans les échantillons de prompts.
- Évaluer une fois au lancement puis plus jamais (la dérive passe inaperçue).

## 🚫 Anti-patterns
- Découvrir les coûts sur la facture du fournisseur.
- « Ça a l'air toujours bon » comme monitoring qualité.

## ✍️ Mini-exercice
Ajoute un wrapper de trace à un de tes scripts LLM et produis le « reçu » JSON de 5 appels réels.

## 🔥 Exercice plus difficile
Construis un mini rapport quotidien : coût total, latence p95, taux de parse-fail, à partir de tes logs — et une alerte si le coût dépasse un budget.

## ✅ Correction attendue
La logique : un point de passage unique, un reçu par appel, des agrégats par version, des évals régulières comparées à la baseline. Vérifie : aucun appel ne contourne le wrapper, les prompts ont une version, aucun secret/PII dans les traces, et tu peux répondre « combien a coûté hier ? » en une commande.

## 🎤 Questions d'entretien
- « Comment surveilles-tu un système LLM en prod ? » → Reçu par appel (tokens, coût, latence, statut), agrégats par version, évals régulières vs baseline.
- « Comment détectes-tu qu'une mise à jour du modèle a dégradé ton système ? » → Scores d'éval versionnés qui bougent sans changement de code.
- « Comment expliques-tu une facture LLM ? » → Coût tracé par appel et par fonctionnalité.

## 🧾 À retenir
- Un appel LLM = un reçu (version, tokens, coût, latence, statut).
- Versionner prompts et scores : sinon rien n'est comparable.
- Évaluer régulièrement : la dérive est silencieuse par défaut.

## 📚 Vocabulaire
**LLMOps** · **trace / reçu d'appel** · **version de prompt** · **coût par requête** · **parse-fail** · **dérive** · **baseline** · **garde-fou budget**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Tous mes appels LLM passent par un wrapper qui trace.
- [ ] Mes prompts et mes scores d'éval sont versionnés.
- [ ] Je peux dire ce qu'a coûté hier et si la qualité a bougé.

## 🔗 Liens avec le programme
Mois 10-12 (jours ~285, 310-335), projet final. Leçons liées : `observability-logging`, `monitoring-production`, `llm-cost-optimization`, `ai-evaluation`.
