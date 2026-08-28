// AUTO-LIAISON DU GLOSSAIRE — V66 · CP13. Module PUR : HTML en entrée, HTML en
// sortie, aucune I/O.
//
// ── LE DÉFAUT QU'IL FERME ────────────────────────────────────────────────
//
// Mesure du CP0 : le corpus contient un glossaire de **711 entrées** de bonne
// facture — définition courte, définition détaillée, traduction en langage
// simple, confusions courantes. Et :
//
//     grep -rl "/glossary" curriculum/lessons/   →   0 fichier
//
// Zéro. Le vocabulaire est défini, et jamais atteignable à l'endroit où
// l'apprenant le rencontre. `rappel@k`, `golden set`, `reranking`, `p95`,
// `pull request` sont tous définis, et tous invisibles au point de blocage.
// C'est un défaut de PRODUIT, pas de corpus : il se corrige sans réécrire une
// ligne de cours.
//
// ── CE QUE CE MODULE NE FAIT PAS, ET POURQUOI ────────────────────────────
//
// Il ne lie que la PREMIÈRE occurrence de chaque terme dans une page. Lier
// toutes les occurrences transformerait un cours en champ de mines bleu, et la
// densité de liens détruit la lecture bien plus sûrement qu'un mot non défini.
//
// Il ne touche jamais : le code (`<code>`, `<pre>`), les titres, ni un texte
// déjà à l'intérieur d'un lien. Un cours n'est pas un article encyclopédique.
//
// Il refuse les termes courts (moins de 4 caractères) et les mots français
// ordinaires que le glossaire contient aussi. « API » ou « CI » liés à chaque
// page n'apprennent rien à personne ; c'est le terme opaque qu'on cherche.

/** Termes trop courts ou trop courants pour qu'une liaison rende service. */
const MIN_LEN = 4;

/**
 * Mots que le glossaire définit et qu'il ne faut PAS lier : ils sont soit
 * évidents en contexte, soit si fréquents que la page deviendrait illisible.
 * Liste courte et assumée — ce n'est pas une censure, c'est du dosage.
 */
const NE_PAS_LIER = new Set([
  'test', 'tests', 'code', 'data', 'type', 'types', 'branche', 'commit',
  'build', 'image', 'index', 'note', 'page', 'port', 'sortie', 'source',
]);

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Construit l'index de liaison depuis les entrées du glossaire.
 * Un terme peut être atteint par son nom, sa forme longue ou un alias.
 *
 * @param {Array<{id:string, term:string, fullForm?:string|null, aliases?:string[]}>} entries
 * @returns {Array<{re: RegExp, id: string, label: string}>} trié du plus long au plus court
 */
export function buildLinkIndex(entries) {
  const seen = new Set();
  const out = [];
  for (const e of Array.isArray(entries) ? entries : []) {
    if (!e || typeof e.id !== 'string') continue;
    const formes = [e.term, e.fullForm, ...(Array.isArray(e.aliases) ? e.aliases : [])];
    for (const forme of formes) {
      if (typeof forme !== 'string') continue;
      const f = forme.trim();
      if (f.length < MIN_LEN) continue;
      if (NE_PAS_LIER.has(f.toLowerCase())) continue;
      const cle = f.toLowerCase();
      if (seen.has(cle)) continue; // premier venu, premier servi : pas d'ambiguïté
      seen.add(cle);
      // Bornes conscientes des accents et des traits d'union — la leçon du
      // faux positif FP-1 du CP0 : `\b` casse sur É, È, Ê et découpe les mots.
      const L = 'A-Za-zÀ-ÖØ-öø-ÿ0-9';
      out.push({
        re: new RegExp(`(?<![${L}@-])(${escapeRe(f)})(?![${L}@-])`, 'i'),
        id: e.id,
        label: f,
      });
    }
  }
  // Du plus long au plus court : « base vectorielle » doit gagner sur « base ».
  out.sort((a, b) => b.label.length - a.label.length);
  return out;
}

/** Balises dont le CONTENU ne doit jamais être lié. */
const ZONES_INTERDITES = /^(code|pre|a|h1|h2|h3|h4|h5|h6)$/i;

