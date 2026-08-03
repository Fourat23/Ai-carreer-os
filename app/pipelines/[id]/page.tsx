import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getPipeline, publicPipeline } from '@/lib/pipelines-server';
import PipelineRunner from './PipelineRunner';

export const dynamic = 'force-dynamic';

export default async function PipelineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pipeline = getPipeline(id);
  if (!pipeline) notFound();
  const view = publicPipeline(pipeline);
  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <p className="page-eyebrow"><Link href="/pipelines"><ChevronLeft size={12} /> Pipeline Lab</Link></p>
          <h1 className="page-title">{(view as { title: string }).title}</h1>
          <p className="page-sub">{(view as { description: string }).description}</p>
        </div>
      </div>
      <PipelineRunner pipeline={view} />
    </div>
  );
}
