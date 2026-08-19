import type { ReactNode } from 'react';
import type { Tone } from './Status';

// Métrique de pilotage : clé + valeur + sous-texte. Donnée réelle uniquement
// (aucune stat vanity, aucun score inventé). `emphasis` = valeur mise en avant.
// Le style de valeur ne réagit qu'aux tons positive/attention/accent.
export function Metric({
  label, value, sub, tone, emphasis = false,
}: {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  tone?: Tone;
  emphasis?: boolean;
}) {
  return (
    <div className={`ui-metric${emphasis ? ' is-emphasis' : ''}${tone ? ` tone-${tone}` : ''}`}>
      <div className="ui-metric-label">{label}</div>
      <div className="ui-metric-value">{value}</div>
      {sub && <div className="ui-metric-sub">{sub}</div>}
    </div>
  );
}
