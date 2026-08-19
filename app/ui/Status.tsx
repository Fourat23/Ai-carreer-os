import type { ReactNode } from 'react';

// Ton sémantique produit — jamais porté par la couleur seule : chaque Status
// affiche TOUJOURS un libellé + un point. Les tons proviennent du vocabulaire
// V52 (lib/skill-vocabulary.mjs) ; ce composant ne calcule aucun état.
export type Tone = 'neutral' | 'info' | 'positive' | 'attention' | 'blocking' | 'accent';

export function Status({ tone = 'neutral', label, icon }: { tone?: Tone; label: ReactNode; icon?: ReactNode }) {
  return (
    <span className={`ui-status tone-${tone}`}>
      {icon ? <span className="ui-status-icon" aria-hidden>{icon}</span> : <span className="ui-status-dot" aria-hidden />}
      <span className="ui-status-label">{label}</span>
    </span>
  );
}
