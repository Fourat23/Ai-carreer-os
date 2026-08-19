# V51 — Certification pédagogique temporelle

Réponses factuelles, chiffrées, aux 10 questions de certification.

### 1. Puis-je commencer Jour 1 aujourd'hui sans craindre une future restructuration ?
**OUI.** Curriculum 1.0 VERROUILLÉ (`CURRICULUM-1.0-LOCK.md`) : ordre des 365 jours
immuable, corpus gelé (SHA-1 `4c1f3028…`), toute restructuration exige ADR + preuve.

### 2. Les fondamentaux sont-ils suffisamment réactivés ?
**OUI, désormais.** 15 réactivations espacées ajoutées (V51) sur jours de révision.
Jours de pratique en second semestre (d148+) : python 22, jsts 19, archi 15,
http 8, ds 7, algo 6, se 6, sql 4, gitlinux 4.

### 3. Existe-t-il encore des gaps > 90 jours ?
**NON pour les compétences de code** (mesuré sur la PRATIQUE) : 10 → **0**.
Résiduel assumé : compétences non-code (comm/autonomy) et enseignées en toute fin
(rag/evalia/agents/llm) dont l'écart de queue vers j365 est attendu.

### 4. Les D4/D5 apparaissent-ils au bon moment ?
**Globalement oui.** `isolated-d5` : 0. Montée D4/D5 saine (M6 pic de D4, M8 pic de
D5, M10-11 riches en diagnostic). Résiduel : 1 `difficulty-jump` info sur `ds`
(D3 « au j2 » = échauffement hérité, D4 réel au j203).

### 5. Les 189 exercices intégrés par V50 sont-ils pédagogiquement placés ?
**OUI.** 0 orphelin, 0 pratique-avant-introduction créée (base héritée = 10,
inchangée), placés sur des jours dont la compétence correspond et après
introduction. V51 n'a fait qu'ajouter 15 réactivations (réutilisation).

### 6. Existe-t-il des journées surchargées ?
**Aucune créée par V51.** Charge : 118 none · 216 light · 18 normal · 6 heavy ·
**7 excessive (héritées, thématiques docker/archi pré-V50)**. Plafond de 3 sur les
jours de révision respecté (`v51:check`).

### 7. Le second semestre conserve-t-il suffisamment de pratique ?
**OUI.** M6=28, M7=19, M8=13, M9=18, M10=24, M11=17 jours avec pratique. M12=5
(mois intégratif justifié).

### 8. Les compétences sont-elles utilisées en contexte professionnel ?
**OUI.** 13 scénarios/capstones placés après prérequis ; transferts T4/T5 espacés ;
labs cloud externes honnêtes. Chaque scénario mobilise plusieurs compétences.

### 9. Quels risques restent réels ?
- M12 léger en pratique de code (intentionnel, mais à surveiller).
- Compétences enseignées en fin (rag/evalia/agents) peu réactivées après leur
  fenêtre (peu de jours de révision tardifs disponibles).
- `ds` difficulty-jump hérité (artefact d'échauffement j2).
- Cloud reste EXTERNAL (par honnêteté).

### 10. Qu'est-ce qui est désormais gelé ?
Ordre des 365 jours, chaîne de prérequis, identité des 128 leçons, architecture
des parcours (`CURRICULUM-1.0-LOCK.md`). Additifs autorisés : pratique,
diagnostic, transfert, réactivation, corrections, UI.

## Chiffres clés
| Métrique | Avant V51 | Après V51 |
|----------|:--:|:--:|
| Anomalies de rétention (pratique, code) | 10 | **0** |
| Réactivations espacées | — | **+15** (réutilisation) |
| D5 isolé | 0 | 0 |
| Journées excessives créées | — | **0** |
| Orphelins | 0 | 0 |
| Mois GREEN / AMBER / RED | — | **11 / 1 / 0** |
| Tests | 1256 | **1261** |
| Gates | 35 | **36** |
