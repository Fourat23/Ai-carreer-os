'use client';
// Catalogue des architectures cloud : filtre par fournisseur + recherche, URL
// partageable. Lecture seule, aucune donnée sensible.
import { useMemo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Cloud, Layers } from 'lucide-react';

interface Summary {
  id: string; title: string; description: string; provider: string; region: string;
  resourceCount: number; need: string | null; skills: string[];
}
const PROVIDER_LABEL: Record<string, string> = { aws: 'AWS', azure: 'Azure', generic: 'Générique' };

export default function CloudCatalogue({ architectures }: { architectures: Summary[] }) {
  const [q, setQ] = useState('');
  const [provider, setProvider] = useState('');

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQ(p.get('q') ?? ''); setProvider(p.get('provider') ?? '');
  }, []);
  const sync = useCallback((nq: string, np: string) => {
    const p = new URLSearchParams();
    if (nq) p.set('q', nq); if (np) p.set('provider', np);
    const s = p.toString();
    window.history.replaceState(null, '', s ? `?${s}` : window.location.pathname);
  }, []);

  const providers = useMemo(() => [...new Set(architectures.map((a) => a.provider))].sort(), [architectures]);
  const shown = useMemo(() => architectures.filter((a) => {
    if (provider && a.provider !== provider) return false;
    if (q && !(`${a.title} ${a.description} ${a.need ?? ''} ${a.skills.join(' ')}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  }), [architectures, q, provider]);

  return (
    <div>
      <div className="pl-filters" role="search">
        <input
          className="pl-search" type="search" placeholder="Rechercher une architecture…" aria-label="Rechercher une architecture"
          value={q} onChange={(e) => { setQ(e.target.value); sync(e.target.value, provider); }}
        />
        <label className="wb-field">
          <span className="section-label">Fournisseur</span>
          <select value={provider} onChange={(e) => { setProvider(e.target.value); sync(q, e.target.value); }}>
            <option value="">tous</option>
            {providers.map((p) => <option key={p} value={p}>{PROVIDER_LABEL[p] ?? p}</option>)}
          </select>
        </label>
        <span className="muted pl-count">{shown.length} / {architectures.length}</span>
      </div>
      <ul className="pl-cards">
        {shown.map((a) => (
          <li key={a.id} className="pl-card">
            <Link href={`/cloud-foundations/${a.id}`} className="pl-card-link">
              <span className="pl-card-ico"><Cloud size={18} strokeWidth={1.75} /></span>
              <span className="pl-card-body">
                <span className="pl-card-title">{a.title}</span>
                <span className="pl-card-desc">{a.description}</span>
                <span className="pl-card-meta">
                  <span className="wb-badge">{PROVIDER_LABEL[a.provider] ?? a.provider}</span>
                  <span className="wb-badge">{a.region}</span>
                  <span className="wb-badge"><Layers size={11} /> {a.resourceCount} ressources</span>
                </span>
              </span>
            </Link>
          </li>
        ))}
        {shown.length === 0 && <li className="muted">Aucune architecture ne correspond.</li>}
      </ul>
    </div>
  );
}
