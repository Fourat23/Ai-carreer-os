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

**« Versionner » veut dire quelque chose de précis**, et c'est le point sur lequel tout le reste repose. Un score n'a de sens qu'attaché à ce qui l'a produit, c'est-à-dire à un **quadruplet** : la version du prompt, l'identifiant exact du modèle (pas son alias — un alias change sous toi), la configuration de récupération (taille des chunks, `k`, méthode de fusion), et la version du jeu d'évaluation lui-même. Faire varier l'un des quatre sans l'enregistrer rend toute comparaison ultérieure impossible : on constatera une baisse sans pouvoir dire lequel des quatre a bougé.

C'est aussi ce qui explique un incident très courant : la qualité chute, l'équipe suspecte le dernier changement de prompt, et la cause réelle est le jeu d'évaluation qu'on avait enrichi de huit questions plus difficiles la semaine précédente. **Le jeu d'évaluation est du code**, il se versionne comme le reste, et un changement de jeu invalide toutes les comparaisons antérieures.

**Ce qui distingue vraiment la supervision d'un système LLM de la supervision classique** tient en une phrase : les défaillances y sont **silencieuses**. Une API qui tombe renvoie un 500, et le taux d'erreur le voit. Un système LLM qui se dégrade continue de répondre 200, avec des phrases bien formées et fausses. Aucun signal technique ne bouge — ni latence, ni taux d'erreur, ni saturation. C'est pourquoi l'évaluation régulière n'est pas un supplément de confort : elle est **le seul détecteur de panne** de la partie qui compte, et un système LLM sans évaluation périodique n'est pas supervisé, quelle que soit la richesse de ses tableaux de bord techniques.

Deux signaux mécaniques rattrapent tout de même une part du problème, et méritent une alerte : le **taux d'échec de parsing** (le modèle ne rend plus le format attendu) et le **taux de refus** — s'il s'effondre, le système a peut-être cessé de refuser ce qu'il devrait refuser ; s'il explose, la récupération ne trouve plus rien.

## 🔧 Exemple simple
```json
{"requestId":"a1b2","promptVersion":"extract-v3","model":"claude-sonnet-5",
 "tokensIn":4200,"tokensOut":310,"costUsd":0.017,"latencyMs":2100,"status":"ok"}
```
Un reçu par appel : tout incident devient explicable.

## 🧭 Exemple guidé
Trois questions qu'on se pose toujours trop tard, et auxquelles on ne peut pas répondre après
coup :

> *Pourquoi la facture a-t-elle triplé ce mois-ci ?*
> *Pourquoi cet utilisateur a-t-il eu cette réponse-là ?*
> *La v4 du prompt est-elle meilleure que la v3 ?*

Aucune ne se répond en relisant du code. Toutes se répondent avec **une trace par appel**, à
condition de l'avoir écrite avant d'en avoir besoin.

### Le point de passage unique

```js
async function llmTrace(versionPrompt, messages, ctx) {
  const t0 = Date.now();
  try {
    const r = await llm(messages);
    journal('info', {
      requeteId: ctx.id, versionPrompt, modele: r.model,
      jetonsEntree: r.usage.in, jetonsSortie: r.usage.out,
      coutEur: cout(r.usage), latenceMs: Date.now() - t0, statut: 'ok',
    });
    return r;
  } catch (e) {
    journal('error', { requeteId: ctx.id, versionPrompt, statut: 'echec',
                       erreur: e.code, latenceMs: Date.now() - t0 });
    throw e;
  }
}
```

Ce qui rend cette fonction utile n'est pas son contenu : c'est qu'elle soit **le seul endroit**
d'où partent les appels. Un appel direct qui la contourne est un appel qui n'existe pas dans
tes chiffres — et c'est toujours celui qui coûte cher.

Le contrôle correspondant tient en une ligne, et il mérite d'être dans la revue de code :

```bash
grep -rn "llm(" src/ | grep -v "llmTrace"     # doit ne rien renvoyer
```

### Ce que chaque champ rend possible

| Champ | La question qu'il répond |
|---|---|
| `requeteId` | *que s'est-il passé pour CET utilisateur ?* — recoller les appels d'une même requête |
| `versionPrompt` | *la v4 est-elle meilleure ?* — sans elle, impossible de comparer |
| `modele` | *le routage vers le petit modèle fonctionne-t-il vraiment ?* |
| `jetonsEntree` / `Sortie` | *d'où vient la facture ?* — le calcul de `/doc/lessons/llm-cost-optimization` |
| `coutEur` | *quel poste domine ?*, agrégé par version et par type |
| `latenceMs` | *l'utilisateur attend combien ?* — en centiles, jamais en moyenne |
| `statut` | *quelle part échoue ?* — et le taux de sortie non conforme |

Le champ `versionPrompt` est celui qu'on oublie systématiquement, et c'est celui qui donne à
tout le reste sa valeur comparative. Des coûts et des latences non attribués à une version sont
des chiffres qu'on ne peut confronter à rien.

### Le reçu, et la latence en centiles

