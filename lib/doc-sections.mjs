// V58 · CP3 — Extraction des sections d'un document rendu. PURE (chaîne →
// chaîne + tableau), donc côté serveur : la coquille éditoriale est un
// composant client (elle observe la position de lecture), mais l'extraction
// n'a aucune raison de l'être, et Next l'interdit à juste titre.
//
// Ne modifie jamais le contenu : on ne fait que poser un `id` stable sur les
// titres qui n'en ont pas, pour que le sommaire puisse y pointer.
//
// V59 · CP2 — DEUX CORRECTIONS.
//
// 1. Les entités HTML n'étaient pas décodées. Le titre « Le README d'un
//    projet » arrivait dans le sommaire sous la forme littérale
//    « Le README d&#39;un projet », parce que le texte était extrait par
//    expression régulière puis ré-échappé par React. Défaut visible à
//    l'écran, relevé sur capture au CP0.
//    Effet de bord du même défaut : les chiffres de l'entité fuyaient dans
//    l'identifiant d'ancre (`le-readme-d-39-un-projet`).
//
// 2. `items` compte les éléments de liste réellement contenus par la section.
//    C'est une donnée DÉRIVÉE du document, jamais déclarée : elle sert aux
//    documents qui sont en réalité des catalogues par domaine (/resources),
//    et vaut 0 pour les documents de prose continue (/career).

/** Entités réellement produites par le rendu Markdown du corpus. */
const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  laquo: '«', raquo: '»', hellip: '…', mdash: '—', ndash: '–',
  rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”',
};

/** Décode les entités numériques et le sous-ensemble nommé ci-dessus. */
export function decodeEntities(s) {
  return String(s ?? '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m);
}

export function extractSections(html) {
  const raw = String(html ?? '');
  const sections = [];
  const used = new Set();
  // Positions des titres dans la chaîne d'origine : elles servent à compter
  // les éléments de liste appartenant réellement à chaque section.
  const marks = [];

  const out = raw.replace(/<(h2|h3)\b([^>]*)>([\s\S]*?)<\/\1>/g, (m, tag, attrs, inner, offset) => {
    // Le texte est décodé AVANT toute utilisation : il sert et d'étiquette
    // affichée, et de base pour l'identifiant.
    const text = decodeEntities(String(inner).replace(/<[^>]+>/g, '')).trim();
    if (!text) return m;
    let id = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'section';
    let n = 2;
    while (used.has(id)) id = `${id}-${n++}`;
    used.add(id);
    sections.push({ id, label: text, level: tag === 'h2' ? 2 : 3, items: 0 });
    marks.push(offset + m.length);
    return /\bid="/.test(attrs) ? m : `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
  });

  // Comptage des `<li>` entre un titre et le suivant, sur la chaîne d'origine.
  for (let i = 0; i < sections.length; i++) {
    const from = marks[i];
    const to = i + 1 < marks.length ? raw.lastIndexOf('<h', marks[i + 1]) : raw.length;
    if (to > from) sections[i].items = (raw.slice(from, to).match(/<li\b/g) ?? []).length;
  }

  return { html: out, sections };
}
