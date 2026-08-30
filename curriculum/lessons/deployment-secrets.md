<!-- keep -->
# Leçon — Secrets, environnements et déploiement

## 🌍 Le problème d'abord
Un développeur commit par mégarde une clé d'API dans le dépôt. Quelques heures plus tard, la clé est aspirée par un robot qui scanne GitHub, et la facture cloud explose — ou pire, des données fuient. Un secret commis une seule fois est compromis POUR TOUJOURS, même supprimé ensuite (il reste dans l'historique). Le problème de fond : le code est fait pour être PARTAGÉ, les secrets pour rester PRIVÉS — ils ne doivent jamais voyager ensemble. Cette leçon t'apprend à gérer secrets et configuration proprement (hors du code, par environnement) et à déployer sans fuiter — l'erreur qui coûte le plus cher évitée.

## 🎯 Objectif
Gérer les secrets (clés d'API, mots de passe) et la configuration proprement : hors du code, par environnement, jamais dans Git. Savoir déployer une application simple sans fuiter. Un secret commis une fois est compromis pour toujours — cette leçon évite l'erreur qui coûte le plus cher.

## 🧩 Prérequis
Tu dois comprendre le fonctionnement de Git et le fait que l'historique conserve TOUT (`/doc/lessons/git-fundamentals`), ainsi que les bases de la sécurité applicative et du moindre privilège (`/doc/lessons/authentication`). Savoir qu'une application se configure différemment selon l'environnement (dev/test/prod) aide. Aucune plateforme de déploiement particulière n'est supposée.

## 🧠 Modèle mental
Le code est **PUBLIC par défaut** (partagé, commité, copié) ; les secrets sont **PRIVÉS par nature**. Ils ne doivent jamais voyager ensemble. La configuration, c'est **ce qui change entre les environnements** (dev/test/prod) sans que le code change : elle vit dans l'ENVIRONNEMENT, pas dans le code.

## 📖 Explication complète
- **Variables d'environnement** : le canal standard. Le code lit `process.env.API_KEY` ; la valeur est fournie au lancement (fichier `.env` en local, secrets du CI/hébergeur ailleurs). Le `.env` est dans `.gitignore` ; un `.env.example` (committé, SANS valeurs) documente les variables attendues.
- **Pourquoi jamais dans Git** : l'historique n'oublie rien. Un secret commité puis « supprimé » reste dans l'historique — il est compromis, il faut le RÉVOQUER (pas juste l'effacer). Audit : chercher dans tout l'historique avant de rendre un repo public.
- **Par environnement** : dev (clés de test, base locale), prod (clés réelles). Même code, config différente — c'est ce qui rend le déploiement sûr et répétable.
- **Le circuit d'un secret** : créé chez le fournisseur → stocké dans le gestionnaire (env local, secrets GitHub Actions, vault) → injecté au run → JAMAIS loggé, JAMAIS renvoyé au client, JAMAIS dans une image Docker.
- **Déployer simple** : pour un projet local/perso, « déployer » = une machine qui a Docker + les variables d'env + `docker compose up`. Les plateformes managées automatisent ce circuit, mais le principe est identique.

**Une variable d'environnement n'est PAS un coffre-fort**, et c'est la nuance qui manque à la plupart des explications. C'est le canal standard parce qu'il sépare la configuration du code — ce qui est déjà l'essentiel — mais sa valeur reste largement visible : elle apparaît dans la liste des processus sur certains systèmes, elle est héritée par tous les sous-processus lancés par l'application, elle finit dans un vidage mémoire après un plantage, et un `console.log(process.env)` posé pour déboguer l'écrit intégralement dans les journaux. Les fuites réelles passent bien plus souvent par là que par un dépôt Git.

Les conséquences pratiques sont simples et se tiennent : ne jamais journaliser l'environnement en bloc, ne jamais renvoyer un message d'erreur qui contienne une valeur de configuration, et sur un projet sérieux, faire lire le secret **au démarrage** par un gestionnaire dédié plutôt que de le laisser dans l'environnement du processus toute sa vie.

