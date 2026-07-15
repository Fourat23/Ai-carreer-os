# Correction — Jour 300 : Consolidation sécurité + revue mensuelle 10

[← Retour au jour 300](../days/day-300.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : résumer les défenses du mois. Solution améliorée : une vue en COUCHES cohérente, un principe directeur assumé (réduire/limiter/détecter, pas l'étanchéité ; moindre privilège en fil rouge), des menaces résiduelles explicites, et surtout la PREUVE — 3 vraies failles (issues du threat model/audits) corrigées, vérifiées, et idéalement verrouillées par des tests adverses. La revue mensuelle triage acquis/fragile/ouvert. La sécurité se prouve par des failles fermées, pas par des intentions.

## ⚠️ Erreurs probables et points à vérifier
- Une synthèse de principes sans failles corrigées : la sécurité se PROUVE par des failles réelles fermées, pas par des intentions récitées.
- Prétendre à l'invulnérabilité : une posture mûre assume les menaces résiduelles — un système « 100 % sûr » est un mensonge suspect.
- Corriger sans verrouiller : une faille corrigée sans test peut rouvrir au prochain changement — l'ajouter à la suite adverse (jour 264) la ferme durablement.
- Une revue mensuelle sans FRAGILE ni chiffres : le triage honnête (dont ce qui reste fragile) est ce qui rend la revue utile et crédible.

## 🔍 Comment vérifier ta solution
- La synthèse présente les couches de défense et le principe directeur (moindre privilège, réduire/limiter/détecter).
- Les menaces résiduelles sont assumées explicitement.
- 3 vraies failles sont corrigées ET vérifiées (faille → correctif → vérification).
- Au moins une correction est verrouillée par un test adverse (variante).
- La revue mensuelle 10 triage acquis/fragile/ouvert avec 3 chiffres du mois.

## 🎤 À savoir expliquer à l'oral
Prouve ta posture plutôt que de la réciter : « voici mes couches, mon principe — moindre privilège et détectabilité, pas l'étanchéité — mes menaces résiduelles assumées, et surtout les 3 failles que mon threat model a trouvées et que j'ai fermées et verrouillées par des tests ». Démontrer la sécurité par des failles réellement corrigées, dans un domaine où elle est négligée, est un différenciateur d'entretien majeur.
