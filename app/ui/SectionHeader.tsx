import type { ReactNode } from 'react';

// En-tête de section : label (eyebrow) + titre + note alignée à droite.
export function SectionHeader({
  label, title, note,
}: { label: ReactNode; title?: ReactNode; note?: ReactNode }) {
  return (
    <div className="section-head">
      <span className="section-label">{label}</span>
      {title && <h2 className="section-title">{title}</h2>}
      {note && <span className="section-note">{note}</span>}
    </div>
  );
}
