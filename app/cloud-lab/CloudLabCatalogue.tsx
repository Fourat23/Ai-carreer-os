'use client';
// Catalogue des topologies : filtre par environnement + recherche, URL
// partageable (querystring). Lecture seule, aucune donnée sensible.
import { useMemo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Network, Server, Layers } from 'lucide-react';

interface Summary {
  id: string; title: string; description: string;
  nodeCount: number; edgeCount: number; environments: string[]; skills: string[];
}
const ENV_LABEL: Record<string, string> = {
  development: 'dev', testing: 'test', staging: 'staging', preproduction: 'pré-prod', production: 'prod',
};

export default function CloudLabCatalogue({ topologies }: { topologies: Summary[] }) {
  const [q, setQ] = useState('');
  const [env, setEnv] = useState('');

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQ(p.get('q') ?? ''); setEnv(p.get('env') ?? '');
  }, []);
  const sync = useCallback((nq: string, ne: string) => {
    const p = new URLSearchParams();
    if (nq) p.set('q', nq); if (ne) p.set('env', ne);
    const s = p.toString();
    window.history.replaceState(null, '', s ? `?${s}` : window.location.pathname);
  }, []);

  const envs = useMemo(() => [...new Set(topologies.flatMap((t) => t.environments))].sort(), [topologies]);
  const shown = useMemo(() => topologies.filter((t) => {
    if (env && !t.environments.includes(env)) return false;
    if (q && !(`${t.title} ${t.description} ${t.skills.join(' ')}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  }), [topologies, q, env]);

  return (
    <div>
      <div className="pl-filters" role="search">
        <input
          className="pl-search" type="search" placeholder="Rechercher une topologie…" aria-label="Rechercher une topologie"
          value={q} onChange={(e) => { setQ(e.target.value); sync(e.target.value, env); }}
        />
        <label className="wb-field">
          <span className="section-label">Environnement</span>
          <select value={env} onChange={(e) => { setEnv(e.target.value); sync(q, e.target.value); }}>
            <option value="">tous</option>
            {envs.map((e) => <option key={e} value={e}>{ENV_LABEL[e] ?? e}</option>)}
          </select>
        </label>
        <span className="muted pl-count">{shown.length} / {topologies.length}</span>
      </div>
      <ul className="pl-cards">
        {shown.map((t) => (
          <li key={t.id} className="pl-card">
            <Link href={`/cloud-lab/${t.id}`} className="pl-card-link">
              <span className="pl-card-ico"><Network size={18} strokeWidth={1.75} /></span>
              <span className="pl-card-body">
                <span className="pl-card-title">{t.title}</span>
                <span className="pl-card-desc">{t.description}</span>
                <span className="pl-card-meta">
                  <span className="wb-badge"><Server size={11} /> {t.nodeCount} composants</span>
                  <span className="wb-badge"><Layers size={11} /> {t.edgeCount} flux</span>
                  {t.environments.map((e) => <span key={e} className="wb-badge">{ENV_LABEL[e] ?? e}</span>)}
                </span>
              </span>
            </Link>
          </li>
        ))}
        {shown.length === 0 && <li className="muted">Aucune topologie ne correspond.</li>}
      </ul>
    </div>
  );
}
