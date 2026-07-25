import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWeekHtml } from '@/lib/program';

export const dynamic = 'force-dynamic';

export default async function WeekPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const week = Number(id);
  if (!Number.isInteger(week) || week < 1 || week > 52) notFound();
  const html = getWeekHtml(week);
  if (!html) notFound();

  return (
    <>
      <nav className="doc-toolbar" aria-label="Navigation des semaines">
        <div className="subnav" style={{ margin: 0 }}>
          {week > 1 && <Link href={`/week/${week - 1}`}>← Semaine {week - 1}</Link>}
          {week < 52 && <Link href={`/week/${week + 1}`}>Semaine {week + 1} →</Link>}
        </div>
        <div className="subnav" style={{ margin: 0 }}><Link href="/calendar">Calendrier</Link></div>
      </nav>
      <article className="prose reading" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