/**
 * Lie la première occurrence de chaque terme dans un fragment HTML.
 *
 * Le parcours se fait par découpage sur les balises : on n'analyse jamais un
 * attribut, jamais un nom de balise, uniquement du texte. C'est ce qui rend
 * l'opération sûre sans dépendre d'un analyseur HTML complet.
 *
 * @param {string} html
 * @param {ReturnType<typeof buildLinkIndex>} index
 * @param {{ max?: number, href?: (id: string) => string }} [opts]
 */
export function autolinkGlossary(html, index, opts = {}) {
  if (typeof html !== 'string' || !html || !Array.isArray(index) || index.length === 0) return html;
  const max = Number.isInteger(opts.max) ? opts.max : 40;
  const href = typeof opts.href === 'function' ? opts.href : (id) => `/glossary?terme=${encodeURIComponent(id)}`;

  const dejaLies = new Set();
  let poses = 0;

  // Découpage en jetons : balises et texte, en alternance.
  const jetons = html.split(/(<[^>]+>)/);
  const pile = [];

  for (let i = 0; i < jetons.length; i++) {
    const t = jetons[i];
    if (!t) continue;

    if (t[0] === '<') {
      const fermante = t[1] === '/';
      const nom = t.replace(/^<\/?\s*/, '').split(/[\s>/]/)[0];
      const autoFermante = /\/>$/.test(t) || /^(br|img|hr|input|meta|link)$/i.test(nom);
      if (!autoFermante) {
        if (fermante) { if (pile[pile.length - 1] === nom.toLowerCase()) pile.pop(); }
        else pile.push(nom.toLowerCase());
      }
      continue;
    }

    if (poses >= max) continue;
    if (pile.some((n) => ZONES_INTERDITES.test(n))) continue;

    // On repère TOUTES les positions sur le texte d'origine, puis on écrit en
    // une seule passe.
    //
    // Le premier jet insérait au fil de l'eau, en re-balayant le texte déjà
    // modifié. Résultat sur « une base vectorielle » : le lien long était posé,
    // puis le terme court « base » retrouvait sa correspondance À L'INTÉRIEUR
    // du lien qu'on venait d'écrire, et produisait un `<a>` imbriqué dans un
    // `<a>` — du HTML invalide, que le navigateur défait n'importe comment.
    // Trouvé par le test « le terme le plus long gagne », pas par relecture.
    const trouvailles = [];
    for (const entree of index) {
      if (dejaLies.has(entree.id)) continue;
      const m = entree.re.exec(t);
      if (!m) continue;
      trouvailles.push({ debut: m.index, fin: m.index + m[1].length, texte: m[1], entree });
    }
    // L'index est trié du plus long au plus court : à chevauchement, le premier
    // arrivé — donc le plus long — gagne, et le plus court est simplement écarté.
    // Tri par position, puis par longueur DÉCROISSANTE : à position égale, le
    // terme le plus long doit être examiné en premier, sinon « base » gagnerait
    // sur « base vectorielle » selon l'ordre d'itération. On ne s'en remet pas
    // à la stabilité du tri pour un invariant.
    trouvailles.sort((a, b) => (a.debut - b.debut) || ((b.fin - b.debut) - (a.fin - a.debut)));
    const retenues = [];
    let finPrecedente = -1;
    for (const c of trouvailles) {
      if (c.debut < finPrecedente) continue; // chevauche une trouvaille déjà retenue
      if (poses + retenues.length >= max) break;
      retenues.push(c);
      finPrecedente = c.fin;
    }

    let sortie = '';
    let curseur = 0;
    for (const c of retenues) {
      sortie += t.slice(curseur, c.debut);
      sortie += `<a class="gloss-link" href="${href(c.entree.id)}" title="Voir la définition">${c.texte}</a>`;
      curseur = c.fin;
      dejaLies.add(c.entree.id);
      poses += 1;
    }
    sortie += t.slice(curseur);
    jetons[i] = sortie;
  }

  return jetons.join('');
}
