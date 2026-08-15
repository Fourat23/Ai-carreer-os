# WALKTHROUGHS-V44 — 8 parcours néophyte, de zéro à la preuve

Sprint V44 (FLOOR H). Chaque parcours guide un débutant COMPLET, pas à pas : ce qu'il voit, comment
raisonner (SANS lui donner la solution toute faite), le piège fréquent (misconception), comment
VÉRIFIER, et la preuve produite. Local, déterministe : ouvrir `/lab`, choisir l'exercice, éditer le
fichier, lancer les tests. Aucun réseau, aucune « IA ».

> Convention : un exercice affiche des **tests publics** (visibles) et cache des **tests privés**
> (pour éviter de coder « en dur » les réponses). La **référence** reste côté serveur. « Réussi » se
> lit dans les tests, pas dans la sortie affichée.

---

## 1. `greeting` — écrire sa première fonction (débutant absolu, D1)

- **Avant** : leçon *JavaScript : les bases solides*.
- **Le problème** : renvoyer une salutation à partir d'un prénom.
- **Ce que fait le starter** : il renvoie un texte figé, sans utiliser le prénom reçu.
- **Comment raisonner** : une fonction REÇOIT une entrée (le paramètre) et RENVOIE une sortie. Il faut
  insérer la valeur reçue dans la chaîne renvoyée (interpolation ou concaténation).
- **Piège fréquent** : oublier le `return` (la fonction « affiche » au lieu de « renvoyer »). Un test
  `call-equals` compare la VALEUR RENVOYÉE : sans `return`, il échoue.
- **Vérifier** : le test public montre l'entrée attendue → la sortie. Lance : tous verts.
- **Preuve** : une evidence de type `exercise` sur la compétence `jsts`.

## 2. `fizzbuzz` — la logique conditionnelle qui piège (D2)

- **Avant** : leçon *La pensée algorithmique*.
- **Le problème** : pour chaque nombre, dire « Fizz » (multiple de 3), « Buzz » (multiple de 5),
  « FizzBuzz » (les deux), sinon le nombre.
- **Ce que fait le starter** : il teste 3 et 5 séparément AVANT le cas « les deux » — donc 15 renvoie
  « Fizz » au lieu de « FizzBuzz ».
- **Comment raisonner** : l'ORDRE des conditions compte. Le cas le plus spécifique (multiple de 3 ET
  de 5) doit être testé EN PREMIER, sinon un cas plus général l'intercepte.
- **Piège fréquent** : croire que l'ordre des `if` est indifférent. C'est la même erreur de
  précédence que `se-semver-bump` (cassant avant feature) — un motif transférable.
- **Vérifier** : le test privé contient justement 15 ; s'il passe, la précédence est correcte.
- **Preuve** : evidence `exercise` sur `algo`.

## 3. `algo-two-sum` — quand une table de hachage change tout (D2→D3)

- **Avant** : leçons *Structures de données* et *La pensée algorithmique*.
- **Le problème** : trouver deux nombres dont la somme vaut une cible.
- **Comment raisonner** : la solution naïve compare toutes les paires (O(n²)). Mais si on MÉMORISE
  ce qu'on a déjà vu dans une table (valeur → position), on cherche le complément en temps constant :
  on passe à ~O(n).
- **Piège fréquent** : penser qu'« indexer » n'aide que les bases de données. Le même principe
  (structure à accès direct) accélère ici — c'est le pont du défi `quadratic-blowup-everywhere`.
- **Vérifier** : les tests couvrent le cas « pas de solution » (souvent oublié).
- **Preuve** : evidence `exercise` sur `algo`/`ds`.

## 4. `sql-left-join-nulls` — garder les lignes sans correspondance (D3, nouveau)

- **Avant** : leçon *SQL : les fondations*.
- **Le problème** : joindre des utilisateurs et leurs commandes en gardant AUSSI les utilisateurs sans
  commande (total `null`).
- **Ce que fait le starter** : il se comporte comme un INNER JOIN — les utilisateurs sans commande
  DISPARAISSENT.
- **Comment raisonner** : un LEFT JOIN garde toutes les lignes de gauche. Pour chaque utilisateur :
  s'il a des commandes → une ligne par commande ; sinon → UNE ligne avec `total: null`.
- **Piège fréquent** : confondre INNER et LEFT JOIN, et « perdre » silencieusement des lignes. Un test
  privé vérifie exactement le cas « aucune commande ».
