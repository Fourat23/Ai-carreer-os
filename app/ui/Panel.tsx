import type { ReactNode } from 'react';

// Surface calme titrée pour le rail/latéral. `emphasis` = panneau primaire
// (action attendue) ; par défaut secondaire, sobre.
export function Panel({
  label, children, emphasis = false, footer,
}: { label?: ReactNode; children: ReactNode; emphasis?: boolean; footer?: ReactNode }) {
  return (
    <section className={`ui-panel${emphasis ? ' is-emphasis' : ''}`}>
      {label && <div className="ui-panel-label">{label}</div>}
      <div className="ui-panel-body">{children}</div>
      {footer && <div className="ui-panel-footer">{footer}</div>}
    </section>
  );
}
