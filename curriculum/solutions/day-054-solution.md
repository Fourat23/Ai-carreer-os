# Correction — Jour 54 : Validation, erreurs centralisées, robustesse d'API

[← Retour au jour 54](../days/day-054.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Durcir l'API sur deux axes : valider TOUTE entrée à la frontière (présence/type/bornes/format) en collectant toutes les erreurs (400 + liste), et centraliser la gestion dans un middleware final qui distingue l'opérationnel (404/400, on informe) du bug (500 générique, détails loggés en interne, jamais fuités). Prouver la robustesse en attaquant l'API avec 10 requêtes malveillantes, chacune recevant une réponse propre sans crash.

## ✅ Une solution simple
Ajouter quelques vérifications d'entrée et un try/catch par route. L'API ne crashe plus sur les cas simples.

## 🚀 Une solution améliorée
Valider chaque champ en ACCUMULANT les erreurs (pattern collecteur, 400 détaillé), centraliser dans un middleware d'erreurs unique qui sépare opérationnel et bug (500 générique sans fuite, log interne), et ATTAQUER l'API avec 10 requêtes malveillantes documentées, chacune avec sa réponse correcte. Garantir qu'aucune entrée ne fait crasher le process.

## ⚠️ Erreurs probables et points à vérifier
- Valider à une porte et en oublier une autre : une entrée non validée s'infiltre.
- Renvoyer la stack trace ou le détail d'un 500 au client : fuite d'information exploitable par un attaquant.
- Confondre erreur opérationnelle et bug : exposer des détails sensibles ou masquer des erreurs légitimes derrière des 500 opaques.
- S'arrêter à la première erreur de validation au lieu de collecter toutes les erreurs pour le client.

## 🔍 Comment vérifier ta solution
- Les 10 requêtes malveillantes reçoivent chacune une réponse correcte (statut + message utile).
- Le middleware d'erreurs central distingue 400/404 (informatif) de 500 (générique, loggé en interne).
- Aucun détail interne (stack, SQL) ne fuit au client.
- Le process ne crashe sur AUCUNE entrée testée.

## ❓ Réponses du mini-quiz
1. **Quel principe fonde une API robuste vis-à-vis des entrées ?**
   → Toute entrée est HOSTILE jusqu'à validation. On vérifie chaque champ (présence, type, bornes, format) à la frontière ; ensuite l'intérieur peut faire confiance aux données.
2. **Quelle est la différence entre une erreur opérationnelle et un bug ?**
   → L'opérationnelle est attendue et normale (404 absent, 400 invalide) : on informe le client. Le bug est une défaillance imprévue : on répond un 500 générique et on logge les détails EN INTERNE.
3. **Pourquoi ne jamais renvoyer la stack trace (ou le détail d'un 500) au client ?**
   → Parce que les détails internes (stack, requête SQL, chemins) renseignent un attaquant : c'est une règle de sécurité. Le client reçoit un 500 générique ; le détail est loggé côté serveur.
4. **Comment prouve-t-on qu'une API est robuste ?**
   → En l'ATTAQUANT soi-même : dix requêtes malveillantes (types faux, champs manquants, ids absurdes, corps géant, JSON invalide). Chacune doit recevoir une réponse propre, jamais un crash ni une stack trace.

## 🎤 À savoir expliquer à l'oral
Ancre sur le principe : « toute entrée est hostile jusqu'à validation ; je valide à la frontière et je renvoie toutes les erreurs d'un coup ». Explique la centralisation : « un middleware final distingue l'opérationnel — 404/400, j'informe — du bug — 500 générique, je logge en interne, je ne fuite jamais la stack ». Terminer par « je prouve la robustesse en attaquant ma propre API » montre une posture défensive concrète, exactement ce qu'on attend sur un service exposé.