Un « reçu » est une ligne JSON par appel — pas une phrase de journal. La différence est
opérationnelle : on peut agréger des champs, on ne peut pas agréger des phrases.

Et une agrégation mérite un avertissement : **la latence se lit en centiles, jamais en
moyenne.** Une moyenne à 900 ms avec un centile 95 à 6 secondes décrit un service où une
requête sur vingt est très lente — et c'est exactement l'expérience dont les utilisateurs
parlent. La moyenne, elle, a l'air acceptable.

### Le rapport quotidien, et le seuil qu'il doit contenir

```
2026-03-14  appels=12 480  coût=48,20 €  p50=740 ms  p95=3 100 ms
            échecs=0,4 %   sortie non conforme=2,1 %
            par version : v3 = 71 % des appels, v4 = 29 %
            ⚠ coût cumulé du mois : 620 € / budget 800 € (78 %)
```

La dernière ligne est celle qui distingue une supervision d'un tableau de bord décoratif : **une
alerte qui se déclenche avant le dépassement.** Un budget découvert le 3 du mois suivant est un
incident ; à 78 % le 14, c'est une décision qu'on peut encore prendre.

Le taux de **sortie non conforme** mérite aussi sa ligne : c'est la proportion de réponses qui
n'ont pas passé la validation de schéma. Sa dérive annonce un changement du modèle en amont,
souvent avant que la qualité perçue ne bouge — c'est l'un des rares indicateurs **précoces**
d'un système d'IA.

### Ce qui ne doit pas entrer dans les traces

Un dernier point, non négociable : **ne journalise jamais le contenu intégral des messages sans
y avoir réfléchi.** Ce contenu vient d'utilisateurs, contient des données personnelles, parfois
des secrets qu'ils ont collés eux-mêmes, et un journal se conserve des mois et se lit par
beaucoup de monde.

Les trois réponses, dans l'ordre de préférence : ne stocker que les **métadonnées** (tailles,
identifiants, statuts) ; stocker une **empreinte** du prompt plutôt que le prompt ; ou stocker
le contenu dans un système à durée de vie courte et à accès restreint, distinct des journaux
ordinaires.

C'est la même règle que pour les erreurs applicatives dans `/doc/lessons/error-handling` : la
trace doit permettre de diagnostiquer, pas de reconstituer ce qu'un utilisateur a écrit.


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

**Critère de réussite, vérifiable seul, et c'est le seul qui teste vraiment un reçu** : prends
un reçu au hasard et **recalcule son coût à la main, à partir des seuls champs qu'il
contient**. Si tu dois aller chercher ailleurs le modèle utilisé, son tarif, ou le nombre de
tokens d'entrée, ton reçu est incomplet — et il le restera le jour où tu en auras besoin,
c'est-à-dire six mois plus tard, sur un incident, quand le script aura changé. **Un reçu
qu'on ne peut pas relire sans son contexte d'origine n'est pas une trace, c'est un souvenir.**

## 🔥 Exercice plus difficile
Construis un mini rapport quotidien : coût total, latence p95, taux de parse-fail, à partir de tes logs — et une alerte si le coût dépasse un budget.

**Critère de réussite, vérifiable seul** : **déclenche ton alerte exprès**, en abaissant le
budget sous le coût d'hier. Tu dois la voir arriver là où tu la lirais vraiment — pas dans la
console du script. Une alerte qu'on n'a jamais vue se déclencher n'existe pas : on ne sait ni
si elle part, ni où elle arrive, ni si son texte permet d'agir. Vérifie ce dernier point en
particulier — si le message dit « budget dépassé » sans dire de combien ni depuis quand, il
te réveillera sans t'aider.

## ✅ Correction attendue
### La démarche

*Un point de passage unique, un reçu par appel, des agrégats par version, des évaluations
régulières comparées à une référence.*

### « Aucun appel ne contourne le wrapper »

Le critère se vérifie mécaniquement, et il doit l'être — parce que le contournement n'est jamais
volontaire : c'est un script de test devenu permanent, une correction urgente, un nouveau
service écrit par quelqu'un qui ignorait la convention.

```bash
grep -rn "openai\.\|anthropic\.\|\.messages\.create\|llm(" src/ | grep -v "llmTrace"
```

Zéro résultat, ou une exception justifiée par écrit. Mieux encore : rendre le contournement
impossible en n'exportant que la fonction tracée, et en gardant le client brut privé au module.

C'est le même principe que le guichet d'erreurs unique de `/doc/lessons/express-backend` :
**une garantie qui repose sur la discipline de chacun n'est pas une garantie.**

### Le reçu : ce qu'on regrette de ne pas avoir mis

Trois champs sont ajoutés après coup dans presque tous les projets, et chacun coûte des semaines
de données perdues :

| Champ manquant | Ce qu'on ne peut pas faire |
|---|---|
| `versionPrompt` | comparer deux versions — donc justifier une amélioration |
| `requeteId` | recoller les appels d'une même requête utilisateur, donc enquêter sur un cas |
| `typeRequete` | savoir quel **usage** coûte le plus, donc où optimiser |