**La rotation est la partie que tout le monde saute.** Un secret n'est pas un objet permanent : il doit pouvoir être remplacé sans interruption de service, et c'est ce qui rend un incident supportable. La conception qui le permet tient en une phrase — **le système doit accepter deux secrets valides à la fois** pendant la transition : on ajoute le nouveau, on redéploie, on vérifie que tout fonctionne, puis seulement on révoque l'ancien. Une architecture qui n'accepte qu'un seul secret transforme chaque rotation en coupure, ce qui garantit qu'on ne fera jamais de rotation — et donc qu'un secret compromis le restera. C'est aussi ce qui permet de répondre « en dix minutes » plutôt que « il faut qu'on voie » le jour où une clé fuite.

## 🔧 Exemple simple
```bash
# .env (gitignoré)          # .env.example (committé)
ANTHROPIC_API_KEY=sk-...    ANTHROPIC_API_KEY=
DB_PATH=./data/app.db       DB_PATH=
```
Le code : `const key = process.env.ANTHROPIC_API_KEY; if (!key) throw new Error("ANTHROPIC_API_KEY manquante");`

## 🧭 Exemple guidé — « j'ai supprimé le fichier au commit suivant, c'est réglé »

C'est la phrase qu'on entend le jour de l'incident, et elle est fausse. Plutôt
que de l'affirmer, on va la mettre à l'épreuve dans un vrai dépôt git.

Le script `scripts/v70-verifications/secret-dans-git.sh` construit un dépôt
jetable, y commet un `.env` contenant `STRIPE_KEY=sk_live_51H8fQ2aNvR`, puis
supprime le fichier au commit suivant — exactement le geste réflexe. Ensuite il
pose la seule question qui compte : le secret est-il encore lisible ?

**Étape 1 — l'état du répertoire de travail rassure.** Après `git rm .env` et
le commit, il n'y a plus aucun fichier `.env` sur le disque. Sortie mesurée :
`fichiers .env presents dans le working tree : 0`. C'est ce que voit le
développeur, et c'est ce qui produit le faux sentiment de résolution.

**Étape 2 — l'historique, lui, n'a rien oublié.**

```
$ git show <commit-fautif>:.env
DB_PASSWORD=Tr0ub4dor-prod-2026
STRIPE_KEY=sk_live_51H8fQ2aNvR

$ git log -p --all | grep -c 'sk_live_51H8fQ2aNvR'
2
```

Deux occurrences : celle de l'ajout, celle de la suppression. Le commit de
suppression **contient lui-même le secret**, puisqu'un diff de suppression
affiche les lignes retirées. Supprimer un secret l'écrit une seconde fois.

**Étape 3 — l'objet existe indépendamment du fichier.** Git ne stocke pas des
fichiers mais des objets adressés par leur contenu. Le contenu du `.env` vit
dans un blob :

```
$ git rev-list --objects --all | grep '\.env$'
4dff3baf2ebe18462ebb60d73b9258af693c8a66 .env
$ git cat-file -p 4dff3ba
DB_PASSWORD=Tr0ub4dor-prod-2026
STRIPE_KEY=sk_live_51H8fQ2aNvR
```

**Étape 4 — le nettoyage évident ne nettoie rien.** `git reflog expire
--expire=now --all` suivi de `git gc --prune=now` ne supprime que les objets
*inatteignables*. Le blob est référencé par un commit qui est dans la branche :
il est parfaitement atteignable. Après ces deux commandes, `git cat-file -p`
renvoie toujours le secret en clair. Ce n'est pas un bug : c'est la définition
du ramasse-miettes.

**Étape 5 — la réécriture d'historique fonctionne, et coûte cher.** Le script
lance `git filter-branch --index-filter`. Résultat mesuré :

```
HEAD avant : 38f35e25b73ab484a7991c65c9d1f5f53e75ba88
HEAD apres : 1b88b2148fa7648a08e582f98e826b4d13f29817
identiques ? NON
(ces deux empreintes changent à chaque exécution du script — elles dépendent
 de l horodatage du commit ; ce qui est reproductible, c est qu elles diffèrent)
occurrences (branche) : 0
occurrences (--all)   : 2
```

Deux choses à lire ici, et elles comptent toutes les deux.

D'abord **tous les identifiants de commit changent**. Réécrire l'historique ne
modifie pas un commit : cela en fabrique de nouveaux. Toute personne ayant
cloné travaille désormais sur une histoire qui n'existe plus ; toute branche non
fusionnée doit être rebasée. Ce n'est pas une commande, c'est une opération
d'équipe qui se planifie.

