# Correction — Jour 46 : Projet 1 — TaskFlow : CRUD complet et filtres

[← Retour au jour 46](../days/day-046.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Compléter le CRUD en style immuable : done/rm/edit retournent des copies modifiées via mettreAJourParId (jour 26), l'original n'est jamais muté. Composer les filtres (filter du jour 23) en laissant passer les critères absents, avec le test de PRÉSENCE (undefined) pour éviter le piège falsy (jour 5). Valider chaque argument à la frontière avec un message clair et exit 1.

## ✅ Une solution simple
done/rm/edit et un filtrage de base fonctionnent. Le CRUD est complet.

## 🚀 Une solution améliorée
Rendre TOUTES les mises à jour immuables (prouver que l'original n'est jamais muté), composer proprement les filtres combinables en testant la présence des critères (pas leur véracité), et valider chaque entrée à la frontière (id, priorité) avec un message clair plutôt qu'une stack trace. Réutiliser explicitement les patterns du mois 1 (mettreAJourParId, filter, comparateurs).

## ⚠️ Erreurs probables et points à vérifier
- Muter les tâches en place au lieu de retourner des copies : effets de bord et bugs de référence partagée.
- Piège falsy : filtres qui ignorent une valeur légitime falsy (chaîne vide, priorité 0) faute de tester la présence.
- Filtres qui ne se combinent pas correctement (un critère absent qui filtre au lieu de tout laisser passer).
- Laisser une entrée invalide produire une stack trace brute au lieu d'un message clair et d'un exit 1.

## 🔍 Comment vérifier ta solution
- done/rm/edit fonctionnent et les mises à jour sont immuables (l'original n'est jamais muté, vérifiable).
- Les filtres se combinent correctement, testés avec deux filtres simultanés.
- Le piège falsy est désamorcé (test de présence undefined, pas de véracité).
- Tout id invalide ou inconnu produit un message clair, jamais une stack trace.

## ❓ Réponses du mini-quiz
1. **Pourquoi mettre à jour une tâche en IMMUABLE plutôt qu'en la mutant ?**
   → La mutation crée des effets de bord (bug de référence partagée). Retourner une copie modifiée laisse l'original intact, rend l'opération pure et testable sans fichiers.
2. **Qu'est-ce que le piège falsy dans un filtre combinable ?**
   → Tester `if (critere)` ignore une valeur légitime mais falsy (chaîne vide, 0). Il faut tester la PRÉSENCE (`critere !== undefined`), pas la véracité, pour distinguer « pas de filtre » de « filtre sur une valeur falsy ».
3. **Comment un critère de filtre absent doit-il se comporter ?**
   → Il doit laisser TOUT passer (ne rien filtrer) : `f.statut === undefined || t.statut === f.statut`. Seuls les critères fournis restreignent le résultat.
4. **Pourquoi valider les arguments à la frontière avec un message clair ?**
   → Tout argument CLI est hostile jusqu'à validation. Un message clair + exit 1 aide l'utilisateur ; une stack trace brute fait peur, n'aide pas et donne un aspect non fini.

## 🎤 À savoir expliquer à l'oral
Explique le choix de l'immutabilité par le bug qu'il évite : « je retourne une copie modifiée, l'original reste intact, l'opération est pure et testable — c'est le modèle Redux ». Puis pointe le piège falsy : « je teste la présence du critère, pas sa véracité, sinon une chaîne vide serait confondue avec pas de filtre ». Insister sur la validation aux frontières (message clair, pas de stack trace) montre que tu penses à l'expérience utilisateur et à la robustesse, pas seulement au chemin heureux.
