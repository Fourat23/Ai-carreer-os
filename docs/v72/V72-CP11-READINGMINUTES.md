# V72 — CP11. `readingMinutes` et métadonnées du programme

**Mandat** : régénérer proprement les estimations périmées **si** le générateur est
déterministe et les invariants préservés ; comparer les 365 journées ; **seuls les champs
attendus doivent changer**.

**Résultat** : rien à régénérer — c'était **déjà fait**, comme effet des CP6 et CP8. La
vérification a donc porté sur ce qui compte vraiment : le générateur est-il déterministe, et
n'a-t-il changé **que** ce qu'il devait ?

---

## 1. Le déterminisme, testé au lieu d'être supposé

Le contrat conditionne la régénération au déterminisme du générateur. C'est vérifiable
directement : exécuter `npm run generate` deux fois de suite et comparer.

| contrôle | résultat |
|---|---|
| empreinte de tout `curriculum/` après une 1ʳᵉ génération | `f578a2db…` |
| empreinte après une 2ᵉ génération | **`f578a2db…` — identique** |
| `data/program.json`, champ `generatedAt` exclu | **identique** |

**Le générateur est déterministe.** Le seul champ qui bouge d'une exécution à l'autre est
l'horodatage `generatedAt`, ce qui est son rôle.

---

## 2. `readingMinutes` : l'état réel, mesuré

Recalcul des 365 journées avec la formule du projet (`mots / 150 + lignes de code / 20`, sur la
journée + les leçons liées + la correction), comparé à ce que `data/program.json` publie :

| | |
|---|---|
| journées dont `readingMinutes` est périmé | **0 / 365** |
| écart maximal entre valeur publiée et valeur recalculée | **0 min** |
| **seuil C10** (écart max ≤ 5 min) | **ATTEINT** |

Le CP0 mesurait **314 journées périmées, +1 369 min cumulées**. Les régénérations des CP6 et
CP8 — nécessaires pour propager la correction des revues et l'insertion Kubernetes — ont
recalculé l'ensemble au passage.

---

## 3. Ce que le générateur a réellement changé depuis le CP0

Comparaison champ par champ de `data/program.json` entre le commit du CP0 (`167f822`) et
aujourd'hui, sur les 365 entrées :

| champ | journées modifiées |
|---|---|
| **`readingMinutes`** | **315** |
| `day`, `week`, `month` | 0 |
| `title` | **0** |
| `deliverable` | **0** |
| `hours` | **0** |
| `skill`, `skillName` | **0** |
| `difficulty`, `isReview`, `detailed`, `project` | 0 |

**Un seul champ a changé sur les 365 journées.** Les clés racine, le nombre de journées (365),
de leçons (128) et de compétences (20) sont identiques, et l'ordre `days[i].day === i+1` est
intact.

### L'écart le plus grand est un résultat, pas une dérive

| | |
|---|---|
| écart cumulé | **+612 min** |
| écart maximal | **286 min — j77 : 454 → 168** |

j77 est la revue de la semaine 11, celle qui liait vingt leçons. Le CP6 l'a ramenée à sept :
son temps de lecture publié devait donc chuter, et il a chuté de 286 minutes. **Le plus grand
mouvement de ce fichier est la trace d'une correction voulue**, pas d'un glissement.

Le +612 min cumulé se décompose en deux mouvements opposés : la croissance du corpus (V71
+3,6 %, puis les corrections V72 des CP2, CP3 et CP9) qui allonge la plupart des journées de
quelques minutes, et la réduction des six revues qui en retire beaucoup sur peu de journées.

---

## 4. Ce que le CP11 a modifié

**Rien.** Aucune régénération n'était nécessaire, et en provoquer une pour le principe n'aurait
fait qu'écrire un nouvel horodatage.

| contrôle | résultat |
|---|---|
| fichiers modifiés par le CP11 | **0** |
| ordre des 365 jours | inchangé |
| 128 / 365 / 365 | inchangé |
| corpus des leçons | inchangé |