Ensuite, **la branche est propre mais le dépôt ne l'est pas**. Les références
présentes après l'opération :

```
refs/heads/master
refs/original/refs/heads/master     <- sauvegarde posée par filter-branch
refs/remotes/origin/master          <- ce que le serveur avait déjà reçu
```

`filter-branch` conserve délibérément une sauvegarde sous `refs/original/`.
Tant qu'elle existe, rien n'est effacé. Et même après l'avoir supprimée, après
un nouveau `reflog expire` et un nouveau `gc --prune=now`, la mesure donne
encore :

```
occurrences (--all)  : 2
```

parce que `refs/remotes/origin/master` pointe toujours sur l'ancienne histoire.
Et sur le dépôt distant lui-même, qui n'a reçu aucune de ces commandes :

```
occurrences chez origin : 2
```

**Étape 6 — la question à laquelle git ne répond pas.** Le secret a-t-il été lu
entre le push et le nettoyage ? Aucune des commandes ci-dessus ne le sait, et
aucune ne peut le savoir. Un dépôt public est scanné par des robots en
continu ; la fenêtre se compte en minutes, pas en jours.

**Ce que la mesure impose comme ordre des opérations.** Elle ne dit pas « ne
nettoie pas ». Elle dit que le nettoyage est la troisième priorité, pas la
première :

1. **Révoquer la clé chez le fournisseur.** C'est la seule action qui rend le
   secret inutilisable pour qui l'a déjà copié. Elle prend trente secondes et
   ne dépend de personne d'autre.
2. **Générer la nouvelle clé et la déployer** par le canal de configuration
   (secrets CI, gestionnaire de secrets), pas par le dépôt.
3. **Réécrire l'historique** si le dépôt est partagé ou destiné à le devenir —
   en prévenant l'équipe, et en sachant que cela n'annule pas les copies déjà
   faites.
4. **Empêcher la récidive** : `.gitignore`, et un contrôle avant commit qui
   refuse les motifs de clés connues.

Si tu ne devais retenir qu'un seul enchaînement : **révoquer d'abord, nettoyer
ensuite.** L'ordre inverse consacre une heure à effacer les traces d'une clé qui
reste valide pendant ce temps.

## 🤖 Exemple appliqué (IA / data / architecture)
Tes apps LLM vivent de clés d'API : la clé Anthropic de DocSense passe par `ANTHROPIC_API_KEY`, injectée par `docker run -e` ou les secrets de la CI — jamais dans l'image ni le code. La CI a SES propres secrets (GitHub Actions → Settings/Secrets) masqués dans les logs.

## ⚠️ Erreurs fréquentes
- **Croire que supprimer le fichier suffit.** Mesuré ci-dessus : le secret reste
  lisible par `git show`, par `git log -p`, et par `git cat-file` sur le blob.
- **Nettoyer avant de révoquer.** Pendant la demi-heure de réécriture
  d'historique, la clé est toujours acceptée par le fournisseur.
- **Oublier `refs/original/` et `refs/remotes/`.** La branche est propre, le
  dépôt ne l'est pas. Le contrôle honnête est `git log -p --all`, pas `git log -p`.
- **Oublier le dépôt distant.** Une réécriture locale ne touche pas ce que le
  serveur détient déjà.
- **Journaliser l'environnement en bloc.** Un `console.log(process.env)` posé
  pour déboguer écrit toutes les valeurs dans les journaux, qui sont eux-mêmes
  souvent moins protégés que le dépôt.
- **La même clé partout.** Si dev et prod partagent la clé, la révoquer coupe la
  production. On ne révoque alors jamais.

## 🚫 Anti-patterns
- `config.js` committé avec les vraies valeurs « temporairement ».
- Envoyer un secret par chat/mail « juste cette fois ».

## ✍️ Mini-exercice
Sans relire la leçon : après `git rm .env && git commit`, quelle commande
montre encore le secret, et pourquoi le commit de suppression le contient-il
lui-même ?

## 🔥 Pratique — auditer, prouver, et poser un garde-fou

Cette pratique produit trois artefacts : une trace d'audit, une démonstration
reproductible, et un contrôle qui s'exécute.

