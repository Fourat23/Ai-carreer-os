// V58 · CP3 — Extraction des sections d'un document rendu. PURE (chaîne →
// chaîne + tableau), donc côté serveur : la coquille éditoriale est un
// composant client (elle observe la position de lecture), mais l'extraction
// n'a aucune raison de l'être, et Next l'interdit à juste titre.
//
// Ne modifie jamais le contenu : on ne fait que poser un `id` stable sur les
// titres qui n'en ont pas, pour que le sommaire puisse y pointer.
export function extractSections(html) {
  const sections = [];
  const used = new Set();
  const out = String(html ?? '').replace(/<(h2|h3)\b([^>]*)>([\s\S]*?)<\/\1>/g, (m, tag, attrs, inner) => {
    const text = String(inner).replace(/<[^>]+>/g, '').trim();
    if (!text) return m;
    let id = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'section';
    let n = 2;
    while (used.has(id)) id = `${id}-${n++}`;
    used.add(id);
    sections.push({ id, label: text, level: tag === 'h2' ? 2 : 3 });
    return /\bid="/.test(attrs) ? m : `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
  });
  return { html: out, sections };
}
