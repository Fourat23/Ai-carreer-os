# Correction — Jour 283 : Orchestration

[← Retour au jour 283](../days/day-283.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : une boucle qui traite chaque document et sauve le résultat. Solution améliorée : découpage en unités à id stable, parallélisation BORNÉE par sémaphore (anti-429), checkpoint par unité pour la reprise idempotente, retry/backoff sur transitoire, journal des échecs définitifs (on continue), et budget estimé/plafonné/suivi. Le livrable est une ARCHITECTURE (schéma) montrant ces composants, pas juste du code.

## ⚠️ Erreurs probables et points à vérifier
- Concurrence non bornée (500 appels d'un coup) : rate limits massifs, coût simultané, instabilité — le sémaphore est indispensable.
- Pas de checkpoint : un plantage au document 480 perd les 479 traités (et re-payés au relancement) — sauver au fil de l'eau.
- Pas de budget : à l'échelle, une erreur d'estimation devient une facture énorme découverte trop tard — estimer avant, plafonner, suivre.
- Un échec d'unité qui arrête tout : un document illisible ne doit pas bloquer les 499 autres — journaliser et continuer.

## 🔍 Comment vérifier ta solution
- Le travail est découpé en unités indépendantes à id stable.
- La concurrence est bornée (sémaphore) pour éviter les rate limits.
- Un checkpoint par unité permet la reprise sans retraiter (idempotence prouvée).
- Un budget est estimé avant, plafonné, et suivi pendant.
- Les échecs d'unités sont journalisés sans arrêter l'orchestration.

## 🎤 À savoir expliquer à l'oral
Réponds à « traite un million de documents » en architecte : « découpage en unités, workers à concurrence bornée, checkpoint par unité pour la reprise, retry sur transitoire, budget plafonné ». Insiste sur la reprise : « un plantage à 90 % ne doit pas tout reperdre — idempotence, on saute ce qui est fait ». Parler reprise/concurrence/budget plutôt que « une boucle qui appelle le LLM » est le signal system design.