- **Vérifier** : le test public montre un utilisateur sans commande dans la sortie attendue.
- **Preuve** : evidence `exercise` sur `sql`.

## 5. `http-idempotency-dedup` — rejouer sans dupliquer (D4, nouveau)

- **Avant** : leçon *HTTP, REST et JSON* (et *API de production*).
- **Le problème** : un client réémet une requête après une coupure réseau ; il ne faut pas appliquer
  l'effet deux fois.
- **Comment raisonner** : chaque requête porte une CLÉ d'idempotence. On mémorise les clés déjà vues :
  clé connue → « deduped » ; clé nouvelle → « applied » (et on la retient). Cas subtil : une requête
  SANS clé n'est pas idempotente → toujours « applied ».
- **Piège fréquent (misconception `retry-equals-idempotence`)** : croire que « réessayer suffit ».
  Non : sans déduplication, un retry duplique l'effet.
- **Vérifier** : le test privé entrelace des clés (`x`, `y`, `x`, null, `y`) — la logique doit tenir.
- **Preuve** : evidence `exercise` sur `http`.

## 6. `ds-lru-cache` — évincer intelligemment (D4, nouveau)

- **Avant** : leçons *Structures de données* et *Cache et performance*.
- **Le problème** : un cache de capacité fixe doit libérer de la place en évinçant le moins
  récemment utilisé (LRU).
- **Comment raisonner** : garder l'ordre d'usage. À chaque `put`/`get`, l'entrée touchée redevient la
  plus récente ; quand la capacité déborde, on retire la plus ancienne. Le point qui fait échouer les
  débutants : un `get` DOIT lui aussi rafraîchir la récence.
- **Piège fréquent** : n'évincer que sur `put` et oublier que lire change l'ordre.
- **Transfert** : le défi `eviction-policy-everywhere` applique ce principe aux pools et sessions.
- **Vérifier** : un test privé vérifie qu'un `get` a bien protégé une entrée de l'éviction.
- **Preuve** : evidence `exercise` sur `ds`.

## 7. `se-release-decision` — décider sous contraintes concurrentes (D5, nouveau)

- **Avant** : leçon *Tester son code* (et *Réponse aux incidents*).
- **Le problème** : livrer ou non, en pesant plusieurs signaux en tension (incident Sev1, taux
  d'erreur canari, couverture, tests instables).
- **Comment raisonner** : ce n'est pas UN seuil mais un ORDRE de priorité. Un Sev1 ouvert bloque tout,
  quels que soient les autres signaux ; sinon un canari dégradé impose un rollback ; puis seulement on
  regarde couverture/instabilité ; sinon on livre.
- **Piège fréquent** : ne regarder qu'un seul indicateur (« la couverture est bonne, on livre ») et
  ignorer un incident critique.
- **Vérifier** : cinq tests couvrent chaque branche de décision, dans l'ordre de priorité.
- **Preuve** : evidence `exercise` sur `se` — pratique de DÉCISION professionnelle, pas de syntaxe.

## 8. `http-resilient-consumer` — combiner trois mécanismes (D5, nouveau)

- **Avant** : leçon *Travail asynchrone : files, workers, retry et idempotence*.
- **Le problème** : un consommateur de file doit, EN MÊME TEMPS, ne pas ré-appliquer un message déjà
  traité (idempotence), réessayer dans un budget borné, et router en dead letter queue quand le budget
  est épuisé.
- **Comment raisonner** : trois décisions imbriquées. (1) id déjà appliqué → « deduped ». (2) sinon,
  réussite dans le budget → « applied » (et on retient l'id). (3) budget épuisé → « dlq ». Attention à
  la BORNE exacte du budget (strictement inférieur).
- **Piège fréquent (misconceptions `retry-equals-idempotence` + `agent-loop-self-stops`)** : réessayer
  sans borne, ou sans déduplication. Le défi `budget-then-escalate` transpose ce schéma aux agents.
- **Vérifier** : le test privé mélange dédup, budget épuisé et borne exacte.
- **Preuve** : evidence `exercise` sur `http` — synthèse de plusieurs patterns pro.

---

## Note pédagogique

Ces 8 parcours montrent la **progression de difficulté cognitive** V44 : de la première fonction (D1)
à la décision professionnelle multi-signaux (D5). Chaque parcours relie un CONCEPT (leçon), une
PRATIQUE (exercice exécutable), un PIÈGE nommé (misconception) et, quand c'est pertinent, un TRANSFERT
(défi) — la boucle de deliberate practice de HSD-044 §3, rendue explicite pour un néophyte.
