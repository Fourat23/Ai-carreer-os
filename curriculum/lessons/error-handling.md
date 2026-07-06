<!-- keep -->
# Leçon — Gestion d'erreurs

## 🎯 Objectif
Concevoir la gestion d'erreurs comme une ARCHITECTURE, pas des try/catch éparpillés : distinguer erreurs attendues et bugs, centraliser, ne jamais crasher ni fuiter, et dégrader gracieusement quand une dépendance (base, LLM) échoue. C'est ce qui rend un système vivable en production.

## 🧠 Modèle mental
Une erreur est **un message, pas une catastrophe** : quelque chose dit « je ne peux pas faire ce que tu demandes, voilà pourquoi ». Ton travail : décider QUI répond QUOI à chaque message possible — à l'avance, pas dans la panique.

## 📖 Explication complète
- **Deux familles** : l'erreur **opérationnelle** (attendue : fichier absent, entrée invalide, API distante en panne, ressource inexistante) se GÈRE — on informe, on réessaie, on dégrade. Le **bug** (inattendu : null déréférencé, invariant violé) se LOGGE en détail et on échoue proprement — le masquer, c'est corrompre en silence.
- **Traiter à la frontière, centraliser la réponse** : valider les entrées à l'entrée ; attraper au niveau qui SAIT quoi faire ; un gestionnaire central (middleware d'erreurs) formate les réponses — 400/404/409 informatifs pour l'opérationnel, 500 générique pour les bugs (les détails restent dans les logs, jamais chez le client : sécurité).
- **Les dépendances échouent** : le réseau, la base, l'API LLM tomberont. Prévoir : **timeout** (ne jamais attendre indéfiniment), **retry avec backoff** (uniquement sur les opérations idempotentes !), **fallback/dégradation** (mode réduit plutôt que page blanche), et le refus propre quand rien ne marche.
- **Les erreurs font partie du contrat** : une fonction documente ce qu'elle lance ; une API documente ses codes d'erreur ; un CLI sort avec un code non nul et un message utile.
- L'anti-règle absolue : le `catch` vide. Avaler une erreur, c'est transformer un signal en bombe à retardement.

## 🔧 Exemple simple
```js
try {
  data = JSON.parse(fs.readFileSync(PATH, "utf8"));
} catch (err) {
  if (err.code === "ENOENT") data = [];   // attendu : premier lancement
  else throw err;                          // bug ou corruption : on ne masque pas
}
```

## 🧭 Exemple guidé
**Énoncé** : appeler une API LLM avec timeout, retry et dégradation.
**Raisonnement** : l'appel peut être lent (timeout), échouer transitoirement (retry borné) ou durablement (fallback).
**Solution (pseudo)** :
```js
async function appelRobuste(prompt) {
  for (let essai = 1; essai <= 3; essai++) {
    try {
      return await avecTimeout(llm(prompt), 30_000);
    } catch (err) {
      if (!estTransitoire(err) || essai === 3) break;   // 429/503 → retry, 401 → non
      await attendre(1000 * 2 ** essai);                 // backoff exponentiel
    }
  }
  return { degrade: true, message: "Service IA indisponible, réessayez." };
}
```
**Explication** : on ne retry que le transitoire, borné, avec backoff ; au bout, une réponse DÉGRADÉE utilisable, pas un crash. **Variante** : logge chaque tentative avec le correlation id.

## 🤖 Exemple appliqué (IA / data / architecture)
DocSense doit survivre à : LLM down (réponse dégradée), document corrompu (ingestion qui signale et continue), sortie non parsable (retry puis refus propre), question vide (400 clair). La liste des 10 scénarios d'erreur testés un par un est un critère de qualité du projet final.

## ⚠️ Erreurs fréquentes
- `catch {}` vide (le pire anti-pattern du métier).
- Retry sur une opération NON idempotente (double paiement).
- Stack trace renvoyée au client (fuite d'infos internes).
- Tout traiter au même endroit, ou nulle part.

## 🚫 Anti-patterns
- « Ça n'arrivera jamais » (ça arrivera).
- Codes d'erreur maison incohérents d'un endpoint à l'autre.

## ✍️ Mini-exercice
Liste les 5 erreurs possibles d'une de tes routes API et, pour chacune : attendue ou bug ? qui répond quoi, avec quel statut ?

## 🔥 Exercice plus difficile
Implémente `appelRobuste` pour de vrai (timeout + retry idempotent + fallback), et prouve chaque branche par un test (mock qui échoue N fois, qui traîne, qui échoue durablement).

## ✅ Correction attendue
La logique : classer (attendu/bug) → traiter au bon niveau → centraliser la réponse → prévoir la panne des dépendances. Vérifie : aucun catch vide, aucun détail interne chez le client, retry borné et idempotent, un mode dégradé UTILISABLE, et chaque scénario d'erreur testé.

## 🎤 Questions d'entretien
- « Erreur opérationnelle vs bug ? » → L'attendue se gère (400/404/retry) ; le bug se logge et échoue proprement (500 générique).
- « Quand peux-tu retry ? » → Erreur transitoire ET opération idempotente, avec backoff et borne.
- « Que renvoies-tu au client sur un bug ? » → Un 500 générique ; les détails vont dans les logs.

## 🧾 À retenir
- Classer : attendu (gérer) vs bug (logger + échouer proprement).
- Timeout partout, retry borné sur l'idempotent, dégradation gracieuse.
- Jamais de catch vide, jamais de détails internes au client.

## 📚 Vocabulaire
**erreur opérationnelle** · **timeout** · **retry / backoff exponentiel** · **idempotence** · **fallback / dégradation gracieuse** · **circuit breaker** · **fail fast** · **contrat d'erreur**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je classe chaque erreur (attendue/bug) et je sais qui répond quoi.
- [ ] Mes appels externes ont timeout, retry borné, fallback.
- [ ] Aucun catch vide ni fuite de détails internes dans mon code.

## 🔗 Liens avec le programme
Mois 3 (API robuste), mois 8 (appels LLM), mois 11-12 (DocSense). Leçons liées : `observability-logging`, `structured-outputs-tools`, `testing-foundations`.
