import Link from 'next/link';
import type { ReactNode } from 'react';

// Action recommandée : action (lien) → raison → but/preuve attendue.
// Alimentée par le read-model (nextBestActions) ; aucune logique ici.
export function ActionRow({
  href, action, reason, goal, kind,
}: { href: string; action: ReactNode; reason?: ReactNode; goal?: ReactNode; kind?: string }) {
  return (
    <li className={`ui-action${kind ? ` kind-${kind}` : ''}`}>
      <Link href={href} className="ui-action-link">{action}</Link>
      {reason && <span className="ui-action-reason">{reason}</span>}
      {goal && <span className="ui-action-goal">{goal}</span>}
    </li>
  );
}
