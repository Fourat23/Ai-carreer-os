'use client';

// Preuves de compétence de la journée : ajout (titre/type/lien/description) et
// suppression. La compétence de la journée est associée par défaut. Les liens
// sont neutralisés (safeUrl) et rien n'est jamais exécuté.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, ExternalLink, AlertTriangle } from 'lucide-react';
import type { DayProgress } from '@/lib/types';
import { EVIDENCE_TYPES, type EvidenceType } from '@/lib/learning';
import { EvidenceMark } from '@/app/ui';
import { sendCommand, announceProgressChanged } from '@/app/progress-command';

const TYPE_LABEL: Record<string, string> = {
  exercise: 'Exercice', repo: 'Dépôt Git', project: 'Projet', screenshot: 'Capture',
  note: 'Note technique', demo: 'Démonstration', other: 'Autre',
};

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
  const [error, setError] = useState<string | null>(null);

  // V64 : les commandes sont CIBLÉES. Avant, le client renvoyait le tableau
  // complet des preuves — il pouvait donc effacer une preuve produite par le
  // laboratoire. Désormais il ne peut qu'ajouter, ou retirer une preuve nommée.
  async function add() {
    if (!title.trim()) return;
    setBusy(true); setError(null);
    const r = await sendCommand({
      type: 'ADD_EVIDENCE', day,
      evidence: { title, type, url, description: '', skills: skillId ? [skillId] : [] },
    });
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    setTitle(''); setUrl(''); setType('exercise'); setOpen(false);
    announceProgressChanged();
    router.refresh(); // la liste faisant foi revient du serveur
  }

  async function remove(id: string) {
    setBusy(true); setError(null);
    const r = await sendCommand({ type: 'REMOVE_EVIDENCE', day, evidenceId: id });
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    setList((prev) => prev.filter((e) => e.id !== id));
    announceProgressChanged();
    router.refresh();
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
              {/* MOTIF · EvidenceMark — le type de preuve devient reconnaissable
                  en balayage ; le libellé reste, la forme n'est jamais seule. */}
              <span className={`evid-type evi-${e.type}`}>
                <EvidenceMark type={e.type} size={13} />
                {TYPE_LABEL[e.type] ?? e.type}
              </span>
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

      {error && (
        <p className="cmd-error" role="alert"><AlertTriangle size={13} strokeWidth={2} /> {error}</p>
      )}
    </section>
  );
}
