'use client';
// Catalogue des pipelines pédagogiques : filtre par trigger + recherche, URL
// partageable (querystring). Lecture seule, aucune donnée sensible.
import { useMemo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Workflow, GitPullRequest, PlayCircle, ShieldCheck } from 'lucide-react';

interface Summary {
  id: string; title: string; description: string; trigger: string[];
  jobCount: number; stageCount: number; skills: string[]; requiresApproval: boolean;
}
const TRIGGER_LABEL: Record<string, string> = { push: 'push', pull_request: 'pull request', tag: 'tag', manual: 'manuel', schedule: 'planifié' };

export default function PipelineCatalogue({ pipelines }: { pipelines: Summary[] }) {
  const [q, setQ] = useState('');
  const [trigger, setTrigger] = useState('');

  // URL partageable (sans polluer la progression).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQ(p.get('q') ?? ''); setTrigger(p.get('trigger') ?? '');
  }, []);
  const sync = useCallback((nq: string, nt: string) => {
    const p = new URLSearchParams();
    if (nq) p.set('q', nq); if (nt) p.set('trigger', nt);
    const s = p.toString();
    window.history.replaceState(null, '', s ? `?${s}` : window.location.pathname);
  }, []);

  const triggers = useMemo(() => [...new Set(pipelines.flatMap((p) => p.trigger))].sort(), [pipelines]);
  const shown = useMemo(() => pipelines.filter((p) => {
    if (trigger && !p.trigger.includes(trigger)) return false;
    if (q && !(`${p.title} ${p.description} ${p.skills.join(' ')}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  }), [pipelines, q, trigger]);

  return (
    <div>
      <div className="pl-filters" role="search">
        <input
          className="pl-search" type="search" placeholder="Rechercher un pipeline…" aria-label="Rechercher un pipeline"
          value={q} onChange={(e) => { setQ(e.target.value); sync(e.target.value, trigger); }}
        />
        <label className="wb-field">
          <span className="section-label">Trigger</span>
          <select value={trigger} onChange={(e) => { setTrigger(e.target.value); sync(q, e.target.value); }}>
            <option value="">tous</option>
            {triggers.map((t) => <option key={t} value={t}>{TRIGGER_LABEL[t] ?? t}</option>)}
          </select>
        </label>
        <span className="muted pl-count">{shown.length} / {pipelines.length}</span>
      </div>
      <ul className="pl-cards">
        {shown.map((p) => (
          <li key={p.id} className="pl-card">
            <Link href={`/pipelines/${p.id}`} className="pl-card-link">
              <span className="pl-card-ico"><Workflow size={18} strokeWidth={1.75} /></span>
              <span className="pl-card-body">
                <span className="pl-card-title">{p.title}</span>
                <span className="pl-card-desc">{p.description}</span>
                <span className="pl-card-meta">
                  {p.trigger.map((t) => <span key={t} className="wb-badge"><GitPullRequest size={11} /> {TRIGGER_LABEL[t] ?? t}</span>)}
                  <span className="wb-badge"><PlayCircle size={11} /> {p.stageCount} stages · {p.jobCount} jobs</span>
                  {p.requiresApproval && <span className="wb-badge"><ShieldCheck size={11} /> approbation</span>}
                </span>
              </span>
            </Link>
          </li>
        ))}
        {shown.length === 0 && <li className="muted">Aucun pipeline ne correspond.</li>}
      </ul>
    </div>
  );
}
