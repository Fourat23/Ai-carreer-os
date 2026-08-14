import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getCapstone } from '@/lib/capstones-server';
import { getProgram } from '@/lib/program';
import CapstoneRunner from './CapstoneRunner';

export const dynamic = 'force-dynamic';

export default async function CapstonePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const capstone = getCapstone(id);
  if (!capstone) notFound();
  const program = getProgram();
  const skillNames = Object.fromEntries((program.skills ?? []).map((s: { id: string; name: string }) => [s.id, s.name]));

  return (
    <>
      <Link className="btn small ghost" href="/capstones" style={{ marginBottom: 'var(--sp-4)' }}>
        <ChevronLeft size={14} strokeWidth={2} /> Tous les capstones
      </Link>
      <CapstoneRunner capstone={capstone} skillNames={skillNames} />
    </>
  );
}
