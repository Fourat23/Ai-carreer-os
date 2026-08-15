# V45 — TRACK AUDIT (parcours de bout en bout)

Audit **lecture seule** des **8 parcours disponibles** + 1 annoncé. Fait structurel : tous les parcours
sont des VUES (sous-ensembles de moduleRefs) sur un **unique programme de 365 jours / 12 modules**.
Seuls **61/365 jours** ont une pratique de code mappée (`data/day-exercises.json`) ; 313 jours ont un
« deliverable », 52 sont des révisions, 10 des projets.

## Grille des 10 questions (résumé par parcours)

Légende readiness : 🟢 START NOW · 🟠 START WITH CAVEATS · 🔴 DO NOT START YET.

| Parcours | Jours | Domaine dominant | Pratique code réelle ? | Sauts conceptuels | Durée crédible ? | Verdict |
|---|---|---|---|---|---|---|
| fullstack-typescript | 119 | JS/TS/React/API/SQL | **OUI** (cœur jsts/http/sql) | peu | oui (~4 mois) | 🟢 |
| frontend-engineer-v1 | 54 | JS/React/CSS/a11y | **OUI** | peu | oui | 🟢 |
| backend-engineer-v1 | 85 | HTTP/API/SQL/testing/archi | **OUI** (archi SIMULÉ) | modérés (archi) | oui | 🟢 |
| systems-cloud-foundations-v1 | 31 | Linux/Docker/cloud | partielle (git/linux réels, cloud SIMULÉ) | modérés | oui | 🟠 |
| appsec-cloud-security-v1 | 15 | sécurité/cloud | **NON** (SIMULÉ + labs) | importants | court (15 j) | 🟠 |
| cloud-devops-engineer-v1 | 29 | cloud/docker/k8s/CI | **NON** (SIMULÉ + labs) | importants | serré | 🟠 |
| data-ml-v1 | 188 | Python/ML/stats | partielle (python réel ; ML **NON**) | importants | long (~7 mois) | 🟠 |
| ai-engineer-foundations-v1 | 365 | tout (IA finale) | partielle (fondations réelles ; IA **NON**) | importants en 2e moitié | oui (12 mois) | 🟠 |
| ai-fullstack-v1 (annoncé) | 0 | — | — | — | — | 🔴 non disponible |

## Détail par question (transversal)

1. **Niveau d'entrée réel** : les parcours JS/TS commencent débutant (L1 fondations présentes) ; les
   parcours cloud/sécurité/data supposent implicitement des fondations non rappelées (voir Q3).
2. **Prérequis implicites** : le graphe signale **47 `concept-without-foundation`** — des leçons
   construisant une compétence sans leçon-fondation ordonnée avant. À instruire (REORDER potentiel).
3. **Sauts conceptuels** : faibles en JS/TS ; réels en cloud/sécurité/IA (on passe de la théorie à des
   labs/assessments sans pratique de code intermédiaire — le geste manque).
4. **Cohérence des jours** : bonne au niveau structure (mois/semaines/jours, 52 révisions réparties) ;
   `detailed` non peuplé au niveau `program.days` (le détail est rendu via lessons-map/day-view — à
   confirmer côté UI, cf. V45-UX).
5. **Bonnes leçons au bon moment** : oui pour le tronc JS/TS ; pour l'IA, la théorie arrive mais la
   pratique correspondante n'existe pas.
6. **Concepts essentiels présents** : oui (couverture domaine large, cf. V45-PRACTICE CP4).
7. **Pratique au bon moment** : **NON** pour data/ML/IA/cloud/sécurité — c'est le trou central.
8. **Apprendre sans programme externe** : oui pour JS/TS (théorie+pratique complètes) ; partiellement
   pour l'IA (théorie oui, pratique à chercher ailleurs).
9. **Progression vers usage pro** : réelle en JS/TS (capstones + missions + playbooks) ; SIMULÉE pour
   les autres.
10. **Durée annoncée crédible** : globalement oui ; `appsec-cloud-security-v1` (15 j) et
    `cloud-devops-engineer-v1` (29 j) semblent SERRÉS vu l'ampleur des domaines.

## Verdicts par parcours

- **fullstack-typescript / frontend-engineer / backend-engineer** : **BON→FORT**. Théorie + pratique de
  code + évaluation + capstone réellement bouclées. 🟢 Apprenables aujourd'hui.
- **systems-cloud-foundations** : **CORRECT**. Git/Linux/terminal réels ; cloud/docker SIMULÉS. 🟠
- **appsec-cloud-security / cloud-devops-engineer** : **CORRECT en théorie/raisonnement, FRAGILE en
  pratique** (aucune pratique de code, durée serrée). 🟠 Utiles pour comprendre/raisonner, pas pour
  « faire ».
- **data-ml-v1** : **CORRECT**. Python réel + stats/ML théoriques FORTS ; **aucune pratique ML
  exécutable**. 🟠 On apprend à raisonner le ML, pas à l'implémenter ici.
- **ai-engineer-foundations-v1 (parcours phare, 365 j)** : **BON sur la 1re moitié (fondations
  exécutables), FRAGILE sur la 2e moitié (IA sans pratique de code)**. 🟠 La colonne vertébrale est là ;
  la professionnalisation IA est SIMULÉE.

## Constat central du CP5
Le programme consacre **~42 % de l'année à l'IA/ML/RAG/agents** (154 jours) mais ces domaines n'ont
**aucune pratique de code exécutable**. Il y a un **désalignement entre l'ambition du parcours (IA
Engineer) et la pratique réellement outillée (JS/TS)**. Ce n'est pas un défaut de prose ni de structure
— c'est un trou de PRATIQUE, cohérent avec la limite de taxonomie identifiée en V44.
