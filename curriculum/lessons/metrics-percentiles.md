<!-- keep -->
# Leçon — Métriques et percentiles : quand la moyenne ment

## 🌍 Le problème d'abord
Ton tableau de bord affiche « latence moyenne : 120 ms ». Tout va bien, non ? Et
pourtant le support reçoit des plaintes : « le site rame ». Comment est-ce possible si
la moyenne est bonne ? Parce que la **moyenne écrase les cas graves** : si 99
requêtes prennent 50 ms et 1 requête prend 7 secondes, la moyenne reste basse (~120
ms) alors qu'un utilisateur sur cent attend 7 secondes. Cette personne, c'est
peut-être ton plus gros client. Pour VOIR ces cas, il faut d'autres outils que la
moyenne : les **percentiles**. Cette leçon apprend à lire les bons nombres pour
qu'une catastrophe cachée ne passe plus inaperçue.

## 🎯 Objectif
Comprendre les grandes familles de **métriques** (latence, trafic, erreurs,
saturation), pourquoi la **moyenne trompe** et comment les **percentiles**
(p50/p95/p99) révèlent l'expérience réelle, et connaître trois cadres de lecture :
**RED**, **USE** et les **Golden Signals**.

## 🧩 Prérequis
Tu dois comprendre le rôle des **métriques** parmi les piliers de l'observabilité
(`/doc/lessons/observability-fundamentals`) et avoir une idée des **ressources**
d'une machine (CPU, mémoire, I/O — `/doc/lessons/linux-resources-io`). Aucune
statistique avancée n'est requise : la notion de percentile est construite ici.

