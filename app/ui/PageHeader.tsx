import type { ReactNode } from 'react';

// En-tête de page unifié : eyebrow (contexte) + titre + sous-titre + actions.
// Purement présentationnel ; adopté par les surfaces pilotes.
export function PageHeader({
  eyebrow, title, sub, actions,
}: { eyebrow?: ReactNode; title: ReactNode; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="page-head ui-page-head">
      <div className="page-head-main">
        {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
        <h1 className="page-title">{title}</h1>
        {sub && <p className="page-sub">{sub}</p>}
      </div>
      {actions && <div className="ui-page-actions">{actions}</div>}
    </header>
  );
}
