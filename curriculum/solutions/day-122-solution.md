# Correction — Jour 122 : Python : exceptions et robustesse

[← Retour au jour 122](../days/day-122.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : un try/except autour des opérations risquées. Solution améliorée : rattraper le type SPÉCIFIQUE de chaque opération faillible (FileNotFoundError, JSONDecodeError, ValueError), lever soi-même (`raise`) sur les préconditions métier violées, distinguer erreurs métier (exception personnalisée) et techniques, chaîner avec `from e` pour conserver la cause, et traduire en message clair + code de sortie non nul à la frontière. La preuve : chaque échec prévisible donne un message utile, et un vrai bug remonte au lieu d'être avalé.

## ⚠️ Erreurs probables et points à vérifier
- `except:` nu ou `except Exception` trop large : avale bugs et interruptions, masque les vrais problèmes — rattraper le type spécifique.
- Rattraper puis ignorer silencieusement (`except: pass`) : le pire — un pipeline qui « marche » en produisant des données fausses.
- Vérifier tout avant (LBYL) au lieu de tenter (EAFP) : verbeux et sujet aux courses — préférer try/except.
- Ne pas chaîner (`raise ... from e`) : la trace perd la cause d'origine, débogage plus difficile.

## 🔍 Comment vérifier ta solution
- Chaque opération faillible rattrape son type d'exception SPÉCIFIQUE.
- Aucun `except:` nu ni rattrapage silencieux.
- Les préconditions métier lèvent une exception (`raise`) — échec tôt.
- Les erreurs métier (exception personnalisée) sont distinctes des techniques.
- Les erreurs sont chaînées (`from e`) et traduites en message clair à la frontière.

## 🎤 À savoir expliquer à l'oral
Oppose EAFP (tenter + rattraper spécifique) et LBYL (tout vérifier avant), et explique pourquoi le `except` large est dangereux (avale les bugs, données fausses silencieuses). Cite l'échec tôt (`raise` sur précondition) et la distinction métier/technique. Le pipeline qui « marche » en produisant des données fausses est l'exemple qui prouve que tu comprends l'enjeu réel.
