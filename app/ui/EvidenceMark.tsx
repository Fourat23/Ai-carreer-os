// V56 — MOTIF PROPRIÉTAIRE : marque de preuve.
//
// Raison informationnelle : le produit distingue huit natures de preuve
// (exercice, diagnostic, capstone, mission, projet, dépôt, démo, note). Avant
// V56, elles n'étaient différenciées que par un mot — donc illisibles en
// balayage, et indistinctes dans une frise ou une file.
//
// Ce n'est PAS un badge de collection : le glyphe est DÉTERMINÉ par le type,
// jamais par une quantité, une rareté ou un mérite. Il ne se gagne pas, il
// nomme. Le libellé textuel reste toujours affiché à côté : la marque
// n'est jamais le seul porteur de l'information (règle « jamais la couleur
// seule », étendue à « jamais la forme seule »).
//
// Réutilisé sur : /day/[id] (preuves du jour), /synthese (frise de preuves),
// /projects, /missions.

/** Géométrie par type — stable, dérivée du sens, jamais aléatoire. */
const SHAPES: Record<string, { d: string; label: string }> = {
  // Exercice : une cible carrée — un objectif borné, vérifiable.
  exercise: { d: 'M3 3h10v10H3z M6 6h4v4H6z', label: 'Exercice' },
  // Diagnostic : une lame de mesure — on sonde, on ne produit pas.
  assessment: { d: 'M8 2v12 M4 5v6 M12 5v6', label: 'Diagnostic' },
  // Capstone : un empilement — plusieurs compétences superposées.
  capstone: { d: 'M8 2l6 3-6 3-6-3z M2 8l6 3 6-3 M2 11l6 3 6-3', label: 'Capstone' },
  // Mission : un cap — une trajectoire dirigée vers une cible.
  mission: { d: 'M8 14V4 M8 4l6 2-6 2', label: 'Mission' },
  // Projet : un cadre assemblé — un livrable composé de pièces.
  project: { d: 'M2 4h5v5H2z M9 7h5v5H9z M7 6h2v2H7z', label: 'Projet' },
  // Dépôt : une pile de révisions.
  repo: { d: 'M3 4h10 M3 8h10 M3 12h10 M5 2v12', label: 'Dépôt' },
  // Démo : un signal émis.
  demo: { d: 'M4 8h3l4-4v8l-4-4H4z', label: 'Démo' },
  // Note : une ligne écrite.
  note: { d: 'M4 3h8v10H4z M6 6h4 M6 9h3', label: 'Note' },
  other: { d: 'M8 2l6 6-6 6-6-6z', label: 'Autre' },
};

export function EvidenceMark({
  type, size = 16, withLabel = false,
}: { type: string; size?: number; withLabel?: boolean }) {
  const s = SHAPES[type] ?? SHAPES.other;
  const mark = (
    <svg className={`evi-mark evi-${type}`} width={size} height={size} viewBox="0 0 16 16"
      fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      role={withLabel ? 'presentation' : 'img'}
      aria-hidden={withLabel || undefined}
      aria-label={withLabel ? undefined : s.label}>
      <path d={s.d} />
    </svg>
  );
  if (!withLabel) return mark;
  return (
    <span className={`evi-tag evi-${type}`}>
      {mark}
      <span className="evi-tag-label">{s.label}</span>
    </span>
  );
}

/** Libellé FR canonique d'un type de preuve (source unique pour l'UI). */
export function evidenceLabel(type: string): string {
  return (SHAPES[type] ?? SHAPES.other).label;
}
