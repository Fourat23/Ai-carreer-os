'use client';

// Preuves de compétence de la journée : ajout (titre/type/lien/description) et
// suppression. La compétence de la journée est associée par défaut. Les liens
// sont neutralisés (safeUrl) et rien n'est jamais exécuté.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, ExternalLink } from 'lucide-react';
import type { DayProgress } from '@/lib/types';
import { addEvidence, removeEvidence, EVIDENCE_TYPES, type EvidenceType } from '@/lib/learning';

const TYPE_LABEL: Record<string, string> = {
  exercise: 'Exercice', repo: 'Dépôt Git', project: 'Projet', screenshot: 'Capture',
  note: 'Note technique', demo: 'Démonstration', other: 'Autre',
};

async function patchDay(day: number, patch: Partial<DayProgress>) {
  const res = await fetch('/api/progress', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'day', payload: { day, patch } }),
  });
  if (!res.ok) throw new Error('save failed');
}

export default function DayEvidence({
  day, initial, skillId, skillName,
}: {
  day: number; initial: DayProgress['evidence']; skillId: string; skillName: string;
}) {
  const router = useRouter();
  const [list, setList] = useState(initial ?? []);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EvidenceType>('exercise');
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);

  async function persist(next: NonNullable<DayProgress['evidence']>) {
    setList(next); setBusy(true);
    try { await patchDay(day, { evidence: next }); window.dispatchEvent(new CustomEvent('progress-changed')); router.refresh(); }
    finally { setBusy(false); }
  }

  async function add() {
    if (!title.trim()) return;
    const d = addEvidence({ evidence: list }, { title, type, url, description: '', skills: skillId ? [skillId] : [], createdAt: new Date().toISOString() });
    setTitle(''); setUrl(''); setType('exercise'); setOpen(false);
    await persist(d.evidence ?? []);
  }

  async function remove(id: string) {
    const d = removeEvidence({ evidence: list }, id);
    await persist(d.evidence ?? []);
  }

  return (
    <section className="day-evid" aria-label="Preuves de compétence">
      <div className="evid-head">
        <p className="dpx-eyebrow">Preuves de compétence{skillName ? ` · ${skillName}` : ''}</p>
        {!open && <button className="btn small" onClick={() => setOpen(true)}><Plus size={14} strokeWidth={2} /> Ajouter une preuve</button>}
      </div>

      {list.length > 0 && (
        <ul className="evid-list">
          {list.map((e) => (
            <li className="evid-item" key={e.id}>
              <span className="evid-type">{TYPE_LABEL[e.type] ?? e.type}</span>
              <span className="evid-title">
                {e.url
                  ? <a href={e.url} target="_blank" rel="noopener noreferrer nofollow">{e.title} <ExternalLink size={12} /></a>
                  : e.title}
              </span>
              <button className="evid-del" onClick={() => remove(e.id)} disabled={busy} aria-label={`Supprimer la preuve ${e.title}`}><X size={14} strokeWidth={2} /></button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div className="evid-form">
          <div className="evid-row">
            <input aria-label="Titre de la preuve" placeholder="Titre (ex. Repo TaskFlow CLI)" value={title}
              onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') add(); }} autoFocus />
            <select aria-label="Type de preuve" value={type} onChange={(e) => setType(e.target.value as EvidenceType)}>
              {EVIDENCE_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t] ?? t}</option>)}
            </select>
          </div>
          <input aria-label="Lien (optionnel)" placeholder="Lien ou chemin (optionnel)" value={url}
            onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') add(); }} />
          <div className="evid-actions">
            <button className="btn primary small" type="button" onClick={add} disabled={busy || !title.trim()}>Enregistrer la preuve</button>
            <button className="btn ghost small" type="button" onClick={() => setOpen(false)} disabled={busy}>Annuler</button>
          </div>
        </div>
      )}
    </section>
  );
}
