// Enrichissements PAR JOUR (surtout jours 91-365). Fusionnés par le générateur.
// Chaque clé = un numéro de jour. Champs possibles (tous optionnels) :
//   theory     : théorie inline supplémentaire (Markdown) ajoutée au « Cours approfondi »
//   guided     : exemple guidé pas-à-pas (Markdown)
//   caseStudy  : cas métier spécifique (override du défaut par compétence)
//   interview  : vraie question d'entretien spécifique (override du défaut par compétence)
//   lessons    : slugs de leçons de fond spécifiques à lier (sinon LESSON_BY_SKILL)
//   takeaways  : liste « À retenir » spécifique
//
// Pour enrichir un jour : ajoute/complète son entrée puis `npm run generate`.
// Le prompt `prompts/enrich-day.md` génère le bon format.

export const DAYS_ENRICH = {
  // Exemplaires (montrent le format ; enrichissent des jours charnières).
  92: {
    guided: `**Énoncé** : afficher une liste de livres récupérée d'une API, avec les 3 états (chargement, erreur, données).

**Raisonnement** : un fetch a TOUJOURS trois états à rendre. On les modélise dans le state React et on affiche l'un des trois.

**Solution** :
\`\`\`tsx
const [state, setState] = useState<{status:'loading'|'error'|'ok'; data?: Livre[]}>({ status: 'loading' });
useEffect(() => {
  api.getLivres()
    .then((data) => setState({ status: 'ok', data }))
    .catch(() => setState({ status: 'error' }));
}, []);
if (state.status === 'loading') return <Spinner/>;
if (state.status === 'error') return <p>Erreur de chargement</p>;
return <ul>{state.data!.map((l) => <li key={l.id}>{l.titre}</li>)}</ul>;
\`\`\`

**Explication** : un seul state décrit la machine à états ; on ne peut jamais afficher « données » sans données. Le \`key\` est obligatoire sur une liste. **Variante** : ajoute un bouton « réessayer » qui remet le status à 'loading'.`,
  },
  211: {
    theory: `Un **token** n'est pas un mot : c'est un morceau de mot (~4 caractères). « anticonstitutionnellement » peut faire 8 tokens, « chat » un seul. Ça compte pour deux raisons pratiques : le COÛT (tu paies au token, entrée + sortie) et le CONTEXTE (la fenêtre est bornée en tokens). Compter les tokens de tes prompts n'est pas un détail : c'est ce qui décide si ton RAG injecte 5 ou 50 chunks, et combien coûtent 10 000 questions/jour.`,
    guided: `**Énoncé** : estimer le coût mensuel d'un assistant qui répond à 500 questions/jour, chaque réponse injectant ~4000 tokens de contexte et produisant ~300 tokens.

**Raisonnement** : coût = (tokens entrée × prix entrée + tokens sortie × prix sortie) × nb requêtes.

**Solution (ordre de grandeur)** :
\`\`\`
Par question : 4000 in + 300 out.
Par jour     : 500 × (4000 + 300) = 2,15 M tokens.
Par mois     : ~64 M tokens.
À ~3 $/M (entrée) et ~15 $/M (sortie) : entrée ~180 $, sortie ~2,7 $ → ~185 $/mois.
\`\`\`

**Explication** : l'ENTRÉE domine (le contexte RAG est gros), pas la sortie. Levier n°1 : réduire le contexte (meilleur retrieval, moins de chunks), pas raccourcir les réponses. **Variante** : recalcule avec un cache qui évite 40 % des appels.`,
  },
};
