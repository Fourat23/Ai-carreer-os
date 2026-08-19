import type { ReactNode } from 'react';

// Bloc « focus principal » du cockpit : surface haute (--raised), dominant
// visuellement. Réponse immédiate à « que faire maintenant / pourquoi ».
// Présentation pure — reçoit des données déjà dérivées.
export function PrimaryFocus({
  eyebrow, status, title, meta, reason, actions,
}: {
  eyebrow?: ReactNode;
  status?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  reason?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="ui-focus" aria-label="Focus principal">
      <div className="ui-focus-head">
        {eyebrow && <p className="ui-focus-eyebrow">{eyebrow}</p>}
        {status && <div className="ui-focus-status">{status}</div>}
      </div>
      <h2 className="ui-focus-title">{title}</h2>
      {meta && <div className="ui-focus-meta">{meta}</div>}
      {reason && <p className="ui-focus-reason">{reason}</p>}
      {actions && <div className="ui-focus-actions">{actions}</div>}
    </section>
  );
}
