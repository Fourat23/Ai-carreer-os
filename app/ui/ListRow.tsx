import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

// Ligne de liste dense et professionnelle (missions, révisions, parcours) :
// titre + description + méta + statut + flèche. Lien optionnel (toute la ligne).
// Présentation pure ; `accent` = barre gauche colorée par ton (jamais couleur seule).
export function ListRow({
  href, title, desc, meta, status, tone, onlyMeta,
}: {
  href?: string;
  title: ReactNode;
  desc?: ReactNode;
  meta?: ReactNode;
  status?: ReactNode;
  tone?: 'neutral' | 'info' | 'positive' | 'attention' | 'blocking' | 'accent';
  onlyMeta?: boolean;
}) {
  const inner = (
    <>
      <div className="ui-row-main">
        <div className="ui-row-title">{title}</div>
        {desc && <div className="ui-row-desc">{desc}</div>}
        {meta && <div className="ui-row-meta">{meta}</div>}
      </div>
      {status && <div className="ui-row-status">{status}</div>}
      {href && <ChevronRight size={16} className="ui-row-go" aria-hidden />}
    </>
  );
  const cls = `ui-row${tone ? ` tone-${tone}` : ''}${onlyMeta ? ' is-flat' : ''}`;
  return href
    ? <Link href={href} className={cls}>{inner}</Link>
    : <div className={cls}>{inner}</div>;
}
