# V69 — vérifications exécutables des affirmations chiffrées

Chaque chiffre publié dans un exemple guidé réécrit en V69 provient d'un de ces
scripts. Ils sont ici pour que n'importe qui puisse les rejouer et contredire le
cours si le résultat diffère.

Ils ne font que **mesurer**. Aucun n'écrit dans `curriculum/` (brief V69 §14).

## Exécution

```bash
node scripts/v69-verifications/<nom>.mjs
node scripts/v69-verifications/express-chaine-erreurs.cjs <dossier-express>
PYTHONPATH=<venv> python3 scripts/v69-verifications/<nom>.py
```

Les scripts Python demandent `numpy`, `pandas` et `scikit-learn` ; ceux qui
pilotent un navigateur demandent `playwright-core` et un Chromium local ;
`express-chaine-erreurs.cjs` demande une installation d'Express (4 et 5).
Aucune de ces dépendances n'est ajoutée au projet : elles ont été installées
hors de l'arborescence pendant la vérification.

## Correspondance script → leçon → affirmation vérifiée

| script | leçon | ce qui a été mesuré |
|---|---|---|
| `express-chaine-erreurs.cjs` | express-backend | gestionnaire à 3 paramètres jamais atteint ; 1,8 ko de pile renvoyée au client (148 o si `NODE_ENV=production`) ; Express 4 tue le processus sur promesse rejetée, Express 5 l'achemine |
| `linux-serveur-signaux.mjs` | linux-processes-signals | codes de sortie 0 / 143 / 137 selon le traitement de SIGTERM |
| `networking-refus-timeout.mjs` | networking-tcp-ip-model | refus de connexion en 2 ms contre 4 ms pour un succès. **Limite : le cas timeout n'est pas reproductible ici**, l'environnement acheminant tout le trafic sortant par un mandataire — aucun chiffre n'a été publié pour ce cas |
| `error-handling-budget.mjs` | error-handling | pire cas 96 s pour un timeout affiché à 30 s ; 600 requêtes vers un service tombé pour 200 clients |
| `sql-fan-out.mjs` | sql-foundations | produit cartésien local : 900 au lieu de 300, classement inversé, `SUM(DISTINCT)` faux dès que deux montants coïncident |
| `database-modeling-contraintes.mjs` | database-modeling | `UNIQUE(livre_id, rendu_le)` accepte trois emprunts simultanés (NULL ≠ NULL) et refuse deux retours le même jour ; l'index partiel tient |
| `authentication-hachage.mjs` | authentication | 434 000 SHA-256/s contre 22 scrypt/s sur un cœur, rapport ≈ 20 000 |
| `sql-fan-out.mjs`, `ai-security-filtrage.mjs` | ai-security | filtrage après recherche : 2 documents sur 5, 3 interdits traversés ; augmenter k aggrave |
| `prompt-injection-citations.mjs` | prompt-injection-defense | le vérificateur de citations bloque l'invention (0,00) et **accepte** l'attaque réelle (1,00) |
| `react-keys.mjs` | react-fundamentals | avec `key={index}`, la coche se déplace sur une autre tâche après suppression |
| `react-course-effets.mjs` | react-hooks-effects | les quatre réponses arrivent dans l'ordre inverse ; sans cleanup l'écran affiche « c » pendant que le champ affiche « chat » |
| `dom-innerhtml.mjs` | browser-dom-rendering | saisie et focus perdus au rafraîchissement par `innerHTML`, conservés par réutilisation des nœuds |
| `dom-injection.mjs` | browser-dom-rendering | `<script>` inséré par `innerHTML` ne s'exécute pas, `<img onerror>` et `<iframe srcdoc>` s'exécutent |
| `forms-validation-native.mjs` | web-forms-validation | `type="email"` accepte `a@b` ; `type="number"` déclare `abc` **valide** (valeur lue `""`) |
| `html-semantique.mjs` | html-semantic-structure | `<div onclick>` : non compté comme bouton, `tabIndex` −1, 0 déclenchement sur Entrée/Espace ; `<section>` sans nom n'est pas une région |
| `ml-fuite-selection.py` | machine-learning-basics | 0,870 contre 0,590 sur du bruit pur ; la fuite par normalisation ne fabrique presque rien |
| `model-evaluation-prevalence.py` | model-evaluation | le modèle nul obtient 0,990 ; précision 8,8 % à 1 % de prévalence, 70,4 % à 20 % |
| `statistics-percentiles-simpson.py` | statistics-for-ml | moyenne 121 / p95 153 / p99 955 ms ; 92,3 % des sessions touchées ; paradoxe de Simpson chiffré |
| `feature-engineering-cardinalite.py` | feature-engineering | 604 colonnes contre 5 ; encodage par la cible à 0,610 sur des données sans signal |
| `pandas-conversions.py` | pandas-data-wrangling | somme 494,50 au lieu de 1 840,40 ; `05/04/2024` lu 4 mai ; 6 clients au lieu de 4 |
| `neural-networks-zero-grad.py` | neural-networks | perte de 9,98 à 64,90, en **descendant** les quatre premières époques |
| `embeddings-geometrie.py` | embeddings | cosinus de vecteurs aléatoires : 80,6 % au-dessus de 0,30 en dimension 2, 0,00 % en 768 |
| `transformers-attention.py` | transformers | matrice d'attention réelle, masque causal, vecteur avant/après |
| `prompt-engineering-json.mjs` | prompt-engineering | 6/9 parsent, 8/9 après réparation, **4/9** respectent le schéma |
| `rag-chunking.mjs` | rag-fundamentals | découpage à taille fixe : **0** morceau contient question et réponse |
| `agents-cout-fiabilite.mjs` | agents-fundamentals | workflow 0,64 € constant ; agent de 0,32 à 6,79 € ; 20 étapes à 95 % → 35,8 % |
| `llm-cout-contexte.mjs` | llm-fundamentals | 18× plus cher, 34 650 €/mois d'écart. **Tarifs illustratifs**, à revérifier |

## Ce qui n'a pas pu être vérifié, et n'a donc pas été chiffré

- **Docker** : le démon n'est pas disponible dans cet environnement. Les leçons
  `docker-containers` et `docker-images-layers` ne citent aucune sortie de commande
  ni taille d'image mesurée ; `docker history` y est donné comme un geste que le
  lecteur doit faire, pas comme un résultat constaté.
- **Modèles de langage** : aucun n'est joignable. Aucune sortie de modèle n'est
  présentée comme mesurée. Les leçons LLM s'appuient sur des propriétés de format,
  de géométrie ou d'arithmétique, toutes calculées ici.
- **PyTorch** : indisponible. Le comportement de `zero_grad()` a été reproduit par
  une descente de gradient écrite à la main, et la leçon ne cite aucune sortie PyTorch.
- **Timeout réseau** : voir `networking-refus-timeout.mjs` ci-dessus.
- **Processus zombie** : tentative faite, non reproductible (Node et `sh` récoltent
  leurs enfants). Aucune affirmation chiffrée n'a été publiée à ce sujet.
