import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMonthHtml } from '@/lib/program';

export const dynamic = 'force-dynamic';

export default async function MonthPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const month = Number(id);
  if (!Number.isInteger(month) || month < 1 || month > 12) notFound();
  const html = getMonthHtml(month);
  if (!html) notFound();

  return (
    <>
      <nav className="doc-toolbar" aria-label="Navigation des mois">
        <div className="subnav" style={{ margin: 0 }}>
          {month > 1 && <Link href={`/month/${month - 1}`}>← Mois {month - 1}</Link>}
          {month < 12 && <Link href={`/month/${month + 1}`}>Mois {month + 1} →</Link>}
        </div>
        <div className="subnav" style={{ margin: 0 }}><Link href="/calendar">Calendrier</Link></div>
      </nav>
      <article className="prose reading" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