Le troisième est le plus sous-estimé. Un coût global de 620 € ne dit rien ; le même réparti en
`classification 40 %`, `résumé 15 %`, `génération finale 45 %` désigne immédiatement où porter
l'effort — et révèle souvent que le poste dominant est une tâche accessoire qu'on aurait pu
confier à un petit modèle.

### Les agrégats, et la faute de la moyenne

Le rapport quotidien demandé se construit sur trois indicateurs, et **deux d'entre eux ne se
lisent pas en moyenne** :

| Indicateur | Comment le lire | Pourquoi |
|---|---|---|
| coût | **somme**, par version et par type | c'est le total qui est facturé |
| latence | **centiles** p50 et p95, jamais la moyenne | une moyenne de 900 ms peut cacher un p95 à 6 s |
| taux de sortie non conforme | proportion, avec sa **tendance** | sa valeur absolue importe moins que sa dérive |

La latence mérite l'insistance : c'est l'indicateur le plus souvent mal présenté de toute
l'informatique. Un centile 95 à 6 secondes signifie qu'une requête sur vingt met plus de six
secondes — c'est-à-dire que **chaque utilisateur en rencontre une régulièrement**. La moyenne,
elle, reste rassurante et ne décrit l'expérience de personne.

### L'alerte : avant, pas après

```
si coût_cumulé_du_mois > 0,5 × budget  → information
si coût_cumulé_du_mois > 0,8 × budget  → alerte à une personne nommée
si coût_journalier > 3 × médiane        → alerte immédiate (anomalie)
```

Le troisième seuil est celui qui attrape ce que les deux premiers laissent passer : une boucle
lancée un vendredi soir peut consommer un mois de budget en une nuit, et le compteur mensuel
n'aura franchi 80 % qu'une fois le mal fait.

Une alerte sur la **dérivée** — la consommation du jour comparée à l'ordinaire — est la seule
qui détecte un incident au moment où il commence. C'est le même raisonnement que pour toute
supervision : les seuils absolus détectent les dépassements, les seuils relatifs détectent les
anomalies.

### Le lien avec l'évaluation

Les traces disent **ce qui s'est passé** ; le harnais de `/doc/lessons/ai-evaluation` dit **si
c'est bon**. Aucun des deux ne remplace l'autre, et les deux se rejoignent par un seul champ :
`versionPrompt`.

```
v3 : 71 % des appels · 0,74 € pour mille · p95 = 2 900 ms · fidélité 0,86
v4 : 29 % des appels · 1,10 € pour mille · p95 = 4 200 ms · fidélité 0,91
```

Écrites côte à côte, ces deux lignes permettent une décision qu'aucune des deux ne permet
seule : la v4 est meilleure de 5 points de fidélité, pour 49 % de coût en plus et une latence
p95 en hausse de 45 %. **Est-ce que ça vaut le coup ?** Ce n'est pas une question technique, et
elle est enfin posable.

### La mauvaise solution plausible

Journaliser intégralement les prompts et les réponses, « pour pouvoir tout rejouer ».

Trois problèmes, et le premier est juridique :

1. **ces contenus viennent d'utilisateurs.** Données personnelles, informations d'entreprise,
   secrets collés par mégarde. Un journal se conserve des mois, se réplique, et se lit par
   beaucoup plus de monde que la base de production ;
2. **le volume explose** — quelques kilo-octets par appel, des millions d'appels ;
3. **on ne les relit jamais.** Ce qui sert au diagnostic, ce sont les métadonnées : quelle
   version, quel modèle, combien de jetons, quel statut.

Les alternatives, par ordre de préférence : métadonnées seules ; empreinte du prompt plutôt que
le prompt ; contenu dans un magasin séparé, à durée de vie courte et accès restreint. C'est
exactement la règle de `/doc/lessons/error-handling` : **la trace doit permettre de
diagnostiquer, pas de reconstituer ce qu'un utilisateur a écrit.**

### Auto-évaluation

| Vérification | Comment |
|---|---|
| aucun contournement | la commande `grep` ne renvoie rien |
| version tracée | tu peux comparer deux versions de prompt sur des données réelles |
| coût par type | tu sais quel usage domine la facture |
| latence en centiles | ton rapport donne p50 et p95, pas une moyenne |
| alerte sur la dérivée | une consommation anormale d'une nuit déclenche quelque chose |
| pas de contenu sensible | tu peux montrer une ligne de journal à n'importe qui |

### Généralisation

L'observabilité d'un système d'IA n'a rien d'exotique : ce sont les mêmes trois piliers que
partout — **journaux structurés, métriques agrégées, traces reliées par un identifiant**. Les
leçons `/doc/lessons/logging-structured` et `/doc/lessons/observability-fundamentals` en
donnent le fond.

Ce que l'IA ajoute est un quatrième pilier qui n'existe nulle part ailleurs : **le coût par
appel, variable et immédiat.** Un service classique coûte ce que coûtent ses serveurs ; un
appel de modèle coûte ce qu'il consomme, à chaque fois. C'est ce qui rend l'instrumentation non
pas recommandée mais obligatoire — et c'est aussi ce qui la rend facile à justifier auprès de
quelqu'un qui doit signer la facture.


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