**A. Auditer un dépôt réel (le tien).** Écris un script `audit-secrets.sh` qui,
sur n'importe quel dépôt passé en argument, cherche des motifs de secrets dans
**tout** l'historique et pas seulement dans la branche courante. Il doit :
- parcourir `git log -p --all` et non `git log -p` ;
- chercher au moins les motifs `sk_live_`, `AKIA[0-9A-Z]{16}` (clé AWS),
  `-----BEGIN .* PRIVATE KEY-----`, et `password\s*=\s*['"][^'"]{8,}` ;
- pour chaque occurrence, afficher le commit, la date et le fichier, de sorte
  qu'on puisse répondre à « depuis quand ? » ;
- se terminer avec un code de sortie non nul s'il a trouvé quelque chose, pour
  être branchable dans une CI.

Livrable : la sortie du script sur un de tes dépôts, et le code de sortie.

**B. Reproduire la fuite et sa non-suppression.** Construis un dépôt jetable,
commets un faux secret, supprime-le, puis produis les quatre preuves : `git
show`, `git log -p --all | grep -c`, `git cat-file -p <blob>`, et la même
recherche après `gc --prune=now`. Écris ce que tu attends AVANT de lancer chaque
commande, puis note ce que tu obtiens.

**C. Empêcher la récidive.** Écris un hook `pre-commit` qui inspecte ce qui est
*mis en scène* (`git diff --cached`), pas le répertoire de travail, et refuse le
commit si un des motifs de A apparaît. Vérifie ensuite deux choses :
- que le hook bloque bien un `git commit` contenant `sk_live_test123` ;
- ce que fait `git commit --no-verify`.

**D. Rotation sans coupure.** Sur une petite application qui lit
`API_KEY`, fais-la accepter `API_KEY` **et** `API_KEY_PRECEDENTE` pendant une
transition. Montre par un test que les deux valeurs sont acceptées, puis retire
l'ancienne et montre qu'elle est refusée.

## ✅ Correction attendue

**A — l'audit.** Le point qui départage une bonne réponse d'une réponse
approximative est `--all`. Un audit sur `git log -p` seul déclare propre un
dépôt qui ne l'est pas, exactement comme dans l'étape 5 mesurée plus haut : la
branche courante peut être nettoyée alors que `refs/original/` et
`refs/remotes/origin/*` détiennent encore le secret. Squelette attendu :

```bash
#!/usr/bin/env bash
set -u
DEPOT="${1:-.}"
MOTIFS='sk_live_|AKIA[0-9A-Z]{16}|-----BEGIN .* PRIVATE KEY-----|password[[:space:]]*=[[:space:]]*.{8,}'
TROUVE=0
cd "$DEPOT" || exit 2
while read -r sha date; do
  if git show "$sha" | grep -qE "$MOTIFS"; then
    echo "SUSPECT $sha $date"
    git show --name-only --format= "$sha" | sed 's/^/    /'
    TROUVE=1
  fi
done < <(git log --all --format='%H %ad' --date=short)
exit $TROUVE
```

Deux limites qu'une bonne réponse mentionne d'elle-même. D'abord ce script
produit des **faux positifs** : `password = "changeme"` dans un fichier
d'exemple sera signalé. C'est le bon compromis — un faux positif coûte trente
secondes, un faux négatif coûte un incident. Ensuite il produit des **faux
négatifs** : un secret qui ne ressemble à aucun motif connu (un mot de passe de
base de données quelconque) passe au travers. L'audit par motifs réduit le
risque, il ne l'annule pas ; c'est pourquoi le garde-fou de C compte plus que
l'audit de A.

**B — les quatre preuves.** Les valeurs attendues, telles que le script de
vérification les produit : `git show <fautif>:.env` affiche le secret ; `git
log -p --all | grep -c` renvoie **2** et non 1, parce que le diff de suppression
réaffiche les lignes retirées ; `git cat-file -p <blob>` affiche le secret même
après `git rm` ; et après `reflog expire` + `gc --prune=now`, il l'affiche
**encore**, parce qu'un commit atteignable référence le blob. Si ta prédiction
pour la dernière était « le secret disparaît », tu viens d'apprendre la
distinction entre objet inatteignable et objet supprimé, qui est le cœur du
sujet.

**C — le hook.** L'erreur classique est d'inspecter le répertoire de travail :

