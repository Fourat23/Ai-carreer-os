import type { ReactNode } from 'react';

// Avis contextuel (jamais couleur seule : porte un libellé de ton + le contenu).
export function InlineNotice({
  tone = 'info', title, children,
}: { tone?: 'info' | 'attention' | 'blocking' | 'positive'; title?: ReactNode; children: ReactNode }) {
  const roleLabel = { info: 'Info', attention: 'Attention', blocking: 'Bloquant', positive: 'OK' }[tone];
  return (
    <div className={`ui-notice tone-${tone}`} role="note">
      <span className="ui-notice-tag">{roleLabel}</span>
      <div className="ui-notice-body">
        {title && <p className="ui-notice-title">{title}</p>}
        <div className="ui-notice-text">{children}</div>
      </div>
    </div>
  );
}
