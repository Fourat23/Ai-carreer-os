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
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="row">
          {month > 1 && <Link className="btn small" href={`/month/${month - 1}`}>← Mois {month - 1}</Link>}
          {month < 12 && <Link className="btn small" href={`/month/${month + 1}`}>Mois {month + 1} →</Link>}
        </div>
        <Link className="btn small" href="/calendar">Calendrier</Link>
      </div>
      <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
