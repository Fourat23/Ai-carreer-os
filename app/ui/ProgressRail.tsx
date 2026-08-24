import type { ReactNode } from 'react';

// Bandeau de progression : pourcentage proéminent + contexte + barre.
// Extrait en V54.2 car le motif est partagé par ≥ 2 surfaces (socle du Dashboard
// et avancement du Parcours actif). Présentation pure : reçoit un pourcentage
// DÉJÀ calculé par un read-model, n'en dérive aucun.
export function ProgressRail({
  percent, sub, align = 'left',
}: { percent: number; sub?: ReactNode; align?: 'left' | 'right' }) {
  const pct = Number.isFinite(percent) ? Math.max(0, Math.min(100, Math.round(percent))) : 0;
  return (
    <div className={`ui-prail align-${align}`}>
      <div className="ui-prail-nums">
        <span className="ui-prail-pct">{pct}%</span>
        {sub && <span className="ui-prail-sub">{sub}</span>}
      </div>
      <div className="progressbar ui-prail-bar"><div style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