```bash
grep -rE "$MOTIFS" .        # ❌ inspecte les fichiers, pas ce qui va être commité
```

Ce contrôle passe au vert sur un fichier modifié mais non ajouté, et échoue sur
un fichier présent en local et déjà ignoré. Il faut inspecter l'index :

```bash
#!/usr/bin/env bash
if git diff --cached -U0 | grep -qE '^\+.*(sk_live_|AKIA[0-9A-Z]{16})'; then
  echo "refus : un secret apparait dans les lignes ajoutees." >&2
  exit 1
fi
```

Le `^\+` restreint aux lignes **ajoutées** : sans lui, retirer une ligne
contenant un secret déclencherait le refus et rendrait la correction
impossible. Et `git commit --no-verify` contourne le hook entièrement, sans
demander confirmation. C'est la bonne conclusion de l'exercice : un hook local
est une aide à la vigilance, pas un contrôle de sécurité. Le contrôle qui ne se
contourne pas est celui qui tourne côté serveur, dans la CI, sur la branche
protégée — c'est-à-dire le script de A avec son code de sortie.

**D — la rotation.** La forme attendue tient en une lecture :

```js
const acceptees = [process.env.API_KEY, process.env.API_KEY_PRECEDENTE]
  .filter(Boolean);
if (acceptees.length === 0) { throw new Error('API_KEY manquante'); }
const valide = (fournie) =>
  acceptees.some((k) => timingSafeEqualStr(k, fournie));
```

Ce que cette forme achète : la séquence « ajouter la nouvelle → redéployer →
vérifier → révoquer l'ancienne » se déroule sans qu'aucune requête ne soit
refusée. Une architecture qui n'accepte qu'une seule valeur transforme chaque
rotation en coupure — et une rotation qui coupe est une rotation qu'on ne fait
jamais. C'est la raison pour laquelle des clés compromises restent actives des
mois : non pas parce que personne ne sait qu'il faut les changer, mais parce que
le système ne permet pas de les changer sans arrêter le service.

Deux détails que la correction attend : la comparaison se fait en temps
constant (`timingSafeEqual`) et non avec `===`, et l'absence des **deux**
variables doit faire échouer le démarrage bruyamment — un service qui démarre
sans clé et refuse tout le trafic est plus difficile à diagnostiquer qu'un
service qui refuse de démarrer.

## 🎤 Questions d'entretien
- « Où mets-tu tes clés d'API ? » → Variables d'environnement, `.env` gitignoré, `.env.example` committé, secrets CI côté pipeline.
- « Tu as commité un secret, que fais-tu ? » → Révoquer d'abord, regénérer, nettoyer, prévenir la récidive.
- « Pourquoi des clés différentes par environnement ? » → Limiter le rayon d'explosion et pouvoir révoquer sans tout casser.

## 🧾 À retenir
- Un secret commité est compromis. La suppression du fichier ne le retire ni de
  l'historique, ni de la base d'objets, ni du dépôt distant — mesuré.
- Ordre en cas de fuite : **révoquer**, puis remplacer, puis nettoyer, puis
  prévenir la récidive. L'ordre inverse laisse la clé valide pendant le nettoyage.
- `git log -p` ne suffit pas pour auditer : `refs/original/` et
  `refs/remotes/*` gardent l'ancienne histoire. L'audit se fait avec `--all`.
- Une variable d'environnement sépare la configuration du code ; elle ne la
  protège pas. Elle est héritée par les sous-processus et lisible dans un
  vidage mémoire.
- Un système doit accepter deux secrets valides à la fois, sinon la rotation
  coupe le service — et n'est donc jamais faite.
- Un hook `pre-commit` se contourne avec `--no-verify` : le contrôle qui compte
  est celui de la CI.

## 📚 Vocabulaire
**variable d'environnement** · **.env / .env.example** · **révocation** · **rotation** · **secrets CI** · **vault** · **rayon d'explosion** · **12-factor config**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Aucun secret dans aucun historique de mes repos (audité).
- [ ] Mes apps valident leurs variables au démarrage.
- [ ] Je sais utiliser un secret en CI sans le fuiter.

## 🔗 Liens avec le programme
Mois 8 (première clé LLM), mois 11-12 (Docker, CI, projet final). Leçons liées : `docker-containers`, `ci-cd`, `ai-security`.