## 🧠 Modèle mental
Une **métrique** est un nombre mesuré dans le temps (requêtes/seconde, ms de latence,
% d'erreurs). La **moyenne** résume mal une distribution asymétrique : quelques
valeurs extrêmes la tirent peu, mais font très mal aux utilisateurs concernés. Un
**percentile** répond à « quelle valeur n'est PAS dépassée par X % des requêtes ? ».
p95 = 800 ms signifie « 95 % des requêtes sont sous 800 ms, mais 5 % sont AU-DESSUS ».
Penser « le pire vécu par les 5 % / 1 % les plus malchanceux », pas « la valeur
typique ».

## 📖 Explication progressive
**Les quatre familles de signaux.** Pour un service, on surveille surtout :
- **Latence** : combien de temps pour répondre (et pour les requêtes en ERREUR aussi
  — une erreur rapide vs lente n'a pas le même sens).
- **Trafic / débit** : combien de requêtes par seconde.
- **Erreurs** : quelle fraction échoue (4xx/5xx, exceptions).
- **Saturation** : à quel point les ressources sont pleines (CPU, mémoire, file
  d'attente) — le signal qui précède l'effondrement.

**Percentiles vs moyenne.** p50 (médiane) = l'expérience typique. p95/p99 = la queue,
là où vivent les utilisateurs qui souffrent. On surveille les percentiles ÉLEVÉS
parce que : (1) la moyenne cache la queue ; (2) un utilisateur fait souvent plusieurs
requêtes — la probabilité qu'AU MOINS UNE tombe dans les 1 % lents est élevée. Règle :
on parle de latence en p95/p99, pas en moyenne.

**Exemple chiffré (la moyenne ment).** 100 requêtes : 99 à 50 ms, 1 à 5 000 ms.
Moyenne ≈ 100 ms (« ça va »). p99 = 5 000 ms (« un utilisateur sur cent attend 5 s »).
Le p99 dit la vérité que la moyenne cache.

**Trois cadres pour ne rien oublier.**
- **RED** (pour les services orientés requêtes) : **R**ate (trafic), **E**rrors,
  **D**uration (latence).
- **USE** (pour les ressources) : **U**tilization, **S**aturation, **E**rrors.
- **Golden Signals** (Google SRE) : latence, trafic, erreurs, saturation.
Ce sont des check-lists : elles évitent l'angle mort « je ne mesurais pas les
erreurs ».

**Baseline et régression.** Un nombre seul ne dit rien : 300 ms, c'est bien ou mal ?
Il faut une **baseline** (la normale). Une **régression de performance** = un écart
significatif vs la baseline après un changement (ex. p95 x2 après une release). D'où
l'intérêt de comparer AVANT/APRÈS, pas de juger dans l'absolu.

**Bottleneck et profiling.** Quand une étape domine le temps (cf. traces), c'est le
**goulot d'étranglement** (bottleneck). Le **profiling** mesure où le CPU/le temps
est réellement dépensé DANS le code. On optimise le goulot, pas au hasard.

## 🔎 Décomposition
- métrique = un nombre dans le temps ; moyenne = résumé trompeur si distribution
  asymétrique.
- p50 = typique ; p95/p99 = la queue qui fait mal.
- RED (requêtes), USE (ressources), Golden Signals = check-lists de couverture.
- baseline = la normale ; régression = écart significatif vs baseline.

## 🛠 Exemple guidé — « la moyenne est bonne, les clients râlent »
1. Moyenne latence : 120 ms → semble OK.
2. On regarde les percentiles : p50 = 60 ms, p95 = 400 ms, **p99 = 6 000 ms**.
3. Diagnostic : la queue est catastrophique — 1 % des requêtes sont inutilisables.
4. Trace sur une requête p99 (cf. tracing) : le temps part dans un appel non mis en
   cache. On cible CE goulot, mesuré, pas une optimisation au hasard.

## 🧪 Mise en pratique
Voir la pratique associée : calculer p50/p95/p99 d'un échantillon, rendre un verdict
de régression vs baseline, repérer un signal d'observabilité manquant.

## ⚠️ Erreurs fréquentes / anti-patterns
- **Juger la latence à la moyenne** → on rate la queue (p95/p99).
- Comparer un nombre à rien (**pas de baseline**) → « 300 ms » ne veut rien dire seul.
- Oublier une famille de signaux (souvent la **saturation** ou les **erreurs**).
- Optimiser au hasard sans identifier le **goulot** (profiling/traces d'abord).
- Mesurer la latence des seules requêtes en SUCCÈS (les erreurs lentes comptent aussi).

## 🏢 Cas métier
Une équipe pilotait sur la latence moyenne (stable). Le taux de churn augmentait sans
explication. En passant au p99, elle découvre que 2 % des requêtes prenaient > 8 s —
concentrées sur les gros comptes (plus de données). Correctif ciblé (pagination +
index) : p99 divisé par 10, churn en baisse. La moyenne ne l'aurait jamais montré.

## 🚨 Que faire dans ce cas ? — « le p95 explose après une release »
- **Observer** : confirmer avec la métrique (p95 avant/après) et localiser via une
  trace.
- **Limiter l'impact** : si la release est la cause, envisager rollback (cf.
  release-incident-recovery).
- **Hypothèses** : nouveau code dans le chemin critique ? requête N+1 ? cache perdu ?
- **Corriger puis valider** : re-mesurer le p95 vs baseline ; ne considérer résolu que
  si la métrique revient.
- **Prévenir** : porte de perf en CI (comparer à la baseline), alerte sur p95/p99.

## 🎤 Questions d'entretien
- « Pourquoi la moyenne trompe-t-elle ? » → elle écrase la queue ; p95/p99 révèlent
  les cas graves.
- « Que signifie p99 = 800 ms ? » → 99 % des requêtes sous 800 ms, 1 % au-dessus.
- « RED vs USE ? » → signaux orientés requêtes (Rate/Errors/Duration) vs ressources
  (Utilization/Saturation/Errors).

## ✅ À retenir
- La moyenne ment sur les distributions asymétriques : piloter en p95/p99.
- Quatre signaux : latence, trafic, erreurs, saturation.
- RED (requêtes), USE (ressources), Golden Signals : check-lists de couverture.
- Toujours une baseline ; une régression = écart significatif vs baseline.

## 📚 Vocabulaire
**métrique** · **latence / débit / erreurs / saturation** · **moyenne vs
percentile** · **p50 / p95 / p99** · **RED · USE · Golden Signals** · **baseline** ·
**régression de performance** · **goulot d'étranglement (bottleneck)** ·
**profiling** · **cardinalité**.

## 🎯 Pratique associée
Exercices : calcul de percentiles, verdict de régression, signal manquant.

## 🔗 Liens avec le programme
Jours `/day/79` (observabilité) et `/day/80` (performance). Leçons liées :
`/doc/lessons/observability-fundamentals`, `/doc/lessons/distributed-tracing`,
`/doc/lessons/linux-resources-io`, `/doc/lessons/slo-error-budget`. Les percentiles
sont la base des SLO et de l'error budget.
